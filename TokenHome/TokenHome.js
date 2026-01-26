on('ready', () => {

  /*************************
   * CONFIG
   *************************/
  const STORAGE_ATTR = 'gmnotes';
  const DEFAULT_LOC = 'L1';
  const VALID_LAYERS = ['objects', 'map', 'gmlayer', 'walls'];

  /*************************
   * REGEX
   *************************/

  // Entire hidden storage block
  const HOME_BLOCK_REGEX =
    /<div style="display:\s*none">\s*TOKENHOME([\s\S]*?)<\/div>/i;

  // Individual home lines: L1:123,456,objects
  const HOME_LINE_REGEX =
    /^\s*(L\d+)\s*:\s*(-?\d+(?:\.\d*)?)\s*,\s*(-?\d+(?:\.\d*)?)\s*,\s*(\w+)\s*$/gim;

  /*************************
   * LOW-LEVEL HELPERS
   *************************/
   
   const extractLocation = (args) => {
  const locArg = args.find(a => /^L\d+$/i.test(a));
  return (locArg || DEFAULT_LOC).toUpperCase();
};


  const readNotes = (token) =>
    unescape(token.get(STORAGE_ATTR) || '');

  const writeNotes = (token, text) =>
    token.set(STORAGE_ATTR, escape(text));

  /*************************
   * STORAGE
   *************************/

  const getHomes = (token) => {
    const notes = readNotes(token);
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
    let notes = readNotes(token);

    // Strip old block entirely
    notes = notes.replace(HOME_BLOCK_REGEX, '');

    const lines = Object.entries(homes)
      .map(([loc, h]) =>
        `${loc}:${h.left},${h.top},${h.layer}`
      )
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

  const getHome = (token, loc) => {
    return getHomes(token)[loc];
  };

  /*************************
   * PAGE HELPERS
   *************************/

  const getPageForPlayer = (playerid) => {
    if (playerIsGM(playerid)) {
      return Campaign().get('playerpageid');
    }

    const psp = Campaign().get('playerspecificpages');
    return psp[playerid] || Campaign().get('playerpageid');
  };

  /*************************
   * CHAT COMMAND
   *************************/

  on('chat:message', (msg) => {
    if (msg.type !== 'api' || !/^!home\b/i.test(msg.content)) return;
    if (!playerIsGM(msg.playerid)) return;

    const args = msg.content.split(/\s+--/).slice(1);
let sub = (args[0] || '').trim().toLowerCase();

// If the first argument is a location (L#), it is NOT a subcommand
if (/^l\d+$/i.test(sub)) {
  sub = '';
} else {
  args.shift();
}

const loc = extractLocation(args.concat(sub));

    const pageid = getPageForPlayer(msg.playerid);
    const page = getObj('page', pageid);

    const grid = 70 * (page.get('snapping_increment') || 1);
    const half = grid / 2;
    const maxX = page.get('width') * grid;
    const maxY = page.get('height') * grid;

    const clamp = (v, max) => Math.max(half, Math.min(v, max - half));

    const selected = (msg.selected || [])
      .map(o => getObj('graphic', o._id))
      .filter(Boolean);

    switch (sub) {

      case 'set': {
        selected.forEach(t => setHome(t, loc));
        break;
      }

      case 'all': {
        findObjs({ type: 'graphic', pageid })
          .forEach(t => {
            const h = getHome(t, loc);
            if (!h) return;

            t.set({
              left: clamp(h.left, maxX),
              top: clamp(h.top, maxY),
              layer: h.layer
            });
          });
        break;
      }

      default: {
        selected.forEach(t => {
          const h = getHome(t, loc);
          if (!h) return;

          t.set({
            left: clamp(h.left, maxX),
            top: clamp(h.top, maxY),
            layer: h.layer
          });
        });
      }
    }
  });
});
