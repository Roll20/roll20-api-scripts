// Chat commands: !pagefx <subcommand>. Matched without regard to case, so the
// v1 commands `!pageFX on` and `!pageFX off` still work.
//
// Commands act on the selected tokens, or on the tokens given with --ids.
// Layer commands act on layer 1 unless --layer says otherwise. Menu buttons
// add --edit, --menu, --settings or --status to show their card again.

import { buildDivider, whisper, whisperError } from './chat.js';
import {
  API_PLAYER_ID,
  COMMAND,
  COMMAND_ALIASES,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  MAX_EDIT_CARDS,
  MAX_FIRE_COUNT,
  MAX_LAYERS,
  MAX_NAME_LENGTH,
  NEW_EFFECT_INTERVAL_MS,
  NEW_EFFECT_NAME,
  SCRIPT_NAME,
} from './constants.js';
import {
  createEffect,
  createNullArea,
  markEdited,
  releaseEffect,
  removeNullArea,
  rescanTokens,
  setArea,
} from './effects.js';
import { isBeamSpec, parseFxSpec } from './fx.js';
import { t } from './i18n.js';
import { COMMAND_LIST, installHandouts } from './journals.js';
import { showEffectCard, showMainMenu, showPresets, showSettings, showStatus } from './menu.js';
import { getPreset, presetLayers, presetName } from './presets.js';
import { primeInside } from './triggers.js';
import { fireOnce, refreshEffect, syncEffects } from './scheduler.js';
import {
  MAX_TRIGGERS,
  clampIntensity,
  cleanInterval,
  cleanLayer,
  cleanTrigger,
  getEffect,
  getLang,
  getNullAreas,
  getSettings,
  getState,
  setSetting,
} from './state.js';
import { escapeHtml, parseBoolean, toNumber, toText, truncate } from './utils.js';

// Flags that name the card to show after a change.
const BACK_FLAGS = ['edit', 'menu', 'settings', 'status'];

/**
 * Splits command words into plain arguments and flags.
 *
 * @param {string[]} words Words after the subcommand.
 * @returns {{args: string[], ids: string[]|null, layer: number|null, back: string|null}}
 *   Plain arguments, the --ids list, the --layer number and the card to show again.
 */
export function parseArgs(words) {
  const args = [];
  let ids = null;
  let layer = null;
  let back = null;
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();
    if (word === '--ids') {
      ids = [];
      while (i + 1 < words.length && !words[i + 1].startsWith('--')) {
        ids.push(...words[++i].split(',').filter(Boolean));
      }
    } else if (word === '--layer' && i + 1 < words.length) {
      layer = Number.parseInt(words[++i], 10);
    } else if (word.startsWith('--') && BACK_FLAGS.includes(word.slice(2))) {
      back = word.slice(2);
    } else {
      args.push(words[i]);
    }
  }
  return { args, ids, layer, back };
}

/**
 * Returns the token IDs a command is for: the --ids list, or the selected tokens.
 *
 * @param {object} ctx Command context.
 * @returns {string[]} Token IDs.
 */
function targetIds(ctx) {
  return ctx.ids ?? (ctx.msg.selected || []).map((s) => s._id);
}

/**
 * Works out which effects a command is for.
 *
 * @param {object} ctx Command context.
 * @returns {{effects: object[], unknown: string[], given: boolean}} Effects, IDs that are
 *   not effects, and whether any tokens were given at all.
 */
function targetEffects(ctx) {
  const wanted = targetIds(ctx);
  const effects = [];
  const unknown = [];
  for (const id of wanted) {
    const effect = getEffect(id);
    if (effect) {
      effects.push(effect);
    } else {
      unknown.push(id);
    }
  }
  return { effects, unknown, given: wanted.length > 0 };
}

/**
 * Returns the effects a command is for, telling the GM when there are none.
 *
 * @param {object} ctx Command context.
 * @returns {object[]} Effects (empty after an error was sent).
 */
function requireEffects(ctx) {
  const { effects, unknown } = targetEffects(ctx);
  if (unknown.length > 0 && ctx.ids) {
    whisperError(ctx.playerId, t('errors.unknownIds', ctx.lang, { ids: unknown.join(', ') }));
  } else if (effects.length === 0) {
    whisperError(ctx.playerId, t('errors.noEffects', ctx.lang));
  }
  return effects;
}

/**
 * Returns the tokens a command is for, telling the GM when there are none.
 *
 * @param {object} ctx Command context.
 * @returns {object[]} Roll20 graphics.
 */
function requireTokens(ctx) {
  const tokens = targetIds(ctx)
    .map((id) => getObj('graphic', id))
    .filter(Boolean);
  if (tokens.length === 0) {
    whisperError(ctx.playerId, t('errors.selectToken', ctx.lang));
  }
  return tokens;
}

/**
 * Sends a short confirmation.
 *
 * @param {string|null} playerId Who to tell.
 * @param {string} text Message.
 * @returns {void}
 */
function notify(playerId, text) {
  whisper(playerId, SCRIPT_NAME, `<div>${escapeHtml(text)}</div>`);
}

/**
 * Shows the cards for some effects.
 *
 * @param {object} ctx Command context.
 * @param {object[]} effects Effects.
 * @returns {void}
 */
function showCards(ctx, effects) {
  effects.slice(0, MAX_EDIT_CARDS).forEach((e) => showEffectCard(ctx.playerId, e));
}

/**
 * Answers a command: shows the card the button came from again, or sends a
 * short confirmation when the command was typed.
 *
 * @param {object} ctx Command context.
 * @param {object[]} effects Effects the command changed.
 * @param {string} key Message key for the confirmation.
 * @param {object} [vars] Message values.
 * @returns {void}
 */
function reply(ctx, effects, key, vars = {}) {
  switch (ctx.back) {
    case 'edit':
      if (effects.length > 0) {
        showCards(ctx, effects);
      } else {
        showMainMenu(ctx.playerId);
      }
      return;
    case 'menu':
      showMainMenu(ctx.playerId);
      return;
    case 'settings':
      showSettings(ctx.playerId);
      return;
    case 'status':
      showStatus(ctx.playerId);
      return;
    default:
      notify(ctx.playerId, t(key, ctx.lang, { count: effects.length, ...vars }));
  }
}

/**
 * Turns, pauses or resumes the targeted effects, or every effect when none
 * are given and the command has a meaning for all of them.
 *
 * @param {object} ctx Command context.
 * @param {object} action What to do.
 * @param {(effect: object) => void} action.each Change for one effect.
 * @param {string} action.done Message key for the count.
 * @param {boolean|null} action.globalPause Global pause value when nothing is targeted
 *   (null: nothing targeted is an error).
 * @returns {void}
 */
function switchEffects(ctx, { each, done, globalPause }) {
  const { given } = targetEffects(ctx);
  if (!given && globalPause !== null) {
    getState().paused = globalPause;
    syncEffects();
    reply(ctx, [], globalPause ? 'messages.allPaused' : 'messages.allResumed');
    return;
  }
  const effects = requireEffects(ctx);
  if (effects.length === 0) {
    return;
  }
  for (const effect of effects) {
    each(effect);
    refreshEffect(effect.id);
  }
  reply(ctx, effects, done);
}

/**
 * Changes the targeted effects. The change returns an error to report, or
 * nothing when it worked.
 *
 * @param {object} ctx Command context.
 * @param {(effect: object) => ({key: string, vars?: object}|null|void)} change Change.
 * @param {string} done Message key for the count.
 * @returns {void}
 */
function editEffects(ctx, change, done) {
  const effects = requireEffects(ctx);
  const changed = [];
  for (const effect of effects) {
    const problem = change(effect);
    if (problem) {
      whisperError(ctx.playerId, t(problem.key, ctx.lang, problem.vars || {}));
      continue;
    }
    markEdited(effect);
    refreshEffect(effect.id);
    changed.push(effect);
  }
  if (changed.length > 0) {
    reply(ctx, changed, done);
  }
}

/**
 * Finds the layer a layer command is for.
 *
 * @param {object} ctx Command context.
 * @param {object} effect Effect.
 * @param {boolean} [create=false] Add layer 1 to an effect that has none.
 * @returns {{layer?: object, error?: {key: string, vars: object}}} Layer, or an error.
 */
function pickLayer(ctx, effect, create = false) {
  const n = ctx.layer ?? 1;
  if (create && effect.layers.length === 0 && n === 1) {
    effect.layers.push(cleanLayer({ interval: NEW_EFFECT_INTERVAL_MS }));
  }
  const layer = Number.isInteger(n) ? effect.layers[n - 1] : undefined;
  if (!layer) {
    return { error: { key: 'errors.noLayer', vars: { n: String(n), name: effect.name } } };
  }
  return { layer };
}

/**
 * Changes one layer of each targeted effect.
 *
 * @param {object} ctx Command context.
 * @param {(layer: object, effect: object) => void} change Change.
 * @param {string} done Message key for the count.
 * @param {boolean} [create=false] Add layer 1 to an effect that has none.
 * @returns {void}
 */
function editLayers(ctx, change, done, create = false) {
  editEffects(
    ctx,
    (effect) => {
      const picked = pickLayer(ctx, effect, create);
      if (picked.error) {
        return picked.error;
      }
      change(picked.layer, effect);
      return null;
    },
    done
  );
}

/**
 * Handles `!pagefx fx <effect>`: a built-in "type-colour", a saved custom FX
 * name, or a custom FX definition in JSON.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleFx(ctx) {
  const parsed = parseFxSpec(ctx.args.join(' '));
  if (!parsed.ok) {
    whisperError(ctx.playerId, t(parsed.error, ctx.lang, parsed.vars || {}));
    return;
  }
  editLayers(
    ctx,
    (layer, effect) => {
      layer.fx = parsed.fx;
      layer.error = null;
      effect.preset = null;
      // Beam-like effects need an end; without one they would be drawn as a dot.
      if (layer.direction === null && isBeamSpec(parsed.fx)) {
        layer.direction = 'random';
      }
    },
    'messages.fxSet',
    true
  );
}

/**
 * Handles `!pagefx interval <shortest> [longest]`, in ms.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleInterval(ctx) {
  const low = toNumber(ctx.args[0]);
  const high = ctx.args.length > 1 ? toNumber(ctx.args[1]) : low;
  if (low === null || high === null || low <= 0 || high <= 0) {
    whisperError(ctx.playerId, t('errors.badInterval', ctx.lang));
    return;
  }
  editLayers(
    ctx,
    (layer) => {
      layer.interval = cleanInterval([low, high]);
    },
    'messages.intervalSet'
  );
}

/**
 * Handles `!pagefx direction random` and `!pagefx direction <dx> <dy>`, in cells.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleDirection(ctx) {
  let direction;
  if (toText(ctx.args[0]).toLowerCase() === 'random') {
    direction = 'random';
  } else {
    const dx = toNumber(ctx.args[0]);
    const dy = toNumber(ctx.args[1] ?? 0);
    if (dx === null || dy === null) {
      whisperError(ctx.playerId, t('errors.badDirection', ctx.lang));
      return;
    }
    direction = { dx, dy };
  }
  editLayers(
    ctx,
    (layer) => {
      layer.direction = direction;
    },
    'messages.directionSet'
  );
}

/**
 * Handles `!pagefx area <radius> [circle|square]`: sets the Aura 1 of effect
 * and no-effect area tokens.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleArea(ctx) {
  const radius = toNumber(ctx.args[0]);
  const shape = toText(ctx.args[1]).toLowerCase();
  if (radius === null || radius < 0 || (shape !== '' && !['circle', 'square'].includes(shape))) {
    whisperError(ctx.playerId, t('errors.badArea', ctx.lang));
    return;
  }
  const square = shape === '' ? null : shape === 'square';
  const given = targetIds(ctx).length > 0;
  const tokens = requireTokens(ctx).filter((tok) => getEffect(tok.id) || getNullAreas()[tok.id]);
  if (tokens.length === 0) {
    if (given) {
      whisperError(ctx.playerId, t('errors.noEffects', ctx.lang));
    }
    return;
  }
  for (const token of tokens) {
    setArea(token, radius, square);
  }
  reply(ctx, tokens.map((tok) => getEffect(tok.id)).filter(Boolean), 'messages.areaSet', {
    count: tokens.length,
  });
}

/**
 * Handles `!pagefx layer add [effect]` and `!pagefx layer remove <n>`.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleLayer(ctx) {
  const [action = '', ...rest] = ctx.args;
  if (action.toLowerCase() === 'add') {
    let fx = null;
    if (rest.length > 0) {
      const parsed = parseFxSpec(rest.join(' '));
      if (!parsed.ok) {
        whisperError(ctx.playerId, t(parsed.error, ctx.lang, parsed.vars || {}));
        return;
      }
      fx = parsed.fx;
    }
    editEffects(
      ctx,
      (effect) => {
        if (effect.layers.length >= MAX_LAYERS) {
          return { key: 'errors.tooManyLayers', vars: { max: MAX_LAYERS } };
        }
        const last = effect.layers.at(-1);
        effect.preset = null;
        effect.layers.push(
          cleanLayer({
            fx,
            interval: last ? last.interval : NEW_EFFECT_INTERVAL_MS,
            direction: fx && isBeamSpec(fx) ? 'random' : null,
          })
        );
        return null;
      },
      'messages.layerAdded'
    );
    return;
  }
  if (action.toLowerCase() === 'remove') {
    const raw = rest[0] ?? (ctx.layer === null ? '' : String(ctx.layer));
    const n = Number.parseInt(raw, 10);
    editEffects(
      ctx,
      (effect) => {
        if (!Number.isInteger(n) || !effect.layers[n - 1]) {
          return { key: 'errors.noLayer', vars: { n: raw, name: effect.name } };
        }
        effect.layers.splice(n - 1, 1);
        effect.preset = null;
        return null;
      },
      'messages.layerRemoved'
    );
    return;
  }
  whisperError(ctx.playerId, t('errors.layerUsage', ctx.lang));
}

/**
 * Handles `!pagefx create [name]`: makes the selected tokens effects, and
 * shows their cards.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleCreate(ctx) {
  const tokens = requireTokens(ctx);
  if (tokens.length === 0) {
    return;
  }
  const name = ctx.args.join(' ');
  const effects = tokens.map((token) => createEffect(token, name).effect);
  syncEffects();
  if (ctx.back === null) {
    notify(ctx.playerId, t('messages.created', ctx.lang, { count: effects.length }));
  }
  showCards(ctx, effects);
}

/**
 * Handles `!pagefx preset <id>`: gives the targeted tokens a preset's layers.
 * Tokens that are not effects yet become effects.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handlePreset(ctx) {
  const preset = getPreset(ctx.args[0]);
  if (!preset) {
    whisperError(ctx.playerId, t('errors.unknownPreset', ctx.lang, { id: ctx.args[0] || '' }));
    return;
  }
  const tokens = requireTokens(ctx);
  if (tokens.length === 0) {
    return;
  }
  const name = presetName(preset, ctx.lang);
  const effects = [];
  for (const token of tokens) {
    const { effect, created } = createEffect(token, name);
    effect.layers = presetLayers(preset, ctx.lang);
    effect.preset = preset.id;
    if (!created && effect.name === NEW_EFFECT_NAME) {
      effect.name = name;
    }
    markEdited(effect);
    refreshEffect(effect.id);
    effects.push(effect);
  }
  reply(ctx, effects, 'messages.presetApplied', { name });
}

/**
 * Reads trigger options typed as words: key=value pairs, and the words
 * "once" and "always".
 *
 * @param {string[]} words Words after the event and action.
 * @returns {object} Options.
 */
export function parseTriggerOptions(words) {
  const options = {};
  for (const word of words) {
    const lower = word.toLowerCase();
    if (lower === 'once') {
      options.once = true;
    } else if (lower === 'always') {
      options.once = false;
    } else if (word.includes('=')) {
      const [key, ...rest] = word.split('=');
      options[key.toLowerCase()] = rest.join('=');
    }
  }
  return options;
}

/**
 * Handles `!pagefx trigger add <event> <action> [options]`. Turn triggers,
 * and area triggers with area=selected, take the selected token (the effect
 * is given with --ids) or token=<id>.
 *
 * @param {object} ctx Command context.
 * @param {string[]} words Words after "add".
 * @returns {void}
 */
function handleTriggerAdd(ctx, words) {
  const [event = '', action = '', ...rest] = words.map((w, i) => (i < 2 ? w.toLowerCase() : w));
  const options = parseTriggerOptions(rest);
  const selected = (ctx.msg.selected || [])
    .map((sel) => sel._id)
    .find((id) => getObj('graphic', id));
  let token = options.token || null;
  const wantsToken = event === 'turn' || toText(options.area).toLowerCase() === 'selected';
  if (wantsToken && !token) {
    token = selected || null;
    if (!token) {
      whisperError(ctx.playerId, t('errors.triggerToken', ctx.lang));
      return;
    }
  }
  const trigger = cleanTrigger({
    event,
    action,
    count: options.count,
    every: options.every,
    round: options.round,
    token: event === 'round' ? null : token,
    who: toText(options.who).toLowerCase() || 'players',
    names: toText(options.names).split(';'),
    once: options.once === true,
  });
  if (!trigger) {
    whisperError(ctx.playerId, t('errors.triggerUsage', ctx.lang));
    return;
  }
  if (trigger.who === 'named' && trigger.names.length === 0) {
    whisperError(ctx.playerId, t('errors.triggerNames', ctx.lang));
    return;
  }
  editEffects(
    ctx,
    (effect) => {
      if (effect.triggers.length >= MAX_TRIGGERS) {
        return { key: 'errors.tooManyTriggers', vars: { max: MAX_TRIGGERS } };
      }
      if (trigger.token === effect.id && trigger.event !== 'turn') {
        trigger.token = null;
      }
      effect.triggers.push({ ...trigger, names: [...trigger.names] });
      primeInside(effect.id);
      return null;
    },
    'messages.triggerAdded'
  );
}

/**
 * Handles `!pagefx trigger add|remove|clear …`.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleTrigger(ctx) {
  const [action = '', ...rest] = ctx.args;
  switch (action.toLowerCase()) {
    case 'add':
      handleTriggerAdd(ctx, rest);
      return;
    case 'remove': {
      const n = Number.parseInt(rest[0], 10);
      editEffects(
        ctx,
        (effect) => {
          if (!Number.isInteger(n) || !effect.triggers[n - 1]) {
            return {
              key: 'errors.noTrigger',
              vars: { n: String(rest[0] ?? ''), name: effect.name },
            };
          }
          effect.triggers.splice(n - 1, 1);
          primeInside(effect.id);
          return null;
        },
        'messages.triggerRemoved'
      );
      return;
    }
    case 'clear':
      editEffects(
        ctx,
        (effect) => {
          effect.triggers = [];
          primeInside(effect.id);
        },
        'messages.triggersCleared'
      );
      return;
    default:
      whisperError(ctx.playerId, t('errors.triggerUsage', ctx.lang));
  }
}

/**
 * Handles `!pagefx delete`: takes the effect off the targeted tokens, which
 * stay on the map. Menu buttons ask first and send "no" when the GM backs out.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleDelete(ctx) {
  if (toText(ctx.args[0]).toLowerCase() === 'no') {
    showCards(ctx, targetEffects(ctx).effects);
    return;
  }
  const effects = requireEffects(ctx);
  if (effects.length === 0) {
    return;
  }
  for (const effect of effects) {
    releaseEffect(effect.id);
  }
  syncEffects();
  reply({ ...ctx, back: ctx.back === 'edit' ? 'menu' : ctx.back }, effects, 'messages.deleted');
}

/**
 * Handles `!pagefx null create` and `!pagefx null remove`.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleNull(ctx) {
  const action = toText(ctx.args[0]).toLowerCase();
  if (action !== 'create' && action !== 'remove') {
    whisperError(ctx.playerId, t('errors.nullUsage', ctx.lang));
    return;
  }
  const tokens = requireTokens(ctx);
  if (tokens.length === 0) {
    return;
  }
  let count = 0;
  for (const token of tokens) {
    if (action === 'remove') {
      count += removeNullArea(token.id) ? 1 : 0;
    } else if (createNullArea(token)) {
      count++;
    } else {
      whisperError(
        ctx.playerId,
        t('errors.isEffect', ctx.lang, { name: getEffect(token.id)?.name || token.id })
      );
    }
  }
  if (count === 0 && action === 'create') {
    return;
  }
  reply(ctx, [], action === 'create' ? 'messages.nullCreated' : 'messages.nullRemoved', {
    count,
  });
}

/**
 * Handles `!pagefx set <setting> <value>`.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleSet(ctx) {
  const keys = {
    language: 'language',
    gmpagepreview: 'gmPagePreview',
    intensity: 'intensity',
    maxspawnspersecond: 'maxSpawnsPerSecond',
  };
  const key = keys[toText(ctx.args[0]).toLowerCase()];
  const raw = ctx.args.slice(1).join(' ');
  const value = key === 'gmPagePreview' ? parseBoolean(raw) : raw;
  if (!key || value === null || !setSetting(key, value)) {
    whisperError(
      ctx.playerId,
      t('errors.badSetting', ctx.lang, { setting: ctx.args[0] || '', value: raw })
    );
    return;
  }
  syncEffects();
  if (key === 'language') {
    installHandouts();
  }
  // A new language applies to the reply too.
  reply({ ...ctx, lang: getLang() }, [], 'messages.settingChanged', {
    setting: key,
    value: String(getSettings()[key]),
  });
}

/**
 * Handles `!pagefx intensity <n>` for the targeted effects, and
 * `!pagefx intensity global <n>` for the whole game.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleIntensity(ctx) {
  if (toText(ctx.args[0]).toLowerCase() === 'global') {
    handleSet({ ...ctx, args: ['intensity', ...ctx.args.slice(1)] });
    return;
  }
  const value = toNumber(ctx.args[0]);
  if (value === null || value <= 0) {
    whisperError(ctx.playerId, t('errors.badIntensity', ctx.lang));
    return;
  }
  editEffects(
    ctx,
    (effect) => {
      effect.intensity = clampIntensity(value);
    },
    'messages.intensitySet'
  );
}

/**
 * Handles `!pagefx fire [count]`: spawns the targeted effects now.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleFire(ctx) {
  const effects = requireEffects(ctx);
  if (effects.length === 0) {
    return;
  }
  const count = Math.min(MAX_FIRE_COUNT, Math.max(1, Number.parseInt(ctx.args[0], 10) || 1));
  const made = effects.reduce((sum, e) => sum + fireOnce(e.id, count), 0);
  // From a menu button the spawn itself is the answer; a new card would only clutter chat.
  if (ctx.back === null) {
    notify(ctx.playerId, t('messages.fired', ctx.lang, { count: made }));
  }
}

/**
 * Handles `!pagefx name <text>`.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleName(ctx) {
  const name = truncate(ctx.args.join(' '), MAX_NAME_LENGTH);
  if (name === '') {
    whisperError(ctx.playerId, t('errors.noName', ctx.lang));
    return;
  }
  editEffects(
    ctx,
    (effect) => {
      effect.name = name;
    },
    'messages.renamed'
  );
}

/**
 * Whispers the list of commands.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function showHelp(ctx) {
  const html = COMMAND_LIST.map(
    ([cmd, key]) =>
      `<div style="margin:2px 0"><code>${escapeHtml(`${COMMAND} ${cmd}`.trim())}</code><br><span style="font-size:0.85em">${escapeHtml(t(`help.${key}`, ctx.lang))}</span></div>`
  ).join('');
  whisper(ctx.playerId, t('titles.help', ctx.lang), [
    html,
    buildDivider(),
    `<div style="font-size:0.85em">${escapeHtml(t('help.handout', ctx.lang, { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME }))}</div>`,
  ]);
}

/**
 * Handles `!pagefx journal rebuild`.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function handleJournal(ctx) {
  if (toText(ctx.args[0]).toLowerCase() !== 'rebuild') {
    whisperError(ctx.playerId, t('errors.journalUsage', ctx.lang));
    return;
  }
  installHandouts();
  notify(
    ctx.playerId,
    t('messages.journalRebuilt', ctx.lang, { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME })
  );
}

const switches = {
  on: { field: 'enabled', value: true, done: 'messages.turnedOn', globalPause: false },
  off: { field: 'enabled', value: false, done: 'messages.turnedOff', globalPause: true },
  pause: { field: 'paused', value: true, done: 'messages.paused', globalPause: true },
  resume: { field: 'paused', value: false, done: 'messages.resumed', globalPause: false },
  toggle: { field: 'enabled', value: null, done: 'messages.toggled', globalPause: null },
};

const handlers = {
  create: handleCreate,
  preset: handlePreset,
  trigger: handleTrigger,
  help: showHelp,
  journal: handleJournal,
  presets: (ctx) => showPresets(ctx.playerId),
  delete: handleDelete,
  fire: handleFire,
  name: handleName,
  fx: handleFx,
  interval: handleInterval,
  direction: handleDirection,
  area: handleArea,
  intensity: handleIntensity,
  layer: handleLayer,
  null: handleNull,
  set: handleSet,
  edit: (ctx) => showCards(ctx, requireEffects(ctx)),
  settings: (ctx) => showSettings(ctx.playerId),
  status: (ctx) => {
    syncEffects();
    showStatus(ctx.playerId);
  },
  menu: (ctx) => {
    syncEffects();
    showMainMenu(ctx.playerId, ctx.args[0]);
  },
  rescan: (ctx) => {
    const counts = rescanTokens();
    syncEffects();
    reply(ctx, [], 'messages.rescanned', counts);
  },
};

/**
 * Routes a subcommand.
 *
 * @param {object} msg Chat message.
 * @param {string} sub Subcommand.
 * @param {string[]} words Remaining words.
 * @returns {void}
 */
function routeCommand(msg, sub, words) {
  const ctx = {
    msg,
    playerId: msg.playerid === API_PLAYER_ID ? null : msg.playerid,
    lang: getLang(),
    ...parseArgs(words),
  };
  if (sub in switches) {
    const { field, value, done, globalPause } = switches[sub];
    switchEffects(ctx, {
      each: (e) => {
        e[field] = value === null ? !e[field] : value;
      },
      done,
      globalPause,
    });
    return;
  }
  const handler = handlers[sub === '' ? 'menu' : sub];
  if (handler && Object.hasOwn(handlers, sub === '' ? 'menu' : sub)) {
    handler(ctx);
    return;
  }
  whisperError(
    ctx.playerId,
    t('errors.unknownCommand', ctx.lang, { command: `${COMMAND} ${sub}` })
  );
}

/**
 * Handles a chat message.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleInput(msg) {
  if (msg.type !== 'api') {
    return;
  }
  const content = toText(msg.content);
  const [first = ''] = content.split(/\s+/, 1);
  if (!COMMAND_ALIASES.includes(first.toLowerCase())) {
    return;
  }
  // Commands sent by other Mods (ScriptCards, macros run by the API) come from
  // the player "API". Replies to them go to the GM.
  if (msg.playerid !== API_PLAYER_ID && !playerIsGM(msg.playerid)) {
    return;
  }
  try {
    const [sub = '', ...words] = content.slice(first.length).trim().split(/\s+/).filter(Boolean);
    routeCommand(msg, sub.toLowerCase(), words);
  } catch (err) {
    log(`${SCRIPT_NAME} ERROR: ${err?.message || err}`);
    if (err?.stack) {
      log(err.stack);
    }
    whisperError(
      msg.playerid === API_PLAYER_ID ? null : msg.playerid,
      t('errors.unexpected', getLang(), { message: err?.message || String(err) })
    );
  }
}
