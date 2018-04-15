/*
 * Version 0.0.4
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * Roll20: https://app.roll20.net/users/1226016/robin-k
 * Roll20 Thread: https://app.roll20.net/forum/post/6248700/script-beta-beyondimporter-import-dndbeyond-character-sheets
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
*/

(function() {
    // Styling for the chat responses.
    const style = "overflow: hidden; background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;";
    const buttonStyle = "background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center; float: right;"
    const conditionStyle = "background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;";
    const conditionButtonStyle = "text-decoration: underline; background-color: #fff; color: #000; padding: 0";
    const listStyle = 'list-style: none; padding: 0; margin: 0;';

    let script_name = 'Beyond Importer';
    let state_name = 'BEYONDIMPORTER';

    const skills = [
        'acrobatics',
        'animal_handling',
        'arcana',
        'athletics',
        'deception',
        'history',
        'insight',
        'intimidation',
        'investigation',
        'medicine',
        'nature',
        'perception',
        'performance',
        'persuasion',
        'religion',
        'sleight_of_hand',
        'stealth',
        'survival'
    ]

    const conditions = [
        'blinded',
        'charmed',
        'deafened',
        'fatigued',
        'frightened',
        'grappled',
        'incapacitated',
        'invisible',
        'paralyzed',
        'petrified',
        'poisoned',
        'prone',
        'restrained',
        'stunned',
        'unconscious',
        'exhaustion'
    ];

    const spell_level_formats = {
        0: 'CANTRIP',
        1: '1ST_LEVEL',
        2: '2ND_LEVEL',
        3: '3RD_LEVEL',
        4: '4TH_LEVEL',
        5: '5TH_LEVEL',
        6: '6TH_LEVEL',
        7: '7TH_LEVEL',
        8: '8TH_LEVEL',
        9: '9TH_LEVEL'
    }

    on('ready',()=>{ 
        checkInstall();
        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
        if(state[state_name].config.debug){ sendChat('', script_name + ' Ready!'); }
    });

    on('chat:message', function(msg) {
        if (msg.type != 'api') return;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if (command == state[state_name].config.command) {
            switch(extracommand){
                case 'help':
                    sendHelpMenu();
                break;

                case 'reset':
                    state[state_name] = {};
                    setDefaults(true);
                    sendConfigMenu();
                break;

                case 'config':
                    if(args.length > 0){
                        let setting = args.shift().split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        state[state_name].config[key] = value;
                    }

                    sendConfigMenu();
                break;

                case 'import':
                    var json = msg.content.substring(14);
                    var character = JSON.parse(json).character;

                    runImport(character);
                break;

                default:
                    sendHelpMenu();
                break;
            }
        }
    });

    const runImport = (character) => {
        let attributes = {};

        // Remove characters with the same name if overwrite is enabled.
        if(state[state_name].config.overwrite){
            var objects = findObjs({                                                          
                _type: "character",
                name: character.name + state[state_name].config.prefix                     
            }, {caseInsensitive: true});

            for(var i = 0; i < objects.length; i++){
                objects[i].remove();
            }
        }

        // Create character object
        var object = createObj("character", { name: character.name + state[state_name].config.prefix  });

        if(state[state_name].config.imports.inventory){
            const weapons = character.inventory.weapons;
            weapons.forEach((weapon) => {
                const ability = (weapon.definition.statModifier.dex && getTotalAbilityScore(character, 'dexterity', 'dex') > getTotalAbilityScore(character, 'strength', 'str')) ? 'DEX' : (weapon.definition.statModifier.str) ? 'STR' : 'DEX';

                let fields = {
                    name: weapon.definition.name,
                    attack_toggle: '1',
                    attack_type: (weapon.definition.attackType === 'Melee') ? 'MELEE_WEAPON_ATTACK' : 'RANGED_WEAPON_ATTACK',
                    attack_ability: ability,
                    attack_damage_dice: weapon.definition.damage.diceCount,
                    attack_damage_die: 'd' + weapon.definition.damage.diceValue,
                    attack_damage_ability: ability,
                    attack_damage_type: weapon.definition.damageType,
                    content: replaceChars(weapon.definition.description),
                    weight: weapon.definition.weight / weapon.definition.bundleSize,
                    carried: 'on',
                    toggle_details: '0'
                }

                attributes = Object.assign(attributes, createRepeating('offense', weapon.definition.name, fields, object));
            });

            const armors = character.inventory.armor;
            armors.forEach((armor) => {
                let fields = {
                    name: armor.definition.name,
                    type: armor.definition.type.toUpperCase().replace(' ', '_'),
                    strength_requirements: (armor.definition.strengthRequirement === 13) ? 'Str 13' : (armor.definition.strengthRequirement === 15) ? 'Str 15' : '0',
                    ac_base: armor.definition.armorClass,
                    content: replaceChars(armor.definition.description),
                    worn: (armor.equipped) ? 'on' : '0',
                    weight: armor.definition.weight / armor.definition.bundleSize,
                    toggle_details: '0'
                }

                attributes = Object.assign(attributes, createRepeating('armor', armor.definition.name, fields, object));
            });

            const gears = character.inventory.gear;
            gears.forEach((gear) => {
                if(gear.definition.subType === 'Ammunition'){
                    let fields = {
                        name: gear.definition.name,
                        weight: gear.definition.weight / gear.definition.bundleSize,
                        uses: gear.quantity
                    }

                    attributes = Object.assign(attributes, createRepeating('ammo', gear.definition.name, fields, object));
                }else{
                    let fields = {
                        name: gear.definition.name,
                        content: gear.definition.description,
                        weight: gear.definition.weight / gear.definition.bundleSize,
                        carried: 'on',
                        toggle_details: '0'
                    }
                    if(gear.quantity > 1){
                        fields['uses'] = gear.quantity;
                        fields['per_use'] = '1';
                        fields['weight_per_use'] = '1';
                    }

                    attributes = Object.assign(attributes, createRepeating('equipment', gear.definition.name, fields, object));
                }
            });
        }

        let resistances = getObjects(character, 'type', 'resistance');
        attributes['damage_resistances'] = '';
        resistances.forEach((resistance, i, array) => {
            if(!resistance.id.includes('spell')){
                attributes['damage_resistances'] += resistance.friendlySubtypeName;

                if(i < array.length-1){ attributes['damage_resistances'] += ', '; }
            }
        });

        let vulnerabilities = getObjects(character, 'type', 'vulnerability');
        attributes['damage_vulnerabilities'] = '';
        vulnerabilities.forEach((vulnerability, i, array) => {
            if(!vulnerability.id.includes('spell')){
                attributes['damage_vulnerabilities'] += vulnerability.friendlySubtypeName;

                if(i < array.length-1){ attributes['damage_vulnerabilities'] += ', '; }
            }
        });

        let immunities = getObjects(character, 'type', 'immunity');
        attributes['damage_immunities'] = '';
        immunities.forEach((immunity, i, array) => {
            if(!immunity.id.includes('spell')){
                let immunity_type;
                if(conditions.includes(immunity.subType)){
                    immunity_type = 'condition';
                }else{
                    immunity_type = 'damage';
                }

                attributes[immunity_type+'_immunities'] += immunity.friendlySubtypeName;
                if(i < array.length-1){ attributes[immunity_type+'_immunities'] += ', '; }
            }
        });

        attributes['speed'] = character.weightSpeeds.normal.walk + 'ft.';
        for(var type in character.weightSpeeds.normal){
            attributes['speed'] += (type !== 'walk' && character.weightSpeeds.normal[type] !== 0) ? ', ' + type + ' ' + character.weightSpeeds.normal[type] + 'ft.' : '';
        }

        if(state[state_name].config.imports.languages){
            const languages = getObjects(character, 'type', 'language');
            let str = '';
            languages.forEach((language, i, array) => {
                str += language.friendlySubtypeName

                if(i < array.length-1){ str += ', ' }
            })
            attributes['languages'] = str;
        }

        if(state[state_name].config.imports.proficiencies){
            const proficiencies = getObjects(character, 'type', 'proficiency');
            let str = '';
            proficiencies.forEach((prof, i, array) => {
                str += prof.friendlySubtypeName;

                if(i < array.length-1){ str += ', ' }

                if(prof.subType.includes('saving-throws')){
                    let ability = prof.subType.split('-').shift();
                    pre_log(ability);
                    attributes[ability+'_saving_throw_proficient'] = '1';
                }

                if(skills.includes(prof.subType)){
                    let fields = {
                        storage_name: prof.subType.replace('-', '').toUpperCase(),
                        name: prof.friendlySubtypeName,
                        proficiency: 'proficient'
                    }

                    attributes = Object.assign(attributes, createRepeating('skill', prof.subType, fields, object));
                }
            });
            attributes['proficiencies'] = str;
        }

        character.conditions.forEach((condition) => {
            if(condition.name === 'Exhaustion'){
                attributes['exhaustion_level'] = '1';
            }else{
                attributes[condition.name.toLowerCase()] = '1';
            }
        });

        if(state[state_name].config.imports.classes){
            attributes = Object.assign(attributes, importClasses(character.classes, object));
        }

        if(state[state_name].config.imports.traits){
            let raceFeatures = character.features.racialTraits;
            let feats = character.features.feats;

            feats.forEach((feat) => {
                let fields = {
                    name: feat.definition.name,
                    content: feat.definition.description,
                }

                feat.limitedUseAbilities.forEach((limited) => {
                    fields['uses'] = limited.maxUses - limited.numberUsed;
                    fields['per_use'] = 1;
                    fields['uses_max'] = limited.maxUses;
                    fields['recharge'] = limited.resetType.toUpperCase().replace(' ', '_');
                });

                attributes = Object.assign(attributes, createRepeating('feat', feat.name, fields, object));
            });
        }

        
        if(state[state_name].config.imports.bonusses){
            let bonusses = getObjects(character, 'type', 'bonus');
            bonusses.forEach((bonus) => {
                if(!bonus.id.includes('spell') && !bonus.subType.includes('_score')){
                    /*if(bonus.subType.includes('_score')){
                        let ability = bonus.subType.split("_").shift();

                        let fields = {
                            name: bonus.friendlySubtypeName,
                            ability_score_toggle: '1',
                        }

                        fields[ability + '_score_modifier'] = bonus.value;

                        attributes = Object.assign(attributes, createRepeating('modifier', bonus.id, fields, object));
                    }*/
                }
            });
        }

        let senses = getObjects(character, 'type', 'sense');
        senses.forEach((sense) => {
            attributes[sense.subType] = sense.value;
        });

        if(state[state_name].config.imports.notes){
            attributes['miscellaneous_notes'] = '';
            for(var key in character.notes){
                attributes['miscellaneous_notes'] += (key !== 'backstory' && character.notes[key] !== null) ? key.toUpperCase() + ':\n' + character.notes[key] + '\n\n' : '';
            }
            attributes['miscellaneous_notes'] += (character.faith) ? 'FAITH: ' + character.faith + '\n' : '';
            attributes['miscellaneous_notes'] += (character.lifestyle) ? 'LIFESTYLE: ' + character.lifestyle.name + ' with a ' + character.lifestyle.cost + ' cost.\n' : '';
        }

        attributes = Object.assign(attributes, { 
            // Base Info
            'background': character.background,
            'race': character.race,
            'size': character.size.toUpperCase(),
            'alignment': character.alignment,
            'xp': character.experience.current,  
            'inspiration': (character.inspiration) ? '1' : '0',          
            'temp_hp': character.hitPoints.temp || '',

            // Bio Info
            'gender': character.gender,
            'age': character.age,
            'height': character.height,
            'weight': character.weight,
            'eyes': character.eyes,
            'hair': character.hair,
            'skin': character.skin,
            'appearance': character.traits.appearance,

            // Traits
            'personality_traits': character.traits.personalityTraits,
            'ideals': character.traits.ideals,
            'bonds': character.traits.bonds,
            'flaws': character.traits.flaws,

            // currencies
            'cp': character.currencies.cp,
            'sp': character.currencies.sp,
            'gp': character.currencies.gp,
            'ep': character.currencies.ep,
            'pp': character.currencies.pp,

            // Ability Scores
            'strength': getTotalAbilityScore(character, 'strength', 'str'),
            'dexterity': getTotalAbilityScore(character, 'dexterity', 'dex'),
            'constitution': getTotalAbilityScore(character, 'constitution', 'con'),
            'intelligence': getTotalAbilityScore(character, 'intelligence', 'int'),
            'wisdom': getTotalAbilityScore(character, 'wisdom', 'wis'),
            'charisma': getTotalAbilityScore(character, 'charisma', 'cha'),

            'backstory': character.notes.backstory,
        });

        setAttrs(object.id, Object.assign(attributes)); 

        let hp = Math.floor(character.hitPoints.max + (character.level * ((attributes.constitution-10)/2)));

        createObj('attribute', {
            characterid: object.id,
            name: 'HP',
            current: hp,
            max: hp
        });

        sendChat('', '<div style="'+style+'">Import of <b>' + character.name + '</b> is ready.</div>');
    }

    const createRepeating = (section, id, fields, object) => {
        let attributes = {};
        var row = getOrMakeRowID(object,"repeating_"+section+"_",id);

        for(var field_name in fields){
            attributes["repeating_"+section+"_"+row+"_"+field_name] = fields[field_name];
        }

        return attributes;
    }

    const importClasses = (classes, object) => {
        let attributes = {};

        classes.forEach((c, i, array) => {
            var row = getOrMakeRowID(object,"repeating_class_",c.class.name);

            createObj('attribute', {
                characterid: object.id,
                name: "repeating_class_"+row+"_level",
                current: c.level
            });

            if(i < array.length-1){
                createObj('attribute', {
                    characterid: object.id,
                    name: "repeating_class_"+row+"_name",
                    current: c.class.name.toUpperCase()
                });
            }else{
                attributes["repeating_class_"+row+"_name"] = c.class.name.toUpperCase();
            }

            // Import Class Spells
            c.spells.forEach((spell) => {
                let descriptions = spell.definition.description.split('At Higher Levels. ');

                let fields = {
                    name: spell.definition.name,
                    spell_level: spell_level_formats[spell.definition.level],
                    school: spell.definition.school.toUpperCase(),
                    ritual: (spell.definition.ritual) ? 'yes' : 'no',
                    casting_time: (spell.definition.castingTime.castingTimeInterval + ' ' + spell.definition.castingTime.castingTimeUnit).replace(' ', '_').toUpperCase(),
                    range: (spell.definition.range.origin === 'Ranged') ? spell.definition.range.rangeValue : spell.definition.range.origin,
                    components: 'COMPONENTS_' + spell.definition.components.replace(', ', '_').toUpperCase(),
                    materials: spell.definition.componentsDescription,
                    duration: (spell.definition.duration.durationType === 'Time') ? (spell.definition.duration.durationInterval + ' ' + spell.definition.duration.durationUnit).replace(' ', '_').toUpperCase() : spell.definition.duration.durationType.toUpperCase(),
                    content: replaceChars(descriptions[0]),
                    higher_level: descriptions[1] || ''
                }

                let damages = getObjects(spell, 'type', 'damage');
                damages.forEach((damage, i, array) => {
                    let second = '';
                    if(i === 0){ 
                        fields['attack_toggle'] = '1'; 
                        fields['attack_type'] = spell.definition.attackType.toUpperCase() + '_SPELL_ATTACK';
                    }
                    if(i === 1){ 
                        fields['attack_second_damage_condition'] = 'PLUS'; 
                        second = 'second_';
                    }
                        
                    fields['attack_'+second+'damage_dice'] = damage.die.diceCount;
                    fields['attack_'+second+'damage_die'] = 'd' + damage.die.diceValue;
                    fields['attack_'+second+'damage_type'] = damage.friendlySubtypeName;
                });

                if(spell.definition.healing){
                    let healing = getObjects(spell, 'subType', 'hit-points').shift();

                    fields['heal_toggle'] = '1';
                    fields['heal_dice'] = healing.die.diceCount;
                    fields['heal_die'] = 'd' + healing.die.diceValue;
                }

                attributes = Object.assign(attributes, createRepeating('spell' + spell.definition.level, spell.definition.name, fields, object));
            });
        });

        return attributes;
    }

    const getRepeatingSectionAttrs = (characterId, sectionName) => {
      const prefix = `repeating_${sectionName}`;
      return _.filter(this.findObjs({ type: 'attribute', characterid: characterId }),
        attr => attr.get('name').indexOf(prefix) === 0);
    }

    const getTotalAbilityScore = (character, score, score_short) => {
        let base = character.stats[score_short],
        bonus = character.bonusStats[score_short],
        override = character.overrideStats[score_short],
        total = (override !== null) ? override + bonus : base + bonus,
        modifiers = getObjects(character, '', score + "-score");

        if(modifiers.length > 0){
            for(var i = 0; i < modifiers.length; i++){
                total += modifiers[i].value;
            }
        }

        return total;
    }

    const sendConfigMenu = (first) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', buttonStyle);
        let prefix = (state[state_name].config.prefix !== '') ? state[state_name].config.prefix : '[NONE]';
        let prefixButton = makeButton(prefix, '!' + state[state_name].config.command + ' config prefix|?{Prefix}', buttonStyle);
        let overwriteButton = makeButton(state[state_name].config.overwrite, '!' + state[state_name].config.command + ' config overwrite|'+!state[state_name].config.overwrite, buttonStyle);

        let listItems = [
            '<span style="float: left">Command:</span> ' + commandButton,
            '<span style="float: left">Overwrite:</span> '+overwriteButton,
            '<span style="float: left">Prefix:</span> '+prefixButton
        ];

        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', buttonStyle + ' width: 100%');

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        let text = '<div style="'+style+'">'+makeTitle(title_text)+makeList(listItems, listStyle + ' overflow:hidden;', 'overflow: hidden')+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton+'</div>';

        sendChat('', '/w gm ' + text);
    }

    const sendHelpMenu = (first) => {
        let configButton = makeButton('Config', '!' + state[state_name].config.command + ' config', buttonStyle + ' width: 100%;')

        let listItems = [
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' help</span> - Shows this menu.',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' config</span> - Shows the configuration menu.',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' import [CHARACTER JSON]</span> - Imports a character from <a href="http://www.dndbeyond.com" target="_blank">DNDBeyond</a>.',
        ]

        let text = '<div style="'+style+'">'+makeTitle(script_name + ' Help')+'<b>Commands:</b>'+makeList(listItems, listStyle)+'<hr>'+configButton+'</div>';

        sendChat('', '/w gm ' + text);
    }

    const makeTitle = (title) => {
        return '<h3 style="margin-bottom: 10px;">'+title+'</h3>';
    }

    const makeButton = (title, href, style) => {
        return '<a style="'+style+'" href="'+href+'">'+title+'</a>';
    }

    const makeList = (items, listStyle, itemStyle) => {
        let list = '<ul style="'+listStyle+'">';
        items.forEach((item) => {
            list += '<li style="'+itemStyle+'">'+item+'</li>';
        });
        list += '</ul>';
        return list;
    }

    const replaceChars = (text) => {
        return text.replace('&rsquo;', '\'').replace('&nbsp;', ' ')
    }

    //return an array of objects according to key, value, or key and value matching
    const getObjects = (obj, key, val) => {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(getObjects(obj[i], key, val));    
            } else 
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            if (i == key && obj[i] == val || i == key && val == '') { //
                objects.push(obj);
            } else if (obj[i] == val && key == ''){
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) == -1){
                    objects.push(obj);
                }
            }
        }
        return objects;
    }

    // Find an existing repeatable item with the same name, or generate new row ID
    const getOrMakeRowID = function(character,repeatPrefix,name){
        // Get list of all of the character's attributes
        var attrObjs = findObjs({ _type: "attribute", _characterid: character.get("_id") });

        var i = 0;
        while (i < attrObjs.length)
        {
            // If this is a feat taken multiple times, strip the number of times it was taken from the name
            var attrName = attrObjs[i].get("current").toString();
            if (regexIndexOf(attrName, / x[0-9]+$/) !== -1)
                attrName = attrName.replace(/ x[0-9]+/,"");

            if (attrObjs[i].get("name").indexOf(repeatPrefix) !== -1 && attrObjs[i].get("name").indexOf("_name") !== -1 && attrName === name)
                return attrObjs[i].get("name").substring(repeatPrefix.length,(attrObjs[i].get("name").indexOf("_name")));
            i++;
        }
        return generateRowID();
    }

    const generateUUID = (function() {
        var a = 0, b = [];
        return function() {
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
            for (f = 0; 12 > f; f++){
                c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    }())

    const generateRowID = () => {
        "use strict";
        return generateUUID().replace(/_/g, "Z");
    }

    const regexIndexOf = function(str, regex, startpos) {
        var indexOf = str.substring(startpos || 0).search(regex);
        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    }

    const pre_log = (message) => {
        log('---------------------------------------------------------------------------------------------');
        log(message);
        log('---------------------------------------------------------------------------------------------');
    }

    const checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();
    }

    const setDefaults = (reset) => {
        const defaults = {
            command: 'beyond',
            overwrite: false,
            debug: false,
            prefix: '',
            imports: {
                inventory: true,
                proficiencies: true,
                traits: true,
                classes: true,
                notes: true,
                languages: true,
                bonusses: true
            }
        };

        if(!state[state_name].config){
            state[state_name].config = defaults;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.command;
            }

            if(!state[state_name].config.hasOwnProperty('overwrite')){
                state[state_name].config.overwrite = false;
            }
            if(!state[state_name].config.hasOwnProperty('debug')){
                state[state_name].config.debug = false;
            }
            if(!state[state_name].config.hasOwnProperty('prefix')){
                state[state_name].config.prefix = '';
            }
            if(!state[state_name].config.hasOwnProperty('imports')){
                state[state_name].config.imports = {
                    inventory: true,
                    proficiencies: true,
                    traits: true,
                    classes: true,
                    notes: true,
                    languages: true,
                    bonusses: true
                };
            }else{
                if(!state[state_name].config.imports.hasOwnProperty('inventory')){
                    state[state_name].config.imports.inventory = true;
                }
                if(!state[state_name].config.imports.hasOwnProperty('proficiencies')){
                    state[state_name].config.imports.proficiencies = true;
                }
                if(!state[state_name].config.imports.hasOwnProperty('traits')){
                    state[state_name].config.imports.traits = true;
                }
                if(!state[state_name].config.imports.hasOwnProperty('classes')){
                    state[state_name].config.imports.classes = true;
                }
                if(!state[state_name].config.imports.hasOwnProperty('notes')){
                    state[state_name].config.imports.notes = true;
                }
                if(!state[state_name].config.imports.hasOwnProperty('languages')){
                    state[state_name].config.imports.languages = true;
                }
                if(!state[state_name].config.imports.hasOwnProperty('bonusses')){
                    state[state_name].config.imports.bonusses = true;
                }
            }
            
            if(!state[state_name].config.hasOwnProperty('firsttime')){
                if(!reset){
                    sendConfigMenu(true);
                }
                state[state_name].config.firsttime = false;
            }
        }
    }
})();