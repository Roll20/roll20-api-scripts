import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  boundingBox,
  distinctVertices,
  legacyPathToRings,
  pathToRings,
  pathV2ToRings,
  pointInRing,
  pointInShape,
  polygonPathProps,
  ringCentre,
} from '../src/polygon.js';

const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

describe('pointInRing', () => {
  const square = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ];
  it('detects inside and outside points', () => {
    assert.ok(pointInRing([5, 5], square));
    assert.ok(!pointInRing([15, 5], square));
    assert.ok(!pointInRing([-1, -1], square));
  });

  it('treats an inner ring as a hole', () => {
    const hole = [
      [3, 3],
      [7, 3],
      [7, 7],
      [3, 7],
    ];
    assert.ok(!pointInShape([5, 5], [square, hole]));
    assert.ok(pointInShape([1, 1], [square, hole]));
  });
});

describe('pathV2ToRings', () => {
  it('places a polygon by its centre', () => {
    const [ring] = pathV2ToRings({
      shape: 'pol',
      points: '[[0,0],[100,0],[100,50],[0,50],[0,0]]',
      x: 500,
      y: 300,
    });
    const box = boundingBox(ring);
    assert.deepEqual(box, { left: 450, top: 275, right: 550, bottom: 325 });
  });

  it('normalises points that do not start at 0,0', () => {
    const [ring] = pathV2ToRings({
      shape: 'pol',
      points: '[[20,30],[120,30],[120,80]]',
      x: 100,
      y: 100,
    });
    assert.deepEqual(boundingBox(ring), { left: 50, top: 75, right: 150, bottom: 125 });
  });

  it('expands a rectangle from its two corners, including negative sizes', () => {
    const [ring] = pathV2ToRings({ shape: 'rec', points: '[[0,0],[-70,-140]]', x: 35, y: 70 });
    assert.equal(ring.length, 4);
    assert.deepEqual(boundingBox(ring), { left: 0, top: 0, right: 70, bottom: 140 });
  });

  it('approximates an ellipse', () => {
    const [ring] = pathV2ToRings({ shape: 'eli', points: '[[0,0],[200,100]]', x: 100, y: 50 });
    assert.ok(ring.length >= 16);
    assert.ok(pointInRing([100, 50], ring));
    assert.ok(!pointInRing([5, 5], ring));
  });

  it('rotates about the centre', () => {
    const [ring] = pathV2ToRings({
      shape: 'rec',
      points: '[[0,0],[100,20]]',
      x: 0,
      y: 0,
      rotation: 90,
    });
    const box = boundingBox(ring);
    assert.ok(near(box.left, -10) && near(box.right, 10));
    assert.ok(near(box.top, -50) && near(box.bottom, 50));
  });

  it('returns nothing for bad JSON', () => {
    assert.deepEqual(pathV2ToRings({ shape: 'pol', points: 'nope' }), []);
  });
});

describe('legacyPathToRings', () => {
  it('places a path by left/top and applies scale', () => {
    const [ring] = legacyPathToRings({
      _path: '[["M",0,0],["L",100,0],["L",100,100],["L",0,100],["L",0,0]]',
      left: 200,
      top: 200,
      width: 100,
      height: 100,
      scaleX: 2,
      scaleY: 1,
    });
    assert.deepEqual(boundingBox(ring), { left: 100, top: 150, right: 300, bottom: 250 });
  });

  it('samples freehand curves', () => {
    const [ring] = legacyPathToRings({
      _path: '[["M",0,0],["Q",50,0,100,0],["Q",100,50,100,100],["L",0,100]]',
      left: 50,
      top: 50,
      width: 100,
      height: 100,
    });
    assert.ok(ring.length > 4);
    assert.ok(pointInRing([50, 50], ring));
  });

  it('expands mapWidth and mapHeight', () => {
    const [ring] = legacyPathToRings(
      {
        _path: '[["M",0,0],["L","mapWidth",0],["L","mapWidth","mapHeight"],["L",0,"mapHeight"]]',
        left: 350,
        top: 350,
        width: 700,
        height: 700,
      },
      { width: 10, height: 10 }
    );
    assert.deepEqual(boundingBox(ring), { left: 0, top: 0, right: 700, bottom: 700 });
  });

  it('routes by type', () => {
    assert.equal(pathToRings({ type: 'pathv2', shape: 'rec', points: '[[0,0],[1,1]]' }).length, 1);
    assert.equal(pathToRings({ type: 'path', _path: '[]' }).length, 0);
  });
});

describe('polygonPathProps', () => {
  const hex = [
    [110, 100],
    [105, 108],
    [95, 108],
    [90, 100],
    [95, 92],
    [105, 92],
  ];

  it('round-trips through pathv2', () => {
    const props = polygonPathProps(hex, true);
    assert.equal(props.shape, 'pol');
    const [ring] = pathV2ToRings(props);
    const centre = ringCentre(ring);
    assert.ok(near(centre[0], 100, 1e-3) && near(centre[1], 100, 1e-3));
    assert.equal(distinctVertices(ring).length, 6);
  });

  it('round-trips through a Legacy path', () => {
    const props = polygonPathProps(hex, false);
    const [ring] = legacyPathToRings(props);
    const centre = ringCentre(ring);
    assert.ok(near(centre[0], 100, 1e-3) && near(centre[1], 100, 1e-3));
    assert.equal(distinctVertices(ring).length, 6);
  });
});
