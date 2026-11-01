// End-to-end tests: load the built bundle into the Roll20 stub and drive it
// with chat commands, token drags and the clock.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSandbox } from './roll20-stub.mjs';

/**
 * Creates a ready game and checks afterwards that the Mod logged no errors.
 *
 * @param {object} [options] Sandbox options.
 * @returns {object} Sandbox API.
 */
function game(options) {
  const api = createSandbox(options);
  api.ready();
  return api;
}

/**
 * Fails when the Mod logged an error.
 *
 * @param {object} api Sandbox API.
 * @returns {void}
 */
function assertNoErrors(api) {
  const errors = api.logs.filter((line) => /ERROR|failed/i.test(line));
  assert.deepEqual(errors, []);
}

/**
 * Returns a token's position.
 *
 * @param {object} token Stub graphic.
 * @returns {number[]} [left, top].
 */
function at(token) {
  return [Math.round(token.attrs.left), Math.round(token.attrs.top)];
}

test('starts, greets the GM and creates GM-only handouts', () => {
  const api = game();
  assert.match(api.allChat(), /TokenController is ready/);
  const handouts = api.sandbox.findObjs({ _type: 'handout' });
  assert.deepEqual(handouts.map((h) => h.get('name')).sort(), [
    'TokenController - Command Deck',
    'TokenController - Help',
  ]);
  for (const handout of handouts) {
    assert.equal(handout.get('inplayerjournals'), '');
  }
  assert.equal(typeof api.sandbox.TokenController.ObserveTokenChange, 'function');
  assertNoErrors(api);
});

test('a patrol walks its route one cell per interval and loops', () => {
  const api = game();
  const guard = api.token();
  api.command('!tokencontroller add Box R1D1L1U1');
  api.command('!tokencontroller start Box', [guard]);
  assert.match(api.allChat(), /Guard started on "Box"/);
  api.advance(2000);
  assert.deepEqual(at(guard), [175, 105]);
  api.advance(2000);
  assert.deepEqual(at(guard), [175, 175]);
  api.advance(4000);
  assert.deepEqual(at(guard), [105, 105]);
  api.advance(2000);
  assert.deepEqual(at(guard), [175, 105]);
  assertNoErrors(api);
});

test('back-and-forth routes return exactly to where they started', () => {
  const api = game();
  const guard = api.token();
  api.command('!tokencontroller add Walk U1R2');
  api.command('!tokencontroller set interval 1000');
  api.command('!tokencontroller start Walk', [guard]);
  api.advance(6000);
  assert.deepEqual(at(guard), [105, 105]);
  api.advance(6000);
  assert.deepEqual(at(guard), [105, 105]);
  assertNoErrors(api);
});

test('stop leaves a token in place; reset puts it back', () => {
  const api = game();
  const guard = api.token();
  api.command('!tokencontroller add East R5');
  api.command('!tokencontroller start East', [guard]);
  api.advance(4000);
  api.command('!tokencontroller stop', [guard]);
  const stoppedAt = at(guard);
  api.advance(4000);
  assert.deepEqual(at(guard), stoppedAt);

  api.command('!tokencontroller start East', [guard]);
  api.advance(4000);
  api.command('!tokencontroller reset East');
  assert.deepEqual(at(guard), stoppedAt);
  assert.equal(Object.keys(api.tcState().patrols).length, 0);
  assertNoErrors(api);
});

test('editing a token by hand no longer stops its patrol (v4 bug)', () => {
  const api = game();
  const guard = api.token();
  api.command('!tokencontroller add East R5');
  api.command('!tokencontroller start East', [guard]);
  // A bar change raises change:graphic without moving the token.
  const prev = { ...guard.attrs };
  guard.attrs.bar1_value = 3;
  api.drag(guard, prev.left, prev.top);
  api.advance(2000);
  assert.deepEqual(at(guard), [175, 105]);
  assertNoErrors(api);
});

test('dragging a patrolling token carries the route on from there', () => {
  const api = game();
  const guard = api.token();
  api.command('!tokencontroller add East R5');
  api.command('!tokencontroller start East', [guard]);
  api.advance(2000);
  api.drag(guard, 175, 385);
  api.advance(2000);
  assert.deepEqual(at(guard), [245, 385]);
  assertNoErrors(api);
});

test('patrols pause in combat and step with the turn order', () => {
  const api = game();
  const guard = api.token();
  api.command('!tokencontroller add East R9');
  api.command('!tokencontroller start East', [guard]);
  api.setTurnOrder([{ id: 'a', pr: 10 }]);
  api.advance(4000);
  assert.deepEqual(at(guard), [105, 105]);
  assert.match(api.allChat(), /patrols are paused/);

  api.command('!tokencontroller set combatBehaviour step');
  api.setTurnOrder([
    { id: 'b', pr: 5 },
    { id: 'a', pr: 10 },
  ]);
  assert.deepEqual(at(guard), [175, 105]);

  api.setTurnOrder([], false);
  api.advance(2000);
  assert.deepEqual(at(guard), [245, 105]);
  assertNoErrors(api);
});

test('manual combat switch pauses patrols', () => {
  const api = game();
  const guard = api.token();
  api.command('!tokencontroller add East R9');
  api.command('!tokencontroller start East', [guard]);
  api.command('!tokencontroller combat on');
  api.advance(4000);
  assert.deepEqual(at(guard), [105, 105]);
  api.command('!tokencontroller combat off');
  api.advance(2000);
  assert.deepEqual(at(guard), [175, 105]);
  assertNoErrors(api);
});

test('locked tokens hold still and use the native lock', () => {
  const api = game();
  const guard = api.token();
  api.command('!tokencontroller add East R9');
  api.command('!tokencontroller lock', [guard]);
  assert.equal(guard.attrs.lockMovement, true);
  api.command('!tokencontroller start East', [guard]);
  assert.match(api.allChat(), /locked/);
  api.command('!tokencontroller unlock', [guard]);
  assert.equal(guard.attrs.lockMovement, false);
  assertNoErrors(api);
});

test('revert locks undo drags and markers are added and removed', () => {
  const api = game();
  const statue = api.token({ name: 'Statue', statusmarkers: 'blue' });
  api.command('!tokencontroller set lockMode revert');
  api.command('!tokencontroller set lockMarker red');
  api.command('!tokencontroller lock', [statue]);
  assert.equal(statue.attrs.statusmarkers, 'blue,red');
  api.drag(statue, 500, 500);
  assert.deepEqual(at(statue), [105, 105]);
  api.command('!tokencontroller unlock', [statue]);
  assert.equal(statue.attrs.statusmarkers, 'blue');
  assertNoErrors(api);
});

test('each lock keeps the mode it was made with', () => {
  const api = game();
  const statue = api.token({ name: 'Statue' });
  const crate = api.token({ name: 'Crate', left: 175 });
  api.command('!tokencontroller set lockMode freeze');
  api.command('!tokencontroller lock', [crate]);
  api.command('!tokencontroller set lockMode revert');
  api.command('!tokencontroller lock', [statue]);
  api.command('!tokencontroller set lockMode freeze');
  api.drag(statue, 455, 455);
  api.drag(crate, 385, 385);
  assert.deepEqual(at(statue), [105, 105]);
  assert.deepEqual(at(crate), [385, 385]);
  assertNoErrors(api);
});

test('a locked patrol waits where it is and carries on when unlocked', () => {
  const api = game();
  const guard = api.token();
  api.command('!tokencontroller add Lane R4');
  api.command('!tokencontroller start Lane', [guard]);
  api.advance(2000);
  assert.deepEqual(at(guard), [175, 105]);
  api.command('!tokencontroller set lockMode freeze');
  api.command('!tokencontroller lock', [guard]);
  api.advance(6000);
  assert.deepEqual(at(guard), [175, 105]);
  api.command('!tokencontroller unlock', [guard]);
  api.advance(2000);
  assert.deepEqual(at(guard), [245, 105]);
  assertNoErrors(api);
});

test('--ids picks tokens for start, stop, reset, lock and remove without a selection', () => {
  const api = game();
  const a = api.token({ name: 'A' });
  const b = api.token({ name: 'B', top: 245 });
  const c = api.token({ name: 'C', top: 385 });
  api.command('!tokencontroller add East R9');
  api.command(`!tc start East --ids ${a.id};${b.id};${c.id}`, [], 'API');
  assert.equal(Object.keys(api.tcState().patrols).length, 3);
  api.advance(2000);

  api.command(`!tc stop --ids ${a.id}`, [], 'API');
  assert.equal(api.tcState().patrols[a.id], undefined);
  api.command(`!tc remove --ids ${b.id} -nosuchtoken`, [], 'API');
  assert.equal(api.tcState().patrols[b.id], undefined);
  assert.ok(Object.values(api.tcState().routes).some((r) => r.name === 'East'));
  assert.match(api.allChat(), /so they were skipped: -nosuchtoken/);

  api.command(`!tc reset --ids|${c.id}`, [], 'API');
  assert.deepEqual(at(c), [105, 385]);
  api.command(`!tc lock --ids ${a.id},${b.id}`, [], 'API');
  assert.ok(api.tcState().locks[a.id] && api.tcState().locks[b.id]);
  api.command(`!tc unlock --ids ${a.id}`, [], 'API');
  assert.equal(api.tcState().locks[a.id], undefined);

  api.command('!tc stop --ids -gone', [], 'API');
  assert.match(api.lastChat(), /No tokens have these IDs: -gone/);
  assertNoErrors(api);
});

test('tokens with a Stop Marker leave their routes, set by hand or by another Mod', () => {
  const api = game();
  const guard = api.token();
  const ghoul = api.token({ name: 'Ghoul', top: 245 });
  api.command('!tokencontroller set stopMarkers dead;Bloodied');
  assert.equal(api.tcState().config.stopMarkers, 'dead;Bloodied');
  api.command('!tokencontroller add East R9');
  api.command('!tokencontroller start East', [guard, ghoul]);
  api.advance(2000);

  // Another Mod sets a marker: no change event, so the next tick notices it.
  guard.attrs.statusmarkers = 'blue,dead@3';
  api.advance(250);
  assert.equal(api.tcState().patrols[guard.id], undefined);
  assert.match(api.allChat(), /Stopped by a Stop Marker: Guard/);

  // A GM adds a custom marker by hand: it is matched by its name.
  api.edit(ghoul, { statusmarkers: 'Bloodied::4012' });
  assert.equal(api.tcState().patrols[ghoul.id], undefined);
  const ghoulAt = at(ghoul);
  api.advance(4000);
  assert.deepEqual(at(ghoul), ghoulAt);

  api.command('!tokencontroller start East', [guard]);
  assert.match(api.lastChat(), /cannot start: they have a Stop Marker/);
  assertNoErrors(api);
});

test('a Stop Marker can send a token back, and stops followers of a marked leader', () => {
  const api = game();
  const leader = api.token({ name: 'Captain', left: 245 });
  const first = api.token({ name: 'First', left: 175 });
  api.command('!tokencontroller set stopMarkers dead');
  api.command('!tokencontroller set markerAction reset');
  api.command('!tokencontroller follow Captain', [first]);
  api.command('!tokencontroller add East R5');
  api.command('!tokencontroller start East', [leader]);
  api.advance(4000);
  leader.attrs.statusmarkers = 'dead';
  api.advance(250);
  assert.deepEqual(at(leader), [245, 105]);
  assert.equal(api.tcState().follows[first.id], undefined);
  assert.match(api.allChat(), /Sent back to where they started by a Stop Marker: Captain/);
  assert.match(api.allChat(), /Stopped by a Stop Marker: First/);
  api.command('!tokencontroller set stopMarkers bad@name');
  assert.match(api.lastChat(), /not a valid value/);
  assertNoErrors(api);
});

/**
 * Adds a dynamic lighting wall from (x, y1) to (x, y2) on the default page.
 *
 * @param {object} api Sandbox API.
 * @param {number} x Wall x.
 * @param {number} y1 Top.
 * @param {number} y2 Bottom.
 * @param {object} [attrs] Extra attributes.
 * @returns {object} The wall.
 */
function addWall(api, x, y1, y2, attrs = {}) {
  return api.add('pathv2', {
    _pageid: 'page1',
    layer: 'walls',
    shape: 'pol',
    points: JSON.stringify([
      [0, 0],
      [0, y2 - y1],
    ]),
    x,
    y: (y1 + y2) / 2,
    ...attrs,
  });
}

test('walls stop patrols when the Walls setting is on, and routes can ignore them', () => {
  const api = game();
  addWall(api, 210, 0, 420);
  const guard = api.token();
  const ghost = api.token({ name: 'Ghost', top: 245 });
  api.command('!tokencontroller add East R5');
  api.command('!tokencontroller copy East Haunt');
  api.command('!tokencontroller route Haunt walls off');
  api.command('!tokencontroller set wallMode hold');
  api.command('!tokencontroller start East', [guard]);
  api.command('!tokencontroller start Haunt', [ghost]);
  api.advance(8000);
  assert.deepEqual(at(guard), [175, 105]);
  assert.deepEqual(at(ghost), [385, 245]);

  // Turning back walks the patrol to and fro on its own side of the wall.
  api.command('!tokencontroller set wallMode turn');
  api.advance(2000);
  assert.deepEqual(at(guard), [105, 105]);
  api.advance(2000);
  assert.deepEqual(at(guard), [175, 105]);
  api.advance(2000);
  assert.deepEqual(at(guard), [105, 105]);
  assertNoErrors(api);
});

test('closed doors block until they open; one-way walls follow their setting', () => {
  const api = game();
  const door = api.add('door', {
    _pageid: 'page1',
    x: 210,
    y: -105,
    isOpen: false,
    path: { handle0: { x: 0, y: 70 }, handle1: { x: 0, y: -70 } },
  });
  addWall(api, 280, 210, 280, { barrierType: 'oneWay' });
  const guard = api.token();
  const scout = api.token({ name: 'Scout', top: 245 });
  api.command('!tokencontroller set wallMode hold');
  api.command('!tokencontroller set oneWayWalls pass');
  api.command('!tokencontroller add East R5');
  api.command('!tokencontroller start East', [guard, scout]);
  api.advance(4000);
  assert.deepEqual(at(guard), [175, 105]);
  assert.deepEqual(at(scout), [245, 245]);
  api.edit(door, { isOpen: true });
  api.advance(2000);
  assert.deepEqual(at(guard), [245, 105]);
  api.advance(2000);
  assert.deepEqual(at(scout), [385, 245]);
  assertNoErrors(api);
});

test('Legacy walls drawn as paths stop followers too', () => {
  const api = game({ jumpgate: false });
  api.add('path', {
    _pageid: 'page1',
    layer: 'walls',
    _path: JSON.stringify([
      ['M', 0, 0],
      ['L', 0, 420],
    ]),
    left: 280,
    top: 210,
    width: 0,
    height: 420,
  });
  const leader = api.token({ name: 'Captain', left: 245 });
  const dog = api.token({ name: 'Dog', left: 175 });
  api.command('!tokencontroller set wallMode hold');
  api.command('!tokencontroller set followMode formation');
  api.command('!tokencontroller follow Captain', [dog]);
  api.drag(leader, 385, 105);
  assert.deepEqual(at(dog), [175, 105]);
  assertNoErrors(api);
});

test('followers walk single file behind a patrolling leader', () => {
  const api = game();
  const leader = api.token({ name: 'Captain', left: 245 });
  const first = api.token({ name: 'First', left: 175 });
  const second = api.token({ name: 'Second', left: 105 });
  api.command('!tokencontroller leader', [leader]);
  api.command('!tokencontroller follow', [first, second]);
  api.command('!tokencontroller add East R5');
  api.command('!tokencontroller start East', [leader]);
  api.advance(2000);
  assert.deepEqual(at(leader), [315, 105]);
  assert.deepEqual(at(first), [245, 105]);
  api.advance(2000);
  assert.deepEqual(at(leader), [385, 105]);
  assert.deepEqual(at(first), [315, 105]);
  assert.deepEqual(at(second), [245, 105]);
  assertNoErrors(api);
});

test('formation followers keep their place and follow dragged leaders by name', () => {
  const api = game();
  const leader = api.token({ name: 'Wagon Master' });
  const cart = api.token({ name: 'Cart', left: 105, top: 175 });
  api.command('!tokencontroller set followMode formation');
  api.command('!tokencontroller follow Wagon Master', [cart]);
  api.drag(leader, 455, 315);
  assert.deepEqual(at(cart), [455, 385]);
  assertNoErrors(api);
});

test('formation followers that start between cells land in a cell', () => {
  const api = game();
  const leader = api.token({ name: 'Scout' });
  const mule = api.token({ name: 'Mule', left: 112, top: 182 });
  api.command('!tokencontroller set followMode formation');
  api.command('!tokencontroller follow Scout', [mule]);
  api.drag(leader, 455, 315);
  assert.deepEqual(at(mule), [455, 385]);
  assertNoErrors(api);
});

test('followers cannot follow in a circle', () => {
  const api = game();
  const a = api.token({ name: 'A' });
  const b = api.token({ name: 'B', left: 175 });
  api.command('!tokencontroller follow A', [b]);
  api.command('!tokencontroller follow B', [a]);
  assert.match(api.lastChat(), /cannot follow a token that follows them/);
  assertNoErrors(api);
});

test('routes can be drawn on the map', () => {
  const api = game();
  const drawing = api.add('pathv2', {
    _pageid: 'page1',
    shape: 'pol',
    points: JSON.stringify([
      [0, 0],
      [140, 0],
    ]),
    x: 455,
    y: 315,
  });
  api.command('!tokencontroller draw Road', [drawing]);
  const route = Object.values(api.tcState().routes)[0];
  assert.equal(route.kind, 'waypoints');
  assert.equal(route.anchor, 'page');
  const guard = api.token();
  api.command(`!tokencontroller start #${route.id}`, [guard]);
  assert.deepEqual(at(guard), [385, 315]);
  api.advance(2000);
  assert.deepEqual(at(guard), [455, 315]);
  assertNoErrors(api);
});

test('Jumpgate drawings reported as path in chat still make routes', () => {
  const api = game();
  const drawing = api.add('pathv2', {
    _pageid: 'page1',
    shape: 'rec',
    points: JSON.stringify([
      [0, 0],
      [140, 140],
    ]),
    x: 455,
    y: 315,
  });
  api.command('!tokencontroller draw Yard', [{ _id: drawing.id, _type: 'path' }]);
  const route = Object.values(api.tcState().routes)[0];
  assert.equal(route?.name, 'Yard');
  assert.equal(route.kind, 'waypoints');
  assertNoErrors(api);
});

test('bounce areas keep tokens inside the drawing and off walls', () => {
  const api = game();
  // A room from (70, 70) to (490, 350): cells 105…455 across and 105…315 down.
  const room = api.add('pathv2', {
    _pageid: 'page1',
    shape: 'rec',
    points: JSON.stringify([
      [0, 0],
      [420, 280],
    ]),
    x: 280,
    y: 210,
  });
  api.command('!tokencontroller bounce Pen', [room]);
  const route = Object.values(api.tcState().routes)[0];
  assert.equal(route.kind, 'area');
  assert.equal(route.points.length, 4);
  addWall(api, 280, 0, 700);
  api.command('!tokencontroller set wallMode hold');

  const goat = api.token({ name: 'Goat', left: 175, top: 175 });
  api.command('!tokencontroller start Pen', [goat]);
  const seen = new Set();
  for (let i = 0; i < 40; i++) {
    api.advance(2000);
    const [x, y] = at(goat);
    assert.ok(x > 70 && x < 280 && y > 70 && y < 350, `Goat left its side of the pen: ${x},${y}`);
    seen.add(`${x},${y}`);
  }
  assert.ok(seen.size > 2, 'the goat wanders about');

  const sheep = api.token({ name: 'Sheep', left: 600, top: 600 });
  api.command('!tokencontroller start Pen', [sheep]);
  assert.match(api.lastChat(), /Sheep cannot start: they are outside "Pen"/);
  api.command('!tokencontroller route Pen random on');
  api.command('!tokencontroller start Pen', [sheep]);
  const [sx, sy] = at(sheep);
  assert.ok(sx > 70 && sx < 490 && sy > 70 && sy < 350);

  api.command('!tokencontroller show Pen');
  assert.match(api.lastChat(), /Bounce area, 4 corners/);
  api.command('!tokencontroller bounce Nothing');
  assert.match(api.lastChat(), /Select exactly one closed drawing/);
  assertNoErrors(api);
});

test('recording with buttons and drags saves a step code', () => {
  const api = game();
  const guard = api.token();
  api.command('!tokencontroller record Rounds', [guard]);
  const rec = Object.values(api.tcState().recordings)[0];
  api.command(`!tokencontroller record #${rec.id} R 2`);
  api.command(`!tokencontroller record #${rec.id} W`);
  api.drag(guard, 245, 175);
  api.command(`!tokencontroller record #${rec.id} save`);
  const route = Object.values(api.tcState().routes).find((r) => r.name === 'Rounds');
  assert.equal(route.code, 'R2WD1');
  assert.equal(Object.keys(api.tcState().recordings).length, 0);
  assertNoErrors(api);
});

test('route options change from commands', () => {
  const api = game();
  api.command('!tokencontroller add "Slow Walk" R2');
  api.command('!tokencontroller route Slow Walk mode once');
  api.command('!tokencontroller route Slow Walk interval 5');
  api.command('!tokencontroller route Slow Walk max 1');
  const route = Object.values(api.tcState().routes)[0];
  assert.equal(route.name, 'Slow Walk');
  assert.equal(route.mode, 'once');
  assert.equal(route.interval, 5000);
  assert.equal(route.maxTokens, 1);
  const a = api.token();
  const b = api.token({ name: 'B' });
  api.command('!tokencontroller start Slow Walk', [a, b]);
  assert.match(api.allChat(), /already has 1 tokens/);
  api.advance(15000);
  assert.deepEqual(at(a), [245, 105]);
  assert.equal(Object.keys(api.tcState().patrols).length, 0);
  assertNoErrors(api);
});

test('export and import round trip, including v4 exportpaths text', () => {
  const api = game();
  api.command('!tokencontroller add Loop R1L1');
  api.command('!tokencontroller export');
  const exported = api.lastChat().match(/font-family:monospace[^>]*>(.*?)<\/div>/s)[1];
  api.command('!tokencontroller remove Loop confirm');
  assert.equal(Object.keys(api.tcState().routes).length, 0);
  api.command(`!tokencontroller import ${exported}`);
  assert.equal(Object.values(api.tcState().routes)[0].name, 'Loop');
  api.command('!tc importpaths [{"name":"Old","path":"U2D2","isCycle":true}]');
  assert.ok(Object.values(api.tcState().routes).some((r) => r.name === 'Old' && r.mode === 'loop'));
  assertNoErrors(api);
});

test('v4 commands and macros keep working through !tc', () => {
  const api = game();
  const guard = api.token();
  api.command('!tc add Patrol Route U1D1');
  api.command('!tc set Patrol Route R1L1');
  api.command('!tc tick 3');
  api.command('!tc substeps');
  api.command('!tc rotate');
  api.command('!tc runonce Patrol Route');
  api.command('!token-control start Patrol Route', [guard]);
  const s = api.tcState();
  const route = Object.values(s.routes)[0];
  assert.equal(route.code, 'R1L1');
  assert.equal(route.mode, 'once');
  assert.equal(s.config.interval, 3000);
  assert.equal(s.config.movement, 'segment');
  assert.equal(s.config.facing, 'down');
  assert.ok(s.patrols[guard.id]);

  const follower = api.token({ name: 'Dog' });
  api.command(`!tc Follow ${follower.id} ${guard.id}`);
  assert.equal(s.follows[follower.id].leaderId, guard.id);

  api.command(`!tc Build ${guard.id} Drafted`);
  api.command('!tc draft Drafted U 1');
  api.command('!tc draft Drafted Set');
  assert.ok(Object.values(s.routes).some((r) => r.name === 'Drafted' && r.code === 'U1'));
  api.command('!tc list');
  api.command('!tc');
  assertNoErrors(api);
});

test('!tc set and !tc combat on|off take v5 settings unless a route has that name', () => {
  const api = game();
  api.command('!tc set wallMode hold', [], 'API');
  api.command('!tc set stopMarkers dead;red');
  api.command('!tc combat on');
  const s = api.tcState();
  assert.equal(s.config.wallMode, 'hold');
  assert.equal(s.config.stopMarkers, 'dead;red');
  assert.equal(s.config.combatBehaviour, 'pause');
  assert.equal(s.combat.manual, true);
  api.command('!tc combat off');
  assert.equal(s.combat.manual, false);
  api.command('!tc combat');
  assert.equal(s.config.combatBehaviour, 'step');

  // A v4 path called like a setting is still edited
  api.command('!tc add Interval U1D1');
  api.command('!tc set Interval R1L1');
  assert.equal(Object.values(s.routes).find((r) => r.name === 'Interval').code, 'R1L1');
  assert.equal(s.config.interval, 2000);
  assertNoErrors(api);
});

test('upgrades a v4 game on startup', () => {
  const api = createSandbox({
    state: {
      TokenController: {
        module: 'TokenController',
        schemaVersion: '4.0.1',
        storedVariables: {
          paths: [{ name: 'Square', path: 'R1D1L1U1', isCycle: true }],
          activeTokenPaths: [
            { tokenId: 'g1', pathName: 'Square', step: 2, initialLeft: 105, initialTop: 105 },
          ],
          tokenMemory: [],
          pathDrafts: [],
          interval: 1000,
        },
      },
    },
    setup: (stub) => {
      stub.add('graphic', {
        _id: 'g1',
        _subtype: 'token',
        _pageid: 'page1',
        layer: 'objects',
        left: 245,
        top: 245,
        name: 'Old Guard',
      });
      stub.add('handout', { name: 'TokenController Usage Guide', inplayerjournals: 'all' });
    },
  });
  api.ready();
  assert.match(api.allChat(), /Upgraded from version 4/);
  assert.equal(
    api.sandbox.findObjs({ _type: 'handout', name: 'TokenController Usage Guide' }).length,
    0
  );
  const guard = api.sandbox.getObj('graphic', 'g1');
  api.advance(1000);
  assert.deepEqual(at(guard), [315, 245]);
  assertNoErrors(api);
});

test('hex pages zigzag up and come straight back down', () => {
  const api = game({ page: { grid_type: 'hex' } });
  const guard = api.token({ left: 210, top: 323.3 });
  api.command('!tokencontroller add Climb U2');
  api.command('!tokencontroller start Climb', [guard]);
  const start = at(guard);
  api.advance(8000);
  assert.deepEqual(at(guard), start);
  assertNoErrors(api);
});

test('only GMs can use commands', () => {
  const api = game();
  api.command('!tokencontroller', [], 'p1');
  assert.match(api.lastChat(), /Only the GM/);
  assertNoErrors(api);
});

test('commands sent by other Mods are accepted and answered to the GM', () => {
  const api = game();
  const guard = api.token();
  api.command('!tc add East R5', [], 'API');
  assert.doesNotMatch(api.allChat(), /Only the GM/);
  assert.match(api.lastChat(), /^\/w gm /);
  api.command('!tc start East', [guard], 'API');
  assert.ok(api.tcState().patrols[guard.id]);
  assertNoErrors(api);
});

test('menus, settings, status and help render without errors', () => {
  const api = game();
  api.command('!tokencontroller examples');
  for (const command of [
    '',
    'help',
    'set',
    'status',
    'list',
    'list tokens',
    'show Square',
    'record status',
  ]) {
    api.command(`!tokencontroller ${command}`.trim());
  }
  api.command('!tokencontroller set language fr');
  assert.equal(api.tcState().config.language, 'fr');
  assertNoErrors(api);
});
