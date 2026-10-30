import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  cleanName,
  migrateState,
  normaliseRoute,
  parseInterval,
  validateConfigValue,
  validateRouteOption,
} from '../src/state.js';

// A v4.0.1 state as the old Mod saved it.
const V4_STATE = {
  module: 'TokenController',
  schemaVersion: '4.0.1',
  resets: 0,
  storedVariables: {
    paths: [
      { name: 'Square', path: 'U2R2D2L2', isCycle: true },
      { name: 'Line', path: 'R4', isCycle: false, runOnce: true, intervalOverride: 3000 },
      { name: 'Broken', path: { name: 'Broken', path: 'U1D1' } },
      {
        name: 'Gate',
        path: 'R2',
        fixedStart: true,
        startLeft: 35,
        startTop: 70,
        startPageId: 'p',
        startRotation: 90,
        maxTokens: 2,
        randomStart: true,
      },
      { name: 'Square', path: 'U1', isCycle: true },
      { name: 'Bad', path: 'XYZ' },
    ],
    activeTokenPaths: [
      {
        tokenId: 't1',
        pathName: 'Square',
        step: 2,
        initialLeft: 105,
        initialTop: 105,
        initialRotation: 0,
        pageId: 'p',
      },
      { tokenId: 't1', pathName: 'Line', step: 0 },
      { tokenId: 't2', pathName: 'Missing' },
    ],
    tokenMemory: [
      {
        tokenId: 't3',
        pageId: 'p',
        left: 10,
        top: 20,
        rotation: 45,
        isLocked: true,
        isFollowing: false,
      },
      { tokenId: 't4', followingTokenId: 't1', isFollowing: true, isLocked: false },
    ],
    pathDrafts: [
      { name: 'Half', path: 'U1R1', tokenId: 't5', step: 2 },
      { name: 'Empty', path: '', tokenId: 't6', step: 0 },
    ],
    interval: 4000,
    unitPerClick: 3,
    unitPx: 50,
    rotateTokens: true,
    combatPatrol: true,
    subStepMovement: true,
  },
};

test('migrates v4 paths into routes', () => {
  const { state, migratedFrom } = migrateState(structuredClone(V4_STATE));
  assert.equal(migratedFrom, 4);
  const byName = Object.fromEntries(Object.values(state.routes).map((r) => [r.name, r]));
  assert.deepEqual(Object.keys(byName).sort(), [
    'Broken',
    'Gate',
    'Half (draft)',
    'Line',
    'Square',
  ]);
  assert.equal(byName.Square.mode, 'loop');
  assert.equal(byName.Square.code, 'U2R2D2L2');
  assert.equal(byName.Line.mode, 'once');
  assert.equal(byName.Line.interval, 3000);
  assert.equal(byName.Broken.code, 'U1D1');
  assert.equal(byName.Broken.mode, 'loop');
  assert.deepEqual(byName.Gate.start, { pageId: 'p', left: 35, top: 70, rotation: 90 });
  assert.equal(byName.Gate.maxTokens, 2);
  assert.equal(byName.Gate.randomStart, true);
  assert.equal(byName['Half (draft)'].mode, 'pingpong');
});

test('migrates v4 patrols, locks and followers', () => {
  const { state } = migrateState(structuredClone(V4_STATE));
  assert.deepEqual(Object.keys(state.patrols), ['t1']);
  const patrol = state.patrols.t1;
  assert.equal(state.routes[patrol.routeId].name, 'Square');
  assert.equal(patrol.anchor, null);
  assert.deepEqual(patrol.origin, { left: 105, top: 105, rotation: 0 });
  assert.deepEqual(state.locks.t3, {
    pageId: 'p',
    left: 10,
    top: 20,
    rotation: 45,
    marker: 'red',
    mode: 'revert',
    native: false,
  });
  assert.deepEqual(state.follows.t4, { leaderId: 't1', offset: null });
});

test('migrates v4 settings', () => {
  const { state } = migrateState(structuredClone(V4_STATE));
  assert.equal(state.config.interval, 4000);
  assert.equal(state.config.movement, 'cell');
  assert.equal(state.config.facing, 'down');
  assert.equal(state.config.combatBehaviour, 'step');
  assert.equal(state.config.buttonStep, 3);
  assert.equal(state.config.lockMode, 'revert');
  assert.equal(state.notices.migratedV4.unitPx, 50);
});

test('v5 state survives a round trip and drops damaged records', () => {
  const { state } = migrateState(structuredClone(V4_STATE));
  state.patrols.ghost = { routeId: 'nope' };
  state.routes.rX = { id: 'rX', name: '', kind: 'code', code: 'U1' };
  const again = migrateState(JSON.parse(JSON.stringify(state)));
  assert.equal(again.migratedFrom, null);
  assert.equal(again.state.patrols.ghost, undefined);
  assert.equal(again.state.routes.rX, undefined);
  assert.equal(Object.keys(again.state.routes).length, 5);
  assert.ok(again.state.nextId > 5);
});

test('fresh installs get defaults', () => {
  const { state, migratedFrom } = migrateState(undefined);
  assert.equal(migratedFrom, null);
  assert.equal(state.config.interval, 2000);
  assert.equal(state.config.lockMode, 'native');
  assert.deepEqual(state.routes, {});
});

test('validates settings', () => {
  assert.deepEqual(validateConfigValue('interval', '3'), { valid: true, value: 3000 });
  assert.deepEqual(validateConfigValue('interval', '100'), { valid: true, value: 250 });
  assert.equal(validateConfigValue('interval', 'fast').valid, false);
  assert.deepEqual(validateConfigValue('movement', 'SEGMENT'), { valid: true, value: 'segment' });
  assert.deepEqual(validateConfigValue('lockMarker', 'off'), { valid: true, value: 'none' });
  assert.deepEqual(validateConfigValue('lockMarker', 'padlock'), { valid: true, value: 'padlock' });
  assert.deepEqual(validateConfigValue('language', 'fr'), { valid: true, value: 'fr' });
  assert.equal(validateConfigValue('facing', 'sideways').valid, false);
  assert.equal(parseInterval('0'), null);
});

test('validates route options and names', () => {
  assert.deepEqual(validateRouteOption('mode', 'PingPong'), { valid: true, value: 'pingpong' });
  assert.deepEqual(validateRouteOption('interval', '0'), { valid: true, value: null });
  assert.deepEqual(validateRouteOption('maxTokens', '3'), { valid: true, value: 3 });
  assert.equal(validateRouteOption('maxTokens', '-1').valid, false);
  assert.deepEqual(validateRouteOption('randomStart', 'on'), { valid: true, value: true });
  assert.equal(cleanName('  The "Big" | Loop  '), 'The Big Loop');
  assert.equal(normaliseRoute({ id: 'r1', name: 'A', kind: 'code', code: 'nope' }), null);
});
