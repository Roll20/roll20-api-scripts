/*
 * Version: 0.3.8
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Roll20 Thread: https://app.roll20.net/forum/post/6252784/script-statusinfo
 * Roll20 Wiki: https://wiki.roll20.net/Script:StatusInfo
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
 * 
 * COMMANDS (with default command):
 * !condition [CONDITION] - Shows condition.
 * !condtion help - Shows help menu.
 * !condition config - Shows config menu.
 * 
 * !condition add [condtion(s)] - Add condition(s) to selected tokens, eg. !condition add prone paralyzed
 * !condition remove [condtion(s)] - Remove condition(s) from selected tokens, eg. !condition remove prone paralyzed
* !condition toggle [condtion(s)] - Toggles condition(s) of selected tokens, eg. !condition toggle prone paralyzed
 * 
 * !condition config export - Exports the config (with conditions).
 * !condition config import [json] - Import the given config (with conditions).
 * 
 * TODO:
 * Icon span
 * whisper system
 * stylings
*/

var StatusInfo = StatusInfo || (function() {
    'use strict';
    
    let whisper, handled = [],
        observers = {
            tokenChange: []
        };

    
    const version = "0.3.8",
    
    // Styling for the chat responses.
    style = "overflow: hidden; background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;",
    buttonStyle = "background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center; float: right;",
    conditionStyle = "background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;",
    conditionButtonStyle = "text-decoration: underline; background-color: #fff; color: #000; padding: 0",
    listStyle = 'list-style: none; padding: 0; margin: 0;',

    icon_image_positions = {red:"#C91010",blue:"#1076C9",green:"#2FC910",brown:"#C97310",purple:"#9510C9",pink:"#EB75E1",yellow:"#E5EB75",dead:"X",skull:0,sleepy:34,"half-heart":68,"half-haze":102,interdiction:136,snail:170,"lightning-helix":204,spanner:238,"chained-heart":272,"chemical-bolt":306,"death-zone":340,"drink-me":374,"edge-crack":408,"ninja-mask":442,stopwatch:476,"fishing-net":510,overdrive:544,strong:578,fist:612,padlock:646,"three-leaves":680,"fluffy-wing":714,pummeled:748,tread:782,arrowed:816,aura:850,"back-pain":884,"black-flag":918,"bleeding-eye":952,"bolt-shield":986,"broken-heart":1020,cobweb:1054,"broken-shield":1088,"flying-flag":1122,radioactive:1156,trophy:1190,"broken-skull":1224,"frozen-orb":1258,"rolling-bomb":1292,"white-tower":1326,grab:1360,screaming:1394,grenade:1428,"sentry-gun":1462,"all-for-one":1496,"angel-outfit":1530,"archery-target":1564},
    markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', '-', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-bomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner',   'stopwatch','strong', 'three-leaves', 'tread', 'trophy', 'white-tower'],
    shaped_conditions = ['blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'],

    script_name = 'StatusInfo',
    state_name = 'STATUSINFO',

    handleInput = (msg) => {
        if (msg.type != 'api' || !playerIsGM(msg.playerid)) return;

        // !condition BlindedBlinded

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
                        if(args[0] === 'export' || args[0] === 'import'){
                            if(args[0] === 'export'){
                                makeAndSendMenu('<pre>'+HE(JSON.stringify(state[state_name]))+'</pre><p>Copy the entire content above and save it on your pc.</p>');
                            }
                            if(args[0] === 'import'){
                                let json;
                                let config = msg.content.substring(('!'+state[state_name].config.command+' config import ').length);
                                try{
                                    json = JSON.parse(config);
                                } catch(e) {
                                    makeAndSendMenu('This is not a valid JSON string.');
                                    return;
                                }
                                state[state_name] = json;
                                sendConfigMenu();
                            }

                            return;
                        }


                        let setting = args.shift().split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        if(key === 'prefix' && value.charAt(0) !== '_'){ value = '_' + value}

                        state[state_name].config[key] = value;

                        whisper = (state[state_name].config.sendOnlyToGM) ? '/w gm ' : '';
                    }

                    sendConfigMenu();
                break;

                // !s config-conditions
                // !s config-conditions add
                // !s config-conditions prone
                // !s config-conditions prone name|blaat
                case 'config-conditions':
                    let condition = args.shift();
                    if(condition === 'add'){
                        condition = args.shift();
                        if(!condition){
                            sendConditionsConfigMenu('You didn\'t give a condition name, eg. <i>!'+state[state_name].config.command+' config-conditions add Prone</i>.');
                            return;
                        }
                        if(state[state_name].conditions[condition.toLowerCase()]){
                            sendConditionsConfigMenu('The condition `'+condition+'` already exists.');
                            return;
                        }

                        state[state_name].conditions[condition.toLowerCase()] = {
                            name: condition,
                            icon: 'red',
                            description: ''
                        }

                        sendSingleConditionConfigMenu(condition.toLowerCase());
                        return;
                    }

                    if(condition === 'remove'){
                        let condition = args.shift(),
                            justDoIt = (args.shift() === 'yes');

                        if(!justDoIt) return;

                        if(!condition){
                            sendConditionsConfigMenu('You didn\'t give a condition name, eg. <i>!'+state[state_name].config.command+' config-conditions remove Prone</i>.');
                            return;
                        }
                        if(!state[state_name].conditions[condition.toLowerCase()]){
                            sendConditionsConfigMenu('The condition `'+condition+'` does\'t exist.');
                            return;
                        }

                        delete state[state_name].conditions[condition.toLowerCase()];
                        sendConditionsConfigMenu('The condition `'+condition+'` is removed.');
                    }
                    
                    if(state[state_name].conditions[condition]){
                        if(args.length > 0){
                            let setting = args.shift().split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            if(key === 'name' && value !== state[state_name].conditions[condition].name){ 
                                state[state_name].conditions[value.toLowerCase()] = state[state_name].conditions[condition];
                                delete state[state_name].conditions[condition];
                                condition = value.toLowerCase();
                            }

                            // If we are editting the description, join the args all together in a string.
                            value = (key === 'description') ? value + ' ' + args.join(' ') : value;

                            state[state_name].conditions[condition][key] = value;
                        }

                        sendSingleConditionConfigMenu(condition);
                        return;
                    }

                    sendConditionsConfigMenu();
                break;

                case 'add': case 'remove': case 'toggle':
                    if(!msg.selected || !msg.selected.length){
                        makeAndSendMenu('No tokens are selected.');
                        return;
                    }
                    if(!args.length){
                        makeAndSendMenu('No condition(s) were given. Use: <i>!'+state[state_name].config.command+' '+extracommand+' prone</i>');
                        return;
                    }

                    let tokens = msg.selected.map(s => getObj(s._type, s._id))
                    handleConditions(args, tokens, extracommand);
                break;

                default:
                    let condition_name = extracommand;
                    if(condition_name){
                        let condition;
                        // Check if hte condition exists in the condition object.
                        if(condition = getConditionByName(condition_name)){
                            // Send it to chat.
                            sendConditionToChat(condition);
                        }else{
                            sendChat((whisper) ? script_name : '', whisper + 'Condition ' + condition_name + ' does not exist.', null, {noarchive:true});
                        }
                    }else{
                        sendMenu(msg.selected);
                    }
                break;
            }
        }
    },

    handleConditions = (conditions, tokens, type='add', error=true) => {
        conditions.forEach(condition_key => {
            if(!state[state_name].conditions[condition_key.toLowerCase()]){
                if(error) makeAndSendMenu('The condition `'+condition_key+'` does not exist.');
                return;
            }

            condition_key = condition_key.toLowerCase();

            tokens.forEach(token => {
                let prevSM = token.get('statusmarkers');
                let add = (type === 'add') ? true : (type === 'toggle') ? !token.get('status_'+getConditionByName(condition_key).icon) : false;
                token.set('status_'+getConditionByName(condition_key).icon, add);

                let prev = token;
                prev.attributes.statusmarkers = prevSM;

                notifyObservers('tokenChange', token, prev);

                if(add && !handled.includes(condition_key)){
                    sendConditionToChat(getConditionByName(condition_key));
                    doHandled(condition_key);
                }

                handleShapedSheet(token.get('represents'), condition_key, add);
            });
        });
    },

    handleShapedSheet = (characterid, condition, add) => {
        let character = getObj('character', characterid);
        if(character){
            let sheet = getAttrByName(character.get('id'), 'character_sheet', 'current');
            if(!sheet || !sheet.toLowerCase().includes('shaped')) return;
            if(!shaped_conditions.includes(condition)) return;

            let attributes = {};
            attributes[condition] = (add) ? '1': '0';
            setAttrs(character.get('id'), attributes);
        }
    },

    esRE = function (s) {
        var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },

    HE = (function(){
        var entities={
                //' ' : '&'+'nbsp'+';',
                '<' : '&'+'lt'+';',
                '>' : '&'+'gt'+';',
                "'" : '&'+'#39'+';',
                '@' : '&'+'#64'+';',
                '{' : '&'+'#123'+';',
                '|' : '&'+'#124'+';',
                '}' : '&'+'#125'+';',
                '[' : '&'+'#91'+';',
                ']' : '&'+'#93'+';',
                '"' : '&'+'quot'+';'
            },
            re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return entities[c] || c; });
        };
    }()),

    handleStatusmarkerChange = (obj, prev) => {
        if(handled.includes(obj.get('represents')) || !prev || !obj) return

        prev.statusmarkers = (typeof prev.get === 'function') ? prev.get('statusmarkers') : prev.statusmarkers;

        if(state[state_name].config.showDescOnStatusChange && typeof prev.statusmarkers === 'string'){
            // Check if the statusmarkers string is different from the previous statusmarkers string.
            if(obj.get('statusmarkers') !== prev.statusmarkers){
                // Create arrays from the statusmarkers strings.
                var prevstatusmarkers = prev.statusmarkers.split(",");
                var statusmarkers = obj.get('statusmarkers').split(",");

                // Loop through the statusmarkers array.
                statusmarkers.forEach(function(marker){
                    let condition = getConditionByMarker(marker);
                    if(!condition) return;
                    // If it is a new statusmarkers, get the condition from the conditions object, and send it to chat.
                    if(marker !== "" && !prevstatusmarkers.includes(marker)){
                        if(handled.includes(condition.name.toLowerCase())) return;

                        //sendConditionToChat(condition);
                        handleConditions([condition.name], [obj], 'add', false)
                        doHandled(obj.get('represents'));
                    }
                });

                prevstatusmarkers.forEach((marker) => {
                    let condition = getConditionByMarker(marker);
                    if(!condition) return;

                    if(marker !== '' && !statusmarkers.includes(marker)){
                        handleConditions([condition.name], [obj], 'remove', false);
                    }
                })
            }
        }
    },

    handleAttributeChange = (obj, prev) => {
        if(!shaped_conditions.includes(obj.get('name'))) return;

        let tokens = findObjs({ represents: obj.get('characterid') });

        handleConditions([obj.get('name')], tokens, (obj.get('current') === '1') ? 'add' : 'remove')
    },

    doHandled = (what) => {
        handled.push(what);
        setTimeout(() => {
            handled.splice(handled.indexOf(what), 1);
        }, 1000);
    },

    getConditionByMarker = (marker) => {
        return getObjects(state[state_name].conditions, 'icon', marker).shift() || false;
    },

    getConditionByName = (name) => {
        return state[state_name].conditions[name.toLowerCase()] || false;
    },

    sendConditionToChat = (condition, w) => {
        if(!condition.description || condition.description === '') return;

        let icon = (state[state_name].config.showIconInDescription) ? getIcon(condition.icon, 'margin-right: 5px; margin-top: 5px; display: inline-block;') || '' : '';

        makeAndSendMenu(condition.description, icon+condition.name, {
            title_tag: 'h2',
            whisper: (state[state_name].config.sendOnlyToGM) ? 'gm' : '' 
        });
    },

    getIcon = (icon, style='') => {
        let X = '';
        let iconStyle = ''

        if(typeof icon_image_positions[icon] === 'undefined') return false;
        //if(!icon_image_positions[icon]) return false;
        
        iconStyle += 'width: 24px; height: 24px;';

        if(Number.isInteger(icon_image_positions[icon])){
            iconStyle += 'background-image: url(https://roll20.net/images/statussheet.png);'
            iconStyle += 'background-repeat: no-repeat;'
            iconStyle += 'background-position: -'+icon_image_positions[icon]+'px 0;'
        }else if(icon_image_positions[icon] === 'X'){
            iconStyle += 'color: red; margin-right: 0px;';
            X = 'X';
        }else{
            iconStyle += 'background-color: ' + icon_image_positions[icon] + ';';
            iconStyle += 'border: 1px solid white; border-radius: 50%;'
        }

        iconStyle += style;

        // TODO: Make span
        return '<div style="'+iconStyle+'">'+X+'</div>';
    },

    ucFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
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

    sendConditionsConfigMenu = (message) => {
        if(!state[state_name].conditions || typeof state[state_name].conditions === 'object') setDefaults();

        let listItems = [],
            icons = [],
            check = true;
        for(let key in state[state_name].conditions){
            let configButton = makeButton('Change', '!' + state[state_name].config.command + ' config-conditions '+key, buttonStyle);
            listItems.push('<span style="float: left;">'+getIcon(state[state_name].conditions[key].icon, 'display: inline-block;')+state[state_name].conditions[key].name+'</span> ' + configButton);

            if(check && icons.includes(state[state_name].conditions[key].icon)){
                message = message || '' + '<br>Multiple conditions use the same icon';
                check = false;
            }

            icons.push(state[state_name].conditions[key].icon);
        }

        let backButton = makeButton('Back', '!' + state[state_name].config.command + ' config', buttonStyle + ' width: 100%');
        let addButton = makeButton('Add Condition', '!' + state[state_name].config.command + ' config-conditions add ?{Name}', buttonStyle + 'float: none;');

        message = (message) ? '<p style="color: red">'+message+'</p>' : '';
        let contents = makeList(listItems, listStyle + ' overflow:hidden;', 'overflow: hidden')+'<hr>'+message+addButton+'<hr>'+backButton;
        makeAndSendMenu(contents, 'Conditions');
    },

    sendSingleConditionConfigMenu = (conditionKey, message) => {
        if(!conditionKey || !state[state_name].conditions[conditionKey]){
            sendConditionsConfigMenu('Condition '+conditionKey+' does not exist.');
            return;
        }

        let condition = state[state_name].conditions[conditionKey];

        let listItems = [];
        let nameButton = makeButton(condition.name, '!' + state[state_name].config.command + ' config-conditions '+conditionKey+' name|?{Name}', buttonStyle);
        listItems.push('<span style="float: left">Name: </span> ' + nameButton);

        let markerDropdown = '?{Marker';
        markers.forEach((marker) => {
            markerDropdown += '|'+ucFirst(marker).replace(/-/g, ' ')+','+marker
        })
        markerDropdown += '}';

        let markerButton = makeButton(getIcon(condition.icon) || condition.icon, '!' + state[state_name].config.command + ' config-conditions '+conditionKey+' icon|'+markerDropdown, buttonStyle);
        listItems.push('<span style="float: left">Statusmarker: </span> ' + markerButton);

        let backButton = makeButton('Back', '!' + state[state_name].config.command + ' config-conditions', buttonStyle + ' width: 100%');
        let removeButton = makeButton('Remove', '!' + state[state_name].config.command + ' config-conditions remove '+conditionKey+' ?{Are you sure?|Yes,yes|No,no}', buttonStyle + ' width: 100%');
        let changeButton = makeButton('Edit Description', '!' + state[state_name].config.command + ' config-conditions '+conditionKey+' description|?{Description|'+condition.description+'}', buttonStyle);

        message = (message) ? '<p style="color: red">'+message+'</p>' : '';
        let contents = message+makeList(listItems, listStyle + ' overflow:hidden;', 'overflow: hidden')+'<hr><b>Description:</b>'+condition.description+changeButton+'<hr><p>'+removeButton+backButton+'</p>';
        makeAndSendMenu(contents, condition.name + ' - Config');
    },

    sendMenu = (selected, show_names) => {
        let contents = '';
        if(selected && selected.length){
            selected.forEach(s => {
                let token = getObj(s._type, s._id);
                if(token && token.get('statusmarkers') !== ''){
                    let statusmarkers = token.get('statusmarkers').split(',');
                    let active_conditions = [];
                    statusmarkers.forEach(marker => {
                        let con;
                        if(con = getObjects(state[state_name].conditions, 'icon', marker)){
                            if(con[0] && con[0].name) active_conditions.push(con[0].name);
                        }
                    });

                    if(active_conditions.length){
                        contents += '<b>'+token.get('name') + '\'s Conditions:</b><br><i>' + active_conditions.join(', ') + '</i><hr>';
                    }
                }
            });
        }

        contents += 'Toggle Condition on Selected Token(s):<br>'
        for(let condition_key in state[state_name].conditions){
            let condition = state[state_name].conditions[condition_key];
            contents += makeButton(getIcon(condition.icon) || condition.name, '!' + state[state_name].config.command + ' toggle '+condition_key, buttonStyle + 'float: none; margin-right: 5px;', condition.name);
        }
        //contents += (!show_names) ? '<br>' + makeButton('Show Names', '!' + state[state_name].config.command + ' names', buttonStyle + 'float: none;') : '<br>' + makeButton('Hide Names', '!' + state[state_name].config.command, buttonStyle + 'float: none;');

        makeAndSendMenu(contents, script_name + ' Menu');
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

        let configConditionsButton = makeButton('Conditions Config', '!' + state[state_name].config.command + ' config-conditions', buttonStyle + ' width: 100%');
        let resetButton = makeButton('Reset Config', '!' + state[state_name].config.command + ' reset', buttonStyle + ' width: 100%');

        let exportButton = makeButton('Export Config', '!' + state[state_name].config.command + ' config export', buttonStyle + ' width: 100%');
        let importButton = makeButton('Import Config', '!' + state[state_name].config.command + ' config import ?{Config}', buttonStyle + ' width: 100%');

        let title_text = (first) ? script_name+' First Time Setup' : script_name+' Config';
        let contents = makeList(listItems, listStyle + ' overflow:hidden;', 'overflow: hidden')+'<hr>'+configConditionsButton+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+exportButton+importButton+resetButton;
        makeAndSendMenu(contents, title_text)
    },

    sendHelpMenu = (first) => {
        let configButton = makeButton('Config', '!' + state[state_name].config.command + ' config', buttonStyle + ' width: 100%;')

        let listItems = [
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' help</span> - Shows this menu.',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' config</span> - Shows the configuration menu.',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' [CONDITION]</span> - Shows the description of the condition entered.',
            '&nbsp;',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' add [CONDITIONS]</span> - Add the given condition(s) to the selected token(s).',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' remove [CONDITIONS]</span> - Remove the given condition(s) from the selected token(s).',
            '&nbsp;',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' config export</span> - Exports the config (with conditions).',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' config import [JSON]</span> - Imports the given config (with conditions).'
        ]

        let contents = '<b>Commands:</b>'+makeList(listItems, listStyle)+'<hr>'+configButton;
        makeAndSendMenu(contents, script_name+' Help')
    },

    makeAndSendMenu = (contents, title, settings) => {
        settings = settings || {};
        settings.whisper = (typeof settings.whisper === 'undefined' || settings.whisper === 'gm') ? '/w gm ' : '';
        title = (title && title != '') ? makeTitle(title, settings.title_tag || '') : '';
        sendChat(script_name, settings.whisper + '<div style="'+style+'">'+title+contents+'</div>', null, {noarchive:true});
    },

    makeTitle = (title, title_tag) => {
        title_tag = (title_tag && title_tag !== '') ? title_tag : 'h3';
        return '<'+title_tag+' style="margin-bottom: 10px;">'+title+'</'+title_tag+'>';
    },

    makeButton = (title, href, style, alt) => {
        return '<a style="'+style+'" href="'+href+'" title="'+alt+'">'+title+'</a>';
    },

    makeList = (items, listStyle, itemStyle) => {
        let list = '<ul style="'+listStyle+'">';
        items.forEach((item) => {
            list += '<li style="'+itemStyle+'">'+item+'</li>';
        });
        list += '</ul>';
        return list;
    },

    getConditions = () => {
        return state[state_name].conditions;
    },

    checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();

        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
    },

    observeTokenChange = function(handler){
        if(handler && _.isFunction(handler)){
            observers.tokenChange.push(handler);
        }
    },

    notifyObservers = function(event,obj,prev){
        _.each(observers[event],function(handler){
            handler(obj,prev);
        });
    },

    registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic:statusmarkers', handleStatusmarkerChange);
        on('change:attribute', handleAttributeChange);

        // Handle condition descriptions when tokenmod changes the statusmarkers on a token.
        if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
            TokenMod.ObserveTokenChange((obj,prev) => {
                handleStatusmarkerChange(obj,prev);
            });
        }

        if('undefined' !== typeof DeathTracker && DeathTracker.ObserveTokenChange){
            DeathTracker.ObserveTokenChange((obj,prev) => {
                handleStatusmarkerChange(obj,prev);
            });
        }

        if('undefined' !== typeof InspirationTracker && InspirationTracker.ObserveTokenChange){
            InspirationTracker.ObserveTokenChange((obj,prev) => {
                handleStatusmarkerChange(obj,prev);
            });
        }

        if('undefined' !== typeof CombatTracker && CombatTracker.ObserveTokenChange){
            CombatTracker.ObserveTokenChange((obj,prev) => {
                handleStatusmarkerChange(obj,prev);
            });
        }
    },

    setDefaults = (reset) => {

        // DEVELOPER NOTE: ON CHANGE! CHECK BITCH! DENK OM OLD IMPORTS!

        const defaults = {
            config: {
                command: 'condition',
                sendOnlyToGM: false,
                showDescOnStatusChange: true,
                showIconInDescription: true
            },
            conditions: {
                blinded: {
                    name: 'Blinded',
                    description: '<p>A blinded creature can’t see and automatically fails any ability check that requires sight.</p> <p>Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.</p>',
                    icon: 'bleeding-eye'
                },
                charmed: {
                    name: 'Charmed',
                    description: '<p>A charmed creature can’t Attack the charmer or target the charmer with harmful Abilities or magical effects.</p> <p>The charmer has advantage on any ability check to interact socially with the creature.</p>',
                    icon: 'broken-heart'
                },
                deafened: {
                    name: 'Deafened',
                    description: '<p>A deafened creature can’t hear and automatically fails any ability check that requires hearing.</p>',
                    icon: 'edge-crack'
                },
                frightened: {
                    name: 'Frightened',
                    description: '<p>A frightened creature has disadvantage on Ability Checks and Attack rolls while the source of its fear is within line of sight.</p> <p>The creature can’t willingly move closer to the source of its fear.</p>',
                    icon: 'screaming'
                },
                grappled: {
                    name: 'Grappled',
                    description: '<p>A grappled creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.</p> <p>The condition ends if the Grappler is <i>incapacitated</i>.</p> <p>The condition also ends if an effect removes the grappled creature from the reach of the Grappler or Grappling effect, such as when a creature is hurled away by the Thunderwave spell.</p>',
                    icon: 'grab'
                },
                incapacitated: {
                    name: 'Incapacitated',
                    description: '<p>An incapacitated creature can’t take actions or reactions.</p>',
                    icon: 'interdiction'
                },
                inspiration: {
                    name: 'Inspiration',
                    description: '<p>If you have inspiration, you can expend it when you make an Attack roll, saving throw, or ability check. Spending your inspiration gives you advantage on that roll.</p> <p>Additionally, if you have inspiration, you can reward another player for good roleplaying, clever thinking, or simply doing something exciting in the game. When another player character does something that really contributes to the story in a fun and interesting way, you can give up your inspiration to give that character inspiration.</p>',
                    icon: 'black-flag'
                },
                invisibility: {
                    name: 'Invisibility',
                    description: '<p>An invisible creature is impossible to see without the aid of magic or a Special sense. For the purpose of Hiding, the creature is heavily obscured. The creature’s location can be detected by any noise it makes or any tracks it leaves.</p> <p>Attack rolls against the creature have disadvantage, and the creature’s Attack rolls have advantage.</p>',
                    icon: 'ninja-mask'
                },
                paralyzed: {
                    name: 'Paralyzed',
                    description: '<p>A paralyzed creature is <i>incapacitated</i> and can’t move or speak.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p> <p>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</p>',
                    icon: 'pummeled'
                },
                petrified: {
                    name: 'Petrified',
                    description: '<p>A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.</p> <p>The creature is <i>incapacitated</i>, can’t move or speak, and is unaware of its surroundings.</p> <p>Attack rolls against the creature have advantage.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>The creature has Resistance to all damage.</p> <p>The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.</p>',
                    icon: 'frozen-orb'
                },
                poisoned: {
                    name: 'Poisoned',
                    description: '<p>A poisoned creature has disadvantage on Attack rolls and Ability Checks.</p>',
                    icon: 'chemical-bolt'
                },
                prone: {
                    name: 'Prone',
                    description: '<p>A prone creature’s only Movement option is to crawl, unless it stands up and thereby ends the condition.</p> <p>The creature has disadvantage on Attack rolls.</p> <p>An Attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the Attack roll has disadvantage.</p>',
                    icon: 'back-pain'
                },
                restrained: {
                    name: 'Restrained',
                    description: '<p>A restrained creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.</p> <p>Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.</p> <p>The creature has disadvantage on Dexterity saving throws.</p>',
                    icon: 'fishing-net'
                },
                stunned: {
                    name: 'Stunned',
                    description: '<p>A stunned creature is <i>incapacitated</i>, can’t move, and can speak only falteringly.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p>',
                    icon: 'fist'
                },
                unconscious: {
                    name: 'Unconscious',
                    description: '<p>An unconscious creature is <i>incapacitated</i>, can’t move or speak, and is unaware of its surroundings.</p> <p>The creature drops whatever it’s holding and falls prone.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p> <p>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</p>',
                    icon: 'sleepy'
                },
            },
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

        if(!state[state_name].conditions || typeof state[state_name].conditions !== 'object'){
            state[state_name].conditions = defaults.conditions;
        }

        whisper = (state[state_name].config.sendOnlyToGM) ? '/w gm ' : '';

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        checkInstall,
        ObserveTokenChange: observeTokenChange,
        registerEventHandlers,
        getConditions,
        getConditionByName,
        handleConditions,
        sendConditionToChat,
        getIcon,
        version
    };
})();

on('ready', () => { 
    'use strict';

    StatusInfo.checkInstall();
    StatusInfo.registerEventHandlers();
});