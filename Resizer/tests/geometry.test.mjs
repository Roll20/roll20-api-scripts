import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  calibrateFromBox,
  calibrateFromSquare,
  cellPixels,
  centreOnPage,
  drawingBox,
  fitToPage,
  nearestLine,
  parseFactor,
  scaleLegacyPathData,
  zoomGraphic,
  zoomLegacyPath,
  zoomPage,
  zoomPathV2,
  zoomPortal,
  zoomText,
} from '../src/geometry.js';

const page = (extra = {}) => ({
  width: 30,
  height: 20,
  snapping_increment: 1,
  scale_number: 5,
  grid_offset_x: 0,
  grid_offset_y: 0,
  ...extra,
});

describe('cells and pages', () => {
  test('a cell is 70 px times the snapping increment (0.0.9 assumed 70 px)', () => {
    assert.equal(cellPixels(page()), 70);
    assert.equal(cellPixels(page({ snapping_increment: 2 })), 140);
    assert.equal(cellPixels(page({ snapping_increment: 0.5 })), 35);
    assert.equal(cellPixels({}), 70);
  });

  test('zooming a page keeps scale_number (0.0.9 multiplied it)', () => {
    const next = zoomPage(page({ grid_offset_x: 35, grid_offset_y: -10 }), 2);
    assert.deepEqual(next, {
      width: 60,
      height: 40,
      snapping_increment: 2,
      grid_offset_x: 70,
      grid_offset_y: -20,
    });
    assert.equal('scale_number' in next, false);
  });

  test('page sizes stored as text are read', () => {
    assert.deepEqual(zoomPage({ width: '27.93', height: '18.63', snapping_increment: 1 }, 2), {
      width: 55.86,
      height: 37.26,
      snapping_increment: 2,
      grid_offset_x: 0,
      grid_offset_y: 0,
    });
  });
});

describe('object zooms', () => {
  test('graphics move and scale about the page corner', () => {
    assert.deepEqual(zoomGraphic({ left: 805, top: 175, width: 70, height: 70 }, 2), {
      left: 1610,
      top: 350,
      width: 140,
      height: 140,
    });
    assert.deepEqual(zoomGraphic({ left: 805, top: 175, width: 70, height: 70 }, 2, true), {
      left: 1610,
      top: 350,
    });
  });

  test('text scales its font size', () => {
    assert.deepEqual(zoomText({ left: 10, top: 20, font_size: 26, width: 0, height: 0 }, 1.5), {
      left: 15,
      top: 30,
      font_size: 39,
    });
  });

  test('Jumpgate drawings scale their centre and points; walls can keep their width', () => {
    const wall = { x: 1694, y: 322, points: '[[0,94.5],[0,0],[427,0]]', stroke_width: 5 };
    assert.deepEqual(zoomPathV2(wall, 2), {
      x: 3388,
      y: 644,
      points: '[[0,189],[0,0],[854,0]]',
    });
    assert.equal(zoomPathV2(wall, 2, true).stroke_width, 10);
    assert.equal(zoomPathV2({ ...wall, points: 'nonsense' }, 2), null);
  });

  test('Legacy paths are redrawn with their scale baked into the points', () => {
    const p = {
      _path: '[["M",0,0],["L",0,563.5],["Q",10,20,30,40]]',
      left: 1491,
      top: 974.75,
      width: 30,
      height: 563.5,
      scaleX: 1,
      scaleY: 2,
      stroke_width: 5,
    };
    const next = zoomLegacyPath(p, 2);
    assert.deepEqual(JSON.parse(next._path), [
      ['M', 0, 0],
      ['L', 0, 2254],
      ['Q', 20, 80, 60, 160],
    ]);
    assert.equal(next.left, 2982);
    assert.equal(next.top, 1949.5);
    assert.equal(next.width, 60);
    assert.equal(next.height, 2254);
    assert.equal(next.scaleX, 1);
    assert.equal(next.scaleY, 1);
    assert.equal(scaleLegacyPathData('[1,2]', 1, 1), null);
  });

  test('doors and windows scale their position and handles (y measured upwards)', () => {
    const door = {
      x: 1480.5,
      y: -250.25,
      path: { handle0: { x: 0, y: 43.75 }, handle1: { x: 0, y: -43.75 } },
    };
    assert.deepEqual(zoomPortal(door, 2), {
      x: 2961,
      y: -500.5,
      path: { handle0: { x: 0, y: 87.5 }, handle1: { x: 0, y: -87.5 } },
    });
  });

  test('zooming by f then 1/f returns the same numbers', () => {
    const g = { left: 123.4, top: 567.8, width: 91, height: 33 };
    const back = zoomGraphic(zoomGraphic(g, 3), 1 / 3);
    for (const k of Object.keys(g)) {
      assert.ok(Math.abs(back[k] - g[k]) < 1e-5, k);
    }
  });
});

describe('fit and centre', () => {
  test('fit with keep ratio centres on the page (0.0.9 put it in the corner)', () => {
    assert.deepEqual(fitToPage({ width: 1000, height: 500 }, page(), true), {
      left: 1050,
      top: 700,
      width: 2100,
      height: 1050,
    });
    assert.deepEqual(fitToPage({ width: 1000, height: 500 }, page(), false), {
      left: 1050,
      top: 700,
      width: 2100,
      height: 1400,
    });
  });

  test('centre across, down or both', () => {
    assert.deepEqual(centreOnPage(page(), true, false), { left: 1050 });
    assert.deepEqual(centreOnPage(page(), false, true), { top: 700 });
    assert.deepEqual(centreOnPage(page(), true, true), { left: 1050, top: 700 });
  });
});

describe('calibration', () => {
  test('drawing boxes for Jumpgate and Legacy drawings', () => {
    assert.deepEqual(
      drawingBox('pathv2', { x: 150, y: 100, points: '[[0,0],[100,0],[100,50],[0,50]]' }),
      {
        x0: 100,
        y0: 75,
        x1: 200,
        y1: 125,
      }
    );
    assert.deepEqual(
      drawingBox('path', { left: 150, top: 100, width: 50, height: 25, scaleX: 2, scaleY: 2 }),
      {
        x0: 100,
        y0: 75,
        x1: 200,
        y1: 125,
      }
    );
  });

  test('grid lines respect the offset', () => {
    assert.equal(nearestLine(100, 70, 0), 70);
    assert.equal(nearestLine(100, 70, 35), 105);
  });

  test('a box over 3×2 squares of 100 px scales the map to 70 px cells and lines it up', () => {
    // Map 1000×800 with its top-left at (10, 20); its squares are 100 px and
    // a grid line of the map runs through (110, 120).
    const map = { left: 510, top: 420, width: 1000, height: 800 };
    const box = { x0: 110, y0: 120, x1: 410, y1: 320 };
    const plan = calibrateFromBox(map, box, 3, 2, page());
    assert.equal(plan.ok, true);
    assert.deepEqual(plan.squarePx, [100, 100]);
    assert.deepEqual(plan.scale, [0.7, 0.7]);
    assert.equal(plan.map.width, 700);
    assert.equal(plan.map.height, 560);
    // The box corner must sit on a grid line after scaling.
    const left0 = plan.map.left - plan.map.width / 2;
    const top0 = plan.map.top - plan.map.height / 2;
    const cornerX = left0 + 100 * 0.7;
    const cornerY = top0 + 100 * 0.7;
    assert.ok(Math.abs(cornerX / 70 - Math.round(cornerX / 70)) < 1e-6, `x ${cornerX}`);
    assert.ok(Math.abs(cornerY / 70 - Math.round(cornerY / 70)) < 1e-6, `y ${cornerY}`);
  });

  test('alignment uses the Jumpgate grid offset (y upwards)', () => {
    const map = { left: 500, top: 500, width: 1000, height: 1000 };
    const box = { x0: 0, y0: 0, x1: 100, y1: 100 };
    const plan = calibrateFromBox(map, box, 1, 1, page({ grid_offset_x: 20, grid_offset_y: 30 }));
    const left0 = plan.map.left - plan.map.width / 2;
    const top0 = plan.map.top - plan.map.height / 2;
    assert.ok(Math.abs((left0 - 20) / 70 - Math.round((left0 - 20) / 70)) < 1e-6);
    assert.ok(Math.abs((top0 + 30) / 70 - Math.round((top0 + 30) / 70)) < 1e-6);
  });

  test('fit page moves the map to the corner and sizes the page in whole cells', () => {
    const map = { left: 1510, top: 1420, width: 1000, height: 800 };
    const box = { x0: 1010, y0: 1020, x1: 1110, y1: 1120 };
    const plan = calibrateFromBox(map, box, 1, 1, page({ snapping_increment: 2 }), {
      fitPage: true,
    });
    // 140 px cells: map 1400×1120 → 10 × 8 cells, 20 × 16 units.
    assert.equal(plan.map.width, 1400);
    const left0 = plan.map.left - plan.map.width / 2;
    assert.ok(Math.abs(left0) <= 70);
    assert.deepEqual(plan.page, { width: plan.page.width, height: plan.page.height });
    assert.ok(plan.page.width >= 20 && plan.page.width <= 22 && plan.page.width % 2 === 0);
  });

  test('bad boxes and counts are refused', () => {
    const map = { left: 0, top: 0, width: 10, height: 10 };
    assert.equal(
      calibrateFromBox(map, { x0: 0, y0: 0, x1: 2, y1: 2 }, 1, 1, page()).error,
      'errors.boxTooSmall'
    );
    assert.equal(
      calibrateFromBox(map, { x0: 0, y0: 0, x1: 20, y1: 20 }, 0, 1, page()).error,
      'errors.badCount'
    );
    assert.equal(calibrateFromSquare(map, 1, page()).error, 'errors.badSquarePx');
  });

  test('pixels per square scales about the map corner', () => {
    const plan = calibrateFromSquare(
      { left: 600, top: 400, width: 1200, height: 800 },
      120,
      page()
    );
    assert.deepEqual(plan.map, { left: 350, top: 233.333333, width: 700, height: 466.666667 });
  });
});

describe('zoom factors', () => {
  const p = page();
  for (const [text, expected] of [
    ['2', 2],
    ['x2', 2],
    ['×1.5', 1.5],
    ['0.5', 0.5],
    ['50%', 0.5],
    ['1/2', 0.5],
    ['to 140', 2],
    ['to 35px', 0.5],
    ['banana', null],
    ['0', null],
    ['', null],
  ]) {
    test(`"${text}" → ${expected}`, () => {
      assert.equal(parseFactor(text.split(' '), p), expected);
    });
  }
});
