// =============================================================================
// ScriptKit v1.0.0
// Last Updated: 2026-07-12
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

    // =========================================================================
    // HTML Helpers
    // =========================================================================

    const html = {
        escape: (str) => (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>'),
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

    const replyError = (msg, scriptName, text) => reply(msg, scriptName, 'Error', text);

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
        if (!scriptName || !opts || !opts.command || !opts.tag) {
            log(SCRIPT_NAME + ': register requires scriptName, command, and tag.');
            return false;
        }
        registrations[scriptName] = {
            _scriptName: scriptName,
            command: opts.command,
            tag: opts.tag,
            aliases: Object.assign({
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
            }, opts.aliases || {}),
            exampleHandler: opts.exampleHandler || null,
            onComplete: opts.onComplete || null,
            version: opts.version || null,
            stateRef: opts.state || null,
            migrations: opts.migrations || null,
            onMigrationFailure: opts.onMigrationFailure || null,
            help: opts.help || null,
            newSince: opts.newSince || null,
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

        // Auto-generate user help handout on version bump (or first install)
        if (opts.help && opts.version) {
            ensureState();
            var storedVer = state[SCRIPT_NAME].versions[scriptName] || '0.0.0';
            if (compareSemver(storedVer, opts.version) !== 0 || !findObjs({ type: 'handout', name: 'Help: ' + scriptName })[0]) {
                setTimeout(() => generateHelpHandout(null, scriptName, registrations[scriptName], 'usr'), 500);
            }
        }

        // Send ready signal
        sendChat('', opts.command + '-ready', null, { noarchive: true });

        return true;
    };

    // =========================================================================
    // Migrations
    // =========================================================================

    const ensureState = () => {
        if (!state[SCRIPT_NAME]) state[SCRIPT_NAME] = {};
        if (!state[SCRIPT_NAME].versions) state[SCRIPT_NAME].versions = {};
    };

    /**
     * Compare semver strings. Returns -1, 0, or 1.
     */
    const compareSemver = (a, b) => {
        const pa = a.split('.').map(Number);
        const pb = b.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
            const na = pa[i] || 0;
            const nb = pb[i] || 0;
            if (na < nb) return -1;
            if (na > nb) return 1;
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
        if (reg.newSince) {
            return compareSemver(itemVersion, reg.newSince) >= 0;
        }
        // Default: compare major.minor against previous stored version
        ensureState();
        var prev = state[SCRIPT_NAME].versions[reg._scriptName] || '0.0.0';
        var prevMinor = prev.split('.').slice(0, 2).join('.');
        var itemMinor = itemVersion.split('.').slice(0, 2).join('.');
        return compareSemver(itemMinor + '.0', prevMinor + '.0') > 0;
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
            log(SCRIPT_NAME + ': ' + scriptName + ' downgraded from ' + storedVersion + ' to ' + currentVersion + '. Run ' + opts.command + ' ' + (registrations[scriptName].aliases.migrate || 'migrate') + ' --rollback to revert state.');
            // Whisper on next chat opportunity (can't whisper during ready)
            setTimeout(() => {
                sendChat(scriptName, '/w gm ⚠️ ' + html.bold(scriptName) + ' downgraded from ' + storedVersion + ' to ' + currentVersion + '. State may be incompatible. Use ' + html.code(opts.command + ' ' + (registrations[scriptName].aliases.migrate || 'migrate') + ' --rollback') + ' to revert state.', null, { noarchive: true });
            }, 1000);
            return;
        }

        // Upgrade — run migrations sequentially
        const toRun = getMigrationsBetween(opts.migrations, storedVersion, currentVersion, 'up');
        for (let i = 0; i < toRun.length; i++) {
            const v = toRun[i];
            const migration = opts.migrations[v];
            const upFn = typeof migration === 'function' ? migration : migration.up;
            if (typeof upFn !== 'function') continue;
            try {
                upFn(opts.state);
                state[SCRIPT_NAME].versions[scriptName] = v;
            } catch (e) {
                log(SCRIPT_NAME + ': ' + scriptName + ' migration to ' + v + ' FAILED: ' + e.message);
                sendChat(scriptName, '/w gm ❌ ' + html.bold(scriptName) + ' migration to ' + v + ' failed: ' + e.message + '. State is at version ' + (state[SCRIPT_NAME].versions[scriptName] || '0.0.0') + '.', null, { noarchive: true });
                const reg = registrations[scriptName];
                if (reg && typeof reg.onMigrationFailure === 'function') {
                    reg.onMigrationFailure({ version: v, direction: 'up', error: e, currentStoredVersion: state[SCRIPT_NAME].versions[scriptName] || '0.0.0' });
                }
                return;
            }
        }

        // All migrations succeeded — store final version
        state[SCRIPT_NAME].versions[scriptName] = currentVersion;
        if (toRun.length > 0) {
            log(SCRIPT_NAME + ': ' + scriptName + ' migrated from ' + storedVersion + ' to ' + currentVersion + ' (' + toRun.length + ' migration(s)).');
        }
    };

    /**
     * Handle manual rollback command.
     */
    const handleMigrateCommand = (msg, scriptName, reg, args) => {
        if (args.indexOf('--rollback') === -1) {
            // Show current version info
            ensureState();
            const stored = state[SCRIPT_NAME].versions[scriptName] || '0.0.0';
            const current = reg.version || 'unknown';
            reply(msg, scriptName, 'Migrate', 'Version: ' + html.bold(current) + ' (state: ' + stored + ')');
            return;
        }

        if (!reg.migrations || !reg.version || !reg.stateRef) {
            replyError(msg, scriptName, 'No migrations registered for ' + scriptName + '.');
            return;
        }

        ensureState();
        const storedVersion = state[SCRIPT_NAME].versions[scriptName] || '0.0.0';
        const currentVersion = reg.version;

        if (compareSemver(storedVersion, currentVersion) <= 0) {
            reply(msg, scriptName, 'Migrate', 'No rollback needed — state is at or below current version.');
            return;
        }

        // Run down migrations from stored → current
        const toRun = getMigrationsBetween(reg.migrations, storedVersion, currentVersion, 'down');
        let rolledBack = 0;
        for (let i = 0; i < toRun.length; i++) {
            const v = toRun[i];
            const migration = reg.migrations[v];
            if (typeof migration === 'function') {
                replyError(msg, scriptName, 'Migration ' + v + ' has no rollback (down) function. Cannot continue.');
                return;
            }
            if (typeof migration.down !== 'function') {
                replyError(msg, scriptName, 'Migration ' + v + ' has no rollback (down) function. Cannot continue.');
                return;
            }
            try {
                migration.down(reg.stateRef);
                // After rolling back version X, stored version becomes the one before X
                const allVersions = Object.keys(reg.migrations).sort(compareSemver);
                const idx = allVersions.indexOf(v);
                const prevVersion = idx > 0 ? allVersions[idx - 1] : '0.0.0';
                state[SCRIPT_NAME].versions[scriptName] = prevVersion;
                rolledBack++;
            } catch (e) {
                replyError(msg, scriptName, 'Rollback of ' + v + ' failed: ' + e.message + '. State is at version ' + (state[SCRIPT_NAME].versions[scriptName] || '0.0.0') + '.');
                if (typeof reg.onMigrationFailure === 'function') {
                    reg.onMigrationFailure({ version: v, direction: 'down', error: e, currentStoredVersion: state[SCRIPT_NAME].versions[scriptName] || '0.0.0' });
                }
                return;
            }
        }

        state[SCRIPT_NAME].versions[scriptName] = currentVersion;
        reply(msg, scriptName, 'Migrate', 'Rolled back ' + rolledBack + ' migration(s). State now at version ' + html.bold(currentVersion) + '.');
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
            handleGuideContinue(msg, args[0]);
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
            out += body + html.paragraph('');
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
                if (item.description) out += item.description + html.br();
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
        if (cmd.details) out += html.br() + cmd.details + html.br();
        out += html.br();

        if (cmd.items) {
            cmd.items.forEach(item => {
                if (item.deleted) return;
                var vTag = '';
                if (isNewVersion(item.version, reg)) vTag = ' ' + html.newBadge();
                if (item.deprecated) vTag = ' ' + html.deprecatedBadge();
                out += html.bold(html.escape(item.name)) + vTag;
                out += html.br();
                if (item.description) out += item.description + html.br();
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

        const filteredTopicKeys = Object.keys(topics).filter(k => !topics[k].deleted && matchesMode(topics[k]));

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
        if (helpData.description) out += '<p>' + helpData.description + '</p>';

        // Quick Start / Examples callout
        var hasExamples = reg.aliases && reg.aliases.examples && Object.values(examples).filter(e => e.target === scriptName).length > 0;
        var examplesBtn = hasExamples ? ' ' + html.button('📖 Examples', reg.command + ' ' + reg.aliases.examples, { background: '#444', fontSize: '11px' }) : '';
        if (helpData.quickStart) {
            out += '<h2>Quick Start' + examplesBtn + '</h2>';
            var qs = helpData.quickStart;
            if (typeof qs === 'function') qs = qs();
            if (Array.isArray(qs)) out += html.orderedList(qs);
            else out += '<div>' + qs + '</div>';
        } else if (hasExamples) {
            out += '<p>' + examplesBtn + ' — ready-made examples you can install and learn from.</p>';
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
                        if (c.details) result += '<p>' + c.details + '</p>';
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
            if (t.details) out += '<p>' + t.details + '</p>';
            if (t.body) {
                var body = typeof t.body === 'function' ? t.body() : t.body;
                out += '<div>' + body + '</div>';
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
                    if (item.description) out += '<p>' + item.description + '</p>';
                    if (item.details) out += '<p>' + item.details + '</p>';
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
                const hasHandler = reg.exampleHandler || ex.handout;
                const handoutName = hasHandler ? getHandoutName(reg.tag, ex.source, ex.name, null) : null;
                const exists = handoutName ? findObjs({ type: 'handout', name: handoutName })[0] : null;
                out += html.indent(2) + '• ' + html.underline(highlightMatch(ex.name, nameFilter || ''));
                if (ex.description) out += ' — ' + highlightMatch(ex.description, descFilter || '');
                out += ' ';
                if (ex.handout || reg.exampleHandler) {
                    if (exists) {
                        out += html.button('🔄 Regen', reg.command + ' ' + reg.aliases.generate + ' ' + ex.name) + ' ';
                        if (ex.guide && ex.guide.length > 0) {
                            out += html.button('🧭 Guide', reg.command + ' ' + reg.aliases.guide + ' ' + ex.name) + ' ';
                        }
                        out += html.handoutLink('[Open]', exists.get('id'));
                    } else {
                        out += html.button('+ Generate', reg.command + ' ' + reg.aliases.generate + ' ' + ex.name);
                    }
                } else if (ex.guide && ex.guide.length > 0) {
                    out += html.button('🧭 Guide', reg.command + ' ' + reg.aliases.guide + ' ' + ex.name);
                }
                out += html.br();
            });
        });
        reply(msg, scriptName, 'Examples', out);
    };

    // =========================================================================
    // Example Generation
    // =========================================================================

    const getHandoutName = (defaultTag, source, exampleName, handlerResult) => {
        const tag = (handlerResult && handlerResult.tag) || defaultTag;
        return '[' + tag + '] ' + source + '/example-' + exampleName;
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
        const ctx = { selections: g.selections, params: g.params, msg: g.msg, handoutName: g.handoutName };
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

        if (g.currentStep >= g.steps.length) {
            // All steps complete — call onComplete
            completeGuide(guideId);
            return;
        }

        const step = g.steps[g.currentStep];

        // Conditional step — check 'when'
        if (typeof step.when === 'function') {
            const ctx = { selections: g.selections, params: g.params, msg: g.msg };
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
                const ctx = { selections: g.selections, params: g.params, msg: g.msg, handoutName: g.handoutName };
                step.action(ctx);
            }
            g.currentStep++;
            enterStep(guideId);
            return;
        }

        // Interactive step — show prompt
        const interactiveSteps = g.steps.filter(s => !s.auto);
        const interactiveIdx = interactiveSteps.indexOf(step) + 1;
        const interactiveTotal = interactiveSteps.length;
        const hasPriorInteractive = g.steps.slice(0, g.currentStep).some(s => !s.auto);

        let prompt = html.div(
            html.bold(html.escape(g.handoutName || g.example.name)) + ' — Setup (step ' + interactiveIdx + '/' + interactiveTotal + ')' + html.paragraph('')
            + step.prompt + html.paragraph('')
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
                let qOut = '';
                queries.forEach(q => {
                    qOut += html.bold(html.escape(q.name));
                    if (q.default) qOut += ' [' + html.escape(q.default) + ']';
                    if (q.description) qOut += ' — ' + html.italic(html.escape(q.description));
                    qOut += html.br();
                });
                qOut += html.br();
                const queryParts = queries.map(q => {
                    if (q.type === 'boolean') return '--' + q.name + ' ?{' + q.name + '|true|false}';
                    return '--' + q.name + ' ?{' + q.name + '|' + (q.default || '') + '}';
                }).join(' ');
                qOut += html.button('✅ Continue', g.reg.command + ' ' + g.reg.aliases.guideContinue + ' ' + guideId + ' ' + queryParts);
                return qOut;
            })() : html.button('✅ Continue', g.reg.command + ' ' + g.reg.aliases.guideContinue + ' ' + guideId))
            + (hasPriorInteractive ? ' ' + html.button('⬅ Back', g.reg.command + ' ' + g.reg.aliases.guideBack + ' ' + guideId) : '')
            + ' ' + html.button('✖ Cancel', g.reg.command + ' ' + g.reg.aliases.guideCancel + ' ' + guideId),
            { background: '#335', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '12px' }
        );

        reply(g.msg, g.source, 'Guide', prompt);
    };

    const handleGuideContinue = (msg, guideId) => {
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

        // Handle query steps (parse --key value from msg.content)
        if (step.query) {
            const queries = Array.isArray(step.query) ? step.query : [step.query];
            const content = msg.content;
            queries.forEach(q => {
                const re = new RegExp('--' + q.name + '\\s+(\\S+)');
                const match = content.match(re);
                if (match && match[1]) g.params[q.name] = match[1];
                else if (q.default) g.params[q.name] = q.default;
            });
        }

        // Role assignment (Choreograph compatibility)
        if (step.role) {
            if (!g.selections._roles) g.selections._roles = {};
            g.selections._roles[step.role] = selected;
        }

        // onContinue callback — if it returns a string, treat as validation error
        if (typeof step.onContinue === 'function') {
            const ctx = { selections: g.selections, params: g.params, selected: selected, msg: msg };
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

        // Undo current step
        const currentStep = g.steps[g.currentStep];
        if (currentStep && currentStep.as) delete g.selections[currentStep.as];
        if (currentStep && currentStep.role && g.selections._roles) delete g.selections._roles[currentStep.role];

        // Step backward
        g.currentStep--;
        const step = g.steps[g.currentStep];

        // onBack callback
        if (typeof step.onBack === 'function') {
            const ctx = { selections: g.selections, params: g.params, msg: msg };
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
                const ctx = { selections: g.selections, params: g.params, msg: msg };
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
    sendChat('', '!scriptkit-ready', null, { noarchive: true });
});
