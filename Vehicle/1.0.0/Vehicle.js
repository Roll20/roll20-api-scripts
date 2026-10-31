// Script:   Vehicle
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
// Changelog
// 1.0.0 Initial release

const Vehicle = (() => {
  'use strict';

  // Config

  const scriptName = 'Vehicle';
  const commandName = '!vehicle';
  const version = '1.0.0';
  const lastUpdate = 1793465796; // unix timestamp, seconds
  const schemaVersion = 0.1;

  const DEBUG = false;

  const DEFAULT_OVERLAP = 50;        // percent of a rider that must overlap the vehicle's area
  const ANGLE_TOLERANCE = 0.5;       // degrees from a right angle still counted as straight
  const OUTLINE_STROKE = '#ffff00fe'; // bright yellow; the fe alpha marks outlines this script drew
  const OUTLINE_WIDTH = 3;
  const OUTLINE_MS = 10000;          // an untouched outline is removed after this long
  const DEFER_MS = 100;              // wait for the rest of a multi-token drag to report in
  const GROUP_WINDOW_MS = 250;       // tokens moved this close to the vehicle's move were dragged with it, not carried
  const RECENT_PRUNE_MS = 5000;

  const HELP_NAME = 'Help: Vehicle';
  const HELP_AVATAR = 'https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147';

  // CSS (Centralized Styles)

  const CSS = {
    outer: 'border:1px solid #fff;border-radius:7px;margin:4px 0;',
    box: 'background:#f3efe6;border:1px solid #7a6a4f;border-radius:6px;font-family:Arial, sans-serif;color:#2b2418;font-size:12px;overflow:hidden;',
    header: 'background:#4a3b28;padding:5px 8px;font-weight:bold;color:#f3e6c8;font-size:13px;',
    headerSub: 'font-weight:normal;font-size:11px;color:#d6c39a;',
    helpButton: 'float:right;display:inline-block;width:16px;height:16px;line-height:16px;padding:0;margin:0;text-align:center;border:none;border-radius:8px;background-color:#7a6a4f;color:#fff;font-size:11px;font-weight:bold;text-decoration:none;',
    body: 'padding:6px 8px;',
    grid: 'width:100%;border-collapse:separate;border-spacing:3px;',
    tile: 'display:block;background:#fffaf0;border:1px solid #b9a782;border-radius:4px;color:#2b2418;padding:5px 0 4px 0;text-align:center;text-decoration:none;font-size:11px;line-height:13px;font-weight:normal;',
    tileIcon: 'display:block;font-size:15px;color:#4a3b28;',
    note: 'padding:0 8px 6px 8px;font-size:10px;color:#7a6a4f;',
    row: 'border-top:1px solid #d6cbb3;padding:5px 6px;',
    thumbCell: 'width:52px;vertical-align:top;padding:0;',
    thumbBox: 'display:block;width:48px;height:48px;line-height:48px;padding:0;margin:0;text-align:center;background-color:#e6dcc6;border:1px solid #7a6a4f;border-radius:3px;text-decoration:none;overflow:hidden;',
    thumb: 'max-width:48px;max-height:48px;width:auto;height:auto;vertical-align:middle;border:none;margin:0;padding:0;',
    nameLink: 'background-color:transparent;border:none;padding:0;margin:0;font-weight:bold;font-size:12px;color:#2b2418;text-decoration:none;',
    name: 'font-weight:bold;font-size:12px;color:#2b2418;text-decoration:none;',
    count: 'color:#7a6a4f;font-size:11px;',
    chip: 'display:inline-block;background-color:#fffaf0;border:1px solid #b9a782;border-radius:10px;color:#2b2418;padding:0 5px;margin:3px 1px 0 0;font-size:10px;line-height:15px;white-space:nowrap;font-weight:normal;text-decoration:none;',
    chipOn: 'display:inline-block;background-color:#3f6b3a;border:1px solid #2c4d28;border-radius:10px;color:#fff;padding:0 5px;margin:3px 1px 0 0;font-size:10px;line-height:15px;white-space:nowrap;font-weight:normal;text-decoration:none;',
    remove: 'display:block;background-color:#f6dcd6;border:1px solid #b9786a;border-radius:3px;color:#7a2a1a;width:16px;height:16px;line-height:16px;padding:0;margin:0;text-align:center;text-decoration:none;font-size:11px;',
    empty: 'padding:6px 8px;color:#7a6a4f;',
    error: 'padding:6px 8px;color:#8a2a1a;',
    tileText: 'color:#2b2418;font-size:11px;font-weight:normal;'
  };

  // Logger

  const Logger = {
    log: (msg) => log(`${scriptName} | ${msg}`),
    debug: (msg) => {
      if (DEBUG) log(`${scriptName} [DEBUG] | ${msg}`);
    },
    error: (msg) => log(`${scriptName} [ERROR] | ${msg}`)
  };

  // State Management (config only; vehicle data lives in token tooltips)

  const State = {

    initialize: () => {
      if (!state[scriptName] || state[scriptName].version !== schemaVersion) {

        Logger.log(`Updating Schema to v${schemaVersion}`);

        switch (state[scriptName] && state[scriptName].version) {

          case 0.0:
            /* falls through */

          default:
            state[scriptName] = {
              version: schemaVersion,
              config: {}
            };
            break;
        }
      }
    },

    get: () => state[scriptName],
    config: () => state[scriptName].config
  };

  // Parser
  // Supports:
  // !cmd --key value
  // !cmd --key key|multi word value without quotes

  const Parser = {

    parse: (content) => {
      const tokens = content.trim().split(/\s+/);
      const command = tokens.shift();

      const args = {};
      let currentKey = null;

      tokens.forEach(token => {

        if (token.startsWith('--')) {
          currentKey = token.replace(/^--/, '').toLowerCase();
          args[currentKey] = true;
          return;
        }

        if (currentKey) {
          if (token.includes('|')) {
            const [k, ...rest] = token.split('|');
            args[currentKey] = rest.join('|') || k;
          } else {
            if (args[currentKey] === true) {
              args[currentKey] = token;
            } else {
              args[currentKey] += ` ${token}`;
            }
          }
        }

      });

      return { command, args };
    }

  };

  // Tooltip tag: [vehicle|rotate|overlap:50|area:l,t,r,b]; keys at their default are left out.
  // area is the inset from each side (left, top, right, bottom) in percent of the unflipped, unrotated token.

  const NO_AREA = [0, 0, 0, 0];

  const round1 = (n) => Math.round(n * 10) / 10;

  const validArea = (a) => Array.isArray(a) && a.length === 4 &&
    a.every(n => typeof n === 'number' && !isNaN(n) && n >= 0 && n < 100) &&
    a[0] + a[2] < 100 && a[1] + a[3] < 100;

  const Tag = {

    pattern: /\[vehicle(?:\|([^\]]*))?\]/i,

    has: (tooltip) => Tag.pattern.test(tooltip || ''),

    parse: (tooltip) => {
      const m = (tooltip || '').match(Tag.pattern);
      if (!m) return null;
      const opts = { rotate: false, overlap: DEFAULT_OVERLAP, area: NO_AREA.slice() };
      (m[1] || '').split('|').map(s => s.trim().toLowerCase()).filter(Boolean).forEach(part => {
        const [key, value] = part.split(':').map(s => s.trim());
        if (key === 'rotate') {
          opts.rotate = true;
        } else if (key === 'overlap') {
          const n = parseFloat(value);
          if (n > 0 && n <= 100) opts.overlap = n;
        } else if (key === 'area') {
          const a = String(value || '').split(',').map(parseFloat);
          if (validArea(a)) opts.area = a;
        }
      });
      return opts;
    },

    hasArea: (opts) => opts.area.some(n => n !== 0),

    build: (opts) => {
      const parts = ['vehicle'];
      if (opts.rotate) parts.push('rotate');
      if (opts.overlap !== DEFAULT_OVERLAP) parts.push(`overlap:${opts.overlap}`);
      if (Tag.hasArea(opts)) parts.push(`area:${opts.area.map(round1).join(',')}`);
      return `[${parts.join('|')}]`;
    },

    strip: (tooltip) => (tooltip || '').replace(Tag.pattern, '').replace(/\s{2,}/g, ' ').trim(),

    write: (token, opts) => {
      const rest = Tag.strip(token.get('tooltip'));
      token.set('tooltip', rest ? `${Tag.build(opts)} ${rest}` : Tag.build(opts));
    },

    remove: (token) => {
      token.set('tooltip', Tag.strip(token.get('tooltip')));
    }
  };

  // Geometry: token footprints as rotated rectangles, overlap by convex polygon clipping

  const Geo = {

    num: (v) => {
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    },

    rect: (cx, cy, w, h, rotDeg) => {
      const r = rotDeg * Math.PI / 180;
      const c = Math.cos(r);
      const s = Math.sin(r);
      return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
        .map(([x, y]) => ({ x: cx + x * c - y * s, y: cy + x * s + y * c }));
    },

    signedArea: (poly) => {
      let a = 0;
      for (let i = 0; i < poly.length; i++) {
        const p = poly[i];
        const q = poly[(i + 1) % poly.length];
        a += p.x * q.y - q.x * p.y;
      }
      return a / 2;
    },

    // Sutherland-Hodgman: clip subject polygon by a convex clip polygon
    clip: (subject, clipPoly) => {
      const orient = Geo.signedArea(clipPoly) >= 0 ? 1 : -1;
      const side = (a, b, p) => orient * ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x));
      const cross = (a, b, p, q) => {
        const d1 = side(a, b, p);
        const d2 = side(a, b, q);
        const t = d1 / (d1 - d2);
        return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
      };

      let output = subject;
      for (let i = 0; i < clipPoly.length && output.length; i++) {
        const a = clipPoly[i];
        const b = clipPoly[(i + 1) % clipPoly.length];
        const input = output;
        output = [];
        for (let j = 0; j < input.length; j++) {
          const p = input[j];
          const q = input[(j + 1) % input.length];
          const pIn = side(a, b, p) >= 0;
          const qIn = side(a, b, q) >= 0;
          if (pIn) output.push(p);
          if (pIn !== qIn) output.push(cross(a, b, p, q));
        }
      }
      return output;
    },

    // Fraction (0-1) of the rider rectangle's area that lies inside the vehicle rectangle
    overlapFraction: (riderPoly, vehiclePoly) => {
      const riderArea = Math.abs(Geo.signedArea(riderPoly));
      if (!riderArea) return 0;
      const inter = Geo.clip(riderPoly, vehiclePoly);
      if (inter.length < 3) return 0;
      return Math.abs(Geo.signedArea(inter)) / riderArea;
    },

    // Rotate point (x,y) about origin by deg (Roll20 rotation is clockwise, y down)
    rotate: (x, y, deg) => {
      const r = deg * Math.PI / 180;
      const c = Math.cos(r);
      const s = Math.sin(r);
      return { x: x * c - y * s, y: x * s + y * c };
    },

    normDeg: (d) => ((d % 360) + 360) % 360
  };

  // Utilities

  const getPageForPlayer = (playerid) => {
    const player = getObj('player', playerid);
    if (playerIsGM(playerid)) {
      return (player && player.get('lastpage')) || Campaign().get('playerpageid');
    }
    const psp = Campaign().get('playerspecificpages');
    if (psp && psp[playerid]) return psp[playerid];
    return Campaign().get('playerpageid');
  };

  const getTargets = (msg, args) => {
    if (args.ids && args.ids !== true) {
      return String(args.ids).split(/\s*,\s*/).filter(Boolean)
        .map(id => getObj('graphic', id)).filter(Boolean);
    }
    return (msg.selected || [])
      .filter(s => s._type === 'graphic')
      .map(s => getObj('graphic', s._id)).filter(Boolean);
  };

  const isVehicle = (token) => !!token && token.get('_type') === 'graphic' && Tag.has(token.get('tooltip'));

  const flag = (v) => v === true || v === 'true';

  const snapshot = (src) => ({
    left: Geo.num(src.left),
    top: Geo.num(src.top),
    width: Geo.num(src.width),
    height: Geo.num(src.height),
    rotation: Geo.num(src.rotation),
    fliph: flag(src.fliph),
    flipv: flag(src.flipv)
  });

  const snapshotOf = (token) => snapshot({
    left: token.get('left'), top: token.get('top'),
    width: token.get('width'), height: token.get('height'),
    rotation: token.get('rotation'),
    fliph: token.get('fliph'), flipv: token.get('flipv')
  });

  // Insets as seen on the page, after flipping: [left, top, right, bottom] fractions
  const screenInsets = (area, snap) => {
    let [l, t, r, b] = area.map(n => n / 100);
    if (snap.fliph) [l, r] = [r, l];
    if (snap.flipv) [t, b] = [b, t];
    return [l, t, r, b];
  };

  // The area as a rectangle on the page: center, size, rotation
  const areaRect = (snap, area) => {
    const [l, t, r, b] = screenInsets(area, snap);
    const w = snap.width;
    const h = snap.height;
    const off = Geo.rotate((l - r) * w / 2, (t - b) * h / 2, snap.rotation);
    return {
      x: snap.left + off.x,
      y: snap.top + off.y,
      w: w * (1 - l - r),
      h: h * (1 - t - b),
      rotation: snap.rotation
    };
  };

  const areaPoly = (snap, area) => {
    const a = areaRect(snap, area);
    return Geo.rect(a.x, a.y, a.w, a.h, a.rotation);
  };

  const offRightAngle = (rot) => {
    const r = Geo.normDeg(rot);
    return Math.abs(r - Math.round(r / 90) * 90) > ANGLE_TOLERANCE;
  };

  const nearestRightAngle = (rot) => Geo.normDeg(Math.round(Geo.normDeg(rot) / 90) * 90);

  // Corners of a pathv2 on the page. Size comes from the spread of its points, center from x/y,
  // which holds whether the points are page or relative coordinates.
  const pathCorners = (path) => {
    let pts = [];
    try {
      pts = JSON.parse(path.get('points') || '[]');
    } catch (e) {
      pts = [];
    }
    if (!Array.isArray(pts) || pts.length < 2) return null;
    const xs = pts.map(p => Geo.num(p[0]));
    const ys = pts.map(p => Geo.num(p[1]));
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);
    if (!w || !h) return null;
    return Geo.rect(Geo.num(path.get('x')), Geo.num(path.get('y')), w, h, Geo.num(path.get('rotation')));
  };

  // Area insets (percent, unflipped) from a drawn path, or an error string
  const areaFromPath = (vehicle, path) => {
    const snap = snapshotOf(vehicle);
    const corners = pathCorners(path);
    if (!corners) return 'The selected drawing has no size.';
    const local = corners.map(p => Geo.rotate(p.x - snap.left, p.y - snap.top, -snap.rotation));
    const hw = snap.width / 2;
    const hh = snap.height / 2;
    const clampX = (v) => Math.min(hw, Math.max(-hw, v));
    const clampY = (v) => Math.min(hh, Math.max(-hh, v));
    const x1 = clampX(Math.min(...local.map(p => p.x)));
    const x2 = clampX(Math.max(...local.map(p => p.x)));
    const y1 = clampY(Math.min(...local.map(p => p.y)));
    const y2 = clampY(Math.max(...local.map(p => p.y)));
    if (x2 - x1 < 1 || y2 - y1 < 1) return 'The rectangle does not overlap the vehicle.';

    let l = (x1 + hw) / snap.width * 100;
    let r = (hw - x2) / snap.width * 100;
    let t = (y1 + hh) / snap.height * 100;
    let b = (hh - y2) / snap.height * 100;
    if (snap.fliph) [l, r] = [r, l];
    if (snap.flipv) [t, b] = [b, t];
    const area = [l, t, r, b].map(n => Math.max(0, round1(n)));
    return validArea(area) ? area : 'The rectangle is too small.';
  };

  // Carry: find riders and move them with the vehicle

  const recentMoves = {};

  const noteMove = (id, when) => {
    recentMoves[id] = when;
  };

  const pruneRecent = (now) => {
    Object.keys(recentMoves).forEach(id => {
      if (now - recentMoves[id] > RECENT_PRUNE_MS) delete recentMoves[id];
    });
  };

  // Riders: token-layer tokens, not vehicles, with at least overlap% of their footprint on the area
  const findRiders = (pageid, vehicleId, snap, opts, skipSince) => {
    const poly = areaPoly(snap, opts.area);
    const cx = snap.left;
    const cy = snap.top;
    const vRadius = Math.sqrt(snap.width * snap.width + snap.height * snap.height) / 2;
    return findObjs({ _type: 'graphic', _pageid: pageid, layer: 'objects' }).filter(t => {
      if (t.id === vehicleId) return false;
      if (t.get('_subtype') !== 'token') return false;
      if (isVehicle(t)) return false;
      if (skipSince !== undefined && recentMoves[t.id] !== undefined && recentMoves[t.id] >= skipSince) return false;

      const tw = Geo.num(t.get('width'));
      const th = Geo.num(t.get('height'));
      const tx = Geo.num(t.get('left'));
      const ty = Geo.num(t.get('top'));
      const tRadius = Math.sqrt(tw * tw + th * th) / 2;
      if (Math.hypot(tx - cx, ty - cy) > vRadius + tRadius) return false;

      const frac = Geo.overlapFraction(Geo.rect(tx, ty, tw, th, Geo.num(t.get('rotation'))), poly);
      return frac * 100 >= opts.overlap - 1e-6;
    });
  };

  // before/after: snapshots of the vehicle
  const carry = (vehicle, before, after, eventTime) => {
    const opts = Tag.parse(vehicle.get('tooltip'));
    if (!opts) return 0;

    const dx = after.left - before.left;
    const dy = after.top - before.top;
    const dRot = after.rotation - before.rotation;
    if (!dx && !dy && !dRot) return 0;

    const skipSince = eventTime === undefined ? undefined : eventTime - GROUP_WINDOW_MS;
    const riders = findRiders(vehicle.get('_pageid'), vehicle.id, before, opts, skipSince);

    riders.forEach(t => {
      const rel = Geo.rotate(Geo.num(t.get('left')) - before.left, Geo.num(t.get('top')) - before.top, dRot);
      const update = { left: after.left + rel.x, top: after.top + rel.y };
      if (opts.rotate && dRot) update.rotation = Geo.normDeg(Geo.num(t.get('rotation')) + dRot);
      t.set(update);
    });

    Logger.debug(`${vehicle.get('name') || vehicle.id} carried ${riders.length} token(s)`);
    return riders.length;
  };

  const handleGraphicChange = (obj, prev) => {
    const now = Date.now();
    const moved = obj.get('left') !== prev.left || obj.get('top') !== prev.top || obj.get('rotation') !== prev.rotation;
    if (moved) noteMove(obj.id, now);

    if (!isVehicle(obj)) return;

    // Tag added by hand: send to back
    if (!Tag.has(prev.tooltip)) toBack(obj);

    if (!moved) return;
    if (obj.get('layer') !== prev.layer) return;

    const before = snapshot(prev);
    const after = snapshotOf(obj);

    // Resizing also shifts the center; don't carry on a resize
    if (before.width !== after.width || before.height !== after.height) {
      toBack(obj);
      return;
    }

    setTimeout(() => {
      try {
        const vehicle = getObj('graphic', obj.id);
        if (!vehicle) return;
        carry(vehicle, before, after, now);
        toBack(vehicle);
        pruneRecent(Date.now());
      } catch (err) {
        Logger.error(err && err.stack ? err.stack : err);
      }
    }, DEFER_MS);
  };

  // Outline: a temporary rectangle showing a vehicle's area. Recognized by its stroke color mark,
  // so outlines left over from before a sandbox restart can still be found.

  const Outline = (() => {
    const timers = {};
    const known = {};

    const isOutline = (path) => !!path && (known[path.id] ||
      String(path.get('stroke') || '').toLowerCase() === OUTLINE_STROKE);

    const clearTimer = (id) => {
      if (timers[id] !== undefined) {
        clearTimeout(timers[id]);
        delete timers[id];
      }
    };

    const removePath = (path) => {
      clearTimer(path.id);
      delete known[path.id];
      path.remove();
    };

    // Outlines on the page whose center lies on the vehicle
    const onVehicle = (vehicle) => {
      const poly = Geo.rect(Geo.num(vehicle.get('left')), Geo.num(vehicle.get('top')),
        Geo.num(vehicle.get('width')), Geo.num(vehicle.get('height')), Geo.num(vehicle.get('rotation')));
      return findObjs({ _type: 'pathv2', _pageid: vehicle.get('_pageid') }).filter(p => {
        if (!isOutline(p)) return false;
        const pt = { x: Geo.num(p.get('x')), y: Geo.num(p.get('y')) };
        const tiny = Geo.rect(pt.x, pt.y, 1, 1, 0);
        return Geo.overlapFraction(tiny, poly) > 0.5;
      });
    };

    const draw = (vehicle) => {
      const opts = Tag.parse(vehicle.get('tooltip'));
      const a = areaRect(snapshotOf(vehicle), opts.area);
      const path = createObj('pathv2', {
        _pageid: vehicle.get('_pageid'),
        layer: 'objects',
        stroke: OUTLINE_STROKE,
        stroke_width: OUTLINE_WIDTH,
        fill: 'transparent',
        shape: 'rec',
        points: JSON.stringify([[0, 0], [a.w, a.h]]),
        x: a.x,
        y: a.y,
        rotation: a.rotation,
        controlledby: ''
      });
      if (!path) return;
      known[path.id] = true;
      timers[path.id] = setTimeout(() => {
        delete timers[path.id];
        delete known[path.id];
        const p = getObj('pathv2', path.id);
        if (p) p.remove();
      }, OUTLINE_MS);
    };

    // Show if none is up for this vehicle, otherwise remove
    const toggle = (vehicle) => {
      const existing = onVehicle(vehicle);
      if (existing.length) {
        existing.forEach(removePath);
      } else {
        draw(vehicle);
      }
    };

    // An outline that is moved or resized stays up until used or toggled off
    const handleChange = (path) => {
      if (timers[path.id] !== undefined) clearTimer(path.id);
    };

    return { toggle, removePath, handleChange, isOutline };
  })();

  // Output

  const Output = {

    whisperTarget: (msg) => {
      const player = msg && msg.playerid ? getObj('player', msg.playerid) : null;
      return player ? player.get('_displayname') : 'gm';
    },

    whisper: (msg, html) => {
      if (html.includes('@{')) {
        Logger.error('Refusing to send a message containing a raw @{ reference.');
        return;
      }
      sendChat(scriptName, `/w "${Output.whisperTarget(msg)}" ${html}`, null, { noarchive: true });
    },

    button: (label, command, style, title) =>
      `<a style="${style || CSS.chip}" href="${command}"${title ? ` title="${title}"` : ''}>${label}</a>`,

    box: (title, body, sub) =>
      `<div style="${CSS.outer}"><div style="${CSS.box}">` +
      `<div style="${CSS.header}">${title}${sub ? ` <span style="${CSS.headerSub}">${sub}</span>` : ''}` +
      Output.button('?', `${commandName} --help`, CSS.helpButton, 'Help') +
      `</div>${body}</div></div>`,

    // Table of equal-width cells
    grid: (cells, cols) => {
      const width = Math.floor(100 / cols);
      let html = `<table style="${CSS.grid}">`;
      for (let i = 0; i < cells.length; i += cols) {
        html += '<tr>' + cells.slice(i, i + cols).map(c => `<td style="width:${width}%;padding:0;">${c}</td>`).join('') + '</tr>';
      }
      return html + '</table>';
    },

    tile: (icon, label, command, title) =>
      Output.button(`<span style="${CSS.tileIcon}">${icon}</span>${label}`, command, CSS.tile, title),

    error: (msg, text) => {
      Output.whisper(msg, Output.box('Vehicle', `<div style="${CSS.error}">${text}</div>`));
    }
  };

  // Commands (Single Root)

  const parseOnOff = (value) => {
    if (value === true) return true;
    const v = String(value).toLowerCase();
    if (['on', 'true', 'yes', '1'].includes(v)) return true;
    if (['off', 'false', 'no', '0'].includes(v)) return false;
    return null;
  };

  const parsePercent = (value) => {
    if (value === true) return null;
    const n = parseFloat(String(value).replace('%', ''));
    if (isNaN(n) || n <= 0 || n > 100) return null;
    return round1(n);
  };

  // --area clear | n | h,v | l,t,r,b  (percent inset from each side)
  const parseArea = (value) => {
    const v = String(value).trim().toLowerCase();
    if (v === 'clear') return NO_AREA.slice();
    const n = v.split(',').map(s => parseFloat(s.replace('%', '')));
    if (n.some(isNaN)) return null;
    let area = null;
    if (n.length === 1) area = [n[0], n[0], n[0], n[0]];
    if (n.length === 2) area = [n[0], n[1], n[0], n[1]];
    if (n.length === 4) area = n;
    return area && validArea(area) ? area.map(round1) : null;
  };

  // Tokens and the drawing (if any) a command acts on
  const getSelection = (msg, args) => {
    if (args.ids && args.ids !== true) return { tokens: getTargets(msg, args), path: null, error: null };
    const sel = msg.selected || [];
    const tokens = getTargets(msg, args);
    const paths = sel.filter(s => s._type === 'pathv2').map(s => getObj('pathv2', s._id)).filter(Boolean);
    if (!paths.length) return { tokens, path: null, error: null };
    if (paths.length === 1 && tokens.length === 1) return { tokens, path: paths[0], error: null };
    return { tokens, path: null, error: 'To set an area, select one vehicle and one rectangle drawn over it.' };
  };

  const Commands = {

    root: (msg, parsed) => {

      const { args } = parsed;

      if (!playerIsGM(msg.playerid)) {
        Output.error(msg, 'Vehicle commands are GM-only. Players can move vehicles they control.');
        return;
      }

      if (args.help) return Commands.help(msg);

      // Validate settings before acting on anything
      const set = {};
      if (args.rotate !== undefined) {
        set.rotate = parseOnOff(args.rotate);
        if (set.rotate === null) return Output.error(msg, '--rotate takes <b>on</b> or <b>off</b>.');
      }
      if (args.overlap !== undefined) {
        set.overlap = parsePercent(args.overlap);
        if (set.overlap === null) return Output.error(msg, '--overlap takes a percentage from 1 to 100.');
      }
      if (args.area !== undefined && args.area !== true) {
        set.area = parseArea(args.area);
        if (!set.area) return Output.error(msg, '--area takes <b>clear</b>, or insets in percent: one value for all sides, two for sides and ends, or four for left, top, right, bottom.');
      }
      const areaFromSelection = args.area === true;
      const changesSettings = args.define || areaFromSelection || Object.keys(set).length > 0;

      if (args.straighten) {
        Commands.straighten(msg, args);
      } else if (args.remove) {
        Commands.remove(msg, args);
      } else if (changesSettings) {
        Commands.apply(msg, args, set, areaFromSelection);
      }

      if (args.show) Commands.show(msg, args);
      if (args.ping) Commands.ping(msg, args);

      if (args.list) return Commands.list(msg);
      if (!changesSettings && !args.straighten && !args.remove && !args.show && !args.ping) return Commands.menu(msg);
    },

    // --define and the settings: rotate, overlap, area (by value or from a selected rectangle)
    apply: (msg, args, set, areaFromSelection) => {
      const { tokens, path, error } = getSelection(msg, args);
      if (error) return Output.error(msg, error);
      if (!tokens.length) {
        return Output.error(msg, args.define ? 'Select one or more tokens to make into vehicles.' : 'Select a vehicle first.');
      }
      if (areaFromSelection && !path) {
        return Output.error(msg, 'To set an area, draw a rectangle over the vehicle, then select both.');
      }

      const targets = args.define ? tokens : tokens.filter(isVehicle);
      if (!targets.length) return Output.error(msg, 'None of the selected tokens is a vehicle. Use Define to make one.');

      // Work out the area from the drawing before changing anything
      let drawnArea = null;
      if (path) {
        const vehicle = targets[0];
        if (offRightAngle(vehicle.get('rotation'))) {
          const name = vehicle.get('name') || 'This vehicle';
          return Output.whisper(msg, Output.box('Vehicle',
            `<div style="${CSS.error}">${name} is turned ${round1(Geo.normDeg(Geo.num(vehicle.get('rotation'))))}°. ` +
            `Its area can only be set at a right angle. Straighten it, then draw the area again.</div>` +
            `<div style="padding:0 5px 5px 5px;">` +
            Output.grid([Output.tile('↻', 'Straighten', `${commandName} --straighten --ids ${vehicle.id} --discard ${path.id}`,
              'Turn the vehicle to the nearest right angle and delete the rectangle')], 2) +
            `</div>`));
        }
        drawnArea = areaFromPath(vehicle, path);
        if (typeof drawnArea === 'string') return Output.error(msg, drawnArea);
      }

      targets.forEach(t => {
        const opts = Tag.parse(t.get('tooltip')) || { rotate: false, overlap: DEFAULT_OVERLAP, area: NO_AREA.slice() };
        if (set.rotate !== undefined) opts.rotate = set.rotate;
        if (set.overlap !== undefined) opts.overlap = set.overlap;
        if (set.area) opts.area = set.area;
        if (drawnArea) opts.area = drawnArea;
        Tag.write(t, opts);
        if (args.define) toBack(t);
      });

      if (path) Outline.removePath(path);
    },

    remove: (msg, args) => {
      const targets = getTargets(msg, args).filter(isVehicle);
      if (!targets.length) return Output.error(msg, 'None of the selected tokens is a vehicle.');
      targets.forEach(t => Tag.remove(t));
    },

    // Turns the vehicle to the nearest right angle (riders stay put) and deletes the rectangle
    straighten: (msg, args) => {
      const vehicle = getTargets(msg, args)[0];
      if (vehicle) {
        vehicle.set('rotation', nearestRightAngle(Geo.num(vehicle.get('rotation'))));
        toBack(vehicle);
      }
      if (args.discard && args.discard !== true) {
        const path = getObj('pathv2', String(args.discard));
        if (path) Outline.removePath(path);
      }
    },

    show: (msg, args) => {
      const targets = getTargets(msg, args).filter(isVehicle);
      if (!targets.length) return Output.error(msg, 'None of the selected tokens is a vehicle.');
      targets.forEach(Outline.toggle);
    },

    // --ping all pulls everyone's view to the vehicle; --ping alone pulls only the GM who asked
    ping: (msg, args) => {
      const t = getTargets(msg, args)[0];
      if (!t) return;
      const x = Geo.num(t.get('left'));
      const y = Geo.num(t.get('top'));
      if (String(args.ping).toLowerCase() === 'all') {
        sendPing(x, y, t.get('_pageid'), msg.playerid, true);
      } else {
        sendPing(x, y, t.get('_pageid'), msg.playerid, true, msg.playerid);
      }
    },

    passengerCount: (t) => findRiders(t.get('_pageid'), t.id, snapshotOf(t), Tag.parse(t.get('tooltip'))).length,

    areaText: (opts) => {
      if (!Tag.hasArea(opts)) return 'whole';
      const [l, t, r, b] = opts.area;
      return `${Math.round(100 - l - r)}×${Math.round(100 - t - b)}%`;
    },

    thumbUrl: (t) => String(t.get('imgsrc') || '').replace(/\/(max|med|original)\.(png|jpg|jpeg|gif|webp)/i, '/thumb.$2'),

    listRow: (t) => {
      const opts = Tag.parse(t.get('tooltip'));
      const ids = `--ids ${t.id}`;
      const name = t.get('name') || '[Unnamed]';
      const count = Commands.passengerCount(t);

      const image = Output.button(`<img src="${Commands.thumbUrl(t)}" style="${CSS.thumb}">`,
        `${commandName} --ping all ${ids}`, CSS.thumbBox, 'Ping and pull everyone to this vehicle');
      const title = Output.button(`<span style="${CSS.name}">${name}</span>`,
        `${commandName} --ping ${ids}`, CSS.nameLink, 'Ping and pull only your view to this vehicle');

      const chips =
        Output.button(`↻&nbsp;facing&nbsp;${opts.rotate ? 'on' : 'off'}`, `${commandName} --rotate ${opts.rotate ? 'off' : 'on'} ${ids} --list`,
          opts.rotate ? CSS.chipOn : CSS.chip, 'Turn riders\' facing with the vehicle') +
        Output.button(`${opts.overlap}%&nbsp;overlap`, `${commandName} --overlap ?{Percent of a token that must overlap the area|${opts.overlap}} ${ids} --list`,
          CSS.chip, 'How much of a token must overlap the area to ride') +
        Output.button(`▭&nbsp;${Commands.areaText(opts)}`, `${commandName} --show ${ids}`,
          CSS.chip, 'Show or hide an outline of the area') +
        (Tag.hasArea(opts)
          ? Output.button('clear', `${commandName} --area clear ${ids} --list`, CSS.chip, 'Use the whole token as the area')
          : '');

      return `<div style="${CSS.row}"><table style="width:100%;border-collapse:collapse;"><tr>` +
        `<td style="${CSS.thumbCell}">${image}</td>` +
        `<td style="vertical-align:top;padding:0 4px;">${title} <span style="${CSS.count}">${count} aboard</span><div>${chips}</div></td>` +
        `<td style="width:18px;vertical-align:top;padding:0;">` +
        Output.button('×', `${commandName} --remove ${ids} --list`, CSS.remove, 'Stop treating this token as a vehicle') +
        `</td></tr></table></div>`;
    },

    list: (msg) => {
      const pageid = getPageForPlayer(msg.playerid);
      const page = getObj('page', pageid);
      const vehicles = findObjs({ _type: 'graphic', _pageid: pageid }).filter(isVehicle)
        .sort((a, b) => (a.get('name') || '\uffff').localeCompare(b.get('name') || '\uffff'));

      const body = vehicles.length
        ? vehicles.map(Commands.listRow).join('')
        : `<div style="${CSS.empty}">No vehicles on this page.</div>`;

      const footer = `<div style="${CSS.row}">` +
        Output.button('Refresh', `${commandName} --list`, CSS.chip, 'Redraw this list') +
        Output.button('Menu', commandName, CSS.chip, 'Show the Vehicle menu') +
        `</div>`;

      Output.whisper(msg, Output.box('Vehicles', body + footer, page ? page.get('name') : ''));
    },

    menu: (msg) => {
      const tiles = [
        Output.tile('+', 'Define', `${commandName} --define`, 'Make the selected tokens vehicles'),
        Output.tile('↻', 'Define + rotate', `${commandName} --define --rotate on`, 'Make vehicles that also turn riders\' facing'),
        Output.tile('×', 'Remove', `${commandName} --remove`, 'Stop treating the selected tokens as vehicles'),
        Output.tile('▭', 'Set area', `${commandName} --area`, 'Set the area from the rectangle selected with the vehicle'),
        Output.tile('◌', 'Show area', `${commandName} --show`, 'Show or hide an outline of the area'),
        Output.tile('☰', 'List', `${commandName} --list`, 'Vehicles on your current page')
      ];
      Output.whisper(msg, Output.box('Vehicle',
        `<div style="padding:3px;">${Output.grid(tiles, 3)}</div>` +
        `<div style="${CSS.note}">Acts on selected tokens. For an area, select the vehicle and a rectangle.</div>`));
    },

    help: (msg) => {
      let handout = findObjs({ _type: 'handout', name: HELP_NAME })[0];
      if (!handout) {
        handout = createObj('handout', { name: HELP_NAME, archived: false });
        handout.set('avatar', HELP_AVATAR);
      }
      handout.set('notes', HELP_TEXT);

      const link = `http://journal.roll20.net/handout/${handout.get('_id')}`;
      Output.whisper(msg, Output.box('Vehicle Help',
        `<div style="padding:3px;">` +
        Output.grid([`<a href="${link}" target="_blank" style="${CSS.tile}"><span style="${CSS.tileText}">Open Help Handout</span></a>`], 1) +
        `</div>`));
    }

  };

  const HELP_TEXT = [
    '<h1>Vehicle Script Help</h1>',
    '<p>Vehicle turns a large token, such as a boat, raft, wagon, or mount, into something that carries other tokens. ',
    'When the vehicle moves or turns, every token on it moves with it, keeping the same position relative to the vehicle. ',
    'A token on the vehicle can still be moved freely. Drag it off the vehicle and it is no longer carried.</p>',

    '<h2>How it works</h2>',
    '<ul>',
    '<li>A vehicle is any token whose tooltip contains a <code>[vehicle]</code> tag. The script adds and removes the tag for you, but you can also type it by hand.</li>',
    '<li>Vehicles are kept at the back of their layer so tokens on them stay visible.</li>',
    '<li>When a vehicle moves, a token rides along if it is on the token layer and at least the vehicle\'s overlap percentage of it (50% by default) was on the vehicle\'s area before the move. Rotation of both the vehicle and the token is taken into account.</li>',
    '<li>Tokens are carried when the vehicle is dropped, not while it is being dragged.</li>',
    '<li>Vehicles are never carried by other vehicles.</li>',
    '<li>Moving a token on the vehicle never moves the vehicle.</li>',
    '</ul>',

    '<h2>Area</h2>',
    '<p>The area is the part of the vehicle where passengers are. By default it is the whole token. If the art has a transparent margin, set a smaller area:</p>',
    '<ol>',
    '<li>On the token layer, draw a rectangle over the part of the vehicle where passengers can be.</li>',
    '<li>Select the vehicle and the rectangle together.</li>',
    '<li>Click <b>Set area</b> in the menu, or <b>Define</b> if the token is not a vehicle yet. Any command that changes a vehicle\'s settings also sets the area when a rectangle is selected with it.</li>',
    '</ol>',
    '<p>The rectangle is deleted once the area is set. The vehicle must be at a right angle (0°, 90°, 180° or 270°) when you do this; if it is not, the script offers a <b>Straighten</b> button that turns it to the nearest right angle. Tokens on it are not moved when it is straightened.</p>',
    '<p>The area is kept as a percentage of the token, so it stays correct if the vehicle is resized, and it mirrors if the vehicle is flipped.</p>',
    '<p><b>Show area</b> draws a yellow outline of the area. It disappears after 10 seconds unless you move or resize it. Click Show area again to remove it. You can adjust the outline, select it with the vehicle and click Set area to use it.</p>',

    '<h2>Tag format</h2>',
    '<p><code>[vehicle|rotate|overlap:50|area:5,12,5,20]</code>. Settings at their default are left out, so a plain vehicle is just <code>[vehicle]</code>.</p>',
    '<ul>',
    '<li><code>rotate</code>: riders turn to match the vehicle\'s rotation. Useful for top-down tokens.</li>',
    '<li><code>overlap:N</code>: the percentage of a token that must overlap the area for it to ride. Default 50.</li>',
    '<li><code>area:l,t,r,b</code>: how far in from the left, top, right and bottom edges the area starts, in percent of the token\'s width and height.</li>',
    '</ul>',
    '<p>If a vehicle\'s tooltip is shown to players, they will see the tag.</p>',

    '<h2>Commands</h2>',
    '<p>All commands are GM-only and act on the selected tokens unless <code>--ids</code> is given.</p>',
    '<ul>',
    '<li><code>!vehicle</code>: shows the menu.</li>',
    '<li><code>!vehicle --define</code>: makes the tokens vehicles and sends them to the back. Can be combined with the settings below, for example <code>!vehicle --define --rotate on --overlap 75</code>.</li>',
    '<li><code>!vehicle --remove</code>: removes the vehicle tag. The token stays where it is.</li>',
    '<li><code>!vehicle --rotate on|off</code>: sets whether riders\' facing turns with the vehicle.</li>',
    '<li><code>!vehicle --overlap N</code>: sets the percentage (1 to 100) of a token that must overlap the area for it to ride.</li>',
    '<li><code>!vehicle --area</code>: sets the area from a rectangle selected with the vehicle.</li>',
    '<li><code>!vehicle --area l,t,r,b</code>: sets the area by value, in percent inset from each side. One value sets all four sides; two values set left and right, then top and bottom. <code>--area clear</code> returns to the whole token.</li>',
    '<li><code>!vehicle --show</code>: shows or hides an outline of the area.</li>',
    '<li><code>!vehicle --straighten</code>: turns the vehicle to the nearest right angle.</li>',
    '<li><code>!vehicle --ids id1,id2</code>: targets tokens by ID instead of selection.</li>',
    '<li><code>!vehicle --list</code>: lists the vehicles on your current page, with their settings and how many tokens are aboard. Click a setting to change it. Click a vehicle\'s picture to ping it and pull everyone\'s view to it, or its name to pull only your own view.</li>',
    '<li><code>!vehicle --ping</code>: pings the vehicle and pulls your view to it. <code>--ping all</code> pulls everyone.</li>',
    '<li><code>!vehicle --help</code>: opens this handout.</li>',
    '</ul>',

    '<h2>Limits</h2>',
    '<ul>',
    '<li>Undo (Ctrl-Z) on a vehicle move returns the vehicle but not its riders.</li>',
    '<li>Resizing a vehicle does not move its riders.</li>',
    '<li>If tokens on a vehicle are selected and dragged together with it, they are moved by the drag and not carried a second time.</li>',
    '<li>A vehicle moved by another script is only carried if that script calls <code>Vehicle.handleMove(token, prev)</code>.</li>',
    '<li>After a turn, riders can sit between grid lines. They are not snapped back to the grid.</li>',
    '</ul>'
  ].join('');

  // Input Handler

  const handleInput = (msg) => {

    if (msg.type !== 'api') return;

    const parsed = Parser.parse(msg.content);

    if (parsed.command.toLowerCase() !== commandName) return;

    try {
      Commands.root(msg, parsed);
    } catch (err) {
      Logger.error(err && err.stack ? err.stack : err);
      Output.error(msg, 'Something went wrong. See the API console for details.');
    }

  };

  // Event Registration

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
    on('change:graphic', handleGraphicChange);
    on('change:pathv2', (obj) => Outline.handleChange(obj));
  };

  // Initialization

  const checkInstall = () => {
    Logger.log(`v${version} [${new Date(lastUpdate * 1000)}]`);
    State.initialize();
    return true;
  };

  on('ready', () => {
    if (checkInstall()) {
      registerEventHandlers();
    }
  });

  // Public Interface

  return {
    // For other scripts that move a vehicle with set(): pass the token and its previous values
    handleMove: (token, prev) => {
      if (!isVehicle(token) || !prev) return 0;
      const after = snapshotOf(token);
      const pick = (k) => (prev[k] !== undefined ? prev[k] : token.get(k));
      const before = snapshot({
        left: pick('left'), top: pick('top'), width: pick('width'), height: pick('height'),
        rotation: pick('rotation'), fliph: pick('fliph'), flipv: pick('flipv')
      });
      const n = carry(token, before, after);
      toBack(token);
      return n;
    },
    isVehicle
  };

})();
