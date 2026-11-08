// Effect lifecycle: adopting v1 tokens and following token changes.

import {
  MAX_NAME_LENGTH,
  NEW_EFFECT_AREA_CELLS,
  NEW_EFFECT_INTERVAL_MS,
  NEW_EFFECT_NAME,
  V1_DISABLE_MARKER,
  V1_EFFECT_NAME,
  V1_NULL_NAME,
} from './constants.js';
import { pruneOwnedFx, pruneSharedFx, removeOwnedFx } from './fx.js';
import { refreshEffect, stopEffect, syncEffects } from './scheduler.js';
import {
  cleanEffect,
  deleteEffect,
  effectFromV1Token,
  getEffect,
  getEffects,
  getNullAreas,
  getReleased,
  getState,
  putEffect,
  readV1Token,
} from './state.js';
import { hasMarker, toNumber, toText, truncate } from './utils.js';

// Token properties v1 read an effect from.
const V1_FIELDS = ['gmnotes', 'bar1_value', 'bar1_max', 'bar2_value', 'bar2_max'];

/**
 * Returns true when a token is named like a v1 effect token.
 *
 * @param {object} token Roll20 graphic.
 * @returns {boolean} True for "PageFX".
 */
function isV1EffectName(token) {
  return toText(token.get('name')) === V1_EFFECT_NAME;
}

/**
 * Returns true when a token is named like a v1 no-effect area.
 *
 * @param {object} token Roll20 graphic.
 * @returns {boolean} True for "NullFX".
 */
function isV1NullName(token) {
  return toText(token.get('name')) === V1_NULL_NAME;
}

/**
 * Takes over one v1-style token if it is not known yet.
 *
 * @param {object} token Roll20 graphic.
 * @returns {'effect'|'null'|null} What it became.
 */
export function adoptToken(token) {
  if (getReleased()[token.id]) {
    return null;
  }
  if (isV1EffectName(token) && !getEffect(token.id)) {
    putEffect(effectFromV1Token(token));
    return 'effect';
  }
  if (isV1NullName(token) && !getNullAreas()[token.id]) {
    getNullAreas()[token.id] = { source: 'v1' };
    return 'null';
  }
  return null;
}

/**
 * Takes over every v1-style PageFX and NullFX token in the game, and forgets
 * effects and areas whose tokens are gone.
 *
 * @returns {{effects: number, nulls: number, dropped: number}} Counts.
 */
export function rescanTokens() {
  let effects = 0;
  let nulls = 0;
  for (const token of findObjs({ _type: 'graphic' })) {
    const adopted = adoptToken(token);
    effects += adopted === 'effect' ? 1 : 0;
    nulls += adopted === 'null' ? 1 : 0;
  }
  let dropped = 0;
  for (const id of Object.keys(getEffects())) {
    if (!getObj('graphic', id)) {
      forgetEffect(id);
      dropped++;
    }
  }
  for (const id of Object.keys(getNullAreas())) {
    if (!getObj('graphic', id)) {
      delete getNullAreas()[id];
      dropped++;
    }
  }
  pruneSharedFx(getState().ownedFx, Object.values(getEffects()));
  for (const id of Object.keys(getReleased())) {
    if (!getObj('graphic', id)) {
      delete getReleased()[id];
    }
  }
  return { effects, nulls, dropped };
}

/**
 * Stops and forgets an effect, with the custom FX objects made for it.
 *
 * @param {string} id Effect ID.
 * @returns {void}
 */
export function forgetEffect(id) {
  stopEffect(id);
  removeOwnedFx(getState().ownedFx, id);
  deleteEffect(id);
  pruneSharedFx(getState().ownedFx, Object.values(getEffects()));
}

/**
 * Makes a token an effect from the chat menu. A token with no name is named
 * "PageFX", and one with no Aura 1 gets a three-cell area, hidden from players.
 * The new effect has one empty layer for the GM to fill in.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} [name] Effect name (default: the token's name).
 * @returns {{effect: object, created: boolean}} The effect, and whether it is new.
 */
export function createEffect(token, name) {
  const existing = getEffect(token.id);
  if (existing) {
    return { effect: existing, created: false };
  }
  delete getReleased()[token.id];
  delete getNullAreas()[token.id];
  const changes = { showplayers_aura1: false };
  if (toText(token.get('name')) === '') {
    changes.name = NEW_EFFECT_NAME;
  }
  if (!(toNumber(token.get('aura1_radius')) > 0)) {
    const page = getObj('page', token.get('_pageid'));
    const scale = toNumber(page?.get('scale_number')) || 1;
    changes.aura1_radius = NEW_EFFECT_AREA_CELLS * scale;
  }
  token.set(changes);
  const effect = putEffect(
    cleanEffect(
      {
        name: truncate(
          toText(name) || toText(token.get('name')) || NEW_EFFECT_NAME,
          MAX_NAME_LENGTH
        ),
        layers: [{ fx: null, interval: NEW_EFFECT_INTERVAL_MS, direction: null }],
        source: 'chat',
      },
      token.id
    )
  );
  return { effect, created: true };
}

/**
 * Takes the effect off a token, which stays on the map. The token is not taken
 * over again for being named PageFX.
 *
 * @param {string} id Effect ID.
 * @returns {void}
 */
export function releaseEffect(id) {
  forgetEffect(id);
  if (getObj('graphic', id)) {
    getReleased()[id] = true;
  }
}

/**
 * Records that an effect was edited from chat: from now on its token's GM
 * Notes and bars no longer drive it, and custom FX objects its layers no
 * longer use are removed.
 *
 * @param {object} effect Effect.
 * @returns {void}
 */
export function markEdited(effect) {
  effect.source = 'chat';
  pruneOwnedFx(getState().ownedFx, effect);
  pruneSharedFx(getState().ownedFx, Object.values(getEffects()));
}

/**
 * Sets the area of an effect or no-effect area: its token's Aura 1, hidden
 * from players.
 *
 * @param {object} token Roll20 graphic.
 * @param {number} radius Radius in page units, beyond the token's edge.
 * @param {boolean|null} square True for a square, false for a circle, null to keep it.
 * @returns {void}
 */
export function setArea(token, radius, square) {
  const changes = { aura1_radius: radius, showplayers_aura1: false };
  if (square !== null) {
    changes.aura1_square = square;
  }
  token.set(changes);
}

/**
 * Makes a token a no-effect area.
 *
 * @param {object} token Roll20 graphic.
 * @returns {boolean} False when the token is an effect.
 */
export function createNullArea(token) {
  if (getEffect(token.id)) {
    return false;
  }
  delete getReleased()[token.id];
  getNullAreas()[token.id] = { source: 'chat' };
  return true;
}

/**
 * Takes a no-effect area off a token.
 *
 * @param {string} id Token ID.
 * @returns {boolean} True when it was an area.
 */
export function removeNullArea(id) {
  if (!getNullAreas()[id]) {
    return false;
  }
  delete getNullAreas()[id];
  if (getObj('graphic', id)) {
    getReleased()[id] = true;
  }
  return true;
}

/**
 * Follows a token change: v1-style edits, the interdiction marker, renames to
 * PageFX/NullFX and moves between pages.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} [prev={}] Previous values.
 * @returns {void}
 */
export function handleGraphicChange(token, prev = {}) {
  const effect = getEffect(token.id);
  if (effect) {
    let changed = false;
    if (effect.source === 'v1' && V1_FIELDS.some((k) => k in prev && prev[k] !== token.get(k))) {
      const { layer } = readV1Token(token);
      effect.layers[0] = layer;
      changed = true;
    }
    if ('statusmarkers' in prev && prev.statusmarkers !== token.get('statusmarkers')) {
      const disabled = hasMarker(token, V1_DISABLE_MARKER);
      const wasDisabled = toText(prev.statusmarkers)
        .split(',')
        .some((m) => m.split('@')[0] === V1_DISABLE_MARKER);
      if (disabled !== wasDisabled) {
        effect.enabled = !disabled;
        changed = true;
      }
    }
    if (changed) {
      refreshEffect(effect.id);
    } else if ('_pageid' in prev && prev._pageid !== token.get('_pageid')) {
      syncEffects();
    }
    // Moving or resizing needs nothing: each spawn reads the token afresh.
  } else if (isV1EffectName(token) && adoptToken(token)) {
    syncEffects();
  }

  const nulls = getNullAreas();
  if (isV1NullName(token)) {
    adoptToken(token);
  } else if (nulls[token.id]?.source === 'v1' && 'name' in prev) {
    delete nulls[token.id];
  }
}

/**
 * Takes over a new token named PageFX or NullFX (for example a pasted copy).
 *
 * @param {object} token Roll20 graphic.
 * @returns {void}
 */
export function handleGraphicAdded(token) {
  if (adoptToken(token) === 'effect') {
    syncEffects();
  }
}

/**
 * Forgets an effect or area whose token was deleted.
 *
 * @param {object} token Roll20 graphic.
 * @returns {void}
 */
export function handleGraphicDestroyed(token) {
  if (getEffect(token.id)) {
    forgetEffect(token.id);
  }
  delete getNullAreas()[token.id];
  delete getReleased()[token.id];
}
