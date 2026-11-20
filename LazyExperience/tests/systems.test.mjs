import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSandbox } from './roll20-stub.mjs';

/**
 * A game where every character uses one legacy sheet, picked by its attributes.
 *
 * @param {string} sheet Sheet name ('' to force attribute detection).
 * @returns {object} Game (not ready yet).
 */
function legacyGame(sheet) {
  return createSandbox({ sheetName: sheet });
}

/**
 * Ends a session after adding XP, with auto kill mode for creatures.
 *
 * @param {object} g Game.
 * @param {number} xp XP.
 * @returns {Promise<void>}
 */
async function award(g, xp) {
  await g.command(`!lazyxp add ${xp}`);
  await g.command('!lazyxp end');
}

test('sheets are recognised by name, and by their own attributes when the name is unknown', async () => {
  const g = legacyGame('');
  const shaped = g.legacyChar('S', '', { xp: '0', xp_next_level: '300', level: '1' });
  const pfc = g.legacyChar('P', '', { experience: '0', 'npc-cr': '', experience_max: '2000' });
  const sf = g.legacyChar('F', 'starfinder', { xp: '0', character_level: '1' });
  await g.ready();
  const api = g.sandbox.LazyExperience;
  assert.equal(api.getSystem(shaped.id), 'shaped5e');
  assert.equal(api.getSystem(pfc.id), 'pf1community');
  assert.equal(api.getSystem(sf.id), 'sf1');
});

test('5e Shaped: XP and the next-level field', async () => {
  const g = legacyGame('dnd5eshaped2');
  const hero = g.legacyChar('Hero', 'dnd5eshaped2', {
    xp: '200',
    level: '1',
    xp_next_level: '300',
  });
  await g.ready();
  await award(g, 150);
  assert.equal(g.attr(hero.id, 'xp').get('current'), '350');
  assert.match(g.chatText(), /enough XP for level 2/);
});

test('Pathfinder 1E: XP to xp_max and XP by CR', async () => {
  const g = legacyGame('pathfinderofficial');
  const hero = g.legacyChar('Hero', 'pathfinderofficial', {
    xp: '1900',
    level: '1',
    xp_max: '2000',
  });
  const orc = g.legacyChar(
    'Orc',
    'pathfinder',
    { npc: '1', npc_cr: '1/2', hp: '6' },
    { controlledby: '' }
  );
  const token = g.add('graphic', {
    represents: orc.id,
    bar1_value: '6',
    _subtype: 'token',
    name: 'Orc',
  });
  await g.ready();
  await g.command('!lazyxp set killMode auto');
  await g.edit(token, { bar1_value: '0' });
  assert.equal(g.lx().session.pool, 200);
  await g.command('!lazyxp end');
  assert.equal(g.attr(hero.id, 'xp').get('current'), '2100');
  assert.match(g.chatText(), /enough XP for level 2/);
});

test('Pathfinder 2E: creature XP from the level difference, level-up at 1000', async () => {
  const g = legacyGame('pathfinder2eofficial');
  const a = g.legacyChar('A', 'pathfinder2eofficial', { xp: '900', level: '3' });
  g.legacyChar('B', 'pathfinder2eofficial', { xp: '0', level: '3' }, { controlledby: 'p2' });
  const ogre = g.legacyChar(
    'Ogre',
    'pathfinder2eofficial',
    { sheet_type: 'npc', level: '5' },
    { controlledby: '' }
  );
  const token = g.add('graphic', {
    represents: ogre.id,
    bar1_value: '50',
    _subtype: 'token',
    name: 'Ogre',
  });
  await g.ready();
  // Party level is tracked once a sheet has been read.
  await g.command('!lazyxp show');
  await award(g, 0);
  await g.command('!lazyxp set killMode auto');
  g.lx().characters[a.id].level = 3;
  await g.edit(token, { bar1_value: '0' });
  // A creature two levels above the party is worth 80 XP.
  assert.equal(g.lx().session.pool, 80);
  await g.command('!lazyxp add 120');
  await g.command('!lazyxp end');
  assert.equal(g.attr(a.id, 'xp').get('current'), '1000');
  assert.match(g.chatText(), /level 4/);
  assert.match(g.chatText(), /take 1,000 off/);
});

test('Starfinder: XP and CR from character_level', async () => {
  const g = legacyGame('starfinder');
  g.legacyChar('Hero', 'starfinder', { xp: '0', character_level: '1' });
  const bot = g.legacyChar(
    'Bot',
    'starfinder',
    { sheet_type: 'npc', character_level: '1/3' },
    { controlledby: '' }
  );
  const token = g.add('graphic', {
    represents: bot.id,
    bar1_value: '5',
    _subtype: 'token',
    name: 'Bot',
  });
  await g.ready();
  await g.command('!lazyxp set killMode auto');
  await g.edit(token, { bar1_value: '0' });
  assert.equal(g.lx().session.pool, 135);
});

test('Old-School Essentials: upper-case XP and the Next field', async () => {
  const g = legacyGame('oldschoolessentialsaac');
  const hero = g.legacyChar('Hero', 'oldschoolessentialsaac', {
    XP: '1900',
    level: '1',
    Next: '2000',
  });
  await g.ready();
  await award(g, 100);
  assert.equal(g.attr(hero.id, 'XP').get('current'), '2000');
  assert.match(g.chatText(), /enough XP for level 2/);
});

test('Dungeon Crawl Classics: level 0 funnel to level 1 at 10 XP', async () => {
  const g = legacyGame('dccofficial');
  g.legacyChar('Peasant', 'dccofficial', { xp: '5', level: '0', xp_mod: '' });
  await g.ready();
  await award(g, 5);
  assert.match(g.chatText(), /enough XP for level 1/);
});

test('Dungeon World: level up at level + 7', async () => {
  const g = legacyGame('dungeonworldofficial');
  g.legacyChar('Hero', 'dungeonworldofficial', { xp: '7', level: '1' });
  await g.ready();
  await award(g, 1);
  assert.match(g.chatText(), /enough XP for level 2/);
  assert.match(g.chatText(), /Spend the XP/);
});

test('WFRP 4E: awards become XP ledger rows', async () => {
  const g = legacyGame('wfrp4official');
  const hero = g.legacyChar('Hero', 'wfrp4official', { current_xp: '100', spent_xp: '0' });
  await g.ready();
  await award(g, 50);
  const rows = g.sandbox
    .findObjs({ _type: 'attribute', _characterid: hero.id })
    .filter((a) => /^repeating_experience_[-\w]{20}_experience_amount$/.test(a.get('name')));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].get('current'), '50');
  assert.equal(g.attr(hero.id, 'current_xp').get('current'), '100', 'the sheet works this out');
});

test('Shadowrun: karma and total karma both go up', async () => {
  const g = legacyGame('shadowrun5thedition');
  const runner = g.legacyChar('Runner', 'shadowrun5thedition', { karma: '3', 'total karma': '20' });
  await g.ready();
  await award(g, 5);
  assert.equal(g.attr(runner.id, 'karma').get('current'), '8');
  assert.equal(g.attr(runner.id, 'total karma').get('current'), '25');
});

test('Savage Worlds and 13th Age refuse XP with a warning', async () => {
  const g = legacyGame('savageworldsofficial');
  const hero = g.legacyChar('Hero', 'savageworldsofficial', {
    xp: '4',
    rank: '2',
    manualAdvance: '',
  });
  await g.ready();
  await award(g, 5);
  assert.equal(g.attr(hero.id, 'xp').get('current'), '4');
  assert.match(g.chatText(), /does not use XP/);
  assert.match(g.chatText(), /No XP was awarded this session/);

  const c = legacyGame('official13thage');
  const sage = c.legacyChar('Hero', 'official13thage', { level: '2' });
  await c.ready();
  await award(c, 5);
  assert.equal(c.attr(sage.id, 'level').get('current'), '2');
  assert.match(c.chatText(), /does not use XP/);
});

test('custom level table drives notices for custom sheets', async () => {
  const g = legacyGame('homebrew');
  const hero = g.legacyChar('Hero', 'homebrew', { renown: '90', rank: '1' });
  await g.ready();
  await g.command('!lazyxp set system custom');
  await g.command('!lazyxp set customXp renown');
  await g.command('!lazyxp set customLevel rank');
  await g.command('!lazyxp set customLevels 0,100,250');
  await award(g, 20);
  assert.equal(g.attr(hero.id, 'renown').get('current'), '110');
  assert.match(g.chatText(), /enough XP for level 2/);
});

test('Pathfinder and Starfinder fall back to their XP tables when xp_max is blank', async () => {
  const g = legacyGame('pathfinderneceros');
  g.legacyChar('Hero', 'pathfinderneceros', { experience: '1950', level: '1' });
  await g.ready();
  await award(g, 100);
  assert.match(g.chatText(), /enough XP for level 2/);

  const s = legacyGame('starfinder');
  s.legacyChar('Hero', 'starfinder', { xp: '1250', character_level: '1' });
  await s.ready();
  await award(s, 100);
  assert.match(s.chatText(), /enough XP for level 2/);
});

test('the sheet name from Game Settings wins over a loose match', async () => {
  const g = legacyGame('pathfinderneceros');
  const hero = g.legacyChar('Hero', 'pathfinderneceros', { experience: '0' });
  await g.ready();
  assert.equal(g.sandbox.LazyExperience.getSystem(hero.id), 'pf1community');
  const o = legacyGame('oglbeacon');
  const other = o.legacyChar('Other', 'oglbeacon', { experience: '0' });
  await o.ready();
  assert.equal(o.sandbox.LazyExperience.getSystem(other.id), 'generic');
});
