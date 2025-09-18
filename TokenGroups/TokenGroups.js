/* -----------------------------------------------------------------------------
 * TokenGroups — Enhanced ScriptCards support for TokenGroups
 * Version: v0.7.0  (Enhanced SC: better formatting, inline styles, improved menus)
 * Updated: 2025-01-27
 *
 * Summary:
 *   Enhanced version of TokenGroups with superior ScriptCards integration:
 *   - Better inline formatting with ScriptCards syntax
 *   - Improved button styling and layout
 *   - Enhanced menu presentation
 *   - ScriptCards-first design approach
 *
 * Commands (GM-only):
 *   !tgroup help
 *   !tgroup enable | disable | status
 *   !tgroup config render <html|sc>
 *   !tgroup create <name>           (from selected tokens)
 *   !tgroup add <name>              (add selected)
 *   !tgroup remove <name[@page]>    (remove selected)
 *   !tgroup move <name[@page]> <objects|gmlayer|map>
 *   !tgroup show <name[@page]>
 *   !tgroup list | list all | list page <pageName|pageID>
 *   !tgroup rename <old[@page]> <new>
 *   !tgroup delete <name[@page]> | clear <name[@page]>
 *   !tgroup where <name[@page]> | purge [name|all]
 *   !tgroup stats [group <name[@page]> | page <name|id>]
 *   !tgroup menu [<name[@page]>]   (menus in configured render mode)
 *   !tgroup doc                    (creates/updates a handout)
 *
 * ScriptCards Features:
 *   - Enhanced inline formatting with [b], [i], [c], [color], etc.
 *   - Improved button styling with custom colors and sizes
 *   - Better layout and spacing for ScriptCards
 *   - ScriptCards-first menu design
 * --------------------------------------------------------------------------- */

on('ready', () => {
  const MOD = 'TokenGroups';
  const VER = 'v0.7.0';
  const CMD = '!tgroup';
  const LAYERS = new Set(['objects', 'gmlayer', 'map']);

  // ---------- helpers ----------
  const esc = (s) => String(s).replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
  const unq = (s) => (s ? String(s).replace(/^"(.*)"$/,'$1') : s);
  const tokenize = (str) => (String(str||'').trim().match(/(?:[^\s"]+|"[^"]*")+/g) || []);
  const cmdOut = (_msg, html) => sendChat(MOD, `/w gm <div>${html}</div>`, null, { noarchive:true });

  const pageName = (pid) => (getObj('page', pid)?.get('name')) || '(deleted page)';
  const findPageByNameOrId = (arg) => {
    if (!arg) return null;
    const raw = unq(arg);
    const byId = getObj('page', raw); if (byId) return byId;
    const byName = findObjs({ _type: 'page', name: raw }); return byName[0] || null;
  };
  const isGM = (playerid) => {
    const p = getObj('player', playerid);
    return p ? playerIsGM(p.get('_id')) : false;
  };
  const getSelectedGraphics = (msg) =>
    (msg.selected || []).filter(s => s._type === 'graphic').map(s => getObj('graphic', s._id)).filter(Boolean);
  const pageOfSelection = (graphics) => graphics.length ? graphics[0].get('_pageid') : null;

  // ---------- state ----------
  const assertState = () => {
    state[MOD] = state[MOD] || {};
    const st = state[MOD];
    if (!st.pages) st.pages = {};
    if (typeof st.enabled === 'undefined') st.enabled = false;
    if (typeof st.startupWhisper === 'undefined') st.startupWhisper = true;
    if (typeof st.render === 'undefined') st.render = 'html'; // Default to HTML for compatibility (ScriptCards available via config)
    if (!st.actions) st.actions = { seq:0, map:{} };
    if (!st.scdebug) st.scdebug = { last:'' };
    return st;
  };
  const st = assertState();

  // ---------- send as GM (for ScriptCards) ----------
  const sendAsGM = (msg, text) => {
    if (msg && msg.playerid && isGM(msg.playerid)) {
      return sendChat(`player|${msg.playerid}`, text, null, { noarchive:true });
    }
    const gms = findObjs({ _type:'player' }).filter(p => playerIsGM(p.id || p.get('_id')));
    if (gms.length) return sendChat(`player|${(gms[0].id || gms[0].get('_id'))}`, text, null, { noarchive:true });
    return sendChat(MOD, text, null, { noarchive:true });
  };

  // ---------- action keys ----------
  const now = () => Date.now();
  const ensureActions = () => assertState().actions;
  const pruneActions = () => {
    const A = ensureActions();
    const cutoff = now() - (30*60*1000);
    const keys = Object.keys(A.map);
    if (keys.length > 500) {
      keys.sort((k1,k2)=>A.map[k1].ts - A.map[k2].ts);
      keys.slice(0, keys.length-500).forEach(k => delete A.map[k]);
    }
    Object.entries(A.map).forEach(([k,v]) => { if (v.ts < cutoff) delete A.map[k]; });
  };
  const mkAction = (payload) => {
    const A = ensureActions();
    const key = (++A.seq).toString(36) + '-' + Math.random().toString(36).slice(2,7);
    A.map[key] = { payload, ts: now() };
    pruneActions();
    return key;
  };
  const getAction = (key) => ensureActions().map[key];

  // ---------- data ----------
  const getPageStore = (pid) => {
    const S = assertState();
    S.pages[pid] = S.pages[pid] || { groups:{} };
    return S.pages[pid];
  };
  const groupsByName = (name) => {
    const S = assertState(); const out=[];
    Object.entries(S.pages||{}).forEach(([pid,ps]) => {
      const g = (ps.groups||{})[name]; if (g) out.push({ pageid:pid, group:g });
    });
    return out;
  };
  const parseGroupRef = (raw) => {
    if (!raw) return { name:null, pageRef:null };
    const s = unq(String(raw)); const m = s.match(/^(.*)@(.+)$/);
    if (m) return { name:unq(m[1].trim()), pageRef:unq(m[2].trim()) };
    return { name:s.trim(), pageRef:null };
  };
  const resolveGroup = (nameRaw, pageRaw) => {
    const name = unq(nameRaw); const pageRef = pageRaw ? unq(pageRaw) : null;
    if (!name) return { error:'No group name.' };
    const matches = groupsByName(name);
    if (!matches.length) return { notfound:true };
    if (pageRef) {
      const target = findPageByNameOrId(pageRef);
      if (!target) return { error:`Page not found: ${esc(pageRef)}` };
      const hit = matches.find(m => m.pageid === target.id);
      if (!hit) return { error:`No group <b>${esc(name)}</b> on page ${esc(pageName(target.id))}.` };
      return hit;
    }
    if (matches.length > 1) {
      const choices = matches.map(m => `• ${esc(pageName(m.pageid))} [${esc(m.pageid)}] (${m.group.ids?.length||0})`).join('<br/>');
      return { conflict:`<b>Multiple groups named "${esc(name)}" exist on different pages.</b><br/>${choices}<br/><br/>Tip: use <code>${CMD} … "${esc(name)}"@Page</code>.` };
    }
    return matches[0];
  };
  const getGroupOnPage = (pid, name) => {
    const ps = assertState().pages[pid]; if (!ps) return null;
    const g = ps.groups?.[name]; return g ? { pageid:pid, group:g } : null;
  };
  const pruneGroup = (g) => {
    let removed=0;
    g.ids = (g.ids||[]).filter(id => { const o = getObj('graphic', id); if (!o){removed++; return false;} return true; });
    return removed;
  };

  // ---------- stats ----------
  const byteFmt = (n) => (n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(1)} KB`:`${(n/1048576).toFixed(2)} MB`);
  const collectStats = () => {
    const S = assertState(); const perPage=[]; let totalGroups=0,totalIds=0;
    Object.entries(S.pages||{}).forEach(([pid,ps])=>{
      const groups = Object.values(ps.groups||{});
      const gc = groups.length; const ic = groups.reduce((a,g)=>a+(g.ids?.length||0),0);
      totalGroups+=gc; totalIds+=ic;
      perPage.push({pid,name:pageName(pid),groupCount:gc,idCount:ic});
    });
    perPage.sort((a,b)=>b.groupCount-a.groupCount||a.name.localeCompare(b.name));
    let stateBytes=0; try{ stateBytes = JSON.stringify(S).length; } catch {}
    const largest=[];
    Object.entries(S.pages||{}).forEach(([pid,ps]) => Object.values(ps.groups||{}).forEach(g => largest.push({name:g.name,size:g.ids?.length||0,pid,pname:pageName(pid)})));
    largest.sort((a,b)=>b.size-a.size||a.name.localeCompare(b.name));
    return { perPage, totalGroups, totalIds, stateBytes, largest:largest.slice(0,10) };
  };
  const statsPage = (pid) => {
    const ps = getPageStore(pid); const groups = Object.values(ps.groups||{});
    const idCount = groups.reduce((a,g)=>a+(g.ids?.length||0),0);
    const lines = groups.sort((a,b)=>(b.ids?.length||0)-(a.ids?.length||0)||a.name.localeCompare(b.name))
                        .map(g=>`• <b>${esc(g.name)}</b> — ${g.ids?.length||0} token id(s)`).join('<br/>') || '(none)';
    return { name:pageName(pid), groupCount:groups.length, idCount, lines };
  };
  const statsGroup = (name, pageRef) => {
    const hit = resolveGroup(name, pageRef); if (!hit || hit.error || hit.notfound || hit.conflict) return hit||null;
    const g=hit.group; let ok=0,missing=0; (g.ids||[]).forEach(id => (getObj('graphic',id)?ok++:missing++));
    return { name:g.name, page:pageName(hit.pageid), pid:hit.pageid, size:g.ids?.length||0, ok, missing };
  };

  // ---------- HTML UI theme (fallback) ----------
  const THEME = { bg:'#0b1f3a', fg:'#e9f2ff', border:'#16365e', chip:'#173a74', subfg:'rgba(233,242,255,0.8)' };
  const card = (title, body) =>
    `<div style="background:${THEME.bg};color:${THEME.fg};border:1px solid ${THEME.border};border-radius:8px;padding:8px 10px;line-height:1.4;font-family:Inter,system-ui,Segoe UI,Arial,sans-serif">
       <div style="font-weight:700;margin-bottom:6px">${esc(title)}</div>${body}
     </div>`;
  const chip = (txt) => `<span style="background:${THEME.chip};color:${THEME.fg};padding:2px 8px;border-radius:999px;display:inline-block">${esc(txt)}</span>`;
  const meta = (txt) => `<span style="color:${THEME.subfg}">${esc(txt)}</span>`;
  const btnB = (label, cmd) => `[🔷 ${label}](${cmd})`; // plain Roll20 link (HTML mode)

  // ---------- Enhanced ScriptCards theme + builders ----------
  // Enhanced button styles with better color schemes
  const SCBTN = { 
    primary: { text:'white', bg:'blue', size:'13px' },
    secondary: { text:'white', bg:'cyan', size:'13px' },
    danger: { text:'white', bg:'red', size:'13px' },
    warning: { text:'white', bg:'orange', size:'13px' },
    success: { text:'white', bg:'green', size:'13px' }
  };

     // Enhanced ScriptCards builder with better formatting
   const buildSC = (title, publicLines, opts = {}) => {
     const CRLF = '\r\n';
     const segs = [
       `--#title|${title}`,
       `--#bgcolor|${opts.bg || '#0b1f3a'}`,
       `--#txcolor|${opts.tx || '#e9f2ff'}`,
       `--#border|1`,
       `--#titleFontSize|16px`,
       `--#titleFontWeight|bold`
     ];
     if ((opts.whisper ?? 'gm') === 'gm') segs.push(`--#whisper|gm`);
     (publicLines || []).forEach(s => segs.push(`--+|${s}`));
     (opts.gmLines || []).forEach(s => segs.push(`--*|${s}`)); // GM-only card lines
     const result = `!scriptcard {{${CRLF}${segs.join(CRLF)}${CRLF}}}`;
     // Debug logging removed for cleaner console
     return result;
   };

     // Enhanced ScriptCards button with better styling and inline formatting
   const scBtn = (label, style = 'primary', actionKey = '') => {
     const btnStyle = SCBTN[style] || SCBTN.primary;
     const bg = btnStyle.bg;
     // ScriptCards button format: [button:bgcolor:textcolor]label::command[/button]
     const command = actionKey ? `${CMD} do ${actionKey}` : `${CMD} ${label.toLowerCase()} clicked`;
     const btn = `[button:${bg}:white]${label}::${command}[/button]`;
     return btn;
   };

  // Enhanced inline formatting helpers for ScriptCards
  const scBold = (text) => `[b]${text}[/b]`;
  const scItalic = (text) => `[i]${text}[/i]`;
  const scCenter = (text) => `[c]${text}[/c]`;
  const scColor = (text, color) => `[${color}]${text}[/#]`;
  const scDivider = () => `[hr]`;
  const scSpacer = () => ` `;

  // remember last SC payload for echo/log/sendraw
  const rememberSC = (txt) => { state[MOD].scdebug.last = txt; };
  const sendSC = (msg, scText) => { rememberSC(scText); return sendAsGM(msg, scText); };

  // ---------- startup whisper ----------
  if (st.startupWhisper) {
    sendChat(MOD, `/w gm ${MOD} ${VER} is loaded${st.enabled?'':' (currently <b>disabled</b>)'}. Type ${CMD} help.`);
  }
  log(`${MOD} ${VER} loaded.`);

  // ---------- Enhanced ScriptCards Menus ----------
  const menuGroupSC = (hit) => {
    const pid = hit.pageid;
    const pname = pageName(pid);
    const gname = hit.group.name;
    const size = hit.group.ids?.length || 0;

    const kShow = mkAction({ t:'show', pid, name:gname });
    const kWhere = mkAction({ t:'where', pid, name:gname });
    const kStats = mkAction({ t:'stats', pid, name:gname });

    const kObj = mkAction({ t:'move', pid, name:gname, layer:'objects' });
    const kGM = mkAction({ t:'move', pid, name:gname, layer:'gmlayer' });
    const kMap = mkAction({ t:'move', pid, name:gname, layer:'map' });

    const kPurge = mkAction({ t:'purge', pid, name:gname });
    const kClear = mkAction({ t:'clear', pid, name:gname });
    const kDel = mkAction({ t:'delete', pid, name:gname });

    // Enhanced formatting with better spacing and organization
    const header = `${scBold('Group:')} ${gname} on ${scBold(pname)} (${size} token${size===1?'':'s'})`;
    
    const actionRow1 = [
      scBtn('Show', 'success', kShow),
      scBtn('Where', 'secondary', kWhere),
      scBtn('Stats', 'secondary', kStats)
    ].join(' ');

    const actionRow2 = [
      scBtn('→ Objects', 'primary', kObj),
      scBtn('→ GM Layer', 'primary', kGM),
      scBtn('→ Map', 'primary', kMap)
    ].join(' ');

    const actionRow3 = [
      scBtn('Purge Missing', 'danger', kPurge),
      scBtn('Clear', 'warning', kClear),
      scBtn('Delete', 'danger', kDel)
    ].join(' ');

    return buildSC('TokenGroups — Group Menu', [
      header,
      scDivider(),
      actionRow1,
      actionRow2,
      actionRow3
    ], { bg: '#0f172a', tx: '#f8fafc' });
  };

  const menuPageSC = (pid) => {
    const ps = getPageStore(pid);
    const groups = Object.values(ps.groups || {});
    const pname = pageName(pid);
    
    if (!groups.length) {
      return buildSC('TokenGroups — Page Menu', [
        `No groups on ${scBold(pname)}.`,
        scDivider(),
        `Use ${scBold(`${CMD} create <name>`)} to create your first group.`
      ]);
    }

    const lines = groups
      .sort((a,b)=>(b.ids?.length||0)-(a.ids?.length||0)||a.name.localeCompare(b.name))
      .map(g => {
        const kMenu = mkAction({ t:'menu', pid, name:g.name });
        const kShow = mkAction({ t:'show', pid, name:g.name });
        const kObj = mkAction({ t:'move', pid, name:g.name, layer:'objects' });
        const kGM = mkAction({ t:'move', pid, name:g.name, layer:'gmlayer' });
        const kMap = mkAction({ t:'move', pid, name:g.name, layer:'map' });
        
                 const groupInfo = `${scBold(g.name)} (${g.ids?.length||0})`;
        const actions = [
          scBtn('Menu', 'primary', kMenu),
          scBtn('Show', 'success', kShow),
          scBtn('→Obj', 'secondary', kObj),
          scBtn('→GM', 'secondary', kGM),
          scBtn('→Map', 'secondary', kMap)
        ].join(' ');
        
        return `${groupInfo} ${actions}`;
      });

    return buildSC('TokenGroups', [
      `${scBold('Page:')} ${pname}`,
      scDivider(),
      ...lines
    ], { bg: '#0f172a', tx: '#f8fafc' });
  };

  // ---------- HTML Menus (fallback) ----------
  const menuGroupHTML = (hit) => {
    const pid = hit.pageid, pname = pageName(pid), gname = hit.group.name, size = hit.group.ids?.length || 0;
    const kShow=mkAction({t:'show',pid,name:gname}), kWhere=mkAction({t:'where',pid,name:gname}), kStats=mkAction({t:'stats',pid,name:gname});
    const kObj=mkAction({t:'move',pid,name:gname,layer:'objects'}), kGM=mkAction({t:'move',pid,name:gname,layer:'gmlayer'}), kMap=mkAction({t:'move',pid,name:gname,layer:'map'});
    const kPurge=mkAction({t:'purge',pid,name:gname}), kClear=mkAction({t:'clear',pid,name:gname}), kDel=mkAction({t:'delete',pid,name:gname});
    const row1 = `<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">${chip(gname)} <span>on</span> ${chip(pname)} <span>${meta(`(${size} token${size===1?'':'s'})`)}</span></div>`;
    const row2 = `<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0">${btnB('Show',`${CMD} do ${kShow}`)} ${btnB('Where',`${CMD} do ${kWhere}`)} ${btnB('Stats',`${CMD} do ${kStats}`)}</div>`;
    const row3 = `<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0">${btnB('→ Objects',`${CMD} do ${kObj}`)} ${btnB('→ GM Layer',`${CMD} do ${kGM}`)} ${btnB('→ Map',`${CMD} do ${kMap}`)}</div>`;
    const row4 = `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${btnB('Purge Missing',`${CMD} do ${kPurge}`)} ${btnB('Clear',`${CMD} do ${kClear}`)} ${btnB('Delete',`${CMD} do ${kDel}`)}</div>`;
    return card('TokenGroups — Group Menu', row1+row2+row3+row4);
  };

  const menuPageHTML = (pid) => {
    const ps = getPageStore(pid); const groups = Object.values(ps.groups||{}); const pname = pageName(pid);
    if (!groups.length) return card('TokenGroups — Page Menu', `No groups on ${chip(pname)}.`);
    const rows = groups.sort((a,b)=>(b.ids?.length||0)-(a.ids?.length||0)||a.name.localeCompare(b.name)).map(g=>{
      const kMenu=mkAction({t:'menu',pid,name:g.name}), kShow=mkAction({t:'show',pid,name:g.name});
      const kObj=mkAction({t:'move',pid,name:g.name,layer:'objects'}), kGM=mkAction({t:'move',pid,name:g.name,layer:'gmlayer'}), kMap=mkAction({t:'move',pid,name:g.name,layer:'map'});
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-top:1px solid ${THEME.border}">
                <div style="display:flex;gap:8px;align-items:center">${chip(g.name)} <span>${meta(`(${g.ids?.length||0})`)}</span></div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-left:8px">
                  ${btnB('Menu',`${CMD} do ${kMenu}`)} ${btnB('Show',`${CMD} do ${kShow}`)} ${btnB('→Obj',`${CMD} do ${kObj}`)} ${btnB('→GM',`${CMD} do ${kGM}`)} ${btnB('→Map',`${CMD} do ${kMap}`)}
                </div>
              </div>`;
    }).join('');
    return card(`TokenGroups — Groups on ${pname}`, rows);
  };

  // ---------- handler ----------
  on('chat:message', (msg) => {
    if (msg.type!=='api' || !msg.content.startsWith(CMD)) return;

    const parts = tokenize(msg.content);
    const sub   = (parts[1]||'').toLowerCase();
    const arg1  = parts[2] ? unq(parts[2]) : undefined;
    const arg2  = parts[3] ? unq(parts[3]) : undefined;

    if (!isGM(msg.playerid)) return cmdOut(msg, `<b>Error:</b> GM only.`);

    // help
    if (!sub || sub==='help' || sub==='?') {
      return cmdOut(msg, [
        `<b>${CMD}</b> — manage token groups (GM only)`,
        `${CMD} enable|disable|status | config render <html|sc>`,
        `${CMD} create|add|remove|move|show|list|rename|delete|clear`,
        `${CMD} stats [group <name[@page]>|page <name|id>] | where <name[@page]> | purge [name|all]`,
        `${CMD} cleanup | menu [<name[@page]>] | doc`,
        `<u>SC Debug</u> ${CMD} scdebug test|echo|log|sendraw`
      ].join('<br/>'));
    }

    // admin
    if (sub==='enable'){ state[MOD].enabled=true; return cmdOut(msg, `TokenGroups is now <b>ENABLED</b>.`); }
    if (sub==='disable'){ state[MOD].enabled=false; return cmdOut(msg, `TokenGroups is now <b>DISABLED</b>.`); }
    if (sub==='status'){
      return cmdOut(msg, `Enabled: <b>${state[MOD].enabled?'yes':'no'}</b> | Render: <b>${state[MOD].render.toUpperCase()}</b>`);
    }
    if (sub==='config' && (parts[2]||'').toLowerCase()==='render'){
      const v=(parts[3]||'').toLowerCase(); if(!['html','sc'].includes(v)) return cmdOut(msg, `<b>Usage:</b> ${CMD} config render <html|sc>`);
      state[MOD].render = v; return cmdOut(msg, `Render mode set to <b>${v.toUpperCase()}</b>.`);
    }

    // allow while disabled (only these)
    const allowed = new Set(['help','?','status','enable','config','doc','scdebug','cleanup']);
    if (!state[MOD].enabled && !allowed.has(sub)) return cmdOut(msg, `TokenGroups is <b>disabled</b>. GM can <code>${CMD} enable</code>.`);

    // SC DEBUG
    if (sub === 'scdebug') {
      const sub2 = (parts[2]||'').toLowerCase();
      if (sub2 === 'test') {
        const t1 = buildSC('SC Test (Enhanced)', [ 
          'Enhanced ScriptCards formatting test',
          scDivider(),
          `${scBold('Bold text')} and ${scItalic('italic text')}`,
          `${scColor('Colored text', '#fbbf24')} and ${scCenter('centered text')}`,
          scDivider(),
          scBtn('Test Button', 'success', 'Click me!')
        ]);
        state[MOD].scdebug.last = t1;
        return sendAsGM(msg, t1);
      }
      if (sub2 === 'echo') {
        const raw = state[MOD].scdebug.last || '';
        if (!raw) return cmdOut(msg, `No stored ScriptCards payload yet. Run <code>${CMD} menu</code> in SC mode first or <code>${CMD} scdebug test</code>.`);
        return cmdOut(msg, `<b>Last ScriptCards payload</b><br/><pre style="white-space:pre-wrap">${esc(raw)}</pre>`);
      }
      if (sub2 === 'log') {
        const raw = state[MOD].scdebug.last || '';
        if (!raw) return cmdOut(msg, `Nothing to log. Use <code>${CMD} scdebug test</code> first.`);
        log(`${MOD} SC RAW >>>\n${raw.replace(/\r/g,'\\r').replace(/\n/g,'\\n\n')}`);
        return cmdOut(msg, `Wrote last ScriptCards payload to API console.`);
      }
      if (sub2 === 'sendraw') {
        const raw = state[MOD].scdebug.last || '';
        if (!raw) return cmdOut(msg, `Nothing to re-send. Use <code>${CMD} scdebug test</code> first.`);
        return sendAsGM(msg, raw);
      }
      return cmdOut(msg, `<b>Usage:</b> ${CMD} scdebug test|echo|log|sendraw`);
    }

    // doc
    if (sub === 'doc') {
      const name = 'TokenGroups — User Guide';
      let ho = findObjs({ _type:'handout', name })[0];
      if (!ho) ho = createObj('handout', { name, inplayerjournals:'', controlledby:'' });
      const html = [
        `<h3>TokenGroups (${VER})</h3>`,
        `<p>Enhanced version with superior ScriptCards integration. Create and manage named groups of tokens per page, then move or reveal the whole group at once.</p>`,
        `<p><b>Quickstart</b></p><pre>${CMD} create Goblins\n${CMD} move Goblins gmlayer\n${CMD} move Goblins objects\n${CMD} menu</pre>`,
        `<p><b>ScriptCards Features</b></p><ul><li>Enhanced inline formatting</li><li>Improved button styling</li><li>Better menu layouts</li><li>ScriptCards-first design</li></ul>`,
        `<p><b>Help</b></p><pre>${CMD} help</pre>`
      ].join('');
      ho.set('notes', html);
      return cmdOut(msg, `Created/updated handout <b>${name}</b>.`);
    }

    // ---------- menu helpers ----------
    const openGroupMenu = (hit) => {
      if (state[MOD].render==='sc') { const sc = menuGroupSC(hit); return sendSC(msg, sc); }
      return cmdOut(msg, menuGroupHTML(hit));
    };
    const openPageMenu = (pid) => {
      if (state[MOD].render==='sc') { const sc = menuPageSC(pid); return sendSC(msg, sc); }
      return cmdOut(msg, menuPageHTML(pid));
    };

    // ---------- commands ----------
    if (sub === 'menu') {
      if (arg1) {
        const { name, pageRef } = parseGroupRef(arg1);
        const hit = pageRef ? resolveGroup(name, pageRef) : resolveGroup(name, null);
        if (hit?.error) return cmdOut(msg, `<b>Error:</b> ${hit.error}`);
        if (hit?.conflict) return cmdOut(msg, hit.conflict);
        if (!hit || hit.notfound) return cmdOut(msg, `No group named <b>${esc(name)}</b>.`);
        return openGroupMenu(hit);
      } else {
        let pid = pageOfSelection(getSelectedGraphics(msg)); if (!pid) { try { pid = Campaign().get('playerpageid'); } catch {} }
        const S = assertState();
        const has = pid && S.pages[pid] && Object.keys(S.pages[pid].groups||{}).length;
        if (!has) {
          const all = Object.entries(S.pages).flatMap(([p,ps])=>Object.values(ps.groups||{}).map(g=>({pid:p,name:g.name,count:g.ids.length})));
          if (!all.length) return cmdOut(msg, card('TokenGroups — All Groups', `No groups saved yet. Try <code>${CMD} create MyGroup</code>.`));
          if (state[MOD].render==='sc') {
                         const lines = all.map(g=>{const kMenu=mkAction({t:'menu',pid:g.pid,name:g.name}); return `${scBold(g.name)} on ${scBold(pageName(g.pid))} (${g.count}) ${scBtn('Menu', 'primary', kMenu)}`;});
            return sendSC(msg, buildSC('TokenGroups — All Groups', lines));
          }
          const rows = all.map(g=>{
            const kMenu=mkAction({t:'menu',pid:g.pid,name:g.name}); const pn = pageName(g.pid);
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-top:1px solid ${THEME.border}">
                      <div style="display:flex;gap:8px;align-items:center">${chip(g.name)} <span>on</span> ${chip(pn)} <span>${meta(`(${g.count})`)}</span></div>
                      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-left:8px">${btnB('Menu',`${CMD} do ${kMenu}`)}</div>
                    </div>`;
          }).join('');
          return cmdOut(msg, card('TokenGroups — All Groups', rows));
        }
        return openPageMenu(pid);
      }
    }

    if (sub === 'list' && arg1 && arg1.toLowerCase()==='all') {
      const S = assertState();
      const all = Object.entries(S.pages).flatMap(([pid,ps]) => Object.values(ps.groups).map(g=>({pid,name:g.name,count:g.ids.length})));
      if (!all.length) return cmdOut(msg, `No groups saved yet.`);
              if (state[MOD].render==='sc') {
                                           const lines = all.map(g => {
              const kMenu=mkAction({t:'menu',pid:g.pid,name:g.name});
              return `${scBold(g.name)} (${g.count}) — Page: ${scBold(pageName(g.pid))} [${g.pid}] ${scBtn('Menu', 'primary', kMenu)}`;
            });
          return sendSC(msg, buildSC('TokenGroups — All Groups', lines));
        }
      const lines = all.map(g => {
        const kMenu=mkAction({t:'menu',pid:g.pid,name:g.name});
        return `• <b>${esc(g.name)}</b> (${g.count}) — Page: ${esc(pageName(g.pid))} [${esc(g.pid)}] ${btnB('Menu',`${CMD} do ${kMenu}`)}`;
      }).join('<br/>');
      return cmdOut(msg, `<u>All Groups (all pages)</u><br/>${lines}`);
    }

    if (sub === 'list' && arg1 && arg1.toLowerCase()==='page') {
      const target = findPageByNameOrId(arg2); if (!target) return cmdOut(msg, `<b>Error:</b> Page not found: ${esc(arg2||'')}`);
      return openPageMenu(target.id);
    }

    if (sub === 'where') {
      const { name, pageRef } = parseGroupRef(arg1); if (!name) return cmdOut(msg, `<b>Usage:</b> ${CMD} where &lt;name[@page]&gt;`);
      const hit = resolveGroup(name, pageRef); if (hit?.error) return cmdOut(msg, `<b>Error:</b> ${hit.error}`); if (hit?.conflict) return cmdOut(msg, hit.conflict);
      if (!hit || hit.notfound) return cmdOut(msg, `No group named <b>${esc(name)}</b>.`);
      return cmdOut(msg, `<b>${esc(name)}</b> — Page: ${esc(pageName(hit.pageid))} [${esc(hit.pageid)}], Size: ${hit.group.ids.length}`);
    }

    if (sub === 'purge') {
      const targetRaw = arg1; let removedTotal=0, scanned=0;
      const S = assertState(); const purgeOne = (g)=>{ scanned++; removedTotal += pruneGroup(g); };
      if (!targetRaw || targetRaw.toLowerCase()==='all') {
        Object.values(S.pages).forEach(ps=>Object.values(ps.groups).forEach(purgeOne));
        return cmdOut(msg, `Purged missing tokens across all groups. Groups scanned: ${scanned}, IDs removed: ${removedTotal}.`);
      } else {
        const { name, pageRef } = parseGroupRef(targetRaw); const hit = resolveGroup(name, pageRef);
        if (hit?.error) return cmdOut(msg, `<b>Error:</b> ${hit.error}`); if (hit?.conflict) return cmdOut(msg, hit.conflict);
        if (!hit || hit.notfound) return cmdOut(msg, `No group named <b>${esc(name)}</b>.`);
        const removed = pruneGroup(hit.group);
        return cmdOut(msg, `Purged <b>${esc(name)}</b>. IDs removed: ${removed}. Size now ${hit.group.ids.length}.`);
      }
    }

    if (sub === 'cleanup') {
      const S = assertState();
      let orphanedCount = 0;
      let cleanedGroups = [];
      
      // Find orphaned groups (groups that exist in state but can't be accessed by name)
      Object.entries(S.pages).forEach(([pid, ps]) => {
        if (ps.groups) {
          Object.entries(ps.groups).forEach(([key, group]) => {
            // Check if this group can be resolved by its stored name
            const resolved = resolveGroup(group.name, null);
            if (!resolved || resolved.notfound || resolved.error) {
              // This group is orphaned - it exists in state but can't be accessed
              orphanedCount++;
              cleanedGroups.push({
                page: pageName(pid),
                key: key,
                name: group.name,
                size: group.ids?.length || 0
              });
              // Remove the orphaned group
              delete ps.groups[key];
            }
          });
        }
      });
      
      if (orphanedCount === 0) {
        return cmdOut(msg, `No orphaned groups found. All groups are accessible.`);
      } else {
        const details = cleanedGroups.map(g => 
          `• <b>${esc(g.name)}</b> (${g.size} tokens) on ${esc(g.page)} [key: ${esc(g.key)}]`
        ).join('<br/>');
        return cmdOut(msg, `Cleaned up ${orphanedCount} orphaned group${orphanedCount===1?'':'s'}:<br/>${details}`);
      }
    }

    if (sub === 'stats') {
      const mode = (arg1||'').toLowerCase();
      if (mode==='group' || (mode && mode!=='page')) {
        const ref = mode==='group' ? arg2 : arg1; const { name, pageRef } = parseGroupRef(ref);
        if (!name) return cmdOut(msg, `<b>Usage:</b> ${CMD} stats group &lt;name[@page]&gt;`);
        const sg = statsGroup(name, pageRef); if (!sg) return cmdOut(msg, `No group named <b>${esc(name)}</b>.`);
        if (sg.error) return cmdOut(msg, `<b>Error:</b> ${sg.error}`); if (sg.conflict) return cmdOut(msg, sg.conflict);
        const kMenu = mkAction({t:'menu',pid:sg.pid,name:sg.name});
        return cmdOut(msg, [`<u>Stats — Group <b>${esc(sg.name)}</b></u>`,`Page: ${esc(sg.page)} [${esc(sg.pid)}]`,`Size: ${sg.size}`,`Resolvable: ${sg.ok}, Missing: ${sg.missing}`,`<br/>[🔷 Menu](${CMD} do ${kMenu})`].join('<br/>'));
      }
      if (mode==='page') {
        const target=findPageByNameOrId(arg2); if(!target) return cmdOut(msg, `<b>Error:</b> Page not found: ${esc(arg2||'')}`);
        const sp=statsPage(target.id);
        return cmdOut(msg, [`<u>Stats — Page <b>${esc(sp.name)}</b> [${esc(target.id)}]</u>`,`Groups: ${sp.groupCount}, Token IDs stored: ${sp.idCount}`,`<br/><b>Groups (largest first)</b><br/>${sp.lines}`].join('<br/>'));
      }
      const s=collectStats();
      const per = s.perPage.length ? s.perPage.map(p=>`• <b>${esc(p.name)}</b> [${esc(p.pid)}] — ${p.groupCount} group(s), ${p.idCount} id(s)`).join('<br/>') : '(none)';
      const big = s.largest.length ? s.largest.map(g=>`• <b>${esc(g.name)}</b> — ${g.size} id(s) (${esc(g.pname)})`).join('<br/>') : '(none)';
      return cmdOut(msg, [`<u>TokenGroups Stats (overall)</u>`,`Pages tracked: ${s.perPage.length}`,`Groups total: ${s.totalGroups}`,`Token IDs total: ${s.totalIds}`,`Estimated state size: ${byteFmt(s.stateBytes)}`,`<br/><b>Per Page</b><br/>${per}`,`<br/><b>Largest Groups (top 10)</b><br/>${big}`].join('<br/>'));
    }

    // core commands
    if (sub==='create'){
      const name = arg1; if(!name) return cmdOut(msg, `<b>Usage:</b> ${CMD} create &lt;name&gt;`);
      const sel = getSelectedGraphics(msg); const ids = sel.map(g=>g.id); if(!ids.length) return cmdOut(msg, `Select some tokens first.`);
      const pid = pageOfSelection(sel); const ps = getPageStore(pid);
      ps.groups[name] = { name, pageid:pid, ids: Array.from(new Set(ids)) };
      const kMenu = mkAction({t:'menu',pid,name});
      return cmdOut(msg, card('TokenGroups', `Created group ${chip(name)} on ${chip(pageName(pid))} ${meta(`(${ps.groups[name].ids.length} token${ps.groups[name].ids.length===1?'':'s'})`)}<div style="margin-top:6px">[🔷 Open Menu](${CMD} do ${kMenu})</div>`));
    }

    if (sub==='add'){
      const name = arg1; if(!name) return cmdOut(msg, `<b>Usage:</b> ${CMD} add &lt;name&gt;`);
      const sel = getSelectedGraphics(msg); const ids = sel.map(g=>g.id); if(!ids.length) return cmdOut(msg, `Select tokens to add.`);
      const pid = pageOfSelection(sel); const ps = getPageStore(pid);
      ps.groups[name] = ps.groups[name] || { name, pageid:pid, ids:[] };
      const before = ps.groups[name].ids.length; ps.groups[name].ids = Array.from(new Set(ps.groups[name].ids.concat(ids)));
      const kMenu = mkAction({t:'menu',pid,name});
      return cmdOut(msg, card('TokenGroups', `Added ${chip(String(ps.groups[name].ids.length-before))} to ${chip(name)} on ${chip(pageName(pid))} ${meta(`(size ${ps.groups[name].ids.length})`)}<div style="margin-top:6px">[🔷 Open Menu](${CMD} do ${kMenu})</div>`));
    }

    if (sub==='remove'){
      const { name, pageRef } = parseGroupRef(arg1); if(!name) return cmdOut(msg, `<b>Usage:</b> ${CMD} remove &lt;name[@page]&gt;`);
      const hit = resolveGroup(name, pageRef); if (hit?.error) return cmdOut(msg, `<b>Error:</b> ${hit.error}`); if (hit?.conflict) return cmdOut(msg, hit.conflict);
      if (!hit || hit.notfound) return cmdOut(msg, `No group named <b>${esc(name)}</b>.`);
      const sel=getSelectedGraphics(msg); const ids=sel.map(g=>g.id); if(!ids.length) return cmdOut(msg, `Select tokens to remove.`);
      const before=hit.group.ids.length; hit.group.ids=hit.group.ids.filter(id=>!ids.includes(id));
      const kMenu=mkAction({t:'menu',pid:hit.pageid,name:hit.group.name});
      return cmdOut(msg, card('TokenGroups', `Removed ${chip(String(before-hit.group.ids.length))} from ${chip(hit.group.name)} on ${chip(pageName(hit.pageid))} ${meta(`(size ${hit.group.ids.length})`)}<div style="margin-top:6px">[🔷 Open Menu](${CMD} do ${kMenu})</div>`));
    }

    if (sub==='rename'){
      const { name:oldName, pageRef } = parseGroupRef(arg1); const nn = arg2;
      if(!oldName||!nn) return cmdOut(msg, `<b>Usage:</b> ${CMD} rename &lt;old[@page]&gt; &lt;newName&gt;`);
      const hit=resolveGroup(oldName,pageRef); if(hit?.error) return cmdOut(msg, `<b>Error:</b> ${hit.error}`); if(hit?.conflict) return cmdOut(msg, hit.conflict);
      if(!hit||hit.notfound) return cmdOut(msg, `No group named <b>${esc(oldName)}</b>.`);
      const ps=getPageStore(hit.pageid); if(ps.groups[nn]) return cmdOut(msg, `A group named <b>${esc(nn)}</b> already exists on this page.`);
      
      // Find the actual key used to store this group in the state
      let actualKey = null;
      Object.entries(ps.groups).forEach(([key, group]) => {
        if (group === hit.group) {
          actualKey = key;
        }
      });
      
      if (!actualKey) return cmdOut(msg, `<b>Error:</b> Could not find the group's storage key.`);
      
      // Create new group with new name and same data
      ps.groups[nn] = { 
        name: nn, 
        pageid: hit.pageid, 
        ids: hit.group.ids || [] 
      };
      
      // Delete the old group using the actual key
      delete ps.groups[actualKey];
      
      const kMenu=mkAction({t:'menu',pid:hit.pageid,name:nn});
      return cmdOut(msg, card('TokenGroups', `Renamed ${chip(oldName)} → ${chip(nn)} on ${chip(pageName(hit.pageid))}<div style="margin-top:6px">[🔷 Open Menu](${CMD} do ${kMenu})</div>`));
    }

    if (sub==='delete'){
      const { name, pageRef } = parseGroupRef(arg1); if(!name) return cmdOut(msg, `<b>Usage:</b> ${CMD} delete &lt;name[@page]&gt;`);
      const hit=resolveGroup(name,pageRef); if(hit?.error) return cmdOut(msg, `<b>Error:</b> ${hit.error}`); if(hit?.conflict) return cmdOut(msg, hit.conflict);
      if(!hit||hit.notfound) return cmdOut(msg, `No group named <b>${esc(name)}</b>.`);
      const ps=getPageStore(hit.pageid); delete ps.groups[hit.group.name];
      return cmdOut(msg, card('TokenGroups', `Deleted group ${chip(name)}.`));
    }

    if (sub==='clear'){
      const { name, pageRef } = parseGroupRef(arg1); if(!name) return cmdOut(msg, `<b>Usage:</b> ${CMD} clear &lt;name[@page]&gt;`);
      const hit=resolveGroup(name,pageRef); if(hit?.error) return cmdOut(msg, `<b>Error:</b> ${hit.error}`); if(hit?.conflict) return cmdOut(msg, hit.conflict);
      if(!hit||hit.notfound) return cmdOut(msg, `No group named <b>${esc(name)}</b>.`);
      hit.group.ids=[]; const kMenu=mkAction({t:'menu',pid:hit.pageid,name:hit.group.name});
      return cmdOut(msg, card('TokenGroups', `Cleared ${chip(hit.group.name)} on ${chip(pageName(hit.pageid))}<div style="margin-top:6px">[🔷 Open Menu](${CMD} do ${kMenu})</div>`));
    }

    if (sub==='show'){
      const { name, pageRef } = parseGroupRef(arg1); if(!name) return cmdOut(msg, `<b>Usage:</b> ${CMD} show &lt;name[@page]&gt;`);
      const hit=resolveGroup(name,pageRef); if(hit?.error) return cmdOut(msg, `<b>Error:</b> ${hit.error}`); if(hit?.conflict) return cmdOut(msg, hit.conflict);
      if(!hit||hit.notfound) return cmdOut(msg, `No group named <b>${esc(name)}</b>.`);
      let shown=0; hit.group.ids.forEach(id=>{const g=getObj('graphic',id); if(g){shown++; sendPing(g.get('left'),g.get('top'),g.get('_pageid'),null,true);}});
      const kMenu=mkAction({t:'menu',pid:hit.pageid,name:hit.group.name});
      return cmdOut(msg, card('TokenGroups', `Pinged ${chip(String(shown))} token${shown===1?'':'s'} in ${chip(hit.group.name)} on ${chip(pageName(hit.pageid))}<div style="margin-top:6px">[🔷 Open Menu](${CMD} do ${kMenu})</div>`));
    }

    if (sub==='move'){
      const ref=parseGroupRef(arg1); const layer=(arg2||'').toLowerCase();
      if(!ref.name||!layer) return cmdOut(msg, `<b>Usage:</b> ${CMD} move &lt;name[@page]&gt; &lt;objects|gmlayer|map&gt;`);
      if(!LAYERS.has(layer)) return cmdOut(msg, `<b>Error:</b> Invalid layer: ${esc(layer)}.`);
      const hit=resolveGroup(ref.name,ref.pageRef); if(hit?.error) return cmdOut(msg, `<b>Error:</b> ${hit.error}`); if(hit?.conflict) return cmdOut(msg, hit.conflict);
      if(!hit||hit.notfound) return cmdOut(msg, `No group named <b>${esc(ref.name)}</b>.`);
      let moved=0,missing=0; hit.group.ids = hit.group.ids.filter(id=>{const g=getObj('graphic',id); if(!g){missing++; return false;} try{g.set('layer',layer); moved++;}catch{} return true;});
      const kMenu=mkAction({t:'menu',pid:hit.pageid,name:hit.group.name});
      const missNote = missing ? ` ${meta(`(removed ${missing} missing)`)}` : '';
      return cmdOut(msg, card('TokenGroups', `Moved ${chip(hit.group.name)} → ${chip(layer)} on ${chip(pageName(hit.pageid))} ${meta(`(moved ${moved})`)}${missNote}<div style="margin-top:6px">[🔷 Open Menu](${CMD} do ${kMenu})</div>`));
    }

    if (sub==='list'){
      // First priority: page from selected tokens
      let pid = pageOfSelection(getSelectedGraphics(msg)); 
      
      // Second priority: try to get current page from player ribbon (only if it has groups AND no other pages have groups)
      if(!pid){ 
        try{ 
          const playerPage = Campaign().get('playerpageid');
          const S = assertState();
          const playerPageHasGroups = playerPage && S.pages[playerPage] && Object.keys(S.pages[playerPage].groups || {}).length > 0;
          const otherPagesHaveGroups = Object.entries(S.pages).some(([p, ps]) => p !== playerPage && Object.keys(ps.groups || {}).length > 0);
          
          // Only use player page if it has groups AND no other pages have groups
          if (playerPageHasGroups && !otherPagesHaveGroups) {
            pid = playerPage;
          }
        } catch {} 
      }
      
      if (!pid || !assertState().pages[pid]) {
        const S=assertState();
        const all=Object.entries(S.pages).flatMap(([p,ps])=>Object.values(ps.groups).map(g=>({pid:p,name:g.name,count:g.ids.length})));
        if (!all.length) {
          if (state[MOD].render==='sc') { 
            const sc = buildSC('TokenGroups — All Groups',[`No groups saved yet. Try ${CMD} create MyGroup`]); 
            rememberSC(sc); 
            return sendSC(msg, sc); 
          }
          return cmdOut(msg, card('TokenGroups — All Groups', `No groups saved yet. Try <code>${CMD} create MyGroup</code>.`));
        }
        if (state[MOD].render==='sc') {
                                           const lines = all.slice(0,20).map(g=>{
              const kMenu=mkAction({t:'menu',pid:g.pid,name:g.name}); 
              return `${scBold(g.name)} on ${scBold(pageName(g.pid))} (${g.count}) ${scBtn('Menu', 'primary', kMenu)}`;
            });
          const sc = buildSC('TokenGroups — Some Groups (up to 20)', lines); 
          rememberSC(sc); 
          return sendSC(msg, sc);
        }
        const rows = all.slice(0,20).map(g=>{
          const kMenu=mkAction({t:'menu',pid:g.pid,name:g.name}); const pn=pageName(g.pid);
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-top:1px solid ${THEME.border}">
                    <div style="display:flex;gap:8px;align-items:center">${chip(g.name)} <span>on</span> ${chip(pn)} <span>${meta(`(${g.count})`)}</span></div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-left:8px">${btnB('Menu',`${CMD} do ${kMenu}`)}</div>
                  </div>`;
        }).join('');
        return cmdOut(msg, card(`TokenGroups — All Groups (showing up to 20)`, rows) + `<div style="margin-top:6px">${meta(`Use ${CMD} list all for the full list.`)}</div>`);
      }
      return openPageMenu(pid);
    }

    // action dispatcher (from menu buttons)
    if (sub==='do'){
      const key=arg1; const rec=key&&getAction(key); if(!rec) return cmdOut(msg, `This menu action expired. Reopen the menu and try again.`);
      const p=rec.payload; let hit;
      switch(p.t){
        case 'menu': hit=getGroupOnPage(p.pid,p.name); if(!hit) return cmdOut(msg, `Group not found anymore: <b>${esc(p.name)}</b>.`);
          return openGroupMenu(hit);
        case 'show': hit=getGroupOnPage(p.pid,p.name); if(!hit) return cmdOut(msg, `Group not found anymore: <b>${esc(p.name)}</b>.`);
          let shown=0; hit.group.ids.forEach(id=>{const g=getObj('graphic',id); if(g){shown++; sendPing(g.get('left'),g.get('top'),g.get('_pageid'),null,true);}});
          return cmdOut(msg, card('TokenGroups', `Pinged ${chip(String(shown))} token${shown===1?'':'s'} in ${chip(hit.group.name)} on ${chip(pageName(hit.pageid))}`));
        case 'where': return cmdOut(msg, `<b>${esc(p.name)}</b> — Page: ${esc(pageName(p.pid))} [${esc(p.pid)}]`);
        case 'stats': hit=getGroupOnPage(p.pid,p.name); if(!hit) return cmdOut(msg, `Group not found anymore: <b>${esc(p.name)}</b>.`);
          let ok=0,miss=0; (hit.group.ids||[]).forEach(id=> (getObj('graphic',id)?ok++:miss++));
          return cmdOut(msg, [`<u>Stats — Group <b>${esc(hit.group.name)}</b></u>`,`Page: ${esc(pageName(hit.pageid))} [${esc(p.pid)}]`,`Size: ${hit.group.ids?.length||0}`,`Resolvable: ${ok}, Missing: ${miss}`].join('<br/>'));
        case 'move': hit=getGroupOnPage(p.pid,p.name); if(!hit) return cmdOut(msg, `Group not found anymore: <b>${esc(p.name)}</b>.`);
          if(!LAYERS.has(p.layer)) return cmdOut(msg, `<b>Error:</b> Invalid layer: ${esc(p.layer)}.`);
          let moved=0,mr=0; hit.group.ids=hit.group.ids.filter(id=>{const g=getObj('graphic',id); if(!g){mr++; return false;} try{g.set('layer',p.layer); moved++;}catch{} return true;});
          return cmdOut(msg, card('TokenGroups', `Moved ${chip(hit.group.name)} → ${chip(p.layer)} on ${chip(pageName(hit.pageid))} ${meta(`(moved ${moved})`)}${mr?` ${meta(`(removed ${mr} missing)`)}`:''}`));
        case 'purge': hit=getGroupOnPage(p.pid,p.name); if(!hit) return cmdOut(msg, `Group not found anymore: <b>${esc(p.name)}</b>.`);
          const rem=pruneGroup(hit.group); return cmdOut(msg, `Purged <b>${esc(hit.group.name)}</b>. IDs removed: ${rem}. Size now ${hit.group.ids.length}.`);
        case 'clear': hit=getGroupOnPage(p.pid,p.name); if(!hit) return cmdOut(msg, `Group not found anymore: <b>${esc(p.name)}</b>.`);
          hit.group.ids=[]; return cmdOut(msg, card('TokenGroups', `Cleared ${chip(hit.group.name)} on ${chip(pageName(hit.pageid))}`));
        case 'delete': hit=getGroupOnPage(p.pid,p.name); if(!hit) return cmdOut(msg, `Group not found anymore: <b>${esc(p.name)}</b>.`);
          const ps=getPageStore(p.pid); delete ps.groups[p.name]; return cmdOut(msg, card('TokenGroups', `Deleted group ${chip(p.name)}.`));
      }
    }

    // unknown
    return cmdOut(msg, `<b>Error:</b> Unknown subcommand "${esc(sub)}". Type ${CMD} help.`);
  });
});
