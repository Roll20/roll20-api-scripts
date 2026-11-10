import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  blockingWall,
  bodyRadius,
  kindBlocks,
  portalEnds,
  ringsToSegments,
  segmentsCross,
} from '../src/walls.js';

test('segments that cross or touch are found, parallel ones are not', () => {
  assert.equal(segmentsCross([0, 0], [10, 10], [0, 10], [10, 0]), true);
  assert.equal(segmentsCross([0, 0], [10, 0], [5, 0], [5, 5]), true);
  assert.equal(segmentsCross([0, 0], [10, 0], [0, 1], [10, 1]), false);
  assert.equal(segmentsCross([0, 0], [4, 0], [5, -5], [5, 5]), false);
});

test('a wall blocks the centre line, and the body in width mode', () => {
  const walls = ringsToSegments(
    [
      [
        [210, 0],
        [210, 80],
      ],
    ],
    'wall'
  );
  // The centre line passes just below the end of the wall.
  assert.equal(blockingWall(walls, [175, 105], [245, 105]), null);
  // A 70 px token is 31.5 px wide each side in width mode, so it catches the end.
  assert.ok(blockingWall(walls, [175, 105], [245, 105], bodyRadius(70, 70)));
  // A token already touching a wall can still move away from it.
  assert.equal(blockingWall(walls, [215, 50], [285, 50], bodyRadius(70, 70)), null);
  // Brushing a wall along a cell edge is allowed.
  assert.equal(blockingWall(walls, [245, 0], [245, 70], bodyRadius(70, 70)), null);
});

test('door and window handles are read with y measured upwards', () => {
  const ends = portalEnds({
    x: 210,
    y: -105,
    path: { handle0: { x: 0, y: 70 }, handle1: { x: 0, y: -70 } },
  });
  assert.deepEqual(ends, [
    [210, 35],
    [210, 175],
  ]);
  assert.equal(portalEnds({ x: 0, y: 0, path: '{"handle0":{"x":1,"y":1}}' }), null);
});

test('one-way and see-through walls follow their settings', () => {
  const config = { oneWayWalls: 'pass', transparentWalls: 'block' };
  assert.equal(kindBlocks('wall', config), true);
  assert.equal(kindBlocks('door', config), true);
  assert.equal(kindBlocks('oneway', config), false);
  assert.equal(kindBlocks('transparent', config), true);
});
