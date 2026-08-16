// =============================================================================
// Sequence v1.1.0
// Last Updated: 2026-08-16
// Author: Kenan Millet
//
// Description:
//   General-purpose keyframe recording and playback engine for Roll20 objects.
//   Records changes to object attributes as timestamped delta keyframes, stores
//   them in handouts, and plays them back on any arbitrary object.
//
//   Recordings are stored in handouts named "[Sequence] <name>" and are fully
//   portable — copy a handout to another campaign to transfer a recording.
//
// Dependencies: ScriptKit (optional — enhances help/handout features)
//
// Commands:
//   !sequence record [name] [flags] [ignore-selected] [obj_id...]
//     Start recording on selected/listed objects.
//     Flags:
//       --attrs <a,b,...>   Only record the listed attributes (default: all)
//
//   !sequence stop [ignore-selected] [obj_id...]
//     Stop recording and save automatically if a name was given.
//
//   !sequence pause [ignore-selected] [obj_id...]
//   !sequence resume [ignore-selected] [obj_id...]
//     Pause/resume recording without discarding captured keyframes.
//
//   !sequence save <name> [--force] [ignore-selected] [obj_id...]
//     Save the active recording under <name>. Creates/updates a handout.
//
//   !sequence list
//     List all saved recordings (scans for [Sequence] handouts).
//
//   !sequence edit <name>
//     Open the handout editor for a recording (whispers a link).
//
//   !sequence delete <name> [--force]
//     Delete a recording (deletes the handout).
//
//   !sequence play <name> [flags] [ignore-selected] [obj_id...]
//     Play a recording on selected/listed objects.
//     Flags:
//       --loop              Loop indefinitely
//       --loops <n>         Loop n times
//       --speed <x>         Playback speed multiplier (default: 1.0)
//       --reverse           Play in reverse
//       --offset <ms>       Start at time offset
//       --only <a,b,...>    Only apply listed attributes
//       --exclude <a,b,...> Exclude listed attributes
//
//   !sequence stop-play [ignore-selected] [obj_id...]
//     Stop playback on selected/listed objects.
//
//   !sequence pause-play [ignore-selected] [obj_id...]
//   !sequence resume-play [ignore-selected] [obj_id...]
//     Pause/resume playback.
//
//   !sequence playback-menu [ignore-selected] [obj_id...]
//     Show the playback menu for selected/listed objects.
//
//   !sequence add-attribute <name> <attr>
//     Add an attribute column to a recording's handout.
//
//   !sequence remove-attribute <name> <attr>
//     Remove an attribute column from a recording's handout.
//
//   !sequence refresh <name>
//     Regenerate a recording's handout from the parsed in-memory cache.
//     Use if the handout has been accidentally corrupted.
//
//   !sequence --help
//     Show command reference.
// =============================================================================

/* global state, on, sendChat, getObj, createObj, findObjs, Campaign,
          playerIsGM, log, _, setInterval, clearInterval, Date */

var Sequence = Sequence || (() => {
    'use strict';

    const SCRIPT_NAME    = 'Sequence';
    const SCRIPT_VERSION = '1.1.0';
    const CMD_TOKEN      = '!sequence';
    const HANDOUT_TAG   = 'Sequence';
    const HANDOUT_PREFIX = '[Sequence] ';


    // =========================================================================
    // Example Registry
    // =========================================================================

    const EXT_EXAMPLES = {}; // { 'source/name': { name, description, source, recording, onGenerate } }

    const ATTR_GROUPS = []; // [ ['left','top'], ['width','height'], ... ]

    /**
     * Register an attribute group. When any member changes during recording,
     * all other members get identity deltas recorded at the same keyframe.
     *
     * @param {string}   sourceId  Script name
     * @param {string[]} attrs     Attribute names (may include namespaced: 'anchor.x')
     * @param {object}   [opts]    Options
     * @param {boolean}  [opts.join=false]  If true, merge into existing group(s)
     *                              containing any of these attrs instead of creating a new group.
     */
    const registerAttributeGroup = (sourceId, attrs, opts) => {
        if (!Array.isArray(attrs) || attrs.length < 2) return false;
        if (opts && opts.join) {
            // Find all existing groups that share any member with attrs
            const targets = ATTR_GROUPS.filter(g => attrs.some(a => g.includes(a)));
            if (targets.length > 0) {
                // Merge into the first matching group
                attrs.forEach(a => { if (!targets[0].includes(a)) targets[0].push(a); });
                // If multiple groups matched, merge them all into the first
                for (let i = 1; i < targets.length; i++) {
                    targets[i].forEach(a => { if (!targets[0].includes(a)) targets[0].push(a); });
                    ATTR_GROUPS.splice(ATTR_GROUPS.indexOf(targets[i]), 1);
                }
                return true;
            }
        }
        ATTR_GROUPS.push([...attrs]);
        return true;
    };

    /**
     * Register a pre-built example recording for display in the Sequence help handout.
     *
     * @param {string} sourceId  Script name registering this example.
     * @param {object} struct    Example struct:
     *
     * Required fields:
     * @param {string} struct.name       Display name for the example.
     * @param {object} struct.recording  Recording object containing keyframes to replay.
     *                                   A recording contains: objectType (string), notes (string),
     *                                   and a keyframes array where each keyframe has time, type,
     *                                   deltas (attr→value map), and easings (attr→curve map).
     *
     * Optional fields:
     * @param {string}     struct.description  Human-readable description.
     * @param {function}   struct.onGenerate   (handoutBody) => void — called when handout is generated.
     *
     * @returns {boolean} true on success, false if name/recording missing or duplicate.
     */
    const registerExample = (sourceId, struct) => {
        const src = sourceId || SCRIPT_NAME;
        const { name, description = '', recording } = struct;
        if (!name || !recording) {
            log(`${SCRIPT_NAME}: [${src}] registerExample — missing name or recording`);
            return false;
        }
        if (EXT_EXAMPLES[`${src}/${name}`]) return false;
        const attrCols = struct.attrCols || (() => {
            const cols = new Set();
            (recording.keyframes || []).forEach(kf => {
                Object.keys(kf.deltas || {}).forEach(a => cols.add(a));
                Object.keys(kf.easings || {}).forEach(a => { if (!a.includes(':')) cols.add(a); });
            });
            return [...cols];
        })();
        EXT_EXAMPLES[`${src}/${name}`] = { name, description, source: src, recording, attrCols, onGenerate: struct.onGenerate || null };
        return true;
    };

    // =========================================================================
    // Attribute Registry Infrastructure
    // =========================================================================

    // { '<namespace>/<name>': registrationObject }
    const ATTR_REGISTRY = {};
    // Quick lookup: { '<name>': registrationObject } — last-registered wins on collision
    const ATTR_BY_NAME  = {};

    /**
     * Register an attribute for recording/playback.
     *
     * @param {string}        sourceId  Script name registering this attribute.
     * @param {object}        reg       Registration struct:
     *
     * Required fields:
     * @param {string}        reg.name        Attribute name (used as column header in handout). Must be a valid JS identifier.
     * @param {string}        reg.namespace   Script/module namespace. 'core' for built-in attrs, otherwise your script name.
     * @param {string}        reg.objectType  Roll20 object type — 'graphic', 'text', etc.
     * @param {string}        reg.description Human-readable description.
     * @param {string}        reg.valueType   Type tag: 'number', 'scale', 'color', 'boolean', 'enum', 'string', or custom.
     * @param {function}      reg.get         (obj) => current value
     * @param {function}      reg.set         (obj, val) => void — for absolute (= prefix)
     * @param {function}      reg.diff        (prev, curr) => delta | null (null = no change)
     * @param {function}      reg.apply       (obj, delta) => void — for relative (+/- prefix)
     * @param {function}      reg.format      (delta) => string for handout display
     * @param {function}      reg.parse       (str) => { delta } | { abs } | { expr, mode } from handout string
     *
     * Optional fields:
     * @param {string[]}      reg.enumValues  For enum types: array of valid values (used in dropdowns).
     * @param {string[]}      reg.examples    Example cell values shown in docs.
     * @param {function|null} reg.lerp        (a, b, t) => interpolated value. null = step-only (no interpolation).
     * @param {function|null} reg.identity    (obj) => delta representing "no change". Defaults to (obj) => ({ abs: reg.get(obj) }).
     *                                        Used in attribute groups and recording snapshots.
     * @param {function|null} reg.startWatch  (obj, notify) => void — called when recording starts on obj.
     *                                        Subscribe to changes and call notify(currVal) on change.
     *                                        null for core attributes (covered by change:graphic:<attr> events).
     * @param {function|null} reg.stopWatch   (obj) => void — called when recording stops. Clean up subscriptions.
     *                                        null for core attributes.
     */
    // Validate an identifier segment — no dots, must be valid JS identifier
    const validIdent = (s) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(s);

    // Validate a namespace string — each dot-separated segment must be a valid identifier
    const validNamespace = (ns) => ns === 'core' || ns.split('.').every(validIdent);

    // Get the qualified name for an attribute:
    // core attributes use bare name, others use namespace.name
    const qualifiedAttrName = (reg) =>
        reg.namespace === 'core' ? reg.name : `${reg.namespace}.${reg.name}`;

    const registerAttribute = (sourceId, reg) => {
        const src = sourceId || SCRIPT_NAME;

        // Validate name and namespace
        if (!validIdent(reg.name)) {
            log(`${SCRIPT_NAME}: [${src}] registerAttribute — invalid name "${reg.name}" (must be a valid identifier with no dots)`);
            return false;
        }
        if (!validNamespace(reg.namespace || 'core')) {
            log(`${SCRIPT_NAME}: [${src}] registerAttribute — invalid namespace "${reg.namespace}"`);
            return false;
        }

        if (!reg.namespace) {
            log(`${SCRIPT_NAME}: [${src}] registerAttribute — missing namespace for "${reg.name}"`);
            return false;
        }
        if (!reg.description) {
            log(`${SCRIPT_NAME}: [${src}] registerAttribute — missing description for "${reg.name}"`);
            return false;
        }
        if (!reg.valueType) {
            log(`${SCRIPT_NAME}: [${src}] registerAttribute — missing valueType for "${reg.name}"`);
            return false;
        }
        reg.objectType  = reg.objectType  || 'graphic';
        reg.enumValues  = reg.enumValues  || null;
        reg.examples    = reg.examples    || [];
        // watchProp: Roll20 property to watch for change events.
        // Core attributes watch their own property; external attributes are virtual
        // and must call Sequence.notifyChange() explicitly — no auto-watch.
        reg.watchProp = reg.namespace === 'core' ? reg.name : null;

        const key      = `${reg.namespace}/${reg.name}`;
        const lookupKey = qualifiedAttrName(reg);

        if (ATTR_REGISTRY[key]) {
            const existing = ATTR_REGISTRY[key].source || SCRIPT_NAME;
            if (existing !== src)
                log(`${SCRIPT_NAME}: [${src}] registerAttribute — "${lookupKey}" is already registered by [${existing}]`);
            return false;
        }

        reg.source = src;
        if (!reg.identity) reg.identity = (obj) => ({ abs: reg.get(obj) });
        ATTR_REGISTRY[key] = reg;

        // Core attributes use bare name lookup; external use qualified name
        if (reg.namespace === 'core') {
            ATTR_BY_NAME[reg.name] = reg;
        } else {
            ATTR_BY_NAME[lookupKey] = reg;
        }
        return true;
    };

    // Look up an attribute registration by name.
    // Accepts bare names (core) or dotted qualified names (external).
    const getAttrReg = (name) => {
        if (ATTR_BY_NAME[name]) return ATTR_BY_NAME[name];
        // Try parsing as namespace.name — last segment is name, rest is namespace
        const parts = name.split('.');
        if (parts.length > 1) {
            const attrName = parts[parts.length - 1];
            const ns       = parts.slice(0, -1).join('.');
            return ATTR_REGISTRY[`${ns}/${attrName}`] || null;
        }
        return null;
    };

    const getAllAttrNames = (objectType = 'graphic') =>
        Object.values(ATTR_REGISTRY)
            .filter(r => r.objectType === objectType)
            .map(r => qualifiedAttrName(r));

    const getInterpolatable = (objectType = 'graphic') =>
        Object.values(ATTR_REGISTRY)
            .filter(r => r.objectType === objectType && r.lerp !== null)
            .map(r => qualifiedAttrName(r));

    // =========================================================================
    // Core Attribute Registration Helpers
    // =========================================================================

    // Round to at most N decimal places, trimming trailing zeros
    const roundVal = (v, places = 4) => {
        const factor = Math.pow(10, places);
        return Math.round(v * factor) / factor;
    };

    const registerScale = (name, objectType = 'graphic', description = '', examples = []) => registerAttribute(SCRIPT_NAME, {
        name, namespace: 'core', objectType,
        description: description || `Token ${name} (multiplicative — ×2 doubles, ×0.5 halves).`,
        valueType:   'scale',
        examples:    examples.length ? examples : [
            `×2          double ${name}`,
            `×0.5        halve ${name}`,
            `×rand(0.8,1.2)  random resize`,
        ],
        startWatch: null,
        stopWatch:  null,
        get:    (obj) => obj.get(name),
        set:    (obj, val) => obj.set(name, val),
        diff:   (prev, curr) => {
            if (!prev || prev === 0 || curr === prev) return null;
            const ratio = roundVal(curr / prev);
            return ratio === 1 ? null : ratio;
        },
        apply:  (obj, ratio) => {
            const cur = obj.get(name);
            if (cur !== undefined && cur !== null) obj.set(name, roundVal(cur * ratio));
        },
        lerp:     (a, b, t) => a + (b - a) * t,
        identity: () => ({ delta: 1 }),
        format: (ratio) => `×${ratio}`,
        parse:  (str) => {
            const s = String(str).trim();
            if (s.startsWith('=')) {
                const inner = s.slice(1).trim();
                if (/[A-Za-z(]/.test(inner)) return { expr: inner, mode: 'abs' };
                return { abs: parseFloat(inner) };
            }
            if ((s.startsWith('×') || s.startsWith('*')) && /[A-Za-z(]/.test(s))
                return { expr: s.slice(1).trim(), mode: 'mul' };
            if (s.startsWith('×') || s.startsWith('*')) return { delta: parseFloat(s.slice(1)) };
            if (s.startsWith('x') && /^x[\d.]/.test(s))  return { delta: parseFloat(s.slice(1)) };
            return { delta: parseFloat(s) };
        },
    });

    const registerNumeric = (name, objectType = 'graphic', description = '', examples = []) => registerAttribute(SCRIPT_NAME, {
        name, namespace: 'core', objectType,
        description: description || `Token ${name} (additive numeric).`,
        valueType:   'number',
        examples:    examples.length ? examples : [
            `+70         increase ${name} by 70`,
            `-70         decrease ${name} by 70`,
            `=500        set ${name} to 500 (absolute)`,
            `+rand(-70,70)  random delta`,
        ],
        startWatch: null,
        stopWatch:  null,
        get:    (obj) => obj.get(name),
        set:    (obj, val) => obj.set(name, val),
        diff:   (prev, curr) => {
            if (curr === prev || curr === null || curr === undefined) return null;
            const d = roundVal(curr - prev);
            return d === 0 ? null : d;
        },
        apply:  (obj, delta) => obj.set(name, roundVal((obj.get(name) || 0) + delta)),
        lerp:     (a, b, t) => a + (b - a) * t,
        identity: () => ({ delta: 0 }),
        format: (d) => d >= 0 ? `+${d}` : `${d}`,
        parse:  (str) => {
            const s = String(str).trim();
            if (s.startsWith('=')) {
                const inner = s.slice(1).trim();
                if (/[A-Za-z(]/.test(inner)) return { expr: inner, mode: 'abs' };
                return { abs: parseFloat(inner) };
            }
            if (/^[+\-]/.test(s) && /[A-Za-z(]/.test(s)) {
                const sign = s[0] === '-' ? -1 : 1;
                return { expr: s.slice(1).trim(), mode: 'add', sign };
            }
            return { delta: parseFloat(s) };
        },
    });

    const registerBoolean = (name, objectType = 'graphic', description = '', examples = []) => registerAttribute(SCRIPT_NAME, {
        name, namespace: 'core', objectType,
        description: description || `Token ${name} (boolean — true/false).`,
        valueType:   'boolean',
        examples:    examples.length ? examples : [
            `=true       enable ${name}`,
            `=false      disable ${name}`,
        ],
        startWatch: null,
        stopWatch:  null,
        get:    (obj) => obj.get(name),
        set:    (obj, val) => obj.set(name, val),
        diff:   (prev, curr) => curr === prev ? null : curr,
        apply:  (obj, val) => obj.set(name, val),
        lerp:   null,
        format: (val) => `=${val}`,
        parse:  (str) => {
            const s = String(str).trim();
            const v = s.startsWith('=') ? s.slice(1) : s;
            return { abs: v === 'true' || v === '1' };
        },
    });

    // ── String lerp via Levenshtein edit steps ─────────────────────────────
    const levenshteinOps = (a, b) => {
        const m = a.length, n = b.length;
        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
        // Backtrack to get ordered operations
        const ops = [];
        let i = m, j = n;
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { i--; j--; }
            else if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] + 1)) {
                ops.push({ type: 'ins', pos: i, ch: b[j - 1] }); j--;
            } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
                ops.push({ type: 'sub', pos: i - 1, ch: b[j - 1] }); i--; j--;
            } else if (i > 0) {
                ops.push({ type: 'del', pos: i - 1 }); i--;
            } else { break; }
        }
        ops.reverse();
        return ops;
    };

    const applyOps = (str, ops, count) => {
        let chars = str.split('');
        let offset = 0;
        for (let i = 0; i < count && i < ops.length; i++) {
            const op = ops[i];
            const pos = op.pos + offset;
            if (op.type === 'sub') { chars[pos] = op.ch; }
            else if (op.type === 'ins') { chars.splice(pos, 0, op.ch); offset++; }
            else if (op.type === 'del') { chars.splice(pos, 1); offset--; }
        }
        return chars.join('');
    };

    const lerpString = (a, b, t) => {
        if (a === b || t <= 0) return a;
        if (t >= 1) return b;
        const sa = String(a || ''), sb = String(b || '');
        // Fast path: pure append (b starts with a)
        if (sb.startsWith(sa)) {
            const suffix = sb.slice(sa.length);
            const chars = Math.round(t * suffix.length);
            return sa + suffix.slice(0, chars);
        }
        // Fast path: pure truncate (a starts with b)
        if (sa.startsWith(sb)) {
            const excess = sa.length - sb.length;
            const removed = Math.round(t * excess);
            return sa.slice(0, sa.length - removed);
        }
        // General case: levenshtein
        const ops = levenshteinOps(sa, sb);
        if (ops.length === 0) return sb;
        const step = Math.round(t * ops.length);
        return applyOps(sa, ops, step);
    };

    const registerEnum = (name, objectType = 'graphic', description = '', enumValues = [], examples = []) => registerAttribute(SCRIPT_NAME, {
        name, namespace: 'core', objectType,
        description: description || `Token ${name} (enumerated value).`,
        valueType:   'enum',
        enumValues:  enumValues.length ? enumValues : null,
        examples:    examples.length ? examples : (enumValues.length ?
            enumValues.slice(0, 3).map(v => `=${v}`) : [`=value`]),
        startWatch: null,
        stopWatch:  null,
        get:    (obj) => obj.get(name),
        set:    (obj, val) => obj.set(name, val),
        diff:   (prev, curr) => {
            if (curr === prev || curr === null || curr === undefined) return null;
            return String(curr);
        },
        apply:  (obj, val) => obj.set(name, val),
        lerp:   null,
        format: (val) => `=${val}`,
        parse:  (str) => {
            const s = String(str).trim();
            return { abs: s.startsWith('=') ? s.slice(1) : s };
        },
    });

    const registerString = (name, objectType = 'graphic', description = '', examples = []) => registerAttribute(SCRIPT_NAME, {
        name, namespace: 'core', objectType,
        description: description || `Token ${name} (free-text string, lerps via edit distance).`,
        valueType:   'string',
        examples:    examples.length ? examples : [`=hello  set ${name} to "hello"`],
        startWatch: null,
        stopWatch:  null,
        get:    (obj) => obj.get(name),
        set:    (obj, val) => obj.set(name, val),
        diff:   (prev, curr) => {
            if (curr === prev || curr === null || curr === undefined) return null;
            return String(curr);
        },
        apply:  (obj, val) => obj.set(name, (obj.get(name) || '') + val),
        lerp:   lerpString,
        identity: () => ({ delta: '' }),
        format: (val) => val === '' ? '=""' : `+${val}`,
        parse:  (str) => {
            const s = String(str).trim();
            if (s.startsWith('=')) {
                const inner = s.slice(1).trim();
                // Quoted string literal — strip quotes
                if (/^"[^"]*"$/.test(inner) || /^'[^']*'$/.test(inner)) return { abs: inner.slice(1, -1) };
                // Expression (contains identifiers or function calls)
                if (/[A-Za-z(]/.test(inner)) return { expr: inner, mode: 'abs' };
                return { abs: inner };
            }
            if (s.startsWith('+')) return { delta: s.slice(1) };
            return { abs: s };
        },
    });

    // Color lerp in RGB space
    const hexToRgb = (hex) => {
        const h = hex.replace(/^#/, '');
        const n = parseInt(h, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const rgbToHex = ([r, g, b]) =>
        '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v)))
            .toString(16).padStart(2, '0')).join('');
    const lerpColor = (a, b, t) => {
        if (!a || !b) return b || a;
        const toStr = (v) => (v && typeof v === 'object' && v.toHex) ? v.toHex() : String(v);
        const aStr = toStr(a);
        const bStr = toStr(b);
        if (aStr === 'transparent' || bStr === 'transparent') return t < 0.5 ? aStr : bStr;
        const [ar, ag, ab2] = hexToRgb(aStr);
        const [br, bg, bb]  = hexToRgb(bStr);
        return rgbToHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab2 + (bb - ab2) * t]);
    };

    const registerColor = (name, objectType = 'graphic', description = '', examples = []) => registerAttribute(SCRIPT_NAME, {
        name, namespace: 'core', objectType,
        description: description || `Token ${name} (RGB hex color, lerps smoothly).`,
        valueType:   'color',
        examples:    examples.length ? examples : [
            `=#ff0000    set ${name} to red`,
            `=#000000    set ${name} to black`,
            `=transparent  clear ${name}`,
        ],
        startWatch: null,
        stopWatch:  null,
        get:    (obj) => obj.get(name),
        set:    (obj, val) => obj.set(name, val),
        diff:   (prev, curr) => {
            if (curr === prev || curr === null || curr === undefined) return null;
            return String(curr);
        },
        apply:  (obj, val) => obj.set(name, val),
        lerp:     (a, b, t) => lerpColor(a, b, t),
        identity: (obj) => ({ abs: obj.get(name) }),
        format: (val) => `=${val}`,
        parse:  (str) => {
            const s = String(str).trim();
            if (s.startsWith('=')) {
                const inner = s.slice(1).trim();
                if (/[A-Za-z(]/.test(inner) && !(/^#[0-9a-fA-F]{3,8}$/.test(inner))) return { expr: inner, mode: 'abs' };
                return { abs: inner };
            }
            return { abs: s };
        },
    });

    // =========================================================================
    // Core Attribute Registrations
    // =========================================================================

    // Scale (multiplicative ratio delta)
    registerScale('width',  'graphic', 'Token width in pixels.');
    registerScale('height', 'graphic', 'Token height in pixels.');

    // Numeric — position
    registerNumeric('left', 'graphic', 'Horizontal position of token center in pixels (right = positive).',
        ['+70  move right 70px', '-70  move left 70px', '+rand(-140,140)  random horizontal wander']);
    registerNumeric('top',  'graphic', 'Vertical position of token center in pixels (down = positive).',
        ['+70  move down 70px',  '-70  move up 70px',   '+rand(-140,140)  random vertical wander']);

    // Numeric — bars
    ['bar1_value','bar2_value','bar3_value'].forEach(n => registerNumeric(n, 'graphic', `Value for ${n.replace('_value','')}.`));
    ['bar1_max','bar2_max','bar3_max'].forEach(n => registerNumeric(n, 'graphic', `Max value for ${n.replace('_max','')}.`));

    // Numeric — auras and lighting
    registerNumeric('aura1_radius', 'graphic', 'Radius of aura 1 in pixels.');
    registerNumeric('aura2_radius', 'graphic', 'Radius of aura 2 in pixels.');
    registerNumeric('light_radius',    'graphic', 'Legacy bright light emission radius.');
    registerNumeric('light_dimradius', 'graphic', 'Legacy dim light emission radius.');
    registerNumeric('light_angle',     'graphic', 'Angle of emitted light cone in degrees.');
    registerNumeric('light_losangle',  'graphic', 'Angle of token line-of-sight cone in degrees.');
    registerNumeric('adv_fow_view_distance', 'graphic', 'Advanced fog of war view distance.');
    registerNumeric('bright_light_distance', 'graphic', 'UDL bright light distance (ft).');
    registerNumeric('low_light_distance',    'graphic', 'UDL dim/low light distance (ft).');
    registerNumeric('night_vision_distance',  'graphic', 'UDL night vision distance (ft).');
    registerNumeric('dim_light_opacity',      'graphic', 'UDL dim light opacity (0.0–1.0).');

    // Rotation — special shortest-path delta logic
    registerAttribute(SCRIPT_NAME, {
        name: 'rotation', namespace: 'core', objectType: 'graphic',
        description: 'Token rotation in degrees. Uses shortest-path interpolation — always takes the shorter arc.',
        valueType:   'number',
        examples:    ['+90  rotate 90\u00b0 clockwise', '-90  rotate 90\u00b0 counter-clockwise', '+rand(-45,45)  random wobble', '+360  full spin'],
        startWatch: null,
        stopWatch:  null,
        get:    (obj) => obj.get('rotation'),
        set:    (obj, val) => obj.set('rotation', ((val % 360) + 360) % 360),
        diff:   (prev, curr) => {
            const d = roundVal(((curr - prev) % 360 + 360) % 360);
            if (d === 0) return null;
            return d > 180 ? d - 360 : d;
        },
        apply:  (obj, delta) => {
            const cur = obj.get('rotation') || 0;
            obj.set('rotation', ((cur + delta) % 360 + 360) % 360);
        },
        lerp:     (a, b, t) => {
            // Shortest-path lerp
            let diff = ((b - a) % 360 + 360) % 360;
            if (diff > 180) diff -= 360;
            return ((a + diff * t) % 360 + 360) % 360;
        },
        identity: () => ({ delta: 0 }),
        format: (d) => d >= 0 ? `+${d}` : `${d}`,
        parse:  (str) => {
            const s = String(str).trim();
            if (s.startsWith('=')) return { abs: parseFloat(s.slice(1)) };
            return { delta: parseFloat(s) };
        },
    });

    // Boolean — visibility, flips, lighting flags
    registerBoolean('flipv',  'graphic', 'Flip token vertically.');
    registerBoolean('fliph',  'graphic', 'Flip token horizontally.');
    registerBoolean('showname',           'graphic', 'Show token nameplate to all.');
    registerBoolean('showplayers_name',   'graphic', 'Show token name to players.');
    registerBoolean('playersedit_name',   'graphic', 'Allow players to edit token name.');
    registerBoolean('showplayers_bar1',   'graphic', 'Show bar 1 to players.');
    registerBoolean('playersedit_bar1',   'graphic', 'Allow players to edit bar 1.');
    registerBoolean('showplayers_bar2',   'graphic', 'Show bar 2 to players.');
    registerBoolean('playersedit_bar2',   'graphic', 'Allow players to edit bar 2.');
    registerBoolean('showplayers_bar3',   'graphic', 'Show bar 3 to players.');
    registerBoolean('playersedit_bar3',   'graphic', 'Allow players to edit bar 3.');
    registerBoolean('showplayers_aura1',  'graphic', 'Show aura 1 to players.');
    registerBoolean('playersedit_aura1',  'graphic', 'Allow players to edit aura 1.');
    registerBoolean('showplayers_aura2',  'graphic', 'Show aura 2 to players.');
    registerBoolean('playersedit_aura2',  'graphic', 'Allow players to edit aura 2.');
    registerBoolean('light_hassight',     'graphic', 'Token has line-of-sight.');
    registerBoolean('light_otherplayers', 'graphic', 'Token emits light visible to other players.');
    registerBoolean('light_followtoken',  'graphic', 'Dynamic lighting follows this token.');
    registerBoolean('isdrawing',          'graphic', 'Treat token as a drawing (not selectable by players).');
    registerBoolean('aura1_square',       'graphic', 'Display aura 1 as a square instead of circle.');
    registerBoolean('aura2_square',       'graphic', 'Display aura 2 as a square instead of circle.');

    // Color
    registerColor('tint_color',  'graphic', 'Tint color overlay on the token image.');
    registerColor('aura1_color', 'graphic', 'Color of aura 1.');
    registerColor('aura2_color', 'graphic', 'Color of aura 2.');
    registerColor('light_color', 'graphic', 'Color of emitted light.');

    // Enum / String
    registerEnum('layer',       'graphic', 'Map layer the token is on.',
        ['objects','map','gm','walls'], ['=objects', '=map', '=gm', '=walls']);
    registerString('name',        'graphic', 'Token display name.');
    registerString('gmnotes',     'graphic', 'GM-only notes on the token.');
    registerString('tooltip',     'graphic', 'Tooltip text shown on hover.');
    registerEnum('bar1_link',   'graphic', 'Character attribute linked to bar 1.');
    registerEnum('bar2_link',   'graphic', 'Character attribute linked to bar 2.');
    registerEnum('bar3_link',   'graphic', 'Character attribute linked to bar 3.');
    registerEnum('represents',  'graphic', 'Character ID this token represents.');
    registerEnum('controlledby','graphic', 'Comma-separated player IDs who control this token.');
    registerEnum('sides',       'graphic', 'Number of sides for a multi-sided token.');
    registerEnum('currentSide', 'graphic', 'Current visible side index for a multi-sided token.');

    // imgsrc — special: must be a valid thumb URL from user's Roll20 library
    registerAttribute(SCRIPT_NAME, {
        name: 'imgsrc', namespace: 'core', objectType: 'graphic',
        description: "Token image URL. Must be a thumb URL from the user's own Roll20 library.",
        valueType:   'string',
        examples:    ['=https://s3.amazonaws.com/files.d20.io/images/.../thumb.png?...'],
        startWatch: null,
        stopWatch:  null,
        get:    (obj) => obj.get('imgsrc'),
        set:    (obj, val) => obj.set('imgsrc', val),
        diff:   (prev, curr) => curr === prev ? null : String(curr),
        apply:  (obj, val) => obj.set('imgsrc', val),
        lerp:   null,
        format: (val) => `=${val}`,
        parse:  (str) => {
            const s = String(str).trim();
            return { abs: s.startsWith('=') ? s.slice(1) : s };
        },
    });

    // ── Attribute groups (siblings recorded together for correct interpolation)
    registerAttributeGroup(SCRIPT_NAME, ['left', 'top']);
    registerAttributeGroup(SCRIPT_NAME, ['width', 'height']);
    registerAttributeGroup(SCRIPT_NAME, ['light_radius', 'light_dimradius']);
    registerAttributeGroup(SCRIPT_NAME, ['bright_light_distance', 'low_light_distance']);

    // =========================================================================
    // Easing Functions
    // =========================================================================

    const EASING = {};
    // EASING_NAMES is a getter so it always reflects newly registered easings
    const EASING_NAMES = () => Object.keys(EASING);
    // Easing registry — stores metadata for registered easings
    const EASING_REGISTRY = {};

    /**
     * Register a custom easing function.
     * Easing names may contain hyphens since they are handout cell values, not JS identifiers.
     *
     * @param {string} sourceId  Script name registering this easing.
     * @param {object} struct    Registration struct:
     *
     * Required fields:
     * @param {string}   struct.name         Identifier (letters, digits, underscores, hyphens; no dots).
     * @param {function} struct.fn           (t, ...args) => value, where t is 0–1.
     * @param {string}   struct.description  One-line description.
     *
     * Optional fields:
     * @param {Array}    struct.args         Array of arg objects, each with fields:
     *                                       { name: string, type: string, description: string,
     *                                         optional?: boolean, default?: any, promptDefault?: any }
     * @param {string[]} struct.examples     Example usage strings.
     * @param {string}   struct.label        Display label override.
     *
     * @returns {boolean} true on success, false on validation failure or duplicate.
     */
    const registerEasing = (sourceId, struct) => {
        const src = sourceId || SCRIPT_NAME;
        const { name, fn, description = '', examples = [], args = [], label = null } = struct;

        if (!name || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(name)) {
            log(`${SCRIPT_NAME}: [${src}] registerEasing — invalid name "${name}"`);
            return false;
        }
        if (EASING_REGISTRY[name]) {
            const existing = EASING_REGISTRY[name].source || SCRIPT_NAME;
            if (existing !== src)
                log(`${SCRIPT_NAME}: [${src}] registerEasing — "${name}" is already registered by [${existing}]`);
            return false;
        }
        if (typeof fn !== 'function') {
            log(`${SCRIPT_NAME}: [${src}] registerEasing — "${name}" missing fn`);
            return false;
        }

        // Warn if promptDefault args appear after non-promptDefault args that
        // also lack a default value — the prompt pre-fill would be silently skipped
        if (args.length > 0) {
            const firstNonPrompt = args.findIndex(a => a.promptDefault === undefined);
            if (firstNonPrompt !== -1) {
                const hasPromptAfter = args.slice(firstNonPrompt).some(a => a.promptDefault !== undefined);
                if (hasPromptAfter) {
                    log(`${SCRIPT_NAME}: [${src}] registerEasing — "${name}" has promptDefault args after non-promptDefault args; prompt pre-fill will be disabled`);
                }
                const nonPromptWithoutDefault = args.slice(firstNonPrompt).filter(a => a.promptDefault === undefined && a.default === undefined);
                if (nonPromptWithoutDefault.length > 0 && args.some(a => a.promptDefault !== undefined)) {
                    log(`${SCRIPT_NAME}: [${src}] registerEasing — "${name}" has promptDefault args but trailing args [${nonPromptWithoutDefault.map(a => a.name).join(', ')}] have no default; prompt pre-fill will be disabled`);
                }
            }
        }

        EASING[name] = fn;
        EASING_REGISTRY[name] = { name, namespace: 'core', source: src, description, args, examples, label, fn };
        return true;
    };

    // ── Register built-in easing curves (bare names, naturally accelerating) ───
    // Core curves clamp output to [0,1]. External curves may overshoot/undershoot.
    (() => {
        const clamp01 = (fn) => (x) => Math.max(0, Math.min(1, fn(x)));
        const p = (x, n) => Math.pow(x, n);
        registerEasing(SCRIPT_NAME, { name: 'linear',  fn: clamp01((x) => x),              description: 'Constant rate — no easing.' });
        registerEasing(SCRIPT_NAME, { name: 'step',    fn:         (x) => x < 1 ? 0 : 1,   description: 'Instant jump at the end of the segment. Only core curve with intentional discontinuity.' });
        registerEasing(SCRIPT_NAME, { name: 'sine',    fn: clamp01((x) => 1 - Math.cos((x * Math.PI) / 2)), description: 'Sinusoidal acceleration. Use ~sine for ease-out.' });
        registerEasing(SCRIPT_NAME, { name: 'quad',    fn: clamp01((x) => p(x, 2)),         description: 'Quadratic acceleration (x²). Use ~quad for ease-out.' });
        registerEasing(SCRIPT_NAME, { name: 'cubic',   fn: clamp01((x) => p(x, 3)),         description: 'Cubic acceleration (x³). Use ~cubic for ease-out.' });
        registerEasing(SCRIPT_NAME, { name: 'quart',   fn: clamp01((x) => p(x, 4)),         description: 'Quartic acceleration (x⁴). Use ~quart for ease-out.' });
        registerEasing(SCRIPT_NAME, { name: 'quint',   fn: clamp01((x) => p(x, 5)),         description: 'Quintic acceleration (x⁵). Use ~quint for ease-out.' });
        registerEasing(SCRIPT_NAME, { name: 'expo',    fn: clamp01((x) => x === 0 ? 0 : Math.pow(2, 10 * x - 10)), description: 'Exponential acceleration. Use ~expo for ease-out.' });
        registerEasing(SCRIPT_NAME, { name: 'circle',  fn: clamp01((x) => 1 - Math.sqrt(1 - p(x, 2))),             description: 'Circular acceleration. Use ~circle for ease-out.' });

        // ── Parametric built-ins ──────────────────────────────────────────────
        registerEasing(SCRIPT_NAME, {
            name: 'power',
            fn: clamp01((t, n = 2) => Math.pow(t, n)),
            description: 'Generalized power curve. power(2) = quad, power(3) = cubic, etc.',
            args: [{ name: 'n', type: 'number', description: 'Exponent', default: 2, promptDefault: 2 }],
            examples: ['power(2)', 'power(5)', '~power(3)', '~power(0.5)'],
        });

        // Cubic bezier — matches CSS cubic-bezier(x1,y1,x2,y2)
        registerEasing(SCRIPT_NAME, {
            name: 'bezier',
            fn: (t, x1 = 0.25, y1 = 0.1, x2 = 0.25, y2 = 1.0) => {
                // Solve for t parameter via Newton's method, then evaluate y
                const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
                const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
                const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
                const sampleY = (t) => ((ay * t + by) * t + cy) * t;
                const sampleDerivX = (t) => (3 * ax * t + 2 * bx) * t + cx;
                // Newton's method to find parameter u where sampleX(u) = t
                let u = t;
                for (let i = 0; i < 8; i++) {
                    const err = sampleX(u) - t;
                    if (Math.abs(err) < 1e-7) break;
                    const d = sampleDerivX(u);
                    if (Math.abs(d) < 1e-6) break;
                    u -= err / d;
                }
                return sampleY(Math.max(0, Math.min(1, u)));
            },
            description: 'CSS cubic-bezier curve. bezier(x1,y1,x2,y2) matches CSS cubic-bezier().',
            args: [
                { name: 'x1', type: 'number', description: 'Control point 1 x (0-1)', default: 0.25, promptDefault: 0.25 },
                { name: 'y1', type: 'number', description: 'Control point 1 y',        default: 0.1,  promptDefault: 0.1  },
                { name: 'x2', type: 'number', description: 'Control point 2 x (0-1)', default: 0.25, promptDefault: 0.25 },
                { name: 'y2', type: 'number', description: 'Control point 2 y',        default: 1.0,  promptDefault: 1.0  },
            ],
            examples: [
                'bezier(0.25,0.1,0.25,1)   — CSS ease',
                'bezier(0.42,0,1,1)         — CSS ease-in',
                'bezier(0,0,0.58,1)         — CSS ease-out',
                'bezier(0.42,0,0.58,1)      — CSS ease-in-out',
            ],
        });
    })();

    // Wrap any easing fn to guarantee f(0)=0 and f(1)=1 — endpoints always hit exactly
    const pin01 = (fn) => (t) => t === 0 ? 0 : t === 1 ? 1 : fn(t);

    /**
     * Parse an easing expression: bare name or ~name (reversed).
     *
     *   name  — bare curve
     *   ~name — reversed curve: 1 - f(1-t), ease-out transform
     *
     * Returns a function (t: 0-1) => value, or EASING['linear'] if invalid/empty.
     */
    // Parse an easing cell value: name, ~name, name(args), ~name(args)
    // Returns { name, reversed, args } or null if unparseable
    const parseEasingToken = (s) => {
        s = s.trim();
        const reversed = s.startsWith('~');
        const rest     = reversed ? s.slice(1).trim() : s;
        const parenIdx = rest.indexOf('(');
        if (parenIdx === -1) {
            // bare name
            return { name: rest, reversed, args: [] };
        }
        const name    = rest.slice(0, parenIdx).trim();
        const argStr  = rest.slice(parenIdx + 1);
        if (!argStr.endsWith(')')) return null;
        const inner   = argStr.slice(0, -1).trim();
        const args    = inner === '' ? [] : inner.split(',').map(a => {
            const v = parseFloat(a.trim());
            return isNaN(v) ? null : v;
        });
        if (args.some(a => a === null)) return null;
        return { name, reversed, args };
    };

    const parseEasingExpr = (expr) => {
        if (!expr || !expr.trim()) return EASING['linear'];
        const token = parseEasingToken(expr.trim());
        if (!token) return EASING['linear'];
        const fn = EASING[token.name];
        if (!fn) return EASING['linear'];
        // Incomplete parametric (no args yet) — fall back to linear
        const reg = EASING_REGISTRY[token.name];
        if (reg && reg.args && reg.args.length > 0 && token.args.length === 0) return EASING['linear'];
        const base = token.args.length > 0
            ? (t) => fn(t, ...token.args)
            : fn;
        const withReverse = token.reversed ? (t) => 1 - base(1 - t) : base;
        return pin01(withReverse);
    };

    const validateEasingExpr = (expr) => {
        if (!expr || !expr.trim()) return null;
        if (expr.trim() === 'continuous') return null; // special keyword — not a curve
        const token = parseEasingToken(expr.trim());
        if (!token) return `Could not parse easing expression: "${expr}"`;
        if (!EASING[token.name]) return `Unknown easing curve: "${token.name}"`;
        const reg = EASING_REGISTRY[token.name];
        if (reg && reg.args && reg.args.length > 0) {
            if (token.args.length === 0) return null; // incomplete but valid — shown as name([...])
            const required = reg.args.filter(a => !a.optional && a.default === undefined).length;
            if (token.args.length < required) {
                return `${token.name} expects at least ${required} argument(s), got ${token.args.length}`;
            }
        }
        return null;
    };

    const isIncompleteParametric = (expr) => {
        if (!expr) return false;
        const token = parseEasingToken(expr.trim());
        if (!token) return false;
        const reg = EASING_REGISTRY[token.name];
        return !!(reg && reg.args && reg.args.length > 0 && token.args.length === 0);
    };

    const getEasing = (expr) => parseEasingExpr(expr) || EASING['linear'];

    // =========================================================================
    // State helpers
    // =========================================================================

    const s = () => state[SCRIPT_NAME];

    // In-memory cache of parsed recordings (populated on first play/edit access)
    // { '<handout-id>': { name, duration, objectType, keyframes: [...] } }
    const recordingCache = {};

    // In-memory active recording sessions
    // { '<obj-id>': sessionObject }
    const activeSessions = {};

    // In-memory active playback state
    // { '<obj-id>': playbackObject }
    const activePlayback = {};

    // In-memory interval IDs for playback
    // { '<obj-id>': intervalId }
    const playbackIntervals = {};

    // =========================================================================
    // Handout helpers
    // =========================================================================

    const HANDOUT_NAME = (name) => `${HANDOUT_PREFIX}${name}`;

    const findHandout = (name) => {
        const results = findObjs({ _type: 'handout', name: HANDOUT_NAME(name) });
        return results.length > 0 ? results[0] : undefined;
    };

    const findAllRecordingHandouts = () =>
        findObjs({ _type: 'handout' })
            .filter(h => h.get('name').startsWith(HANDOUT_PREFIX));

    const getOrCreateHandout = (name) => {
        const existing = findHandout(name);
        if (existing) return existing;
        return createObj('handout', {
            name:             HANDOUT_NAME(name),
            archived:         false,
        });
    };

    // Roll20 handout notes are async — use a callback pattern
    const getHandoutNotes = (handout, callback) => {
        handout.get('notes', (notes) => callback(notes || ''));
    };

    const setHandoutNotes = (handout, html, recName) => {
        if (recName) {
            handoutWriting.add(recName);
            setTimeout(() => handoutWriting.delete(recName), 500);
        }
        handout.set('notes', html);
    };

    // =========================================================================
    // Handout HTML generation
    // =========================================================================

    const STYLE = {
        table:  'border-collapse:collapse;width:100%;font-size:12px;',
        th:     'background:#222;color:#fff;padding:3px 6px;border:1px solid #555;white-space:nowrap;',
        td:     'padding:2px 5px;border:1px solid #ccc;',
        tdAlt:  'padding:2px 5px;border:1px solid #ccc;background:#f9f9f9;',
        meta:   'font-family:monospace;font-size:12px;margin-bottom:8px;',
        btn:    'display:inline-block;margin:2px;padding:2px 8px;background:#444;color:#fff;'
                + 'border-radius:3px;text-decoration:none;font-size:11px;',
        warn:   'color:#c00;font-size:11px;',
    };

    /**
     * Generate the full handout HTML for a recording.
     * @param {string} name         Recording name
     * @param {object} recording    Parsed recording object
     * @param {string[]} attrCols   Ordered list of attribute column names to show
     */
    // =========================================================================
    // Expression Evaluator
    // =========================================================================

    // Allowed identifiers in expressions — anything else is rejected at parse time
    // Function registry — keyed by namespace/name
    const FN_REGISTRY      = {}; // value expression functions
    const TIME_FN_REGISTRY = {}; // time expression functions

    // Value expression scope — full context (orig, prev, curr, obj, cumulative)
    const EXPR_SCOPE = {};
    // Time expression scope — only prev and cumulative meaningful
    const TIME_EXPR_SCOPE = {};

    // Top-level identifiers allowed in value expressions
    const EXPR_ALLOWED_VARS  = new Set(['orig', 'original', 'prev', 'previous', 'curr', 'current', 't']);
    const EXPR_ALLOWED_ROOTS = new Set([...EXPR_ALLOWED_VARS]);
    // Top-level identifiers allowed in time expressions (only prev)
    const TIME_ALLOWED_ROOTS = new Set(['prev', 'previous']);

    // =========================================================================
    // Color Class
    // =========================================================================

    class Color {
        constructor(r, g, b) {
            this.r = Math.round(Math.max(0, Math.min(255, r)));
            this.g = Math.round(Math.max(0, Math.min(255, g)));
            this.b = Math.round(Math.max(0, Math.min(255, b)));
        }

        toHex() {
            return '#' + [this.r, this.g, this.b]
                .map(v => v.toString(16).padStart(2, '0')).join('');
        }

        toHsl() {
            const r = this.r / 255, g = this.g / 255, b = this.b / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            const l = (max + min) / 2;
            if (max === min) return { h: 0, s: 0, l: l * 100 };
            const d = max - min;
            const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            let h;
            if      (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b - r) / d + 2) / 6;
            else                h = ((r - g) / d + 4) / 6;
            return { h: h * 360, s: s * 100, l: l * 100 };
        }

        // Roll20 stores colors as hex strings — toString enables automatic coercion
        toString() { return this._transparent ? 'transparent' : this.toHex(); }

        get isTransparent() { return this._transparent; }

        static fromHex(hex) {
            if (!hex || hex === 'transparent') return null;
            const h = hex.replace(/^#/, '');
            const n = parseInt(h.length === 3
                ? h.split('').map(c => c + c).join('') : h, 16);
            return new Color((n >> 16) & 255, (n >> 8) & 255, n & 255);
        }

        static fromHsl(h, s, l) {
            h = ((h % 360) + 360) % 360;
            s = Math.max(0, Math.min(100, s)) / 100;
            l = Math.max(0, Math.min(100, l)) / 100;
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs((h / 60) % 2 - 1));
            const m = l - c / 2;
            let r = 0, g = 0, b = 0;
            if      (h < 60)  { r = c; g = x; }
            else if (h < 120) { r = x; g = c; }
            else if (h < 180) { g = c; b = x; }
            else if (h < 240) { g = x; b = c; }
            else if (h < 300) { r = x; b = c; }
            else               { r = c; b = x; }
            return new Color((r + m) * 255, (g + m) * 255, (b + m) * 255);
        }
    }

    // Sentinel transparent color instance
    Color.transparent = Object.assign(new Color(0, 0, 0), { _transparent: true });

    // Coerce a value to Color — accepts Color instance, hex string, or null
    const toColor = (v) => {
        if (v instanceof Color) return v;
        if (v === 'transparent') return Color.transparent;
        if (typeof v === 'string') return Color.fromHex(v);
        return null;
    };

    /**
     * Validate an expression string. Returns null if valid, error string if not.
     * Strips known-safe tokens and rejects anything left over.
     */
    const validateExpr = (expr) => {
        // Replace numbers and operators with spaces so identifiers don't
        // concatenate — e.g. 'rand(orig-50,orig+50)' → 'rand orig  orig '
        let spaced = expr
            // Strip string literals (single or double quoted)
            .replace(/"[^"]*"|'[^']*'/g, ' ')
            // Full numeric literal pattern:
            // optional sign, then: int, float, .float, or scientific (1e5, 2.5e-3, .5e+10)
            .replace(/[+\-]?(\d+\.?\d*|\.\d+)([eE][+\-]?\d+)?/g, ' ')
            .replace(/[+\-*/%,()<>=?:\s]+/g, ' ')  // operators/punct → space
            .replace(/\.\s/g, ' ')                  // orphaned dots → space
            .trim();

        // Extract dotted identifier chains and validate root is known
        const identChainRe = /[A-Za-z_][A-Za-z0-9_.]*/g;
        const unknowns = [];
        let m;
        while ((m = identChainRe.exec(spaced)) !== null) {
            // Strip any trailing dot from the match
            const chain = m[0].replace(/\.$/, '');
            const root  = chain.split('.')[0];
            if (!EXPR_ALLOWED_ROOTS.has(root)) unknowns.push(chain);
        }
        return unknowns.length > 0
            ? `Unknown identifier(s): ${unknowns.join(', ')}`
            : null;
    };

    /**
     * Built-in expression functions available at eval time.
     */
    // EXPR_SCOPE — nested object tree used by evalExpr; populated by registerPlaybackFunction

    // Insert a function into the nested scope tree
    const insertIntoScope = (scope, namespace, name, fn) => {
        const parts = namespace === 'core' ? [] : namespace.split('.');
        let node = scope;
        parts.forEach(p => { node[p] = node[p] || {}; node = node[p]; });
        node[name] = fn;
    };

    const evalExpr = (expr, origVal, prevVal, currVal, context) => {
        // For color attributes, wrap string values as Color instances so
        // color functions can operate on them directly
        const _wrapVal = (v) => {
            if (v instanceof Color) return v;
            if (v === 'transparent') return Color.transparent;
            if (typeof v === 'string' && v.startsWith('#')) return Color.fromHex(v);
            return v;
        };
        const _orig = _wrapVal(origVal), _prev = _wrapVal(prevVal);

        // Lazy curr — fetched at most once, only if actually referenced.
        // Both the _curr variable and ctx.curr share the same fetcher state
        // so they always return the same value and we never fetch twice.
        let _currFetched = false;
        let _currCache;
        const _getCurr = () => {
            if (!_currFetched) {
                _currFetched = true;
                _currCache = (currVal !== undefined) ? currVal
                    : (context && context.obj && context.reg)
                        ? (context.reg.get(context.obj) || 0)
                        : prevVal;
            }
            return _currCache;
        };

        const _t = context && context.t !== undefined ? context.t : 0;

        const body = expr
            .replace(/\boriginal\b/g, '_orig')
            .replace(/\bprevious\b/g, '_prev')
            .replace(/\bcurrent\b/g,  '_getCurr()')
            .replace(/\borig\b/g,     '_orig')
            .replace(/\bprev\b/g,     '_prev')
            .replace(/\bcurr\b/g,     '_getCurr()')
            .replace(/\bt\b/g,        '_t');

        const _ctx = {
            obj:        context ? context.obj : null,
            orig:       origVal,
            prev:       prevVal,
            get curr()  { return _getCurr(); }, // shares lazy state
            cumulative: context ? (context.cumulative || {}) : {},
        };

        // Build a context-injecting wrapper around the scope so every function
        // receives ctx as its final argument regardless of how it's called.
        // Core functions live as flat properties; namespaced functions live
        // under their namespace chain for natural dot-access in eval.
        //
        // Memoization: discrete functions are memoized per call-site within a
        // segment. In a non-continuous segment, ALL functions are memoized.
        // In a continuous segment, only discrete functions are memoized.
        const _memoCache = context && context.memo ? context.memo : null;
        const _isContinuousSeg = !!(context && context.isContinuousSegment);
        var _callCounter = 0;

        const _wrapNode = function(node, regKey) {
            if (typeof node === 'function') {
                var reg = FN_REGISTRY[regKey] || null;
                var isImpure = !!(reg && !reg.pure);
                var isFreeze = regKey === 'core/freeze';
                // Memoize if: freeze (always), OR impure function in non-continuous segment
                var shouldMemo = _memoCache && (isFreeze || (isImpure && !_isContinuousSeg));

                if (shouldMemo) {
                    return function() {
                        var idx = _callCounter++;
                        var key = (regKey || 'fn') + ':' + idx;
                        if (key in _memoCache) return _memoCache[key];
                        var args = Array.prototype.slice.call(arguments);
                        var result = node.apply(null, [_ctx].concat(args));
                        _memoCache[key] = result;
                        return result;
                    };
                }
                return function() {
                    _callCounter++;
                    var args = Array.prototype.slice.call(arguments);
                    return node.apply(null, [_ctx].concat(args));
                };
            }
            if (node === null || typeof node !== 'object') return node;
            if (node.toHex) return node; // Color instances pass through
            var wrapped = {};
            Object.keys(node).forEach(function(k) {
                var childKey = regKey ? regKey + '/' + k : 'core/' + k;
                wrapped[k] = _wrapNode(node[k], childKey);
            });
            return wrapped;
        };
        var _wrapped = _wrapNode(EXPR_SCOPE, '');

        // Declare each top-level name as a local var so eval can access it.
        // Core functions become flat locals (rand, clamp, etc.).
        // Namespace roots become objects (anchor, mymod, etc.).
        var _scopeDecls = Object.keys(_wrapped).map(function(k) {
            return 'var ' + k + ' = _wrapped["' + k + '"];';
        }).join(' ');

        const _result = eval(_scopeDecls + '(' + body + ')');
        // Coerce Color instances to strings so Roll20 attribute setters work
        return (_result && typeof _result === 'object' && _result.toHex) ? _result.toHex() : _result;
    };

    /**
     * Evaluate a time expression — like evalExpr but uses TIME_EXPR_SCOPE.
     * Only prev is available as a variable; result must be a number (ms).
     */
    const evalTimeExpr = (expr, prevVal) => {
        const _prev = prevVal;

        // Normalise prev aliases
        const body = expr
            .replace(/\bprevious\b/g, '_prev')
            .replace(/\bprev\b/g,     '_prev');

        const _ctx = { prev: prevVal, cumulative: {} };

        const _wrapNode = function(node) {
            if (typeof node === 'function') {
                return function() {
                    var args = Array.prototype.slice.call(arguments);
                    return node.apply(null, [_ctx].concat(args));
                };
            }
            if (typeof node === 'number') return node; // constants
            var wrapped = {};
            Object.keys(node).forEach(function(k) {
                wrapped[k] = _wrapNode(node[k]);
            });
            return wrapped;
        };
        var _wrapped = _wrapNode(TIME_EXPR_SCOPE);

        var _scopeDecls = Object.keys(_wrapped).map(function(k) {
            return 'var ' + k + ' = _wrapped["' + k + '"];';
        }).join(' ');

        const _result = eval(_scopeDecls + '(' + body + ')');
        if (typeof _result !== 'number' || !isFinite(_result)) {
            throw new Error(`time expression must return a finite number, got: ${_result}`);
        }
        return _result;
    };

    /**
     * Validate a time expression string.
     * Returns null if valid, error string if not.
     */
    const validateTimeExpr = (expr) => {
        if (!expr || !expr.trim()) return null;
        let spaced = expr
            .replace(/[+\-]?(\d+\.?\d*|\.\d+)([eE][+\-]?\d+)?/g, ' ')
            .replace(/[+\-*/%,()<>=?:\s]+/g, ' ')
            .replace(/\.\s/g, ' ')
            .trim();
        const identChainRe = /[A-Za-z_][A-Za-z0-9_.]*/g;
        const unknowns = [];
        let m;
        while ((m = identChainRe.exec(spaced)) !== null) {
            const chain = m[0].replace(/\.$/, '');
            const root  = chain.split('.')[0];
            if (!TIME_ALLOWED_ROOTS.has(root)) unknowns.push(chain);
        }
        return unknowns.length > 0
            ? `Unknown identifier(s) in time expression: ${unknowns.join(', ')}`
            : null;
    };

    /**
     * Internal: shared validation and registration logic for value and timing functions.
     * Accepts either a struct or (name, fn) shorthand for quick registration.
     * External functions use namespace.name() syntax in expressions;
     * core functions can be called without namespace prefix.
     *
     * @param {string}          sourceId      Script name registering this function.
     * @param {object}          reg           Registration struct.
     * @param {object}          scope         Expression scope object to install function into.
     * @param {object}          registry      Registry object to store metadata in.
     * @param {Set}             allowedRoots  Set of allowed root identifiers in expressions.
     * @param {string}          label         Label used in log messages (e.g. 'registerValueFunction').
     *
     * Registration struct fields:
     * @param {string}   reg.name        Identifier (required).
     * @param {string}   reg.namespace   'core' or external namespace.
     * @param {function} reg.fn          Implementation (required).
     * @param {string}   reg.description One-line description.
     * @param {Array}    reg.args        [{ name, type, description, optional }] parameter descriptors.
     * @param {string}   reg.returns     Return type description.
     * @param {Array}    reg.examples    Example usage strings.
     *
     * @returns {boolean} true on success, false on validation failure or duplicate.
     */
    const _registerFn = (sourceId, reg, scope, registry, allowedRoots, label) => {

        const { name, namespace } = reg;

        if (!validIdent(name)) {
            log(`${SCRIPT_NAME}: [${sourceId}] ${label} — invalid name "${name}"`);
            return false;
        }
        if (!validNamespace(namespace)) {
            log(`${SCRIPT_NAME}: [${sourceId}] ${label} — invalid namespace "${namespace}"`);
            return false;
        }
        const qualifiedName = namespace === 'core' ? name : `${namespace}.${name}`;
        const nsParts = namespace === 'core' ? [] : namespace.split('.');

        // Check for duplicate
        let checkNode = scope;
        nsParts.forEach(p => { checkNode = checkNode && checkNode[p]; });
        if (checkNode && checkNode[name]) {
            const existing = (registry[`${namespace}/${name}`] || {}).source || SCRIPT_NAME;
            if (existing !== sourceId)
                log(`${SCRIPT_NAME}: [${sourceId}] ${label} — "${qualifiedName}" already registered by [${existing}]`);
            return false;
        }

        reg.description = reg.description || '';
        reg.args        = reg.args        || [];
        reg.returns     = reg.returns     || 'number';
        reg.examples    = reg.examples    || [];
        reg.pure        = reg.pure !== undefined ? reg.pure : true;
        reg.source      = sourceId;

        insertIntoScope(scope, namespace, name, reg.fn);
        const rootName = nsParts.length > 0 ? nsParts[0] : name;
        allowedRoots.add(rootName);

        registry[`${namespace}/${name}`] = reg;
        return true;
    };

    /**
     * Register a function for use in value/delta expressions.
     * The function receives (ctx, ...args) where ctx contains:
     * { orig, prev, curr, obj, cumulative }.
     *
     * @param {string}        sourceId    Script name registering this function.
     * @param {object}        reg         Registration struct:
     *
     * Required fields:
     * @param {string}        reg.name        Identifier.
     * @param {string}        reg.namespace   'core' or external namespace.
     * @param {function}      reg.fn          Function implementation.
     * @param {string}        reg.description One-line description.
     *
     * Optional fields:
     * @param {Array}         reg.args        [{ name, type, description, optional }] parameter descriptors.
     * @param {string}        reg.returns     Return type description.
     * @param {Array}         reg.examples    Example usage strings.
     * @param {boolean}       reg.pure        Whether function is pure (default: true).
     *
     * @returns {boolean} true on success, false on validation failure or duplicate.
     */
    const registerValueFunction = (sourceId, reg) =>
        _registerFn(sourceId, reg, EXPR_SCOPE, FN_REGISTRY, EXPR_ALLOWED_ROOTS, 'registerValueFunction');

    /**
     * Register a function for use in time expressions.
     * The function receives (ctx, ...args) where ctx contains: { prev, cumulative }.
     * Must return a number (milliseconds).
     *
     * @param {string}        sourceId    Script name registering this function.
     * @param {object}        reg         Registration struct:
     *
     * Required fields:
     * @param {string}        reg.name        Identifier.
     * @param {string}        reg.namespace   'core' or external namespace.
     * @param {function}      reg.fn          Function implementation.
     * @param {string}        reg.description One-line description.
     *
     * Optional fields:
     * @param {Array}         reg.args        [{ name, type, description, optional }] parameter descriptors.
     * @param {string}        reg.returns     Return type description.
     * @param {Array}         reg.examples    Example usage strings.
     * @param {boolean}       reg.pure        Whether function is pure (default: true).
     *
     * @returns {boolean} true on success, false on validation failure or duplicate.
     */
    const registerTimingFunction = (sourceId, reg) =>
        _registerFn(sourceId, reg, TIME_EXPR_SCOPE, TIME_FN_REGISTRY, TIME_ALLOWED_ROOTS, 'registerTimingFunction');

    // =========================================================================
    // Constant Registry
    // =========================================================================

    const CONST_REGISTRY = {};

    /**
     * Register a named constant for use in expressions.
     * Constants are installed into EXPR_SCOPE (and TIME_EXPR_SCOPE for numeric values).
     *
     * @param {string} sourceId  Script name registering this constant.
     * @param {object} reg       Registration struct:
     *
     * Required fields:
     * @param {string}   reg.name        Identifier (must be a valid JS identifier, no dots).
     * @param {*}        reg.value       The constant value.
     * @param {string}   reg.namespace   Namespace (e.g. 'core' or your script's namespace).
     * @param {string}   reg.description One-line description.
     * @param {string[]} reg.contexts    Which expression contexts allow this: ['value','time'] or a subset.
     *
     * Optional fields:
     * @param {string}   reg.type        Value type name for display (default: typeof value).
     *
     * @returns {boolean} true on success, false on validation failure or duplicate.
     */
    const registerPlaybackConstant = (sourceId, reg) => {
        const src = sourceId || SCRIPT_NAME;

        if (typeof reg === 'object' && !reg.name) {
            log(`${SCRIPT_NAME}: [${src}] registerPlaybackConstant — missing name`);
            return false;
        }
        const namespace = reg.namespace || 'core';
        const { name, value, description = '', type = typeof value } = reg;
        const contexts  = reg.contexts || ['value', 'time'];

        if (!validIdent(name)) {
            log(`${SCRIPT_NAME}: [${src}] registerPlaybackConstant — invalid name "${name}" (must be a valid identifier with no dots)`);
            return false;
        }
        if (!validNamespace(namespace)) {
            log(`${SCRIPT_NAME}: [${src}] registerPlaybackConstant — invalid namespace "${namespace}"`);
            return false;
        }

        const key = `${namespace}/${name}`;
        if (CONST_REGISTRY[key]) {
            const existing = (CONST_REGISTRY[key] || {}).source || SCRIPT_NAME;
            if (existing !== src)
                log(`${SCRIPT_NAME}: [${src}] registerPlaybackConstant — "${namespace}.${name}" is already registered by [${existing}]`);
            return false;
        }

        // Insert into value scope
        insertIntoScope(EXPR_SCOPE, namespace, name, value);
        const nsParts2 = namespace === 'core' ? [] : namespace.split('.');
        const rootName = nsParts2.length > 0 ? nsParts2[0] : name;
        EXPR_ALLOWED_ROOTS.add(rootName);

        // Insert numeric constants into time scope too
        if (typeof value === 'number') {
            insertIntoScope(TIME_EXPR_SCOPE, namespace, name, value);
            TIME_ALLOWED_ROOTS.add(rootName);
        }

        CONST_REGISTRY[key] = { name, namespace, value, description, type, contexts, source: src };
        return true;
    };

    // Register all core built-in functions with full struct
    [
        {
            name: 'rand', namespace: 'core',
            description: 'Returns a uniformly distributed random number between min (inclusive) and max (exclusive).',
            pure: false,
            args: [
                { name: 'min', type: 'number', description: 'Lower bound (inclusive)' },
                { name: 'max', type: 'number', description: 'Upper bound (exclusive)' },
            ],
            returns: 'number',
            examples: ['+rand(-140,140)  random delta ±140', '=rand(orig-50,orig+50)  random near origin'],
            fn: (ctx, min, max) => min + Math.random() * (max - min),
        },
        {
            name: 'randInt', namespace: 'core',
            description: 'Returns a random integer between min and max (both inclusive).',
            pure: false,
            args: [
                { name: 'min', type: 'number', description: 'Lower bound (inclusive)' },
                { name: 'max', type: 'number', description: 'Upper bound (inclusive)' },
            ],
            returns: 'integer',
            examples: ['+randInt(-3,3)  random integer step'],
            fn: (ctx, min, max) => Math.floor(min + Math.random() * (max - min + 1)),
        },
        {
            name: 'pick', namespace: 'core',
            description: 'Returns one of the provided values chosen uniformly at random.',
            pure: false,
            args: [{ name: '...values', type: 'any', description: 'Values to pick from' }],
            returns: 'any',
            examples: ['=pick(0,90,180,270)  random cardinal rotation'],
            fn: (ctx, ...args) => args[Math.floor(Math.random() * args.length)],
        },
        {
            name: 'freeze', namespace: 'core',
            description: 'Memoizes its argument — evaluates once per segment, returns the cached value on subsequent ticks. Use in continuous easing to stabilize non-deterministic values.',
            args: [{ name: 'value', type: 'any', description: 'Value to freeze' }],
            returns: 'any',
            examples: ['=orig + freeze(rand(-50,50)) + cos(t * TAU) * 140  stable random offset with continuous orbit'],
            fn: (ctx, val) => val,
        },
        {
            name: 'clamp', namespace: 'core',
            description: 'Clamps value to the range [lo, hi].',
            args: [
                { name: 'value', type: 'number', description: 'Value to clamp' },
                { name: 'lo',    type: 'number', description: 'Minimum' },
                { name: 'hi',    type: 'number', description: 'Maximum' },
            ],
            returns: 'number',
            examples: ['=clamp(prev+rand(-50,50),orig-200,orig+200)  clamped wander'],
            fn: (ctx, v, lo, hi) => Math.min(Math.max(v, lo), hi),
        },
        { name:'abs',   namespace:'core', description:'Absolute value.',        args:[{name:'x',type:'number'}], returns:'number', examples:['=abs(prev)'], fn: (ctx, x) => Math.abs(x)   },
        { name:'round', namespace:'core', description:'Round to nearest step (default 1).',args:[{name:'x',type:'number'},{name:'step',type:'number',optional:true}], returns:'number',examples:['=round(prev+0.5)','=round(orig*1.2, grid(1))'], fn: (ctx, x, step) => { const s = step || 1; return Math.round(x / s) * s; } },
        { name:'floor', namespace:'core', description:'Round down to step (default 1).',   args:[{name:'x',type:'number'},{name:'step',type:'number',optional:true}], returns:'number',examples:['=floor(rand(0,4))'], fn: (ctx, x, step) => { const s = step || 1; return Math.floor(x / s) * s; } },
        { name:'ceil',  namespace:'core', description:'Round up to step (default 1).',     args:[{name:'x',type:'number'},{name:'step',type:'number',optional:true}], returns:'number',examples:['=ceil(rand(0,4))'],  fn: (ctx, x, step) => { const s = step || 1; return Math.ceil(x / s) * s; } },
        { name:'min',   namespace:'core', description:'Minimum of two or more values.', args:[{name:'...values',type:'number'}], returns:'number', examples:['=min(prev+10,orig+100)'], fn: (ctx, ...args) => Math.min(...args) },
        { name:'max',   namespace:'core', description:'Maximum of two or more values.', args:[{name:'...values',type:'number'}], returns:'number', examples:['=max(prev-10,orig-100)'], fn: (ctx, ...args) => Math.max(...args) },
        { name:'sqrt',  namespace:'core', description:'Square root.',    args:[{name:'x',type:'number'}], returns:'number', examples:['=sqrt(prev)'], fn: (ctx, x) => Math.sqrt(x)  },
        { name:'pow',   namespace:'core', description:'x raised to the power y.', args:[{name:'x',type:'number'},{name:'y',type:'number'}], returns:'number', examples:['=pow(2,3)'], fn: (ctx, x, y) => Math.pow(x, y) },
        { name:'sin',   namespace:'core', description:'Sine of x (radians).',   args:[{name:'x',type:'number'}], returns:'number', examples:['=sin(orig)*50  oscillate ±50 from origin'], fn: (ctx, x) => Math.sin(x) },
        { name:'cos',   namespace:'core', description:'Cosine of x (radians).', args:[{name:'x',type:'number'}], returns:'number', examples:['=cos(orig)*50  oscillate ±50 from origin'], fn: (ctx, x) => Math.cos(x) },
        { name:'tan',   namespace:'core', description:'Tangent of x (radians).', args:[{name:'x',type:'number'}], returns:'number', examples:[], fn: (ctx, x) => Math.tan(x) },
        { name:'log',   namespace:'core', description:'Natural logarithm.',      args:[{name:'x',type:'number'}], returns:'number', examples:[], fn: (ctx, x) => Math.log(x) },
        { name:'exp',   namespace:'core', description:'e raised to the power x.',args:[{name:'x',type:'number'}], returns:'number', examples:[], fn: (ctx, x) => Math.exp(x) },
    ].forEach(reg => {
        registerValueFunction(SCRIPT_NAME, reg);
        registerTimingFunction(SCRIPT_NAME, reg);
    });

    // ── Unit conversion functions (value context only — need token page) ─────
    const _getPage = (ctx) => {
        if (!ctx || !ctx.obj) return null;
        return getObj('page', ctx.obj.get('_pageid'));
    };
    [
        {
            name: 'cell', namespace: 'core', contexts: ['value'],
            description: 'Converts grid cells to pixels. cell(1) = one grid cell width in px.',
            args: [{ name: 'n', type: 'number', description: 'Number of grid cells' }],
            returns: 'number',
            examples: ['=cell(4)  4 grid cells in pixels', '=round(orig * 1.2, cell(1))  snap to grid'],
            fn: (ctx, n) => { const p = _getPage(ctx); const si = p ? parseFloat(p.get('snapping_increment')) || 1 : 1; return n * si * 70; },
        },
        {
            name: 'unit', namespace: 'core', contexts: ['value'],
            description: 'Converts map-scale units (ft/m/etc.) to pixels.',
            args: [{ name: 'n', type: 'number', description: 'Distance in page scale units' }],
            returns: 'number',
            examples: ['=unit(5)  5ft in pixels', '=unit(30)  30ft movement range'],
            fn: (ctx, n) => { const p = _getPage(ctx); const sn = p ? parseFloat(p.get('scale_number')) || 5 : 5; return (n / sn) * 70; },
        },
    ].forEach(reg => registerValueFunction(SCRIPT_NAME, reg));

    // ── Color functions ───────────────────────────────────────────────────────
    [
        {
            name: 'rgb', namespace: 'color', contexts: ['value'],
            description: 'Creates a Color from red, green, blue components (0-255 each).',
            args: [
                { name: 'r', type: 'number', description: 'Red (0-255)' },
                { name: 'g', type: 'number', description: 'Green (0-255)' },
                { name: 'b', type: 'number', description: 'Blue (0-255)' },
            ],
            returns: 'Color',
            examples: ['=color.rgb(255,0,0)  red', '=color.rgb(rand(0,255),rand(0,255),rand(0,255))  random color'],
            fn: (ctx, r, g, b) => new Color(r, g, b),
        },
        {
            name: 'hsl', namespace: 'color', contexts: ['value'],
            description: 'Creates a Color from hue (0-360°), saturation (0-100%), lightness (0-100%).',
            args: [
                { name: 'h', type: 'number', description: 'Hue in degrees (0-360, wraps)' },
                { name: 's', type: 'number', description: 'Saturation percent (0-100)' },
                { name: 'l', type: 'number', description: 'Lightness percent (0-100)' },
            ],
            returns: 'Color',
            examples: ['=color.hsl(rand(0,360),100,50)  random vivid color', '=color.hsl(0,100,50)  red'],
            fn: (ctx, h, s, l) => Color.fromHsl(h, s, l),
        },
        {
            name: 'rotateHue', namespace: 'color', contexts: ['value'],
            description: 'Rotates the hue of a color by the given degrees.',
            args: [
                { name: 'color', type: 'Color', description: 'Base color' },
                { name: 'degrees', type: 'number', description: 'Degrees to rotate hue' },
            ],
            returns: 'Color',
            examples: ['=color.rotateHue(orig,30)  shift hue 30°', '=color.rotateHue(orig,rand(-60,60))  random hue shift'],
            fn: (ctx, c, degrees) => {
                const col = toColor(c);
                if (!col) return c;
                const { h, s, l } = col.toHsl();
                return Color.fromHsl(h + degrees, s, l);
            },
        },
        {
            name: 'darken', namespace: 'color', contexts: ['value'],
            description: 'Darkens a color by reducing lightness by the given percentage points.',
            args: [
                { name: 'color', type: 'Color', description: 'Base color' },
                { name: 'amount', type: 'number', description: 'Lightness reduction (0-100)' },
            ],
            returns: 'Color',
            examples: ['=color.darken(orig,20)  20% darker'],
            fn: (ctx, c, amount) => {
                const col = toColor(c);
                if (!col) return c;
                const { h, s, l } = col.toHsl();
                return Color.fromHsl(h, s, l - amount);
            },
        },
        {
            name: 'lighten', namespace: 'color', contexts: ['value'],
            description: 'Lightens a color by increasing lightness by the given percentage points.',
            args: [
                { name: 'color', type: 'Color', description: 'Base color' },
                { name: 'amount', type: 'number', description: 'Lightness increase (0-100)' },
            ],
            returns: 'Color',
            examples: ['=color.lighten(orig,20)  20% lighter'],
            fn: (ctx, c, amount) => {
                const col = toColor(c);
                if (!col) return c;
                const { h, s, l } = col.toHsl();
                return Color.fromHsl(h, s, l + amount);
            },
        },
        {
            name: 'saturate', namespace: 'color', contexts: ['value'],
            description: 'Increases saturation by the given percentage points.',
            args: [
                { name: 'color', type: 'Color', description: 'Base color' },
                { name: 'amount', type: 'number', description: 'Saturation increase (0-100)' },
            ],
            returns: 'Color',
            examples: ['=color.saturate(orig,30)  more vivid'],
            fn: (ctx, c, amount) => {
                const col = toColor(c);
                if (!col) return c;
                const { h, s, l } = col.toHsl();
                return Color.fromHsl(h, s + amount, l);
            },
        },
        {
            name: 'mix', namespace: 'color', contexts: ['value'],
            description: 'Blends two colors. t=0 returns a, t=1 returns b.',
            args: [
                { name: 'a', type: 'Color', description: 'First color' },
                { name: 'b', type: 'Color', description: 'Second color' },
                { name: 't', type: 'number', description: 'Blend factor (0-1)' },
            ],
            returns: 'Color',
            examples: ['=color.mix(orig,color.red,0.5)  blend with red', '=color.mix(orig,color.red,rand(0,1))  random blend'],
            fn: (ctx, a, b, t) => {
                const ca = toColor(a), cb = toColor(b);
                if (!ca || !cb) return a;
                t = Math.max(0, Math.min(1, t));
                return new Color(
                    ca.r + (cb.r - ca.r) * t,
                    ca.g + (cb.g - ca.g) * t,
                    ca.b + (cb.b - ca.b) * t
                );
            },
        },
        {
            name: 'getHue', namespace: 'color', contexts: ['value'],
            description: 'Returns the hue (0-360) of a color.',
            args: [{ name: 'color', type: 'Color', description: 'Input color' }],
            returns: 'number',
            examples: ['=color.getHue(orig)  get current hue'],
            fn: (ctx, c) => { const col = toColor(c); return col ? col.toHsl().h : 0; },
        },
        {
            name: 'getSat', namespace: 'color', contexts: ['value'],
            description: 'Returns the saturation (0-100) of a color.',
            args: [{ name: 'color', type: 'Color', description: 'Input color' }],
            returns: 'number',
            examples: ['=color.getSat(orig)'],
            fn: (ctx, c) => { const col = toColor(c); return col ? col.toHsl().s : 0; },
        },
        {
            name: 'getLightness', namespace: 'color', contexts: ['value'],
            description: 'Returns the lightness (0-100) of a color.',
            args: [{ name: 'color', type: 'Color', description: 'Input color' }],
            returns: 'number',
            examples: ['=color.getLightness(orig)'],
            fn: (ctx, c) => { const col = toColor(c); return col ? col.toHsl().l : 0; },
        },
        {
            name: 'get', namespace: 'core', contexts: ['value'],
            description: 'Reads the current value of any registered attribute on the token.',
            args: [{ name: 'name', type: 'string', description: 'Attribute name (e.g. "bar1_max")' }],
            returns: 'any',
            examples: ['=get("bar1_max") * 1.2  heal to 120% of max', '=get("bar1_value") + 10  current HP + 10'],
            fn: (ctx, attrName) => {
                const reg = getAttrReg(attrName);
                if (reg && ctx.obj) {
                    const val = reg.get(ctx.obj);
                    return reg.valueType === 'number' ? (parseFloat(val) || 0) : val;
                }
                if (ctx.obj) {
                    const val = ctx.obj.get(attrName);
                    return val !== undefined && val !== '' ? (isNaN(val) ? val : parseFloat(val)) : 0;
                }
                return 0;
            },
        },
    ].forEach(reg => registerValueFunction(SCRIPT_NAME, reg));

    // ── Color constants — Roll20 palette ─────────────────────────────────────
    // Colors are listed in Roll20 color picker order (left-to-right, top-to-bottom)
    const roll20Colors = [
        // Row 1 — Grayscale
        { name: 'black',       hex: '#000000', description: 'Black'      },
        { name: 'charcoal',    hex: '#434343', description: 'Charcoal'   },
        { name: 'gray',        hex: '#666666', description: 'Gray'       },
        { name: 'silver',      hex: '#c0c0c0', description: 'Silver'     },
        { name: 'lightGray',   hex: '#d9d9d9', description: 'Light gray' },
        { name: 'white',       hex: '#ffffff', description: 'White'      },
        // Row 2 — Pure/vivid
        { name: 'darkRed',     hex: '#980000', description: 'Dark red'   },
        { name: 'red',         hex: '#ff0000', description: 'Red'        },
        { name: 'orange',      hex: '#ff9900', description: 'Orange'     },
        { name: 'yellow',      hex: '#ffff00', description: 'Yellow'     },
        { name: 'lime',        hex: '#00ff00', description: 'Lime green' },
        { name: 'cyan',        hex: '#00ffff', description: 'Cyan'       },
        // Row 3 — Blues/purples/pinks
        { name: 'cornflowerBlue', hex: '#4a86e8', description: 'Cornflower blue' },
        { name: 'blue',        hex: '#0000ff', description: 'Blue'       },
        { name: 'violet',      hex: '#9900ff', description: 'Violet'     },
        { name: 'magenta',     hex: '#ff00ff', description: 'Magenta'    },
        { name: 'roseDust',    hex: '#e6b8af', description: 'Rose dust'  },
        { name: 'lightPink',   hex: '#f4cccc', description: 'Light pink' },
        // Row 4 — Light pastels
        { name: 'peach',        hex: '#fce5cd', description: 'Peach'         },
        { name: 'cream',        hex: '#fff2cc', description: 'Cream'         },
        { name: 'mintCream',    hex: '#d9ead3', description: 'Mint cream'    },
        { name: 'powderBlue',   hex: '#d0e0e3', description: 'Powder blue'   },
        { name: 'lavenderBlue', hex: '#c9daf8', description: 'Lavender blue' },
        { name: 'aliceBlue',    hex: '#cfe2f3', description: 'Alice blue'    },
        // Row 5 — Medium pastels/light warm
        { name: 'lavender',     hex: '#d9d2e9', description: 'Lavender'      },
        { name: 'blushPink',    hex: '#ead1dc', description: 'Blush pink'    },
        { name: 'terracotta',   hex: '#dd7e6b', description: 'Terracotta'    },
        { name: 'lightRed',     hex: '#ea9999', description: 'Light red'     },
        { name: 'lightOrange',  hex: '#f9cb9c', description: 'Light orange'  },
        { name: 'lightYellow',  hex: '#ffe599', description: 'Light yellow'  },
        // Row 6 — Medium pastels/cool
        { name: 'lightGreen',   hex: '#b6d7a8', description: 'Light green'   },
        { name: 'cadetBlue',    hex: '#a2c4c9', description: 'Cadet blue'    },
        { name: 'periwinkle',   hex: '#a4c2f4', description: 'Periwinkle'    },
        { name: 'skyBlue',      hex: '#9fc5e8', description: 'Sky blue'      },
        { name: 'lilac',        hex: '#b4a7d6', description: 'Lilac'         },
        { name: 'pinkLavender', hex: '#d5a6bd', description: 'Pink lavender' },
        // Row 7 — Medium saturated
        { name: 'burntOrange',  hex: '#cc4125', description: 'Burnt orange'  },
        { name: 'salmon',       hex: '#e06666', description: 'Salmon'        },
        { name: 'sandyBrown',   hex: '#f6b26b', description: 'Sandy brown'   },
        { name: 'goldenYellow', hex: '#ffd966', description: 'Golden yellow' },
        { name: 'sage',         hex: '#93c47d', description: 'Sage'          },
        { name: 'steelBlue',    hex: '#76a5af', description: 'Steel blue'    },
        // Row 8 — Medium blues/purples/deep reds
        { name: 'cornflower',   hex: '#6d9eeb', description: 'Cornflower'    },
        { name: 'carolina',     hex: '#6fa8dc', description: 'Carolina blue' },
        { name: 'amethyst',     hex: '#8e7cc3', description: 'Amethyst'      },
        { name: 'mauve',        hex: '#c27ba0', description: 'Mauve'         },
        { name: 'crimson',      hex: '#a61c00', description: 'Crimson'       },
        { name: 'scarlet',      hex: '#cc0000', description: 'Scarlet'       },
        // Row 9 — Medium saturated warm/cool
        { name: 'amber',        hex: '#e69138', description: 'Amber'       },
        { name: 'gold',         hex: '#f1c232', description: 'Gold'        },
        { name: 'fern',         hex: '#6aa84f', description: 'Fern'        },
        { name: 'teal',         hex: '#45818e', description: 'Teal'        },
        { name: 'royalBlue',    hex: '#3c78d8', description: 'Royal blue'  },
        { name: 'cerulean',     hex: '#3d85c6', description: 'Cerulean'    },
        // Row 10 — Deep purples/dark warm
        { name: 'purple',       hex: '#674ea7', description: 'Purple'       },
        { name: 'raspberry',    hex: '#a64d79', description: 'Raspberry'    },
        { name: 'darkBrown',    hex: '#5b0f00', description: 'Dark brown'   },
        { name: 'darkMaroon',   hex: '#660000', description: 'Dark maroon'  },
        { name: 'chocolate',    hex: '#783f04', description: 'Chocolate'    },
        { name: 'bronze',       hex: '#7f6000', description: 'Bronze'       },
        // Row 11 — Deep dark cool
        { name: 'darkForest',   hex: '#274e13', description: 'Dark forest'  },
        { name: 'darkTeal',     hex: '#0c343d', description: 'Dark teal'    },
        { name: 'navy',         hex: '#1c4587', description: 'Navy'         },
        { name: 'midnight',     hex: '#073763', description: 'Midnight'     },
        { name: 'darkPurple',   hex: '#20124d', description: 'Dark purple'  },
    ];
    roll20Colors.forEach(c => {
        const h = c.hex.replace(/^#/, '');
        const n = parseInt(h, 16);
        registerPlaybackConstant(SCRIPT_NAME, {
            name: c.name, namespace: 'color', type: 'Color', contexts: ['value'],
            value: new Color((n >> 16) & 255, (n >> 8) & 255, n & 255),
            description: `${c.description} (${c.hex})`,
        });
    });
    registerPlaybackConstant(SCRIPT_NAME, {
        name: 'transparent', namespace: 'color', type: 'Color', contexts: ['value'],
        value: Color.transparent,
        description: 'Transparent (no tint)',
    });

    // ── Math constants ────────────────────────────────────────────────────────
    registerPlaybackConstant(SCRIPT_NAME, {
        name: 'PI', namespace: 'core', type: 'number',
        value: Math.PI,
        description: 'π (3.14159…)',
    });
    registerPlaybackConstant(SCRIPT_NAME, {
        name: 'TAU', namespace: 'core', type: 'number',
        value: Math.PI * 2,
        description: '2π (6.28318…) — one full rotation in radians.',
    });

    // Pre-built query strings for handout dropdown buttons
    // Escape a string for use inside a nested Roll20 ?{} query that is itself
    const EASING_QUERY = () => {
        const makeEntry = (name, reversed) => {
            const reg    = EASING_REGISTRY[name];
            const args   = reg && reg.args && reg.args.length > 0 ? reg.args : null;
            const prefix = reversed ? '~' : '';

            if (!args) return `${prefix}${name}`;

            // Parametric — label shows arg names, value is a sentinel name()
            // set-easing detects the empty parens and whispers a follow-up args prompt
            const rawLabel  = reg.label || `${prefix}${name}(${args.map(a => a.optional ? `[${a.name}]` : a.name).join(', ')})`;
            // In href context, & must be &amp; so browser decodes &amp;#44; → &#44; → ,
            const safeLabel = rawLabel.replace(/\(/g, '&#40;').replace(/\)/g, '&#41;').replace(/,/g, '&amp;#44;');
            return `${safeLabel},${prefix}${name}()`;
        };

        const curves  = EASING_NAMES().filter(n => n !== 'linear' && n !== 'step');
        const entries = [
            'linear',
            ...curves.flatMap(n => [makeEntry(n, false), makeEntry(n, true)]),
            'step',
        ];
        return `?{Easing|${entries.join('|')}}`;
    };

    const TYPE_QUERY = '?{Type|change|command}';

    const generateHandoutHtml = (name, recording, attrCols) => {
        const { objectType = 'graphic', duration = 0, notes = '' } = recording;
        const keyframes = recording.keyframes || [];

        // All registered interpolatable attribute names for the dropdown
        const allAttrs = getAllAttrNames(objectType);
        const addableAttrs = allAttrs.filter(a => !attrCols.includes(a));
        const addDropdown  = addableAttrs.length > 0
            ? `?{Add Attribute|${addableAttrs.join('|')}}`
            : null;

        let html = '';

        // ---- Metadata block ----
        html += `<div style="${STYLE.meta}">`;
        html += `<b>Recording:</b> ${escHtml(name)}<br>`;
        html += `<b>Object type:</b> ${escHtml(objectType)}<br>`;
        html += `<b>Notes:</b> ${escHtml(notes)}<br>`;
        html += '</div>';

        // ---- Action buttons ----
        html += `<div style="margin-bottom:8px;">`;
        html += btnHtml('👁 Preview', `${CMD_TOKEN} playback-menu ${escArg(name)}`);
        html += btnHtml('+ Row',     `${CMD_TOKEN} add-row ${escArg(name)} ?{Time (ms)|=0}`);
        html += btnHtml('⇅ Sort',    `${CMD_TOKEN} sort ${escArg(name)}`);
        html += btnHtml('Refresh',   `${CMD_TOKEN} refresh ${escArg(name)}`);
        html += btnHtml('🔍 Dump',   `${CMD_TOKEN} dump-html ${escArg(name)}`);
        if (addDropdown) {
            html += btnHtml('+ Add Attribute',
                `${CMD_TOKEN} add-attribute ${escArg(name)} ${addDropdown}`);
        }
        html += btnHtml('⚠ Delete', `${CMD_TOKEN} delete ${escArg(name)}`);
        html += `</div>`;

        // ---- Keyframe table ----
        html += `<div style="overflow-x:auto;width:100%;margin-bottom:4px;">`;
        html += `<table style="${STYLE.table}">`;

        // Determine if there are any command keyframes
        const hasCommands = keyframes.some(kf => kf.type === 'command');

        // Header row
        html += '<tr>';
        html += `<th style="${STYLE.th}">Time (ms)</th>`;
        html += `<th style="${STYLE.th}">type</th>`;
        if (hasCommands) {
            html += `<th style="${STYLE.th}"><span data-attr="__command">command</span></th>`;
        }
        attrCols.forEach(attr => {
            const reg     = getAttrReg(attr);
            const canLerp = reg && reg.lerp !== null;
            html += `<th style="${STYLE.th}"><span data-attr="${escHtml(attr)}">${escHtml(attr)}</span>`;
            html += `<a href="${CMD_TOKEN} remove-attribute ${escArg(name)} ${escArg(attr)}" `
                  + `style="${STYLE.btn};background:#900;padding:0 4px;margin-left:3px;">✕</a></th>`;
            if (canLerp) {
                html += `<th style="${STYLE.th}"><span data-attr="${escHtml(attr)}:easing">${escHtml(attr)}:easing</span></th>`;
            }
        });
        html += '</tr>';

        // Keyframe rows
        // Track which attrs have already had a showEasingBtn row
        const hadEasingAttr = new Set();

        keyframes.forEach((kf, ki) => {
                const bg    = ki % 2 === 0 ? STYLE.td : STYLE.tdAlt;
                const bgErr = 'padding:2px 5px;border:1px solid #c00;background:#fee;';

                // Render parse-error rows specially
                if (kf.type === 'parse-error') {
                    const colSpan = 2 + attrCols.reduce((n, a) => {
                        const reg = getAttrReg(a);
                        return n + 1 + (reg && reg.lerp !== null ? 1 : 0);
                    }, 0) + (hasCommands ? 1 : 0);
                    html += '<tr>';
                    html += `<td style="${bgErr}">${kf.time !== null ? kf.time : '?'}</td>`;
                    html += `<td style="${bgErr}" colspan="${colSpan}" title="${escHtml(kf.error)}">`;
                    html += `⚠ Parse error: ${escHtml(kf.error)}`;
                    if (kf.rawCells) html += ` <small>(${escHtml(kf.rawCells.slice(0, 80))}${kf.rawCells.length > 80 ? '…' : ''})</small>`;
                    html += `</td></tr>`;
                    return;
                }

                const cell  = (colKey, content) => {
                    const hasErr = kf.cellErrors && kf.cellErrors[colKey];
                    const style  = hasErr ? bgErr : bg;
                    const title  = hasErr ? ` title="${escHtml(kf.cellErrors[colKey])}"` : '';
                    return `<td style="${style}"${title}>${content}</td>`;
                };

                const kfType  = kf.type || 'change';
                const kfTimeStr = escArg(fmtTime(kf.time));
                const typeBtn = `<a href="${CMD_TOKEN} set-type ${escArg(name)} ${kfTimeStr} ${TYPE_QUERY}" style="${STYLE.btn};padding:0 3px;margin-left:3px;" title="Pick type">⚙</a>`;
                const typeCellErrors = kf.cellErrors && kf.cellErrors['type'];
                const typeBg = typeCellErrors
                    ? 'padding:2px 5px;border:1px solid #c00;background:#fee;'
                    : bg;
                const typeTitle = typeCellErrors ? ` title="${escHtml(typeCellErrors)}"` : '';

                html += '<tr>';
                html += `<td style="${bg}" data-type="${escHtml(kfType)}">${escHtml(fmtTime(kf.time))}</td>`;
                html += `<td style="${typeBg}"${typeTitle}>${escHtml(kfType)}${typeBtn}</td>`;
                if (hasCommands) {
                    const cmd    = kf.type === 'command' ? (kf.command || '') : '';
                    const setCmdBtn = kf.type === 'command'
                        ? `<a href="${CMD_TOKEN} set-command ${escArg(name)} ${kfTimeStr} ?{Command|${escHtml(cmd)}}" style="${STYLE.btn};padding:0 3px;margin-left:3px;" title="Set command">⚙</a>`
                        : '';
                    // Encode leading slash so Roll20's editor doesn't strip it
                    const cmdDisplay = cmd.startsWith('/')
                        ? '&#47;' + escHtml(cmd.slice(1))
                        : escHtml(cmd);
                    html += cell('__command', cmdDisplay + setCmdBtn);
                }
                attrCols.forEach(attr => {
                    const reg     = getAttrReg(attr);
                    const canLerp = reg && reg.lerp !== null;
                    const parsed  = kf.deltas && attr in kf.deltas ? kf.deltas[attr] : null;
                    // Only use easing if it's a recognised name — discard corrupted values
                    const rawEasing = kf.easings && kf.easings[attr] ? kf.easings[attr] : '';
                    const easing    = (rawEasing && !validateEasingExpr(rawEasing)) ? rawEasing : '';
                    // Clean invalid value from cache
                    if (rawEasing && !easing && kf.easings) delete kf.easings[attr];
                    // parsed is { delta: val }, { abs: val }, or { expr, mode } — extract display value
                    let cellVal = '';
                    if (parsed !== null && parsed !== undefined) {
                        if ('expr' in parsed) {
                            // Expression — display with mode prefix
                            if (parsed.mode === 'abs') cellVal = `=${parsed.expr}`;
                            else if (parsed.mode === 'mul') cellVal = `×${parsed.expr}`;
                            else if (parsed.sign === -1) cellVal = `-${parsed.expr}`;
                            else cellVal = `+${parsed.expr}`;
                        } else if (reg) {
                            if ('abs' in parsed) {
                                cellVal = reg.format(parsed.abs);
                                // Ensure abs values always show = prefix
                                if (!String(cellVal).startsWith('=')) cellVal = `=${cellVal}`;
                            } else if ('delta' in parsed) {
                                cellVal = reg.format(parsed.delta);
                            }
                        } else {
                            cellVal = 'abs' in parsed ? `=${parsed.abs}` : `+${parsed.delta}`;
                        }
                    }
                    html += cell(attr, escHtml(cellVal));
                    if (canLerp) {
                        // Show easing button only if this cell would NOT be stripped
                        // by stripRedundantEasings — i.e. it's not in a dead zone
                        // between a non-identity value and the next identity/end.
                        //
                        // A row is in a dead zone if:
                        //   scanning forward from it, the next delta for this attr
                        //   is an identity delta (or there is no next delta at all)
                        // EXCEPT: identity-delta rows themselves are NOT in a dead zone
                        // (they are the easing switch point for the next segment).
                        const isIdentity = isIdentityParsed(parsed, reg);
                        const futureKfs  = keyframes.slice(ki + 1);
                        const nextDeltaKf = futureKfs.find(fkf =>
                            fkf.deltas && attr in fkf.deltas &&
                            fkf.deltas[attr] !== null && fkf.deltas[attr] !== undefined
                        );
                        const nextDeltaIsIdentity = nextDeltaKf
                            ? isIdentityParsed(nextDeltaKf.deltas[attr], reg)
                            : true; // no next delta = treat as identity (end of table)

                        // Show ⚙ if:
                        //   - this row is an identity delta (easing switch point), OR
                        //   - this row is not identity AND the next delta is not identity
                        const showEasingBtn = isIdentity
                            ? !nextDeltaIsIdentity  // identity row: show only if next segment is real
                            : !nextDeltaIsIdentity; // normal row: show only if not heading into identity/end

                        if (showEasingBtn) {
                            const easingBtn = `<a href="${CMD_TOKEN} set-easing ${escArg(name)} ${kfTimeStr} ${escArg(attr)} ${EASING_QUERY()}" style="${STYLE.btn};padding:0 3px;margin-left:3px;" title="Pick easing">⚙</a>`;
                            const hasDelta = parsed !== null && parsed !== undefined;
                            const isFirstEasingRow = !hadEasingAttr.has(attr);
                            hadEasingAttr.add(attr);
                            const displayEasing = easing || (hasDelta || isFirstEasingRow ? 'step' : '');

                            // Check if easing is parametric
                            const token = displayEasing ? parseEasingToken(displayEasing) : null;
                            const easingReg = token ? EASING_REGISTRY[token.name] : null;
                            const isParametric = easingReg && easingReg.args && easingReg.args.length > 0;

                            let easingContent;
                            if (isParametric) {
                                const currentArgs = token.args.length > 0 ? token.args.join(',') : null;
                                const argNames    = easingReg.args.map(a => a.optional ? `[${a.name}]` : a.name).join(', ');
                                const firstNonPrompt = easingReg.args.findIndex(a => a.promptDefault === undefined);
                                const trailingOK = firstNonPrompt === -1 || easingReg.args.slice(firstNonPrompt).every(a => a.default !== undefined);
                                const hasAny = easingReg.args.some(a => a.promptDefault !== undefined);
                                const promptArgs = firstNonPrompt === -1 ? easingReg.args : easingReg.args.slice(0, firstNonPrompt);
                                const argDefault = (hasAny && trailingOK) ? promptArgs.map(a => a.promptDefault).join(',') : (currentArgs || '');
                                const argsDisplay = currentArgs || `…`;
                                const prefix = token.reversed ? '~' : '';
                                // Use current args as prompt default if set, else registry promptDefault
                                const promptDefault = currentArgs || argDefault;
                                // Standalone ?{} in href — fires directly, no nesting issues
                                const argsHref = `${CMD_TOKEN} set-easing ${escArg(name)} ${kfTimeStr} ${escArg(attr)} ${prefix}${token.name}(?{${prefix}${token.name} args (${argNames})|${promptDefault}})`;
                                const argsBtn  = `<a href="${escHtml(argsHref)}" style="${STYLE.btn};padding:0 3px;" title="Set args">${escHtml(argsDisplay)}</a>`;
                                // No data-value needed — Roll20 strips HTML, text content is read directly
                                easingContent = `${escHtml(prefix + token.name)}(${argsBtn})${easingBtn}`;
                            } else {
                                easingContent = displayEasing
                                    ? `${escHtml(displayEasing)}${easingBtn}`
                                    : easingBtn;
                            }
                            html += cell(`${attr}:easing`, easingContent);
                        } else {
                            html += cell(`${attr}:easing`, '');
                        }
                    }
                });
                html += '</tr>';
            });

            html += '</table></div>';

        // ---- Attribute key ----
        html += `<div style="font-size:10px;color:#666;margin-top:4px;">`;
        html += `+/- = relative delta &nbsp; = = absolute value &nbsp; `;
        html += `empty cell = no change at this keyframe<br>`;
        html += `Easing: leave blank for linear. Use a curve name for ease-in (e.g. <code>quad</code>) `
            + `or <code>~name</code> for ease-out (e.g. <code>~quad</code>). `
            + `For ease-in-out, add an empty row with <code>~curve</code> easing at the midpoint. `
            + `Available curves: ${EASING_NAMES().join(', ')}.<br>`;
        html += `Command column: use the ⚙ button to set commands reliably. Direct editing supports <b>!</b>commands; for slash commands (e.g. /w) use the ⚙ button instead.`;
        html += `</div>`;

        return html;
    };

    // Format a keyframe time value for display in the handout table
    const fmtTime = (t) => {
        if (typeof t === 'number')  return `=${t}`;
        if (t && 'rel' in t)        return `+${t.rel}`;
        if (t && 'abs' in t)        return `=${t.abs}`;
        return '?';
    };

    // Check if a keyframe's time matches a formatted time string (from button URL)
    const kfTimeMatches = (kf, timeStr) => {
        return fmtTime(kf.time) === timeStr;
    };

    const escHtml = (str) => String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const escArg = (str) => String(str || '').replace(/\s+/g, '-');

    const btnHtml = (label, cmd) => {
        // cmd may or may not start with '!' — normalise to always have exactly one
        const href = cmd.startsWith('!') ? cmd : `!${cmd}`;
        return `<a href="${href}" style="${STYLE.btn}">${escHtml(label)}</a>`;
    };

    // =========================================================================
    // Handout parser
    // =========================================================================

    /**
     * Parse a recording handout's HTML back into a recording object.
     * Returns { name, objectType, duration, notes, keyframes, attrCols } or null on failure.
     */
    const parseHandout = (name, html) => {
        // Decode HTML entities then normalise Roll20-mangled markup.
        // Roll20's editor wraps content in <p> tags, encodes quotes, etc.
        const decode = (s) => String(s)
            .replace(/&amp;/g,  '&')
            .replace(/&lt;/g,   '<')
            .replace(/&gt;/g,   '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g,  "'")
            .replace(/&nbsp;/g, ' ');

        const body = decode(html)
            .replace(/<\/?p[^>]*>/gi, '\n')
            .replace(/<br[^>]*>/gi,   '\n')
            .replace(/\r\n/g, '\n');

        // Helpers — defined early so they're available throughout the parser
        const stripButtons = (s) => String(s).replace(/[⚙✕×]+/g, '').trim();

        const extractCellValue = (cellHtml) => {
            const m = cellHtml.match(/data-value="([^"]*)"/);
            if (m) return m[1]
                .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
                .replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
            return cellHtml.replace(/<[^>]+>/g, '')
                .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
        };

        const recording = {
            name,
            objectType: 'graphic',
            duration:   0,
            notes:      '',
            keyframes:  [],
        };
        const attrCols = [];

        // Strip remaining tags from a string
        const stripTags = (s) => String(s).replace(/<[^>]+>/g, '').trim();

        // Parse metadata — labels are wrapped in <b> tags so we match:
        //   "Object type:</b> graphic"  or  "Object type: graphic"
        // Pattern: label text, optional close tag, whitespace, then the value
        const metaVal = (label) => {
            const re = new RegExp(label + '[^<]*(?:<[^>]+>)?\\s*([^<\\n]+)', 'i');
            const m  = body.match(re);
            return m ? stripTags(m[1]).trim() : null;
        };
        const objTypeVal = metaVal('Object type');
        if (objTypeVal) recording.objectType = objTypeVal;
        // Duration is computed dynamically from keyframes after parsing,
        // so we don't need to store or parse it from the handout.
        const notesVal = metaVal('Notes');
        if (notesVal) recording.notes = notesVal;

        // Parse tables — each table contributes keyframes to the recording
        const tableRe = /<table[^>]*>([\s\S]*?)<\/table>/gi;
        let tableMatch;

        while ((tableMatch = tableRe.exec(body)) !== null) {
            const tableHtml = tableMatch[1];

            // Parse header row to get column order
            const headerMatch = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
            if (!headerMatch) continue;
            const headerHtml = headerMatch[1];
            const headers    = [];
            const thRe       = /<th[^>]*>([\s\S]*?)<\/th>/gi;
            let thMatch;
            while ((thMatch = thRe.exec(headerHtml)) !== null) {
                const cellHtml = thMatch[1];
                // Prefer data-attr span for reliable attribute name extraction
                const spanMatch = cellHtml.match(/data-attr="([^"]+)"/);
                let raw;
                if (spanMatch) {
                    // Strip button chars then extract valid attr name chars
                    const cleaned = stripButtons(spanMatch[1]).match(/^[A-Za-z0-9_:]+/);
                    raw = cleaned ? cleaned[0] : '';
                } else {
                    raw = stripButtons(cellHtml.replace(/<[^>]+>/g, ''));
                }
                headers.push(raw);
                // Collect unique base attribute column names
                // Exclude: time, type, __command marker, :easing suffixes
                // Sanitize: extract only valid attribute name characters
                const RESERVED = new Set(['Time (ms)', 'type', '__command', 'command']);
                if (raw && !RESERVED.has(raw) && !raw.includes(':')) {
                    const sanitized = (raw.match(/^[A-Za-z0-9_]+/) || [''])[0];
                    if (sanitized && !RESERVED.has(sanitized) && !attrCols.includes(sanitized)) {
                        attrCols.push(sanitized);
                    }
                }
            }

            // Parse data rows
            const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
            rowRe.exec(tableHtml); // skip header row
            let rowMatch;
            while ((rowMatch = rowRe.exec(tableHtml)) !== null) {
                const rowHtml = rowMatch[1];
                const cells   = [];
                const tdRe    = /<td[^>]*>([\s\S]*?)<\/td>/gi;
                let tdMatch;
                while ((tdMatch = tdRe.exec(rowHtml)) !== null) {
                    cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
                }
                if (cells.length < 2) continue;

                // Decode time — if NaN, emit a parse-error row
                const rawTime = stripButtons(extractCellValue(cells[0])).trim();

                // Parse time cell — must start with = (absolute) or + (relative):
                //   =number   → absolute literal
                //   =expr     → absolute expression
                //   +number   → relative literal
                //   +expr     → relative expression
                let parsedTime;
                const isRel = rawTime.startsWith('+');
                const isAbs = rawTime.startsWith('=');

                if (!isRel && !isAbs) {
                    recording.keyframes.push({
                        time:    null,
                        type:    'parse-error',
                        error:   `Time must start with = (absolute) or + (relative): "${rawTime}"`,
                        rawCells: cells.join(' | '),
                        deltas:  {},
                        easings: {},
                    });
                    continue;
                }

                const inner = rawTime.slice(1).trim();

                if (isRel) {
                    const numVal = parseFloat(inner);
                    parsedTime = (!isNaN(numVal) && !/[A-Za-z(]/.test(inner))
                        ? { rel: numVal }
                        : { rel: inner, isExpr: true };
                } else {
                    // absolute
                    const numVal = parseFloat(inner);
                    if (!isNaN(numVal) && !/[A-Za-z(]/.test(inner)) {
                        parsedTime = numVal;
                    } else if (/[A-Za-z(]/.test(inner)) {
                        parsedTime = { abs: inner, isExpr: true };
                    } else {
                        recording.keyframes.push({
                            time:    null,
                            type:    'parse-error',
                            error:   `Could not parse time value: "${rawTime}"`,
                            rawCells: cells.join(' | '),
                            deltas:  {},
                            easings: {},
                        });
                        continue;
                    }
                }

                // Type is encoded as class="seq-type-<value>" on the time <td>
                // CSS classes are preserved reliably by Roll20's editor
                const parsedType = stripButtons(extractCellValue(cells[1]));

                const kf = {
                    time:    parsedTime,  // number | {abs,isExpr} | {rel,isExpr}
                    type:    parsedType || 'change',
                    deltas:  {},
                    easings: {},
                };

                let colIdx = 2; // skip time + type columns
                headers.slice(2).forEach((header) => {
                    if (colIdx >= cells.length) return;
                    const rawCell = cells[colIdx++];
                    if (!rawCell) return;
                    // Decode HTML entities Roll20 may have encoded in cell content
                    const cell = stripButtons(rawCell
                        .replace(/&amp;/g,  '&')
                        .replace(/&lt;/g,   '<')
                        .replace(/&gt;/g,   '>')
                        .replace(/&times;/g, '×')
                        .replace(/&#215;/g,  '×')
                        .replace(/&nbsp;/g,  ' '));
                    if (!cell) return;

                    if (header === '__command') {
                        if (cell) {
                            // Restore encoded leading slash (user types &#47; instead of /)
                            // Also handle if Roll20 decoded it to / already
                            kf.command = cell
                                .replace(/^&amp;#47;/,  '/')
                                .replace(/^&#47;/,      '/')
                                .replace(/^&amp;#x2F;/, '/')
                                .replace(/^&#x2F;/,     '/');

                        }
                        return;
                    }

                    if (header.endsWith(':easing')) {
                        const attrName = (header.replace(/:easing$/, '')
                            .match(/^[A-Za-z0-9_]+/) || [''])[0];
                        // Roll20 strips HTML from table cells — read plain text;
                        // Roll20 strips all HTML from table cells on save, so
                        // read the plain text content directly
                        const easingVal = stripButtons(rawCell
                            .replace(/<[^>]+>/g, '')
                            .replace(/&amp;/g,  '&')
                            .replace(/&#40;/g,  '(')
                            .replace(/&#41;/g,  ')')
                            .replace(/&#44;/g,  ',')
                            .replace(/&nbsp;/g, ' ')
                        ).trim();
                        // Only store recognised easing names
                        if (attrName && easingVal && !validateEasingExpr(easingVal)) {
                            kf.easings[attrName] = easingVal;
                        }
                        return;
                    }

                    // Sanitize header to valid attribute name
                    const cleanHeader = (header.match(/^[A-Za-z0-9_]+/) || [''])[0];
                    const reg = getAttrReg(cleanHeader);
                    if (!reg) {
                        kf.cellErrors = kf.cellErrors || {};
                        kf.cellErrors[cleanHeader] = `Unknown attribute "${cleanHeader}"`;
                        return;
                    }

                    try {
                        const parsed = reg.parse(cell);
                        if (parsed === null || parsed === undefined) {
                            kf.cellErrors = kf.cellErrors || {};
                            kf.cellErrors[cleanHeader] = `Could not parse "${cell}"`;
                            return;
                        }
                        if ('delta' in parsed && isNaN(parsed.delta)) {
                            kf.cellErrors = kf.cellErrors || {};
                            kf.cellErrors[cleanHeader] = `Invalid delta "${cell}"`;
                            return;
                        }
                        kf.deltas[cleanHeader] = parsed;
                    } catch(e) {
                        kf.cellErrors = kf.cellErrors || {};
                        kf.cellErrors[cleanHeader] = `Error: ${e.message}`;
                    }
                });

                // Include command and change rows with deltas
                // Also include blank change rows (user may have added them manually)
                if (Object.keys(kf.deltas).length > 0 ||
                    kf.type === 'command' ||
                    kf.type === 'change') {
                    recording.keyframes.push(kf);
                }
            }
        }

        // Compute duration from last keyframe — expression times treated as 0
        // (unknown until runtime) so duration may be underestimated for expr-timed recordings
        let maxTime = 0;
        (recording.keyframes || []).forEach(kf => {
            const t = typeof kf.time === 'number' ? kf.time : 0;
            if (t > maxTime) maxTime = t;
        });
        recording.duration = maxTime;

        return { recording, attrCols };
    };

    // =========================================================================
    // Recording Engine
    // =========================================================================

    /**
     * Start a recording session for an object.
     * @param {string}   objId    Roll20 object ID
     * @param {string}   name     Recording name (or null for unnamed)
     * @param {string[]} attrs    Attributes to record (or null for all)
     */
    const startRecording = (objId, name, attrs, playerid) => {
        const obj = getObj('graphic', objId);
        if (!obj) return false;

        const recordAttrs = attrs || getAllAttrNames('graphic');

        // Snapshot current state (core attrs only — virtual attrs have no get())
        // Virtual attrs get their first value via notifyChange on first callback
        const snapshot = {};
        recordAttrs.forEach(attrName => {
            const reg = getAttrReg(attrName);
            if (reg && reg.objectType === 'graphic') {
                try { snapshot[attrName] = reg.get(obj); } catch(e) { /* virtual */ }
            }
        });

        activeSessions[objId] = {
            name,
            playerid,
            startTime:    Date.now(),
            lastSnapshot: snapshot,
            recordAttrs,
            keyframes:    [],
            paused:       false,
            pausedAt:     null,
        };

        // Subscribe virtual attribute watchers
        recordAttrs.forEach(attrName => {
            const reg = getAttrReg(attrName);
            if (!reg || !reg.startWatch) return;
            reg.startWatch(obj, (currVal) => notifyChange(obj, qualifiedAttrName(reg), currVal));
        });

        return true;
    };

    /**
     * Capture a keyframe for an object based on its current state vs last snapshot.
     * Called from change event handlers.
     */
    const captureKeyframe = (obj) => {
        const objId   = obj.get('id');
        const session = activeSessions[objId];
        if (!session || session.paused) return;

        const now     = Date.now();
        const time    = now - session.startTime;
        const deltas  = {};
        let   changed = false;

        session.recordAttrs.forEach(attrName => {
            const reg = getAttrReg(attrName);
            if (!reg) return;
            const curr  = reg.get(obj);
            const prev  = session.lastSnapshot[attrName];
            const delta = reg.diff(prev, curr);
            if (delta !== null && delta !== undefined) {
                deltas[attrName] = { delta };
                session.lastSnapshot[attrName] = curr;
                changed = true;
            }
        });

        if (!changed) return;

        // Grouped attributes: when one member changes, record identity deltas
        // for its siblings so linear easing produces correct interpolation.
        ATTR_GROUPS.forEach(group => {
            const anyChanged = group.some(a => a in deltas);
            if (!anyChanged) return;
            group.forEach(a => {
                if (a in deltas) return;
                if (!session.recordAttrs.includes(a)) return;
                const reg = getAttrReg(a);
                if (!reg || !reg.identity) return;
                deltas[a] = reg.identity(obj);
                session.lastSnapshot[a] = reg.get(obj);
            });
        });

        // For each attribute that changed in this event, if it has changed
        // before (i.e. it already appears in a prior keyframe), stamp an identity
        // entry onto the immediately preceding keyframe to terminate that lerp
        // segment cleanly. Attributes that are changing for the first time don't
        // need this — there's no prior segment to terminate.
        if (session.keyframes.length > 0) {
            const prevKf = session.keyframes[session.keyframes.length - 1];
            Object.keys(deltas).forEach(attrName => {
                const reg = getAttrReg(attrName);
                if (!reg || reg.lerp === null || !reg.identity) return;
                // Only stamp identity if this attribute has appeared in a prior keyframe
                const appearedBefore = session.keyframes.some(kf => attrName in kf.deltas);
                if (!appearedBefore) return;
                // Don't overwrite if prev keyframe already has an entry for this attr
                if (attrName in prevKf.deltas) return;
                const id = reg.identity(obj);
                if (!id || ('abs' in id && (id.abs === undefined || id.abs === null))) return;
                prevKf.deltas[attrName] = id;
            });
        }

        session.keyframes.push({
            time,
            type:    'change',
            deltas,
            easings: {},
        });

        session.duration = time;
        pingSession(obj, session);
    };

    /**
     * Ping the token's map position to give visual feedback that a keyframe
     * was captured. Only pings for the session's owning player.
     */
    const pingSession = (obj, session) => {
        if (!session.playerid) return;
        sendPing(
            obj.get('left'),
            obj.get('top'),
            session.playerid,
            obj.get('_pageid'),
            false
        );
    };

    /**
     * Notify the recorder that a virtual attribute has changed.
     * Called internally via the notify closure passed to reg.startWatch.
     * External scripts never call this directly — they just call notify(currVal).
     * Handles prevVal tracking internally.
     *
     * @param {object} obj       Roll20 object
     * @param {string} attrName  Registered attribute name (from reg.name)
     * @param {*}      currVal   Current value of the attribute
     */
    const notifyChange = (obj, attrName, currVal) => {
        const objId   = obj.get('id');
        const session = activeSessions[objId];
        if (!session || session.paused) return;

        const reg = getAttrReg(attrName);
        if (!reg) return;

        // First notification — establish baseline, no keyframe emitted
        if (!(attrName in session.lastSnapshot)) {
            session.lastSnapshot[attrName] = currVal;
            return;
        }

        const prevVal = session.lastSnapshot[attrName];
        const delta   = reg.diff(prevVal, currVal);
        if (delta === null || delta === undefined) return;

        session.lastSnapshot[attrName] = currVal;
        const time = Date.now() - session.startTime;

        // Merge into existing keyframe at same timestamp if one exists,
        // otherwise push a new keyframe
        const existing = session.keyframes.find(kf => kf.time === time);
        if (existing) {
            existing.deltas[attrName] = { delta };
        } else {
            session.keyframes.push({
                time,
                type:    'change',
                deltas:  { [attrName]: { delta } },
                easings: {},
            });
        }

        session.duration = time;
        pingSession(obj, session);
    };

    /**
     * Stop recording and return the captured keyframes.
     */
    const stopRecording = (objId) => {
        const session = activeSessions[objId];
        if (!session) return null;

        // Unsubscribe virtual attribute watchers
        const obj = getObj('graphic', objId);
        if (obj) {
            session.recordAttrs.forEach(attrName => {
                const reg = getAttrReg(attrName);
                if (reg && reg.stopWatch) reg.stopWatch(obj);
            });
        }

        delete activeSessions[objId];
        return session;
    };

    const pauseRecording = (objId) => {
        const session = activeSessions[objId];
        if (!session || session.paused) return;
        session.paused   = true;
        session.pausedAt = Date.now();
    };

    const resumeRecording = (objId) => {
        const session = activeSessions[objId];
        if (!session || !session.paused) return;
        // Shift startTime forward by the paused duration so timestamps remain correct
        const pausedDuration = Date.now() - session.pausedAt;
        session.startTime += pausedDuration;
        session.paused    = false;
        session.pausedAt  = null;
    };

    /**
     * Build a recording object from a session and save it to a handout.
     */
    const saveRecording = (name, session, callback, objId) => {
        const recording = {
            name,
            objectType: 'graphic',
            duration:   session.duration || 0,
            notes:      '',
            keyframes:  session.keyframes,
        };

        // Clean snapshot keyframes: only keep attrs that changed in a
        // non-snapshot keyframe BEFORE that snapshot's position.
        recording.keyframes.forEach((kf, idx) => {
            if (!kf._snapshot) return;
            const changedBefore = new Set();
            for (let i = 0; i < idx; i++) {
                if (recording.keyframes[i]._snapshot) continue;
                Object.keys(recording.keyframes[i].deltas || {}).forEach(a => changedBefore.add(a));
            }
            Object.keys(kf.deltas).forEach(attr => {
                if (!changedBefore.has(attr)) delete kf.deltas[attr];
            });
            delete kf._snapshot;
        });

        const attrCols = session.recordAttrs.filter(attr =>
            session.keyframes.some(kf => attr in kf.deltas)
        );

        const handout = getOrCreateHandout(name);
        const html    = generateHandoutHtml(name, recording, attrCols);
        setHandoutNotes(handout, html, name);

        // Cache the parsed recording
        recordingCache[name] = { recording, attrCols };

        if (callback) callback(handout);
        return handout;
    };

    // =========================================================================
    // Playback Engine
    // =========================================================================

    const PLAYBACK_FPS_DEFAULT = 30;
    const PLAYBACK_FPS = (() => {
        const cfg = typeof globalconfig !== 'undefined' && globalconfig.sequence;
        const val = cfg && parseInt(cfg['Playback FPS'], 10);
        return (val && val > 0) ? val : PLAYBACK_FPS_DEFAULT;
    })();
    const PLAYBACK_INTERVAL_MS = Math.round(1000 / PLAYBACK_FPS);

    /**
     * Load a recording from its handout into the cache.
     * Async due to Roll20's handout notes API.
     */
    const loadRecording = (name, callback) => {
        if (recordingCache[name]) {
            recordingCache[name].recording.name = name;
            callback(recordingCache[name]);
            return;
        }
        const handout = findHandout(name);
        if (!handout) {
            log(`${SCRIPT_NAME}: loadRecording — no handout found for "${name}"`);
            callback(null);
            return;
        }

        getHandoutNotes(handout, (html) => {
            if (!html) {
                log(`${SCRIPT_NAME}: loadRecording — handout notes empty for "${name}"`);
                callback(null);
                return;
            }
            log(`${SCRIPT_NAME}: loadRecording — parsing "${name}" (${html.length} chars)`);
            const result = parseHandout(name, html);
            if (!result) {
                log(`${SCRIPT_NAME}: loadRecording — parseHandout returned null for "${name}"`);
                callback(null);
                return;
            }
            const kfCount = (result.recording.keyframes || []).length;
            log(`${SCRIPT_NAME}: loadRecording — "${name}" parsed OK: `
                + `duration=${result.recording.duration}ms, `
                + `keyframes=${kfCount}, `
                + `attrCols=${result.attrCols.join(',')}`);
            recordingCache[name] = result;
            result.recording.name = name;
            callback(result);
        });
    };

    /**
     * Apply a single keyframe's deltas to an object.
     * @param {object}   obj       Roll20 object
     * @param {object}   kf        Keyframe
     * @param {string[]} onlyAttrs Whitelist (null = all)
     * @param {string[]} skipAttrs Blacklist
     */
    const applyKeyframe = (obj, kf, onlyAttrs, skipAttrs) => {
        Object.entries(kf.deltas || {}).forEach(([attrName, parsed]) => {
            if (onlyAttrs && !onlyAttrs.includes(attrName)) return;
            if (skipAttrs &&  skipAttrs.includes(attrName)) return;
            const reg = getAttrReg(attrName);
            if (!reg) return;
            if ('abs' in parsed) {
                reg.set(obj, parsed.abs);
            } else if ('delta' in parsed) {
                reg.apply(obj, parsed.delta);
            }
        });
    };

    /**
     * Interpolate between two keyframes at time t (0–1) for a given attribute.
     */
    const interpolateAttr = (attrName, prevKf, nextKf, t) => {
        const reg = getAttrReg(attrName);
        if (!reg || !reg.lerp) return null; // non-interpolatable

        // We need absolute values to lerp — compute by summing deltas from start
        // This is done in the playback loop which maintains a running state
        return null; // placeholder — see playback loop
    };

    /**
     * Build a running absolute-value state from keyframes up to a given index.
     * Uses each attribute's own reg.apply/reg.set via a shadow object, so
     * multiplicative or otherwise non-additive attributes are handled correctly
     * with no extra work from the registering script.
     *
     * upToIndex of -1 returns initialState unchanged.
     */
    /**
     * Strip easing cells that are redundant due to the identity-delta rule:
     * Scan backward from each identity-delta row (and from an implicit row
     * after the last row), stripping easing from all rows back to and
     * including the last non-identity-delta row.
     *
     * An "identity delta" is a delta that produces no change:
     *   { delta: 0 } for numeric, { delta: 1 } for scale,
     *   or an explicit +0 / ×1 as parsed.
     *
     * Modifies kf.easings in place for the given attrName.
     */
    const isIdentityParsed = (parsed, reg) => {
        if (!parsed) return false; // empty cell — not identity delta
        if ('expr' in parsed) return false; // expressions are never identity
        if ('abs' in parsed) return false; // absolute values are never identity
        if ('delta' in parsed) {
            // For scale, identity delta is 1; for others, 0
            const identDelta = reg && reg.identity ? reg.identity() : { delta: 0 };
            return parsed.delta === (identDelta.delta !== undefined ? identDelta.delta : 0);
        }
        return false;
    };

    /**
     * Sort keyframes preserving relative/expr rows as anchored to their
     * surrounding absolute-literal rows. Only absolute-literal rows are
     * reordered. If the table starts with non-literal rows, a =0 anchor
     * row is inserted.
     */
    const sortKeyframes = (keyframes) => {
        if (!keyframes || keyframes.length === 0) return keyframes;

        const isAbsLiteral = (kf) => typeof kf.time === 'number';

        // If first row is not absolute literal, insert a =0 anchor
        let kfs = keyframes;
        if (!isAbsLiteral(kfs[0])) {
            kfs = [{ time: 0, type: 'change', deltas: {}, easings: {} }, ...kfs];
        }

        // Partition into anchor groups: each group is one abs-literal row
        // plus all non-literal rows that immediately follow it
        const groups = [];
        let currentGroup = null;
        kfs.forEach(kf => {
            if (isAbsLiteral(kf)) {
                currentGroup = { anchor: kf.time, rows: [kf] };
                groups.push(currentGroup);
            } else {
                currentGroup.rows.push(kf);
            }
        });

        // Sort groups by anchor value (stable — preserves relative order within groups)
        groups.sort((a, b) => a.anchor - b.anchor);

        return groups.flatMap(g => g.rows);
    };

    const stripRedundantEasings = (keyframes, attrName) => {
        const reg = getAttrReg(attrName);

        // Build list of "strip trigger" indices:
        // identity-delta rows + implicit sentinel after last row
        const triggers = [];
        keyframes.forEach((kf, i) => {
            const parsed = kf.deltas && kf.deltas[attrName];
            if (isIdentityParsed(parsed, reg)) triggers.push(i);
        });
        triggers.push(keyframes.length); // implicit end-of-table sentinel

        triggers.forEach(triggerIdx => {
            // Scan backward from triggerIdx - 1 (not including the trigger itself)
            // Strip easing until we find and strip the last non-identity-delta row
            for (let i = triggerIdx - 1; i >= 0; i--) {
                const kf     = keyframes[i];
                const parsed = kf.deltas && kf.deltas[attrName];
                // Strip easing from this row
                if (kf.easings && kf.easings[attrName]) {
                    delete kf.easings[attrName];
                }
                // If this row has a non-identity delta, stop here
                if (parsed && !isIdentityParsed(parsed, reg)) break;
            }
        });
    };

    /**
     * Resolve all keyframe timestamps for a playback session upfront.
     * Called at startPlayback and at each loop cycle reset.
     */
    const resolveAllKfTimes = (pb, kfs) => {
        pb.resolvedTimes = {};
        for (let i = 0; i < kfs.length; i++) {
            resolveKfTime(pb, kfs, i);
        }
        pb.duration = kfs.length > 0 ? (pb.resolvedTimes[kfs.length - 1] || 0) : 0;
    };

    /**
     * Resolve the timestamp for keyframe at index i.
     * Caches result in pb.resolvedTimes[i].
     * Time expressions have access to only one variable:
     *   prev — previous resolved timestamp (ms)
     * orig and curr are unavailable: orig is always 0 (write 0 directly),
     * curr has no meaning since timestamps are resolved upfront.
     */
    const resolveKfTime = (pb, kfs, i) => {
        if (pb.resolvedTimes[i] !== undefined) return pb.resolvedTimes[i];

        const kf  = kfs[i];
        const t   = kf.time;

        if (typeof t === 'number') {
            pb.resolvedTimes[i] = t;
            return t;
        }

        const prevResolved = i > 0 ? resolveKfTime(pb, kfs, i - 1) : 0;

        if (!t || (!('rel' in t) && !('abs' in t))) {
            pb.resolvedTimes[i] = prevResolved;
            return prevResolved;
        }

        // Only prev is available in time expressions — evaluate in TIME_EXPR_SCOPE
        const evalTime = (expr) => evalTimeExpr(expr, prevResolved);

        let resolved;
        try {
            if ('rel' in t) {
                const delta = t.isExpr ? evalTime(String(t.rel)) : Number(t.rel);
                resolved = prevResolved + delta;
            } else {
                resolved = t.isExpr ? evalTime(String(t.abs)) : Number(t.abs);
            }
        } catch(e) {
            log(`${SCRIPT_NAME}: time expression error at kf ${i}: ${e.message}`);
            resolved = prevResolved;
        }

        pb.resolvedTimes[i] = resolved;
        return resolved;
    };

    /**
     * Resolve any expression deltas in a keyframe against the given state.
     * Returns a new deltas object with all {expr} entries replaced by
     * concrete {abs} or {delta} values.
     *
     * @param {object} deltas        - raw kf.deltas
     * @param {object} initialState  - pb.initialState (orig)
     * @param {object} prevState     - running state before this keyframe (prev)
     * @param {object} liveObj       - Roll20 graphic object (curr)
     */
    const resolveDeltas = (deltas, initialState, prevState, liveObj, cumulative, t, memo) => {
        const resolved = {};
        Object.entries(deltas || {}).forEach(([attrName, parsed]) => {
            if (!parsed || !parsed.expr) { resolved[attrName] = parsed; return; }
            const reg  = getAttrReg(attrName);
            if (!reg)  { resolved[attrName] = parsed; return; }

            const orig = initialState[attrName] !== undefined ? initialState[attrName] : 0;
            const prev = prevState[attrName]    !== undefined ? prevState[attrName]    : orig;
            const curr = liveObj ? (reg.get(liveObj) || 0) : prev;

            try {
                const val = evalExpr(parsed.expr, orig, prev, curr,
                    { obj: liveObj, t: t || 0, memo: memo || null, isContinuousSegment: false, cumulative: cumulative || {} });
                if (parsed.mode === 'abs') {
                    resolved[attrName] = { abs: val };
                } else if (parsed.mode === 'mul') {
                    resolved[attrName] = { delta: val };
                } else {
                    // add mode — apply sign
                    resolved[attrName] = { delta: (parsed.sign || 1) * val };
                }
            } catch(e) {
                log(`${SCRIPT_NAME}: expression error for ${attrName}: ${e.message}`);
                resolved[attrName] = parsed; // leave unresolved, skip gracefully
            }
        });
        return resolved;
    };

    const makeShadow = (initialState) => ({
        _state: Object.assign({}, initialState),
        get(k)    { return this._state[k]; },
        set(k, v) { this._state[k] = v; },
    });

    const buildRunningState = (keyframes, upToIndex, initialState) => {
        const shadow = makeShadow(initialState);
        for (let i = 0; i <= upToIndex && i < keyframes.length; i++) {
            if (keyframes[i].type === 'parse-error') continue;
            Object.entries(keyframes[i].deltas || {}).forEach(([attrName, parsed]) => {
                if (!parsed) return;
                const reg = getAttrReg(attrName);
                if (!reg) return;
                if ('abs' in parsed)   reg.set(shadow, parsed.abs);
                else if ('delta' in parsed) reg.apply(shadow, parsed.delta);
            });
        }
        return shadow._state;
    };

    /**
     * Start playback of a recording on an object.
     */
    const startPlayback = (objId, recording, attrCols, opts) => {
        const obj = getObj('graphic', objId);
        if (!obj) return false;

        const keyframes = recording.keyframes || [];
        if (keyframes.length === 0) return false;

        // Snapshot current state as the "zero point" for delta application
        const initialState = {};
        attrCols.forEach(attrName => {
            const reg = getAttrReg(attrName);
            if (!reg) return;
            const val = reg.get(obj);
            // Sanitize: numeric attrs default to 0 if empty/NaN, parseFloat if string
            if (reg.valueType === 'number') {
                const n = parseFloat(val);
                initialState[attrName] = isNaN(n) ? 0 : n;
            } else {
                initialState[attrName] = val;
            }
        });

        const pb = {
            recordingName: recording.name,
            keyframes,
            startTime:     Date.now() - (opts.offset || 0),
            speed:         opts.speed   || 1.0,
            loop:          opts.loop    || false,
            // loopMode: 'reset' (snap back to initialState each cycle) or
            //           'accumulate' (new initialState = end state of prev cycle)
            loopMode:      opts.loopMode || 'reset',
            loopsLeft:     opts.loops   !== undefined ? opts.loops : null,
            reverse:       opts.reverse || false,
            easing:        opts.easing  || null,
            onlyAttrs:     opts.only    || null,
            skipAttrs:     opts.exclude || null,
            duration:      0,
            paused:        false,
            pausedAt:      null,
            preview:       opts.preview  || false,
            silent:        opts.silent   || false,
            playerid:      opts.playerid || null,
            cumulative:    {},  // per-playback scratchpad for registered functions
            resolvedTimes: [0], // resolvedTimes[i] = resolved timestamp for kf[i]
            currentEasings: {}, // per-attribute current easing, updated as empty-row easing switches are crossed
            initialState,
            lastKfIndex:   -1,
        };
        // Pre-compute absolute state at each keyframe index for fast lookup.
        // Uses the shadow object so reg.apply handles multiplicative attrs correctly.
        // runningStates[0] = initialState, runningStates[i+1] = after keyframe i.
        const shadow = makeShadow(initialState);
        const runningStates = [Object.assign({}, shadow._state)];
        keyframes.forEach(kf => {
            const resolved = resolveDeltas(kf.deltas, initialState, shadow._state, obj, {}, 0, {});
            Object.entries(resolved || {}).forEach(([attrName, parsed]) => {
                if (!parsed) return;
                const reg = getAttrReg(attrName);
                if (!reg) return;
                if ('abs' in parsed)        reg.set(shadow, parsed.abs);
                else if ('delta' in parsed) reg.apply(shadow, parsed.delta);
            });
            runningStates.push(Object.assign({}, shadow._state));
        });
        pb.runningStates = runningStates;

        // Resolve all keyframe timestamps upfront so lerp durations are known
        // before the first tick fires
        resolveAllKfTimes(pb, pb.keyframes);

        activePlayback[objId] = pb;

        // Start interval
        playbackIntervals[objId] = setInterval(
            () => tickPlayback(objId),
            PLAYBACK_INTERVAL_MS
        );

        return true;
    };

    /**
     * Single playback tick — called at PLAYBACK_FPS.
     *
     * All attributes are driven from absolute values derived by accumulating
     * deltas from initialState. This avoids double-application bugs that arise
     * from mixing delta-based applyKeyframe with absolute-based lerp.
     *
     * Step attributes (non-lerp-able) are applied once when their keyframe
     * timestamp is first crossed. Lerp attributes are interpolated every tick
     * between the surrounding keyframes.
     */
    const tickPlayback = (objId) => {
        const pb  = activePlayback[objId];
        if (!pb || pb.paused) return;

        const obj = getObj('graphic', objId);
        if (!obj) { stopPlayback(objId); return; }

        const kfs = pb.reverse ? [...pb.keyframes].reverse() : pb.keyframes;

        const elapsed  = (Date.now() - pb.startTime) * pb.speed;
        const duration = pb.duration;
        if (duration <= 0) { stopPlayback(objId); return; }

        let t = elapsed;
        let stopping = false;

        if (t >= duration) {
            if (pb.loop || (pb.loopsLeft !== null && pb.loopsLeft > 0)) {
                if (pb.loopsLeft !== null) pb.loopsLeft--;
                if (pb.loopMode === 'accumulate') {
                    // New initialState = state at end of this cycle
                    // runningStates last entry = state after all keyframes
                    pb.initialState = pb.runningStates[pb.runningStates.length - 1];
                    // Recompute runningStates from the new initialState
                    const shadow = makeShadow(pb.initialState);
                    const newRS  = [Object.assign({}, shadow._state)];
                    pb.keyframes.forEach(kf => {
                        Object.entries(kf.deltas || {}).forEach(([attrName, parsed]) => {
                            if (!parsed) return;
                            const reg = getAttrReg(attrName);
                            if (!reg) return;
                            if ('abs' in parsed)        reg.set(shadow, parsed.abs);
                            else if ('delta' in parsed) reg.apply(shadow, parsed.delta);
                        });
                        newRS.push(Object.assign({}, shadow._state));
                    });
                    pb.runningStates = newRS;
                }
                pb.startTime      = Date.now();
                pb.lastKfIndex    = -1;
                pb.memoCache      = {}; // reset function memo on next loop
                pb.cumulative     = {}; // reset scratchpad each loop cycle
                pb.currentEasings = {}; // reset easing switches each loop cycle
                pb.rotNudgeDir    = 1;  // reset nudge direction each loop
                // Re-resolve all timestamps for this loop cycle
                resolveAllKfTimes(pb, kfs);
                t = 0;
            } else {
                t = duration;
                stopping = true;
            }
        }

        // Snap t to the final keyframe if within half a tick AND we're already
        // past the second-to-last keyframe (i.e. in the final segment).
        // This ensures the last segment completes without snapping past intermediate keyframes.
        const HALF_TICK = PLAYBACK_INTERVAL_MS / 2;
        const lastKfTime = pb.resolvedTimes[kfs.length - 1];
        const secondLastKfTime = kfs.length >= 2 ? pb.resolvedTimes[kfs.length - 2] : 0;
        if (lastKfTime !== undefined && t >= secondLastKfTime && Math.abs(lastKfTime - t) <= HALF_TICK) {
            t = lastKfTime;
        }

        // Normalized time (0-1) for expression scope
        const tNorm = t / duration;

        let prevIdx = -1;
        let nextIdx = kfs.length;
        for (let i = 0; i < kfs.length; i++) {
            const rt = pb.resolvedTimes[i] !== undefined
                ? pb.resolvedTimes[i] : (typeof kfs[i].time === 'number' ? kfs[i].time : Infinity);
            if (rt <= t) prevIdx = i;
            else { nextIdx = i; break; }
        }

        // runningStates[0] = initialState, runningStates[i+1] = after kf[i]
        // So state after kf at index i = pb.runningStates[i+1]
        // State before any keyframe = pb.runningStates[0]
        const rs = pb.runningStates;
        const stateAt = (idx) => rs[idx + 1] || rs[0]; // idx -1 → rs[0]

        // ── Command keyframes, step attributes, and easing switches ─────────────
        for (let i = pb.lastKfIndex + 1; i <= prevIdx; i++) {
            const kf = kfs[i];

            // Skip parse-error rows entirely during playback
            if (kf.type === 'parse-error') continue;

            // Track easing switches from empty-row easing cells
            // An empty-row easing (no delta for this attr) switches the current easing
            // for future lerps of that attribute
            Object.entries(kf.easings || {}).forEach(([attrName, easingExpr]) => {
                if (!easingExpr) return;
                const hasDelta = kf.deltas && attrName in kf.deltas;
                if (!hasDelta) {
                    pb.currentEasings[attrName] = easingExpr;
                }
            });

            // Fire command keyframes
            if (kf.type === 'command' && kf.command) {
                const cmd = kf.command
                    .replace(/\{\{tokenId\}\}/g,   obj.get('id'))
                    .replace(/\{\{tokenName\}\}/g, obj.get('name') || '');
                // Send as the player who started playback so permissions and
                // whisper targets work correctly. Fall back to 'gm' if unavailable.
                let sender = 'gm';
                if (pb.playerid) {
                    const player = getObj('player', pb.playerid);
                    if (player) sender = player.get('_displayname') || 'gm';
                }
                sendChat(sender, cmd);
            }

            // Apply step (non-lerp) attributes
            if (kf.type !== 'command') {
                const prevState = stateAt(i - 1);
                const state     = stateAt(i);
                // Resolve any expression deltas before applying
                const resolvedDeltas = resolveDeltas(kf.deltas, pb.initialState, prevState, obj, pb.cumulative, tNorm, {});
                // Re-apply with resolved deltas via shadow
                const shadow = makeShadow(prevState);
                Object.entries(resolvedDeltas || {}).forEach(([attrName, parsed]) => {
                    if (!parsed) return;
                    const reg = getAttrReg(attrName);
                    if (!reg || reg.lerp !== null) return;
                    if ('abs' in parsed)        reg.set(shadow, parsed.abs);
                    else if ('delta' in parsed) reg.apply(shadow, parsed.delta);
                });
                Object.keys(resolvedDeltas || {}).forEach(attrName => {
                    if (pb.onlyAttrs && !pb.onlyAttrs.includes(attrName)) return;
                    if (pb.skipAttrs &&  pb.skipAttrs.includes(attrName)) return;
                    const reg = getAttrReg(attrName);
                    if (!reg || reg.lerp !== null) return;
                    const val = shadow._state[attrName];
                    if (val !== undefined) reg.set(obj, val);
                });
            }
        }
        pb.lastKfIndex = prevIdx;

        // ── Lerp attributes ──────────────────────────────────────────────────
        // Collect lerp-able attrs that appear anywhere in the recording
        const lerpAttrs = new Set();
        kfs.forEach(kf => {
            Object.keys(kf.deltas || {}).forEach(attrName => {
                const reg = getAttrReg(attrName);
                if (reg && reg.lerp !== null) lerpAttrs.add(attrName);
            });
        });

        const batchSet = {};
        lerpAttrs.forEach(attrName => {
            if (pb.onlyAttrs && !pb.onlyAttrs.includes(attrName)) return;
            if (pb.skipAttrs &&  pb.skipAttrs.includes(attrName)) return;

            const reg     = getAttrReg(attrName);
            if (!reg || !reg.lerp) return;

            // Per-attribute segment: find the prev and next keyframes that
            // actually define a delta for this attribute (not the global prevIdx/nextIdx)
            let attrPrevIdx = -1;
            let attrNextIdx = kfs.length;
            for (let i = 0; i < kfs.length; i++) {
                const rt = pb.resolvedTimes[i] !== undefined
                    ? pb.resolvedTimes[i] : (typeof kfs[i].time === 'number' ? kfs[i].time : Infinity);
                const hasDelta = kfs[i].deltas && attrName in kfs[i].deltas;
                if (rt <= t && hasDelta) attrPrevIdx = i;
                else if (rt > t && hasDelta && attrNextIdx === kfs.length) attrNextIdx = i;
            }

            const attrPrevState = stateAt(attrPrevIdx);
            const prevVal = attrPrevState[attrName];
            if (prevVal === undefined) return;

            let interpolated;
            if (attrNextIdx < kfs.length) {
                const nextKf = kfs[attrNextIdx];
                // Resolve expression if needed to get the target value
                let nextParsed = nextKf.deltas[attrName];
                if (nextParsed && nextParsed.expr) {
                    const srcEasing = attrPrevIdx >= 0 && kfs[attrPrevIdx].easings && kfs[attrPrevIdx].easings[attrName]
                        ? kfs[attrPrevIdx].easings[attrName]
                        : (pb.currentEasings[attrName] || pb.easing || 'step');
                    const isContinuous = srcEasing === 'continuous';
                    const orig = pb.initialState[attrName] !== undefined ? pb.initialState[attrName] : 0;
                    const prev = attrPrevState[attrName] !== undefined ? attrPrevState[attrName] : orig;

                    // Per-segment memo cache for function memoization
                    const memoKey = `${attrNextIdx}:${attrName}`;
                    if (!pb.memoCache) pb.memoCache = {};
                    if (!pb.memoCache[memoKey]) pb.memoCache[memoKey] = {};
                    const memo = pb.memoCache[memoKey];

                    try {
                        const val = evalExpr(nextParsed.expr, orig, prev, undefined,
                            { obj, reg, t: tNorm, memo, isContinuousSegment: isContinuous, cumulative: pb.cumulative || {} });
                        let resolved = nextParsed.mode === 'abs' ? { abs: val }
                            : nextParsed.mode === 'mul' ? { delta: val }
                            : { delta: (nextParsed.sign || 1) * val };
                        // In continuous segments, use resolved value directly (no lerp)
                        if (isContinuous) {
                            const shadow = makeShadow(attrPrevState);
                            if ('abs' in resolved)        reg.set(shadow, resolved.abs);
                            else if ('delta' in resolved) reg.apply(shadow, resolved.delta);
                            interpolated = shadow._state[attrName];
                        } else {
                            // Non-continuous: memoization ensures same result each tick,
                            // so we can use it as the lerp target
                            nextParsed = resolved;
                        }
                    } catch(e) {
                        log(`${SCRIPT_NAME}: lerp expr error for ${attrName}: ${e.message}`);
                    }
                }
                if (interpolated === undefined) {
                    // Normal lerp path (non-continuous expressions or non-expression deltas)
                    const shadow = makeShadow(attrPrevState);
                    if (nextParsed && 'abs' in nextParsed)        reg.set(shadow, nextParsed.abs);
                    else if (nextParsed && 'delta' in nextParsed) reg.apply(shadow, nextParsed.delta);
                    const nextVal    = shadow._state[attrName];
                    const attrPrevTime = attrPrevIdx >= 0
                        ? (pb.resolvedTimes[attrPrevIdx] !== undefined ? pb.resolvedTimes[attrPrevIdx] : (typeof kfs[attrPrevIdx].time === 'number' ? kfs[attrPrevIdx].time : 0))
                        : 0;
                    const attrNextTime = pb.resolvedTimes[attrNextIdx] !== undefined
                        ? pb.resolvedTimes[attrNextIdx]
                        : (typeof nextKf.time === 'number' ? nextKf.time : attrPrevTime);
                    const segDur     = attrNextTime - attrPrevTime;
                    const segElapsed = t - attrPrevTime;
                    const segT       = segDur > 0 ? segElapsed / segDur : 1;
                    const lerpEasing = attrPrevIdx >= 0 && kfs[attrPrevIdx].easings && kfs[attrPrevIdx].easings[attrName]
                        ? kfs[attrPrevIdx].easings[attrName]
                        : (pb.currentEasings[attrName] || pb.easing || 'step');
                    interpolated = reg.lerp(prevVal, nextVal, getEasing(lerpEasing)(segT));
                }
            } else {
                // Past the last keyframe for this attribute — apply its final value
                if (attrPrevIdx >= 0) {
                    const lastParsed = kfs[attrPrevIdx].deltas && kfs[attrPrevIdx].deltas[attrName];
                    if (lastParsed && lastParsed.expr) {
                        // Resolve expression for the final state
                        const orig = pb.initialState[attrName] !== undefined ? pb.initialState[attrName] : 0;
                        const prevState = attrPrevIdx > 0 ? stateAt(attrPrevIdx - 1) : pb.runningStates[0];
                        const prev = prevState[attrName] !== undefined ? prevState[attrName] : orig;
                        const memoKey = `final:${attrPrevIdx}:${attrName}`;
                        if (!pb.memoCache) pb.memoCache = {};
                        if (!pb.memoCache[memoKey]) pb.memoCache[memoKey] = {};
                        try {
                            const val = evalExpr(lastParsed.expr, orig, prev, undefined,
                                { obj, reg, t: tNorm, memo: pb.memoCache[memoKey], isContinuousSegment: false, cumulative: pb.cumulative || {} });
                            const resolved = lastParsed.mode === 'abs' ? { abs: val }
                                : lastParsed.mode === 'mul' ? { delta: val }
                                : { delta: (lastParsed.sign || 1) * val };
                            const shadow = makeShadow(attrPrevState);
                            if ('abs' in resolved)        reg.set(shadow, resolved.abs);
                            else if ('delta' in resolved) reg.apply(shadow, resolved.delta);
                            interpolated = shadow._state[attrName];
                        } catch(e) {
                            interpolated = prevVal;
                        }
                    } else {
                        interpolated = prevVal;
                    }
                } else {
                    interpolated = prevVal;
                }
            }

            // Collect position attrs for batching with rotation nudge
            if (attrName === 'left' || attrName === 'top') {
                if (interpolated !== undefined) batchSet[attrName] = interpolated;
            } else if (attrName === 'rotation') {
                if (reg.valueType === 'number' && isNaN(interpolated)) return;
                batchSet.rotation = ((interpolated % 360) + 360) % 360;
            } else if (reg.namespace === 'core') {
                if (reg.valueType === 'number' && isNaN(interpolated)) return;
                if (interpolated && typeof interpolated === 'object') {
                    interpolated = interpolated.toHex ? interpolated.toHex() : String(interpolated);
                }
                batchSet[attrName] = interpolated;
            } else {
                if (reg.valueType === 'number' && isNaN(interpolated)) return;
                reg.set(obj, interpolated);
            }
        });

        // hasRealRotation = rotation is actually changing in the current segment
        const hasPositionLerp = lerpAttrs.has('left') || lerpAttrs.has('top');
        const hasRealRotation = (() => {
            if (!lerpAttrs.has('rotation')) return false;
            // Find next keyframe that defines rotation
            for (let i = 0; i < kfs.length; i++) {
                const rt = pb.resolvedTimes[i] !== undefined
                    ? pb.resolvedTimes[i] : (typeof kfs[i].time === 'number' ? kfs[i].time : Infinity);
                if (rt <= t) continue;
                const d = kfs[i].deltas && kfs[i].deltas['rotation'];
                if (!d) continue;
                if ('abs' in d) return true;
                if ('delta' in d) return d.delta !== 0;
                return !!d.expr;
            }
            return false;
        })();

        // Batch position updates with rotation nudge in a single obj.set()
        // so Roll20 renders position immediately rather than batching it
        if (Object.keys(batchSet).length > 0) {
            if (hasPositionLerp && !hasRealRotation && !stopping) {
                const rot = typeof batchSet.rotation === 'number' ? batchSet.rotation : (parseFloat(obj.get('rotation')) || 0);
                pb.rotNudgeDir = pb.rotNudgeDir === 1 ? -1 : 1;
                const nudged = rot + 0.001 * pb.rotNudgeDir;
                if (!isNaN(nudged)) batchSet.rotation = nudged;
            }
            // Strip any NaN numeric values before sending to Firebase
            Object.keys(batchSet).forEach(k => { if (typeof batchSet[k] === 'number' && isNaN(batchSet[k])) delete batchSet[k]; });
            if (Object.keys(batchSet).length > 0) obj.set(batchSet);
        } else if (hasPositionLerp && !hasRealRotation && !stopping) {
            const rot = parseFloat(obj.get('rotation')) || 0;
            pb.rotNudgeDir = pb.rotNudgeDir === 1 ? -1 : 1;
            const nudged = rot + 0.001 * pb.rotNudgeDir;
            if (!isNaN(nudged)) obj.set('rotation', nudged);
        }

        if (stopping) {
            const playerid = pb.playerid;
            const recName  = pb.recordingName;
            stopPlayback(objId); // auto-reverts if preview:true
            // Send the stopped/reverted menu to the owning player (unless silent)
            if (playerid && !pb.silent) sendPlaybackMenuTo(playerid, objId, recName);
        }
    };

    // Last known initialState per object — persists after playback ends so
    // the revert button can restore the token to its pre-playback state.
    const lastInitialState = {};

    const stopPlayback = (objId, forceRevert) => {
        if (playbackIntervals[objId]) {
            clearInterval(playbackIntervals[objId]);
            delete playbackIntervals[objId];
        }
        const pb = activePlayback[objId];
        if (pb) {
            lastInitialState[objId] = pb.initialState;
            // Auto-revert if preview mode and not looping
            if (forceRevert || (pb.preview && !pb.loop)) {
                revertPlayback(objId);
            }
        }
        delete activePlayback[objId];
    };

    /**
     * Revert a token to its state at the start of the last playback.
     */
    const revertPlayback = (objId) => {
        const obj   = getObj('graphic', objId);
        const state = lastInitialState[objId];
        if (!obj || !state) return false;
        Object.entries(state).forEach(([attrName, val]) => {
            const reg = getAttrReg(attrName);
            if (reg && val !== undefined) reg.set(obj, val);
        });
        return true;
    };

    const pausePlayback = (objId) => {
        const pb = activePlayback[objId];
        if (!pb || pb.paused) return;
        pb.paused   = true;
        pb.pausedAt = Date.now();
    };

    const resumePlayback = (objId) => {
        const pb = activePlayback[objId];
        if (!pb || !pb.paused) return;
        pb.startTime += Date.now() - pb.pausedAt;
        pb.paused    = false;
        pb.pausedAt  = null;
    };

    // =========================================================================
    // Chat helpers
    // =========================================================================

    const reply = (msg, tag, text, noarchive = false) => {
        const body      = text !== undefined ? text : tag;
        const prefix    = text !== undefined ? ` [${tag}]` : '';
        const player    = getObj('player', msg.playerid);
        const recipient = player ? player.get('_displayname') : msg.who.replace(' (GM)', '');
        sendChat(`${SCRIPT_NAME}${prefix}`, `/w "${recipient}" ${body}`,
            null, noarchive ? { noarchive: true } : undefined);
    };

    const replyError = (msg, text) => reply(msg, 'Error', text);

    const resolveObjIds = (msg, flags, extras) => {
        const fromSelected = flags.has('ignore-selected')
            ? []
            : (msg.selected || []).map(s => s._id);
        return [...fromSelected, ...extras].filter(id => !!getObj('graphic', id));
    };

    // =========================================================================
    // Playback menu
    // =========================================================================

    const showRecordingMenu = (msg, objIds) => {
        objIds.forEach(objId => {
            const session = activeSessions[objId];
            const obj     = getObj('graphic', objId);
            if (!obj) return;

            const tokenName = obj.get('name') || objId;
            const recName   = session ? (session.name || '(unnamed)') : '—';
            const status    = !session ? 'stopped'
                : session.paused ? 'paused' : 'recording';
            const elapsed   = session && !session.paused
                ? Math.round(Date.now() - session.startTime) : 0;
            const kfCount   = session ? session.keyframes.length : 0;

            const tokenImgsrc = obj.get('imgsrc') || '';
            const tokenThumb  = tokenImgsrc
                ? `<img src="${tokenImgsrc}" style="width:36px;height:36px;border-radius:3px;vertical-align:middle;margin-right:5px;">`
                : '';

            let html = `<div style="background:#622;color:#fff;padding:6px;border-radius:4px;font-size:12px;">`;
            html += `${tokenThumb}<b>${escHtml(tokenName)}</b><br>`;
            html += `Recording: <b>${escHtml(recName)}</b><br>`;
            html += `Status: <b>${status}</b>`;
            if (session) html += ` &nbsp; ${elapsed}ms &nbsp; ${kfCount} keyframe${kfCount !== 1 ? 's' : ''}`;
            html += `<br><br>`;

            if (session) {
                if (session.paused) {
                    html += btnHtml('▶ Resume', `${CMD_TOKEN} resume ignore-selected ${objId}`);
                } else {
                    html += btnHtml('⏸ Pause',  `${CMD_TOKEN} pause ignore-selected ${objId}`);
                }
                html += btnHtml('📸 Snapshot', `${CMD_TOKEN} snapshot ignore-selected ${objId}`);
                html += btnHtml('⏹ Stop', `${CMD_TOKEN} stop ignore-selected ${objId}`);
            }
            html += btnHtml('🔄 Refresh', `${CMD_TOKEN} recording-menu ignore-selected ${objId}`);
            html += `</div>`;

            reply(msg, 'Recording', html, true);
        });
    };

    /**
     * Send the playback menu whisper directly to a player by ID, without
     * needing a msg object. Used by tickPlayback when playback ends naturally.
     */
    const sendPlaybackMenuTo = (playerid, objId, recName) => {
        const player = getObj('player', playerid);
        if (!player) return;
        // Build a minimal fake msg so showPlaybackMenu can use reply()
        const fakeName = player.get('_displayname') || player.get('displayname') || 'gm';
        const fakeMsg  = { who: fakeName, playerid };
        showPlaybackMenu(fakeMsg, [objId], recName);
    };

    /**
     * Show the playback menu for one or more objects.
     * @param {object}      msg      Roll20 chat message
     * @param {string[]}    objIds   Object IDs to show menus for
     * @param {string|null} recName  Optional recording name — shown even if not
     *                               currently playing, with a Play button ready
     */
    const showPlaybackMenu = (msg, objIds, recName) => {
        objIds.forEach(objId => {
            const pb  = activePlayback[objId];
            const obj = getObj('graphic', objId);
            if (!obj) return;

            const tokenName   = obj.get('name') || objId;
            // Prefer active playback's recording name, then caller-supplied name
            const displayName = pb ? pb.recordingName : (recName || null);
            const status      = !pb ? (recName ? 'ready' : 'stopped')
                : pb.paused ? 'paused' : 'playing';
            const elapsed     = pb && !pb.paused
                ? Math.round((Date.now() - pb.startTime) * pb.speed) : 0;
            const dur         = pb ? pb.duration : 0;

            // Refresh button always includes the recording name if we have one
            const refreshCmd  = displayName
                ? `${CMD_TOKEN} playback-menu ${escArg(displayName)} ignore-selected ${objId}`
                : `${CMD_TOKEN} playback-menu ignore-selected ${objId}`;

            const tokenImgsrc = obj.get('imgsrc') || '';
            const tokenThumb  = tokenImgsrc
                ? `<img src="${tokenImgsrc}" style="width:36px;height:36px;border-radius:3px;vertical-align:middle;margin-right:5px;">`
                : '';

            let html = `<div style="background:#222;color:#fff;padding:6px;border-radius:4px;font-size:12px;">`;
            html += `${tokenThumb}<b>${escHtml(tokenName)}</b><br>`;
            if (displayName) {
                const handout = findHandout(displayName);
                const openLink = handout ? ` <a href="http://journal.roll20.net/handout/${handout.get('id')}">[open]</a>` : '';
                html += `Recording: <b>${escHtml(displayName)}</b>${openLink}<br>`;
            }
            html += `Status: <b>${status}</b>`;
            if (pb) html += ` &nbsp; ${elapsed}ms / ${dur}ms`;
            html += `<br><br>`;

            if (pb) {
                // ── Active playback controls ──────────────────────────────
                if (pb.paused) {
                    html += btnHtml('▶ Resume', `${CMD_TOKEN} resume-play ignore-selected ${objId}`);
                } else {
                    html += btnHtml('⏸ Pause', `${CMD_TOKEN} pause-play ignore-selected ${objId}`);
                }
                // Stop label depends on preview mode
                const stopLabel = pb.preview ? '⏹ Stop+Revert' : '⏹ Stop';
                html += btnHtml(stopLabel, `${CMD_TOKEN} stop-play ignore-selected ${objId}`);
                if (!pb.preview) {
                    html += btnHtml('⏮ Restart', `${CMD_TOKEN} play ${escArg(pb.recordingName)} ignore-selected ${objId}`);
                }
                // Loop toggle — cycles OFF → Reset → Accumulate → OFF
                const loopLabel = !pb.loop ? '⟳ Loop: OFF'
                    : pb.loopMode === 'accumulate' ? '⟳ Loop: Accumulate'
                    : '⟳ Loop: Reset';
                const loopRecArg = displayName ? ` ${escArg(displayName)}` : '';
                html += btnHtml(loopLabel, `${CMD_TOKEN} toggle-loop${loopRecArg} ignore-selected ${objId}`);
            } else {
                // ── Stopped / ready controls ──────────────────────────────
                if (displayName) {
                    html += btnHtml('▶ Play',    `${CMD_TOKEN} play ${escArg(displayName)} ignore-selected ${objId}`);
                    html += btnHtml('🔁 Loop',   `${CMD_TOKEN} play ${escArg(displayName)} --loop ignore-selected ${objId}`);
                    html += btnHtml('👁 Preview', `${CMD_TOKEN} preview ${escArg(displayName)} ignore-selected ${objId}`);
                }
                // Revert only shown if there's a state to revert to
                if (lastInitialState[objId]) {
                    html += btnHtml('↩ Revert', `${CMD_TOKEN} revert ignore-selected ${objId}`);
                }
            }
            html += btnHtml('🔄 Refresh', refreshCmd);
            html += `</div>`;

            reply(msg, 'Playback', html, true);
        });
    };

    // =========================================================================
    // Command handler
    // =========================================================================

    const handleInput = (msg) => {
        if (msg.type !== 'api') return;
        if (msg.content.split(' ')[0] !== CMD_TOKEN) return;
        if (!playerIsGM(msg.playerid) && msg.playerid !== 'API') {
            replyError(msg, 'Only the GM can use Sequence commands.');
            return;
        }

        // ScriptKit handles help, whatsnew, gen-help, gen-dev-docs
        if (typeof ScriptKit !== 'undefined' && ScriptKit.handleInput(msg)) return;

        try {
            const raw    = msg.content.slice(CMD_TOKEN.length).trim().split(/\s+/).filter(Boolean);
            const cmd    = raw[0];
            const rest   = raw.slice(1);

            // Parse flags and plain args
            const flags  = new Set();
            const args   = [];
            const opts   = {};

            rest.forEach((tok, i) => {
                if (tok === 'ignore-selected') { flags.add('ignore-selected'); return; }
                if (tok.startsWith('--')) {
                    const [k, v] = tok.slice(2).split('=');
                    if (v !== undefined) opts[k] = v;
                    else opts[k] = rest[i + 1] || true; // next token as value
                    flags.add(k);
                    return;
                }
                args.push(tok);
            });

            // Resolve object IDs (anything that looks like a Roll20 ID in args)
            // Roll20 IDs start with '-' and contain alphanumeric, underscore, hyphen.
            // Don't validate via getObj here — objects may not be loaded yet after
            // sandbox restart. resolveObjIds filters out non-existent objects.
            const isRollId = (a) => /^-[A-Za-z0-9_-]+$/.test(a);
            const idArgs  = args.filter(isRollId);
            const nonIds  = args.filter(a => !isRollId(a));
            const objIds  = resolveObjIds(msg, flags, idArgs);

            // ----------------------------------------------------------------
            if (cmd === 'record') {
                const name = nonIds[0] || null;
                const attrFilter = opts.attrs ? opts.attrs.split(',') : null;
                if (objIds.length === 0) {
                    replyError(msg, 'Select or specify at least one token to record.');
                    return;
                }
                let started = 0;
                objIds.forEach(id => {
                    if (startRecording(id, name, attrFilter, msg.playerid)) started++;
                });
                const startedIds = objIds.filter(id => activeSessions[id]);
                showRecordingMenu(msg, startedIds);
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'stop') {
                if (objIds.length === 0) {
                    replyError(msg, 'Select or specify at least one token.');
                    return;
                }
                objIds.forEach(id => {
                    const session = stopRecording(id);
                    if (!session) return;
                    if (session.name) {
                        saveRecording(session.name, session, (handout) => {
                            const recipient = msg.who.split(' ')[0];
                            const handoutId = handout.get('id');
                            let outMsg = `Stopped and saved <b>${escHtml(session.name)}</b> — `
                                + `${session.keyframes.length} keyframes, ${session.duration}ms.<br>`;
                            outMsg += btnHtml('▶ Play', `!sequence play ${escArg(session.name)}`) + ' ';
                            outMsg += btnHtml('🔁 Loop', `!sequence play ${escArg(session.name)} --loop`) + ' ';
                            outMsg += `<a href="http://journal.roll20.net/handout/${handoutId}">[open]</a>`;
                            sendChat(`${SCRIPT_NAME} [Record]`, `/w ${recipient} ${outMsg}`);
                        }, id);
                    } else {
                        const recipient = msg.who.split(' ')[0];
                        sendChat(`${SCRIPT_NAME} [Record]`,
                            `/w ${recipient} Stopped recording `
                            + `(${session.keyframes.length} keyframes, ${session.duration}ms). `
                            + `Use <code>!sequence save &lt;name&gt;</code> to save it.`);
                        s().unsavedSessions = s().unsavedSessions || {};
                        s().unsavedSessions[id] = session;
                    }
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'pause') {
                objIds.forEach(id => pauseRecording(id));
                showRecordingMenu(msg, objIds);
                return;
            }

            if (cmd === 'resume') {
                objIds.forEach(id => resumeRecording(id));
                showRecordingMenu(msg, objIds);
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'snapshot') {
                objIds.forEach(id => {
                    const session = activeSessions[id];
                    if (!session || session.paused) return;
                    const obj = getObj('graphic', id);
                    if (!obj) return;
                    const time = Date.now() - session.startTime;
                    const deltas = {};
                    // Capture identity for ALL recorded attrs (pruned on save)
                    session.recordAttrs.forEach(attr => {
                        const reg = getAttrReg(attr);
                        if (!reg || !reg.identity) return;
                        deltas[attr] = reg.identity(obj);
                    });
                    session.keyframes.push({ time, type: 'change', deltas, easings: {}, _snapshot: true });
                });
                showRecordingMenu(msg, objIds);
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'save') {
                const name = nonIds[0];
                if (!name) { ScriptKit.usage(msg, 'save', 'Missing recording name'); return; }
                if (objIds.length === 0) {
                    replyError(msg, 'Select or specify at least one token.');
                    return;
                }
                const existing = findHandout(name);
                if (existing && !flags.has('force')) {
                    replyError(msg,
                        `A recording named "${name}" already exists. `
                        + `Use --force to overwrite.`);
                    return;
                }
                objIds.forEach(id => {
                    // Look for an unsaved session for this object
                    const session = (s().unsavedSessions || {})[id];
                    if (!session) {
                        reply(msg, 'Record',
                            `No unsaved recording found for ${id}. `
                            + `Start a recording with !sequence record.`);
                        return;
                    }
                    delete s().unsavedSessions[id];
                    saveRecording(name, session, (handout) => {
                        const handoutId = handout.get('id');
                        let outMsg = `Saved recording <b>${escHtml(name)}</b> — `
                            + `${session.keyframes.length} keyframes, ${session.duration}ms.<br>`;
                        outMsg += btnHtml('▶ Play', `!sequence play ${escArg(name)}`) + ' ';
                        outMsg += btnHtml('🔁 Loop', `!sequence play ${escArg(name)} --loop`) + ' ';
                        outMsg += `<a href="http://journal.roll20.net/handout/${handoutId}">[open]</a>`;
                        reply(msg, 'Record', outMsg);
                    }, id);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'list') {
                const handouts = findAllRecordingHandouts();
                if (handouts.length === 0) {
                    reply(msg, 'Sequence', 'No recordings found.');
                    return;
                }
                let out = `<b>${handouts.length} recording(s):</b><br>`;
                handouts.forEach(h => {
                    const recName = h.get('name').slice(HANDOUT_PREFIX.length);
                    out += `• <b>${escHtml(recName)}</b> `
                        + `[${btnHtml('Edit', `${CMD_TOKEN} edit ${escArg(recName)}`)} `
                        + `${btnHtml('Play', `${CMD_TOKEN} play ${escArg(recName)}`)}]<br>`;
                });
                reply(msg, 'Sequence', out);
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'edit') {
                const name = nonIds[0];
                if (!name) { ScriptKit.usage(msg, 'edit', 'Missing recording name'); return; }
                const handout = findHandout(name);
                if (!handout) {
                    replyError(msg, `No recording named "${name}" found.`);
                    return;
                }
                // Whisper a link to open the handout
                const handoutId = handout.get('id');
                reply(msg, 'Sequence',
                    `Opening recording "${name}": `
                    + `<a href="http://journal.roll20.net/handout/${handoutId}">`
                    + `[Open Handout]</a>`);
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'delete') {
                const name = nonIds[0];
                if (!name) { ScriptKit.usage(msg, 'delete', 'Missing recording name'); return; }
                if (!flags.has('force')) {
                    replyError(msg,
                        `Are you sure you want to delete "${name}"? `
                        + btnHtml('Yes, delete', `${CMD_TOKEN} delete ${escArg(name)} --force`));
                    return;
                }
                const handout = findHandout(name);
                if (!handout) {
                    replyError(msg, `No recording named "${name}" found.`);
                    return;
                }
                handout.remove();
                delete recordingCache[name];
                reply(msg, 'Sequence', `Deleted recording "${name}".`);
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'play') {
                const name = nonIds[0];
                if (!name) { ScriptKit.usage(msg, 'play', 'Missing recording name'); return; }
                if (objIds.length === 0) {
                    replyError(msg, 'Select or specify at least one token.');
                    return;
                }
                loadRecording(name, (result) => {
                    if (!result) {
                        replyError(msg, `No recording named "${name}" found.`);
                        return;
                    }
                    const { recording, attrCols } = result;
                    const playOpts = {
                        speed:    opts.speed   ? parseFloat(opts.speed)   : 1.0,
                        loop:     flags.has('loop'),
                        loops:    opts.loops   ? parseInt(opts.loops, 10) : undefined,
                        reverse:  flags.has('reverse'),
                        offset:   opts.offset  ? parseInt(opts.offset, 10): 0,
                        easing:   opts.easing  || null,
                        only:     opts.only    ? opts.only.split(',')    : null,
                        exclude:  opts.exclude ? opts.exclude.split(',') : null,
                        playerid: msg.playerid,
                        silent:   !!msg.sceneInfo || flags.has('silent'),
                    };
                    let started = 0;
                    objIds.forEach(id => {
                        if (startPlayback(id, recording, attrCols, playOpts)) started++;
                    });
                    if (!msg.sceneInfo) showPlaybackMenu(msg, objIds.filter(id => activePlayback[id]), name);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'stop-play') {
                const stoppedNames = objIds.map(id =>
                    activePlayback[id] ? activePlayback[id].recordingName : null
                );
                objIds.forEach(id => stopPlayback(id)); // auto-reverts if preview mode
                if (!msg.sceneInfo) objIds.forEach((id, i) => showPlaybackMenu(msg, [id], stoppedNames[i]));
                return;
            }

            if (cmd === 'pause-play') {
                objIds.forEach(id => pausePlayback(id));
                showPlaybackMenu(msg, objIds);
                return;
            }

            if (cmd === 'resume-play') {
                objIds.forEach(id => resumePlayback(id));
                showPlaybackMenu(msg, objIds);
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'toggle-loop') {
                if (objIds.length === 0) {
                    replyError(msg, 'Select or specify at least one token.');
                    return;
                }
                objIds.forEach(id => {
                    const pb = activePlayback[id];
                    if (!pb) return;
                    // Cycle: OFF → Reset → Accumulate → OFF
                    if (!pb.loop) {
                        pb.loop     = true;
                        pb.loopMode = 'reset';
                    } else if (pb.loopMode === 'reset') {
                        pb.loopMode = 'accumulate';
                    } else {
                        pb.loop     = false;
                        pb.loopMode = 'reset';
                    }
                });
                const menuRecName = nonIds[0] || null;
                showPlaybackMenu(msg, objIds, menuRecName);
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'revert') {
                if (objIds.length === 0) {
                    replyError(msg, 'Select or specify at least one token.');
                    return;
                }
                let reverted = 0;
                objIds.forEach(id => { if (revertPlayback(id)) reverted++; });
                if (reverted === 0) {
                    replyError(msg, 'No revert state available. Play a recording first.');
                    return;
                }
                // Refresh the playback menu after reverting
                const revertRecName = nonIds[0] || null;
                showPlaybackMenu(msg, objIds, revertRecName);
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'playback-menu') {
                // Optional first non-ID arg is a recording name
                const menuRecName = nonIds[0] || null;
                showPlaybackMenu(msg, objIds, menuRecName);
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'preview') {
                const name = nonIds[0];
                if (!name) { ScriptKit.usage(msg, 'preview', 'Missing recording name'); return; }
                if (objIds.length === 0) {
                    replyError(msg, 'Select or specify at least one token to preview on.');
                    return;
                }
                loadRecording(name, (result) => {
                    if (!result) { replyError(msg, `No recording named "${name}" found.`); return; }
                    const { recording, attrCols } = result;
                    objIds.forEach(id => startPlayback(id, recording, attrCols, { preview: true, playerid: msg.playerid }));
                    showPlaybackMenu(msg, objIds.filter(id => activePlayback[id]), name);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'add-row') {
                // Usage: !sequence add-row <name> <time>
                // Time accepts: =5000 (absolute), +200 (relative), or bare number (treated as =N)
                const recName  = nonIds[0];
                const timeArg  = nonIds[1] !== undefined ? String(nonIds[1]).trim() : null;
                if (!recName || !timeArg) {
                    ScriptKit.usage(msg, 'add-row', !recName ? 'Missing recording name' : 'Missing time value');
                    return;
                }

                // Parse time argument using same rules as the handout parser
                let parsedTime;
                const isRel = timeArg.startsWith('+');
                const isAbs = timeArg.startsWith('=');
                const inner = (isRel || isAbs) ? timeArg.slice(1).trim() : timeArg;
                const numVal = parseFloat(inner);

                if (isRel) {
                    parsedTime = isNaN(numVal) ? { rel: inner, isExpr: true } : { rel: numVal };
                } else {
                    // =N or bare number — treat as absolute literal
                    if (!isNaN(numVal) && !/[A-Za-z(]/.test(inner)) {
                        parsedTime = numVal;
                    } else {
                        parsedTime = { abs: inner, isExpr: true };
                    }
                }

                const handout = findHandout(recName);
                if (!handout) { replyError(msg, `No recording named "${recName}" found.`); return; }
                loadRecording(recName, (result) => {
                    if (!result) { replyError(msg, `Could not parse "${recName}".`); return; }
                    const { recording, attrCols } = result;

                    // Insert new blank keyframe then sort
                    const newKf = { time: parsedTime, type: 'change', deltas: {}, easings: {} };
                    recording.keyframes.push(newKf);
                    recording.keyframes = sortKeyframes(recording.keyframes);
                    attrCols.forEach(attrName => stripRedundantEasings(recording.keyframes, attrName));

                    recordingCache[recName] = { recording, attrCols };
                    const html = generateHandoutHtml(recName, recording, attrCols);
                    setHandoutNotes(handout, html, recName);
                    reply(msg, 'Sequence', `Added blank row at ${escHtml(timeArg)} to "${escHtml(recName)}".`);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'sort') {
                // Re-parse handout, sort keyframes by time, regenerate
                const recName = nonIds[0];
                if (!recName) { ScriptKit.usage(msg, 'sort', 'Missing recording name'); return; }
                const handout = findHandout(recName);
                if (!handout) { replyError(msg, `No recording named "${recName}" found.`); return; }
                // Force re-parse from handout (pick up any manual edits)
                delete recordingCache[recName];
                loadRecording(recName, (result) => {
                    if (!result) { replyError(msg, `Could not parse "${recName}".`); return; }
                    const { recording, attrCols } = result;
                    const before = JSON.stringify((recording.keyframes || []).map(kf => kf.time));
                    recording.keyframes = sortKeyframes(recording.keyframes || []);
                    const after = JSON.stringify(recording.keyframes.map(kf => kf.time));
                    const wasSorted = before !== after;
                    (attrCols || []).forEach(attrName => {
                        stripRedundantEasings(recording.keyframes, attrName);
                    });
                    recordingCache[recName] = { recording, attrCols };
                    const html = generateHandoutHtml(recName, recording, attrCols);
                    setHandoutNotes(handout, html, recName);
                    reply(msg, 'Sequence',
                        wasSorted
                            ? `Sorted and refreshed "${recName}" — keyframes reordered.`
                            : `Refreshed "${recName}" — already in order.`);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'set-easing') {
                const recName  = nonIds[0];
                const timeStr  = nonIds[1];
                const attrName = nonIds[2];
                const easing   = nonIds.slice(3).join(' ');
                if (!recName || !timeStr || !attrName || !easing) {
                    ScriptKit.usage(msg, 'set-easing', 'Missing required arguments');
                    return;
                }
                const handout = findHandout(recName);
                if (!handout) { replyError(msg, `No recording named "${recName}" found.`); return; }
                loadRecording(recName, (result) => {
                    if (!result) { replyError(msg, `Could not parse "${recName}".`); return; }
                    const { recording, attrCols } = result;
                    let found = false;
                    (recording.keyframes || []).forEach(kf => {
                        if (!kfTimeMatches(kf, timeStr)) return;
                        kf.easings = kf.easings || {};
                        if (easing === 'linear' || easing === '') {
                            delete kf.easings[attrName];
                        } else {
                            kf.easings[attrName] = easing;
                        }
                        found = true;
                    });
                    if (!found) {
                        replyError(msg, `No keyframe found at ${escHtml(timeStr)} in "${escHtml(recName)}".`);
                        return;
                    }
                    recordingCache[recName] = { recording, attrCols };
                    const html = generateHandoutHtml(recName, recording, attrCols);
                    setHandoutNotes(handout, html, recName);
                    reply(msg, 'Sequence',
                        `Set easing for <b>${escHtml(attrName)}</b> at ${escHtml(timeStr)} to <b>${escHtml(easing)}</b>.`);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'set-command') {
                const recName = nonIds[0];
                const timeStr = nonIds[1];
                const cmdStr  = nonIds.slice(2).join(' ');
                if (!recName || !timeStr) {
                    ScriptKit.usage(msg, 'set-command', 'Missing required arguments');
                    return;
                }
                const handout = findHandout(recName);
                if (!handout) { replyError(msg, `No recording named "${recName}" found.`); return; }
                loadRecording(recName, (result) => {
                    if (!result) { replyError(msg, `Could not parse "${recName}".`); return; }
                    const { recording, attrCols } = result;
                    let found = false;
                    (recording.keyframes || []).forEach(kf => {
                        if (!kfTimeMatches(kf, timeStr)) return;
                        kf.command = cmdStr || null;
                        found = true;
                    });
                    if (!found) {
                        replyError(msg, `No keyframe at ${escHtml(timeStr)} in "${escHtml(recName)}".`);
                        return;
                    }
                    recordingCache[recName] = { recording, attrCols };
                    const html = generateHandoutHtml(recName, recording, attrCols);
                    setHandoutNotes(handout, html, recName);
                    reply(msg, 'Sequence',
                        `Set command at ${escHtml(timeStr)} in "${escHtml(recName)}": <code>${escHtml(cmdStr)}</code>`);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'set-type') {
                const recName = nonIds[0];
                const timeStr = nonIds[1];
                const newType = nonIds[2];
                if (!recName || !timeStr || !newType) {
                    ScriptKit.usage(msg, 'set-type', 'Missing required arguments');
                    return;
                }
                const validTypes = ['change', 'command'];
                if (!validTypes.includes(newType)) {
                    replyError(msg, `Invalid type "${newType}". Valid: ${validTypes.join(', ')}`);
                    return;
                }
                const handout = findHandout(recName);
                if (!handout) { replyError(msg, `No recording named "${recName}" found.`); return; }
                loadRecording(recName, (result) => {
                    if (!result) { replyError(msg, `Could not parse "${recName}".`); return; }
                    const { recording, attrCols } = result;
                    let found = false;
                    (recording.keyframes || []).forEach(kf => {
                        if (!kfTimeMatches(kf, timeStr)) return;
                        kf.type = newType;
                        found = true;
                    });
                    if (!found) {
                        replyError(msg, `No keyframe found at ${escHtml(timeStr)} in "${escHtml(recName)}".`);
                        return;
                    }
                    recordingCache[recName] = { recording, attrCols };
                    const html = generateHandoutHtml(recName, recording, attrCols);
                    setHandoutNotes(handout, html, recName);
                    reply(msg, 'Sequence',
                        `Set type at ${escHtml(timeStr)} to <b>${escHtml(newType)}</b>.`);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'add-command') {
                // Add a command keyframe to a saved recording at a given timestamp
                // Usage: !sequence add-command <name> <time_ms> <chat-command>
                const recName = nonIds[0];
                const timeMs  = nonIds[1] ? parseInt(nonIds[1], 10) : null;
                const cmdStr  = nonIds.slice(2).join(' ');
                if (!recName || timeMs === null || isNaN(timeMs) || !cmdStr) {
                    ScriptKit.usage(msg, 'add-command', 'Missing required arguments');
                    return;
                }
                const handout = findHandout(recName);
                if (!handout) { replyError(msg, `No recording named "${recName}" found.`); return; }
                loadRecording(recName, (result) => {
                    if (!result) { replyError(msg, `Could not parse recording "${recName}".`); return; }
                    const { recording, attrCols } = result;
                    // Insert sorted by time
                    const newKf = { time: timeMs, type: 'command', command: cmdStr, deltas: {}, easings: {} };
                    const idx = recording.keyframes.findIndex(kf => kf.time > timeMs);
                    if (idx === -1) recording.keyframes.push(newKf);
                    else recording.keyframes.splice(idx, 0, newKf);
                    recordingCache[recName] = { recording, attrCols };
                    const html = generateHandoutHtml(recName, recording, attrCols);
                    setHandoutNotes(handout, html, recName);
                    reply(msg, 'Sequence', `Added command keyframe at ${timeMs}ms to "${recName}".`);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'add-attribute') {
                const name = nonIds[0];
                const attr = nonIds[1];
                if (!name || !attr) {
                    ScriptKit.usage(msg, 'add-attribute', !name ? 'Missing recording name' : 'Missing attribute name');
                    return;
                }
                if (!getAttrReg(attr)) {
                    replyError(msg, `Unknown attribute "${attr}".`);
                    return;
                }
                const handout = findHandout(name);
                if (!handout) { replyError(msg, `No recording named "${name}" found.`); return; }
                loadRecording(name, (result) => {
                    if (!result) { replyError(msg, `Could not parse recording "${name}".`); return; }
                    const { recording, attrCols } = result;
                    if (!attrCols.includes(attr)) {
                        attrCols.push(attr);
                        recordingCache[name] = { recording, attrCols };
                    }
                    const html = generateHandoutHtml(name, recording, attrCols);
                    setHandoutNotes(handout, html, name);
                    reply(msg, 'Sequence',
                        `Added attribute column "${attr}" to "${name}". `
                        + `<a href="http://journal.roll20.net/handout/${handout.get('id')}">[Open Handout]</a>`);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'remove-attribute') {
                const name = nonIds[0];
                const attr = nonIds[1];
                if (!name || !attr) {
                    ScriptKit.usage(msg, 'remove-attribute', !name ? 'Missing recording name' : 'Missing attribute name');
                    return;
                }
                const handout = findHandout(name);
                if (!handout) { replyError(msg, `No recording named "${name}" found.`); return; }
                loadRecording(name, (result) => {
                    if (!result) { replyError(msg, `Could not parse recording "${name}".`); return; }
                    const { recording, attrCols } = result;
                    const idx = attrCols.indexOf(attr);
                    if (idx !== -1) {
                        attrCols.splice(idx, 1);
                        // Also strip deltas for this attr from all keyframes
                        (recording.keyframes || []).forEach(kf => {
                            delete (kf.deltas || {})[attr];
                            delete (kf.easings || {})[attr];
                        });
                        recordingCache[name] = { recording, attrCols };
                    }
                    const html = generateHandoutHtml(name, recording, attrCols);
                    setHandoutNotes(handout, html, name);
                    reply(msg, 'Sequence',
                        `Removed attribute column "${attr}" from "${name}".`);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'refresh') {
                const name = nonIds[0];
                if (!name) { ScriptKit.usage(msg, 'refresh', 'Missing recording name'); return; }
                // Force re-parse from handout, then regenerate
                const prevCached = recordingCache[name];
                delete recordingCache[name];
                const handout = findHandout(name);
                if (!handout) { replyError(msg, `No recording named "${name}" found.`); return; }
                loadRecording(name, (result) => {
                    if (!result) {
                        // Restore previous cache if we had one
                        if (prevCached) recordingCache[name] = prevCached;
                        replyError(msg, `Could not parse recording "${name}". Handout may be corrupted.`);
                        return;
                    }
                    const { recording, attrCols } = result;

                    const kfCount = (recording.keyframes || []).length;
                    const html = generateHandoutHtml(name, recording, attrCols);
                    setHandoutNotes(handout, html, name);
                    reply(msg, 'Sequence', `Refreshed "${name}" — ${kfCount} keyframe(s).`);
                });
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'command') {
                // Insert a command keyframe at the current timestamp in active sessions
                const cmdStr = rest.filter(a => a !== 'ignore-selected' && !isRollId(a)).join(' ');
                if (!cmdStr) {
                    ScriptKit.usage(msg, 'command', 'Missing chat command');
                    return;
                }
                if (objIds.length === 0) {
                    replyError(msg, 'Select or specify at least one token with an active recording.');
                    return;
                }
                let inserted = 0;
                objIds.forEach(id => {
                    const session = activeSessions[id];
                    if (!session || session.paused) return;
                    const time = Date.now() - session.startTime;
                    session.keyframes.push({
                        time,
                        type:    'command',
                        command: cmdStr,
                        deltas:  {},
                        easings: {},
                    });
                    session.duration = time;
                    inserted++;
                });
                if (inserted === 0) {
                    replyError(msg, 'No active (unpaused) recording sessions found on selected tokens.');
                    return;
                }
                reply(msg, 'Record', `Inserted command keyframe: <code>${escHtml(cmdStr)}</code>`);
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'recording-menu') {
                showRecordingMenu(msg, objIds);
                return;
            }


            // ----------------------------------------------------------------
            if (cmd === 'debug') {
                // Show active recording sessions
                const sessionIds = Object.keys(activeSessions);
                if (sessionIds.length === 0) {
                    reply(msg, 'Debug', 'No active recording sessions.');
                } else {
                    sessionIds.forEach(id => {
                        const sess = activeSessions[id];
                        const obj  = getObj('graphic', id);
                        const name = obj ? obj.get('name') || id : id;
                        let out = `<b>Recording session: ${escHtml(name)} (${id})</b><br>`;
                        out += `Recording name: ${escHtml(sess.name || '(unnamed)')}<br>`;
                        out += `Elapsed: ${Date.now() - sess.startTime}ms<br>`;
                        out += `Keyframes: ${sess.keyframes.length}<br>`;
                        out += `Paused: ${sess.paused}<br>`;
                        out += `Attrs: ${sess.recordAttrs.join(', ')}<br>`;
                        if (sess.keyframes.length > 0) {
                            const last = sess.keyframes[sess.keyframes.length - 1];
                            out += `Last keyframe @ ${last.time}ms: `
                                + Object.keys(last.deltas).join(', ') + '<br>';
                        }
                        reply(msg, 'Debug', out);
                    });
                }

                // Show active playback sessions
                const playIds = Object.keys(activePlayback);
                if (playIds.length > 0) {
                    playIds.forEach(id => {
                        const pb  = activePlayback[id];
                        const obj = getObj('graphic', id);
                        const name = obj ? obj.get('name') || id : id;
                        const elapsed = Math.round((Date.now() - pb.startTime) * pb.speed);
                        let out = `<b>Playback: ${escHtml(name)} (${id})</b><br>`;
                        out += `Recording: ${escHtml(pb.recordingName)}<br>`;
                        out += `Position: ${elapsed}ms / ${pb.duration}ms<br>`;
                        out += `Speed: ${pb.speed}x, Loop: ${pb.loop}, Paused: ${pb.paused}<br>`;
                        reply(msg, 'Debug', out);
                    });
                }
                return;
            }

            // ----------------------------------------------------------------
            if (cmd === 'dump-html') {
                // Print the raw handout HTML to the API console for debugging
                const name = nonIds[0];
                if (!name) { ScriptKit.usage(msg, 'dump-html', 'Missing recording name'); return; }
                const handout = findHandout(name);
                if (!handout) { replyError(msg, `No recording named "${name}" found.`); return; }
                getHandoutNotes(handout, (html) => {
                    // Split into chunks since log() has a size limit
                    const chunkSize = 1000;
                    for (let i = 0; i < html.length; i += chunkSize) {
                        log(`${SCRIPT_NAME} dump-html [${name}] chunk ${Math.floor(i/chunkSize)+1}: `
                            + html.slice(i, i + chunkSize));
                    }
                    reply(msg, 'Debug',
                        `Dumped HTML for "${name}" to API console `
                        + `(${html.length} chars, ${Math.ceil(html.length/chunkSize)} chunks).`);
                });
                return;
            }

            // ----------------------------------------------------------------
            // Examples
            // ----------------------------------------------------------------
            if (cmd === 'example' || cmd === 'examples') {
                // Parse search filters
                let scriptFilter = null, nameFilter = null, descFilter = null;
                const filterArgs = [];
                args.forEach(a => {
                    if (a.toLowerCase().startsWith('script:')) scriptFilter = a.slice(7).toLowerCase();
                    else if (a.toLowerCase().startsWith('name:')) nameFilter = a.slice(5).toLowerCase();
                    else if (a.toLowerCase().startsWith('desc:')) descFilter = a.slice(5).toLowerCase();
                    else filterArgs.push(a);
                });
                const remainingFilter = filterArgs.length > 0 ? filterArgs.join(' ').toLowerCase() : null;
                nameFilter = nameFilter || remainingFilter;
                descFilter = descFilter || remainingFilter;

                const examples = Object.values(EXT_EXAMPLES);
                if (examples.length === 0) {
                    reply(msg, 'Examples', 'No examples registered.');
                    return;
                }

                const hasSearch = scriptFilter || nameFilter || descFilter;
                const matches = (body, filter) => filter ? (body || '').toLowerCase().indexOf(filter) !== -1 : true;
                const isExact = (body, filter) => filter ? (body || '').toLowerCase() === filter : false;

                const highlightMatch = (text, filter) => {
                    if (!filter) return escHtml(text);
                    const lower = text.toLowerCase();
                    let result = '', lastIdx = 0, idx = lower.indexOf(filter);
                    if (idx === -1) return escHtml(text);
                    while (idx !== -1) {
                        result += escHtml(text.slice(lastIdx, idx));
                        result += '<b>' + escHtml(text.slice(idx, idx + filter.length)) + '</b>';
                        lastIdx = idx + filter.length;
                        idx = lower.indexOf(filter, lastIdx);
                    }
                    result += escHtml(text.slice(lastIdx));
                    return result;
                };

                // Tier 1: exact script match, Tier 2: exact name, Tier 3: fuzzy
                const tier1 = [], tier2 = [], tier3 = [];
                const tier1Sources = new Set();

                if (scriptFilter) {
                    examples.forEach(ex => {
                        if (ex.source.toLowerCase() === scriptFilter) {
                            tier1.push(ex);
                            tier1Sources.add(ex.source);
                        }
                    });
                }
                examples.forEach(ex => {
                    if (tier1Sources.has(ex.source)) return;
                    if (scriptFilter && ex.source.toLowerCase().indexOf(scriptFilter) === -1) return;
                    if (!hasSearch) { tier3.push(ex); return; }
                    if (!matches(ex.name, nameFilter) && !matches(ex.description, descFilter)) return;
                    if (isExact(ex.name, nameFilter) || isExact(ex.description, descFilter)) tier2.push(ex);
                    else tier3.push(ex);
                });

                const allMatches = [...tier1, ...tier2, ...tier3];
                if (allMatches.length === 0) {
                    reply(msg, 'Examples', 'No examples match. Use <code>!sequence example</code> to see all.');
                    return;
                }

                const groups = [];
                const groupMap = {};
                allMatches.forEach(ex => {
                    if (!groupMap[ex.source]) { groupMap[ex.source] = []; groups.push({ source: ex.source, items: groupMap[ex.source] }); }
                    groupMap[ex.source].push(ex);
                });
                const tier2Sources = new Set(tier2.map(ex => ex.source));
                groups.sort((a, b) => {
                    const ta = tier1Sources.has(a.source) ? 0 : tier2Sources.has(a.source) ? 1 : 2;
                    const tb = tier1Sources.has(b.source) ? 0 : tier2Sources.has(b.source) ? 1 : 2;
                    if (ta !== tb) return ta - tb;
                    return a.source.localeCompare(b.source);
                });

                let out = `Filter: <code>!sequence example &lt;search&gt;</code>, <code>script:</code>, <code>name:</code>, <code>desc:</code><br><br>`;
                groups.forEach(g => {
                    out += `<b>${escHtml(g.source)}:</b><br>`;
                    g.items.forEach(ex => {
                        const recName = `example-${ex.name}`;
                        const exists = findObjs({ type: 'handout', name: `${HANDOUT_PREFIX}${recName}` })[0];
                        out += `&nbsp;&nbsp;• <u>${highlightMatch(ex.name, nameFilter || '')}</u>`;
                        if (ex.description) out += ` — ${highlightMatch(ex.description, descFilter || '')}`;
                        out += ' ';
                        if (exists) {
                            out += `<a style="background:#333;color:#fff;padding:1px 4px;border-radius:3px;text-decoration:none;" href="!sequence example! ${ex.name}">🔄 Regen</a> `;
                            out += `<a style="background:#333;color:#fff;padding:1px 4px;border-radius:3px;text-decoration:none;" href="!sequence play ${recName}">▶ Play</a> `;
                            out += `<a style="background:#333;color:#fff;padding:1px 4px;border-radius:3px;text-decoration:none;" href="!sequence play ${recName} --loop">🔁 Loop</a> `;
                            out += `<a href="http://journal.roll20.net/handout/${exists.get('id')}">[open]</a>`;
                        } else {
                            out += `<a style="background:#333;color:#fff;padding:1px 4px;border-radius:3px;text-decoration:none;" href="!sequence example! ${ex.name}">+ Generate</a>`;
                        }
                        out += `<br>`;
                    });
                });
                reply(msg, 'Examples', out);
                return;
            }

            if (cmd === 'example!') {
                const exName = args[0];
                const ex = Object.values(EXT_EXAMPLES).find(e => e.name === exName);
                if (!ex) {
                    replyError(msg, `No example named "${exName}". Use <code>!sequence example</code> to see all.`);
                    return;
                }
                const recName = `example-${exName}`;
                const rec = ex.recording;
                const attrCols = ex.attrCols || Object.keys((rec.keyframes && rec.keyframes[0] && rec.keyframes[0].easings) || {});
                const handout = getOrCreateHandout(recName);
                handout.set('archived', true);
                setHandoutNotes(handout, generateHandoutHtml(recName, rec, attrCols), recName);
                recordingCache[recName] = { recording: rec, attrCols };
                if (typeof ex.onGenerate === 'function') ex.onGenerate(recName);
                const handoutId = handout.get('id');
                let outMsg = `Generated <b>${recName}</b>.<br>`;
                outMsg += btnHtml('▶ Play', `!sequence play ${recName}`) + ' ';
                outMsg += btnHtml('🔁 Loop', `!sequence play ${recName} --loop`) + ' ';
                outMsg += `<a href="http://journal.roll20.net/handout/${handoutId}">[open]</a>`;
                reply(msg, 'Examples', outMsg);
                return;
            }

            // ----------------------------------------------------------------
            if (typeof ScriptKit !== 'undefined') ScriptKit.usage(msg);
            else replyError(msg, `Unknown command: ${escHtml(cmd)}. Use !sequence help for a command list.`);

        } catch (err) {
            log(`${SCRIPT_NAME} error in handleInput: ${err}`);
            reply(msg, 'Error', `An internal error occurred: ${err.message}`);
        }
    };

    // =========================================================================
    // Event handlers
    // =========================================================================

    const onObjectChanged = (obj) => {
        const id = obj.get('id');
        if (activePlayback[id]) return; // don't capture during playback
        if (activeSessions[id]) captureKeyframe(obj);
    };

    // Guard against recursive handout change events when we write back
    const handoutWriting = new Set();

    const VALID_TYPES = new Set(['change', 'command']);

    /**
     * Validate a parsed recording. Returns an array of error strings.
     * Also annotates each keyframe with a `errors` array for highlighting.
     */
    const validateRecording = (recording, attrCols) => {
        const errors = [];

        (recording.keyframes || []).forEach((kf, ki) => {
                // Parse-error rows are already flagged — just add to errors list
                if (kf.type === 'parse-error') {
                    errors.push(`Row ${ki + 1} (${kf.time !== null ? kf.time + 'ms' : '?'}): ${kf.error}`);
                    return;
                }

                kf.cellErrors = kf.cellErrors || {}; // may already have parser errors

                // Validate time
                if (typeof kf.time === 'number') {
                    if (isNaN(kf.time) || kf.time < 0) {
                        kf.cellErrors['time'] = `Invalid time: ${kf.time}`;
                        errors.push(`Row ${ki + 1}: invalid time "${kf.time}"`);
                    }
                } else if (kf.time && kf.time.isExpr) {
                    const expr = kf.time.rel !== undefined ? String(kf.time.rel) : String(kf.time.abs);
                    const exprErr = validateTimeExpr(expr);
                    if (exprErr) {
                        kf.cellErrors['time'] = `Invalid time expression: ${exprErr}`;
                        errors.push(`Row ${ki + 1}: invalid time expression: ${exprErr}`);
                    }
                } else if (kf.time === null) {
                    kf.cellErrors['time'] = `Missing time value`;
                    errors.push(`Row ${ki + 1}: missing time value`);
                }

                // Validate type
                if (!VALID_TYPES.has(kf.type)) {
                    kf.cellErrors['type'] = `Unknown type: ${kf.type}`;
                    errors.push(`Row ${ki + 1} (${kf.time}ms): unknown type "${kf.type}"`);
                }

                // Command type must have a command — stored as a cell error so
                // the cell highlights red; the cell error loop below will add it to errors
                if (kf.type === 'command' && !kf.command && !kf.cellErrors['__command']) {
                    kf.cellErrors['__command'] = 'Command type requires a command string';
                }

                // Include any cell errors set by the parser
                Object.entries(kf.cellErrors).forEach(([colKey, errMsg]) => {
                    if (!errors.find(e => e.includes(`${kf.time}ms`) && e.includes(colKey))) {
                        errors.push(`Row ${ki + 1} (${kf.time}ms): ${errMsg} [${colKey}]`);
                    }
                });

                // Validate easing values
                Object.entries(kf.easings || {}).forEach(([attrName, easing]) => {
                    if (easing && validateEasingExpr(easing)) {
                        kf.cellErrors[`${attrName}:easing`] = `Unknown easing: ${easing}`;
                        errors.push(`Row ${ki + 1} (${kf.time}ms): unknown easing "${easing}" for ${attrName}`);
                    }
                });

                // Validate delta cells
                attrCols.forEach(attrName => {
                    const parsed = kf.deltas && kf.deltas[attrName];
                    if (!parsed) return; // empty cell is fine
                    const reg = getAttrReg(attrName);
                    if (!reg) return;
                    if ('expr' in parsed) {
                        // Validate expression syntax
                        const exprErr = validateExpr(parsed.expr);
                        if (exprErr) {
                            kf.cellErrors[attrName] = `Invalid expression: ${exprErr}`;
                            errors.push(`Row ${ki + 1} (${kf.time}ms): invalid expression for ${attrName}: ${exprErr}`);
                        }
                    } else {
                        // Check for NaN in numeric deltas/abs
                        if ('delta' in parsed && isNaN(parsed.delta)) {
                            kf.cellErrors[attrName] = `Invalid delta value`;
                            errors.push(`Row ${ki + 1} (${kf.time}ms): invalid value for ${attrName}`);
                        }
                        if ('abs' in parsed && typeof parsed.abs === 'number' && isNaN(parsed.abs)) {
                            kf.cellErrors[attrName] = `Invalid absolute value`;
                            errors.push(`Row ${ki + 1} (${kf.time}ms): invalid absolute value for ${attrName}`);
                        }
                    }
                });
            });

        return errors;
    };

    const onHandoutChanged = (handout) => {
        const hname = handout.get('name');
        if (!hname.startsWith(HANDOUT_PREFIX)) return;

        const recName = hname.slice(HANDOUT_PREFIX.length);

        // Skip if we triggered this change ourselves, then clear the guard
        if (handoutWriting.has(recName)) {
            handoutWriting.delete(recName);
            return;
        }

        // Force re-parse from the new notes, sort, and regenerate
        const prevCached = recordingCache[recName];
        delete recordingCache[recName];
        getHandoutNotes(handout, (html) => {
            if (!html) return;
            const result = parseHandout(recName, html);
            if (!result) return;

            const { recording, attrCols } = result;

            // Sort keyframes
            const getTime2 = (kf) => typeof kf.time === 'number' ? kf.time : 0;
            (recording.keyframes || []).sort((a, b) => getTime2(a) - getTime2(b));
            // Strip redundant easing cells
            (attrCols || []).forEach(attrName => {
                stripRedundantEasings(recording.keyframes, attrName);
            });

            // Validate and annotate keyframes with errors
            const errors = validateRecording(recording, attrCols);

            recordingCache[recName] = { recording, attrCols };
            const newHtml = generateHandoutHtml(recName, recording, attrCols);

            // Always write back so error highlights appear, unless nothing changed
            if (newHtml !== html) {
                setHandoutNotes(handout, newHtml, recName);
            } else {
                // HTML unchanged — clear guard since no event will fire
                handoutWriting.delete(recName);
            }

            // Whisper validation errors to all online GMs
            if (errors.length > 0) {
                const onlineGMs = findObjs({ _type: 'player', online: true })
                    .filter(p => playerIsGM(p.get('id')));
                const errMsg = `<b>⚠ Validation errors in [Sequence] ${escHtml(recName)}:</b><br>`
                    + errors.map(e => `• ${escHtml(e)}`).join('<br>');
                onlineGMs.forEach(p => {
                    sendChat(SCRIPT_NAME,
                        `/w ${p.get('_displayname').split(' ')[0]} ${errMsg}`,
                        null, { noarchive: true });
                });
            }
        });
    };

    // =========================================================================
    // Initialisation
    // =========================================================================

    const HELP_AVATAR = 'https://files.d20.io/images/127392204/tAiDP73rpSKQobEYm5QZUw/thumb.png?15878425385';



    /**
     * Generate or update a "Help: Sequence/<name>" handout documenting an extension script.
     * Call from your extension's on('ready') after registering attributes, functions, and constants.
     *
     * @param {string} sourceId  Script name generating the handout.
     * @param {object} opts      Options struct:
     *
     * Required fields:
     * @param {string}   opts.description  Short description shown at top of handout.
     * @param {Array}    opts.sections     Array of { namespace: string (required), description: string (required) }
     *                                     objects — one per namespace to document.
     *
     * Optional fields:
     * @param {string}   opts.name         Extension name (used in handout title; defaults to sourceId).
     * @param {string}   opts.avatar       Avatar image URL (falls back to Sequence's icon).
     *
     * Logs an error and returns early if opts.sections is empty.
     */
    const generateExtensionHandout = (sourceId, opts = {}) => {
        const src = sourceId || SCRIPT_NAME;
        const { description = '', avatar, sections = [] } = opts;
        const name = opts.name || src;

        if (!sections.length) {
            log(`${SCRIPT_NAME}: [${src}] generateExtensionHandout — no sections provided for "${name}"`);
            return;
        }

        const h  = (n, t) => `<h${n}>${t}</h${n}>`;
        const p  = (t)    => `<p>${t}</p>`;
        const c  = (t)    => `<code>${t}</code>`;
        const b  = (t)    => `<b>${t}</b>`;
        const i  = (t)    => `<i>${t}</i>`;
        const li = (t)    => `<li>${t}</li>`;
        const ul = (t)    => `<ul>${t}</ul>`;

        const fmtContexts = (r) => {
            const ctx = r.contexts || ['value', 'time'];
            return ctx.length === 2 ? '' : ` ${i(`[${ctx.join('/')} only]`)}`;
        };

        const fmtAttr = (r) => {
            const qName = r.namespace === 'core' ? r.name : `${r.namespace}.${r.name}`;
            const type  = i(r.valueType || 'any');
            const enums = r.enumValues ? ` (${r.enumValues.join(', ')})` : '';
            const lerp  = r.lerp !== null ? ', lerp' : '';
            let s = `${b(qName)} [${type}${enums}${lerp}]<br>`;
            if (r.description) s += `${r.description}<br>`;
            if (r.examples && r.examples.length)
                s += ul(r.examples.map(e => li(c(e))).join(''));
            return `<p>${s}</p>`;
        };

        const fmtFn = (r) => {
            const ns2     = `${b(r.namespace + '.')}&shy;`;
            const argList = (r.args || []).map(a =>
                a.optional ? `[${a.name}]` : a.name).join(', ');
            const unstable = r.pure === false ? ' [unstable]' : '';
            let s = `${b(ns2 + r.name + `(${argList})`)} → ${i(r.returns || 'number')}${unstable}${fmtContexts(r)}<br>`;
            if (r.description) s += `${r.description}<br>`;
            if (r.args && r.args.length)
                s += ul(r.args.map(a =>
                    li(`${b(a.name)} ${i(a.type || '')}${a.description ? ' — ' + a.description : ''}`)
                ).join(''));
            if (r.examples && r.examples.length)
                s += `${i('Examples:')}${ul(r.examples.map(e => li(c(e))).join(''))}`;
            return `<p>${s}</p>`;
        };

        const fmtConst = (r) => {
            const ns2    = `${b(r.namespace + '.')}&shy;`;
            const valStr = String(r.value);
            const swatch = r.type === 'Color'
                ? `<span style="display:inline-block;width:12px;height:12px;background:${valStr === 'transparent' ? '#fff;border:1px dashed #999' : valStr + ';border:1px solid #999'};border-radius:2px;vertical-align:middle;margin-right:3px;"></span>`
                : '';
            let s = `${swatch}${b(ns2 + r.name)} : ${i(r.type || 'any')} = ${c(valStr)}${fmtContexts(r)}<br>`;
            if (r.description) s += r.description;
            return `<p>${s}</p>`;
        };

        let html = '';
        html += h(1, `${name} <small style="font-size:0.6em;color:#666;">Sequence Extension</small>`);
        if (description) html += p(description);
        html += p(`Part of the <b>Sequence</b> animation system. `
            + `Use ${c(`!sequence man &lt;namespace&gt;`)} in chat for live lookup.`);

        sections.forEach(section => {
            const ns  = section.namespace;
            const desc = section.description || '';

            const attrs     = Object.values(ATTR_REGISTRY)     .filter(r => r.namespace === ns).sort((a,b) => a.name.localeCompare(b.name));
            const fns       = Object.values(FN_REGISTRY)       .filter(r => r.namespace === ns).sort((a,b) => a.name.localeCompare(b.name));
            const timingFns = Object.values(TIME_FN_REGISTRY)  .filter(r => r.namespace === ns).sort((a,b) => a.name.localeCompare(b.name));
            const consts    = Object.values(CONST_REGISTRY)    .filter(r => r.namespace === ns).sort((a,b) => a.name.localeCompare(b.name));

            html += h(2, c(ns));
            if (desc) html += p(desc);

            if (!attrs.length && !fns.length && !timingFns.length && !consts.length) {
                html += p(i(`Nothing registered under namespace "${ns}".`));
                return;
            }
            if (attrs.length) {
                html += h(3, 'Attributes');
                attrs.forEach(r => { html += fmtAttr(r); });
            }
            if (fns.length) {
                html += h(3, 'Value Functions');
                fns.forEach(r => { html += fmtFn(r); });
            }
            if (timingFns.length) {
                html += h(3, 'Timing Functions');
                timingFns.forEach(r => { html += fmtFn(r); });
            }
            if (consts.length) {
                html += h(3, 'Constants');
                consts.forEach(r => { html += fmtConst(r); });
            }
        });

        const handoutName = `Help: ${SCRIPT_NAME}/${name}`;
        let hh = findObjs({ type: 'handout', name: handoutName })[0];
        if (!hh) {
            hh = createObj('handout', {
                name:             handoutName,
                archived:         false,
                avatar:           avatar || HELP_AVATAR,
            });
        }
        hh.set('notes', html);
        log(`${SCRIPT_NAME}: generated help handout "${handoutName}"`);
    };

    const checkInstall = () => {
        state[SCRIPT_NAME] = state[SCRIPT_NAME] || {};
        const st = state[SCRIPT_NAME];
        st.unsavedSessions = st.unsavedSessions || {};

        log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} Initialized <=-`);

        // Signal extensions that Sequence is ready to accept registrations.
        // Extensions that loaded before Sequence listen for this; extensions
        registerBuiltinExamples();

        // that loaded after can call Sequence.register* directly since
        // Sequence is already defined by the time their on('ready') runs.
        sendChat('', `!${SCRIPT_NAME.toLowerCase()}-ready`, null, { noarchive: true });
    };

    // =========================================================================
    // Built-in Examples
    // =========================================================================

    const registerBuiltinExamples = () => {
        registerExample(SCRIPT_NAME, {
            name: 'spin',
            description: 'Continuous rotation. Simple looping animation.',
            recording: { objectType: 'graphic', notes: '', keyframes: [
                { time: 0, type: 'change', deltas: {}, easings: { rotation: 'continuous' } },
                { time: 3000, type: 'change', deltas: { rotation: { expr: 'orig + t * 360', mode: 'abs' } }, easings: {} },
            ]},
        });

        registerExample(SCRIPT_NAME, {
            name: 'hover',
            description: 'Gentle vertical bob. Floating/levitating tokens.',
            recording: { objectType: 'graphic', notes: '', keyframes: [
                { time: 0, type: 'change', deltas: {}, easings: { top: 'continuous' } },
                { time: 2000, type: 'change', deltas: { top: { expr: 'orig + sin(t * TAU) * unit(2)', mode: 'abs' } }, easings: {} },
            ]},
        });

        registerExample(SCRIPT_NAME, {
            name: 'pulse',
            description: 'Scale up and down rhythmically. Highlight or heartbeat effect.',
            recording: { objectType: 'graphic', notes: '', keyframes: [
                { time: 0, type: 'change', deltas: {}, easings: { width: 'continuous', height: 'continuous' } },
                { time: 1500, type: 'change', deltas: { width: { expr: 'orig * (1 + sin(t * TAU) * 0.15)', mode: 'abs' }, height: { expr: 'orig * (1 + sin(t * TAU) * 0.15)', mode: 'abs' } }, easings: {} },
            ]},
        });

        registerExample(SCRIPT_NAME, {
            name: 'orbit',
            description: 'Circular path around original position. Shows trig expressions.',
            recording: { objectType: 'graphic', notes: '', keyframes: [
                { time: 0, type: 'change', deltas: {}, easings: { left: 'continuous', top: 'continuous' } },
                { time: 5000, type: 'change', deltas: { left: { expr: 'orig + cos(t * TAU) * cell(1)', mode: 'abs' }, top: { expr: 'orig + sin(t * TAU) * cell(1)', mode: 'abs' } }, easings: {} },
            ]},
        });

        registerExample(SCRIPT_NAME, {
            name: 'shake',
            description: 'Decaying tremor. Starts violent, mellows out.',
            recording: { objectType: 'graphic', notes: '', keyframes: [
                { time: 0, type: 'change', deltas: {}, easings: { left: 'continuous', top: 'continuous' } },
                { time: 1000, type: 'change', deltas: { left: { expr: 'orig + sin(t * TAU * 8) * unit(3) * (1 - t)', mode: 'abs' }, top: { expr: 'orig + cos(t * TAU * 6) * unit(2) * (1 - t)', mode: 'abs' } }, easings: {} },
            ]},
        });

        registerExample(SCRIPT_NAME, {
            name: 'torch-flicker',
            description: 'Light radius jitters like a real flame. Atmospheric lighting (supports both legacy and UDL).',
            recording: { objectType: 'graphic', notes: '', keyframes: [
                { time: 0,                                         type: 'change', deltas: { bright_light_distance: { expr: 'orig * rand(0.9, 1.1)', mode: 'abs' }, low_light_distance: { expr: 'orig * rand(0.9, 1.1)', mode: 'abs' }, light_radius: { expr: 'orig * rand(0.9, 1.1)', mode: 'abs' }, light_dimradius: { expr: 'orig * rand(0.9, 1.1)', mode: 'abs' } }, easings: { bright_light_distance: 'linear', low_light_distance: 'linear', light_radius: 'linear', light_dimradius: 'linear' } },
                { time: { isExpr: true, rel: 'rand(80, 200)' },    type: 'change', deltas: { bright_light_distance: { expr: 'orig * rand(0.75, 1.0)', mode: 'abs' }, low_light_distance: { expr: 'orig * rand(0.75, 1.0)', mode: 'abs' }, light_radius: { expr: 'orig * rand(0.75, 1.0)', mode: 'abs' }, light_dimradius: { expr: 'orig * rand(0.75, 1.0)', mode: 'abs' } }, easings: {} },
                { time: { isExpr: true, rel: 'rand(100, 250)' },   type: 'change', deltas: { bright_light_distance: { expr: 'orig * rand(0.85, 1.1)', mode: 'abs' }, low_light_distance: { expr: 'orig * rand(0.85, 1.1)', mode: 'abs' }, light_radius: { expr: 'orig * rand(0.85, 1.1)', mode: 'abs' }, light_dimradius: { expr: 'orig * rand(0.85, 1.1)', mode: 'abs' } }, easings: {} },
                { time: { isExpr: true, rel: 'rand(-60, 180)' },    type: 'change', deltas: { bright_light_distance: { expr: 'orig * rand(0.7, 0.95)', mode: 'abs' }, low_light_distance: { expr: 'orig * rand(0.7, 0.95)', mode: 'abs' }, light_radius: { expr: 'orig * rand(0.7, 0.95)', mode: 'abs' }, light_dimradius: { expr: 'orig * rand(0.7, 0.95)', mode: 'abs' } }, easings: {} },
                { time: { isExpr: true, rel: 'rand(120, 1200)' },   type: 'change', deltas: { bright_light_distance: { expr: 'orig * rand(0.9, 1.1)', mode: 'abs' }, low_light_distance: { expr: 'orig * rand(0.9, 1.1)', mode: 'abs' }, light_radius: { expr: 'orig * rand(0.9, 1.1)', mode: 'abs' }, light_dimradius: { expr: 'orig * rand(0.9, 1.1)', mode: 'abs' } }, easings: {} },
                { time: { isExpr: true, rel: 'rand(-80, 220)' },    type: 'change', deltas: { bright_light_distance: { expr: 'orig * rand(0.8, 1.05)', mode: 'abs' }, low_light_distance: { expr: 'orig * rand(0.8, 1.05)', mode: 'abs' }, light_radius: { expr: 'orig * rand(0.8, 1.05)', mode: 'abs' }, light_dimradius: { expr: 'orig * rand(0.8, 1.05)', mode: 'abs' } }, easings: {} },
                { time: { isExpr: true, rel: 'rand(-100, 250)' },   type: 'change', deltas: { bright_light_distance: { expr: 'orig * rand(0.85, 1.1)', mode: 'abs' }, low_light_distance: { expr: 'orig * rand(0.85, 1.1)', mode: 'abs' }, light_radius: { expr: 'orig * rand(0.85, 1.1)', mode: 'abs' }, light_dimradius: { expr: 'orig * rand(0.85, 1.1)', mode: 'abs' } }, easings: {} },
                { time: { isExpr: true, rel: 'rand(200, 1800)' },   type: 'change', deltas: { bright_light_distance: { expr: 'orig * rand(0.9, 1.0)', mode: 'abs' }, low_light_distance: { expr: 'orig * rand(0.9, 1.0)', mode: 'abs' }, light_radius: { expr: 'orig * rand(0.9, 1.0)', mode: 'abs' }, light_dimradius: { expr: 'orig * rand(0.9, 1.0)', mode: 'abs' } }, easings: {} },
            ]},
        });

        registerExample(SCRIPT_NAME, {
            name: 'rgb-cycle',
            description: 'Rainbow tint color rotation. Demonstrates color expression animation.',
            recording: { objectType: 'graphic', notes: '', keyframes: [
                { time: 0, type: 'change', deltas: {}, easings: { tint_color: 'continuous' } },
                { time: 4000, type: 'change', deltas: { tint_color: { expr: 'color.hsl(t * 360, 100, 50)', mode: 'abs' } }, easings: {} },
            ]},
        });

        registerExample(SCRIPT_NAME, {
            name: 'boss-phase-2',
            description: 'Multi-attribute boss transformation: grows, heals past full, light intensifies, tint shifts black to red, name gains a title. Keyframe showcase.',
            recording: { objectType: 'graphic', notes: '', keyframes: [
                { time: 0, type: 'change', deltas: { width: { delta: 1 }, height: { delta: 1 }, bar1_value: { expr: 'orig', mode: 'abs' }, light_radius: { expr: 'orig', mode: 'abs' }, tint_color: { expr: 'color.black', mode: 'abs' }, name: { abs: '' } }, easings: { width: 'ease-out-back', height: 'ease-out-back', bar1_value: 'ease-in-quad', light_radius: 'ease-in-quad', tint_color: 'linear', name: 'ease-out-quad' } },
                { time: 6000, type: 'change', deltas: { width: { expr: 'ceil(orig * 1.3, cell(1))', mode: 'abs' }, height: { expr: 'ceil(orig * 1.3, cell(1))', mode: 'abs' }, bar1_value: { expr: 'round(get("bar1_max") * 1.2)', mode: 'abs' }, light_radius: { abs: '40' }, tint_color: { expr: 'color.red', mode: 'abs' }, name: { expr: '"Mighty " + orig + ", The Reborn"', mode: 'abs' } }, easings: {} },
            ]},
        });
    };

    // =========================================================================
    // ScriptKit Registration
    // =========================================================================

    const registerWithScriptKit = () => {
        if (typeof ScriptKit === 'undefined') return;
        ScriptKit.register(SCRIPT_NAME, {
            version: SCRIPT_VERSION,
            command: CMD_TOKEN,
            tag: HANDOUT_TAG,
            aliases: {
                examples: null,  // Sequence has its own examples system
            },
            newSince: '1.1.0',
            help: {
                description: 'General-purpose keyframe animation engine for Roll20 tokens. Record movements and attribute changes in real time, then play them back with smooth interpolation, easing, looping, speed control, and expression-driven values.',
                quickStart: [
                    'Type `!sequence example` to see built-in animations, then click Play or Loop.',
                    'Or: select a token and type `!sequence record my-animation`.',
                    'Move the token and change its attributes.',
                    'Type `!sequence stop` — the recording saves automatically.',
                    'Select any token and type `!sequence play my-animation`.',
                ],
                changelog: [
                    { version: '1.1.0', date: '2026-08-16', changes: [
                        'ScriptKit integration: help, whatsnew, gen-help handout generation',
                    ]},
                    { version: '1.0.1', date: '2026-07-04', changes: [
                        'Continuous easing: re-evaluate expressions every tick for t-based animations',
                        'freeze() function: memoize impure results in continuous segments',
                        'String lerp: animate name, tooltip, gmnotes with Levenshtein interpolation',
                        'Color expressions and constants (color.red, color.hsl(h,s,l))',
                        'UDL lighting attributes: bright_light_distance, low_light_distance, etc.',
                        'get("attr") function: reference other token attributes in expressions',
                        'cell(n) and unit(n) for grid/map unit conversion',
                        'round/floor/ceil with optional step argument for snapping',
                        'Attribute groups: record correlated attributes together',
                        'Command keyframes: fire chat commands at specific times during playback',
                        'Preview command: play and auto-revert when finished',
                    ]},
                    { version: '1.0.0', date: '2026-06-29', changes: [
                        'Initial release',
                        'Keyframe recording and playback engine',
                        'Per-attribute easing curves',
                        'Expression-driven keyframe values',
                        'Looping with reset and accumulate modes',
                        'Built-in examples: spin, hover, pulse, orbit, shake, torch-flicker, rgb-cycle, boss-phase-2',
                        'Handout-based recording storage (portable between campaigns)',
                        'Extension API: registerAttribute, registerEasing, registerPlaybackConstant, registerExample',
                    ]},
                    { version: '0.2.0', date: '2026-06-01', changes: [
                        'Handout-based recording format with editable keyframe tables',
                        'Easing system: per-attribute interpolation curves',
                        'Expression engine: rand, clamp, math functions in keyframe values',
                        'Playback controls: pause, resume, speed, reverse, offset',
                        'Loop modes: reset and accumulate',
                    ]},
                ],
                commands: [
                    { group: 'Recording', commands: [
                        { syntax: 'record [name] [--attrs a,b,...] [obj_id...]', description: 'Start recording on selected/listed tokens', version: '1.0.0',
                          items: [
                              { name: '[name]', description: 'Recording name (auto-saves on stop if given)', version: '1.0.0' },
                              { name: '--attrs <a,b,...>', description: 'Only record listed attributes (default: all)', version: '1.0.0' },
                          ]},
                        { syntax: 'stop [obj_id...]', description: 'Stop recording (auto-saves if name was given)', version: '1.0.0' },
                        { syntax: 'pause [obj_id...]', description: 'Pause recording without discarding keyframes', version: '1.0.0' },
                        { syntax: 'resume [obj_id...]', description: 'Resume a paused recording', version: '1.0.0' },
                        { syntax: 'save <name> [--force] [obj_id...]', description: 'Save unnamed recording under <name>', version: '1.0.0',
                          items: [
                              { name: '--force', description: 'Overwrite existing recording', version: '1.0.0' },
                          ]},
                    ]},
                    { group: 'Playback', commands: [
                        { syntax: 'play <name> [flags] [obj_id...]', description: 'Play a recording on selected/listed tokens', version: '1.0.0',
                          items: [
                              { name: '--loop', description: 'Loop indefinitely', version: '1.0.0' },
                              { name: '--loops <n>', description: 'Loop n times', version: '1.0.0' },
                              { name: '--speed <x>', description: 'Playback speed multiplier (default: 1.0)', version: '1.0.0' },
                              { name: '--reverse', description: 'Play in reverse', version: '1.0.0' },
                              { name: '--offset <ms>', description: 'Start at time offset', version: '1.0.0' },
                              { name: '--only <a,b,...>', description: 'Only apply listed attributes', version: '1.0.0' },
                              { name: '--exclude <a,b,...>', description: 'Exclude listed attributes', version: '1.0.0' },
                          ]},
                        { syntax: 'preview <name> [flags] [obj_id...]', description: 'Play and auto-revert when finished', version: '1.0.1' },
                        { syntax: 'stop-play [obj_id...]', description: 'Stop playback on selected/listed tokens', version: '1.0.0' },
                        { syntax: 'pause-play [obj_id...]', description: 'Pause active playback', version: '1.0.0' },
                        { syntax: 'resume-play [obj_id...]', description: 'Resume paused playback', version: '1.0.0' },
                        { syntax: 'playback-menu [obj_id...]', description: 'Show playback controls for active playback', version: '1.0.0' },
                    ]},
                    { group: 'Management', commands: [
                        { syntax: 'list', description: 'List all saved recordings', version: '1.0.0' },
                        { syntax: 'edit <name>', description: 'Open the recording handout editor', version: '1.0.0' },
                        { syntax: 'delete <name> [--force]', description: 'Delete a recording', version: '1.0.0' },
                        { syntax: 'add-attribute <name> <attr>', description: 'Add an attribute column to a recording', version: '1.0.0' },
                        { syntax: 'remove-attribute <name> <attr>', description: 'Remove an attribute column from a recording', version: '1.0.0' },
                        { syntax: 'add-row <name> <time_ms>', description: 'Add blank keyframe row at given time', version: '1.0.0' },
                        { syntax: 'add-command <name> <time_ms> <chat-command>', description: 'Add command keyframe to saved recording', version: '1.0.1' },
                        { syntax: 'command <chat-command> [obj_id...]', description: 'Insert command keyframe during active recording', version: '1.0.1' },
                        { syntax: 'sort <name>', description: 'Re-parse and sort keyframes by time', version: '1.0.0' },
                        { syntax: 'set-easing <name> <time_ms> <attr> <easing>', description: 'Set easing for a keyframe', version: '1.0.0' },
                        { syntax: 'set-type <name> <time_ms> <type>', description: 'Set keyframe type', version: '1.0.0' },
                        { syntax: 'refresh <name>', description: 'Regenerate handout from parsed cache', version: '1.0.0' },
                    ]},
                    { group: 'Reference', commands: [
                        { syntax: 'example [search]', description: 'List built-in examples with Play/Loop buttons', version: '1.0.0' },
                        { syntax: 'example! <name>', description: 'Generate an example recording handout', version: '1.0.0' },
                        { syntax: 'debug', description: 'Show active recording/playback sessions', version: '1.0.0' },
                        { syntax: 'dump-html <name>', description: 'Print raw handout HTML to API console', version: '1.0.0' },
                    ]},
                ],
                topics: {
                    expressions: {
                        title: 'Expressions',
                        description: 'Expression syntax for keyframe values',
                        version: '1.0.0',
                        body: 'Keyframe cells support expressions instead of plain values. Prefix with `=` for absolute mode.\n\n'
                            + '**Variables:** `orig` (start value), `prev` (previous keyframe), `curr` (current live value), `t` (normalized time 0–1, requires continuous easing)\n\n'
                            + '**Examples:**\n'
                            + '`+rand(-140,140)` — random additive delta\n'
                            + '`=orig + sin(t * TAU) * 140` — sine wave (continuous)\n'
                            + '`=clamp(prev+50, orig-200, orig+200)` — clamped accumulation\n'
                            + '`=color.hsl(t * 360, 100, 50)` — rainbow cycle',
                    },
                    timeSyntax: {
                        title: 'Time Expression Syntax',
                        description: 'How to specify keyframe timing',
                        version: '1.0.0',
                        body: '`=5000` or `5000` — Absolute (fire at 5000ms)\n'
                            + '`=rand(3000,6000)` — Absolute expression\n'
                            + '`+2000` — Relative (2000ms after previous keyframe)\n'
                            + '`+rand(1000,3000)` — Relative expression\n\n'
                            + 'Time expressions can only use the `prev` variable (previous resolved timestamp).',
                    },
                    easing: {
                        title: 'Easing',
                        description: 'Per-attribute interpolation curves',
                        version: '1.0.0',
                        body: 'Easing cells control interpolation between keyframes. Leave blank for linear.\n\n'
                            + '**Curves:** `quad`, `sine`, `cubic`, `expo`, `circle`, `power(n)`, `bezier(x1,y1,x2,y2)`\n\n'
                            + '**Modifiers:** prefix `~` for ease-out (e.g. `~quad`). Default is ease-in.\n\n'
                            + '**Special:** `step` (instant jump), `continuous` (re-evaluate every tick — required for `t`-based animations)\n\n'
                            + 'For ease-in-out: add an empty row at the midpoint with a `~curve` easing.',
                    },
                    continuous: {
                        title: 'Continuous Animations',
                        description: 'Mathematical function-driven animations',
                        version: '1.0.1',
                        body: 'For animations driven by math (orbit, oscillation), use `continuous` easing with the `t` variable. '
                            + 'The expression re-evaluates every tick instead of lerping between two values.\n\n'
                            + '**Example (orbit):**\n'
                            + 'Row 1: time `=0`, easing `continuous`, no delta\n'
                            + 'Row 2: time `=3000`, left `=orig + cos(t * TAU) * 140`, top `=orig + sin(t * TAU) * 140`\n\n'
                            + '`freeze(value)` — memoizes a result for the segment. Stabilizes impure functions in continuous easing.\n\n'
                            + 'Impure functions (`rand`, `randInt`, `pick`) are auto-memoized in non-continuous segments but re-evaluate every tick in continuous segments.',
                    },
                    extensions: {
                        title: 'Extensions',
                        description: 'How other scripts extend Sequence',
                        version: '1.0.0',
                        handouts: 'usr',
                        body: 'Other scripts can register custom attributes, functions, constants, and easing curves with Sequence.\n\n'
                            + 'Look for **Help: Sequence/<ExtensionName>** handouts in your journal for extension-specific documentation.\n\n'
                            + '`!sequence man <namespace>` — explore everything a loaded extension has registered\n'
                            + '`!sequence man attr` / `func` / `vars` / `easing` — list everything across all namespaces\n\n'
                            + 'Script developers: run `!sequence gen-dev-docs` to generate the full extension developer guide.',
                    },
                    extensionApi: {
                        title: 'Extension API',
                        description: 'Registration functions for extending Sequence',
                        version: '1.0.0',
                        handouts: 'dev',
                        body: 'Listen for `!sequence-ready` in chat, then call registration functions on the `Sequence` global:\n\n'
                            + '`Sequence.registerAttribute(sourceId, reg)` — Register a custom attribute for recording/playback\n'
                            + '`Sequence.registerAttributeGroup(sourceId, attrs, opts)` — Group correlated attributes\n'
                            + '`Sequence.registerPlaybackConstant(sourceId, reg)` — Add a constant for expressions\n'
                            + '`Sequence.registerEasing(sourceId, reg)` — Add a custom easing curve\n'
                            + '`Sequence.registerExample(sourceId, struct)` — Register a pre-built example recording\n'
                            + '`Sequence.generateExtensionHandout(sourceId, opts)` — Generate a help handout for your extension\n\n'
                            + 'Use `!sequence man` in chat for live lookup of all registered attributes, functions, and constants.',
                    },
                    registeredAttrs: {
                        title: 'Attributes',
                        description: 'All attributes available for recording/playback',
                        version: '1.0.0',
                        handouts: 'dev',
                        items: () => Object.values(ATTR_REGISTRY).sort((a, b) => {
                            if (a.namespace === 'core' && b.namespace !== 'core') return -1;
                            if (b.namespace === 'core' && a.namespace !== 'core') return  1;
                            if (a.namespace !== b.namespace) return a.namespace.localeCompare(b.namespace);
                            return a.name.localeCompare(b.name);
                        }).map(r => ({
                            name: (r.namespace === 'core' ? r.name : r.namespace + '.' + r.name)
                                + ' [' + (r.valueType || 'any') + (r.lerp !== null ? ', lerp' : '') + ']',
                            description: r.description || '',
                            version: '1.0.0',
                        })),
                    },
                    registeredFuncs: {
                        title: 'Functions',
                        description: 'All functions available in expressions',
                        version: '1.0.0',
                        handouts: 'dev',
                        items: () => {
                            const valueFns = Object.values(FN_REGISTRY).sort((a, b) => {
                                if (a.namespace === 'core' && b.namespace !== 'core') return -1;
                                if (b.namespace === 'core' && a.namespace !== 'core') return  1;
                                if (a.namespace !== b.namespace) return a.namespace.localeCompare(b.namespace);
                                return a.name.localeCompare(b.name);
                            }).map(r => {
                                const ns = r.namespace === 'core' ? '' : r.namespace + '.';
                                const argList = (r.args || []).map(a => a.optional ? '[' + a.name + ']' : a.name).join(', ');
                                return { name: ns + r.name + '(' + argList + ') → ' + (r.returns || 'number'), description: r.description || '', version: '1.0.0' };
                            });
                            const timingFns = Object.values(TIME_FN_REGISTRY).sort((a, b) => {
                                if (a.namespace === 'core' && b.namespace !== 'core') return -1;
                                if (b.namespace === 'core' && a.namespace !== 'core') return  1;
                                return a.name.localeCompare(b.name);
                            }).map(r => {
                                const ns = r.namespace === 'core' ? '' : r.namespace + '.';
                                const argList = (r.args || []).map(a => a.optional ? '[' + a.name + ']' : a.name).join(', ');
                                return { name: '[timing] ' + ns + r.name + '(' + argList + ') → ' + (r.returns || 'number'), description: r.description || '', version: '1.0.0' };
                            });
                            return valueFns.concat(timingFns);
                        },
                    },
                    registeredConsts: {
                        title: 'Constants',
                        description: 'All constants available in expressions',
                        version: '1.0.0',
                        handouts: 'dev',
                        items: () => Object.values(CONST_REGISTRY).sort((a, b) => {
                            if (a.namespace === 'core' && b.namespace !== 'core') return -1;
                            if (b.namespace === 'core' && a.namespace !== 'core') return  1;
                            if (a.namespace !== b.namespace) return a.namespace.localeCompare(b.namespace);
                            return a.name.localeCompare(b.name);
                        }).map(r => ({
                            name: (r.namespace === 'core' ? '' : r.namespace + '.') + r.name + ' = ' + String(r.value),
                            description: r.description || '',
                            version: '1.0.0',
                        })),
                    },
                    registeredEasing: {
                        title: 'Easing Curves',
                        description: 'All easing curves available for interpolation',
                        version: '1.0.0',
                        handouts: 'dev',
                        items: () => Object.values(EASING_REGISTRY).sort((a, b) => {
                            if (a.source === SCRIPT_NAME && b.source !== SCRIPT_NAME) return -1;
                            if (b.source === SCRIPT_NAME && a.source !== SCRIPT_NAME) return  1;
                            return a.name.localeCompare(b.name);
                        }).map(r => ({
                            name: r.name + (r.source !== SCRIPT_NAME ? ' [' + r.source + ']' : ''),
                            description: r.description || '',
                            version: '1.0.0',
                        })),
                    },
                },
            },
        });
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:handout:notes',  onHandoutChanged);

        // ── ScriptKit integration ─────────────────────────────────────────
        on('chat:message', (msg) => {
            if (msg.type === 'api' && msg.content === '!scriptkit-ready') registerWithScriptKit();
        });
        registerWithScriptKit();

        // ── Choreograph integration ───────────────────────────────────────
        const registerWithChoreograph = () => {
            if (typeof Choreograph === 'undefined') return;

            // Register constants
            Choreograph.registerConstant(SCRIPT_NAME, { name: 'PI', namespace: 'core', value: Math.PI, description: 'π' });
            Choreograph.registerConstant(SCRIPT_NAME, { name: 'TAU', namespace: 'core', value: Math.PI * 2, description: '2π' });

            // Lifecycle hook — handle !sequence play/stop-play/pause-play/resume-play
            Choreograph.registerLifecycleHook(SCRIPT_NAME, {
                commands: [/^!sequence\b/],
                start: (ctx) => {
                    handleInput(ctx);
                },
                stop: (ctx) => {
                    (ctx.selected || []).forEach(s => stopPlayback(s._id));
                },
                pause: (ctx) => {
                    (ctx.selected || []).forEach(s => pausePlayback(s._id));
                },
                resume: (ctx) => {
                    (ctx.selected || []).forEach(s => resumePlayback(s._id));
                },
            });

            // Sync participant — wait for playback to finish on tokens
            Choreograph.registerSyncParticipant(SCRIPT_NAME, {
                commands: [/^!sequence play\b/],
                waiting: (ctx) => {
                    // Gather all token IDs from entries
                    const tokenIds = new Set();
                    (ctx.entries || []).forEach(entry => {
                        (entry.selected || []).forEach(s => tokenIds.add(s._id));
                    });
                    // Poll until none have active playback
                    const check = setInterval(() => {
                        let stillPlaying = false;
                        tokenIds.forEach(id => { if (activePlayback[id]) stillPlaying = true; });
                        if (!stillPlaying) {
                            clearInterval(check);
                            ctx.done();
                        }
                    }, 100);
                },
            });

            log(`${SCRIPT_NAME}: registered with Choreograph`);
        };

        // Listen for choreograph-ready signal
        on('chat:message', (msg) => {
            if (msg.type === 'api' && msg.content === '!choreograph-ready') registerWithChoreograph();
        });
        // Also register immediately if Choreograph is already loaded
        registerWithChoreograph();

        // Record all graphic change events
        // Register change events for all attributes that have a watchProp
        // (core attributes have watchProp = their Roll20 property name;
        //  external attributes set watchProp to the Roll20 property they proxy, or null to skip)
        const watchProps = new Set(
            Object.values(ATTR_REGISTRY)
                .map(r => r.watchProp)
                .filter(Boolean)
        );
        watchProps.forEach(prop => on(`change:graphic:${prop}`, onObjectChanged));
    };

    // =========================================================================
    // Public API
    // =========================================================================

    return {
        checkInstall,
        registerEventHandlers,

        // Extension registration
        registerAttribute,
        registerPlaybackConstant,
        registerEasing,
        registerExample,
        registerAttributeGroup,
        generateExtensionHandout,

        // Registry introspection — returns struct or null
        getAttribute:   getAttrReg,
        getFunction:    (qualName) => {
            const parts = qualName.split('.');
            const ns    = parts.length > 1 ? parts.slice(0, -1).join('.') : 'core';
            const name  = parts[parts.length - 1];
            return FN_REGISTRY[`${ns}/${name}`] || null;
        },
        getConstant:    (qualName) => {
            const parts = qualName.split('.');
            const ns    = parts.length > 1 ? parts.slice(0, -1).join('.') : 'core';
            const name  = parts[parts.length - 1];
            return CONST_REGISTRY[`${ns}/${name}`] || null;
        },
        getEasing,

        // Playback control — for scripts that trigger playback programmatically
        loadRecording,
        startPlayback,
        stopPlayback,
        pausePlayback,
        resumePlayback,
        startRecording,
        stopRecording,
        saveRecording,

        // Notify Sequence that a virtual attribute changed (for recording)
        notifyChange,
    };
})();

on('ready', () => {
    'use strict';
    Sequence.checkInstall();
    Sequence.registerEventHandlers();
});