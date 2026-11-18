import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSandbox } from './roll20-stub.mjs';

const BOX = 'repeating_resource_-abc_resource_left';

/**
 * A game with a 2014 PC whose sheet has a resource box named Inspiration
 * holding 52 points, a 2024 PC and an NPC, with Tracking set to Points pool.
 *
 * @param {{tracking?: boolean}} [options] Leave Tracking on the sheet box with `tracking: false`.
 * @returns {Promise<object>} Sandbox, characters and tokens.
 */
async function game({ tracking = true } = {}) {
  let c;
  const api = createSandbox({
    setup(a) {
      c = {
        nox: a.legacy('Nox', { controlledby: 'p1' }),
        sera: a.beacon('Seraphina', { controlledby: 'p2' }),
        goblin: a.beacon('Goblin'),
      };
      c.box = a.resourceBox(c.nox, BOX, 'Inspiration', '52');
      c.nTok = a.token(c.nox);
      c.nTok2 = a.token(c.nox, { _pageid: 'page2' });
      c.sTok = a.token(c.sera);
      a.add('character', { name: 'Shared Helper', controlledby: 'all' });
    },
  });
  await api.ready();
  if (tracking) {
    await api.command('!inspiration set tracking pool');
  }
  return { api, ...c };
}

test('a fresh install has one default pool and tracks the sheet box', async () => {
  const { api, nTok } = await game({ tracking: false });
  const s = api.itState();
  assert.equal(s.config.tracking, 'flag');
  assert.deepEqual(JSON.parse(JSON.stringify(s.pools)), [
    { id: 'inspiration', name: 'Inspiration', source: 'resource', cost: 1, max: 0, marker: '' },
  ]);
  assert.equal(
    nTok.get('statusmarkers'),
    '',
    'pool points show no marker while the box is tracked'
  );
});

test('switching Tracking to Points pool marks the characters who have points', async () => {
  const { api, nTok, nTok2, sTok } = await game();
  assert.equal(nTok.get('statusmarkers'), 'black-flag');
  assert.equal(nTok2.get('statusmarkers'), 'black-flag');
  assert.equal(sTok.get('statusmarkers'), '');
  await api.command('!inspiration set tracking flag');
  assert.equal(nTok.get('statusmarkers'), '', 'and back again takes it off');
});

test('give adds points to the sheet resource box and announces the totals', async () => {
  const { api, box, nTok } = await game();
  await api.command('!inspiration give 3', [nTok]);
  assert.equal(box.get('current'), '55');
  assert.match(api.allChat(), /Nox gains 3 Inspiration \(52 → 55\)\./);
  assert.match(api.allChat(), /!inspiration spend \?\{Points\|1\} --ids \S+ --pool inspiration/);
  assert.equal(api.fx.length, 2);
  await api.command('!inspiration give', [nTok]);
  assert.equal(box.get('current'), '56', 'no number means one point');
});

test('boost spends the cost for each +1: 2 points per +1, +4 costs 8', async () => {
  const { api, nox, box, nTok } = await game();
  await api.command('!inspiration pool set inspiration cost 2');
  const before = api.chat.length;
  await api.command(`!inspiration boost 4 --ids ${nox.id}`, [], 'p1');
  assert.equal(box.get('current'), '44');
  const text = api.chatSince(before);
  assert.match(text, /Nox spends 8 Inspiration for \+4 to the roll \(52 → 44\)\./);
  assert.match(text, /\/w gm .*Player One spent 8 Inspiration for Nox/s);
  const undo = text.match(/!inspiration undo (\w+)/);
  await api.command(`!inspiration undo ${undo[1]}`);
  assert.equal(box.get('current'), '52');
  assert.match(api.allChat(), /Nox has 8 Inspiration back \(44 → 52\)\./);
  assert.equal(nTok.get('statusmarkers'), 'black-flag');
});

test('spending more than the pool holds is refused', async () => {
  const { api, box, nTok } = await game();
  await api.command('!inspiration spend 60', [nTok]);
  assert.equal(box.get('current'), '52');
  assert.match(api.lastChat(), /Nox has 52 Inspiration, and that needs 60\./);
  await api.command('!inspiration spend lots', [nTok]);
  assert.match(api.lastChat(), /"lots" is not a number of points/);
});

test('spending the last points takes the marker off; remove all is quiet', async () => {
  const { api, box, nTok } = await game();
  await api.command('!inspiration spend 52', [nTok]);
  assert.equal(box.get('current'), '0');
  assert.equal(nTok.get('statusmarkers'), '');
  await api.command('!inspiration give 5', [nTok]);
  const before = api.chat.length;
  await api.command('!inspiration remove all', [nTok]);
  assert.equal(box.get('current'), '0');
  const text = api.chatSince(before);
  assert.match(text, /^\/w "The GM" .*5 Inspiration taken away from Nox \(5 → 0\)/s);
  assert.doesNotMatch(text, /undo/);
});

test("a player cannot spend another player's points, nor when spending is off", async () => {
  const { api, nox, box } = await game();
  await api.command(`!inspiration spend 2 --ids ${nox.id}`, [], 'p2');
  assert.equal(box.get('current'), '52');
  assert.match(api.lastChat(), /You cannot do that for Nox/);
  await api.command('!inspiration set playerSpend off');
  await api.command(`!inspiration spend 2 --ids ${nox.id}`, [], 'p1');
  assert.equal(box.get('current'), '52');
  await api.command(`!inspiration give 2 --ids ${nox.id}`, [], 'p1');
  assert.equal(box.get('current'), '52', 'players cannot give');
});

test('a sheet with no box of that name, and the 2024 sheet, use a plain attribute', async () => {
  const { api, sera, sTok } = await game();
  await api.command('!inspiration give 4', [sTok]);
  assert.equal(api.attribute(sera, 'inspiration_pool').get('current'), 4);
  assert.equal(sTok.get('statusmarkers'), 'black-flag');
  assert.equal(api.inspired(sera), false, 'the Heroic Inspiration box is left alone');
  assert.match(api.allChat(), /Seraphina gains 4 Inspiration \(0 → 4\)/);
});

test('the cards say where each character keeps its points', async () => {
  const { api } = await game();
  await api.command('!inspiration party');
  const card = api.lastChat();
  assert.match(
    card,
    /Nox<[\s\S]*?Sheet box: Inspiration[\s\S]*?Seraphina<[\s\S]*?Attribute: inspiration_pool/,
    'the 2014 sheet has the box, the 2024 sheet uses the attribute'
  );
  assert.match(card, /An attribute is not shown on the character sheet\./);
  await api.command('!inspiration', [], 'p1');
  const own = api.lastChat();
  assert.match(own, /Sheet box: Inspiration/);
  assert.doesNotMatch(own, /An attribute is not shown/, 'nothing of theirs is in an attribute');
});

test('"Kept in: Attribute" ignores the resource box', async () => {
  const { api, nox, box, nTok } = await game();
  await api.command('!inspiration pool set inspiration source attribute');
  assert.equal(nTok.get('statusmarkers'), '', 'no points in the attribute yet');
  await api.command('!inspiration give 2', [nTok]);
  assert.equal(box.get('current'), '52');
  assert.equal(api.attribute(nox, 'inspiration_pool').get('current'), 2);
});

test('a maximum caps the pool', async () => {
  const { api, sera, sTok } = await game();
  await api.command('!inspiration pool set inspiration max 3');
  await api.command('!inspiration give 5', [sTok]);
  assert.equal(api.attribute(sera, 'inspiration_pool').get('current'), 3);
  assert.match(api.allChat(), /Seraphina gains 3 Inspiration \(0 → 3\)/);
  await api.command('!inspiration give', [sTok]);
  assert.match(api.lastChat(), /Seraphina already has the most Inspiration allowed \(3\)/);
});

test('changing the number on the sheet moves the marker', async () => {
  const { api, box, nTok } = await game();
  await api.editAttribute(box, '0');
  assert.equal(nTok.get('statusmarkers'), '');
  await api.editAttribute(box, '7');
  assert.equal(nTok.get('statusmarkers'), 'black-flag');
});

test('a marker taken off by hand is put back while there are points', async () => {
  const { api, box, nTok } = await game();
  await api.editMarkers(nTok, '');
  assert.equal(nTok.get('statusmarkers'), 'black-flag');
  assert.equal(box.get('current'), '52');
});

test('the party card shows points, with Give, Remove and Spend for the GM', async () => {
  const { api, nox, sera } = await game();
  await api.command('!inspiration party');
  const card = api.lastChat();
  assert.match(card, /Party Inspiration/);
  assert.match(card, />52</);
  assert.match(card, /Party total: 52 Inspiration\./);
  assert.match(
    card,
    new RegExp(`give \\?\\{Points\\|1\\} --ids ${sera.id} --pool inspiration --party`)
  );
  assert.match(
    card,
    new RegExp(`spend \\?\\{Points\\|1\\} --ids ${nox.id} --pool inspiration --party`)
  );
});

test('a player sees their own points with Spend and Boost', async () => {
  const { api, nox } = await game();
  await api.command('!inspiration', [], 'p1');
  const card = api.lastChat();
  assert.match(card, /^\/w "Player One"/);
  assert.match(card, />52</);
  assert.match(
    card,
    new RegExp(`boost \\?\\{Bonus to the roll\\|1\\} --ids ${nox.id} --pool inspiration`)
  );
  assert.doesNotMatch(card, /Seraphina/);
  assert.doesNotMatch(
    card,
    /Shared Helper/,
    'a character everyone controls is not listed without points'
  );
});

test('the GM adds a second pool and uses it with --pool, beside the sheet box', async () => {
  const { api, nox, sera, nTok, sTok } = await game({ tracking: false });
  await api.command('!inspiration pool add Hero Points');
  assert.match(api.lastChat(), /Hero Points/);
  await api.command('!inspiration pool set hero-points max 3');
  await api.command('!inspiration pool set hero-points marker green');
  await api.command('!inspiration give 2 --pool "Hero Points"', [sTok]);
  assert.equal(api.attribute(sera, 'hero_points_pool').get('current'), 2);
  assert.equal(sTok.get('statusmarkers'), 'green');
  assert.match(api.allChat(), /Seraphina gains 2 Hero Points \(0 → 2\)/);
  await api.command(`!inspiration spend --ids ${sera.id} --pool hero-points`, [], 'p2');
  assert.equal(api.attribute(sera, 'hero_points_pool').get('current'), 1);
  // The sheet's inspiration box still works on its own.
  await api.command('!inspiration give', [nTok]);
  assert.equal(api.inspired(nox), true);
  assert.equal(nTok.get('statusmarkers'), 'black-flag');
  await api.command('!inspiration party --pool hero-points');
  assert.match(api.lastChat(), /Party Hero Points/);
  await api.command('!inspiration give --pool nonsense', [sTok]);
  assert.match(api.lastChat(), /There is no pool called "nonsense"/);
});

test('the Bardic Inspiration recipe: a pool with a maximum of 1 and its own marker', async () => {
  const { api, sera, sTok } = await game({ tracking: false });
  await api.command('!inspiration pool add Bardic Inspiration');
  await api.command('!inspiration pool set bardic-inspiration max 1');
  await api.command('!inspiration pool set bardic-inspiration marker green');
  await api.command(`!inspiration give 1 --ids ${sera.id} --pool bardic-inspiration`);
  assert.equal(sTok.get('statusmarkers'), 'green', 'the holder shows the marker');
  await api.command(`!inspiration give 1 --ids ${sera.id} --pool bardic-inspiration`);
  assert.match(api.lastChat(), /already has the most Bardic Inspiration allowed \(1\)/);
  // The holder finds it on their own card, and spends it there
  await api.command('!inspiration', [], 'p2');
  assert.match(
    api.lastChat(),
    /Bardic Inspiration[\s\S]*Seraphina[\s\S]*--pool bardic-inspiration/
  );
  await api.command(`!inspiration spend 1 --ids ${sera.id} --pool bardic-inspiration`, [], 'p2');
  assert.equal(sTok.get('statusmarkers'), '', 'the marker goes when the die is used');
  assert.match(api.allChat(), /Seraphina spends 1 Bardic Inspiration \(1 → 0\)/);
});

test('pools can be renamed and deleted, but the default pool stays', async () => {
  const { api, sTok } = await game({ tracking: false });
  await api.command('!inspiration pool add Luck');
  await api.command('!inspiration pool add luck');
  assert.match(api.lastChat(), /There is already a pool called "luck"/);
  await api.command('!inspiration pool set luck marker red');
  await api.command('!inspiration give 1 --pool luck', [sTok]);
  assert.equal(sTok.get('statusmarkers'), 'red');
  await api.command('!inspiration pool set luck name Fortune');
  assert.equal(api.itState().pools[1].name, 'Fortune');
  assert.equal(api.itState().pools[1].id, 'luck', 'the ID, and so the attribute, stays');
  await api.command('!inspiration pool delete Fortune');
  assert.equal(api.itState().pools.length, 1);
  assert.equal(sTok.get('statusmarkers'), '', 'its marker goes with it');
  await api.command('!inspiration pool delete inspiration');
  assert.match(api.lastChat(), /cannot be deleted/);
  await api.command('!inspiration pool set inspiration name Karma');
  assert.equal(api.itState().pools[0].name, 'Karma');
});

test('boost needs a pool while the sheet box is tracked', async () => {
  const { api, nTok } = await game({ tracking: false });
  await api.command('!inspiration boost 2', [nTok]);
  assert.match(api.lastChat(), /Boost spends points from a pool/);
});

test('the pools card and status list every pool', async () => {
  const { api } = await game();
  await api.command('!inspiration pool add Luck');
  await api.command('!inspiration pools');
  const card = api.lastChat();
  assert.match(card, /Points Pools/);
  assert.match(card, /Inspiration \(default\)/);
  assert.match(card, /!inspiration pool set luck cost/);
  assert.match(card, /!inspiration pool delete luck/);
  assert.doesNotMatch(card, /!inspiration pool delete inspiration/);
  await api.command('!inspiration status');
  assert.match(api.lastChat(), /Points pool/);
  assert.match(api.lastChat(), /Inspiration, Luck/);
});

test('other Mods can read, give and spend points', async () => {
  const { api, nox, box } = await game();
  const mod = api.sandbox.InspirationTracker;
  assert.equal(mod.points(nox.id), 52);
  assert.equal(await mod.givePoints(nox.id, 3), 'given');
  assert.equal(await mod.spendPoints(nox.id, 5), 'spent');
  assert.equal(box.get('current'), '50');
  assert.equal(await mod.spendPoints(nox.id, 500), 'short');
  assert.equal(mod.points(nox.id, 'nonsense'), 0);
});
