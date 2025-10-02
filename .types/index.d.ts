type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Base interface for all Roll20 objects with common methods
 */
interface Roll20Object<T extends Record<string, any>> {
  /** The unique ID of this object */
  id: string;
  properties: Prettify<T & { id: string }>;

  /**
   * Get an attribute of the object
   * @param property Name of the property to get
   * @returns Value of the property or undefined if the property doesn't exist
   */
  get<K extends keyof T>(property: K | "_type" | "_id"): T[K];

  /**
   * Set attributes of the object
   * @param properties Object containing the properties to set and their values
   * @returns This object for chaining
   */
  set(properties: Partial<T>): this;

  /**
   * Remove this object from the campaign
   */
  remove(): void;
}

type CampaignProperties = {
  _id: string;
  _type: "campaign";
  turnorder: string;
  initiativepage: string | false;
  playerpageid: string | false;
  playerspecificpages: {[playerId: string]: string} | false;
  _journalfolder: string;
  _jukeboxfolder: string;
  token_markers: string;
};

declare type Roll20Campaign = Prettify<Roll20Object<CampaignProperties>>;

type PlayerProperties = {
  _id: string;
  _type: "player";
  _d20userid: string;
  _displayname: string;
  _online: boolean;
  _lastpage: string;
  _macrobar: string;
  speakingas: string;
  color: string;
  showmacrobar: boolean;
};

declare type Roll20Player = Prettify<Roll20Object<PlayerProperties>>;

type PageProperties = {
  _id: string;
  _type: "page";
  _zorder: string;
  name: string;
  width: number;
  height: number;
  background_color: string;
  archived: boolean;
  jukeboxtrigger: string;
  showdarkness: boolean;
  fog_opacity: number;
  showgrid: boolean;
  grid_opacity: number;
  gridcolor: string;
  grid_type: "square" | "hex" | "hexr" | "dimetric" | "isometric";
  gridlabels: boolean;
  snapping_increment: number;
  scale_number: number;
  scale_units: string;
  diagonaltype: "foure" | "pythagorean" | "threefive" | "manhattan";

  // Dynamic lighting properties
  dynamic_lighting_enabled: boolean;
  daylight_mode_enabled: boolean;
  daylightModeOpacity: number;
  explorer_mode: "basic" | "off";
  force_lighting_refresh: boolean;
  lightupdatedrop: boolean;

  // Legacy dynamic lighting properties
  showlighting: boolean;
  lightenforcelos: boolean;
  lightrestrictmove: boolean;
  lightglobalillum: boolean;
};

declare type Roll20Page = Prettify<Roll20Object<PageProperties>>;

type PathProperties = {
  _id: string;
  _type: "path";
  _pageid: string;
  _path: string;
  fill: string;
  stroke: string;
  rotation: number;
  layer: "gmlayer" | "objects" | "map" | "walls";
  stroke_width: number;
  width: number;
  height: number;
  top: number;
  left: number;
  scaleX: number;
  scaleY: number;
  barrierType: "wall" | "oneWay" | "transparent";
  oneWayReversed: boolean;
  controlledby: string;
};

declare type Roll20Path = Prettify<Roll20Object<PathProperties>>;

// Text type with proper properties
type TextProperties = {
  _id: string;
  _type: "text";
  _pageid: string;
  top: number;
  left: number;
  width: number;
  height: number;
  text: string;
  font_size: number;
  rotation: number;
  color: string;
  font_family: string;
  layer: "gmlayer" | "objects" | "map" | "walls";
  controlledby: string;
};

declare type Roll20Text = Prettify<Roll20Object<TextProperties>>;

// Graphic type with proper properties
type GraphicProperties = {
  _id: string;
  _type: "graphic";
  _subtype: "token" | "card";
  _cardid?: string;
  _pageid: string;
  imgsrc: string;
  represents: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
  layer: "gmlayer" | "objects" | "map" | "walls";
  isdrawing: boolean;
  flipv: boolean;
  fliph: boolean;
  name: string;
  gmnotes: string;
  tooltip: string;
  show_tooltip: boolean;
  controlledby: string;
  bar1_link: string;
  bar2_link: string;
  bar3_link: string;
  bar1_value: string;
  bar2_value: string;
  bar3_value: string;
  bar1_max: string;
  bar2_max: string;
  bar3_max: string;
  bar_location: "overlap_top" | "overlap_bottom" | "bottom";
  compact_bar: "compact" | "";
  aura1_radius: string;
  aura2_radius: string;
  aura1_color: string;
  aura2_color: string;
  aura1_square: boolean;
  aura2_square: boolean;
  tint_color: string;
  statusmarkers: string;
  showname: boolean;
  showplayers_name: boolean;
  showplayers_bar1: boolean;
  showplayers_bar2: boolean;
  showplayers_bar3: boolean;
  showplayers_aura1: boolean;
  showplayers_aura2: boolean;
  playersedit_name: boolean;
  playersedit_bar1: boolean;
  playersedit_bar2: boolean;
  playersedit_bar3: boolean;
  playersedit_aura1: boolean;
  playersedit_aura2: boolean;
  lastmove: string;
  sides: string;
  currentSide: number;
  lockMovement: boolean;
};

declare type Roll20Graphic = Prettify<Roll20Object<GraphicProperties>>;

// Character type with proper properties
type CharacterProperties = {
  _id: string;
  _type: "character";
  avatar: string;
  name: string;
  bio: string;
  gmnotes: string;
  archived: boolean;
  inplayerjournals: string;
  controlledby: string;
  _defaulttoken: string;
};

declare type Roll20Character = Prettify<Roll20Object<CharacterProperties>>;

// Attribute type with proper properties
type AttributeProperties = {
  _id: string;
  _type: "attribute";
  _characterid: string;
  name: string;
  current: string;
  max: string;
};

declare type Roll20Attribute = Prettify<Roll20Object<AttributeProperties> & {
  setWithWorker: (attributes: Partial<AttributeProperties>) => void
}>;

// Beacon Attribute type with proper properties

type BeaconAttributeProperties = {
  _id: string;
  _type: "beaconAttribute";
  _characterid: string;
  name: string;
  current: string;
  max: string;
};

declare type Roll20BeaconAttribute = Prettify<Roll20Object<BeaconAttributeProperties>>;

// Ability type with proper properties
type AbilityProperties = {
  _id: string;
  _type: "ability";
  _characterid: string;
  name: string;
  description: string;
  action: string;
  istokenaction: boolean;
};

declare type Roll20Ability = Prettify<Roll20Object<AbilityProperties>>;

// Handout type with proper properties
type HandoutProperties = {
  _id: string;
  _type: "handout";
  avatar: string;
  name: string;
  notes: string;
  gmnotes: string;
  inplayerjournals: string;
  archived: boolean;
  controlledby: string;
};

declare type Roll20Handout = Prettify<Roll20Object<HandoutProperties>>;

// Macro type with proper properties
type MacroProperties = {
  _id: string;
  _type: "macro";
  _playerid: string;
  name: string;
  action: string;
  visibleto: string;
  istokenaction: boolean;
};

declare type Roll20Macro = Prettify<Roll20Object<MacroProperties>>;

// RollableTable type with proper properties
type RollableTableProperties = {
  _id: string;
  _type: "rollabletable";
  name: string;
  showplayers: boolean;
};

declare type Roll20Table = Prettify<Roll20Object<RollableTableProperties>>;

// TableItem type with proper properties
type TableItemProperties = {
  _id: string;
  _type: "tableitem";
  _rollabletableid: string;
  avatar: string;
  name: string;
  weight: number;
};

declare type Roll20TableItem = Prettify<Roll20Object<TableItemProperties>>;

// Deck type with proper properties
type DeckProperties = {
  _id: string;
  _type: "deck";
  name: string;
  _currentDeck: string;
  _currentIndex: number;
  _currentCardShown: boolean;
  showplayers: boolean;
  playerscandraw: boolean;
  avatar: string;
  shown: boolean;
  players_seenumcards: boolean;
  players_seefrontofcards: boolean;
  gm_seenumcards: boolean;
  gm_seefrontofcards: boolean;
  infinitecards: boolean;
  _cardSequencer: number;
  cardsplayed: "faceup" | "facedown";
  defaultheight: string;
  defaultwidth: string;
  discardpilemode: "none" | "choosebacks" | "choosefronts" | "drawtop" | "drawbottom";
  _discardPile: string;
  removedcardsmode: "choosefronts" | string;
  removedcards: "none" | string;
};

declare type Roll20Deck = Prettify<Roll20Object<DeckProperties>>;

// Card type with proper properties
type CardProperties = {
  name: string;
  avatar: string;
  _deckid: string;
  _type: "card";
  _id: string;
  is_removed: "false" | "true";
  tooltip: string;
  card_back: string;
};

declare type Roll20Card = Prettify<Roll20Object<CardProperties>>;

// Hand type with proper properties
type HandProperties = {
  currentHand: string;
  _type: "hand";
  _parentid: string;
  _id: string;
  currentView: "bydeck" | "bycard";
};

declare type Roll20Hand = Prettify<Roll20Object<HandProperties>>;

// JukeboxTrack type with proper properties
type JukeboxTrackProperties = {
  _id: string;
  _type: "jukeboxtrack";
  playing: boolean;
  softstop: boolean;
  title: string;
  volume: number;
  loop: boolean;
};

declare type Roll20JukeboxTrack = Prettify<Roll20Object<JukeboxTrackProperties>>;

// CustomFX type with proper properties
type CustomFXProperties = {
  _id: string;
  _type: "custfx";
  name: string;
  definition: Record<string, any>;
};

declare type Roll20CustomFX = Prettify<Roll20Object<CustomFXProperties>>;

// Door type with proper properties
type DoorProperties = {
  _id: string;
  _type: "door";
  color: string;
  x: number;
  y: number;
  isOpen: boolean;
  isLocked: boolean;
  isSecret: boolean;
  path: {
    handle0: { x: number; y: number };
    handle1: { x: number; y: number };
  };
};

declare type Roll20Door = Prettify<Roll20Object<DoorProperties>>;

// Window type with proper properties
type WindowProperties = {
  _id: string;
  _type: "window";
  color: string;
  x: number;
  y: number;
  isOpen: boolean;
  isLocked: boolean;
  isSecret: boolean;
  path: {
    handle0: { x: number; y: number };
    handle1: { x: number; y: number };
  };
  pageid?: string;
};

declare type Roll20Window = Prettify<Roll20Object<WindowProperties>>;

// Refactored: Create a discriminated union based on the _type property in each object's properties
type AnyRoll20Object =
  | Roll20Campaign
  | Roll20Player
  | Roll20Page
  | Roll20Path
  | Roll20Text
  | Roll20Graphic
  | Roll20Character
  | Roll20Attribute
  | Roll20Ability
  | Roll20Handout
  | Roll20Macro
  | Roll20Table
  | Roll20TableItem
  | Roll20Deck
  | Roll20Card
  | Roll20Hand
  | Roll20JukeboxTrack
  | Roll20CustomFX
  | Roll20Door
  | Roll20Window;

// Type mapping for getObj function
type Roll20ObjectTypeToInstance = {
  "campaign": Roll20Campaign;
  "player": Roll20Player;
  "page": Roll20Page;
  "path": Roll20Path;
  "text": Roll20Text;
  "graphic": Roll20Graphic;
  "character": Roll20Character;
  "attribute": Roll20Attribute;
  "ability": Roll20Ability;
  "handout": Roll20Handout;
  "macro": Roll20Macro;
  "rollabletable": Roll20Table;
  "tableitem": Roll20TableItem;
  "deck": Roll20Deck;
  "card": Roll20Card;
  "hand": Roll20Hand;
  "jukeboxtrack": Roll20JukeboxTrack;
  "custfx": Roll20CustomFX;
  "door": Roll20Door;
  "window": Roll20Window;
};

/**
 * Gets a Roll20 object by type and ID
 * @param type The type of object to get (e.g., "character", "graphic", "attribute")
 * @param id The unique ID of the object to get
 * @returns The found object or null if no object with that ID exists of that type
 */
declare function getObj<T extends keyof Roll20ObjectTypeToInstance>(
  type: T,
  id: string
): Roll20ObjectTypeToInstance[T] | null;

/**
 * Options for the findObjs function
 */
type FindObjsOptions = {
  /** If true, string comparisons are case-insensitive */
  caseInsensitive?: boolean;
};

/**
 * Gets an array of Roll20 objects that match the specified properties
 * @param attrs An object with properties to match against Roll20 objects
 * @param options Additional options for the search
 * @returns An array of Roll20 objects matching the criteria
 *
 * @example Find all graphics on the current player page
 * const currentPageGraphics = findObjs({
 *   _pageid: Campaign().get("playerpageid"),
 *   _type: "graphic"
 * });
 *
 * @example Find tokens named "Target" (case-insensitive)
 * const targetTokens = findObjs({
 *   name: "target"
 * }, {caseInsensitive: true});
 */
declare function findObjs<T extends keyof Roll20ObjectTypeToInstance>(attrs: Partial<Roll20ObjectTypeToInstance[T]["properties"]> & { _type: T }, options?: FindObjsOptions): Roll20ObjectTypeToInstance[T][];

/**
 * Filters Roll20 objects by executing the callback function on each object
 * @param callback A function that takes a Roll20 object and returns true if it should be included
 * @returns An array of Roll20 objects for which the callback returned true
 *
 * @remarks
 * It is generally inadvisable to use filterObjs() for most purposes – due to findObjs() having
 * built-in indexing for better executing speed, it is almost always better to use findObjs()
 * to get objects of the desired type first, then filter them using the native .filter() method for arrays.
 *
 * @example Find all objects in the top-left 200x200 area
 * const results = filterObjs(function(obj) {
 *   if(obj.get("left") < 200 && obj.get("top") < 200) return true;
 *   else return false;
 * });
 */
declare function filterObjs(callback: (obj: Roll20Object<AnyRoll20Object>) => boolean): Roll20Object<AnyRoll20Object>[];

/**
 * Returns an array of all objects in the game (all types)
 * @returns An array of all Roll20 objects in the game
 *
 * @remarks
 * This is equivalent to calling filterObjs and just returning true for every object.
 */
declare function getAllObjs(): Roll20Object<AnyRoll20Object>[];

/**
 * Gets the value of an attribute for a character
 * @param character_id The ID of the character
 * @param attribute_name The name of the attribute
 * @param value_type Optional parameter to specify "current" or "max" (defaults to "current")
 * @returns The value of the attribute or the default value from the character sheet if not present
 *
 * @remarks
 * This function only gets the value of the attribute, not the attribute object itself.
 * If you need to reference properties other than "current" or "max", or if you need to
 * change properties of the attribute, you must use other functions like findObjs.
 *
 * For Repeating Sections, you can use the format repeating_section_$n_attribute, where n is
 * the repeating row number (RowIndex) (starting with zero).
 * For example, repeating_spells_$2_name will return the value of name from the third row of repeating_spells.
 */
declare function getAttrByName(character_id: string, attribute_name: string, value_type?: "current" | "max"): string;

/**
 * Gets the value of a sheet item for a character (beacon sheets)
 * @param character_id The ID of the character
 * @param item_name The name of the sheet item
 * @param value_type Optional parameter to specify "current" or "max" (defaults to "current")
 * @returns Promise that resolves to the value of the sheet item
 *
 * @remarks
 * This is an asynchronous function that returns a Promise. It is used to access Beacon computed attributes and user attributes.
 *
 * @example Get a character's hit points
 * const hp = await getSheetItem("-KxUZ0wYG9gDCGukimEE", "hp");
 *
 * @example Get a character's maximum hit points
 * const maxHp = await getSheetItem("-KxUZ0wYG9gDCGukimEE", "hp", "max");
 */
declare function getSheetItem(character_id: string, item_name: string, value_type?: "current" | "max"): Promise<string | undefined>;

/**
 * Sets the value of a sheet item for a character (beacon sheets)
 * @param character_id The ID of the character
 * @param item_name The name of the sheet item
 * @param value The value to set
 * @param value_type Optional parameter to specify "current" or "max" (defaults to "current")
 * @returns Promise that resolves to true if successful
 *
 * @remarks
 * This is an asynchronous function that returns a Promise. It is used to modify Beacon computed attributes and user attributes.
 *
 * @example Set a character's hit points
 * await setSheetItem("-KxUZ0wYG9gDCGukimEE", "hp", 10);
 *
 * @example Set a character's maximum hit points
 * await setSheetItem("-KxUZ0wYG9gDCGukimEE", "hp", 20, "max");
 */
declare function setSheetItem(character_id: string, item_name: string, value: any, value_type?: "current" | "max"): Promise<boolean>;

/**
 * Logs a message to the API console on the Script Editor page
 * @param message The message to log (can be any type)
 *
 * @remarks
 * Useful for debugging your scripts and getting a better handle on what's going on inside the API sandbox.
 *
 * @example Log a simple string
 * log("Script initialized");
 *
 * @example Log an object
 * log(character);
 */
declare function log(message: any): void;

/**
 * Moves an object to the front of its current layer
 * @param obj The Roll20 object to move to the front
 *
 * @example Move a token to the front
 * const token = getObj("graphic", "-KxUZ0wYG9gDCGukimEE");
 * toFront(token);
 */
declare function toFront(obj: Roll20Object<Roll20Graphic | Roll20Path | Roll20Text | Roll20Card>): void;

/**
 * Moves an object to the back of its current layer
 * @param obj The Roll20 object to move to the back
 *
 * @example Move a token to the back
 * const token = getObj("graphic", "-KxUZ0wYG9gDCGukimEE");
 * toBack(token);
 */
declare function toBack(obj: Roll20Object<Roll20Graphic | Roll20Path | Roll20Text | Roll20Card>): void;

/**
 * Returns a random integer from 1 to max (inclusive)
 * @param max The maximum value (inclusive)
 * @returns A random integer from 1 to max
 *
 * @remarks
 * This function accounts for Modulo Bias which ensures that the resulting random numbers are evenly distributed.
 * This is the same functionality that Roll20 uses to power its dice rolls, and these numbers have been
 * statistically and rigorously proven to be random.
 *
 * @example Roll a d20
 * const result = randomInteger(20);
 */
declare function randomInteger(max: number): number;

/**
 * Checks if a player is a GM
 * @param playerid The ID of the player to check
 * @returns True if the player is a GM, false otherwise
 *
 * @remarks
 * The function will always return the correct answer depending on the current moment,
 * so even if a GM chooses to re-join as a player or a player is promoted to a GM mid-game,
 * playerIsGM() will respond accordingly without any need to clear a cache or restart the API sandbox.
 *
 * @example Check if the current player is a GM
 * if(playerIsGM(msg.playerid)) {
 *   // Only allow GMs to use this command
 * }
 */
declare function playerIsGM(playerid: string): boolean;

/**
 * Sets the default token for a character
 * @param character The character object
 * @param token The token object to use as the default
 *
 * @remarks
 * Sets the default token for the supplied Character Object to the details of the supplied Token Object.
 * Both objects must already exist. This will overwrite any default token currently associated with the character.
 *
 * @example Set a character's default token
 * const character = getObj("character", "-KxUZ0wYG9gDCGukimEE");
 * const token = getObj("graphic", "-AbCdEfGhIjKlMnOpQr");
 * setDefaultTokenForCharacter(character, token);
 */
declare function setDefaultTokenForCharacter(character: Roll20Object<Roll20Character>, token: Roll20Object<Roll20Graphic>): void;

/** Type definition for FX types */
type FxType = "beam-acid" | "beam-blood" | "beam-charm" | "beam-death" | "beam-fire" | "beam-frost" | "beam-holy" |
              "beam-magic" | "beam-slime" | "beam-smoke" | "beam-water" |
              "bomb-acid" | "bomb-blood" | "bomb-charm" | "bomb-death" | "bomb-fire" | "bomb-frost" | "bomb-holy" |
              "bomb-magic" | "bomb-slime" | "bomb-smoke" | "bomb-water" |
              "breath-acid" | "breath-blood" | "breath-charm" | "breath-death" | "breath-fire" | "breath-frost" |
              "breath-holy" | "breath-magic" | "breath-slime" | "breath-smoke" | "breath-water" |
              "bubbling-acid" | "bubbling-blood" | "bubbling-charm" | "bubbling-death" | "bubbling-fire" | "bubbling-frost" |
              "bubbling-holy" | "bubbling-magic" | "bubbling-slime" | "bubbling-smoke" | "bubbling-water" |
              "burn-acid" | "burn-blood" | "burn-charm" | "burn-death" | "burn-fire" | "burn-frost" | "burn-holy" |
              "burn-magic" | "burn-slime" | "burn-smoke" | "burn-water" |
              "burst-acid" | "burst-blood" | "burst-charm" | "burst-death" | "burst-fire" | "burst-frost" | "burst-holy" |
              "burst-magic" | "burst-slime" | "burst-smoke" | "burst-water" |
              "explode-acid" | "explode-blood" | "explode-charm" | "explode-death" | "explode-fire" | "explode-frost" |
              "explode-holy" | "explode-magic" | "explode-slime" | "explode-smoke" | "explode-water" |
              "glow-acid" | "glow-blood" | "glow-charm" | "glow-death" | "glow-fire" | "glow-frost" | "glow-holy" |
              "glow-magic" | "glow-slime" | "glow-smoke" | "glow-water" |
              "missile-acid" | "missile-blood" | "missile-charm" | "missile-death" | "missile-fire" | "missile-frost" |
              "missile-holy" | "missile-magic" | "missile-slime" | "missile-smoke" | "missile-water" |
              "nova-acid" | "nova-blood" | "nova-charm" | "nova-death" | "nova-fire" | "nova-frost" | "nova-holy" |
              "nova-magic" | "nova-slime" | "nova-smoke" | "nova-water" |
              "splatter-acid" | "splatter-blood" | "splatter-charm" | "splatter-death" | "splatter-fire" | "splatter-frost" |
              "splatter-holy" | "splatter-magic" | "splatter-slime" | "splatter-smoke" | "splatter-water" | string;

/** Type definition for a point to be used in FX functions */
type FxPoint = {
  x: number;
  y: number;
};

/**
 * Spawns a brief effect at the specified location
 * @param x X coordinate for the effect
 * @param y Y coordinate for the effect
 * @param type The type of effect or custom effect ID
 * @param pageid The ID of the page for the effect (defaults to current player page)
 *
 * @remarks
 * For built-in effects, type should be a string like "beam-color", "bomb-color", etc. where color is
 * one of: acid, blood, charm, death, fire, frost, holy, magic, slime, smoke, water.
 * For custom effects, type should be the ID of the custfx object for the custom effect.
 *
 * @example Spawn a fire explosion effect
 * spawnFx(200, 300, "explode-fire");
 */
declare function spawnFx(x: number, y: number, type: FxType | string, pageid?: string): void;

/**
 * Spawns a brief effect between two points
 * @param point1 Starting point {x, y}
 * @param point2 Ending point {x, y}
 * @param type The type of effect or custom effect ID
 * @param pageid The ID of the page for the effect (defaults to current player page)
 *
 * @remarks
 * Works like spawnFx, but for effects that can "travel" between two points.
 * The following effect types must always use spawnFxBetweenPoints instead of spawnFx:
 * beam-color, breath-color, splatter-color
 *
 * @example Spawn an acid beam between two points
 * spawnFxBetweenPoints({x: 100, y: 100}, {x: 400, y: 400}, "beam-acid");
 */
declare function spawnFxBetweenPoints(point1: FxPoint, point2: FxPoint, type: FxType | string, pageid?: string): void;

/**
 * Spawns an ad-hoc custom effect using the provided JSON definition
 * @param x X coordinate for the effect
 * @param y Y coordinate for the effect
 * @param definitionJSON Javascript object following the JSON specification for Custom FX
 * @param pageid The ID of the page for the effect (defaults to current player page)
 *
 * @example Create a custom gold beam effect
 * spawnFxWithDefinition(200, 300, {
 *   "maxParticles": 100,
 *   "duration": 100,
 *   "emissionRate": 3,
 *   "particleLife": 300,
 *   "startColour": [255, 215, 0, 1],
 *   "endColour": [255, 140, 0, 0]
 * });
 */
declare function spawnFxWithDefinition(x: number, y: number, definitionJSON: Record<string, any>, pageid?: string): void;

/**
 * Sends a "ping" to the tabletop
 * @param left X coordinate for the ping
 * @param top Y coordinate for the ping
 * @param pageid ID of the page to be pinged
 * @param playerid ID of the player who performed the ping (defaults to "api" for yellow ping)
 * @param moveAll If true, moves player views to the ping location
 * @param visibleTo Player IDs who can see or be moved by the ping (single ID, array, or comma-delimited string)
 *
 * @example Ping a location
 * sendPing(200, 300, "-KxUZ0wYG9gDCGukimEE");
 *
 * @example Ping and move players to a location
 * sendPing(200, 300, "-KxUZ0wYG9gDCGukimEE", null, true);
 *
 * @example Ping visible only to specific players
 * sendPing(200, 300, "-KxUZ0wYG9gDCGukimEE", null, false, "-MNbCnYT1ss5LfD0S2yD,-MNbCnYU5ss5LfR0T2zA");
 */
declare function sendPing(
  left: number,
  top: number,
  pageid: string,
  playerid?: string,
  moveAll?: boolean,
  visibleTo?: string | string[]
): void;

/**
 * Returns the singleton campaign Roll20 object
 * @returns The campaign object for the current game
 *
 * @example Get the current player page and retrieve the page object
 * const currentPageID = Campaign().get('playerpageid');
 * const currentPage = getObj('page', currentPageID);
 *
 * @example Get the turn order
 * const turnOrderJSON = Campaign().get('turnorder');
 * const turnOrder = JSON.parse(turnOrderJSON || "[]");
 */
declare function Campaign(): Roll20Campaign;

/**
 * Creates a new Roll20 object
 * @param type The type of Roll20 object to create
 * @param attributes The initial values to use for the Roll20 object's properties
 * @returns The Roll20 object that was created
 *
 * @remarks
 * Only the following types may be created:
 * 'graphic', 'text', 'path', 'character', 'ability', 'attribute',
 * 'handout', 'rollabletable', 'tableitem', and 'macro'
 *
 * @example Create a character
 * const character = createObj("character", {
 *   name: "New Character",
 *   bio: "This is a new character created via API"
 * });
 *
 * @example Create a token on the current player page
 * const token = createObj("graphic", {
 *   _pageid: Campaign().get("playerpageid"),
 *   imgsrc: "https://s3.amazonaws.com/files.d20.io/images/1234567/abcdefg.png",
 *   name: "New Token",
 *   left: 140,
 *   top: 200,
 *   width: 70,
 *   height: 70
 * });
 */
declare function createObj<T extends keyof Roll20ObjectTypeToInstance>(type: T, attributes: Partial<Roll20ObjectTypeToInstance[T]["properties"]>): Roll20ObjectTypeToInstance[T];

/** Type definition for roll results */

/**
 * Represents the result of an individual die roll.
 */
type IndividualDieResult = {
  /** The value rolled on the die */
  v: number;
  /** Optional: true if this die was dropped (e.g., due to keep highest/lowest) */
  d?: boolean;
};

/**
 * Describes modifications applied to a roll, like keeping a certain number of dice.
 */
type RollModsKeep = {
  /** How many dice to keep */
  count: number;
  /** "h" for highest, "l" for lowest */
  end: "h" | "l";
};

/**
 * Represents modifications that can be applied to a roll or group of rolls.
 */
type RollMods = {
  /** Optional: Specifies how many dice to keep (highest or lowest) */
  keep?: RollModsKeep;
  // Potentially other types of modifications could be added here
};

/**
 * Represents a standard dice roll (e.g., "1d20", "2d6kh1").
 */
type StandardRoll = {
  /** Discriminator for a regular roll */
  type: "R";
  /** Number of dice rolled */
  dice: number;
  /** Number of sides on each die */
  sides: number;
  /** Array of results for each die */
  results: IndividualDieResult[];
  /** Optional: modifications like keep highest/lowest */
  mods?: RollMods;
};

/**
 * Represents a modifier in a roll expression (e.g., "+2", "-1").
 */
type ModifierRoll = {
  /** Discriminator for a modifier */
  type: "M";
  /** The modifier expression string (e.g., "+2") */
  expr: string;
};

/**
 * Represents an item within the results of a group roll.
 * This usually corresponds to the total of a sub-roll within the group.
 */
type GroupResultItem = {
  /** The value of this sub-result */
  v: number;
  /** Optional: true if this sub-result was dropped from the group's final total */
  d?: boolean;
};

/**
 * Represents a group of rolls (e.g., "{1d20, 2d8}kh1").
 * The `rolls` property here contains an array of sub-groups,
 * each sub-group containing an array of StandardRolls.
 */
type GroupRoll = {
  /** Discriminator for a group roll */
  type: "G";
  /** The type of result for the group (e.g., "sum") */
  resultType: string;
  /**
   * `rolls` is an array of "sub-roll groups". Each sub-roll group is an array of StandardRolls.
   * For example, in "{1d6, 1d8}", `rolls` would be `[[StandardRollFor1d6], [StandardRollFor1d8]]`.
   */
  rolls: StandardRoll[][];
  /** Results of each sub-roll group before final selection (e.g., keep highest) */
  results: GroupResultItem[];
  /** Optional: modifications applied to the group result (e.g., keep highest sub-total) */
  mods?: RollMods;
};

/**
 * A union type representing any item that can appear in the `rolls` array
 * of the main `Results` object. It can be a standard roll, a modifier, or a group roll.
 */
type RollItem = StandardRoll | ModifierRoll | GroupRoll;

/**
 * Contains the detailed results of a single roll expression.
 */
type Results = {
  /** Overall result type (e.g., "sum") */
  resultType: string;
  /** Array of individual roll components (dice, modifiers, groups) */
  rolls: RollItem[];
  /** The final total of the roll expression */
  total: number;
  /** Type of the overall result object (seems to be consistently "V") */
  type: "V";
};

/**
 * Represents a single complete roll entry, including the expression,
 * its parsed results, an ID, and a signature.
 */
type RollData = {
  /** The original roll expression (e.g., "2d20+5") */
  expression: string;
  /** The detailed breakdown and total of the roll */
  results: Results;
  /** A unique identifier for this roll */
  rollid: string;
  /** A signature, likely for verification or tracking */
  signature: string;
};

/**
 * Represents a complete roll result, including the original expression,
 * parsed results, and any inline rolls that were part of the message.
 */

type RollResult = RollData[];

/** Type definition for a chat message object */
type Roll20ChatMessage = {
  /** The display name of the player or character that sent the message */
  who: string;
  /** The ID of the player that sent the message */
  playerid: string;
  /** The type of chat message */
  type: "general" | "rollresult" | "gmrollresult" | "emote" | "whisper" | "desc" | "api";
  /** The contents of the chat message */
  content: string;
  /** The original text of the roll (for rollresult or gmrollresult types) */
  origRoll?: string;
  /** Array of objects containing information about all inline rolls in the message */
  inlinerolls?: RollResult;
  /** The name of the template specified (when content contains roll templates) */
  rolltemplate?: string;
  /** The player ID of the person the whisper is sent to (for whisper type) */
  target?: string;
  /** The display name of the player or character the whisper was sent to (for whisper type) */
  target_name?: string;
  /** Array of objects the user had selected when the command was entered (for api type) */
  selected?: Array<Roll20Graphic["properties"] | Roll20Path["properties"] | Roll20Text["properties"]>;
};

/** Options for the sendChat function */
type SendChatOptions = {
  /** Whether the API should process the message's API commands */
  noarchive?: boolean;
  /** Specifies the speaking player's ID for triggering API scripts that need to identify players */
  playerid?: string;
  /** Temporarily uses another character or player for speaking for API event callbacks */
  spritesheetbucket?: string;
};

type Roll20ObjectType = "graphic" | "text" | "path" | "character" | "attribute" | "ability" | "handout" |
                        "macro" | "rollabletable" | "tableitem" | "campaign" | "player" | "page" |
                        "card" | "hand" | "deck" | "jukeboxtrack" | "custfx" | "door" | "window";

type Roll20EventType =
  // Campaign events
  | "ready"
  | "change:campaign:playerpageid"
  | "change:campaign:turnorder"
  | "change:campaign:initiativepage"
  // Chat event
  | "chat:message"
  // Generic object events
  | `change:${Roll20ObjectType}`
  | `add:${Roll20ObjectType}`
  | `destroy:${Roll20ObjectType}`
  // Property-specific events
  | `change:${Roll20ObjectType}:${string}`;

/**
 * Sends a chat message
 *
 * @param speakingAs Who is speaking - can be a plain name string, player ID ("player|-ABC123"), or character ID ("character|-ABC123")
 * @param input The message content - can include roll commands and other chat features
 * @param callback Optional function to call when the chat message is delivered
 * @param options Optional settings for the chat message
 *
 * @example Send a basic message
 * sendChat("GM", "Hello, players!");
 *
 * @example Send a message as a character
 * sendChat("character|-KxUZ0wYG9gDCGukimEE", "I attack with my sword!");
 *
 * @example Send a roll
 * sendChat("System", "/roll 3d6", function(ops) {
 *   const total = ops[0].inlinerolls[0].results.total;
 *   sendChat("System", "The result is " + total);
 * });
 *
 * @example Send a whisper
 * sendChat("GM", "/w gm This is a secret message only the GM will see");
 */
declare function sendChat(
  speakingAs: string,
  input: string,
  callback?: (operations: Roll20ChatMessage[]) => void,
  options?: SendChatOptions
): void;

/**
 * Registers an event handler for Roll20 events
 *
 * @param event The name of the event to listen for
 * @param callback The function to call when the event occurs
 */
declare function on<E extends Roll20EventType>(event: E, callback: (...args: any[]) => void): void;
declare function on(event: "ready", callback: () => void): void;
declare function on(event: "chat:message", callback: (msg: Roll20ChatMessage) => void): void;
declare function on(
  event: "change:campaign:playerpageid" | "change:campaign:turnorder" | "change:campaign:initiativepage",
  callback: (obj: Roll20Campaign) => void
): void;
declare function on<T extends Roll20ObjectType>(
  event: `change:${T}`,
  callback: (obj: Roll20Object<Extract<AnyRoll20Object, { _type: T }>>, prev: Record<string, any>) => void
): void;
declare function on<T extends Roll20ObjectType>(
  event: `add:${T}` | `destroy:${T}`,
  callback: (obj: Roll20Object<Extract<AnyRoll20Object, { _type: T }>>) => void
): void;
declare function on<T extends Roll20ObjectType>(
  event: `change:${T}:${string}`,
  callback: (obj: Roll20Object<Extract<Roll20ObjectType, { _type: T }>>, prev: Record<string, any>) => void
): void;

/**
 * Type definition for cardInfo function options
 */
type CardInfoOptions = {
  /** Required. Determines what kind of results are returned. */
  type: "hand" | "graphic" | "discard" | "play" | "deck" | "all" | "card";
  /** Required for all types except 'card'. Determines which deck to return information about. */
  deckid?: string;
  /** Required for type 'card'. Determines which card to return information about. */
  cardid?: string;
  /** Optional. Determines whether result will include cards in the discard pile. Ignored for types 'card', 'all', and 'discard'. Defaults to 'false' if omitted. */
  discard?: boolean;
};

/**
 * Type definition for card information object
 */
type CardInfo = {
  /** The type of location where the card is found */
  type: "graphic" | "hand" | "deck" | "discard";
  /** The id of the graphic, hand, or deck containing the card. Omitted for type "discard" */
  id?: string;
  /** The id of the card */
  cardid: string;
  /** The id of the page containing the graphic. Omitted for other types */
  pageid?: string;
  /** The id of the player holding the card. Omitted for other types */
  playerid?: string;
  /** The position of the card in the hand or discard pile. Omitted for types "graphic" and "deck" */
  index?: number;
};

/**
 * Type definition for options when playing a card to the table
 */
type PlayCardToTableSettings = {
  /** X position in pixels. Defaults to the center of the page. */
  left?: number;
  /** Y position in pixels. Defaults to the center of the page. */
  top?: number;
  /** Width of token in pixels. Defaults to the deck's defaultwidth, or to 98 if the deck has no default. */
  width?: number;
  /** Height of token in pixels. Defaults to the deck's defaultheight, or to 140 if the deck has no default. */
  height?: number;
  /** The layer the token will appear on. Defaults to the objects layer. */
  layer?: "gmlayer" | "objects" | "map" | "walls";
  /** The page the token is played to. Defaults to the current player page. */
  pageid?: string;
  /** Whether to treat the token as a drawing. Uses the deck "treatasdrawing" as the default. */
  isdrawing?: boolean;
  /** Whether the card is played face up or face down, with 0 being face up and 1 being face down. Defaults to the deck's default setting. */
  currentSide?: 0 | 1;
};

/**
 * Type definition for options when taking a card from a player
 */
type TakeCardFromPlayerOptions = {
  /** Specify an index of the currentHand array */
  index?: number;
  /** Specify a card by id */
  cardid?: string;
  /** Give it a player's id to trigger the steal card dialog for that player */
  steal?: string;
};

/**
 * Gets information about a group of cards, or one specific card
 * @param options Configuration options defining which cards to retrieve information about
 * @returns Information about requested cards, false if the function fails, or an empty array if no information is retrieved
 *
 * @example Get information about a specific card
 * const info = cardInfo({type: "card", cardid: "-KxUZ0wYG9gDCGukimEE"});
 *
 * @example Get information about all cards in a deck
 * const allCards = cardInfo({type: "all", deckid: "-KxUZ0wYG9gDCGukimEE"});
 *
 * @example Get information about cards in players' hands
 * const handCards = cardInfo({type: "hand", deckid: "-KxUZ0wYG9gDCGukimEE"});
 */
declare function cardInfo(options: CardInfoOptions): CardInfo | CardInfo[] | false;

/**
 * Recalls cards to a deck
 * @param deckid The ID of the deck to recall cards to
 * @param type Optional parameter that determines which cards are recalled (defaults to 'all')
 * @returns True if successful, false if the function fails
 *
 * @example Recall all cards to a deck
 * recallCards("-KxUZ0wYG9gDCGukimEE");
 *
 * @example Recall only cards from hands
 * recallCards("-KxUZ0wYG9gDCGukimEE", "hand");
 */
declare function recallCards(deckid: string, type?: "hand" | "graphic" | "all"): boolean;

/**
 * Shuffles a deck
 * @param deckid The ID of the deck to shuffle
 * @param discardOrOrder Optional, either a boolean to determine whether to include the discard pile (defaults to true), or an array of card IDs specifying the new order
 * @param deckOrder Optional, an array of card IDs specifying the new order (only used if second parameter is a boolean)
 * @returns An array of card IDs representing the new deck order if successful, false if the function fails
 *
 * @example Shuffle a deck including the discard pile
 * shuffleDeck("-KxUZ0wYG9gDCGukimEE");
 *
 * @example Shuffle only the remaining cards in the deck, excluding the discard pile
 * shuffleDeck("-KxUZ0wYG9gDCGukimEE", false);
 *
 * @example Arrange the deck in a specific order
 * const cardIds = _.pluck(cardInfo({type: "deck", deckid: "-KxUZ0wYG9gDCGukimEE", discard: true}), "cardid");
 * shuffleDeck("-KxUZ0wYG9gDCGukimEE", cardIds);
 */
declare function shuffleDeck(deckid: string, discardOrOrder?: boolean | string[], deckOrder?: string[]): string[] | false;

/**
 * Draws a card from a deck
 * @param deckid The ID of the deck to draw from
 * @param cardid Optional ID of a specific card to draw (if omitted, draws the top card)
 * @returns The ID of the drawn card if successful, false if the function fails
 *
 * @example Draw the top card from a deck
 * const drawnCardId = drawCard("-KxUZ0wYG9gDCGukimEE");
 *
 * @example Draw a specific card from a deck
 * const drawnCardId = drawCard("-KxUZ0wYG9gDCGukimEE", "-AbCdEfGhIjKlMnOpQr");
 */
declare function drawCard(deckid: string, cardid?: string): string | false;

/**
 * Picks up a card from the table or discard pile
 * @param cardid The ID of the card to pick up
 * @param fromDiscard Whether to pick up the card from the discard pile (true) or the table (false, default)
 * @returns The ID of the card if successful, false if the function fails
 *
 * @example Pick up a card from the table
 * const cardId = pickUpCard("-KxUZ0wYG9gDCGukimEE");
 *
 * @example Pick up a card from the discard pile
 * const cardId = pickUpCard("-KxUZ0wYG9gDCGukimEE", true);
 */
declare function pickUpCard(cardid: string, fromDiscard?: boolean): string | false;

/**
 * Takes a card from a player's hand
 * @param playerid The ID of the player to take a card from
 * @param options Optional settings to specify which card to take and how to take it
 * @returns The ID of the card if successful, false if the function fails
 *
 * @example Take a random card from a player's hand
 * const cardId = takeCardFromPlayer("-KxUZ0wYG9gDCGukimEE");
 *
 * @example Take a specific card from a player's hand
 * const cardId = takeCardFromPlayer("-KxUZ0wYG9gDCGukimEE", {cardid: "-AbCdEfGhIjKlMnOpQr"});
 *
 * @example Initiate a card steal dialog for a player
 * const cardId = takeCardFromPlayer("-KxUZ0wYG9gDCGukimEE", {steal: "-MnOpQrStUvWxYz1234"});
 */
declare function takeCardFromPlayer(playerid: string, options?: TakeCardFromPlayerOptions): string | false;

/**
 * Gives a card to a player
 * @param cardid The ID of the card to give
 * @param playerid The ID of the player to give the card to
 * @returns The ID of the card if successful, false if the function fails
 *
 * @example Give a card to a player
 * giveCardToPlayer("-KxUZ0wYG9gDCGukimEE", "-AbCdEfGhIjKlMnOpQr");
 */
declare function giveCardToPlayer(cardid: string, playerid: string): string | false;

/**
 * Plays a card to the table
 * @param cardid The ID of the card to play
 * @param settings Optional settings for the token appearance and placement
 * @returns The ID of the graphic object created if successful, false if the function fails
 *
 * @example Play a card to the table with default settings
 * const tokenId = playCardToTable("-KxUZ0wYG9gDCGukimEE");
 *
 * @example Play a card face down at specific coordinates
 * const tokenId = playCardToTable("-KxUZ0wYG9gDCGukimEE", {
 *   left: 300,
 *   top: 200,
 *   currentSide: 1
 * });
 */
declare function playCardToTable(cardid: string, settings?: PlayCardToTableSettings): string | false;

/**
 * Deals a card from the deck to each object in the turn order
 * @param deckid The ID of the deck to deal from
 * @returns True if successful, false if the function fails
 *
 * @example Deal cards to turn order items
 * dealCardsToTurn("-KxUZ0wYG9gDCGukimEE");
 */
declare function dealCardsToTurn(deckid: string): boolean;

/**
 * Starts playing a jukebox playlist
 * @param playlist_id The ID of the playlist to start playing
 *
 * @remarks
 * Note: Using Jukebox/soundcloud functions will not throw errors, but they no longer do anything.
 * See "In Regards to SoundCloud" documentation.
 *
 * @example Play a jukebox playlist
 * playJukeboxPlaylist("-KxUZ0wYG9gDCGukimEE");
 */
declare function playJukeboxPlaylist(playlist_id: string): void;

/**
 * Stops the currently playing jukebox playlist
 *
 * @remarks
 * Note: Using Jukebox/soundcloud functions will not throw errors, but they no longer do anything.
 * See "In Regards to SoundCloud" documentation.
 *
 * @example Stop the currently playing playlist
 * stopJukeboxPlaylist();
 */
declare function stopJukeboxPlaylist(): void;

