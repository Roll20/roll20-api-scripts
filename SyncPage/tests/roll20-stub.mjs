// A small stand-in for the Roll20 API sandbox, enough to load the built
// SyncPage.js and drive it from tests. Each call to createSandbox() gives an
// isolated game with its own clock. It behaves as Roll20 was seen to behave
// in Jumpgate (see the plan's platform checks): createObj and set() raise no
// events, a Legacy path's shape reads back as _path, and graphics only take
// library images.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = fs.readFileSync(path.join(__dirname, '..', 'SyncPage.js'), 'utf8');

export const LIB_IMG = 'https://files.d20.io/images/1/abc/thumb.png?1';
export const MARKET_IMG = 'https://s3.amazonaws.com/files.d20.io/marketplace/2/xyz/max.png?2';

/**
 * Creates an isolated Roll20-like sandbox with the bundle loaded.
 *
 * @param {object} [options] Options.
 * @param {object} [options.state] Initial persistent state.
 * @param {object} [options.globalconfig] One-Click useroptions.
 * @param {object} [options.globals] Other Mods' globals (TokenMod).
 * @param {Function} [options.setup] Called with the api before the bundle loads (pages, objects).
 * @returns {object} Sandbox controls.
 */
export function createSandbox({ state = {}, globalconfig = {}, globals = {}, setup } = {}) {
  let nextId = 1;
  let clock = 1_000_000;
  let nextTimer = 1;
  const objects = new Map();
  const handlers = new Map();
  const chat = [];
  const logs = [];
  const timers = new Map();

  const fire = (event, ...args) => {
    for (const fn of handlers.get(event) || []) {
      fn(...args);
    }
  };

  class Obj {
    constructor(type, attrs) {
      this.attrs = { ...attrs, _type: type };
      if ('pageid' in this.attrs) {
        this.attrs._pageid = this.attrs.pageid;
        delete this.attrs.pageid;
      }
      if (type === 'path' && 'path' in this.attrs) {
        this.attrs._path = this.attrs.path;
        delete this.attrs.path;
      }
      if (!this.attrs._id) {
        while (objects.has(`-id${nextId}`)) {
          nextId += 1;
        }
        this.attrs._id = `-id${nextId++}`;
      }
      this.sets = 0;
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
      this.sets += 1;
      const changes = typeof key === 'object' ? key : { [key]: value };
      Object.assign(this.attrs, changes);
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

  const validImage = (url) =>
    /^\/|files\.d20\.io\/images\//.test(String(url || '')) && !/marketplace/.test(url);

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
      if (type === 'graphic' && !validImage(attrs.imgsrc)) {
        return undefined;
      }
      if (type === 'path' && !attrs.path) {
        return undefined;
      }
      const obj = new Obj(type, attrs);
      objects.set(obj.id, obj);
      return obj;
    },
    sendChat: (who, text) => chat.push({ who, text }),
    playerIsGM: (id) => objects.get(id)?.attrs.gm === true,
    Campaign: () => campaign,
    setTimeout: (fn, ms = 0) => {
      const id = nextTimer++;
      timers.set(id, { fn, due: clock + Math.max(0, Number(ms) || 0) });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    Date: FakeDate,
    Math,
    console,
    ...globals,
  };
  sandbox.globalThis = sandbox;

  const campaign = new Obj('campaign', {
    _id: 'root',
    playerpageid: 'pageA',
    playerspecificpages: false,
    turnorder: '',
  });

  const api = {
    sandbox,
    objects,
    chat,
    logs,
    campaign,
    now: () => clock,
    pendingTimers: () => timers.size,
    /** Adds an object silently (it was already there). */
    add(type, attrs) {
      const obj = new Obj(type, attrs);
      objects.set(obj.id, obj);
      return obj;
    },
    /** Adds an object as a user would: it exists, then add:<type> fires. */
    create(type, attrs) {
      const obj = api.add(type, attrs);
      fire(`add:${type}`, obj);
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
    /** Changes an object as a user would: change:<type> fires with prev. */
    edit(obj, changes) {
      const prev = obj.toJSON();
      Object.assign(obj.attrs, changes);
      fire(`change:${obj.attrs._type}`, obj, prev);
    },
    /** Raises change:<type> with the given previous values, as the client's re-save does. */
    echo(obj, prevValues) {
      fire(`change:${obj.attrs._type}`, obj, { ...obj.toJSON(), ...prevValues });
    },
    /** Deletes an object as a user would. */
    del(obj) {
      obj.remove();
    },
    on(pageId, type) {
      return [...objects.values()].filter(
        (o) => o.attrs._pageid === pageId && (!type || o.attrs._type === type)
      );
    },
    chatText() {
      return chat.map((c) => c.text).join('\n');
    },
    lastChat() {
      return chat.at(-1)?.text || '';
    },
    sp() {
      return sandbox.state.SyncPage;
    },
    api() {
      return sandbox.SyncPage;
    },
    /** Clicks the last chat button whose label matches. */
    href(label) {
      const all = [...api.chatText().matchAll(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g)];
      const found = all.filter((m) => m[2].includes(label)).at(-1);
      return found
        ? found[1].replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#039;', "'")
        : null;
    },
  };

  // A GM, two players and three pages.
  api.add('player', { _id: 'gm1', displayname: 'The GM', gm: true, _lastpage: 'pageA' });
  api.add('player', { _id: 'p1', displayname: 'Rogue', _lastpage: '' });
  api.add('player', { _id: 'p2', displayname: 'Wizard', _lastpage: '' });
  const pageAttrs = {
    width: 30,
    height: 20,
    showgrid: true,
    dynamic_lighting_enabled: true,
    daylight_mode_enabled: false,
    daylightModeOpacity: 1,
    explorer_mode: 'off',
    fog_opacity: 0.35,
    archived: false,
    _zorder: '',
  };
  api.add('page', { _id: 'pageA', name: 'Town', ...pageAttrs });
  api.add('page', { _id: 'pageB', name: 'Town (rogue)', ...pageAttrs });
  api.add('page', { _id: 'pageC', name: 'Town Hall', ...pageAttrs });
  setup?.(api);

  vm.createContext(sandbox);
  vm.runInContext(BUNDLE, sandbox);
  return api;
}

/**
 * Starts a sandbox, fires ready and clears the start-up chat.
 *
 * @param {object} [options] createSandbox options.
 * @returns {object} Sandbox controls.
 */
export function start(options = {}) {
  const api = createSandbox(options);
  api.ready();
  api.advance(3000);
  api.chat.length = 0;
  return api;
}

/**
 * Adds a token silently.
 *
 * @param {object} api Sandbox.
 * @param {string} pageId Page ID.
 * @param {object} [attrs] Attributes.
 * @returns {object} Token.
 */
export function token(api, pageId, attrs = {}) {
  return api.add('graphic', {
    _subtype: 'token',
    _pageid: pageId,
    layer: 'objects',
    left: 105,
    top: 105,
    width: 70,
    height: 70,
    name: 'Goblin',
    imgsrc: LIB_IMG,
    gmnotes: '',
    controlledby: '',
    represents: '',
    statusmarkers: '',
    has_night_vision: false,
    ...attrs,
  });
}

/**
 * Adds one of each Jumpgate type silently.
 *
 * @param {object} api Sandbox.
 * @param {string} pageId Page ID.
 * @param {object} [o] Options.
 * @returns {object} The objects.
 */
export function walls(api, pageId, { controlledby = '', color = '' } = {}) {
  return {
    wall: api.add('pathv2', {
      _pageid: pageId,
      layer: 'walls',
      shape: 'pol',
      points: '[[0,0],[0,294]]',
      x: 1050,
      y: 147,
      stroke: '#ff0000',
      barrierType: 'wall',
      controlledby,
    }),
    door: api.add('door', {
      _pageid: pageId,
      x: 1480.5,
      y: -250.25,
      isOpen: false,
      isLocked: false,
      isSecret: false,
      path: { handle0: { x: 0, y: 43.75 }, handle1: { x: 0, y: -43.75 } },
      color,
    }),
    window: api.add('window', {
      _pageid: pageId,
      x: 1480.5,
      y: -400.75,
      isOpen: false,
      isLocked: false,
      isShuttered: false,
      path: { handle0: { x: 0, y: 36.75 }, handle1: { x: 0, y: -36.75 } },
      color,
    }),
    text: api.add('text', {
      _pageid: pageId,
      layer: 'map',
      left: 500,
      top: 200,
      text: 'One-way wall',
      controlledby,
    }),
    legacy: api.add('path', {
      _pageid: pageId,
      layer: 'walls',
      left: 1491,
      top: 974.75,
      width: 0,
      height: 563.5,
      _path: '[["M",0,0],["L",0,563.5]]',
      controlledby,
    }),
  };
}
