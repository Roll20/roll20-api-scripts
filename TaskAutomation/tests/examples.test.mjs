// End-to-end: the seven worked examples of the user guide and the montage
// fixture, run in the stub sandbox (plan §12.4). Each test also checks the
// single-timer invariant and that nothing was logged as an error.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSandbox, restart, START } from './roll20-stub.mjs';

const MIN = 60 * 1000;

/**
 * Creates a ready game.
 *
 * @param {object} [options] Sandbox options.
 * @returns {object} Sandbox API.
 */
export function game(options) {
  const api = createSandbox(options);
  api.ready();
  return api;
}

/**
 * Fails when the Mod logged an error or ever held more than one timer.
 *
 * @param {object} api Sandbox API.
 * @returns {void}
 */
export function assertHealthy(api) {
  assert.deepEqual(
    api.logs.filter((line) => /ERROR/.test(line)),
    []
  );
  assert.ok(api.maxLiveTimers() <= 1, `live timers peaked at ${api.maxLiveTimers()}`);
}

test('montage: cycles a multi-sided token ten times, eight seconds apart', () => {
  const api = game();
  api.command('!taskautomation template add montage');
  const token = api.sidedToken();
  api.command('!taskautomation instance start --definition montage', [token]);
  const run = api.lastRun();
  assert.equal(run.bindings.tokens[0], token.id);
  api.advance(1);
  assert.equal(token.attrs.currentSide, 1);
  assert.match(token.attrs.imgsrc, /images\/10002\/abc\/thumb\.png/);
  api.advance(7998);
  assert.equal(token.attrs.currentSide, 1, 'no early effect');
  api.advance(2);
  assert.equal(token.attrs.currentSide, 2);
  api.advance(80000);
  assert.equal(api.run(run.id).status, 'completed');
  assert.equal(token.attrs.currentSide, 10 % 3);
  assertHealthy(api);
});

test('torch reminder: warns after 50 minutes and goes out 10 minutes later', () => {
  const api = game();
  api.command('!taskautomation template add torch-reminder');
  const torch = api.token({ name: 'Lyra', controlledby: 'p1' });
  api.command('!taskautomation instance start --definition torch-reminder', [torch]);
  api.clearChat();
  api.advance(49 * MIN);
  assert.doesNotMatch(api.allText(), /guttering/);
  api.advance(1 * MIN);
  assert.match(api.allText(), /Lyra's torch is guttering/);
  assert.ok(api.chat.some((c) => c.text.startsWith('/w gm')));
  assert.ok(api.chat.some((c) => c.text.startsWith('/w "Player One"')));
  api.advance(10 * MIN);
  assert.match(api.allText(), /Lyra's torch burns out/);
  assert.equal(api.lastRun().status, 'completed');
  assertHealthy(api);
});

test('torch reminder: a restart after expiry gives one reviewable consequence, not a burst', () => {
  let api = game();
  api.command('!taskautomation template add torch-reminder');
  const torch = api.token({ name: 'Lyra' });
  api.command('!taskautomation instance start --definition torch-reminder', [torch]);
  const runId = api.lastRun().id;
  api.advance(5 * MIN);
  api = restart(api, 90 * MIN);
  const run = api.run(runId);
  assert.equal(run.status, 'review');
  assert.equal(run.review.reason, 'overdueWait');
  assert.doesNotMatch(api.allText(), /guttering|burns out/);
  assert.match(api.allText(), /After the restart/);
  // The GM chooses to continue: the warning is sent once, the final wait starts again.
  api.command(
    `!taskautomation instance decide --id ${runId} --action complete --rev ${run.revision}`
  );
  assert.match(api.allText(), /guttering/);
  assert.doesNotMatch(api.allText(), /burns out/);
  api.advance(10 * MIN);
  assert.match(api.allText(), /burns out/);
  assertHealthy(api);
});

test('HP threshold: crossing to zero marks the token once; staying at zero does not refire', () => {
  const api = game();
  api.command('!taskautomation template add hp-zero');
  api.command('!taskautomation definition enable --id hp-zero');
  const orc = api.token({ name: 'Orc', bar1_value: '5', statusmarkers: 'red' });
  api.change(orc, { bar1_value: '3' });
  assert.equal(api.lastRun(), undefined);
  api.change(orc, { bar1_value: '0' });
  api.advance(10);
  assert.equal(orc.attrs.statusmarkers, 'red,dead');
  assert.match(api.allText(), /Orc has dropped to 0 HP/);
  const runs = Object.keys(api.taState().instances).length;
  api.advance(2000);
  api.change(orc, { bar1_value: '-2' });
  api.advance(10);
  assert.equal(Object.keys(api.taState().instances).length, runs);
  // Text that is not a number never counts as zero.
  const ghost = api.token({ name: 'Ghost', bar1_value: '4' });
  api.change(ghost, { bar1_value: '' });
  assert.equal(Object.keys(api.taState().instances).length, runs);
  assertHealthy(api);
});

test('turn response: a new current turn pings; editing initiative does not', () => {
  const api = game();
  api.command('!taskautomation template add turn-response');
  api.command('!taskautomation definition enable --id turn-response');
  const a = api.token({ name: 'Aria' });
  const b = api.token({ name: 'Brom' });
  api.setTurnOrder([
    { id: a.id, pr: '15' },
    { id: b.id, pr: '10' },
  ]);
  const first = api.lastRun();
  assert.equal(first.bindings.token[0], a.id);
  api.command('!taskautomation signal turn-ready');
  api.advance(10);
  assert.equal(api.pings.length, 1);
  assert.match(api.allText(), /It is Aria's turn/);
  const count = Object.keys(api.taState().instances).length;
  // Editing initiative numbers without changing the current entry.
  api.setTurnOrder([
    { id: a.id, pr: '16' },
    { id: b.id, pr: '10' },
  ]);
  assert.equal(Object.keys(api.taState().instances).length, count);
  // Without a signal the run waits 15 seconds, then pings anyway.
  api.setTurnOrder([
    { id: b.id, pr: '10' },
    { id: a.id, pr: '16' },
  ]);
  api.advance(14000);
  assert.equal(api.pings.length, 1);
  api.advance(1000);
  assert.equal(api.pings.length, 2);
  // Custom entries have no token.
  api.setTurnOrder([
    { id: '-1', custom: 'Round 2', pr: '0' },
    { id: b.id, pr: '10' },
  ]);
  api.advance(10);
  assert.match(api.allText(), /Turn: Round 2/);
  assertHealthy(api);
});

test('parallel scene: both branches run, join, then the cleanup task is chained', () => {
  const api = game();
  const track = api.add('jukeboxtrack', { title: 'Ambience', playing: true, volume: 60 });
  const door = api.sidedToken({ name: 'Door' });
  api.command('!taskautomation template add parallel-scene');
  api.command('!taskautomation instance start --definition parallel-scene', [door]);
  const run = api.lastRun();
  api.advance(10);
  assert.equal(track.attrs.volume, 50);
  api.advance(3000);
  assert.equal(door.attrs.currentSide, 1);
  assert.equal(track.attrs.volume, 20);
  api.advance(2000);
  assert.equal(track.attrs.volume, 10);
  const child = Object.values(api.taState().instances).find((i) => i.parentId === run.id);
  assert.ok(child, 'cleanup started');
  api.advance(100);
  assert.equal(track.attrs.playing, false);
  assert.equal(api.run(run.id).status, 'completed');
  assert.deepEqual(Object.keys(api.run(run.id).branches.main.variables.scene).sort(), [
    'door',
    'music',
  ]);
  assertHealthy(api);
});

test('parallel scene: a failing branch fails the join after the other finishes', () => {
  const api = game();
  api.add('jukeboxtrack', { title: 'Ambience', playing: true, volume: 60 });
  const plain = api.token({ name: 'Not a door' });
  api.command('!taskautomation template add parallel-scene');
  api.command('!taskautomation instance start --definition parallel-scene', [plain]);
  const run = api.lastRun();
  api.advance(6000);
  const finished = api.run(run.id);
  assert.equal(finished.status, 'failed');
  assert.equal(finished.error.reason, 'notMultiSided');
  assertHealthy(api);
});

test('session reminder: weekly at a fixed offset, with a previewed offset change', () => {
  // Thursday 2026-10-29 12:00 UTC.
  const api = game({ now: Date.UTC(2026, 9, 29, 12) });
  api.command('!taskautomation template add session-reminder');
  api.command('!taskautomation definition enable --id session-reminder');
  const sched = Object.values(api.taState().schedules)[0];
  assert.equal(sched.cursor.nextDueAt, Date.UTC(2026, 9, 30, 19));
  api.command(`!taskautomation schedule offset --id ${sched.id} --offset +01:00`);
  assert.match(api.allText(), /2026-10-30T19:00:00Z/);
  assert.match(api.allText(), /2026-10-30T18:00:00Z/);
  assert.equal(api.taState().schedules[sched.id].spec.offsetMinutes, 0, 'preview changes nothing');
  api.advance(31 * 3600 * 1000);
  assert.match(api.allText(), /Session starts in 15 minutes/);
  assertHealthy(api);
});

test('session reminder: missed while off runs once if recent, summarised if too old', () => {
  let api = game({ now: Date.UTC(2026, 9, 30, 18) });
  api.command('!taskautomation template add session-reminder');
  api.command('!taskautomation definition enable --id session-reminder');
  // Off from 18:00 to 19:30: half an hour late, inside the two-hour age limit.
  api = restart(api, 90 * MIN);
  api.advance(10);
  assert.match(api.allText(), /Session starts in 15 minutes/);
  const run = Object.values(api.taState().instances).find(
    (i) => i.definitionId === 'session-reminder'
  );
  assert.equal(run.intendedDueAt, Date.UTC(2026, 9, 30, 19));
  // Off for three weeks and a day: the latest miss is a day old, too old to run.
  api.clearChat();
  api = restart(api, 22 * 24 * 3600 * 1000);
  api.advance(10);
  assert.doesNotMatch(api.allText(), /Session starts/);
  const incident = Object.values(api.taState().incidents).find(
    (i) => i.policy === 'runOnce:tooOld'
  );
  assert.equal(incident.count, 3);
  assertHealthy(api);
});

test('other-Mod command: dispatched with the escaped token ID, shown as unconfirmed', () => {
  const api = game();
  const token = api.token();
  api.command('!taskautomation template add token-mod-command');
  api.command('!taskautomation instance start --definition token-mod-command', [token]);
  api.advance(10);
  const sent = api.chat.find((c) => c.text.startsWith('!token-mod'));
  assert.equal(sent.text, `!token-mod --ids ${token.id} --set statusmarkers|+blue`);
  const run = api.lastRun();
  assert.equal(Object.values(run.journal)[0].status, 'dispatched');
  assertHealthy(api);
});

test('door sequence: opens on the signal, stays shut on timeout', () => {
  const api = game();
  const door = api.sidedToken({ name: 'Door' });
  api.command('!taskautomation template add door-sequence');
  api.command('!taskautomation instance start --definition door-sequence', [door]);
  api.advance(10);
  api.command('!taskautomation signal door-open');
  api.advance(10);
  assert.equal(door.attrs.currentSide, 1);
  assert.match(api.allText(), /The door swings open/);
  api.command('!taskautomation instance start --definition door-sequence', [door]);
  api.advance(60000);
  assert.match(api.allText(), /The door stays shut/);
  assertHealthy(api);
});

test('door sequence: a restart records the observation gap and keeps the timeout', () => {
  let api = game();
  const door = api.sidedToken({ name: 'Door' });
  api.command('!taskautomation template add door-sequence');
  api.command('!taskautomation instance start --definition door-sequence', [door]);
  const runId = api.lastRun().id;
  api.advance(10000);
  api = restart(api, 20000);
  const run = api.run(runId);
  assert.ok(run.timeline.some((e) => e.kind === 'observationGap'));
  assert.ok(Object.values(api.taState().incidents).some((i) => i.cause === 'observationGap'));
  api.command('!taskautomation signal door-open');
  api.advance(10);
  assert.equal(door.attrs.currentSide, 1);
  assertHealthy(api);
});

test('the example JSON files match the templates', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { TEMPLATES } = await import('../src/templates.js');
  const dir = path.join(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
    '..',
    'examples'
  );
  for (const tpl of TEMPLATES) {
    const file = JSON.parse(fs.readFileSync(path.join(dir, `${tpl.id}.json`), 'utf8'));
    assert.deepEqual(file, tpl, tpl.id);
  }
});

test('the sandbox starts at the expected time', () => {
  assert.equal(new Date(START).toISOString(), '2026-11-01T12:00:00.000Z');
});
