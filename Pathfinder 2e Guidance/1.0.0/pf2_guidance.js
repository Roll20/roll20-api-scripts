var Guidance = Guidance || function () {
    "use strict";

    const guidanceWelcome = "<p>Welcome to Guidance! This tool assists Pathfinder 2e GMs in Roll20. It has the ability to read a stat block from the GMNotes section of a selected character and fill out the NPC section of the character sheet. Stat blocks from Archives of Nethys and PDFs are supported.</p> <p>&nbsp;</p><h2>THE MAIN COMMANDS</h2> <p>&nbsp;</p> <p><em><strong>!pf_npc</strong></em></p> <p>This imports a stat block from the GM Notes section of a character sheet and will out the NPC section of the Pathfinder character sheet. Furthermore, it configures the token's hit points and give AC indicators.</p> <p><em>How to:</em></p><ol> <li>Select and copy a stat block and paste it into the \"GM Notes\" section of a Character sheet. (Don't worry about removing any formatting) </li> <li>Click Save.</li> <li>Select the token that you have<a href=\"https://wiki.roll20.net/Linking_Tokens_to_Journals\"> linked to the character sheet</a>. </li> <li>Type !pf_npc. The script attempts to use the stat block to fill out the NPC section of the Starfinder (Simple) character sheet. </li></ol> <p>The script supports character stat blocks from the <a href=\"https://2e.aonprd.com/\">Archives of Nethys</a> and <span style=\"font-style: italic;\">Society PDFs. Double check the results after importing a stat block. From time to time, abilities of various types MAY include text from another ability. IF THIS HAPPENS, you can add the @ to enforce separating abilities. Alternatively, if an ability is parsed such that part of the text is placed in a separate ability, usually this can be resolved by making sure there is no line break in the ability text.</span></p> <p>&nbsp;</p><p><em><strong>!pf_clean</strong></em></p> <p>I've included this for completeness, but be warned - this command will <span style=\"text-decoration: underline;\"><strong>PERMANENTLY ERASE</strong></span> things from the character sheet so use with caution. As above, this command requires selecting a token that has been <a href=\"https://wiki.roll20.net/Linking_Tokens_to_Journals\">linked to the character sheet</a>.</p> <p><em>How to:</em></p> <p style=\"padding-left: 40px;\"><em><strong>!pf_clean CONFIRM</strong></em> - This will erase ALL stats from the character sheet AND remove ALL formatting from the token. It will not touch the GM Notes section of the character sheet so it can be reimported using !pf_npc.</p><p>&nbsp;</p><p>Feel free to reach out to me if you find any bug or have any suggestions <a href=\"https://app.roll20.net/users/927625/kahn265\">HERE</a>.</p>";
    const guidanceGreeting = "Greetings, I am Guidance. I am here to assist you working with your game. " +
        "To learn more, I created a welcome guide in the journal section.";

    let debugMode = false;

    // commands
    const prefix = "!pf_";
    const commandDebug = prefix + "debug";
    const commandHelp = prefix + "help";
    const commandToken = prefix + "token";
    const commandClean = prefix + "clean";
    const commandPopulate = prefix + "npc";
    const allTraits = "Aftermath,All Ancestries,Archetype,Attack,Aura,Cantrip,Charm,Class,Concentrate,Consecration,Contingency,Curse,Darkness,Death,Dedication,Detection,Deviant,Disease,Downtime,Emotion,Experiment,Exploration,Extradimensional,Fear,Flourish,Focus,Fortune,General,Healing,Incapacitation,Incarnate,Legacy,Light,Lineage,Linguistic,Magical,Manipulate,Mental,Metamagic,Mindshift,Minion,Misfortune,Morph,Move,Multiclass,Open,Polymorph,Possession,Prediction,Press,Radiation,Reckless,Revelation,Scrying,Secret,Skill,Sleep,Spellshape,Splash,Summoned,Tech,Telepathy,Teleportation,Varies,Virulent,Vocal,Chaotic,Evil,Good,Lawful,Aasimar,Anadi,Android,Aphorite,Ardande,Automaton,Azarketi,Beastkin,Catfolk,Changeling,Conrasu,Dhampir,Duskwalker,Dwarf,Elf,Fetchling,Fleshwarp,Ganzi,Geniekin,Ghoran,Gnoll,Gnome,Goblin,Goloma,Grippli,Half-Elf,Halfling,Half-Orc,Hobgoblin,Human,Ifrit,Kashrishi,Kitsune,Kobold,Leshy,Lizardfolk,Nagaji,Orc,Oread,Poppet,Ratfolk,Reflection,Shisk,Shoony,Skeleton,Sprite,Strix,Suli,Sylph,Talos,Tengu,Tiefling,Undine,Vanara,Vishkanya,Adjusted,Aquadynamic,Bulwark,Comfort,Flexible,Hindering,Inscribed,Laminar,Noisy,Ponderous,Alchemist,Barbarian,Bard,Champion,Cleric,Druid,Fighter,Gunslinger,Inventor,Investigator,Kineticist,Magus,Monk,Oracle,Psychic,Ranger,Rogue,Sorcerer,Summoner,Swashbuckler,Thaumaturge,Witch,Wizard,Additive,Amp,Composite,Composition,Cursebound,Eidolon,Esoterica,Evolution,Finisher,Hex,Impulse,Infused,Infusion,Litany,Modification,Oath,Overflow,Psyche,Rage,Social,Spellshot,Stance,Tandem,Unstable,Vigilante,Aberration,Animal,Astral,Beast,Celestial,Construct,Dragon,Dream,Elemental,Ethereal,Fey,Fiend,Fungus,Giant,Humanoid,Monitor,Negative,Ooze,Petitioner,Plant,Positive,Spirit,Time,Undead,Air,Earth,Fire,Metal,Water,Wood,Acid,Cold,Electricity,Force,Sonic,Vitality,Void,Adjustment,Alchemical,Apex,Artifact,Barding,Bomb,Bottled,Breath,Catalyst,Censer,Clockwork,Coda,Companion,Consumable,Contract,Cursed,Drug,Elixir,Entrench,Expandable,Figurehead,Focused,Fulu,Gadget,Grimoire,Intelligent,Invested,Lozenge,Mechanical,Missive,Mutagen,Oil,Potion,Precious,Processed,Relic,Saggorak,Scroll,Snare,Spellgun,Spellheart,Staff,Steam,Structure,Talisman,Tattoo,Trap,Wand,Complex,Environmental,Haunt,Weather,Aeon,Aesir,Agathion,Amphibious,Angel,Anugobu,Aquatic,Arcane,Archon,Asura,Azata,Boggard,Caligni,Charau-ka,Couatl,Daemon,Darvakka,Demon,Dero,Devil,Dinosaur,Div,Drow,Duergar,Formian,Genie,Ghost,Ghoul,Ghul,Golem,Gremlin,Grioth,Hag,Hantu,Herald,Ikeshti,Illusion,Incorporeal,Inevitable,Kaiju,Kami,Kovintus,Lilu,Locathah,Merfolk,Mindless,Morlock,Mortic,Mummy,Munavri,Mutant,Nymph,Oni,Paaridar,Phantom,Protean,Psychopomp,Qlippoth,Rakshasa,Ratajin,Sahkil,Samsaran,Sea Devil,Serpentfolk,Seugathi,Shabti,Shapechanger,Siktempora,Skelm,Skulk,Soulbound,Sporeborn,Spriggan,Stheno,Swarm,Tane,Tanggal,Titan,Troll,Troop,Urdefhan,Vampire,Velstrac,Wayang,Werecreature,Wight,Wild Hunt,Wraith,Wyrwood,Xulgath,Zombie,Erratic,Finite,Flowing,High Gravity,Immeasurable,Low Gravity,Metamorphic,Microgravity,Sentient,Shadow,Static,Strange Gravity,Subjective Gravity,Timeless,Unbounded,Contact,Ingested,Inhaled,Injury,Poison,Abjuration,Conjuration,Divination,Enchantment,Evocation,Necromancy,Transmutation,Auditory,Olfactory,Visual,Deflecting,Foldaway,Harnessed,Hefty,Integrated,Launching,Shield Throw,Divine,Occult,Primal,Agile,Attached,Backstabber,Backswing,Brace,Brutal,Capacity,Climbing,Cobbled,Combination,Concealable,Concussive,Critical Fusion,Deadly,Disarm,Double,Barrel,Fatal,Fatal Aim,Finesse,Forceful,Free-Hand,Grapple,Hampering,Injection,Jousting,Kickback,Modular,Mounted,Nonlethal,Parry,Portable,Propulsive,Range,Ranged Trip,Razing,Reach,Recovery,Reload,Repeating,Resonant,Scatter,Shove,Sweep,Tethered,Thrown,Training,Trip,Twin,Two-Hand,Unarmed,Vehicular,Versatile,Volley";

    //<editor-fold desc="Support Methods">
    let getFirstMatchingElement = function (source, regex, ignoreEmpty) {
        let match = getMatchingArray(source, regex, ignoreEmpty);
        if (match[0] == null) {
            if (ignoreEmpty == undefined) {
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

        return function () {
            let currentTimestamp = (new Date()).getTime();
            let duplicateTimestamp = currentTimestamp === lastTimestamp;
            lastTimestamp = currentTimestamp;

            let uuidArray = new Array(8);
            for (let i = 7; i >= 0; i--) {
                uuidArray[i] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(currentTimestamp % 64);
                currentTimestamp = Math.floor(currentTimestamp / 64);
            }

            let uuid = uuidArray.join("");

            if (duplicateTimestamp) {
                for (let i = 11; i >= 0 && randomValues[i] === 63; i--) {
                    randomValues[i] = 0;
                }
                randomValues[i]++;
            } else {
                for (let i = 0; i < 12; i++) {
                    randomValues[i] = Math.floor(64 * Math.random());
                }
            }

            for (let i = 0; i < 12; i++) {
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
                // debugLog("DefaultAttributes: Initializing " + attributeName + " on character ID " + characterId + " with a value of " + newValue + ".");
            } else {
                if (typeof operator !== "undefined" && !isNaN(newValue) && !isNaN(foundAttribute.get("current"))) {
                    newValue = parseFloat(foundAttribute.get("current")) + parseFloat(mod_newValue[operator](newValue));
                }

                foundAttribute.set("current", newValue);
                foundAttribute.set("max", newValue);
                // debugLog("DefaultAttributes: Setting " + attributeName + " on character ID " + characterId + " to a value of " + newValue + ".");
            }
        } catch (err) {
            log(err);
            log(new Error().stack);
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
    //</editor-fold>

    //<editor-fold desc="on(ready) event">
    on("ready", function () {
        speakAsGuidanceToGM(guidanceGreeting);

        let handoutName = "Welcome To Guidance";
        let objs = findObjs({name: handoutName, _type: "handout"});
        let userGuide;
        if (objs.length < 1) {
            userGuide = createObj("handout", {
                name: handoutName
            });
            userGuide.set("notes", guidanceWelcome);
        } else {
            userGuide = objs[0];
        }
        userGuide.get("gmnotes", function (gmNotes) {
            if (gmNotes.indexOf("debug")) {
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

        let chatAPICommand = chatMessage.content;

        if (chatMessage.selected === undefined) {
            speakAsGuidanceToGM("Please select a token representing a character for me to work with");
            return;
        }

        let selectedNPCs = getSelectedNPCs(chatMessage.selected);

        try {
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
                if (chatAPICommand.includes("CONFIRM")) {
                    eraseCharacter(selectedNPC);
                } else {
                    speakAsGuidanceToGM("Check usage for !sf_clean");
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

            //<editor-fold desc="commandToken - Configure Token linked to Sheet">
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
            log(err);
            log(new Error().stack);
        }
    });

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
            log(err);
            log(new Error().stack);
        }
    };
    //</editor-fold>

    //<editor-fold desc="eraseCharacter - Remove all Attributes and Macros from the NPC sheet">
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
    //</editor-fold>

    ////////////////////////////////////////////////////////////////////////////////////////////////
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
            log(err)
            log(new Error().stack);
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
