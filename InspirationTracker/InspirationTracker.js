/*
 * Version 0.1.2
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1014
 * Roll20: https://app.roll20.net/users/1226016/robin-k
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
*/

var InspirationTracker = InspirationTracker || (function() {
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
    script_name = 'InspirationTracker',
    state_name = 'INSPIRATIONTRACKER',
    markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', '-', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-tomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner',   'stopwatch','strong', 'three-leaves', 'tread', 'trophy', 'white-tower'],

    handleInput = (msg) => {
        if (msg.type != 'api' && !playerIsGM(msg.playerid)) return;

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
                    if(args.length > 0){
                        let setting = args.shift().split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        state[state_name].config[key] = value;
                    }

                    sendConfigMenu();
                break;

                default:
                    if(msg.selected && msg.selected.length > 0){
                        msg.selected.forEach(token => {
                            let characterid = getObj('graphic', token._id).get('represents') || false;
                            if(characterid){
                                let attribute = findObjs({ characterid, _type: 'attribute', name: 'inspiration' }).shift();

                                if(attribute.get('current') === 'on') return;

                                attribute.set({ current: 'on' });
                                handleAttributeChange(attribute);
                            }
                        });
                    }else{
                        sendConfigMenu();
                    }
                break;
            }
        }
    },

    handleAttributeChange = (obj) => {
        if(obj.get('name') === 'inspiration'){
            let characterid = obj.get('characterid');
            let inspired = (obj.get('current') === 'on');
            let tokens = findObjs({ represents: characterid, _type: 'graphic' });

            tokens.forEach(token => {
                setStatusmarker(token, inspired, true);
            });

            if(inspired){
                let character = getObj('character', characterid);
                let name = character.get('name');

                makeAndSendMenu('\
                <div style="'+styles.overflow+'"> \
                    <span style="'+styles.float.left+'"><b>'+name+'</b> is now inspired!</span> \
                    <img style="'+styles.float.right+'" height="40px" width="40px" src="https://s3.amazonaws.com/files.d20.io/images/39783029/-w45_4ICV9QnFzijBimwKA/max.png" /> \
                </div> \
                ');
            }
        }
    },

    handleAddToken = (obj) => {
        setStatusmarker(obj, (getAttrByName(obj.get('represents'), 'inspiration', 'current') === 'on'));
    },

    setStatusmarker = (obj, inspired, notify) => {
        let statusmarker = state[state_name].config.statusmarker;
        let prev = obj;

        let attributes = {}
        attributes['status_'+statusmarker] = inspired;
        obj.set(attributes);

        if(notify) notifyObservers('tokenChange', obj, prev);
    },

    sendConfigMenu = (first, message) => {
        let markerDropdown = '?{Marker';
        markers.forEach((marker) => {
            markerDropdown += '|'+ucFirst(marker).replace('-', ' ')+','+marker
        })
        markerDropdown += '}';

        let markerButton = makeButton(state[state_name].config.statusmarker, '!' + state[state_name].config.command + ' config statusmarker|'+markerDropdown, styles.button + styles.float.right);
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right)

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
            '<span style="'+styles.float.left+'">Statusmarker:</span> ' + markerButton,
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

    ucFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
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
        on('change:attribute', handleAttributeChange);
        on('add:token', handleAddToken);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'inspiration',
                statusmarker: 'black-flag'
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
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
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

    InspirationTracker.CheckInstall();
    InspirationTracker.RegisterEventHandlers();
});