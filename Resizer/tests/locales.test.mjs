import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SUPPORTED_LOCALES } from '../src/locales/index.js';
import { createSandbox } from './roll20-stub.mjs';

test('every language fills in both handouts and the menu', () => {
  assert.equal(SUPPORTED_LOCALES.length, 24);
  for (const code of SUPPORTED_LOCALES) {
    const game = createSandbox({
      state: { RESIZER: { schemaVersion: 2, settings: { language: code } } },
    });
    game.ready();
    game.command('!resizer');
    game.command('!resizer settings');
    game.command('!resizer history');
    const texts = [...game.ofType('handout').map((h) => h.get('notes')), game.allChat()];
    for (const text of texts) {
      assert.doesNotMatch(
        text,
        /[>"]\s*(handout|help|deck|buttons|queries|sizes|settings|menu|messages|errors|titles|history)\.[a-zA-Z]/,
        code
      );
    }
  }
});
