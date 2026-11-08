import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import enUS from '../src/locales/locale/en-US.js';
import { createSandbox } from './roll20-stub.mjs';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const lookup = (key) => key.split('.').reduce((obj, part) => obj?.[part], enUS);

describe('English text', () => {
  test('every fixed key the code asks for exists', () => {
    const missing = [];
    for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.js'))) {
      const text = fs.readFileSync(path.join(SRC, file), 'utf8');
      for (const [, key] of text.matchAll(/\bt\(\s*'([a-zA-Z0-9_.-]+)'/g)) {
        if (typeof lookup(key) !== 'string') {
          missing.push(`${file}: ${key}`);
        }
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
    const help = html(game, 'PageFX - Help');
    const deck = html(game, 'PageFX - Command Deck');
    assert.match(help, /Quick Start/);
    assert.match(help, /Heavy rain/);
    assert.match(help, /heavy-rain/);
    assert.match(help, /PageFX\.checkToken/);
    assert.match(deck, /!pagefx presets/);
    for (const text of [help, deck]) {
      assert.doesNotMatch(text, />\s*(handout|help|deck|buttons|presets|packs)\.[a-zA-Z]/);
    }
  });

  test('a second start updates the handouts instead of adding more', () => {
    const state = {};
    const first = createSandbox({ state });
    first.ready();
    const game = createSandbox({ state });
    game.add('handout', { name: 'PageFX - Help', notes: 'old' });
    game.add('handout', { name: 'PageFX - Help', notes: 'older' });
    game.ready();
    const helps = game.ofType('handout').filter((h) => h.get('name') === 'PageFX - Help');
    assert.equal(helps.length, 1);
    assert.match(helps[0].get('notes'), /Quick Start/);
  });

  test('help lists the commands, and journal rebuild rewrites the handouts', () => {
    const game = createSandbox();
    game.ready();
    game.command('!pagefx help');
    assert.match(game.lastChat(), /PageFX Commands/);
    assert.match(game.lastChat(), /!pagefx trigger add/);
    game.ofType('handout').forEach((h) => h.set('notes', 'stale'));
    game.command('!pagefx journal rebuild');
    assert.match(game.lastChat(), /have been rebuilt/);
    assert.match(html(game, 'PageFX - Help'), /Quick Start/);
  });
});
