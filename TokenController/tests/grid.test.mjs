import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  calibrateGrid,
  createGrid,
  GRID_HEX,
  GRID_ISO,
  GRID_SQUARE,
  hexToPixel,
  pixelToHex,
  snapToCell,
  stepFrom,
} from '../src/grid.js';

const close = (actual, expected, message) => {
  assert.ok(
    Math.abs(actual[0] - expected[0]) < 0.01 && Math.abs(actual[1] - expected[1]) < 0.01,
    `${message ?? ''} expected [${expected}] got [${actual}]`
  );
};

test('square grids use 70 px per unit times the snapping increment', () => {
  assert.equal(createGrid({ gridType: 'square', snapping: 1 }).unit, 70);
  assert.equal(createGrid({ gridType: 'square', snapping: 0.5 }).unit, 35);
  assert.equal(createGrid({ gridType: 'square', snapping: 2 }).kind, GRID_SQUARE);
});

test('square steps move one cell, diagonals one cell on each axis', () => {
  const grid = createGrid({ gridType: 'square', snapping: 1 });
  close(stepFrom(grid, [105, 105], 'U'), [105, 35]);
  close(stepFrom(grid, [105, 105], 'R'), [175, 105]);
  close(stepFrom(grid, [105, 105], 'DL'), [35, 175]);
});

test('square snapping finds the cell centre', () => {
  const grid = createGrid({ gridType: 'square', snapping: 1 });
  close(snapToCell(grid, 100, 80), [105, 105]);
  close(snapToCell(grid, 0, 0), [35, 35]);
});

test('gridless pages do not snap', () => {
  const off = createGrid({ gridType: 'square', snapping: 0 });
  assert.equal(off.snap, false);
  close(snapToCell(off, 12, 34), [12, 34]);
  const hidden = createGrid({ gridType: 'square', snapping: 1, showGrid: false });
  assert.equal(hidden.snap, false);
});

test('Jumpgate grid offsets shift the grid, with y measured upwards', () => {
  const grid = createGrid({ gridType: 'square', jumpgate: true, offsetX: 10, offsetY: 5 });
  close(snapToCell(grid, 50, 50), [45, 30]);
  const legacy = createGrid({ gridType: 'square', jumpgate: false, offsetX: 10, offsetY: 5 });
  close(snapToCell(legacy, 50, 50), [35, 35]);
});

test('hex grids round-trip cell centres', () => {
  for (const gridType of ['hex', 'hexr']) {
    for (const jumpgate of [true, false]) {
      const grid = createGrid({ gridType, jumpgate });
      assert.equal(grid.kind, GRID_HEX);
      for (const [row, col] of [
        [0, 0],
        [3, 4],
        [5, 1],
      ]) {
        const [x, y] = hexToPixel(grid, row, col);
        assert.deepEqual(pixelToHex(grid, x, y), [row, col]);
      }
    }
  }
});

test('hex (V) left and right move to the neighbouring hex in the row', () => {
  const grid = createGrid({ gridType: 'hex', jumpgate: true });
  const start = hexToPixel(grid, 2, 2);
  close(stepFrom(grid, start, 'R'), hexToPixel(grid, 2, 3));
  close(stepFrom(grid, start, 'L'), hexToPixel(grid, 2, 1));
});

test('hex (V) up zigzags and down retraces the same hexes', () => {
  const grid = createGrid({ gridType: 'hex', jumpgate: true });
  const start = hexToPixel(grid, 4, 2);
  const ref = start[0];
  const up1 = stepFrom(grid, start, 'U', ref);
  const up2 = stepFrom(grid, up1, 'U', ref);
  assert.ok(up1[1] < start[1] && up2[1] < up1[1], 'moves up');
  // Two steps up a zigzag lands back in the starting column.
  assert.ok(Math.abs(up2[0] - start[0]) < 0.01, 'returns to the column');
  const down1 = stepFrom(grid, up2, 'D', ref);
  const down2 = stepFrom(grid, down1, 'D', ref);
  close(down1, up1, 'down retraces');
  close(down2, start, 'down returns');
});

test('hex (H) up moves straight up a column', () => {
  const grid = createGrid({ gridType: 'hexr', jumpgate: true });
  const start = hexToPixel(grid, 3, 3);
  close(stepFrom(grid, start, 'U'), hexToPixel(grid, 2, 3));
});

test('isometric and dimetric diamonds', () => {
  const iso = createGrid({ gridType: 'isometric' });
  const dim = createGrid({ gridType: 'dimetric' });
  assert.equal(iso.kind, GRID_ISO);
  assert.ok(Math.abs(iso.width - 70 * Math.sqrt(3)) < 0.01);
  assert.equal(iso.height, 70);
  assert.equal(dim.width, 140);
  assert.equal(dim.height, 70);
  const start = snapToCell(dim, 200, 200);
  // A diagonal crosses one diamond edge and lands on another centre.
  const next = stepFrom(dim, start, 'DR');
  close(snapToCell(dim, next[0], next[1]), next);
  close(stepFrom(dim, start, 'R'), [start[0] + dim.width, start[1]]);
});

test('diamond centres match where Jumpgate snaps tokens', () => {
  // Positions Roll20 snapped dragged tokens to in a Jumpgate test game.
  const dim = createGrid({ gridType: 'dimetric', jumpgate: true });
  for (const [x, y] of [
    [910, 787],
    [980, 752],
    [980, 822],
  ]) {
    const [sx, sy] = snapToCell(dim, x, y);
    assert.ok(Math.abs(sx - x) < 1 && Math.abs(sy - y) < 1, `dimetric ${x},${y}`);
  }
  const iso = createGrid({ gridType: 'isometric', jumpgate: true, offsetX: 17, offsetY: -32 });
  for (const [x, y] of [
    [866, 994],
    [987, 994],
    [987, 1064],
  ]) {
    const [sx, sy] = snapToCell(iso, x, y);
    assert.ok(Math.abs(sx - x) < 1 && Math.abs(sy - y) < 1, `isometric ${x},${y}`);
  }
  close(stepFrom(dim, [910, 787.5], 'UR'), [980, 752.5]);
  close(stepFrom(iso, [987, 994.5], 'D'), [987, 1064.5]);
});

test('calibration from one token moves the grid; two tokens fix the size', () => {
  const options = { gridType: 'square', snapping: 1 };
  const one = calibrateGrid(options, [[110, 100]]);
  assert.equal(one.scale, 1);
  close([one.dx, one.dy], [5, -5]);
  const two = calibrateGrid(options, [
    [40, 40],
    [120, 40],
  ]);
  assert.ok(Math.abs(two.scale - 80 / 70) < 0.001);
  assert.equal(
    calibrateGrid(options, [
      [40, 40],
      [120, 140],
    ]),
    null
  );
  const grid = createGrid({ ...options, calibration: two });
  close(snapToCell(grid, 120, 40), [120, 40]);
});
