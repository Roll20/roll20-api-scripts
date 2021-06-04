/*
 * Version 0.1.4
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
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
                        msg.selected.forEach(s => {
                            let token = getObj('graphic', s._id);
                            if(token){
                                let characterid = token.get('represents');
                                if(!characterid){
                                    makeAndSendMenu('This token does not represent a character to add inspiration to.', '', 'gm');
                                    return;
                                }

                                let attribute = findObjs({ characterid, type: 'attribute', name: 'inspiration' }).shift();
                                if(!attribute){
                                    makeAndSendMenu('Could not find attribute named: inspiration', '', 'gm');
                                    return;
                                }

                                let inspired = (attribute.get('current') === 'on') ? '0' : 'on';
                                attribute.set('current', inspired);
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

    handleGraphicChange = (token, prev_token) => {
        if(token.get('statusmarkers') === prev_token.statusmarkers) return;

        const marker = state[state_name].config.statusmarker;
        const character = getObj('character', token.get('represents'));

        if(!character) return;

        let attribute = findObjs({ characterid: character.get('id'), type: 'attribute', name: 'inspiration' }).shift();

        if(!attribute) return;

        // Marker added
        if(token.get('statusmarkers').includes(marker) && !prev_token.statusmarkers.includes(marker)){
            attribute.set('current', 'on');
            handleAttributeChange(attribute);
        }

        // Marker removed
        if(!token.get('statusmarkers').includes(marker) && prev_token.statusmarkers.includes(marker)){
            attribute.set('current', '0');
            handleAttributeChange(attribute);
        }
    },

    handleAttributeChange = (obj) => {
        if(obj.get('name') === 'inspiration'){
            let characterid = obj.get('characterid'),
                inspired = (obj.get('current') === 'on'),
                tokens = findObjs({ represents: characterid, _type: 'graphic' }),
                text = (inspired) ? 'is now inspired!' : 'used the inspiration.',
                character = getObj('character', characterid),
                name = character.get('name');

            tokens.forEach(token => {
                setStatusmarker(token, inspired, true);

                if(state[state_name].config.fx && inspired){
                    spawnFx(token.get('left'), token.get('top'), state[state_name].config.fx_type, token.get('pageid'));
                }
            });

            makeAndSendMenu('\
            <div style="'+styles.overflow+'"> \
                <span style="'+styles.float.left+'"><b>'+name+'</b> '+text+'</span> \
                <img style="'+styles.float.right+'" height="40px" width="40px" src="https://s3.amazonaws.com/files.d20.io/images/39783029/-w45_4ICV9QnFzijBimwKA/max.png" /> \
            </div> \
            ');
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
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right);
        let fxButton = makeButton(state[state_name].config.fx, '!' + state[state_name].config.command + ' config fx|'+!state[state_name].config.fx, styles.button + styles.float.right);
        let fxTypeButton = makeButton(state[state_name].config.fx_type, '!' + state[state_name].config.command + ' config fx_type|?{FX Type|'+state[state_name].config.fx_type+'}', styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
            '<span style="'+styles.float.left+'">Statusmarker:</span> ' + markerButton,
            '<span style="'+styles.float.left+'">Special Effect:</span> ' + fxButton,
        ];

        if(state[state_name].config.fx){
            listItems.push('<span style="'+styles.float.left+'">Special Effect Type:</span> ' + fxTypeButton);
        }

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
        on('change:graphic', handleGraphicChange);
        on('add:token', handleAddToken);

        if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
            TokenMod.ObserveTokenChange(function(obj,prev){
                handleGraphicChange(obj,prev);
            });
        }
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'inspiration',
                statusmarker: 'black-flag',
                fx: true,
                fx_type: 'nova-holy'
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
            if(!state[state_name].config.hasOwnProperty('fx')){
                state[state_name].config.fx = defaults.config.fx;
            }
            if(!state[state_name].config.hasOwnProperty('fx_type')){
                state[state_name].config.fx_type = defaults.config.fx_type;
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