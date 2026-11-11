import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { parseTriggerOptions } from '../src/commands.js';
import { readTurnChange, readTurnOrder, roundMatches } from '../src/triggers.js';
import { cleanTrigger } from '../src/state.js';
import { createSandbox } from './roll20-stub.mjs';

const order = (...entries) =>
  entries.map(([id, pr, custom = '']) => ({ id, pr, custom, _pageid: 'page1' }));

describe('reading the turn order', () => {
  const a = ['a', 20];
  const b = ['b', 15];
  const c = ['c', 10];

  test('an advance starts the next turn, and wrapping to the top starts a new round', () => {
    let r = readTurnChange(order(a, b, c), order(b, c, a));
    assert.equal(r.turn, 'b');
    assert.equal(r.newRound, false);
    r = readTurnChange(order(c, a, b), order(a, b, c));
    assert.equal(r.turn, 'a');
    assert.equal(r.newRound, true);
  });

  // With two entries, going back looks the same as advancing, so it is not tested.
  test('going back or adding a token is not a new round', () => {
    assert.equal(readTurnChange(order(b, c, a), order(a, b, c)).newRound, false);
    assert.equal(readTurnChange(order(b, c), order(a, b, c)).newRound, false);
  });

  test('a custom Round entry changing value is a new round with that number', () => {
    const r = readTurnChange(order(['-1', 1, 'Round'], a, b), order(a, b, ['-1', 2, 'Round']));
    assert.equal(r.newRound, true);
    assert.equal(r.roundValue, 2);
    assert.equal(r.turn, 'a');
  });

  test('emptying the order ends the combat', () => {
    assert.equal(readTurnChange(order(a, b), []).cleared, true);
    assert.deepEqual(readTurnOrder('not json'), []);
    assert.deepEqual(readTurnOrder(''), []);
  });

  test('round triggers: every N rounds, or one round', () => {
    const every2 = cleanTrigger({ event: 'round', action: 'fire', every: 2 });
    assert.deepEqual(
      [2, 3, 4].map((n) => roundMatches(every2, n)),
      [true, false, true]
    );
    const third = cleanTrigger({ event: 'round', action: 'fire', round: 3 });
    assert.deepEqual(
      [2, 3, 4].map((n) => roundMatches(third, n)),
      [false, true, false]
    );
  });

  test('triggers with an unknown event or action are dropped; options are read', () => {
    assert.equal(cleanTrigger({ event: 'dawn', action: 'start' }), null);
    assert.equal(cleanTrigger({ event: 'round', action: 'explode' }), null);
    assert.deepEqual(parseTriggerOptions(['every=2', 'once', 'names=A;B', 'junk']), {
      every: '2',
      once: true,
      names: 'A;B',
    });
  });
});

/**
 * A game with one chat-made effect and two combatants.
 *
 * @returns {object} Sandbox, effect token and combatant tokens.
 */
function combatGame() {
  const game = createSandbox();
  const fx = game.add('graphic', {
    name: 'Storm',
    _pageid: 'page1',
    layer: 'gmlayer',
    left: 700,
    top: 700,
    width: 70,
    height: 70,
    aura1_radius: 10,
  });
  const hero = game.add('graphic', {
    name: 'Hero',
    _pageid: 'page1',
    layer: 'objects',
    left: 100,
    top: 100,
    width: 70,
    height: 70,
    controlledby: 'p1',
  });
  const ogre = game.add('graphic', {
    name: 'Ogre',
    _pageid: 'page1',
    layer: 'objects',
    left: 1400,
    top: 1400,
    width: 70,
    height: 70,
    controlledby: '',
  });
  game.ready();
  game.command(`!pagefx preset snow --ids ${fx.id}`);
  return { game, fx, hero, ogre };
}

const effectOf = (game, token) => game.fxState().effects[token.id];
const turns = (game, ...entries) =>
  game.setCampaign('turnorder', JSON.stringify(order(...entries)));

describe('round and turn triggers', () => {
  test('a round trigger starts an effect when the turn order wraps', () => {
    const { game, fx, hero, ogre } = combatGame();
    game.command(`!pagefx off --ids ${fx.id}`);
    game.command(`!pagefx trigger add round start --ids ${fx.id}`);
    turns(game, [hero.id, 20], [ogre.id, 10]);
    turns(game, [ogre.id, 10], [hero.id, 20]);
    assert.equal(effectOf(game, fx).enabled, false, 'still round 1');
    turns(game, [hero.id, 20], [ogre.id, 10]);
    assert.equal(effectOf(game, fx).enabled, true);
    assert.equal(game.fxState().round, 2);
    game.clearSpawns();
    game.advance(2000);
    assert.ok(game.spawns.length > 0);
  });

  test('every 2 rounds fires on rounds 2 and 4', () => {
    const { game, fx, hero, ogre } = combatGame();
    game.command(`!pagefx off --ids ${fx.id}`);
    game.command(`!pagefx trigger add round burst count=3 every=2 --ids ${fx.id}`);
    turns(game, [hero.id, 20], [ogre.id, 10]);
    const bursts = [];
    for (let round = 2; round <= 4; round++) {
      game.clearSpawns();
      turns(game, [ogre.id, 10], [hero.id, 20]);
      turns(game, [hero.id, 20], [ogre.id, 10]);
      bursts.push(game.spawns.length);
    }
    assert.deepEqual(bursts, [3, 0, 3]);
  });

  test('a custom Round entry sets the round number', () => {
    const { game, fx, hero } = combatGame();
    game.command(`!pagefx off --ids ${fx.id}`);
    game.command(`!pagefx trigger add round start round=3 --ids ${fx.id}`);
    turns(game, ['-1', 1, 'Round'], [hero.id, 20]);
    turns(game, [hero.id, 20], ['-1', 2, 'Round']);
    assert.equal(effectOf(game, fx).enabled, false);
    turns(game, ['-1', 2, 'Round'], [hero.id, 20]);
    turns(game, [hero.id, 20], ['-1', 3, 'Round']);
    assert.equal(effectOf(game, fx).enabled, true);
  });

  test('a turn trigger fires when the selected token’s turn starts', () => {
    const { game, fx, hero, ogre } = combatGame();
    game.command(`!pagefx off --ids ${fx.id}`);
    game.command(`!pagefx trigger add turn burst count=4 --ids ${fx.id}`, [ogre]);
    assert.equal(effectOf(game, fx).triggers[0].token, ogre.id);
    turns(game, [hero.id, 20], [ogre.id, 10]);
    game.clearSpawns();
    turns(game, [ogre.id, 10], [hero.id, 20]);
    assert.equal(game.spawns.length, 4);
    game.clearSpawns();
    turns(game, [hero.id, 20], [ogre.id, 10]);
    assert.equal(game.spawns.length, 0);
  });

  test('a turn trigger needs a token', () => {
    const { game, fx } = combatGame();
    game.command(`!pagefx trigger add turn fire --ids ${fx.id}`);
    assert.match(game.lastChat(), /Select the token this trigger is about/);
    assert.equal(effectOf(game, fx).triggers.length, 0);
  });

  test('turn order changes made by another Mod are caught within a few seconds', () => {
    const { game, fx, hero, ogre } = combatGame();
    game.command(`!pagefx off --ids ${fx.id}`);
    game.command(`!pagefx trigger add turn start --ids ${fx.id}`, [ogre]);
    game.campaign.attrs.turnorder = JSON.stringify(order([hero.id, 20], [ogre.id, 10]));
    game.advance(3500);
    game.campaign.attrs.turnorder = JSON.stringify(order([ogre.id, 10], [hero.id, 20]));
    game.advance(3500);
    assert.equal(effectOf(game, fx).enabled, true);
  });
});

describe('area triggers', () => {
  test('a player token entering the effect area starts it; leaving stops it', () => {
    const { game, fx, hero } = combatGame();
    game.command(`!pagefx off --ids ${fx.id}`);
    game.command(`!pagefx trigger add enter start --ids ${fx.id}`);
    game.command(`!pagefx trigger add leave stop --ids ${fx.id}`);
    game.edit(hero, { left: 720, top: 700 });
    assert.equal(effectOf(game, fx).enabled, true);
    game.edit(hero, { left: 760, top: 690 });
    assert.equal(effectOf(game, fx).enabled, true, 'moving inside changes nothing');
    game.edit(hero, { left: 100, top: 100 });
    assert.equal(effectOf(game, fx).enabled, false);
  });

  test('tokens no player controls do not count unless who=all', () => {
    const { game, fx, ogre } = combatGame();
    game.command(`!pagefx off --ids ${fx.id}`);
    game.command(`!pagefx trigger add enter start --ids ${fx.id}`);
    game.edit(ogre, { left: 700, top: 700 });
    assert.equal(effectOf(game, fx).enabled, false);
    game.edit(ogre, { left: 1400, top: 1400 });
    game.command(`!pagefx trigger add enter start who=all --ids ${fx.id}`);
    game.edit(ogre, { left: 700, top: 700 });
    assert.equal(effectOf(game, fx).enabled, true);
  });

  test('named tokens count by name', () => {
    const { game, fx, ogre } = combatGame();
    game.command(`!pagefx off --ids ${fx.id}`);
    game.command(`!pagefx trigger add enter start who=named names=Goblin;ogre --ids ${fx.id}`);
    game.edit(ogre, { left: 700, top: 700 });
    assert.equal(effectOf(game, fx).enabled, true);
  });

  test('a token already inside when the trigger is added is not entering', () => {
    const { game, fx, hero } = combatGame();
    game.edit(hero, { left: 700, top: 650 });
    game.command(`!pagefx off --ids ${fx.id}`);
    game.command(`!pagefx trigger add enter start --ids ${fx.id}`);
    game.edit(hero, { left: 710, top: 660 });
    assert.equal(effectOf(game, fx).enabled, false);
  });

  test('another token’s aura can be the area, chosen by selecting it', () => {
    const { game, fx, hero } = combatGame();
    const door = game.add('graphic', {
      name: 'Door',
      _pageid: 'page1',
      layer: 'gmlayer',
      left: 300,
      top: 300,
      width: 70,
      height: 70,
      aura1_radius: 5,
    });
    game.command(`!pagefx trigger add enter burst count=2 area=selected --ids ${fx.id}`, [door]);
    game.clearSpawns();
    game.edit(hero, { left: 300, top: 320 });
    assert.equal(game.spawns.length, 2);
    game.command(`!pagefx edit --ids ${fx.id}`);
    assert.match(game.lastChat(), /player token enters the aura of Door: fire a burst of 2/);
  });

  test('once-only triggers go off the first time only', () => {
    const { game, fx, hero } = combatGame();
    game.command(`!pagefx trigger add enter burst count=3 once --ids ${fx.id}`);
    game.clearSpawns();
    game.edit(hero, { left: 700, top: 700 });
    game.edit(hero, { left: 100, top: 100 });
    game.edit(hero, { left: 700, top: 700 });
    assert.equal(game.spawns.length, 3);
    assert.equal(effectOf(game, fx).triggers[0].used, true);
  });

  test('PageFX.checkToken handles tokens moved by another Mod (no event)', () => {
    const { game, fx, hero } = combatGame();
    game.command(`!pagefx off --ids ${fx.id}`);
    game.command(`!pagefx trigger add enter start --ids ${fx.id}`);
    hero.set({ left: 700, top: 700 });
    assert.equal(effectOf(game, fx).enabled, false);
    assert.equal(game.sandbox.PageFX.checkToken(hero), 1);
    assert.equal(effectOf(game, fx).enabled, true);
  });
});

describe('trigger menu', () => {
  test('the card lists triggers in words, with buttons to add and remove them', () => {
    const { game, fx, ogre } = combatGame();
    game.command(`!pagefx trigger add round burst count=3 every=2 --ids ${fx.id}`);
    game.command(`!pagefx trigger add turn start --ids ${fx.id} --edit`, [ogre]);
    const card = game.lastChat();
    assert.match(card, /1\. Every 2 rounds: fire a burst of 3/);
    assert.match(card, /2\. When Ogre’s turn starts: start it/);
    assert.match(card, /!pagefx trigger remove 2 --ids/);
    assert.match(card, /!pagefx trigger add enter \?\{Then\|Start,start/);
    game.command(`!pagefx trigger remove 1 --ids ${fx.id}`);
    assert.equal(effectOf(game, fx).triggers.length, 1);
    game.command(`!pagefx trigger add dawn start --ids ${fx.id}`);
    assert.match(game.lastChat(), /trigger add &lt;round/);
  });
});
