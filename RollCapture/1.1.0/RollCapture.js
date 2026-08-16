// RollCapture v1.1.0 — Generic roll result extraction/storage for Roll20
// Detects rolls via chat:message, extracts values per configurable rules,
// and emits captured data to registered consumer callbacks.

var RollCapture = RollCapture || (() => { // eslint-disable-line no-unused-vars
    'use strict';

    const SCRIPT_NAME = 'RollCapture';
    const SCRIPT_VERSION = '1.1.0';
    const KEYWORDS = ['template:', 'name_field:', 'char_field:', 'when:', 'default:'];
    const CMD = '!rollcapture';

    let rules = [];
    let callbacks = new Map();
    let pendingChoices = {}; // id → { captures, resolve info }
    let dissectArmed = false;

    // ─── Rule Parser ────────────────────────────────────────────────────────────

    const parseRules = (text) => {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        const rule = { templates: [], nameField: '', charFields: [], blocks: [] };
        let currentBlock = null;

        for (const line of lines) {
            if (line.startsWith('template:')) {
                rule.templates = line.slice(9).split(',').map(s => s.trim()).filter(Boolean);
            } else if (line.startsWith('name_field:')) {
                rule.nameField = line.slice(11).trim();
            } else if (line.startsWith('char_field:')) {
                rule.charFields = line.slice(11).split(',').map(s => s.trim()).filter(Boolean);
            } else if (line.startsWith('when:')) {
                currentBlock = { condition: line.slice(5).trim(), captures: {} };
                rule.blocks.push(currentBlock);
            } else if (line.startsWith('default:')) {
                currentBlock = { condition: null, captures: {} };
                rule.blocks.push(currentBlock);
            } else if (currentBlock) {
                // capture line: name: formula
                const sep = line.indexOf(':');
                if (sep > 0) {
                    const name = line.slice(0, sep).trim();
                    const formula = line.slice(sep + 1).trim();
                    if (!KEYWORDS.some(k => line.startsWith(k))) {
                        currentBlock.captures[name] = formula; // empty string = clear
                    }
                }
            }
        }
        return rule;
    };

    // ─── Handout Loading ────────────────────────────────────────────────────────

    const loadRulesFromHandouts = () => {
        rules = [];
        const handouts = findObjs({ type: 'handout' }).filter(h =>
            h.get('name').includes('[RollCapture]') || h.get('name').includes('[RC]')
        );
        let loaded = 0;
        handouts.forEach(h => {
            h.get('notes', (notes) => {
                if (!notes) return;
                const text = decodeURIComponent(notes)
                    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<\/?[^>]+>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>');
                const rule = parseRules(text);
                if (rule.templates.length) {
                    rule.handoutId = h.get('id');
                    rule.handoutName = h.get('name');
                    rules.push(rule);
                    loaded++;
                }
            });
        });
        setTimeout(() => log(`RollCapture: loaded ${loaded} rule(s) from ${handouts.length} handout(s)`), 500);
    };

    // ─── Field Resolution ───────────────────────────────────────────────────────

    const buildFieldMap = (content, inlinerolls) => {
        // Map field names to their inline roll totals
        // {{r1=$[[2]]}} → fieldMap.r1 = inlinerolls[2].results.total
        const map = {};
        const re = /\{\{(\w[\w-]*)=\$\[\[(\d+)\]\]\}\}/g;
        let m;
        while ((m = re.exec(content)) !== null) {
            const idx = parseInt(m[2], 10);
            if (inlinerolls[idx] && inlinerolls[idx].results) {
                map[m[1]] = inlinerolls[idx].results.total;
            }
        }
        return map;
    };

    const buildFlagMap = (content) => {
        // Map fields with non-roll values: {{normal=1}}, {{attack=1}}, etc.
        const map = {};
        const re = /\{\{(\w[\w-]*)=([^$}][^}]*)\}\}/g;
        let m;
        while ((m = re.exec(content)) !== null) {
            map[m[1]] = m[2];
        }
        // Also match empty fields: {{range=}}
        const reEmpty = /\{\{(\w[\w-]*)=\}\}/g;
        while ((m = reEmpty.exec(content)) !== null) {
            map[m[1]] = '';
        }
        return map;
    };

    // ─── Formula Evaluation ─────────────────────────────────────────────────────

    const evalFormula = (formula, fieldMap) => {
        if (!formula) return undefined; // empty = clear

        // Function call: max(...), min(...), sum(...), choose(...)
        const funcMatch = formula.match(/^(max|min|sum|choose)\((.+)\)$/);
        if (funcMatch) {
            const fn = funcMatch[1];
            const args = funcMatch[2].split(',').map(a => a.trim());
            const resolved = args.map(a => fieldMap[a]).filter(v => v !== undefined);

            if (resolved.length === 0) return undefined;

            switch (fn) {
                case 'max': return Math.max(...resolved);
                case 'min': return Math.min(...resolved);
                case 'sum': return resolved.reduce((a, b) => a + b, 0);
                case 'choose': {
                    const unique = [...new Set(resolved)];
                    if (unique.length === 1) return unique[0];
                    return { __choose: true, options: args.filter(a => fieldMap[a] !== undefined).map(a => ({ name: a, value: fieldMap[a] })) };
                }
            }
        }

        // Direct field reference
        return fieldMap[formula] !== undefined ? fieldMap[formula] : undefined;
    };

    // ─── Condition Matching ─────────────────────────────────────────────────────

    const matchCondition = (condition, content) => {
        // condition is something like "{{advantage=1}}"
        return content.includes(condition);
    };

    // ─── Name Cleaning ──────────────────────────────────────────────────────────

    const cleanName = (raw) => {
        if (!raw) return '';
        return raw
            .replace(/^\^{/, '').replace(/}$/, '') // strip ^{ }
            .replace(/-u$/, '')                     // strip -u suffix
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '_');          // sanitize
    };

    // ─── Choose Prompt ──────────────────────────────────────────────────────────

    const promptChoose = (context, captureName, options) => {
        const id = generateUUID();
        pendingChoices[id] = context;
        const buttons = options.map(o =>
            `[${o.name}: ${o.value}](${CMD} --choose ${id} ${captureName} ${o.value})`
        ).join(' ');
        whisper(`**${context.charName} — ${context.rollName}** (${captureName}): ${buttons}`);
    };

    // ─── Core Processing ────────────────────────────────────────────────────────

    const processMessage = (msg) => {
        if (!msg.rolltemplate || !msg.inlinerolls) return;

        if (dissectArmed) {
            dissectArmed = false;
            const template = msg.rolltemplate;
            const content = msg.content;
            const inlinerolls = msg.inlinerolls;
            let out = '<b>Template:</b> <code>' + template + '</code><br>';
            // Fields with roll refs: {{field=$[[N]]}}
            const rollRefs = [];
            const rollRx = /\{\{(\w[\w-]*)=\$\[\[(\d+)\]\]\}\}/g;
            let m;
            while ((m = rollRx.exec(content)) !== null) {
                const idx = parseInt(m[2], 10);
                const total = (inlinerolls[idx] && inlinerolls[idx].results) ? inlinerolls[idx].results.total : '?';
                rollRefs.push(m[1] + ' = $[[' + m[2] + ']] → <b>' + total + '</b>');
            }
            // Fields with literal values: {{field=value}}
            const flags = [];
            const flagRx = /\{\{(\w[\w-]*)=([^$}][^}]*)\}\}/g;
            while ((m = flagRx.exec(content)) !== null) {
                flags.push(m[1] + ' = <code>' + m[2] + '</code>');
            }
            // Empty fields: {{field=}}
            const emptyRx = /\{\{(\w[\w-]*)=\}\}/g;
            while ((m = emptyRx.exec(content)) !== null) {
                flags.push(m[1] + ' = <i>(empty)</i>');
            }
            // Bare fields (e.g. charname=X)
            const bareRx = /(?:^|\s)(\w+)=([^\s{][^\s]*)/g;
            while ((m = bareRx.exec(content)) !== null) {
                if (!m[0].includes('{{')) flags.push(m[1] + ' = <code>' + m[2] + '</code> (bare)');
            }
            if (rollRefs.length) out += '<b>Roll fields:</b><br>' + rollRefs.join('<br>') + '<br>';
            if (flags.length) out += '<b>Value fields:</b><br>' + flags.join('<br>') + '<br>';
            out += '<b>Inline rolls:</b> ' + inlinerolls.length + '<br>';
            out += '<b>Raw content:</b> <code>' + content.slice(0, 300) + '</code>';
            whisper(out);
            return;
        }

        const template = msg.rolltemplate;
        const content = msg.content;
        const inlinerolls = msg.inlinerolls;

        for (const rule of rules) {
            if (!rule.templates.includes(template)) continue;

            const fieldMap = buildFieldMap(content, inlinerolls);
            const flagMap = buildFlagMap(content);

            // Resolve roll name
            const rollName = flagMap[rule.nameField] || fieldMap[rule.nameField] || '';

            // Resolve character name
            let charName = '';
            for (const cf of rule.charFields) {
                if (flagMap[cf]) { charName = flagMap[cf]; break; }
            }
            // Also check bare charname= at end of content
            if (!charName) {
                const bareMatch = content.match(/charname=(.+?)(?:\s*"|\s*$)/);
                if (bareMatch) charName = bareMatch[1].replace(/\\"/g, '"').trim();
            }

            // Resolve character ID(s)
            const chars = charName ? findObjs({ type: 'character', name: charName }) : [];
            if (chars.length > 1) {
                whisper(`⚠️ Multiple character sheets named <code>${charName}</code> — capturing for all matches.`);
            }

            // Find matching block
            let activeBlock = null;
            for (const block of rule.blocks) {
                if (block.condition === null) continue; // skip default for now
                if (matchCondition(block.condition, content)) {
                    activeBlock = block;
                    break;
                }
            }
            // Fallback to default
            if (!activeBlock) {
                activeBlock = rule.blocks.find(b => b.condition === null);
            }
            if (!activeBlock) continue;

            // Process captures
            const results = {};
            let hasChoose = false;

            for (const [captureName, formula] of Object.entries(activeBlock.captures)) {
                const value = evalFormula(formula, fieldMap);
                if (value && value.__choose) {
                    hasChoose = true;
                    const charId = chars.length > 0 ? chars[0].get('id') : null;
                    const context = { rule, rollName: cleanName(rollName), charName, charId, playerId: msg.playerid, results, msg, chars };
                    promptChoose(context, captureName, value.options);
                } else {
                    results[captureName] = value;
                }
            }

            if (!hasChoose) {
                chars.forEach(c => {
                    emitCapture(charName, c.get('id'), cleanName(rollName), results, msg.playerid, msg);
                });
                if (chars.length === 0) {
                    emitCapture(charName, null, cleanName(rollName), results, msg.playerid, msg);
                }
            }
        }
    };

    // ─── Callback Registry ──────────────────────────────────────────────────────

    const emitCapture = (charName, charId, rollName, captures, playerId, msg) => {
        const event = { charName, charId, rollName, captures, playerId, msg };
        for (const fn of callbacks.values()) {
            fn(event);
        }
        fireAbility(charId, rollName, captures, playerId);
    };

    // ─── Ability Firing ─────────────────────────────────────────────────────────

    const fireAbility = (charId, rollName, captures, playerId) => {
        if (!charId) return;

        const abilities = findObjs({ type: 'ability', _characterid: charId });
        const specificName = 'rc_' + rollName;

        const any_abils = abilities.filter(a => a.get('name') === 'rc_any');
        const match_abils = abilities.filter(a => a.get('name') === specificName);
        const default_abils = match_abils.length === 0 ? abilities.filter(a => a.get('name') === 'rc_default') : [];
        for (const a of [...any_abils, ...match_abils, ...default_abils]) {
            runAbility(a, captures, rollName, playerId);
        }
    };

    const runAbility = (ability, captures, rollName, playerId) => {
        const action = ability.get('action');
        if (!action) return;
        let cmd = action.replace(/\$\{rollname\}/gi, rollName);
        for (const [varName, value] of Object.entries(captures)) {
            const captureName = varName.split('_').pop();
            cmd = cmd.replace(new RegExp('\\$\\{' + captureName + '\\}', 'gi'), value !== undefined ? value : '');
        }
        sendChat('player|' + playerId, cmd);
    };

    const onCapture = (sourceId, fn) => {
        callbacks.set(sourceId, fn);
    };

    // ─── Command Handling ───────────────────────────────────────────────────────

    const handleCommand = (msg) => {
        const args = msg.content.split(/\s+/);
        args.shift(); // remove !rollcapture

        if (args[0] === '--choose') {
            const [, id, captureName, value] = args;
            const ctx = pendingChoices[id];
            if (!ctx) return whisper('Choice expired or invalid.');
            ctx.results[captureName] = parseInt(value, 10) || 0;
            delete pendingChoices[id];
            (ctx.chars || []).forEach(c => {
                emitCapture(ctx.charName, c.get('id'), ctx.rollName, ctx.results, ctx.playerId, ctx.msg);
            });
            if (!ctx.chars || ctx.chars.length === 0) {
                emitCapture(ctx.charName, ctx.charId, ctx.rollName, ctx.results, ctx.playerId, ctx.msg);
            }
            whisper(`Captured ${captureName} = ${value}`);
            return;
        }

        if (args[0] === 'dissect') {
            dissectArmed = true;
            whisper('Armed. Next roll template will be dissected.');
            return;
        }

        if (args[0] === 'reload') {
            loadRulesFromHandouts();
            whisper('Rules reloaded.');
            return;
        }

        if (args[0] === 'status') {
            whisper(`**RollCapture v${SCRIPT_VERSION}**<br>Rules: ${rules.length}<br>Callbacks: ${callbacks.size}<br>Pending choices: ${Object.keys(pendingChoices).length}`);
            return;
        }

        if (args[0] === 'rules') {
            if (!rules.length) return whisper('No rules loaded.');
            const list = rules.map((r, i) => `${i + 1}. <a href="http://journal.roll20.net/handout/${r.handoutId}">${stripTag(r.handoutName)}</a>`).join('<br>');
            whisper(`**Loaded Rules:**<br>${list}`);
            return;
        }

        if (args[0] === 'rule') {
            const name = args.slice(1).join(' ');
            if (!name) return whisper('Usage: <code>!rollcapture rule &lt;name&gt;</code>');
            const tag = '[RC] ' + name;
            let handout = findObjs({ type: 'handout', name: tag })[0]
                || findObjs({ type: 'handout', name: '[RollCapture] ' + name })[0];
            let created = false;
            if (!handout) {
                handout = createObj('handout', { name: tag });
                handout.set('notes', `<pre><code># RollCapture Rule: ${name}
# Lines starting with # are comments.
#
# template: which roll template(s) to match (comma-separated)
# name_field: template field containing the roll name (e.g. skill name)
# char_field: template field(s) for character identification
# when: {{flag=value}} — condition block, captures follow
# default: — captures when no "when" matches
# Captures reference template fields: {{r1=$[[N]]}} means r1 = inlinerolls[N]
# Formulas: fieldname, max(a,b), min(a,b), sum(a,b,...), choose(a,b)
# Missing fields are dropped from functions (not set to 0).
# Empty capture (name: ) clears that value.
#
# To react to captures, add abilities to the character sheet:
#   rc_any — runs on every capture
#   rc_&lt;rollname&gt; — runs for that specific roll (e.g. rc_stealth)
#   rc_default — runs when no specific rc_&lt;rollname&gt; exists
# Use \${rollname} and \${capturename} in ability actions.

template: simple
name_field: rname
char_field: charname
default:
    result: r1
</code></pre>`);
                created = true;
            }
            const label = created ? 'Created' : 'Found';
            whisper(`${label}: <a href="http://journal.roll20.net/handout/${handout.get('id')}">${stripTag(handout.get('name'))}</a>`);
            return;
        }

        if (typeof ScriptKit !== 'undefined') ScriptKit.usage(msg);
        else whisper(`**RollCapture v${SCRIPT_VERSION}** — Commands:<br>` +
            `<code>!rollcapture status</code> — Show status<br>` +
            `<code>!rollcapture rules</code> — List loaded rules<br>` +
            `<code>!rollcapture rule &lt;name&gt;</code> — Open or create a rule handout<br>` +
            `<code>!rollcapture dissect</code> — Dissect the next roll (shows all fields)<br>` +
            `<code>!rollcapture reload</code> — Reload rules from handouts`);
    };

    // ─── Utilities ──────────────────────────────────────────────────────────────

    const whisper = (msg) => sendChat('RollCapture', `/w gm ${msg}`);

    const stripTag = (name) => name.replace(/\[RollCapture\]\s*/i, '').replace(/\[RC\]\s*/i, '').trim();

    const generateUUID = () => {
        return 'rc_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    };

    // ─── ScriptKit Registration ────────────────────────────────────────────────

    const registerWithScriptKit = () => {
        if (typeof ScriptKit === 'undefined') return;
        ScriptKit.register(SCRIPT_NAME, {
            version: SCRIPT_VERSION,
            command: CMD,
            tag: 'RC',
            aliases: {},
            newSince: '1.1.0',
            motd: [
                'Create rules in `[RC] name` handouts — use `!rollcapture rule stealth` to generate a template.',
                '`!rollcapture dissect` arms the next roll for field inspection — great for building new rules.',
                'Formulas support `max(a,b)`, `min(a,b)`, `sum(a,b,...)`, and `choose(a,b)` for interactive picks.',
                'Add `rc_stealth` abilities to characters to auto-run macros when that roll is captured.',
                'RollCapture stores values as `gl_*` token GM-notes fields for use by other scripts (e.g. Gaslight scripting).',
            ],
            motdHeader: '🎲 **RollCapture** v' + SCRIPT_VERSION,
            motdStyle: { borderLeft: '3px solid #f6f5f3' },
            help: {
                description: 'Generic roll result extraction and storage. Detects rolls via chat, extracts values per configurable rules in handouts, and emits captured data to registered consumer callbacks.',
                quickStart: [
                    '`!rollcapture rule stealth` — create a rule handout (edit the template to match your sheet).',
                    'Make a roll using your character sheet. RollCapture auto-captures matching fields.',
                    '`!rollcapture status` — verify rules are loaded and captures are firing.',
                    'Add `rc_stealth` ability to a character to react to captures automatically.',
                ],
                changelog: [
                    { version: '1.1.0', date: '2026-08-16', changes: [
                        'ScriptKit integration: help, man, whatsnew, motd, gen-help, gen-dev-docs',
                    ]},
                    { version: '1.0.0', date: '2026-07-12', changes: [
                        'Initial release',
                        'Rule-based roll template matching',
                        'Handout-stored rules ([RC] or [RollCapture] prefix)',
                        'Capture formulas: field references, max, min, sum, choose',
                        'Consumer callback API (RollCapture.onCapture)',
                        'Character ability triggers (rc_any, rc_<rollname>, rc_default)',
                        'Dissect mode for debugging roll templates',
                    ]},
                ],
                commands: [
                    { syntax: 'status', description: 'Show loaded rules, callbacks, pending choices', version: '1.0.0' },
                    { syntax: 'rules', description: 'List all loaded rule handouts', version: '1.0.0' },
                    { syntax: 'rule <name>', description: 'Open or create a rule handout', version: '1.0.0' },
                    { syntax: 'dissect', description: 'Arm next roll for field inspection (shows all template fields)', version: '1.0.0' },
                    { syntax: 'reload', description: 'Reload rules from handouts', version: '1.0.0' },
                ],
                topics: {
                    ruleFormat: {
                        title: 'Rule Format',
                        description: 'How to write capture rules in handouts',
                        version: '1.0.0',
                        body: 'Rules are stored in handouts named `[RC] name` or `[RollCapture] name`. Each rule has:\n\n'
                            + '`template:` — which roll template(s) to match (comma-separated)\n'
                            + '`name_field:` — template field containing the roll name (e.g. rname)\n'
                            + '`char_field:` — template field(s) for character identification\n'
                            + '`when: {{flag=value}}` — conditional capture block\n'
                            + '`default:` — captures when no `when` matches\n\n'
                            + 'Capture lines follow a `when` or `default` block:\n'
                            + '`result: r1` — capture the value of field r1\n'
                            + '`total: sum(r1, r2)` — use formulas\n'
                            + '`best: max(r1, r2)` — pick highest\n\n'
                            + 'Use `!rollcapture dissect` then make a roll to see all available template fields.',
                    },
                    formulas: {
                        title: 'Capture Formulas',
                        description: 'Functions available in capture expressions',
                        version: '1.0.0',
                        items: [
                            { name: 'fieldname', description: 'Direct field reference (resolves inline roll value)', version: '1.0.0' },
                            { name: 'max(a, b)', description: 'Highest of two values', version: '1.0.0' },
                            { name: 'min(a, b)', description: 'Lowest of two values', version: '1.0.0' },
                            { name: 'sum(a, b, ...)', description: 'Sum of all values', version: '1.0.0' },
                            { name: 'choose(a, b)', description: 'Interactive — presents buttons to pick one', version: '1.0.0' },
                        ],
                    },
                    triggers: {
                        title: 'Character Triggers',
                        description: 'Auto-run abilities on capture',
                        version: '1.0.0',
                        body: 'Add abilities to a character sheet to react to captures:\n\n'
                            + '`rc_any` — runs on every capture for that character\n'
                            + '`rc_<rollname>` — runs for a specific roll (e.g. `rc_stealth`)\n'
                            + '`rc_default` — runs when no specific `rc_<rollname>` exists\n\n'
                            + 'Use `${rollname}` and `${capturename}` in ability actions to reference captured values.',
                    },
                    api: {
                        title: 'Consumer API',
                        description: 'Registering callbacks from other scripts',
                        version: '1.0.0',
                        handouts: 'dev',
                        body: '`RollCapture.onCapture(scriptName, callback)` — Register a consumer.\n\n'
                            + 'The callback receives: `{ charName, charId, rollName, captures, playerId, msg }`\n\n'
                            + '`captures` is an object of `{ name: value }` pairs extracted by the matching rule.\n\n'
                            + 'Wait for `!rollcapture-ready` in chat before calling, or check `typeof RollCapture !== \'undefined\'`.',
                    },
                },
            },
        });
    };

    // ─── Public API ─────────────────────────────────────────────────────────────

    const registerEventHandlers = () => {
        on('chat:message', (msg) => {
            if (msg.type === 'api' && msg.content.split(' ')[0] === CMD) {
                if (typeof ScriptKit !== 'undefined' && ScriptKit.handleInput(msg)) return;
                handleCommand(msg);
            } else if (msg.rolltemplate) {
                processMessage(msg);
            }
        });
        // ScriptKit ready signal listener
        on('chat:message', (msg) => {
            if (msg.type === 'api' && msg.content === '!scriptkit-ready') registerWithScriptKit();
        });
        registerWithScriptKit();
    };

    const checkInstall = () => {
        loadRulesFromHandouts();
    };

    return {
        checkInstall,
        registerEventHandlers,
        onCapture,
        getCapturedValue: () => null,
        getLastCapture: () => null,
        registerRule: (ruleObj) => rules.push(ruleObj),
    };
})();

on('ready', () => {
    'use strict';
    RollCapture.checkInstall();
    RollCapture.registerEventHandlers();
});
