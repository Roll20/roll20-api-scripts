// Built-in actions (plan §4.4). Each action validates live values, checks
// authority for every object it touches, records what it intends before
// writing, and reports a result. Flow steps live in executor.js.

import {
  ERROR_CODES,
  FX_COLORS,
  FX_TYPES,
  LAYERS,
  SCRIPT_NAME,
  TOKEN_GM_PROPERTIES,
  TOKEN_WRITE_PROPERTIES,
} from './constants.js';
import { taskError } from './errors.js';
import { MISSING } from './expressions.js';
import {
  chat,
  createObject,
  findObjects,
  getObject,
  gmPlayerIds,
  isGm,
  now,
  ping,
  playerName,
  spawnEffect,
} from './host.js';
import { getAdapter } from './integrations.js';
import {
  characterOf,
  currentSideIndex,
  findAttribute,
  readProperty,
  resolveRecipients,
  snapshot,
  tokenSides,
  writableImage,
} from './objects.js';
import { getLimits } from './state.js';
import {
  clamp,
  escapeHtml,
  formatMarkers,
  neutraliseChatText,
  parseMarkers,
  parseStrictNumber,
  toText,
} from './utils.js';

const rateWindows = new Map();

/**
 * Applies a rolling per-minute limit.
 *
 * @param {string} key Limit key.
 * @param {number} max Maximum per minute.
 * @returns {void}
 * @throws {Error} resourceLimit when exceeded.
 */
function rateLimit(key, max) {
  const at = now();
  const window = rateWindows.get(key) || { start: at, count: 0 };
  if (at - window.start > 60000) {
    window.start = at;
    window.count = 0;
  }
  window.count += 1;
  rateWindows.set(key, window);
  if (window.count > max) {
    throw taskError(ERROR_CODES.RESOURCE_LIMIT, 'rateLimited', { what: key.split(':')[0], max });
  }
}

/**
 * Returns true when a run acts with GM authority.
 *
 * @param {object} inst Instance.
 * @returns {boolean} True for GM-service runs and runs a GM started.
 */
function hasGmAuthority(inst) {
  return inst.authority === 'gmService' || isGm(inst.initiatorPlayerId);
}

/**
 * Evaluates an expression and rejects missing values.
 *
 * @param {object} ctx Action context.
 * @param {*} expr Expression.
 * @param {string} field Field name for the error.
 * @returns {*} Value.
 */
function required(ctx, expr, field) {
  const value = ctx.evaluate(expr);
  if (value === MISSING || value === undefined) {
    throw taskError(ERROR_CODES.VALIDATION, 'valueMissing', { field });
  }
  return value;
}

/**
 * Iterates targets in bounded chunks. Targets already handled by an earlier
 * chunk of the same attempt are skipped.
 *
 * @param {object} ctx Action context.
 * @param {{id: string, obj: object, type: string}[]} targets Targets.
 * @param {(target: object) => void} fn Per-target work.
 * @returns {{done: string[], partial: boolean}} Progress.
 */
function forTargets(ctx, targets, fn) {
  const done = new Set(ctx.progress || []);
  let writes = 0;
  for (const target of targets) {
    if (done.has(target.id)) {
      continue;
    }
    if (writes >= getLimits().targetsPerChunk) {
      return { done: [...done], partial: true };
    }
    fn(target);
    done.add(target.id);
    writes += 1;
  }
  return { done: [...done], partial: false };
}

/**
 * Writes token properties and announces the change internally, since
 * Roll20 does not raise change events for API writes.
 *
 * @param {object} ctx Action context.
 * @param {object} obj Roll20 graphic.
 * @param {object} changes Properties to set.
 * @returns {void}
 */
function writeToken(ctx, obj, changes) {
  const before = snapshot(obj, 'graphic');
  obj.set(changes);
  ctx.noteWrite(obj.id, changes);
  ctx.emit({
    type: 'token.change',
    objectType: 'graphic',
    objectId: obj.id,
    old: before,
    new: snapshot(obj, 'graphic'),
    pageId: obj.get('_pageid'),
  });
}

/**
 * Converts a value for a token property.
 *
 * @param {string} prop Property.
 * @param {*} value Value.
 * @param {object} inst Instance.
 * @returns {*} Converted value.
 */
function tokenValue(prop, value, inst) {
  const kind = TOKEN_WRITE_PROPERTIES[prop];
  if (TOKEN_GM_PROPERTIES.has(prop) && !hasGmAuthority(inst)) {
    throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmProperty', { property: prop });
  }
  switch (kind) {
    case 'number': {
      const n = parseStrictNumber(value);
      if (n === null) {
        throw taskError(ERROR_CODES.VALIDATION, 'notNumber', { field: prop });
      }
      return n;
    }
    case 'bar':
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string' && value.length <= 100) {
        return value;
      }
      throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
    case 'layer':
      if (!LAYERS.includes(value)) {
        throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
      }
      return value;
    case 'color':
      if (
        typeof value === 'string' &&
        (/^#[0-9a-fA-F]{6}$/.test(value) || value === 'transparent')
      ) {
        return value;
      }
      throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
    case 'boolean':
      if (typeof value !== 'boolean') {
        throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
      }
      return value;
    case 'string':
      if (typeof value !== 'string' || value.length > 200) {
        throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
      }
      return value;
    default:
      throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
  }
}

/**
 * Returns the characters for a set of targets (characters, or tokens'
 * represented characters).
 *
 * @param {object[]} targets Targets.
 * @returns {{id: string, obj: object, type: string}[]} Characters.
 */
function characterTargets(targets) {
  const out = [];
  for (const target of targets) {
    const character = characterOf(target.obj, target.type);
    if (!character) {
      throw taskError(ERROR_CODES.MISSING_TARGET, 'noCharacter', { id: target.id });
    }
    if (!out.some((c) => c.id === character.id)) {
      out.push({ id: character.id, obj: character, type: 'character' });
    }
  }
  return out;
}

/**
 * Returns the pixel position and page of the first target, or of `at`.
 *
 * @param {object} ctx Action context.
 * @param {object} step Step.
 * @returns {{left: number, top: number, pageId: string}} Location.
 */
function locate(ctx, step) {
  if (step.target) {
    const [target] = ctx.targets(step.target, 'graphic');
    return {
      left: Number(target.obj.get('left')),
      top: Number(target.obj.get('top')),
      pageId: target.obj.get('_pageid'),
    };
  }
  const left = parseStrictNumber(required(ctx, step.at.left, 'at.left'));
  const top = parseStrictNumber(required(ctx, step.at.top, 'at.top'));
  const pageId = toText(required(ctx, step.at.page, 'at.page'));
  if (left === null || top === null || !getObject('page', pageId)) {
    throw taskError(ERROR_CODES.MISSING_TARGET, 'badLocation', {});
  }
  return { left, top, pageId };
}

/**
 * Formats a chat speaker name.
 *
 * @param {object} step Step.
 * @returns {string} Speaker.
 */
function speaker(step) {
  return (
    neutraliseChatText(step.as || SCRIPT_NAME)
      .replaceAll('|', '')
      .slice(0, 60) || SCRIPT_NAME
  );
}

export const ACTIONS = {
  'chat.send'(step, ctx) {
    rateLimit(`chat:${ctx.inst.definitionId}`, getLimits().chatPerMinute);
    const text = neutraliseChatText(
      ctx.render(step.text, (v) => escapeHtml(neutraliseChatText(v)))
    );
    if (!text) {
      throw taskError(ERROR_CODES.VALIDATION, 'emptyMessage', {});
    }
    const mode = step.mode || (step.to ? 'whisper' : 'say');
    const who = speaker(step);
    if (mode === 'whisper') {
      const recipients = resolveRecipients(step.to, ctx.inst);
      if (!recipients.gm && recipients.players.length === 0) {
        throw taskError(ERROR_CODES.MISSING_TARGET, 'noRecipients', {});
      }
      if (recipients.gm) {
        chat(who, `/w gm ${text}`);
      }
      for (const playerId of recipients.players) {
        chat(who, `/w "${playerName(playerId).replaceAll('"', '')}" ${text}`);
      }
      return { result: { sent: recipients.players.length + (recipients.gm ? 1 : 0) } };
    }
    const prefix = { say: '', emote: '/em ', desc: '/desc ' }[mode];
    if (mode === 'desc' && !hasGmAuthority(ctx.inst)) {
      throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmOnlyMode', { mode });
    }
    chat(who, `${prefix}${text}`);
    return { result: { sent: 1 } };
  },

  'chat.command'(step, ctx) {
    if (!hasGmAuthority(ctx.inst)) {
      throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmOnlyAction', { type: step.type });
    }
    rateLimit(`chat:${ctx.inst.definitionId}`, getLimits().chatPerMinute);
    const text = ctx
      .render(step.text, (v) => escapeHtml(neutraliseChatText(v)))
      .replaceAll(/[\r\n]+/g, ' ')
      .trim();
    if (!text || text.startsWith('!')) {
      throw taskError(ERROR_CODES.VALIDATION, 'badCommand', {});
    }
    chat(speaker(step), text);
    return { result: { sent: 1 } };
  },

  'token.set'(step, ctx) {
    const targets = ctx.targets(step.target, 'graphic');
    ctx.authorise(targets.map((t) => t.id));
    const changes = {};
    for (const [prop, expr] of Object.entries(step.set)) {
      changes[prop] = tokenValue(prop, required(ctx, expr, prop), ctx.inst);
    }
    const expect = {};
    for (const [prop, expr] of Object.entries(step.expect || {})) {
      expect[prop] = ctx.evaluate(expr);
    }
    ctx.prepare({ set: changes });
    const progress = forTargets(ctx, targets, (target) => {
      for (const [prop, value] of Object.entries(expect)) {
        const current = readProperty(target.obj, 'graphic', prop);
        if (!current.found || current.value !== value) {
          throw taskError(ERROR_CODES.CONFLICT, 'expectedValue', { id: target.id, property: prop });
        }
      }
      writeToken(ctx, target.obj, changes);
    });
    return { result: { changed: progress.done.length }, ...progress };
  },

  'token.get'(step, ctx) {
    const [target] = ctx.targets(step.target, 'graphic');
    const value = readProperty(target.obj, 'graphic', step.property);
    return { result: value.found ? value.value : null };
  },

  'token.advanceSide'(step, ctx) {
    const targets = ctx.targets(step.target, 'graphic');
    ctx.authorise(targets.map((t) => t.id));
    const delta = step.delta ?? 1;
    const wrap = step.wrap !== false;
    const plan = {};
    for (const target of targets) {
      const sides = tokenSides(target.obj);
      if (sides.length < 2) {
        throw taskError(ERROR_CODES.VALIDATION, 'notMultiSided', { id: target.id });
      }
      const current = currentSideIndex(target.obj);
      const dest = wrap
        ? (((current + delta) % sides.length) + sides.length) % sides.length
        : clamp(current + delta, 0, sides.length - 1);
      const image = writableImage(sides[dest]);
      if (!image) {
        throw taskError(
          ERROR_CODES.UNAVAILABLE,
          'sideImageUnsupported',
          { id: target.id, side: dest + 1 },
          { transient: false }
        );
      }
      plan[target.id] = { from: current, to: dest, image };
    }
    // Persist the destination before writing so a restart can reconcile it.
    ctx.prepare({
      resolvedSide: Object.fromEntries(Object.entries(plan).map(([id, p]) => [id, p.to])),
    });
    const progress = forTargets(ctx, targets, (target) => {
      const p = plan[target.id];
      writeToken(ctx, target.obj, { currentSide: p.to, imgsrc: p.image });
    });
    return {
      result: { sides: Object.fromEntries(Object.entries(plan).map(([id, p]) => [id, p.to + 1])) },
      ...progress,
    };
  },

  'token.setSide'(step, ctx) {
    const targets = ctx.targets(step.target, 'graphic');
    ctx.authorise(targets.map((t) => t.id));
    const side = parseStrictNumber(required(ctx, step.side, 'side'));
    const plan = {};
    for (const target of targets) {
      const sides = tokenSides(target.obj);
      if (!Number.isInteger(side) || side < 1 || side > sides.length) {
        throw taskError(ERROR_CODES.VALIDATION, 'sideOutOfRange', {
          id: target.id,
          max: sides.length,
        });
      }
      const image = writableImage(sides[side - 1]);
      if (!image) {
        throw taskError(
          ERROR_CODES.UNAVAILABLE,
          'sideImageUnsupported',
          { id: target.id, side },
          { transient: false }
        );
      }
      plan[target.id] = image;
    }
    ctx.prepare({ resolvedSide: Object.fromEntries(targets.map((t) => [t.id, side - 1])) });
    const progress = forTargets(ctx, targets, (target) => {
      writeToken(ctx, target.obj, { currentSide: side - 1, imgsrc: plan[target.id] });
    });
    return { result: { side }, ...progress };
  },

  'attribute.set'(step, ctx) {
    const characters = characterTargets(ctx.targets(step.target, 'character'));
    ctx.authorise(characters.map((c) => c.id));
    const field = step.field || 'current';
    const value = required(ctx, step.value, 'value');
    if (typeof value !== 'number' && typeof value !== 'string') {
      throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: 'value' });
    }
    const expect = step.expect === undefined ? MISSING : ctx.evaluate(step.expect);
    const old = {};
    for (const c of characters) {
      const attr = findAttribute(c.id, step.attribute);
      if (!attr && !step.create) {
        throw taskError(ERROR_CODES.MISSING_TARGET, 'attributeMissing', {
          id: c.id,
          attribute: step.attribute,
        });
      }
      old[c.id] = attr ? attr.get(field) : null;
      if (expect !== MISSING && String(old[c.id]) !== String(expect)) {
        throw taskError(ERROR_CODES.CONFLICT, 'expectedValue', {
          id: c.id,
          property: step.attribute,
        });
      }
    }
    ctx.prepare({ attribute: step.attribute, field, old, value });
    const progress = forTargets(ctx, characters, (c) => {
      let attr = findAttribute(c.id, step.attribute);
      if (!attr) {
        attr = createObject('attribute', {
          characterid: c.id,
          name: step.attribute,
          [field]: value,
        });
      } else {
        setAttribute(attr, field, value, step.useWorker);
      }
      ctx.emit({
        type: 'attribute.change',
        objectType: 'attribute',
        objectId: attr?.id,
        characterId: c.id,
        name: step.attribute,
        old: { [field]: old[c.id] },
        new: { [field]: value },
      });
    });
    return { result: { value }, ...progress };
  },

  'attribute.adjust'(step, ctx) {
    const characters = characterTargets(ctx.targets(step.target, 'character'));
    ctx.authorise(characters.map((c) => c.id));
    const field = step.field || 'current';
    const by = parseStrictNumber(required(ctx, step.by, 'by'));
    if (by === null) {
      throw taskError(ERROR_CODES.VALIDATION, 'notNumber', { field: 'by' });
    }
    const plan = {};
    for (const c of characters) {
      const attr = findAttribute(c.id, step.attribute);
      if (!attr) {
        throw taskError(ERROR_CODES.MISSING_TARGET, 'attributeMissing', {
          id: c.id,
          attribute: step.attribute,
        });
      }
      const oldValue = parseStrictNumber(attr.get(field));
      if (oldValue === null) {
        throw taskError(ERROR_CODES.VALIDATION, 'notNumeric', { attribute: step.attribute });
      }
      let next = oldValue + by;
      if (Number.isFinite(step.min)) {
        next = Math.max(step.min, next);
      }
      if (Number.isFinite(step.max)) {
        next = Math.min(step.max, next);
      }
      plan[c.id] = { attrId: attr.id, old: oldValue, new: next };
    }
    // Old and new values are recorded first: a restart compares, it never adds twice.
    ctx.prepare({ attribute: step.attribute, field, plan });
    const progress = forTargets(ctx, characters, (c) => {
      const attr = getObject('attribute', plan[c.id].attrId);
      setAttribute(attr, field, plan[c.id].new, step.useWorker);
      ctx.emit({
        type: 'attribute.change',
        objectType: 'attribute',
        objectId: attr.id,
        characterId: c.id,
        name: step.attribute,
        old: { [field]: plan[c.id].old },
        new: { [field]: plan[c.id].new },
      });
    });
    return {
      result: { values: Object.fromEntries(Object.entries(plan).map(([id, p]) => [id, p.new])) },
      ...progress,
    };
  },

  'attribute.get'(step, ctx) {
    const [character] = characterTargets(ctx.targets(step.target, 'character'));
    const attr = findAttribute(character.id, step.attribute);
    return { result: attr ? attr.get(step.field || 'current') : null };
  },

  'marker.set'(step, ctx) {
    const targets = ctx.targets(step.target, 'graphic');
    ctx.authorise(targets.map((t) => t.id));
    if (!/^[A-Za-z0-9_:.-]{1,80}$/.test(step.marker)) {
      throw taskError(ERROR_CODES.VALIDATION, 'badMarker', { marker: step.marker });
    }
    const op = step.op || 'add';
    let count = null;
    if (step.count !== undefined) {
      count = parseStrictNumber(required(ctx, step.count, 'count'));
      if (count === null || !Number.isInteger(count)) {
        throw taskError(ERROR_CODES.VALIDATION, 'notNumber', { field: 'count' });
      }
    }
    ctx.prepare({ marker: step.marker, op, count });
    const progress = forTargets(ctx, targets, (target) => {
      const markers = parseMarkers(target.obj.get('statusmarkers'));
      const existing = markers.find((m) => m.tag === step.marker);
      const others = markers.filter((m) => m.tag !== step.marker);
      let next = existing || null;
      switch (op) {
        case 'add':
          next = existing || {
            tag: step.marker,
            count: count !== null ? clamp(count, 0, 9) : null,
          };
          break;
        case 'remove':
          next = null;
          break;
        case 'toggle':
          next = existing ? null : { tag: step.marker, count: null };
          break;
        case 'set':
          next =
            count !== null && count <= 0
              ? null
              : { tag: step.marker, count: count === null ? null : clamp(count, 1, 9) };
          break;
        case 'adjust': {
          const value = (existing?.count ?? 0) + (count ?? 1);
          next = value <= 0 ? null : { tag: step.marker, count: clamp(value, 1, 9) };
          break;
        }
        default:
          break;
      }
      writeToken(ctx, target.obj, {
        statusmarkers: formatMarkers(next ? [...others, next] : others),
      });
    });
    return { result: { changed: progress.done.length }, ...progress };
  },

  ping(step, ctx) {
    const where = locate(ctx, step);
    if (step.moveView && !hasGmAuthority(ctx.inst)) {
      throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmOnlyMode', { mode: 'moveView' });
    }
    let visibleTo;
    if (step.to) {
      const recipients = resolveRecipients(step.to, ctx.inst);
      visibleTo = [...recipients.players, ...(recipients.gm ? gmPlayerIds() : [])];
      if (!visibleTo.length) {
        throw taskError(ERROR_CODES.MISSING_TARGET, 'noRecipients', {});
      }
    }
    ping(where.left, where.top, where.pageId, null, Boolean(step.moveView), visibleTo);
    return { result: { pinged: true } };
  },

  'effect.spawn'(step, ctx) {
    rateLimit(`effects:${ctx.inst.definitionId}`, 30);
    const where = locate(ctx, step);
    const [type, color] = String(step.fx).split('-');
    const spec = { left: where.left, top: where.top, pageId: where.pageId };
    if (FX_TYPES.includes(type) && FX_COLORS.includes(color)) {
      spec.fx = step.fx;
    } else if (['beam', 'breath', 'splatter'].includes(type) && FX_COLORS.includes(color)) {
      spec.fx = step.fx;
    } else {
      // Custom effects are GM-approved definitions only.
      if (!hasGmAuthority(ctx.inst)) {
        throw taskError(ERROR_CODES.UNAUTHORIZED, 'customFx', { fx: step.fx });
      }
      const custom = findObjects({ _type: 'custfx', name: step.fx })[0];
      if (!custom) {
        throw taskError(ERROR_CODES.MISSING_TARGET, 'fxMissing', { fx: step.fx });
      }
      spec.definition = custom.get('definition');
    }
    if (step.to) {
      const left = parseStrictNumber(required(ctx, step.to.left, 'to.left'));
      const top = parseStrictNumber(required(ctx, step.to.top, 'to.top'));
      if (left === null || top === null) {
        throw taskError(ERROR_CODES.VALIDATION, 'badLocation', {});
      }
      spec.to = { left, top };
    }
    spawnEffect(spec);
    return { result: { spawned: true } };
  },

  'audio.control'(step, ctx) {
    if (!hasGmAuthority(ctx.inst)) {
      throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmOnlyAction', { type: step.type });
    }
    const name = ctx.render(step.track, (v) => v).trim();
    const track =
      getObject('jukeboxtrack', name) ||
      findObjects({ _type: 'jukeboxtrack', title: name })[0] ||
      null;
    if (!track) {
      throw taskError(ERROR_CODES.MISSING_TARGET, 'trackMissing', { track: name });
    }
    const changes = {};
    if (step.op === 'play') {
      Object.assign(changes, { playing: true, softstop: false });
      if (typeof step.loop === 'boolean') {
        changes.loop = step.loop;
      }
    } else if (step.op === 'stop') {
      Object.assign(changes, { playing: false, softstop: false });
    }
    if (step.op === 'volume' || step.volume !== undefined) {
      const volume = parseStrictNumber(required(ctx, step.volume, 'volume'));
      if (volume === null) {
        throw taskError(ERROR_CODES.VALIDATION, 'notNumber', { field: 'volume' });
      }
      changes.volume = clamp(Math.round(volume), 0, 100);
    }
    ctx.prepare({ track: track.id, changes });
    track.set(changes);
    return { result: { track: track.id, ...changes } };
  },

  'integration.command'(step, ctx) {
    if (!hasGmAuthority(ctx.inst)) {
      throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmOnlyAction', { type: step.type });
    }
    rateLimit(`commands:${ctx.inst.definitionId}`, getLimits().chatPerMinute);
    const args = {};
    for (const [name, expr] of Object.entries(step.args || {})) {
      args[name] = required(ctx, expr, `args.${name}`);
    }
    const command = ctx.render(
      step.command,
      (value) => {
        // Exact argument encoding: only plain tokens may be inserted, so a
        // value can never add flags, commands or line breaks.
        if (!/^[A-Za-z0-9_\-.:#@+]*$/.test(value)) {
          throw taskError(ERROR_CODES.VALIDATION, 'unsafeArgument', {});
        }
        return value;
      },
      args
    );
    if (!/^![A-Za-z0-9_-]+/.test(command) || /[\r\n]/.test(command)) {
      throw taskError(ERROR_CODES.VALIDATION, 'badCommand', {});
    }
    chat(SCRIPT_NAME, command);
    // Dispatch is not proof that the other Mod did anything.
    return { result: { dispatched: true }, outcome: 'dispatched' };
  },

  'integration.call'(step, ctx) {
    const adapter = getAdapter(step.adapter);
    if (!adapter) {
      throw taskError(
        ERROR_CODES.UNAVAILABLE,
        'adapterUnavailable',
        { adapter: step.adapter },
        { transient: false }
      );
    }
    const action = adapter.actions[step.action];
    if (!action) {
      throw taskError(
        ERROR_CODES.UNAVAILABLE,
        'adapterAction',
        { adapter: step.adapter, action: step.action },
        { transient: false }
      );
    }
    if (adapter.authority !== 'any' && !hasGmAuthority(ctx.inst)) {
      throw taskError(ERROR_CODES.UNAUTHORIZED, 'adapterAuthority', { adapter: step.adapter });
    }
    const input = {};
    for (const [name, expr] of Object.entries(step.input || {})) {
      const value = ctx.evaluate(expr);
      input[name] = value === MISSING ? null : value;
    }
    ctx.prepare({ adapter: step.adapter, action: step.action });
    return { async: { adapter, action, input, timeoutMs: step.timeoutMs || action.timeoutMs } };
  },
};

/**
 * Sets an attribute, through sheet workers when asked and supported.
 *
 * @param {object} attr Roll20 attribute.
 * @param {string} field current or max.
 * @param {*} value Value.
 * @param {boolean} useWorker Trigger sheet workers.
 * @returns {void}
 */
function setAttribute(attr, field, value, useWorker) {
  if (useWorker) {
    if (typeof attr.setWithWorker !== 'function') {
      throw taskError(ERROR_CODES.UNAVAILABLE, 'workerUnavailable', {}, { transient: false });
    }
    attr.setWithWorker({ [field]: value });
    return;
  }
  attr.set(field, value);
}
