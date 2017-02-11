// Gist:  https://gist.github.com/plexsoup/64852540504101b520b25f7c3fa84e5f
// By:       Plexsoup - copied from Mark by The Aaron. With help from Scott C, Stephen L and Tritlo
// Thanks: Testers and Feedback: al e., DM Robzer, Vince, Pat S, Gold, Anthony,  Kryx, Sudain
// Contact:  https://app.roll20.net/users/258125/plexsoup

// Roll20 API Script to leave a breadcrumb trail of torches. Based on "Mark" from The Aaron //


/*


                                                                                                   
                _/_/_/      _/_/_/      _/        _/_/_/    _/_/_/  _/    _/  _/_/_/_/_/   
               _/    _/  _/            _/          _/    _/        _/    _/      _/        
              _/_/_/      _/_/        _/          _/    _/  _/_/  _/_/_/_/      _/         
             _/              _/      _/          _/    _/    _/  _/    _/      _/          
            _/        _/_/_/        _/_/_/_/  _/_/_/    _/_/_/  _/    _/      _/           
                                                                                           
                                                                                           
                                                                                  
                     _/_/_/_/_/  _/_/_/      _/_/    _/_/_/  _/          _/_/_/   
                        _/      _/    _/  _/    _/    _/    _/        _/          
                       _/      _/_/_/    _/_/_/_/    _/    _/          _/_/       
                      _/      _/    _/  _/    _/    _/    _/              _/      
                     _/      _/    _/  _/    _/  _/_/_/  _/_/_/_/  _/_/_/         
                                                                                          


*/

/* 

    Purpose:
        Leaves a trail of lit, shared-vision torches behind characters.
        Intended to help players see where they've been on maps with dynamic lighting enabled.
        Great for dungeon crawls and hex crawls.

        
    Usage:
        enter !LightCrumb in chat
        
*/


/* Major TODO List:

    Working On:
    - testing

    Broken:
    - colors aren't permanent.. if the list of active mappers changes, the aura colors change.
    
    Need:
    - refactor to use psGUI and psUtils
    - set light_otherplayers for shared-vision mode and unique-vision mode
    - change what's stored in gmnotes. right now it's the parent token_id, but it could be a JSON string with more options.
    - test with a group of 3 or 4
    - implement 1-click installation
    - add more gui buttons: for when a token is selected already. Toggles seem to work well too.
    - reorganize gui
    - test inherited DROP_DISTANCE on maps with different grid settings. It's currently assuming 70 pixels per unit.
    - write a test plan, for bugchecking
    
    Nice To Have:
    - add an option to limit the number of lightcrumbs and reuse the oldest ones
    - offload math to Stephen L's VectorMath and PathMath libraries
    - implement occlusion testing - can you see the last lightcrumb, or is it blocked by a dynamic lighting wall?
        - see Stephen L's "It's a Trap" script
    - consider making the torches burn out over time.
        - see The Aaron's "Torch" script

    Consider:
    - Maybe players shouldn't have access to config options. Check for GM.


    DONE:
    - add option to change the radius of the displayed aura.
    - add option to change the graphic: invisible token would be nice.
    - update register case to drop a lightcrumb right away
    - add dynamic configuration options for the radius and dimness of the light
    - offset the lightcrumbs so they fall 1 unit behind the targetToken, along the vector of [lastMove, currentLocation]
    - set the default offset to 0 and change behaviour such that lightcrumbs drop at lastlocation instead of current.
    - something's wrong with dropping tokens. they're invisible until you change the icon. Fixed: lastmove.split was producing strings, not numbers
    - make an option to use offsets instead of lastlocation (offsets look better, but might penetrate walls)
    - consider an option so each light crumb is only controlled by the player that dropped it.  
    - add a deregister command, to remove a token from the list of activeMappers
    - option to use token's original visual properties to set the lightCrumb's properties.
    - Some tokens don't have owners, but we rely on that for controlleby and getAuraColor... come up with a workaround
    - change aura color for each specific player.
    - modify the reset function, so it only clears the current page and torches from the current token
    - modify handleTokenMove, such that crumbs are dropped based on light settings rather than drop distance
    - modify handleTokenMove or getLightCrumbsFromLayer such that only those owned by the token are considered for purposes of calculating shortest distances.
    - remove one trail should work if you click on a torch instead of a character.
    - set defaults to inherit lighting, unique vision mode with drop distance based on light_radius
    - In Unique vision mode, findNearest Lightcrumb should check the parentToken
    - In Inherited Light Settings mode, drop distance should depend on light radius // this doesn't work for very large radii, unless you also implment occlusion testing
    - add a superClear function to remove the tokens from the GM Layer
    - change Help to handout instead of chat.
    - rewrite the help text -- see if you can make a popout handout
    - when shared-vision is true, all the auras should be the same color
    
    
    NOTES:
    - we use the gmnotes field to store the tokenID of the parent mapper. If you modify the gmnotes, things might break
    - we don't do rigorous error checking, so if you pass values to !LightCrumb through macros or the chat interface, things might break
    
*/


var LightCrumb = LightCrumb || (function LightCrumbTrailMaker() {
    "use strict";

    var debugDEFCON = 5; //     DEFCON 1 = FUBAR: LOG EVERYTHING. DEFCON 5 = AOK: LOG NOTHING

    var version = "0.76";
    var lastUpdate = 1486466920154;
    var schemaVersion = "0.76";

    var ICONS = { // note: Roll20 has particular rules about imgsrc. See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions
        torch: "https://s3.amazonaws.com/files.d20.io/images/17247606/Wbr841_bq9ka1FmamWo38w/thumb.png?1458169656",
        transparent: "https://s3.amazonaws.com/files.d20.io/images/27023509/jDIhDrjr_RyUxq5ldQj1uw/thumb.png?1483683924",
        scifi: "https://s3.amazonaws.com/files.d20.io/images/27025190/VrSyw_oHrsM8cfdBPcfLHw/thumb.png?1483690176"
    };

    var LOCATIONS = {
        LAST: 1, // drop lightcrumbs at the token's last known location
        CURRENT: 2 // drop lightcrumbs near the token's current location but offset by some distance along movement path
    };

    var COLORS = ["#ff0000", "#ff9900", "#ffcc66", "#ff3300", "#ff6600", "#cc9900", "#ffff99"];
    
    var defaultConfig = {
        LIGHT_RADIUS: 20,
        DIM_RADIUS: 0,
        DROP_DISTANCE: 25, // in page units. It'll get multiplied by 70pixels later.
        ICON_RELATIVE_SIZE: 0.5, // as compared to a standard token
        IMAGE: ICONS.torch,
        //DROP_BEHAVIOUR: LOCATIONS.LAST,
        DROP_AT_PREVIOUS_LOCATION: true,
        OFFSET: 35,
        SHOW_HELP_ON_READY: 0,
        SHARED_VISION: false,
        SHOW_AURA: true,
        AURA_RADIUS: 1,
        SHOW_NAMES: true,
        INHERIT_CHARACTER_LIGHTING: true,
        SHARED_AURA_COLOR: "#FAF0E6"
    };

    var config = _.clone(defaultConfig); // this'll get updated from state.LightCrumb.config
    
    
        
    var LightCrumbImageURL = ICONS.torch;

    var activeLightCrumbMappers = []; // so we can register token._id for characters who are set as mappers.

    
    

    
    var whisperSmall = function chatMessageSender(playerName, message) {
        // sends a chat message to a specific player. Can use gm as playerName
        //sendChat(playerName, '/w ' + playerName + " " + message);
        var msgStr = "<div style='font-size: smaller;'>";
        msgStr += message;
        msgStr += "</div>";
        
        sendChat("LightCrumb Script", '/w ' + playerName + " " + msgStr);
    };
    
    
    var whisper = function chatMessageSender(playerName, message) {
        // sends a chat message to a specific player. Can use gm as playerName
        //sendChat(playerName, '/w ' + playerName + " " + message);
        sendChat("LightCrumb Script", '/w ' + playerName + " " + message);
    };

    var ch = function (c) {
    // This function will take a single character and change it to it's equivalent html encoded value.
        // psNote: I tried alternate methods of regexps to encode the entire string, but I always ran into problems with | and [] characters.
        var entities = {
            '<' : 'lt',
            '>' : 'gt',
            "'" : '#39',
            '@' : '#64',
            '{' : '#123',
            '|' : '#124',
            '}' : '#125',
            '[' : '#91',
            ']' : '#93',
            '"' : 'quot',
            '-' : 'mdash',
            ' ' : 'nbsp'
        };

        if(_.has(entities,c) ){
            return ('&'+entities[c]+';');
        }
        return '';
    };



/*


      ooooooo8   ooooo  oooo  ooooo
    o888    88    888    88    888
    888    oooo   888    88    888
    888o    88    888    88    888
     888ooo888     888oo88    o888o

*/


    var makeButton = function buttonMakerForChat(title, command) { // expects two strings. Returns encoded html for the chat stream
        var output="";

            output += '['+title+']('+command+')';

        return output;
    };

    var beautifyButtons = function buttonBeautifier (buttonArray) {
        // take a 2D array, consisting of [[title1, command1], [title2, command2], ... [titleN, commandN]]
            // return pretty html for the buttons to go on the chat window.

        // **** TODO ****

        outputMessage = "";
        return outputMessage;

    };

    var getImgSrcChooserButtons = function ImcSrcChooserForChat (playerName) {
        if (!playerName) { playerName = "gm";}
        var chatMessage = "";
        
        chatMessage += '<div style="text-align: center">';
        chatMessage +=      '<span>';
        chatMessage +=          makeButton('<img width="28px" height="28px" src="'+ICONS.torch+'">', '!LightCrumb-image torch');
        chatMessage +=      '</span>';
        chatMessage +=      '<span>';
        chatMessage +=          makeButton('<img width="28px" height="28px" src="'+ICONS.transparent+'">', "!LightCrumb-image transparent");
        chatMessage +=      '</span>';
        chatMessage +=      '<span>';
        chatMessage +=          makeButton('<img width="28px" height="28px" src="'+ICONS.scifi+'">', "!LightCrumb-image scifi");
        chatMessage +=      '</span>';
        chatMessage += '</div>';        
        
        
        return chatMessage;
    };



    var getClickyButtons = function guiMakerForChat (playerName) {
        if (!playerName) { playerName = "gm";}
        var chatMessage = "";
        chatMessage += '<div style="border: 2px solid red; text-align: center; margin: 5px;">';
        chatMessage += '<div style="background-color: OrangeRed"><span><img style="float: left;" width="28px" height="28px" src="'+ICONS.torch+'"></span><span>!LightCrumb</span><span><img style="float:right;" width="28px" height="28px" src="'+ICONS.scifi+'"></span></div>';
        chatMessage += '<div style="text-align: center; background-color: black; color: OldLace;">';
        chatMessage +=      '<span>';
        chatMessage +=          "Mapper: ";
        chatMessage +=      '</span>';
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Add", '!LightCrumb-register '+ch('@') +ch('{') + 'target' + ch('|') + 'token_id' + ch('}') );
        chatMessage +=      '</span>';
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Remove", '!LightCrumb-deregister '+ch('@') +ch('{') + 'target' + ch('|') + 'token_id' + ch('}') );
        chatMessage +=      '</span>';

        chatMessage += '</div><div style="text-align: center; background-color: black; color: OldLace;">';      
        
        chatMessage +=          '<span>';
        chatMessage +=              "Remove Trail: ";
        chatMessage +=          '</span>';

        chatMessage +=          '<span>';
        chatMessage +=              makeButton("One", "!LightCrumb-clear " +ch('@') +ch('{') + 'target' + ch('|') + 'token_id' + ch('}') );
        chatMessage +=          '</span>';

        chatMessage +=          '<span>';
        chatMessage +=              makeButton("All", "!LightCrumb-clear all");
        chatMessage +=          '</span>';

        chatMessage += '</div><div style="text-align: center; background-color: black;">';      
        
        
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Clear Mappers", "!LightCrumb-deregister all");
        chatMessage +=      '</span>';
        
/*      
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Drop", "!LightCrumb-drop " +ch('@') +ch('{') + 'target' + ch('|') + 'token_id' + ch('}') );
        chatMessage +=      '</span>';
*/


        chatMessage +=          '<span>';
        chatMessage +=              makeButton("Destroy Crumbs", "!LightCrumb-destroy all");
        chatMessage +=          '</span>';
        
        chatMessage += '</div><div style="text-align: center; background-color: black;">';      

        
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Status", "!LightCrumb-status");
        chatMessage +=      '</span>';
        
        chatMessage +=      '<span>';
        chatMessage +=      makeButton("Config", "!LightCrumb-gui getLightConfig");
        chatMessage +=      '</span>';

        
        chatMessage += '</div>';

        chatMessage += showDetailedHelp(playerName);
        
        chatMessage += "</div>";
        
        whisper(playerName, chatMessage);
        
    };

    
    var getLightConfigButtons = function lightConfigForChat (playerName) {
        if (!playerName) { playerName = "gm";}

        var gridUnits = getObj("page", getCurrentPage("gm")).get("scale_units"); // **** What if the gm is on a different page than the players, but a player invoked lightcrumb?
        var chatMessage = "";
        
        chatMessage += '<div style="border: 2px solid red; text-align: center; margin: 5px;">';
        chatMessage += '<div style="background-color: OrangeRed"><span><img style="float: left;" width="28px" height="28px" src="'+ICONS.torch+'"></span><span>!LightCrumb-config</span><span><img style="float:right;" width="28px" height="28px" src="'+ICONS.scifi+'"></span></div>';
        chatMessage += '<div style="text-align: center; background-color: black;">';

        chatMessage +=      getImgSrcChooserButtons(playerName);
        
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Toggle Inherit Light Settings", '!LightCrumb-config INHERIT_CHARACTER_LIGHTING 1');
        chatMessage +=      '</span>';
        
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Light Radius", '!LightCrumb-config LIGHT_RADIUS ?'+ch('{')+ 'LIGHT_RADIUS?' +ch('|')+ config.LIGHT_RADIUS +ch('}'));
        chatMessage +=      '</span>';
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Dim Start", '!LightCrumb-config DIM_RADIUS ?'+ch('{')+ 'DIM_RADIUS?' +ch('|')+ config.DIM_RADIUS +ch('}'));
        chatMessage +=      '</span>';
    
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Crumb Seperation", '!LightCrumb-config DROP_DISTANCE ?'+ch('{')+ 'DROP_DISTANCE In ' + gridUnits +ch('|')+ config.DROP_DISTANCE +ch('}'));
        chatMessage +=      '</span>';
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Toggle Drop Location", '!LightCrumb-config DROP_AT_PREVIOUS_LOCATION 1');
        chatMessage +=      '</span>';      

        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Offset Distance", '!LightCrumb-config OFFSET_DISTANCE ?'+ch('{')+ 'OFFSET_DISTANCE In pixels' +ch('|')+ config.OFFSET +ch('}'));
        chatMessage +=      '</span>';

        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Aura Radius", '!LightCrumb-config AURA_RADIUS ?'+ch('{')+ 'AURA_RADIUS in ' + gridUnits + ch('|')+ config.AURA_RADIUS +ch('}'));
        chatMessage +=      '</span>';      
        
        
        /*
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Show Help on Load", '!LightCrumb-config SHOW_HELP_ON_READY ?'+ch('{')+ 'SHOW_HELP_ON_READY: 0 or 1' +ch('|')+ config.SHOW_HELP_ON_READY +ch('}'));
        chatMessage +=      '</span>';
        */
        
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Toggle Shared Vision", '!LightCrumb-config SHARED_VISION 1');
        chatMessage +=      '</span>';
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Toggle Aura", '!LightCrumb-config SHOW_AURA 1');
        chatMessage +=      '</span>';      
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Toggle Names", '!LightCrumb-config SHOW_NAMES 1');
        chatMessage +=      '</span>';
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Reload Default Config", '!LightCrumb-config LOAD_DEFAULT 1');
        chatMessage +=      '</span>';      
        
        chatMessage += '</div>';

        // log("===> LightConfigButtons are whispering to playerName: " + playerName);
        whisper(playerName, chatMessage);
    };
    
    
/*


ooooo ooooo            o888
 888   888  ooooooooo8  888 ooooooooo
 888ooo888 888oooooo8   888  888    888
 888   888 888          888  888    888
o888o o888o  88oooo888 o888o 888ooo88
                            o888

*/



    var showDetailedHelp = function showDetailedHelpTextInChat(playerName) {
        if (debugDEFCON < 2) { log("entering showDetailedHelp("+playerName+")"); }

        if (!playerName) { playerName = "gm";}



        var exampleStyle = '"background-color: #eee; font-size: smaller; margin-left: 40px;"';
        var warningStyle = '"background-color: AntiqueWhite; font-size: smaller;"';
        var exampleTokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');

        var helpText = '';

        helpText += '<div style="font-size: smaller;">';
        helpText += 'LightCrumb is a script to leave lit torches in a trail behind characters.';
        helpText += "This lets them see where they've been on maps with dynamic lighting enabled.";
        helpText += "Useful for hex-crawls and dungeon-crawls.";
        helpText += "</div>";

        helpText += '<div style="font-size: smaller;">';        
        helpText += "To start, enter !LightCrumb in the chat window.";
        helpText += "</div>";
        
        helpText += '<div style="font-size: smaller;">';        
        helpText += "A few configuration options to be aware of: ";
        helpText += "<ul>";
        helpText +=         "<li>Toggle Shared Vision - determines whether players 'see through' only their own trails, or, everyone's trails. Useful if the party splits up and you want everyone to have a different view.</li>";
        helpText +=         "<li>Toggle Inherit Light Settings - determines whether torches emit the same light as their parent token, or if they all use the same values. Useful if someone has poor vision and you want their trails to reflect that.</li>";
        helpText +=         "<li>Min Seperation - sets the distance between automatic torch placement. Measured in whatever units you've set for the page. Usually feet.</li>";
        helpText +=         "<li>Light Radius and Dim Start - same as for characters. Only used when 'inherit light settings' is off. Set Dim Start to 0 if you want the trails to be dimly lit.</li>";
        helpText +=         "<li>Drop Behaviour - Drop crumbs either at each token's current location or previous location. Dropping torches at your current location looks cooler, but it can make it hard to grab your own token afterward. Also, when you use an offset value, torches might appear on the other side of walls, ruining the effect.</li>";
        helpText +=         "<li>Offset Distance - Only used when Drop Behaviour is set to 'current location'. Determines how far behind your token to place the torch. If you use this, set it to a value of 35 or 40 to start.</li>";
        helpText += "</ul>";
        helpText += "</div>";
        

        
        helpText += "<div style='font-size: smaller'>";
        helpText += "In addition to the gui buttons, you can make macros to activate the features. Here are some commands to play with.";
        helpText +=         '<div style='+ exampleStyle +'> !LightCrumb-drop ' + exampleTokenSelect + '</div>';
        helpText +=         '<div style='+ exampleStyle +'> !LightCrumb-register ' + exampleTokenSelect + '</div>';
        helpText +=         '<div style='+ exampleStyle +'> !LightCrumb-deregister ' + exampleTokenSelect + '</div>';       
        helpText +=         '<div style='+ exampleStyle +'> !LightCrumb-clear parentTokenID' + '</div>';
        helpText +=         '<div style=' +exampleStyle+ '> !LightCrumb-gui</div>';

        
        //whisper(playerName, helpText );
        var helpHandouts;
        helpHandouts = findObjs({
            _type: "handout",
            name: "LightCrumb Help"
        });

        var helpHandout = helpHandouts[0];
        //log("helpHandout = " + helpHandout);
        
        if (!helpHandout) { // create it
            helpHandout = createObj('handout', {
                name: 'LightCrumb Help',
                inplayerjournals: 'all'
            });
            helpHandout.set("notes", helpText);

        } else { // it exists, set it's contents to match the latest version of the script
            helpHandout.set("notes", helpText);
        }
        var handoutID = helpHandout.get("_id");

        var chatMessage = "";
        var buttonStyle = "'background-color: OrangeRed;'";
        
        chatMessage += "<div style="+buttonStyle+"><a href='http://journal.roll20.net/handout/" + handoutID + "'>Additional Information</a></div>";
        

        
        // getClickyButtons(playerName);

        if (debugDEFCON < 2) { log("exiting showDetailedHelp. Whispered message to chat. No return value."); }

        
        return(chatMessage);
    };


/*


ooooo                                    o8
 888  oo oooooo  ooooooooo  oooo  oooo o888oo
 888   888   888  888    888 888   888  888
 888   888   888  888    888 888   888  888
o888o o888o o888o 888ooo88    888o88 8o  888o
                 o888

*/


    var handleInput = function inputHandler(msg) {
        // FYI: Expected msg looks like this:
            // content, playerid, selected, type, who
            // where content is: !LightCrumb token_id
            // {"content":"!LightCrumb -K_D89bE8mmN0VEBmdjt","playerid":"-K_D5Ng6YOcQ3VnAEsNh","selected":[{"_id":"-K_D89bE8mmN0VEBmdjt","_type":"graphic"}],"type":"api","who":"plexsoup (GM)"}
            
        if (msg.type == "api" && msg.content.indexOf("!LightCrumb") !== -1 ) {

            var argsFromUser,
                who,
                errors=[],
                // playerPage, // useful for status message where no token is selected
                tokenPage, // used for dropping new lightCrumbs
                LightCrumbMakerSupply,
                token,
                tokenCoords,
                tokenID,
                playerID,
                playerName,
                pageID,
                statusMessage,
                parentTokenID,
                lastPage;


            playerName = msg.who;
            playerID = msg.playerid;
            
            pageID = getCurrentPage(playerID);
            
            if (debugDEFCON < 5) {
                log("PlayerName = " + playerName);
                // log("PlayerID = " + playerID);
                log("msg.content = " + msg.content);
            }

            argsFromUser = msg.content.split(/ +/);
            if (debugDEFCON < 2) {log("handleInput got a message: " + argsFromUser);}

            switch(argsFromUser[0]) {
                case '!LightCrumb-clear':
                    // remove all the light-crumbs

                    parentTokenID = argsFromUser[1];
                    if (parentTokenID == "all") {
                            reset(pageID, "all", "soft");
                    } else {
                        reset(pageID, parentTokenID, "soft");
                    }
                    
                    break;

                case '!LightCrumb-destroy':
                    // destroy the LightCrumbs permanently. Nothing left on GM Layer.
                    
                    parentTokenID = argsFromUser[1];
                    if (parentTokenID == "all") {
                        reset(pageID, "all", "hard");
                    } else {
                        reset(pageID, parentTokenID, "hard");
                    }
                    
                    break;
                    
                case '!LightCrumb-register':
                    if (debugDEFCON < 2) { log("Trying to register a new token"); }
                    // Add tokenIDs to the list of tokens registered to produce light-trails automatically
                    tokenID = argsFromUser[1];
                    registerMapper(tokenID, playerName);
                    break;
                    
                case '!LightCrumb-deregister':
                    if (debugDEFCON < 5 ) { log("==> !LightCrumb-deregister " + argsFromUser[1]); }
                    tokenID = argsFromUser[1];
                    deregisterMapper(tokenID, playerName);
                
                    break;

                case '!LightCrumb-status':
                    // print out some variables to get more info and help with debugging

                    statusMessage += getLightCrumbStatus(pageID);

                    whisper(playerName, statusMessage);

                    break;

                case '!LightCrumb-drop': // drop a single LightCrumb torch
                        token = getTokenObjectFromID(argsFromUser[1]);
                        if (token === undefined) {
                            whisper(playerName, "Error: undefined token");
                        } else {
                            if(debugDEFCON < 5) {
                                log("Token ID: " + token.get("_id"));
                                log("Page ID: " + token.get("_pageid"));
                                log("Coords: [" + token.get("left") + "," + token.get("top") + "]");
                            }

                            tokenPage = token.get("_pageid");
                            tokenCoords = [token.get("left"), token.get("top")];

                            var controllingPlayerID = playerID;
                            if ( config.SHARED_VISION === true ) {
                                controllingPlayerID += ",all";
                            }

                            var displayName = getDisplayName(token.get("name"));
                            
                            var customLightCrumbSettings = {
                                left: tokenCoords[0],
                                top: tokenCoords[1],
                                pageid: tokenPage,
                                controlledby: controllingPlayerID,
                                name: displayName
                            };
                            
                            if (config.INHERIT_CHARACTER_LIGHTING) {
                                customLightCrumbSettings[light_radius] = token.get("light_radius");
                                customLightCrumbSettings[light_dimradius] = token.get("light_dimradius");
                            }
                
                            var currentLightCrumb = dropLightCrumb(customLightCrumbSettings, token.get("_id")); //manual drop
                            if (debugDEFCON < 4) {log("dropped LightCrumb from !LightCrumb-drop: [" + tokenCoords + "], " + tokenPage);}
                        }
                    break;
                case '!LightCrumb-gui': // show some clicky buttons in the chat window
                        if (debugDEFCON <3) {log("received !LightCrumb-gui: "+argsFromUser);}
                        var requestedCommand = argsFromUser[1];
                        if (requestedCommand !== undefined) {
                            if (requestedCommand == "chooseImage") {
                                getImgSrcChooserButtons(playerName);
                            } else if (requestedCommand == "getLightConfig" || requestedCommand == "config") {
                                getLightConfigButtons(playerName);
                            }

                        } else {
                            getClickyButtons(playerName);
                        }

                    break;

                case '!LightCrumb-image': // change the appearance of the token that drops
                        var requestedIcon = argsFromUser[1];
                        if (requestedIcon !== undefined) {
                            if (requestedIcon == "torch") {
                                config.IMAGE = ICONS.torch;
                            } else if (requestedIcon == "transparent") {
                                config.IMAGE = ICONS.transparent;
                            } else if (requestedIcon == "scifi") {
                                config.IMAGE = ICONS.scifi;
                            }

                            state.LightCrumb.config = _.clone(config);

                            var requestedSettings = {imgsrc: config.IMAGE};
                            convertCrumbsToNewSettings(pageID, requestedSettings);
                        }

                    break;

                case '!LightCrumb-config': // set any the configurable values.
                        if (debugDEFCON < 4) { log('!LightCrumb-config received: ' + argsFromUser); }
                        var requestedParameter = argsFromUser[1];
                        var requestedValue = argsFromUser[2];
                        var requestedLightCrumbSettings = { layer:"objects" } ;
                        var needBatchConversion = false;
                        
                        if (requestedParameter === undefined || requestedValue === undefined) {
                            // abort.. something went wrong
                            whisper(playerName, "Error: didn't receive proper values for !LightCrumb-config.");
                        } else {
                            if (requestedParameter == "LIGHT_RADIUS" ) {
                                config.LIGHT_RADIUS = requestedValue;
                                requestedLightCrumbSettings.light_radius = requestedValue;
                                needBatchConversion = true;
                                whisperSmall(playerName, "LIGHT_RADIUS set to: " + config.LIGHT_RADIUS);
                            } else if (requestedParameter == "DIM_RADIUS") {
                                config.DIM_RADIUS = requestedValue;
                                whisperSmall(playerName, "DIM_RADIUS set to: " + config.DIM_RADIUS);
                                needBatchConversion = true;
                                requestedLightCrumbSettings.light_dimradius = requestedValue;
                            } else if (requestedParameter == "DROP_DISTANCE") {
                                config.DROP_DISTANCE = requestedValue;
                                whisperSmall(playerName, "DROP_DISTANCE set to: " + config.DROP_DISTANCE);
                            } else if (requestedParameter == "OFFSET_DISTANCE") {
                                config.OFFSET = requestedValue;
                                whisperSmall(playerName, "OFFSET set to: " + config.OFFSET);
                            } else if (requestedParameter == "SHOW_HELP_ON_READY") {
                                config.SHOW_HELP_ON_READY = requestedValue;
                                whisperSmall(playerName, "SHOW_HELP_ON_READY set to: " + config.SHOW_HELP_ON_READY);
                            } else if (requestedParameter == "DROP_AT_PREVIOUS_LOCATION") {
                                config.DROP_AT_PREVIOUS_LOCATION = !config.DROP_AT_PREVIOUS_LOCATION;
                                whisperSmall(playerName, "DROP_AT_PREVIOUS_LOCATION set to: " + config.DROP_AT_PREVIOUS_LOCATION);
                            } else if (requestedParameter == "SHARED_VISION") {
                                config.SHARED_VISION = !config.SHARED_VISION; // toggle
                                whisperSmall(playerName, "Shared Vision set to " + config.SHARED_VISION);
                                needBatchConversion = true;
                            } else if (requestedParameter == "SHOW_AURA") {
                                config.SHOW_AURA = !config.SHOW_AURA; // toggle true false
                                // whisper(playerName, "SHOW_AURA set to " + config.SHOW_AURA);
                                requestedLightCrumbSettings.showplayers_aura1 = config.SHOW_AURA;
                                if (config.SHOW_AURA === false) {
                                    requestedLightCrumbSettings.aura1_radius = "";
                                } else {
                                    requestedLightCrumbSettings.aura1_radius = config.AURA_RADIUS;
                                }
                                needBatchConversion = true;
                                
                            } else if (requestedParameter == "AURA_RADIUS") {
                                config.AURA_RADIUS = requestedValue;
                                needBatchConversion = true;
                                whisperSmall(playerName, "AURA_RADIUS set to " + config.AURA_RADIUS);                           
                            } else if (requestedParameter == "SHOW_NAMES") {
                                config.SHOW_NAMES = !config.SHOW_NAMES; // toggle true false
                                requestedLightCrumbSettings.showname = config.SHOW_NAMES;
                                requestedLightCrumbSettings.showplayers_name = config.SHOW_NAMES;
                                needBatchConversion = true;
                                // whisper(playerName, "SHOW_NAMES set to " + config.SHOW_NAMES);
                            } else if (requestedParameter == "INHERIT_CHARACTER_LIGHTING") {
                                config.INHERIT_CHARACTER_LIGHTING = !config.INHERIT_CHARACTER_LIGHTING;
                                needBatchConversion = true;
                                whisperSmall(playerName, "INHERIT_CHARACTER_LIGHTING set to " + config.INHERIT_CHARACTER_LIGHTING);
                            } else if (requestedParameter == "LOAD_DEFAULT") {
                                config = _.clone(defaultConfig);
                                state.LightCrumb.config = _.clone(defaultConfig);
                                requestedLightCrumbSettings = {
                                    imgsrc: config.IMAGE,
                                    showname: config.SHOW_NAMES,
                                    showplayers_name: config.SHOW_NAMES
                                };
                                
                                whisperSmall(playerName, getLightCrumbStatus(pageID) );
                                
                                if (config.SHOW_AURA === false) {
                                    requestedLightCrumbSettings.aura1_radius = "";
                                } else {
                                    requestedLightCrumbSettings.aura1_radius = config.AURA_RADIUS;
                                }
                                
                                needBatchConversion = true;
                            }
                        }

                        if( debugDEFCON < 2 ) { log("trying to clone config into state.LightCrumb.config.. here's what I have in config" + config ); }
                        
                        // **** TODO **** Fix this.. it converts a lot of settings which the user didn't ask for.

                        state.LightCrumb.config = _.clone(config);

                        if (needBatchConversion) {
                            convertCrumbsToNewSettings(pageID, requestedLightCrumbSettings);                            
                        }

                        // still need to go through all the old lightCrumbs and set their token values.

                    break;

                case '!LightCrumb-help': // explain script and pop up a few buttons in the chat for player to click on.
                    showDetailedHelp(playerName);
                    break;
                case '!LightCrumb': // explain script and pop up a few buttons in the chat for player to click on.
                    getClickyButtons(playerName);
                    break;
            }
        }
    };  
    
    
    
var getLightCrumbStatus = function (pageID) {

    var statusMessage = "";
    statusMessage = "<h4>"+activeLightCrumbMappers.length + " Active Mappers</h4>";

    
    statusMessage += "<ul>";
    var currentMapperName;
    _.each(activeLightCrumbMappers, function loopToListMappers(currentMapperID) {
        statusMessage += "<li>";
        currentMapperName = getObj('graphic', currentMapperID).get("name");
        if (currentMapperName !== "" ) {
            statusMessage += currentMapperName;
        } else {
            statusMessage += currentMapperID;
        }
        statusMessage += "</li>";
    });
    statusMessage += "</ul>";

    statusMessage += "<h4>"+getLightCrumbsFromLayer("objects", pageID).length + " Active LightCrumbs</h4>";
    
    statusMessage += "<h4>Config Options</h4>";

    var configMessage = JSON.stringify(config);
    var prettyConfigMessage = "";

    _.each(configMessage.split(","), function loopToBuildMessage(currentOption) {
        prettyConfigMessage += "<div style='font-size: smaller'>" + currentOption + "</div>";
    });

    statusMessage += prettyConfigMessage;   

    return statusMessage;
};
    
/*

                                          .   
                                        .o8   
oooo d8b  .ooooo.   .oooo.o  .ooooo.  .o888oo 
`888""8P d88' `88b d88(  "8 d88' `88b   888   
 888     888ooo888 `"Y88b.  888ooo888   888   
 888     888    .o o.  )88b 888    .o   888 . 
d888b    `Y8bod8P' 8""888P' `Y8bod8P'   "888" 

*/
    
    

    
    var reset = function resetter(pageID, parentTokenID, resetMode) {
        
        if (resetMode === undefined ) {
            resetMode = "soft";
        }
        
        if (debugDEFCON < 4) { log("entering reset with " + pageID); }
        //state.LightCrumb.count=0;
        
        // test pageID.
        if (!getObj("page", pageID)  ) { // this pageID is not valid.
            log("==> Error: This pageID is not valid: " + pageID);
            return -1;
        } else {
            if (debugDEFCON < 2 ) { log("    in reset: pageID is valid: " + pageID); }
        }
        
        
        if (pageID === undefined) {
            log("==> Error: reset(pageID, parentTokenID, resetMode) didn't receive a pageID");
            pageID = getCurrentPage("gm");  
        }
        
        if (parentTokenID !== "all") {
            // Check to see if you grabbed a torch or a character
            var gmNotesOnToken = getObj("graphic", parentTokenID).get("gmnotes");
            if (getObj("graphic", gmNotesOnToken) ) { // for some reason the gmnotes contains the _id of a token... maybe it's a torch
                var foundInActiveList = activeLightCrumbMappers.indexOf(gmNotesOnToken);
                parentTokenID = gmNotesOnToken;
            }       
            whisperSmall("gm", "Removing trail belonging to " + getObj("graphic", parentTokenID).get("name"));
        }


        
        _.each(ICONS, function loopToGrabAllTheTorchIcons(imageUrl) {

            _.each(findObjs({
                    _pageid: pageID,
                    _type: 'graphic',
                    _subtype: 'token',
                    imgsrc: imageUrl,
                    
                    
                }), function loopToHideLightCrumbs(currentLightCrumbToken){
                    
                    if ( parentTokenID == currentLightCrumbToken.get("gmnotes") || parentTokenID == "all") {
                        if (resetMode == "soft") {
                            currentLightCrumbToken.set({ // hide the lightcrumb token, but keep it available for later reuse - saves html lookups
                                layer: 'gmlayer',
                                width: 70,
                                height: 70,
                                top: 35,
                                left: 35,
                                imgsrc: config.IMAGE,
                                gmnotes: "",
                                aura1_color: "#ffffff",
                                name: "LightCrumb"
                            });                         
                        } else { // resetMode == "hard"
                            currentLightCrumbToken.remove(); // destroy it!
                        }

                    }
                }
            );

        });

    };

    var getAuraColor = function auraColorGetter(parentTokenID) {
        if (parentTokenID === undefined || parentTokenID === "" ) {
            // log("==> Error in getAuraColor. No token provided")
            return "#ffffff";
        }
        
        if (config.SHARED_VISION === true) {
            return config.SHARED_AURA_COLOR;
        }
    
        // log("entering getAuraColor with " + parentTokenID);
        var colors = ["#ff0000", "#ff9900", "#ffcc66", "#ff3300", "#ff6600", "#cc9900", "#ffff99"];
        var mappers = activeLightCrumbMappers;
        // log("activeLightCrumbMappers = " + JSON.stringify(activeLightCrumbMappers) );
        
        var mapperNum;  
        var counter = 0;
        var color;
        
        mapperNum = mappers.indexOf(parentTokenID);
        // log("mapperNum: " + mapperNum);
        
        if (mapperNum !== -1) {
            var colorNum = mapperNum % colors.length;
            // log("colorNum = " + colorNum);
            color = colors[ colorNum ]; // cycle through colors in array with modulo operator       
        } else {
            color = "#ffffff";
        }

        // log("exiting getAuraColor with " + color);
        // log("token: " + parentTokenID + ", called: " + getObj("graphic", parentTokenID).get("name") + " has color: " + color);
        return color;
    };
    
    
/*

                                                                   .   
                                                                 .o8   
 .ooooo.   .ooooo.  ooo. .oo.   oooo    ooo  .ooooo.  oooo d8b .o888oo 
d88' `"Y8 d88' `88b `888P"Y88b   `88.  .8'  d88' `88b `888""8P   888   
888       888   888  888   888    `88..8'   888ooo888  888       888   
888   .o8 888   888  888   888     `888'    888    .o  888       888 . 
`Y8bod8P' `Y8bod8P' o888o o888o     `8'     `Y8bod8P' d888b      "888" 
*/
    
    var convertCrumbsToNewSettings = function crumbsResetter(pageID, requestedOptions) {
        
        if (requestedOptions === undefined) {
            requestedOptions = {light_otherplayers: config.SHARED_VISION};          
        }
        
        if (debugDEFCON < 5) {log("entering convertCrumbsToNewSettings with " + JSON.stringify(requestedOptions) ); }

        if (pageID === undefined ) {
            log("==> Error: convertCrumbsToNewSettings didn't receive a pageID");
            pageID = getCurrentPage("gm");
        }
        
        if (!requestedOptions || requestedOptions.size === 0 ) { // figure out what needs resetting, exactly.
            log("==> didn't see any options for the conversion.. what's up?");          
        }
        
        
        _.each(ICONS, function(imageUrl) { // note: this won't find anything where the user passed their own url to !LightCrumb-image
            if (debugDEFCON < 4) {log("checking for: " + imageUrl);}
            _.each(findObjs({
                    _pageid: pageID,
                    _type: 'graphic',
                    _subtype: 'token',
                    imgsrc: imageUrl
                }), function convertCrumbToNewSettings(currentCrumb){ // do this stuff once for every torch icon
                    if (debugDEFCON < 2 ) { log("converting lightcrumb token: " + currentCrumb.get("_id")); }
                    
                    // figure out who owns it.
                    
                    var currentCrumbID = currentCrumb.get("_id");
                    if (debugDEFCON < 4) { log("currentCrumbID = " + currentCrumbID); }
                    var parentTokenID = getParentTokenID(currentCrumbID);
                    if (debugDEFCON < 4) { log("in convertCrumbsToNewSettings: parentTokenID = " + parentTokenID); }
                    
                    // remove "all" from the list of controlling tokens                 
                    var controlledByArray = currentCrumb.get("controlledby").split(",");
                    controlledByArray = _.without(controlledByArray, "all");
                    var controlledByString = controlledByArray.join(",");
                    if (debugDEFCON < 4) { log("in convertCrumbToNewSettings: controlledByString = " + controlledByString); }
                    // then add it back if it's needed.
                    if (config.SHARED_VISION === true) { // add "all" to controlledby 
                        controlledByString += ",all";
                        requestedOptions.light_otherplayers = true;
                    } else {
                        requestedOptions.light_otherplayers = false;
                        if (controlledByString == "") { // looks like a character is set to all players instead of a specific character
                            controlledByString = "all";
                        }
                    }
                    
                    requestedOptions.controlledby = controlledByString;                     
                    
                    if (config.SHARED_VISION === false) { // modify the aura so it's obvious who can see the torch
                        if (controlledByString !== "all") {
                            requestedOptions.aura1_color = getAuraColor(currentCrumb.get("gmnotes"));                           
                        } else { // this character is set to be controlled by all players. 
                            requestedOptions.aura1_color = config.SHARED_AURA_COLOR;
                            
                        }
                    } else {
                        requestedOptions.aura1_color = config.SHARED_AURA_COLOR;
                    }

                    
                    if (!_.has(requestedOptions, "showplayers_aura1") ) {
                        requestedOptions.showplayers_aura1 = config.SHOW_AURA;
                    }
                    
                    
                    if (!_.has(requestedOptions, "aura1_radius") ) {
                        if (config.SHOW_AURA === true) {
                            requestedOptions.aura1_radius = config.AURA_RADIUS;
                        } else {
                            requestedOptions.aura1_radius = "";
                        }
                    }

                    
                    if(config.INHERIT_CHARACTER_LIGHTING === false ) {
                        requestedOptions.light_radius = config.LIGHT_RADIUS;
                        requestedOptions.light_dimradius = config.DIM_RADIUS;
                                                
                    } else { // get the correct light radius from the parent token for each lightcrumb
                    
                        var parentToken = getObj("graphic", parentTokenID);
                        if (!parentToken) { 
                            log("==> Error. no parent token matching: " + parentTokenID);
                            log("here's the list of mappers" + JSON.stringify(activeLightCrumbMappers));
                        } else {
                            
                            requestedOptions.light_radius = parentToken.get("light_radius");
                            requestedOptions.light_dimradius = parentToken.get("light_dimradius");                          
                        }
                    }




                    
                    // **** TODO **** fix this: if a player requests a new image, it shouldn't change all the light_radii.
                    if (_.size(requestedOptions) > 0 ) {
                        for (var propertyName in requestedOptions) {
                            // log("setting property: " + propertyName + ", value: " + requestedOptions[propertyName]);
                            currentCrumb.set(propertyName, requestedOptions[propertyName]);
                        }
                    }
                    
            });
        });

        if (debugDEFCON < 5) {log("leaving convertCrumbToNewImage. Nothing to return."); }
    };

    
    


    
    
    
    var getTokenObjectFromID = function tokenConverter(requestedTokenID) {
        var errors = [];
        var targetToken;

        // **** TODO **** What happens if you get/need more than one token id?
        if (debugDEFCON < 5) {
            log("function getTokenObjectsFromIDList(" + requestedTokenID + ")");
        }

        targetToken = getObj('graphic',requestedTokenID);
        if(! targetToken) {
            return undefined;
        } else {
            return targetToken;
        }
    };

    var getParentTokenID = function parentIDGetter(lightCrumbID) {  
        if (debugDEFCON < 4 ) { log("entering getParentTokenID with " + lightCrumbID); }
        
        var lightCrumbObj = getObj("graphic", lightCrumbID );
        if (!lightCrumbObj) {
            log("==> Error: couldn't find object matching id: " + lightCrumbID);
            return -1;
        } else {
            var parentTokenID = lightCrumbObj.get("gmnotes");

            if (debugDEFCON < 4) { log("exiting getParentTokenID: returning " + parentTokenID); }
            
            return parentTokenID;           
        }

    };
    


    
    
    var getLightCrumbsFromLayer = function lightCrumbFinder(layer, pageID) {
        // expects "objects" or "gmlayer" and a valid page_id

        if (!pageID) {
            log("==> Error: getLightCrumbsFromLayer expected a pageID but didn't receive one");
            pageID = getCurrentPage("gm");
        }

        if (debugDEFCON < 5) {
            log("entered getLightCrumbsFromLayer(" + layer + ", " + pageID + ")");
        }
        var LightCrumbMakerSupply;


        LightCrumbMakerSupply = findObjs({
            type: 'graphic',
            subtype: 'token',
            imgsrc: config.IMAGE,
            layer: layer,
            pageid: pageID
        });

        if (debugDEFCON < 5) {
            log("leaving getLightCrumbsFromLayer: returning LightCrumbMakerSupply = " + LightCrumbMakerSupply);
        }
        return(LightCrumbMakerSupply);
    };


    var deregisterMapper = function mapperDeregistrar(tokenID, playerName) {
        if (debugDEFCON < 5) { log("entering deregisterMapper with " + tokenID + "," + playerName );}
        
        if (playerName === undefined || tokenID == "all") { // clear all mappers
            activeLightCrumbMappers = [];
            state.LightCrumb.activeMappers = [];

        } else { // We got a tokenID. Remove it from the list of active mappers
        
            // rearrange the colors list so other mappers can keep their existing color         
            var mapperNum = activeLightCrumbMappers.indexOf(tokenID);
            var mapperColor = COLORS[mapperNum];
            // log("COLORS before: " + COLORS);
            COLORS = _.without(COLORS, mapperColor);
            COLORS.push(mapperColor);
            // log("COLORS after: " + COLORS);
            state.LightCrumb.colors = _.clone(COLORS);
            
            // remove the mapper from the list
            // log("activeLightCrumbMappers before: " + activeLightCrumbMappers);
            activeLightCrumbMappers = _.without(activeLightCrumbMappers, tokenID);
            state.LightCrumb.activeMappers = _.clone(activeLightCrumbMappers);
            // log("activeLightCrumbMappers after: " + activeLightCrumbMappers);
        }
        
        
    };
    
    var registerMapper = function mapperRegistrar(tokenID, playerName) {
        if (debugDEFCON < 2) { log("entered registerMapper with: " + tokenID + ", " + playerName); }
        if (playerName === undefined) { playerName = "gm"; }

        var statusMessage = "";
        var targetToken = getTokenObjectFromID(tokenID);
        var tokenOwner = targetToken.get("controlledby");
        var tokenCoords = [targetToken.get("left"), targetToken.get("top")];
        var tokenName = targetToken.get("name");
        var currentPage = targetToken.get("_pageid");
        if (!tokenName) { tokenName = ""; }

        if ( activeLightCrumbMappers.indexOf(tokenID) == -1 ) { // you're not yet registered
            activeLightCrumbMappers.push(tokenID);
            state.LightCrumb.activeMappers.push(tokenID); // save this in the Roll20 state object so it's persistent between sessions.
            statusMessage = 'Added ' + tokenName + ' to the list of active mappers.';
            statusMessage += '<div style="font-size: smaller; text-align: center;">(ID: '+ tokenID + ')</div>';
            whisper(playerName, statusMessage);
            
            
            /* Removed: not needed because we don't drop a crumb on register anymore
            var controllingPlayerID = tokenOwner;
            if ( config.SHARED_VISION === true ) {
                controllingPlayerID += ",all";
                
            }
            */
            
            var displayName = getDisplayName(tokenName);

            if (debugDEFCON < 4) {
                log("In registerMapper: added " + tokenID + " to list of Active mappers" + activeLightCrumbMappers);
                log("in registerMapper: dropped LightCrumb: [" + tokenCoords + "], " + currentPage);
            }
        }


    };



    var getOffsetLocation = function offsetLocationGetter(currentLocation, lastLocation) { // expect two points [x,y], [x1,y1]


        var offsetUnitVector = plexUtils.NormalizeVector(currentLocation, lastLocation);
        if (debugDEFCON < 2) {log("offsetUnitVector = " + offsetUnitVector);}
        var offsetScaledVector = plexUtils.ScaleVector(offsetUnitVector, config.OFFSET);
        if (debugDEFCON < 2) {log("offsetScaledVector = " + offsetScaledVector);}
        var offsetLocation = plexUtils.AddVectors([currentLocation, offsetScaledVector]);
        if (debugDEFCON < 2) {log("offsetLocation = " + offsetLocation);}

        if (offsetLocation == []) {
            log("Couldn't find an offset location. Setting it to currentLocation");
            offsetLocation = currentLocation;
        }

        if (debugDEFCON < 2 ) { log("offsetVector = " + offsetUnitVector); }
        if (debugDEFCON < 2 ) { log("offsetLocation = " + offsetLocation); }
        // normalizeVector is expecting two points

        return offsetLocation;


    };


/*


ooooooooo
 888    88o oo oooooo     ooooooo  ooooooooo
 888    888  888    888 888     888 888    888
 888    888  888        888     888 888    888
o888ooo88   o888o         88ooo88   888ooo88
                                   o888

*/


    var dropLightCrumb = function lightCrumbDropper(customLightCrumbSettings, parentToken) { // expects an object with properties matching roll20 graphic objects

        if (debugDEFCON < 5) { log("entered dropLightCrumb with " + JSON.stringify(customLightCrumbSettings)); }

        // **** TODO: go through this list of variables and clear unused ones out

        var LightCrumbMakerSupply,
            currentLightCrumb,
            size,
            auraRadius,
            auraColor,
            showName,
            showPlayersName,
            showPlayersAura1,
            targetLocation,
            offsetLocation,
            lastLocation = [],
            currentPageID;

            
            
        var defaultLightCrumbSettings = {
            imgsrc: config.IMAGE,
            subtype: 'token',
            pageid: getCurrentPage("gm"),
            width: 70 * config.ICON_RELATIVE_SIZE,
            height: 70 * config.ICON_RELATIVE_SIZE,
            left: 70,
            top: 70,
            layer: 'objects',
            light_radius: config.LIGHT_RADIUS,
            light_dimradius: config.DIM_RADIUS,
            light_hassight: true,
            light_otherplayers: true,
            controlledby: "all",
            isdrawing: true,
            name: "Default LightCrumb",
            gmnotes: parentToken
        };

        
        
        for (var propertyName in defaultLightCrumbSettings) { // compare custom settings with default and fill them out where needed.
            if ( customLightCrumbSettings.hasOwnProperty(propertyName) === false ) {
                customLightCrumbSettings[propertyName] = defaultLightCrumbSettings[propertyName];
            }
        }       

        currentPageID = customLightCrumbSettings.pageid;

        LightCrumbMakerSupply = getLightCrumbsFromLayer("gmlayer", currentPageID);
        currentLightCrumb = LightCrumbMakerSupply.pop();

        if(currentLightCrumb) {
            
            if (debugDEFCON < 2) { log("Found existing lightCrumb on GM Layer" + currentLightCrumb); }
            
            currentLightCrumb.set(customLightCrumbSettings);
            // log( "dropped old, salvaged currentLightCrumb: " + JSON.stringify(currentLightCrumb) );          
            
        } else { // no existing lightcrumb found. Make a new one.
            if (debugDEFCON < 5) { log("No existing lightcrumb. About to make one."); }
            currentLightCrumb = createObj('graphic',customLightCrumbSettings);
            
            if (debugDEFCON < 4) {log( "dropped brand new currentLightCrumb: " + JSON.stringify(currentLightCrumb) );}
        }

        if (currentLightCrumb) {
            // **** ! Clean this section up. It's a mess. 
                // Move it into or before the customLightCrumbSettings object gets built.
            if (customLightCrumbSettings.controlledby.indexOf('all')) {
                
                if (config.SHOW_AURA ) {

                    if (config.SHARED_VISION === false) {
                        auraColor = getAuraColor(currentLightCrumb.get("gmnotes"));
                    } else {
                        auraColor = config.SHARED_AURA_COLOR;
                    }
                    currentLightCrumb.set({
                        aura1_radius: config.AURA_RADIUS,
                        aura1_color: auraColor,
                        showplayers_aura1: true
                    });
                } else {
                    currentLightCrumb.set("showplayers_aura1", false);
                }
                
                if (config.SHOW_NAMES) {
                    currentLightCrumb.set({
                        // name: "all",
                        showname: true,
                        showplayers_name: true
                    });                 
                } else { // hide the name
                    currentLightCrumb.set({
                        // name: "all",
                        showname: false,
                        showplayers_name: false
                    });                 
                }
            } else { // "all" does not appear in the list: controlledby for the token.
                
                if (config.SHOW_NAMES ) {
                    currentLightCrumb.set({
                        showname: true,
                        showplayers_name: true                  
                    });
                } else { // hide the name
                    currentLightCrumb.set({             
                        showname: false,
                        showplayers_name: false                 
                    });
                }

                if (config.SHOW_AURA) {
                    
                    currentLightCrumb.set({
                        aura1_radius: config.AURA_RADIUS,
                        aura1_color: getAuraColor(currentLightCrumb.get("gmnotes")),
                        showplayers_aura1: true
                    });                 
                } else { // hide the aura
                    currentLightCrumb.set({
                        showplayers_aura1: false
                    });                 
                }
                
            }           
            
            
            toBack(currentLightCrumb);
        } else {
            log("==> Something seems wrong. dropLightCrumb Tried to set the Z-order to back, but there was no LightCrumb object to move.");
        }

        if (debugDEFCON < 2) {
            log( "Dropped a LightCrumb with the following properties: " + JSON.stringify(currentLightCrumb) );
            var allLightCrumbsOnPlayerLayer = getLightCrumbsFromLayer("objects", currentPageID);
            log("There are " + allLightCrumbsOnPlayerLayer.length + " known torch tokens on object layer: ");
        }

        if ( debugDEFCON < 5 ) { log("leaving dropLightCrumb. Returning currentLightCrumb." + JSON.stringify(currentLightCrumb)); }
        
        return currentLightCrumb;
        
    };


    var getGameMasterID = function gmIDGetter() {
        if (debugDEFCON < 4) { log("entering getGameMasterID with no parameters"); }
        
        var players = findObjs({
            _type: "player",
        });
        
        var gmID;
        var gmObj;
        var currentPlayerID;
        
        _.each(players, function loopToFindGM(player) { 
            if (debugDEFCON < 4) { log("evaluating player: " + JSON.stringify(player) ); }
            currentPlayerID = player.get("_id");
            if ( playerIsGM(currentPlayerID) ) {
                gmID = currentPlayerID;
                // ??? what happens if there's 2 GMs? We're only delivering up the last one found.
                if (debugDEFCON < 2) {log("found a GM: " + gmID);}
            }
        
        });

        if (debugDEFCON < 4) { log("exiting getGameMasterID. Returning " + gmID); }
        return gmID;
    };
    
    
/*

                                               
ooooooooo     ooooooo     oooooooo8 ooooooooo8 
 888    888   ooooo888  888    88o 888oooooo8  
 888    888 888    888   888oo888o 888         
 888ooo88    88ooo88 8o 888     888  88oooo888 
o888                     888ooo888             

*/  
    
    var getCurrentPage = function currentPageGetter(tokenObjOrPlayerID) { // expects token, playerID, or string=="gm"
    // **** TODO **** This isn't working as expected. Go through it and check assertions.
    
        if ( debugDEFCON < 5) { log( "entering getCurrentPage with " + tokenObjOrPlayerID ); }
        var currentPage;
        var playerID;
        var playerObj;
        var gmID = getGameMasterID();
        if ( debugDEFCON < 5) {
            log("   gmID = " + gmID);
        }

        if (tokenObjOrPlayerID === undefined ) { // getCurrentPage received bad parameters, but we'll take care of it.
            log("==> Error in getCurrentPage. tokenObjOrPlayerID == undefined"); 
            return Campaign().get("playerpageid");
            
        } else if ( tokenObjOrPlayerID == "gm") {
            tokenObjOrPlayerID = gmID;
            if (gmID) {
                // currentPage = getObj("player", gmID).get("lastpage");            
                return Campaign().get("playerpageid");
            } else {
                return Campaign().get("playerpageid");              
            }           
        
            
            
        } else if ( _.isString(tokenObjOrPlayerID) ) { // it's a player ID
            if (debugDEFCON < 4) { log("    tokenObjOrPlayerID was a string. Assume player_id: " + tokenObjOrPlayerID); }
            playerID = tokenObjOrPlayerID;
            playerObj = getObj("player", playerID);
            
            if (playerIsGM(playerID)) { // it's the GM, use the lastpage property to find their page
                if (debugDEFCON < 4) { 
                    log("    player_id is a GM");
                    log("    playerObj.get('lastpage') returns " + playerObj.get("lastpage") );
                    //log("    Campaign().get('playerpageid') returns " + Campaign().get("playerpageid") );
                }
                
                currentPage = playerObj.get("lastpage"); // NOTE: there's no lastpage unless the GM has been on another page
                if (!currentPage) {
                    currentPage = Campaign().get("playerpageid");
                }
            } else if ( Campaign().get("playerspecificpages")[playerID] ) {
                if ( debugDEFCON < 4 ) { 
                    log("    player_id is not a GM, and the players are seperated onto different pages"); 
                    log("    playerspecificpages = " + Campaign().get("playerspecificpages") );
                }
                
                
                // Note: there's no playerspecificpages unless a single player name is dragged onto another map
                currentPage = Campaign().get("playerspecificpages")[playerID];

            } else { // it's a player and the players are all on one page.
                if (debugDEFCON < 4) { log("    player_id is not a GM, but there's only one page"); }
                currentPage = Campaign().get("playerpageid");               
            }
        } else if ( _.isObject(tokenObjOrPlayerID) ) { // it's a token
            if (debugDEFCON < 4) { log("    tokenObjOrPlayerID was an object. Assume token: " + JSON.stringify(tokenObjOrPlayerID) ); }
            var token = tokenObjOrPlayerID;
            currentPage = token.get("page_id");
        }
        
        if (debugDEFCON < 4) { log("exiting getCurrentPage. Returning " + currentPage ); } 
        
        return currentPage;
    };

    var handlePlayerPageChange = function pageChangeHandler() {
        // Nothing to be done. I'm not exactly sure why I have this yet.

        return;
    };

    var getDisplayName = function displayNameGetter(tokenName) {
        var words = tokenName.split(" ");
        var initials= "";
        
        _.each(words, function loopToBuildName(word) {
            initials += word.charAt(0);
        });

        return initials;
    };

    var findShortestDistance = function shortestDistancetoTokenFinder(listOfGraphicObjectsToCompare, referenceLocation, tokenMoved ) {
        
        if (debugDEFCON < 5) { log("entering findShortestDistance with: " + listOfGraphicObjectsToCompare + ", " + referenceLocation + ", " + tokenMoved); }

        var shortestDistance = -1;

        /*      
        var referenceLocation = [];
        if ( _.isArray(referenceObject) ) { // check isArray first. Arrays pass as objects for underscore.js
            referenceLocation = referenceObject;
        } else if ( _.isObject(referenceObject) ) {
            referenceLocation = [referenceObject.get("left"), referenceObject.get("top")];
        } else { // something's wrong. didn't get object or array for reference object
            log("==> Error in findShortestDistance: received " + referenceObject + " but expected token object or location array");
            return -1;
        } */

        _.each(listOfGraphicObjectsToCompare, function loopToFindClosest(specificObjectToConsider) {
            var targetLocation = [specificObjectToConsider.get("left"), specificObjectToConsider.get("top")];
            var currentDistance = plexUtils.GetDistance(targetLocation, referenceLocation);
            if ( shortestDistance == -1 || currentDistance < shortestDistance ) {
                shortestDistance = currentDistance;
            }

        });

        if (debugDEFCON < 5) { log("leaving findShortestDistance: returning shortestDistance = " + shortestDistance); }
        return shortestDistance;
    };


/*


oooo     oooo
 8888o   888   ooooooo  oooo   oooo ooooooooo8
 88 888o8 88 888     888 888   888 888oooooo8
 88  888  88 888     888  888 888  888
o88o  8  o88o  88ooo88      888      88oooo888


*/

    var getLastLocation = function lastLocationGetter(token) {
        
        if (debugDEFCON < 3) { log("lastmove for " + token.get("name") + ", " + token.get("_id") + " = " + token.get("lastmove") ); }
        var movementPath = token.get("lastmove").split(",");
        
        var lastLocation = [];

        /*
        if (_.isString(movementPath[0]) ) {
            log("might have found your bug. token.get('lastmove').split(',') produces an array of strings. You need to convert them to numbers.");
        } else if (_.isNumber(movementPath[0]) ) {
            log("token.get('lastmove').split(',') seems to produce an array of numbers");
        }
        */
        
        lastLocation[0] = Number(movementPath[0]); // important to type convert them into numbers
        lastLocation[1] = Number(movementPath[1]);
        
        return lastLocation;
        
    };


    var handleTokenMove = function tokenMoveHandler(tokenMoved) {
        if (debugDEFCON < 4 ) { log("entering handleTokenMoved with: " + tokenMoved); }
        var tokenLocation = [],
            tokenID = tokenMoved.get("_id"),
            tokenPageID = tokenMoved.get("_pageid"),
            tokenPageObj = getObj("page", tokenPageID),
            parentTokenID = tokenMoved.get("_id"),
            tokenName = tokenMoved.get("name"),
            shortestDistanceToExistingCrumb = -1,
            currentLocation,
            lastLocation,
            referenceLocation;

        lastLocation = getLastLocation(tokenMoved);     
        currentLocation = [tokenMoved.get("left"), tokenMoved.get("top")];
        
        
        if (!lastLocation) { // this token hasn't ever moved.. just use the current location.
            lastLocation = [tokenMoved.get("left"), tokenMoved.get("top")];
        }


        if ( config.DROP_AT_PREVIOUS_LOCATION === true ) {
            referenceLocation = lastLocation;
        } else {
            referenceLocation = getOffsetLocation(currentLocation, lastLocation);
        }       
        

        if (activeLightCrumbMappers.indexOf(tokenID) !== -1) { // you're authorized to leave a trail of light.. continue
            if(debugDEFCON < 4) {log("in handleTokenMove. About to get tokenLocation");}
            // tokenLocation = [tokenMoved.get("left"), tokenMoved.get("top")];

            
            // figure out which lightcrumbs you own.
            var crumbsToConsider = getLightCrumbsFromLayer("objects", tokenPageID);
            if (debugDEFCON < 4 ) { log("crumbsToConsider before SHARED_VISION test: " + _.size(crumbsToConsider) ); }
            if ( config.SHARED_VISION === false || config.INHERIT_CHARACTER_LIGHTING === true ) { // filter the list of crumbsToConsider for crumbs owned by the token
                var allCrumbsInConsideration = crumbsToConsider;
                crumbsToConsider = _.filter( allCrumbsInConsideration, function removeOtherPlayersCrumbs(crumbInQuestion) {                 
                    
                    if (crumbInQuestion.get("gmnotes") == tokenID ) { // ownership is designated by the parentToken's ID in the gmnotes field on lightcrumb objects
                        return true;
                    } else {
                        return false;
                    }
                    
                });
            }
            if (debugDEFCON < 4 ) { log("crumbsToConsider after SHARED_VISION test: " + _.size(crumbsToConsider + ", " + JSON.stringify(crumbsToConsider)) ); }
                        
            shortestDistanceToExistingCrumb = findShortestDistance(crumbsToConsider, referenceLocation, tokenMoved);            

            if (debugDEFCON < 4) { log("config.DROP_DISTANCE: " + config.DROP_DISTANCE + ", Current Distance: " + shortestDistanceToExistingCrumb); }

            // figure out how far between crumbs is ok, so you can drop another one.
            var minSeperation = config.DROP_DISTANCE;
            var pixelsPerFoot = 70 / tokenPageObj.get("scale_number");
            
            if (config.INHERIT_CHARACTER_LIGHTING === true) { // use light_radius from parentToken              
                // minSeperation = tokenMoved.get("light_radius") * pixelsPerFoot * 0.75; // **** TODO **** change this to use dynamic grid-size data from page object.
                minSeperation = config.DROP_DISTANCE * pixelsPerFoot;
            } else {
                minSeperation = config.DROP_DISTANCE * pixelsPerFoot;
            }
            
            if ( shortestDistanceToExistingCrumb == -1 || shortestDistanceToExistingCrumb > minSeperation ) {
                if (debugDEFCON < 4) { log("LightCrumb.handleTokenMove: registered token, "+ tokenID +", moved. dropping light token"); }
                
                // var controllingPlayerID = tokenMoved.get("controlledby"); // fails
                
                var activeCharacter = getObj("character", tokenMoved.get("represents"));
                var controllingPlayerID;

                if (activeCharacter !== undefined) {

                    var controllingPlayersList = activeCharacter.get("controlledby");                   
                    var controllingPlayersArray = controllingPlayersList.split(",");
                    var actualPlayersArray = _.without(controllingPlayersArray, "all");
                    var firstPlayerListed = actualPlayersArray[0];
                    controllingPlayerID = firstPlayerListed;
                    
                    if (controllingPlayerID === undefined) {
                        controllingPlayerID = "all";
                    }
                    // figure out the first one that's not "all players"
                    
                    
                    
                } else { // there's no one assigned to the token
                    controllingPlayerID = "all";
                    whisper("gm", "Be aware: There's no player assigned to that token. Things might get weird.");
                }
                // **** NOTE: you might have problems if characters have multiple owners
                
                if (debugDEFCON < 4) { log("    in handleTokenMove: controllingPlayerID = " + controllingPlayerID ); }
                if ( config.SHARED_VISION === true ) {
                    controllingPlayerID += ",all";
                }
                
                var displayName = getDisplayName(tokenName);

                
                var customLightCrumbSettings = {
                    left: referenceLocation[0],
                    top: referenceLocation[1],
                    pageid: tokenPageID,
                    controlledby: controllingPlayerID,
                    name: displayName,
                    aura1_color: getAuraColor(parentTokenID)
                };
                
                if (config.SHARED_VISION) {
                    customLightCrumbSettings.light_otherplayers = true;
                } else {
                    customLightCrumbSettings.light_otherplayers = false;
                }
                
                
                if (config.INHERIT_CHARACTER_LIGHTING) {
                    customLightCrumbSettings.light_radius = tokenMoved.get("light_radius");
                    customLightCrumbSettings.light_dimradius = tokenMoved.get("light_dimradius");
                    
                }

                var currentLightCrumb = dropLightCrumb(customLightCrumbSettings, tokenMoved.get("_id")); //movementDrop

                if (debugDEFCON < 4) { log("    in handleTokenMove: dropped LightCrumb [" + lastLocation + "], "+ tokenPageID); }

            }

        }
        if (debugDEFCON < 4) { log("leaving handleTokenMove. Nothing to return."); }
        return;
    };

    
/*

ooooo                          .             oooo  oooo  
`888'                        .o8             `888  `888  
 888  ooo. .oo.    .oooo.o .o888oo  .oooo.    888   888  
 888  `888P"Y88b  d88(  "8   888   `P  )88b   888   888  
 888   888   888  `"Y88b.    888    .oP"888   888   888  
 888   888   888  o.  )88b   888 . d8(  888   888   888  
o888o o888o o888o 8""888P'   "888" `Y888""8o o888o o888o 

*/  
    
    
    
    
    var checkInstall = function () {
        log("/===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-===/");
        log("           Starting LightCrumb Script              ");
        log("         current time is: " + Date.now() + "            ");        
        log("                                                   ");
        log("       To use, enter !LightCrumb in chat.          ");
        log("/===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-===/");


        // Roll20 allows scripters to store persistent data in their "state" object.
        // We'll use the LightCrumb property in state to store persistent info about this script for each campaign.
        // Notably: who's registered to leave automatic LightCrumb trails.

        if( ! _.has(state,'LightCrumb') ) { // first time running the LightCrumb script for this Roll20 campaign. It needs a state.
            log('-=> LightCrumb v'+version+' <=-  ['+(new Date(lastUpdate))+']');
            state.LightCrumb = {
                version: schemaVersion,
                activeMappers: [],
                colors: COLORS,
                config: config

            };
        } else { // a LightCrumb object already exists in the Roll20 persistent "state" object.

            var lengthOfStateConfig = _.size(state.LightCrumb.config);
            var lengthOfLightCrumbConfig = _.size(config);
            
            if (debugDEFCON < 2) { log("state.LightCrumb.config = " + JSON.stringify(state.LightCrumb.config) ); }
            if (debugDEFCON < 2) { log("config = " + JSON.stringify(config) ); }
            
            if ( state.LightCrumb.version !== schemaVersion || lengthOfLightCrumbConfig !== lengthOfStateConfig ) {
                log("Seems like the script got updated: " + state.LightCrumb.version);
                log("Updating state.LightCrumb.version to reflect current script: "+schemaVersion);

                state.LightCrumb.version = schemaVersion;
                
                /*
                for (var propertyName in config) {
                    if (state.LightCrumb.config.hasOwnProperty(propertyName)) {
                        log("found property: " + propertyName + ": " + state.LightCrumb.config[propertyName]);
                    } else {
                        log("missing property: " + propertyName + ": " + config[propertyName]);
                        state.LightCrumb.config[propertyName] = config[propertyName];
                    }
                }
                */

                /* Reset to Default Settings for this campaign? */
                state.LightCrumb.config = _.clone(config);
                
            }

            
            if (_.has(state.LightCrumb, 'activeMappers')) {
                activeLightCrumbMappers = _.clone(state.LightCrumb.activeMappers);
            } else {
                state.LightCrumb.activeMappers = _.clone(activeLightCrumbMappers);
            }

            if (_.has(state.LightCrumb, 'config')) {
                config = _.clone(state.LightCrumb.config);
            } else {
                state.LightCrumb.config = _.clone(config);
            }

            if (_.has(state.LightCrumb, 'colors')) {
                COLORS = _.clone(state.LightCrumb.colors);
            } else {
                state.LightCrumb.colors = _.clone(COLORS);
            }


        }
        
        if (_.has(state.LightCrumb.config) && state.LightCrumb.config.SHOW_HELP_ON_READY == 1) {
            LightCrumb.ShowDetailedHelp('gm');
        }
    };

    
/* ---------------------------------------------------------------------------- */
    
                        /* --------------------- */
                        //    IN CONSTRUCTION    //
                        /* --------------------- */ 
    var checkGlobalConfig = function globalConfigChecker() {

        // Set the theme from the useroptions.
        var useroptions = globalconfig && globalconfig.LightCrumb;
        if(useroptions) {
            state.LightCrumb.config.SHOW_HELP_ON_READY = useroptions.SHOW_HELP_ON_READY;
            state.LightCrumb.userOptions = {
                SHOW_HELP_ON_READY: useroptions.SHOW_HELP_ON_READY
            };
        }
    
        
    };
    
/* ---------------------------------------------------------------------------- */

    
    
    
    var registerEventHandlers = function() {
        if (debugDEFCON < 5) {
            log("LightCrumb registered event handlers");
        }
        on('chat:message', handleInput );
        on('change:graphic', handleTokenMove );
    };

    return {
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall,
        Reset: reset,
        ShowDetailedHelp: showDetailedHelp
    };



}());


/*

    ooo        ooooo               .   oooo        .o.
    `88.       .888'             .o8   `888        888
     888b     d'888   .oooo.   .o888oo  888 .oo.   888
     8 Y88. .P  888  `P  )88b    888    888P"Y88b  Y8P
     8  `888'   888   .oP"888    888    888   888  `8'
     8    Y     888  d8(  888    888 .  888   888  .o.
    o8o        o888o `Y888""8o   "888" o888o o888o Y8P


*/



var plexUtils = plexUtils || (function plexsoupAwesomeMaths() {
    // Another module. This one for fun math. Adding and subtracting vectors, Distance, etc.
    var debugDEFCON = 5; // 5 = AOK: log nothing. 1 = FUBAR: log everything

    var getLongestVectorLength = function longestVectorGetter(vectorList) {
        // **** why is this returning a length of 3 for two dimensional vectors?

        if (debugDEFCON < 2) { log("entering getLongestVectorLength with: " + vectorList); }

        if (vectorList.length == 2) {
            if ( _.isNumber(vectorList[0]) ) {
                log("aborting getLongestVectorLength(" + vectorList + "). I think we got one vector (a single x,y location) instead of a list of vectors.");
                return(2);
            }
        } else {
            if (debugDEFCON<2) {log("vectorList.length = " + vectorList);}
        }

        var longestVectorLength = 0;


        _.each(vectorList, function loopToFindLongest(vector) {
            if (vector.length > longestVectorLength) {
                longestVectorLength = vector.length;
            }
        });

        if (debugDEFCON < 3) {
            log("getLongestVectorLength returning with: " + longestVectorLength);
        }

        return longestVectorLength;

    };

    var initializeVector = function vectorInitialiser(lengthRequired) {
        if (debugDEFCON < 2) { log("initializeVector called with " + lengthRequired); }
        var newVector = [];
        var elementID;
        for(elementID = 0; elementID < lengthRequired; elementID++) {
            newVector.push(0);
        }
        if (debugDEFCON < 2) { log("initializeVector returning with " + newVector); }
        return newVector;
    };

    var addVectors = function vectorAdder(listOfVectors) { // expects a 2d array.. [[point1, point2, ... pointN], ..., [pn1, pn2, ... pnN]]
        // assumes the input vectors are the same length: eg 2 coordinates each: X and Y

        if (listOfVectors.length == 2 ) { // make sure you're adding 2 vectors and not 2 points
            if (_.isNumber(listOfVectors[0])) {
                log("Aborting addVectors(" + listOfVectors + "). I think it contains one vector instead of two or more.");
                return listOfVectors; // bail out.. something went wrong. You got a point instead of 2 vectors
            }
        }

        if ( debugDEFCON < 2 ) { log("addVectors called with: " + listOfVectors); }

        var longestVectorLength = getLongestVectorLength(listOfVectors);
        var sumVector = initializeVector(longestVectorLength);




        var elementID = 0;
        var vectorNumber = 0;
        for(elementID=0; elementID<longestVectorLength; elementID++) {
            for(vectorNumber=0; vectorNumber<listOfVectors.length; vectorNumber++ ) {
                sumVector[elementID] += Number(listOfVectors[vectorNumber][elementID]);

            }
        }

        if (debugDEFCON < 3) {
            log("addVectors returning with: " + sumVector);
        }

        if ( debugDEFCON < 2 ) { log("addVectors returning " + sumVector); }
        return sumVector;

    };

    var scaleVector = function vectorExpander(vector, scalar) {
        if (debugDEFCON < 2) {
            log("scaleVector called with " + vector + ", " + scalar );
        }
        var newVector = _.map(vector, function scaleElement(elementValue) {
            return elementValue * scalar;
        });
        if (debugDEFCON < 2) {
            log("scaleVector returning with " + newVector );
        }
        return newVector;
    };

    var normalizeVector = function vectorNormalizer(point1, point2) { // expecting a list of 2 points [x1,y2], [x2,y2]
        if (debugDEFCON < 2) { log("entering normalizeVector with: " + point1 + ", " + point2); }

        var unitVector;
        var translatedVector = addVectors( [point2, scaleVector(point1, -1)] );

        var distance = getDistance(point1, point2);
        if (distance > 0) {
            unitVector = scaleVector(translatedVector, 1/distance );
        } else { // abort. can't divide by 0. Make something up instead.
            unitVector = translatedVector;
            if ( debugDEFCON<2) {log("trying to normalize a vector where the distance is zero. Can't divide by zero.");}
        }



        if (debugDEFCON < 2) { log("unitVector is: " + unitVector); }

        if (debugDEFCON < 2) { log("leaving normalizeVector with: " + unitVector); }
        return unitVector;

    };

    var getDistance = function distanceGetter(point1, point2) {
        // distance is squareroot of the squared sum of each side
        //if (debugDEFCON < 2) { log("entering getDistance with " + point1 + ", " + point2); }
        var xDist = Math.abs(point2[0] - point1[0]);
        var xDistSquared = Math.pow(xDist, 2);
        var yDist = Math.abs(point2[1] - point1[1]);
        var yDistSquared = Math.pow(yDist, 2);
        var distance = Math.sqrt(xDistSquared + yDistSquared);
        //if (debugDEFCON < 2) { log("returning from getDistance with " + distance); }
        return distance;
    };


    return {
        AddVectors: addVectors,
        ScaleVector: scaleVector,
        GetDistance: getDistance,
        NormalizeVector: normalizeVector

    };


}()); // End of Module: plexUtils



/*

    ooo        ooooo            o8o
    `88.       .888'            `"'
     888b     d'888   .oooo.   oooo  ooo. .oo.
     8 Y88. .P  888  `P  )88b  `888  `888P"Y88b
     8  `888'   888   .oP"888   888   888   888
     8    Y     888  d8(  888   888   888   888
    o8o        o888o `Y888""8o o888o o888o o888o


*/






on("ready",function(){
    // this stuff happens when the script loads.
    // Note: you have to use Caps to refer to the left side of the function declarations in "return"
    LightCrumb.CheckInstall(); // instantiate all the function expressions
    LightCrumb.RegisterEventHandlers(); // instantiate all the listeners
    
    


});


*******************************************************************************
/*

                     _/_/_/      _/_/_/      _/_/_/_/_/  _/_/_/  _/        _/_/_/_/   
                    _/    _/  _/                _/        _/    _/        _/          
                   _/_/_/      _/_/            _/        _/    _/        _/_/_/       
                  _/              _/          _/        _/    _/        _/            
                 _/        _/_/_/            _/      _/_/_/  _/_/_/_/  _/_/_/_/       
                                                                                      
                                                                                      
                                                                                         
                   _/_/_/    _/_/_/_/    _/_/_/  _/_/_/  _/_/_/_/_/  _/_/_/_/  _/_/_/    
                  _/    _/  _/        _/          _/          _/    _/        _/    _/   
                 _/_/_/    _/_/_/      _/_/      _/        _/      _/_/_/    _/_/_/      
                _/    _/  _/              _/    _/      _/        _/        _/    _/     
               _/    _/  _/_/_/_/  _/_/_/    _/_/_/  _/_/_/_/_/  _/_/_/_/  _/    _/    

*/

/*

    Purpose:
        To automatically resize plexsoup marketplace assets, to their intended native dimensions
        This makes creating dungeons dramatically easier. See youtube.com/user/plexsoup

    Usage:
        enter !psResize or !psTileResizer in chat

*/



var psTileResizer = psTileResizer || (function psMarketplaceResizer() {
    "use strict";

    var info = {
        version: 0.2,
        authorName: "plexsoup"
    };

    var config = {
        debugDEFCON: 5,
        resizeOnAdd: true
    };

    
    
    var temp = {
        //campaignLoaded: false,
        GMPlayer: Campaign
    };

    var marketplaceTiles = [];
    
    
/*

    TODO:

        turn off automatic renaming tiles
        verify that tile is on map layer before messing with it.
    
*/
    
    
    
    
    
    
    
    
    
    var tile = function( marketplaceID, width, height, name, connectors ) { // constructor to make a new tile
        this.marketplaceID = marketplaceID;
        this.width = width;
        this.height = height;       
        this.name = name;
        this.connectors = connectors;

        
        // **** add a function to get the best connection point for lining things updateCommands
        
        // **** add a function to get dynamic lighting lines - consider using the lightrecorder script
        
    };




// *******************************************************************************

    var populateDatabase = function databasePopulator() {

        // new tile (marketplaceID, width, height, name, connectors)
        var psCaves = [
            ["50279", 720, 720, "0002 Room", { ne: "", se: "", sw: "", nw: ""}],
            ["50281", 643, 643, "0003 Passage", { ne: "", se: "", sw: "", nw: ""}],
            ["50283", 748, 748, "0004 Passage Descent", { ne: "", se: "", sw: "", nw: ""}],
            ["50285", 622, 622, "0005 Passage Descent", { ne: "", se: "", sw: "", nw: ""}],
            ["50287", 696, 696, "0006 Passage Corner Gallery", { ne: "", se: "", sw: "", nw: ""}],
            ["50289", 752, 752, "0007 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50291", 411, 411, "0008 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50293", 618, 618, "0009 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50295", 620, 620, "0010 Passage Straight", { ne: "", se: "", sw: "", nw: ""}],
            ["50297", 634, 634, "0011 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
            ["50299", 585, 585, "0012 Passage Twisty 2", { ne: "", se: "", sw: "", nw: ""}],
            ["50301", 596, 596, "0013 Passage Twisty 3", { ne: "", se: "", sw: "", nw: ""}],
            ["50303", 604, 604, "0014 Intersection X", { ne: "", se: "", sw: "", nw: ""}],
            ["50305", 606, 606, "0015 Intersection T 1", { ne: "", se: "", sw: "", nw: ""}],
            ["50307", 633, 633, "0016 Intersection T 2", { ne: "", se: "", sw: "", nw: ""}],
            ["50309", 606, 606, "0017 Intersection Lava X", { ne: "", se: "", sw: "", nw: ""}],
            ["50311", 678, 678, "0018 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50313", 700, 700, "0019 Room Med", { ne: "", se: "", sw: "", nw: ""}],
            ["50315", 650, 486, "0020 Room Med", { ne: "", se: "", sw: "", nw: ""}],
            ["50317", 1093, 1093, "0021 Room Large", { ne: "", se: "", sw: "", nw: ""}],
            ["50319", 1172, 1172, "0022 Room Large", { ne: "", se: "", sw: "", nw: ""}],
            ["50321", 1043, 1043, "0023 Room Large", { ne: "", se: "", sw: "", nw: ""}],
            ["50323", 1365, 1365, "0024 Room Very Large", { ne: "", se: "", sw: "", nw: ""}],
            ["50325", 475, 475, "0025 Room Terminus 1", { ne: "", se: "", sw: "", nw: ""}],
            ["50327", 462, 462, "0026 Room Terminus 2", { ne: "", se: "", sw: "", nw: ""}],

            ["50329", 216, 216, "2-connecto", { ne: "", se: "", sw: "", nw: ""}],

            ["50359", 643, 547, "a0003 Passage", { ne: "", se: "", sw: "", nw: ""}],
            ["50361", 747, 747, "a0004 Passage Descent", { ne: "", se: "", sw: "", nw: ""}],
            ["50363", 621, 621, "a0005 Passage Descent", { ne: "", se: "", sw: "", nw: ""}],
            ["50365", 696, 696, "a0006 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50367", 752, 752, "a0007 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50369", 408, 408, "a0008 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50371", 628, 628, "a0009 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50373", 620, 620, "a0010 Passage Straight", { ne: "", se: "", sw: "", nw: ""}],
            ["50375", 634, 634, "a0011 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
            ["50377", 585, 585, "a0012 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
            ["50379", 596, 596, "a0013 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
            ["50381", 1043, 1043, "a0014 Room Large", { ne: "", se: "", sw: "", nw: ""}],
            ["50383", 1025, 1025, "a0015 flat grid", { ne: "", se: "", sw: "", nw: ""}],
            ["50385", 1365, 1365, "a0016 Room Very Large Green", { ne: "", se: "", sw: "", nw: ""}],
            ["50387", 604, 604, "a0017 Intersection Lava", { ne: "", se: "", sw: "", nw: ""}],
            ["50389", 604, 604, "a0018 Intersection X ", { ne: "", se: "", sw: "", nw: ""}],
            ["50391", 606, 606, "a0019 Intersection T", { ne: "", se: "", sw: "", nw: ""}],
            ["50393", 720, 720, "a002 Room", { ne: "", se: "", sw: "", nw: ""}],
            ["50395", 633, 633, "a0020 Intersection T", { ne: "", se: "", sw: "", nw: ""}],
            ["50397", 753, 753, "a0021 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50399", 700, 700, "a0022 Room Med", { ne: "", se: "", sw: "", nw: ""}],
            ["50401", 652, 486, "a0023 Room Med", { ne: "", se: "", sw: "", nw: ""}],
            ["50403", 1093, 1093, "a0024 Room Large", { ne: "", se: "", sw: "", nw: ""}],
            ["50405", 1172, 1172, "a0025 Room Large", { ne: "", se: "", sw: "", nw: ""}],
            ["50407", 720, 720, "b0002 Room Dark", { ne: "", se: "", sw: "", nw: ""}],
            ["50409", 643, 643, "b0003 Passage Dark Ascent", { ne: "", se: "", sw: "", nw: ""}],
            ["50411", 747, 747, "b0004 Passage Dark Descent", { ne: "", se: "", sw: "", nw: ""}],
            ["50413", 621, 621, "b0005 Passage Descent", { ne: "", se: "", sw: "", nw: ""}],
            ["50415", 696, 696, "b0006 Corner Gallery", { ne: "", se: "", sw: "", nw: ""}],
            ["50417", 752, 752, "b0007 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50419", 408, 408, "b0008 Dark Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50421", 617, 617, "b0009 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
            ["50423", 620, 620, "b0010 Passage Straight", { ne: "", se: "", sw: "", nw: ""}],
            ["50425", 634, 634, "b0011 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
            ["50427", 585, 585, "b0012 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
            ["50429", 596, 596, "b0013 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
            ["50431", 1043, 1043, "b0014 Room Large Round", { ne: "", se: "", sw: "", nw: ""}],
            ["50433", 1016, 516, "b0015 Large Flat Room Grayscale BW", { ne: "", se: "", sw: "", nw: ""}],
            ["50435", 1357, 1357, "b0016 Very Large Room", { ne: "", se: "", sw: "", nw: ""}],
            ["50437", 608, 608, "b0018 X-Intersection", { ne: "", se: "", sw: "", nw: ""}],
            ["50439", 607, 607, "b0019 T-Intersection", { ne: "", se: "", sw: "", nw: ""}],
            ["50441", 633, 633, "b0020 T-Intersection", { ne: "", se: "", sw: "", nw: ""}],
            ["50443", 678, 678, "b0021 Passage Corner Dark", { ne: "", se: "", sw: "", nw: ""}],
            ["50445", 700, 700, "b0022 Room Med Round", { ne: "", se: "", sw: "", nw: ""}],
            ["50447", 648, 648, "b0023 Room Med", { ne: "", se: "", sw: "", nw: ""}],
            ["50449", 1093, 1093, "b0024 Complex Large Room", { ne: "", se: "", sw: "", nw: ""}],
            ["50451", 1172, 1172, "b0025 Room Large Gallery", { ne: "", se: "", sw: "", nw: ""}],

            ["50331", 356, 356, "NPC Gelatinous Cube", { ne: "", se: "", sw: "", nw: ""}],
            ["50333", 280, 280, "NPC Spider", { ne: "", se: "", sw: "", nw: ""}],
            ["50335", 204, 204, "Prop Arch Light", { ne: "", se: "", sw: "", nw: ""}],
            ["50337", 204, 204, "Prop Arch", { ne: "", se: "", sw: "", nw: ""}],
            ["50339", 424, 437, "Prop Lava 2", { ne: "", se: "", sw: "", nw: ""}],
            ["50341", 194, 194, "Prop Lava", { ne: "", se: "", sw: "", nw: ""}],
            ["50343", 204, 204, "Prop Mushrooms", { ne: "", se: "", sw: "", nw: ""}],

            ["50349", 342, 342, "Prop rocks3", { ne: "", se: "", sw: "", nw: ""}],
            ["50345", 454, 454, "Prop Spiderweb2", { ne: "", se: "", sw: "", nw: ""}],
            ["50347", 379, 379, "Prop Spiderweb", { ne: "", se: "", sw: "", nw: ""}],

            ["50351", 409, 409, "Prop stalagtite 1", { ne: "", se: "", sw: "", nw: ""}],
            ["50353", 408, 408, "Prop stalagtite 2", { ne: "", se: "", sw: "", nw: ""}],
            ["50355", 292, 292, "Prop stalagtite 3", { ne: "", se: "", sw: "", nw: ""}],
            ["50357", 185, 185, "Prop stone 1", { ne: "", se: "", sw: "", nw: ""}],

            ["50867", 280, 256, "Prop Gems", { ne: "", se: "", sw: "", nw: ""}]

        ];

        var psDungeon = [
            
            ["46732", 194, 158, "Connector 2x2 Block", { ne: "", se: "", sw: "", nw: ""}],
            ["46734", 192, 99, "Connector 2x2 Flat", { ne: "", se: "", sw: "", nw: ""}],
            ["46736", 345, 194, "Connector Hall 4x2 L", { ne: "", se: "", sw: "", nw: ""}],
            ["46738", 345, 194, "Connector Hall 4x2 R", { ne: "", se: "", sw: "", nw: ""}],

            ["46744", 1024, 512, "Hall corner bottom", { ne: "", se: "", sw: "", nw: ""}],
            ["46740", 640, 640, "Hall Corner side L", { ne: "", se: "", sw: "", nw: ""}],
            ["46746", 640, 640, "Hall corner side R", { ne: "", se: "", sw: "", nw: ""}],
            ["46748", 1024, 512, "Hall corner top", { ne: "", se: "", sw: "", nw: ""}],
            ["46750", 1024, 640, "Hall straight L", { ne: "", se: "", sw: "", nw: ""}],
            ["46752", 1024, 640, "Hall straight R", { ne: "", se: "", sw: "", nw: ""}],
            ["46754", 1024, 640, "Hall t-intersection bottom L", { ne: "", se: "", sw: "", nw: ""}],
            ["46756", 1024, 640, "Hall t-intersection bottom R", { ne: "", se: "", sw: "", nw: ""}],
            ["46758", 1024, 640, "Hall t-intersection top L", { ne: "", se: "", sw: "", nw: ""}],
            ["46760", 1024, 640, "Hall t-intersection top R", { ne: "", se: "", sw: "", nw: ""}],
            ["46742", 1024, 640, "Hall X-intersection", { ne: "", se: "", sw: "", nw: ""}],
            ["46846", 144, 281, "plex.Dungeon.Torchlit.Prop.Gate.Tall.Closed.2x1.1", { ne: "", se: "", sw: "", nw: ""}],
            ["46848", 142, 281, "plex.Dungeon.Torchlit.Prop.Gate.Tall.Open.2x1.1", { ne: "", se: "", sw: "", nw: ""}],
            ["46850", 142, 281, "plex.Dungeon.Torchlit.Prop.Gate.Tall.Open.2x1.2", { ne: "", se: "", sw: "", nw: ""}],
            ["46852", 432, 394, "plex.Dungeon.Torchlit.Prop.Stairs.Bottom.1", { ne: "", se: "", sw: "", nw: ""}],
            ["46854", 432, 394, "plex.Dungeon.Torchlit.Prop.Stairs.Bottom.2", { ne: "", se: "", sw: "", nw: ""}],
            ["46856", 416, 210, "plex.Dungeon.Torchlit.Prop.Stairs.Curved.Up.1", { ne: "", se: "", sw: "", nw: ""}],
            ["46858", 416, 210, "plex.Dungeon.Torchlit.Prop.Stairs.Curved.Up.2", { ne: "", se: "", sw: "", nw: ""}],
            ["46762", 144, 170, "Prop Door Closed Double L", { ne: "", se: "", sw: "", nw: ""}],
            ["46764", 144, 170, "Prop Door Closed Double R", { ne: "", se: "", sw: "", nw: ""}],
            ["46766", 144, 185, "Prop Door Open Double L", { ne: "", se: "", sw: "", nw: ""}],
            ["46768", 144, 185, "Prop Door Open Double R", { ne: "", se: "", sw: "", nw: ""}],
            ["46770", 144, 281, "Prop Gate Tall Closed 2x1 R", { ne: "", se: "", sw: "", nw: ""}],
            ["46772", 438, 400, "Prop Stairs Top L", { ne: "", se: "", sw: "", nw: ""}],
            ["46774", 438, 400, "Prop Stairs Top R", { ne: "", se: "", sw: "", nw: ""}],
            ["46776", 205, 111, "Prop Trap SpikedPit", { ne: "", se: "", sw: "", nw: ""}],
            ["46778", 174, 222, "Prop Wall 2x1 L", { ne: "", se: "", sw: "", nw: ""}],
            ["46780", 174, 222, "Prop Wall 2x1 R", { ne: "", se: "", sw: "", nw: ""}],
            ["46782", 1024, 640, "Room 10x10 1Exit L", { ne: "", se: "", sw: "", nw: ""}],
            ["46784", 1024, 640, "Room 10x10 1Exit R", { ne: "", se: "", sw: "", nw: ""}],
            ["46786", 1024, 640, "Room 10x10 1Exit Top L", { ne: "", se: "", sw: "", nw: ""}],
            ["46788", 1024, 640, "Room 10x10 1Exit Top R", { ne: "", se: "", sw: "", nw: ""}],
            ["46790", 1024, 640, "Room 10x10 2Exits 180 L", { ne: "", se: "", sw: "", nw: ""}],
            ["46792", 1024, 640, "Room 10x10 2exits 180 R", { ne: "", se: "", sw: "", nw: ""}],
            ["46794", 1024, 640, "Room 10x10 3Exits L", { ne: "", se: "", sw: "", nw: ""}],
            ["46796", 1024, 640, "Room 10x10 3Exits R", { ne: "", se: "", sw: "", nw: ""}],
            ["46798", 1024, 640, "Room 10x10 4Exits", { ne: "", se: "", sw: "", nw: ""}],
            ["46800", 734, 504, "Room 10x10 Round 0Exits Stairs", { ne: "", se: "", sw: "", nw: ""}],
            ["46802", 734, 504, "Room 10x10 Round 0Exits", { ne: "", se: "", sw: "", nw: ""}],
            ["46804", 870, 568, "Room 10x10 Round 1Exit Bottom L", { ne: "", se: "", sw: "", nw: ""}],
            ["46806", 870, 568, "Room 10x10 Round 1Exit Bottom R", { ne: "", se: "", sw: "", nw: ""}],
            ["46808", 869, 571, "Room 10x10 Round 1Exit Top L", { ne: "", se: "", sw: "", nw: ""}],
            ["46810", 869, 571, "Room 10x10 Round 1Exit Top R", { ne: "", se: "", sw: "", nw: ""}],
            ["46812", 1008, 573, "Room 10x10 Round 2Exits Bottom", { ne: "", se: "", sw: "", nw: ""}],
            ["46814", 1024, 640, "Room 10x10 Round 2Exits Opposite L", { ne: "", se: "", sw: "", nw: ""}],
            ["46816", 1024, 640, "Room 10x10 Round 2Exits Opposite R", { ne: "", se: "", sw: "", nw: ""}],
            ["46818", 869, 625, "Room 10x10 Round 2Exits Side L", { ne: "", se: "", sw: "", nw: ""}],
            ["46820", 869, 625, "Room 10x10 Round 2Exits Side R", { ne: "", se: "", sw: "", nw: ""}],
            ["46822", 1005, 573, "Room 10x10 Round 2Exits Top", { ne: "", se: "", sw: "", nw: ""}],
            ["46824", 848, 568, "Room 6x6 1Exit bottom L", { ne: "", se: "", sw: "", nw: ""}],
            ["46826", 848, 568, "Room 6x6 1Exit bottom R", { ne: "", se: "", sw: "", nw: ""}],
            ["46828", 846, 560, "Room 6x6 1Exit top L", { ne: "", se: "", sw: "", nw: ""}],
            ["46830", 846, 560, "Room 6x6 1Exit top R", { ne: "", se: "", sw: "", nw: ""}],
            ["46836", 1010, 557, "Room 6x6 2Exits Adjacent bottom", { ne: "", se: "", sw: "", nw: ""}],
            ["46832", 848, 632, "Room 6x6 2Exits Adjacent Side L", { ne: "", se: "", sw: "", nw: ""}],
            ["46834", 848, 632, "Room 6x6 2Exits Adjacent Side R", { ne: "", se: "", sw: "", nw: ""}],
            ["46838", 1010, 553, "Room 6x6 2Exits Adjacent top", { ne: "", se: "", sw: "", nw: ""}],
            ["46840", 1024, 639, "Room 6x6 2Exits Opposite L", { ne: "", se: "", sw: "", nw: ""}],
            ["46842", 1024, 639, "Room 6x6 2Exits Opposite R", { ne: "", se: "", sw: "", nw: ""}],
            ["46844", 512, 384, "Room Block Connector 4x4", { ne: "", se: "", sw: "", nw: ""}]      
            
        ];
        
        var psSewer = [
            ["47777", 176, 206, "Prop Wall Door Interface to Dungeon L", { ne: "", se: "", sw: "", nw: ""}],
            ["47779", 176, 206, "Prop Wall Door Interface to Dungeon", { ne: "", se: "", sw: "", nw: ""}],
            ["47781", 1109, 633, "Room Large 0 exits no walls", { ne: "", se: "", sw: "", nw: ""}],
            ["47783", 1110, 766, "Room Large 0 exits", { ne: "", se: "", sw: "", nw: ""}],
            ["47785", 623, 526, "Room Medium 6x6 0 exits", { ne: "", se: "", sw: "", nw: ""}],
            ["47787", 526, 343, "Room Small 5x5 2", { ne: "", se: "", sw: "", nw: ""}],
            ["47789", 525, 445, "Room Small 5x5", { ne: "", se: "", sw: "", nw: ""}],
            ["47791", 291, 205, "Sewer Connector 3x3 no sludge", { ne: "", se: "", sw: "", nw: ""}],
            ["47793", 291, 205, "Sewer Connector 3x3 sludge", { ne: "", se: "", sw: "", nw: ""}],
            ["47795", 371, 274, "Sewer Connector Short Tunnel  Straight No-Walls L", { ne: "", se: "", sw: "", nw: ""}],
            ["47797", 364, 407, "Sewer Connector Short Tunnel Straight L", { ne: "", se: "", sw: "", nw: ""}],
            ["47799", 371, 274, "Sewer Connector Short Tunnel Straight No-Walls", { ne: "", se: "", sw: "", nw: ""}],
            ["47801", 364, 407, "Sewer Connector Tunnel Short  Straight", { ne: "", se: "", sw: "", nw: ""}],
            //["47803", 384, 760, "Sewer Effect flameJet R", { ne: "", se: "", sw: "", nw: ""}],
            //["47805", 760, 384, "Sewer Effect flameJet", { ne: "", se: "", sw: "", nw: ""}],
            ["47807", 1088, 769, "Sewer Interface to Dungeon L", { ne: "", se: "", sw: "", nw: ""}],
            ["47809", 1088, 769, "Sewer Interface to Dungeon", { ne: "", se: "", sw: "", nw: ""}],
            //["47811", 459, 237, "Sewer NPC Croc", { ne: "", se: "", sw: "", nw: ""}],
            //["47813", 512, 238, "Sewer NPC Rat", { ne: "", se: "", sw: "", nw: ""}],
            ["47815", 473, 316, "Sewer Prop Bridge 1L", { ne: "", se: "", sw: "", nw: ""}],
            ["47817", 473, 316, "Sewer Prop Bridge 1", { ne: "", se: "", sw: "", nw: ""}],
            ["47819", 446, 306, "Sewer Prop Bridge 2 L", { ne: "", se: "", sw: "", nw: ""}],
            ["47821", 446, 306, "Sewer Prop Bridge 2", { ne: "", se: "", sw: "", nw: ""}],
            //["47823", 482, 592, "Sewer Prop Fat Pipe L", { ne: "", se: "", sw: "", nw: ""}],
            //["47825", 482, 592, "Sewer Prop Fat Pipe", { ne: "", se: "", sw: "", nw: ""}],

            //["47875", 238, 280, "Sewer Prop flame jet trap 2 inactive L", { ne: "", se: "", sw: "", nw: ""}],
            //["47877", 238, 280, "Sewer Prop flame jet trap 2 inactive", { ne: "", se: "", sw: "", nw: ""}],
            //["47873", 431, 280, "Sewer Prop flame jet trap 2 L", { ne: "", se: "", sw: "", nw: ""}],
            //["47879", 431, 280, "Sewer Prop flame jet trap 2", { ne: "", se: "", sw: "", nw: ""}],
            //["47881", 437, 497, "Sewer Prop flame jet trap active 2", { ne: "", se: "", sw: "", nw: ""}],
            //["47883", 437, 497, "Sewer Prop flame jet trap active", { ne: "", se: "", sw: "", nw: ""}],
            //["47885", 232, 384, "Sewer Prop flame jet trap inactive L", { ne: "", se: "", sw: "", nw: ""}],
            //["47887", 232, 384, "Sewer Prop flame jet trap inactive", { ne: "", se: "", sw: "", nw: ""}],

            //["47827", 145, 260, "Sewer Prop Ladder L", { ne: "", se: "", sw: "", nw: ""}],
            //["47829", 145, 260, "Sewer Prop Ladder", { ne: "", se: "", sw: "", nw: ""}],
            ["47831", 240, 180, "Sewer Prop Ledge Blocks 2x3", { ne: "", se: "", sw: "", nw: ""}],
            ["47833", 531, 324, "Sewer Prop Ledge Blocks", { ne: "", se: "", sw: "", nw: ""}],
            ["47835", 226, 226, "Sewer Prop Pipe Short Outflow", { ne: "", se: "", sw: "", nw: ""}],

            //["47889", 539, 484, "Sewer Prop pipes L", { ne: "", se: "", sw: "", nw: ""}],
            //["47891", 539, 484, "Sewer Prop pipes", { ne: "", se: "", sw: "", nw: ""}],

            ["47837", 195, 106, "Sewer Prop Pit Trap 2", { ne: "", se: "", sw: "", nw: ""}],
            ["47839", 193, 104, "Sewer Prop Pit Trap 3", { ne: "", se: "", sw: "", nw: ""}],
            ["47841", 195, 106, "Sewer Prop Pit Trap", { ne: "", se: "", sw: "", nw: ""}],
            ["47843", 400, 201, "Sewer Prop Pool Round Sludge", { ne: "", se: "", sw: "", nw: ""}],
            ["47845", 99, 92, "Sewer Prop Railing Construction", { ne: "", se: "", sw: "", nw: ""}],
            ["47847", 99, 92, "Sewer Prop Railing Rust", { ne: "", se: "", sw: "", nw: ""}],
            ["47849", 258, 226, "Sewer Prop Sludge Stream Fall 2", { ne: "", se: "", sw: "", nw: ""}],
            ["47851", 258, 226, "Sewer Prop Sludge Stream Fall", { ne: "", se: "", sw: "", nw: ""}],
            ["47853", 333, 168, "Sewer Prop Sludge Stream Flat 2 L", { ne: "", se: "", sw: "", nw: ""}],
            ["47855", 333, 168, "Sewer Prop Sludge Stream Flat 2", { ne: "", se: "", sw: "", nw: ""}],
            ["47857", 401, 289, "Sewer Prop Vat Round", { ne: "", se: "", sw: "", nw: ""}],
            ["47859", 621, 338, "Sewer Prop Vat ", { ne: "", se: "", sw: "", nw: ""}],
            ["47861", 159, 243, "Sewer Prop Wall Door L", { ne: "", se: "", sw: "", nw: ""}],
            ["47863", 159, 243, "Sewer Prop Wall Door", { ne: "", se: "", sw: "", nw: ""}],
            ["47865", 159, 243, "Sewer Prop Wall Open L", { ne: "", se: "", sw: "", nw: ""}],
            ["47867", 159, 243, "Sewer Prop Wall Open", { ne: "", se: "", sw: "", nw: ""}],
            ["47869", 164, 244, "Sewer Prop Wall Solid L", { ne: "", se: "", sw: "", nw: ""}],
            ["47871", 164, 244, "Sewer Prop Wall Solid", { ne: "", se: "", sw: "", nw: ""}],

            ["47893", 1095, 795, "Sewer Room Dark 2exits adjacent side", { ne: "", se: "", sw: "", nw: ""}],
            ["47895", 1098, 765, "Sewer Room Dark Large 2exits adjacent bottom", { ne: "", se: "", sw: "", nw: ""}],
            ["47897", 1104, 796, "Sewer Room Dark Large 2exits adjacent top", { ne: "", se: "", sw: "", nw: ""}],
            ["47899", 1095, 795, "Sewer Room Dark Large 2exits opposite", { ne: "", se: "", sw: "", nw: ""}],
            ["47901", 1095, 793, "Sewer Room Dark Large 3exits bottom", { ne: "", se: "", sw: "", nw: ""}],
            ["47903", 1100, 796, "Sewer Room Dark Large 3exits top", { ne: "", se: "", sw: "", nw: ""}],
            ["47905", 1100, 794, "Sewer Room Dark Large 4 exits", { ne: "", se: "", sw: "", nw: ""}],
            ["47907", 1117, 778, "Sewer Room Lit Large 2Exits Adjacent Bottom", { ne: "", se: "", sw: "", nw: ""}],
            ["47909", 1116, 775, "Sewer Room Lit Large 2Exits Adjacent Side L", { ne: "", se: "", sw: "", nw: ""}],
            ["47911", 1116, 775, "Sewer Room Lit Large 2Exits Adjacent Side", { ne: "", se: "", sw: "", nw: ""}],
            ["47913", 1115, 771, "Sewer Room Lit Large 2Exits Adjacent Top", { ne: "", se: "", sw: "", nw: ""}],
            ["47915", 1116, 771, "Sewer Room Lit Large 2Exits Opposite L", { ne: "", se: "", sw: "", nw: ""}],
            ["47917", 1116, 771, "Sewer Room Lit Large 2Exits Opposite", { ne: "", se: "", sw: "", nw: ""}],
            ["47923", 1116, 777, "Sewer Room Lit Large 3Exits bottom L ", { ne: "", se: "", sw: "", nw: ""}],
            ["47925", 1116, 777, "Sewer Room Lit Large 3Exits bottom ", { ne: "", se: "", sw: "", nw: ""}],
            ["47919", 1113, 783, "Sewer Room Lit Large 3Exits Top L", { ne: "", se: "", sw: "", nw: ""}],
            ["47921", 1113, 783, "Sewer Room Lit Large 3Exits Top", { ne: "", se: "", sw: "", nw: ""}],
            ["47927", 1113, 777, "Sewer Room Lit Large Vat", { ne: "", se: "", sw: "", nw: ""}],
            ["47929", 1097, 537, "Sewer Tunnel Dark Corner Bottom ", { ne: "", se: "", sw: "", nw: ""}],
            ["47931", 620, 728, "Sewer Tunnel Dark Corner Side L", { ne: "", se: "", sw: "", nw: ""}],
            ["47933", 620, 728, "Sewer Tunnel Dark Corner Side", { ne: "", se: "", sw: "", nw: ""}],
            ["47935", 1084, 553, "Sewer Tunnel Dark Corner Top", { ne: "", se: "", sw: "", nw: ""}],
            ["47937", 1088, 769, "Sewer Tunnel Dark Straight", { ne: "", se: "", sw: "", nw: ""}],
            ["47939", 1088, 795, "Sewer Tunnel Dark T-Intersection Bottom L Dark", { ne: "", se: "", sw: "", nw: ""}],
            ["47941", 1088, 795, "Sewer Tunnel Dark T-Intersection Bottom ", { ne: "", se: "", sw: "", nw: ""}],
            ["47943", 1100, 771, "Sewer Tunnel Dark T-Intersection Top L", { ne: "", se: "", sw: "", nw: ""}],
            ["47945", 1100, 771, "Sewer Tunnel Dark T-Intersection Top", { ne: "", se: "", sw: "", nw: ""}],
            ["47947", 1098, 770, "Sewer Tunnel Dark X-Intersection", { ne: "", se: "", sw: "", nw: ""}],
            ["47949", 1097, 537, "Sewer Tunnel Lit Bottom", { ne: "", se: "", sw: "", nw: ""}],
            ["47951", 1084, 553, "Sewer Tunnel Lit Corner Top", { ne: "", se: "", sw: "", nw: ""}],
            ["47953", 620, 770, "Sewer Tunnel Lit Side L", { ne: "", se: "", sw: "", nw: ""}],
            ["47955", 620, 770, "Sewer Tunnel Lit Side", { ne: "", se: "", sw: "", nw: ""}],
            ["47957", 1088, 769, "Sewer Tunnel Lit Straight", { ne: "", se: "", sw: "", nw: ""}],
            ["47959", 1098, 770, "Sewer Tunnel Lit X-Intersection", { ne: "", se: "", sw: "", nw: ""}]
        ];      
        
        
        var tileDefs = psCaves.concat(psDungeon).concat(psSewer);
        
        _.each(tileDefs, function(tileDef) { 
            marketplaceTiles.push(new tile(tileDef[0], tileDef[1], tileDef[2], tileDef[3], tileDef[4]));
        });

    
    };  
    
    
// ******************************************************************************** 
    
    

    var whisper = function chatMessageSender(playerName, message) {
        // sends a chat message to a specific player. Can use gm as playerName
        sendChat("psTileResizer Script", '/w ' + playerName + " " + message);
    };

    var makeButton = function buttonMakerForChat(title, command) { // expects two strings. Returns encoded html for the chat stream
        var output = '['+title+']('+command+')';
        return output;
    };

    var ch = function (c) {
    // This function will take a single character and change it to it's equivalent html encoded value.
        // psNote: I tried alternate methods of regexps to encode the entire string, but I always ran into problems with | and [] characters.
        var entities = {
            '<' : 'lt',
            '>' : 'gt',
            "'" : '#39',
            '@' : '#64',
            '{' : '#123',
            '|' : '#124',
            '}' : '#125',
            '[' : '#91',
            ']' : '#93',
            '"' : 'quot',
            '-' : 'mdash',
            ' ' : 'nbsp'
        };

        if(_.has(entities,c) ){
            return ('&'+entities[c]+';');
        }
        return '';
    };
    

    
    var getCurrentPage = function pageGetter(playerID) {
        // this should check Campaign.get and GM.lastpage

        var playerObj = getObj("player", playerID);
        var playerspecificpages = Campaign().get("playerspecificpages");
        
        if (playerIsGM(playerID) && _.has(playerObj, "lastpage" )) {
            return playerObj.lastpage;          
        } else if ( Boolean(playerspecificpages) && _.has(playerspecificpages, playerID) ) {
            return Campaign().get("playerspecificpages")[playerID];
        } else {
            return Campaign().get("playerpageid");  // the player ribbon. most common       
        }
    };
    
    var findGM = function GMFinder() {
        var players = findObjs({type: "player"});
        var GM = _.find(players, function(player) { 
            return playerIsGM(player.get("id"));
        });
        return GM;
    };


    
    var getMarketplaceID = function marketplaceIDGetter(tileID) {
        if( tileID !== undefined ) {
            var tileObj = getObj("graphic", tileID);
            var tileImgSrc = tileObj.get("imgsrc");
            
            var pathChunks = tileImgSrc.split("/");
            var tileMarketplaceID = pathChunks[5];
            
            //whisper("gm", "tileMarketplaceID: " + tileMarketplaceID );
            
            //tileObj.set("showname", true);
            //tileObj.set("name", tileMarketplaceID);
            //tileObj.set("layer", "objects");
                
            return tileMarketplaceID;           
        }
    };
    
    
    var resizeTiles = function tileResizer(pageID, tileID, playerID) {
        // resize all the map tiles with known id and size in our wee database
        
        // parameters verification
        if (Boolean(playerID) === false) {
            playerID = findGM();
        }
        
        if (Boolean(tileID) === false) {
            tileID = "all";
        }
        
        if (Boolean(pageID) === false) {            
            var page = getCurrentPage(); 
        }
        
        if (tileID !== "all") {
            
            
            var tileMarketplaceID = getMarketplaceID(tileID);
            var template = _.findWhere(marketplaceTiles, {marketplaceID: tileMarketplaceID} );
            
            if (template !== undefined ) {

                var tileObj = getObj("graphic", tileID);
                // resize it
                
                tileObj.set({
                    width: template.width,
                    height: template.height             
                });                                     
            

            } else {
                // whisper("gm", "couldn't find the right template");
            }

        } else { // resize everything you can find
            var possibleMapTiles = findObjs({ type: "graphic", layer: "map" });
            
            _.each(possibleMapTiles, function(tile) {
                _.each(marketplaceTiles, function(template) {
                    if ( template.marketplaceID !== "" && tile.get("imgsrc").indexOf(template.marketplaceID) !== -1 ) { // found one 
                        
                        tile.set({ width: template.width, height: template.height });                           
                        
                    }
                });
            
            });
            
            
        }
        
        //whisper("gm", "received a request to resize tile " + tileID);
        
    };
    
    var handleInput = function inputHandler(msg) {
            
        if (msg.type == "api" && ( msg.content.indexOf("!psResize") !== -1 || msg.content.indexOf("!psTileResizer") !== -1 ) ) {

            var argsFromUser,
                who,
                errors=[],
                playerID,
                playerName,
                pageID,
                tileID,
                requestedToggle,
                userCommand;


            playerName = msg.who;
            playerID = msg.playerid;

            argsFromUser = msg.content.split(/ +/);
            userCommand = argsFromUser[1];
            tileID = argsFromUser[2];           
            requestedToggle = argsFromUser[2];

            //whisper("gm", "heard: " + userCommand);
            //whisper("gm", "heard: " + tileID);
            
            
            
            switch(userCommand) {
                case '--resize' :
                    // resize marketplace tiles
                        // if you get a token id, resize that one.
                        // otherwise, resize everything? any way to get a confirmation first?
                    
                    if (Boolean(tileID) === false || tileID == "all") {
                            resizeTiles(pageID, "all", playerID);
                    } else {
                        resizeTiles(pageID, tileID, playerID);
                    }
                    
                break;
                case '--getMarketplaceID':
                    
                    getMarketplaceID(tileID);
                    
                
                break;
                
                case "--on":
                    config.resizeOnAdd = true;
                break;
                
                case "--off":
                    config.resizeOnAdd = false;
                break;
                
                case "--toggle":
                    if ( requestedToggle == "resizeOnAdd") { 
                        config.resizeOnAdd = !config.resizeOnAdd;
                        if (config.resizeOnAdd) {
                            whisper("gm", "Plexsoup isometric assets will now resize automatically when you drop them on the map");                         
                        } else {
                            whisper("gm", "Plexsoup isometric assets will not resize automatically anymore. See help for more options.");
                        }

                    }
                
                break;
                
                case '--help':
                    getHelp();
                break;
                
                case undefined:
                    getHelp();
                break;
            }
            //getHelp();
        }
    };

    
    var showDetailedHelp = function showDetailedHelpTextInChat(playerName) {
        
        if (!playerName) { playerName = "gm";}



        var exampleStyle = '"background-color: #eee; font-size: smaller; margin-left: 40px;"';
        var warningStyle = '"background-color: AntiqueWhite; font-size: smaller;"';
        var exampleTokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');

        var helpText = '';

        helpText += '<div style="font-size: smaller;">';
        helpText += 'psTileResizer is a script to resize isometric marketplace tiles to their original, intended dimensions.';
        helpText += "This dramatically helps lining up tiles for setting up dungeon-crawls.";
        helpText += "</div>";

        helpText += '<div style="font-size: smaller;">';        
        helpText += "To start, enter !psResizer in the chat window.";
        helpText += "</div>";
        
        helpText += '<div style="font-size: smaller;">';        
        helpText += "Configuration options to be aware of: ";
        helpText += "<ul>";
        helpText +=         "<li>Toggle On/Off - turns on automatic resizing, triggered whenever a plexsoup marketplace tile is added to the map.</li>";
        helpText += "</ul>";
        helpText += "</div>";
        

        
        helpText += "<div style='font-size: smaller'>";
        helpText += "In addition to the gui buttons, you can make macros to activate the features. Here are some commands to play with.";
        helpText +=         '<div style='+ exampleStyle +'> !psResize</div>';
        helpText +=         '<div style='+ exampleStyle +'> !psResize --resize all</div>';
        helpText +=         '<div style='+ exampleStyle +'> !psResize --resize ' + exampleTokenSelect + '</div>';       
        helpText +=         '<div style='+ exampleStyle +'> !psResize --toggle resizeOnLoad</div>';
        

        
        //whisper(playerName, helpText );
        var helpHandouts;
        helpHandouts = findObjs({
            _type: "handout",
            name: "psResize Help"
        });

        var helpHandout = helpHandouts[0];
        //log("helpHandout = " + helpHandout);
        
        if (!helpHandout) { // create it
            helpHandout = createObj('handout', {
                name: 'psResize Help',
                inplayerjournals: 'all'
            });
            helpHandout.set("notes", helpText);

        } else { // it exists, set it's contents to match the latest version of the script
            helpHandout.set("notes", helpText);
        }
        var handoutID = helpHandout.get("_id");

        var chatMessage = "";
        var buttonStyle = "'background-color: AntiqueWhite; text-align: center'";
        
        chatMessage += "<div style="+buttonStyle+"><a href='http://journal.roll20.net/handout/" + handoutID + "'>Additional Information</a></div>";
        
        return(chatMessage);
    };

    
    var getHelp = function helpGetter() {
        
        var helpText = "";
        
        helpText += "<div style='text-align: center;'>";
        
        helpText += makeButton("Toggle On/Off", "!psResize --toggle resizeOnAdd");
        helpText += makeButton("Resize all", "!psResize --resize all");
        
        var tokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');
        helpText += makeButton("Resize Selected", "!psResize --resize " + tokenSelect );
        
        //helpText += makeButton("!psResize --getMarketplaceID", "!psResize --getMarketplaceID " + tokenSelect );

        helpText += "</div>";
        helpText += showDetailedHelp("gm");
        whisper("gm", helpText);
        
    };

    var getStatus = function statusGetter() {
        whisper("gm", "config: " + JSON.stringify(config) );
        whisper("gm", "tiles: " + JSON.stringify(marketplaceTiles) );
        
    };
    
    var registerEventHandlers = function() {
        on('chat:message', handleInput );
        

        
        on("add:graphic", function(obj) {
            if ( temp.campaignLoaded && config.resizeOnAdd ) { // don't futz with the graphics already in the campaign.
                // only after the campaign is loaded, for all new tiles, check to see if they need resizing.
                resizeTiles( getCurrentPage(), obj.get("id"), findGM() );               
            } else {
                log("temp.campaignLoaded: " + temp.campaignLoaded + ", config.resizeOnAdd: " + config.resizeOnAdd );
            }

        });
        
    };

    var checkInstall = function() {
        if ( Boolean(state.psMarketplaceResizer) === false ) {
            state.psMarketplaceResizer = { 
                info: info,
                config: config
            };
        }
    };

    var initialize = function() {
        temp.campaignLoaded = true; // help on(add:graphic) know not to mess with all the graphics already in the campaign
        //log("temp.campaignLoaded: " + temp.campaignLoaded);       
    };
    
    return { // make these functions available outside the local namespace
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
        PopulateDatabase: populateDatabase,
        GetHelp: getHelp,
        GetStatus: getStatus,
        Initialize: initialize
    };


}());







on("ready", function() {
         
    //init();
    psTileResizer.CheckInstall();
    psTileResizer.Initialize();
    psTileResizer.RegisterEventHandlers();
    psTileResizer.PopulateDatabase();
    psTileResizer.GetHelp();
    //psTileResizer.GetStatus();
    

});

*******************************************************************************
// psIsoFacingAndView

/*
                                                                                        
                            _/_/_/      _/_/_/      _/_/_/    _/_/_/    _/_/    
                           _/    _/  _/              _/    _/        _/    _/   
                          _/_/_/      _/_/          _/      _/_/    _/    _/    
                         _/              _/        _/          _/  _/    _/     
                        _/        _/_/_/        _/_/_/  _/_/_/      _/_/        
                                                                                
                                                                                
                                                                                    
                       _/_/_/_/    _/_/      _/_/_/  _/_/_/  _/      _/    _/_/_/   
                      _/        _/    _/  _/          _/    _/_/    _/  _/          
                     _/_/_/    _/_/_/_/  _/          _/    _/  _/  _/  _/  _/_/     
                    _/        _/    _/  _/          _/    _/    _/_/  _/    _/      
                   _/        _/    _/    _/_/_/  _/_/_/  _/      _/    _/_/_/     

*/

/*
    Purpose:
        1. Provide a directional flashlight which rotates independently of the parent token.
        2. Flip the parent token on the horizontal axis because players can't fliph themselves.

        Designed for side-view tokens on isometric or 8bit maps, but should work for top-down as well.

    Usage:
        Once installed, turn on the yellow status marker for your token to turn on the flashlight.
        Turn on the boot (tread) status marker to turn on auto-facing.
        For menu: type !psIsoFacing in chat.
*/

// **** TODO
    // should probably separate facing and flashlight functionality, so people can use flashlight without facing.
        // alternatively, allow 360 degree rotation for facing, instead of flipH, to top-down maps

// BUGS
    // something's weird about the install routine.. sometime's a character doesn't switch direction until the second move.

var psIsoFacing = psIsoFacing || (function plexsoupIsoFacing() {
    "use strict";
    var debug = false;


    var defaultConfig = {
        scriptIsActive: true,
        whisperErrors: true,
        useTreadStatusForFacing: true, // true: tokens are active when they have a yellow status; false: tokens have to be registered through the gui.
        useYellowStatusForLight: true,
        light_radius: 40,
        light_dimradius: 20,
        light_angle: 90     
    };

    var config = _.clone(defaultConfig);
    
    var info = {
        scriptName: "psIsoFacing",
        version: 0.15,
        authorName: "plexsoup"
    };

    var travellers = {}; // dictionary of objects for side-view tokens actively moving and changing directions. key: tokenID, value: travellerObj
    var flashlights = {}; // dictionary of objects for flashlights (or navi from Legend of Zelda) which follow the characters around and rotate based on vector from tokens lastmove

    var ICONS = { // note: Roll20 has particular rules about imgsrc. See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions
        torch: "https://s3.amazonaws.com/files.d20.io/images/17247606/Wbr841_bq9ka1FmamWo38w/thumb.png?1458169656",
        transparent: "https://s3.amazonaws.com/files.d20.io/images/27023509/jDIhDrjr_RyUxq5ldQj1uw/thumb.png?1483683924",
        scifi: "https://s3.amazonaws.com/files.d20.io/images/27025190/VrSyw_oHrsM8cfdBPcfLHw/thumb.png?1483690176"
    };  
    

    
    
/*

     _/_/_/    _/_/    _/      _/    _/_/_/  _/_/_/_/_/  _/_/_/    _/    _/    _/_/_/  _/_/_/_/_/   
  _/        _/    _/  _/_/    _/  _/            _/      _/    _/  _/    _/  _/            _/        
 _/        _/    _/  _/  _/  _/    _/_/        _/      _/_/_/    _/    _/  _/            _/         
_/        _/    _/  _/    _/_/        _/      _/      _/    _/  _/    _/  _/            _/          
 _/_/_/    _/_/    _/      _/  _/_/_/        _/      _/    _/    _/_/      _/_/_/      _/           

*/  
    


    
    var travellerObj = function travellerClass(tokenID) { // note: roll20 state variable can only store simple properties. No functions
        this.direction = 1; // right is 1, left is -1
        this.tokenID = tokenID;
    };  
    
    var instantiateTravellerMethods = function(traveller) { // note: only operates on a single instance at a time. Call with _.each(travellers) if you need them all.
        
        traveller.changeDirection = function() { 
            traveller.direction *= -1;
            var token = getObj("graphic", traveller.tokenID);
            if (token !== undefined ) {
                token.set("fliph", !token.get("fliph") );
            }
        };
    
        traveller.remove = function() {
        // Note: there's no js mechanism to destroy myself, so we'll assume that chrome will manage memory when the reference is gone.                                      
            // delete traveller; // take myself out of the dictionary
        };          
    
        
        // note: we store travellerObj's in state, but state can only handle simple objects with simple datatypes: ie: no methods.
        // let's use the prototype property to add methods back to all travellerObj's once we rebuild travellers from state.
        
    };  


    

    var flashlightObj = function flashlightClass(tokenID) { // note: roll20 state variable can only store simple properties. No functions
        this.unitVector = [0,1];
        this.parentID = tokenID;
        this.turnedOn = false;
        this.lightID = "";
        this.deleteMe = false;
        
    };

    var instantiateFlashlightMethods = function(flashlight) { // note: only operates on a single instance at a time. Call with _.each if you need more.
    
        flashlight.changeOrientation = function() {
            
        }; 
        
        /*
        flashlight.turnOff = function() {
            
            var lightGraphic = getObj("graphic", flashlight.lightID);
            if (lightGraphic) {
                
                flashlight.deleteMe = true; // **** TODO **** Needs work.. when are you actually going to do this cleanup?              
                
                lightGraphic.remove();
                
                //mark for deletion and then do cleanup / garbage collection from outside the object.
                //delete flashlights[flashlight.parentID]; // doesn't work from inside the object
                
            }
        };
        */
        
        // flashlight.remove = flashlight.turnOff;

        flashlight.follow = function() {
            var lightGraphic = getObj("graphic", flashlight.lightID);
            var parentGraphic = getObj("graphic", flashlight.parentID);
            
            if (lightGraphic && parentGraphic) { // error checking in case someone deleted either of those tokens


                // lights don't follow tokens in realtime, they kind of float after them like ghosts.
                // instead of moving them, we're going to destroy the old one and create a new one.
                
                lightGraphic.remove(); // remove the old graphic object
                
                flashlight.lightID = createFlashlightToken(flashlight.parentID);
                var desiredRotation = flashlight.getRotation();
                if (debug) psLog("desiredRotation = " + desiredRotation);

                var newLightGraphic = getObj("graphic" , flashlight.lightID);
                if (newLightGraphic) {
                    newLightGraphic.set("rotation", desiredRotation );                  
                }

            
            } else {
                psLog("==> Error: flashlight.follow cannot execute because one of the tokens no longer exists.");
                psLog("light token: " + lightGraphic);
                psLog("parent token: " + parentGraphic);
                // reset(); // **** TODO **** This is a little heavy handed, don't you think?
            }

        };
        
        flashlight.getRotation = function() {
            var lightObj = getObj("graphic", flashlight.lightID);
            var parentObj = getObj("graphic", flashlight.parentID);
            var lastMoveStr = parentObj.get("lastmove");
            var rotation = 0; // straight up
            
            if (lastMoveStr !== "") {
                var lastLocationArr = lastMoveStr.split(","); // Note: these are strings.
                if (debug) psLog("lastLocationArr = " + lastLocationArr);
                if (debug) psLog("currentLocation = " + [parentObj.get("left"), parentObj.get("top")]);
                
                var lastLocation = new psPoint( Number(lastLocationArr[0]), Number(lastLocationArr[1]) );
                var point1 = new psPoint(lastLocation.x, lastLocation.y);
                var point2 = new psPoint(parentObj.get("left"), parentObj.get("top"));

                if (debug) psLog("point1 = " + JSON.stringify(point1) + ", point2 = " + JSON.stringify(point2));
                var directionVector = makeVector(point1, point2);
                if (debug) psLog("directionVector == " + JSON.stringify(directionVector), "turquoise");             
                var degrees = vectorToRoll20Rotation(directionVector);
                if (debug) psLog("flashlight.getRotation("+ JSON.stringify(point1) + ", "  + JSON.stringify(point2) + ") says degrees = " + degrees, "LightBlue");
                
                rotation = degrees;
            }
            
            return rotation;
            
        };
    };


    var lightFlashlight = function(tokenID) {
        flashlights[tokenID] = new flashlightObj(tokenID);
        instantiateFlashlightMethods(flashlights[tokenID]);
        flashlights[tokenID].lightID = createFlashlightToken(tokenID);  
        flashlights[tokenID].turnedOn = true;
        return flashlights[tokenID].lightID;
        
        
    };
    
    var extinguishFlashlight = function(tokenID) {
        // this removes the token and removes the flashlightObj from the list of "flashlights"
        
        if (flashlights[tokenID]) {
            var flashlightGraphic = getObj("graphic", flashlights[tokenID].lightID);
            if (flashlightGraphic !== undefined && flashlightGraphic.get("gmnotes").indexOf(tokenID) !== -1 ) {
                flashlightGraphic.remove();
                delete flashlights[tokenID];
            }
        }
    };
    
    var createFlashlightToken = function flashlightTokenCreator(parentTokenID) { // returns tokenID of new flashlight graphic object
        var parentToken = getObj("graphic", parentTokenID);
        var parentTokenName = parentToken.get("name");
        if (debug) psLog("entered createFlashlightToken for "+ parentTokenName + " - " + parentTokenID);

        var token = createObj("graphic", {
            imgsrc: ICONS.transparent,
            light_radius: config.light_radius,
            light_dimradius: config.light_dimradius,
            light_otherplayers: true,
            light_hassight: false,
            light_angle: config.light_angle,
            pageid: parentToken.get("pageid"),
            layer: parentToken.get("layer"),
            left: parentToken.get("left"),
            top: parentToken.get("top"),
            name: "flashlight",
            showname: false,
            aura1_radius: "",
            showplayers_aura1: false,
            width: parentToken.get("width")/4,
            height: parentToken.get("height")/4
            
        }); 

        if (token) {
            token.set("gmnotes", parentTokenID);
            if (debug) psLog("createFlashlightToken Just created a token: " + token.get("_id") + " for " + parentTokenName);    
            if (debug) psLog("Flashlight Token: " + token.get("_id") );
        }
        
        if (parentToken === undefined) {
            if (debug) psLog("==> Error in createFlashlightToken. parentTokenID = " + parentTokenID);
        }
        //toBack(token);
        
        var tokenID = token.get("_id");
        if (debug) psLog("leaving createFlashlightToken. Returning " + tokenID);
        return tokenID;
    };
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    var whisper = function chatMessageSender(playerName, message) {
        // sends a chat message to a specific player. Can use gm as playerName
        //sendChat(playerName, '/w ' + playerName + " " + message);
        sendChat("psIsoFacing", '/w ' + playerName + " " + message);
    };
    
    var ch = function (c) {
        // This function will take a single character and change it to it's equivalent html encoded value.
        // psNote: I tried alternate methods of regexps to encode the entire string, but I always ran into problems with | and [] characters.
        var entities = {
            '<' : 'lt',
            '>' : 'gt',
            "'" : '#39',
            '@' : '#64',
            '{' : '#123',
            '|' : '#124',
            '}' : '#125',
            '[' : '#91',
            ']' : '#93',
            '"' : 'quot',
            '-' : 'mdash',
            ' ' : 'nbsp'
        };

        if(_.has(entities,c) ){
            return ('&'+entities[c]+';');
        }
        return '';
    };

    var inString = function stringFinder(stringToSearch, textToLookFor) {
        // I use this instead of indexof because I hate type converting indexOf, which produces -1 instead of false.
        
        if (!stringToSearch || !textToLookFor) {
            // log("==> Error: inString() missing params" + stringToSearch + ", " + textToLookFor);
            return undefined;
        }
        if ( stringToSearch.indexOf(textToLookFor) == -1 ) {
            return false;
        } else {
            return true;
        }
    };
    
    var makeButton = function buttonMakerForChat(title, command) { // expects two strings. Returns encoded html for the chat stream
        var output="";

            output += '['+title+']('+command+')';

        return output;
    };  

    var psLog = function ErrorLogger(message, backgroundColor) {
        if (!backgroundColor) { 
            backgroundColor = "Gainsboro"; 
        }
        var simpleOutputStr = info.scriptName + ": " + message;
        log(simpleOutputStr);
        var styledOutputStr = "<div style='font-size: smaller; background-color: " + backgroundColor + ";'>" + info.scriptName + ": " + message + "</div>";
        if (config.whisperErrors) 
            whisper("gm", styledOutputStr );
    };

/*


                                            
        _/    _/  _/_/_/_/  _/        _/_/_/    
       _/    _/  _/        _/        _/    _/   
      _/_/_/_/  _/_/_/    _/        _/_/_/      
     _/    _/  _/        _/        _/           
    _/    _/  _/_/_/_/  _/_/_/_/  _/            
                                                

*/  

    
    var showDetailedHelp = function showDetailedHelpTextInChat(playerName) {
        
        if (!playerName) { playerName = "gm";}

        var exampleStyle = '"background-color: #eee; font-size: smaller; margin-left: 40px; margin-bottom: 3px; "';
        var warningStyle = '"background-color: AntiqueWhite; font-size: smaller;"';
        var exampleTokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');

        var helpText = '';

        helpText += '<div style="font-size: smaller;">';
        helpText += 'psIsoFacing is a script to automatically change facing (flip horizontal) for tokens on isometric maps.';
        helpText += "This makes movement look more realistic. Otherwise, players wouldn't have access to flipH.";
        helpText += "</div>";

        helpText += '<div style="font-size: smaller;">';        
        helpText += "To start, enter !psIsoFacing in the chat window.";
        helpText += "</div>";
        
        helpText += '<div style="font-size: smaller;">';        
        helpText += "Configuration options to be aware of: ";
        helpText += "<ul>";
        helpText +=     "<li>Tokens only change facing if they represent a character and they're controlled by someone.</li>";
        helpText +=     "<li>By default, they won't change facing unless their 'tread' status indicator is on (it looks like a boot).</li>";
        helpText +=     "<li>If you prefer not to use the tread status indicator, you can 'Toggle Use Tread Status Indicator'. Then, you'll have to 'Register token for Travelling'</li>";
        helpText += "</ul>";
        helpText += "</div>";
        

        
        helpText += "<div style='font-size: smaller'>";
        helpText += "In addition to the gui buttons, you can make macros to activate the features. Here are some commands to play with.";
        helpText +=         '<div style='+ exampleStyle +'> !psIsoFacing</div>';
        helpText +=         '<div style='+ exampleStyle +'> !psIsoFacing --register ' + exampleTokenSelect + '</div>';      
        helpText +=         '<div style='+ exampleStyle +'> !psIsoFacing --deregister ' + exampleTokenSelect + '</div>';
        helpText +=         '<div style='+ exampleStyle +'> !psIsoFacing --fliph ' + exampleTokenSelect + '</div>';
        helpText +=         '<div style='+ exampleStyle +'> !psIsoFacing --reset</div>';

        
        //whisper(playerName, helpText );
        var helpHandouts;
        helpHandouts = findObjs({
            _type: "handout",
            name: "psIsoFacing Help"
        });

        var helpHandout = helpHandouts[0];
        //log("helpHandout = " + helpHandout);
        
        if (!helpHandout) { // create it
            helpHandout = createObj('handout', {
                name: 'psIsoFacing Help',
                inplayerjournals: 'all'
            });
            helpHandout.set("notes", helpText);

        } else { // it exists, set it's contents to match the latest version of the script
            helpHandout.set("notes", helpText);
        }
        var handoutID = helpHandout.get("_id");

        var chatMessage = "";
        var buttonStyle = "'background-color: AntiqueWhite; text-align: center'";
        
        chatMessage += "<div style="+buttonStyle+"><a href='http://journal.roll20.net/handout/" + handoutID + "'>Additional Information</a></div>";
        
        return(chatMessage);
    };

    
    var getHelp = function helpGetter() {
        
        var helpText = "";
        
        helpText += "<div style='text-align: center;'>";
        

        helpText += makeButton("Status", "!psIsoFacing --status");
        helpText += makeButton("Toggle On/Off for all", "!psIsoFacing --toggle all");       
        
        var tokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');
        var tokenTarget = ch('@') + ch('{') + 'target' + ch('|') + 'token_id' + ch('}');
        helpText += makeButton("Register token for Travelling", "!psIsoFacing --register " + tokenTarget );
        helpText += makeButton("De-Register token for Travelling", "!psIsoFacing --deregister " + tokenTarget );
        helpText += makeButton("Toggle Use Tread Status Indicator", "!psIsoFacing --toggle tread");
        helpText += makeButton("Flip Horizontal", "!psIsoFacing --fliph " + tokenTarget);
        helpText += makeButton("Reset", "!psIsoFacing --reset ");

        helpText += "</div>";
        helpText += showDetailedHelp("gm");
        whisper("gm", helpText);
        
    };

    var hasPermissions = function permissionIdentifier(tokenID, playerID) {
        var tokenObj = getObj("graphic", tokenID);
        var characterID = tokenObj.get("represents");
        var playerHasPermission = false;
        
        if (playerIsGM(playerID)) {
            playerHasPermission = true;
        } else if (tokenObj.get("controlledby").indexOf(playerID) !== -1) {
            playerHasPermission = true;
        } else if ( characterID !== undefined ) {
            var character = getObjs("character", characterID);
            if (character.get("controlledby").indexOf(playerID) !== -1 ) {
                playerHasPermission = true;
            }
        } else {
            playerHasPermission = false;
        }

        if (debug) log("hasPermissions("+tokenID+", "+ playerID + ") is returning: " + playerHasPermission);
        return playerHasPermission;
        
    };


    var flipTokenIfPermitted = function tokenFlipper(tokenID, playerID) {
        if (hasPermissions( tokenID,  playerID)) { // make sure players can't flip someone else's token                     
            var tokenObj = getObj("graphic", tokenID);
            tokenObj.set("fliph",!tokenObj.get("fliph"));
        }   
    };
    
/*
                                                             
        _/_/_/  _/      _/  _/_/_/    _/    _/  _/_/_/_/_/   
         _/    _/_/    _/  _/    _/  _/    _/      _/        
        _/    _/  _/  _/  _/_/_/    _/    _/      _/         
       _/    _/    _/_/  _/        _/    _/      _/          
    _/_/_/  _/      _/  _/          _/_/        _/           
                                                            
              
*/     
    
    var handleInput = function inputHandler(msg) {
            
        if (msg.type == "api" && msg.content.indexOf("!psIsoFacing") !== -1 ) {

            var argsFromUser,
                who,
                errors=[],
                playerID,
                playerName,
                pageID,
                tokenID,
                requestedToggle,
                userCommand;


            playerName = msg.who;
            playerID = msg.playerid;

            argsFromUser = msg.content.split(/ +/);
            userCommand = argsFromUser[1];
            tokenID = argsFromUser[2];          
            requestedToggle = argsFromUser[2];

            //whisper("gm", "heard: " + userCommand);
            //whisper("gm", "heard: " + tokenID);
            
            
            switch(userCommand) {               
                case "--on":
                    config.resizeOnAdd = true;
                break;
                
                case "--off":
                    config.resizeOnAdd = false;
                break;
                
                case "--status":
                    getStatus();
                    
                break;
                case "--toggle":
                    if ( requestedToggle == "all") { 
                        config.scriptIsActive = !config.scriptIsActive;
                        whisper("gm", "config.scriptIsActive = " + config.scriptIsActive);

                    } else if (requestedToggle == "tread") {
                        config.useTreadStatusForFacing = !config.useTreadStatusForFacing;
                        whisper("gm", "config.useTreadStatusForFacing = " + config.useTreadStatusForFacing);
                    
                    
                    } else { // assume requested toggle is tokenID
                        if (_.has(travellers, tokenID) ) {
                            travellers[tokenID].remove();
                        } else {
                            registerTokenForFacing(tokenID);
                        }
                    }
                
                break;
                
                case '--fliph':
                    flipTokenIfPermitted(tokenID, playerID);
                

                break;
                
                case '--register':
                    registerTokenForFacing(tokenID);
                break;
                
                case '--deregister':
                    deregisterTokenForFacing(tokenID);
                break;
                    
                
                case '--help':
                    getHelp();
                break;
                
                case '--reset':
                    reset(getCurrentPage(playerID));
                break;

                case '--resetall':
                    _.each(allActivePages(), function(pageID) {
                        reset(pageID);  
                    });
                break;
                
                case undefined:
                    getHelp();
                break;
                
                case '--inspect':
                    if (getObj("graphic", tokenID) !== undefined) {
                        if (debug) psLog("properties of " + JSON.stringify(getObj("graphic", tokenID)), "DarkKhaki");                       
                    }

                break;
            }
            
            
        }
    };  


/*

        _/_/_/    _/_/_/_/    _/_/_/  _/_/_/    _/_/_/  _/_/_/_/_/  _/_/_/_/  _/_/_/    
       _/    _/  _/        _/          _/    _/            _/      _/        _/    _/   
      _/_/_/    _/_/_/    _/  _/_/    _/      _/_/        _/      _/_/_/    _/_/_/      
     _/    _/  _/        _/    _/    _/          _/      _/      _/        _/    _/     
    _/    _/  _/_/_/_/    _/_/_/  _/_/_/  _/_/_/        _/      _/_/_/_/  _/    _/     

*/  
    
    // **** What are you trying to achieve here? Is this supposed to be an on/off toggle, or what?
        // If you rely on the tread or yellow status indicator, then you don't need a register routine.
        // But, too many status indicators makes the token look ugly.
    var registerTokenForFacing = function tokenFacingRegistrar(tokenID) {
        if (debug) psLog("in registerTokenForFacing with " + tokenID);
        
        if (tokenID === undefined || getObj("graphic", tokenID) === undefined ) {
            log("Error: registerTokenForFacing called without a tokenID parameter.");
            return false;
        } else if ( _.has(travellers, tokenID) === false ) { // this token is not yet registered
            travellers[tokenID] = new travellerObj(tokenID);
            instantiateTravellerMethods(travellers[tokenID]);
            whisper("gm", "registered " + tokenID);
            whisper("gm", "travellers = " + _.keys(travellers) );
            return travellers[tokenID]; // travellerObj
        } else { // this token is already registered.
            whisper("gm", "token: " + tokenID + " is already registered");
            return travellers[tokenID]; // returning a travellerObj         
        }
        
    };

    /* This never gets called?
    var registerTokenForFlashlight = function flashlightRegistrar(tokenID) {
        if (debug) psLog("in registerTokenForFlashlight with " + tokenID);
        
        if (tokenID === undefined || getObj("graphic", tokenID) === undefined ) {
            log("Error: registerTokenForFlashlight called without a tokenID parameter.");
            return false;
        } else if ( _.has(flashlights, tokenID) === false ) { // this token is not yet registered
            //flashlights[tokenID] = new flashlightObj(tokenID);
            lightFlashlight(tokenID);
            
            return flashlights[tokenID]; // travellerObj
        } else { // this token is already registered.
            whisper("gm", "token: " + tokenID + " is already registered");
            return flashlights[tokenID]; // returning a travellerObj            
        }
    };
    */
    
    var deregisterTokenForFacing = function tokenDeRegistrar(tokenID){
        log("in deregisterTokenForFacing with " + tokenID);
        
        if (_.has(travellers, tokenID) ) {
            var thisTraveller = travellers[tokenID];            
            thisTraveller.remove();
        }
    };

    var deregisterTokenForFlashlight = function flashlightDeRegistrar(tokenID){
        if (debug) psLog("in deregisterTokenForFlashlight with " + tokenID);
        
        if (_.has(flashlights, tokenID) ) {
            var thisFlashlight = flashlights[tokenID];          
            //thisFlashlight.remove();
            extinguishFlashlight(tokenID);
        }
    };
    

    
    
    var getLastLocation = function lastLocationGetter(token) {
        
        //if (debug) psLog("lastmove for " + token.get("name") + ", " + token.get("_id") + " = " + token.get("lastmove") );
        var movementPath = token.get("lastmove").split(",");
        
        var lastLocation = [];
        
        lastLocation[0] = Number(movementPath[0]); // important to type convert them into numbers
        lastLocation[1] = Number(movementPath[1]);
        
        return lastLocation;
        
    };
    

    var isTokenOwned = function ownerChecker(tokenObj) {
        var controlledby = tokenObj.get("controlledby");
        var represents = tokenObj.get("represents");
        // log("name: " + tokenObj.get("name") + ", controlledby: " + controlledby + ", represents: " + represents);
        if ( !controlledby && !represents ) {
            // log("tokenIsOwned === false"); 
            return false;
        } else {
            // log("tokenIsOwned === true");
            return true;
        }   
    };

/*

        _/_/_/  _/      _/    _/_/_/  _/_/_/    _/_/_/_/    _/_/_/  _/_/_/_/_/   
         _/    _/_/    _/  _/        _/    _/  _/        _/            _/        
        _/    _/  _/  _/    _/_/    _/_/_/    _/_/_/    _/            _/         
       _/    _/    _/_/        _/  _/        _/        _/            _/          
    _/_/_/  _/      _/  _/_/_/    _/        _/_/_/_/    _/_/_/      _/           
                                                                                

*/

    var getStatus = function statusGetter() {
        whisper("gm", "Info: " + JSON.stringify(info) );
        whisper("gm", "Config: " + JSON.stringify(config) );        
        whisper("gm", "Active Travellers: " + _.keys(travellers) );
        whisper("gm", "Active Flashlights: " + _.keys(flashlights) );
    };

    
    var isTokenMarching = function activeChecker(tokenObj) {
        //log("entered function isTokenMarching with " + JSON.stringify(tokenObj));
        var result = false;
        
        if (!config.scriptIsActive) { // don't do anything. The user turned psIsoTraveller off for everyone.
            //log("config.scriptIsActive == " + config.scriptIsActive);
            result = false;
        } else if (isTokenOwned(tokenObj) === false ) {     
            result = false;

        } else if (config.useTreadStatusForFacing === true) { // see if the token has a tread (boot) status marker
            var currentTreadStatus = inString(tokenObj.get("statusmarkers"), "tread");
            
            result = currentTreadStatus;            
            //log("status: " + tokenObj.get("statusmarkers") + ". currentTreadStatus == " + currentTreadStatus);
        } else { // see if the token is "registered" from the gui.
            var isRegisteredInTravellersList = _.has(travellers, tokenObj.get("_id") );
            //log("isRegisteredInTravellersList: " + isRegisteredInTravellersList);
            result = isRegisteredInTravellersList;
        }
        
        //log("leaving isTokenMarching. Returning " + result);
        return result;
    };
    
    var shouldTokenBeLit = function flashlightChecker(tokenObj) {
        var result = false;
        var tokenID = tokenObj.get("_id");
        
        if (config.scriptIsActive && isTokenOwned(tokenObj) ) { // has owner
            if (config.useYellowStatusForLight === true && inString(tokenObj.get("statusmarkers"), "yellow") === true ) { // user wants it on
                result = true;
            } else if ( _.has(flashlights, tokenObj.get("_id")) === true && config.useYellowStatusForLight === false ) { // user wants it on but they don't like the yellow status indicators
                result = true;
            }
        }
        
        if (debug) psLog("shouldTokenBeLit: " + tokenObj.get("name") + " = " + result, "yellow");
        return result;
    };

    var isTokenLit = function tokenLightChecker(tokenObj) {
        var result = false;
        var tokenID = tokenObj.get("_id");
        
        if ( _.has(flashlights, tokenID) === true && flashlights[tokenID].lightID !== "" ) { // token is lit
            result = true;
        } else {
            result = false;
        }
        if (debug) psLog("isTokenLit: " + tokenObj.get("name") + " = " + result, "yellow");
        
        return result;
    };
    
/*
                                                                                   
         _/_/_/    _/_/    _/      _/    _/_/_/  _/_/_/  _/_/_/    _/_/_/_/  _/_/_/    
      _/        _/    _/  _/_/    _/  _/          _/    _/    _/  _/        _/    _/   
     _/        _/    _/  _/  _/  _/    _/_/      _/    _/    _/  _/_/_/    _/_/_/      
    _/        _/    _/  _/    _/_/        _/    _/    _/    _/  _/        _/    _/     
     _/_/_/    _/_/    _/      _/  _/_/_/    _/_/_/  _/_/_/    _/_/_/_/  _/    _/      

*/  
    
    var considerChangingDirection = function directionChangeDeterminator(tokenMoved) {
        if (isTokenMarching(tokenMoved) === true) {
        
            //log("entered considerChangingDirection with " + JSON.stringify(tokenMoved) );
            var lastLocation = getLastLocation(tokenMoved);     
            var currentLocation = [tokenMoved.get("left"), tokenMoved.get("top")];
            var tokenID = tokenMoved.get("_id");
            var thisTraveller = travellers[tokenID];
            if (thisTraveller === undefined) {
                log("==> Error: currentTraveller is undefined: " + tokenID);
                if (isTokenMarching(tokenMoved) ) {
                    thisTraveller = registerTokenForFacing(tokenID);
                }
                return false;
            }
            
            if (!lastLocation) { // this token hasn't ever moved.. just use the current location.
                lastLocation = [tokenMoved.get("left"), tokenMoved.get("top")];
            } else { // Hey, we're moving! Check the direction and change facing.

                var previousDirection;
                var currentDirection;
                
                previousDirection = thisTraveller.direction;
                
                if ( lastLocation[0] > currentLocation[0] ) { // face right?
                    currentDirection = 1;
                } else if ( lastLocation[0] < currentLocation[0] ) { //face left?
                    currentDirection = -1;              
                } else { // token graphic changed, but it hasn't moved on the x axis. Maybe someone updated the status markers or something. 
                    return;
                }               
                
                if ( currentDirection !== previousDirection ) {
                    // log("thisTraveller = " + JSON.stringify(thisTraveller)); 
                    if (_.has(thisTraveller, "changeDirection") ) {
                        thisTraveller.changeDirection();
                    } else {
                        log("thisTraveller has no changeDirection. " + JSON.stringify(thisTraveller) );
                    }
                }
            }               
        }
    };
    
    var considerLightingLight = function lightLighter(tokenMoved) {
        var tokenID = tokenMoved.get("_id");
        var shouldBeLit = shouldTokenBeLit(tokenMoved);
        var isLit = isTokenLit(tokenMoved);
        
        if (debug) psLog("considerLightingLight: " + tokenMoved.get("name") , "LightGrey");
        if (shouldTokenBeLit(tokenMoved) === true && isTokenLit(tokenMoved) === false ) { // light this token
            if (debug) psLog("tokenID needs flashlight: " + tokenID, "DarkGoldenRod");
            if (debug) psLog("flashlights: " + JSON.stringify(_.keys(flashlights)), "DarkGoldenRod");
            if (debug) psLog("considerLightingLight says: turn it on", "LightGrey");
            
            lightFlashlight(tokenID);               
            
        } else if ( shouldTokenBeLit(tokenMoved) === false && isTokenLit(tokenMoved) === true) { // turn it off
            //flashlights[tokenID].turnOff(); // can't delete the object from inside the object.
            extinguishFlashlight(tokenID);
            if (debug) psLog("turn it off", "LightGrey");
        }       
    };
    
    var considerMovingLight = function lightMover(tokenMoved) {
        var tokenID = tokenMoved.get("_id");
        if ( shouldTokenBeLit(tokenMoved) === true && isTokenLit(tokenMoved) === true ) { // that character doesn't have a flashlightObj yet
            
            
            flashlights[tokenID].follow();
            
        } 
        
        /* else { // the token shouldn't be lit.
            if (debug) psLog("considerMovingLight says this token either isn't lit, or shouldn't be lit");
            considerLightingLight(tokenMoved);
        } */
        
    };
    
/*
                                                     
        _/      _/    _/_/    _/      _/  _/_/_/_/   
       _/_/  _/_/  _/    _/  _/      _/  _/          
      _/  _/  _/  _/    _/  _/      _/  _/_/_/       
     _/      _/  _/    _/    _/  _/    _/            
    _/      _/    _/_/        _/      _/_/_/_/       
                                                     

*/  
    
    
    var handleTokenMove = function tokenMoveHandler(tokenMoved) {
        if (debug) psLog("entering handleTokenMoved with: tokenObj for " + tokenMoved.get("name")); 
        
        considerLightingLight(tokenMoved);
        considerMovingLight(tokenMoved);
        considerChangingDirection(tokenMoved);      
    };

    var handleTokenStatusMarkersChange = function tokenStatusMarkerChangeHandler(tokenChanged) {
        considerLightingLight(tokenChanged);        
    };
    
    
/*
                                                     
       _/    _/  _/_/_/_/_/  _/_/_/  _/          _/_/_/   
      _/    _/      _/        _/    _/        _/          
     _/    _/      _/        _/    _/          _/_/       
    _/    _/      _/        _/    _/              _/      
     _/_/        _/      _/_/_/  _/_/_/_/  _/_/_/         
 
*/  


    var psPoint = function(x, y) {
        this.x = x;
        this.y = y;     
    };

    var makeVector = function(point1, point2) {
        if (debug) psLog("makeVector received: " + JSON.stringify(point1) + ", " + JSON.stringify(point2) , "pink");
        var resultVector = new psPoint( (point2.x - point1.x) , (point2.y - point1.y) );        
        if (debug) psLog("makeVector returning: " + JSON.stringify(resultVector) , "pink");
        return resultVector;
    };
    
    var vectorLength = function(point) {        
        var distance = Math.sqrt( Math.pow(point.x, 2) + Math.pow(point.y, 2) );        
        return distance;
    };
    
    var makeUnitVector = function(point) {
        if (debug) psLog("makeUnitVector received " + JSON.stringify(point) );
        var distance = vectorLength(point);
        if (distance !== 0) {
            return new psPoint( (point.x/distance), (point.y/distance) );
        } else {
            return NaN;
        }
    };
    
    var vectorToRoll20Rotation = function(point) {
        if (debug) psLog("vectorToRoll20Rotation received " + JSON.stringify(point), "yellow");
        var theta = Math.atan2(point.y, point.x);
        
        var roll20rotation = (theta * 180/3.1415) + 90;
        if (debug) psLog("vectorToRoll20Rotation returning: " + roll20rotation);
        return roll20rotation;
    
    };
    
    var radiansToRoll20Degrees = function(rads) {
        return 360 - (rads * 180/3.1415);
        
    };
    
    var getCurrentPage = function currentPageGetter(playerID) {
        var currentPage;
        var playerSpecificPages = Campaign().get("playerspecificpages");
        var playerRibbon = Campaign().get("playerpageid");
        
        if (playerID === undefined || getObj("player", playerID) === undefined) {
            currentPage = false;
        } else {
            if (playerIsGM(playerID)) {
                var lastPage = getObj("player", playerID).get("_lastpage");
                if ( lastPage !== "" ) {
                    currentPage = lastPage;
                } else {
                    currentPage = playerRibbon;
                }
                     
            } else { // non-gm player
                if (playerSpecificPages !== false && playerSpecificPages[playerID] !== undefined ) {
                    currentPage = playerSpecificPages[playerID];
                } else {
                    currentPage = playerRibbon;
                }
            }
        }
        if (debug) log("getCurrentPage is returning "+ currentPage);
        return currentPage;     
    };
    
    var allActivePages = function activePagesGetter() {
        var allPages = [];
        
        var playerRibbon = Campaign().get("playerpageid"); // pageid
        allPages.push(playerRibbon);

        var playerSpecificPages = _.values(Campaign().get("playerspecificpages")); // pageids
        _.each(_.uniq(playerSpecificPages), function(pageID) {
            allPages.push(pageID);
        });
        
        var players = findObjs({type: "player"});       
        _.each(players, function(player) {
            if (playerIsGM(player.get("_id"))) {
                var gmPlayer = player;
                var gmPage = gmPlayer.get("_lastpage"); // pageid
                if (gmPage !== "") {
                    allPages.push(gmPage);
                }
            }           
        });
        
        return allPages;
    };
/*


                                                 
        _/_/_/  _/      _/  _/_/_/  _/_/_/_/_/   
         _/    _/_/    _/    _/        _/        
        _/    _/  _/  _/    _/        _/         
       _/    _/    _/_/    _/        _/          
    _/_/_/  _/      _/  _/_/_/      _/           
                                                 

*/

    var reconnectOldFlashlights = function flashlightReconnector(pageID) {
        if (pageID === undefined) {
            pageID = Campaign().get("playerpageid");
        }

        var activeFlashlights = findObjs({ 
            _pageid: pageID,
            name: "flashlight",
        });

        _.each( activeFlashlights, function(flashlightGraphic) {
            var parentTokenID = flashlightGraphic.get("gmnotes");
            if (getObj("graphic", parentTokenID) !== undefined ) {
                var reconnectedFlashlight = new flashlightObj(parentTokenID);
                reconnectedFlashlight.lightID = flashlightGraphic.get("_id");
                flashlights[parentTokenID] = reconnectedFlashlight;
            }
        });
    };

    var reset = function resetter(pageID) { // remove all flashlights
        if (pageID === undefined) { // screw it, we'll reset every page that has a player on it.
            log("==> Error: reset function received no pageID");
        }
        
        config = _.clone(defaultConfig);
        travellers = {};
        flashlights = {};
        
        var activeFlashlights = findObjs({ 
            _pageid: pageID,
            name: "flashlight",
        });

        _.each( activeFlashlights, function(flashlightGraphic) {
            flashlightGraphic.remove();
        });
        
        if (debug) psLog("reset to defaults");
        
    };
    
    var checkInstall = function installChecker() {
        if ( !_.has(state, "psIsoFacing") || state.psIsoFacing.info.version !== info.version ) { // populate state from default values
            state.psIsoFacing = { 
                info: info,
                config: config,             
                travellers: _.keys(travellers), // state will hold a simple list of traveller IDs. It can't hold complex objects
                flashlights: _.keys(flashlights)
            };          
            
        } else { // use values from roll20 persistent state object for the campaign.

            travellers = {};
            _.each(state.psIsoFacing.travellers, function(travellerID) {
                travellers[travellerID] = new travellerObj();
                instantiateTravellerMethods(travellers[travellerID]);
            } );
            
            //travellers = state.psIsoFacing.travellers; // state simplifies objects and strips out methods. Hopefully they're still instances of travellerObj

            flashlights = {};
            _.each(state.psIsoFacing.flashlights, function(flashlightID) {
                flashlights[flashlightID] = new flashlightObj();
                instantiateFlashlightMethods(flashlights[flashlightID]);                
            });
            
            
            reconnectOldFlashlights();
            //flashlights = state.psIsoFacing.flashlights;


            config = _.clone(state.psIsoFacing.config);
            info = _.clone(state.psIsoFacing.info);         
        }
        
        _.each(travellers, function(traveller) {
            instantiateTravellerMethods(traveller);
        });

        _.each(flashlights, function(flashlight) {
            instantiateFlashlightMethods(flashlight);
        });
        
        log("psIsoFacing is ready.");
    };


    var registerEventHandlers = function eventHandlerRegistrar() {
        if (debug) psLog("psIsoFacing registered event handlers");
        
        on('chat:message', handleInput );
        on('change:graphic', handleTokenMove );
        on("change:graphic:statusmarkers", handleTokenStatusMarkersChange);
    };

    return { // expose functions for outside calls
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall,
        Reset: reset,
        ShowDetailedHelp: showDetailedHelp,
        psLog: psLog
    };



}());


on("ready",function(){
    psIsoFacing.psLog("on('ready') just fired.", "burlywood");
    psIsoFacing.CheckInstall(); // instantiate all the function expressions
    
    psIsoFacing.RegisterEventHandlers(); // instantiate all the listeners

});*******************************************************************************
/*                                                         
        _/_/_/      _/_/_/        _/_/_/  _/    _/  _/_/_/   
       _/    _/  _/            _/        _/    _/    _/      
      _/_/_/      _/_/        _/  _/_/  _/    _/    _/       
     _/              _/      _/    _/  _/    _/    _/        
    _/        _/_/_/          _/_/_/    _/_/    _/_/_/       

*/

/*
    Purpose: 
        Provide standardized, reusable functions for creating GUIs in Roll20 API scripts.
    
    Usage: 
        push all userCommand objects into a userCommands list.
        
        userCommand parameters: [listener, commandName, functionToCall, parameters, shortDesc, longDesc, defaultParams]
        
    For Example:
        var initializeUserCommands = function() {
            userCommands.push(new userCommand("!psGUI","--name", psGUITest, ["token_id", "character_id"], "Get Token Name", "Returns the name of the graphic object or token"));
        };

        var psGUITest = function guiTester(token_id, character_id) {        
            var tokenName = getObj("graphic", token_id).get("name");
            var characterName = getObj("character", character_id).get("name");
            psLog("Token: " + tokenName + ", Character: " + characterName, "lightgreen");
        };
    


*/

var psGUI = psGUI || (function psGUI() { // Module
    "use strict";

    
    var info = {
        version: 0.1,
        author: "plexsoup"
    };
    
    var config = {};
    var defaultConfig = {
        debug: true
    };
        
/*
        _/_/_/    _/_/    _/      _/  _/      _/    _/_/    _/      _/  _/_/_/      _/_/_/   
     _/        _/    _/  _/_/  _/_/  _/_/  _/_/  _/    _/  _/_/    _/  _/    _/  _/          
    _/        _/    _/  _/  _/  _/  _/  _/  _/  _/_/_/_/  _/  _/  _/  _/    _/    _/_/       
   _/        _/    _/  _/      _/  _/      _/  _/    _/  _/    _/_/  _/    _/        _/      
    _/_/_/    _/_/    _/      _/  _/      _/  _/    _/  _/      _/  _/_/_/    _/_/_/        

*/

    //make a general purpose object container for user commands.
        // then, from that object, build out the help file, the gui, and listeners automatically.
        
    var userCommands = []; // list of userCommand objects
    
    var userCommand = function(listener, commandName, functionToCall, parameters, shortDesc, longDesc, defaultParams) { // defaultParams is optional
        this.listener = listener; // string (eg: "!psIsoFacing")
        this.commandName = commandName; // string (eg: "--reset")
        this.functionToCall = functionToCall; // function (eg: scaleVector)
        this.parameters = parameters;   // array/list of predefined variable types (eg: ["page_id", "string", "token_id", "number"])
        this.shortDesc = shortDesc;     // string (eg: "Reset the map")
        this.longDesc = longDesc;       // string (eg: "<div>Enter !psIsoFacing --reset in chat to reset the map and remove all flashlights</div>")
        this.defaultParams = defaultParams; // what to put in the GUI buttons.. eg: @{selected|token_id}, ?{Parameter Value?} // note: pass these through ch()
    };

    
    
    var parameterTypes = { // intended for parameter checking and soft error handling
        "string": function(string) { 
            return _.isString(string);
        },
        "token_id": function(token_id) { 
		    if (token_id !== undefined && token_id !== "" && getObj("graphic", token_id) !== undefined) {
                return true;
            } else {
                return false;
            }
        },
        "character_id": function(character_id) { 
            return Boolean(character_id !== undefined && getObj("character", character_id) !== undefined); 
        },
        "page_id": function(page_id) { 
            return Boolean(page_id !== undefined && getObj("page", page_id) !== undefined); 
        },
        "num": function(num) { // r20 chat messages come in as strings.. we need to convert to numbers, then test somehow.
            //psLog("isNumber: " + num + " == " + Boolean(!isNaN(num))); // attempting some type coercion
            return Boolean( !isNaN(num) ); 
        }
    };

    var ch = function (c) {
        // This function will take a single character and change it to it's equivalent html encoded value.
        // psNote: I tried alternate methods of regexps to encode the entire string, but I always ran into problems with | and [] characters.
        var entities = {
            '<' : 'lt',
            '>' : 'gt',
            "'" : '#39',
            '@' : '#64',
            '{' : '#123',
            '|' : '#124',
            '}' : '#125',
            '[' : '#91',
            ']' : '#93',
            '"' : 'quot',
            '-' : 'mdash',
            ' ' : 'nbsp'
        };

        if(_.has(entities,c) ){
            return ('&'+entities[c]+';');
        }
        return '';
    };

/*

        _/_/_/      _/_/    _/_/_/      _/_/    _/      _/    _/_/_/   
       _/    _/  _/    _/  _/    _/  _/    _/  _/_/  _/_/  _/          
      _/_/_/    _/_/_/_/  _/_/_/    _/_/_/_/  _/  _/  _/    _/_/       
     _/        _/    _/  _/    _/  _/    _/  _/      _/        _/      
    _/        _/    _/  _/    _/  _/    _/  _/      _/  _/_/_/         

*/
    
    var defaultParamInputPrompts = { // for building GUI
        "string": '?' + ch('{') + "String?" + ch('}'),
        "token_id": ch('@') + ch('{') + "target" +ch('|') + "token_id" + ch('}'),
        "character_id": function characterLocator() {
            var characters = findObjs({
                _type: "character"
            });
            
            var outputStr = '?' + ch('{') + "Character ID?";
            var indexNum = 1;
            _.each(characters, function(character) {
                var characterName = String(indexNum) + ": " + character.get("name");
                outputStr += ch('|')+ "'" + characterName + "',"+ character.get("_id");
                indexNum++;
            });
            outputStr += ch('}');
            return outputStr;
        },
        
        "page_id": function pageLocator() {
            var pages = findObjs({
                _type: "page"
            });
            
            var outputStr = '?' + ch('{') + "Page ID?";
            var indexNum = 1;
            _.each(pages, function(page) {
                var pageName = String(indexNum) + ": " + page.get("name");
                outputStr += ch('|')+ "'" + pageName + "',"+ page.get("_id");
                indexNum++;
            });
            outputStr += ch('}');
            return outputStr;
        },
        "num": '?' + ch('{') + "Number?" + ch('}')
        
    };
    
    var isParameterValid = function parameterTester(paramName, paramValue) {
        // psLog("isParameterValid testing: " + paramName + ", " + paramValue, "orange"); 
        var passed = false;
        var color;
        if ( _.has(parameterTypes, paramName) ) {
            passed = parameterTypes[paramName](paramValue);
            if (!passed) { 
                color = "red";
                psLog("==> Error: " + paramValue + " doesn't match expected type "+ paramName, color ); 

            } else {
                color = "green";                
            }
        }
        
        // psLog("paramValue: " + paramValue + " is " + paramName + " === " + passed, color);
        return passed;
    };

    
    var psLog = function psLogger(string, color) {
        log("psGUI: " + string);
        sendChat("psGui", "/w gm " + "<div style = 'background-color: "+color+"'>"+string+"</div>");
    };

    
/*
        _/_/_/  _/    _/  _/_/_/   
      _/        _/    _/    _/      
     _/  _/_/  _/    _/    _/       
    _/    _/  _/    _/    _/        
     _/_/_/    _/_/    _/_/_/     

*/  


        
    var whisper = function whisperer(chatString, playerID) {
        log("whisper received: '" + chatString + "', " + playerID);
        var playerName;
        if (playerID === undefined) {
            playerName = "gm";
        } else {
            playerName = getObj("player", playerID).get("displayname");
        }
        sendChat("psGui", "/w " + playerName + " " + chatString);
    };

    var makeButton = function buttonMakerForChat(title, command) { // expects two strings. Returns encoded html for the chat stream
        var output="";

            output += '['+title+']('+command+')';

        return output;
    };

    var displayGUI = function guiBuilder(playerID) {
        _.each(userCommands, function(userCommand) {
            var inputText = userCommand.listener + " " + userCommand.commandName;
            
            _.each(userCommand.parameters, function(paramName) {
                inputText += " " + _.result(defaultParamInputPrompts, paramName);
            });

            var button = makeButton(userCommand.shortDesc, inputText );
            whisper(button, playerID);
        });
    };
    

    
/*

        _/    _/  _/_/_/_/  _/        _/_/_/    
       _/    _/  _/        _/        _/    _/   
      _/_/_/_/  _/_/_/    _/        _/_/_/      
     _/    _/  _/        _/        _/           
    _/    _/  _/_/_/_/  _/_/_/_/  _/            

*/
    var buildHelpFiles = function() {
        
        var helpFileData = _.groupBy(userCommands, function(commandObj) { return commandObj.listener; }); // one object per listener, containing lists of usercommands
        var helpFileNames = _.keys(helpFileData);
        
        _.each(helpFileNames, function buildEachHelpFile(helpFileName) {

            var helpHandouts;
            helpHandouts = findObjs({
                _type: "handout",
                name: helpFileName + " Help"
            });

            var helpHandout = helpHandouts[0];

            var helpText = "<h3><a href='" + helpFileName + "'>" + helpFileName + "</h3>";
            _.each(helpFileData[helpFileName], function(commandObj) {
                helpText += "<div style='font-weight: bold;'>" + commandObj.shortDesc + "</div>";
                helpText += "<div style='margin-left:20px;'>" + helpFileName + " " + commandObj.commandName + " " + ch("[")+ commandObj.parameters +ch("]") + "</div>";
                helpText += "<div style='margin-left:30px; font-style: italic;'>" + commandObj.longDesc + "</div>";
                
            });
            
            if (!helpHandout) { // create it
                helpHandout = createObj('handout', {
                    name: helpFileName + ' Help',
                    inplayerjournals: ''
                });
                helpHandout.set("notes", helpText);

            } else { // it exists, set it's contents to match the latest version of the script
                helpHandout.set("notes", helpText);
            }

            log("helpHandout = " + helpHandout);
            
            var handoutID = helpHandout.get("_id");

            var chatMessage = "";
            var buttonStyle = "'background-color: OrangeRed;'";
            
            chatMessage += "<div style="+buttonStyle+"><a href='http://journal.roll20.net/handout/" + handoutID + "'>"+ helpFileName +" Additional Information</a></div>";
            psLog(chatMessage, "beige");
        });
    };
    
    

/*

    _/_/_/_/_/  _/_/_/_/    _/_/_/  _/_/_/_/_/   
       _/      _/        _/            _/        
      _/      _/_/_/      _/_/        _/         
     _/      _/              _/      _/          
    _/      _/_/_/_/  _/_/_/        _/           

*/  
    
    
    
    var initializeUserCommands = function() {
        userCommands.push(new userCommand("!psGUI","--name", psGUITest, ["token_id", "character_id"], "Get Token Name", "Returns the name of the graphic object or token"));
    };

    var psGUITest = function guiTester(token_id, character_id) {        
        var tokenName = getObj("graphic", token_id).get("name");
        var characterName = getObj("character", character_id).get("name");
        psLog("Token: " + tokenName + ", Character: " + characterName, "lightgreen");
    };


/*
                                                         
        _/_/_/  _/      _/  _/_/_/    _/    _/  _/_/_/_/_/   
         _/    _/_/    _/  _/    _/  _/    _/      _/        
        _/    _/  _/  _/  _/_/_/    _/    _/      _/         
       _/    _/    _/_/  _/        _/    _/      _/          
    _/_/_/  _/      _/  _/          _/_/        _/           
                                                         

*/  

    
    // **** NOTE **** this should be in the module requesting stuff from psUtils.
    var registerEventHandlers = function eventHandlerRegistrar() {
        on('chat:message', function(msg) {
            handleInput(this, msg);
        } ); // **** Not sure if this will work.
    };


    var handleInput = function inputHandler(thisArg, msg) {
        _.each(userCommands, function (userCommand) {
            //var args = msg.content.split(/ +/); // split on spaces alone
            var args = msg.content.split(/[ ,]+/); // split on commas or spaces
            var anyTestFailed = false;
            if (args[0] == userCommand.listener) {
                if (args.length == 1) {
                    displayGUI(msg.playerid);
                }
                if (args[1] == userCommand.commandName) { // test the parameters and execute the user request
                    var params = _.rest(args, 2);
                    var paramTypes = userCommand.parameters;
                    var keyPairs = _.zip(paramTypes, params);
                    if (params.length == paramTypes.length) {
                        // make sure the parameters match the expected types before you run the function
                        _.each(keyPairs, function(keyPair) {
                            var thisTestPassed = isParameterValid(keyPair[0], keyPair[1]); 
                            if (thisTestPassed === false) {
                                anyTestFailed = true;
                            }
                        });                     
                    } else { // number of inputs doesn't match expected parameters.
                        anyTestFailed = true;
                    }
                    
                    if (!anyTestFailed) { // therefore all tests passed
                        userCommand.functionToCall.apply(thisArg, params); // **** TODO Figure out how to get "thisarg" for apply to work from other modules
                    } else {
                        psLog("==> Error: "+ userCommand.listener + " " + userCommand.commandName+ " expects these ("+paramTypes.length+") parameters : [" + paramTypes + "]. You provided ("+params.length+"): [" + params + "]", "orange");
                    }
                } 
            }
        });
    };


    



/*
                                                                         
        _/_/_/  _/      _/    _/_/_/  _/_/_/_/_/    _/_/    _/        _/     
         _/    _/_/    _/  _/            _/      _/    _/  _/        _/      
        _/    _/  _/  _/    _/_/        _/      _/_/_/_/  _/        _/       
       _/    _/    _/_/        _/      _/      _/    _/  _/        _/        
    _/_/_/  _/      _/  _/_/_/        _/      _/    _/  _/_/_/_/  _/_/_/_/  

*/


    
    var checkInstall = function installChecker() {
        // construct help file, gui, event handlers
        
        initializeUserCommands();
        buildHelpFiles();
        
        // grab config options from Roll20 persistent state object so they persist across instances and sessions
        if (!_.has(state, psGUI) && _.size(state.psGUI) > 0 ) {
            if (_.size(config) === 0) {
                config = _.clone(defaultConfig);
            }
            state.psGUI = _.clone(config);
        } else {
            config = _.clone(state.psGUI);
        }
    };

    var reset = function resetter() {
        log("entering reset");
    };

    
    return { // expose functions for outside calls
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall,
        Reset: reset,
    };
    
}()); // end module


on("ready", function() {
    psGUI.CheckInstall();
    psGUI.RegisterEventHandlers();
    
});
*******************************************************************************
/*

        _/_/_/      _/_/_/      _/_/_/    _/_/_/    _/_/        _/      _/    _/_/    _/_/_/    
       _/    _/  _/              _/    _/        _/    _/      _/_/  _/_/  _/    _/  _/    _/   
      _/_/_/      _/_/          _/      _/_/    _/    _/      _/  _/  _/  _/_/_/_/  _/_/_/      
     _/              _/        _/          _/  _/    _/      _/      _/  _/    _/  _/           
    _/        _/_/_/        _/_/_/  _/_/_/      _/_/        _/      _/  _/    _/  _/          
                                                         
*/

// purpose: To turn top down drawings into isometric drawings (ie: rotate 45degrees and scale 50% on the y axis.)


// usage: type !IsoMap or !psIsoMap in chat.






var IsoMap = IsoMap || (function IsoMapMaker() {
    "use strict";



// BUGS
    // all paths currently rotate around their midpoint with origin at top-left... change them to rotate around the midpoint of the largest bounding box.
    
    
// TODO

    // figure out the offsets.
    // Ask the player to make a new page
        // git it the same settings
        // Move the player there. 
        // Set up the new map on the new page.
    // add an isometric grid?

    
    var debug = true;
    var debugDEFCON = 5; //     DEFCON 1 = FUBAR: LOG EVERYTHING. DEFCON 5 = AOK: LOG NOTHING

    var version = "0.02";
    var lastUpdate = 1484861080933;
    var schemaVersion = "0.01";

    var ICONS = { // note: Roll20 has particular rules about imgsrc. See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions
        torch: "https://s3.amazonaws.com/files.d20.io/images/17247606/Wbr841_bq9ka1FmamWo38w/thumb.png?1458169656",
        transparent: "https://s3.amazonaws.com/files.d20.io/images/27023509/jDIhDrjr_RyUxq5ldQj1uw/thumb.png?1483683924",
        scifi: "https://s3.amazonaws.com/files.d20.io/images/27025190/VrSyw_oHrsM8cfdBPcfLHw/thumb.png?1483690176"
    };  

    var defaultConfig = {
        SHOW_HELP_ON_READY: 1
    };

    var config = _.clone(defaultConfig); // this'll get updated from state.IsoMap.config
    
    
    
    var whisperSmall = function chatMessageSender(playerName, message) {
        // sends a chat message to a specific player. Can use gm as playerName
        //sendChat(playerName, '/w ' + playerName + " " + message);
        var msgStr = "<div style='font-size: smaller;'>";
        msgStr += message;
        msgStr += "</div>";
        
        sendChat("IsoMap Script", '/w ' + playerName + " " + msgStr);
    };
    
    
    var whisper = function chatMessageSender(playerName, message) {
        // sends a chat message to a specific player. Can use gm as playerName
        //sendChat(playerName, '/w ' + playerName + " " + message);
        sendChat("IsoMap Script", '/w ' + playerName + " " + message);
    };

    var ch = function (c) {
    // This function will take a single character and change it to it's equivalent html encoded value.
        // psNote: I tried alternate methods of regexps to encode the entire string, but I always ran into problems with | and [] characters.
        var entities = {
            '<' : 'lt',
            '>' : 'gt',
            "'" : '#39',
            '@' : '#64',
            '{' : '#123',
            '|' : '#124',
            '}' : '#125',
            '[' : '#91',
            ']' : '#93',
            '"' : 'quot',
            '-' : 'mdash',
            ' ' : 'nbsp'
        };

        if(_.has(entities,c) ){
            return ('&'+entities[c]+';');
        }
        return '';
    };
    
    
    
    var showDetailedHelp = function showDetailedHelpTextInChat(playerName) {
        if (debugDEFCON < 2) { log("entering showDetailedHelp("+playerName+")"); }

        if (!playerName) { playerName = "gm";}



        var exampleStyle = '"background-color: #eee; font-size: smaller; margin-left: 40px;"';
        var warningStyle = '"background-color: AntiqueWhite; font-size: smaller;"';
        var exampleTokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');

        var helpText = '';

        helpText += '<div style="font-size: smaller;">';
        helpText += 'IsoMap is a script to convert a hand-drawn map into isometric view.';
        helpText += "Draw a few paths on the map layer. Then enter !IsoMap in chat.";
        helpText += "</div>";
        
        //whisper(playerName, helpText );
        var helpHandouts;
        helpHandouts = findObjs({
            _type: "handout",
            name: "IsoMap Help"
        });

        var helpHandout = helpHandouts[0];
        //log("helpHandout = " + helpHandout);
        
        if (!helpHandout) { // create it
            helpHandout = createObj('handout', {
                name: 'IsoMap Help',
                inplayerjournals: 'all'
            });
            helpHandout.set("notes", helpText);

        } else { // it exists, set it's contents to match the latest version of the script
            helpHandout.set("notes", helpText);
        }
        var handoutID = helpHandout.get("_id");

        var chatMessage = "";
        var buttonStyle = "'background-color: OrangeRed;'";
        
        chatMessage += "<div style="+buttonStyle+"><a href='http://journal.roll20.net/handout/" + handoutID + "'>Additional Information</a></div>";
        

        
        // getClickyButtons(playerName);

        if (debugDEFCON < 2) { log("exiting showDetailedHelp. Whispered message to chat. No return value."); }

        
        return(chatMessage);
    };
    
    var getGameMasterID = function gmIDGetter() {
        if (debugDEFCON < 4) { log("entering getGameMasterID with no parameters"); }
        
        var players = findObjs({
            _type: "player",
        });
        
        var gmID;
        var gmObj;
        var currentPlayerID;
        
        _.each(players, function loopToFindGM(player) { 
            if (debugDEFCON < 4) { log("evaluating player: " + JSON.stringify(player) ); }
            currentPlayerID = player.get("_id");
            if ( playerIsGM(currentPlayerID) ) {
                gmID = currentPlayerID;
                // ??? what happens if there's 2 GMs? We're only delivering up the last one found.
                if (debugDEFCON < 2) {log("found a GM: " + gmID);}
            }
        
        });

        if (debugDEFCON < 4) { log("exiting getGameMasterID. Returning " + gmID); }
        return gmID;
    };
    
    /*
    var makeNewPage = function pageMaker(oldPageID, customSettings) { // customSettings = pageObj params
        log("entered makeNewPage with " + oldPageID + JSON.stringify(customSettings) );
        var pageObj = getObj("page", oldPageID);
        log("pageObj = " + pageObj.get("_id"));
        
        var newPage = createObj("page", {} );

        if (newPage) {
            newPage.set({
            showlighting: pageObj.get("showlighting"),
            showdarkness: pageObj.get("showdarkness"),
            width: pageObj.get("width"),
            height: pageObj.get("height"),
            snapping_increment: pageObj.get("snapping_increment"),
            background_color: pageObj.get("background_color"),
            scale_number: pageObj.get("scale_number"),
            scale_units: pageObj.get("scale_units"),
            lightupdatedrop: pageObj.get("lightupdatedrop"),
            lightrestrictmove: pageObj.get("lightrestrictmove"),
            lightglobalillum: pageObj.get("lightglobalillum"),
            showgrid: pageObj.get("showgrid")               
            });
        }
    
        
        if (newPage === undefined || newPage == -1) {
            log("==> Error creating page: function makeNewPage received " + oldPageID + ", " + customSettings);
            return undefined;
        }
        
        _.each( _.keys(customSettings), function(key) {
            log("key: " + key);
            if ( _.has(newPage, key) ) {
                newPage.set(key, customSettings[key]);
            }
        });
        
        return newPage.get("_id");
    };

    */
    
    var getCurrentPage = function currentPageGetter(tokenObjOrPlayerID) { // expects token, playerID, or string=="gm"
    // **** TODO **** This isn't working as expected. Go through it and check assertions.
    
        if ( debugDEFCON < 5) { log( "entering getCurrentPage with " + tokenObjOrPlayerID ); }
        var currentPage;
        var playerID;
        var playerObj;
        var gmID = getGameMasterID();
        if ( debugDEFCON < 5) {
            log("   gmID = " + gmID);
        }

        if (tokenObjOrPlayerID === undefined ) { // getCurrentPage received bad parameters, but we'll take care of it.
            log("==> Error in getCurrentPage. tokenObjOrPlayerID == undefined"); 
            return Campaign().get("playerpageid");
            
        } else if ( tokenObjOrPlayerID == "gm") {
            tokenObjOrPlayerID = gmID;
            if (gmID) {
                // currentPage = getObj("player", gmID).get("lastpage");            
                return Campaign().get("playerpageid");
            } else {
                return Campaign().get("playerpageid");              
            }           
        
            
            
        } else if ( _.isString(tokenObjOrPlayerID) ) { // it's a player ID
            if (debugDEFCON < 4) { log("    tokenObjOrPlayerID was a string. Assume player_id: " + tokenObjOrPlayerID); }
            playerID = tokenObjOrPlayerID;
            playerObj = getObj("player", playerID);
            
            if (playerIsGM(playerID)) { // it's the GM, use the lastpage property to find their page
                if (debugDEFCON < 4) { 
                    log("    player_id is a GM");
                    log("    playerObj.get('lastpage') returns " + playerObj.get("lastpage") );
                    //log("    Campaign().get('playerpageid') returns " + Campaign().get("playerpageid") );
                }
                
                currentPage = playerObj.get("lastpage"); // NOTE: there's no lastpage unless the GM has been on another page
                
            } else if ( Campaign().get("playerspecificpages")[playerID] ) {
                if ( debugDEFCON < 4 ) { 
                    log("    player_id is not a GM, and the players are seperated onto different pages"); 
                    log("    playerspecificpages = " + Campaign().get("playerspecificpages") );
                }
                
                
                // Note: there's no playerspecificpages unless a single player name is dragged onto another map
                currentPage = Campaign().get("playerspecificpages")[playerID];

            } else { // it's a player and the players are all on one page.
                if (debugDEFCON < 4) { log("    player_id is not a GM, but there's only one page"); }
                currentPage = Campaign().get("playerpageid");               
            }
        } else if ( _.isObject(tokenObjOrPlayerID) ) { // it's a token
            if (debugDEFCON < 4) { log("    tokenObjOrPlayerID was an object. Assume token: " + JSON.stringify(tokenObjOrPlayerID) ); }
            var token = tokenObjOrPlayerID;
            currentPage = token.get("page_id");
        }
        
        if (debugDEFCON < 4) { log("exiting getCurrentPage. Returning " + currentPage ); } 
        
        return currentPage;
    };

        var makeButton = function buttonMakerForChat(title, command) { // expects two strings. Returns encoded html for the chat stream
        var output="";

            output += '['+title+']('+command+')';

        return output;
    };

    var beautifyButtons = function buttonBeautifier (buttonArray) {
        // take a 2D array, consisting of [[title1, command1], [title2, command2], ... [titleN, commandN]]
            // return pretty html for the buttons to go on the chat window.

        // **** TODO ****

        outputMessage = "";
        return outputMessage;

    };


    var getClickyButtons = function guiMakerForChat (playerName) {
        if (!playerName) { playerName = "gm";}
        var chatMessage = "";
        chatMessage += '<div style="border: 2px solid red; text-align: center; margin: 5px;">';
        chatMessage += '<div style="background-color: OrangeRed"><span><img style="float: left;" width="28px" height="28px" src="'+ICONS.torch+'"></span><span>!IsoMap</span><span><img style="float:right;" width="28px" height="28px" src="'+ICONS.scifi+'"></span></div>';
        chatMessage += '<div style="text-align: center; background-color: black; color: OldLace;">';
        chatMessage +=      '<span>';
        chatMessage +=          "Convert: ";
        chatMessage +=      '</span>';
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Top-Down to Isometric", '!IsoMap-topDownToIso 1' );
        chatMessage +=      '</span>';
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Isometric to Top-Down", '!IsoMap-isoToTopDown 1' );
        chatMessage +=      '</span>';

        chatMessage += '</div><div style="text-align: center; background-color: black; color: OldLace;">';      
        



        chatMessage +=          '<span>';
        chatMessage +=              makeButton("Destroy Map", "!IsoMap-destroy all");
        chatMessage +=          '</span>';
        
        chatMessage += '</div><div style="text-align: center; background-color: black;">';      

        
        chatMessage +=      '<span>';
        chatMessage +=          makeButton("Status", "!IsoMap-status");
        chatMessage +=      '</span>';
        
        chatMessage +=      '<span>';
        chatMessage +=      makeButton("Config", "!IsoMap-gui getLightConfig");
        chatMessage +=      '</span>';

        
        chatMessage += '</div>';

        chatMessage += showDetailedHelp(playerName);
        
        chatMessage += "</div>";
        
        whisper(playerName, chatMessage);
        
    };



/*


ooooo                                    o8
 888  oo oooooo  ooooooooo  oooo  oooo o888oo
 888   888   888  888    888 888   888  888
 888   888   888  888    888 888   888  888
o888o o888o o888o 888ooo88    888o88 8o  888o
                 o888

*/

    
    
    var handleInput = function inputHandler(msg) {
        // FYI: Expected msg looks like this:
            // content, playerid, selected, type, who
            // where content is: !IsoMap token_id
            // {"content":"!IsoMap -K_D89bE8mmN0VEBmdjt","playerid":"-K_D5Ng6YOcQ3VnAEsNh","selected":[{"_id":"-K_D89bE8mmN0VEBmdjt","_type":"graphic"}],"type":"api","who":"plexsoup (GM)"}
            
        if (msg.type == "api" && ( msg.content.indexOf("!IsoMap") !== -1 || msg.content.indexOf("!psIsoMap") !== -1 ) )  {

            var argsFromUser,
                who,
                errors=[],
                // playerPage, // useful for status message where no token is selected
                tokenPage, // used for dropping new lightCrumbs
                IsoMapMakerSupply,
                token,
                tokenCoords,
                tokenID,
                playerID,
                playerName,
                pageID,
                statusMessage,
                parentTokenID,
                lastPage;


            playerName = msg.who;
            playerID = msg.playerid;
            
            pageID = getCurrentPage(playerID);
            
            if (debugDEFCON < 5) {
                log("PlayerName = " + playerName);
                // log("PlayerID = " + playerID);
                log("msg.content = " + msg.content);
            }

            argsFromUser = msg.content.split(/ +/);
            if (debugDEFCON < 2) {log("handleInput got a message: " + argsFromUser);}

            switch(argsFromUser[0]) {
                case '!IsoMap-clear':
                    // remove all the light-crumbs

                    parentTokenID = argsFromUser[1];
                    if (parentTokenID == "all") {
                            // reset(pageID, "all", "soft");
                    } else {
                        // reset(pageID, parentTokenID, "soft");
                    }
                    
                    break;

                case '!IsoMap-destroy':
                    // destroy the IsoMaps permanently. Nothing left on GM Layer.
                    
                    parentTokenID = argsFromUser[1];
                    if (parentTokenID == "all") {
                        // reset(pageID, "all", "hard");
                    } else {
                        // reset(pageID, parentTokenID, "hard");
                    }
                    
                    break;
                    
                case '!IsoMap-register':
                    if (debugDEFCON < 2) { log("Trying to register a new token"); }
                    // Add tokenIDs to the list of tokens registered to produce light-trails automatically
                    tokenID = argsFromUser[1];
                    registerMapper(tokenID, playerName);
                    break;
                    
                case '!IsoMap-deregister':
                    if (debugDEFCON < 5 ) { log("==> !IsoMap-deregister " + argsFromUser[1]); }
                    tokenID = argsFromUser[1];
                    deregisterMapper(tokenID, playerName);
                
                    break;
                
                case '!IsoMap-help': // explain script and pop up a few buttons in the chat for player to click on.
                    showDetailedHelp(playerName);
                    break;
                case '!IsoMap': // explain script and pop up a few buttons in the chat for player to click on.
                    getClickyButtons(playerName);
                    break;
                    
                case '!IsoMap-topDownToIso':
                    convertPaths(pageID, "isometric");
                    whisper(playerName, "Creating isometric map.");
                break;
                
                case "!IsoMap-isoToTopDown":
                    convertPaths(pageID, "cartesian");
                break;
            }

            
            
        }
    };
    

/*


                                                                                    
         _/_/_/    _/_/    _/      _/  _/      _/  _/_/_/_/  _/_/_/    _/_/_/_/_/   
      _/        _/    _/  _/_/    _/  _/      _/  _/        _/    _/      _/        
     _/        _/    _/  _/  _/  _/  _/      _/  _/_/_/    _/_/_/        _/         
    _/        _/    _/  _/    _/_/    _/  _/    _/        _/    _/      _/          
     _/_/_/    _/_/    _/      _/      _/      _/_/_/_/  _/    _/      _/          

     
*/  
    
    
    
    var getPathsFromLayer = function PathGetter(pageID, layerName) {
        
        var paths = [];
        
        paths = findObjs({
            _pageid: pageID,
            _type: "path",
            layer: layerName            
        });
        
        return paths;
        
    };
    
    var isoToTopDown = function isoTo2Difier (Roll20PathPointArray) { // expecting ["M", x, y] or ["L", x, y]
        log("entering isoToTopDown with " + Roll20PathPointArray);
    // Note: this is going to rotate the whole map. To rotate a path around it's median, you'll need the extents.
        var typeOfPoint = Roll20PathPointArray[0];
        var isoX = Roll20PathPointArray[1];
        var isoY = Roll20PathPointArray[2];
        
        //var isoX = topDownX - topDownY;
        //var isoY = (topDownX + topDownY) / 2;
        
        var topDownX = ( (2*isoY) + isoX ) / 2;
        var topDownY = ( (2*isoY) - isoX ) / 2;
        
        var topDownPoint = [typeOfPoint, topDownX, topDownY];
        log("leaving isoToTopDown. Returning: " + topDownPoint );
        return topDownPoint;
        
    };

    var topDownToIso = function topDownToIsoIfier (Roll20PathPointTuple) { // expecting ["M", x, y] or ["L", x, y]
    // Note: this is going to rotate around the midpoint of the path. To rotate in harmony with other paths, you'll need the extents.
        log("entering topDownToIso with " + Roll20PathPointTuple );
        var typeOfPoint = Roll20PathPointTuple[0];
        var topDownX = Roll20PathPointTuple[1];
        var topDownY = Roll20PathPointTuple[2];

        //var topDownX = (2 * isoY + isoX) /2;
        //var topDownY = (2 * isoY - isoX) /2;

        var isoX = (topDownX - topDownY) ;
        var isoY = (topDownX + topDownY) / 2;

        var isoPoint = [typeOfPoint, isoX, isoY];
        log("Leaving topDownToIso. returning" + isoPoint );
        return isoPoint;
        
    };

    var point2D = function point2D(x, y) {
        this.x = x;
        this.y = y;
    };

    
    var getBoundingBox = function boundingBoxGetter(paths) { // expects Roll20 path objects, returns [point2d, point2d]
        if (debug) { log("entering getBoundingBox with " + JSON.stringify(paths)); } 
        var minXY = new point2D(5000000,5000000);
        var maxXY = new point2D(0,0);
        
        
        _.each(paths, function(path) {
            var points = JSON.parse(path.get("path"));
            _.each(points, function(point) { // points look like this: ["L", x, y]
                if (point[1]+path.get("left") < minXY.x) {
                    minXY.x = point[1]+path.get("left");
                }
                
                if (point[2]+path.get("top") < minXY.y) {
                    minXY.y = point[2]+path.get("top");
                }
                
                if (point[0]+path.get("left") > maxXY.x) {
                    maxXY.x = point[0] + path.get("left");
                }
                
                if (point[1]+path.get("top") > maxXY.y) {
                    maxXY.y = point[1]+path.get("top");
                }
                
            });
        });
        if (debug) { log("exiting getBoundingBox with " + JSON.stringify([minXY, maxXY])); }        
        return [minXY, maxXY];
    };

    var drawBox = function boxDrawer(pageID, minXY, maxXY) {
        var point1 = ["M", minXY.x, maxXY.y];
        var point2 = ["L", minXY.x, minXY.y];
        var point3 = ["L", maxXY.x, minXY.y];
        var point4 = ["L", maxXY.x, maxXY.y];
        var point5 = ["L", minXY.x, maxXY.y];
        
        var points = [point1, point2, point3, point4, point5];
        
        // render it
        var path = createObj("path", {
            _pageid: pageID,
            _path: JSON.stringify(points),
            fill: "transparent",
            top: 0,
            left: 0,
            layer: "map",
            stroke: "#0000ff",
            width: maxXY.x - minXY.x,
            height: maxXY.y = minXY.y
        });
        
    };

    var translateToZero = function pathTranslator(path) { // takes a roll20 path and returns a list of points
        var oldTop = path.get("top");
        var oldLeft = path.get("left");
        log("oldTop = " + oldTop + ", oldLeft = " + oldLeft);
        var pathPoints = JSON.parse(path.get("path"));
        log("non-translated points: " + JSON.stringify(pathPoints));
        var newPathPoints = [];
        _.each(pathPoints, function(pathPoint) {
            newPathPoints.push([pathPoint[0], pathPoint[1]+oldLeft, pathPoint[2]+oldTop]);          
        });
        log("translated points: " + newPathPoints);
        
        return newPathPoints;
    };
    
    var convertPaths = function pathConverter(pageID, output) { // output == "isometric" or "cartesian"
        log("entering convertPaths with " + pageID);
        
        if (output === undefined ) { output = "isometric"; }
        
        var paths = getPathsFromLayer(pageID, "map");

        var boundingBox = getBoundingBox(paths);
        drawBox(pageID, boundingBox[0], boundingBox[1]);

        
        _.each( paths, function(path) {
            
            // Convert the list of segment paths into paths.
            var newPathData = {
                _pageid: pageID,
                controlledby: path.get('controlledby'),
                fill: path.get('fill'),
                layer: path.get('layer'),
                stroke: path.get('stroke'),
                stroke_width: path.get('stroke_width'),
                top: path.get("top"),
                left: path.get("left"),
                //top: 0,
                //left: 0,
                scaleX: path.get("scaleX"),
                scaleY: path.get("scaleY"),
                width: path.get("width"), // **** maybe a bad idea
                height: path.get("height")
            };

            var points = translateToZero(path);
            
            // var points = JSON.parse(path.get("path"));
            
            var newPathPoints = [];
            
            _.each( points, function(point) {
                if (point[0] == "M" || point[0] == "L") { // probably not an oval.. we'll deal with those someday
                    var isoPoint;
                    if (output == "isometric" ) {
                        
                        isoPoint = topDownToIso(point);                     
                        
                    } else {
                        isoPoint = isoToTopDown(point);
                    }

                    newPathPoints.push(isoPoint);
                }
    
            });
            
            log("newPathPoints: " + newPathPoints);
            
            newPathData.path = JSON.stringify(newPathPoints);
            // prettyPrint("newPathData", newPathData);
            newPathData.top = 0;
            newPathData.left = 0;
            
            // var newPath = createObj("path", newPathData);
            
            //prettyPrint("newPath", newPath);
            
            
            // **** TODO **** figure out how to offset the path to fit the others.. rotate around group median instead of individual medians
            
        });
        
        
        log("exiting convertPaths");        
    };


    var prettyPrint = function JSONPrettifier(title, object) {
        if (!object) {
            return;
        } else {
            log("==>" + title + ": ");
            log("--------------------");
            _.each(_.keys(object), function keyLogger(key) {
                log("    " + key + ": " + object[key]);
            });
            log("--------------------");            
            
        }
        
    };





    
/*

ooooo                          .             oooo  oooo  
`888'                        .o8             `888  `888  
 888  ooo. .oo.    .oooo.o .o888oo  .oooo.    888   888  
 888  `888P"Y88b  d88(  "8   888   `P  )88b   888   888  
 888   888   888  `"Y88b.    888    .oP"888   888   888  
 888   888   888  o.  )88b   888 . d8(  888   888   888  
o888o o888o o888o 8""888P'   "888" `Y888""8o o888o o888o 

*/  
    
    
    
    
    var checkInstall = function () {
        log("/===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-===/");
        log("              Starting IsoMap Script               ");
        log("         current time is: " + Date.now() + "            ");        
        log("                                                   ");
        log("       To use, enter !IsoMap in chat.          ");
        log("/===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-===/");


        // Roll20 allows scripters to store persistent data in their "state" object.
        // We'll use the IsoMap property in state to store persistent info about this script for each campaign.
        // Notably: who's registered to leave automatic IsoMap trails.

        if( ! _.has(state,'IsoMap') ) { // first time running the IsoMap script for this Roll20 campaign. It needs a state.
            log('-=> IsoMap v'+version+' <=-  ['+(new Date(lastUpdate))+']');
            state.IsoMap = {
                version: schemaVersion
            };
        } else { // a IsoMap object already exists in the Roll20 persistent "state" object.

            var lengthOfStateConfig = _.size(state.IsoMap.config);
            var lengthOfIsoMapConfig = _.size(config);
            
            if (debugDEFCON < 2) { log("state.IsoMap.config = " + JSON.stringify(state.IsoMap.config) ); }
            if (debugDEFCON < 2) { log("config = " + JSON.stringify(config) ); }
            
            if ( state.IsoMap.version !== schemaVersion || lengthOfIsoMapConfig !== lengthOfStateConfig ) {
                log("Seems like the script got updated: " + state.IsoMap.version);
                log("Updating state.IsoMap.version to reflect current script: "+schemaVersion);

                state.IsoMap.version = schemaVersion;
                
                /* Reset to Default Settings for this campaign? */
                state.IsoMap.config = _.clone(config);
                
            }

            if (_.has(state.IsoMap, 'config')) {
                config = _.clone(state.IsoMap.config);
            } else {
                state.IsoMap.config = _.clone(config);
            }

        }
        
        if (_.has(state.IsoMap.config) && state.IsoMap.config.SHOW_HELP_ON_READY == 1) {
            IsoMap.ShowDetailedHelp('gm');
        }
    };

    
/* ---------------------------------------------------------------------------- */
    
                        /* --------------------- */
                        //    IN CONSTRUCTION    //
                        /* --------------------- */ 
    var checkGlobalConfig = function globalConfigChecker() {

        // Set the theme from the useroptions.
        var useroptions = globalconfig && globalconfig.IsoMap;
        if(useroptions) {
            state.IsoMap.config.SHOW_HELP_ON_READY = useroptions.SHOW_HELP_ON_READY;
            state.IsoMap.userOptions = {
                SHOW_HELP_ON_READY: useroptions.SHOW_HELP_ON_READY
            };
        }
    
        
    };
    
/* ---------------------------------------------------------------------------- */

    
    
    
    var registerEventHandlers = function() {
        if (debugDEFCON < 5) {
            log("IsoMap registered event handlers");
        }
        on('chat:message', handleInput );
        //on('change:graphic', handleTokenMove );
    };

    return {
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall,
        ShowDetailedHelp: showDetailedHelp
    };



}());







/*

    ooo        ooooo               .   oooo        .o.
    `88.       .888'             .o8   `888        888
     888b     d'888   .oooo.   .o888oo  888 .oo.   888
     8 Y88. .P  888  `P  )88b    888    888P"Y88b  Y8P
     8  `888'   888   .oP"888    888    888   888  `8'
     8    Y     888  d8(  888    888 .  888   888  .o.
    o8o        o888o `Y888""8o   "888" o888o o888o Y8P


*/



var plexUtils = plexUtils || (function plexsoupAwesomeMaths() {
    // Another module. This one for fun math. Adding and subtracting vectors, Distance, etc.
    var debugDEFCON = 5; // 5 = AOK: log nothing. 1 = FUBAR: log everything

    var getLongestVectorLength = function longestVectorGetter(vectorList) {
        // **** why is this returning a length of 3 for two dimensional vectors?

        if (debugDEFCON < 2) { log("entering getLongestVectorLength with: " + vectorList); }

        if (vectorList.length == 2) {
            if ( _.isNumber(vectorList[0]) ) {
                log("aborting getLongestVectorLength(" + vectorList + "). I think we got one vector (a single x,y location) instead of a list of vectors.");
                return(2);
            }
        } else {
            if (debugDEFCON<2) {log("vectorList.length = " + vectorList);}
        }

        var longestVectorLength = 0;


        _.each(vectorList, function loopToFindLongest(vector) {
            if (vector.length > longestVectorLength) {
                longestVectorLength = vector.length;
            }
        });

        if (debugDEFCON < 3) {
            log("getLongestVectorLength returning with: " + longestVectorLength);
        }

        return longestVectorLength;

    };

    var initializeVector = function vectorInitialiser(lengthRequired) {
        if (debugDEFCON < 2) { log("initializeVector called with " + lengthRequired); }
        var newVector = [];
        var elementID;
        for(elementID = 0; elementID < lengthRequired; elementID++) {
            newVector.push(0);
        }
        if (debugDEFCON < 2) { log("initializeVector returning with " + newVector); }
        return newVector;
    };

    var addVectors = function vectorAdder(listOfVectors) { // expects a 2d array.. [[point1, point2, ... pointN], ..., [pn1, pn2, ... pnN]]
        // assumes the input vectors are the same length: eg 2 coordinates each: X and Y

        if (listOfVectors.length == 2 ) { // make sure you're adding 2 vectors and not 2 points
            if (_.isNumber(listOfVectors[0])) {
                log("Aborting addVectors(" + listOfVectors + "). I think it contains one vector instead of two or more.");
                return listOfVectors; // bail out.. something went wrong. You got a point instead of 2 vectors
            }
        }

        if ( debugDEFCON < 2 ) { log("addVectors called with: " + listOfVectors); }

        var longestVectorLength = getLongestVectorLength(listOfVectors);
        var sumVector = initializeVector(longestVectorLength);




        var elementID = 0;
        var vectorNumber = 0;
        for(elementID=0; elementID<longestVectorLength; elementID++) {
            for(vectorNumber=0; vectorNumber<listOfVectors.length; vectorNumber++ ) {
                sumVector[elementID] += Number(listOfVectors[vectorNumber][elementID]);

            }
        }

        if (debugDEFCON < 3) {
            log("addVectors returning with: " + sumVector);
        }

        if ( debugDEFCON < 2 ) { log("addVectors returning " + sumVector); }
        return sumVector;

    };

    var scaleVector = function vectorExpander(vector, scalar) {
        if (debugDEFCON < 2) {
            log("scaleVector called with " + vector + ", " + scalar );
        }
        var newVector = _.map(vector, function scaleElement(elementValue) {
            return elementValue * scalar;
        });
        if (debugDEFCON < 2) {
            log("scaleVector returning with " + newVector );
        }
        return newVector;
    };

    var normalizeVector = function vectorNormalizer(point1, point2) { // expecting a list of 2 points [x1,y2], [x2,y2]
        if (debugDEFCON < 2) { log("entering normalizeVector with: " + point1 + ", " + point2); }

        var unitVector;
        var translatedVector = addVectors( [point2, scaleVector(point1, -1)] );

        var distance = getDistance(point1, point2);
        if (distance > 0) {
            unitVector = scaleVector(translatedVector, 1/distance );
        } else { // abort. can't divide by 0. Make something up instead.
            unitVector = translatedVector;
            if ( debugDEFCON<2) {log("trying to normalize a vector where the distance is zero. Can't divide by zero.");}
        }



        if (debugDEFCON < 2) { log("unitVector is: " + unitVector); }

        if (debugDEFCON < 2) { log("leaving normalizeVector with: " + unitVector); }
        return unitVector;

    };

    var getDistance = function distanceGetter(point1, point2) {
        // distance is squareroot of the squared sum of each side
        //if (debugDEFCON < 2) { log("entering getDistance with " + point1 + ", " + point2); }
        var xDist = Math.abs(point2[0] - point1[0]);
        var xDistSquared = Math.pow(xDist, 2);
        var yDist = Math.abs(point2[1] - point1[1]);
        var yDistSquared = Math.pow(yDist, 2);
        var distance = Math.sqrt(xDistSquared + yDistSquared);
        //if (debugDEFCON < 2) { log("returning from getDistance with " + distance); }
        return distance;
    };


    return {
        AddVectors: addVectors,
        ScaleVector: scaleVector,
        GetDistance: getDistance,
        NormalizeVector: normalizeVector

    };


}()); // End of Module: plexUtils


on("ready",function(){
    // this stuff happens when the script loads.
    // Note: you have to use Caps to refer to the left side of the function declarations in "return"
    IsoMap.CheckInstall(); // instantiate all the function expressions
    IsoMap.RegisterEventHandlers(); // instantiate all the listeners
    
    


});

*******************************************************************************
/*

        _/_/_/      _/_/_/      _/    _/  _/_/_/_/_/  _/_/_/  _/          _/_/_/   
       _/    _/  _/            _/    _/      _/        _/    _/        _/          
      _/_/_/      _/_/        _/    _/      _/        _/    _/          _/_/       
     _/              _/      _/    _/      _/        _/    _/              _/      
    _/        _/_/_/          _/_/        _/      _/_/_/  _/_/_/_/  _/_/_/       

*/

/*
    Purpose:
        Provide standardized, reusable utility functions to other plexsoup scripts.
        Not intended for standalone use.

        eg: Math, Chat, htmlEncoding
        
    Todo:
        - Go through other scripts and figure out what's duplicated and should be migrated here.

*/


var psUtils = function plexsoupUtils() {
    "use strict";
    
    var info = {
        version: 0.1,
        author: "plexsoup"
    };
    
    var config = {};
    var defaultConfig = {
        debug: true
    };


    var whisper = function chatMessageSender(playerName, message) {
        // sends a chat message to a specific player. Can use gm as playerName
        //sendChat(playerName, '/w ' + playerName + " " + message);
        sendChat("psIsoTravellers", '/w ' + playerName + " " + message);
    };

    var ch = function (c) {
        // This function will take a single character and change it to it's equivalent html encoded value.
        // psNote: I tried alternate methods of regexps to encode the entire string, but I always ran into problems with | and [] characters.
        var entities = {
            '<' : 'lt',
            '>' : 'gt',
            "'" : '#39',
            '@' : '#64',
            '{' : '#123',
            '|' : '#124',
            '}' : '#125',
            '[' : '#91',
            ']' : '#93',
            '"' : 'quot',
            '-' : 'mdash',
            ' ' : 'nbsp'
        };

        if(_.has(entities,c) ){
            return ('&'+entities[c]+';');
        }
        return '';
    };

    var inString = function stringFinder(stringToSearch, textToLookFor) {
        if (!stringToSearch || !textToLookFor) {
            log("==> Error: inString() missing params" + stringToSearch + ", " + textToLookFor);
            return undefined;
        }
        if ( stringToSearch.indexOf(textToLookFor) == -1 ) {
            return false;
        } else {
            return true;
        }
    };
    
    var makeButton = function buttonMakerForChat(title, command) { // expects two strings. Returns encoded html for the chat stream
        var output="";

            output += '['+title+']('+command+')';

        return output;
    };  

    // Another module. This one for fun math. Adding and subtracting vectors, Distance, etc.
    var debugDEFCON = 5; // 5 = AOK: log nothing. 1 = FUBAR: log everything

    var getLongestVectorLength = function longestVectorGetter(vectorList) {
        // **** why is this returning a length of 3 for two dimensional vectors?

        if (debugDEFCON < 2) { log("entering getLongestVectorLength with: " + vectorList); }

        if (vectorList.length == 2) {
            if ( _.isNumber(vectorList[0]) ) {
                log("aborting getLongestVectorLength(" + vectorList + "). I think we got one vector (a single x,y location) instead of a list of vectors.");
                return(2);
            }
        } else {
            if (debugDEFCON<2) {log("vectorList.length = " + vectorList);}
        }

        var longestVectorLength = 0;


        _.each(vectorList, function loopToFindLongest(vector) {
            if (vector.length > longestVectorLength) {
                longestVectorLength = vector.length;
            }
        });

        if (debugDEFCON < 3) {
            log("getLongestVectorLength returning with: " + longestVectorLength);
        }

        return longestVectorLength;

    };

    var initializeVector = function vectorInitialiser(lengthRequired) {
        if (debugDEFCON < 2) { log("initializeVector called with " + lengthRequired); }
        var newVector = [];
        var elementID;
        for(elementID = 0; elementID < lengthRequired; elementID++) {
            newVector.push(0);
        }
        if (debugDEFCON < 2) { log("initializeVector returning with " + newVector); }
        return newVector;
    };

    var addVectors = function vectorAdder(listOfVectors) { // expects a 2d array.. [[point1, point2, ... pointN], ..., [pn1, pn2, ... pnN]]
        // assumes the input vectors are the same length: eg 2 coordinates each: X and Y

        if (listOfVectors.length == 2 ) { // make sure you're adding 2 vectors and not 2 points
            if (_.isNumber(listOfVectors[0])) {
                log("Aborting addVectors(" + listOfVectors + "). I think it contains one vector instead of two or more.");
                return listOfVectors; // bail out.. something went wrong. You got a point instead of 2 vectors
            }
        }

        if ( debugDEFCON < 2 ) { log("addVectors called with: " + listOfVectors); }

        var longestVectorLength = getLongestVectorLength(listOfVectors);
        var sumVector = initializeVector(longestVectorLength);




        var elementID = 0;
        var vectorNumber = 0;
        for(elementID=0; elementID<longestVectorLength; elementID++) {
            for(vectorNumber=0; vectorNumber<listOfVectors.length; vectorNumber++ ) {
                sumVector[elementID] += Number(listOfVectors[vectorNumber][elementID]);

            }
        }

        if (debugDEFCON < 3) {
            log("addVectors returning with: " + sumVector);
        }

        if ( debugDEFCON < 2 ) { log("addVectors returning " + sumVector); }
        return sumVector;

    };

    var scaleVector = function vectorExpander(vector, scalar) {
        if (debugDEFCON < 2) {
            log("scaleVector called with " + vector + ", " + scalar );
        }
        var newVector = _.map(vector, function scaleElement(elementValue) {
            return elementValue * scalar;
        });
        if (debugDEFCON < 2) {
            log("scaleVector returning with " + newVector );
        }
        return newVector;
    };

    var normalizeVector = function vectorNormalizer(point1, point2) { // expecting a list of 2 points [x1,y2], [x2,y2]
        if (debugDEFCON < 2) { log("entering normalizeVector with: " + point1 + ", " + point2); }

        var unitVector;
        var translatedVector = addVectors( [point2, scaleVector(point1, -1)] );

        var distance = getDistance(point1, point2);
        if (distance > 0) {
            unitVector = scaleVector(translatedVector, 1/distance );
        } else { // abort. can't divide by 0. Make something up instead.
            unitVector = translatedVector;
            if ( debugDEFCON<2) {log("trying to normalize a vector where the distance is zero. Can't divide by zero.");}
        }



        if (debugDEFCON < 2) { log("unitVector is: " + unitVector); }

        if (debugDEFCON < 2) { log("leaving normalizeVector with: " + unitVector); }
        return unitVector;

    };

    var getDistance = function distanceGetter(point1, point2) {
        // distance is squareroot of the squared sum of each side
        //if (debugDEFCON < 2) { log("entering getDistance with " + point1 + ", " + point2); }
        var xDist = Math.abs(point2[0] - point1[0]);
        var xDistSquared = Math.pow(xDist, 2);
        var yDist = Math.abs(point2[1] - point1[1]);
        var yDistSquared = Math.pow(yDist, 2);
        var distance = Math.sqrt(xDistSquared + yDistSquared);
        //if (debugDEFCON < 2) { log("returning from getDistance with " + distance); }
        return distance;
    };

    var getCurrentPage = function currentPageGetter(tokenObjOrPlayerID) { // expects token, playerID, or string=="gm"
    // **** TODO **** This isn't working as expected. Go through it and check assertions.
    
        if ( debugDEFCON < 5) { log( "entering getCurrentPage with " + tokenObjOrPlayerID ); }
        var currentPage;
        var playerID;
        var playerObj;
        var gmID = getGameMasterID();
        if ( debugDEFCON < 5) {
            log("   gmID = " + gmID);
        }

        if (tokenObjOrPlayerID === undefined ) { // getCurrentPage received bad parameters, but we'll take care of it.
            log("==> Error in getCurrentPage. tokenObjOrPlayerID == undefined"); 
            return Campaign().get("playerpageid");
            
        } else if ( tokenObjOrPlayerID == "gm") {
            tokenObjOrPlayerID = gmID;
            if (gmID) {
                // currentPage = getObj("player", gmID).get("lastpage");            
                return Campaign().get("playerpageid");
            } else {
                return Campaign().get("playerpageid");              
            }           
        
            
            
        } else if ( _.isString(tokenObjOrPlayerID) ) { // it's a player ID
            if (debugDEFCON < 4) { log("    tokenObjOrPlayerID was a string. Assume player_id: " + tokenObjOrPlayerID); }
            playerID = tokenObjOrPlayerID;
            playerObj = getObj("player", playerID);
            
            if (playerIsGM(playerID)) { // it's the GM, use the lastpage property to find their page
                if (debugDEFCON < 4) { 
                    log("    player_id is a GM");
                    log("    playerObj.get('lastpage') returns " + playerObj.get("lastpage") );
                    //log("    Campaign().get('playerpageid') returns " + Campaign().get("playerpageid") );
                }
                
                currentPage = playerObj.get("lastpage"); // NOTE: there's no lastpage unless the GM has been on another page
                
            } else if ( Campaign().get("playerspecificpages")[playerID] ) {
                if ( debugDEFCON < 4 ) { 
                    log("    player_id is not a GM, and the players are seperated onto different pages"); 
                    log("    playerspecificpages = " + Campaign().get("playerspecificpages") );
                }
                
                
                // Note: there's no playerspecificpages unless a single player name is dragged onto another map
                currentPage = Campaign().get("playerspecificpages")[playerID];

            } else { // it's a player and the players are all on one page.
                if (debugDEFCON < 4) { log("    player_id is not a GM, but there's only one page"); }
                currentPage = Campaign().get("playerpageid");               
            }
        } else if ( _.isObject(tokenObjOrPlayerID) ) { // it's a token
            if (debugDEFCON < 4) { log("    tokenObjOrPlayerID was an object. Assume token: " + JSON.stringify(tokenObjOrPlayerID) ); }
            var token = tokenObjOrPlayerID;
            currentPage = token.get("page_id");
        }
        
        if (debugDEFCON < 4) { log("exiting getCurrentPage. Returning " + currentPage ); } 
        
        return currentPage;
    };

    
    
    return {
        AddVectors: addVectors,
        ScaleVector: scaleVector,
        GetDistance: getDistance,
        NormalizeVector: normalizeVector,
        GetCurrentPage: getCurrentPage

    };
    


}()); // end module


