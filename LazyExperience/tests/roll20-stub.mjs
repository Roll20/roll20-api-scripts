// A small stand-in for the Roll20 API sandbox, enough to load the built
// LazyExperience.js and drive it from tests. Each call to createSandbox() gives an
// isolated game. Beacon sheets are faked with getSheetItem / setSheetItem.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = fs.readFileSync(path.join(__dirname, '..', 'LazyExperience.js'), 'utf8');

/**
 * Creates an isolated Roll20-like sandbox with the bundle loaded.
 *
 * @param {object} [options] Options.
 * @param {boolean} [options.jumpgate=true] Game engine.
 * @param {string} [options.sandboxVersion='1.5'] Mod sandbox version ('' for unknown).
 * @param {string} [options.sheetName='dnd2024byroll20'] The game's default sheet.
 * @param {object} [options.state] Initial persistent state.
 * @param {object} [options.globalconfig] One-Click useroptions.
 * @param {object} [options.globals] Extra globals (other Mods).
 * @returns {object} Sandbox controls.
 */
export function createSandbox({
  jumpgate = true,
  sandboxVersion = '1.5',
  sheetName = 'dnd2024byroll20',
  state = {},
  globalconfig = {},
  globals = {},
} = {}) {
  let nextId = 1;
  const objects = new Map();
  const handlers = new Map();
  const chat = [];
  const logs = [];
  const timers = [];
  // Beacon sheet data: characterId -> { field: value }.
  const beacon = new Map();
  const beaconWrites = [];
  const beaconErrors = [];

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
      if (key === 'id') return this.attrs._id;
      if (key in this.attrs) return this.attrs[key];
      return this.attrs[`_${key}`];
    }
    set(key, value) {
      const updates = typeof key === 'object' ? key : { [key]: value };
      // Roll20 does not raise change events for API changes.
      Object.assign(this.attrs, updates);
    }
    setWithWorker(updates) {
      this.workerWrites = (this.workerWrites || 0) + 1;
      Object.assign(this.attrs, updates);
    }
    remove() {
      if (objects.delete(this.attrs._id)) {
        fire(`destroy:${this.attrs._type}`, this);
      }
    }
  }

  const matches = (obj, filter, caseInsensitive) =>
    Object.entries(filter).every(([k, v]) => {
      const actual = obj.get(k.replace(/^_/, '')) ?? obj.attrs[k];
      return caseInsensitive && typeof actual === 'string' && typeof v === 'string'
        ? actual.toLowerCase() === v.toLowerCase()
        : actual === v;
    });

  const sandbox = {
    state,
    globalconfig,
    log: (msg) => logs.push(String(msg)),
    on: (event, fn) => {
      if (!handlers.has(event)) handlers.set(event, []);
      handlers.get(event).push(fn);
    },
    getObj: (type, id) => {
      const obj = objects.get(id);
      return obj && obj.attrs._type === type ? obj : undefined;
    },
    findObjs: (filter, options = {}) =>
      [...objects.values()].filter((obj) => matches(obj, filter, options.caseInsensitive)),
    createObj: (type, attrs) => {
      const obj = new Obj(type, attrs);
      if (type === 'attribute' && attrs.characterid) obj.attrs._characterid = attrs.characterid;
      objects.set(obj.id, obj);
      return obj;
    },
    sendChat: (who, text) => chat.push({ who, text }),
    playerIsGM: (id) => objects.get(id)?.attrs.gm === true,
    Campaign: () => campaign,
    setTimeout: (fn) => timers.push(fn),
    console,
    ...globals,
  };
  if (sandboxVersion !== '1.0') {
    sandbox.getSheetItem = async (characterId, name) => {
      const data = beacon.get(characterId);
      if (!data || !(name in data)) {
        beaconErrors.push(name);
        throw new Error(
          `No attribute or sheet field found for character_id ${characterId} named ${name}`
        );
      }
      return data[name];
    };
    sandbox.setSheetItem = async (characterId, name, value) => {
      beaconWrites.push({ characterId, name, value });
      const data = beacon.get(characterId) || {};
      // The D&D 2024 sheet ignores a write of 0.
      if (Number(value) !== 0) data[name] = value;
      beacon.set(characterId, data);
      return value;
    };
  }
  sandbox.globalThis = sandbox;

  const campaign = new Obj('campaign', {
    _id: 'root',
    _release: jumpgate ? 'jumpgate' : 'legacy',
    _token_markers: JSON.stringify([{ name: 'Defeated', tag: 'Defeated::1234' }]),
  });
  campaign.sandboxVersion = sandboxVersion;
  campaign.sheetName = sheetName;

  vm.createContext(sandbox);
  vm.runInContext(BUNDLE, sandbox);

  const settle = async () => {
    for (let i = 0; i < 20; i++) {
      while (timers.length > 0) timers.shift()();
      await new Promise((r) => setImmediate(r));
    }
  };

  const api = {
    sandbox,
    objects,
    chat,
    logs,
    beacon,
    beaconWrites,
    beaconErrors,
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
    async command(content, selected = [], playerid = 'gm1') {
      fire('chat:message', {
        type: 'api',
        content,
        playerid,
        selected: selected.map((o) => ({ _id: o.id, _type: o.attrs._type })),
      });
      await settle();
    },
    async edit(obj, changes) {
      const prev = { ...obj.attrs };
      Object.assign(obj.attrs, changes);
      fire(`change:${obj.attrs._type}`, obj, prev);
      await settle();
    },
    /** Makes a D&D 2024 (Beacon) character. */
    pc2024(name, { xp = 0, level = 1, controlledby = 'p1', inParty = false } = {}) {
      const c = api.add('character', {
        name,
        controlledby,
        inParty,
        archived: false,
        _charactersheetname: 'dnd2024byroll20',
      });
      beacon.set(c.id, { experience: xp, level, npc_xp: '---', npc_challenge: '' });
      return c;
    },
    /** Makes a D&D 2024 (Beacon) creature and a token for it. */
    npc2024(name, { xp = 450, cr = '2', hp = 10 } = {}) {
      const c = api.add('character', {
        name,
        controlledby: '',
        inParty: false,
        archived: false,
        _charactersheetname: 'dnd2024byroll20',
      });
      beacon.set(c.id, { experience: 0, level: 0, npc_xp: xp, npc_challenge: cr });
      const token = api.add('graphic', {
        name,
        represents: c.id,
        _subtype: 'token',
        _pageid: 'page1',
        layer: 'objects',
        bar1_value: String(hp),
        bar1_max: String(hp),
        statusmarkers: '',
      });
      return { character: c, token };
    },
    /** Makes a legacy-attribute character (for example the 2014 sheet). */
    legacyChar(name, sheet, attrs = {}, { controlledby = 'p1' } = {}) {
      const c = api.add('character', {
        name,
        controlledby,
        inParty: false,
        archived: false,
        _charactersheetname: sheet,
      });
      // As in Roll20, a sheet input named attr_xp_max is the max of the xp attribute,
      // not an attribute of its own.
      const entries = Object.entries(attrs);
      for (const [k, v] of entries.filter(([k]) => !k.endsWith('_max'))) {
        api.add('attribute', { _characterid: c.id, name: k, current: v, max: '' });
      }
      for (const [k, v] of entries.filter(([k]) => k.endsWith('_max'))) {
        const base = k.slice(0, -4);
        const found = this.attr(c.id, base);
        if (found) found.attrs.max = v;
        else api.add('attribute', { _characterid: c.id, name: base, current: '', max: v });
      }
      return c;
    },
    attr(characterId, name) {
      return [...objects.values()].find(
        (o) =>
          o.attrs._type === 'attribute' &&
          o.attrs._characterid === characterId &&
          o.attrs.name === name
      );
    },
    lastChat() {
      return chat.at(-1)?.text || '';
    },
    chatText() {
      return chat.map((c) => c.text).join('\n');
    },
    lx() {
      return sandbox.state.LazyExperience;
    },
  };

  api.add('player', { _id: 'gm1', displayname: 'The GM', gm: true });
  api.add('player', { _id: 'p1', displayname: 'Player One' });
  api.add('player', { _id: 'p2', displayname: 'Player Two' });
  return api;
}
