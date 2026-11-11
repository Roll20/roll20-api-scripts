// Permissions, injection and dashboard safety (plan §9, §10, §15.4).

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSandbox } from './roll20-stub.mjs';

/**
 * Creates a ready game.
 *
 * @param {object} [options] Sandbox options.
 * @returns {object} Sandbox API.
 */
function game(options) {
  const api = createSandbox(options);
  api.ready();
  return api;
}

const base = (id, steps, extra = {}) => ({
  schemaVersion: 1,
  id,
  name: id,
  triggers: [{ id: 'manual', type: 'manual' }],
  access: { mode: 'gmOnly', authority: 'initiator' },
  policy: { concurrency: 'allow', maxConcurrent: 5 },
  steps,
  ...extra,
});

test('only the exact command is handled; players and other Mods cannot use GM commands', () => {
  const api = game();
  api.clearChat();
  api.command('!taskautomationx help');
  api.command('!task help');
  assert.equal(api.chat.length, 0);
  api.command('!taskautomation definition list', [], 'p1');
  assert.match(api.allText(), /Only the GM can do that/);
  api.clearChat();
  api.command('!taskautomation stop-all --preview', [], 'API');
  assert.equal(api.chat.length, 0, 'API-origin messages are ignored');
});

test('a task cannot drive TaskAutomation itself through an outgoing command', () => {
  const api = game();
  api.importDef(
    base('sneaky', [
      { id: 'c', type: 'integration.command', command: '!taskautomation stop-all --preview' },
    ])
  );
  api.command('!taskautomation instance start --definition sneaky');
  api.advance(10);
  assert.equal(api.taState().halted, null);
  assert.equal(Object.keys(api.taState().confirmations).length, 0);
});

test('command values cannot add flags or commands', () => {
  const api = game();
  const token = api.token({ name: 'x --set layer|gmlayer' });
  api.importDef(
    base(
      'cmd',
      [
        {
          id: 'c',
          type: 'integration.command',
          command: '!token-mod --ids {{args.n}}',
          args: { n: { ref: 'target.t.name' } },
        },
      ],
      {
        bindings: { t: { from: 'selected', objectType: 'graphic' } },
      }
    )
  );
  api.command('!taskautomation instance start --definition cmd', [token]);
  api.advance(10);
  assert.ok(!api.chat.some((c) => c.text.startsWith('!token-mod')));
  assert.equal(api.lastRun().error.reason, 'unsafeArgument');
});

test('chat values are escaped and cannot become slash commands', () => {
  const api = game();
  const token = api.token({ name: '/w gm <img src=x onerror=alert(1)>' });
  api.importDef(
    base('hi', [{ id: 's', type: 'chat.send', text: 'Hello {{target.t.name}}' }], {
      bindings: { t: { from: 'selected', objectType: 'graphic' } },
    })
  );
  api.command('!taskautomation instance start --definition hi', [token]);
  api.advance(10);
  const sent = api.chat.find((c) => c.text.startsWith('Hello'));
  assert.equal(sent.text, 'Hello w gm &lt;img src=x onerror=alert(1)&gt;');
});

test('imports reject prototype pollution and oversized commands', () => {
  const api = game();
  api.command(
    '!taskautomation definition import --json {"schemaVersion":1,"id":"p","name":"p","steps":[],"__proto__":{"polluted":true}}'
  );
  assert.match(api.allText(), /is not allowed/);
  assert.equal({}.polluted, undefined);
  api.command(`!taskautomation definition import --json ${'x'.repeat(40000)}`);
  assert.match(api.allText(), /too large/);
});

test('published player tasks: listed players, controlled targets only, and revocation', () => {
  const api = game();
  const mine = api.token({ name: 'Mine', controlledby: 'p1' });
  const theirs = api.token({ name: 'Theirs', controlledby: 'p2' });
  api.importDef(
    base(
      'wave',
      [
        { id: 'w', type: 'wait', durationMs: 5000 },
        { id: 'm', type: 'marker.set', target: { binding: 't' }, marker: 'green' },
      ],
      {
        bindings: { t: { from: 'selected', objectType: 'graphic', max: 1 } },
        access: {
          mode: 'players',
          players: ['p1'],
          authority: 'initiator',
          capabilities: { actions: ['marker.set'] },
        },
      }
    )
  );
  api.command('!taskautomation instance start --definition wave', [theirs], 'p1');
  assert.match(api.allText(), /only use tokens and characters you control/);
  api.command('!taskautomation instance start --definition wave', [mine], 'p2');
  assert.match(api.allText(), /not shared with you/);
  api.command('!taskautomation instance start --definition wave --bind t=' + theirs.id, [], 'p1');
  assert.match(api.allText(), /only use tokens and characters you control/);
  api.command('!taskautomation instance start --definition wave', [mine], 'p1');
  const run = api.lastRun();
  assert.equal(run.initiatorPlayerId, 'p1');
  // The player loses control while the run waits: it stops for review instead of acting.
  api.change(mine, { controlledby: '' });
  api.advance(5000);
  assert.equal(api.run(run.id).status, 'review');
  assert.equal(api.run(run.id).review.reason, 'controlLost');
  assert.equal(mine.attrs.statusmarkers, '');
  // Players can inspect and cancel only their own runs.
  api.command(`!taskautomation instance cancel --id ${run.id}`, [], 'p2');
  assert.match(api.allText(), /no run run-\d+ you can manage/);
});

test('players may only send signals that a task shares with them', () => {
  const api = game();
  api.command('!taskautomation signal secret', [], 'p1');
  assert.match(api.allText(), /cannot send the signal secret/);
  api.importDef(
    base('bell', [{ id: 's', type: 'chat.send', text: 'ding' }], {
      triggers: [{ id: 'b', type: 'signal', name: 'bell', players: true }],
    })
  );
  api.command('!taskautomation signal bell', [], 'p1');
  api.advance(10);
  assert.ok(api.chat.some((c) => c.text === 'ding'));
});

test('confirmation tokens are single-use and bound to the caller', () => {
  const api = game();
  api.add('player', { _id: 'gm2', displayname: 'Co-GM', gm: true });
  api.command('!taskautomation stop-all --preview');
  const token = /stop-all --confirm (\S+?)"/.exec(api.allChat())[1];
  api.command(`!taskautomation stop-all --confirm ${token}`, [], 'gm2');
  assert.match(api.allText(), /made for someone else/);
  assert.equal(api.taState().halted, null);
  api.command(`!taskautomation stop-all --confirm ${token}`);
  assert.match(api.allText(), /not valid. Preview again/);
});

test('the dashboard is GM-only, escaped, throttled, and stops writing when shared', () => {
  const api = game();
  const dash = api.handout('TaskAutomation - Dashboard');
  const help = api.handout('TaskAutomation - Help');
  assert.equal(dash.attrs.inplayerjournals, '');
  assert.equal(help.attrs.inplayerjournals, '');
  api.importDef(
    base('<b>bold</b>', [{ id: 'w', type: 'wait', durationMs: 60000 }], {
      id: 'evil',
      name: '<script>x</script>',
    })
  );
  let writes = 0;
  const set = dash.set.bind(dash);
  dash.set = (key, value) => {
    if (key === 'notes') {
      writes += 1;
    }
    set(key, value);
  };
  api.command('!taskautomation dashboard view definitions');
  for (let i = 0; i < 30; i += 1) {
    api.command('!taskautomation instance start --definition evil');
    api.advance(100);
  }
  api.advance(6000);
  assert.ok(writes >= 1 && writes <= 4, `notes written ${writes} times`);
  assert.doesNotMatch(dash.attrs.notes, /<script>/);
  assert.match(dash.attrs.notes, /&lt;script&gt;/);
  // Someone shares the dashboard: it is not updated until repaired.
  dash.attrs.inplayerjournals = 'all';
  writes = 0;
  api.command('!taskautomation dashboard refresh');
  api.advance(6000);
  assert.equal(writes, 0);
  assert.match(api.allText(), /shared with players/);
  api.command('!taskautomation dashboard repair');
  api.advance(6000);
  assert.equal(dash.attrs.inplayerjournals, '');
  assert.ok(writes >= 1);
});

test('a deleted dashboard is recreated on the next write', () => {
  const api = game();
  const dash = api.handout('TaskAutomation - Dashboard');
  dash.remove();
  api.advance(6000);
  const again = api.handout('TaskAutomation - Dashboard');
  assert.ok(again);
  assert.notEqual(again.id, dash.id);
  assert.equal(again.attrs.inplayerjournals, '');
});

test('the player view lists only tasks shared with players', () => {
  const api = game();
  api.command('!taskautomation config set playerView on');
  api.importDef(
    base('gm-secret', [{ id: 's', type: 'chat.send', text: 'x' }], { name: 'GM Secret' })
  );
  api.importDef(
    base('shared', [{ id: 'm', type: 'marker.set', target: { binding: 't' }, marker: 'blue' }], {
      name: 'Shared Task',
      bindings: { t: { from: 'selected', objectType: 'graphic' } },
      access: { mode: 'players', players: ['p1'], authority: 'initiator' },
    })
  );
  api.advance(6000);
  const view = api.handout('TaskAutomation - Player View');
  assert.equal(view.attrs.inplayerjournals, 'p1');
  assert.match(view.attrs.notes, /Shared Task/);
  assert.doesNotMatch(view.attrs.notes, /GM Secret/);
});

test('dashboard links carry revisions and only IDs', () => {
  const api = game();
  api.importDef(base('w', [{ id: 'w', type: 'wait', durationMs: 60000 }]));
  api.command('!taskautomation instance start --definition w');
  api.command('!taskautomation dashboard view instances');
  api.advance(6000);
  const notes = api.handout('TaskAutomation - Dashboard').attrs.notes;
  const run = api.lastRun();
  assert.match(
    notes,
    new RegExp(`href="!taskautomation instance pause --id ${run.id} --rev ${run.revision}"`)
  );
});
