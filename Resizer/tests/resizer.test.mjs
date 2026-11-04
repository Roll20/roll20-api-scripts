import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createSandbox, furnish } from './roll20-stub.mjs';

/**
 * A started game with a furnished first page.
 *
 * @param {object} [options] Sandbox options.
 * @returns {{game: object, o: object}} Game and objects.
 */
function setup(options) {
  const game = createSandbox(options);
  const o = furnish(game, 'page1');
  game.ready();
  game.clearChat();
  return { game, o };
}

describe('start-up', () => {
  test('writes the handouts and greets the GM', () => {
    const game = createSandbox();
    game.ready();
    const names = game.ofType('handout').map((h) => h.get('name'));
    assert.deepEqual(names.sort(), ['Resizer - Command Deck', 'Resizer - Help']);
    assert.match(game.allChat(), /Resizer is ready/);
    assert.equal(game.rState().schemaVersion, 2);
  });

  test('upgrades 0.0.9 state and keeps a renamed command', () => {
    const game = createSandbox({
      state: { RESIZER: { config: { command: 'rs', firsttime: false } } },
    });
    furnish(game, 'page1');
    game.ready();
    assert.match(game.allChat(), /Upgraded from Resizer 0\.0\.9/);
    assert.equal(game.rState().settings.command, 'rs');
    game.clearChat();
    game.command('!rs page');
    assert.match(game.allChat(), /Town: 30 × 20 cells/);
    game.clearChat();
    game.command('!resizer page');
    assert.match(game.allChat(), /Town: 30 × 20 cells/);
  });

  test('publishes the Resizer API, keeping 0.0.9 names', () => {
    const { game } = setup();
    const api = game.sandbox.Resizer;
    assert.equal(typeof api.CheckInstall, 'function');
    assert.equal(typeof api.RegisterEventHandlers, 'function');
    assert.equal(typeof api.zoomPage, 'function');
  });

  test('applies the language useroption', () => {
    const game = createSandbox({ globalconfig: { resizer: { language: 'fr' } } });
    game.ready();
    assert.equal(game.rState().settings.language, 'fr');
  });
});

describe('permissions', () => {
  test('players are ignored; Mods (player API) are answered to the GM', () => {
    const { game } = setup();
    game.command('!resizer zoom 2', [], 'p1');
    assert.equal(game.get('page', 'page1').get('width'), 30);
    game.command('!resizer zoom 2', [], 'API');
    assert.equal(game.get('page', 'page1').get('width'), 60);
    assert.match(game.lastChat(), /^\/w gm /);
  });
});

describe('zoom', () => {
  test('zooms every kind of object and keeps the distance per cell', () => {
    const { game, o } = setup();
    game.command('!resizer zoom 2');
    const page = game.get('page', 'page1');
    assert.equal(page.get('width'), 60);
    assert.equal(page.get('snapping_increment'), 2);
    assert.equal(page.get('scale_number'), 5);
    assert.equal(o.hero.get('left'), 1610);
    assert.equal(o.hero.get('width'), 140);
    assert.equal(o.map.get('width'), 4200);
    assert.equal(o.label.get('font_size'), 52);
    assert.equal(o.wall.get('points'), '[[0,0],[0,588]]');
    assert.equal(o.wall.get('stroke_width'), 5, 'walls keep their width');
    assert.equal(o.sketch.get('stroke_width'), 8, 'drawings scale their width');
    assert.equal(o.door.get('y'), -500.5);
    assert.deepEqual(o.window.get('path').handle0, { x: 0, y: 73.5 });
    // The Legacy path was drawn again.
    assert.equal(game.get('path', o.legacy.id), undefined);
    const [legacy] = game.ofType('path');
    assert.equal(legacy.get('left'), 2982);
    assert.equal(legacy.get('height'), 1127);
    assert.equal(legacy.get('barrierType'), 'wall');
    assert.match(game.allChat(), /Zoomed Town ×2: 10 objects/);
  });

  test('zoom then undo puts everything back exactly', () => {
    const { game } = setup();
    const before = game.pageSnapshot('page1');
    game.command('!resizer zoom 3');
    game.command('!resizer undo');
    assert.deepEqual(game.pageSnapshot('page1'), before);
  });

  test('two zooms undo in order, even with redrawn Legacy paths', () => {
    const { game } = setup();
    const before = game.pageSnapshot('page1');
    game.command('!resizer zoom 2');
    const middle = game.pageSnapshot('page1');
    game.command('!resizer zoom 1.5');
    game.command('!resizer undo');
    assert.deepEqual(game.pageSnapshot('page1'), middle);
    game.command('!resizer undo');
    assert.deepEqual(game.pageSnapshot('page1'), before);
    assert.equal(game.ofType('path').length, 1);
  });

  test('zoom out by f then in by f returns to the start (within rounding)', () => {
    const { game, o } = setup();
    game.command('!resizer zoom 0.5');
    game.command('!resizer zoom 2');
    assert.equal(o.hero.get('left'), 805);
    assert.equal(o.room.get('points'), '[[0,94.5],[0,0],[427,0],[427,420],[0,420],[0,325.5]]');
  });

  test('--keep-tokens moves tokens without resizing them', () => {
    const { game, o } = setup();
    game.command('!resizer zoom 2 --keep-tokens');
    assert.equal(o.hero.get('left'), 1610);
    assert.equal(o.hero.get('width'), 70);
    assert.equal(o.map.get('width'), 4200, 'map-layer graphics still scale');
  });

  test('the keepTokenSize setting is the default, --scale-tokens overrides it', () => {
    const { game, o } = setup();
    game.command('!resizer set keepTokenSize on');
    game.command('!resizer zoom 2 --scale-tokens');
    assert.equal(o.hero.get('width'), 140);
  });

  test('0.0.9 "scale 2 up" zooms in and "down" zooms out (0.0.9 shrank the page for both)', () => {
    const { game } = setup();
    game.command('!resizer scale 2 down');
    assert.equal(game.get('page', 'page1').get('width'), 15);
    game.command('!resizer scale 2 up');
    assert.equal(game.get('page', 'page1').get('width'), 30);
  });

  test('bad factors and impossible pages are refused without changes', () => {
    const { game } = setup();
    game.command('!resizer zoom banana');
    assert.match(game.lastChat(), /Could not read/);
    game.command('!resizer zoom 1');
    assert.match(game.lastChat(), /changes nothing/);
    game.command('!resizer zoom 50');
    assert.match(game.lastChat(), /from 0\.05 to 20/);
    game.command('!resizer zoom 0.01');
    assert.equal(game.get('page', 'page1').get('width'), 30);
    game.command('!resizer page 10 10');
    game.command('!resizer zoom 0.05');
    assert.match(game.lastChat(), /smaller than 1 unit/);
    assert.equal(game.get('page', 'page1').get('width'), 10);
  });

  test('batch over named pages is one undo entry', () => {
    const { game } = setup();
    furnish(game, 'page2');
    const before1 = game.pageSnapshot('page1');
    const before2 = game.pageSnapshot('page2');
    game.command('!resizer zoom 2 --pages Town, Docks');
    assert.equal(game.get('page', 'page2').get('width'), 55.86);
    assert.equal(game.get('page', 'page2').get('grid_offset_x'), 20);
    assert.equal(game.rState().undo.length, 1);
    assert.match(game.allChat(), /Zoomed 2 pages ×2/);
    game.command('!resizer undo');
    assert.deepEqual(game.pageSnapshot('page1'), before1);
    assert.deepEqual(game.pageSnapshot('page2'), before2);
  });

  test('unknown page names are reported', () => {
    const { game } = setup();
    game.command('!resizer zoom 2 --pages Nowhere');
    assert.match(game.lastChat(), /No pages called: Nowhere/);
  });

  test('the page picker ticks pages for a batch', () => {
    const { game } = setup();
    game.command('!resizer pick page2');
    game.command('!resizer pick page1');
    assert.deepEqual([...game.rState().picked], ['page2', 'page1']);
    game.command('!resizer zoom 2 --pages picked');
    assert.equal(game.get('page', 'page1').get('width'), 60);
    assert.equal(game.get('page', 'page2').get('width'), 55.86);
    game.command('!resizer pick none');
    assert.equal(game.rState().picked.length, 0);
    game.command('!resizer pages');
    assert.match(game.lastChat(), /☐ Town/);
  });

  test('other Mods hear about zooms and undone zooms', () => {
    const { game } = setup();
    const heard = [];
    game.sandbox.Resizer.onZoom((pageId, f) => heard.push([pageId, f]));
    game.sandbox.Resizer.zoomPage('page1', 2);
    game.command('!resizer undo');
    assert.deepEqual(heard, [
      ['page1', 2],
      ['page1', 0.5],
    ]);
  });
});

describe('resizing selected objects', () => {
  test('0.0.9 "!resizer 50 50" resizes in pixels; undo restores', () => {
    const { game, o } = setup();
    game.command('!resizer 50 40', [o.hero, o.wall]);
    assert.equal(o.hero.get('width'), 50);
    assert.equal(o.hero.get('height'), 40);
    assert.match(game.allChat(), /Resized 1 graphic to 50 × 40 px/);
    game.command('!resizer undo');
    assert.equal(o.hero.get('width'), 70);
  });

  test('sizes in grid cells follow the page cell size', () => {
    const { game, o } = setup();
    game.get('page', 'page1').set('snapping_increment', 2);
    game.command('!resizer size 1 1 cells', [o.hero]);
    assert.equal(o.hero.get('width'), 140);
  });

  test('creature sizes', () => {
    const { game, o } = setup();
    game.command('!resizer size huge', [o.hero]);
    assert.equal(o.hero.get('width'), 210);
    game.command('!resizer size tiny', [o.hero]);
    assert.equal(o.hero.get('width'), 35);
    game.command('!resizer size enormous', [o.hero]);
    assert.match(game.lastChat(), /Give a width/);
  });

  test('--ids works without a selection; unknown IDs are reported', () => {
    const { game, o } = setup();
    game.command(`!resizer size large --ids ${o.ogre.id},${o.hero.id}`);
    assert.equal(o.hero.get('width'), 140);
    game.command('!resizer size large --ids nope');
    assert.match(game.lastChat(), /No objects with these IDs: nope/);
  });

  test('nothing selected', () => {
    const { game } = setup();
    game.command('!resizer size 10 10');
    assert.match(game.lastChat(), /Select something first/);
  });

  test('fit keeps the ratio and centres (0.0.9 left it in the corner)', () => {
    const { game, o } = setup();
    o.map.set({ width: 1000, height: 500 });
    game.command('!resizer fit keep_ratio', [o.map]);
    assert.equal(o.map.get('width'), 2100);
    assert.equal(o.map.get('top'), 700);
  });

  test('centre across only', () => {
    const { game, o } = setup();
    game.command('!resizer center h', [o.hero, o.label]);
    assert.equal(o.hero.get('left'), 1050);
    assert.equal(o.hero.get('top'), 175);
    assert.equal(o.label.get('left'), 1050);
    assert.match(game.allChat(), /Centred 2 objects/);
  });

  test('resize the page in units (0.0.9 default), cells and pixels', () => {
    const { game } = setup();
    game.command('!resizer page 40 25');
    assert.equal(game.get('page', 'page1').get('width'), 40);
    game.command('!resizer page 2100 1400 pixels');
    assert.equal(game.get('page', 'page1').get('width'), 30);
    game.get('page', 'page1').set('snapping_increment', 2);
    game.command('!resizer page 10 10 cells');
    assert.equal(game.get('page', 'page1').get('width'), 20);
    game.command('!resizer undo');
    assert.equal(game.get('page', 'page1').get('width'), 30);
  });
});

describe('calibrate', () => {
  /**
   * A map whose own squares are 100 px, with a box drawn over 3 × 2 of them.
   *
   * @param {object} game Sandbox.
   * @returns {{map: object, box: object}} Objects.
   */
  function mapWithBox(game) {
    const map = game.add('graphic', {
      _pageid: 'page1',
      name: 'Crypt',
      layer: 'map',
      left: 510,
      top: 420,
      width: 1000,
      height: 800,
      rotation: 0,
    });
    const box = game.add('pathv2', {
      _pageid: 'page1',
      layer: 'objects',
      shape: 'rec',
      x: 260,
      y: 220,
      points: '[[0,0],[300,0],[300,200],[0,200]]',
      stroke_width: 2,
    });
    return { map, box };
  }

  test('scales the map to the grid, lines it up and deletes the box', () => {
    const { game } = setup();
    const { map, box } = mapWithBox(game);
    game.command('!resizer calibrate 3 2', [box, map]);
    assert.equal(map.get('width'), 700);
    assert.equal(map.get('height'), 560);
    const cornerX = map.get('left') - 350 + 70;
    assert.ok(Math.abs(cornerX % 70) < 1e-6 || Math.abs((cornerX % 70) - 70) < 1e-6);
    assert.equal(game.get('pathv2', box.id), undefined);
    assert.match(game.allChat(), /100 px squares/);
    game.command('!resizer undo');
    assert.equal(map.get('width'), 1000);
    assert.equal(game.ofType('pathv2').filter((p) => p.get('shape') === 'rec').length, 1);
  });

  test('--keep-box and --fit-page', () => {
    const { game } = setup();
    const { map, box } = mapWithBox(game);
    game.command('!resizer calibrate 3 2 --keep-box --fit-page', [map, box]);
    assert.ok(game.get('pathv2', box.id));
    assert.equal(game.get('page', 'page1').get('width'), 10);
    assert.equal(game.get('page', 'page1').get('height'), 8);
  });

  test('--cell needs no box', () => {
    const { game } = setup();
    const { map } = mapWithBox(game);
    game.command('!resizer calibrate --cell 100', [map]);
    assert.equal(map.get('width'), 700);
  });

  test('missing box, missing map and rotated maps are explained', () => {
    const { game } = setup();
    const { map, box } = mapWithBox(game);
    game.command('!resizer calibrate 3', [map]);
    assert.match(game.lastChat(), /Select a rectangle/);
    game.command('!resizer calibrate 3', [box]);
    assert.match(game.lastChat(), /Select the map/);
    map.set('rotation', 45);
    game.command('!resizer calibrate 3 2', [map, box]);
    assert.match(game.lastChat(), /Turn the map/);
  });
});

describe('undo history', () => {
  test('keeps the last 10 changes and survives a restart', () => {
    const { game, o } = setup();
    for (let i = 1; i <= 12; i++) {
      game.command(`!resizer size ${i * 10} ${i * 10}`, [o.hero]);
    }
    assert.equal(game.rState().undo.length, 10);
    const restarted = createSandbox({ state: game.sandbox.state });
    const hero = restarted.add('graphic', { ...o.hero.toJSON() });
    restarted.ready();
    restarted.command('!resizer undo');
    assert.equal(hero.get('width'), 110);
  });

  test('undo with nothing to undo, and history clear', () => {
    const { game, o } = setup();
    game.command('!resizer undo');
    assert.match(game.lastChat(), /Nothing to undo/);
    game.command('!resizer size 10 10', [o.hero]);
    game.command('!resizer history');
    assert.match(game.lastChat(), /Resize 1 graphic/);
    game.command('!resizer history clear');
    assert.equal(game.rState().undo.length, 0);
  });

  test('objects deleted since are reported', () => {
    const { game, o } = setup();
    game.command('!resizer size 10 10', [o.hero, o.ogre]);
    o.ogre.remove();
    game.command('!resizer undo');
    assert.match(game.allChat(), /1 object had been deleted/);
    assert.equal(o.hero.get('width'), 70);
  });
});

describe('settings and menus', () => {
  test('menu shows sizes of the selection and the page', () => {
    const { game, o } = setup();
    game.command('!resizer', [o.ogre]);
    const card = game.lastChat();
    assert.match(card, /Ogre: 140 × 140 px \(2 × 2 cells\)/);
    assert.match(card, /30 × 20 cells, 70 px a cell, 5 ft a cell/);
  });

  test('settings: command rename, bad values, reset', () => {
    const { game } = setup();
    game.command('!resizer set command !My Size');
    assert.equal(game.rState().settings.command, 'mysize');
    game.command('!mysize set scaleStrokes maybe');
    assert.match(game.lastChat(), /not a value/);
    game.command('!mysize set nonsense 1');
    assert.match(game.lastChat(), /Unknown setting/);
    game.command('!mysize reset');
    assert.equal(game.rState().settings.command, 'resizer');
  });

  test('0.0.9 config command|name renames the command', () => {
    const { game } = setup();
    game.command('!resizer config command|rz');
    assert.equal(game.rState().settings.command, 'rz');
  });

  test('unknown commands point to help', () => {
    const { game } = setup();
    game.command('!resizer frobnicate');
    assert.match(game.lastChat(), /Unknown command/);
    game.command('!resizer help');
    assert.match(game.lastChat(), /Resizer Help/);
  });

  test('language change rebuilds handouts in that language', () => {
    const { game } = setup();
    game.command('!resizer set language he');
    assert.equal(game.rState().settings.language, 'he');
    const help = game.ofType('handout').find((h) => h.get('name') === 'Resizer - Help');
    assert.match(help.get('notes'), /direction:rtl/);
  });
});
