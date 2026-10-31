import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  calibrateGrid,
  createGrid,
  cubeToOffset,
  hexCorners,
  hexDistance,
  hexesBetween,
  hexesAlongSegment,
  hexesCoveringPage,
  hexesUnderToken,
  hexesWithin,
  hexKey,
  hexLine,
  hexToPixel,
  neighbours,
  offsetToCube,
  parseHexKey,
  pixelToHex,
} from '../src/grid.js';

const GRIDS = {
  'legacy V': createGrid({ gridType: 'hex' }),
  'legacy H': createGrid({ gridType: 'hexr' }),
  'jumpgate V': createGrid({ gridType: 'hex', jumpgate: true }),
  'jumpgate H': createGrid({ gridType: 'hexr', jumpgate: true }),
  'jumpgate V x2': createGrid({ gridType: 'hex', jumpgate: true, scale: 2 }),
  'legacy H x0.5': createGrid({ gridType: 'hexr', scale: 0.5 }),
};

const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

describe('createGrid', () => {
  it('returns null for square and other grids', () => {
    assert.equal(createGrid({ gridType: 'square' }), null);
    assert.equal(createGrid({ gridType: 'dimetric' }), null);
  });

  it('keeps the v1 Legacy pixel offsets so old hexes stay aligned', () => {
    const v = GRIDS['legacy V'];
    assert.deepEqual(hexToPixel(v, 0, 0), [37.5, 44]);
    const h = GRIDS['legacy H'];
    assert.deepEqual(hexToPixel(h, 0, 0), [47, 40.5]);
  });

  it('matches the Jumpgate client grid: 70 px across the flats, first hex at the corner', () => {
    const v = GRIDS['jumpgate V'];
    assert.ok(near(v.colStep, 70) && near(v.originX, 35) && near(v.originY, 70 / Math.sqrt(3)));
    const h = GRIDS['jumpgate H'];
    assert.ok(near(h.rowStep, 70) && near(h.originY, 35) && near(h.originX, 70 / Math.sqrt(3)));
  });

  it('applies Jumpgate grid offsets (y measured upwards) but ignores them in Legacy', () => {
    const g = createGrid({ gridType: 'hex', jumpgate: true, offsetX: 10, offsetY: 5 });
    assert.ok(near(g.originX, 45) && near(g.originY, 70 / Math.sqrt(3) - 5));
    const legacy = createGrid({ gridType: 'hex', offsetX: 10, offsetY: 5 });
    assert.deepEqual(hexToPixel(legacy, 0, 0), [37.5, 44]);
  });

  it('makes Jumpgate hexes regular', () => {
    const v = GRIDS['jumpgate V'];
    assert.ok(near(v.rowStep / v.colStep, Math.sqrt(3) / 2));
    const h = GRIDS['jumpgate H'];
    assert.ok(near(h.colStep / h.rowStep, Math.sqrt(3) / 2));
  });

  it('scales with the page cell size', () => {
    assert.ok(near(GRIDS['jumpgate V x2'].colStep, GRIDS['jumpgate V'].colStep * 2));
  });

  it('applies calibration overrides', () => {
    const g = createGrid({ gridType: 'hex', calibration: { originX: 10, colStep: 80 } });
    assert.equal(g.originX, 10);
    assert.equal(g.colStep, 80);
    assert.equal(g.originY, 44);
  });
});

describe('hex keys', () => {
  it('round-trips', () => {
    assert.deepEqual(parseHexKey(hexKey(-3, 7)), [-3, 7]);
    assert.equal(parseHexKey('a,b'), null);
    assert.equal(parseHexKey('1,2,3'), null);
  });
});

for (const [name, grid] of Object.entries(GRIDS)) {
  describe(`geometry (${name})`, () => {
    it('round-trips offset and cube coordinates', () => {
      for (let row = -4; row <= 4; row++) {
        for (let col = -4; col <= 4; col++) {
          assert.deepEqual(cubeToOffset(grid, offsetToCube(grid, row, col)), [row, col]);
        }
      }
    });

    it('finds the hex at its own centre and near its corners', () => {
      for (let row = -2; row <= 6; row++) {
        for (let col = -2; col <= 6; col++) {
          const [x, y] = hexToPixel(grid, row, col);
          assert.deepEqual(pixelToHex(grid, x, y), [row, col]);
          // 90% of the way to each corner is still inside the hex.
          for (const [cx, cy] of hexCorners(grid, row, col)) {
            const px = x + (cx - x) * 0.9;
            const py = y + (cy - y) * 0.9;
            assert.deepEqual(pixelToHex(grid, px, py), [row, col], `corner of ${row},${col}`);
          }
        }
      }
    });

    it('has six neighbours one step away', () => {
      for (const [row, col] of [
        [0, 0],
        [1, 1],
        [2, 3],
        [3, 2],
      ]) {
        const ns = neighbours(grid, row, col);
        assert.equal(ns.length, 6);
        assert.equal(new Set(ns.map(([r, c]) => hexKey(r, c))).size, 6);
        for (const n of ns) {
          assert.equal(hexDistance(grid, [row, col], n), 1);
        }
      }
    });

    it('neighbour centres are equally spaced on regular grids', () => {
      if (!name.startsWith('jumpgate')) {
        return;
      }
      const centre = hexToPixel(grid, 3, 3);
      const dists = neighbours(grid, 3, 3).map(([r, c]) => {
        const [x, y] = hexToPixel(grid, r, c);
        return Math.hypot(x - centre[0], y - centre[1]);
      });
      for (const d of dists) {
        assert.ok(near(d, dists[0], 1e-6));
      }
    });

    it('lists hexes within a radius, nearest first', () => {
      const ring2 = hexesWithin(grid, 4, 4, 2);
      assert.equal(ring2.length, 18);
      const ds = ring2.map((h) => hexDistance(grid, [4, 4], h));
      assert.deepEqual(
        ds,
        [...ds].sort((a, b) => a - b)
      );
      assert.ok(ds.every((d) => d >= 1 && d <= 2));
      assert.equal(hexesWithin(grid, 4, 4, 0).length, 0);
    });

    it('draws connected lines between hexes', () => {
      const line = hexLine(grid, [0, 0], [5, 7]);
      assert.equal(line.length, hexDistance(grid, [0, 0], [5, 7]) + 1);
      for (let i = 1; i < line.length; i++) {
        assert.equal(hexDistance(grid, line[i - 1], line[i]), 1);
      }
      assert.equal(hexesBetween(grid, [0, 0], [0, 1]).length, 0);
      assert.equal(hexesBetween(grid, [2, 2], [2, 2]).length, 0);
    });

    it('follows a pixel segment through every hex it crosses', () => {
      const a = hexToPixel(grid, 1, 1);
      const b = hexToPixel(grid, 6, 4);
      const cells = hexesAlongSegment(grid, a, b);
      assert.deepEqual(cells[0], [1, 1]);
      assert.deepEqual(cells.at(-1), [6, 4]);
    });

    it('covers the whole page', () => {
      const w = 10 * 70;
      const h = 8 * 70;
      const cells = hexesCoveringPage(grid, w, h);
      const keys = new Set(cells.map(([r, c]) => hexKey(r, c)));
      // Sample points across the page, up to half a pixel from each edge (a
      // point exactly on the edge can round into a hex that lies off the page).
      for (let x = 0.5; x <= w - 0.5; x += 13) {
        for (let y = 0.5; y <= h - 0.5; y += 11) {
          const [r, c] = pixelToHex(grid, x, y);
          assert.ok(keys.has(hexKey(r, c)), `point ${x},${y} not covered`);
        }
      }
    });

    it('lists the hexes under a large token, centre first', () => {
      const [x, y] = hexToPixel(grid, 4, 4);
      const small = hexesUnderToken(grid, x, y, 10, 10);
      assert.deepEqual(small, [[4, 4]]);
      const big = hexesUnderToken(grid, x, y, grid.colStep * 3, grid.rowStep * 3);
      assert.deepEqual(big[0], [4, 4]);
      assert.ok(big.length >= 7);
    });
  });
}

describe('calibrateGrid', () => {
  it('moves the origin onto a snapped token', () => {
    const grid = GRIDS['jumpgate V'];
    const [x, y] = hexToPixel(grid, 3, 3);
    const cal = calibrateGrid(grid, [[x + 5, y - 4]]);
    const fixed = createGrid({ gridType: 'hex', jumpgate: true, calibration: cal });
    const [r, c] = pixelToHex(fixed, x + 5, y - 4);
    const [cx, cy] = hexToPixel(fixed, r, c);
    assert.ok(near(cx, x + 5) && near(cy, y - 4));
  });

  it('measures spacing from two neighbouring tokens', () => {
    const grid = GRIDS['jumpgate V'];
    const cal = calibrateGrid(grid, [
      [100, 100],
      [100 + 80 * 2, 100],
    ]);
    assert.ok(near(cal.colStep, 80));
    assert.ok(near(cal.rowStep / cal.colStep, grid.rowStep / grid.colStep));
  });

  it('rejects tokens that are not in the same row', () => {
    const grid = GRIDS['jumpgate V'];
    assert.equal(
      calibrateGrid(grid, [
        [100, 100],
        [180, 160],
      ]),
      null
    );
  });
});
