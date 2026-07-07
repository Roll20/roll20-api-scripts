// ===========================
// === HealthColors v2.2.1 ===
// ===========================

// AUTHORS:
//  - DXWarlock: https://app.roll20.net/users/262130/dxwarlock
//  - Surok: https://app.roll20.net/users/335573/surok
//  - MidNiteShadow7: https://app.roll20.net/users/16506286/midniteshadow7

/* global createObj TokenMod spawnFxWithDefinition spawnFx getObj state playerIsGM sendChat findObjs Campaign log on getSheetItem */

var HealthColors =
  HealthColors ||
  (() => {
    'use strict';

    // ————— CONSTANTS —————
    const VERSION = '2.2.1';
    const SCRIPT_NAME = 'HealthColors';
    const SCHEMA_VERSION = '1.1.0';
    const UPDATED = '2026-07-03 06:00 UTC';

    // ————— DEFAULTS —————
    /**
     * Default values written into `state.HealthColors` on first install or after a reset.
     * Every key maps directly to a property used at runtime — changing a value here changes
     * the out-of-the-box behavior for new or reset campaigns.
     *
     * @property {boolean} auraColorOn  - Master on/off switch for the whole script.
     * @property {string}  auraBar      - Which token bar to read HP from ('bar1'|'bar2'|'bar3').
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
     * @property {number}  AuraSize     - Feet the aura extends beyond the token edge.
     * @property {string}  Aura1Shape   - Display/default Aura 1 shape shown in output.
     * @property {string}  Aura1Color   - Display/default Aura 1 tint shown in output.
     * @property {number}  Aura2Size    - Display/default Aura 2 radius shown in output.
     * @property {string}  Aura2Shape   - Display/default Aura 2 shape shown in output.
     * @property {string}  Aura2Color   - Display/default Aura 2 tint value shown in output.
     * @property {boolean} OneOff       - When true, tokens without a linked character also get auras.
     * @property {boolean} FX           - Whether to spawn particle FX on HP changes.
     * @property {string}  HealFX       - Hex color (no '#') used for the healing particle effect.
     * @property {string}  HurtFX       - Hex color (no '#') used for the hurt/damage particle effect.
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
      Aura1Shape: 'Circle',
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
     * Normalizes an aura shape label to supported display values.
     *
     * @param {string} value    - Candidate shape value.
     * @param {string} fallback - Fallback shape.
     * @returns {string} One of Circle|Square.
     */
    function normalizeShape(value, fallback) {
      const shape = (value || '').trim().toUpperCase();
      if (shape === 'CIRCLE') return 'Circle';
      if (shape === 'SQUARE') return 'Square';
      return fallback;
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
     * When in tint mode, sets tint_color. When in aura mode, sets aura radius and color.
     * Roll20 measures aura1_radius from the token edge, so sizeSet maps directly.
     *
     * @param {object} obj         - Roll20 token object.
     * @param {number} sizeSet     - Feet the ring extends beyond the token edge (e.g. 0.35).
     * @param {string} markerColor - Hex color string derived from health percentage.
     */
    function tokenSet(obj, sizeSet, markerColor) {
      const useTint = state.HealthColors.auraTint;
      if (useTint) {
        obj.set({ tint_color: markerColor });
      } else {
        obj.set({
          tint_color: 'transparent',
          aura1_radius: sizeSet,
          aura1_color: markerColor,
          showplayers_aura1: true,
        });
      }
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
     * Initializes or migrates persisted state, applies all default values, registers
     * the TokenMod observer if available, and creates the default Hurt/Heal FX objects
     * if they do not already exist in the campaign.
     * Safe to call multiple times (e.g. after a state reset).
     */
    function checkInstall() {
      log(`-=> ${SCRIPT_NAME} v${VERSION} [Updated: ${UPDATED}] <=-`);
      if (state?.HealthColors?.schemaVersion !== SCHEMA_VERSION) {
        log(`<${SCRIPT_NAME} Updating Schema to v${SCHEMA_VERSION}>`);
        state.HealthColors = { schemaVersion: SCHEMA_VERSION, version: VERSION };
      }
      migrateDeathSaveState();
      Object.keys(DEFAULTS).forEach((key) => {
        if (state.HealthColors[key] === undefined) state.HealthColors[key] = DEFAULTS[key];
      });
      state.HealthColors.colorPalette = normalizePalette(state.HealthColors.colorPalette, DEFAULTS.colorPalette);
      if (typeof TokenMod !== 'undefined' && TokenMod.ObserveTokenChange) {
        TokenMod.ObserveTokenChange(handleTokenChange);
      }
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
     * Builds the normalized default Hurt/Heal definition payload used for
     * campaign custom FX objects.
     *
     * @param {boolean} isHeal - True for Heal profile, false for Hurt profile.
     * @param {object} baseDef - Existing definition to merge into.
     * @returns {object} Updated definition with normalized color/profile fields.
     */
    function buildDefaultFxDefinition(isHeal, baseDef) {
      const def = { ...baseDef };
      const rgb = hexToRgb(isHeal ? state.HealthColors.HealFX : state.HealthColors.HurtFX);
      def.startColour = rgb;
      def.startColor = rgb;
      def.endColour = rgb;
      def.endColor = rgb;
      def.startColourRandom = [0, 0, 0, 0];
      def.startColorRandom = [0, 0, 0, 0];
      def.endColourRandom = [0, 0, 0, 0];
      def.endColorRandom = [0, 0, 0, 0];

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
     * Keeps schema/version metadata aligned to current script constants.
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
     */
    function applyDeadStatus(obj, curValue, prevValue, hasPrevValue) {
      if (curValue > 0) {
        obj.set('status_dead', false);
        return;
      }
      const deadSfx = state.HealthColors.auraDeadFX;
      if (deadSfx !== 'None' && hasPrevValue && curValue !== prevValue) playDeath(deadSfx);
      obj.set('status_dead', true);
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

      // Death Save Integration (PC-only) owns the dying/stable/dead markers when enabled.
      const deathSaveHandled = applyDeathSaveStatus(obj, curValue, isPlayer);
      if (!deathSaveHandled && showDead) applyDeadStatus(obj, curValue, prevValue, hasPrevValue);

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
      } else if (obj.get(`${colorType}_color`) === markerColor) {
        clearAuras(obj);
      }
    }

    /**
     * Builds the list of FX definition objects to spawn for a heal or hurt event.
     *
     * @param {boolean}          isHeal    - True when HP went up.
     * @param {string|undefined} useBlood  - Per-character blood FX override value.
     * @param {string}           [label]   - Character/token name for error context.
     * @returns {object[]} Array of Roll20 custfx definition objects.
     */
    function buildFXList(isHeal, useBlood, label) {
      const fxArray = [];

      if (isHeal) {
        const aFX = findObjs({ _type: 'custfx', name: '-DefaultHeal' }, { caseInsensitive: true })[0];
        const def = getFxDefinition(aFX);

        if (def) {
          const healRgb = hexToRgb(state.HealthColors.HealFX);
          def.startColour = healRgb;
          def.startColor = healRgb;
          def.endColour = healRgb;
          def.endColor = healRgb;
          def.startColourRandom = [0, 0, 0, 0];
          def.startColorRandom = [0, 0, 0, 0];
          def.endColourRandom = [0, 0, 0, 0];
          def.endColorRandom = [0, 0, 0, 0];
          fxArray.push(def);
        }

        return fxArray;
      }

      const aFX = findObjs({ _type: 'custfx', name: '-DefaultHurt' }, { caseInsensitive: true })[0];
      const def = getFxDefinition(aFX);

      if (!def) return fxArray;

      if (useBlood === 'DEFAULT' || useBlood === undefined) {
        const hurtRgb = hexToRgb(state.HealthColors.HurtFX);
        def.startColour = hurtRgb;
        def.startColor = hurtRgb;
        def.endColour = hurtRgb;
        def.endColor = hurtRgb;
        def.startColourRandom = [0, 0, 0, 0];
        def.startColorRandom = [0, 0, 0, 0];
        def.endColourRandom = [0, 0, 0, 0];
        def.endColorRandom = [0, 0, 0, 0];
        fxArray.push(def);
      } else {
        const normalizedUseBlood = String(useBlood || '').trim();
        const hurtRgb = hexToRgb(normalizedUseBlood);

        if (hurtRgb.some((v) => v !== 0)) {
          def.startColour = hurtRgb;
          def.startColor = hurtRgb;
          def.endColour = hurtRgb;
          def.endColor = hurtRgb;
          def.startColourRandom = [0, 0, 0, 0];
          def.startColorRandom = [0, 0, 0, 0];
          def.endColourRandom = [0, 0, 0, 0];
          def.endColorRandom = [0, 0, 0, 0];
          fxArray.push(def);
        } else {
          const fxNames = normalizedUseBlood
            .split(',')
            .map((fxName) => fxName.trim())
            .filter((fxName) => fxName !== '');

          if (fxNames.length === 0) {
            const hurtRgb = hexToRgb(state.HealthColors.HurtFX);
            def.startColour = hurtRgb;
            def.startColor = hurtRgb;
            def.endColour = hurtRgb;
            def.endColor = hurtRgb;
            def.startColourRandom = [0, 0, 0, 0];
            def.startColorRandom = [0, 0, 0, 0];
            def.endColourRandom = [0, 0, 0, 0];
            def.endColorRandom = [0, 0, 0, 0];
            fxArray.push(def);
            return fxArray;
          }

          fxNames.forEach((fxName) => {
            const custom = findObjs({ _type: 'custfx', name: fxName.trim() }, { caseInsensitive: true })[0];
            const customDef = getFxDefinition(custom);

            if (customDef) {
              fxArray.push(customDef);
            } else {
              const who = label ? ` (character: "${label}")` : '';
              log(`${SCRIPT_NAME}: Custom FX "${fxName.trim()}"${who} not found — check the USEBLOOD attribute.`);
              gmWhisper(
                `Custom FX "${fxName.trim()}"${who} not found. Fix the USEBLOOD attribute on that character. Falling back to default hurt FX.`,
              );
              const fallbackFx = findObjs({ _type: 'custfx', name: '-DefaultHurt' }, { caseInsensitive: true })[0];
              const fallbackDef = getFxDefinition(fallbackFx);
              if (fallbackDef) fxArray.push(fallbackDef);
            }
          });
        }
      }

      return fxArray;
    }

    /**
     * Spawns the default heal or hurt FX by their saved custfx ID using spawnFx.
     * This avoids client-side color inconsistencies seen in some sandboxes when using
     * spawnFxWithDefinition directly. Only handles DEFAULT heal/hurt colors; custom
     * named FX (USEBLOOD set to a custfx name) still use the definition-spawn path.
     *
     * @param {object}           obj      - Roll20 token graphic object.
     * @param {boolean}          isHeal   - True when HP increased.
     * @param {string|undefined} useBlood - Per-character blood override value.
     * @returns {boolean} True when spawning was handled; false if the caller should fall back.
     */
    function spawnDefaultFxById(obj, isHeal, useBlood) {
      if (!(useBlood === 'DEFAULT' || useBlood === undefined)) return false;
      const fxName = isHeal ? '-DefaultHeal' : '-DefaultHurt';
      const aFX = findObjs({ _type: 'custfx', name: fxName }, { caseInsensitive: true })[0];
      if (!aFX) return false;

      spawnFx(obj.get('left'), obj.get('top'), aFX.id, obj.get('pageid'));
      return true;
    }

    /**
     * Gates and triggers particle FX when HP changes on a non-forced update.
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
      const useBlood = oCharacter ? lookupUseBlood(oCharacter) : undefined;
      if (!state.HealthColors.FX || useBlood === 'OFF' || useBlood === 'NO') return;
      const isHeal = curValue > prevValue;
      const amount = Math.abs(curValue - prevValue);
      const scale = obj.get('height') / 70;
      const hitSize = Math.max(Math.min((amount / maxValue) * 4, 1), 0.2) * (randomInt(60, 100) / 100);
      const fxLabel = (oCharacter && oCharacter.get('name')) || obj.get('name') || '';
      if (spawnDefaultFxById(obj, isHeal, useBlood)) return;
      buildFXList(isHeal, useBlood, fxLabel).forEach((fx) =>
        spawnFX(scale, hitSize, obj.get('left'), obj.get('top'), fx, obj.get('pageid')),
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

      // Only skip when nothing relevant changed. The `curValue > 0` clause means we never
      // skip while a token is at/below 0 HP: on linked-attribute sheets (D&D 2024) a drop
      // can arrive with prev === cur (unreliable prev), and we still need the death-save /
      // dead marker logic to run. Re-processing at 0 HP is idempotent and cheap.
      if (hasPrevValue && curValue === prevValue && curValue > 0 && update !== 'YES' && !sizeChanged) return;

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
     * it clears aura1 on each token before re-evaluating health, ensuring no stale
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
        if (toTint) token.set({ aura1_color: 'transparent', aura1_radius: 0 });
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
      const allNames = msg.selected.reduce((acc, obj) => {
        const token = getObj('graphic', obj._id);
        const prev = deepClone(token);
        handleToken(token, prev, 'YES');
        return `${acc}${token.get('name')}<br>`;
      }, '');
      gmWhisper(allNames);
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
      if (fail >= 3) {
        if (s.auraDeadFX !== 'None' && !token.get('status_dead')) playDeath(s.auraDeadFX);
        token.set(buildDeathSaveMarkerPatch(false, false, true));
        return 'dead';
      }
      if (succ >= 3) {
        token.set(buildDeathSaveMarkerPatch(false, true, false));
        return 'stable';
      }
      token.set(buildDeathSaveMarkerPatch(true, false, false));
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
          `<strong>sheet-item API (getSheetItem):</strong> ${sheetItemAvailable ? 'available' : 'not available'}`,
          `<strong>legacy attributes:</strong> ${legacyAttrCount} total; watched fields stored as legacy: ${legacyHits}/${watched.length}`,
          `<strong>markers now:</strong> ${escapeForChat(dyingMarker)}=${token.get(dyingMarker) === true} ${escapeForChat(stableMarker)}=${token.get(stableMarker) === true} status_dead=${token.get('status_dead') === true}`,
        ];
        if (character && watched.length && legacyHits === 0) {
          lines.push(
            '⚠ Death saves are not legacy attributes on this sheet (Beacon model). Live reading requires the EXPERIMENTAL (Jumpgate) Mod sandbox — if the API console startup banner says [DEFAULT], values read as sheet defaults and markers will not track the sheet.',
          );
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

        // Sandbox/source diagnostics: which fields live in legacy attribute objects, and
        // whether the sheet-item API exists. The Mod server cannot report Default vs
        // Experimental directly, so surface the facts the GM needs to judge it.
        const legacySnapshot = character
          ? collectDeathSaveWatchValues(character.id, getDeathSaveProbeFieldSet(watched))
          : {};
        const legacyHits = countLegacyWatchedHits(watched, legacySnapshot);
        const legacyAttrCount = character ? findObjs({ type: 'attribute', characterid: character.id }).length : 0;
        const sheetItemAvailable = typeof getSheetItem === 'function';

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
     * Resolves missing watched fields through the Jumpgate sheet-item API and records
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

    /**
     * One-time GM heads-up when a watched PC stores death saves outside legacy
     * attribute objects (Beacon-model sheets like D&D 2024). Reading those live
     * depends on the sheet-item API, which only returns current values on the
     * Experimental (Jumpgate) Mod sandbox. The Mod server cannot detect which
     * sandbox it is running on (confirmed by Roll20 staff), so the best we can do
     * is detect the situation that makes the sandbox version matter and tell the
     * GM what to check. Whispered at most once per sandbox session.
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

      beaconReadRiskWarned = true;
      gmWhisper(
        [
          `⚠ <strong>${escapeForChat(character.get('name'))}</strong>'s death saves are not stored as legacy attributes (Beacon-model sheet, e.g. D&amp;D 2024).`,
          'HealthColors reads them via the sheet-item API, which only returns <strong>live</strong> values on the <strong>Experimental (Jumpgate)</strong> Mod sandbox. The Mod server cannot detect which sandbox it is running on, so check the API console startup banner:',
          '• Banner says <strong>[DEFAULT …]</strong> → reads return sheet defaults (often all 0) and markers will NOT track the sheet. Switch via Game Settings → Mod (API) Scripts → API Sandbox Version → <strong>Experimental</strong>, then Restart — and re-check the banner, the setting can silently revert.',
          '• Banner says <strong>EXPERIMENTAL</strong> → you are set; ignore this notice.',
          '<i>(Shown once per sandbox session. !aura deathsaves debug includes these details per token.)</i>',
        ].join('<br>'),
      );
    }

    /**
     * Collects watched death-save values from legacy attributes, then falls back to
     * sheet-item/chat-parser resolution for any missing fields (needed for Beacon/2024
     * sheet values that are not exposed as legacy attribute objects).
     *
     * Fallback resolution only runs for configured fields with no resolved alias, and
     * prefers `getSheetItem` (Jumpgate) over the chat-parser `@{}` probe: chat probes
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
     * Builds a non-interactive styled value pill for read-only output panels.
     *
     * @param {string} label           - Display text.
     * @param {string} [extraStyle=''] - Additional inline CSS to append to base style.
     * @returns {string} A styled span element.
     */
    function makePill(label, extraStyle = '') {
      const base = [
        'display:inline-block',
        'padding-top:1px',
        'text-align:center',
        'font-size:9pt',
        'min-width:48px',
        'height:14px',
        'border:1px solid black',
        'margin:1px',
        'background-color:#6FAEC7',
        'border-radius:4px',
        'box-shadow:1px 1px 1px #707070',
        'line-height:14px',
        'padding-left:4px',
        'padding-right:4px',
      ].join(';');
      return `<span style="${base};${extraStyle}">${label}</span>`;
    }

    /**
     * Builds a toggle-style button that shows red when the value is false/off.
     *
     * @param {boolean} value - Current boolean state (true = on/default blue, false = off/red).
     * @param {string}  href  - Roll20 API command to execute on click.
     * @returns {string} An HTML anchor string.
     */
    function toggleBtn(value, href) {
      const style = value === true ? '' : 'background-color:#A84D4D';
      return makeBtn(value === true ? 'Yes' : 'No', href, style);
    }

    /**
     * Builds a three-state name-setting button. Red for 'No', grey for 'Off', default for 'Yes'.
     *
     * @param {string} value - Current value: 'Yes', 'No', or 'Off'.
     * @param {string} href  - Roll20 API command to execute on click.
     * @returns {string} An HTML anchor string.
     */
    function nameBtn(value, href) {
      let style = '';
      if (value === 'No') style = 'background-color:#A84D4D';
      if (value === 'Off') style = 'background-color:#D6D6D6';
      return makeBtn(value, href, style);
    }

    /**
     * Read-only pill counterpart to toggleBtn: default blue background for true, red for false.
     *
     * @param {boolean} value - Current boolean state.
     * @returns {string} A styled span element.
     */
    function boolPill(value) {
      return makePill(value ? 'Yes' : 'No', value ? '' : 'background-color:#A84D4D');
    }

    /**
     * Read-only pill counterpart to nameBtn: red for 'No', grey for 'Off', default for 'Yes'.
     *
     * @param {string} value - Current value: 'Yes', 'No', or 'Off'.
     * @returns {string} A styled span element.
     */
    function namePill(value) {
      let style = '';
      if (value === 'No') style = 'background-color:#A84D4D';
      if (value === 'Off') style = 'background-color:#D6D6D6';
      return makePill(value, style);
    }

    /**
     * Renders and whispers the HealthColors configuration menu to the GM.
     * Builds the full HTML panel using makeBtn/toggleBtn/nameBtn helpers and
     * reflects all current state values as interactive button labels.
     */
    function showMenu() {
      const s = state.HealthColors;
      const hr = `<hr style='background-color:#000;margin:5px;border-width:0;color:#000;height:1px;'/>`;
      const outerStyle = [
        'border-radius:8px',
        'box-shadow:3px 3px 1px #707070',
        'border:2px solid black',
        'overflow:hidden',
      ].join(';');
      const menuHeaderStyle = [
        'background-color:#2e5d78',
        'color:#fff',
        'text-align:center',
        'font-weight:bold',
        'font-size:10pt',
        'padding:4px 8px',
        'letter-spacing:0.5px',
      ].join(';');
      const contentStyle = [
        'padding:5px',
        'font-size:9pt',
        'text-shadow:-1px -1px #222,1px -1px #222,-1px 1px #222,1px 1px #222,2px 2px #222',
        'background-image:-webkit-linear-gradient(left,#76ADD6 0%,#a7c7dc 100%)',
        'color:#FFF',
        'text-align:right',
        'vertical-align:middle',
      ].join(';');

      const percLabel = `${s.auraPercPC}/${s.auraPerc}`;
      const healBtnStyle = `background-color:#${s.HealFX}`;
      const hurtBtnStyle = `background-color:#${s.HurtFX}`;
      const aura1Style = `background-color:#${s.Aura1Color}`;
      const aura2Style = `background-color:#${s.Aura2Color}`;
      const deadFxCmd = `!aura deadfx ?{Sound Name?|${s.auraDeadFX}}`;
      const wide = 'width:auto;padding-left:6px;padding-right:6px';
      const successCmd = `!aura deathsaves success ?{Success attribute(s), comma-separated|${s.dsSuccessAttr}}`;
      const failureCmd = `!aura deathsaves failure ?{Failure attribute(s), comma-separated|${s.dsFailureAttr}}`;
      const dyingCmd = `!aura deathsaves dyingmarker ?{Dying marker|${s.dsDyingMarker}}`;
      const html = [
        `<div style="${outerStyle}">`,
        `<div style="${menuHeaderStyle}">HealthColors v${VERSION}</div>`,
        `<div style="${contentStyle}">`,
        hr,
        `Is On: ${toggleBtn(s.auraColorOn, '!aura on')}<br>`,
        `Health Bar: ${makeBtn(s.auraBar, '!aura bar ?{Bar|1|2|3}')}<br>`,
        `Use Tint: ${toggleBtn(s.auraTint, '!aura tint')}<br>`,
        `Palette: ${makeBtn(s.colorPalette, '!aura palette ?{Palette|default|colorblind}', 'width:80px')} (auto refreshes all tokens)<br>`,
        `Percentage(PC/NPC): ${makeBtn(percLabel, '!aura perc ?{PCPercent?|100} ?{NPCPercent?|100}')}<br>`,
        hr,
        `Show PC Health: ${toggleBtn(s.PCAura, '!aura pc')}<br>`,
        `Show NPC Health: ${toggleBtn(s.NPCAura, '!aura npc')}<br>`,
        `Show Dead PC: ${toggleBtn(s.auraDeadPC, '!aura deadPC')}<br>`,
        `Show Dead NPC: ${toggleBtn(s.auraDead, '!aura dead')}<br>`,
        hr,
        `GM Sees all PC Names: ${nameBtn(s.GM_PCNames, '!aura gmpc ?{Setting|Yes|No|Off}')}<br>`,
        `GM Sees all NPC Names: ${nameBtn(s.GM_NPCNames, '!aura gmnpc ?{Setting|Yes|No|Off}')}<br>`,
        hr,
        `PC Sees all PC Names: ${nameBtn(s.PCNames, '!aura pcpc ?{Setting|Yes|No|Off}')}<br>`,
        `PC Sees all NPC Names: ${nameBtn(s.NPCNames, '!aura pcnpc ?{Setting|Yes|No|Off}')}<br>`,
        hr,
        `Aura 1 Radius (ft): ${makeBtn(s.AuraSize, '!aura size ?{Size?|0.35}')}<br>`,
        `Aura 1 Shape: ${makeBtn(s.Aura1Shape, '!aura a1shape ?{Shape?|Circle|Square}')}<br>`,
        `Aura 1 Color: ${makeBtn(s.Aura1Color, '!aura a1tint ?{Color?|00FF00}', aura1Style)}<br>`,
        `Aura 2 Radius (ft): ${makeBtn(String(s.Aura2Size), '!aura a2size ?{Size?|5}')}<br>`,
        `Aura 2 Shape: ${makeBtn(s.Aura2Shape, '!aura a2shape ?{Shape?|Square|Circle}')}<br>`,
        `Aura 2 Color: ${makeBtn(s.Aura2Color, '!aura a2tint ?{Color?|806600}', aura2Style)}<br>`,
        `One Offs: ${toggleBtn(s.OneOff, '!aura ONEOFF')}<br>`,
        `FX: ${toggleBtn(s.FX, '!aura FX')}<br>`,
        `HealFX Color: ${makeBtn(s.HealFX, '!aura HEAL ?{Color?|FDDC5C}', healBtnStyle)}<br>`,
        `HurtFX Color: ${makeBtn(s.HurtFX, '!aura HURT ?{Color?|FF0000}', hurtBtnStyle)}<br>`,
        `DeathSFX: ${makeBtn(s.auraDeadFX.substring(0, 4), deadFxCmd)}<br>`,
        hr,
        `<u>Death Save Integration</u><br>`,
        `<span style="display:block;text-align:right;font-size:8pt;line-height:1.2em;margin:2px 0 4px 0;color:#FFE9A8">Beacon sheets require API Sandbox Version: Experimental for live death-save syncing.</span>`,
        `Enabled: ${toggleBtn(s.deathSavesOn, '!aura deathsaves toggle')}<br>`,
        `Success Field(s): ${makeBtn(s.dsSuccessAttr, successCmd, wide)}<br>`,
        `Failure Field(s): ${makeBtn(s.dsFailureAttr, failureCmd, wide)}<br>`,
        `Dying Marker: ${makeBtn(s.dsDyingMarker, dyingCmd, wide)}<br>`,
        `Stable Marker: ${makeBtn(s.dsStableMarker, '!aura deathsaves stablemarker ?{Stable marker|green}', wide)}<br>`,
        `Dead Marker: ${makePill('Red X')}<br>`,
        `Sync: ${makeBtn('Sync Selected', '!aura deathsaves sync', wide)}<br>`,
        `Markers: ${makeBtn('List Markers', '!aura deathsaves markers', wide)}<br>`,
        hr,
        `</div>`,
        `</div>`,
      ].join('');

      sendChat(SCRIPT_NAME, `/w GM ${html}`);
    }

    /**
     * Renders a read-only settings snapshot to public game chat (all players).
     * Triggered by `!aura settings` on demand; not called automatically after changes.
     */
    function showSettingsInGameChat() {
      const s = state.HealthColors;
      const hr = `<hr style='background-color:#000;margin:5px;border-width:0;color:#000;height:1px;'/>`;
      const outerStyle = [
        'border-radius:8px',
        'box-shadow:3px 3px 1px #707070',
        'border:2px solid black',
        'overflow:hidden',
      ].join(';');
      const menuHeaderStyle = [
        'background-color:#2e5d78',
        'color:#fff',
        'text-align:center',
        'font-weight:bold',
        'font-size:10pt',
        'padding:4px 8px',
        'letter-spacing:0.5px',
      ].join(';');
      const contentStyle = [
        'padding:5px',
        'font-size:9pt',
        'text-shadow:-1px -1px #222,1px -1px #222,-1px 1px #222,1px 1px #222,2px 2px #222',
        'background-image:-webkit-linear-gradient(left,#76ADD6 0%,#a7c7dc 100%)',
        'color:#FFF',
        'text-align:right',
        'vertical-align:middle',
      ].join(';');

      const percLabel = `${s.auraPercPC}/${s.auraPerc}`;
      const aura1Style = `background-color:#${s.Aura1Color}`;
      const aura2Style = `background-color:#${s.Aura2Color}`;
      const healStyle = `background-color:#${s.HealFX}`;
      const hurtStyle = `background-color:#${s.HurtFX}`;
      const html = [
        `<div style="${outerStyle}">`,
        `<div style="${menuHeaderStyle}">HealthColors Settings v${VERSION}</div>`,
        `<div style="${contentStyle}">`,
        hr,
        `Is On: ${boolPill(s.auraColorOn)}<br>`,
        `Bar: ${makePill(s.auraBar)}<br>`,
        `Use Tint: ${boolPill(s.auraTint)}<br>`,
        `Palette: ${makePill(s.colorPalette)}<br>`,
        `Percentage(PC/NPC): ${makePill(percLabel)}<br>`,
        hr,
        `Show PC Health: ${boolPill(s.PCAura)}<br>`,
        `Show NPC Health: ${boolPill(s.NPCAura)}<br>`,
        `Show Dead PC: ${boolPill(s.auraDeadPC)}<br>`,
        `Show Dead NPC: ${boolPill(s.auraDead)}<br>`,
        hr,
        `GM Sees all PC Names: ${namePill(s.GM_PCNames)}<br>`,
        `GM Sees all NPC Names: ${namePill(s.GM_NPCNames)}<br>`,
        hr,
        `PC Sees all PC Names: ${namePill(s.PCNames)}<br>`,
        `PC Sees all NPC Names: ${namePill(s.NPCNames)}<br>`,
        hr,
        `Aura 1 Radius: ${makePill(String(s.AuraSize))}<br>`,
        `Aura 1 Shape: ${makePill(s.Aura1Shape)}<br>`,
        `Aura 1 Color: ${makePill(s.Aura1Color, aura1Style)}<br>`,
        `Aura 2 Radius: ${makePill(String(s.Aura2Size))}<br>`,
        `Aura 2 Shape: ${makePill(s.Aura2Shape)}<br>`,
        `Aura 2 Color: ${makePill(s.Aura2Color, aura2Style)}<br>`,
        `One Offs: ${boolPill(s.OneOff)}<br>`,
        `FX: ${boolPill(s.FX)}<br>`,
        `HealFX Color: ${makePill(s.HealFX, healStyle)}<br>`,
        `HurtFX Color: ${makePill(s.HurtFX, hurtStyle)}<br>`,
        `DeathSFX: ${makePill(s.auraDeadFX)}<br>`,
        hr,
        `<u>Death Save Integration</u><br>`,
        `Enabled: ${boolPill(s.deathSavesOn)}<br>`,
        `Success Field(s): ${makePill(s.dsSuccessAttr)}<br>`,
        `Failure Field(s): ${makePill(s.dsFailureAttr)}<br>`,
        `Dying Marker: ${makePill(s.dsDyingMarker)}<br>`,
        `Stable Marker: ${makePill(s.dsStableMarker)}<br>`,
        `Dead Marker: ${makePill('Red X')}<br>`,
        hr,
        `</div>`,
        `</div>`,
      ].join('');

      sendChat(SCRIPT_NAME, html);
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
        s[SHAPES[option]] = normalizeShape(parts[2], s[SHAPES[option]]);
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
          if (/^[123]$/.test(parts[2] || '')) {
            s.auraBar = `bar${parts[2]}`;
            gmWhisper(`Health bar set to ${s.auraBar}. Forcing sync...`);
            menuForceUpdate();
          } else {
            gmWhisper(`Invalid bar "${parts[2] || ''}". Use !aura bar 1, !aura bar 2, or !aura bar 3.`);
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
          s.HealFX = normalizeHex6(parts[2], s.HealFX);
          syncDefaultFxObjects();
          return { handled: true, earlyReturn: false };
        },
        HURT: () => {
          s.HurtFX = normalizeHex6(parts[2], s.HurtFX);
          syncDefaultFxObjects();
          return { handled: true, earlyReturn: false };
        },
        RESET: () => {
          delete state.HealthColors;
          gmWhisper('STATE RESET');
          checkInstall();
          return { handled: true, earlyReturn: false };
        },
        'RESET-FX': () => {
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

    /**
     * Processes incoming Roll20 chat messages to handle !aura commands.
     * GM-only: non-GMs receive an access-denied whisper.
     * Routes each subcommand (ON/OFF, BAR, TINT, PERC, PC, NPC, etc.) to the
     * appropriate state mutation then refreshes the menu. BAR validates 1/2/3,
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
        if (handleDeathSaves(msg, parts)) showMenu();
        return;
      }

      if (option !== 'MENU') gmWhisper('UPDATING TOKENS...');

      const s = state.HealthColors;
      if (!applyMappedAuraOption(option, parts, s)) {
        const result = runAuraSpecialOption(option, parts, msg, s);
        if (result.earlyReturn) return;
      }

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
     * Registers a change:attribute listener that catches HP changes made by scripts
     * such as AlterBars that modify character attributes directly rather than the
     * token bar. Those scripts fire change:attribute but may not fire change:graphic
     * with a correct prev value, so we construct a fakePrev from attr's own prev.current
     * and call handleToken ourselves with a real HP delta (enabling FX).
     * The token ID is added to recentAttrFires so that if change:graphic fires
     * afterwards it receives update='YES', skipping duplicate particle spawning.
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
        if (oldVal === newVal) return;
        findObjs({ type: 'graphic', represents: charId })
          .filter((t) => t.get('layer') === 'objects' && t.get(`${barUsed}_link`) === attr.id)
          .forEach((token) => applyAttrHpChange(barUsed, oldVal, newVal, token));
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
     * - change:graphic   → handleTokenChange (live HP changes and token resizes; suppresses
     *                                         FX when the attribute listener already fired)
     * - change:attribute → registerAttributeListener (AlterBars / indirect HP changes)
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
      registerEventHandlers();
    });

    return publicApi;
  })();
