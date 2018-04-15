/*
 * Version: 0.1.5
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * Roll20: https://app.roll20.net/users/1226016/robin-k
 * Roll20 Thread: https://app.roll20.net/forum/post/6252784/script-statusinfo
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * 
 * COMMANDS (with default command):
 * !condition [CONDITION] - Shows condition.
 * !condtion help - Shows help menu.
 * !condition config - Shows config menu.
*/

var StatusInfo = StatusInfo || (function() {
    'use strict';
    
    let whisper;

    // Styling for the chat responses.
    const style = "overflow: hidden; background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;",
    buttonStyle = "background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center; float: right;",
    conditionStyle = "background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;",
    conditionButtonStyle = "text-decoration: underline; background-color: #fff; color: #000; padding: 0",
    listStyle = 'list-style: none; padding: 0; margin: 0;',

    icon_image_positions = {red:"#C91010",blue:"#1076C9",green:"#2FC910",brown:"#C97310",purple:"#9510C9",pink:"#EB75E1",yellow:"#E5EB75",dead:"X",skull:0,sleepy:34,"half-heart":68,"half-haze":102,interdiction:136,snail:170,"lightning-helix":204,spanner:238,"chained-heart":272,"chemical-bolt":306,"death-zone":340,"drink-me":374,"edge-crack":408,"ninja-mask":442,stopwatch:476,"fishing-net":510,overdrive:544,strong:578,fist:612,padlock:646,"three-leaves":680,"fluffy-wing":714,pummeled:748,tread:782,arrowed:816,aura:850,"back-pain":884,"black-flag":918,"bleeding-eye":952,"bolt-shield":986,"broken-heart":1020,cobweb:1054,"broken-shield":1088,"flying-flag":1122,radioactive:1156,trophy:1190,"broken-skull":1224,"frozen-orb":1258,"rolling-bomb":1292,"white-tower":1326,grab:1360,screaming:1394,grenade:1428,"sentry-gun":1462,"all-for-one":1496,"angel-outfit":1530,"archery-target":1564},

    script_name = 'StatusInfo',
    state_name = 'STATUSINFO',
    
    // All the conditions with descriptions/icons.
    conditions = {
        blinded: {
            name: 'Blinded',
            descriptions: [
                'A blinded creature can’t see and automatically fails any ability check that requires sight.',
                'Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.'
            ],
            icon: 'bleeding-eye'
        },
        charmed: {
            name: 'Charmed',
            descriptions: [
                'A charmed creature can’t Attack the charmer or target the charmer with harmful Abilities or magical effects.',
                'The charmer has advantage on any ability check to interact socially with the creature.'
            ],
            icon: 'broken-heart'
        },
        deafened: {
            name: 'Deafened',
            descriptions: [
                'A deafened creature can’t hear and automatically fails any ability check that requires hearing.'
            ],
            icon: 'edge-crack'
        },
        frightened: {
            name: 'Frightened',
            descriptions: [
                'A frightened creature has disadvantage on Ability Checks and Attack rolls while the source of its fear is within line of sight.',
                'The creature can’t willingly move closer to the source of its fear.'
            ],
            icon: 'screaming'
        },
        grappled: {
            name: 'Grappled',
            descriptions: [
                'A grappled creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.',
                'The condition ends if the Grappler is <a style="' + conditionButtonStyle + '" href="!{command} incapacitated">incapacitated</a>.',
                'The condition also ends if an effect removes the grappled creature from the reach of the Grappler or Grappling effect, such as when a creature is hurled away by the Thunderwave spell.'
            ],
            icon: 'grab'
        },
        incapacitated: {
            name: 'Incapacitated',
            descriptions: [
                'An incapacitated creature can’t take actions or reactions.'
            ],
            icon: 'interdiction'
        },
        invisibility: {
            name: 'Invisibility',
            descriptions: [
                'An invisible creature is impossible to see without the aid of magic or a Special sense. For the purpose of Hiding, the creature is heavily obscured. The creature’s location can be detected by any noise it makes or any tracks it leaves.',
                'Attack rolls against the creature have disadvantage, and the creature’s Attack rolls have advantage.'
            ],
            icon: 'ninja-mask'
        },
        paralyzed: {
            name: 'Paralyzed',
            descriptions: [
                'A paralyzed creature is <a style="' + conditionButtonStyle + '" href="!{command} incapacitated">incapacitated</a> and can’t move or speak.',
                'The creature automatically fails Strength and Dexterity saving throws.',
                'Attack rolls against the creature have advantage.',
                'Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.'
            ],
            icon: 'pummeled'
        },
        petrified: {
            name: 'Petrified',
            descriptions: [
                'A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.',
                'The creature is <a style="' + conditionButtonStyle + '" href="!{command} incapacitated">incapacitated</a>, can’t move or speak, and is unaware of its surroundings.',
                'Attack rolls against the creature have advantage.',
                'The creature automatically fails Strength and Dexterity saving throws.',
                'The creature has Resistance to all damage.',
                'The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.'
            ],
            icon: 'frozen-orb'
        },
        poisoned: {
            name: 'Poisoned',
            descriptions: [
                'A poisoned creature has disadvantage on Attack rolls and Ability Checks.'
            ],
            icon: 'chemical-bolt'
        },
        prone: {
            name: 'Prone',
            descriptions: [
                'A prone creature’s only Movement option is to crawl, unless it stands up and thereby ends the condition.',
                'The creature has disadvantage on Attack rolls.',
                'An Attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the Attack roll has disadvantage.'
            ],
            icon: 'back-pain'
        },
        restrained: {
            name: 'Restrained',
            descriptions: [
                'A restrained creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.',
                'Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.',
                'The creature has disadvantage on Dexterity saving throws.'
            ],
            icon: 'fishing-net'
        },
        stunned: {
            name: 'Stunned',
            descriptions: [
                'A stunned creature is <a style="' + conditionButtonStyle + '" href="!{command} incapacitated">incapacitated</a>, can’t move, and can speak only falteringly.',
                'The creature automatically fails Strength and Dexterity saving throws.',
                'Attack rolls against the creature have advantage.'
            ],
            icon: 'fist'
        },
        unconscious: {
            name: 'Unconscious',
            descriptions: [
                'An unconscious creature is <a style="' + conditionButtonStyle + '" href="!{command} incapacitated">incapacitated</a>, can’t move or speak, and is unaware of its surroundings.',
                'The creature drops whatever it’s holding and falls prone.',
                'The creature automatically fails Strength and Dexterity saving throws.',
                'Attack rolls against the creature have advantage.',
                'Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.'
            ],
            icon: 'sleepy'
        },
    },

    handleInput = (msg) => {
        if (msg.type != 'api') return;

        // !condition Blinded

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if(command === state[state_name].config.command){
            switch(extracommand){
                case 'reset':
                    state[state_name] = {};
                    setDefaults(true);
                    sendConfigMenu();
                break;

                case 'help':
                    sendHelpMenu();
                break;

                case 'config':
                   if(args.length > 0){
                        let setting = args.shift().split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        if(key === 'prefix' && value.charAt(0) !== '_'){ value = '_' + value}

                        state[state_name].config[key] = value;

                        whisper = (state[state_name].config.sendOnlyToGM) ? '/w gm ' : '';
                   }

                   sendConfigMenu();
                break;

                default:
                    let condition_name;
                    if(condition_name = extracommand){
                        let condition;
                        // Check if hte condition exists in the condition object.
                        if(condition = getConditionByName(condition_name)){
                            // Send it to chat.
                            sendConditionToChat(condition);
                        }else{
                            sendChat((whisper) ? script_name : '', whisper + 'Condition ' + condition_name + ' does not exist.');
                        }
                    }else{
                        sendHelpMenu();
                    }
                break;
            }
        }
    },

    handleStatusmarkerChange = (obj, prev) => {
        if(state[state_name].config.showDescOnStatusChange){
            // Check if the statusmarkers string is different from the previous statusmarkers string.
            if(obj.get('statusmarkers') !== prev.statusmarkers){
                // Create arrays from the statusmarkers strings.
                var prevstatusmarkers = prev.statusmarkers.split(",");
                var statusmarkers = obj.get('statusmarkers').split(",");

                // Loop through the statusmarkers array.
                statusmarkers.forEach(function(marker){
                    // If it is a new statusmarkers, get the condition from the conditions object, and send it to chat.
                    if(marker !== "" && !prevstatusmarkers.includes(marker)){
                        let condition;
                        if(condition = getConditionByMarker(marker)){
                            sendConditionToChat(condition);
                        }
                    }
                });
            }
        }
    },

    getConditionByMarker = (marker) => {
        return getObjects(conditions, 'icon', marker).shift() || false;
    },

    getConditionByName = (name) => {
        return conditions[name.toLowerCase()] || false;
    },

    sendConditionToChat = (condition, w) => {
        let description = '';
        condition.descriptions.forEach((desc) => {
            description += '<p>'+desc.replace('{command}', state[state_name].config.command)+'</p>';
        });

        let icon = '';

        if(state[state_name].config.showIconInDescription){
            let X = '';
            let iconStyle = ''

            if(icon_image_positions[condition.icon]){
                iconStyle += 'width: 24px; height: 24px; margin-right: 5px; margin-top: 5px;';
                
                if(Number.isInteger(icon_image_positions[condition.icon])){
                    iconStyle += 'background-image: url(https://roll20.net/images/statussheet.png);'
                    iconStyle += 'background-position: -'+icon_image_positions[condition.icon]+'px 0;'
                }else if(icon_image_positions[condition.icon] === 'X'){
                    iconStyle += 'color: red; margin-right: 0px;';
                    X = 'X';
                }else{
                    iconStyle += 'background-color: ' + icon_image_positions[condition.icon] + ';';
                    iconStyle += 'border: 1px solid white; border-radius: 50%;'
                }
            }
            
            icon = '<div style="'+iconStyle+' display: inline-block;">'+X+'</div>';
        }

        makeAndSendMenu(description, icon+condition.name, {
            title_tag: 'h2'
        });
    },

    //return an array of objects according to key, value, or key and value matching
    getObjects = (obj, key, val) => {
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
    },

    sendConfigMenu = (first) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', buttonStyle);
        let toGMButton = makeButton(state[state_name].config.sendOnlyToGM, '!' + state[state_name].config.command + ' config sendOnlyToGM|'+!state[state_name].config.sendOnlyToGM, buttonStyle);
        let statusChangeButton = makeButton(state[state_name].config.showDescOnStatusChange, '!' + state[state_name].config.command + ' config showDescOnStatusChange|'+!state[state_name].config.showDescOnStatusChange, buttonStyle);
        let showIconButton = makeButton(state[state_name].config.showIconInDescription, '!' + state[state_name].config.command + ' config showIconInDescription|'+!state[state_name].config.showIconInDescription, buttonStyle);

        let listItems = [
            '<span style="float: left">Command:</span> ' + commandButton,
            '<span style="float: left">Only to GM:</span> '+toGMButton,
            '<span style="float: left">Show on Status Change:</span> '+statusChangeButton,
            '<span style="float: left">Display icon in chat:</span> '+showIconButton
        ];

        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', buttonStyle + ' width: 100%');

        let title_text = (first) ? script_name+' First Time Setup' : script_name+' Config';
        let contents = makeList(listItems, listStyle + ' overflow:hidden;', 'overflow: hidden')+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text)
    },

    sendHelpMenu = (first) => {
        let configButton = makeButton('Config', '!' + state[state_name].config.command + ' config', buttonStyle + ' width: 100%;')

        let listItems = [
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' help</span> - Shows this menu.',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' config</span> - Shows the configuration menu.',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' [CONDITION]</span> - Shows the description of the condition entered.'
        ]

        let contents = '<b>Commands:</b>'+makeList(listItems, listStyle)+'<hr>'+configButton;
        makeAndSendMenu(contents, script_name+' Help')
    },

    makeAndSendMenu = (contents, title, settings) => {
        settings = (settings) ? settings : {};
        title = (title && title != '') && makeTitle(title, (settings.title_tag) && settings.title_tag)
        sendChat((whisper) ? script_name : '', whisper + '<div style="'+style+'">'+title+contents+'</div>');
    },

    makeTitle = (title, title_tag) => {
        title_tag = (title_tag && title_tag !== '') ? title_tag : 'h3';
        return '<'+title_tag+' style="margin-bottom: 10px;">'+title+'</'+title_tag+'>';
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

    checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();

        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
    },

    registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic:statusmarkers', handleStatusmarkerChange);

        // Handle condition descriptions when tokenmod changes the statusmarkers on a token.
        if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
            TokenMod.ObserveTokenChange(function(obj,prev){
                handleStatusmarkerChange(obj,prev);
            });
        }
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'condition',
                sendOnlyToGM: false,
                showDescOnStatusChange: true,
                showIconInDescription: true
            }
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
            if(!state[state_name].config.hasOwnProperty('sendOnlyToGM')){
                state[state_name].config.sendOnlyToGM = defaults.config.sendOnlyToGM;
            }
            if(!state[state_name].config.hasOwnProperty('showDescOnStatusChange')){
                state[state_name].config.showDescOnStatusChange = defaults.config.showDescOnStatusChange;
            }
            if(!state[state_name].config.hasOwnProperty('showIconInDescription')){
                state[state_name].config.showIconInDescription = defaults.config.showIconInDescription;
            }
        }

        whisper = (state[state_name].config.sendOnlyToGM) ? '/w gm ' : '';

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
})();

on('ready', () => { 
    'use strict';

    StatusInfo.CheckInstall();
    StatusInfo.RegisterEventHandlers();
});