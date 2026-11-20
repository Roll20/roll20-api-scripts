import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSandbox } from './roll20-stub.mjs';

/**
 * A ready game with two 2024 PCs played by p1 and p2.
 *
 * @param {object} [options] createSandbox options.
 * @returns {Promise<object>} Game.
 */
async function game(options) {
  const g = createSandbox(options);
  g.kildrak = g.pc2024('Kildrak', { controlledby: 'p1' });
  g.atala = g.pc2024('Atala', { controlledby: 'p2' });
  await g.ready();
  return g;
}

test('starts, installs handouts and answers !lazyxp', async () => {
  const g = await game();
  assert.match(g.logs.join('\n'), /LazyExperience v1\.1\.0/);
  const names = g.sandbox.findObjs({ _type: 'handout' }).map((h) => h.get('name'));
  assert.deepEqual(names.sort(), ['LazyExperience - Command Deck', 'LazyExperience - Help']);
  await g.command('!lazyxp');
  assert.match(g.lastChat(), /Session XP/);
  assert.equal(typeof g.sandbox.LazyExperience.addToPool, 'function');
});

test('the menu shows a half share as 0.5 of a share, not rounded', async () => {
  const g = await game();
  await g.command(`!lazyxp share 0.5 --ids ${g.atala.id}`);
  await g.command('!lazyxp add 30');
  await g.command('!lazyxp');
  const text = g.lastChat().replace(/<[^>]+>/g, ' ');
  assert.match(text, /Shares\s+1\.5\s/);
  assert.match(text, /XP per share\s+20\s/);
});

test('!xp is an alias only when no other XP Mod uses it', async () => {
  const g = await game();
  await g.command('!xp help');
  assert.match(g.lastChat(), /LazyExperience Help/);
  const other = createSandbox({ globals: { EASYEXPERIENCE: {} } });
  other.pc2024('Kildrak');
  await other.ready();
  const before = other.chat.length;
  await other.command('!xp help');
  assert.equal(other.chat.length, before, '!xp is left to EasyExperience');
  assert.match(other.chatText(), /EasyExperience/);
  await other.command('!lazyexperience help');
  assert.match(other.lastChat(), /LazyExperience Help/);
});

test('players cannot use commands', async () => {
  const g = await game();
  await g.command('!lazyxp add 100', [], 'p1');
  assert.equal(g.lx().session.pool, 0);
  assert.match(g.lastChat(), /Only the GM/);
});

test('commands from another Mod (playerid API) are accepted', async () => {
  const g = await game();
  await g.command('!lazyxp add 100', [], 'API');
  assert.equal(g.lx().session.pool, 100);
});

test('end of session splits the pool and writes 2024 sheets', async () => {
  const g = await game();
  await g.command('!lazyxp add 301 Goblin ambush');
  await g.command('!lazyxp end');
  assert.equal(g.beacon.get(g.kildrak.id).experience, 150);
  assert.equal(g.beacon.get(g.atala.id).experience, 150);
  // 1 XP left over carries to the next session.
  assert.equal(g.lx().session.carried, 1);
  assert.equal(g.lx().session.number, 2);
  assert.match(g.chatText(), /Session 1 Ended/);
  const log = g.sandbox.findObjs({ _type: 'handout', name: 'LazyExperience - Session Log' })[0];
  assert.ok(log, 'session log handout made');
  assert.match(log.get('notes'), /Goblin ambush/);
});

test('players are whispered their own totals', async () => {
  const g = await game();
  await g.command('!lazyxp add 200');
  await g.command('!lazyxp end');
  assert.ok(
    g.chat.some((c) => /^\/w "Player One"/.test(c.text) && /Kildrak gains 100 XP/.test(c.text))
  );
});

test('absent characters get the absent share, and absence ends with the session', async () => {
  const g = await game();
  await g.command(`!lazyxp absent --ids ${g.atala.id}`);
  await g.command('!lazyxp add 200');
  await g.command('!lazyxp end');
  assert.equal(g.beacon.get(g.kildrak.id).experience, 200);
  assert.equal(g.beacon.get(g.atala.id).experience, 0);
  assert.equal(g.lx().characters[g.atala.id].absent, false);

  await g.command('!lazyxp set absentShare 50%');
  await g.command(`!lazyxp absent --ids ${g.atala.id}`);
  await g.command('!lazyxp add 300');
  await g.command('!lazyxp end');
  // 300 / 1.5 shares = 200 per share; Atala gets half.
  assert.equal(g.beacon.get(g.kildrak.id).experience, 400);
  assert.equal(g.beacon.get(g.atala.id).experience, 100);
});

test('bonus XP goes on top of the share; extra shares take theirs out', async () => {
  const g = await game();
  await g.command('!lazyxp set extraShares 1');
  await g.command(`!lazyxp bonus 50 Clever plan --ids ${g.kildrak.id}`);
  await g.command('!lazyxp add 300');
  await g.command('!lazyxp end');
  assert.equal(g.beacon.get(g.kildrak.id).experience, 150);
  assert.equal(g.beacon.get(g.atala.id).experience, 100);
  assert.equal(g.lx().session.carried, 0);
});

test('nobody present: the pool carries over', async () => {
  const g = createSandbox();
  await g.ready();
  await g.command('!lazyxp add 100');
  await g.command('!lazyxp end');
  assert.equal(g.lx().session.carried, 100);
});

test('instant payout writes straight away', async () => {
  const g = await game();
  await g.command('!lazyxp set payout instant');
  await g.command('!lazyxp add 100');
  assert.equal(g.beacon.get(g.kildrak.id).experience, 50);
  assert.equal(g.lx().session.pool, 0);
  await g.command('!lazyxp undo');
  assert.match(g.lastChat(), /already been paid/);
});

test('undo takes back the last unpaid award', async () => {
  const g = await game();
  await g.command('!lazyxp add 100');
  await g.command('!lazyxp add 40');
  await g.command('!lazyxp undo');
  assert.equal(g.lx().session.pool, 100);
});

test('the Roll20 party is used when anyone is in it', async () => {
  const g = createSandbox();
  const a = g.pc2024('A', { inParty: true });
  g.pc2024('B', { inParty: false });
  const c = g.pc2024('C', { inParty: true, controlledby: '' });
  await g.ready();
  await g.command('!lazyxp add 200');
  await g.command('!lazyxp end');
  assert.equal(g.beacon.get(a.id).experience, 100);
  assert.equal(g.beacon.get(c.id).experience, 100);
});

test('"all"-controlled and multi-player characters count once', async () => {
  const g = createSandbox();
  const shared = g.pc2024('Shared', { controlledby: 'p1,p2' });
  g.pc2024('Helper', { controlledby: 'all' });
  await g.ready();
  await g.command('!lazyxp add 100');
  await g.command('!lazyxp end');
  assert.equal(g.beacon.get(shared.id).experience, 100);
});

test('party add ticks Party Member on the selected characters', async () => {
  const g = await game();
  const token = g.add('graphic', { represents: g.kildrak.id, _subtype: 'token', name: 'K' });
  await g.command('!lazyxp party add', [token]);
  assert.equal(g.kildrak.get('inParty'), true);
});

test('a creature dropping to 0 HP prompts the GM, and Add puts its XP in the pool', async () => {
  const g = await game();
  const { token } = g.npc2024('Ogre', { xp: 450 });
  await g.edit(token, { bar1_value: '0' });
  assert.match(g.lastChat(), /Ogre<\/strong> was defeated\. Add <strong>450<\/strong> XP/);
  await g.edit(token, { bar1_value: '-3' });
  await g.command(`!lazyxp kill confirm ${token.id}`);
  assert.equal(g.lx().session.pool, 450);
  // The same token only counts once.
  await g.edit(token, { bar1_value: '5' });
  await g.edit(token, { bar1_value: '0' });
  await g.command(`!lazyxp kill confirm ${token.id}`);
  assert.equal(g.lx().session.pool, 450);
});

test('automatic mode adds defeats without asking; text XP and CR fallback work', async () => {
  const g = await game();
  await g.command('!lazyxp set killMode auto');
  const lich = g.npc2024('Lich', { xp: '33000 or 41000 in lair', cr: '21' });
  const goblin = g.npc2024('Goblin', { xp: '---', cr: '1/4' });
  await g.edit(lich.token, { bar1_value: '0' });
  await g.edit(goblin.token, { bar1_value: '0' });
  assert.equal(g.lx().session.pool, 33050);
});

test('the defeated marker counts, including custom marker names', async () => {
  const g = await game();
  await g.command('!lazyxp set killMode auto');
  const a = g.npc2024('A', { xp: 100 });
  await g.edit(a.token, { statusmarkers: 'dead' });
  assert.equal(g.lx().session.pool, 100);
  await g.command('!lazyxp set marker Defeated');
  assert.equal(g.lx().config.marker, 'Defeated::1234');
  const b = g.npc2024('B', { xp: 25 });
  await g.edit(b.token, { statusmarkers: 'Defeated::1234' });
  assert.equal(g.lx().session.pool, 125);
});

test('party members and player characters are never counted as defeated', async () => {
  const g = await game();
  await g.command('!lazyxp set killMode auto');
  const token = g.add('graphic', { represents: g.kildrak.id, bar1_value: '5', _subtype: 'token' });
  await g.edit(token, { bar1_value: '0' });
  assert.equal(g.lx().session.pool, 0);
});

test('a linked HP attribute dropping to 0 counts once', async () => {
  const g = createSandbox({ sheetName: 'ogl5e' });
  g.legacyChar('Hero', 'ogl5e', { experience: 0, level: 1 });
  const orc = g.legacyChar('Orc', 'ogl5e', { npc: 1, npc_xp: 100, hp: 15 }, { controlledby: '' });
  const hp = g.attr(orc.id, 'hp');
  g.add('graphic', {
    represents: orc.id,
    bar1_link: hp.id,
    bar1_value: '15',
    _subtype: 'token',
    name: 'Orc',
  });
  await g.ready();
  await g.command('!lazyxp set killMode auto');
  await g.edit(hp, { current: '0' });
  assert.equal(g.lx().session.pool, 100);
});

test('TokenMod and DeathTracker 1.0 observers are used', async () => {
  const tmObservers = [];
  const dtObservers = [];
  const g = createSandbox({
    globals: {
      TokenMod: { ObserveTokenChange: (fn) => tmObservers.push(fn) },
      DeathTracker: { onStatusChange: (fn) => dtObservers.push(fn) },
    },
  });
  g.pc2024('Hero');
  await g.ready();
  assert.equal(tmObservers.length, 1);
  assert.equal(dtObservers.length, 1);
  await g.command('!lazyxp set killMode auto');
  const a = g.npc2024('A', { xp: 10 });
  const prev = { ...a.token.attrs };
  a.token.attrs.bar1_value = '0';
  tmObservers[0](a.token, prev);
  await g.settle();
  const b = g.npc2024('B', { xp: 20 });
  dtObservers[0]({ token: b.token, status: 'dead' });
  await g.settle();
  assert.equal(g.lx().session.pool, 30);
});

test('kill on selected tokens, with --xp for creatures without XP', async () => {
  const g = await game();
  const a = g.npc2024('Rat', { xp: '---', cr: '' });
  await g.command('!lazyxp kill', [a.token]);
  assert.equal(g.lx().session.pool, 0);
  assert.match(g.lastChat(), /no XP on the sheet/);
  await g.command('!lazyxp kill --xp 5', [a.token]);
  assert.equal(g.lx().session.pool, 5);
});

test('level-up notice when XP passes a level threshold, once', async () => {
  const g = await game();
  await g.command('!lazyxp add 600');
  await g.command('!lazyxp end');
  const notices = g.chat.filter((c) => /enough XP for level 2/.test(c.text));
  assert.equal(notices.length, 2);
  assert.match(notices[0].text, /Level Up button/);
  await g.command('!lazyxp add 20');
  await g.command('!lazyxp end');
  assert.equal(g.chat.filter((c) => /enough XP for level 2/.test(c.text)).length, 2);
});

test('there is no milestone mode: Roll20 and the sheets handle levelling', async () => {
  const g = await game();
  await g.command('!lazyxp set mode milestone');
  assert.match(g.lastChat(), /Unknown setting &quot;mode&quot;|Unknown setting "mode"/);
  await g.command('!lazyxp milestone');
  assert.match(g.lastChat(), /Unknown command &quot;milestone&quot;|Unknown command "milestone"/);
  await g.command('!lazyxp');
  assert.doesNotMatch(g.lastChat(), /Milestone|Level Up/);
});

test('2014 sheet: legacy attributes are written with the sheet workers', async () => {
  const g = createSandbox({ sheetName: 'ogl5e' });
  const hero = g.legacyChar('Hero', 'ogl5e', { experience: '250', level: 1 });
  await g.ready();
  await g.command('!lazyxp add 100');
  await g.command('!lazyxp end');
  const xp = g.attr(hero.id, 'experience');
  assert.equal(xp.get('current'), '350');
  assert.equal(xp.workerWrites, 1);
  assert.match(g.chatText(), /enough XP for level 2/);
});

test('unknown sheets use common names, and custom fields can be set', async () => {
  const g = createSandbox({ sheetName: 'somesheet' });
  const hero = g.legacyChar('Hero', 'somesheet', { xp: '10' });
  const other = g.legacyChar('Other', 'somesheet', { karma: '1' }, { controlledby: 'p2' });
  await g.ready();
  await g.command('!lazyxp add 20');
  await g.command('!lazyxp end');
  assert.equal(g.attr(hero.id, 'xp').get('current'), '20');
  // No known field: the first common name is created.
  assert.equal(g.attr(other.id, 'experience').get('current'), '10');
  await g.command('!lazyxp set system custom');
  await g.command('!lazyxp set customXp karma');
  await g.command('!lazyxp add 4');
  await g.command('!lazyxp end');
  assert.equal(g.attr(other.id, 'karma').get('current'), '3');
});

test('Beacon sheets on sandbox 1.0 warn instead of failing', async () => {
  const g = createSandbox({ sandboxVersion: '1.0' });
  g.pc2024('Hero');
  await g.ready();
  assert.match(g.chatText(), /sandbox v1\.5/);
  await g.command('!lazyxp add 100');
  await g.command('!lazyxp end');
  assert.match(g.chatText(), /needs Mod sandbox v1\.5/);
});

test('the 2024 sheet cannot be set to 0, so taking all XP away warns', async () => {
  const g = await game();
  g.beacon.get(g.kildrak.id).experience = 30;
  await g.command(`!lazyxp give -50 --ids ${g.kildrak.id}`);
  assert.match(g.chatText(), /cannot be set to 0 XP/);
});

test('Beacon profiles only ask for fields the sheet has', async () => {
  const g = await game();
  g.npc2024('Ogre');
  await g.command('!lazyxp add 100');
  await g.command('!lazyxp end');
  await g.command('!lazyxp show');
  assert.deepEqual(g.beaconErrors, []);
});

test('show lists sheet XP, level and the next threshold', async () => {
  const g = await game();
  g.beacon.get(g.kildrak.id).experience = 350;
  g.beacon.get(g.kildrak.id).level = 2;
  await g.command('!lazyxp show');
  assert.match(g.lastChat(), /Kildrak.*350 XP • Level 2 • next level at 900/s);
});

test('0.1.14 state is migrated', async () => {
  const g = createSandbox({
    state: {
      LAZYEXPERIENCE: {
        config: {
          command: 'exp',
          marker: 'skull',
          experience_attribute_name: 'experience',
          npc_experience_attribute_name: 'npc_xp',
          directxp: false,
          updatesheet: true,
        },
        players: {
          p1: { active: true, characters: [{ id: 'c1', active: true, experience: 25 }] },
          p2: { active: false, characters: [{ id: 'c2', active: true, experience: 0 }] },
        },
        extra_players: '2',
        session_experience: 120,
      },
    },
  });
  await g.ready();
  const s = g.lx();
  assert.equal(s.session.pool, 120);
  assert.equal(s.session.bonuses.c1, 25);
  assert.equal(s.characters.c2.excluded, true);
  assert.equal(s.config.marker, 'skull');
  assert.equal(s.config.extraShares, 2);
  assert.equal(s.config.updateSheets, true);
  assert.deepEqual([...s.aliases], ['!exp']);
  assert.ok(g.sandbox.state.LAZYEXPERIENCE, 'old state kept for rollback');
  await g.command('!exp help');
  assert.match(g.lastChat(), /LazyExperience Help/);
  assert.match(g.chatText(), /brought across/);
});

test('settings are validated', async () => {
  const g = await game();
  await g.command('!lazyxp set hpBar 4');
  assert.match(g.lastChat(), /not a valid value/);
  await g.command('!lazyxp set hpBar 2');
  assert.equal(g.lx().config.hpBar, 2);
  await g.command('!lazyxp set marker nonsense');
  assert.equal(g.lx().config.marker, 'dead');
  await g.command('!lazyxp set customLevels 0,300,100');
  assert.match(g.lastChat(), /not a valid value/);
  await g.command('!lazyxp set language fr');
  assert.equal(g.lx().config.language, 'fr');
});

test('One-Click options apply when newer than the last ones applied', async () => {
  const g = createSandbox({
    globalconfig: {
      lazyexperience: { lastsaved: 5, payout: 'instant', killBar: false, hpBar: '3' },
    },
  });
  await g.ready();
  assert.equal(g.lx().config.payout, 'instant');
  assert.equal(g.lx().config.killBar, false);
  assert.equal(g.lx().config.hpBar, 3);
});

test('sheet text is escaped before it reaches chat', async () => {
  const g = await game();
  g.kildrak.attrs.name = 'Bob [[1d6]] @{x}';
  await g.command('!lazyxp add 2');
  await g.command('!lazyxp end');
  assert.doesNotMatch(g.chatText(), /\[\[1d6\]\]/);
});

test('every menu and card renders', async () => {
  const g = await game();
  for (const cmd of ['', 'roster', 'settings', 'status', 'lang', 'help', 'log', 'show']) {
    await g.command(`!lazyxp ${cmd}`.trim());
    assert.doesNotMatch(g.lastChat(), /undefined|[^?]\{\w+\}/, cmd);
  }
  await g.command('!lazyxp set system custom');
  await g.command('!lazyxp settings');
  assert.match(g.lastChat(), /Custom XP field/);
});

test('the handouts get the LazyExperience journal icon, also handouts made before', async () => {
  const icon = 'https://files.d20.io/images/506991614/emQ4__XezYV7Y1Zl9wDy8g/thumb.webp';
  const api = createSandbox();
  api.sandbox.createObj('handout', { name: 'LazyExperience - Help', avatar: '' });
  await api.ready();
  const handouts = api.sandbox
    .findObjs({ _type: 'handout' })
    .filter((h) => h.get('name').startsWith('LazyExperience - '));
  assert.ok(handouts.length >= 2);
  for (const handout of handouts) {
    assert.equal(handout.get('avatar'), icon, handout.get('name'));
  }
});
