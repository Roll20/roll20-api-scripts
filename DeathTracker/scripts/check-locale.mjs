// Checks translations against en-US: the same keys, the same array lengths, the
// same {placeholders} and --flags, and no characters that break Roll20 queries
// in prompts.*. Usage: node scripts/check-locale.mjs [code ...] (all when none).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'locales',
  'locale'
);
const load = async (code) =>
  (await import(pathToFileURL(path.join(dir, `${code}.js`)).href)).default;
const tokens = (s) =>
  [...String(s).matchAll(/\{\w+\}|--[a-z-]+|!deathtracker|!dead|!dt|!aura/g)].map((m) => m[0]).sort();

const en = await load('en-US');
const codes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs
      .readdirSync(dir)
      .map((f) => f.replace(/\.js$/, ''))
      .filter((c) => c !== 'en-US');

let failed = 0;
for (const code of codes) {
  const problems = [];
  let loc;
  try {
    loc = await load(code);
  } catch (err) {
    problems.push(`does not load: ${err.message}`);
  }
  const walk = (a, b, where) => {
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || b.length !== a.length) {
        problems.push(`${where}: needs an array of ${a.length}`);
        return;
      }
      a.forEach((v, i) => walk(v, b[i], `${where}[${i}]`));
    } else if (a && typeof a === 'object') {
      if (!b || typeof b !== 'object') {
        problems.push(`${where}: missing`);
        return;
      }
      for (const k of Object.keys(a)) {
        walk(a[k], b[k], where ? `${where}.${k}` : k);
      }
      for (const k of Object.keys(b)) {
        if (!(k in a)) {
          problems.push(`${where ? `${where}.` : ''}${k}: not in en-US`);
        }
      }
    } else if (typeof b !== 'string' || b.trim() === '') {
      problems.push(`${where}: missing`);
    } else {
      if (tokens(a).join(' ') !== tokens(b).join(' ')) {
        problems.push(
          `${where}: placeholders ${tokens(a).join(' ')} became ${tokens(b).join(' ')}`
        );
      }
      if (where.startsWith('prompts.') && /[|,{}]/.test(b)) {
        problems.push(`${where}: has | , { or } which break Roll20 queries`);
      }
    }
  };
  if (loc) {
    walk(en, loc, '');
  }
  if (problems.length) {
    failed++;
    console.log(`${code}: ${problems.length} problems`);
    problems.slice(0, 40).forEach((p) => console.log(`  ${p}`));
  } else {
    console.log(`${code}: ok`);
  }
}
process.exit(failed ? 1 : 0);
