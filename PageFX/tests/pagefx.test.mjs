import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createSandbox } from './roll20-stub.mjs';

/**
 * A v1-style effect token.
 *
 * @param {object} game Sandbox.
 * @param {object} attrs Token values.
 * @returns {object} Token.
 */
function v1Token(game, attrs = {}) {
  return game.add('graphic', {
    name: 'PageFX',
    _pageid: 'page1',
    layer: 'gmlayer',
    left: 700,
    top: 700,
    width: 70,
    height: 70,
    aura1_radius: 10,
    gmnotes: 'explode-fire',
    bar1_value: '200',
    bar1_max: '',
    bar2_value: '',
    bar2_max: '',
    statusmarkers: '',
    ...attrs,
  });
}

describe('v1 upgrade', () => {
  test('PageFX tokens are taken over on first start and run on the ribbon page', () => {
    const game = createSandbox();
    v1Token(game);
    game.ready();
    assert.match(game.allChat(), /Took over 1 effect/);
    assert.equal(game.fxState().effects[game.ofType('graphic')[0].id].source, 'v1');
    game.advance(2000);
    const spawns = game.spawnsOn('page1');
    assert.equal(spawns.length, 10);
    assert.ok(spawns.every((s) => s.type === 'explode-fire'));
    assert.equal(game.spawns.length, spawns.length, 'every spawn names its page');
  });

  test('every spawn lands inside the aura and on the page', () => {
    const game = createSandbox();
    v1Token(game, { left: 30, top: 30, aura1_radius: 10 });
    game.ready();
    game.advance(10000);
    assert.ok(game.spawns.length > 0);
    for (const s of game.spawns) {
      assert.ok(Math.hypot(s.x - 30, s.y - 30) <= 175 + 1e-9);
      assert.ok(s.x >= 0 && s.y >= 0 && s.x <= 2100 && s.y <= 1400);
    }
  });

  test('Bar 1 value and max give a random interval range (bars are text)', () => {
    const game = createSandbox();
    v1Token(game, { bar1_value: '100', bar1_max: '300' });
    game.ready();
    game.advance(20000);
    const n = game.spawns.length;
    // Average 200 ms: about 100 spawns in 20 s.
    assert.ok(n > 70 && n < 140, `spawns ${n}`);
    const gaps = game.spawns.slice(1).map((s, i) => s.at - game.spawns[i].at);
    assert.ok(
      gaps.every((g) => g >= 100 && g <= 300),
      'gaps within the range'
    );
  });

  test('the interdiction marker turns an effect off and on', () => {
    const game = createSandbox();
    const tok = v1Token(game);
    game.ready();
    game.edit(tok, { statusmarkers: 'interdiction' });
    game.clearSpawns();
    game.advance(2000);
    assert.equal(game.spawns.length, 0);
    game.edit(tok, { statusmarkers: '' });
    game.advance(2000);
    assert.ok(game.spawns.length > 0);
  });

  test('a token already marked with interdiction starts off', () => {
    const game = createSandbox();
    v1Token(game, { statusmarkers: 'interdiction' });
    game.ready();
    game.advance(2000);
    assert.equal(game.spawns.length, 0);
  });

  test('editing GM Notes on a v1 token changes the effect, as in v1', () => {
    const game = createSandbox();
    const tok = v1Token(game);
    game.ready();
    game.edit(tok, { gmnotes: '<p>glow-holy</p>' });
    game.clearSpawns();
    game.advance(1000);
    assert.ok(game.spawns.length > 0);
    assert.ok(game.spawns.every((s) => s.type === 'glow-holy'));
  });

  test('moving the token does not restart its timer, and spawns follow it', () => {
    const game = createSandbox();
    const tok = v1Token(game, { bar1_value: '1000' });
    game.ready();
    game.advance(900);
    game.edit(tok, { left: 1500, top: 300 });
    game.advance(150);
    assert.equal(game.spawns.length, 1, 'the first spawn still came at 1000 ms');
    assert.ok(Math.hypot(game.spawns[0].x - 1500, game.spawns[0].y - 300) <= 175);
  });

  test('a PageFX token added later is taken over', () => {
    const game = createSandbox();
    game.ready();
    game.addToken({
      name: 'PageFX',
      _pageid: 'page1',
      left: 100,
      top: 100,
      gmnotes: 'burn-smoke',
      bar1_value: '100',
    });
    game.advance(500);
    assert.ok(game.spawns.length >= 4);
  });

  test('a bad effect is reported to the GM and spawns nothing', () => {
    const game = createSandbox();
    v1Token(game, { gmnotes: 'burn-purple' });
    game.ready();
    game.advance(1000);
    assert.equal(game.spawns.length, 0);
    assert.match(game.allChat(), /no built-in colour/);
  });

  test('deleting the token forgets the effect', () => {
    const game = createSandbox();
    const tok = v1Token(game);
    game.ready();
    game.deleteObj(tok);
    game.clearSpawns();
    game.advance(1000);
    assert.equal(game.spawns.length, 0);
    assert.equal(Object.keys(game.fxState().effects).length, 0);
    assert.equal(game.pendingTimers(), 1, 'only the live-page check is left');
  });
});

describe('split party (the reported bug)', () => {
  test('effects on a page with no players do not run', () => {
    const game = createSandbox();
    v1Token(game, { _pageid: 'page2' });
    game.ready();
    game.advance(2000);
    assert.equal(game.spawns.length, 0);
  });

  test('moving a player to their own page starts its effects, drawn on that page', () => {
    const game = createSandbox();
    v1Token(game, { _pageid: 'page1' });
    v1Token(game, { _pageid: 'page2', gmnotes: 'bubbling-water' });
    game.ready();
    game.setCampaign('playerspecificpages', { p1: 'page2' });
    game.clearSpawns();
    game.advance(2000);
    assert.ok(game.spawnsOn('page1').length > 0, 'ribbon page keeps running');
    const docks = game.spawnsOn('page2');
    assert.ok(docks.length > 0, 'split page runs');
    assert.ok(docks.every((s) => s.type === 'bubbling-water'));
    assert.equal(game.spawns.filter((s) => !s.pageId).length, 0);
  });

  test('bringing the party back together stops the split page only', () => {
    const game = createSandbox();
    v1Token(game, { _pageid: 'page1' });
    v1Token(game, { _pageid: 'page2' });
    game.ready();
    game.setCampaign('playerspecificpages', { p1: 'page2' });
    game.advance(1000);
    game.setCampaign('playerspecificpages', false);
    game.clearSpawns();
    game.advance(2000);
    assert.equal(game.spawnsOn('page2').length, 0);
    assert.ok(game.spawnsOn('page1').length > 0);
  });

  test('a split made by another Mod (no change event) is picked up within a few seconds', () => {
    const game = createSandbox();
    v1Token(game, { _pageid: 'page2' });
    game.ready();
    game.campaign.attrs.playerspecificpages = { p1: 'page2' };
    game.advance(3500);
    assert.ok(game.spawnsOn('page2').length > 0);
  });

  test('moving the ribbon moves the effects', () => {
    const game = createSandbox();
    v1Token(game, { _pageid: 'page1' });
    v1Token(game, { _pageid: 'page2' });
    game.ready();
    game.setCampaign('playerpageid', 'page2');
    game.clearSpawns();
    game.advance(2000);
    assert.equal(game.spawnsOn('page1').length, 0);
    assert.ok(game.spawnsOn('page2').length > 0);
  });

  test('GM page preview runs effects on the page the GM is viewing, when turned on', () => {
    const game = createSandbox();
    v1Token(game, { _pageid: 'page2' });
    game.ready();
    const gm = game.objects.get('gm1');
    game.setPlayer(gm, '_lastpage', 'page2');
    game.advance(1000);
    assert.equal(game.spawns.length, 0, 'off by default');
    game.command('!pagefx set gmPagePreview on');
    game.advance(1000);
    assert.ok(game.spawnsOn('page2').length > 0);
    game.setPlayer(gm, '_lastpage', 'page1');
    game.clearSpawns();
    game.advance(1000);
    assert.equal(game.spawns.length, 0);
  });
});

describe('fixes to v1 defects', () => {
  test('saved custom FX spawn once per tick, by ID (v1 spawned twice)', () => {
    const game = createSandbox();
    const fx = game.add('custfx', { name: 'Steam', definition: { angle: 270, maxParticles: 20 } });
    v1Token(game, { gmnotes: 'Steam', bar1_value: '500' });
    game.ready();
    game.advance(1000);
    assert.equal(game.spawns.length, 2);
    assert.ok(game.spawns.every((s) => s.type === fx.id && s.kind === 'point'));
  });

  test('random direction works for beam-like saved FX (never did in v1)', () => {
    const game = createSandbox();
    game.add('custfx', { name: 'Zap', definition: { angle: -1 } });
    v1Token(game, { gmnotes: 'Zap', bar1_value: '200', bar2_value: 'random' });
    game.ready();
    game.advance(2000);
    assert.ok(game.spawns.length > 0);
    for (const s of game.spawns) {
      assert.equal(s.kind, 'beam');
      const len = Math.hypot(s.end.x - s.x, s.end.y - s.y);
      assert.ok(len > 0 && len <= 70 + 1e-9);
    }
  });

  test('built-in beams use Bar 2 offsets in cells', () => {
    const game = createSandbox();
    v1Token(game, {
      gmnotes: 'beam-acid',
      bar2_value: '2',
      bar2_max: '0',
      left: 1000,
      top: 700,
      aura1_radius: '',
    });
    game.ready();
    game.advance(1000);
    for (const s of game.spawns) {
      assert.equal(s.kind, 'beam');
      assert.ok(Math.abs(s.end.x - s.x - 140) < 1e-9);
      assert.ok(Math.abs(s.end.y - s.y) < 1e-9);
    }
  });

  test('custom JSON becomes a PageFX-owned custom FX in colour, not a white inline definition', () => {
    const game = createSandbox();
    v1Token(game, {
      gmnotes: '<p>{"maxParticles":50,"startColour":[255,0,255,1],"endColour":[0,255,255,0]}</p>',
    });
    game.ready();
    game.advance(1000);
    const owned = game.ofType('custfx');
    assert.equal(owned.length, 1);
    assert.match(owned[0].get('name'), /^PageFX: /);
    assert.equal(JSON.stringify(owned[0].get('definition').startColor), '[255,0,255,1]');
    assert.ok(game.spawns.length > 0);
    assert.ok(game.spawns.every((s) => s.type === owned[0].id && s.kind === 'point'));
    // Deleting the effect removes the custom FX it owned.
    game.deleteObj(game.ofType('graphic')[0]);
    assert.equal(game.ofType('custfx').length, 0);
  });

  test("NullFX areas use their own size, not the effect token's", () => {
    const game = createSandbox({ seed: 7 });
    // A big effect token with no aura covers a 280 px square-ish circle (r 140).
    v1Token(game, {
      left: 700,
      top: 700,
      width: 280,
      height: 280,
      aura1_radius: '',
      bar1_value: '20',
    });
    // A small NullFX token (r 35) in the middle.
    game.add('graphic', {
      name: 'NullFX',
      _pageid: 'page1',
      left: 700,
      top: 700,
      width: 70,
      height: 70,
      aura1_radius: '',
    });
    game.ready();
    game.advance(5000);
    assert.ok(game.spawns.length > 50, 'v1 would have blocked everything');
    assert.ok(game.spawns.every((s) => Math.hypot(s.x - 700, s.y - 700) > 35));
  });

  test('effects start again after a sandbox restart', () => {
    const first = createSandbox();
    v1Token(first);
    first.ready();
    const saved = JSON.parse(JSON.stringify(first.sandbox.state));
    const game = createSandbox({ state: saved });
    v1Token(game);
    // Same token ID as before.
    const tok = game.ofType('graphic')[0];
    assert.ok(saved.PageFX.effects[tok.id]);
    game.ready();
    assert.doesNotMatch(game.allChat(), /Took over/);
    game.advance(1000);
    assert.ok(game.spawns.length > 0);
  });
});

describe('commands', () => {
  test('!pageFX off and on (v1) pause and resume everything', () => {
    const game = createSandbox();
    v1Token(game);
    game.ready();
    game.command('!pageFX off');
    game.clearSpawns();
    game.advance(1000);
    assert.equal(game.spawns.length, 0);
    assert.equal(game.fxState().paused, true);
    game.command('!pageFX on');
    game.advance(1000);
    assert.ok(game.spawns.length > 0);
  });

  test('on/off/pause/resume work on selected tokens or --ids', () => {
    const game = createSandbox();
    const a = v1Token(game, { gmnotes: 'glow-holy' });
    const b = v1Token(game, { gmnotes: 'burn-fire' });
    game.ready();
    game.command('!pagefx off', [a]);
    game.clearSpawns();
    game.advance(1000);
    assert.ok(game.spawns.every((s) => s.type === 'burn-fire'));
    game.command(`!pagefx pause --ids ${b.id}`);
    game.clearSpawns();
    game.advance(1000);
    assert.equal(game.spawns.length, 0);
    game.command(`!pagefx on --ids ${a.id}`);
    game.command(`!pagefx resume --ids ${b.id},nope`);
    assert.match(game.allChat(), /not PageFX effects: nope/);
    game.clearSpawns();
    game.advance(1000);
    assert.equal([...new Set(game.spawns.map((s) => s.type))].sort().join(), 'burn-fire,glow-holy');
  });

  test('fire spawns now, even when the effect is not running', () => {
    const game = createSandbox();
    const a = v1Token(game, { _pageid: 'page2' });
    game.ready();
    game.command('!pagefx fire 3', [a]);
    assert.equal(game.spawnsOn('page2').length, 3);
  });

  test('status lists effects and live pages', () => {
    const game = createSandbox();
    v1Token(game);
    game.ready();
    game.command('!pagefx status');
    assert.match(game.lastChat(), /Town/);
    assert.match(game.lastChat(), /explode-fire/);
  });

  test('players cannot use the commands; other Mods can', () => {
    const game = createSandbox();
    v1Token(game);
    game.ready();
    const before = game.chat.length;
    game.command('!pagefx off', [], 'p1');
    assert.equal(game.chat.length, before);
    assert.equal(game.fxState().paused, false);
    game.command('!pagefx off', [], 'API');
    assert.equal(game.fxState().paused, true);
  });

  test('intensity doubles the rate', () => {
    const game = createSandbox();
    v1Token(game, { bar1_value: '200' });
    game.ready();
    game.command('!pagefx set intensity 2');
    game.clearSpawns();
    game.advance(2000);
    // The spawn already queued keeps its old delay; the rest come every 100 ms.
    assert.ok(game.spawns.length >= 19 && game.spawns.length <= 20, String(game.spawns.length));
  });

  test('unknown commands and settings are reported', () => {
    const game = createSandbox();
    game.ready();
    game.command('!pagefx wibble');
    assert.match(game.lastChat(), /Unknown command/);
    game.command('!pagefx set maxSpawnsPerSecond lots');
    assert.match(game.lastChat(), /Unknown setting or value/);
  });

  test('rescan takes over new tokens and forgets deleted ones', () => {
    const game = createSandbox();
    const a = v1Token(game);
    game.ready();
    game.objects.delete(a.id); // gone without a destroy event
    v1Token(game, { name: 'PageFX' });
    game.command('!pagefx rescan');
    assert.match(game.lastChat(), /found 1 new effect.*forgot 1/);
  });
});

describe('load limits', () => {
  test('a page never gets more than the spawn cap per second, and the GM is told once', () => {
    const game = createSandbox();
    for (let i = 0; i < 10; i++) {
      v1Token(game, { bar1_value: '20', left: 100 + i * 100 });
    }
    game.ready();
    game.advance(5000);
    const perSecond = [0, 1, 2, 3, 4].map(
      (sec) =>
        game.spawns.filter(
          (s) => s.at > 1_000_000 + sec * 1000 && s.at <= 1_000_000 + (sec + 1) * 1000
        ).length
    );
    assert.ok(
      perSecond.every((n) => n <= 30),
      perSecond.join(',')
    );
    assert.equal(game.chat.filter((c) => /being thinned/.test(c.text)).length, 1);
  });
});

describe('public API', () => {
  test('v1 functions still exist and work on every live page', () => {
    const game = createSandbox();
    const tok = v1Token(game);
    game.ready();
    const api = game.sandbox.PageFX;
    for (const fn of [
      'activateAllEffects',
      'activateEffect',
      'deactivateAllEffects',
      'deactivateEffect',
      'toggleEffect',
    ]) {
      assert.equal(typeof api[fn], 'function', fn);
    }
    api.deactivateEffect(tok);
    game.clearSpawns();
    game.advance(1000);
    assert.equal(game.spawns.length, 0);
    api.toggleEffect(tok.id);
    game.advance(1000);
    assert.ok(game.spawns.length > 0);
    api.deactivateAllEffects();
    game.clearSpawns();
    game.advance(1000);
    assert.equal(game.spawns.length, 0);
    api.activateAllEffects();
    assert.equal(api.getEffect(tok).running, true);
    assert.equal(JSON.stringify(api.listEffects('page1')), JSON.stringify([tok.id]));
  });
});
