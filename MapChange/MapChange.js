// Github:   https://github.com/TheWhiteWolves/MapChange.git
// By:       TheWhiteWolves
// Contact:  https://app.roll20.net/users/1043/thewhitewolves

var MapChange = MapChange || (function() {
    'use strict';
    // Defaults.
    // Date last modified in unix timestamp format.
    var lastModified = "1464885227";
    // Name of the person who last modified the script.
    var modifiedBy = "TheWhiteWolves";
    // Local version of the script.
    var version = "1.1";
    // Set to true to use built in debug statements
    var debug = false;
    // Set to false to turn off notifing the GM when a player moves.
    var gmNotify = true;
    // The marker used to decide what is placed in the private map.
    var marker = "[GM]";
    // When true this places the pages with name containing the marker into the public list.
    // Use this if you want maps to be private by default instead of public by default.
    var invertedMarker = false;
    // These are maps that players are able to move to using the commands.
    var publicMaps = {};
    // These are maps that only the GM can move people to.
    var privateMaps = {};
    // Check the installation of the script and setup the default configs.
    var checkInstall = function() {
        if (!state.MapChange || state.MapChange.version !== version) {
            state.MapChange = state.MapChange || {};
            state.MapChange = {
                // Version number
                version: version,
                // Date last modified in unix timestamp format.
                lastModified: lastModified,
                // Name of the person who last modified the script.
                modifiedBy: modifiedBy,
                // Timestamp when the global config was last updated.
                gcUpdated: 0,
                // List of available user configs.
                config: {
                    // Set to true to use built in debug statements
                    debug: debug,
                    // Set to false to turn off notifing the GM when a player moves.
                    gmNotify: gmNotify,
                    // The marker used to decide what is placed in the private map.
                    marker: marker,
                    // When true this places the pages with name containing the marker into the public list.
                    // Use this if you want maps to be private by default instead of public by default.
                    invertedMarker: invertedMarker
                },
                // These are maps that players are able to move to using the commands.
                publicMaps: publicMaps,
                // These are maps that only the GM can move people to.
                privateMaps: privateMaps
            };
        }
        // Load and changes to the defaults from the global config.
        loadGlobalConfig();
    };
    
    // Loads the config options from the global config.
    var loadGlobalConfig = function() {
        // Get a reference to the global config.
        var gc = globalconfig && globalconfig.mapchange;
        // Get a reference to the state.
        var st = state.MapChange;
        // Check if the settings need updating from the global config.
        if (gc && gc.lastsaved && gc.lastsaved > st.gcUpdated) {
            // Get the last saved time.
            st.gcUpdated = gc.lastsaved;
            // Get the debug setting from the global config.
            st.config.debug = JSON.parse(gc['Debug Mode']) === false;
            // Get the gmNotify setting from the global config.
            st.config.gmNotify = JSON.parse(gc['GM Notification']) === true;
            // Get the invertedMarker setting from the global config.
            st.config.marker = gc['Marker'] === "[GM]";
            // Get the marker setting from the global config.
            st.config.invertedMarker = JSON.parse(gc['Inverted Marker']) === false;
        }
        // Debug
        if (st.config.debug) {
            log(st.config);
            log(globalconfig.mapchange);
        }
    };
    
    // Constructs the private and public maps for use in the api script.
    var constructMaps = function() {
        // Get an object containing all the pages in the campaign.
        var pages = findObjs({_type: 'page'});
        // Loop through the pages adding them to their relevent maps.
        for (var key in pages) {
            if (pages.hasOwnProperty(key)) {
                // Get the name of the page that is current being processed.
                var name = pages[key].get("name");
                // Get the id of the page that is current being processed.
                var id = pages[key].get("_id");
                // Check if the name of the page contains the marker.
                if (name.indexOf(state.MapChange.config.marker) > -1) {
                    // If the name does then remove the marker from the name and trim off any whitespace.
                    name = name.replace(state.MapChange.config.marker, "").trim();
                    // If invertedMarker is being used then place the name and id of the page in the 
                    // public map else place it in the private map.
                    state.MapChange.config.invertedMarker ? state.MapChange.publicMaps[name] = id : state.MapChange.privateMaps[name] = id;
                }
                else {
                    // If the name does not contain the marker then place the name and id in the public map
                    // if invertedMarker is being used else place it in the private map.
                    state.MapChange.config.invertedMarker ? state.MapChange.privateMaps[name] = id : state.MapChange.publicMaps[name] = id;
                }
            }
        }
        // Debug
        if (state.MapChange.config.debug) {
            log("Public:");
            log(state.MapChange.publicMaps);
            log("Private:");
            log(state.MapChange.privateMaps);
        }
    };
    
    // Handle the input message call for the api from the chat event.
    var handleInput = function(msg) {
        // Check that the message sent is for the api, if not return as we don't need to do anything.
        if (msg.type !== "api") {
            return;
        }
        // Grab the contents of the msg sent and split it into the individual arguments.
        var args = msg.content.split(/\s+--/);
        // Parse the first section of the arguments to get an array containing the commands.
        var commands = parseCommands(args.shift());
        // Parse the remaining aruments to get any parameters passed in.
        var params = parseParameters(args);
        // Check the lower cased version of the message to see if it contains the call for
        // this script to run, if it doesn't then return.
        switch (commands.shift().toLowerCase()) {
            case "!mapchange":
            case "!mc":
                // Check to see if any further commands were passed in and process them, else
                // show the help test on how to use the script.
                if (commands.length > 0) {
                    // Process the remaining commands with the passed in paramters.
                    processCommands(msg, commands, params);
                }
                else {
                    // Show the sender the script help message.
                    showHelp(msg, "index");
                }
                break;
            default:
                // If we reached here it means that the call to the api was not meant for us.
                return;
        }
    };
    
    // Parses the commands of the call to the api script.
    var parseCommands = function(args) {
        if (args === undefined) {
            // If it is then return an empty array.
            return [];
        }
        // Split the arguments by spaces and return the array containing them all.
        return args.split(/\s+/);
    };
    
    // Parses the parameters of the call to the api script.
    var parseParameters = function(args) {
        // Check if args is undefined.
        if (args === undefined) {
            // If it is then return an empty object.
            return {};
        }
        // Declare a new object to hold the parameters.
        var params = {};
        // Loop through all the passed in arguments and construct them in into the parameters.
        for (var param in args) {
            if (args.hasOwnProperty(param)) {
                // Split the parameter down by spaces and temporarily store it.
                var tmp = args[param].split(/\s+/);
                // Take the first element in tmp and use it as the parameter name and reassemble the
                // remaining elements and replace the commas with spaces for the parameter value.
                params[tmp.shift()] = tmp.join().replace(/,/g, " ");
            }
        }
        // Return the constructed object of parameters.
        return params;
    };
    
    // Processes the commands provided in the call to the api script.
    var processCommands = function(msg, commands, params) {
        // Take the command and decide what function to run.
        switch (commands.shift().toLowerCase()) {
            case "help":
                // Specify the default show behaviour to be "all".
                var show = "index";
                // Check to see if the show parameter was provided in the api call.
                if (params.hasOwnProperty("show")) {
                    // If it was then check that it is not empty and if it isn't then change show to 
                    // the value of the parameter.
                    show = (params.show !== "") ? params.show.toLowerCase() : "index";
                }
                // Send the help text to the player who sent the message.
                showHelp(msg, show);
                break;
            case "menu":
                // Specify the default show behaviour to be "all".
                var show = "all";
                // Check to see if the show parameter was provided in the api call.
                if (params.hasOwnProperty("show")) {
                    // If it was then check that it is not empty and if it isn't then change show to 
                    // the value of the parameter.
                    show = (params.show !== "") ? params.show.toLowerCase() : "all";
                }
                // Show the menu to the sender of the api call with the applicable filters.
                showMenu(msg, show);
                break;
            case "refresh":
                // Refresh the public and private maps to pull in any changes made since the script
                // was last started.
                refresh(msg);
                break;
            case "move":
                // Check to see if the sender has provided and target map for the move, if they
                // haven't then send them a chat message to tell them it is missing.
                if (params.hasOwnProperty("target")) {
                    // Check to see if the sender has provided a player to be moved, if they 
                    // haven't then user the id of the sender.
                    if (params.hasOwnProperty("player")) {
                        // Move the provided player to the map with the provided name.
                        move(msg, getPlayerIdFromDisplayName(params.player), params.target);
                    }
                    else {
                        // Move the sender to the map with the provided name.
                        move(msg, msg.playerid, params.target);
                    }
                }
                else {
                    // Send a chat message to tell teh sender that they missed the target map parameter.
                    chat("/w", msg.who, "Target map parameter missing, use !mc help to see how to use this script.");
                }
                break;
            case "rejoin":
                // Check to see if a player name was provided, if so then run rejoin on that player only if
                // the sender is either a GM or the provided player is the sender.
                if (params.hasOwnProperty("player")) {
                    // Check the sender is either a GM or the provided player.
                    if (playerIsGM(msg.playerid) || params.player === msg.who) {
                        // Run the rejoin on the provided player.
                        rejoin(msg, getPlayerIdFromDisplayName(params.player));
                    }
                    else {
                        // Send a warning to the sender to tell tehm that they cannot perform the action.
                        chat("/w", msg.who, "You do not have the permission required to perform that action.");
                    }
                }
                else {
                    // Run rejoin on the sender of the api call.
                    rejoin(msg, msg.playerid);
                }
                break;
            case "moveall":
                // Move all the players back to the bookmark and then move the bookmark to the map with
                // the provided name.
                moveall(msg, params.target);
                break;
            default:
                // Show the scripts help text is no further command was provided.
                showHelp(msg, "index");
                break;
        }
    };

    // Convert the provided display name into the player id for that player.
    var getPlayerIdFromDisplayName = function(name) {
        // Find all the player objects in the campaign.
        var players = findObjs({_type: 'player'});
        // Loop through them and try to convert the display name into the player's id.
        for (var key in players) {
            if (players.hasOwnProperty(key)) {
                // Check if the current players display name is equal to the provided one.
                if (players[key].get("_displayname") === name) {
                    // If it is then return that players id.
                    return players[key].get("_id");
                }
            }
        }
        // If no match was found then return undefined.
        return undefined;
    };
    
    // Convert the provided player id into the display name for that player.
    var getDisplayNameFromPlayerId = function(id) {
        // Find all the player objects in the campaign.
        var players = findObjs({_type: 'player'})
        // Loop through them and try to convert the id into the player's display name.
        for (var key in players) {
            if (players.hasOwnProperty(key)) {
                // Check if the current players id is equal to the provided one.
                if (players[key].get("_id") == id) {
                    // If it is then return that players display name.
                    return players[key].get("_displayname");
                }
            }
        }
        // If no match was found then return undefined.
        return undefined;
    };

    // TODO
    var showHelp = function(msg, show) {
        // Create the variable to hold the assembled menu text.
        var text = "";
        // Assemble the text for the help menu.
        if (show === "index") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the help menu.
            text += "<tr><td style-'text-align: left;' colspan='3'><strong><em>Help Menu</em></strong></td></tr>";
            // Add a heading row to provide names for the columns.
            text += "<tr><td><strong>Command</strong></td><td colspan='2'><strong>Description</strong></td></tr>";
            // Add a row for the menu command.
            text += "<tr><td>menu</td><td>Menu for running commands.</td><td><a href='!mc help --show menu'>Info</a></td></tr>";
            // Add a row for the move command.
            text += "<tr><td>move</td><td>Moves a player to a map.</td><td><a href='!mc help --show move'>Info</a></td></tr>";
            // Check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the moveall command.
                text += "<tr><td>moveall</td><td>Moves all players to a map.</td><td><a href='!mc help --show moveall'>Info</a></td></tr>";
            }
            // Add a row for the rejoin command.
            text += "<tr><td>rejoin</td><td>Rejoins a player to the bookmark.</td><td><a href='!mc help --show rejoin'>Info</a></td></tr>";
            // Check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the refresh command.
                text += "<tr><td>refresh</td><td>Refreshes the map lists.</td><td><a href='!mc help --show refresh'>Info</a></td></tr>";
            }
            // Add a row for the help command.
            text += "<tr><td>help</td><td>Shows the help for the script</td><td><a href='!mc help --show help'>Info</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a blank line to seperate the command information from the general information.
            text += "<br line-height='1'>";
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add a header for the general information table.
            text += "<tr><td colspan='2'><strong>General Information:</strong></td></tr>";
            // Add a row for the information on constructing an API call.
            text += "<tr><td>Constructing an API call</td><td><a href='!mc help --show api'>Info</a></td></tr>";
            // Add a row for the information on using parameters.
            text += "<tr><td>Using Parameters</td><td><a href='!mc help --show params'>Info</a></td></tr>";
            // Add a row for the credits.
            text += "<tr><td>Credits</td><td><a href='!mc help --show credits'>Info</a></td></tr>";
            // Add a row for the version information.
            text += "<tr><td>Version</td><td><a href='!mc help --show version'>Info</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
        }
        // Assemble the text for the menu documentation.
        if (show === "menu") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Menu</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The menu command provides a menu for the user to launch commands that are available to them.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Add a row for the show parameter.
            text += "<tr><td>--show</td><td><em>[Optional]</em><br>Used to filter the returned view.</td><td>All<br>Public<br>" + ((playerIsGM(msg.playerid)) ? "Private<br>" : "") + "Utilities<br>Utils</td></tr>";
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc menu</td><td><a href='!mc menu'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("", "move");
        }
        // Assemble the text for the move documentation.
        if (show === "move") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Move</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The move command moves a player to the provided target map.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Add a row for the target parameter.
            text += "<tr><td>--target</td><td><em>[Required]</em><br>The target map to move to.</td><td>Name of the Map</td></tr>";
            // Check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the player parameter.
                text += "<tr><td>--player</td><td><em>[Optional]</em><br>The player to move.</td><td>Player Name</td></tr>";
            }
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc move --target " + _.keys(state.MapChange.publicMaps)[0] + "</td><td><a href='!mc move --target " + _.keys(state.MapChange.publicMaps)[0] + "'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("menu", "moveall");
        }
        // Assemble the text for the moveall documentation.
        if (show === "moveall") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Moveall</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The moveall command moves all players to the provided target map.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Add a row for the target parameter.
            text += "<tr><td>--target</td><td><em>[Required]</em><br>The target map to move to.</td><td>Name of the Map</td></tr>";
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc moveall --target " + _.keys(state.MapChange.publicMaps)[0] + "</td><td><a href='!mc moveall --target " + _.keys(state.MapChange.publicMaps)[0] + "'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("move", "rejoin");
        }
        // Assemble the text for the rejoin documentation.
        if (show === "rejoin") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Rejoin</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The rejoin command moves a player back to the bookmark.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the player parameter.
                text += "<tr><td>--player</td><td><em>[Optional]</em><br>The player to move.</td><td>Player Name</td></tr>";
            }
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc rejoin</td><td><a href='!mc rejoin'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("moveall", "refresh");
        }
        // Assemble the text for the refresh documentation.
        if (show === "refresh") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Refresh</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The refresh command clears and reloads the map lists without needing to restart the script.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc refresh</td><td><a href='!mc refresh'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("rejoin", "help");
        }
        // Assemble the text for the help documentation.
        if (show === "help") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Help</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The help command provides an interactive menu for the documentation of the script.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Add a row for the show parameter.
            text += "<tr><td>--show</td><td><em>[Optional]</em><br>Used to filter the returned view.</td><td>Menu<br>Move<br>" + ((playerIsGM(msg.playerid)) ? "Moveall<br>" : "") + "Rejoin<br>" + ((playerIsGM(msg.playerid)) ? "Refresh<br>" : "") + "Help<br>Api<br>Params<br>Credits<br>Version</td></tr>";
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc help</td><td><a href='!mc help'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("refresh", "");
        }
        // Assemble the text for the constructing an API documentation.
        if (show === "api") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the constructing an api call information.
            text += "<tr><td colspan='3'><strong><em>Constructing an API call</em></strong></td></tr>";
            // Add the decription on how to construct an api call.
            text += "<tr><td colspan='3'>An API call in MapChange consists of two required components and one optional component.<br><br>\
                                         The first required component is the call to the script, this is started by using a exclamation \
                                         mark followed by the script name or alias (e.g. !mc or !mapchange)<br><br>\
                                         The second required component is the command for the script, this must be seperated from the \
                                         script call marker by using a space. (e.g. !mc help)<br><br>\
                                         Finally the optional component is the parameters for the command you are using, this is started by \
                                         using two dashes (e.g. --show), note that sometimes a command may allow or require more than one \
                                         parameter.<br><br>As with the command this must be seperated from the command using a space and each \
                                         parameter must be seperated using a space. (e.g. !mc help --show index)</td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("", "params");
        }
        // Assemble the text for the using parameters documentation.
        if (show === "params") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the using parameters information.
            text += "<tr><td colspan='3'><strong><em>Using Parameters</em></strong></td></tr>";
            // Add in a row for the information on parameters.
            text += "<tr><td colspan='3'>Parameters in MapChange are composed of three pieces, the first is the Parameter Marker, the second \
                                         is the Parameter Name and the third is the Parameter Value.<br><br>\
                                         The Parameter Marker consists of two dashes (e.g. --), this allows the script to know that the \
                                         following text is a parameter.<br><br>\
                                         The Parameter Name is the name that the script will use when applying it to the command (e.g. show), see \
                                         the help on each command to find out what parameters they accept.<br><br>\
                                         The Parameter Value is the piece of information or option you pass to the script to use with the \
                                         Parameter.<br><br>\
                                         Some commands only accept a set amount of options whereas others will accept what the user sends and \
                                         attempt to use it, see the help on each command to find out what can be used with each parameter.</td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("api", "credits");
        }
        // Assemble the text for the credits.
        if (show === "credits") {
            // Declare the styling for the profile link, this makes it look like an api button.
            var buttonStyle = "background-color: #CE0F69; color: white; padding: 6px 6px; text-decoration: none; display: inline-block; font-family: Arial;";
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the credits.
            text += "<tr><td colspan='2'><strong><em>Credits</em></strong></td></tr>";
            // Add in the header row for the authors.
            text += "<tr><td colspan='2'><strong>Authors</strong></td></tr>";
            // Add in in TheWhiteWolves as an author.
            text += "<tr><td>TheWhiteWolves</td><td><a style='" + buttonStyle + "' href='https://app.roll20.net/users/1043/thewhitewolves'>Profile</a></td></tr>";
            // Add in the header row for the testers.
            text += "<tr><td colspan='2'><strong>Testers</strong></td></tr>";
            // Add in in WhiteStar as a tester.
            text += "<tr><td>WhiteStar</td><td><a style='" + buttonStyle + "' href='https://app.roll20.net/users/484663/whitestar'>Profile</a></td></tr>";
            // Add in in Kaelev as a tester.
            text += "<tr><td>Kaelev</td><td><a style='" + buttonStyle + "' href='https://app.roll20.net/users/618858/kaelev'>Profile</a></td></tr>";
            // Add in in Enzo S.as a tester.
            text += "<tr><td>Enzo S.</td><td><a style='" + buttonStyle + "' href='https://app.roll20.net/users/1191835/enzo-s'>Profile</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("params", "version");
        }
        // Assemble the text for the version information.
        if (show === "version") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add a row for the version number.
            text += "<tr><td><strong>Version</strong></td><td>" + state.MapChange.version + "</td></tr>";
            // Add a row for the last modified date and time.
            text += "<tr><td><strong>Last Modified</strong></td><td>" + new Date(state.MapChange.lastModified * 1000).toUTCString() + "</td></tr>";
            // Add a row for who last modified the script.
            text += "<tr><td><strong>By</strong></td><td>" + state.MapChange.modifiedBy + "</td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("credits", "");
        }
        // Send the assembled menu text to the chat to be displayed.
        chat("/w", msg.who, text);
        // Debug
        if (state.MapChange.config.debug) {
            log(msg);
            log(text);
            log(show);
        }
    };
    
    // Displays a chat based menu for the teleportation, this provides users with  a set of
    // easy to use api buttons in the chat that will launch the commands for them.
    var showMenu = function(msg, show) {
        // Specify what the max display length of the map names will be on the api buttons.
        var displayLength = 20;
        // Find all the player objects in the campaign.
        var players = findObjs({_type: 'player'});
        // Create the variable to hold the assembled menu text.
        var text = "";
        // Check if the show parameter is set to show any of the maps.
        if (show === "all" || show === "public" || show === "private") {
            // Start off the chat message with the Available Maps title.
            text += "<tr><td colspan='3'><strong><em>Available Maps:</em></strong></td></tr>";
        }
        // Check if the "show" parameter is set to either "all" or "public".
        if (show === "all" || show === "public") {
            // If it is then check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the Public title.
                text += "<tr><td colspan='3'><strong><em>Public</em></strong></td></tr>";
            }
            // Loop through the map displaying an api button for each one.
            for (var key in state.MapChange.publicMaps) {
                if (state.MapChange.publicMaps.hasOwnProperty(key)) {
                    // Add a tag to open start a row on the table.
                    text += "<tr>";
                    // Generate an api button with the map name that will teleport the user to that map.
                    // If the map name is longer than 20 characters then trim it and add an elipse.
                    text += "<td><a href='!mc move --target " + key + "'>" + ((key.length > displayLength) ? key.substr(0, displayLength) + "..." : key) + "</a></td>";
                    // Check if the calling player is a GM or not.
                    if (playerIsGM(msg.playerid)) {
                        // If they are then add extra GM only buttons.
                        // Add a button to teleport all players to the chosen map.
                        text += "<td><a href='!mc moveall --target " + key + "'>All</a></td>";
                        // Add a button to teleport a differnet player to the chosen map.
                        text += "<td><a href='!mc move --target " + key + " --player ?{Player";
                        // Loop through the players in the campaign adding them to the dropdown for the Other command.
                        for (var key in players) {
                            if (players.hasOwnProperty(key)) {
                                // Add the current players name with any brackets replaced for their ASCII equivalents.
                                text += "|" + players[key].get("_displayname").replace("(", _.escape("(")).replace(")", _.escape(")"));
                            }
                        }
                        // Complete the Other api button.
                        text += "}'>Other</a></td>";
                    }
                    // Add a closing tag to finish the row in the table.
                    text += "</tr>";
                }
            }
        }
        // Check if the "show" parameter is set to either "all" or "private".
        if (show === "all" || show === "private") {
            // If it is then check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the Private title..
                text += "<tr><td colspan='3'><strong><em>Private</em></strong></td></tr>";
                // Loop through the map displaying an api button for each one.
                for (var key in state.MapChange.privateMaps) {
                    if (state.MapChange.privateMaps.hasOwnProperty(key)) {
                        // Add a tag to open start a row on the table.
                        text += "<tr>";
                        // Generate an api button with the map name that will teleport the user to that map.
                        // If the map name is longer than 20 characters then trim it and add an elipse.
                        text += "<td><a href='!mc move --target " + key + "'>" + ((key.length > displayLength) ? key.substr(0, displayLength) + "..." : key) + "</a></td>";
                        // Add a button to teleport all players to the chosen map.
                        text += "<td><a href='!mc moveall --target " + key + "'>All</a></td>";
                        // Add a button to teleport a differnet player to the chosen map.
                        text += "<td><a href='!mc move --target " + key + " --player ?{Player";
                        // Loop through the players in the campaign adding them to the dropdown for the command.
                        for (var key in players) {
                            // Add the current players name with any brackets replaced for their ASCII equivalents.
                            text += "|" + players[key].get("_displayname").replace("(", _.escape("(")).replace(")", _.escape(")"));
                        }
                        // Complete the Other api button.
                        text += "}'>Other</a></td>";
                        
                        // Add a closing tag to finish the row in the table.
                        text += "</tr>";
                    }
                }
            }
        }
        // Check to see if the text is currently empty.
        if (text !== "") {
            // If it isn't then wrap the text within a set of table tags.
            text = "<table border='1' cellspacing='0' cellpadding='0'>" + text + "</table>";
        }
        // Check to see if the filter is set to display all.
        if (show === "all") {
            // Add in a blank line to seperate the menus.
            text += "<br line-height='1'>";
        }
        // Check if the "show" paramter is set to either "all" or "utilities"/"utils".
        if (show === "all" || show === "utilities" || show === "utils") {
            // Add a table to start a new table.
            text += "<table <table border='1' cellspacing='0' cellpadding='0'>";
            // Add in the title for the utilities section.
            text += "<tr><td colspan='4'><strong><em>Utilities:</em></strong></td></tr>";
            // Add a tag to start a new row for the utility commands.
            text += "<tr>";
            // Add an api button for the rejoin command.
            text += "<td><a href='!mc rejoin'>Rejoin</a></td>";
            // Check if the caller is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // Add an api button for the GM to force rejoin another player to the bookmark.
                text += "<td><a href='!mc rejoin --player ?{Player";
                // Loop through the players in the campaign adding them to the dropdown for the command.
                for (var key in players) {
                    if (players.hasOwnProperty(key)) {
                        // Add the current players name with any brackets replaced for their ASCII equivalents.
                        text += "|" + players[key].get("_displayname").replace("(", _.escape("(")).replace(")", _.escape(")"));
                    }
                }
                // Complete the Rejoin Other api button.
                text += "}'>Other</a></td>";
                // If they are then add an api button for the map refresh command.
                text += "<td><a href='!mc refresh'>Refresh</a></td>";
            }
            // Add an api button for the help command.
            text += "<td><a href='!mc help'>Help</a></td>";
            // Add a tag to close the table.
            text += "</table>";
        }
        // Debug
        if (state.MapChange.config.debug) {
            log(show);
            log(text);
        }
        // Send the assembled menu text to the chat to be displayed.
        chat("/w", msg.who, text);
    };

    // Refreshes the maps without needing to restart the script.
    var refresh = function(msg) {
        log("Refreshing Maps...");
        // Clear out the public maps.
        state.MapChange.publicMaps = {};
        // Clear out the private maps.
        state.MapChange.privateMaps = {};
        // Reassemble the maps.
        constructMaps();
        log("Refresh Complete");
        // Check if the GM should be notified.
        if (state.MapChange.config.gmNotify) {
            // If they should then send them a message.
            chat("/w", msg.who, "Map Refresh Complete");
        }
    };
    
    // Moves a player to the specified map.
    var move = function(msg, sender, target) {
        var pages = findObjs({_type: 'page'});
        var playerPages = Campaign().get("playerspecificpages");
        var differentSender = false;
        
        if (msg.playerid != sender) {
            differentSender = true;
        }
        
        if (playerPages === false) {
            playerPages = {};
        }
        
        if (target in state.MapChange.publicMaps) {
            // Move player.
            if (sender in playerPages) {
                delete playerPages[sender];
            }
            playerPages[sender] = state.MapChange.publicMaps[target];
            
            if (state.MapChange.config.gmNotify) {
                var playerAddition = ((differentSender) ? getDisplayNameFromPlayerId(sender) + " " : "");
                chat("/w", "gm", msg.who.replace("(GM)", "") + " has moved " + playerAddition + "to " + target);
            }
        }
        else if (target in state.MapChange.privateMaps) {
            if (playerIsGM(msg.playerid)) {
                // Move player.
                if (sender in playerPages) {
                    delete playerPages[sender];
                }
                playerPages[sender] = state.MapChange.privateMaps[target];
                
                if (state.MapChange.config.gmNotify) {
                    var playerAddition = ((differentSender) ? getDisplayNameFromPlayerId(sender) + " " : "");
                    chat("/w", "gm", msg.who.replace("(GM)", "") + " has moved " + playerAddition + "to " + target);
                }
            }
        }
        else {
            // Report Map not found.
            chat("/w", msg.who, "Map " + target + "not found");
        }
        
        Campaign().set("playerspecificpages", false);
        Campaign().set("playerspecificpages", playerPages);
    };

    var rejoin = function(msg, sender) {
        var playerPages = Campaign().get("playerspecificpages");
        var differentSender = false;
        
        if (msg.playerid != sender) {
            differentSender = true;
        }
        
        if (playerPages !== false) {
            if (sender in playerPages) {
                delete playerPages[sender];
                Campaign().set("playerspecificpages", false);
            }
        }
        if (_.isEmpty(playerPages)) {
            playerPages = false;
        }
        Campaign().set("playerspecificpages", playerPages);
        
        if (state.MapChange.config.gmNotify) {
            if (differentSender) {
                chat("/w", "gm", msg.who.replace("(GM)", "") + " has rejoined " + getDisplayNameFromPlayerId(sender) + " with the bookmark")
            }
            else {
                chat("/w", "gm", msg.who.replace("(GM)", "") + " has rejoined the bookmark");
            }
        }
    };

    var moveall = function(msg, target) {
        if (playerIsGM(msg.playerid)) {
            var bookmarkPage = Campaign().get("playerpageid");
            if (target in state.MapChange.publicMaps) {
                Campaign().set("playerspecificpages", false);
                bookmarkPage = state.MapChange.publicMaps[target];
                
                if (state.MapChange.config.gmNotify) {
                    chat("/w", "gm", "All players have moved to " + target);
                }
            }
            else if (target in state.MapChange.privateMaps) {
                Campaign().set("playerspecificpages", false);
                bookmarkPage = state.MapChange.privateMaps[target];
                
                if (state.MapChange.config.gmNotify) {
                    chat("/w", "gm", "All players have moved to " + target);
                }
            }
            else {
                chat("/w", msg.who, "Map " + target + " not found");
            }
            
            Campaign().set("playerpageid", bookmarkPage);
        }
    };
    
    var chat = function(type, who, message) {
        who = who.split(" ")[0].replace(" (GM)", "");
        sendChat("MapChange", type + " " + who + " " + message, {noarchive:true});
    };
    
    var navigation = function(prev, next) {
        // Create a varaible to hold the total colspan for the title bar.
        var colspan = 1;
        // Check if prev is not empty.
        if (prev !== "") {
            // If it is then increment colspan.
            colspan += 1;
        }
        // Check if next is not empty.
        if (next !== "") {
            // If it is then increment colspan.
            colspan += 1;
        }
        // Add in a blank line to seperate the information from the back button.
        var text = "<br line-height='1'>";
        // Add in a new table for the back button.
        text += "<table border='1' cellspacing='2' cellpadding='4'>";
        // Add in the title row for the navigation bar.
        text += "<tr><td colspan='" + colspan + "'><strong><em>Navigation<em></strong></td></tr>";
        // Add the opening tag for the row.
        text += "<tr>";
        // Check if prev is not empty.
        if (prev !== "") {
            // If it is then add a table element in for the previous button.
            text += "<td><a href='!mc help --show " + prev + "'>Previous</a></td>";
        }
        // Add in the row for the back button.
        text += "<td><a href='!mc help'>Back</a></td>";
        // Check if next is not empty.
        if (next !== "") {
            // If it is then add a table element in for the next button.
            text += "<td><a href='!mc help --show " + next + "'>Next</a></td>";
        }
        // Add the closing tag for the table.
        text += "</tr></table>";
        // Return the assembled text.
        return text;
    };

    var registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        ConstructMaps: constructMaps,
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall,
        Debug: debug,
        GMNotify: gmNotify
    };
}());

var globalconfig = globalconfig || undefined;

on("ready", function() {
    'use strict';
    // Load in the global config settings.
    MapChange.CheckInstall();
    // Check if the debug config is turned on.
    if (MapChange.Debug) {
        // If it is then log out the map construction.
        log("Map Change Started");
        MapChange.ConstructMaps();
        log("Maps Constructed");
        MapChange.RegisterEventHandlers();
        log("Map Change Ready");
    }
    // Check if the GM notificaiton config is turned on.
    if (MapChange.GMNotify) {
        // If it is then send a message to the GM to tell them the script is ready.
        sendChat("Map Change", "/w gm Map Change Ready");
    }
});
