// A small stand-in for the Roll20 API sandbox, enough to load the built
// InspirationTracker.js and drive it from tests. Each call to createSandbox()
// gives an isolated game.
//
// D&D 2024 (Beacon) characters keep their values in a `store` attribute, as
// the real sheet does. setSheetItem changes it and raises change:attribute
// with a "previous" value that already holds the new value, as Roll20 does.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = fs.readFileSync(path.join(__dirname, '..', 'InspirationTracker.js'), 'utf8');

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
 * Lets pending promises (the Mod's async handlers) finish.
 *
 * @returns {Promise<void>}
 */
export async function settle() {
  for (let i = 0; i < 20; i += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
}

/**
 * Creates an isolated Roll20-like sandbox with the bundle loaded.
 *
 * @param {object} [options] Options.
 * @param {object} [options.state] Initial persistent state.
 * @param {object} [options.globalconfig] One-Click useroptions.
 * @param {object[]} [options.markers] Campaign token markers.
 * @param {Function} [options.setup] Called with the API before the bundle loads.
 * @returns {object} Sandbox controls.
 */
export function createSandbox({ state = {}, globalconfig = {}, markers, setup } = {}) {
  let nextId = 1;
  const objects = new Map();
  const handlers = new Map();
  const chat = [];
  const logs = [];
  const fx = [];
  const failWrites = new Set();

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
    get attributes() {
      return this.attrs;
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

  const findStore = (charId) =>
    [...objects.values()].find(
      (o) =>
        o.attrs._type === 'attribute' && o.attrs._characterid === charId && o.attrs.name === 'store'
    );

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
      const fixed = { ...attrs };
      if (type === 'attribute' && fixed.characterid) {
        fixed._characterid = fixed.characterid;
        delete fixed.characterid;
      }
      const obj = new Obj(type, fixed);
      objects.set(obj.id, obj);
      return obj;
    },
    sendChat: (who, text) => chat.push({ who, text }),
    playerIsGM: (id) => objects.get(id)?.attrs.gm === true,
    Campaign: () => campaign,
    spawnFx: (left, top, type, pageid) => fx.push({ left, top, type, pageid }),
    getSheetItem: async (charId, item) => {
      const store = findStore(charId);
      if (!store) {
        return undefined;
      }
      return item === 'inspiration' ? store.attrs.current.inspiration?.isInspired : undefined;
    },
    setSheetItem: async (charId, item, value) => {
      if (failWrites.has(charId)) {
        throw new Error('sheet refused');
      }
      const store = findStore(charId);
      if (!store || item !== 'inspiration') {
        throw new Error('no such item');
      }
      const v = value === true ? 1 : Number(value) > 0 ? 1 : 0;
      store.attrs.current.inspiration = { isInspired: v };
      // Roll20 raises the event later, with prev already showing the new value.
      setImmediate(() => fire('change:attribute', store, { ...store.attrs }));
      return v;
    },
    console,
  };
  sandbox.globalThis = sandbox;

  const campaign = new Obj('campaign', {
    _id: 'root',
    _token_markers: JSON.stringify(
      markers || [
        { tag: 'sheet-blinded', name: 'Blinded', url: '' },
        { tag: 'black-flag', name: 'black-flag', url: '' },
        { tag: 'trophy', name: 'trophy', url: '' },
        { tag: 'Heroic::4242', name: 'Heroic', url: 'https://example.test/h.png' },
      ]
    ),
  });

  const api = {
    sandbox,
    objects,
    chat,
    logs,
    fx,
    failWrites,
    campaign,
    add(type, attrs) {
      const obj = new Obj(type, attrs);
      objects.set(obj.id, obj);
      return obj;
    },
    async ready() {
      fire('ready');
      await settle();
    },
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
    /** A 2024 sheet character, with its rules setting. */
    beacon(name, { inspired = 0, newRules = true, controlledby = '' } = {}) {
      const c = api.add('character', { name, controlledby });
      api.add('attribute', {
        _characterid: c.id,
        name: 'store',
        current: { inspiration: { isInspired: inspired }, settings: { newRules } },
      });
      return c;
    },
    /** A 2014 OGL sheet character. `inspired` null leaves the attribute out. */
    legacy(name, { inspired = false, controlledby = '' } = {}) {
      const c = api.add('character', { name, controlledby });
      if (inspired !== null) {
        api.add('attribute', {
          _characterid: c.id,
          name: 'inspiration',
          current: inspired ? 'on' : '0',
        });
      }
      return c;
    },
    token(character, attrs = {}) {
      return api.add('graphic', {
        _subtype: 'token',
        _pageid: 'page1',
        layer: 'objects',
        left: 105,
        top: 105,
        name: character ? character.get('name') : 'Token',
        represents: character ? character.id : '',
        statusmarkers: '',
        ...attrs,
      });
    },
    inspired(character) {
      const store = findStore(character.id);
      if (store) {
        return store.attrs.current.inspiration.isInspired === 1;
      }
      const attr = [...objects.values()].find(
        (o) =>
          o.attrs._type === 'attribute' &&
          o.attrs._characterid === character.id &&
          o.attrs.name === 'inspiration'
      );
      return attr ? attr.attrs.current === 'on' : false;
    },
    /** A character's attribute by name. */
    attribute(character, name) {
      return [...objects.values()].find(
        (o) =>
          o.attrs._type === 'attribute' &&
          o.attrs._characterid === character.id &&
          o.attrs.name === name
      );
    },
    /** A 2014 sheet resource box: the box's attribute and the one holding its name. */
    resourceBox(character, attribute, label, value) {
      api.add('attribute', {
        _characterid: character.id,
        name: `${attribute}_name`,
        current: label,
      });
      return api.add('attribute', { _characterid: character.id, name: attribute, current: value });
    },
    /** A person typing a new value into an attribute on the sheet. */
    async editAttribute(attr, current) {
      const prev = { ...attr.attrs };
      attr.attrs.current = current;
      fire('change:attribute', attr, prev);
      await settle();
    },
    /** A person ticking or clearing the box on the sheet. */
    async tickSheet(character, on) {
      const store = findStore(character.id);
      if (store) {
        store.attrs.current.inspiration = { isInspired: on ? 1 : 0 };
        fire('change:attribute', store, { ...store.attrs });
      } else {
        const attr = [...objects.values()].find(
          (o) =>
            o.attrs._type === 'attribute' &&
            o.attrs._characterid === character.id &&
            o.attrs.name === 'inspiration'
        );
        const prev = { ...attr.attrs };
        attr.attrs.current = on ? 'on' : '0';
        fire('change:attribute', attr, prev);
      }
      await settle();
    },
    /** A person changing a token's markers. */
    async editMarkers(token, statusmarkers) {
      const prev = { ...token.attrs };
      token.attrs.statusmarkers = statusmarkers;
      fire('change:graphic', token, prev);
      await settle();
    },
    async fire(event, ...args) {
      fire(event, ...args);
      await settle();
    },
    lastChat() {
      return decode(chat.at(-1)?.text || '');
    },
    allChat() {
      return decode(chat.map((c) => c.text).join('\n'));
    },
    chatSince(n) {
      return decode(
        chat
          .slice(n)
          .map((c) => c.text)
          .join('\n')
      );
    },
    itState() {
      return sandbox.state.InspirationTracker;
    },
  };

  api.add('player', { _id: 'gm1', displayname: 'The GM', gm: true });
  api.add('player', { _id: 'p1', displayname: 'Player One' });
  api.add('player', { _id: 'p2', displayname: 'Player Two' });

  setup?.(api);
  vm.createContext(sandbox);
  vm.runInContext(BUNDLE, sandbox);
  return api;
}
