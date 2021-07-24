/**
 * Version: 0.1
 * Made By Jason Martin
 */

/**
 * If it hasn't been initialized before, initialized persistent status object 
 * storage in the state object. Status objects have the following properties:
 *   token_id - Token the status is tied to. 
 *   status_name - A label for the status.
 *   duration - Integer duration of the status. -1 is permanent
 *   marker - Marker tag value to be placed on targets of the status
 *   targets - List of target tokens for the effect
 *
 * The expectation is that the tuple (token_id, status_name) will be (mostly) 
 * unique, and will be used to lookup a given status.
 */
state.status_tracker = state.status_tracker || new Array();


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


// List of token objects loaded into this campaign. This gets populated on ready
var tokenMarkers;


/**
 * Management of the status objects and markers.
 */
var StatusTracker = StatusTracker || (function() {
    var _last_examined_token = "";
    
    /**
     * Add a countdown object to the turn order for a status effect. Insert
     * the countdown immediately before the turn order entity it's associated
     * with.  
     */
    function _insert_status_into_turn_order(token_id, status_name, duration) {
        turnorder = JSON.parse(Campaign().get('turnorder'));
        for (let i = 0; i < turnorder.length; i++)
        {
            // Look for the turnorder object associated with the token_id
            if (turnorder[i].id == token_id) {
                statusObj = {
                    id: "-1", // Not tied to any other objects
                    pr: duration, // Duration as the turnorder value
                    custom: status_name, // The name of the effect
                    formula: -1, // -1 decrement of the pr value
                    token_id: token_id, // This is so we can find it for removal
                }
                turnorder.splice(i,0,statusObj);
                break;
            }
        }
        Campaign().set('turnorder', JSON.stringify(turnorder));
        return;
    } // function _insert_status_into_turn_order
    
    
    /**
     * Remove a countdown object from the turn order for a status effect.
     */
    function _remove_status_from_turn_order(token_id, status_name) {
        turnorder = JSON.parse(Campaign().get('turnorder'));
        for (let i = 0; i < turnorder.length; i++)
        {
            if (turnorder[i].token_id == token_id && turnorder[i].custom == status_name) {
                turnorder.splice(i,1);
                break;
            }
        }
        
        Campaign().set('turnorder', JSON.stringify(turnorder));
        return;
    } // function _remove_status_from_turn_order
    
    
    /**
     * Retrieve a status effect definition from the global status effect store
     */
    function _get_status(token_id, status_name) {
        for (let i = 0; i < state.status_tracker.length; i++) {
            obj = state.status_tracker[i];
            if (obj.token_id == token_id && obj.status_name == status_name) {
                return obj;
            }
        }
        return "";
    } // function _get_status
    
    
    /**
     * Get the token associated with the top entry in the turn tracker. If the
     * token was the last one we looked at, assume that the turn track has not
     * moved, and return a blank.
     */
    function _get_current_token() {
        // Parse out the Campaign turn order
        var turn_order = JSON.parse(Campaign().get('turnorder'))
        // If nothing in the turn order, bail
        if (turn_order.length == 0) {
            return "";
        }
        // Get the next element of turn_order
        var turn = turn_order.shift();
        // Get the token associated with the turn element
        token = getObj('graphic', turn.id) || ""
        // If no token found, bail
        if (token == "") {
            return "";
        }
        // If this token is the last thing we examined, bail
        if (token == _last_examined_token) {
            return "";
        }
        // Set the 
        _last_examined_token = token;
        return token;
    } // function _get_current_token
    
    
    /**
     * Process status effects associated with a given token id.
     */
    function _process_turn(token_id) {

        // List of effects to be removed. We don't want to remove them while
        // we're walking through the status list array, because, like, indexes.
        var status_delete = new Array();
        
        // Walk through the status list, looking for effects associated with 
        // this token. If the duration is greater than zero, decriment it. If 
        // it's zero, record it for removal. If it's less than zero, it's 
        // permanent.
        for (let i = 0; i < state.status_tracker.length; i++) {
            if (state.status_tracker[i].token_id != token_id) {
                continue;
            }
            let duration = Number(state.status_tracker[i].duration || 1);
            // Decriment duration counter
            if (duration > 0 )
            {
                duration = duration - 1;
                state.status_tracker[i].duration = duration;
            }
            
            if (duration == -1) { // Permanent
                
            } 
            else if (duration > 0) { // Still running

            }
            else { // Ended
                status_delete.push(state.status_tracker[i].status_name)
            }
        }
        
        // Remove all effects recorded for removal.
        for (let i = 0; i < status_delete.length; i++)
        {
            remove_status(token_id, status_delete[i]);
        }
        
        return;

    } // function _process_turn
    
    
    /**
     * Add a marker to a token.
     */
    function _add_marker(token_id, marker_tag) {
        var tokens = findObjs({
            _type: "graphic",
            _id: token_id,
            _pageid: Campaign().get("playerpageid"),
        });
        _.each(tokens, function(obj) {
            var token_markers = obj.get("statusmarkers").split(",");
            token_markers.push(marker_tag);
            obj.set("statusmarkers", token_markers.join(","));
        });
        return;
    } // function _add_marker
    
    
    /**
     * Remove a marker from a token
     */
    function _remove_marker(token_id, marker_tag) {
        var tokens = findObjs({
            _type: "graphic",
            _id: token_id,
            _pageid: Campaign().get("playerpageid"),
        });
        _.each(tokens, function(obj) {
            var token_markers = obj.get("statusmarkers").split(",");
            for (let i = 0; i < token_markers.length; i++) {
                if (token_markers[i] == marker_tag) {
                    token_markers.splice(i, 1);
                    obj.set("statusmarkers", token_markers.join(","));
                    return;
                }
            }
        });
        return;
    }
    
    
    /** 
     * Add a status to a token. Adding markers to targets of that status is a
     * separate operation.
     */
    function add_status(token_id, status_name, duration, marker_name, show) {
        var durationNum = Number(duration);
        
        // Look up the marker tag, which may or may not be the same thing as 
        // the marker name. The tag will get used to add/remove the marker from
        // a token.
        var marker_tag = "";
        for (let i = 0; i < tokenMarkers.length; i++) {
            if (tokenMarkers[i].name == marker_name) {
                marker_tag = tokenMarkers[i].tag;
                break;
            }
        }
        
        // If we couldn't find the tag, use the name. The tag values of built-in
        // markers are the same as their names. 
        if (marker_tag == "") {
            marker_tag = marker_name;
        }
        
        // Add the status object to the global store.
        state.status_tracker.push({
            'token_id': token_id,
            'status_name': status_name,
            'duration': durationNum,
            'marker': marker_tag,
            'targets': new Array(),
        });
        
        // If there's a duration greater than zero, add a countdown entity to
        // the turn tracker.
        if (show == 'yes' && duration > 0) { 
            _insert_status_into_turn_order(token_id, status_name, duration);
        }
        return;
        
    } // function add_status
    
    
    /**
     * Remove a status from a token. Remove status markers from targets of that
     * status.
     */
    function remove_status(token_id, status_name) {
        // Get the status object from the global store
        statusObj = _get_status(token_id, status_name);
        if (statusObj == "") {
            return;
        }
        
        // Remove the markers from each target of the status
        for (let j = 0; j < statusObj.targets.length; j++) {
            _remove_marker(statusObj.targets[j], statusObj.marker);
        }
        
        // Remove the status object from the global store.
        state.status_tracker.splice(state.status_tracker.indexOf(statusObj), 1);
        
        // If there's a turn tracker entry for this object, remove it.
        _remove_status_from_turn_order(token_id, status_name);
        return;
        
    } // function remove_status
    
    
    /**
     * Get a list of status objects associated with a given token. A token id
     * value of 'all' will return all status ojects.
     */
    function get_token_statuses(token_id) {
        var status_list = new Array();
        let isAll = (token_id.toLowerCase() == "all");
        for (let i = 0; i < state.status_tracker.length; i++) {
            obj =  state.status_tracker[i];
            if (isAll == true || obj.token_id == token_id) {
                status_list.push(obj);
            }
        }
        return status_list;
    } // function get_token_statuses
    
    
    /**
     * Add a target for a given status. While a status might be associated with 
     * a source token, 'targets' have markers added to them.
     */
    function add_status_target(token_id, status_name, target_id) {
        // Get the status object
        statusObj = _get_status(token_id, status_name);
        if (statusObj == "") {
            // not found
            return;
        }
        
        if (statusObj.targets.indexOf(target_id) != -1) {
            // Already a target
            return;
        }
        _add_marker(target_id, statusObj.marker);
        statusObj.targets.push(target_id);
        return;
    } // function add_status_target
    
    
    /**
     * Remove a target from a status.
     */
    function remove_status_target(token_id, status_name, target_id) {
        // Get the status object
        statusObj = _get_status(token_id, status_name);
        if (statusObj == "") {
            // Not found
            return;
        }
        index = statusObj.targets.indexOf(target_id);
        if (index == -1) {
            // Not a target
            return;
        }
        _remove_marker(target_id, statusObj.marker);
        statusObj.targets.splice(index, 1);
        return;
    } // function remove_status_target
    
    
    /**
     * Process the next turn. Get the token id at the top of the turn tracker,
     * and process any statuses associated with that token.
     */
    function next_turn() {
        // Get the token associated with the new turn
        var token = _get_current_token();
        if (token == "") {
            return;
        }
        // Process any status effects assocated with this token
        _process_turn(token.id);
        return;
    } // function next_turn
    
    
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
            for (let i = state.status_tracker.length; i > 0; i--) {
                let obj = state.status_tracker[i-1];
                if (isAll == true || obj.token_id == token_id) {
                    remove_status(obj.token_id, obj.status_name);
                }
            }
        }
        catch (err) {
            log("clear :: " + err);
            // This is an abort, in case the status_tracker content got borked
            if (isAll) {
                state.status_tracker = new Array();
            }
        }
    } // function clear
    
    
    /**
     * If tokens were removed from the the turn order, remove any statuses 
     * linked to those tokens.
     */
    function validate_statuses(currentTurn, previousTurn) {
        removedTokens = new Array();
        for (let i = 0; i < previousTurn.length; i++) {
            let found = false;
            let tokenId = previousTurn[i].id;
            for (let j = 0; j < currentTurn.length; j++) {
                if (currentTurn[j].id == tokenId) {
                    found = true;
                    break
                }
            }
            if (found == false) {
                remove_token(tokenId);
            }
        }
    } // function validate_statuses


    /**
     * Removes all statuses associated with a given token id
     */    
    function remove_token(token_id) {
        tokenStatuses = get_token_statuses(token_id);
        for (let i = 0; i < tokenStatuses.length; i++) {
            remove_status(token_id, tokenStatuses[i].status_name);
        }
    } // function remove_token


    return {
        // List of functions and params to expose
        nextTurn: next_turn,
        addStatus: add_status,
        removeStatus: remove_status,
        getTokenStatuses: get_token_statuses,
        addTarget: add_status_target,
        removeTarget: remove_status_target,
        clear: clear,
        validateStatuses: validate_statuses,
        removeToken: remove_token,
    };
}()); // StatusTracker


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
     * Get a token object.
     */
    function _get_token_object(token_id) {
        var tokenList = findObjs({
            _type: "graphic",
            _id: token_id,
            _pageid: Campaign().get("playerpageid"),
        });
        
        if (tokenList.length == 0) {
            return "";
        }
        return tokenList[0]
    } // function _get_token_object
    
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
        content.append('.centeredBtn').append('a', "Add Status", {
            //href: '!statustracker add_status &#64;{selected|token_id} ?{Effect Name} ?{Duration in rounds (-1 for permanent)} ?{Marker}',
            href: '!statustracker add_status --token &#64;{selected|token_id} --status ?{Effect Name} --duration ?{Duration in rounds (-1 for permanent)} --show ?{Show in turn tracker?|yes|no} --marker ' + markerSelect,
            title: 'Add New Status'
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
    function _build_status_menu(obj) {
        let content = new HtmlBuilder('div');
        content.append('.centeredBtn').append('a', "Add Target", {
            href: '!statustracker add_target --token ' + obj.token_id + ' --status ' + obj.status_name + ' --target &#64;{selected|token_id}',
            title: 'Add Target For Effect'
        });
        content.append('.centeredBtn').append('a', "Remove Target", {
            href: '!statustracker remove_target --token ' + obj.token_id + ' --status ' + obj.status_name + ' --target &#64;{selected|token_id}',
            title: 'Remove Target For Effect'
        });
        content.append('.centeredBtn').append('a', "End", {
            href: '!statustracker remove_status --token ' + obj.token_id + ' --status ' + obj.status_name,
            title: 'End Effect'
        });
        
        let label = obj.status_name + " (" + obj.duration + ")";
        let tokenObj = _get_token_object(obj.token_id);
        if (tokenObj) {
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
    function do_command(msg)
    {
        try {
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
                    StatusTracker.addTarget(args.token, args.status, args.target);
                    break;
                case StatusTrackerConsts.CMD_CLEAR:
                    StatusTracker.clear(args.token);
                    break;
                case StatusTrackerConsts.CMD_REMOVE_STATUS:
                    StatusTracker.removeStatus(args.token, args.status);
                    break;
                case StatusTrackerConsts.CMD_REMOVE_TARGET:
                    StatusTracker.removeTarget(args.token, args.status, args.target);
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
        }
        catch (err)
        {
            log('Error in do_command: \n' + err);
        } 
        return;
    } // function do_command
    
    
    return {
        doCommand: do_command,
    }
}()); // StatusTrackerCommandline


// Handler for the turner order changing
on('change:campaign:turnorder', function(current, prev) {
    currentTurnorder = JSON.parse(current.get('turnorder'));
    previousTurnorder = JSON.parse(prev.turnorder);
    StatusTracker.validateStatuses(currentTurnorder, previousTurnorder);
    StatusTracker.nextTurn();
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
