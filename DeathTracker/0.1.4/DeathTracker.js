/*
 * Version 0.1.4
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1014
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
*/

var DeathTracker = DeathTracker || (function() {
    'use strict';

    let observers = {
        tokenChange: []
    }

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
        fullWidth: 'width: 100%;',
        underline: 'text-decoration: underline;',
        strikethrough: 'text-decoration: strikethrough'
    },
    script_name = 'DeathTracker',
    state_name = 'DEATHTRACKER',
    markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', '-', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-tomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner',   'stopwatch','strong', 'three-leaves', 'tread', 'trophy', 'white-tower'],

    handleInput = (msg) => {
        if (msg.type != 'api' || !playerIsGM(msg.playerid)) return;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if (command == state[state_name].config.command) {
            switch(extracommand){
                 case 'reset':
                    state[state_name] = {};
                    setDefaults(true);
                    sendConfigMenu();
                break;

                case 'config':
                    let message;
                    if(args.length > 0){
                        let setting = args.shift().split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        if(key === 'death_statusmarker'){
                            if(value !== state[state_name].config.half_statusmarker){
                                state[state_name].config[key] = value;
                            }else{
                                message = '<span style="color: red">Statusmakers can\'t be the same.</span>';
                            }
                        }else if(key === 'half_statusmarker'){
                            if(value !== state[state_name].config.death_statusmarker){
                                state[state_name].config[key] = value;
                            }else{
                                message = '<span style="color: red">Statusmakers can\'t be the same.</span>';
                            }
                        }else{
                            state[state_name].config[key] = value;
                        }

                        if(key === 'bar'){
                            //registerEventHandlers();
                            message = '<span style="color: red">The API Sandbox needs to be restarted for this to take effect.</span>';
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

    handleBarValueChange = (obj, prev) => {
        let bar = 'bar'+state[state_name].config.bar;

        if(!obj || !prev || !obj.get('represents') || obj.get(bar+'_value') === prev[bar+'_value']){ return; }

        let attributes = {};
        let set_death_statusmarker = state[state_name].config.set_death_statusmarker;
        let set_half_statusmarker = state[state_name].config.set_half_statusmarker;
        let pc_unconscious = state[state_name].config.pc_unconscious;

        let deathMarker = state[state_name].config.death_statusmarker;
        let halfMarker = state[state_name].config.half_statusmarker;
        let unconsciousMarker = state[state_name].config.pc_unconscious_statusmarker;
        
        let playerid = (obj.get('controlledby') && obj.get('controlledby') !== '') ? obj.get('controlledby') : (getObj('character', obj.get('represents'))) ? getObj('character', obj.get('represents')).get('controlledby') : false;
        let isPlayer = (playerid && !playerIsGM(playerid));

        if(set_death_statusmarker && obj.get(bar+'_value') <= 0){
            let marker = (pc_unconscious && isPlayer) ? unconsciousMarker : deathMarker;
            attributes['status_'+marker] = true;
            attributes['status_'+halfMarker] = false;
        }else{
            attributes['status_'+deathMarker] = false;
            attributes['status_'+unconsciousMarker] = false;
            attributes['status_'+halfMarker] = (set_half_statusmarker && obj.get(bar+'_max') !== '' && obj.get(bar+'_value') <= obj.get(bar+'_max') / 2);
        }

        obj.set(attributes);
        notifyObservers('tokenChange', obj, prev);
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

        let death_markerButton = makeButton(state[state_name].config.death_statusmarker, '!' + state[state_name].config.command + ' config death_statusmarker|'+markerDropdown, styles.button + styles.float.right);
        let half_markerButton = makeButton(state[state_name].config.half_statusmarker, '!' + state[state_name].config.command + ' config half_statusmarker|'+markerDropdown, styles.button + styles.float.right);
        let set_death_statusmarkerButton = makeButton(state[state_name].config.set_death_statusmarker, '!' + state[state_name].config.command + ' config set_death_statusmarker|'+!state[state_name].config.set_death_statusmarker, styles.button + styles.float.right)
        let set_half_statusmarkerButton = makeButton(state[state_name].config.set_half_statusmarker, '!' + state[state_name].config.command + ' config set_half_statusmarker|'+!state[state_name].config.set_death_statusmarker, styles.button + styles.float.right)
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right)
        let barButton = makeButton('bar ' + state[state_name].config.bar, '!' + state[state_name].config.command + ' config bar|?{Bar|Bar 1 (green),1|Bar 2 (blue),2|Bar 3 (red),3}', styles.button + styles.float.right);
        let pc_unconsciousButton = makeButton(state[state_name].config.pc_unconscious, '!' + state[state_name].config.command + ' config pc_unconscious|'+!state[state_name].config.pc_unconscious, styles.button + styles.float.right);
        let pc_unconscious_markerButton = makeButton(state[state_name].config.pc_unconscious_statusmarker, '!' + state[state_name].config.command + ' config pc_unconscious_statusmarker|'+markerDropdown, styles.button + styles.float.right);

        let buttons = '<div style="'+styles.overflow+'">';
            buttons += '<div style="'+styles.overflow+' clear: both;"><span style="'+styles.float.left+'">Command:</span> ' + commandButton +'</div>';
            buttons += '<div style="'+styles.overflow+' clear: both;"><span style="'+styles.float.left+'">HP Bar:</span> ' + barButton +'</div>';
            buttons += '<hr>';
            buttons += '<div style="'+styles.overflow+'"><span style="'+styles.float.left+'">Set Dead:</span> ' + set_death_statusmarkerButton +'</div>';
            if(state[state_name].config.set_death_statusmarker){
                buttons += '<div style="'+styles.overflow+'"><span style="'+styles.float.left+'">Dead Marker:</span> ' + death_markerButton +'</div>';
            }
            buttons += '<br>';
            buttons += '<div style="'+styles.overflow+'"><span style="'+styles.float.left+'">Set Half HP:</span> ' + set_half_statusmarkerButton +'</div>';
            if(state[state_name].config.set_half_statusmarker){
                buttons += '<div style="'+styles.overflow+'"><span style="'+styles.float.left+'">Half HP Marker:</span> ' + half_markerButton +'</div>';
            }
            buttons += '<br>';
            buttons += '<div style="'+styles.overflow+'"><span style="'+styles.float.left+'">Set Unconscious: <p style="font-size: 8pt">Unconscious if PC.</p></span> ' + pc_unconsciousButton +'</div>';
            if(state[state_name].config.pc_unconscious){
                buttons += '<div style="'+styles.overflow+'"><span style="'+styles.float.left+'">Unconscious Marker:</span> ' + pc_unconscious_markerButton +'</div>';
            }
            buttons += '<br>';
        buttons += '</div>';

        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth);

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+buttons+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    makeAndSendMenu = (contents, title, whisper) => {
        title = (title && title != '') && makeTitle(title)
        whisper = (whisper && whisper !== '') && '/w ' + whisper + ' ';
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
        on('change:graphic', handleBarValueChange);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'dead',
                death_statusmarker: 'dead',
                half_statusmarker: 'red',
                set_death_statusmarker: true,
                set_half_statusmarker: true,
                bar: 1,
                firsttime: (reset) ? false : true,
                pc_unconscious: true,
                pc_unconscious_statusmarker: 'sleepy'
            }
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
            if(!state[state_name].config.hasOwnProperty('death_statusmarker')){
                state[state_name].config.death_statusmarker = defaults.config.death_statusmarker;
            }
            if(!state[state_name].config.hasOwnProperty('half_statusmarker')){
                state[state_name].config.half_statusmarker = defaults.config.half_statusmarker;
            }
            if(!state[state_name].config.hasOwnProperty('set_death_statusmarker')){
                state[state_name].config.set_death_statusmarker = defaults.config.set_death_statusmarker;
            }
            if(!state[state_name].config.hasOwnProperty('set_half_statusmarker')){
                state[state_name].config.set_half_statusmarker = defaults.config.set_half_statusmarker;
            }
            if(!state[state_name].config.hasOwnProperty('bar')){
                state[state_name].config.bar = defaults.config.bar;
            }
            if(!state[state_name].config.hasOwnProperty('pc_unconscious')){
                state[state_name].config.pc_unconscious = defaults.config.pc_unconscious;
            }
            if(!state[state_name].config.hasOwnProperty('pc_unconscious_statusmarker')){
                state[state_name].config.pc_unconscious_statusmarker = defaults.config.pc_unconscious_statusmarker;
            }
        }

        if(state[state_name].config.firsttime){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        CheckInstall: checkInstall,
        ObserveTokenChange: observeTokenChange,
        RegisterEventHandlers: registerEventHandlers
    }
})();

on('ready',function() {
    'use strict';

    DeathTracker.CheckInstall();
    DeathTracker.RegisterEventHandlers();
});