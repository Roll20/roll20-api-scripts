/*
 * Version 0.0.5
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1014
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
*/

var Drunk = Drunk || (function() {
    'use strict';

    // Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu:  'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
        button: 'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;',
        textButton: "text-decoration: underline; background-color: #fff; color: #000; padding: 0",
        list: 'list-style: none;',
        float: {
            right: 'float: right;',
            left: 'float: left;'
        },
        overflow: 'overflow: hidden;',
        fullWidth: 'width: 100%;',
        underline: 'text-decoration: underline;',
        strikethrough: 'text-decoration: strikethrough'
        },
    script_name = 'Drunk',
    state_name = 'DRUNK',
    markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', '-', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-tomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner',   'stopwatch','strong', 'three-leaves', 'tread', 'trophy', 'white-tower'],
    
    handleInput = (msg) => {
        if (msg.type != 'api') return;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        let playerid, characterid, character;

        if (command == state[state_name].config.command) {
            switch(extracommand){
                case 'help':
                    if(playerIsGM(msg.playerid)){ sendHelpMenu(); }
                break;

                case 'menu':
                    if(playerIsGM(msg.playerid)){ sendMenu(); }
                break;

                case 'reset':
                    if(!playerIsGM(msg.playerid)){ return; }

                    state[state_name] = {};
                    setDefaults(true);
                    sendConfigMenu();
                break;

                case 'config':
                    if(!playerIsGM(msg.playerid)){ return; }

                    if(args.length > 0){
                        let setting = args.shift().split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        state[state_name].config[key] = value;
                    }

                    sendConfigMenu();
                break;

                case 'add': case 'remove':
                    if(!playerIsGM(msg.playerid)){ return; }

                    characterid = args.shift();
                    let level = (extracommand === 'remove') ? -args.shift() || -1 : args.shift() || 1;
                    updateInebrationLevel(characterid, level, (new_level, old_level) => {
                        if(state[state_name].config.set_statusmarker){
                            if(new_level !== false && new_level !== old_level && (old_level === 0 || new_level === 0)){
                                updateStatusmarker(characterid, new_level);
                            }
                        }
                    });
                break;

                case 'show':
                    characterid = args.shift();

                    if(character = getObj('character', characterid)){
                        let attribute_name = state[state_name].config.inebriation_level_attribute_name;
                        let level = getAttrByName(characterid, attribute_name) || 0;

                        if(level > 0){
                            sendInebrationDescription(level);
                        }else{
                            makeAndSendMenu('<b>'+character.get('name')+'</b> has no inebration levels.', '', createWhisperName(msg.who));
                        }
                    }else{
                        makeAndSendMenu('Character does not exist.', '', createWhisperName(msg.who));
                    }
                break;

                default:
                    if(playerIsGM(msg.playerid)){ sendMenu(); }
                break;
            }
        }
    },


    updateStatusmarker = (characterid, new_level) => {
        let tokens = findObjs({ represents: characterid, _type: 'graphic' });

        tokens.forEach(token => {
            let statusmarkers_object = statusmarkersToObject(token.get('statusmarkers'));

            if(new_level === 0){ 
                if(!statusmarkers_object.hasOwnProperty(state[state_name].config.statusmarker)){ return; }

                delete statusmarkers_object[state[state_name].config.statusmarker]; 
            }else{
                if(statusmarkers_object.hasOwnProperty(state[state_name].config.statusmarker)){ return; }

                statusmarkers_object[state[state_name].config.statusmarker] = 0;
            }

            token.set({ statusmarkers: objectToStatusmarkers(statusmarkers_object) });
        });
    },

    ucFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    statusmarkersToObject = (stats) => {
        return _.reduce(stats.split(/,/), function(memo, value) {
            var parts = value.split(/@/),
                num = parseInt(parts[1] || '0', 10);

            if (parts[0].length) {
                memo[parts[0]] = Math.max(num, memo[parts[0]] || 0);
            }

            return memo;
        }, {});
    },

    objectToStatusmarkers = (obj) => {
        return _.map(obj, function(value, key) {
                    return key === 'dead' || value < 1 || value > 9 ? key : key + '@' + parseInt(value);
                })
                .join(',');
    },

    updateInebrationLevel = (characterid, level, callback) => {
        let new_level, old_level, character;

        let gm_chat_contents = '';
        if(character = getObj('character', characterid)){
            let attribute_name = state[state_name].config.inebriation_level_attribute_name;
            old_level = getAttrByName(characterid, attribute_name) || 0;
            new_level = (old_level+level < 0) ? 0 : (old_level+level > 5) ? 5 : old_level+level;

            if(new_level !== old_level && new_level >= 0 && new_level <= 5){
                let attributes = {};
                attributes[attribute_name] = new_level;
                setAttrs(characterid, attributes);

                //makeAndSendMenu('You have an inebration level of <b>'+new_level+'</b> now.', '', createWhisperName(character.get('name')));
                //gm_chat_contents = character.get('name') + ' has an inebration level of <b>'+new_level+'</b> now.';

                if(new_level !== 0){
                    sendInebrationDescription(new_level);
                }
            }else{
                gm_chat_contents = 'Inebration level can\'t be lower than 0 or higher than 5.';
                new_level = false;
            }
        }else{
            gm_chat_contents = 'Character does not exist.';
        }

        if(gm_chat_contents !== ''){
            makeAndSendMenu(gm_chat_contents, '', 'gm');
        }

        if(typeof callback === 'function'){
            callback(new_level, old_level);
        }
    },

    createWhisperName = (name) => {
        return name.split(' ').shift();
    },

    sendInebrationDescription = (level) => {
        let contents = '';
        state[state_name].config.inbebration_levels[level].forEach(thing => {
            contents += '<p>'+thing+'</p>';
        });

        makeAndSendMenu(contents, 'Inebration Level ' + level);
    },

    sendConfigMenu = (first) => {
        let setStatusmarkerButton = makeButton(state[state_name].config.set_statusmarker, '!' + state[state_name].config.command + ' config set_statusmarker|'+!state[state_name].config.set_statusmarker, styles.button + styles.float.right)
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right)

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
            '<span style="'+styles.float.left+'">Set Statusmarker:</span> ' + setStatusmarkerButton,
        ];

        if(state[state_name].config.set_statusmarker){
            let markerDropdown = '?{Marker';
            markers.forEach((marker) => {
                markerDropdown += '|'+ucFirst(marker).replace('-', ' ')+','+marker
            })
            markerDropdown += '}';

            let markerButton = makeButton(state[state_name].config.statusmarker, '!' + state[state_name].config.command + ' config statusmarker|'+markerDropdown, styles.button + styles.float.right);
            listItems.push('<span style="'+styles.float.left+'">Statusmarker:</span> ' + markerButton);
        }

        let levelDescriptions = '';
        if(state[state_name].config.advanced){
            levelDescriptions = '<hr>';
            for(let level in state[state_name].config.inbebration_levels){
                levelDescriptions += '<b>Level ' + level + '</b><br>';
                state[state_name].config.inbebration_levels[level].forEach((desc, i) => {
                    let removeButton = makeButton('X', '#', styles.button + styles.float.right);
                    levelDescriptions += '<p style="'+styles.overflow+'"><span style="'+styles.float.left+'">'+desc+'</span> '+removeButton+'</p>';
                });
            }
        }

        let advancedButton = ''//makeButton('Advanced: ' + state[state_name].config.advanced, '!' + state[state_name].config.command + ' config advanced|'+!state[state_name].config.advanced, styles.button + styles.fullWidth);
        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth);

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+levelDescriptions+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+advancedButton+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendHelpMenu = (first) => {
        let configButton = makeButton('Config', '!' + state[state_name].config.command + ' config', styles.button + styles.fullWidth);

        let listItems = [
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' help</span> - Shows this menu.',
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' config</span> - Shows the configuration menu.',
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' menu</span> - Shows the menu.',
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' show [characterid]</span> - Shows the amount of levels of Inebration of the character.',
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' add [characterid]</span> - Add a level of Inebration to the character.',
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' add [characterid] [amount]</span> - Add the amount of levels of Inebration to the character.',
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' remove [characterid]</span> - Remove a level of Inebration from the character.',
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' remove [characterid] [amount]</span> - Remove the amount of levels of Inebration from the character.',
        ]

        let homebrewDescription = 'These homebrew rules a made by CritGames, and can be found <a href="http://critgames.com/rpg/dnd-5e-homebrew-drinking-rules/" style="'+styles.textButton+'">here</a>.';

        let commandExampleListItems = [
            '!'+state[state_name].config.command+' show &#64;{selected|character_id}',
            '!'+state[state_name].config.command+' add &#64;{selected|character_id}',
            '!'+state[state_name].config.command+' add &#64;{selected|character_id} 3',
            '!'+state[state_name].config.command+' remove &#64;{selected|character_id}',
            '!'+state[state_name].config.command+' remove &#64;{selected|character_id} 2',
        ];

        let levelDescriptions = '<b>Inebration Levels</b><br><br>';
        for(let level in state[state_name].config.inbebration_levels){
            levelDescriptions += '<b>Level '+level+'</b><br>';
            state[state_name].config.inbebration_levels[level].forEach(desc => {
                levelDescriptions += '<p>'+desc+'</p>';
            });
        }

        //'<hr><b>Command Examples</b><br>'+makeList(commandExampleListItems, styles.reset + styles.list)+
        let contents = homebrewDescription+'<hr><b>Commands:</b>'+makeList(listItems, styles.reset + styles.list)+'<hr>'+levelDescriptions+'<hr>'+configButton;
        makeAndSendMenu(contents, script_name + ' Help', 'gm')
    },

    sendMenu = () => {
        let addButton = makeButton('Add', '!' + state[state_name].config.command + ' add &#64;{selected|character_id}', styles.button);
        let removeButton = makeButton('Remove', '!' + state[state_name].config.command + ' remove &#64;{selected|character_id}', styles.button);
        let showButton = makeButton('Show Level', '!' + state[state_name].config.command + ' show &#64;{selected|character_id}', styles.button);

        let withSelected = '<b>With Selected</b><br>'+addButton+' - '+removeButton+' - '+showButton;

        let contents = withSelected;
        makeAndSendMenu(contents, script_name + ' Menu', 'gm')
    },

    makeAndSendMenu = (contents, title, whisper) => {
        title = (title && title != '') ? makeTitle(title) : '';
        whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
        sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+'">'+title+contents+'</div>');
    },

    makeTitle = (title) => {
        return '<h3 style="margin-bottom: 10px;">'+title+'</h3>';
    },

    makeButton = (title, href, style) => {
        return '<a style="'+style+'" href="'+href+'">'+title+'</a>';
    },

    makeList = (items, listStyle, itemStyle) => {
        let list = '<ul style="'+listStyle+'">';
        items.forEach((item) => {
            list += '<li style="'+itemStyle+'">'+item+'</li>';
        });
        list += '</ul>';
        return list;
    },

    pre_log = (message) => {
        log('---------------------------------------------------------------------------------------------');
        if(message === 'line'){ return; }
        log(message);
        log('---------------------------------------------------------------------------------------------');
    },

    checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();

        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
        if(state[state_name].config.debug){ makeAndSendMenu(script_name + ' Ready! Debug On.', '', 'gm') }
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'drunk',
                advanced: false,
                inebriation_level_attribute_name: 'inebration_level',
                inbebration_dc: 10,
                inbebration_levels: {
                    1: [
                        '<b>Disadvantage</b> on <i>Persuasion</i> and <i>Deception</i>.',
                        '<b>Advantage</b> against <i>Frightened</i>.',
                        'To cast a spell, make a DC 10 Constitution saving throw or the spell fails. The spell is not wasted.'
                    ],
                    2: [
                        '<b>Disadvantage</b> on <i>Ability Checks</i>.',
                        'Roll hit dice and <b>gain</b> <i>Temporary Hit Points</i>.',
                        'To cast a spell, make a DC 10 Constitution saving throw or the spell fails. The spell is not wasted.'
                    ],
                    3: [
                        '<b>Disadvantage</b> on <i>Saving Throws</i>.',
                        'Cannot dash or move more than 10 feet in the same direction.',
                        'To cast a spell, make a DC 10 Constitution saving throw or the spell fails. The spell is not wasted.'
                    ],
                    4: [
                        '<b>Disadvantage</b> on <i>Attack Rolls</i>.',
                        '<i>Damage Resistance</i>',
                        'To cast a spell, make a DC 10 Constitution saving throw or the spell fails. The spell is not wasted.'
                    ],
                    5: [
                        'Become <i>Unconscious</i>.',
                        'To cast a spell, make a DC 10 Constitution saving throw or the spell fails. The spell is not wasted.'
                    ]
                },
                set_statusmarker: true,
                statusmarker: 'skull'
            }
        };

        // A short rest removes one level of inebriation; a long rest removes all effects of inebriation.

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
            if(!state[state_name].config.hasOwnProperty('advanced')){
                state[state_name].config.advanced = defaults.config.advanced;
            }
            if(!state[state_name].config.hasOwnProperty('inebriation_level_attribute_name')){
                state[state_name].config.inebriation_level_attribute_name = defaults.config.inebriation_level_attribute_name;
            }
            if(!state[state_name].config.hasOwnProperty('inbebration_dc')){
                state[state_name].config.inbebration_dc = defaults.config.inbebration_dc;
            }
            if(!state[state_name].config.hasOwnProperty('inbebration_levels') || typeof state[state_name].config.inbebration_levels !== 'object'){
                state[state_name].config.inbebration_levels = defaults.config.inbebration_levels;
            }
            if(!state[state_name].config.hasOwnProperty('set_statusmarker')){
                state[state_name].config.set_statusmarker = defaults.config.set_statusmarker;
            }
            if(!state[state_name].config.hasOwnProperty('statusmarker')){
                state[state_name].config.statusmarker = defaults.config.statusmarker;
            }
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    },

    registerEventHandlers = () => {
        on('chat:message', handleInput);
    };
    
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
})();

on('ready', () => { 
    'use strict';

    Drunk.CheckInstall();
    Drunk.RegisterEventHandlers();
});