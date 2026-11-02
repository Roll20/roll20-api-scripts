/* Tests for how !smartaoe reads its arguments and inline rolls, using Node.js built-ins only. */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const SCRIPT = fs.readFileSync(path.join(__dirname, '..', 'SmartAoE.js'), 'utf8');

/** Loads SmartAoE with stubbed Roll20 globals, fires ready, and returns a function that sends a chat message */
function sandbox() {
  const events = {};
  const messages = [];
  const logs = [];
  const fakeObj = (values = {}) => {
    const v = { _id: '-obj' + Math.random().toString(36).slice(2), ...values };
    return {
      id: v._id,
      get: (k) => v[k] ?? v['_' + k] ?? '',
      set: (k, val) => (typeof k === 'object' ? Object.assign(v, k) : (v[k] = val)),
      remove() {},
    };
  };
  const player = fakeObj({ _id: 'P1', _displayname: 'Pak' });
  // The few underscore.js functions SmartAoE uses
  const _ = {
    contains: (list, item) => (list || []).includes(item),
    each: (list, fn) =>
      Array.isArray(list) ? list.forEach(fn) : Object.keys(list || {}).forEach((k) => fn(list[k], k)),
    flatten: (list) => list.flat(Infinity),
    has: (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key),
    isFunction: (f) => typeof f === 'function',
    times: (n, fn) => Array.from({ length: n }, (x, i) => fn(i)),
  };
  const context = vm.createContext({
    console,
    _,
    state: {},
    API_Meta: {},
    on: (event, callback) => (events[event] ||= []).push(callback),
    log: (value) => logs.push(String(value)),
    sendChat: (name, content) => messages.push(content),
    findObjs: () => [],
    filterObjs: () => [],
    getAllObjs: () => [],
    getObj: (type, id) => (type === 'player' && id === 'P1' ? player : undefined),
    createObj: (type, values) => fakeObj(values),
    getAttrByName: () => '',
    playerIsGM: () => true,
    Campaign: () => fakeObj({ turnorder: '[]', token_markers: '[]' }),
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    // Like libInline: no roll data when the message has no inlinerolls
    libInline: {
      getRollData: (msg) => (msg.inlinerolls || []).map((r) => ({ total: r.results.total, expression: r.expression })),
    },
  });
  vm.runInContext(SCRIPT, context);
  (events.ready || []).forEach((fn) => fn());
  const send = async (content, extra = {}) => {
    messages.length = 0;
    logs.length = 0;
    await events['chat:message'][0]({ type: 'api', playerid: 'P1', who: 'Pak', content, ...extra });
    return { messages: [...messages], logs: [...logs] };
  };
  return { send };
}

test('a $[[n]] with no roll data whispers how to fix it instead of crashing', async () => {
  // What arrives after SelectManager's !forselected: the placeholder, but no inlinerolls
  const { messages, logs } = await sandbox().send(
    '!smartaoe {{ --title|Fireball --radius|20ft --damageFormula1|$[[0]] --damageType1|fire }}',
  );
  assert.equal(messages.length, 1);
  assert.match(messages[0], /^\/w "Pak" Error: Inline roll 1 has no result/);
  assert.match(messages[0], /&lt;&lt;formula&gt;&gt;/);
  assert.doesNotMatch(logs.join('\n'), /reading 'total'/);
});

test('the error whisper has no literal [[ ]] for Roll20 to roll', async () => {
  const { messages } = await sandbox().send('!smartaoe {{ --title|Fireball --damageFormula1|$[[0]] }}');
  assert.doesNotMatch(messages[0], /\[\[|\]\]/);
});

test('an argument with no |value is read as empty', async () => {
  const { messages, logs } = await sandbox().send('!smartaoe {{ --title|Test --instant --radius|20ft }}');
  assert.doesNotMatch(messages.join('\n') + logs.join('\n'), /Cannot read properties/);
});

test('inline rolls that arrive with the message are still used', async () => {
  const { messages, logs } = await sandbox().send(
    '!smartaoe {{ --title|Fireball --radius|20ft --damageFormula1|$[[0]] }}',
    {
      inlinerolls: [{ expression: '8d6', results: { total: 28 } }],
    },
  );
  assert.doesNotMatch(messages.join('\n') + logs.join('\n'), /has no result|Cannot read properties/);
});
