var tokenAction = tokenAction || (function() {
    'use strict';

    var version = '0.3.3',
        sheetVersion = 'D&D 5th Edition by Roll20',

        checkInstall = function() {
            log('TokenAction v' + version + ' is ready!  Designed for use with the ' + sheetVersion + ' character sheet!');
        },

        getRepeatingAction = (id, action, usename) => {
            const name = usename ? getObj('character', id).get('name') : id;
            return `%{${name}|${action}}`;
        },

        getRepeatingTrait = (id, trait, usename) => {
            const name = usename ? getObj('character', id).get('name') : id;
            return `%{${name}|${trait}}`;
        },

        getRepeatingReaction = (id, reaction, usename) => {
            const name = usename ? getObj('character', id).get('name') : id;
            return `%{${name}|${reaction}}`;
        },

        getSelectedCharacters = function(selected) {
            return _.chain(selected)
                .map(function(s) {
                    return getObj(s._type, s._id);
                })
                .reject(_.isUndefined)
                .map(function(c) {
                    return getObj('character', c.get('represents'));
                })
                .filter(_.identity)
                .value();
        },

        createAbility = function(name, pattern, id) {
            var checkAbility = findObjs({
                _type: 'ability',
                _characterid: id,
                name: name
            });

            if (checkAbility[0]) {
                checkAbility[0].set({
                    action: pattern
                });
            } else {
                createObj('ability', {
                    name: name,
                    action: pattern,
                    characterid: id,
                    istokenaction: true
                });
            }
        },

        createRepeating = function(name, pattern, id, usename) {
            var repeatingAttrs = filterObjs(function(o) {
                return o.get('type') === 'attribute' && o.get('characterid') === id && o.get('name').match(name);
            });

            _.each(repeatingAttrs, function(attr) {
                var repeatingId = attr.get('name').split('_')[2],
                    repeatingName = attr.get('current'),
                    repeatingAction = getRepeatingAction(id, pattern.replace(/%%RID%%/g, repeatingId), usename),
                    checkAbility = findObjs({
                        _type: 'ability',
                        _characterid: id,
                        name: repeatingName
                    });

                if (checkAbility[0]) {
                    checkAbility[0].set({
                        action: repeatingAction
                    });
                } else {
                    repeatingName = repeatingName.replace(" (One-Handed)", "-1H");
                    repeatingName = repeatingName.replace(" (Two-Handed)", "-2H");
                    repeatingName = repeatingName.replace("swarm has more than half HP", "HP>Half");
                    repeatingName = repeatingName.replace("swarm has half HP or less", "HP<=Half");
                    repeatingName = repeatingName.replace(/\s\(Recharge(.*)Short or Long Rest\)/, "-(R Short/Long)");
                    repeatingName = repeatingName.replace(/\s\(Recharge(.*)Short Rest\)/, "-(R Short)");
                    repeatingName = repeatingName.replace(/\s\(Recharge(?=.*Long Rest)(?:(?!Short).)*\)/, "-(R Long)");
                    repeatingName = repeatingName.replace(/\sVariant\)/, '\)');
                    repeatingName = repeatingName.replace(/\s\(Recharge\s(.*)\)/, '-\(R$1\)');
                    repeatingName = repeatingName.replace(/\s\(Costs\s(.*)\sActions\)/, '-\($1a\)');


                    createObj("ability", {
                        name: repeatingName,
                        action: repeatingAction,
                        characterid: id,
                        istokenaction: true
                    });
                }
            });
        },

        isNpc = function(id) {
            var checkNpc = findObjs({
                _type: 'attribute',
                _characterid: id,
                name: 'npc'
            });
            if (_.isUndefined(checkNpc[0])) {
                return false;
            } else {
                return checkNpc[0].get('current');
            }
        },

        deleteAbilities = function(id) {
            var abilities = findObjs({
                _type: 'ability',
                _characterid: id
            });
            _.each(abilities, function(r) {
                let abilityName = r.get('name');
                if (abilityName.includes(".",-1)) {
                } else{
                r.remove();
                };
            });
        },
        
                deleteAllAbilities = function(id) {
            var abilities = findObjs({
                _type: 'ability',
                _characterid: id
            });
            _.each(abilities, function(r) {
                let abilityName = r.get('name');
                r.remove();
            });
        },

        createSpell = function(id) {
            var checkAbility = findObjs({
                    _type: 'ability',
                    _characterid: id,
                    name: 'Spells'
                }),
                repeatingAttrs = filterObjs(function(o) {
                    return o.get('type') === 'attribute' && o.get('characterid') === id && o.get('name').match(/repeating_spell-[^{(np)][\S+_[^_]+_spellname\b/);
                }),
                spellText = "",
                sk = [],
                sb = {
                    'Cantrips': [],
                    '1st': [],
                    '2nd': [],
                    '3rd': [],
                    '4th': [],
                    '5th': [],
                    '6th': [],
                    '7th': [],
                    '8th': [],
                    '9th': []
                };

            if (!repeatingAttrs[0]) {
                return;
            }

            _.each(repeatingAttrs, function(s) {
                var level = s.get('name').split('_')[1].replace('spell-', ''),
                    apiButton = "[" + s.get('current') + "](~repeating_spell-" + level + "_" + s.get('name').split('_')[2] + "_spell)";

                if (level === "1") {
                    level = "1st";
                } else if (level === "2") {
                    level = "2nd";
                } else if (level === "3") {
                    level = "3rd";
                } else if (level === "4") {
                    level = "4th";
                } else if (level === "5") {
                    level = "5th";
                } else if (level === "6") {
                    level = "6th";
                } else if (level === "7") {
                    level = "7th";
                } else if (level === "8") {
                    level = "8th";
                } else if (level === "9") {
                    level = "9th";
                } else {
                    level = "Cantrips";
                }

                sb[level].push(apiButton);
                sb[level].sort();
            });

            sk = _.keys(sb);

            _.each(sk, function(e) {
                if (_.isEmpty(sb[e])) {
                    sb = _.omit(sb, e);
                }
            });

            sk = _.keys(sb);

            _.each(sk, function(e) {
                spellText += "**" + e + ":**" + "\n" + sb[e].join(' | ') + "\n\n";
            });

            if (checkAbility[0]) {
                checkAbility[0].set({
                    action: "/w @{character_name} &{template:atk} {{desc=" + spellText + "}}"
                });
            } else {
                createObj("ability", {
                    name: 'Spells',
                    action: "/w @{character_name} &{template:atk} {{desc=" + spellText + "}}",
                    characterid: id,
                    istokenaction: true
                });
            }
        },

        sortRepeating = function(name, pattern, id, usename) {
            var repeatingAttrs = filterObjs(function(o) {
                    return o.get('type') === 'attribute' && o.get('characterid') === id && o.get('name').match(name);
                }),
                sorted = _.sortBy(repeatingAttrs, (o) => o.get('current'));

            _.each(sorted, function(attr) {
                var repeatingId = attr.get('name').split('_')[2],
                    repeatingName = "a-" + attr.get('current'),
                    repeatingAction = repeatingAction = getRepeatingAction(id, pattern.replace(/%%RID%%/g, repeatingId), usename);
                if (pattern.match('npcaction-l')) {
                    repeatingName = "al-" + attr.get('current');
                }
                var checkAbility = findObjs({
                    _type: 'ability',
                    _characterid: id,
                    name: repeatingName
                });
                if (checkAbility[0]) {
                    checkAbility[0].set({
                        action: repeatingAction
                    });
                } else {
                    repeatingName = repeatingName.replace(" (One-Handed)", "-1H");
                    repeatingName = repeatingName.replace(" (Two-Handed)", "-2H");
                    repeatingName = repeatingName.replace("swarm has more than half HP", "HP>Half");
                    repeatingName = repeatingName.replace("swarm has half HP or less", "HP<=Half");
                    repeatingName = repeatingName.replace(/\s\(Recharge(.*)Short or Long Rest\)/, "-(R Short/Long)");
                    repeatingName = repeatingName.replace(/\s\(Recharge(.*)Short Rest\)/, "-(R Short)");
                    repeatingName = repeatingName.replace(/\s\(Recharge(?=.*Long Rest)(?:(?!Short).)*\)/, "-(R Long)");
                    repeatingName = repeatingName.replace(/\sVariant\)/, '\)');
                    repeatingName = repeatingName.replace(/\s\(Recharge\s(.*)\)/, '-\(R$1\)');
                    repeatingName = repeatingName.replace(/\s\(Costs\s(.*)\sActions\)/, '-\($1a\)');

                    createObj("ability", {
                        name: repeatingName,
                        action: repeatingAction,
                        characterid: id,
                        istokenaction: true
                    });
                }
            });
        },

        handleInput = function(msg) {
            var char;
            var keywords = ['attacks', 'spells', 'abilities', 'saves', 'checks', 'traits', 'reactions', 'init'];
            if (!(msg.type === 'api' && msg.selected && (msg.content.search(/^!ta\b/) || msg.content.search(/^!deleteta\b/) || msg.content.search(/^!deleteallta\b/) || msg.content.search(/^!sortta\b/)))) return;

            var args = msg.content.split(" ");
            const usename = args.includes('name') ? true : false;


            if (msg.content.search(/^(!ta|!sortta)\b/) !== -1) {
                let baseCommand = args[0];

                if (args.includes('pc')) {
                    args = [baseCommand, 'attacks', 'spells', 'checks', 'saves', 'reactions', 'init'];
                }
                if (args.includes('pc') && args.includes('name')) {
                    args = [baseCommand, 'name', 'attacks', 'spells', 'checks', 'saves', 'reactions', 'init'];
                }
                if (args.length === 1) {
                    args = [baseCommand, 'attacks', 'spells', 'checks', 'saves', 'traits', 'reactions', 'init'];
                }
                if (args.length === 2 && args.includes('name')) {
                    args = [baseCommand, 'name', 'attacks', 'spells', 'checks', 'saves', 'traits', 'reactions', 'init'];
                }

                if (args.includes("help")) {
                    let header = "<div style='width: 100%; color: #000; border: 1px solid #000; background-color: #fff; box-shadow: 0 0 3px #000; width: 90%; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 0.25em; font-family: sans-serif; white-space: pre-wrap;'>";
                    let helpText = "<b>Token Action Creator</b> <i>v." + version + "</i><br><i>Created by Kevin,<br>Modified by keithcurtis</i><br>This script creates token actions on selected tokens for the D&D 5e by Roll20 sheet. Tokens must represent character sheets, either PC or NPC.<br><br><b>!ta</b> This command will create a full suite of token abilities.<br><b>!deleteta</b> will delete ALL token actions for the selected character, whether they were created by this script or not. Use with caution.<br><br>You can create specific classes of abilities by using the following arguments separated by spaces:<ul><li><b>attacks</b> Creates a button for each attack. In the case of NPCs, this includes all Actions.<br><li><b>traits</b> Creates a button for each trait. PCs can have quite a number of these, so it is not recommended to run this command on PCs.<br><li><b>reactions</b> Creates a button for each reaction. This will be ignored on PCs since only NPC sheets have a repeating attribute for reactions.<br><li><b>spells</b>Creates a button that calls up a chat menu of all spells the character can cast.<br><li><b>checks</b> Creates a drop down menu of all Ability and Skill (Ability) checks<br><li><b>saves</b> Creates a dropdown menu of all saving throws<br><li><b>init</b> Creates a button that rolls initiative for the selected token<br><li><b>help</b> Calls up this help documentation</ul><br>Example:<br><b>!ta saves checks</b> will create token ability buttons for Ability Checks and Saving Throws.";
                    let footer = '</div>';
                    sendChat("TokenAction", "/w " + msg.who + header + helpText + footer);
                    return;
                }
            }




            if (msg.content.search(/^!ta\b/) !== -1) {
                char = _.uniq(getSelectedCharacters(msg.selected));

                if (args.includes("help")) {
                    let header = "<div style='width: 100%; color: #000; border: 1px solid #000; background-color: #fff; box-shadow: 0 0 3px #000; width: 90%; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 0.25em; font-family: sans-serif; white-space: pre-wrap;'>";
                    let helpText = "<b>Token Action Creator</b> <i>v." + version + "</i><br><i>Created by Kevin,<br>Modified by keithcurtis</i><br>This script creates token actions on selected tokens for the D&D 5e by Roll20 sheet. Tokens must represent character sheets, either PC or NPC.<br><br><b>!ta</b> This command will create a full suite of token abilities.<br><b>!deleteta</b> will delete ALL token actions for the selected character, whether they were created by this script or not. Use with caution.<br><br>You can create specific classes of abilities by using the following arguments separated by spaces:<ul><li><b>attacks</b> Creates a button for each attack. In the case of NPCs, this includes all Actions.<br><li><b>traits</b> Creates a button for each trait. PCs can have quite a number of these, so it is not recommended to run this command on PCs.<br><li><b>reactions</b> Creates a button for each reaction. This will be ignored on PCs since only NPC sheets have a repeating attribute for reactions.<br><li><b>spells</b>Creates a button that calls up a chat menu of all spells the character can cast.<br><li><b>checks</b> Creates a drop down menu of all Ability and Skill (Ability) checks<br><li><b>saves</b> Creates a dropdown menu of all saving throws<br><li><b>init</b> Creates a button that rolls initiative for the selected token<br><li><b>help</b> Calls up this help documentation</ul><br>Example:<br><b>!ta saves checks</b> will create token ability buttons for Ability Checks and Saving Throws.";
                    let footer = '</div>';
                    sendChat("TokenAction", "/w " + msg.who + header + helpText + footer);
                    return;
                }

                _.each(char, function(a) {
                    if (parseInt(isNpc(a.id)) === 1) {
                        if (args.includes("init")) {
                            createAbility('Init', "%{" + a.id + "|npc_init}", a.id);
                        }
                        if (args.includes("checks")) {
                            createAbility('Check', "@{selected|wtype}&{template:npc} @{selected|npc_name_flag} @{selected|rtype}+?{Ability|Acrobatics,[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{rname=Acrobatics&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Animal Handling,[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{rname=Animal Handling&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Arcana,[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{rname=Arcana&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Athletics,[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{rname=Athletics&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Deception,[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{rname=Deception&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |History,[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{rname=History&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Insight,[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{rname=Insight&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Intimidation,[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{rname=Intimidation&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Investigation,[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{rname=Investigation&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Medicine,[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{rname=Medicine&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Nature,[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{rname=Nature&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Perception,[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{rname=Perception&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Performance,[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{rname=Performance&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Persuasion,[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{rname=Persuasion&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Religion,[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{rname=Religion&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Sleight of Hand,[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{rname=Sleight of Hand&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Stealth,[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{rname=Stealth&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Survival,[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{rname=Survival&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Strength,[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{rname=Strength&" + "#125;&" + "#125; {{mod=[[[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Dexterity,[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{rname=Dexterity&" + "#125;&" + "#125; {{mod=[[[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Constitution,[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{rname=Constitution&" + "#125;&" + "#125; {{mod=[[[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Intelligence,[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{rname=Intelligence&" + "#125;&" + "#125; {{mod=[[[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Wisdom,[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{rname=Wisdom&" + "#125;&" + "#125; {{mod=[[[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Charisma,[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{rname=Charisma&" + "#125;&" + "#125; {{mod=[[[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125;}", a.id);
                        }
                        if (args.includes("saves")) {
                            createAbility('Save', "@{selected|wtype}&{template:npc} @{selected|npc_name_flag} @{selected|rtype}+?{Save|Strength,[[@{selected|npc_str_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_str_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_str_save}]]&" + "#125;&" + "#125;{{rname=Strength Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Dexterity,[[@{selected|npc_dex_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_dex_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_dex_save}]]&" + "#125;&" + "#125;{{rname=Dexterity Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Constitution,[[@{selected|npc_con_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_con_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_con_save}]]&" + "#125;&" + "#125;{{rname=Constitution Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Intelligence,[[@{selected|npc_int_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_int_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_int_save}]]&" + "#125;&" + "#125;{{rname=Intelligence Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Wisdom,[[@{selected|npc_wis_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_wis_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_wis_save}]]&" + "#125;&" + "#125;{{rname=Wisdom Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Charisma,[[@{selected|npc_cha_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_cha_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_cha_save}]]&" + "#125;&" + "#125;{{rname=Charisma Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125;}", a.id);
                        }
                        if (args.includes("attacks")) {
                            createRepeating(/repeating_npcaction_[^_]+_name\b/, 'repeating_npcaction_%%RID%%_npc_action', a.id, usename);
                        }
                        if (args.includes("attacks")) {
                            createRepeating(/repeating_npcaction-l_[^_]+_name\b/, 'repeating_npcaction-l_%%RID%%_npc_action', a.id, usename);
                        }
                        if (args.includes("traits")) {
                            createRepeating(/repeating_npctrait_[^_]+_name\b/, 'repeating_npctrait_%%RID%%_-npc_roll_output', a.id, usename);
                        }
                        if (args.includes("reactions")) {
                            createRepeating(/repeating_npcreaction_[^_]+_name\b/, 'repeating_npcreaction_%%RID%%_-npc_roll_output', a.id, usename);
                        }
                        if (args.includes("spells")) {
                            createSpell(a.id);
                        }
                    } else {
                        if (args.includes("init")) {
                            const name = usename ? getObj('character', a.id).get('name') : a.id;
                            createAbility('Init', "%{" + name + "|initiative}", a.id);
                        }
                        if (args.includes("checks")) {
                            createAbility('Check', "@{selected|wtype}&{template:simple} @{selected|rtype}?{Ability|Acrobatics, +@{selected|acrobatics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Acrobatics&" + "#125;&" + "#125; {{mod=@{selected|acrobatics_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|acrobatics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Animal Handling, +@{selected|animal_handling_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Animal Handling&" + "#125;&" + "#125; {{mod=@{selected|animal_handling_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|animal_handling_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Arcana, +@{selected|arcana_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Arcana&" + "#125;&" + "#125; {{mod=@{selected|arcana_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|arcana_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Athletics, +@{selected|athletics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Athletics&" + "#125;&" + "#125; {{mod=@{selected|athletics_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|athletics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Deception, +@{selected|deception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Deception&" + "#125;&" + "#125; {{mod=@{selected|deception_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|deception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |History, +@{selected|history_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=History&" + "#125;&" + "#125; {{mod=@{selected|history_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|history_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Insight, +@{selected|insight_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Insight&" + "#125;&" + "#125; {{mod=@{selected|insight_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|insight_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Intimidation, +@{selected|intimidation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Intimidation&" + "#125;&" + "#125; {{mod=@{selected|intimidation_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|intimidation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Investigation, +@{selected|investigation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Investigation&" + "#125;&" + "#125; {{mod=@{selected|investigation_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|investigation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Medicine, +@{selected|medicine_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Medicine&" + "#125;&" + "#125; {{mod=@{selected|medicine_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|medicine_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Nature, +@{selected|nature_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Nature&" + "#125;&" + "#125; {{mod=@{selected|nature_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|nature_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Perception, +@{selected|perception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Perception&" + "#125;&" + "#125; {{mod=@{selected|perception_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|perception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Performance, +@{selected|performance_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Performance&" + "#125;&" + "#125; {{mod=@{selected|performance_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|performance_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Persuasion, +@{selected|persuasion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Persuasion&" + "#125;&" + "#125; {{mod=@{selected|persuasion_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|persuasion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Religion, +@{selected|religion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Religion&" + "#125;&" + "#125; {{mod=@{selected|religion_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|religion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Sleight of Hand, +@{selected|sleight_of_hand_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Sleight of Hand&" + "#125;&" + "#125; {{mod=@{selected|sleight_of_hand_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|sleight_of_hand_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Stealth, +@{selected|stealth_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Stealth&" + "#125;&" + "#125; {{mod=@{selected|stealth_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|stealth_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Survival, +@{selected|survival_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Survival&" + "#125;&" + "#125; {{mod=@{selected|survival_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|survival_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Strength, +@{selected|strength_mod}@{selected|jack_attr}[STR]]]&" + "#125;&" + "#125; {{rname=Strength&" + "#125;&" + "#125; {{mod=@{selected|strength_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|strength_mod}@{selected|jack_attr}[STR]]]&" + "#125;&" + "#125; |Dexterity, +@{selected|dexterity_mod}@{selected|jack_attr}[DEX]]]&" + "#125;&" + "#125; {{rname=Dexterity&" + "#125;&" + "#125; {{mod=@{selected|dexterity_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|dexterity_mod}@{selected|jack_attr}[DEX]]]&" + "#125;&" + "#125; |Constitution, +@{selected|constitution_mod}@{selected|jack_attr}[CON]]]&" + "#125;&" + "#125; {{rname=Constitution&" + "#125;&" + "#125; {{mod=@{selected|constitution_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|constitution_mod}@{selected|jack_attr}[CON]]]&" + "#125;&" + "#125; |Intelligence, +@{selected|intelligence_mod}@{selected|jack_attr}[INT]]]&" + "#125;&" + "#125; {{rname=Intelligence&" + "#125;&" + "#125; {{mod=@{selected|intelligence_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|intelligence_mod}@{selected|jack_attr}[INT]]]&" + "#125;&" + "#125; |Wisdom, +@{selected|wisdom_mod}@{selected|jack_attr}[WIS]]]&" + "#125;&" + "#125; {{rname=Wisdom&" + "#125;&" + "#125; {{mod=@{selected|wisdom_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|wisdom_mod}@{selected|jack_attr}[WIS]]]&" + "#125;&" + "#125; |Charisma, +@{selected|charisma_mod}@{selected|jack_attr}[CHA]]]&" + "#125;&" + "#125; {{rname=Charisma&" + "#125;&" + "#125; {{mod=@{selected|charisma_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|charisma_mod}@{selected|jack_attr}[CHA]]]&" + "#125;&" + "#125; } @{selected|global_skill_mod} @{selected|charname_output}", a.id);
                        }
                        if (args.includes("saves")) {
                            createAbility('Save', "@{selected|wtype}&{template:simple} @{selected|rtype}?{Save|Strength, +@{selected|strength_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Strength Save&" + "#125;&" + "#125 {{mod=@{selected|strength_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|strength_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Dexterity, +@{selected|dexterity_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Dexterity Save&" + "#125;&" + "#125 {{mod=@{selected|dexterity_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|dexterity_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Constitution, +@{selected|constitution_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Constitution Save&" + "#125;&" + "#125 {{mod=@{selected|constitution_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|constitution_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Intelligence, +@{selected|intelligence_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Intelligence Save&" + "#125;&" + "#125 {{mod=@{selected|intelligence_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|intelligence_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Wisdom, +@{selected|wisdom_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Wisdom Save&" + "#125;&" + "#125 {{mod=@{selected|wisdom_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|wisdom_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Charisma, +@{selected|charisma_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Charisma Save&" + "#125;&" + "#125 {{mod=@{selected|charisma_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|charisma_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125;}@{selected|global_save_mod}@{selected|charname_output}", a.id);
                        }
                        if (args.includes("attacks")) {
                            createRepeating(/repeating_attack_[^_]+_atkname\b/, 'repeating_attack_%%RID%%_attack', a.id, usename);
                        }
                        if (args.includes("traits")) {
                            createRepeating(/repeating_traits_[^_]+_name\b/, 'repeating_traits_%%RID%%_output', a.id, usename);
                        }
                        if (args.includes("spells")) {
                            createSpell(a.id);
                        }
                    }
                    sendChat("TokenAction", "/w " + msg.who + " Created Token Actions for " + a.get('name') + ".");
                });

            } else if (msg.content.search(/^!deleteta\b/) !== -1) {
                char = _.uniq(getSelectedCharacters(msg.selected));

                _.each(char, function(d) {
                    deleteAbilities(d.id);
                    sendChat("TokenAction", "/w " + msg.who + " Deleted all unprotected Token Actions for " + d.get('name') + ".");
                });
            } else if (msg.content.search(/^!deleteallta\b/) !== -1) {
                char = _.uniq(getSelectedCharacters(msg.selected));

                _.each(char, function(d) {
                    deleteAllAbilities(d.id);
                    sendChat("TokenAction", "/w " + msg.who + " Deleted all Token Actions for " + d.get('name') + ".");
                });
            } else if (msg.content.search(/^!sortta\b/) !== -1) {

                char = _.uniq(getSelectedCharacters(msg.selected));


                _.each(char, function(a) {
                    if (parseInt(isNpc(a.id)) === 1) {
                        if (args.includes("init")) {
                            createAbility('Init', "%{" + a.id + "|npc_init}", a.id);
                        }
                        if (args.includes("checks")) {
                            createAbility('Check', "@{selected|wtype}&{template:npc} @{selected|npc_name_flag} @{selected|rtype}+?{Ability|Acrobatics,[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{rname=Acrobatics&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Animal Handling,[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{rname=Animal Handling&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Arcana,[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{rname=Arcana&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Athletics,[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{rname=Athletics&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Deception,[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{rname=Deception&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |History,[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{rname=History&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Insight,[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{rname=Insight&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Intimidation,[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{rname=Intimidation&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Investigation,[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{rname=Investigation&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Medicine,[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{rname=Medicine&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Nature,[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{rname=Nature&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Perception,[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{rname=Perception&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Performance,[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{rname=Performance&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Persuasion,[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{rname=Persuasion&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Religion,[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{rname=Religion&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Sleight of Hand,[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{rname=Sleight of Hand&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Stealth,[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{rname=Stealth&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Survival,[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{rname=Survival&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Strength,[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{rname=Strength&" + "#125;&" + "#125; {{mod=[[[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Dexterity,[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{rname=Dexterity&" + "#125;&" + "#125; {{mod=[[[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Constitution,[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{rname=Constitution&" + "#125;&" + "#125; {{mod=[[[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Intelligence,[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{rname=Intelligence&" + "#125;&" + "#125; {{mod=[[[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Wisdom,[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{rname=Wisdom&" + "#125;&" + "#125; {{mod=[[[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Charisma,[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{rname=Charisma&" + "#125;&" + "#125; {{mod=[[[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125;}", a.id);
                        }
                        if (args.includes("saves")) {
                            createAbility('Save', "@{selected|wtype}&{template:npc} @{selected|npc_name_flag} @{selected|rtype}+?{Save|Strength,[[@{selected|npc_str_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_str_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_str_save}]]&" + "#125;&" + "#125;{{rname=Strength Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Dexterity,[[@{selected|npc_dex_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_dex_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_dex_save}]]&" + "#125;&" + "#125;{{rname=Dexterity Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Constitution,[[@{selected|npc_con_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_con_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_con_save}]]&" + "#125;&" + "#125;{{rname=Constitution Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Intelligence,[[@{selected|npc_int_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_int_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_int_save}]]&" + "#125;&" + "#125;{{rname=Intelligence Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Wisdom,[[@{selected|npc_wis_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_wis_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_wis_save}]]&" + "#125;&" + "#125;{{rname=Wisdom Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Charisma,[[@{selected|npc_cha_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_cha_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_cha_save}]]&" + "#125;&" + "#125;{{rname=Charisma Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125;}", a.id);
                        }
                        if (args.includes("traits")) {
                            createRepeating(/repeating_npctrait_[^_]+_name\b/, 'repeating_npctrait_%%RID%%_-npc_roll_output', a.id, usename);
                        }
                        if (args.includes("reactions")) {
                            createRepeating(/repeating_npcreaction_[^_]+_name\b/, 'repeating_npcreaction_%%RID%%_-npc_roll_output', a.id, usename);
                        }
                        if (args.includes("spells")) {
                            createSpell(a.id);
                        }
                        if (args.includes("attacks")) {
                            sortRepeating(/repeating_npcaction_[^_]+_name\b/, 'repeating_npcaction_%%RID%%_npc_action', a.id, usename);
                        }
                        if (args.includes("attacks")) {
                            sortRepeating(/repeating_npcaction-l_[^_]+_name\b/, 'repeating_npcaction-l_%%RID%%_npc_action', a.id, usename);
                        }
                    }
                    sendChat("TokenAction", "/w " + msg.who + " Created Sorted Token Actions for " + a.get('name') + ".");
                });
            }
            return;
        },

        registerEventHandlers = function() {
            on('chat:message', handleInput);
        };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());

on('ready', function() {
    'use strict';

    tokenAction.CheckInstall();
    tokenAction.RegisterEventHandlers();
});
