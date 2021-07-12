/*
 * Version: 0.1
 * Made By Jason Martin
*/

/*
If it hasn't been initialized before, initialized persistent storage in the 
state object.
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

var tokenMarkers = "";

var StatusTracker = StatusTracker || (function() {
    var _last_examined_token = "";
    
    
    function _get_status(token_id, status_name) {
        for (let i = 0; i < state.status_tracker.length; i++) {
            obj = state.status_tracker[i];
            if (obj.token_id == token_id && obj.status_name == status_name) {
                return obj;
            }
        }
        return "";
    }
    
    function _get_token_controller(token_id) {
        var tokenObj = findObjs({
            _type: "graphic",
            _id: token_id,
            _pageid: Campaign().get("playerpageid"),
        })[0];
        
        return tokenObj.get("controlledby")
    }
    
    function _get_current_token() {
        // Parse out the Campaign turn order
        var turn_order = JSON.parse(Campaign().get('turnorder'))
        // If nothing in the turn order, bail
        if (!turn_order.length) {
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
    }
    
    function _process_turn(token_id) {

        /*
        List of effects to be removed. We don't want to remove them while
        we're walking through the status list array, because, like, indexes.
        */
        var status_delete = new Array();
        
        /*
        Walk through the status list, looking for effects that belong to this
        token. If the duration is greater than zero, decriment it. If it's 
        zero, record it for removal. If it's less than zero, it's permanent.
        */ 
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
                log(state.status_tracker[i].status_name + " still running! (" + duration +")");
            }
            else { // Ended
                log("REMOVING " + state.status_tracker[i].status_name)
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
    }
    
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
    }
    
    function add_status(token_id, status_name, duration, marker_name) {
        var durationNum = Number(duration);
        log(tokenMarkers);
        
        var marker_tag = "";
        for (let i = 0; i < tokenMarkers.length; i++) {
            if (tokenMarkers[i].get("name") == marker_name) {
                marker_tag = tokenMarkers[i].get("tag");
                log("Found marker tag " + marker_tag);
                break;
            }
        }
        if (marker_tag == "") {
            marker_tag = marker_name;
        }
        
        state.status_tracker.push({
            'token_id': token_id,
            'status_name': status_name,
            'duration': durationNum,
            'marker': marker_tag,
            'targets': new Array(),
        });
        
    } // function add_status
    
    function remove_status(token_id, status_name) {
        log("Removing " + status_name + " from " + token_id);
        obj = _get_status(token_id, status_name);
        if (obj == "") {
            return;
        }
        for (let j = 0; j < obj.targets.length; j++) {
            _remove_marker(obj.targets[j], obj.marker);
        }
        state.status_tracker.splice(state.status_tracker.indexOf(obj), 1);
        return;
        
    } // function remove_status
    
    
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
    } // function get_status
    
    function add_status_target(token_id, status_name, target_id) {
        log("add_status_target???");
        obj = _get_status(token_id, status_name);
        log(obj);
        if (obj == "") {
            // not found
            log("add_status_target -- not found");
            return;
        }
        for (let i = 0; i < obj.targets.length; i++) {
            if (obj.targets[i] == target_id) {
                // Already a target
                return;
            }
        }
        _add_marker(target_id, obj.marker);
        obj.targets.push(target_id);
    } // function add_status_target
    
    function remove_status_target(token_id, status_name, target_id) {
        obj = _get_status(token_id, status_name);
        if (obj == "") {
            // Not found
            return;
        }
        index = obj.targets.indexOf(target_id);
        if (index == -1) {
            // Not a target
            return;
        }
        _remove_marker(target_id, obj.marker);
        obj.targets.splice(index, 1);
    } // function remove_status_target
    
    
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
    
    function clear(token_id) {
        // See if the input param is 'all'. If it is, we're clearing out everything.
        let isAll = (token_id.toLowerCase() == "all");
        let deleteArray = new Array();
        
        /**
         * Walk through the status tracker elements. If we're deleteing all, or
         * a specific token id, remove all markers associated with a
         */
        _.each(state.status_tracker, function(obj) {
            if (isAll == true || obj.token_id == token_id) {
                for (let i = 0; i < obj.targets.length; i++)
                {
                    _remove_marker(obj.targets[i], obj.marker);
                }
                deleteArray.push(state.status_tracker.indexOf(obj))
            }
        });
        
        /**
         * Sort the delete array in descending order so we can remove them 
         * without indexing nonsense. Then remove all indexes in the delete 
         * array from the status_tracker list.
         */ 
        deleteArray.sort(function(a,b) {return b - a});
        for (let i = 0; i < deleteArray.length; i++) {
            state.status_tracker.splice(deleteArray[i], 1);
        }
    }

    return {
        // List of functions and params to expose
        nextTurn: next_turn,
        addStatus: add_status,
        removeStatus: remove_status,
        getTokenStatuses: get_token_statuses,
        addTarget: add_status_target,
        removeTarget: remove_status_target,
        clear: clear,
    };
}());


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
    
    var STATUS_CSS = {
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
    
    function _build_menu_panel(header, content) {
        let menu = new HtmlBuilder('.menu');
        menu.append('.menuHeader', header);
        menu.append('.menuBody', content);
        return menu;
    }
    
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
    }
    
    
    function show_menu() {
        let content = new HtmlBuilder('div');
        content.append('.centeredBtn').append('a', "Add Status", {
            href: '!statustracker add_status &#64;{selected|token_id} ?{Effect Name} ?{Duration in rounds (-1 for permanent)} ?{Marker}',
            title: 'Add New Status'
        });
        content.append('.centeredBtn').append('a', "Show Token Statuses", {
            href: '!statustracker show_status &#64;{selected|token_id}',
            title: 'Show Token Statuses'
        });
        content.append('.centeredBtn').append('a', "Show All Statuses", {
            href: '!statustracker status all',
            title: 'Show All Statuses'
        });
        content.append('.centeredBtn').append('a', "Remove Effect From Token", {
            href: '!statustracker remove_status &#64;{selected|token_id} ?{Effect Name}',
            title: 'Remove an Effect from a Token'
        });
        content.append('.centeredBtn').append('a', "Clear Token Statuses", {
            href: '!statustracker clear &#64;{selected|token_id}',
            title: 'Clear All Token Statuses'
        });
        content.append('.centeredBtn').append('a', "Clear All Statuses", {
            href: '!statustracker clear all',
            title: 'Global Clear Statuses'
        });
        
        let menu = _build_menu_panel('StatusTracker Menu', content);
        sendChat(StatusTrackerConsts.SCRIPT_NAME, '/w gm ' + menu.toString(MENU_CSS));
    }
    
    function _build_status_menu(obj) {
        let content = new HtmlBuilder('div');
        content.append('.centeredBtn').append('a', "Add Target", {
            href: '!statustracker add_target ' + obj.token_id + ' ' + obj.status_name + ' &#64;{selected|token_id}',
            title: 'Add Target For Effect'
        });
        content.append('.centeredBtn').append('a', "Remove Target", {
            href: '!statustracker remove_target ' + obj.token_id + ' ' + obj.status_name + ' &#64;{selected|token_id}',
            title: 'Remove Target For Effect'
        });
        content.append('.centeredBtn').append('a', "End", {
            href: '!statustracker remove_status ' + obj.token_id + ' ' + obj.status_name,
            title: 'End Effect'
        });
        
        let label = obj.status_name + " (" + obj.duration + ")";
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
    }
    
    function show_status_menu(token_id) {
        let content = new HtmlBuilder('div');
        let statuses = StatusTracker.getTokenStatuses(token_id);
        _.each(statuses, function(obj) {
            let submenu = _build_status_menu(obj);
            content.append(submenu);
        });
        sendChat(StatusTrackerConsts.SCRIPT_NAME, '/w gm ' + content.toString(MENU_CSS));
    }
    
    return {
        createMenuMacro: create_menu_macro,
        showMenu: show_menu,
        showStatusMenu: show_status_menu,
    };
    
}());

var StatusTrackerCommandline = StatusTrackerCommandline || (function() {

    function do_command(msg)
    {
        try {
            argv = msg.content.split(' ');
            if (argv[0].toLowerCase() != StatusTrackerConsts.CMD_PREFIX) {
                return;
            }
            switch (argv[1].toLowerCase()) {
                case StatusTrackerConsts.CMD_ADD_STATUS:
                    StatusTracker.addStatus(argv[2], argv[3], argv[4], argv[5]);
                    break;
                case StatusTrackerConsts.CMD_ADD_TARGET:
                    StatusTracker.addTarget(argv[2], argv[3], argv[4]);
                    break;
                case StatusTrackerConsts.CMD_CLEAR:
                    StatusTracker.clear(argv[2]);
                    break;
                case StatusTrackerConsts.CMD_REMOVE_STATUS:
                    StatusTracker.removeStatus(argv[2], argv[3]);
                    break;
                case StatusTrackerConsts.CMD_REMOVE_TARGET:
                    StatusTracker.removeTarget(argv[2], argv[3], argv[4]);
                    break;
                case StatusTrackerConsts.CMD_STATUS:
                    let status_list = StatusTracker.getTokenStatuses(argv[2]);
                    _.each(status_list, function(obj) {
                        var tokenObj = findObjs({
                            _type: "graphic",
                            _id: obj.token_id,
                            _pageid: Campaign().get("playerpageid"),
                        })[0];
                        var data = "";
                        if (tokenObj.get("controlledby") == "") {
                            data = data + "/w gm ";
                        }
                        data = data + tokenObj.get("name") + " :: " + obj.status_name + " (" + obj.duration +")";
                        sendChat(StatusTrackerConsts.SCRIPT_NAME, data);

                    });
                    break;
                case StatusTrackerConsts.CMD_SHOWMENU:
                    StatusTrackerMenus.showMenu();
                    break;
                case StatusTrackerConsts.CMD_SHOW_STATUS:
                    StatusTrackerMenus.showStatusMenu(argv[2])
                    break;
                default:
                    // print help
                    break;
            }
        }
        catch (err)
        {
            // print help
        } 
        return;
    }
    
    return {
        doCommand: do_command,
    }
}());


// Handler for the turner order changing
on("change:campaign:turnorder", function() {
    StatusTracker.nextTurn()
});

// Handler for chat messages
on("chat:message", function(msg) {
    if (msg.type != 'api') {
        return;
    }
    log(msg);
    StatusTrackerCommandline.doCommand(msg);
});

// On start, add the create menu macro to the GM
on('ready', () => { 
    'use strict';
    tokenMarkers = JSON.parse(Campaign().get("token_markers"));
    StatusTrackerMenus.createMenuMacro();
    log("Loaded " + StatusTrackerConsts.SCRIPT_NAME);

});
