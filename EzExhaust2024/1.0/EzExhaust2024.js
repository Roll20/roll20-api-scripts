// EzExhaust2024 (D&D 5e 2024) — v1.0
// Created by Kahooty, licensed under MIT
//
// Commands:
//   !exh <character name> <#|clear>
//   !exh config

(() => {
  'use strict';

  const SCRIPT = { NAME: 'EzExhaust2024', VERSION: '1.0', STATEKEY: 'EzExhaust2024' };

  // rules per 2024
  const MAX_EXHAUSTION = 6;
  const PENALTY_PER_LEVEL = 2;

  // config (only cosmetic/sheet fields)
  const DEFAULTS = Object.freeze({
    tokenMarker: 'sleepy',          // marker for levels 1–5
    showMarkerNumber: true,
    adjustSpellDC: true,
    sheetAttr: {
      globalAbilityChecks: 'global_skill_mod',
      globalSaves:         'global_save_mod',
      globalAttacks:       'global_attack_mod',
      globalSpellDC:       'global_spell_dc_mod'
    }
  });

  const ensureState = () => {
    state[SCRIPT.STATEKEY] = state[SCRIPT.STATEKEY] || {};
    const S = state[SCRIPT.STATEKEY];
    if (!S.config) S.config = JSON.parse(JSON.stringify(DEFAULTS));
    // rules are fixed (not user-configurable)
    delete S.config.maxExhaustion;
    delete S.config.perLevelPenalty;
    return S;
  };
  const getConfig = () => ensureState().config;

  const say = (msg, who = 'gm') => sendChat(SCRIPT.NAME, (who === 'gm' ? `/w gm ${msg}` : msg));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const getOrCreateAttr = (charId, name) => {
    if (!name) return null;
    let a = findObjs({ _type: 'attribute', _characterid: charId, name })[0];
    if (!a) a = createObj('attribute', { _characterid: charId, name, current: '' });
    return a;
  };
  const setAttrToSignedNumber = (attr, n) => {
    if (!attr) return;
    const str = n === 0 ? '' : (n > 0 ? `+${n}` : `${n}`);
    attr.set({ current: str });
  };

  // token markers
  const getAllTokenMarkers = () => {
    try { return JSON.parse(Campaign().get('token_markers') || '[]'); } catch { return []; }
  };
  const resolveMarkerTag = (key) => {
    const all = getAllTokenMarkers();
    let m = all.find(x => x.tag === key) || all.find(x => (x.name||'').toLowerCase() === String(key).toLowerCase());
    return m ? m.tag : key;
  };
  const removeMarkerByTag = (tok, tag) => {
    const list = (tok.get('statusmarkers') || '').split(',').filter(Boolean);
    const cleaned = list.filter(m => !(m === tag || m.startsWith(`${tag}@`)));
    tok.set('statusmarkers', cleaned.join(','));
  };
  const addMarkerWithLevel = (tok, tag, level, showNumber) => {
    const entry = (showNumber && level > 0) ? `${tag}@${level}` : tag;
    const list = (tok.get('statusmarkers') || '').split(',').filter(Boolean);
    list.push(entry);
    tok.set('statusmarkers', list.join(','));
  };

  // fuzzy character find
  const levenshtein = (a, b) => {
    a = (a||'').toLowerCase(); b = (b||'').toLowerCase();
    const dp = Array(b.length + 1).fill(0).map((_, i) => [i]);
    for (let j = 0; j <= a.length; j++) dp[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        dp[i][j] = Math.min(
          dp[i-1][j] + 1,
          dp[i][j-1] + 1,
          dp[i-1][j-1] + (a[j-1] === b[i-1] ? 0 : 1)
        );
      }
    }
    return dp[b.length][a.length];
  };
  const findCharacterFuzzy = (name) => {
    const exact = findObjs({ _type: 'character', name })[0];
    if (exact) return exact;
    const chars = findObjs({ _type: 'character' });
    const lc = name.toLowerCase();

    let pool = chars.filter(c => (c.get('name')||'').toLowerCase() === lc || (c.get('name')||'').toLowerCase().startsWith(lc));
    if (pool.length === 1) return pool[0];
    pool = chars.filter(c => (c.get('name')||'').toLowerCase().includes(lc));
    if (pool.length === 1) return pool[0];
    if (pool.length === 0) pool = chars;

    let best = null, bestD = Infinity;
    pool.forEach(c => {
      const d = levenshtein(name, c.get('name')||'');
      if (d < bestD) { bestD = d; best = c; }
    });
    return best;
  };

  // controllers + whispers
  const getControllingPlayers = (charObj) => {
    const raw = (charObj.get('controlledby') || '').trim();
    if (raw === 'all' || raw === '') {
      // 'all' => everybody can control; '' => no explicit controllers (GM implicitly)
      return findObjs({ _type: 'player' }) || [];
    }
    const ids = raw.split(',').map(s => s.trim()).filter(Boolean);
    const players = ids.map(id => getObj('player', id)).filter(Boolean);
    return players;
  };
  const whisperToPlayer = (player, html) => {
    const name = player.get('displayname') || player.get('_displayname') || 'Player';
    sendChat(SCRIPT.NAME, `/w "${name}" ${html}`);
  };
  const whisperToControllers = (charObj, html) => {
    const players = getControllingPlayers(charObj);
    const sent = new Set();
    players.forEach(p => {
      const pid = p.id;
      if (!sent.has(pid)) { sent.add(pid); whisperToPlayer(p, html); }
    });
  };
  const speedPenaltyByLevel = (level) => {
    // Levels 1–5: -5 ft per level; otherwise 0 for 0 or 6+
    if (level >= 1 && level <= 5) return -5 * level;
    return 0;
  };
  const whisperSpeedPenalty = (charObj, level) => {
    const pen = speedPenaltyByLevel(level);
    if (pen === 0) return;
    const cname = _.escape(charObj.get('name') || 'Unknown');
    const html = `<div style="font-family:monospace">
<b>${cname}</b> — Exhaustion <b>${level}</b><br>
Movement Speed Penalty: <b>${pen} ft</b>
</div>`;
    whisperToControllers(charObj, html);
  };

  // level 6: death helpers
  const enactDeath = (charId) => {
    const hpAttr = findObjs({ _type: 'attribute', _characterid: charId, name: 'hp' })[0];
    if (hpAttr) hpAttr.set({ current: 0 });
    const toks = findObjs({ _type: 'graphic', _subtype: 'token', represents: charId });
    toks.forEach(tok => tok.set('bar1_value', 0));
  };

  const clearAllExhaustionMarkers = (charId, cfg) => {
    const sleepy   = resolveMarkerTag(cfg.tokenMarker);
    const pummeled = resolveMarkerTag('pummeled');
    const dead     = resolveMarkerTag('dead');
    findObjs({ _type: 'graphic', _subtype: 'token', represents: charId }).forEach(tok => {
      removeMarkerByTag(tok, sleepy);
      removeMarkerByTag(tok, pummeled);
      removeMarkerByTag(tok, dead); // ensure death icon drops when lowering from 6
    });
  };

  const applyExhaustion = (charObj, rawLevel, cfg) => {
    const level = clamp(parseInt(rawLevel, 10) || 0, 0, MAX_EXHAUSTION);
    const S = cfg.sheetAttr;

    // clean before setting fresh state
    clearAllExhaustionMarkers(charObj.id, cfg);

    if (level === MAX_EXHAUSTION) {
      // clear mods (character is dead at 6; no ongoing penalties needed)
      setAttrToSignedNumber(getOrCreateAttr(charObj.id, S.globalAbilityChecks), 0);
      setAttrToSignedNumber(getOrCreateAttr(charObj.id, S.globalSaves),         0);
      setAttrToSignedNumber(getOrCreateAttr(charObj.id, S.globalAttacks),       0);
      if (cfg.adjustSpellDC && S.globalSpellDC) {
        setAttrToSignedNumber(getOrCreateAttr(charObj.id, S.globalSpellDC), 0);
      }

      enactDeath(charObj.id);

      // set pummeled@6 and 'dead' icon
      const pummeled = resolveMarkerTag('pummeled');
      const dead     = resolveMarkerTag('dead');
      findObjs({ _type: 'graphic', _subtype: 'token', represents: charObj.id }).forEach(tok => {
        addMarkerWithLevel(tok, pummeled, 6, true);
        addMarkerWithLevel(tok, dead, 0, false);
      });

      // no speed whisper at level 6
      return level;
    }

    // levels 0–5: penalty = –2 × level (exactly)
    const penalty = -(PENALTY_PER_LEVEL * level);
    setAttrToSignedNumber(getOrCreateAttr(charObj.id, S.globalAbilityChecks), penalty);
    setAttrToSignedNumber(getOrCreateAttr(charObj.id, S.globalSaves),         penalty);
    setAttrToSignedNumber(getOrCreateAttr(charObj.id, S.globalAttacks),       penalty);
    if (cfg.adjustSpellDC && S.globalSpellDC) {
      setAttrToSignedNumber(getOrCreateAttr(charObj.id, S.globalSpellDC), penalty);
    }

    // sleepy@level
    const sleepy = resolveMarkerTag(cfg.tokenMarker);
    findObjs({ _type: 'graphic', _subtype: 'token', represents: charObj.id }).forEach(tok => {
      if (level > 0) addMarkerWithLevel(tok, sleepy, level, cfg.showMarkerNumber);
    });

    // whisper movement penalty to controllers for levels 1–5
    whisperSpeedPenalty(charObj, level);

    return level;
  };

  const renderConfig = (cfg) =>
    `<div style="font-family:monospace">
<b>tokenMarker</b>: ${_.escape(cfg.tokenMarker)}<br>
<b>showMarkerNumber</b>: ${cfg.showMarkerNumber}<br>
<b>adjustSpellDC</b>: ${cfg.adjustSpellDC}<br>
<b>sheetAttr.globalAbilityChecks</b>: ${_.escape(cfg.sheetAttr.globalAbilityChecks)}<br>
<b>sheetAttr.globalSaves</b>: ${_.escape(cfg.sheetAttr.globalSaves)}<br>
<b>sheetAttr.globalAttacks</b>: ${_.escape(cfg.sheetAttr.globalAttacks)}<br>
<b>sheetAttr.globalSpellDC</b>: ${_.escape(cfg.sheetAttr.globalSpellDC)}<br>
<hr>
<b>Rules (fixed)</b>: max exhaustion = 6; penalty = -2×level; level 6 = death + pummeled + dead marker.
</div>`;

  const handleChat = (msg) => {
    if (msg.type !== 'api') return;
    const content = msg.content.trim();
    if (!content.startsWith('!exh')) return;

    const parts = content.split(/\s+/);
    parts.shift();

    // config view only (read-only for fixed rules)
    if (parts[0] && parts[0].toLowerCase() === 'config') {
      const cfg = getConfig();
      say(`<div><b>${SCRIPT.NAME} v${SCRIPT.VERSION} config</b></div>${renderConfig(cfg)}`);
      return;
    }

    // usage
    if (parts.length < 2) {
      say('Usage: <code>!exh &lt;character name&gt; &lt;#|clear&gt;</code><br>Example: <code>!exh Tallus 2</code> or <code>!exh Tallus clear</code>', msg.who);
      return;
    }

    const name = parts.shift();
    const op   = parts.shift();
    const cfg  = getConfig();

    const charObj = findCharacterFuzzy(name);
    if (!charObj) { say(`No character found resembling <b>${_.escape(name)}</b>.`); return; }

    if (op.toLowerCase && op.toLowerCase() === 'clear') {
      applyExhaustion(charObj, 0, cfg);
      say(`Exhaustion cleared for <b>${_.escape(charObj.get('name'))}</b>.`);
      return;
    }

    if (!/^\d{1,2}$/.test(op)) {
      say('Level must be an integer (0–6) or <code>clear</code>.');
      return;
    }

    const clamped = applyExhaustion(charObj, parseInt(op, 10), cfg);
    say(`Exhaustion set to <b>${clamped}</b> for <b>${_.escape(charObj.get('name'))}</b>.${clamped === 6 ? ' (Death applied.)' : ''}`);
  };

  on('ready', () => {
    ensureState();
    on('chat:message', handleChat);
    log(`${SCRIPT.NAME} v${SCRIPT.VERSION} ready — Command: !exh`);
  });
})();
