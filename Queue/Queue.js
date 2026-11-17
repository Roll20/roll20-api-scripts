// Script:   Queue
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
// Changelog
// 1.0.0 Initial release

const Queue = (() => {
  'use strict';

  // Config
  const scriptName = 'Queue';
  const version = '1.0.0';
  const lastUpdate = 1794863122;
  const schemaVersion = 0.5;
  const DEBUG = false;

  const COMMANDS = ['!queue', '!q'];
  const MACRO_NAME = '\u{1F6CE}';
  const HANDOUT_NAME = 'Queue';
  const HELP_NAME = 'Help: Queue';
  const OLD_HELP_NAME = 'Queue Help';
  const HELP_AVATAR = 'https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147';
  const LOG_MAX = 20;

  // target: the request names another character, chosen from a list after the category
  const DEFAULT_CATEGORIES = [
    { label: 'Rules question', urgent: false, target: false },
    { label: 'Scene question', urgent: false, target: false },
    { label: 'I want to act', urgent: false, target: false },
    { label: 'Forgot on my turn', urgent: false, target: false },
    { label: 'Search / examine', urgent: false, target: false },
    { label: 'Help someone', urgent: false, target: true },
    { label: 'Private word', urgent: false, target: false },
    { label: 'Need a break', urgent: false, target: false },
    { label: 'AFK', urgent: false, target: false },
    { label: 'Tech problem', urgent: false, target: false },
    { label: 'Talk with', urgent: false, target: true }
  ];

  const defaultConfig = () => ({
    visibility: 'gm',      // gm | all
    gmChat: 'full',        // off | notice | full
    playerChat: 'off',     // off | notice | full
    urgentJumps: true,
    soundTrack: '',
    trackerSync: false,    // mirror the queue in the turn tracker
    trackerCombat: false,  // insert queue items among token turns during combat
    trackerOpen: false,    // open the turn tracker when a request arrives
    notesHandout: 'Session Notes', // GM-only handout that collects session notes
    notesTz: 'UTC',                // time zone for session note timestamps
    iface: 'chat',                 // where the GM runs the queue: 'chat' or 'handout'
    ifaceChosen: false,            // first-run interface choice made
    categories: DEFAULT_CATEGORIES.map(c => ({ label: c.label, urgent: c.urgent, target: c.target }))
  });

  // CSS (Centralized Styles) - original header, Soft light body
  const COLOR = {
    band: '#3b2f63',
    accent: '#e8a33d',
    card: '#e9e7f0',
    rowAlt: '#dfdce9',
    rule: '#cbc6dc',
    text: '#231d38',
    muted: '#5e5873',
    btnBg: '#d6d1e6',
    urgentBg: '#f1d3d3',
    urgentEdge: '#b3261e',
    urgentText: '#a11f18',
    spotBg: '#efe5cf',
    spotText: '#8a5a0f',
    white: '#ffffff'
  };

  const btnBase = 'display:inline-block;padding:2px 6px;margin:2px 3px 2px 0;border-radius:3px;font-size:12px;text-decoration:none;font-family:Arial,sans-serif;';

  const CSS = {
    outer: `border:2px solid ${COLOR.white};border-radius:5px;`,
    box: `border:1px solid ${COLOR.band};border-radius:3px;overflow:hidden;background:${COLOR.card};font-family:Arial,sans-serif;font-size:13px;color:${COLOR.text};`,
    headerTable: `width:100%;border-collapse:collapse;background:${COLOR.band};border-bottom:3px solid ${COLOR.accent};`,
    headerTitle: `padding:6px 8px;color:${COLOR.white};font-size:20px;font-weight:bold;letter-spacing:1px;white-space:nowrap;font-family:Arial Black,Arial,sans-serif;`,
    headerCount: `color:${COLOR.accent};font-size:12px;letter-spacing:0;font-family:Arial,sans-serif;font-weight:normal;`,
    headerRight: 'padding:4px 6px;text-align:right;vertical-align:middle;white-space:nowrap;',
    headerBtn: `display:inline-block;height:18px;line-height:18px;padding:0 6px;margin-left:3px;border:1px solid ${COLOR.accent};border-radius:3px;background:${COLOR.band};color:${COLOR.white};font-size:11px;font-weight:bold;text-decoration:none;vertical-align:middle;`,
    subTitle: 'padding:0;vertical-align:middle;',
    subHeader: `padding:5px 8px;background:${COLOR.band};color:${COLOR.white};font-weight:bold;font-size:13px;border-bottom:3px solid ${COLOR.accent};`,
    body: 'padding:6px 8px;',
    caption: `padding:4px 8px;font-size:12px;color:${COLOR.muted};border-bottom:1px solid ${COLOR.rule};`,
    rowTable: 'width:100%;border-collapse:collapse;',
    row: `border-bottom:1px solid ${COLOR.rule};`,
    rowAlt: `background:${COLOR.rowAlt};`,
    rowUrgent: `background:${COLOR.urgentBg};`,
    barNone: 'border-left:4px solid transparent;',
    barUrgent: `border-left:4px solid ${COLOR.urgentEdge};`,
    barNext: `border-left:4px solid ${COLOR.accent};`,
    cellPos: 'width:20px;padding:5px 2px 5px 4px;font-weight:bold;font-size:15px;vertical-align:middle;text-align:center;',
    cellToken: 'width:44px;min-width:44px;padding:4px 2px;vertical-align:middle;',
    cellMain: 'padding:4px;vertical-align:middle;',
    cellCtl: 'padding:4px 6px 4px 2px;vertical-align:middle;text-align:right;white-space:nowrap;',
    tokenImg: 'width:40px;height:40px;min-width:40px;max-width:40px;border:none;display:block;',
    targetImg: 'width:18px;height:18px;border:none;vertical-align:middle;margin-right:3px;',
    plainLink: `background:none;border:none;padding:0;margin:0;color:${COLOR.text};text-decoration:none;`,
    nameLink: `background:none;border:none;padding:0;margin:0;color:${COLOR.band};font-weight:bold;text-decoration:none;font-size:13px;`,
    category: 'font-size:12px;margin-top:1px;',
    urgentText: `color:${COLOR.urgentText};font-weight:bold;`,
    target: `font-size:11px;color:${COLOR.muted};margin-top:2px;`,
    ctlBtnOn: `display:inline-block;width:18px;height:18px;line-height:18px;padding:0;margin-left:2px;border:1px solid ${COLOR.band};border-radius:3px;background:${COLOR.band};color:${COLOR.white};font-size:12px;text-align:center;text-decoration:none;vertical-align:middle;overflow:hidden;`,
    ctlBtn: `display:inline-block;width:18px;height:18px;line-height:18px;padding:0;margin-left:2px;border:1px solid ${COLOR.band};border-radius:3px;background:${COLOR.btnBg};color:${COLOR.band};font-size:12px;text-align:center;text-decoration:none;vertical-align:middle;overflow:hidden;`,
    pictos: 'font-family:pictos;line-height:18px;',
    btn: `${btnBase}border:1px solid ${COLOR.band};background:${COLOR.btnBg};color:${COLOR.band};`,
    btnOn: `${btnBase}border:1px solid ${COLOR.band};background:${COLOR.band};color:${COLOR.white};`,
    btnUrgent: `${btnBase}border:1px solid ${COLOR.urgentEdge};background:${COLOR.urgentBg};color:${COLOR.urgentText};font-weight:bold;`,
    btnSmall: `display:inline-block;padding:0 4px;margin:0 2px 0 0;border:1px solid ${COLOR.band};border-radius:3px;background:${COLOR.btnBg};color:${COLOR.band};font-size:10px;text-decoration:none;`,
    btnDanger: `${btnBase}border:1px solid ${COLOR.urgentEdge};background:${COLOR.card};color:${COLOR.urgentText};`,
    footer: `padding:4px 8px;border-top:1px solid ${COLOR.rule};background:${COLOR.rowAlt};`,
    label: 'font-weight:bold;font-size:12px;margin-top:6px;',
    note: `font-size:11px;color:${COLOR.muted};margin-top:3px;`,
    strong: `color:${COLOR.text};`,
    empty: `padding:8px;color:${COLOR.muted};font-style:italic;text-align:center;`,
    msgNotice: `padding:6px 8px;border-left:4px solid ${COLOR.accent};`,
    msgConfirm: `padding:6px 8px;border-left:4px solid ${COLOR.band};`,
    settingsRow: 'width:100%;border-collapse:collapse;',
    settingsName: 'padding:2px 4px 2px 0;font-size:12px;vertical-align:middle;width:40%;',
    settingsVal: 'padding:2px 0;vertical-align:middle;',
    logTable: 'width:100%;border-collapse:collapse;font-size:11px;',
    logCell: `padding:2px 3px;border-bottom:1px solid ${COLOR.rule};vertical-align:top;`,
    spotHeader: `padding:7px 10px;background:${COLOR.band};color:${COLOR.accent};font-size:19px;font-weight:bold;letter-spacing:3px;white-space:nowrap;font-family:Arial Black,Arial,sans-serif;border-bottom:3px solid ${COLOR.accent};`,
    spotBody: `padding:8px 10px;border-left:6px solid ${COLOR.accent};`,
    spotTable: 'width:100%;border-collapse:collapse;table-layout:fixed;',
    spotCell: 'text-align:center;vertical-align:top;padding:2px 4px;',
    spotImg: 'width:64px;height:64px;min-width:64px;max-width:64px;border:none;display:block;margin:0 auto 4px auto;',
    spotName: `font-size:18px;font-weight:bold;color:${COLOR.band};line-height:1.15;`,
    spotCat: 'font-size:14px;margin-top:3px;text-align:center;',
    spotTalk: `font-size:14px;text-align:center;color:${COLOR.text};padding-bottom:4px;`,
    spotWith: `width:34px;text-align:center;vertical-align:middle;font-size:18px;color:${COLOR.muted};`,
    spotRow: `background:${COLOR.spotBg};border-bottom:2px solid ${COLOR.accent};`,
    spotLineLabel: `font-size:10px;letter-spacing:2px;font-weight:bold;color:${COLOR.spotText};`,
    spotStar: `${'width:20px;padding:5px 2px 5px 4px;font-size:15px;vertical-align:middle;text-align:center;'}color:${COLOR.spotText};border-left:4px solid ${COLOR.accent};`,
    clearedText: `font-size:16px;font-weight:bold;text-align:center;color:${COLOR.text};padding:4px 0;`,
    warn: `font-size:11px;color:${COLOR.urgentText};margin:2px 0 4px 0;`,
    catCtl: `display:inline-block;width:18px;height:18px;line-height:18px;padding:0;margin-left:2px;border:1px solid ${COLOR.band};border-radius:3px;background:${COLOR.btnBg};color:${COLOR.band};font-size:11px;text-align:center;text-decoration:none;vertical-align:middle;`,
    catCtlOn: `display:inline-block;width:18px;height:18px;line-height:18px;padding:0;margin-left:2px;border:1px solid ${COLOR.band};border-radius:3px;background:${COLOR.band};color:${COLOR.white};font-size:11px;text-align:center;text-decoration:none;vertical-align:middle;`,
    catCtlUrgent: `display:inline-block;width:18px;height:18px;line-height:18px;padding:0;margin-left:2px;border:1px solid ${COLOR.urgentEdge};border-radius:3px;background:${COLOR.urgentEdge};color:${COLOR.white};font-size:11px;font-weight:bold;text-align:center;text-decoration:none;vertical-align:middle;`,
    catCtlOff: `display:inline-block;width:18px;height:18px;line-height:18px;padding:0;margin-left:2px;border:1px solid ${COLOR.rule};border-radius:3px;background:${COLOR.card};color:#b3adc6;font-size:11px;text-align:center;text-decoration:none;vertical-align:middle;`,
    catBlank: 'display:inline-block;width:18px;height:18px;margin-left:2px;border:1px solid transparent;vertical-align:middle;',
    catGap: 'display:inline-block;width:6px;',
    catName: `color:${COLOR.text};text-decoration:none;border-bottom:1px dotted ${COLOR.muted};background:none;padding:0;font-size:12px;`,
    catRow: `border-bottom:1px solid ${COLOR.rule};`,
    legendRow: 'font-size:11px;margin:3px 0;',
    footTable: 'width:100%;border-collapse:collapse;',
    footCell: 'padding:0;vertical-align:middle;white-space:nowrap;',
    footLabel: `font-size:11px;font-weight:bold;color:${COLOR.muted};margin-right:3px;`,
    gridTable: 'width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px;',
    gridCell: 'width:50%;padding:2px;vertical-align:top;',
    gridFix: 'display:block;margin:0;text-align:center;white-space:normal;line-height:1.2;padding:4px 4px;',
    helpH: `color:${COLOR.band};font-size:14px;font-weight:bold;margin:10px 0 4px 0;border-bottom:2px solid ${COLOR.accent};`,
    helpCode: 'font-family:monospace;background:#f0f0f0;padding:0 3px;'
  };

  // Logger
  const Logger = {
    log: (msg) => log(`${scriptName} | ${msg}`),
    debug: (msg) => { if (DEBUG) log(`${scriptName} [DEBUG] | ${msg}`); },
    error: (msg) => log(`${scriptName} [ERROR] | ${msg}`)
  };

  // State Management
  const State = {
    initialize: () => {
      const S = state[scriptName];
      if (!S || typeof S.version !== 'number') {
        Logger.log(`Creating state v${schemaVersion}`);
        state[scriptName] = { version: schemaVersion, config: defaultConfig(), entries: {}, log: [], players: {}, spotlight: null, tracker: { items: {} } };
      } else if (S.version !== schemaVersion) {
        Logger.log(`Updating Schema from v${S.version} to v${schemaVersion}`);
        switch (S.version) {
          case 0.1:
            // "Urgent: ruling" became the normal category "Need ruling"
            (S.config.categories || []).forEach(c => {
              if (c.label === 'Urgent: ruling') { c.label = 'Need ruling'; c.urgent = false; }
            });
            /* falls through */
          case 0.2:
            // 0.3 adds spotlight and tracker registry; filled in by ensureDefaults
            /* falls through */
          case 0.3:
            // Chat display became opt-out; earlier saves defaulted every player to off
            Object.keys(S.players || {}).forEach(id => { S.players[id].chat = true; });
            /* falls through */
          case 0.4:
            // The Queue handout became the GM's interface; players no longer have it
            delete S.config.handout;
            Object.keys(S.players || {}).forEach(id => { delete S.players[id].handout; });
            /* falls through */
          default:
            S.version = schemaVersion;
        }
      }
      State.ensureDefaults();
    },

    // Fill any keys missing from a hand-edited or partial state
    ensureDefaults: () => {
      const S = state[scriptName];
      const def = defaultConfig();
      S.config = S.config || {};
      Object.keys(def).forEach(k => { if (S.config[k] === undefined) S.config[k] = def[k]; });
      if (!Array.isArray(S.config.categories)) S.config.categories = def.categories;
      S.entries = S.entries || {};
      S.log = Array.isArray(S.log) ? S.log : [];
      S.players = S.players || {};
      S.spotlight = S.spotlight || null;
      S.tracker = S.tracker && S.tracker.items ? S.tracker : { items: {} };
      S.test = S.test && S.test.names ? S.test : { names: {}, count: 0 };
    },

    get: () => state[scriptName],
    config: () => state[scriptName].config,
    entries: () => state[scriptName].entries,

    prefs: (pid) => {
      const P = state[scriptName].players;
      if (!P[pid]) P[pid] = { chat: true, hinted: false };
      return P[pid];
    },

    addLog: (entry, outcome) => {
      const L = state[scriptName].log;
      L.unshift({ name: entry.name, label: Util.what(entry), joined: entry.joined, resolved: Date.now(), outcome });
      if (L.length > LOG_MAX) L.length = LOG_MAX;
    }
  };

  // Utilities
  const Util = {
    esc: (s) => String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/\{/g, '&#123;').replace(/\}/g, '&#125;').replace(/\[/g, '&#91;').replace(/\]/g, '&#93;'),

    playerName: (pid) => {
      const p = getObj('player', pid);
      return p ? p.get('displayname') : 'Unknown player';
    },

    ctrlIncludes: (str, pid) => (str || '').split(',').map(s => s.trim()).includes(pid),

    onlinePlayers: () => findObjs({ _type: 'player', _online: true }),

    // Keith's standard page lookup
    getPageForPlayer: (playerid) => {
      const player = getObj('player', playerid);
      if (playerIsGM(playerid)) {
        return (player && player.get('lastpage')) || Campaign().get('playerpageid');
      }
      const psp = Campaign().get('playerspecificpages');
      if (psp && psp[playerid]) return psp[playerid];
      return Campaign().get('playerpageid');
    },

    // Request text including its target, e.g. "Help someone: Aria the Bold"
    what: (e) => (e.target ? `${e.label}: ${e.target.name}` : e.label),

    minutesAgo: (ms) => {
      const m = Math.max(0, Math.round((Date.now() - ms) / 60000));
      return m < 1 ? 'just now' : `${m} min ago`;
    }
  };

  // Token selection
  const TokenUtils = {
    pageTokens: (pageid) => findObjs({ _type: 'graphic', _subtype: 'token', _pageid: pageid })
      .filter(t => t.get('layer') !== 'gmlayer'),

    // Every current, non-GM player controlling a token, directly or through its character ("all" is kept).
    // IDs with no player object (players who left the game) are ignored.
    controllers: (tok) => {
      const c = getObj('character', tok.get('represents'));
      return TokenUtils.parseCtl(`${tok.get('controlledby') || ''},${c ? c.get('controlledby') || '' : ''}`);
    },

    // Current non-GM player IDs in a controlledby string; "all" is kept so callers can reject it
    parseCtl: (str) => (str || '').split(',').map(x => x.trim())
      .filter(x => x && (x === 'all' || (getObj('player', x) && !playerIsGM(x)))),

    // Target candidate: no All Players, and at least one controller other than the requester
    otherPlayers: (ids, requester) => !ids.includes('all') && ids.some(id => id !== requester),

    // A token identifies a request only when the requester is its sole controller (never All Players)
    soleControl: (tok, pid) => {
      const ctl = TokenUtils.controllers(tok);
      return ctl.length > 0 && ctl.every(x => x === pid);
    },

    tokenName: (tok) => {
      const c = getObj('character', tok.get('represents'));
      return tok.get('name') || (c ? c.get('name') : '') || '';
    },

    // Selected token, else the player's character token on their page (chooser if several), else display name
    identify: (msg) => {
      const pid = msg.playerid;
      const display = Util.playerName(pid);
      const sel = (msg.selected || [])
        .map(s => getObj('graphic', s._id))
        .find(t => t && t.get('subtype') === 'token' && TokenUtils.soleControl(t, pid));
      if (sel) return { token: sel, name: TokenUtils.tokenName(sel) || display };

      const tokens = TokenUtils.pageTokens(Util.getPageForPlayer(pid))
        .filter(t => TokenUtils.soleControl(t, pid));
      const seen = [];
      const pcs = tokens.filter(t => {
        const c = getObj('character', t.get('represents'));
        if (!c || !Util.ctrlIncludes(c.get('controlledby'), pid) || seen.includes(c.id)) return false;
        seen.push(c.id);
        return true;
      });
      if (pcs.length === 1) return { token: pcs[0], name: TokenUtils.tokenName(pcs[0]) || display };
      if (pcs.length > 1) return { choose: pcs };

      return { token: tokens[0] || null, name: display };
    },

    // Troubleshooting: explains how a request would be identified (report goes to the GM)
    whoami: (msg) => {
      const pid = msg.playerid;
      const nameOf = (id) => id === 'all' ? 'All Players' : (getObj('player', id) ? `${Util.playerName(id)}${playerIsGM(id) ? ' (GM)' : ''}` : `not a player [${id}]`);
      const list = (str) => {
        const ids = (str || '').split(',').map(x => x.trim()).filter(Boolean);
        return ids.length ? ids.map(nameOf).join(', ') : '(none)';
      };
      const describe = (t) => {
        const c = getObj('character', t.get('represents'));
        return `<b>${Util.esc(t.get('name') || '(no name)')}</b> [${t.id}] layer ${t.get('layer')}<br>` +
          `&nbsp;token controlled by: ${Util.esc(list(t.get('controlledby')))}<br>` +
          `&nbsp;represents: ${c ? `${Util.esc(c.get('name'))} [${c.id}], controlled by: ${Util.esc(list(c.get('controlledby')))}` : '(no character)'}<br>` +
          `&nbsp;counted controllers: ${Util.esc(TokenUtils.controllers(t).map(nameOf).join(', ') || '(none)')} &rarr; sole control: <b>${TokenUtils.soleControl(t, pid) ? 'yes' : 'no'}</b>`;
      };
      const lines = [`Player: <b>${Util.esc(Util.playerName(pid))}</b> [${pid}]`,
        `Page used: ${Util.getPageForPlayer(pid)}`,
        `Selected objects passed: ${(msg.selected || []).length}`];
      (msg.selected || []).forEach(s => {
        const t = getObj('graphic', s._id);
        lines.push(t ? `Selected: ${describe(t)}` : `Selected: ${s._type} [${s._id}] (not a graphic)`);
      });
      const pageToks = TokenUtils.pageTokens(Util.getPageForPlayer(pid)).filter(t => TokenUtils.controllers(t).includes(pid));
      lines.push(`Tokens on page listing this player as a controller: ${pageToks.length}`);
      pageToks.forEach(t => lines.push(describe(t)));
      const r = TokenUtils.identify(msg);
      lines.push(r.choose
        ? `<b>Result:</b> chooser with ${r.choose.map(t => Util.esc(TokenUtils.tokenName(t))).join(', ')}`
        : `<b>Result:</b> name "${Util.esc(r.name)}", token ${r.token ? r.token.id : '(none)'}`);
      Output.toGM(Output.panel('Queue identity check', lines.map(l => `<div style="margin-bottom:4px;">${l}</div>`).join('')));
      if (!playerIsGM(pid)) Output.toPlayer(pid, Output.msg('Identity check sent to the GM.'));
    },

    // Valid choices for the chooser buttons
    candidates: (pid) => TokenUtils.pageTokens(Util.getPageForPlayer(pid))
      .filter(t => TokenUtils.soleControl(t, pid)),

    findCharToken: (charId, pageid) => TokenUtils.pageTokens(pageid).find(t => t.get('represents') === charId) || null,

    img: (tok) => {
      if (!tok) return '';
      return (tok.get('imgsrc') || '').replace(/(med|max|original)\.(png|jpg|jpeg|gif|webp)/, 'thumb.$2');
    }
  };

  // Token used for a talk target: on the controlling player's page, else on the requester's page
  const TalkName = {
    token: (c, requester) => {
      const here = TokenUtils.findCharToken(c.id, Util.getPageForPlayer(requester));
      if (here) return here;
      const owner = TokenUtils.parseCtl(c.get('controlledby')).find(id => id !== 'all' && id !== requester);
      return (owner && TokenUtils.findCharToken(c.id, Util.getPageForPlayer(owner))) || null;
    }
  };

  // Queue data
  const QueueData = {
    ordered: () => {
      const cfg = State.config();
      return Object.keys(State.entries())
        .map(k => State.entries()[k])
        .sort((a, b) => {
          if (cfg.urgentJumps && a.urgent !== b.urgent) return a.urgent ? -1 : 1;
          return QueueData.key(a) - QueueData.key(b);
        });
    },

    // Join time, or the slot assigned when the GM reorders in the turn tracker
    key: (e) => (typeof e.rank === 'number' ? e.rank : e.joined),

    // Unique, increasing join time so two requests in the same millisecond keep a fixed order
    stamp: () => {
      const keys = Object.keys(State.entries()).map(k => QueueData.key(State.entries()[k]));
      return Math.max(Date.now(), ...keys.map(k => k + 1));
    },

    position: (pid) => QueueData.ordered().findIndex(e => e.pid === pid) + 1,

    count: () => Object.keys(State.entries()).length
  };

  // Parser
  const Parser = {
    parse: (content) => {
      const tokens = content.trim().split(/\s+/);
      const command = tokens.shift();
      const args = {};
      const order = [];
      let currentKey = null;

      tokens.forEach(token => {
        if (token.startsWith('--')) {
          currentKey = token.replace(/^--/, '').toLowerCase();
          args[currentKey] = true;
          order.push(currentKey);
          return;
        }
        if (currentKey) {
          if (args[currentKey] === true) args[currentKey] = token;
          else args[currentKey] += ` ${token}`;
        }
      });

      return { command: (command || '').toLowerCase(), args, order };
    }
  };

  // Output
  const Output = {
    // Button. Handout links need the backtick prefix to run API commands.
    btn: (label, cmd, style, title, ctx) => {
      const href = ctx === 'handout' ? `\`${cmd}` : cmd;
      const t = title ? ` title="${Util.esc(title)}"` : '';
      return `<a href="${href}" style="${style || CSS.btn}"${t}>${label}</a>`;
    },

    // Two equal-width buttons per row; items are [label, cmd, style, title]
    grid: (items) => {
      const cells = items.map(([label, cmd, style, title]) =>
        `<td style="${CSS.gridCell}">${Output.btn(label, cmd, (style || CSS.btn) + CSS.gridFix, title)}</td>`);
      const rows = [];
      for (let i = 0; i < cells.length; i += 2) rows.push(`<tr>${cells[i]}${cells[i + 1] || `<td style="${CSS.gridCell}"></td>`}</tr>`);
      return `<table style="${CSS.gridTable}">${rows.join('')}</table>`;
    },

    // Journal link with inner span so Roll20 does not force its link color
    journalLink: (label, type, id, style, color, title) =>
      `<a href="http://journal.roll20.net/${type}/${id}" style="${style || CSS.btn}"${title ? ` title="${Util.esc(title)}"` : ''}><span style="color:${color || COLOR.band};">${label}</span></a>`,

    // White outer ring keeps the dark border visible on dark chat backgrounds
    box: (inner) => `<div style="${CSS.outer}"><div style="${CSS.box}">${inner}</div></div>`,

    msg: (inner, kind) => Output.box(`<div style="${kind === 'notice' ? CSS.msgNotice : kind === 'confirm' ? CSS.msgConfirm : CSS.body}">${inner}</div>`),

    broadcast: (html) => sendChat(scriptName, Output.safe(html)),

    // A raw @{ makes Roll20 resolve it at send time and drop the whole message
    safe: (html) => {
      if (html.includes('@{')) log(`${scriptName}: message contained @{, escaped before sending`);
      return html.replace(/@\{/g, '&#64;{');
    },

    // ? button linking to the help handout (span keeps Roll20 from recoloring the link)
    helpBtn: () => {
      const h = Handouts.find(HELP_NAME);
      return h ? `<a href="http://journal.roll20.net/handout/${h.id}" style="${CSS.headerBtn}" title="Help"><span style="color:${COLOR.white};">?</span></a>` : '';
    },

    subHead: (title) => `<div style="${CSS.subHeader}"><table style="width:100%;border-collapse:collapse;"><tr>` +
      `<td style="${CSS.subTitle}color:${COLOR.white};font-weight:bold;">${title}</td>` +
      `<td style="${CSS.subTitle}text-align:right;">${Output.helpBtn()}</td></tr></table></div>`,

    panel: (title, inner) => Output.box(Output.subHead(Util.esc(title)) + `<div style="${CSS.body}">${inner}</div>`),

    raw: (target, html) => {
      sendChat(scriptName, `/w ${target} ${Output.safe(html)}`, null, { noarchive: true });
    },

    // Whisper to a player by id; GM ids resolve to "gm" to avoid the " (GM)" suffix problem
    toPlayer: (pid, html) => {
      if (Test.is(pid)) return Output.raw('gm', Test.wrap(pid, html));
      if (playerIsGM(pid)) return Output.raw('gm', html);
      const p = getObj('player', pid);
      if (!p) return Output.raw('gm', html);
      Output.raw(`"${p.get('displayname').replace(/"/g, '')}"`, html);
    },

    toGM: (html) => Output.raw('gm', html)
  };

  // Rendering (consumes data, produces HTML)
  const Render = {
    header: (ctx) => {
      const n = QueueData.count();
      const count = n === 0 ? 'empty' : `${n} waiting`;
      return `<table style="${CSS.headerTable}"><tr>` +
        `<td style="${CSS.headerTitle}">QUEUE <span style="${CSS.headerCount}">${count}</span></td>` +
        `<td style="${CSS.headerRight}">${Output.btn(`<span style="font-family:pictos;">y</span>`, '!queue --settings', CSS.headerBtn, 'Settings', ctx)}${Output.helpBtn()}</td>` +
        `</tr></table>`;
    },

    // viewer: 'gm' | 'player' | 'handout' (shared). Announce is hidden only in a player's own chat copy.
    // viewerPid: in a player's own chat copy, X appears only on that player's request
    row: (e, pos, ctx, alt, viewer, viewerPid) => {
      const tok = e.tokenId ? getObj('graphic', e.tokenId) : null;
      const tokenCell = tok
        ? Output.btn(`<img src="${TokenUtils.img(tok)}" style="${CSS.tokenImg}">`, `!queue --pingall ${e.pid}`, CSS.plainLink, 'Ping: pull everyone to this token', ctx)
        : '';
      const player = e.player || Util.playerName(e.pid);
      const hover = viewer === 'gm' ? `Player: ${player}. Ping: pull the GM and this player` : 'Ping: pull the GM and this player';
      const name = Output.btn(Util.esc(e.name), `!queue --pingpair ${e.pid}`, CSS.nameLink, hover, ctx);
      // Talk requests show the target on its own line with a small token
      const catText = e.label;
      const cat = `<div style="${CSS.category}${e.urgent ? CSS.urgentText : ''}">${Util.esc(catText)}</div>`;

      let target = '';
      if (e.target) {
        const tt = e.target.tokenId ? getObj('graphic', e.target.tokenId) : null;
        const timg = tt ? Output.btn(`<img src="${TokenUtils.img(tt)}" style="${CSS.targetImg}">`, `!queue --pingtarget ${e.pid}`, CSS.plainLink, 'Ping: pull everyone to this token', ctx) : '';
        const tname = tt
          ? Output.btn(Util.esc(e.target.name), `!queue --pingtargetpair ${e.pid}`, `${CSS.plainLink}color:${COLOR.muted};`, "Ping: pull the GM and this character's player", ctx)
          : Util.esc(e.target.name);
        target = `<div style="${CSS.target}">${timg}${tname}</div>`;
      }

      const seen = viewer !== 'gm' ? '' :
        Output.btn(`<span style="${CSS.pictos}">E</span>`, `!queue --seen ${e.pid}`, e.seen ? CSS.ctlBtnOn : CSS.ctlBtn,
          e.seen ? 'Seen. Click to un-mark (no whisper).' : 'Seen: let the player know you have seen the request', ctx);
      const announce = viewer === 'player' ? '' :
        Output.btn(`<span style="${CSS.pictos}">w</span>`, `!queue --announce ${e.pid}`, CSS.ctlBtn, 'Announce (GM): dismiss and show everyone who has the spotlight', ctx);
      const x = (viewer === 'player' && e.pid !== viewerPid) ? '' :
        Output.btn('X', `!queue --remove ${e.pid}`, CSS.ctlBtn, viewer === 'player' ? 'Withdraw your request' : 'Dismiss silently (GM) or withdraw your own request', ctx);

      // Red bar for urgent, gold bar for the next-up entry
      const bar = e.urgent ? CSS.barUrgent : (pos === 1 ? CSS.barNext : CSS.barNone);
      const rowStyle = CSS.row + (e.urgent ? CSS.rowUrgent : (alt ? CSS.rowAlt : ''));

      return `<tr style="${rowStyle}">` +
        `<td style="${bar}${CSS.cellPos}">${pos}</td>` +
        `<td style="${CSS.cellToken}">${tokenCell}</td>` +
        `<td style="${CSS.cellMain}">${name}${cat}${target}</td>` +
        `<td style="${CSS.cellCtl}">${seen}${announce}${x}</td>` +
        `</tr>`;
    },

    queue: (ctx, caption, viewer, viewerPid) => {
      const v = viewer || (ctx === 'handout' ? 'handout' : 'player');
      const list = QueueData.ordered();
      const cap = caption ? `<div style="${CSS.caption}">${caption}</div>` : '';
      const rows = list.length
        ? `<table style="${CSS.rowTable}">${list.map((e, i) => Render.row(e, i + 1, ctx, i % 2 === 1, v, viewerPid)).join('')}</table>`
        : `<div style="${CSS.empty}">No hands raised.</div>`;
      const footer = v === 'gm'
        ? Render.gmFooter(ctx)
        : `<div style="${CSS.footer}">` +
          Output.btn('Raise hand', '!queue', CSS.btn, 'Open the request menu', ctx) +
          Output.btn('Withdraw mine', '!queue --withdraw', CSS.btn, 'Withdraw your own request', ctx) + `</div>`;
      return Output.box(Render.header(ctx) + Render.spotLine(ctx, v) + cap + rows + footer);
    },

    // GM footer, the same in chat and in the handout:
    //   [Refresh] [Clear all]        [Log] [Notes]
    //   Interface [Chat] [Handout]   [Tracker sync]
    gmFooter: (ctx) => {
      const cfg = State.config();
      const inHandout = ctx === 'handout';
      const notes = findObjs({ _type: 'handout', name: cfg.notesHandout })[0];
      const left = (inner) => `<td style="${CSS.footCell}">${inner}</td>`;
      const right = (inner) => `<td style="${CSS.footCell}text-align:right;">${inner}</td>`;
      const row1 = left(
        Output.btn('Refresh', inHandout ? '!queue --refresh' : '!queue', CSS.btn, inHandout ? 'Redraw this handout' : 'Show the queue again', ctx) +
        Output.btn('Clear all', '!queue --clear', CSS.btnDanger, 'Remove every request (asks first)', ctx)) +
        right(
          Output.btn('Log', '!queue --log', CSS.btn, 'Recently resolved requests (in chat)', ctx) +
          // Journal link: clicking it opens the handout itself
          (notes ? Output.journalLink('Notes', 'handout', notes.id, CSS.btn, COLOR.band, `Open the ${cfg.notesHandout} handout`) : ''));
      const mode = (val, label, title) => Output.btn(label, `!queue --iface ${val}${inHandout ? ' --from handout' : ''}`,
        cfg.iface === val ? CSS.btnOn : CSS.btn, cfg.iface === val ? `${title} (current)` : title, ctx);
      const row2 = left(`<span style="${CSS.footLabel}">Interface</span>` +
        mode('chat', 'Chat', 'Run the queue from chat') +
        mode('handout', 'Handout', 'Run the queue from the Queue handout')) +
        right(Output.btn('Tracker sync', `!queue --tracker ${cfg.trackerSync ? 'off' : 'on'} --from queue`,
          cfg.trackerSync ? CSS.btnOn : CSS.btn,
          cfg.trackerSync ? 'Turn tracker sync is on. Click to turn it off.' : 'Turn tracker sync is off. Click to turn it on (the turn tracker is visible to all players).', ctx));
      return `<div style="${CSS.footer}"><table style="${CSS.footTable}"><tr>${row1}</tr><tr>${row2}</tr></table></div>`;
    },

    chooser: (tokens) => Output.panel('Which character is asking?',
      Output.grid(tokens.map(t => [Util.esc(TokenUtils.tokenName(t) || 'Unnamed token'), `!queue --as ${t.id}`, CSS.btn, ''])
        .concat([['Cancel', '!queue --as cancel', CSS.btnDanger, 'Do not add the request']]))),

    // Last announced item; stays until the next Announce or Clear all
    // Last announced item, laid out like a queue row; stays until the next Announce or Clear all
    // viewer: the X is left out of players' own chat copies
    spotLine: (ctx, viewer) => {
      const s = State.get().spotlight;
      if (!s) return '';
      const t = s.tokenId ? getObj('graphic', s.tokenId) : null;
      const tokenCell = t
        ? Output.btn(`<img src="${TokenUtils.img(t)}" style="${CSS.tokenImg}">`, '!queue --pingspot', CSS.plainLink, 'Ping: pull everyone to this token', ctx)
        : '';
      let target = '';
      if (s.target) {
        const tt = s.target.tokenId ? getObj('graphic', s.target.tokenId) : null;
        const timg = tt ? `<img src="${TokenUtils.img(tt)}" style="${CSS.targetImg}">` : '';
        target = `<div style="${CSS.target}">${timg}${Util.esc(s.target.name)}</div>`;
      }
      return `<table style="${CSS.rowTable}"><tr style="${CSS.spotRow}">` +
        `<td style="${CSS.spotStar}">&#9733;</td>` +
        `<td style="${CSS.cellToken}">${tokenCell}</td>` +
        `<td style="${CSS.cellMain}"><div style="${CSS.spotLineLabel}">SPOTLIGHT</div>` +
        `<div style="font-weight:bold;color:${COLOR.band};font-size:13px;">${Util.esc(s.name)}</div>` +
        `<div style="${CSS.category}${s.urgent ? CSS.urgentText : ''}">${Util.esc(s.label)}</div>${target}</td>` +
        `<td style="${CSS.cellCtl}">${viewer === 'player' ? '' : Output.btn('X', '!queue --spotclear', CSS.ctlBtn, 'Clear the spotlight (GM)', ctx)}</td>` +
        `</tr></table>`;
    },

    // Public card; mid-combat it omits the free-form line
    cleared: (inCombat) => Output.box(`<div style="${CSS.spotHeader}">QUEUE CLEARED</div>` +
      (inCombat ? '' : `<div style="${CSS.spotBody}"><div style="${CSS.clearedText}">Free-form play resumes.</div></div>`)),

    // Make urgent / Make normal for the player's own request, as a grid item
    bumpItem: (entry) => entry.urgent
      ? ['Make normal', '!queue --bump off', CSS.btn, 'Return to your normal place in line']
      : ['Make urgent', '!queue --bump on', CSS.btnUrgent, 'Mark this request urgent'],

    ownControls: (entry) => Test.is(entry.pid) ? Test.controls(entry) : Output.grid([
      Render.bumpItem(entry),
      ['Withdraw', '!queue --withdraw', CSS.btnDanger, 'Withdraw your request']
    ]),

    // Token centered above each name; talk requests use two columns
    spotlight: (e) => {
      const person = (tokenId, name) => {
        const t = tokenId ? getObj('graphic', tokenId) : null;
        return (t ? `<img src="${TokenUtils.img(t)}" style="${CSS.spotImg}">` : '') +
          `<div style="${CSS.spotName}">${Util.esc(name)}</div>`;
      };
      let inner;
      if (e.target) {
        inner = `<div style="${CSS.spotTalk}${e.urgent ? CSS.urgentText : ''}">${Util.esc(e.label)}</div>` +
          `<table style="${CSS.spotTable}"><tr>` +
          `<td style="${CSS.spotCell}">${person(e.tokenId, e.name)}</td>` +
          `<td style="${CSS.spotWith}">&#9656;</td>` +
          `<td style="${CSS.spotCell}">${person(e.target.tokenId, e.target.name)}</td>` +
          `</tr></table>`;
      } else {
        inner = `<div style="${CSS.spotCell}">${person(e.tokenId, e.name)}</div>` +
          `<div style="${CSS.spotCat}${e.urgent ? CSS.urgentText : ''}">${Util.esc(e.label)}</div>`;
      }
      return Output.box(`<div style="${CSS.spotHeader}">SPOTLIGHT</div><div style="${CSS.spotBody}">${inner}</div>`);
    },

    menu: (pid) => {
      const cfg = State.config();
      const prefs = State.prefs(pid);
      const mine = State.entries()[pid];
      let current = '';
      if (mine) {
        current = `<div style="${CSS.note}">Current request: <b>${Util.esc(Util.what(mine))}</b>, number ${QueueData.position(pid)} of ${QueueData.count()}. Choosing again replaces it.</div>` +
          Render.ownControls(mine);
      }

      // Requests that need a second step (a target or typed text) are grouped at the end
      const item = (c, i) => [Util.esc(c.label) + (c.target ? '...' : ''), `!queue --raise ${i}`, c.urgent ? CSS.btnUrgent : CSS.btn, c.target ? 'Choose a character next' : ''];
      const cats = Output.grid(cfg.categories.map((c, i) => (c.target ? null : item(c, i))).filter(Boolean)
        .concat(cfg.categories.map((c, i) => (c.target ? item(c, i) : null)).filter(Boolean)).concat([
        ['Other...', '!queue --other ?{Describe your request}', CSS.btn, 'Type your own request']
      ]));

      const canView = cfg.visibility === 'all';
      const footer = `<div style="${CSS.footer}">` +
        (canView ? Output.btn('View queue', '!queue --view', CSS.btn, 'Post the queue to your chat') : '') +
        Output.btn('Add note', '!q note ?{Note}', CSS.btn, 'Add a line to the GM\'s session notes') +
        Output.btn('My settings', '!queue --settings', CSS.btn, 'Choose whether you see queue updates in chat and in your journal') +
        `</div>`;

      let hint = '';
      if (!prefs.hinted) {
        prefs.hinted = true;
        hint = `<div style="${CSS.note}">Tip: in the Collection tab, check <b>In Bar</b> next to the ${MACRO_NAME} macro to keep this menu one click away.</div>`;
      }

      return Output.box(Output.subHead('Raise your hand') +
        `<div style="${CSS.body}">${current}<div style="${CSS.label}">Choose a request:</div>${cats}${hint}</div>` + footer);
    },

    // Characters of online players (including the requester's own), plus a token picker
    // Party characters first, then other players' tokens on the requester's page.
    // Anything controlled only by the requester, or by All Players, is left out.
    targetMenu: (pid, catIndex, cmdPrefix) => {
      const c = State.config().categories[catIndex];
      const prefix = cmdPrefix || `!queue --target ${catIndex}`;
      const page = Util.getPageForPlayer(pid);
      const owners = (ids) => ids.filter(id => id !== 'all').map(Util.playerName).join(', ');
      const byLabel = (a, b) => a[0].localeCompare(b[0]);
      const seenChars = [];

      const party = findObjs({ _type: 'character' })
        .filter(ch => {
          const inParty = ch.get('inParty');
          return (inParty === true || inParty === 'true') && !ch.get('archived') &&
            TokenUtils.otherPlayers(TokenUtils.parseCtl(ch.get('controlledby')), pid);
        })
        .map(ch => {
          seenChars.push(ch.id);
          const t = TokenUtils.findCharToken(ch.id, page);
          const label = (t && TokenUtils.tokenName(t)) || ch.get('name');
          return [Util.esc(label), `${prefix} pc ${ch.id}`, CSS.btn, `Party member. Played by ${owners(TokenUtils.parseCtl(ch.get('controlledby')))}`];
        })
        .sort(byLabel);

      const onPage = TokenUtils.pageTokens(page)
        .filter(t => {
          if (!TokenUtils.otherPlayers(TokenUtils.controllers(t), pid)) return false;
          const rep = t.get('represents');
          if (rep) {
            if (seenChars.includes(rep)) return false;
            seenChars.push(rep);
          }
          return true;
        })
        .map(t => [Util.esc(TokenUtils.tokenName(t) || 'Unnamed token'), `${prefix} tok ${t.id}`, CSS.btn, `Played by ${owners(TokenUtils.controllers(t))}`])
        .sort(byLabel);

      const list = party.concat(onPage);
      const pcs = list.length
        ? Output.grid(list)
        : `<div style="${CSS.note}">No party members, and no other players' tokens on your page.</div>`;

      // Entities keep sendChat from resolving the target reference when the menu is posted
      const more = Output.grid([
        ['Other NPC', `${prefix} tok &#64;&#123;target|Choose a token|token_id&#125;`, CSS.btn, 'Click a token on the map'],
        ['Type a name', `${prefix} name ?{Name}`, CSS.btn, 'For characters with no token, such as in theater of the mind play']
      ]);

      return Output.panel(`${c ? c.label : 'Choose'}...`, `${pcs}<div style="${CSS.label}">Or:</div>${more}`);
    },

    // options: [value, label, hover text]
    toggle: (cmd, current, options) => options.map(([val, label, title]) =>
      Output.btn(label, `${cmd} ${val}`, current === val ? CSS.btnOn : CSS.btn, title ? `${title}${current === val ? ' (current setting)' : ''}` : '')
    ).join(''),

    gmSettings: (notice) => {
      const cfg = State.config();
      const help = Handouts.find(HELP_NAME);
      const setRow = (name, val) => `<tr><td style="${CSS.settingsName}">${name}</td><td style="${CSS.settingsVal}">${val}</td></tr>`;

      const iface = `<table style="${CSS.settingsRow}">` +
        setRow('<b>Interface</b>', [
          ['chat', 'Chat', 'Run the queue from chat: the panel is posted when the queue changes'],
          ['handout', 'Handout', 'Run the queue from the Queue handout: it updates in place, chat gets one-line notices']]
          .map(([val, label, title]) => Output.btn(label, `!queue --iface ${val} --from settings`, cfg.iface === val ? CSS.btnOn : CSS.btn,
            `${title}${cfg.iface === val ? ' (current setting)' : ''}`)).join('')) +
        `</table>` +
        `<div style="${CSS.note}">Chat needs nothing opened but adds to chat; good for small groups. Handout keeps chat clean but needs the handout open; good for larger groups and busy scenes. Players always use chat.</div>` +
        `<div style="${CSS.label}">Fine-tune</div>`;

      const general = `<table style="${CSS.settingsRow}">` +
        setRow('Queue visible to', Render.toggle('!queue --visibility', cfg.visibility, [
          ['gm', 'GM only', 'Only GMs see the queue. Players still get a whisper with their place in line'],
          ['all', 'Everyone', 'Players can see the queue in chat (each player can opt out)']])) +
        setRow('GM chat', Render.toggle('!queue --gmchat', cfg.gmChat, [
          ['off', 'Off', 'Nothing in your chat when the queue changes; type !q to see it'],
          ['notice', 'Notice', 'A one-line notice in your chat when the queue changes'],
          ['full', 'Full list', 'The whole queue is posted to your chat on every change (Chat interface; with Handout you get notices)']])) +
        (cfg.visibility === 'all' ? '' : `<tr><td colspan="2" style="${CSS.note}">Player chat applies only when the queue is visible to Everyone.</td></tr>`) +
        setRow('Player chat', Render.toggle('!queue --playerchat', cfg.playerChat, [
          ['off', 'Off', 'Players get no chat updates (they still get their own confirmations)'],
          ['notice', 'Notice', 'Players get a one-line notice when the queue changes'],
          ['full', 'Full list', 'Players get the whole queue on every change']])) +
        setRow('Urgent jumps the line', Render.toggle('!queue --urgentjumps', cfg.urgentJumps ? 'on' : 'off', [
          ['on', 'On', 'Urgent requests move to the top of the queue'],
          ['off', 'Off', 'Urgent requests are only marked red and keep their place']])) +
        setRow('Sound', `<span style="font-size:12px;">${cfg.soundTrack ? Util.esc(cfg.soundTrack) : 'None'}</span><br>` +
          Output.btn('Set', '!queue --sound ?{Jukebox track name}', CSS.btn, 'Choose a Jukebox track to play when a new request arrives (type its exact title)') +
          (cfg.soundTrack ? Output.btn('Test', '!queue --soundtest', CSS.btn, 'Play the track now') + Output.btn('Off', '!queue --sound off', CSS.btn, 'No sound for new requests') : '')) +
        setRow('Session notes handout', `<span style="font-size:12px;">${Util.esc(cfg.notesHandout)}</span><br>` +
          Output.btn('Rename', `!queue --notesname ?{Handout name|${Util.esc(cfg.notesHandout)}}`, CSS.btn, 'Renames the existing handout too')) +
        setRow('Session notes time zone', `<span style="font-size:12px;">${Util.esc(Notes.zoneLabel(cfg.notesTz))}</span><br>` +
          Output.btn('Set', `!queue --notestz ${Notes.zoneQuery()}`, CSS.btn, 'Choose the time zone used for session note timestamps')) +
        `</table>`;

      const tracker = `<div style="${CSS.label}">Turn tracker</div>` +
        `<div style="${CSS.warn}">The turn tracker is visible to every player. With sync on, the queue is shown to everyone even when it is set to GM only.</div>` +
        `<table style="${CSS.settingsRow}">` +
        setRow('Sync queue to tracker', Render.toggle('!queue --tracker', cfg.trackerSync ? 'on' : 'off', [
          ['on', 'On', 'Show queue requests as turns in the turn tracker (visible to all players)'],
          ['off', 'Off', 'Keep the queue out of the turn tracker']])) +
        setRow('During combat', Render.toggle('!queue --trackercombat', cfg.trackerCombat ? 'on' : 'off', [
          ['on', 'Insert', 'In combat, place each request right after the asking character\'s turn'],
          ['off', 'Hide', 'In combat, remove queue turns from the tracker until combat ends']])) +
        setRow('Open tracker on request', Render.toggle('!queue --trackeropen', cfg.trackerOpen ? 'on' : 'off', [
          ['on', 'On', 'Open the turn tracker when a new request arrives'],
          ['off', 'Off', 'Leave the turn tracker closed until you open it']])) +
        `</table>`;

      const catBlock = `<table style="${CSS.settingsRow}margin-top:6px;"><tr>` +
        `<td style="${CSS.label}margin-top:0;">Categories <span style="font-weight:normal;color:${COLOR.muted};">(${cfg.categories.length})</span></td>` +
        `<td style="text-align:right;">${Output.btn('Edit', '!queue --categories', CSS.btn, 'Add, rename, reorder or remove request categories')}</td></tr></table>`;

      const tools = `<div style="${CSS.label}">Queue</div>` +
        Output.btn('Show queue', '!queue --view', CSS.btn, 'Post the queue to your chat') +
        Output.btn('Log', '!queue --log', CSS.btn, 'Recently resolved requests') +
        Output.btn('Clear all', '!queue --clear', CSS.btnDanger, 'Remove every request and post a Queue Cleared card (asks first)') +
        (help ? Output.journalLink('Help', 'handout', help.id, CSS.btn, null, 'Open the Help: Queue handout') : '');

      const top = notice ? `<div style="${CSS.note}${CSS.urgentText}">${notice}</div>` : '';
      return Output.panel('Queue Settings (GM)', top + iface + general + tracker + catBlock + tools);
    },

    // Category editor: compact row controls, click a name to rename
    catEditor: (notice) => {
      const cats = State.config().categories;
      const q = (t) => String(t).replace(/\|/g, '&#124;').replace(/\}/g, '&#125;').replace(/,/g, '&#44;');
      const rows = cats.map((c, i) => {
        const first = i === 0;
        const last = i === cats.length - 1;
        return `<tr style="${CSS.catRow}${i % 2 ? CSS.rowAlt : ''}">` +
          `<td style="padding:3px 4px;">${Output.btn(Util.esc(c.label), `!queue --catrename ${i} ?{New name|${q(c.label)}}`, CSS.catName, 'Click to rename')}</td>` +
          `<td style="padding:3px 4px;text-align:right;white-space:nowrap;">` +
          (first ? `<span style="${CSS.catBlank}"></span>` : Output.btn('&#9650;', `!queue --catup ${i}`, CSS.catCtl, 'Move up')) +
          (last ? `<span style="${CSS.catBlank}"></span>` : Output.btn('&#9660;', `!queue --catdown ${i}`, CSS.catCtl, 'Move down')) +
          `<span style="${CSS.catGap}"></span>` +
          Output.btn('!', `!queue --caturgent ${i}`, c.urgent ? CSS.catCtlUrgent : CSS.catCtlOff, c.urgent ? 'Urgent: on (click to turn off)' : 'Urgent: off (click to turn on)') +
          Output.btn('&#9656;', `!queue --cattarget ${i}`, c.target ? CSS.catCtlOn : CSS.catCtlOff, c.target ? 'Asks for a character: on (click to turn off)' : 'Asks for a character: off (click to turn on)') +
          `<span style="${CSS.catGap}"></span>` +
          Output.btn('X', `!queue --catdel ${i}`, CSS.catCtl, 'Remove') +
          `</td></tr>`;
      }).join('');
      const sample = (style, glyph) => `<span style="${style}margin-left:0;margin-right:5px;">${glyph}</span>`;
      const legend =
        `<div style="${CSS.legendRow}">Click a name to rename it.</div>` +
        `<div style="${CSS.legendRow}">${sample(CSS.catCtl, '&#9650;')}${sample(CSS.catCtl, '&#9660;')}Change the order in the player menu</div>` +
        `<div style="${CSS.legendRow}">${sample(CSS.catCtlUrgent, '!')}Urgent: marked red and moved to the top</div>` +
        `<div style="${CSS.legendRow}">${sample(CSS.catCtlOn, '&#9656;')}Asks for a character next; listed after the others</div>` +
        `<div style="${CSS.legendRow}">${sample(CSS.catCtl, 'X')}Remove</div>` +
        `<div style="${CSS.legendRow}color:${COLOR.muted};">Faded toggles are off. "Other..." always comes last.</div>`;
      const top = notice ? `<div style="${CSS.note}${CSS.urgentText}">${notice}</div>` : '';
      return Output.panel('Categories', top + `<table style="${CSS.settingsRow}">${rows}</table>` +
        `<div style="margin-top:5px;">${legend}</div>` +
        `<div style="margin-top:4px;">` +
        Output.btn('Add category', '!queue --catadd ?{Category name}', CSS.btn, 'Add a new request type to the end of the list') +
        Output.btn('Reset to defaults', '!queue --catreset', CSS.btn, 'Replace this list with the default categories') +
        Output.btn('Back to settings', '!queue --settings', CSS.btn, 'Return to the settings panel') + `</div>`);
    },

    playerSettings: (pid) => {
      const cfg = State.config();
      const prefs = State.prefs(pid);
      let body = '';
      if (cfg.visibility !== 'all') {
        body += `<div style="${CSS.note}">The GM keeps the queue private. You will still get a whisper with your place in line.</div>`;
      } else {
        if (cfg.playerChat !== 'off') {
          body += `<div style="${CSS.label}">Show queue updates in chat</div>` +
            Render.toggle('!queue --mychat', prefs.chat ? 'on' : 'off', [
              ['on', 'On', 'Get queue updates in your chat'],
              ['off', 'Off', 'No queue updates in your chat (you still get your own confirmations)']]);
        }
        if (cfg.playerChat === 'off') {
          body += `<div style="${CSS.note}">The GM has turned off queue updates in chat.</div>`;
        }
      }
      const help = Handouts.find(HELP_NAME);
      body += `<div style="margin-top:6px;">` + Output.btn('Raise hand', '!queue', CSS.btn, 'Open the request menu') +
        (help ? Output.journalLink('Help', 'handout', help.id, CSS.btn, null, 'Open the Help: Queue handout') : '') + `</div>`;
      return Output.panel('My Queue Settings', body);
    },

    log: () => {
      const L = State.get().log;
      const rows = L.length
        ? L.map(l => `<tr><td style="${CSS.logCell}"><b>${Util.esc(l.name)}</b></td><td style="${CSS.logCell}">${Util.esc(l.label)}</td>` +
          `<td style="${CSS.logCell}">${Util.esc(l.outcome)}</td><td style="${CSS.logCell}white-space:nowrap;">${Util.minutesAgo(l.resolved)}</td></tr>`).join('')
        : `<tr><td style="${CSS.logCell}">No resolved requests yet.</td></tr>`;
      return Output.panel('Queue Log', `<table style="${CSS.logTable}">${rows}</table>` +
        Output.btn('Clear log', '!queue --clearlog', CSS.btn, 'Empty this log') + Output.btn('Settings', '!queue --settings', CSS.btn, 'Open the settings panel'));
    },

    notice: (text) => Output.msg(`${text} ` + Output.btn('View', '!queue --view', CSS.btnSmall, 'Show the queue'), 'notice'),

    help: () => {
      const H = (t) => `<div style="${CSS.helpH}">${t}</div>`;
      const C = (t) => `<span style="${CSS.helpCode}">${t}</span>`;
      return `<div style="font-family:Arial,sans-serif;font-size:13px;">` +
        H('What it does') +
        `<p>Queue keeps an ordered list of players who want the GM's attention, with the reason for each request. Requests are handled first in, first out. Requests marked urgent go to the top, unless the GM has turned that off.</p>` +
        `<p>Roll20's built-in ${C('/raisehand')} and ${C('/rh')} commands are not connected to this queue. Use the ${MACRO_NAME} macro or ${C('!q')} instead.</p>` +
        H('Players') +
        `<p>Click the ${MACRO_NAME} macro, or type ${C('!queue')} or ${C('!q')}. A menu of request types is whispered to you. Click one to join the queue. You get a whisper with your place in line.</p>` +
        `<p>To put the macro in your bar: open the Collection tab, find the ${MACRO_NAME} macro, and check <b>In Bar</b>.</p>` +
        `<p>You can have one request at a time. Choosing a new one replaces the old one and keeps your place.</p>` +
        `<p><b>Make urgent</b> (on your confirmation and in the menu) marks your request urgent and moves it to the top. <b>Make normal</b> returns it to its original place.</p>` +
        `<p><b>Other...</b> asks you to type your own request. Requests ending in "..." (such as <b>Help someone...</b> and <b>Talk with...</b>) are listed together at the end of the menu and then ask which character the request involves: party members first, then other players' tokens on your page (your own characters are not listed); <b>Other NPC</b>, which lets you click a token on the map; or <b>Type a name</b>, for a character with no token. The player of a chosen character is told about the request.</p>` +
        `<p>Your request is listed under your character. If you have one of your tokens selected, that token and its name are used. Otherwise your character's token on the current page is used, and if you have several there you are asked which one is asking. If none is found, your player name is used. Tokens shared with other players, or set to All Players, are not used.</p>` +
        `<p><b>Withdraw</b> removes your request. If the GM shares the queue, <b>My settings</b> lets you choose whether you see it in chat.</p>` +
        `<p><b>Add note</b> (in the menu), or ${C('!q note')} followed by your text, adds a line to the GM's session notes. The GM gets your note right away and you get a short "Note added" whisper.</p>` +
        H('GM') +
        `<p><b>Interface.</b> You run the queue from <b>Chat</b> or from the <b>Queue handout</b>. The first time the script starts, you are asked which you prefer; switch at any time with <b>Interface</b> in the queue footer or at the top of Settings. The Queue handout is GM-only; players always use chat.</p>` +
        `<p><b>Chat:</b> the queue panel is posted to your chat when the queue changes (Settings can reduce this to a one-line notice, or nothing). Nothing to open, but it adds to chat. Good for small groups.</p>` +
        `<p><b>Handout:</b> the same panel lives in the Queue handout and updates in place. Chat gets a one-line notice with an <b>Open</b> link on each change, and ${C('!q')} updates the handout and whispers a link to open it. Keep the handout open beside the map; the API cannot open it for you, so open it once per session. <b>Refresh</b> redraws it. While Chat is the interface, the handout shows a short notice with a button to switch.</p>` +
        `<p>Type ${C('!q')} to see the queue. Click a token (including a target's small token) to ping and pull everyone to it. The eye button marks a request as <b>seen</b> and lets the player know with a short whisper, without interrupting the game; click it again to un-mark it. Click a name to ping and pull only you and that player; hover over it to see the player's name. A target's small token and name work the same way for the target. <b>Tracker sync</b> in the footer turns turn tracker sync on or off, and <b>Notes</b> opens the session notes handout. Click <b>X</b> to dismiss a request quietly; the player is told it was cleared. Click the speech balloon to <b>announce</b> it: the request is dismissed and a card in chat shows everyone who has the spotlight.</p>` +
        `<p>The <b>SPOTLIGHT</b> line at the top of the queue shows the last announced request until the next one is announced, or until you clear it with its <b>X</b>. <b>Clear all</b> empties the queue and posts a <b>QUEUE CLEARED</b> card to everyone, which signals that free-form play resumes. It can be used even when the queue is already empty.</p>` +
        `<p><b>Session notes:</b> ${C('!q note')} followed by text adds a line to the GM-only <b>Session Notes</b> handout (the name can be changed in Settings). Each line has the time, the player's name and the note. Times are UTC unless you choose a time zone in Settings; a short line in the handout marks each change of time zone. Players' notes are also whispered to you; your own notes are added silently.</p>` +
        H('Practice mode') +
        `<p>Practice mode lets a GM try every part of the queue alone, before using it in a game. Type ${C('!q --test')} to open the <b>Queue Test Panel</b>.</p>` +
        `<p><b>1. Add stand-in requests.</b> Select one or more tokens and click <b>Add from selected</b>, then choose a category (or Random). Each token becomes a request under its name and image, in the order you selected them. <b>Add without token</b> adds a request named "Test 1", "Test 2" and so on.</p>` +
        `<p><b>2. Act as the players.</b> Each stand-in request has its own buttons in the panel: <b>Make urgent</b> / <b>Make normal</b>, <b>Category</b> (change the request), <b>Target...</b> (for Help someone and Talk with; pick a character, a test token or a typed name) and <b>Withdraw</b>. Messages that would go to that player come to you instead, marked <b>[Test: name]</b>.</p>` +
        `<p><b>3. Run the queue as the GM.</b> Type ${C('!q')} and use the queue as you would in play: click tokens and names to ping, <b>Announce</b> a request to post the spotlight card, dismiss with <b>X</b>, clear the spotlight, check the <b>Log</b> and use <b>Clear all</b>. Try the settings too, such as chat levels and the turn tracker.</p>` +
        `<p><b>4. Clean up.</b> <b>Clear test requests</b> in the panel removes only the stand-in requests; real ones are kept. Public cards (Spotlight, Queue Cleared) are posted to everyone, so practice when players are not in the game, or warn them first.</p>` +
        H('Turn tracker (optional)') +
        `<p><b>Warning:</b> every player can see the turn tracker. With sync on, the queue is shown to everyone even when it is set to GM only.</p>` +
        `<p>When the turn order has no token turns, each request appears as a custom turn (urgent requests start with \u{1F534}). Deleting a turn dismisses that request. Dragging reorders the queue. <b>Next Turn</b> announces the top request. Editing a turn's text just restores it. Clearing the whole turn order does not dismiss anything; the requests are put back.</p>` +
        `<p><b>During combat: Insert</b> places each request right after the asking character's turn, marked with \u2517 instead of a name, with that turn's value minus 0.01 so it stays in place when the tracker is sorted. If it ends up anywhere else, the name is shown. Urgent requests, and players with no token turn, go just under the top. Advancing past a request dismisses it quietly. <b>Hide</b> removes the requests from the tracker until combat ends; the queue itself is unchanged. Turns added by other scripts are never touched.</p>` +
        `<p>The <b>?</b> button in the header opens this handout.</p>` +
        `<p>The gear button in the header opens <b>Settings</b>, which controls who can see the queue, the interface (Chat or Handout), how much appears in chat for the GM and for players, whether urgent requests jump the line, the notification sound (a Jukebox track), and the list of request categories (<b>Edit</b> opens the category editor, where categories can be renamed, reordered, marked urgent or set to ask for a character). It also has the log of resolved requests and <b>Clear all</b>.</p>` +
        H('Troubleshooting') +
        `<p>If a request shows a player's name instead of their character's, have that player select their token and type ${C('!q --whoami')}. You get a report of the token and character controllers the script found, which ones count, and which name and token a request would use. The usual causes are a second player or <b>All Players</b> in the token's or character's "Controlled by" list, or the token being deselected before the request was made. GM accounts are ignored.</p>` +
        H('Commands') +
        `<p>${C('!queue')} or ${C('!q')} &mdash; request menu (player) or queue (GM)<br>` +
        `${C('!q --view')} &mdash; show the queue<br>` +
        `${C('!q --withdraw')} &mdash; withdraw your request<br>` +
        `${C('!q --settings')} &mdash; settings<br>` +
        `${C('!q --iface chat')} / ${C('!q --iface handout')} &mdash; choose the GM interface (GM)<br>` +
        `${C('!q note')} <i>text</i> &mdash; add a session note<br>` +
        `${C('!q --test')} &mdash; practice mode panel (GM)<br>` +
        `${C('!q --whoami')} &mdash; troubleshooting: how your request would be identified (report goes to the GM)<br>` +
        `${C('!q --help')} &mdash; link to this handout</p>` +
        `<p style="font-size:11px;color:${COLOR.muted};">${scriptName} v${version}</p>` +
        `</div>`;
    }
  };

  // Handouts
  const Handouts = {
    find: (name) => findObjs({ _type: 'handout', name })[0],

    ensure: (name) => Handouts.find(name) || createObj('handout', { name, archived: false }),

    ensureHelp: () => {
      const old = Handouts.find(OLD_HELP_NAME);
      if (old && !Handouts.find(HELP_NAME)) old.set('name', HELP_NAME);
      const h = Handouts.ensure(HELP_NAME);
      h.set({ notes: Render.help(), inplayerjournals: 'all', avatar: HELP_AVATAR });
    },

    // The Queue handout is the GM's interface: the live panel in Handout mode, a short notice in Chat mode
    updateQueue: () => {
      const cfg = State.config();
      const h = Handouts.ensure(HANDOUT_NAME);
      const notes = cfg.iface === 'handout'
        ? Render.queue('handout', '', 'gm')
        : Output.box(Render.header('handout') +
          `<div style="${CSS.empty}">Chat is the current interface for the queue.</div>` +
          `<div style="${CSS.footer}text-align:center;">` +
          Output.btn('Switch to Handout', '!queue --iface handout --from handout', CSS.btn, 'Run the queue from this handout', 'handout') + `</div>`);
      h.set({ inplayerjournals: '', controlledby: '', notes });
    }
  };

  // Shows the GM panel in the chosen interface
  const Show = {
    openLink: (label) => {
      const h = Handouts.find(HANDOUT_NAME);
      return h ? Output.journalLink(label || 'Open Queue handout', 'handout', h.id, CSS.btnSmall, COLOR.band, 'Open the Queue handout') : '';
    },

    // whisperLink: in Handout mode, also whisper a link to open the handout
    gm: (caption, whisperLink) => {
      if (State.config().iface === 'handout') {
        Handouts.updateQueue();
        if (whisperLink) Output.toGM(Output.msg(`Queue updated. ${Show.openLink()}`, 'notice'));
        return;
      }
      Output.toGM(Render.queue('chat', caption || '', 'gm'));
    },

    // First-run choice, and the same choice when switching
    choicePanel: () => Output.panel('How do you want to run the queue?',
      `<div style="${CSS.note}margin-top:0;"><b>Chat:</b> the queue is posted in chat when it changes. Nothing to open, but it scrolls past and adds to chat. Good for small groups and quick sessions.</div>` +
      `<div style="${CSS.note}"><b>Handout:</b> one window that updates in place, with one-line notices in chat. Keep it open beside the map. Good for larger groups and busy scenes.</div>` +
      `<div style="${CSS.note}">Either way, players use chat. You can switch at any time from the queue footer or Settings.</div>` +
      Output.grid([
        ['Chat', '!queue --iface chat', CSS.btn, 'Run the queue from chat'],
        ['Handout', '!queue --iface handout', CSS.btn, 'Run the queue from the Queue handout']
      ]))
  };

  // Sound
  const Sound = {
    findTrack: (title) => findObjs({ _type: 'jukeboxtrack' })
      .find(t => (t.get('title') || '').toLowerCase() === String(title).toLowerCase()),

    play: () => {
      const cfg = State.config();
      if (!cfg.soundTrack) return;
      const t = Sound.findTrack(cfg.soundTrack);
      if (!t) { Logger.error(`Jukebox track not found: ${cfg.soundTrack}`); return; }
      if (t.get('playing')) {
        t.set({ playing: false, softstop: false });
        setTimeout(() => t.set({ playing: true, softstop: false, loop: false }), 250);
      } else {
        t.set({ playing: true, softstop: false, loop: false });
      }
    }
  };

  // Turn tracker sync. Only turns created by this script are ever changed.
  const Tracker = {
    parse: (raw) => {
      if (!raw) return [];
      try { const a = JSON.parse(raw); return Array.isArray(a) ? a : []; } catch (e) { return []; }
    },
    read: () => Tracker.parse(Campaign().get('turnorder')),
    write: (list) => Campaign().set('turnorder', JSON.stringify(list)),
    reg: () => State.get().tracker.items,

    isToken: (t) => !!(t && t.id && t.id !== '-1'),
    hasTokens: (list) => list.some(Tracker.isToken),
    key: (t) => `${t.id}|${t.custom || ''}|${t.pr}`,

    // hosted: placed directly under the requester's own token turn, so the name is implied
    text: (e, hosted) => {
      const what = Util.what(e);
      const s = hosted ? `┗ ${what}` : `${e.urgent ? '\u{1F534} ' : ''}${e.name}: ${what}`;
      return s.length > 60 ? `${s.slice(0, 59)}…` : s;
    },

    // Nearest token turn above position i, wrapping from the top to the bottom
    tokenAbove: (arr, i) => {
      for (let k = 1; k < arr.length; k++) {
        const t = arr[(i - k + arr.length) % arr.length];
        if (Tracker.isToken(t)) return t;
      }
      return null;
    },

    // Player id for one of this script's turns, or null. Corner items can share text,
    // so ties are settled by the token turn above (each host token has one controller).
    ownerOf: (t, i, arr) => {
      if (!t || t.id !== '-1') return null;
      const R = Tracker.reg();
      const hits = Object.keys(R).filter(pid => R[pid].text === t.custom);
      if (hits.length < 2 || !arr) return hits[0] || null;
      const above = Tracker.tokenAbove(arr, i);
      return hits.find(pid => above && R[pid].hostId === above.id) || hits[0];
    },

    strip: (list) => list.filter((t, i, arr) => !Tracker.ownerOf(t, i, arr)),

    // Value minus 0.01 keeps an item just after its host on a descending sort
    minus: (pr) => {
      const n = parseFloat(pr);
      if (isNaN(n)) return pr === undefined ? '' : pr;
      return Math.round((n - 0.01) * 100) / 100;
    },

    item: (custom, pr, pageid) => ({ id: '-1', pr, custom, _pageid: pageid || Campaign().get('playerpageid') }),

    // No token turns: queue items follow any other custom turns, in queue order
    plain: (list) => {
      const kept = Tracker.strip(list);
      const R = {};
      const items = QueueData.ordered().map(e => {
        const text = Tracker.text(e, false);
        R[e.pid] = { text, urgent: e.urgent, hostId: '' };
        return Tracker.item(text, '');
      });
      State.get().tracker.items = R;
      return kept.concat(items);
    },

    // Token turns present: targeted inserts and removals only
    combat: (input) => {
      // Work on copies so the write check in sync() sees in-place text changes
      const list = input.map(t => Object.assign({}, t));
      const R = Tracker.reg();
      const entries = State.entries();
      const owners = list.map((t, i, arr) => Tracker.ownerOf(t, i, arr));
      const out = list.filter((t, i) => {
        const pid = owners[i];
        if (!pid) return true;
        const e = entries[pid];
        if (!e || e.urgent !== R[pid].urgent) { delete R[pid]; return false; }
        return true;
      });
      // Update text in place; a corner item no longer under its host (dragged, or host removed) shows its name
      out.forEach((t, i, arr) => {
        const pid = Tracker.ownerOf(t, i, arr);
        if (!pid) return;
        const reg = R[pid];
        if (reg.hostId) {
          const above = Tracker.tokenAbove(arr, i);
          if (!above || above.id !== reg.hostId) {
            // Host still in the list means the GM dragged the item away: leave it where it is
            reg.pinned = arr.some(x => x.id === reg.hostId);
            reg.hostId = '';
          } else {
            // Follow the host's initiative value
            const want = Tracker.minus(above.pr);
            if (String(want) !== String(t.pr)) t.pr = want;
          }
        }
        const txt = Tracker.text(entries[pid], !!reg.hostId);
        if (txt !== t.custom) { t.custom = txt; reg.text = txt; }
      });
      // An unplaced item whose character has since joined the turn order moves under it
      for (let i = out.length - 1; i >= 0; i--) {
        const pid = Tracker.ownerOf(out[i], i, out);
        if (!pid) continue;
        const e = entries[pid];
        const reg = R[pid];
        if (reg.hostId || reg.pinned || e.urgent || !e.tokenId) continue;
        if (out.some(x => Tracker.isToken(x) && x.id === e.tokenId)) {
          out.splice(i, 1);
          delete R[pid];
        }
      }
      const present = out.map((t, i, arr) => Tracker.ownerOf(t, i, arr)).filter(Boolean);
      Object.keys(R).forEach(pid => { if (!present.includes(pid)) delete R[pid]; });

      QueueData.ordered().forEach(e => {
        if (R[e.pid]) return;
        const top = out[0];
        let idx = Math.min(1, out.length);
        let pr;
        let hostId = '';
        let pageid = top && top._pageid;
        if (!e.urgent) {
          const h = e.tokenId ? out.findIndex(t => Tracker.isToken(t) && t.id === e.tokenId) : -1;
          if (h >= 0) {
            idx = h + 1;
            pr = Tracker.minus(out[h].pr);
            pageid = out[h]._pageid || pageid;
            hostId = out[h].id;
          }
        }
        if (pr === undefined) pr = top ? Tracker.minus(top.pr) : '';
        // Keep first-in order among queue items already in that spot. Urgent items go ahead of
        // non-urgent items under the top, but after the top character's own corner items.
        const topId = top && top.id;
        while (idx < out.length) {
          const owner = Tracker.ownerOf(out[idx], idx, out);
          if (!owner) break;
          if (e.urgent && !hostId && !(R[owner].urgent || (R[owner].hostId && R[owner].hostId === topId))) break;
          idx++;
        }
        const text = Tracker.text(e, !!hostId);
        out.splice(idx, 0, Tracker.item(text, pr, pageid));
        R[e.pid] = { text, urgent: e.urgent, hostId };
      });
      return out;
    },

    sync: () => {
      const cfg = State.config();
      const list = Tracker.read();
      let next;
      if (!cfg.trackerSync) {
        if (!Object.keys(Tracker.reg()).length) return;
        next = Tracker.strip(list);
        State.get().tracker.items = {};
      } else if (!Tracker.hasTokens(list)) {
        next = Tracker.plain(list);
      } else if (cfg.trackerCombat) {
        next = Tracker.combat(list);
      } else {
        next = Tracker.strip(list);
        State.get().tracker.items = {};
      }
      if (JSON.stringify(next) !== JSON.stringify(list)) Tracker.write(next);
    },

    open: () => {
      if (!Campaign().get('initiativepage')) Campaign().set('initiativepage', Campaign().get('playerpageid'));
    },

    // GM drag: queue takes the new relative order
    rerank: (pids) => {
      const E = State.entries();
      const es = pids.map(p => E[p]).filter(Boolean);
      const keys = es.map(QueueData.key).sort((a, b) => a - b);
      es.forEach((e, i) => { e.rank = keys[i] + i * 0.001; });
    },

    combatStarted: () => {
      const n = QueueData.count();
      if (!n) return;
      const cfg = State.config();
      if (cfg.trackerCombat) {
        // Move existing items from the end of the list to their combat positions
        const list = Tracker.strip(Tracker.read());
        State.get().tracker.items = {};
        Tracker.write(list);
      }
      const where = cfg.trackerCombat
        ? 'They have been placed in the turn order.'
        : 'They are hidden from the turn order until combat ends.';
      Output.toGM(Output.msg(`Combat started with ${n} request(s) in the queue. ${where}` +
        Output.grid([
          ['Clear queue', '!queue --clear confirm', CSS.btnDanger, 'Empty the queue now'],
          ['Show queue', '!queue', CSS.btn, 'Show the queue']
        ]), 'notice'));
    },

    // GM edits in the turn tracker
    handleChange: (obj, prev) => {
      if (!State.config().trackerSync) return;
      const cur = Tracker.parse(obj.get('turnorder'));
      const old = Tracker.parse(prev && prev.turnorder);
      const wasCombat = Tracker.hasTokens(old);
      const isCombat = Tracker.hasTokens(cur);
      const n = old.length;

      // Next Turn: exactly one item moved from top to bottom
      const rotated = n > 1 && cur.length === n &&
        cur.every((t, k) => Tracker.key(t) === Tracker.key(old[(k + 1) % n]));
      if (rotated) {
        const pid = Tracker.ownerOf(old[0], 0, old);
        if (pid && State.entries()[pid]) {
          if (isCombat) Actions.drop(pid, 'dismissed');
          else Actions.announce(null, pid);
        }
        return;
      }

      const oldOwned = old.map((t, i, arr) => Tracker.ownerOf(t, i, arr)).filter(Boolean);
      const curOwned = cur.map((t, i, arr) => Tracker.ownerOf(t, i, arr)).filter(Boolean);
      const missing = oldOwned.filter(pid => !curOwned.includes(pid));

      if (missing.length && cur.length === 0) {
        // Turn order wiped: housekeeping, not a decision about requests. Rebuild below.
        State.get().tracker.items = {};
      } else if (missing.length) {
        const oldKeys = old.map(Tracker.key);
        const edited = cur.filter((t, i, arr) => t.id === '-1' && !Tracker.ownerOf(t, i, arr) && !oldKeys.includes(Tracker.key(t)));
        if (edited.length && cur.length === n) {
          // Text was edited: remove the edited copy and restore ours
          missing.forEach(pid => { delete Tracker.reg()[pid]; });
          Tracker.write(cur.filter(t => !edited.includes(t)));
        } else {
          // Trashcan: dismiss quietly, as with X
          missing.forEach(pid => { if (State.entries()[pid]) Actions.drop(pid, 'dismissed'); });
        }
      } else if (curOwned.length > 1 && curOwned.join() !== oldOwned.join()) {
        Tracker.rerank(curOwned);
        Handouts.updateQueue();
      }

      if (isCombat && !wasCombat) Tracker.combatStarted();
      Tracker.sync();
    }
  };

  // Notifications after any queue change
  const Notify = {
    // change: { type: 'add'|'replace'|'remove'|'clear', entry, text }
    change: (change) => {
      const cfg = State.config();

      const caption = change.caption !== undefined ? change.caption : change.text;
      if (cfg.iface === 'handout') {
        // The handout holds the panel; chat gets a one-line notice with a link to it
        if (cfg.gmChat !== 'off') Output.toGM(Output.msg(`${change.text} ${Show.openLink('Open')}`, 'notice'));
      } else if (cfg.gmChat === 'full') Output.toGM(Render.queue('chat', caption, 'gm'));
      else if (cfg.gmChat === 'notice') Output.toGM(Render.notice(change.text));

      if (cfg.visibility === 'all' && cfg.playerChat !== 'off') {
        const skip = ['add', 'replace', 'update'].includes(change.type) && change.entry ? change.entry.pid : null;
        Util.onlinePlayers()
          .filter(p => !playerIsGM(p.id) && p.id !== skip && State.prefs(p.id).chat)
          .forEach(p => Output.toPlayer(p.id, cfg.playerChat === 'full' ? Render.queue('chat', caption, 'player', p.id) : Render.notice(change.text)));
      }

      Tracker.sync();
      Handouts.updateQueue();
      if (change.type === 'add') {
        Sound.play();
        if (cfg.trackerSync && cfg.trackerOpen) Tracker.open();
      }
    },

    // Requester confirmation, with the list attached if they would receive it anyway
    confirm: (pid, text) => {
      const cfg = State.config();
      const fullForMe = cfg.visibility === 'all' && cfg.playerChat === 'full' && State.prefs(pid).chat;
      const entry = State.entries()[pid];
      const line = text + (entry ? Render.ownControls(entry) : '');
      Output.toPlayer(pid, fullForMe ? Render.queue('chat', line, 'player', pid) : Output.msg(line, 'confirm'));
    },

    targets: (entry, text) => {
      if (!entry.target || !entry.target.playerIds) return;
      entry.target.playerIds.forEach(id => Output.toPlayer(id, Output.box(`<div style="${CSS.body}">${text}</div>`)));
    }
  };

  // Requests waiting on the "Which character is asking?" choice (runtime only)
  const Pending = {};

  // Queue actions
  const Actions = {
    // ident: optional { token, name } already chosen by the player
    request: (msg, spec, ident) => {
      const pid = msg.playerid;
      const who = ident || TokenUtils.identify(msg);
      if (who.choose) {
        Pending[pid] = spec;
        return Output.toPlayer(pid, Render.chooser(who.choose));
      }
      delete Pending[pid];
      const entries = State.entries();
      const existing = entries[pid];
      const tok = who.token;
      const entry = {
        pid,
        name: who.name,
        player: Test.is(pid) ? 'Test' : Util.playerName(pid),
        label: spec.label,
        urgent: !!spec.urgent,
        target: spec.target || null,
        tokenId: tok ? tok.id : '',
        joined: existing ? existing.joined : QueueData.stamp()
      };
      if (existing && typeof existing.rank === 'number') entry.rank = existing.rank;
      // "Seen" carries over only when the request itself is unchanged
      const sameTarget = JSON.stringify((existing && existing.target && existing.target.name) || '') === JSON.stringify((entry.target && entry.target.name) || '');
      if (existing && existing.seen && existing.label === entry.label && sameTarget) entry.seen = true;
      entries[pid] = entry;

      const pos = QueueData.position(pid);
      const total = QueueData.count();
      const name = `<b>${Util.esc(entry.name)}</b>`;
      const label = Util.esc(Util.what(entry));

      Notify.confirm(pid, existing
        ? `Request changed to <b>${label}</b>. You are number ${pos} of ${total}.`
        : `Added to the queue: <b>${label}</b>. You are number ${pos} of ${total}.`);

      if (entry.target) {
        Notify.targets(entry, `${name} raised a hand: <b>${Util.esc(entry.label)}</b> &mdash; <b>${Util.esc(entry.target.name)}</b>. The GM has been told.`);
      }

      Notify.change({
        type: existing ? 'replace' : 'add',
        entry,
        text: existing ? `${name} changed their request: ${label}` : `${name} raised a hand: ${label}`
      });
    },

    remove: (msg, targetPid) => {
      const pid = msg.playerid;
      const isGM = playerIsGM(pid);
      const entries = State.entries();
      const e = entries[targetPid];

      if (!e) {
        Output.toPlayer(pid, Output.box(`<div style="${CSS.body}">That request is no longer in the queue.</div>`));
        return;
      }
      if (!isGM && pid !== targetPid) {
        Output.toPlayer(pid, Output.box(`<div style="${CSS.body}">You can only withdraw your own request.</div>`));
        return;
      }

      if (isGM) return Actions.drop(targetPid, 'dismissed');

      delete entries[targetPid];
      State.addLog(e, 'withdrawn');
      const name = `<b>${Util.esc(e.name)}</b>`;
      Output.toPlayer(pid, Output.msg('Your request was withdrawn.'));
      if (e.target) Notify.targets(e, `${name} withdrew their request: <b>${Util.esc(Util.what(e))}</b>.`);
      Notify.change({ type: 'remove', entry: e, text: `${name}'s request was withdrawn: ${Util.esc(Util.what(e))}` });
    },

    // GM dismissal without a public card (X, trashcan, or advancing past it in combat)
    drop: (targetPid, outcome) => {
      const entries = State.entries();
      const e = entries[targetPid];
      if (!e) return;
      delete entries[targetPid];
      State.addLog(e, outcome);
      const name = `<b>${Util.esc(e.name)}</b>`;
      const label = Util.esc(Util.what(e));
      Output.toPlayer(targetPid, Output.msg(`Your request (<b>${label}</b>) was cleared by the GM.`));
      if (e.target) Notify.targets(e, `The request from ${name} (<b>${label}</b>) was cleared by the GM.`);
      Notify.change({ type: 'remove', entry: e, text: `${name}'s request was ${outcome}: ${label}` });
    },

    // Player marks their own request urgent or normal; join time is kept
    bump: (msg, on) => {
      const pid = msg.playerid;
      const e = State.entries()[pid];
      if (!e) return Output.toPlayer(pid, Output.msg('You have no request in the queue.'));
      const changed = e.urgent !== on;
      e.urgent = on;
      const where = `You are number ${QueueData.position(pid)} of ${QueueData.count()}.`;
      Notify.confirm(pid, on
        ? `Your request (<b>${Util.esc(Util.what(e))}</b>) is marked <b>urgent</b>. ${where}`
        : `Your request (<b>${Util.esc(Util.what(e))}</b>) is back to normal. ${where}`);
      if (changed) {
        Notify.change({ type: 'update', entry: e, text: `<b>${Util.esc(e.name)}</b> marked their request ${on ? 'urgent' : 'normal'}: ${Util.esc(Util.what(e))}` });
      }
    },

    // GM dismisses a request and posts a public spotlight card
    announce: (msg, targetPid) => {
      const entries = State.entries();
      const e = entries[targetPid];
      if (!e) return Output.toGM(Output.msg('That request is no longer in the queue.'));
      delete entries[targetPid];
      State.addLog(e, 'announced');
      State.get().spotlight = { name: e.name, label: e.label, tokenId: e.tokenId, target: e.target, urgent: e.urgent };
      Output.broadcast(Render.spotlight(e));
      // The spotlight line already says this, so the full list gets no caption
      Notify.change({ type: 'remove', entry: e, caption: '', text: `<b>${Util.esc(e.name)}</b> has the spotlight: ${Util.esc(Util.what(e))}` });
    },

    clearAll: () => {
      const entries = State.entries();
      Object.keys(entries).forEach(k => {
        State.addLog(entries[k], 'cleared');
        delete entries[k];
      });
      State.get().spotlight = null;
      // The public card replaces per-player whispers
      Output.broadcast(Render.cleared(Tracker.hasTokens(Tracker.read())));
      Notify.change({ type: 'clear', text: 'The queue was cleared.' });
    },

    ping: (msg, targetPid, pair, ofTarget) => {
      const e = State.entries()[targetPid];
      const id = e && (ofTarget ? e.target && e.target.tokenId : e.tokenId);
      const tok = id ? getObj('graphic', id) : null;
      if (!tok) {
        Output.toGM(Output.box(`<div style="${CSS.body}">No token is available for that request.</div>`));
        return;
      }
      const pairWith = ofTarget ? ((e.target && e.target.playerIds) || []) : [targetPid];
      const visibleTo = pair
        ? [msg.playerid].concat(pairWith.filter(id => !Test.is(id)))
        : Util.onlinePlayers().map(p => p.id);
      sendPing(tok.get('left'), tok.get('top'), tok.get('pageid'), msg.playerid, true, visibleTo);
    },

    resolveTarget: (msg, kind, id) => {
      if (kind === 'name') {
        const name = String(id || '').trim().slice(0, 60);
        return name ? { name, tokenId: '', playerIds: [] } : null;
      }
      if (kind === 'pc') return Actions.talkTarget(msg, null, id);
      const tok = getObj('graphic', id);
      if (!tok) return null;
      const t = Actions.talkTarget(msg, tok, null);
      t.name = TokenUtils.tokenName(tok) || t.name;
      return t;
    },

    talkTarget: (msg, tok, charId) => {
      const pid = msg.playerid;
      let name, tokenId = '', playerIds = [];
      // Notify every other controlling player, online or not
      const others = (ids) => ids.filter(id => id !== 'all' && id !== pid);

      if (charId) {
        const c = getObj('character', charId);
        if (!c) return null;
        playerIds = others(TokenUtils.parseCtl(c.get('controlledby')));
        const t = TalkName.token(c, pid);
        name = (t && TokenUtils.tokenName(t)) || c.get('name');
        tokenId = t ? t.id : '';
      } else {
        name = tok.get('name') || 'Unnamed token';
        tokenId = tok.id;
        playerIds = others(TokenUtils.controllers(tok));
      }
      return { name, tokenId, playerIds };
    }
  };

  // GM practice/test mode: stand-in requests that behave like real players' requests
  const Test = {
    is: (pid) => typeof pid === 'string' && pid.indexOf('test_') === 0,

    names: () => State.get().test.names,

    wrap: (pid, html) => `<div style="font-size:10px;font-weight:bold;color:${COLOR.urgentText};margin:0 0 2px 2px;">[Test: ${Util.esc(Test.names()[pid] || pid)}]</div>${html}`,

    entries: () => QueueData.ordered().filter(e => Test.is(e.pid)),

    // Roll query listing the categories, plus Random
    catQuery: () => {
      const safe = (t) => String(t).replace(/,/g, '&#44;').replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
      const opts = State.config().categories.map((c, i) => `${safe(c.label)},${i}`);
      return `?{Category|Random,r|${opts.join('|')}}`;
    },

    targetQuery: () => {
      const safe = (t) => String(t).replace(/,/g, '&#44;').replace(/\|/g, '&#124;').replace(/\}/g, '&#125;');
      const opts = State.config().categories.map((c, i) => (c.target ? `${safe(c.label)},${i}` : null)).filter(Boolean);
      return opts.length ? `?{Category|${opts.join('|')}}` : '0';
    },

    spec: (val) => {
      const cats = State.config().categories;
      const plain = cats.map((c, k) => k).filter(k => !cats[k].target);
      const i = val === 'r' || val === '' ? plain[Math.floor(Math.random() * plain.length)] : parseInt(val, 10);
      const c = cats[i] || cats[0];
      return { label: c.label, urgent: c.urgent };
    },

    controls: (e) => Output.grid([
      e.urgent
        ? ['Make normal', `!queue --test bump ${e.pid} off`, CSS.btn, '']
        : ['Make urgent', `!queue --test bump ${e.pid} on`, CSS.btnUrgent, ''],
      ['Category', `!queue --test cat ${e.pid} ${Test.catQuery()}`, CSS.btn, 'Replace with another category'],
      ['Target...', `!queue --test targetmenu ${e.pid} ${Test.targetQuery()}`, CSS.btn, 'Choose a target category, then a character'],
      ['Withdraw', `!queue --test withdraw ${e.pid}`, CSS.btnDanger, '']
    ]),

    panel: () => {
      const list = Test.entries();
      const rows = list.length
        ? list.map(e => `<div style="${CSS.label}">${Util.esc(e.name)} <span style="font-weight:normal;${e.urgent ? CSS.urgentText : ''}">&mdash; ${Util.esc(Util.what(e))}</span></div>` + Test.controls(e)).join('')
        : `<div style="${CSS.note}">No test requests.</div>`;
      return Output.panel('Queue Test Panel', Output.grid([
        ['Add from selected', `!queue --test add ${Test.catQuery()}`, CSS.btn, 'One request per selected token'],
        ['Add without token', `!queue --test addplain ${Test.catQuery()}`, CSS.btn, 'A request with no token'],
        ['Refresh panel', '!queue --test', CSS.btn, ''],
        ['Clear test requests', '!queue --test clear', CSS.btnDanger, 'Real requests are kept']
      ]) + `<div style="${CSS.note}">Test requests look like real ones everywhere else. Their whispers come to you, marked [Test].</div>` + rows);
    },

    add: (pid, name, token, spec) => {
      Test.names()[pid] = name;
      Actions.request({ playerid: pid, selected: [] }, spec, { token, name });
    },

    command: (msg, sval) => {
      const parts = sval.split(/\s+/).filter(Boolean);
      const sub = (parts[0] || '').toLowerCase();
      const pid = parts[1];
      const fake = { playerid: pid, selected: [] };
      const known = pid && State.entries()[pid] && Test.is(pid);

      switch (sub) {
        case 'add': {
          const toks = (msg.selected || []).map(o => getObj('graphic', o._id)).filter(t => t && t.get('subtype') === 'token');
          if (!toks.length) return Output.toGM(Output.msg('Select one or more tokens first.'));
          toks.forEach(t => Test.add(`test_${t.id}`, TokenUtils.tokenName(t) || 'Test', t, Test.spec(parts[1])));
          break;
        }
        case 'addplain': {
          const S = State.get().test;
          S.count += 1;
          Test.add(`test_n${S.count}`, `Test ${S.count}`, null, Test.spec(parts[1]));
          break;
        }
        case 'bump':
          if (known) Actions.bump(fake, (parts[2] || '').toLowerCase() !== 'off');
          break;
        case 'cat': {
          if (!known) break;
          const sp = Test.spec(parts[2]);
          const ci = State.config().categories.findIndex(c => c.label === sp.label);
          if (State.config().categories[ci] && State.config().categories[ci].target) {
            return Output.toGM(Render.targetMenu(pid, ci, `!queue --test target ${pid} ${ci}`));
          }
          Actions.request(fake, sp, { token: getObj('graphic', State.entries()[pid].tokenId), name: Test.names()[pid] });
          break;
        }
        case 'withdraw':
          if (known) Actions.remove(fake, pid);
          break;
        case 'targetmenu': {
          if (!known) break;
          const ci = parseInt(parts[2], 10);
          const menu = Render.targetMenu(pid, ci, `!queue --test target ${pid} ${ci}`);
          // Other test requests' tokens are offered too
          const others = Test.entries().filter(x => x.pid !== pid && x.tokenId)
            .map(x => [`${Util.esc(x.name)} (test)`, `!queue --test target ${pid} ${ci} tok ${x.tokenId}`, CSS.btn, '']);
          return Output.toGM(others.length ? menu + Output.panel('Test tokens', Output.grid(others)) : menu);
        }
        case 'target': {
          if (!known) break;
          const e = State.entries()[pid];
          const c = State.config().categories[parseInt(parts[2], 10)];
          const target = c && Actions.resolveTarget(fake, parts[3], parts.slice(4).join(' '));
          if (!target) return Output.toGM(Output.msg('That category, character or token could not be found.'));
          if (parts[3] === 'tok') {
            const other = Test.entries().find(x => x.tokenId === parts[4] && x.pid !== pid);
            if (other) target.playerIds.push(other.pid);
          }
          Actions.request(fake, { label: c.label, urgent: c.urgent, target }, { token: getObj('graphic', e.tokenId), name: e.name });
          break;
        }
        case 'clear': {
          const E = State.entries();
          Object.keys(E).filter(Test.is).forEach(k => { State.addLog(E[k], 'cleared'); delete E[k]; });
          Notify.change({ type: 'remove', text: 'Test requests cleared.' });
          break;
        }
        default:
          break;
      }
      return Output.toGM(Test.panel());
    }
  };

  // Session notes. The handout is the record; each note is one line:
  //   [YYYY-MM-DD HH:MM ZONE] Display Name: text
  // The name is wrapped in a span whose title holds the player ID. Times are in the GM's chosen
  // zone; a line "Times below are <label> (<zone>)." marks each change of zone, and the handout
  // tag "tz:<zone>" records the zone of the latest lines. Lines with no marker above them are UTC.
  const Notes = {
    ZONES: [
      ['US Eastern', 'America/New_York'], ['US Central', 'America/Chicago'], ['US Mountain', 'America/Denver'],
      ['Arizona', 'America/Phoenix'], ['US Pacific', 'America/Los_Angeles'], ['Alaska', 'America/Anchorage'],
      ['Hawaii', 'Pacific/Honolulu'], ['UK and Ireland', 'Europe/London'], ['Central Europe', 'Europe/Berlin'],
      ['Eastern Europe', 'Europe/Athens'], ['India', 'Asia/Kolkata'], ['Japan', 'Asia/Tokyo'],
      ['Australia Eastern', 'Australia/Sydney'], ['Australia Western', 'Australia/Perth'],
      ['New Zealand', 'Pacific/Auckland'], ['UTC', 'UTC']
    ],
    LINE: /^\[(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}) ([^\]]+)\]\s*(.*?):\s([\s\S]*)$/,
    MARKER: /^Times below are .*?\(([^)]+)\)\.?$|^Times below are UTC\.?$/,

    zoneLabel: (zone) => (Notes.ZONES.find(z => z[1] === zone) || [zone])[0],

    zoneQuery: () => `?{Time zone|${Notes.ZONES.map(z => `${z[0]},${z[1]}`).join('|')}|Other...,other}`,

    validZone: (zone) => {
      if (!zone) return false;
      try { new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date()); return true; } catch (e) { return false; }
    },

    // Wall-clock parts of a moment in a zone
    parts: (ms, zone) => {
      const f = new Intl.DateTimeFormat('en-US', {
        timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short'
      });
      const o = {};
      f.formatToParts(new Date(ms)).forEach(p => { o[p.type] = p.value; });
      return o;
    },

    stamp: (ms, zone) => {
      if (zone === 'UTC') {
        const d = new Date(ms);
        const p = (n) => String(n).padStart(2, '0');
        return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
      }
      const o = Notes.parts(ms, zone);
      return `${o.year}-${o.month}-${o.day} ${o.hour}:${o.minute} ${o.timeZoneName}`;
    },

    // Wall-clock time in a zone back to an exact moment
    toUtc: (y, mo, d, h, mi, zone) => {
      const guess = Date.UTC(y, mo - 1, d, h, mi);
      if (zone === 'UTC') return guess;
      const offsetAt = (ms) => {
        const o = Notes.parts(ms, zone);
        return Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour, +o.minute) - Math.floor(ms / 60000) * 60000;
      };
      let ms = guess - offsetAt(guess);
      ms = guess - offsetAt(ms);
      return ms;
    },

    markerHtml: (zone) => (zone === 'UTC'
      ? '<p><i>Times below are UTC.</i></p>'
      : `<p><i>Times below are ${Util.esc(Notes.zoneLabel(zone))} (${Util.esc(zone)}).</i></p>`),

    // Handout tags, read and written in whichever form Roll20 returns them
    readTags: (h) => {
      const raw = h.get('tags');
      try {
        if (Array.isArray(raw)) return { list: raw.slice(), asArray: true };
        if (typeof raw === 'string' && raw) return { list: JSON.parse(raw), asArray: false };
      } catch (e) { /* unreadable tags: start fresh */ }
      return { list: [], asArray: false };
    },

    writeZoneTag: (h, zone) => {
      const t = Notes.readTags(h);
      const list = t.list.filter(x => !/^tz:/i.test(String(x))).concat([`tz:${zone}`]);
      h.set('tags', t.asArray ? list : JSON.stringify(list));
    },

    tagZone: (h) => {
      const tag = Notes.readTags(h).list.find(x => /^tz:/i.test(String(x)));
      return tag ? String(tag).slice(3) : 'UTC';
    },

    handout: () => {
      const name = State.config().notesHandout;
      return findObjs({ _type: 'handout', name })[0] ||
        createObj('handout', { name, inplayerjournals: '', controlledby: '', archived: false });
    },

    // Writes are chained so two notes in quick succession don't overwrite each other
    chain: Promise.resolve(),

    append: (lineFor) => {
      Notes.chain = Notes.chain.then(() => new Promise((resolve) => {
        const h = Notes.handout();
        h.get('notes', (cur) => {
          const existing = (cur && cur !== 'null') ? cur : '';
          const zone = Notes.validZone(State.config().notesTz) ? State.config().notesTz : 'UTC';
          // Lines with no marker above them read as UTC, so mark any other zone, and any change of zone
          const lastZone = Notes.tagZone(h);
          const marker = zone !== lastZone ? Notes.markerHtml(zone) : '';
          h.set('notes', existing + marker + lineFor(zone));
          if (marker) Notes.writeZoneTag(h, zone);
          resolve();
        });
      })).catch(err => Logger.error(`Session notes: ${err.message}`));
      return Notes.chain;
    },

    add: (msg, raw) => {
      const pid = msg.playerid;
      const text = String(raw || '').trim().slice(0, 1000);
      if (!text) return Output.toPlayer(pid, Output.msg(`Type the note after the command, for example: <b>!q note The innkeeper lied about the key</b>`));
      const name = Test.is(pid) ? (Test.names()[pid] || 'Test') : Util.playerName(pid);
      const now = Date.now();
      Notes.append((zone) => `<p>[${Notes.stamp(now, zone)}] <span title="${Util.esc(pid)}">${Util.esc(name)}</span>: ${Util.esc(text)}</p>`);
      // GM notes are silent; a player's note goes to the GM, and the player gets a short confirmation
      if (playerIsGM(pid)) return;
      Output.toGM(Output.msg(`<b>Note from ${Util.esc(name)}:</b> ${Util.esc(text)}`, 'notice'));
      Output.toPlayer(pid, Output.msg('Note added.', 'confirm'));
    },

    // Read-only access for other scripts: Queue.getNotes(callback) or Queue.getNotes().then(...)
    // Entries: { ts (ms), iso (UTC), playerid, name, text }, oldest first
    get: (callback) => {
      const p = new Promise((resolve) => {
        const h = findObjs({ _type: 'handout', name: State.config().notesHandout })[0];
        if (!h) return resolve([]);
        h.get('notes', (cur) => resolve(Notes.parse(cur)));
      });
      if (typeof callback === 'function') p.then(callback);
      return p;
    },

    parse: (html) => {
      if (!html || html === 'null') return [];
      const decode = (t) => t.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#123;/g, '{').replace(/&#125;/g, '}').replace(/&#91;/g, '[')
        .replace(/&#93;/g, ']').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
      let zone = 'UTC';
      const out = [];
      String(html).split(/<\/p>|<br\s*\/?>/i).forEach(chunk => {
        const plain = decode(chunk.replace(/<[^>]*>/g, '')).trim();
        const mk = plain.match(Notes.MARKER);
        if (mk) { zone = mk[1] && Notes.validZone(mk[1]) ? mk[1] : 'UTC'; return; }
        const m = plain.match(Notes.LINE);
        if (!m) return;
        const lineZone = m[6].trim() === 'UTC' ? 'UTC' : zone;
        const ts = Notes.toUtc(+m[1], +m[2], +m[3], +m[4], +m[5], lineZone);
        const pidMatch = chunk.match(/title="([^"]*)"/);
        out.push({ ts, iso: new Date(ts).toISOString(), playerid: pidMatch ? decode(pidMatch[1]) : '', name: m[7].trim(), text: m[8].trim() });
      });
      return out;
    },

    rename: (newName) => {
      const name = String(newName || '').trim().slice(0, 80);
      if (!name) return false;
      const old = findObjs({ _type: 'handout', name: State.config().notesHandout })[0];
      if (old && !findObjs({ _type: 'handout', name })[0]) old.set('name', name);
      State.config().notesHandout = name;
      return true;
    }
  };

  // Commands (single root)
  const Commands = {
    gmOnly: ['visibility', 'gmchat', 'playerchat', 'urgentjumps', 'sound', 'soundtest',
      'categories', 'catadd', 'catrename', 'catdel', 'catup', 'catdown', 'caturgent', 'cattarget', 'catreset', 'clear', 'log', 'clearlog', 'pingall', 'pingpair', 'pingtarget', 'pingtargetpair', 'pingspot', 'spotclear', 'seen', 'notesname', 'notestz', 'iface', 'refresh', 'announce', 'test', 'tracker', 'trackercombat', 'trackeropen'],

    root: (msg, parsed) => {
      const pid = msg.playerid;
      const isGM = playerIsGM(pid);
      const key = parsed.order[0];
      const val = key ? parsed.args[key] : undefined;
      const sval = val === true || val === undefined ? '' : String(val).trim();

      if (key && Commands.gmOnly.includes(key) && !isGM) {
        Output.toPlayer(pid, Output.box(`<div style="${CSS.body}">That control is for the GM.</div>`));
        return;
      }

      switch (key) {
        case undefined:
          return isGM ? Show.gm('', true) : Output.toPlayer(pid, Render.menu(pid));

        case 'help': {
          const h = Handouts.find(HELP_NAME);
          return Output.toPlayer(pid, Output.box(`<div style="${CSS.body}">` +
            (h ? Output.journalLink('Open Help Handout', 'handout', h.id, CSS.btn) : 'Help handout not found.') + `</div>`));
        }

        case 'settings':
          return isGM ? Output.toGM(Render.gmSettings()) : Output.toPlayer(pid, Render.playerSettings(pid));

        case 'view':
          if (!isGM && State.config().visibility !== 'all') {
            return Output.toPlayer(pid, Output.box(`<div style="${CSS.body}">The GM keeps the queue private.</div>`));
          }
          if (isGM) return Show.gm('', true);
          return Output.toPlayer(pid, Render.queue('chat', '', 'player', pid));

        case 'raise': {
          if (isGM) return Output.toGM(Output.box(`<div style="${CSS.body}">GMs cannot add requests to the queue.</div>`));
          const c = State.config().categories[parseInt(sval, 10)];
          if (!c) return Output.toPlayer(pid, Render.menu(pid));
          if (c.target) return Output.toPlayer(pid, Render.targetMenu(pid, parseInt(sval, 10)));
          return Actions.request(msg, { label: c.label, urgent: c.urgent });
        }

        // --target <category index> pc <characterId> | tok <tokenId>
        case 'target': {
          if (isGM) return Output.toGM(Output.msg('GMs cannot add requests to the queue.'));
          const [ci, kind, ...rest] = sval.split(/\s+/);
          const id = rest.join(' ');
          const c = State.config().categories[parseInt(ci, 10)];
          if (!c) return Output.toPlayer(pid, Render.menu(pid));
          const target = Actions.resolveTarget(msg, kind, id);
          if (!target) return Output.toPlayer(pid, Output.msg('That character or token could not be found.'));
          return Actions.request(msg, { label: c.label, urgent: c.urgent, target });
        }

        case 'other': {
          if (isGM) return Output.toGM(Output.box(`<div style="${CSS.body}">GMs cannot add requests to the queue.</div>`));
          if (!sval) return Output.toPlayer(pid, Output.box(`<div style="${CSS.body}">No request text was entered.</div>`));
          return Actions.request(msg, { label: `Other: ${sval.slice(0, 200)}`, urgent: false });
        }

        case 'withdraw':
          if (!State.entries()[pid]) return Output.toPlayer(pid, Output.box(`<div style="${CSS.body}">You have no request in the queue.</div>`));
          return Actions.remove(msg, pid);

        case 'remove':
          return Actions.remove(msg, sval);

        case 'announce':
          return Actions.announce(msg, sval);

        case 'test':
          return Test.command(msg, sval);

        case 'note':
          return Notes.add(msg, sval);

        case 'notesname':
          if (!Notes.rename(sval)) return Output.toGM(Render.gmSettings('No handout name was entered.'));
          return Output.toGM(Render.gmSettings());

        case 'notestz': {
          if (sval.toLowerCase() === 'other') {
            return Output.toGM(Output.panel('Session notes time zone', `Type a time zone name, such as <b>America/Los_Angeles</b> or <b>Europe/Paris</b>.<br>` +
              Output.btn('Enter a name', '!queue --notestz ?{Time zone name|America/Los_Angeles}', CSS.btn, 'Type a time zone name such as America/Los_Angeles') +
              Output.btn('Back to settings', '!queue --settings', CSS.btn, 'Return to the settings panel')));
          }
          if (!Notes.validZone(sval)) return Output.toGM(Render.gmSettings(`"${Util.esc(sval)}" is not a time zone name the sandbox recognizes.`));
          State.config().notesTz = sval;
          return Output.toGM(Render.gmSettings());
        }

        // Interface switch. From the handout itself no link is whispered (it is already open).
        case 'iface': {
          const v = sval.toLowerCase();
          if (!['chat', 'handout'].includes(v)) return Output.toGM(Render.gmSettings(`Unknown interface: ${Util.esc(sval)}`));
          const cfg = State.config();
          const fromHandout = parsed.args.from === 'handout';
          const fromSettings = parsed.args.from === 'settings';
          cfg.iface = v;
          cfg.ifaceChosen = true;
          Handouts.updateQueue();
          if (fromSettings) return Output.toGM(Render.gmSettings());
          if (v === 'chat') return Output.toGM(Render.queue('chat', '', 'gm'));
          if (!fromHandout) Output.toGM(Output.msg(`The queue now runs from the Queue handout. ${Show.openLink()}`, 'notice'));
          return;
        }

        // Redraws the handout (Refresh button inside it)
        case 'refresh':
          Handouts.updateQueue();
          return;

        case 'whoami':
          return TokenUtils.whoami(msg);

        case 'as': {
          const spec = Pending[pid];
          if (sval.toLowerCase() === 'cancel') {
            delete Pending[pid];
            return Output.toPlayer(pid, Output.msg('Request cancelled.'));
          }
          if (!spec) return Output.toPlayer(pid, Output.msg('That choice has expired. Raise your hand again.'));
          const tok = TokenUtils.candidates(pid).find(t => t.id === sval);
          if (!tok) return Output.toPlayer(pid, Output.msg('That token is no longer available. Raise your hand again.'));
          return Actions.request(msg, spec, { token: tok, name: TokenUtils.tokenName(tok) || Util.playerName(pid) });
        }

        case 'bump':
          if (isGM) return Output.toGM(Output.msg('Only the player who made a request can mark it urgent.'));
          return Actions.bump(msg, sval.toLowerCase() !== 'off');

        case 'pingall':
          return Actions.ping(msg, sval, false);

        case 'pingpair':
          return Actions.ping(msg, sval, true);

        case 'pingtarget':
          return Actions.ping(msg, sval, false, true);

        // Marks a request as seen (whispers the player) or un-marks it (silent)
        case 'seen': {
          const e = State.entries()[sval];
          if (!e) return Show.gm('That request is no longer in the queue.');
          e.seen = !e.seen;
          if (e.seen) Output.toPlayer(e.pid, Output.msg(`The GM has seen your request. ${Util.esc(Util.what(e))}`, 'confirm'));
          return Show.gm();
        }

        // Clears the spotlight line quietly; the request was already logged as announced
        case 'spotclear':
          State.get().spotlight = null;
          return Show.gm();

        case 'pingspot': {
          const sp = State.get().spotlight;
          const tok = sp && sp.tokenId ? getObj('graphic', sp.tokenId) : null;
          if (!tok) return Output.toGM(Output.msg('No token is available for the spotlight.'));
          return sendPing(tok.get('left'), tok.get('top'), tok.get('pageid'), pid, true, Util.onlinePlayers().map(p => p.id));
        }

        case 'pingtargetpair':
          return Actions.ping(msg, sval, true, true);

        // GM settings
        case 'visibility':
        case 'gmchat':
        case 'playerchat': {
          const allowed = key === 'visibility' ? ['gm', 'all'] : ['off', 'notice', 'full'];
          const v = sval.toLowerCase();
          if (!allowed.includes(v)) return Output.toGM(Render.gmSettings(`Unknown value: ${Util.esc(sval)}`));
          const cfgKey = { visibility: 'visibility', gmchat: 'gmChat', playerchat: 'playerChat' }[key];
          State.config()[cfgKey] = v;
          Handouts.updateQueue();
          return Output.toGM(Render.gmSettings());
        }

        case 'urgentjumps':
        case 'tracker':
        case 'trackercombat':
        case 'trackeropen': {
          const v = sval.toLowerCase();
          if (!['on', 'off'].includes(v)) return Output.toGM(Render.gmSettings(`Unknown value: ${Util.esc(sval)}`));
          const cfgKey = { urgentjumps: 'urgentJumps', tracker: 'trackerSync', trackercombat: 'trackerCombat', trackeropen: 'trackerOpen' }[key];
          State.config()[cfgKey] = v === 'on';
          Tracker.sync();
          Handouts.updateQueue();
          if (parsed.args.from === 'queue') return Show.gm();
          return Output.toGM(Render.gmSettings());
        }

        case 'sound': {
          if (!sval || sval.toLowerCase() === 'off') {
            State.config().soundTrack = '';
            return Output.toGM(Render.gmSettings());
          }
          const t = Sound.findTrack(sval);
          if (!t) return Output.toGM(Render.gmSettings(`No Jukebox track named "${Util.esc(sval)}".`));
          State.config().soundTrack = t.get('title');
          return Output.toGM(Render.gmSettings());
        }

        case 'soundtest':
          Sound.play();
          return;

        case 'categories':
          return Output.toGM(Render.catEditor());

        case 'catadd': {
          const label = sval.slice(0, 40);
          if (!label) return Output.toGM(Render.catEditor('No name was entered.'));
          State.config().categories.push({ label, urgent: false, target: false });
          return Output.toGM(Render.catEditor());
        }

        case 'catrename': {
          const cats = State.config().categories;
          const m = sval.match(/^(\d+)\s+(.+)$/);
          if (!m || !cats[parseInt(m[1], 10)]) return Output.toGM(Render.catEditor('No name was entered.'));
          cats[parseInt(m[1], 10)].label = m[2].trim().slice(0, 40);
          return Output.toGM(Render.catEditor());
        }

        case 'catdel':
        case 'catup':
        case 'catdown':
        case 'caturgent':
        case 'cattarget': {
          const cats = State.config().categories;
          const i = parseInt(sval, 10);
          if (isNaN(i) || !cats[i]) return Output.toGM(Render.catEditor());
          if (key === 'catdel') cats.splice(i, 1);
          if (key === 'catup' && i > 0) [cats[i - 1], cats[i]] = [cats[i], cats[i - 1]];
          if (key === 'catdown' && i < cats.length - 1) [cats[i + 1], cats[i]] = [cats[i], cats[i + 1]];
          if (key === 'caturgent') cats[i].urgent = !cats[i].urgent;
          if (key === 'cattarget') cats[i].target = !cats[i].target;
          return Output.toGM(Render.catEditor());
        }

        case 'catreset':
          State.config().categories = defaultConfig().categories;
          return Output.toGM(Render.catEditor());

        case 'clear':
          if (sval.toLowerCase() === 'confirm') return Actions.clearAll();
          return Output.toGM(Output.panel('Clear the queue?', (QueueData.count()
            ? `Remove all ${QueueData.count()} request(s)? A QUEUE CLEARED card is posted to everyone.<br>`
            : `The queue is empty. Post the QUEUE CLEARED card to everyone?<br>`) +
            Output.btn('Yes, clear all', '!queue --clear confirm', CSS.btnDanger, 'Remove every request and post the Queue Cleared card to everyone') + Output.btn('Cancel', '!queue --settings', CSS.btn, 'Keep the queue as it is')));

        case 'log':
          return Output.toGM(Render.log());

        case 'clearlog':
          State.get().log = [];
          return Output.toGM(Render.log());

        // Player settings
        case 'mychat': {
          const v = sval.toLowerCase();
          if (!['on', 'off'].includes(v)) return Output.toPlayer(pid, Render.playerSettings(pid));
          State.prefs(pid).chat = v === 'on';
          return Output.toPlayer(pid, Render.playerSettings(pid));
        }

        default:
          return Output.toPlayer(pid, Output.box(`<div style="${CSS.body}">Unknown option: --${Util.esc(key)}. Type <b>!q --help</b> for help.</div>`));
      }
    }
  };

  // Input Handler
  const handleInput = (msg) => {
    if (msg.type !== 'api') return;
    const parsed = Parser.parse(msg.content);
    if (!COMMANDS.includes(parsed.command)) return;
    try {
      // "!q note <text>" keeps the text exactly as typed (no -- parsing)
      const noteForm = msg.content.match(/^!(?:q|queue)\s+note(?:\s+([\s\S]*))?$/i);
      if (noteForm) return Notes.add(msg, noteForm[1] || '');
      Commands.root(msg, parsed);
    } catch (err) {
      Logger.error(`${err.message} | ${err.stack}`);
      if (playerIsGM(msg.playerid)) Output.toGM(Output.box(`<div style="${CSS.body}">Queue error: ${Util.esc(err.message)}</div>`));
    }
  };

  // Install helpers
  const ensureMacro = () => {
    const existing = findObjs({ _type: 'macro', name: MACRO_NAME })[0];
    if (existing) {
      if (existing.get('visibleto') !== 'all') existing.set('visibleto', 'all');
      return;
    }
    const gm = findObjs({ _type: 'player' }).find(p => playerIsGM(p.id));
    if (!gm) { Logger.log('No GM found; macro will be created on the next GM command.'); return; }
    createObj('macro', { _playerid: gm.id, name: MACRO_NAME, action: '!queue', visibleto: 'all', istokenaction: false });
    Logger.log(`Created ${MACRO_NAME} macro`);
  };

  // Event Registration
  const registerEventHandlers = () => {
    on('chat:message', (msg) => {
      if (msg.type === 'api' && playerIsGM(msg.playerid) && !findObjs({ _type: 'macro', name: MACRO_NAME })[0]) ensureMacro();
      handleInput(msg);
    });
    on('change:campaign:turnorder', (obj, prev) => {
      try { Tracker.handleChange(obj, prev); } catch (err) { Logger.error(`Turn tracker: ${err.message} | ${err.stack}`); }
    });
  };

  // Initialization
  const checkInstall = () => {
    Logger.log(`v${version} [${new Date(lastUpdate * 1000)}]`);
    State.initialize();
    ensureMacro();
    Handouts.ensureHelp();
    Handouts.updateQueue();
    Tracker.sync();
    if (!State.config().ifaceChosen) setTimeout(() => Output.toGM(Show.choicePanel()), 1000);
    return true;
  };

  on('ready', () => {
    if (checkInstall()) registerEventHandlers();
  });

  // Public Interface
  const dumpState = () => log(`${scriptName} state: ${JSON.stringify(state[scriptName])}`);

  return { dumpState, getNotes: Notes.get, notesHandoutName: () => State.config().notesHandout };

})();
