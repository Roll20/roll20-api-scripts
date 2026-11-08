// A small stand-in for the Roll20 API sandbox, enough to load the built
// DeathTracker.js and drive it from tests. Each call to createSandbox() gives
// an isolated game with its own clock. Spawned effects are recorded with the
// page they were drawn on.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = fs.readFileSync(path.join(__dirname, '..', 'DeathTracker.js'), 'utf8');

/**
 * Creates an isolated Roll20-like sandbox with the bundle loaded.
 *
 * @param {object} [options] Options.
 * @param {object} [options.state] Initial persistent state.
 * @param {object} [options.globalconfig] One-Click useroptions.
 * @param {number} [options.seed] Seed for Math.random, so runs repeat.
 * @param {object} [options.globals] Other Mods' globals (HealthColors, TokenMod, libTokenMarkers).
 * @param {string} [options.sandboxVersion] What Campaign().sandboxVersion reports.
 * @param {object[]} [options.tokenMarkers] The campaign's token_markers.
 * @returns {object} Sandbox controls.
 */
export function createSandbox({
  state = {},
  globalconfig = {},
  seed = 1,
  globals = {},
  sandboxVersion = '1.5',
  tokenMarkers = [],
} = {}) {
  let nextId = 1;
  let clock = 1_000_000;
  let nextTimer = 1;
  const objects = new Map();
  const handlers = new Map();
  const chat = [];
  const logs = [];
  const spawns = [];
  const timers = new Map();

  const fire = (event, ...args) => {
    for (const fn of handlers.get(event) || []) {
      fn(...args);
    }
  };

  // Small seeded generator (mulberry32) so random spawn points repeat.
  let s = seed >>> 0;
  const random = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };

  class Obj {
    constructor(type, attrs) {
      this.attrs = { ...attrs, _type: type };
      if ('pageid' in this.attrs && !('_pageid' in this.attrs)) {
        this.attrs._pageid = this.attrs.pageid;
      }
      if (!this.attrs._id) {
        this.attrs._id = `-id${nextId++}`;
      }
    }
    get id() {
      return this.attrs._id;
    }
    get(key) {
      if (key === 'id') {
        return this.attrs._id;
      }
      if (key.startsWith('status_')) {
        const marker = key.slice(7);
        return String(this.attrs.statusmarkers || '')
          .split(',')
          .some((m) => m.split('@')[0] === marker);
      }
      if (key in this.attrs) {
        return this.attrs[key];
      }
      return this.attrs[`_${key}`];
    }
    set(key, value) {
      // Roll20 does not raise change events for API changes.
      Object.assign(this.attrs, typeof key === 'object' ? key : { [key]: value });
    }
    toJSON() {
      return { ...this.attrs };
    }
    remove() {
      if (objects.delete(this.attrs._id)) {
        fire(`destroy:${this.attrs._type}`, this);
      }
    }
  }

  const matches = (obj, filter) =>
    Object.entries(filter).every(
      ([k, v]) => obj.get(k.replace(/^_/, '')) === v || obj.attrs[k] === v
    );

  class FakeDate extends Date {
    static now() {
      return clock;
    }
  }
  const FakeMath = Object.create(Math);
  FakeMath.random = random;

  const sandbox = {
    state,
    globalconfig,
    log: (msg) => logs.push(typeof msg === 'string' ? msg : JSON.stringify(msg)),
    on: (event, fn) => {
      if (!handlers.has(event)) {
        handlers.set(event, []);
      }
      handlers.get(event).push(fn);
    },
    getObj: (type, id) => {
      const obj = objects.get(id);
      return obj && obj.attrs._type === type ? obj : undefined;
    },
    findObjs: (filter) => [...objects.values()].filter((obj) => matches(obj, filter)),
    createObj: (type, attrs) => {
      const obj = new Obj(type, attrs);
      objects.set(obj.id, obj);
      return obj;
    },
    sendChat: (who, text) => chat.push({ who, text }),
    playerIsGM: (id) => objects.get(id)?.attrs.gm === true,
    Campaign: () => campaign,
    spawnFx: (x, y, type, pageId) => spawns.push({ kind: 'point', x, y, type, pageId, at: clock }),
    spawnFxBetweenPoints: (start, end, type, pageId) =>
      spawns.push({ kind: 'beam', x: start.x, y: start.y, end, type, pageId, at: clock }),
    spawnFxWithDefinition: (x, y, def, pageId) =>
      spawns.push({ kind: 'definition', x, y, def, pageId, at: clock }),
    setTimeout: (fn, ms = 0) => {
      const id = nextTimer++;
      timers.set(id, { fn, due: clock + Math.max(0, Number(ms) || 0) });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    Date: FakeDate,
    Math: FakeMath,
    console,
    ...globals,
  };
  sandbox.globalThis = sandbox;

  const campaign = new Obj('campaign', {
    _id: 'root',
    playerpageid: 'page1',
    playerspecificpages: false,
    turnorder: '',
    token_markers: JSON.stringify(tokenMarkers),
  });
  campaign.sandboxVersion = sandboxVersion;

  vm.createContext(sandbox);
  vm.runInContext(BUNDLE, sandbox);

  const api = {
    sandbox,
    objects,
    chat,
    logs,
    spawns,
    campaign,
    now: () => clock,
    pendingTimers: () => timers.size,
    add(type, attrs) {
      const obj = new Obj(type, attrs);
      objects.set(obj.id, obj);
      return obj;
    },
    /** Adds a token as a user would: it exists, then add:graphic fires. */
    addToken(attrs) {
      const obj = api.add('graphic', { layer: 'objects', width: 70, height: 70, ...attrs });
      fire('add:graphic', obj);
      return obj;
    },
    /** Moves the clock forward, running timers that fall due, in order. */
    advance(ms) {
      const end = clock + ms;
      for (;;) {
        let next = null;
        for (const [id, timer] of timers) {
          if (timer.due <= end && (!next || timer.due < next[1].due)) {
            next = [id, timer];
          }
        }
        if (!next) {
          break;
        }
        timers.delete(next[0]);
        clock = Math.max(clock, next[1].due);
        next[1].fn();
      }
      clock = end;
    },
    ready() {
      fire('ready');
    },
    command(content, selected = [], playerid = 'gm1') {
      fire('chat:message', {
        type: 'api',
        content,
        playerid,
        selected: selected.map((o) => ({ _id: o.id, _type: o.attrs._type })),
      });
    },
    edit(obj, changes) {
      const prev = { ...obj.attrs };
      Object.assign(obj.attrs, changes);
      fire(`change:${obj.attrs._type}`, obj, prev);
    },
    /** Changes a campaign property and raises its specific event, as Roll20 does. */
    setCampaign(key, value) {
      const prev = { ...campaign.attrs };
      campaign.attrs[key] = value;
      fire(`change:campaign:${key}`, campaign, prev);
      fire('change:campaign', campaign, prev);
    },
    setPlayer(player, key, value) {
      const prev = { ...player.attrs };
      player.attrs[key] = value;
      fire(`change:player:${key}`, player, prev);
    },
    deleteObj(obj) {
      obj.remove();
    },
    ofType(type) {
      return [...objects.values()].filter((o) => o.attrs._type === type);
    },
    lastChat() {
      return chat.at(-1)?.text || '';
    },
    allChat() {
      return chat.map((c) => c.text).join('\n');
    },
    dtState() {
      return sandbox.state.DeathTracker;
    },
    /** Sets a token's hit point bar as a player would (a change event fires). */
    setHp(token, value, bar = 1) {
      api.edit(token, { [`bar${bar}_value`]: value });
    },
    /** Changes an attribute and raises change:attribute, as the sheet does. */
    editAttr(attr, current) {
      const prev = { ...attr.attrs };
      attr.attrs.current = current;
      fire('change:attribute', attr, prev);
    },
    markers(token) {
      return String(token.get('statusmarkers') || '')
        .split(',')
        .filter(Boolean);
    },
    turnOrder() {
      return JSON.parse(campaign.attrs.turnorder || '[]');
    },
    spawnsOn(pageId) {
      return spawns.filter((s) => s.pageId === pageId);
    },
    clearSpawns() {
      spawns.length = 0;
    },
  };

  // A GM, a player, and two square pages (5 ft cells).
  api.add('player', {
    _id: 'gm1',
    displayname: 'The GM',
    gm: true,
    _lastpage: 'page1',
    _online: true,
  });
  api.add('player', { _id: 'p1', displayname: 'Player One', _online: true });
  api.add('page', {
    _id: 'page1',
    name: 'Town',
    width: 30,
    height: 20,
    scale_number: 5,
    snapping_increment: 1,
  });
  api.add('page', {
    _id: 'page2',
    name: 'Docks',
    width: 30,
    height: 20,
    scale_number: 5,
    snapping_increment: 1,
  });
  return api;
}
