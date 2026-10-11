// CohorsCthulhuCompanion.js
// Cohors Cthulhu Companion - optional API script for the Cohors Cthulhu
// character sheet (Roll20).
//
// Version:      1.0.0
// Last updated: 2026-10-09
// Author:       Han Vanholder
// Docs:         README.md in this script's folder; !cchelp in game
//
// WHAT IT DOES: adds what a character sheet can't do on its own. The sheet
// works without it. Each section below explains its part:
//   MOMENTUM POOL  - the party's shared Momentum (0-6), kept in step by rolls
//   THREAT POOL    - the GM's Threat, kept in step by rolls
//   TOKEN ACTIONS  - a token action for every weapon and spell
//   NPC IMPORT     - characters from NPC stat blocks written as JSON
// Needs a Pro game (for Mods); no other scripts are needed.
//
// SYNTAX (chat commands):
//   !cchelp                               - list the commands
//   !momentum / !threat                   - announce the pool
//   !momentum-set N / !threat-set N       - GM only: set the pool
//   !momentum-adjust N / !threat-adjust N - GM only: add N (negative to
//                                           subtract)
//   !cctokenactions [clear|off|on]        - GM only: see TOKEN ACTIONS
//   !ccimport handout|<Handout Name>      - GM only: see NPC IMPORT
//   !ccimport tokens, !ccimport token|<Character>[|<Token>]
//   !ccdebugon / !ccdebugoff              - GM only: debug logging to the API
//                                           console (!ccdebug: status)
//
// CONFIGURATION: the CONFIG block at the start of the script's body.
//
// FOR OTHER SCRIPTS: CohorsCthulhuCompanion.importHooks is an array of
// functions; the NPC import calls each with the new character's id.
// Everything else is private to this script, and everything it stores is in
// state.CohorsCthulhuCompanion.

// The script's one global.
var CohorsCthulhuCompanion = CohorsCthulhuCompanion || {}; // eslint-disable-line no-var
CohorsCthulhuCompanion.version = '1.0.0';
CohorsCthulhuCompanion.lastUpdated = '2026-10-09';
CohorsCthulhuCompanion.importHooks = CohorsCthulhuCompanion.importHooks || [];

on('ready', () => {
  'use strict';

  // ===========================================================================
  // CONFIGURATION - change these to suit your game, then save the script.
  // ===========================================================================
  const CONFIG = {
    // Largest Momentum pool; the rules' cap is 6.
    momentumMax: 6,
    // Names of the pools in chat and the Turn Order. A token with this name
    // on the players' page shows the pool on bar 1.
    momentumLabel: 'Momentum Pool',
    threatLabel: 'Threat Pool',
    // Where the NPC import looks for token images: a Journal folder (as
    // ModifyTokenImage makes them) and a page holding named tokens.
    tokenImagesFolder: 'Token Images',
    tokenLibraryPage: 'Token Library',
    // NPC name -> token image URL (an image uploaded to Roll20), looked up
    // before the folder, page and token markers. Underscores in a name match
    // spaces. A handout with this name, holding the same JSON in its GM Notes
    // (or Notes), adds to and overrides tokenMap.
    tokenMap: {},
    tokenMapHandout: 'Token Map',
  };

  // ===========================================================================
  // SHARED
  // ===========================================================================

  // msg.who for a GM ends in " (GM)", which /w can't resolve; whisper to the
  // bare name.
  const whisperTo = (who) => String(who || '').replace(/\s*\(GM\)\s*$/, '');

  const {version, lastUpdated} = CohorsCthulhuCompanion;
  const isGMMsg = (msg) => playerIsGM(msg.playerid);

  // Everything the script keeps between sessions. Versions before 1.0.0 used
  // separate keys (state.CCMomentum, CCThreat, CCTokenActions, CCDebug,
  // CCNpcLock); their pools and settings move here once.
  const store = (() => {
    const s = state.CohorsCthulhuCompanion = state.CohorsCthulhuCompanion || {};
    const legacy = {momentum: 'CCMomentum', threat: 'CCThreat', tokenActions: 'CCTokenActions', debug: 'CCDebug'};
    Object.keys(legacy).forEach((key) => {
      if (state[legacy[key]] && !s[key]) { s[key] = state[legacy[key]]; }
      delete state[legacy[key]];
    });
    delete state.CCNpcLock;
    ['momentum', 'threat'].forEach((key) => {
      if (!s[key] || typeof s[key].pool !== 'number') { s[key] = {pool: 0}; }
    });
    s.tokenActions = s.tokenActions || {auto: true};
    s.debug = {on: Boolean(s.debug && s.debug.on)};
    return s;
  })();

  // Debug logging: !ccdebugon / !ccdebugoff (GM only, any case) switch it,
  // !ccdebug shows the setting. Off by default and kept across restarts;
  // errors are always logged. Each section logs under its own tag.
  const debugLog = (tag) => (text) => {
    if (store.debug.on) { log(`[${tag}] ${text}`); }
  };
  const debug = debugLog('Cohors Cthulhu');

  on('chat:message', (msg) => {
    debug(`chat:message type=${msg.type} rolltemplate=${msg.rolltemplate} content=${JSON.stringify(msg.content)} inlinerolls=${JSON.stringify(msg.inlinerolls)}`);
    const match = /^!ccdebug(on|off)?$/i.exec(String(msg.content || '').trim());
    if (!match) { return; }
    const isGM = isGMMsg(msg);
    if (isGM && match[1]) { store.debug.on = match[1].toLowerCase() === 'on'; }
    const status = store.debug.on ? 'ON' : 'OFF';
    if (isGM) { log(`[Cohors Cthulhu] debug logging ${status}`); }
    const text = isGM ?
      `Cohors Cthulhu debug logging is ${status}. Output goes to the API console.` :
      'Only the GM can change Cohors Cthulhu debug logging.';
    sendChat('CC Debug', `/w "${whisperTo(msg.who)}" ${text}`, null, {noarchive: true});
  });

  // !cchelp: the commands the caller can use, whispered.
  on('chat:message', (msg) => {
    if (msg.type !== 'api' || !/^!cchelp$/i.test(String(msg.content || '').trim())) { return; }
    const rows = [
      ['!momentum / !threat', 'Announce the pool'],
    ];
    if (isGMMsg(msg)) {
      rows.push(
        ['!momentum-set N / !threat-set N', 'Set the pool to N'],
        ['!momentum-adjust N / !threat-adjust N', 'Add N (negative to subtract)'],
        ['!cctokenactions', 'Rebuild weapon and spell token actions (selected tokens, or every character)'],
        ['!cctokenactions clear / off / on', 'Remove them / pause / resume automatic updates'],
        ['!ccimport handout|Name', 'Import the NPC JSON in that handout\'s GM Notes'],
        ['!ccimport tokens', 'List the token images the import can find'],
        ['!ccimport token|Character|Token', 'Give an existing character its token'],
        ['!ccdebugon / !ccdebugoff / !ccdebug', 'Debug logging to the API console'],
      );
    }
    const cells = rows.map(([command, effect]) => `{{${command}=${effect}}}`).join(' ');
    sendChat('Cohors Cthulhu', `/w "${whisperTo(msg.who)}" &{template:default} {{name=Cohors Cthulhu Companion ${version}}} ${cells}`, null, {noarchive: true});
  });

  const formatDelta = (delta) => (delta > 0 ? `+${delta}` : `${delta}`);

  // The value of one of the sheet's hidden signal rolls (recognised by
  // msg.rolltemplate, value from the inline roll's total), or null for any
  // other message.
  const signalValue = (msg, templateName, tag) => {
    if (msg.rolltemplate !== templateName) { return null; }
    const roll = Array.isArray(msg.inlinerolls) ? msg.inlinerolls[0] : null;
    const total = roll && roll.results && roll.results.total;
    if (!Number.isFinite(total)) {
      log(`[${tag}] ${templateName} message without a usable inline roll - raw msg: ${JSON.stringify(msg)}`);
      return null;
    }
    return total;
  };

  // Shows a pool on bar1 of any graphic on the current page named after it
  // ("Momentum Pool", optional) and as an entry in the Turn Order. max, if
  // given, is bar1's max, so the bar shows a fill fraction.
  // The Turn Order entry is a custom one: Roll20 only shows an entry whose id
  // is "-1" or a token's id, so the entry is found by its label. Versions
  // before 1.0.0 used their own ids (legacyId), which Roll20 never showed;
  // those entries are replaced.
  const showPool = (label, legacyId, value, max, poolDebug) => {
    const campaign = Campaign();
    if (!campaign) { return; }
    const text = max ? `${value}/${max}` : `${value}`;
    const page = campaign.get('playerpageid');
    if (page) {
      (findObjs({_type: 'graphic', _pageid: page}) || [])
        .filter((token) => String(token.get('name') || '').trim().toLowerCase() === label.toLowerCase())
        .forEach((token) => {
          poolDebug(`display: token ${token.id} bar1 = ${text}`);
          token.set({
            bar1_value: value,
            bar1_max: max || value,
            tooltip: `${label}: ${text}`,
          });
        });
    }

    let turnOrder = [];
    try {
      turnOrder = JSON.parse(campaign.get('turnorder') || '[]');
      if (!Array.isArray(turnOrder)) { turnOrder = []; }
    } catch (err) {
      turnOrder = [];
    }
    const entry = {id: '-1', pr: String(value), custom: label, formula: ''};
    const isOurs = (item) => item && (item.id === legacyId ||
      (String(item.id) === '-1' && String(item.custom || '').trim().toLowerCase() === label.toLowerCase()));
    // Update the entry in place, or add it at the end: the first entry is the
    // current turn. Any duplicates are dropped.
    const index = turnOrder.findIndex(isOurs);
    poolDebug(`display: Turn Order entry ${index === -1 ? 'added' : 'updated'} (${entry.pr})`);
    if (index === -1) {
      turnOrder.push(entry);
    } else {
      turnOrder = turnOrder.filter((item, i) => i === index || !isOurs(item));
      turnOrder[turnOrder.findIndex(isOurs)] = entry;
    }
    campaign.set('turnorder', JSON.stringify(turnOrder));
  };

  // Each pool's refresh, so both entries come back when the GM opens the Turn
  // Order (it may have been cleared since).
  const poolRefreshers = [];
  on('change:campaign:initiativepage', (campaign) => {
    if (campaign.get('initiativepage')) { poolRefreshers.forEach((refresh) => refresh()); }
  });

  // ===========================================================================
  // MOMENTUM POOL
  //
  // Keeps the party's shared Momentum pool (0-6) in the API's persistent
  // state. The sheet sends a hidden signal roll on every roll that generates
  // or spends Momentum (ccSendMomentumSignal in
  // source/views/_global_sheetworker.pug):
  //   ccmomentumsignal: a signed delta (+ generated, - spent). Momentum that
  //   doesn't fit under the cap is announced as lost.
  //   ccmomentumspendsignal: a cost (bought d20s, or a roll's net spend).
  //   Whatever the pool can't cover becomes Threat, point for point.
  // Every change is announced in chat and shown on a "Momentum Pool" graphic
  // and in the Turn Order (showPool).
  // ===========================================================================
  {
    const debug = debugLog('CCMomentum');
    const LEGACY_TURN_ORDER_ID = '-ccmomentum-pool';
    const LABEL = CONFIG.momentumLabel;
    const MAX_POOL = CONFIG.momentumMax;

    const getPool = () => Number(store.momentum.pool) || 0;

    const setPool = (value) => {
      store.momentum.pool = Math.min(MAX_POOL, Math.max(0, Math.round(Number(value) || 0)));
    };

    const refreshDisplays = () => showPool(LABEL, LEGACY_TURN_ORDER_ID, getPool(), MAX_POOL, debug);

    const announce = (note) => {
      const value = getPool();
      const suffix = note ? ` (${note})` : '';
      sendChat(LABEL, `&{template:default} {{name=${LABEL}}} {{Current=${value}/${MAX_POOL}${suffix}}}`);
      refreshDisplays();
    };

    // Applies delta, clamped to 0-6, and returns the actual change.
    const applyDelta = (delta) => {
      const before = getPool();
      setPool(before + delta);
      return getPool() - before;
    };

    // Spends what the pool has and sends the rest as a ccthreatsignal, the
    // same signal the sheet sends.
    const handleMomentumSpend = (cost) => {
      const pool = getPool();
      const spend = Math.min(cost, pool);
      const shortfall = cost - spend;
      debug(`spend ${cost}: pool ${pool} -> ${pool - spend}, paid ${spend}, shortfall ${shortfall}${shortfall > 0 ? ' sent as Threat' : ''}`);
      if (spend > 0) {
        const actualDelta = applyDelta(-spend);
        if (actualDelta !== 0) {
          announce(`${formatDelta(actualDelta)}, spent`);
        }
      }
      if (shortfall > 0) {
        sendChat('API', `/w gm &{template:ccthreatsignal} {{ccthreatdelta=[[0+${shortfall}]]}}`);
      }
    };

    on('chat:message', (msg) => {
      // Signed delta from a roll; Momentum past the cap is announced as lost.
      const delta = signalValue(msg, 'ccmomentumsignal', 'CCMomentum');
      if (delta !== null) {
        const before = getPool();
        const actualDelta = delta ? applyDelta(delta) : 0;
        const lost = delta > 0 ? delta - actualDelta : 0;
        debug(`ccmomentumsignal ${formatDelta(delta)}: pool ${before} -> ${getPool()}${lost > 0 ? `, ${lost} lost (cap ${MAX_POOL})` : ''}`);
        if (lost > 0) {
          announce(`${actualDelta ? `${formatDelta(actualDelta)}, ` : ''}${lost} lost - pool full`);
        } else if (actualDelta !== 0) {
          announce(formatDelta(actualDelta));
        }
        return;
      }

      // A cost the pool may not cover.
      const cost = signalValue(msg, 'ccmomentumspendsignal', 'CCMomentum');
      if (cost !== null) {
        debug(`ccmomentumspendsignal ${cost}`);
        if (cost > 0) {
          handleMomentumSpend(cost);
        }
        return;
      }

      const trimmed = String(msg.content || '').trim();
      const [command, ...args] = trimmed.split(/\s+/);
      if (!command) { return; }
      if (/^!(cc)?momentum/.test(command)) {
        debug(`command ${trimmed} by ${msg.who} (GM: ${playerIsGM(msg.playerid)}), pool ${getPool()}`);
      }

      // Testing aliases; GM-only since they change the pool.
      if ((command === '!ccmomentum-adjust' || command === '!ccmomentum-spend') && !playerIsGM(msg.playerid)) {
        sendChat(LABEL, `/w "${whisperTo(msg.who)}" Only the GM can use ${command}.`);
        return;
      }

      // e.g. `!ccmomentum-adjust 2`: same as the delta signal.
      if (command === '!ccmomentum-adjust') {
        const adjustment = Number(args[0]);
        if (!Number.isFinite(adjustment) || adjustment === 0) { return; }
        const actualDelta = applyDelta(adjustment);
        if (actualDelta !== 0) {
          announce(formatDelta(actualDelta));
        }
        return;
      }

      // e.g. `!ccmomentum-spend 4`: same as the spend signal.
      if (command === '!ccmomentum-spend') {
        const spend = Number(args[0]);
        if (!Number.isFinite(spend) || spend <= 0) { return; }
        handleMomentumSpend(spend);
        return;
      }

      if (command === '!momentum') {
        announce();
        return;
      }

      if (command === '!momentum-set') {
        if (!playerIsGM(msg.playerid)) {
          sendChat(LABEL, `/w "${whisperTo(msg.who)}" Only the GM can set the Momentum pool directly.`);
          return;
        }
        const value = Number(args[0]);
        if (!Number.isFinite(value)) {
          sendChat(LABEL, `/w "${whisperTo(msg.who)}" Usage: !momentum-set <number>`);
          return;
        }
        setPool(value);
        announce('set by GM');
        return;
      }

      if (command === '!momentum-adjust') {
        if (!playerIsGM(msg.playerid)) {
          sendChat(LABEL, `/w "${whisperTo(msg.who)}" Only the GM can manually adjust the Momentum pool.`);
          return;
        }
        const adjustment = Number(args[0]);
        if (!Number.isFinite(adjustment)) {
          sendChat(LABEL, `/w "${whisperTo(msg.who)}" Usage: !momentum-adjust <number, may be negative>`);
          return;
        }
        const actualDelta = applyDelta(adjustment);
        announce(`${formatDelta(actualDelta)}, GM correction`);
      }
    });

    // Re-show the Turn Order entry and token on script load.
    poolRefreshers.push(refreshDisplays);
    refreshDisplays();
  }

  // ===========================================================================
  // THREAT POOL
  //
  // Keeps the GM's Threat pool in the API's persistent state. The sheet sends
  // a hidden ccthreatsignal roll:
  //   - +1 per Complication on a player's roll.
  //   - An adversary NPC's roll: one net delta, extra successes less the d20s
  //     it bought (may be negative).
  // The Momentum pool sends one too when a spend comes up short. The pool
  // never drops below 0. Other Threat spends are made with !threat-adjust.
  // Every change is announced in chat and shown on a "Threat Pool" graphic and
  // in the Turn Order (showPool).
  // ===========================================================================
  {
    const debug = debugLog('CCThreat');
    const LEGACY_TURN_ORDER_ID = '-ccthreat-pool';
    const LABEL = CONFIG.threatLabel;

    const getPool = () => Number(store.threat.pool) || 0;

    const setPool = (value) => {
      store.threat.pool = Math.max(0, Math.round(Number(value) || 0));
    };

    const refreshDisplays = () => showPool(LABEL, LEGACY_TURN_ORDER_ID, getPool(), 0, debug);

    const announce = (note) => {
      const value = getPool();
      const suffix = note ? ` (${note})` : '';
      sendChat(LABEL, `&{template:default} {{name=${LABEL}}} {{Current=${value}${suffix}}}`);
      refreshDisplays();
    };

    on('chat:message', (msg) => {
      const delta = signalValue(msg, 'ccthreatsignal', 'CCThreat');
      if (delta !== null) {
        const before = getPool();
        debug(`ccthreatsignal ${formatDelta(delta)}: pool ${before} -> ${Math.max(0, before + delta)}`);
        if (delta !== 0) {
          setPool(getPool() + delta);
          announce(formatDelta(delta));
        }
        return;
      }

      const trimmed = String(msg.content || '').trim();
      const [command, ...args] = trimmed.split(/\s+/);
      if (!command) { return; }
      if (/^!(cc)?threat/.test(command)) {
        debug(`command ${trimmed} by ${msg.who} (GM: ${playerIsGM(msg.playerid)}), pool ${getPool()}`);
      }

      // e.g. `!ccthreat-adjust 2`: same as the signal. GM-only.
      if (command === '!ccthreat-adjust') {
        if (!playerIsGM(msg.playerid)) {
          sendChat(LABEL, `/w "${whisperTo(msg.who)}" Only the GM can use !ccthreat-adjust.`);
          return;
        }
        const adjustment = Number(args[0]);
        if (!Number.isFinite(adjustment) || adjustment === 0) { return; }
        setPool(getPool() + adjustment);
        announce(formatDelta(adjustment));
        return;
      }

      if (command === '!threat') {
        announce();
        return;
      }

      if (command === '!threat-set') {
        if (!playerIsGM(msg.playerid)) {
          sendChat(LABEL, `/w "${whisperTo(msg.who)}" Only the GM can set the Threat pool directly.`);
          return;
        }
        const value = Number(args[0]);
        if (!Number.isFinite(value)) {
          sendChat(LABEL, `/w "${whisperTo(msg.who)}" Usage: !threat-set <number>`);
          return;
        }
        setPool(value);
        announce('set by GM');
        return;
      }

      if (command === '!threat-adjust') {
        if (!playerIsGM(msg.playerid)) {
          sendChat(LABEL, `/w "${whisperTo(msg.who)}" Only the GM can manually adjust the Threat pool.`);
          return;
        }
        const adjustment = Number(args[0]);
        if (!Number.isFinite(adjustment)) {
          sendChat(LABEL, `/w "${whisperTo(msg.who)}" Usage: !threat-adjust <number, may be negative>`);
          return;
        }
        setPool(getPool() + adjustment);
        announce(`${formatDelta(adjustment)}, GM`);
      }
    });

    // Re-show the Turn Order entry and token on script load.
    poolRefreshers.push(refreshDisplays);
    refreshDisplays();
  }

  // ===========================================================================
  // TOKEN ACTIONS
  //
  // Keeps a token action for every weapon and spell on each character, so
  // selecting a token shows its attacks and spells in the token action bar.
  // Each is an ability with "Show as Token Action" set, named after the
  // weapon ("Cast <spell>" for spells), that clicks the same hidden action
  // button as the sheet's roll button:
  // %{<character>|repeating_weapon_<row>_weapon-action}.
  //
  // Abilities it manages are recognised by that action text; any other
  // abilities are left alone. They are updated when a weapon or spell is
  // named, renamed or deleted on the sheet, when a character is renamed, for
  // every character when the API starts, and for imported NPCs.
  //
  // CHAT COMMANDS (GM only):
  //   !cctokenactions        - rebuild for the selected tokens' characters, or
  //                            every character if nothing is selected
  //   !cctokenactions clear  - remove them (selected, or every character)
  //   !cctokenactions off    - stop automatic updates (on: resume)
  // ===========================================================================
  {
    const debug = debugLog('CCTokenActions');

    const SECTIONS = {
      weapon: {button: 'weapon-action', label: (name) => name},
      spell: {button: 'spell-cast-action', label: (name) => `Cast ${name}`},
    };
    const MANAGED = /^%\{[^|}]*\|repeating_(weapon|spell)_[^}]+_(weapon|spell-cast)-action\}$/;
    const ROW_NAME = /^repeating_(weapon|spell)_([^_]+)_name$/;

    // Named weapon and spell rows, in sheet order where Roll20 recorded one.
    const rowsOf = (characterId) => {
      const attrs = findObjs({_type: 'attribute', _characterid: characterId});
      const order = {};
      attrs.forEach((attr) => {
        const m = /^_reporder_repeating_(weapon|spell)$/.exec(attr.get('name'));
        if (m) {
          String(attr.get('current') || '').split(',').forEach((id, i) => { order[`${m[1]}:${id.toLowerCase()}`] = i; });
        }
      });
      return attrs
        .map((attr) => {
          const m = ROW_NAME.exec(attr.get('name'));
          const name = m ? String(attr.get('current') || '').trim() : '';
          return name ? {section: m[1], rowId: m[2], name} : null;
        })
        .filter(Boolean)
        .sort((a, b) => {
          if (a.section !== b.section) { return a.section === 'weapon' ? -1 : 1; }
          const rank = (row) => {
            const i = order[`${row.section}:${row.rowId.toLowerCase()}`];
            return i === undefined ? 999 : i;
          };
          return rank(a) - rank(b);
        });
    };

    const managedAbilities = (characterId) => findObjs({_type: 'ability', _characterid: characterId})
      .filter((ability) => MANAGED.test(String(ability.get('action') || '')));

    // Makes the character's managed abilities match its weapon and spell
    // rows.
    const update = (characterId) => {
      const character = getObj('character', characterId);
      if (!character) { return; }
      const charName = character.get('name');
      const wanted = new Map();
      const counts = {};
      rowsOf(characterId).forEach(({section, rowId, name}) => {
        let label = SECTIONS[section].label(name);
        counts[label] = (counts[label] || 0) + 1;
        if (counts[label] > 1) { label = `${label} (${counts[label]})`; }
        wanted.set(`%{${charName}|repeating_${section}_${rowId}_${SECTIONS[section].button}}`, label);
      });
      let added = 0;
      let removed = 0;
      managedAbilities(characterId).forEach((ability) => {
        const label = wanted.get(ability.get('action'));
        if (label === undefined) {
          ability.remove();
          removed += 1;
          return;
        }
        if (ability.get('name') !== label) { ability.set('name', label); }
        if (!ability.get('istokenaction')) { ability.set('istokenaction', true); }
        wanted.delete(ability.get('action'));
      });
      wanted.forEach((label, action) => {
        createObj('ability', {characterid: characterId, name: label, action, istokenaction: true});
        added += 1;
      });
      debug(`"${charName}": ${added} added, ${removed} removed`);
    };

    const clear = (characterId) => managedAbilities(characterId).forEach((ability) => ability.remove());

    // Deleting a row destroys all of its attributes; wait for the burst to
    // end.
    const pending = {};
    const schedule = (characterId) => {
      if (!store.tokenActions.auto || !characterId) { return; }
      clearTimeout(pending[characterId]);
      pending[characterId] = setTimeout(() => {
        delete pending[characterId];
        update(characterId);
      }, 250);
    };

    const onAttribute = (attr) => {
      if (ROW_NAME.test(String(attr.get('name') || ''))) {
        debug(`${attr.get('name')} changed on ${attr.get('characterid')}`);
        schedule(attr.get('characterid'));
      }
    };
    on('add:attribute', onAttribute);
    on('change:attribute', onAttribute);
    on('destroy:attribute', onAttribute);
    // A rename changes every call's character name.
    on('change:character:name', (character) => schedule(character.id));

    const charactersFor = (msg) => {
      const selected = (msg.selected || [])
        .map((s) => getObj('graphic', s._id))
        .filter((token) => token && token.get('represents'))
        .map((token) => token.get('represents'));
      return selected.length ? [...new Set(selected)] : findObjs({_type: 'character'}).map((c) => c.id);
    };

    on('chat:message', (msg) => {
      if (msg.type !== 'api') { return; }
      const [command, arg] = String(msg.content || '').trim().split(/\s+/);
      if (command !== '!cctokenactions') { return; }
      const reply = (text) => sendChat('Token Actions', `/w "${whisperTo(msg.who)}" ${text}`, null, {noarchive: true});
      if (!playerIsGM(msg.playerid)) {
        reply('Only the GM can manage token actions.');
        return;
      }
      if (arg === 'off' || arg === 'on') {
        store.tokenActions.auto = arg === 'on';
        reply(`Automatic token action updates are ${arg}.`);
        return;
      }
      const ids = charactersFor(msg);
      ids.forEach(arg === 'clear' ? clear : update);
      reply(`${arg === 'clear' ? 'Removed' : 'Updated'} weapon and spell token actions for ${ids.length} character${ids.length === 1 ? '' : 's'}.`);
    });

    // API-made rows don't fire the attribute events, so imported NPCs are
    // updated through the import's hooks.
    CohorsCthulhuCompanion.importHooks.push(update);

    if (store.tokenActions.auto) {
      findObjs({_type: 'character'}).forEach((character) => update(character.id));
    }
  }

  // ===========================================================================
  // NPC IMPORT
  //
  // Creates Roll20 characters from NPC JSON in the format described in
  // npc-import/FORMAT.md (schema: npc-import/schema/npc.schema.json).
  //
  // USAGE: paste one NPC object, or an array of them, into a handout's GM
  // Notes, then run:
  //   !ccimport handout|<Handout Name>
  // A card whispered to the caller lists every NPC created and any warnings.
  //
  // TOKENS: each NPC gets a default token and avatar when an image with its
  // name (or its JSON "token" name) is found: in the token map (CONFIG
  // tokenMap and the "Token Map" handout: name -> image URL), in
  // ModifyTokenImage's Journal folders ("Token Images" > <token name> >
  // handouts with the image as avatar), as a named token on a page called
  // "Token Library", or as a custom token marker (the names are in CONFIG).
  // When none is found, the import card says which names it looked for.
  // !ccimport tokens lists the names found;
  // !ccimport token|<Character Name>[|<Token Name>] sets one for an existing
  // character.
  //
  // Derived fields (base_armour, total_armor, courage, stress_max_base,
  // stress_max) are computed here because createObj doesn't fire the sheet's
  // change workers. The sheet recomputes them on first open
  // (ccRecomputeOnOpen in source/views/_global_sheetworker.pug), which also
  // fills in the keywords and requirements of talents and the details of
  // spells given by name only. If the formulas change, update both places.
  //
  // Each imported character's id is passed to the importHooks functions
  // (token actions, other scripts).
  //
  // Archetype is free text; a value outside the sheet's six options is
  // stored but no option shows as selected.
  // ===========================================================================
  {
    const debug = debugLog('CCImport');
    const ccAttributeNames = ['agility', 'brawn', 'coordination', 'gravitas', 'insight', 'reason', 'will'];
    const ccNpcTiers = ['trooper', 'toughened', 'nemesis'];
    const ccCapitalize = (text) => String(text || '').charAt(0).toUpperCase() + String(text || '').slice(1);
    const ccBonusDamageAttributes = ['brawn', 'insight', 'will'];
    const ccSkillNames = [
      'academia', 'athletics', 'crafting', 'engineering', 'fighting', 'medicine',
      'observation', 'persuasion', 'resilience', 'stealth', 'survival', 'tactics',
    ];

    // Copies of ccWeaponProfiles and ccArmorProfiles
    // (source/views/panels/_weapons_panel.pug, _armor_panel.pug), so known
    // names fill their rows. Keep them in sync.
    const ccWeaponProfiles = {
      'Axe (Melee)': {focus: 'Melee Weapons', reach_range: '2', damage_effects: '3, Vicious', size: 'Minor', qualities: 'Special'},
      'Club': {focus: 'Melee Weapons', reach_range: '2', damage_effects: '2', size: 'Minor', qualities: ''},
      'Cudgel': {focus: 'Melee Weapons', reach_range: '2', damage_effects: '3, Stun', size: 'Major', qualities: ''},
      'Dagger': {focus: 'Melee Weapons', reach_range: '1', damage_effects: '2, Piercing 1', size: 'Minor', qualities: 'Hidden, Subtle'},
      'Dolabra': {focus: 'Melee Weapons', reach_range: '1', damage_effects: '3, Piercing 1', size: 'Minor', qualities: ''},
      'Javelin (Melee)': {focus: 'Melee Weapons', reach_range: '2', damage_effects: '3, Piercing 1', size: 'Minor', qualities: 'Special'},
      'Spear': {focus: 'Melee Weapons', reach_range: '3', damage_effects: '4, Piercing 1', size: 'Major', qualities: ''},
      'Staff': {focus: 'Melee Weapons', reach_range: '3', damage_effects: '2', size: 'Major', qualities: 'Special'},
      'Sword': {focus: 'Melee Weapons', reach_range: '2', damage_effects: '4', size: 'Major', qualities: 'Parrying'},
      'Falx': {focus: 'Melee Weapons', reach_range: '2', damage_effects: '4, Vicious', size: 'Major', qualities: ''},
      'Gladius': {focus: 'Melee Weapons', reach_range: '2', damage_effects: '4, Piercing 1', size: 'Major', qualities: 'Parrying'},
      'Longsword': {focus: 'Melee Weapons', reach_range: '2', damage_effects: '5', size: 'Major', qualities: 'Two-Handed'},
      'Spatha': {focus: 'Melee Weapons', reach_range: '2', damage_effects: '5, Piercing 1', size: 'Major', qualities: 'Two-Handed'},
      'Unarmed': {focus: 'Unarmed', reach_range: '0', damage_effects: '2', size: '', qualities: 'Subtle'},
      'War Axe': {focus: 'Melee Weapons', reach_range: '2', damage_effects: '4, Vicious', size: 'Major', qualities: 'Two-Handed'},
      'Small Shield': {focus: 'Melee Weapons', reach_range: '1', damage_effects: '2, Stun', size: 'Minor', qualities: 'Shield 2'},
      'Large Shield': {focus: 'Melee Weapons', reach_range: '1', damage_effects: '3, Stun', size: 'Major', qualities: 'Shield 3'},
      'Arcuballista': {focus: 'Archery', reach_range: 'Medium', damage_effects: '4, Piercing 1', size: 'Major', qualities: 'Accurate, Reload'},
      'Axe (Thrown)': {focus: 'Thrown Weapons', reach_range: 'Close', damage_effects: '3, Vicious', size: 'Minor', qualities: 'Special'},
      'Bow': {focus: 'Archery', reach_range: 'Medium', damage_effects: '3, Piercing 1', size: 'Major', qualities: 'Subtle'},
      'Bow, Recurve': {focus: 'Archery', reach_range: 'Long', damage_effects: '4, Piercing 1', size: 'Major', qualities: 'Subtle'},
      'Javelin (Thrown)': {focus: 'Thrown Weapons', reach_range: 'Medium', damage_effects: '3, Piercing 1', size: 'Minor', qualities: 'Special'},
      'Pilum': {focus: 'Thrown Weapons', reach_range: 'Close', damage_effects: '4, Piercing 1', size: 'Minor', qualities: 'Special'},
      'Plumbata': {focus: 'Thrown Weapons', reach_range: 'Close', damage_effects: '2, Piercing 1', size: 'Minor', qualities: ''},
      'Sling': {focus: 'Thrown Weapons', reach_range: 'Long', damage_effects: '3, Stun', size: 'Minor', qualities: 'Inaccurate, Subtle, Special'},
    };
    const ccArmorProfiles = {
      'Chainmail / Lorica Hamata': {resistance: '2', qualities: 'Uncomfortable'},
      'Leather Armor': {resistance: '1', qualities: ''},
      'Lorica Segmentata': {resistance: '3', qualities: 'Uncomfortable'},
      'Lorica Squamata': {resistance: '3', qualities: 'Heavy, Uncomfortable'},
    };

    // Copy of ccAttributeBonus (views/_global_sheetworker.pug).
    const ccAttributeBonus = (rating) => {
      const r = Number(rating) || 0;
      return r <= 8 ? 0 : Math.min(5, Math.ceil((r - 7) / 2));
    };

    // Same slug as the sheet's Focus checkbox attribute names (lowercase,
    // non-alphanumeric runs collapsed to '_').
    const focusSlug = (focusName) => String(focusName || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/ /g, '_');

    const setAttr = (characterId, name, value) => {
      if (value === undefined || value === null || value === '') { return; }
      createObj('attribute', {characterid: characterId, name, current: String(value)});
    };

    // generateRowID() isn't available in the API sandbox. This is the common
    // community version: a timestamp-ordered 20-character ID in Roll20's
    // row-ID alphabet.
    const generateUUID = (() => {
      const chars = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
      let lastTime = 0;
      const lastRandom = [];
      return () => {
        let now = Date.now();
        const sameTime = now === lastTime;
        lastTime = now;
        const timeChars = new Array(8);
        for (let i = 7; i >= 0; i--) {
          timeChars[i] = chars.charAt(now % 64);
          now = Math.floor(now / 64);
        }
        let id = timeChars.join('');
        if (sameTime) {
          let i = 11;
          for (; i >= 0 && lastRandom[i] === 63; i--) { lastRandom[i] = 0; }
          lastRandom[i] += 1;
        } else {
          for (let i = 0; i < 12; i++) { lastRandom[i] = Math.floor(64 * Math.random()); }
        }
        for (let i = 0; i < 12; i++) { id += chars.charAt(lastRandom[i]); }
        return id;
      };
    })();
    // Underscores become 'Z', which can make two consecutive IDs identical;
    // repeats are redrawn.
    const issuedRowIds = new Set();
    const generateRowID = () => {
      let id = generateUUID().replace(/_/g, 'Z');
      while (issuedRowIds.has(id)) { id = generateUUID().replace(/_/g, 'Z'); }
      issuedRowIds.add(id);
      return id;
    };

    const createRepeatingRow = (characterId, section, fields) => {
      const rowId = generateRowID();
      Object.keys(fields).forEach((field) => {
        setAttr(characterId, `repeating_${section}_${rowId}_${field}`, fields[field]);
      });
    };

    // Token images, found by name. The API can't browse the Art Library, so
    // they come from, in order (folder and page names from CONFIG):
    //   1. ModifyTokenImage's Journal folders: "Token Images" > a folder named
    //      after the token > handouts whose avatar is the image (size: N in a
    //      handout's GM Notes sets its size, as in ModifyTokenImage);
    //   2. named tokens on a page called "Token Library";
    //   3. custom token markers, named after their uploaded files.
    // Names match ignoring case, accents, punctuation, a file extension and a
    // trailing "standard"/"light" variant: "Deep_One_Shaman_light.png"
    // matches "Deep One Shaman" with variant "light".
    const parseTokenName = (name) => {
      const words = String(name || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/Æ/g, 'AE').replace(/æ/g, 'ae')
        .replace(/\.(png|jpe?g|webp|gif)$/i, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ');
      const variant = ['standard', 'light'].includes(words[words.length - 1]) && words.length > 1 ? words.pop() : '';
      return {key: words.join(' '), variant};
    };

    // "size: 2" or "width: 2; height: 3" in GM Notes, as ModifyTokenImage
    // reads them (in grid squares).
    const parseSizeNotes = (raw) => {
      const pairs = {};
      String(raw || '').replace(/<[^>]+>/g, ';').split(';').forEach((part) => {
        const [key, value] = part.split(':').map((t) => (t || '').trim().toLowerCase());
        if (key && value && Number(value) > 0) { pairs[key] = Number(value); }
      });
      return pairs.size ? {width: pairs.size, height: pairs.size} :
        (pairs.width || pairs.height ? {width: pairs.width || 1, height: pairs.height || 1} : {});
    };

    const readGmNotes = (handout) => new Promise((resolve) => {
      handout.get('gmnotes', (notes) => {
        let text = notes || '';
        try { text = decodeURIComponent(text); } catch (err) { /* plain text */ }
        resolve(text);
      });
    });

    const journalTokenEntries = async () => {
      let tree = [];
      try {
        tree = JSON.parse(Campaign().get('_journalfolder') || '[]');
      } catch (err) {
        tree = [];
      }
      const root = (Array.isArray(tree) ? tree : []).find((f) => f && typeof f === 'object' && f.n === CONFIG.tokenImagesFolder);
      const folders = root && Array.isArray(root.i) ? root.i.filter((f) => f && typeof f === 'object' && f.n) : [];
      const entries = [];
      for (const folder of folders) {
        const handouts = (Array.isArray(folder.i) ? folder.i : [])
          .filter((id) => typeof id === 'string')
          .map((id) => getObj('handout', id))
          .filter((h) => h && h.get('avatar'));
        for (const handout of handouts) {
          const size = parseSizeNotes(await readGmNotes(handout));
          entries.push(Object.assign({}, parseTokenName(folder.n), {
            variant: parseTokenName(`x ${handout.get('name')}`).variant,
            name: folder.n,
            url: handout.get('avatar'),
            source: `${CONFIG.tokenImagesFolder}/${folder.n}/${handout.get('name')}`,
          }, size));
        }
      }
      return entries;
    };

    // Lower case without spaces, for matching the Token Library page.
    const squash = (text) => String(text || '').toLowerCase().replace(/\s+/g, '');

    // A token map name or NPC name as a lookup key: case, accents and extra
    // spaces ignored, and an underscore matches a space ("Deep_One_Shaman" is
    // "Deep One Shaman").
    const tokenMapKey = (name) => String(name || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/_/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

    // The names to look up for a token: each name as given, then without a
    // trailing "(...)" note ("Sacerdos (Priest)" also tries "Sacerdos").
    const tokenMapCandidates = (names) => [...new Set(names.filter(Boolean).flatMap((name) => {
      const text = String(name).trim();
      return [text, text.replace(/\s*\([^()]*\)\s*$/, '')];
    }).filter(Boolean))];

    const readNotes = (handout, field) => new Promise((resolve) => {
      handout.get(field, (notes) => resolve(notes || ''));
    });

    // CONFIG.tokenMap plus the "Token Map" handout's JSON (GM Notes, or Notes
    // if those are empty), as a Map from tokenMapKey to {name, url, source}.
    // Problems are logged and the rest of the map still loads.
    const loadTokenMap = async () => {
      const map = new Map();
      const add = (object, source) => {
        if (!object || typeof object !== 'object' || Array.isArray(object)) {
          log(`[CCImport] token map from ${source} isn't a JSON object of "Name": "URL" pairs - ignored`);
          return;
        }
        Object.keys(object).forEach((name) => {
          const value = object[name];
          const url = typeof value === 'string' ? value : (value && value.url);
          if (!url) { return; }
          map.set(tokenMapKey(name), Object.assign({name, url: String(url).trim(), source},
            value && Number(value.size) > 0 ? {width: Number(value.size), height: Number(value.size)} : {}));
        });
      };
      add(CONFIG.tokenMap || {}, 'CONFIG.tokenMap');
      const handout = findObjs({_type: 'handout', name: CONFIG.tokenMapHandout})[0];
      if (handout) {
        const text = stripHtmlNotes(await readNotes(handout, 'gmnotes')) || stripHtmlNotes(await readNotes(handout, 'notes'));
        try {
          add(text ? JSON.parse(text) : {}, `handout "${CONFIG.tokenMapHandout}"`);
        } catch (err) {
          log(`[CCImport] token map handout "${CONFIG.tokenMapHandout}": JSON parse failed (${err.message}) - ignored`);
        }
      }
      debug(`token map: ${map.size} names`);
      return map;
    };

    const loadTokenLibrary = async () => {
      const entries = await journalTokenEntries();
      findObjs({_type: 'page'})
        .filter((page) => squash(page.get('name')).includes(squash(CONFIG.tokenLibraryPage)))
        .forEach((page) => {
          findObjs({_type: 'graphic', _pageid: page.id}).forEach((graphic) => {
            if (!graphic.get('name') || !graphic.get('imgsrc')) { return; }
            entries.push(Object.assign(parseTokenName(graphic.get('name')),
              {name: graphic.get('name'), url: graphic.get('imgsrc'), source: `page "${page.get('name')}"`}));
          });
        });
      let markers = [];
      try {
        markers = JSON.parse(Campaign().get('_token_markers') || '[]');
      } catch (err) {
        markers = [];
      }
      (Array.isArray(markers) ? markers : []).forEach((marker) => {
        if (!marker || !marker.name || !marker.url) { return; }
        entries.push(Object.assign(parseTokenName(marker.name), {name: marker.name, url: marker.url, source: 'token marker'}));
      });
      debug(`token library: ${entries.length} images`);
      return entries;
    };

    // Everything setupToken looks in: {map, library}.
    const loadTokens = async () => ({map: await loadTokenMap(), library: await loadTokenLibrary()});

    // The requested variant, else an unsuffixed or "standard" one, else any.
    const findTokenImage = (library, wanted, variant) => {
      const {key} = parseTokenName(wanted);
      const matches = library.filter((entry) => entry.key === key);
      return matches.find((e) => e.variant === variant) || matches.find((e) => !e.variant) ||
        matches.find((e) => e.variant === 'standard') || matches[0] || null;
    };

    // Roll20 only accepts its own uploaded images for tokens, in the 'thumb'
    // size.
    const thumbUrl = (url) => {
      const text = String(url || '');
      const m = text.match(/^(.*\/images\/.*\/)(thumb|med|original|max|icon)(\.[a-z]+)(\?.*)?$/i);
      if (m) { return `${m[1]}thumb${m[3]}${m[4] || `?${Date.now()}`}`; }
      return /files\.d20\.io\/images\//.test(text) ? text : null;
    };

    // Gives a character its default token and avatar. spec is the JSON
    // "token": a name, or {name, variant, image, size}; false skips it.
    // tokens is loadTokens()'s result. Looks in the token map first (the JSON
    // token name, then the NPC's name), then the other token images.
    // Returns a short description for the import card, or null; problems go
    // into warnings.
    const setupToken = (character, spec, details, warnings, tokens) => {
      if (spec === false) { return null; }
      const opts = typeof spec === 'string' ? {name: spec} : (spec && typeof spec === 'object' ? spec : {});
      const wanted = opts.name || details.name;
      const lookFor = tokenMapCandidates([opts.name, details.name]);
      const fromMap = () => {
        for (const name of lookFor) {
          const entry = tokens.map.get(tokenMapKey(name));
          debug(`token: token map ${entry ? `has "${entry.name}" for` : 'has nothing for'} "${name}"`);
          if (entry) { return entry; }
        }
        return null;
      };
      const fromLibrary = () => {
        for (const name of lookFor) {
          const entry = findTokenImage(tokens.library, name, opts.variant || 'standard');
          if (entry) { return entry; }
        }
        return null;
      };
      const found = opts.image ?
        {url: opts.image, name: wanted, source: 'JSON image'} :
        fromMap() || fromLibrary();
      if (!found) {
        const names = lookFor.map((name) => `"${name}"`).join(', ');
        debug(`token: nothing found for ${names} (token map: ${tokens.map.size} names, other token images: ${tokens.library.length})`);
        warnings.push(`no token found - looked for ${names} in the token map and token images (see !ccimport tokens)`);
        return null;
      }
      const imgsrc = thumbUrl(found.url);
      if (!imgsrc) {
        warnings.push(`token "${found.name}" (${found.source}) isn't an image uploaded to Roll20 - token not set`);
        return null;
      }
      const page = Campaign().get('playerpageid') || ((findObjs({_type: 'page'})[0] || {}).id);
      const width = 70 * (Number(opts.size) || found.width || 1);
      const height = 70 * (Number(opts.size) || found.height || 1);
      const hideBars = details.adversary;
      const props = {
        _pageid: page,
        layer: 'gmlayer',
        imgsrc,
        left: width / 2,
        top: height / 2,
        width,
        height,
        name: details.name,
        represents: character.id,
        showname: true,
        bar1_value: details.stress,
        bar1_max: details.stressMax,
        bar2_value: 0,
        bar2_max: details.injuryLimit,
        showplayers_bar1: !hideBars,
        showplayers_bar2: !hideBars,
      };
      // A Nemesis is unique, so its Stress bar is linked to the sheet;
      // Trooper and Toughened tokens keep their own, one per copy on the map.
      if (details.npcType === 'nemesis') {
        const stressAttr = findObjs({_type: 'attribute', _characterid: character.id, name: 'stress'})[0];
        if (stressAttr) {
          stressAttr.set('max', String(details.stressMax));
          props.bar1_link = stressAttr.id;
        }
      }
      const graphic = createObj('graphic', props);
      if (!graphic) {
        warnings.push(`Roll20 refused the image for token "${found.name}" (${found.source}) - token not set`);
        return null;
      }
      setDefaultTokenForCharacter(character, graphic);
      character.set('avatar', imgsrc);
      graphic.remove();
      debug(`token: "${details.name}" uses "${found.name}" (${found.source}), ${width}x${height}px`);
      return `token: ${found.name}`;
    };

    // Builds one character from one NPC object. Returns {name, warnings,
    // notes}; problems become warnings, not errors, since a partial import
    // beats none.
    const importNpc = (npc, tokens) => {
      const warnings = [];
      if (!npc || typeof npc !== 'object' || Array.isArray(npc)) {
        return {name: '(invalid entry)', warnings: ['not a JSON object - skipped entirely']};
      }
      if (!npc.name) {
        return {name: '(unnamed)', warnings: ['missing "name" - skipped entirely']};
      }
      if (!npc.attributes || typeof npc.attributes !== 'object') {
        return {name: npc.name, warnings: ['missing "attributes" - skipped entirely']};
      }

      const character = createObj('character', {name: npc.name});
      const id = character.id;

      // The value the sheet's hidden 'sheet version' field sets for a new
      // character.
      setAttr(id, 'sheet_version', '0.1.0');

      // NPC tier. Older files used character_type cannon_fodder/npc; mapped
      // as the sheet migrates them.
      const legacyTypes = {cannon_fodder: 'trooper', npc: 'nemesis'};
      let npcType = npc.npc_type || legacyTypes[npc.character_type] || 'toughened';
      if (!ccNpcTiers.includes(npcType)) {
        warnings.push(`unknown npc_type "${npcType}" - defaulted to "toughened"`);
        npcType = 'toughened';
      }
      setAttr(id, 'character_type', npcType);
      // The sheet's Player/NPC switch.
      setAttr(id, 'npc_sheet', 1);
      setAttr(id, 'spells_type_marker', 'npc');
      setAttr(id, 'npc_allegiance', npc.allegiance === 'ally' ? 'ally' : 'adversary');

      ['archetype', 'culture', 'caste', 'wealth', 'specialization', 'background', 'characteristic', 'injuries', 'traits'].forEach((field) => {
        setAttr(id, field, npc[field]);
      });
      (Array.isArray(npc.truths) ? npc.truths : []).slice(0, 5).forEach((truth, i) => {
        setAttr(id, `truth_${i + 1}`, truth);
      });

      const rituals = Array.isArray(npc.rituals) ? npc.rituals : [];
      const notes = [npc.notes, rituals.length ? `Rituals: ${rituals.join(', ')}` : ''].filter(Boolean).join('\n\n');
      setAttr(id, 'journal_notes', notes);
      setAttr(id, 'npc_escalation', (Array.isArray(npc.escalation_options) ? npc.escalation_options : []).join('\n'));

      // Stat block totals (source/views/panels/_npc_profile_panel.pug).
      const profile = (npc.profile && typeof npc.profile === 'object') ? npc.profile : {};
      const hasBook = (key) => profile[key] !== undefined && profile[key] !== null && profile[key] !== '';
      [['stress', 'npc_stress'], ['injuries', 'npc_injuries'], ['armor', 'npc_armor'], ['courage', 'npc_courage'], ['morale', 'npc_morale'], ['power', 'npc_power']].forEach(([key, attr]) => {
        if (hasBook(key)) { setAttr(id, attr, Number(profile[key])); }
      });

      ccAttributeNames.forEach((attr) => {
        if (npc.attributes[attr] === undefined) {
          warnings.push(`attributes.${attr} missing - defaulted to 0`);
        }
        setAttr(id, `${attr}_rating`, Number(npc.attributes[attr]) || 0);
      });
      ccBonusDamageAttributes.forEach((attr) => {
        setAttr(id, `${attr}_bonus_damage`, ccAttributeBonus(npc.attributes[attr]));
      });

      const skills = (npc.skills && typeof npc.skills === 'object') ? npc.skills : {};
      Object.keys(skills).forEach((skill) => {
        if (!ccSkillNames.includes(skill)) {
          warnings.push(`unknown skill "${skill}" - skipped`);
          return;
        }
        const data = skills[skill] || {};
        setAttr(id, `${skill}_ranks`, Number(data.ranks) || 0);
        (data.focuses || []).forEach((focus) => {
          setAttr(id, `${skill}_focus_${focusSlug(focus)}_known`, 1);
        });
      });

      const talents = Array.isArray(npc.talents) ? npc.talents : [];
      talents.forEach((talent) => {
        if (!talent || !talent.name) {
          warnings.push('a talent entry is missing "name" - skipped');
          return;
        }
        const fields = {name: talent.name};
        if (talent.description) {
          fields.description = talent.description;
        }
        // Keywords and Requirements fill in on first sheet open.
        createRepeatingRow(id, 'talent', fields);
      });

      // A known name's fields are defaults; fields given in the JSON win.
      // Older files may use pre-rename weapon names.
      const renamedWeapons = {'Sword, Falx': 'Falx', 'Sword, Gladius': 'Gladius', 'Sword, Long': 'Longsword', 'Sword, Long, Spatha': 'Spatha', 'Unarmed Strike': 'Unarmed'};
      (Array.isArray(npc.weapons) ? npc.weapons : []).forEach((rawWeapon) => {
        const weapon = Object.assign({}, rawWeapon, {name: renamedWeapons[rawWeapon.name] || rawWeapon.name});
        const resolved = Object.assign({}, ccWeaponProfiles[weapon.name] || {}, weapon);
        if (resolved.type && !['melee', 'ranged', 'mental'].includes(resolved.type)) {
          warnings.push(`weapon "${resolved.name}" has unknown type "${resolved.type}" - left as Auto`);
        }
        createRepeatingRow(id, 'weapon', {
          name: resolved.name,
          attack_type: ['melee', 'ranged', 'mental'].includes(resolved.type) ? resolved.type : '',
          focus: resolved.focus,
          reach_range: resolved.reach_range,
          damage_effects: resolved.damage_effects,
          size: resolved.size,
          qualities: resolved.qualities,
        });
      });

      let totalResistance = 0;
      (Array.isArray(npc.armor) ? npc.armor : []).forEach((armor) => {
        const resolved = Object.assign({}, ccArmorProfiles[armor.name] || {}, armor);
        createRepeatingRow(id, 'armor', {
          name: resolved.name,
          resistance: resolved.resistance,
          qualities: resolved.qualities,
        });
        totalResistance += Number(resolved.resistance) || 0;
      });

      (Array.isArray(npc.special_rules) ? npc.special_rules : []).forEach((rule) => {
        if (!rule || !rule.name) {
          warnings.push('a special rule is missing "name" - skipped');
          return;
        }
        // X fills in from a trailing number on first sheet open.
        createRepeatingRow(id, 'specialrule', {name: rule.name, x: rule.x, description: rule.description});
      });

      // Spells: name only; Skill, Difficulty, Cost, Duration and Category
      // fill in from the sheet's spellbooks on first open.
      const spellcasting = (npc.spellcasting && typeof npc.spellcasting === 'object') ? npc.spellcasting : {};
      if (spellcasting.attribute) {
        setAttr(id, 'spellcasting_type', `npc_${spellcasting.attribute}`);
        setAttr(id, 'spellcasting_attribute', ccCapitalize(spellcasting.attribute));
        setAttr(id, 'base_power', 2);
      }
      if (spellcasting.tradition) {
        setAttr(id, 'magical_tradition', spellcasting.tradition);
        setAttr(id, 'tradition_marker', spellcasting.tradition);
      }
      const spells = Array.isArray(npc.spells) ? npc.spells : [];
      if (spells.length && !spellcasting.tradition) {
        warnings.push('spells listed without spellcasting.tradition - they will not resolve to spell details');
      }
      spells.forEach((spell) => createRepeatingRow(id, 'spell', {name: spell}));

      // Derived fields (see the section comment). A stat block total wins;
      // otherwise the tier formulas apply.
      const brawn = Number(npc.attributes.brawn) || 0;
      const will = Number(npc.attributes.will) || 0;
      const baseArmour = ccAttributeBonus(brawn);
      setAttr(id, 'base_armour', baseArmour);
      setAttr(id, 'total_armor', hasBook('armor') ? Number(profile.armor) : baseArmour + totalResistance);
      setAttr(id, 'courage', hasBook('courage') ? Number(profile.courage) : ccAttributeBonus(will));
      setAttr(id, 'injury_limit', hasBook('injuries') ? Number(profile.injuries) : {trooper: 1, toughened: 2, nemesis: 3}[npcType]);
      if (hasBook('power')) { setAttr(id, 'power_rating', Number(profile.power)); }

      const resilienceRanks = Number((skills.resilience || {}).ranks) || 0;
      const formulaStress = Math.max(brawn, will) + resilienceRanks;
      let stressMaxBase = npcType === 'trooper' ? Math.ceil(formulaStress / 2) : formulaStress;
      if (hasBook('stress')) { stressMaxBase = Number(profile.stress); }
      setAttr(id, 'stress_max_base', stressMaxBase);

      const fatigue = Number(npc.fatigue) || 0;
      setAttr(id, 'fatigue', fatigue);
      setAttr(id, 'stress_max', Math.max(0, stressMaxBase - fatigue));
      setAttr(id, 'stress', Number(npc.stress) || 0);
      // Hidden radios that grey out Stress/Fatigue boxes past the max.
      setAttr(id, 'stress_max_marker', Math.max(0, stressMaxBase - fatigue));
      setAttr(id, 'fatigue_max_marker', stressMaxBase);

      const injuryLimit = hasBook('injuries') ? Number(profile.injuries) : {trooper: 1, toughened: 2, nemesis: 3}[npcType];
      const tokenNote = setupToken(character, npc.token, {
        name: npc.name,
        npcType,
        adversary: npc.allegiance !== 'ally',
        stress: Number(npc.stress) || 0,
        stressMax: Math.max(0, stressMaxBase - fatigue),
        injuryLimit,
      }, warnings, tokens);

      // Token actions and other scripts' hooks (API-made rows don't fire the
      // attribute events).
      CohorsCthulhuCompanion.importHooks.forEach((hook) => {
        try {
          hook(id);
        } catch (err) {
          log(`[CCImport] import hook failed for "${npc.name}": ${err.message}`);
        }
      });

      const count = (list) => (Array.isArray(list) ? list.length : 0);
      debug(`"${npc.name}" (${id}): ${npcType}, ${npc.allegiance || 'adversary'}; ` +
        `${Object.keys(skills).length} skills, ${count(npc.talents)} talents, ${count(npc.weapons)} weapons, ` +
        `${count(npc.armor)} armor, ${count(npc.special_rules)} special rules, ${spells.length} spells; ` +
        `stress_max_base ${stressMaxBase}${hasBook('stress') ? ' (stat block)' : ''}, ` +
        `total_armor ${hasBook('armor') ? Number(profile.armor) : baseArmour + totalResistance}, ` +
        `courage ${hasBook('courage') ? Number(profile.courage) : ccAttributeBonus(will)}; ${warnings.length} warnings`);
      return {name: npc.name, warnings, notes: tokenNote ? [tokenNote] : []};
    };

    // GM Notes are rich-text HTML: <p>, <br> and <div> wrappers, entity-
    // escaped and curly quotes, &nbsp; or U+00A0 indentation. Normalize back
    // to plain JSON.
    const decodeEntities = (text) => text
      .replace(/&nbsp;/gi, ' ')
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, '\'')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
      .replace(/&amp;/gi, '&');

    const stripHtmlNotes = (raw) => decodeEntities(String(raw || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li)>/gi, '\n')
      .replace(/<[^>]+>/g, ''))
      .replace(/[   ]/g, ' ')
      .replace(/[​-‍﻿]/g, '')
      .replace(/[“”„″]/g, '"')
      .replace(/[‘’′]/g, '\'')
      .trim();

    const announceResults = (who, results) => {
      results.forEach((r) => log(`[CCImport] imported "${r.name}"${r.warnings.length ? ` - warnings: ${r.warnings.join('; ')}` : ''}`));
      const lines = results.map((r) => {
        const notes = (r.notes || []).concat(r.warnings);
        return `${r.name}${notes.length ? ` (${notes.join('; ')})` : ''}`;
      });
      sendChat('CCImport', `/w "${whisperTo(who)}" &{template:default} {{name=NPC Import}} {{Imported ${results.length}=${lines.join(' | ')}}}`);
    };

    const runImport = async (who, rawNotes) => {
      const cleaned = stripHtmlNotes(rawNotes);
      if (!cleaned) {
        sendChat('CCImport', `/w "${whisperTo(who)}" That handout's GM Notes are empty.`);
        return;
      }
      let data;
      try {
        data = JSON.parse(cleaned);
      } catch (err) {
        // Show the text around the parse failure, in chat and the API console.
        const pos = Number((String(err.message).match(/position (\d+)/) || [])[1]);
        const near = Number.isFinite(pos) ? cleaned.slice(Math.max(0, pos - 30), pos + 30) : cleaned.slice(0, 60);
        const codes = Number.isFinite(pos) ? ` (character there: U+${cleaned.charCodeAt(pos).toString(16).toUpperCase().padStart(4, '0')})` : '';
        log(`[CCImport] JSON parse failed: ${err.message}${codes}; near: ${JSON.stringify(near)}; raw GM Notes start: ${JSON.stringify(String(rawNotes || '').slice(0, 300))}`);
        sendChat('CCImport', `/w "${whisperTo(who)}" Could not parse JSON from GM Notes: ${err.message}${codes}. Near: ${near.replace(/[{}[\]]/g, ' ')}`);
        return;
      }
      const npcs = Array.isArray(data) ? data : [data];
      debug(`GM Notes: ${String(rawNotes || '').length} characters, ${cleaned.length} after cleanup; ${npcs.length} NPC(s)`);
      if (!npcs.length) {
        sendChat('CCImport', `/w "${whisperTo(who)}" No NPCs found in that JSON.`);
        return;
      }
      // One NPC failing mustn't hide the others' results, and a crash should
      // be reported.
      const tokens = await loadTokens();
      announceResults(who, npcs.map((npc) => {
        try {
          return importNpc(npc, tokens);
        } catch (err) {
          log(`[CCImport] import of "${npc && npc.name}" failed: ${err.stack || err.message}`);
          return {name: (npc && npc.name) || '(unnamed)', warnings: [`IMPORT FAILED part-way (${err.message}) - delete this character and report the error`]};
        }
      }));
    };

    const usage = (who) => {
      sendChat('CCImport', `/w "${whisperTo(who)}" Usage: !ccimport handout|<Handout Name> - paste one NPC object or a JSON array of several into that handout's GM Notes first. See npc-import/FORMAT.md for the data format. Also: !ccimport tokens lists the token images found; !ccimport token|<Character Name>[|<Token Name>] gives an existing character its token.`);
    };

    on('chat:message', (msg) => {
      const content = String(msg.content || '').trim();
      if (!content.startsWith('!ccimport')) { return; }
      debug(`command ${JSON.stringify(msg.content)} by ${msg.who} (GM: ${playerIsGM(msg.playerid)})`);

      // Reading GM Notes and creating characters are GM-only.
      if (!playerIsGM(msg.playerid)) {
        sendChat('CCImport', `/w "${whisperTo(msg.who)}" Only the GM can import NPCs.`);
        return;
      }

      const rest = content.slice('!ccimport'.length).trim();
      if (!rest) { usage(msg.who); return; }

      // Lists the token names the import can use.
      if (rest === 'tokens') {
        loadTokens().then(({map, library}) => {
          const where = (e) => (e.source === 'token marker' ? '' : e.source.startsWith('page') ? ' (page)' : ' (folder)');
          const mapped = [...map.values()].map((e) => e.name.replace(/_/g, ' ')).sort();
          const names = [...new Set(library.map((e) => `${e.name}${where(e)}`))].sort();
          sendChat('CCImport', `/w "${whisperTo(msg.who)}" &{template:default} {{name=Token images (${mapped.length + names.length})}} ` +
            `{{Token map=${mapped.length ? mapped.join(', ') : `none - CONFIG.tokenMap, or a handout "${CONFIG.tokenMapHandout}" with "Name": "URL" JSON in its GM Notes`}}} ` +
            `{{Found=${names.length ? names.join(', ') : `none - add a Journal folder "${CONFIG.tokenImagesFolder}" with a folder per token (as for ModifyTokenImage), a page named "${CONFIG.tokenLibraryPage}" with named tokens, or a custom token marker set`}}}`);
        });
        return;
      }

      // Gives an existing character its token, from its stat block values.
      if (rest.startsWith('token|')) {
        const [charName, tokenName] = rest.slice('token|'.length).split('|').map((p) => p.trim());
        const character = findObjs({_type: 'character', name: charName})[0];
        if (!character) {
          sendChat('CCImport', `/w "${whisperTo(msg.who)}" No character named "${charName}" found.`);
          return;
        }
        const attr = (name) => {
          const obj = findObjs({_type: 'attribute', _characterid: character.id, name})[0];
          return obj ? obj.get('current') : '';
        };
        const warnings = [];
        loadTokens().then((tokens) => {
          const note = setupToken(character, tokenName || charName, {
            name: character.get('name'),
            npcType: attr('character_type'),
            adversary: attr('npc_allegiance') !== 'ally',
            stress: Number(attr('stress')) || 0,
            stressMax: Number(attr('stress_max')) || 0,
            injuryLimit: Number(attr('injury_limit')) || 0,
          }, warnings, tokens);
          sendChat('CCImport', `/w "${whisperTo(msg.who)}" ${charName}: ${note || 'token not set'}${warnings.length ? ` (${warnings.join('; ')})` : ''}`);
        });
        return;
      }

      const [sourceType, ...identifierParts] = rest.split('|');
      const identifier = identifierParts.join('|').trim();
      if (sourceType.trim() !== 'handout' || !identifier) {
        usage(msg.who);
        return;
      }

      const handout = findObjs({_type: 'handout', name: identifier})[0];
      debug(`handout "${identifier}": ${handout ? handout.id : 'not found'}`);
      if (!handout) {
        sendChat('CCImport', `/w "${whisperTo(msg.who)}" No handout named "${identifier}" found.`);
        return;
      }
      // handout.get('gmnotes') is asynchronous and needs a callback.
      handout.get('gmnotes', (gmnotes) => runImport(msg.who, gmnotes));
    });
  }

  // A note to the GM on the first start after installing or updating.
  if (store.installedVersion !== version) {
    sendChat('Cohors Cthulhu', `/w gm Cohors Cthulhu Companion ${version} ${store.installedVersion ? `updated from ${store.installedVersion}` : 'installed'}. Type !cchelp for its commands.`, null, {noarchive: true});
    store.installedVersion = version;
  }

  log(`Cohors Cthulhu Companion ${version} (${lastUpdated}) ready: Momentum pool ${store.momentum.pool}/${CONFIG.momentumMax}, ` +
    `Threat pool ${store.threat.pool}, token actions ${store.tokenActions.auto ? 'automatic' : 'manual'}. ` +
    `Debug logging ${store.debug.on ? 'on' : 'off'} (!ccdebugon / !ccdebugoff).`);
});
