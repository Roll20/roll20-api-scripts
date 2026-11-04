import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LIB_IMG, MARKET_IMG, start, token, walls } from './roll20-stub.mjs';

// Values from the sandbox come from another realm, so compare them as JSON.
const deepEq = (a, b, m) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, m);

/**
 * Starts a game with a group made from pageA and pageB added (blank, so
 * everything is copied).
 *
 * @param {object} [options] Options: objects to put on pageA first, settings.
 * @returns {object} Sandbox.
 */
function grouped({ setup, settings = {} } = {}) {
  const api = start({ setup });
  for (const [k, v] of Object.entries(settings)) {
    api.command(`!syncpage set ${k} ${v}`);
  }
  api.command('!syncpage group create Town --page pageA');
  api.command('!syncpage group add Town --page pageB');
  api.chat.length = 0;
  return api;
}

const group = (api) => Object.values(api.sp().groups)[0];
const linked = (api, obj) => api.api().getLinked(obj);
const copyOn = (api, obj, pageId, type = obj.attrs._type) =>
  api.sandbox.getObj(type, linked(api, obj)?.[pageId]);

describe('groups', () => {
  it('makes a group from a page and links every object on it', () => {
    const api = grouped({ setup: (a) => token(a, 'pageA') });
    const g = group(api);
    assert.equal(g.name, 'Town');
    assert.equal(g.source, 'pageA');
    deepEq(g.pages, ['pageA', 'pageB']);
    assert.equal(Object.keys(g.links).length, 1);
  });

  it('copies everything to a blank page, every Jumpgate type included', () => {
    let objs;
    const api = grouped({
      setup: (a) => {
        token(a, 'pageA');
        objs = walls(a, 'pageA');
      },
    });
    assert.equal(api.on('pageB').length, 6);
    for (const obj of Object.values(objs)) {
      const copy = copyOn(api, obj, 'pageB');
      assert.ok(copy, `${obj.attrs._type} copied`);
    }
    // A Legacy path is written with path and reads back as _path.
    assert.equal(copyOn(api, objs.legacy, 'pageB').get('_path'), objs.legacy.get('_path'));
    deepEq(copyOn(api, objs.door, 'pageB').get('path'), objs.door.get('path'));
  });

  it('pairs a Duplicate Page copy instead of copying, ignoring controlledby and door colour', () => {
    const api = start({
      setup: (a) => {
        token(a, 'pageA');
        walls(a, 'pageA');
        token(a, 'pageB');
        walls(a, 'pageB', { controlledby: 'gm1', color: '#2B4EF0' });
      },
    });
    api.command('!syncpage group create Town --page pageA');
    api.command('!syncpage group add Town --page pageB');
    assert.equal(api.on('pageB').length, 6, 'nothing new created');
    assert.match(api.chatText(), /6 paired, 0 copied/);
  });

  it('reports what was copied to a blank page', () => {
    const api = start({
      setup: (a) => {
        token(a, 'pageA');
        walls(a, 'pageA');
      },
    });
    api.command('!syncpage group create Town --page pageA');
    api.command('!syncpage group add Town --page pageB');
    assert.match(api.chatText(), /0 paired, 6 copied, 0 could not be copied, 0 with no match/);
  });

  it('pairs moved tokens by character and name', () => {
    const api = start({
      setup: (a) => {
        token(a, 'pageA', { represents: 'c1', name: 'Kildrak', left: 100 });
        token(a, 'pageB', { represents: 'c1', name: 'Kildrak', left: 400 });
      },
    });
    api.command('!syncpage group create Town --page pageA');
    api.command('!syncpage group add Town --page pageB');
    assert.match(api.chatText(), /1 paired/);
  });

  it('asks about leftovers, and a button copies them', () => {
    const api = start({ setup: (a) => token(a, 'pageB', { name: 'Ghost', left: 900 }) });
    api.command('!syncpage group create Town --page pageA');
    api.command('!syncpage group add Town --page pageB');
    assert.match(api.chatText(), /match nothing/);
    api.command(api.href('Copy all'));
    assert.equal(api.on('pageA', 'graphic').length, 1);
  });

  it('copies page settings to a joining page, but never the name', () => {
    const api = start({ setup: (a) => a.objects.get('pageA').set({ fog_opacity: 0.8 }) });
    api.command('!syncpage group create Town --page pageA');
    api.command('!syncpage group add Town --page pageB');
    assert.equal(api.objects.get('pageB').get('fog_opacity'), 0.8);
    assert.equal(api.objects.get('pageB').get('name'), 'Town (rogue)');
  });

  it('refuses a page that is already in a group', () => {
    const api = grouped();
    api.command('!syncpage group create Other --page pageB');
    assert.match(api.chatText(), /already in the group/);
  });

  it('removing a page keeps its objects, unlinked', () => {
    const api = grouped({ setup: (a) => token(a, 'pageA') });
    api.command('!syncpage group remove --page pageB');
    deepEq(group(api).pages, ['pageA']);
    assert.equal(api.on('pageB').length, 1);
  });
});

describe('mirroring', () => {
  it('copies a new token after the short wait', () => {
    const api = grouped();
    const t = api.create('graphic', {
      _subtype: 'token',
      _pageid: 'pageA',
      layer: 'objects',
      left: 70,
      top: 70,
      width: 70,
      height: 70,
      imgsrc: LIB_IMG,
      name: 'New',
    });
    assert.equal(api.on('pageB').length, 0);
    api.advance(300);
    assert.equal(copyOn(api, t, 'pageB').get('name'), 'New');
  });

  it('mirrors changes both ways', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    const copy = copyOn(api, t, 'pageB');
    api.edit(t, { left: 300 });
    assert.equal(copy.get('left'), 300);
    api.edit(copy, { top: 600 });
    assert.equal(t.get('top'), 600);
  });

  it('ignores the client echo of its own writes', () => {
    let d;
    const api = grouped({ setup: (a) => (d = walls(a, 'pageA').door) });
    const copy = copyOn(api, d, 'pageB');
    api.edit(d, { isOpen: true });
    assert.equal(copy.get('isOpen'), true);
    const before = d.sets;
    // Roll20 saves the door again a second later: same value, change event.
    api.echo(copy, { isOpen: false });
    assert.equal(d.sets, before, 'no write bounced back');
  });

  it('does not mirror the per-page token properties', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    api.command('!syncpage set group Town localProps +vision');
    const copy = copyOn(api, t, 'pageB');
    api.edit(copy, { has_night_vision: true, left: 140 });
    assert.equal(t.get('has_night_vision'), false);
    assert.equal(t.get('left'), 140);
  });

  it('mirrors page settings, keeping the per-page sets and the name', () => {
    const api = grouped();
    api.command('!syncpage set group Town localPageSettings +daylight');
    const a = api.objects.get('pageA');
    api.edit(a, { showgrid: false, daylightModeOpacity: 0.2, name: 'Renamed', archived: true });
    const b = api.objects.get('pageB');
    assert.equal(b.get('showgrid'), false);
    assert.equal(b.get('daylightModeOpacity'), 1);
    assert.equal(b.get('name'), 'Town (rogue)');
    assert.equal(b.get('archived'), false);
  });

  it('leaves excluded layers alone, and follows objects moved on or off them', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    api.command('!syncpage set group Town excludeLayers gmlayer');
    const copy = copyOn(api, t, 'pageB');
    api.edit(t, { layer: 'gmlayer' });
    assert.equal(api.sandbox.getObj('graphic', copy.id), undefined, 'copy removed');
    assert.equal(linked(api, t), null);
    api.edit(t, { layer: 'objects' });
    assert.ok(copyOn(api, t, 'pageB'), 'copied again');
  });

  it('with newObjects sourceOnly, objects made on a copy stay there', () => {
    const api = grouped({ settings: { newObjects: 'sourceOnly' } });
    api.create('text', { _pageid: 'pageB', layer: 'objects', left: 1, top: 1, text: 'note' });
    api.advance(300);
    assert.equal(api.on('pageA').length, 0);
  });

  it('a graphic with marketplace art is not copied, and the GM is told once', () => {
    const api = grouped();
    api.create('graphic', {
      _subtype: 'token',
      _pageid: 'pageA',
      layer: 'objects',
      imgsrc: MARKET_IMG,
      name: 'Dragon',
    });
    api.create('graphic', {
      _subtype: 'token',
      _pageid: 'pageA',
      layer: 'objects',
      imgsrc: MARKET_IMG,
      name: 'Dragon',
    });
    api.advance(300);
    assert.equal(api.on('pageB').length, 0);
    assert.equal((api.chatText().match(/cannot copy/g) || []).length, 1);
  });

  it('0.1.9 bugs: other pages are left alone and deletes elsewhere do not fail', () => {
    const api = grouped();
    const t = api.create('graphic', {
      _subtype: 'token',
      _pageid: 'pageC',
      layer: 'objects',
      imgsrc: LIB_IMG,
    });
    api.advance(300);
    assert.equal(api.on('pageA').length, 0, '"Town Hall" is not "Town"');
    api.del(t);
    assert.ok(!api.logs.some((l) => /failed/.test(l)));
  });

  it('TokenMod changes are mirrored through its observer', () => {
    let observer;
    let t;
    const api = start({
      globals: { TokenMod: { ObserveTokenChange: (fn) => (observer = fn) } },
      setup: (a) => (t = token(a, 'pageA')),
    });
    api.command('!syncpage group create Town --page pageA');
    api.command('!syncpage group add Town --page pageB');
    const prev = t.toJSON();
    t.attrs.statusmarkers = 'red';
    observer(t, prev);
    assert.equal(copyOn(api, t, 'pageB').get('statusmarkers'), 'red');
  });
});

describe('deletes and the recycle bin', () => {
  const setupTok = (holder) => (a) => (holder.t = token(a, 'pageA'));

  it('all: deleting anywhere deletes every copy, and Undo puts them back', () => {
    const h = {};
    const api = grouped({ setup: setupTok(h) });
    const copy = copyOn(api, h.t, 'pageB');
    api.del(copy);
    assert.equal(api.on('pageA').length, 0);
    api.command('!syncpage undo Town');
    assert.equal(api.on('pageA').length, 1);
    assert.equal(api.on('pageB').length, 1);
    const again = api.on('pageA')[0];
    assert.ok(copyOn(api, again, 'pageB'), 'linked again');
  });

  it('source: deletes on a copy only unlink it', () => {
    const h = {};
    const api = grouped({ setup: setupTok(h), settings: { deleteMode: 'source' } });
    api.del(copyOn(api, h.t, 'pageB'));
    assert.equal(api.on('pageA').length, 1);
    api.del(h.t);
    assert.equal(api.on('pageB').length, 0);
  });

  it('ask: offers to delete the others, keep them, or undo', () => {
    const h = {};
    const api = grouped({ setup: setupTok(h), settings: { deleteMode: 'ask' } });
    api.del(copyOn(api, h.t, 'pageB'));
    assert.equal(api.on('pageA').length, 1);
    api.command(api.href('Delete everywhere'));
    assert.equal(api.on('pageA').length, 0);
    // The button works once.
    api.command(api.href('Delete everywhere'));
    assert.match(api.lastChat(), /already used/);
    api.command(api.href('Undo'));
    assert.equal(api.on('pageA').length, 1);
    assert.equal(api.on('pageB').length, 1);
  });

  it('the recycle bin keeps no more than recycleSize entries', () => {
    const api = grouped({ settings: { recycleSize: 2, deleteMode: 'unlink' } });
    for (let i = 0; i < 4; i++) {
      const t = api.create('graphic', {
        _subtype: 'token',
        _pageid: 'pageA',
        layer: 'objects',
        imgsrc: LIB_IMG,
        name: `T${i}`,
      });
      api.advance(300);
      api.del(t);
    }
    assert.equal(group(api).recycle.length, 2);
  });

  it('buttons expire after ten minutes', () => {
    const h = {};
    const api = grouped({ setup: setupTok(h), settings: { deleteMode: 'ask' } });
    api.del(copyOn(api, h.t, 'pageB'));
    api.advance(11 * 60 * 1000);
    api.command(api.href('Delete everywhere'));
    assert.match(api.lastChat(), /expired/);
  });
});

describe('hiding per page', () => {
  it('gmlayer: hides one copy; layer changes elsewhere wait until it is shown', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    const copy = copyOn(api, t, 'pageB');
    api.command('!syncpage hide', [copy]);
    assert.equal(copy.get('layer'), 'gmlayer');
    assert.equal(t.get('layer'), 'objects', 'the source is untouched');
    api.edit(t, { layer: 'map', left: 500 });
    assert.equal(copy.get('layer'), 'gmlayer');
    assert.equal(copy.get('left'), 500);
    assert.equal(api.api().isHidden(copy), true);
    api.command('!syncpage show', [copy]);
    assert.equal(copy.get('layer'), 'map');
  });

  it('hide others hides every copy but this one', () => {
    let t;
    const api = start({ setup: (a) => (t = token(a, 'pageA')) });
    api.command('!syncpage group create Town --page pageA');
    api.command('!syncpage group add Town --page pageB');
    api.command('!syncpage group add Town --page pageC');
    api.command('!syncpage hide others', [t]);
    assert.equal(t.get('layer'), 'objects');
    assert.equal(copyOn(api, t, 'pageB').get('layer'), 'gmlayer');
    assert.equal(copyOn(api, t, 'pageC').get('layer'), 'gmlayer');
  });

  it('remove: deletes the copy, keeps it up to date, and brings it back with its turn', () => {
    let t;
    const api = grouped({
      setup: (a) => (t = token(a, 'pageA')),
      settings: { hideMode: 'remove' },
    });
    const copy = copyOn(api, t, 'pageB');
    api.campaign.attrs.turnorder = JSON.stringify([{ id: copy.id, pr: 12, custom: '' }]);
    api.command('!syncpage hide', [copy]);
    assert.equal(api.on('pageB').length, 0);
    assert.equal(api.on('pageA').length, 1, 'removing the copy did not spread');
    api.edit(t, { left: 777 });
    api.command(`!syncpage show page=pageB --ids ${t.id}`);
    const back = copyOn(api, t, 'pageB');
    assert.equal(back.get('left'), 777);
    assert.equal(JSON.parse(api.campaign.attrs.turnorder)[0].id, back.id);
  });

  it('remove falls back to the GM layer for art the API cannot recreate', () => {
    let a1;
    let b1;
    const api = start({
      setup: (a) => {
        a1 = token(a, 'pageA', { imgsrc: MARKET_IMG });
        b1 = token(a, 'pageB', { imgsrc: MARKET_IMG });
      },
    });
    api.command('!syncpage set hideMode remove');
    api.command('!syncpage group create Town --page pageA');
    api.command('!syncpage group add Town --page pageB');
    api.command('!syncpage hide', [b1]);
    assert.equal(b1.get('layer'), 'gmlayer');
    assert.match(api.chatText(), /cannot recreate/);
    assert.equal(a1.get('layer'), 'objects');
  });

  it('moving a hidden copy off the GM layer by hand shows it there only', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    const copy = copyOn(api, t, 'pageB');
    api.command('!syncpage hide', [copy]);
    api.edit(copy, { layer: 'objects' });
    assert.equal(api.api().isHidden(copy), false);
    assert.equal(t.get('layer'), 'objects');
  });
});

describe('repair, pause and resume', () => {
  it('fixes drift, recreates missing copies, and a dry run changes nothing', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    const copy = copyOn(api, t, 'pageB');
    copy.attrs.left = 999; // changed by another Mod: no event
    api.command('!syncpage repair Town --dry-run');
    assert.equal(copy.get('left'), 999);
    assert.match(api.chatText(), /Copies that drifted.*1/s);
    api.command('!syncpage repair Town');
    assert.equal(copy.get('left'), 105);
    api.objects.delete(copy.id); // gone while the sandbox was down
    api.command('!syncpage repair Town');
    assert.ok(copyOn(api, t, 'pageB'));
  });

  it('a source object deleted while not watching takes its copies with it', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    api.objects.delete(t.id);
    api.command('!syncpage repair Town');
    assert.equal(api.on('pageB').length, 0);
    assert.equal(group(api).recycle[0].reason, 'repair');
  });

  it('objects made on the source while not watching are copied', () => {
    const api = grouped();
    token(api, 'pageA', { name: 'Sneaky' });
    api.command('!syncpage repair Town');
    assert.equal(api.on('pageB')[0].get('name'), 'Sneaky');
  });

  it('pause stops mirroring; resume reports the differences', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    api.command('!syncpage pause Town');
    api.edit(t, { left: 444 });
    assert.equal(copyOn(api, t, 'pageB').get('left'), 105);
    api.command('!syncpage resume Town');
    assert.match(api.chatText(), /1 difference/);
    api.command(api.href('Repair now'));
    assert.equal(copyOn(api, t, 'pageB').get('left'), 444);
  });

  it('repairs quietly on start', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    const saved = JSON.parse(JSON.stringify(api.sp()));
    const copy = copyOn(api, t, 'pageB');
    const api2 = start({
      state: { SyncPage: saved },
      setup: (a) => {
        a.add('graphic', { ...t.toJSON() });
        a.add('graphic', { ...copy.toJSON(), left: 1 });
      },
    });
    assert.equal(api2.sandbox.getObj('graphic', copy.id).get('left'), 105);
  });
});

describe('players', () => {
  it('moves players, gathers them and restores the layout', () => {
    const api = grouped();
    api.command('!syncpage move p1 pageB --group Town');
    deepEq(api.campaign.attrs.playerspecificpages, { p1: 'pageB' });
    api.command('!syncpage move all pageA --group Town');
    assert.equal(api.campaign.attrs.playerspecificpages, false);
    api.command('!syncpage layout restore Town');
    deepEq(api.campaign.attrs.playerspecificpages, { p1: 'pageB' });
  });

  it('gathering a lone player still remembers where they were', () => {
    const api = grouped();
    api.command('!syncpage move p1 pageB --group Town');
    api.command('!syncpage move p2 pageB --group Town');
    api.command('!syncpage move all pageA --group Town');
    api.command('!syncpage layout restore Town');
    deepEq(api.campaign.attrs.playerspecificpages, { p1: 'pageB', p2: 'pageB' });
  });

  it('the players card shows a show/hide grid for selected tokens', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    api.command('!syncpage players', [t]);
    assert.match(api.chatText(), /Town \(rogue\).*shown/s);
    api.command(api.href('Town (rogue): shown'));
    assert.equal(copyOn(api, t, 'pageB').get('layer'), 'gmlayer');
    assert.match(api.lastChat(), /hidden/);
  });

  it('players cannot use the GM commands', () => {
    const api = grouped();
    api.command('!syncpage group delete Town yes', [], 'p1');
    assert.ok(group(api));
    assert.match(api.lastChat(), /Only the GM/);
  });
});

describe('settings', () => {
  it('changes choices and lists, per group and globally', () => {
    const api = grouped();
    api.command('!syncpage set deleteMode ask');
    assert.equal(api.sp().settings.deleteMode, 'ask');
    api.command('!syncpage set group Town localProps +vision +bars');
    api.command('!syncpage set group Town localProps -bars');
    deepEq(group(api).overrides.localProps, ['vision']);
    api.command('!syncpage set group Town localProps default');
    assert.equal('localProps' in group(api).overrides, false);
    api.command('!syncpage set deleteMode sometimes');
    assert.match(api.lastChat(), /not a valid value/);
    api.command('!syncpage set group Town repairOnStart off');
    assert.match(api.lastChat(), /every group/);
  });

  it('One-Click options apply once', () => {
    const api = start({
      globalconfig: { syncpage: { deleteMode: 'unlink', excludeLayers: 'gmlayer,walls' } },
    });
    assert.equal(api.sp().settings.deleteMode, 'unlink');
    deepEq(api.sp().settings.excludeLayers, ['gmlayer', 'walls']);
  });

  it('reset asks first', () => {
    const api = grouped();
    api.command('!syncpage set deleteMode ask');
    api.command('!syncpage settings reset');
    assert.equal(api.sp().settings.deleteMode, 'ask');
    api.command('!syncpage settings reset yes');
    assert.equal(api.sp().settings.deleteMode, 'all');
  });
});

describe('upgrading from 0.1.9', () => {
  it('turns _synced pages into a group, keeps links, and moves GM Notes flags into state', () => {
    let orig;
    let copy;
    let flagged;
    const api = start({
      state: {
        SYNCPAGE: {
          config: { command: 'mirror', refresh_sync: true, true_copy: true },
          synced_pages: {},
        },
      },
      setup: (a) => {
        a.add('page', { _id: 'pageS', name: 'town_synced', width: 30, height: 20 });
        orig = token(a, 'pageA', { name: 'Guard' });
        copy = token(a, 'pageS', { name: 'Guard' });
        flagged = token(a, 'pageA', {
          name: 'Spy',
          left: 300,
          gmnotes: '%3Cbr%3Ehide_othersundefined',
        });
        a.sandbox.state.SYNCPAGE.synced_pages.town = [[orig.id, copy.id]];
      },
    });
    const g = Object.values(api.sp().groups)[0];
    assert.equal(g.name, 'town');
    deepEq(g.pages, ['pageA', 'pageS']);
    deepEq(api.api().getLinked(orig), { pageA: orig.id, pageS: copy.id });
    const spyCopy = api.sandbox.getObj('graphic', api.api().getLinked(flagged).pageS);
    assert.equal(spyCopy.get('layer'), 'gmlayer');
    assert.equal(flagged.get('gmnotes'), '');
    assert.ok(api.sp().aliases.includes('!mirror'));
    assert.equal(api.sp().notices.trueCopy, true);
    api.command('!mirror status', [orig]);
    assert.match(api.lastChat(), /town/);
  });
});

describe('API and handouts', () => {
  it('publishes the SyncPage object, with 0.1.x names kept', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    const sp = api.api();
    assert.equal(sp.getGroup('pageB').name, 'Town');
    const seen = [];
    sp.onSync((e) => seen.push(e.kind));
    t.attrs.left = 222;
    sp.notify(t);
    assert.equal(copyOn(api, t, 'pageB').get('left'), 222);
    deepEq(seen, ['change']);
    assert.equal(typeof sp.CheckSyncedPages, 'function');
    assert.equal(sp.repair('Town', { dryRun: true }).drifted, 0);
  });

  it('builds the Help and Command Deck handouts', () => {
    const api = start();
    const names = api.sandbox.findObjs({ _type: 'handout' }).map((h) => h.get('name'));
    deepEq(names.sort(), ['SyncPage - Command Deck', 'SyncPage - Help']);
    const help = api.sandbox
      .findObjs({ _type: 'handout', name: 'SyncPage - Help' })[0]
      .get('notes');
    assert.match(help, /deleteMode/);
    assert.ok(
      !/\b(handout|help|buttons|messages)\.[a-zA-Z]+\b/.test(
        help.replace(/SyncPage\.[a-z]+/gi, '')
      ),
      'no missing strings'
    );
  });

  it('the menu has no missing strings', () => {
    let t;
    const api = grouped({ setup: (a) => (t = token(a, 'pageA')) });
    for (const c of [
      'menu',
      'group show Town',
      'players',
      'settings',
      'settings group Town',
      'recycle',
      'help',
      'repair --dry-run',
    ]) {
      api.command(`!syncpage ${c}`, [t]);
    }
    const missing =
      api
        .chatText()
        .match(
          /\b(titles|messages|errors|menu|group|players|buttons|settings|settingsHelp|options|repair|recycle|status|queries|values|types|age|help)\.[a-zA-Z.]+/g
        ) || [];
    deepEq(
      missing.filter(
        (m) =>
          !/^(group|settings|repair|help|players|status|recycle)\.(show|group|reset|Town)/.test(m)
      ),
      []
    );
  });
});
