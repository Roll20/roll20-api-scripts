// =============================================================================
// FaceOnMOve v1.0.0
// Last Updated: 2026-09-06
// Author: Kenan Millet
//
// Description:
//   Automatically rotates and/or flips tokens to face their direction of
//   movement. Supports per-token and per-character overrides layered over
//   global defaults, rollable-token side swapping (e.g. dedicated left/right
//   or up/down art), horizontal-flip facing for single-image tokens, waypoint
//   grouping, snap-to-horizontal, steep up/down handling, in-place facing
//   gestures, and an optional idle reset. Includes a rich per-token/character
//   config menu (!fomo with tokens selected).
//
// Dependencies: ScriptKit
//
// Commands:
//   !fomo                         Open the config menu (GM; uses selection/global)
//   !fomo menu                    Open the config menu (explicit alias for bare !fomo)
//   !fomo help                    Show command reference
//   !fomo enable/disable          Enable/disable facing for selected tokens
//   !fomo on/off/toggle           Global master switch (GM)
//   !fomo face [<id>|default] <left|right|inherit>   Set default facing (GM)
//   !fomo set <key> <value>       Set a global default (GM)
//   !fomo set-token [<id>] <key> <value>   Per-token override (GM)
//   !fomo set-char  [<id>] <key> <value>   Per-character override (GM)
//   !fomo reset-token [<id>]      Clear token overrides
//   !fomo reset-char  [<id>]      Clear character overrides (GM)
//   !fomo reset-all   [--force]   Reset ALL tokens (GM)
//   !fomo reset-global [--force]  Restore global defaults to factory (GM)
// =============================================================================

/* global state, on, sendChat, getObj, log, playerIsGM, setTimeout, clearTimeout, ScriptKit */

var FaceOnMOve = FaceOnMOve || (() => {
    'use strict';

    const SCRIPT_NAME    = 'FaceOnMOve';
    const SCRIPT_VERSION = '1.0.0';
    const CMD_TOKEN      = '!fomo';

    // =========================================================================
    // Helpers
    // =========================================================================

    const getPlayerName = (playerid) => {
        if (!playerid || playerid === 'API') return 'gm';
        const player = getObj('player', playerid);
        return player ? player.get('_displayname') : 'gm';
    };

    const reply = (msg, tag, text) => {
        const body      = text !== undefined ? text : tag;
        const prefix    = text !== undefined ? ` [${tag}]` : '';
        const recipient = getPlayerName(msg.playerid);
        sendChat(`${SCRIPT_NAME}${prefix}`, `/w "${recipient}" ${body}`, null, { noarchive: true });
    };

    // =========================================================================
    // Functionality
    // =========================================================================

    const getConfig = (token) => {
        return {
            ...state[SCRIPT_NAME].defaultConfig,
            ...state[SCRIPT_NAME][token.get('represents')],
            ...state[SCRIPT_NAME][token.get('id')]
        };
    };

    const CONFIG_FIELDS = [
        { key: 'enabled', label: 'Enabled', type: 'bool', cat: 'General', desc: 'Whether tokens face their movement direction.' },
        { key: 'layers', label: 'Layers', type: 'layers', cat: 'General', desc: 'Only process tokens on these layers.' },
        { key: 'excludeStatuses', label: 'Exclude Statuses', type: 'statuses', cat: 'General', desc: 'Tokens with these status markers won\'t rotate.' },
        { key: 'maxAngle', label: 'Max Angle', type: 'num', cat: 'Movement', desc: 'Max tilt (degrees from horizontal) when moving diagonally.' },
        { key: 'snapAngle', label: 'Snap Angle', type: 'num', cat: 'Movement', desc: 'If within this many degrees of horizontal, snap to flat (0 = disabled).' },
        { key: 'steepAngle', label: 'Steep Angle', type: 'num', cat: 'Movement', desc: 'Angle threshold for steep vertical movement. Negative = uses maxAngle.' },
        { key: 'minDistance', label: 'Min Distance (px)', type: 'num', cat: 'Movement', desc: 'Minimum pixels moved before rotation triggers.' },
        { key: 'groupWaypoints', label: 'Group Waypoints', type: 'bool', cat: 'Input', desc: 'Use waypoints to find the nearest viable step for direction.' },
        { key: 'inPlaceFacing', label: 'In-Place Facing', type: 'bool', cat: 'Input', desc: 'Gestures: waypoint + drop in place to face without moving.' },
        { key: 'idleResetTime', label: 'Idle Reset (sec)', type: 'num', cat: 'Input', desc: 'Seconds before resetting to horizontal (0 = disabled).' },
        { key: 'horizontalAngle', label: 'Horizontal Angle', type: 'num', cat: 'Visual', desc: 'Base rotation when facing perfectly left/right.' },
        { key: 'rightSide', label: 'Right Side', type: 'num', cat: 'Visual', desc: 'Token side index when facing right (negative = use flip instead).' },
        { key: 'leftSide', label: 'Left Side', type: 'num', cat: 'Visual', desc: 'Token side index when facing left (negative = use flip instead).' },
        { key: 'upSide', label: 'Up Side', type: 'num', cat: 'Visual', desc: 'Token side index for steep upward movement (negative = no change).' },
        { key: 'downSide', label: 'Down Side', type: 'num', cat: 'Visual', desc: 'Token side index for steep downward movement (negative = no change).' },
        { key: 'idleSide', label: 'Idle Side', type: 'num', cat: 'Visual', desc: 'Token side to reset to on idle. Negative = falls back to rightSide then leftSide.' },
    ];
    const CONFIG_CATEGORIES = ['General', 'Movement', 'Input', 'Visual'];

    // Fields that are indices into a token's rollable-token "sides" list. These get
    // a visual side-image picker (instead of a numeric field) when a single token or
    // character is selected and the token actually has sides.
    const SIDE_FIELDS = ['rightSide', 'leftSide', 'upSide', 'downSide', 'idleSide'];

    // Return a token's side images as an ordered array, decoded and normalized to
    // thumbnails. Empty array if the token has no sides (not a rollable token).
    const getTokenSides = (token) => {
        const raw = token && token.get('sides');
        if (!raw) return [];
        return raw.split('|').map(decodeURIComponent).map(getCleanImgsrc);
    };

    const configure = (msg, selected, mode, category) => {
        const btn = (label, cmd) => `<a style="background:#333;color:#fff;padding:1px 6px;border-radius:3px;text-decoration:none;" href="${cmd}">${label}</a>`;
        const activeTab = (label) => `<b style="background:#555;color:#fff;padding:2px 8px;border-radius:3px 3px 0 0;">${label}</b>`;
        const inactiveTab = (label, cmd) => `<a style="background:#222;color:#aaa;padding:2px 8px;border-radius:3px 3px 0 0;text-decoration:none;" href="${cmd}">${label}</a>`;
        const tokenIds = selected.map(t => t.get('id'));
        const menuArg = tokenIds.length > 0 ? tokenIds.join(',') : 'default';
        const hasTokens = selected.length > 0;
        const hasCharacters = hasTokens && selected.some(t => t.get('represents'));
        mode = mode || (hasTokens ? 'token' : 'global');
        category = category || CONFIG_CATEGORIES[0];
        const menuSuffix = ` --menu ${menuArg} --cat ${category} --mode ${mode}`;

        const formatValue = (val, type) => {
            if (type === 'bool') return val ? '✓ On' : '✗ Off';
            if (type === 'layers' || type === 'statuses') return Array.isArray(val) && val.length > 0 ? val.join(', ') : 'none';
            return String(val);
        };

        const makeBtn = (key, val, type, targetId) => {
            const setCmd = targetId ? `${CMD_TOKEN} set-token ${targetId} ${key}` : `${CMD_TOKEN} set ${key}`;
            if (type === 'bool') return btn(formatValue(val, type), `${setCmd} ${val ? 'false' : 'true'}${menuSuffix}`);
            const field = CONFIG_FIELDS.find(f => f.key === key);
            const current = val !== null ? val : '';
            if (type === 'layers') return btn(formatValue(val, type), `${setCmd} ?{Layers (comma-sep)|${(val || []).join(',')}}${menuSuffix}`);
            if (type === 'statuses') return btn(formatValue(val, type), `${setCmd} ?{Statuses (comma-sep)|${(val || []).join(',')}}${menuSuffix}`);
            return btn(formatValue(val, type), `${setCmd} ?{${field ? field.label : key}|${current}}${menuSuffix}`);
        };

        const tokenImg = (token, cmd, title) => {
            const img = token.get('imgsrc').replace('/max.', '/thumb.').replace('/med.', '/thumb.');
            const titleAttr = title ? ` title="${title}"` : '';
            return `<a href="${cmd}"${titleAttr} style="display:inline-block;margin:0 1px;background:transparent;border:none;padding:0;"><img src="${img}" width="20" height="20" style="border-radius:3px;vertical-align:middle;"></a>`;
        };

        // Reset-to-inherit button. Clears the override at this level via the set
        // handlers' 'default' keyword, so the value falls back to the parent
        // (character/global). Shared by the side picker and the generic fields so
        // the control looks and behaves identically everywhere.
        const inheritBtn = (setBase, levelLabel) =>
            `<a href="${setBase} default${menuSuffix}" title="Reset to inherited (clear this ${levelLabel} override)" style="display:inline-block;box-sizing:border-box;height:28px;line-height:24px;text-align:center;margin:0 1px 0 6px;padding:0 8px;border:2px solid transparent;border-radius:3px;background:#333;color:#fff;text-decoration:none;">↺ Inherit</a>`;

        let out = '<br>';

        // Global master switch — shown above the tabs. Clicking toggles it and
        // re-renders this menu in place.
        const globalOn = state[SCRIPT_NAME].globalEnabled !== false;
        const switchCmd = `${CMD_TOKEN} toggle${menuSuffix}`;
        const switchColor = globalOn ? '#2e7d32' : '#933';
        const switchLabel = globalOn ? '🟢 FOMO: ON' : '🔴 FOMO: OFF';
        out += `<a style="display:block;text-align:center;background:${switchColor};color:#fff;padding:3px 6px;border-radius:3px;text-decoration:none;margin-bottom:4px;" href="${switchCmd}">${switchLabel}</a>`;

        // Mode tabs
        const modeTabCmd = (m) => {
            const cmd = m === 'global' ? 'config' : m === 'token' ? 'config-token' : 'config-char';
            const idArg = hasTokens ? ` ${tokenIds.join(',')}` : '';
            return `${CMD_TOKEN} ${cmd}${idArg} --cat ${category}`;
        };
        out += (mode === 'global' ? activeTab('🌐 Global') : inactiveTab('🌐 Global', modeTabCmd('global')));
        if (hasTokens) {
            out += ' ' + (mode === 'token' ? activeTab('🎭 Token') : inactiveTab('🎭 Token', modeTabCmd('token')));
            if (hasCharacters) {
                out += ' ' + (mode === 'character' ? activeTab('📋 Character') : inactiveTab('📋 Character', modeTabCmd('character')));
            }
        }
        out += `<hr>`;

        // Title
        if (mode === 'global') {
            out += `<b>${SCRIPT_NAME} — Global Defaults</b><br>`;
        } else if (mode === 'token') {
            out += `<b>${SCRIPT_NAME} — Token Config</b> (${selected.length} token${selected.length > 1 ? 's' : ''})<br>`;
        } else {
            const charCount = new Set(selected.map(t => t.get('represents')).filter(Boolean)).size;
            out += `<b>${SCRIPT_NAME} — Character Config</b> (${charCount} character${charCount !== 1 ? 's' : ''})<br>`;
        }

        // Category tabs
        const catCmd = mode === 'global' ? 'config' : mode === 'token' ? 'config-token' : 'config-char';
        const catIdArg = hasTokens ? ` ${tokenIds.join(',')}` : '';
        out += CONFIG_CATEGORIES.map(cat =>
            cat === category
                ? `<b style="background:#555;color:#fff;padding:2px 6px;border-radius:3px;">${cat}</b>`
                : btn(cat, `${CMD_TOKEN} ${catCmd}${catIdArg} --cat ${cat}`)
        ).join(' ') + `<br><br>`;

        // --- Facing / sides unification (Visual tab, token/character modes) ---
        // Split the selected tokens into two populations:
        //   sided   → have rollable sides (use the side-index fields / picker)
        //   noSides → single-image tokens (use the synthetic "Facing" field)
        // A field/section only renders if its population is non-empty, so the same
        // logic covers single, multi, all-sided, all-no-sides, and mixed selections.
        const facingOf = (leftSide, rightSide) => {
            if (rightSide >= 0 && leftSide < 0) return 'right';
            if (leftSide >= 0 && rightSide < 0) return 'left';
            return 'other'; // both set or both unset — ambiguous
        };
        const FACING_LABELS = { left: 'Left', right: 'Right', other: '—' };

        // De-duplicated token list for the current mode (character mode collapses
        // multiple tokens of the same character to one representative).
        const dedupTokens = () => {
            if (mode !== 'character') return selected.slice();
            const seen = new Set();
            return selected.filter(t => {
                const cid = t.get('represents');
                if (!cid || seen.has(cid)) return false;
                seen.add(cid);
                return true;
            });
        };
        const populationTokens = mode === 'global' ? [] : dedupTokens();
        const sidedTokens = populationTokens.filter(t => getTokenSides(t).length > 0);
        const noSidesTokens = populationTokens.filter(t => getTokenSides(t).length === 0);

        // Effective config + override flag + set-command base for a token at the
        // current level. Single source of truth for token vs. character resolution.
        const levelInfo = (token, key) => {
            const targetId = mode === 'token' ? token.get('id') : token.get('represents');
            const cfg = (targetId && state[SCRIPT_NAME][targetId]) || {};
            const hasOverride = cfg.hasOwnProperty(key);
            const parentVal = mode === 'token' ? getConfig(token)[key] : state[SCRIPT_NAME].defaultConfig[key];
            const setBase = `${CMD_TOKEN} ${mode === 'token' ? 'set-token' : 'set-char'} ${targetId} ${key}`;
            return { targetId, hasOverride, effectiveVal: hasOverride ? cfg[key] : parentVal, setBase };
        };
        const levelLabel = mode === 'token' ? 'token' : 'character';

        // Renders the synthetic "Facing" field: no-sides tokens grouped by their
        // current facing (Left / Right / —). Clicking a token opens a roll query
        // (Left / Right / Inherit), consistent with the other grouped fields.
        const renderFacingField = () => {
            out += `<span title="Which way the token's art faces by default (drives horizontal flip on single-image tokens)."><b>Facing:</b></span><br>`;
            // Group no-sides tokens by facing value.
            const groups = { left: [], right: [], other: [] };
            const overridden = new Set();
            noSidesTokens.forEach(token => {
                const l = levelInfo(token, 'leftSide');
                const r = levelInfo(token, 'rightSide');
                const val = facingOf(l.effectiveVal, r.effectiveVal);
                groups[val].push(token);
                if (l.hasOverride || r.hasOverride) overridden.add(token);
            });
            ['left', 'right', 'other'].forEach(val => {
                if (groups[val].length === 0) return;
                out += `&nbsp;&nbsp;${FACING_LABELS[val]} `;
                groups[val].forEach(token => {
                    const targetId = levelInfo(token, 'leftSide').targetId;
                    const cmd = `${CMD_TOKEN} face ${targetId} ?{Facing|Left,left|Right,right|Inherit,inherit}${menuSuffix}`;
                    const plain = `${CMD_TOKEN} face ${targetId} ${val === 'other' ? 'left' : val}`;
                    const imgTag = tokenImg(token, cmd, plain);
                    out += overridden.has(token) ? imgTag : `<span style="opacity:0.5">${imgTag}</span>`;
                });
                out += `<br>`;
            });
            out += `<br>`;
        };

        // Renders one token's side picker row for a given side field: [✕][side0][side1…]
        // (+ Inherit if overridden). Uses that token's own sides, so per-token rows in a
        // multi-select handle differing side art/counts naturally.
        const renderSidePicker = (token, f) => {
            const sides = getTokenSides(token);
            const { hasOverride, effectiveVal, setBase } = levelInfo(token, f.key);
            const opacity = hasOverride ? '1' : '0.5';
            const sideThumb = (idx, imgUrl) => {
                const selectedBox = idx === effectiveVal
                    ? 'border:2px solid #2e7d32;'
                    : 'border:2px solid transparent;';
                const cmd = `${setBase} ${idx}${menuSuffix}`;
                const plainCmd = `${setBase} ${idx}`;
                return `<a href="${cmd}" title="${plainCmd}" style="display:inline-block;margin:0 1px;${selectedBox}border-radius:3px;padding:2px;background:transparent;opacity:${opacity};"><img src="${imgUrl}" width="24" height="24" style="border-radius:2px;vertical-align:middle;"></a>`;
            };
            out += `&nbsp;&nbsp;`;
            // Left: square "✕" = None (-1).
            const noneSelected = effectiveVal < 0;
            const noneBox = noneSelected ? 'border:2px solid #2e7d32;' : 'border:2px solid transparent;';
            const noneCmd = `${setBase} -1${menuSuffix}`;
            out += `<a href="${noneCmd}" title="${setBase} -1" style="display:inline-block;${noneBox}border-radius:5px;padding:2px;margin:0 3px 0 1px;background:transparent;text-decoration:none;opacity:${opacity};"><span style="display:inline-block;width:24px;height:24px;line-height:24px;font-size:12px;text-align:center;border-radius:3px;background:#333;color:#fff;">✕</span></a>`;
            // Middle: this token's side thumbnails.
            sides.forEach((img, idx) => { out += sideThumb(idx, img); });
            // Right: reset-to-inherit when overridden at this level.
            if (hasOverride) out += inheritBtn(setBase, levelLabel);
            out += `<br>`;
        };

        // Fields
        CONFIG_FIELDS.filter(f => f.cat === category).forEach(f => {
            // Global mode: replace the numeric side-index fields with a single
            // standalone "Facing: [Left] [Right]" control (rendered in place of
            // rightSide). Power users can still set raw side indices via `set`.
            if (mode === 'global' && SIDE_FIELDS.indexOf(f.key) !== -1) {
                if (f.key === 'rightSide') {
                    const cfg = state[SCRIPT_NAME].defaultConfig;
                    const cur = facingOf(cfg.leftSide, cfg.rightSide);
                    const faceBtn = (dir, label) => {
                        const active = cur === dir;
                        // Outer <a> carries the selection outline + a transparent gap (padding);
                        // inner span carries the dark fill, so the outline stands off the button.
                        const box = active ? 'border:2px solid #2e7d32;' : 'border:2px solid transparent;';
                        const cmd = `${CMD_TOKEN} face default ${dir}${menuSuffix}`;
                        return `<a href="${cmd}" title="${CMD_TOKEN} face default ${dir}" style="display:inline-block;${box}border-radius:5px;padding:2px;margin:0 3px;background:transparent;text-decoration:none;"><span style="display:inline-block;padding:2px 10px;border-radius:3px;background:#333;color:#fff;">${label}</span></a>`;
                    };
                    out += `<span title="Default facing for single-image tokens (drives horizontal flip)."><b>Facing:</b></span> ${faceBtn('left', 'Left')}${faceBtn('right', 'Right')}<br><br>`;
                }
                return;
            }

            // Non-global: inject the synthetic Facing field once, right after
            // Horizontal Angle (i.e. before the first side field), when there are
            // any no-sides tokens in the selection.
            if (mode !== 'global' && f.key === 'rightSide' && noSidesTokens.length > 0) {
                renderFacingField();
            }
            // Non-global side-index fields only apply to sided tokens; skip the
            // field entirely when no selected token has sides.
            if (mode !== 'global' && SIDE_FIELDS.indexOf(f.key) !== -1 && sidedTokens.length === 0) {
                return;
            }

            if (mode === 'global') {
                const cfg = state[SCRIPT_NAME].defaultConfig;
                out += `<span title="${f.desc}"><b>${f.label}:</b></span> <small><code title="Field name to use when setting this value in a command, e.g. ${CMD_TOKEN} set ${f.key} &lt;value&gt;">${f.key}</code></small> ${makeBtn(f.key, cfg[f.key], f.type, null)}<br><br>`;
                return;
            }

            out += `<span title="${f.desc}"><b>${f.label}:</b></span> <small><code title="Field name to use when setting this value in a command, e.g. ${CMD_TOKEN} set-token &lt;id&gt; ${f.key} &lt;value&gt;">${f.key}</code></small><br>`;

            // Side-image picker: for side-index fields, render one picker row per sided
            // token (each using its own side art). Covers single and multi selection —
            // per-token rows handle tokens with differing side lists.
            if (SIDE_FIELDS.indexOf(f.key) !== -1) {
                sidedTokens.forEach(token => renderSidePicker(token, f));
                out += `<br>`;
                return;
            }

            const groups = {};
            // Non-side fields use the full (deduped) population.
            const tokensToShow = populationTokens;
            tokensToShow.forEach(token => {
                const { hasOverride, effectiveVal } = levelInfo(token, f.key);
                const valStr = Array.isArray(effectiveVal) ? JSON.stringify([...effectiveVal].sort()) : JSON.stringify(effectiveVal);
                if (!groups[valStr]) groups[valStr] = { val: effectiveVal, tokens: [], overridden: [] };
                groups[valStr].tokens.push(token);
                if (hasOverride) groups[valStr].overridden.push(token);
            });
            const sortedGroups = Object.values(groups).sort((a, b) => {
                if (f.type === 'bool') return (b.val === true ? 1 : 0) - (a.val === true ? 1 : 0);
                if (a.val === null && b.val === null) return 0;
                if (a.val === null) return 1;
                if (b.val === null) return -1;
                if (typeof a.val === 'number' && typeof b.val === 'number') return a.val - b.val;
                return String(a.val).localeCompare(String(b.val));
            });
            sortedGroups.forEach(g => {
                out += `&nbsp;&nbsp;${formatValue(g.val, f.type)} `;
                g.tokens.forEach(token => {
                    const isOverride = g.overridden.includes(token);
                    const { setBase } = levelInfo(token, f.key);
                    let setCmd;
                    if (f.type === 'bool') {
                        setCmd = `${setBase} ?{Value|✓ On,true|✗ Off,false|Reset to Default,default}${menuSuffix}`;
                    } else if (f.type === 'layers' || f.type === 'statuses') {
                        setCmd = `${setBase} ?{${f.label} (comma-sep)|${(g.val || []).join(',')}}${menuSuffix}`;
                    } else {
                        setCmd = `${setBase} ?{${f.label}|${g.val !== null ? g.val : ''}}${menuSuffix}`;
                    }
                    // Concrete command (no roll query) shown as the image tooltip — sets this token to its current value.
                    const plainVal = (f.type === 'layers' || f.type === 'statuses')
                        ? (g.val || []).join(',')
                        : (g.val !== null && g.val !== undefined ? String(g.val) : '');
                    const plainSetCmd = `${setBase} ${plainVal}`.trim();
                    const imgTag = tokenImg(token, setCmd, plainSetCmd);
                    out += isOverride ? imgTag : `<span style="opacity:0.5">${imgTag}</span>`;
                });
                out += `<br>`;
            });

            // Single-selection: offer a reset-to-inherit for this field when the one
            // selected token/character overrides it. (Multi-select keeps the grouped
            // view without a single ambiguous reset.) Uses the deduped population so
            // two tokens of one character still count as a single selection.
            if (populationTokens.length === 1) {
                const { hasOverride, setBase } = levelInfo(populationTokens[0], f.key);
                if (hasOverride) out += `&nbsp;&nbsp;${inheritBtn(setBase, levelLabel)}`;
            }
            out += `<br>`;
        });

        reply(msg, 'Config', out);
    };

    const setState = (msg, selected, enabled) => {
        selected.forEach(token => {
            state[SCRIPT_NAME][token.get('id')] = state[SCRIPT_NAME][token.get('id')] || { enabled: enabled };
            state[SCRIPT_NAME][token.get('id')].enabled = enabled;
        });
        reply(msg, 'Set', 'Face-on-movement has been ' + (enabled ? 'enabled' : 'disabled') + ' for the selected tokens');
    };

    const resetState = (msg, selected) => {
        if (selected === undefined) state[SCRIPT_NAME] = { defaultConfig: state[SCRIPT_NAME].defaultConfig, globalEnabled: state[SCRIPT_NAME].globalEnabled };
        else {
            selected.forEach(token => {
                delete state[SCRIPT_NAME][token.get('id')];
            });
        }
        reply(msg, 'Reset', 'Face-on-movement has been reset ' + (selected === undefined ? 'for all tokens' : 'for the selected tokens'));
    };

    // Normalize a lastmove array (string coords) into an array of rounded integer
    // coordinates, folding consecutive duplicate (x,y) pairs into one. Snap-to-grid
    // with oversized tokens can emit near-identical waypoints with sub-pixel jitter
    // (e.g. 688.4 then 688.399...) that should be treated as a single position.
    const normalizeLastmove = (lastmove) => {
        const nums = lastmove.map(s => Math.round(parseFloat(s)));
        const folded = [];
        for (let i = 0; i + 1 < nums.length; i += 2) {
            const x = nums[i];
            const y = nums[i + 1];
            const len = folded.length;
            // Skip if identical to the previous pair (left-fold)
            if (len >= 2 && folded[len - 2] === x && folded[len - 1] === y) continue;
            folded.push(x, y);
        }
        return folded;
    };

    const getLastViableStep = (end, lastmove, groupWaypoints, minDistance) => {
        const steps = lastmove.map(s => parseInt(s, 10));
        if (!groupWaypoints || steps.length < 4) {
            const dx = end[0] - steps[0];
            const dy = end[1] - steps[1];
            return Math.sqrt(dx * dx + dy * dy) >= minDistance ? [dx, dy] : null;
        }
        for (let i = steps.length - 1; i > 0; i -= 2) {
            const dx = end[0] - steps[i - 1];
            const dy = end[1] - steps[i];
            if (Math.sqrt(dx * dx + dy * dy) >= minDistance) {
                return [dx, dy];
            }
        }
        return null;
    };

    // Idle reset timers per token
    const idleTimers = {};

    const getCleanImgsrc = (imgsrc) => {
        const parts = (imgsrc || '').match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if (parts) {
            const leader = parts[1].replace(/^https:\/\/s3.amazonaws.com\/files.d20.io\//, 'https://files.d20.io/');
            return `${leader}thumb${parts[3]}${parts[4] ? parts[4] : ''}`;
        }
        return imgsrc;
    };

    const switchSide = (obj, sideIndex, updates) => {
        const sidesRaw = obj.get('sides');
        if (!sidesRaw) return;
        const sides = sidesRaw.split('|').map(decodeURIComponent).map(getCleanImgsrc);
        if (sideIndex < 0 || sideIndex >= sides.length || !sides[sideIndex]) {
            return;
        }
        // If the token is already on the requested side, don't touch imgsrc/currentSide.
        // This avoids clobbering a token whose displayed image differs from sides[currentSide]
        // (e.g. a rollable token whose default image was reassigned) when no actual side
        // swap is needed.
        if (Number(obj.get('currentSide')) === sideIndex) {
            return;
        }
        updates.currentSide = sideIndex;
        updates.imgsrc = sides[sideIndex];
    };

    const faceOnMove = (obj, prev) => {
        const config = getConfig(obj);
        const { enabled, horizontalAngle, maxAngle, snapAngle, steepAngle, leftSide, rightSide, upSide, downSide, minDistance, groupWaypoints, inPlaceFacing, layers, idleResetTime, idleSide, excludeStatuses } = config;
        if (!state[SCRIPT_NAME].globalEnabled || !enabled || !prev) { return; }

        // Skip manual rotate/resize. A genuine drag only changes position/lastmove;
        // rotation and size stay constant. If rotation, width, or height changed in
        // the same event that fired change:lastmove, the "move" was caused by the
        // user rotating or resizing the token — don't reface it.
        // (Roll20 change events don't fire from API .set() calls, so this only
        // catches manual UI edits, never this script's own updates.)
        const changed = (key) => prev[key] !== undefined && Number(prev[key]) !== Number(obj.get(key));
        if (changed('rotation') || changed('width') || changed('height')) {
            return;
        }

        // Layer check
        if (layers && layers.length > 0 && layers.indexOf(obj.get('layer')) === -1) {
            return;
        }

        // Exclude statuses check
        if (excludeStatuses && excludeStatuses.length > 0) {
            const markers = (obj.get('statusmarkers') || '').split(',');
            if (excludeStatuses.some(s => markers.indexOf(s) !== -1)) {
                return;
            }
        }

        const end = [obj.get('left'), obj.get('top')];
        const lastmove = obj.get('lastmove').split(',');
        if (lastmove.length < 2) { return; }

        let step;
        let flipOnly = false;
        let invertFlip = false;
        // Round sub-pixel coords and fold consecutive duplicate waypoints (snap-to-grid
        // jitter can emit near-identical points). Use the folded coords everywhere.
        const steps = normalizeLastmove(lastmove);
        if (steps.length < 2) { return; }
        const foldedLastmove = steps.map(String);
        const lastWpX = steps[steps.length - 2];
        const lastWpY = steps[steps.length - 1];
        const distFromStart = Math.sqrt(Math.pow(end[0] - steps[0], 2) + Math.pow(end[1] - steps[1], 2));

        // In-place gesture: token dropped back near start
        if (inPlaceFacing && distFromStart < minDistance) {
            if (steps.length === 2) {
                // No waypoints — only treat as a "flip" gesture if the token was
                // dropped on the EXACT same position it started at. This prevents a
                // small micro-adjustment from flipping the token around.
                const samePosition = Math.round(end[0]) === steps[0] && Math.round(end[1]) === steps[1];
                if (samePosition) {
                    flipOnly = true;
                    step = [1, 0]; // dummy step, won't be used for rotation
                }
            } else {
                // Has waypoints — face based on direction from end to last waypoint (inverted)
                const dx = end[0] - lastWpX;
                const dy = end[1] - lastWpY;
                if (dx !== 0 || dy !== 0) {
                    step = [dx, dy];
                }
            }
        }

        if (!step) {
            step = getLastViableStep(end, foldedLastmove, groupWaypoints, minDistance);

            // Turn-around detection: if last waypoint is very close to end position, invert flip
            if (step) {
                const distLastWpToEnd = Math.sqrt(Math.pow(end[0] - lastWpX, 2) + Math.pow(end[1] - lastWpY, 2));
                if (distLastWpToEnd < minDistance * 0.5) {
                    invertFlip = true;
                }
            }
        }
        if (!step) { return; }

        // Compute angle
        const rawAngle = Math.atan2(step[1], step[0]) * (180 / Math.PI);
        const facingRight = step[0] >= 0;
        const deflection = Math.atan2(step[1], Math.abs(step[0])) * (180 / Math.PI);
        const absDeflection = Math.abs(deflection);

        // Steep movement check
        const effectiveSteepAngle = steepAngle >= 0 ? steepAngle : maxAngle;
        const isSteep = absDeflection > effectiveSteepAngle;
        const updates = {};

        // Determine how to express left/right facing
        const useSideSwap = leftSide >= 0 && rightSide >= 0;

        const applyFacing = (obj, facingRight, updates) => {
            if (useSideSwap) {
                // Both sides defined: swap side image instead of flipping
                switchSide(obj, facingRight ? rightSide : leftSide, updates);
            } else if (leftSide >= 0) {
                // Only leftSide set: equivalent to shallowSide=leftSide, rightFlip=true
                switchSide(obj, leftSide, updates);
                updates.fliph = facingRight;
            } else {
                // Only rightSide set: equivalent to shallowSide=rightSide, rightFlip=false
                switchSide(obj, rightSide, updates);
                updates.fliph = !facingRight;
            }
        };

        // Normal facing: rotate toward the movement, clamped to maxAngle
        // (with optional snap-to-horizontal), and set left/right facing.
        const applyNormalRotation = () => {
            let clampedDeflection;
            if (snapAngle > 0 && absDeflection <= snapAngle) {
                clampedDeflection = 0;
            } else {
                clampedDeflection = Math.max(-maxAngle, Math.min(maxAngle, deflection));
            }
            if (facingRight) {
                updates.rotation = horizontalAngle + clampedDeflection;
            } else {
                updates.rotation = horizontalAngle - clampedDeflection;
            }
            applyFacing(obj, facingRight, updates);
        };

        if (isSteep) {
            const side = deflection > 0 ? downSide : upSide;
            const steepSideApplied = side >= 0;
            if (steepSideApplied) {
                switchSide(obj, side, updates);
                // A dedicated up/down sprite is shown, so keep the token roughly
                // horizontal and just invert the residual tilt (if not perfectly
                // vertical) rather than rotating to the steep angle.
                if (step[0] !== 0) {
                    applyFacing(obj, facingRight, updates);
                    const currentOffset = obj.get('rotation') - horizontalAngle;
                    updates.rotation = horizontalAngle - currentOffset;
                }
            } else {
                // No up/down sprite configured — treat like normal movement and
                // rotate toward the (steep) direction, clamped to maxAngle.
                applyNormalRotation();
            }
        } else {
            applyNormalRotation();
        }

        // Apply flipOnly (just toggle flip, no rotation change) or invertFlip (reverse the computed flip)
        if (flipOnly) {
            if (leftSide >= 0 && rightSide >= 0) {
                // useSideSwap mode: swap between leftSide and rightSide
                delete updates.fliph;
                delete updates.rotation;
                const currentSide = obj.get('currentSide');
                switchSide(obj, currentSide === rightSide ? leftSide : rightSide, updates);
            } else {
                // flip mode: toggle fliph, don't change rotation or side
                updates.fliph = !obj.get('fliph');
                delete updates.rotation;
                delete updates.currentSide;
                delete updates.imgsrc;
            }
        }
        if (invertFlip && updates.fliph !== undefined) {
            updates.fliph = !updates.fliph;
        }

        if (Object.keys(updates).length > 0) obj.set(updates);

        // Idle reset timer (not triggered by in-place gestures)
        if (idleResetTime > 0 && !flipOnly && distFromStart >= minDistance) {
            const tokenId = obj.get('id');
            if (idleTimers[tokenId]) clearTimeout(idleTimers[tokenId]);
            idleTimers[tokenId] = setTimeout(() => {
                delete idleTimers[tokenId];
                const token = getObj('graphic', tokenId);
                if (!token) return;
                const resetUpdates = { rotation: horizontalAngle };
                const resetSide = idleSide >= 0 ? idleSide : (rightSide >= 0 ? rightSide : leftSide);
                if (resetSide >= 0) switchSide(token, resetSide, resetUpdates);
                token.set(resetUpdates);
            }, idleResetTime * 1000);
        }
    };

    // =========================================================================
    // Command handler
    // =========================================================================

    const getHelpText = (isGM) => {
        let out = `<b>${SCRIPT_NAME} v${SCRIPT_VERSION}</b><br><br>`;
        out += `<code>${CMD_TOKEN} help</code> — Show this help<br>`;
        if (isGM) {
            out += `<code>${CMD_TOKEN}</code> — Open the config menu (uses selected tokens/characters, or global if none)<br>`;
            out += `<code>${CMD_TOKEN} menu</code> — Open the config menu (explicit alias for bare ${CMD_TOKEN})<br>`;
            out += `<code>${CMD_TOKEN} &lt;on|off&gt;</code> — Global master switch (must be ON for facing to apply at all)<br>`;
            out += `<code>${CMD_TOKEN} toggle</code> — Flip the global master switch<br>`;
            out += `<code>${CMD_TOKEN} &lt;enable|disable&gt;</code> — Enable/disable for selected tokens<br>`;
            out += `<code>${CMD_TOKEN} reset-all [--force]</code> — Reset ALL tokens (confirm by typing RESET ALL TOKENS, or use --force)<br>`;
            out += `<code>${CMD_TOKEN} reset-global [--force]</code> — Restore global defaults to factory values, keeps per-token/char overrides (confirm by typing RESET GLOBAL VALUES, or use --force)<br>`;
            out += `<code>${CMD_TOKEN} reset-token [&lt;id&gt;]</code> — Clear all token-level overrides (id form is GM-only; uses selected tokens if no id given)<br>`;
            out += `<code>${CMD_TOKEN} reset-char [&lt;id&gt;]</code> — Clear all character-level overrides (accepts token or character id; uses selected tokens if none given)<br>`;
            out += `<code>${CMD_TOKEN} set &lt;key&gt; &lt;value&gt;</code> — Set a global default<br>`;
            out += `<code>${CMD_TOKEN} set-token [&lt;id&gt;] &lt;key&gt; &lt;value&gt;</code> — Set a token-level override (uses selected tokens if no id given)<br>`;
            out += `<code>${CMD_TOKEN} set-char [&lt;id&gt;] &lt;key&gt; &lt;value&gt;</code> — Set a character-level override (accepts token or character id; uses selected tokens if no id given)<br>`;
            out += `<code>${CMD_TOKEN} face [&lt;id&gt;|default] &lt;left|right|inherit&gt;</code> — Set default facing (left/right), or 'inherit' to clear a token/character override; default = global<br>`;
            out += `<br><b>With tokens selected:</b> shows per-token/character config menu`;
        } else {
            out += `<code>${CMD_TOKEN} &lt;enable|disable&gt;</code> — Enable/disable for selected tokens<br>`;
            out += `<code>${CMD_TOKEN} reset-token</code> — Clear all overrides for selected tokens<br>`;
        }
        return out;
    };

    const handleInput = (msg) => {
        if (msg.type !== 'api') return;
        if (msg.content.split(' ')[0] !== CMD_TOKEN) return;

        // ScriptKit handles help, man, whatsnew, gen-help (and gen-dev-docs) when present.
        if (typeof ScriptKit !== 'undefined' && ScriptKit.handleInput(msg)) return;

        const args = msg.content.slice(CMD_TOKEN.length).trim().split(/\s+/).filter(Boolean);

        const selected = (msg.selected || []).map(s => getObj(s._type, s._id)).filter(Boolean);

        const playerCommands = ['enable', 'disable', 'reset-token', 'help', '--help'];
        const cmd = args[0] || '';
        if (cmd && playerCommands.indexOf(cmd) === -1) {
            if (!playerIsGM(msg.playerid)) {
                reply(msg, 'Error', 'Only the GM can change configuration.');
                return;
            }
        }

        // Show help/usage: ScriptKit when present, otherwise the built-in fallback.
        const showUsage = () => {
            if (typeof ScriptKit !== 'undefined') ScriptKit.usage(msg);
            else reply(msg, 'Help', getHelpText(playerIsGM(msg.playerid)));
        };

        if (args.length === 0) {
            if (!playerIsGM(msg.playerid)) {
                showUsage();
                return;
            }
            configure(msg, selected);
            return;
        }

        switch (args[0]) {
            default:
                showUsage();
                break;
            case 'menu':
                // Explicit, discoverable alias for bare `!fomo` — open the config menu.
                configure(msg, selected);
                break;
            case 'config': {
                const catFlag = args.indexOf('--cat');
                const cat = catFlag !== -1 ? args[catFlag + 1] : null;
                // If token IDs are provided (from tabbed view), show with tabs
                const idsArg = args[1] && !args[1].startsWith('--') ? args[1] : null;
                if (idsArg) {
                    const tokens = idsArg.split(',').map(id => getObj('graphic', id)).filter(Boolean);
                    configure(msg, tokens, 'global', cat);
                } else {
                    configure(msg, selected, selected.length > 0 ? 'global' : null, cat);
                }
                break;
            }
            case 'config-token': {
                const ids = (args[1] || '').split(',').filter(Boolean);
                const tokens = ids.map(id => getObj('graphic', id)).filter(Boolean);
                const catFlag = args.indexOf('--cat');
                const cat = catFlag !== -1 ? args[catFlag + 1] : null;
                configure(msg, tokens, 'token', cat);
                break;
            }
            case 'config-char': {
                const ids = (args[1] || '').split(',').filter(Boolean);
                const tokens = ids.map(id => getObj('graphic', id)).filter(Boolean);
                const catFlag = args.indexOf('--cat');
                const cat = catFlag !== -1 ? args[catFlag + 1] : null;
                configure(msg, tokens, 'character', cat);
                break;
            }
            case 'set-char': {
                const cfg = state[SCRIPT_NAME].defaultConfig;
                // Disambiguate: `set-char <key> <value>` (uses selected tokens) vs
                // `set-char <id[,id...]> <key> <value>` (explicit ids, e.g. from the menu).
                const usesSelected = args[1] !== undefined && cfg.hasOwnProperty(args[1]);
                const keyIndex = usesSelected ? 1 : 2;
                const key = args[keyIndex];
                const menuFlag = args.indexOf('--menu');
                const menuTarget = menuFlag !== -1 ? args[menuFlag + 1] : null;
                const catFlag = args.indexOf('--cat');
                const catTarget = catFlag !== -1 ? args[catFlag + 1] : null;
                const modeFlag = args.indexOf('--mode');
                const modeTarget = modeFlag !== -1 ? args[modeFlag + 1] : 'character';
                const valStart = keyIndex + 1;
                const flagIndices = new Set([menuFlag, menuFlag + 1, catFlag, catFlag + 1, modeFlag, modeFlag + 1].filter(i => i >= valStart));
                const valArgs = args.slice(valStart).filter((_, i) => !flagIndices.has(i + valStart));
                const rawVal = valArgs.join(' ');
                if (!cfg.hasOwnProperty(key)) {
                    reply(msg, 'Error', `Unknown config key: <code>${key}</code>`);
                    return;
                }

                // Resolve each provided id (token or character) to a character id.
                // - token id → its represents (error if it doesn't represent a character)
                // - character id → itself
                // - anything else → error
                const resolveCharId = (id) => {
                    const tok = getObj('graphic', id);
                    if (tok) {
                        const rep = tok.get('represents');
                        if (!rep) return { error: `Token <code>${id}</code> does not represent a character sheet.` };
                        return { charId: rep };
                    }
                    if (getObj('character', id)) return { charId: id };
                    return { error: `<code>${id}</code> is not a valid token or character ID.` };
                };

                const charIds = [];
                if (usesSelected) {
                    if (selected.length === 0) {
                        reply(msg, 'Error', 'No tokens specified. Select tokens or provide token/character IDs.');
                        return;
                    }
                    for (const tok of selected) {
                        const res = resolveCharId(tok.get('id'));
                        if (res.error) { reply(msg, 'Error', res.error); return; }
                        if (charIds.indexOf(res.charId) === -1) charIds.push(res.charId);
                    }
                } else {
                    const ids = (args[1] || '').split(',').filter(Boolean);
                    if (ids.length === 0) {
                        reply(msg, 'Error', 'No IDs specified. Select tokens or provide token/character IDs.');
                        return;
                    }
                    for (const id of ids) {
                        const res = resolveCharId(id);
                        if (res.error) { reply(msg, 'Error', res.error); return; }
                        if (charIds.indexOf(res.charId) === -1) charIds.push(res.charId);
                    }
                }

                charIds.forEach(charId => {
                    if (rawVal === '' || rawVal === 'default' || rawVal === 'null') {
                        if (state[SCRIPT_NAME][charId]) {
                            delete state[SCRIPT_NAME][charId][key];
                            if (Object.keys(state[SCRIPT_NAME][charId]).length === 0) delete state[SCRIPT_NAME][charId];
                        }
                    } else {
                        let val;
                        if (rawVal === 'true') val = true;
                        else if (rawVal === 'false') val = false;
                        else if (Array.isArray(cfg[key])) val = rawVal.split(',').map(s => s.trim()).filter(Boolean);
                        else if (typeof cfg[key] === 'number' && !isNaN(Number(rawVal))) val = Number(rawVal);
                        else val = rawVal;
                        if (!state[SCRIPT_NAME][charId]) state[SCRIPT_NAME][charId] = {};
                        state[SCRIPT_NAME][charId][key] = val;
                    }
                });
                if (menuTarget) {
                    const menuTokens = menuTarget === 'default' ? [] : menuTarget.split(',').map(id => getObj('graphic', id)).filter(Boolean);
                    configure(msg, menuTokens, modeTarget, catTarget);
                } else {
                    const label = charIds.length === 1 ? `character ${charIds[0]}` : `${charIds.length} characters`;
                    reply(msg, 'Config', `Set <b>${key}</b> for ${label}`);
                }
                break;
            }
            case 'set': {
                const key = args[1];
                const menuFlag = args.indexOf('--menu');
                const menuTarget = menuFlag !== -1 ? args[menuFlag + 1] : null;
                const catFlag = args.indexOf('--cat');
                const catTarget = catFlag !== -1 ? args[catFlag + 1] : null;
                const modeFlag = args.indexOf('--mode');
                const modeTarget = modeFlag !== -1 ? args[modeFlag + 1] : null;
                const flagIndices = new Set([menuFlag, menuFlag + 1, catFlag, catFlag + 1, modeFlag, modeFlag + 1].filter(i => i >= 2));
                const valArgs = args.slice(2).filter((_, i) => !flagIndices.has(i + 2));
                const rawVal = valArgs.join(' ');
                const cfg = state[SCRIPT_NAME].defaultConfig;
                if (!cfg.hasOwnProperty(key)) {
                    reply(msg, 'Error', `Unknown config key: <code>${key}</code>`);
                    return;
                }
                // Parse value based on current type. Empty/null clears to a
                // type-appropriate zero value: [] for arrays, false for bools,
                // 0 for numbers (globals have no override to revert to).
                let val;
                if (rawVal === '' || rawVal === 'null') {
                    if (Array.isArray(cfg[key])) val = [];
                    else if (typeof cfg[key] === 'boolean') val = false;
                    else val = 0;
                }
                else if (rawVal === 'true') val = true;
                else if (rawVal === 'false') val = false;
                else if (Array.isArray(cfg[key])) val = rawVal.split(',').map(s => s.trim()).filter(Boolean);
                else if (typeof cfg[key] === 'number' && !isNaN(Number(rawVal))) val = Number(rawVal);
                else val = rawVal;
                cfg[key] = val;
                // Re-render menu if --menu was passed
                if (menuTarget) {
                    const menuTokens = menuTarget === 'default' ? [] : menuTarget.split(',').map(id => getObj('graphic', id)).filter(Boolean);
                    configure(msg, menuTokens, modeTarget, catTarget);
                } else {
                    reply(msg, 'Config', `Set <b>${key}</b> = <code>${JSON.stringify(val)}</code>`);
                }
                break;
            }
            case 'set-token': {
                const cfg = state[SCRIPT_NAME].defaultConfig;
                // Disambiguate: `set-token <key> <value>` (uses selected tokens) vs
                // `set-token <id[,id...]> <key> <value>` (explicit ids, e.g. from the menu).
                // If the first arg is a known config key, treat it as the no-id form.
                const usesSelected = args[1] !== undefined && cfg.hasOwnProperty(args[1]);
                const keyIndex = usesSelected ? 1 : 2;
                const tokenIds = usesSelected
                    ? selected.map(t => t.get('id'))
                    : (args[1] || '').split(',').filter(Boolean);
                const key = args[keyIndex];
                const menuFlag = args.indexOf('--menu');
                const menuTarget = menuFlag !== -1 ? args[menuFlag + 1] : null;
                const catFlag = args.indexOf('--cat');
                const catTarget = catFlag !== -1 ? args[catFlag + 1] : null;
                const modeFlag = args.indexOf('--mode');
                const modeTarget = modeFlag !== -1 ? args[modeFlag + 1] : 'token';
                const valStart = keyIndex + 1;
                const flagIndices = new Set([menuFlag, menuFlag + 1, catFlag, catFlag + 1, modeFlag, modeFlag + 1].filter(i => i >= valStart));
                const valArgs = args.slice(valStart).filter((_, i) => !flagIndices.has(i + valStart));
                const rawVal = valArgs.join(' ');
                if (!cfg.hasOwnProperty(key)) {
                    reply(msg, 'Error', `Unknown config key: <code>${key}</code>`);
                    return;
                }
                if (tokenIds.length === 0) {
                    reply(msg, 'Error', 'No tokens specified. Select tokens or provide token IDs.');
                    return;
                }
                // Validate explicit ids resolve to real graphics (selected path is already real graphics).
                if (!usesSelected) {
                    const badId = tokenIds.find(id => !getObj('graphic', id));
                    if (badId) {
                        reply(msg, 'Error', `<code>${badId}</code> is not a valid token ID.`);
                        return;
                    }
                }
                tokenIds.forEach(tokenId => {
                    // Empty string or 'default' = delete override (revert to default)
                    if (rawVal === '' || rawVal === 'default' || rawVal === 'null') {
                        if (state[SCRIPT_NAME][tokenId]) {
                            delete state[SCRIPT_NAME][tokenId][key];
                            // Clean up empty token configs
                            if (Object.keys(state[SCRIPT_NAME][tokenId]).length === 0) delete state[SCRIPT_NAME][tokenId];
                        }
                    } else {
                        let val;
                        if (rawVal === 'true') val = true;
                        else if (rawVal === 'false') val = false;
                        else if (Array.isArray(cfg[key])) val = rawVal.split(',').map(s => s.trim()).filter(Boolean);
                        else if (typeof cfg[key] === 'number' && !isNaN(Number(rawVal))) val = Number(rawVal);
                        else val = rawVal;
                        if (!state[SCRIPT_NAME][tokenId]) state[SCRIPT_NAME][tokenId] = {};
                        state[SCRIPT_NAME][tokenId][key] = val;
                    }
                });
                // Re-render menu if --menu was passed
                if (menuTarget) {
                    const menuTokens = menuTarget === 'default' ? [] : menuTarget.split(',').map(id => getObj('graphic', id)).filter(Boolean);
                    configure(msg, menuTokens, modeTarget, catTarget);
                } else {
                    const label = tokenIds.length === 1 ? `token ${tokenIds[0]}` : `${tokenIds.length} tokens`;
                    reply(msg, 'Config', `Set <b>${key}</b> for ${label}`);
                }
                break;
            }
            case 'on':
            case 'off':
            case 'toggle': {
                const newVal = args[0] === 'toggle' ? !state[SCRIPT_NAME].globalEnabled : args[0] === 'on';
                state[SCRIPT_NAME].globalEnabled = newVal;
                // If invoked from the config menu, re-render it; otherwise just confirm.
                const menuFlag = args.indexOf('--menu');
                if (menuFlag !== -1) {
                    const catFlag = args.indexOf('--cat');
                    const catTarget = catFlag !== -1 ? args[catFlag + 1] : null;
                    const modeFlag = args.indexOf('--mode');
                    const modeTarget = modeFlag !== -1 ? args[modeFlag + 1] : null;
                    const menuTarget = args[menuFlag + 1];
                    const menuTokens = (!menuTarget || menuTarget === 'default') ? [] : menuTarget.split(',').map(id => getObj('graphic', id)).filter(Boolean);
                    configure(msg, menuTokens, modeTarget, catTarget);
                } else {
                    reply(msg, 'Set', `Face-on-movement is now globally <b>${newVal ? 'ON' : 'OFF'}</b>.`);
                }
                break;
            }
            case 'face': {
                // Set absolute left/right facing (replaces the old swap-lr). Writes the
                // leftSide/rightSide pair for the given direction:
                //   right → rightSide:0, leftSide:-1   (art faces right by default)
                //   left  → leftSide:0,  rightSide:-1  (art faces left by default)
                //   inherit → clears the leftSide/rightSide overrides at this level
                //             (token/character), falling back to the parent. Not valid for global.
                // Target resolution mirrors the old swap-lr, by --mode:
                //   global    → global defaults (IDs ignored; 'default')
                //   token     → each ID must be a token
                //   character → token ID resolves to represents; character ID used directly
                //   (no mode) → auto-detect each ID: token → token config, character → char config
                // Args: face <id|default> <left|right|inherit> [--menu ... --cat ... --mode ...]
                const menuFlag = args.indexOf('--menu');
                const catFlag = args.indexOf('--cat');
                const modeFlag = args.indexOf('--mode');
                const catTarget = catFlag !== -1 ? args[catFlag + 1] : null;
                const modeTarget = modeFlag !== -1 ? args[modeFlag + 1] : null;

                // Direction is the first non-flag arg that is a known direction; the other
                // non-flag arg (if any) is the target id/'default'. Either order is accepted.
                const DIRECTIONS = ['left', 'right', 'inherit'];
                const nonFlags = [];
                for (let i = 1; i < args.length; i++) {
                    if (args[i].startsWith('--')) { i++; continue; }
                    nonFlags.push(args[i]);
                }
                const dir = nonFlags.find(a => DIRECTIONS.indexOf(a) !== -1);
                const target = nonFlags.find(a => DIRECTIONS.indexOf(a) === -1) || 'default';
                if (!dir) {
                    reply(msg, 'Error', `Specify a direction: <code>${CMD_TOKEN} face ${target} left</code> or <code>right</code>.`);
                    return;
                }
                const clearing = dir === 'inherit';
                if (clearing && (modeTarget === 'global' || target === 'default')) {
                    reply(msg, 'Error', 'Global defaults have no parent to inherit from.');
                    return;
                }
                // Absolute pair for the chosen facing (unused when clearing).
                const pair = dir === 'right'
                    ? { rightSide: 0, leftSide: -1 }
                    : { leftSide: 0, rightSide: -1 };

                // Apply to a level's config: either write the pair or clear the pair overrides.
                const applyLevel = (id) => {
                    const cfg = state[SCRIPT_NAME][id];
                    if (clearing) {
                        if (cfg) {
                            delete cfg.leftSide;
                            delete cfg.rightSide;
                            if (Object.keys(cfg).length === 0) delete state[SCRIPT_NAME][id];
                        }
                        return;
                    }
                    if (!state[SCRIPT_NAME][id]) state[SCRIPT_NAME][id] = {};
                    state[SCRIPT_NAME][id].leftSide = pair.leftSide;
                    state[SCRIPT_NAME][id].rightSide = pair.rightSide;
                };
                const faceCharacter = (charId) => applyLevel(charId);
                const faceToken = (token) => applyLevel(token.get('id'));

                if (modeTarget === 'global' || target === 'default') {
                    const cfg = state[SCRIPT_NAME].defaultConfig;
                    cfg.leftSide = pair.leftSide;
                    cfg.rightSide = pair.rightSide;
                } else {
                    const ids = target.split(',').filter(Boolean);
                    if (ids.length === 0) {
                        reply(msg, 'Error', 'No IDs specified. Select tokens or provide token/character IDs.');
                        return;
                    }

                    if (modeTarget === 'token') {
                        const badId = ids.find(id => !getObj('graphic', id));
                        if (badId) { reply(msg, 'Error', `<code>${badId}</code> is not a valid token ID.`); return; }
                        ids.forEach(id => faceToken(getObj('graphic', id)));
                    } else if (modeTarget === 'character') {
                        const charIds = [];
                        for (const id of ids) {
                            const tok = getObj('graphic', id);
                            let charId;
                            if (tok) {
                                charId = tok.get('represents');
                                if (!charId) { reply(msg, 'Error', `Token <code>${id}</code> does not represent a character sheet.`); return; }
                            } else if (getObj('character', id)) {
                                charId = id;
                            } else {
                                reply(msg, 'Error', `<code>${id}</code> is not a valid token or character ID.`);
                                return;
                            }
                            if (charIds.indexOf(charId) === -1) charIds.push(charId);
                        }
                        charIds.forEach(faceCharacter);
                    } else {
                        // No mode: auto-detect each ID.
                        for (const id of ids) {
                            const tok = getObj('graphic', id);
                            if (tok) { faceToken(tok); continue; }
                            if (getObj('character', id)) { faceCharacter(id); continue; }
                            reply(msg, 'Error', `<code>${id}</code> is not a valid token or character ID.`);
                            return;
                        }
                    }
                }

                if (menuFlag !== -1) {
                    const menuTarget = args[menuFlag + 1];
                    const menuTokens = (!menuTarget || menuTarget === 'default') ? [] : menuTarget.split(',').map(id => getObj('graphic', id)).filter(Boolean);
                    configure(msg, menuTokens, modeTarget, catTarget);
                } else {
                    reply(msg, 'Set', clearing ? 'Facing reset to inherited.' : `Facing set to <b>${dir}</b>.`);
                }
                break;
            }
            case 'enable':
            case 'disable':
                if (selected.length === 0) {
                    reply(msg, 'Error', `You must select tokens to ${args[0]} face-on-movement for them.`);
                    return;
                }
                setState(msg, selected, args[0] === 'enable');
                break;
            case 'reset-all': {
                const phrase = 'RESET ALL TOKENS';
                const typed = args.slice(1).filter(a => !a.startsWith('--')).join(' ').trim()
                    .replace(/^(['"])([\s\S]*)\1$/, '$2').trim();
                const confirmed = args.indexOf('--force') !== -1 || typed === phrase;
                if (!confirmed) {
                    const btn = `<a style="background:#933;color:#fff;padding:2px 8px;border-radius:3px;text-decoration:none;" href="${CMD_TOKEN} reset-all ?{Type '${phrase}' (ALL CAPS) to confirm|}">Reset ALL tokens…</a>`;
                    if (typed !== '') {
                        reply(msg, 'Confirm', `That didn't match — confirmation requires exactly <b>${phrase}</b> (ALL CAPS). Nothing was reset. Try again: ${btn}`);
                    } else {
                        reply(msg, 'Confirm', `This resets ALL tokens to defaults. To confirm, click this button and follow the instructions that follow. ${btn}`);
                    }
                    return;
                }
                resetState(msg);
                break;
            }
            case 'reset-global': {
                const phrase = 'RESET GLOBAL VALUES';
                const typed = args.slice(1).filter(a => !a.startsWith('--')).join(' ').trim()
                    .replace(/^(['"])([\s\S]*)\1$/, '$2').trim();
                const confirmed = args.indexOf('--force') !== -1 || typed === phrase;
                if (!confirmed) {
                    const btn = `<a style="background:#933;color:#fff;padding:2px 8px;border-radius:3px;text-decoration:none;" href="${CMD_TOKEN} reset-global ?{Type '${phrase}' (ALL CAPS) to confirm|}">Reset global defaults…</a>`;
                    if (typed !== '') {
                        reply(msg, 'Confirm', `That didn't match — confirmation requires exactly <b>${phrase}</b> (ALL CAPS). Nothing was reset. Try again: ${btn}`);
                    } else {
                        reply(msg, 'Confirm', `This restores the global defaults to factory values (per-token and per-character overrides are kept). To confirm, click this button and follow the instructions that follow. ${btn}`);
                    }
                    return;
                }
                state[SCRIPT_NAME].defaultConfig = freshDefaultConfig();
                reply(msg, 'Reset', 'Global defaults restored to factory values.');
                break;
            }
            case 'reset-token': {
                // Players may only reset their selected tokens; explicit IDs are GM-only.
                const idsProvided = args[1] && !args[1].startsWith('--');
                if (idsProvided && !playerIsGM(msg.playerid)) {
                    reply(msg, 'Error', 'Only the GM can reset tokens by ID. Select tokens instead.');
                    return;
                }
                const ids = idsProvided
                    ? args[1].split(',').filter(Boolean)
                    : selected.map(t => t.get('id'));
                if (ids.length === 0) {
                    reply(msg, 'Error', 'No tokens specified. Select tokens or provide token IDs.');
                    return;
                }
                const badId = ids.find(id => !getObj('graphic', id));
                if (badId) {
                    reply(msg, 'Error', `<code>${badId}</code> is not a valid token ID.`);
                    return;
                }
                ids.forEach(id => { delete state[SCRIPT_NAME][id]; });
                const label = ids.length === 1 ? `token ${ids[0]}` : `${ids.length} tokens`;
                reply(msg, 'Reset', `Cleared all overrides for ${label}.`);
                break;
            }
            case 'reset-char': {
                const rawIds = args[1] && !args[1].startsWith('--')
                    ? args[1].split(',').filter(Boolean)
                    : selected.map(t => t.get('id'));
                if (rawIds.length === 0) {
                    reply(msg, 'Error', 'No tokens specified. Select tokens or provide token/character IDs.');
                    return;
                }
                const charIds = [];
                for (const id of rawIds) {
                    const tok = getObj('graphic', id);
                    let charId;
                    if (tok) {
                        charId = tok.get('represents');
                        if (!charId) { reply(msg, 'Error', `Token <code>${id}</code> does not represent a character sheet.`); return; }
                    } else if (getObj('character', id)) {
                        charId = id;
                    } else {
                        reply(msg, 'Error', `<code>${id}</code> is not a valid token or character ID.`);
                        return;
                    }
                    if (charIds.indexOf(charId) === -1) charIds.push(charId);
                }
                charIds.forEach(charId => { delete state[SCRIPT_NAME][charId]; });
                const label = charIds.length === 1 ? `character ${charIds[0]}` : `${charIds.length} characters`;
                reply(msg, 'Reset', `Cleared all overrides for ${label}.`);
                break;
            }
        }
    };

    // =========================================================================
    // Initialisation
    // =========================================================================

    // Built-in factory defaults for the global config. Used to seed state on
    // install and to restore via `reset-global --force`.
    const DEFAULT_CONFIG = {
        // Whether or not tokens face their movement
        enabled: true,
        // The angle that a token needs to be considered "facing" perfectly left or right
        horizontalAngle: 0,
        // A token will not rotate further than this angle from the horizontalAngle in either direction
        maxAngle: 15,
        // If deflection is within this angle of horizontal, snap to exactly horizontalAngle (0 = disabled)
        snapAngle: 5,
        // Angle threshold for "steep" movement (straight up/down). If negative, uses maxAngle.
        steepAngle: 60,
        // Token side index when facing left (negative = use horizontal flip instead)
        leftSide: -1,
        // Token side index when facing right (negative = use horizontal flip instead). One of leftSide/rightSide must be non-negative.
        rightSide: 0,
        // Token side index for steep upward movement (negative = no side change)
        upSide: -1,
        // Token side index for steep downward movement (negative = no side change)
        downSide: -1,
        // The minimum distance (in pixels) a token must move to trigger rotation
        minDistance: 70,
        // If true, the minimum number of waypoints in a movement will be used to reach minDistance and determine a facing angle.
        // If false, only the start/end of the movement will be considered.
        groupWaypoints: true,
        // If true, dropping a token back near its start after a single waypoint will rotate/flip
        // based on the waypoint direction (gesture to face without moving).
        inPlaceFacing: true,
        // Which layers the script operates on
        layers: ['objects', 'foreground', 'map'],
        // Seconds of no movement after which rotation resets to horizontalAngle (0 = no reset)
        idleResetTime: 0,
        // Token side to reset to on idle (negative = falls back to rightSide then leftSide)
        idleSide: -1,
        // Status markers that prevent rotation (e.g. ['dead', 'prone'])
        excludeStatuses: ['dead'],
    };

    // Return a fresh deep-ish copy of DEFAULT_CONFIG (arrays cloned so state
    // never shares references with the constant).
    const freshDefaultConfig = () => {
        const copy = { ...DEFAULT_CONFIG };
        Object.keys(copy).forEach(k => { if (Array.isArray(copy[k])) copy[k] = [...copy[k]]; });
        return copy;
    };

    const migrateState = () => {
        state[SCRIPT_NAME] = state[SCRIPT_NAME] || { defaultConfig: {} };
        state[SCRIPT_NAME].defaultConfig = { ...freshDefaultConfig(), ...state[SCRIPT_NAME].defaultConfig };
        // Global master switch — must be true (in addition to a token's own `enabled`)
        // for facing to apply. Defaults to true so existing installs are unchanged.
        if (typeof state[SCRIPT_NAME].globalEnabled !== 'boolean') state[SCRIPT_NAME].globalEnabled = true;
    };

    const checkInstall = () => {
        migrateState();
        log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} Initialized <=-`);
    };

    // =========================================================================
    // ScriptKit Registration
    // =========================================================================

    const registerWithScriptKit = () => {
        if (typeof ScriptKit === 'undefined') return;
        ScriptKit.register(SCRIPT_NAME, {
            version: SCRIPT_VERSION,
            command: CMD_TOKEN,
            tag: 'FOMO',
            aliases: {},
            newSince: '1.0.0',
            motd: [
                'Tokens automatically turn to face the way they move — no clicks needed.',
                'Select tokens and run `!fomo` to open the config menu (per-token, per-character, or global).',
                'Single-image tokens flip left/right; rollable tokens can swap to dedicated side art.',
                '`!fomo face left` / `!fomo face right` set which way a token faces by default.',
                'Toggle it all off at once with `!fomo off` (the global master switch).',
            ],
            motdHeader: '🧭 **FaceOnMOve** v' + SCRIPT_VERSION,
            motdStyle: { borderLeft: '3px solid #2e7d32' },
            help: {
                description: 'Automatically rotates and/or flips tokens to face their direction of movement. Per-token and per-character overrides layer over global defaults. Supports rollable-token side swapping, horizontal-flip facing, waypoint grouping, snap-to-horizontal, steep up/down handling, in-place facing gestures, and an optional idle reset. Run !fomo with tokens selected to open the config menu.',
                changelog: [
                    { version: '1.0.0', date: '2026-09-06', changes: [
                        'Initial release',
                        'Face movement direction via rotation and/or horizontal flip',
                        'Rollable-token side swapping (left/right and steep up/down art)',
                        'Global, per-token, and per-character config layering',
                        'Interactive config menu with side picker and Facing controls',
                        'Waypoint grouping, snap-to-horizontal, in-place facing gestures, idle reset',
                        'Global master switch and status-marker exclusions',
                        'ScriptKit integration: help, man, whatsnew, motd, gen-help',
                    ]},
                ],
                commands: [
                    { syntax: 'menu', description: 'Open the config menu (same as bare !fomo; uses selection or global) (GM)', version: '1.0.0' },
                    { syntax: 'enable', description: 'Enable facing for selected tokens', version: '1.0.0' },
                    { syntax: 'disable', description: 'Disable facing for selected tokens', version: '1.0.0' },
                    { syntax: 'on', description: 'Global master switch ON (GM)', version: '1.0.0' },
                    { syntax: 'off', description: 'Global master switch OFF (GM)', version: '1.0.0' },
                    { syntax: 'toggle', description: 'Flip the global master switch (GM)', version: '1.0.0' },
                    { syntax: 'face [<id>|default] <left|right|inherit>', description: 'Set default facing; inherit clears a token/character override; default = global (GM)', version: '1.0.0' },
                    { syntax: 'set <key> <value>', description: 'Set a global default (GM)', version: '1.0.0' },
                    { syntax: 'set-token [<id>] <key> <value>', description: 'Set a token-level override; uses selection if no id (GM)', version: '1.0.0' },
                    { syntax: 'set-char [<id>] <key> <value>', description: 'Set a character-level override; accepts token or character id (GM)', version: '1.0.0' },
                    { syntax: 'reset-token [<id>]', description: 'Clear token-level overrides (id form GM-only)', version: '1.0.0' },
                    { syntax: 'reset-char [<id>]', description: 'Clear character-level overrides (GM)', version: '1.0.0' },
                    { syntax: 'reset-all [--force]', description: 'Reset ALL tokens to defaults (GM)', version: '1.0.0' },
                    { syntax: 'reset-global [--force]', description: 'Restore global defaults to factory values (GM)', version: '1.0.0' },
                ],
            },
        });
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic:lastmove', faceOnMove);
        on('chat:message', (msg) => {
            if (msg.type === 'api' && msg.content === '!scriptkit-ready') registerWithScriptKit();
        });
        registerWithScriptKit();
    };

    return { checkInstall, registerEventHandlers };
})();

on('ready', () => {
    'use strict';
    FaceOnMOve.checkInstall();
    FaceOnMOve.registerEventHandlers();
});
