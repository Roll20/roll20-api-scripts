/*
 * Version 0.1.14
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * My Discord Server: https://discord.gg/AcC9VME
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Roll20 Wiki: https://wiki.roll20.net/Script:Concentration
 * Roll20 Thread: https://app.roll20.net/forum/post/6364317/script-concentration/?pageforid=6364317#post-6364317
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
*/

var Concentration = Concentration || (function() {
    'use strict';

    let checked = [];

    // Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu:  'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
        button: 'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #000; text-decoration: underline',
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
            handleConcentrationSpellCast(msg);
        }

        if (msg.type != 'api') return;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();
        let message;

        if (command == state[state_name].config.command) {
            if(playerIsGM(msg.playerid)){
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

                    case 'advantage-menu':
                        sendAdvantageMenu();
                    break;

                    case 'toggle-advantage':
                        let id = args[0];

                        if(state[state_name].advantages[id]){
                            state[state_name].advantages[id] = !state[state_name].advantages[id];
                        }else{
                            state[state_name].advantages[id] = true;
                        }

                        sendAdvantageMenu();
                    break;

                    case 'roll':
                        let represents = args[0],
                            DC = parseInt(args[1], 10),
                            con_save_mod = parseInt(args[2], 10),
                            name = args[3],
                            target = args[4];

                        roll(represents, DC, con_save_mod, name, target, false);
                    break;

                    case 'advantage':
                    let represents_a = args[0],
                        DC_a = parseInt(args[1], 10),
                        con_save_mod_a = parseInt(args[2], 10),
                        name_a = args[3],
                        target_a = args[4];

                        roll(represents_a, DC_a, con_save_mod_a, name_a, target_a, true);
                    break;

                    default:
                        if(msg.selected && msg.selected.length){
                            msg.selected.forEach(s => {
                                let token = getObj(s._type, s._id);
                                addConcentration(token, msg.playerid, extracommand);
                            });
                            return;
                        }

                        sendConfigMenu();
                    break;
                }
            }else{
                if(msg.selected && msg.selected.length){
                    msg.selected.forEach(s => {
                        let token = getObj(s._type, s._id);
                        addConcentration(token, msg.playerid, extracommand);
                    });
                }
            }
        }
    },

    addConcentration = (token, playerid, spell) => {
        const marker = state[state_name].config.statusmarker
        let character = getObj('character', token.get('represents'));
        if((token.get('controlledby').split(',').includes(playerid) || token.get('controlledby').split(',').includes('all')) ||
            (character && (character.get('controlledby').split(',').includes(playerid) || character.get('controlledby').split(',').includes('all'))) ||
            playerIsGM(playerid)){
                if(!token.get('status_'+marker)){
                    let target = state[state_name].config.send_reminder_to;
                    if(target === 'character'){
                        target = createWhisperName(character_name);
                    }else if(target === 'everyone'){
                        target = ''
                    }

                    let message;
                    if(spell){
                        message = '<b>'+token.get('name')+'</b> is now concentrating on <b>'+spell+'</b>.';
                    }else{
                        message = '<b>'+token.get('name')+'</b> is now concentrating.';
                    }

                    makeAndSendMenu(message, '', target);
                }
                token.set('status_'+marker, !token.get('status_'+marker));
        }
    },

    handleConcentrationSpellCast = (msg) => {
        const marker = state[state_name].config.statusmarker

        let character_name = msg.content.match(/charname=([^\n{}]*[^"\n{}])/);            
        character_name = RegExp.$1;
        let spell_name = msg.content.match(/name=([^\n{}]*[^"\n{}])/);  
        spell_name = RegExp.$1;
        let player = getObj('player', msg.playerid),
            characterid = findObjs({ name: character_name, _type: 'character' }).shift().get('id'),                 
            represented_tokens = findObjs({ represents: characterid, _type: 'graphic' }),
            message,
            target = state[state_name].config.send_reminder_to;

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

        if(target === 'character'){
            target = createWhisperName(character_name);
        }else if(target === 'everyone'){
            target = ''
        }

        makeAndSendMenu(message, '', target);
    },

    handleStatusMarkerChange = (obj, prev) => {
        const marker = state[state_name].config.statusmarker
        
        if(!obj.get('status_'+marker)){
            removeMarker(obj.get('represents'));
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
                con_save_mod = parseInt(getAttrByName(obj.get('represents'), state[state_name].config.bonus_attribute, 'current')) || 0,
                chat_text;

            if(target === 'character'){
                chat_text = "Make a Concentration Check - <b>DC " + DC + "</b>.";
                target = createWhisperName(obj.get('name'));
            }else if(target === 'everyone'){
                chat_text = '<b>'+obj.get('name')+'</b> must make a Concentration Check - <b>DC ' + DC + '</b>.';
                target = '';
            }else{
                chat_text = '<b>'+obj.get('name')+'</b> must make a Concentration Check - <b>DC ' + DC + '</b>.';
                target = 'gm';
            }

            if(state[state_name].config.show_roll_button){
                chat_text += '<hr>' + makeButton('Advantage', '!' + state[state_name].config.command + ' advantage ' + obj.get('represents') + ' ' + DC + ' ' + con_save_mod + ' ' + obj.get('name') + ' ' + target, styles.button + styles.float.right);
                chat_text += '&nbsp;' + makeButton('Roll', '!' + state[state_name].config.command + ' roll ' + obj.get('represents') + ' ' + DC + ' ' + con_save_mod + ' ' + obj.get('name') + ' ' + target, styles.button + styles.float.left);
            }

            if(state[state_name].config.auto_roll_save){
                //&{template:default} {{name='+obj.get('name')+' - Concentration Save}} {{Modifier='+con_save_mod+'}} {{Roll=[[1d20cf<'+(DC-con_save_mod-1)+'cs>'+(DC-con_save_mod-1)+'+'+con_save_mod+']]}} {{DC='+DC+'}}
                roll(obj.get('represents'), DC, con_save_mod, obj.get('name'), target, state[state_name].advantages[obj.get('represents')]);
            }else{
                makeAndSendMenu(chat_text, '', target);
            }

            let length = checked.push(obj.get('represents'));
            setTimeout(() => {
                checked.splice(length-1, 1);
            }, 1000);
        }
    },

    roll = (represents, DC, con_save_mod, name, target, advantage) => {
        sendChat(script_name, '[[1d20cf<'+(DC-con_save_mod-1)+'cs>'+(DC-con_save_mod-1)+'+'+con_save_mod+']]', results => {
            let title = 'Concentration Save <br> <b style="font-size: 10pt; color: gray;">'+name+'</b>',
                advantageRollResult;

            let rollresult = results[0].inlinerolls[0].results.rolls[0].results[0].v;
            let result = rollresult;

            if(advantage){
                advantageRollResult = randomInteger(20);
                result = (rollresult <= advantageRollResult) ? advantageRollResult : rollresult;
            }

            let total = result + con_save_mod;

            let success = total >= DC;

            let result_text = (success) ? 'Success' : 'Failed',
                result_color = (success) ? 'green' : 'red';

            let rollResultString = (advantage) ? rollresult + ' / ' + advantageRollResult : rollresult;

            let contents = ' \
            <table style="width: 100%; text-align: left;"> \
                <tr> \
                    <th>DC</th> \
                    <td>'+DC+'</td> \
                </tr> \
                <tr> \
                    <th>Modifier</th> \
                    <td>'+con_save_mod+'</td> \
                </tr> \
                <tr> \
                    <th>Roll Result</th> \
                    <td>'+rollResultString+'</td> \
                </tr> \
            </table> \
            <div style="text-align: center"> \
                <b style="font-size: 16pt;"> \
                    <span style="border: 1px solid '+result_color+'; padding-bottom: 2px; padding-top: 4px;">[['+result+'+'+con_save_mod+']]</span><br><br> \
                    '+result_text+' \
                </b> \
            </div>'
            makeAndSendMenu(contents, title, target);

            if(target !== '' && target !== 'gm'){
                makeAndSendMenu(contents, title, 'gm');
            }

            if(!success){
                removeMarker(represents);
            }
        });
    },

    removeMarker = (represents, type='graphic') => {
        findObjs({ type, represents }).forEach(o => {
            o.set('status_'+state[state_name].config.statusmarker, false);
        });
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

        let markerButton = makeButton(state[state_name].config.statusmarker, '!' + state[state_name].config.command + ' config statusmarker|'+markerDropdown, styles.button + styles.float.right),
            commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right),
            barButton = makeButton('bar ' + state[state_name].config.bar, '!' + state[state_name].config.command + ' config bar|?{Bar|Bar 1 (green),1|Bar 2 (blue),2|Bar 3 (red),3}', styles.button + styles.float.right),
            sendToButton = makeButton(state[state_name].config.send_reminder_to, '!' + state[state_name].config.command + ' config send_reminder_to|?{Send To|Everyone,everyone|Character,character|GM,gm}', styles.button + styles.float.right),
            addConMarkerButton = makeButton(state[state_name].config.auto_add_concentration_marker, '!' + state[state_name].config.command + ' config auto_add_concentration_marker|'+!state[state_name].config.auto_add_concentration_marker, styles.button + styles.float.right),
            autoRollButton = makeButton(state[state_name].config.auto_roll_save, '!' + state[state_name].config.command + ' config auto_roll_save|'+!state[state_name].config.auto_roll_save, styles.button + styles.float.right),
            //advantageButton = makeButton(state[state_name].config.advantage, '!' + state[state_name].config.command + ' config advantage|'+!state[state_name].config.advantage, styles.button + styles.float.right),
            bonusAttrButton = makeButton(state[state_name].config.bonus_attribute, '!' + state[state_name].config.command + ' config bonus_attribute|?{Attribute|'+state[state_name].config.bonus_attribute+'}', styles.button + styles.float.right),
            showRollButtonButton = makeButton(state[state_name].config.show_roll_button, '!' + state[state_name].config.command + ' config show_roll_button|'+!state[state_name].config.show_roll_button, styles.button + styles.float.right),

            listItems = [
                '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
                '<span style="'+styles.float.left+'">Statusmarker:</span> ' + markerButton,
                '<span style="'+styles.float.left+'">HP Bar:</span> ' + barButton,
                '<span style="'+styles.float.left+'">Send Reminder To:</span> ' + sendToButton,
                '<span style="'+styles.float.left+'">Auto Add Con. Marker: <p style="font-size: 8pt;">Works only for 5e OGL Sheet.</p></span> ' + addConMarkerButton,
                '<span style="'+styles.float.left+'">Auto Roll Save:</span> ' + autoRollButton,
            ],

            resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth),

            title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';

        /*if(state[state_name].config.auto_roll_save){
            listItems.push('<span style="'+styles.float.left+'">Advantage:</span> ' + advantageButton);
        }*/

        if(state[state_name].config.auto_roll_save){
            listItems.push('<span style="'+styles.float.left+'">Bonus Attribute:</span> ' + bonusAttrButton)
        }

        if(!state[state_name].config.auto_roll_save){
            listItems.push('<span style="'+styles.float.left+'">Roll Button:</span> ' + showRollButtonButton);
        }

        let advantageMenuButton = (state[state_name].config.auto_roll_save) ? makeButton('Advantage Menu', '!' + state[state_name].config.command + ' advantage-menu', styles.button + styles.fullWidth) : '';

        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<br>'+advantageMenuButton+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendAdvantageMenu = () => {
        let menu_text = "";
        let characters = findObjs({ type: 'character' }).sort((a, b) => {
            let nameA = a.get('name').toUpperCase();
            let nameB = b.get('name').toUpperCase();

            if(nameA < nameB) return -1;
            if(nameA > nameB) return 1;

            return 0;
        });

        characters.forEach(character => {
            let name = (state[state_name].advantages && state[state_name].advantages[character.get('id')]) ? '<b>'+character.get('name')+'</b>' : character.get('name');
            menu_text += makeButton(name, '!' + state[state_name].config.command + ' toggle-advantage ' + character.get('id'), styles.textButton) + '<br>';
        });

        makeAndSendMenu(menu_text, 'Advantage Menu', 'gm');
    },

    makeAndSendMenu = (contents, title, whisper, callback) => {
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
        on('change:graphic:statusmarkers', handleStatusMarkerChange);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'concentration',
                statusmarker: 'stopwatch',
                bar: 1,
                send_reminder_to: 'everyone', // character,gm,
                auto_add_concentration_marker: true,
                auto_roll_save: true,
                advantage: false,
                bonus_attribute: 'constitution_save_bonus',
                show_roll_button: true
            },
            advantages: {}
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
            if(!state[state_name].config.hasOwnProperty('auto_roll_save')){
                state[state_name].config.auto_roll_save = defaults.config.auto_roll_save;
            }
            if(!state[state_name].config.hasOwnProperty('advantage')){
                state[state_name].config.advantage = defaults.config.advantage;
            }
            if(!state[state_name].config.hasOwnProperty('bonus_attribute')){
                state[state_name].config.bonus_attribute = defaults.config.bonus_attribute;
            }
            if(!state[state_name].config.hasOwnProperty('show_roll_button')){
                state[state_name].config.show_roll_button = defaults.config.show_roll_button;
            }
        }
        if(!state[state_name].advantages){
            state[state_name].advantages = defaults.advantages;
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