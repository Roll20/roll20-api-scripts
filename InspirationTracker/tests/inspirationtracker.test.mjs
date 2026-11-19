import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSandbox } from './roll20-stub.mjs';

/**
 * A game with two 2024 PCs (one per player), a 2014 PC and an NPC.
 *
 * @param {object} [options] createSandbox options.
 * @returns {Promise<object>} Sandbox and characters.
 */
async function game(options = {}) {
  let chars;
  const api = createSandbox({
    ...options,
    setup(a) {
      chars = {
        kildrak: a.beacon('Kildrak', { controlledby: 'p1' }),
        sera: a.beacon('Seraphina', { controlledby: 'p2' }),
        old: a.legacy('Oldtimer', { controlledby: 'p1' }),
        goblin: a.beacon('Goblin'),
      };
      chars.kTok = a.token(chars.kildrak);
      chars.kTok2 = a.token(chars.kildrak, { _pageid: 'page2' });
      chars.sTok = a.token(chars.sera);
      chars.oTok = a.token(chars.old);
      chars.gTok = a.token(chars.goblin);
      options.setup?.(a, chars);
    },
  });
  await api.ready();
  return { api, ...chars };
}

test('greets the GM and reads every sheet at start', async () => {
  const { api } = await game();
  assert.match(api.allChat(), /InspirationTracker is ready/);
  assert.match(api.allChat(), /Sheets read: 4\. With inspiration: 0\./);
  assert.ok(api.logs.some((l) => l.includes('InspirationTracker v1')));
});

test('GM gives Heroic Inspiration on a 2024 sheet: sheet, every token, chat and effect', async () => {
  const { api, kildrak, kTok, kTok2, sTok } = await game();
  await api.command('!inspiration give', [kTok]);
  assert.equal(api.inspired(kildrak), true);
  assert.equal(kTok.get('statusmarkers'), 'black-flag');
  assert.equal(kTok2.get('statusmarkers'), 'black-flag');
  assert.equal(sTok.get('statusmarkers'), '');
  const gained = api.chat.filter((c) => /Kildrak has Heroic Inspiration!/.test(c.text));
  assert.equal(gained.length, 1, 'announced once, not again for the sheet event');
  assert.ok(!gained[0].text.startsWith('/w'), 'public by default');
  assert.match(gained[0].text, /!inspiration spend --ids/);
  assert.equal(api.fx.length, 2);
  assert.equal(api.fx[0].type, 'nova-holy');
  assert.equal(api.fx[1].pageid, 'page2');
});

test('2014 sheet uses the word Inspiration and the "on" checkbox value', async () => {
  const { api, old, oTok } = await game();
  await api.command('!inspiration give', [oTok]);
  assert.equal(api.inspired(old), true);
  assert.match(api.allChat(), /Oldtimer has Inspiration!/);
  assert.doesNotMatch(api.allChat(), /Oldtimer has Heroic/);
});

test('2014 sheet without the attribute yet gets it created', async () => {
  let fresh;
  const api = createSandbox({
    setup(a) {
      fresh = a.legacy('Newbie', { inspired: null });
    },
  });
  await api.ready();
  await api.command(`!inspiration give --ids ${fresh.id}`);
  assert.equal(api.inspired(fresh), true);
});

test('a 2024 sheet set to 2014 rules says Inspiration; the Wording setting overrides', async () => {
  let c;
  const api = createSandbox({
    setup(a) {
      c = a.beacon('Classic', { newRules: false });
    },
  });
  await api.ready();
  await api.command(`!inspiration give --ids ${c.id}`);
  assert.match(api.lastChat(), /Classic has Inspiration!/);
  await api.command(`!inspiration remove --ids ${c.id}`);
  await api.command('!inspiration set wording 2024');
  await api.command(`!inspiration give --ids ${c.id}`);
  assert.match(api.allChat(), /Classic has Heroic Inspiration!/);
});

test('!inspiration with tokens selected toggles, as 0.1 did', async () => {
  const { api, kildrak, kTok } = await game();
  await api.command('!inspiration', [kTok]);
  assert.equal(api.inspired(kildrak), true);
  await api.command('!inspiration', [kTok]);
  assert.equal(api.inspired(kildrak), false);
  assert.equal(kTok.get('statusmarkers'), '');
});

test('!inspiration with nothing selected shows the GM menu', async () => {
  const { api } = await game();
  await api.command('!inspiration');
  assert.match(api.lastChat(), /^\/w "The GM"/);
  assert.match(api.lastChat(), /!inspiration party/);
});

test('players spend their own inspiration; the GM is told and can undo', async () => {
  const { api, kildrak, kTok } = await game();
  await api.command('!inspiration give', [kTok]);
  const before = api.chat.length;
  await api.command(`!inspiration spend --ids ${kildrak.id}`, [], 'p1');
  assert.equal(api.inspired(kildrak), false);
  assert.equal(kTok.get('statusmarkers'), '');
  const text = api.chatSince(before);
  assert.match(text, /Kildrak uses Heroic Inspiration\./);
  assert.match(text, /\/w gm .*Player One spent Heroic Inspiration for Kildrak/s);
  const undo = text.match(/!inspiration undo (\w+)/);
  assert.ok(undo, 'Undo button');
  await api.command(`!inspiration undo ${undo[1]}`);
  assert.equal(api.inspired(kildrak), true);
  assert.equal(kTok.get('statusmarkers'), 'black-flag');
  assert.match(api.allChat(), /Kildrak has Heroic Inspiration back/);
  // Each undo works once.
  await api.command(`!inspiration undo ${undo[1]}`);
  assert.match(api.lastChat(), /already been undone/);
});

test('players cannot spend for characters they do not control', async () => {
  const { api, sera } = await game();
  await api.command(`!inspiration give --ids ${sera.id}`);
  await api.command(`!inspiration spend --ids ${sera.id}`, [], 'p1');
  assert.equal(api.inspired(sera), true);
  assert.match(api.lastChat(), /You cannot do that for Seraphina/);
  assert.match(api.lastChat(), /^\/w "Player One"/);
});

test('players cannot spend when the GM turns it off, nor use GM commands', async () => {
  const { api, kildrak } = await game();
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  await api.command('!inspiration set playerSpend off');
  await api.command(`!inspiration spend --ids ${kildrak.id}`, [], 'p1');
  assert.equal(api.inspired(kildrak), true);
  assert.match(api.lastChat(), /turned off spending/);
  await api.command(`!inspiration give --ids ${kildrak.id}`, [], 'p1');
  assert.match(api.lastChat(), /Only the GM/);
});

test('a double-clicked Spend only spends once', async () => {
  const { api, kildrak } = await game();
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  const before = api.chat.length;
  await Promise.all([
    api.command(`!inspiration spend --ids ${kildrak.id}`, [], 'p1'),
    api.command(`!inspiration spend --ids ${kildrak.id}`, [], 'p1'),
  ]);
  const uses = api.chatSince(before).match(/Kildrak uses Heroic Inspiration/g) || [];
  assert.equal(uses.length, 1);
});

test('ticking the box on a 2024 sheet shows the marker and announces it', async () => {
  const { api, kildrak, kTok } = await game();
  await api.tickSheet(kildrak, true);
  assert.equal(kTok.get('statusmarkers'), 'black-flag');
  assert.match(api.lastChat(), /Kildrak has Heroic Inspiration!/);
  const before = api.chat.length;
  await api.tickSheet(kildrak, false);
  assert.equal(kTok.get('statusmarkers'), '');
  assert.match(api.chatSince(before), /Kildrak uses Heroic Inspiration/);
  assert.match(api.chatSince(before), /changed on the sheet or token/);
});

test('ticking the box on a 2014 sheet works too', async () => {
  const { api, old, oTok } = await game();
  await api.tickSheet(old, true);
  assert.equal(oTok.get('statusmarkers'), 'black-flag');
  assert.match(api.lastChat(), /Oldtimer has Inspiration!/);
});

test('adding or removing the marker by hand changes the sheet, keeping other markers', async () => {
  const { api, kildrak, kTok, kTok2 } = await game();
  kTok.set('statusmarkers', 'red@2');
  await api.editMarkers(kTok, 'red@2,black-flag');
  assert.equal(api.inspired(kildrak), true);
  assert.equal(kTok2.get('statusmarkers'), 'black-flag');
  await api.editMarkers(kTok, 'red@2');
  assert.equal(api.inspired(kildrak), false);
  assert.equal(kTok2.get('statusmarkers'), '');
  assert.equal(kTok.get('statusmarkers'), 'red@2');
});

test('2024 rules: gaining it twice offers to pass it on to someone without it', async () => {
  const { api, kildrak, sera, old } = await game();
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  const before = api.chat.length;
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  const text = api.chatSince(before);
  assert.match(text, /\/w "Player One".*already has Heroic Inspiration and cannot hold it twice/s);
  assert.match(text, /Asked the players of Kildrak/);
  const offer = text.match(/!inspiration pass (\w+) /)[1];
  assert.match(text, new RegExp(`pass ${offer} ${sera.id}`));
  assert.match(text, new RegExp(`pass ${offer} ${old.id}`));
  assert.doesNotMatch(text, new RegExp(`pass ${offer} ${kildrak.id}`));
  // Another player cannot use the offer.
  await api.command(`!inspiration pass ${offer} ${sera.id}`, [], 'p2');
  assert.match(api.lastChat(), /You cannot do that/);
  await api.command(`!inspiration pass ${offer} ${sera.id}`, [], 'p1');
  assert.equal(api.inspired(sera), true);
  assert.match(api.allChat(), /Kildrak gives Heroic Inspiration to Seraphina!/);
  await api.command(`!inspiration pass ${offer} ${old.id}`, [], 'p1');
  assert.match(api.lastChat(), /already been made/);
});

test('passing on to someone who already has it keeps the offer open', async () => {
  const { api, kildrak, sera } = await game();
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  await api.command(`!inspiration give --ids ${sera.id}`);
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  const offer = api.allChat().match(/!inspiration pass (\w+) /)[1];
  await api.command(`!inspiration pass ${offer} ${sera.id}`, [], 'p1');
  assert.match(api.lastChat(), /Seraphina already has it/);
  await api.command(`!inspiration pass ${offer} none`, [], 'p1');
  assert.match(api.lastChat(), /Kildrak lets the extra Heroic Inspiration go/);
});

test('2014 rules, or Pass On off: gaining it twice just says so', async () => {
  const { api, old, kildrak } = await game();
  await api.command(`!inspiration give --ids ${old.id}`);
  await api.command(`!inspiration give --ids ${old.id}`);
  assert.match(api.lastChat(), /Oldtimer already has Inspiration/);
  await api.command('!inspiration set passOn off');
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  assert.match(api.lastChat(), /Kildrak already has Heroic Inspiration/);
});

test('party overview: GM sees player characters with buttons; party add and remove', async () => {
  const { api, goblin, gTok, sera, sTok } = await game();
  await api.command(`!inspiration give --ids ${sera.id}`);
  await api.command('!inspiration party');
  let text = api.lastChat();
  assert.match(text, /Party Inspiration/);
  assert.match(text, /Kildrak/);
  assert.match(text, /Oldtimer/);
  assert.doesNotMatch(text, /Goblin/);
  assert.match(text, /1 of 3 have Heroic Inspiration/);
  assert.match(text, new RegExp(`remove --ids ${sera.id} --party`));
  await api.command('!inspiration party add', [gTok]);
  assert.match(api.lastChat(), /Goblin/);
  await api.command('!inspiration party remove', [sTok]);
  text = api.lastChat();
  assert.doesNotMatch(text, /Seraphina/);
  assert.ok(goblin);
});

test('players see only their own characters unless the GM shares the overview', async () => {
  const { api, kildrak } = await game();
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  await api.command('!inspiration', [], 'p1');
  let text = api.lastChat();
  assert.match(text, /^\/w "Player One"/);
  assert.match(text, /Kildrak/);
  assert.match(text, /Oldtimer/);
  assert.doesNotMatch(text, /Seraphina/);
  assert.match(text, new RegExp(`spend --ids ${kildrak.id}`));
  await api.command('!inspiration set playerOverview on');
  await api.command('!inspiration party', [], 'p2');
  text = api.lastChat();
  assert.match(text, /Kildrak/);
  assert.match(text, /Seraphina/);
  assert.doesNotMatch(text, /spend --ids/, "no Spend for other players' characters");
  assert.doesNotMatch(text, /give --ids/);
});

test('custom markers: chosen by name, stored by tag, moved on every token', async () => {
  const { api, kildrak, kTok } = await game();
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  await api.command('!inspiration set marker heroic');
  assert.equal(api.itState().config.marker, 'Heroic::4242');
  assert.equal(kTok.get('statusmarkers'), 'Heroic::4242');
  await api.command('!inspiration set marker nosuch');
  assert.match(api.lastChat(), /no token marker called "nosuch"/);
});

test('Marker set to None takes the marker off and puts none on, and inspiration still works', async () => {
  const { api, kildrak, sera, kTok, sTok } = await game();
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  assert.equal(kTok.get('statusmarkers'), 'black-flag');
  await api.command('!inspiration set marker none');
  assert.equal(api.itState().config.marker, '');
  assert.equal(kTok.get('statusmarkers'), '', 'the old marker is taken off');
  assert.match(api.lastChat(), /Marker[\s\S]*?>None</, 'the settings card says None');
  await api.command(`!inspiration give --ids ${sera.id}`);
  assert.equal(api.inspired(sera), true);
  assert.equal(sTok.get('statusmarkers'), '', 'no marker is put on');
  // A marker a GM adds by hand means nothing to the Mod now
  await api.editMarkers(sTok, 'black-flag');
  await api.editMarkers(sTok, '');
  assert.equal(api.inspired(sera), true, 'taking a marker off does not spend it');
  await api.command('!inspiration party');
  assert.match(api.lastChat(), /1 of|2 of/, 'the Party card still counts who has it');
  // Choosing a marker again puts it on everyone who has inspiration
  await api.command('!inspiration set marker black-flag');
  assert.equal(kTok.get('statusmarkers'), 'black-flag');
  assert.equal(sTok.get('statusmarkers'), 'black-flag');
});

test('the settings menu lists custom markers but not the 2024 sheet condition markers', async () => {
  const { api } = await game();
  await api.command('!inspiration set');
  const text = api.lastChat();
  assert.match(text, /Heroic,Heroic::4242/);
  assert.match(text, /Red,red/);
  assert.doesNotMatch(text, /sheet-blinded/);
});

test('bad settings are refused', async () => {
  const { api } = await game();
  await api.command('!inspiration set fxType purple-haze');
  assert.match(api.lastChat(), /Cannot set fxType/);
  await api.command('!inspiration set announce maybe');
  assert.match(api.lastChat(), /Cannot set announce/);
  await api.command('!inspiration set announce gm');
  assert.equal(api.itState().config.announce, 'gm');
});

test('announce gm whispers the GM and the owners instead of everyone', async () => {
  const { api, kildrak } = await game();
  await api.command('!inspiration set announce gm');
  const before = api.chat.length;
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  const sent = api.chat.slice(before).filter((c) => /Kildrak has/.test(c.text));
  assert.deepEqual(
    sent.map((c) => c.text.slice(0, 16)),
    ['/w "The GM" <div', '/w "Player One" '].map((s) => s.slice(0, 16))
  );
});

test('a sheet that refuses the change reports an error and changes nothing', async () => {
  const { api, kildrak, kTok } = await game();
  api.failWrites.add(kildrak.id);
  await api.command('!inspiration give', [kTok]);
  assert.equal(api.inspired(kildrak), false);
  assert.equal(kTok.get('statusmarkers'), '');
  assert.match(api.lastChat(), /Could not change the sheet of Kildrak/);
  assert.match(api.lastChat(), /sheet refused/);
});

test('tokens that represent no character are reported', async () => {
  const { api } = await game();
  const loose = api.token(null, { name: 'Barrel' });
  await api.command('!inspiration give', [loose]);
  assert.match(api.lastChat(), /do not represent a character: Barrel/);
  await api.command('!inspiration give');
  assert.match(api.lastChat(), /Select a token first/);
});

test('new tokens show the marker when the character has inspiration', async () => {
  const { api, kildrak } = await game();
  await api.command(`!inspiration give --ids ${kildrak.id}`);
  const dropped = api.token(kildrak);
  await api.fire('add:graphic', dropped);
  assert.equal(dropped.get('statusmarkers'), 'black-flag');
});

test("upgrading from 0.1 keeps the marker, effect and the GM's own command", async () => {
  let c;
  const api = createSandbox({
    state: {
      INSPIRATIONTRACKER: {
        config: {
          command: 'insp',
          statusmarker: 'trophy',
          fx: false,
          fx_type: 'burst-fire',
          firsttime: false,
        },
      },
    },
    setup(a) {
      c = a.legacy('Veteran', { inspired: true });
      a.token(c);
    },
  });
  await api.ready();
  const config = api.itState().config;
  assert.equal(config.marker, 'trophy');
  assert.equal(config.fx, false);
  assert.equal(config.fxType, 'burst-fire');
  assert.match(api.allChat(), /Your old command !insp still works/);
  const tok = api.token(c);
  await api.command('!insp', [tok]);
  assert.equal(api.inspired(c), false, '!insp with a token selected toggles');
  assert.ok(api.sandbox.state.INSPIRATIONTRACKER, 'old state left for a downgrade');
});

test('the player macro is a token action for everyone', async () => {
  const { api } = await game();
  await api.command('!inspiration macro');
  const macro = api.sandbox.findObjs({ _type: 'macro', name: 'Inspiration' })[0];
  assert.equal(macro.get('action'), '!inspiration spend');
  assert.equal(macro.get('visibleto'), 'all');
  assert.equal(macro.get('istokenaction'), true);
  await api.command('!inspiration macro');
  assert.equal(api.sandbox.findObjs({ _type: 'macro', name: 'Inspiration' }).length, 1);
});

test('other Mods can send commands and call the API', async () => {
  const { api, kildrak, kTok } = await game();
  await api.command(`!inspiration give --ids ${kildrak.id}`, [], 'API');
  assert.equal(api.inspired(kildrak), true);
  const mod = api.sandbox.InspirationTracker;
  assert.equal(await mod.isInspired(kTok.id), true);
  assert.equal(await mod.spend(kildrak.id), 'spent');
  assert.equal(api.inspired(kildrak), false);
  assert.equal(await mod.give(kTok.id), 'given');
  assert.equal(await mod.remove(kTok.id), 'removed');
  assert.equal(await mod.give('nobody'), 'unknown');
  const seen = [];
  mod.ObserveTokenChange((token) => seen.push(token.id));
  await mod.give(kildrak.id);
  assert.ok(seen.includes(kTok.id));
});

test('One-Click useroptions are applied once', async () => {
  const api = createSandbox({
    globalconfig: { inspirationtracker: { wording: '2014', language: 'fr' } },
  });
  await api.ready();
  assert.equal(api.itState().config.wording, '2014');
  assert.equal(api.itState().config.language, 'fr');
  await api.command('!inspiration set wording auto');
  await api.fire('ready');
  assert.equal(api.itState().config.wording, 'auto', 'a later chat change is kept');
});

test('status and help answer', async () => {
  const { api } = await game();
  await api.command('!inspiration status');
  assert.match(api.lastChat(), /D&D 2024 sheets/);
  await api.command('!inspiration help');
  assert.match(api.lastChat(), /!inspiration party add \/ party remove/);
  await api.command('!inspiration help', [], 'p1');
  assert.doesNotMatch(api.lastChat(), /party add/);
  await api.command('!inspiration frobnicate');
  assert.match(api.lastChat(), /Unknown command: frobnicate/);
});

test('ignores other commands that start the same way', async () => {
  const { api } = await game();
  const before = api.chat.length;
  await api.command('!inspirational quote');
  assert.equal(api.chat.length, before);
});
