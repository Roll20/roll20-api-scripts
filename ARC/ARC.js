
var Arc = Arc || (function() {
  "use strict";

  //#region Constants
  // ASSETS
  const ASSET__URL = `https://raw.githubusercontent.com/morgdalaine/arc-momatoes/main/api-script/ARC/assets/`;
  const IMAGE__BG_LIGHT = `${ASSET__URL}bg_light.png`;
  const IMAGE__BG_DARK =  `${ASSET__URL}bg_dark.png`;
  const IMAGE__BG_DOOM =  `${ASSET__URL}bg_doom.png`;
  const IMAGE__BG_OMEN =  `${ASSET__URL}bg_omen.jpg`;
  const IMAGE__BG_END =   `${ASSET__URL}bg_end.jpg`;
  const IMAGE__DOWNLOAD = `${ASSET__URL}download.svg`;

  // COLOR
  const COLOR__PRIMARY_LIGHT =   `#171212`;
  const COLOR__HEADER_LIGHT =    `#526c69`;
  const COLOR__SUBHEADER_LIGHT = `#526c69`;
  const COLOR__SHADOW_LIGHT =    `#acb7b1`;

  const COLOR__PRIMARY_DARK =    `#fefeff`;
  const COLOR__HEADER_DARK =     `#dabb3d`;
  const COLOR__SUBHEADER_DARK =  `#82a677`;

  const COLOR__BUTTON_BACKGROUND = `#efdd86`;

  // FONTS
  const FONT__SANS = `'Josefin Sans', sans-serif`;
  const FONT__MONOSPACE = `'Fira Code', monospace`;

  // COMMANDS
  const COMMAND__HELP =   `!arc .help`;
  const COMMAND__IMPORT = `!arc .import`;
  const COMMAND__EXPORT = `!arc .export`;
  const COMMAND__CLOCK =  `!arc .clock`;
  const COMMAND__OMENS =  `!arc .omens`;

  // CONSTANTS
  const CONST__CHARSHEET_LINK = "https://journal.roll20.net/character/";
  const CONST__THIRTY_MINUTES = 1800000;
  const CONST__SIXTY_MINUTES = 3600000;
  const CONST__SESSION = -1;
  const CONST__XP_SESSION = 12;
  const CONST__XP_CLOCK = 3;
  const CONST__VERSION = "1.0";
  const CONST__API = "arc";
  const CONST__SCRIPT = "ARC";
  //#endregion Constants

  //#region CSS Styles
  // STYLE
  const STYLE__CONTAINER = [
    `max-width: 333px;`,
    `font-size: 13px;`,
    `background: transparent;`,
  ].join("");

  const STYLE__BASE_CONTENT = [
    `position: relative;`,
    `margin: 4px;`,
    `padding: 4px;`,
    `background-repeat: no-repeat;`,
    `background-size: cover;`,
    `border: 2px solid ${COLOR__PRIMARY_LIGHT};`,
  ].join("");

  const STYLE__CONTENT_LIGHT = [
    STYLE__BASE_CONTENT,
    `background-image: url('${IMAGE__BG_LIGHT}');`,
    `color: ${COLOR__PRIMARY_LIGHT};`,
  ].join("");

  const STYLE__CONTENT_DARK = [
    STYLE__BASE_CONTENT,
    `background-image: url('${IMAGE__BG_DARK}');`,
    `color: ${COLOR__PRIMARY_DARK};`,
  ].join("");

  const STYLE__CONTENT_AUGUR = [
    STYLE__CONTENT_DARK,
    `background-image: url('${IMAGE__BG_DARK}');`,
    `padding-bottom: 25%;`,
  ].join("");

  const STYLE__CONTENT_DOOM = [
    STYLE__CONTENT_DARK,
    `background-image: url('${IMAGE__BG_DOOM}');`,
    `min-height: 180px;`,
  ].join("");

  const STYLE__CONTENT_MOMENT = [
    STYLE__CONTENT_DARK,
    `background-image: url('${IMAGE__BG_OMEN}');`,
    `height: 404px;`,
  ].join("");

  const STYLE__CONTENT_END = [
    STYLE__CONTENT_DARK,
    `background-image: url('${IMAGE__BG_END}');`,
    `height: 404px;`,
  ].join("");

  const STYLE__BASE_HEADER = [
    `font-family: ${FONT__SANS};`,
    `text-transform: uppercase;`,
    `letter-spacing: 4px;`,
    `margin: 5px;`,
    `text-align: left;`,
    `font-size: 18px;`,
    `line-height: 24px;`,
    `display: block;`,
  ].join("");

  const STYLE__HEADER_LIGHT = [
    STYLE__BASE_HEADER,
    `color: ${COLOR__HEADER_LIGHT};`,
    `text-shadow: 0px 0px 6px ${COLOR__SHADOW_LIGHT};`,
  ].join("");

  const STYLE__HEADER_DARK = [
    STYLE__BASE_HEADER,
    `color: ${COLOR__HEADER_DARK};`,
    `text-shadow: 0px 0px 6px ${COLOR__HEADER_DARK};`,
  ].join("");

  const STYLE__BASE_LOW_HEADER = [
    `display: block;`,
    `position: absolute;`,
    `font-family: ${FONT__SANS};`,
    `text-transform: uppercase;`,
    `letter-spacing: 4px;`,
    `font-size: 10px;`,
    `line-height: 16px;`,
    `text-align: left;`,
    `left: 20px;`,
    `bottom: 10px;`,
  ].join("");

  const STYLE__LOW_HEADER_LIGHT = [
    STYLE__BASE_LOW_HEADER,
    `color: ${COLOR__HEADER_LIGHT};`,
    `text-shadow: 0px 0px 6px ${COLOR__SHADOW_LIGHT};`,
  ].join("");

  const STYLE__LOW_HEADER_DARK = [
    STYLE__BASE_LOW_HEADER,
    `color: ${COLOR__HEADER_DARK};`,
    `text-shadow: 0px 0px 6px ${COLOR__HEADER_DARK};`,
  ].join("");

  const STYLE__BASE_SUBHEADER = [
    `font-family: ${FONT__SANS};`,
    `font-size: 14px;`,
    `text-transform: uppercase;`,
    `letter-spacing: 4px;`,
    `margin: 5px;`,
    `display: block;`,
  ].join("");

  const STYLE__SUBHEADER_LIGHT = [
    STYLE__BASE_SUBHEADER,
    `color: ${COLOR__SUBHEADER_LIGHT};`,
  ].join("");

  const STYLE__SUBHEADER_DARK = [
    STYLE__BASE_SUBHEADER,
    `color: ${COLOR__SUBHEADER_DARK};`,
  ].join("");

  const STYLE__SUBHEADER_AUGUR = [
    STYLE__BASE_SUBHEADER,
    `text-shadow: 0px 0px 6px ${COLOR__PRIMARY_LIGHT};`,
    `padding-bottom: 25%;`,
  ].join("");

  const STYLE__CONSUME_MOMENT = [
    `position: absolute;`,
    `left: 5%;`,
    `bottom: 25%;`,
  ].join("");

  const STYLE__HERALD_THE_END = [
    `position: absolute;`,
    `left: 5%;`,
    `bottom: 12%;`,
  ].join("");

  const STYLE__COMMAND_BUTTON = [
    `padding: 6px;`,
    `border-color: transparent;`,
    `border-radius: 0px;`,
    `color: ${COLOR__PRIMARY_LIGHT};`,
    `background: ${COLOR__BUTTON_BACKGROUND};`,
    `font-size: 16px;`,
    `line-height: 18px;`,
    `font-weight: bold;`,
    `font-family: ${FONT__SANS};`,
    `margin-top: 8px;`,
  ].join("");

  const STYLE__BASE_CONFIG_BTN = [
    `display: block;`,
    `text-align: center;`,
    `font-family: ${FONT__SANS};`,
    `border-radius: 0px;`,
    `border: none;`,
    `border-bottom: 2px solid ${COLOR__HEADER_DARK};`,
    `background: none;`,
    `font-size: 16px;`,
    `line-height: 18px;`,
  ].join("");

  const STYLE__CONFIG_BUTTON_LIGHT = [
    STYLE__BASE_CONFIG_BTN,
    `color: ${COLOR__PRIMARY_LIGHT};`,
  ].join("");

  const STYLE__CONFIG_BUTTON_DARK = [
    STYLE__BASE_CONFIG_BTN,
    `color: ${COLOR__PRIMARY_DARK};`,
  ].join("");

  const STYLE__DESCRIPTION = [
    `display: block;`,
    `font-family: ${FONT__SANS};`,
    `padding: 4px;`,
  ].join("");

  const STYLE__TABLE = [
    `margin: 8px 0;`,
  ].join("");

  const STYLE__READY_LINK = [
    `color: ${COLOR__PRIMARY_LIGHT};`,
    `font-size: 1em;`,
    `font-family: ${FONT__SANS};`,
    `text-decoration: underline;`,
    `font-style: normal;`,
  ].join("");

  const STYLE__CHARSHEET_LINK = [
    `background: none;`,
    `border: none;`,
    `border-radius: 0px;`,
    `padding: 0;`,
    `font-family: ${FONT__SANS};`,
    `font-size: 16px;`,
    `text-decoration: underline;`,
  ].join("");

  const STYLE__DOWNLOAD_LINK = [
    `height: 20px;`,
    `width: 20px;`,
    `background: ${COLOR__BUTTON_BACKGROUND};`,
    `border-radius: 8px;`,
    `margin-right: 8px;`,
    `border: none;`,
  ].join("");

  const STYLE__EXPAND_BTN = [
    `height: 20px;`,
    `width: 20px;`,
    `background: ${COLOR__BUTTON_BACKGROUND};`,
    `border-radius: 50%;`,
    `border: none;`,
    `margin: 4px;`,
    `float: right`,
  ].join("");

  const STYLE__HR = [
    `border: none;`,
    `margin: 5px;`,
    `border-top: 1px dashed ${COLOR__PRIMARY_DARK};`,
  ].join("");

  const STYLE__MONOSPACE = [
    `display: block;`,
    `font-family: ${FONT__MONOSPACE};`,
    `font-size: 8px;`,
    `margin: 4px;`,
    `padding: 4px;`,
    `height: 100px;`,
    `overflow: scroll;`,
    `border: 1px dashed ${COLOR__SHADOW_LIGHT};`,
    `line-height: 10px;`,
  ].join("");

  const STYLE__BUTTON_BLOCK = [
    `display: block;`,
    `margin: 4px;`,
    `padding: 4px 0 1px 2px;`,
    `font-family: ${FONT__SANS};`,
    `text-align: center;`,
    `background: transparent;`,
    `border: 1px solid ${COLOR__BUTTON_BACKGROUND};`,
    `color: ${COLOR__BUTTON_BACKGROUND};`,
    `text-transform: uppercase;`,
    `font-weight: bold;`,
    `letter-spacing: 2px;`,
  ].join("");

  const STYLE__CLOCK_RESET = [
    STYLE__BUTTON_BLOCK,
  ].join("");

  const STYLE__XP_NAME = [
    `font-family: ${FONT__SANS};`,
    `padding: 4px;`,
    `font-size: 16px;`,
  ].join("");

  const STYLE__DIE = [
    `margin: 5px;`,
    `border: 1px solid ${COLOR__HEADER_DARK};`,
    `height: 40px;`,
  ].join("");

  const STYLE__XP_GAIN = [
    `font-family: ${FONT__SANS};`,
    `color: ${COLOR__HEADER_DARK};`,
    `text-shadow: 0px 0px 6px ${COLOR__HEADER_DARK};`,
    `font-size: 30px;`,
  ].join("");
  //#endregion CSS Styles

  let Doom;

  // State Object
  const defaults = {
    clock: {
      play: false,
      elapsed: 0,
      face: "",
      owner: "",
      hideSetup: false
    },
    doom: {
      advances: CONST__THIRTY_MINUTES,
      assignXP: false,
      consumed: 0,
      moments: 4,
      omens: 3
    },
    config: {
      overwrite: false,
      journal: "all",
      controller: "all",
    }
  };

  //#region API Initialization Methods
  const debug = false;
  const checkInstall = () => {
    if (debug) {
      delete state.arc;

      let objects = findObjs({
        _type: "character"
      }, {caseInsensitive: true});

      log(objects);
      if (objects.length > 0) {
        for (let i = 0; i < objects.length; i++) {
          objects[i].remove();
        }
      }
    }

    if (!_.has(state, "arc")) {
      state.arc = state.arc || {};
    }

    setDefaults();
  };

  const setDefaults = (reset) => {
    if (!state.arc) {
      state.arc = {};
    }

    if (!state.arc.clock) {
      state.arc.clock = _.clone(defaults.clock);
    }

    if (!state.arc.doom) {
      state.arc.doom = _.clone(defaults.doom);
    }

    let playerObjects = findObjs({ _type: "player" });
    playerObjects.forEach((player) => {
      state.arc[player.id] = state.arc[player.id] || {};
      state.arc[player.id].config = state.arc[player.id].config || _.clone(defaults.config);
    });
  };

  const registerEventHandlers = () => {
    on("chat:message", handleInput);
  };

  const sendReadyMessage = () => {
    const index = randomInt(TABLE__OMENS.length);
    const omenText = TABLE__OMENS[index];

    let img = ``;
    const omen = [
      makeHeader(`An OMEN reveals itself...`, STYLE__HEADER_DARK),
      makeSpan(omenText, STYLE__DESCRIPTION),
    ].join("");

    broadcast(makeAltContainer(STYLE__CONTENT_DARK, omen));
  };
  //#endregion API Initialization Methods

  //#region API Command Helpers
  // handle API calls
  const handleInput = (msg) => {
    if (msg.type != "api") return;

    // Split the message into command and argument(s)
    let args = msg.content.split(/ \.(help|clock|import|export|omens|config|doom|omen|reset) ?/g);
    let command = args.shift().substring(1).trim();
    let player = getObj("player", msg.playerid);

    if (command !== CONST__API) return;
    if (args.length < 1) {
      sendHelpMenu(player);
      return;
    }

    let flag = args.shift();
    let params = args.shift();

    switch (flag) {
      // update player configurations
      case "config": {
        if (params) { updateImportConfig(player, params); }
        sendImportConfigMenu(player);
        break;
      }

      // import character json
      case "import": {
        if (params) { importCharacter(player, params); }
        else { sendImportConfigMenu(player); }
        break;
      }

      // send clock menu{
      case "clock": {
        if (!playerIsGM(player.id)) {
          sendClockMenu(player);
          break;
        }

        if (params) { updateClock(player, params); }
        else { sendClockMenu(player); }
        break;
      }

      // update doomsday clock settings
      case "doom": {
        if (!playerIsGM(player.id)) { return; }

        if (params) { updateDoom(params); }
        sendClockMenu(player);
        break;
      }

      case "omen": {
        if (playerIsGM(player.id)) {
          if (msg.inlinerolls) {
            parseOmens({ roll: msg.inlinerolls[0].results.rolls[0] });
          }
          else if (parseInt(params)) {
            parseOmens({ direct: parseInt(params) });
          }
        }
        break;
      }

      // export character
      case "export": {
        if (params) { exportCharacter(player, params); }
        else { listCharactersForExport(player); }
        break;
      }

      // random omen generator
      case "omens": {
        log({ omens: "yay" });
        if (playerIsGM(player.id)) {
          log({ omens: "GM" });
          sendRandomOmen();
        }
        break;
      }

      case "reset": {
        state.arc[player.id] = {};
        setDefaults(true);
        sendImportConfigMenu(player);
        break;
      }

      case "help":
      default:
        sendHelpMenu(player);
    }
  };

  // handle API command parameters
  const handleParams = (params) => {
      let setting = params.split("|");
      let key = setting.shift();
      let value = setting.shift();

      if (value == "true") { value = true; }
      if (value == "false") { value = false; }
      value = (parseInt(value)) ? parseInt(value) : value;

      return { key: key, value: value };
  };

  // !arc .help menu
  const sendHelpMenu = (player) => {

    let apiImport = [
      `<code style="color: ${COLOR__PRIMARY_LIGHT}; font-size: 80%; padding: 0; background: none; border: none;">`,
      `!arc .import { json }`,
      `</code>`,
    ].join("");

    let help = [
      makeHeader(`ARC API Menu`, STYLE__HEADER_LIGHT),
      makeSpan(`Use the following commands, or click below:`, STYLE__DESCRIPTION),

      // !arc .help
      makeLink(COMMAND__HELP, COMMAND__HELP, STYLE__COMMAND_BUTTON),
      makeSpan(`Show this menu`, STYLE__DESCRIPTION),

      // !arc .import
      makeLink(COMMAND__IMPORT, COMMAND__IMPORT, STYLE__COMMAND_BUTTON),
      makeSpan(`Show character import config menu`, STYLE__DESCRIPTION),
      makeSpan(`Use ${apiImport} to import character sheet`, STYLE__DESCRIPTION),

      // !arc .export
      makeLink(COMMAND__EXPORT, COMMAND__EXPORT, STYLE__COMMAND_BUTTON),
      makeSpan(`Show character export config menu`, STYLE__DESCRIPTION),
    ];

    // show simple clock menu for non-GUIDES
    if (!playerIsGM(player.id)) {
      help.push(makeLink(COMMAND__CLOCK, COMMAND__CLOCK, STYLE__COMMAND_BUTTON));
      help.push(makeSpan(`Show Doomsday Clock time`, STYLE__DESCRIPTION));
      whisper(player, makeContainer(help.join("")));
      return;
  }

    help = help.join("");

    let guide = [];
    if (playerIsGM(player.id)) {
      guide = [
        makeHeader(`Guide Commands`, STYLE__HEADER_DARK),

        // !arc .clock
        makeLink(COMMAND__CLOCK, COMMAND__CLOCK, STYLE__COMMAND_BUTTON),
        makeSpan(`Show Doomsday clock config menu`, STYLE__DESCRIPTION),

        // !arc .omens
        makeLink(COMMAND__OMENS, COMMAND__OMENS, STYLE__COMMAND_BUTTON),
        makeSpan(`Generate random OMEN`, STYLE__DESCRIPTION),

      ].join("");
    }

    whisper(player, makeContainer(help, guide));
  };
  //#endregion API Command Helpers

  //#region Import API
  // player config
  const sendImportConfigMenu = (player) => {
    let config = [
      makeHeader(`Import Config Menu`, STYLE__HEADER_LIGHT),

      // Overwrite Existing Character Sheets
      makeKeyValue(
        makeSubheader(`Overwrite Existing:`, STYLE__SUBHEADER_LIGHT),
        makeLink(state.arc[player.id].config.overwrite ? "yes" : "no",
                `!arc .config overwrite|${!state.arc[player.id].config.overwrite}`,
                STYLE__CONFIG_BUTTON_LIGHT),
        STYLE__TABLE),
      makeSpan(`Overwrite character sheets with the same name`, STYLE__DESCRIPTION),

    ].join("");

    let guide = [];
    if (playerIsGM(player.id)) {

      let players = "";
      let playerObjects = findObjs({ _type: "player" });
      playerObjects.forEach((obj) => {
        players += `|${obj.get("displayname")},${obj.id}`;
      });

      let assigned = state.arc[player.id].config.journal || "none";
      if (assigned !== "none" && assigned !== "all") {
        assigned = getObj("player", assigned).get("displayname");
      }

      let controller = state.arc[player.id].config.controller || "none";
      if (controller !== "none" && controller !== "all") {
        controller = getObj("player", controller).get("displayname");
      }

      guide= [
        makeHeader(`Guide Config`, STYLE__HEADER_DARK),

        // In Players' Journals
        makeKeyValue(
          makeSubheader(`In Players' Journals:`, STYLE__SUBHEADER_DARK),
          makeLink(assigned,
                  `!arc .config journal|?{Player(s)|All Players,all${players}|None,none}`,
                  STYLE__CONFIG_BUTTON_DARK),
          STYLE__TABLE),
        makeSpan(`Set imported character sheet journal permissions`, STYLE__DESCRIPTION),

        makeHorizontalRule(),

        // Can Be Edited & Controlled By
        makeKeyValue(
          makeSubheader(`Controlled By:`, STYLE__SUBHEADER_DARK),
          makeLink(controller,
                  `!arc .config controller|?{Player(s)|All Players,all${players}|None,none}`,
                  STYLE__CONFIG_BUTTON_DARK),
          STYLE__TABLE),
        makeSpan(`Set imported character sheet controller permissions`, STYLE__DESCRIPTION),

      ].join("");
    }

    whisper(player, makeContainer(config, guide));
  };

  // update player config settings
  const updateImportConfig = (player, params) => {
    if (params.length > 0) {
      let { key, value } = handleParams(params);
      state.arc[player.id].config[key] = value;
    }
  };

  // character import / export
  const importCharacter = (player, json) => {
    let character;
    let object;

    try {
      character = JSON.parse(json);
    } catch (ex) {
      let error = "<blockquote>" + ex + "</blockquote>";
      whisper(player, error);
      return;
    }

    if (!character.name || !character.name.length ) {
      whisper(player, "Character name not defined!");
      return;
    }

    // Remove characters with the same name if overwrite is enabled.
    if (state.arc[player.id].config.overwrite) {
      let objects = findObjs({
        _type: "character",
        name: character.name
      }, {caseInsensitive: true});

      if (objects.length > 0) {
        object = objects[0];
        for (let i = 1; i < objects.length; i++) {
          objects[i].remove();
        }
      }
    }

    if (!object) {
      object = createObj("character", {
        name: character.name,
        inplayerjournals: playerIsGM(player.id) ? state.arc[player.id].config.journal : player.id,
        controlledby: playerIsGM(player.id) ? state.arc[player.id].config.controller : player.id,
      });
    }

    // create character object if it does not exist
    // and character has a name
    if (!object || (character.name && character.name.length > 0)) {
      whisper(player, `Import of ** ${character.name}** is starting...`);
    }

    if (character.notes) {
      object.set({
        gmnotes: character.notes.gmnotes,
      });
      object.set({
        bio: character.notes.bio,
      });
    }

    if (character.xp) {
      createObj("attribute", {
        name: "xp",
        current: character.xp.current,
        max: character.xp.max,
        characterid: object.id
      });
    }

    if (character.blood) {
      createObj("attribute", {
        name: "blood",
        current: character.blood.current,
        max: character.blood.max,
        characterid: object.id
      });
      createObj("attribute", {
        name: "blood_mod",
        current: character.blood.mod,
        characterid: object.id
      });
    }

    if (character.guts) {
      createObj("attribute", {
        name: "guts",
        current: character.guts.current,
        max: character.guts.max,
        characterid: object.id
      });
      createObj("attribute", {
        name: "guts_mod",
        current: character.guts.mod,
        characterid: object.id
      });
    }

    if (character.inventory_points) {
      createObj("attribute", {
        name: "inventory_points",
        current: character.inventory_points.current,
        max: character.inventory_points.max,
        characterid: object.id
      });
    }

    let attributes = {};
    let repeating_attributes = {};

    Object.assign(attributes, {
      player_name: character.player_name,
      pronouns: character.pronouns,
      sheet_type: character.sheet_type
    });

    if (character.details) {
      createObj("attribute", {
        name: "lesson",
        current: character.details.lesson,
        characterid: object.id
      });
      createObj("attribute", {
        name: "different",
        current: character.details.different,
        characterid: object.id
      });

      for (const item of character.details.rumors) {
        let guid = generateRowID();
        repeating_attributes[`repeating_rumors_${guid}_rumor`] = item;
      }
    }

    if (character.skills) { Object.assign(attributes, character.skills); }
    if (character.approaches) { Object.assign(attributes, character.approaches); }
    if (character.fallen_consequences) {
      let consequences = {};
      for (let i = 0; i < character.fallen_consequences.length; i++) {
        consequences[`fallen_consequence_${i + 1}`] = character.fallen_consequences[i];
      }

      Object.assign(attributes, consequences);
    }

    if (character.inventory) {
      for (const item of character.inventory) {
        let guid = generateRowID();
        let repStr = `repeating_inventory_${guid}`;
        Object.keys(item).forEach(field => {
          repeating_attributes[`${repStr}_${field}`] = item[field];
        });
      }
    }

    if (character.bonds) {
      for (const item of character.bonds) {
        let guid = generateRowID();
        let repStr = `repeating_bonds_${guid}`;
        repeating_attributes[`${repStr}_relationship`] = item.name;
        for (let i = 0; i < item.levels.length; i++) {
          repeating_attributes[`${repStr}_bond_level_${i + 1}`] = item.levels[i];
        }
      }
    }

    setAttrs(object.id, attributes);
    setAttrs(object.id, repeating_attributes);
    importComplete(player, object);
  };

  const importComplete = (player, character) => {
    let link = `${CONST__CHARSHEET_LINK}${character.id}`;
    let completed = makeHeader(
      makeSpan(`${makeLink(character.get("name"), link, STYLE__READY_LINK)} is ready for adventure...`),
      STYLE__HEADER_LIGHT);

    broadcast(makeContainer(completed));
  };
  //#endregion Import API

  //#region Doomsday Clock API
  // clock and doomsday settings
  const sendClockMenu = (player) => {
    let clockDisplay = [
      makeHeader(`Doomsday Clock`, STYLE__HEADER_LIGHT),
      makeMomentsText(),
      makeOmensText(),
      makeClockText(),
    ].join("");

    // allow players to invoke the clock, but only show status
    if (!playerIsGM(player.id)) {
      whisper(player, makeContainer(clockDisplay));
      return;
    }

    let clockControls = makeClockControls();

    let clockSetup = [];
    if (state.arc.clock.hideSetup) {
      clockSetup = [
        makeLink(`Show setup menu`, `!arc .clock clock|menu`, STYLE__BUTTON_BLOCK),
      ].join("");
    }
    else {
      let advancesDisplay = "SESSION";
      if (state.arc.doom.advances === CONST__THIRTY_MINUTES) { advancesDisplay = "30 MIN"; }
      if (state.arc.doom.advances === CONST__SIXTY_MINUTES) { advancesDisplay = "60 MIN"; }

      clockSetup= [
        makeHeader(`Doomsday Config`, STYLE__HEADER_DARK),

        // Moment Duration
        makeKeyValue(
          makeSubheader(`Clock Advances Every:`, STYLE__SUBHEADER_DARK),
          makeLink(advancesDisplay,
                  `!arc .doom advances|?{Clock advances every|30 MIN,${CONST__THIRTY_MINUTES}|60 MIN,${CONST__SIXTY_MINUTES}|Session,-1}`,
                  STYLE__CONFIG_BUTTON_DARK),
          STYLE__TABLE),
        makeSpan(`Set how the Doomsday Clock consumes MOMENTS`, STYLE__DESCRIPTION),

        makeHorizontalRule(),

        // MOMENTS
        makeKeyValue(
          makeSubheader(`MOMENTS:`, STYLE__SUBHEADER_DARK),
          makeLink(state.arc.doom.moments,
            `!arc .doom moments|?{MOMENTS|${state.arc.doom.moments}}`,
            STYLE__CONFIG_BUTTON_DARK),
            STYLE__TABLE),
        makeSpan(`Set number of MOMENTS until DOOM is unleashed`, STYLE__DESCRIPTION),

        makeHorizontalRule(),

        // OMENS
        makeKeyValue(
          makeSubheader(`OMENS:`, STYLE__SUBHEADER_DARK),
          makeLink(state.arc.doom.omens,
            `!arc .doom omens|?{OMENS|${state.arc.doom.omens}}`,
            STYLE__CONFIG_BUTTON_DARK),
            STYLE__TABLE),
        makeSpan(`Set starting OMENS`, STYLE__DESCRIPTION),

        makeHorizontalRule(),

        // Auto-Assign XP
        makeKeyValue(
          makeSubheader(`Auto-Assign XP:`, STYLE__SUBHEADER_DARK),
          makeLink(state.arc.doom.assignXP ? "yes" : "no",
                  `!arc .doom assignXP|${!state.arc.doom.assignXP}`,
                  STYLE__CONFIG_BUTTON_DARK),
          STYLE__TABLE),
        makeSpan(`Automatically add XP each hour, or each session for longer campaigns`, STYLE__DESCRIPTION),
        makeSpan(`3 xp each per real-time hour for 1-3 sessions`, STYLE__DESCRIPTION),
        makeSpan(`12 xp each session for longer campaigns`, STYLE__DESCRIPTION),

        makeHorizontalRule(),

        // Hide This Menu
        makeLink(`Hide this menu`, `!arc .clock clock|menu`, STYLE__BUTTON_BLOCK),

      ].join("");
    }

    whisper(player, makeContainer(clockDisplay, clockControls, clockSetup));
  };

  const makeClockText = () => {
    const paragraph = [];
    const elapsed = state.arc.clock.elapsed;
    const moments = state.arc.doom.moments;
    const consumed = state.arc.doom.consumed;
    const advances = state.arc.doom.advances;

    const msRemainingInMoment = advances - elapsed;
    const msRemainingInDoom = (advances * (moments - consumed)) - elapsed;

    const remainingInMoment = secondsToTime(msRemainingInMoment);
    const advanceAgainSentence = [
      `The clock will advance again in `,
      `${remainingInMoment.hours} hours, `,
      `${remainingInMoment.minutes} minutes, `,
      `${remainingInMoment.seconds} seconds.`,
    ].join("");

    const remainingInDoom = secondsToTime(msRemainingInDoom);
    const doomArrivesSentence = [
      `At this pace, the DOOM will arrive in less than `,
      `${remainingInDoom.hours} hours, `,
      `${remainingInDoom.minutes} minutes, `,
      `${remainingInDoom.seconds} seconds, `,
    ].join("");

    if (!state.arc.doom.advances === CONST__SESSION) {
      paragraph.push(makeSpan(advanceAgainSentence, STYLE__DESCRIPTION));
      paragraph.push(makeSpan(doomArrivesSentence, STYLE__DESCRIPTION));
    }

    const areYouAbleSentence = `<em>Will you be able to stop it in time?</em>`;
    paragraph.push(makeSpan(areYouAbleSentence, STYLE__DESCRIPTION));

    return makeDiv(paragraph.join(""), ``);
  };

  const makeClockControls = () => {
    let play = state.arc.clock.play;

    let clockStop = makeLink(`Reset`, `!arc .clock clock|stop`, STYLE__BUTTON_BLOCK);
    let clockPrev = makeLink(`Previous`, `!arc .clock clock|prev`, STYLE__BUTTON_BLOCK);

    let clockPlay = makeLink(`Play`, `!arc .clock clock|play`, STYLE__BUTTON_BLOCK);

    if (play) {
      clockPlay = makeLink(`Pause`, `!arc .clock clock|pause`, STYLE__BUTTON_BLOCK);
    }
    else if (state.arc.doom.advances === CONST__SESSION) {
      clockPlay = "";
    }

    let clockNext = makeLink(`Advance`, `!arc .clock clock|next`, STYLE__BUTTON_BLOCK);

    let controls = [
      clockPlay,
      clockNext,
      clockPrev,
      clockStop,
    ].join("");

    return controls;
  };

  // media controls for clock
  const updateClock = (player, params) => {
    if (params.length > 0) {
      let { key, value } = handleParams(params);
      if (key !== "clock") { return; }

      state.arc.clock.owner = player;

      switch (value) {

        // resume clock
        case "play": {
          if (!state.arc.clock.play) {
            state.arc.clock.play = true;
            state.arc.clock.hideSetup = true;
            Doom = setInterval(doomClock, 200);
          }
          sendClockMenu(player, true);
          break;
        }

        // pause clock, stop interval, and save segment
        case "pause": {
          if (state.arc.clock.play) {
            state.arc.clock.play = false;
            state.arc.clock.hideSetup = false;
            clearInterval(Doom);
          }
          sendClockMenu(player);
          break;
        }

        case "menu": {
          let before = state.arc.clock.hideSetup;
          let after = !before;
          state.arc.clock.hideSetup = after;
          sendClockMenu(player);
          break;
        }

        // a moment has been completed
        default: {
          consumeMoment(player, value);
        }
      }
    }
  };

  // update doomsday settings
  const updateDoom = (params) => {
    if (params.length > 0) {
      let { key, value } = handleParams(params);
      state.arc.doom[key] = value;
    }
  };

  const consumeMoment = (player, action) => {
    const actions = { next: 1, prev: -1, stop: -999 };
    if (action in actions) {
      clearInterval(Doom);

      state.arc.clock.play = false;
      state.arc.clock.elapsed = 0;
      state.arc.clock.face = "";

      // keep consumed between 0 and moments
      let change = state.arc.doom.consumed + actions[action];
      let newConsumed = maxMinValue(change, state.arc.doom.moments);
      state.arc.doom.consumed = newConsumed;

      if (state.arc.doom.consumed <= 0 || action === "prev") {
        sendClockMenu(player, true);
        return;
      }



      // the apocalypse arrives
      if (state.arc.doom.consumed >= state.arc.doom.moments) {
        heraldTheApocalypse();
      }
      else {
        const momentConsumedDisplay = makeOmenResults();
        broadcast(makeAltContainer(STYLE__CONTENT_MOMENT, momentConsumedDisplay));

        if (action === "next") {
          assignExperience();
        }

        // roll for additional OMENS
        makeOmenMenu();
      }
    }
  };

  const assignExperience = () => {
    if (!state.arc.doom.assignXP) { return; }

    const advancement = state.arc.doom.advances;
    // 30 MIN sessions update every hour
    if (advancement === CONST__THIRTY_MINUTES) {
      let consumed = state.arc.doom.consumed;
      if ((consumed / 2) % 1 !== 0) {
        return;
      }
    }

    let experienced = [
      makeHeader("Experience Awarded!", STYLE__HEADER_LIGHT),
    ];

    const xpGain = advancement === CONST__SESSION ? CONST__XP_SESSION : CONST__XP_CLOCK;
    let objects = findObjs({
      _type: "character"
    });

    _.each(objects, (char) => {
      let assign = true;
      let type = getAttrByName(char.id, "sheet_type");
      if (type === "npc") {
        assign = false;
      }

      if (assign) {
        let xp = getAttrByName(char.id, "xp") || 0;
        let xp_max = getAttrByName(char.id, "xp", "max") || 0;
        xp_max = xp_max + xpGain;

        setAttrs(char.id, { xp_max });

        let name = char.get("name");
        let xpRow = makeDiv(
          makeSpan(name, STYLE__XP_NAME)+
          makeSpan(`+${xpGain}`, STYLE__XP_GAIN),
          STYLE__TABLE);
        experienced.push(xpRow);
      }
    });

    broadcast(makeContainer(experienced.join("")));
  };

  const makeMomentsText = () => {
    let momentsRemaining = state.arc.doom.moments - state.arc.doom.consumed;
    let moments = [
      `${momentsRemaining} MOMENTS remain; `,
      `${state.arc.doom.consumed} have been consumed in total.`
    ].join("");

    return makeSpan(moments, STYLE__DESCRIPTION);
  };

  const makeOmensText = () => {
    let omensRemaining = `${state.arc.doom.omens} OMENS yet remain.`;
    return makeSpan(omensRemaining, STYLE__DESCRIPTION);
  };

  const makeOmenResults = (hasteString=``) => {

    const momentConsumedText = [
      hasteString,
      makeMomentsText(),
      makeOmensText(),
    ].join("");

    const momentConsumedDiv = makeDiv(momentConsumedText, STYLE__CONSUME_MOMENT);
    const takeHeed = makeHeader(`Take Heed! Another moment slips by.`, STYLE__LOW_HEADER_DARK);

    const omenResults = [
      momentConsumedDiv,
      takeHeed
    ].join("");

    return omenResults;
  };

  const renderDoomsdayClock = () => {
    let moments = [];
    for (let m = 1; m <= state.arc.doom.moments; m++) {
      let emoji = m <= state.arc.doom.consumed ? `💀` : `⏳`;
      moments.push(makeSpan(emoji, ""));
    }
    return makeDiv(moments.join(""), STYLE__TABLE);
  };

  const makeOmenMenu = () => {
    let consumeMoments = [
      makeHeader(`DOOM Awaits...`, STYLE__HEADER_DARK),

      // Roll for OMENS
      makeLink(`Roll OMENS`, `!arc .omen &#91;&#91;${state.arc.doom.omens}d6&#93;&#93;`, STYLE__BUTTON_BLOCK),
      makeSpan(`Roll d6 equal to the number of OMENS still in play, consuming one more MOMENT for every 5 or 6.`, STYLE__DESCRIPTION),

      makeHorizontalRule(),

      // Skip roll; manually consume additional MOMENTS
      makeLink(`Enter MOMENTS`, `!arc .omen ?{MOMENTS|${state.arc.doom.omens}}`, STYLE__BUTTON_BLOCK),
      makeSpan(`Manually enter MOMENTS to consume.`, STYLE__DESCRIPTION),

      makeHorizontalRule(),

      // Skip roll; do not consume any MOMENTS
      makeLink(`Start Doomsday Clock`, `!arc .clock clock|play`, STYLE__BUTTON_BLOCK),
      makeSpan(`The Doomsday Clock will resume without consuming OMENS.`, STYLE__DESCRIPTION),
    ].join("");

    gmWhisper(makeDarkContainer(consumeMoments));
  };

  const parseOmens = (options) => {
    let roll = options.roll || false;
    let consumed = options.direct || 0;

    if (roll && parseInt(roll.sides) === 6) {
      consumed = 0;
      let rolls = [];
      for (const res of roll.results)
      {
        let value = res.v;
        rolls.push(value);
        if (value >= 5) { consumed++; }
      }

      showOmensRoll(rolls);
    }

    let rollResults = `OMENS did not consume MOMENTS.`;
    if (consumed > 0) {
      const current = state.arc.doom.consumed;
      let newConsumed = current + consumed;
      newConsumed = maxMinValue(newConsumed, state.arc.doom.moments);
      state.arc.doom.consumed = newConsumed;

      rollResults = `Your lack of haste has consumed an additional ${consumed} MOMENTS.`;

    }

    // the apocalypse arrives
    if (state.arc.doom.consumed >= state.arc.doom.moments) {
      heraldTheApocalypse();
    }
    else {
      const lackOfHaste = makeSpan(rollResults, STYLE__DESCRIPTION);
      const omenResults = makeOmenResults(lackOfHaste);
      broadcast(makeAltContainer(STYLE__CONTENT_MOMENT, omenResults));
      sendClockMenu(state.arc.clock.owner);
    }
  };

  const showOmensRoll = (rolls) => {
    let rollArray = [];
    for (const roll of rolls) {
      let img = `<img style="${STYLE__DIE}" src="${ASSET__URL}die_${roll}.png">`;
      rollArray.push(img);
    }

    const fateStyle = `${STYLE__LOW_HEADER_DARK} position: inherit; margin-top: 5px`;
    const diceContainer = makeDiv(rollArray.join(""), ``);
    const fateHeader = makeHeader(`The bones reveal their fate.`, fateStyle);
    const omens = [
      diceContainer,
      fateHeader,
    ].join("");

    broadcast(makeAltContainer(STYLE__CONTENT_DARK, makeDiv(omens, STYLE__HEADER_DARK)));
  };

  const heraldTheApocalypse = () => {


    let herald = [
      makeDiv(
        makeSpan(`No MOMENTS remain.`, STYLE__DESCRIPTION),
        STYLE__HERALD_THE_END),
      makeHeader(`The DOOM vanquishes all.`, STYLE__LOW_HEADER_DARK),
    ].join("");

    broadcast(makeAltContainer(STYLE__CONTENT_END, herald));
  };

  const doomClock = () => {
    if (!state.arc.clock.play) { return; }

    state.arc.clock.elapsed += 200;
    if (state.arc.clock.elapsed % 1000 === 0) {
      state.arc.clock.face = secondsToTime(state.arc.clock.elapsed);

      // stop clock, advance moment
      if (state.arc.clock.elapsed >= state.arc.doom.advances) {
        consumeMoment(state.arc.clock.owner, "next");
      }
    }
  };

  const secondsToTime = (milliseconds) => {
    milliseconds = Math.max(milliseconds, 0);
    let time = parseFloat(milliseconds / 1000),
        hours = Math.floor(time / 60 / 60),
        minutes = Math.floor(time / 60) % 60,
        seconds = Math.floor((time - minutes * 60) % 60);

    return { hours, minutes, seconds };
  };

  const maxMinValue = (value, max) => {
    return Math.min(Math.max(0, value), max);
  };
  //#endregion Doomsday Clock API

  //#region Export API
  const listCharactersForExport = (player) => {
    let objects = findObjs({
      _type: "character"
    });

    let characters = [
      makeHeader(`Character Export`, STYLE__HEADER_LIGHT),
      makeSpan(`Click the icon to export to JSON`, STYLE__DESCRIPTION),
      makeSpan(`Click the character name to open the character sheet`, STYLE__DESCRIPTION),
      makeHorizontalRule(),
    ];

    _.each(objects, (char) => {
      let display = true;

      if (!playerIsGM(player.id)
          && getAttrByName(char.id, "sheet_type")  === "npc") {
        display = false;
      }

      if (display) {
        let img = `<img src="${IMAGE__DOWNLOAD}" />`;
        let exportCommand = makeLink(img, `!arc .export ${char.get("id")}|true`, STYLE__DOWNLOAD_LINK);
        let sheetLink = makeLink(char.get("name"), `${CONST__CHARSHEET_LINK}${char.get("id")}`, STYLE__CHARSHEET_LINK);
        characters.push(makeDiv(exportCommand+sheetLink, STYLE__TABLE));
      }
    });

    whisper(player, makeContainer(characters.join("")));
  };

  const exportCharacter = async function(player, options) {
    let params = options.split("|");
    let search = params.shift();
    let sendWhisper = params.shift();

    let objects = findObjs({
      _type: "character",
      name: search
    }, { caseInsensitive: true });

    objects = objects.length ? objects :
      findObjs({
        _type: "character",
        _id: search
      });

    const promArr = [];
    if (objects.length) {
      let obj = objects[0];
      let attributes = exportAttributes(obj);
      attributes.push({ name: "name", current: obj.get("name"), max: "" });

      let bio = await new Promise((resolve, reject) => {
        obj.get("bio", resolve);
      });

      attributes.push({ name: "bio", current: bio, max: "" });

      let gmnotes = await new Promise((resolve, reject) => {
        obj.get("gmnotes", resolve);
      });

      attributes.push({ name: "gmnotes", current: gmnotes, max: "" });

      let exp = formatCharacterJSON(attributes);
      let json = JSON.stringify(exp);

      setAttrs(obj.id, { export: json, export_show: "on" });

      let jsonExport = [
        makeHeader(obj.get("name"), STYLE__HEADER_LIGHT),
        makeSpan(`The JSON below can be used with the ARC Discord Bot, as well as other Roll20 games`, STYLE__DESCRIPTION),
        makeSpan(json, STYLE__MONOSPACE),
      ].join("");
      whisper(player, makeContainer(jsonExport));
    }
  };

  const formatCharacterJSON = (array) => {
    let exp = {
      notes: {},
      details: { rumors: [] },
      blood: {},
      guts: {},
      approaches: {},
      skills: {},
      inventory: [],
      fallen_consequences: [ 0, 0, 0, 0, 0, 0],
      bonds: []
    };

    let regex = new RegExp(/-[A-Za-z0-9]+-?_/);
    let inventory = {};
    let bonds = {};

    _.each(array, (obj) => {
      switch(obj.name) {
        case "sheet_type":
        case "name":
        case "player_name":
        case "pronouns":
        case "version": {
          exp[obj.name] = obj.current;
          break;
        }

        case "bio":
        case "gmnotes": {
          exp.notes[obj.name] = obj.current;
          break;
        }

        case "lesson":
        case "different": {
          exp.details[obj.name] = obj.current;
          break;
        }

        case "xp":
        case "inventory_points": {
          exp[obj.name] = { current: obj.current, max: obj.max };
          break;
        }

        case "blood":
        case "guts": {
          exp[obj.name].current = obj.current;
          exp[obj.name].max = obj.max;
          break;
        }

        case "blood_mod":
        case "guts_mod": {
          let key = obj.name.substring(0, obj.name.lastIndexOf("_"));
          exp[key].mod = obj.current;
          break;
        }

        case "creative":
        case "careful":
        case "concerted": {
          exp.approaches[obj.name] = obj.current;
          break;
        }

        case "academic":
        case "culture":
        case "observe":
        case "tactics":
        case "charisma":
        case "guile":
        case "impose":
        case "insight":
        case "acrobatics":
        case "coordination":
        case "physique":
        case "weaponry":
        case "artistry":
        case "survival":
        case "tinker":
        case "trade":
        case "arcana":
        case "focus": {
          exp.skills[obj.name] = obj.current;
          break;
        }

        case "fallen_consequence_1":
        case "fallen_consequence_2":
        case "fallen_consequence_3":
        case "fallen_consequence_4":
        case "fallen_consequence_5":
        case "fallen_consequence_6": {
          let index = parseInt(obj.name.slice(-1)) || -1;
          if (1 <= index && index <= 6) {
            exp.fallen_consequences[index - 1] = obj.current;
          }
          break;
        }
      }

      // handle repeating fieldsets
      if (obj.name.indexOf("repeating") == 0) {

        let fieldset = obj.name.substring(10);
        fieldset = fieldset.substring(0, fieldset.indexOf("_"));

        let key = regex.exec(obj.name)[0].substring(1).slice(0, -1);

        let field = obj.name.substring(obj.name.lastIndexOf(key) + key.length + 1);

        switch (fieldset) {
          case "inventory": {
            inventory[key] = inventory[key] || {};
            inventory[key][field] = obj.current;
            break;
          }
          case "bonds": {
            bonds[key] = bonds[key] || {};
            bonds[key].levels = bonds[key].levels || [0, 0, 0];
            if (field === "relationship") { bonds[key].name = obj.current; }
            else if (field.indexOf("bond") === 0) {
              let level = field.slice(-1);
              bonds[key].levels[level -1 ] = obj.current;
            }
            break;
          }
          case "rumors": {
            exp.details.rumors.push(obj.current);
            break;
          }
        }
      }
    });

    for (let key in bonds) {
      exp.bonds.push(bonds[key]);
    }
    for (let key in inventory) {
      exp.inventory.push(inventory[key]);
    }

    return exp;
  };

  const exportAttributes = (character) => {
    let attributes = findObjs({ _type: "attribute", _characterid: character.id });
    let exported = [];
    for (let i = 0; i < attributes.length; i++) {
        let attr = {};
        let fields = [ "name", "current", "max" ];
        _.each(fields, (f) => {
          let v = attributes[i].get(f);
          attr[f] = v;
        });

        exported.push(attr);
    }

    return exported;
  };

  const generateUUID = (() => {
    let a = 0;
    let b = [];

    return () => {
      let c = (new Date()).getTime() + 0;
      let f = 7;
      let e = new Array(8);
      let d = c === a;
      a = c;
      for (; 0 <= f; f--) {
        e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
        c = Math.floor(c / 64);
      }
      c = e.join("");
      if (d) {
        for (f = 11; 0 <= f && 63 === b[f]; f--) {
          b[f] = 0;
        }
        b[f]++;
      } else {
        for (f = 0; 12 > f; f++) {
          b[f] = Math.floor(64 * Math.random());
        }
      }
      for (f = 0; 12 > f; f++){
        c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
      }
      return c;
    };
  })();

  const generateRowID = () => generateUUID().replace(/_/g, "Z");
  //#endregion Export API

  //#region Omens API
  const TABLE__OMENS = [
    `A sword made of teeth was discovered by the archaeologists of Zem.`,
    `A young princess discovers, to her chagrin, that her shadow has its own personality.`,
    `The Shadow Book has disappeared from the Diliman Academy.`,
    `The beautiful Epefania is infinitely heartbroken.`,
    `The dying prince decides to pursue their final ambitions, to disastrous results.`,
    `An elderly woman transforms into a mermaid.`,
    `The Council of Barons grow stonehearted, and begin excluding the King from their decisions.`,
    `A dark spell is stolen from the breath of a dying witch.`,
    `The lovable next-door neighbor discovers that his dragonrider sister is very much alive.`,
    `A once-hopeful noblewoman murders the local ingenue, jealous of her success.`,
    `The Damned Gates of Moroa were inadvertently unburied by a landslide.`,
    `The cold winds of winter has arrived - but it's only spring.`,
    `A popular leader is kidnapped by desperate bandits.`,
    `An alchemist discovers what caused the birth of the world.`,
    `A magnificent ship has sailed into harbor, containing spies from an enemy kingdom.`,
    `A heroine is in denial about the truth of her quest.`,
    `The practice of magic is banned throughout the kingdom.`,
    `False gossip massively erodes faith in the struggling village union.`,
    `A misguided promise sends a faithful knight on a quest to destroy evildoers.`,
    `The real hero can't find their way back home.`,
    `A luminous crystal orb is found beneath a sprawling, ancient ruin.`,
    `A desperate mother plants a seed that grows into a mango tree bearing the face of her daughters.`,
    `The husband of a beloved leader disappears, replaced instead by a cunning changeling.`,
    `The alphabet has turned to dust.`,
    `A large, automaton ziggurat has gained sentience and is slowly making its way to the home town.`,
    `The Pampangueno labyrinth finally unlocks its entrance after decades of being sealed.`,
    `A restless sorcerer creates an evil clone for companionship.`,
    `The babaylan cannot sleep.`,
    `The Count of Iligan sentences the universe to death.`,
    `An unsolvable riddle drives a local priest to obsession.`,
    `A beautiful mermaid wakes up with no memories of the sea.`,
    `The innocent villagers stumble upon a deadly fungus that corrups their identity.`,
    `An ambitious noble is adamant on recovering treasure, as discovered from a secret scroll.`,
    `Vicious, brainless parasites have established colonies in the underground sewers of the kingdom.`,
    `The royal assassin is fleeing with deadly secrets that can undermine the entire kingdom.`,
    `An ancient god has awoken and is hungry for sustenance and worship.`,
    `A heartbroken woman prays for the wind to assail the village of the man who spurned her.`,
    `The heirloom of a poor baker has gone missing.`,
    `More and more brigands have started terrorizing wayfarers.`,
    `A well-meaning changeling steals the faces of people they admire.`,
    `An outbreak of disease has made it impossible for victims to tell the truth.`,
    `A local tournament turns out to be recruitment grounds into a nefarious cult.`,
    `A prophet-in-training decides to revive a slumbering god to bring about a new utopia.`,
    `The Seer of Quezon has obtained their 17th brain.`,
    `Gargantuan crabs begin their westward migration seeking a new master.`,
    `A nihilistic teacher marries the ocean.`,
    `A bureaucratic meeting begins, but has no intention of stopping.`,
    `Every individual of working age is conscripted into an unknown war by a power-hungry duchess.`,
    `A formerly-idealistic community leader learns the futility of class struggle.`,
    `A queen turns into an octopus.`,
    `The heart of an ancient prophet transforms into a black mango that whispers evil secrets.`,
    `A 4th century Srivijaya prophecy comes true on Tuesday.`,
    `A lonely duke weeps rivers of tears and begins to drown.`,
    `Misguided youths steal the Darkling's Prayer.`,
    `A secret society of literary critics begin burning books.`,
    `A retired adventurer reads a story about their future death, and is desperate to find any way of stopping it.`,
    `A waterfall grows from a corrupted seed.`,
    `An ill-devised play sparks revolution among the misguided townsfolk.`,
    `The sea serpent turns out to be the secret form of a schoolteacher in love.`,
    `Every day, a child goes missing.`,
    `The only secretkeeper is poisoned by a jealous lover, slowly turning him into stone.`,
    `Disturbing dreams begin controlling elderly villagers.`,
    `A bright light shines over the coast, turning night into daytime.`,
    `Croissants are falling from the sky.`,
    `A neighbor discovers their turtle is the reincarnation of a long-lost god.`,
    `The crocodile chieftains are coming to collect their dues again.`,
    `A penniless emperor falls dead from bad eggs.`,
    `A beautiful nun devises a cunning plan to assassinate the chief bishop.`,
    `A Mandaleno priestess sets fire to the cathedral.`,
    `A pauper switches body with a prince.`,
    `The red comet arrives once more.`,
    `A secret portal opens within the heart of a yew tree.`,
    `A girl prodigy discovers the secret powering the immortal lives of the elves.`,
    `A fractal book containing the universe within is ripped in half.`,
    `The princess has two years left to live.`,
    `Chickens across the kingdom begin laying eggs made out of music.`,
    `Every artist turns to dust.`,
    `Clouds form the shape of a clock ticking to midnight.`,
    `A contradictory prophecy is uttered by the Lord of the Manor and plunges the town into a state of disaray.`,
    `A large eye peeks from the hole n the sky.`,
    `A collective of disembodied spirits grow dissatisfied with eternal life and possess travellers.`,
    `The capybara holds a sword for the first time.`,
    `Seven eclipses portend the arrival of a divine creature.`,
    `A lake dries up, revealing the dead city below.`,
    `The traveller came home from their five year exile, the villagers wondered if the anger still burnt within.`,
    `The first knight will be beheaded by the next new moon.`,
    `The second knight rejoiced.`,
    `A strange new flower blooms, spreading its noxious pollen in the woods.`,
    `The wind is blowing the leaves in counter-clockwise whirls, signalling a time of strange magic and witchcraft.`,
    `The forbidden pepper tempts the holy man into sin.`,
    `The death of the king sparks a year-long war to install a child as the ruler.`,
    `Lady Berenice becomes a vampire again.`,
    `Noblins have tunneled their way into an underground kingdom made of gold.`,
    `The road begins to extract tolls from travelers; no one reaches their destination quite as they left, and some never arrive at all.`,
    `Faerie fires lure people into the hills, away from the trodden path.`,
    `The princeling is seduced by money witches.`,
    `The archmage's spell album is corrupted by time.`,
    `A contagious virus turns creatures into sparrows.`,
    `Voidborn tikbalangs begin to aggressively expand their territories.`,
    `Hands begin growing more hands.`,
    `An angel falls to the world and angrily insists everyone is a demon.`,
    `The Archbishop sits on the King's throne.`,
    `A man is found in disarray, confused and claming his dreams took people away.`,
    `The lady of the lake is angry for her armor no longer fits.`,
    `The cypresses shake and sob during the night.`,
    `The apple orchards gleam, heralding a glorious harvest for the coronation feast... but inside, the villagers find only ember and ash.`,
    `Two high clerics speak with the voice of the same god, their messages contradictory.`,
    `Fathers cannot uncurl their index fingers.`,
    `Fresh-gathered honey turns into bitter vinegar.`,
    `The wind carries a cry of help from nowhere.`,
    `Books in libraries scramble their words.`,
    `All fruits wilt and wither as soon as they are plucked from the stem.`,
    `The village crops wither, yielding only black, shriveled fruit.`,
    `The children float to the sky, as if rejected by the earth.`,
    `Every night as the bell strikes, the earth quakes.`,
    `A sorcerer attempts to bottle the shadow of the forgotten hero's last son.`,
    `The chosen one is mortally wounded, just as she was supposed to fulfill the prophecy.`,
    `The Hanged Man walks the crossroads, searching for the fools they once knew.`,
    `It is time to trade cups for swords, and coins for rods.`,
    `The Rook Queen searches for carrion on the wind.`,
    `The child of pearl leaves the oceans for the final time.`,
    `The volcano starts freezing over.`,
    `Death's grip has faltered.`,
    `The Gate of Worms is unlocked.`,
    `The people have begun to forget.`,
    `Gold turns to salt, gems to teeth.`,
    `Nobody can utter their fears anymore.`,
    `The forest is still and deafeningly silent - the animals within no longer exhale breath.`,
    `The last Speaker's days are numbered.`,
    `A blue flower grows over the dead mage's heart.`,
    `The seventh sister's star is missing from the sky.`,
    `The moon has been eaten, but nobody knows why.`,
    `All cats of the village stare at the ground, as if looking below. `,
    `The witch's coven flies over the blood moon every night.`,
    `The red of sunset will not leave the horizon.`,
    `The obelisks of the great temple, which recite the story of creation, have all shattered.`,
    `Belly button innies are now outies. Outies are now innies. `,
    `The dead heart of an ancient whale washes ashore.`,
    `The farmers wake to see plows become swords, each stalk of grain a spearhead.`,
    `Every mammal in the kingdom grows a moustache; those who had before now have bushier, scruffier ones.`,
    `A lonely duke weeps rivers of class struggle.`,
    `The careworn traveller comes home, bearing a false plague.`,
    `The Council of Barons grow stonehearted, and impose a seven-year exile on all weak and feeble.`,
    `The dead heart of an ancient prophet transforms into a nefarious cult focus.`,
    `A strange new flower blooms, spreading pollen in the kingdom that lay eggs made out of music.`,
    `The heirloom of a dying witch inadvertently makes its way to an innocent maiden.`,
    `An ancient god has awoken and is desperate to find any way of stopping it.`,
    `A queen emerges from an underground kingdom made of teeth, uncovered by the earth.`,
    `A retired adventurer reads a story about their future death, and wishes to prevent it at all costs.`,
    `The child of pearl leaves the oceans for the fools they once knew.`,
    `Faerie fires lure people into the hills, directly beneath the hole in the sky.`,
    `The death of the kingdom.`,
    `The witch's coven flies over the coast, turning night into daytime.`,
    `All cats of the kingdom gather at the village center.`,
    `The heart of an ancient prophet transforms into a black mango and whispers evil secrets.`,
    `A neighbor discovers their turtle is the reincarnation of a beloved leader.`,
    `All gold turns to dust.`,
    `A contradictory prophecy is uttered by the Lord of Swords, sparking a year-long war.`,
    `The Hanged Man walks the crossroads, searching for the wind to bring him home.`,
    `Every mammal in the woods is no longer a mammal.`,
    `A queen turns into bitter vinegar.`,
    `A sword made of gold is sent as a dangerous gift.`,
    `Croissants are falling from the Diliman Academy.`,
    `The husband of a divine creature begins a divorce.`,
    `Two high clerics speak with the voice of the goddess who spurned them.`,
    `Every day, a different child finds themself the ruler.`,
    `The children float to the home town.`,
    `A heartbroken woman prays for the final time.`,
    `A sorcerer attempts to bottle the shadow of the man who spurned her.`,
    `The first knight will be beheaded by the Whisperer in the Woods.`,
    `Noblins have tunneled their way to a profane shrine.`,
    `The dead heart of a long-lost god is consumed by an ambitious archmage.`,
    `The obelisks begin whispering the name of the forgotten hero's only son.`,
    `A fractal book contains the secret to the death of the universe.`,
    `The capybara holds a sword for the coronation feast... but inside, the villagers find only ember and ash.`,
    `A blue flower envelops the blood moon every night.`,
    `All musicians have forgotten their songs; the dancers their steps, the singers their words.`,
    `The bears are angry.`,
    `An elderly woman transforms into a mango tree bearing the face of her daughters.`,
    `A local tournament turns out to be the secret powering the immortal lives of the elves.`,
    `The king attempts to trap the wizard of the tower by stealing their name.`,
    `A heartbroken woman prays for the fools they once knew.`,
    `Croissants are falling from the hole in the sky.`,
    `A bright light shines over the dead city below.`,
    `The death of the sea.`,
    `The Damned Gates of Moroa were inadvertently unburied by a jealous lover, slowly turning him into stone.`,
    `The real hero can't find their way into an octopus.`,
    `Vicious, brainless parasites have established colonies in the kingdom and begin laying eggs made out of memories.`,
    `Everyone's left eye grows larger by two inches.`,
    `A Mandaleno priestess sets fire to the world and angrily insists everyone is a demon.`,
    `Everyone's secret thoughts are spread by the careless wind.`,
    `The villagers stumble upon a buried portal containing potent yet unpredictable sources of arcana.`,
    `Rebellious priests steal the blood of the Seven-Faced Traveller.`,
    `A winged spirit falls dead from the sky, bearing blue tattoos that predict the townsfolks' deaths.`,
    `A magnificent ship is devoured by a blind kraken, its divine contents lost to the sea.`,
    `Music is now outlawed in the kingdom.`,
    `A formerly-idealistic community leader disappears, replaced instead by a willow clock.`,
    `A penniless emperor falls to obsession and hungers for power once more.`,
    `A girl becomes teeth.`,
    `Bloodborn warlocks gather to sing the song of their patrons.`,
    `Every night, a strange girl appears in the same spot - and she always return there when dusk falls.`,
    `The blacksmith turns to vampirism to power their craft.`,
    `The queen is desperate to forget.`,
    `The farmers wake to dust on the fields.`,
    `The Onyx Book arrives, written by the dead interned beneath the cathedral.`,
    `The neigboring kingdom wages war on behalf of unseen spirits.`,
    `The dead return to life, adamant that they are alive and everyone else has died.`,
    `The Seer of Disease is wasting away to an unknown illness.`,
    `More and more are drowning.`,
    `The lovable next-door neighbor discovers their true identity.`,
    `A dark knight made out of the nightsky appears and demands tribute.`,
    `A restless sorcerer attempts to recreate her last happy moment.`,
    `The Winterspirits have been captured by an enemy kingdom.`,
    `A na‹ve priestess accidentally steals the sky again,`,
    `An unsolvable riddle unlocks the scroll to save the world.`,
    `Chickens travel across time.`,
    `The Rook Queen searches for the shape of creation, finds it, and uses it to alter the world.`,
    `The wind is angry, for the universe no longer fits.`,
    `Azula the Melancholy utters the secret, seventh word of creation.`,
    `The book containing all spies' names are stolen by the enemy kingdom.`,
    `The Duchess of Red imposes steep taxes to fund a stronger army.`,
    `The dead king returns to life.`,
    `A child is born inside a poisonous flower.`,
    `The young noblin prays to a long-lost god at midnight.`,
    `The old sage takes out a sword made out of cutting words, wondering who can inherit it.`,
    `A dark spell is corrupted by time.`,
    `The artefact of doompause is missing from the Whisperer's vault; her mind confused and in disarray.`,
    `Something lies beneath in the hills, something is shifting the earth.`,
    `All music is heartbroken.`,
    `Every day, a firstborn child grows five years older.`,
    `A once-hopeful noblewoman murders the misguided townsfolk.`,
    `A young princess is seduced by a power-hungry duchess.`,
    `The death of a god.`,
    `A celestial visits the kingdom, disguised as a pauper.`,
    `Clouds gather, form the shape of the queen's missing daughter.`,
    `A sorcerer attempts to save the world.`,
    `All food taste like ember and ash.`,
    `A nefarious charlatan decides to marry the ocean to learn her dark secrets.`,
    `The royal assassin is found dead, eviscerated clinically in the town center.`,
    `A magnificent ship has gone missing.`,
    `The water has gone from the nearby lake.`,
    `The crocodile chieftains drown again and again, as if stuck on a time loop.`,
    `The slumbering god turns over.`,
    `The last person to learn the King's  secret is killed in a bizarre accident.`,
    `The bones are alive.`,
    `The gates out of the kingdom are sealed; nobody can leave, and nobody knows why.`,
    `The children have forgotten how to laugh.`,
    `The plants no longer grow towards the sun, but towards some other arcane location.`,
    `The buzzing of insects begin calling the names of the recently departed.`,
    `Everyone's eyes turn a strange, brilliant purple.`,
    `The moon has sprouted a face and is looming ever closer.`,
    `Black water bubbles from the cracks in the ground.`,
    `The celestial bodies have ceased its usual paths in the sky, deigning to revolve around a singular eye that grows larger by the hour. `,
    `The sky's eye is oddly located at your zenith everywhere you go, as if following you.`,
    `A second moon has appeared in the sky, visible only to those in the Capital.`,
    `The course of the river has reversed and now flows upward.`,
    `The husband of the singers reveal the dread sources of their craft.`,
    `A contradictory prophet is hungry for carrion.`,
    `Every day, a gargantuan spear reveals ever more of itself from beneath the soil.`,
    `The dragonrider guardian is fatally wounded, and their dragon steed is on the verge of a rampage.`,
    `Every time the bell strikes, the innocent youth is turned to sin.`,
    `The village center is no longer in the center.`,
    `Everyone's darkest secrets are powering the truth of a divince creature.`,
    `The long-defeated lich is very much alive.`,
    `The village of unseen spirits begins to expand slowly across the land.`,
    `A desolate weaver writes the secret of their lovers on the hem of the royals' clothes.`,
    `The princess admires a disgraced witch; blind adoration leads them to danger.`,
    `The moon is upside-down every night.`,
    `The sea serpent is beheaded by an ancient prophet; inadvertently unleashing black bile upon the ocean.`,
    `The careworn traveller comes home, bearing a seven-year sin.`,
    `The dead come back for the final time.`,
    `Dwarves uncover a sapphire containing the last truth of the world's creation.`,
    `A sorcerer attempts to alter the careless wind.`,
    `The captain of the guard discovers the mayor's state of undeath, and the sin that powers it.`,
    `A secret portal opens within the city and leads to a well filled with children.`,
    `An audacious thief steals the Kingdom of Creation.`,
    `Two secret lovers carve their names on the skull of a prophet; their lives now intertwined forever, for better or worse.`,
    `A horse is elected the bishop of a religion.`,
    `The chosen one is unchosen.`,
    `The night never ends; the midnight passes and becomes thirteen o'clock.`,
    `The women weave all day, but at night all their work is undone.`,
    `A riot breaks out in a mill, inadvertently releasing poisonous substances into a nearby river.`,
    `A queen emerges, undead, from within a blackened mirror.`,
    `The Rook Prince searches for the wind to bring him home.`,
    `The neighboring Capital has sunk to the Earth, but the denizens' bodies are missing.`,
    `An elderly woman prays for good peace and health; the wrong god listens.`,
    `Noblins have scruffy moustaches now.`,
    `The night wyrm draws ever closer.`,
    `Sacrificing life for a life, a determined heroine decides to offer her soul in return for the resurrection of the Goblin Queen.`,
    `Every night, a vampire is born.`,
    `An altruistic dragon decides to murder all evildoers.`,
    `A memory of a quiet woman standing alone on a beach begins to take hold inside everyone's memories.`,
    `The celestial bodies established secret colonies of love.`,
    `Gold turns creatures into sparrows.`,
    `A heroic knight discovers they are made of tears.`,
    `The king returns to forget.`,
    `An unexplained outbreak of anger, misguided woe and worship, among the mages from the Academy.`,
    `A lost god finds themselves back hoe.`,
    `Strange moss grow all over the kingdom, bearing tiny flowers that smell of ambrosia.`,
    `A long-missing noble child returns but claims no knowledge of their previous life.`,
    `The long-dead lich has a daughter.`,
    `Unseen, the shattered crown reformed.`,
    `The riverfish have bones of coral, their scales shining as bright as copper.`,
    `The dew shone in the dawn—then they realized it was glass, covering the glass, the leaves, the roofs`,
    `The dead return for companionship.`,
    `All villagers age twenty years.`,
    `Every day, a black bile emerges from the mouth of a sprawling, ancient corpse-statue.`,
    `A lake holds an eternal flame within.`,
    `A tournament is held to seek the next bride of the two-faced blood moon.`,
    `The farmers uncover ancient bones underneath the fields.`,
    `The birds have all drowned at sea.`,
    `All bodies of water reveal shadowy figures, holding swords tipped with blood.`,
    `The color goes out of the world.`,
    `A sign appears in the sky: "The reset will begin shortly".`,
    `The birds fell from the sky, still singing.`,
    `A false light shines over the heroes' home town.`,
    `A foreign kingdom wages war because of the unspeakable five-year sin.`,
    `The heart of the wizard grows larger day by day; the heart is still within their body.`,
    `Joyful music lures people into a hidden, ancient corpse-statue.`,
    `The Queen of Sheperds turns into a pillar of salt, but each grain bears her voice and personality.`,
    `A bizarre accident involving the cook, the drunkard, and a goose keep happening at 5 PM on the dot.`,
    `The king's crown turns out to be a lonely mimic.`,
    `A treasure chest contains the last fragment of witchcraft.`,
    `A clueless but charismatic student is deftly positioned to become the ash cult's next leader.`,
    `The dying king entrusts his throne to his pet yak.`,
    `The wind begins to take hold of everyone's memories, and scatters them throughout the kingdom.`,
    `The farmers uncover a hidden complex filled with their exact same clones.`,
    `The earth shakes: the bones beneath the world are coming back to life.`,
    `Bellybuttons are plucked from nowhere.`,
    `The mages leave the final kingdom, heading West towards shores unknown.`,
    `Ivory statues begin appearing throughout town, each carrying a blade marked with a villager's name.`,
    `The shattered crown reforms.`,
    `The heirloom of tears uses her final breath at the river to draw out a secret to save her sister.`,
    `The name of the demon goddess is uttered by the man who spurned her.`,
    `A driven warrior decides to alter the shape of the world towards violence.`,
    `A god is reincarnated according to plan - but they revive with a hole where their heart was.`,
    `A child learns the act of Creation.`,
    `Someone has stolen the dawn; in a neighboring kingdom, the early morning never ends.`,
    `A beloved leader disappears, replaced instead by their homonculus.`,
    `The sentient artefact of pearl leaves the academy to become a hero.`,
    `The Pale Lord holds a feast for unseen nobilis.`,
    `Lady Eufrancia becomes thirteen o'clock.`,
    `Pale, seven-petaled roses envelop fools who have fallen in love.`,
    `The shape of the only thing he ever loved disappears forever from the world.`,
    `The first knight realizes the truth of battle; disillusioned, he refuses to take up the blade again.`,
    `The road is dangerous and filled with murderous frogs.`,
    `A girl becomes a vampire next Monday.`,
    `The coin lords buzz with excitement: the value of cryptic gold has tripled yet again.`,
    `A rebellious ratcatcher accidentally steals a dread book of secrets, and is hunted down by a faceless bounty hunter.`,
    `Coconut crabs no longer like coconuts.`,
    `The witch's coven flies over the reincarnation of a pauper.`,
    `A dark spellbook is upside-down every night.`,
    `The dead return for the truth.`,
    `A heartbroken woman transforms into a clock ticking to murder all day.`,
    `The world tree sprouts, twisted, inside an abandoned silo.`,
    `A Tawo grand mother discover the flute that plays time.`,
    `The rivers are tainted with blood.`,
    `Animals stand still as time, their faces immobilized with hunger.`,
    `Lizardfolk warlocks gather to pray in desperation.`,
    `Barely-buried corpses havev started terrorizing wayfarers carrying gold.`,
    `A contagious virus turns townsfolks weak but the Galecian army even stronger.`,
    `The Mirror Rook returns to this world after her seven-year exile, curious yet lonely.`,
    `To everyone's chagrin, the lady of tears angrily insists that everyone else has gone missing.`,
    `The people vote for the bishop to leave the dead city alone.`,
    `The Summoner's Guild miraculously obtains a skeleton key unlocking the portal to yesterday.`,
    `A lonely sun goddess decides nobody can ever leave.`,
    `A giant washes ashore, completely naked; a small forest of glowing lichens flourishing atop their skin.`,
    `The jester locks away their infinite sadness and buries it underground; the next day, an ominous tree grows atop it.`,
    `The children uncover a god with an infinitely broken heart.`,
    `The princeling is sold for half the gold his father was expecting.`,
    `A local actress travels slowly across time, looking for her lost lover.`,
    `A kingdom wages war on the futility of resurrection; all who've come back from the dead are afraid for their lives.`,
    `An ambitious noble child is devoured by their homonculus.`,
    `Every animal in the sky pauses implausibly mid-flight, hanging over the earth like strange holiday ornaments.`,
    `Unseen creatures beneath the kingdom gather to follow the heroes' footsteps; as if following them.`,
    `The statue of the First Rebel springs to life and declares revolution once more.`,
    `An unexplained landslide uncovers part of a broken temple; inside are peaceful-looking priests sleeping atop blooming flowers.`,
    `The birds have all shattered.`,
    `The Council of Barons grow stonehearted, and begin laying eggs made out of memories.`,
    `The moon has sprouted a face and is slowly making its way to an innocent maiden.`,
    `The Archbishop sits on the hem of a god.`,
    `The unloved knight begs everyone to believe when he says that a secret war is killing the townsfolk.`,
    `Brainless parasites infect townsfolks; themselves grow a brain.`,
    `The shadow of the demon goddess secedes and decides to become a human.`,
    `A large moon appears and floats underwater; solid, undeniable, an exact mirror of the one above except beneath the roiling waves.`,
    `A giant snake emerges from the ocean and drinks it dry.`,
    `A washed-out villain appears for the final time and pleads mercy from the heroes: their eyes, bloodhost; their arms, laced with strange wounds.`,
    `A rider all in black shoots the sun with a poison-tipped arrow.`,
    `The villagers heap kindling and wood, but despite their best efforts all fire no longer provide warmth; only despair.`,
    `A prophet-in-training decides to marry the lake to steal the King's throne.`,
    `The capybara holds a feast for unseen nobilis.`,
    `The blades worn by the Kingsguard have all mysteriously disappeared, replaced only by flowers.`,
    `The trees whistle, but no wind blows; the shake and shiver as if in fear of something approaching.`,
    `At midnight, all bells begin tolling wildly. A minute passes. Then a deafening crack, then silence; the bells now forever quiet.`,
    `All glass become flowing water, set frozen in the same shape yet slightly warm to the touch.`,
    `A lost wayfarer prays for the universe to cease its breathing.`,
    `A small hole appears over the heart of every townsfolk; in days, it grows, and while they still walk and talk as normal, their personalities have subtly change.`,
    `A tournament is held to decide what tomorrow means.`,
    `A spear made of ebony and tears emerges from the world tree.`,
    `A prophet decides to murder all day.`,
    `Undersea serpents pulse light in unison beneath the currents, moan a strange unearthly sound.`,
    `Small eyes appear on the soil.`,
    `It turns out that the witch was behind it all along: from the creation of the kingdom to its many travails, and now she speaks one word: "Begone".`,
    `The cult of the Red-faced Warrior kidnap black cats for unknown reasons.`,
    `The memories of a god is instilled on a ten-year old's mind.`,
    `The river has died, and with its departure so does the spirit who lived within.`,
    `The millenium actress travels across the land and leaves chaos in her wake.`,
    `The underground kingdom is filled with happy smiles yet dead eyes.`,
    `The seer loses her face, which a sheepherder later finds among his flock.`,
    `The Lady of the Mist wakes up with no memories of the man who spurned her.`,
    `A father mourns his children lost to war, but learns of a magic egg that can grow new sons.`,
    `The scion of the richest family pleads mercy from the nearby lake; the lake listens and brings their wish to life.`,
    `A turtle queen has stolen away with the prince.`,
    `All rain fall upwards. The plants are so, so thirsty?`,
    `The princeling is seduced by a jealous lover, who only seeks his warmth to sustain their unlife.`,
    `The kingdom's knight finds a mossy well filled with their exact same clones.`,
    `The great librarian's body begins to be covered by moss, slowly growing and covering their mouth and eyes.`,
    `Only the creatures of the woods see the pale children who slowly walk towards the kingdom.`,
    `The Kingsguard writes a book with his tears that reveals the worst crimes of the King he loves and serves.`,
    `Our ancestor spirits gather at dusk to pray at the town's edge, but they do not speak why.`,
    `A feast of coconuts gloriously emerge all day throughout town; while it is undeniably delicious, nobody knows where it comes from.`,
    `The villain of the last chapter wakes up to memories of being sealed, but no memories why they deserved it.`,
    `The speaker of the glass turns into a snake, lovingly bites her faithful followers; the next day, they smile with secret knowledge.`,
    `An unexplained outbreak of quiet, angry women.`,
    `The bones beneath the Lady's crypt begin to sob in the night.`,
    `The last vampire decides they don't want to be the last anymore.`,
    `The sun is cold and makes strange whispers throughout the day.`,
    `The valiant warrior disappears and is replaced by a broken husk claiming to be them.`,
    `The husband of the wind visits town to find a gift for his wife, but has a dangerous idea in mind.`,
    `A heavy, ominous handmirror reveals the same people's reflections, but blue and gaunt.`,
    `Newborns have inexplicably begun speaking the language of animals.`,
    `The turtle king has stolen away not just the princess herself, but her name and memories; only one glass shoe remains.`,
    `Mondays are now Thursdays.`,
    `The once-familiar landscape grows stranger, feels odd, as if it's become a husk of itself overnight.`,
    `An iron ship with tattered sails crosses an icy, moonlit night.`,
    `In the distance, a tower looms. It was not there yesterday.`,
    `All the pretty flowers seem to be eating all the pretty children.`,
    `A strange figure watches you from the ridge, immobile, never hungry or thirsty, and completely unnoticed by others.`,
    `There is the taste of salt, the fresh breeze from the sea, a gentle tinkling of ship's bells—though you're thousands and thousands of miles away from the sea.`,
    `A pair of stone hands emerge from the sands; the same day, people begin losing sensation in theirs.`,
    `A lost people now resurfaces, their eyes weary, bearing news of what ended their exile.`,
    `One fateful night, the stars—no, the firmanent itself—invert; stars north of the ecliptic are now south and vice versa, and the sun begins to rise over the West.`,
    `It's raining men.`,
    `All roads turn to crystalline salt, bearing strange spiral etchings... `,
    `A longboat made from the nails of the dead sails through a tempest.`,
    `All steel begin to emit sound, like a gentle hissing, like oil on a pan.`,
    `All cats, two faces.`,
    `The Lady of the Rook searches for her husband one final time.`,
    `A retired adventurer is hunted down by a power-hungry duchess.`,
    `The third wife of the Goblin Queen becomes enamored with the idea of capitalism.`,
    `The nearby kingdom decides unanimously to embrace murderous frogs as new citizens.`,
    `The old sage buries the secret to save the world.`,
    `The second son of the wizard sets fire to the sea.`,
    `The long-lost god returns to kill their long-loved compatriot.`,
    `The long-disappeared hero returns, but is now hungry for carrion.`,
    `A strange girl appears in the sky, sitting atop the moon with a hungry look on her face.`,
    `A local tournament turns out to be a lonely mimic.`,
    `Small eyes appear on the King's throne; she claims it is no big deal - ignore it, ignore it, ignore it.`,
    `Two ships arrive at the harbor. They are the exact same: the build, the make, the people inside.`,
    `An unexplained landslide dislodges much of a nearby mountain, revealing an ancient clock ticking closer to midnight.`,
    `A heartbroken man accepts a pact with the devil.`,
    `The sea serpent is cold and more brigands have scruffy moustaches now.`,
    `Every night all evildoers meet at the local tavern.`,
    `An aspiring adventurer encounters a sword forged by a people lost to sin.`,
    `The real hero can't find any way to sob during the Darkling's Prayer.`,
    `Every day, a child finds a pauper.`,
    `The moon is infinitely brokenhearted.`,
    `A giant washes ashore; she is terrified at your tiny size.`,
    `The earth shakes: the Lady's crypt begin tolling wildly.`,
    `A blue flower blooms; the next day, a blue woman arrives.`,
    `Mondays are coming back to the West.`,
    `Every mirror's reflection shows the same person, but with the mayor's son's face.`,
    `Misguided youths steal the world.`,
    `Ivory statues begin burning books.`,
    `A village of homonculus begin filing legal paperwork against your village.`,
    `A beloved community leader disappears, replaced instead by a broken husk of tears.`,
    `The lovable next-door neighbor realizes they truly deserve the love.`,
    `An implausible copper ship arrives, sailed solely by murderous salamanders.`,
    `A lobster falls in love with a human and wishes to be united with them; the wrong god listens.`,
    `The second pale girl searches for her face, as a young child uncovers it inside a jar, miles away.`,
    `They found the mine of children.`,
    `Petal ambassadors begin their yearly flowering, and all the world is enraptured.`,
    `A charming man arrives in town and claims he has an irresistible cure to sadness.`,
    `The royal composer creates a song that could end the war.`,
  ];

  const sendRandomOmen = () => {
    const index = randomInt(TABLE__OMENS.length);
    const omenText = TABLE__OMENS[index];

    const fateStyle = `${STYLE__LOW_HEADER_DARK} position: inherit; margin-top: 5px`;
    const omen = [
      makeDiv(omenText, STYLE__SUBHEADER_AUGUR),
      makeHeader(`The Augur whispers.`, fateStyle),
    ].join("");
    gmWhisper(makeAltContainer(STYLE__CONTENT_AUGUR, makeDiv(omen, STYLE__HEADER_DARK)));

  };

  const randomInt = (max) => {
    return Math.floor(Math.random() * max);
  };
  //#endregion Random Omens API

  //#region Make HTML Tags
  const makeHorizontalRule = () => {
    return `<hr style="${STYLE__HR}" />`;
  };

  const makeContainer = (main, ...optional) => {
    let container = [
      `<div style="${STYLE__CONTAINER}">`,
      makeDiv(main, STYLE__CONTENT_LIGHT),
    ];

    optional.forEach((m) => {
      container.push(makeDiv(m, STYLE__CONTENT_DARK));
    });

    container.push(`</div>`);

    return container.join("");
  };

  const makeDarkContainer = (...optional) => {
    let container = [
      `<div style="${STYLE__CONTAINER}">`,
    ];

    optional.forEach((m) => {
      container.push(makeDiv(m, STYLE__CONTENT_DARK));
    });

    container.push(`</div>`);

    return container.join("");
  };

  const makeAltContainer = (style, ...optional) => {
    let container = [
      `<div style="${STYLE__CONTAINER}">`,
    ];

    optional.forEach((m) => {
      container.push(makeDiv(m, style));
    });

    container.push(`</div>`);

    return container.join("");
  };

  const makeLink = (text, href, style) => {
    return `<a style="${style}" href="${href}">${text}</a>`;
  };

  const makeKeyword = (text) => {
    return `<span style="font-style: normal; text-transform: uppercase;">${text}</span>`;
  };

  const makeSpan = (text, style) => {
    return `<span style="${style}">${text}</span>`;
  };

  const makeDiv = (text, style) => {
    return `<div style="${style}">${text}</div>`;
  };

  const makeSubheader = (text, style) => {
    return `<span style="${style}">${text}</span>`;
  }

  const makeHeader = (text, style) => {
    return `<span style="${style}">${text}</span>`;
  };

  const makeHeaderAlt = (text, style) => {
    return `<h2 style="${style}"><span>${text}</span></h2>`;
  };

  const makeKeyValue = (span, link, style) => {
    let table = [
      `<table style="width: 100%; ${style}">`,
      `<tr>`,
      `<td style="width: 75%;">${span}</td>`,
      `<td style="width: 25%;">${link}</td>`,
      `</tr>`,
      `</table>`,
    ].join("");

    return table;
  }
  //#endregion Make HTML Tags

  //#region Send Chat Methods
  const broadcast = (msg) => {
    sendChat(CONST__SCRIPT, msg, null);
  };

  const gmWhisper = (msg) => {
    sendChat(CONST__SCRIPT, `/w gm ${msg}`, null, { noarchive: true });
  };

  // whisper to player
  const whisper = (player, msg) => {
    sendChat(CONST__SCRIPT, `/w "${player.get("displayname")}" ${msg}`, null, { noarchive: true });
    return;
  };
  //#endregion Send Chat Method

  on("ready", () => {
    Arc.checkInstall();
    Arc.registerEventHandlers();
    log(`// ARC v${CONST__VERSION}`);
  });

  return {
    checkInstall,
    registerEventHandlers,
  };
})();
