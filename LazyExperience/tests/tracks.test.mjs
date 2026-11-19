import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSandbox } from './roll20-stub.mjs';

/**
 * A Pathfinder 1E game with one party character on the Roll20 sheet.
 *
 * @param {object} attrs The character's attributes (xp_max becomes the max of xp).
 * @param {string} [sheet] Sheet name.
 * @returns {{g: object, hero: object}} Game (not ready yet) and character.
 */
function pfGame(attrs, sheet = 'pathfinderofficial') {
  const g = createSandbox({ sheetName: sheet });
  const hero = g.legacyChar('Hero', sheet, attrs);
  return { g, hero };
}

/**
 * Adds XP and ends the session, returning the chat sent meanwhile.
 *
 * @param {object} g Game.
 * @param {number} xp XP.
 * @returns {Promise<string>} Chat text.
 */
async function award(g, xp) {
  const mark = g.chatText().length;
  await g.command(`!lazyxp add ${xp}`);
  await g.command('!lazyxp end');
  return g.chatText().slice(mark);
}

test('the track setting takes a track, tracks by level, or sheet', async () => {
  const { g } = pfGame({ xp: '0', level: '1' });
  await g.ready();
  const cfg = () => g.lx().config;
  assert.equal(cfg().pf1Track, 'medium');
  await g.command('!lazyxp set pf1Track Fast');
  assert.equal(cfg().pf1Track, 'fast');
  await g.command('!lazyxp set pf1Track fast 1-3, medium 4-13, slow 14+');
  assert.equal(cfg().pf1Track, 'fast 1, medium 4, slow 14');
  await g.command('!lazyxp set pf1Track slow from 10, fast');
  assert.equal(cfg().pf1Track, 'fast 1, slow 10');
  await g.command('!lazyxp set pf1Track sheet');
  assert.equal(cfg().pf1Track, 'sheet');
  for (const bad of ['quick', 'medium 4', 'fast 1, slow 1', 'fast 1, slow 25']) {
    await g.command(`!lazyxp set pf1Track ${bad}`);
    assert.equal(cfg().pf1Track, 'sheet', bad);
  }
  assert.match(g.chatText(), /is not a valid value for pf1Track/);
});

test('the medium track by default: level-up notice and the sheet’s next-level box', async () => {
  const { g, hero } = pfGame({ xp: '1900', level: '1', xp_max: '2000' });
  await g.ready();
  assert.match(await award(g, 200), /enough XP for level 2/);
  const xp = g.attr(hero.id, 'xp');
  assert.equal(xp.get('current'), '2100');
  assert.equal(xp.get('max'), '2000');
});

test('the fast track levels sooner and writes its goal to the box', async () => {
  const { g, hero } = pfGame({ xp: '1200', level: '1', xp_max: '2000' });
  await g.ready();
  await g.command('!lazyxp set pf1Track fast');
  assert.match(await award(g, 200), /enough XP for level 2/);
  assert.equal(g.attr(hero.id, 'xp').get('max'), '1300');
});

test('tracks that change by level use the track for the level the character is on', async () => {
  const { g, hero } = pfGame({ xp: '9500', level: '4' });
  const elder = g.legacyChar('Elder', 'pathfinderofficial', { xp: '600000', level: '14' });
  g.edit(hero, { inParty: true });
  g.edit(elder, { inParty: true });
  await g.ready();
  await g.command('!lazyxp set pf1Track fast 1-3, medium 4-13, slow 14+');
  // Each gains 100,000: Hero passes medium 15,000 for level 5; Elder stays short of
  // slow 955,000 (medium would have been 635,000).
  const chat = await award(g, 200000);
  assert.match(chat, /Hero<\/strong> has enough XP for level 5!/);
  assert.doesNotMatch(chat, /Elder<\/strong> has enough XP/);
  assert.equal(g.attr(hero.id, 'xp').get('max'), '15000');
  assert.equal(g.attr(elder.id, 'xp').get('max'), '955000');
});

test('sheet: the box the GM typed is read from the max of xp and left alone', async () => {
  // A GM on the slow track typed 3,000 for level 2.
  const { g, hero } = pfGame({ xp: '1900', level: '1', xp_max: '3000' });
  await g.ready();
  await g.command('!lazyxp set pf1Track sheet');
  assert.doesNotMatch(await award(g, 200), /enough XP for level/);
  assert.equal(g.attr(hero.id, 'xp').get('max'), '3000');
  assert.match(await award(g, 1000), /enough XP for level 2/);
});

test('the Community sheet keeps its box as the max of experience', async () => {
  const { g, hero } = pfGame(
    { experience: '1200', level: '1', experience_max: '' },
    'pathfinderneceros'
  );
  await g.ready();
  await g.command('!lazyxp set pf1Track fast');
  assert.match(await award(g, 200), /enough XP for level 2/);
  assert.equal(g.attr(hero.id, 'experience').get('max'), '1300');
});

test('Starfinder reads its next-level box from the max of xp', async () => {
  const g = createSandbox({ sheetName: 'starfinder' });
  g.legacyChar('Hero', 'starfinder', { xp: '1250', character_level: '1', xp_max: '1500' });
  await g.ready();
  // Its own table would say level 2 at 1,300; the box says 1,500.
  assert.doesNotMatch(await award(g, 100), /enough XP for level/);
  assert.match(await award(g, 200), /enough XP for level 2/);
});

test('show and the settings card follow the track', async () => {
  const { g, hero } = pfGame({ xp: '7000', level: '4' });
  g.edit(hero, { inParty: true });
  await g.ready();
  await g.command('!lazyxp set pf1Track fast 1-3, medium 4-13, slow 14+');
  let mark = g.chatText().length;
  await g.command('!lazyxp show');
  assert.match(g.chatText().slice(mark), /next level at 15,000/);
  mark = g.chatText().length;
  await g.command('!lazyxp settings');
  const card = g.chatText().slice(mark);
  assert.match(card, /Pathfinder 1E track/);
  assert.match(card, /Fast 1–3 · Medium 4–13 · Slow 14\+/);
  assert.match(
    card,
    /set pf1Track \?\{Tracks and the level each starts at\|fast 1, medium 4, slow 14\}/
  );
});

test('the track row is hidden when another game system is chosen', async () => {
  const { g } = pfGame({ xp: '0', level: '1' });
  await g.ready();
  await g.command('!lazyxp set system dnd2014');
  const mark = g.chatText().length;
  await g.command('!lazyxp settings');
  assert.doesNotMatch(g.chatText().slice(mark), /Pathfinder 1E track/);
});
