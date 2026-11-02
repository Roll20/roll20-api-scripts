// A small stand-in for the Roll20 API sandbox, enough to load the built
// Concentration.js and drive it from tests. Each call to createSandbox()
// gives an isolated game with its own clock and dice.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = fs.readFileSync(path.join(__dirname, '..', 'Concentration.js'), 'utf8');

/**
 * Decodes the HTML entities the Mod's escaping produces and strips tags.
 *
 * @param {string} text HTML text.
 * @returns {string} Plain text.
 */
function plain(text) {
  return text
    .replaceAll(/<\/?(strong|span|a)\b[^>]*>/g, '')
    .replaceAll(/<[^>]*>/g, ' ')
    .replaceAll(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

/**
 * Creates an isolated Roll20-like sandbox with the bundle loaded.
 *
 * @param {object} [options] Options.
 * @param {object} [options.state] Initial persistent state.
 * @param {object} [options.globalconfig] One-Click useroptions.
 * @param {number[]} [options.dice] d20 results to hand out, in order (then 10s).
 * @param {object} [options.attributes] Sheet attributes by character ID, e.g. { c1: { constitution_save_mod: 3 } }.
 * @param {boolean} [options.sheetItems=false] Provide getSheetItem (Beacon) instead of only getAttrByName.
 * @param {Function} [options.setup] Called with the API before the bundle loads.
 * @returns {object} Sandbox controls.
 */
export function createSandbox({
  state = {},
  globalconfig = {},
  dice = [],
  attributes = {},
  sheetItems = false,
  setup,
} = {}) {
  let nextId = 1;
  let clock = 1_000_000;
  const objects = new Map();
  const handlers = new Map();
  const chat = [];
  const logs = [];
  const timers = [];
  const pending = [];
  const rolls = [...dice];

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

  const nextDie = () => (rolls.length > 0 ? rolls.shift() : 10);

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
    sendChat: (who, text, callback, options) => {
      if (typeof callback === 'function') {
        // Inline rolls: each [[1d20]] gets the next die.
        const inlinerolls = [...text.matchAll(/\[\[1d20\]\]/g)].map(() => ({
          results: { total: nextDie() },
        }));
        pending.push(() => callback([{ inlinerolls }]));
        return;
      }
      chat.push({ who, text, options });
    },
    playerIsGM: (id) => objects.get(id)?.attrs.gm === true,
    getAttrByName: (characterId, name) => attributes[characterId]?.[name] ?? '',
    randomInteger: () => nextDie(),
    Campaign: () => campaign,
    setTimeout: (fn) => timers.push(fn),
    Date: FakeDate,
    console,
  };
  if (sheetItems) {
    sandbox.getSheetItem = async (characterId, name) => attributes[characterId]?.[name] ?? null;
  }
  sandbox.globalThis = sandbox;

  const campaign = new Obj('campaign', {
    _id: 'root',
    _token_markers: JSON.stringify([{ name: 'Concentrating', tag: 'Concentrating::42', id: 42 }]),
    playerpageid: 'page1',
  });

  /**
   * Lets promises and dice callbacks finish.
   *
   * @returns {Promise<void>}
   */
  async function settle() {
    for (let i = 0; i < 20; i += 1) {
      await new Promise((resolve) => setImmediate(resolve));
      while (pending.length > 0) {
        pending.shift()();
      }
      while (timers.length > 0) {
        timers.shift()();
      }
    }
  }

  const api = {
    sandbox,
    objects,
    chat,
    logs,
    settle,
    add(type, attrs) {
      const obj = new Obj(type, attrs);
      objects.set(obj.id, obj);
      return obj;
    },
    async ready() {
      fire('ready');
      await settle();
    },
    advance(ms) {
      clock += ms;
    },
    /**
     * Sends a chat command.
     *
     * @param {string} content Message text.
     * @param {object[]} [selected] Selected objects.
     * @param {string} [playerid] Sender.
     * @returns {Promise<void>}
     */
    async command(content, selected = [], playerid = 'gm1') {
      fire('chat:message', {
        type: 'api',
        content,
        playerid,
        who: 'Someone',
        selected: selected.map((o) => ({ _id: o.id, _type: o.attrs._type })),
      });
      await settle();
    },
    /**
     * Posts a non-command chat message (e.g. a sheet roll).
     *
     * @param {object} msg Message fields.
     * @returns {Promise<void>}
     */
    async message(msg) {
      fire('chat:message', { playerid: 'gm1', who: 'Someone', ...msg });
      await settle();
    },
    /**
     * A change made by a person in the Roll20 UI, which raises a change event.
     *
     * @param {object} obj Stub object.
     * @param {object} attrs New attributes.
     * @returns {Promise<void>}
     */
    async edit(obj, attrs) {
      const prev = { ...obj.attrs };
      Object.assign(obj.attrs, attrs);
      fire(`change:${obj.attrs._type}`, obj, prev);
      await settle();
    },
    /**
     * A token dropped or pasted onto the map in Roll20, which raises add:graphic.
     *
     * @param {object} [attrs] Token attributes.
     * @returns {Promise<object>} The token.
     */
    async drop(attrs = {}) {
      const token = api.token(attrs);
      fire('add:graphic', token);
      await settle();
      return token;
    },
    character(attrs = {}) {
      return api.add('character', { name: 'Atala', controlledby: '', ...attrs });
    },
    token(attrs = {}) {
      return api.add('graphic', {
        _subtype: 'token',
        _pageid: 'page1',
        layer: 'objects',
        name: 'Atala',
        represents: '',
        bar1_value: 20,
        bar1_link: '',
        statusmarkers: '',
        controlledby: '',
        ...attrs,
      });
    },
    /** Chat entries as plain text, with their whisper target. */
    messages() {
      return chat.map((c) => {
        const whisper = c.text.match(/^\/w ("[^"]*"|\S+) /);
        return {
          to: whisper ? whisper[1].replaceAll('"', '') : '',
          text: plain(whisper ? c.text.slice(whisper[0].length) : c.text),
          raw: c.text,
        };
      });
    },
    lastText() {
      return api.messages().at(-1)?.text || '';
    },
    allText() {
      return api
        .messages()
        .map((m) => m.text)
        .join('\n');
    },
    clearChat() {
      chat.length = 0;
    },
    modState() {
      return sandbox.state.CONCENTRATION;
    },
    campaign,
  };

  // A GM and a player.
  api.add('player', { _id: 'gm1', displayname: 'The GM', gm: true, _lastpage: 'page1' });
  api.add('player', { _id: 'p1', displayname: 'Player One', _lastpage: 'page1' });

  setup?.(api);
  vm.createContext(sandbox);
  vm.runInContext(BUNDLE, sandbox);
  return api;
}
