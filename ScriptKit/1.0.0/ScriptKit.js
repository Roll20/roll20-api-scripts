// =============================================================================
// ScriptKit v1.0.0
// Last Updated: 2026-07-20
// Author: Kenan Millet
//
// Description:
//   Generic framework for Roll20 API scripts. Provides example/guide system,
//   handout generation, and initialization coordination.
//
//   Not a standalone script — provides a framework for other scripts to use.
//
// Dependencies: none
// =============================================================================
/* global on, sendChat, getObj, findObjs, createObj, playerIsGM, log, state */

var ScriptKit = ScriptKit || (() => {
    'use strict';

    const SCRIPT_NAME = 'ScriptKit';
    const HANDOUT_STEP = Object.freeze({ auto: true });

    // =========================================================================
    // Registry
    // =========================================================================

    // { 'ScriptName': { command, tag, aliases, exampleHandler } }
    const registrations = {};

    // { 'ScriptName/exampleName': { name, description, source, guide, ...custom } }
    const examples = {};

    // { guideId: { steps, currentStep, selections, params, msg, handoutName, source, onComplete } }
    const activeGuides = {};

    // Guide annotation system — temporary visual aids that auto-clear between steps
    // Stored in state for crash recovery
    var _annotations = [];

    const clearAnnotations = () => {
        _annotations.forEach(function(id) {
            var obj = getObj('pathv2', id);
            if (obj) obj.remove();
        });
        _annotations = [];
        if (state.ScriptKit) state.ScriptKit._annotations = [];
    };

    const guideAnnotate = (pageId, shape, x, y, opts) => {
        opts = opts || {};

        // Compute shape-specific geometry
        var points, cx = x, cy = y, pathShape;
        if (shape === 'circle') {
            var r = opts.radius || 40;
            points = [[0, 0], [r * 2, r * 2]];
            pathShape = 'eli';
        } else if (shape === 'arrow' || shape === 'line') {
            var fromX = opts.fromX != null ? opts.fromX : x - 50;
            var fromY = opts.fromY != null ? opts.fromY : y - 50;
            var dx = x - fromX;
            var dy = y - fromY;
            var len = Math.sqrt(dx * dx + dy * dy) || 1;
            var ux = dx / len;
            var uy = dy / len;
            var pts;
            if (shape === 'arrow') {
                var chevDepth = opts.chevronDepth || len * 0.2;
                var chevWidth = opts.chevronWidth || chevDepth * 0.6;
                // Chevron points: two points offset from the tip along and perpendicular to the shaft
                var backX = x - ux * chevDepth;
                var backY = y - uy * chevDepth;
                var h1x = backX - uy * chevWidth;
                var h1y = backY + ux * chevWidth;
                var h2x = backX + uy * chevWidth;
                var h2y = backY - ux * chevWidth;
                pts = [[fromX, fromY], [x, y], [h1x, h1y], [x, y], [h2x, h2y]];
            } else {
                pts = [[fromX, fromY], [x, y]];
            }
            var minX = Math.min.apply(null, pts.map(function(p) { return p[0]; }));
            var minY = Math.min.apply(null, pts.map(function(p) { return p[1]; }));
            var maxX = Math.max.apply(null, pts.map(function(p) { return p[0]; }));
            var maxY = Math.max.apply(null, pts.map(function(p) { return p[1]; }));
            cx = (minX + maxX) / 2;
            cy = (minY + maxY) / 2;
            points = pts.map(function(p) { return [p[0] - cx, p[1] - cy]; });
            pathShape = 'pol';
        } else if (shape === 'rect') {
            var rw = opts.width || 80;
            var rh = opts.height || 80;
            points = [[0, 0], [rw, rh]];
            pathShape = 'rec';
        } else {
            return null;
        }

        // Create with unified properties
        var obj = createObj('pathv2', {
            _pageid: pageId,
            layer: 'foreground',
            shape: pathShape,
            x: cx, y: cy,
            points: JSON.stringify(points),
            stroke: opts.color || '#ff0000',
            stroke_width: opts.strokeWidth || 3,
            fill: opts.fill || 'transparent',
        });

        if (obj) {
            _annotations.push(obj.get('id'));
            if (state.ScriptKit) state.ScriptKit._annotations = _annotations.slice();
        }
        return obj;
    };

    const guidePing = (pageId, x, y, opts) => {
        opts = opts || {};
        var player = opts.player || null;
        var playerId = player ? player.get('id') : (opts.playerId || null);
        var moveAll = opts.moveAll !== false;
        var visibleTo = opts.visibleTo || playerId || undefined;
        var color = opts.color || null;

        if (color && player) {
            var originalColor = player.get('color');
            player.set('color', color);
            setTimeout(function() {
                sendPing(x, y, pageId, playerId, moveAll, visibleTo);
                setTimeout(function() { player.set('color', originalColor); }, 200);
            }, 100);
        } else {
            sendPing(x, y, pageId, playerId, moveAll, visibleTo);
        }
    };

    // =========================================================================
    // HTML Helpers
    // =========================================================================

    const html = {
        escape: (str) => (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>'),
        raw: (str) => ({ __raw: true, toString: () => str, value: str }),
        render: (text) => {
            if (!text) return '';
            if (text.__raw) return text.value;
            return html.format(String(text));
        },
        style: (obj) => {
            if (!obj) return '';
            if (typeof obj === 'string') return obj;
            return Object.entries(obj).map(([k, v]) => k.replace(/[A-Z]/g, c => '-' + c.toLowerCase()) + ':' + v).join(';');
        },
        _tag: (tag, text, style) => '<' + tag + (style ? ' style="' + html.style(style) + '"' : '') + '>' + text + '</' + tag + '>',
        bold: (text, style) => html._tag('b', text, style),
        italic: (text, style) => html._tag('i', text, style),
        underline: (text, style) => html._tag('u', text, style),
        small: (text, style) => html._tag('small', text, style),
        sup: (text, style) => html._tag('sup', text, style),
        code: (text, style) => html._tag('code', html.escape(text), style),
        pre: (text, style) => html._tag('pre', text, style),
        paragraph: (text, style) => html._tag('p', text, style),
        div: (text, style) => html._tag('div', text, style),
        span: (text, style) => html._tag('span', text, style),
        line: () => '<hr>',
        br: () => '<br>',
        indent: (n) => '&nbsp;'.repeat(n || 2),
        link: (text, url, style) => '<a' + (style ? ' style="' + html.style(style) + '"' : '') + ' href="' + url + '">' + text + '</a>',
        handoutLink: (text, id, style) => '<a' + (style ? ' style="' + html.style(style) + '"' : '') + ' href="http://journal.roll20.net/handout/' + id + '">' + text + '</a>',
        version: (ver, style) => html.sup('[v' + ver + ']', style),
        newBadge: (style) => html.sup('[new]', style ? style : { color: '#c33', fontWeight: 'bold' }),
        deprecatedBadge: (ver, style) => html.sup('[deprecated' + (ver ? ' v' + ver : '') + ']', style ? style : { color: '#323' }),
        list: (items, style) => html._tag('ul', items.map(i => '<li>' + i + '</li>').join(''), style),
        orderedList: (items, style) => html._tag('ol', items.map(i => '<li>' + i + '</li>').join(''), style),
        section: (title, content) => html.bold(title) + html.br() + content,
        format: (str) => {
            if (!str) return '';
            // First pass: handle backslash escapes for markdown-special chars only
            var escaped = '';
            for (var i = 0; i < str.length; i++) {
                if (str[i] === '\\' && i + 1 < str.length) {
                    var next = str[i + 1];
                    if (next === '`' || next === '*' || next === '\\') {
                        escaped += '&#' + next.charCodeAt(0) + ';';
                        i++;
                    } else {
                        escaped += str[i];
                    }
                } else {
                    escaped += str[i];
                }
            }
            var out = html.escape(escaped);
            out = out.replace(/```([^`]+)```/g, '<pre>$1</pre>');
            out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
            out = out.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
            out = out.replace(/\*([^*]+)\*/g, '<i>$1</i>');
            return out;
        },
        button: (label, command, style) => {
            var defaultStyle = { background: '#333', color: '#fff', padding: '1px 6px', borderRadius: '3px', textDecoration: 'none' };
            var merged = style ? Object.assign({}, defaultStyle, style) : defaultStyle;
            return '<a style="' + html.style(merged) + '" href="' + command + '">' + label + '</a>';
        },
        table: (headers, rows, style) => {
            var tableStyle = style ? html.style(style) : 'border-collapse:collapse';
            var h = '<table style="' + tableStyle + '"><tr>' + headers.map(col => '<th style="border:1px solid #999;padding:2px 6px;">' + col + '</th>').join('') + '</tr>';
            h += rows.map(row => '<tr>' + row.map(cell => '<td style="border:1px solid #999;padding:2px 6px;">' + cell + '</td>').join('') + '</tr>').join('');
            h += '</table>';
            return h;
        },
    };

    // =========================================================================
    // Helpers
    // =========================================================================

    const getPlayerName = (playerid) => {
        if (!playerid || playerid === 'API') return 'gm';
        const player = getObj('player', playerid);
        return player ? player.get('_displayname') : 'gm';
    };

    const reply = (msg, scriptName, tag, text) => {
        const recipient = getPlayerName(msg.playerid);
        sendChat(scriptName + (tag ? ' [' + tag + ']' : ''), '/w "' + recipient + '" ' + text, null, { noarchive: true });
    };

    const replyError = (msg, scriptName, text) => reply(msg, scriptName, 'Error', html.format(text));

    const setHandoutNotes = (handout, notes) => {
        // Retry pattern for Roll20's async handout issues
        handout.set('notes', notes);
        setTimeout(() => handout.set('notes', notes), 200);
    };

    // =========================================================================
    // Registration API
    // =========================================================================

    // Pending example queue for scripts not yet registered
    const pendingExamples = {}; // { 'TargetScript': [ { registeredBy, struct }, ... ] }

    /**
     * Register a script with the Tutorial system.
     *
     * @param {string} scriptName  Display name of the script.
     * @param {object} opts        Configuration:
     *   @param {string}   opts.command         Chat command prefix (e.g. '!gaslight')
     *   @param {string}   opts.tag             Default handout tag (e.g. 'Scene', 'Sequence', 'Script')
     *   @param {object}   [opts.aliases]       Command name overrides (defaults provided)
     *   @param {function} [opts.exampleHandler] (example, msg) → { notes, gmnotes, avatar, tag, ... }
     *   @param {function} [opts.onComplete]    (ctx, handout) → void — called when guide completes
     */
    const register = (scriptName, opts) => {
        if (!scriptName || !opts || !opts.command || !opts.version) {
            log(SCRIPT_NAME + ': register requires scriptName, command, and version.');
            return false;
        }
        registrations[scriptName] = {
            _scriptName: scriptName,
            command: opts.command.startsWith('!') ? opts.command : '!' + opts.command,
            tag: opts.tag || null,
            aliases: (() => {
                const defaults = {
                    help: ['help', '--help'],
                    man: 'man',
                    whatsnew: 'whatsnew',
                    genHelp: 'gen-help',
                    genDev: 'gen-dev-docs',
                    examples: 'examples',
                    generate: 'example!',
                    guide: 'guide',
                    guideContinue: 'guide-continue',
                    guideBack: 'guide-back',
                    guideCancel: 'guide-cancel',
                    migrate: 'migrate',
                };
                var userAliases = opts.aliases || {};
                Object.keys(defaults).forEach(k => {
                    var val = userAliases[k];
                    if (val !== undefined) defaults[k] = val;
                });
                return defaults;
            })(),
            exampleHandler: opts.exampleHandler || null,
            onComplete: opts.onComplete || null,
            version: opts.version || null,
            stateRef: opts.state || null,
            migrations: opts.migrations || null,
            onMigrationFailure: opts.onMigrationFailure || null,
            help: opts.help || null,
            newSince: opts.newSince || null,
            handoutMode: opts.handout || 'auto',  // 'auto' | 'update' | 'manual'
            devHandoutMode: opts.devHandout || 'update',  // 'auto' | 'update' | 'manual'
        };

        // Drain pending queue for this script
        if (pendingExamples[scriptName]) {
            pendingExamples[scriptName].forEach(pending => {
                registerExample(scriptName, pending.registeredBy, pending.struct);
            });
            delete pendingExamples[scriptName];
        }

        // Run migrations if version and migrations provided
        if (opts.version && opts.migrations && opts.state) {
            runMigrations(scriptName, opts);
        }

        // Track version changes (for [new] badges and handout regeneration)
        if (opts.version) {
            ensureState();
            var currentStored = state[SCRIPT_NAME].versions[scriptName];
            if (currentStored && compareSemver(currentStored, opts.version) !== 0) {
                state[SCRIPT_NAME].previousVersions[scriptName] = currentStored;
            }
            state[SCRIPT_NAME].versions[scriptName] = opts.version;
        }

        // Auto-generate user help handout based on handoutMode ('auto' | 'update' | 'manual')
        if (opts.help && opts.version && registrations[scriptName].handoutMode !== 'manual') {
            ensureState();
            var storedVer = state[SCRIPT_NAME].versions[scriptName] || '0.0.0';
            var existing = findObjs({ type: 'handout', name: 'Help: ' + scriptName })[0];
            var versionChanged = compareSemver(storedVer, opts.version) !== 0;
            var shouldGenerate = registrations[scriptName].handoutMode === 'auto'
                ? (versionChanged || !existing)
                : (versionChanged && existing);  // 'update' mode: only if exists AND version changed
            if (shouldGenerate) {
                setTimeout(() => generateHelpHandout(null, scriptName, registrations[scriptName], 'usr'), 500);
            }
        }

        // Auto-generate dev handout based on devHandoutMode ('auto' | 'update' | 'manual')
        if (opts.help && opts.version && registrations[scriptName].devHandoutMode !== 'manual') {
            ensureState();
            var storedVerDev = state[SCRIPT_NAME].versions[scriptName] || '0.0.0';
            var existingDev = findObjs({ type: 'handout', name: 'Help: ' + scriptName + '/Dev' })[0];
            var versionChangedDev = compareSemver(storedVerDev, opts.version) !== 0;
            var shouldGenerateDev = registrations[scriptName].devHandoutMode === 'auto'
                ? (versionChangedDev || !existingDev)
                : (versionChangedDev && existingDev);
            if (shouldGenerateDev) {
                setTimeout(() => generateHelpHandout(null, scriptName, registrations[scriptName], 'dev'), 600);
            }
        }

        // Send ready signal
        sendChat('', registrations[scriptName].command + '-ready', null, { noarchive: true });

        // MOTD — whisper a random tip to GM on registration
        if (opts.motd && Array.isArray(opts.motd) && opts.motd.length > 0) {
            setTimeout(() => {
                var tip = opts.motd[Math.floor(Math.random() * opts.motd.length)];
                var frameStyle = Object.assign(
                    { background: '#1a1a2e', color: '#eee', padding: '8px 12px', borderRadius: '4px', borderLeft: '3px solid #4fc3f7', fontSize: '12px', marginTop: '4px' },
                    opts.motdStyle || {}
                );
                var header = opts.motdHeader !== undefined
                    ? (typeof opts.motdHeader === 'function' ? opts.motdHeader(opts.version) : opts.motdHeader)
                    : '💡 **' + scriptName + ' v' + (opts.version || '') + '**';
                var card = html.div(
                    html.render(header) + html.br() + html.render(tip),
                    frameStyle
                );
                sendChat(scriptName, '/w gm ' + card, null, { noarchive: true });
            }, 1500);
        }

        return true;
    };

    // =========================================================================
    // Migrations
    // =========================================================================

    const ensureState = () => {
        if (!state[SCRIPT_NAME]) state[SCRIPT_NAME] = {};
        if (!state[SCRIPT_NAME].versions) state[SCRIPT_NAME].versions = {};
        if (!state[SCRIPT_NAME].previousVersions) state[SCRIPT_NAME].previousVersions = {};
        if (!state[SCRIPT_NAME].migrations) state[SCRIPT_NAME].migrations = {};
    };

    /**
     * Compare semver strings. Returns -1, 0, or 1.
     */
    const compareSemver = (a, b) => {
        const pa = a.split(/[.\-]/);
        const pb = b.split(/[.\-]/);
        const len = Math.max(pa.length, pb.length);
        for (let i = 0; i < len; i++) {
            const ra = pa[i] || '';
            const rb = pb[i] || '';
            if (ra === rb) continue;
            if (ra === '') return -1;
            if (rb === '') return 1;
            const na = Number(ra);
            const nb = Number(rb);
            if (!isNaN(na) && !isNaN(nb)) {
                if (na < nb) return -1;
                if (na > nb) return 1;
            } else {
                if (ra < rb) return -1;
                if (ra > rb) return 1;
            }
        }
        return 0;
    };

    /**
     * Determine if an item's version qualifies as "new".
     * If newSince is set: item.version >= newSince
     * Default: item's major.minor > previous stored major.minor
     */
    const isNewVersion = (itemVersion, reg) => {
        if (!itemVersion || !reg.version) return false;
        ensureState();
        var prev = state[SCRIPT_NAME].previousVersions[reg._scriptName];
        if (!prev) return false;  // first install — nothing is "new"
        if (reg.newSince) {
            // newSince is set: item is new if >= newSince OR if > previousVersion
            if (compareSemver(itemVersion, reg.newSince) >= 0) return true;
            return compareSemver(itemVersion, prev) > 0;
        }
        // Default: compare major.minor against previous stored version (> not >=)
        var prevMinor = prev.split(/[.\-]/).slice(0, 2).join('.');
        var itemMinor = itemVersion.split(/[.\-]/).slice(0, 2).join('.');
        return compareSemver(itemMinor, prevMinor) > 0;
    };

    /**
     * Get sorted migration version keys between two versions.
     */
    const getMigrationsBetween = (migrations, fromVersion, toVersion, direction) => {
        const versions = Object.keys(migrations).sort(compareSemver);
        if (direction === 'up') {
            return versions.filter(v => compareSemver(v, fromVersion) > 0 && compareSemver(v, toVersion) <= 0);
        } else {
            // Rollback: versions from stored down to (but not including) target, in reverse
            return versions.filter(v => compareSemver(v, toVersion) > 0 && compareSemver(v, fromVersion) <= 0).reverse();
        }
    };

    /**
     * Run forward migrations automatically on register.
     */
    const runMigrations = (scriptName, opts) => {
        ensureState();
        const storedVersion = state[SCRIPT_NAME].versions[scriptName] || '0.0.0';
        const currentVersion = opts.version;

        if (compareSemver(storedVersion, currentVersion) === 0) return; // up to date

        if (compareSemver(storedVersion, currentVersion) > 0) {
            // Downgrade detected — warn, don't auto-rollback
            log(SCRIPT_NAME + ': ' + scriptName + ' downgraded from ' + storedVersion + ' to ' + currentVersion + '. Run ' + opts.command + ' ' + (registrations[scriptName].aliases.migrate || 'migrate') + ' to revert state.');
            // Whisper on next chat opportunity (can't whisper during ready)
            setTimeout(() => {
                sendChat(scriptName, '/w gm ⚠️ ' + html.bold(scriptName) + ' downgraded from ' + storedVersion + ' to ' + currentVersion + '. State may be incompatible. Use ' + html.code(opts.command + ' ' + (registrations[scriptName].aliases.migrate || 'migrate')) + ' to revert state.', null, { noarchive: true });
            }, 1000);
            return;
        }

        // Upgrade — run migrations on a working copy, commit only if all succeed
        const toRun = getMigrationsBetween(opts.migrations, storedVersion, currentVersion, 'up');
        var working = JSON.parse(JSON.stringify(opts.state));
        var downStrings = {};
        for (let i = 0; i < toRun.length; i++) {
            const v = toRun[i];
            const migration = opts.migrations[v];
            const upFn = typeof migration === 'function' ? migration : migration.up;
            if (typeof upFn !== 'function') continue;
            try {
                upFn(working);
                if (typeof migration === 'object' && typeof migration.down === 'string') {
                    downStrings[v] = migration.down;
                } else if (typeof migration === 'object' && migration.down && typeof migration.down !== 'string') {
                    log(SCRIPT_NAME + ': ' + scriptName + ' migration ' + v + ' \'down\' must be a string (for persistence). It will not be stored for future rollback.');
                }
            } catch (e) {
                log(SCRIPT_NAME + ': ' + scriptName + ' migration to ' + v + ' FAILED: ' + e.message);
                sendChat(scriptName, '/w gm ❌ ' + html.bold(scriptName) + ' migration to ' + v + ' failed: ' + e.message + '. State unchanged (version ' + storedVersion + ').', null, { noarchive: true });
                const reg = registrations[scriptName];
                if (reg && typeof reg.onMigrationFailure === 'function') {
                    reg.onMigrationFailure({ version: v, direction: 'up', error: e, currentStoredVersion: storedVersion });
                }
                return;
            }
        }

        // All migrations succeeded — commit working copy to real state
        Object.keys(opts.state).forEach(k => delete opts.state[k]);
        Object.assign(opts.state, working);
        // Persist down strings
        if (Object.keys(downStrings).length > 0) {
            if (!state[SCRIPT_NAME].migrations[scriptName]) state[SCRIPT_NAME].migrations[scriptName] = {};
            Object.assign(state[SCRIPT_NAME].migrations[scriptName], downStrings);
        }

        if (toRun.length > 0) {
            log(SCRIPT_NAME + ': ' + scriptName + ' migrated from ' + storedVersion + ' to ' + currentVersion + ' (' + toRun.length + ' migration(s)).');
        }
    };

    /**
     * Handle migrate command — sync state version to current script version.
     */
    const handleMigrateCommand = (msg, scriptName, reg, args) => {
        ensureState();
        const storedVersion = state[SCRIPT_NAME].versions[scriptName] || '0.0.0';
        const currentVersion = reg.version;

        if (compareSemver(storedVersion, currentVersion) === 0) {
            reply(msg, scriptName, 'Migrate', 'Already at target version ' + html.bold(currentVersion) + '.');
            return;
        }

        if (compareSemver(storedVersion, currentVersion) < 0) {
            // Forward — run up migrations on working copy
            if (!reg.migrations || !reg.stateRef) {
                replyError(msg, scriptName, 'No migrations registered for ' + scriptName + '.');
                return;
            }
            const toRun = getMigrationsBetween(reg.migrations, storedVersion, currentVersion, 'up');
            var working = JSON.parse(JSON.stringify(reg.stateRef));
            var downStrings = {};
            for (let i = 0; i < toRun.length; i++) {
                const v = toRun[i];
                const migration = reg.migrations[v];
                const upFn = typeof migration === 'function' ? migration : migration.up;
                if (typeof upFn !== 'function') continue;
                try {
                    upFn(working);
                    if (typeof migration === 'object' && typeof migration.down === 'string') {
                        downStrings[v] = migration.down;
                    } else if (typeof migration === 'object' && migration.down && typeof migration.down !== 'string') {
                        log(SCRIPT_NAME + ': ' + scriptName + ' migration ' + v + ' \'down\' must be a string (for persistence). It will not be stored for future rollback.');
                    }
                } catch (e) {
                    replyError(msg, scriptName, 'Migration to ' + v + ' failed: ' + e.message + '. State unchanged (version ' + storedVersion + ').');
                    if (typeof reg.onMigrationFailure === 'function') {
                        reg.onMigrationFailure({ version: v, direction: 'up', error: e, currentStoredVersion: storedVersion });
                    }
                    return;
                }
            }
            // Commit
            Object.keys(reg.stateRef).forEach(k => delete reg.stateRef[k]);
            Object.assign(reg.stateRef, working);
            if (Object.keys(downStrings).length > 0) {
                if (!state[SCRIPT_NAME].migrations[scriptName]) state[SCRIPT_NAME].migrations[scriptName] = {};
                Object.assign(state[SCRIPT_NAME].migrations[scriptName], downStrings);
            }
            state[SCRIPT_NAME].versions[scriptName] = currentVersion;
            reply(msg, scriptName, 'Migrate', 'Migrated forward ' + toRun.length + ' step(s). State now at version ' + html.bold(currentVersion) + '.');
        } else {
            // Backward — use stored down strings, run on working copy
            var storedMigrations = state[SCRIPT_NAME].migrations[scriptName] || {};
            var versions = Object.keys(storedMigrations).sort(compareSemver);
            var toRollBack = versions.filter(v => compareSemver(v, currentVersion) > 0 && compareSemver(v, storedVersion) <= 0).reverse();

            if (toRollBack.length === 0) {
                replyError(msg, scriptName, 'No stored rollback migrations available. State cannot be reverted.');
                return;
            }

            var stateRef = reg.stateRef || state[scriptName] || {};
            var working = JSON.parse(JSON.stringify(stateRef));
            for (let i = 0; i < toRollBack.length; i++) {
                const v = toRollBack[i];
                const downStr = storedMigrations[v];
                if (!downStr) {
                    replyError(msg, scriptName, 'Migration ' + v + ' has no stored rollback function. Cannot continue.');
                    return;
                }
                try {
                    var downFn = (new Function('return ' + downStr))();
                    downFn(working);
                } catch (e) {
                    replyError(msg, scriptName, 'Rollback of ' + v + ' failed: ' + e.message + '. State unchanged (version ' + storedVersion + ').');
                    if (typeof reg.onMigrationFailure === 'function') {
                        reg.onMigrationFailure({ version: v, direction: 'down', error: e, currentStoredVersion: storedVersion });
                    }
                    return;
                }
            }
            // Commit — overwrite state and clean up stored migrations
            Object.keys(stateRef).forEach(k => delete stateRef[k]);
            Object.assign(stateRef, working);
            toRollBack.forEach(v => delete storedMigrations[v]);
            state[SCRIPT_NAME].versions[scriptName] = currentVersion;
            reply(msg, scriptName, 'Migrate', 'Rolled back ' + toRollBack.length + ' migration(s). State now at version ' + html.bold(currentVersion) + '.');
        }
    };

    /**
     * Register an example for a script.
     *
     * @param {string} targetScript  Script this example belongs to (must be registered, or will queue).
     * @param {string} registeredBy  Script providing this example.
     * @param {object} struct        Example definition:
     *   @param {string}   struct.name         Example name (unique per script).
     *   @param {string}   [struct.description] Human-readable description.
     *   @param {object}   [struct.handout]    Default handler fields: { notes, gmnotes, avatar, archived, inplayerjournals }
     *   @param {array}    [struct.guide]      Array of guide step objects.
     *   ... any additional script-specific fields passed to exampleHandler.
     */
    const registerExample = (targetScript, registeredBy, struct) => {
        if (!struct || !struct.name) {
            log(SCRIPT_NAME + ': registerExample requires a name.');
            return false;
        }
        if (!struct.handout && (!struct.guide || struct.guide.length === 0)) {
            log(SCRIPT_NAME + ': registerExample "' + struct.name + '" requires a handout, a guide, or both.');
            return false;
        }

        // Queue if target not yet registered
        if (!registrations[targetScript]) {
            if (!pendingExamples[targetScript]) pendingExamples[targetScript] = [];
            pendingExamples[targetScript].push({ registeredBy, struct });
            return true;
        }

        const key = targetScript + '/' + struct.name;
        if (examples[key]) return false;
        examples[key] = Object.assign({ source: registeredBy, target: targetScript }, struct);
        return true;
    };

    // =========================================================================
    // Input Handling
    // =========================================================================

    /**
     * Attempt to handle a chat message. Returns true if consumed, false otherwise.
     * Call this early in your script's chat handler:
     *   if (Tutorial.handleInput(msg)) return;
     */
    const handleInput = (msg) => {
        if (msg.type !== 'api') return false;
        const firstWord = msg.content.split(' ')[0];

        // Find which registered script this command belongs to
        const entry = Object.entries(registrations).find(e => e[1].command === firstWord);
        if (!entry) return false;

        const [scriptName, reg] = entry;
        const content = msg.content.slice(reg.command.length).trim();

        // Parse args (quote-aware)
        const args = [];
        var argRx = /"([^"]*)"|'([^']*)'|`([^`]*)`|(\S+)/g;
        var m;
        while ((m = argRx.exec(content)) !== null) {
            args.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4]);
        }
        const cmd = (args.shift() || '').toLowerCase();

        // Alias matcher — supports string or array of strings
        const matchAlias = (alias) => {
            if (!alias) return false;
            if (Array.isArray(alias)) return alias.some(a => a === cmd);
            return alias === cmd;
        };

        // Check aliases
        if (matchAlias(reg.aliases.help)) {
            showHelp(msg, scriptName, reg, args);
            return true;
        }
        if (matchAlias(reg.aliases.man)) {
            showMan(msg, scriptName, reg, args);
            return true;
        }
        if (matchAlias(reg.aliases.whatsnew)) {
            showWhatsNew(msg, scriptName, reg);
            return true;
        }
        if (matchAlias(reg.aliases.genHelp)) {
            generateHelpHandout(msg, scriptName, reg, 'usr');
            return true;
        }
        if (matchAlias(reg.aliases.genDev)) {
            generateHelpHandout(msg, scriptName, reg, 'dev');
            return true;
        }
        if (matchAlias(reg.aliases.examples)) {
            showExamples(msg, scriptName, reg, args);
            return true;
        }
        if (matchAlias(reg.aliases.generate)) {
            generateExample(msg, scriptName, reg, args);
            return true;
        }
        if (matchAlias(reg.aliases.guide)) {
            startGuideByName(msg, scriptName, reg, args);
            return true;
        }
        if (matchAlias(reg.aliases.guideContinue)) {
            handleGuideContinue(msg, args[0], args.slice(1));
            return true;
        }
        if (matchAlias(reg.aliases.guideBack)) {
            handleGuideBack(msg, args[0]);
            return true;
        }
        if (matchAlias(reg.aliases.guideCancel)) {
            handleGuideCancel(msg, args[0]);
            return true;
        }
        if (matchAlias(reg.aliases.migrate)) {
            handleMigrateCommand(msg, scriptName, reg, args);
            return true;
        }

        return false;
    };

    // =========================================================================
    // Help & Man
    // =========================================================================

    /**
     * Show concise help (command overview).
     */
    const showHelp = (msg, scriptName, reg, args) => {
        const helpData = reg.help;
        if (!helpData) {
            reply(msg, scriptName, 'Help', 'No help registered for ' + scriptName + '.');
            return;
        }

        const search = args.length > 0 ? args.join(' ').toLowerCase() : null;
        const version = reg.version;

        let out = '';
        if (helpData.description) {
            out += html.bold(html.escape(scriptName));
            if (version) out += ' ' + html.small(html.bold('v' + version));
            out += html.paragraph(html.small(helpData.description)) + html.line();
        }

        // Commands
        if (helpData.commands && helpData.commands.length > 0) {
            // Auto-inject ScriptKit-managed commands at the top
            var helpAlias = Array.isArray(reg.aliases.help) ? reg.aliases.help[0] : reg.aliases.help;
            var manAlias = Array.isArray(reg.aliases.man) ? reg.aliases.man[0] : reg.aliases.man;
            var autoCommands = [];
            if (helpAlias) autoCommands.push({ syntax: helpAlias, description: 'Show this help' });
            if (manAlias && helpData.topics && Object.keys(helpData.topics).length > 0) autoCommands.push({ syntax: manAlias + ' [topic]', description: 'Detailed help by topic' });
            if (reg.aliases.examples) autoCommands.push({ syntax: reg.aliases.examples, description: 'Browse examples' });

            var renderCommands = function(items, search, version, reg) {
                var out = '';
                items.forEach(c => {
                    if (c.group) {
                        var groupContent = renderCommands(c.commands || [], search, version, reg);
                        if (groupContent) {
                            out += html.paragraph(html.bold(html.escape(c.group) + ':') + html.br() + groupContent);
                        }
                    } else {
                        if (c.deleted) return;
                        if (search && (c.syntax || '').toLowerCase().indexOf(search) === -1 &&
                            (c.description || '').toLowerCase().indexOf(search) === -1) return;
                        var vTag = '';
                        if (isNewVersion(c.version, reg)) vTag = ' ' + html.newBadge();
                        if (c.deprecated) vTag = ' ' + html.deprecatedBadge();
                        out += html.code(reg.command + ' ' + c.syntax) + vTag + ' — ' + html.escape(c.description) + html.br();
                    }
                });
                return out;
            };

            // Render auto commands
            var autoOutput = renderCommands(autoCommands, search, version, reg);
            if (autoOutput) out += html.paragraph(autoOutput);

            // Render user commands
            var cmdOutput = renderCommands(helpData.commands, search, version, reg);
            if (cmdOutput) {
                out += html.bold('Commands:') + html.br() + cmdOutput;
            }
        }

        // Topics summary (if man is available)
        if (helpData.topics && Object.keys(helpData.topics).length > 0 && reg.aliases.man) {
            var topicKeys = Object.keys(helpData.topics).filter(k => !helpData.topics[k].deleted);
            if (search) {
                topicKeys = topicKeys.filter(k => {
                    var t = helpData.topics[k];
                    return k.toLowerCase().indexOf(search) !== -1 ||
                        (t.title || '').toLowerCase().indexOf(search) !== -1 ||
                        (t.description || '').toLowerCase().indexOf(search) !== -1;
                });
            }
            if (topicKeys.length > 0) {
                var manCmd = Array.isArray(reg.aliases.man) ? reg.aliases.man[0] : reg.aliases.man;
                out += html.line() + html.bold('Topics') + ' ' + html.small('(use ' + html.code(reg.command + ' ' + manCmd + ' <topic or search>') + ')') + html.br();
                topicKeys.forEach(k => {
                    var t = helpData.topics[k];
                    var vTag = '';
                    if (isNewVersion(t.version, reg)) vTag = ' ' + html.newBadge();
                    if (t.deprecated) vTag = ' ' + html.deprecatedBadge();
                    out += '• ' + html.bold(html.escape(t.title || k)) + vTag;
                    if (t.description) out += ' — ' + html.escape(t.description);
                    out += html.br();
                });
            }
        }

        if (!out) {
            out = 'No results for "' + html.escape(search) + '".';
        }

        reply(msg, scriptName, 'Help', out);
    };

    /**
     * Show man page (detailed topic lookup with tiered search).
     */
    const showMan = (msg, scriptName, reg, args) => {
        const helpData = reg.help;
        if (!helpData || !helpData.topics) {
            reply(msg, scriptName, 'Man', 'No documentation registered for ' + scriptName + '.');
            return;
        }

        const topics = helpData.topics;
        const search = args.length > 0 ? args.join(' ').toLowerCase() : null;
        var manCmd = Array.isArray(reg.aliases.man) ? reg.aliases.man[0] : reg.aliases.man;

        // No search — list all topics
        if (!search) {
            let out = html.bold(html.escape(scriptName) + ' — Topics:') + html.paragraph('');
            Object.entries(topics).forEach(([key, t]) => {
                if (t.deleted) return;
                out += '• ' + html.button(t.title || key, reg.command + ' ' + manCmd + ' ' + key);
                if (t.description) out += ' — ' + html.escape(t.description);
                out += html.br();
            });
            reply(msg, scriptName, 'Man', out);
            return;
        }

        // Tier 1: exact topic key match
        if (topics[search] && !topics[search].deleted) {
            renderManTopic(msg, scriptName, reg, search, topics[search]);
            return;
        }

        // Tier 1a: command lookup by first word of syntax
        if (helpData.commands) {
            var flatCmds = [];
            var flattenC = (items) => { items.forEach(c => { if (c.group) flattenC(c.commands || []); else flatCmds.push(c); }); };
            flattenC(helpData.commands);
            var cmdMatch = flatCmds.find(c => !c.deleted && c.items && c.syntax.split(' ')[0].toLowerCase() === search);
            if (cmdMatch) {
                renderManCommand(msg, scriptName, reg, cmdMatch);
                return;
            }
        }

        // Tier 1b: exact title match
        const titleMatch = Object.entries(topics).find(([k, t]) =>
            !t.deleted && (t.title || k).toLowerCase() === search
        );
        if (titleMatch) {
            renderManTopic(msg, scriptName, reg, titleMatch[0], titleMatch[1]);
            return;
        }

        // Tier 2: search within topic items/body
        const results = [];
        Object.entries(topics).forEach(([key, t]) => {
            if (t.deleted) return;
            // Check items array if present
            if (t.items && Array.isArray(t.items)) {
                t.items.forEach(item => {
                    const nameMatch = (item.name || '').toLowerCase().indexOf(search) !== -1;
                    const descMatch = (item.description || '').toLowerCase().indexOf(search) !== -1;
                    if (nameMatch || descMatch) {
                        results.push({ topicKey: key, topic: t, item: item, exact: nameMatch });
                    }
                });
            }
            // Check body text
            var bodyText = typeof t.body === 'function' ? '' : (t.body || '');
            if (bodyText && bodyText.toLowerCase().indexOf(search) !== -1) {
                results.push({ topicKey: key, topic: t, item: null, exact: false });
            }
            // Check title/description
            if ((t.title || '').toLowerCase().indexOf(search) !== -1 ||
                (t.description || '').toLowerCase().indexOf(search) !== -1) {
                results.push({ topicKey: key, topic: t, item: null, exact: true });
            }
        });

        // Also search command items
        var flatCommands = [];
        var flattenCmds = (items) => { items.forEach(c => { if (c.group) flattenCmds(c.commands || []); else flatCommands.push(c); }); };
        if (helpData.commands) flattenCmds(helpData.commands);
        flatCommands.forEach(c => {
            if (c.deleted || !c.items) return;
            var cmdKey = c.syntax.split(' ')[0];
            c.items.forEach(item => {
                const nameMatch = (item.name || '').toLowerCase().indexOf(search) !== -1;
                const descMatch = (item.description || '').toLowerCase().indexOf(search) !== -1;
                if (nameMatch || descMatch) {
                    results.push({ topicKey: cmdKey, topic: { title: reg.command + ' ' + c.syntax, description: c.description }, item: item, exact: nameMatch, _cmd: c });
                }
            });
        });

        if (results.length === 0) {
            reply(msg, scriptName, 'Man', 'No results for "' + html.escape(search) + '".');
            return;
        }

        // If exactly one topic matched, show it fully
        const uniqueTopics = [...new Set(results.map(r => r.topicKey))];
        if (uniqueTopics.length === 1 && results.some(r => r.exact)) {
            renderManTopic(msg, scriptName, reg, uniqueTopics[0], topics[uniqueTopics[0]]);
            return;
        }

        // Multiple matches — show condensed results with links
        let out = html.bold('Results for "' + html.escape(search) + '":') + html.paragraph('');
        const shown = new Set();
        results.sort((a, b) => (b.exact ? 1 : 0) - (a.exact ? 1 : 0));
        results.forEach(r => {
            if (shown.has(r.topicKey + '/' + (r.item ? r.item.name : ''))) return;
            shown.add(r.topicKey + '/' + (r.item ? r.item.name : ''));
            if (r.item) {
                out += '• ' + html.bold(html.escape(r.item.name));
                if (r.item.description) out += ' — ' + html.escape(r.item.description).slice(0, 80);
                out += html.br() + html.indent(2) + html.italic('in ' + html.button(r.topic.title || r.topicKey, reg.command + ' ' + manCmd + ' ' + r.topicKey)) + html.br();
            } else {
                out += '• ' + html.button(r.topic.title || r.topicKey, reg.command + ' ' + manCmd + ' ' + r.topicKey);
                if (r.topic.description) out += ' — ' + html.escape(r.topic.description);
                out += html.br();
            }
        });
        reply(msg, scriptName, 'Man', out);
    };

    /**
     * Render a full man topic.
     */
    const renderManTopic = (msg, scriptName, reg, key, topic) => {
        let out = html.bold(html.escape(topic.title || key));
        if (topic.version) out += ' ' + html.italic('(v' + topic.version + ')');
        out += html.br();
        if (topic.description) out += html.escape(topic.description) + html.br();
        out += html.br();

        // Render body (supports string or function)
        if (topic.body) {
            var body = typeof topic.body === 'function' ? topic.body() : topic.body;
            out += html.render(body) + html.paragraph('');
        }

        // Render items (structured entries within a topic)
        if (topic.items && Array.isArray(topic.items)) {
            topic.items.forEach(item => {
                if (item.deleted) return;
                var vTag = '';
                if (item.version && isNewVersion(item.version, reg)) vTag = ' ' + html.newBadge();
                if (item.deprecated) vTag = ' ' + html.deprecatedBadge();
                out += html.bold(html.escape(item.name)) + vTag;
                if (item.syntax) out += ' ' + html.code(item.syntax);
                out += html.br();
                if (item.description) out += html.render(item.description) + html.br();
                out += html.br();
            });
        }

        reply(msg, scriptName, 'Man', out);
    };

    /**
     * Render a command's man page (details + items).
     */
    const renderManCommand = (msg, scriptName, reg, cmd) => {
        let out = html.bold(html.code(reg.command + ' ' + cmd.syntax));
        if (cmd.version) out += ' ' + html.italic('(v' + cmd.version + ')');
        out += html.br();
        if (cmd.description) out += html.escape(cmd.description) + html.br();
        if (cmd.details) out += html.br() + html.render(cmd.details) + html.br();
        out += html.br();

        if (cmd.items) {
            cmd.items.forEach(item => {
                if (item.deleted) return;
                var vTag = '';
                if (isNewVersion(item.version, reg)) vTag = ' ' + html.newBadge();
                if (item.deprecated) vTag = ' ' + html.deprecatedBadge();
                out += html.bold(html.escape(item.name)) + vTag;
                out += html.br();
                if (item.description) out += html.render(item.description) + html.br();
                out += html.br();
            });
        }

        reply(msg, scriptName, 'Man', out);
    };

    /**
     * Show what's new in current version (chat command).
     */
    const showWhatsNew = (msg, scriptName, reg) => {
        const helpData = reg.help;
        if (!helpData) {
            reply(msg, scriptName, 'What\'s New', 'No help data registered.');
            return;
        }

        const version = reg.version;
        const commands = helpData.commands || [];
        const topics = helpData.topics || {};

        let out = html.bold(html.escape(scriptName) + ' — What\'s New') + html.paragraph('');

        // Explicit changelog entries
        if (helpData.changelog && helpData.changelog.length > 0) {
            var relevant = helpData.changelog.filter(e => isNewVersion(e.version, reg));
            if (relevant.length > 0) {
                relevant.forEach(e => {
                    out += html.bold('v' + e.version) + html.br();
                    if (Array.isArray(e.changes)) {
                        out += html.list(e.changes.map(c => html.escape(c)));
                    } else if (e.changes) {
                        out += html.escape(e.changes) + html.br();
                    }
                });
                out += html.line();
            }
        }

        // Auto-detected new items
        var newItems = [];

        // New commands
        var flatCommands = [];
        var flattenCmds = (items) => { items.forEach(c => { if (c.group) flattenCmds(c.commands || []); else flatCommands.push(c); }); };
        flattenCmds(commands);
        flatCommands.forEach(c => {
            if (!c.deleted && isNewVersion(c.version, reg)) {
                newItems.push(html.code(reg.command + ' ' + c.syntax) + ' — ' + html.escape(c.description));
            }
        });

        // New topics
        Object.entries(topics).forEach(([k, t]) => {
            if (t.deleted) return;
            if (isNewVersion(t.version, reg)) {
                newItems.push(html.bold(t.title || k) + (t.description ? ' — ' + html.escape(t.description) : ''));
            }
            // New items within existing topics
            if (t.items) {
                t.items.forEach(item => {
                    if (!item.deleted && isNewVersion(item.version, reg) && !isNewVersion(t.version, reg)) {
                        newItems.push(html.bold(item.name) + ' in ' + html.italic(t.title || k) + (item.description ? ' — ' + item.description : ''));
                    }
                });
            }
        });

        if (newItems.length > 0) {
            out += html.bold('New Features:') + html.br();
            out += html.list(newItems);
        }

        if (!newItems.length && !(helpData.changelog && helpData.changelog.length)) {
            out += 'Nothing new since last version.';
        }

        reply(msg, scriptName, 'What\'s New', out);
    };

    // =========================================================================
    // Handout Generation
    // =========================================================================

    /**
     * Generate a help or dev handout from the registered help data.
     * @param {object|null} msg  Chat message (null for auto-generation on startup)
     * @param {string} scriptName
     * @param {object} reg  Registration object
     * @param {string} mode  'usr' or 'dev'
     */
    const generateHelpHandout = (msg, scriptName, reg, mode) => {
        const helpData = reg.help;
        if (!helpData) {
            if (msg) reply(msg, scriptName, 'Error', 'No help data registered.');
            return;
        }

        const version = reg.version;
        const handoutName = 'Help: ' + scriptName + (mode === 'dev' ? '/Dev' : '');
        const topics = helpData.topics || {};
        const commands = helpData.commands || [];

        // Filter topics by handouts field
        const matchesMode = (t) => {
            var h = t.handouts !== undefined ? t.handouts : 'usr';
            if (h === null) return false;
            if (Array.isArray(h)) return h.indexOf(mode) !== -1;
            return h === mode;
        };

        // Auto-inject ScriptKit examples topic for dev handout unless explicitly set to null
        if (mode === 'dev' && !topics.hasOwnProperty('scriptKit')) {
            topics.scriptKit = {
                title: 'Registering Examples',
                description: 'How to register examples for ' + scriptName + ' that show off your script\'s integration',
                handouts: 'dev',
                body: 'Other scripts can register examples targeting **' + scriptName + '**:\n\n'
                    + '```ScriptKit.' + scriptName + '.registerExample(\'YourScript\', {\n'
                    + '    name: \'example-name\',\n'
                    + '    description: \'What this example does\',\n'
                    + '    guide: [ /* guide steps */ ],\n'
                    + '    handout: { notes: \'...\' }\n'
                    + '});```\n\n'
                    + 'See the ScriptKit wiki or run `!scriptkit ' + registrations[SCRIPT_NAME].aliases.genDev + '` for more information on examples and guides.',
            };
        }

        const filteredTopicKeys = Object.keys(topics).filter(k => topics[k] && !topics[k].deleted && matchesMode(topics[k]));

        // Build "What's New" section (items matching current version)
        var whatsNew = [];
        var whatsNewSeen = {};
        var flatCmds = [];
        var flattenC = (items) => { items.forEach(c => { if (c.group) flattenC(c.commands || []); else flatCmds.push(c); }); };
        flattenC(commands);
        flatCmds.forEach(c => {
            if (!c.deleted && isNewVersion(c.version, reg)) whatsNew.push(html.code(reg.command + ' ' + c.syntax) + ' — ' + html.escape(c.description));
            if (c.items) {
                c.items.forEach(item => {
                    if (!item.deleted && isNewVersion(item.version, reg) && !isNewVersion(c.version, reg)) {
                        if (!whatsNewSeen[item.name]) {
                            whatsNewSeen[item.name] = true;
                            whatsNew.push(html.code(item.name) + ' in ' + html.code(reg.command + ' ' + c.syntax) + ' — ' + html.escape(item.description));
                        }
                    }
                });
            }
        });
        filteredTopicKeys.forEach(k => {
            var t = topics[k];
            if (isNewVersion(t.version, reg)) whatsNew.push(html.bold(t.title || k) + (t.description ? ' — ' + html.escape(t.description) : ''));
            if (t.items) {
                t.items.forEach(item => {
                    if (!item.deleted && isNewVersion(item.version, reg) && !whatsNewSeen[item.name]) {
                        whatsNewSeen[item.name] = true;
                        whatsNew.push(html.bold(item.name) + (item.description ? ' — ' + item.description : ''));
                    }
                });
            }
        });

        // Build "Removed" section (deleted items)
        var removed = [];
        commands.forEach(c => {
            if (c.deleted) removed.push(html.code(reg.command + ' ' + c.syntax) + ' — removed in v' + c.deleted);
        });
        Object.keys(topics).forEach(k => {
            var t = topics[k];
            if (!t) return;
            if (t.deleted) removed.push(html.bold(t.title || k) + ' — removed in v' + t.deleted);
            if (t.items) {
                t.items.forEach(item => {
                    if (item.deleted) removed.push(html.bold(item.name) + ' — removed in v' + item.deleted);
                });
            }
        });

        // Render HTML
        var out = '';
        out += '<h1>' + html.escape(scriptName) + (version ? ' v' + version : '') + '</h1>';
        if (helpData.description) out += '<p>' + html.render(helpData.description) + '</p>';

        // Quick Start / Examples callout (user handout only)
        var hasExamples = reg.aliases && reg.aliases.examples && Object.values(examples).filter(e => e.target === scriptName).length > 0;
        var examplesBtn = hasExamples ? ' ' + html.button('📖 Examples', reg.command + ' ' + reg.aliases.examples, { background: '#444', fontSize: '11px' }) : '';
        if (mode === 'usr') {
            if (helpData.quickStart) {
                out += '<h2>Quick Start' + examplesBtn + '</h2>';
                var qs = helpData.quickStart;
                if (typeof qs === 'function') qs = qs();
                if (Array.isArray(qs)) out += html.orderedList(qs);
                else out += '<div>' + qs + '</div>';
            } else if (hasExamples) {
                out += '<p>' + examplesBtn + ' — ready-made examples you can install and learn from.</p>';
            }
        }

        // What's New
        if (helpData.changelog && helpData.changelog.length > 0) {
            var relevant = helpData.changelog.filter(e => isNewVersion(e.version, reg));
            relevant.forEach(e => {
                if (Array.isArray(e.changes)) {
                    e.changes.forEach(c => whatsNew.push(html.escape(c)));
                } else if (e.changes) {
                    whatsNew.push(html.escape(e.changes));
                }
            });
        }
        if (whatsNew.length > 0) {
            out += '<h2>What\'s New in v' + version + '</h2>';
            out += html.list(whatsNew);
        }

        // Commands (usr handout only)
        if (mode === 'usr' && commands.length > 0) {
            var renderCmdsHandout = function(items) {
                var result = '';
                items.forEach(c => {
                    if (c.group) {
                        var inner = renderCmdsHandout(c.commands || []);
                        if (inner) result += '<h3>' + html.escape(c.group) + '</h3>' + inner;
                    } else {
                        if (c.deleted) return;
                        var badge = '';
                        var cmdIsNew = isNewVersion(c.version, reg);
                        if (cmdIsNew) badge = ' ' + html.newBadge();
                        if (c.deprecated) badge = ' ' + html.deprecatedBadge();
                        if (mode === 'dev' && c.version) badge += ' ' + html.version(c.version);
                        result += '<p>' + html.code(reg.command + ' ' + c.syntax) + ' — ' + html.escape(c.description) + badge + '</p>';
                        if (c.details) result += '<p>' + html.render(c.details) + '</p>';
                        if (c.items) {
                            result += '<ul>';
                            c.items.forEach(item => {
                                if (item.deleted) return;
                                var iBadge = '';
                                if (!cmdIsNew && isNewVersion(item.version, reg)) iBadge = ' ' + html.newBadge();
                                if (item.deprecated) iBadge = ' ' + html.deprecatedBadge();
                                if (mode === 'dev' && item.version) iBadge += ' ' + html.version(item.version);
                                result += '<li>' + html.code(item.name) + ' — ' + html.escape(item.description) + iBadge + '</li>';
                            });
                            result += '</ul>';
                        }
                    }
                });
                return result;
            };
            out += '<h2>Commands</h2>';
            out += renderCmdsHandout(commands);
        }

        // Topics
        filteredTopicKeys.forEach(k => {
            var t = topics[k];
            var badge = '';
            var topicIsNew = isNewVersion(t.version, reg);
            if (topicIsNew) badge = ' ' + html.newBadge();
            if (t.deprecated) badge = ' ' + html.deprecatedBadge();
            if (mode === 'dev' && t.version) badge += ' ' + html.version(t.version);
            out += '<h2>' + html.escape(t.title || k) + badge + '</h2>';
            if (t.description) out += '<p>' + html.escape(t.description) + '</p>';
            if (t.details) out += '<p>' + html.render(t.details) + '</p>';
            if (t.body) {
                var body = typeof t.body === 'function' ? t.body() : t.body;
                out += '<div>' + html.render(body) + '</div>';
            }
            if (t.items) {
                t.items.forEach(item => {
                    if (item.deleted) return;
                    var iBadge = '';
                    if (!topicIsNew && isNewVersion(item.version, reg)) iBadge = ' ' + html.newBadge();
                    if (item.deprecated) iBadge = ' ' + html.deprecatedBadge();
                    if (mode === 'dev' && item.version) iBadge += ' ' + html.version(item.version);
                    out += '<p>' + html.bold(html.escape(item.name)) + iBadge;
                    if (item.syntax) out += ' ' + html.code(item.syntax);
                    out += '</p>';
                    if (item.description) out += '<p>' + html.render(item.description) + '</p>';
                    if (item.details) out += '<p>' + html.render(item.details) + '</p>';
                });
            }
        });

        // Removed section
        if (removed.length > 0) {
            out += '<h2>Removed</h2>';
            out += html.list(removed);
        }

        // Examples footer
        if (reg.aliases && reg.aliases.examples) {
            var examplesForScript = Object.values(examples).filter(e => e.target === scriptName);
            if (examplesForScript.length > 0) {
                out += '<hr><p>' + html.button('📖 Browse Examples', reg.command + ' ' + reg.aliases.examples, { background: '#444', fontSize: '11px' }) + ' — ' + examplesForScript.length + ' ready-made example' + (examplesForScript.length === 1 ? '' : 's') + ' available.</p>';
            }
        }

        // Create/update handout
        var handout = findObjs({ type: 'handout', name: handoutName })[0];
        if (!handout) {
            handout = createObj('handout', {
                name: handoutName,
                inplayerjournals: '',
                archived: false,
                avatar: 'https://files.d20.io/images/127392204/tAiDP73rpSKQobEYm5QZUw/thumb.png?15878425385',
            });
        }
        setHandoutNotes(handout, out);

        if (msg) {
            reply(msg, scriptName, mode === 'dev' ? 'Dev Docs' : 'Help',
                'Generated ' + html.bold(handoutName) + '. ' + html.handoutLink('[Open]', handout.get('id')));
        } else {
            log(SCRIPT_NAME + ': Generated ' + handoutName + ' for ' + scriptName);
        }
    };

    // =========================================================================
    // Examples Listing
    // =========================================================================

    const showExamples = (msg, scriptName, reg, args) => {
        // Parse search filters
        let pluginFilter = null, nameFilter = null, descFilter = null;
        const filterArgs = [];
        args.forEach(a => {
            if (a.toLowerCase().startsWith('script:')) pluginFilter = a.slice(7).toLowerCase();
            else if (a.toLowerCase().startsWith('name:')) nameFilter = a.slice(5).toLowerCase();
            else if (a.toLowerCase().startsWith('desc:')) descFilter = a.slice(5).toLowerCase();
            else filterArgs.push(a);
        });
        const remainingFilter = filterArgs.length > 0 ? filterArgs.join(' ').toLowerCase() : null;
        nameFilter = nameFilter || remainingFilter;
        descFilter = descFilter || remainingFilter;

        // Get examples targeting this script
        const scriptExamples = Object.values(examples).filter(ex => ex.target === scriptName);
        if (scriptExamples.length === 0) {
            reply(msg, scriptName, 'Examples', 'No examples registered.');
            return;
        }

        const hasSearch = pluginFilter || nameFilter || descFilter;
        const matches = (body, filter) => filter ? (body || '').toLowerCase().indexOf(filter) !== -1 : true;
        const isExact = (body, filter) => filter ? (body || '').toLowerCase() === filter : false;

        // Tier matching
        const tier1 = [], tier2 = [], tier3 = [];
        const tier1Sources = new Set();

        if (pluginFilter) {
            scriptExamples.forEach(ex => {
                if (ex.source.toLowerCase() === pluginFilter) {
                    tier1.push(ex);
                    tier1Sources.add(ex.source);
                }
            });
        }

        scriptExamples.forEach(ex => {
            if (tier1Sources.has(ex.source)) return;
            if (pluginFilter && ex.source.toLowerCase().indexOf(pluginFilter) === -1) return;
            if (!hasSearch) { tier3.push(ex); return; }
            if (!matches(ex.name, nameFilter) && !matches(ex.description, descFilter)) return;
            if (isExact(ex.name, nameFilter) || isExact(ex.description, descFilter)) tier2.push(ex);
            else tier3.push(ex);
        });

        const allMatches = [...tier1, ...tier2, ...tier3];
        if (allMatches.length === 0) {
            reply(msg, scriptName, 'Examples', 'No examples match. Use ' + html.code(reg.command + ' ' + reg.aliases.examples) + ' to see all.');
            return;
        }

        // Group by source
        const groups = [];
        const groupMap = {};
        allMatches.forEach(ex => {
            if (!groupMap[ex.source]) {
                groupMap[ex.source] = [];
                groups.push({ source: ex.source, items: groupMap[ex.source] });
            }
            groupMap[ex.source].push(ex);
        });
        const tier2Sources = new Set(tier2.map(ex => ex.source));
        groups.sort((a, b) => {
            const ta = tier1Sources.has(a.source) ? 0 : tier2Sources.has(a.source) ? 1 : 2;
            const tb = tier1Sources.has(b.source) ? 0 : tier2Sources.has(b.source) ? 1 : 2;
            if (ta !== tb) return ta - tb;
            return a.source.localeCompare(b.source);
        });

        let out = 'Filter: ' + html.code(reg.command + ' ' + reg.aliases.examples + ' <search>') + ', ' + html.code('script:<name>') + html.paragraph('');
        groups.forEach(g => {
            out += html.bold(html.escape(g.source) + ':') + html.br();
            g.items.forEach(ex => {
                out += html.indent(2) + '• ' + renderExampleEntry(ex, reg, nameFilter, descFilter) + html.br();
            });
        });
        reply(msg, scriptName, 'Examples', out);
    };

    /**
     * Render a single example entry with name, description, and action buttons.
     */
    const renderExampleEntry = (ex, reg, nameHighlight, descHighlight) => {
        const highlightMatch = (text, filter) => {
            if (!filter) return html.escape(text);
            const lower = text.toLowerCase();
            let result = '', lastIdx = 0, idx = lower.indexOf(filter);
            if (idx === -1) return html.escape(text);
            while (idx !== -1) {
                result += html.escape(text.slice(lastIdx, idx));
                result += html.bold(html.escape(text.slice(idx, idx + filter.length)));
                lastIdx = idx + filter.length;
                idx = lower.indexOf(filter, lastIdx);
            }
            result += html.escape(text.slice(lastIdx));
            return result;
        };

        const hasHandler = reg.exampleHandler || ex.handout;
        const handoutName = hasHandler ? getHandoutName(reg.tag, ex.source, ex.name, null) : null;
        const exists = handoutName ? findObjs({ type: 'handout', name: handoutName })[0] : null;
        var entry = html.underline(highlightMatch(ex.name, nameHighlight || ''));
        if (ex.description) entry += ' — ' + highlightMatch(ex.description, descHighlight || '');
        entry += ' ';
        if (ex.handout || reg.exampleHandler) {
            if (exists) {
                entry += html.button('🔄 Regen', reg.command + ' ' + reg.aliases.generate + ' ' + ex.name) + ' ';
                if (ex.guide && ex.guide.length > 0) {
                    entry += html.button('🧭 Guide', reg.command + ' ' + reg.aliases.guide + ' ' + ex.name) + ' ';
                }
                entry += html.handoutLink('[Open]', exists.get('id'));
            } else {
                entry += html.button('+ Generate', reg.command + ' ' + reg.aliases.generate + ' ' + ex.name);
            }
        } else if (ex.guide && ex.guide.length > 0) {
            entry += html.button('🧭 Guide', reg.command + ' ' + reg.aliases.guide + ' ' + ex.name);
        }
        return entry;
    };

    // =========================================================================
    // Example Generation
    // =========================================================================

    const getHandoutName = (defaultTag, source, exampleName, handlerResult) => {
        const tag = (handlerResult && handlerResult.tag) || defaultTag;
        return (tag ? '[' + tag + '] ' : '') + source + '/example-' + exampleName;
    };

    const defaultExampleHandler = (example, msg) => {
        const h = example.handout || {};
        return {
            notes: h.notes || '',
            gmnotes: h.gmnotes || '',
            avatar: h.avatar || '',
            inplayerjournals: h.inplayerjournals || '',
            archived: h.archived !== undefined ? h.archived : true,
        };
    };

    const generateExample = (msg, scriptName, reg, args) => {
        const exName = args[0];
        const key = scriptName + '/' + exName;
        const ex = examples[key];
        if (!ex) {
            replyError(msg, scriptName, 'No example named "' + (exName || '') + '". Use ' + html.code(reg.command + ' ' + reg.aliases.examples) + ' to see all.');
            return;
        }

        const handoutName = ex.handout ? getHandoutName(reg.tag, ex.source, ex.name, null) : null;

        // Build effective guide steps — inject _generate step if not explicitly placed
        const hasGuide = ex.guide && ex.guide.length > 0;
        const hasExplicitGenerate = hasGuide && ex.guide.some(s => s === HANDOUT_STEP);

        if (hasGuide && !hasExplicitGenerate && ex.handout) {
            // Auto-inject: function handout → append, object handout → prepend
            if (typeof ex.handout === 'function') {
                ex._effectiveGuide = ex.guide.concat([HANDOUT_STEP]);
            } else {
                ex._effectiveGuide = [HANDOUT_STEP].concat(ex.guide);
            }
        } else if (!hasGuide && ex.handout) {
            // No guide at all — just a handout step
            ex._effectiveGuide = [HANDOUT_STEP];
        } else {
            ex._effectiveGuide = ex.guide || [];
        }

        startGuide(msg, scriptName, reg, ex, handoutName);
    };

    // =========================================================================
    // Guide Engine
    // =========================================================================

    const startGuideByName = (msg, scriptName, reg, args) => {
        const exName = args[0];
        const key = scriptName + '/' + exName;
        const ex = examples[key];
        if (!ex) {
            replyError(msg, scriptName, 'No example named "' + (exName || '') + '".');
            return;
        }
        if (!ex.guide || ex.guide.length === 0) {
            replyError(msg, scriptName, 'Example "' + exName + '" has no setup guide.');
            return;
        }
        const handoutName = getHandoutName(reg.tag, ex.source, ex.name, null);
        startGuide(msg, scriptName, reg, ex, handoutName);
    };

    const startGuide = (msg, scriptName, reg, example, handoutName) => {
        const guideId = 'guide-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

        // Process steps — use _effectiveGuide if set by generateExample, otherwise guide
        const steps = (example._effectiveGuide || example.guide || []).slice();

        activeGuides[guideId] = {
            steps: steps,
            currentStep: 0,
            selections: {},
            params: {},
            _lastQueryValues: {},
            _queryErrors: {},
            _hue: Math.floor(Math.random() * 360),
            msg: msg,
            handoutName: handoutName,
            source: scriptName,
            example: example,
            reg: reg,
        };

        enterStep(guideId);
    };

    const performDeferredGeneration = (g) => {
        const reg = registrations[g.source];
        if (!reg) return;
        const ex = g.example;
        const ctx = { selections: g.selections, params: g.params, msg: g.msg, handoutName: g.handoutName, player: getObj('player', g.msg.playerid) };
        const handoutData = typeof ex.handout === 'function' ? ex.handout(ctx) : ex.handout;
        if (!handoutData) {
            log(SCRIPT_NAME + ': handout step in "' + ex.name + '" but no handout data provided.');
            return;
        }
        const handler = reg.exampleHandler || defaultExampleHandler;
        const result = handler(Object.assign({}, ex, { handout: handoutData }), g.msg);
        const handoutName = getHandoutName(reg.tag, ex.source, ex.name, result);
        g.handoutName = handoutName;
        var handout = findObjs({ type: 'handout', name: handoutName })[0];
        if (!handout) {
            handout = createObj('handout', { name: handoutName });
        }
        if (result.notes) setHandoutNotes(handout, result.notes);
        if (result.gmnotes) handout.set('gmnotes', result.gmnotes);
        if (result.avatar) handout.set('avatar', result.avatar);
        if (result.inplayerjournals !== undefined) handout.set('inplayerjournals', result.inplayerjournals);
        if (result.archived !== undefined) handout.set('archived', result.archived);
    };

    const enterStep = (guideId) => {
        const g = activeGuides[guideId];
        if (!g) return;
        clearAnnotations();

        if (g.currentStep >= g.steps.length) {
            // All steps complete — call onComplete
            completeGuide(guideId);
            return;
        }

        const step = g.steps[g.currentStep];

        // Conditional step — check 'when'
        if (typeof step.when === 'function') {
            const ctx = { selections: g.selections, params: g.params, msg: g.msg, player: getObj('player', g.msg.playerid) };
            if (!step.when(ctx)) {
                g.currentStep++;
                enterStep(guideId);
                return;
            }
        }

        // Handout step — create/update the handout at this point
        if (step === HANDOUT_STEP) {
            performDeferredGeneration(g);
            g.currentStep++;
            enterStep(guideId);
            return;
        }

        // Auto steps advance immediately
        if (step.auto) {
            if (typeof step.action === 'function') {
                const ctx = { selections: g.selections, params: g.params, msg: g.msg, handoutName: g.handoutName, player: getObj('player', g.msg.playerid) };
                step.action(ctx);
            }
            g.currentStep++;
            enterStep(guideId);
            return;
        }

        // Interactive step — show prompt
        const interactiveSteps = g.steps.filter(s => !s.auto && s !== HANDOUT_STEP);
        const interactiveIdx = interactiveSteps.indexOf(step) + 1;
        const interactiveTotal = interactiveSteps.length;
        const hasPriorInteractive = g.steps.slice(0, g.currentStep).some(s => !s.auto && s !== HANDOUT_STEP);

        // Compute hue-rotated background color for this step
        const hueIncrement = Math.max(60, 360 / (interactiveTotal || 1)) + 15;
        const stepHue = (g._hue + (interactiveIdx - 1) * hueIncrement) % 360;
        // Convert HSL(hue, 30%, 20%) to hex for Roll20 compatibility
        const h = stepHue / 360, s = 0.3, l = 0.2;
        const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
        const r = Math.round(hue2rgb(p, q, h + 1/3) * 255), gr = Math.round(hue2rgb(p, q, h) * 255), b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
        const bgColor = '#' + ((1 << 24) + (r << 16) + (gr << 8) + b).toString(16).slice(1);

        // Call onEnter if present, pass advance callback
        if (typeof step.onEnter === 'function') {
            const advance = (error) => {
                if (typeof error === 'string') { replyError(g.msg, g.source, error); return; }
                handleGuideContinue(g.msg, guideId, []);
            };
            const ctx = { selections: g.selections, params: g.params, msg: g.msg, handoutName: g.handoutName, advance: advance, player: getObj('player', g.msg.playerid) };
            step.onEnter(ctx, advance);
        }

        const ctx = { selections: g.selections, params: g.params, msg: g.msg, handoutName: g.handoutName, player: getObj('player', g.msg.playerid) };
        const promptText = typeof step.prompt === 'function' ? step.prompt(ctx) : step.prompt;

        let prompt = html.div(
            html.bold(html.escape(g.handoutName || g.example.name)) + ' — Setup (step ' + interactiveIdx + '/' + interactiveTotal + ')' + html.paragraph('')
            + html.format(promptText) + html.paragraph('')
            + (step.select ? (() => {
                const plural = !step.max || step.max > 1;
                const label = step.select + (plural ? 's' : '');
                const parts = [];
                if (step.min) parts.push('min: ' + step.min);
                if (step.max) parts.push('max: ' + step.max);
                return parts.length > 0 ? html.italic('Select ' + parts.join(', ') + ' ' + label) + html.paragraph('') : '';
            })() : '')
            + (step.query ? (() => {
                const queries = Array.isArray(step.query) ? step.query : [step.query];
                const lastVals = g._lastQueryValues || {};
                const errors = g._queryErrors || {};
                let qOut = '';
                queries.forEach(q => {
                    if (errors[q.name]) qOut += html.span('⚠ ' + html.escape(errors[q.name]), { color: '#c33' }) + ' ';
                    qOut += html.bold(html.escape(q.name));
                    if (q.options) qOut += ' [dropdown]';
                    else if (lastVals[q.name] !== undefined) qOut += ' [' + html.escape(lastVals[q.name]) + ']';
                    else if (q.default !== undefined && q.default !== null) qOut += ' [' + html.escape(String(q.default)) + ']';
                    if (q.description) qOut += ' — ' + html.italic(html.escape(q.description));
                    qOut += html.br();
                });
                qOut += html.br();
                const escQ = (v) => String(v).replace(/\|/g, '&#124;').replace(/,/g, '&#44;');
                const queryParts = queries.map(q => {
                    var def = lastVals[q.name] !== undefined ? lastVals[q.name] : (q.default !== undefined && q.default !== null ? q.default : '');
                    if (q.options) {
                        var opts = q.options.map(o => typeof o === 'string' ? escQ(o) + ',' + escQ(o) : escQ(o.label) + ',' + escQ(o.value)).join('|');
                        return '--' + q.name + ' `?{' + q.name + '|' + opts + '}`';
                    }
                    if (q.type === Boolean) return '--' + q.name + ' `?{' + q.name + '|true|false}`';
                    if (def !== '') return '--' + q.name + ' `?{' + q.name + '|' + escQ(def) + '}`';
                    return '--' + q.name + ' `?{' + q.name + '}`';
                }).join(' ');
                qOut += html.button('✅ Continue', g.reg.command + ' ' + g.reg.aliases.guideContinue + ' ' + guideId + ' ' + queryParts);
                return qOut;
            })() : html.button('✅ Continue', g.reg.command + ' ' + g.reg.aliases.guideContinue + ' ' + guideId))
            + (hasPriorInteractive ? ' ' + html.button('⬅ Back', g.reg.command + ' ' + g.reg.aliases.guideBack + ' ' + guideId) : '')
            + ' ' + html.button('✖ Cancel', g.reg.command + ' ' + g.reg.aliases.guideCancel + ' ' + guideId)
            + (step.offerExamples ? (() => {
                var offered = '';
                offered += html.paragraph('') + html.bold('What\'s Next?') + html.br();
                step.offerExamples.forEach(function(name) {
                    var ex = Object.values(examples).find(function(e) { return e.name === name && e.target === g.source; });
                    if (!ex) return;
                    offered += '• ' + renderExampleEntry(ex, g.reg) + html.br();
                });
                return offered;
            })() : ''),
            { background: bgColor, color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '12px' }
        );

        reply(g.msg, g.source, 'Guide', prompt);
    };

    const handleGuideContinue = (msg, guideId, queryArgs) => {
        const g = activeGuides[guideId];
        if (!g) { replyError(msg, SCRIPT_NAME, 'No active guide with that ID.'); return; }

        const step = g.steps[g.currentStep];
        const selected = (msg.selected || []).map(s => getObj(s._type, s._id)).filter(Boolean);

        // Handle select steps
        if (step.select) {
            const selectType = step.select;
            const isSubtype = selectType === 'token' || selectType === 'card';
            const matchType = isSubtype ? 'graphic' : selectType;
            const filtered = selected.filter(obj => {
                if (obj.get('_type') !== matchType) return false;
                if (isSubtype && obj.get('_subtype') !== selectType) return false;
                return true;
            });
            const plural = !step.max || step.max > 1;
            const label = selectType + (plural ? 's' : '');
            if (filtered.length === 0) {
                replyError(msg, g.source, 'Select at least one ' + selectType + ', then click Continue.');
                return;
            }
            if (step.min && filtered.length < step.min) {
                replyError(msg, g.source, 'Select at least ' + step.min + ' ' + label + ', then click Continue.');
                return;
            }
            if (step.max && filtered.length > step.max) {
                replyError(msg, g.source, 'Select at most ' + step.max + ' ' + label + ', then click Continue.');
                return;
            }
            g.selections[step.as] = plural ? filtered : filtered[0];
        }

        // Handle query steps (parse --key value from pre-parsed args, coerce types)
        if (step.query) {
            const queries = Array.isArray(step.query) ? step.query : [step.query];
            if (!g._lastQueryValues) g._lastQueryValues = {};
            var queryErrors = {};
            var coercedValues = {};

            queries.forEach(q => {
                // Find --name in queryArgs, value is the next arg
                var raw = undefined;
                var idx = (queryArgs || []).indexOf('--' + q.name);
                if (idx !== -1 && idx + 1 < queryArgs.length) raw = queryArgs[idx + 1];

                if (raw === undefined) {
                    if (q.default !== undefined && q.default !== null) {
                        coercedValues[q.name] = q.default;
                        g._lastQueryValues[q.name] = String(q.default);
                    } else {
                        queryErrors[q.name] = 'Required';
                    }
                    return;
                }

                g._lastQueryValues[q.name] = raw;

                // Normalize type to a coercion function
                var coerce = q.type || String;
                if (coerce === Boolean) coerce = (v) => { if (v !== 'true' && v !== 'false') throw 'Must be true or false'; return v === 'true'; };
                if (coerce === Number) coerce = (v) => { var n = Number(v); if (isNaN(n)) throw 'Invalid number'; return n; };

                try {
                    coercedValues[q.name] = coerce(raw);
                } catch (e) {
                    queryErrors[q.name] = typeof e === 'string' ? e : (e.message || 'Invalid value');
                }
            });

            if (Object.keys(queryErrors).length > 0) {
                g._queryErrors = queryErrors;
                enterStep(guideId);
                return;
            }

            // All passed — store coerced values in params, clear errors
            Object.assign(g.params, coercedValues);
            g._queryErrors = {};
        }

        // Role assignment (Choreograph compatibility)
        if (step.role) {
            if (!g.selections._roles) g.selections._roles = {};
            g.selections._roles[step.role] = selected;
        }

        // onContinue callback — if it returns a string, treat as validation error
        if (typeof step.onContinue === 'function') {
            const ctx = { selections: g.selections, params: g.params, selected: selected, msg: msg, player: getObj('player', msg.playerid) };
            const err = step.onContinue(ctx);
            if (typeof err === 'string') {
                replyError(msg, g.source, err);
                return;
            }
        }

        g.currentStep++;
        enterStep(guideId);
    };

    const handleGuideBack = (msg, guideId) => {
        const g = activeGuides[guideId];
        if (!g || g.currentStep <= 0) return;

        // Call onExit on the step we're leaving
        const leavingStep = g.steps[g.currentStep];
        if (leavingStep && typeof leavingStep.onExit === 'function') {
            const ctx = { selections: g.selections, params: g.params, msg: msg, handoutName: g.handoutName, player: getObj('player', msg.playerid) };
            leavingStep.onExit(ctx);
        }

        // Undo current step
        const currentStep = g.steps[g.currentStep];
        if (currentStep && currentStep.as) delete g.selections[currentStep.as];
        if (currentStep && currentStep.role && g.selections._roles) delete g.selections._roles[currentStep.role];

        // Step backward
        g.currentStep--;
        const step = g.steps[g.currentStep];

        // onBack callback
        if (typeof step.onBack === 'function') {
            const ctx = { selections: g.selections, params: g.params, msg: msg, player: getObj('player', msg.playerid) };
            step.onBack(ctx);
        }

        // Undo this step's data
        if (step.as) delete g.selections[step.as];
        if (step.role && g.selections._roles) delete g.selections._roles[step.role];

        // Skip past auto steps when backing up
        if (step.auto && g.currentStep > 0) {
            handleGuideBack(msg, guideId);
            return;
        }

        enterStep(guideId);
    };

    const handleGuideCancel = (msg, guideId) => {
        const g = activeGuides[guideId];
        if (!g) return;

        // onBack for all steps
        for (let i = g.currentStep; i >= 0; i--) {
            const step = g.steps[i];
            if (typeof step.onBack === 'function') {
                const ctx = { selections: g.selections, params: g.params, msg: msg, player: getObj('player', msg.playerid) };
                step.onBack(ctx);
            }
        }

        delete activeGuides[guideId];
        reply(msg, g.source, 'Guide', 'Setup cancelled.');
    };

    const completeGuide = (guideId) => {
        const g = activeGuides[guideId];
        if (!g) return;

        const handout = g.handoutName ? findObjs({ type: 'handout', name: g.handoutName })[0] : null;

        const ctx = {
            selections: g.selections,
            params: g.params,
            msg: g.msg,
            handoutName: g.handoutName,
            handout: handout || null,
            example: g.example,
        };

        // Call script-level onComplete if registered
        const reg = registrations[g.source];
        if (reg && typeof reg.onComplete === 'function') {
            reg.onComplete(ctx);
        }

        // Call example-level onComplete if present
        if (typeof g.example.onComplete === 'function') {
            g.example.onComplete(ctx);
        }

        let outMsg = 'Setup complete for ' + html.bold(html.escape(g.handoutName || g.example.name)) + '.';
        if (handout) outMsg += ' <a href="http://journal.roll20.net/handout/' + handout.get('id') + '">[Open]</a>';
        reply(g.msg, g.source, 'Guide', outMsg);

        delete activeGuides[guideId];
    };

    // =========================================================================
    // Public API
    // =========================================================================

    // =========================================================================
    // Public API (Proxy-based for namespace access)
    // =========================================================================

    const api = {
        register,
        registerExample,
        handleInput,
        html,
        handout: () => HANDOUT_STEP,
        ping: guidePing,
        annotate: guideAnnotate,
        clearAnnotations: clearAnnotations,
        waitForCommand: (cmd) => ({
            onEnter: (ctx, advance) => {
                ctx._waitFired = false;
                on('chat:message', (msg) => {
                    if (ctx._waitFired) return;
                    if (msg.type === 'api' && msg.content.split(' ').slice(0, cmd.split(' ').length).join(' ') === cmd) {
                        ctx._waitFired = true;
                        advance();
                    }
                });
            },
            onExit: (ctx) => {
                ctx._waitFired = true;
            },
        }),
        getHandoutName,
        startGuide: (msg, scriptName, example, handoutName) => {
            const reg = registrations[scriptName];
            if (!reg) return;
            startGuide(msg, scriptName, reg, example, handoutName);
        },
        getExamples: (scriptName) => Object.values(examples).filter(ex => ex.target === scriptName),
        getActiveGuides: () => activeGuides,
    };

    // Tutorial.Choreograph.registerExample('Sequence', { ... })
    // Auto-creates namespace proxy for any unrecognized property access
    return new Proxy(api, {
        get(target, prop) {
            if (prop in target) return target[prop];
            if (typeof prop === 'symbol') return undefined;
            return {
                registerExample: (registeredBy, struct) => registerExample(String(prop), registeredBy, struct),
            };
        },
    });
})();


on('ready', () => {
    'use strict';
    // Clean up any annotations from a previous session/crash
    if (state.ScriptKit && state.ScriptKit._annotations && state.ScriptKit._annotations.length > 0) {
        state.ScriptKit._annotations.forEach(function(id) {
            var obj = getObj('pathv2', id);
            if (obj) obj.remove();
        });
        state.ScriptKit._annotations = [];
    }
    on('chat:message', (msg) => {
        if (msg.type === 'api' && msg.content.split(' ')[0] === '!scriptkit') {
            ScriptKit.handleInput(msg);
        }
    });
    ScriptKit.register('ScriptKit', {
        version: '1.0.0',
        command: 'scriptkit',
        handout: 'manual',
        aliases: new Proxy({}, { get: (_, key) => key === 'genDev' ? undefined : null }),
        help: {
            description: 'Generic framework library for Roll20 API scripts.',
            topics: {
                textRendering: {
                    title: '⚠️ Text Rendering',
                    description: 'How ScriptKit handles all text output',
                    handouts: 'dev',
                    version: '1.0.0',
                    body: '**All text in ScriptKit is auto-formatted by default.** Any string you provide for descriptions, prompts, bodies, item names, motd, etc. will have HTML escaped, markdown converted (`` `code` `` → code, `**bold**` → bold, `*italic*` → italic), and `\\n` converted to line breaks.\n\nIf you need to pass **raw HTML** (e.g. from `html.bold()`, `html.table()`, or hand-crafted HTML), wrap it in `html.raw(...)`.\n\nWithout `html.raw()`, HTML tags would be escaped and displayed as literal text.',
                },
                registration: {
                    title: 'Registering Your Script',
                    description: 'How to register with ScriptKit',
                    handouts: 'dev',
                    version: '1.0.0',
                    body: 'Call `ScriptKit.register(name, opts)` to gain help, man, examples, handout generation, and migration commands. The `!` prefix on command is optional — it is auto-prepended.',
                    items: [
                        { name: 'command (required)', description: 'Your script\'s chat command prefix (e.g. "myscript" or "!myscript")', version: '1.0.0' },
                        { name: 'version (required)', description: 'Current script version string (e.g. "1.2.0")', version: '1.0.0' },
                        { name: 'tag', description: 'Example handout prefix: [Tag] source/example-name. Optional.', version: '1.0.0' },
                        { name: 'help', description: 'Object with description, quickStart, changelog, commands, topics', version: '1.0.0' },
                        { name: 'aliases', description: 'Override command keywords. Set to null to disable. Proxy-friendly.', version: '1.0.0' },
                        { name: 'newSince', description: 'Version threshold for [new] badges. Default: auto-detect from major.minor change.', version: '1.0.0' },
                        { name: 'handout', description: 'User help handout mode: "auto" (default) | "update" | "manual"', version: '1.0.0' },
                        { name: 'devHandout', description: 'Dev docs handout mode: "auto" | "update" (default) | "manual"', version: '1.0.0' },
                        { name: 'state', description: 'Reference to your persistent state object (for migrations)', version: '1.0.0' },
                        { name: 'migrations', description: 'Object keyed by version: { up: fn, down: "string" }', version: '1.0.0' },
                        { name: 'motd', description: 'Array of tip strings — random one whispered to GM on startup', version: '1.0.0' },
                        { name: 'motdHeader', description: 'Custom header for MOTD card (string or function)', version: '1.0.0' },
                        { name: 'motdStyle', description: 'CSS style override object for MOTD card', version: '1.0.0' },
                        { name: 'exampleHandler', description: 'Custom (example, msg) => handoutFields function for non-default example generation', version: '1.0.0' },
                        { name: 'onComplete', description: 'Callback fired when any guide completes: (ctx) => void', version: '1.0.0' },
                        { name: 'onMigrationFailure', description: 'Callback on migration error: ({ version, direction, error, currentStoredVersion }) => void', version: '1.0.0' },
                    ],
                },
                helpData: {
                    title: 'Help Data Structure',
                    description: 'Defining commands, topics, and changelog',
                    handouts: 'dev',
                    version: '1.0.0',
                    body: 'The `help` object defines what appears in chat help, man search, whatsnew, and generated handouts.',
                    items: [
                        { name: 'description', description: 'Short text shown at top of help and handout', version: '1.0.0' },
                        { name: 'quickStart', description: 'Array of strings — rendered as ordered list in handout', version: '1.0.0' },
                        { name: 'changelog', description: 'Array of { version, changes[] } — explicit whatsnew entries', version: '1.0.0' },
                        { name: 'commands', description: 'Array of { group, commands[] } — grouped command list', version: '1.0.0' },
                        { name: 'command.syntax', description: 'Usage string (e.g. "run <name> [--flag]")', version: '1.0.0' },
                        { name: 'command.description', description: 'Short description for help list', version: '1.0.0' },
                        { name: 'command.details', description: 'Longer explanation — handout only', version: '1.0.0' },
                        { name: 'command.items', description: 'Sub-items (flags/args) — rendered as bullet list', version: '1.0.0' },
                        { name: 'command.version', description: 'Version when added — used for [new] badge', version: '1.0.0' },
                        { name: 'topics', description: 'Object keyed by id — detailed help topics for man/handout', version: '1.0.0' },
                        { name: 'topic.title', description: 'Display title', version: '1.0.0' },
                        { name: 'topic.body', description: 'Main content — string or () => string', version: '1.0.0' },
                        { name: 'topic.handouts', description: '"usr" (default) | "dev" | ["usr","dev"] | null (man-only)', version: '1.0.0' },
                        { name: 'topic.items', description: 'Array of { name, description, version } sub-items', version: '1.0.0' },
                    ],
                },
                examples: {
                    title: 'Registering Examples',
                    description: 'How to add examples for any script',
                    handouts: 'dev',
                    version: '1.0.0',
                    body: '`ScriptKit.TargetScript.registerExample(yourScript, struct)` — registers an example for any ScriptKit-enabled script.\n\nLoad order does not matter — examples queue via Proxy and drain when the target registers. Your script can register examples for itself or for other scripts.',
                    items: [
                        { name: 'name', description: 'Unique example name (required)', version: '1.0.0' },
                        { name: 'description', description: 'Shown in examples menu', version: '1.0.0' },
                        { name: 'guide', description: 'Array of guide steps — required if no handout', version: '1.0.0' },
                        { name: 'handout', description: 'Object or (ctx) => object — required if no guide', version: '1.0.0' },
                        { name: 'handout.notes', description: 'Main handout content', version: '1.0.0' },
                        { name: 'handout.gmnotes', description: 'GM-only notes', version: '1.0.0' },
                        { name: 'handout.archived', description: 'Archive on create (default: true)', version: '1.0.0' },
                        { name: 'onComplete', description: '(ctx) => void — called when guide finishes', version: '1.0.0' },
                    ],
                },
                guides: {
                    title: 'Guide Steps',
                    description: 'Interactive wizard step API',
                    handouts: 'dev',
                    version: '1.0.0',
                    body: 'Each step is an object with `prompt` (string or (ctx) => string, supports `` `code` ``, `**bold**`, `*italic*`).\n\n**ctx object:** `selections`, `params`, `msg`, `handoutName`, `selected`\n\nSteps render with hue-rotating backgrounds for visual progression. Errors support markdown formatting.',
                    items: [
                        { name: 'prompt', description: 'String or (ctx) => string — step text with markdown support', version: '1.0.0' },
                        { name: 'select', description: 'Roll20 _type filter: "token", "card", "pin", "path"', version: '1.0.0' },
                        { name: 'as', description: 'Key to store selection result in ctx.selections', version: '1.0.0' },
                        { name: 'min / max', description: 'Selection count constraints', version: '1.0.0' },
                        { name: 'query', description: 'Object or array: { name, default?, type?, options? }', version: '1.0.0' },
                        { name: 'query.type', description: 'Number, Boolean, String (default), or custom (v) => value that throws on error', version: '1.0.0' },
                        { name: 'query.options', description: 'Array of { label, value } or strings — renders as Roll20 dropdown', version: '1.0.0' },
                        { name: 'onContinue', description: '(ctx) => errorString? — validate before advancing', version: '1.0.0' },
                        { name: 'onEnter', description: '(ctx, advance) => void — called on step entry. advance(error?) to continue.', version: '1.0.0' },
                        { name: 'onExit', description: '(ctx) => void — cleanup on Back navigation', version: '1.0.0' },
                        { name: 'auto: true', description: 'Skip without user interaction (not counted in step total)', version: '1.0.0' },
                        { name: 'ScriptKit.handout()', description: 'Sentinel step — generates handout at this point in the guide', version: '1.0.0' },
                        { name: '...ScriptKit.waitForCommand(cmd)', description: 'Spread onto step — auto-advances when cmd detected in chat', version: '1.0.0' },
                        { name: 'offerExamples', description: 'Array of example names — renders "What\'s Next?" buttons below the step', version: '1.0.0' },
                    ],
                },
                guideAnnotations: {
                    title: 'Guide Annotations',
                    description: 'Temporary visual aids for interactive guides',
                    handouts: 'dev',
                    version: '1.0.0',
                    body: 'Draw temporary shapes on the map during guide steps to highlight elements. Annotations auto-clear on step transition and are persisted in state for crash recovery.',
                    items: [
                        { name: 'ScriptKit.ping(pageId, x, y, opts)', description: 'Ping the map and move camera. opts: { player, color, moveAll, visibleTo, playerId }', version: '1.0.0' },
                        { name: 'ScriptKit.annotate(pageId, shape, x, y, opts)', description: 'Draw a temporary pathv2. Returns the object. Shapes: circle, arrow, line, rect', version: '1.0.0' },
                        { name: 'ScriptKit.clearAnnotations()', description: 'Remove all active annotations manually', version: '1.0.0' },
                        { name: 'circle opts', description: 'radius (default 40), color, strokeWidth, fill', version: '1.0.0' },
                        { name: 'arrow opts', description: 'fromX, fromY (tail position), chevronDepth, chevronWidth, color, strokeWidth, fill', version: '1.0.0' },
                        { name: 'line opts', description: 'fromX, fromY (start position), color, strokeWidth, fill', version: '1.0.0' },
                        { name: 'rect opts', description: 'width (default 80), height (default 80), color, strokeWidth, fill', version: '1.0.0' },
                        { name: 'ping opts.color', description: 'Temporarily swaps player color before pinging (100ms delay, restores after 200ms)', version: '1.0.0' },
                    ],
                },
                handouts: {
                    title: 'Example Handouts',
                    description: 'Static and dynamic handout generation',
                    handouts: 'dev',
                    version: '1.0.0',
                    body: 'The `handout` field can be a static object (generated before guide) or a function receiving `ctx` (generated after guide collects params).\n\nPlace `ScriptKit.handout()` in guide to control generation timing. Without it: function handouts generate at end, object handouts at start.\n\n**Naming:** `[tag] source/example-name` (no tag prefix if tag is not set).',
                },
                htmlHelpers: {
                    title: 'HTML Helpers',
                    description: 'Formatting utilities via ScriptKit.html',
                    handouts: 'dev',
                    version: '1.0.0',
                    body: 'Available via `ScriptKit.html`. Use these in topic bodies, prompts, and handout content.',
                    items: [
                        { name: 'escape(str)', description: 'HTML entities + \\n → <br>', version: '1.0.0' },
                        { name: 'format(str)', description: 'Escape + `code`, **bold**, *italic*', version: '1.0.0' },
                        { name: 'bold / italic / underline / small / sup / code / pre', description: 'Tag wrappers with optional style object', version: '1.0.0' },
                        { name: 'button(label, cmd, style?)', description: 'Clickable command link', version: '1.0.0' },
                        { name: 'table(headers, rows, style?)', description: 'HTML table', version: '1.0.0' },
                        { name: 'list(items)', description: 'Unordered list (&lt;ul&gt;)', version: '1.0.0' },
                        { name: 'orderedList(items)', description: 'Ordered list (&lt;ol&gt;)', version: '1.0.0' },
                        { name: 'handoutLink(text, id)', description: 'Journal link', version: '1.0.0' },
                        { name: 'newBadge() / deprecatedBadge()', description: 'Version badge markers', version: '1.0.0' },
                        { name: 'style(obj)', description: 'Convert camelCase object to CSS string', version: '1.0.0' },
                    ],
                },
                migrations: {
                    title: 'State Migrations',
                    description: 'Versioned state upgrades and rollbacks',
                    handouts: 'dev',
                    version: '1.0.0',
                    body: 'Register `state` and `migrations` to enable auto-upgrade and manual rollback.\n\n**up** — function, runs on upgrade. Receives state reference.\n**down** — string, persisted in state.ScriptKit.migrations for rollback after code swap.\n**Working copy** — all migrations run on a JSON clone. Committed only if all succeed.\n**Failure** — throw to abort. State remains untouched.\n\n**Rollback scenario:** Install v1.2.0 (down strings stored) → downgrade to v1.0.0 → run `!cmd migrate` → stored strings eval\'d → state rolled back.',
                    items: [
                        { name: 'up: (state) => { ... }', description: 'Forward migration function', version: '1.0.0' },
                        { name: 'down: "(state) => { ... }"', description: 'Rollback as string — must be self-contained, no closures', version: '1.0.0' },
                        { name: '!cmd migrate', description: 'Syncs state to current script version (forward or backward)', version: '1.0.0' },
                    ],
                },
                motd: {
                    title: 'MOTD',
                    description: 'Message of the Day — random tips on startup',
                    handouts: 'dev',
                    version: '1.0.0',
                    body: 'Whispers a random tip from `motd` array to the GM on sandbox restart. Styled as a card with customizable header and frame.',
                    items: [
                        { name: 'motd', description: 'Array of tip strings (supports markdown formatting). Empty = disabled.', version: '1.0.0' },
                        { name: 'motdHeader', description: 'String or (version) => string. Default: "💡 ScriptName vX.Y.Z"', version: '1.0.0' },
                        { name: 'motdStyle', description: 'CSS style object merged with default card appearance', version: '1.0.0' },
                    ],
                },
                readySignal: {
                    title: 'Ready Signal',
                    description: 'Load-order coordination between scripts',
                    handouts: 'dev',
                    version: '1.0.0',
                    body: '`ScriptKit.register()` automatically sends `!<command>-ready` to chat. Other scripts listen for this to know when your script is available for direct API calls.\n\nExample registration does NOT require the ready signal — the Proxy queues automatically regardless of load order.',
                },
                scriptKit: null,
            }
        }
    });
});