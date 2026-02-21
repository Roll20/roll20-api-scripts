// Script:   TokenHome
// By:       Keith Curtis, based on a script by the Aaron
// Contact:  https://app.roll20.net/users/162065/keithcurtis
var API_Meta = API_Meta || {}; //eslint-disable-line no-var
API_Meta.TokenHome = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.TokenHome.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - 6); } }

on('ready', () => {

  /*************************
   * CONFIG
   *************************/
  const STORAGE_ATTR = 'gmnotes';
  const DEFAULT_LOC = 'L1';
  const VALID_LAYERS = ['objects', 'map', 'gmlayer', 'walls'];
  const DEFAULT_RADIUS = 300;

  /*************************
   * REGEX
   *************************/
  const HOME_BLOCK_REGEX =
    /<div style="display:\s*none">\s*TOKENHOME([\s\S]*?)<\/div>/i;

  const HOME_LINE_REGEX =
    /^\s*(L\d+)\s*:\s*(-?\d+(?:\.\d*)?)\s*,\s*(-?\d+(?:\.\d*)?)\s*,\s*(\w+)\s*$/gim;

  const LEGACY_BLOCK_REGEX =
    /<div style="display:\s*none"[^>]*data-tokenhomes\s*=\s*"(?:true|1)"[^>]*>([\s\S]*?)<\/div>/i;
    

  /*************************
   * Help System
   *************************/

    const HOME_HELP_NAME   = "Help: Token Home";
const HOME_HELP_AVATAR = "https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147";

const HOME_HELP_TEXT = `
<h1>Token Home Script Help</h1>

<p>
The <strong>Token Home</strong> script allows tokens to store and recall multiple
named locations on the current page.
Each location records an X/Y position and the token’s layer.
</p>

<p>
Tokens can be sent back to saved locations, queried, or summoned to a selected
anchor point based on proximity.
</p>

<ul>
  <li>Store multiple locations per token (L1, L2, L3, …)</li>
  <li>Recall tokens to stored locations</li>
  <li>Preserve token layer when moving</li>
  <li>Summon tokens to a selected map object based on distance</li>
  <li>Compatible with tokens placed outside page bounds</li>
</ul>

<p><strong>Base Command:</strong> <code>!home</code></p>

<hr>

<h2>Primary Commands</h2>

<ul>
  <li><code>--set</code> — Store the selected token’s current position as a location.</li>
  <li><code>--lN</code> — Recall the selected token to a stored location.</li>
  <li><code>--summon</code> — Pull tokens to a selected anchor based on proximity.</li>
  <li><code>--clear</code> — Remove stored location data from selected tokens.</li>
  <li><code>--help</code> — Open this help handout.</li>
</ul>

<hr>

<h2>Location Storage</h2>

<p>
Locations are identified by numbered slots:
<code>L1</code>, <code>L2</code>, <code>L3</code>, and higher.
There is no fixed upper limit.
</p>

<ul>
  <li><strong>L1</strong> — Typically used as the token’s default location</li>
  <li><strong>L2</strong> — Commonly used for Residence</li>
  <li><strong>L3</strong> — Commonly used for Work</li>
  <li><strong>L4</strong> — Commonly used for Encounter</li>
</ul>

<p>
Each stored location records:
</p>

<ul>
  <li>X position (pixels)</li>
  <li>Y position (pixels)</li>
  <li>Token layer</li>
</ul>

<hr>

<h2>Set Command</h2>

<p><strong>Format:</strong></p>
<pre>
!home --set --lN
</pre>

<p>
Stores the selected token’s current position and layer into location <code>L N</code>.
</p>

<h3>Rules</h3>

<ul>
  <li>Exactly one token must be selected</li>
  <li>Existing data for that location is overwritten</li>
  <li>Page ID is not stored</li>
</ul>

<h3>Examples</h3>

<ul>
  <li><code>!home --set --l1</code> — Set default location</li>
  <li><code>!home --set --l2</code> — Set residence</li>
  <li><code>!home --set --l5</code> — Set custom location</li>
</ul>

<hr>

<h2>Recall Command</h2>

<p><strong>Format:</strong></p>
<pre>
!home --lN
</pre>

<p>
Moves the selected token to the stored location <code>L N</code>.
</p>

<h3>Rules</h3>

<ul>
  <li>Exactly one token must be selected</li>
  <li>If the location does not exist, the command aborts</li>
  <li>The token’s layer is restored</li>
</ul>

<h3>Examples</h3>

<ul>
  <li><code>!home --l1</code></li>
  <li><code>!home --l3</code></li>
</ul>

<hr>

<h2>Summon Command</h2>

<p>
The <strong>summon</strong> command pulls tokens toward a selected anchor object
based on proximity to their stored locations.
</p>

<p><strong>Format:</strong></p>
<pre>
!home --summon [--lN] [--r pixels or grid squares]
</pre>
<p>
if no value is given, then pixels are assumed. Use 'g' for grid squares. <pre>--r300</pre> = 300 pixels, <pre>--r5g</pre> = 5 grid squares.
</p>

<h3>Anchor Selection</h3>

<p>
Exactly one object must be selected:
</p>

<ul>
  <li>Token (<code>graphic</code>)</li>
  <li>Text object (<code>text</code>)</li>
  <li>Map pin (<code>pin</code>)</li>
</ul>

<p>
The selected object’s X/Y position is used as the summon target.
</p>

<h3>Optional Arguments</h3>

<ul>
  <li>
    <code>--lN</code><br>
    Restrict the summon to a specific stored location.
  </li>
  <li>
    <code>--r pixels</code><br>
    Maximum distance from the anchor.
    Default: <code>70</code>.
  </li>
</ul>

<h3>Behavior</h3>

<ul>
  <li>If <code>--lN</code> is supplied, only that location is tested</li>
  <li>If omitted, all stored locations are considered</li>
  <li>The closest matching location is used per token</li>
  <li>Distance is measured from the stored location, not current token position</li>
  <li>Tokens outside the radius are ignored</li>
</ul>

<h3>Examples</h3>

<ul>
  <li><code>!home --summon</code></li>
  <li><code>!home --summon --r 210</code></li>
  <li><code>!home --summon --l2</code></li>
  <li><code>!home --summon --l4 --r 140</code></li>
</ul>

<hr>

<h2>Clear Command</h2>

<p><strong>Format:</strong></p>
<pre>
!home --clear [--lN]
</pre>

<ul>
  <li>If <code>--lN</code> is supplied, only that location is removed</li>
  <li>If omitted, all stored locations are removed</li>
</ul>

<hr>

<h2>General Rules</h2>

<ul>
  <li>All commands are GM-only</li>
  <li>Commands operate only on the current page</li>
  <li>Tokens may be placed outside page bounds</li>
  <li>Invalid arguments abort the command</li>
</ul>
`;

    /*************************
 * HELP HANDOUT
 *************************/
const showHomeHelp = () => {
  let handout = findObjs({
    type: 'handout',
    name: HOME_HELP_NAME
  })[0];

  if (!handout) {
    handout = createObj('handout', {
      name: HOME_HELP_NAME,
      avatar: HOME_HELP_AVATAR,
      notes: HOME_HELP_TEXT,
      inplayerjournals: 'gm',
      controlledby: 'gm'
    });
  } else {
    // Ensure content stays current
    handout.set({
      avatar: HOME_HELP_AVATAR,
      notes: HOME_HELP_TEXT
    });
  }

sendChat(
  'TokenHome', `/w gm <div style="background:#e6e6e6;border:1px solid #b0b0b0;border-radius:6px;padding:8px 12px;font-size:13px;"><b>Token Home Help</b><br><a href="http://journal.roll20.net/handout/${handout.id}">${HOME_HELP_NAME}</a></div>`
);

};

    
    

  /*************************
   * LOW-LEVEL HELPERS
   *************************/
  const readNotes = (token) =>
    unescape(token.get(STORAGE_ATTR) || '');

  const writeNotes = (token, text) =>
    token.set(STORAGE_ATTR, escape(text));

  const distance = (a, b) =>
    Math.hypot(a.left - b.left, a.top - b.top);

  /*************************
   * STORAGE
   *************************/
  const getHomes = (token) => {
    let notes = readNotes(token);

    // 🔁 Auto-upgrade legacy once, silently
    if (!HOME_BLOCK_REGEX.test(notes) && LEGACY_BLOCK_REGEX.test(notes)) {
      convertLegacyHomes(token);
      notes = readNotes(token);
    }

    const match = notes.match(HOME_BLOCK_REGEX);
    const homes = {};
    if (!match) return homes;

    HOME_LINE_REGEX.lastIndex = 0;
    let m;
    while ((m = HOME_LINE_REGEX.exec(match[1])) !== null) {
      const [, loc, left, top, layer] = m;
      homes[loc.toUpperCase()] = {
        left: Number(left),
        top: Number(top),
        layer: VALID_LAYERS.includes(layer) ? layer : 'objects'
      };
    }
    return homes;
  };

  const saveHomes = (token, homes) => {
    let notes = readNotes(token).replace(HOME_BLOCK_REGEX, '');

    const lines = Object.entries(homes)
      .map(([loc, h]) => `${loc}:${h.left},${h.top},${h.layer}`)
      .join('\n');

    if (!lines.trim()) {
      writeNotes(token, notes);
      return;
    }

    const block =
`<div style="display:none">
TOKENHOME
${lines}
</div>`;

    writeNotes(token, notes + block);
  };

  const setHome = (token, loc) => {
    const homes = getHomes(token);
    homes[loc] = {
      left: token.get('left'),
      top: token.get('top'),
      layer: VALID_LAYERS.includes(token.get('layer'))
        ? token.get('layer')
        : 'objects'
    };
    saveHomes(token, homes);
  };

  const clearHome = (token, loc) => {
    const homes = getHomes(token);
    if (loc) delete homes[loc];
    else Object.keys(homes).forEach(k => delete homes[k]);
    saveHomes(token, homes);
  };

  /*************************
   * LEGACY CONVERSION
   *************************/
  const convertLegacyHomes = (token) => {
    const notes = readNotes(token);
    if (HOME_BLOCK_REGEX.test(notes)) return { skipped: true };

    const legacyMatch = notes.match(LEGACY_BLOCK_REGEX);
    if (!legacyMatch) return { skipped: true };

    let raw = legacyMatch[1];
    try {
      if (/%[0-9A-Fa-f]{2}/.test(raw)) raw = decodeURIComponent(raw);
      const legacy = JSON.parse(raw);

      const homes = {};
      Object.keys(legacy).forEach(k => {
        const h = legacy[k];
        if (typeof h.left !== 'number' || typeof h.top !== 'number') return;
        const loc = /^L\d+$/i.test(k) ? k.toUpperCase() : 'L1';
        homes[loc] = {
          left: h.left,
          top: h.top,
          layer: VALID_LAYERS.includes(h.layer)
            ? h.layer
            : token.get('layer')
        };
      });

      writeNotes(token, notes.replace(LEGACY_BLOCK_REGEX, ''));
      saveHomes(token, homes);
      return { converted: true };
    } catch {
      return { failed: true };
    }
  };

  /*************************
   * ANCHORS
   *************************/
  const getAnchorFromSelection = (sel) => {
    if (!sel || sel.length !== 1) return null;
    const o = sel[0];
    const obj = getObj(o._type, o._id);
    if (!obj) return null;

    if (o._type === 'graphic' || o._type === 'text')
      return { left: obj.get('left'), top: obj.get('top'), pageid: obj.get('pageid') };

    if (o._type === 'pin')
      return { left: obj.get('x'), top: obj.get('y'), pageid: obj.get('pageid') };

    if (o._type === 'path') {
      const pts = JSON.parse(obj.get('path'));
      const a = pts[0], b = pts[pts.length - 1];
      return {
        left: (a[1] + b[1]) / 2 + obj.get('left'),
        top: (a[2] + b[2]) / 2 + obj.get('top'),
        pageid: obj.get('pageid')
      };
    }
    return null;
  };

  const findClosestHome = (homes, anchor, limitLoc) => {
    let best = null;
    Object.entries(homes).forEach(([loc, h]) => {
      if (limitLoc && loc !== limitLoc) return;
      const d = distance(h, anchor);
      if (!best || d < best.dist) best = { home: h, dist: d };
    });
    return best;
  };

  /*************************
   * CHAT HANDLER
   *************************/
  on('chat:message', (msg) => {
    if (msg.type !== 'api' || !/^!home\b/i.test(msg.content)) return;
    if (!playerIsGM(msg.playerid)) return;

    const args = msg.content.split(/\s+--/).slice(1);
    const flags = args.map(a => a.toLowerCase());

    let location = null;
    flags.forEach(f => { if (/^l\d+$/.test(f)) location = f.toUpperCase(); });

    let mode = 'recall';
    if (flags.includes('set')) mode = 'set';
    else if (flags.includes('all')) mode = 'all';
    else if (flags.includes('summon')) mode = 'summon';
    else if (flags.includes('convert')) mode = 'convert';
    else if (flags.includes('clear')) mode = 'clear';
    else if (flags.includes('help')) mode = 'help';

    let radius = DEFAULT_RADIUS;
    flags.forEach(f => {
      if (f.startsWith('radius|')) {
        const v = f.split('|')[1];
        if (v.endsWith('g')) {
          radius = Number(v.slice(0, -1)) * 70;
        } else {
          radius = Number(v);
        }
      }
    });

if (mode === 'help') {
  showHomeHelp();
  return;
}


    let targets = [];
    const byName = args.find(a => a.startsWith('by-name '));
    if (byName) {
      const name = byName.slice(8);
      targets = findObjs({ type: 'graphic' })
        .filter(t => (t.get('name') || '').toLowerCase().includes(name));
    } else {
      targets = (msg.selected || [])
        .map(o => getObj('graphic', o._id))
        .filter(Boolean);
    }

    if (mode === 'convert') {
      let c = 0, s = 0;
      targets.forEach(t => {
        const r = convertLegacyHomes(t);
        if (r?.converted) c++; else s++;
      });
      sendChat('TokenHome', `/w gm Converted: ${c}, Skipped: ${s}`);
      return;
    }

    if (mode === 'clear') {
      targets.forEach(t => clearHome(t, location));
      return;
    }

    if (mode === 'set') {
      targets.forEach(t => setHome(t, location || DEFAULT_LOC));
      return;
    }

if (mode === 'summon') {
  const anchor = getAnchorFromSelection(msg.selected);
  if (!anchor) return;

  const pageid = anchor.pageid;

  findObjs({ type: 'graphic', pageid }).forEach(t => {
    const homes = getHomes(t);
    const closest = findClosestHome(homes, anchor, location);
    if (!closest) return;

    if (closest.dist <= radius) {
      t.set({
        left: closest.home.left,
        top: closest.home.top,
        layer: closest.home.layer
      });
    }
  });
  return;
}

    // default recall
    targets.forEach(t => {
      const h = getHomes(t)[location || DEFAULT_LOC];
      if (!h) return;
      t.set({
        left: h.left,
        top: h.top,
        layer: h.layer
      });
    });
  });
});


{ try { throw new Error(''); } catch (e) { API_Meta.TokenHome.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.TokenHome.offset); } }
