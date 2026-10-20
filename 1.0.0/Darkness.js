// Script:   Darkness
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
// Changelog
// 1.0.0 Initial release

const Darkness = (() => {
  'use strict';

  // Config
  const scriptName = 'Darkness';
  const version = '1.0.0';
  const lastUpdate = 1792477627; // unix timestamp, seconds
  const schemaVersion = 0.2;

  const DEBUG = false;

  // Images must be library images; the API can only set the "thumb" size, so these are converted on load
  const IMAGES = {
    target: 'https://files.d20.io/images/106697821/7jyLY5aNPjVADhQVDCCPxQ/original.png?1583469566',
    dark:   'https://files.d20.io/images/502771637/NYthbDPS4AS0l1XcdYN8Uw/original.webp?1790809321',
    fog:    'https://files.d20.io/images/502752998/hToUVetTo7CVR7I8FKAU4w/original.webp?1790796465'
  };

  // Default radius in feet for each effect type
  const PRESETS = { dark: 15, fog: 20 };

  // Size of the targeting token, in grid squares per side
  const TARGET_SQUARES = 2;

  // Character created by --setup
  const CHARACTER_NAME = 'Darkness Effect';
  const ABILITIES = [
    ['Menu', '!darkness'],
    ['Darkness', '!darkness --set dark'],
    ['Fog Cloud', '!darkness --set fog'],
    ['Custom', '!darkness --set ?{Effect|Darkness,dark|Fog Cloud,fog} ?{Radius in feet|15}'],
    ['Emanation', '!darkness --set ?{Effect|Darkness,dark|Fog Cloud,fog} ?{Radius in feet|15} --link @{target|Emanates from|token_id}'],
    ['Off', '!darkness --off'],
    ['Refresh', '!darkness --refresh'],
    ['Immune', '!darkness --immune ?{List|Darkness,dark|Fog Cloud,fog} @{target|Immune creature|token_id}'],
    ['Remove Immunity', '!darkness --unimmune ?{List|Darkness,dark|Fog Cloud,fog} @{target|Creature|token_id}']
  ];
  const NOTES_TEMPLATE = '<p>Darkness immune: </p><p>Fog immune: </p>';

  const FIELD_LAYER = 'foreground';
  const VISION_LAYER = 'objects';

  // Property pairs [on/off flag, degrees] saved and zeroed per group
  const GROUPS = {
    v: ['has_limit_field_of_vision', 'limit_field_of_vision_total'],
    n: ['has_limit_field_of_night_vision', 'limit_field_of_night_vision_total'],
    b: ['has_directional_bright_light', 'directional_bright_light_total'],
    d: ['has_directional_dim_light', 'directional_dim_light_total']
  };

  // Player-visibility flags switched off while a token is inside any field, so nothing shows through the image
  const HIDDEN = [
    'showplayers_name',
    'showplayers_bar1', 'showplayers_bar2', 'showplayers_bar3',
    'showplayers_aura1', 'showplayers_aura2'
  ];

  // Changes to these properties on an ordinary graphic cause it to be rechecked
  const WATCHED = [
    ...HIDDEN,
    'left', 'top', 'layer', 'represents',
    'emits_bright_light', 'emits_low_light',
    'has_night_vision',
    'has_limit_field_of_vision', 'limit_field_of_vision_total',
    'has_limit_field_of_night_vision', 'limit_field_of_night_vision_total',
    'has_directional_bright_light', 'directional_bright_light_total',
    'has_directional_dim_light', 'directional_dim_light_total'
  ];

  // Changes to these properties on a field graphic cause its page to be rechecked
  const FIELD_WATCHED = ['left', 'top', 'layer'];

  // CSS (chat cards; Roll20 chat has no flexbox, so layout is block, inline-block, float and tables)
  const COLORS = {
    dark: { border: '#5a4ea0', chipBg: '#2d2650', chipText: '#e3dcff', fill: '#8b7cf6' },
    fog: { border: '#4d6d88', chipBg: '#22313d', chipText: '#d6e8f6', fill: '#5f86a8' },
    target: { border: '#7a673d', chipBg: '#3a321f', chipText: '#ffe6b0' }
  };

  const CSS = {
    card: "background:#17171c;border:1px solid #2c2c35;border-radius:10px;color:#e6e6ea;font-size:14px;line-height:1.4;overflow:hidden;font-family:system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif;",
    head: 'padding:9px 11px 8px 11px;border-bottom:1px solid #2c2c35;',
    title: 'font-size:16px;font-weight:700;letter-spacing:0.2px;color:#ffffff;',
    sub: 'font-size:13px;color:#cfcfd8;',
    helpBtn: 'float:right;display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#24242c;border:1px solid #4a4a58;color:#ffffff;font-weight:700;font-size:13px;text-decoration:none;margin-top:2px;',
    body: 'padding:10px 11px 11px 11px;',
    panel: 'margin:8px 8px 0 8px;background:#21212a;border-radius:8px;overflow:hidden;border:2px solid ',
    stripe: 'padding:6px 10px;background:',
    panelBody: 'padding:8px 10px 6px 10px;',
    nameLink: 'display:inline;background:none;background-color:transparent;border:none;border-radius:0;padding:0;margin:0;color:#ffffff;font-weight:normal;text-decoration:underline;',
    panelName: 'padding:0;font-size:15px;font-weight:700;color:#ffffff;',
    chip: 'display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.4px;border-radius:9px;padding:2px 8px;',
    note: 'font-size:13px;color:#cfcfd8;margin:0 0 6px 0;',
    label: 'font-size:13px;font-weight:700;letter-spacing:0.6px;color:#b9b9c6;margin:6px 0 4px 0;',
    btn: 'display:block;text-align:center;padding:4px 1px;border-radius:6px;text-decoration:none;background:#24242c;border:1px solid #3a3a46;',
    btnGrid: 'width:100%;border-collapse:collapse;table-layout:fixed;',
    btnCell: 'padding:0 1px 4px 1px;vertical-align:top;',
    btnText: 'color:#e6e6ea;',
    btnDangerBorder: 'border-color:#4a2f33;',
    btnDangerText: 'color:#ff9b9b;',
    btnSelText: 'color:#ffffff;font-weight:700;',
    primary: 'display:block;background:#8b7cf6;text-align:center;font-weight:700;font-size:15px;border-radius:7px;padding:8px 0;text-decoration:none;',
    primarySmall: 'display:inline-block;background:#8b7cf6;border:1px solid #8b7cf6;border-radius:6px;padding:3px 9px;text-decoration:none;font-weight:700;',
    white: 'color:#ffffff;',
    footer: 'margin-top:8px;padding:9px 11px 10px 11px;border-top:1px solid #2c2c35;background:#1c1c22;',
    hint: 'font-size:13px;color:#cfcfd8;margin-top:8px;',
    warn: 'color:#ffc9a8;margin-bottom:8px;',
    error: 'color:#ff9b9b;',
    code: "display:inline-block;background:#2b2b35;border-radius:4px;padding:0 5px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;color:#cfc4ff;",
    tag: 'display:inline-block;background:#2b2b35;border-radius:4px;padding:0 5px;font-size:13px;',
    helpText: 'color:#cfcfd8;',
    helpRow: 'margin-bottom:6px;',
    table: 'width:100%;border-collapse:collapse;',
    cellRight: 'padding:0;text-align:right;'
  };

  // Logger
  const Logger = {
    log: (msg) => log(`${scriptName} | ${msg}`),
    debug: (msg) => {
      if (DEBUG) log(`${scriptName} [DEBUG] | ${msg}`);
    },
    error: (msg) => log(`${scriptName} [ERROR] | ${msg}`)
  };

  // State
  // fields: { [graphicId]: { t:'dark'|'fog', r:feet, pg:pageId, im:{ dark:[charIds], fog:[charIds] }, ln?:tokenId } }
  //   ln: token the field emanates from; radius is then measured from the edge of that token's space
  // saved:  { [graphicId]: { v|n|b|d: [flag, degrees] } }  original values of anything this script changed; h: [HIDDEN flags]
  // setup:  { fp: fingerprint of the last character update, names: [ability names this script created] }
  const State = {

    initialize: () => {
      if (!state[scriptName] || state[scriptName].version !== schemaVersion) {
        Logger.log(`Updating Schema to v${schemaVersion}`);
        switch (state[scriptName] && state[scriptName].version) {
          case 0.1:
            state[scriptName].setup = { fp: '', names: [] };
            state[scriptName].version = schemaVersion;
            break;
          default:
            state[scriptName] = {
              version: schemaVersion,
              fields: {},
              saved: {},
              setup: { fp: '', names: [] }
            };
            break;
        }
      }
    },

    get: () => state[scriptName],
    fields: () => state[scriptName].fields,
    saved: () => state[scriptName].saved,
    setup: () => state[scriptName].setup
  };

  // Utilities
  const Util = {

    thumb: (url) => (url || '').replace(/\/(original|max|med)\.(png|jpe?g|gif|webp)/i, '/thumb.$2'),

    imageKey: (url) => {
      const m = (url || '').match(/\/images\/(\d+)\//);
      return m ? m[1] : '';
    },

    cellPx: (page) => 70 * (parseFloat(page.get('snapping_increment')) || 1),

    radiusPx: (page, feet) => {
      const scale = parseFloat(page.get('scale_number')) || 5;
      return (feet / scale) * Util.cellPx(page);
    },

    isInside: (obj, field, radiusPx) => {
      const dx = obj.get('left') - field.get('left');
      const dy = obj.get('top') - field.get('top');
      return Math.sqrt(dx * dx + dy * dy) < radiusPx;
    },

    decodeNotes: (html) => {
      if (!html || html === 'null') return '';
      let text = html;
      if (/%3C/i.test(text)) {
        try { text = unescape(text); } catch (e) { /* notes were not escaped */ }
      }
      return text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li)>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ');
    },

    parseImmunities: (html) => {
      const text = Util.decodeNotes(html);
      const read = (label) => {
        const m = text.match(new RegExp(`${label}[ \\t]*immune[ \\t]*:[ \\t]*([^\\n]*)`, 'i'));
        return m ? m[1].split(/[\s,]+/).filter(s => s.length) : [];
      };
      return { dark: read('darkness'), fog: read('fog') };
    },

    // Add or remove an ID on the "Darkness immune:" or "Fog immune:" line of GM Notes HTML; adds the line if missing
    editImmunityNotes: (html, type, id, add) => {
      let notes = (!html || html === 'null') ? '' : html;
      if (/%3C/i.test(notes)) {
        try { notes = unescape(notes); } catch (e) { /* notes were not escaped */ }
      }
      const label = type === 'dark' ? 'Darkness' : 'Fog';
      const re = new RegExp(`(${label}\\s*immune\\s*:)([^<\\n]*)`, 'i');
      const match = notes.match(re);
      const ids = match ? match[2].replace(/&nbsp;/gi, ' ').split(/[\s,]+/).filter(s => s.length) : [];
      const next = add ? (ids.includes(id) ? ids : ids.concat(id)) : ids.filter(x => x !== id);
      if (match) return notes.replace(re, `$1 ${next.join(', ')}`);
      return add ? `${notes}<p>${label} immune: ${next.join(', ')}</p>` : notes;
    },

    whisperTarget: (msg) => {
      const player = getObj('player', msg.playerid);
      return player ? player.get('displayname') : 'gm';
    }
  };

  const IMG = {
    target: Util.thumb(IMAGES.target),
    dark: Util.thumb(IMAGES.dark),
    fog: Util.thumb(IMAGES.fog)
  };

  // Parser
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
          } else if (args[currentKey] === true) {
            args[currentKey] = token;
          } else {
            args[currentKey] += ` ${token}`;
          }
        }
      });

      return { command, args };
    },

    // "dark 15" | "fog" | "darkness 20" -> { type, radius }
    parseSet: (value) => {
      const parts = (value === true ? '' : String(value)).trim().toLowerCase().split(/\s+/);
      const t = parts[0] || 'dark';
      const type = /^dark/.test(t) ? 'dark' : (/^fog/.test(t) ? 'fog' : null);
      if (!type) return null;
      const r = parseFloat(parts[1]);
      return { type, radius: (r > 0) ? r : PRESETS[type] };
    }
  };

  // Output
  const Output = {

    // Escape a chat-button command so sendChat leaves queries and target calls for the click
    escapeCommand: (cmd) => cmd
      .replace(/\|/g, '&#124;')
      .replace(/,/g, '&#44;')
      .replace(/\}/g, '&#125;')
      .replace(/\?\{/g, '&#63;{')
      .replace(/@\{/g, '&#64;{'),

    // Buttons are links; the inner span keeps Roll20 from forcing its own link color
    button: (text, cmd, opts = {}) => {
      let style = CSS.btn;
      let textStyle = CSS.btnText;
      if (opts.danger) {
        style += CSS.btnDangerBorder;
        textStyle = CSS.btnDangerText;
      }
      if (opts.selected) {
        style += `background:${opts.selected};border-color:${opts.selected};`;
        textStyle = CSS.btnSelText;
      }
      const title = opts.title ? ` title="${opts.title}"` : '';
      return `<a href="${Output.escapeCommand(cmd)}" style="${style}"${title}><span style="${textStyle}">${text}</span></a>`;
    },

    primary: (text, cmd, small) =>
      `<a href="${Output.escapeCommand(cmd)}" style="${small ? CSS.primarySmall : CSS.primary}"><span style="${CSS.white}">${text}</span></a>`,

    // Buttons in rows of `cols`; a table, since Roll20 chat does not honor box-sizing for percentage widths
    grid: (cols, ...buttons) => {
      const list = buttons.filter(Boolean);
      const cell = `${CSS.btnCell}width:${(100 / cols).toFixed(2)}%;`;
      let rows = '';
      for (let i = 0; i < list.length; i += cols) {
        let cells = '';
        for (let c = 0; c < cols; c++) cells += `<td style="${cell}">${list[i + c] || ''}</td>`;
        rows += `<tr>${cells}</tr>`;
      }
      return `<table style="${CSS.btnGrid}">${rows}</table>`;
    },

    // Card frame with title, subtitle and the help button
    card: (title, sub, inner) =>
      `<div style="${CSS.card}">` +
      `<div style="${CSS.head}">` +
      `<a href="!darkness --help" style="${CSS.helpBtn}" title="Help"><span style="${CSS.white}">?</span></a>` +
      `<div style="${CSS.title}">${title}</div>` +
      (sub ? `<div style="${CSS.sub}">${sub}</div>` : '') +
      `</div>${inner}</div>`,

    toGM: (html) => {
      sendChat(scriptName, `/w gm ${html}`, null, { noarchive: true });
    },

    whisper: (msg, html) => {
      sendChat(scriptName, `/w "${Util.whisperTarget(msg)}" ${html}`, null, { noarchive: true });
    },

    error: (msg, text) => {
      Output.whisper(msg, Output.card(scriptName, '', `<div style="${CSS.body}"><div style="${CSS.error}">${text}</div></div>`));
    }
  };

  // Core field logic
  const Core = {

    // Effective radius in pixels; an emanation adds half the linked token's size
    getFieldRadiusPx: (page, data, anchor) => {
      const base = Util.radiusPx(page, data.r);
      if (!anchor) return base;
      return base + Math.max(anchor.get('width'), anchor.get('height')) / 2;
    },

    // Keep a linked field centered on its token and sized to its emanation
    syncLinked: (obj, data, anchor, page) => {
      const size = Core.getFieldRadiusPx(page, data, anchor) * 2;
      const update = {};
      if (obj.get('left') !== anchor.get('left')) update.left = anchor.get('left');
      if (obj.get('top') !== anchor.get('top')) update.top = anchor.get('top');
      if (obj.get('width') !== size) update.width = size;
      if (obj.get('height') !== size) update.height = size;
      if (Object.keys(update).length) obj.set(update);
    },

    // Remove a field whose linked token is gone
    removeField: (id) => {
      const obj = getObj('graphic', id);
      delete State.fields()[id];
      if (obj) obj.remove();
    },

    // Active fields on a page as [{ obj, data, rPx }]; drops records whose graphic or linked token no longer exists
    getPageFields: (pageId) => {
      const fields = State.fields();
      const page = getObj('page', pageId);
      const out = [];
      Object.keys(fields).forEach(id => {
        const data = fields[id];
        if (data.pg !== pageId) return;
        const obj = getObj('graphic', id);
        if (!obj || !page) {
          delete fields[id];
          return;
        }
        let anchor = null;
        if (data.ln) {
          anchor = getObj('graphic', data.ln);
          if (!anchor || anchor.get('pageid') !== pageId) {
            Core.removeField(id);
            return;
          }
          Core.syncLinked(obj, data, anchor, page);
        }
        out.push({ obj, data, rPx: Core.getFieldRadiusPx(page, data, anchor) });
      });
      return out;
    },

    // Ids of active fields linked to a token
    getLinkedFieldIds: (tokenId) => {
      const fields = State.fields();
      return Object.keys(fields).filter(id => fields[id].ln === tokenId);
    },

    // Which groups should be zeroed for this graphic
    getDesired: (obj, pageFields) => {
      const want = { v: false, n: false, b: false, d: false, h: false };
      if (State.fields()[obj.id]) return want;

      const charId = obj.get('represents');
      const onVisionLayer = obj.get('layer') === VISION_LAYER;
      const emitsBright = obj.get('emits_bright_light') === true;
      const emitsDim = obj.get('emits_low_light') === true;

      pageFields.forEach(f => {
        if (!Util.isInside(obj, f.obj, f.rPx)) return;
        const immune = charId && (f.data.im[f.data.t] || []).includes(charId);
        // Nameplate, bars and auras are hidden from players regardless of immunity
        if (onVisionLayer) want.h = true;
        if (onVisionLayer && !immune) {
          want.v = true;
          want.n = true;
        }
        if (f.data.t === 'dark') {
          if (emitsBright) want.b = true;
          if (emitsDim) want.d = true;
        }
      });
      return want;
    },

    // Apply desired state to one graphic, saving or restoring originals as needed
    processGraphic: (obj, pageFields) => {
      if (!obj || obj.get('subtype') !== 'token') return;
      const fields = pageFields || Core.getPageFields(obj.get('pageid'));
      const saved = State.saved();
      const want = Core.getDesired(obj, fields);
      const rec = saved[obj.id] || {};
      const update = {};

      Object.keys(GROUPS).forEach(g => {
        const [flag, total] = GROUPS[g];
        if (want[g]) {
          if (!rec[g]) rec[g] = [obj.get(flag) === true, parseFloat(obj.get(total)) || 0];
          if (obj.get(flag) !== true) update[flag] = true;
          if (parseFloat(obj.get(total)) !== 0) update[total] = 0;
        } else if (rec[g]) {
          update[flag] = rec[g][0];
          update[total] = rec[g][1];
          delete rec[g];
        }
      });

      // h: original HIDDEN flags, in order
      if (want.h) {
        if (!rec.h) rec.h = HIDDEN.map(p => obj.get(p) === true);
        HIDDEN.forEach(p => {
          if (obj.get(p) !== false) update[p] = false;
        });
      } else if (rec.h) {
        HIDDEN.forEach((p, i) => { update[p] = rec.h[i]; });
        delete rec.h;
      }

      if (Object.keys(rec).length) saved[obj.id] = rec;
      else delete saved[obj.id];

      if (Object.keys(update).length) {
        Logger.debug(`${obj.get('name') || obj.id}: ${JSON.stringify(update)}`);
        obj.set(update);
      }
    },

    // Recheck every graphic on a page
    refreshPage: (pageId) => {
      const pageFields = Core.getPageFields(pageId);
      const graphics = findObjs({ _type: 'graphic', _pageid: pageId, _subtype: 'token' });
      graphics.forEach(g => Queue.add(() => Core.processGraphic(getObj('graphic', g.id), pageFields)));
    },

    // Read immunity lists from the field's character GM notes, then call back
    loadImmunities: (obj, done) => {
      const empty = { dark: [], fog: [] };
      const character = getObj('character', obj.get('represents'));
      if (!character) return done(empty);
      character.get('gmnotes', (notes) => {
        try {
          done(Util.parseImmunities(notes));
        } catch (err) {
          Logger.error(`Immunity read failed: ${err.message}`);
          done(empty);
        }
      });
    },

    // Graphic is an active field, or shows the targeting, darkness or fog image (covers pasted copies)
    isFieldToken: (obj) => {
      if (!obj || obj.get('type') !== 'graphic') return false;
      if (State.fields()[obj.id]) return true;
      const key = Util.imageKey(obj.get('imgsrc'));
      return [IMG.target, IMG.dark, IMG.fog].some(url => Util.imageKey(url) === key);
    },

    // Field was resized by hand: take the radius from its width, snapped to the page scale, and square it up
    resizeField: (obj) => {
      const data = State.fields()[obj.id];
      const page = getObj('page', obj.get('pageid'));
      if (!data || !page) return;
      const scale = parseFloat(page.get('scale_number')) || 5;
      const rawFeet = (obj.get('width') / 2) / Util.cellPx(page) * scale;
      const radius = Math.max(scale, Math.round(rawFeet / scale) * scale);
      const size = Util.radiusPx(page, radius) * 2;
      data.r = radius;
      obj.set({ width: size, height: size });
    },

    // linkId: token to emanate from; omitted keeps any existing link; onDone runs after the field is set
    setField: (obj, type, radius, linkId, onDone) => {
      const page = getObj('page', obj.get('pageid'));
      if (!page) return;
      const existing = State.fields()[obj.id];
      const ln = linkId || (existing && existing.ln) || null;
      const anchor = ln ? getObj('graphic', ln) : null;

      Core.loadImmunities(obj, (im) => {
        const data = { t: type, r: radius, pg: page.id, im };
        if (anchor) data.ln = anchor.id;
        State.fields()[obj.id] = data;
        const size = Core.getFieldRadiusPx(page, data, anchor) * 2;
        const update = {
          imgsrc: IMG[type],
          width: size,
          height: size,
          layer: FIELD_LAYER,
          renderAsScenery: false,
          renderAsDarkness: false
        };
        if (anchor) {
          update.left = anchor.get('left');
          update.top = anchor.get('top');
        }
        obj.set(update);
        Core.stackFields(page.id);
        Core.refreshPage(page.id);
        if (onDone) onDone(obj, data);
      });
    },

    unlinkField: (obj) => {
      const data = State.fields()[obj.id];
      if (!data || !data.ln) return;
      const page = getObj('page', obj.get('pageid'));
      delete data.ln;
      if (page) {
        const size = Util.radiusPx(page, data.r) * 2;
        obj.set({ width: size, height: size });
        Core.refreshPage(page.id);
      }
    },

    // Darkness images draw above fog images, so an overlap reads as darkness
    stackFields: (pageId) => {
      const fields = State.fields();
      Object.keys(fields)
        .filter(id => fields[id].pg === pageId && fields[id].t === 'dark')
        .forEach(id => {
          const obj = getObj('graphic', id);
          if (obj) toFront(obj);
        });
    },

    // Remove an effect token entirely and restore everything it affected
    deleteEffect: (obj) => {
      const pageId = obj.get('pageid');
      delete State.fields()[obj.id];
      Core.getLinkedFieldIds(obj.id).forEach(id => Core.removeField(id));
      delete State.saved()[obj.id];
      obj.remove();
      Core.refreshPage(pageId);
    },

    clearField: (obj) => {
      const page = getObj('page', obj.get('pageid'));
      delete State.fields()[obj.id];
      if (page) {
        const size = Util.cellPx(page) * TARGET_SQUARES;
        obj.set({ imgsrc: IMG.target, width: size, height: size });
        Core.refreshPage(page.id);
      }
    },

    // Fingerprint of everything setup writes to the character; a change means the character is stale
    getSetupFingerprint: () => {
      const text = JSON.stringify([ABILITIES, IMG.target, TARGET_SQUARES]);
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
      }
      return String(hash);
    },

    // Write avatar, token actions and default token; GM notes are never touched. Returns an error string or null
    updateCharacter: (character, pageId) => {
      const setup = State.setup();
      character.set('avatar', IMG.target);

      const current = ABILITIES.map(([name]) => name);
      ABILITIES.forEach(([name, action]) => {
        const existing = findObjs({ _type: 'ability', _characterid: character.id, name })[0];
        if (existing) {
          existing.set({ action, istokenaction: true });
        } else {
          createObj('ability', { _characterid: character.id, name, action, istokenaction: true });
        }
      });

      // Remove buttons this script created earlier but no longer defines; abilities added by hand are left alone
      (setup.names || []).filter(name => !current.includes(name)).forEach(name => {
        findObjs({ _type: 'ability', _characterid: character.id, name }).forEach(a => a.remove());
      });
      setup.names = current;

      // A default token can only be set from a token on a page, so create one briefly
      const page = getObj('page', pageId);
      if (!page) return 'Could not find a page to build the default token on.';
      const size = Util.cellPx(page) * TARGET_SQUARES;

      const temp = createObj('graphic', {
        _subtype: 'token',
        _pageid: page.id,
        layer: 'gmlayer',
        imgsrc: IMG.target,
        left: size / 2,
        top: size / 2,
        width: size,
        height: size,
        name: CHARACTER_NAME,
        showname: false,
        represents: character.id,
        has_bright_light_vision: false,
        emits_bright_light: false,
        emits_low_light: false
      });
      if (!temp) return 'Could not create the default token. Check that the targeting image URL is valid.';
      setDefaultTokenForCharacter(character, temp);
      temp.remove();

      setup.fp = Core.getSetupFingerprint();
      return null;
    },

    // At startup: update an existing effect character if the script's button definitions changed
    autoUpdateCharacter: () => {
      if (State.setup().fp === Core.getSetupFingerprint()) return;
      const character = findObjs({ _type: 'character', name: CHARACTER_NAME })[0];
      if (!character) return;
      const error = Core.updateCharacter(character, Campaign().get('playerpageid'));
      if (error) Logger.error(error);
      else Logger.log(`Updated ${CHARACTER_NAME} character`);
    },

    // Reload immunities for every active field, then recheck every affected page
    refreshAll: () => {
      const fields = State.fields();
      const ids = Object.keys(fields);
      let pending = ids.length;

      const finish = () => {
        const pages = new Set(Object.keys(fields).map(id => fields[id].pg));
        Object.keys(State.saved()).forEach(id => {
          const g = getObj('graphic', id);
          if (g) pages.add(g.get('pageid'));
          else delete State.saved()[id];
        });
        pages.forEach(pg => Core.refreshPage(pg));
      };

      if (!pending) return finish();

      ids.forEach(id => {
        const obj = getObj('graphic', id);
        if (!obj) {
          delete fields[id];
          if (--pending === 0) finish();
          return;
        }
        Core.loadImmunities(obj, (im) => {
          if (fields[id]) fields[id].im = im;
          if (--pending === 0) finish();
        });
      });
    }
  };

  // Effect tokens: targeting tokens and active fields, labeled A, B, C... per page
  const Effects = {

    list: (pageId) => findObjs({ _type: 'graphic', _pageid: pageId }).filter(o => Core.isFieldToken(o)),

    letter: (obj) => {
      const m = (obj.get('name') || '').match(/^(?:Effect|Darkness|Fog) ([A-Z])$/);
      return m ? m[1] : null;
    },

    prefix: (obj) => {
      const f = State.fields()[obj.id];
      if (!f) return 'Effect';
      return f.t === 'dark' ? 'Darkness' : 'Fog';
    },

    // Give every effect token on the page a unique letter and a GM-only nameplate; returns them sorted by letter
    ensureLabels: (pageId) => {
      const tokens = Effects.list(pageId);
      const claimed = new Set();
      const unlabeled = [];
      tokens.forEach(o => {
        const L = Effects.letter(o);
        if (L && !claimed.has(L)) claimed.add(L);
        else unlabeled.push(o);
      });
      unlabeled.forEach(o => {
        const free = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(c => !claimed.has(c)) || 'Z';
        claimed.add(free);
        o.set('name', `Effect ${free}`);
      });
      tokens.forEach(o => {
        const name = `${Effects.prefix(o)} ${Effects.letter(o)}`;
        const update = {};
        if (o.get('name') !== name) update.name = name;
        if (o.get('showname') !== true) update.showname = true;
        if (o.get('showplayers_name') !== false) update.showplayers_name = false;
        if (Object.keys(update).length) o.set(update);
      });
      return tokens.sort((a, b) => Effects.letter(a).localeCompare(Effects.letter(b)));
    }
  };

  // Chat menu
  const Menu = {

    timers: {},

    // Immune creatures with a token on this page, by name; clicking pulls the GM to the token, hovering shows the character ID
    names: (ids, pageId) => {
      const links = (ids || []).map(id => {
        const token = findObjs({ _type: 'graphic', _pageid: pageId, represents: id })[0];
        if (!token) return null;
        const c = getObj('character', id);
        const name = (c && c.get('name')) || token.get('name') || id;
        return `<a href="!darkness --goto ${token.id}" title="${id}" style="${CSS.nameLink}"><span style="${CSS.nameLink}">${name}</span></a>`;
      }).filter(Boolean);
      return links.join(', ');
    },

    // "Label: names" pairs with names present, joined; nothing when every list is empty
    immunityLine: (pairs) => {
      const parts = pairs.filter(([, names]) => names).map(([label, names]) => `${label}: ${names}`);
      return parts.length ? `<div style="${CSS.note}">${parts.join(' · ')}</div>` : '';
    },

    renderEffect: (obj, im, pageId) => {
      const id = obj.id;
      const f = State.fields()[id];
      const field = ` --field ${id}`;
      const typeQuery = '?{Effect|Darkness,dark|Fog Cloud,fog}';
      const label = (text) => `<div style="${CSS.label}">${text}</div>`;
      const open = (colors, chipText, note) =>
        `<div style="${CSS.panel}${colors.border};">` +
        `<div style="${CSS.stripe}${colors.border};"><table style="${CSS.table}"><tr><td style="${CSS.panelName}">${obj.get('name')}</td>` +
        `<td style="${CSS.cellRight}"><span style="${CSS.chip}background:${colors.chipBg};color:${colors.chipText};">${chipText}</span></td></tr></table></div>` +
        `<div style="${CSS.panelBody}">` +
        (note ? `<div style="${CSS.note}">${note}</div>` : '');
      const close = '</div></div>';

      if (!f) {
        return open(COLORS.target, 'TARGETING', 'Not active. Choose a type to turn it on.') +
          label('TYPE') +
          Output.grid(2,
            Output.button('Darkness', `!darkness --set dark${field}`),
            Output.button('Fog Cloud', `!darkness --set fog${field}`),
            Output.button('Custom', `!darkness --set ${typeQuery} ?{Radius in feet|15}${field}`),
            Output.button('Emanation', `!darkness --set ${typeQuery} ?{Radius in feet|15} --link @{target|Emanates from|token_id}${field}`)
          ) +
          label('IMMUNITY') +
          Menu.immunityLine([['Darkness', Menu.names(im.dark, pageId)], ['Fog', Menu.names(im.fog, pageId)]]) +
          Output.grid(2,
            Output.button('+ Immune', `!darkness --immune ?{List|Darkness,dark|Fog Cloud,fog} @{target|Immune creature|token_id}${field}`),
            Output.button('− Remove', `!darkness --unimmune ?{List|Darkness,dark|Fog Cloud,fog} @{target|Creature|token_id}${field}`)
          ) +
          label('EFFECT') +
          Output.grid(3,
            Output.button('Locate', `!darkness --locate${field}`),
            Output.button('Delete', `!darkness --delete${field}`, { danger: true })
          ) +
          close;
      }

      const colors = COLORS[f.t];
      const typeWord = f.t === 'dark' ? 'darkness' : 'fog';
      const anchor = f.ln ? getObj('graphic', f.ln) : null;
      let note = '';
      if (anchor) {
        const c = getObj('character', anchor.get('represents'));
        note = `Emanates from ${anchor.get('name') || (c && c.get('name')) || 'a token'}`;
      }

      return open(colors, `${f.t === 'dark' ? 'DARKNESS' : 'FOG'} · ${f.r} FT${f.ln ? ' EMANATION' : ''}`, note) +
        label('TYPE') +
        Output.grid(2,
          Output.button('Darkness', `!darkness --set dark ${f.r}${field}`, { selected: f.t === 'dark' ? COLORS.dark.fill : null }),
          Output.button('Fog Cloud', `!darkness --set fog ${f.r}${field}`, { selected: f.t === 'fog' ? COLORS.fog.fill : null }),
          Output.button('Custom', `!darkness --set ${typeQuery} ?{Radius in feet|${f.r}}${field}`),
          Output.button('Emanation', `!darkness --set ${typeQuery} ?{Radius in feet|${f.r}} --link @{target|Emanates from|token_id}${field}`)
        ) +
        label('IMMUNITY') +
        Menu.immunityLine([[`Sees through ${typeWord}`, Menu.names(im[f.t], pageId)]]) +
        Output.grid(2,
          Output.button('+ Immune', `!darkness --immune ${f.t} @{target|Immune creature|token_id}${field}`),
          Output.button('− Remove', `!darkness --unimmune ${f.t} @{target|Creature|token_id}${field}`)
        ) +
        label('EFFECT') +
        Output.grid(f.ln ? 4 : 3,
          Output.button('Locate', `!darkness --locate${field}`),
          (f.ln ? Output.button('Unlink', `!darkness --unlink${field}`) : ''),
          Output.button('Off', `!darkness --off${field}`),
          Output.button('Delete', `!darkness --delete${field}`, { danger: true })
        ) +
        close;
    },

    render: (pageId, notes) => {
      const page = getObj('page', pageId);
      const pageName = page ? (page.get('name') || 'Untitled') : 'Unknown';
      Core.getPageFields(pageId); // keeps emanations on their creatures before drawing
      const tokens = Effects.ensureLabels(pageId);
      const im = Util.parseImmunities(notes);
      const place = `!darkness --place --page ${pageId}`;

      if (!tokens.length) {
        return Output.card('Darkness', `Page: ${pageName} · no effects placed`,
          `<div style="${CSS.body}">` +
          Output.primary('Place Darkness Token', place) +
          `<div style="${CSS.hint}">Placed beside the selected token, or at the center of a selected group. With nothing selected it goes to the middle of the page and your view is pulled there.</div>` +
          `</div>`);
      }

      const sections = tokens.map(o => Menu.renderEffect(o, im, pageId)).join('');
      const footer = `<div style="${CSS.footer}">` +
        `<div style="${CSS.label}margin-top:0;">ALL EFFECTS ON THIS PAGE</div>` +
        Output.grid(3,
          Output.button('All Off', `!darkness --alloff --page ${pageId}`),
          Output.button('Delete All', `!darkness --deleteall ?{Delete every effect on this page?|No|Yes} --page ${pageId}`, { danger: true }),
          Output.button('Refresh', `!darkness --refresh --page ${pageId}`)
        ) +
        `<div style="margin-top:4px;">${Output.primary('+ Place Another', place, true)}</div>` +
        `</div>`;
      return Output.card('Darkness', `Page: ${pageName} · ${tokens.length} effect${tokens.length === 1 ? '' : 's'}`, sections + footer);
    },

    send: (pageId) => {
      const character = findObjs({ _type: 'character', name: CHARACTER_NAME })[0];
      const finish = (notes) => {
        try {
          Output.toGM(Menu.render(pageId, notes));
        } catch (err) {
          Logger.error(`Menu failed: ${err.message || err}`);
        }
      };
      if (!character) return finish('');
      character.get('gmnotes', finish);
    },

    // Several changes in a row produce one menu
    queue: (pageId) => {
      if (!pageId) return;
      clearTimeout(Menu.timers[pageId]);
      Menu.timers[pageId] = setTimeout(() => {
        delete Menu.timers[pageId];
        Menu.send(pageId);
      }, 250);
    },

    sendStale: () => {
      Output.toGM(Output.card('Darkness', '',
        `<div style="${CSS.body}"><div style="${CSS.warn}">That effect no longer exists. The button came from an older menu.</div>` +
        Output.primary('Show Current Menu', '!darkness', true) + `</div>`));
    }
  };

  // Commands
  const Commands = {

    root: (msg, parsed) => {
      const { args } = parsed;

      if (!Object.keys(args).length || args.menu) return Commands.menu(msg, args.page);
      if (args.help) return Commands.help(msg);
      if (args.place) return Commands.place(msg, args.page);
      if (args.set) return Commands.set(msg, args.set, args.link, args.field);
      if (args.off) return Commands.off(msg, args.field);
      if (args.unlink) return Commands.unlink(msg, args.field);
      if (args.locate) return Commands.locate(msg, args.field);
      if (args.goto) return Commands.goto(msg, args.goto);
      if (args.clearimmune) return Commands.clearImmunities(msg, args.clearimmune);
      if (args.delete) return Commands.remove(msg, args.field);
      if (args.alloff) return Commands.allOff(msg, args.page);
      if (args.deleteall) return Commands.deleteAll(msg, args.deleteall, args.page);
      if (args.immune) return Commands.setImmunity(msg, args.immune, true, args.field);
      if (args.unimmune) return Commands.setImmunity(msg, args.unimmune, false, args.field);
      if (args.refresh) return Commands.refresh(msg, args.page);
      if (args.ids) return Commands.ids(msg);
      if (args.setup) return Commands.setup(msg);
      if (args.dump) return dumpState();
      return Commands.help(msg);
    },

    // Page from a button's --page, else the page the GM is viewing
    getPageId: (msg, pageArg) => {
      if (pageArg && pageArg !== true && getObj('page', String(pageArg).trim())) return String(pageArg).trim();
      const player = getObj('player', msg.playerid);
      return (player && player.get('_lastpage')) || Campaign().get('playerpageid');
    },

    // Effects to act on: the one named by --field (from a menu button), else the selection
    getTargets: (msg, fieldArg) => {
      if (fieldArg !== undefined) {
        const obj = (fieldArg === true) ? null : getObj('graphic', String(fieldArg).trim());
        if (!obj || !Core.isFieldToken(obj)) {
          Menu.sendStale();
          return [];
        }
        return [obj];
      }
      const selected = (msg.selected || [])
        .map(s => getObj(s._type, s._id))
        .filter(o => Core.isFieldToken(o));
      if (!selected.length) {
        Output.error(msg, 'Select a darkness targeting token or an active field first.');
      }
      return selected;
    },

    menu: (msg, pageArg) => {
      if (!playerIsGM(msg.playerid)) return;
      Menu.send(Commands.getPageId(msg, pageArg));
    },

    // GM: place a new targeting token beside the selection, at its center, or mid-page with a ping
    place: (msg, pageArg) => {
      if (!playerIsGM(msg.playerid)) return;
      let selected = (msg.selected || [])
        .map(s => getObj('graphic', s._id))
        .filter(o => o && !Core.isFieldToken(o));
      const pageId = selected.length ? selected[0].get('pageid') : Commands.getPageId(msg, pageArg);
      selected = selected.filter(o => o.get('pageid') === pageId);
      const page = getObj('page', pageId);
      if (!page) return Output.error(msg, 'Could not find the page to place on.');

      const character = Commands.ensureCharacter(msg, pageId);
      if (!character) return;

      const cell = Util.cellPx(page);
      const size = cell * TARGET_SQUARES;
      const pageW = (parseFloat(page.get('width')) || 25) * 70;
      const pageH = (parseFloat(page.get('height')) || 25) * 70;
      let x;
      let y;

      if (selected.length === 1) {
        const t = selected[0];
        const offset = t.get('width') / 2 + size / 2;
        x = t.get('left') > pageW / 2 ? t.get('left') - offset : t.get('left') + offset;
        y = t.get('top');
      } else if (selected.length > 1) {
        const lefts = selected.map(o => o.get('left'));
        const tops = selected.map(o => o.get('top'));
        x = (Math.min(...lefts) + Math.max(...lefts)) / 2;
        y = (Math.min(...tops) + Math.max(...tops)) / 2;
      } else {
        x = pageW / 2;
        y = pageH / 2;
      }

      // Keep it on the page, centered on a grid intersection
      const fit = (v, max) => Math.round(Math.min(Math.max(v, size / 2), max - size / 2) / cell) * cell;
      x = fit(x, pageW);
      y = fit(y, pageH);

      const obj = createObj('graphic', {
        _subtype: 'token',
        _pageid: pageId,
        layer: VISION_LAYER,
        imgsrc: IMG.target,
        left: x,
        top: y,
        width: size,
        height: size,
        represents: character.id,
        name: 'Effect',
        showname: true,
        showplayers_name: false
      });
      if (!obj) return Output.error(msg, 'Could not create the darkness token. Check that the targeting image URL is valid.');
      toBack(obj);
      Effects.ensureLabels(pageId);

      if (!selected.length) sendPing(x, y, pageId, msg.playerid, true, msg.playerid);
      Menu.queue(pageId);
    },

    set: (msg, value, link, fieldArg) => {
      const opts = Parser.parseSet(value);
      if (!opts) {
        return Output.error(msg, `Unknown effect type. Use <span style="${CSS.code}">dark</span> or <span style="${CSS.code}">fog</span>.`);
      }
      let linkId = null;
      if (link !== undefined) {
        const anchor = (link === true) ? null : getObj('graphic', String(link).trim());
        if (!anchor) return Output.error(msg, 'Could not find the token to emanate from.');
        linkId = anchor.id;
      }
      Commands.getTargets(msg, fieldArg).forEach(obj => {
        if (linkId === obj.id) return Output.error(msg, 'A field cannot emanate from itself.');
        if (linkId && getObj('graphic', linkId).get('pageid') !== obj.get('pageid')) {
          return Output.error(msg, 'The token to emanate from must be on the same page.');
        }
        Core.setField(obj, opts.type, opts.radius, linkId, (o) => Menu.queue(o.get('pageid')));
      });
    },

    off: (msg, fieldArg) => {
      Commands.getTargets(msg, fieldArg).forEach(obj => {
        Core.clearField(obj);
        Menu.queue(obj.get('pageid'));
      });
    },

    unlink: (msg, fieldArg) => {
      Commands.getTargets(msg, fieldArg).forEach(obj => {
        Core.unlinkField(obj);
        Menu.queue(obj.get('pageid'));
      });
    },

    // Ping an effect for the GM only and pull their view to it
    locate: (msg, fieldArg) => {
      Commands.getTargets(msg, fieldArg).forEach(obj => {
        sendPing(obj.get('left'), obj.get('top'), obj.get('pageid'), msg.playerid, true, msg.playerid);
      });
    },

    // Ping any token for the GM only and pull their view to it (immunity name links)
    goto: (msg, tokenArg) => {
      if (!playerIsGM(msg.playerid)) return;
      const token = (tokenArg === true) ? null : getObj('graphic', String(tokenArg).trim());
      if (!token) return Output.error(msg, 'That token is no longer on the board.');
      sendPing(token.get('left'), token.get('top'), token.get('pageid'), msg.playerid, true, msg.playerid);
    },

    // GM: empty both immunity lists, campaign-wide, after a Yes
    clearImmunities: (msg, answer) => {
      if (!playerIsGM(msg.playerid)) return;
      if (String(answer).trim().toLowerCase() !== 'yes') return;
      const effect = findObjs({ _type: 'character', name: CHARACTER_NAME })[0];
      if (!effect) return;
      effect.get('gmnotes', (notes) => {
        try {
          let updated = notes;
          ['dark', 'fog'].forEach(type => {
            Util.parseImmunities(updated)[type].forEach(id => {
              updated = Util.editImmunityNotes(updated, type, id, false);
            });
          });
          effect.set('gmnotes', updated);
          const fields = State.fields();
          Object.keys(fields).forEach(id => { fields[id].im = { dark: [], fog: [] }; });
          Core.refreshAll();
        } catch (err) {
          Logger.error(`Clearing immunities failed: ${err.message}`);
          Output.error(msg, 'Could not clear the immunity lists.');
        }
      });
    },

    remove: (msg, fieldArg) => {
      if (!playerIsGM(msg.playerid)) return;
      Commands.getTargets(msg, fieldArg).forEach(obj => {
        const pageId = obj.get('pageid');
        Core.deleteEffect(obj);
        Menu.queue(pageId);
      });
    },

    allOff: (msg, pageArg) => {
      if (!playerIsGM(msg.playerid)) return;
      const pageId = Commands.getPageId(msg, pageArg);
      Effects.list(pageId).filter(o => State.fields()[o.id]).forEach(o => Core.clearField(o));
      Menu.queue(pageId);
    },

    deleteAll: (msg, answer, pageArg) => {
      if (!playerIsGM(msg.playerid)) return;
      if (String(answer).trim().toLowerCase() !== 'yes') return;
      const pageId = Commands.getPageId(msg, pageArg);
      Effects.list(pageId).forEach(o => Core.deleteEffect(o));
      Menu.queue(pageId);
    },

    refresh: (msg, pageArg) => {
      Core.refreshAll();
      if (pageArg !== undefined && playerIsGM(msg.playerid)) Menu.queue(Commands.getPageId(msg, pageArg));
    },

    // GM: add or remove a creature's character ID on a GM Notes immunity list ("dark <tokenId>" / "fog <tokenId>")
    // fieldId (optional): use that effect's character instead of the selection
    setImmunity: (msg, value, add, fieldId) => {
      if (!playerIsGM(msg.playerid)) return;
      const parts = (value === true ? '' : String(value)).trim().split(/\s+/);
      const type = /^dark/i.test(parts[0]) ? 'dark' : (/^fog/i.test(parts[0]) ? 'fog' : null);
      if (!type) return Output.error(msg, 'Specify the dark or fog list.');

      const target = getObj('graphic', parts[1] || '');
      const charId = target && target.get('represents');
      if (!charId) return Output.error(msg, 'That token does not represent a character, so it cannot be made immune.');

      // The effect character: from the given effect, else the selected darkness token, else by name
      let source = null;
      if (fieldId !== undefined) {
        source = Commands.getTargets(msg, fieldId)[0];
        if (!source) return;
      } else {
        source = (msg.selected || []).map(s => getObj('graphic', s._id)).find(o => o && o.get('represents'));
      }
      const effect = (source && getObj('character', source.get('represents'))) ||
        findObjs({ _type: 'character', name: CHARACTER_NAME })[0];
      if (!effect) return Output.error(msg, `Could not find the ${CHARACTER_NAME} character. Run --setup first.`);

      effect.get('gmnotes', (notes) => {
        try {
          const updated = Util.editImmunityNotes(notes, type, charId, add);
          effect.set('gmnotes', updated);
          const im = Util.parseImmunities(updated);

          // Update cached lists on fields that use this character, then recheck their pages
          const fields = State.fields();
          const pages = new Set();
          Object.keys(fields).forEach(id => {
            const obj = getObj('graphic', id);
            if (obj && obj.get('represents') === effect.id) {
              fields[id].im = im;
              pages.add(fields[id].pg);
            }
          });
          pages.forEach(pg => Core.refreshPage(pg));
          if (source) Menu.queue(source.get('pageid'));
        } catch (err) {
          Logger.error(`Immunity update failed: ${err.message}`);
          Output.error(msg, 'Could not update the immunity list.');
        }
      });
    },

    // The effect character, created and set up if missing
    ensureCharacter: (msg, pageId) => {
      let character = findObjs({ _type: 'character', name: CHARACTER_NAME })[0];
      if (character) return character;
      character = createObj('character', {
        name: CHARACTER_NAME,
        avatar: IMG.target,
        controlledby: '',
        inplayerjournals: ''
      });
      if (!character) {
        Output.error(msg, 'Could not create the character.');
        return null;
      }
      character.set('gmnotes', NOTES_TEMPLATE);
      const error = Core.updateCharacter(character, pageId);
      if (error) Output.error(msg, error);
      return character;
    },

    // GM: create or repair the effect character, its token actions and default token
    setup: (msg) => {
      if (!playerIsGM(msg.playerid)) return;
      const pageId = Commands.getPageId(msg);
      const existing = findObjs({ _type: 'character', name: CHARACTER_NAME })[0];
      const character = Commands.ensureCharacter(msg, pageId);
      if (!character || !existing) return;
      const error = Core.updateCharacter(character, pageId);
      if (error) Output.error(msg, error);
    },

    // GM helper: list names and character IDs of selected tokens
    ids: (msg) => {
      if (!playerIsGM(msg.playerid)) return;
      const rows = (msg.selected || [])
        .map(s => getObj('graphic', s._id))
        .filter(o => o && o.get('represents'))
        .map(o => {
          const c = getObj('character', o.get('represents'));
          return `<div style="${CSS.helpRow}">${c ? c.get('name') : o.get('name')}<br><span style="${CSS.code}">${o.get('represents')}</span></div>`;
        });
      Output.whisper(msg, Output.card('Character IDs', '',
        `<div style="${CSS.body}">${rows.join('') || `<div style="${CSS.helpText}">No selected tokens represent a character.</div>`}</div>`));
    },

    help: (msg) => {
      const code = (text) => `<span style="${CSS.code}">${text}</span>`;
      const tag = (text, danger) => `<span style="${CSS.tag}color:${danger ? '#ff9b9b' : '#cfc4ff'};">${text}</span>`;
      const row = (chips, text) => `<div style="${CSS.helpRow}">${chips}<br><span style="${CSS.helpText}">${text}</span></div>`;
      const section = (title, inner) =>
        `<div style="${CSS.panel}#3a3a46;"><div style="${CSS.label}margin-top:0;">${title}</div>${inner}</div>`;

      const html = Output.card('Darkness Help', `v${version} · Darkness and Fog Cloud fields`,
        section('HOW IT WORKS',
          `<div>Tokens inside a field lose their sight. Inside darkness, lights are also put out. Nameplates, bars and auras are hidden from players. Everything is restored when the token leaves.</div>`) +
        section('MENU',
          row(code('!darkness'), 'Opens the menu for this page.') +
          row(code('Place Darkness Token'), 'Beside the selected token, or the center of a selected group. Nothing selected: middle of the page, and your view is pulled there.')) +
        section('TYPE',
          row(`${tag('Darkness')} ${tag('Fog Cloud')}`, 'Turn on at 15 ft or 20 ft, or switch an active field.') +
          row(tag('Custom'), 'Choose the effect and radius.') +
          row(tag('Emanation'), 'Click a creature. The field is measured from the edge of its space and follows it. Deleting the creature deletes the field.')) +
        section('IMMUNITY',
          row(`${tag('+ Immune')} ${tag('− Remove')}`, 'Click a creature to add it to, or remove it from, the list for that effect type. Immune creatures keep their sight; their lights and nameplates are still affected.') +
          `<div style="${CSS.helpRow}"><span style="${CSS.helpText}">The menu lists immune creatures that have a token on the page. Click a name to go to that token.</span></div>` +
          `<div style="margin-top:2px;">${Output.grid(1, Output.button('Remove All Immunities', '!darkness --clearimmune ?{Remove every immunity in the campaign?|No|Yes}', { danger: true }))}</div>`) +
        section('EFFECT',
          row(tag('Locate'), 'Pings the effect for you only.') +
          row(tag('Unlink'), 'Stops an emanation following its creature.') +
          row(`${tag('Off')} ${tag('Delete', true)}`, 'Off returns it to targeting. Delete removes it. Both restore every affected token.')) +
        section('PAGE AND SETUP',
          row(`${tag('All Off')} ${tag('Delete All', true)} ${tag('Refresh')}`, 'Act on every effect on this page. Refresh rechecks every token.') +
          row(code('!darkness --setup'), `Creates or repairs the ${CHARACTER_NAME} character.`)) +
        `<div style="${CSS.footer}">${Output.primary('Back to Menu', '!darkness', true)}</div>`);
      Output.whisper(msg, html);
    }
  };

  // Burndown queue
  const Queue = (() => {
    let queue = [];
    let active = false;

    const process = () => {
      if (!queue.length) {
        active = false;
        return;
      }
      active = true;
      const job = queue.shift();
      try {
        job();
      } catch (err) {
        Logger.error(err.message || err);
      }
      setTimeout(process, 0);
    };

    return {
      add: (fn) => {
        queue.push(fn);
        if (!active) process();
      }
    };
  })();

  // Event handlers
  const handleInput = (msg) => {
    if (msg.type !== 'api') return;
    const parsed = Parser.parse(msg.content);
    if (parsed.command.toLowerCase() !== '!darkness') return;
    try {
      Commands.root(msg, parsed);
    } catch (err) {
      Logger.error(err.message || err);
      Output.error(msg, `Error: ${err.message || err}`);
    }
  };

  const handleGraphicChange = (obj, prev) => {
    try {
      if (!obj || obj.get('type') !== 'graphic') return;
      prev = prev || {};

      const differs = (k) => prev[k] !== undefined && prev[k] !== obj.get(k);
      const field = State.fields()[obj.id];

      if (field) {
        const resized = ['width', 'height'].some(differs);
        // A linked field snaps back to its token during the page refresh
        if (resized && !field.ln) Core.resizeField(obj);
        if (resized || FIELD_WATCHED.some(differs)) {
          Core.refreshPage(obj.get('pageid'));
        }
        return;
      }

      // Token a field emanates from: move the field with it
      if (Core.getLinkedFieldIds(obj.id).length) {
        if (['left', 'top', 'width', 'height', 'layer'].some(differs)) {
          Core.refreshPage(obj.get('pageid'));
          return;
        }
      }

      const changed = WATCHED.some(k => prev[k] === undefined || prev[k] !== obj.get(k));
      if (!changed) return;

      const pageFields = Core.getPageFields(obj.get('pageid'));
      if (pageFields.length || State.saved()[obj.id]) Core.processGraphic(obj, pageFields);
    } catch (err) {
      Logger.error(err.message || err);
    }
  };

  const handleGraphicAdd = (obj) => {
    // Newly added graphics are not fully populated until the next tick
    setTimeout(() => {
      const g = getObj('graphic', obj.id);
      if (!g) return;
      const pageFields = Core.getPageFields(g.get('pageid'));
      if (pageFields.length) Core.processGraphic(g, pageFields);
    }, 100);
  };

  const handleGraphicDestroy = (obj) => {
    const pageId = obj.get('pageid');
    let changed = false;
    if (State.fields()[obj.id]) {
      delete State.fields()[obj.id];
      changed = true;
    }
    // Fields emanating from this token are deleted with it
    Core.getLinkedFieldIds(obj.id).forEach(id => {
      Core.removeField(id);
      changed = true;
    });
    delete State.saved()[obj.id];
    if (changed) Core.refreshPage(pageId);
  };

  // Hooks offered by other scripts that change tokens without firing change:graphic
  const registerObservers = () => {
    const hooks = [
      ['TokenMod', () => (typeof TokenMod !== 'undefined') ? TokenMod : null],
      ['ScriptCards', () => (typeof ScriptCards !== 'undefined') ? ScriptCards : null],
      ['SmartAoE', () => (typeof SmartAoE !== 'undefined') ? SmartAoE : null]
    ];
    hooks.forEach(([name, get]) => {
      const api = get();
      if (api && typeof api.ObserveTokenChange === 'function') {
        api.ObserveTokenChange(handleGraphicChange);
        Logger.log(`Observing ${name}`);
      }
    });
  };

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
    on('change:graphic', handleGraphicChange);
    on('add:graphic', handleGraphicAdd);
    on('destroy:graphic', handleGraphicDestroy);
    registerObservers();
  };

  const dumpState = () => {
    log(`${scriptName} state: ${JSON.stringify(State.get())}`);
  };

  const checkInstall = () => {
    Logger.log(`v${version} [${new Date(lastUpdate * 1000)}]`);
    State.initialize();
    return true;
  };

  on('ready', () => {
    if (checkInstall()) {
      registerEventHandlers();
      // Catch anything that changed while the sandbox was down
      setTimeout(() => {
        try {
          Core.autoUpdateCharacter();
        } catch (err) {
          Logger.error(`Character update failed: ${err.message || err}`);
        }
        Core.refreshAll();
      }, 1000);
    }
  });

  return {
    dumpState,
    refresh: () => Core.refreshAll()
  };

})();