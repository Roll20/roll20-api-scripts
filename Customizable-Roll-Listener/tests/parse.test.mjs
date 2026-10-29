// Command parsing, version 1 conversion and command sending helpers.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { fillPlaceholders, splitCommands } from '../src/actions.js';
import { commandLines, parseArguments, restoreCommandText } from '../src/commands.js';
import { parseLegacyCommand } from '../src/legacy.js';
import enUS from '../src/locales/locale/en-US.js';
import { convertV1Rules, parseStoredRules, serialiseRules } from '../src/state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('parses sub-command, target, options and trailing commands', () => {
  const args = parseArguments(
    ' new Crit Sound --templates atk atkdmg --results crit --commands !token-mod --set statusmarkers|red \\\\ /em hits!'
  );
  assert.equal(args.sub, 'new');
  assert.equal(args.target, 'Crit Sound');
  assert.deepEqual(args.options, { templates: 'atk atkdmg', results: 'crit' });
  assert.equal(args.commands, '!token-mod --set statusmarkers|red \\\\ /em hits!');
  assert.deepEqual(args.unknown, []);
  assert.equal(commandLines(args.commands), '!token-mod --set statusmarkers|red\n/em hits!');
});

test('listener IDs starting with "-" are targets, not options', () => {
  const args = parseArguments(' edit -Mabc_12 --total >=15');
  assert.equal(args.target, '-Mabc_12');
  assert.deepEqual(args.options, { total: '>=15' });
});

test('unknown options are reported', () => {
  assert.deepEqual(parseArguments(' edit X --colour red').unknown, ['colour']);
});

test('inline rolls and roll templates typed into a command are restored', () => {
  const text = restoreCommandText({
    content: '!crl edit X --commands /em finds $[[0]]  {{name=Hi}}',
    inlinerolls: [{ expression: '1t[Loot]' }],
    rolltemplate: 'default',
  });
  assert.equal(
    text,
    '!crl edit X --commands /em finds [[1t[Loot]]]  &{template:default} {{name=Hi}}'
  );
});

test('parses version 1 commands', () => {
  const create = parseLegacyCommand(
    '!crl \\\\create,name=Crit,text=Alice&&##,template=atk atkdmg,roll=critical \\\\!roll20AM --audio,play|Crit \\\\/em Crit!'
  );
  assert.equal(create.action, 'create');
  assert.equal(create.name, 'Crit');
  assert.deepEqual(create.options, {
    templates: 'atk atkdmg',
    regex: 'off',
    text: 'Alice && ##',
    results: 'critical',
  });
  assert.equal(create.commands, '!roll20AM --audio,play|Crit\n/em Crit!');
  assert.equal(parseLegacyCommand('!crl \\\\config').action, 'config');
  assert.equal(parseLegacyCommand('!crl \\\\set,listen=off').listen, 'off');
  assert.equal(parseLegacyCommand('!crl \\\\text=x'), null);
  assert.equal(parseLegacyCommand('!crl \\\\create,name=R,text=a.b+').options.regex, 'on');
});

test('converts version 1 rules', () => {
  const plain = convertV1Rules(
    { txt: ['Alice', String.raw`r1=\$\[\[\d\]\]`], templates: ['atk'], roll: ['critical'] },
    'Crit'
  );
  assert.equal(plain.regex, false);
  assert.deepEqual(plain.text, ['Alice', 'r1=##']);
  assert.deepEqual(plain.results, ['crit']);
  assert.deepEqual(plain.templates, ['atk']);
  const regex = convertV1Rules({ txt: ['hits? the'], templates: '', roll: '' }, 'R');
  assert.equal(regex.regex, true);
  assert.deepEqual(regex.results, []);
});

test('rules round-trip through an ability description', () => {
  const rules = convertV1Rules({ txt: ['x'], roll: ['fumble'] }, 'Fumble');
  const parsed = parseStoredRules(serialiseRules(rules), 'Fumble');
  assert.equal(parsed.version, 2);
  assert.deepEqual(parsed.rules, rules);
  assert.equal(parseStoredRules('not json', 'X'), null);
  assert.equal(parseStoredRules('{"txt":["a"]}', 'X').version, 1);
});

test('splits commands into messages, keeping {{ }} blocks together', () => {
  assert.deepEqual(splitCommands('/em one\n\n/em two'), ['/em one', '/em two']);
  assert.deepEqual(splitCommands('&{template:default} {{name=A}}\n{{b=c}}'), [
    '&{template:default} {{name=A}}',
    '{{b=c}}',
  ]);
  assert.deepEqual(splitCommands('!script {{\n--#title|Hi\n}}\n/em done'), [
    '!script {{\n--#title|Hi\n}}',
    '/em done',
  ]);
});

test('fills placeholders and leaves everything else alone', () => {
  const values = {
    who: 'Alice',
    total: 22,
    result: 'crit',
    fields: { rname: 'Longsword', r1: '$[[0]]' },
    rolls: [{ index: 0, total: 22, tableItems: [] }],
  };
  assert.equal(
    fillPlaceholders(
      '/em ${who} rolled ${total} (${result}) with ${field:rname} = ${field:r1} ${unknown} {{name=x}}',
      values
    ),
    '/em Alice rolled 22 (crit) with Longsword = 22 ${unknown} {{name=x}}'
  );
  assert.equal(fillPlaceholders('${who}', { who: 'a\nb' }), 'a b');
});

test('every translation key used in the source exists in en-US', () => {
  const srcDir = path.join(__dirname, '..', 'src');
  const keys = new Set();
  for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.js'))) {
    const text = fs.readFileSync(path.join(srcDir, file), 'utf8');
    for (const match of text.matchAll(/\b(?:tr|t)\(\s*'([a-zA-Z]+(?:\.[a-zA-Z]+)+)'/g)) {
      keys.add(match[1]);
    }
  }
  const missing = [...keys].filter((key) => {
    let value = enUS;
    for (const part of key.split('.')) {
      value = value?.[part];
    }
    return value === undefined;
  });
  assert.deepEqual(missing, []);
  assert.ok(keys.size > 40);
});
