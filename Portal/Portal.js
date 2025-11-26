var API_Meta = API_Meta || {};
API_Meta.Portal = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
}; {
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.Portal.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4));
    }
}
//Portal - A sccript to control and convert doors and windows.
on('ready', () => {
    
            const version = '1.0.0'; //version number set here
        log('-=> Portal v' + version + ' is loaded. Command !portal creates chat menu to convert and control doors and windows.');

    
    
    const CMD = '!portal';
let testthingie = "werwers"

    const DEFAULT_COLORS = {
        door: '#ff9900',
        window: '#00bfff'
    };

    const WINDOW_PROPS = ['color','x','y','isopen','islocked', 'isshuttered'];
    const DOOR_PROPS   = ['color','x','y','isopen','islocked','issecret'];

    const DOOR_DEFAULTS = { color: DEFAULT_COLORS.door, x: 0, y: 0, isOpen: false, isLocked: false, isSecret: false };
    const WINDOW_DEFAULTS = { color: DEFAULT_COLORS.window, x: 0, y: 0, isOpen: false, isLocked: false , isShuttered: false };

    // ---------- Utilities ----------
    

// ############################################################
// IF YOU NEED TO DIABLE THE HELP SYSTEM, MAKE THIS FALSE
// ############################################################
const PORTAL_HELP_ENABLED = true; //MAKE FALSE FO PRODUCTIONWIZARD

const PORTAL_HELP_NAME = "Help: Portal";
const PORTAL_HELP_AVATAR = "https://files.d20.io/images/442783616/hDkduTWDpcVEKomHnbb6AQ/max.png?45596439";

const PORTAL_HELP_TEXT = `
<h1>Portal Script Help</h1>

<p>This script manages doors and windows (“portals”), allowing you to:</p>
<ul>
<li>Create portals on the map</li>
<li>Lock / unlock them</li>
<li>Toggle open/closed state</li>
<li>Set LOS and light-blocking behavior</li>
<li>Auto-orient windows by their drawn direction</li> 
<li>Mirror and rotate portals</li>
<li>Bulk-select and modify portals</li>
</ul>

<p><strong>Base Command:</strong> <code>!portal</code></p>

<h2>Conversion Commands</h2>
<ul>
  <li><code>--convertwindow</code> — Convert selected doors or paths into windows.</li>
  <li><code>--convertdoor</code> — Convert selected windows or paths into doors.</li>
  <li><code>--convertall</code> — Apply the same conversion to all similar objects:
    <ul>
      <li>Doors → all doors of same color</li>
      <li>Windows → all windows of same color</li>
      <li>Paths → all paths matching color and barrierType</li>
    </ul>
  </li>
</ul>

<h2>Attribute Commands</h2>
<p>Format: <code>--attributeName|value</code></p>

<p>Values are case-insensitive. Booleans accept:</p>
<ul>
  <li><strong>true:</strong> true, yes, on</li>
  <li><strong>false:</strong> false, no, off</li>
  <li><strong>flip:</strong> toggles true/false</li>
</ul>

<h3>Common Door/Window Attributes</h3>
<ul>
  <li><code>--isLocked|true/false/flip</code></li>
  <li><code>--isOpen|true/false/flip</code></li>
  <li><code>--isSecret|true/false/flip</code></li>
  <li><code>--isShuttered|true/false/flip</code></li>
  <li><code>--color|#rrggbb</code></li>
  <li><code>--color|default</code> — sets selected doors or windows to Roll20 defaults</li>
  <li><code>--key|string</code></li>
</ul>

<h3>Position Attributes</h3>
<p>Use + or − prefixes for relative moves:</p>
<ul>
  <li><code>--x|100</code> — set position</li>
  <li><code>--x|+20</code> — move right 20 units</li>
  <li><code>--x|-20</code> — move left 20 units</li>
  <li><code>--y|100</code> — set position</li>
  <li><code>--y|+10</code> — move down 10 units</li>
</ul>
Note: All Y and Y values are figured with the top left corned of the map being (0,0), and positive values increasing toward the lower right, to conform with how graphics are handled.

<h2>Path Handling</h2>
<ul>
  <li>Only paths with exactly two endpoints are converted.</li>
  <li>Paths with more points are skipped and noted in chat.</li>
  <li>Position is taken from the path endpoints.</li>
</ul>

<h2>General Rules</h2>
<ul>
  <li>All commands are case-insensitive.</li>
  <li>All provided attributes apply to every selected object.</li>
  <li>Missing attributes (e.g., <code>isSecret</code> on windows) are ignored.</li>
</ul>

<h2>Examples</h2>
<ul>
  <li><code>!portal --convertwindow</code></li>
  <li><code>!portal --isLocked|true</code></li>
  <li><code>!portal --isLocked|flip --isOpen|false</code></li>
  <li><code>!portal --x|+20 --y|-10</code></li>
  <li><code>!portal --convertwindow --color|#FF00FF --isLocked|true</code></li>
</ul>
`;

// === HELP COMMAND HANDLER ===
const handleHelp = (msg) => {
    if (!PORTAL_HELP_ENABLED) return;   // <---- NEW DISABLER

    if (msg.type !== "api") return;

    const args = msg.content.split(/\s+--/);
    if (!args[1] || !args[1].toLowerCase().startsWith("help")) return;

    // Find existing handout
    let handout = findObjs({
        _type: "handout",
        name: PORTAL_HELP_NAME
    })[0];

    // Create if missing
    if (!handout) {
        handout = createObj("handout", {
            name: PORTAL_HELP_NAME,
            archived: false
        });

        // Set avatar
        handout.set("avatar", PORTAL_HELP_AVATAR);
    }

    // Always overwrite contents
    handout.set("notes", PORTAL_HELP_TEXT);

    // Create GM whisper with styled box
    const link = `http://journal.roll20.net/handout/${handout.get("_id")}`;

    const box = `
<div style="background:#111; padding:10px; border:1px solid #555; border-radius:6px; color:#eee;">
    <div style="font-size:110%; font-weight:bold; margin-bottom:5px;">Portal Help</div>
    <a href="${link}" target="_blank" style="color:#ff00ff; font-weight:bold;">Open Help Handout</a>
</div>`.trim().replace(/\r?\n/g, '');

    sendChat("Portal", `/w gm ${box}`);
};

// Register help handler
on("chat:message", (msg) => {
    if (!PORTAL_HELP_ENABLED) return;   // <---- NEW DISABLER
    handleHelp(msg);
});

function resolveColor(rawColorValue, targetType) {
    if (!rawColorValue) return null;
    const v = String(rawColorValue).trim().toLowerCase();

    if (v === 'default') {
        return (targetType === 'door')
            ? DEFAULT_COLORS.door
            : DEFAULT_COLORS.window;
    }

    return normalizeColor(rawColorValue);
}


// ############################################################
// END HELP HANDOUT CREATION SELECTION
// COMMENT THIS SECTION OUT TO DISABLE HELP SYSTEM
// ############################################################

// --- Chat menu (whispered to GM) ---
// Insert this block into the script (after your constants / helper defs)
// --- CHAT MENU + MENU STATE PATCH ---
// Add these near the other globals (CSS, etc.). It defines menu CSS + helpers + handlers.
// It intentionally uses a new API command "!portal-mode" to toggle Selected/All to avoid
// interfering with the main !portal handler.

const CSS = {
  container: 'position:relative; left:-20px; width:100%; border:1px solid #111; background:#ddd; color:#111; padding:6px; margin:4px; border-radius:6px; font-size:13px; line-height:1.5;',
  title: 'width:100%; border:none; background:#444; padding:1px; margin-bottom:5px; border-radius:4px; font-size:14px; line-height:1.5; color:#eee; font-weight:bold; text-align:center;',
  label: 'display:inline-block; font-weight:bold; margin:4px 6px 0 0; width:60px;',
  button: 'box-shadow:inset 0px 1px 3px 0px #555; background:linear-gradient(to bottom, #333 5%, #555 100%); background-color:#444; border-radius:4px; min-width:10px; text-align:center; border:1px solid #566963; display:inline-block; cursor:pointer; color:#eee; font-size:13px; font-weight:bold; padding:1px 5px; margin:1px; text-decoration:none; text-shadow:0px -1px 0px #2b665e;',
  active: 'font-weight:bold !important; background:#555;',
  // new toggle-specific styles (kept inline in CSS object per requirement)
  toggleWrap: 'text-align:center;margin-bottom:6px;',
  toggleBtn: 'width:40%; display:inline-block;padding:4px 8px;margin:0 4px;border-radius:4px;cursor:pointer;border:1px solid #333;background:#aaa;color:#fff;font-weight:bold;text-decoration:none;',
  toggleActive: 'width:40%; background:#444;color:#eee;border:1px solid #566963;' // "Roll20 Pink" look for active state
};

const buildBtn = (href, label, style, tooltip) =>
    `<a href="${href}" style="${style || CSS.button}"${tooltip ? ` title="${tooltip}"` : ""}>${label}</a>`;

// Helper: append --all when menu mode is 'all'
function buildCmd(base, mode) {
    if (mode === 'all') {
        // avoid double-space if already has args
        return base + ' --all';
    }
    return base;
}

// Ensure persistent state exists
if (!state.portal_menu) {
    state.portal_menu = { mode: 'selected' }; // default: selected
}

// Build the menu HTML (single-block). Always generate based on current state.
function buildMenuHtml() {
    const mode = (state.portal_menu && state.portal_menu.mode) ? state.portal_menu.mode : 'selected';

    // toggle button markup
    const selectedActive = (mode === 'selected') ? CSS.toggleActive : '';
    const allActive = (mode === 'all') ? CSS.toggleActive : '';

    // helper to build toggle buttons that call the small mode-switcher command
    const toggleSelected = `<a href="!portal-mode --mode|selected" style="${CSS.toggleBtn}; ${selectedActive}" title = "Affect only selected items.">Selected Only</a>`;
    const toggleAll      = `<a href="!portal-mode --mode|all" style="${CSS.toggleBtn}; ${allActive}" title = "Affect all items on this page that match the selected item.">All Similar</a>`;

    // Build menu commands using buildCmd(base, mode) so --all will be added when needed
    const html = `
<div style="${CSS.container}">
  <div style="${CSS.title}">Portal</div>

  <div style="${CSS.toggleWrap}">
    ${toggleSelected}${toggleAll}
  </div>

  <div style="margin-bottom:6px;">
    <span style="${CSS.label}">Convert</span>
    ${buildBtn(buildCmd('!portal --convertdoor', mode), 'Door', null, 'Convert selected items into doors')}
    ${buildBtn(buildCmd('!portal --convertwindow', mode), 'Window', null, 'Convert selected items into windows')}
  </div>

  <div style="margin-bottom:6px;">
    <span style="${CSS.label}">Position</span>
    <span style="display:inline-block;vertical-align:middle;">
      ${buildBtn(buildCmd('!portal --x|?{Enter X value in pixels from top left of page}', mode), 'X', null, 'Set absolute X-position in pixels from top-left')}
      ${buildBtn(buildCmd('!portal --y|?{Enter Y value in pixels from top left of page}', mode), 'Y', null, 'Set absolute Y-position in pixels from top-left')}
      &nbsp;&nbsp;&nbsp;
      ${buildBtn(buildCmd('!portal --x|-?{Moving selected items to the left. Enter value in pixels}', mode), '←', null, 'Move left by given number of pixels')}
      ${buildBtn(buildCmd('!portal --x|+?{Moving selected items to the right. Enter value in pixels}', mode), '→', null, 'Move right by given number of pixels')}
      ${buildBtn(buildCmd('!portal --y|-?{Moving selected items up. Enter value in pixels}', mode), '↑', null, 'Move up by given number of pixels')}
      ${buildBtn(buildCmd('!portal --y|+?{Moving selected items down. Enter value in pixels}', mode), '↓', null, 'Move down by given number of pixels')}
    </span>
  </div>

  <div style="margin-bottom:6px;">
    <span style="${CSS.label}">Color</span>
    ${buildBtn(buildCmd('!portal --color|default', mode), 'Default', null, 'Reset to default portal colors')}
    ${buildBtn(buildCmd('!portal --color|?{Enter custom color (#rrggbb)}', mode), 'Custom', null, 'Apply a custom color. Must be a hex value starting with #')}
  </div>

  <div style="margin-bottom:6px;">
    <span style="${CSS.label}">Locked</span>
    ${buildBtn(buildCmd('!portal --isLocked|true', mode), 'Locked', null, 'Set door or window to locked')}
    ${buildBtn(buildCmd('!portal --isLocked|false', mode), 'Unlocked', null, 'Set door or window to unlocked')}
    ${buildBtn(buildCmd('!portal --isLocked|flip', mode), 'Toggle', null, 'Toggle locked/unlocked')}
  </div>

  <div style="margin-bottom:6px;">
    <span style="${CSS.label}">Open</span>
    ${buildBtn(buildCmd('!portal --isOpen|true', mode), 'Open', null, 'Set door or window to open')}
    ${buildBtn(buildCmd('!portal --isOpen|false', mode), 'Closed', null, 'Set door or window to closed')}
    ${buildBtn(buildCmd('!portal --isOpen|flip', mode), 'Toggle', null, 'Toggle open/closed')}
  </div>

  <div style="margin-bottom:6px;">
    <span style="${CSS.label}">Doors</span>
    ${buildBtn(buildCmd('!portal --isSecret|true', mode), 'Hidden', null, 'Set door as secret / hidden')}
    ${buildBtn(buildCmd('!portal --isSecret|false', mode), 'Visible', null, 'Set door as visible')}
  </div>

  <div style="margin-bottom:6px;">
    <span style="${CSS.label}">Windows</span>
    ${buildBtn(buildCmd('!portal --isShuttered|true', mode), 'Shuttered', null, 'Set window as shuttered')}
    ${buildBtn(buildCmd('!portal --isShuttered|false', mode), 'Unshuttered', null, 'Set window as unshuttered')}
  </div>


  ${PORTAL_HELP_ENABLED ? `
  <div style="margin-bottom:6px;">
    <span style="${CSS.label}">Help</span>
    ${buildBtn('!portal --help', 'Help', null, 'Open the Portal help handout')}
  </div>` : ``}
</div>`.trim();
return html.replace(/\r?\n/g, '');
//    return html;
}


// Menu requester: exact "!portal" with no args (whisper to GM)
const handleMenu = (msg) => {
    if (msg.type !== 'api') return;
    if (String(msg.content || '').trim().toLowerCase() !== CMD) return;

    const html = buildMenuHtml();
    sendChat('Portal', `/w gm ${html}`);
};

// New small handler to update menu mode: "!portal-mode --mode|selected" or "--mode|all"
const handleMenuMode = (msg) => {
    if (msg.type !== 'api') return;
    if (!msg.content.toLowerCase().startsWith('!portal-mode')) return;

    // parse simple --mode|value
    const pieces = msg.content.split(/\s+--/).slice(1);
    let newMode = null;
    for (const raw of pieces) {
        const firstToken = raw.trim().split(/\s+/)[0] || '';
        const kv = firstToken.split('|');
        const key = (kv[0] || '').toLowerCase();
        const val = kv.slice(1).join('|') || (raw.substring(firstToken.length).trim().startsWith('|') ? raw.substring(firstToken.length).trim().substring(1).trim() : '');
        if (key === 'mode' && val) {
            const v = val.toLowerCase();
            if (v === 'selected' || v === 'all') newMode = v;
        }
    }

    if (!newMode) {
        // invalid usage: re-send menu to show current state
        sendChat('Portal', `/w gm ${buildMenuHtml()}`);
        return;
    }

    // Ensure state object exists and set the mode
    state.portal_menu = state.portal_menu || {};
    state.portal_menu.mode = newMode;

    // Re-send the menu so GM sees updated toggles
    sendChat('Portal', `/w gm ${buildMenuHtml()}`);
};

// Register both handlers (order doesn't matter)
on('chat:message', handleMenuMode);
on('chat:message', handleMenu);

// --- end of chat menu patch ---



    
    function normalizeColor(c) {
        if (!c) return null;
        c = String(c).trim().toLowerCase();
        if (c.length === 4 && c[0] === '#') {
            return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
        }
        return c;
    }

    function toLowerKey(k) {
        return String(k || '').trim().toLowerCase();
    }

    function parseBoolToken(tok) {
        if (!tok && tok !== '') return null;
        const t = String(tok).trim().toLowerCase();
        if (['true','yes','on'].includes(t)) return { mode: 'set', value: true };
        if (['false','no','off'].includes(t)) return { mode: 'set', value: false };
        if (t === 'flip') return { mode: 'flip' };
        return null;
    }

    function parseNumberToken(tok) {
        if (tok === undefined || tok === null) return null;
        const s = String(tok).trim();
        if (s.length === 0) return null;
        // relative?
        if (/^[+-]\d+(\.\d+)?$/.test(s)) {
            return { relative: true, value: Number(s) };
        }
        if (/^\d+(\.\d+)?$/.test(s)) {
            return { relative: false, value: Number(s) };
        }
        return null;
    }

    function safeGet(obj, prop) {
        // get returns undefined for unknown properties
        return obj.get(prop);
    }

    function safeSet(obj, patch) {
        // patch is an object of property: value
        try {
            obj.set(patch);
            return true;
        } catch (e) {
            return false;
        }
    }

    // ---------- Argument parser ----------
    function parseArgs(msg) {
        // split on -- (case-insensitive)
        const pieces = msg.content.split(/\s+--/).slice(1);
        const opts = {
            convertType: null,   // 'window' | 'door' | null
            convertAll: false,
            attrs: {}            // key (lowercase) -> raw string value
        };

        for (let raw of pieces) {
            const part = raw.trim();
            if (!part) continue;
            // first token up to whitespace
            const firstToken = part.split(/\s+/)[0];
            const keyVal = firstToken.split('|'); // supports --name|value (value may be empty string)
            const key = toLowerKey(keyVal[0]);

            // Conversion flags
            if (key === 'convertwindow') {
                opts.convertType = 'window';
                continue;
            }
            if (key === 'convertdoor') {
                opts.convertType = 'door';
                continue;
            }
            if (key === 'all') {
                opts.convertAll = true;
                continue;
            }

            // Attribute flag: key|value (value may contain pipes if user included them, so combine the rest)
            // Reconstruct the full argument (including any remaining chars after the first token)
            const afterFirstToken = part.substring(firstToken.length).trim();
            let value = null;
            if (keyVal.length >= 2) {
                // If user put --attr|value directly in firstToken
                value = keyVal.slice(1).join('|');
            } else if (afterFirstToken.startsWith('|')) {
                value = afterFirstToken.substring(1).trim();
            } else {
                // No pipe provided; treat as flag with empty string
                value = '';
            }

            opts.attrs[key] = value;
        }

        return opts;
    }

    // ---------- Path endpoint code (keeps your existing logic, fixed bounding center) ----------
    function getPathEndpoints(obj) {
        const type = obj.get('_type');

        // --- Classic Path (legacy engine) ---
        if (type === 'path') {
            const raw = JSON.parse(obj.get('_path') || '[]');
            if (raw.length < 2) return null;

            const coords = raw
                .filter(p => p && p.length >= 3)
                .map(p => ({ x: p[1], y: p[2] }));
            if (coords.length < 2) return null;

            const left = obj.get('left') || 0;
            const top = obj.get('top') || 0;
            const width = obj.get('width') || 0;
            const height = obj.get('height') || 0;

            // Compute bounding box of the path in local coords
            const minX = Math.min(...coords.map(p => p.x));
            const maxX = Math.max(...coords.map(p => p.x));
            const minY = Math.min(...coords.map(p => p.y));
            const maxY = Math.max(...coords.map(p => p.y));
            const boxCenter = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

            // Convert each point to world space relative to bounding box center
            // left/top is center of the object's bounding box in world coords, so:
            const start = {
                x: left - width / 2 + (coords[0].x - boxCenter.x + width / 2),
                y: top - height / 2 + (coords[0].y - boxCenter.y + height / 2)
            };
            const end = {
                x: left - width / 2 + (coords[1].x - boxCenter.x + width / 2),
                y: top - height / 2 + (coords[1].y - boxCenter.y + height / 2)
            };

            return { start, end };
        }

        // --- PathV2 (latest engine) ---
        if (type === 'pathv2') {
            const pts = JSON.parse(obj.get('points') || '[]');
            if (pts.length !== 2) return null;

            const [p0, p1] = pts;
            const cx = obj.get('x') || 0;
            const cy = obj.get('y') || 0;

            const minX = Math.min(p0[0], p1[0]);
            const maxX = Math.max(p0[0], p1[0]);
            const minY = Math.min(p0[1], p1[1]);
            const maxY = Math.max(p0[1], p1[1]);
            const boxCenter = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

            const start = { x: cx + (p0[0] - boxCenter.x), y: cy + (p0[1] - boxCenter.y) };
            const end   = { x: cx + (p1[0] - boxCenter.x), y: cy + (p1[1] - boxCenter.y) };

            return { start, end };
        }

        return null;
    }

// ---------- Create portal from endpoints (path -> window/door) ----------
function createPortalFromEndpoints(type, color, pageid, start, end) {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    // Handles must be in the portal object's local coordinate space.
    // Because we set object.y = -midY (Roll20's inverted axis for doors/windows),
    // we must also invert the handle Y values so the rendered endpoints keep their original slope.
    const handle0 = {
        x: start.x - midX,
        y: -(start.y - midY)
    };
    const handle1 = {
        x: end.x - midX,
        y: -(end.y - midY)
    };

    return createObj(type, {
        pageid,
        color,
        x: midX,
        y: -midY,
        path: { handle0, handle1 },
        isOpen: false,
        isLocked: false,
        isShuttered: false,
        layer: 'walls'
    });
}

    // ---------- Create portal from an existing portal (window ↔ door conversion) ----------
    function createPortalFromExisting(existingObj, targetType, overrideAttrs) {
        // existingObj is a window or door
        const pageid = existingObj.get('_pageid');
        const existingType = existingObj.get('_type');

        // copy baseline values
const color =
    resolveColor(overrideAttrs && overrideAttrs.color, targetType) ||
    normalizeColor(existingObj.get('color')) ||
    (targetType === 'door' ? DEFAULT_COLORS.door : DEFAULT_COLORS.window);

        // path / x / y are shared; they are already in door/window coordinate space, so copy directly
        const path = existingObj.get('path');
        const x = (overrideAttrs && overrideAttrs.x !== undefined) ? Number(overrideAttrs.x) : existingObj.get('x') || 0;
        const y = (overrideAttrs && overrideAttrs.y !== undefined) ? Number(overrideAttrs.y) : existingObj.get('y') || 0;

        // build base props for target object, using defaults where necessary
        const base = { pageid, color, x, y, path, layer: 'walls' };

        if (targetType === 'window') {
            base.isOpen = existingObj.get('isOpen') !== undefined ? existingObj.get('isOpen') : WINDOW_DEFAULTS.isOpen;
            base.isLocked = existingObj.get('isLocked') !== undefined ? existingObj.get('isLocked') : WINDOW_DEFAULTS.isLocked;
            base.isLocked = existingObj.get('isShuttered') !== undefined ? existingObj.get('isShuttered') : WINDOW_DEFAULTS.isShuttered;
        } else if (targetType === 'door') {
            base.isOpen = existingObj.get('isOpen') !== undefined ? existingObj.get('isOpen') : DOOR_DEFAULTS.isOpen;
            base.isLocked = existingObj.get('isLocked') !== undefined ? existingObj.get('isLocked') : DOOR_DEFAULTS.isLocked;
            base.isSecret = existingObj.get('isSecret') !== undefined ? existingObj.get('isSecret') : DOOR_DEFAULTS.isSecret;
        }

        // Create new object
        const created = createObj(targetType, base);
        return created;
    }

    // ---------- Attribute application ----------
// ---------- Attribute application ----------
function applyAttributesToPortal(obj, attrs) {
    if (!attrs || Object.keys(attrs).length === 0) return;

    const objType = obj.get('_type');
    const allowed = (objType === 'window') ? WINDOW_PROPS : DOOR_PROPS;

    const patch = {};

    for (const rawKey of Object.keys(attrs)) {
        const key = toLowerKey(rawKey);
        if (!allowed.includes(key)) continue;

        const rawVal = attrs[rawKey];

        // ---------- Boolean attributes ----------
        if (['isopen','islocked','issecret','isshuttered'].includes(key)) {

            // map lowercase to actual Roll20 property names
            const propMap = {
                isopen: 'isOpen',
                islocked: 'isLocked',
                isshuttered: 'isShuttered',
                issecret: 'isSecret'
            };
            const trueKey = propMap[key];
            if (!trueKey) continue;

            const parsed = parseBoolToken(rawVal);
            if (!parsed) continue;

            if (parsed.mode === 'flip') {
                const cur = !!obj.get(trueKey);
                patch[trueKey] = !cur;

            } else if (parsed.mode === 'set') {
                patch[trueKey] = !!parsed.value;
            }

            continue;
        }

        // ---------- Color ----------
if (key === 'color') {
    const objType = obj.get('_type');
    const resolved = resolveColor(rawVal, objType);
    if (resolved) patch.color = resolved;
    continue;
}


        // ---------- x / y numeric ----------
// ---------- x / y numeric ----------
if (key === 'x' || key === 'y') {
    const parsed = parseNumberToken(rawVal);
    if (!parsed) continue;
    const cur = Number(obj.get(key) || 0);

    if (key === 'x') {
        // X behavior unchanged: relative adds, absolute sets directly
        patch.x = parsed.relative ? cur + parsed.value : parsed.value;
    } else {
        // Y: interpret commands in "user" coordinates (positive = down).
        // Internally Roll20 doors/windows use an inverted Y axis,
        // so absolute user value -> internal negative.
        // For relative (+N) the user expects to move *down* by N,
        // which means internal y should decrease by N (subtract).
        if (parsed.relative) {
            patch.y = cur - parsed.value;
        } else {
            patch.y = -parsed.value;
        }
    }
    continue;
}

    }

    if (Object.keys(patch).length > 0) safeSet(obj, patch);
}

    // ---------- Main conversion logic for a single object ----------
    function processSingleObject(obj, opts, templateObjForConvertAll) {
        // obj may be path/pathv2/window/door
        const type = obj.get('_type');

        // Helper to apply attributes to an object (window/door)
        const applyAttrsTo = (targetObj) => {
            applyAttributesToPortal(targetObj, opts.attrs);
        };

        // If obj is a path or pathv2
        if (type === 'path' || type === 'pathv2') {
            // need explicit conversion flag to affect a path
            if (!opts.convertType) return { converted: 0, skipped: 0 };

            const endpoints = getPathEndpoints(obj);
            if (!endpoints) return { converted: 0, skipped: 1 };

            // use provided color override if any, otherwise use stroke color of path
            const strokeColor = normalizeColor(obj.get('stroke'));
let color =
    resolveColor(opts.attrs.color, opts.convertType) ||
    normalizeColor(obj.get('color')) ||
    strokeColor ||
    (opts.convertType === 'door' ? DEFAULT_COLORS.door : DEFAULT_COLORS.window);

            const pageid = obj.get('_pageid');
            const created = createPortalFromEndpoints(opts.convertType, color, pageid, endpoints.start, endpoints.end);

            // apply attributes (attrs map may contain color, x, y, booleans)
            applyAttrsTo(created);

            // remove original
            obj.remove();
            return { converted: 1, skipped: 0 };
        }

        // If obj is window or door
        if (type === 'window' || type === 'door') {
            // If convertType specified and different -> create new of that type, copy/derive attributes
            if (opts.convertType && opts.convertType !== type) {
                // Create new portal using existing path/x/y/color, but allow overrides in attrs
                const overrideAttrs = {};
                if (opts.attrs.color !== undefined) overrideAttrs.color = opts.attrs.color;
                if (opts.attrs.x !== undefined) overrideAttrs.x = opts.attrs.x;
                if (opts.attrs.y !== undefined) overrideAttrs.y = opts.attrs.y;

                const newObj = createPortalFromExisting(obj, opts.convertType, overrideAttrs);

                // Apply remaining attributes to newObj
                applyAttrsTo(newObj);

                // Remove old
                obj.remove();
                return { converted: 1, skipped: 0 };
            } else {
                // No conversion requested or converting to same type: simply apply attributes to existing object
                applyAttrsTo(obj);
                return { converted: 1, skipped: 0 };
            }
        }

        // other object types: do nothing
        return { converted: 0, skipped: 0 };
    }

    // ---------- convertAll resolution ----------
    function findCandidatesForConvertAll(templateObj) {
        const pageid = templateObj.get('_pageid');
        const ttype = templateObj.get('_type');

        if (ttype === 'path' || ttype === 'pathv2') {
            const stroke = normalizeColor(templateObj.get('stroke'));
            const barrier = templateObj.get('barrierType') || 'wall';
            return findObjs({ _pageid: pageid }).filter(o =>
                (o.get('_type') === 'path' || o.get('_type') === 'pathv2') &&
                normalizeColor(o.get('stroke')) === stroke &&
                (o.get('barrierType') || 'wall') === barrier
            );
        }

        if (ttype === 'door') {
            const color = normalizeColor(templateObj.get('color'));
            return findObjs({ _pageid: pageid }).filter(o =>
                o.get('_type') === 'door' && normalizeColor(o.get('color')) === color
            );
        }

        if (ttype === 'window') {
            const color = normalizeColor(templateObj.get('color'));
            return findObjs({ _pageid: pageid }).filter(o =>
                o.get('_type') === 'window' && normalizeColor(o.get('color')) === color
            );
        }

        return [];
    }

    // ---------- Top-level chat handler ----------
    on('chat:message', (msg) => {
        if (msg.type !== 'api') return;
        if (!msg.content.toLowerCase().startsWith(CMD)) return;

        const opts = parseArgs(msg);
        // opts: convertType ('window'|'door' or null), convertAll boolean, attrs map

        // No output mode (Option C): we will not send success messages.
        // Basic validation: there must be at least one selected object for non-convertall usage.
        const selected = msg.selected || [];

        if (opts.convertAll) {
            // convertAll requires a template object to determine matching criteria
            if (!selected || selected.length === 0) {
                return;
            }
            // operate on each selected as template (if multiple selected templates, handle each)
            for (const sel of selected) {
                const templateObj = getObj(sel._type, sel._id);
                if (!templateObj) continue;
                const candidates = findCandidatesForConvertAll(templateObj);
                for (const c of candidates) {
                    try {
                        processSingleObject(c, opts, templateObj);
                    } catch (e) {
                        // silent fail per Option C
                    }
                }
            }
            return;
        }

        // Non-convertAll: operate on each selected object individually
        if (!selected || selected.length === 0) {
            return;
        }

        for (const sel of selected) {
            const obj = getObj(sel._type, sel._id);
            if (!obj) continue;
            try {
                processSingleObject(obj, opts, null);
            } catch (e) {
                // silent per Option C
            }
        }
    });
});

{ try { throw new Error(''); } catch (e) { API_Meta.Portal.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Portal.offset); } }
