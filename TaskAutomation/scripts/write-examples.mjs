/**
 * Writes each template in src/templates.js to examples/<id>.json, so the
 * worked examples can be imported with `definition import --json`.
 *
 * Usage: npm run examples
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TEMPLATES } from '../src/templates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'examples');

fs.mkdirSync(dir, { recursive: true });
for (const tpl of TEMPLATES) {
  fs.writeFileSync(path.join(dir, `${tpl.id}.json`), `${JSON.stringify(tpl, null, 2)}\n`);
  console.log(`Wrote examples/${tpl.id}.json`);
}
