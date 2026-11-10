import assert from 'node:assert/strict';
import { test } from 'node:test';

import { drawingWaypoints, simplifyPoints } from '../src/drawings.js';
import { createGrid, hexToPixel } from '../src/grid.js';
import {
  compileTrack,
  framesOffPage,
  nextFrame,
  parseCode,
  recordingToRoute,
  rotationFor,
  stepsReturnToStart,
  stepsToCode,
  trackIsClosed,
} from '../src/routes.js';

const square = createGrid({ gridType: 'square', snapping: 1 });
const codeRoute = (code) => ({ kind: 'code', code });
const places = (frames) => frames.map((f) => [Math.round(f.x), Math.round(f.y)]);

test('parses v4 step codes', () => {
  const parsed = parseCode('U3U0WWR2R0WWL4WWR2D3WW');
  assert.equal(parsed.ok, true);
  assert.equal(stepsToCode(parsed.steps), 'U3U0WWR2R0WWL4WWR2D3WW');
  assert.deepEqual(parseCode('S').steps, [{ type: 'stealth' }]);
  assert.equal(parseCode('U12R10').steps[0].distance, 12);
});

test('parses diagonals, default distances, waits with counts and separators', () => {
  const { steps } = parseCode('ur2 dl W3, s; R');
  assert.deepEqual(steps, [
    { type: 'move', dir: 'UR', distance: 2 },
    { type: 'move', dir: 'DL', distance: 1 },
    { type: 'wait', count: 3 },
    { type: 'stealth' },
    { type: 'move', dir: 'R', distance: 1 },
  ]);
});

test('rejects bad codes with a reason', () => {
  assert.equal(parseCode('').error, 'empty');
  assert.equal(parseCode('U2X4').error, 'badToken');
  assert.equal(parseCode('U2X4').at.startsWith('X4'), true);
  assert.equal(parseCode('U999').error, 'tooFar');
});

test('detects routes that return to their start', () => {
  assert.equal(stepsReturnToStart(parseCode('U2R2D2L2').steps), true);
  assert.equal(stepsReturnToStart(parseCode('UR2DR2DL2UL2').steps), true);
  assert.equal(stepsReturnToStart(parseCode('U2R2').steps), false);
  assert.equal(stepsReturnToStart(parseCode('S').steps), false);
});

test('compiles a step code into one frame per cell', () => {
  const frames = compileTrack(codeRoute('U2R1'), square, [105, 245]);
  assert.deepEqual(places(frames), [
    [105, 245],
    [105, 175],
    [105, 105],
    [175, 105],
  ]);
  assert.deepEqual(
    frames.map((f) => f.end),
    [true, false, true, true]
  );
});

test('waits, stealth and facing become frames in place', () => {
  const frames = compileTrack(codeRoute('W2SU0'), square, [35, 35]);
  assert.equal(frames.length, 5);
  assert.equal(frames[1].wait, true);
  assert.equal(frames[3].stealth, true);
  assert.equal(frames[4].face, 0);
});

test('ping-pong walks back exactly the way it came (v4 drifted)', () => {
  const frames = compileTrack(codeRoute('U2R2'), square, [105, 245]);
  let index = 0;
  let dir = 1;
  const visited = [];
  for (let i = 0; i < 8; i++) {
    ({ index, dir } = nextFrame(frames, index, dir, 'pingpong', true));
    visited.push(places([frames[index]])[0]);
  }
  assert.deepEqual(visited, [
    [105, 105],
    [245, 105],
    [105, 105],
    [105, 245],
    [105, 105],
    [245, 105],
    [105, 105],
    [105, 245],
  ]);
});

test('closed loops do not pause on the start frame', () => {
  const frames = compileTrack(codeRoute('R1D1L1U1'), square, [35, 35]);
  assert.equal(trackIsClosed(frames), true);
  let index = 0;
  let dir = 1;
  const seen = [];
  for (let i = 0; i < 6; i++) {
    ({ index, dir } = nextFrame(frames, index, dir, 'loop', false));
    seen.push(index);
  }
  assert.deepEqual(seen, [1, 2, 3, 4, 1, 2]);
});

test('once routes finish at the last frame', () => {
  const frames = compileTrack(codeRoute('R2'), square, [35, 35]);
  let step = nextFrame(frames, 0, 1, 'once', true);
  assert.equal(step.finished, false);
  step = nextFrame(frames, step.index, step.dir, 'once', true);
  assert.equal(step.finished, true);
  assert.equal(step.index, 2);
});

test('segment movement stops only at the end of each step', () => {
  const frames = compileTrack(codeRoute('R3D1'), square, [35, 35]);
  assert.equal(nextFrame(frames, 0, 1, 'loop', true).index, 3);
  assert.equal(nextFrame(frames, 0, 1, 'loop', false).index, 1);
});

test('hex routes that go up and back down return to the start', () => {
  const grid = createGrid({ gridType: 'hex', jumpgate: true });
  const start = hexToPixel(grid, 6, 3);
  const frames = compileTrack(codeRoute('U3D3'), grid, start);
  const last = frames.at(-1);
  assert.ok(Math.abs(last.x - start[0]) < 0.01 && Math.abs(last.y - start[1]) < 0.01);
});

test('waypoint routes split long legs into cell-sized steps', () => {
  const route = {
    kind: 'waypoints',
    anchor: 'page',
    points: [{ x: 35, y: 35 }, { x: 315, y: 35 }, { wait: 2 }, { x: 315, y: 175 }],
  };
  const frames = compileTrack(route, square, [0, 0]);
  assert.equal(frames[0].x, 35);
  assert.equal(frames.filter((f) => f.wait).length, 2);
  assert.deepEqual(places([frames.at(-1)])[0], [315, 175]);
  assert.equal(frames.length, 1 + 4 + 2 + 2);
});

test('token-anchored waypoints follow the token', () => {
  const route = {
    kind: 'waypoints',
    anchor: 'token',
    points: [
      { x: 0, y: 0 },
      { x: 70, y: 0 },
    ],
  };
  const frames = compileTrack(route, square, [500, 500]);
  assert.deepEqual(places(frames), [
    [500, 500],
    [570, 500],
  ]);
});

test('counts frames that leave the page', () => {
  const frames = compileTrack(codeRoute('L3'), square, [105, 105]);
  assert.equal(framesOffPage(frames, 1400, 1050), 2);
});

test('rotations follow the way the art faces', () => {
  assert.equal(rotationFor(90, 'up'), 90);
  assert.equal(rotationFor(0, 'down'), 180);
  assert.equal(rotationFor(180, 'right'), 90);
  assert.equal(rotationFor(270, 'left'), 0);
});

test('recordings on square grids become step codes', () => {
  const route = recordingToRoute(
    [
      { x: 105, y: 105 },
      { x: 105, y: 35 },
      { x: 175, y: 35 },
      { x: 245, y: 35 },
      { wait: 1 },
      { x: 175, y: 105 },
    ],
    square
  );
  assert.deepEqual(route, { kind: 'code', code: 'U1R2WDL1' });
});

test('recordings that do not fit the grid become waypoints', () => {
  const route = recordingToRoute(
    [
      { x: 100, y: 100 },
      { x: 150, y: 120 },
    ],
    square
  );
  assert.equal(route.kind, 'waypoints');
  assert.deepEqual(route.points, [
    { x: 0, y: 0 },
    { x: 50, y: 20 },
  ]);
  assert.equal(recordingToRoute([{ x: 1, y: 1 }], square), null);
});

test('drawings become waypoints in drawing order', () => {
  const v2 = drawingWaypoints({
    type: 'pathv2',
    shape: 'pol',
    points: JSON.stringify([
      [0, 0],
      [140, 0],
      [140, 70],
    ]),
    x: 170,
    y: 135,
  });
  assert.deepEqual(v2.points, [
    [100, 100],
    [240, 100],
    [240, 170],
  ]);
  assert.equal(v2.closed, false);

  const rect = drawingWaypoints({
    type: 'pathv2',
    shape: 'rec',
    points: JSON.stringify([
      [0, 0],
      [70, 70],
    ]),
    x: 35,
    y: 35,
  });
  assert.equal(rect.closed, true);

  const legacy = drawingWaypoints({
    type: 'path',
    _path: JSON.stringify([
      ['M', 0, 0],
      ['L', 70, 0],
    ]),
    left: 135,
    top: 100,
    width: 70,
    height: 0,
  });
  assert.deepEqual(legacy.points, [
    [100, 100],
    [170, 100],
  ]);
});

test('freehand drawings are simplified', () => {
  const dense = Array.from({ length: 101 }, (_, i) => [i, 0]);
  const simple = simplifyPoints(dense);
  assert.ok(simple.length <= 12);
  assert.deepEqual(simple[0], [0, 0]);
  assert.deepEqual(simple.at(-1), [100, 0]);
});
