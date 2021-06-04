/*
 * Version 0.1.5
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1014
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
*/

var Concentration = Concentration || (function() {
    'use strict';

    let checked = [];

    // Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu:  'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
        button: 'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;',
        list: 'list-style: none;',
        float: {
            right: 'float: right;',
            left: 'float: left;'
        },
        overflow: 'overflow: hidden;',
        fullWidth: 'width: 100%;'
    },
    script_name = 'Concentration',
    state_name = 'CONCENTRATION',
    markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', '-', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-tomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner',   'stopwatch','strong', 'three-leaves', 'tread', 'trophy', 'white-tower'],

    handleInput = (msg) => {
        if(state[state_name].config.auto_add_concentration_marker && msg && msg.rolltemplate && msg.rolltemplate === 'spell' && (msg.content.includes("{{concentration=1}}"))){
            let character_name = msg.content.match(/charname=([^\n{}]*[^"\n{}])/);            
            character_name = RegExp.$1;
            let spell_name = msg.content.match(/name=([^\n{}]*[^"\n{}])/);  
            spell_name = RegExp.$1;
            let player = getObj('player', msg.playerid);
            let characterid = findObjs({ name: character_name, _type: 'character' }).shift().get('id');                    
            let represented_tokens = findObjs({ represents: characterid, _type: 'graphic' });
            let marker = state[state_name].config.statusmarker;
            let message;

            if(!character_name || !spell_name || !player || !characterid) return;

            let search_attributes = {
                represents: characterid,
                _type: 'graphic',
                _pageid: player.get('lastpage')
            }
            search_attributes['status_'+marker] = true;
            let is_concentrating = (findObjs(search_attributes).length > 0);

            if(is_concentrating){
                message = '<b>'+character_name+'</b> is concentrating already.';
            }else{
                represented_tokens.forEach(token => {
                    let attributes = {};
                    attributes['status_'+marker] = true;
                    token.set(attributes);
                    message = '<b>'+character_name+'</b> is now concentrating on <b>'+spell_name+'</b>.';
                });
            }

            makeAndSendMenu(message);
        }

        if (msg.type != 'api' || !playerIsGM(msg.playerid)) return;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();
        let message;

        if (command == state[state_name].config.command) {
            switch(extracommand){
                case 'reset':
                    state[state_name] = {};
                    setDefaults(true);
                    sendConfigMenu(false, '<span style="color: red">The API Library needs to be restarted for this to take effect.</span>');
                break;

                case 'config':
                    if(args.length > 0){
                        let setting = args.shift().split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        state[state_name].config[key] = value;

                        if(key === 'bar'){
                            //registerEventHandlers();
                            message = '<span style="color: red">The API Library needs to be restarted for this to take effect.</span>';
                        }
                    }

                    sendConfigMenu(false, message);
                break;

                default:
                    sendConfigMenu();
                break;
            }
        }
    },

    handleGraphicChange = (obj, prev) => {
        if(checked.includes(obj.get('represents'))){ return false; }

        let bar = 'bar'+state[state_name].config.bar+'_value',
            target = state[state_name].config.send_reminder_to, 
            marker = state[state_name].config.statusmarker;

        if(prev && obj.get('status_'+marker) && obj.get(bar) < prev[bar]){
            let calc_DC = Math.floor((prev[bar] - obj.get(bar))/2),
                DC = (calc_DC > 10) ? calc_DC : 10,
                chat_text = '<b>'+obj.get('name')+'</b> must make a Concentration Check - <b>DC ' + DC + '</b>.';

            if(target === 'character'){
                target = createWhisperName(obj.get('name'));
                chat_text = "Make a Concentration Check - <b>DC " + DC + "</b>.";
            }else if(target === 'everyone'){
                target = ''
            }

            makeAndSendMenu(chat_text, '', target);
        }

        let length = checked.push(obj.get('represents'));
        setTimeout(() => {
            checked.splice(length-1, 1);
        }, 1000);
    },

    createWhisperName = (name) => {
        return name.split(' ').shift();
    },

    ucFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    sendConfigMenu = (first, message) => {
        let markerDropdown = '?{Marker';
        markers.forEach((marker) => {
            markerDropdown += '|'+ucFirst(marker).replace('-', ' ')+','+marker
        })
        markerDropdown += '}';

        let markerButton = makeButton(state[state_name].config.statusmarker, '!' + state[state_name].config.command + ' config statusmarker|'+markerDropdown, styles.button + styles.float.right);
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right);
        let barButton = makeButton('bar ' + state[state_name].config.bar, '!' + state[state_name].config.command + ' config bar|?{Bar|Bar 1 (green),1|Bar 2 (blue),2|Bar 3 (red),3}', styles.button + styles.float.right);
        let sendToButton = makeButton(state[state_name].config.send_reminder_to, '!' + state[state_name].config.command + ' config send_reminder_to|?{Send To|Everyone,everyone|Character,character|GM,gm}', styles.button + styles.float.right);
        let addConMarkerButton = makeButton(state[state_name].config.auto_add_concentration_marker, '!' + state[state_name].config.command + ' config auto_add_concentration_marker|'+!state[state_name].config.auto_add_concentration_marker, styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
            '<span style="'+styles.float.left+'">Statusmarker:</span> ' + markerButton,
            '<span style="'+styles.float.left+'">HP Bar:</span> ' + barButton,
            '<span style="'+styles.float.left+'">Send Reminder To:</span> ' + sendToButton,
            '<span style="'+styles.float.left+'">Auto Add Con. Marker: <p style="font-size: 8pt;">Works only for 5e OGL Sheet.</p></span> ' + addConMarkerButton,
        ];

        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth);

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    makeAndSendMenu = (contents, title, whisper) => {
        title = (title && title != '') ? makeTitle(title) : '';
        whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
        sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+'">'+title+contents+'</div>', null, {noarchive:true});
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
        if(!message){ return; }
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

    registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic:bar'+state[state_name].config.bar+'_value', handleGraphicChange);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'concentration',
                statusmarker: 'stopwatch',
                bar: 1,
                send_reminder_to: 'everyone', // character,gm,
                auto_add_concentration_marker: true
            }
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
            if(!state[state_name].config.hasOwnProperty('statusmarker')){
                state[state_name].config.statusmarker = defaults.config.statusmarker;
            }
            if(!state[state_name].config.hasOwnProperty('bar')){
                state[state_name].config.bar = defaults.config.bar;
            }
            if(!state[state_name].config.hasOwnProperty('send_reminder_to')){
                state[state_name].config.send_reminder_to = defaults.config.send_reminder_to;
            }
            if(!state[state_name].config.hasOwnProperty('auto_add_concentration_marker')){
                state[state_name].config.auto_add_concentration_marker = defaults.config.auto_add_concentration_marker;
            }
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    }
})();

on('ready',function() {
    'use strict';

    Concentration.CheckInstall();
    Concentration.RegisterEventHandlers();
});