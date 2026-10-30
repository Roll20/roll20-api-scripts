// A small stand-in for the Roll20 API sandbox, enough to load the built
// TaskAutomation.js and drive it from tests. Each call to createSandbox()
// gives an isolated game with its own fake clock and timers. The stub
// counts live timeouts so tests can assert the single-timer invariant.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = fs.readFileSync(path.join(__dirname, '..', 'TaskAutomation.js'), 'utf8');

export const START = Date.UTC(2026, 10, 1, 12, 0, 0);
export const IMG = (n) => `https://s3.amazonaws.com/files.d20.io/images/1000${n}/abc/thumb.png?1`;

/**
 * Decodes the HTML entities the Mod's escaping produces.
 *
 * @param {string} text HTML text.
 * @returns {string} Decoded text.
 */
export function decode(text) {
  return String(text)
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
 * @param {object} [options.state] Initial persistent state (shared across restarts).
 * @param {number} [options.now] Start time.
 * @param {object} [options.globalconfig] One-Click useroptions.
 * @param {Function} [options.setup] Called with the API before the bundle loads.
 * @param {Map} [options.objects] Objects to reuse (a restart of the same game).
 * @returns {object} Sandbox controls.
 */
export function createSandbox({
  state = {},
  now = START,
  globalconfig = {},
  setup,
  objects: reuse,
} = {}) {
  let nextId = 1;
  let clock = now;
  let timerSeq = 1;
  const objects = reuse || new Map();
  const handlers = new Map();
  const chat = [];
  const logs = [];
  const timers = new Map();
  const pings = [];
  const effects = [];
  let maxLiveTimers = 0;

  const fire = (event, ...args) => {
    for (const fn of handlers.get(event) || []) {
      fn(...args);
    }
  };

  class Obj {
    constructor(type, attrs) {
      this.attrs = { ...attrs, _type: type };
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
    setWithWorker(updates) {
      Object.assign(this.attrs, updates);
      this.workerCalls = (this.workerCalls || 0) + 1;
    }
    remove() {
      if (objects.delete(this.attrs._id)) {
        fire(`destroy:${this.attrs._type}`, this);
      }
    }
  }

  class FakeDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [clock]));
    }
    static now() {
      return clock;
    }
  }

  const campaign =
    reuse?.get('root') ||
    new Obj('campaign', {
      _id: 'root',
      _release: 'jumpgate',
      playerpageid: 'page1',
      initiativepage: false,
      turnorder: '',
    });

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
    sendChat: (who, text) => {
      chat.push({ who, text });
      // Outgoing API commands reach chat:message as API-origin messages.
      if (String(text).startsWith('!')) {
        fire('chat:message', { type: 'api', content: text, playerid: 'API', who });
      }
    },
    sendPing: (left, top, pageid, playerid, moveAll, visibleTo) =>
      pings.push({ left, top, pageid, moveAll, visibleTo }),
    spawnFx: (left, top, fx, pageid) => effects.push({ left, top, fx, pageid }),
    spawnFxBetweenPoints: (a, b, fx, pageid) => effects.push({ a, b, fx, pageid }),
    spawnFxWithDefinition: (left, top, definition, pageid) =>
      effects.push({ left, top, definition, pageid }),
    playerIsGM: (id) => objects.get(id)?.attrs.gm === true,
    Campaign: () => campaign,
    setTimeout: (fn, ms) => {
      const id = timerSeq++;
      timers.set(id, { fn, at: clock + Math.max(0, Number(ms) || 0), seq: id });
      maxLiveTimers = Math.max(maxLiveTimers, timers.size);
      return id;
    },
    clearTimeout: (id) => {
      timers.delete(id);
    },
    setInterval: () => {
      throw new Error('setInterval must not be used');
    },
    Date: FakeDate,
    console,
  };
  sandbox.globalThis = sandbox;

  const api = {
    sandbox,
    objects,
    chat,
    logs,
    pings,
    effects,
    campaign,
    get now() {
      return clock;
    },
    liveTimers: () => timers.size,
    maxLiveTimers: () => maxLiveTimers,
    add(type, attrs) {
      const obj = new Obj(type, attrs);
      objects.set(obj.id, obj);
      return obj;
    },
    /** Runs every timer that is due now (and those they set for now). */
    flush() {
      for (let guard = 0; guard < 10000; guard += 1) {
        const due = [...timers.entries()]
          .filter(([, t]) => t.at <= clock)
          .sort((a, b) => a[1].at - b[1].at || a[1].seq - b[1].seq)[0];
        if (!due) {
          return;
        }
        timers.delete(due[0]);
        due[1].fn();
      }
      throw new Error('timer loop did not settle');
    },
    ready() {
      fire('ready');
      api.flush();
    },
    /**
     * Moves the clock forward, firing timers in order at their due times.
     *
     * @param {number} ms Milliseconds.
     * @returns {void}
     */
    advance(ms) {
      const end = clock + ms;
      for (let guard = 0; guard < 100000; guard += 1) {
        const next = [...timers.values()].reduce((min, t) => Math.min(min, t.at), Infinity);
        if (next > end) {
          break;
        }
        clock = Math.max(clock, next);
        api.flush();
      }
      clock = end;
      api.flush();
    },
    /** Jumps the clock without running timers (the sandbox was off). */
    jump(ms) {
      clock += ms;
    },
    command(content, selected = [], playerid = 'gm1') {
      fire('chat:message', {
        type: 'api',
        content,
        playerid,
        who: playerid === 'API' ? 'Some Mod' : 'Someone',
        selected: selected.map((o) => ({ _id: o.id, _type: o.attrs._type })),
      });
      api.flush();
    },
    say(content, playerid = 'p1', type = 'general') {
      fire('chat:message', { type, content, playerid, who: 'Player' });
      api.flush();
    },
    /** A person changes an object in the Roll20 UI (raises the change event). */
    change(obj, updates) {
      const prev = { ...obj.attrs };
      Object.assign(obj.attrs, updates);
      fire(`change:${obj.attrs._type}`, obj, prev);
      if (obj.attrs._type === 'player' && '_online' in updates) {
        fire('change:player:_online', obj, prev);
      }
      api.flush();
    },
    setTurnOrder(entries, open = true) {
      const prev = { ...campaign.attrs };
      campaign.attrs.turnorder = JSON.stringify(entries);
      fire('change:campaign:turnorder', campaign, prev);
      if (Boolean(prev.initiativepage) !== open) {
        campaign.attrs.initiativepage = open ? 'page1' : false;
        fire('change:campaign:initiativepage', campaign, { ...prev });
      }
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
        bar1_value: '10',
        bar1_max: '10',
        controlledby: '',
        represents: '',
        ...attrs,
      });
    },
    sidedToken(attrs = {}) {
      return api.token({
        sides: [IMG(1), IMG(2), IMG(3)].map(encodeURIComponent).join('|'),
        currentSide: 0,
        imgsrc: IMG(1),
        ...attrs,
      });
    },
    lastChat() {
      return decode(chat.at(-1)?.text || '');
    },
    allChat() {
      return decode(chat.map((c) => c.text).join('\n'));
    },
    /** All chat as plain text (tags removed, entities decoded). */
    allText() {
      return decode(chat.map((c) => c.text.replaceAll(/<[^>]*>/g, ' ')).join('\n')).replaceAll(
        /[ \t]+/g,
        ' '
      );
    },
    clearChat() {
      chat.length = 0;
    },
    taState() {
      return sandbox.state.TaskAutomation;
    },
    TA() {
      return sandbox.TaskAutomation;
    },
    run(id) {
      return sandbox.state.TaskAutomation.instances[id];
    },
    lastRun() {
      const runs = Object.values(sandbox.state.TaskAutomation.instances);
      return runs.sort(
        (a, b) =>
          b.createdAt - a.createdAt || Number(b.id.split('-')[1]) - Number(a.id.split('-')[1])
      )[0];
    },
    handout(name) {
      return [...objects.values()].find(
        (o) => o.attrs._type === 'handout' && o.attrs.name === name
      );
    },
    importDef(def) {
      api.command(`!taskautomation definition import --json ${JSON.stringify(def)}`);
    },
  };

  if (!reuse) {
    api.add('player', { _id: 'gm1', displayname: 'The GM', gm: true, _online: true });
    api.add('player', { _id: 'p1', displayname: 'Player One', _online: true });
    api.add('player', { _id: 'p2', displayname: 'Player Two', _online: false });
    api.add('page', { _id: 'page1', name: 'Map', width: 20, height: 15 });
    objects.set('root', campaign);
  }

  setup?.(api);
  vm.createContext(sandbox);
  vm.runInContext(BUNDLE, sandbox);
  return api;
}

/**
 * Restarts the sandbox: a new bundle instance over the same state and
 * objects, after the clock moved on while it was off.
 *
 * @param {object} api Previous sandbox.
 * @param {number} [offMs=0] How long the sandbox was off.
 * @returns {object} New sandbox (already ready).
 */
export function restart(api, offMs = 0) {
  const next = createSandbox({
    state: api.sandbox.state,
    now: api.now + offMs,
    objects: api.objects,
  });
  next.ready();
  return next;
}
