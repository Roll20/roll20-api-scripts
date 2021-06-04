/*
    !hunters-mark 
    !hunters-mark add
    !hunters-mark delete
    !hunters-mark help
    !hunters-mark show
    !hunters-mark menu
    !hunters-mark @{selected|character_id} @{target|token_id}

    add     adds selected character as a new hunter. 
            must have exactly one marker
    delete  removes currently selected character from hunters list
    help    shows help menu, and description of each feature
    show    shows current hunters in state
    menu    shows the menu of buttons
    
    if none of above
        assumes arg[1] is a hunter character_id, and arg[2] is target token id.
        if not, will send a warning and end script.
    
*/
const HUNTERSMARK = (() => { // eslint-disable-line no-unused-vars

    const script_name = 'HUNTERSMARK';
    const version = '0.3.0';
    const lastUpdate = 1593500895369;
    
    const tokenName = token => token.get('name') ? token.get('name') : (token.get('_id') ? token.get('_id') : 'Unknown');
    const findHunter = (hunter, hunted = 'hunter') => state.HUNTERSMARK.hunters.findIndex(item => item[hunted] === hunter);
    const getWho = who => who.split(' (GM)')[0];
    const mark = '&#64;&#123;selected|character_id&#125; &#64;&#123;target|token_id&#125;';
    const CSS = {
        container: 'border: 1pt solid green; background-color: white; font-size: 0.9em; border-radius: 10px;',
        table: '<table style="border:0;">',
        trow: '<tr style="border-bottom: 1px solid #ddd; border-top: 1px solid #ddd;"><td style="font-weight:bold; padding-left: 5px; padding-right: 5px;">',
        tmiddle: '</td><td>' ,
        trowend: '</td></tr>',
        tend: '</table>',
        button: 'border:0; margin-left: 3px; margin-right: 3px; padding-left: 5px; padding-right: 5px; border-radius: 7px; background:green;color:white;font-weight:bold;',
        center: 'text-align: center;',
        leftpad: 'padding-left: 10px;',
        heading: 'text-align: center; text-decoration: underline; font-size: 16px; line-height: 24px;'
    };
    
    const checkState = () => {
        if(!state.hasOwnProperty('HUNTERSMARK')) {
            state.HUNTERSMARK = {
                schema: 0.0,
                hunters: []
            };
        }
        /* hunter: {
            hunter: id of character,
            mark: tag of status marker to assign,
            marked: id of last character marked, or ''
        }
        */
    };

    const checkInstall = () =>  {
        log(`-=> ${script_name.toUpperCase()} v${version} <=-  [${new Date(lastUpdate)}]`);
        // include state checking here
        checkState();

    };

    const handleInput = (msg) => {
        if (msg.type !== 'api' || !/!hunters-mark\b/.test(msg.content.toLowerCase())) {
            return; 
        }
        
        const args = msg.content.split(/\s/);
        const command = args[1] || '';

        if(!command || command.toLowerCase() === 'help') {
            showHelp(getWho(msg.who));
        } else if(command.toLowerCase() === 'add') {
            hunter(msg, 1);
        } else if(command.toLowerCase() === 'delete') {
            hunter(msg, -1);
        } else if(command.toLowerCase() === 'show') {
            showState(getWho(msg.who));
        } else if(command.toLowerCase() === 'menu') {
            showMenu(getWho(msg.who));
        /*} else if(command.toLowerCase() === 'mark') {
            sendChat('player|' + getWho(msg.who),`!hunters-mark ${mark}`);*/
        } else {
            if(msg.selected > 1) {
                sendChat(script_name,`/w "${getWho(msg.who)}" You must have only one token selected.`);
                return;
            }
            tokenMarker(args[1], args[2], getWho(msg.who));
        }
    };

    const showHelp = who => {
        const help = {
            show: 'This shows the current list of hunters, and their marks.',
            add: 'To add a new hunter, select a token representing the character and apply the status marker you want to use as their mark. Then click Add.',
            'delete': 'To remove a character from the list of hunters, select a token representing them and click Delete.',
            help: 'Show this description.',
            menu: "Show a set of buttons to activate the script's features.",
            'mark a target': `<p>To mark a target, use <code>!hunters-mark [character id of hunter] [token id of target]. </code></p><p>A good way to do this is <code>!hunters-mark ${mark}</code></p>`
        };
        let output = `<div style="${CSS.container}"><h3 style="${CSS.heading}">Hunter's Mark Instructions</h3><p3>Use <code>!hunters-mark</code> followed by one of the commands below.</p>${CSS.table}`;
        Object.entries(help).forEach(([key, value]) => {
            output += `${CSS.trow}${key}${CSS.tmiddle}${value}${CSS.trowend}`;
        });
        output += CSS.tend + '</div>';
        sendChat(script_name, `/w "${who}" ${output}`);
        showMenu(who);
    };

    const showMenu = (who) => {
        const buttons = {
            Show: 'show',
            Add: 'add',
            'Delete': 'delete',
            Help: 'help'
            
        };
        const output = `<div style="${CSS.container}"><h3 style="${CSS.heading}">Hunters Mark Menu</h3>` +
            `<p style="${CSS.center}">${makeButton('Mark / Unmark Target', mark, 'width: 192px; font-size: 1.1em; text-align:center;')}</p>`
            + `<p style="${CSS.center}">${Object.entries(buttons).reduce((list, [key, value]) => list + makeButton(key, value), '')}</p></div>`;
        sendChat(script_name, `/w "${who}" ${output}`);
    };

    const makeButton = (label, button, width='') => {
        return `<a style="${CSS.button}${width}" href="!hunters-mark ${button}">${label}</a>`;
    };
    
    const showState = (who) => {
        const tokenMarkers = JSON.parse(Campaign().get('token_markers'));
        const getIcon = tag => tokenMarkers.find(item => tag === item.tag).url;
        const hunters = state.HUNTERSMARK.hunters.map(hunter => `<tr><td style="${CSS.leftpad}"><img src="${getIcon(hunter.mark)}"></td><td style="${CSS.leftpad}"><p>**${getObj('character', hunter.hunter).get('name')}**${hunter.marked ? ` </p><p>Marked: ${getObj('graphic',hunter.marked).get('name')}` : ''}</p></td></tr>`);
        sendChat(script_name, `/w "${who}" <div style="${CSS.container}"><h3 style="${CSS.heading}">Hunter Details</h3><table>${hunters.join('')}</table> </div>`);
    };
    
    const hunter = (msg, addordelete) => {
        if (!msg.selected) { 
            sendChat(script_name,`/w "${getWho(msg.who)}" You need to select at least one character's token, and each must have a single status marker assigned.`);
            return;
        }
        let showstate = false;
        let excluded = [];
        (msg.selected||[]).forEach((obj) => {
            let token = getObj('graphic', obj._id);
            if (token) {
                let character = getObj('character', token.get('represents'));
                if (character) {
                    if(addordelete === -1) {
                        // delete selected characters from state
                        const found = findHunter(character.get('_id'));
                        if(found === -1) {
                            excluded.push(tokenName(token));
                        } else {
                            state.HUNTERSMARK.hunters.splice(found, 1);
                        }
                    } else if (addordelete === 1) {
                        // only need to check marker if adding.
                        const marker = token.get('statusmarkers').split(',');
                        if(marker.length === 0 || marker.length > 1 || marker[0] === '') {
                            excluded.push(tokenName(token));    
                        } else {
                            const newHunter = {
                                hunter: character.get('_id'),
                                marked: '',
                                mark: marker[0]
                            };
                            const found = findHunter(newHunter.hunter);
                            if(found === -1) {
                                state.HUNTERSMARK.hunters.push(newHunter);
                            } else {
                                state.HUNTERSMARK.hunters.splice(found, 1, newHunter);
                            }
                        }
                    }
                    showstate = true;
                    // report characters in state.
                } else {
                    excluded.push(tokenName(token));
                }
            }

        });

        if(showstate) {
            showState(getWho(msg.who));
        }
        if(excluded.length > 0) {
            sendChat(script_name, `/w "${getWho(msg.who)}" The following tokens were either missing elements or had too many markers, and were not updated: ${excluded.join(', ')}.`);
        }
    };
    
    const tokenMarker = (hunter_id, target_id, who) => {
        const hunter_index = findHunter(hunter_id);
        if(hunter_index === -1) {
            sendChat(script_name, `/w "${who}" Hunter is not found. Check they are set up properly.`);
            return;
        }
        const token = getObj('graphic', target_id);
        if(!token) {
            sendChat(script_name, `/w "${who}" Target token is not a valid target.`);
            return;
        }
        /* here starts the actual work of the script */
        if(target_id == state.HUNTERSMARK.hunters[hunter_index].marked) {
            // the target token matches the id stored in owner. 
            // This character is already marked, so unmark him and clear mark_id 
            state.HUNTERSMARK.hunters[hunter_index].marked = '';
            changeMarker(target_id, state.HUNTERSMARK.hunters[hunter_index].mark, 'remove');
        } else {
            // marking a new target so:
            // get old mark, and remove mark from previous character
            // update mark_id and add marker
            const oldmark = state.HUNTERSMARK.hunters[hunter_index].marked;
            if(oldmark !== '') {
                // find old character, remove mark from them, then:
                changeMarker(oldmark, state.HUNTERSMARK.hunters[hunter_index].mark, 'remove');
            }
            state.HUNTERSMARK.hunters[hunter_index].marked = target_id;
            changeMarker(target_id, state.HUNTERSMARK.hunters[hunter_index].mark, 'add');
            
        }
    };

    const changeMarker = (tid, marker, addorremove = 'add') => {
        const token = getObj('graphic', tid);
        if(token) {
            let tokenMarkers = token.get('statusmarkers').split(',');
            if(addorremove === 'add') {
                if(!tokenMarkers.includes(marker)) {
                    tokenMarkers.push(marker);    
                }
            } else if(addorremove === 'remove') {
                tokenMarkers = tokenMarkers.filter(item => item !== marker);    
            } else {
                return;
            }
            token.set('statusmarkers', tokenMarkers.join(','));
        }
    };
    
    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready', () => {
        checkInstall();
        registerEventHandlers();
    });

})();
