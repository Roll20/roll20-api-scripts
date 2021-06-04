/*
 * Version 0.1.0
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
*/

var AlignmentTracker = AlignmentTracker || (function() {
    'use strict';

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
    script_name = 'AlignmentTracker',
    state_name = 'ALIGNMENTTRACKER',

    createRange = (start, end) => {
        return Array(end - start + 1).fill().map((_, idx) => start + idx)
    },

    alignment_positions = {
        x: [
            { range: createRange(0, 11), name: 'Chaotic' },
            { range: createRange(12, 22), name: 'Neutral' },
            { range: createRange(23, 33), name: 'Lawful' }
        ],
        y: [
            { range: createRange(0, 11), name: 'Good' },
            { range: createRange(12, 22), name: 'Neutral' },
            { range: createRange(23, 33), name: 'Evil' }
        ]
    },

    handleInput = (msg) => {
        if (msg.type != 'api') return;
        if(!playerIsGM(msg.playerid)) return;

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

                case 'create':
                    // TODO: if not selected
                    
                    msg.selected.forEach(s => {
                        let character = getObj('character', getObj(s._type, s._id).get('represents'));

                        createTable(character);
                    })
                break;

                case 'change-alignment':
                    // TODO: if not selected
                    let newAlignment = args.shift();

                    msg.selected.forEach(s => {
                        let character = getObj('character', getObj(s._type, s._id).get('represents'));

                        changeAlignment(character, newAlignment);
                    })
                break;
                
                case 'change':
                    // TODO: if not selected
                    let morality = args.shift(),
                        lawfulness = args.shift();

                    msg.selected.forEach(s => {
                        let character = getObj('character', getObj(s._type, s._id).get('represents'));

                        changePosition(character, morality, lawfulness);
                    })
                break;

                case 'get':
                    let chat_text = '';

                    msg.selected.forEach(s => {
                        let character = getObj('character', getObj(s._type, s._id).get('represents'));

                        chat_text += '<b>'+character.get('name')+'</b>: ' + getCharacterAlignment(character) + '<br>';
                    });

                    makeAndSendMenu(chat_text, 'Alignment(s)', 'gm');
                break;

                default:
                    sendConfigMenu();
                break;
            }
        }
    },

    changePosition = (character, morality, lawfulness) => {
        morality = parseInt(morality); lawfulness = parseInt(lawfulness);

        // TODO: Check boundaries
        let position = getCharacterAlignmentPosition(character),
            x = position.x, 
            y = position.y;
        if(morality){
            if(morality + position.x < 0){
                x = 0;
            }else if(morality + position.x > 32){
                x = 32;
            }else{
                x = morality + position.x;
            }
        }
        if(lawfulness){
            if(lawfulness + position.y < 0){
                y = 0;
            }else if(lawfulness + position.y > 32){
                y = 32;
            }else{
                y = lawfulness + position.y;
            }
        }
        
        changeAlignment(character, { x, y });
    },

    changeAlignment = (character, newAlignment) => {
        let position;
        if(typeof newAlignment === 'object' && newAlignment.x >= 0 && newAlignment.y >= 0){
            position = newAlignment;
        }else{
            position = getPositionFromAlignment(newAlignment);
        }

        // Set State
        state[state_name].characters[strip(character.get('name')).toLowerCase()] = position;

        // Set Attribute
        let attributes = {};
        attributes[state[state_name].config.alignment_attribute] = getAlignmentFromPosition(position);
        setAttrs(character.get('id'), attributes);

        // Create Table
        createTable(character);
    },

    getCharacterAlignmentPosition = (character) => {
        let name = strip(character.get('name')).toLowerCase();

        if(!state[state_name].characters[name]){
            let alignment = getAttrByName(character.get('id'), state[state_name].config.alignment_attribute, 'current') || '';
            state[state_name].characters[name] = getPositionFromAlignment(alignment);
        }

        return state[state_name].characters[name];
    },

    getCharacterAlignment = (character) => {
        return getAttrByName(character.get('id'), state[state_name].config.alignment_attribute, 'current') || '';
    },

    getPositionFromAlignment = (alignment) => {
        alignment = strip(alignment).toLowerCase();

        switch(alignment){
            case 'cg': case 'chaoticgood':
                return { x: 5, y: 5 };
            break;

            case 'cn': case 'chaoticneutral':
                return { x: 5, y: 16 };
            break;

            case 'ce': case 'chaoticevil':
                return { x: 5, y: 27 };
            break;

            case 'ng': case 'neutralgood':
                return { x: 16, y: 5 };
            break;

            case 'nn': case 'neutralneutral': case 'tn': case 'trueneutral':
                return { x: 16, y: 16 };
            break;

            case 'ne': case 'neutralevil':
                return { x: 16, y: 27 };
            break;

            case 'lg': case 'lawfulgood':
                return { x: 27, y: 5 };
            break;

            case 'ln': case 'lawfulneutral':
                return { x: 27, y: 16 };
            break;

            case 'le': case 'lawfulevil':
                return { x: 27, y: 27 };
            break;
        }

        // TODO: NOT FOUND SHIT
    },

    createTable = (character) => {
        const border= '2px dotted black',
            position = getCharacterAlignmentPosition(character);
        let style, mark = '';

        let table = ' \
        <table id="alignmenttable"> \
            <tr> \
                <th></th> \
                <th colspan="11" style="text-align: left;">Chaotic</th> \
                <th colspan="11">Neutral</th> \
                <th colspan="11" style="text-align: right;">Lawful</th> \
            </tr>';

        for(var row = 0; row <= 32; row++){
            table += '<tr>';

            if(row === 0){
                table += '<th rowspan="11" style="text-align: left; vertical-align: top;">Good</th>';
            }
            if(row === 11){
                table += '<th rowspan="11" style="text-align: left; vertical-align: middle;">Neutral </th>';
            }
            if(row === 22){
                table += '<th rowspan="11" style="text-align: left; vertical-align: bottom;">Evil</th>';
            }

            for(var column = 0; column <= 32; column++){
                style = '';
                mark = ''
                if(column === 11 || column === 22) style += 'border-left: '+border+';';
                if(row === 11 || row === 22) style += 'border-top: '+border+';';

                if(column === position.x && row === position.y) mark = 'X';

                table += '<td style="'+style+'">'+mark+'</td>';
            }

            table += '</tr>';
        }

        table += '</table>';

        table += 'Your alignment is ' + getAlignmentFromPosition(position);

        let handout = getOrCreateAlignmentHandout(character);
        handout.set('notes', table);
    },

    getOrCreateAlignmentHandout = (character) => {
        let name = strip(character.get('name')).toLowerCase() + '_alignment',
            handout = findObjs({
                type: 'handout',
                name: name
            });

        let inplayerjournals = (state[state_name].config.show_handout_players) ? character.get('controlledby') : "";

        return (handout && handout[0]) ? handout[0] : createObj("handout", {
            name: name,
            inplayerjournals
        });
    },

    getAlignmentFromPosition = (position) => {
        // TODO: Not a valid position shit.
        if(!position || position.x < 0 || position.y < 0) return;

        let alignment = _.find(alignment_positions.x, (entry) => entry.range.indexOf(position.x) !== -1).name + ' ' + _.find(alignment_positions.y, (entry) => entry.range.indexOf(position.y) !== -1).name;
        alignment = (alignment === 'Neutral Neutral') ? 'True Neutral' : alignment;
        return alignment;
    },

    strip = (str) => {
        return str.replace(/[^a-zA-Z0-9]+/g, '');
    },

    sendConfigMenu = (first, message) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right),
            attributeButton = makeButton(state[state_name].config.alignment_attribute, '!' + state[state_name].config.command + ' config alignment_attribute|?{Attribute}', styles.button + styles.float.right),
            show_playersButton = makeButton(state[state_name].config.show_handout_players, '!' + state[state_name].config.command + ' config show_handout_players|' + !state[state_name].config.show_handout_players, styles.button + styles.float.right),

            resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth),

            listItems = [
                '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
                '<span style="'+styles.float.left+'">Attribute:</span> ' + attributeButton,
                '<span style="'+styles.float.left+'">Show Players:</span> ' + show_playersButton,
            ];

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendError = (error) => {
        makeAndSendMenu(error, '', 'gm', 'border-color: red; color: red;');
    },

    makeAndSendMenu = (contents, title, whisper, style) => {
        title = (title && title != '') ? makeTitle(title) : '';
        whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
        sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+style+'">'+title+contents+'</div>', null, {noarchive:true});
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

    checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();

        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
        if(state[state_name].config.debug){ makeAndSendMenu(script_name + ' Ready! Debug On.', '', 'gm') }

        log(state[state_name].config.alignment_attribute)
    },

    registerEventHandlers = () => {
        on('chat:message', handleInput);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'alignment',
                alignment_attribute: 'alignment',
                show_handout_players: false,
            },
            characters: {}
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
            if(!state[state_name].config.hasOwnProperty('alignment_attribute')){
                state[state_name].config.alignment_attribute = defaults.config.alignment_attribute;
            }
            if(!state[state_name].config.hasOwnProperty('show_handout_players')){
                state[state_name].config.show_handout_players = defaults.config.show_handout_players;
            }
        }

        if(!state[state_name].characters){
            state[state_name].characters = defaults.characters;
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        checkInstall,
        registerEventHandlers
    }
})();

on('ready',function() {
    'use strict';

    AlignmentTracker.checkInstall();
    AlignmentTracker.registerEventHandlers();
});