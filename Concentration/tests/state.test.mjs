// Unit tests for settings validation and state migration.

import assert from 'node:assert/strict';
import { test } from 'node:test';

globalThis.state = {};

const { mergeConfig, migrateState, validateConfigValue } = await import('../src/state.js');

test('validates settings', () => {
  assert.deepEqual(validateConfigValue('bar', 'bar 2'), { valid: true, value: 2 });
  assert.equal(validateConfigValue('bar', '4').valid, false);
  assert.deepEqual(validateConfigValue('auto_roll_save', 'off'), { valid: true, value: false });
  assert.deepEqual(validateConfigValue('command', '!conc'), { valid: true, value: 'conc' });
  assert.equal(validateConfigValue('command', 'has space').valid, false);
  assert.deepEqual(validateConfigValue('send_reminder_to', 'GM'), { valid: true, value: 'gm' });
  assert.deepEqual(validateConfigValue('statusmarker', 'Concentrating::42'), {
    valid: true,
    value: 'Concentrating::42',
  });
  assert.equal(validateConfigValue('statusmarker', 'bad marker').valid, false);
  assert.deepEqual(validateConfigValue('language', 'fr'), { valid: true, value: 'fr' });
  assert.equal(validateConfigValue('unknown', 'x').valid, false);
});

test('fills missing or broken settings with defaults', () => {
  const config = mergeConfig({ bar: 7, debug: 'yes', statusmarker: 'red' });
  assert.equal(config.bar, 1);
  assert.equal(config.debug, true);
  assert.equal(config.statusmarker, 'red');
  assert.equal(config.command, 'concentration');
});

test('migrates version 1.0 state', () => {
  const { state, migratedFrom } = migrateState({
    config: { statusmarker: 'purple', firsttime: false, advantage: false },
    advantages: { a: true, b: false },
  });
  assert.equal(migratedFrom, 1);
  assert.equal(state.schemaVersion, 2);
  assert.equal(state.config.statusmarker, 'purple');
  assert.equal('advantage' in state.config, false);
  assert.deepEqual(state.advantages, { a: true });
  assert.equal(state.notices.welcomed, true);
});

test('a new game starts from defaults', () => {
  const { state, migratedFrom } = migrateState(undefined);
  assert.equal(migratedFrom, null);
  assert.equal(state.config.statusmarker, 'stopwatch');
  assert.deepEqual(state.concentrating, {});
});
