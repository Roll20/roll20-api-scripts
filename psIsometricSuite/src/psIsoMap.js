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

