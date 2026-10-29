// The generated JSON Schema accepts every example and rejects what the
// runtime validator rejects for shape reasons (plan §12.1).

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

import Ajv2020 from 'ajv/dist/2020.js';

import { TEMPLATES } from '../src/templates.js';

const schema = JSON.parse(
  fs.readFileSync(new URL('../schema/task-definition.schema.json', import.meta.url), 'utf8')
);
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

test('every example validates against the JSON Schema', () => {
  for (const tpl of TEMPLATES) {
    assert.ok(validate(tpl), `${tpl.id}: ${JSON.stringify(validate.errors?.slice(0, 3))}`);
  }
});

test('the JSON Schema rejects unknown fields, step types and bad instants', () => {
  const base = TEMPLATES[0];
  assert.equal(validate({ ...base, extra: true }), false);
  assert.equal(validate({ ...base, steps: [{ id: 'x', type: 'nope' }] }), false);
  assert.equal(
    validate({ ...base, steps: [{ id: 'x', type: 'wait', durationMs: 1000, bogus: 1 }] }),
    false
  );
  assert.equal(
    validate({ ...base, triggers: [{ id: 'a', type: 'at', at: '2026-11-01T19:00:00' }] }),
    false
  );
  assert.equal(
    validate({ ...base, triggers: [{ id: 'a', type: 'at', at: '2026-11-01T19:00:00Z' }] }),
    true
  );
});

test('the committed JSON Schema is up to date with the catalogue', async () => {
  const { execFileSync } = await import('node:child_process');
  const before = fs.readFileSync(
    new URL('../schema/task-definition.schema.json', import.meta.url),
    'utf8'
  );
  execFileSync(process.execPath, [
    new URL('../scripts/write-schema.mjs', import.meta.url).pathname.replace(
      /^\/([A-Za-z]:)/,
      '$1'
    ),
  ]);
  const after = fs.readFileSync(
    new URL('../schema/task-definition.schema.json', import.meta.url),
    'utf8'
  );
  assert.equal(after, before, 'run npm run schema and commit the result');
});
