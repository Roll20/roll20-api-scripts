/*
Starfinder utilities for Roll20
Requires API, Starfinder (Simple) character sheets - official sheets not supported at this time.
!sf_character - will parse a stat-block in the GM Notes of a character, and populate the NPC tab of the character sheet with the values
*/
var Guidance = Guidance || (function () {
    "use strict";
    let version = "-=> Guidance is online. v1.0.0 <=-";
    let debugMode = false;
    on("ready", function () {
        if (debugMode) {
            speakAsGuidanceToGM(version);
        }
        speakAsGuidanceToGM("Greetings, I am Guidance. I am here to assist you working with your Starfinders to make " +
            "your time in the Pact Worlds more enjoyable. To learn how to use my services, simply type " +
            "<b>sf_help</b> into the chat.");

        log(version);
    });

    on("chat:message", function (chatMessage) {
        if (chatMessage.type !== "api" || !playerIsGM(chatMessage.playerid)) {
            return;
        }

        if (String(chatMessage.content).startsWith("!sf_help")) {
            speakAsGuidanceToGM("I have several commands I support:<br><br>" +
                "<b><i>!sf_character</i></b> will allow you to take a Starfinder statblock that is in the GM notes section " +
                "of a selected character and I will attempt to use it to fill out the NPC section of the Starfinder " +
                "(Simple) character sheet. I support statblocks from the Archives of Nethys and the Starjammer SRD. " +
                "<i>I don't do well with Society PDFs</i>. If you want to attempt using one, double check my work.<br><br>" +
                "<b><i>!sf_clean CONFIRM</i></b> will allow me to take a selected character sheet and completely " +
                "<i>AND PERMANENTLY</i> remove all data from it. <i>I recommend against using this unless you are about " +
                "to reimport a character</i>.<br><br><b><i>!sf_token</i></b> will populate the token with hitpoint, " +
                "EAC, and KAC information in the event that the sheet is setup, but the token isn't.<br><br><b><i>" +
                "!sf_init</i></b> will roll group initiative for all selected NPCs");
            return;
        }

        if (chatMessage.selected === undefined || chatMessage.selected.length < 1) {
            speakAsGuidanceToGM("Please select a token representing a character for me to work with");
            return;
        }

        if (String(chatMessage.content).startsWith("!sf_init")) {
            let allTokens = chatMessage.selected;
            if (allTokens !== undefined) {
                var turnorder = [];
                speakAsGuidanceToGM("Rolling NPC initiative for all selected tokens");
                allTokens.forEach(function (i) {
                    let obj = findObjs(i);
                    let characterId = obj[0].get("represents");
                    let init = attributeToInteger(characterId, "npc-init-misc");
                    let dex = attributeToInteger(characterId, "DEX-bonus");
                    let roll = randomInteger(20) + dex + init;
                    turnorder.push({
                        id: obj[0].id,
                        pr: String(roll) + String(".0" + dex),
                        custom: getAttribute(characterId, "name")
                    });
                });
                Campaign().set("turnorder", JSON.stringify(turnorder));
                debugLog(JSON.stringify(turnorder));
            } else {
                speakAsGuidanceToGM("Linked Token has not been selected");
            }
            return;
        }

        try {
            let tokenLinkedToNpcCharacterSheet;
            try {
                tokenLinkedToNpcCharacterSheet = findObjs(chatMessage.selected[0])[0];
            } catch (e) {
                speakAsGuidanceToGM("Linked Token has not been selected");
                return;
            }

            let characterId = tokenLinkedToNpcCharacterSheet.get("represents");
            let characterSheet = findObjs({_id: characterId, _type: "character"})[0];

            // Code for Testing and Debugging
            if (String(chatMessage.content).startsWith("!sf_debug") && debugMode) {
                log("start");
                let foundAttributes = findObjs({
                    _characterid: characterId,
                    _type: "attribute",
                });
                for (const attribute of foundAttributes) {
                    log(attribute);
                }
                log("Done");
                return;
            }

            // Wipe out all Character Data
            if (String(chatMessage.content).startsWith("!sf_clean CONFIRM")) {
                for (var prop of findObjs({_characterid: characterId, _type: "attribute"})) {
                    debugLog("Removing " + prop.get("name"));
                    prop.remove();
                }
                for (var i = 1; i < 4; i++) {
                    tokenLinkedToNpcCharacterSheet.set("bar" + i + "_value", "");
                    tokenLinkedToNpcCharacterSheet.set("bar" + i + "_max", "");
                }
                if (debugMode) {
                    tokenLinkedToNpcCharacterSheet.set("gmnotes", "");
                }
                try {
                    speakAsGuidanceToGM("Removed all properties for " + characterSheet.get("name"));
                } catch (e) {
                    speakAsGuidanceToGM("Removed all properties for NPC (possibly not linked correctly");
                }
                return;
            } else if (String(chatMessage.content).startsWith("!sf_clean")) {
                speakAsGuidanceToGM("usage !sf_clean CONFIRM");
                return;
            }

            if (String(chatMessage.content).startsWith("!sf_token")) {
                setToken(characterId, tokenLinkedToNpcCharacterSheet);
                return;
            }

            // Populate the Character Sheet
            if (String(chatMessage.content).startsWith("!sf_character")) {
                characterSheet.get("gmnotes", function (gmNotes) {
                    var cleanNotes = cleanText(gmNotes);
                    var section = parseBlockIntoSubSectionMap(cleanNotes);

                    // For Debugging purposes and general information
                    if (debugMode) {
                        tokenLinkedToNpcCharacterSheet.set("gmnotes", cleanNotes);
                    }

                    // Setup Character Sheet
                    setAttribute(characterId, "npc-race", characterSheet.get("name"));
                    setAttribute(characterId, "tab", 4);
                    setAttribute(characterId, "npc-tactics-show", 0);
                    setAttribute(characterId, "npc-feats-show", 0);
                    populateHeader(characterId, section.get("header"));
                    populateDefense(characterId, section.get("defense"));
                    populateOffense(characterId, section.get("offense"));
                    populateStatics(characterId, section.get("statistics"));
                    populateSkills(characterId, section.get("statistics"));
                    populateNPC(characterId, cleanNotes);
                    populateSpecialAbilities(characterId, section.get("special"));

                    // Set up Token
                    setToken(characterId, tokenLinkedToNpcCharacterSheet);
                    speakAsGuidanceToGM(characterSheet.get("name") + " NPC character sheet processed");
                });
                return;
            }

        } catch (ex) {
            speakAsGuidanceToGM("Hmm... I'm afraid I can't do that.");
            log(ex);
        }
    });

    var attributeToInteger = function (characterId, attrib) {
        let value = getAttribute(characterId, attrib);
        if (value === undefined) {
            return 0;
        } else {
            return Number(value.get("current"));
        }
    };

    var setToken = function (characterId, tokenLinkedToNpcCharacterSheet) {
        try {
            let hitPoints = getAttribute(characterId, "HP-npc");
            tokenLinkedToNpcCharacterSheet.set("bar1_link", hitPoints.id);
            var armorClass = getAttribute(characterId, "EAC-npc");
            tokenLinkedToNpcCharacterSheet.set("bar2_value", "EAC " + armorClass.get("current"));
            tokenLinkedToNpcCharacterSheet.set("bar2_max", armorClass.get("current"));
            armorClass = getAttribute(characterId, "KAC-npc");
            tokenLinkedToNpcCharacterSheet.set("bar3_value", "KAC " + armorClass.get("current"));
            tokenLinkedToNpcCharacterSheet.set("bar3_max", armorClass.get("current"));
            tokenLinkedToNpcCharacterSheet.set("showname", true);
            speakAsGuidanceToGM("Token setup. For extra settings, check out the API TokenMod");
        } catch (e) {
            speakAsGuidanceToGM("Check to make sure the token is linked and the character sheet is populated");
        }
    };

    var getAttribute = function (characterId, attributeName) {
        return findObjs({
            _characterid: characterId,
            _type: "attribute",
            name: attributeName
        })[0];
    };

    var parseBlockIntoSubSectionMap = function (textToParse) {
        let sections = new Map();
        var parsedText = textToParse;

        sections.set("header", parsedText.substring(0, parsedText.indexOf("DEFENSE")));
        parsedText = parsedText.substring(parsedText.indexOf("DEFENSE"));

        sections.set("defense", parsedText.substring(0, parsedText.indexOf("OFFENSE")));
        parsedText = parsedText.substring(parsedText.indexOf("OFFENSE"));

        if (textToParse.includes("TACTICS")) {
            speakAsGuidanceToGM("Tactics section found. Tactics Processing not yet implemented");
            sections.set("offense", parsedText.substring(0, parsedText.indexOf("TACTICS")));
        } else {
            sections.set("offense", parsedText.substring(0, parsedText.indexOf("STATISTICS")));
        }
        parsedText = parsedText.substring(parsedText.indexOf("STATISTICS"));
        if (textToParse.includes("SPECIAL ABILITIES")) {
            sections.set("statistics", parsedText.substring(0, parsedText.indexOf("SPECIAL ABILITIES")));
            parsedText = parsedText.substring(parsedText.indexOf("SPECIAL ABILITIES"));
            sections.set("special", parsedText);
        } else {
            sections.set("statistics", parsedText);
        }

        return sections;
    };

    // Populate data
    var doMagic = function (characterId, textToParse) {
        textToParse = textToParse.substring(textToParse.indexOf("Spell"));
        textToParse = textToParse.replace(/\s+/, " ");
        var attackBonus = "";
        if (textToParse.includes("Spells Known")) {
            setAttribute(characterId, "spellclass-1-level", getValue("CL", textToParse, ";").replace(/\D/g, ""));

            attackBonus = textToParse.replace(/\(.*;/, "");
            attackBonus = attackBonus.replace("Spells Known", "");
            attackBonus = attackBonus.substring(0, attackBonus.indexOf(")"));
            textToParse = textToParse.substring(textToParse.indexOf(")") + 1);

            var level = "";
            if (textToParse.includes("6th")) {
                level = textToParse.substring(textToParse.indexOf("6th"), textToParse.indexOf("5th")).trim();
                addSpell(characterId, level, attackBonus);
            }
            if (textToParse.includes("5th")) {
                level = textToParse.substring(textToParse.indexOf("5th"), textToParse.indexOf("4th")).trim();
                addSpell(characterId, level, attackBonus);
            }
            if (textToParse.includes("4th")) {
                level = textToParse.substring(textToParse.indexOf("4th"), textToParse.indexOf("3rd")).trim();
                addSpell(characterId, level, attackBonus);
            }
            if (textToParse.includes("3rd")) {
                level = textToParse.substring(textToParse.indexOf("3rd"), textToParse.indexOf("2nd")).trim();
                addSpell(characterId, level, attackBonus);
            }
            if (textToParse.includes("2nd")) {
                level = textToParse.substring(textToParse.indexOf("2nd"), textToParse.indexOf("1st")).trim();
                addSpell(characterId, level, attackBonus);
            }
            if (textToParse.includes("1st")) {
                level = textToParse.substring(textToParse.indexOf("1st"), textToParse.indexOf("0 (at will)")).trim();
                addSpell(characterId, level, attackBonus);
            }
            level = textToParse.substring(textToParse.indexOf("0 (at")).trim();
            if (textToParse.includes("Spell-Like Abilities")) {
                level = level.substring(0, level.indexOf("Spell-Like Abilities"));
            }
            addSpell(characterId, level, attackBonus);
        } else {
            setAttribute(characterId, "npc-spells-show", 0);
        }

        if (textToParse.includes("Spell-Like Abilities")) {
            textToParse = textToParse.substring(textToParse.indexOf("Spell-Like Abilities")).trim();
            setAttribute(characterId, "spellclass-0-level", getValue("CL", textToParse, ";").replace(/\D/g, ""));
            textToParse = textToParse.replace(/Spell-Like Abilities/, "").trim();

            attackBonus = textToParse.replace(/\(.*;/, "");
            attackBonus = attackBonus.substring(0, attackBonus.indexOf(")") + 1);

            var lines = textToParse.match(/\d\/\w+|At will|Constant/);
            for (var i = 0; i < lines.length; i++) {
                var ability = "";
                if (lines[i + 1] == null) {
                    ability = textToParse.substring(textToParse.indexOf(lines[i]));
                } else {
                    ability = textToParse.substring(textToParse.indexOf(lines[i]), textToParse.indexOf(lines[i + 1]));
                }
                addSpellLikeAbility(characterId, ability, attackBonus);
            }
        } else {
            setAttribute(characterId, "npc-spell-like-abilities-show", 0);
        }
    };

    var addSpell = function (characterId, textToParse, additional) {
        textToParse = textToParse.replace(/—/g, "");
        var uuid = generateRowID();
        var value = textToParse.substring(0, textToParse.indexOf("(")).replace(/\D/g, "").trim();
        setAttribute(characterId, "repeating_spells_" + uuid + "_npc-spell-level", value);
        value = textToParse.substring(textToParse.indexOf("("), textToParse.indexOf(")") + 1).trim();
        setAttribute(characterId, "repeating_spells_" + uuid + "_npc-spell-usage", value);
        value = "(" + additional.trim() + ") " + textToParse.substring(textToParse.indexOf(")") + 1).trim();
        setAttribute(characterId, "repeating_spells_" + uuid + "_npc-spell-list", value);
    };

    var addSpellLikeAbility = function (characterId, textToParse, attackBonus) {
        var uuid = generateRowID();
        setAttribute(characterId, "repeating_npc-spell-like-abilities_" + uuid + "_npc-abil-usage", textToParse.substring(0, textToParse.indexOf("—")).trim());
        setAttribute(characterId, "repeating_npc-spell-like-abilities_" + uuid + "_npc-abil-name", attackBonus + " " + textToParse.substring(textToParse.indexOf("—") + 2).trim());
    };

    var cleanText = function (textToClean) {
        return textToClean.replace(/(<([^>]+)>)/gi, " "
        ).replace(/&nbsp;/gi, " "
        ).replace(/&amp;/gi, "&"
        ).replace(/&amp/gi, "&"
        ).replace(/\s+/g, " "
        ).replace(/Offense/i, " OFFENSE "
        ).replace(/Defense/i, " DEFENSE "
        ).replace(/Statistics/i, " STATISTICS "
        ).replace(/Ecology/i, "ECOLOGY "
        ).replace(/Special Abilities/i, " SPECIAL ABILITIES "
        ).replace(/Tactics/i, " TACTICS "
        ).replace(/ Str /i, " Str "
        ).replace(/ Dex /i, " Dex "
        ).replace(/ Con /i, " Con "
        ).replace(/ Int /i, " Int "
        ).replace(/ Wis /i, " Wis "
        ).replace(/ Cha /i, " Cha "
        );
    };

    var populateHeader = function (characterId, textToParse) {
        setAttribute(characterId, "npc-cr", getValue("CR", textToParse));
        setAttribute(characterId, "npc-XP", getValue("XP", textToParse).replace(/\s/, "").replace(/,/, ""));
        setAttribute(characterId, "npc-senses", getValue("Senses", textToParse, ";"));
        setAttribute(characterId, "npc-aura", getStringValue("Aura", textToParse, "DEFENSE"));
    };

    var populateDefense = function (characterId, textToParse) {
        setAttribute(characterId, "EAC-npc", getValue("EAC ", textToParse));
        setAttribute(characterId, "KAC-npc", getValue("KAC", textToParse));
        setAttribute(characterId, "Fort-npc", getValue("Fort", textToParse).replace("+", ""));
        setAttribute(characterId, "Ref-npc", getValue("Ref", textToParse).replace("+", ""));
        setAttribute(characterId, "Will-npc", getValue("Will", textToParse).replace("+", ""));
        setAttribute(characterId, "HP-npc", getValue("HP", textToParse));
        var rp = getValue("RP", textToParse);
        if (rp != null) {
            setAttribute(characterId, "RP-npc", rp);
        }
        setAttribute(characterId, "npc-SR", getValue("SR", textToParse));
        if (textToParse.includes("Weaknesses")) {
            setAttribute(characterId, "npc-resistances", getValue("Resistances", textToParse, "Weaknesses"));
            setAttribute(characterId, "npc-weaknesses", getValue("Weaknesses", textToParse, ";"));
        } else {
            setAttribute(characterId, "npc-resistances", getValue("Resistances", textToParse, ";"));
        }
        setAttribute(characterId, "npc-DR", getValue("DR", textToParse, ";"));

        if (textToParse.includes("SR")) {
            setAttribute(characterId, "npc-immunities", getValue("Immunities", textToParse, "SR"));
        } else {
            setAttribute(characterId, "npc-immunities", getValue("Immunities", textToParse, "OFFENSE"));
        }

        var defensiveAbilities = "";
        if (textToParse.includes("vs.")) {
            var extraSaveStart = textToParse.indexOf("Will") + 3;
            defensiveAbilities = textToParse.substr(extraSaveStart);
            extraSaveStart = defensiveAbilities.indexOf(";");
            defensiveAbilities = defensiveAbilities.substr(extraSaveStart + 1);
            if (defensiveAbilities.includes("Defensive")) {
                defensiveAbilities = defensiveAbilities.substring(0, defensiveAbilities.indexOf("Defensive"));
            }
        }
        if (textToParse.includes("Defensive")) {
            var start = textToParse.indexOf("Defensive Abilities") + "Defensive Abilities".length;
            if (textToParse.includes("Immunities")) {
                textToParse = textToParse.substring(0, textToParse.indexOf("Immunities"));
            }
            defensiveAbilities = textToParse.substring(start) + " " + defensiveAbilities;
        }
        setAttribute(characterId, "npc-defensive-abilities", defensiveAbilities);
    };

    var populateOffense = function (characterId, textToParse) {
        var specialAbilities = getValue("Offensive Abilities", textToParse, "STATISTICS");
        if (specialAbilities.includes("Spell")) {
            specialAbilities = specialAbilities.substring(0, specialAbilities.indexOf("Spell"));
        }
        if (specialAbilities == null) {
            setAttribute(characterId, "npc-special-attacks-show", 0);
        } else {
            setAttribute(characterId, "npc-special-attacks", specialAbilities);
        }

        setAttribute(characterId, "speed-base-npc", getMovement("Speed", textToParse));
        setAttribute(characterId, "speed-fly-npc", getMovement("fly", textToParse));
        setAttribute(characterId, "speed-burrow-npc", getMovement("burrow", textToParse));
        setAttribute(characterId, "speed-climb-npc", getMovement("climb", textToParse));
        setAttribute(characterId, "speed-swim-npc", getMovement("swim", textToParse));
        setAttribute(characterId, "space", getMovement("Space", textToParse));
        setAttribute(characterId, "reach", getMovement("Reach", textToParse));

        if (textToParse.toLowerCase().includes("fly")) {
            if (textToParse.includes("(Ex")) {
                setAttribute(characterId, "speed-fly-source-npc", 1);
            } else if (textToParse.includes("(Su")) {
                setAttribute(characterId, "speed-fly-source-npc", 2);
            } else {
                setAttribute(characterId, "speed-fly-source-npc", 3);
            }

            if (textToParse.includes("lumsy)")) {
                setAttribute(characterId, "speed-fly-maneuverability-npc", -8);
            } else if (textToParse.includes("erfect)")) {
                setAttribute(characterId, "speed-fly-maneuverability-npc", 8);
            } else {
                setAttribute(characterId, "speed-fly-maneuverability-npc", 0);
            }
        }

        doWeapons(characterId, textToParse);
        doMagic(characterId, textToParse);
    };

    var getMovement = function (textToFind, textToParse) {
        if (textToParse.includes(textToFind)) {
            return getStringValue(textToFind, textToParse, "ft.").trim();
        }
        return "";
    };

    var populateStatics = function (characterId, textToParse) {
        setAttribute(characterId, "STR-bonus", getValue("Str", textToParse).replace("+", ""));
        setAttribute(characterId, "DEX-bonus", getValue("Dex", textToParse).replace("+", ""));
        setAttribute(characterId, "CON-bonus", getValue("Con", textToParse).replace("+", ""));
        setAttribute(characterId, "INT-bonus", getValue("Int", textToParse).replace("+", ""));
        setAttribute(characterId, "WIS-bonus", getValue("Wis", textToParse).replace("+", ""));
        setAttribute(characterId, "CHA-bonus", getValue("Cha", textToParse).replace("+", ""));
        if (!textToParse.includes("Other Abilities")) {
            setAttribute(characterId, "languages-npc", getValue("Languages", textToParse, "Gear"));
        } else {
            setAttribute(characterId, "languages-npc", getValue("Languages", textToParse, "Other"));
        }

        var gear = getValue("Gear", textToParse, "Ecology");
        if (gear == null || gear.length < 1) {
            setAttribute(characterId, "npc-gear-show", 0);
        } else {
            setAttribute(characterId, "npc-gear", getValue("Gear", textToParse, "Ecology"));
        }

        var sq = getValue("Other Abilities", textToParse, "Gear");
        if (sq.includes("ECOLOGY")) {
            sq = sq.substring(0, sq.indexOf("ECOLOGY"));
        }
        setAttribute(characterId, "SQ", sq);
    };

    var populateSpecialAbilities = function (characterId, textToParse) {
        debugLog("Parsing Special Abilities");
        var uuid;
        if (textToParse != null) { //} && textToParse != undefined) {
            if (textToParse.includes("SPECIAL ABILITIES")) {
                textToParse = textToParse.replace("SPECIAL ABILITIES", "").trim();
                if (textToParse.includes("(")) {
                    do {
                        uuid = generateRowID();
                        var abilityName = textToParse.substring(0, textToParse.indexOf(")") + 1);
                        setAttribute(characterId, "repeating_special-ability_" + uuid + "_npc-spec-abil-name", abilityName.trim());
                        textToParse = textToParse.substring(textToParse.indexOf(")") + 1);
                        var nextAbility = textToParse.match(/\.([^\.]*?)\(..\)/);
                        if (nextAbility == null) {
                            setAttribute(characterId, "repeating_special-ability_" + uuid + "_npc-spec-abil-description", textToParse.trim());
                            return;
                        }
                        var endPoint = textToParse.indexOf(nextAbility[0]) + 1;
                        setAttribute(characterId, "repeating_special-ability_" + uuid + "_npc-spec-abil-description", textToParse.substring(0, endPoint).trim());
                        textToParse = textToParse.substring(endPoint);
                    } while (textToParse.includes("("));
                } else {
                    uuid = generateRowID();
                    setAttribute(characterId, "repeating_special-ability_" + uuid + "_npc-spec-abil-name", "Special Abilities");
                    textToParse = textToParse.replace(/\./, ".\n");
                    setAttribute(characterId, "repeating_special-ability_" + uuid + "_npc-spec-abil-description", textToParse.trim());
                }
            }
        } else {
            setAttribute(characterId, "npc-special-abilities-show", 0);
        }
    };

    var populateSkills = function (characterId, textToParse) {
        setAttribute(characterId, "Acrobatics-npc-misc", getSkillValue("Acrobatics", "Dex", textToParse));
        setAttribute(characterId, "Athletics-npc-misc", getSkillValue("Athletics", "Str", textToParse));
        setAttribute(characterId, "Bluff-npc-misc", getSkillValue("Bluff", "Cha", textToParse));
        setAttribute(characterId, "Computers-npc-misc", getSkillValue("Computers", "Int", textToParse));
        setAttribute(characterId, "Culture-npc-misc", getSkillValue("Culture", "Int", textToParse));
        setAttribute(characterId, "Diplomacy-npc-misc", getSkillValue("Diplomacy", "Cha", textToParse));
        setAttribute(characterId, "Disguise-npc-misc", getSkillValue("Disguise", "Cha", textToParse));
        setAttribute(characterId, "Engineering-npc-misc", getSkillValue("Engineering", "Int", textToParse));
        setAttribute(characterId, "Intimidate-npc-misc", getSkillValue("Intimidate", "Cha", textToParse));
        setAttribute(characterId, "Life-Science-npc-misc", getSkillValue("Life-Science", "Int", textToParse));
        setAttribute(characterId, "Medicine-npc-misc", getSkillValue("Medicine", "Int", textToParse));
        setAttribute(characterId, "Mysticism-npc-misc", getSkillValue("Mysticism", "Wis", textToParse));
        setAttribute(characterId, "Physical-Science-npc-misc", getSkillValue("Physical-Science", "Int", textToParse));
        setAttribute(characterId, "Piloting-npc-misc", getSkillValue("Piloting", "Dex", textToParse));
        setAttribute(characterId, "Sense-Motive-npc-misc", getSkillValue("Sense-Motive", "Wis", textToParse));
        setAttribute(characterId, "Sleight-of-Hand-npc-misc", getSkillValue("Sleight-of-Hand", "Dex", textToParse));
        setAttribute(characterId, "Stealth-npc-misc", getSkillValue("Stealth", "Dex", textToParse));
        setAttribute(characterId, "Survival-npc-misc", getSkillValue("Survival", "Wis", textToParse));
    };

    // Everything Else that needs more detail
    var populateNPC = function (characterId, textToParse) {
        setAttribute(characterId, "Perception-npc-misc", getSkillValue("Perception", "Wis", textToParse));
        setAttribute(characterId, "npc-init-misc", getSkillValue("Init", "Dex", textToParse));

        try {
            var section = getStringValue("XP", textToParse, "DEFENSE").trim();
            // var subsections = section.split(" ");

            if (section.includes("LG")) {
                setAttribute(characterId, "npc-alignment", "LG");
            } else if (section.includes("NG")) {
                setAttribute(characterId, "npc-alignment", "NG");
            } else if (section.includes("CG")) {
                setAttribute(characterId, "npc-alignment", "CG");
            } else if (section.includes("LN")) {
                setAttribute(characterId, "npc-alignment", "LN");
            } else if (section.includes("CN")) {
                setAttribute(characterId, "npc-alignment", "CN");
            } else if (section.includes("LE")) {
                setAttribute(characterId, "npc-alignment", "LE");
            } else if (section.includes("NE")) {
                setAttribute(characterId, "npc-alignment", "NE");
            } else if (section.includes("CE")) {
                setAttribute(characterId, "npc-alignment", "CE");
            } else {
                setAttribute(characterId, "npc-alignment", "N");
            }

            var subtypeStart = 0;
            var dropdown = 0;
            if (section.toLowerCase().includes("medium")) {
                dropdown = 0;
                subtypeStart = section.indexOf("Medium") + "Medium".length;
            } else if (section.toLowerCase().includes("large")) {
                dropdown = -1;
                subtypeStart = section.indexOf("Large") + "Large".length;
            } else if (section.toLowerCase().includes("small")) {
                dropdown = 1;
                subtypeStart = section.indexOf("Small") + "Small".length;
            } else if (section.toLowerCase().includes("gargantuan")) {
                dropdown = -4;
                subtypeStart = section.indexOf("Gargantuan") + "Gargantuan".length;
            } else if (section.toLowerCase().includes("huge")) {
                dropdown = -2;
                subtypeStart = section.indexOf("Huge") + "Huge".length;
            } else if (section.toLowerCase().includes("tiny")) {
                dropdown = 2;
                subtypeStart = section.indexOf("Tiny") + "Tiny".length;
            } else if (section.toLowerCase().includes("diminutive")) {
                dropdown = 4;
                subtypeStart = section.indexOf("Diminutive") + "Diminutive".length;
            } else if (section.toLowerCase().includes("fine")) {
                dropdown = 8;
                subtypeStart = section.indexOf("Fine") + "Fine".length;
            } else if (section.toLowerCase().includes("colossal")) {
                dropdown = -8;
                subtypeStart = section.indexOf("Colossal") + "Colossal".length;
            }

            setAttribute(characterId, "npc-size", dropdown);
            setAttribute(characterId, "npc-subtype", section.substring(subtypeStart, section.indexOf("Init")));
        } catch (err) {
            debugLog("Problems with alignment, size,subtype");
        }
    };

    var doWeapons = function (characterId, textToParse) {
        var delimiter = "~~~";
        textToParse = textToParse.replace(/Attacks/i, ""
        ).replace(/ or /g, delimiter
        ).replace(/Ranged/g, delimiter
        ).replace(/Melee/g, delimiter
        ).replace(/OFFENSE/, ""
        ).replace(/Multiattack/, delimiter + "Multiattack"
        );

        if (textToParse.indexOf("Space") > 0) {
            textToParse = textToParse.substring(0, textToParse.indexOf("Space"));
        }

        if (textToParse.indexOf("Spell") > 0) {
            textToParse = textToParse.substring(0, textToParse.indexOf("Spell"));
        }

        if (textToParse.includes("Speed")) {
            textToParse = textToParse.substring(textToParse.indexOf("ft"));
        }

        if (textToParse.includes("fly")) {
            textToParse = textToParse.substring(textToParse.indexOf("fly"));
            textToParse = textToParse.substring(textToParse.indexOf("ft.") + 3).trim();
            if (textToParse.startsWith("(")) {
                textToParse = textToParse.substring(textToParse.indexOf(")") + 1).trim();
            }
        }

        if (textToParse.indexOf("Offensive Abilities") > 0) {
            textToParse = textToParse.substring(0, textToParse.indexOf("Offensive Abilities"));
        }

        var attacks = textToParse.split(delimiter);
        for (var attack of attacks) {
            attack = attack.trim();
            if (attack.length > 1) {
                if (!(attack.startsWith("Space") || attack.startsWith("Reach") || attack.includes("ft"))) {
                    try {
                        armNPC(characterId, attack);
                    } catch (err) {
                        speakAsGuidanceToGM("Could not populate data for weapon " + attack);
                    }
                }
            }

        }
    };

    var armNPC = function (characterId, attackToParse) {
        debugLog("Parsing " + attackToParse);
        var uuid = generateRowID();

        var details = attackToParse.split(" ");
        var i = 0;
        var weapon = "";
        while (isNaN(details[i]) && i < details.length) {
            weapon = weapon + details[i] + " ";
            i++;
        }

        setAttribute(characterId, "repeating_npc-weapon_" + uuid + "_npc-weapon-notes", attackToParse);
        setAttribute(characterId, "repeating_npc-weapon_" + uuid + "_npc-weapon-name", weapon);
        var attackBonus = details[i];
        setAttribute(characterId, "repeating_npc-weapon_" + uuid + "_npc-weapon-attack", attackBonus);
        i++;

        var damage = details[i].replace(/\(/, "");
        var numDice = damage.split("d");
        var dnd = numDice[1].split("+");
        setAttribute(characterId, "repeating_npc-weapon_" + uuid + "_npc-damage-dice-num", numDice[0]);
        setAttribute(characterId, "repeating_npc-weapon_" + uuid + "_npc-damage-die", dnd[0]);

        if (dnd[1] != undefined) {
            setAttribute(characterId, "repeating_npc-weapon_" + uuid + "_npc-weapon-damage", dnd[1]);
        }
    };

    // borrowed from https://app.roll20.net/users/901082/invincible-spleen in the forums
    var setAttribute = function (characterId, attributeName, newValue, operator) {
        var mod_newValue = {
                "+": function (num) {
                    return num;
                },
                "-": function (num) {
                    return -num;
                }
            },

            foundAttribute = getAttribute(characterId, attributeName);

        try {
            if (!foundAttribute) {
                if (typeof operator !== "undefined" && !isNaN(newValue)) {
                    debugLog(newValue + " is a number.");
                    newValue = mod_newValue[operator](newValue);
                }

                // We don't need to create "Blank Values"
                if (!attributeName.includes("show")) {
                    if (newValue == null || newValue == "" || newValue == 0) {
                        return;
                    }
                }

                debugLog("DefaultAttributes: Initializing " + attributeName + " on character ID " + characterId + " with a value of " + newValue + ".");
                createObj("attribute", {
                    name: attributeName,
                    current: newValue,
                    max: newValue,
                    _characterid: characterId
                });
            } else {
                if (typeof operator !== "undefined" && !isNaN(newValue) && !isNaN(foundAttribute.get("current"))) {
                    newValue = parseFloat(foundAttribute.get("current")) + parseFloat(mod_newValue[operator](newValue));
                }
                debugLog("DefaultAttributes: Setting " + attributeName + " on character ID " + characterId + " to a value of " + newValue + ".");
                foundAttribute.set("current", newValue);
                foundAttribute.set("max", newValue);
            }
        } catch (err) {
            debugLog("Error parsing " + attributeName);
        }
    };

    // Parsing routines
    var getSkillValue = function (skillName, attribute, textToParse) {
        if (Number(getValue(skillName, textToParse).trim()) > 2) {
            debugLog(skillName + " : " + getValue(skillName, textToParse) + " - " + attribute + " : " + getValue(attribute, textToParse));
            return Number(getValue(skillName, textToParse).trim()) - Number(getValue(attribute, textToParse).trim());
        }
        return 0;
    };

    var getValue = function (textToFind, textToParse, delimiter) {
        var bucket = getStringValue(textToFind, textToParse, delimiter);
        if (bucket == null) {
            return "";
        }
        let b2 = bucket.split(" ");
        bucket = b2[0];
        return bucket.replace(";", "").replace(",", " ").trim(); // replace("+", "")
    };

    var getStringValue = function (textToFind, textToParse, delimiter) {
        if (textToParse.indexOf(textToFind) < 0) {
            return "";
        }
        let start = textToParse.indexOf(textToFind) + textToFind.length;
        if (start < 0) {
            return "";
        }

        if (delimiter === undefined) {
            delimiter = " ";
        }

        var bucket = textToParse.substring(start);
        if (delimiter !== ";") {
            // It appears that ; ALWAYS means end of field. This is a good safety
            if (bucket.indexOf(";") > 2) {
                bucket = bucket.substring(0, bucket.indexOf(";"));
            }
        }

        bucket = bucket.trim();
        let end = bucket.toLowerCase().indexOf(delimiter.toLowerCase());
        if (end > 1) {
            bucket = bucket.substring(0, end);
        }
        return bucket;
    };

    // Thanks Aaron
    var generateUUID = (function () {
            "use strict";

            var a = 0, b = [];
            return function () {
                var c = (new Date()).getTime() + 0, d = c === a;
                a = c;
                for (var e = new Array(8), f = 7; 0 <= f; f--) {
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
                for (f = 0; 12 > f; f++) {
                    c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
                }

                return c;
            };
        }()),
        generateRowID = function () {
            "use strict";
            return generateUUID().replace(/_/g, "Z");
        };

    var speakAsGuidanceToGM = function (text) {
        text = "/w gm  &{template:pf_spell} {{name=Guidance}} {{spell_description=" + text + "}}";
        sendChat("Guidance", text);
    };

    var debugLog = function (text) {
        if (debugMode) {
            log(text);
        }
    };
}
());