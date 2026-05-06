// Script:   TokenHome
// By:       Keith Curtis, based on a script by the Aaron
// Contact:  https://app.roll20.net/users/162065/keithcurtis

on('ready', () => {

    'use strict';
 
    const version = '1.0.1';
    log('-=> Token Home v' + version + ' is loaded. Use !home --help for documentation');
    // 1.0.1 Added Macro generation
    // 1.0.0 Debut


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
named locations on the current page. Each location records an X/Y position and
the token’s layer. Tokens can be sent back to saved locations, queried, or
summoned to a selected anchor point based on proximity.
</p>

<p>
This script is a blow-up and glow-up of a script written for me by the Aaron,
years ago. Anything about it that is broken is mine. :)
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
  <li><code>--L#</code> — Recall the selected token to a stored location. That's an L (upper or lower case), followed by an integer.</li>
  <li><code>--summon</code> — Pull tokens to a selected anchor based on proximity.</li>
  <li><code>--clear</code> — Remove stored location data from selected tokens.</li>
  <li><code>--help</code> — Open this help handout.</li>
  <li><code>--macro</code> — Creates a generic chat menu macro that you can modify — Coming in the next merge.</li>
</ul>

<hr>

<h2>Location Storage</h2>

<p>
Locations are identified by numbered slots:
<code>L1</code>, <code>L2</code>, <code>L3</code>, and higher.
There is no fixed upper limit. This is how I use them, but you can use whatever
location logic works for you;
</p>

<ul>
  <li><strong>L1</strong> — Typically used as the token’s default location</li>
  <li><strong>L2</strong> — Commonly used for Residence</li>
  <li><strong>L3</strong> — Commonly used for Work</li>
  <li><strong>L4</strong> — Commonly used for Encounter</li>
</ul>

<p>Each stored location records:</p>

<ul>
  <li>X position (pixels)</li>
  <li>Y position (pixels)</li>
  <li>Token layer</li>
</ul>

<hr>

<h2>Set Command</h2>

<p><strong>Format:</strong></p>
<pre>
!home --set --L#
</pre>

<p>
Stores the selected token’s current position and layer into location <code>L N</code>.
</p>

<h3>Rules</h3>

<ul>
  <li>Any number of tokens can be selected</li>
  <li>Existing data for that location is overwritten</li>
  <li>Page ID is not stored</li>
</ul>

<h3>Examples</h3>

<ul>
  <li><code>!home --set --L1</code> — <em>Set default location</em></li>
  <li><code>!home --set --L2</code> — <em>Set residence</em></li>
  <li><code>!home --set --L5</code> — <em>Set custom location</em></li>
</ul>

<hr>

<h2>Recall Command</h2>

<p><strong>Format:</strong></p>
<pre>
!home --L#
</pre>

<p>
Moves the selected token to the stored location <code>L N</code>.
</p>

<h3>Rules</h3>

<ul>
  <li>Any number of tokens can be selected</li>
  <li>If the location does not exist, the command aborts</li>
  <li>The token’s layer is restored</li>
</ul>

<h3>Examples</h3>

<ul>
  <li><code>!home --L1</code></li>
  <li><code>!home --L3</code></li>
</ul>

<hr>

<h2>Summon Command</h2>

<p>
The <strong>summon</strong> command pulls tokens toward a selected anchor object
based on proximity to their stored locations.
</p>

<p><strong>Format:</strong></p>
<pre>
!home --summon [--L#] [--r pixels or grid squares]
</pre>

<p>
If no value is given, pixels are assumed. Use <code>g</code> for grid squares.
</p>

<p>Examples of valid radius values:</p>

<ul>
  <li><code>--r300</code> = 300 pixels</li>
  <li><code>--r5g</code> = 5 grid squares</li>
</ul>

<h3>Anchor Selection</h3>

<p>Exactly one object must be selected. That object can be a:</p>

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
  <li><code>--L#</code> — Restrict the summon to a specific stored location</li>
  <li><code>--r|pixels</code> — Maximum distance from the anchor (default: 70)</li>
</ul>

<h3>Behavior</h3>

<ul>
  <li>If <code>--L#</code> is supplied, only that location is tested</li>
  <li>If omitted, all stored locations are considered</li>
  <li>The closest matching location is used per token</li>
  <li>Distance is measured from the stored location, not current token position</li>
  <li>Tokens outside the radius are ignored</li>
</ul>

<h3>Examples</h3>

<ul>
  <li><code>!home --summon</code></li>
  <li><code>!home --summon --r|210</code></li>
  <li><code>!home --summon --L2</code></li>
  <li><code>!home --summon --L4 --r|140</code></li>
</ul>

<hr>

<h2>Clear Command</h2>

<p><strong>Format:</strong></p>
<pre>
!home --clear [--L#]
</pre>

<ul>
  <li>If <code>--L#</code> is supplied, only that location is removed</li>
  <li>If omitted, all stored locations are removed</li>
</ul>

<hr>

<h2>Chat Menu Macro</h2>

<p>
I use a macro for most of these commands, which has buttons for up to 4 locations.
The macro labels these as default, residence, work, and encounter, but you can
name these however you wish.
</p>

<p>You can create this sample macro with the command <code>!home --macro:</code></p>

<pre>
/w gm &amp;{template:default} {{name=Token Home}}{{Default=[Set](!home --set --l1) [Go](!home --l1) [Near](!home --summon --l1) [Radius](!home --summon --l1 --radius|?&#123;Input number of pixels})}}{{Residence=[Set](!home --set --l2) [Go](!home --l2) [Near](!home --summon --l2) [Radius](!home --summon --l2 --radius|?&#123;Input number of pixels})}}{{Work=[Set](!home --set --l3) [Go](!home --l3) [Near](!home --summon --l3) [Radius](!home --summon --l3 --radius|?&#123;Input number of pixels})}}{{Encounter=[Set](!home --set --l4) [Go](!home --l4) [Near](!home --summon --l4) [Radius](!home --summon --l4 --radius|?&#123;Input number of pixels})}}{{Summon Any=[Near](!home --summon) [Within X Pixels](!home --summon --radius|?&#123;Input number of pixels})}}
</pre>
<img src="https://files.d20.io/images/485725676/-y-CvAKaHHdifhVIPt-WLg/original.png">

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
    else if (flags.includes('macro')) mode = 'macro';

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

if (mode === 'macro') {

  const MACRO_NAME = "Token Home";

  const MACRO_ACTION = `/w gm &{template:default} {{name=Token Home}}{{Default=[Set](!home --set --l1) [Go](!home --l1) [Near](!home --summon --l1) [Radius](!home --summon --l1 --radius|?&#123;Input number of pixels})}}{{Residence=[Set](!home --set --l2) [Go](!home --l2) [Near](!home --summon --l2) [Radius](!home --summon --l2 --radius|?&#123;Input number of pixels})}}{{Work=[Set](!home --set --l3) [Go](!home --l3) [Near](!home --summon --l3) [Radius](!home --summon --l3 --radius|?&#123;Input number of pixels})}}{{Encounter=[Set](!home --set --l4) [Go](!home --l4) [Near](!home --summon --l4) [Radius](!home --summon --l4 --radius|?&#123;Input number of pixels})}}{{Summon Any=[Near](!home --summon) [Within X Pixels](!home --summon --radius|?&#123;Input number of pixels})}}`;

  let macro = findObjs({
    type: 'macro',
    name: MACRO_NAME
  })[0];

  if (!macro) {
    macro = createObj('macro', {
      name: MACRO_NAME,
      action: MACRO_ACTION,
      visibleto: 'gm',
      playerid: msg.playerid
    });
  } else {
    macro.set({
      action: MACRO_ACTION,
      visibleto: 'gm'
    });
  }

  sendChat('TokenHome',
    `/w gm <div style="background:#e6e6e6;border:1px solid #b0b0b0;border-radius:6px;padding:8px 12px;font-size:13px;"><b>Token Home</b><br>Macro created/updated.</div>`
  );

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
