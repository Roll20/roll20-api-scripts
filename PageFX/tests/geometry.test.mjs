import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  beamEnd,
  clampToPage,
  isInArea,
  nextDelay,
  pageMetrics,
  randomPointIn,
  tokenArea,
} from '../src/geometry.js';

const seq = (...values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

test('page metrics follow the snapping increment and scale', () => {
  assert.deepEqual(pageMetrics({ width: 30, height: 20, snapping_increment: 1, scale_number: 5 }), {
    cellPx: 70,
    pxPerUnit: 14,
    widthPx: 2100,
    heightPx: 1400,
  });
  const big = pageMetrics({ width: 10, height: 10, snapping_increment: 2, scale_number: 5 });
  assert.equal(big.cellPx, 140);
  assert.equal(big.pxPerUnit, 28);
  const metres = pageMetrics({ width: 10, height: 10, snapping_increment: 1, scale_number: 1.5 });
  assert.ok(Math.abs(metres.pxPerUnit - 70 / 1.5) < 1e-9);
});

test('page sizes given as text (hex pages) are read as numbers', () => {
  const m = pageMetrics({
    width: '27.93',
    height: '18.63',
    snapping_increment: '1',
    scale_number: '5',
  });
  assert.ok(Math.abs(m.widthPx - 27.93 * 70) < 1e-9);
  assert.ok(Math.abs(m.heightPx - 18.63 * 70) < 1e-9);
});

test('missing or zero snap and scale fall back to one cell per unit', () => {
  const m = pageMetrics({ width: 5, height: 5, snapping_increment: 0, scale_number: '' });
  assert.equal(m.cellPx, 70);
  assert.equal(m.pxPerUnit, 70);
});

test('aura radius is measured from the token edge (verified in Jumpgate)', () => {
  const m = pageMetrics({ width: 30, height: 20, snapping_increment: 1, scale_number: 5 });
  // 10 ft round a 70 px token measured 350 px across in Jumpgate.
  assert.equal(tokenArea({ left: 0, top: 0, width: 70, height: 70, aura1_radius: 10 }, m).r, 175);
  // 5 ft square round a 140 px token measured about 280 px across.
  const sq = tokenArea(
    { left: 0, top: 0, width: 140, height: 140, aura1_radius: '5', aura1_square: true },
    m
  );
  assert.equal(sq.r, 140);
  assert.equal(sq.square, true);
});

test('a token with no aura covers just itself', () => {
  const m = pageMetrics({ width: 30, height: 20, snapping_increment: 1, scale_number: 5 });
  assert.equal(tokenArea({ left: 10, top: 20, width: 70, height: 140, aura1_radius: '' }, m).r, 70);
});

test('aura on a snap-2 page uses the larger cell (v1 assumed 70 px)', () => {
  const m = pageMetrics({ width: 30, height: 20, snapping_increment: 2, scale_number: 5 });
  // 5 ft = one 140 px cell, plus half a 70 px token. v1 gave 70 + 35 = 105.
  assert.equal(tokenArea({ left: 0, top: 0, width: 70, height: 70, aura1_radius: 5 }, m).r, 175);
});

test('random points stay in their area', () => {
  const area = { x: 500, y: 500, r: 100, square: false };
  for (let i = 0; i < 2000; i++) {
    assert.ok(isInArea(randomPointIn(area), area));
  }
  const square = { x: 500, y: 500, r: 100, square: true };
  for (let i = 0; i < 2000; i++) {
    assert.ok(isInArea(randomPointIn(square), square));
  }
});

test('random points are spread evenly over a circle, not bunched in the middle', () => {
  const area = { x: 0, y: 0, r: 100, square: false };
  let inner = 0;
  const n = 20000;
  for (let i = 0; i < n; i++) {
    const p = randomPointIn(area);
    if (Math.hypot(p.x, p.y) <= 50) {
      inner++;
    }
  }
  // A circle of half the radius holds a quarter of the area.
  assert.ok(Math.abs(inner / n - 0.25) < 0.02, `inner share ${inner / n}`);
});

test('square and circle edges count as inside', () => {
  assert.ok(isInArea({ x: 100, y: 0 }, { x: 0, y: 0, r: 100, square: false }));
  assert.ok(isInArea({ x: 100, y: 100 }, { x: 0, y: 0, r: 100, square: true }));
  assert.ok(!isInArea({ x: 100, y: 100 }, { x: 0, y: 0, r: 100, square: false }));
});

test('points are kept on the page', () => {
  const m = { widthPx: 700, heightPx: 350 };
  assert.deepEqual(clampToPage({ x: -5, y: 400 }, m), { x: 0, y: 350 });
});

test('beam ends: fixed offsets are in cells, random stays within a cell', () => {
  const m = { cellPx: 140 };
  assert.deepEqual(beamEnd({ x: 0, y: 0 }, { dx: 2, dy: -1 }, m), { x: 280, y: -140 });
  assert.deepEqual(beamEnd({ x: 5, y: 5 }, null, m), { x: 5, y: 5 });
  for (let i = 0; i < 200; i++) {
    const end = beamEnd({ x: 0, y: 0 }, 'random', m);
    const len = Math.hypot(end.x, end.y);
    assert.ok(len >= 0.25 * 140 - 1e-9 && len <= 140 + 1e-9);
  }
});

test('delays fall in the interval, scale with intensity and respect the floor', () => {
  assert.equal(nextDelay([100, 300], 1, 20, seq(0)), 100);
  assert.equal(nextDelay([100, 300], 1, 20, seq(0.5)), 200);
  assert.equal(nextDelay([100, 300], 2, 20, seq(0.5)), 100);
  assert.equal(nextDelay([10, 10], 5, 20, seq(0.5)), 20);
  assert.equal(nextDelay([300, 100], 1, 20, seq(0.5)), 300);
});
