// Script:   TokenHome
// By:       Keith Curtis, based on a script by the Aaron
// Contact:  https://app.roll20.net/users/162065/keithcurtis
var API_Meta = API_Meta || {}; //eslint-disable-line no-var
API_Meta.TokenHome = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.TokenHome.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - 6); } }

on('ready', () => {

    const version = '1.0.0'; //version number set here
    log('-=> TokenHome v' + version + ' is loaded. Use !home --help for documentation.');
    //1.0.0 Debut

  /*****************
   * CONFIG
   *****************/
  const STORAGE_ATTR = 'gmnotes';
  const HOME_BLOCK_REGEX = /<div style="display:\s*none"\s+data-tokenhomes="true">([\s\S]*?)<\/div>/i;
  const LEGACY_HOME_REGEX = /<div style="display:\s*none">\s*home:\s*(-?\d+(?:\.\d*)?)\s*[,|]\s*(-?\d+(?:\.\d*)?)\s*<\/div>/i;

  const VALID_LAYERS = ['objects', 'map', 'gmlayer'];
  const DEFAULT_LOCATION = 'L1';
  const DEFAULT_RADIUS = 300;

  const HOME_HELP_NAME = "Help: Token Home";
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
  <li><code>--L#</code> — Recall the selected token to a stored location.</li>
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
!home --set --L#
</pre>

<p>
Stores the selected token’s current position and layer into location <code>L#(integer)</code>.
</p>

<h3>Rules</h3>

<ul>
  <li>Exactly one token must be selected</li>
  <li>Existing data for that location is overwritten</li>
  <li>Page ID is not stored</li>
</ul>

<h3>Examples</h3>

<ul>
  <li><code>!home --set --L1</code> — Set default location</li>
  <li><code>!home --set --L2</code> — Set residence</li>
  <li><code>!home --set --L5</code> — Set custom location</li>
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
  <li>Exactly one token must be selected</li>
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
!home --summon [--L#] [--r pixels]
</pre>

<h3>Anchor Selection</h3>

<p>
Exactly one object of any of the following types must be selected:
</p>

<ul>
  <li>Token</li>
  <li>Text object</li>
  <li>Map pin</li>
  <li>Door</li>
  <li>Window</li>
</ul>

<p>
The selected object’s X/Y position is used as the summon target.
</p>

<h3>Optional Arguments</h3>

<ul>
  <li>
    <code>--L#/code><br>
    Restrict the summon to a specific stored location.
  </li>
  <li>
    <code>--radius|pixels</code><br>
    Maximum distance from the anchor.
    Default: <code>300</code>.
    Alternatively, the radius may be expressed in grid squares:
    Default: <code>5g</code>.
  </li>
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
  <li><code>!home --summon --radius|210</code></li>
  <li><code>!home --summon --L1</code></li>
  <li><code>!home --summon --L4 --radius|140</code></li>
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

<h2>General Rules</h2>

<ul>
  <li>All commands are GM-only</li>
  <li>Commands operate only on the current page</li>
  <li>Tokens may be placed outside page bounds</li>
  <li>Invalid arguments abort the command</li>
</ul>
`;


  /*****************
   * UTILS
   *****************/

  function handleHelp(msg) {
    if (msg.type !== "api") return;

    let handout = findObjs(
      {
        _type: "handout",
        name: HOME_HELP_NAME
      })[0];

    if (!handout) {
      handout = createObj("handout",
        {
          name: HOME_HELP_NAME,
          archived: false
        });
      handout.set("avatar", HOME_HELP_AVATAR);
    }

    handout.set("notes", HOME_HELP_TEXT);

    const link = `http://journal.roll20.net/handout/${handout.get("_id")}`;

    const box = `
<div style="background:#111; padding:10px; border:1px solid #555; border-radius:6px; color:#eee;">
  <div style="font-size:110%; font-weight:bold; margin-bottom:5px;">Token Home Help</div>
  <a href="${link}" target="_blank" style="color:#9fd3ff; font-weight:bold;">Open Help Handout</a>
</div>`.trim().replace(/\r?\n/g, '');

    sendChat("Token Home", `/w gm ${box}`);
  }





  const processInlinerolls = (msg) => {
    if (!msg.inlinerolls) return msg.content;
    return msg.inlinerolls
      .reduce((m, v, k) => {
        let ti = v.results.rolls.reduce((m2, v2) => {
          if (v2.table) {
            m2.push(v2.results.map(r => r.tableItem.name).join(', '));
          }
          return m2;
        }, []).join(', ');
        return [...m, { k: `$[[${k}]]`, v: ti || v.results.total || 0 }];
      }, [])
      .reduce((m, o) => m.replace(o.k, o.v), msg.content);
  };

  const keyFormat = (t) => (t && t.toLowerCase().replace(/\s+/g, '')) || undefined;
  const isKeyMatch = (k, s) => s && s.includes(k);
  const matchKey = (keys, subject) =>
    subject && keys.some(k => isKeyMatch(k, subject));

  const getPageForPlayer = (playerid) => {
    let player = getObj('player', playerid);
    if (playerIsGM(playerid)) {
      return player.get('lastpage') || Campaign().get('playerpageid');
    }
    let psp = Campaign().get('playerspecificpages');
    return psp[playerid] || Campaign().get('playerpageid');
  };

  const distance = (a, b) =>
    Math.hypot(a.left - b.left, a.top - b.top);

  /*****************
   * STORAGE
   *****************/
  const readGMNotes = (token) => unescape(token.get(STORAGE_ATTR) || '');
  const writeGMNotes = (token, text) => token.set(STORAGE_ATTR, escape(text));

  const getStoredHomes = (token) => {
    let notes = readGMNotes(token);

    let m = notes.match(HOME_BLOCK_REGEX);
    if (m) {
      try {
        return JSON.parse(m[1]);
      } catch (e) {
        log(`TokenHomes: JSON parse failed on ${token.get('name')}`);
        return {};
      }
    }

    let legacy = notes.match(LEGACY_HOME_REGEX);
    if (legacy) {
      let homes = {
        L1: {
          left: Number(legacy[1]),
          top: Number(legacy[2]),
          layer: token.get('layer')
        }
      };
      saveHomes(token, homes, true);
      return homes;
    }

    return {};
  };

  const saveHomes = (token, homes, removeLegacy = false) => {
    let notes = readGMNotes(token);
    notes = notes.replace(HOME_BLOCK_REGEX, '');
    if (removeLegacy) notes = notes.replace(LEGACY_HOME_REGEX, '');

    let block =
      `<div style="display:none" data-tokenhomes="true">` +
      JSON.stringify(homes) +
      `</div>`;

    writeGMNotes(token, notes + block);
  };

  const getHome = (token, loc) => {
    let homes = getStoredHomes(token);
    return homes[loc];
  };

  const setHome = (token, loc) => {
    let homes = getStoredHomes(token);
    homes[loc] = {
      left: token.get('left'),
      top: token.get('top'),
      layer: VALID_LAYERS.includes(token.get('layer'))
        ? token.get('layer')
        : 'objects'
    };
    saveHomes(token, homes, true);
  };


  const clearHome = (token, loc) => {
    if (!token || !loc) return;

    let notes = readGMNotes(token);
    let match = notes.match(HOME_BLOCK_REGEX);
    if (!match) return;

    let homes;
    try {
      homes = JSON.parse(match[1]);
    } catch (e) {
      log(`TokenHome: JSON parse failed on ${token.get('name')}`);
      return;
    }

    if (!homes[loc]) return;

    delete homes[loc];

    // Remove existing home block
    notes = notes.replace(HOME_BLOCK_REGEX, '');

    // If locations remain, re-save; otherwise leave block removed
    if (Object.keys(homes).length) {
      saveHomes(token, homes);
    } else {
      writeGMNotes(token, notes);
    }
  };


  const clearAllHomes = (token) => {
    if (!token) return;

    let notes = readGMNotes(token);
    if (!HOME_BLOCK_REGEX.test(notes)) return;

    notes = notes.replace(HOME_BLOCK_REGEX, '');
    writeGMNotes(token, notes);
  };




  /*****************
   * MOVE TOKEN
   *****************/
  const moveToHome = (token, home) => {
    token.set({
      left: home.left,
      top: home.top,
      layer: home.layer
    });
  };

  /*****************
   * SUMMON LOGIC
   *****************/
  const getAnchorFromSelection = (sel) => {
    if (!sel || sel.length !== 1) return null;

    const o = sel[0];
    const obj = getObj(o._type, o._id);
    if (!obj) return null;

    // Graphics and text
    if (o._type === 'graphic' || o._type === 'text') {
      return {
        left: obj.get('left'),
        top: obj.get('top'),
        pageid: obj.get('pageid')
      };
    }

    // Pins
    if (o._type === 'pin') {
      return {
        left: obj.get('x'),
        top: obj.get('y'),
        pageid: obj.get('pageid')
      };
    }

    // Doors and windows (line midpoint)
    if (o._type === 'door' || o._type === 'window') {
      const x = obj.get('x');
      const y = obj.get('y');
      const path = obj.get('path');

      if (!path || !path.handle0 || !path.handle1) return null;

      const p0x = x + path.handle0.x;
      const p0y = y + path.handle0.y;
      const p1x = x + path.handle1.x;
      const p1y = y + path.handle1.y;

      return {
        left: (p0x + p1x) / 2,
        top: (p0y + p1y) / (-2),
        pageid: obj.get('pageid')
      };
    }

    return null;
  };

  const findClosestHome = (homes, anchor, limitToLoc) => {
    let best = null;
    Object.entries(homes).forEach(([loc, home]) => {
      if (limitToLoc && loc !== limitToLoc) return;
      let d = distance(home, anchor);
      if (!best || d < best.dist) {
        best = { home, dist: d };
      }
    });
    return best;
  };

  /*****************
   * CHAT HANDLER
   *****************/
  on('chat:message', (msg) => {
    if (
      msg.type !== 'api' ||
      !/^!home(\b|\s)/i.test(msg.content) ||
      !playerIsGM(msg.playerid)
    ) return;

    let who = (getObj('player', msg.playerid) || { get: () => 'API' })
      .get('_displayname');

    let args = processInlinerolls(msg).split(/\s+--/).slice(1);
    let flags = args.map(a => a.split(/\s+/)[0].toLowerCase());

    // Help
    if (flags.includes('help')) {
      handleHelp(msg);
      return;
    }

    let location = null;
    const locFlag = flags.find(f => /^l\d+$/.test(f));
    if (locFlag) location = locFlag.toUpperCase();


    let radius = DEFAULT_RADIUS;
    let rArg = args.find(a => a.toLowerCase().startsWith('radius|'));

    if (rArg) {
      let val = rArg.split('|')[1].toLowerCase();

      if (val.endsWith('g')) {
        let units = Number(val.slice(0, -1));
        if (!isNaN(units)) {
          let pageid = getPageForPlayer(msg.playerid);
          let page = getObj('page', pageid);
          if (page) {
            radius = units * 70 * (page.get('snapping_increment') || 1);
          }
        }
      } else {
        let px = Number(val);
        if (!isNaN(px)) radius = px;
      }
    }



    let mode =
      flags.includes('summon') ? 'summon' :
        flags.includes('set') ? 'set' :
          flags.includes('clear') ? 'clear' :
            flags.includes('all') ? 'all' :
              flags.includes('by-name') ? 'by-name' :
                'default';

    let pid = getPageForPlayer(msg.playerid);

    const getSelectedTokens = () =>
      (msg.selected || [])
        .map(o => getObj('graphic', o._id))
        .filter(Boolean);

    switch (mode) {

      case 'set': {
        getSelectedTokens().forEach(t => setHome(t, location || DEFAULT_LOCATION));
        break;
      }

      case 'all': {
        findObjs({ type: 'graphic', pageid: pid })
          .forEach(t => {
            let home = getHome(t, location || DEFAULT_LOCATION);
            if (home) moveToHome(t, home);
          });
        break;
      }

      case 'by-name': {
        let keys = args.slice(1).map(keyFormat).filter(Boolean);
        if (!keys.length) {
          sendChat('Token Home', `/w "${who}" Supply name fragments after --by-name`);
          return;
        }

        findObjs({ type: 'graphic', pageid: pid })
          .filter(t => matchKey(keys, keyFormat(t.get('name'))))
          .forEach(t => {
            let home = getHome(t, location || DEFAULT_LOCATION);
            if (home) moveToHome(t, home);
          });
        break;
      }

      case 'summon': {
        let anchor = getAnchorFromSelection(msg.selected);
        if (!anchor || anchor.pageid !== pid) {
          sendChat('Token Home', `/w "${who}" Select exactly one anchor on the current page.`);
          return;
        }

        findObjs({ type: 'graphic', pageid: pid }).forEach(t => {
          let homes = getStoredHomes(t);
          let closest = findClosestHome(homes, anchor, location);
          if (closest && closest.dist <= radius) {
            moveToHome(t, closest.home);
          }
        });
        break;
      }

      case 'clear': {
        let tokens = getSelectedTokens();
        if (!tokens.length) {
          sendChat(
            'Token Home',
            `/w "${who}" Select one or more tokens to clear stored locations.`
          );
          return;
        }

        tokens.forEach(t => {
          if (location) {
            clearHome(t, location);
          } else {
            clearAllHomes(t);
          }
        });
        break;
      }


      default: {
        let tokens = getSelectedTokens();
        if (!tokens.length) {
          sendChat('Token Home',
            `/w "${who}" <b>Usage:</b> !home [--set|--all|--by-name|--summon] [--lN] [--r #]`);
          return;
        }
        tokens.forEach(t => {
          let home = getHome(t, location || DEFAULT_LOCATION);
          if (home) moveToHome(t, home);
        });
      }
    }
  });
});

{ try { throw new Error(''); } catch (e) { API_Meta.TokenHome.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.TokenHome.offset); } }
