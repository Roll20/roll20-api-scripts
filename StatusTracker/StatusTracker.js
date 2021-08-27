
/**
 * If it hasn't been initialized before, initialized persistent status object 
 * storage in the state object. Status objects have the following properties:
 *   token_id - Token the status is tied to. "-1" if not tied to a token.
 *   status_name - A label for the status.
 *   duration - Integer duration of the status. -1 is permanent
 *   marker - Marker tag value to be placed on targets of the status
 *   targets - List of target tokens for the effect
 *
 * The expectation is that the tuple (token_id, status_name) will be (mostly) 
 * unique, and will be used to lookup a given status.
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
StatusTrackerConsts.CMD_ADD_STATUS = 'add_status';
StatusTrackerConsts.CMD_ADD_TARGET = 'add_target';
StatusTrackerConsts.CMD_CLEAR = 'clear';
StatusTrackerConsts.CMD_STATUS = 'status';
StatusTrackerConsts.CMD_REMOVE_STATUS = 'remove_status';
StatusTrackerConsts.CMD_REMOVE_TARGET = 'remove_target';
StatusTrackerConsts.CMD_SHOWMENU = 'showmenu';
StatusTrackerConsts.CMD_SHOW_STATUS = 'show_status';
StatusTrackerConsts.NO_TOKEN = "-1";

// List of token objects loaded into this campaign. This gets populated on ready
var tokenMarkers;

/******************************************************************************/

/**
 * Management of the status objects and markers.
 */
var StatusTracker = StatusTracker || (function() {
    var _last_examined_status = "";
    

    function create_token(status_name, show) {
        var layer = (show == 'hidden' ? 'gmlayer' : 'objects')
        return createObj('graphic', {
           subtype: 'token',
           imgsrc: "",
           layer: layer,
           top: -100,
           left: -100,
           width: 70,
           height: 70,
           name: status_name, 
           showname: true,
           pageid: Campaign().get("playerpageid"),
        });
    } // function create_token
    
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
    
    function insert_status_into_turnorder(statusObj) {
        let turnorderStr = Campaign().get('turnorder')
        var turnorder = JSON.parse(turnorderStr);
        var position = 0;
        if (statusObj.link_id == StatusTrackerConsts.NO_TOKEN) {
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
        
        turnorder.splice(position, 0, turnObj);
        Campaign().set('turnorder', JSON.stringify(turnorder));
        return;
    } // function insert_status_into_turnorder
    
     
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
        if (show == 'hidden' || tokenId == StatusTrackerConsts.NO_TOKEN) {
            var token = create_token(status_name, show)
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
    
    function add_status_target(statusId, targetId) {
        statusObj = get_status_obj(statusId);
        if (undefined == statusObj) {
            return;
        }
        
        if (-1 == statusObj.targets.indexOf(targetId)) {
            // Already a target
            return;
        }
        
        add_marker(targetId, statusObj.marker);
        statusObj.targets.push(targetId);
        return;
        
    }
    
    function get_status_obj(statusId) {
        for (let i = 0; i < state.status_tracker.list.length; i++) {
            statusObj = state.status_tracker.list[i];
            if (statusObj.id == statusId) {
                return statusObj;
            } 
        }
        return undefined;
    }
    
    
    function add_marker(targetId, marker) {
        var token = getObj('graphic', tokenId);
        if (undefined == token) {
            return;
        }
        var token_markers = token.get('statusmarkers').split(",");
        token_markers.push(marker);
        token.set('statusmarkers', token_markers.join(","));
        return;
    } // function add_marker
    
    /**
     * Remove a marker from a token
     */
    function remove_marker(token_id, marker_tag) {
        var token = getObj('graphic', token_id);
        if (undefined == token) {
            return;
        }
        var token_markers = token.get("statusmarkers").split(",");
        for (let i = 0; i < token_markers.length; i++) {
            if (token_markers[i] == marker_tag) {
                token_markers.splice(i, 1);
                token.set("statusmarkers", token_markers.join(","));
                break;
            }
        }
        return;
    } // function remove_marker
    
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
    } // function remove_status
    
    function remove_token(tokenId) {
        for (let i = state.status_tracker.list.length - 1; i >= 0; i--) {
            if (state.status_tracker.list[i].token_id == tokenId) {
                remove_status(state.status_tracker.list[i].id);
            }
        }
        
    }
    
    function next_turn(currentTurn) {
        // If there's no status associated with this turn, kick out.
        if (undefined == currentTurn || undefined == currentTurn.status_id) {
            return;
        }
        // Record the last examined token
        _last_examined_status = currentTurn.status_id;
        // Get the status object for this turn object.
        statusObj = get_status_obj(currentTurn.status_id)
        if (undefined == statusObj) {
            
        }
        
        // If the status has a duration, decriment it.
        if (statusObj.duration > 0) {
            statusObj.duration--;
        }
        
        if (0 == statusObj.duration) {
            // remove the status object
            remove_status(statusObj.id);
        }
        return;
    }

    
    /**
     * Remove all statuses associated with a token id. If the "id" specified is
     * "all", remove all statuses.
     */
    function clear(token_id) {
        // See if the input param is 'all'. If it is, we're clearing out 
        // everything.
        let isAll = (token_id.toLowerCase() == "all");
        
        // This _should_ work. Walk the status_tracker array back-to-front, 
        // meaning we're deleting things from the back, meaning we _shouldn't_
        // be dorking with our array index. In theory.
        try {
            for (let i = state.status_tracker.length - 1; i >= 0; i--) {
                let obj = state.status_tracker[i];
                if (isAll == true || obj.token_id == token_id) {
                    remove_status(obj.token_id, obj.status_name);
                }
            }
        }
        catch (err) {
            // This is an abort, in case the status_tracker content got borked
            if (isAll) {
                state.status_tracker = new Array();
            }
        }
    } // function clear
        

    function remove_token_statuses(tokenId) {
        for (let i = state.status_tracker.list.length - 1; i >= 0; i--) {
            statusObj = state.status_tracker.list[i];
            if (tokenId == statusObj.token_id) {
                remove_status(statusObj.id);
            }
        }
    } // function remove_token_statuses
    
    
    /**
     * If tokens were removed from the the turn order, remove any statuses 
     * linked to those tokens.
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
                    remove_status(previousTurn[i].status_id)
                }
                else if ("-1" != turnId) {
                    remove_token_statuses(turnId);
                }
            }
        }
    } // function validate_statuses
    
    function get_token_statuses(tokenId) {
        var status_list = new Array();
        let isAll = (tokenId.toLowerCase() == 'all');
        for (let i = 0; i < state.status_tracker.list.length; i++) {
            obj = state.status_tracker.list[i];
            if (true == isAll || obj.token_id == tokenId) {
                status_list.push(obj);
            }
        }
        return status_list;
    }
    
    function remove_status_target(statusId, targetId)
    {
        
    }

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
     * Create the drop-down menu for the marker select input.
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
     * Create a menu panel using HtmlBuilder
     */
    function _build_menu_panel(header, content) {
        let menu = new HtmlBuilder('.menu');
        menu.append('.menuHeader', header);
        menu.append('.menuBody', content);
        return menu;
    } // function _build_menu_panel
    
    
    /**
     *  Create the "Show Menu" macro. Currently, this is only available for GMs.
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
     * Displays the base menu in the chat window.
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
        content.append('.centeredBtn').append('a', "Remove Effect From Token", {
            href: '!statustracker remove_status --token &#64;{selected|token_id} --status ?{Effect Name}',
            title: 'Remove an Effect from a Token'
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
     * Build the target/end menu for an individual status. 
     */
    function _build_status_menu(statusId) {
        let content = new HtmlBuilder('div');
        content.append('.centeredBtn').append('a', "Add Target", {
            href: '!statustracker add_target --id ' + statusId + ' --target &#64;{selected|token_id}',
            title: 'Add Target For Effect'
        });
        content.append('.centeredBtn').append('a', "Remove Target", {
            href: '!statustracker remove_target --id ' + statusId + ' --target &#64;{selected|token_id}',
            title: 'Remove Target For Effect'
        });
        content.append('.centeredBtn').append('a', "End", {
            href: '!statustracker remove_status  --id ' + statusId,
            title: 'End Effect'
        });
        
        let label = obj.status_name + " (" + obj.duration + ")";
        let tokenObj = getObj('graphic', obj.token_id);
        if (tokenObj != undefined) {
            label = label + " [" + tokenObj.get("name") + "]";
        }
        if (obj.targets.length > 0) {
            label = label + " [";
            for (let i = 0; i < obj.targets.length; i++) {
                label = label + " " + obj.targets[i] + ",";
            }
            // Trim off the last comma
            label = label.substring(0, label.length -1 ) + "]";
        }
        let menu = _build_menu_panel(label, content);
        return menu;
    } // function _build_status_menu
    
    
    /**
     * Show the target/end menus for statuses associated with a given token.
     */
    function show_status_menu(token_id) {
        let content = new HtmlBuilder('div');
        let statuses = StatusTracker.getTokenStatuses(token_id);
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
     */
    function _argparse(msg) {
        var obj = {};
        argv = msg.split(/\s+--/);
        command = argv.shift().split(' ');
        if (command.length == 0) {
            return "";
        };

        obj['command'] = command.shift().toLowerCase();
            
        if (command.length >= 1) {
            obj['subcommand'] = command.join(' ').toLowerCase();
        }

        _.each(argv, function(args) {
            let argSet = args.split(' ');
            if (argSet.length == 0) {
                return;
            } else if (argSet.length == 1) {
                // Treat parameters without as value as boolean
                obj[argSet[0].toLowerCase()] = true;
            } else {
                let key = argSet[0].toLowerCase();
                let value = argSet.slice(1).join(' ');
                obj[key] = value
            }
        });
        return obj;
    } // function _argparse


    /**
     * Processes command string
     */
    function do_command(msg) {
        args = _argparse(msg.content);
        if (args.command != StatusTrackerConsts.CMD_PREFIX) {
            return;
        }
        switch (args.subcommand) {
            case StatusTrackerConsts.CMD_ADD_STATUS:
                StatusTracker.addStatus(args.token, args.status, args.duration, args.marker, args.show);
                StatusTrackerMenus.showStatusMenu(args.token);
                break;
            case StatusTrackerConsts.CMD_ADD_TARGET:
                StatusTracker.addTarget(args.id, args.target);
                break;
            case StatusTrackerConsts.CMD_CLEAR:
                StatusTracker.clear(args.token);
                break;
            case StatusTrackerConsts.CMD_REMOVE_STATUS:
                StatusTracker.removeStatus(args.id);
                break;
            case StatusTrackerConsts.CMD_REMOVE_TARGET:
                StatusTracker.removeTarget(args.id, args.target);
                break;
            case StatusTrackerConsts.CMD_SHOWMENU:
                StatusTrackerMenus.showMenu();
                break;
            case StatusTrackerConsts.CMD_SHOW_STATUS:
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