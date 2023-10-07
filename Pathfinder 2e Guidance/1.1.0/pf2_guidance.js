var Guidance = Guidance || function () {
    "use strict";

    const version = "v1.1";
    const guidanceWelcome = "Welcome to Guidance " + version + " for Pathfinder 2nd edition! <p>This tool assists Pathfinder 2e GMs in Roll20.</p><p>Guidance allows you to import stat blocks from Archive of Nethys and PFS Society Modules, into the NPC tab of thePathfinder 2 character sheet.</p><p>To use Guidance, Click on a token that has been linked to a character sheet and type the command.</p><H3>Here are the commands currently available:</h3><p><strong>!pf_npc</strong> - When a token has been linked to a character sheet, it will read the statblock from the <em>GM Notes</em> sectionof the <em>character sheet</em> and populate the appropriate values in the NPC tab of the character sheet. It also configuresother details about the linked token: HP, AC, and Name. It will generate token macros for Initiative, Saves, and allparsed weapon attacks.</p><p><strong>usage</strong>: Click the token that represents the NPC and type <code>!pf_npc</code> into chat</p><p><strong>!pf_clean</strong> - This command will erase an entire character sheet. Note that you must type &quot;CONFIRM&quot; to allow it to delete.</p><p><strong>usage</strong>: Click the token that represents the NPC and type <code>!pf_clean CONFIRM</code> into chat</p><p><strong>!pf_token</strong> - This command configures the NPC token for GM use. It verifies the name and other details can only be seen bythe GM and will link AC and Hitpoints to the token&#39;s indicators.</p><p><strong>usage</strong>: Click the token that represents the NPC and type <code>!pf_token</code> into chat</p><p><strong>!pf_pcbuilder</strong> - <strong><em>BETA</em></strong> This command allows you to import a player character from PathBuilder. Generate the JSON as you would for Foundry, and then copy it and put it into the &quot;Bio &amp; Info&quot; section of the character sheet (middle tab). Thenselect the token and run this command. I will import the character and do some basic configuration of the Token.</p><p><strong>usage</strong>: Click the token that represents the NPC and type <code>!pf_pcbuilder</code> into chat</p><p><strong>!pf_pctoken</strong> - <strong><em>BETA</em></strong> The command configures a token for a player character. When you select the token and run this command,it will fix a number of common problems with the token to make it usable in Roll20 by players. If the token is not linkedto a character sheet, it will put the RED X over the token to make it easy to identify.</p><p><strong>usage</strong>: Click the token that represents the NPC and type <code>pf_pctoken</code> into chat</p><p>If you find any issues, feel free to reach out to me <a href=\"https://app.roll20.net/users/927625/kahn265\">HERE</a>.</p>";
    const guidanceGreeting = "Greetings, I am Guidance. I am here to assist you working with your game. To learn more, I created a welcome guide in the journal section.";

    let debugMode = false

    // commands
    const prefix = "!pf_";
    const commandDebug = prefix + "debug";
    const commandHelp = prefix + "help";
    const commandToken = prefix + "token";
    const commandClean = prefix + "clean";
    const commandPopulate = prefix + "npc";
    const commandPathBuilder = prefix + "pcbuilder";
    const commandPCToken = prefix + "pctoken";
    const allTraits = "Aftermath,All Ancestries,Archetype,Attack,Aura,Cantrip,Charm,Class,Concentrate,Consecration,Contingency,Curse,Darkness,Death,Dedication,Detection,Deviant,Disease,Downtime,Emotion,Experiment,Exploration,Extradimensional,Fear,Flourish,Focus,Fortune,General,Healing,Incapacitation,Incarnate,Legacy,Light,Lineage,Linguistic,Magical,Manipulate,Mental,Metamagic,Mindshift,Minion,Misfortune,Morph,Move,Multiclass,Open,Polymorph,Possession,Prediction,Press,Radiation,Reckless,Revelation,Scrying,Secret,Skill,Sleep,Spellshape,Splash,Summoned,Tech,Telepathy,Teleportation,Varies,Virulent,Vocal,Chaotic,Evil,Good,Lawful,Aasimar,Anadi,Android,Aphorite,Ardande,Automaton,Azarketi,Beastkin,Catfolk,Changeling,Conrasu,Dhampir,Duskwalker,Dwarf,Elf,Fetchling,Fleshwarp,Ganzi,Geniekin,Ghoran,Gnoll,Gnome,Goblin,Goloma,Grippli,Half-Elf,Halfling,Half-Orc,Hobgoblin,Human,Ifrit,Kashrishi,Kitsune,Kobold,Leshy,Lizardfolk,Nagaji,Orc,Oread,Poppet,Ratfolk,Reflection,Shisk,Shoony,Skeleton,Sprite,Strix,Suli,Sylph,Talos,Tengu,Tiefling,Undine,Vanara,Vishkanya,Adjusted,Aquadynamic,Bulwark,Comfort,Flexible,Hindering,Inscribed,Laminar,Noisy,Ponderous,Alchemist,Barbarian,Bard,Champion,Cleric,Druid,Fighter,Gunslinger,Inventor,Investigator,Kineticist,Magus,Monk,Oracle,Psychic,Ranger,Rogue,Sorcerer,Summoner,Swashbuckler,Thaumaturge,Witch,Wizard,Additive,Amp,Composite,Composition,Cursebound,Eidolon,Esoterica,Evolution,Finisher,Hex,Impulse,Infused,Infusion,Litany,Modification,Oath,Overflow,Psyche,Rage,Social,Spellshot,Stance,Tandem,Unstable,Vigilante,Aberration,Animal,Astral,Beast,Celestial,Construct,Dragon,Dream,Elemental,Ethereal,Fey,Fiend,Fungus,Giant,Humanoid,Monitor,Negative,Ooze,Petitioner,Plant,Positive,Spirit,Time,Undead,Air,Earth,Fire,Metal,Water,Wood,Acid,Cold,Electricity,Force,Sonic,Vitality,Void,Adjustment,Alchemical,Apex,Artifact,Barding,Bomb,Bottled,Breath,Catalyst,Censer,Clockwork,Coda,Companion,Consumable,Contract,Cursed,Drug,Elixir,Entrench,Expandable,Figurehead,Focused,Fulu,Gadget,Grimoire,Intelligent,Invested,Lozenge,Mechanical,Missive,Mutagen,Oil,Potion,Precious,Processed,Relic,Saggorak,Scroll,Snare,Spellgun,Spellheart,Staff,Steam,Structure,Talisman,Tattoo,Trap,Wand,Complex,Environmental,Haunt,Weather,Aeon,Aesir,Agathion,Amphibious,Angel,Anugobu,Aquatic,Arcane,Archon,Asura,Azata,Boggard,Caligni,Charau-ka,Couatl,Daemon,Darvakka,Demon,Dero,Devil,Dinosaur,Div,Drow,Duergar,Formian,Genie,Ghost,Ghoul,Ghul,Golem,Gremlin,Grioth,Hag,Hantu,Herald,Ikeshti,Illusion,Incorporeal,Inevitable,Kaiju,Kami,Kovintus,Lilu,Locathah,Merfolk,Mindless,Morlock,Mortic,Mummy,Munavri,Mutant,Nymph,Oni,Paaridar,Phantom,Protean,Psychopomp,Qlippoth,Rakshasa,Ratajin,Sahkil,Samsaran,Sea Devil,Serpentfolk,Seugathi,Shabti,Shapechanger,Siktempora,Skelm,Skulk,Soulbound,Sporeborn,Spriggan,Stheno,Swarm,Tane,Tanggal,Titan,Troll,Troop,Urdefhan,Vampire,Velstrac,Wayang,Werecreature,Wight,Wild Hunt,Wraith,Wyrwood,Xulgath,Zombie,Erratic,Finite,Flowing,High Gravity,Immeasurable,Low Gravity,Metamorphic,Microgravity,Sentient,Shadow,Static,Strange Gravity,Subjective Gravity,Timeless,Unbounded,Contact,Ingested,Inhaled,Injury,Poison,Abjuration,Conjuration,Divination,Enchantment,Evocation,Necromancy,Transmutation,Auditory,Olfactory,Visual,Deflecting,Foldaway,Harnessed,Hefty,Integrated,Launching,Shield Throw,Divine,Occult,Primal,Agile,Attached,Backstabber,Backswing,Brace,Brutal,Capacity,Climbing,Cobbled,Combination,Concealable,Concussive,Critical Fusion,Deadly,Disarm,Double,Barrel,Fatal,Fatal Aim,Finesse,Forceful,Free-Hand,Grapple,Hampering,Injection,Jousting,Kickback,Modular,Mounted,Nonlethal,Parry,Portable,Propulsive,Range,Ranged Trip,Razing,Reach,Recovery,Reload,Repeating,Resonant,Scatter,Shove,Sweep,Tethered,Thrown,Training,Trip,Twin,Two-Hand,Unarmed,Vehicular,Versatile,Volley";

    //<editor-fold desc="Support Methods"  defaultstate="collapsed" >
    let getFirstMatchingElement = function (source, regex, ignoreEmpty) {
        let match = getMatchingArray(source, regex, ignoreEmpty);
        if (isEmpty(match[0])) {
            if (isEmpty(ignoreEmpty)) {
                return "";
            }
            return source;
        }
        return match[0].trim();
    }

    let getMatchingArray = function (source, regex) {
        let match = source.match(regex);
        if (match == null || match.length === 0 || !Array.isArray(match)) {
            debugLog("source=" + source + ", regex=" + regex + " didn't return an array");
            return [];
        }
        return match;
    }

    let isEmpty = function (valueToCheck) {
        if (valueToCheck === null || valueToCheck === undefined || valueToCheck === "") {
            debugLog(valueToCheck === null ? "null" : "undefined");
            debugLog(new Error().stack);
            return true;
        }
        return false;
    }
    let getSubstringStartingFrom = function (source, delimit) {
        let index = source.toLowerCase().indexOf(delimit.toLowerCase());
        if (index === -1) {
            return "";
        }
        return source.substr(index + delimit.length).trim();
    }

    /// Class that represents a NPC/Starship that is being worked on.
    class NPC {
        constructor(characterId, token, characterSheet) {
            this.characterId = characterId;
            this.npcToken = token;
            this.characterSheet = characterSheet;
        }
    }

    // Based on code from https://app.roll20.net/users/104025/the-aaron
    let generateUUID = (function () {
        let lastTimestamp = 0;
        let randomValues = [];
        let i = 0;
        return function () {
            let currentTimestamp = (new Date()).getTime();
            let duplicateTimestamp = currentTimestamp === lastTimestamp;
            lastTimestamp = currentTimestamp;

            let uuidArray = new Array(8);
            for (i = 7; i >= 0; i--) {
                uuidArray[i] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(currentTimestamp % 64);
                currentTimestamp = Math.floor(currentTimestamp / 64);
            }

            let uuid = uuidArray.join("");

            if (duplicateTimestamp) {
                for (i = 11; i >= 0 && randomValues[i] === 63; i--) {
                    randomValues[i] = 0;
                }
                randomValues[i]++;
            } else {
                for (i = 0; i < 12; i++) {
                    randomValues[i] = Math.floor(64 * Math.random());
                }
            }

            for (i = 0; i < 12; i++) {
                uuid += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(randomValues[i]);
            }

            return uuid;
        };
    })();

    let generateRowID = function () {
        return generateUUID().replace(/_/g, "Z");
    };

    let debugLog = function (text) {
        if (debugMode) {
            let timestamp = new Date().toUTCString();
            let stackTrace = new Error().stack.split("\n");
            log(`${timestamp} ${stackTrace[2].trim()} ${text}`);
        }
    };

    let getAttribute = function (characterId, attributeName) {
        return findObjs({
            _characterid: characterId,
            _type: "attribute",
            name: attributeName
        })[0];
    };

    let debugCharacterDetails = function (character) {
        let attributes = findObjs({
            _characterid: character.characterId,
            _type: "attribute",
        });
        for (const att of attributes) {
            log("{\"name\":" + att.get("name") + "\"," +
                "\"current\":\"" + att.get("current") + "\"," +
                "\"max\":\"" + att.get("max") + "\"}");
        }

        let abilities = findObjs({
            _characterid: character.characterId,
            _type: "ability",
        });
        for (const ab of abilities) {
            debugLog(ab.get("name"));
        }
    };

    // borrowed from https://app.roll20.net/users/901082/invincible-spleen in the forums
    let setAttribute = function (characterId, attributeName, newValue, operator) {
        if (!attributeName || !newValue) {
            return;
        }

        let foundAttribute = getAttribute(characterId, attributeName);
        let mod_newValue = {
            "+": function (num) {
                return num;
            },
            "-": function (num) {
                return -num;
            }
        };

        try {
            if (!foundAttribute) {
                if (typeof operator !== "undefined" && !isNaN(newValue)) {
                    newValue = mod_newValue[operator](newValue);
                }

                if (attributeName.includes("show")) {
                    return;
                }

                if (newValue === undefined || newValue === "" || newValue === 0) {
                    return;
                }

                createObj("attribute", {
                    name: attributeName,
                    current: newValue,
                    max: newValue,
                    _characterid: characterId
                });
                debugLog("DefaultAttributes: Initializing " + attributeName + " on character ID " + characterId + " with a value of " + newValue + ".");
            } else {
                if (typeof operator !== "undefined" && !isNaN(newValue) && !isNaN(foundAttribute.get("current"))) {
                    newValue = parseFloat(foundAttribute.get("current")) + parseFloat(mod_newValue[operator](newValue));
                }

                foundAttribute.set("current", newValue);
                foundAttribute.set("max", newValue);
                debugLog("DefaultAttributes: Setting " + attributeName + " on character ID " + characterId + " to a value of " + newValue + ".");
            }
        } catch (err) {
            log(err.message);
            log(err.stack);
        }
    };

    let getSelectedNPCs = function (selected) {
        let npcs = [];
        for (const t of selected) {
            debugLog(t + "adding");
            let token = findObjs(t)[0];
            let cid = token.get("represents");
            npcs.push(new NPC(cid, token, findObjs({_id: cid, _type: "character"})[0]));
        }
        return npcs;
    };

    let speakAsGuidanceToGM = function (text) {
        text = "/w gm  &{template:default} {{name=Guidance}} {{" + text + "}}";
        sendChat("Guidance", text);
    };

    let speakAsGuidanceToAll = function (text) {
        text = "&{template:default} {{name=Guidance}} {{" + text + "}}";
        sendChat("Guidance", text);
    };
    let toTitleCase = function (str) {
        str = str.toLowerCase().split(' ');
        for (let i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    }

    let cleanText = function (textToClean) {
        return textToClean
            .replaceAll(/<span\s*class="\w+-*hanging-indent/g, "~<span class=\"")
            .replaceAll("</p>", "~")
            .replaceAll("<br", "~<br")
            .replace(/(<([^>]+)>)/gi, " ")
            .replace(/&nbsp;|&amp;/gi, " ")
            .replace(/\s+/g, " ");
    };

    let eraseCharacter = function (c) {
        for (const attribute of findObjs({_characterid: c.characterId, _type: "attribute"})) {
            attribute.remove();
        }
        for (const ability of findObjs({_characterid: c.characterId, _type: "ability"})) {
            ability.remove();
        }
        for (let i = 1; i < 4; i++) {
            c.npcToken.set("bar" + i + "_value", "");
            c.npcToken.set("bar" + i + "_max", "");
        }

        speakAsGuidanceToGM("Removed all properties for " + c.characterSheet.get("name"));
        c.characterSheet.set("name", "Erased Character");
    }

    function populateStat(characterId, statBlock, regex, ...stats) {
        debugLog("Starting with = " + statBlock);
        debugLog("Starting with = " + stats[0]);
        let current = getFirstMatchingElement(statBlock, regex);
        statBlock = getSubstringStartingFrom(statBlock, current);
        statBlock = removeStartingDelimiters(statBlock);
        debugLog("returning = " + statBlock);

        if (current === "") {
            return statBlock;
        }
        current = current.replaceAll("~", "").trim();

        if (Array.isArray(stats)) {
            stats.forEach(stat => {
                setAttribute(characterId, stat, current);
            });
        } else {
            setAttribute(characterId, stats, current);
        }
        return statBlock;
    }

    let removeStartingDelimiters = function (statBlock) {
        statBlock = statBlock.trim();
        while (statBlock.startsWith(";") || statBlock.startsWith("~")) {
            if (statBlock.startsWith(";")) {
                statBlock = getSubstringStartingFrom(statBlock, ";");
            }
            if (statBlock.startsWith("~")) {
                statBlock = getSubstringStartingFrom(statBlock, "~");
            }
        }
        return statBlock;
    }

    //</editor-fold>

    //<editor-fold desc="on(ready) event"  defaultstate="collapsed" >
    on("ready", function () {
        speakAsGuidanceToGM(guidanceGreeting);
        let handoutName = "Welcome To Guidance";
        let objs = findObjs({name: handoutName, _type: "handout"});
        let userGuide;
        if (objs.length < 1) {
            debugLog("Handout not found - recreating");
            userGuide = createObj("handout", {
                name: handoutName
            });
        } else {
            userGuide = objs[0];
        }
        debugLog("Updating handout");
        userGuide.set("notes", guidanceWelcome);
        userGuide.get("gmnotes", function (gmNotes) {
            if (gmNotes.includes("debug")) {
                debugMode = true;
                speakAsGuidanceToGM("Debug Mode has been enabled");
            }
        });
    });
    //</editor-fold>

    on("chat:message", function (chatMessage) {
        if (chatMessage.type !== "api" || !playerIsGM(chatMessage.playerid)) {
            return;
        }

        let chatAPICommand = chatMessage.content.toLowerCase();

        if (chatMessage.selected === undefined) {
            speakAsGuidanceToGM("Please select a token representing a character for me to work with");
            return;
        }

        let selectedNPCs = getSelectedNPCs(chatMessage.selected);

        try {
            //<editor-fold desc="commandPCToken - Import a character from Pathbuilder">
            if (chatAPICommand.startsWith(commandPathBuilder)) {
                selectedNPCs.forEach(function (c) {
                    speakAsGuidanceToGM("Importing - just a moment...");
                    c.characterSheet.get("bio", function (notes) {
                        if (!notes.includes("will")
                            && !notes.includes("fort")
                            && !notes.includes("ref")) {
                            return;
                        }
                        if (debugMode) {
                            eraseCharacter(c);
                        }
                        parsePathBuilder(notes, c);
                        fixPlayerToken(c);
                    });
                });
                return;
            }
            //</editor-fold>

            //<editor-fold desc="commandPCToken - Configure the Player Character Token">
            if (chatAPICommand.startsWith(commandPCToken)) {
                selectedNPCs.forEach(function (c) {
                    fixPlayerToken(c);
                });
                return;
            }
            //</editor-fold>

            //<editor-fold desc="commandHelp - Show Help information for using Guidance">
            if (chatAPICommand.startsWith(commandHelp)) {
                speakAsGuidanceToGM(guidanceWelcome);
                return;
            }
            //</editor-fold>

            //<editor-fold desc="commandClean - Erase All Information on a character sheet">
            if (chatAPICommand.startsWith(commandClean)) {
                if (selectedNPCs.length > 1) {
                    speakAsGuidanceToGM("Please do not select more than 1 NPC at a time. This command is potentially dangerous.");
                    return;
                }
                let selectedNPC = selectedNPCs[0];
                if (chatAPICommand.includes("confirm")) {
                    eraseCharacter(selectedNPC);
                } else {
                    speakAsGuidanceToGM("Check usage for " + commandClean);
                }
                return;
            }
            //</editor-fold>

            //<editor-fold desc="commandDebug - Show Debug information for character linked to Token">
            if (chatAPICommand.startsWith(commandDebug)) {
                selectedNPCs.forEach(debugCharacterDetails);

                let macros = findObjs({
                    _type: "macro",
                });
                for (const ab of macros) {
                    debugLog(ab.get("name"));
                    debugLog(ab.get("action"));
                }
                return;
            }
            //</editor-fold>

            //<editor-fold desc="commandToken - Configure NPC Token linked to Sheet">
            if (chatAPICommand.startsWith(commandToken)) {
                selectedNPCs.forEach(configureToken);
                return;
            }
            //</editor-fold>

            //<editor-fold desc="commandPopulate - Populate NPC Character Sheet">
            if (chatAPICommand.startsWith(commandPopulate)) {
                selectedNPCs.forEach(function (c) {
                    c.characterSheet.get("gmnotes", function (gmNotes) {
                        if (!gmNotes.includes("Will")
                            && !gmNotes.includes("Fort")
                            && !gmNotes.includes("Ref")) {
                            speakAsGuidanceToGM("This does not appear to be a character statblock");
                            return;
                        }
                        eraseCharacter(c);
                        populateCharacterSheet(gmNotes, c);
                        configureToken(c);
                    });
                });
                return;
            }
            //</editor-fold>

        } catch (err) {
            speakAsGuidanceToGM("I have encountered an error with your command " + chatAPICommand);
            log(err.message);
            log(err.stack);
        }
    });

    //<editor-fold desc="configureToken - link the token stats to the NPC sheet and show the name">
    let configureToken = function (selectedNPC) {
        try {
            let characterId = selectedNPC.characterId;
            let npcToken = selectedNPC.npcToken;
            let characterSheet = selectedNPC.characterSheet;
            let hitPoints = getAttribute(characterId, "hit_points");
            let armorClass = getAttribute(characterId, "armor_class");

            debugLog("Configuring token for " + characterId + " - " + characterSheet.get("name"));
            npcToken.set("showname", true);
            npcToken.set("bar3_value", "AC " + armorClass.get("current"));
            npcToken.set("bar3_max", "-0");
            npcToken.set("bar1_value", "" + hitPoints.get("current"));
            npcToken.set("bar1_max", "" + hitPoints.get("current"));
            npcToken.set("bar1_link", hitPoints.id);
        } catch (err) {
            speakAsGuidanceToGM("There is a Token Configuration Error - Check to make sure the tokens are linked to the selected NPCs.");
            log(err.message);
            log(err.stack);
        }
    };
    //</editor-fold>

    ////////////////////////////////////////////////////////////////////////////////////////////////
    let parsePathBuilder = function (notes, character) {
        let workingNotes = notes.replace(/(<([^>]+)>)/gi, "").trim();
        debugLog(workingNotes);
        let cObj = JSON.parse(workingNotes).build;
        const characterId = character.characterId;
        const npcToken = character.npcToken;
        const characterSheet = character.characterSheet;

        try {
            characterSheet.set("name", cObj.name);
            npcToken.set("name", cObj.name);
            setAttribute(characterId, "ancestry_heritage", cObj.ancestry + " / " + cObj.heritage);
            setAttribute(characterId, "class", cObj.class);
            setAttribute(characterId, "background", cObj.background);
            setAttribute(characterId, "size", cObj.sizeName);
            setAttribute(characterId, "alignment", cObj.alignment);
            setAttribute(characterId, "deity", cObj.deity);
            setAttribute(characterId, "age", cObj.age);
            setAttribute(characterId, "gender_pronouns", cObj.gender);
            setAttribute(characterId, "level", cObj.level);
            setPlayerAttribute(characterId, "strength", cObj.abilities.str);
            setPlayerAttribute(characterId, "dexterity", cObj.abilities.dex);
            setPlayerAttribute(characterId, "constitution", cObj.abilities.con);
            setPlayerAttribute(characterId, "intelligence", cObj.abilities.int);
            setPlayerAttribute(characterId, "wisdom", cObj.abilities.wis);
            setPlayerAttribute(characterId, "charisma", cObj.abilities.cha);
            setAttribute(characterId, "speed", cObj.attributes.speed);
            setAttribute(characterId, "speed_bonus_total", cObj.attributes.ancestryhp);
            let hp = parseInt(cObj.attributes.classhp) + parseInt(cObj.attributes.bonushpPerLevel);
            setAttribute(characterId, "hit_points_class", hp);
            setAttribute(characterId, "hit_points_ancestry", cObj.attributes.ancestryhp);
            setAttribute(characterId, "acrobatics_rank", cObj.proficiencies.acrobatics);
            setAttribute(characterId, "arcana_rank", cObj.proficiencies.arcana);
            setAttribute(characterId, "athletics_rank", cObj.proficiencies.athletics);
            setAttribute(characterId, "crafting_rank", cObj.proficiencies.crafting);
            setAttribute(characterId, "deception_rank", cObj.proficiencies.deception);
            setAttribute(characterId, "diplomacy_rank", cObj.proficiencies.diplomacy);
            setAttribute(characterId, "intimidation_rank", cObj.proficiencies.intimidation);
            setAttribute(characterId, "medicine_rank", cObj.proficiencies.medicine);
            setAttribute(characterId, "nature_rank", cObj.proficiencies.nature);
            setAttribute(characterId, "occultism_rank", cObj.proficiencies.occultism);
            setAttribute(characterId, "performance_rank", cObj.proficiencies.performance);
            setAttribute(characterId, "religion_rank", cObj.proficiencies.religion);
            setAttribute(characterId, "society_rank", cObj.proficiencies.society);
            setAttribute(characterId, "stealth_rank", cObj.proficiencies.stealth);
            setAttribute(characterId, "survival_rank", cObj.proficiencies.survival);
            setAttribute(characterId, "thievery_rank", cObj.proficiencies.thievery);
            setAttribute(characterId, "perception_rank", cObj.proficiencies.perception);
            setAttribute(characterId, "saving_throws_fortitude_rank", cObj.proficiencies.fortitude);
            setAttribute(characterId, "saving_throws_reflex_rank", cObj.proficiencies.reflex);
            setAttribute(characterId, "saving_throws_will_rank", cObj.proficiencies.will);
            setAttribute(characterId, "class_dc_rank", cObj.proficiencies.classDC);
            let keyability = fullAttributeName(cObj.keyability);
            setAttribute(characterId, "class_dc_key_ability_select", "@{" + keyability + "_modifier}");
            setAttribute(characterId, "cp", cObj.money.cp);
            setAttribute(characterId, "sp", cObj.money.sp);
            setAttribute(characterId, "gp", cObj.money.gp);
            setAttribute(characterId, "pp", cObj.money.pp);
            setAttribute(characterId, "focus_points", cObj.focusPoints);

            for (const element of cObj.feats) {
                let guid = generateRowID();
                let featType = "";
                if (element[2].includes("Archetype")) {
                    featType = "archetype";
                } else if (element[2].includes("General")) {
                    featType = "general";
                } else if (element[2].includes("Skill")) {
                    featType = "skill";
                } else if (element[2].includes("Ancestry")) {
                    featType = "ancestry";
                } else {
                    featType = "class";
                }
                setAttribute(characterId, "repeating_feat-" + featType + "_" + guid + "_feat_" + featType, element[0]);
                setAttribute(characterId, "repeating_feat-" + featType + "_" + guid + "_feat_" + featType + "_level", element[3]);
                setAttribute(characterId, "repeating_feat-" + featType + "_" + guid + "_feat_" + featType + "_type", element[2]);
                setAttribute(characterId, "repeating_feat-" + featType + "_" + guid + "_toggles", "display,");
            }
            for (const element of cObj.specials) {
                let guid = generateRowID();
                setAttribute(characterId, "repeating_feat-ancestry_-" + guid + "_feat_ancestry", element);
                setAttribute(characterId, "repeating_feat-ancestry_-" + guid + "_feat_ancestry_type", "Special Ability");
                setAttribute(characterId, "repeating_feat-ancestry_-" + guid + "_toggles", "display,");
            }

            if (cObj.armor.length > 0) {
                let name = cObj.armor[0].display;
                if (isEmpty(name)) {
                    name = cObj.armor[0].name;
                }
                setAttribute(characterId, "armor_class_armor_name", name);
                setAttribute(characterId, "armor_class_item", cObj.acTotal.acItemBonus);
                if (cObj.armor.length > 1) {
                    name = cObj.armor[1].display;
                    if (isEmpty(name)) {
                        name = cObj.armor[1].name;
                    }
                    setAttribute(characterId, "armor_class_shield_name", name);
                    setAttribute(characterId, "armor_class_shield_ac_bonus", cObj.acTotal.shieldBonus);

                }
            }

            for (const element of cObj.lores) {
                let guid = generateRowID();
                setAttribute(characterId, "repeating_lore_" + guid + "_lore_name", element[0]);
                setAttribute(characterId, "repeating_lore_" + guid + "_lore_rank", element[2]);
                setAttribute(characterId, "repeating_lore_" + guid + "_toggles", "display,");
            }

            let weapon = false;
            for (const element of cObj.weapons) {
                let guid = generateRowID();
                weapon = true;
                setAttribute(characterId, "repeating_melee-strikes_" + guid + "_weapon", element.display);
                setAttribute(characterId, "repeating_melee-strikes_" + guid + "_toggles", "display,");
                setAttribute(characterId, "repeating_melee-strikes_" + guid + "_weapon_category", element.prof);
                setAttribute(characterId, "repeating_melee-strikes_" + guid + "_damage_dice", element.die);
                setAttribute(characterId, "repeating_melee-strikes_" + guid + "_damage_dice_size", element.die);
                //setAttribute(characterId, "repeating_melee-strikes_" + guid + "_damage" + element.damageType.toLowerCase(), 1);
                setAttribute(characterId, "repeating_melee-strikes_" + guid + "_damage_other", element.damageBonus);
            }
            if (weapon) {
                speakAsGuidanceToAll("I have detected a weapon. I don't have Range/Reload information, so I'm logging it as a Melee weapon. " +
                    "Regardless of category, it will still function for gaming. Check the compendium or Archives of Nethys for missing information.");
            }

            for (const element of cObj.formula[0].known) {
                let guid = generateRowID();
                if (element.includes("Mutagen") || element.includes("Tonic") || element.includes("Elixir")) {
                    let formulaName = getFirstMatchingElement(element, /.*?(?=\()/);
                    setAttribute(characterId, "repeating_elixirs_" + guid + "_name", formulaName);
                    let formulaType = getFirstMatchingElement(element, /(?<=\().*?(?=\))/);
                    setAttribute(characterId, "repeating_elixirs_" + guid + "_formula_type", formulaType);
                    setAttribute(characterId, "repeating_elixirs_" + guid + "_toggles", "display,");
                }
            }

            let focusSpells = getFocusStuff(cObj.focus, "Cantrips");
            for (const element of focusSpells) {
                let guid = generateRowID();
                setAttribute(characterId, "repeating_spellfocus_" + guid + "_name", element);
                setAttribute(characterId, "repeating_spellfocus_" + guid + "_spelllevel", "0");
                setAttribute(characterId, "repeating_spellfocus_" + guid + "_toggles", "display,");
            }

            focusSpells = getFocusStuff(cObj.focus, "Spells");
            for (const element of focusSpells) {
                let guid = generateRowID();
                setAttribute(characterId, "repeating_spellfocus_" + guid + "_name", element);
                setAttribute(characterId, "repeating_spellfocus_" + guid + "_toggles", "display,");
            }

            for (const element of cObj.spellCasters) {
                setAttribute(characterId, "magic_tradition_" + element.magicTradition + "_rank", element.proficiency);
                let spellType = "";
                if (element.innate) {
                    spellType = "spellinnate";
                } else {
                    spellType = "normalspells";
                }


                if (element.perDay.length > 0) {
                    setAttribute(characterId, "cantrips_per_day", element.perDay[0]);
                    for (let i = 1; i < element.perDay.length; i++) {
                        setAttribute(characterId, "level_" + i + "_per_day", element.perDay[i]);
                    }
                }
                for (const element2 of element.spells) {
                    let reference = "";
                    if (element2.spellLevel === 0 && spellType.startsWith("normalspells")) {
                        reference = "repeating_cantrip_";
                    } else {
                        reference = "repeating_" + spellType + "_";
                    }
                    for (const spellName in element2.list) {
                        reference = reference + generateRowID();
                        setAttribute(characterId, reference + "_name", spellName);
                        setAttribute(characterId, reference + "_spelllevel", element2.spellLevel);
                        setAttribute(characterId, reference + "_toggles", "display,");
                    }

                }
            }

            for (const element of cObj.equipment) {
                let guid = generateRowID();
                setAttribute(characterId, "repeating_items-other_" + guid + "_other-items", element[0]);
                setAttribute(characterId, "repeating_items-other_" + guid + "_other_quantity", element[1]);
                setAttribute(characterId, "repeating_items-other_" + guid + "_toggles", "display,");
            }
            let maxHP = getAttribute(characterId, "hit_points").get("max");
            setAttribute(characterId, "hit_points", maxHP);

            speakAsGuidanceToAll(cObj.name + " has been imported.");
        } catch (err) {
            speakAsGuidanceToGM("I have encountered an error importing this character.");
            log(err.message);
            log(err.stack);
        }
    }

    let getFocusStuff = function (obj, type) {
        let tradition = Object.keys(obj);
        let attribute = Object.keys(obj[tradition]);
        return obj[tradition][attribute]["focus" + toTitleCase(type)];
    }

    let fullAttributeName = function (x) {
        if (x.toLowerCase().startsWith("str")) {
            return "strength";
        } else if (x.toLowerCase().startsWith("dex")) {
            return "dexterity";
        } else if (x.toLowerCase().startsWith("con")) {
            return "constitution";
        } else if (x.toLowerCase().startsWith("int")) {
            return "intelligence";
        } else if (x.toLowerCase().startsWith("wis")) {
            return "wisdom";
        }
        return "charisma";
    }

    let fixPlayerToken = function (c) {
        let r = c.npcToken.get("represents");
        if (isEmpty(r)) {
            c.npcToken.set({statusmarkers: "dead"});
            speakAsGuidanceToGM("I've marked unlinked tokens with a red X");
            speakAsGuidanceToGM("Go into the settings for these tokens and set 'Represents Character' to the correct PC and rerun this command");
        } else {
            c.npcToken.set({
                has_bright_light_vision: true,
                showname: true,
                showplayers_name: true,
                playersedit_name: true,
                controlledby: "all",
                light_otherplayers: true,
                width: 70,
                height: 70
            });
            c.npcToken.set("dead", false);
            log("Token Represents = " + c.npcToken.get("represents"));
            log("Characterid = " + c.characterId);
            log("SheetID = " + c.characterSheet.get("_id"));
            setDefaultTokenForCharacter(c.characterSheet, c.npcToken);
            speakAsGuidanceToGM("I've configured the token for " + c.characterSheet.get("name") + "'s player");
        }
    }

    let setPlayerAttribute = function (characterId, attribute, score) {
        setAttribute(characterId, attribute, score);
        setAttribute(characterId, attribute + "_score", score);
        let modifier = Math.floor((parseInt(score) - 10) / 2);
        setAttribute(characterId, attribute + "_modifier", modifier);
        setAttribute(characterId, attribute + "_modifier_half", Math.floor(modifier / 2));
    }

    let populateCharacterSheet = function (gmNotes, selectedNPC) {
        const characterId = selectedNPC.characterId;
        const npcToken = selectedNPC.npcToken;
        const characterSheet = selectedNPC.characterSheet;
        let statBlock = cleanText(gmNotes).replaceAll("Damage", "DAMAGE");
        try {
            if (debugMode) {
                npcToken.set("gmnotes", statBlock);
            }
            setAttribute(characterId, "npc_type", "Creature");
            setAttribute(characterId, "sheet_type", "npc");

            let npcName = toTitleCase(getFirstMatchingElement(statBlock, /.*?(?=(Creature|Level).*\d+)/im));
            characterSheet.set("name", npcName);
            npcToken.set("name", npcName);

            statBlock = populateStat(characterId, statBlock, /(?<=(Creature|Level)\s+)\d+?(?=~|\s+)/si, "level");
            statBlock = populateStat(characterId, statBlock, /(?<=.*)(LG|NG|CG|LN|N|CN|LE|NE|CE)(?=~|\s+)/s, "alignment");
            statBlock = populateStat(characterId, statBlock, /(?<=.*)(Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal)(?=~|\s+)/si, "size");
            statBlock = populateStat(characterId, statBlock, /.*?(?=Source|Perception)/s, "traits");
            statBlock = populateStat(characterId, statBlock, /.*?(?=~|Perception)/s, "source");
            statBlock = populateStat(characterId, statBlock, /(?<=.*Perception).*?(?=[~;])/s, "npc_perception", "perception");
            statBlock = populateStat(characterId, statBlock, /.*?(?=~|Skills|Languages)/s, "senses");
            statBlock = populateStat(characterId, statBlock, /(?<=Languages).*?(?=Skills|~)/s, "languages");
            statBlock = getSubstringStartingFrom(statBlock, "Skills");

            ["Acrobatics", "Arcana", "Athletics", "Crafting", "Deception", "Diplomacy", "Intimidation", "Lore",
                "Medicine", "Nature", "Occultism", "Performance", "Religion", "Society", "Stealth", "Survival",
                "Thievery"].forEach(skill => {
                let re = new RegExp(`(?<=${skill}\\s).*?(?=\\s*[,~])`, 'gi');
                let skillDetail = getFirstMatchingElement(statBlock, re);

                skill = skill.toLowerCase();
                if (skillDetail.includes("(")) {
                    populateStat(characterId, skillDetail, /(?<=\().*?(?=\))/, skill + "_notes");
                    skillDetail = getFirstMatchingElement(skillDetail, /.+?(?=(\(|\,|$))/);
                }
                [skill, "npc_" + skill].forEach(stats => setAttribute(characterId, stats, skillDetail));
            });

            ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"].forEach(stat => {
                let s = stat.substring(0, 3);
                let re = new RegExp(`(?<=${s}\\s).*?(?=[,~])`, 'gi');
                statBlock = populateStat(characterId, statBlock, re, stat.toLowerCase() + "_modifier");
            });

            let senseAbilities = getFirstMatchingElement(statBlock, /^.*?(?=(AC\s|Items))/);
            senseAbilities = massageTheDataForAbilityParsing(senseAbilities);
            if (senseAbilities.length > 0) {
                let newRegex = new RegExp(/((([A-Z][a-z]+(\s|\-))+[\[\(])|([A-Z][a-z]+\s){2,}).*?(?=(~\s*[A-Z][a-z]*\s+)|$)/, "g");
                abilityHandler(characterId, senseAbilities, newRegex, parseInteractionAbility);
            }

            let hasItems = getFirstMatchingElement(statBlock, /.*?(?=AC\s+\d+)/).trim();
            if (hasItems.includes("Items")) {
                let items = getFirstMatchingElement(hasItems, /(?<=Items\W*).*?(?=(AC|$))/s, true).trim();
                let itemsArray = items.split(",");

                itemsArray.forEach(item => {
                    let attributeName = "repeating_items-worn_-" + generateRowID() + "_";
                    setAttribute(characterId, attributeName + "worn_item", item.trim());
                    setAttribute(characterId, attributeName + "worn_misc", item.trim());
                    setAttribute(characterId, attributeName + "toggles", "display,");
                });
            }

            statBlock = populateStat(characterId, statBlock, /(?<=\s*AC).*?(?=;)/, "ac", "armor_class", "npc_armor_class");
            statBlock = populateStat(characterId, statBlock, /(?<=Fort).*?(?=,)/, "npc_saving_throws_fortitude", "saving_throws_fortitude");
            statBlock = populateStat(characterId, statBlock, /(?<=Ref).*?(?=,)/, "npc_saving_throws_reflex", "saving_throws_reflex");
            let matchExtraSave = new RegExp(/(?<=Will\s[+\-]\d;).*?(?=(HP|;|~))/);
            if (matchExtraSave.test(statBlock)) {
                let saveDetails = getFirstMatchingElement(statBlock, matchExtraSave);
                setAttribute(characterId, "saving_throws_notes", saveDetails);
            }
            statBlock = populateStat(characterId, statBlock, /(?<=Will).*?(?=(HP|;|~))/, "npc_saving_throws_will", "saving_throws_will");

            let hitPointInformation = getFirstMatchingElement(statBlock, /(?<=HP).*?(?=[~;])/);
            if (hitPointInformation.includes(",")) {
                populateStat(characterId, hitPointInformation, /(?<=\,).*?(?=[~;])/, "hit_points_notes");
                hitPointInformation = getFirstMatchingElement(hitPointInformation, /\d+(?=\,)/);
            }
            ["npc_hit_points", "hit_points"].forEach(stats =>
                setAttribute(characterId, stats, hitPointInformation));

            populateStat(characterId, statBlock, /(?<=Immunities).*?(?=[~;])/, "immunities");
            populateStat(characterId, statBlock, /(?<=Weaknesses).*?(?=[~;])/, "weaknesses");
            populateStat(characterId, statBlock, /(?<=Resistances).*?(?=[~;])/, "resistances");

            // Defensive Abilities
            let defenseAbilities = getFirstMatchingElement(statBlock, /(?<=HP\s\d+).*?(?=Speed)/);
            defenseAbilities = massageTheDataForAbilityParsing(defenseAbilities);
            if (defenseAbilities.length > 0) {
                let newRegex = new RegExp(/((([A-Z][a-z]+\W)+([\[(]))|([A-Z][a-z]+\W){2,}).*?(?=(~\s*[A-Z][a-z]*\s+)|$)/, "gm");
                abilityHandler(characterId, defenseAbilities, newRegex, parseAutomaticAbility);
            }

            statBlock = populateStat(characterId, statBlock, /(?<=Speed).*?(?=~)/, "speed", "speed_base", "speed_notes");
            statBlock = massageTheDataForAbilityParsing(statBlock);
            statBlock = statBlock.replaceAll("EFFECT", "effect");

            statBlock = removeStartingDelimiters(statBlock);
            if (statBlock.startsWith("Melee")) {
                let newRegex = new RegExp(/Melee.*?(?=(~\s*[A-Z][a-z]+\s+)|Melee|Ranged|$)/, "g");
                statBlock = abilityHandler(characterId, statBlock, newRegex, parseAttackAbility);
            }

            statBlock = removeStartingDelimiters(statBlock);
            if (statBlock.startsWith("Ranged")) {
                let newRegex = new RegExp(/Ranged.*?(?=(~\s*[A-Z][a-z]+\s+)|Melee|Ranged|$)/, "g");
                statBlock = abilityHandler(characterId, statBlock, newRegex, parseAttackAbility);
            }

            statBlock = removeStartingDelimiters(statBlock);
            if (statBlock.includes("Spells") || statBlock.includes("Rituals")) {
                let newRegex = new RegExp(/(([A-Z][a-z]+\s(\w+\s)*)+(Spells|Rituals)).*?(?=(~\s*[A-Z][a-z]+\s+)|Melee|Ranged|$)/, "g");
                statBlock = statBlock.replaceAll("Constant", "CONSTANT");
                setAttribute(characterId, "toggles", "color:default.npcspellcasters");
                statBlock = abilityHandler(characterId, statBlock, newRegex, parseSpells);
                speakAsGuidanceToGM("WARNING! Spell placeholders are created, but details cannot be automatically populated. HOWEVER, Roll20 allows you to drag and drop spells from the compendium on to the appropriate spell section of the character sheet.");
            }

            statBlock = removeStartingDelimiters(statBlock);
            let newRegex = new RegExp(/(([A-Z][a-z]+\s){2,}|(([A-Z][a-z]+\s+)+[\[(])).*?(?=(~\s*[A-Z][a-z]+\s+)|Melee|Ranged|$)/, "g");
            statBlock = statBlock.replaceAll("Requirement", "REQUIREMENT");
            statBlock = abilityHandler(characterId, statBlock, newRegex, parseSpecialAbility);

            speakAsGuidanceToGM(npcName + " has been imported.");
        } catch (err) {
            speakAsGuidanceToGM("I have encountered an error importing this character. The error was around this area -> " + massageTheDataForAbilityParsing(statBlock.substr(0, 20)));
            log(err.message);
            log(err.stack);
        }
    }

    // I hate this method, I wish I had better delimiters
    let massageTheDataForAbilityParsing = function (data) {
        data = data.replaceAll("Grab", "grab")
            .replaceAll("Hit Points", "hit points")
            .replaceAll("Saving Throw", "saving throw")
            .replaceAll("Cantrip", "cantrip")
            .replaceAll("Focus Point", "focus point")
            .replaceAll("Effect", "EFFECT")
            .replaceAll("Trigger", "TRIGGER")
            .replace(/~\s*Critical\sSuccess/g, " CRITICAL SUCCESS")
            .replace(/~\s*Success/g, " SUCCESS")
            .replace(/~\s*Failure/g, " FAILURE")
            .replace(/~\s*Critical\sFailure/g, " CRITICAL FAILURE")
            .replace(/(?<=[a-z])\'s/g, "s")
            .trim();
        data = data.replace(/(?<=[A-Z][a-z]+\s)at?(?=\s)/, "At")
            .replace(/(?<=[A-Z][a-z]+\s)of?(?=\s)/, "Of")
            .replace(/(?<=[A-Z][a-z]+\s)on?(?=\s)/, "On")
            .replace(/(?<=[A-Z][a-z]+\s)to?(?=\s)/, "To")
            .replace(/(?<=[A-Z][a-z]+\s)and?(?=\s)/, "And")
            .replace(/(?<=[A-Z][a-z]+\s)the?(?=\s)/, "The");

        // edge case.
        data = data.replace(/(?<=EFFECT\s*)~\s*[A-Z]/g, function (match) {
            match = match.replace("~", "");
            return match.toLowerCase();
        });
        return data;
    }

    let abilityHandler = function (characterId, source, regex, processor) {
        debugLog("Regex: " + regex.source);
        debugLog("Source: " + source);

        let ability = getFirstMatchingElement(source, regex);
        if (ability.includes("@")) {
            ability = getFirstMatchingElement(ability, /.*?@/);
            ability = ability.replaceAll("@", "");
        }

        let temp;
        if (ability.startsWith("Melee")) {
            temp = "Melee";
        } else if (ability.startsWith("Ranged")) {
            temp = "Ranged";
        }

        // Roll20 complains about infinite loops.
        let safety = 0;
        while (ability !== "" && safety++ < 100) {
            debugLog("Ability: " + ability);
            processor(characterId, ability.replaceAll("~", ""), temp);
            source = source.replaceAll(ability.trim(), "").trim();
            ability = getFirstMatchingElement(source, regex);
            if (ability.includes("@")) {
                ability = getFirstMatchingElement(ability, /.*?@/);
                ability = ability.replaceAll("@", "");
            }
        }
        return source.trim();
    }

    let getAbilityName = function (ability) {
        if (ability.includes(".")) {
            return getFirstMatchingElement(ability, /([A-Z][a-z]*(\s|\-))+(?=([\(\[])|([A-Z][a-z]*))/).trim();
        }
        return getFirstMatchingElement(ability, /([A-Z][a-z]*(\s|\-))+/).trim();
    }

    let parseAutomaticAbility = function (characterId, ability) {
        debugLog("parseAutomaticAbility: " + ability);
        let attributeName = "repeating_free-actions-reactions_" + generateRowID() + "_";
        let abilityName = getAbilityName(ability);

        if (/\[\s*free.action\s*\]/.test(ability)) {
            setAttribute(characterId, attributeName + "free_action", "free action");
            ability = ability.replace(/\[\s*free\W*action\s*\]/, "");
        }
        if (/\[\s*reaction\s*\]/.test(ability)) {
            setAttribute(characterId, attributeName + "reaction", "reaction");
            ability = ability.replace(/\[\s*reaction\s*\]/, "");
        }

        enterOtherAbility(characterId, attributeName, abilityName, ability);
    }

    let parseInteractionAbility = function (characterId, ability) {
        debugLog("parseInteractionAbility = " + ability);
        let abilityName = getAbilityName(ability);
        let attributeName = "repeating_interaction-abilities_" + generateRowID() + "_";

        enterOtherAbility(characterId, attributeName, abilityName, ability);
    }

    let parseAttackAbility = function (characterId, ability, attackType) {
        if (ability.startsWith("Melee")) {
            ability = ability.replaceAll("Melee", "").trim();
        } else {
            ability = ability.replaceAll("Ranged", "").trim();
        }
        const weaponName = getFirstMatchingElement(ability, /(?<=\[.*\]\s).*?(?=\s[+\-])/g);
        const attackBonusMatch = getFirstMatchingElement(ability, /[+\-](\d+)/);
        let repTraits = getTraits(ability);
        ability = ability.replace(repTraits, "");

        const attributeName = "repeating_" + attackType.toLowerCase() + "-strikes_" + generateRowID() + "_";
        if (repTraits.includes("agile")) {
            setAttribute(characterId, attributeName + "weapon_agile", "1");
        }
        setAttribute(characterId, attributeName + "weapon", weaponName.trim());
        setAttribute(characterId, attributeName + "weapon_traits", repTraits);
        setAttribute(characterId, attributeName + "npc_weapon_strike", attackBonusMatch.trim());
        setAttribute(characterId, attributeName + "weapon_strike", attackBonusMatch.replace("+", ""));
        setAttribute(characterId, attributeName + "weapon_map2", "@{strikes_map2}");
        setAttribute(characterId, attributeName + "weapon_map3", "@{strikes_map3}");
        setAttribute(characterId, attributeName + "npc_weapon_notes", ability);
        setAttribute(characterId, attributeName + "weapon_notes", ability);

        debugLog("parseAttackAbility = " + ability);
        let damage = getFirstMatchingElement(ability, /(?<=DAMAGE\s+)\d+d\d+(\+\d+)*/);

        debugLog("damage = " + damage);
        let damageType = getFirstMatchingElement(ability, /(?<=DAMAGE\s+\d+d\d+(\+\d+)*\s)(\w+\s*)+/);

        debugLog("damageType = " + damageType);
        setAttribute(characterId, attributeName + "npc_weapon_strike_damage", damage);
        setAttribute(characterId, attributeName + "weapon_strike_damage", damage);
        setAttribute(characterId, attributeName + "weapon_strike_damage_type", damageType);

        let extra = getFirstMatchingElement(ability, /(?<=DAMAGE\s\[+\d+d\d+(\+\d+)*?\]+\s\w+\s).+/);
        setAttribute(characterId, attributeName + "weapon_strike_damage_additional", extra);
        setAttribute(characterId, attributeName + "toggles", "display,");
    }

    let parseSpells = function (characterId, ability) {
        debugLog("parseSpells = " + ability);
        const attributeName = "repeating_actions-activities_" + generateRowID() + "_";
        const spells = getFirstMatchingElement(ability, /.*(Spells|Rituals)/);
        if (spells.toLowerCase().includes("prepared")) {
            setAttribute(characterId, "spellcaster_prepared", "prepared");
        }
        if (spells.toLowerCase().includes("spontaneous")) {
            setAttribute(characterId, "spellcaster_spontaneous", "spontaneous");
        }

        let tradition;
        if (spells.toLowerCase().includes("occult")) {
            tradition = "occult";
        } else if (spells.toLowerCase().includes("arcane")) {
            tradition = "arcane";
        } else if (spells.toLowerCase().includes("divine")) {
            tradition = "divine";
        } else if (spells.toLowerCase().includes("primal")) {
            tradition = "primal";
        }

        let theRest = getFirstMatchingElement(ability, /(?<=(Spells|Rituals)\s+).*/);
        const matchSpellDC = new RegExp(/(?<=DC\s)\d+/);
        const matchAttack = new RegExp(/(?<=,\sattack\s)([+\-])\d+?(?=;)/);
        setAttribute(characterId, attributeName + "name", spells);
        setAttribute(characterId, attributeName + "npc_description", theRest);
        setAttribute(characterId, attributeName + "description", theRest);
        setAttribute(characterId, attributeName + "toggles", "display,");
        ability = formatDamageDiceIfPresent(ability);

        let spellDC = "";
        let attackBonus = "";

        if (matchSpellDC.test(theRest)) {
            spellDC = getFirstMatchingElement(theRest, matchSpellDC);
            setAttribute(characterId, "spell_dc", spellDC);
            setAttribute(characterId, "npc_spell_dc", spellDC);
        }

        if (matchAttack.test(theRest)) {
            attackBonus = getFirstMatchingElement(theRest, matchAttack);
            setAttribute(characterId, "spell_attack", attackBonus);
            setAttribute(characterId, "npc_spell_attack", attackBonus);
        }

        ["10th", "9th", "8th", "7th", "6th", "5th", "4th", "3rd", "2nd", "1st", "cantrips"].forEach(spellsInLevel => {
            let re = new RegExp(`(?<=${spellsInLevel}).*?(?=(;|$))`)
            let levelArray = getMatchingArray(ability, re);

            if (levelArray.length > 0) {
                let level = levelArray[0];
                let slots, spellLevel;
                if (!spellsInLevel.includes("cantrip")) {
                    spellLevel = getFirstMatchingElement(spellsInLevel, /(^\d+)/);

                    if (/\(\d+\sslots\)/.test(level)) {
                        slots = getFirstMatchingElement(level, /(?<=\()\d+?(?=\sslots\))/);
                        level = level.replace(/\(\d+\sslots\)/, "");
                    }
                    setAttribute(characterId, "level_" + spellLevel.trim() + "_per_day", slots);
                } else {
                    spellLevel = "0";
                    let cantripLevel = getFirstMatchingElement(ability, /(?<=cantrips\W*\()\d+?(?=[A-Za-z]*\))/, "gm");
                    setAttribute(characterId, "cantrips_per_day", cantripLevel);
                }

                let spellList = level.split(",");
                for (let i = 0; i < spellList.length; i++) {
                    if (spellList[i].includes(")") && !spellList[i].includes("(")) {
                        spellList[i - 1] = spellList[i - 1] + ", " + spellList[i];
                        spellList[i] = "";
                    }
                }

                spellList = spellList.filter(n => n);

                spellList.forEach(spellName => {
                    let attributeName;
                    let spellType;

                    if (spells.toLowerCase().includes("innate")) {
                        spellType = "spellinnate";
                        setAttribute(characterId, "toggle_innate", "innate");
                    } else if (spellLevel === 0 || spellLevel.trim() === "0") {
                        spellType = "cantrip";
                        setAttribute(characterId, "toggle_cantrips", "cantrips");
                    } else if (ability.toLowerCase().includes("focus point")) {
                        spellType = "spellfocus";
                        setAttribute(characterId, "toggle_focus", "focus");
                        let focusPoints = getFirstMatchingElement(ability, /(?<=Spells\s)\d+/)
                        setAttribute(characterId, "focus_points", focusPoints);
                    } else {
                        spellType = "normalspells";
                        setAttribute(characterId, "toggle_normalspells", "spells");
                    }

                    attributeName = "repeating_" + spellType + "_" + generateRowID() + "_";
                    setAttribute(characterId, attributeName + "spelllevel", spellLevel);
                    setAttribute(characterId, attributeName + "current_level", spellLevel);
                    setAttribute(characterId, attributeName + "toggles", "display,");
                    spellName = spellName.replace(/\(\d+\w+\)/, "");

                    let extraDetails = "";
                    if (spellName.toLowerCase().includes("at will")) {
                        setAttribute(characterId, attributeName + "frequency", "at-will");
                        spellName = spellName.replaceAll("(at will)", "");
                    } else if (spellName.toLowerCase().includes("constant")) {
                        setAttribute(characterId, attributeName + "frequency", "constant");
                        spellName = spellName.replaceAll("(constant)", "");
                    } else if (spellName.includes("(") && spellName.toLowerCase().includes(")")) {
                        extraDetails = getFirstMatchingElement(spellName, /\(.*\)/);
                        spellName = spellName.replaceAll(extraDetails, "");
                        extraDetails = ": " + extraDetails;
                    }

                    setAttribute(characterId, attributeName + "name", spellName.trim());
                    setAttribute(characterId, attributeName + "description", "Unable to populate due to Roll20 limitations" + extraDetails);
                    setAttribute(characterId, attributeName + "cast_actions", "other");
                    setAttribute(characterId, attributeName + "magic_tradition", tradition);
                    setAttribute(characterId, attributeName + "spell_dc", spellDC);
                    setAttribute(characterId, attributeName + "spellattack", attackBonus);
                    setAttribute(characterId, attributeName + "spellattack_final", attackBonus);
                });
            }
        });
    }

    let parseSpecialAbility = function (characterId, ability) {
        debugLog("parseSpecialAbility = " + ability);
        const attributeName = "repeating_actions-activities_" + generateRowID() + "_";
        let abilityName = getAbilityName(ability);
        let actions = getFirstMatchingElement(ability, /(?<=\[\s*).*action.*?(?=\])/);
        enterOtherAbility(characterId, attributeName, abilityName, ability, actions);
    }

    let formatDamageDiceIfPresent = function (ability) {
        getMatchingArray(ability, /[^\[]\d+d\d+(\+\d+)*/gm)
            .forEach(n => ability = ability.replaceAll(n, " [[" + n.trim() + "]]"));
        return ability;
    }

    let getTraits = function (ability) {
        let cleaned = ability.replaceAll("~", "").trim();
        let candidates = getMatchingArray(cleaned, /\(.*\)/);
        let regex = new RegExp(allTraits, "i");
        let returnValue = candidates.find(candidate => {
            let found = true;
            let words = candidate.split(",");
            // false is equivalent to break - stop checking
            words.every(word => {
                if (!regex.test(word.trim())) {
                    found = false;
                    return false;
                }
                return true;
            });
            if (found) {
                return candidate;
            }
        });
        if (returnValue === undefined) {
            return "";
        }
        return returnValue.trim();
    }

    let enterOtherAbility = function (characterId, attributeName, abilityName, ability, actions) {
        let repTraits = getTraits(ability);
        ability = ability.replace(repTraits, "");

        if (ability.includes("TRIGGER") && ability.includes("EFFECT")) {
            let trigger = getFirstMatchingElement(ability, /(?<=TRIGGER\s).*?(?=(EFFECT\s|$))/);
            ability = ability.replace(/TRIGGER\s.*?(?=(EFFECT\s|$))/, "");
            setAttribute(characterId, attributeName + "trigger", trigger);
        }

        ability = ability.replace(abilityName, "");
        ability = formatDamageDiceIfPresent(ability);

        setAttribute(characterId, attributeName + "name", abilityName);
        setAttribute(characterId, attributeName + "npc_description", ability);
        setAttribute(characterId, attributeName + "description", ability);
        setAttribute(characterId, attributeName + "rep_traits", repTraits);
        setAttribute(characterId, attributeName + "npc_weapon_notes", ability);
        setAttribute(characterId, attributeName + "actions", actions);
        setAttribute(characterId, attributeName + "toggles", "display,");
    }
}
();
