// Presets: named sets of layers, grouped in packs. Applying a preset copies
// its layers into the effect, so a later change to a preset never changes
// effects already made with it.
//
// Custom definitions are drawn through custom FX objects PageFX owns (Jumpgate
// draws inline definitions in white only). Effects using the same preset share
// them, named "PageFX: <preset> <layer>".
//
// Roll20 particle values: sizes and speeds are in pixels (per frame for
// speed), lifeSpan and duration in frames, angle in degrees (0 is right, 90 is
// down, 270 is up; Legacy draws nothing for negative angles), colours [red, green, blue, alpha 0-1].

import { MAX_LAYERS, MAX_NAME_LENGTH } from './constants.js';
import { completeDefinition, isBeamSpec, parseFxSpec } from './fx.js';
import { t } from './i18n.js';
import { cleanDirection, cleanInterval, cleanLayer } from './state.js';
import { isRecord, toText, truncate } from './utils.js';

/**
 * @typedef {object} PresetLayer
 * @property {string|object} fx Built-in "type-colour", saved custom FX name, or a definition.
 * @property {[number, number]} interval Time between spawns, in ms.
 * @property {'random'|{dx: number, dy: number}} [direction] End of beam-like effects.
 */

/**
 * @typedef {object} Preset
 * @property {string} id ID used in commands (never translated).
 * @property {string} pack Pack ID.
 * @property {PresetLayer[]} layers Layers.
 * @property {string} [name] Name, for presets registered by other Mods.
 */

// Particle definitions are written as changes to a base, so each preset only
// says what makes it different. Tuned by eye in Jumpgate on a light grass map
// (4 November 2026): small particles need to be about 5 px or more and nearly
// opaque to be seen; large soft ones an alpha of 0.25 to 0.5 (particles
// blend brightly). Bursts need a lifeSpan of about 30 frames or more, or they
// are gone before the eye catches them. An emitter
// that lasts under about 10 frames (duration) draws next to nothing, so short
// bursts keep duration 10 and are limited by maxParticles instead.

/**
 * Builds a complete particle definition.
 *
 * @param {object} values Values that differ from the base.
 * @returns {object} Definition.
 */
function particles(values) {
  return {
    maxParticles: 20,
    emissionRate: 2,
    duration: 10,
    size: 6,
    sizeRandom: 2,
    lifeSpan: 40,
    lifeSpanRandom: 10,
    speed: 1,
    speedRandom: 0.5,
    angle: 0,
    angleRandom: 360,
    startColour: [255, 255, 255, 1],
    startColourRandom: [0, 0, 0, 0],
    endColour: [255, 255, 255, 0],
    endColourRandom: [0, 0, 0, 0],
    ...values,
  };
}

const RAIN = particles({
  maxParticles: 60,
  emissionRate: 10,
  duration: 10,
  size: 6,
  sizeRandom: 2,
  lifeSpan: 28,
  lifeSpanRandom: 8,
  speed: 7,
  speedRandom: 2,
  angle: 100,
  angleRandom: 8,
  startColour: [205, 225, 255, 0.95],
  endColour: [170, 200, 255, 0.15],
});

const HEAVY_RAIN = { ...RAIN, maxParticles: 90, emissionRate: 15 };

const SPLASH = particles({
  maxParticles: 8,
  emissionRate: 8,
  duration: 10,
  size: 5,
  lifeSpan: 26,
  lifeSpanRandom: 6,
  speed: 1,
  speedRandom: 0.8,
  startColour: [215, 235, 255, 0.9],
  endColour: [215, 235, 255, 0],
});

const SNOW = particles({
  maxParticles: 30,
  emissionRate: 3,
  duration: 10,
  size: 7,
  sizeRandom: 3,
  lifeSpan: 90,
  lifeSpanRandom: 30,
  speed: 1,
  speedRandom: 0.5,
  angle: 100,
  angleRandom: 30,
  startColour: [255, 255, 255, 1],
  endColour: [240, 245, 255, 0],
});

const MIST = particles({
  maxParticles: 4,
  emissionRate: 1,
  duration: 10,
  size: 110,
  sizeRandom: 40,
  lifeSpan: 160,
  lifeSpanRandom: 50,
  speed: 0.4,
  speedRandom: 0.3,
  startColour: [225, 230, 240, 0.25],
  startColourRandom: [0, 0, 0, 0.05],
  endColour: [225, 230, 240, 0],
});

const MOTES = particles({
  maxParticles: 3,
  emissionRate: 1,
  duration: 10,
  size: 9,
  sizeRandom: 3,
  lifeSpan: 100,
  lifeSpanRandom: 40,
  speed: 0.5,
  speedRandom: 0.4,
  startColour: [220, 255, 90, 1],
  startColourRandom: [30, 0, 40, 0],
  endColour: [180, 255, 60, 0],
});

/** @type {Preset[]} */
export const BUILTIN_PRESETS = [
  // Weather
  {
    id: 'light-rain',
    pack: 'weather',
    layers: [{ fx: { ...RAIN, size: 5, emissionRate: 6, maxParticles: 40 }, interval: [90, 200] }],
  },
  {
    id: 'heavy-rain',
    pack: 'weather',
    layers: [
      { fx: HEAVY_RAIN, interval: [40, 90] },
      { fx: SPLASH, interval: [150, 350] },
    ],
  },
  {
    id: 'thunderstorm',
    pack: 'weather',
    layers: [
      { fx: HEAVY_RAIN, interval: [40, 90] },
      {
        fx: particles({
          maxParticles: 6,
          emissionRate: 6,
          duration: 10,
          size: 300,
          sizeRandom: 100,
          lifeSpan: 10,
          lifeSpanRandom: 3,
          speed: 0,
          speedRandom: 0,
          startColour: [255, 255, 255, 0.6],
          endColour: [210, 225, 255, 0],
        }),
        interval: [6000, 16000],
      },
    ],
  },
  { id: 'snow', pack: 'weather', layers: [{ fx: SNOW, interval: [150, 350] }] },
  {
    id: 'blizzard',
    pack: 'weather',
    layers: [
      {
        fx: {
          ...SNOW,
          maxParticles: 60,
          emissionRate: 8,
          size: 6,
          lifeSpan: 45,
          lifeSpanRandom: 15,
          speed: 6,
          speedRandom: 2,
          angle: 20,
          angleRandom: 12,
        },
        interval: [50, 110],
      },
      {
        fx: { ...MIST, speed: 3, speedRandom: 1, angle: 15, angleRandom: 10, lifeSpan: 60 },
        interval: [400, 900],
      },
    ],
  },
  {
    id: 'hail',
    pack: 'weather',
    layers: [
      {
        fx: {
          ...RAIN,
          maxParticles: 20,
          emissionRate: 4,
          duration: 10,
          lifeSpan: 16,
          lifeSpanRandom: 4,
          speed: 9,
          angle: 95,
          angleRandom: 5,
          startColour: [240, 248, 255, 1],
          endColour: [215, 230, 255, 0.6],
        },
        interval: [70, 160],
      },
    ],
  },
  {
    id: 'sandstorm',
    pack: 'weather',
    layers: [
      {
        fx: particles({
          maxParticles: 100,
          emissionRate: 10,
          duration: 10,
          size: 5,
          sizeRandom: 3,
          lifeSpan: 40,
          lifeSpanRandom: 15,
          speed: 7,
          speedRandom: 3,
          angle: 0,
          angleRandom: 15,
          startColour: [215, 170, 105, 0.95],
          startColourRandom: [20, 20, 10, 0.05],
          endColour: [185, 140, 80, 0],
        }),
        interval: [50, 110],
      },
      {
        fx: {
          ...MIST,
          size: 90,
          speed: 3,
          speedRandom: 1,
          angleRandom: 10,
          lifeSpan: 70,
          startColour: [205, 165, 105, 0.4],
          endColour: [205, 165, 105, 0],
        },
        interval: [300, 700],
      },
    ],
  },
  { id: 'fog', pack: 'weather', layers: [{ fx: MIST, interval: [600, 1400] }] },

  // Fire and heat
  {
    id: 'embers',
    pack: 'fire',
    layers: [
      {
        fx: particles({
          maxParticles: 15,
          emissionRate: 2,
          duration: 10,
          size: 6,
          sizeRandom: 3,
          lifeSpan: 60,
          lifeSpanRandom: 20,
          speed: 1.5,
          speedRandom: 0.8,
          angle: 270,
          angleRandom: 40,
          startColour: [255, 160, 40, 1],
          startColourRandom: [0, 40, 20, 0],
          endColour: [255, 40, 0, 0],
        }),
        interval: [150, 400],
      },
    ],
  },
  {
    id: 'ash',
    pack: 'fire',
    layers: [
      {
        fx: {
          ...SNOW,
          size: 6,
          speed: 0.8,
          lifeSpan: 100,
          angleRandom: 40,
          startColour: [70, 65, 60, 1],
          startColourRandom: [15, 15, 15, 0.05],
          endColour: [50, 50, 50, 0],
        },
        interval: [200, 500],
      },
    ],
  },
  {
    id: 'magma',
    pack: 'fire',
    layers: [
      { fx: 'bubbling-fire', interval: [300, 900] },
      { fx: 'burn-fire', interval: [1500, 4000] },
    ],
  },
  {
    id: 'lava-spurts',
    pack: 'fire',
    layers: [
      {
        fx: particles({
          maxParticles: 40,
          emissionRate: 20,
          duration: 10,
          size: 10,
          sizeRandom: 4,
          lifeSpan: 28,
          lifeSpanRandom: 8,
          speed: 5,
          speedRandom: 2,
          angle: 270,
          angleRandom: 30,
          startColour: [255, 120, 0, 1],
          startColourRandom: [0, 40, 0, 0],
          endColour: [120, 20, 0, 0],
        }),
        interval: [1200, 3500],
      },
      { fx: 'burst-fire', interval: [2500, 6000] },
    ],
  },
  {
    id: 'sparks',
    pack: 'fire',
    layers: [
      {
        fx: particles({
          // Bold enough to read as a burst beside a token on a busy map
          maxParticles: 70,
          emissionRate: 70,
          duration: 10,
          size: 9,
          sizeRandom: 4,
          lifeSpan: 45,
          lifeSpanRandom: 10,
          speed: 5,
          speedRandom: 2,
          startColour: [255, 235, 130, 1],
          startColourRandom: [0, 20, 40, 0],
          endColour: [255, 120, 0, 0],
        }),
        interval: [500, 1800],
      },
    ],
  },

  // Water
  {
    id: 'drips',
    pack: 'water',
    layers: [
      {
        fx: {
          ...SPLASH,
          maxParticles: 6,
          emissionRate: 6,
          size: 6,
          speed: 0.5,
          speedRandom: 0.4,
          lifeSpan: 45,
          startColour: [150, 195, 255, 1],
          endColour: [150, 195, 255, 0],
        },
        interval: [600, 2000],
      },
    ],
  },
  {
    id: 'steam',
    pack: 'water',
    layers: [
      {
        fx: particles({
          maxParticles: 50,
          emissionRate: 2,
          duration: 25,
          size: 40,
          sizeRandom: 15,
          lifeSpan: 70,
          lifeSpanRandom: 20,
          speed: 1.2,
          speedRandom: 0.5,
          angle: 270,
          angleRandom: 20,
          startColour: [245, 245, 250, 0.5],
          startColourRandom: [0, 0, 0, 0.1],
          endColour: [245, 245, 250, 0],
        }),
        interval: [1500, 4000],
      },
    ],
  },
  {
    id: 'geyser',
    pack: 'water',
    layers: [
      {
        fx: particles({
          maxParticles: 200,
          emissionRate: 12,
          duration: 40,
          size: 16,
          sizeRandom: 8,
          lifeSpan: 35,
          lifeSpanRandom: 10,
          speed: 7,
          speedRandom: 3,
          angle: 270,
          angleRandom: 12,
          startColour: [205, 232, 255, 1],
          endColour: [255, 255, 255, 0],
        }),
        interval: [6000, 15000],
      },
    ],
  },
  {
    id: 'spray',
    pack: 'water',
    layers: [
      {
        fx: {
          ...MIST,
          maxParticles: 40,
          emissionRate: 4,
          duration: 10,
          size: 26,
          sizeRandom: 12,
          lifeSpan: 45,
          lifeSpanRandom: 15,
          speed: 1.5,
          speedRandom: 0.8,
          startColour: [225, 242, 255, 0.55],
          endColour: [225, 242, 255, 0],
        },
        interval: [150, 400],
      },
    ],
  },
  {
    id: 'bubbles',
    pack: 'water',
    layers: [
      {
        fx: {
          ...MOTES,
          maxParticles: 8,
          emissionRate: 2,
          duration: 10,
          size: 8,
          sizeRandom: 4,
          lifeSpan: 55,
          lifeSpanRandom: 20,
          speed: 0.6,
          speedRandom: 0.3,
          angle: 270,
          angleRandom: 30,
          startColour: [185, 232, 255, 0.85],
          startColourRandom: [0, 0, 0, 0.1],
          endColour: [255, 255, 255, 0],
        },
        interval: [300, 800],
      },
      { fx: 'bubbling-water', interval: [2000, 5000] },
    ],
  },

  // Magic and eerie
  { id: 'fireflies', pack: 'magic', layers: [{ fx: MOTES, interval: [100, 300] }] },
  {
    id: 'arcane-motes',
    pack: 'magic',
    layers: [
      {
        fx: {
          ...MOTES,
          speed: 0.8,
          angle: 270,
          angleRandom: 180,
          lifeSpan: 80,
          startColour: [150, 110, 255, 1],
          startColourRandom: [60, 60, 0, 0],
          endColour: [80, 200, 255, 0],
        },
        interval: [100, 300],
      },
    ],
  },
  {
    id: 'necrotic-mist',
    pack: 'magic',
    layers: [
      {
        fx: {
          ...MIST,
          size: 80,
          startColour: [55, 85, 45, 0.5],
          startColourRandom: [10, 20, 10, 0.05],
          endColour: [20, 30, 20, 0],
        },
        interval: [500, 1200],
      },
      { fx: 'glow-death', interval: [4000, 9000] },
    ],
  },
  {
    id: 'holy-glimmer',
    pack: 'magic',
    layers: [
      {
        fx: {
          ...MOTES,
          maxParticles: 6,
          emissionRate: 3,
          duration: 10,
          size: 7,
          speed: 0.3,
          lifeSpan: 45,
          lifeSpanRandom: 15,
          startColour: [255, 245, 190, 1],
          startColourRandom: [0, 10, 40, 0],
          endColour: [255, 255, 255, 0],
        },
        interval: [150, 400],
      },
      { fx: 'glow-holy', interval: [3000, 7000] },
    ],
  },
  {
    id: 'swamp-gas',
    pack: 'magic',
    layers: [
      {
        fx: {
          ...MIST,
          size: 50,
          sizeRandom: 20,
          speed: 0.5,
          angle: 270,
          angleRandom: 60,
          lifeSpan: 110,
          duration: 10,
          startColour: [150, 200, 60, 0.45],
          endColour: [120, 160, 40, 0],
        },
        interval: [600, 1500],
      },
      { fx: 'bubbling-slime', interval: [1500, 4000] },
    ],
  },
];

export const PRESET_PACKS = ['weather', 'fire', 'water', 'magic'];
export const REGISTERED_PACK = 'custom';

/** @type {Map<string, Preset>} Presets other Mods registered this session. */
const registered = new Map();

const PRESET_ID = /^[a-z0-9][a-z0-9-]{0,39}$/;

/**
 * Returns every preset: the built-in ones, then those registered by other Mods.
 *
 * @returns {Preset[]} Presets.
 */
export function allPresets() {
  return [...BUILTIN_PRESETS, ...registered.values()];
}

/**
 * Finds a preset by ID, ignoring case.
 *
 * @param {string} id Preset ID.
 * @returns {Preset|undefined} Preset.
 */
export function getPreset(id) {
  const key = toText(id).toLowerCase();
  return allPresets().find((p) => p.id === key);
}

/**
 * Returns a preset's name in a language.
 *
 * @param {Preset} preset Preset.
 * @param {string} lang Locale.
 * @returns {string} Name.
 */
export function presetName(preset, lang) {
  return preset.name || t(`presets.${preset.id}`, lang);
}

/**
 * Turns a preset layer's effect into a spec.
 *
 * @param {string|object} fx Built-in name, saved FX name, or definition.
 * @param {string} label Name of the custom FX object made for a definition.
 * @returns {{ok: true, fx: object} | {ok: false, error: string, vars?: object}} Spec.
 */
function layerSpec(fx, label) {
  if (isRecord(fx)) {
    return {
      ok: true,
      fx: { kind: 'custom', value: completeDefinition(fx), shared: truncate(label, 60) },
    };
  }
  return parseFxSpec(fx);
}

/**
 * Builds the layers an effect gets from a preset.
 *
 * @param {Preset} preset Preset.
 * @param {string} lang Locale for the custom FX names.
 * @returns {import('./state.js').Layer[]} Layers.
 */
export function presetLayers(preset, lang) {
  const name = presetName(preset, lang);
  return preset.layers.map((layer, index) => {
    const spec = layerSpec(layer.fx, `${name} ${index + 1}`);
    const fx = spec.ok ? spec.fx : null;
    return cleanLayer({
      fx,
      interval: layer.interval,
      direction:
        layer.direction === undefined
          ? fx && isBeamSpec(fx)
            ? 'random'
            : null
          : cleanDirection(layer.direction),
      error: spec.ok ? null : spec.error,
    });
  });
}

/**
 * Adds a preset from another Mod, for this session. Built-in presets cannot
 * be replaced; a registered one can.
 *
 * @param {string} id Preset ID: lower-case letters, digits and hyphens.
 * @param {object} definition Preset.
 * @param {string} definition.name Name shown in menus.
 * @param {Array<{fx: string|object, interval?: number|number[], direction?: *}>} definition.layers
 *   Layers (at least one).
 * @returns {{ok: boolean, error?: string}} Result; error is a short reason.
 */
export function registerPreset(id, definition) {
  const key = toText(id).toLowerCase();
  if (!PRESET_ID.test(key)) {
    return { ok: false, error: 'bad id' };
  }
  if (BUILTIN_PRESETS.some((p) => p.id === key)) {
    return { ok: false, error: 'built-in preset' };
  }
  if (!isRecord(definition) || !Array.isArray(definition.layers)) {
    return { ok: false, error: 'no layers' };
  }
  const layers = definition.layers.slice(0, MAX_LAYERS).filter((l) => isRecord(l) && l.fx);
  if (layers.length === 0) {
    return { ok: false, error: 'no layers' };
  }
  for (const layer of layers) {
    if (!isRecord(layer.fx)) {
      const parsed = parseFxSpec(layer.fx);
      if (!parsed.ok) {
        return { ok: false, error: parsed.error };
      }
    }
  }
  registered.set(key, {
    id: key,
    pack: REGISTERED_PACK,
    name: truncate(toText(definition.name) || key, MAX_NAME_LENGTH),
    layers: layers.map((l) => ({
      fx: isRecord(l.fx) ? { ...l.fx } : toText(l.fx),
      interval: cleanInterval([l.interval ?? 500].flat()),
      direction: l.direction,
    })),
  });
  return { ok: true };
}
