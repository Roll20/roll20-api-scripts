/**
 * Version 1.0
 * Made by Jason Martin
 */
 
/**
 *
 * 
 */
var markerMgrStore;
 
var MarkerMgrConsts =  MarkerMgrConsts || {};
MarkerMgrConsts.SCRIPT_NAME = 'MarkerManager';
MarkerMgrConsts.CMD_PREFIX = '!markermgr';
MarkerMgrConsts.SUBCMD_ADD_MARKER = 'add_marker';
MarkerMgrConsts.SUBCMD_RM_MARKER = 'remove_marker';
MarkerMgrConsts.SUB_CMD_CLEAR = 'clear';
MarkerMgrConsts.SUB_CMD_SHOWMENU = 'showmenu';
MarkerMgrConsts.CMD_SHOWMENU = [MarkerMgrConsts.CMD_PREFIX, MarkerMgrConsts.SUB_CMD_SHOWMENU].join(" ");
MarkerMgrConsts.MACRO_NAME = 'MarkerManagerMenu';



var MarkerMgr = MarkerMgr || (function() {
    
    function _get_marker_tag_by_name(markerName) {
        var markerTag = "";
        for (let i  =0; i < markerMgrStore.length; i++) {
            if (markerMgrStore[i].name == markerName) {
                markerTag = markerMgrStore[i].tag;
                break
            }
        }
        // If we couldn't find the tag, use the name. The tag values of built-in
        // markers are the same as their names.
        if ("" == markerTag) {
            markerTag = markerTag = markerName;
        }
        return markerTag;
    }
    
    
    function add_marker(targetId, markerName) {
        // Get the graphic object for the given id.
        var token = getObj('graphic', targetId);
        if (undefined == token) {
            return;
        }
        
        var markerTag = _get_marker_tag_by_name(markerName);
        
        // Add the marker tag to the list of markers for this token.
        var token_markers = token.get('statusmarkers').split(",");
        token_markers.push(markerTag);
        token.set('statusmarkers', token_markers.join(","));
        return;
    } // function add_marker
    
    
    function remove_marker(targetId, markerName) {
        var token = getObj('graphic', targetId);
        if (undefined == token) {
            return;
        }
        
        var markerTag = _get_marker_tag_by_name(markerName);
        
        // Find the first instance of that marker, and slice it out of the
        // marker list.
        var token_markers = token.get('statusmarkers').split(",");
        for (let i = 0; i < token_markers.length; i++) {
            if (token_markers[i] == markerTag) {
                token_markers.splice(i, 1);
                log (token_markers)
                token.set('statusmarkers', token_markers.join(","));
                return;
            }
        }
        return;
        
    } // remove_marker
    
    
    function clear(targetId) {
        // Get the graphic object for the given id.
        var token = getObj('graphic', targetId);
        if (undefined == token) {
            return;
        }
        token.set('statusmarkers', "");
        return;
    } // clear
    
    return {
        addMarker: add_marker,
        removeMarker: remove_marker,
        clear: clear,
    }
}()); // MarkerMgr 


/**
 * Menus and interfaces
 */
var MarkerMgrMenus = MarkerMgrMenus || (function() {
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
        _.each(markerMgrStore, marker => {
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
                name: MarkerMgrConsts.MACRO_NAME
            })[0];
            
            if (macro) {
                macro.set('action', MarkerMgrConsts.CMD_SHOWMENU);
            }
            else {
                createObj('macro', {
                   _playerid: playerId,
                   name: MarkerMgrConsts.MACRO_NAME,
                   action: MarkerMgrConsts.CMD_SHOWMENU
                });
            }
        });
    } // function create_menu_macro
    
    /**
     * @summary Displays the base menu in the chat window.
     */
    function show_menu() {
        let content = new HtmlBuilder('div');
        content.append('.centeredBtn').append('a', "Add Marker to Token", {
            href: '!markermgr add_marker --token &#64;{selected|token_id} --marker ' + markerSelect,
            title: 'Add New Token Marker'
        });
        content.append('.centeredBtn').append('a', "Remove a Marker from Token", {
            href: '!markermgr remove_marker --token &#64;{selected|token_id} --marker ' + markerSelect,
            title: 'Remove a Marker'
        });
        content.append('.centeredBtn').append('a', "Clear Tokens", {
            href: '!markermgr clear --token &#64;{selected|token_id}',
            title: 'Clear All Token'
        });

        let menu = _build_menu_panel('Marker Manager Menu', content);
        sendChat(MarkerMgrConsts.SCRIPT_NAME, '/w gm ' + menu.toString(MENU_CSS));
    } // function show_menu
    
    return {
        createMenuMacro: create_menu_macro,
        showMenu: show_menu,
        createMarkerSelect: create_marker_select,
    }
}()); // MarkerMgrMenus

/**
 * Command line handler
 */
var MarkerMgrCommandLine = MarkerMgrCommandLine || (function() {
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

    function do_command(msg) {
        args = _argparse(msg.content);
        if (args == undefined || args.command != MarkerMgrConsts.CMD_PREFIX) {
            return;
        }
        switch (args.subcommand) {
            case MarkerMgrConsts.SUB_CMD_SHOWMENU:
                MarkerMgrMenus.showMenu();
                break;
            case MarkerMgrConsts.SUBCMD_ADD_MARKER:
                MarkerMgr.addMarker(args.token, args.marker)
                break;
            case MarkerMgrConsts.SUBCMD_RM_MARKER:
                MarkerMgr.removeMarker(args.token, args.marker);
                break;
            case MarkerMgrConsts.SUB_CMD_CLEAR:
                MarkerMgr.clear(args.token);
            default:
                // print help?
                break;
        }
    } // function do_command
    return {
        doCommand: do_command,
    }
}()); // MarkerMgrCommandLine


// Handler for chat message
on('chat:message', function(msg) {
    if (msg.type != 'api') {
        return;
    }
    MarkerMgrCommandLine.doCommand(msg); 
});

// Handler for 'ready'. Fo any initial do-once setup
on('ready', () => {
    'use struict';
    markerMgrStore = JSON.parse(Campaign().get("token_markers"));
    markerMgrStore.sort(function(a,b) {
        var aStr = a.name.toLowerCase();
        var bStr = b.name.toLowerCase();
        if (aStr > bStr) return 1;
        if (aStr < bStr) return -1;
        return 0; 
    });
    MarkerMgrMenus.createMarkerSelect();
    MarkerMgrMenus.createMenuMacro();
    log("Loaded " + MarkerMgrConsts.SCRIPT_NAME);
});