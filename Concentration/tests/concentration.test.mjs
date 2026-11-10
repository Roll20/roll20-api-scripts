// End-to-end tests: load the built bundle into the Roll20 stub and drive it
// with chat commands, bar edits and marker changes.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSandbox } from './roll20-stub.mjs';

/**
 * Creates a ready game.
 *
 * @param {object} [options] Sandbox options.
 * @returns {Promise<object>} Sandbox API.
 */
async function game(options) {
  const api = createSandbox(options);
  await api.ready();
  api.clearChat();
  return api;
}

/**
 * Fails when the Mod logged an error.
 *
 * @param {object} api Sandbox API.
 * @returns {void}
 */
function assertNoErrors(api) {
  assert.deepEqual(
    api.logs.filter((line) => /ERROR/.test(line)),
    []
  );
}

/**
 * Makes a character with a linked token.
 *
 * @param {object} api Sandbox API.
 * @param {object} [options] Options.
 * @returns {{character: object, token: object}} Character and token.
 */
function caster(api, { name = 'Atala Dumein', mod = 2, controlledby = '' } = {}) {
  const character = api.character({ name, controlledby });
  api.sandbox.getAttrByName = (id, attr) =>
    id === character.id && attr === 'constitution_save_mod' ? String(mod) : '';
  const token = api.token({ name, represents: character.id, bar1_link: '-attr1' });
  return { character, token };
}

test('starts, greets the GM, shows the menu once and creates GM-only handouts', async () => {
  const api = createSandbox();
  await api.ready();
  assert.match(api.allText(), /Concentration is ready/);
  assert.match(api.allText(), /Concentration Settings/);
  const handouts = api.sandbox.findObjs({ _type: 'handout' });
  assert.deepEqual(handouts.map((h) => h.get('name')).sort(), [
    'Concentration - Command Deck',
    'Concentration - Help',
  ]);
  for (const handout of handouts) {
    assert.equal(handout.get('inplayerjournals'), '');
  }
  assert.equal(api.modState().notices.welcomed, true);
  assertNoErrors(api);
});

test('!concentration <spell> marks the token and announces the spell', async () => {
  const api = await game();
  const { token } = caster(api);
  await api.command('!concentration Web', [token]);
  assert.equal(token.get('statusmarkers'), 'stopwatch');
  assert.match(api.lastText(), /Atala Dumein is now concentrating on Web\./);
  assert.equal(api.messages().at(-1).to, '');
  assertNoErrors(api);
});

test('ending concentration says so, and never says "now concentrating"', async () => {
  const api = await game();
  const { token } = caster(api);
  await api.command('!concentration Web', [token]);
  api.clearChat();
  await api.command('!concentration', [token]);
  assert.equal(token.get('statusmarkers'), '');
  assert.equal(api.messages().length, 1);
  assert.match(api.lastText(), /Atala Dumein is no longer concentrating on Web\./);
  assert.doesNotMatch(api.allText(), /now concentrating/);
});

test('naming a different spell switches concentration', async () => {
  const api = await game();
  const { token } = caster(api);
  await api.command('!concentration Web', [token]);
  await api.command('!concentration Hold Person', [token]);
  assert.match(
    api.lastText(),
    /Atala Dumein stops concentrating on Web and is now concentrating on Hold Person\./
  );
  assert.equal(token.get('statusmarkers'), 'stopwatch');
  assert.equal(api.sandbox.Concentration.spellOf(token.id), 'Hold Person');
  await api.command('!concentration hold person', [token]);
  assert.match(api.lastText(), /no longer concentrating on Hold Person/);
});

test('taking the marker off by hand ends concentration with a message', async () => {
  const api = await game();
  const { token } = caster(api);
  await api.command('!concentration Bless', [token]);
  await api.edit(token, { statusmarkers: '' });
  assert.match(api.lastText(), /no longer concentrating on Bless/);
  assert.equal(api.sandbox.Concentration.isConcentrating(token.id), false);
});

test('putting the marker on by hand starts concentration without a spell', async () => {
  const api = await game();
  const { token } = caster(api);
  await api.edit(token, { statusmarkers: 'red,stopwatch@2' });
  assert.match(api.lastText(), /Atala Dumein is now concentrating\./);
  await api.command('!concentration end', [token]);
  assert.match(api.lastText(), /Atala Dumein is no longer concentrating\./);
  assert.equal(token.get('statusmarkers'), 'red');
});

test('damage rolls a save at DC 10 and a success keeps concentration', async () => {
  const api = await game({ dice: [12, 3] });
  const { token } = caster(api, { mod: 2 });
  await api.command('!concentration Web', [token]);
  await api.edit(token, { bar1_value: 17 });
  const text = api.lastText();
  assert.match(text, /Concentration Save/);
  assert.match(text, /DC 10/);
  assert.match(text, /\+2/);
  assert.match(text, /14/);
  assert.match(text, /Success/);
  assert.match(text, /Atala Dumein keeps concentrating on Web\./);
  assert.equal(token.get('statusmarkers'), 'stopwatch');
  assertNoErrors(api);
});

test('a failed save ends concentration and says which spell was lost', async () => {
  const api = await game({ dice: [3, 20] });
  const { token } = caster(api, { mod: 1 });
  await api.command('!concentration Web', [token]);
  api.clearChat();
  await api.edit(token, { bar1_value: '10' });
  assert.equal(api.messages().length, 1);
  assert.match(api.lastText(), /Failure/);
  assert.match(api.lastText(), /Atala Dumein loses concentration on Web\./);
  assert.equal(token.get('statusmarkers'), '');
});

test('the DC is half the damage, up to 30', async () => {
  const api = await game({ dice: [20, 20, 20, 20] });
  const { token } = caster(api, { mod: 20 });
  token.attrs.bar1_value = 200;
  await api.command('!concentration Web', [token]);
  await api.edit(token, { bar1_value: 160 });
  assert.match(api.lastText(), /DC 20/);
  api.advance(5000);
  await api.edit(token, { bar1_value: 20 });
  assert.match(api.lastText(), /DC 30/);
});

test('advantage rolls two dice and keeps the higher', async () => {
  const api = await game({ dice: [2, 15] });
  const { character, token } = caster(api, { mod: 0 });
  await api.command(`!concentration toggle-advantage ${character.id}`);
  await api.command('!concentration Bless', [token]);
  await api.edit(token, { bar1_value: 18 });
  assert.match(api.lastText(), /2 and 15 \(advantage\)/);
  assert.match(api.lastText(), /Success/);
});

test('dropping to 0 hit points ends concentration without a save', async () => {
  const api = await game();
  const { token } = caster(api);
  await api.command('!concentration Web', [token]);
  await api.edit(token, { bar1_value: 0 });
  assert.match(api.lastText(), /drops to 0 hit points and loses concentration on Web/);
  assert.doesNotMatch(api.lastText(), /Concentration Save/);
});

test('with Auto Roll Save off the reminder has Roll and Advantage buttons that work once', async () => {
  const api = await game({ dice: [4, 18] });
  const { token } = caster(api, { mod: 0, controlledby: 'p1' });
  await api.command('!concentration config auto_roll_save|false');
  await api.command('!concentration Web', [token]);
  await api.edit(token, { bar1_value: 12 });
  const reminder = api.messages().at(-1);
  assert.match(reminder.text, /must make a Constitution saving throw to keep concentrating: DC 10/);
  const id = reminder.raw.match(/advantage (pr_\d+_[a-z0-9]+)/)[1];
  await api.command(`!concentration advantage ${id}`, [], 'p1');
  assert.match(api.lastText(), /4 and 18 \(advantage\)/);
  await api.command(`!concentration roll ${id}`, [], 'p1');
  assert.match(api.lastText(), /That button has expired/);
});

test('a player cannot roll someone else’s save', async () => {
  const api = await game();
  const { token } = caster(api);
  await api.command('!concentration config auto_roll_save|false');
  await api.command('!concentration Web', [token]);
  await api.edit(token, { bar1_value: 12 });
  const id = api
    .messages()
    .at(-1)
    .raw.match(/roll (pr_\d+_[a-z0-9]+)/)[1];
  await api.command(`!concentration roll ${id}`, [], 'p1');
  assert.match(api.lastText(), /only change concentration for tokens you control/);
  assert.equal(api.modState().pendingRolls[id] !== undefined, true);
});

test('linked tokens of a character share concentration; unlinked tokens do not', async () => {
  const api = await game();
  const { character, token } = caster(api);
  const copy = api.token({
    name: 'Atala Dumein',
    represents: character.id,
    bar1_link: '-attr1',
    _pageid: 'page2',
  });
  await api.command('!concentration Web', [token]);
  assert.equal(copy.get('statusmarkers'), 'stopwatch');

  const goblin = api.character({ name: 'Goblin' });
  const g1 = api.token({ name: 'Goblin 1', represents: goblin.id });
  const g2 = api.token({ name: 'Goblin 2', represents: goblin.id });
  await api.command('!concentration Hex', [g1]);
  assert.equal(g1.get('statusmarkers'), 'stopwatch');
  assert.equal(g2.get('statusmarkers'), '');
  assert.match(api.lastText(), /Goblin 1 is now concentrating on Hex/);
});

test('players can only change tokens they control', async () => {
  const api = await game();
  const { token } = caster(api, { controlledby: 'p1' });
  const other = api.token({ name: 'Kildrak' });
  await api.command('!concentration Bless', [token, other], 'p1');
  assert.equal(token.get('statusmarkers'), 'stopwatch');
  assert.equal(other.get('statusmarkers'), '');
  assert.match(api.allText(), /only change concentration for tokens you control/);
  await api.command('!concentration config debug|true', [], 'p1');
  assert.match(api.lastText(), /Only the GM/);
});

test('Send Reminder To character whispers to the character and the GM', async () => {
  const api = await game({ dice: [15] });
  const { token } = caster(api);
  await api.command('!concentration config send_reminder_to|character');
  api.clearChat();
  await api.command('!concentration Hex', [token]);
  assert.deepEqual(
    api.messages().map((m) => m.to),
    ['Atala Dumein', 'gm']
  );
  api.clearChat();
  await api.edit(token, { bar1_value: 15 });
  assert.deepEqual(
    api.messages().map((m) => m.to),
    ['Atala Dumein', 'gm']
  );
  assert.ok(api.chat.every((c) => !c.text.includes('\n')));
});

test('detects a 5e OGL concentration spell card', async () => {
  const api = await game();
  const { token } = caster(api);
  await api.message({
    type: 'general',
    rolltemplate: 'spell',
    content: '{{charname=Atala Dumein}} {{name=Web}} {{concentration=1}}',
  });
  assert.equal(token.get('statusmarkers'), 'stopwatch');
  assert.match(api.lastText(), /Atala Dumein is now concentrating on Web/);
});

test('detects a D&D 2024 concentration spell card by character ID', async () => {
  const api = await game();
  const { character, token } = caster(api);
  await api.message({
    type: 'advancedroll',
    characterId: character.id,
    content:
      '<div class="header__title">Bless</div><span data-chip="concentration">Concentration</span>',
  });
  assert.equal(token.get('statusmarkers'), 'stopwatch');
  assert.match(api.lastText(), /now concentrating on Bless/);
  await api.message({
    type: 'advancedroll',
    characterId: character.id,
    content: '<div class="header__title">Fire Bolt</div><span>spell</span>',
  });
  assert.equal(api.sandbox.Concentration.spellOf(token.id), 'Bless');
});

test('settings change from the menu and the marker moves with them', async () => {
  const api = await game();
  const { token } = caster(api);
  await api.command('!concentration Web', [token]);
  await api.command('!concentration config statusmarker|Concentrating::42');
  assert.equal(token.get('statusmarkers'), 'Concentrating::42');
  assert.match(api.lastText(), /Status Marker is now Concentrating::42/);
  await api.command('!concentration config bar 2');
  assert.equal(api.modState().config.bar, 2);
  await api.command('!concentration config bar|9');
  assert.match(api.lastText(), /"9" is not a valid value for bar/);
  await api.command('!concentration config command|conc');
  await api.command('!conc status');
  assert.match(api.lastText(), /Who Is Concentrating/);
  assert.match(api.lastText(), /Atala Dumein: Web/);
});

test('status lists who is concentrating with End buttons', async () => {
  const api = await game();
  const { token, character } = caster(api);
  await api.command('!concentration Web', [token]);
  await api.command('!concentration status');
  assert.match(api.lastText(), /Atala Dumein: Web/);
  await api.command(`!concentration end ${character.id}`);
  assert.match(api.lastText(), /no longer concentrating on Web/);
  await api.command('!concentration status');
  assert.match(api.lastText(), /Nobody is concentrating/);
});

test('upgrades version 1.0 state, keeping settings and advantage', async () => {
  const api = createSandbox({
    state: {
      CONCENTRATION: {
        config: {
          command: 'concentration',
          statusmarker: 'purple',
          bar: 2,
          send_reminder_to: 'gm',
          auto_add_concentration_marker: false,
          auto_roll_save: false,
          advantage: false,
          bonus_attribute: 'con_save',
          show_roll_button: true,
          debug: false,
          support_mode: 'basic',
          firsttime: false,
        },
        advantages: { c1: true, c2: false },
        pendingRolls: {},
      },
    },
    setup: (a) => a.token({ name: 'Marked', statusmarkers: 'purple' }),
  });
  await api.ready();
  const s = api.modState();
  assert.equal(s.schemaVersion, 2);
  assert.equal(s.config.statusmarker, 'purple');
  assert.equal(s.config.bar, 2);
  assert.equal(s.config.auto_roll_save, false);
  assert.equal(s.config.bonus_attribute, 'con_save');
  assert.deepEqual(JSON.parse(JSON.stringify(s.advantages)), { c1: true });
  assert.equal(Object.keys(s.concentrating).length, 1);
  assert.match(api.allText(), /Upgraded from version 1\.0/);
  assert.doesNotMatch(api.allText(), /Concentration Settings/);
});

test('One-Click useroptions are applied once', async () => {
  const api = createSandbox({
    globalconfig: { concentration: { statusmarker: 'red', bar: '3', auto_roll_save: 'false' } },
  });
  await api.ready();
  assert.equal(api.modState().config.statusmarker, 'red');
  assert.equal(api.modState().config.bar, 3);
  assert.equal(api.modState().config.auto_roll_save, false);
});

test('reset asks first, then restores defaults', async () => {
  const api = await game();
  await api.command('!concentration config auto_roll_save|false');
  await api.command('!concentration reset');
  assert.match(api.lastText(), /Put every setting back/);
  assert.equal(api.modState().config.auto_roll_save, false);
  await api.command('!concentration reset confirm');
  assert.equal(api.modState().config.auto_roll_save, true);
});

test('spell names cannot inject Roll20 syntax', async () => {
  const api = await game();
  const { token } = caster(api);
  await api.command('!concentration @{target|hp} [[1d6]]', [token]);
  assert.doesNotMatch(api.chat.at(-1).text, /@\{|\[\[/);
  assertNoErrors(api);
});

test('the language setting translates handouts and falls back to English', async () => {
  const api = await game();
  await api.command('!concentration config language|de');
  assert.equal(api.modState().config.language, 'de');
  assert.match(api.lastText(), /Language|Sprache/);
  const help = api.sandbox.findObjs({ _type: 'handout', name: 'Concentration - Help' })[0];
  assert.match(help.get('notes'), /Concentration/);
});

test('a feat card that only mentions concentration never replaces a spell', async () => {
  const api = await game();
  const { character, token } = caster(api);
  await api.command('!concentration Bless', [token]);
  api.clearChat();
  await api.message({
    type: 'advancedroll',
    characterId: character.id,
    content:
      '<div class="header__title">War Caster</div><p>You have advantage to maintain concentration on a spell.</p>',
  });
  assert.equal(api.sandbox.Concentration.spellOf(token.id), 'Bless');
  assert.equal(api.messages().length, 0);
});

test('a spell card for a character the sender does not control is ignored', async () => {
  const api = await game();
  const { token } = caster(api, { name: 'Boss' });
  await api.command('!concentration Hold Person', [token]);
  await api.message({
    type: 'general',
    playerid: 'p1',
    rolltemplate: 'spell',
    content: '{{name=Light}} {{concentration=1}} {{charname=Boss}}',
  });
  assert.equal(api.sandbox.Concentration.spellOf(token.id), 'Hold Person');
});

test('a repeated card for the same spell changes nothing', async () => {
  const api = await game();
  const { character, token } = caster(api);
  const card = {
    type: 'advancedroll',
    characterId: character.id,
    content: '<div class="header__title">Moonbeam</div><span data-chip="concentration"></span>',
  };
  await api.message(card);
  const since = api.modState().concentrating[character.id].since;
  api.clearChat();
  api.advance(6000);
  await api.message(card);
  assert.equal(api.messages().length, 0);
  assert.equal(api.modState().concentrating[character.id].since, since);
});

test('dropping to 0 straight after another hit still ends concentration', async () => {
  const api = await game({ dice: [20] });
  const { token } = caster(api);
  await api.command('!concentration Web', [token]);
  await api.edit(token, { bar1_value: 15 });
  await api.edit(token, { bar1_value: 0 });
  assert.match(api.lastText(), /drops to 0 hit points and loses concentration on Web/);
  assert.equal(token.get('statusmarkers'), '');
});

test('a second hit within a second still calls for a save; linked echoes do not', async () => {
  const api = await game({ dice: [20, 20, 20, 20] });
  const { character, token } = caster(api);
  const copy = api.token({ name: 'Atala Dumein', represents: character.id, bar1_link: '-attr1' });
  await api.command('!concentration Web', [token]);
  api.clearChat();
  await api.edit(token, { bar1_value: 15 });
  await api.edit(copy, { bar1_value: 15 });
  assert.equal(api.messages().length, 1);
  await api.edit(token, { bar1_value: 10 });
  assert.equal(api.messages().length, 2);
});

test('deleting a concentrating token ends its concentration with a message', async () => {
  const api = await game();
  const goblin = api.token({ name: 'Goblin 1' });
  await api.command('!concentration Hex', [goblin]);
  goblin.remove();
  await api.settle();
  assert.match(api.lastText(), /Goblin 1 is no longer concentrating on Hex/);
  assert.deepEqual(Object.keys(api.modState().concentrating), []);
});

test('deleting the last linked token of a character ends its concentration', async () => {
  const api = await game();
  const { character, token } = caster(api);
  const copy = api.token({ name: 'Atala Dumein', represents: character.id, bar1_link: '-attr1' });
  await api.command('!concentration Web', [token]);
  copy.remove();
  await api.settle();
  assert.equal(api.sandbox.Concentration.isConcentrating(token.id), true);
  token.remove();
  await api.settle();
  assert.match(api.lastText(), /no longer concentrating on Web/);
});

test('new linked tokens get the marker and pasted marked tokens are tracked', async () => {
  const api = await game({ dice: [20] });
  const { character, token } = caster(api);
  await api.command('!concentration Web', [token]);
  const dropped = await api.drop({
    name: 'Atala Dumein',
    represents: character.id,
    bar1_link: '-attr1',
  });
  assert.equal(dropped.get('statusmarkers'), 'stopwatch');
  const pasted = await api.drop({ name: 'Goblin 3', statusmarkers: 'stopwatch' });
  assert.equal(api.sandbox.Concentration.isConcentrating(pasted.id), true);
  await api.edit(pasted, { bar1_value: 15 });
  assert.match(api.lastText(), /Concentration Save/);
});

test('linking a token moves its concentration to the character', async () => {
  const api = await game();
  const character = api.character({ name: 'Orkira' });
  const token = api.token({ name: 'Orkira', represents: character.id });
  await api.command('!concentration Bless', [token]);
  await api.edit(token, { bar1_link: '-attr9' });
  assert.equal(api.modState().concentrating[character.id]?.spell, 'Bless');
  assert.equal(api.modState().concentrating[token.id], undefined);
});

test('changing the HP Bar never drops concentration silently', async () => {
  const api = await game();
  const { character, token } = caster(api);
  await api.command('!concentration Web', [token]);
  token.remove(); // the record stays with no token on any page
  api.modState().concentrating[character.id] = { spell: 'Web', name: 'Atala Dumein', since: 1 };
  await api.command('!concentration config bar|2');
  assert.equal(api.modState().concentrating[character.id]?.spell, 'Web');
});

test('stale save buttons do not roll after concentration has ended', async () => {
  const api = await game();
  const { token } = caster(api);
  await api.command('!concentration config auto_roll_save|false');
  await api.command('!concentration Web', [token]);
  await api.edit(token, { bar1_value: 12 });
  const id = api
    .messages()
    .at(-1)
    .raw.match(/roll (pr_\d+_[a-z0-9]+)/)[1];
  await api.command('!concentration end', [token]);
  await api.command(`!concentration roll ${id}`);
  assert.match(api.lastText(), /That button has expired/);
});

test('a player cannot use a save button once its token is deleted', async () => {
  const api = await game();
  const goblin = api.token({ name: 'Goblin 1', controlledby: 'p1' });
  await api.command('!concentration config auto_roll_save|false');
  await api.command('!concentration Hex', [goblin]);
  await api.edit(goblin, { bar1_value: 12 });
  const id = api
    .messages()
    .at(-1)
    .raw.match(/roll (pr_\d+_[a-z0-9]+)/)[1];
  api.objects.delete(goblin.id);
  await api.command(`!concentration roll ${id}`, [], 'p1');
  assert.match(api.lastText(), /only change concentration for tokens you control/);
});

test('the handouts get the Concentration journal icon, also handouts made before', async () => {
  const icon = 'https://files.d20.io/images/506991604/a1UiVOI8fGKK8iOrNd_Cdw/thumb.webp';
  const api = createSandbox();
  api.sandbox.createObj('handout', { name: 'Concentration - Help', avatar: '' });
  await api.ready();
  const handouts = api.sandbox
    .findObjs({ _type: 'handout' })
    .filter((h) => h.get('name').startsWith('Concentration - '));
  assert.ok(handouts.length >= 2);
  for (const handout of handouts) {
    assert.equal(handout.get('avatar'), icon, handout.get('name'));
  }
});
