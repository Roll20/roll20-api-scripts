/**
 * Version: 2.0
 * Made By Jason Martin
 */

/**
 * If it hasn't been initialized before, initialized persistent status object 
 * storage in the state object. The state object contains an Array of status 
 * objects, and a one-up counter of the next available status id value. Status 
 * objects have the following properties: 
 *   id - Theoretically unique id for this object.
 *   name - A label for the status.
 *   duration - Integer duration of the status. -1 is permanent
 *   token_id - A graphics token associated with this object. "-1" if not 
 *              associated with a token.
 *   link_id - If not "-1", the turn order status is associated with this token 
 *             id. Used to have hidden statuses.
 *   marker - Marker tag value to be placed on targets of the status
 *   targets - List of target tokens for the effect
 *   show - The visibility status of the token.
 */
function createStatusTrackerObj() {
    var obj = new Object();
    obj.nextId = 1;
    obj.list = new Array();
    return obj;
}
state.status_tracker = state.status_tracker || createStatusTrackerObj();

/**
 * Constants 
 */
var StatusTrackerConsts = StatusTrackerConsts || {};
StatusTrackerConsts.SCRIPT_NAME = "StatusTracker";
StatusTrackerConsts.CMD_PREFIX = '!statustracker';
StatusTrackerConsts.SUBCMD_ADD_STATUS = 'add_status';
StatusTrackerConsts.SUBCMD_ADD_TARGET = 'add_target';
StatusTrackerConsts.SUBCMD_CLEAR = 'clear';
StatusTrackerConsts.SUBCMD_HARD_RESET = 'hard_reset';
StatusTrackerConsts.SUBCMD_REMOVE_STATUS = 'remove_status';
StatusTrackerConsts.SUBCMD_REMOVE_TARGET = 'remove_target';
StatusTrackerConsts.SUBCMD_SHOWMENU = 'showmenu';
StatusTrackerConsts.SUBCMD_SHOW_STATUS = 'show_status';
StatusTrackerConsts.NO_TOKEN = "-1";

// List of token objects loaded into this campaign. This gets populated on ready
var tokenMarkers;

/******************************************************************************/

/**
 * Management of the status objects and markers.
 */
var StatusTracker = StatusTracker || (function() {

    /**
     * @summary Create an off-board graphics object.
     * @param name - Name for the token.
     * @param show - String value specifying where the token is hidden or not.
     *               If this value is "hidden", the token will be placed in the 
     *               gmlayer; otherwise, it will be placed in the objects layer.
     */
    function create_token(name, show) {
        var layer = (show == 'hidden' ? 'gmlayer' : 'objects');
        return createObj('graphic', {
           subtype: 'token',
           imgsrc: "",
           layer: layer,
           top: -100,
           left: -100,
           width: 70,
           height: 70,
           name: name, 
           showname: true,
           pageid: Campaign().get("playerpageid"),
        });
    } // function create_token
    
    
    /**
     * @summary Get the next available status object id.
     * @returns integer value for the next status object id.
     */
    function get_next_id() {
        var found;
        var id;
        do {
            found = false;
            id = state.status_tracker.nextId++;
            for (let i = 0; i < state.status_tracker.list.length; i++) {
                if (state.status_tracker.list[i].id == id) {
                    found = true;
                    break;
                }
            }
        } while (found == true)
        return id;
    } // function get_next_id
    
    
    /**
     * @summary Insert a status object into the turnorder.
     * @param statusObj - A generated status object
     */
    function insert_status_into_turnorder(statusObj) {
        let turnorderStr = Campaign().get('turnorder')
        var turnorder = JSON.parse(turnorderStr);
        var position = 0; // By default, at the end of the turnorder
        if (statusObj.token_id != StatusTrackerConsts.NO_TOKEN) {
            for (let i = 0; i < turnorder.length; i++) {
                // Look for the turnorder object associated with the token_id
                if (turnorder[i].id == statusObj.token_id) {
                    position = i;
                    break;
                }
            } 
        }
        
        // Create the turn order object
        turnObj = new Object();
        turnObj.id = statusObj.link_id;
        turnObj.pr = statusObj.duration;
        turnObj.custom = statusObj.name;
        turnObj.status_id = statusObj.id;
        turnObj.formula = (statusObj.duration == -1 ? 0 : -1);
        turnObj.token_id = statusObj.token_id;
        
        // Insert the token into the turn order and save
        turnorder.splice(position, 0, turnObj);
        Campaign().set('turnorder', JSON.stringify(turnorder));
        return;
    } // function insert_status_into_turnorder
    
    
    /**
     * @summary Removes a status from the turnorder
     * @param statusId - integer id of a status effect
     */
    function remove_status_from_turnorder(statusId) {
        let turnorderStr = Campaign().get('turnorder')
        var turnorder = JSON.parse(turnorderStr);
        for (let i = 0; i < turnorder.length; i++) {
            if (turnorder[i].status_id == statusId) {
                turnorder.splice(i,1);
                break;
            }
        }
        Campaign().set('turnorder', JSON.stringify(turnorder));
        return;
    } // function remove_status_from_turnorder
    
    
    /**
     * @summary Add a new status effect.
     * @param tokenId - Token id to associate the effect with. If not associated
     *                  with an on-board token, this should be "-1".
     * @param statusName - The label for the status effect
     * @param duration - How many turns the effect lasts. -1 for permanent
     * @param markerName - The name of the marker that will be added to targets
     *                     of the effect.
     * @param show - String for how to display the status effect in the turn 
     *               tracker. "hidden" will make the effect visible to the GM;
     *               "no" will not have it visible at all (and effectively 
     *               permanent). Default for visible in the turn tracker is "yes".                
     */
    function add_status(tokenId, statusName, duration, markerName, show) {
        let durationNum = Number(duration);
        
        // Look up the marker tag, which may or may not be the same thing as 
        // the marker name. The tag will get used to add/remove the marker from
        // a token.
        var markerTag = "";
        for (let i = 0; i < tokenMarkers.length; i++) {
            if (tokenMarkers[i].name == markerName) {
                markerTag = tokenMarkers[i].tag;
                break;
            }
        }
        
        // If we couldn't find the tag, use the name. The tag values of built-in
        // markers are the same as their names. 
        if (markerTag == "") {
            markerTag = markerName;
        }
        
        // If the status is hidden, or not associated with a game token, 
        // create a phantom token for it.
        var link_id = StatusTrackerConsts.NO_TOKEN;
        if ('hidden' == show) {
            var token = create_token(statusName, show)
            link_id = token.id
        }
        
        // Create a new status object and insert it into the status tracker
        newStatus = new Object();
        newStatus.id = get_next_id();
        newStatus.name = statusName;
        newStatus.duration = durationNum;
        newStatus.targets = new Array();
        newStatus.token_id = tokenId;
        newStatus.link_id = link_id;
        newStatus.marker = markerTag;
        newStatus.show = show;
        
        // Insert the new status into the status list
        state.status_tracker.list.push(newStatus);
        // Add it to the turn order.
        if (newStatus.show != 'no') {
            insert_status_into_turnorder(newStatus);
        }
        return;
    } // function add_status
    
    
    /**
     * @summary Adds a target for a status effect. If that status has a marker,
     *          the target token will have that marker placed on it.
     * @param statusId - Integer id for a status effect
     * @param targetId - String token id being targeted.
     */
    function add_status_target(statusId, targetId) {
        // Get the status object
        statusObj = get_status_obj(statusId);
        if (undefined == statusObj) {
            // Couldn't find it
            return;
        }
        
        // Check if the target token id is already a target.
        if (-1 != statusObj.targets.indexOf(targetId)) {
            // Already a target
            return;
        }
        
        // Add the status marker to the target, and record it as a target.
        add_marker(targetId, statusObj.marker);
        statusObj.targets.push(targetId);
        return;
    } // function add_status_target
    
    
    /**
     * @summary Gets the status object with the given status id.
     * @param statusId - Integer id for a status effect
     * @returns Status object for the given id. Return undefined if not found.
     */
    function get_status_obj(statusId) {
        for (let i = 0; i < state.status_tracker.list.length; i++) {
            statusObj = state.status_tracker.list[i];
            if (statusObj.id == statusId) {
                return statusObj;
            } 
        }
        return undefined;
    } // function get_status_obj
    
    
    /**
     * @summary Adds a marker to a token
     * @param targetId - String token id.
     * @param markerTag - Marker tag value 
     */
    function add_marker(targetId, markerTag) {
        // Get the graphic object for the given id.
        var token = getObj('graphic', targetId);
        if (undefined == token) {
            return;
        }
        
        // Add the marker tag to the list of markers for this token.
        var token_markers = token.get('statusmarkers').split(",");
        token_markers.push(markerTag);
        token.set('statusmarkers', token_markers.join(","));
        return;
    } // function add_marker
    
    
    /**
     * @summary Remove a marker from a token
     * @param tokenId - String token id
     * @param markerTag - Marker tag value
     */
    function remove_marker(tokenId, markerTag) {
        // Get the graphic object for the given id.
        var token = getObj('graphic', tokenId);
        if (undefined == token) {
            return;
        }
        
        // Bust out the marker tags for the token. Remove one instance of the 
        // marker from the object.
        var token_markers = token.get("statusmarkers").split(",");
        for (let i = 0; i < token_markers.length; i++) {
            if (token_markers[i] == markerTag) {
                token_markers.splice(i, 1);
                token.set("statusmarkers", token_markers.join(","));
                break;
            }
        }
        return;
    } // function remove_marker
    
    
    /**
     * @summary Remove and clean up a status effect
     * @param statusId - Integer id for a status effect
     */
    function remove_status(statusId) {
        // Get the status object from the global store
        statusObj = get_status_obj(statusId);
        if (undefined == statusObj) {
            return;
        }
        
        // Remove the markers from each target of the status
        for (let i = 0; i < statusObj.targets.length; i++) {
            remove_marker(statusObj.targets[i], statusObj.marker);
        }
        
        // Remove the turnorder element
        remove_status_from_turnorder(statusObj.id);
        
        // Remove the status object from the global store.
        let index = state.status_tracker.list.indexOf(statusObj)
        if (-1 != index) {
            state.status_tracker.list.splice(index, 1);
        }
        
        // If there's a standalone token associated with this status, remove it.
        if (StatusTrackerConsts.NO_TOKEN != statusObj.link_id) {
            token = getObj('grapic', statusObj.link_id)
            if (undefined != token) {
                token.remove();
            }
        }
        return;
    } // function remove_status
    
    
    /**
     * @summary Removes all status effects associated with a token.
     * @param tokenId - String token id
     */
    function remove_token(tokenId) {
        // Walk backwards through the status list, looking for entries 
        // associated with the given token. Remove any found.
        for (let i = state.status_tracker.list.length - 1; i >= 0; i--) {
            if (state.status_tracker.list[i].token_id == tokenId) {
                remove_status(state.status_tracker.list[i].id);
            }
        }
        return;
    } // function remove_token
    
    
    /**
     * @summary Process status effects associated with a turn order object.
     * @param turnObj - A turn order object
     */
    function next_turn(turnObj) {
        // If there's no status associated with this turn, kick out.
        if (undefined == turnObj || undefined == turnObj.status_id) {
            return;
        }

        // Get the status object for this turn object.
        statusObj = get_status_obj(turnObj.status_id)
        if (undefined == statusObj) {
            return;
        }
        
        // If the status has a duration, set the duration to the current turns
        // pr value.
        if (statusObj.duration > 0) {
            statusObj.duration = turnObj.pr;
        }
        
        // If the duration has timed out, remove it.
        if (0 == statusObj.duration) {
            // remove the status object
            remove_status_from_turnorder(statusObj.id);
            remove_status(statusObj.id);
        }
        return;
    } // function next_turn

    
    /**
     * @summary Remove all statuses associated with a token id. 
     * @param tokenId - String token id. If the id is "all", remove all statuses.
     */
    function clear(tokenId) {
        // See if the input param is 'all'. If it is, we're clearing out 
        // everything.
        let isAll = (tokenId.toLowerCase() == "all");
        
        // This _should_ work. Walk the status_tracker array back-to-front, 
        // meaning we're deleting things from the back, meaning we _shouldn't_
        // be dorking with our array index. In theory.
        for (let i = state.status_tracker.list.length - 1; i >= 0; i--) {
            let statusObj = state.status_tracker.list[i];
            if (isAll == true || statusObj.token_id == tokenId) {
                remove_status(statusObj.id);
            }
        }
        return;
    } // function clear
        
    
    /**
     * @summary If tokens were removed from the the turn order, remove any 
     *          statuses linked to those tokens.
     * @param currentTurn - JSON object defining the current turnorder
     * @param previousTurn - JSON object defining the previous turnorder
     */
    function validate_statuses(currentTurn, previousTurn) {
        for (let i = previousTurn.length - 1; i >= 0; i--) {
            let found = false;
            let turnId = previousTurn[i].id;
            for (let j = 0; j < currentTurn.length; j++) {
                if (currentTurn[j].id == turnId) {
                    found = true;
                }
            }
            if (false == found) {
                if (undefined != previousTurn[i].status_id) {
                    // If the turnorder entry has a status_id, it's something
                    // we created for a status effect. Remove that effect.
                    remove_status(previousTurn[i].status_id)
                } // end if (undefined != ...
                else if ("-1" != turnId) {
                    // A non-"-1" turn id is linked to a token. Clear out any 
                    // status effects it might have.
                    clear(turnId);
                } // end else if ("-1" != ...
            } // end if (false == found)
        } // end for
        return;
    } // function validate_statuses
    
    
    /**
     * @summary Gets a list of status objects associated with a token.
     * @param tokenId - String token id. If the id is "all", get all statuses.
     * @returns Array containing status id objects
     */
    function get_token_statuses(tokenId) {
        var status_list = new Array();
        let isAll = (tokenId.toLowerCase() == 'all');
        for (let i = 0; i < state.status_tracker.list.length; i++) {
            statusObj = state.status_tracker.list[i];
            if (true == isAll || statusObj.token_id == tokenId) {
                status_list.push(statusObj);
            }
        }
        return status_list;
    } // function get_token_statuses
    
    
    /**
     * @summary Removes a token as a target of a status.
     * @param statusId - Integer id for a status effect
     * @param targetId - String token id
     */
    function remove_status_target(statusId, targetId)
    {
        var statusObj = get_status_obj(statusId);
        if (undefined == statusObj) {
            return;
        }
        remove_marker(targetId, statusObj.marker);
        let index = statusObj.targets.indexOf(targetId);
        if (-1 != index) {
            statusObj.targets.splice(index, 1);
        }
        return;
    } // function remove_status_target

    return {
        // List of functions and params to expose
        
        addStatus: add_status,
        addTarget: add_status_target,
        clear: clear,
        getTokenStatuses: get_token_statuses,
        nextTurn: next_turn,
        removeStatus: remove_status,
        removeTarget: remove_status_target,
        removeToken: remove_token,
        validateStatuses: validate_statuses,
    };
}()); // StatusTracker



/******************************************************************************/

/**
 * Menus and interfaces.
 */
var StatusTrackerMenus = StatusTrackerMenus || (function() {
    
    var MENU_CSS = {
        'centeredBtn': {
          'text-align': 'center'
        },
        'menu': {
          'background': '#fff',
          'border': 'solid 1px #000',
          'border-radius': '5px',
          'font-weight': 'bold',
          'margin-bottom': '1em',
          'overflow': 'hidden'
        },
        'menuBody': {
          'padding': '5px',
          'text-align': 'center'
        },
        'menuHeader': {
          'background': '#000',
          'color': '#fff',
          'text-align': 'center'
        }
    };

    
    // Marker select is a prepopulated macro input line for selecting loaded 
    // markers by name.
    // TODO : Would love to get the images involves in the drop down.
    var markerSelect = "?{Select Marker|";
    const base_markers = ['red', 'blue', 'green', 'brown', 'purple', 'pink', 'yellow', 'dead']
    
    /**
     * @summary Create the drop-down menu for the marker select input.
     */
    function create_marker_select() {
        // Add the default markers (colors and dead)
        _.each(base_markers, marker => {
            markerSelect = markerSelect + marker + "|";
        });
        // Add the loaded token markers.
        _.each(tokenMarkers, marker => {
            markerSelect = markerSelect + marker.name + "|";
        });
        
        // Trim off the trailing '|'
        markerSelect = markerSelect.substring(0, markerSelect.length - 1);
        markerSelect = markerSelect + "}";
    } // function create_marker_select
    
    
    /**
     * @summary Create a menu panel using HtmlBuilder
     * @param header - Label for the menu
     * @param content - Menu html content.
     * @returns HtmlBuilder object
     */
    function _build_menu_panel(header, content) {
        let menu = new HtmlBuilder('.menu');
        menu.append('.menuHeader', header);
        menu.append('.menuBody', content);
        return menu;
    } // function _build_menu_panel
    
    
    /**
     *  @summary Create the "Show Menu" macro.
     */
    function create_menu_macro() {
        let players = findObjs({_type: 'player'});
         _.each(players, player => {
            let playerId = player.get('id');
            if (!playerIsGM(playerId)) {
                return;
            };
        
            let macro = findObjs({
                _type: 'macro',
                _playerid: playerId,
                name: 'StatusTrackerMenu'
            })[0];
            
            if (macro) {
                macro.set('action', '!statustracker showmenu');
            }
            else {
                createObj('macro', {
                   _playerid: playerId,
                   name: 'StatusTrackerMenu',
                   action: '!statustracker showmenu'
                });
            }
        });
    } // function create_menu_macro
    
    
    /**
     * @summary Displays the base menu in the chat window.
     */
    function show_menu() {
        let content = new HtmlBuilder('div');
        content.append('.centeredBtn').append('a', "Add Status to Token", {
            href: '!statustracker add_status --token &#64;{selected|token_id} --status ?{Effect Name} --duration ?{Duration in rounds (-1 for permanent)} --show ?{Show in turn tracker?|yes|no|hidden} --marker ' + markerSelect,
            title: 'Add New Token Status'
        });
        content.append('.centeredBtn').append('a', "Add Standalone Status", {
            href: '!statustracker add_status --token -1 --status ?{Effect Name} --duration ?{Duration in rounds (-1 for permanent)} --show ?{Show in turn tracker?|yes|no|hidden} --marker ' + markerSelect,
            title: 'Add New Standalone Status'
        });
        content.append('.centeredBtn').append('a', "Show Token Statuses", {
            href: '!statustracker show_status --token &#64;{selected|token_id}',
            title: 'Show Token Statuses'
        });
        content.append('.centeredBtn').append('a', "Show All Statuses", {
            href: '!statustracker show_status --token all',
            title: 'Show All Statuses'
        });
        content.append('.centeredBtn').append('a', "Clear Token Statuses", {
            href: '!statustracker clear --token &#64;{selected|token_id}',
            title: 'Clear All Token Statuses'
        });
        content.append('.centeredBtn').append('a', "Clear All Statuses", {
            href: '!statustracker clear --token all',
            title: 'Global Clear Statuses'
        });
        
        let menu = _build_menu_panel('StatusTracker Menu', content);
        sendChat(StatusTrackerConsts.SCRIPT_NAME, '/w gm ' + menu.toString(MENU_CSS));
    } // function show_menu
    
    
    /**
     * @summary Build the target/end menu for an individual status.
     * @param statusObj - Object for the status
     * @returns HtmlBuilder menu
     */
    function _build_status_menu(statusObj) {
        let content = new HtmlBuilder('div');
        content.append('.centeredBtn').append('a', "Add Target", {
            href: '!statustracker add_target --id ' + statusObj.id + ' --target &#64;{selected|token_id}',
            title: 'Add Target For Effect'
        });
        content.append('.centeredBtn').append('a', "Remove Target", {
            href: '!statustracker remove_target --id ' + statusObj.id + ' --target &#64;{selected|token_id}',
            title: 'Remove Target For Effect'
        });
        content.append('.centeredBtn').append('a', "End", {
            href: '!statustracker remove_status  --id ' + statusObj.id,
            title: 'End Effect'
        });
        
        let label = statusObj.name + " (" + statusObj.duration + ")";
        let tokenObj = getObj('graphic', statusObj.token_id);
        if (tokenObj != undefined) {
            label = label + " [" + tokenObj.get("name") + "]";
        }
        if (statusObj.targets.length > 0) {
            label = label + " [";
            for (let i = 0; i < statusObj.targets.length; i++) {
                label = label + " " + statusObj.targets[i] + ",";
            }
            // Trim off the last comma
            label = label.substring(0, label.length -1 ) + "]";
        }
        let menu = _build_menu_panel(label, content);
        return menu;
    } // function _build_status_menu
    
    
    /**
     * @summary Show the target menus for statuses associated with a given token
     * @param tokenId - Token id
     */
    function show_status_menu(tokenId) {
        let content = new HtmlBuilder('div');
        let statuses = StatusTracker.getTokenStatuses(tokenId);
        if (statuses.length == 0) {
            sendChat(StatusTrackerConsts.SCRIPT_NAME, '/w gm No active statuses');
            return;
        }
        _.each(statuses, function(obj) {
            let submenu = _build_status_menu(obj);
            content.append(submenu);
        });
        sendChat(StatusTrackerConsts.SCRIPT_NAME, '/w gm ' + content.toString(MENU_CSS));
        return
    } // function show_status_menu
    
    
    return {
        createMenuMacro: create_menu_macro,
        showMenu: show_menu,
        showStatusMenu: show_status_menu,
        createMarkerSelect: create_marker_select,
    };
    
}()); // StatusTrackerMenus


/******************************************************************************/

/**
 * Input handling
 */
var StatusTrackerCommandline = StatusTrackerCommandline || (function() {
    
    /**
     * Parses message content. The following presumptions are made:
     * 1. A command and any sub commands will be the first elements of the msg
     * 2. Parameters will be proceded by ' --<param name>'
     * 3. Each parameter name will be unique, and will be forced to lowercase.
     * 
     * An object will be returned with the potential properties of 'command', 
     * 'subcommand', and any parameter names.
     * @param msg - API commandline message content
     * @returns Object containing params from the command
     */
    function _argparse(msg) {
        var obj = {};
        // Split on  whitespace followed by "--".
        argv = msg.split(/\s+--/);
        // The first half of the split should be the command/subcommands.
        command = argv.shift().split(' ');
        if (command.length == 0) {
            return undefined;
        };

        // Populate the command and subcommand fields of the args object.
        obj['command'] = command.shift().toLowerCase();
        if (command.length >= 1) {
            obj['subcommand'] = command.join(' ').toLowerCase();
        }

        // Iterate through the remaining arguments. The first element of each
        // set should be the param name, followed by value. If no value, the
        // param will be set to true.
        _.each(argv, function(args) {
            let argSet = args.split(" ");
            if (argSet.length == 0) {
                return;
            } else if (argSet.length == 1) {
                // Treat parameters without as value as boolean
                obj[argSet[0].toLowerCase()] = true;
            } else {
                // Stitch a multi-spaced value back together.
                let key = argSet[0].toLowerCase();
                let value = argSet.slice(1).join(' ');
                obj[key] = value
            }
        });
        return obj;
    } // function _argparse


    /**
     * @summary Processes command string
     * @param msg - chat:message object
     */
    function do_command(msg) {
        args = _argparse(msg.content);
        if (args == undefined || args.command != StatusTrackerConsts.CMD_PREFIX) {
            return;
        }
        switch (args.subcommand) {
            case StatusTrackerConsts.SUBCMD_ADD_STATUS:
                StatusTracker.addStatus(args.token, args.status, args.duration, args.marker, args.show);
                StatusTrackerMenus.showStatusMenu(args.token);
                break;
            case StatusTrackerConsts.SUBCMD_ADD_TARGET:
                StatusTracker.addTarget(args.id, args.target);
                break;
            case StatusTrackerConsts.SUBCMD_CLEAR:
                StatusTracker.clear(args.token);
                break;
            case StatusTrackerConsts.SUBCMD_HARD_RESET:
                try {
                    StatusTracker.clear('all');    
                }
                catch (err) {
                    log(err);
                }
                state.status_tracker = createStatusTrackerObj();
            case StatusTrackerConsts.SUBCMD_REMOVE_STATUS:
                StatusTracker.removeStatus(args.id);
                break;
            case StatusTrackerConsts.SUBCMD_REMOVE_TARGET:
                StatusTracker.removeTarget(args.id, args.target);
                break;
            case StatusTrackerConsts.SUBCMD_SHOWMENU:
                StatusTrackerMenus.showMenu();
                break;
            case StatusTrackerConsts.SUBCMD_SHOW_STATUS:
                StatusTrackerMenus.showStatusMenu(args.token)
                break;
            default:
                // print help?
                break;
        }

        return;
    } // function do_command
    
    
    return {
        doCommand: do_command,
    }
}()); // StatusTrackerCommandline


/******************************************************************************/

// Handler for the turn order changing
on('change:campaign:turnorder', function(current, prev) {
    currentTurnorder = JSON.parse(current.get('turnorder'));
    previousTurnorder = JSON.parse(prev.turnorder);
    StatusTracker.validateStatuses(currentTurnorder, previousTurnorder);
    currentTurn = currentTurnorder.shift()
    StatusTracker.nextTurn(currentTurn);
});

// Handler for chat messages
on('chat:message', function(msg) {
    if (msg.type != 'api') {
        return;
    }
    StatusTrackerCommandline.doCommand(msg);
});

// Handler for graphic destruction. Remove statuses of tokens deleted off the 
// board.
on('destroy:graphic', function(obj) {
   StatusTracker.removeToken(obj.id); 
});

// Handler for 'ready'. Do any initial do-once setup.
on('ready', () => { 
    'use strict';
    // Create the list of available token markers
    tokenMarkers = JSON.parse(Campaign().get("token_markers"));
    StatusTrackerMenus.createMarkerSelect();
    // Create the show-menu macro
    StatusTrackerMenus.createMenuMacro();
    log("Loaded " + StatusTrackerConsts.SCRIPT_NAME);

});