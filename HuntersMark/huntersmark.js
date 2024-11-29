/*
    !hunters-mark 
    !hunters-mark add
    !hunters-mark bard
    !hunters-mark delete
    !hunters-mark help
    !hunters-mark show
    !hunters-mark menu
    !hunters-mark @{selected|token_id} @{target|token_id}
        this used to be !hunters-mark @{selected|character_id} @{target|token_id}

    add     adds selected character as a new hunter. 
            must have exactly one marker
    bard    as above, but adds a bard-like character
    delete  removes the currently selected character from all lists
    help    shows help menu, and description of each feature
    show    shows current hunters in state
    menu    shows the menu of buttons
    
    if none of above
        assumes arg[1] is a the acting character's token_id, and arg[2] is the target's token id. 
            (note: this is a change - earlier versions of the script used character_id for args[1])
        if not, will send a warning and end the script.
    
*/
var API_Meta = API_Meta || {};
API_Meta.Reporter = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
}; {
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.Reporter.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4));
    }
}

const HUNTERSMARK = (() => { // eslint-disable-line no-unused-vars

    const script_name = 'HUNTERSMARK';
    const version = '0.4.0';
    const lastUpdate = 1593500895369;
    
    const tokenName = token => token.get('name') ? token.get('name') : (token.get('_id') ? token.get('_id') : 'Unknown');
    const findHunter = (hunter, hunted = 'hunter') => state.HUNTERSMARK.hunters.findIndex(item => item[hunted] === hunter);
    const findBard = (hunter, hunted = 'hunter') => state.HUNTERSMARK.bards.findIndex(item => item[hunted] === hunter);
    const getWho = who => who.split(' (GM)')[0];
    const mark = '&#64;&#123;selected|token_id&#125; &#64;&#123;target|token_id&#125;';
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
                hunters: [],
                
            };
        } else {
            if(!state.HUNTERSMARK.bards) {
                state.HUNTERSMARK.bards = [];
                state.HUNTERSMARK.schema = 0.1;
            }
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
        } else if(command.toLowerCase() === 'add'  || command.toLowerCase() === 'hunter') {
            hunter(msg, 1);
        } else if(command.toLowerCase() === 'bard') {
            hunter(msg, 2);
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
            const target_id = args[2];
            const token_id = args[1];
            let character_id;
            try {
                const token = getObj('graphic', token_id);
                const rep = token.get('represents');
                const character = getObj('character', rep);
                character_id = character.id; 
            } catch(e) {
                sendChat(script_name,`/w "${getWho(msg.who)}" Check the character's token - is the REPRESENTS field assigned?`);
                return;
            }
            tokenMarker(character_id, token_id, target_id, getWho(msg.who));
        }
    };

    const showHelp = who => {
        const help = {
            show: 'This shows the current list of activated tokens, and their marks.',
            hunter: 'To define a new hunter-like character, select a token representing the character and apply the status marker you want to use as their mark. Then click Hunter.',
            bard: 'To define a new bard-like character, select a token representing the character and apply the status marker you want to use as their mark. Then click Bard.',
            'delete': 'To remove a character from their current list, select a token representing them and click Delete.',
            help: 'Show this description.',
            menu: "Displays a button to activate each of the script's features. For convenience, this menu is always shown after Help and Show.",
            'mark a target': `<p>To mark a target, use <code>!hunters-mark [token id of hunter] [token id of target]. </code></p><p>For example: <code>!hunters-mark ${mark}</code></p>`
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
            Hunter: 'add',
            Bard: 'bard',
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
        //const hunters = state.HUNTERSMARK.hunters.map(hunter => `<tr><td style="${CSS.leftpad}"><img src="${getIcon(hunter.mark)}"></td><td style="${CSS.leftpad}"><p>**${getObj('character', hunter.hunter).get('name')}**${hunter.marked ? ` </p><p>Marked: ${getObj('graphic',hunter.marked).get('name')}` : ''}</p></td></tr>`);
        
        const hunters = state.HUNTERSMARK.hunters.map(hunter => `<tr><td style="${CSS.leftpad}"><img src="${getIcon(hunter.mark)}"></td><td style="${CSS.leftpad}"><p>**${getObj('character', hunter.hunter).get('name')}**</p></td></tr>`);
        const bards = state.HUNTERSMARK.bards.map(hunter => `<tr><td style="${CSS.leftpad}"><img src="${getIcon(hunter.mark)}"></td><td style="${CSS.leftpad}"><p>**${getObj('character', hunter.hunter).get('name')}**</p></td></tr>`);
        sendChat(script_name, `/w "${who}" <div style="${CSS.container}"><h3 style="${CSS.heading}">Hunter-like Characters</h3><p style="text-align: center;">Only one target can be marked.</p><table>${hunters.join('')}</table><h3 style="${CSS.heading}">Bard-like Characters</h3><p  style="text-align: center;">Multiple targets can be marked.</p><table>${bards.join('')}</table> </div>`);
        showMenu(who);
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
                    const found_hunter = findHunter(character.get('_id'));
                    const found_bard = findBard(character.get('_id'));                    
                    if(addordelete === -1) {
                        // delete selected characters from state
                        if(found_hunter === -1) {
                            excluded.push(tokenName(token));
                        } else {
                            state.HUNTERSMARK.hunters.splice(found_hunter, 1);
                        }
                        
                        if(found_bard === -1) {
                            excluded.push(tokenName(token));
                        } else {
                            state.HUNTERSMARK.bards.splice(found_bard, 1);
                        }
                    } else if (addordelete >= 1) {
                        // only need to check marker if adding.

                        const colour_markers = ["red", "blue", "green", "brown", "purple", "pink", "yellow", "dead"];

                        const marker = token.get('statusmarkers').split(',');
                        if(marker.length === 0 || marker.length > 1 || marker[0] === '') {
                            excluded.push(tokenName(token));    
                        } else {
                            const newHunter = {
                                hunter: character.get('_id'),
                                marked: '',
                                mark: marker[0]
                            };
                            //problem with coloured status markers - they cause sandbox to crash
                            if (colour_markers.includes(newHunter.mark)) {
                                sendChat(script_name,`You cannot use the pure color or dead markers (the top row).`);
                                return;
                            }
                            
                            // need to delete the token if it already exists, then add it again.
                            if(found_hunter > -1) state.HUNTERSMARK.hunters.splice(found_hunter, 1)
                            if(found_bard > -1) state.HUNTERSMARK.bards.splice(found_bard, 1);
                            if(addordelete == 2) {
                                state.HUNTERSMARK.bards.push(newHunter);
                            } else if (addordelete == 1) {
                                state.HUNTERSMARK.hunters.push(newHunter);
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
    
    const tokenMarker = (character_id, token_id, target_id, who) => {
        const hunter_index = findHunter(character_id);
        const bard_index = findBard(character_id);
        if(hunter_index === -1 && bard_index === -1) {
            sendChat(script_name, `/w "${who}" Marker is not found. Check they are set up properly.`);
            return;
        }
        const target_token = getObj('graphic', target_id);
        if(!target_token) {
            sendChat(script_name, `/w "${who}" Target token is not a valid target.`);
            return;
        }
        
        const mark = (hunter_index > -1) ? state.HUNTERSMARK.hunters[hunter_index].mark : state.HUNTERSMARK.bards[bard_index].mark;
        // ERROR: want to handle if undefined
        if(hunter_index > -1) {
            removeMarkers(mark, target_id, token_id);
        }
        updateMarker(target_id, mark);
    };

    const updateMarker = (tid, marker) => {
        const token = getObj('graphic', tid);
        if(token) {
            let tokenMarkers = token.get('statusmarkers').split(',');
            //sendChat('', `marker: ${marker}; markers: ${tokenMarkers}`)
            if(!tokenMarkers.includes(marker)) {
                tokenMarkers.push(marker);    
            } else  {
                tokenMarkers = tokenMarkers.filter(item => item !== marker);    
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

    const removeMarkers = (marker, ...token_ids) => {
        // tokens is a rest array - it will be an array of tokens to ignore with this function
        let tokens = findObjs({_subtype: "token"});
        // want to loop thtrough every token t
        tokens.forEach(token => {
            const tid = token.id;
            if(!token_ids.includes(tid)) {
                let tokenMarkers = token.get('statusmarkers').split(',');
                if(tokenMarkers.includes(marker)) {
                    tokenMarkers = tokenMarkers.filter(item => item !== marker);    
                    token.set('statusmarkers', tokenMarkers.join(','));
                } 
            }
        });
    }
})();
/* CHANGES
    make sure to use token_id at the start in place of character_id
    Removes a crash when selecting any of the first row markers (coloutred and dead).
    Adds bard-like characters that can assign marks to multiple characters.
    Can change the assigned marker just by adding them again (before, you had to delete then re-add)
    Can swap characters between lists just by adding them to relevant list
    Can't add the same character multiple times to the same list.
    The way last-marked character is recorded has changed, so it isn't displayted in the Show list any more.


    Might want clear marks: 
        clear all tokens of all marks. (Clear All)
        clear a single token of all marks (use target). (Clear Token)
        Remove a specific mark from all tokens. (clear Mark) select a token with one or mor marks, and remove them from all tokens.
        if a character can mark, add that on to their token (Show Mark). Marke select multiple tokens - could be useful before Clear Mark
        these would be different functions. Culd add another row of buttons.
    
    What if a character has a token-marker that doesn't exist? For example, it was created with a custom set in one game, and that was changed.

    Show function: when displaying chsraacters, maybe don't show a list if it has no characters. If no characters in both, have a boilerplate message.
*/