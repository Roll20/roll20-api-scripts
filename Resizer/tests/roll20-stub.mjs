// A small stand-in for the Roll20 API sandbox, enough to load the built
// Resizer.js and drive it from tests. Each call to createSandbox() gives an
// isolated game.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = fs.readFileSync(path.join(__dirname, '..', 'Resizer.js'), 'utf8');

/**
 * Creates an isolated Roll20-like sandbox with the bundle loaded.
 *
 * @param {object} [options] Options.
 * @param {object} [options.state] Initial persistent state.
 * @param {object} [options.globalconfig] One-Click useroptions.
 * @returns {object} Sandbox controls.
 */
export function createSandbox({ state = {}, globalconfig = {} } = {}) {
  let nextId = 1;
  let clock = 1_000_000;
  const objects = new Map();
  const handlers = new Map();
  const chat = [];
  const logs = [];

  const fire = (event, ...args) => {
    for (const fn of handlers.get(event) || []) {
      fn(...args);
    }
  };

  class Obj {
    constructor(type, attrs) {
      this.attrs = JSON.parse(JSON.stringify({ ...attrs, _type: type }));
      if ('pageid' in this.attrs && !('_pageid' in this.attrs)) {
        this.attrs._pageid = this.attrs.pageid;
      }
      // New IDs skip any given to objects by hand (as after a restart).
      while (!this.attrs._id || (!attrs._id && objects.has(this.attrs._id))) {
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
      if (key in this.attrs) {
        return this.attrs[key];
      }
      return this.attrs[`_${key}`];
    }
    set(key, value) {
      // Roll20 does not raise change events for API changes.
      const changes = typeof key === 'object' ? key : { [key]: value };
      Object.assign(this.attrs, JSON.parse(JSON.stringify(changes)));
    }
    toJSON() {
      return JSON.parse(JSON.stringify(this.attrs));
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
    setTimeout,
    clearTimeout,
    Date: FakeDate,
    Math,
    console,
  };
  sandbox.globalThis = sandbox;

  const campaign = new Obj('campaign', { _id: 'root', playerpageid: 'page1' });

  vm.createContext(sandbox);
  vm.runInContext(BUNDLE, sandbox);

  const api = {
    sandbox,
    objects,
    chat,
    logs,
    campaign,
    tick(ms) {
      clock += ms;
    },
    /**
     * A change made in a browser rather than by a Mod, which Roll20 does announce.
     *
     * @param {object} obj Object to change.
     * @param {object} changes New attributes.
     */
    clientSet(obj, changes) {
      const prev = obj.toJSON();
      Object.assign(obj.attrs, JSON.parse(JSON.stringify(changes)));
      fire(`change:${obj.attrs._type}`, obj, prev);
    },
    add(type, attrs) {
      const obj = new Obj(type, attrs);
      objects.set(obj.id, obj);
      return obj;
    },
    get(type, id) {
      return sandbox.getObj(type, id);
    },
    ready() {
      fire('ready');
    },
    command(content, selected = [], playerid = 'gm1') {
      fire('chat:message', {
        type: 'api',
        content,
        playerid,
        selected: selected.map((o) => ({
          _id: o.id,
          // Jumpgate reports selected drawings as 'path'.
          _type: o.attrs._type === 'pathv2' ? 'path' : o.attrs._type,
        })),
      });
    },
    ofType(type) {
      return [...objects.values()].filter((o) => o.attrs._type === type);
    },
    onPage(pageId) {
      return [...objects.values()].filter((o) => o.attrs._pageid === pageId);
    },
    lastChat() {
      return chat.at(-1)?.text || '';
    },
    allChat() {
      return chat.map((c) => c.text).join('\n');
    },
    clearChat() {
      chat.length = 0;
    },
    rState() {
      return sandbox.state.RESIZER;
    },
    /** Every object on a page as plain data, sorted, without IDs (for round-trip checks). */
    pageSnapshot(pageId) {
      const page = sandbox.getObj('page', pageId).toJSON();
      const objs = api
        .onPage(pageId)
        .map((o) => {
          const a = o.toJSON();
          delete a._id;
          return a;
        })
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      return { page, objs };
    },
  };

  // A GM, a player, and two square pages (5 ft cells).
  api.add('player', { _id: 'gm1', displayname: 'The GM', gm: true, _lastpage: 'page1' });
  api.add('player', { _id: 'p1', displayname: 'Player One' });
  api.add('page', {
    _id: 'page1',
    name: 'Town',
    width: 30,
    height: 20,
    scale_number: 5,
    scale_units: 'ft',
    snapping_increment: 1,
    grid_offset_x: 0,
    grid_offset_y: 0,
  });
  api.add('page', {
    _id: 'page2',
    name: 'Docks',
    width: '27.93',
    height: '18.63',
    scale_number: 5,
    scale_units: 'ft',
    snapping_increment: 1,
    grid_offset_x: 10,
    grid_offset_y: -5,
  });
  return api;
}

/**
 * Fills a page with one of every kind of object, as Walls Lab has.
 *
 * @param {object} game Sandbox.
 * @param {string} pageId Page ID.
 * @returns {object} The objects by name.
 */
export function furnish(game, pageId) {
  const p = { _pageid: pageId };
  return {
    map: game.add('graphic', {
      ...p,
      name: 'Map',
      layer: 'map',
      left: 1050,
      top: 700,
      width: 2100,
      height: 1400,
      rotation: 0,
    }),
    hero: game.add('graphic', {
      ...p,
      name: 'Kildrak',
      layer: 'objects',
      left: 805,
      top: 175,
      width: 70,
      height: 70,
      represents: 'c1',
    }),
    ogre: game.add('graphic', {
      ...p,
      name: 'Ogre',
      layer: 'objects',
      left: 770,
      top: 910,
      width: 140,
      height: 140,
    }),
    label: game.add('text', {
      ...p,
      text: 'Plain wall',
      left: 1225,
      top: 147,
      width: 0,
      height: 0,
      font_size: 26,
      font_family: 'Arial',
      layer: 'map',
    }),
    wall: game.add('pathv2', {
      ...p,
      layer: 'walls',
      shape: 'pol',
      x: 1050,
      y: 147,
      points: '[[0,0],[0,294]]',
      stroke_width: 5,
      barrierType: 'wall',
    }),
    room: game.add('pathv2', {
      ...p,
      layer: 'walls',
      shape: 'pol',
      x: 1694,
      y: 322,
      points: '[[0,94.5],[0,0],[427,0],[427,420],[0,420],[0,325.5]]',
      stroke_width: 5,
      barrierType: 'wall',
    }),
    sketch: game.add('pathv2', {
      ...p,
      layer: 'map',
      shape: 'free',
      x: 300,
      y: 300,
      points: '[[0,0],[10,20],[40,5]]',
      stroke_width: 4,
    }),
    legacy: game.add('path', {
      ...p,
      layer: 'walls',
      _path: '[["M",0,0],["L",0,563.5]]',
      left: 1491,
      top: 974.75,
      width: 0,
      height: 563.5,
      scaleX: 1,
      scaleY: 1,
      stroke: '#ff6600',
      stroke_width: 5,
      barrierType: 'wall',
    }),
    door: game.add('door', {
      ...p,
      x: 1480.5,
      y: -250.25,
      isOpen: true,
      path: { handle0: { x: 0, y: 43.75 }, handle1: { x: 0, y: -43.75 } },
    }),
    window: game.add('window', {
      ...p,
      x: 1480.5,
      y: -400.75,
      isOpen: false,
      path: { handle0: { x: 0, y: 36.75 }, handle1: { x: 0, y: -36.75 } },
    }),
  };
}
