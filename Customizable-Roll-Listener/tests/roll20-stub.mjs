// A small stand-in for the Roll20 API sandbox, enough to load the built
// CRL.js and drive it from tests. Each call to createSandbox() gives an
// isolated game.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = fs.readFileSync(path.join(__dirname, '..', 'CRL.js'), 'utf8');

/**
 * Creates an isolated Roll20-like sandbox with the bundle loaded.
 *
 * @param {object} [options] Options.
 * @param {object} [options.state] Initial persistent state.
 * @param {object} [options.globalconfig] One-Click useroptions.
 * @param {boolean} [options.echo=false] Feed messages the mod sends back into
 *        chat:message, as Roll20 does.
 * @param {(objects: Map, add: Function) => void} [options.setup] Adds objects
 *        before the bundle loads (for example a version 1 store character).
 * @returns {object} Sandbox controls.
 */
export function createSandbox({ state = {}, globalconfig = {}, echo = false, setup } = {}) {
  let nextId = 1;
  const objects = new Map();
  const handlers = new Map();
  const chat = [];
  const logs = [];
  const timers = [];
  let clock = 1_000_000;

  const fire = (event, ...args) => {
    for (const fn of handlers.get(event) || []) {
      fn(...args);
    }
  };

  class Obj {
    constructor(type, attrs) {
      this.attrs = { ...attrs, _type: type };
      for (const key of ['characterid', 'pageid']) {
        if (key in this.attrs && !(`_${key}` in this.attrs)) {
          this.attrs[`_${key}`] = this.attrs[key];
        }
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
      return key.startsWith('_') ? this.attrs[key.slice(1)] : this.attrs[`_${key}`];
    }
    set(key, value) {
      const updates = typeof key === 'object' ? key : { [key]: value };
      // Roll20 does not raise change events for API changes.
      Object.assign(this.attrs, updates);
    }
    remove() {
      // Roll20 does not raise destroy events for API removals either.
      objects.delete(this.attrs._id);
    }
  }

  const add = (type, attrs) => {
    const obj = new Obj(type, attrs);
    objects.set(obj.id, obj);
    return obj;
  };

  const characterName = (who) => {
    const match = /^character\|(.+)$/.exec(who);
    return match ? objects.get(match[1])?.attrs.name || who : who;
  };

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
        Object.entries(filter).every(([k, v]) => obj.get(k) === v)
      ),
    createObj: (type, attrs) => add(type, attrs),
    sendChat: (who, text, callback, options) => {
      chat.push({ who, text, options });
      if (echo) {
        timers.push(() =>
          fire('chat:message', {
            type: String(text).startsWith('!') ? 'api' : 'general',
            who: characterName(who),
            playerid: 'API',
            content: String(text),
          })
        );
      }
    },
    playerIsGM: (id) => objects.get(id)?.attrs.gm === true,
    setTimeout: (fn) => timers.push(fn),
    Date: class extends Date {
      static now() {
        return clock;
      }
    },
    console,
  };
  sandbox.globalThis = sandbox;

  add('player', { _id: 'gm1', displayname: 'The GM', gm: true });
  add('player', { _id: 'p1', displayname: 'Player One' });
  add('character', { _id: 'alice', name: 'Alice', controlledby: 'p1' });
  setup?.(objects, add);

  vm.createContext(sandbox);
  vm.runInContext(BUNDLE, sandbox);

  const api = {
    sandbox,
    objects,
    chat,
    logs,
    add,
    /** Runs queued timers (including echoed messages), up to a limit. */
    flush(limit = 200) {
      for (let i = 0; i < limit && timers.length > 0; i++) {
        timers.shift()();
      }
    },
    ready() {
      fire('ready');
      api.flush();
    },
    advance(ms) {
      clock += ms;
    },
    /** Sends a chat message as typed by a player. */
    say(msg) {
      fire('chat:message', { type: 'general', who: 'Player One', playerid: 'p1', ...msg });
      api.flush();
    },
    command(content, playerid = 'gm1', extra = {}) {
      fire('chat:message', { type: 'api', content, playerid, who: 'The GM (GM)', ...extra });
      api.flush();
    },
    fireEvent(event, ...args) {
      fire(event, ...args);
    },
    ofType(type) {
      return [...objects.values()].filter((o) => o.attrs._type === type);
    },
    lastChat() {
      return chat.at(-1)?.text || '';
    },
    clearChat() {
      chat.length = 0;
    },
    /** Messages sent by listeners (not menus). */
    actions() {
      return chat.filter((c) => !String(c.text).startsWith('/w '));
    },
    crlState() {
      return sandbox.state.CRL;
    },
  };
  return api;
}

/**
 * Builds an inline roll result for a single die expression.
 *
 * @param {string} expression Expression text.
 * @param {object[]} parts Roll20 roll parts.
 * @param {number} total Total.
 * @returns {object} Inline roll.
 */
export function inlineRoll(expression, parts, total) {
  return { expression, results: { type: 'V', total, rolls: parts } };
}

/**
 * Builds a Roll20 dice part.
 *
 * @param {number} sides Die size.
 * @param {(number|object)[]} values Die values, or {v, d} objects.
 * @param {object} [mods] Roll20 mods.
 * @returns {object} Dice part.
 */
export function dice(sides, values, mods = {}) {
  return {
    type: 'R',
    dice: values.length,
    sides,
    mods,
    results: values.map((v) => (typeof v === 'object' ? v : { v })),
  };
}
