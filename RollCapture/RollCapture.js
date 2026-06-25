// RollCapture v0.1.0 — Generic roll result extraction/storage for Roll20
// Detects rolls via chat:message, extracts values per configurable rules,
// and emits captured data to registered consumer callbacks.

const RollCapture = (() => { // eslint-disable-line no-unused-vars
    'use strict';

    const SCRIPT_NAME = 'RollCapture';
    const SCRIPT_VERSION = '0.1.0';
    const KEYWORDS = ['template:', 'name_field:', 'char_field:', 'when:', 'default:'];
    const CMD = '!rollcapture';

    let rules = [];
    let callbacks = new Map();
    let pendingChoices = {}; // id → { captures, resolve info }

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
                    const context = { rule, rollName: cleanName(rollName), charName, playerId: msg.playerid, results, msg };
                    promptChoose(context, captureName, value.options);
                } else {
                    results[captureName] = value; // undefined = clear
                }
            }

            if (!hasChoose) {
                emitCapture(charName, cleanName(rollName), results, msg.playerid, msg);
            }
        }
    };

    // ─── Callback Registry ──────────────────────────────────────────────────────

    const emitCapture = (charName, rollName, captures, playerId, msg) => {
        const event = { charName, rollName, captures, playerId, msg };
        for (const fn of callbacks.values()) {
            fn(event);
        }
        fireAbility(charName, rollName, captures, playerId);
    };

    // ─── Ability Firing ─────────────────────────────────────────────────────────

    const fireAbility = (charName, rollName, captures, playerId) => {
        const chars = findObjs({ type: 'character', name: charName });
        if (chars.length === 0) return;
        const charId = chars[0].get('id');

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
            emitCapture(ctx.charName, ctx.rollName, ctx.results, ctx.playerId, ctx.msg);
            whisper(`Captured ${captureName} = ${value}`);
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

        whisper(`**RollCapture v${SCRIPT_VERSION}** — Commands:<br>` +
            `<code>!rollcapture status</code> — Show status<br>` +
            `<code>!rollcapture rules</code> — List loaded rules<br>` +
            `<code>!rollcapture reload</code> — Reload rules from handouts`);
    };

    // ─── Utilities ──────────────────────────────────────────────────────────────

    const whisper = (msg) => sendChat('RollCapture', `/w gm ${msg}`);

    const stripTag = (name) => name.replace(/\[RollCapture\]\s*/i, '').replace(/\[RC\]\s*/i, '').trim();

    const generateUUID = () => {
        return 'rc_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    };

    // ─── Public API ─────────────────────────────────────────────────────────────

    const registerEventHandlers = () => {
        on('chat:message', (msg) => {
            if (msg.type === 'api' && msg.content.split(' ')[0] === CMD) {
                handleCommand(msg);
            } else if (msg.rolltemplate) {
                processMessage(msg);
            }
        });
    };

    on('ready', () => {
        loadRulesFromHandouts();
        registerEventHandlers();
        log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} Initialized <=-`);
        sendChat('', `!${SCRIPT_NAME.toLowerCase()}-ready`, null, { noarchive: true });
    });

    return {
        onCapture,
        getCapturedValue: () => null, // placeholder — consumers store their own way
        getLastCapture: () => null,    // placeholder
        registerRule: (ruleObj) => rules.push(ruleObj),
    };
})();
