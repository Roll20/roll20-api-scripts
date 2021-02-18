/* 
 * Roll20: https://app.roll20.net/users/6205674/angelo
 * Github: https://github.com/ocangelo/roll20/
*/

/*jshint -W069 */
/*jshint -W014 */
/*jshint -W083 */
//class WildMenu {   };
//class WildUtils {   };

const WS_API = {
    NAME : "WildShape",
    VERSION : "1.4.1",
    REQUIRED_HELPER_VERSION: "1.3.3",

    STATENAME : "WILDSHAPE",

    // storage in the state
    DATA_CONFIG : "config",
    DATA_SHIFTERS : "shifters",

    // general info
    SETTINGS : {
        BASE_SHAPE : "base",
        SHIFTER_SIZE : "normal",
        SHAPE_SIZE : "auto",        
        SHAPE_SIZES : [
            "auto",
            "tiny",
            "normal",
            "large",
            "huge",
            "gargantuan",
        ],
        SHAPE_SIZES_SCALE : [
            0, //"auto",
            0.5, //"tiny",
            1, //"normal",
            2, //"large",
            3, //"huge",
            4, //"gargantuan",
        ],

        STATS: {
            NAMES: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"],
            SHORT_NAMES: ["str", "dex", "con", "int", "wis", "cha"],
            SKILLS: {
                "strength" : [ "athletics"], 
                "dexterity" : [ "acrobatics", "sleight_of_hand", "stealth"],
                "constitution" : [],
                "intelligence" : ["arcana", "history", "investigation", "nature", "religion"],
                "wisdom" : ["animal_handling", "insight", "medicine", "perception", "survival"],
                "charisma" : ["deception", "intimidation", "performance", "persuasion"]
            },

            PROF: "pb",

            PREFIX: {
                NPC: "npc_",
            },

            SUFFIX: {
                BASE:       "_base",
                MOD:        "_mod",
                BONUS:      "_bonus",
                SAVE:       "_save",
                SAVE_BONUS: "_save_bonus",
                PROF:       "_prof",
                FLAG:       "_flag",
            },

            DRUID_COPY_ATTR: ["intelligence", "wisdom", "charisma"],
        },
    },

    // KEYS  in the config MUST match VALUES in the FIELDS object
    DEFAULT_CONFIG : {
        SEP: " ---",              // separator used in commands

        DRUID_WS_RES : "",
        MUTE_SHIFT: false,
        ENABLE_DEBUG: false,

        PC_DATA : {
            HP: "hp",
            SPEED: "speed",
            bar1: "hp",
            bar2: "ac",
            bar3: "speed",

            FORCEROLL_NEVER_WHISPER: true,
            FORCEROLL_TOGGLE_ADVANTAGE: true,
            FORCEROLL_MANUAL_DAMAGEROLL: true,
        },

        NPC_DATA : {
            HP: "hp",
            SPEED: "npc_speed",
            bar1: "hp",
            bar2: "npc_ac",
            bar3: "npc_speed",

            SENSES: "npc_senses",

            FORCEROLL_NEVER_WHISPER: false,
            FORCEROLL_TOGGLE_ADVANTAGE: false,
            FORCEROLL_MANUAL_DAMAGEROLL: false,
        },

        SENSES: {
            OVERRIDE_SENSES: true,

            light_radius: 5,
            light_dimradius: -5,
            light_otherplayers: false,
            light_hassight: true,
            light_angle: 360,
            light_losangle: 360,
            light_multiplier: 1, 
        },
    },


    // available commands
    CMD : {
        ROOT : "!ws",
        USAGE : "Please select a token then run: !ws",

        HELP : "help",

        CONFIG : "config",
        ADD : "add",
        REMOVE : "remove",
        EDIT : "edit",
        TOGGLE: "toggle",
        RESET : "reset",
        IMPORT : "import",
        EXPORT : "export",

        SHIFT : "shift",

        SHOW_SHIFTERS : "showshifters",
    },

    // VALUES are used as KEYS for the CONFIG
    FIELDS : {
        SEP: "sep",
        ENABLE_DEBUG: "enable_debug",

        // target of a command
        TARGET : {
            CONFIG: "config",
            SHIFTER : "shifter",
            SHAPE : "shape",
            SHAPEFOLDER : "shapefolder",
            CHAR_DATA: "charData",
        },

        SETTINGS: "settings",
        SHAPES: "shapes",

        ID: "ID",
        NAME: "name",
        CHARACTER: "character",
        SIZE: "size",
        ISDRUID: "isdruid",
        ISNPC: "isnpc",
        CURRENT_SHAPE: "currshape",
        ISDUPLICATE: "isDuplicate",

        
        DRUID_WS_RES: "DRUID_WS_RES",
        MUTE_SHIFT: "MUTE_SHIFT",

        STATS_CACHE: {
            ROOT: "stats_cache",
            STATS: "stats",
            MODS: "modifiers",
            SAVES: "saves",
            SKILLS: "skills",
        },

        // global shifter character settings, stored separately for PC and NPC types
        CHAR_DATA: {
            PC_ROOT : "PC_DATA",
            NPC_ROOT : "NPC_DATA",

            HP: "HP",
            SPEED: "SPEED",

            HP_CACHE: "HP_CACHE",
            SENSES: "SENSES",

            BAR_1: "bar1",
            BAR_2: "bar2",
            BAR_3: "bar3",

            FORCEROLL_NEVER_WHISPER: "FORCEROLL_NEVER_WHISPER",
            FORCEROLL_TOGGLE_ADVANTAGE: "FORCEROLL_TOGGLE_ADVANTAGE",
            FORCEROLL_MANUAL_DAMAGEROLL: "FORCEROLL_MANUAL_DAMAGEROLL",
        },

        SENSES: {
            ROOT: "SENSES",
            OVERRIDE: "OVERRIDE_SENSES",

            LIGHT_ATTRS: [
                "light_radius",
                "light_dimradius",
                "light_otherplayers",
                "light_hassight",
                "light_angle",
                "light_losangle",
                "light_multiplier"],
        },
    },

    DEPRECATED: {
        MAKEROLLPUBLIC: "makerollpublic",   // v1.4 -> split into separate ROLL_SETTINGS
        
        TOKEN_DATA : {                      // v1.4 -> converted to CHAR_DATA
            ROOT: "TOKEN_DATA",
            HP: "HP",
            AC: "AC",
            SPEED: "SPEED",
        },

        NPC_DATA : {                        // v1.4 -> converted to CHAR_DATA
            ROOT: "NPC_DATA",
            HP: "HP",
            AC: "AC",
            SPEED: "SPEED",
            SENSES: "SENSES",
            EMPTYBAR: "EMPTYBAR",
            HP_CACHE: "HP_CACHE",
        },

        PC_DATA : {                         // v1.4 -> converted to CHAR_DATA
            ROOT: "PC_DATA",
            HP: "HP",
            AC: "AC",
            SPEED: "SPEED",
        },
    },

    // major changes
    CHANGELOG : {
        "1.4.1" : "New option to enable debug chat/log, enabled auto size for PC sheets, changed default separator, plus a few more small fixes",
        "1.4"   : "Split Bar 1/2/3 setitngs and added overrides for different roll settings (toggle advantage, never whisper, auto roll damage)",
        "1.3"   : "automatically duplicate/delete characters when adding/removing new shapes",
        "1.2.6" : "added setting to mute players chat messages",
        "1.2.5" : "Wild Shape Resource added to config, automatically check and decrease when Druids transform",
        "1.2"   : "automatically add corrected saving throws and proficiencies for druids",
        "1.1"   : "automatically shapeshift tokens to the last shape when copied/dropped from the journal",
        "1.0.7" : "added senses attribute setting in NPC Data",
        "1.0.6" : "added automatic senses setup for NPCs (e.g. vision, light) and senses overrides for shifters and single shapes",
        "1.0.5" : "changed default separator to minimize collisions",
        "1.0.4" : "added override roll settings (default true on PCs) to automatically set target shapes to never whisper, toggle advantage",
        "1.0.2" : "restructured pc/npc data",
    }
};

// ========================================= MENU HANDLING =========================================

class WildShapeMenu extends WildMenu
{
    constructor() {
        super();

        let apiConfig = state[WS_API.STATENAME][WS_API.DATA_CONFIG];
        this.UTILS = new WildUtils(WS_API.NAME, apiConfig[WS_API.FIELDS.ENABLE_DEBUG]);
    }

    updateConfig()
    {
        let apiConfig = state[WS_API.STATENAME][WS_API.DATA_CONFIG];
        this.SEP = apiConfig.SEP;
        this.CMD = {};
        this.CMD.ROOT            = WS_API.CMD.ROOT + this.SEP;
        this.CMD.CONFIG          = this.CMD.ROOT + WS_API.CMD.CONFIG;
        this.CMD.CONFIG_ADD      = this.CMD.CONFIG + this.SEP + WS_API.CMD.ADD + this.SEP;
        this.CMD.CONFIG_REMOVE   = this.CMD.CONFIG + this.SEP + WS_API.CMD.REMOVE + this.SEP;
        this.CMD.CONFIG_EDIT     = this.CMD.CONFIG + this.SEP + WS_API.CMD.EDIT + this.SEP;
        this.CMD.CONFIG_RESET    = this.CMD.CONFIG + this.SEP + WS_API.CMD.RESET;

        this.SHAPE_SIZES = WS_API.SETTINGS.SHAPE_SIZES.join("|");
        this.UTILS.debugEnable(apiConfig[WS_API.FIELDS.ENABLE_DEBUG]);
    }

    showEditSenses(shifterId = null, shapeId = null) {
        const config = state[WS_API.STATENAME][WS_API.DATA_CONFIG];
        let settings;
        let cmdEdit;
        let cmdBack;
        let cmdBackName;
        let overrideName;
        let menuTitle;

        // check what are editing senses on
        if (shifterId)
        {
            menuTitle = WS_API.NAME + ": " + shifterId;
            const shifter = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterId];

            if (shapeId)
            {
                settings = shifter[WS_API.FIELDS.SHAPES][shapeId];
                cmdEdit = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.SHAPE + this.SEP + shifterId + this.SEP + shapeId + this.SEP;
                cmdBack = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.SHAPE + this.SEP + shifterId + this.SEP + shapeId;
                cmdBackName = "Edit Shape: " + shapeId;
                menuTitle = menuTitle + " - " + shapeId;
            }
            else
            {
                settings = shifter[WS_API.FIELDS.SETTINGS];
                cmdEdit = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.SHIFTER + this.SEP + shifterId + this.SEP;
                cmdBack = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.SHIFTER + this.SEP + shifterId;
                cmdBackName = "Edit Shifter: " + shifterId;
            }

            menuTitle = menuTitle + " - Senses";
            overrideName = "Force Senses";
        }
        else
        {
            settings = config;
            cmdEdit = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.CONFIG + this.SEP;
            cmdBack = this.CMD.CONFIG;
            cmdBackName = "Main Menu";
            menuTitle = "Default Senses";

            overrideName = "Write Senses";
        }

        cmdEdit = cmdEdit + WS_API.FIELDS.SENSES.ROOT + this.SEP;

        let sensesDataList = [
            this.makeLabelValue(overrideName, settings[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE], 'false') + this.makeRightButton("Toggle", cmdEdit + WS_API.FIELDS.SENSES.OVERRIDE)
        ];

        if (shifterId && !config[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE])
        {
            sensesDataList.push(this.makeLabel("NOTE: Current Config Write Senses value is set to false, senses won't be applied", "font-size: 80%; padding-left: 10px; padding-bottom: 10px"));
        }

        // senses settings
        _.each(WS_API.FIELDS.SENSES.LIGHT_ATTRS, (attr) => {
            const currAttr = settings[WS_API.FIELDS.SENSES.ROOT][attr];
            
            let attrField = this.makeLabelValue(attr, currAttr);
            if (currAttr === false || currAttr === true) 
                attrField = attrField + this.makeRightButton("Toggle", cmdEdit + attr + this.SEP + WS_API.CMD.TOGGLE);
            else
                attrField = attrField + this.makeRightButton("Edit", cmdEdit + attr + this.SEP + "?{Attribute|" + currAttr + "}");
        
            sensesDataList.push(attrField);
        });

        let contents = this.makeList(sensesDataList)
            + "<hr>" + this.makeButton(cmdBackName, cmdBack, ' width: 100%');
        this.showMenu(WS_API.NAME, contents, WS_API.NAME + ': ' + menuTitle);
    }


    showEditCharData(dataRoot) {
        const config = state[WS_API.STATENAME][WS_API.DATA_CONFIG];
        let settings = config[dataRoot];

        let isNpc = dataRoot == WS_API.FIELDS.CHAR_DATA.NPC_ROOT;
        let charType =  (isNpc ? "NPC" : "PC");
        let menuTitle = charType + " Settings";

        let cmdEdit = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.CONFIG + this.SEP + WS_API.FIELDS.TARGET.CHAR_DATA + this.SEP + dataRoot + this.SEP;
        let cmdToggle = this.SEP + WS_API.CMD.TOGGLE;

        // PC settings
        let attributesDataList = [
            this.makeLabel("<p style='font-size: 120%'><b>Attributes:</b></p>"),
            this.makeLabel("Attributes IDs for " + charType + " sheets","font-size: 80%"),

            this.makeList(
                [ 
                    this.makeLabelValue("HP Attribute", settings[WS_API.FIELDS.CHAR_DATA.HP]) + this.makeRightButton("Edit", cmdEdit + WS_API.FIELDS.CHAR_DATA.HP + this.SEP + "?{Attribute|" + settings[WS_API.FIELDS.CHAR_DATA.HP] + "}"),
                    this.makeLabelValue("SPEED Attribute", settings[WS_API.FIELDS.CHAR_DATA.SPEED]) + this.makeRightButton("Edit", cmdEdit + WS_API.FIELDS.CHAR_DATA.SPEED + this.SEP + "?{Attribute|" + settings[WS_API.FIELDS.CHAR_DATA.SPEED] + "}"),
                    ... (isNpc ? [this.makeLabelValue("SENSES", settings[WS_API.FIELDS.CHAR_DATA.SENSES]) + this.makeRightButton("Edit", cmdEdit + WS_API.FIELDS.CHAR_DATA.SENSES + this.SEP + "?{Attribute|" + settings[WS_API.FIELDS.CHAR_DATA.SENSES] + "}")] : []),
                ], " padding-left: 10px"),
        ];

        let tokenDataList = [
            this.makeLabel("<p style='font-size: 120%'><b>Token Bars:</b></p>"),
            this.makeLabel("Links Attributes to Bars when transforming into a " + charType + " (if not empty)","font-size: 80%"),

            this.makeList(
                [ 
                    this.makeLabelValue("BAR 1", settings[WS_API.FIELDS.CHAR_DATA.BAR_1]) + this.makeRightButton("Edit", cmdEdit + WS_API.FIELDS.CHAR_DATA.BAR_1 + this.SEP + "?{Attribute|" + settings[WS_API.FIELDS.CHAR_DATA.BAR_1] + "}"),
                    this.makeLabelValue("BAR 2", settings[WS_API.FIELDS.CHAR_DATA.BAR_2]) + this.makeRightButton("Edit", cmdEdit + WS_API.FIELDS.CHAR_DATA.BAR_2 + this.SEP + "?{Attribute|" + settings[WS_API.FIELDS.CHAR_DATA.BAR_2] + "}"),
                    this.makeLabelValue("BAR 3", settings[WS_API.FIELDS.CHAR_DATA.BAR_3]) + this.makeRightButton("Edit", cmdEdit + WS_API.FIELDS.CHAR_DATA.BAR_3 + this.SEP + "?{Attribute|" + settings[WS_API.FIELDS.CHAR_DATA.BAR_3] + "}"),
                ], " padding-left: 10px"),

        ];

        let rollSettingsDataList = [
            this.makeLabel("<p style='font-size: 120%'><b>Shifters - Force Roll Settings:</b></p>"),
            this.makeLabel("If set to true it will change the roll settings on the target shape when a " + charType + " Shifter transforms into it", "font-size: 80%"),
            this.makeList(
                [ 
                    this.makeLabelValue("Never Whisper", settings[WS_API.FIELDS.CHAR_DATA.FORCEROLL_NEVER_WHISPER], 'false') + this.makeRightButton("Toggle", cmdEdit + WS_API.FIELDS.CHAR_DATA.FORCEROLL_NEVER_WHISPER + cmdToggle),
                    this.makeLabelValue("Toggle Advantage", settings[WS_API.FIELDS.CHAR_DATA.FORCEROLL_TOGGLE_ADVANTAGE], 'false') + this.makeRightButton("Toggle", cmdEdit + WS_API.FIELDS.CHAR_DATA.FORCEROLL_TOGGLE_ADVANTAGE + cmdToggle),
                    this.makeLabelValue("Manual Damage Roll", settings[WS_API.FIELDS.CHAR_DATA.FORCEROLL_MANUAL_DAMAGEROLL], 'false') + this.makeRightButton("Toggle", cmdEdit + WS_API.FIELDS.CHAR_DATA.FORCEROLL_MANUAL_DAMAGEROLL + cmdToggle),
                ], " padding-left: 10px"),
        ];

        let contents = this.makeList(attributesDataList)
            + this.makeList(tokenDataList)
            + this.makeList(rollSettingsDataList)
            + "<hr>" + this.makeButton("Main Menu", this.CMD.CONFIG, ' width: 100%');

        this.showMenu(WS_API.NAME, contents, WS_API.NAME + ': ' + menuTitle);
    }

    showEditShape(shifterId, shapeId) {
        const cmdShapeEdit = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.SHAPE + this.SEP + shifterId + this.SEP + shapeId + this.SEP;
        const cmdRemove = this.CMD.CONFIG_REMOVE;
        const cmdShifterEdit = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.SHIFTER + this.SEP + shifterId;

        const shifter = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterId];

        let npcs = this.UTILS.getNPCNames().sort().join('|');

        let obj = shifter[WS_API.FIELDS.SHAPES][shapeId];
        if(!obj)
        {
            UTILS.chatError("cannot find shape " + shapeId + " when trying to create EditShape menu");
            return;
        }

        let listItems = [
            this.makeLabelValue("Character", obj[WS_API.FIELDS.CHARACTER]),
            this.makeLabelValue("Name", shapeId) + this.makeRightButton("Edit", cmdShapeEdit + WS_API.FIELDS.NAME + this.SEP + "?{Edit Name|" + shapeId + "}"),
            this.makeLabelValue("Size", obj[WS_API.FIELDS.SIZE]) + this.makeRightButton("Edit", cmdShapeEdit + WS_API.FIELDS.SIZE + this.SEP + "?{Edit Size|" + this["SHAPE_SIZES"] + "}"),
            this.makeLabelValue("Force Senses", obj[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE], 'false') + this.makeRightButton("Edit Senses", cmdShapeEdit + WS_API.FIELDS.SENSES.ROOT),
            this.makeLabel("Override the auto/default senses applied", "font-size: 80%"),
        ];

        const deleteShapeButton = this.makeButton("Delete Shape", cmdRemove + "?{Are you sure you want to delete " + shapeId + "?|no|yes}" + this.SEP + WS_API.FIELDS.TARGET.SHAPE + this.SEP + shifterId + this.SEP + shapeId, ' width: 100%');
        const editShifterButton = this.makeButton("Edit Shifter: " + shifterId, cmdShifterEdit, ' width: 100%');

        let contents = this.makeList(listItems) + '<hr>' + deleteShapeButton + '<hr>' + editShifterButton;
        this.showMenu(WS_API.NAME, contents, WS_API.NAME + ': ' + shifterId + " - " + shapeId);
    }

    showEditShifter(shifterId) {
        const cmdShapeEdit = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.SHAPE + this.SEP;
        const cmdShapeAdd = this.CMD.CONFIG_ADD + WS_API.FIELDS.TARGET.SHAPE + this.SEP;
        const cmdShifterEdit = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.SHIFTER + this.SEP + shifterId + this.SEP ;
        const cmdRemove = this.CMD.CONFIG_REMOVE;
        const cmdImport = this.CMD.CONFIG + this.SEP + WS_API.CMD.IMPORT + this.SEP;
        const cmdExport = this.CMD.CONFIG + this.SEP + WS_API.CMD.EXPORT + this.SEP;

        const shifter = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterId];
        const shifterSettings = shifter[WS_API.FIELDS.SETTINGS];
        const shifterShapes = shifter[WS_API.FIELDS.SHAPES];

        // get list of pcs and npcs
        const isNpc = shifterSettings[WS_API.FIELDS.ISNPC];
        const npcs = this.UTILS.getNPCNames().sort().join('|');
        const pcs = this.UTILS.getPCNames().sort().join('|');
        let shifterPcs = isNpc ? npcs : pcs;

        let pcTag = shifterSettings[WS_API.FIELDS.ISNPC] ? "<i>(NPC)</i>" : " <i>(PC)</i>";

        // settings section
        let listItems = [];

        let settingsDataList = [
            this.makeLabel("<p style='font-size: 120%'><b>Settings " + pcTag) + ":</b></p>",
            this.makeLabelValue("Token Name", shifterId) + this.makeRightButton("Edit", cmdShifterEdit + WS_API.FIELDS.NAME + this.SEP + "&#64;{target|token_name}"),
            this.makeLabel("Token name needs to match to be able to shapeshift", "font-size: 80%; padding-left: 10px; padding-bottom: 10px"),
            this.makeLabelValue(pcTag + " Character", shifterSettings[WS_API.FIELDS.CHARACTER]) + this.makeRightButton("Edit", cmdShifterEdit + WS_API.FIELDS.CHARACTER + this.SEP + "?{Edit Character|" + shifterPcs + "}"),
            this.makeLabelValue("Size", shifterSettings[WS_API.FIELDS.SIZE]) + this.makeRightButton("Edit", cmdShifterEdit + WS_API.FIELDS.SIZE + this.SEP + "?{Edit Size|" + this["SHAPE_SIZES"] + "}"),
            this.makeLabelValue("Is Druid", shifterSettings[WS_API.FIELDS.ISDRUID], 'false') + this.makeRightButton("Toggle", cmdShifterEdit + WS_API.FIELDS.ISDRUID),
            this.makeLabel("Is Druid automatically copies over proficiencies and INT/WIS/CHA attributes", "font-size: 80%"),
            this.makeLabelValue("Force Senses", shifterSettings[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE], 'false') + this.makeRightButton("Edit Senses", cmdShifterEdit + WS_API.FIELDS.SENSES.ROOT),
            this.makeLabel("Override the auto/default senses applied", "font-size: 80%"),
        ];

        //listItems.push(this.makeList(settingsDataList, " padding-left: 10px"));

        // shapes section
        let shapesDataList = [
            this.makeLabel("<p style='font-size: 120%'><b>Shapes:</b></p>"),
        ];

        _.each(shifterShapes, (value, shapeId) =>
        {
            shapesDataList.push(this.makeLabel(shapeId) + this.makeRightButton("Del", cmdRemove + "?{Are you sure you want to delete " + shapeId + "?|no|yes}" + this.SEP + WS_API.FIELDS.TARGET.SHAPE + this.SEP + shifterId + this.SEP + shapeId) + this.makeRightButton("Edit", cmdShapeEdit + shifterId + this.SEP + shapeId));
        });
        //listItems.push(this.makeList(shapesDataList, " padding-left: 10px"));

        // bottom buttons
        const shapeButtons =
            "<table style='width: 100%'><tr><td>" + this.makeButton("Add NPC", cmdShapeAdd + shifterId + this.SEP + "?{Target Shape|" + npcs + "}", 'width: 100%') + "<td>" + this.makeButton("Add PC", cmdShapeAdd + shifterId + this.SEP + "?{Target Shape|" + pcs + "}", 'width: 100%') + "</table>"
            + this.makeButton("Import Shapes from Folder", cmdImport + WS_API.FIELDS.TARGET.SHAPEFOLDER + this.SEP + shifterId + this.SEP + "?{Folder Name}" + this.SEP + "?{Find in Subfolders?|no|yes}" + this.SEP + "?{Remove Prefix (optional)}", ' width: 100%')
            + this.makeLabelComment("Adding a single shape may take a several seconds (around 4s), importing several shapes from a folder may take a while (e.g. 15 shapes should take around 1 minute); please wait until you see the results in the chat");

        const deleteShapesButton = this.makeButton("Delete All Shapes", cmdRemove + "?{Are you sure you want to delete all shapes?|no|yes}" + this.SEP + WS_API.FIELDS.TARGET.SHAPE + this.SEP + shifterId, ' width: 100%');
        //const importShapesButton = this.makeButton("Import Shapes", cmdImport + WS_API.FIELDS.TARGET.SHAPE + this.SEP + "?{Shapes Data}", ' width: 100%');
        //const exportShapesButton = this.makeButton("Export Shapes", cmdExport + WS_API.FIELDS.TARGET.SHAPE, ' width: 100%');
        //const exportShifterButton = this.makeButton("Export Shifter", cmdExport + WS_API.FIELDS.TARGET.SHIFTER, ' width: 100%');
        const deleteShifterButton = this.makeButton("Delete Shifter: " + shifterId, cmdRemove + "?{Are you sure you want to delete the shifter?|no|yes}" + this.SEP + WS_API.FIELDS.TARGET.SHIFTER + this.SEP + shifterId, ' width: 100%');
        const showShiftersButton = this.makeButton("Show ShapeShifters", this.CMD.ROOT + WS_API.CMD.SHOW_SHIFTERS, ' width: 100%');

        //let contents = this.makeList(listItems) + importShapesFromFolderButton /*+ importShapesButton + exportShapesButton + exportShifterButton*/ + '<hr>' + deleteShifterButton + '<hr>' + showShiftersButton;
        let contents = this.makeList(settingsDataList)
            + '<hr>' + this.makeList(shapesDataList) + shapeButtons /*+ importShapesButton + exportShapesButton + exportShifterButton*/ 
            + '<hr>' + deleteShapesButton + deleteShifterButton 
            + '<hr>' + showShiftersButton;
        
        this.showMenu(WS_API.NAME, contents, WS_API.NAME + ': ' + shifterId);
    }

    showShifters() {
        const cmdShifterAdd = this.CMD.CONFIG_ADD + WS_API.FIELDS.TARGET.SHIFTER + this.SEP;
        const cmdShifterEdit = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.SHIFTER + this.SEP;
        const cmdRemove = this.CMD.CONFIG_REMOVE;
        const cmdImport = this.CMD.CONFIG + this.SEP + WS_API.CMD.IMPORT + this.SEP;

        let listItems = [];
        _.each(state[WS_API.STATENAME][WS_API.DATA_SHIFTERS], (value, shifterId) => {
            const shifterSettings = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterId][WS_API.FIELDS.SETTINGS];
            listItems.push(this.makeLabel(shifterId + (shifterSettings[WS_API.FIELDS.ISNPC] ? " <i>(NPC)</i>" : " <i>(PC)</i>")) + this.makeRightButton("Del", cmdRemove + "?{Are you sure you want to delete " + shifterId + "?|no|yes}" + this.SEP + WS_API.FIELDS.TARGET.SHIFTER + this.SEP + shifterId)+ this.makeRightButton("Edit", cmdShifterEdit + shifterId));
        });

        let pcs = this.UTILS.getPCNames().sort().join('|');
        let npcs = this.UTILS.getNPCNames().sort().join('|');

        const addShifterButton = this.makeButton("Add ShapeShifter", cmdShifterAdd + "&#64;{target|token_id}", ' width: 100%');
        //const importShifterButton = this.makeButton("Import Shifter", cmdImport + WS_API.FIELDS.TARGET.SHIFTER + this.SEP + "?{Shifter Data}", ' width: 100%');

        const configButton = this.makeButton("Main Menu", this.CMD.CONFIG, ' width: 100%');

        let contents = this.makeList(listItems) + addShifterButton /*+ importShifterButton*/ + '<hr>' + configButton;
        this.showMenu(WS_API.NAME, contents, WS_API.NAME + ': ShapeShifters');
    }

    showConfigMenu(newVersion) {
        const config = state[WS_API.STATENAME][WS_API.DATA_CONFIG];

        const apiCmdBase = this.CMD.ROOT;
        const cmdConfigEdit = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.CONFIG + this.SEP;

        const showShiftersButton = this.makeButton("Edit ShapeShifters", apiCmdBase + WS_API.CMD.SHOW_SHIFTERS, ' width: 100%');
        
        let settingsList = [
            this.makeLabel("<p style='font-size: 120%'><b>Config:</b></p>"),

            this.makeLabelValue("Commands Separator", this.SEP) + this.makeRightButton("Edit", cmdConfigEdit + WS_API.FIELDS.SEP + this.SEP + "?{New Separator}"),
            this.makeLabel("Please make sure your names/strings don't include the separator used by the API", "font-size: 80%; padding-left: 10px"),

            this.makeLabelValue("<br>WildShape Resource", config[WS_API.FIELDS.DRUID_WS_RES]) + this.makeRightButton("Edit", cmdConfigEdit + WS_API.FIELDS.DRUID_WS_RES + this.SEP + "?{Edit|" + config[WS_API.FIELDS.DRUID_WS_RES] + "}"),
            this.makeLabel("Automatically check and decrease resource for Druids (case insensitive)", "font-size: 80%; padding-left: 10px"),

            this.makeLabelValue("Mute Shift Messages", config[WS_API.FIELDS.MUTE_SHIFT], 'false') + this.makeRightButton("Toggle", cmdConfigEdit + WS_API.FIELDS.MUTE_SHIFT),
            this.makeLabel("Mute messages sent to players when shapeshifting", "font-size: 80%; padding-left: 10px"),

            this.makeLabel("PC Settings") + this.makeRightButton("Edit", cmdConfigEdit + WS_API.FIELDS.TARGET.CHAR_DATA + this.SEP + WS_API.FIELDS.CHAR_DATA.PC_ROOT),
            this.makeLabel("Global settings (attributes, rolls, etc.) for PC sheets", "font-size: 80%; padding-left: 10px"),

            this.makeLabel("NPC  Settings") + this.makeRightButton("Edit", cmdConfigEdit + WS_API.FIELDS.TARGET.CHAR_DATA + this.SEP + WS_API.FIELDS.CHAR_DATA.NPC_ROOT),
            this.makeLabel("Global settings (attributes, rolls, etc.) for NPC sheets", "font-size: 80%; padding-left: 10px"),

            // senses settings
            this.makeLabelValue("Write Senses", config[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE], 'false') + this.makeRightButton("Edit", cmdConfigEdit + WS_API.FIELDS.SENSES.ROOT),
            this.makeLabel("Write senses to token, defaults if data cannot be found", "font-size: 80%; padding-left: 10px"),

            this.makeLabelValue("Enable Debug Messages", config[WS_API.FIELDS.ENABLE_DEBUG], 'false') + this.makeRightButton("Toggle", cmdConfigEdit + WS_API.FIELDS.ENABLE_DEBUG),
            this.makeLabel("Enable debug messages in the chat and in the API log", "font-size: 80%; padding-left: 10px"),
        ];
        
        // finalization
        const resetButton = this.makeButton('Reset', this.CMD.CONFIG_RESET + this.SEP + "?{Are you sure you want to reset all configs?|no|yes}", ' width: 100%');

        let title_text = WS_API.NAME + " v" + WS_API.VERSION + ((newVersion) ? ': New Version Setup' : ': Config');
        let contents = showShiftersButton + '<hr>'
                        + this.makeList(settingsList)
                        + '<hr>' + resetButton;

        this.showMenu(WS_API.NAME, contents, title_text);
    }

    showShapeShiftMenu(who, playerid, shifterId, shapes) {
        const cmdShapeShift = this.CMD.ROOT + WS_API.CMD.SHIFT + this.SEP;

        let contents = '';

        if (playerIsGM(playerid))
        {
            const cmdShifterEdit = this.CMD.CONFIG_EDIT + WS_API.FIELDS.TARGET.SHIFTER + this.SEP;
            contents += this.makeButton("Edit", cmdShifterEdit + shifterId, ' width: 100%') + "<hr>";
        }

        contents += this.makeButton(shifterId, cmdShapeShift + WS_API.SETTINGS.BASE_SHAPE, ' width: 100%') + "<hr>";
        _.each(shapes, (value, key) => {
            contents += this.makeButton(key, cmdShapeShift + key, ' width: 100%');
        });

        this.showMenu(WS_API.NAME, contents, WS_API.NAME + ': ' + shifterId + ' ShapeShift', {whisper: who});
    }
}

// ========================================= WILD SHAPE =========================================

var WildShape = WildShape || (function() {
    'use strict';
    let MENU = new WildShapeMenu();
    let UTILS = new WildUtils(WS_API.NAME, state[WS_API.STATENAME][WS_API.DATA_CONFIG][WS_API.FIELDS.ENABLE_DEBUG]);

    const sortShifters = () => {
        // order shifters
        state[WS_API.STATENAME][WS_API.DATA_SHIFTERS] = UTILS.sortByKey(state[WS_API.STATENAME][WS_API.DATA_SHIFTERS]);
    };

    const sortShapes = (shifter) => {
        // order shapes
        shifter[WS_API.FIELDS.SHAPES] = UTILS.sortByKey(shifter[WS_API.FIELDS.SHAPES]);
    };

    const copySenses = (from, to) =>
    {
        const fromSenses = from[WS_API.FIELDS.SENSES.ROOT];        
        let toSenses = {};

        _.each(WS_API.FIELDS.SENSES.LIGHT_ATTRS, function (attr)
        {
            toSenses[attr] = fromSenses[attr];
        });

        toSenses[WS_API.FIELDS.SENSES.OVERRIDE] = fromSenses[WS_API.FIELDS.SENSES.OVERRIDE];
        to[WS_API.FIELDS.SENSES.ROOT] = toSenses;
    }; 

    // cache basic stats and modifiers
    const cacheCharacterData = (target) => {
        const targetId = target[WS_API.FIELDS.ID];
        const isNpc = (getAttrByName(targetId, 'npc', 'current') == 1);

        const STATS = WS_API.SETTINGS.STATS;

        const PREFIX = isNpc ? STATS.PREFIX.NPC : "";
        const SUFFIX_MOD = STATS.SUFFIX.MOD;
        const SUFFIX_SAVE = STATS.SUFFIX.SAVE;
        const SUFFIX_PROF = STATS.SUFFIX.PROF;

        let stats = {};
        let mods = {};
        let saves = {};
        let skills = {};

        for (let statIndex = 0; statIndex < 6; ++statIndex) {
            const statName = STATS.NAMES[statIndex];
            const shortStatName = STATS.SHORT_NAMES[statIndex];

            // copy stat
            let attr = findObjs({_type: "attribute", name: statName, _characterid: targetId})[0];
            stats[statName] = attr ? Number(attr.get("current")) : 0;

            // copy modifier
            attr = findObjs({_type: "attribute", name: statName + SUFFIX_MOD, _characterid: targetId})[0];
            let mod = attr ? Number(attr.get("current")) : 0;
            mods[statName] = mod;

            // copy save
            attr = findObjs({_type: "attribute", name: PREFIX + (isNpc ? shortStatName : statName) + SUFFIX_SAVE, _characterid: targetId})[0];
            saves[statName] = attr && attr.get("current") != "" ? Number(attr.get("current")) : mod;

            // copy skills
            _.each(STATS.SKILLS[statName], (skillName) => {
                attr = findObjs({_type: "attribute", name: PREFIX + skillName, _characterid: targetId})[0];
                skills[skillName] = attr && attr.get("current") != "" ? Number(attr.get("current")) : mod;
            });
        }

        let statsCache = {};
        statsCache[WS_API.FIELDS.STATS_CACHE.STATS] = stats;
        statsCache[WS_API.FIELDS.STATS_CACHE.MODS] = mods;
        statsCache[WS_API.FIELDS.STATS_CACHE.SAVES] = saves;
        statsCache[WS_API.FIELDS.STATS_CACHE.SKILLS] = skills;

        target[WS_API.FIELDS.STATS_CACHE.ROOT] = statsCache;

    };

    const getCreatureSize = (targetSize) => {        
        return WS_API.SETTINGS.SHAPE_SIZES_SCALE[targetSize ? Math.max(_.indexOf(WS_API.SETTINGS.SHAPE_SIZES, targetSize.toLowerCase()), 0) : 0];
    };

    const getTokenBarData = (shifterSettings, targetCharacterId, isTargetDefault, isTargetNpc) => {
        const config = state[WS_API.STATENAME][WS_API.DATA_CONFIG];
        let charDataRoot = config[isTargetNpc ? WS_API.FIELDS.CHAR_DATA.NPC_ROOT : WS_API.FIELDS.CHAR_DATA.PC_ROOT];

        let hpAttr    = charDataRoot[WS_API.FIELDS.CHAR_DATA.HP];
        let speedAttr = charDataRoot[WS_API.FIELDS.CHAR_DATA.SPEED];

        let barData = {};

        function getValue(fieldId)
        {
            let attrName = charDataRoot[fieldId];
            if (attrName && attrName !== "")
            {
                let obj = findObjs({type: "attribute", characterid: targetCharacterId, name: attrName})[0];
                if(obj)
                {
                    barData[fieldId] = {};
                    barData[fieldId].id  = obj.id;
                    barData[fieldId].max = obj.get('max');
                    
                    let currValue = obj.get('current');

                    // HP SPECIAL HANDLING
                    if (attrName == hpAttr)
                    {
                        if (isTargetDefault)
                        {
                            // NPC ShapeShifter don't store the current in hp and need special handling to restore hp when going back to original form
                            if (shifterSettings[WS_API.FIELDS.ISNPC])
                            {
                                currValue = shifterSettings[WS_API.FIELDS.CHAR_DATA.HP_CACHE];
                                if (!currValue)
                                {
                                    currValue = barData[fieldId].max;
                                    UTILS.debugChat("cannot restore hp from HP CACHE, value not found; setting current hp to max");
                                }
                                else
                                {
                                    UTILS.debugChat("restoring " + currValue + " from HP_CACHE");
                                }
                            }
                        }
                        else
                        {
                            // always restore the max unless we are going back to the default Shape
                            currValue = barData[fieldId].max;
                        }
                    }
                    // SPEED SPECIAL HANDLING
                    else if (attrName == speedAttr && ((!_.isNumber(currValue)) && currValue.indexOf(' ') > 0))
                    {
                        // "speed" can have multiple values, just display the first number/word before the space
                        currValue = currValue.split(' ')[0];
                    }

                    // set value
                    barData[fieldId].current = currValue;
                }
                else
                {
                    UTILS.chatError("setting value on token bar, cannot find attribute [" + attrName + "] on character: " + targetCharacterId);
                }
            }
        }

        getValue(WS_API.FIELDS.CHAR_DATA.BAR_1);
        getValue(WS_API.FIELDS.CHAR_DATA.BAR_2);
        getValue(WS_API.FIELDS.CHAR_DATA.BAR_3);

        return barData;
    };

    const setTokenBarValues = (token, barData, controlledby) => {
        function setValue(barKey)
        {
            if (barData[barKey])
            {
                token.set(barKey + "_link", barData[barKey].id ? barData[barKey].id : "");
                token.set(barKey + "_value", barData[barKey].current ? barData[barKey].current : "");
                token.set(barKey + "_max", barData[barKey].max ? barData[barKey].max : "");

                // we need to turn bar visibility on if the target is controlled by a player
                if (controlledby && controlledby.length > 0)
                {
                    token.set("showplayers_" + barKey, false);
                    token.set("playersedit_" + barKey, true);
                }
            }
        }

        setValue(WS_API.FIELDS.CHAR_DATA.BAR_1);
        setValue(WS_API.FIELDS.CHAR_DATA.BAR_2);
        setValue(WS_API.FIELDS.CHAR_DATA.BAR_3);
    };

    const findShifterData = (tokenObj, silent = false) => {
        //let tokenObj = getObj(selectedToken._type, selectedToken._id);

        //const id = tokenObj.get("represents");
        //const targetId = _.findKey(state[WS_API.STATENAME][WS_API.DATA_SHIFTERS], function(s) { return s[WS_API.FIELDS.SETTINGS][WS_API.FIELDS.ID] == id; });
        //if (targetKey)

        const targetId = tokenObj.get("name");
        const target = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][targetId];

        if(target)
        {
            const targetCharacterId = target[WS_API.FIELDS.SETTINGS][WS_API.FIELDS.ID];
            const targetCharacter = findObjs({ type: 'character', id: targetCharacterId })[0];
            if(targetCharacter)
            {
                return {
                    token: tokenObj,
                    shifterId: targetId,
                    shifter: target,
                    shifterCharacterId: targetCharacterId,
                    shifterCharacter: targetCharacter,
                    shifterControlledby: targetCharacter.get("controlledby")
                };
            }
            else if (!silent)
                UTILS.chatError("Cannot find ShapeShifter: " + targetId + ", character id: " + target[WS_API.FIELDS.SETTINGS][WS_API.FIELDS.ID]);
        }
        else if (!silent)
            UTILS.chatError("Cannot find ShapeShifter: " + targetId);

        return null;
    };

    async function getTargetCharacterData(shiftData, isTargetNpc, isTargetDefault) {
        UTILS.debugChat("build target character data: START");

        const config = state[WS_API.STATENAME][WS_API.DATA_CONFIG];
        const shifterSettings = shiftData.shifter[WS_API.FIELDS.SETTINGS];
        const targetData = shiftData.targetShape ? shiftData.targetShape : shifterSettings;

        // the get on _defaulttoken is async, need to wait on it
        UTILS.debugChat("wait for token image");
        let targetImg = null;
        await UTILS.getDefaultTokenImage(shiftData.targetCharacter).then((img) => {
            targetImg = img;

            if (!targetImg || targetImg.trim() == "")
            {
                UTILS.debugChat("cannot find default token image, getting avatar image");
                targetImg = UTILS.getCleanImgsrc(shiftData.targetCharacter.get('avatar'));

                if (!targetImg || targetImg.trim() == "")
                {
                    UTILS.chatErrorToPlayer(shiftData.who, "cannot use image with marketplace link, the image needs to be re-uploaded into the library and set on the target character as either token or avatar image; character id = " + shiftData.targetCharacterId);
                    targetImg = null;
                }
            }
        });

        if (!targetImg)
        {
            return null;
        }
        else
        {
            UTILS.debugChat("token image found");
        }

        // NPCs shapeshifters need to cache their current HP so that we can restore it when they go back to their base shape as they don't save it in the current attribute
        if (shifterSettings[WS_API.FIELDS.ISNPC] && !isTargetDefault && shifterSettings[WS_API.FIELDS.CURRENT_SHAPE] == WS_API.SETTINGS.BASE_SHAPE)
        {
            UTILS.debugChat("npc hp special handling");

            // cache current npc hp value
            let npcDataRoot = config[WS_API.FIELDS.CHAR_DATA.NPC_ROOT];
            let hpAttr = npcDataRoot[WS_API.FIELDS.CHAR_DATA.HP];
            let hpBarValue = null;
            
            if (hpAttr == npcDataRoot[WS_API.FIELDS.CHAR_DATA.BAR_1])
                hpBarValue = "bar1_value";
            else if (hpAttr == npcDataRoot[WS_API.FIELDS.CHAR_DATA.BAR_2])
                hpBarValue = "bar2_value";
            else if (hpAttr == npcDataRoot[WS_API.FIELDS.CHAR_DATA.BAR_3])
                hpBarValue = "bar3_value";

            if (hpBarValue)
            {
                shifterSettings[WS_API.FIELDS.CHAR_DATA.HP_CACHE] = shiftData.token.get(hpBarValue);
                UTILS.debugChat("saving " + shifterSettings[WS_API.FIELDS.CHAR_DATA.HP_CACHE] + " from " + hpBarValue);
            }
            else
            {
                UTILS.chatError("cannot save current HP, no bar value found connected to " + hpAttr + "; this is required for NPC shifters, please make sure the hp attribute is set on one of the bars for the NPC settings in the main config");
                return null;
            }
        }

        // get token size
        const tokenBaseSize = 70;
        let tokenWidth = tokenBaseSize;
        let tokenHeight = tokenBaseSize;
        {
            UTILS.debugChat("get token size");

            let targetSize = getCreatureSize(targetData[WS_API.FIELDS.SIZE]);

            // get token size on the auto setting
            if (targetSize == 0)
            {
                if(isTargetNpc)
                {
                    targetSize = getAttrByName(shiftData.targetCharacterId, "token_size");
                    if(!targetSize)
                        targetSize = 0;
                }
                else
                {
                    await UTILS.getDefaultTokenSize(shiftData.targetCharacter).then((ret) => { 
                        if (ret.width > 0) 
                            tokenWidth = ret.width;
                        if (ret.height > 0) 
                            tokenHeight = ret.height}
                    );
                }
            }

            if (targetSize > 1)
            {
                tokenWidth = tokenBaseSize * targetSize;
                tokenHeight = tokenBaseSize * targetSize;
            }
        }
           
        // setup output data
        let data = {};
        {
            data.imgsrc = targetImg;
            data.characterId = shiftData.targetCharacterId;
            data.controlledby = shiftData.shifterControlledby;
            data.tokenWidth = tokenWidth;
            data.tokenHeight = tokenHeight;
        }

        // setup values for bar 1/2/3 on token
        data.barData = getTokenBarData(shifterSettings, shiftData.targetCharacterId, isTargetDefault, isTargetNpc);

        // setup senses
        if (config[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE])
        {
            UTILS.debugChat("setup senses");

            let senses = {};

            if (targetData[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE])
            {
                _.each(WS_API.FIELDS.SENSES.LIGHT_ATTRS, (attr) => {
                    senses[attr] = targetData[WS_API.FIELDS.SENSES.ROOT][attr];
                });
            }
            else
            {
                // copy the defaults
                _.each(WS_API.FIELDS.SENSES.LIGHT_ATTRS, (attr) => {
                    senses[attr] = config[WS_API.FIELDS.SENSES.ROOT][attr];
                });

                if (isTargetNpc)
                {
                    // get npc senses
                    let targetSenses = getAttrByName(shiftData.targetCharacterId, config[WS_API.FIELDS.CHAR_DATA.NPC_ROOT][WS_API.FIELDS.CHAR_DATA.SENSES]);
                    if (targetSenses)
                    {
                        // set radius to darkvision
                        let visionSense = targetSenses.match(/darkvision\s([0-9]+)/);
                        let hasDarkvision = visionSense && visionSense.length >= 2; 
                        if (hasDarkvision)
                            senses.light_radius = visionSense[1];

                        visionSense = targetSenses.match(/blindsight\s([0-9]+)/);
                        if (visionSense && visionSense.length >= 2)
                        {
                            // set end of bright radius to blindsight
                            senses.light_dimradius = visionSense[1];
                            if (!hasDarkvision)
                                senses.light_radius = senses.light_dimradius;
                        }
                    }
                }
            }

            data.senses = senses;
        }

        UTILS.debugChat("build target character data: DONE");
        return data;
    }

    const copyDruidProficiency = (profData) => {
        /*
        You also retain all of your skill and saving throw Proficiencies, in addition to gaining those of the creature.
        If the creature has the same proficiency as you and the bonus in its stat block is higher than yours, use the creature’s bonus instead of yours. 
        */
        let shapeStatAttr = findObjs({_type: "attribute", name: profData.shapeStatName, _characterid: profData.shapeId})[0];
        if (!shapeStatAttr)
        {
            shapeStatAttr = createObj('attribute', {
                characterid: profData.shapeId,
                name: profData.shapeStatName,
                current: "",
                max: ""
            });
        }

        if (shapeStatAttr)
        {
            // target could have proficiency in a stat we don't, default to that proficiency bonus
            let statPb = profData.shapeStatValue - profData.shapeStatMod;
            const isProficient = UTILS.isProficient(profData.druidId, profData.druidStatName + WS_API.SETTINGS.STATS.SUFFIX.PROF);
            UTILS.debugChat("-- stat " + profData.shapeStatName + ": " + profData.shapeStatValue.toString() + ", npc pb: " + statPb + ", npc mod " + profData.shapeStatMod + ", druid pb: " + (isProficient ? profData.druidPb : 0), false);

            // check which proficiency bonus we should use
            if (isProficient && profData.druidPb > statPb)
            {
                statPb = profData.druidPb;
            }

            // update stat value based on current modifier and best proficiency
            const newShapeStatValue = profData.statMod + statPb;
            const oldShapeStatValue = Number(shapeStatAttr.get("current"));
            if (newShapeStatValue !== oldShapeStatValue || shapeStatAttr.get("current") == "")
            {
                shapeStatAttr.set("current", newShapeStatValue);
                UTILS.debugChat("-- CHANGING -- " + profData.shapeStatName + " from " + oldShapeStatValue + " to: " + newShapeStatValue.toString(), false);

                // also set _base value
                UTILS.setAttribute(profData.shapeId, profData.shapeStatName + WS_API.SETTINGS.STATS.SUFFIX.BASE, (newShapeStatValue > 0 ? "+" : "") + newShapeStatValue.toString());
            }

            // set _flag value so that stats are forced to be displayed on NPCs
            UTILS.setAttribute(profData.shapeId, profData.shapeStatName + WS_API.SETTINGS.STATS.SUFFIX.FLAG, 1);
        }
        else
        {
            UTILS.chatError("cannot find attribute " + profData.shapeStatName + " on shape " + profData.shapeId);
        }
    };

    const copyDruidData = (shiftData) => {
        const STATS = WS_API.SETTINGS.STATS;

        const targetStatsCache = shiftData.targetShape[WS_API.FIELDS.STATS_CACHE.ROOT];
        const statsCache = targetStatsCache[WS_API.FIELDS.STATS_CACHE.STATS];
        const modsCache = targetStatsCache[WS_API.FIELDS.STATS_CACHE.MODS];
        const savesCache = targetStatsCache[WS_API.FIELDS.STATS_CACHE.SAVES];
        const skillsCache = targetStatsCache[WS_API.FIELDS.STATS_CACHE.SKILLS];


        let druidCharacterId = shiftData.shifter[WS_API.FIELDS.SETTINGS][WS_API.FIELDS.ID];
        
        let targetCharacterId = shiftData.targetCharacterId;
        let targetCharacter = shiftData.targetCharacter;
        let targetShape = shiftData.targetShape;

        // copy attributes
        UTILS.debugChat("copying druid attributes");

        _.each(STATS.DRUID_COPY_ATTR, function (attrName) {
            UTILS.copyAttribute(druidCharacterId, attrName, targetCharacterId, attrName, 10);
            UTILS.copyAttribute(druidCharacterId, attrName + STATS.SUFFIX.BASE, targetCharacterId, attrName + STATS.SUFFIX.BASE, 10);
            UTILS.copyAttribute(druidCharacterId, attrName + STATS.SUFFIX.MOD, targetCharacterId, attrName + STATS.SUFFIX.MOD, "0");
        });

        // copy proficiencies
        let profData = {};
        profData.druidId = druidCharacterId;
        profData.shapeId = targetCharacterId;

        let druidPb  = findObjs({_type: "attribute", name: STATS.PROF, _characterid: druidCharacterId})[0];
        profData.druidPb = druidPb ? Number(druidPb.get("current")) : 0;
        UTILS.debugChat("druid pb: " + profData.druidPb, false);

        for (let statIndex = 0; statIndex < 6; ++statIndex)
        {
            const statName = STATS.NAMES[statIndex];
            const shortStatName = STATS.SHORT_NAMES[statIndex];

            // original stat modifier on target
            let statMod = findObjs({_type: "attribute", name: statName + WS_API.SETTINGS.STATS.SUFFIX.MOD, _characterid: targetCharacterId})[0];
            profData.statMod = statMod ? Number(statMod.get("current")) : 0;
            profData.shapeStatMod = modsCache[statName];

            // copy save proficiency
            profData.druidStatName = statName + STATS.SUFFIX.SAVE;
            profData.shapeStatName = STATS.PREFIX.NPC + shortStatName + STATS.SUFFIX.SAVE;
            profData.shapeStatValue = savesCache[statName];
            copyDruidProficiency(profData);

            // copy skill proficiency for all skills associated with this stat
            _.each(STATS.SKILLS[statName], (skillName) => {
                profData.druidStatName = skillName;
                profData.shapeStatName = STATS.PREFIX.NPC + skillName;
                profData.shapeStatValue = skillsCache[skillName];

                copyDruidProficiency(profData);
            });
        }

        UTILS.debugFlush("copying druid proficiencies");

        // npc saving/skills flag
        let npc_attr_flag = findObjs({_type: "attribute", name: "npc_saving_flag", _characterid: targetCharacterId})[0];
        if (npc_attr_flag)
        {
            npc_attr_flag.set("current", 1);
        }

        npc_attr_flag = findObjs({_type: "attribute", name: "npc_skills_flag", _characterid: targetCharacterId})[0];
        if (npc_attr_flag)
        {
            npc_attr_flag.set("current", 1);
        }
    };

    async function doShapeShift(shiftData) {
        const config = state[WS_API.STATENAME][WS_API.DATA_CONFIG];
        const shifterSettings = shiftData.shifter[WS_API.FIELDS.SETTINGS];

        let isTargetNpc = true;
        let isTargetDefault = false;
        let wildShapeResource = null;

        if(shiftData.targetShape)
        {
            // if it's a druid shapeshifting check that we have enough uses of the wildshape resource left
            if(shifterSettings[WS_API.FIELDS.ISDRUID] && !shiftData.ignoreDruidResource)
            {
                const wsResName = config[WS_API.FIELDS.DRUID_WS_RES];
                if(wsResName && wsResName.length > 0)
                {
                    wildShapeResource = UTILS.getResourceAttribute(shifterSettings[WS_API.FIELDS.ID], wsResName, false);
                    if (wildShapeResource)
                    {
                        if (wildShapeResource.get("current") <= 0)
                        {
                            if (shiftData.isGM)
                            {
                                wildShapeResource = null;
                                UTILS.chat("GM OVERRIDE - You have NO WildShape usage left for the day! resource name: " + wsResName);
                            }
                            else
                            {
                                UTILS.chatErrorToPlayer(shiftData.who, "You have NO WildShape usage left for the day! resource name: " + wsResName);
                                return false;                                
                            }
                        }
                    }
                    else
                    {
                        UTILS.chatErrorToPlayer(shiftData.who, "Cannot find wildshape resource attribute on character sheet = " + wsResName);
                        return false;
                    }
                }
            }

            shiftData.targetCharacterId = shiftData.targetShape[WS_API.FIELDS.ID];
            shiftData.targetCharacter = findObjs({ type: 'character', id: shiftData.targetCharacterId })[0];
            if (!shiftData.targetCharacter)
            {
                UTILS.chatErrorToPlayer(shiftData.who, "Cannot find target character = " + shiftData.targetShape[WS_API.FIELDS.CHARACTER] + " with id = " + shiftData.targetCharacterId);
                return false;
            }

            isTargetNpc = (getAttrByName(shiftData.targetCharacterId, 'npc', 'current') == 1);
        }
        else
        {
            // transform back into default shifter character
            shiftData.targetCharacterId = shiftData.shifterCharacterId;
            shiftData.targetCharacter = shiftData.shifterCharacter;
            isTargetNpc = shifterSettings[WS_API.FIELDS.ISNPC];
            isTargetDefault = true;
        }

        let targetData = null;

        await getTargetCharacterData(shiftData, isTargetNpc, isTargetDefault).then((ret) => { targetData = ret; });

        if (!targetData)
        {
            UTILS.debugChat("cannot get target character data, aborting");
            return false;
        }

        if (isTargetNpc)
        {
            // copy over druid attributes
            if (shifterSettings[WS_API.FIELDS.ISDRUID])
            {
                copyDruidData(shiftData);
            }
        }

        // set bar values
        setTokenBarValues(shiftData.token, targetData.barData, targetData.controlledby, isTargetNpc);

        // force roll settings when we are changing into another shape
        if (!isTargetDefault)
        {
            let targetDataRoot = shifterSettings[WS_API.FIELDS.ISNPC] ? config[WS_API.FIELDS.CHAR_DATA.NPC_ROOT] : config[WS_API.FIELDS.CHAR_DATA.PC_ROOT];

            if (targetDataRoot[WS_API.FIELDS.CHAR_DATA.FORCEROLL_NEVER_WHISPER])
            {
                UTILS.setAttribute(shiftData.targetCharacterId, "wtype", "");
            }

            if (targetDataRoot[WS_API.FIELDS.CHAR_DATA.FORCEROLL_TOGGLE_ADVANTAGE])
            {
                UTILS.setAttribute(shiftData.targetCharacterId, "rtype", "@{advantagetoggle}");
                UTILS.setAttribute(shiftData.targetCharacterId, "advantagetoggle", "{{query=1}} {{normal=1}} {{r2=[[0d20");
            }

            if (targetDataRoot[WS_API.FIELDS.CHAR_DATA.FORCEROLL_MANUAL_DAMAGEROLL])
            {
                UTILS.setAttribute(shiftData.targetCharacterId, "dtype", "pick");
            }
        }

        // check if the token is on a scaled page
        let tokenPageScale = 1.0;
        var tokenPageData = getObj("page", shiftData.token.get("pageid"));
        if (tokenPageData)
        {
            let snapping_increment = tokenPageData.get("snapping_increment");
            if (snapping_increment && snapping_increment > 0) 
                tokenPageScale = snapping_increment;
        }

        // set other token data
        shiftData.token.set({
            imgsrc: targetData.imgsrc,
            represents: targetData.characterId,
            height: targetData.tokenHeight * tokenPageScale,
            width: targetData.tokenWidth * tokenPageScale,
        });

        // set token sense
        if (targetData.senses)
        {
            _.each(WS_API.FIELDS.SENSES.LIGHT_ATTRS, function setLightAttr(attr) {
                shiftData.token.set(attr, targetData.senses[attr]);
            });
        }

        if (!isTargetDefault)
        {
            shiftData.targetCharacter.set({controlledby: targetData.controlledby, inplayerjournals: targetData.controlledby});
        }

        shifterSettings[WS_API.FIELDS.CURRENT_SHAPE] = shiftData.targetShapeName;

        // update wildshape resource
        if (wildShapeResource)
        {
            let wsCurrent = wildShapeResource.get("current") - 1;
            wildShapeResource.set("current",  wsCurrent);
            
            if (!config[WS_API.FIELDS.MUTE_SHIFT])
            {
                UTILS.chatToPlayer(shiftData.who, config[WS_API.FIELDS.DRUID_WS_RES] + " left: " + wsCurrent + " / " + wildShapeResource.get("max"));
            }
        }

        return true;
    }

    async function addShapeToShifter(config, shifter, shapeCharacter, newCharacterName, shapeId = null, doSort = true) {
        const shapeName = shapeCharacter.get('name');
        if ((!shapeId) || (typeof shapeId !== 'string') || (shapeId.length == 0))
            shapeId = shapeName;

        if (shifter[WS_API.FIELDS.SHAPES][shapeId])
        {
            UTILS.chatError("Trying to add a shape with an ID that's already used, skipping: " + shapeId);
            return false;
        }

        UTILS.chat("adding shape " + shapeId + ", please wait...");

        await UTILS.duplicateCharacter(shapeCharacter, newCharacterName)
            .then(
                function(newShapeCharacter) { shapeCharacter = newShapeCharacter; }
            );

        if(!shapeCharacter)
        {
            UTILS.chatError("cannot duplicate character, skipping: " + shapeId);
            return false;
        }

        let shape = {};
        shape[WS_API.FIELDS.ID] = shapeCharacter.get('_id');
        shape[WS_API.FIELDS.CHARACTER] = newCharacterName;
        shape[WS_API.FIELDS.SIZE] = WS_API.SETTINGS.SHAPE_SIZE;
        shape[WS_API.FIELDS.ISDUPLICATE] = true;

        cacheCharacterData(shape);
        copySenses(config, shape);
        shape[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE] = false;
        
        shifter[WS_API.FIELDS.SHAPES][shapeId] = shape;

        const shifterCharacter = findObjs({ type: 'character', id: shifter[WS_API.FIELDS.SETTINGS][WS_API.FIELDS.ID] })[0];
        if (shifterCharacter)
        {
            const shifterControlledBy = shifterCharacter.get("controlledby");
            shapeCharacter.set({controlledby: shifterControlledBy, inplayerjournals: shifterControlledBy});
        }

        if (doSort)
        {
            sortShapes(shifter);
        }

        return true;
    }

    const handleInputShift = (msg, args, config) => 
    {
        if(!msg.selected)
        {
            UTILS.chatErrorToPlayer(msg.who, "Please select a token before shapeshifting");
            return;
        }

        const shapeName = args.shift();

        const tokenObj = getObj(msg.selected[0]._type, msg.selected[0]._id);
        const obj = findShifterData(tokenObj);
        if(obj)
        {            
            // check that the player sending the command can actually control the token
            obj.isGM = playerIsGM(msg.playerid);
            if (obj.isGM || obj.shifterControlledby.search(msg.playerid) >= 0 || obj.shifterControlledby.search("all") >= 0)
            {
                obj.who = msg.who;
                obj.targetShapeName = shapeName;

                if (obj.targetShapeName !== obj.shifter[WS_API.FIELDS.SETTINGS][WS_API.FIELDS.CURRENT_SHAPE])
                {
                    if (obj.targetShapeName != WS_API.SETTINGS.BASE_SHAPE)
                    {
                        obj.targetShape = obj.shifter[WS_API.FIELDS.SHAPES][obj.targetShapeName];
                        if (!obj.targetShape)
                        {
                            UTILS.chatErrorToPlayer(msg.who, "Cannot find shape [" + obj.targetShapeName + "] for ShapeShifter: " + obj.shifterId);
                            return;
                        }
                    }

                    doShapeShift(obj).then((ret) => {
                        if (ret && !config[WS_API.FIELDS.MUTE_SHIFT])
                        {
                            if (obj.targetShape)
                                UTILS.chatAs(obj.shifterCharacter.get("id"), "Transforming into " + shapeName, null, null);
                            else
                                UTILS.chatAs(obj.shifterCharacter.get("id"), "Transforming back into " + obj.shifterId, null, null);
                        }
                    })
                }
                else
                {
                    UTILS.chatErrorToPlayer(msg.who, "You are already transformed into " + shapeName);
                }
            }
            else
            {
                UTILS.chatErrorToPlayer(msg.who, "Trying to shapeshift on a token you don't have control over");
            }
        }
        else
        {
            UTILS.chatErrorToPlayer(msg.who, "Cannot find a ShapeShifter for the selected token");
        }

    };

    const handleInputAddShifter = (msg, args, config) => 
    {
        let tokenId = args.shift();
        let tokenObj = findObjs({type:'graphic', id:tokenId})[0];                                                
        const shifterKey = tokenObj ? tokenObj.get("name") : null;
        if (shifterKey && shifterKey.length > 0)
        {
            let shifter = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey];
            if(!shifter)
            {
                const charId = tokenObj.get("represents");
                let charObj = findObjs({ type: 'character', id: charId });
                if(charObj && charObj.length == 1)
                {
                    const isNpc = (getAttrByName(charId, 'npc', 'current') == 1);

                    shifter = {};
                    
                    let shifterSettings = {};
                    shifterSettings[WS_API.FIELDS.ID] = charId;
                    shifterSettings[WS_API.FIELDS.CHARACTER] = charObj[0].get('name');
                    shifterSettings[WS_API.FIELDS.SIZE] = isNpc ? WS_API.SETTINGS.SHAPE_SIZE : WS_API.SETTINGS.SHIFTER_SIZE;
                    shifterSettings[WS_API.FIELDS.ISDRUID] = !isNpc;
                    shifterSettings[WS_API.FIELDS.ISNPC] = isNpc;
                    shifterSettings[WS_API.FIELDS.CURRENT_SHAPE] = WS_API.SETTINGS.BASE_SHAPE;
    
                    copySenses(config, shifterSettings);
                    shifterSettings[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE] = false;

                    shifter[WS_API.FIELDS.SETTINGS] = shifterSettings;
                    shifter[WS_API.FIELDS.SHAPES] = {};

                    state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey] = shifter;

                    sortShifters();
                    MENU.showEditShifter(shifterKey);
                }
                else
                {
                    UTILS.chatError("Cannot find character with id [" + charId + "] in the journal");
                }

            }
            else
            {
                UTILS.chatError("Trying to add ShapeShifter " + shifterKey + " which already exists");
            }
        }
        else
        {
            UTILS.chatError("Trying to add ShapeShifter from a token without a name");
        }
    };

    async function handleInputAddShape(msg, args, config) 
    {
        const shifterKey = args.shift();
        let shifter = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey];
        if (shifter)
        {
            const shapeName = args.shift();
            let shapeObj = findObjs({ type: 'character', name: shapeName })[0];
            if(shapeObj)
            {
                let shapeCharacterName = shifterKey + " - " + shapeName;
                await addShapeToShifter(config, shifter, shapeObj, shapeCharacterName).then( 
                    (ret) => { if (ret) { MENU.showEditShifter(shifterKey); UTILS.chat("New shape added: " + shapeName); } } );

            }
            else
            {
                UTILS.chatError("Cannot find character [" + shapeName + "] in the journal");
            }
        }
        else
        {
            UTILS.chatError("Trying to add shape to ShapeShifter " + shifterKey + " which doesn't exist");
            MENU.showShifters();
        }
    }

    async function handleInputRemoveShifter(msg, args, config) 
    {
        const shifterKey = args.shift();
        if (shifterKey)
        {
            if(state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey])
            {
                let shifter = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey];
                _.each(shifter[WS_API.FIELDS.SHAPES], (shape) => {
                    removeShape(shape);
                });

                delete state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey];
            }
            else
            {
                UTILS.chatError("Trying to delete ShapeShifter " + shifterKey + " which doesn't exists");
            }

        }
        else
        {
            UTILS.chatError("Trying to delete a ShapeShifter without providing a name");
        }

        MENU.showShifters();
    }

    const removeShape = (shape) =>
    {
        if (shape)
        {
            const shapeCharacter = findObjs({ type: 'character', id: shape[WS_API.FIELDS.ID] })[0];
            if (shapeCharacter)
            {
                // versions earlier than 1.3 don't have the automatic duplicate, preserve characters
                if(shape[WS_API.FIELDS.ISDUPLICATE])
                {
                    shapeCharacter.remove();
                }
                else
                {
                    shapeCharacter.set({controlledby: "", inplayerjournals: ""});
                }
            }

            return true;
        }

        return false;
    };

    async function handleInputRemoveShape(msg, args, config)
    {
        const shifterKey = args.shift();
        const shapeKey = args.shift();
        let shifter = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey];
        if (shifter) 
        {
            if (shapeKey)
            {
                let shape = shifter[WS_API.FIELDS.SHAPES][shapeKey];
                if (removeShape(shape))
                {
                    delete shifter[WS_API.FIELDS.SHAPES][shapeKey];
                }
                else
                {
                    UTILS.chatError("Trying to remove shape " + shapeKey + " that doesn't exist from ShapeShifter " + shifterKey);
                }                
            }
            else
            {
                // delete all shapes
                _.each(shifter[WS_API.FIELDS.SHAPES], (shape) => {
                    const shapeCharacter = findObjs({ type: 'character', id: shape[WS_API.FIELDS.ID] })[0];
                    if (shapeCharacter)
                    {
                        // versions earlier than 1.3 don't have the automatic duplicate, preserve characters
                        if(shape[WS_API.FIELDS.ISDUPLICATE])
                        {
                            shapeCharacter.remove();
                        }
                        else
                        {
                            shapeCharacter.set({controlledby: "", inplayerjournals: ""});
                        }
                    }
                });

                delete shifter[WS_API.FIELDS.SHAPES][shapeKey];
                shifter[WS_API.FIELDS.SHAPES] = {};
            }

            MENU.showEditShifter(shifterKey);
        }
        else
        {
            UTILS.chatError("Trying to remove shape from ShapeShifter " + shifterKey + " which doesn't exist");
            MENU.showShifters();
        }
    }

    const handleInputEditSenses = (msg, args, config, senses) => 
    {
        const field = args.shift();
        if (field)
        {
            if (field == WS_API.FIELDS.SENSES.OVERRIDE)
                senses[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE] = !senses[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE];
            else if (field)
            {
                let newValue = args.shift();
                if (newValue)
                {
                    if (newValue == WS_API.CMD.TOGGLE)
                        senses[WS_API.FIELDS.SENSES.ROOT][field] = !senses[WS_API.FIELDS.SENSES.ROOT][field];
                    else 
                        senses[WS_API.FIELDS.SENSES.ROOT][field] = newValue;
                }
            }
        }

        return field;
    };

    const handleInputEditShifter = (msg, args, config) => 
    {
        let shifterKey = args.shift();
        let shifter = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey];
        if (shifter)
        {
            const field = args.shift();
            if (field)
            {
                if (field == WS_API.FIELDS.SENSES.ROOT)
                {
                    let shifterSettings = shifter[WS_API.FIELDS.SETTINGS];
                    const editedSense = handleInputEditSenses(msg, args, config, shifterSettings);

                    // copy defaults in shifter if we are setting override to false
                    if(editedSense == WS_API.FIELDS.SENSES.OVERRIDE && !shifterSettings[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE])
                    {
                        copySenses(config, shifterSettings);
                        shifterSettings[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE] = false;
                    }

                    MENU.showEditSenses(shifterKey);
                    return;
                }
                else
                { 
                    let isValueSet = true;
                    let newValue = args.shift();
                    if(field == WS_API.FIELDS.NAME)
                    {
                        let oldShifterKey = shifterKey; 
                        shifterKey = newValue.trim();

                        if (shifterKey && shifterKey.length > 0)
                        {
                            if(!state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey])
                            {
                                state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey] = shifter;
                                delete state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][oldShifterKey];
                                sortShifters();
                            }
                            else
                            {
                                UTILS.chatError("Trying to add ShapeShifter " + shifterKey + " which already exists");
                                isValueSet = false;
                            }
                        }
                        else
                        {
                            isValueSet = false;
                        }

                    }
                    else if(field == WS_API.FIELDS.CHARACTER)
                    {
                        let charObj = findObjs({ type: 'character', name: newValue });
                        if(charObj && charObj.length == 1)
                        {
                            shifter[WS_API.FIELDS.SETTINGS][WS_API.FIELDS.ID] = charObj[0].get('id');
                            shifter[WS_API.FIELDS.SETTINGS][field] = newValue;

                            const shifterControlledBy = charObj[0].get("controlledby");
                            _.each(shifter[WS_API.FIELDS.SHAPES], (shape) => {
                                let shapeObj = findObjs({ type: 'character', id: shape[WS_API.FIELDS.ID] });
                                if (shapeObj && shapeObj.length == 1)
                                    shapeObj[0].set({controlledby: shifterControlledBy, inplayerjournals: shifterControlledBy});
                            });
                        }
                        else
                        {
                            UTILS.chatError("Cannot find character [" + newValue + "] in the journal");
                            isValueSet = false;
                        }
                    }
                    else if(field == WS_API.FIELDS.ISDRUID)
                    {
                        shifter[WS_API.FIELDS.SETTINGS][WS_API.FIELDS.ISDRUID] = !shifter[WS_API.FIELDS.SETTINGS][WS_API.FIELDS.ISDRUID];
                    }
                    else
                    {
                        shifter[WS_API.FIELDS.SETTINGS][field] = newValue;
                    }

                    if(isValueSet)
                        MENU.showEditShifter(shifterKey);
                }
            }
            else
                MENU.showEditShifter(shifterKey);
        }
        else
        {
            UTILS.chatError("cannot find shifter [" + shifterKey + "]");
        }
    };

    const handleInputEditShape = (msg, args, config) => 
    {
        const shifterKey = args.shift();
        let shifter = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey];
        if (shifter)
        {
            let shapeKey = args.shift();
            let shape = shifter[WS_API.FIELDS.SHAPES][shapeKey];
            if (shape)
            {
                let field = args.shift();
                if (field)
                {
                    if (field == WS_API.FIELDS.SENSES.ROOT)
                    {
                        const editedSense = handleInputEditSenses(msg, args, config, shape);

                        // copy defaults in shape if we are setting override to false
                        if(editedSense == WS_API.FIELDS.SENSES.OVERRIDE && !shape[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE])
                        {
                            copySenses(config, shape);
                            shape[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE] = false;
                        }

                        MENU.showEditSenses(shifterKey, shapeKey);
                    }
                    else
                    {
                        let newValue = args.shift();

                        if(field == WS_API.FIELDS.NAME)
                        {
                            let oldShapeKey = shapeKey;
                            shapeKey = newValue.trim();
                            if (shapeKey && shapeKey.length > 0)
                            {
                                if(!shifter[WS_API.FIELDS.SHAPES][shapeKey])
                                {
                                    shifter[WS_API.FIELDS.SHAPES][shapeKey] = shape;
                                    delete shifter[WS_API.FIELDS.SHAPES][oldShapeKey];
                                    sortShapes(shifter);
                                    MENU.showEditShape(shifterKey, shapeKey);
                                }
                                else
                                {
                                    UTILS.chatError("Trying to rename shape to " + shapeKey + " which already exists");
                                }
                            }
                        }
                        else
                        {
                            shape[field] = newValue;
                            MENU.showEditShape(shifterKey, shapeKey);
                        }
                    }
                }
                else
                {
                    MENU.showEditShape(shifterKey, shapeKey);
                }
            }
            else
            {
                UTILS.chatError("cannot find shape [" + shapeKey + "]");
            }
        }
        else
        {
            UTILS.chatError("cannot find shifter [" + shifterKey + "]");
        }

    };

    const handleInputEditConfig = (msg, args, config) => 
    {
        switch (args.shift())
        {
            case WS_API.FIELDS.SEP:
            {
                config.SEP = args.shift();
                MENU.updateConfig();
            }
            break;

            case WS_API.FIELDS.ENABLE_DEBUG:
            {
                config[WS_API.FIELDS.ENABLE_DEBUG] = !config[WS_API.FIELDS.ENABLE_DEBUG];
                UTILS.debugEnable(config[WS_API.FIELDS.ENABLE_DEBUG])
                MENU.updateConfig();
            }
            break;

            case WS_API.FIELDS.TARGET.CHAR_DATA:
            {
                const dataRoot = args.shift();
                if (dataRoot == WS_API.FIELDS.CHAR_DATA.PC_ROOT || dataRoot == WS_API.FIELDS.CHAR_DATA.NPC_ROOT)
                {
                    const field = args.shift();
                    if (field && field !== "")
                    {
                        let newValue = args.shift()
                        config[dataRoot][field] = newValue == WS_API.CMD.TOGGLE ? !config[dataRoot][field] : newValue;
                    }
                    
                    MENU.showEditCharData(dataRoot);
                    return;
                }
            }
            break;

            case WS_API.FIELDS.SENSES.ROOT:
            {
                const editedSense = handleInputEditSenses(msg, args, config, config);
                if(editedSense && editedSense !== WS_API.FIELDS.SENSES.OVERRIDE)
                {
                    let newSenseValue = config[WS_API.FIELDS.SENSES.ROOT][editedSense];
                    
                    // update default senses on all shifters/shapes that are not overriding
                    _.each(state[WS_API.STATENAME][WS_API.DATA_SHIFTERS], (shifterValue, shifterId) => {
                        let shifterSettings = shifterValue[WS_API.FIELDS.SETTINGS];

                        // copy defaults in shifters
                        if (!shifterSettings[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE])
                        {
                            shifterSettings[WS_API.FIELDS.SENSES.ROOT][editedSense] = newSenseValue;
                        }

                        _.each(shifterValue[WS_API.FIELDS.SHAPES], (shapeValue, shapeId) => {
                            // copy defaults in shapes
                            if (!shapeValue[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE])
                            {
                                shapeValue[WS_API.FIELDS.SENSES.ROOT][editedSense] = newSenseValue;
                            }
                        });
                    });
                }

                MENU.showEditSenses();
                return;
            }
            break;

            case WS_API.FIELDS.DRUID_WS_RES:
            {
                config[WS_API.FIELDS.DRUID_WS_RES] = args.shift();
            }
            break;

            case WS_API.FIELDS.MUTE_SHIFT:
            {
                config[WS_API.FIELDS.MUTE_SHIFT] = !config[WS_API.FIELDS.MUTE_SHIFT];
            }
            break;

        }

        MENU.showConfigMenu();
    };

    async function handleInputImportShapeFolder(msg, args, config) 
    {
        const shifterKey = args.shift();
        let shifter = state[WS_API.STATENAME][WS_API.DATA_SHIFTERS][shifterKey];
        if (shifter)
        {
            const folderName = args.shift();
            const searchSubfolders = args.shift() == 'yes';
            let removePrefix = args.shift();
            if (removePrefix == "")
                removePrefix = null;

            let folderShapes = UTILS.findCharactersInFolder(folderName, searchSubfolders);
            if(folderShapes)
            {
                if (WS_API.DEBUG)
                {
                    let debugShapeNames = "";
                    _.each(folderShapes, function(shape) { debugShapeNames += shape.get("name") + ", "; });
                    UTILS.chat("shapes found in input folder = " + debugShapeNames);
                }

                UTILS.chat("start importing shapes...");
                let importedShapes = 0;

                for (let shapeIndex = folderShapes.length - 1; shapeIndex >= 0; --shapeIndex) {
                    let shape = folderShapes[shapeIndex]; 
                    let shapeObj = findObjs({ type: 'character', id: shape.id })[0];                                                            
                    if (shapeObj)
                    {
                        let newName = shapeObj.get("name");
                        if (removePrefix && newName.startsWith(removePrefix))
                        {
                            newName = newName.slice(removePrefix.length);
                        }

                        const shapeId = newName;
                        newName = shifterKey + " - " + newName;

                        // add shape to shifter
                        await addShapeToShifter(config, shifter, shapeObj, newName, shapeId, false).then(
                            (ret) => { if (ret) importedShapes += 1; });
                    }
                }

                if (importedShapes > 0)
                {
                    sortShapes(shifter);
                    MENU.showEditShifter(shifterKey);
                    UTILS.chat("Imported " + importedShapes + "/" + folderShapes.length + " Shapes from folder [" + folderName + "]");
                }

                if (importedShapes < folderShapes.length)
                {
                    UTILS.chat("Not all shapes were imported, please check for errors " + (importedShapes > 0 ? "above the menu" : ""));
                }
            }
            else
            {
                UTILS.chatError("Cannot find any shapes in the input folder  [" + folderName + "]");
            }
        }
        else
        {
            UTILS.chatError("Trying to add shape to ShapeShifter " + shifterKey + " which doesn't exist");
            MENU.showShifters();
        }                                                
    }

    const handleInput = (msg) => {
        if (msg.type === "api" && msg.content.indexOf(WS_API.CMD.ROOT) == 0)
        {
            let config = state[WS_API.STATENAME][WS_API.DATA_CONFIG];
            const args = msg.content.split(config.SEP);
            args.shift(); // remove WS_API.CMD.ROOT
            if(args.length == 0)
            {
                if (!msg.selected)
                {
                    if (playerIsGM(msg.playerid))
                    {
                        MENU.showConfigMenu();
                    }
                    else
                    {
                        UTILS.chatToPlayer(msg.who, WS_API.CMD.USAGE);
                    }
                    return;
                }

                const tokenObj = getObj(msg.selected[0]._type, msg.selected[0]._id);
                const obj = findShifterData(tokenObj);
                if (obj)
                {
                    if (playerIsGM(msg.playerid) || obj.shifterControlledby.search(msg.playerid) >= 0 || obj.shifterControlledby.search("all") >= 0)
                    {
                        MENU.showShapeShiftMenu(msg.who, msg.playerid, obj.shifterId, obj.shifter[WS_API.FIELDS.SHAPES]);
                    }
                    else
                    {
                        UTILS.chatErrorToPlayer(msg.who, "Trying to shapeshift on a token you don't have control over");
                    }
                }
                else {
                    UTILS.chatErrorToPlayer(msg.who, "Cannot find ShapeShifter for the selected token");
                }
                return;
            }
            else 
            {
                let cmd = args.shift();

                if (cmd == WS_API.CMD.SHIFT)
                {
                    handleInputShift(msg, args, config);
                }
                else if (playerIsGM(msg.playerid))
                {
                    // GM ONLY COMMANDS
                    switch (cmd)
                    {
                        case WS_API.CMD.SHOW_SHIFTERS:
                        {
                            MENU.showShifters();
                        }
                        break;

                        case WS_API.CMD.CONFIG:
                        {
                            switch (args.shift())
                            {
                                case WS_API.CMD.ADD:
                                {
                                    switch (args.shift())
                                    {
                                        case WS_API.FIELDS.TARGET.SHIFTER:  handleInputAddShifter(msg, args, config); break;
                                        case WS_API.FIELDS.TARGET.SHAPE:    handleInputAddShape(msg, args, config); break;
                                    }
                                }
                                break;

                                case WS_API.CMD.REMOVE:
                                {
                                    if (args.shift() == 'no')
                                        return;

                                    switch (args.shift())
                                    {
                                        case WS_API.FIELDS.TARGET.SHIFTER:  handleInputRemoveShifter(msg, args, config); break;
                                        case WS_API.FIELDS.TARGET.SHAPE:    handleInputRemoveShape(msg, args, config); break;
                                    }
                                }
                                break;

                                case WS_API.CMD.EDIT:
                                {
                                    switch (args.shift())
                                    {
                                        case WS_API.FIELDS.TARGET.SHIFTER:  handleInputEditShifter(msg, args, config); break;
                                        case WS_API.FIELDS.TARGET.SHAPE:    handleInputEditShape(msg, args, config); break;
                                        case WS_API.FIELDS.TARGET.CONFIG:   handleInputEditConfig(msg, args, config); break;
                                    }
                                }
                                break;

                                case WS_API.CMD.RESET:
                                {
                                    if (args.shift() == 'no')
                                        return;

                                    setDefaults(true);
                                }
                                break;

                                case WS_API.CMD.IMPORT:
                                {
                                    switch (args.shift())
                                    {
                                        case WS_API.FIELDS.TARGET.SHAPEFOLDER: handleInputImportShapeFolder(msg, args, config); break;
                                    }
                                }
                                break;

                                default: MENU.showConfigMenu();
                            }
                        }
                        break;

                        case WS_API.CMD.HELP:
                        {
                            UTILS.chat(WS_API.CMD.USAGE);
                        }
                        break;
                    }
                }
            }
        }
    };

    const handleAddToken = (token) => 
    {
        let obj = findShifterData(token, true);
        if(obj)
        {
            let shifterSettings = obj.shifter[WS_API.FIELDS.SETTINGS];
            obj.isGM = true;
            obj.ignoreDruidResource = true;
            obj.who = "gm";
            obj.targetShapeName = shifterSettings[WS_API.FIELDS.CURRENT_SHAPE];

            if (obj.targetShapeName != WS_API.SETTINGS.BASE_SHAPE)
            {
                obj.targetShape = obj.shifter[WS_API.FIELDS.SHAPES][obj.targetShapeName];
                if (!obj.targetShape)
                {
                    UTILS.chatError("Cannot find shape [" + obj.targetShapeName + "] for ShapeShifter: " + obj.shifterId);
                    return;
                }

                doShapeShift(obj).then((ret) => {
                    if (ret)
                    {
                        UTILS.chat("Dropping shifter token, transforming " + obj.shifterId + " into " + obj.targetShapeName);
                    }
                    else 
                    {
                        UTILS.chatError("Dropping shifter token, cannot transform " + obj.shifterId + " into " + obj.targetShapeName);
                    }
                });
            }
            else
            {
                // make sure bars are setup properly on token drop
                setTokenBarValues(token, getTokenBarData(shifterSettings, obj.shifterCharacterId, true, shifterSettings[WS_API.FIELDS.ISNPC]), obj.shifterControlledby);
            }
        }
    };

    const upgradeVersion = () => {
        const apiState = state[WS_API.STATENAME];
        const currentVersion = apiState[WS_API.DATA_CONFIG].VERSION;
        const newConfig = WS_API.DEFAULT_CONFIG;

        let config = apiState[WS_API.DATA_CONFIG];
        let shifters = apiState[WS_API.DATA_SHIFTERS];

        if (UTILS.compareVersion(currentVersion, "1.0.2") < 0)
        {
            const npcFields = WS_API.DEPRECATED.NPC_DATA;
            config[npcFields.ROOT] = {};
            config[npcFields.ROOT][npcFields.HP_CACHE] = newConfig[npcFields.ROOT][npcFields.HP_CACHE];
            config[npcFields.ROOT][npcFields.HP]       = newConfig[npcFields.ROOT][npcFields.HP];
            config[npcFields.ROOT][npcFields.AC]       = newConfig[npcFields.ROOT][npcFields.AC];
            config[npcFields.ROOT][npcFields.SPEED]    = newConfig[npcFields.ROOT][npcFields.SPEED];

            const pcFields = WS_API.DEPRECATED.PC_DATA;
            config[pcFields.ROOT] = {};
            config[pcFields.ROOT][pcFields.HP]        = newConfig[pcFields.ROOT][pcFields.HP];
            config[pcFields.ROOT][pcFields.AC]        = newConfig[pcFields.ROOT][pcFields.AC];
            config[pcFields.ROOT][pcFields.SPEED]     = newConfig[pcFields.ROOT][pcFields.SPEED];
        }

        if (UTILS.compareVersion(currentVersion, "1.0.4") < 0)
        {
            // add MAKEROLLPUBLIC field to shifters, default to true for non-npcs
            _.each(shifters, (value, shifterId) => {
                let shifterSettings = shifters[shifterId][WS_API.FIELDS.SETTINGS];
                shifterSettings[WS_API.DEPRECATED.MAKEROLLPUBLIC] = !shifterSettings[WS_API.FIELDS.ISNPC];
            });
        }

        if (UTILS.compareVersion(currentVersion, "1.0.5") < 0)
        {
            // updated separator to minimize collisions with names/strings
            if(config.SEP == "--")
                config.SEP = newConfig.SEP;
        }

        if (UTILS.compareVersion(currentVersion, "1.0.6") < 0)
        {
            // copy defaults in config
            copySenses(newConfig, config);

            _.each(shifters, (value, shifterId) => {
                let shifterSettings = shifters[shifterId][WS_API.FIELDS.SETTINGS];

                // copy defaults in all shifters
                copySenses(newConfig, shifterSettings);
                shifterSettings[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE] = false;

                _.each(shifters[shifterId][WS_API.FIELDS.SHAPES], (shapeValue, shapeId) => {
                    // copy defaults in all shapes
                    copySenses(newConfig, shapeValue);
                    shapeValue[WS_API.FIELDS.SENSES.ROOT][WS_API.FIELDS.SENSES.OVERRIDE] = false;
                });
            });
        }

        if (UTILS.compareVersion(currentVersion, "1.0.7") < 0)
        {
            config[WS_API.FIELDS.CHAR_DATA.NPC_ROOT][WS_API.DEPRECATED.NPC_DATA.SENSES] = newConfig[WS_API.FIELDS.CHAR_DATA.NPC_ROOT][WS_API.DEPRECATED.NPC_DATA.SENSES];
        }

        if (UTILS.compareVersion(currentVersion, "1.2") < 0)
        {
            // cache stats for all shapes
            _.each(shifters, (shifterValue, shifterId) => {
                _.each(shifters[shifterId][WS_API.FIELDS.SHAPES], (shapeValue, shapeId) => {
                    cacheCharacterData(shapeValue);
                });
            });
        }

        if (UTILS.compareVersion(currentVersion, "1.4.0") < 0)
        {
            let pcDataRoot = config[WS_API.FIELDS.CHAR_DATA.PC_ROOT];
            let npcDataRoot = config[WS_API.FIELDS.CHAR_DATA.NPC_ROOT];

            // convert MAKEROLLPUBLIC to separate settings
            // calculate majority of values across shifters separately for PCs and NPCs to use as default in the new setting
            let forceCountNPC = 0;
            let forceCountPC = 0;
            _.each(shifters, (shifterValue, shifterId) => {
                let shifterSettings = shifterValue[WS_API.FIELDS.SETTINGS];
                let oldVal = shifterSettings[WS_API.DEPRECATED.MAKEROLLPUBLIC];
                if (oldVal != null)
                {
                    let sign = oldVal ? 1 : -1;
                    if (shifterSettings[WS_API.FIELDS.ISNPC])
                    {
                        forceCountNPC = forceCountNPC + 1 * sign;
                    }
                    else
                    {
                        forceCountPC = forceCountPC + 1 * sign;
                    }

                    delete shifterSettings[WS_API.DEPRECATED.MAKEROLLPUBLIC];
                }
            });

            // new default for NPCs is FALSE, hence we need a majority to be previously set to true
            let forceRoll = forceCountNPC > 0;
            npcDataRoot[WS_API.FIELDS.CHAR_DATA.FORCEROLL_NEVER_WHISPER] = forceRoll;
            npcDataRoot[WS_API.FIELDS.CHAR_DATA.FORCEROLL_TOGGLE_ADVANTAGE] = forceRoll;
            npcDataRoot[WS_API.FIELDS.CHAR_DATA.FORCEROLL_MANUAL_DAMAGEROLL] = forceRoll;

            // new default for PCs is TRUE, hence we need a tie or a majority to be previously set to true
            forceRoll = forceCountPC >= 0;
            pcDataRoot[WS_API.FIELDS.CHAR_DATA.FORCEROLL_NEVER_WHISPER] = forceRoll;
            pcDataRoot[WS_API.FIELDS.CHAR_DATA.FORCEROLL_TOGGLE_ADVANTAGE] = forceRoll;
            pcDataRoot[WS_API.FIELDS.CHAR_DATA.FORCEROLL_MANUAL_DAMAGEROLL] = forceRoll;

            // upgrade token bar data from HP/AC/SPEED to BAR1/2/3 settings
            let tokenDataRoot = config[WS_API.DEPRECATED.TOKEN_DATA.ROOT];

            function upgradeTokenDataValue(dataRoot, tokenKey, dataKey)
            {
                let barIndex = tokenDataRoot[tokenKey];
                if (barIndex == WS_API.FIELDS.CHAR_DATA.BAR_1 || barIndex == WS_API.FIELDS.CHAR_DATA.BAR_2 || barIndex == WS_API.FIELDS.CHAR_DATA.BAR_3)
                {
                    let dataValue = dataRoot[dataKey];
                    dataRoot[barIndex] = (dataValue && dataValue !== "") ? dataValue : "";
                    delete dataRoot[dataKey];
                }
            }

            upgradeTokenDataValue(pcDataRoot,  WS_API.DEPRECATED.TOKEN_DATA.HP,    WS_API.DEPRECATED.PC_DATA.HP);
            upgradeTokenDataValue(pcDataRoot,  WS_API.DEPRECATED.TOKEN_DATA.AC,    WS_API.DEPRECATED.PC_DATA.AC);
            upgradeTokenDataValue(pcDataRoot,  WS_API.DEPRECATED.TOKEN_DATA.SPEED, WS_API.DEPRECATED.PC_DATA.SPEED);
            upgradeTokenDataValue(npcDataRoot, WS_API.DEPRECATED.TOKEN_DATA.HP,    WS_API.DEPRECATED.NPC_DATA.HP);
            upgradeTokenDataValue(npcDataRoot, WS_API.DEPRECATED.TOKEN_DATA.AC,    WS_API.DEPRECATED.NPC_DATA.AC);
            upgradeTokenDataValue(npcDataRoot, WS_API.DEPRECATED.TOKEN_DATA.SPEED, WS_API.DEPRECATED.NPC_DATA.SPEED);

            delete config[WS_API.DEPRECATED.TOKEN_DATA.ROOT];
        }

        if (UTILS.compareVersion(currentVersion, "1.4.1") < 0)
        {
            // updated separator to make commands more readable
            if (config.SEP == "###")
                config.SEP = newConfig.SEP;

            // new enable debug field
            config[WS_API.FIELDS.ENABLE_DEBUG] = false;

            // make sure all defaults for fields added in 1.4.0 are properly set
            {
                function setCharDataDefault(dataRoot, key, val)
                {
                    if (dataRoot[key] == null || dataRoot[key] == "" || reset)
                    {
                        dataRoot[key] = val;
                    }
                }

                let pcDataRoot = config[WS_API.FIELDS.CHAR_DATA.PC_ROOT];
                let npcDataRoot = config[WS_API.FIELDS.CHAR_DATA.NPC_ROOT];

                setCharDataDefault(pcDataRoot, WS_API.FIELDS.CHAR_DATA.HP, WS_API.DEFAULT_CONFIG.PC_DATA.HP);
                setCharDataDefault(pcDataRoot, WS_API.FIELDS.CHAR_DATA.SPEED, WS_API.DEFAULT_CONFIG.PC_DATA.SPEED);
                setCharDataDefault(npcDataRoot, WS_API.FIELDS.CHAR_DATA.HP, WS_API.DEFAULT_CONFIG.NPC_DATA.HP);
                setCharDataDefault(npcDataRoot, WS_API.FIELDS.CHAR_DATA.SPEED, WS_API.DEFAULT_CONFIG.NPC_DATA.SPEED);
                setCharDataDefault(npcDataRoot, WS_API.FIELDS.CHAR_DATA.SENSES, WS_API.DEFAULT_CONFIG.NPC_DATA.SENSES);
            }
        }

        config.VERSION = WS_API.VERSION;
    };

    async function setDefaults(reset)
    {
        let oldVersionDetected = null;
        let apiState = state[WS_API.STATENAME];

        // check for basic state
        if(!apiState || typeof apiState !== 'object' || reset)
        {
            if(state[WS_API.STATENAME])
            {
                _.each(state[WS_API.STATENAME][WS_API.DATA_SHIFTERS], 
                    (shifter) => {
                        _.each(shifter[WS_API.FIELDS.SHAPES], (shape) => {
                            removeShape(shape);
                        });
                });                
            }

            state[WS_API.STATENAME] = {};
            apiState = state[WS_API.STATENAME];
            reset = true;
        }
 
        // check version
        let config = apiState[WS_API.DATA_CONFIG];

        if (!apiState[WS_API.DATA_CONFIG] || typeof apiState[WS_API.DATA_CONFIG] !== 'object' || reset) 
        {
            apiState[WS_API.DATA_CONFIG] = WS_API.DEFAULT_CONFIG;
            apiState[WS_API.DATA_CONFIG].VERSION = WS_API.VERSION;
            config = apiState[WS_API.DATA_CONFIG];
            reset = true;
        }
        else if (UTILS.compareVersion(apiState[WS_API.DATA_CONFIG].VERSION, WS_API.VERSION) < 0)
        {
            oldVersionDetected = apiState[WS_API.DATA_CONFIG].VERSION;
            upgradeVersion();
        }

        // validate separator
        if (!config.SEP || config.SEP == "" || reset)
        {
            UTILS.debugLog("resetting separator");
            config.SEP = WS_API.DEFAULT_CONFIG.SEP;
        }

        if (!apiState[WS_API.DATA_SHIFTERS] || typeof apiState[WS_API.DATA_SHIFTERS] !== 'object' || reset)
        {
            UTILS.debugLog("resetting DATA_SHIFTERS");
            apiState[WS_API.DATA_SHIFTERS] = {};
        }

        MENU.updateConfig();

        if (reset || oldVersionDetected)
        {
            MENU.showConfigMenu(true);

            if (oldVersionDetected)
            {
                _.each(WS_API.CHANGELOG, function (changes, version) 
                    {
                        if (UTILS.compareVersion(oldVersionDetected, version) < 0)
                            UTILS.chat("Updated to " + version + ": " + changes);
                    });

                UTILS.chat("New version detected, updated from " + oldVersionDetected + " to " + WS_API.VERSION);
            }
        }
    }

    async function start()
    {
        // check install
        if (!UTILS.VERSION || UTILS.compareVersion(UTILS.VERSION, WS_API.REQUIRED_HELPER_VERSION) < 0)
        {
            UTILS.chatError("This API version " + WS_API.VERSION + " requires WildUtils version " + WS_API.REQUIRED_HELPER_VERSION + ", please update your WildHelpers script");
            return;
        }

        await setDefaults();

        // register event handlers
        on('chat:message', handleInput);
        on('add:token', function (t) {
            _.delay(() => {
                handleAddToken(t);
            }, 100);
        });

        log(WS_API.NAME + ' v' + WS_API.VERSION + " Ready! WildUtils v" + UTILS.VERSION);
        UTILS.chat("API v" + WS_API.VERSION + " Ready! command: " + WS_API.CMD.ROOT);
    }
    
    return {
        start
    };
})();


on('ready', () => { 
    'use strict';

    WildShape.start();
});
