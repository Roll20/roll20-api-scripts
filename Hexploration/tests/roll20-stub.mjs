// A small stand-in for the Roll20 API sandbox, enough to load the built
// Hexploration.js and drive it from tests. Each call to createSandbox() gives
// an isolated game.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = fs.readFileSync(path.join(__dirname, '..', 'Hexploration.js'), 'utf8');

/**
 * Creates an isolated Roll20-like sandbox with the bundle loaded.
 *
 * @param {object} [options] Options.
 * @param {boolean} [options.jumpgate=true] Game engine.
 * @param {boolean} [options.foreground=true] Whether the foreground layer is accepted.
 * @param {object} [options.state] Initial persistent state.
 * @param {object} [options.globalconfig] One-Click useroptions.
 * @returns {object} Sandbox controls.
 */
export function createSandbox({
  jumpgate = true,
  foreground = true,
  state = {},
  globalconfig = {},
} = {}) {
  let nextId = 1;
  const objects = new Map();
  const handlers = new Map();
  const chat = [];
  const logs = [];
  const pings = [];
  const timers = [];

  const fire = (event, ...args) => {
    for (const fn of handlers.get(event) || []) {
      fn(...args);
    }
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
      if (key in this.attrs) {
        return this.attrs[key];
      }
      return this.attrs[`_${key}`];
    }
    set(key, value) {
      const updates = typeof key === 'object' ? key : { [key]: value };
      const prev = { ...this.attrs };
      Object.assign(this.attrs, updates);
      // Roll20 does not raise change events for API changes.
      void prev;
    }
    remove() {
      if (objects.delete(this.attrs._id)) {
        fire(`destroy:${this.attrs._type}`, this);
      }
    }
  }

  const sandbox = {
    state,
    globalconfig,
    log: (msg) => logs.push(String(msg)),
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
    findObjs: (filter) =>
      [...objects.values()].filter((obj) =>
        Object.entries(filter).every(
          ([k, v]) => obj.get(k.replace(/^_/, '')) === v || obj.attrs[k] === v
        )
      ),
    createObj: (type, attrs) => {
      if (type === 'pathv2' && !jumpgate) {
        return undefined;
      }
      const obj = new Obj(type, attrs);
      if (attrs.layer === 'foreground' && !foreground) {
        obj.attrs.layer = 'objects';
      }
      objects.set(obj.id, obj);
      return obj;
    },
    sendChat: (who, text) => chat.push({ who, text }),
    sendPing: (...args) => pings.push(args),
    playerIsGM: (id) => objects.get(id)?.attrs.gm === true,
    Campaign: () => campaign,
    setTimeout: (fn) => timers.push(fn),
    console,
  };
  sandbox.globalThis = sandbox;

  const campaign = new Obj('campaign', {
    _id: 'root',
    _release: jumpgate ? 'jumpgate' : 'legacy',
    playerpageid: 'page1',
    playerspecificpages: false,
  });

  vm.createContext(sandbox);
  vm.runInContext(BUNDLE, sandbox);

  const api = {
    sandbox,
    objects,
    chat,
    logs,
    pings,
    add(type, attrs) {
      const obj = new Obj(type, attrs);
      objects.set(obj.id, obj);
      return obj;
    },
    flush() {
      while (timers.length > 0) {
        timers.shift()();
      }
    },
    ready() {
      fire('ready');
      api.flush();
    },
    command(content, selected = [], playerid = 'gm1') {
      fire('chat:message', {
        type: 'api',
        content,
        playerid,
        selected: selected.map((o) => ({ _id: o.id, _type: o.attrs._type })),
      });
      api.flush();
    },
    move(token, left, top, lastmove) {
      const prev = { ...token.attrs };
      token.attrs.left = left;
      token.attrs.top = top;
      token.attrs.lastmove = lastmove ?? `${prev.left},${prev.top}`;
      fire('change:graphic', token, prev);
      api.flush();
    },
    edit(obj, changes) {
      const prev = { ...obj.attrs };
      Object.assign(obj.attrs, changes);
      fire(`change:${obj.attrs._type}`, obj, prev);
      api.flush();
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
    hexState() {
      return sandbox.state.Hexploration;
    },
  };

  // A GM, a player, and a Hex (V) page.
  api.add('player', { _id: 'gm1', displayname: 'The GM', gm: true, _lastpage: 'page1' });
  api.add('player', { _id: 'p1', displayname: 'Player One' });
  api.add('page', {
    _id: 'page1',
    name: 'Hex Map',
    grid_type: 'hex',
    snapping_increment: 1,
    width: 20,
    height: 15,
  });
  return api;
}
