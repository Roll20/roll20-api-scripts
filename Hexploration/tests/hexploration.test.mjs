// End-to-end tests of the built Hexploration.js against a stubbed Roll20 API.
// Run `npm run build` first.

import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { createGrid, hexToPixel, pixelToHex } from '../src/grid.js';
import { createSandbox } from './roll20-stub.mjs';

const JG_V = createGrid({ gridType: 'hex', jumpgate: true });
const LEGACY_V = createGrid({ gridType: 'hex', jumpgate: false });

/**
 * Adds a drawn rectangle covering pixel bounds.
 */
function drawRect(game, left, top, right, bottom, jumpgate = true) {
  const w = right - left;
  const h = bottom - top;
  if (jumpgate) {
    return game.add('pathv2', {
      _pageid: 'page1',
      layer: 'objects',
      shape: 'rec',
      points: JSON.stringify([
        [0, 0],
        [w, h],
      ]),
      x: left + w / 2,
      y: top + h / 2,
    });
  }
  return game.add('path', {
    _pageid: 'page1',
    layer: 'objects',
    _path: JSON.stringify([
      ['M', 0, 0],
      ['L', w, 0],
      ['L', w, h],
      ['L', 0, h],
      ['L', 0, 0],
    ]),
    left: left + w / 2,
    top: top + h / 2,
    width: w,
    height: h,
    scaleX: 1,
    scaleY: 1,
  });
}

function addToken(game, grid, row, col, attrs = {}) {
  const [left, top] = hexToPixel(grid, row, col);
  return game.add('graphic', {
    _pageid: 'page1',
    _subtype: 'token',
    layer: 'objects',
    left,
    top,
    width: 70,
    height: 70,
    controlledby: 'p1',
    name: 'Hero',
    statusmarkers: '',
    ...attrs,
  });
}

function hexCount(game) {
  return Object.keys(game.hexState().pages.page1?.hexes || {}).length;
}

function hasHex(game, row, col) {
  return !!game.hexState().pages.page1?.hexes[`${row},${col}`];
}

const games = [];

function readyGame(options) {
  const game = createSandbox(options);
  games.push(game);
  game.ready();
  return game;
}

// No scenario should make the mod log an error.
afterEach(() => {
  for (const game of games.splice(0)) {
    const errors = game.logs.filter((line) => /ERROR|failed/.test(line));
    assert.deepEqual(errors, []);
  }
});

describe('startup', () => {
  it('creates the handouts and greets the GM', () => {
    const game = readyGame();
    const names = game.ofType('handout').map((h) => h.attrs.name);
    assert.deepEqual(names.sort(), ['Hexploration - Command Deck', 'Hexploration - Help']);
    assert.match(game.chat[0].text, /Hexploration is ready/);
    assert.equal(game.hexState().schemaVersion, 2);
    assert.equal(typeof game.sandbox.Hexploration.revealAround, 'function');
  });

  it('ignores commands from players', () => {
    const game = readyGame();
    const before = game.chat.length;
    game.command('!hexploration', [], 'p1');
    assert.equal(game.chat.length, before);
  });
});

describe('filling (Jumpgate)', () => {
  it('fills a drawn rectangle with pathv2 hexes on the foreground layer', () => {
    const game = readyGame();
    const rect = drawRect(game, 0, 0, 700, 500);
    game.command('!hexploration fill', [rect]);
    assert.ok(hexCount(game) > 40, `expected many hexes, got ${hexCount(game)}`);
    const hexes = game.ofType('pathv2');
    assert.equal(hexes.length, hexCount(game));
    assert.ok(hexes.every((h) => h.attrs.layer === 'foreground' && h.attrs.shape === 'pol'));
    assert.ok(!game.objects.has(rect.id), 'source shape is consumed');
    assert.match(game.lastChat(), /Fill complete/);
  });

  it('falls back to the token layer when foreground is unavailable', () => {
    const game = readyGame({ foreground: false });
    game.command('!hexploration fill', [drawRect(game, 0, 0, 300, 300)]);
    const hexes = game.ofType('pathv2');
    assert.ok(hexes.length > 0);
    assert.ok(hexes.every((h) => h.attrs.layer === 'objects'));
    assert.ok(game.chat.some((c) => /foreground layer/.test(c.text)));
  });

  it('inverse fill covers the page except the selected area', () => {
    const game = readyGame();
    game.command('!hexploration fill inverse', [drawRect(game, 200, 200, 500, 400)]);
    assert.ok(hexCount(game) > 100);
    assert.ok(!hasHex(game, ...pixelToHex(JG_V, 350, 300)), 'inside the shape stays open');
    assert.ok(hasHex(game, 0, 0));
    assert.ok(hasHex(game, ...pixelToHex(JG_V, 20 * 70 - 5, 15 * 70 - 5)), 'far corner is covered');
  });

  it('undo removes the hexes and restores the shape', () => {
    const game = readyGame();
    game.command('!hexploration fill', [drawRect(game, 0, 0, 400, 400)]);
    const created = hexCount(game);
    assert.ok(created > 0);
    game.command('!hexploration undo');
    assert.equal(hexCount(game), 0);
    assert.equal(game.ofType('pathv2').length, 1, 'only the restored shape remains');
    assert.match(game.lastChat(), new RegExp(`Hexes removed: ${created}`));
  });

  it('refuses to fill on a square grid', () => {
    const game = readyGame();
    game.objects.get('page1').attrs.grid_type = 'square';
    game.command('!hexploration fill', [drawRect(game, 0, 0, 300, 300)]);
    assert.match(game.lastChat(), /does not use a hex grid/);
  });
});

describe('revealing', () => {
  it('reveals the hexes along a player token’s route and around it', () => {
    const game = readyGame();
    game.command('!hexploration set revealDistance 1');
    game.command('!hexploration fill', [drawRect(game, 0, 0, 1400, 1000)]);
    const token = addToken(game, JG_V, 1, 1);
    const [x2, y2] = hexToPixel(JG_V, 1, 8);
    game.move(token, x2, y2);
    for (let col = 1; col <= 8; col++) {
      assert.ok(!hasHex(game, 1, col), `hex 1,${col} on the route should be revealed`);
    }
    assert.ok(!hasHex(game, 0, 8) && !hasHex(game, 2, 8), 'neighbours of the end are revealed');
    assert.ok(hasHex(game, 5, 5), 'distant hexes stay hidden');
  });

  it('follows waypoints from lastmove', () => {
    const game = readyGame();
    game.command('!hexploration set revealDistance 0');
    game.command('!hexploration fill', [drawRect(game, 0, 0, 1400, 1000)]);
    const token = addToken(game, JG_V, 1, 1);
    const start = hexToPixel(JG_V, 1, 1);
    const corner = hexToPixel(JG_V, 6, 1);
    const end = hexToPixel(JG_V, 6, 6);
    game.move(token, end[0], end[1], `${start[0]},${start[1]},${corner[0]},${corner[1]}`);
    assert.ok(!hasHex(game, 4, 1), 'hex on the first leg is revealed');
    assert.ok(!hasHex(game, 6, 4), 'hex on the second leg is revealed');
    assert.ok(hasHex(game, 3, 4), 'hex off the route stays hidden');
  });

  it('does not reveal for GM-only tokens or tokens on the GM layer', () => {
    const game = readyGame();
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    const total = hexCount(game);
    const monster = addToken(game, JG_V, 1, 1, { controlledby: '', represents: 'char1' });
    game.move(monster, ...hexToPixel(JG_V, 2, 4));
    const hidden = addToken(game, JG_V, 1, 1, { layer: 'gmlayer' });
    game.move(hidden, ...hexToPixel(JG_V, 3, 3));
    assert.equal(hexCount(game), total);
  });

  it('character mode reveals for any token representing a character', () => {
    const game = readyGame();
    game.command('!hexploration set revealBy characters');
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    const monster = addToken(game, JG_V, 1, 1, { controlledby: '', represents: 'char1' });
    game.move(monster, ...hexToPixel(JG_V, 2, 4));
    assert.ok(!hasHex(game, 2, 4));
  });

  it('line of sight stops reveals behind hexes with a reveal-distance limit', () => {
    const game = readyGame();
    game.command('!hexploration set revealDistance 3');
    game.command('!hexploration set maxDistance 0');
    // A wall of "mountain" hexes that can only be revealed by entering them.
    game.command('!hexploration fill', [drawRect(game, 300, 0, 380, 700)]);
    game.command('!hexploration set maxDistance');
    game.command('!hexploration fill', [drawRect(game, 380, 0, 700, 700)]);
    const token = addToken(game, JG_V, 4, 2);
    game.move(token, ...hexToPixel(JG_V, 4, 3));
    assert.ok(hasHex(game, 4, 4), 'mountain hex next to the token stays');
    assert.ok(hasHex(game, 4, 5), 'hex behind the mountain stays');
  });

  it('glimpse mode makes nearby hexes see-through', () => {
    const game = readyGame();
    game.command('!hexploration set revealMode glimpse');
    game.command('!hexploration set revealDistance 1');
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    const token = addToken(game, JG_V, 2, 2);
    game.move(token, ...hexToPixel(JG_V, 2, 3));
    assert.ok(!hasHex(game, 2, 3), 'entered hex is removed');
    const neighbour = game.hexState().pages.page1.hexes['2,4'];
    assert.equal(neighbour.glimpsed, true);
    const path = game.objects.get(neighbour.id);
    // Jumpgate ignores rgba(), so the default glimpse colour is converted.
    assert.equal(path.attrs.fill, '#22222280');
  });

  it('converts rgba() hex colours for Jumpgate', () => {
    const game = readyGame();
    game.command('!hexploration set fillColor rgba(255,0,0,0.25)');
    game.command('!hexploration set strokeColor rgb(0,128,255)');
    game.command('!hexploration fill', [drawRect(game, 0, 0, 300, 300)]);
    const hexes = game.ofType('pathv2');
    assert.ok(hexes.length > 0);
    assert.ok(hexes.every((h) => h.attrs.fill === '#ff000040' && h.attrs.stroke === '#0080ff'));
  });

  it('repaints Jumpgate hexes glimpsed before the colour fix', () => {
    const game = readyGame();
    game.command('!hexploration set revealMode glimpse');
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    const neighbour = game.hexState().pages.page1.hexes['2,4'];
    neighbour.glimpsed = true;
    const token = addToken(game, JG_V, 2, 2);
    game.move(token, ...hexToPixel(JG_V, 2, 3));
    assert.equal(game.objects.get(neighbour.id).attrs.fill, '#22222280');
  });

  it('keeps rgba() glimpse colours in Legacy games', () => {
    const game = readyGame({ jumpgate: false });
    game.command('!hexploration set revealMode glimpse');
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500, false)]);
    const token = addToken(game, LEGACY_V, 2, 2);
    game.move(token, ...hexToPixel(LEGACY_V, 2, 3));
    const neighbour = game.hexState().pages.page1.hexes['2,4'];
    assert.equal(neighbour.glimpsed, true);
    assert.equal(game.objects.get(neighbour.id).attrs.fill, 'rgba(34,34,34,0.5)');
  });

  it('reveals through the public API and the explore command', () => {
    const game = readyGame();
    game.command('!hexploration set revealDistance 0');
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    const token = addToken(game, JG_V, 2, 2);
    assert.ok(game.sandbox.Hexploration.revealAround(token.id) >= 1);
    assert.ok(!hasHex(game, 2, 2));
    const npc = addToken(game, JG_V, 3, 5, { controlledby: '' });
    game.command('!hexploration explore', [npc]);
    assert.ok(!hasHex(game, 3, 5));
  });

  it('reveal, conceal and reveal page work on selections', () => {
    const game = readyGame();
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    const hex = game.objects.get(game.hexState().pages.page1.hexes['2,2'].id);
    game.command('!hexploration reveal', [hex]);
    assert.ok(!hasHex(game, 2, 2));
    const marker = addToken(game, JG_V, 2, 2, { controlledby: '' });
    game.command('!hexploration conceal', [marker]);
    assert.ok(hasHex(game, 2, 2));
    game.command('!hexploration reveal page');
    assert.equal(hexCount(game), 0);
  });

  it('reset page asks first, then removes everything', () => {
    const game = readyGame();
    game.command('!hexploration fill', [drawRect(game, 0, 0, 400, 400)]);
    game.command('!hexploration reset page');
    assert.ok(hexCount(game) > 0);
    assert.match(game.lastChat(), /Yes, Remove All Hexes/);
    game.command('!hexploration reset page confirm');
    assert.equal(hexCount(game), 0);
    assert.equal(game.ofType('pathv2').length, 0);
  });
});

describe('hiding covered tokens', () => {
  const visible = { showplayers_name: true, showplayers_bar1: true, showplayers_aura1: true };

  it('hides player-visible details of tokens covered by a fill, and restores them on reveal', () => {
    const game = readyGame();
    const monster = addToken(game, JG_V, 2, 2, { controlledby: '', ...visible });
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    assert.equal(monster.attrs.showplayers_name, false);
    assert.equal(monster.attrs.showplayers_bar1, false);
    assert.equal(monster.attrs.showplayers_aura1, false);
    const hex = game.objects.get(game.hexState().pages.page1.hexes['2,2'].id);
    game.command('!hexploration reveal', [hex]);
    assert.equal(monster.attrs.showplayers_name, true);
    assert.equal(monster.attrs.showplayers_bar1, true);
    assert.equal(monster.attrs.showplayers_bar2, false, 'flags that were off stay off');
    assert.equal(Object.keys(game.hexState().coveredTokens).length, 0);
  });

  it('hides a token moved under hexes and restores it when it moves out', () => {
    const game = readyGame();
    game.command('!hexploration fill', [drawRect(game, 0, 0, 400, 400)]);
    const monster = addToken(game, JG_V, 9, 9, { controlledby: '', ...visible });
    game.move(monster, ...hexToPixel(JG_V, 2, 2));
    assert.equal(monster.attrs.showplayers_name, false);
    game.move(monster, ...hexToPixel(JG_V, 9, 9));
    assert.equal(monster.attrs.showplayers_name, true);
  });

  it('restores tokens uncovered by a player token’s reveal', () => {
    const game = readyGame();
    game.command('!hexploration set revealDistance 1');
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    const monster = addToken(game, JG_V, 3, 4, { controlledby: '', ...visible });
    game.command('!hexploration rescan');
    assert.equal(monster.attrs.showplayers_name, false);
    const hero = addToken(game, JG_V, 3, 1);
    game.move(hero, ...hexToPixel(JG_V, 3, 3));
    assert.equal(monster.attrs.showplayers_name, true);
  });

  it('keeps details switched on by the GM hidden until the token is uncovered', () => {
    const game = readyGame();
    const monster = addToken(game, JG_V, 2, 2, { controlledby: '' });
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    game.edit(monster, { showplayers_name: true, showplayers_bar1: true });
    assert.equal(monster.attrs.showplayers_name, false);
    assert.equal(monster.attrs.showplayers_bar1, false);
    const hex = game.objects.get(game.hexState().pages.page1.hexes['2,2'].id);
    game.command('!hexploration reveal', [hex]);
    assert.equal(monster.attrs.showplayers_name, true);
    assert.equal(monster.attrs.showplayers_bar1, true);
  });

  it('does nothing when switched off, and restores everything when turned off', () => {
    const game = readyGame();
    const monster = addToken(game, JG_V, 2, 2, { controlledby: '', ...visible });
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    assert.equal(monster.attrs.showplayers_name, false);
    game.command('!hexploration set hideCoveredTokens off');
    assert.equal(monster.attrs.showplayers_name, true);
    game.command('!hexploration conceal', [monster]);
    assert.equal(monster.attrs.showplayers_name, true);
  });
});

describe('locations', () => {
  it('hides marked tokens under a fill and announces them when found', () => {
    const game = readyGame();
    game.command('!hexploration set revealDistance 0');
    const tower = addToken(game, JG_V, 3, 3, {
      name: 'Old Tower',
      controlledby: '',
      imgsrc: 'https://example.com/t.png',
    });
    game.command('!hexploration mark', [tower]);
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    assert.equal(tower.attrs.layer, 'gmlayer');
    const hero = addToken(game, JG_V, 3, 1);
    game.move(hero, ...hexToPixel(JG_V, 3, 3));
    assert.equal(tower.attrs.layer, 'objects');
    assert.equal(tower.attrs.showname, true);
    assert.ok(
      game.chat.some((c) => /Location Discovered/.test(c.text) && /Old Tower/.test(c.text))
    );
  });

  it('honours the v1 white-tower marker', () => {
    const game = readyGame();
    const tower = addToken(game, JG_V, 2, 2, {
      name: 'Ruin',
      controlledby: '',
      statusmarkers: 'white-tower',
    });
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    assert.equal(tower.attrs.layer, 'gmlayer');
    assert.equal(game.hexState().pages.page1.hexes['2,2'].iconId, tower.id);
  });

  it('names a hex, shows a GM label and escapes the announcement', () => {
    const game = readyGame();
    game.command('!hexploration set revealDistance 0');
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    const hex = game.objects.get(game.hexState().pages.page1.hexes['2,3'].id);
    game.command('!hexploration name <b>Cave</b>', [hex]);
    const label = game.ofType('text')[0];
    assert.equal(label.attrs.layer, 'gmlayer');
    // Jumpgate stops drawing the tabletop when a text has no font
    assert.equal(label.attrs.font_family, 'Arial');
    const hero = addToken(game, JG_V, 2, 1);
    game.move(hero, ...hexToPixel(JG_V, 2, 3));
    const announcement = game.chat.find((c) => /Location Discovered/.test(c.text));
    assert.ok(announcement.text.includes('&lt;b&gt;Cave&lt;/b&gt;'));
    assert.equal(game.ofType('text').length, 0, 'label removed on reveal');
  });

  it('can whisper discoveries to the GM and ping players', () => {
    const game = readyGame();
    game.command('!hexploration set announce gm');
    game.command('!hexploration set pingDiscoveries on');
    game.command('!hexploration fill', [drawRect(game, 0, 0, 700, 500)]);
    const hex = game.objects.get(game.hexState().pages.page1.hexes['2,3'].id);
    game.command('!hexploration name Cave', [hex]);
    game.command('!hexploration reveal', [hex]);
    assert.ok(game.chat.some((c) => c.text.startsWith('/w gm') && /Cave/.test(c.text)));
    assert.equal(game.pings.length, 1);
  });
});

describe('maintenance', () => {
  it('gives name labels from earlier versions a font on startup', () => {
    const first = readyGame();
    first.command('!hexploration fill', [drawRect(first, 0, 0, 700, 500)]);
    const hex = first.objects.get(first.hexState().pages.page1.hexes['2,3'].id);
    first.command('!hexploration name Cave', [hex]);
    const label = first.ofType('text')[0];
    // As 2.0.0 and 2.0.1 made it
    label.attrs.font_family = 'unset';
    // Restart the sandbox with the same objects and state
    first.ready();
    assert.equal(label.attrs.font_family, 'Arial');
    assert.ok(first.logs.some((line) => /gave 1 hex name label/.test(line)));
  });

  it('forgets hexes deleted by hand', () => {
    const game = readyGame();
    game.command('!hexploration fill', [drawRect(game, 0, 0, 400, 400)]);
    const before = hexCount(game);
    game.deleteObj(game.objects.get(game.hexState().pages.page1.hexes['1,1'].id));
    assert.equal(hexCount(game), before - 1);
  });

  it('rescan adopts hexes the mod does not know about', () => {
    const game = readyGame();
    game.command('!hexploration fill', [drawRect(game, 0, 0, 400, 400)]);
    const before = hexCount(game);
    game.hexState().pages.page1.hexes = {};
    game.command('!hexploration rescan');
    assert.equal(hexCount(game), before);
    assert.match(game.lastChat(), new RegExp(`Adopted: ${before}`));
  });

  it('calibrate re-files hexes when the grid moves', () => {
    const game = readyGame();
    game.command('!hexploration fill', [drawRect(game, 0, 0, 400, 400)]);
    const before = hexCount(game);
    const [x, y] = hexToPixel(JG_V, 2, 2);
    const token = game.add('graphic', {
      _pageid: 'page1',
      _subtype: 'token',
      layer: 'objects',
      left: x + 3,
      top: y - 2,
    });
    game.command('!hexploration calibrate', [token]);
    assert.match(game.lastChat(), /Grid calibrated/);
    assert.equal(hexCount(game), before);
    game.command('!hexploration calibrate reset');
    assert.match(game.lastChat(), /Calibration removed/);
  });

  it('page settings override the global settings', () => {
    const game = readyGame();
    game.command('!hexploration page set revealDistance 0');
    assert.equal(game.hexState().pages.page1.settings.revealDistance, 0);
    game.command('!hexploration page set fillColor red');
    assert.match(game.lastChat(), /can be set per page/);
    game.command('!hexploration page clear');
    assert.equal(Object.keys(game.hexState().pages.page1.settings).length, 0);
  });

  it('rejects invalid settings', () => {
    const game = readyGame();
    game.command('!hexploration set fillColor not a colour!');
    assert.match(game.lastChat(), /not a valid value/);
    game.command('!hexploration set revealDistance -3');
    assert.match(game.lastChat(), /not a valid value/);
  });

  it('shows status, help and the language list', () => {
    const game = readyGame();
    game.command('!hexploration status');
    assert.match(game.lastChat(), /Jumpgate/);
    game.command('!hexploration help');
    assert.match(game.lastChat(), /calibrate reset/);
    game.command('!hexploration set language');
    assert.match(game.lastChat(), /Choose a Language/);
  });
});

describe('Legacy games and v1 upgrade', () => {
  it('draws Legacy paths in a Legacy game', () => {
    const game = readyGame({ jumpgate: false });
    game.command('!hexploration fill', [drawRect(game, 0, 0, 400, 400, false)]);
    assert.ok(hexCount(game) > 0);
    assert.equal(game.ofType('pathv2').length, 0);
    assert.ok(game.ofType('path').every((p) => typeof p.attrs._path === 'string'));
  });

  it('migrates v1 state and keeps v1 commands working', () => {
    const v1State = {
      Hexploration: {
        pageHexes: { page1: {} },
        hexIdMap: {},
        config: {
          fillColor: '#FFFF88',
          labelColor: '#333333',
          strokeColor: '#DDDD88',
          strokeWidth: 0,
          revealDistance: 2,
        },
      },
    };
    const game = createSandbox({ jumpgate: false, state: v1State });
    // A v1 hex path at 1,1 with a name.
    const [x, y] = hexToPixel(LEGACY_V, 1, 1);
    const path = game.add('path', {
      _pageid: 'page1',
      layer: 'objects',
      _path: '[]',
      left: x,
      top: y,
      width: 75,
      height: 88,
    });
    v1State.Hexploration.pageHexes.page1['1,1'] = { id: path.id, name: 'Old Mill' };
    v1State.Hexploration.hexIdMap[path.id] = ['page1', '1,1'];
    game.ready();

    const s = game.hexState();
    assert.equal(s.schemaVersion, 2);
    assert.equal(s.config.revealDistance, 2);
    assert.equal(s.config.fillColor, '#FFFF88');
    assert.equal(s.pages.page1.hexes['1,1'].name, 'Old Mill');
    assert.ok(game.chat.some((c) => /have been upgraded/.test(c.text)));

    game.command('!hexploration_showMenuMain');
    assert.match(game.lastChat(), /Inverse Fill/);
    game.command('!hexploration_configModifyProperty color&&#000000&&#111111&&#222222');
    assert.equal(s.config.strokeColor, '#111111');
    game.command('!hexploration_configModifyProperty revealDistance&&3');
    assert.equal(s.config.revealDistance, 3);
  });

  it('prunes hexes whose paths vanished while the API was off', () => {
    const state = {
      Hexploration: {
        pageHexes: { page1: { '1,1': { id: '-gone' } } },
        hexIdMap: { '-gone': ['page1', '1,1'] },
        config: {},
      },
    };
    const game = readyGame({ state });
    assert.equal(hexCount(game), 0);
    assert.ok(game.chat.some((c) => /no longer exist/.test(c.text)));
  });
});
