// ===========================
// === HealthColors v2.3.0 ===
// ===========================

// AUTHORS:
//  - DXWarlock: https://app.roll20.net/users/262130/dxwarlock
//  - Surok: https://app.roll20.net/users/335573/surok
//  - MidNiteShadow7: https://app.roll20.net/users/16506286/midniteshadow7

/* global createObj TokenMod SmartAoE spawnFxWithDefinition spawnFx spawnFxBetweenPoints getObj state globalconfig playerIsGM sendChat findObjs Campaign log on getSheetItem */

var HealthColors =
  HealthColors ||
  (() => {
    'use strict';

    // ————— CONSTANTS —————
    const VERSION = '2.3.0';
    const SCRIPT_NAME = 'HealthColors';
    const SCHEMA_VERSION = '1.1.0';
    const UPDATED = '2026-10-07 21:00 UTC';

    // ————— DEFAULTS —————
    /**
     * Default values written into `state.HealthColors` on first install or after a reset.
     * Every key maps directly to a property used at runtime — changing a value here changes
     * the out-of-the-box behavior for new or reset campaigns.
     *
     * @property {boolean} auraColorOn  - Master on/off switch for the whole script.
     * @property {string}  auraBar      - Which token bar to read HP from ('bar1'|'bar2'|'bar3'|'bar4').
     * @property {boolean} auraTint     - When true, colors the token tint instead of the aura rings.
     * @property {number}  auraPercPC   - HP % threshold below which the PC aura activates (0–100).
     * @property {number}  auraPerc     - HP % threshold below which the NPC aura activates (0–100).
     * @property {boolean} PCAura       - Whether to show a health aura on player-character tokens.
     * @property {boolean} NPCAura      - Whether to show a health aura on monster/NPC tokens.
     * @property {boolean} auraDeadPC   - Whether to mark a PC token with the dead status at 0 HP.
     * @property {boolean} auraDead     - Whether to mark an NPC token with the dead status at 0 HP.
     * @property {string}  GM_PCNames   - GM visibility of PC token names ('Yes'|'No'|'Off').
     * @property {string}  PCNames      - Player visibility of PC token names ('Yes'|'No'|'Off').
     * @property {string}  GM_NPCNames  - GM visibility of NPC token names ('Yes'|'No'|'Off').
     * @property {string}  NPCNames     - Player visibility of NPC token names ('Yes'|'No'|'Off').
     * @property {number}  AuraSize     - Page units (usually feet) the aura extends beyond the token edge.
     * @property {string}  Aura1Shape   - Shape applied to the Aura 1 health ring in aura mode: a Roll20 shape
     *                                      (Circle, Square, Hex, Circle Border, Square Border, Hex Border),
     *                                      Auto / Auto Border (hex on hex-grid pages, circle otherwise), or
     *                                      Keep (leave each token's own shape alone).
     * @property {number}  auraOpacity  - Aura 1 health-ring opacity in percent (100 = solid, as before).
     * @property {boolean} auraLockPlayers - When true (aura mode), controlling players cannot edit Aura 1.
     * @property {string}  Aura1Color   - Reference value only (aura mode colours Aura 1 by health).
     * @property {number}  Aura2Size    - Reference value only; Aura 2 is never changed by the script.
     * @property {string}  Aura2Shape   - Reference value only; Aura 2 is never changed by the script.
     * @property {string}  Aura2Color   - Reference value only; Aura 2 is never changed by the script.
     * @property {boolean} OneOff       - When true, tokens without a linked character also get auras.
     * @property {boolean} FX           - Whether to spawn particle FX on HP changes.
     * @property {string}  HealFX       - Healing effect: a hex color (no '#') that recolours the default particle
     *                                      burst, a Roll20 built-in effect name (`glow-holy`), or a custom FX name.
     * @property {string}  HurtFX       - Hurt/damage effect; same formats as HealFX (default a red particle burst).
     * @property {string}  auraDeadFX   - Jukebox track name to play on death, or 'None' to disable.
     * @property {string}  colorPalette - Health aura colour palette ('default'|'colorblind').
     * @property {boolean} deathSavesOn   - Master toggle for the optional Death Save Integration (off by default).
     * @property {string}  dsSuccessAttr  - Death-save success attribute name(s); single name or comma-separated list
     *                                      of boolean checkboxes (D&D sheets use three). Read via the `@{}` chat parser
     *                                      through the generated Death-Saves macro, since the API can't read Beacon sheets.
     * @property {string}  dsFailureAttr  - Death-save failure attribute name(s); same single-or-list format.
     * @property {string}  dsDyingMarker  - Roll20 status marker for a dying PC at 0 HP (default 'skull'; for the D&D
     *                                      "Unconscious" condition marker use its exact tag from `!aura deathsaves markers`).
     * @property {string}  dsStableMarker - Roll20 status marker for a stable PC (3 successes) (default 'green').
     */
    const DEFAULTS = {
      auraColorOn: true,
      auraBar: 'bar1',
      auraTint: false,
      auraPercPC: 100,
      auraPerc: 100,
      PCAura: true,
      NPCAura: true,
      auraDeadPC: true,
      auraDead: true,
      GM_PCNames: 'Yes',
      PCNames: 'Yes',
      GM_NPCNames: 'Yes',
      NPCNames: 'Yes',
      AuraSize: 0.35,
      Aura1Shape: 'Auto',
      auraOpacity: 100,
      auraLockPlayers: true,
      Aura1Color: '00FF00',
      Aura2Size: 5,
      Aura2Shape: 'Square',
      Aura2Color: '806600',
      OneOff: false,
      FX: true,
      HealFX: 'FDDC5C',
      HurtFX: 'FF0000',
      auraDeadFX: 'None',
      colorPalette: 'default',
      deathSavesOn: false,
      dsSuccessAttr: 'deathsave_succ1,deathsave_succ2,deathsave_succ3',
      dsFailureAttr: 'deathsave_fail1,deathsave_fail2,deathsave_fail3',
      dsDyingMarker: 'skull',
      dsStableMarker: 'green',
    };

    const COLOR_PALETTES = {
      default: {
        high: [0, 255, 0], // green
        mid: [255, 255, 0], // yellow
        low: [255, 0, 0], // red
        dead: [0, 0, 0], // black
      },
      colorblind: {
        high: [51, 187, 238], // cyan
        mid: [238, 119, 51], // orange
        low: [204, 51, 17], // magenta
        dead: [0, 0, 0], // black
      },
    };

    // ————— BUILT-IN FX —————
    /**
     * Roll20's built-in particle-effect vocabulary. A built-in effect name is `<type>-<colour>`
     * (e.g. `glow-holy`, `explode-blood`), exactly as shown in the in-game Effects menu.
     * Directional types (beam, breath, splatter) need a start and end point, so they are
     * spawned with `spawnFxBetweenPoints` from the token's own position.
     */
    const BUILTIN_FX_TYPES = [
      'beam',
      'bomb',
      'breath',
      'bubbling',
      'burn',
      'burst',
      'explode',
      'glow',
      'missile',
      'nova',
      'splatter',
    ];
    const BUILTIN_FX_COLORS = [
      'acid',
      'blood',
      'charm',
      'death',
      'fire',
      'frost',
      'holy',
      'magic',
      'slime',
      'smoke',
      'water',
    ];
    const DIRECTIONAL_FX_TYPES = new Set(['beam', 'breath', 'splatter']);
    const BUILTIN_FX_PATTERN = new RegExp(`^(${BUILTIN_FX_TYPES.join('|')})-(${BUILTIN_FX_COLORS.join('|')})$`);

    /**
     * Seed definition for the '-DefaultHurt' Roll20 custom FX object created at install.
     * Models a downward-falling burst (blood/debris) triggered when a token loses HP.
     * `startColour` and `endColour` are placeholder zeroes — they are overwritten at
     * runtime with the value of `state.HealthColors.HurtFX` (or a per-character override)
     * before the FX is spawned, so changing them here has no visible effect.
     *
     * @property {number}   maxParticles   - Maximum simultaneous particles in the burst.
     * @property {number}   duration       - How long (in frames) the emitter runs.
     * @property {number}   size           - Base particle diameter before scale is applied.
     * @property {number}   sizeRandom     - Random variance added to each particle's size.
     * @property {number}   lifeSpan       - Frames each particle lives before fading.
     * @property {number}   lifeSpanRandom - Random variance added to each particle's lifespan.
     * @property {number}   speed          - Base particle speed before scale is applied.
     * @property {number}   speedRandom    - Random variance added to each particle's speed.
     * @property {{x:number,y:number}} gravity - Per-frame acceleration applied to all particles.
     * @property {number}   angle          - Emission direction in degrees (270 = straight down).
     * @property {number}   angleRandom    - Cone spread around the emission angle.
     * @property {number}   emissionRate   - Particles emitted per frame while the emitter is active.
     * @property {number[]} startColour    - RGBA start colour placeholder; overwritten at runtime.
     * @property {number[]} endColour      - RGBA end colour placeholder; overwritten at runtime.
     */
    const DEFAULT_HURT_FX = {
      maxParticles: 150,
      duration: 50,
      size: 10,
      sizeRandom: 3,
      lifeSpan: 25,
      lifeSpanRandom: 5,
      speed: 8,
      speedRandom: 3,
      gravity: { x: 0.01, y: 0.65 },
      angle: 270,
      angleRandom: 25,
      emissionRate: 100,
      startColour: [0, 0, 0, 0],
      endColour: [0, 0, 0, 0],
    };

    /**
     * Seed definition for the '-DefaultHeal' Roll20 custom FX object created at install.
     * Models a soft omnidirectional sparkle/glow triggered when a token regains HP.
     * Like DEFAULT_HURT_FX, `startColour` and `endColour` are placeholders overwritten
     * at runtime with `state.HealthColors.HealFX` before the FX is spawned.
     *
     * @property {number}   maxParticles   - Maximum simultaneous particles in the burst.
     * @property {number}   duration       - How long (in frames) the emitter runs.
     * @property {number}   size           - Base particle diameter before scale is applied.
     * @property {number}   sizeRandom     - Random variance added to each particle's size (larger
     *                                       than hurt to produce a softer, more diffuse bloom).
     * @property {number}   lifeSpan       - Frames each particle lives before fading.
     * @property {number}   lifeSpanRandom - Random variance added to each particle's lifespan.
     * @property {number}   speed          - Base particle speed (slow drift upward).
     * @property {number}   speedRandom    - Random variance added to each particle's speed.
     * @property {number}   angle          - Emission direction in degrees (0 = straight up).
     * @property {number}   angleRandom    - 180° spread produces full omnidirectional emission.
     * @property {number}   emissionRate   - Very high rate creates a dense initial burst.
     * @property {number[]} startColour    - RGBA start colour placeholder; overwritten at runtime.
     * @property {number[]} endColour      - RGBA end colour placeholder; overwritten at runtime.
     */
    const DEFAULT_HEAL_FX = {
      maxParticles: 150,
      duration: 50,
      size: 10,
      sizeRandom: 15,
      lifeSpan: 50,
      lifeSpanRandom: 30,
      speed: 0.5,
      speedRandom: 2,
      angle: 0,
      angleRandom: 180,
      emissionRate: 1000,
      startColour: [0, 0, 0, 0],
      endColour: [0, 0, 0, 0],
    };

    /**
     * Fallback baseline merged into every FX definition by `spawnFX` before spawning.
     * This is NOT a Roll20 custfx object — it is a local safety net that ensures
     * `spawnFX` never passes `undefined` for a required Roll20 FX field when a custom
     * or per-character definition omits optional properties.
     * Merge order: `{ ...FX_PARAM_DEFAULTS, ...userDefinition }`, so any property
     * present in the real definition takes precedence over these fallbacks.
     *
     * @property {number}   maxParticles   - Fallback particle count.
     * @property {number}   duration       - Fallback emitter duration (frames).
     * @property {number}   size           - Fallback particle size.
     * @property {number}   sizeRandom     - Fallback size variance.
     * @property {number}   lifeSpan       - Fallback particle lifespan (frames).
     * @property {number}   lifeSpanRandom - Fallback lifespan variance.
     * @property {number}   speed          - Fallback particle speed (0 = stationary).
     * @property {number}   speedRandom    - Fallback speed variance.
     * @property {number}   angle          - Fallback emission angle in degrees.
     * @property {number}   angleRandom    - Fallback angular spread.
     * @property {number}   emissionRate   - Fallback particles emitted per frame.
     * @property {number[]} startColour        - Fallback RGBA start colour (British spelling; opaque grey).
     * @property {number[]} startColor         - Fallback RGBA start color (American spelling; same value).
     * @property {number[]} endColour          - Fallback RGBA end colour (British spelling; opaque black).
     * @property {number[]} endColor           - Fallback RGBA end color (American spelling; same value).
     * @property {number[]} startColourRandom  - Fallback start colour randomization (zeroed).
     * @property {number[]} startColorRandom   - Fallback start color randomization (zeroed).
     * @property {number[]} endColourRandom    - Fallback end colour randomization (zeroed).
     * @property {number[]} endColorRandom     - Fallback end color randomization (zeroed).
     * @property {{x:number,y:number}} gravity - Fallback gravity (none).
     */
    const FX_PARAM_DEFAULTS = {
      maxParticles: 100,
      duration: 100,
      size: 15,
      sizeRandom: 5,
      lifeSpan: 50,
      lifeSpanRandom: 20,
      speed: 1,
      speedRandom: 1,
      angle: 0,
      angleRandom: 0,
      emissionRate: 10,
      startColour: [128, 128, 128, 1],
      startColor: [128, 128, 128, 1],
      endColour: [0, 0, 0, 1],
      endColor: [0, 0, 0, 1],
      startColourRandom: [0, 0, 0, 0],
      startColorRandom: [0, 0, 0, 0],
      endColourRandom: [0, 0, 0, 0],
      endColorRandom: [0, 0, 0, 0],
      gravity: { x: 0, y: 0 },
    };

    // ————— UTILITIES —————
    /**
     * Converts a health percentage (0–100+) to a hex color using the active palette.
     * Values above 100% return blue; 0% uses dead; 1–100 interpolate low→mid→high.
     *
     * @param {number} pct - Health percentage.
     * @returns {string} A 6-digit hex color string, e.g. '#FF0000'.
     */
    function percentToHex(pct) {
      const normalizedPct = Math.max(0, Number(pct) || 0);
      if (normalizedPct > 100) return '#0000FF';
      const paletteName = state?.HealthColors?.colorPalette || 'default';
      const { high, mid, low, dead } = COLOR_PALETTES[paletteName] || COLOR_PALETTES.default;
      const rgbToHex = (rgb) =>
        // eslint-disable-next-line no-bitwise
        `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`;

      if (normalizedPct === 0) {
        return rgbToHex(dead);
      }

      const t = normalizedPct >= 50 ? (normalizedPct - 50) / 50 : normalizedPct / 50;
      const from = normalizedPct >= 50 ? mid : low;
      const to = normalizedPct >= 50 ? high : mid;
      const r = Math.round(from[0] + (to[0] - from[0]) * t);
      const g = Math.round(from[1] + (to[1] - from[1]) * t);
      const b = Math.round(from[2] + (to[2] - from[2]) * t);
      return rgbToHex([r, g, b]);
    }

    /**
     * Parses a hex color string into an RGBA array suitable for Roll20 FX definitions.
     * Returns [0,0,0,0] when the input is invalid.
     *
     * @param {string} hex - Hex color string with or without leading '#'.
     * @returns {number[]} Array of [r, g, b, a] where a is always 1.0 on success.
     */
    function hexToRgb(hex) {
      const cleanHex = (hex || '').replace('#', '').trim();
      const parts = /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(cleanHex);
      if (parts) {
        const rgb = parts.slice(1).map((d) => Number.parseInt(d, 16));
        rgb.push(1);
        return rgb;
      }
      // Log invalid hex attempts if they appear non-empty
      if (cleanHex) log(`${SCRIPT_NAME}: hexToRgb received invalid hex: "${hex}"`);
      return [0, 0, 0, 0];
    }

    /**
     * Returns a random integer between min and max inclusive.
     *
     * @param {number} min - Lower bound (inclusive).
     * @param {number} max - Upper bound (inclusive).
     * @returns {number} Random integer in [min, max].
     */
    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min; // NOSONAR — cosmetic FX variance, not security-sensitive
    }

    /**
     * Creates a plain-object snapshot of a Roll20 API object or any serialisable value.
     * Uses JSON round-trip rather than structuredClone so that Roll20 proxy objects have
     * their toJSON() method called, producing a plain object whose properties are
     * accessible directly (e.g. prev.bar1_value) rather than through .get().
     *
     * @param {object} obj - Roll20 API object or plain object to snapshot.
     * @returns {object} Plain object deep copy.
     */
    function deepClone(obj) {
      return JSON.parse(JSON.stringify(obj)); // NOSONAR — intentional: triggers Roll20 proxy toJSON()
    }

    /**
     * Normalizes a 6-digit hex color string (without '#').
     * Returns fallback when input is invalid.
     *
     * @param {string} value    - Candidate hex string.
     * @param {string} fallback - Fallback value when invalid.
     * @returns {string} Uppercase 6-digit hex.
     */
    function normalizeHex6(value, fallback) {
      const cleaned = (value || '').replace('#', '').trim().toUpperCase();
      return /^[0-9A-F]{6}$/.test(cleaned) ? cleaned : fallback;
    }

    /**
     * Returns true when the value is a 6-digit hex colour, with or without a leading '#'.
     *
     * @param {string} value - Candidate value.
     * @returns {boolean} True for a 6-digit hex colour.
     */
    function isHex6(value) {
      return /^#?[0-9A-Fa-f]{6}$/.test(
        String(value ?? '')
          .trim()
          .replace('#', ''),
      );
    }

    /**
     * Returns true when the value is a Roll20 built-in effect name (`<type>-<colour>`).
     *
     * @param {string} value - Candidate value (case-insensitive).
     * @returns {boolean} True for a known built-in effect name.
     */
    function isBuiltinFxName(value) {
      return BUILTIN_FX_PATTERN.test(
        String(value ?? '')
          .trim()
          .toLowerCase(),
      );
    }

    /**
     * Returns true when a per-character FX override disables FX (`OFF` or `NO`, any case).
     *
     * @param {string|undefined} value - Attribute value.
     * @returns {boolean} True when FX are switched off for the character.
     */
    function isFxOff(value) {
      return /^(OFF|NO)$/i.test(String(value ?? '').trim());
    }

    /**
     * Finds a campaign custom FX object by name (case-insensitive) or by object id.
     *
     * @param {string} nameOrId - Custom FX name or Roll20 object id.
     * @returns {object|undefined} The custfx object, or undefined when none matches.
     */
    function findCustomFx(nameOrId) {
      const key = String(nameOrId ?? '').trim();
      if (!key) return undefined;
      const byName = findObjs({ _type: 'custfx', name: key }, { caseInsensitive: true })[0];
      if (byName) return byName;
      return getObj('custfx', key) || undefined;
    }

    /**
     * Classifies a heal/hurt FX value (global setting or per-character override entry).
     *
     * @param {string} value - Hex colour, built-in effect name, or custom FX name/id.
     * @returns {{kind:'colour',hex:string}|{kind:'builtin',name:string}|{kind:'custom',name:string,fxObj:object}|null}
     *          The classified choice, or null when the value is blank or names nothing known.
     */
    function classifyFxValue(value) {
      const raw = String(value ?? '').trim();
      if (!raw) return null;
      if (isHex6(raw)) return { kind: 'colour', hex: raw.replace('#', '').toUpperCase() };
      if (isBuiltinFxName(raw)) return { kind: 'builtin', name: raw.toLowerCase() };
      const fxObj = findCustomFx(raw);
      if (fxObj) return { kind: 'custom', name: String(fxObj.get('name') || raw).trim(), fxObj };
      return null;
    }

    /**
     * Normalizes a `!aura heal` / `!aura hurt` argument. Accepts a hex colour, a Roll20
     * built-in effect name, or a custom FX name/id (stored by its canonical name).
     * `default` restores the shipped colour. Anything else keeps the fallback and warns the GM.
     *
     * @param {string} value        - Raw command argument.
     * @param {string} fallback     - Current setting, kept when the input is invalid.
     * @param {string} label        - 'heal' or 'hurt' (for messages).
     * @param {string} defaultValue - Shipped default for this setting.
     * @returns {string} The normalized setting value.
     */
    function normalizeFxSetting(value, fallback, label, defaultValue) {
      const raw = String(value ?? '').trim();
      if (!raw) return fallback;
      if (raw.toUpperCase() === 'DEFAULT') return defaultValue;
      const choice = classifyFxValue(raw);
      if (!choice) {
        gmWhisper(
          `⚠ Unknown ${label} FX "${escapeForChat(raw)}". Use a hex colour (e.g. FDDC5C), a built-in effect such as glow-holy, or a custom FX name/id from <strong>!aura listfx</strong>. Keeping "${escapeForChat(fallback)}".`,
        );
        return fallback;
      }
      return choice.kind === 'colour' ? choice.hex : choice.name;
    }

    // ————— AURA SHAPES —————
    /**
     * Roll20 aura shapes (Token Settings → Aura → Shape), keyed by display label, mapped to the
     * `aura1_options` / `aura2_options` API value. Roll20 keeps `aura1_square` in sync itself.
     */
    const AURA_SHAPES = Object.freeze({
      Circle: 'circle',
      Square: 'square',
      Hex: 'hex',
      'Circle Border': 'circleborder',
      'Square Border': 'squareborder',
      'Hex Border': 'hexborder',
    });

    /**
     * HealthColors-only Aura 1 choices: Auto picks hex on hex-grid pages and circle otherwise
     * (Auto Border uses the outline versions); Keep never touches the token's shape.
     */
    const AURA1_SPECIAL_SHAPES = Object.freeze(['Auto', 'Auto Border', 'Keep']);

    /** Roll-query option list for the Aura 1 shape prompt. */
    const AURA1_SHAPE_CHOICES = [...AURA1_SPECIAL_SHAPES, ...Object.keys(AURA_SHAPES)].join('|');

    /** Roll-query option list for the Aura 2 (reference-only) shape prompt. */
    const AURA2_SHAPE_CHOICES = Object.keys(AURA_SHAPES).join('|');

    /**
     * Normalizes an aura shape to its display label. Accepts the label, the API value or any
     * spacing/punctuation variant ("Circle Border", "circleborder", "circle-border", "circle_border").
     *
     * @param {string}  value            - Candidate shape value.
     * @param {string}  fallback         - Fallback shape.
     * @param {boolean} [allowSpecial]   - Also accept Auto, Auto Border and Keep (Aura 1 only).
     * @returns {string} A display label from AURA_SHAPES (or AURA1_SPECIAL_SHAPES).
     */
    function normalizeShape(value, fallback, allowSpecial = true) {
      const squash = (v) =>
        String(v ?? '')
          .toLowerCase()
          .replace(/[^a-z]/g, '');
      const wanted = squash(value);
      if (!wanted) return fallback;
      const labels = allowSpecial ? [...AURA1_SPECIAL_SHAPES, ...Object.keys(AURA_SHAPES)] : Object.keys(AURA_SHAPES);
      return labels.find((label) => squash(label) === wanted) || fallback;
    }

    /**
     * Resolves the configured Aura 1 shape for a token into a Roll20 `aura1_options` value.
     * Auto / Auto Border look at the token's page grid (`hex` or `hexr` → hex shapes). Roll20 draws
     * hex auras in whole grid cells, so a radius under one cell (e.g. the default 0.35) would show
     * almost nothing; Auto then uses the circle shapes instead.
     *
     * @param {object} obj - Roll20 token graphic object.
     * @returns {string|null} API shape value, or null when the shape should be left alone (Keep).
     */
    function resolveAura1Shape(obj) {
      const label = normalizeShape(state.HealthColors.Aura1Shape, DEFAULTS.Aura1Shape);
      if (label === 'Keep') return null;
      if (label === 'Auto' || label === 'Auto Border') {
        const page = getObj('page', obj.get('_pageid'));
        const gridType = String(page?.get('grid_type') || '').toLowerCase();
        const cellUnits = (Number(page?.get('scale_number')) || 5) * (Number(page?.get('snapping_increment')) || 1);
        const fillsACell = Number(state.HealthColors.AuraSize) >= cellUnits;
        const base = gridType.startsWith('hex') && fillsACell ? 'hex' : 'circle';
        return label === 'Auto Border' ? `${base}border` : base;
      }
      return AURA_SHAPES[label] || 'circle';
    }

    /**
     * Applies the configured Aura 1 opacity to a `#rrggbb` colour by appending a two-digit
     * alpha channel (Roll20 accepts `#rrggbbaa` for auras). 100% returns the colour unchanged.
     *
     * @param {string} hex - Colour in `#rrggbb` form.
     * @returns {string} `#rrggbb` or `#rrggbbaa`.
     */
    function withAuraOpacity(hex) {
      const pct = normalizePercent(state.HealthColors.auraOpacity, 100);
      if (pct >= 100 || !/^#[0-9a-f]{6}$/i.test(hex)) return hex;
      const alpha = Math.round((pct / 100) * 255)
        .toString(16)
        .padStart(2, '0');
      return `${hex}${alpha}`;
    }

    /**
     * Normalizes a palette name to one of the supported keys.
     *
     * @param {string} value    - Candidate palette key.
     * @param {string} fallback - Fallback palette key when invalid.
     * @returns {string} A valid palette key from COLOR_PALETTES.
     */
    function normalizePalette(value, fallback) {
      const p = (value || '').trim().toLowerCase();
      return COLOR_PALETTES[p] ? p : fallback;
    }

    /**
     * Normalizes a percentage setting to an integer between 0 and 100.
     *
     * @param {string|number} value    - Candidate percentage.
     * @param {number}        fallback - Fallback percentage when invalid.
     * @returns {number} A valid percentage value.
     */
    function normalizePercent(value, fallback) {
      const parsed = Number.parseInt(value, 10);
      return Number.isInteger(parsed) && parsed >= 0 && parsed <= 100 ? parsed : fallback;
    }

    /**
     * Normalizes a positive numeric setting.
     *
     * @param {string|number} value    - Candidate numeric value.
     * @param {number}        fallback - Fallback value when invalid.
     * @returns {number} A valid non-negative number.
     */
    function normalizePositiveNumber(value, fallback) {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    }

    /**
     * Normalizes a Yes/No/Off style setting.
     *
     * @param {string} value    - Candidate setting value.
     * @param {string} fallback - Fallback value when invalid.
     * @returns {string} One of Yes, No, or Off.
     */
    function normalizeYesNoOff(value, fallback) {
      const normalized = (value || '').trim().toUpperCase();
      if (normalized === 'YES') return 'Yes';
      if (normalized === 'NO') return 'No';
      if (normalized === 'OFF') return 'Off';
      return fallback;
    }

    /**
     * Normalizes a death sound track name.
     *
     * @param {string} value    - Candidate track name.
     * @param {string} fallback - Fallback track name when invalid.
     * @returns {string} A trimmed track name or None.
     */
    function normalizeTrackName(value, fallback) {
      const normalized = (value || '').trim();
      if (!normalized) return fallback;
      return normalized.toUpperCase() === 'NONE' ? 'None' : normalized;
    }

    /**
     * Normalizes a Roll20 status-marker tag. Trims and strips a leading 'status_' prefix
     * but PRESERVES case and any `::id` suffix — custom/library markers (e.g. the D&D
     * "Unconscious" condition) carry exact tags like `Unconscious::1234567` that must not
     * be lowercased, or the marker won't render. An empty value is allowed and means the
     * marker channel is disabled.
     *
     * @param {string} value    - Candidate marker tag (e.g. 'skull', 'status_green', 'Unconscious::123').
     * @param {string} fallback - Fallback marker tag when value is omitted.
     * @returns {string} A bare marker tag suitable for `status_<tag>`, or empty when disabled.
     */
    function normalizeMarkerName(value, fallback) {
      if (value === undefined || value === null) return fallback;
      return String(value)
        .trim()
        .replace(/^status_/i, '');
    }

    /**
     * Escapes text for safe display in a chat whisper. Converts HTML-significant and
     * Roll20-parser-significant characters to HTML entities so arbitrary sheet content
     * (attribute names/values that contain `@{}`, `%{}`, `[[ ]]`, `?{}`, `#macro`, etc.)
     * is shown literally instead of being executed — which would emit "Unable to find
     * ability …" / roll SyntaxError noise. Use for any sheet/marker-derived debug output.
     *
     * @param {string|number|undefined} text - Raw text to display.
     * @returns {string} Entity-escaped, display-safe text.
     */
    function escapeForChat(text) {
      const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '[': '&#91;',
        ']': '&#93;',
        '{': '&#123;',
        '}': '&#125;',
        '@': '&#64;',
        '%': '&#37;',
        '?': '&#63;',
        '#': '&#35;',
        '|': '&#124;',
        '`': '&#96;',
        '~': '&#126;',
      };
      // Single pass: each source char is replaced once, so the inserted entities (which
      // themselves contain '&' and '#') are not re-escaped.
      return String(text ?? '').replace(/[&<>[\]{}@%?#|`~]/g, (ch) => entities[ch]);
    }

    /**
     * Splits a death-save attribute setting into individual attribute names.
     *
     * @param {string} config - Single name or comma-separated list.
     * @returns {string[]} Trimmed, non-empty attribute names.
     */
    function parseAttrList(config) {
      return String(config || '')
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
    }

    /**
     * Normalizes a death-save attribute setting (single name or comma-separated list),
     * trimming whitespace and dropping empty entries. Returns fallback when blank.
     *
     * @param {string} value    - Candidate attribute name or list.
     * @param {string} fallback - Fallback when blank.
     * @returns {string} Cleaned, comma-joined setting or the fallback.
     */
    function normalizeAttrName(value, fallback) {
      return parseAttrList(value).join(',') || fallback;
    }

    /**
     * Builds likely alias field names for a watched death-save attribute.
     * This helps bridge naming differences across sheet versions (e.g. succ/success).
     *
     * @param {string} attrName - Raw configured attribute name.
     * @returns {string[]} Lowercase unique candidate names.
     */
    function getDeathSaveAttrAliases(attrName) {
      const base = String(attrName || '')
        .trim()
        .toLowerCase();
      if (!base) return [];

      const variants = new Set([base]);
      const swapPairs = [
        ['succ', 'success'],
        ['success', 'succ'],
        ['fail', 'failure'],
        ['failure', 'fail'],
      ];

      for (const [fromWord, toWord] of swapPairs) {
        if (base.includes(fromWord)) variants.add(base.replace(fromWord, toWord));
      }

      return [...variants].filter(Boolean);
    }

    /**
     * Returns the expanded unique probe field set for watched attributes.
     *
     * @param {string[]} watched - Configured watched attribute names.
     * @returns {string[]} Watched names plus alias candidates.
     */
    function getDeathSaveProbeFieldSet(watched) {
      return [
        ...new Set(
          watched
            .flatMap((name) => getDeathSaveAttrAliases(name))
            .map((name) =>
              String(name || '')
                .trim()
                .toLowerCase(),
            )
            .filter(Boolean),
        ),
      ];
    }

    /**
     * Returns the probe candidates for configured fields that did not resolve from
     * legacy attribute objects. When any alias of a configured field already resolved,
     * every alias of that field is skipped. The game-wide field-name status cache then
     * narrows the rest: names known 'bad' are never asked for (both getSheetItem and
     * chat probes make Roll20 log an uncatchable sandbox error per unknown name), and
     * once any alias of a field is known 'ok', only the known-good aliases are used.
     *
     * @param {string[]} watched - Configured watched attribute names.
     * @param {object} snapshot  - Snapshot map built from legacy attribute objects.
     * @param {object} status    - Game-wide field-name status map ('ok'|'bad').
     * @returns {string[]} Unique alias names still requiring fallback resolution.
     */
    function getDeathSaveMissingProbeFields(watched, snapshot, status) {
      const missing = [];
      for (const name of watched) {
        const aliases = getDeathSaveAttrAliases(name);
        if (aliases.some((alias) => snapshot?.[alias]?.exists)) continue;
        const usable = aliases.filter((alias) => status?.[alias] !== 'bad');
        const known = usable.filter((alias) => status?.[alias] === 'ok');
        missing.push(...(known.length ? known : usable));
      }
      return [...new Set(missing)];
    }

    /**
     * Resolves the best available snapshot entry for a configured watched field.
     * Prefers checked/truthy values when multiple alias candidates exist.
     *
     * @param {object} snapshot  - Snapshot map keyed by watched/probed names.
     * @param {string} attrName  - Configured watched field name.
     * @returns {{exists:boolean, value:string, source:string}} Resolved entry.
     */
    function resolveDeathSaveSnapshotEntry(snapshot, attrName) {
      const candidates = getDeathSaveAttrAliases(attrName);
      let first = null;

      for (const candidate of candidates) {
        const entry = snapshot?.[candidate];
        if (!entry?.exists) continue;
        const value = String(entry.value ?? '');
        if (!first) first = { exists: true, value, source: candidate };
        if (isTruthyAttr(value)) return { exists: true, value, source: candidate };
      }

      return (
        first || {
          exists: false,
          value: '',
          source: String(attrName || '')
            .trim()
            .toLowerCase(),
        }
      );
    }

    /**
     * Interprets a single resolved death-save value as a ticked checkbox. Strict on
     * purpose: only the known "checked" values count (the 2024 sheet returns 0/1, the
     * 2014 sheet returns 0/"on"), plus any positive number. Crucially, anything that
     * looks like an UNRESOLVED `@{}` reference (or other junk) counts as NOT ticked, so a
     * field that fails to resolve can't inflate the count and wrongly trigger "dead".
     *
     * @param {string|number|undefined} value - Resolved attribute value.
     * @returns {boolean} True only when the box is genuinely ticked.
     */
    function isTruthyAttr(value) {
      const v = String(value ?? '')
        .trim()
        .toLowerCase();
      if (v === '' || v.includes('@{') || v.includes('}')) return false;
      if (['1', 'on', 'true', 'yes', 'checked'].includes(v)) return true;
      const n = Number.parseFloat(v);
      return Number.isFinite(n) && n > 0;
    }

    /**
     * Counts death saves from a comma-separated, already-resolved value list. A single
     * numeric value is treated as a counter (e.g. "2" → 2); otherwise each entry is a
     * checkbox and the number of genuinely-ticked entries is returned. Unresolved `@{}`
     * references and junk never count.
     *
     * @param {string} csv - Comma-separated resolved values from the chat parser.
     * @returns {number} The death-save count.
     */
    function countDeathSaves(csv) {
      const values = String(csv || '')
        .split(',')
        .map((v) => v.trim());
      if (values.length === 1) {
        const n = Number.parseInt(values[0], 10);
        if (Number.isFinite(n)) return Math.max(0, n);
      }
      return values.reduce((acc, v) => acc + (isTruthyAttr(v) ? 1 : 0), 0);
    }

    // ————— ONE-CLICK OPTIONS (globalconfig) —————
    /**
     * Parses a One-Click checkbox/boolean option. Roll20 delivers a ticked checkbox as the
     * option's `value` string ('true' here) and an unticked one as false/'false'.
     *
     * @param {*}       value    - Raw option value.
     * @param {boolean} fallback - Current setting, kept when the value is unrecognised.
     * @returns {boolean} Parsed boolean.
     */
    function parseBooleanOption(value, fallback) {
      if (typeof value === 'boolean') return value;
      if (value === undefined || value === null) return fallback;
      const normalized = String(value).trim().toLowerCase();
      if (['true', '1', 'checked', 'on', 'yes'].includes(normalized)) return true;
      if (['false', '0', '', 'off', 'no'].includes(normalized)) return false;
      return fallback;
    }

    /**
     * Normalizes a One-Click health-bar option ('bar1' | 'bar2' | 'bar3' | 'bar4', any case).
     * bar4 needs the game's "Maximum Token Bubbles/Bars" setting raised to 4.
     *
     * @param {string} value    - Raw option value.
     * @param {string} fallback - Current setting.
     * @returns {string} A valid bar key.
     */
    function normalizeBarKey(value, fallback) {
      const bar = String(value ?? '')
        .trim()
        .toLowerCase();
      return /^bar[1-4]$/.test(bar) ? bar : fallback;
    }

    /**
     * One-Click `useroptions` → state normalizers, keyed by DEFAULTS key (the option `name`
     * in script.json is the same key). Each takes (rawValue, currentSetting) and returns
     * the value to store, so invalid input keeps the current setting.
     */
    const ONE_CLICK_NORMALIZERS = {
      auraColorOn: parseBooleanOption,
      auraBar: normalizeBarKey,
      auraTint: parseBooleanOption,
      auraPercPC: normalizePercent,
      auraPerc: normalizePercent,
      PCAura: parseBooleanOption,
      NPCAura: parseBooleanOption,
      auraDeadPC: parseBooleanOption,
      auraDead: parseBooleanOption,
      GM_PCNames: normalizeYesNoOff,
      PCNames: normalizeYesNoOff,
      GM_NPCNames: normalizeYesNoOff,
      NPCNames: normalizeYesNoOff,
      AuraSize: normalizePositiveNumber,
      Aura1Shape: normalizeShape,
      auraOpacity: (value, current) => {
        const pct = normalizePercent(value, current);
        return pct >= 1 ? pct : current;
      },
      auraLockPlayers: parseBooleanOption,
      Aura1Color: normalizeHex6,
      Aura2Size: normalizePositiveNumber,
      Aura2Shape: (value, current) => normalizeShape(value, current, false),
      Aura2Color: normalizeHex6,
      OneOff: parseBooleanOption,
      FX: parseBooleanOption,
      HealFX: (value, current) => normalizeFxSetting(value, current, 'heal', DEFAULTS.HealFX),
      HurtFX: (value, current) => normalizeFxSetting(value, current, 'hurt', DEFAULTS.HurtFX),
      auraDeadFX: normalizeTrackName,
      colorPalette: normalizePalette,
      deathSavesOn: parseBooleanOption,
      dsSuccessAttr: normalizeAttrName,
      dsFailureAttr: normalizeAttrName,
      dsDyingMarker: normalizeMarkerName,
      dsStableMarker: normalizeMarkerName,
    };

    /**
     * Returns this script's One-Click options branch from Roll20's `globalconfig`, or null.
     * Roll20 keys the branch by the script.json name (lower-cased, punctuation varies), so the
     * lookup accepts any key that normalizes to a name ending in "healthcolors".
     *
     * @returns {object|null} The options object (includes `lastsaved`), or null when absent.
     */
    function getOneClickOptions() {
      if (typeof globalconfig !== 'object' || globalconfig === null) return null;
      const normalizeKey = (key) =>
        String(key)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
      const key = Object.keys(globalconfig).find((k) => normalizeKey(k).endsWith('healthcolors'));
      const branch = key ? globalconfig[key] : null;
      return branch && typeof branch === 'object' ? branch : null;
    }

    /**
     * Applies One-Click install options to state when they are newer than the last applied
     * set (`globalconfig.<script>.lastsaved` vs `state.HealthColors.globalconfigCache.lastsaved`),
     * so in-game `!aura` changes survive restarts until the GM saves the One-Click dialog again.
     * Blank option values are ignored. Whispers the GM a summary of what changed and refreshes
     * tokens so the new settings take effect immediately.
     *
     * @returns {boolean} True when options were applied.
     */
    function applyOneClickOptions() {
      const s = state.HealthColors;
      if (!s.globalconfigCache || typeof s.globalconfigCache !== 'object') s.globalconfigCache = { lastsaved: 0 };
      const options = getOneClickOptions();
      if (!options) return false;
      const lastsaved = Number(options.lastsaved) || 0;
      if (lastsaved <= (Number(s.globalconfigCache.lastsaved) || 0)) return false;

      log(`${SCRIPT_NAME}: applying One-Click options saved ${new Date(lastsaved * 1000).toISOString()}`);
      const changed = [];
      Object.keys(ONE_CLICK_NORMALIZERS).forEach((key) => {
        const raw = options[key];
        if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) return;
        const next = ONE_CLICK_NORMALIZERS[key](typeof raw === 'boolean' ? raw : String(raw), s[key]);
        if (next !== s[key]) {
          changed.push({ key, from: s[key], to: next });
          s[key] = next;
        }
      });
      s.globalconfigCache = { lastsaved };

      if (changed.length === 0) {
        gmWhisper('One-Click options loaded: no settings changed.');
        return true;
      }
      const lines = changed.map(
        ({ key, from, to }) => `${key}: ${escapeForChat(String(from))} → <strong>${escapeForChat(String(to))}</strong>`,
      );
      gmWhisper(`Applied One-Click options:<br><div style="text-align:left">${lines.join('<br>')}</div>`);
      if (changed.some(({ key, to }) => key === 'deathSavesOn' && to === false)) clearAllDeathSaveMarkers();
      if (changed.some(({ key }) => key === 'auraTint')) {
        modeSwitch(s.auraTint);
      } else {
        menuForceUpdate();
      }
      return true;
    }

    // ————— WHISPER GM (declared early; used by checkInstall) —————
    /**
     * Sends a styled whisper message to the GM.
     *
     * @param {string} text - Message content (HTML allowed) to display in the message body.
     */
    function gmWhisper(text) {
      const outerStyle = [
        'width:100%',
        'border-radius:4px',
        'box-shadow:1px 1px 1px #707070',
        'margin:0px auto',
        'border:1px solid #000',
        'overflow:hidden',
      ].join(';');
      const headerStyle = [
        'background-color:#2e5d78',
        'color:#fff',
        'text-align:center',
        'font-weight:bold',
        'font-size:10pt',
        'padding:4px 8px',
        'letter-spacing:0.5px',
      ].join(';');
      const bodyStyle = [
        'background-image:-webkit-linear-gradient(-45deg,#a7c7dc 0%,#85b2d3 100%)',
        'color:#000',
        'text-align:center',
        'padding:3px 4px',
      ].join(';');
      sendChat(
        SCRIPT_NAME,
        `/w GM <div style='${outerStyle}'><div style='${headerStyle}'>${SCRIPT_NAME} v${VERSION}</div><div style='${bodyStyle}'>${text}</div></div>`,
      );
    }

    // ————— ATTRIBUTE CACHE —————
    /**
     * Creates a cached attribute lookup function that auto-refreshes on attribute
     * change or destruction and re-triggers handleToken for affected tokens.
     * Creates the attribute with the default value if it does not exist yet.
     *
     * @param {string}   attribute          - The Roll20 attribute name to track (e.g. 'USECOLOR').
     * @param {object}   [options={}]        - Configuration options.
     * @param {string}   [options.default]   - Value to use when the attribute is missing or invalid.
     * @param {Function} [options.validation]- Predicate that returns true for valid values.
     * @returns {Function} Lookup function accepting a character object and returning the current value.
     */
    function makeSmartAttrCache(attribute, options = {}) {
      const cache = {};
      const defaultValue = options.default || 'YES';
      const validator = options.validation || (() => true);

      on('change:attribute', (attr) => {
        if (attr.get('name') !== attribute) return;
        if (!validator(attr.get('current'))) attr.set('current', defaultValue);
        cache[attr.get('characterid')] = attr.get('current');
        findObjs({ type: 'graphic' })
          .filter((o) => o.get('represents') === attr.get('characterid'))
          .forEach((obj) => {
            const prev = deepClone(obj);
            handleToken(obj, prev, 'YES');
          });
      });

      on('destroy:attribute', (attr) => {
        if (attr.get('name') === attribute) delete cache[attr.get('characterid')];
      });

      return function (character) {
        let attr =
          findObjs({ type: 'attribute', name: attribute, characterid: character.id }, { caseInsensitive: true })[0] ||
          createObj('attribute', {
            name: attribute,
            characterid: character.id,
            current: defaultValue,
          });

        if (!cache[character.id] || cache[character.id] !== attr.get('current')) {
          if (!validator(attr.get('current'))) attr.set('current', defaultValue);
          cache[character.id] = attr.get('current');
        }
        return cache[character.id];
      };
    }

    const lookupUseBlood = makeSmartAttrCache('USEBLOOD', {
      default: 'DEFAULT',
      validation: (o) => String(o || '').trim() !== '',
    });
    const lookupUseHeal = makeSmartAttrCache('USEHEAL', {
      default: 'DEFAULT',
      validation: (o) => String(o || '').trim() !== '',
    });
    const lookupUseColor = makeSmartAttrCache('USECOLOR', {
      default: 'YES',
      validation: (o) => /^(YES|NO)$/i.test(String(o || '').trim()),
    });

    // ————— TOKEN HELPERS —————
    /**
     * Hard-clears all health-indicator visual settings (aura/tint).
     * Used for dead tokens or when the script/aura is disabled for a type.
     *
     * @param {object} obj - Roll20 token graphic object.
     */
    function clearAuras(obj) {
      const changes = { tint_color: 'transparent' };
      if (!state.HealthColors.auraTint) {
        changes.aura1_color = 'transparent';
        changes.aura1_radius = 0;
      }
      obj.set(changes);
    }

    /**
     * Applies a health color to a token via aura or tint depending on configuration.
     * When in tint mode, sets tint_color. When in aura mode, sets the Aura 1 radius, colour
     * (with the configured opacity), shape (unless Keep) and player-edit lock.
     * Roll20 measures aura1_radius from the token edge, so sizeSet maps directly.
     *
     * @param {object} obj         - Roll20 token object.
     * @param {number} sizeSet     - Page units the ring extends beyond the token edge (e.g. 0.35).
     * @param {string} markerColor - Hex color string derived from health percentage.
     */
    function tokenSet(obj, sizeSet, markerColor) {
      const s = state.HealthColors;
      if (s.auraTint) {
        obj.set({ tint_color: markerColor });
        return;
      }
      const changes = {
        tint_color: 'transparent',
        aura1_radius: sizeSet,
        aura1_color: withAuraOpacity(markerColor),
        showplayers_aura1: true,
        playersedit_aura1: s.auraLockPlayers !== true,
      };
      const shape = resolveAura1Shape(obj);
      if (shape) changes.aura1_options = shape;
      obj.set(changes);
    }

    /**
     * Hands Aura 1 back to the GM when the script stops managing it (switching to tint mode):
     * clears the ring, restores Roll20's default circle shape (unless Shape is Keep) and lets
     * controlling players edit it again.
     *
     * @param {object} obj - Roll20 token graphic object.
     */
    function releaseAura1(obj) {
      const changes = { aura1_color: 'transparent', aura1_radius: 0, playersedit_aura1: true };
      if (normalizeShape(state.HealthColors.Aura1Shape, DEFAULTS.Aura1Shape) !== 'Keep') {
        changes.aura1_options = 'circle';
      }
      obj.set(changes);
    }

    /**
     * Sets token name-visibility flags for the GM and players.
     * 'Yes' → true, 'No' → false, 'Off' → leave unchanged.
     *
     * @param {string} gm  - GM name-display setting: 'Yes', 'No', or 'Off'.
     * @param {string} pc  - Player name-display setting: 'Yes', 'No', or 'Off'.
     * @param {object} obj - Roll20 token object.
     */
    function setShowNames(gm, pc, obj) {
      if (gm !== 'Off' && gm !== '') obj.set({ showname: gm === 'Yes' });
      if (pc !== 'Off' && pc !== '') obj.set({ showplayers_name: pc === 'Yes' });
    }

    // ————— FX —————
    /**
     * Plays a jukebox track when a token dies.
     * Accepts a comma-separated list of track names; picks one at random.
     *
     * @param {string} trackname - Track name or comma-separated list of track names.
     */
    function playDeath(trackname) {
      const list = trackname.indexOf(',') > 0 ? trackname.split(',') : [trackname];
      const resolvedName = list[Math.floor(Math.random() * list.length)]; // NOSONAR — random track selection, not security-sensitive
      const track = findObjs({ type: 'jukeboxtrack', title: resolvedName })[0];
      if (track) {
        track.set({ playing: false, softstop: false, volume: 50 });
        track.set({ playing: true });
      } else {
        log(`${SCRIPT_NAME}: No track found named ${resolvedName}`);
      }
    }

    /**
     * Spawns a scaled particle FX at a token's position using a custom FX definition.
     * Merges the provided definition against FX_PARAM_DEFAULTS so partial definitions work.
     *
     * @param {number} scale   - Scaling factor derived from token height (height / 70).
     * @param {number} hitSize - Hit-size factor based on damage proportion (0.2–1.0).
     * @param {number} left    - Horizontal pixel position of the token on the page.
     * @param {number} top     - Vertical pixel position of the token on the page.
     * @param {object} fx      - Partial or complete Roll20 custom FX definition object.
     * @param {string} pageId  - ID of the Roll20 page on which to spawn the FX.
     */
    function spawnFX(scale, hitSize, left, top, fx, pageId) {
      const m = { ...FX_PARAM_DEFAULTS, ...fx };

      // Prefer colours from the incoming partial `fx` first (nullish), then merged `m`.
      // Order matters: after merge, `m.startColour` can still be FX_PARAM_DEFAULTS grey
      // while the real colour only exists on `fx.startColor` (Roll20 / heal seed used
      // American keys only). Using `||` on `m` alone would always pick the grey default.
      const pick = (obj, keys) => {
        if (!obj) return undefined;
        for (const key of keys) {
          const v = obj[key];
          if (v !== undefined && v !== null) return v;
        }
        return undefined;
      };
      const startKeys = ['startColour', 'startColor', 'startcolour', 'startcolor'];
      const endKeys = ['endColour', 'endColor', 'endcolour', 'endcolor'];
      const startRndKeys = ['startColourRandom', 'startColorRandom', 'startcolourrandom', 'startcolorrandom'];
      const endRndKeys = ['endColourRandom', 'endColorRandom', 'endcolourrandom', 'endcolorrandom'];
      const startClr = pick(fx, startKeys) ?? pick(m, startKeys);
      const endClr = pick(fx, endKeys) ?? pick(m, endKeys);
      const startClrRnd = pick(fx, startRndKeys) ?? pick(m, startRndKeys);
      const endClrRnd = pick(fx, endRndKeys) ?? pick(m, endRndKeys);

      spawnFxWithDefinition(
        left,
        top,
        {
          maxParticles: m.maxParticles * hitSize,
          duration: m.duration * hitSize,
          size: (m.size * scale) / 2,
          sizeRandom: (m.sizeRandom * scale) / 2,
          lifeSpan: m.lifeSpan,
          lifeSpanRandom: m.lifeSpanRandom,
          speed: m.speed * scale,
          speedRandom: m.speedRandom * scale,
          angle: m.angle,
          angleRandom: m.angleRandom,
          emissionRate: m.emissionRate * hitSize * 2,
          startColour: startClr,
          startColor: startClr,
          endColour: endClr,
          endColor: endClr,
          startColourRandom: startClrRnd,
          startColorRandom: startClrRnd,
          endColourRandom: endClrRnd,
          endColorRandom: endClrRnd,
          gravity: { x: m.gravity.x * scale, y: m.gravity.y * scale },
        },
        pageId,
      );
    }

    /**
     * Safely reads a Roll20 custfx definition and returns a plain mutable object.
     * Roll20 may return the definition as either an object or a JSON string.
     *
     * @param {object} fxObj - Roll20 custfx object.
     * @returns {object|null} Parsed FX definition object, or null if unavailable/invalid.
     */
    function getFxDefinition(fxObj) {
      if (!fxObj) return null;

      const raw = fxObj.get('definition');
      if (!raw) return null;

      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch (err) {
          log(`${SCRIPT_NAME}: Failed to parse FX definition: ${err.message}`);
          return null;
        }
      }

      if (typeof raw === 'object') {
        return deepClone(raw);
      }

      return null;
    }

    // ————— EVENT DEDUPE STATE —————

    // Tokens recently handled via change:attribute — suppresses duplicate FX in change:graphic and TokenMod observers.
    const recentAttrFires = new Set();
    const DEATH_SAVE_POLL_INTERVAL_MS = 3000;
    const DEATH_SAVE_PROBE_BACKOFF_MS = 30000;
    const DEATH_SAVE_PROBE_MAX_ATTRS = 24;
    const DEATH_SAVE_PROBE_INFLIGHT_TIMEOUT_MS = 15000;
    const deathSaveProbeBackoffUntil = {};
    const deathSaveProbeInFlight = {};
    const deathSaveProbeInFlightTimer = {};
    const deathSaveFieldSeedChecked = new Set();
    const beaconReadRiskChecked = new Set();
    let beaconReadRiskWarned = false;
    let deathSavePollTimer = null;

    /**
     * Shared token-change wrapper used by both Roll20 change:graphic and TokenMod.
     * This keeps FX suppression consistent when a linked HP attribute update has
     * already been processed through the attribute listener.
     *
     * @param {object} obj - Roll20 token graphic object.
     * @param {object} prev - Previous token snapshot.
     */
    function handleTokenChange(obj, prev) {
      handleToken(obj, prev, recentAttrFires.has(obj.id) ? 'YES' : undefined);
    }

    /**
     * Mod scripts whose token changes HealthColors observes. Roll20 does not fire
     * change:graphic for changes made by another script, so without these hooks HP set by
     * `!token-mod` or SmartAoE damage would not re-colour the token. Both expose
     * `ObserveTokenChange(handler)` and call handler(token, prev) after changing a token.
     *
     * @returns {{name: string, api: object|undefined}[]} Integration name and its API object, if installed.
     */
    function getTokenObserverScripts() {
      return [
        { name: 'TokenMod', api: typeof TokenMod === 'undefined' ? undefined : TokenMod },
        { name: 'SmartAoE', api: typeof SmartAoE === 'undefined' ? undefined : SmartAoE },
      ];
    }

    /**
     * Returns true when the named observer script is installed and offers ObserveTokenChange.
     *
     * @param {string} name - 'TokenMod' or 'SmartAoE'.
     * @returns {boolean} Whether HealthColors can observe it.
     */
    function isObserverScriptAvailable(name) {
      const entry = getTokenObserverScripts().find((e) => e.name === name);
      return typeof entry?.api?.ObserveTokenChange === 'function';
    }

    let tokenObserversRegistered = false;

    /**
     * Registers handleTokenChange with every installed observer script. Runs once per
     * sandbox start: checkInstall also runs after `!aura reset`, and registering again would
     * process (and play FX for) every change twice.
     */
    function registerTokenObservers() {
      if (tokenObserversRegistered) return;
      tokenObserversRegistered = true;
      const hooked = getTokenObserverScripts()
        .filter(({ name }) => isObserverScriptAvailable(name))
        .map(({ name, api }) => {
          api.ObserveTokenChange(handleTokenChange);
          return name;
        });
      if (hooked.length) log(`${SCRIPT_NAME}: observing token changes from ${hooked.join(', ')}`);
      getSmartAoeZeroHpMarkers();
    }

    // SmartAoE 0 HP marker tags seen this session. Remembered after an AoE is deleted, so a
    // later "apply damage" click from that AoE's chat card is still recognised.
    const knownSmartAoeZeroHpMarkers = new Set();

    /**
     * Collects the 0 HP marker tags configured on SmartAoE AoEs (`zeroHPmarker`, stored per
     * AoE in `state.SmartAoE.links`), adding them to the session-wide set.
     *
     * @returns {Set<string>} Every SmartAoE 0 HP marker tag known this session.
     */
    function getSmartAoeZeroHpMarkers() {
      const addTags = (markerString) =>
        String(markerString || '')
          .split(',')
          .map((tag) => tag.trim().replace(/@\d+$/, ''))
          .filter(Boolean)
          .forEach((tag) => knownSmartAoeZeroHpMarkers.add(tag));
      // SmartAoE 1.0.0+ reports every 0 HP marker it has used this session, including --instant AoEs,
      // which are deleted before their damage is applied.
      if (typeof SmartAoE !== 'undefined' && typeof SmartAoE.ZeroHPMarkers === 'function') {
        try {
          SmartAoE.ZeroHPMarkers().forEach(addTags);
        } catch (err) {
          log(`${SCRIPT_NAME}: SmartAoE.ZeroHPMarkers() failed: ${err?.message || err}`);
        }
      }
      // Older SmartAoE versions: read the AoEs saved in SmartAoE's state.
      const links = state?.SmartAoE?.links;
      if (Array.isArray(links)) links.forEach((link) => addTags(link?.zeroHPmarker));
      return knownSmartAoeZeroHpMarkers;
    }

    /**
     * Returns the SmartAoE 0 HP marker on a token, if any. SmartAoE adds that marker just
     * before it lowers the HP bar, so it is already present when HealthColors sees 0 HP.
     * When it is there, HealthColors leaves the 0 HP marker to SmartAoE and adds none itself.
     *
     * @param {object} obj - Roll20 token graphic object.
     * @returns {string|null} The matching marker tag, or null.
     */
    function getSmartAoeZeroHpMarkerOn(obj) {
      if (!isObserverScriptAvailable('SmartAoE')) return null;
      const known = getSmartAoeZeroHpMarkers();
      if (!known.size) return null;
      const tags = String(obj.get('statusmarkers') || '')
        .split(',')
        .map((tag) => tag.trim().replace(/@\d+$/, ''))
        .filter(Boolean);
      return tags.find((tag) => known.has(tag)) || null;
    }

    // ————— STATE / INSTALL —————
    /**
     * Migrates state from the interim HP-only "PC dying marker" build to Death Save
     * Integration: carries the prior enable flag / dying marker into the new keys and
     * removes the defunct `pcDying*` keys. Idempotent. (Missing `ds*` keys are filled
     * from DEFAULTS by the caller afterwards.)
     */
    function migrateDeathSaveState() {
      const s = state.HealthColors;
      if (!s) return;
      if (s.deathSavesOn === undefined && s.pcDyingOn !== undefined) s.deathSavesOn = !!s.pcDyingOn;
      if (s.dsDyingMarker === undefined && s.pcDyingMarker) s.dsDyingMarker = s.pcDyingMarker;
      delete s.pcDyingOn;
      delete s.pcDyingMarker;
    }

    /**
     * Before v2.4.0 the Aura 1 shape setting was display-only, so every existing game reports
     * the old default "Circle" without that ever having changed a token. On first load of
     * v2.4.0 an untouched "Circle" becomes "Keep" so upgrading does not reshape auras GMs set
     * by hand; any other stored shape (a deliberate choice) is kept and now applied.
     */
    function migrateAuraShapeState() {
      const s = state.HealthColors;
      if (!s || s.auraShapeApplied) return;
      if (s.Aura1Shape === 'Circle') s.Aura1Shape = 'Keep';
      if (s.Aura1Shape !== undefined) s.Aura1Shape = normalizeShape(s.Aura1Shape, DEFAULTS.Aura1Shape);
      if (s.Aura2Shape !== undefined) s.Aura2Shape = normalizeShape(s.Aura2Shape, DEFAULTS.Aura2Shape, false);
      s.auraShapeApplied = true;
    }

    /**
     * Initializes or migrates persisted state, applies all default values, applies any
     * newer One-Click install options, registers the TokenMod/SmartAoE observers if available, and
     * creates the default Hurt/Heal FX objects if they do not already exist in the campaign.
     * Safe to call multiple times (e.g. after a state reset).
     */
    function checkInstall() {
      log(`-=> ${SCRIPT_NAME} v${VERSION} [Updated: ${UPDATED}] <=- Mod Script Sandbox ${describeSandbox()}`);
      if (state?.HealthColors?.schemaVersion !== SCHEMA_VERSION) {
        log(`<${SCRIPT_NAME} Updating Schema to v${SCHEMA_VERSION}>`);
        state.HealthColors = { schemaVersion: SCHEMA_VERSION, version: VERSION };
      }
      migrateDeathSaveState();
      migrateAuraShapeState();
      Object.keys(DEFAULTS).forEach((key) => {
        if (state.HealthColors[key] === undefined) state.HealthColors[key] = DEFAULTS[key];
      });
      state.HealthColors.colorPalette = normalizePalette(state.HealthColors.colorPalette, DEFAULTS.colorPalette);
      applyOneClickOptions();
      registerTokenObservers();
      const fxHurt = findObjs({ _type: 'custfx', name: '-DefaultHurt' }, { caseInsensitive: true })[0];
      const fxHeal = findObjs({ _type: 'custfx', name: '-DefaultHeal' }, { caseInsensitive: true })[0];
      if (!fxHurt) {
        gmWhisper('Creating Default Hurt FX');
        createObj('custfx', {
          name: '-DefaultHurt',
          definition: DEFAULT_HURT_FX,
        });
      }
      if (!fxHeal) {
        gmWhisper('Creating Default Heal FX');
        createObj('custfx', {
          name: '-DefaultHeal',
          definition: DEFAULT_HEAL_FX,
        });
      }
      syncDefaultFxObjects();
    }

    /**
     * Returns the hex colour the default heal/hurt particle burst should use: the global
     * HealFX/HurtFX setting when it is a colour, otherwise the shipped default colour
     * (the setting then names an effect, and the default burst only plays as a fallback).
     *
     * @param {boolean} isHeal - True for the heal burst, false for hurt.
     * @returns {string} 6-digit hex colour.
     */
    function getDefaultFxColour(isHeal) {
      const key = isHeal ? 'HealFX' : 'HurtFX';
      const setting = state.HealthColors[key];
      return isHex6(setting) ? setting : DEFAULTS[key];
    }

    /**
     * Writes a solid RGBA colour into every start/end colour key of an FX definition
     * (both British and American spellings) and neutralizes the random colour channels.
     *
     * @param {object}   def - FX definition to mutate.
     * @param {number[]} rgb - RGBA array from hexToRgb.
     * @returns {object} The same definition, for chaining.
     */
    function applyFxColour(def, rgb) {
      def.startColour = rgb;
      def.startColor = rgb;
      def.endColour = rgb;
      def.endColor = rgb;
      def.startColourRandom = [0, 0, 0, 0];
      def.startColorRandom = [0, 0, 0, 0];
      def.endColourRandom = [0, 0, 0, 0];
      def.endColorRandom = [0, 0, 0, 0];
      return def;
    }

    /**
     * Builds the normalized default Hurt/Heal definition payload used for
     * campaign custom FX objects.
     *
     * @param {boolean} isHeal - True for Heal profile, false for Hurt profile.
     * @param {object} baseDef - Existing definition to merge into.
     * @returns {object} Updated definition with normalized color/profile fields.
     */
    function buildDefaultFxDefinition(isHeal, baseDef) {
      const def = { ...baseDef };
      applyFxColour(def, hexToRgb(getDefaultFxColour(isHeal)));

      // Keep the vivid profile that reads clearly in live play.
      if (isHeal) {
        def.maxParticles = 220;
        def.emissionRate = 260;
        def.size = 12;
        def.sizeRandom = 4;
        def.lifeSpan = 40;
        def.lifeSpanRandom = 6;
        def.speed = 0.8;
        def.speedRandom = 1;
      } else {
        def.maxParticles = 200;
        def.emissionRate = 180;
        def.size = 10;
        def.sizeRandom = 2;
        def.lifeSpan = 22;
        def.lifeSpanRandom = 3;
        def.speed = 8;
        def.speedRandom = 2;
      }
      return def;
    }

    /**
     * Applies current Heal/Hurt colors and profile tuning to campaign default
     * custom FX objects. This is called on install/reset and when color settings
     * change so runtime spawns can use stable pre-synced definitions.
     */
    function syncDefaultFxObjects() {
      const fxHurt = findObjs({ _type: 'custfx', name: '-DefaultHurt' }, { caseInsensitive: true })[0];
      const fxHeal = findObjs({ _type: 'custfx', name: '-DefaultHeal' }, { caseInsensitive: true })[0];
      if (fxHeal) {
        const base = getFxDefinition(fxHeal) || DEFAULT_HEAL_FX;
        fxHeal.set({ definition: buildDefaultFxDefinition(true, base) });
      }
      if (fxHurt) {
        const base = getFxDefinition(fxHurt) || DEFAULT_HURT_FX;
        fxHurt.set({ definition: buildDefaultFxDefinition(false, base) });
      }
    }

    /**
     * Recreates HealthColors default custom FX objects in the campaign.
     * Useful when legacy/stale custfx definitions exist from older script versions.
     */
    function resetDefaultFxObjects() {
      const existing = findObjs({ _type: 'custfx' }, { caseInsensitive: true }).filter((fx) =>
        /-Default(Hurt|Heal)/i.test(fx.get('name') || ''),
      );
      existing.forEach((fx) => fx.remove());
      gmWhisper('Recreating Default Hurt/Heal FX');
      checkInstall();
    }

    /**
     * Resets all persisted HealthColors settings back to DEFAULTS.
     * Keeps schema/version metadata aligned to current script constants. Also drops the
     * One-Click cache, so the following checkInstall re-applies the install-time options.
     */
    function resetAllSettingsToDefaults() {
      state.HealthColors = {
        schemaVersion: SCHEMA_VERSION,
        version: VERSION,
        ...DEFAULTS,
      };
    }

    /**
     * Restores all state defaults, rebuilds default FX objects, and force-syncs tokens.
     */
    function runResetAllFlow() {
      resetAllSettingsToDefaults();
      gmWhisper('RESET ALL: defaults restored + default FX + force update');
      resetDefaultFxObjects();
      menuForceUpdate();
    }

    /**
     * Reads a prior token value from either a plain snapshot object or a Roll20 object.
     * Supports external scripts that pass JSON-cloned snapshots (no .get method).
     *
     * @param {object} prev - Previous token snapshot.
     * @param {string} key  - Property key to read (e.g. 'bar1_value').
     * @returns {string|number|undefined} Raw previous value when available.
     */
    function getPrevBarValue(prev, key) {
      if (!prev) return undefined;
      if (Object.hasOwn(prev, key)) return prev[key];
      if (typeof prev.get === 'function') return prev.get(key);
      return undefined;
    }

    /**
     * Reports whether the health bar's max, its attribute link, or the token's character
     * changed in this event. Any of these can turn a token that was previously skipped
     * (empty max, no character) into one that should be coloured, without the bar's
     * current value moving at all — e.g. the 5e Shaped sheet computes HP max from the
     * sheet after the token is placed, or the GM links the bar in token settings.
     *
     * @param {object} obj     - Roll20 token graphic object.
     * @param {object} prev    - Previous token snapshot.
     * @param {string} barUsed - Configured health bar property name (e.g. 'bar1').
     * @returns {boolean} True when max, link, or represents differs from the snapshot.
     */
    function barLinkageChanged(obj, prev, barUsed) {
      return [`${barUsed}_max`, `${barUsed}_link`, 'represents'].some(
        (key) => String(getPrevBarValue(prev, key) ?? '') !== String(obj.get(key) ?? ''),
      );
    }

    // ————— TOKEN LOGIC —————
    /**
     * Reads the configured health bar from a token and its previous snapshot,
     * validates all three values are numeric, and returns a health data object.
     * Returns null if any value is missing or non-numeric.
     *
     * @param {object} obj  - Roll20 token graphic object.
     * @param {object} prev - Snapshot of the token's previous attribute values.
     * @returns {{ maxValue: number, curValue: number, prevValue: number,
     *             hasPrevValue: boolean, percReal: number, markerColor: string }|null}
     */
    function getBarHealth(obj, prev) {
      const barUsed = state.HealthColors.auraBar;
      if (obj.get(`${barUsed}_max`) === '' && obj.get(`${barUsed}_value`) === '') return null;
      const maxValue = Number.parseInt(obj.get(`${barUsed}_max`), 10);
      const curValue = Number.parseInt(obj.get(`${barUsed}_value`), 10);
      const prevRawValue = getPrevBarValue(prev, `${barUsed}_value`);
      const prevValue = Number.parseInt(prevRawValue, 10);
      const hasPrevValue = !Number.isNaN(prevValue);
      if (Number.isNaN(maxValue) || Number.isNaN(curValue)) return null;
      const percReal = Math.max(0, Math.min(Math.round((curValue / maxValue) * 100), 100));
      const markerColor = percentToHex(percReal);
      return { maxValue, curValue, prevValue, hasPrevValue, percReal, markerColor };
    }

    /**
     * Determines Player vs Monster and returns all type-specific config in one object.
     *
     * @param {object|undefined} oCharacter - Roll20 character object (may be undefined).
     * @returns {{ gm: string, pc: string, isTypeOn: boolean, percentOn: number,
     *             showDead: boolean, isPlayer: boolean }}
     */
    function resolveTypeConfig(oCharacter) {
      const isPlayer = !!(oCharacter && oCharacter.get('controlledby') !== '');
      if (isPlayer) {
        return {
          gm: state.HealthColors.GM_PCNames,
          pc: state.HealthColors.PCNames,
          isTypeOn: state.HealthColors.PCAura,
          percentOn: state.HealthColors.auraPercPC,
          showDead: state.HealthColors.auraDeadPC,
          isPlayer: true,
        };
      }
      return {
        gm: state.HealthColors.GM_NPCNames,
        pc: state.HealthColors.NPCNames,
        isTypeOn: state.HealthColors.NPCAura,
        percentOn: state.HealthColors.auraPerc,
        showDead: state.HealthColors.auraDead,
        isPlayer: false,
      };
    }

    /**
     * Manages the dead-status marker and plays a death sound when a token reaches 0 HP.
     * Extracted from applyAuraAndDead to reduce nesting depth.
     *
     * @param {object}        obj       - Roll20 token graphic object.
     * @param {number}        curValue  - Current bar value.
     * @param {number}        prevValue - Previous bar value.
     * @param {boolean}       hasPrevValue - Whether a valid previous bar value was provided.
     * @param {boolean}       [soundOnly]  - Play the death sound but add no marker (SmartAoE already marked it).
     */
    function applyDeadStatus(obj, curValue, prevValue, hasPrevValue, soundOnly = false) {
      if (curValue > 0) {
        obj.set('status_dead', false);
        return;
      }
      const deadSfx = state.HealthColors.auraDeadFX;
      if (deadSfx !== 'None' && hasPrevValue && curValue !== prevValue) playDeath(deadSfx);
      if (!soundOnly) obj.set('status_dead', true);
    }

    /**
     * Death Save Integration marker handling driven by HP (PC-only).
     * This HP-path manages the baseline:
     *
     *  - HP > 0                       → clear dying/stable/dead (alive again).
     *  - HP <= 0 and no marker yet    → fresh down: set the dying marker and prompt to sync.
     *  - HP <= 0 and a marker present → leave it (so a token move / forced refresh, or an
     *                                   already-synced stable/dead PC, isn't reset to dying).
     *
     * This deliberately does NOT depend on the previous HP value: on the D&D 2024 (linked-
     * attribute) sheet, `change:graphic`'s `prev` is unreliable when a PC drops to 0, so a
     * "prev > 0" check would miss the transition. Checking for an existing marker instead
     * makes adding the dying marker as robust as clearing it.
     *
     * @param {object}  obj      - Roll20 token graphic object.
     * @param {number}  curValue - Current bar value.
     * @param {boolean} isPlayer - Whether the token represents a player character.
     * @returns {boolean} True when this handling owned the marker state.
     */
    function applyDeathSaveStatus(obj, curValue, isPlayer) {
      const s = state.HealthColors;
      if (!s.deathSavesOn || !isPlayer) return false;

      if (curValue > 0) {
        obj.set(buildDeathSaveMarkerPatch(false, false, false));
        return true;
      }
      if (!s.dsDyingMarker && !s.dsStableMarker) return true;
      const hasDying = s.dsDyingMarker ? obj.get(`status_${s.dsDyingMarker}`) : false;
      const hasStable = s.dsStableMarker ? obj.get(`status_${s.dsStableMarker}`) : false;
      const hasMarker = hasDying || hasStable || obj.get('status_dead');
      if (!hasMarker) {
        obj.set(buildDeathSaveMarkerPatch(true, false, false));
      }
      return true;
    }

    /**
     * Applies or removes the health aura/tint and manages the dead-status marker.
     *
     * @param {object}           obj        - Roll20 token graphic object.
     * @param {object|undefined} oCharacter - Roll20 character object.
     * @param {object}           typeConfig - Config returned by resolveTypeConfig.
     * @param {object}           health     - Health data returned by getBarHealth.
     */
    function applyAuraAndDead(obj, oCharacter, typeConfig, health) {
      const { curValue, prevValue, hasPrevValue, percReal, markerColor } = health;
      const { isTypeOn, percentOn, showDead, isPlayer } = typeConfig;
      const useAura = oCharacter ? lookupUseColor(oCharacter) : undefined;
      const useTint = state.HealthColors.auraTint;
      const colorType = useTint ? 'tint' : 'aura1';
      const appliedColor = useTint ? markerColor : withAuraOpacity(markerColor);

      // SmartAoE added its own 0 HP marker: let that stand and add no HealthColors marker.
      const smartAoeMarker = curValue <= 0 ? getSmartAoeZeroHpMarkerOn(obj) : null;
      const deathSaveActive = state.HealthColors.deathSavesOn && isPlayer;

      if (smartAoeMarker) {
        if (!deathSaveActive && showDead) applyDeadStatus(obj, curValue, prevValue, hasPrevValue, true);
      } else {
        // Death Save Integration (PC-only) owns the dying/stable/dead markers when enabled.
        const deathSaveHandled = applyDeathSaveStatus(obj, curValue, isPlayer);
        if (!deathSaveHandled && showDead) applyDeadStatus(obj, curValue, prevValue, hasPrevValue);
      }

      if (isTypeOn && useAura !== 'NO') {
        if (curValue <= 0) {
          tokenSet(obj, state.HealthColors.AuraSize, markerColor);
        } else if (percentOn <= 0) {
          clearAuras(obj);
        } else if (percReal > percentOn) {
          clearAuras(obj);
        } else {
          tokenSet(obj, state.HealthColors.AuraSize, markerColor);
        }
      } else if (String(obj.get(`${colorType}_color`) || '').toLowerCase() === appliedColor.toLowerCase()) {
        clearAuras(obj);
      }
    }

    // Missing-FX warnings already whispered (keyed by source, character and name) so a bad
    // name is reported once per setting change rather than on every HP tick.
    const warnedMissingFx = new Set();

    /**
     * Logs, and whispers once, that a configured FX name could not be found, naming the
     * setting or character attribute to fix. The caller falls back to the default burst.
     *
     * @param {string}  fxName - The unresolved effect name.
     * @param {string}  source - 'heal' | 'hurt' (global setting) or 'USEHEAL' | 'USEBLOOD' (attribute).
     * @param {string}  label  - Character/token name for context ('' for the global setting).
     * @param {boolean} isHeal - True for a heal event.
     */
    function warnMissingFx(fxName, source, label, isHeal) {
      const key = `${source}|${label}|${fxName}`;
      const who = label ? ` (character: "${escapeForChat(label)}")` : '';
      const isAttr = source === 'USEHEAL' || source === 'USEBLOOD';
      log(
        `${SCRIPT_NAME}: FX "${fxName}"${who} not found — check ${isAttr ? `the ${source} attribute` : `!aura ${source}`}.`,
      );
      if (warnedMissingFx.has(key)) return;
      warnedMissingFx.add(key);
      const fix = isAttr
        ? `Fix the ${source} attribute on that character`
        : `Fix it with <strong>!aura ${source} &lt;effect&gt;</strong> (see <strong>!aura listfx</strong>)`;
      gmWhisper(
        `FX "${escapeForChat(fxName)}"${who} not found. ${fix}. Falling back to the default ${isHeal ? 'heal' : 'hurt'} FX.`,
      );
    }

    /**
     * Builds the colour-burst choice for the shipped default heal/hurt particle FX.
     * Without `hex` the burst uses the global colour (the pre-synced `-DefaultHeal`/`-DefaultHurt`
     * object is spawned by id); with `hex` a per-character colour is injected into a copy of
     * the definition and spawned scaled.
     *
     * @param {boolean} isHeal - True for a heal event.
     * @param {string}  [hex]  - Per-character override colour.
     * @returns {{kind:'colour',hex:string,global:boolean}} The colour choice.
     */
    function defaultColourChoice(isHeal, hex) {
      if (hex) return { kind: 'colour', hex, global: false };
      return { kind: 'colour', hex: getDefaultFxColour(isHeal), global: true };
    }

    /**
     * Resolves which FX to spawn for a heal or hurt event.
     * Precedence: per-character override (`USEHEAL` / `USEBLOOD`) → global `HealFX` / `HurtFX`.
     * An override may be `DEFAULT` (use the global setting), a hex colour, or a comma-separated
     * list of built-in effect names and/or custom FX names. Unknown names warn and fall back.
     *
     * @param {boolean}          isHeal   - True when HP went up.
     * @param {string|undefined} override - Per-character attribute value.
     * @param {string}           [label]  - Character/token name for error context.
     * @returns {object[]} FX choices for spawnFxChoice.
     */
    function resolveFxChoices(isHeal, override, label) {
      const raw = String(override ?? '').trim();

      if (!raw || raw.toUpperCase() === 'DEFAULT') {
        const setting = state.HealthColors[isHeal ? 'HealFX' : 'HurtFX'];
        const choice = classifyFxValue(setting);
        if (!choice) {
          warnMissingFx(setting, isHeal ? 'heal' : 'hurt', '', isHeal);
          return [defaultColourChoice(isHeal)];
        }
        return [choice.kind === 'colour' ? defaultColourChoice(isHeal) : choice];
      }

      if (isHex6(raw)) return [defaultColourChoice(isHeal, raw.replace('#', '').toUpperCase())];

      const choices = raw
        .split(',')
        .map((fxName) => fxName.trim())
        .filter((fxName) => fxName !== '')
        .map((fxName) => {
          const choice = classifyFxValue(fxName);
          if (choice) return choice.kind === 'colour' ? defaultColourChoice(isHeal, choice.hex) : choice;
          warnMissingFx(fxName, isHeal ? 'USEHEAL' : 'USEBLOOD', label, isHeal);
          return defaultColourChoice(isHeal);
        });

      return choices.length ? choices : [defaultColourChoice(isHeal)];
    }

    /**
     * Spawns one resolved FX choice at a token.
     *  - builtin: Roll20 effect by name (`spawnFx`, or `spawnFxBetweenPoints` for directional
     *    types). Built-in effects are fixed-size and are not scaled by token size or damage.
     *  - custom:  the campaign custom FX definition, scaled by token size and hit size.
     *  - colour:  the default heal/hurt burst — spawned by id when it uses the global colour
     *    (avoids client colour drift), otherwise recoloured and spawned by definition.
     *
     * @param {object}  choice  - Entry from resolveFxChoices.
     * @param {object}  obj     - Roll20 token graphic object.
     * @param {boolean} isHeal  - True for a heal event.
     * @param {number}  scale   - Token-size scale factor (height / 70).
     * @param {number}  hitSize - Damage-proportion factor (0.2–1.0).
     */
    function spawnFxChoice(choice, obj, isHeal, scale, hitSize) {
      const left = obj.get('left');
      const top = obj.get('top');
      const pageId = obj.get('pageid');

      if (choice.kind === 'builtin') {
        const type = choice.name.split('-')[0];
        if (DIRECTIONAL_FX_TYPES.has(type)) {
          spawnFxBetweenPoints({ x: left, y: top }, { x: left, y: top }, choice.name, pageId);
        } else {
          spawnFx(left, top, choice.name, pageId);
        }
        return;
      }

      if (choice.kind === 'custom') {
        const def = getFxDefinition(choice.fxObj);
        if (def) spawnFX(scale, hitSize, left, top, def, pageId);
        return;
      }

      const defaultName = isHeal ? '-DefaultHeal' : '-DefaultHurt';
      const defaultFx = findObjs({ _type: 'custfx', name: defaultName }, { caseInsensitive: true })[0];
      if (choice.global && defaultFx) {
        spawnFx(left, top, defaultFx.id, pageId);
        return;
      }
      const def = getFxDefinition(defaultFx) || { ...(isHeal ? DEFAULT_HEAL_FX : DEFAULT_HURT_FX) };
      applyFxColour(def, hexToRgb(choice.hex));
      spawnFX(scale, hitSize, left, top, def, pageId);
    }

    /**
     * Gates and triggers particle FX when HP changes on a non-forced update.
     * `USEBLOOD` set to OFF/NO keeps its long-standing meaning of no HealthColors FX at all
     * for that character; `USEHEAL` OFF/NO suppresses only the heal FX.
     *
     * @param {object}           obj        - Roll20 token graphic object.
     * @param {object|undefined} oCharacter - Roll20 character object.
     * @param {number}           curValue   - Current bar value.
     * @param {number|string}    prevValue  - Previous bar value.
     * @param {number}           maxValue   - Maximum bar value.
     * @param {string}           [update]   - Pass 'YES' to suppress FX on forced refreshes.
     */
    function maybeSpawnFX(obj, oCharacter, curValue, prevValue, maxValue, update) {
      if (update === 'YES' || Number.isNaN(prevValue) || curValue === prevValue) return;
      if (!state.HealthColors.FX) return;
      const useBlood = oCharacter ? lookupUseBlood(oCharacter) : undefined;
      if (isFxOff(useBlood)) return;
      const isHeal = curValue > prevValue;
      const useHeal = isHeal && oCharacter ? lookupUseHeal(oCharacter) : undefined;
      if (isHeal && isFxOff(useHeal)) return;
      const amount = Math.abs(curValue - prevValue);
      const scale = obj.get('height') / 70;
      const hitSize = Math.max(Math.min((amount / maxValue) * 4, 1), 0.2) * (randomInt(60, 100) / 100);
      const fxLabel = (oCharacter && oCharacter.get('name')) || obj.get('name') || '';
      resolveFxChoices(isHeal, isHeal ? useHeal : useBlood, fxLabel).forEach((choice) =>
        spawnFxChoice(choice, obj, isHeal, scale, hitSize),
      );
    }

    /**
     * Core token handler — called on token change, token add, and forced updates.
     * Delegates to specialized helpers for health reading, type resolution,
     * aura management, and FX spawning.
     * Clears aura/tint when the selected health bar has no max value.
     *
     * @param {object} obj      - The Roll20 token graphic object.
     * @param {object} prev     - Snapshot of the token's previous attribute values.
     * @param {string} [update] - Pass 'YES' to indicate a forced refresh (suppresses FX).
     */
    function handleToken(obj, prev, update) {
      if (state.HealthColors === undefined) {
        log(`${SCRIPT_NAME} ${VERSION}: state missing, reverting to defaults`);
        checkInstall();
      }
      if (state.HealthColors.auraColorOn !== true || obj.get('layer') !== 'objects') return;
      if (obj.get('represents') === '' && state.HealthColors.OneOff !== true) return;
      const barUsed = state.HealthColors.auraBar;
      if (obj.get(`${barUsed}_max`) === '') {
        clearAuras(obj);
        return;
      }

      const health = getBarHealth(obj, prev);
      if (!health) return;

      const { maxValue, curValue, prevValue, hasPrevValue } = health;
      const sizeChanged = prev.width !== obj.get('width') || prev.height !== obj.get('height');
      const linkageChanged = barLinkageChanged(obj, prev, barUsed);
      // Saving token settings can overwrite an aura applied while the dialog was open.
      // Reconcile visual changes even when HP, size and bar linkage stayed the same.
      const indicatorKeys = state.HealthColors.auraTint
        ? ['tint_color']
        : ['aura1_radius', 'aura1_color', 'aura1_options', 'aura1_square', 'showplayers_aura1', 'tint_color'];
      const indicatorChanged = indicatorKeys.some(
        (key) => String(getPrevBarValue(prev, key) ?? '') !== String(obj.get(key) ?? ''),
      );

      // Only skip when nothing relevant changed. The `curValue > 0` clause means we never
      // skip while a token is at/below 0 HP: on linked-attribute sheets (D&D 2024) a drop
      // can arrive with prev === cur (unreliable prev), and we still need the death-save /
      // dead marker logic to run. Re-processing at 0 HP is idempotent and cheap.
      if (
        hasPrevValue &&
        curValue === prevValue &&
        curValue > 0 &&
        update !== 'YES' &&
        !sizeChanged &&
        !linkageChanged &&
        !indicatorChanged
      ) {
        return;
      }

      const oCharacter = getObj('character', obj.get('represents'));
      const typeConfig = resolveTypeConfig(oCharacter);

      if (state.HealthColors.deathSavesOn && typeConfig.isPlayer && oCharacter) {
        ensureDeathSaveWatchForCharacter(oCharacter, state.HealthColors);
      }

      applyAuraAndDead(obj, oCharacter, typeConfig, health);
      setShowNames(typeConfig.gm, typeConfig.pc, obj);
      maybeSpawnFX(obj, oCharacter, curValue, prevValue, maxValue, update);
    }

    // ————— FORCE UPDATE —————
    /**
     * Handles the visual transition when switching between aura and tint modes.
     * Processes every token in a single drain queue pass: when switching to tint mode
     * it releases aura1 on each token (see releaseAura1) before re-evaluating health, ensuring no stale
     * HC-set aura rings remain. When switching to aura mode it re-evaluates health
     * directly so tokenSet clears the tint and applies the aura ring in one step.
     *
     * @param {boolean} toTint - True when switching into tint mode, false when switching out.
     */
    function modeSwitch(toTint) {
      const workQueue = findObjs({
        type: 'graphic',
        subtype: 'token',
        layer: 'objects',
      });
      const drainQueue = () => {
        const token = workQueue.shift();
        if (!token) return;
        if (toTint) releaseAura1(token);
        const prev = deepClone(token);
        handleToken(token, prev, 'YES');
        setTimeout(drainQueue, 0);
      };
      drainQueue();
    }

    /**
     * Forces a re-evaluation of every token on the objects layer,
     * processing them one at a time via a setTimeout drain queue to avoid
     * blocking the Roll20 sandbox event loop.
     */
    function menuForceUpdate() {
      const workQueue = findObjs({
        type: 'graphic',
        subtype: 'token',
        layer: 'objects',
      });
      gmWhisper(`Refreshing ${workQueue.length} Tokens`);
      const drainQueue = () => {
        const token = workQueue.shift();
        if (token) {
          const prev = deepClone(token);
          handleToken(token, prev, 'YES');
          setTimeout(drainQueue, 0);
        } else {
          gmWhisper('Finished Refreshing Tokens');
        }
      };
      drainQueue();
    }

    /**
     * Forces a health-color update on all currently selected tokens.
     * Whispers the list of updated token names to the GM.
     *
     * @param {object} msg - Roll20 chat message object with a populated `selected` array.
     */
    function manUpdate(msg) {
      const tokens = (msg.selected || [])
        .filter((sel) => sel._type === 'graphic')
        .map((sel) => getObj('graphic', sel._id))
        .filter(Boolean);
      if (tokens.length === 0) {
        gmWhisper(
          'Select one or more tokens first, then press <b>Update Selected</b> (or run <code>!aura update</code>).',
        );
        return;
      }
      const names = tokens.map((token) => {
        handleToken(token, deepClone(token), 'YES');
        return escapeForChat(token.get('name') || '(unnamed token)');
      });
      gmWhisper(`Updated ${names.length} token${names.length === 1 ? '' : 's'}:<br>${names.join('<br>')}`);
    }

    // ————— DEATH SAVE INTEGRATION —————

    /**
     * Clears the configured dying/stable markers from all objects-layer tokens.
     * Called when the feature is disabled or a marker is reconfigured.
     */
    function clearAllDeathSaveMarkers() {
      findObjs({ type: 'graphic', subtype: 'token', layer: 'objects' }).forEach((t) =>
        t.set(buildDeathSaveMarkerPatch(false, false, false)),
      );
    }

    /**
     * Builds a token patch for death-save marker channels, skipping channels whose
     * marker tag is intentionally blank (disabled).
     *
     * @param {boolean} dyingOn  - Whether dying marker should be on.
     * @param {boolean} stableOn - Whether stable marker should be on.
     * @param {boolean} deadOn   - Whether status_dead should be on.
     * @returns {object} token.set-compatible patch.
     */
    function buildDeathSaveMarkerPatch(dyingOn, stableOn, deadOn) {
      const s = state.HealthColors;
      const patch = { status_dead: !!deadOn };
      if (s.dsDyingMarker) patch[`status_${s.dsDyingMarker}`] = !!dyingOn;
      if (s.dsStableMarker) patch[`status_${s.dsStableMarker}`] = !!stableOn;
      return patch;
    }

    /**
     * Enables/disables Death Save Integration and refreshes tokens. On disable, lingering
     * dying/stable markers are cleared.
     *
     * @param {boolean} enable - Desired state.
     */
    function setDeathSaves(enable) {
      const s = state.HealthColors;
      s.deathSavesOn = enable;
      if (enable) {
        gmWhisper(
          'Death Save Integration enabled. Death-save marker syncing now updates automatically from watched attributes.',
        );
        // Proactively flag a dying/stable marker that won't render (e.g. a bare 'unconscious').
        [
          ['Dying', s.dsDyingMarker],
          ['Stable', s.dsStableMarker],
        ].forEach(([label, tag]) => {
          if (tag && !markerTagExists(tag)) {
            gmWhisper(
              `⚠ ${label} marker "${tag}" isn't a marker in this game, so it won't render. Run !aura deathsaves markers for valid tags, then !aura deathsaves ${label === 'Dying' ? 'dyingmarker' : 'stablemarker'} &lt;tag&gt;.`,
            );
          }
        });
      } else {
        clearAllDeathSaveMarkers();
        gmWhisper('Death Save Integration disabled.');
      }
      menuForceUpdate();
    }

    /**
     * Applies the dying/stable/dead marker to a token from synced save counts.
     * Above 0 HP all death markers are cleared. Otherwise: 3+ failures → dead (Red X,
     * plays the death sound once on entering dead); 3+ successes → stable; else dying.
     * When the token carries a SmartAoE 0 HP marker, that marker stands in for dying (no dying
     * marker is added) and is left in place.
     *
     * @param {object} token - Roll20 token graphic object.
     * @param {number} succ  - Number of recorded successes.
     * @param {number} fail  - Number of recorded failures.
     * @returns {string} The resulting state label ('alive' | 'dead' | 'stable' | 'dying').
     */
    function applyDeathSaveMarker(token, succ, fail) {
      const s = state.HealthColors;
      const cur = Number.parseInt(token.get(`${s.auraBar}_value`), 10);
      if (Number.isFinite(cur) && cur > 0) {
        token.set(buildDeathSaveMarkerPatch(false, false, false));
        return 'alive';
      }
      // A SmartAoE 0 HP marker stands in for "dying", and is never removed by HealthColors.
      const smartAoeMarker = getSmartAoeZeroHpMarkerOn(token);
      const patch = (dyingOn, stableOn, deadOn) => {
        const changes = buildDeathSaveMarkerPatch(dyingOn && !smartAoeMarker, stableOn, deadOn);
        if (smartAoeMarker) delete changes[`status_${smartAoeMarker}`];
        return changes;
      };
      if (fail >= 3) {
        if (s.auraDeadFX !== 'None' && !token.get('status_dead')) playDeath(s.auraDeadFX);
        token.set(patch(false, false, true));
        return 'dead';
      }
      if (succ >= 3) {
        token.set(patch(false, true, false));
        return 'stable';
      }
      token.set(patch(true, false, false));
      return 'dying';
    }

    /**
     * Processes death save debug output for a single selected token.
     *
     * @param {object} ctx - Debug context for one token.
     * @param {object} ctx.token - The token object.
     * @param {object} ctx.character - The character object.
     * @param {string[]} ctx.watched - Watched attribute names.
     * @param {string} ctx.barUsed - Bar identifier.
     * @param {string} ctx.barValue - Formatted bar value.
     * @param {string} ctx.barMax - Formatted bar max.
     * @param {string} ctx.dyingMarker - Dying marker identifier.
     * @param {string} ctx.stableMarker - Stable marker identifier.
     * @param {object} ctx.settings - State object.
     * @param {number} ctx.legacyHits - Count of legacy attributes found.
     * @param {number} ctx.legacyAttrCount - Total legacy attribute count.
     * @param {boolean} ctx.sheetItemAvailable - Whether sheet-item API is available.
     * @param {string} ctx.sandbox - Mod Script Sandbox label, e.g. 'v1.5' or 'unknown'.
     * @param {boolean|null} ctx.beaconCapable - Whether the sandbox reads Beacon values live
     *                                            (null when the version is unknown).
     */
    function processDeathSaveDebugToken(ctx) {
      const {
        token,
        character,
        watched,
        barUsed,
        barValue,
        barMax,
        dyingMarker,
        stableMarker,
        settings,
        legacyHits,
        legacyAttrCount,
        sheetItemAvailable,
        sandbox,
        beaconCapable,
      } = ctx;
      const emitDebug = (attrValues) => {
        const controlledby = character ? character.get('controlledby') : '';
        const lines = [
          `<strong>Token:</strong> ${escapeForChat(token.get('name') || '(no name)')}`,
          `<strong>character:</strong> ${escapeForChat(character ? character.get('name') : '(NOT FOUND)')}`,
          `<strong>isPlayer:</strong> ${!!(character && controlledby !== '')}`,
          `<strong>${barUsed}:</strong> value="${barValue}" max="${barMax}"`,
          `<strong>deathSavesOn:</strong> ${settings.deathSavesOn}`,
          `<strong>success attrs:</strong> ${escapeForChat(settings.dsSuccessAttr)}`,
          `<strong>failure attrs:</strong> ${escapeForChat(settings.dsFailureAttr)}`,
          `<strong>resolved attr values:</strong> ${attrValues}`,
          `<strong>Mod Script Sandbox:</strong> ${escapeForChat(sandbox)}`,
          `<strong>sheet-item API (getSheetItem):</strong> ${sheetItemAvailable ? 'available' : 'not available'}`,
          `<strong>legacy attributes:</strong> ${legacyAttrCount} total; watched fields stored as legacy: ${legacyHits}/${watched.length}`,
          `<strong>markers now:</strong> ${escapeForChat(dyingMarker)}=${token.get(dyingMarker) === true} ${escapeForChat(stableMarker)}=${token.get(stableMarker) === true} status_dead=${token.get('status_dead') === true}`,
        ];
        if (character && watched.length && legacyHits === 0) {
          if (beaconCapable === false) {
            lines.push(
              `⚠ Death saves are not legacy attributes on this sheet (Beacon model) and this game runs Mod Script Sandbox ${escapeForChat(sandbox)}. Live reading needs v${BEACON_SANDBOX_MIN_VERSION}: on v1.0 values read as sheet defaults and markers will not track the sheet.`,
            );
          } else if (beaconCapable === null) {
            lines.push(
              `⚠ Death saves are not legacy attributes on this sheet (Beacon model). Live reading needs Mod Script Sandbox v${BEACON_SANDBOX_MIN_VERSION}; this sandbox did not report its version, so check the API console startup banner (\`Sandbox [v1.5 …]\`).`,
            );
          } else {
            lines.push(
              'Death saves are not legacy attributes on this sheet (Beacon model); they are read live through the sheet-item API.',
            );
          }
        }
        gmWhisper(lines.join('<br>'));
      };

      if (!character || !watched.length) {
        emitDebug(watched.length ? '(character not found)' : '(none configured)');
        return;
      }

      collectDeathSaveWatchValuesWithFallback(character, watched, (resolved) => {
        emitDebug(buildWatchSummary(watched, resolved));
      });
    }

    /**
     * Counts configured watched fields that currently resolve via legacy attributes.
     *
     * @param {string[]} watched - Configured watched field names.
     * @param {object} legacySnapshot - Legacy attribute snapshot map.
     * @returns {number} Number of watched fields with at least one resolved alias.
     */
    function countLegacyWatchedHits(watched, legacySnapshot) {
      let hits = 0;
      for (const name of watched) {
        const aliases = getDeathSaveAttrAliases(name);
        let found = false;
        for (const alias of aliases) {
          if (legacySnapshot[alias]?.exists) {
            found = true;
            break;
          }
        }
        if (found) hits += 1;
      }
      return hits;
    }

    /**
     * Whispers a diagnostic for the selected token(s): link/character, PC detection, HP,
     * the toggle, configured success/failure attributes, and current marker state.
     * Use `!aura deathsaves debug`.
     *
     * @param {object} msg - Roll20 chat message with a populated `selected` array.
     */
    function debugDeathSaves(msg) {
      const s = state.HealthColors;
      const selected = msg.selected || [];
      if (!selected.length) {
        gmWhisper('Select a token, then run !aura deathsaves debug.');
        return;
      }
      const barUsed = s.auraBar;
      const dyingMarker = `status_${s.dsDyingMarker}`;
      const stableMarker = `status_${s.dsStableMarker}`;
      selected.forEach((sel) => {
        const token = getObj('graphic', sel._id);
        if (!token) return;
        const character = getObj('character', token.get('represents'));
        const watched = getConfiguredDeathSaveWatchAttrs(s);
        const barValue = escapeForChat(token.get(`${barUsed}_value`));
        const barMax = escapeForChat(token.get(`${barUsed}_max`));

        // Sandbox/source diagnostics: which fields live in legacy attribute objects,
        // whether the sheet-item API exists, and which Mod Script Sandbox the game runs
        // (Campaign().sandboxVersion), so the GM can see why Beacon reads may be stale.
        const legacySnapshot = character
          ? collectDeathSaveWatchValues(character.id, getDeathSaveProbeFieldSet(watched))
          : {};
        const legacyHits = countLegacyWatchedHits(watched, legacySnapshot);
        const legacyAttrCount = character ? findObjs({ type: 'attribute', characterid: character.id }).length : 0;
        const sheetItemAvailable = typeof getSheetItem === 'function';
        const sandbox = describeSandbox();
        const beaconCapable = isBeaconCapableSandbox();

        processDeathSaveDebugToken({
          token,
          character,
          watched,
          barUsed,
          barValue,
          barMax,
          dyingMarker,
          stableMarker,
          settings: s,
          legacyHits,
          legacyAttrCount,
          sheetItemAvailable,
          sandbox,
          beaconCapable,
        });
      });
    }

    /**
     * Debug: whispers all legacy character-sheet attributes for the selected token(s),
     * optionally filtered by a name substring (recommended — a full D&D sheet has 300+).
     * Each row is `name = current[ / max]`. NOTE: this only sees classic `attribute`
     * objects; Beacon-model fields (e.g. the D&D 2024 death-save checkboxes) live outside
     * that system and won't appear here — read those via `@{}` (the Death-Saves macro).
     * Long lists are split across several whispers (60 rows each).
     *
     * @param {object} msg    - Roll20 chat message with a populated `selected` array.
     * @param {string} needle - Optional case-insensitive name filter.
     */
    function whisperCharacterAttrs(msg, needle) {
      const selected = msg.selected || [];
      if (!selected.length) {
        gmWhisper('Select a token, then run !aura deathsaves attrs [filter].');
        return;
      }
      const filter = (needle || '').toLowerCase();
      selected.forEach((sel) => {
        const token = getObj('graphic', sel._id);
        if (!token) return;
        const character = getObj('character', token.get('represents'));
        if (!character) {
          gmWhisper('Selected token is not linked to a character.');
          return;
        }
        const attrs = findObjs({ type: 'attribute', characterid: character.id })
          .filter(
            (a) =>
              !filter ||
              String(a.get('name') || '')
                .toLowerCase()
                .includes(filter),
          )
          .sort((a, b) => String(a.get('name') || '').localeCompare(String(b.get('name') || '')));
        if (!attrs.length) {
          gmWhisper(
            `No legacy attributes on "${character.get('name')}" matching "${
              needle || '(any)'
            }". Beacon sheets (e.g. D&amp;D 2024) keep many fields outside the legacy attribute system, so they won't appear here.`,
          );
          return;
        }
        const rows = attrs.map((a) => {
          const max = a.get('max');
          const maxPart = max !== '' && max !== undefined ? ` / "${escapeForChat(max)}"` : '';
          return `${escapeForChat(a.get('name'))} = "${escapeForChat(a.get('current'))}"${maxPart}`;
        });
        const CHUNK = 60;
        for (let i = 0; i < rows.length; i += CHUNK) {
          const header =
            i === 0
              ? `<strong>${escapeForChat(character.get('name'))} — ${attrs.length} attribute(s) matching "${escapeForChat(
                  needle || '(any)',
                )}":</strong><br>`
              : '';
          gmWhisper(header + rows.slice(i, i + CHUNK).join('<br>'));
        }
      });
    }

    /**
     * Renders a single watched-attribute status segment.
     *
     * @param {string} name     - Watched attribute name.
     * @param {object} snapshot - Snapshot map keyed by watched name.
     * @returns {string} Formatted status segment.
     */
    function formatWatchEntry(name, snapshot) {
      const entry = resolveDeathSaveSnapshotEntry(snapshot, name);
      const rendered = entry.exists ? `"${escapeForChat(entry.value)}"` : '(missing)';
      return `${name}=${rendered}`;
    }

    /**
     * Builds a CSV summary for watched attributes from a snapshot.
     *
     * @param {string[]} watched - Watched attribute names.
     * @param {object} snapshot  - Snapshot map keyed by watched name.
     * @returns {string} Comma-separated summary.
     */
    function buildWatchSummary(watched, snapshot) {
      const parts = [];
      for (const name of watched) {
        parts.push(formatWatchEntry(name, snapshot));
      }
      return parts.join(', ');
    }

    /**
     * Describes a single watched-value delta, or returns null when unchanged.
     *
     * @param {string} name - Watched attribute name.
     * @param {object} prev - Previous watch entry.
     * @param {object} now  - Current watch entry.
     * @returns {string|null} Change description.
     */
    function describeWatchChange(name, prev, now) {
      if (!prev.exists && now.exists) return `${name}: newly registered as "${escapeForChat(now.value)}"`;
      if (prev.exists && !now.exists) return `${name}: attribute disappeared`;
      if (prev.value === now.value) return null;
      if (prev.value === '' && now.value !== '') return `${name}: new value registered "${escapeForChat(now.value)}"`;
      if (prev.value !== '' && now.value === '') return `${name}: value cleared (was "${escapeForChat(prev.value)}")`;
      return `${name}: "${escapeForChat(prev.value)}" → "${escapeForChat(now.value)}"`;
    }

    /**
     * Computes human-readable changes between two watch snapshots.
     *
     * @param {string[]} watched  - Watched attribute names.
     * @param {object} previous   - Previous snapshot.
     * @param {object} current    - Current snapshot.
     * @returns {string[]} Change lines.
     */
    function collectWatchChanges(watched, previous, current) {
      const changes = [];
      for (const name of watched) {
        const prev = previous[name] || { exists: false, value: '' };
        const now = current[name] || { exists: false, value: '' };
        const change = describeWatchChange(name, prev, now);
        if (change) changes.push(change);
      }
      return changes;
    }

    /**
     * Debug helper that snapshots (and then compares) the currently configured
     * death-save success/failure attributes for each selected character.
     *
     * - First run stores a baseline.
     * - Later runs whisper only meaningful deltas (registered/changed/cleared/missing).
     *
     * Use `!aura deathsaves watch` after selecting token(s).
     * Use `!aura deathsaves watch reset` to clear the saved baseline for selected token(s).
     *
     * @param {object} msg       - Roll20 chat message with a populated `selected` array.
     * @param {string} watchArg  - Optional mode flag (currently supports `reset`).
     */
    function watchDeathSaveAttrs(msg, watchArg) {
      const mode = String(watchArg || '').toLowerCase();
      if (mode === 'status') {
        whisperDeathSaveWatchStatus();
        return;
      }

      const selected = msg.selected || [];
      if (!selected.length) {
        gmWhisper('Select token(s), then run !aura deathsaves watch (or watch reset/watch off).');
        return;
      }

      const s = state.HealthColors;
      if (!s.dsAttrWatch || typeof s.dsAttrWatch !== 'object' || Array.isArray(s.dsAttrWatch)) {
        s.dsAttrWatch = {};
      }
      if (!s.dsAttrWatchActive || typeof s.dsAttrWatchActive !== 'object' || Array.isArray(s.dsAttrWatchActive)) {
        s.dsAttrWatchActive = {};
      }
      const shouldReset = mode === 'reset';
      const shouldDisable = mode === 'off';
      const watched = getConfiguredDeathSaveWatchAttrs(s);
      if (!watched.length) {
        gmWhisper('No death-save watch fields configured. Set deathsaves success/failure fields first.');
        return;
      }

      for (const sel of selected) {
        const token = getObj('graphic', sel._id);
        if (!token) continue;
        const character = getObj('character', token.get('represents'));
        if (!character) {
          gmWhisper('Selected token is not linked to a character.');
          continue;
        }

        const key = character.id;
        if (shouldDisable) {
          // Persist explicit opt-out so auto-arm does not re-enable watch later.
          s.dsAttrWatchActive[key] = false;
          gmWhisper(`Death-save live watch disabled for ${escapeForChat(character.get('name'))}.`);
          continue;
        }

        if (shouldReset) {
          s.dsAttrWatchActive[key] = true;
        }

        collectDeathSaveWatchValuesWithFallback(character, watched, (current) => {
          const watchSummary = buildWatchSummary(watched, current);

          const previous = s.dsAttrWatch[key];
          if (!previous) {
            s.dsAttrWatch[key] = current;
            s.dsAttrWatchActive[key] = true;
            gmWhisper(
              `${escapeForChat(character.get('name'))}: live watch enabled; baseline captured (${watchSummary}).`,
            );
            syncDeathSaveMarkersForCharacter(key, s);
            return;
          }

          if (shouldReset) {
            s.dsAttrWatch[key] = current;
            s.dsAttrWatchActive[key] = true;
            gmWhisper(`${escapeForChat(character.get('name'))}: baseline reset (${watchSummary}).`);
            syncDeathSaveMarkersForCharacter(key, s);
            return;
          }

          const changes = collectWatchChanges(watched, previous, current);

          s.dsAttrWatch[key] = current;
          s.dsAttrWatchActive[key] = true;
          syncDeathSaveMarkersForCharacter(key, s);

          if (changes.length) {
            gmWhisper(`<strong>${escapeForChat(character.get('name'))}:</strong><br>${changes.join('<br>')}`);
          } else {
            gmWhisper(`${escapeForChat(character.get('name'))}: live watch armed, no baseline diff (${watchSummary}).`);
          }
        });
      }
    }

    /**
     * Reports configured death-save watch fields and currently active watched characters.
     *
     * @returns {void}
     */
    function whisperDeathSaveWatchStatus() {
      const s = state.HealthColors;
      const watched = getConfiguredDeathSaveWatchAttrs(s);
      const active = s.dsAttrWatchActive && typeof s.dsAttrWatchActive === 'object' ? s.dsAttrWatchActive : {};
      const snapshots = s.dsAttrWatch && typeof s.dsAttrWatch === 'object' ? s.dsAttrWatch : {};
      const activeIds = Object.keys(active).filter((id) => active[id]);

      if (!activeIds.length) {
        gmWhisper(
          [
            '<strong>Death-save watch status</strong>',
            `<strong>Configured fields:</strong> ${watchedsummary(watched)}`,
            '<strong>Active characters:</strong> 0',
            '<i>No active death-save watchers.</i>',
          ].join('<br>'),
        );
        return;
      }

      const rows = new Array(activeIds.length).fill('');
      let pending = activeIds.length;

      for (let idx = 0; idx < activeIds.length; idx += 1) {
        const id = activeIds[idx];
        const character = getObj('character', id);
        const name = escapeForChat(character ? character.get('name') : `Unknown (${id})`);

        if (!character) {
          const snap = snapshots[id] || {};
          const attrs = buildWatchSummary(watched, snap);
          rows[idx] = `<strong>${name}</strong>: ${attrs}`;
          pending -= 1;
          if (pending === 0) {
            gmWhisper(
              [
                '<strong>Death-save watch status</strong>',
                `<strong>Configured fields:</strong> ${watchedsummary(watched)}`,
                `<strong>Active characters:</strong> ${activeIds.length}`,
                rows.join('<br>'),
              ].join('<br>'),
            );
          }
          continue;
        }

        collectDeathSaveWatchValuesWithFallback(character, watched, (resolved) => {
          snapshots[id] = resolved;
          const attrs = buildWatchSummary(watched, resolved);
          rows[idx] = `<strong>${name}</strong>: ${attrs}`;

          pending -= 1;
          if (pending === 0) {
            gmWhisper(
              [
                '<strong>Death-save watch status</strong>',
                `<strong>Configured fields:</strong> ${watchedsummary(watched)}`,
                `<strong>Active characters:</strong> ${activeIds.length}`,
                rows.join('<br>'),
              ].join('<br>'),
            );
          }
        });
      }
    }

    /**
     * Forces an immediate death-save marker resync for selected tokens.
     * Useful after imports, sheet migrations, or when external updates did not
     * emit a legacy `change:attribute` event.
     *
     * @param {object} msg - Roll20 chat message with a populated `selected` array.
     */
    function syncDeathSavesNow(msg) {
      const s = state.HealthColors;
      if (!s.deathSavesOn) {
        gmWhisper('Death Save Integration is currently off. Enable it first with !aura deathsaves on.');
        return;
      }

      const selected = msg.selected || [];
      if (!selected.length) {
        gmWhisper('Select token(s), then run !aura deathsaves sync.');
        return;
      }

      const seen = {};
      let synced = 0;
      let skippedNpc = 0;
      let skippedNoCharacter = 0;

      for (const sel of selected) {
        const token = getObj('graphic', sel._id);
        if (!token) continue;

        const characterId = token.get('represents');
        if (!characterId) {
          skippedNoCharacter += 1;
          continue;
        }
        if (seen[characterId]) continue;
        seen[characterId] = true;

        const character = getObj('character', characterId);
        if (!character) {
          skippedNoCharacter += 1;
          continue;
        }

        const isPlayer = String(character.get('controlledby') || '') !== '';
        if (!isPlayer) {
          skippedNpc += 1;
          continue;
        }

        ensureDeathSaveWatchForCharacter(character, s);
        syncDeathSaveMarkersForCharacter(characterId, s);
        synced += 1;
      }

      gmWhisper(
        `Death-save sync queued: ${synced} PC character(s). Skipped ${skippedNpc} NPC(s) and ${skippedNoCharacter} unlinked/missing selection(s).`,
      );
    }

    /**
     * Formats watched attribute names for status output.
     *
     * @param {string[]} watched - Lowercase watched attribute names.
     * @returns {string} Human-readable watched field summary.
     */
    function watchedsummary(watched) {
      return watched.length ? watched.map((n) => escapeForChat(n)).join(', ') : '(none)';
    }

    /**
     * Builds resolved success/failure counts from a character's watch snapshot.
     *
     * @param {string} characterId - Roll20 character id.
     * @param {object} s           - HealthColors state object.
     * @param {object} [snapshotOverride] - Optional pre-resolved watch snapshot map.
     * @returns {{succ:number, fail:number}} Parsed death-save counters.
     */
    function getDeathSaveCountsFromSnapshot(characterId, s, snapshotOverride) {
      const watched = getConfiguredDeathSaveWatchAttrs(s);
      const snapshot =
        snapshotOverride || s.dsAttrWatch?.[characterId] || collectDeathSaveWatchValues(characterId, watched);

      const valueFor = (name) => {
        const entry = resolveDeathSaveSnapshotEntry(snapshot, name);
        return entry.exists ? String(entry.value ?? '') : '';
      };

      const succRaw = parseAttrList(s.dsSuccessAttr)
        .map((name) => valueFor(name))
        .join(',');
      const failRaw = parseAttrList(s.dsFailureAttr)
        .map((name) => valueFor(name))
        .join(',');

      return {
        succ: countDeathSaves(succRaw),
        fail: countDeathSaves(failRaw),
      };
    }

    /**
     * Resolves whether a watched attribute belongs to success/failure tracking.
     *
     * @param {string} attrName - Lowercase attribute name.
     * @param {object} s        - HealthColors state object.
     * @returns {('success'|'failure'|null)} Attribute bucket kind.
     */
    function getDeathSaveAttrKind(attrName, s) {
      const lowered = String(attrName || '')
        .trim()
        .toLowerCase();
      if (!lowered) return null;
      if (
        parseAttrList(s.dsSuccessAttr)
          .map((n) => n.toLowerCase())
          .includes(lowered)
      ) {
        return 'success';
      }
      if (
        parseAttrList(s.dsFailureAttr)
          .map((n) => n.toLowerCase())
          .includes(lowered)
      ) {
        return 'failure';
      }
      return null;
    }

    /**
     * Applies current watched death-save counts to all objects-layer tokens for a character.
     *
     * @param {string} characterId                         - Roll20 character id.
     * @param {object} s                                   - HealthColors state object.
     * @param {{kind:('success'|'failure'|null),becameChecked:boolean}} [changeHint]
     *        Hint from the current watched-attribute event. When a new check is registered,
     *        this helps decide whether to show stable (new success) or dying (new failure)
     *        without relying solely on aggregate counts.
     */
    function syncDeathSaveMarkersForCharacter(characterId, s, changeHint) {
      if (!s.deathSavesOn) return;

      const character = getObj('character', characterId);
      if (!character) return;

      const isPlayer = String(character.get('controlledby') || '') !== '';
      if (!isPlayer) return;

      const watched = getConfiguredDeathSaveWatchAttrs(s);
      collectDeathSaveWatchValuesWithFallback(character, watched, (resolvedSnapshot) => {
        if (!state?.HealthColors?.deathSavesOn) return;
        if (!s.dsAttrWatch || typeof s.dsAttrWatch !== 'object' || Array.isArray(s.dsAttrWatch)) s.dsAttrWatch = {};
        s.dsAttrWatch[characterId] = resolvedSnapshot;

        const { succ, fail } = getDeathSaveCountsFromSnapshot(characterId, s, resolvedSnapshot);
        let desired = '';
        if (fail >= 3) desired = 'dead';
        else if (changeHint?.becameChecked && changeHint.kind === 'failure') desired = 'dying';
        else if (succ >= 3) desired = 'stable';
        else if (succ === 0 && fail === 0) desired = 'keep';
        else desired = 'dying';

        findObjs({ type: 'graphic', represents: characterId, layer: 'objects' }).forEach((token) => {
          const hp = Number.parseInt(token.get(`${s.auraBar}_value`), 10);

          if (desired === 'keep') {
            // A mass clear at 0 HP (e.g., sheet reset) should not force a state transition.
            // Keep whichever state marker is currently present for downed tokens.
            if (Number.isFinite(hp) && hp > 0) {
              applyDeathSaveMarker(token, 0, 0);
              return;
            }
            const hasDying = s.dsDyingMarker ? token.get(`status_${s.dsDyingMarker}`) : false;
            const hasStable = s.dsStableMarker ? token.get(`status_${s.dsStableMarker}`) : false;
            const hasDead = token.get('status_dead');
            if (!(hasDying || hasStable || hasDead)) applyDeathSaveMarker(token, 0, 1);
            return;
          }

          if (desired === 'dead') {
            applyDeathSaveMarker(token, 0, 3);
            return;
          }
          if (desired === 'stable') {
            applyDeathSaveMarker(token, 3, 0);
            return;
          }
          applyDeathSaveMarker(token, 0, 1);
        });
      });
    }

    /**
     * Returns the normalized unique list of death-save attributes to watch, sourced
     * from the current success/failure comma-separated settings.
     *
     * @param {object} s - HealthColors state object.
     * @returns {string[]} Lowercase attribute names.
     */
    function getConfiguredDeathSaveWatchAttrs(s) {
      return [
        ...new Set(
          parseAttrList(s.dsSuccessAttr)
            .concat(parseAttrList(s.dsFailureAttr))
            .map((name) =>
              String(name || '')
                .trim()
                .toLowerCase(),
            )
            .filter(Boolean),
        ),
      ];
    }

    /**
     * Collects a snapshot of watched attribute values for a character.
     *
     * @param {string} characterId - Roll20 character id.
     * @param {string[]} watched   - Lowercase attribute names to watch.
     * @returns {Object.<string, {exists: boolean, value: string}>} Snapshot by name.
     */
    function collectDeathSaveWatchValues(characterId, watched) {
      const attrs = findObjs({ type: 'attribute', characterid: characterId });
      const byName = attrs.reduce((acc, a) => {
        const n = String(a.get('name') || '').toLowerCase();
        if (n && !acc[n]) acc[n] = a;
        return acc;
      }, {});

      return watched.reduce((acc, name) => {
        const attr = byName[name];
        const exists = !!attr;
        const value = exists ? String(attr.get('current') ?? '') : '';
        acc[name] = { exists, value };
        return acc;
      }, {});
    }

    /**
     * Returns the persisted game-wide field-name status cache. A Roll20 game uses a
     * single character sheet, so whether a death-save field name resolves is a property
     * of the game, not of one character: 'ok' names resolved before; 'bad' names made
     * Roll20 log a sandbox error (`No attribute or sheet field found ...`) that no
     * try/catch can suppress, so they must never be asked for again. Persisted in state
     * so learned names survive sandbox restarts.
     *
     * @param {object} s - HealthColors state object.
     * @returns {object} Map of lowercase field name → 'ok' | 'bad'.
     */
    function getDeathSaveFieldStatusMap(s) {
      if (!s.dsFieldStatus || typeof s.dsFieldStatus !== 'object' || Array.isArray(s.dsFieldStatus)) {
        s.dsFieldStatus = {};
      }
      return s.dsFieldStatus;
    }

    /**
     * Clears the game-wide field-name status cache, forcing a fresh detection pass.
     * Used when the GM reconfigures the watched fields or forces a manual resync
     * (e.g. after switching the game's character sheet).
     */
    function resetDeathSaveFieldStatus() {
      const s = state?.HealthColors;
      if (s) delete s.dsFieldStatus;
      deathSaveFieldSeedChecked.clear();
    }

    /**
     * Marks candidate field names as known-good when ANY character in the game owns a
     * legacy attribute object with that name — proof the game's sheet uses that naming,
     * without risking an error-logging lookup. Runs at most one findObjs scan per name
     * per sandbox session.
     *
     * @param {object} status    - Game-wide field-name status map to seed.
     * @param {string[]} fields  - Candidate lowercase field names.
     */
    function seedDeathSaveFieldStatus(status, fields) {
      fields.forEach((name) => {
        if (status[name] || deathSaveFieldSeedChecked.has(name)) return;
        deathSaveFieldSeedChecked.add(name);
        const found = findObjs({ type: 'attribute', name }, { caseInsensitive: true });
        if (found.length) status[name] = 'ok';
      });
    }

    /**
     * Returns true when a value still looks like an unresolved `@{}` token.
     *
     * @param {string|undefined|null} value - Candidate resolved value.
     * @returns {boolean} True when unresolved.
     */
    function isUnresolvedAttrReference(value) {
      const v = String(value ?? '').trim();
      return v.includes('@{') || v.includes('}');
    }

    /**
     * Returns true when death-save probe attempts are temporarily suppressed for a character.
     *
     * @param {string} characterId - Roll20 character id.
     * @returns {boolean} True when probe send attempts should be skipped.
     */
    function isDeathSaveProbeBackedOff(characterId) {
      const id = String(characterId || '');
      if (!id) return false;

      const until = Number(deathSaveProbeBackoffUntil[id] || 0);
      if (!until) return false;
      if (Date.now() >= until) {
        delete deathSaveProbeBackoffUntil[id];
        return false;
      }
      return true;
    }

    /**
     * Applies a temporary cooldown after a probe send failure.
     *
     * @param {string} characterId - Roll20 character id.
     */
    function setDeathSaveProbeBackoff(characterId) {
      const id = String(characterId || '');
      if (!id) return;
      deathSaveProbeBackoffUntil[id] = Date.now() + DEATH_SAVE_PROBE_BACKOFF_MS;
    }

    /**
     * Clears any existing probe cooldown for a character.
     *
     * @param {string} characterId - Roll20 character id.
     */
    function clearDeathSaveProbeBackoff(characterId) {
      const id = String(characterId || '');
      if (!id) return;
      delete deathSaveProbeBackoffUntil[id];
    }

    /**
     * Attempts to reserve a single in-flight probe slot for a character.
     *
     * @param {string} characterId - Roll20 character id.
     * @returns {boolean} True when probe can proceed.
     */
    function beginDeathSaveProbe(characterId) {
      const id = String(characterId || '');
      if (!id) return false;
      if (deathSaveProbeInFlight[id]) return false;

      deathSaveProbeInFlight[id] = true;
      if (deathSaveProbeInFlightTimer[id]) clearTimeout(deathSaveProbeInFlightTimer[id]);
      deathSaveProbeInFlightTimer[id] = setTimeout(() => {
        deathSaveProbeInFlight[id] = false;
        delete deathSaveProbeInFlightTimer[id];
      }, DEATH_SAVE_PROBE_INFLIGHT_TIMEOUT_MS);
      return true;
    }

    /**
     * Releases a character's in-flight probe slot.
     *
     * @param {string} characterId - Roll20 character id.
     */
    function endDeathSaveProbe(characterId) {
      const id = String(characterId || '');
      if (!id) return;
      deathSaveProbeInFlight[id] = false;
      if (deathSaveProbeInFlightTimer[id]) {
        clearTimeout(deathSaveProbeInFlightTimer[id]);
        delete deathSaveProbeInFlightTimer[id];
      }
    }

    /**
     * Limits watched-field probe size and logs when truncation occurs.
     *
     * @param {string} characterId - Roll20 character id.
     * @param {string[]} missing    - All missing watched fields.
     * @returns {string[]} Bounded list used for probe payload.
     */
    function getDeathSaveProbeFields(characterId, missing) {
      const missingForProbe = missing.slice(0, DEATH_SAVE_PROBE_MAX_ATTRS);
      if (missing.length > missingForProbe.length) {
        log(
          `${SCRIPT_NAME}: death-save probe field cap reached for ${characterId}; probing ${missingForProbe.length} of ${missing.length} fields.`,
        );
      }
      return missingForProbe;
    }

    /**
     * Merges resolved probe output into a watch snapshot.
     *
     * @param {object} snapshot         - Existing watch snapshot.
     * @param {string[]} missingForProbe - Field names included in probe payload.
     * @param {object[]} ops            - Roll20 sendChat callback payload.
     */
    function applyDeathSaveProbeResponse(snapshot, missingForProbe, ops) {
      const content = String(ops?.[0]?.content || '');
      const resolvedByIndex = {};
      const re = /HC(\d+)<<([\s\S]*?)>>/g;
      let match = re.exec(content);
      while (match) {
        resolvedByIndex[Number.parseInt(match[1], 10)] = match[2];
        match = re.exec(content);
      }

      missingForProbe.forEach((name, idx) => {
        if (!Object.hasOwn(resolvedByIndex, idx)) return;
        const resolved = String(resolvedByIndex[idx] ?? '').trim();
        if (isUnresolvedAttrReference(resolved)) return;
        snapshot[name] = { exists: true, value: resolved };
      });
    }

    /**
     * Logs probe-send failure context and applied retry suppression.
     *
     * @param {string} characterId - Roll20 character id.
     * @param {string} charName    - Character name, if available.
     */
    function logDeathSaveProbeFailure(characterId, charName) {
      const hasName = String(charName || '').trim() !== '';
      if (hasName) {
        log(
          `${SCRIPT_NAME}: death-save probe failed for character ${characterId} (${charName}); suppressing retries for ${DEATH_SAVE_PROBE_BACKOFF_MS}ms.`,
        );
        return;
      }
      log(
        `${SCRIPT_NAME}: death-save probe failed for character ${characterId}; suppressing retries for ${DEATH_SAVE_PROBE_BACKOFF_MS}ms.`,
      );
    }

    /**
     * Tries to queue a death-save probe command using a safe character-name reference.
     *
     * Roll20's chat parser may emit repeated "Unable to find character <id>" errors for
     * `@{<characterId>|attr}` probes in some sandboxes, even when control returns normally.
     * To avoid log storms, this path uses character-name probes only.
     *
     * @param {string} characterId       - Roll20 character id.
     * @param {string} charName          - Character name.
     * @param {string[]} missingForProbe - Missing watched field names used in probe payload.
     * @param {Function} applyResponse   - Probe response handler.
     * @returns {boolean} True when probe was queued.
     */
    function queueDeathSaveProbe(characterId, charName, missingForProbe, applyResponse) {
      const canUseNameRef = charName && !/[|}]/.test(charName);
      if (canUseNameRef && trySendDeathSaveProbe(charName, missingForProbe, applyResponse)) return true;

      endDeathSaveProbe(characterId);
      setDeathSaveProbeBackoff(characterId);
      logDeathSaveProbeFailure(characterId, canUseNameRef ? charName : '');
      return false;
    }

    /**
     * Sends a death-save probe chat command for the supplied character reference.
     *
     * @param {string} characterRef   - Character id or name reference used by `@{...|attr}`.
     * @param {string[]} missing      - Lowercase missing attribute names.
     * @param {Function} onResponse   - Chat callback receiver.
     * @returns {boolean} True when the probe command was queued successfully.
     */
    function trySendDeathSaveProbe(characterRef, missing, onResponse) {
      try {
        const probeParts = missing.map((name, idx) => `HC${idx}<<@{${characterRef}|${name}}>>`);
        sendChat(SCRIPT_NAME, `!hcprobe ${probeParts.join('||')}`, onResponse, { noarchive: true });
        return true;
      } catch (error_) {
        log(`${SCRIPT_NAME}: death-save probe send failed for ref ${characterRef}: ${String(error_)}`);
        return false;
      }
    }

    /**
     * Resolves missing watched fields through the sheet-item API and records
     * each name's outcome in the game-wide field-name status cache. A rejection means
     * the game's sheet does not define that name (Roll20 logs the sandbox error itself,
     * uncatchably), so the name is marked 'bad' and never asked for again.
     *
     * @param {string} characterId - Roll20 character id.
     * @param {string[]} fields    - Missing field names to resolve.
     * @param {object} snapshot    - Snapshot map to merge resolved values into.
     * @param {object} status      - Game-wide field-name status map ('ok'|'bad').
     * @param {Function} onDone    - Called once every field read has settled.
     */
    function collectDeathSaveSheetItemValues(characterId, fields, snapshot, status, onDone) {
      const reads = fields.map((name) => {
        let read;
        try {
          read = Promise.resolve(getSheetItem(characterId, name));
        } catch (error_) {
          read = Promise.reject(error_);
        }
        return read
          .then((value) => {
            if (value === undefined || value === null) return;
            status[name] = 'ok';
            snapshot[name] = { exists: true, value: String(value) };
          })
          .catch(() => {
            if (status[name] !== 'ok') status[name] = 'bad';
          });
      });
      Promise.all(reads).then(onDone, onDone);
    }

    // ————— MOD SCRIPT SANDBOX VERSION —————
    /** Lowest Mod Script Sandbox version whose sheet-item API reads Beacon sheet values live. */
    const BEACON_SANDBOX_MIN_VERSION = 1.5;

    /**
     * Returns the Mod Script Sandbox version this game runs on, as Roll20 reports it.
     * Since the September 2026 rename the sandboxes are v1.0 (formerly "Default") and
     * v1.5 (formerly "Experimental"), and `Campaign().sandboxVersion` exposes the version
     * as a plain property (not via `get`) on both. Returns '' when the property is absent,
     * i.e. a sandbox build that predates it.
     *
     * @returns {string} '1.0', '1.5', or '' when unknown.
     */
    function getSandboxVersion() {
      try {
        const campaign = typeof Campaign === 'function' ? Campaign() : null;
        return String(campaign?.sandboxVersion ?? '').trim();
      } catch (err) {
        return '';
      }
    }

    /**
     * Whether this sandbox reads Beacon sheet values live through the sheet-item API.
     * On v1.0 `getSheetItem` only wraps `getAttrByName`, so Beacon fields come back as
     * sheet defaults.
     *
     * @returns {boolean|null} True on v1.5 or later, false on v1.0, null when unknown.
     */
    function isBeaconCapableSandbox() {
      const version = Number.parseFloat(getSandboxVersion());
      if (Number.isNaN(version)) return null;
      return version >= BEACON_SANDBOX_MIN_VERSION;
    }

    /**
     * Sandbox label for logs, whispers, and the menu footer.
     *
     * @returns {string} e.g. 'v1.5', or 'unknown' when the sandbox does not report one.
     */
    function describeSandbox() {
      const version = getSandboxVersion();
      return version ? `v${version}` : 'unknown';
    }

    /**
     * Sandbox note shown under the Death Save Integration heading in the GM menu.
     * Empty on a sandbox that reads Beacon values live (v1.5 or later), since the
     * note would be redundant there; on v1.0, or when the version is not reported,
     * it states the requirement and what this game runs.
     *
     * @returns {string} HTML span, or '' when no note is needed.
     */
    function sandboxDeathSaveIntegrationNote() {
      if (isBeaconCapableSandbox() === true) return '';
      return `<span>Beacon sheets need Mod Script Sandbox v${BEACON_SANDBOX_MIN_VERSION} for live death-save syncing (this game: ${escapeForChat(describeSandbox())}).</span>`;
    }

    /**
     * One-time GM heads-up when a watched PC stores death saves outside legacy
     * attribute objects (Beacon-model sheets like D&D 2024) and the sandbox cannot
     * read them live. The sheet-item API only returns current Beacon values on Mod
     * Script Sandbox v1.5 or later; on v1.0 it returns sheet defaults. The sandbox
     * version comes from `Campaign().sandboxVersion`, so the notice is skipped on a
     * capable sandbox and only tells the GM to check the startup banner when the
     * version is not reported. Whispered at most once per sandbox session.
     *
     * @param {object} character - Roll20 character object.
     * @param {object} snapshot  - Legacy-attribute snapshot for the watched fields.
     * @param {string[]} watched - Configured watched attribute names.
     */
    function maybeWarnBeaconSheetRead(character, snapshot, watched) {
      if (beaconReadRiskWarned || beaconReadRiskChecked.has(character.id)) return;
      beaconReadRiskChecked.add(character.id);

      const anyLegacyHit = watched.some((name) =>
        getDeathSaveAttrAliases(name).some((alias) => snapshot?.[alias]?.exists),
      );
      if (anyLegacyHit) return;

      const beaconCapable = isBeaconCapableSandbox();
      if (beaconCapable === true) return;

      beaconReadRiskWarned = true;
      const sandbox = escapeForChat(describeSandbox());
      const needed = `Mod Script Sandbox v${BEACON_SANDBOX_MIN_VERSION}`;
      const lines = [
        `⚠ <strong>${escapeForChat(character.get('name'))}</strong>'s death saves are not stored as legacy attributes (Beacon-model sheet, e.g. D&amp;D 2024).`,
        `HealthColors reads them via the sheet-item API, which only returns <strong>live</strong> values on <strong>${needed}</strong> or later.`,
      ];
      if (beaconCapable === false) {
        lines.push(
          `This game runs <strong>Mod Script Sandbox ${sandbox}</strong>, so reads return sheet defaults (often all 0) and markers will NOT track the sheet.`,
          `Switch via Game Settings → Mod (API) Scripts → Mod Script Sandbox → <strong>v1.5 (Latest)</strong>, then Restart. The API console startup banner should then read <strong>Sandbox [v1.5 …]</strong>.`,
        );
      } else {
        lines.push(
          'This sandbox did not report its version, so check the API console startup banner:',
          '• <strong>Sandbox [v1.0 …]</strong> → reads return sheet defaults (often all 0) and markers will NOT track the sheet. Switch via Game Settings → Mod (API) Scripts → Mod Script Sandbox → <strong>v1.5 (Latest)</strong>, then Restart.',
          '• <strong>Sandbox [v1.5 …]</strong> → you are set; ignore this notice.',
        );
      }
      lines.push('<i>(Shown once per sandbox session. !aura deathsaves debug includes these details per token.)</i>');
      gmWhisper(lines.join('<br>'));
    }

    /**
     * Collects watched death-save values from legacy attributes, then falls back to
     * sheet-item/chat-parser resolution for any missing fields (needed for Beacon/2024
     * sheet values that are not exposed as legacy attribute objects).
     *
     * Fallback resolution only runs for configured fields with no resolved alias, and
     * prefers `getSheetItem` (live on Mod Script Sandbox v1.5) over the chat-parser `@{}` probe: chat probes
     * log a hard sandbox error for every name the character's sheet does not know.
     *
     * @param {object} character  - Roll20 character object.
     * @param {string[]} watched  - Lowercase attribute names.
     * @param {Function} callback - Receives merged snapshot.
     */
    function collectDeathSaveWatchValuesWithFallback(character, watched, callback) {
      const done = typeof callback === 'function' ? callback : () => {};
      if (!character || !Array.isArray(watched) || !watched.length) {
        done({});
        return;
      }

      const characterId = character.id;
      const probeInputFields = getDeathSaveProbeFieldSet(watched);

      const snapshot = collectDeathSaveWatchValues(characterId, probeInputFields);

      maybeWarnBeaconSheetRead(character, snapshot, watched);

      const status = getDeathSaveFieldStatusMap(state.HealthColors);
      seedDeathSaveFieldStatus(status, probeInputFields);

      const missingFields = getDeathSaveMissingProbeFields(watched, snapshot, status);
      if (!missingFields.length) {
        done(snapshot);
        return;
      }

      if (isDeathSaveProbeBackedOff(characterId)) {
        done(snapshot);
        return;
      }

      if (!beginDeathSaveProbe(characterId)) {
        done(snapshot);
        return;
      }

      const probeFields = getDeathSaveProbeFields(characterId, missingFields);

      const finish = () => {
        endDeathSaveProbe(characterId);
        clearDeathSaveProbeBackoff(characterId);
        done(snapshot);
      };

      if (typeof getSheetItem === 'function') {
        collectDeathSaveSheetItemValues(characterId, probeFields, snapshot, status, finish);
        return;
      }

      const applyProbeResponse = (ops) => {
        applyDeathSaveProbeResponse(snapshot, probeFields, ops);
        finish();
      };

      const charName = String(character.get('name') || '').trim();
      if (queueDeathSaveProbe(characterId, charName, probeFields, applyProbeResponse)) return;

      done(snapshot);
    }

    /**
     * Auto-arms the live death-save watcher for a player character, using the
     * currently configured success/failure attribute lists.
     *
     * @param {object|undefined} character - Roll20 character object.
     * @param {object} s                   - HealthColors state object.
     */
    function ensureDeathSaveWatchForCharacter(character, s) {
      if (!character) return;

      const watched = getConfiguredDeathSaveWatchAttrs(s);
      if (!watched.length) return;

      if (!s.dsAttrWatch || typeof s.dsAttrWatch !== 'object' || Array.isArray(s.dsAttrWatch)) {
        s.dsAttrWatch = {};
      }
      if (!s.dsAttrWatchActive || typeof s.dsAttrWatchActive !== 'object' || Array.isArray(s.dsAttrWatchActive)) {
        s.dsAttrWatchActive = {};
      }

      // Respect explicit watch-off for this character.
      if (s.dsAttrWatchActive[character.id] === false) return;

      if (!s.dsAttrWatchActive[character.id]) {
        s.dsAttrWatch[character.id] = collectDeathSaveWatchValues(character.id, watched);
      }
      s.dsAttrWatchActive[character.id] = true;
    }

    /**
     * Returns true when a marker tag is present in this campaign's marker list. Used to
     * warn the GM when they configure a marker (like a bare `unconscious`) that won't show.
     *
     * @param {string} tag - Bare marker tag (no `status_` prefix).
     * @returns {boolean} True when the marker exists in this game.
     */
    function markerTagExists(tag) {
      if (!tag) return false;
      const lower = tag.toLowerCase();
      let custom = [];
      try {
        custom = JSON.parse((typeof Campaign === 'function' && Campaign().get('token_markers')) || '[]');
      } catch (err) {
        log(`${SCRIPT_NAME}: failed to parse token markers in markerTagExists: ${String(err)}`);
        custom = [];
      }
      // Match the TAG only (not the display name): a marker renders via `status_<tag>`,
      // so a bare name like `unconscious` whose real tag is `Unconscious::9912` is invalid.
      return custom.some((m) => String(m.tag) === tag || String(m.tag).toLowerCase() === lower);
    }

    /**
     * Builds the confirmation/warning line for a marker setting: confirms the value, or
     * warns it won't render and points to `!aura deathsaves markers` for the real tag.
     *
     * @param {string} label - 'Dying' or 'Stable'.
     * @param {string} tag   - The configured marker tag.
     * @returns {string} A message for gmWhisper.
     */
    function warnIfMarkerMissing(label, tag) {
      if (!tag) return `${label} marker disabled.`;
      if (markerTagExists(tag)) return `${label} marker set to "${tag}".`;
      return `${label} marker set to "${tag}" — ⚠ this isn't a marker in this game and won't render. Run !aura deathsaves markers to find the exact tag (custom markers look like Name::id).`;
    }

    /**
     * Whispers the GM the campaign's available status-marker tags so they can pick the
     * exact value for `!aura deathsaves dyingmarker/stablemarker`. Custom/library markers (e.g.
     * the D&D condition markers, including "Unconscious") have non-obvious tags — often
     * `name::id` — which is what must be used; this lists marker visuals + controls.
     */
    function whisperMarkerList() {
      let custom = [];
      try {
        custom = JSON.parse((typeof Campaign === 'function' && Campaign().get('token_markers')) || '[]');
      } catch (err) {
        log(`${SCRIPT_NAME}: failed to parse token markers in whisperMarkerList: ${String(err)}`);
        custom = [];
      }
      const setBtnStyle =
        'width:auto;min-width:56px;padding-left:6px;padding-right:6px;color:#fff;text-decoration:none;font-weight:bold';
      const rows = custom
        .slice()
        .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
        .map((m) => {
          const name = escapeForChat(m.name || '(unnamed)');
          const tag = String(m.tag || m.name || '');
          const safeUrl = escapeForChat(m.url || '');
          const tagString = escapeForChat(tag || '-');
          const rendered = safeUrl
            ? `<img src="${safeUrl}" alt="${name}" title="${name}" style="width:18px;height:18px;vertical-align:middle;border:1px solid #2e5d78;border-radius:2px;background:#fff"/>`
            : `<span style="font-size:9pt;color:#333">(n/a)</span>`;
          const setDying = makeBtn(
            '<span style="color:#fff">Dying</span>',
            `!aura deathsaves dyingmarker ${tag}`,
            setBtnStyle,
          );
          const setStable = makeBtn(
            '<span style="color:#fff">Stable</span>',
            `!aura deathsaves stablemarker ${tag}`,
            setBtnStyle,
          );
          return `<tr><td style="padding:2px 4px;text-align:center">${rendered}</td><td style="padding:2px 4px;text-align:center;white-space:nowrap">${setDying}${setStable}</td><td style="padding:2px 4px;text-align:left"><strong>${tagString}</strong></td></tr>`;
        });

      const table = rows.length
        ? `<table style="width:100%;border-collapse:collapse;border:1px solid #2e5d78;background:#d8eaf5;color:#111"><thead><tr><th style="padding:3px 4px;text-align:center;border-bottom:1px solid #2e5d78">Marker</th><th style="padding:3px 4px;text-align:center;border-bottom:1px solid #2e5d78">Buttons</th><th style="padding:3px 4px;text-align:left;border-bottom:1px solid #2e5d78">Tag String</th></tr></thead><tbody>${rows.join('')}</tbody></table>`
        : '<i>No campaign markers found.</i>';

      gmWhisper(
        `<strong>Campaign markers</strong><br><span style="font-weight:normal">Use buttons below to set <strong>dyingmarker</strong> or <strong>stablemarker</strong>.</span><br>${table}`,
      );
    }

    /**
     * Routes the `!aura deathsaves ...` configuration subcommands (all GM-only):
     *   on | off | toggle      - enable/disable Death Save Integration
     *   success | failure <a>  - set the attribute name(s) (single or comma-separated list)
     *   dyingmarker | stablemarker - set the dying / stable status markers
     *   markers                - list the campaign's available status-marker tags
     *   attrs [filter]         - list the selected character's legacy attributes (debug)
     *   watch [status|reset|off] - status/arm/refresh/disable live watcher for ds attrs
     *   watchstatus            - alias for `watch status`
     *   sync                   - immediately resync selected PCs from configured ds fields
     *   debug                  - per-token diagnostic for the current selection
     *
     * @param {object}   msg   - Roll20 chat message object.
     * @param {string[]} parts - Whitespace-split message content.
     * @returns {boolean} True when the GM configuration menu should be re-shown afterwards.
     */
    function handleDeathSaves(msg, parts) {
      const s = state.HealthColors;
      const sub = (parts[2] || '').toLowerCase();
      const arg = parts.slice(3).join(' ').trim();

      switch (sub) {
        case 'on':
          setDeathSaves(true);
          break;
        case 'off':
          setDeathSaves(false);
          break;
        case 'toggle':
          setDeathSaves(!s.deathSavesOn);
          break;
        case 'success':
          s.dsSuccessAttr = normalizeAttrName(arg, s.dsSuccessAttr);
          resetDeathSaveFieldStatus();
          gmWhisper(`Death-save success attribute(s) set to "${s.dsSuccessAttr}".`);
          break;
        case 'failure':
          s.dsFailureAttr = normalizeAttrName(arg, s.dsFailureAttr);
          resetDeathSaveFieldStatus();
          gmWhisper(`Death-save failure attribute(s) set to "${s.dsFailureAttr}".`);
          break;
        case 'dyingmarker':
          clearAllDeathSaveMarkers();
          s.dsDyingMarker = normalizeMarkerName(arg, s.dsDyingMarker);
          gmWhisper(warnIfMarkerMissing('Dying', s.dsDyingMarker));
          menuForceUpdate();
          break;
        case 'stablemarker':
          clearAllDeathSaveMarkers();
          s.dsStableMarker = normalizeMarkerName(arg, s.dsStableMarker);
          gmWhisper(warnIfMarkerMissing('Stable', s.dsStableMarker));
          menuForceUpdate();
          break;
        case 'markers':
          whisperMarkerList();
          return false;
        case 'attrs':
          whisperCharacterAttrs(msg, arg);
          return false;
        case 'watch':
          watchDeathSaveAttrs(msg, arg);
          return false;
        case 'watchstatus':
          whisperDeathSaveWatchStatus();
          return false;
        case 'sync':
          // Manual resync is the escape hatch after a sheet change: drop learned
          // field-name knowledge so detection runs fresh.
          resetDeathSaveFieldStatus();
          syncDeathSavesNow(msg);
          return false;
        case 'debug':
          debugDeathSaves(msg);
          return false;
        default:
          gmWhisper(
            'Death Saves: use on, off, toggle, success &lt;attr,...&gt;, failure &lt;attr,...&gt;, dyingmarker &lt;marker&gt;, stablemarker &lt;marker&gt;, markers, attrs &lt;filter&gt;, watch [status|reset|off], watchstatus, sync, debug.',
          );
      }
      return true;
    }

    // ————— MENU —————
    /**
     * Builds a styled Roll20 chat button anchor element.
     *
     * @param {string} label           - Button label text.
     * @param {string} href            - Roll20 API command (e.g. '!aura on').
     * @param {string} [extraStyle=''] - Additional inline CSS to append to the base style.
     * @returns {string} An HTML anchor string ready for sendChat.
     */
    function makeBtn(label, href, extraStyle = '') {
      const base = [
        'padding-top:1px',
        'text-align:center',
        'font-size:9pt',
        'width:48px',
        'height:14px',
        'border:1px solid black',
        'margin:1px',
        'background-color:#6FAEC7',
        'border-radius:4px',
        'box-shadow:1px 1px 1px #707070',
      ].join(';');
      return `<a style="${base};${extraStyle}" href="${href}">${label}</a>`;
    }

    /**
     * Whispers the GM a list of the campaign's custom FX (name + id, with one-click Heal/Hurt
     * set buttons) and a reference of Roll20's built-in `<type>-<colour>` effect names.
     * Triggered by `!aura listfx` and the "List FX" menu button.
     */
    function whisperFxList() {
      const custom = (findObjs({ _type: 'custfx' }) || [])
        .slice()
        .sort((a, b) => String(a.get('name') || '').localeCompare(String(b.get('name') || '')));
      const setBtnStyle =
        'width:auto;min-width:48px;padding-left:6px;padding-right:6px;color:#fff;text-decoration:none;font-weight:bold';
      const rows = custom.map((fx) => {
        const name = escapeForChat(String(fx.get('name') || '').trim() || '(unnamed)');
        const setHeal = makeBtn('<span style="color:#fff">Heal</span>', `!aura heal ${fx.id}`, setBtnStyle);
        const setHurt = makeBtn('<span style="color:#fff">Hurt</span>', `!aura hurt ${fx.id}`, setBtnStyle);
        return `<tr><td style="padding:2px 4px;text-align:center;white-space:nowrap">${setHeal}${setHurt}</td><td style="padding:2px 4px;text-align:left"><strong>${name}</strong></td><td style="padding:2px 4px;text-align:left;font-size:8pt">${fx.id}</td></tr>`;
      });
      const th = 'padding:3px 4px;border-bottom:1px solid #2e5d78';
      const table = rows.length
        ? `<table style="width:100%;border-collapse:collapse;border:1px solid #2e5d78;background:#d8eaf5;color:#111"><thead><tr><th style="${th};text-align:center">Set</th><th style="${th};text-align:left">Custom FX</th><th style="${th};text-align:left">Id</th></tr></thead><tbody>${rows.join('')}</tbody></table>`
        : '<i>No custom FX found in this campaign (create them in the Effects menu).</i>';
      const builtin = [
        `<div style="text-align:left;margin-top:6px;font-size:9pt"><strong>Built-in effects</strong> are named <code>&lt;type&gt;-&lt;colour&gt;</code>, e.g. <code>glow-holy</code>, <code>explode-blood</code>.`,
        `<br><strong>Types:</strong> ${BUILTIN_FX_TYPES.join(', ')}`,
        `<br><strong>Colours:</strong> ${BUILTIN_FX_COLORS.join(', ')}`,
        `<br>Set one with <code>!aura heal &lt;effect&gt;</code> or <code>!aura hurt &lt;effect&gt;</code>; a 6-digit hex colour recolours the default burst instead.</div>`,
      ].join('');
      gmWhisper(
        `<strong>Heal / Hurt FX</strong><br><span style="font-weight:normal">Current: heal = <strong>${escapeForChat(state.HealthColors.HealFX)}</strong>, hurt = <strong>${escapeForChat(state.HealthColors.HurtFX)}</strong></span><br>${table}${builtin}`,
      );
    }

    /** Colours and inline styles shared by the GM menu and the settings snapshot. */
    const MENU_STYLE = {
      outer:
        'border:1px solid #2e5d78;border-radius:6px;overflow:hidden;background-color:#f4f8fb;color:#1b2b36;font-size:9pt;box-shadow:2px 2px 2px #9aa9b5',
      header: 'background-color:#2e5d78;color:#fff;text-align:center;font-weight:bold;font-size:10pt;padding:4px 6px',
      subheader: 'font-weight:normal;font-size:8pt;color:#d8e8f2',
      actions: 'text-align:center;padding:4px 2px;background-color:#dfeaf2;border-bottom:1px solid #b8ccd9',
      section:
        'background-color:#76add6;color:#fff;font-weight:bold;font-size:8.5pt;padding:2px 6px;letter-spacing:0.3px;text-transform:uppercase',
      table: 'width:100%;border-collapse:collapse',
      label: 'padding:2px 6px;text-align:left;vertical-align:middle',
      control: 'padding:2px 4px;text-align:right;vertical-align:middle;white-space:nowrap',
      note: 'padding:2px 6px 4px 6px;font-size:8pt;line-height:1.25em;color:#5b6b78;text-align:left',
      warn: 'padding:2px 6px 4px 6px;font-size:8pt;line-height:1.25em;color:#8a5a00;text-align:left',
      gridHead: 'padding:2px 4px;text-align:center;font-size:8pt;color:#5b6b78',
      btn: 'display:inline-block;min-width:40px;padding:1px 6px;margin:1px;border:1px solid #1f4f6b;border-radius:4px;background-color:#3b82ad;color:#fff;font-size:8.5pt;font-weight:bold;text-align:center;text-decoration:none',
      off: 'background-color:#a84d4d;border-color:#6e2b2b',
      neutral: 'background-color:#9aa5ad;border-color:#6b757c',
      action: 'background-color:#2e5d78;border-color:#1b3a4c',
    };

    /**
     * Builds one control for the menu (a clickable button) or the snapshot (a read-only pill).
     *
     * @param {boolean} interactive  - True for a chat button, false for a read-only pill.
     * @param {string}  label        - Visible text (already escaped where needed).
     * @param {string}  [href]       - API command run by the button.
     * @param {object}  [opts]       - Extra options.
     * @param {string}  [opts.style] - Additional inline CSS.
     * @param {string}  [opts.title] - Hover tooltip.
     * @returns {string} HTML for the control.
     */
    function menuControl(interactive, label, href, { style = '', title = '' } = {}) {
      const css = `${MENU_STYLE.btn};${style}`;
      const tip = title ? ` title="${escapeForChat(title)}"` : '';
      return interactive && href
        ? `<a style="${css}" href="${href}"${tip}>${label}</a>`
        : `<span style="${css}"${tip}>${label}</span>`;
    }

    /**
     * Builds a Yes/No control, red when off.
     *
     * @param {boolean} interactive - Button or pill.
     * @param {boolean} value       - Current value.
     * @param {string}  href        - Toggle command.
     * @returns {string} HTML for the control.
     */
    function menuToggle(interactive, value, href) {
      return menuControl(interactive, value ? 'Yes' : 'No', href, { style: value ? '' : MENU_STYLE.off });
    }

    /**
     * Builds a Yes/No/Off nameplate control: red for No, grey for Off.
     *
     * @param {boolean} interactive - Button or pill.
     * @param {string}  value       - 'Yes', 'No' or 'Off'.
     * @param {string}  href        - Command prefix; the value prompt is appended.
     * @returns {string} HTML for the control.
     */
    function menuName(interactive, value, href) {
      let style = '';
      if (value === 'No') style = MENU_STYLE.off;
      if (value === 'Off') style = MENU_STYLE.neutral;
      return menuControl(interactive, value, `${href} ?{Setting|Yes|No|Off}`, {
        style,
        title: 'Yes = always show, No = always hide, Off = leave the token setting alone',
      });
    }

    /**
     * Builds a titled menu section: a header bar followed by label/control rows.
     *
     * @param {string}   title - Section title.
     * @param {string[]} rows  - Row HTML from menuRow / menuNote.
     * @returns {string} Section HTML.
     */
    function menuSection(title, rows) {
      return `<div style="${MENU_STYLE.section}">${title}</div><table style="${MENU_STYLE.table}">${rows.join('')}</table>`;
    }

    /**
     * Builds one label/control row.
     *
     * @param {string} label   - Setting name.
     * @param {string} control - Control HTML.
     * @returns {string} Table row HTML.
     */
    function menuRow(label, control) {
      return `<tr><td style="${MENU_STYLE.label}">${label}</td><td style="${MENU_STYLE.control}">${control}</td></tr>`;
    }

    /**
     * Builds a full-width note row (small grey text, or amber for warnings).
     *
     * @param {string}  html   - Note content.
     * @param {boolean} [warn] - Use the warning colour.
     * @returns {string} Table row HTML ('' when html is empty).
     */
    function menuNote(html, warn = false) {
      return html ? `<tr><td colspan="2" style="${warn ? MENU_STYLE.warn : MENU_STYLE.note}">${html}</td></tr>` : '';
    }

    /**
     * Short label for a comma-separated list setting, e.g. "3 fields"; the full value goes in the tooltip.
     *
     * @param {string} list - Comma-separated names.
     * @returns {string} Summary label.
     */
    function listSummary(list) {
      const items = String(list || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      if (items.length === 0) return 'none';
      return items.length === 1 ? escapeForChat(items[0]) : `${items.length} fields`;
    }

    /**
     * Builds the settings panel shared by the GM menu (interactive) and the `!aura settings`
     * snapshot (read-only), so the two always show the same settings in the same layout.
     *
     * @param {boolean} interactive - True for the whispered GM menu, false for the public snapshot.
     * @returns {string} Panel HTML.
     */
    function buildSettingsPanel(interactive) {
      const s = state.HealthColors;
      const c = (label, href, opts) => menuControl(interactive, label, href, opts);
      const t = (value, href) => menuToggle(interactive, value, href);
      const n = (value, href) => menuName(interactive, value, href);
      const swatch = (hex) => `background-color:#${hex};color:#111;border-color:#555`;

      const actions = interactive
        ? `<div style="${MENU_STYLE.actions}">${[
            c('Update Selected', '!aura update', {
              style: MENU_STYLE.action,
              title: 'Re-colour the selected token(s) now',
            }),
            c('Refresh All', '!aura forceall', {
              style: MENU_STYLE.action,
              title: 'Re-colour every token on the page',
            }),
            c('Post Settings', '!aura settings', {
              style: MENU_STYLE.action,
              title: 'Post a read-only copy of these settings to game chat',
            }),
          ].join('')}</div>`
        : '';

      const general = menuSection('General', [
        menuRow('Enabled', t(s.auraColorOn, s.auraColorOn ? '!aura off' : '!aura on')),
        menuRow('Health bar', c(s.auraBar, '!aura bar ?{Health bar|1|2|3|4}')),
        menuRow(
          'Colour with',
          c(s.auraTint ? 'Tint' : 'Aura 1', '!aura tint', { title: 'Switch between Aura 1 ring and token tint' }),
        ),
        menuRow('Palette', c(s.colorPalette, '!aura palette ?{Palette|default|colorblind}')),
        menuRow(
          'Show at or below HP %',
          c(`PC ${s.auraPercPC} / NPC ${s.auraPerc}`, '!aura perc ?{PC percent|100} ?{NPC percent|100}', {
            title: '0 = never, 100 = always',
          }),
        ),
        menuRow('Track unlinked tokens', t(s.OneOff, '!aura oneoff')),
      ]);

      const tracking = menuSection('Tracking &amp; markers', [
        menuRow('Track PCs / NPCs', `${t(s.PCAura, '!aura pc')}${t(s.NPCAura, '!aura npc')}`),
        menuRow('Dead marker PCs / NPCs', `${t(s.auraDeadPC, '!aura deadPC')}${t(s.auraDead, '!aura dead')}`),
      ]);

      const names =
        `<div style="${MENU_STYLE.section}">Nameplates</div><table style="${MENU_STYLE.table}">` +
        `<tr><td></td><td style="${MENU_STYLE.gridHead}">PCs</td><td style="${MENU_STYLE.gridHead}">NPCs</td></tr>` +
        `<tr><td style="${MENU_STYLE.label}">GM sees</td><td style="${MENU_STYLE.control};text-align:center">${n(s.GM_PCNames, '!aura gmpc')}</td><td style="${MENU_STYLE.control};text-align:center">${n(s.GM_NPCNames, '!aura gmnpc')}</td></tr>` +
        `<tr><td style="${MENU_STYLE.label}">Players see</td><td style="${MENU_STYLE.control};text-align:center">${n(s.PCNames, '!aura pcpc')}</td><td style="${MENU_STYLE.control};text-align:center">${n(s.NPCNames, '!aura pcnpc')}</td></tr></table>`;

      const aura = menuSection('Aura 1 ring', [
        menuRow('Radius (units)', c(String(s.AuraSize), `!aura size ?{Radius in page units|${s.AuraSize}}`)),
        menuRow('Shape', c(escapeForChat(s.Aura1Shape), `!aura a1shape ?{Shape|${AURA1_SHAPE_CHOICES}}`)),
        menuRow('Opacity %', c(String(s.auraOpacity), `!aura opacity ?{Opacity % (1-100)|${s.auraOpacity}}`)),
        menuRow('Lock for players', t(s.auraLockPlayers, '!aura lock')),
        menuNote(s.auraTint ? 'Tint mode is on: these apply when you switch back to Aura 1.' : ''),
      ]);

      const fx = menuSection('Effects &amp; sound', [
        menuRow('Heal / hurt FX', t(s.FX, '!aura fx')),
        menuRow(
          'Heal effect',
          c(escapeForChat(s.HealFX), `!aura heal ?{Heal FX (hex colour, effect name or default)|${s.HealFX}}`, {
            style: isHex6(s.HealFX) ? swatch(s.HealFX) : '',
          }),
        ),
        menuRow(
          'Hurt effect',
          c(escapeForChat(s.HurtFX), `!aura hurt ?{Hurt FX (hex colour, effect name or default)|${s.HurtFX}}`, {
            style: isHex6(s.HurtFX) ? swatch(s.HurtFX) : '',
          }),
        ),
        menuRow(
          'Death sound',
          c(escapeForChat(s.auraDeadFX), `!aura deadfx ?{Jukebox track(s) or None|${s.auraDeadFX}}`),
        ),
        interactive ? menuRow('Effect list', c('List FX', '!aura listfx')) : '',
      ]);

      const deathSaves = menuSection('Death Save Integration', [
        menuNote(interactive ? sandboxDeathSaveIntegrationNote() : '', true),
        menuRow('Enabled', t(s.deathSavesOn, '!aura deathsaves toggle')),
        menuRow(
          'Success fields',
          c(
            listSummary(s.dsSuccessAttr),
            `!aura deathsaves success ?{Success field(s), comma-separated|${s.dsSuccessAttr}}`,
            {
              title: s.dsSuccessAttr,
            },
          ),
        ),
        menuRow(
          'Failure fields',
          c(
            listSummary(s.dsFailureAttr),
            `!aura deathsaves failure ?{Failure field(s), comma-separated|${s.dsFailureAttr}}`,
            {
              title: s.dsFailureAttr,
            },
          ),
        ),
        menuRow(
          'Dying / stable marker',
          `${c(escapeForChat(s.dsDyingMarker || 'none'), `!aura deathsaves dyingmarker ?{Dying marker|${s.dsDyingMarker}}`)}` +
            `${c(escapeForChat(s.dsStableMarker || 'none'), `!aura deathsaves stablemarker ?{Stable marker|${s.dsStableMarker}}`)}`,
        ),
        menuRow('Dead marker', menuControl(false, 'Red X', '', { style: MENU_STYLE.neutral })),
        interactive
          ? menuRow(
              'Tools',
              `${c('Sync Selected', '!aura deathsaves sync')}${c('Markers', '!aura deathsaves markers')}`,
            )
          : '',
      ]);

      const reference = menuSection('Reference values (not applied)', [
        menuRow(
          'Aura 1 colour',
          c(s.Aura1Color, `!aura a1tint ?{Colour (6-digit hex)|${s.Aura1Color}}`, { style: swatch(s.Aura1Color) }),
        ),
        menuRow(
          'Aura 2 radius / shape',
          `${c(String(s.Aura2Size), `!aura a2size ?{Radius|${s.Aura2Size}}`)}${c(
            escapeForChat(s.Aura2Shape),
            `!aura a2shape ?{Shape|${AURA2_SHAPE_CHOICES}}`,
          )}`,
        ),
        menuRow(
          'Aura 2 colour',
          c(s.Aura2Color, `!aura a2tint ?{Colour (6-digit hex)|${s.Aura2Color}}`, { style: swatch(s.Aura2Color) }),
        ),
      ]);

      const footer = interactive
        ? `<div style="${MENU_STYLE.actions};border-top:1px solid #b8ccd9;border-bottom:0">${c('Open Help', handoutLink())}${c(
            'Rebuild Help',
            '!aura handout',
          )}</div>`
        : '';

      const title = interactive ? 'HealthColors' : 'HealthColors Settings';
      return [
        `<div style="${MENU_STYLE.outer}">`,
        `<div style="${MENU_STYLE.header}">${title} <span style="${MENU_STYLE.subheader}">v${VERSION}</span></div>`,
        actions,
        general,
        tracking,
        names,
        aura,
        fx,
        deathSaves,
        reference,
        footer,
        `</div>`,
      ].join('');
    }

    /**
     * Renders and whispers the interactive HealthColors settings menu to the GM.
     */
    function showMenu() {
      sendChat(SCRIPT_NAME, `/w GM ${buildSettingsPanel(true)}`);
    }

    /**
     * Posts a read-only settings snapshot to public game chat (all players).
     * Triggered by `!aura settings` on demand; not called automatically after changes.
     */
    function showSettingsInGameChat() {
      sendChat(SCRIPT_NAME, buildSettingsPanel(false));
    }

    // ————— HELP HANDOUT —————
    /** Name of the GM-only help handout HealthColors creates and keeps up to date. */
    const HANDOUT_NAME = `${SCRIPT_NAME} — Help & Reference`;

    /**
     * Command reference shown in the help handout, grouped by section. Each row is
     * [command, description]. Keep this in step with the chat handler and README.
     */
    const HANDOUT_COMMANDS = [
      [
        'General',
        [
          ['!aura', 'Open the interactive GM settings menu.'],
          ['!aura settings', 'Post a read-only settings snapshot to game chat.'],
          ['!aura handout', 'Rebuild this help handout.'],
          ['!aura on / !aura off', 'Turn HealthColors on or off for the whole game.'],
          ['!aura forceall', 'Re-colour every token on the Objects layer.'],
          ['!aura update', 'Re-colour the selected tokens only.'],
          ['!aura reset', 'Reset all settings to factory defaults.'],
          ['!aura reset-all', 'Restore defaults, rebuild the default FX and refresh every token.'],
        ],
      ],
      [
        'Health tracking',
        [
          ['!aura bar <1-4>', 'Choose the token bar that holds HP. Bar 4 needs Maximum Token Bubbles/Bars set to 4.'],
          ['!aura tint', 'Switch between Aura 1 mode and Tint mode.'],
          ['!aura palette <default|colorblind>', 'Choose the health colour palette.'],
          ['!aura perc <PC> <NPC>', 'HP % at or below which colour shows: 0 = never, 100 = always.'],
          ['!aura pc / !aura npc', 'Track health on player-character / NPC tokens.'],
          ['!aura dead / !aura deadPC', 'Add the dead (Red X) marker to NPCs / PCs at 0 HP.'],
          ['!aura oneoff', 'Also track tokens that are not linked to a character.'],
        ],
      ],
      [
        'Aura 1 health ring (aura mode)',
        [
          ['!aura size <n>', 'Ring radius in page units (usually feet) beyond the token edge. Default 0.35.'],
          [
            '!aura a1shape <shape>',
            'Ring shape: Auto, Auto Border, Keep, Circle, Square, Hex, Circle Border, Square Border or Hex Border.',
          ],
          ['!aura opacity <1-100>', 'Ring opacity in percent. 100 = solid.'],
          ['!aura lock', 'Stop (or allow) controlling players editing Aura 1.'],
        ],
      ],
      [
        'Reference values (not applied to tokens)',
        [
          ['!aura a1tint <hex>', 'Aura 1 colour reference (aura mode colours the ring by health).'],
          ['!aura a2size <n>', 'Aura 2 radius reference.'],
          ['!aura a2shape <shape>', 'Aura 2 shape reference (any of the six Roll20 shapes).'],
          ['!aura a2tint <hex>', 'Aura 2 colour reference.'],
        ],
      ],
      [
        'Nameplates',
        [
          ['!aura gmpc <Yes|No|Off>', 'GM sees PC nameplates: Yes = always, No = never, Off = leave Roll20 setting.'],
          ['!aura gmnpc <Yes|No|Off>', 'GM sees NPC nameplates.'],
          ['!aura pcpc <Yes|No|Off>', 'Players see PC nameplates.'],
          ['!aura pcnpc <Yes|No|Off>', 'Players see NPC nameplates.'],
        ],
      ],
      [
        'Effects and sound',
        [
          ['!aura fx', 'Turn heal/hurt particle effects on or off.'],
          [
            '!aura heal <effect>',
            'Heal effect: a hex colour, a built-in effect (glow-holy), a custom FX name/id, or default.',
          ],
          ['!aura hurt <effect>', 'Hurt effect: same formats as heal (e.g. explode-blood).'],
          ['!aura listfx', 'List custom FX with Heal/Hurt buttons, plus the built-in effect names.'],
          ['!aura reset-fx', 'Rebuild the -DefaultHeal and -DefaultHurt custom FX.'],
          ['!aura deadfx <track>', 'Jukebox track(s) to play when a token dies (comma-separate for random), or None.'],
        ],
      ],
      [
        'Death Save Integration (optional, PCs only)',
        [
          ['!aura deathsaves on / off / toggle', 'Turn Death Save Integration on or off.'],
          ['!aura deathsaves success <attr,…>', 'Success field name(s).'],
          ['!aura deathsaves failure <attr,…>', 'Failure field name(s).'],
          ['!aura deathsaves dyingmarker <tag>', 'Marker for a dying PC (default skull).'],
          ['!aura deathsaves stablemarker <tag>', 'Marker for a stable PC (default green).'],
          ['!aura deathsaves markers', "List the campaign's status-marker tags."],
          ['!aura deathsaves sync', 'Re-check death-save markers for the selected tokens now.'],
          ['!aura deathsaves debug', 'Diagnostic report for the selected tokens.'],
          ['!aura deathsaves watch [status|reset|off]', 'Debug watcher for the configured fields.'],
          ['!aura deathsaves watchstatus', 'Debug: show the watched fields and characters.'],
          ['!aura deathsaves attrs [filter]', "Debug: list the selected character's legacy attributes."],
        ],
      ],
    ];

    /** Per-character attributes for the help handout: [name, controls, values]. */
    const HANDOUT_ATTRIBUTES = [
      ['USECOLOR', 'Health colour', 'YES = colour this character by health · NO = never colour its tokens.'],
      [
        'USEBLOOD',
        'Hurt FX',
        'DEFAULT = global hurt effect · OFF / NO = no HealthColors FX at all for this character · a hex colour · one or more effect names (built-in or custom), comma-separated.',
      ],
      [
        'USEHEAL',
        'Heal FX',
        'DEFAULT = global heal effect · OFF / NO = no heal FX for this character · a hex colour · one or more effect names, comma-separated.',
      ],
    ];

    /** Optional integrations (besides Death Save Integration) for the help handout: [title, text]. */
    const HANDOUT_INTEGRATIONS = [
      [
        'TokenMod',
        'When TokenMod is installed, HealthColors listens for its token changes, so HP set with !token-mod updates colours, markers and FX like a manual edit.',
      ],
      [
        'SmartAoE',
        "When SmartAoE is installed, HealthColors listens for its token changes, so area damage and healing it applies re-colour tokens and update dead markers. If an AoE has a zeroHPmarker set, SmartAoE's marker is used instead: HealthColors adds no dead (or dying) marker to a token at 0 HP that already carries a SmartAoE 0 HP marker. The death sound still plays.",
      ],
      [
        'AlterBars, ChatSetAttr and other attribute scripts',
        'Scripts that change the HP attribute instead of the token bar are picked up by the attribute listener; no set-up is needed.',
      ],
      [
        'One-Click install options',
        'Every setting can be pre-set in the One-Click install dialog. Values are applied on first start and whenever the dialog is saved; in-game !aura changes are kept between saves.',
      ],
      [
        'Script API',
        "Other scripts can ask HealthColors to re-colour a token with HealthColors.Update(token, prev), where prev is the token's previous values (or {}).",
      ],
    ];

    /** Tips & troubleshooting entries for the help handout: [title, text]. Mirrors the README. */
    const HANDOUT_TIPS = [
      [
        'Aura visibility',
        'The ring radius is in page units from the token edge. The default 0.35 can look subtle; raise it (e.g. 3) or use a border shape for a bolder ring.',
      ],
      [
        'Manual changes',
        'In aura mode, manual Aura 1 colour, radius or shape changes are put back when HP changes or the token is saved. Use Shape Keep to manage shapes yourself, or tint mode to keep Aura 1 free.',
      ],
      [
        'Auto shape',
        'Auto uses Hex on hex-grid pages (vertical or horizontal) once the radius is at least one grid cell (e.g. 5 ft), and Circle otherwise. Roll20 draws hex and square auras in whole grid cells, so a small radius shows little or nothing with those shapes.',
      ],
      [
        'Upgraded from 2.3 or earlier',
        'If Aura 1 Shape shows Keep, the old default Circle was switched so existing shapes were not changed. Pick Auto or another shape to let HealthColors manage it.',
      ],
      [
        'Palette changes',
        'Changing the palette, radius, shape, opacity or player lock refreshes every token straight away.',
      ],
      ['One-off tokens', 'Turn on One Offs to colour tokens that are not linked to a character.'],
      ['Missing max HP', 'A token with no max in the health bar is left uncoloured until a max is set.'],
      ['Bar 4', 'Bar 4 only works when Game Settings → Maximum Token Bubbles/Bars is set to 4.'],
      [
        '"FX … not found" whisper',
        "A configured custom FX (global heal/hurt or a character's USEBLOOD/USEHEAL) no longer exists. Run !aura listfx and choose a valid effect; the default burst plays meanwhile.",
      ],
      [
        'FX colours look wrong',
        'Some sandbox/browser combinations draw FX colours inaccurately. HealthColors updates its default FX objects and spawns them by id to keep colours consistent; !aura reset-fx rebuilds them.',
      ],
      [
        'Death-save markers not updating',
        'On D&D 2024 sheets switch the game to Mod Script Sandbox v1.5. Use !aura deathsaves debug on the token, and !aura deathsaves sync to force a re-check.',
      ],
      [
        'This handout',
        'It is rebuilt when the script loads and after each setting change. Run !aura handout if it goes missing.',
      ],
    ];

    /**
     * Inline styles for the help handout (matches the GM menu's colours). Roll20 strips <style> blocks, so there is no
     * dark-mode media query: body text inherits the theme's colour, accents are mid-tones that read on light and dark
     * backgrounds, and tints are semi-transparent grey.
     */
    const HANDOUT_STYLE = {
      outer: 'font-family:Arial,sans-serif;font-size:13px;',
      header: 'background-color:#2e5d78;color:#fff;padding:10px 12px;border-radius:6px;',
      h1: 'margin:0;font-size:20px;color:#fff;',
      subtitle: 'margin:4px 0 0 0;font-size:12px;color:#d8e8f2;',
      h2: 'margin:18px 0 6px 0;font-size:16px;color:#3d8bbd;border-bottom:2px solid #76ADD6;padding-bottom:2px;',
      h3: 'margin:12px 0 4px 0;font-size:14px;color:#3d8bbd;',
      p: 'margin:4px 0 8px 0;line-height:1.4;',
      table: 'width:100%;border-collapse:collapse;margin:4px 0 10px 0;',
      th: 'background-color:#2e6f96;color:#fff;text-align:left;padding:4px 6px;',
      td: 'padding:4px 6px;border-bottom:1px solid rgba(128,128,128,0.35);vertical-align:top;',
      code: 'font-family:monospace;white-space:nowrap;',
      footer: 'margin-top:16px;font-size:11px;opacity:0.75;',
    };

    /**
     * Escapes text for handout HTML.
     *
     * @param {*} text - Value to escape.
     * @returns {string} HTML-safe text.
     */
    function escapeHandoutHtml(text) {
      return String(text ?? '').replace(
        /[&<>"']/g,
        (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
      );
    }

    /**
     * Builds a handout table.
     *
     * @param {string[]}   headings - Column headings.
     * @param {string[][]} rows     - Cell values (already HTML) per row.
     * @returns {string} Table HTML.
     */
    function handoutTable(headings, rows) {
      const S = HANDOUT_STYLE;
      const head = headings.map((h) => `<th style="${S.th}">${h}</th>`).join('');
      const body = rows
        .map((cells) => `<tr>${cells.map((c) => `<td style="${S.td}">${c}</td>`).join('')}</tr>`)
        .join('');
      return `<table style="${S.table}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    }

    /**
     * Wraps text as inline code in the handout.
     *
     * @param {string} text - Plain text.
     * @returns {string} HTML.
     */
    function handoutCode(text) {
      return `<span style="${HANDOUT_STYLE.code}">${escapeHandoutHtml(text)}</span>`;
    }

    /**
     * Generates the help handout HTML, including a snapshot of the current settings.
     *
     * @returns {string} Handout notes HTML.
     */
    function buildHandoutHtml() {
      const S = HANDOUT_STYLE;
      const s = state.HealthColors || DEFAULTS;
      const yesNo = (v) => (v ? 'Yes' : 'No');
      const p = (html) => `<p style="${S.p}">${html}</p>`;

      const overview =
        `<h2 style="${S.h2}">Overview</h2>` +
        p(
          'HealthColors colours each token by its health so everyone can see how hurt it is at a glance. ' +
            'In <b>aura mode</b> it draws an Aura 1 health ring; in <b>tint mode</b> it tints the whole token. ' +
            'Colours move from healthy to hurt along the chosen palette, turn black at 0 HP and blue above max HP. ' +
            `Type ${handoutCode('!aura')} for the settings menu. This handout is GM-only and is rebuilt every time the script loads or a setting changes.`,
        );

      const shapes =
        `<h2 style="${S.h2}">Aura shapes &amp; appearance</h2>` +
        p('In aura mode HealthColors owns Aura 1 on every coloured token and sets:') +
        handoutTable(
          ['Setting', 'Command', 'What it does'],
          [
            [
              'Radius',
              handoutCode('!aura size <n>'),
              'Page units beyond the token edge (feet on a standard 5 ft grid).',
            ],
            [
              'Shape',
              handoutCode('!aura a1shape <shape>'),
              '<b>Auto</b> = Hex on hex-grid pages when the radius is at least one grid cell, otherwise Circle. <b>Auto Border</b> = the outline versions. ' +
                "<b>Keep</b> = never change the token's shape. Or pick Circle, Square, Hex, Circle Border, Square Border or Hex Border. " +
                'Border shapes draw an outline without shading the token. Two-word shapes can be typed with or without the space.',
            ],
            ['Opacity', handoutCode('!aura opacity <1-100>'), 'Below 100 the map shows through the ring.'],
            [
              'Player lock',
              handoutCode('!aura lock'),
              'Stops controlling players editing Aura 1 while HealthColors manages it.',
            ],
          ],
        ) +
        p(
          'Changing any of these refreshes every token straight away. Manual Aura 1 changes in aura mode are put back when HP changes or the token is saved ' +
            '(use Shape <b>Keep</b> to manage shapes yourself). Switching to tint mode clears Aura 1, returns its shape to Circle (unless Keep) and lets players edit it again. ' +
            'Aura 2 is never touched by HealthColors.',
        );

      const commands =
        `<h2 style="${S.h2}">Commands</h2>` +
        HANDOUT_COMMANDS.map(
          ([section, rows]) =>
            `<h3 style="${S.h3}">${escapeHandoutHtml(section)}</h3>` +
            handoutTable(
              ['Command', 'Description'],
              rows.map(([cmd, desc]) => [handoutCode(cmd), escapeHandoutHtml(desc)]),
            ),
        ).join('');

      const swatch = (rgb) => {
        // eslint-disable-next-line no-bitwise
        const hex = `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1).toUpperCase()}`;
        return `<span style="display:inline-block;width:14px;height:14px;border:1px solid #888;vertical-align:middle;background-color:${hex};"></span> ${hex}`;
      };
      const palettes =
        `<h2 style="${S.h2}">Colour palettes</h2>` +
        p(
          `Choose with ${handoutCode('!aura palette <name>')}; all tokens refresh straight away. Colours blend smoothly from High (100 % HP) through Mid (50 %) to Low (just above 0).`,
        ) +
        handoutTable(
          ['Palette', 'High (100 %)', 'Mid (50 %)', 'Low (near 0)', 'Dead (0 HP)'],
          Object.entries(COLOR_PALETTES).map(([name, c]) => [
            `${handoutCode(name)}${name === s.colorPalette ? ' <b>(in use)</b>' : ''}`,
            swatch(c.high),
            swatch(c.mid),
            swatch(c.low),
            swatch(c.dead),
          ]),
        ) +
        p(`Above max HP (temporary HP) the colour is always blue ${swatch([0, 0, 255])}.`);

      const attributes =
        `<h2 style="${S.h2}">Attribute reference</h2>` +
        p(
          'HealthColors adds these attributes to a character the first time it processes it (USECOLOR as <b>YES</b>, the others as <b>DEFAULT</b>). ' +
            'Edit them on the Attributes &amp; Abilities tab to make one character differ from the global settings.',
        ) +
        handoutTable(
          ['Attribute', 'Controls', 'Values'],
          HANDOUT_ATTRIBUTES.map(([name, controls, values]) => [
            handoutCode(name),
            escapeHandoutHtml(controls),
            escapeHandoutHtml(values),
          ]),
        ) +
        p(
          'A list such as <i>splatter-blood, Bone Shards</i> plays every entry. A custom FX that no longer exists falls back to the default effect and the GM is whispered once.',
        );

      const integrations =
        `<h2 style="${S.h2}">Optional integrations</h2>` +
        `<h3 style="${S.h3}">Death Save Integration${s.deathSavesOn ? ' (on)' : ' (off)'}</h3>` +
        p(
          `Off by default; turn on with ${handoutCode('!aura deathsaves on')}. For player characters at 0 HP it shows <b>dying</b> (default ${handoutCode('skull')}), ` +
            `<b>stable</b> after 3 successes (default ${handoutCode('green')}) and <b>dead</b> after 3 failures (Red X), updating automatically from the watched death-save fields. ` +
            'NPCs keep the plain dead marker. Rules in order: 3+ failures = dead, else 3+ successes = stable, else dying. Healing above 0 HP clears the markers.',
        ) +
        p(
          `Watched fields: success ${handoutCode(s.dsSuccessAttr)}, failure ${handoutCode(s.dsFailureAttr)}. ` +
            `For a custom marker such as Unconscious, get its exact tag from ${handoutCode('!aura deathsaves markers')}. ` +
            `D&amp;D 2024 (Beacon) sheets need Mod Script Sandbox v${BEACON_SANDBOX_MIN_VERSION} (Game Settings → Mod Scripts). This game's sandbox: ${escapeHandoutHtml(describeSandbox())}.`,
        ) +
        HANDOUT_INTEGRATIONS.map(([title, body]) => {
          const isObserver = getTokenObserverScripts().some((e) => e.name === title);
          let status = '';
          if (isObserver) status = isObserverScriptAvailable(title) ? ' (detected)' : ' (not installed)';
          return `<h3 style="${S.h3}">${escapeHandoutHtml(title + status)}</h3>${p(escapeHandoutHtml(body))}`;
        }).join('');

      const tips =
        `<h2 style="${S.h2}">Tips &amp; troubleshooting</h2>` +
        `<ul style="${S.p}">${HANDOUT_TIPS.map(([title, body]) => `<li style="margin-bottom:4px;"><b>${escapeHandoutHtml(title)}:</b> ${escapeHandoutHtml(body)}</li>`).join('')}</ul>`;

      const current =
        `<h2 style="${S.h2}">Current settings</h2>` +
        handoutTable(
          ['Setting', 'Value'],
          [
            ['Enabled', yesNo(s.auraColorOn)],
            ['Health bar', s.auraBar],
            ['Mode', s.auraTint ? 'Tint' : 'Aura 1'],
            ['Palette', s.colorPalette],
            ['Show at or below HP % (PC / NPC)', `${s.auraPercPC} / ${s.auraPerc}`],
            ['Track PCs / NPCs', `${yesNo(s.PCAura)} / ${yesNo(s.NPCAura)}`],
            ['Dead marker on PCs / NPCs', `${yesNo(s.auraDeadPC)} / ${yesNo(s.auraDead)}`],
            ['Aura 1 radius (units)', s.AuraSize],
            ['Aura 1 shape', s.Aura1Shape],
            ['Aura 1 opacity %', s.auraOpacity],
            ['Lock Aura 1 (players)', yesNo(s.auraLockPlayers)],
            ['One-off tokens', yesNo(s.OneOff)],
            ['Heal / hurt FX', `${yesNo(s.FX)} (${s.HealFX} / ${s.HurtFX})`],
            ['Death sound', s.auraDeadFX],
            ['Death Save Integration', yesNo(s.deathSavesOn)],
          ].map(([k, v]) => [escapeHandoutHtml(k), escapeHandoutHtml(v)]),
        );

      const footer = `<p style="${S.footer}">${SCRIPT_NAME} v${VERSION} · Original author DXWarlock · 1.7.1 edit by Surok · v2 by MidNiteShadow7</p>`;

      return (
        `<div style="${S.outer}">` +
        `<div style="${S.header}"><h1 style="${S.h1}">${SCRIPT_NAME}</h1>` +
        `<p style="${S.subtitle}">Version ${VERSION} · Help &amp; Reference</p></div>` +
        `${overview}${commands}${shapes}${palettes}${attributes}${integrations}${tips}${current}${footer}</div>`
      );
    }

    /**
     * Creates the GM-only help handout, or rewrites its notes when it already exists.
     * Extra handouts with the same name are left alone (only the first is updated).
     *
     * @returns {object|undefined} The handout object.
     */
    function installHandout() {
      try {
        const html = buildHandoutHtml();
        const handout =
          findObjs({ _type: 'handout', name: HANDOUT_NAME })[0] ||
          createObj('handout', { name: HANDOUT_NAME, inplayerjournals: '', controlledby: '' });
        if (!handout) return undefined;
        handout.set({ inplayerjournals: '', controlledby: '' });
        handout.set('notes', html);
        return handout;
      } catch (err) {
        log(`${SCRIPT_NAME}: could not update the help handout: ${err?.message || err}`);
        return undefined;
      }
    }

    /**
     * Journal link to the help handout for chat buttons.
     *
     * @returns {string} URL, or the rebuild command when the handout cannot be found.
     */
    function handoutLink() {
      const handout = findObjs({ _type: 'handout', name: HANDOUT_NAME })[0];
      return handout ? `http://journal.roll20.net/handout/${handout.id}` : '!aura handout';
    }

    // ————— CHAT HANDLER —————
    /**
     * Applies normalized option updates that share a common key-mapping pattern.
     *
     * @param {string} option - Uppercase option token.
     * @param {string[]} parts - Command parts.
     * @param {object} s - HealthColors state object.
     * @returns {boolean} True when the option was handled.
     */
    function applyMappedAuraOption(option, parts, s) {
      const TOGGLES = {
        PC: 'PCAura',
        NPC: 'NPCAura',
        DEAD: 'auraDead',
        DEADPC: 'auraDeadPC',
        ONEOFF: 'OneOff',
        FX: 'FX',
        LOCK: 'auraLockPlayers',
      };
      const STRINGS = {
        GMNPC: 'GM_NPCNames',
        GMPC: 'GM_PCNames',
        PCNPC: 'NPCNames',
        PCPC: 'PCNames',
        DEADFX: 'auraDeadFX',
      };
      const FLOATS = { SIZE: 'AuraSize', A2SIZE: 'Aura2Size' };
      const SHAPES = { A1SHAPE: 'Aura1Shape', A2SHAPE: 'Aura2Shape' };
      const HEXES = { A1TINT: 'Aura1Color', A2TINT: 'Aura2Color' };

      if (TOGGLES[option]) {
        s[TOGGLES[option]] = !s[TOGGLES[option]];
        return true;
      }
      if (STRINGS[option]) {
        if (option === 'DEADFX') {
          s[STRINGS[option]] = normalizeTrackName(parts.slice(2).join(' '), s[STRINGS[option]]);
        } else {
          s[STRINGS[option]] = normalizeYesNoOff(parts[2], s[STRINGS[option]]);
        }
        return true;
      }
      if (FLOATS[option]) {
        s[FLOATS[option]] = normalizePositiveNumber(parts[2], s[FLOATS[option]]);
        return true;
      }
      if (SHAPES[option]) {
        // Join the remaining words so two-word shapes ("Circle Border") work from chat.
        s[SHAPES[option]] = normalizeShape(parts.slice(2).join(' '), s[SHAPES[option]], option === 'A1SHAPE');
        return true;
      }
      if (option === 'OPACITY') {
        const pct = normalizePercent(parts[2], s.auraOpacity);
        s.auraOpacity = pct >= 1 ? pct : s.auraOpacity;
        return true;
      }
      if (HEXES[option]) {
        s[HEXES[option]] = normalizeHex6(parts[2], s[HEXES[option]]);
        return true;
      }
      return false;
    }

    /**
     * Executes non-mapped aura commands and indicates whether the caller should
     * return early (no menu refresh here) or continue to showMenu.
     *
     * @param {string} option - Uppercase option token.
     * @param {string[]} parts - Command parts.
     * @param {object} msg - Roll20 message object.
     * @param {object} s - HealthColors state object.
     * @returns {{handled:boolean, earlyReturn:boolean}} Command execution result.
     */
    function runAuraSpecialOption(option, parts, msg, s) {
      const handlers = {
        MENU: () => ({ handled: true, earlyReturn: false }),
        SETTINGS: () => {
          showSettingsInGameChat();
          return { handled: true, earlyReturn: true };
        },
        TINT: () => {
          s.auraTint = !s.auraTint;
          modeSwitch(s.auraTint);
          return { handled: true, earlyReturn: false };
        },
        ON: () => {
          s.auraColorOn = true;
          return { handled: true, earlyReturn: false };
        },
        OFF: () => {
          s.auraColorOn = false;
          return { handled: true, earlyReturn: false };
        },
        BAR: () => {
          if (/^[1-4]$/.test(parts[2] || '')) {
            s.auraBar = `bar${parts[2]}`;
            gmWhisper(`Health bar set to ${s.auraBar}. Forcing sync...`);
            menuForceUpdate();
          } else {
            gmWhisper(
              `Invalid bar "${parts[2] || ''}". Use !aura bar 1, 2, 3 or 4 (bar 4 needs Maximum Token Bubbles/Bars set to 4).`,
            );
          }
          return { handled: true, earlyReturn: false };
        },
        PERC: () => {
          s.auraPercPC = normalizePercent(parts[2], s.auraPercPC);
          s.auraPerc = normalizePercent(parts[3], s.auraPerc);
          menuForceUpdate();
          return { handled: true, earlyReturn: false };
        },
        PALETTE: () => {
          s.colorPalette = normalizePalette(parts[2], s.colorPalette);
          menuForceUpdate();
          return { handled: true, earlyReturn: false };
        },
        HEAL: () => {
          s.HealFX = normalizeFxSetting(parts.slice(2).join(' '), s.HealFX, 'heal', DEFAULTS.HealFX);
          warnedMissingFx.clear();
          syncDefaultFxObjects();
          return { handled: true, earlyReturn: false };
        },
        HURT: () => {
          s.HurtFX = normalizeFxSetting(parts.slice(2).join(' '), s.HurtFX, 'hurt', DEFAULTS.HurtFX);
          warnedMissingFx.clear();
          syncDefaultFxObjects();
          return { handled: true, earlyReturn: false };
        },
        LISTFX: () => {
          whisperFxList();
          return { handled: true, earlyReturn: true };
        },
        HANDOUT: () => {
          const handout = installHandout();
          gmWhisper(
            handout
              ? `Help handout rebuilt: ${makeBtn('Open', handoutLink(), 'width:auto;padding-left:6px;padding-right:6px')}`
              : 'Could not create the help handout. See the API console.',
          );
          return { handled: true, earlyReturn: true };
        },
        RESET: () => {
          delete state.HealthColors;
          gmWhisper('STATE RESET');
          checkInstall();
          return { handled: true, earlyReturn: false };
        },
        'RESET-FX': () => {
          warnedMissingFx.clear();
          resetDefaultFxObjects();
          return { handled: true, earlyReturn: false };
        },
        'RESET-ALL': () => {
          runResetAllFlow();
          return { handled: true, earlyReturn: false };
        },
        FORCEALL: () => {
          menuForceUpdate();
          return { handled: true, earlyReturn: true };
        },
        UPDATE: () => {
          manUpdate(msg);
          return { handled: true, earlyReturn: true };
        },
      };

      const handler = handlers[option];
      return handler ? handler() : { handled: false, earlyReturn: false };
    }

    /** Mapped options that change how the Aura 1 health ring looks, so tokens need repainting. */
    const AURA_APPEARANCE_OPTIONS = new Set(['SIZE', 'A1SHAPE', 'OPACITY', 'LOCK']);

    /**
     * Processes incoming Roll20 chat messages to handle !aura commands.
     * GM-only: non-GMs receive an access-denied whisper.
     * Routes each subcommand (ON/OFF, BAR, TINT, PERC, PC, NPC, HEAL, HURT, LISTFX, HANDOUT, etc.)
     * to the appropriate state mutation then refreshes the menu. BAR validates 1–4,
     * whispers confirmation, and triggers immediate full sync. PALETTE also
     * triggers immediate full sync so existing tokens update right away.
     * When a setting changes, re-whispers the interactive menu to the GM.
     * Use `!aura settings` to post a read-only settings snapshot to public game chat.
     *
     * @param {object} msg - Roll20 chat message object.
     */
    function handleInput(msg) {
      const parts = msg.content.split(/\s+/);
      const command = parts[0].toUpperCase();
      if (msg.type !== 'api' || !command.includes('!AURA')) return;

      const option = (parts[1] || 'MENU').toUpperCase();

      if (!playerIsGM(msg.playerid)) {
        sendChat(SCRIPT_NAME, `/w ${msg.who} you must be a GM to use this command!`);
        return;
      }

      if (option === 'DEATHSAVES') {
        if (handleDeathSaves(msg, parts)) {
          installHandout();
          showMenu();
        }
        return;
      }

      if (!['MENU', 'LISTFX', 'HANDOUT', 'UPDATE', 'SETTINGS'].includes(option)) gmWhisper('UPDATING TOKENS...');

      const s = state.HealthColors;
      if (applyMappedAuraOption(option, parts, s)) {
        // Aura 1 appearance settings are applied to tokens, so repaint them straight away.
        if (AURA_APPEARANCE_OPTIONS.has(option) && !s.auraTint) menuForceUpdate();
      } else {
        const result = runAuraSpecialOption(option, parts, msg, s);
        if (result.earlyReturn) return;
      }

      // Keep the handout's "Current settings" table in step with the change just made.
      if (option !== 'MENU') installHandout();
      showMenu();
    }

    // ————— OUTSIDE API —————
    /**
     * Public entry point for external scripts to request a token color update.
     * Validates that the object is a graphic before delegating to handleToken.
     *
     * @param {object} obj  - Roll20 object to update.
     * @param {object} prev - Previous attribute snapshot (passed through to handleToken).
     */
    function updateToken(obj, prev) {
      if (obj.get('type') === 'graphic') {
        handleToken(obj, prev);
      } else {
        gmWhisper('Script sent non-Token to be updated!');
      }
    }

    // ————— EVENT HANDLERS —————

    /**
     * Processes one token when its linked HP attribute changes via an external script.
     * Constructs a fakePrev with the old HP value so handleToken sees a real delta
     * (enabling FX), then marks the token in recentAttrFires so any subsequent
     * change:graphic for the same token skips redundant particle spawning.
     *
     * Waits 50 ms before acting so Roll20 has time to propagate the attribute change
     * to the token bar. At fire time the live bar value is compared against the expected
     * old and new values: if Roll20 already propagated it (liveVal === newVal) we skip
     * the redundant set; if a concurrent change moved it to a third value we bail
     * entirely to avoid overwriting that later change.
     *
     * @param {string}        barUsed - Configured health bar property name (e.g. 'bar1').
     * @param {string|number} oldVal  - Previous attribute current value.
     * @param {string|number} newVal  - New attribute current value; written to the token bar
     *                                  only when Roll20 has not yet propagated it.
     * @param {object}        token   - Roll20 token graphic object (snapshot at event time).
     */
    function applyAttrHpChange(barUsed, oldVal, newVal, token) {
      const fakePrev = deepClone(token);
      fakePrev[`${barUsed}_value`] = oldVal;

      recentAttrFires.add(token.id);

      setTimeout(() => {
        const liveToken = getObj('graphic', token.id);
        if (!liveToken) return;
        const liveVal = Number(liveToken.get(`${barUsed}_value`));
        const expectedOld = Number(oldVal);
        const expectedNew = Number(newVal);
        // A concurrent change resolved to a third value — bail to avoid overwriting it.
        if (liveVal !== expectedNew && liveVal !== expectedOld) return;
        if (liveVal === expectedOld) liveToken.set(`${barUsed}_value`, expectedNew);
        handleToken(liveToken, fakePrev);
      }, 50);

      setTimeout(() => recentAttrFires.delete(token.id), 250);
    }

    /**
     * Forces a silent (no FX) re-evaluation of a token once Roll20 has propagated a
     * linked attribute's new max to the token bar. Used when only the max changed, which
     * is how sheets that calculate HP max (e.g. 5e Shaped) first make a new token
     * colourable; change:graphic's prev is not reliable for attribute-driven updates, so
     * the attribute event is the trustworthy trigger.
     *
     * @param {object} token - Roll20 token graphic object (snapshot at event time).
     */
    function refreshAfterAttrMaxChange(token) {
      recentAttrFires.add(token.id);
      setTimeout(() => {
        const liveToken = getObj('graphic', token.id);
        if (!liveToken) return;
        handleToken(liveToken, deepClone(liveToken), 'YES');
      }, 50);
      setTimeout(() => recentAttrFires.delete(token.id), 250);
    }

    /**
     * Registers a change:attribute listener that catches HP changes made by scripts
     * such as AlterBars that modify character attributes directly rather than the
     * token bar. Those scripts fire change:attribute but may not fire change:graphic
     * with a correct prev value, so we construct a fakePrev from attr's own prev.current
     * and call handleToken ourselves with a real HP delta (enabling FX).
     * The token ID is added to recentAttrFires so that if change:graphic fires
     * afterwards it receives update='YES', skipping duplicate particle spawning.
     * A change to the attribute's max alone (sheet workers computing HP max) triggers a
     * silent refresh so newly placed tokens are coloured without a value change.
     */
    function registerAttributeListener() {
      on('change:attribute', (attr, prev) => {
        const s = state.HealthColors;
        if (!s?.auraColorOn) return;

        handleWatchedDeathsaveAttrChange(attr, prev, s);

        const barUsed = s.auraBar;
        const charId = attr.get('characterid');
        if (!charId) return;
        const oldVal = prev.current;
        const newVal = attr.get('current');
        const valueChanged = oldVal !== newVal;
        const maxChanged = String(prev.max ?? '') !== String(attr.get('max') ?? '');
        if (!valueChanged && !maxChanged) return;
        findObjs({ type: 'graphic', represents: charId })
          .filter((t) => t.get('layer') === 'objects' && t.get(`${barUsed}_link`) === attr.id)
          .forEach((token) => {
            if (valueChanged) applyAttrHpChange(barUsed, oldVal, newVal, token);
            else refreshAfterAttrMaxChange(token);
          });
      });
    }

    /**
     * Watches configured death-save attributes for active characters and keeps
     * marker sync snapshots up to date.
     *
     * @param {object} attr - Roll20 attribute object.
     * @param {object} prev - Previous attribute snapshot.
     * @param {object} s    - HealthColors state object.
     */
    function handleWatchedDeathsaveAttrChange(attr, prev, s) {
      const attrName = String(attr.get('name') || '').toLowerCase();
      const watched = getConfiguredDeathSaveWatchAttrs(s);
      if (!watched.includes(attrName)) return;

      const charId = attr.get('characterid');
      if (!charId) return;

      // Watch toggle controls debug chat output only; marker sync should continue.
      const watchEnabled = s.dsAttrWatchActive?.[charId] === true;

      if (!s.dsAttrWatch || typeof s.dsAttrWatch !== 'object' || Array.isArray(s.dsAttrWatch)) s.dsAttrWatch = {};
      if (!s.dsAttrWatch[charId] || typeof s.dsAttrWatch[charId] !== 'object') s.dsAttrWatch[charId] = {};

      const prevValue = String(prev.current ?? '');
      const nowValue = String(attr.get('current') ?? '');
      const prior = s.dsAttrWatch[charId][attrName];
      const priorValue = prior ? String(prior.value ?? '') : prevValue;
      const priorExists = prior ? !!prior.exists : Object.hasOwn(prev || {}, 'current');
      const priorChecked = isTruthyAttr(priorValue);
      const nowChecked = isTruthyAttr(nowValue);
      const character = getObj('character', charId);
      const charName = escapeForChat(character ? character.get('name') : `Unknown Character (${charId})`);

      whisperWatchedAttrDelta(watchEnabled, charName, attrName, priorExists, priorValue, nowValue);

      s.dsAttrWatch[charId][attrName] = { exists: true, value: nowValue };
      syncDeathSaveMarkersForCharacter(charId, s, {
        kind: getDeathSaveAttrKind(attrName, s),
        becameChecked: !priorChecked && nowChecked,
      });
    }

    /**
     * Emits live watch chatter for a single watched death-save attribute delta.
     *
     * @param {boolean} watchEnabled - Whether live watch chat output is enabled.
     * @param {string} charName      - Escaped character name.
     * @param {string} attrName      - Raw attribute name.
     * @param {boolean} priorExists  - Whether the attribute previously existed.
     * @param {string} priorValue    - Previous attribute value.
     * @param {string} nowValue      - Current attribute value.
     */
    function whisperWatchedAttrDelta(watchEnabled, charName, attrName, priorExists, priorValue, nowValue) {
      if (!watchEnabled) return;
      const safeAttrName = escapeForChat(attrName);
      if (!priorExists || priorValue === '') {
        if (nowValue !== '') {
          gmWhisper(`<strong>${charName}:</strong> ${safeAttrName} new value registered "${escapeForChat(nowValue)}"`);
        }
        return;
      }
      if (priorValue === nowValue) return;
      if (nowValue === '') {
        gmWhisper(`<strong>${charName}:</strong> ${safeAttrName} value cleared (was "${escapeForChat(priorValue)}")`);
        return;
      }
      gmWhisper(
        `<strong>${charName}:</strong> ${safeAttrName} "${escapeForChat(priorValue)}" -> "${escapeForChat(nowValue)}"`,
      );
    }

    /**
     * Returns true when the character has at least one objects-layer token at 0 HP or lower.
     *
     * @param {string} characterId - Roll20 character id.
     * @param {object} s           - HealthColors state object.
     * @returns {boolean} True when a downed objects-layer token exists.
     */
    function hasDownedObjectToken(characterId, s) {
      return findObjs({ type: 'graphic', represents: characterId, layer: 'objects' }).some((token) => {
        const hp = Number.parseInt(token.get(`${s.auraBar}_value`), 10);
        return Number.isFinite(hp) && hp <= 0;
      });
    }

    /**
     * Starts a lightweight periodic sync loop so Beacon/2024 death-save fields (which do
     * not fire change:attribute) still update markers while characters are downed.
     */
    function startDeathSavePoller() {
      if (deathSavePollTimer) return;
      deathSavePollTimer = setInterval(() => {
        const s = state.HealthColors;
        if (!s?.deathSavesOn) return;
        const active = s.dsAttrWatchActive && typeof s.dsAttrWatchActive === 'object' ? s.dsAttrWatchActive : {};
        const activeIds = Object.keys(active).filter((id) => active[id]);
        if (!activeIds.length) return;

        activeIds.forEach((charId) => {
          const character = getObj('character', charId);
          if (!character) return;
          if (String(character.get('controlledby') || '') === '') return;
          if (!hasDownedObjectToken(charId, s)) return;
          syncDeathSaveMarkersForCharacter(charId, s);
        });
      }, DEATH_SAVE_POLL_INTERVAL_MS);
    }

    /**
     * Registers all Roll20 event listeners for the script.
     * - chat:message     → handleInput       (command processing)
     * - change:graphic   → handleTokenChange (live HP changes, token resizes, and bar max /
     *                                         link / represents changes; suppresses FX when
     *                                         the attribute listener already fired)
     * - change:attribute → registerAttributeListener (AlterBars / indirect HP changes and
     *                                                 max-only changes from sheet workers)
     * - add:graphic      → handleToken       (with 400ms delay to allow token data to settle)
     */
    function registerEventHandlers() {
      on('chat:message', handleInput);
      on('change:graphic', handleTokenChange);
      on('add:graphic', (t) => {
        setTimeout(() => {
          const token = getObj('graphic', t.id);
          if (!token) return;
          const prev = deepClone(token);
          handleToken(token, prev, 'YES');
        }, 400);
      });
      registerAttributeListener();
      startDeathSavePoller();
    }

    // ————— BOOTSTRAP —————
    const publicApi = {
      gmWhisper,
      GMW: gmWhisper,
      update: updateToken,
      Update: updateToken,
      checkInstall,
      CheckInstall: checkInstall,
      registerEventHandlers,
      RegisterEventHandlers: registerEventHandlers,
    };

    globalThis.HealthColors = publicApi;

    on('ready', () => {
      const settingsBtn = makeBtn('⚙ Settings', '!aura', 'width:auto;padding-left:6px;padding-right:6px');
      gmWhisper(`<strong>Script Ready</strong> (v${VERSION})<br>${settingsBtn}`);
      checkInstall();
      installHandout();
      registerEventHandlers();
    });

    return publicApi;
  })();
