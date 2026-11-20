import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createSandbox } from './roll20-stub.mjs';

/**
 * A plain token, not yet an effect.
 *
 * @param {object} game Sandbox.
 * @param {object} attrs Token values.
 * @returns {object} Token.
 */
function plainToken(game, attrs = {}) {
  return game.add('graphic', {
    name: '',
    _pageid: 'page1',
    layer: 'objects',
    left: 700,
    top: 700,
    width: 70,
    height: 70,
    aura1_radius: '',
    statusmarkers: '',
    gmnotes: '',
    ...attrs,
  });
}

/**
 * Starts a game with one effect made from chat.
 *
 * @param {string} [fx] Effect to set on layer 1.
 * @returns {{game: object, token: object}} Sandbox and the effect's token.
 */
function withEffect(fx = 'explode-fire') {
  const game = createSandbox();
  const token = plainToken(game);
  game.ready();
  game.command('!pagefx create', [token]);
  game.command(`!pagefx fx ${fx} --ids ${token.id}`);
  return { game, token };
}

describe('making effects from chat', () => {
  test('create names an unnamed token, gives it a hidden area, and shows its card', () => {
    const game = createSandbox();
    const token = plainToken(game);
    game.ready();
    game.command('!pagefx create', [token]);
    const effect = game.fxState().effects[token.id];
    assert.equal(effect.name, 'PageFX');
    assert.equal(effect.source, 'chat');
    assert.equal(token.get('name'), 'PageFX');
    assert.equal(token.get('aura1_radius'), 15);
    assert.equal(token.get('showplayers_aura1'), false);
    assert.match(game.lastChat(), /Effect: PageFX/);
    assert.match(game.lastChat(), /Built-in FX/);
    game.advance(3000);
    assert.equal(game.spawns.length, 0, 'nothing runs until an effect is chosen');
  });

  test('create keeps a token name and an existing aura, and takes a name', () => {
    const game = createSandbox();
    const token = plainToken(game, { name: 'Brazier', aura1_radius: 5 });
    game.ready();
    game.command('!pagefx create Fire pit', [token]);
    assert.equal(token.get('name'), 'Brazier');
    assert.equal(token.get('aura1_radius'), 5);
    assert.equal(game.fxState().effects[token.id].name, 'Fire pit');
  });

  test('create with nothing selected says what to do', () => {
    const game = createSandbox();
    game.ready();
    game.command('!pagefx create');
    assert.match(game.lastChat(), /Select one or more tokens/);
  });

  test('fx sets layer 1 and the effect starts on a live page', () => {
    const { game } = withEffect('bubbling-water');
    game.clearSpawns();
    game.advance(5000);
    assert.ok(game.spawns.length > 0);
    assert.ok(game.spawns.every((s) => s.type === 'bubbling-water' && s.pageId === 'page1'));
  });

  test('a bad colour is reported and changes nothing', () => {
    const { game, token } = withEffect();
    game.command(`!pagefx fx burn-purple --ids ${token.id}`);
    assert.match(game.lastChat(), /no built-in colour &quot;purple&quot;/);
    assert.equal(game.fxState().effects[token.id].layers[0].fx.value, 'explode-fire');
  });

  test('a beam gets a random direction, and direction can be set in cells', () => {
    const { game, token } = withEffect('beam-acid');
    const layer = () => game.fxState().effects[token.id].layers[0];
    assert.equal(layer().direction, 'random');
    game.command(`!pagefx direction 2 -1 --ids ${token.id}`);
    assert.equal(JSON.stringify(layer().direction), '{"dx":2,"dy":-1}');
    game.clearSpawns();
    game.advance(3000);
    const beam = game.spawns.find((s) => s.kind === 'beam');
    assert.ok(beam);
    assert.equal(Math.round(beam.end.x - beam.x), 140);
    assert.equal(Math.round(beam.end.y - beam.y), -70);
  });

  test('interval sets the time between spawns', () => {
    const { game, token } = withEffect();
    game.command(`!pagefx interval 1000 --ids ${token.id}`);
    assert.equal(game.fxState().effects[token.id].layers[0].interval.join(), '1000,1000');
    game.clearSpawns();
    game.advance(10000);
    assert.ok(game.spawns.length >= 9 && game.spawns.length <= 10);
    game.command(`!pagefx interval soon --ids ${token.id}`);
    assert.match(game.lastChat(), /time between spawns in ms/);
  });

  test('layers can be added, edited with --layer, and removed', () => {
    const { game, token } = withEffect();
    game.command(`!pagefx layer add glow-holy --ids ${token.id}`);
    game.command(`!pagefx interval 50 --layer 2 --ids ${token.id}`);
    const effect = () => game.fxState().effects[token.id];
    assert.equal(effect().layers.length, 2);
    assert.equal(effect().layers[1].interval.join(), '50,50');
    game.clearSpawns();
    game.advance(2000);
    assert.equal(
      [...new Set(game.spawns.map((s) => s.type))].sort().join(),
      'explode-fire,glow-holy'
    );
    game.command(`!pagefx fx burn-fire --layer 3 --ids ${token.id}`);
    assert.match(game.lastChat(), /has no layer 3/);
    game.command(`!pagefx layer remove 1 --ids ${token.id}`);
    assert.equal(effect().layers.length, 1);
    assert.equal(effect().layers[0].fx.value, 'glow-holy');
  });

  test('custom JSON gets its own custom FX, removed when the layer changes to a built-in', () => {
    const { game, token } = withEffect('{"maxParticles":20,"startColour":[255,0,255,1]}');
    game.advance(2000);
    const owned = () => game.ofType('custfx').filter((f) => f.get('name').startsWith('PageFX: '));
    assert.equal(owned().length, 1);
    game.command(`!pagefx fx explode-fire --ids ${token.id}`);
    assert.equal(owned().length, 0);
  });

  test('area sets the Aura 1 radius and shape', () => {
    const { game, token } = withEffect();
    game.command(`!pagefx area 10 square --ids ${token.id}`);
    assert.equal(token.get('aura1_radius'), 10);
    assert.equal(token.get('aura1_square'), true);
    game.command(`!pagefx area 5 --ids ${token.id}`);
    assert.equal(token.get('aura1_square'), true, 'no shape keeps the shape');
    game.command(`!pagefx area big --ids ${token.id}`);
    assert.match(game.lastChat(), /radius in page units/);
  });

  test('name and intensity change one effect; intensity global changes all', () => {
    const { game, token } = withEffect();
    game.command(`!pagefx name Rain over the docks --ids ${token.id}`);
    game.command(`!pagefx intensity 2.5 --ids ${token.id}`);
    game.command('!pagefx intensity global 0.5');
    const effect = game.fxState().effects[token.id];
    assert.equal(effect.name, 'Rain over the docks');
    assert.equal(effect.intensity, 2.5);
    assert.equal(game.fxState().settings.intensity, 0.5);
  });

  test('editing a v1 token from chat stops its GM Notes driving it', () => {
    const game = createSandbox();
    const token = plainToken(game, { name: 'PageFX', gmnotes: 'glow-holy', aura1_radius: 5 });
    game.ready();
    assert.equal(game.fxState().effects[token.id].source, 'v1');
    game.command(`!pagefx interval 300 --ids ${token.id}`);
    assert.equal(game.fxState().effects[token.id].source, 'chat');
    game.edit(token, { gmnotes: 'burn-fire' });
    assert.equal(game.fxState().effects[token.id].layers[0].fx.value, 'glow-holy');
  });
});

describe('deleting effects', () => {
  test('delete leaves the token, and a token named PageFX is not taken over again', () => {
    const { game, token } = withEffect();
    game.command(`!pagefx delete --ids ${token.id}`);
    assert.equal(game.fxState().effects[token.id], undefined);
    assert.ok(game.objects.has(token.id));
    game.edit(token, { left: 800 });
    game.command('!pagefx rescan');
    assert.equal(game.fxState().effects[token.id], undefined);
    game.clearSpawns();
    game.advance(3000);
    assert.equal(game.spawns.length, 0);
    game.command('!pagefx create', [token]);
    assert.ok(game.fxState().effects[token.id], 'create makes it an effect again');
  });

  test('backing out of the delete question keeps the effect', () => {
    const { game, token } = withEffect();
    game.command(`!pagefx delete no --ids ${token.id} --menu`);
    assert.ok(game.fxState().effects[token.id]);
    assert.match(game.lastChat(), /Effect: PageFX/);
  });
});

describe('no-effect areas from chat', () => {
  test('null create stops spawns inside the token area; null remove brings them back', () => {
    const { game, token } = withEffect();
    const blocker = plainToken(game, { name: 'Shelter', aura1_radius: 30 });
    game.command('!pagefx null create', [blocker]);
    assert.ok(game.fxState().nullAreas[blocker.id]);
    game.clearSpawns();
    game.advance(5000);
    assert.equal(game.spawns.length, 0);
    game.command('!pagefx null remove', [blocker]);
    game.advance(5000);
    assert.ok(game.spawns.length > 0);
    game.command('!pagefx null create', [token]);
    assert.match(game.lastChat(), /is an effect/);
  });
});

describe('menus', () => {
  test('the main menu lists effects on the GM page with buttons, and other pages', () => {
    const { game, token } = withEffect();
    const other = plainToken(game, { _pageid: 'page2' });
    game.command('!pagefx create Docks rain', [other]);
    game.command('!pagefx');
    const menu = game.lastChat();
    assert.match(menu, /Effects on this page/);
    assert.match(menu, new RegExp(`!pagefx edit --ids ${token.id}`));
    assert.match(menu, /Docks \(no players here\)/);
    assert.match(menu, /!pagefx menu page2/);
    assert.match(menu, /Pause all/);
    game.command('!pagefx menu page2');
    assert.match(game.lastChat(), /Docks rain/);
  });

  test('the effect card offers built-in, saved and JSON choices as roll queries', () => {
    const { game, token } = withEffect();
    game.add('custfx', { name: 'Steam, vent', definition: { angle: 0 } });
    game.add('custfx', { name: 'PageFX: own', definition: {} });
    game.command(`!pagefx edit --ids ${token.id}`);
    const card = game.lastChat();
    assert.match(card, /\?\{Effect type\|beam\|bomb/);
    assert.match(card, /\?\{Colour\|acid\|blood/);
    assert.match(card, /Steam&amp;#44; vent/);
    assert.doesNotMatch(card, /PageFX: own/);
    assert.match(card, new RegExp(`--ids ${token.id} --layer 1 --edit`));
  });

  test('buttons with --edit show the card again with the change', () => {
    const { game, token } = withEffect();
    game.command(`!pagefx pause --ids ${token.id} --edit`);
    assert.match(game.lastChat(), /Effect: PageFX/);
    assert.match(game.lastChat(), /Paused/);
    assert.match(game.lastChat(), /Resume/);
  });

  test('pause all from the menu shows the menu again with Resume all', () => {
    const { game } = withEffect();
    game.command('!pagefx pause --menu');
    assert.equal(game.fxState().paused, true);
    assert.match(game.lastChat(), /Resume all/);
  });

  test('settings shows and changes the settings', () => {
    const game = createSandbox();
    game.ready();
    game.command('!pagefx settings');
    assert.match(game.lastChat(), /PageFX Settings/);
    game.command('!pagefx set gmPagePreview on --settings');
    assert.equal(game.fxState().settings.gmPagePreview, true);
    assert.match(game.lastChat(), /PageFX Settings/);
    game.command('!pagefx set maxSpawnsPerSecond 999');
    assert.equal(game.fxState().settings.maxSpawnsPerSecond, 60);
  });
});

describe('public API', () => {
  test('PageFX.create makes an effect with layers; PageFX.remove takes it off', () => {
    const game = createSandbox();
    const token = plainToken(game);
    game.ready();
    const api = game.sandbox.PageFX;
    assert.deepEqual(
      JSON.parse(JSON.stringify(api.create(token, { fx: 'nope-fire' }))),
      { ok: true, id: token.id },
      'an unknown type is a saved FX name'
    );
    api.remove(token);
    const result = api.create(token.id, {
      name: 'Storm',
      fx: ['glow-holy', 'beam-water'],
      interval: [100, 200],
      intensity: 2,
    });
    assert.equal(result.ok, true);
    const effect = api.getEffect(token);
    assert.equal(effect.name, 'Storm');
    assert.equal(effect.layers.length, 2);
    assert.equal(effect.layers[1].direction, 'random');
    assert.equal(effect.intensity, 2);
    game.advance(2000);
    assert.ok(game.spawns.length > 0);
    assert.equal(api.create(token, { fx: 'burn-purple' }).error, 'fx.unknownColour');
    assert.equal(api.remove(token), true);
    assert.equal(api.getEffect(token), null);
    assert.equal(api.create('missing').ok, false);
  });
});
