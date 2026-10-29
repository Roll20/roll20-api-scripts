// End-to-end tests: the built CRL.js running in a stubbed Roll20 sandbox.

import assert from 'node:assert/strict';
import test from 'node:test';

import { createSandbox, dice, inlineRoll } from './roll20-stub.mjs';

/**
 * Compares values made inside the sandbox (another realm) with plain ones.
 *
 * @param {*} actual Value from the sandbox.
 * @param {*} expected Expected value.
 * @returns {void}
 */
function same(actual, expected) {
  assert.deepEqual(actual === undefined ? undefined : JSON.parse(JSON.stringify(actual)), expected);
}

/** Starts a game with the mod ready. */
function start(options) {
  const game = createSandbox(options);
  game.ready();
  game.clearChat();
  return game;
}

/** Sends a 5e-style attack from Alice. */
function rollAttack(game, d20, extra = {}) {
  game.say({
    who: 'Alice',
    rolltemplate: 'atkdmg',
    content: '{{rname=Longsword}} {{charname=Alice}} {{r1=$[[0]]}} {{dmg1=$[[1]]}}',
    inlinerolls: [
      inlineRoll('1d20+5', [dice(20, [d20]), { type: 'M', expr: '+5' }], d20 + 5),
      inlineRoll('1d8+3', [dice(8, [8]), { type: 'M', expr: '+3' }], 11),
    ],
    ...extra,
  });
}

/** Returns the ID of the listener with a name. */
function idOf(game, name) {
  const s = game.crlState();
  return Object.keys(s.listeners).find((id) => s.listeners[id].name === name);
}

/** Fails when any whisper shows an untranslated key. */
function assertNoRawKeys(game) {
  for (const { text } of game.chat) {
    assert.doesNotMatch(
      String(text),
      /\b(errors|hints|messages|buttons|prompts|fields|values|inspect|titles|settings|help|results)\.[a-z]+[A-Za-z.]*\b(?![^<]*>)/,
      text
    );
  }
}

test('startup creates the store character, handouts and greets the GM', () => {
  const game = createSandbox();
  game.ready();
  const store = game.ofType('character').find((c) => c.attrs.name === 'Customizable Roll Listener');
  assert.ok(store);
  assert.equal(store.attrs.archived, true);
  assert.equal(game.crlState().characterId, store.id);
  const handouts = game
    .ofType('handout')
    .map((h) => h.attrs.name)
    .sort();
  same(handouts, [
    'Customizable Roll Listener - Command Deck',
    'Customizable Roll Listener - Help',
  ]);
  assert.match(game.chat[0].text, /Customizable Roll Listener is ready/);
  assert.ok(game.logs.some((l) => l.includes('-=> Customizable Roll Listener v2.0.0')));
  assertNoRawKeys(game);
});

test('upgrades a version 1 game: state, abilities and their JSON rules', () => {
  const game = createSandbox({
    state: { CRL: { version: 1, help: 'store1', listen: 'on' } },
    setup: (objects, add) => {
      add('character', { _id: 'store1', name: 'Customizable Roll Listener', archived: true });
      add('ability', {
        _id: 'abCrit',
        characterid: 'store1',
        name: 'Crit',
        description: JSON.stringify({ txt: '', templates: ['atkdmg'], roll: ['critical'] }),
        action: '/em CRIT!',
      });
      add('ability', {
        _id: 'abBroken',
        characterid: 'store1',
        name: 'Helper',
        description: '',
        action: '/em helper',
      });
    },
  });
  game.ready();
  const s = game.crlState();
  assert.equal(s.schemaVersion, 2);
  assert.equal(s.config.enabled, true);
  same(s.order, ['abCrit', 'abBroken']);
  same(s.listeners.abCrit.results, ['crit']);
  assert.equal(s.listeners.abBroken.enabled, false);
  assert.match(game.objects.get('abCrit').attrs.description, /"crl":2/);
  assert.ok(game.chat.some((c) => /Upgraded from version 1/.test(c.text)));

  game.clearChat();
  rollAttack(game, 20);
  same(game.actions(), [{ who: 'CRL', text: '/em CRIT!' }]);
  game.clearChat();
  rollAttack(game, 12);
  same(game.actions(), []);
});

test('listeners survive a game copy (state lost, ability kept)', () => {
  const first = start();
  first.command('!crl new Crit --results crit --commands /em Crit!');
  const ability = first.ofType('ability')[0];
  const game = createSandbox({
    setup: (objects, add) => {
      add('character', { _id: 'store9', name: 'Customizable Roll Listener', archived: true });
      add('ability', { ...ability.attrs, characterid: 'store9', _characterid: 'store9' });
    },
  });
  game.ready();
  assert.ok(game.chat.some((c) => /Restored 1 listener/.test(c.text)));
  game.clearChat();
  rollAttack(game, 20);
  assert.equal(game.actions()[0]?.text, '/em Crit!');
});

test('creating, editing and triggering a listener', () => {
  const game = start();
  game.command(
    '!crl new Crit Sound --templates atkdmg --results crit --commands !roll20AM --audio,play|Crit \\\\ /em ${character} crits with ${field:rname} for ${total}'
  );
  const id = idOf(game, 'Crit Sound');
  assert.ok(id);
  assert.ok(game.chat.some((c) => /Listener: Crit Sound/.test(c.text)));
  assert.match(game.lastChat(), /Commands: Crit Sound/);
  assert.equal(
    game.objects.get(id).attrs.action,
    '!roll20AM --audio,play|Crit\n/em ${character} crits with ${field:rname} for ${total}'
  );

  game.clearChat();
  rollAttack(game, 20);
  same(
    game.actions().map((c) => c.text),
    ['!roll20AM --audio,play|Crit', '/em Alice crits with Longsword for 25']
  );

  game.clearChat();
  rollAttack(game, 19);
  same(game.actions(), []);

  game.command(`!crl edit ${id} --results fumble --total <=6`);
  same(game.crlState().listeners[id].results, ['fumble']);
  assert.equal(game.crlState().listeners[id].total, '<=6');
  game.clearChat();
  rollAttack(game, 1);
  assert.equal(game.actions().length, 2);

  game.command('!crl edit crit sound --name Fumble Sound --results -');
  assert.equal(game.objects.get(id).attrs.name, 'Fumble Sound');
  same(game.crlState().listeners[id].results, []);
  assertNoRawKeys(game);
});

test('roller speaker sends as the character who rolled', () => {
  const game = start();
  game.command('!crl new Emote --speaker roller --commands /em grins');
  game.clearChat();
  rollAttack(game, 10);
  same(
    game.actions().map((c) => c.who),
    ['character|alice']
  );
});

test('bad input is reported, never crashes, and changes nothing', () => {
  const game = start();
  game.command('!crl new A --results crit');
  game.clearChat();
  for (const cmd of [
    '!crl \\\\foo',
    '!crl delete Nobody',
    '!crl edit A --results maybe',
    '!crl edit A --regex on --text (unclosed',
    '!crl edit A --total abc',
    '!crl edit A --colour red',
    '!crl new A',
    '!crl new Bad|Name',
    '!crl frobnicate',
    '!crl config speaker loud',
    '!crl config nonsense 1',
  ]) {
    game.command(cmd);
  }
  assert.equal(game.chat.length, 11);
  assert.ok(game.chat.every((c) => c.text.startsWith('/w ')));
  same(game.crlState().listeners[idOf(game, 'A')].results, ['crit']);
  assert.ok(!game.logs.some((l) => l.includes('ERROR')), game.logs.join('\n'));
  assertNoRawKeys(game);
});

test('players cannot use commands', () => {
  const game = start();
  game.command('!crl new Sneaky', 'p1');
  assert.equal(game.ofType('ability').length, 0);
  assert.match(game.lastChat(), /Only a GM/);
});

test('delete asks first, then removes the ability', () => {
  const game = start();
  game.command('!crl new Gone --commands /em bye');
  const id = idOf(game, 'Gone');
  game.command('!crl delete Gone');
  assert.ok(game.objects.has(id));
  assert.match(game.lastChat(), /cannot be undone/);
  game.command(`!crl delete ${id} confirm`);
  assert.ok(!game.objects.has(id));
  assert.equal(idOf(game, 'Gone'), undefined);
});

test('global and per-listener switches, order and stop', () => {
  const game = start();
  game.command('!crl new First --stop on --commands /em first');
  game.command('!crl new Second --commands /em second');
  game.clearChat();
  rollAttack(game, 10);
  same(
    game.actions().map((c) => c.text),
    ['/em first']
  );

  game.command('!crl down First');
  game.clearChat();
  rollAttack(game, 10);
  same(
    game.actions().map((c) => c.text),
    ['/em second', '/em first']
  );

  game.command('!crl disable Second');
  game.clearChat();
  rollAttack(game, 10);
  same(
    game.actions().map((c) => c.text),
    ['/em first']
  );

  game.command('!crl off');
  game.clearChat();
  rollAttack(game, 10);
  same(game.actions(), []);
  game.command('!crl on');
  assert.equal(game.crlState().config.enabled, true);
});

test('cooldown waits between triggers', () => {
  const game = start();
  game.command('!crl new Slow --cooldown 30 --commands /em slow');
  game.clearChat();
  rollAttack(game, 10);
  rollAttack(game, 10);
  assert.equal(game.actions().length, 1);
  game.advance(31000);
  rollAttack(game, 10);
  assert.equal(game.actions().length, 2);
});

test('CRL ignores its own messages, and stops a listener that loops', () => {
  const game = start({ echo: true });
  game.command('!crl new Echo --text crits --commands /em crits again');
  game.clearChat();
  game.say({ content: 'Alice crits' });
  // Sent as CRL: its own message is ignored, so only one action.
  assert.equal(game.actions().length, 1);

  game.command('!crl edit Echo --speaker roller');
  game.clearChat();
  game.say({ who: 'Alice', content: 'Alice crits' });
  const id = idOf(game, 'Echo');
  assert.equal(game.crlState().listeners[id].enabled, false);
  assert.ok(game.actions().length <= 21);
  assert.ok(game.chat.some((c) => /fired too often/.test(c.text)));
});

test('listenToMods off ignores messages from other mods', () => {
  const game = start();
  game.command('!crl new Any --commands /em heard');
  game.command('!crl config listenToMods off');
  game.clearChat();
  game.say({ who: 'ScriptCards', playerid: 'API', content: 'hello' });
  same(game.actions(), []);
  game.say({ content: 'hello' });
  assert.equal(game.actions().length, 1);
});

test('the inspector whispers a breakdown of the next message', () => {
  const game = start();
  game.command('!crl new Crit --results crit');
  game.command('!crl new Spell --templates spell');
  game.command('!crl inspect');
  game.clearChat();
  rollAttack(game, 20);
  const card = game.chat.find((c) => /CRL Inspector/.test(c.text))?.text || '';
  assert.match(card, /atkdmg/);
  assert.match(card, /rname=Longsword, charname=Alice/);
  assert.match(card, /d20:20 \(crit\)/);
  assert.match(card, /would trigger Critical/);
  assert.match(card, /roll template does not match/);
  game.clearChat();
  rollAttack(game, 20);
  assert.ok(!game.chat.some((c) => /CRL Inspector/.test(c.text)));
  assertNoRawKeys(game);
});

test('test runs the commands with sample values', () => {
  const game = start();
  game.command('!crl new T --commands /em ${who} ${natural}');
  game.clearChat();
  game.command('!crl test T');
  assert.equal(game.actions()[0].text, '/em The GM 20');
});

test('version 1 commands still work, including inline rolls', () => {
  const game = start();
  game.command(
    '!crl \\\\create,name=Loot,text=treasure,template=simple,roll=critical \\\\/em finds $[[0]] \\\\/em yay',
    'gm1',
    {
      inlinerolls: [{ expression: '1t[Loot]', results: { total: 1, rolls: [] } }],
    }
  );
  const id = idOf(game, 'Loot');
  assert.ok(id);
  assert.equal(game.objects.get(id).attrs.action, '/em finds [[1t[Loot]]]\n/em yay');
  const listener = game.crlState().listeners[id];
  same(listener.templates, ['simple']);
  same(listener.text, ['treasure']);
  same(listener.results, ['crit']);

  game.command('!crl \\\\edit,name=Loot,roll=fumble');
  same(game.crlState().listeners[id].results, ['fumble']);
  game.command('!crl \\\\set,listen=off');
  assert.equal(game.crlState().config.enabled, false);
  game.command('!crl \\\\delete,name=Loot');
  assert.equal(idOf(game, 'Loot'), undefined);
});

test('Journal edits keep listeners in step', () => {
  const game = start();
  game.command('!crl new J --commands /em j');
  const id = idOf(game, 'J');
  const ability = game.objects.get(id);
  ability.attrs.name = 'Renamed';
  game.fireEvent('change:ability', ability);
  assert.equal(game.crlState().listeners[id].name, 'Renamed');
  game.objects.delete(id);
  game.fireEvent('destroy:ability', ability);
  assert.equal(game.crlState().listeners[id], undefined);
});

test('useroptions apply once, and language changes rebuild handouts', () => {
  const game = start({
    globalconfig: { crl: { speaker: 'roller', listenToMods: 'off', language: 'fr' } },
  });
  const config = game.crlState().config;
  assert.equal(config.speaker, 'roller');
  assert.equal(config.listenToMods, false);
  assert.equal(config.language, 'fr');
  game.command('!crl config language en');
  assert.equal(game.crlState().config.language, 'en-US');
});

test('the public API reports matches and notifies observers', () => {
  const game = start();
  game.command('!crl new Crit --results crit');
  const seen = [];
  game.sandbox.CRL.onMatch((m) => seen.push(m.listener.name));
  const msg = {
    type: 'general',
    who: 'Bob',
    content: '$[[0]]',
    inlinerolls: [inlineRoll('1d20', [dice(20, [20])], 20)],
  };
  same(game.sandbox.CRL.matches(msg), ['Crit']);
  game.say(msg);
  same(seen, ['Crit']);
});

test('whispers never carry Roll20 syntax outside buttons', () => {
  const game = start();
  game.command(
    '!crl new Refs --text [[x]] --commands /em @{Alice|hp} %{Alice|attack} [[1d6]] ?{Ask}'
  );
  game.command('!crl show Refs');
  game.command('!crl inspect');
  game.say({ content: 'see @{Alice|hp} and %{Alice|x} and [[2]]' });
  game.command('!crl help');
  assert.ok(game.chat.length > 4);
  for (const { text } of game.chat.filter((c) => c.text.startsWith('/w '))) {
    const outsideLinks = text.replaceAll(/href="[^"]*"/g, '');
    assert.doesNotMatch(outsideLinks, /@\{|%\{|\[\[|\?\{/, outsideLinks);
  }
});
