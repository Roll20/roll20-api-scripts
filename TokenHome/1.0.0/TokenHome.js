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

  /*************************
   * ANCHOR + SUMMON
   *************************/
  const getAnchorFromSelection = (sel) => {
    if (!sel || sel.length !== 1) return null;
    const o = sel[0];
    const obj = getObj(o._type, o._id);
    if (!obj) return null;

    if (o._type === 'graphic' || o._type === 'text') {
      return { left: obj.get('left'), top: obj.get('top') };
    }
    if (o._type === 'pin') {
      return { left: obj.get('x'), top: obj.get('y') };
    }
    return null;
  };

  const findClosestHome = (homes, anchor, limitLoc) => {
    let best = null;
    Object.entries(homes).forEach(([loc, h]) => {
      if (limitLoc && loc !== limitLoc) return;
      const d = distance(h, anchor);
      if (!best || d < best.dist) {
        best = { home: h, dist: d };
      }
    });
    return best;
  };

  /*************************
   * PAGE
   *************************/
  const getPageForPlayer = (playerid) =>
    Campaign().get('playerpageid');

  /*************************
   * CHAT HANDLER
   *************************/
  on('chat:message', (msg) => {
    if (msg.type !== 'api' || !/^!home\b/i.test(msg.content)) return;
    if (!playerIsGM(msg.playerid)) return;

    const rawFlags = msg.content.split(/\s+--/).slice(1).map(f => f.toLowerCase());

    // Extract location FIRST
    let location = null;
    rawFlags.forEach(f => {
      if (/^l\d+$/.test(f)) location = f.toUpperCase();
    });

    // Determine mode (location never counts as mode)
    let mode = 'recall';
    if (rawFlags.includes('set')) mode = 'set';
    else if (rawFlags.includes('all')) mode = 'all';
    else if (rawFlags.includes('summon')) mode = 'summon';

    let radius = DEFAULT_RADIUS;
    rawFlags.forEach(f => {
      if (f.startsWith('radius|')) {
        const v = Number(f.split('|')[1]);
        if (!isNaN(v)) radius = v;
      }
    });

    const pageid = getPageForPlayer(msg.playerid);
    const page = getObj('page', pageid);
    if (!page) return;

    const grid = 70 * (page.get('snapping_increment') || 1);
    const half = grid / 2;
    const maxX = page.get('width') * grid;
    const maxY = page.get('height') * grid;
    const clamp = (v, max) => Math.max(half, Math.min(v, max - half));

    const selected = (msg.selected || [])
      .map(o => getObj('graphic', o._id))
      .filter(Boolean);

    switch (mode) {

      case 'set':
        selected.forEach(t => setHome(t, location || DEFAULT_LOC));
        break;

      case 'all':
        findObjs({ type: 'graphic', pageid }).forEach(t => {
          const h = getHomes(t)[location || DEFAULT_LOC];
          if (!h) return;
          t.set({ left: clamp(h.left, maxX), top: clamp(h.top, maxY), layer: h.layer });
        });
        break;

      case 'summon': {
        const anchor = getAnchorFromSelection(msg.selected);
        if (!anchor) return;

        findObjs({ type: 'graphic', pageid }).forEach(t => {
          const homes = getHomes(t);
          const closest = findClosestHome(homes, anchor, location);
          if (closest && closest.dist <= radius) {
            t.set({
              left: clamp(closest.home.left, maxX),
              top: clamp(closest.home.top, maxY),
              layer: closest.home.layer
            });
          }
        });
        break;
      }

      default: // recall
        selected.forEach(t => {
          const h = getHomes(t)[location || DEFAULT_LOC];
          if (!h) return;
          t.set({ left: clamp(h.left, maxX), top: clamp(h.top, maxY), layer: h.layer });
        });
    }
  });
});
