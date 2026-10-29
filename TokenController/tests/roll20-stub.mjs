// A small stand-in for the Roll20 API sandbox, enough to load the built
// TokenController.js and drive it from tests. Each call to createSandbox()
// gives an isolated game with its own clock.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = fs.readFileSync(path.join(__dirname, '..', 'TokenController.js'), 'utf8');

/**
 * Decodes the HTML entities the Mod's escaping produces.
 *
 * @param {string} text HTML text.
 * @returns {string} Decoded text.
 */
function decode(text) {
  return text
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

/**
 * Creates an isolated Roll20-like sandbox with the bundle loaded.
 *
 * @param {object} [options] Options.
 * @param {boolean} [options.jumpgate=true] Game engine.
 * @param {object} [options.state] Initial persistent state.
 * @param {object} [options.globalconfig] One-Click useroptions.
 * @param {object} [options.page] Attributes for the default page.
 * @param {Function} [options.setup] Called with the API before the bundle loads.
 * @returns {object} Sandbox controls.
 */
export function createSandbox({
  jumpgate = true,
  state = {},
  globalconfig = {},
  page = {},
  setup,
} = {}) {
  let nextId = 1;
  let clock = 1_000_000;
  const objects = new Map();
  const handlers = new Map();
  const chat = [];
  const logs = [];
  const timers = [];
  const intervals = [];

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
      // Roll20 does not raise change events for API changes.
      Object.assign(this.attrs, updates);
    }
    remove() {
      if (objects.delete(this.attrs._id)) {
        fire(`destroy:${this.attrs._type}`, this);
      }
    }
  }

  class FakeDate extends Date {
    static now() {
      return clock;
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
      const obj = new Obj(type, attrs);
      objects.set(obj.id, obj);
      return obj;
    },
    sendChat: (who, text) => chat.push({ who, text }),
    playerIsGM: (id) => objects.get(id)?.attrs.gm === true,
    Campaign: () => campaign,
    setTimeout: (fn) => timers.push(fn),
    setInterval: (fn, ms) => {
      intervals.push({ fn, ms });
      return intervals.length;
    },
    clearInterval: (id) => {
      if (intervals[id - 1]) {
        intervals[id - 1].fn = () => {};
      }
    },
    Date: FakeDate,
    console,
  };
  sandbox.globalThis = sandbox;

  const campaign = new Obj('campaign', {
    _id: 'root',
    _release: jumpgate ? 'jumpgate' : 'legacy',
    playerpageid: 'page1',
    playerspecificpages: false,
    initiativepage: false,
    turnorder: '',
  });

  const api = {
    sandbox,
    objects,
    chat,
    logs,
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
    /**
     * Moves the clock forward, running the scheduler as Roll20 would.
     *
     * @param {number} ms Milliseconds.
     * @returns {void}
     */
    advance(ms) {
      const end = clock + ms;
      while (clock < end) {
        clock += 250;
        for (const { fn } of [...intervals]) {
          fn();
        }
        api.flush();
      }
    },
    command(content, selected = [], playerid = 'gm1') {
      fire('chat:message', {
        type: 'api',
        content,
        playerid,
        who: 'The GM',
        // Objects, or raw { _id, _type } entries to mimic what Roll20 sends.
        selected: selected.map((o) => (o.attrs ? { _id: o.id, _type: o.attrs._type } : o)),
      });
      api.flush();
    },
    drag(token, left, top, lastmove) {
      const prev = { ...token.attrs };
      token.attrs.left = left;
      token.attrs.top = top;
      token.attrs.lastmove = lastmove ?? `${prev.left},${prev.top}`;
      fire('change:graphic', token, prev);
      api.flush();
    },
    setTurnOrder(entries, open = true) {
      const prev = { ...campaign.attrs };
      campaign.attrs.turnorder = JSON.stringify(entries);
      campaign.attrs.initiativepage = open ? 'page1' : false;
      fire('change:campaign:turnorder', campaign, prev);
      api.flush();
    },
    token(attrs = {}) {
      return api.add('graphic', {
        _subtype: 'token',
        _pageid: 'page1',
        layer: 'objects',
        left: 105,
        top: 105,
        width: 70,
        height: 70,
        rotation: 0,
        name: 'Guard',
        statusmarkers: '',
        ...attrs,
      });
    },
    // Chat text with HTML entities decoded, so tests can match plain words.
    lastChat() {
      return decode(chat.at(-1)?.text || '');
    },
    allChat() {
      return decode(chat.map((c) => c.text).join('\n'));
    },
    tcState() {
      return sandbox.state.TokenController;
    },
    campaign,
  };

  // A GM, a player, and a square page 20 × 15 units.
  api.add('player', { _id: 'gm1', displayname: 'The GM', gm: true, _lastpage: 'page1' });
  api.add('player', { _id: 'p1', displayname: 'Player One' });
  api.add('page', {
    _id: 'page1',
    name: 'Map',
    grid_type: 'square',
    snapping_increment: 1,
    showgrid: true,
    width: 20,
    height: 15,
    ...page,
  });

  setup?.(api);
  vm.createContext(sandbox);
  vm.runInContext(BUNDLE, sandbox);
  return api;
}
