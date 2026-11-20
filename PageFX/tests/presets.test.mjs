import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { CUSTOM_FX_DEFAULTS } from '../src/constants.js';
import { parseFxSpec } from '../src/fx.js';
import { BUILTIN_PRESETS, PRESET_PACKS } from '../src/presets.js';
import enUS from '../src/locales/locale/en-US.js';
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
    aura1_radius: 10,
    statusmarkers: '',
    gmnotes: '',
    ...attrs,
  });
}

const owned = (game) =>
  game.ofType('custfx').filter((f) => String(f.get('name')).startsWith('PageFX: '));

describe('preset library', () => {
  test('every preset has a name, a known pack and valid layers', () => {
    const ids = new Set();
    for (const preset of BUILTIN_PRESETS) {
      assert.ok(!ids.has(preset.id), `duplicate ${preset.id}`);
      ids.add(preset.id);
      assert.ok(PRESET_PACKS.includes(preset.pack), preset.id);
      assert.equal(typeof enUS.presets[preset.id], 'string', `name for ${preset.id}`);
      assert.ok(preset.layers.length > 0);
      for (const layer of preset.layers) {
        assert.ok(layer.interval[0] > 0 && layer.interval[1] >= layer.interval[0], preset.id);
        if (typeof layer.fx === 'string') {
          assert.equal(parseFxSpec(layer.fx).fx.kind, 'builtin', `${preset.id}: ${layer.fx}`);
        } else {
          for (const key of Object.keys(CUSTOM_FX_DEFAULTS)) {
            assert.ok(key in layer.fx, `${preset.id} sets ${key}`);
          }
          // Legacy draws nothing for a negative angle (other than -1, beams)
          assert.ok(
            layer.fx.angle >= 0 || layer.fx.angle === -1,
            `${preset.id} angle ${layer.fx.angle}`
          );
        }
      }
    }
    for (const pack of [...PRESET_PACKS, 'custom']) {
      assert.equal(typeof enUS.packs[pack], 'string');
    }
  });

  test('a preset at intensity 1 stays under the default spawn cap', () => {
    for (const preset of BUILTIN_PRESETS) {
      const perSecond = preset.layers.reduce(
        (sum, l) => sum + 2000 / (l.interval[0] + l.interval[1]),
        0
      );
      assert.ok(perSecond <= 30, `${preset.id}: ${perSecond.toFixed(1)}/s`);
    }
  });
});

describe('applying presets', () => {
  test('preset makes a plain token an effect, named after the preset, and runs it', () => {
    const game = createSandbox();
    const token = plainToken(game);
    game.ready();
    game.command('!pagefx preset heavy-rain', [token]);
    const effect = game.fxState().effects[token.id];
    assert.equal(effect.name, 'Heavy rain');
    assert.equal(effect.preset, 'heavy-rain');
    assert.equal(effect.layers.length, 2);
    assert.match(game.allChat(), /Heavy rain applied: 1/);
    game.advance(2000);
    assert.ok(game.spawns.length > 10);
    assert.ok(game.spawns.every((s) => s.pageId === 'page1'));
    assert.equal(owned(game).length, 2);
    assert.ok(owned(game).some((f) => f.get('name') === 'PageFX: Heavy rain 1'));
  });

  test('effects with the same preset share its custom FX, removed when the last goes', () => {
    const game = createSandbox();
    const a = plainToken(game);
    const b = plainToken(game, { left: 1400 });
    game.ready();
    game.command('!pagefx preset snow', [a, b]);
    game.advance(2000);
    assert.equal(owned(game).length, 1);
    const spawnedIds = new Set(game.spawns.map((s) => s.type));
    assert.equal(spawnedIds.size, 1);
    game.command(`!pagefx delete --ids ${a.id}`);
    assert.equal(owned(game).length, 1, 'still used by the other effect');
    game.command(`!pagefx fx glow-holy --ids ${b.id}`);
    assert.equal(owned(game).length, 0);
    assert.equal(game.fxState().effects[b.id].preset, null, 'changing a layer drops the preset');
  });

  test('a preset replaces the layers of an existing effect and keeps its name', () => {
    const game = createSandbox();
    const token = plainToken(game);
    game.ready();
    game.command('!pagefx create Brazier', [token]);
    game.command(`!pagefx preset magma --ids ${token.id} --edit`);
    const effect = game.fxState().effects[token.id];
    assert.equal(effect.name, 'Brazier');
    assert.equal(effect.layers.map((l) => l.fx.value).join(), 'bubbling-fire,burn-fire');
    assert.match(game.lastChat(), /Effect: Brazier/);
    assert.match(game.lastChat(), /Bubbling magma/);
  });

  test('unknown presets are reported', () => {
    const game = createSandbox();
    const token = plainToken(game);
    game.ready();
    game.command('!pagefx preset drizzle', [token]);
    assert.match(game.lastChat(), /no preset &quot;drizzle&quot;/);
    assert.equal(game.fxState().effects[token.id], undefined);
  });

  test('the presets card has a button per preset, and the effect card a preset list', () => {
    const game = createSandbox();
    const token = plainToken(game);
    game.ready();
    game.command('!pagefx presets');
    const card = game.lastChat();
    assert.match(card, /PageFX Presets/);
    assert.match(card, /Fire and heat/);
    assert.match(card, /!pagefx preset lava-spurts --edit/);
    game.command('!pagefx create', [token]);
    assert.match(game.lastChat(), /\?\{Preset\|Weather: Light rain,light-rain\|/);
  });
});

describe('presets from other Mods', () => {
  test('registerPreset adds a preset to the menus and commands', () => {
    const game = createSandbox();
    const token = plainToken(game);
    game.ready();
    const api = game.sandbox.PageFX;
    assert.equal(
      api.registerPreset('snow', { name: 'x', layers: [{ fx: 'glow-holy' }] }).ok,
      false
    );
    assert.equal(api.registerPreset('Bad Id!', { layers: [{ fx: 'glow-holy' }] }).ok, false);
    assert.equal(api.registerPreset('x', { layers: [{ fx: 'burn-purple' }] }).ok, false);
    const ok = api.registerPreset('portal', {
      name: 'Portal swirl',
      layers: [
        { fx: 'nova-magic', interval: [800, 1200] },
        { fx: { maxParticles: 10, startColour: [0, 255, 0, 1] }, interval: 300 },
      ],
    });
    assert.equal(ok.ok, true);
    assert.ok(api.listPresets().some((p) => p.id === 'portal' && p.pack === 'custom'));
    game.command('!pagefx presets');
    assert.match(game.lastChat(), /From other Mods/);
    game.command('!pagefx preset portal', [token]);
    const effect = game.fxState().effects[token.id];
    assert.equal(effect.name, 'Portal swirl');
    assert.equal(effect.layers[1].fx.value.lifeSpanRandom, 0, 'definitions are completed');
    game.advance(2000);
    assert.ok(game.spawns.some((s) => s.type === 'nova-magic'));
  });
});
