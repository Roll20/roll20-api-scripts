import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import enUS from '../src/locales/locale/en-US.js';
import { COMMAND_LIST, CREATURE_SIZES, DEFAULT_SETTINGS } from '../src/constants.js';
import { createSandbox } from './roll20-stub.mjs';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const lookup = (key) => key.split('.').reduce((obj, part) => obj?.[part], enUS);

describe('English text', () => {
  test('every fixed key the code asks for exists', () => {
    const missing = [];
    for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.js'))) {
      const text = fs.readFileSync(path.join(SRC, file), 'utf8');
      const keys = [
        ...text.matchAll(/\bt\(\s*'([a-zA-Z0-9_.-]+)'/g),
        ...text.matchAll(/\b(?:error|label): '([a-zA-Z]+\.[a-zA-Z0-9_.-]+)'/g),
        ...text.matchAll(/startChange\(\s*'([a-zA-Z0-9_.-]+)'/g),
      ].map((m) => m[1]);
      for (const key of keys) {
        if (typeof lookup(key) !== 'string') {
          missing.push(`${file}: ${key}`);
        }
      }
    }
    assert.deepEqual(missing, []);
  });

  test('keys built from lists exist', () => {
    const missing = [];
    const need = [
      ...COMMAND_LIST.map(([, key]) => `help.${key}`),
      ...Object.keys(CREATURE_SIZES).map((s) => `sizes.${s}`),
      ...Object.keys(DEFAULT_SETTINGS).map((s) => `handout.settings.rows.${s}`),
      ...Object.keys(DEFAULT_SETTINGS).map((s) => `settings.${s}`),
    ];
    for (const key of need) {
      if (typeof lookup(key) !== 'string') {
        missing.push(key);
      }
    }
    assert.deepEqual(missing, []);
  });
});

describe('handouts', () => {
  const html = (game, name) =>
    game
      .ofType('handout')
      .find((h) => h.get('name') === name)
      ?.get('notes') || '';

  test('the Help and Command Deck handouts are written on start, with every key filled in', () => {
    const game = createSandbox();
    game.ready();
    const help = html(game, 'Resizer - Help');
    const deck = html(game, 'Resizer - Command Deck');
    assert.match(help, /Quick start/);
    assert.match(help, /Fitting a map to the grid/);
    assert.match(help, /Resizer\.onZoom/);
    assert.match(help, /!resizer scale 2 down/);
    assert.match(deck, /!resizer zoom 2/);
    assert.match(deck, /!resizer size huge/);
    for (const text of [help, deck]) {
      assert.doesNotMatch(text, />\s*(handout|help|deck|buttons|queries|sizes|settings)\.[a-zA-Z]/);
    }
  });

  test('a second start updates the handouts instead of adding more', () => {
    const state = {};
    const first = createSandbox({ state });
    first.ready();
    const game = createSandbox({ state });
    game.add('handout', { name: 'Resizer - Help', notes: 'old' });
    game.add('handout', { name: 'Resizer - Help', notes: 'older' });
    game.ready();
    const helps = game.ofType('handout').filter((h) => h.get('name') === 'Resizer - Help');
    assert.equal(helps.length, 1);
    assert.match(helps[0].get('notes'), /Quick start/);
  });

  test('a renamed command is used in the handouts', () => {
    const game = createSandbox();
    game.ready();
    game.command('!resizer set command rs');
    assert.match(html(game, 'Resizer - Command Deck'), /!rs zoom 2/);
  });

  test('journal rebuild rewrites the handouts', () => {
    const game = createSandbox();
    game.ready();
    game.ofType('handout').forEach((h) => h.set('notes', 'stale'));
    game.command('!resizer journal rebuild');
    assert.match(game.lastChat(), /were rebuilt/);
    assert.match(html(game, 'Resizer - Help'), /Quick start/);
  });
});
