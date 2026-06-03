// ===========================
// === HealthColors v2.0.1 ===
// ===========================

// AUTHORS:
//  - DXWarlock: https://app.roll20.net/users/262130/dxwarlock
//  - MidNiteShadow7: https://app.roll20.net/users/16506286/midniteshadow7

/* global createObj TokenMod spawnFxWithDefinition spawnFx getObj state playerIsGM sendChat findObjs log on */

(() => {
  "use strict";

  // ————— CONSTANTS —————
  const VERSION = "2.0.1";
  const SCRIPT_NAME = "HealthColors";
  const SCHEMA_VERSION = "1.1.0";
  const UPDATED = "2026-04-20 17:00 UTC";

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
   * @property {number}  AuraSize     - Base aura radius before page-scale is applied.
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
   */
  const DEFAULTS = {
    auraColorOn: true,
    auraBar: "bar1",
    auraTint: false,
    auraPercPC: 100,
    auraPerc: 100,
    PCAura: true,
    NPCAura: true,
    auraDeadPC: true,
    auraDead: true,
    GM_PCNames: "Yes",
    PCNames: "Yes",
    GM_NPCNames: "Yes",
    NPCNames: "Yes",
    AuraSize: 0.7,
    Aura1Shape: "Circle",
    Aura1Color: "00FF00",
    Aura2Size: 5,
    Aura2Shape: "Square",
    Aura2Color: "806600",
    OneOff: false,
    FX: true,
    HealFX: "FDDC5C",
    HurtFX: "FF0000",
    auraDeadFX: "None",
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
   * @property {number[]} startColor    - Fallback RGBA start color (opaque white).
   * @property {number[]} endColor      - Fallback RGBA end color (opaque black).
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
   * Converts a health percentage (0–100+) to a red-amber-green hex color.
   * Values above 100% return blue; 100% is treated as 99% to keep green.
   * @param {number} pct - Health percentage.
   * @returns {string} A 6-digit hex color string, e.g. '#FF0000'.
   */
  function percentToHex(pct) {
    const normalizedPct = Math.max(0, Number(pct) || 0);
    if (normalizedPct > 100) return "#0000FF";
    // Cap at 99 so 100% maps to green, not wrapping
    const p = normalizedPct === 100 ? 99 : normalizedPct;
    const b = 0;
    const g = p < 50 ? Math.floor(255 * (p / 50)) : 255;
    const r = p < 50 ? 255 : Math.floor(255 * ((50 - (p % 50)) / 50));
    // Bitwise shift used intentionally to build a 6-digit hex color
    // eslint-disable-next-line no-bitwise
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Parses a hex color string into an RGBA array suitable for Roll20 FX definitions.
   * Returns [0,0,0,0] when the input is invalid.
   * @param {string} hex - Hex color string with or without leading '#'.
   * @returns {number[]} Array of [r, g, b, a] where a is always 1.0 on success.
   */
  function hexToRgb(hex) {
    const cleanHex = (hex || "").replace("#", "").trim();
    const parts = /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(
      cleanHex,
    );
    if (parts) {
      const rgb = parts.slice(1).map((d) => Number.parseInt(d, 16));
      rgb.push(1);
      return rgb;
    }
    // Log invalid hex attempts if they appear non-empty
    if (cleanHex)
      log(`${SCRIPT_NAME}: hexToRgb received invalid hex: "${hex}"`);
    return [0, 0, 0, 0];
  }

  /**
   * Returns a random integer between min and max inclusive.
   * @param {number} min - Lower bound (inclusive).
   * @param {number} max - Upper bound (inclusive).
   * @returns {number} Random integer in [min, max].
   */
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Normalizes a 6-digit hex color string (without '#').
   * Returns fallback when input is invalid.
   * @param {string} value    - Candidate hex string.
   * @param {string} fallback - Fallback value when invalid.
   * @returns {string} Uppercase 6-digit hex.
   */
  function normalizeHex6(value, fallback) {
    const cleaned = (value || "").replace("#", "").trim().toUpperCase();
    return /^[0-9A-F]{6}$/.test(cleaned) ? cleaned : fallback;
  }

  /**
   * Normalizes an aura shape label to supported display values.
   * @param {string} value    - Candidate shape value.
   * @param {string} fallback - Fallback shape.
   * @returns {string} One of Circle|Square.
   */
  function normalizeShape(value, fallback) {
    const shape = (value || "").trim().toUpperCase();
    if (shape === "CIRCLE") return "Circle";
    if (shape === "SQUARE") return "Square";
    return fallback;
  }

  // ————— WHISPER GM (declared early; used by checkInstall) —————
  /**
   * Sends a styled whisper message to the GM.
   * @param {string} text - Plain text content to display inside the styled div.
   */
  function gmWhisper(text) {
    const style = [
      "width:100%",
      "border-radius:4px",
      "box-shadow:1px 1px 1px #707070",
      "text-align:center",
      "vertical-align:middle",
      "padding:3px 0px",
      "margin:0px auto",
      "border:1px solid #000",
      "color:#000",
      "background-image:-webkit-linear-gradient(-45deg,#a7c7dc 0%,#85b2d3 100%)",
    ].join(";");
    sendChat(SCRIPT_NAME, `/w GM <div style='${style}'><b>${text}</b></div>`);
  }

  // ————— ATTRIBUTE CACHE —————
  /**
   * Creates a cached attribute lookup function that auto-refreshes on attribute
   * change or destruction and re-triggers handleToken for affected tokens.
   * Creates the attribute with the default value if it does not exist yet.
   * @param {string}   attribute          - The Roll20 attribute name to track (e.g. 'USECOLOR').
   * @param {object}   [options={}]        - Configuration options.
   * @param {string}   [options.default]   - Value to use when the attribute is missing or invalid.
   * @param {Function} [options.validation]- Predicate that returns true for valid values.
   * @returns {Function} Lookup function accepting a character object and returning the current value.
   */
  function makeSmartAttrCache(attribute, options = {}) {
    const cache = {};
    const defaultValue = options.default || "YES";
    const validator = options.validation || (() => true);

    on("change:attribute", (attr) => {
      if (attr.get("name") !== attribute) return;
      if (!validator(attr.get("current"))) attr.set("current", defaultValue);
      cache[attr.get("characterid")] = attr.get("current");
      findObjs({ type: "graphic" })
        .filter((o) => o.get("represents") === attr.get("characterid"))
        .forEach((obj) => {
          const prev = JSON.parse(JSON.stringify(obj));
          handleToken(obj, prev, "YES");
        });
    });

    on("destroy:attribute", (attr) => {
      if (attr.get("name") === attribute) delete cache[attr.get("characterid")];
    });

    return function (character) {
      let attr =
        findObjs(
          { type: "attribute", name: attribute, characterid: character.id },
          { caseInsensitive: true },
        )[0] ||
        createObj("attribute", {
          name: attribute,
          characterid: character.id,
          current: defaultValue,
        });

      if (!cache[character.id] || cache[character.id] !== attr.get("current")) {
        if (!validator(attr.get("current"))) attr.set("current", defaultValue);
        cache[character.id] = attr.get("current");
      }
      return cache[character.id];
    };
  }

  const lookupUseBlood = makeSmartAttrCache("USEBLOOD", { default: "DEFAULT" });
  const lookupUseColor = makeSmartAttrCache("USECOLOR", {
    default: "YES",
    validation: (o) => Boolean(o.match(/YES|NO/)),
  });

  // ————— TOKEN HELPERS —————
  /**
   * Resets a token to the "Default" state requested by the user:
   * Aura 1: Green (#00FF00) at 0.7 radius.
   * Aura 2: Transparent at 5ft radius.
   * @param {object} obj - Roll20 token graphic object.
   */
  function applyDefaultAura(obj) {
    if (state.HealthColors.auraTint) {
      obj.set({ tint_color: "transparent" });
    } else {
      // Set Aura 1 directly to sizeSet (expected 0.7)
      obj.set({
        aura1_color: "#00FF00",
        aura1_radius: state.HealthColors.AuraSize,
        showplayers_aura1: true,
      });
    }
  }

  /**
   * Hard-clears all health-indicator visual settings (aura/tint).
   * Used for dead tokens or when the script/aura is disabled for a type.
   * @param {object} obj - Roll20 token graphic object.
   */
  function clearAuras(obj) {
    obj.set({
      tint_color: "transparent",
      aura1_color: "transparent",
      aura1_radius: 0,
    });
  }

  /**
   * Applies a health color to a token via aura or tint depending on configuration.
   * When in tint mode, sets tint_color. When in aura mode, sets both aura radii and colors.
   * On a forced update ('YES'), clears the opposing color first to avoid artifacts.
   * @param {object} obj         - Roll20 token object.
   * @param {number} sizeSet     - Base aura size from state (e.g. 0.7).
   * @param {string} markerColor - Hex color string derived from health percentage.
   */
  function tokenSet(obj, sizeSet, markerColor) {
    const page = getObj("page", obj.get("pageid"));
    const scaleNumber = page.get("scale_number");
    const scale = scaleNumber / 10;
    if (state.HealthColors.auraTint) {
      obj.set({ tint_color: markerColor });
    } else {
      obj.set({
        aura1_radius: sizeSet * scale * 1.8,
        aura1_color: markerColor,
        showplayers_aura1: true,
      });
    }
  }

  /**
   * Sets token name-visibility flags for the GM and players.
   * 'Yes' → true, 'No' → false, 'Off' → leave unchanged.
   * @param {string} gm  - GM name-display setting: 'Yes', 'No', or 'Off'.
   * @param {string} pc  - Player name-display setting: 'Yes', 'No', or 'Off'.
   * @param {object} obj - Roll20 token object.
   */
  function setShowNames(gm, pc, obj) {
    if (gm !== "Off" && gm !== "") obj.set({ showname: gm === "Yes" });
    if (pc !== "Off" && pc !== "") obj.set({ showplayers_name: pc === "Yes" });
  }

  // ————— FX —————
  /**
   * Plays a jukebox track when a token dies.
   * Accepts a comma-separated list of track names; picks one at random.
   * @param {string} trackname - Track name or comma-separated list of track names.
   */
  function playDeath(trackname) {
    const list =
      trackname.indexOf(",") > 0 ? trackname.split(",") : [trackname];
    const resolvedName = list[Math.floor(Math.random() * list.length)];
    const track = findObjs({ type: "jukeboxtrack", title: resolvedName })[0];
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
    const startKeys = [
      "startColour",
      "startColor",
      "startcolour",
      "startcolor",
    ];
    const endKeys = ["endColour", "endColor", "endcolour", "endcolor"];
    const startRndKeys = [
      "startColourRandom",
      "startColorRandom",
      "startcolourrandom",
      "startcolorrandom",
    ];
    const endRndKeys = [
      "endColourRandom",
      "endColorRandom",
      "endcolourrandom",
      "endcolorrandom",
    ];
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
   * @param {object} fxObj - Roll20 custfx object.
   * @returns {object|null} Parsed FX definition object, or null if unavailable/invalid.
   */
  function getFxDefinition(fxObj) {
    if (!fxObj) return null;

    const raw = fxObj.get("definition");
    if (!raw) return null;

    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch (err) {
        log(`${SCRIPT_NAME}: Failed to parse FX definition: ${err.message}`);
        return null;
      }
    }

    if (typeof raw === "object") {
      return JSON.parse(JSON.stringify(raw));
    }

    return null;
  }

  // ————— STATE / INSTALL —————
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
    Object.keys(DEFAULTS).forEach((key) => {
      if (state.HealthColors[key] === undefined)
        state.HealthColors[key] = DEFAULTS[key];
    });
    if (typeof TokenMod !== "undefined" && TokenMod.ObserveTokenChange) {
      TokenMod.ObserveTokenChange(handleToken);
    }
    const fxHurt = findObjs(
      { _type: "custfx", name: "-DefaultHurt" },
      { caseInsensitive: true },
    )[0];
    const fxHeal = findObjs(
      { _type: "custfx", name: "-DefaultHeal" },
      { caseInsensitive: true },
    )[0];
    if (!fxHurt) {
      gmWhisper("Creating Default Hurt FX");
      createObj("custfx", {
        name: "-DefaultHurt",
        definition: DEFAULT_HURT_FX,
      });
    }
    if (!fxHeal) {
      gmWhisper("Creating Default Heal FX");
      createObj("custfx", {
        name: "-DefaultHeal",
        definition: DEFAULT_HEAL_FX,
      });
    }
    syncDefaultFxObjects();
  }

  /**
   * Builds the normalized default Hurt/Heal definition payload used for
   * campaign custom FX objects.
   * @param {boolean} isHeal - True for Heal profile, false for Hurt profile.
   * @param {object} baseDef - Existing definition to merge into.
   * @returns {object} Updated definition with normalized color/profile fields.
   */
  function buildDefaultFxDefinition(isHeal, baseDef) {
    const def = { ...baseDef };
    const rgb = hexToRgb(
      isHeal ? state.HealthColors.HealFX : state.HealthColors.HurtFX,
    );
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
    const fxHurt = findObjs(
      { _type: "custfx", name: "-DefaultHurt" },
      { caseInsensitive: true },
    )[0];
    const fxHeal = findObjs(
      { _type: "custfx", name: "-DefaultHeal" },
      { caseInsensitive: true },
    )[0];
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
    const existing = findObjs(
      { _type: "custfx" },
      { caseInsensitive: true },
    ).filter((fx) => /-Default(Hurt|Heal)/i.test(fx.get("name") || ""));
    existing.forEach((fx) => fx.remove());
    gmWhisper("Recreating Default Hurt/Heal FX");
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
    gmWhisper("RESET ALL: defaults restored + default FX + force update");
    resetDefaultFxObjects();
    menuForceUpdate();
  }

  // ————— TOKEN LOGIC —————
  /**
   * Reads the configured health bar from a token and its previous snapshot,
   * validates all three values are numeric, and returns a health data object.
   * Returns null if any value is missing or non-numeric.
   * @param {object} obj  - Roll20 token graphic object.
   * @param {object} prev - Snapshot of the token's previous attribute values.
   * @param {string} [update] - Pass 'YES' when called from a forced refresh.
   * @returns {{ maxValue: number, curValue: number, prevValue: string|number,
   *             percReal: number, markerColor: string }|null}
   */
  function getBarHealth(obj, prev, update) {
    const barUsed = state.HealthColors.auraBar;
    if (obj.get(`${barUsed}_max`) === "" && obj.get(`${barUsed}_value`) === "")
      return null;
    const maxValue = Number.parseInt(obj.get(`${barUsed}_max`), 10);
    const curValue = Number.parseInt(obj.get(`${barUsed}_value`), 10);
    const prevValue = prev[`${barUsed}_value`];
    if (Number.isNaN(maxValue) || Number.isNaN(curValue)) return null;
    if (update !== "YES" && Number.isNaN(Number.parseInt(prevValue, 10)))
      return null;
    const percReal = Math.max(
      0,
      Math.min(Math.round((curValue / maxValue) * 100), 100),
    );
    const markerColor = percentToHex(percReal);
    return { maxValue, curValue, prevValue, percReal, markerColor };
  }

  /**
   * Determines Player vs Monster and returns all type-specific config in one object.
   * @param {object|undefined} oCharacter - Roll20 character object (may be undefined).
   * @returns {{ gm: string, pc: string, isTypeOn: boolean, percentOn: number,
   *             showDead: boolean, pColor: string }}
   */
  function resolveTypeConfig(oCharacter) {
    const isPlayer = oCharacter && oCharacter.get("controlledby") !== "";
    if (isPlayer) {
      return {
        gm: state.HealthColors.GM_PCNames,
        pc: state.HealthColors.PCNames,
        isTypeOn: state.HealthColors.PCAura,
        percentOn: state.HealthColors.auraPercPC,
        showDead: state.HealthColors.auraDeadPC,
      };
    }
    return {
      gm: state.HealthColors.GM_NPCNames,
      pc: state.HealthColors.NPCNames,
      isTypeOn: state.HealthColors.NPCAura,
      percentOn: state.HealthColors.auraPerc,
      showDead: state.HealthColors.auraDead,
    };
  }

  /**
   * Manages the dead-status marker and plays a death sound when a token reaches 0 HP.
   * Extracted from applyAuraAndDead to reduce nesting depth.
   * @param {object} obj       - Roll20 token graphic object.
   * @param {number} curValue  - Current bar value.
   * @param {number} prevValue - Previous bar value (may be a string).
   */
  function applyDeadStatus(obj, curValue, prevValue) {
    if (curValue > 0) {
      obj.set("status_dead", false);
      return;
    }
    const deadSfx = state.HealthColors.auraDeadFX;
    if (deadSfx !== "None" && curValue !== Number(prevValue))
      playDeath(deadSfx);
    obj.set("status_dead", true);
    clearAuras(obj);
  }

  /**
   * Applies or removes the health aura/tint and manages the dead-status marker.
   * @param {object}           obj        - Roll20 token graphic object.
   * @param {object|undefined} oCharacter - Roll20 character object.
   * @param {object}           typeConfig - Config returned by resolveTypeConfig.
   * @param {object}           health     - Health data returned by getBarHealth.
   * @param {string}           [update]   - Pass 'YES' to indicate a forced refresh.
   */
  function applyAuraAndDead(obj, oCharacter, typeConfig, health) {
    const { curValue, prevValue, percReal, markerColor } = health;
    const { isTypeOn, percentOn, showDead } = typeConfig;
    const useAura = oCharacter ? lookupUseColor(oCharacter) : undefined;
    const colorType = state.HealthColors.auraTint ? "tint" : "aura1";

    if (showDead) {
      applyDeadStatus(obj, curValue, prevValue);
      if (curValue <= 0) return;
    }

    if (isTypeOn && useAura !== "NO") {
      if (percReal >= percentOn || curValue === 0) {
        applyDefaultAura(obj);
      } else {
        tokenSet(obj, state.HealthColors.AuraSize, markerColor);
      }
    } else if (obj.get(`${colorType}_color`) === markerColor) {
      clearAuras(obj);
    }
  }

  /**
   * Builds the list of FX definition objects to spawn for a heal or hurt event.
   * @param {boolean}          isHeal    - True when HP went up.
   * @param {string|undefined} useBlood  - Per-character blood FX override value.
   * @returns {object[]} Array of Roll20 custfx definition objects.
   */
  function buildFXList(isHeal, useBlood) {
    const fxArray = [];

    if (isHeal) {
      const aFX = findObjs(
        { _type: "custfx", name: "-DefaultHeal" },
        { caseInsensitive: true },
      )[0];
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

    const aFX = findObjs(
      { _type: "custfx", name: "-DefaultHurt" },
      { caseInsensitive: true },
    )[0];
    const def = getFxDefinition(aFX);

    if (!def) return fxArray;

    if (useBlood === "DEFAULT" || useBlood === undefined) {
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
      const hurtRgb = hexToRgb(useBlood);

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
        useBlood.split(",").forEach((fxName) => {
          const custom = findObjs(
            { _type: "custfx", name: fxName.trim() },
            { caseInsensitive: true },
          )[0];
          const customDef = getFxDefinition(custom);

          if (customDef) {
            fxArray.push(customDef);
          } else {
            gmWhisper(`No FX with name ${fxName}`);
          }
        });
      }
    }

    return fxArray;
  }

  /**
   * Workaround path: update default custfx definitions, then spawn by saved FX id.
   * This avoids client-side issues seen in some sandboxes with spawnFxWithDefinition.
   * Applies only to DEFAULT heal/hurt colors; custom named FX still use definition spawn.
   * Also tightens particle profile settings to keep color visibility consistent.
   * @param {object} obj      - Roll20 token graphic object.
   * @param {boolean} isHeal  - True when HP increased.
   * @param {string|undefined} useBlood - Per-character blood override.
   * @returns {boolean} True when the fallback path handled spawning.
   */
  function spawnDefaultFxById(obj, isHeal, useBlood) {
    if (!(useBlood === "DEFAULT" || useBlood === undefined)) return false;
    const fxName = isHeal ? "-DefaultHeal" : "-DefaultHurt";
    const aFX = findObjs(
      { _type: "custfx", name: fxName },
      { caseInsensitive: true },
    )[0];
    if (!aFX) return false;

    spawnFx(obj.get("left"), obj.get("top"), aFX.id, obj.get("pageid"));
    return true;
  }

  /**
   * Gates and triggers particle FX when HP changes on a non-forced update.
   * @param {object}           obj        - Roll20 token graphic object.
   * @param {object|undefined} oCharacter - Roll20 character object.
   * @param {number}           curValue   - Current bar value.
   * @param {number|string}    prevValue  - Previous bar value.
   * @param {number}           maxValue   - Maximum bar value.
   * @param {string}           [update]   - Pass 'YES' to suppress FX on forced refreshes.
   */
  function maybeSpawnFX(
    obj,
    oCharacter,
    curValue,
    prevValue,
    maxValue,
    update,
  ) {
    if (curValue === Number(prevValue) || prevValue === "" || update === "YES")
      return;
    const useBlood = oCharacter ? lookupUseBlood(oCharacter) : undefined;
    if (!state.HealthColors.FX || useBlood === "OFF" || useBlood === "NO")
      return;
    const isHeal = curValue > Number(prevValue);
    const amount = Math.abs(curValue - Number(prevValue));
    const scale = obj.get("height") / 70;
    const hitSize =
      Math.max(Math.min((amount / maxValue) * 4, 1), 0.2) *
      (randomInt(60, 100) / 100);
    if (spawnDefaultFxById(obj, isHeal, useBlood)) return;
    buildFXList(isHeal, useBlood).forEach((fx) =>
      spawnFX(
        scale,
        hitSize,
        obj.get("left"),
        obj.get("top"),
        fx,
        obj.get("pageid"),
      ),
    );
  }

  /**
   * Core token handler — called on token change, token add, and forced updates.
   * Delegates to specialized helpers for health reading, type resolution,
   * aura management, and FX spawning.
   * Clears aura/tint when the selected health bar has no max value.
   * @param {object} obj      - The Roll20 token graphic object.
   * @param {object} prev     - Snapshot of the token's previous attribute values.
   * @param {string} [update] - Pass 'YES' to indicate a forced refresh (suppresses FX).
   */
  function handleToken(obj, prev, update) {
    if (state.HealthColors === undefined) {
      log(`${SCRIPT_NAME} ${VERSION}: state missing, reverting to defaults`);
      checkInstall();
    }
    if (
      state.HealthColors.auraColorOn !== true ||
      obj.get("layer") !== "objects"
    )
      return;
    if (obj.get("represents") === "" && state.HealthColors.OneOff !== true)
      return;
    const barUsed = state.HealthColors.auraBar;
    if (obj.get(`${barUsed}_max`) === "") {
      clearAuras(obj);
      return;
    }

    const health = getBarHealth(obj, prev, update);
    if (!health) return;

    const { maxValue, curValue, prevValue } = health;

    // NEW in 2.0.5: Only proceed if health actually changed OR it is a forced update.
    // This stops the script from "fighting" manual aura/color overrides on movement.
    if (curValue === Number(prevValue) && update !== "YES") return;

    const oCharacter = getObj("character", obj.get("represents"));
    const typeConfig = resolveTypeConfig(oCharacter);

    applyAuraAndDead(obj, oCharacter, typeConfig, health);
    setShowNames(typeConfig.gm, typeConfig.pc, obj);
    maybeSpawnFX(obj, oCharacter, curValue, prevValue, maxValue, update);
  }

  // ————— FORCE UPDATE —————
  /**
   * Forces a re-evaluation of every token on the objects layer,
   * processing them one at a time via a setTimeout drain queue to avoid
   * blocking the Roll20 sandbox event loop.
   */
  function menuForceUpdate() {
    const workQueue = findObjs({
      type: "graphic",
      subtype: "token",
      layer: "objects",
    });
    sendChat("Fixing Tokens", `/w gm Fixing ${workQueue.length} Tokens`);
    const drainQueue = () => {
      const token = workQueue.shift();
      if (token) {
        const prev = JSON.parse(JSON.stringify(token));
        handleToken(token, prev, "YES");
        setTimeout(drainQueue, 0);
      } else {
        sendChat("Fixing Tokens", "/w gm Finished Fixing Tokens");
      }
    };
    drainQueue();
  }

  /**
   * Forces a health-color update on all currently selected tokens.
   * Whispers the list of updated token names to the GM.
   * @param {object} msg - Roll20 chat message object with a populated `selected` array.
   */
  function manUpdate(msg) {
    const allNames = msg.selected.reduce((acc, obj) => {
      const token = getObj("graphic", obj._id);
      const prev = JSON.parse(JSON.stringify(token));
      handleToken(token, prev, "YES");
      return `${acc}${token.get("name")}<br>`;
    }, "");
    gmWhisper(allNames);
  }

  // ————— MENU —————
  /**
   * Builds a styled Roll20 chat button anchor element.
   * @param {string} label           - Button label text.
   * @param {string} href            - Roll20 API command (e.g. '!aura on').
   * @param {string} [extraStyle=''] - Additional inline CSS to append to the base style.
   * @returns {string} An HTML anchor string ready for sendChat.
   */
  function makeBtn(label, href, extraStyle = "") {
    const base = [
      "padding-top:1px",
      "text-align:center",
      "font-size:9pt",
      "width:48px",
      "height:14px",
      "border:1px solid black",
      "margin:1px",
      "background-color:#6FAEC7",
      "border-radius:4px",
      "box-shadow:1px 1px 1px #707070",
    ].join(";");
    return `<a style="${base};${extraStyle}" href="${href}">${label}</a>`;
  }

  /**
   * Builds a non-interactive styled value pill for read-only output panels.
   * @param {string} label           - Display text.
   * @param {string} [extraStyle=''] - Additional inline CSS to append to base style.
   * @returns {string} A styled span element.
   */
  function makePill(label, extraStyle = "") {
    const base = [
      "display:inline-block",
      "padding-top:1px",
      "text-align:center",
      "font-size:9pt",
      "min-width:48px",
      "height:14px",
      "border:1px solid black",
      "margin:1px",
      "background-color:#6FAEC7",
      "border-radius:4px",
      "box-shadow:1px 1px 1px #707070",
      "line-height:14px",
      "padding-left:4px",
      "padding-right:4px",
    ].join(";");
    return `<span style="${base};${extraStyle}">${label}</span>`;
  }

  /**
   * Builds a toggle-style button that shows red when the value is false/off.
   * @param {boolean} value - Current boolean state (true = on/green, false = off/red).
   * @param {string}  href  - Roll20 API command to execute on click.
   * @returns {string} An HTML anchor string.
   */
  function toggleBtn(value, href) {
    const style = value === true ? "" : "background-color:#A84D4D";
    return makeBtn(value === true ? "Yes" : "No", href, style);
  }

  /**
   * Builds a three-state name-setting button. Red for 'No', grey for 'Off', default for 'Yes'.
   * @param {string} value - Current value: 'Yes', 'No', or 'Off'.
   * @param {string} href  - Roll20 API command to execute on click.
   * @returns {string} An HTML anchor string.
   */
  function nameBtn(value, href) {
    let style = "";
    if (value === "No") style = "background-color:#A84D4D";
    if (value === "Off") style = "background-color:#D6D6D6";
    return makeBtn(value, href, style);
  }

  /**
   * Renders and whispers the HealthColors configuration menu to the GM.
   * Builds the full HTML panel using makeBtn/toggleBtn/nameBtn helpers and
   * reflects all current state values as interactive button labels.
   */
  function showMenu() {
    const s = state.HealthColors;
    const hr = `<hr style='background-color:#000;margin:5px;border-width:0;color:#000;height:1px;'/>`;
    const wrapStyle = [
      "border-radius:8px",
      "padding:5px",
      "font-size:9pt",
      "text-shadow:-1px -1px #222,1px -1px #222,-1px 1px #222,1px 1px #222,2px 2px #222",
      "box-shadow:3px 3px 1px #707070",
      "background-image:-webkit-linear-gradient(left,#76ADD6 0%,#a7c7dc 100%)",
      "color:#FFF",
      "border:2px solid black",
      "text-align:right",
      "vertical-align:middle",
    ].join(";");

    const percLabel = `${s.auraPercPC}/${s.auraPerc}`;
    const healBtnStyle = `background-color:#${s.HealFX}`;
    const hurtBtnStyle = `background-color:#${s.HurtFX}`;
    const aura1Style = `background-color:#${s.Aura1Color}`;
    const aura2Style = `background-color:#${s.Aura2Color}`;
    const deadFxCmd = `!aura deadfx ?{Sound Name?|${s.auraDeadFX}}`;
    const html = [
      `<div style="${wrapStyle}">`,
      `<u><big>HealthColors Version: ${VERSION}</u></big><br>`,
      hr,
      `Is On: ${toggleBtn(s.auraColorOn, "!aura on")}<br>`,
      `Health Bar: ${makeBtn(s.auraBar, "!aura bar ?{Bar|1|2|3}")}<br>`,
      `Use Tint: ${toggleBtn(s.auraTint, "!aura tint")}<br>`,
      `Percentage(PC/NPC): ${makeBtn(percLabel, "!aura perc ?{PCPercent?|100} ?{NPCPercent?|100}")}<br>`,
      hr,
      `Show PC Health: ${toggleBtn(s.PCAura, "!aura pc")}<br>`,
      `Show NPC Health: ${toggleBtn(s.NPCAura, "!aura npc")}<br>`,
      `Show Dead PC: ${toggleBtn(s.auraDeadPC, "!aura deadPC")}<br>`,
      `Show Dead NPC: ${toggleBtn(s.auraDead, "!aura dead")}<br>`,
      hr,
      `GM Sees all PC Names: ${nameBtn(s.GM_PCNames, "!aura gmpc ?{Setting|Yes|No|Off}")}<br>`,
      `GM Sees all NPC Names: ${nameBtn(s.GM_NPCNames, "!aura gmnpc ?{Setting|Yes|No|Off}")}<br>`,
      hr,
      `PC Sees all PC Names: ${nameBtn(s.PCNames, "!aura pcpc ?{Setting|Yes|No|Off}")}<br>`,
      `PC Sees all NPC Names: ${nameBtn(s.NPCNames, "!aura pcnpc ?{Setting|Yes|No|Off}")}<br>`,
      hr,
      `Aura 1 Radius (ft): ${makeBtn(s.AuraSize, "!aura size ?{Size?|0.7}")}<br>`,
      `Aura 1 Shape: ${makeBtn(s.Aura1Shape, "!aura a1shape ?{Shape?|Circle|Square}")}<br>`,
      `Aura 1 Color (Tint): ${makeBtn(s.Aura1Color, "!aura a1tint ?{Color?|00FF00}", aura1Style)}<br>`,
      `Aura 2 Radius (ft): ${makeBtn(String(s.Aura2Size), "!aura a2size ?{Size?|5}")}<br>`,
      `Aura 2 Shape: ${makeBtn(s.Aura2Shape, "!aura a2shape ?{Shape?|Square|Circle}")}<br>`,
      `Aura 2 Color (Tint): ${makeBtn(s.Aura2Color, "!aura a2tint ?{Color?|806600}", aura2Style)}<br>`,
      `One Offs: ${toggleBtn(s.OneOff, "!aura ONEOFF")}<br>`,
      `FX: ${toggleBtn(s.FX, "!aura FX")}<br>`,
      `HealFX Color: ${makeBtn(s.HealFX, "!aura HEAL ?{Color?|FDDC5C}", healBtnStyle)}<br>`,
      `HurtFX Color: ${makeBtn(s.HurtFX, "!aura HURT ?{Color?|FF0000}", hurtBtnStyle)}<br>`,
      `DeathSFX: ${makeBtn(s.auraDeadFX.substring(0, 4), deadFxCmd)}<br>`,
      hr,
      `</div>`,
    ].join("");

    sendChat(SCRIPT_NAME, `/w GM <b><br>${html}`);
  }

  /**
   * Renders the current settings panel publicly in game chat.
   * Used after setting-changing commands so players/DMs can see active config.
   */
  function showSettingsInGameChat() {
    const s = state.HealthColors;
    const hr = `<hr style='background-color:#000;margin:5px;border-width:0;color:#000;height:1px;'/>`;
    const wrapStyle = [
      "border-radius:8px",
      "padding:5px",
      "font-size:9pt",
      "text-shadow:-1px -1px #222,1px -1px #222,-1px 1px #222,1px 1px #222,2px 2px #222",
      "box-shadow:3px 3px 1px #707070",
      "background-image:-webkit-linear-gradient(left,#76ADD6 0%,#a7c7dc 100%)",
      "color:#FFF",
      "border:2px solid black",
      "text-align:right",
      "vertical-align:middle",
    ].join(";");

    const percLabel = `${s.auraPercPC}/${s.auraPerc}`;
    const noStyle = "background-color:#A84D4D";
    const offStyle = "background-color:#D6D6D6";
    const pickNameStyle = (value) => {
      if (value === "No") return noStyle;
      if (value === "Off") return offStyle;
      return "";
    };
    const healStyle = `background-color:#${s.HealFX}`;
    const hurtStyle = `background-color:#${s.HurtFX}`;
    const aura1Style = `background-color:#${s.Aura1Color}`;
    const aura2Style = `background-color:#${s.Aura2Color}`;
    const html = [
      `<div style="${wrapStyle}">`,
      `<u><big>HealthColors Settings: ${VERSION}</u></big><br>`,
      hr,
      `Is On: ${makePill(s.auraColorOn ? "Yes" : "No", s.auraColorOn ? "" : "background-color:#A84D4D")}<br>`,
      `Bar: ${makePill(s.auraBar)}<br>`,
      `Use Tint: ${makePill(s.auraTint ? "Yes" : "No", s.auraTint ? "" : "background-color:#A84D4D")}<br>`,
      `Percentage(PC/NPC): ${makePill(percLabel)}<br>`,
      hr,
      `Show PC Health: ${makePill(s.PCAura ? "Yes" : "No", s.PCAura ? "" : "background-color:#A84D4D")}<br>`,
      `Show NPC Health: ${makePill(s.NPCAura ? "Yes" : "No", s.NPCAura ? "" : "background-color:#A84D4D")}<br>`,
      `Show Dead PC: ${makePill(s.auraDeadPC ? "Yes" : "No", s.auraDeadPC ? "" : "background-color:#A84D4D")}<br>`,
      `Show Dead NPC: ${makePill(s.auraDead ? "Yes" : "No", s.auraDead ? "" : "background-color:#A84D4D")}<br>`,
      hr,
      `GM Sees all PC Names: ${makePill(s.GM_PCNames, pickNameStyle(s.GM_PCNames))}<br>`,
      `GM Sees all NPC Names: ${makePill(s.GM_NPCNames, pickNameStyle(s.GM_NPCNames))}<br>`,
      hr,
      `PC Sees all PC Names: ${makePill(s.PCNames, pickNameStyle(s.PCNames))}<br>`,
      `PC Sees all NPC Names: ${makePill(s.NPCNames, pickNameStyle(s.NPCNames))}<br>`,
      hr,
      `Aura 1 Radius: ${makePill(String(s.AuraSize))}<br>`,
      `Aura 1 Shape: ${makePill(s.Aura1Shape)}<br>`,
      `Aura 1 Tint: ${makePill(s.Aura1Color, aura1Style)}<br>`,
      `Aura 2 Radius: ${makePill(String(s.Aura2Size))}<br>`,
      `Aura 2 Shape: ${makePill(s.Aura2Shape)}<br>`,
      `Aura 2 Tint: ${makePill(s.Aura2Color, aura2Style)}<br>`,
      `One Offs: ${makePill(s.OneOff ? "Yes" : "No", s.OneOff ? "" : "background-color:#A84D4D")}<br>`,
      `FX: ${makePill(s.FX ? "Yes" : "No", s.FX ? "" : "background-color:#A84D4D")}<br>`,
      `HealFX Color: ${makePill(s.HealFX, healStyle)}<br>`,
      `HurtFX Color: ${makePill(s.HurtFX, hurtStyle)}<br>`,
      `DeathSFX: ${makePill(s.auraDeadFX)}<br>`,
      hr,
      `</div>`,
    ].join("");

    sendChat(SCRIPT_NAME, `<b><br>${html}`);
  }

  // ————— CHAT HANDLER —————
  /**
   * Processes incoming Roll20 chat messages to handle !aura commands.
   * GM-only: non-GMs receive an access-denied whisper.
   * Routes each subcommand (ON/OFF, BAR, TINT, PERC, PC, NPC, etc.) to the
   * appropriate state mutation then refreshes the menu. BAR validates 1/2/3,
   * whispers confirmation, and triggers immediate full sync.
   * When a setting changes, also posts a read-only settings snapshot to game chat.
   * Use `!aura settings` to output the current settings snapshot on demand.
   * @param {object} msg - Roll20 chat message object.
   */
  function handleInput(msg) {
    const parts = msg.content.split(/\s+/);
    const command = parts[0].toUpperCase();
    if (msg.type !== "api" || !command.includes("!AURA")) return;

    if (!playerIsGM(msg.playerid)) {
      sendChat(
        SCRIPT_NAME,
        `/w ${msg.who} you must be a GM to use this command!`,
      );
      return;
    }

    const option = (parts[1] || "MENU").toUpperCase();
    let changedSetting = false;
    if (option !== "MENU") gmWhisper("UPDATING TOKENS...");

    switch (option) {
      case "MENU":
        break;
      case "SETTINGS":
        showSettingsInGameChat();
        return;
      case "ON":
        state.HealthColors.auraColorOn = true;
        changedSetting = true;
        break;
      case "OFF":
        state.HealthColors.auraColorOn = false;
        changedSetting = true;
        break;
      case "BAR":
        if (/^[123]$/.test(parts[2] || "")) {
          state.HealthColors.auraBar = `bar${parts[2]}`;
          changedSetting = true;
          gmWhisper(`Health bar set to ${state.HealthColors.auraBar}. Forcing sync...`);
          menuForceUpdate();
        } else {
          gmWhisper(
            `Invalid bar "${parts[2] || ""}". Use !aura bar 1, !aura bar 2, or !aura bar 3.`,
          );
        }
        break;
      case "TINT":
        state.HealthColors.auraTint = !state.HealthColors.auraTint;
        changedSetting = true;
        break;
      case "PERC":
        state.HealthColors.auraPercPC = Number.parseInt(parts[2], 10);
        state.HealthColors.auraPerc = Number.parseInt(parts[3], 10);
        changedSetting = true;
        break;
      case "PC":
        state.HealthColors.PCAura = !state.HealthColors.PCAura;
        changedSetting = true;
        break;
      case "NPC":
        state.HealthColors.NPCAura = !state.HealthColors.NPCAura;
        changedSetting = true;
        break;
      case "GMNPC":
        state.HealthColors.GM_NPCNames = parts[2];
        changedSetting = true;
        break;
      case "GMPC":
        state.HealthColors.GM_PCNames = parts[2];
        changedSetting = true;
        break;
      case "PCNPC":
        state.HealthColors.NPCNames = parts[2];
        changedSetting = true;
        break;
      case "PCPC":
        state.HealthColors.PCNames = parts[2];
        changedSetting = true;
        break;
      case "DEAD":
        state.HealthColors.auraDead = !state.HealthColors.auraDead;
        changedSetting = true;
        break;
      case "DEADPC":
        state.HealthColors.auraDeadPC = !state.HealthColors.auraDeadPC;
        changedSetting = true;
        break;
      case "DEADFX":
        state.HealthColors.auraDeadFX = parts[2];
        changedSetting = true;
        break;
      case "SIZE":
        state.HealthColors.AuraSize = Number.parseFloat(parts[2]);
        changedSetting = true;
        break;
      case "A1SHAPE":
        state.HealthColors.Aura1Shape = normalizeShape(
          parts[2],
          state.HealthColors.Aura1Shape,
        );
        changedSetting = true;
        break;
      case "A1TINT":
        state.HealthColors.Aura1Color = normalizeHex6(
          parts[2],
          state.HealthColors.Aura1Color,
        );
        changedSetting = true;
        break;
      case "A2SIZE":
        state.HealthColors.Aura2Size = Number.parseFloat(parts[2]);
        changedSetting = true;
        break;
      case "A2SHAPE":
        state.HealthColors.Aura2Shape = normalizeShape(
          parts[2],
          state.HealthColors.Aura2Shape,
        );
        changedSetting = true;
        break;
      case "A2TINT":
        state.HealthColors.Aura2Color = normalizeHex6(
          parts[2],
          state.HealthColors.Aura2Color,
        );
        changedSetting = true;
        break;
      case "ONEOFF":
        state.HealthColors.OneOff = !state.HealthColors.OneOff;
        changedSetting = true;
        break;
      case "FX":
        state.HealthColors.FX = !state.HealthColors.FX;
        changedSetting = true;
        break;
      case "HEAL":
        state.HealthColors.HealFX = parts[2].toUpperCase();
        syncDefaultFxObjects();
        changedSetting = true;
        break;
      case "HURT":
        state.HealthColors.HurtFX = parts[2].toUpperCase();
        syncDefaultFxObjects();
        changedSetting = true;
        break;
      case "RESET":
        delete state.HealthColors;
        gmWhisper("STATE RESET");
        checkInstall();
        changedSetting = true;
        break;
      case "RESET-FX":
        resetDefaultFxObjects();
        break;
      case "RESET-ALL":
        runResetAllFlow();
        changedSetting = true;
        break;
      case "FORCEALL":
        menuForceUpdate();
        return;
      case "UPDATE":
        manUpdate(msg);
        return;
    }

    if (changedSetting) {
      showSettingsInGameChat();
    } else {
      showMenu();
    }
  }

  // ————— OUTSIDE API —————
  /**
   * Public entry point for external scripts to request a token color update.
   * Validates that the object is a graphic before delegating to handleToken.
   * @param {object} obj  - Roll20 object to update.
   * @param {object} prev - Previous attribute snapshot (passed through to handleToken).
   */
  function updateToken(obj, prev) {
    if (obj.get("type") === "graphic") {
      handleToken(obj, prev);
    } else {
      gmWhisper("Script sent non-Token to be updated!");
    }
  }

  // ————— EVENT HANDLERS —————
  /**
   * Registers all Roll20 event listeners for the script.
   * - chat:message  → handleInput  (command processing)
   * - change:token  → handleToken  (live HP changes)
   * - add:token     → handleToken  (with 400ms delay to allow token data to settle)
   */
  function registerEventHandlers() {
    on("chat:message", handleInput);
    on("change:graphic", handleToken);
    on("add:token", (t) => {
      setTimeout(() => {
        const token = getObj("graphic", t.id);
        const prev = JSON.parse(JSON.stringify(token));
        handleToken(token, prev, "YES");
      }, 400);
    });
  }

  // ————— BOOTSTRAP —————
  globalThis.HealthColors = {
    gmWhisper,
    update: updateToken,
    checkInstall,
    registerEventHandlers,
  };

  on("ready", () => {
    gmWhisper("API READY");
    checkInstall();
    registerEventHandlers();
  });
})();
