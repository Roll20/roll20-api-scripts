var tokenAction = tokenAction || (function () {
    'use strict';
    // Create dropdown Query menu
    // checkType is 'save' or 'check'
    // npc flag is boolean
    // selectedMacro will output a @{selected|} macro if set to true
    const createDropDown = (checkType, npc = false, selectedMacro = false) => {
        const skillLabels = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight Of Hand', 'Stealth', 'Survival'];
        const skillArray = skillLabels.map(a => a.replace(/\s/g, '_'))
        const abilityArray = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
        const npcSaveArray = abilityArray.map((ab) => ab.slice(0, 3).toUpperCase());
        let template = (npc) ? 'npc' : 'simple', // NPC alternates
            npcPrefix = (npc) ? 'npc_' : '',
            pcSuffix = (npc) ? '' : '_bonus',
            npcName = (npc) ? '@{npc_name_flag}' : '',
            saveArray = (npc) ? npcSaveArray : abilityArray;

        if (checkType === 'check') { // Skills & Ability Checks
            let skillMacroArray = skillArray.map((sk, i) => `|${skillLabels[i]},+@{${npcPrefix}${sk}${pcSuffix}}@{pbd_safe}[${(skillLabels[i] + ' ').slice(0, skillLabels[i].indexOf(' '))}]]]&#125;&#125; {{rname=${skillLabels[i]}&#125;&#125; {{mod=@{${npcPrefix}${sk}${pcSuffix}}&#125;&#125; {{r1=[[@{d20} + @{${npcPrefix}${sk}${pcSuffix}}@{pbd_safe}[${(skillLabels[i] + ' ').slice(0, skillLabels[i].indexOf(' '))}]]]`),
                abilityMacroArray = abilityArray.map((ab, i) => `|${ab},+@{${ab}_mod}@{jack_attr}[${npcSaveArray[i]}]]]&#125;&#125; {{rname=${ab}&#125;&#125; {{mod=@{${ab}_mod}@{jack_bonus}&#125;&#125; {{r1=[[ @{d20} + @{${ab}_mod}@{jack_attr}[${npcSaveArray[i]}]]]`),
                abilityMacro = `@{wtype}&{template:${template}} ${npcName} @{rtype}?{Ability${skillMacroArray.join('')}${abilityMacroArray.join('')}}}} {{global=@{global_skill_mod}}} {{type=Check}} {{typec=Check}} @{charname_output}`;
            return (selectedMacro) ? abilityMacro.replace(/@{/g, '@{selected|') : abilityMacro;
        }

        if (checkType === 'save') { // Saves
            let saveMacroArray = abilityArray.map((ab, i) => `|${ab}, +@{${npcPrefix}${saveArray[i]}_save${pcSuffix}}@{pbd_safe}[${npcSaveArray[i]} SAVE]]]&#125;&#125; {{rname=${ab} Save&#125;&#125 {{mod=@{${ab}_save_bonus}&#125;&#125; {{r1=[[@{d20}+@{${npcPrefix}${saveArray[i]}_save${pcSuffix}}@{pbd_safe}[${npcSaveArray[i]} SAVE]]]`),
                saveMacro = `@{wtype}&{template:${template}} ${npcName} @{rtype}?{Saving Throw${saveMacroArray.join('')}}}} {{global=@{global_save_mod}}} {{type=Save}} {{typec=Save}} @{charname_output}`;
            return (selectedMacro) ? saveMacro.replace(/@{/g, '@{selected|') : saveMacro;
        }
    }
    //end Oosh function

    var version = '0.3.6',
        sheetVersion = 'D&D 5th Edition by Roll20',
        sheet = '5e',
        checkInstall = function () {
            log('TokenAction v' + version + ' is ready!  Designed for use with the ' + sheetVersion + ' character sheet!');
        },

        getRepeatingAction = (id, action, usename) => {
            const name = usename ? getObj('character', id).get('name') : id;
            return `%{${name}|${action}}`;
        },

        abbreviateName = (name) => {
            name = name.replace(" (One-Handed)", "-1H");
            name = name.replace(" (Two-Handed)", "-2H");
            name = name.replace(" (Melee; One-Handed)", "-1Hm");
            name = name.replace(" (Melee; Two-Handed)", "-2Hm");
            name = name.replace(" (Psionics)", "(Psi)");
            name = name.replace(" (Melee)", "-m");
            name = name.replace(" (Ranged)", "-r");
            name = name.replace("swarm has more than half HP", "HP>Half");
            name = name.replace("swarm has half HP or less", "HP<=Half");
            name = name.replace(/\s\(Recharge(.*)Short or Long Rest\)/, "-(R Short/Long)");
            name = name.replace(/\s\(Recharge(.*)Short Rest\)/, "-(R Short)");
            name = name.replace(/\s\(Recharge(?=.*Long Rest)(?:(?!Short).)*\)/, "-(R Long)");
            name = name.replace(/\sVariant\)/, '\)');
            name = name.replace(/\s\(Recharge\s(.*)\)/, '-\(R$1\)');
            name = name.replace(/\s\(Costs\s(.*)\sActions\)/, '-\($1a\)');
            name = name.replace(/\s\(Costs\s(.*)\sActions\)/, '-\($1a\)');
            //                  PF2
            name = name.replace(/<One Action>/i, '<1>');
            name = name.replace(/<Two Actions>/i, '<2>');
            name = name.replace(/<Three Actions>/i, '<3>');
            return name;
        },


        getRepeatingTrait = (id, trait, usename) => {
            const name = usename ? getObj('character', id).get('name') : id;
            return `%{${name}|${trait}}`;
        },

        getRepeatingReaction = (id, reaction, usename) => {
            const name = usename ? getObj('character', id).get('name') : id;
            return `%{${name}|${reaction}}`;
        },

        titleCase = function (str) {
            str = str.toLowerCase();
            str = str.split(' ');
            for (var i = 0; i < str.length; i++) {
                str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);

            }
            return str.join(' ');
        },


        getFirstCharacters = function (str) {
            let result = [];

            str.split(' ').map(word => word.charAt(0) != '' ? result.push(word.charAt(0)) + result.push(word.charAt(1)) : '');
            let abbreviation = result.join('');
            //if (str.includes('+1')){abbreviation = abbreviation.replace('+','+1')};
            return abbreviation;
        },

        getSelectedCharacters = function (selected) {
            return _.chain(selected)
                .map(function (s) {
                    return getObj(s._type, s._id);
                })
                .reject(_.isUndefined)
                .map(function (c) {
                    return getObj('character', c.get('represents'));
                })
                .filter(_.identity)
                .value();
        },

        createAbility = function (name, pattern, id) {
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
                name = titleCase(name);
                createObj('ability', {
                    name: name,
                    action: pattern,
                    characterid: id,
                    istokenaction: true
                });
            }
        },

        createRepeating = function (name, pattern, id, usename) {
            var repeatingAttrs = filterObjs(function (o) {
                return o.get('type') === 'attribute' && o.get('characterid') === id && o.get('name').match(name);
            });

            _.each(repeatingAttrs, function (attr) {
                var repeatingId = attr.get('name').split('_')[2],
                    //PF2 actionCost is for PF2
                    actionCost = ((attr.get('name').includes('repeating_actions-activities')) ? ' <' + getAttrByName(id, 'repeating_actions-activities_' + repeatingId + '_actions') + '>' : ''),
                    actionCost = actionCost.replace(' <>', ''),
                    repeatingName = abbreviateName((attr.get('current').replace(/\.\s*$/, "")) + actionCost),
                    repeatingName = ((pattern.includes('npcaction-l')) ? 'l-' + repeatingName : repeatingName),
                    repeatingName = ((pattern.includes('npcaction-m')) ? 'm-' + repeatingName : repeatingName),
                    repeatingName = titleCase(repeatingName),
                    //repeatingName = (sheet === 'pf2' && pattern.includes('repeating_melee-strikes')) ?repeatingName + '-m': repeatingName,
                    repeatingName = (sheet === 'pf2' && pattern.includes('repeating_ranged-strikes')) ? repeatingName + '-R' : repeatingName,

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
                    createObj("ability", {
                        name: repeatingName,
                        action: repeatingAction,
                        characterid: id,
                        istokenaction: true
                    });

                    if (sheet === 'pf2' && repeatingAction.includes('ATTACK-DAMAGE-NPC')) {
                        createObj("ability", {
                            name: getFirstCharacters(repeatingName) + ((repeatingName.includes('-R')) ? '-R2' : '2'),
                            action: repeatingAction.replace('ATTACK-DAMAGE-NPC', 'ATTACK-DAMAGE-NPC2'),
                            characterid: id,
                            istokenaction: true
                        });
                        createObj("ability", {
                            name: getFirstCharacters(repeatingName) + ((repeatingName.includes('-R')) ? '-R3' : '3'),
                            action: repeatingAction.replace('ATTACK-DAMAGE-NPC', 'ATTACK-DAMAGE-NPC3'),
                            characterid: id,
                            istokenaction: true
                        });

                    }


                }
            });
        },





        isNpc = function (id) {

            if (sheet === '5e') {
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
            } else {
                //pf2
                var checkNpc = findObjs({
                    _type: 'attribute',
                    _characterid: id,
                    name: 'sheet_type'
                });
                if (_.isUndefined(checkNpc[0]) || checkNpc[0].get('current') === 'character') {
                    return "0";
                } else {
                    return "1";
                }
            }
        },

        deleteAbilities = function (id) {
            var abilities = findObjs({
                _type: 'ability',
                _characterid: id
            });
            _.each(abilities, function (r) {
                let abilityName = r.get('name');
                if (abilityName.includes(".", -1)) {
                } else {
                    r.remove();
                };
            });
        },

        deleteAllAbilities = function (id) {
            var abilities = findObjs({
                _type: 'ability',
                _characterid: id
            });
            _.each(abilities, function (r) {
                let abilityName = r.get('name');
                r.remove();
            });
        },


        createPF2Spell = function (id) {
            var checkAbility = findObjs({
                _type: 'ability',
                _characterid: id,
                name: 'Spells'
            }),
                repeatingAttrs = filterObjs(function (o) {//Gets all repeating attributes belonging to character
                    return o.get('type') === 'attribute' && o.get('characterid') === id; //&& o.get('name').match(/repeating_normalaspells-[^_]+_name\b/);
                });



            //###spellinate
            var allSpellInnate = repeatingAttrs.filter(name => {
                return name.get('name').includes('repeating_spellinnate');
            });
            let allSpellInnateText = "";
            allSpellInnate.forEach(a => {
                if (a.get('name').includes('_name')) {
                    allSpellInnateText = allSpellInnateText + '[' + a.get('current') + '](~selected|' + a.get('name').replace('_name', '_spellroll') + ')\n';
                }
            }
            )
            if (allSpellInnateText) { allSpellInnateText = '**Innate Spells**\n' + allSpellInnateText };

            //###SpellFocus
            var allSpellFocus = repeatingAttrs.filter(name => {
                return name.get('name').includes('repeating_spellfocus');
            });
            let allSpellFocusText = "";
            allSpellFocus.forEach(a => {
                if (a.get('name').includes('_name')) {

                    allSpellFocusText = allSpellFocusText + '[' + a.get('current') + '](~selected|' + a.get('name').replace('_name', '_spellroll') + ')\n';
                }
            }
            )
            if (allSpellFocusText) { allSpellFocusText = '**Focus Spells**\n' + allSpellFocusText };


            //###Cantrips
            var allCantrips = repeatingAttrs.filter(name => {
                return name.get('name').includes('repeating_cantrip');
            });
            let allCantripsText = "";
            allCantrips.forEach(a => {
                if (a.get('name').includes('_name')) {

                    allCantripsText = allCantripsText + '[' + a.get('current') + '](~selected|' + a.get('name').replace('_name', '_spellroll') + ') ';
                }
            }
            )
            if (allCantripsText) { allCantripsText = '**Cantrips**\n' + allCantripsText + '\n' };

            //###Normal Spells
            var allNormalSpells = repeatingAttrs.filter(name => {
                return name.get('name').includes('repeating_normalspells');
            });
            let allNormalSpellsText = "";
            let allLevelledSpellsText = "";
            let combinedLevelledSpellsText = "";

            let spellLevel = 1;
            let levelCounter = 1;
            let level = "1";

            while (levelCounter < 10) {
                level = levelCounter.toString();
                allNormalSpells.forEach(a => {
                    if (a.get('name').includes('_name')) {
                        spellLevel = getAttrByName(id, a.get('name').replace('name', 'current_level'));//gets level of current spell
                        if (spellLevel === level) {
                            allLevelledSpellsText = allLevelledSpellsText + '[' + a.get('current') + '](~selected|' + a.get('name').replace('_name', '_spellroll') + ') ';
                        }
                    }
                }
                )

                if (allLevelledSpellsText) { combinedLevelledSpellsText = combinedLevelledSpellsText + '\nLevel ' + level + '\n' + allLevelledSpellsText };
                allLevelledSpellsText = '';
                levelCounter++;
            }
            if (combinedLevelledSpellsText) { allNormalSpellsText = '**Normal Spells**' + combinedLevelledSpellsText };


            let spellChatMenu = `/w "@{selected|character_name}" &{template:rolls} {{charactername=@{selected|character_name}}} {{header=Spells}} {{desc=${allSpellInnateText}${allSpellFocusText}${allCantripsText}${allNormalSpellsText}}}`

            if (allSpellInnateText || allSpellFocusText || allCantripsText || allNormalSpellsText) {
                if (checkAbility[0]) {
                    checkAbility[0].set({
                        action: spellChatMenu
                    });
                } else {
                    createObj("ability", {
                        name: 'Spells',
                        action: spellChatMenu,
                        characterid: id,
                        istokenaction: true
                    });
                }
            }


        },


        createSpell = function (id) {
            var checkAbility = findObjs({
                _type: 'ability',
                _characterid: id,
                name: 'Spells'
            }),
                repeatingAttrs = filterObjs(function (o) {
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

            _.each(repeatingAttrs, function (s) {
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

            _.each(sk, function (e) {
                if (_.isEmpty(sb[e])) {
                    sb = _.omit(sb, e);
                }
            });

            sk = _.keys(sb);

            _.each(sk, function (e) {
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

        sortRepeating = function (name, pattern, id, usename) {
            var repeatingAttrs = filterObjs(function (o) {
                return o.get('type') === 'attribute' && o.get('characterid') === id && o.get('name').match(name);
            }),
                sorted = _.sortBy(repeatingAttrs, (o) => o.get('current'));

            _.each(sorted, function (attr) {
                var repeatingId = attr.get('name').split('_')[2],
                    //repeatingName = "a-" + attr.get('current'),
                    repeatingName = "a-" + abbreviateName(attr.get('current').replace(/\.\s*$/, "")),

                    repeatingAction = repeatingAction = getRepeatingAction(id, pattern.replace(/%%RID%%/g, repeatingId), usename);

                //5e Replacements
                if (pattern.match('npcaction-l')) {
                    repeatingName = "al-" + abbreviateName(attr.get('current').replace(/\.\s*$/, ""));
                }
                if (pattern.match('bonusaction')) {
                    repeatingName = "b-" + abbreviateName(attr.get('current').replace(/\.\s*$/, ""));
                }



                //PF2 replacements
                if (pattern.match('free-actions-reactions_')) {
                    repeatingName = "r-" + abbreviateName(attr.get('current').replace(/\.\s*$/, ""));
                }
                if (pattern.match('ATTACK-DAMAGE-NPC')) {
                    repeatingName = "a-" + abbreviateName(attr.get('current').replace(/\.\s*$/, ""));
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
                    createObj("ability", {
                        name: repeatingName,
                        action: repeatingAction,
                        characterid: id,
                        istokenaction: true
                    });




                    if (sheet === 'pf2' && repeatingAction.includes('ATTACK-DAMAGE-NPC')) {
                        createObj("ability", {
                            name: getFirstCharacters(repeatingName) + ((repeatingName.includes('-R')) ? '-R2' : '2'),
                            action: repeatingAction.replace('ATTACK-DAMAGE-NPC', 'ATTACK-DAMAGE-NPC2'),
                            characterid: id,
                            istokenaction: true
                        });
                        createObj("ability", {
                            name: getFirstCharacters(repeatingName) + ((repeatingName.includes('-R')) ? '-R3' : '3'),
                            action: repeatingAction.replace('ATTACK-DAMAGE-NPC', 'ATTACK-DAMAGE-NPC3'),
                            characterid: id,
                            istokenaction: true
                        });

                    }


                }
            });
        },

        handleInput = function (msg) {
            var char;
            var keywords = ['attacks', 'bonusactions', 'spells', 'abilities', 'saves', 'checks', 'traits', 'reactions', 'init', 'pf2', 'offensive'];
            if (!(msg.type === 'api' && msg.selected && (msg.content.search(/^!ta\b/) || msg.content.search(/^!deleteta\b/) || msg.content.search(/^!deleteallta\b/) || msg.content.search(/^!sortta\b/)))) return;
            let whom = `"${msg.who.replace(' (GM)', '')}"`;
            var args = msg.content.split(" ");
            const usename = args.includes('name') ? true : false;
            sheet = ((args.includes('pf2')) ? 'pf2' : '5e');
            //log('sheet is ' + sheet);

            if (msg.content.search(/^(!ta|!sortta)\b/) !== -1) {
                let baseCommand = args[0];

                if (sheet === '5e') {
                    if (args.includes('pc')) {
                        args = [baseCommand, 'attacks', 'spells', 'checks', 'saves', 'reactions', 'init'];
                    }
                    if (args.includes('pc') && args.includes('name')) {
                        args = [baseCommand, 'name', 'attacks', 'spells', 'checks', 'saves', 'reactions', 'init'];
                    }
                    if (args.length === 1) {
                        args = [baseCommand, 'attacks', 'bonusactions', 'spells', 'checks', 'saves', 'traits', 'reactions', 'init'];
                    }
                    if (args.length === 2 && args.includes('name')) {
                        args = [baseCommand, 'name', 'attacks', 'bonusactions', 'spells', 'checks', 'saves', 'traits', 'reactions', 'init'];
                    }
                } else {//pf2
                    if (args.includes('pc')) {
                        args = [baseCommand, 'pf2', 'attacks', 'automatic', 'reactive', 'innate', 'offensive', 'spells', 'actions', 'focus', 'ritual', 'checks', 'saves', 'init'];
                    }
                    if (args.includes('pc') && args.includes('name')) {
                        args = [baseCommand, 'pf2', 'name', 'attacks', 'automatic', 'reactive', 'innate', 'offensive', 'spells', 'actions', 'focus', 'ritual', 'checks', 'saves', 'init'];
                    }
                    if (args.length === 2) {
                        args = [baseCommand, 'pf2', 'attacks', 'automatic', 'reactive', 'interaction', 'innate', 'offensive', 'spells', 'actions', 'focus', 'ritual', 'checks', 'saves', 'init'];
                    }
                    if (args.length === 3 && args.includes('name')) {
                        args = [baseCommand, 'pf2', 'name', 'attacks', 'automatic', 'reactive', 'interaction', 'innate', 'offensive', 'spells', 'actions', 'focus', 'ritual', 'checks', 'saves', 'init'];
                    }
                    //log('args = ' + args);
                }



                if (args.includes("help")) {
                    let header = "<div style='width: 100%; color: #000; border: 1px solid #000; background-color: #fff; box-shadow: 0 0 3px #000; width: 90%; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 0.25em; font-family: sans-serif; white-space: pre-wrap;'>";
                    let helpText = `<b>Token Action Creator</b> <i>v. ${version} </i><p><em>By keithcurtis, based on original code by kevin, with assitance and additions by Oosh, GiGs, and bretmckee</em></p><p>This script creates token actions on selected tokens for the D&amp;D 5e by Roll20 sheet. Tokens must represent character sheets, either PC or NPC.</p><blockquote><p><em>0.2.9, the script will also abbreviate common phrases like &quot;(One Handed)&quot; to &quot;-1H&quot;.</em></p><p><em>0.3.3, the ability to protect specific token actions was added (put a period after the name).</em></p><p><em>0.3.4, added support for the new npc bonus action repeating field.</em></p><p><em>0.3.5, numerous fixes</em></p><p><em>0.3.6, Added support for Pathfinder 2 by Roll20 Sheet</em></p></blockquote><p><strong>!ta</strong> This command will create a full suite of token action buttons for a selected character. Actions for NPCs and Attacks for PCs.</p><p><strong>!sortta</strong> This command functions identically to !ta, but will prepend &quot;a-&quot; to NPC actions, and &quot;la-&quot; to NPC Legendary Actions. This is for users who like to alphebetize Token Actions. This is not recommended for the PF2 sheet, as it breaks the logical progression of Attack-Attack2-Attack3.</p><p><strong>!deleteta</strong> will delete unprotected token actions for the selected character. To protect a token action, end its name with a period. &quot;longsword&quot; will be deleted. &quot;longsword.&quot; will not. This allows you to keep any custom token actions from being affected by the script.</p><p><strong>!deleteallta</strong> will delete ALL token actions for the selected character, whether they were created by this script or not. Use with caution.</p><h2 id="d-d-5th-edition-by-roll20-sheet">D&amp;D 5th Edition by Roll20 Sheet</h2><p>You can create specific classes of abilities by using the following arguments separated by spaces:</p><ul><li><strong>attacks</strong> Creates a button for each attack. In the case of NPCs, this includes all Actions. (PC/NPC)</li><li><strong>trait</strong>s Creates a button for each trait. PCs can have quite a number of these, so it is not recommended to run this command on PCs. (PC*/NPC)</li><li><strong>pc</strong> creates full suite of buttons for everything but traits. Although this will also work on npcs, the intent is to not include trait buttons for pcs, which can get rather numerous. </li><li><strong>bonusactions</strong> Creates a button for each bonus action. This will be ignored on PCs since only NPC sheets have a repeating attribute for bonus actions. (NPC)</li><li><strong>reactions</strong> Creates a button for each reaction. This will be ignored on PCs since only NPC sheets have a repeating attribute for reactions. (PC)</li><li><strong>spells</strong> Creates a button that calls up a chat menu of all spells the character can cast. (PC/NPC)</li><li><strong>checks</strong> Creates a drop down menu of all Ability and Skill (Ability) checks. Recommended for NPCs, as PC checks and Saves can be affected by many different abilities as levels progress, that this script cannot account for. (PC*/NPC)</li><li><strong>saves</strong> Creates a dropdown menu of all saving throws. Recommended for NPCs, as PC checks and Saves can be affected by many different abilities as levels progress, that this script cannot account for. (PC*/NPC)</li><li><strong>init</strong> Creates a button that rolls initiative for the selected token (PC/NPC)</li><li><strong>name</strong> Normally, Token Actions are created using the character_id. They will still function even if the character is renamed. However this is not always desireable. If a character is moved to a new game via the Character Vault, it will receive a new character_id, and the token actions will not function. If you intend to move the character, use the &quot;name&quot; argument in the string and it will call the token actions by name.</li><li><strong>help</strong> Calls up this help documentation</li></ul><p>Examples:</p><p><strong>!ta saves checks</strong> will create token ability buttons for Ability Checks and Saving Throws.</p><p><strong>!ta name</strong> will create alltoken ability buttons and identify them by name, rather than character_id.</p><h2 id="pathfinder-second-edition-by-roll20-sheet">Pathfinder Second Edition by Roll20 Sheet</h2><p>All PF2 use requires adding the argument &quot;pf2&quot; to the argument list. Otherwise the script will try to create Token Actions for the 5e sheet. Until all sheets have a uniform sheet identifier attribute, this is necessary. In cases where there is an action cost, it will be indicated in the button name as <code>Action&lt;#&gt;</code>.You can create specific classes of abilities by using the following arguments separated by spaces:</p><ul><li><strong>pf2</strong> <em>Required on all PF2 commands</em></li><li><strong>attacks</strong> Creates a button for each attack. TAM will append a &#39;-M&#39; or &#39;-R&#39; after the name to distinguish melee from ranged. Each Attack will have a two buttons immediately following for Attack 2 and Attack 3. These will be abbreviated using the first two characters from each word in the Attack. Example <code>Silver Dagger</code> <code>SiDa-2</code> <code>SiDa-3</code> (PC/NPC)</li><li><strong>reactive</strong>  Creates a button for each reaction (NPC)</li><li><strong>offensive</strong>  Creates a button for each offensive ability (PC/NPC)</li><li><strong>spells</strong> Creates a button that calls up a chat menu of all spells the character can cast. These are separated by innate, focus, cantrips and normal spells. Normal Spells are separated by level. (PC/NPC)</li><li><strong>actions</strong> Creates a button for each normal action (NPC)</li><li><strong>checks</strong> Creates a drop down menu of all Skill check (PC/NPC)</li><li><strong>saves</strong> Creates a dropdown menu of all saving throws (PC/NPC)</li><li><strong>init</strong> Creates a button that rolls initiative for the selected token, obeying the skill chosen on the character sheet. The skill cannot be chosen without API interaction, so it will need to be manually chosen. (PC/NPC)</li><li><strong>name</strong> Normally, Token Actions are created using the character_id. They will still function even if the character is renamed. However this is not always desireable. If a character is moved to a new game via the Character Vault, it will receive a new character_id, and the token actions will not function. If you intend to move the character, use the &quot;name&quot; argument in the string and it will call the token actions by name.</li></ul><p>Examples:</p><p><strong>!ta pf2</strong> will generate a full suite of token actions For PCs, this would be the same as typing <code>!ta pf2 checks saves attacks offensive reactive interaction spells</code>. For PCs, this would be the same as typing <code>!ta pf2 checks saves attacks offensive spells</code>.</p><p><strong>!ta pf2 saves checks</strong> will create token ability buttons for Skill Checks and Saving Throws.</p><p><strong>!ta pf2 name</strong> will create all token ability buttons and identify them by name, rather than character_id.</p>`;
                    let footer = '</div>';
                    sendChat("TokenAction", `/w ${whom} ${header}${helpText}${footer}`);
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
                // ############PUT Switch for 5e here
                if (sheet === "5e") {
                    _.each(char, function (a) {
                        if (parseInt(isNpc(a.id)) === 1) {//5e NPC
                            if (args.includes("init")) {
                                createAbility('Init', "%{" + a.id + "|npc_init}", a.id);
                            }
                            if (args.includes("checks")) {
                                let macroContent = createDropDown('check', true);
                                createAbility('check', macroContent, a.id);

                                //                                createAbility('Check', "@{selected|wtype}&{template:npc} @{selected|npc_name_flag} @{selected|rtype}+?{Ability|Acrobatics,[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{rname=Acrobatics&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Animal Handling,[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{rname=Animal Handling&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Arcana,[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{rname=Arcana&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Athletics,[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{rname=Athletics&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Deception,[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{rname=Deception&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |History,[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{rname=History&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Insight,[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{rname=Insight&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Intimidation,[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{rname=Intimidation&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Investigation,[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{rname=Investigation&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Medicine,[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{rname=Medicine&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Nature,[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{rname=Nature&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Perception,[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{rname=Perception&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Performance,[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{rname=Performance&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Persuasion,[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{rname=Persuasion&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Religion,[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{rname=Religion&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Sleight of Hand,[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{rname=Sleight of Hand&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Stealth,[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{rname=Stealth&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Survival,[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{rname=Survival&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Strength,[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{rname=Strength&" + "#125;&" + "#125; {{mod=[[[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Dexterity,[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{rname=Dexterity&" + "#125;&" + "#125; {{mod=[[[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Constitution,[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{rname=Constitution&" + "#125;&" + "#125; {{mod=[[[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Intelligence,[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{rname=Intelligence&" + "#125;&" + "#125; {{mod=[[[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Wisdom,[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{rname=Wisdom&" + "#125;&" + "#125; {{mod=[[[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Charisma,[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{rname=Charisma&" + "#125;&" + "#125; {{mod=[[[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125;}", a.id);
                            }
                            if (args.includes("saves")) {
                                let macroContent = createDropDown('save', true);
                                createAbility('save', macroContent, a.id);

                                //                                createAbility('Save', "@{selected|wtype}&{template:npc} @{selected|npc_name_flag} @{selected|rtype}+?{Save|Strength,[[@{selected|npc_str_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_str_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_str_save}]]&" + "#125;&" + "#125;{{rname=Strength Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Dexterity,[[@{selected|npc_dex_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_dex_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_dex_save}]]&" + "#125;&" + "#125;{{rname=Dexterity Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Constitution,[[@{selected|npc_con_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_con_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_con_save}]]&" + "#125;&" + "#125;{{rname=Constitution Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Intelligence,[[@{selected|npc_int_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_int_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_int_save}]]&" + "#125;&" + "#125;{{rname=Intelligence Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Wisdom,[[@{selected|npc_wis_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_wis_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_wis_save}]]&" + "#125;&" + "#125;{{rname=Wisdom Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Charisma,[[@{selected|npc_cha_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_cha_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_cha_save}]]&" + "#125;&" + "#125;{{rname=Charisma Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125;}", a.id);
                            }
                            if (args.includes("attacks")) {
                                createRepeating(/repeating_npcaction_[^_]+_name\b/, 'repeating_npcaction_%%RID%%_npc_action', a.id, usename);
                            }
                            if (args.includes("attacks")) {
                                createRepeating(/repeating_npcaction-l_[^_]+_name\b/, 'repeating_npcaction-l_%%RID%%_npc_action', a.id, usename);
                            }
                            if (args.includes("attacks")) {
                                createRepeating(/repeating_npcaction-m_[^_]+_name\b/, 'repeating_npcaction-m_%%RID%%_npc_action', a.id, usename);
                            }
                            if (args.includes("bonusactions")) {
                                createRepeating(/repeating_npcbonusaction_[^_]+_name\b/, 'repeating_npcbonusaction_%%RID%%_npc_action', a.id, usename);
                            }
                            if (args.includes("traits")) {
                                createRepeating(/repeating_npctrait_[^_]+_name\b/, 'repeating_npctrait_%%RID%%_npc_roll_output', a.id, usename);
                            }
                            if (args.includes("reactions")) {
                                createRepeating(/repeating_npcreaction_[^_]+_name\b/, 'repeating_npcreaction_%%RID%%_npc_roll_output', a.id, usename);
                            }
                            if (args.includes("spells")) {
                                createSpell(a.id);
                            }
                        } else {
                            if (args.includes("init")) {//5e PC
                                const name = usename ? getObj('character', a.id).get('name') : a.id;
                                createAbility('Init', "%{" + name + "|initiative}", a.id);
                            }
                            if (args.includes("checks")) {
                                let macroContent = createDropDown('check', false);
                                createAbility('check', macroContent, a.id);
                                //                                createAbility('Check', "@{selected|wtype}&{template:simple} @{selected|rtype}?{Ability|Acrobatics, +@{selected|acrobatics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Acrobatics&" + "#125;&" + "#125; {{mod=@{selected|acrobatics_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|acrobatics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Animal Handling, +@{selected|animal_handling_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Animal Handling&" + "#125;&" + "#125; {{mod=@{selected|animal_handling_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|animal_handling_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Arcana, +@{selected|arcana_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Arcana&" + "#125;&" + "#125; {{mod=@{selected|arcana_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|arcana_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Athletics, +@{selected|athletics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Athletics&" + "#125;&" + "#125; {{mod=@{selected|athletics_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|athletics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Deception, +@{selected|deception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Deception&" + "#125;&" + "#125; {{mod=@{selected|deception_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|deception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |History, +@{selected|history_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=History&" + "#125;&" + "#125; {{mod=@{selected|history_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|history_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Insight, +@{selected|insight_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Insight&" + "#125;&" + "#125; {{mod=@{selected|insight_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|insight_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Intimidation, +@{selected|intimidation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Intimidation&" + "#125;&" + "#125; {{mod=@{selected|intimidation_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|intimidation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Investigation, +@{selected|investigation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Investigation&" + "#125;&" + "#125; {{mod=@{selected|investigation_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|investigation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Medicine, +@{selected|medicine_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Medicine&" + "#125;&" + "#125; {{mod=@{selected|medicine_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|medicine_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Nature, +@{selected|nature_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Nature&" + "#125;&" + "#125; {{mod=@{selected|nature_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|nature_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Perception, +@{selected|perception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Perception&" + "#125;&" + "#125; {{mod=@{selected|perception_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|perception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Performance, +@{selected|performance_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Performance&" + "#125;&" + "#125; {{mod=@{selected|performance_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|performance_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Persuasion, +@{selected|persuasion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Persuasion&" + "#125;&" + "#125; {{mod=@{selected|persuasion_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|persuasion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Religion, +@{selected|religion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Religion&" + "#125;&" + "#125; {{mod=@{selected|religion_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|religion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Sleight of Hand, +@{selected|sleight_of_hand_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Sleight of Hand&" + "#125;&" + "#125; {{mod=@{selected|sleight_of_hand_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|sleight_of_hand_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Stealth, +@{selected|stealth_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Stealth&" + "#125;&" + "#125; {{mod=@{selected|stealth_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|stealth_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Survival, +@{selected|survival_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Survival&" + "#125;&" + "#125; {{mod=@{selected|survival_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|survival_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Strength, +@{selected|strength_mod}@{selected|jack_attr}[STR]]]&" + "#125;&" + "#125; {{rname=Strength&" + "#125;&" + "#125; {{mod=@{selected|strength_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|strength_mod}@{selected|jack_attr}[STR]]]&" + "#125;&" + "#125; |Dexterity, +@{selected|dexterity_mod}@{selected|jack_attr}[DEX]]]&" + "#125;&" + "#125; {{rname=Dexterity&" + "#125;&" + "#125; {{mod=@{selected|dexterity_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|dexterity_mod}@{selected|jack_attr}[DEX]]]&" + "#125;&" + "#125; |Constitution, +@{selected|constitution_mod}@{selected|jack_attr}[CON]]]&" + "#125;&" + "#125; {{rname=Constitution&" + "#125;&" + "#125; {{mod=@{selected|constitution_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|constitution_mod}@{selected|jack_attr}[CON]]]&" + "#125;&" + "#125; |Intelligence, +@{selected|intelligence_mod}@{selected|jack_attr}[INT]]]&" + "#125;&" + "#125; {{rname=Intelligence&" + "#125;&" + "#125; {{mod=@{selected|intelligence_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|intelligence_mod}@{selected|jack_attr}[INT]]]&" + "#125;&" + "#125; |Wisdom, +@{selected|wisdom_mod}@{selected|jack_attr}[WIS]]]&" + "#125;&" + "#125; {{rname=Wisdom&" + "#125;&" + "#125; {{mod=@{selected|wisdom_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|wisdom_mod}@{selected|jack_attr}[WIS]]]&" + "#125;&" + "#125; |Charisma, +@{selected|charisma_mod}@{selected|jack_attr}[CHA]]]&" + "#125;&" + "#125; {{rname=Charisma&" + "#125;&" + "#125; {{mod=@{selected|charisma_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|charisma_mod}@{selected|jack_attr}[CHA]]]&" + "#125;&" + "#125; } @{selected|global_skill_mod} @{selected|charname_output}", a.id);
                            }

                            if (args.includes("saves")) {
                                let macroContent = createDropDown('save', false);
                                createAbility('save', macroContent, a.id);

                                //                                createAbility('Save', "@{selected|wtype}&{template:simple} @{selected|rtype}?{Save|Strength, +@{selected|strength_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Strength Save&" + "#125;&" + "#125 {{mod=@{selected|strength_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|strength_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Dexterity, +@{selected|dexterity_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Dexterity Save&" + "#125;&" + "#125 {{mod=@{selected|dexterity_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|dexterity_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Constitution, +@{selected|constitution_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Constitution Save&" + "#125;&" + "#125 {{mod=@{selected|constitution_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|constitution_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Intelligence, +@{selected|intelligence_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Intelligence Save&" + "#125;&" + "#125 {{mod=@{selected|intelligence_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|intelligence_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Wisdom, +@{selected|wisdom_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Wisdom Save&" + "#125;&" + "#125 {{mod=@{selected|wisdom_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|wisdom_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Charisma, +@{selected|charisma_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Charisma Save&" + "#125;&" + "#125 {{mod=@{selected|charisma_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|charisma_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125;}@{selected|global_save_mod}@{selected|charname_output}", a.id);
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
                        sendChat("TokenAction", `/w ${whom} Created 5e Token Actions for ${a.get('name')}.`);
                    });


                } else {


                    _.each(char, function (a) {//PF2 NPC
                        if (parseInt(isNpc(a.id)) === 1) {//PF2 NPC
                            //                            log('These are the commands that are being read : PF2 NPC');

                            if (args.includes("init")) {
                                createAbility('Init', "%{" + a.id + "|NPC_INITIATIVE}", a.id);
                            }
                            if (args.includes("checks")) {//PF2 version
                                createAbility('Check', "@{selected|whispertype} &{template:rolls} {{limit_height=@{selected|roll_limit_height}}} {{charactername=@{selected|character_name}}} {{roll01_type=skill}} {{notes_show=@{selected|roll_show_notes}}}  {{subheader=^{skill}}} ?{Skill|Acrobatics,{{roll01=[[1d20cs20cf1 + (@{selected|acrobatics})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|acrobatics_notes}&#125;&#125;{{header=Acrobatics&#125;&#125;|Arcana,{{roll01=[[1d20cs20cf1 + (@{selected|arcana})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|arcana_notes}&#125;&#125;{{header=Arcana&#125;&#125; |Athletics,{{roll01=[[1d20cs20cf1 + (@{selected|athletics})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|athletics_notes}&#125;&#125;{{header=athletics&#125;&#125; |Crafting,{{roll01=[[1d20cs20cf1 + (@{selected|crafting})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|crafting_notes}&#125;&#125;{{header=crafting&#125;&#125; |Deception,{{roll01=[[1d20cs20cf1 + (@{selected|deception})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|deception_notes}&#125;&#125;{{header=deception&#125;&#125; |Diplomacy,{{roll01=[[1d20cs20cf1 + (@{selected|diplomacy})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|diplomacy_notes}&#125;&#125;{{header=diplomacy&#125;&#125; |Intimidation,{{roll01=[[1d20cs20cf1 + (@{selected|intimidation})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|intimidation_notes}&#125;&#125;{{header=intimidation&#125;&#125; |Medicine,{{roll01=[[1d20cs20cf1 + (@{selected|medicine})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|medicine_notes}&#125;&#125;{{header=medicine&#125;&#125; |Nature,{{roll01=[[1d20cs20cf1 + (@{selected|nature})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|nature_notes}&#125;&#125;{{header=nature&#125;&#125; |Occultism,{{roll01=[[1d20cs20cf1 + (@{selected|occultism})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|occultism_notes}&#125;&#125;{{header=occultism&#125;&#125; |Performance,{{roll01=[[1d20cs20cf1 + (@{selected|performance})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|performance_notes}&#125;&#125;{{header=performance&#125;&#125; |Religion,{{roll01=[[1d20cs20cf1 + (@{selected|religion})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|religion_notes}&#125;&#125;{{header=religion&#125;&#125; |Society,{{roll01=[[1d20cs20cf1 + (@{selected|society})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|society_notes}&#125;&#125;{{header=society&#125;&#125; |Stealth,{{roll01=[[1d20cs20cf1 + (@{selected|stealth})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|stealth_notes}&#125;&#125;{{header=stealth&#125;&#125; |Survival,{{roll01=[[1d20cs20cf1 + (@{selected|survival})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|survival_notes}&#125;&#125;{{header=survival&#125;&#125; |Thievery,{{roll01=[[1d20cs20cf1 + (@{selected|thievery})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|thievery_notes}&#125;&#125;{{header=thievery&#125;&#125; }", a.id);
                            }
                            if (args.includes("saves")) {//PF2 version
                                createAbility('Save', "@{selected|whispertype} &{template:rolls} {{limit_height=@{selected|roll_limit_height}}} {{charactername=@{selected|character_name}}} {{subheader=^{saving_throw}}} {{roll01_type=saving-throw}} {{notes_show=@{selected|roll_show_notes}}} {{notes=@{selected|saving_throws_notes}}} ?{Save|Fortitude,{{roll01=[[1d20cs20cf1 + (@{selected|saving_throws_fortitude})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{header=fortitude&#125;&#125;|Reflex,{{roll01=[[1d20cs20cf1 + (@{selected|saving_throws_reflex})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125;{{header=reflex&#125;&#125;|Will,{{roll01=[[1d20cs20cf1 + (@{selected|saving_throws_will})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{header=will&#125;&#125;}", a.id);
                            }
                            if (args.includes("attacks")) {//PF2
                                createRepeating(/repeating_melee-strikes_[^_]+_weapon\b/, 'repeating_melee-strikes_%%RID%%_ATTACK-DAMAGE-NPC', a.id, usename);
                                createRepeating(/repeating_ranged-strikes_[^_]+_weapon\b/, 'repeating_ranged-strikes_%%RID%%_ATTACK-DAMAGE-NPC', a.id, usename);
                            }
                            if (args.includes("offensive")) {//PF2 version
                                createRepeating(/repeating_actions-activities_[^_]+_name\b/, 'repeating_actions-activities_%%RID%%_action-npc', a.id, usename);
                            }
                            if (args.includes("reactive")) {
                                createRepeating(/repeating_free-actions-reactions_[^_]+_name\b/, 'repeating_free-actions-reactions_%%RID%%_action-npc', a.id, usename);
                            }
                            if (args.includes("interaction")) {
                                createRepeating(/repeating_interaction-abilities_[^_]+_name\b/, 'repeating_interaction-abilities_%%RID%%_action-npc', a.id, usename);
                            }
                            if (args.includes("spells")) {
                                createPF2Spell(a.id);
                            }
                        } else {
                            //                            log('These are the commands that are being read :PF2 PC');
                            if (args.includes("init")) {//PF2 PC
                                const name = usename ? getObj('character', a.id).get('name') : a.id;
                                createAbility('Init', "%{" + name + "|initiative}", a.id);
                            }
                            if (args.includes("checks")) {
                                createAbility('Check', "@{selected|wtype}&{template:simple} @{selected|rtype}?{Ability|Acrobatics, +@{selected|acrobatics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Acrobatics&" + "#125;&" + "#125; {{mod=@{selected|acrobatics_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|acrobatics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Animal Handling, +@{selected|animal_handling_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Animal Handling&" + "#125;&" + "#125; {{mod=@{selected|animal_handling_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|animal_handling_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Arcana, +@{selected|arcana_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Arcana&" + "#125;&" + "#125; {{mod=@{selected|arcana_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|arcana_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Athletics, +@{selected|athletics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Athletics&" + "#125;&" + "#125; {{mod=@{selected|athletics_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|athletics_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Deception, +@{selected|deception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Deception&" + "#125;&" + "#125; {{mod=@{selected|deception_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|deception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |History, +@{selected|history_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=History&" + "#125;&" + "#125; {{mod=@{selected|history_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|history_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Insight, +@{selected|insight_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Insight&" + "#125;&" + "#125; {{mod=@{selected|insight_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|insight_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Intimidation, +@{selected|intimidation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Intimidation&" + "#125;&" + "#125; {{mod=@{selected|intimidation_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|intimidation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Investigation, +@{selected|investigation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Investigation&" + "#125;&" + "#125; {{mod=@{selected|investigation_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|investigation_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Medicine, +@{selected|medicine_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Medicine&" + "#125;&" + "#125; {{mod=@{selected|medicine_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|medicine_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Nature, +@{selected|nature_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Nature&" + "#125;&" + "#125; {{mod=@{selected|nature_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|nature_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Perception, +@{selected|perception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Perception&" + "#125;&" + "#125; {{mod=@{selected|perception_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|perception_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Performance, +@{selected|performance_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Performance&" + "#125;&" + "#125; {{mod=@{selected|performance_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|performance_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Persuasion, +@{selected|persuasion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Persuasion&" + "#125;&" + "#125; {{mod=@{selected|persuasion_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|persuasion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Religion, +@{selected|religion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Religion&" + "#125;&" + "#125; {{mod=@{selected|religion_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|religion_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Sleight of Hand, +@{selected|sleight_of_hand_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Sleight of Hand&" + "#125;&" + "#125; {{mod=@{selected|sleight_of_hand_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|sleight_of_hand_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Stealth, +@{selected|stealth_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Stealth&" + "#125;&" + "#125; {{mod=@{selected|stealth_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|stealth_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Survival, +@{selected|survival_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; {{rname=Survival&" + "#125;&" + "#125; {{mod=@{selected|survival_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|survival_bonus}@{selected|pbd_safe} ]]&" + "#125;&" + "#125; |Strength, +@{selected|strength_mod}@{selected|jack_attr}[STR]]]&" + "#125;&" + "#125; {{rname=Strength&" + "#125;&" + "#125; {{mod=@{selected|strength_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|strength_mod}@{selected|jack_attr}[STR]]]&" + "#125;&" + "#125; |Dexterity, +@{selected|dexterity_mod}@{selected|jack_attr}[DEX]]]&" + "#125;&" + "#125; {{rname=Dexterity&" + "#125;&" + "#125; {{mod=@{selected|dexterity_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|dexterity_mod}@{selected|jack_attr}[DEX]]]&" + "#125;&" + "#125; |Constitution, +@{selected|constitution_mod}@{selected|jack_attr}[CON]]]&" + "#125;&" + "#125; {{rname=Constitution&" + "#125;&" + "#125; {{mod=@{selected|constitution_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|constitution_mod}@{selected|jack_attr}[CON]]]&" + "#125;&" + "#125; |Intelligence, +@{selected|intelligence_mod}@{selected|jack_attr}[INT]]]&" + "#125;&" + "#125; {{rname=Intelligence&" + "#125;&" + "#125; {{mod=@{selected|intelligence_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|intelligence_mod}@{selected|jack_attr}[INT]]]&" + "#125;&" + "#125; |Wisdom, +@{selected|wisdom_mod}@{selected|jack_attr}[WIS]]]&" + "#125;&" + "#125; {{rname=Wisdom&" + "#125;&" + "#125; {{mod=@{selected|wisdom_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|wisdom_mod}@{selected|jack_attr}[WIS]]]&" + "#125;&" + "#125; |Charisma, +@{selected|charisma_mod}@{selected|jack_attr}[CHA]]]&" + "#125;&" + "#125; {{rname=Charisma&" + "#125;&" + "#125; {{mod=@{selected|charisma_mod}@{selected|jack_bonus}&" + "#125;&" + "#125; {{r1=[[ @{selected|d20} + @{selected|charisma_mod}@{selected|jack_attr}[CHA]]]&" + "#125;&" + "#125; } @{selected|global_skill_mod} @{selected|charname_output}", a.id);
                            }
                            if (args.includes("saves")) {
                                createAbility('Save', "@{selected|wtype}&{template:simple} @{selected|rtype}?{Save|Strength, +@{selected|strength_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Strength Save&" + "#125;&" + "#125 {{mod=@{selected|strength_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|strength_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Dexterity, +@{selected|dexterity_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Dexterity Save&" + "#125;&" + "#125 {{mod=@{selected|dexterity_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|dexterity_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Constitution, +@{selected|constitution_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Constitution Save&" + "#125;&" + "#125 {{mod=@{selected|constitution_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|constitution_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Intelligence, +@{selected|intelligence_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Intelligence Save&" + "#125;&" + "#125 {{mod=@{selected|intelligence_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|intelligence_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Wisdom, +@{selected|wisdom_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Wisdom Save&" + "#125;&" + "#125 {{mod=@{selected|wisdom_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|wisdom_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; |Charisma, +@{selected|charisma_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125; {{rname=Charisma Save&" + "#125;&" + "#125 {{mod=@{selected|charisma_save_bonus}&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+@{selected|charisma_save_bonus}@{selected|pbd_safe}]]&" + "#125;&" + "#125;}@{selected|global_save_mod}@{selected|charname_output}", a.id);
                            }
                            if (args.includes("attacks")) {//PF2
                                createRepeating(/repeating_melee-strikes_[^_]+_weapon\b/, 'repeating_melee-strikes_%%RID%%_ATTACK-DAMAGE-NPC', a.id, usename);
                                createRepeating(/repeating_ranged-strikes_[^_]+_weapon\b/, 'repeating_ranged-strikes_%%RID%%_ATTACK-DAMAGE-NPC', a.id, usename);
                            }
                            if (args.includes("offensive")) {//PF2
                            }
                            if (args.includes("actions")) {
                                createRepeating(/repeating_actions_[^_]+_name\b/, 'repeating_actions_%%RID%%_action', a.id, usename);
                            }
                            //                            if (args.includes("traits")) {
                            //                                createRepeating(/repeating_traits_[^_]+_name\b/, 'repeating_traits_%%RID%%_output', a.id, usename);
                            //                            }
                            if (args.includes("spells")) {
                                createPF2Spell(a.id);
                            }
                        }
                        sendChat("TokenAction", `/w ${whom} Created PF2 Token Actions for ${a.get('name')}.`);
                    });
                }
            } else if (msg.content.search(/^!deleteta\b/) !== -1) {
                char = _.uniq(getSelectedCharacters(msg.selected));

                _.each(char, function (d) {
                    deleteAbilities(d.id);
                    sendChat("TokenAction", `/w ${whom} Deleted all unprotected Token Actions for ${d.get('name')}.`);
                });
            } else if (msg.content.search(/^!deleteallta\b/) !== -1) {
                char = _.uniq(getSelectedCharacters(msg.selected));

                _.each(char, function (d) {
                    deleteAllAbilities(d.id);
                    sendChat("TokenAction", `/w ${whom} Deleted all Token Actions for ${d.get('name')}.`);
                });
            } else if (msg.content.search(/^!sortta\b/) !== -1) {

                char = _.uniq(getSelectedCharacters(msg.selected));





                if (sheet === "5e") {
                    // ############PUT Switch for 5e here


                    _.each(char, function (a) {
                        if (parseInt(isNpc(a.id)) === 1) {//5e PC Sorted
                            if (args.includes("init")) {
                                createAbility('Init', "%{" + a.id + "|npc_init}", a.id);
                            }
                            if (args.includes("checks")) {
                                let macroContent = createDropDown('check', true);
                                createAbility('Check', macroContent, a.id);

                                //                                createAbility('Check', "@{selected|wtype}&{template:npc} @{selected|npc_name_flag} @{selected|rtype}+?{Ability|Acrobatics,[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_acrobatics}]]]]&" + "#125;&" + "#125; {{rname=Acrobatics&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Animal Handling,[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_animal_handling}]]]]&" + "#125;&" + "#125; {{rname=Animal Handling&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Arcana,[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_arcana}]]]]&" + "#125;&" + "#125; {{rname=Arcana&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Athletics,[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_athletics}]]]]&" + "#125;&" + "#125; {{rname=Athletics&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Deception,[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_deception}]]]]&" + "#125;&" + "#125; {{rname=Deception&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |History,[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_history}]]]]&" + "#125;&" + "#125; {{rname=History&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Insight,[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_insight}]]]]&" + "#125;&" + "#125; {{rname=Insight&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Intimidation,[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_intimidation}]]]]&" + "#125;&" + "#125; {{rname=Intimidation&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Investigation,[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_investigation}]]]]&" + "#125;&" + "#125; {{rname=Investigation&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Medicine,[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_medicine}]]]]&" + "#125;&" + "#125; {{rname=Medicine&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Nature,[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_nature}]]]]&" + "#125;&" + "#125; {{rname=Nature&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Perception,[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_perception}]]]]&" + "#125;&" + "#125; {{rname=Perception&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Performance,[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_performance}]]]]&" + "#125;&" + "#125; {{rname=Performance&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Persuasion,[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_persuasion}]]]]&" + "#125;&" + "#125; {{rname=Persuasion&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Religion,[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_religion}]]]]&" + "#125;&" + "#125; {{rname=Religion&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Sleight of Hand,[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_sleight_of_hand}]]]]&" + "#125;&" + "#125; {{rname=Sleight of Hand&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Stealth,[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_stealth}]]]]&" + "#125;&" + "#125; {{rname=Stealth&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Survival,[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{mod=[[[[@{selected|npc_survival}]]]]&" + "#125;&" + "#125; {{rname=Survival&" + "#125;&" + "#125; {{type=Skill&" + "#125;&" + "#125; |Strength,[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{rname=Strength&" + "#125;&" + "#125; {{mod=[[[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|strength_mod}]][STR]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Dexterity,[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{rname=Dexterity&" + "#125;&" + "#125; {{mod=[[[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|dexterity_mod}]][DEX]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Constitution,[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{rname=Constitution&" + "#125;&" + "#125; {{mod=[[[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|constitution_mod}]][CON]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Intelligence,[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{rname=Intelligence&" + "#125;&" + "#125; {{mod=[[[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|intelligence_mod}]][INT]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Wisdom,[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{rname=Wisdom&" + "#125;&" + "#125; {{mod=[[[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|wisdom_mod}]][WIS]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125; |Charisma,[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{rname=Charisma&" + "#125;&" + "#125; {{mod=[[[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|charisma_mod}]][CHA]]]&" + "#125;&" + "#125; {{type=Ability&" + "#125;&" + "#125;}", a.id);
                            }
                            if (args.includes("saves")) {
                                createAbility('Save', "@{selected|wtype}&{template:npc} @{selected|npc_name_flag} @{selected|rtype}+?{Save|Strength,[[@{selected|npc_str_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_str_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_str_save}]]&" + "#125;&" + "#125;{{rname=Strength Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Dexterity,[[@{selected|npc_dex_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_dex_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_dex_save}]]&" + "#125;&" + "#125;{{rname=Dexterity Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Constitution,[[@{selected|npc_con_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_con_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_con_save}]]&" + "#125;&" + "#125;{{rname=Constitution Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Intelligence,[[@{selected|npc_int_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_int_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_int_save}]]&" + "#125;&" + "#125;{{rname=Intelligence Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Wisdom,[[@{selected|npc_wis_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_wis_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_wis_save}]]&" + "#125;&" + "#125;{{rname=Wisdom Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125; |Charisma,[[@{selected|npc_cha_save}]]]]&" + "#125;&" + "#125; {{r1=[[@{selected|d20}+[[@{selected|npc_cha_save}]]]]&" + "#125;&" + "#125; {{mod=[[@{selected|npc_cha_save}]]&" + "#125;&" + "#125;{{rname=Charisma Save&" + "#125;&" + "#125; {{type=Save&" + "#125;&" + "#125;}", a.id);
                            }
                            if (args.includes("traits")) {
                                createRepeating(/repeating_npctrait_[^_]+_name\b/, 'repeating_npctrait_%%RID%%_npc_roll_output', a.id, usename);
                            }
                            if (args.includes("reactions")) {
                                createRepeating(/repeating_npcreaction_[^_]+_name\b/, 'repeating_npcreaction_%%RID%%_npc_roll_output', a.id, usename);
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
                            if (args.includes("bonusactions")) {
                                sortRepeating(/repeating_npcbonusaction_[^_]+_name\b/, 'repeating_npcbonusaction_%%RID%%_npc_roll_output', a.id, usename);
                            }
                        }
                        sendChat("TokenAction", `/w ${whom} Created Sorted 5e Token Actions for ${a.get('name')}.`);
                    });


                } else {
                    _.each(char, function (a) {
                        sendChat("TokenAction", `/w ${whom} **Using !sortta for Pathfinder characters is not recommended. Alphabetization destroys the logical order of the *Attack-Attack2-Attack3* progression.**`);

                        if (parseInt(isNpc(a.id)) === 1) {//PF2 Sorted
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
                                createRepeating(/repeating_npctrait_[^_]+_name\b/, 'repeating_npctrait_%%RID%%_npc_roll_output', a.id, usename);
                            }
                            if (args.includes("reactions")) {
                                createRepeating(/repeating_actions-activities_[^_]+_name\b/, 'repeating_actions-activities_%%RID%%_action-npc', a.id, usename);
                            }
                            if (args.includes("spells")) {//PF2
                                createPF2Spell(a.id);
                            }
                            if (args.includes("attacks")) {//PF2
                                sortRepeating(/repeating_melee-strikes_[^_]+_weapon\b/, 'repeating_melee-strikes_%%RID%%_ATTACK-DAMAGE-NPC', a.id, usename);
                                sortRepeating(/repeating_ranged-strikes_[^_]+_weapon\b/, 'repeating_ranged-strikes_%%RID%%_ATTACK-DAMAGE-NPC', a.id, usename);
                            }
                            if (args.includes("offensive")) {//PF2
                                createRepeating(/repeating_actions-activities_[^_]+_name\b/, 'repeating_actions-activities_%%RID%%_action-npc', a.id, usename);
                            }
                            if (args.includes("reactive")) {
                                sortRepeating(/repeating_free-actions-reactions_[^_]+_name\b/, 'repeating_free-actions-reactions_%%RID%%_action-npc', a.id, usename);
                            }
                            if (args.includes("interaction")) {
                                createRepeating(/repeating_interaction-abilities_[^_]+_name\b/, 'repeating_interaction-abilities_%%RID%%_action-npc', a.id, usename);
                            }
                        }
                        sendChat("TokenAction", `/w ${whom} Created Sorted PF2 Token Actions for ${a.get('name')}.`);
                    });

                }

            }
            return;
        },

        registerEventHandlers = function () {
            on('chat:message', handleInput);
        };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());

on('ready', function () {
    'use strict';

    tokenAction.CheckInstall();
    tokenAction.RegisterEventHandlers();
});
