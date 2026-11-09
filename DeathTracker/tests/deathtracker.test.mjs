import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  addCharacter,
  addNpc,
  addPc,
  addToken,
  sheetSaves,
  start,
  storeValue,
  tickSaves,
} from './helpers.mjs';
import { createSandbox } from './roll20-stub.mjs';

test('loads, publishes the DeathTracker object and builds the handouts', () => {
  const api = start();
  const dt = api.sandbox.DeathTracker;
  assert.equal(typeof dt.ObserveTokenChange, 'function');
  assert.equal(typeof dt.check, 'function');
  assert.equal(dt.isManagingDeathSaves(), true);
  const names = api.ofType('handout').map((h) => h.get('name'));
  assert.ok(names.includes('DeathTracker - Help'));
  assert.ok(names.includes('DeathTracker - Command Deck'));
  assert.equal(api.dtState().schemaVersion, 1);
});

test('an NPC at 0 is marked dead, and healing takes the marker away', () => {
  const api = start();
  const goblin = addNpc(api);
  api.setHp(goblin, '0');
  assert.deepEqual(api.markers(goblin), ['dead']);
  assert.equal(api.sandbox.DeathTracker.getStatus(goblin), 'dead');
  api.setHp(goblin, '7');
  assert.deepEqual(api.markers(goblin), []);
  assert.equal(api.sandbox.DeathTracker.getStatus(goblin), 'healthy');
});

test('defect 1: clearing a bar never marks a token dead', () => {
  const api = start();
  const goblin = addNpc(api);
  api.setHp(goblin, '');
  assert.deepEqual(api.markers(goblin), []);
  api.setHp(goblin, 'lots');
  assert.deepEqual(api.markers(goblin), []);
});

test('bloodied at or below the threshold, and the threshold is a setting', () => {
  const api = start();
  const goblin = addNpc(api, { hp: 10, max: 10 });
  api.setHp(goblin, '5');
  assert.deepEqual(api.markers(goblin), ['red']);
  api.setHp(goblin, '6');
  assert.deepEqual(api.markers(goblin), []);
  api.command('!deathtracker set bloodiedPercent 60');
  assert.deepEqual(api.markers(goblin), ['red'], 'tokens are judged again after the change');
  api.command('!deathtracker set bloodiedPercent 0');
  assert.deepEqual(api.markers(goblin), []);
});

test('defect 2 and 7: no NaN tint with a blank maximum, and the own tint comes back at full HP', () => {
  const api = start();
  const t1 = addToken(api, { bar1_value: '10', bar1_max: '' });
  api.setHp(t1, '4');
  assert.equal(t1.get('tint_color'), 'transparent');
  const t2 = addToken(api, { bar1_value: '10', bar1_max: '10', tint_color: '#123456' });
  api.setHp(t2, '5');
  assert.match(t2.get('tint_color'), /^#[0-9a-f]{6}$/);
  assert.notEqual(t2.get('tint_color'), '#123456');
  api.setHp(t2, '10');
  assert.equal(t2.get('tint_color'), '#123456');
});

/** A HealthColors 2.5 stand-in that counts its refreshes */
const sharingHealthColors = () => {
  const hc = { refreshed: 0 };
  hc.ownersChanged = () => {
    hc.refreshed += 1;
  };
  return hc;
};

test('with HealthColors 2.5, it does the colours and effects and DeathTracker the death saves', () => {
  const api = createSandbox({ globals: { HealthColors: sharingHealthColors() } });
  api.ready();
  assert.match(api.allChat(), /HealthColors is installed: DeathTracker handles death saves/);
  const goblin = addNpc(api);
  api.setHp(goblin, '4');
  assert.equal(goblin.get('tint_color'), 'transparent', 'no DeathTracker tint');
  assert.deepEqual(api.spawns, [], 'no DeathTracker effects');
  assert.deepEqual(api.markers(goblin), ['red'], 'the bloodied marker is still added');
  assert.equal(api.sandbox.DeathTracker.isManagingDeathSaves(), true);
});

test('without HealthColors, DeathTracker handles all three', () => {
  const api = start();
  const goblin = addNpc(api);
  api.setHp(goblin, '4');
  assert.match(goblin.get('tint_color'), /^#[0-9a-f]{6}$/);
  assert.equal(api.spawns.length, 1);
});

test('who handles what is shared with HealthColors and changes both Mods', () => {
  const hc = sharingHealthColors();
  const api = start({ globals: { HealthColors: hc } });
  const goblin = addNpc(api);
  api.setHp(goblin, '4');
  api.command('!deathtracker set coloursBy DeathTracker');
  assert.equal(api.sandbox.state.ModOwners.colours, 'DeathTracker');
  assert.equal(hc.refreshed, 1, 'HealthColors is asked to refresh');
  assert.match(goblin.get('tint_color'), /^#[0-9a-f]{6}$/, 'tinted straight away');
  api.command('!deathtracker set coloursBy off');
  assert.equal(goblin.get('tint_color'), 'transparent', 'its own tint comes back');
  api.command('!deathtracker set effectsBy nonsense');
  assert.match(api.allChat(), /not a valid value/);
  assert.equal(api.sandbox.state.ModOwners.effects, undefined);
});

test('when HealthColors handles death saves, DeathTracker adds no 0 HP markers or news', () => {
  const api = start({ globals: { HealthColors: sharingHealthColors() } });
  api.sandbox.state.ModOwners = { deathSaves: 'HealthColors' };
  const { token } = addPc(api);
  api.setHp(token, '0');
  assert.deepEqual(api.markers(token), []);
  assert.doesNotMatch(api.allChat(), /is down and dying/);
  assert.equal(api.sandbox.DeathTracker.isManagingDeathSaves(), false);
  const goblin = addNpc(api);
  api.setHp(goblin, '0');
  assert.deepEqual(api.markers(goblin), [], 'no dead marker either');
  assert.equal(api.sandbox.DeathTracker.getStatus(goblin), 'dead', 'the status is still known');
});

test('hurt and heal effects play on the token page', () => {
  const api = start();
  api.command('!deathtracker set healFx on');
  const goblin = addNpc(api);
  api.setHp(goblin, '4');
  api.setHp(goblin, '8');
  assert.deepEqual(
    api.spawns.map((s) => [s.kind, s.type, s.pageId]),
    [
      ['beam', 'splatter-blood', 'page1'],
      ['point', 'glow-holy', 'page1'],
    ]
  );
});

test('defect 3: PC detection copes with lists, "all" and GM-only control', () => {
  const api = start();
  const a = addToken(api, { name: 'A', controlledby: 'gm1,p1' });
  const b = addToken(api, { name: 'B', controlledby: 'all' });
  const c = addToken(api, { name: 'C', controlledby: 'gm1' });
  for (const tok of [a, b, c]) {
    api.setHp(tok, 0);
  }
  assert.deepEqual(api.markers(a), ['sleepy']);
  assert.deepEqual(api.markers(b), ['sleepy']);
  assert.deepEqual(api.markers(c), ['dead']);
});

test('the sheet decides when nobody controls the character, and the GM can override', () => {
  const api = start();
  const { token: pc } = addPc(api, { controlledby: '' });
  api.setHp(pc, 0);
  assert.deepEqual(api.markers(pc), ['sleepy'], '2024 sheet with the Compact layout is a PC');
  api.setHp(pc, 5);
  api.command('!deathtracker npc', [pc]);
  api.setHp(pc, 0);
  assert.deepEqual(api.markers(pc), ['dead']);
  api.command('!deathtracker set pcDetection players');
  api.command('!deathtracker auto', [pc]);
  api.setHp(pc, 3);
  api.setHp(pc, 0);
  assert.deepEqual(api.markers(pc), ['dead'], 'players-only detection ignores the sheet');
});

test('2024 sheet: dying, then stable after three successes, cleared on heal', () => {
  const api = start();
  const { token, store } = addPc(api, { s: 1, f: 2 });
  api.setHp(token, 0);
  assert.deepEqual(api.markers(token), ['sleepy']);
  assert.deepEqual(sheetSaves(store), { s: 0, f: 0 }, 'old ticks are cleared at the drop');
  tickSaves(api, store, 2, 1);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'dying');
  tickSaves(api, store, 3, 1);
  assert.deepEqual(api.markers(token), ['green']);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'stable');
  api.setHp(token, 4);
  assert.deepEqual(api.markers(token), ['red']);
  assert.deepEqual(sheetSaves(store), { s: 0, f: 0 }, 'healing clears the boxes');
});

test('2024 sheet: a store with no deathSaves yet counts as none made', () => {
  const api = start();
  const { token, store } = addPc(api);
  delete store.attrs.current.hitpoints.deathSaves;
  api.setHp(token, 0);
  api.command('!deathtracker status', [token]);
  assert.match(api.lastChat(), /Death saves: 0 success/);
  assert.equal(
    store.get('current').hitpoints.deathSaves.open,
    true,
    'the sheet shows its death save boxes'
  );
  tickSaves(api, store, 0, 3);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'dead');
  api.setHp(token, 5);
  assert.equal(store.get('current').hitpoints.deathSaves.open, false, 'healing hides them again');
});

test('2024 sheet: three failures kill, and the dead stay dead at 0', () => {
  const api = start();
  const { token, store } = addPc(api);
  api.setHp(token, 0);
  tickSaves(api, store, 0, 4);
  assert.deepEqual(api.markers(token), ['dead']);
  tickSaves(api, store, 0, 0);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'dead');
  api.setHp(token, 1);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'bloodied');
});

test('with sheet clearing off, saves are counted from the drop', () => {
  const api = start();
  api.command('!deathtracker set resetSheetSaves off');
  const { token, store } = addPc(api, { s: 2, f: 2 });
  api.setHp(token, 0);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'dying', 'old ticks do not count');
  assert.deepEqual(sheetSaves(store), { s: 2, f: 2 });
  tickSaves(api, store, 3, 2);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'dying', 'one new success');
  tickSaves(api, store, 0, 0);
  tickSaves(api, store, 3, 0);
  assert.equal(
    api.sandbox.DeathTracker.getStatus(token),
    'stable',
    'cleared boxes lower the start'
  );
});

test('the poll catches death saves when no event arrives', () => {
  const api = start();
  const { token, store } = addPc(api);
  api.setHp(token, 0);
  const value = JSON.parse(JSON.stringify(store.get('current')));
  value.hitpoints.deathSaves.failures = 3;
  store.attrs.current = value;
  api.advance(3500);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'dead');
});

test('2014 sheet: death saves from checkbox attributes', () => {
  const api = start();
  const { character } = addCharacter(api, {
    name: 'Old Hero',
    controlledby: 'p1',
    attrs: { npc: '0', deathsave_succ1: '0', deathsave_succ2: '0', deathsave_succ3: '0' },
  });
  const fails = [1, 2, 3].map((n) =>
    api.add('attribute', {
      _characterid: character.id,
      name: `deathsave_fail${n}`,
      current: '0',
      max: '',
    })
  );
  const token = addToken(api, { represents: character.id });
  api.setHp(token, 0);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'dying');
  for (const a of fails) {
    api.editAttr(a, 'on');
  }
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'dead');
  api.setHp(token, 5);
  assert.deepEqual(
    fails.map((a) => a.get('current')),
    ['0', '0', '0'],
    'healing clears the boxes'
  );
});

test('death saves off: a PC at 0 is dying until healed', () => {
  const api = start();
  api.command('!deathtracker set deathSaves off');
  const { token, store } = addPc(api);
  api.setHp(token, 0);
  tickSaves(api, store, 0, 3);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'dying');
});

test('stable command, and announcements to the GM and the player', () => {
  const api = start();
  const { token } = addPc(api);
  api.setHp(token, 0);
  assert.match(api.allChat(), /\/w gm .*is down and dying/);
  assert.match(api.allChat(), /\/w "Player One" .*is down and dying/);
  api.command('!deathtracker stable', [token]);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'stable');
  assert.match(api.allChat(), /is stable/);
});

test('a PC with tokens on two pages is announced once', () => {
  const api = start();
  const { token, character } = addPc(api);
  const other = addToken(api, {
    _pageid: 'page2',
    name: 'Kildrak',
    represents: character.id,
    bar1_value: 10,
    bar1_max: 10,
    bar1_link: 'hp',
  });
  api.setHp(token, 0);
  api.setHp(other, 0);
  assert.equal(api.sandbox.DeathTracker.getStatus(other), 'dying');
  assert.equal(api.allChat().match(/\/w gm .*is down and dying/g).length, 1);
});

test('massive damage kills a PC outright when the bar goes far enough below 0', () => {
  const api = start();
  api.command('!deathtracker set massiveDamage on');
  const { token } = addPc(api, { hp: 10, max: 10 });
  api.setHp(token, -5);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'dying');
  api.setHp(token, 3);
  api.setHp(token, -10);
  assert.equal(api.sandbox.DeathTracker.getStatus(token), 'dead');
});

test('on death: NPCs go to the GM layer and leave the turn order; restore puts them back', () => {
  const api = start();
  api.command('!deathtracker set deathLayer gmlayer');
  api.command('!deathtracker set deathTurnOrder remove');
  const goblin = addNpc(api);
  const other = addNpc(api, { name: 'Goblin 2' });
  api.campaign.attrs.turnorder = JSON.stringify([
    { id: other.id, pr: 15, custom: '' },
    { id: goblin.id, pr: 12, custom: '' },
  ]);
  api.setHp(goblin, '0');
  assert.equal(goblin.get('layer'), 'gmlayer');
  assert.deepEqual(
    api.turnOrder().map((e) => e.id),
    [other.id]
  );
  api.setHp(goblin, '5');
  assert.equal(goblin.get('layer'), 'gmlayer', 'healing does not move it back');
  api.command('!deathtracker restore', [goblin]);
  assert.equal(goblin.get('layer'), 'objects');
  assert.deepEqual(
    api.turnOrder().map((e) => [e.id, e.pr]),
    [
      [other.id, 15],
      [goblin.id, 12],
    ]
  );
});

test('on death: the Map layer, and PCs only when set for all', () => {
  const api = start();
  api.command('!deathtracker set deathLayer map');
  const { token, store } = addPc(api);
  api.setHp(token, 0);
  tickSaves(api, store, 0, 3);
  assert.equal(token.get('layer'), 'objects');
  api.command('!deathtracker set deathActionsFor all');
  const { token: pc2, store: store2 } = addPc(api, { name: 'Atala' });
  api.setHp(pc2, 0);
  tickSaves(api, store2, 0, 3);
  assert.equal(pc2.get('layer'), 'map');
});

test('custom markers by name, an unknown marker warns, and only DT markers are removed', () => {
  const api = start({ tokenMarkers: [{ tag: 'sheet-unconscious', name: 'Unconscious' }] });
  api.command('!deathtracker set dyingMarker Unconscious');
  assert.equal(api.dtState().settings.dyingMarker, 'sheet-unconscious');
  api.command('!deathtracker set deadMarker nosuchthing');
  assert.match(api.allChat(), /has no marker/);
  api.command('!deathtracker set deadMarker dead');
  const { token } = addPc(api);
  token.attrs.statusmarkers = 'blue,dead';
  api.setHp(token, 0);
  assert.deepEqual(api.markers(token), ['blue', 'dead', 'sheet-unconscious']);
  api.setHp(token, 10);
  assert.deepEqual(api.markers(token), ['blue', 'dead'], "the GM's own markers stay");
});

test('migrates 0.1.8 settings and keeps !dead, !dead config and the custom command', () => {
  const api = start({
    state: {
      DEATHTRACKER: {
        config: {
          command: 'rip',
          death_statusmarker: 'skull',
          half_statusmarker: 'yellow',
          bar: '2',
          pc_unconscious_statusmarker: 'sleepy',
          change_player_tint: false,
          change_npc_tint: true,
          fx: true,
          fx_type: 'burst-death',
          heal_fx: false,
          heal_fx_type: 'glow-holy',
        },
      },
    },
  });
  const s = api.dtState().settings;
  assert.equal(s.deadMarker, 'skull');
  assert.equal(s.bloodiedMarker, 'yellow');
  assert.equal(s.hpBar, 2);
  assert.equal(s.tintPlayers, false);
  assert.equal(s.hurtFxType, 'burst-death');
  assert.ok(api.sandbox.state.DEATHTRACKER, 'the old state is kept');
  api.command('!dead config bar|3');
  assert.equal(api.dtState().settings.hpBar, 3);
  api.command('!rip config death_statusmarker|dead');
  assert.equal(api.dtState().settings.deadMarker, 'dead');
});

test('defect 5: changing the bar needs no restart', () => {
  const api = start();
  api.command('!deathtracker set hpBar 2');
  assert.match(api.lastChat(), /No restart needed/);
  const goblin = addNpc(api);
  goblin.attrs.bar2_value = 5;
  goblin.attrs.bar2_max = 5;
  api.edit(goblin, { bar2_value: 0 });
  assert.deepEqual(api.markers(goblin), ['dead']);
});

test('defect 11: a failing observer does not stop DeathTracker or the others', () => {
  const api = start();
  const seen = [];
  api.sandbox.DeathTracker.ObserveTokenChange(() => {
    throw new Error('boom');
  });
  api.sandbox.DeathTracker.ObserveTokenChange((obj) => seen.push(obj.id));
  const goblin = addNpc(api);
  api.setHp(goblin, '0');
  assert.deepEqual(seen, [goblin.id]);
  assert.deepEqual(api.markers(goblin), ['dead']);
  assert.match(api.logs.join('\n'), /observer failed/);
});

test('TokenMod changes are seen through its observer', () => {
  let observer = null;
  const api = start({ globals: { TokenMod: { ObserveTokenChange: (fn) => (observer = fn) } } });
  const goblin = addNpc(api);
  const prev = { ...goblin.attrs };
  goblin.attrs.bar1_value = 0;
  observer(goblin, prev);
  assert.deepEqual(api.markers(goblin), ['dead']);
});

test('status changes reach listeners, and check() judges API changes', () => {
  const api = start();
  const seen = [];
  api.sandbox.DeathTracker.onStatusChange((e) => seen.push([e.status, e.previous]));
  const goblin = addNpc(api);
  goblin.attrs.bar1_value = 0;
  assert.equal(api.sandbox.DeathTracker.check(goblin), 'dead');
  assert.deepEqual(seen, [['dead', null]]);
});

test('the death save macro: players sync their own token only', () => {
  const api = start();
  const token = addToken(api, { controlledby: 'p1', name: 'Bard' });
  api.setHp(token, 0);
  api.command(`!deathtracker dsync ${token.id} s=1,on,0 f=0,0,0`, [], 'p1');
  assert.match(api.lastChat(), /Bard: 2 success/);
  const other = addToken(api, { controlledby: 'p2', name: 'Rogue' });
  api.command(`!deathtracker dsync ${other.id} s=1 f=0`, [], 'p1');
  assert.match(api.lastChat(), /do not control/);
  api.command('!deathtracker macro');
  const macro = api.ofType('macro')[0];
  assert.match(
    macro.get('action'),
    /dsync @\{selected\|token_id\} s=@\{selected\|deathsave_succ1\}/
  );
  assert.equal(macro.get('istokenaction'), true);
});

test('GM-only commands refuse players and accept other Mods', () => {
  const api = start();
  api.command('!deathtracker settings', [], 'p1');
  assert.match(api.lastChat(), /Only the GM/);
  api.command('!deathtracker set hpBar 2', [], 'API');
  assert.equal(api.dtState().settings.hpBar, 2);
});

test('defect 10: bad setting values are refused', () => {
  const api = start();
  api.command('!deathtracker set hpBar 7');
  assert.match(api.lastChat(), /not a valid value/);
  api.command('!deathtracker set hurtFxType sparkle-glitter');
  assert.match(api.lastChat(), /not a valid value/);
  api.command('!deathtracker set nosuch 1');
  assert.match(api.lastChat(), /no setting called/);
  assert.equal(api.dtState().settings.hpBar, 1);
});

test('One-Click options apply once, then chat changes win', () => {
  const globalconfig = {
    deathtracker: {
      hpBar: '2',
      deathLayer: 'map',
      massiveDamage: 'true',
      dyingMarker: 'Unconscious',
      tintNpcs: 'true',
    },
  };
  const api = start({
    globalconfig,
    globals: { HealthColors: {} },
    tokenMarkers: [{ tag: 'sheet-unconscious', name: 'Unconscious' }],
  });
  assert.equal(api.dtState().settings.dyingMarker, 'sheet-unconscious');
  assert.equal(api.dtState().settings.tintNpcs, true);
  api.command('!deathtracker set hpBar 3');
  // A restart with the same options keeps the change made in chat.
  const again = start({ globalconfig, state: api.sandbox.state });
  assert.equal(again.dtState().settings.hpBar, 3);
  assert.equal(api.dtState().settings.deathLayer, 'map');
  assert.equal(api.dtState().settings.massiveDamage, true);
});

test('clear removes markers and tint and forgets the token', () => {
  const api = start();
  const goblin = addNpc(api);
  api.setHp(goblin, '0');
  api.command('!deathtracker clear', [goblin]);
  assert.deepEqual(api.markers(goblin), []);
  assert.equal(api.dtState().tokens[goblin.id], undefined);
});

test('menus and cards render without errors', () => {
  const api = start();
  const { token } = addPc(api);
  api.setHp(token, 0);
  for (const cmd of [
    '',
    'status',
    'status all',
    'settings',
    'markers',
    'help',
    'journal rebuild',
  ]) {
    api.chat.length = 0;
    api.command(`!deathtracker ${cmd}`.trim(), [token]);
    assert.ok(api.lastChat().length > 0, cmd);
    assert.doesNotMatch(api.allChat(), /undefined|NaN|\{\w+\}/, cmd);
  }
  assert.match(api.ofType('handout')[0].get('notes'), /DeathTracker/);
  assert.equal(addCharacter(api, { store: storeValue() }).character.get('name'), 'Hero');
});
