import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  headingVector,
  nextBounce,
  pointInPolygon,
  randomPointInArea,
  reflectHeading,
} from '../src/bounce.js';
import { createGrid } from '../src/grid.js';

const SQUARE = createGrid({ gridType: 'square', snapping: 1 });
const GRIDLESS = createGrid({ gridType: 'square', snapping: 0 });

// A room from (0, 0) to (420, 280): cells 105…315 across and 35…245 down.
const ROOM = [
  [0, 0],
  [420, 0],
  [420, 280],
  [0, 280],
];

const noJitter = () => 0.5;

test('points inside and outside a polygon, including a concave one', () => {
  assert.equal(pointInPolygon([10, 10], ROOM), true);
  assert.equal(pointInPolygon([430, 10], ROOM), false);
  const ell = [
    [0, 0],
    [200, 0],
    [200, 100],
    [100, 100],
    [100, 200],
    [0, 200],
  ];
  assert.equal(pointInPolygon([150, 150], ell), false);
  assert.equal(pointInPolygon([50, 150], ell), true);
});

test('headings reflect off edges like a ball', () => {
  const wallEdge = { a: [420, 0], b: [420, 280] };
  assert.equal(Math.round(reflectHeading(45, wallEdge)), 315);
  const floor = { a: [0, 280], b: [420, 280] };
  assert.equal(Math.round(reflectHeading(135, floor)), 45);
  const [x, y] = headingVector(90);
  assert.ok(Math.abs(x - 1) < 1e-9 && Math.abs(y) < 1e-9);
});

test('a token on a grid steps along its line and bounces at the edge', () => {
  let pos = [245, 105];
  let heading = 90;
  let origin = pos;
  const visited = [];
  for (let i = 0; i < 6; i++) {
    const step = nextBounce({
      grid: SQUARE,
      pos,
      heading,
      origin,
      polygon: ROOM,
      random: noJitter,
    });
    assert.ok(step.to, 'always finds a move in an open room');
    assert.ok(pointInPolygon(step.to, ROOM), `stays in the room at ${step.to}`);
    pos = step.to;
    heading = step.heading;
    origin = step.origin;
    visited.push(pos.map(Math.round).join(','));
  }
  // East to the wall, then back west.
  assert.deepEqual(visited.slice(0, 4), ['315,105', '385,105', '315,105', '245,105']);
});

test('diagonal travel moves like a line on squared paper and bounces off walls', () => {
  const wall = { a: [280, 0], b: [280, 280] };
  const step = nextBounce({
    grid: SQUARE,
    pos: [245, 105],
    heading: 60,
    origin: [245, 105],
    polygon: ROOM,
    blockedBy: (from, to) => (to[0] > 280 ? wall : null),
    random: noJitter,
  });
  assert.ok(step.to[0] < 280);
  assert.ok(step.heading > 180, 'heads back west after the wall');
});

test('gridless pages move a cell width along the heading', () => {
  const step = nextBounce({
    grid: GRIDLESS,
    pos: [100, 100],
    heading: 90,
    origin: [100, 100],
    polygon: ROOM,
    random: noJitter,
  });
  assert.deepEqual(step.to.map(Math.round), [170, 100]);
});

test('a token dragged out of its area heads back in', () => {
  const step = nextBounce({
    grid: SQUARE,
    pos: [525, 105],
    heading: 90,
    origin: [525, 105],
    polygon: ROOM,
    random: noJitter,
  });
  assert.ok(step.to[0] < 525);
});

test('random starts land on a cell inside the area', () => {
  let seed = 1;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 20; i++) {
    const point = randomPointInArea(SQUARE, ROOM, random);
    assert.ok(pointInPolygon(point, ROOM));
    assert.equal((point[0] - 35) % 70, 0);
  }
});
