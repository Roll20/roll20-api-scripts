// Script:   Align
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
// Changelog
// 1.1.0 Added tokenpage controls
// 1.1.1 Added redefining controls to tokenpage containers and cleaned up menu
// 1.1.2 Rebuilt on the standard framework; Token Page merged into !align (!tokenpage still works) and moved to a
//       legacy submenu. Fixed page-size math on non-1 grids, Tile, snap confirm/cancel and undo coverage.
//       Added Gap, Snap in Place, Grid Block, Circle, Arc, Rotate (90/45/180, with or without facing), Face/Leader,
//       Swap (plus player swap macro), Shuffle and Redo. Scatter no longer overlaps tokens. Selection memory
//       restores dropped selections. GM settings card. Help moved to a handout.

const Align = (() => {
  'use strict';

  // Config
  const scriptName = 'Align';
  const version = '1.1.2';
  const lastUpdate = 1794686338;
  const schemaVersion = 1.1;
  const DEBUG = false;

  const PX = 70;                  // pixels per page unit (independent of grid size)
  const UNDO_DEPTH = 10;
  const HELP_HANDOUT = 'Help: Align';

  // Text-style marker: keeps symbols that also exist as emoji (↩ ↪ ↖ ↗ ↘ ↙ ⚙) drawn as plain glyphs
  const VS15 = '︎';
  const G = {
    undo: '↩' + VS15, redo: '↪' + VS15, gear: '⚙' + VS15,
    nw: '↖' + VS15, ne: '↗' + VS15, se: '↘' + VS15, sw: '↙' + VS15
  };

  // Settings (state.Align.config) and their allowed values
  const DEFAULT_SETTINGS = { facing: 'up', selectionSeconds: 5, access: 'gm', showTokenPage: true, quiet: false };
  const SETTING_VALUES = {
    facing: ['up', 'down', 'left', 'right'],
    selectionSeconds: [0, 3, 5, 10],
    access: ['gm', 'all'],
    showTokenPage: [true, false],
    quiet: [true, false]
  };
  // Compass angle (clockwise from up) for a direction name
  const COMPASS = { up: 0, right: 90, down: 180, left: 270 };
  const HELP_AVATAR = 'https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147';

  // Token Page layout constants
  const TP = {
    margins: { top: 5, right: 15, bottom: 15, left: 15 },
    boxGrid: 10,                  // box edges snap to this many px
    stagger: 8,
    labelGap: 5,
    minOverlap: 16,               // px² needed to treat an old box as the one being replaced
    overlapFraction: 0.20         // ...and at least this fraction of the smaller box
  };

  const DEFAULT_BOX_STYLE = { fill: '#fce5cd', fill_opacity: 0.3, stroke: '#660000', stroke_width: 1, stroke_opacity: 1 };
  const DEFAULT_LABEL_STYLE = { font_size: 24, font_family: 'Arial', color: '#000000', text_align: 'center', bold: false, italic: false };

  // CSS
  const CSS = {
    container: 'position:relative;left:-20px;width:100%;border:1px solid #111;background:#ddd;color:#111;padding:6px;margin:4px;border-radius:6px;font-size:13px;line-height:1.5;',
    confirm: 'position:relative;left:-20px;width:100%;border:1px solid #111;background:#fdf1dc;color:#111;padding:6px;margin:4px;border-radius:6px;font-size:13px;line-height:1.5;',
    title: 'width:100%;border:none;background:#444;padding:1px;margin-bottom:5px;border-radius:4px;font-size:14px;line-height:1.5;color:#eee;font-weight:bold;text-align:center;',
    sectionTitle: 'width:100%;border:none;background:#444;padding:1px;margin:8px 0 5px 0;border-radius:4px;font-size:14px;line-height:1.5;color:#eee;font-weight:bold;text-align:center;',
    row: 'margin:1px 0;',
    label: 'display:inline-block;font-weight:bold;margin:4px 6px 0 0;width:70px;',
    button: 'box-shadow:inset 0px 1px 3px 0px #555;background:linear-gradient(to bottom, #333 5%, #555 100%);background-color:#444;border-radius:4px;min-width:10px;text-align:center;border:1px solid #566963;display:inline-block;cursor:pointer;color:#eee;font-size:13px;font-weight:bold;padding:1px 5px;margin:1px;text-decoration:none;text-shadow:0px -1px 0px #2b665e;',
    buttonText: 'color:#eee;',
    helpButton: 'float:right;padding:0 6px;margin:0 4px 0 0;',
    buttonOn: 'background:#2b665e;border-color:#9fd3c7;',
    inlineLabel: 'margin:0 1px 0 3px;',
    settingBlock: 'margin:0 0 6px 0;padding:0 0 4px 0;border-bottom:1px solid #bbb;',
    settingName: 'font-weight:bold;',
    settingDesc: 'font-size:11px;line-height:1.35;color:#333;margin:0 0 2px 0;',
    historyButton: 'float:left;padding:0 6px;margin:0 0 0 4px;',
    legacyRow: 'margin-top:6px;',
    notice: 'background:#fdf1dc;border:1px solid #b08850;border-radius:4px;padding:3px 5px;margin:0 0 5px 0;font-size:12px;line-height:1.4;',
    helpBox: 'background:#111;padding:10px;border:1px solid #555;border-radius:6px;color:#eee;',
    helpBoxTitle: 'font-size:110%;font-weight:bold;margin-bottom:5px;',
    helpBoxLink: 'color:#9fd3ff;font-weight:bold;'
  };

  // Logger
  const Logger = {
    log: (msg) => log(`${scriptName} | ${msg}`),
    debug: (msg) => { if (DEBUG) log(`${scriptName} [DEBUG] | ${msg}`); },
    error: (msg) => log(`${scriptName} [ERROR] | ${msg}`)
  };

  // State
  const State = {

    initialize: () => {
      const cur = state[scriptName];
      if (cur && cur.version === schemaVersion) return;

      Logger.log(`Updating schema to v${schemaVersion}`);
      const fresh = {
        version: schemaVersion,
        config: Object.assign({ boxStyle: null, labelStyle: null, labelPosition: 'above' }, DEFAULT_SETTINGS),
        undo: {},
        pendingSnap: {},
        containers: {}
      };

      switch (cur && cur.version) {
        case 1.0:
          // State 1.0 (pre-release test builds) → 1.1: keep everything, add settings
          cur.config = Object.assign({}, DEFAULT_SETTINGS, cur.config || {});
          cur.version = schemaVersion;
          break;

        case undefined:
          // Up to 1.1.1: unversioned Align state plus separate TokenPageOrganizer state
          if (cur && cur.undo) fresh.undo = cur.undo;
          if (state.TokenPageOrganizer) {
            const old = state.TokenPageOrganizer;
            if (old.boxStyle) fresh.config.boxStyle = old.boxStyle;
            if (old.labelStyle) fresh.config.labelStyle = old.labelStyle;
            if (old.defaultLabelPosition) fresh.config.labelPosition = old.defaultLabelPosition;
          }
          /* falls through */
        default:
          state[scriptName] = fresh;
          break;
      }
    },

    get: () => state[scriptName],
    config: () => state[scriptName].config,

    getBoxStyle: () => Object.assign({}, DEFAULT_BOX_STYLE, State.config().boxStyle || {}),
    getLabelStyle: () => Object.assign({}, DEFAULT_LABEL_STYLE, State.config().labelStyle || {}),
    getLabelPosition: () => State.config().labelPosition || 'above',

    setting: (key) => {
      const v = State.config()[key];
      return v === undefined ? DEFAULT_SETTINGS[key] : v;
    },

    // Compass angle the token art points to at rotation 0
    artOffset: () => COMPASS[State.setting('facing')] || 0,

    // Live container entries for a page; drops entries whose box was deleted
    getContainers: (pageid) => {
      const all = State.get().containers;
      const list = (all[pageid] || []).filter(c => getObj('pathv2', c.box));
      all[pageid] = list;
      return list;
    }
  };

  // Parser
  const Parser = {
    parse: (content) => {
      const parts = content.trim().split(/\s+--/);
      const command = (parts.shift() || '').trim().split(/\s+/)[0].toLowerCase();
      const list = parts.map(p => {
        const m = p.trim().match(/^([^|\s]+)([|\s])?([\s\S]*)$/);
        if (!m) return null;
        const key = m[1].toLowerCase();
        let values = [];
        if (m[2] === '|') values = m[3].split('|').map(s => s.trim());
        else if (m[2]) values = [m[3].trim()];
        return { key, values };
      }).filter(Boolean);
      const args = {};
      list.forEach(a => { args[a.key] = a.values; });
      return { command, args, list };
    }
  };

  // Output
  const Output = {

    whisperTarget: (playerid) => {
      const p = getObj('player', playerid);
      return p ? p.get('_displayname') : 'gm';
    },

    // Raw @{...} in a message makes Roll20 try to resolve it when the script sends it, and the send fails.
    whisper: (playerid, html) => {
      if (html.includes('@{')) Logger.error('Raw @{ in outgoing message; use &#64;{ instead.');
      sendChat(scriptName, `/w "${Output.whisperTarget(playerid)}" ${html}`, null, { noarchive: true });
    },

    box: (inner, style = CSS.container) => `<div style="${style}">${inner}</div>`,

    // Feedback messages. Quiet mode hides them all; they still go to the API console.
    notice: (playerid, text) => {
      if (State.setting('quiet')) return Logger.log(`(quiet) ${text}`);
      Output.whisper(playerid, Output.box(text));
    },

    button: (label, cmd, extraStyle = '', title = '') =>
      `<a style="${CSS.button}${extraStyle}" href="${cmd}"${title ? ` title="${title}"` : ''}>${label}</a>`,

    // Journal links get forced to pink by the VTT unless the label is wrapped
    journalButton: (label, url) =>
      `<a style="${CSS.button}" href="${url}"><span style="${CSS.buttonText}">${label}</span></a>`,

    row: (label, buttons) => `<div style="${CSS.row}"><span style="${CSS.label}">${label}</span>${buttons}</div>`
  };

  // Token geometry helpers
  const TokenUtils = {

    num: (v, fallback = 0) => {
      const n = parseFloat(v);
      return isNaN(n) ? fallback : n;
    },

    rect: (o) => {
      const left = TokenUtils.num(o.get('left'));
      const top = TokenUtils.num(o.get('top'));
      const w = TokenUtils.num(o.get('width'));
      const h = TokenUtils.num(o.get('height'));
      return { cx: left, cy: top, w, h, left: left - w / 2, right: left + w / 2, top: top - h / 2, bottom: top + h / 2 };
    },

    // Width/height as seen on screen, using the nearest 90° of rotation. Read-only.
    effectiveSize: (g) => {
      const r = ((TokenUtils.num(g.get('rotation')) % 360) + 360) % 360;
      const q = Math.round(r / 90) * 90 % 180;
      const w = TokenUtils.num(g.get('width'));
      const h = TokenUtils.num(g.get('height'));
      return q === 90 ? { w: h, h: w } : { w, h };
    },

    gridPx: (page) => (TokenUtils.num(page.get('snapping_increment'), 1) || 1) * PX,
    pageWidthPx: (page) => TokenUtils.num(page.get('width')) * PX,
    pageHeightPx: (page) => TokenUtils.num(page.get('height')) * PX,

    selectedGraphics: (msg) => (msg.selected || [])
      .filter(s => s._type === 'graphic')
      .map(s => getObj('graphic', s._id))
      .filter(Boolean),

    rand: (min, max) => (max <= min ? min : min + Math.random() * (max - min)),

    // Smaller than one grid square on both sides: snaps by center, like the VTT
    isSmall: (w, h, grid) => w < grid && h < grid,

    // Grid-snapped center for a token of size w×h whose center is at (cx, cy).
    snapCenter: (cx, cy, w, h, grid) => {
      if (TokenUtils.isSmall(w, h, grid)) {
        return {
          x: Math.floor(cx / grid) * grid + grid / 2,
          y: Math.floor(cy / grid) * grid + grid / 2
        };
      }
      return {
        x: Math.round((cx - w / 2) / grid) * grid + w / 2,
        y: Math.round((cy - h / 2) / grid) * grid + h / 2
      };
    },

    bbox: (rects) => ({
      left: Math.min(...rects.map(r => r.left)),
      right: Math.max(...rects.map(r => r.right)),
      top: Math.min(...rects.map(r => r.top)),
      bottom: Math.max(...rects.map(r => r.bottom))
    }),

    // Reading order: cluster into rows by center Y, then left to right
    readingOrder: (tokens) => {
      const items = tokens.map(t => ({ t, r: TokenUtils.rect(t) })).sort((a, b) => a.r.cy - b.r.cy);
      const avgH = items.reduce((s, i) => s + i.r.h, 0) / (items.length || 1);
      const rows = [];
      items.forEach(it => {
        let row = rows.find(r => Math.abs(r.y - it.r.cy) <= avgH * 0.6);
        if (!row) rows.push(row = { y: it.r.cy, items: [] });
        row.items.push(it);
      });
      rows.sort((a, b) => a.y - b.y);
      return [].concat(...rows.map(r => r.items.sort((a, b) => a.r.cx - b.r.cx).map(i => i.t)));
    },

    normDeg: (d) => ((d % 360) + 360) % 360
  };

  // Selection memory (in-memory only)
  const Selection = (() => {
    const last = {}; // playerid: { selected: [{_type,_id}], time }

    const copy = (sel) => sel.map(s => ({ _type: s._type, _id: s._id }));

    const resolve = (msg, opts = {}) => {
      const pid = msg.playerid;
      const now = Date.now();
      const current = msg.selected || [];
      const prev = last[pid];
      const windowMs = TokenUtils.num(State.setting('selectionSeconds')) * 1000;
      const fresh = windowMs > 0 && prev && now - prev.time <= windowMs;
      const alive = fresh ? prev.selected.filter(s => getObj(s._type, s._id)) : [];

      const useCurrent = () => {
        if (current.length) last[pid] = { selected: copy(current), time: now };
        else delete last[pid];
        return msg;
      };

      if (!alive.length) return useCurrent();
      if (current.length && opts.exact) return useCurrent();
      const ids = alive.map(s => s._id);
      if (current.some(s => !ids.includes(s._id))) return useCurrent();

      prev.selected = alive;
      prev.time = now;
      return Object.assign({}, msg, { selected: alive });
    };

    return { resolve };
  })();

  // Undo / redo (per player: position, size, rotation)
  const Undo = (() => {
    const redoStacks = {};

    const capture = (objs) => objs.map(o => {
      const type = o.get('_type');
      const snap = { id: o.id, type, left: o.get('left'), top: o.get('top') };
      if (type === 'graphic') {
        snap.width = o.get('width');
        snap.height = o.get('height');
        snap.rotation = o.get('rotation');
      }
      return snap;
    });

    // Current state of the objects a snapshot refers to
    const captureIds = (snapshot) => capture(snapshot
      .map(s => getObj(s.type || 'graphic', s.id))
      .filter(Boolean));

    const restore = (snapshot) => snapshot.forEach(s => {
      const o = getObj(s.type || 'graphic', s.id);
      if (!o) return;
      const props = { left: s.left, top: s.top };
      if (s.width !== undefined) props.width = s.width;
      if (s.height !== undefined) props.height = s.height;
      if (s.rotation !== undefined) props.rotation = s.rotation;
      o.set(props);
    });

    const pushUndo = (playerid, snapshot) => {
      const all = State.get().undo;
      const stack = all[playerid] = all[playerid] || [];
      stack.push(snapshot);
      while (stack.length > UNDO_DEPTH) stack.shift();
    };

    return {
      // Record objects before a move; a new move clears the redo history
      push: (playerid, objs) => {
        if (!playerid || !objs || !objs.length) return;
        pushUndo(playerid, capture(objs));
        delete redoStacks[playerid];
      },

      pop: (playerid) => {
        const stack = State.get().undo[playerid];
        if (!stack || !stack.length) return Output.notice(playerid, 'Nothing to undo.');
        const snapshot = stack.pop();
        const redo = redoStacks[playerid] = redoStacks[playerid] || [];
        redo.push(captureIds(snapshot));
        while (redo.length > UNDO_DEPTH) redo.shift();
        restore(snapshot);
      },

      redo: (playerid) => {
        const redo = redoStacks[playerid];
        if (!redo || !redo.length) return Output.notice(playerid, 'Nothing to redo.');
        const snapshot = redo.pop();
        pushUndo(playerid, captureIds(snapshot));
        restore(snapshot);
      }
    };
  })();

  // Align / distribute / spacing / stack
  const Arrange = {

    align: (playerid, tokens, mode) => {
      if (tokens.length < 2) return Output.notice(playerid, 'Select two or more tokens to align.');
      const rects = tokens.map(TokenUtils.rect);
      const avg = (k) => rects.reduce((s, r) => s + r[k], 0) / rects.length;
      Undo.push(playerid, tokens);

      switch (mode) {
        case 'left': {
          const v = Math.min(...rects.map(r => r.left));
          tokens.forEach((t, i) => t.set('left', v + rects[i].w / 2));
          break;
        }
        case 'right': {
          const v = Math.max(...rects.map(r => r.right));
          tokens.forEach((t, i) => t.set('left', v - rects[i].w / 2));
          break;
        }
        case 'top': {
          const v = Math.min(...rects.map(r => r.top));
          tokens.forEach((t, i) => t.set('top', v + rects[i].h / 2));
          break;
        }
        case 'bottom': {
          const v = Math.max(...rects.map(r => r.bottom));
          tokens.forEach((t, i) => t.set('top', v - rects[i].h / 2));
          break;
        }
        case 'center': {
          const x = avg('cx'), y = avg('cy');
          tokens.forEach(t => t.set({ left: x, top: y }));
          break;
        }
        case 'center-x': {
          const x = avg('cx');
          tokens.forEach(t => t.set('left', x));
          break;
        }
        case 'center-y': {
          const y = avg('cy');
          tokens.forEach(t => t.set('top', y));
          break;
        }
        default:
          Output.notice(playerid, `Unknown align mode "${mode}".`);
      }
    },

    distribute: (playerid, tokens, mode) => {
      if (tokens.length < 3) return Output.notice(playerid, 'Select three or more tokens to distribute.');
      const items = tokens.map(t => ({ t, r: TokenUtils.rect(t) }));

      // center: interpolate both axes, ordered along the axis with the larger spread
      if (mode === 'center') {
        const spreadX = Math.max(...items.map(i => i.r.cx)) - Math.min(...items.map(i => i.r.cx));
        const spreadY = Math.max(...items.map(i => i.r.cy)) - Math.min(...items.map(i => i.r.cy));
        const key = spreadX >= spreadY ? 'cx' : 'cy';
        items.sort((a, b) => a.r[key] - b.r[key]);
        const first = items[0].r, last = items[items.length - 1].r;
        const n = items.length - 1;
        Undo.push(playerid, tokens);
        items.forEach((it, i) => {
          if (i === 0 || i === n) return;
          it.t.set({
            left: first.cx + (last.cx - first.cx) * i / n,
            top: first.cy + (last.cy - first.cy) * i / n
          });
        });
        return;
      }

      const edges = {
        left: { sort: 'cx', edge: 'left', prop: 'left', off: r => r.w / 2 },
        right: { sort: 'cx', edge: 'right', prop: 'left', off: r => -r.w / 2 },
        'center-x': { sort: 'cx', edge: 'cx', prop: 'left', off: () => 0 },
        top: { sort: 'cy', edge: 'top', prop: 'top', off: r => r.h / 2 },
        bottom: { sort: 'cy', edge: 'bottom', prop: 'top', off: r => -r.h / 2 },
        'center-y': { sort: 'cy', edge: 'cy', prop: 'top', off: () => 0 }
      };
      const spec = edges[mode];
      if (!spec) return Output.notice(playerid, `Unknown distribute mode "${mode}".`);

      items.sort((a, b) => a.r[spec.sort] - b.r[spec.sort]);
      const start = items[0].r[spec.edge];
      const end = items[items.length - 1].r[spec.edge];
      const step = (end - start) / (items.length - 1);
      Undo.push(playerid, tokens);
      items.forEach((it, i) => {
        if (i === 0 || i === items.length - 1) return;
        it.t.set(spec.prop, start + step * i + spec.off(it.r));
      });
    },

    spacing: (playerid, tokens, axis) => {
      if (tokens.length < 3) return Output.notice(playerid, 'Select three or more tokens to space.');
      const horiz = axis === 'horizontal';
      if (!horiz && axis !== 'vertical') return Output.notice(playerid, `Unknown spacing axis "${axis}".`);

      const items = tokens.map(t => ({ t, r: TokenUtils.rect(t) }));
      items.sort((a, b) => horiz ? a.r.cx - b.r.cx : a.r.cy - b.r.cy);
      const size = r => horiz ? r.w : r.h;
      const total = items.reduce((s, i) => s + size(i.r), 0);
      const minEdge = horiz ? items[0].r.left : items[0].r.top;
      const maxEdge = horiz ? items[items.length - 1].r.right : items[items.length - 1].r.bottom;
      const space = maxEdge - minEdge - total;
      if (space < 0) return Output.notice(playerid, 'Not enough room between the outer tokens to space them without overlap. Spread them out first.');

      const gap = space / (items.length - 1);
      let pos = minEdge;
      Undo.push(playerid, tokens);
      items.forEach(it => {
        const s = size(it.r);
        it.t.set(horiz ? 'left' : 'top', pos + s / 2);
        pos += s + gap;
      });
    },

    // Stacking order only; positions are unchanged so no undo entry
    stack: (playerid, tokens, direction) => {
      const dirs = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
      if (!dirs.includes(direction)) return Output.notice(playerid, `Unknown stack direction "${direction}".`);
      const [vert, horiz] = direction.split('-');
      const sorted = tokens.slice().sort((a, b) => {
        const ra = TokenUtils.rect(a), rb = TokenUtils.rect(b);
        const dy = vert === 'top' ? rb.cy - ra.cy : ra.cy - rb.cy;
        const dx = horiz === 'left' ? rb.cx - ra.cx : ra.cx - rb.cx;
        return dy || dx;
      });
      sorted.forEach(t => toFront(t));
    }
  };

  // Scatter
  const Scatter = {

    run: (playerid, tokens, page, mode, snap) => {
      if (!tokens.length) return;
      let bounds;
      if (mode === 'area') {
        const rects = tokens.map(TokenUtils.rect);
        bounds = {
          left: Math.min(...rects.map(r => r.left)),
          right: Math.max(...rects.map(r => r.right)),
          top: Math.min(...rects.map(r => r.top)),
          bottom: Math.max(...rects.map(r => r.bottom))
        };
      } else {
        bounds = { left: 0, top: 0, right: TokenUtils.pageWidthPx(page), bottom: TokenUtils.pageHeightPx(page) };
      }

      const grid = TokenUtils.gridPx(page);
      const pageBounds = { left: 0, top: 0, right: TokenUtils.pageWidthPx(page), bottom: TokenUtils.pageHeightPx(page) };

      // Random upper-left within bounds; on grid lines when snapping and there is room for it
      const pickAxis = (min, max, size) => {
        const lo = min, hi = max - size;
        if (snap) {
          const gLo = Math.ceil(lo / grid), gHi = Math.floor(hi / grid);
          if (gHi >= gLo) return (gLo + Math.floor(Math.random() * (gHi - gLo + 1))) * grid;
        }
        return TokenUtils.rand(lo, Math.max(lo, hi));
      };

      // Unselected tokens on the token layer are obstacles; map and GM layers are ignored
      const selectedIds = tokens.map(t => t.id);
      const placed = findObjs({ _type: 'graphic', _pageid: page.id, layer: 'objects' })
        .filter(o => !selectedIds.includes(o.id))
        .map(o => { const r = TokenUtils.rect(o); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; });
      const EPS = 0.5;
      const overlaps = (r) => placed.some(p =>
        r.left < p.right - EPS && r.right > p.left + EPS && r.top < p.bottom - EPS && r.bottom > p.top + EPS);
      const rectAt = (x, y, w, h) => ({ left: x, top: y, right: x + w, bottom: y + h });

      // Every free upper-left position for a w×h token within b (grid lines when snapping, half squares otherwise)
      const freeSpots = (b, w, h) => {
        const step = snap ? grid : grid / 2;
        const spots = [];
        for (let y = Math.ceil(b.top / step) * step; y + h <= b.bottom + EPS; y += step) {
          for (let x = Math.ceil(b.left / step) * step; x + w <= b.right + EPS; x += step) {
            if (!overlaps(rectAt(x, y, w, h))) spots.push({ x, y });
          }
        }
        return spots;
      };

      // Free spot inside the bounds, then widen one grid square at a time while staying on the page
      const findFree = (w, h) => {
        let b = Object.assign({}, bounds);
        for (;;) {
          const spots = freeSpots(b, w, h);
          if (spots.length) return spots[Math.floor(Math.random() * spots.length)];
          const covers = b.left <= pageBounds.left && b.top <= pageBounds.top &&
            b.right >= pageBounds.right && b.bottom >= pageBounds.bottom;
          if (covers) return null;
          b = {
            left: Math.max(pageBounds.left, b.left - grid),
            top: Math.max(pageBounds.top, b.top - grid),
            right: Math.min(pageBounds.right, b.right + grid),
            bottom: Math.min(pageBounds.bottom, b.bottom + grid)
          };
        }
      };

      Undo.push(playerid, tokens);

      // Pass 1: random positions; tokens that find no free spot are set aside
      const leftovers = [];
      tokens.forEach(t => {
        const { w, h } = TokenUtils.rect(t);
        for (let attempt = 0; attempt < 50; attempt++) {
          const r = rectAt(pickAxis(bounds.left, bounds.right, w), pickAxis(bounds.top, bounds.bottom, h), w, h);
          if (!overlaps(r)) {
            placed.push(r);
            t.set({ left: r.left + w / 2, top: r.top + h / 2 });
            return;
          }
        }
        leftovers.push(t);
      });

      // Pass 2: set-aside tokens go to known free spots
      let crowded = 0;
      leftovers.forEach(t => {
        const { w, h } = TokenUtils.rect(t);
        let spot = findFree(w, h);
        if (!spot) {
          crowded++;
          spot = { x: pickAxis(bounds.left, bounds.right, w), y: pickAxis(bounds.top, bounds.bottom, h) };
        }
        placed.push(rectAt(spot.x, spot.y, w, h));
        t.set({ left: spot.x + w / 2, top: spot.y + h / 2 });
      });

      if (crowded) {
        Output.notice(playerid, `Not enough free space on the page for ${crowded} token${crowded === 1 ? '' : 's'}; ${crowded === 1 ? 'it overlaps' : 'they overlap'} other tokens.`);
      }
    }
  };

  // Snap to grid (lays tokens out in rows or columns from the page's top-left)
  const Snap = {

    sortFor: (tokens, direction) => tokens.slice().sort((a, b) => {
      const ra = TokenUtils.rect(a), rb = TokenUtils.rect(b);
      return direction === 'horizontal' ? (ra.cx - rb.cx) || (ra.cy - rb.cy) : (ra.cy - rb.cy) || (ra.cx - rb.cx);
    }),

    plan: (tokens, spaces, page, direction) => {
      const grid = TokenUtils.gridPx(page);
      const pageW = TokenUtils.pageWidthPx(page);
      const pageH = TokenUtils.pageHeightPx(page);
      const pad = grid;
      const gap = spaces * grid;
      const horiz = direction === 'horizontal';

      let main = pad, cross = pad, lineSize = 0, wrapped = false;
      const limit = horiz ? pageW - pad : pageH - pad;
      const positions = [];

      tokens.forEach(t => {
        const { w, h } = TokenUtils.rect(t);
        const along = horiz ? w : h;
        const across = horiz ? h : w;
        if (main > pad && main + along > limit) {
          cross += lineSize + gap;
          main = pad;
          lineSize = 0;
          wrapped = true;
        }
        positions.push(horiz
          ? { t, left: main + w / 2, top: cross + h / 2 }
          : { t, left: cross + w / 2, top: main + h / 2 });
        main += along + gap;
        lineSize = Math.max(lineSize, across);
      });

      const requiredW = Math.max(...positions.map(p => p.left + TokenUtils.rect(p.t).w / 2)) + pad;
      const requiredH = Math.max(...positions.map(p => p.top + TokenUtils.rect(p.t).h / 2)) + pad;
      return { positions, wrapped, requiredW, requiredH, overflow: requiredW > pageW || requiredH > pageH };
    },

    request: (playerid, tokens, spaces, page, direction) => {
      if (!['horizontal', 'vertical'].includes(direction)) return Output.notice(playerid, `Unknown snap direction "${direction}".`);
      if (isNaN(spaces) || spaces < 0) return Output.notice(playerid, 'Snap needs a number of grid squares (0 or more).');
      if (tokens.length < 2) return Output.notice(playerid, 'Select two or more tokens to snap.');

      const sorted = Snap.sortFor(tokens, direction);
      const plan = Snap.plan(sorted, spaces, page, direction);
      if (!plan.wrapped && !plan.overflow) return Snap.apply(playerid, plan, page);

      State.get().pendingSnap[playerid] = { ids: sorted.map(t => t.id), spaces, direction, pageid: page.id };
      const what = [plan.wrapped ? 'wrap tokens to a new row or column' : '', plan.overflow ? 'expand the page' : '']
        .filter(Boolean).join(' and ');
      Output.whisper(playerid, Output.box(
        `<div style="${CSS.title}">SNAP: Confirmation Required</div>` +
        `<div>This snap will ${what}. Continue?</div>` +
        Output.button('Confirm', '!align --confirmSnap') +
        Output.button('Cancel', '!align --snapcancel'),
        CSS.confirm));
    },

    apply: (playerid, plan, page) => {
      Undo.push(playerid, plan.positions.map(p => p.t));
      plan.positions.forEach(p => p.t.set({ left: p.left, top: p.top }));
      if (!plan.overflow) return;

      if (!playerIsGM(playerid)) {
        Output.notice(playerid, 'Tokens extend past the page edge. Ask the GM to enlarge the page.');
        return;
      }
      const newW = Math.max(TokenUtils.num(page.get('width')), Math.ceil(plan.requiredW / PX));
      const newH = Math.max(TokenUtils.num(page.get('height')), Math.ceil(plan.requiredH / PX));
      page.set({ width: newW, height: newH });
      Output.notice(playerid, `Page enlarged to ${newW} × ${newH} units to fit snapped tokens.`);
    },

    confirm: (playerid) => {
      const pending = State.get().pendingSnap[playerid];
      delete State.get().pendingSnap[playerid];
      const page = pending && getObj('page', pending.pageid);
      const tokens = pending ? pending.ids.map(id => getObj('graphic', id)).filter(Boolean) : [];
      if (!page || tokens.length < 2) return Output.notice(playerid, 'No pending snap operation found.');
      Snap.apply(playerid, Snap.plan(tokens, pending.spaces, page, pending.direction), page);
    },

    cancel: (playerid) => {
      delete State.get().pendingSnap[playerid];
      Output.notice(playerid, 'Snap canceled.');
    }
  };

  // Tile (edge-to-edge layout of graphics, rows inferred from rough placement)
  const Tile = {

    run: (playerid, graphics) => {
      if (graphics.length < 2) return Output.notice(playerid, 'Select two or more graphics to tile.');

      const items = graphics.map(g => {
        const size = TokenUtils.effectiveSize(g);
        const cx = TokenUtils.num(g.get('left')), cy = TokenUtils.num(g.get('top'));
        return { g, size, ul: { x: cx - size.w / 2, y: cy - size.h / 2 } };
      });

      // Layer comes from the graphic nearest the page origin
      const key = items.reduce((best, it) =>
        (it.ul.x * it.ul.x + it.ul.y * it.ul.y) < (best.ul.x * best.ul.x + best.ul.y * best.ul.y) ? it : best);
      const layer = key.g.get('layer');
      const tiles = items.filter(it => it.g.get('layer') === layer);
      if (tiles.length < 2) return Output.notice(playerid, 'No other selected graphics are on the same layer as the top-left one.');

      // Cluster into rows by upper-left Y
      tiles.sort((a, b) => a.ul.y - b.ul.y);
      const avgH = tiles.reduce((s, t) => s + t.size.h, 0) / tiles.length;
      const threshold = avgH * 0.6;
      const rows = [];
      tiles.forEach(t => {
        let row = rows.find(r => Math.abs(r.y - t.ul.y) <= threshold);
        if (!row) rows.push(row = { y: t.ul.y, items: [] });
        row.items.push(t);
      });
      rows.sort((a, b) => a.y - b.y);
      rows.forEach(r => r.items.sort((a, b) => a.ul.x - b.ul.x));

      // The first tile of the first row stays put; everything else lays out from it
      const origin = rows[0].items[0].ul;
      Undo.push(playerid, tiles.map(t => t.g));
      let cursorY = origin.y;
      rows.forEach(row => {
        let cursorX = origin.x;
        let rowH = 0;
        row.items.forEach(({ g, size }) => {
          g.set({ left: cursorX + size.w / 2, top: cursorY + size.h / 2 });
          cursorX += size.w;
          rowH = Math.max(rowH, size.h);
        });
        cursorY += rowH;
      });
    }
  };

  // Starting layouts for grid-mode rotation (in memory only).
  const RotationMemory = (() => {
    const entries = {};   // key: { base: [{x,y}], pivot: {x,y}, angle, last: [{x,y}] }
    const order = [];
    const MAX = 30;

    const keyOf = (tokens) => tokens.map(t => t.id).sort().join(',');

    // One step clockwise (dir 1) or counterclockwise (dir -1) around the square ring at Chebyshev radius r
    const ringStep = (x, y, r, dir) => {
      if (dir > 0) {
        if (y === -r && x < r) return [x + 1, y];
        if (x === r && y < r) return [x, y + 1];
        if (y === r && x > -r) return [x - 1, y];
        return [x, y - 1];
      }
      if (y === -r && x > -r) return [x - 1, y];
      if (x === -r && y < r) return [x, y + 1];
      if (y === r && x < r) return [x + 1, y];
      return [x, y - 1];
    };

    // 45° clockwise in grid terms: r steps around the ring
    const ring45 = (dx, dy) => {
      const r = Math.max(Math.abs(dx), Math.abs(dy));
      let p = [dx, dy];
      for (let i = 0; i < r; i++) p = ringStep(p[0], p[1], r, 1);
      return p;
    };

    // Exact turn by a multiple of 90° (screen coordinates, clockwise positive)
    const turn90 = (dx, dy, quarters) => {
      let x = dx, y = dy;
      for (let i = 0; i < ((quarters % 4) + 4) % 4; i++) [x, y] = [-y, x];
      return [x, y];
    };

    const near = (a, b) => a.length === b.length && a.every((p, i) => Math.abs(p.x - b[i].x) < 0.5 && Math.abs(p.y - b[i].y) < 0.5);

    return {
      turn: (tokens, rects, grid, a) => {
        const key = keyOf(tokens);
        const ids = tokens.map(t => t.id);
        const current = rects.map(r => ({ x: r.cx, y: r.cy }));
        let e = entries[key];
        // Entries store positions in sorted-id order; map to this call's order
        const sortedIds = ids.slice().sort();
        const toCall = (list) => ids.map(id => list[sortedIds.indexOf(id)]);
        const toStore = (list) => sortedIds.map(id => list[ids.indexOf(id)]);

        if (!e || !near(toCall(e.last), current)) {
          const bb = TokenUtils.bbox(rects);
          const mx = (bb.left + bb.right) / 2, my = (bb.top + bb.bottom) / 2;
          e = {
            base: toStore(current),
            sizes: toStore(rects.map(r => ({ w: r.w, h: r.h }))),
            pivot: { x: Math.round((mx - grid / 2) / grid) * grid + grid / 2, y: Math.round((my - grid / 2) / grid) * grid + grid / 2 },
            angle: 0,
            last: toStore(current)
          };
          entries[key] = e;
          order.push(key);
          while (order.length > MAX) delete entries[order.shift()];
        }

        e.angle = TokenUtils.normDeg(e.angle + a);
        const quarters = Math.floor(e.angle / 90);
        const extra45 = e.angle % 90 === 45;
        const base = toCall(e.base), sizes = toCall(e.sizes);

        return base.map((b, i) => {
          const { w, h } = sizes[i];
          // Exact multiple of 90° about the pivot square's center
          const [qx, qy] = turn90(b.x - e.pivot.x, b.y - e.pivot.y, quarters);
          let x = e.pivot.x + qx, y = e.pivot.y + qy;
          if (!extra45) return { x, y };
          // One more 45° step, using the token's top-left square for tokens larger than one square
          const small = TokenUtils.isSmall(w, h, grid) || (Math.abs(w - grid) < 0.5 && Math.abs(h - grid) < 0.5);
          const cellX = small ? x : x - w / 2 + grid / 2;
          const cellY = small ? y : y - h / 2 + grid / 2;
          const [rx, ry] = ring45(Math.round((cellX - e.pivot.x) / grid), Math.round((cellY - e.pivot.y) / grid));
          const nx = e.pivot.x + rx * grid, ny = e.pivot.y + ry * grid;
          return small ? { x: nx, y: ny } : { x: nx - grid / 2 + w / 2, y: ny - grid / 2 + h / 2 };
        });
      },

      // Remember where the last turn put the tokens, so the next turn can continue from the same start
      record: (tokens, pos) => {
        const e = entries[keyOf(tokens)];
        if (!e) return;
        const ids = tokens.map(t => t.id);
        e.last = ids.slice().sort().map(id => {
          const p = pos[ids.indexOf(id)];
          return { x: Math.round(p.x * 100) / 100, y: Math.round(p.y * 100) / 100 };
        });
      }
    };
  })();

  // Snap in place, fixed gap, grid block, circle/arc, rotate, swap
  const Formations = (() => {

    const overlaps = (a, b) => a.left < b.right - 0.5 && a.right > b.left + 0.5 && a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5;
    const rectAt = (x, y, w, h) => ({ left: x - w / 2, right: x + w / 2, top: y - h / 2, bottom: y + h / 2 });
    const round2 = (v) => Math.round(v * 100) / 100;

    // Nearest grid-aligned free spot for a snapped token, searching outward one square at a time
    const nearestFree = (p, w, h, grid, placed) => {
      if (!placed.some(q => overlaps(q, rectAt(p.x, p.y, w, h)))) return p;
      const offsets = [];
      for (let dx = -6; dx <= 6; dx++) {
        for (let dy = -6; dy <= 6; dy++) {
          if (dx || dy) offsets.push({ dx, dy, d: dx * dx + dy * dy });
        }
      }
      offsets.sort((a, b) => a.d - b.d);
      const hit = offsets.find(o => !placed.some(q => overlaps(q, rectAt(p.x + o.dx * grid, p.y + o.dy * grid, w, h))));
      return hit ? { x: p.x + hit.dx * grid, y: p.y + hit.dy * grid } : p;
    };

    const canControl = (playerid, token) => {
      if (playerIsGM(playerid)) return true;
      const ok = (cb) => String(cb || '').split(',').some(p => p === 'all' || p === playerid);
      if (ok(token.get('controlledby'))) return true;
      const ch = getObj('character', token.get('represents'));
      return !!ch && ok(ch.get('controlledby'));
    };

    // Grid spot a token occupies: its top-left corner, or for a small token the cell holding its center
    const spotOf = (r, grid) => TokenUtils.isSmall(r.w, r.h, grid)
      ? { x: Math.floor(r.cx / grid) * grid, y: Math.floor(r.cy / grid) * grid }
      : { x: r.left, y: r.top };

    const placeAt = (t, r, spot, grid) => {
      if (TokenUtils.isSmall(r.w, r.h, grid)) t.set({ left: spot.x + grid / 2, top: spot.y + grid / 2 });
      else t.set({ left: spot.x + r.w / 2, top: spot.y + r.h / 2 });
    };

    return {

      // Each token to the grid where it is. A token landing on an occupied spot is offset by half its
      snapInPlace: (pid, tokens, page) => {
        const grid = TokenUtils.gridPx(page);
        const placed = [];
        const raised = [];
        Undo.push(pid, tokens);
        TokenUtils.readingOrder(tokens).forEach(t => {
          const r = TokenUtils.rect(t);
          let p = TokenUtils.snapCenter(r.cx, r.cy, r.w, r.h, grid);
          if (placed.some(q => overlaps(q, rectAt(p.x, p.y, r.w, r.h)))) {
            p = { x: p.x + r.w / 2, y: p.y + r.h / 2 };
            raised.push(t);
          }
          placed.push(rectAt(p.x, p.y, r.w, r.h));
          t.set({ left: p.x, top: p.y });
        });
        raised.forEach(t => toFront(t));
      },

      // Fixed gap between edges along one axis; the leftmost/topmost token stays put
      gap: (pid, tokens, page, axis, squares) => {
        if (tokens.length < 2) return Output.notice(pid, 'Select two or more tokens to set the gap.');
        const horiz = axis === 'horizontal';
        if (!horiz && axis !== 'vertical') return Output.notice(pid, `Unknown gap axis "${axis}".`);
        const n = squares === '' || squares === undefined ? 0 : parseFloat(squares);
        if (isNaN(n) || n < 0) return Output.notice(pid, 'Gap must be a number of grid squares, 0 or more.');
        const gap = n * TokenUtils.gridPx(page);

        const items = tokens.map(t => ({ t, r: TokenUtils.rect(t) }))
          .sort((a, b) => horiz ? a.r.cx - b.r.cx : a.r.cy - b.r.cy);
        Undo.push(pid, tokens);
        let edge = horiz ? items[0].r.right : items[0].r.bottom;
        items.slice(1).forEach(({ t, r }) => {
          const size = horiz ? r.w : r.h;
          t.set(horiz ? 'left' : 'top', edge + gap + size / 2);
          edge += gap + size;
        });
      },

      // Rows (ranks) of equal length, back row shorter; starts at the selection's top-left
      block: (pid, tokens, page, rows, squares) => {
        const n = tokens.length;
        if (n < 2) return Output.notice(pid, 'Select two or more tokens to form a block.');
        let rowCount = parseInt(rows, 10);
        if (isNaN(rowCount) || rowCount < 1) return Output.notice(pid, 'Number of rows must be 1 or more.');
        const g = squares === '' || squares === undefined ? 0 : parseFloat(squares);
        if (isNaN(g) || g < 0) return Output.notice(pid, 'Gap must be a number of grid squares, 0 or more.');
        const gap = g * TokenUtils.gridPx(page);

        rowCount = Math.min(rowCount, n);
        const perRow = Math.ceil(n / rowCount);
        const ordered = TokenUtils.readingOrder(tokens);
        const bb = TokenUtils.bbox(tokens.map(TokenUtils.rect));

        Undo.push(pid, tokens);
        let y = bb.top;
        for (let i = 0; i < n; i += perRow) {
          let x = bb.left;
          let rowH = 0;
          ordered.slice(i, i + perRow).forEach(t => {
            const r = TokenUtils.rect(t);
            t.set({ left: x + r.w / 2, top: y + r.h / 2 });
            x += r.w + gap;
            rowH = Math.max(rowH, r.h);
          });
          y += rowH + gap;
        }
      },

      // Circle (span 360) or arc around the selection's center.
      ring: (pid, tokens, page, opts) => {
        const n = tokens.length;
        if (n < 2) return Output.notice(pid, 'Select two or more tokens to form a circle or arc.');
        const grid = TokenUtils.gridPx(page);
        const items = tokens.map(t => ({ t, r: TokenUtils.rect(t) }));
        const bb = TokenUtils.bbox(items.map(i => i.r));
        const cx = (bb.left + bb.right) / 2, cy = (bb.top + bb.bottom) / 2;

        let span = parseFloat(opts.span);
        if (isNaN(span)) span = 360;
        span = Math.max(1, Math.min(360, span));
        const full = span >= 360;
        const dirs = { up: -90, right: 0, down: 90, left: 180 };
        const mid = dirs[String(opts.toward || 'up').toLowerCase()];
        if (!full && mid === undefined) return Output.notice(pid, `Unknown arc direction "${opts.toward}".`);
        const start = full ? -90 : mid - span / 2;
        const step = full ? 360 / n : span / (n - 1);

        // Radius in grid squares, or the smallest that keeps neighbours from overlapping
        let R = parseFloat(opts.radius) * grid;
        if (isNaN(R) || R <= 0) {
          const d = Math.max(...items.map(i => Math.max(i.r.w, i.r.h)));
          const half = Math.sin((step * Math.PI / 180) / 2);
          R = half > 0.01 ? d / (2 * half) : d;
        }
        const slotAngle = (i) => start + step * i;
        const slotPos = (i) => {
          const rad = slotAngle(i) * Math.PI / 180;
          return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
        };

        // Keep the current order.
        let ordered;
        if (!full) {
          const across = {
            up: r => r.cx, down: r => -r.cx,
            right: r => r.cy, left: r => -r.cy
          }[String(opts.toward || 'up').toLowerCase()];
          ordered = items.slice().sort((a, b) => across(a.r) - across(b.r));
        } else {
          items.forEach(it => {
            it.a = TokenUtils.normDeg(Math.atan2(it.r.cy - cy, it.r.cx - cx) * 180 / Math.PI - start);
          });
          const byAngle = items.slice().sort((a, b) => a.a - b.a);
          const slots = byAngle.map((_, i) => slotPos(i));
          let best = 0, bestCost = Infinity;
          for (let s = 0; s < n; s++) {
            const cost = byAngle.reduce((sum, it, i) => {
              const p = slots[(i + s) % n];
              return sum + (p.x - it.r.cx) ** 2 + (p.y - it.r.cy) ** 2;
            }, 0);
            if (cost < bestCost) { bestCost = cost; best = s; }
          }
          ordered = new Array(n);
          byAngle.forEach((it, i) => { ordered[(i + best) % n] = it; });
        }

        Undo.push(pid, tokens);
        const placed = [];
        ordered.forEach((it, i) => {
          const theta = slotAngle(i);
          const rad = theta * Math.PI / 180;
          let p = { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
          if (opts.snap) {
            p = TokenUtils.snapCenter(p.x, p.y, it.r.w, it.r.h, grid);
            p = nearestFree(p, it.r.w, it.r.h, grid, placed);
            placed.push(rectAt(p.x, p.y, it.r.w, it.r.h));
          }
          const props = { left: round2(p.x), top: round2(p.y) };
          // theta is a screen angle (0 = right, clockwise); compass = theta + 90. Art facing setting applied.
          if (opts.turn === 'center') props.rotation = TokenUtils.normDeg(theta + 270 - State.artOffset());
          if (opts.turn === 'out') props.rotation = TokenUtils.normDeg(theta + 90 - State.artOffset());
          it.t.set(props);
        });
      },

      // Rotate the arrangement around the selection's center. Positive angles are clockwise.
      rotate: (pid, tokens, page, angle, turn) => {
        const a = parseFloat(angle);
        if (![45, -45, 90, -90, 180].includes(a)) return Output.notice(pid, 'Rotate angle must be 45, -45, 90, -90 or 180.');
        const rects = tokens.map(TokenUtils.rect);
        const grid = TokenUtils.gridPx(page);
        const snapping = TokenUtils.num(page.get('snapping_increment')) > 0;
        const onGrid = (x, y, r) => {
          const s = TokenUtils.snapCenter(x, y, r.w, r.h, grid);
          return Math.abs(s.x - x) < 0.5 && Math.abs(s.y - y) < 0.5;
        };

        let pos;
        const gridMode = snapping && rects.every(r => onGrid(r.cx, r.cy, r));
        if (gridMode) {
          pos = RotationMemory.turn(tokens, rects, grid, a);
        } else {
          const bb = TokenUtils.bbox(rects);
          const cx = (bb.left + bb.right) / 2, cy = (bb.top + bb.bottom) / 2;
          const rad = a * Math.PI / 180;
          const cos = Math.cos(rad), sin = Math.sin(rad);
          pos = rects.map(r => {
            const dx = r.cx - cx, dy = r.cy - cy;
            return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
          });
        }

        Undo.push(pid, tokens);
        tokens.forEach((t, i) => {
          const props = { left: round2(pos[i].x), top: round2(pos[i].y) };
          if (turn) props.rotation = TokenUtils.normDeg(TokenUtils.num(t.get('rotation')) + a);
          t.set(props);
        });
        if (gridMode) RotationMemory.record(tokens, pos);
      },

      // Two selected tokens, or one selected token and a target token id (player macro)
      swap: (pid, selected, page, targetId) => {
        const grid = TokenUtils.gridPx(page);
        let a, b;

        if (targetId) {
          if (selected.length !== 1) return Output.notice(pid, 'Select only your own token, then choose the token to swap with.');
          a = selected[0];
          b = getObj('graphic', targetId);
          if (!b) return Output.notice(pid, 'That target is not a token.');
          if (a.id === b.id) return Output.notice(pid, 'Choose a different token to swap with.');
          if (!canControl(pid, a)) return Output.notice(pid, 'You can only swap a token you control.');
          if (b.get('_pageid') !== a.get('_pageid')) return Output.notice(pid, 'Both tokens must be on the same page.');
          if (a.get('layer') !== 'objects' || b.get('layer') !== 'objects') return Output.notice(pid, 'Both tokens must be on the token layer.');
        } else {
          if (selected.length !== 2) return Output.notice(pid, 'Select exactly two tokens to swap.');
          [a, b] = selected;
        }

        const ra = TokenUtils.rect(a), rb = TokenUtils.rect(b);
        const sa = spotOf(ra, grid), sb = spotOf(rb, grid);
        Undo.push(pid, [a, b]);
        placeAt(a, ra, sb, grid);
        placeAt(b, rb, sa, grid);
      },

      // All selected tokens look one way on the map, allowing for the art facing setting
      face: (pid, tokens, dir) => {
        const compass = COMPASS[String(dir || '').toLowerCase()];
        if (compass === undefined) return Output.notice(pid, `Unknown facing "${dir}". Use up, down, left or right.`);
        const rotation = TokenUtils.normDeg(compass - State.artOffset());
        Undo.push(pid, tokens);
        tokens.forEach(t => t.set('rotation', rotation));
      },

      // All selected tokens take the facing of a leader token
      faceAs: (pid, tokens, leaderId) => {
        const leader = getObj('graphic', leaderId);
        if (!leader) return Output.notice(pid, 'Choose a token to match facing with.');
        const rotation = TokenUtils.normDeg(TokenUtils.num(leader.get('rotation')));
        const followers = tokens.filter(t => t.id !== leader.id);
        if (!followers.length) return Output.notice(pid, 'Select the tokens that should match the leader.');
        Undo.push(pid, followers);
        followers.forEach(t => t.set('rotation', rotation));
      },

      // Every selected token moves to a spot another selected token held; none stays put.
      shuffle: (pid, tokens, page) => {
        const n = tokens.length;
        if (n < 2) return Output.notice(pid, 'Select two or more tokens to shuffle.');
        const grid = TokenUtils.gridPx(page);
        const rects = tokens.map(TokenUtils.rect);
        const spots = rects.map(r => spotOf(r, grid));

        let perm;
        do {
          perm = tokens.map((_, i) => i);
          for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [perm[i], perm[j]] = [perm[j], perm[i]];
          }
        } while (perm.some((p, i) => p === i));

        Undo.push(pid, tokens);
        tokens.forEach((t, i) => placeAt(t, rects[i], spots[perm[i]], grid));
      }
    };
  })();

  // Token Page (grouped tokens in labeled container boxes)
  const TokenPage = {

    normalizeColor: (c) => {
      if (!c || c === 'transparent') return 'transparent';
      c = String(c).trim().toLowerCase();
      if (c.startsWith('rgb')) {
        const nums = c.match(/\d+(\.\d+)?/g);
        if (nums && nums.length >= 3) {
          return '#' + nums.slice(0, 3).map(n => Math.max(0, Math.min(255, Math.round(+n))).toString(16).padStart(2, '0')).join('');
        }
      }
      if (c.length === 9 && c.startsWith('#')) c = c.slice(0, 7);
      return c;
    },

    // Absolute extents of a pathv2 rectangle (x/y are its center)
    pathRect: (p) => {
      const x = TokenUtils.num(p.get('x'), NaN);
      const y = TokenUtils.num(p.get('y'), NaN);
      if (!isFinite(x) || !isFinite(y)) return null;
      let pts;
      try { pts = JSON.parse(p.get('points') || '[]'); } catch (e) { return null; }
      if (!Array.isArray(pts) || !pts.length) return null;
      const xs = pts.map(q => Number(q[0]) || 0), ys = pts.map(q => Number(q[1]) || 0);
      const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
      if (w <= 0 || h <= 0) return null;
      return { left: x - w / 2, right: x + w / 2, top: y - h / 2, bottom: y + h / 2, area: w * h };
    },

    defineBox: (msg) => {
      const pid = msg.playerid;
      const sel = msg.selected || [];
      const obj = sel.length === 1 ? getObj(sel[0]._type, sel[0]._id) : null;
      if (!obj || !['path', 'pathv2'].includes(obj.get('_type'))) {
        return Output.notice(pid, 'Select exactly one rectangle to define the box style.');
      }
      const d = DEFAULT_BOX_STYLE;
      State.config().boxStyle = {
        fill: obj.get('fill') || d.fill,
        fill_opacity: TokenUtils.num(obj.get('fill_opacity'), d.fill_opacity),
        stroke: obj.get('stroke') || d.stroke,
        stroke_width: TokenUtils.num(obj.get('stroke_width'), d.stroke_width),
        stroke_opacity: TokenUtils.num(obj.get('stroke_opacity'), d.stroke_opacity)
      };
      Output.notice(pid, 'Box style saved.');
    },

    defineLabel: (msg) => {
      const pid = msg.playerid;
      const sel = msg.selected || [];
      const obj = sel.length === 1 ? getObj(sel[0]._type, sel[0]._id) : null;
      if (!obj || obj.get('_type') !== 'text') {
        return Output.notice(pid, 'Select exactly one text object to define the label style.');
      }
      const d = DEFAULT_LABEL_STYLE;
      State.config().labelStyle = {
        font_size: TokenUtils.num(obj.get('font_size'), d.font_size),
        font_family: obj.get('font_family') || d.font_family,
        color: obj.get('color') || d.color,
        text_align: obj.get('text_align') || d.text_align,
        bold: !!obj.get('bold'),
        italic: !!obj.get('italic')
      };
      Output.notice(pid, `Label style saved (font: ${State.config().labelStyle.font_family}).`);
    },

    defineLabelPosition: (msg, pos) => {
      pos = (pos || '').toLowerCase();
      if (!['above', 'below'].includes(pos)) {
        return Output.notice(msg.playerid, 'Usage: !align --definelabelpos|above or --definelabelpos|below');
      }
      State.config().labelPosition = pos;
      Output.notice(msg.playerid, `Default label position set to "${pos}".`);
    },

    // Restyle every map-layer box on the page matching the selected box's colors
    updateBoxes: (msg) => {
      const pid = msg.playerid;
      const sel = msg.selected || [];
      const ref = sel.length === 1 ? getObj(sel[0]._type, sel[0]._id) : null;
      if (!ref || ref.get('_type') !== 'pathv2') {
        return Output.notice(pid, 'Select exactly one container box (pathv2 rectangle) to match from.');
      }
      const norm = TokenPage.normalizeColor;
      const refFill = norm(ref.get('fill')), refStroke = norm(ref.get('stroke'));
      const style = State.getBoxStyle();
      let count = 0;
      findObjs({ _pageid: ref.get('_pageid'), _type: 'pathv2', layer: 'map' }).forEach(r => {
        if (norm(r.get('fill')) !== refFill || norm(r.get('stroke')) !== refStroke) return;
        r.set({
          fill: style.fill, fill_opacity: style.fill_opacity,
          stroke: style.stroke, stroke_width: style.stroke_width, stroke_opacity: style.stroke_opacity
        });
        count++;
      });
      Output.notice(pid, `Updated ${count} matching boxes on this page. You may need to refresh the page for them to display correctly.`);
    },

    // Old box being replaced: tracked boxes first, then untracked boxes in the current style (pre-1.2 boxes)
    findReplaceable: (pageid, padded) => {
      const tracked = State.getContainers(pageid);
      const trackedIds = tracked.map(c => c.box);
      const style = State.getBoxStyle();
      const norm = TokenPage.normalizeColor;
      const legacy = findObjs({ _pageid: pageid, _type: 'pathv2', layer: 'map' })
        .filter(p => !trackedIds.includes(p.id) &&
          norm(p.get('fill')) === norm(style.fill) && norm(p.get('stroke')) === norm(style.stroke));

      const newArea = (padded.right - padded.left) * (padded.bottom - padded.top);
      const score = (p) => {
        const r = TokenPage.pathRect(p);
        if (!r) return 0;
        const ox = Math.max(0, Math.min(r.right, padded.right) - Math.max(r.left, padded.left));
        const oy = Math.max(0, Math.min(r.bottom, padded.bottom) - Math.max(r.top, padded.top));
        const area = ox * oy;
        return (area >= TP.minOverlap && area >= TP.overlapFraction * Math.min(newArea, r.area)) ? area : 0;
      };
      const best = (list) => list.reduce((acc, p) => {
        const s = score(p);
        return s > acc.s ? { p, s } : acc;
      }, { p: null, s: 0 }).p;

      const trackedBest = best(trackedIds.map(id => getObj('pathv2', id)).filter(Boolean));
      if (trackedBest) return { box: trackedBest, entry: tracked.find(c => c.box === trackedBest.id) };
      const legacyBest = best(legacy);
      return legacyBest ? { box: legacyBest, entry: null } : null;
    },

    createBox: (pageid, padded) => {
      const style = State.getBoxStyle();
      const w = padded.right - padded.left, h = padded.bottom - padded.top;
      return createObj('pathv2', {
        _pageid: pageid,
        layer: 'map',
        shape: 'rec',
        points: JSON.stringify([[0, 0], [w, h]]),
        x: padded.left + w / 2,
        y: padded.top + h / 2,
        fill: style.fill, fill_opacity: style.fill_opacity,
        stroke: style.stroke, stroke_width: style.stroke_width, stroke_opacity: style.stroke_opacity
      });
    },

    group: (msg, opts) => {
      const pid = msg.playerid;
      if (!playerIsGM(pid)) return Output.notice(pid, 'Only the GM may group tokens.');

      const objs = (msg.selected || []).map(s => getObj(s._type, s._id)).filter(Boolean);
      const tokens = objs.filter(o => o.get('_type') === 'graphic' && o.get('_subtype') === 'token' && o.get('layer') === 'objects');
      const selectedLabel = objs.find(o => o.get('_type') === 'text');
      if (!tokens.length) return Output.notice(pid, 'No tokens on the token layer found in the selection.');

      const pageid = tokens[0].get('_pageid');
      const page = getObj('page', pageid);
      if (!page) return;
      const gridPx = TokenUtils.gridPx(page);
      const g = TP.boxGrid;

      const sorted = tokens.slice().sort((a, b) => {
        const ra = TokenUtils.rect(a), rb = TokenUtils.rect(b);
        return (ra.cx - rb.cx) || (ra.cy - rb.cy);
      });

      // Anchor: first token's upper-left snapped to the box grid
      const first = TokenUtils.rect(sorted[0]);
      const baseLeftEdge = Math.floor(first.left / g) * g;
      const baseTopEdge = Math.floor(first.top / g) * g;
      const xOffset = TokenUtils.num(opts.xoffset);
      const yOffset = TokenUtils.num(opts.yoffset);

      const undoObjs = tokens.slice();
      if (selectedLabel) undoObjs.push(selectedLabel);

      // Row with alternating vertical stagger
      const positions = [];
      sorted.forEach((t, i) => {
        const { w, h } = TokenUtils.rect(t);
        const prev = positions[i - 1];
        const left = i === 0
          ? baseLeftEdge + w / 2 + xOffset
          : prev.left + prev.w / 2 + gridPx / 4 + w / 2;
        const topEdge = baseTopEdge + (i % 2 === 1 ? -TP.stagger : TP.stagger) + yOffset;
        positions.push({ t, left, top: topEdge + h / 2, w, h });
      });

      const bbox = positions.reduce((b, p) => ({
        left: Math.min(b.left, p.left - p.w / 2),
        right: Math.max(b.right, p.left + p.w / 2),
        top: Math.min(b.top, p.top - p.h / 2),
        bottom: Math.max(b.bottom, p.top + p.h / 2)
      }), { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });

      const m = TP.margins;
      const padded = {
        left: Math.floor((bbox.left - m.left) / g) * g,
        right: Math.ceil((bbox.right + m.right) / g) * g,
        top: Math.floor((bbox.top - m.top) / g) * g,
        bottom: Math.ceil((bbox.bottom + m.bottom) / g) * g
      };

      // Find the box being replaced (and its label) before anything moves
      const old = TokenPage.findReplaceable(pageid, padded);
      const oldLabel = old && old.entry && old.entry.label ? getObj('text', old.entry.label) : null;
      if (oldLabel && !selectedLabel) undoObjs.push(oldLabel);
      Undo.push(pid, undoObjs);

      positions.forEach(p => p.t.set({ left: p.left, top: p.top }));

      if (old) {
        const list = State.getContainers(pageid);
        State.get().containers[pageid] = list.filter(c => c.box !== old.box.id);
        old.box.remove();
      }
      const box = TokenPage.createBox(pageid, padded);
      if (!box) return Output.notice(pid, 'Could not create the container box.');

      // Label: selected text object, else the replaced box's label, else a new one if --label was given
      const ls = State.getLabelStyle();
      const labelText = (typeof opts.label === 'string' && opts.label.length) ? opts.label : null;
      const position = String(opts.labelposition || State.getLabelPosition()).toLowerCase() === 'below' ? 'below' : 'above';
      let label = selectedLabel || oldLabel || null;

      if (label || labelText) {
        const fontSize = label ? TokenUtils.num(label.get('font_size'), ls.font_size) : ls.font_size;
        const cx = padded.left + (padded.right - padded.left) / 2;
        const top = position === 'above'
          ? padded.top - fontSize / 2 - TP.labelGap
          : padded.bottom + fontSize / 2 + TP.labelGap;
        const props = {
          left: cx, top, layer: 'objects',
          font_size: fontSize, font_family: ls.font_family, color: ls.color,
          text_align: ls.text_align, bold: ls.bold, italic: ls.italic
        };
        if (labelText) props.text = labelText;
        if (label) label.set(props);
        else label = createObj('text', Object.assign({ _pageid: pageid, text: labelText }, props));
      }

      const list = State.getContainers(pageid);
      list.push({ box: box.id, label: label ? label.id : null });
      State.get().containers[pageid] = list;
    }
  };

  // Help (handout for the GM, matching PinTool / Supernotes / Chronicle)
  const HELP_TEXT = `
<h1>Align Script Help</h1>

<p>
Align arranges selected tokens and graphics on the tabletop. It can align them to an edge or center,
distribute them evenly, set the gaps between them, put them on the grid, change their stacking order, tile map
images edge to edge, scatter them randomly, arrange them in blocks, circles and arcs, rotate an arrangement, and
swap or shuffle tokens, and set which way tokens face. Most moves can be undone and redone.
</p>

<p><strong>Base Command:</strong> <code>!align</code> (opens the menu)</p>

<ul>
  <li>Select the tokens first, then click a menu button or type the command.</li>
  <li>Arguments can be written <code>--key|value</code> or <code>--key value</code>.</li>
  <li>By default only the GM can use Align. The GM can open it to all players in Settings. Players can only move tokens they can select. Settings, Token Page commands and page resizing are always GM only. A player with access who clicks <strong>?</strong> is given access to this handout.</li>
</ul>

<h2>Menu</h2>

<p>
The menu is whispered to whoever types <code>!align</code>. In the title bar, <strong>↩&#xFE0E;</strong> undoes and
<strong>↪&#xFE0E;</strong> redoes your last move, <strong>?</strong> opens this handout, and (for the GM only)
<strong>⚙&#xFE0E;</strong> opens Settings. Each row of the menu matches a section below. Buttons that need a value
(a gap, a radius, a number of rows) ask for it when clicked; the most common choice comes first, so pressing Enter
accepts it. The GM can also show a <strong>Token Page Commands</strong> button, which opens a separate menu of
legacy commands.
</p>
<p>
When player access is set to GM only, a player who types <code>!align</code> gets a short card with a single
<strong>Swap</strong> button instead of the menu. The button asks them to choose the token to trade places with.
</p>

<h2>Settings</h2>

<p><strong>Format:</strong> <code>!align --settings</code> (the <strong>⚙&#xFE0E;</strong> button, GM only)</p>
<p>The settings card shows each setting with its current value highlighted. Clicking a value saves it and redraws the card.</p>
<ul>
  <li><strong>Art faces</strong> — <code>up</code> (default), <code>down</code>, <code>left</code> or <code>right</code>: which way token artwork points at rotation 0. Face and Circle/Arc facing use it. It applies to the whole campaign; tokens drawn facing another way will be off by the difference.</li>
  <li><strong>Selection memory</strong> — <code>0</code> (off), <code>3</code>, <code>5</code> (default) or <code>10</code> seconds. See Selection Memory below.</li>
  <li><strong>Player access</strong> — <code>gm</code> (default) or <code>all</code>. Swap Two and the swap macro always work for players.</li>
  <li><strong>Token Page button</strong> — Show (default) or hide the legacy Token Page Commands button. The commands work either way.</li>
  <li><strong>Quiet mode</strong> — Off (default) or on. On hides all Align messages, including error messages such as "Select two or more tokens", for everyone. With it on, a command that can't run does nothing visible; the message still goes to the API console. Menus, the help link, Settings and the To Grid confirmation still appear.</li>
</ul>
<p>Settings can also be typed: <code>!align --set|facing|down</code>, <code>!align --set|selectionSeconds|10</code>, <code>!align --set|access|all</code>, <code>!align --set|showTokenPage|false</code>, <code>!align --set|quiet|true</code>.</p>

<h2>Selection Memory</h2>

<p>
The tabletop often drops all or part of the selection after tokens are moved, especially with many tokens
selected. Align remembers the tokens your last command used. If you run another command within 5 seconds (or the
time set in Settings) and the selection is empty, or every selected token was part of that group, Align uses the
whole group again. Each command restarts the timer, so a sequence of commands works as long as there is no pause
longer than that. Setting it to Off turns selection memory off.
</p>
<ul>
  <li>Selecting any token that wasn't in the group starts a new selection right away.</li>
  <li>To work on part of a group on purpose, wait until the time has passed after your last command before running the next one. Selecting the tokens by hand usually takes that long anyway.</li>
  <li>Swap Two and the player swap macro always use exactly what is selected.</li>
</ul>

<h2>Align</h2>

<p><strong>Format:</strong> <code>!align --align|MODE</code> — needs two or more tokens.</p>
<ul>
  <li><code>left</code> — Align left edges to the leftmost edge.</li>
  <li><code>right</code> — Align right edges to the rightmost edge.</li>
  <li><code>top</code> — Align top edges to the topmost edge.</li>
  <li><code>bottom</code> — Align bottom edges to the bottommost edge.</li>
  <li><code>center</code> — Move all tokens to the average of their centers (stacks them on one point).</li>
  <li><code>center-x</code> — Align centers to the average horizontal position.</li>
  <li><code>center-y</code> — Align centers to the average vertical position.</li>
</ul>

<h2>Distribute</h2>

<p><strong>Format:</strong> <code>!align --distribute|MODE</code> — needs three or more tokens.</p>
<p>The first and last tokens stay where they are. The others are placed at even steps between them.</p>
<ul>
  <li><code>left</code>, <code>right</code>, <code>top</code>, <code>bottom</code> — Even steps measured by that edge.</li>
  <li><code>center-x</code> — Even steps between horizontal centers.</li>
  <li><code>center-y</code> — Even steps between vertical centers.</li>
  <li><code>center</code> — Even steps along the straight line from the first token's center to the last token's center, moving tokens on both axes. "First" and "last" are taken along whichever axis the tokens are more spread out on.</li>
</ul>

<h2>Spacing</h2>

<p><strong>Format:</strong> <code>!align --distributespacing|horizontal</code> or <code>|vertical</code> — needs three or more tokens.</p>
<p>
Makes the gaps between tokens equal, keeping the outer edges of the first and last tokens in place.
Different-sized tokens get the same gap between their edges. If the tokens are too close together to fit
without overlapping, nothing moves and a short message explains why.
</p>

<h2>Gap</h2>

<p><strong>Format:</strong> <code>!align --gap|AXIS|SQUARES</code> — needs two or more tokens.</p>
<p>
Sets a fixed gap of <code>SQUARES</code> grid squares between the edges of neighboring tokens (fractions allowed,
0 means touching). The leftmost token (<code>horizontal</code>) or topmost token (<code>vertical</code>) stays put
and the rest are placed after it in order. Only the chosen axis changes: tokens keep their positions on the other
axis. To get a straight row, run Align top (or left) first.
</p>

<h2>To Grid</h2>

<p><strong>Format:</strong> <code>!align --snap|AXIS|SPACES</code></p>
<p>
Lays the selected tokens out from the top-left corner of the page, one grid square in from the edge,
in a row (<code>horizontal</code>) or a column (<code>vertical</code>), with <code>SPACES</code> empty grid
squares between them. Horizontal rows are filled left to right; vertical columns top to bottom.
Tokens are taken in their current order: left to right for horizontal, top to bottom for vertical.
</p>
<p>
When a row or column reaches the page edge it wraps to a new one. If the layout would wrap or extend past the
page, Align asks for confirmation first. If you confirm, the GM's page is enlarged to fit. Players can confirm
the layout but cannot enlarge the page.
</p>

<h2>Snap in Place</h2>

<p><strong>Format:</strong> <code>!align --snapinplace</code> (the <strong>In Place</strong> button)</p>
<p>
Moves each selected token onto the grid where it already is, without rearranging anything. A token's top-left
corner goes to the nearest grid intersection. A token smaller than one grid square has its center put in the
middle of the square it is over, as the tabletop does.
</p>
<p>
If two tokens would land on the same spot, the later one (in reading order) is offset by half its size to the
right and down, and drawn above the other, so neither is hidden.
</p>

<h2>Stack</h2>

<p><strong>Format:</strong> <code>!align --zindex|DIRECTION</code></p>
<p>
Changes stacking order so that tokens nearer the named corner are drawn on top. Tokens do not move.
<code>DIRECTION</code> is <code>top-left</code>, <code>top-right</code>, <code>bottom-left</code> or
<code>bottom-right</code>. Stacking cannot be undone.
</p>

<h2>Tile</h2>

<p><strong>Format:</strong> <code>!align --tile</code></p>
<p>
Places graphics edge to edge with no gaps, usually map images. Arrange them in rough rows first, left to right
and top to bottom. Align works out the rows from their positions. The top-left graphic stays where it is and
the rest are laid out from it.
</p>
<ul>
  <li>Only graphics on the same layer as the graphic nearest the page's top-left corner are tiled.</li>
  <li>Sizes and rotation are not changed. Graphics rotated 90° or 270° are measured by their on-screen width and height.</li>
</ul>

<h2>Scatter</h2>

<p><strong>Format:</strong> <code>!align --scatter|MODE|SNAP</code></p>
<p>
Places tokens at random positions without overlapping each other or any other token on the token layer.
Drawings and tokens on the map and GM layers are ignored.
</p>
<ul>
  <li><code>MODE</code> — <code>page</code> uses the whole page; <code>area</code> uses the rectangle the selected tokens currently cover.</li>
  <li><code>SNAP</code> — <code>snap</code> puts each token's top-left corner on a grid line; <code>nosnap</code> allows any position.</li>
</ul>
<p>
A token that doesn't land in a free spot at random is moved to a free spot in the area afterward. If the area is
full, Align looks for free space just outside it, widening one grid square at a time without leaving the page.
Only if the whole page is full do tokens overlap, and you get a short message saying how many.
</p>

<h1>Formations</h1>

<h2>Grid Block</h2>

<p><strong>Format:</strong> <code>!align --block|ROWS|SQUARES</code> — needs two or more tokens.</p>
<p>
Arranges tokens in <code>ROWS</code> rows (ranks) with <code>SQUARES</code> grid squares between them. Each row
holds the same number of tokens, rounded up, so the back row may be shorter: 10 tokens in 3 rows gives 4, 4 and 2.
Because rows are filled before a new one starts, asking for many rows with few tokens can give fewer rows than
asked: 4 tokens in 3 rows gives 2 rows of 2.
</p>
<p>
The block starts at the top-left of the current selection. Tokens are taken in reading order (top row first, left
to right) and placed edge to edge plus the gap. Rows are filled front to back, top to bottom.
</p>

<h2>Circle</h2>

<p><strong>Format:</strong> <code>!align --circle|RADIUS|TURN|SNAP</code> — needs two or more tokens.</p>
<p>
Places tokens evenly around a circle centered on the middle of the selection, starting at the top and going
clockwise. Tokens keep their current order around the center.
</p>
<ul>
  <li><code>RADIUS</code> — In grid squares, measured to token centers. Leave blank (or 0) for the smallest circle where tokens don't overlap.</li>
  <li><code>TURN</code> — <code>no</code> keeps each token's facing; <code>center</code> turns tokens to face the center; <code>out</code> turns them to face outward.</li>
  <li><code>SNAP</code> — <code>yes</code> snaps each token to the grid, making an approximate circle for games that need grid positions. If two tokens would share a square, the later one moves to the nearest free square. <code>no</code> leaves exact positions.</li>
</ul>
<p>
Turning uses the <strong>Art faces</strong> setting to know which way token artwork points at rotation 0.
</p>

<h2>Arc</h2>

<p><strong>Format:</strong> <code>!align --arc|SPAN|TOWARD|RADIUS|TURN|SNAP</code> — needs two or more tokens.</p>
<p>
Like Circle, but tokens are spread over part of a circle. The first and last tokens sit at the ends of the arc.
</p>
<ul>
  <li><code>SPAN</code> — Degrees of the circle to cover. 180 is a half circle; 360 is a full circle.</li>
  <li><code>TOWARD</code> — Which side the middle of the arc is on: <code>up</code>, <code>down</code>, <code>left</code> or <code>right</code>. Guards curving around a door to the north would use <code>up</code>.</li>
  <li><code>RADIUS</code>, <code>TURN</code>, <code>SNAP</code> — As for Circle.</li>
</ul>

<h2>Rotate</h2>

<p><strong>Format:</strong> <code>!align --rotate|ANGLE</code> or <code>!align --rotate|ANGLE|turn</code></p>
<p>
Turns the whole arrangement. <code>ANGLE</code> is <code>90</code> or <code>45</code> (clockwise),
<code>-90</code> or <code>-45</code> (counterclockwise), or <code>180</code>. In the menu, the buttons after
"90" turn 90° and the buttons after "45" turn 45°.
</p>
<ul>
  <li>The <strong>Rotate</strong> row moves positions only; each token keeps its facing.</li>
  <li>The <strong>+Facing</strong> row (<code>|turn</code>) also turns each token by the same angle, as if the group were one object.</li>
</ul>
<h3>On the grid</h3>
<p>
On a page with grid snapping, when every selected token is on the grid, the block stays on the grid:
</p>
<ul>
  <li>The block turns around a fixed square: the square nearest its middle when you started turning it. A block whose width and height differ (for example 4 × 3) can end up slightly off-center after a 90° turn, but it does not drift.</li>
  <li>A 45° turn works in grid terms, where a diagonal step counts as one square. Each token moves one-eighth of the way around the ring of squares at the same distance from the turning square. A straight row becomes a diagonal line of tokens touching corner to corner, and a diagonal line becomes a row. Two one-square tokens never land in the same square.</li>
  <li>Two 45° turns equal one 90° turn, and turning back to an earlier orientation always restores exactly the earlier layout, however many turns it took. If you move the tokens any other way between turns, their new layout becomes the starting point.</li>
  <li>Blocks that mix token sizes may give unexpected results on 45° turns. Tokens larger than one square are moved by their top-left square and may overlap a neighbor.</li>
</ul>
<p>
On a page without grid snapping, or when a token is off the grid, the arrangement turns exactly around the middle
of the selection.
</p>

<h2>Face</h2>

<p><strong>Format:</strong> <code>!align --face|DIRECTION</code>, <code>!align --leader</code> or <code>!align --faceas|TOKEN_ID</code></p>
<ul>
  <li><code>--face|up</code>, <code>down</code>, <code>left</code>, <code>right</code> (the ↑ ↓ ← → buttons) — Turns every selected token to look that way on the map. Uses the <strong>Art faces</strong> setting, so with art drawn facing down, "Face up" turns tokens 180°.</li>
  <li><strong>Leader</strong> (<code>--leader</code>) — Select the group and click <strong>Leader</strong>. Align records the group and whispers a <strong>Pick leader</strong> button. Click it, then click the token whose facing the group should copy. The leader does not need to be selected. This takes two steps because clicking a target on the tabletop drops the rest of the selection. The recorded group lasts 30 seconds or until another Align command.</li>
  <li><code>--faceas|TOKEN_ID</code> — Typed or in a macro: every selected token takes that token's facing at once. With a target reference in a macro, the selection may already be reduced to one token, so the Leader button is more reliable.</li>
</ul>
<p>Facing changes can be undone. Use the +Facing 45 buttons for diagonal facings.</p>

<h2>Swap</h2>

<p><strong>Format:</strong> <code>!align --swap</code> (the <strong>Swap Two</strong> button)</p>
<p>
With exactly two tokens selected, exchanges their positions. Tokens trade top-left corners, so both stay on the
grid even when they are different sizes. A token smaller than one grid square is centered in the square the other
token occupied.
</p>

<h2>Shuffle</h2>

<p><strong>Format:</strong> <code>!align --shuffle</code> — needs two or more tokens.</p>
<p>
Moves every selected token to a spot that a different selected token held, chosen at random. No token stays in
its own spot. Tokens may trade in pairs or pass spots around in larger groups. Spots work as for Swap: tokens take
each other's top-left corners, and a token smaller than one grid square is centered in its cell. Tokens of
different sizes can trade spots, so a large token moving into a small token's spot may overlap its neighbors.
</p>

<h3>Player Swap Macro</h3>

<p>
Several abilities let a character trade places with another creature. Players can do this without the menu.
Create a macro with this text, visible to the players who need it:
</p>
<pre>!align --swap|&#64;{target|Swap with|token_id}</pre>
<p>
Select your own token, run the macro, and click the token to swap with. Rules:
</p>
<ul>
  <li>The selected token must be one you control, directly or through its character.</li>
  <li>Both tokens must be on the same page and on the token layer.</li>
  <li>Any token can be the target. Whether the swap is allowed in the game (a willing creature, range) is up to the GM.</li>
  <li>The swap is silent and can be undone.</li>
</ul>

<hr>

<h2>Undo and Redo</h2>

<p><strong>Format:</strong> <code>!align --undo</code> and <code>!align --redo</code> (the <strong>↩&#xFE0E;</strong> and <strong>↪&#xFE0E;</strong> buttons in the title bar)</p>
<p>
Undo reverses your last Align move: Align, Distribute, Spacing, Gap, To Grid, Snap in Place, Tile, Scatter, the
Formations commands (including Face) and Token Page Group. It restores positions, sizes and rotation. Each player has their own
history of up to 10 steps, kept across API restarts.
</p>
<p>
Redo reapplies a move you undid. Any new Align move clears the redo history, and an API restart clears it too.
</p>
<p>
Undo does not reverse Stack, does not shrink a page that To Grid enlarged, and does not bring back a container
box that Group replaced.
</p>

<hr>

<h2>Token Page Commands (Legacy)</h2>

<p>
These are legacy commands, kept for existing games. Token Manager, a dedicated script for full token page
management, is currently under development. They are GM only and are found under the <strong>Token Page Commands</strong> button
in the menu (<code>!align --tpmenu</code>). The older <code>!tokenpage</code> command still works and does the
same things; <code>!tokenpage</code> on its own runs Group.
</p>

<h3>Group</h3>

<p><strong>Format:</strong> <code>!align --group</code></p>
<p>
Arranges the selected tokens (token layer only) in a single staggered row starting from the leftmost token,
then draws a container box around them on the map layer using the saved box style. If the new box overlaps a
box made earlier by Group, that box is replaced and its label moves to the new box. Older boxes drawn in the
current box style are also recognized. Other drawings on the map layer are left alone.
</p>
<ul>
  <li><code>--xoffset|N</code> — Shift the group N pixels horizontally and rebuild the box. The menu arrows use 10.</li>
  <li><code>--yoffset|N</code> — Shift the group N pixels vertically and rebuild the box.</li>
  <li><code>--label|TEXT</code> — Set the label text, creating a label if the group has none. Example: <code>!align --group --label|Bandits</code></li>
  <li><code>--labelposition|above</code> or <code>|below</code> — Label position for this group only.</li>
</ul>
<p>If a text object is selected along with the tokens, it is used as the label.</p>

<h3>Define</h3>

<ul>
  <li><code>--definebox</code> — Select one rectangle. Its fill, stroke, opacity and stroke width become the box style.</li>
  <li><code>--updateboxes</code> — Select one box. Every box on the page with the same fill and stroke colors gets the current box style. The page may need a refresh to show the change.</li>
  <li><code>--definelabel</code> — Select one text object. Its font, size and color become the label style.</li>
  <li><code>--definelabelpos|above</code> or <code>|below</code> — Default label position.</li>
</ul>

<hr>

<h2>Command Reference</h2>

<ul>
  <li><code>!align</code> — Open the menu.</li>
  <li><code>--help</code> — Open this help handout.</li>
  <li><code>--align|MODE</code>, <code>--distribute|MODE</code>, <code>--distributespacing|AXIS</code></li>
  <li><code>--snap|AXIS|SPACES</code>, <code>--zindex|DIRECTION</code>, <code>--tile</code>, <code>--scatter|MODE|SNAP</code></li>
  <li><code>--gap|AXIS|SQUARES</code>, <code>--snapinplace</code></li>
  <li><code>--block|ROWS|SQUARES</code>, <code>--circle|RADIUS|TURN|SNAP</code>, <code>--arc|SPAN|TOWARD|RADIUS|TURN|SNAP</code></li>
  <li><code>--rotate|ANGLE</code>, <code>--rotate|ANGLE|turn</code>, <code>--swap</code>, <code>--swap|TOKEN_ID</code>, <code>--shuffle</code></li>
  <li><code>--face|DIRECTION</code>, <code>--leader</code>, <code>--faceas|TOKEN_ID</code></li>
  <li><code>--settings</code>, <code>--set|KEY|VALUE</code> (GM)</li>
  <li><code>--undo</code>, <code>--redo</code></li>
  <li><code>--tpmenu</code> — Token Page menu (GM).</li>
  <li><code>--group</code>, <code>--xoffset|N</code>, <code>--yoffset|N</code>, <code>--label|TEXT</code>, <code>--labelposition|POS</code> (GM)</li>
  <li><code>--definebox</code>, <code>--updateboxes</code>, <code>--definelabel</code>, <code>--definelabelpos|POS</code> (GM)</li>
</ul>
`;

  const Help = {

    // Write/refresh the help handout and whisper a link to it. A player with access who asks for help is added
    show: (playerid) => {
      let handout = findObjs({ _type: 'handout', name: HELP_HANDOUT })[0];
      if (!handout) {
        handout = createObj('handout', { name: HELP_HANDOUT, archived: false });
      }
      handout.set({ notes: HELP_TEXT, avatar: HELP_AVATAR });

      if (!playerIsGM(playerid)) {
        const viewers = String(handout.get('inplayerjournals') || '').split(',').filter(Boolean);
        if (!viewers.includes('all') && !viewers.includes(playerid)) {
          handout.set('inplayerjournals', viewers.concat(playerid).join(','));
        }
      }

      const link = `http://journal.roll20.net/handout/${handout.get('_id')}`;
      Output.whisper(playerid,
        `<div style="${CSS.helpBox}">` +
        `<div style="${CSS.helpBoxTitle}">Align Help</div>` +
        `<a href="${link}" target="_blank" style="${CSS.helpBoxLink}"><span style="${CSS.helpBoxLink}">Open Help Handout</span></a>` +
        `</div>`);
    }
  };

  // Menu
  const Menu = {

    labels: {
      align: { left: '←', right: '→', top: '↑', bottom: '↓', center: '⊕', 'center-x': '|', 'center-y': '—' },
      distribute: { left: '←', right: '→', top: '↑', bottom: '↓', center: '⊕', 'center-x': '|||', 'center-y': 'Ⲷ' },
      spacing: { horizontal: '⇄', vertical: '⇅' },
      stack: { 'top-left': G.nw, 'top-right': G.ne, 'bottom-right': G.se, 'bottom-left': G.sw }
    },

    show: (playerid) => {
      const b = Output.button, L = Menu.labels;
      const edges = ['left', 'right', 'top', 'bottom'];
      const centers = ['center', 'center-x', 'center-y'];
      const set = (group, keys, arg) => keys.map(k => b(L[group][k], `!align --${arg}|${k}`)).join('');

      const radiusQ = '?{Radius in grid squares (blank = fit)|}';
      const turnQ = '?{Turn tokens|No,no|Face center,center|Face outward,out}';
      const snapQ = '?{Snap to grid|No,no|Yes,yes}';

      const isGM = playerIsGM(playerid);
      // Floated right in reverse order: ? ends up rightmost, ⚙ to its left
      let html = `<div style="${CSS.title}">` +
        b(G.undo, '!align --undo', CSS.historyButton, 'Undo last move') +
        b(G.redo, '!align --redo', CSS.historyButton, 'Redo') +
        b('?', '!align --help', CSS.helpButton, 'Help') +
        (isGM ? b(G.gear, '!align --settings', CSS.helpButton, 'Settings') : '') + 'ALIGN</div>';
      html += Output.row('Align:', set('align', edges, 'align') + ' | ' + set('align', centers, 'align'));
      html += Output.row('Distribute:', set('distribute', edges, 'distribute') + ' | ' + set('distribute', centers, 'distribute'));
      html += Output.row('Spacing:', set('spacing', ['horizontal', 'vertical'], 'distributespacing') + ' | Gap: ' +
        b('⇄', '!align --gap|horizontal|?{Gap in grid squares|0}', '', 'Fixed horizontal gap') +
        b('⇅', '!align --gap|vertical|?{Gap in grid squares|0}', '', 'Fixed vertical gap'));
      html += Output.row('To Grid:',
        b('Horizontal', '!align --snap|horizontal|?{How many grid squares between tokens (horizontal)|1}') +
        b('Vertical', '!align --snap|vertical|?{How many grid squares between tokens (vertical)|1}') + ' | ' +
        b('In Place', '!align --snapinplace', '', 'Snap each token to the grid where it is'));
      html += Output.row('Stack from:', set('stack', ['top-left', 'top-right', 'bottom-right', 'bottom-left'], 'zindex'));
      html += Output.row('Tile:', b('Tile Selected Graphics', '!align --tile'));

      html += `<div style="${CSS.sectionTitle}">Scatter</div>`;
      html += Output.row('Snap:', b('Page', '!align --scatter|page|snap') + b('Area', '!align --scatter|area|snap'));
      html += Output.row('No Snap:', b('Page', '!align --scatter|page|nosnap') + b('Area', '!align --scatter|area|nosnap'));

      html += `<div style="${CSS.sectionTitle}">Formations</div>`;
      html += Output.row('Block:', b('Grid Block', '!align --block|?{Number of rows (ranks)|2}|?{Gap in grid squares|0}'));
      html += Output.row('Ring:',
        b('Circle', `!align --circle|${radiusQ}|${turnQ}|${snapQ}`) +
        b('Arc', `!align --arc|?{Span in degrees|180}|?{Arc center toward|Up,up|Down,down|Left,left|Right,right}|${radiusQ}|${turnQ}|${snapQ}`));
      const lbl = (t) => `<span style="${CSS.inlineLabel}">${t}</span>`;
      const rotRow = (turn, what) => {
        const t = turn ? '|turn' : '';
        return lbl('90') +
          b('↻', `!align --rotate|90${t}`, '', `Rotate ${what} 90° clockwise`) +
          b('↺', `!align --rotate|-90${t}`, '', `Rotate ${what} 90° counterclockwise`) + ' ' + lbl('45') +
          b('↻', `!align --rotate|45${t}`, '', `Rotate ${what} 45° clockwise`) +
          b('↺', `!align --rotate|-45${t}`, '', `Rotate ${what} 45° counterclockwise`) + ' ' +
          b('180', `!align --rotate|180${t}`, '', `Rotate ${what} 180°`);
      };
      html += Output.row('Rotate:', rotRow(false, 'arrangement, keep facing,'));
      html += Output.row('+Facing:', rotRow(true, 'arrangement and tokens'));
      html += Output.row('Face:',
        b('↑', '!align --face|up', '', 'Face up the map') +
        b('↓', '!align --face|down', '', 'Face down the map') +
        b('←', '!align --face|left', '', 'Face left') +
        b('→', '!align --face|right', '', 'Face right') +
        b('Leader', '!align --leader', '', 'Record the selected tokens, then pick a token whose facing they copy'));
      html += Output.row('Swap:', b('Swap Two', '!align --swap', '', 'Swap the positions of two selected tokens') +
        b('Shuffle', '!align --shuffle', '', 'Move every selected token to a spot another one held'));

      if (isGM && State.setting('showTokenPage')) {
        html += `<div style="${CSS.legacyRow}">` + Output.row('Legacy:', b('Token Page Commands', '!align --tpmenu')) + '</div>';
      }

      Output.whisper(playerid, Output.box(html));
    },

    // Players without access: a Swap button only
    showPlayerCard: (playerid) => {
      const html = `<div style="${CSS.title}">ALIGN</div>` +
        '<div>Select your token, then click Swap and choose who to trade places with.</div>' +
        Output.button('Swap', '!align --swap|&#64;{target|Swap with|token_id}', '', 'Trade places with a target token');
      Output.whisper(playerid, Output.box(html));
    },

    // GM settings card; clicking a value saves it and redraws the card
    showSettings: (playerid) => {
      const b = Output.button;
      const items = [
        { key: 'facing', name: 'Art faces', desc: 'Which way token artwork points at rotation 0. Used by Face and by Circle/Arc facing.',
          opts: [['up', 'Up'], ['down', 'Down'], ['left', 'Left'], ['right', 'Right']] },
        { key: 'selectionSeconds', name: 'Selection memory', desc: 'Seconds after a command during which a dropped or partly dropped selection is restored.',
          opts: [[0, 'Off'], [3, '3'], [5, '5'], [10, '10']] },
        { key: 'access', name: 'Player access', desc: 'Who can use Align. Swap Two and the swap macro always work for players.',
          opts: [['gm', 'GM only'], ['all', 'All players']] },
        { key: 'showTokenPage', name: 'Token Page button', desc: 'Show the legacy Token Page Commands button in the menu. Commands work either way.',
          opts: [[true, 'Show'], [false, 'Hide']] },
        { key: 'quiet', name: 'Quiet mode', desc: 'Hide all Align messages, including errors. Errors still go to the API console.',
          opts: [[true, 'On'], [false, 'Off']] }
      ];
      let html = `<div style="${CSS.title}">${b('?', '!align --help', CSS.helpButton, 'Help')}ALIGN SETTINGS</div>`;
      items.forEach((it, i) => {
        const cur = State.setting(it.key);
        const block = i === items.length - 1 ? CSS.settingBlock.replace(/border-bottom:[^;]+;/, '') : CSS.settingBlock;
        html += `<div style="${block}"><div style="${CSS.settingName}">${it.name}</div>` +
          `<div style="${CSS.settingDesc}">${it.desc}</div>` +
          it.opts.map(([v, label]) => b(label, `!align --set|${it.key}|${v}`, v === cur ? CSS.buttonOn : '')).join('') +
          '</div>';
      });
      html += Output.row('Return:', b('Align Menu', '!align'));
      Output.whisper(playerid, Output.box(html));
    },

    // Legacy Token Page commands, GM only
    showTokenPage: (playerid) => {
      if (!playerIsGM(playerid)) return Output.notice(playerid, 'Token Page commands are GM only.');
      const b = Output.button;
      let html = `<div style="${CSS.title}">${b('?', '!align --help', CSS.helpButton, 'Help')}TOKEN PAGE (LEGACY)</div>`;
      html += `<div style="${CSS.notice}">These are legacy commands, kept for existing games. Token Manager, a dedicated script for full token page management, is currently under development.</div>`;
      html += Output.row('Arrange:', b('Group', '!align --group') +
        b('←', '!align --xoffset|-10') + b('→', '!align --xoffset|10') +
        b('↑', '!align --yoffset|-10') + b('↓', '!align --yoffset|10'));
      html += Output.row('Container:', b('Define', '!align --definebox') +
        b('Update', '!align --updateboxes', '', 'Restyles boxes matching the selected one. May need a page refresh.'));
      html += Output.row('Label:', b('Define', '!align --definelabel') +
        b('Above', '!align --definelabelpos|above') + b('Below', '!align --definelabelpos|below'));
      html += Output.row('Return:', b('Align Menu', '!align'));
      Output.whisper(playerid, Output.box(html));
    }
  };

  // Leader facing, in two steps. Picking a target on the tabletop reduces the selection to one token before
  const Leader = (() => {
    const pending = {}; // playerid: { ids, time }
    const WINDOW_MS = 30000;

    return {
      start: (pid, tokens) => {
        pending[pid] = { ids: tokens.map(t => t.id), time: Date.now() };
        Output.whisper(pid, Output.box(
          '<div>Click <b>Pick leader</b>, then click the token whose facing the group should copy.</div>' +
          Output.button('Pick leader', '!align --faceas|&#64;{target|Leader|token_id}', '', 'Choose the leader token')));
      },

      // The recorded group, if still current; otherwise null
      take: (pid) => {
        const p = pending[pid];
        delete pending[pid];
        if (!p || Date.now() - p.time > WINDOW_MS) return null;
        const tokens = p.ids.map(id => getObj('graphic', id)).filter(Boolean);
        return tokens.length ? tokens : null;
      },

      clear: (pid) => { delete pending[pid]; }
    };
  })();

  // Commands (single root; !tokenpage is an alias)
  const Commands = {

    // Store one setting if the key and value are known; anything else is ignored
    applySetting: (key, raw) => {
      const k = Object.keys(SETTING_VALUES).find(x => x.toLowerCase() === String(key || '').toLowerCase());
      if (!k) return;
      const allowed = SETTING_VALUES[k];
      const value = allowed.find(v => String(v) === String(raw).toLowerCase());
      if (value === undefined) return;
      State.config()[k] = value;
    },

    root: (msg, parsed) => {
      const { command, args, list } = parsed;
      const pid = msg.playerid;
      const has = (k) => Object.prototype.hasOwnProperty.call(args, k);
      const first = (k) => (args[k] && args[k][0]) || '';
      const isTokenPage = command === '!tokenpage';
      const isGM = playerIsGM(pid);

      // Players without access get the Swap card for anything except a swap
      if (!isGM && State.setting('access') !== 'all' && !has('swap')) return Menu.showPlayerCard(pid);

      if (has('faceas')) {
        const group = Leader.take(pid);
        if (group) return Formations.faceAs(pid, group, first('faceas'));
      } else {
        Leader.clear(pid);
      }

      if (!list.length) return isTokenPage ? TokenPage.group(Selection.resolve(msg), {}) : Menu.show(pid);

      if (has('settings') || has('set')) {
        if (!isGM) return Menu.show(pid);
        if (has('set')) Commands.applySetting(args.set[0], args.set[1]);
        return Menu.showSettings(pid);
      }

      if (has('help')) return Help.show(pid);
      if (has('undo')) return Undo.pop(pid);
      if (has('redo')) return Undo.redo(pid);
      if (has('confirmsnap') || has('snapconfirm')) return Snap.confirm(pid);
      if (has('snapcancel')) return Snap.cancel(pid);
      if (has('tpmenu')) return Menu.showTokenPage(pid);

      // Token Page commands
      const tpDefine = ['definebox', 'definelabel', 'definelabelpos', 'updateboxes'];
      if (tpDefine.some(has) && !playerIsGM(pid)) return Output.notice(pid, 'Only the GM may change Token Page settings.');
      if (has('definebox')) return TokenPage.defineBox(msg);
      if (has('definelabelpos')) return TokenPage.defineLabelPosition(msg, first('definelabelpos'));
      if (has('definelabel')) return TokenPage.defineLabel(msg);
      if (has('updateboxes')) return TokenPage.updateBoxes(msg);
      if (isTokenPage || ['group', 'xoffset', 'yoffset', 'label', 'labelposition'].some(has)) {
        return TokenPage.group(Selection.resolve(msg), {
          xoffset: first('xoffset'),
          yoffset: first('yoffset'),
          label: first('label'),
          labelposition: first('labelposition')
        });
      }

      // Selection-based commands
      const known = ['align', 'distribute', 'distributespacing', 'snap', 'zindex', 'scatter', 'tile',
        'snapinplace', 'gap', 'block', 'circle', 'arc', 'rotate', 'swap', 'shuffle', 'face', 'faceas', 'leader'];
      if (!known.some(has)) return Menu.show(pid);

      const selected = TokenUtils.selectedGraphics(Selection.resolve(msg, { exact: has('swap') }));
      if (!selected.length) return Output.notice(pid, 'Select tokens or graphics first.');
      const page = getObj('page', selected[0].get('_pageid'));
      if (!page) return;

      if (has('swap')) return Formations.swap(pid, selected, page, first('swap'));
      if (has('shuffle')) return Formations.shuffle(pid, selected, page);
      if (has('face')) return Formations.face(pid, selected, first('face'));
      if (has('leader')) return Leader.start(pid, selected);
      if (has('faceas')) return Formations.faceAs(pid, selected, first('faceas'));
      if (has('snapinplace')) return Formations.snapInPlace(pid, selected, page);
      if (has('gap')) return Formations.gap(pid, selected, page, args.gap[0], args.gap[1]);
      if (has('block')) return Formations.block(pid, selected, page, args.block[0], args.block[1]);
      if (has('circle')) {
        const [radius, turn, snap] = args.circle;
        return Formations.ring(pid, selected, page, { span: 360, radius, turn, snap: snap === 'yes' });
      }
      if (has('arc')) {
        const [span, toward, radius, turn, snap] = args.arc;
        return Formations.ring(pid, selected, page, { span: span || 180, toward, radius, turn, snap: snap === 'yes' });
      }
      if (has('rotate')) return Formations.rotate(pid, selected, page, args.rotate[0], args.rotate[1] === 'turn');
      if (has('tile')) return Tile.run(pid, selected);
      if (has('scatter')) {
        const [mode, snap] = args.scatter;
        return Scatter.run(pid, selected, page, mode === 'area' ? 'area' : 'page', snap === 'snap');
      }
      if (has('snap')) {
        const [direction, spaces] = args.snap;
        return Snap.request(pid, selected, parseFloat(spaces), page, direction);
      }
      if (has('zindex')) return Arrange.stack(pid, selected, first('zindex') || 'top-right');
      if (has('distribute')) return Arrange.distribute(pid, selected, first('distribute'));
      if (has('distributespacing')) return Arrange.spacing(pid, selected, first('distributespacing'));
      if (has('align')) return Arrange.align(pid, selected, first('align'));
    }
  };

  // Input handler
  const handleInput = (msg) => {
    if (msg.type !== 'api') return;
    const parsed = Parser.parse(msg.content);
    if (parsed.command !== '!align' && parsed.command !== '!tokenpage') return;
    try {
      Commands.root(msg, parsed);
    } catch (err) {
      Logger.error(err && err.stack ? err.stack : err);
      if (playerIsGM(msg.playerid)) Output.notice(msg.playerid, 'Align hit an error. Details are in the API console.');
    }
  };

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
  };

  const checkInstall = () => {
    State.initialize();
    log(`Align v${version} ready. Command: !align (menu with help button)`);
    Logger.debug(`last update ${new Date(lastUpdate * 1000)}`);
    return true;
  };

  on('ready', () => {
    if (checkInstall()) registerEventHandlers();
  });

  return {};

})();
