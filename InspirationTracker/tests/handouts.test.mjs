import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createSandbox } from './roll20-stub.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALE_DIR = path.join(__dirname, '..', 'src', 'locales', 'locale');
const LOCALES = fs.readdirSync(LOCALE_DIR).map((f) => f.replace(/\.js$/, ''));

/**
 * Lists every key path in a translation object.
 *
 * @param {object} obj Translation object.
 * @param {string} [prefix] Key prefix.
 * @returns {string[]} Key paths.
 */
function keyPaths(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? keyPaths(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );
}

/**
 * Loads a locale file.
 *
 * @param {string} code Locale code.
 * @returns {Promise<object>} Translation object.
 */
async function load(code) {
  return (await import(pathToFileURL(path.join(LOCALE_DIR, `${code}.js`)).href)).default;
}

test('the handouts are created GM-only, once', async () => {
  const api = createSandbox();
  await api.ready();
  await api.fire('ready');
  for (const name of ['InspirationTracker - Help', 'InspirationTracker - Command Deck']) {
    const handouts = api.sandbox.findObjs({ _type: 'handout', name });
    assert.equal(handouts.length, 1, name);
    assert.equal(handouts[0].get('inplayerjournals'), '');
    assert.equal(handouts[0].get('controlledby'), '');
  }
  const help = api.sandbox.findObjs({ _type: 'handout', name: 'InspirationTracker - Help' })[0];
  assert.match(help.get('notes'), /Heroic Inspiration/);
  assert.match(help.get('notes'), /Robin Kuiper/);
  const deck = api.sandbox.findObjs({
    _type: 'handout',
    name: 'InspirationTracker - Command Deck',
  })[0];
  assert.match(deck.get('notes'), /!inspiration party add/);
});

test('every locale has the same keys as en-US, with the same placeholders', async () => {
  const english = await load('en-US');
  const want = keyPaths(english).sort();
  const get = (obj, key) => key.split('.').reduce((o, k) => o?.[k], obj);
  for (const code of LOCALES) {
    const locale = await load(code);
    assert.deepEqual(keyPaths(locale).sort(), want, `${code} keys`);
    for (const key of want) {
      const en = get(english, key);
      const tr = get(locale, key);
      const holes = (v) =>
        JSON.stringify(v)
          .match(/\{\w+\}/g)
          ?.sort() || [];
      assert.deepEqual(holes(tr), holes(en), `${code} ${key} placeholders`);
    }
  }
});

test('the handouts build in every language; Hebrew is right to left', async () => {
  for (const code of LOCALES) {
    const api = createSandbox({ globalconfig: { inspirationtracker: { language: code } } });
    await api.ready();
    const help = api.sandbox.findObjs({ _type: 'handout', name: 'InspirationTracker - Help' })[0];
    const notes = help.get('notes');
    assert.doesNotMatch(notes, /handout\.\w+/, `${code} has no missing keys`);
    if (code === 'he') {
      assert.match(notes, /direction:rtl/);
    }
  }
});

test('the handouts get the InspirationTracker journal icon, also handouts made before', async () => {
  const icon = 'https://files.d20.io/images/506991612/MVQIb3bWgcO-XABFmcaezw/thumb.webp';
  const api = createSandbox();
  api.sandbox.createObj('handout', { name: 'InspirationTracker - Help', avatar: '' });
  await api.ready();
  const handouts = api.sandbox
    .findObjs({ _type: 'handout' })
    .filter((h) => h.get('name').startsWith('InspirationTracker - '));
  assert.ok(handouts.length >= 2);
  for (const handout of handouts) {
    assert.equal(handout.get('avatar'), icon, handout.get('name'));
  }
});
