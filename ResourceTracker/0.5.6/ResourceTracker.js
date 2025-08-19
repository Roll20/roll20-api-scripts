// ResourceTracker v0.5.6 — per-character resource tracker for Roll20
// 0.5.6:
//   • NEW: Player notification modes: all | recover | none
//          -> !res config notify all|recover|none
//          'recover' = only recover messages go to players; GM always mirrored.
//   • Keeps: names-only whispers (no player|id), recover shows per-item rolls,
//            robust linkbar via RT_<Resource> attribute, auto-spend, ScriptCards arg
//            cleaning, enable/disable, player modes, debug/diag, menus, aliases, automap.

on('ready', () => {
  const RT = (() => {
    const MOD = 'ResourceTracker';
    const CMD = '!res';
    const VERSION = '0.5.6';

    // ---------- utils ----------
    const H = (s) => `<div style="font-family:monospace">${s}</div>`;
    const esc = (s)=>String(s).replace(/[<>&'"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
    const decode = (s)=>String(s||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
    const unq = (s)=> s ? s.replace(/^"(.*)"$/,'$1') : s;
    const deUS = (s)=> s ? String(s).replace(/^_+/, '') : s;   // ScriptCards underscore prefix
    const deDD = (s)=> s ? String(s).replace(/^--/, '') : s;   // ScriptCards leading dashes
    const clean = (s)=> unq(deDD(deUS(String(s||''))));
    const toInt = (s, def)=>{ const n = parseInt(clean(s),10); return Number.isFinite(n) ? n : def; };
    const getKV = (parts, key) => {
      for (const e of parts) {
        const s1 = deUS(String(e||'')); const s2 = deDD(s1);
        const m = s2.match(new RegExp(`^${key}[=|](.+)$`, 'i'));
        if (m) return unq(m[1]);
      }
      return null;
    };

    // Names-only whispering
    const whisperTo = (who, html) => {
      const q = String.fromCharCode(34); // "
      const target = (!who || who==='gm') ? 'gm' : (q + String(who).replace(/"/g,'\\"') + q);
      const msg = `/w ${target} ${H(html)}`;
      if (state[MOD] && state[MOD].debug) {
        log(`${MOD} whisperTo -> ${msg}`);
        sendChat(MOD, `/w gm ${H(`DEBUG whisper: <code>${esc(msg)}</code>`)}`, null, { noarchive: true });
      }
      sendChat(MOD, msg, null, { noarchive: true });
    };
    const whisperGM = (html)=> whisperTo('gm', html);

    // ---------- state ----------
    const firstRun = !state[MOD];
    const assertState = () => {
      const s = (state[MOD] = state[MOD] || {});
      s.data    = s.data    || {};   // { [charId]: { [resName]: {cur,max,thresh,bar,rest,attrId?} } }
      s.automap = s.automap || {};   // { [charId]: { [attackName]: resName } }
      s.aliases = s.aliases || {};   // { [attackName]: { resource, cost } }
      s.config  = s.config  || {};
      if (typeof s.config.recoverBreak !== 'number') s.config.recoverBreak = 2;
      if (typeof s.config.autospend !== 'boolean')   s.config.autospend = true;
      if (!s.config.playerMode)                      s.config.playerMode = 'partial'; // none|partial|full
      s.config.notifyMode = 'names'; // names-only delivery transport
      if (!s.config.playerNotify)                    s.config.playerNotify = 'all'; // all|recover|none
      if (typeof s.enabled !== 'boolean')            s.enabled = firstRun ? false : true;
      if (!s.created)                                s.created = (new Date()).toISOString();
      if (typeof s.debug !== 'boolean')              s.debug = false;
      return s;
    };

    const isGM = (pid)=>{
      const p = getObj('player', pid);
      return p ? playerIsGM(p.get('_id')) : false;
    };

    // ---------- players/controllers ----------
    const controllerPlayers = (ch)=>{
      const out = { players: [], hasAll: false };
      const ctl = (ch.get('controlledby')||'')
        .split(',')
        .map(s=>s.trim())
        .filter(Boolean);
      ctl.forEach(x=>{
        if (x === 'all') { out.hasAll = true; return; }
        const p = /^[A-Za-z0-9_-]{20,}$/.test(x) ? getObj('player', x) : null;
        if (p) out.players.push(p);
        else out.players.push({ id: null, get: (k)=> (k==='displayname' ? x : '') });
      });
      return out;
    };

    // Notify with kind-based player filtering
    const shouldPlayerSee = (kind)=>{
      const mode = assertState().config.playerNotify || 'all';
      if (mode === 'none') return false;
      if (mode === 'recover') return (kind === 'recover');
      return true; // 'all'
    };

    const notifyByKind = (ch, htmlLine, playerid, kind='info') => {
      const recips = new Set();
      if (shouldPlayerSee(kind)) {
        const { players } = controllerPlayers(ch);
        players.forEach(p=>{ const dn = p.get && p.get('displayname'); if (dn) recips.add(dn); });
        if (playerid) { const p = getObj('player', playerid); if (p) recips.add(p.get('displayname')); }
      }
      recips.add('gm');
      const line = `${ch.get('name')}: ${htmlLine}`;
      recips.forEach(t => whisperTo(t, line));
    };

    // ---------- character context ----------
    const getAnyTokenForChar = (cid)=>{
      const ts = findObjs({ _type:'graphic', _subtype:'token', represents: cid }) || [];
      return ts[0] || null;
    };
    const getAllTokensForChar = (cid)=>{
      return findObjs({ _type:'graphic', _subtype:'token', represents: cid }) || [];
    };
    const getCharFromSelection = (msg)=>{
      const s = msg.selected && msg.selected[0];
      if(!s || s._type!=='graphic') return null;
      const g = getObj('graphic', s._id); if(!g) return null;
      const cid = g.get('represents'); if(!cid) return null;
      const ch = getObj('character', cid); if(!ch) return null;
      return { ch, token:g };
    };
    const parseCharOverride = (parts, msg)=>{
      let name = null, cid = null;
      for (let i=2; i<parts.length; i++){
        const p0  = deDD(deUS(String(parts[i]||'').trim()));
        const low = p0.toLowerCase();
        if (low.startsWith('char='))   { name = unq(p0.slice(5)); continue; }
        if (low.startsWith('char|'))   { name = unq(p0.split('|')[1]); continue; }
        if (low==='char')              { if(parts[i+1]) { name = unq(deUS(String(parts[++i]))); } continue; }
        if (low.startsWith('charid=')) { cid  = unq(p0.slice(7)); continue; }
        if (low.startsWith('charid|')) { cid  = unq(p0.split('|')[1]); continue; }
        if (low==='charid')            { if(parts[i+1]) { cid = unq(deUS(String(parts[++i]))); } continue; }
      }
      let ch = null;
      if (cid) ch = getObj('character', cid) || null;
      if (!ch && name){
        const cs = findObjs({ _type:'character', name });
        if (cs && cs.length) ch = cs[0];
      }
      if (ch){
        let token = null;
        if (msg.selected && msg.selected.length){
          const g = getObj('graphic', msg.selected[0]._id);
          if (g && g.get('represents')===ch.id) token = g;
        }
        if (!token) token = getAnyTokenForChar(ch.id);
        return { ch, token };
      }
      return null;
    };
    const resolveCtx = (msg, parts)=> parseCharOverride(parts, msg) || getCharFromSelection(msg) || null;

    // ---------- data ----------
    const charData = (cid)=>{
      const s = assertState();
      s.data[cid] = s.data[cid] || {};
      return s.data[cid];
    };
    const charAuto = (cid)=>{
      const s = assertState();
      s.automap[cid] = s.automap[cid] || {};
      return s.automap[cid];
    };

    // ---------- attributes + bars ----------
    const normAttrName = (resName)=> `RT_${String(resName||'').replace(/\s+/g,'_')}`;
    const getOrCreateAttr = (cid, resName)=>{
      const name = normAttrName(resName);
      let a = findObjs({ _type:'attribute', _characterid: cid, name })[0];
      if (!a) a = createObj('attribute', { _characterid: cid, name, current: 0, max: 0 });
      return a;
    };

    const ensureLinkAndSync = (token, ch, resName, r) => {
      if (!token || !r || !r.bar) return;
      const attr = getOrCreateAttr(ch.id, resName);
      attr.set({ current: r.cur, max: r.max });
      const linkProp = `${r.bar}_link`;
      const valProp  = `${r.bar}_value`;
      const maxProp  = `${r.bar}_max`;
      if (token.get(linkProp) !== attr.id) token.set(linkProp, attr.id);
      token.set(valProp, r.cur);
      token.set(maxProp, r.max);
      r.attrId = attr.id;
    };

    // Back-compat sync; always keeps attribute current even if no token is available
    const syncBar = (token, ch, resName, r) => {
      if(!r) return;
      try {
        // Always keep attribute in sync
        let attr = r.attrId ? getObj('attribute', r.attrId) : null;
        if (!attr) { attr = getOrCreateAttr(ch.id, resName); r.attrId = attr.id; }
        attr.set({ current: r.cur, max: r.max });

        if (token && r.bar) {
          const linkProp = `${r.bar}_link`;
          const valProp  = `${r.bar}_value`;
          const maxProp  = `${r.bar}_max`;
          if (token.get(linkProp) !== r.attrId) token.set(linkProp, r.attrId);
          token.set(valProp, r.cur);
          token.set(maxProp, r.max);
        }
      } catch(e) {
        if (assertState().debug) whisperGM(`syncBar error: ${esc(String(e))}`);
        log(`${MOD} syncBar error: ${e.stack||e}`);
      }
    };

    const resourceLine = (name, r)=>{
      const warn = (r.thresh!=null && r.cur<=r.thresh) ? ' ⚠' : '';
      const bar = r.bar ? ` • ${r.bar}` : '';
      const attr = r.attrId ? ' • attr=linked' : '';
      const theRest = r.rest && r.rest!=='none' ? ` • rest=${r.rest}` : '';
      return `• <b>${esc(name)}</b>: ${r.cur}/${r.max}${warn}${bar}${attr}${theRest}`;
    };

    // ---------- permissions ----------
    const partialSubs = new Set(['use','list','menu','recover']);
    const fullExtra   = new Set(['create','add','set','delete','thresh','resttag','reset','linkbar']);
    const playerAllowed = (playerId, sub) => {
      const s = assertState();
      if (playerIsGM(playerId)) return true;
      if (!s.enabled) return false;
      switch (s.config.playerMode) {
        case 'none':    return false;
        case 'partial': return partialSubs.has(sub);
        case 'full':    return partialSubs.has(sub) || fullExtra.has(sub);
        default:        return partialSubs.has(sub);
      }
    };

    // ---------- roll parsing (auto-spend) ----------
    const getCharIdFromRoll = (msg)=>{
      if(!msg.content) return null;
      let m = msg.content.match(/{{\s*(?:character_id|charid)\s*=\s*([-\w]+)\s*}}/i);
      if(m) { const ch = getObj('character', m[1]); if(ch) return ch.id; }
      m = msg.content.match(/{{\s*(?:charname|character_name|charactername)\s*=\s*([^}]+)}}/i);
      if(m) { const name = decode(m[1]).trim(); const cs = findObjs({ _type:'character', name }); if(cs && cs.length) return cs[0].id; }
      if(msg.playerid && msg.selected && msg.selected.length===1){
        const s = msg.selected[0];
        if(s._type==='graphic'){
          const g = getObj('graphic', s._id);
          if(g){
            const cid = g.get('represents');
            const ch = cid && getObj('character', cid);
            if(ch) return ch.id;
          }
        }
      }
      return null;
    };
    const getAttackNameFromRoll = (msg)=>{
      if(!msg.content) return null;
      const order = ['rname','name','title','weapon','spell','item','itemname'];
      for(const k of order){
        const re = new RegExp(`{{\\s*${k}\\s*=\\s*([^}]+)}}`, 'i');
        const m = msg.content.match(re);
        if(m){ return decode(m[1]).trim(); }
      }
      const m2 = msg.content.match(/\*\*([^*]+)\*\*/);
      if(m2) return decode(m2[1]).trim();
      return null;
    };
    const resolveSpendTarget = (cid, attackName)=>{
      const s = assertState();
      const auto = s.automap && s.automap[cid] || null;
      if(auto && auto[attackName]) return { resource: auto[attackName], cost: 1 };
      const a = s.aliases && s.aliases[attackName];
      if(a && a.resource) return { resource: a.resource, cost: (Number.isFinite(a.cost) && a.cost>0)?a.cost:1 };
      return null;
    };

    return {
      MOD, CMD, VERSION,
      assertState, isGM,
      resolveCtx, getAnyTokenForChar, getAllTokensForChar, charData, charAuto,
      resourceLine, ensureLinkAndSync,
      clean, toInt, getKV, syncBar,
      getCharIdFromRoll, getAttackNameFromRoll, resolveSpendTarget,
      whisperGM, esc,
      controllerPlayers, playerAllowed, notifyByKind, shouldPlayerSee
    };
  })();

  const S = RT.assertState();

  // Startup whisper
  if (S.enabled) {
    log(`${RT.MOD} v${RT.VERSION} loaded (ENABLED).`);
    sendChat(RT.MOD, `/w gm ${RT.MOD} v${RT.VERSION} loaded (ENABLED). Type ${RT.CMD} help.`);
  } else {
    log(`${RT.MOD} v${RT.VERSION} loaded (DISABLED).`);
    sendChat(RT.MOD, `/w gm ${RT.MOD} v${RT.VERSION} loaded <b>(DISABLED)</b>. Run <code>${RT.CMD} enable</code> to activate.`);
  }

  // Wrap runner to surface exceptions when debug is on
  const runSafe = (label, fn) => {
    try { fn(); }
    catch(e){
      log(`${RT.MOD} ${label} error: ${e.stack||e}`);
      if (state[RT.MOD] && state[RT.MOD].debug) {
        sendChat(RT.MOD, `/w gm ${RT.esc(label)} error: ${RT.esc(String(e))}`);
      }
    }
  };

  // ---- AUTO-SPEND from sheet rolls ----
  on('chat:message', (msg)=>{
    runSafe('auto', ()=>{
      const st = RT.assertState();
      if(!st.enabled || !st.config.autospend) return;
      if(!(msg.type === 'rollresult' || msg.type === 'general') || !msg.content) return;

      const cid = RT.getCharIdFromRoll(msg);
      if(!cid) return;

      if(!RT.isGM(msg.playerid) && st.config.playerMode === 'none') return;

      const attackName = RT.getAttackNameFromRoll(msg);
      if(!attackName) return;

      const target = RT.resolveSpendTarget(cid, attackName);
      if(!target) return;

      const ch = getObj('character', cid); if(!ch) return;

      if(!RT.isGM(msg.playerid)) {
        const ctl = (ch.get('controlledby')||'').split(',').map(s=>s.trim());
        if(!(ctl.includes('all') || ctl.includes(msg.playerid))) return;
      }

      const token = RT.getAnyTokenForChar(cid);
      const data = RT.charData(cid);
      const r = data[target.resource];
      if(!r) return; // do not auto-create
      r.cur = Math.max(0, Math.min(r.max, r.cur - target.cost));
      RT.syncBar(token, ch, target.resource, r);
      RT.notifyByKind(ch, `<b>${RT.esc(target.resource)}</b> → ${r.cur}/${r.max}`, msg.playerid, 'use'); // follows playerNotify mode
    });
  });

  // ---- COMMAND HANDLER ----
  on('chat:message', (msg)=>{
    if(msg.type !== 'api' || !msg.content.startsWith(RT.CMD)) return;
    runSafe('cmd', ()=>{
      const st = RT.assertState();
      const rawParts = msg.content.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
      const sub  = (RT.clean(rawParts[1])||'').toLowerCase();
      const arg1 = RT.clean(rawParts[2]);
      const arg2 = RT.clean(rawParts[3]);
      const parts = rawParts;

      const isGM = RT.isGM(msg.playerid);
      const allowWhenDisabled = new Set(['help','?','status','enable','config','debug','diag']);
      if(!st.enabled && !allowWhenDisabled.has(sub)) {
        if(isGM) RT.whisperGM(`Script is <b>DISABLED</b>. Run <code>${RT.CMD} enable</code> to activate. For settings: <code>${RT.CMD} status</code>.`);
        return;
      }

      // HELP
      if(!sub || sub==='help' || sub==='?'){
        return RT.whisperGM([
          `<b>${RT.CMD}</b> — v${RT.VERSION} (enabled=${st.enabled ? 'yes':'no'}, playerMode=${st.config.playerMode}, autospend=${st.config.autospend?'on':'off'}, debug=${st.debug?'on':'off'}, notify=names, playerNotify=${st.config.playerNotify})`,
          `<u>Admin</u> — ${RT.CMD} enable | ${RT.CMD} disable | ${RT.CMD} status | ${RT.CMD} debug on|off | ${RT.CMD} config autospend on|off | ${RT.CMD} config playermode none|partial|full | ${RT.CMD} config recover &lt;0..100&gt; | ${RT.CMD} config notify all|recover|none`,
          `<u>GM/Player</u> — create/use/add/set/delete/thresh/resttag/reset/list/menu/linkbar/recover; alias/automap; diag.`
        ].join('<br/>'));
      }

      // DEBUG
      if(sub==='debug'){ if(!isGM) return;
        const v = (arg1||'').toLowerCase();
        if(!/^(on|off)$/.test(v)) return RT.whisperGM(`Usage: ${RT.CMD} debug on|off (cur=${st.debug?'on':'off'})`);
        st.debug = (v==='on'); RT.whisperGM(`Debug is now ${st.debug?'ON':'OFF'}.`); return;
      }

      // DIAG
      if(sub==='diag'){ if(!isGM) return;
        const ctx = RT.resolveCtx(msg, parts);
        if(!ctx) return RT.whisperGM(`Select a represented token or add char="Name".`);
        const { players, hasAll } = RT.controllerPlayers(ctx.ch);
        const recips = new Set();
        players.forEach(p=>{ const dn = p.get('displayname'); if (dn) recips.add(dn); });
        recips.add('gm');
        if (msg.playerid) { const p = getObj('player', msg.playerid); if (p) recips.add(p.get('displayname')); }
        RT.whisperGM(`<u>Diag ${RT.esc(ctx.ch.get('name'))}</u><br/>ControlledBy: ${players.map(p=>p.get('displayname')).join(', ')}${hasAll?' (all)':''}<br/>Recipients now (mode=${st.config.playerNotify}): ${Array.from(recips).join(', ')}`);
        RT.notifyByKind(ctx.ch, `Diag test line — you should see this if your mode allows it.`, msg.playerid, 'info');
        return;
      }

      // ADMIN
      if(sub==='enable'){ if(!isGM) return; st.enabled = true; RT.whisperGM('Enabled.'); return; }
      if(sub==='disable'){ if(!isGM) return; st.enabled = false; RT.whisperGM('Disabled.'); return; }
      if(sub==='status'){ if(!isGM) return;
        return RT.whisperGM(`Status: enabled=${st.enabled?'yes':'no'}, playerMode=${st.config.playerMode}, autospend=${st.config.autospend?'on':'off'}, recoverDefault=${st.config.recoverBreak}%, notify=names, playerNotify=${st.config.playerNotify}, debug=${st.debug?'on':'off'}`);
      }
      if(sub==='config'){
        if(!isGM) return;
        const key = (arg1||'').toLowerCase();
        if(key==='recover' || key==='recover-break'){
          const n = RT.toInt(arg2, NaN);
          if(!Number.isFinite(n) || n<0 || n>100) return RT.whisperGM(`Usage: ${RT.CMD} config recover &lt;0..100&gt; (cur=${st.config.recoverBreak}%)`);
          st.config.recoverBreak = n; RT.whisperGM(`Default recover break set to ${n}%.`); return;
        }
        if(key==='autospend'){
          const v = (arg2||'').toLowerCase(); if(!/^(on|off)$/.test(v)) return RT.whisperGM(`Usage: ${RT.CMD} config autospend on|off (cur=${st.config.autospend?'on':'off'})`);
          st.config.autospend = (v==='on'); RT.whisperGM(`Auto-spend is now ${st.config.autospend?'ON':'OFF'}.`); return;
        }
        if(key==='playermode'){
          const v = (arg2||'').toLowerCase(); if(!/^(none|partial|full)$/.test(v)) return RT.whisperGM(`Usage: ${RT.CMD} config playermode none|partial|full (cur=${st.config.playerMode})`);
          st.config.playerMode = v; RT.whisperGM(`Player mode set to <b>${v}</b>.`); return;
        }
        if(key==='notify'){
          const v = (arg2||'').toLowerCase();
          if(!/^(all|recover|none)$/.test(v)) return RT.whisperGM(`Usage: ${RT.CMD} config notify all|recover|none (cur=${st.config.playerNotify})`);
          st.config.playerNotify = v;
          RT.whisperGM(`Player notification mode set to <b>${v}</b>.`);
          return;
        }
        return RT.whisperGM(`Usage: ${RT.CMD} config autospend on|off | ${RT.CMD} config playermode none|partial|full | ${RT.CMD} config recover 0..100 | ${RT.CMD} config notify all|recover|none`);
      }

      // Character context + perms
      const needChar = ()=>{
        const ctx = RT.resolveCtx(msg, parts);
        if(!ctx){ RT.whisperGM(`Select a token that <i>represents</i> a character or add <code>char="Name"</code> to the command.`); return null; }
        if(!RT.isGM(msg.playerid) && !RT.playerAllowed(msg.playerid, sub)) { RT.whisperGM(`Blocked: player mode '${S.config.playerMode}' disallows '${sub}'.`); return null; }
        if(!RT.isGM(msg.playerid)) {
          const ctl = (ctx.ch.get('controlledby')||'').split(',').map(s=>s.trim());
          if(!(ctl.includes('all') || ctl.includes(msg.playerid))) { RT.whisperGM(`Blocked: you do not control <b>${RT.esc(ctx.ch.get('name'))}</b>.`); return null; }
        }
        return ctx;
      };

      // ---- Core verbs ----
      const requiresCharSubs = new Set(['create','use','sub','add','set','delete','thresh','resttag','reset','list','menu','linkbar','recover']);
      if(requiresCharSubs.has(sub)){
        const ctx = needChar(); if(!ctx) return;

        if(sub==='create'){ if(!isGM && S.config.playerMode!=='full') return;
          const name = RT.clean(rawParts[2]);
          const max  = RT.toInt(rawParts[3], NaN);
          let curArg = null, restArg = 'none';
          for (let i = 4; i < rawParts.length; i++) {
            const p0 = RT.clean(String(rawParts[i]||''));
            if (/^rest[=|]/i.test(p0)) restArg = unq(p0.split(/[=|]/)[1] || 'none');
            else { const maybe = parseInt(unq(p0),10); if(Number.isFinite(maybe)) curArg = maybe; }
          }
          if(!name || !Number.isFinite(max)) return RT.whisperGM(`Usage: ${RT.CMD} create &lt;name&gt; &lt;max&gt; [current] [rest=none|short|long] [char=...]`);
          const d = RT.charData(ctx.ch.id);
          const r = (d[name] = d[name] || {cur:0,max:0,thresh:null,bar:null,rest:'none'});
          r.max = Math.max(0,max);
          r.cur = Math.max(0, Math.min(r.max, (curArg==null?max:curArg)));
          r.rest = /^(short|long)$/i.test(restArg) ? restArg.toLowerCase() : 'none';
          RT.notifyByKind(ctx.ch, `Created <b>${RT.esc(name)}</b> ${r.cur}/${r.max}${r.rest!=='none'?` (rest=${r.rest})`:''}`, msg.playerid, 'create');
          return;
        }

        if(sub==='use' || sub==='sub'){
          const name = RT.clean(rawParts[2]);
          const n    = RT.toInt(rawParts[3], 1);
          if(!name || !Number.isFinite(n)) return RT.whisperGM(`Usage: ${RT.CMD} ${sub} &lt;name&gt; [n=1] [char=...]`);
          const d = RT.charData(ctx.ch.id);
          const r = d[name];
          if(!r){ RT.whisperGM(`${ctx.ch.get('name')}: No resource named <b>${RT.esc(name)}</b>.`); return; }
          if(r.cur < n){ RT.notifyByKind(ctx.ch, `❌ Out of <b>${RT.esc(name)}</b>! Have ${r.cur}, need ${n}.`, msg.playerid, 'use'); return; }
          r.cur = Math.max(0, Math.min(r.max, r.cur - n));
          RT.syncBar(ctx.token || RT.getAnyTokenForChar(ctx.ch.id), ctx.ch, name, r);
          RT.notifyByKind(ctx.ch, `<b>${RT.esc(name)}</b> → ${r.cur}/${r.max}`, msg.playerid, 'use');
          if(r.thresh!=null && r.cur<=r.thresh){ RT.notifyByKind(ctx.ch, `<b>${RT.esc(name)}</b> low: ${r.cur}/${r.max} (≤ ${r.thresh})`, msg.playerid, 'use'); }
          return;
        }

        if(sub==='add'){ if(!isGM && S.config.playerMode!=='full') return;
          const name = RT.clean(rawParts[2]); const n = RT.toInt(rawParts[3], NaN);
          if(!name || !Number.isFinite(n)) return RT.whisperGM(`Usage: ${RT.CMD} add &lt;name&gt; &lt;n&gt; [char=...]`);
          const d = RT.charData(ctx.ch.id); const r = d[name] || (d[name]={cur:0,max:0,thresh:null,bar:null,rest:'none'});
          r.cur = Math.max(0, Math.min(r.max, r.cur + n));
          RT.syncBar(ctx.token || RT.getAnyTokenForChar(ctx.ch.id), ctx.ch, name, r);
          RT.notifyByKind(ctx.ch, `<b>${RT.esc(name)}</b> → ${r.cur}/${r.max}`, msg.playerid, 'add'); return;
        }

        if(sub==='set'){ if(!isGM && S.config.playerMode!=='full') return;
          const name = RT.clean(rawParts[2]); const n = RT.toInt(rawParts[3], NaN);
          if(!name || !Number.isFinite(n)) return RT.whisperGM(`Usage: ${RT.CMD} set &lt;name&gt; &lt;n&gt; [char=...]`);
          const d = RT.charData(ctx.ch.id); const r = d[name] || (d[name]={cur:0,max:0,thresh:null,bar:null,rest:'none'});
          r.cur = Math.max(0, Math.min(r.max, n));
          RT.syncBar(ctx.token || RT.getAnyTokenForChar(ctx.ch.id), ctx.ch, name, r);
          RT.notifyByKind(ctx.ch, `<b>${RT.esc(name)}</b> set to ${r.cur}/${r.max}`, msg.playerid, 'set'); return;
        }

        if(sub==='delete'){ if(!isGM && S.config.playerMode!=='full') return;
          const name = RT.clean(rawParts[2]); if(!name) return RT.whisperGM(`Usage: ${RT.CMD} delete &lt;name&gt; [char=...]`);
          const d = RT.charData(ctx.ch.id);
          if(d[name]) { delete d[name]; RT.notifyByKind(ctx.ch, `Deleted resource <b>${RT.esc(name)}</b>.`, msg.playerid, 'delete'); }
          else RT.notifyByKind(ctx.ch, `No resource named <b>${RT.esc(name)}</b>.`, msg.playerid, 'delete');
          return;
        }

        if(sub==='thresh'){ if(!isGM && S.config.playerMode!=='full') return;
          const name = RT.clean(rawParts[2]); const n = RT.toInt(rawParts[3], NaN);
          if(!name || !Number.isFinite(n)) return RT.whisperGM(`Usage: ${RT.CMD} thresh &lt;name&gt; &lt;n&gt; [char=...]`);
          const d = RT.charData(ctx.ch.id); const r = d[name] || (d[name]={cur:0,max:0,thresh:null,bar:null,rest:'none'});
          r.thresh = Math.max(0, n);
          RT.notifyByKind(ctx.ch, `<b>${RT.esc(name)}</b> threshold set to ≤ ${r.thresh}`, msg.playerid, 'thresh'); return;
        }

        if(sub==='resttag'){ if(!isGM && S.config.playerMode!=='full') return;
          const name = RT.clean(rawParts[2]); const tag = (RT.clean(rawParts[3])||'').toLowerCase();
          if(!name || !/^(none|short|long)$/.test(tag)) return RT.whisperGM(`Usage: ${RT.CMD} resttag &lt;name&gt; &lt;none|short|long&gt; [char=...]`);
          const d = RT.charData(ctx.ch.id); const r = d[name] || (d[name]={cur:0,max:0,thresh:null,bar:null,rest:'none'});
          r.rest = tag; RT.notifyByKind(ctx.ch, `<b>${RT.esc(name)}</b> rest tag set to ${tag}.`, msg.playerid, 'resttag'); return;
        }

        if(sub==='reset'){
          const which = (arg1||'').toLowerCase();
          if(!isGM && S.config.playerMode!=='full') return;
          const d = RT.charData(ctx.ch.id);
          if(which==='all'){
            Object.values(d).forEach(r=> r.cur = r.max);
            Object.entries(d).forEach(([nm,r])=> RT.syncBar(ctx.token || RT.getAnyTokenForChar(ctx.ch.id), ctx.ch, nm, r));
            RT.notifyByKind(ctx.ch, `All resources reset to max.`, msg.playerid, 'reset');
          } else {
            if(!which) return RT.whisperGM(`Usage: ${RT.CMD} reset &lt;name|all&gt; [char=...]`);
            const r = d[which] || (d[which]={cur:0,max:0,thresh:null,bar:null,rest:'none'});
            r.cur = r.max;
            RT.syncBar(ctx.token || RT.getAnyTokenForChar(ctx.ch.id), ctx.ch, which, r);
            RT.notifyByKind(ctx.ch, `<b>${RT.esc(which)}</b> reset to ${r.cur}/${r.max}`, msg.playerid, 'reset');
          }
          return;
        }

        if(sub==='list'){
          if(arg1 && arg1.toLowerCase()==='all'){ if(!isGM) return;
            const chunks = Object.keys(st.data).map(cid0=>{
              const ch0 = getObj('character', cid0);
              const name = ch0 ? ch0.get('name') : `(deleted ${cid0})`;
              return `<b>${RT.esc(name)}</b><br/>${Object.keys(st.data[cid0]||{}).sort().map(n=>RT.resourceLine(n, st.data[cid0][n])).join('<br/>') || '(no resources)'}`;
            }).join('<hr/>') || '(no characters tracked)';
            return RT.whisperGM(`<u>All characters</u><br/>${chunks}`);
          }
          const d = RT.charData(ctx.ch.id);
          const lines = Object.keys(d).sort().map(n=>RT.resourceLine(n, d[n])).join('<br/>') || '(no resources)';
          RT.notifyByKind(ctx.ch, `<br/>${lines}`, msg.playerid, 'list');
          return;
        }

        if(sub==='menu'){
          const d = RT.charData(ctx.ch.id);
          const names = Object.keys(d).sort((a,b)=>a.localeCompare(b));
          if(!names.length) {
            RT.notifyByKind(ctx.ch, `<u>${RT.esc(ctx.ch.get('name'))}</u><br/>(no resources)<br/>[Create sample: Arrows 20](${RT.CMD} create Arrows 20 char="${ctx.ch.get('name')}" )`, msg.playerid, 'menu');
            return;
          }
          const rows = names.map(n=>{
            const r = d[n];
            return `<b>${RT.esc(n)}</b> ${r.cur}/${r.max}` +
              ` [−1](${RT.CMD} use ${n} 1 char="${ctx.ch.get('name')}" ) [−5](${RT.CMD} use ${n} 5 char="${ctx.ch.get('name')}" )` +
              ` [+1](${RT.CMD} add ${n} 1 char="${ctx.ch.get('name')}" ) [Reset](${RT.CMD} reset ${n} char="${ctx.ch.get('name')}" )` +
              ` [Set…](${RT.CMD} set ${n} ? char="${ctx.ch.get('name')}" ) [Thresh…](${RT.CMD} thresh ${n} ? char="${ctx.ch.get('name')}" )` +
              ` [RestTag…](${RT.CMD} resttag ${n} ? char="${ctx.ch.get('name')}" )`;
          });
          RT.notifyByKind(ctx.ch, `<u>${RT.esc(ctx.ch.get('name'))}</u><br/>${rows.join('<br/>')}`, msg.playerid, 'menu');
          return;
        }

        if(sub==='linkbar'){ if(!isGM && S.config.playerMode!=='full') return;
          const name = RT.clean(rawParts[2]); const which = (RT.clean(rawParts[3])||'').toLowerCase();
          const allFlag = (RT.clean(rawParts[4])||'').toLowerCase();
          if(!name || !/^bar[123]$/.test(which)) return RT.whisperGM(`Usage: ${RT.CMD} linkbar &lt;name&gt; &lt;bar1|bar2|bar3&gt; [all] [char=...]`);
          const d = RT.charData(ctx.ch.id); const r = d[name] || (d[name]={cur:0,max:0,thresh:null,bar:null,rest:'none'});

          r.bar = which;
          const tokens = (allFlag==='all') ? RT.getAllTokensForChar(ctx.ch.id) : [ctx.token || RT.getAnyTokenForChar(ctx.ch.id)];
          RT.ensureLinkAndSync(tokens[0], ctx.ch, name, r);
          if (tokens.length > 1) tokens.slice(1).forEach(t => RT.syncBar(t, ctx.ch, name, r));
          RT.notifyByKind(ctx.ch, `Linked <b>${RT.esc(name)}</b> to ${which} on ${tokens.length} token(s).`, msg.playerid, 'linkbar');
          return;
        }

        if(sub==='recover'){
          const name = RT.clean(rawParts[2]); const n = RT.toInt(rawParts[3], NaN);
          const b = RT.getKV(parts,'break');
          const breakPct = Math.min(100, Math.max(0, parseInt(b!=null ? b : String(st.config.recoverBreak),10)));
          if(!name || !Number.isFinite(n) || n<=0) return RT.whisperGM(`Usage: ${RT.CMD} recover &lt;name&gt; &lt;n&gt; [break=0..100]`);
          const d = RT.charData(ctx.ch.id); const r = d[name] || (d[name]={cur:0,max:0,thresh:null,bar:null,rest:'none'});
          let recovered=0, broken=0;
          const rolls = [];
          for(let i=0;i<n;i++){
            const roll = randomInteger(100);
            rolls.push(roll);
            if(roll <= breakPct) broken++; else recovered++;
          }
          const room = r.max - r.cur;
          const applied = Math.max(0, Math.min(recovered, room));
          const overflow = Math.max(0, recovered - applied);
          r.cur = Math.max(0, Math.min(r.max, r.cur + applied));
          RT.syncBar(ctx.token || RT.getAnyTokenForChar(ctx.ch.id), ctx.ch, name, r);

          const rollsLine = rolls.map(x => (x <= breakPct ? `${x}✗` : `${x}✓`)).join(', ');
          const line = [
            `Recovering <b>${RT.esc(name)}</b> (break ≤ ${breakPct})`,
            `Rolls: ${rollsLine}`,
            `Tried: ${n}, Survived: ${recovered}, Broken: ${broken}`,
            `Applied: +${applied} (now ${r.cur}/${r.max})${overflow?`, Overflow: ${overflow}`:''}`
          ].join('<br/>');
          RT.notifyByKind(ctx.ch, line, msg.playerid, 'recover');
          return;
        }
      }

      // alias (GM)
      if(sub==='alias'){
        if(!isGM) return;
        const mode = (arg1||'').toLowerCase();
        if(mode==='list'){
          const lines = Object.entries(st.aliases||{}).map(([atk, obj])=>{
            const cost = (Number.isFinite(obj.cost) && obj.cost>0) ? obj.cost : 1;
            return `• "${RT.esc(atk)}" → <b>${RT.esc(obj.resource)}</b> (cost=${cost})`;
          }).join('<br/>') || '(no global aliases)';
          return RT.whisperGM(`<u>Global Attack Aliases</u><br/>${lines}`);
        }
        if(mode==='add'){
          const attack = RT.clean(rawParts[3]);
          const resName= RT.clean(rawParts[4]);
          const cv = RT.getKV(parts, 'cost');
          const cost = cv ? Math.max(1, parseInt(cv,10)) : 1;
          if(!attack || !resName) return RT.whisperGM(`Usage: ${RT.CMD} alias add "Attack Name" "Resource Name" [cost=1]`);
          st.aliases[attack] = { resource: resName, cost };
          return RT.whisperGM(`Global alias: "${RT.esc(attack)}" → <b>${RT.esc(resName)}</b> (cost=${cost}).`);
        }
        if(mode==='del'){
          const attack = RT.clean(rawParts[3]);
          if(!attack) return RT.whisperGM(`Usage: ${RT.CMD} alias del "Attack Name"`);
          delete st.aliases[attack];
          return RT.whisperGM(`Global alias removed: "${RT.esc(attack)}".`);
        }
        return RT.whisperGM(`Usage: ${RT.CMD} alias add|del|list ...`);
      }

      // automap (per-character)
      if(sub==='automap'){
        if(!isGM && st.config.playerMode!=='full') return;
        const mode = (arg1||'').toLowerCase();
        if(mode==='list'){
          const all = st.automap || {};
          const lines = Object.entries(all).flatMap(([k, m])=>{
            const c = getObj('character', k);
            const name = c ? c.get('name') : `(deleted ${k})`;
            const pairs = Object.entries(m).map(([atk,res])=>`• <b>${RT.esc(name)}</b>: "${RT.esc(atk)}" → ${RT.esc(res)}`);
            return pairs.length ? pairs : [`• <b>${RT.esc(name)}</b>: (no mappings)`];
          }).join('<br/>') || '(no mappings)';
          return RT.whisperGM(`<u>Per-Character Automaps</u><br/>${lines}`);
        }
        const ctx = RT.resolveCtx(msg, parts); if(!ctx){ return RT.whisperGM(`Select a represented token or add char="Name".`); }
        if(!RT.isGM(msg.playerid)) {
          const ctl = (ctx.ch.get('controlledby')||'').split(',').map(s=>s.trim());
          if(!(ctl.includes('all') || ctl.includes(msg.playerid))) return RT.whisperGM(`Blocked: you do not control <b>${RT.esc(ctx.ch.get('name'))}</b>.`);
        }
        const auto = RT.charAuto(ctx.ch.id);
        if(mode==='add'){
          const attack = RT.clean(rawParts[3]);
          const resName= RT.clean(rawParts[4]);
          if(!attack || !resName) return RT.whisperGM(`Usage: ${RT.CMD} automap add "Attack" "Resource" [char=...]`);
          auto[attack] = resName;
          return RT.whisperGM(`${ctx.ch.get('name')}: mapped "${RT.esc(attack)}" → <b>${RT.esc(resName)}</b>.`);
        } else if(mode==='del'){
          const attack = RT.clean(rawParts[3]);
          if(!attack) return RT.whisperGM(`Usage: ${RT.CMD} automap del "Attack" [char=...]`);
          delete auto[attack];
          return RT.whisperGM(`${ctx.ch.get('name')}: unmapped "${RT.esc(attack)}".`);
        }
        return RT.whisperGM(`Usage: ${RT.CMD} automap add "Attack" "Resource" [char=...] | ${RT.CMD} automap del "Attack" [char=...] | ${RT.CMD} automap list`);
      }

      // per-char REST
      if(sub==='rest'){
        const tier = (arg1||'').toLowerCase();
        const scope = (RT.clean(rawParts[3])||'').toLowerCase();
        if(!/^(short|long)$/.test(tier)) return RT.whisperGM(`Usage: ${RT.CMD} rest &lt;short|long&gt; [sel|all|page] [char=...]`);

        if(scope==='sel' || scope==='all' || scope==='page'){
          if(!isGM) return;
          return RT.whisperGM(`GM rest scopes unchanged in v${RT.VERSION}.`);
        }
        const ctx = RT.resolveCtx(msg, parts); if(!ctx) return RT.whisperGM(`Select a represented token or add char="Name".`);
        if(!RT.isGM(msg.playerid)) {
          const ctl = (ctx.ch.get('controlledby')||'').split(',').map(s=>s.trim());
          if(!(ctl.includes('all') || ctl.includes(msg.playerid))) return RT.whisperGM(`Blocked: you do not control <b>${RT.esc(ctx.ch.get('name'))}</b>.`);
        }
        const dm = RT.charData(ctx.ch.id);
        let count=0; Object.entries(dm).forEach(([nm,r])=>{ if(r.rest===tier){ r.cur = r.max; RT.syncBar(ctx.token || RT.getAnyTokenForChar(ctx.ch.id), ctx.ch, nm, r); count++; }});
        RT.notifyByKind(ctx.ch, `${tier}-rest reset ${count} resource(s) to max.`, msg.playerid, 'reset');
        return;
      }

      // Unknown
      RT.whisperGM(`Unknown subcommand. Try <code>${RT.CMD} help</code>.`);
    });
  });
});
