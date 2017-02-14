
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
        enter !LightTrails in chat      
*/


/*
    Notes for reviewing this code: 
        Through various rewrites, we've called the Torch Tokens: Crumbs, LightCrumbs, TokenObj, TokenGraphic, Torch, TorchIcon
*/

/* 
    TODO List and Bugs:
        Change the aura colors to represent the players who control the torch token, not the name or the parent tokenid. Players is more relevant.
*/


var psLightTrails = psLightTrails || (function plexsoupLightTrailMaker() {
    "use strict";

    // var debug = config.debug; // set to true if you want to see logs

    var info = {
        name: "psLightTrails",
        module: psLightTrails,
        version: "0.77",
        author: "plexsoup"
    };

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
        SHARED_AURA_COLOR: "#FAF0E6",
        debug: false,
    };

    //var userCommands;
    var config = _.clone(defaultConfig); // this'll get updated from state.psLightTrails.config
    
    
        
    var LightTrailsImageURL = ICONS.torch;

    var activeLightTrailsMappers = []; // so we can register token._id for characters who are set as mappers.



/*


      ooooooo8   ooooo  oooo  ooooo
    o888    88    888    88    888
    888    oooo   888    88    888
    888o    88    888    88    888
     888ooo888     888oo88    o888o

*/

// [listener, commandName, functionToCall, parameters, shortDesc, longDesc, defaultParams]
        
/*
    --clear token_id --> reset(pageID, token_id, "hard" || "soft")
    --destroy token_id --> reset(pageID, "all", "hard")
    --register token_id --> registerMapper(token_id, playername)
    --deregister token_id --> deregisterMapper(tokenID, playername)
    --status --> getLightTrailsStatus(pageID)
    --drop --> token_id --> 
    
*/
        
        
        
    var initializeUserCommands = function() {
        var newUserCommands = [];
        
        var registerCMD = new psGUI.userCommand();
            registerCMD.commandName = "--register";
            registerCMD.functionToCall = registerMapper;
            registerCMD.parameters = ["token_id"];
            registerCMD.shortDesc = "Register Mapper";
            registerCMD.longDesc = "Turn on LightTrails for this Token";
            registerCMD.inputOverrides = _.noop;
            registerCMD.group = "Mappers";
        newUserCommands.push(registerCMD);
        
        var deregisterCMD = new psGUI.userCommand();
            deregisterCMD.commandName = "--deregister";
            deregisterCMD.functionToCall = deregisterMapper;
            deregisterCMD.parameters = ["token_id"];
            deregisterCMD.shortDesc = "Deregister Mapper";
            deregisterCMD.longDesc = "Turn off LightTrails for this Token.";
            deregisterCMD.inputOverrides = _.noop;
            deregisterCMD.group = "Mappers";
        newUserCommands.push(deregisterCMD);
        
        newUserCommands.push( new psGUI.userCommand(
            "!psLightTrails",
            "--deregisterAll",
            deregisterAllMappers,
            [],
            "Deregister All Mappers",
            "Clear the entire registry of mappers so no one leaves light trails. Note, this does not remove active trails or torch icons.",
            _.noop,
            "Mappers"
        ));     
        newUserCommands.push(new psGUI.userCommand(
            "!psLightTrails",
            "--clear",
            softReset,
            ["current_page_id"],
            "Hide Light Trails",
            "Move all the Torch Tokens To the GM Layer for later reuse.",
            _.noop,
            "Trails"
        ));
        newUserCommands.push(new psGUI.userCommand(
            "!psLightTrails",
            "--reveal",
            function (pageID) {
				var hiddenLightCrumbs = getTorchTokensFromLayer("gmlayer", pageID);
				_.each(hiddenLightCrumbs, function (currentTorchToken){			
					currentTorchToken.set({ layer: 'objects' });                         
				});
			},
            ["current_page_id"],
            "Reveal Light Trails",
            "Move all the Torch Tokens Back To the Objects Layer so players can see them again.",
            _.noop,
            "Trails"
        ));
		
		
		
		
		
		
        newUserCommands.push(new psGUI.userCommand(
            "!psLightTrails",
            "--destroy",
            hardReset,
            ["current_page_id"],
            "Remove Light Trails",
            "Remove all the torch tokens altogether.",
            _.noop,
            "Trails"
        ));
        newUserCommands.push(new psGUI.userCommand(
            "!psLightTrails",
            "--chooseTorchIcon",
            chooseIcon,
            ["string", "current_page_id"],
            "Torch",
            "The torch icon is suitable for fantasy maps and horror.",
            ["torch", undefined],
            "Graphic"
        ));
        newUserCommands.push(new psGUI.userCommand(
            "!psLightTrails",
            "--chooseTorchIcon",
            chooseIcon,
            ["string", "current_page_id"],
            "Transparent",
            "The transparent icon works well if you don't want visible torches on the map.",
            ["transparent", undefined],
            "Graphic"
        ));
        newUserCommands.push(new psGUI.userCommand(
            "!psLightTrails",
            "--chooseTorchIcon",
            chooseIcon,
            ["string", "current_page_id"],
            "Beacon",
            "The beacon icon works well on Science Fiction maps and modern settings.",
            ["scifi", undefined],
            "Graphic"
        ));
        
        var setAuraRadiusCMD = new psGUI.userCommand();
        var AuraCMD = setAuraRadiusCMD; 
        AuraCMD.commandName = "--setAuraRadius";
        AuraCMD.functionToCall = setAuraRadius;
        AuraCMD.parameters = ["num", "current_page_id"];
        AuraCMD.shortDesc = "Radius";
        AuraCMD.longDesc = "Set the radius of the Auras";
        AuraCMD.inputOverrides = _.noop;
        AuraCMD.group = "Auras";
        newUserCommands.push(AuraCMD);

        var setLightRadiusCMD = new psGUI.userCommand();
        var slrCMD = setLightRadiusCMD;
        slrCMD.commandName = "--setLightRadius";
        slrCMD.functionToCall = setLightRadius;
        slrCMD.parameters = ["num", "current_page_id"];
        slrCMD.shortDesc = "Light Radius";
        slrCMD.longDesc = "Set the radius of the light emitted by dropped torches. (Only in effect if 'Inherit Light Settings' is off.)";
        slrCMD.inputOverrides = _.noop;
        slrCMD.group = "Light Settings";
        newUserCommands.push(slrCMD);

        var setDimRadiusCMD = new psGUI.userCommand();
        var sdrCMD = setDimRadiusCMD;
        sdrCMD.commandName = "--setDimRadius";
        sdrCMD.functionToCall = setDimRadius;
        sdrCMD.parameters = ["num", "current_page_id"];
        sdrCMD.shortDesc = "Dim Radius";
        sdrCMD.longDesc = "Set the radius where dim light starts. (Only in effect if 'Inherit Light Settings' is off.)";
        sdrCMD.inputOverrides = _.noop;
        sdrCMD.group = "Light Settings";
        newUserCommands.push(sdrCMD);
        
        var setCrumbSeparation = new psGUI.userCommand();
        var scsCMD = setCrumbSeparation;
        scsCMD.commandName = "--setCrumbSeparation";
        scsCMD.functionToCall = setCrumbSeparation;
        scsCMD.parameters = ["num", "current_page_id"];
        scsCMD.shortDesc = "Torch Separation";
        scsCMD.longDesc = "Distance between 'Light Crumbs' aka Dropped Torches. It's reasonable to set this to the same distance a character can move in one turn.";
        scsCMD.inputOverrides = _.noop;
        scsCMD.group = "Light Settings";
        newUserCommands.push(scsCMD);
        
        var toggleDropLocationCMD = new psGUI.userCommand();
        var tdlCMD = toggleDropLocationCMD;
        tdlCMD.commandName = "--toggleDropLocation";
        tdlCMD.functionToCall = toggleDropLocation;
        tdlCMD.parameters = ["current_player_name"];
        tdlCMD.shortDesc = "Drop Location";
        tdlCMD.longDesc = "Toggle whether dropped torches appear at your characters' last known location or at the current location with a small offset. Offset looks cooler, but may sometimes put a torch on the wrong side of a wall.";
        tdlCMD.inputOverrides = _.noop;
        tdlCMD.group = "Toggles";
        newUserCommands.push(tdlCMD);
        
        
        
        newUserCommands.push(new psGUI.userCommand(
            "!psLightTrails",
            "--toggleShowAura",
            toggleShowAura,
            ["current_page_id"],
            "Toggle Show_Aura",
            "Turn visible Auras on or off.",
            _.noop,
            "Auras"
        ));
        
        var toggleInheritLightSettingsCMD = new psGUI.userCommand();
        var ILScmd = toggleInheritLightSettingsCMD;
        ILScmd.commandName = "--toggleInheritLight";
        ILScmd.functionToCall = function(pageID, playerName) {
                config.INHERIT_CHARACTER_LIGHTING = !config.INHERIT_CHARACTER_LIGHTING;
                convertCrumbsToNewSettings(pageID, {light_radius: 0, light_dimradius: 0}, true);
                sendChat(info.name, "/w " + playerName + " config.INHERIT_CHARACTER_LIGHTING == " + config.INHERIT_CHARACTER_LIGHTING);
        };
        ILScmd.parameters = ["current_page_id", "current_player_name"];
        ILScmd.shortDesc = "Inherit Light Settings";
        ILScmd.longDesc = "Inheriting light settings sets all light trails (composed of dropped torches) to use the same light_radius and dim_radius values as the character token which dropped them.";
        ILScmd.inputOverrides = {};
        ILScmd.group = "Toggles";
        newUserCommands.push(ILScmd);
        
        var statusCMD = new psGUI.userCommand();
        statusCMD.commandName = "--status";
        statusCMD.functionToCall = getLightTrailsStatus;
        statusCMD.parameters = ["current_page_id", "current_player_name"];
        statusCMD.shortDesc = "Status";
        statusCMD.longDesc = "Provides detailed information about state of " + info.name + " script.";
        statusCMD.inputOverrides = {};
        statusCMD.group = "Info";
        newUserCommands.push(statusCMD);
        
        
        var toggleDebugCMD = new psGUI.userCommand();
        var tbCMD = toggleDebugCMD;
        tbCMD.commandName = "--toggleDebug";
        tbCMD.functionToCall = function(playerName) {
            config.debug = !config.debug;
            sendChat(info.name, "/w " + playerName + " config.debug == " + config.debug );
        };
		tbCMD.parameters = ["current_player_name"];
        tbCMD.shortDesc = "Debug";
		tbCMD.longDesc = "Toggle Debug messages sent to log.";
		tbCMD.inputOverrides = {};
		tbCMD.group = "Toggles";
		newUserCommands.push(tbCMD);
        
        _.each(newUserCommands, function(userCommand) {
            userCommand.listener = "!"+info.name;
            userCommand.module = info.module;
            userCommand.restrictedToGM = true;
        });
        
        return newUserCommands;
    };




    
/*                                                        
        _/_/_/  _/      _/  _/_/_/    _/    _/  _/_/_/_/_/   
         _/    _/_/    _/  _/    _/  _/    _/      _/        
        _/    _/  _/  _/  _/_/_/    _/    _/      _/         
       _/    _/    _/_/  _/        _/    _/      _/          
    _/_/_/  _/      _/  _/          _/_/        _/          
*/




    var setAuraRadius = function auraRadiusSetter(radius, pageID) {
        config.AURA_RADIUS = radius;
        simpleConvertCrumbs(undefined, {aura1_radius: radius} );
    };

    var toggleShowAura = function showAuraToggler(pageID) {
        config.SHOW_AURA = !config.SHOW_AURA;
        if (config.SHOW_AURA === false ) { 
            simpleConvertCrumbs(pageID, {aura1_radius: ""} );
        } else {
            simpleConvertCrumbs(pageID, {aura1_radius: config.AURA_RADIUS});
        }
    }; 
    
    var setLightRadius = function lightRadiusSetter(radius, pageID) {
        config.LIGHT_RADIUS = radius;
        simpleConvertCrumbs(pageID, {light_radius: radius} );
    };
    
    var setDimRadius = function dimRadiusSetter(radius, pageID) {
        config.DIM_RADIUS = radius;
        simpleConvertCrumbs(pageID, {light_dimradius: radius});
    };
    
    var setCrumbSeparation = function crumbSeperationSetter(distance, pageID) {
        config.DROP_DISTANCE = distance;
        // no point converting the existing crumbs.
    };

    var toggleDropLocation = function dropLocationToggler(playerName) {
        config.DROP_AT_PREVIOUS_LOCATION = !config.DROP_AT_PREVIOUS_LOCATION;
        var msgStr = "/w " + playerName + " ";
        msgStr += "DROP_AT_PREVIOUS_LOCATION == " + config.DROP_AT_PREVIOUS_LOCATION + ". ";
        if (config.DROP_AT_PREVIOUS_LOCATION === false) {
            msgStr += "Torches will drop beside the token, with an offset of " + config.OFFSET;
        } else {
            msgStr += "Torches will drop at the token's previous location.";
        }
        sendChat(info.name, msgStr);
    };
    
    var chooseIcon = function iconChooser(iconName, pageID) {
        if (pageID === undefined || pageID === "") {
            pageID = psUtils.GetPlayerPage("gm");
        }
        if ( _.has(ICONS, iconName) ) {
            config.IMAGE = ICONS[iconName];
            simpleConvertCrumbs(pageID, {imgsrc: ICONS[iconName]} );            
        } else {
            log("==> Error: requested icon isn't in the list of available icons. Modify ICONS if you need more.");
        }
    };

    
/*    
    var displayTorchGUI = function torchGUIDisplay() {
        var buttonStr = "";
        _.each (ICONS, function(icon) {
            psGUI.makeButton("torch", "");
            
        });
    };
*/
        
    var getLightTrailsStatus = function (pageID, playerName) {
        if (config.debug) log("entering getLightTrailsStatus with " + pageID + ", " + playerName);

        var statusMessage = "";
        statusMessage = "<h4>"+activeLightTrailsMappers.length + " Active Mappers</h4>";

        
        statusMessage += "<ul>";
        var currentMapperName;
        _.each(activeLightTrailsMappers, function loopToListMappers(currentMapperID) {
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

        statusMessage += "<h4>"+getTorchTokensFromLayer("objects", pageID).length + " Active LightTrails</h4>";
        
        statusMessage += "<h4>Config Options</h4>";

        var configMessage = JSON.stringify(config);
        var prettyConfigMessage = "";

        _.each(configMessage.split(","), function loopToBuildMessage(currentOption) {
            prettyConfigMessage += "<div style='font-size: smaller'>" + currentOption + "</div>";
        });

        statusMessage += prettyConfigMessage;   
        
        sendChat(info.name, "/w " + playerName + " " + statusMessage);
        
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
    
    var getCurrentPage = function(playerID) {
        return psUtils.GetPlayerPage(playerID);
    };

    var hardReset = function hardResetter(pageID) {
        reset(pageID, "all", "hard");
    };
    
    var softReset = function softResetter(pageID) {
        reset(pageID, "all", "soft");       
    };


    var reset = function resetter(pageID, parentTokenID, resetMode) {
        
        if (resetMode === undefined ) {
            resetMode = "soft";
        }
        
        if (config.debug) { log("entering reset with " + pageID); }
        //state.psLightTrails.count=0;
        
        // test pageID.
        if (!getObj("page", pageID)  ) { // this pageID is not valid.
            log("==> Error: This pageID is not valid: " + pageID);
            return -1;
        } else {
            if (config.debug) { log("    in reset: pageID is valid: " + pageID); }
        }
        
        
        if (pageID === undefined) {
            log("==> Error: reset(pageID, parentTokenID, resetMode) didn't receive a pageID");
            //pageID = psUtils.GetPlayerPage("gm");  
            pageID = Campaign().get("playerpageid");
            
        }
        
        if (parentTokenID !== "all") {
            // Check to see if you grabbed a torch or a character
            var gmNotesOnToken = getObj("graphic", parentTokenID).get("gmnotes");
            if (getObj("graphic", gmNotesOnToken) ) { // for some reason the gmnotes contains the _id of a token... maybe it's a torch
                var foundInActiveList = activeLightTrailsMappers.indexOf(gmNotesOnToken);
                parentTokenID = gmNotesOnToken;
            }       
            psGUI.whisper("gm", "Removing trail belonging to " + getObj("graphic", parentTokenID).get("name"));
        }


        
        _.each(ICONS, function loopToGrabAllTheTorchIcons(imageUrl) {

            _.each(findObjs({
                    _pageid: pageID,
                    _type: 'graphic',
                    _subtype: 'token',
                    imgsrc: imageUrl,
                    
                    
                }), function loopToHideLightTrails(currentTorchToken){
                    
                    if ( parentTokenID == currentTorchToken.get("gmnotes") || parentTokenID == "all") {
                        if (resetMode == "soft") {
                            currentTorchToken.set({ // hide the lightcrumb token, but keep it available for later reuse - saves html lookups
                                layer: 'gmlayer',
                                //top: 35,
                                //left: 35,
                                //imgsrc: config.IMAGE,
                                //gmnotes: "",
                                //aura1_color: "#ffffff",
                                //name: "LightTrails"
                            });                         
                        } else { // resetMode == "hard"
                            currentTorchToken.remove(); // destroy it!
                        }
                    }
                }
            );
        });
    };

    var getAuraColor = function auraColorGetter(parentTokenID) {
        // **** TODO **** Change this to controlledby instead of parentToken
        if (parentTokenID === undefined || parentTokenID === "" ) {
            // log("==> Error in getAuraColor. No token provided")
            return "#ffffff";
        }
        
        if (config.SHARED_VISION === true) {
            return config.SHARED_AURA_COLOR;
        }
    
        // log("entering getAuraColor with " + parentTokenID);
        var colors = ["#ff0000", "#ff9900", "#ffcc66", "#ff3300", "#ff6600", "#cc9900", "#ffff99"];
        var mappers = activeLightTrailsMappers;
        // log("activeLightTrailsMappers = " + JSON.stringify(activeLightTrailsMappers) );
        
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
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    var simpleConvertCrumbs = function crumbConverter(pageID, requestedOptions) {
        if (config.debug) log("entering simpleConvertCrumbs with " + pageID + ", " + requestedOptions);
        if (pageID === undefined) {
            pageID = psUtils.GetPlayerPage("gm");
        }
        var crumbsToConvert = getTorchTokensFromLayer("objects", pageID);
        
        _.each(crumbsToConvert, function loopToChangeCrumbs(torchToken) {
            _.each(requestedOptions, function(propertyValue, propertyName) {
                //if (config.debug) psGUI.psLog(info.name + ": setting " + propertyValue + " to " + propertyName, "orange");
                torchToken.set(propertyName, propertyValue);
            });
        });
    };
    
    var convertCrumbsToNewSettings = function crumbsResetter(pageID, requestedOptions, resetRequired) { // requestedOptions are an object with typical roll20 graphic object properties
        
        if (requestedOptions === undefined) {
            requestedOptions = {light_otherplayers: config.SHARED_VISION};          
        }
        
        if (config.debug) {log("entering convertCrumbsToNewSettings with " + JSON.stringify(arguments) ); }

        if (pageID === undefined ) {
            log("==> Error: convertCrumbsToNewSettings didn't receive a pageID");
            pageID = psUtils.GetPlayerPage("gm");
        }
        
        if (!requestedOptions || requestedOptions.size === 0 ) { // figure out what needs resetting, exactly.
            log("==> didn't see any options for the conversion.. what's up?");          
        }
        
        
        _.each(ICONS, function(imageUrl) { // note: this won't find anything where the user passed their own url to !LightTrails-image
            if (config.debug) {log("checking for: " + imageUrl);}
            _.each(findObjs({
                    _pageid: pageID,
                    _type: 'graphic',
                    _subtype: 'token',
                    imgsrc: imageUrl
                }), function convertCrumbToNewSettings(currentCrumb){ // do this stuff once for every torch icon
                    if (config.debug) { log("converting lightcrumb token: " + currentCrumb.get("_id")); }
                    
                    // figure out who owns it.
                    
                    var currentCrumbID = currentCrumb.get("_id");
                    if (config.debug) { log("currentCrumbID = " + currentCrumbID); }
                    var parentTokenID = getParentTokenID(currentCrumbID);
                    if (config.debug) { log("in convertCrumbsToNewSettings: parentTokenID = " + parentTokenID); }
                    
                    // remove "all" from the list of controlling tokens                 
                    var controlledByArray = currentCrumb.get("controlledby").split(",");
                    controlledByArray = _.without(controlledByArray, "all");
                    var controlledByString = controlledByArray.join(",");
                    if (config.debug) { log("in convertCrumbToNewSettings: controlledByString = " + controlledByString); }
                    // then add it back if it's needed.
                    if (config.SHARED_VISION === true) { // add "all" to controlledby 
                        controlledByString += ",all";
                        requestedOptions.light_otherplayers = true;
                    } else {
                        requestedOptions.light_otherplayers = false;
                        if (controlledByString === "") { // looks like a character is set to all players instead of a specific character
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
                            log("here's the list of mappers" + JSON.stringify(activeLightTrailsMappers));
                        } else {
                            if (config.debug) log("setting light_radius same as token " + parentToken.get("name"));
                            if (config.debug) log("light_radius: " + parentToken.get("light_radius") + " , light_dimradius: " + parentToken.get("light_dimradius") );
                            requestedOptions.light_radius = parentToken.get("light_radius");
                            requestedOptions.light_dimradius = parentToken.get("light_dimradius");                          
                        }
                    }

                    
                    _.each(requestedOptions, function(propertyName) {
                        currentCrumb.set(propertyName, requestedOptions[propertyName]);
                    });
            });
        });

        if (config.debug) {log("leaving convertCrumbToNewSettings. Nothing to return."); }
    };

    
    
    
    var getTokenObjectFromID = function tokenConverter(requestedTokenID) {
        var errors = [];
        var targetToken;

        // **** TODO **** What happens if you get/need more than one token id?
        if (config.debug) {
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
        if (config.debug) { log("entering getParentTokenID with " + lightCrumbID); }
        
        var lightCrumbObj = getObj("graphic", lightCrumbID );
        if (!lightCrumbObj) {
            log("==> Error: couldn't find object matching id: " + lightCrumbID);
            return -1;
        } else {
            var parentTokenID = lightCrumbObj.get("gmnotes");

            if (config.debug) { log("exiting getParentTokenID: returning " + parentTokenID); }
            
            return parentTokenID;           
        }

    };
    


    
    
    var getTorchTokensFromLayer = function lightCrumbFinder(layer, pageID) {
        // expects "objects" or "gmlayer" and a valid page_id

        if (!pageID) {
            log("==> Error: getTorchTokensFromLayer expected a pageID but didn't receive one");
            pageID = psUtils.GetPlayerPage("gm");
        }

        if (config.debug) {
            log("entered getTorchTokensFromLayer(" + layer + ", " + pageID + ")");
        }

        var torchTokens = [];
        _.each( ICONS, function(imgsrc, iconName) {
            var specificTorchTokens = findObjs({
                type: 'graphic',
                subtype: 'token',
                imgsrc: imgsrc,
                layer: layer,
                pageid: pageID
            });
            torchTokens = torchTokens.concat(specificTorchTokens);
        });

        if (config.debug) {
            log("leaving getTorchTokensFromLayer: returning LightTrailsMakerSupply = " + torchTokens);
        }
        return(torchTokens);
    };


    
    
    
    var deregisterAllMappers = function allMappersDeregistrar() {
        activeLightTrailsMappers = [];
        state.psLightTrails.activeMappers = [];
        psGUI.whisper("gm", info.name + ": All mappers deregistered.");
    };




    
    var deregisterMapper = function mapperDeregistrar(tokenID, playerName) {
        if (playerName === undefined || playerName === "") {
            playerName = "gm";
        }
        
        if (config.debug) { log("entering deregisterMapper with " + tokenID + "," + playerName );}
        
        var tokenObj = getObj("graphic", tokenID);
        if (tokenObj !== undefined) { // We got a tokenID. Remove it from the list of active mappers
        
            // rearrange the colors list so other mappers can keep their existing color         
            var mapperNum = activeLightTrailsMappers.indexOf(tokenID);
            var mapperColor = COLORS[mapperNum];
            // log("COLORS before: " + COLORS);
            COLORS = _.without(COLORS, mapperColor);
            COLORS.push(mapperColor);
            // log("COLORS after: " + COLORS);
            state.psLightTrails.colors = _.clone(COLORS);
            
            // remove the mapper from the list
            // log("activeLightTrailsMappers before: " + activeLightTrailsMappers);
            activeLightTrailsMappers = _.without(activeLightTrailsMappers, tokenID);
            state.psLightTrails.activeMappers = _.clone(activeLightTrailsMappers);
            // log("activeLightTrailsMappers after: " + activeLightTrailsMappers);
            psGUI.whisper(playerName, "Removed " + tokenObj.get("name") + " from the list of active mappers." );
        }
    };



    
    var registerMapper = function mapperRegistrar(tokenID, playerName) {
        if (config.debug) { log("entered registerMapper with: " + tokenID + ", " + playerName); }
        if (playerName === undefined) { playerName = "gm"; }

        var statusMessage = "";
        var targetToken = getTokenObjectFromID(tokenID);
        var tokenOwner = targetToken.get("controlledby");
        var tokenCoords = [targetToken.get("left"), targetToken.get("top")];
        var tokenName = targetToken.get("name");
        var currentPage = targetToken.get("_pageid");
        if (!tokenName) { tokenName = ""; }

        if ( activeLightTrailsMappers.indexOf(tokenID) == -1 ) { // you're not yet registered
            activeLightTrailsMappers.push(tokenID);
            state.psLightTrails.activeMappers.push(tokenID); // save this in the Roll20 state object so it's persistent between sessions.
            statusMessage = 'Added ' + tokenName + ' to the list of active mappers.';
            statusMessage += '<div style="font-size: smaller; text-align: center;">(ID: '+ tokenID + ')</div>';
            psGUI.whisper(playerName, statusMessage);
            
            var displayName = getDisplayName(tokenName);

            if (config.debug) {
                log("In registerMapper: added " + tokenID + " to list of Active mappers" + activeLightTrailsMappers);
                log("in registerMapper: dropped LightTrails: [" + tokenCoords + "], " + currentPage);
            }
        }


    };



    var getOffsetLocation = function offsetLocationGetter(currentLocation, lastLocation) { // expect two points [x,y], [x1,y1]

        var offsetUnitVector = psMath.NormalizeVector(currentLocation, lastLocation);
        if (config.debug) {log("offsetUnitVector = " + offsetUnitVector);}
        var offsetScaledVector = psMath.ScaleVector(offsetUnitVector, config.OFFSET);
        if (config.debug) {log("offsetScaledVector = " + offsetScaledVector);}
        var offsetLocation = psMath.AddVectors([currentLocation, offsetScaledVector]);
        if (config.debug) {log("offsetLocation = " + offsetLocation);}

        if (offsetLocation == []) {
            log("Couldn't find an offset location. Setting it to currentLocation");
            offsetLocation = currentLocation;
        }

        if (config.debug) { log("offsetVector = " + offsetUnitVector); }
        if (config.debug) { log("offsetLocation = " + offsetLocation); }
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


    var dropSingleTorch = function lightCrumbDropper(customLightTrailsSettings, parentToken) { // expects an object with properties matching roll20 graphic objects

        if (config.debug) { log("entered dropSingleTorch with " + JSON.stringify(customLightTrailsSettings)); }

        // **** TODO: go through this list of variables and clear unused ones out

        var LightTrailsMakerSupply,
            currentTorchToken,
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

            
            
        var defaultLightTrailsSettings = {
            imgsrc: config.IMAGE,
            subtype: 'token',
            pageid: psUtils.GetPlayerPage("gm"),
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
            name: "Default LightTrails",
            gmnotes: parentToken
        };

        
        
        for (var propertyName in defaultLightTrailsSettings) { // compare custom settings with default and fill them out where needed.
            if ( customLightTrailsSettings.hasOwnProperty(propertyName) === false ) {
                customLightTrailsSettings[propertyName] = defaultLightTrailsSettings[propertyName];
            }
        }       

        currentPageID = customLightTrailsSettings.pageid;

        LightTrailsMakerSupply = getTorchTokensFromLayer("gmlayer", currentPageID);
        currentTorchToken = LightTrailsMakerSupply.pop();

        if(currentTorchToken) {
            
            if (config.debug) { log("Found existing lightCrumb on GM Layer" + currentTorchToken); }
            
            currentTorchToken.set(customLightTrailsSettings);
            // log( "dropped old, salvaged currentTorchToken: " + JSON.stringify(currentTorchToken) );          
            
        } else { // no existing lightcrumb found. Make a new one.
            if (config.debug) { log("No existing lightcrumb. About to make one."); }
            currentTorchToken = createObj('graphic',customLightTrailsSettings);
            
            if (config.debug) {log( "dropped brand new currentTorchToken: " + JSON.stringify(currentTorchToken) );}
        }

        if (currentTorchToken) {
            // **** ! Clean this section up. It's a mess. 
                // Move it into or before the customLightTrailsSettings object gets built.
            if (customLightTrailsSettings.controlledby.indexOf('all')) {
                
                if (config.SHOW_AURA ) {

                    if (config.SHARED_VISION === false) {
                        auraColor = getAuraColor(currentTorchToken.get("gmnotes"));
                    } else {
                        auraColor = config.SHARED_AURA_COLOR;
                    }
                    currentTorchToken.set({
                        aura1_radius: config.AURA_RADIUS,
                        aura1_color: auraColor,
                        showplayers_aura1: true
                    });
                } else {
                    currentTorchToken.set("showplayers_aura1", false);
                }
                
                if (config.SHOW_NAMES) {
                    currentTorchToken.set({
                        // name: "all",
                        showname: true,
                        showplayers_name: true
                    });                 
                } else { // hide the name
                    currentTorchToken.set({
                        // name: "all",
                        showname: false,
                        showplayers_name: false
                    });                 
                }
            } else { // "all" does not appear in the list: controlledby for the token.
                
                if (config.SHOW_NAMES ) {
                    currentTorchToken.set({
                        showname: true,
                        showplayers_name: true                  
                    });
                } else { // hide the name
                    currentTorchToken.set({             
                        showname: false,
                        showplayers_name: false                 
                    });
                }

                if (config.SHOW_AURA) {
                    
                    currentTorchToken.set({
                        aura1_radius: config.AURA_RADIUS,
                        aura1_color: getAuraColor(currentTorchToken.get("gmnotes")),
                        showplayers_aura1: true
                    });                 
                } else { // hide the aura
                    currentTorchToken.set({
                        showplayers_aura1: false
                    });                 
                }
                
            }           
            
            
            toBack(currentTorchToken);
        } else {
            log("==> Something seems wrong. dropSingleTorch Tried to set the Z-order to back, but there was no LightTrails object to move.");
        }

        if (config.debug) {
            log( "Dropped a LightTrails with the following properties: " + JSON.stringify(currentTorchToken) );
            var allLightTrailsOnPlayerLayer = getTorchTokensFromLayer("objects", currentPageID);
            log("There are " + allLightTrailsOnPlayerLayer.length + " known torch tokens on object layer: ");
        }

        if (config.debug) { log("leaving dropSingleTorch. Returning currentTorchToken." + JSON.stringify(currentTorchToken)); }
        
        return currentTorchToken;
        
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
        
        if (config.debug) { log("entering findShortestDistance with: " + listOfGraphicObjectsToCompare + ", " + referenceLocation + ", " + tokenMoved); }

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
            var currentDistance = psMath.GetDistance(targetLocation, referenceLocation);
            if ( shortestDistance == -1 || currentDistance < shortestDistance ) {
                shortestDistance = currentDistance;
            }

        });

        if (config.debug) { log("leaving findShortestDistance: returning shortestDistance = " + shortestDistance); }
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
        
        if (config.debug) { log("lastmove for " + token.get("name") + ", " + token.get("_id") + " = " + token.get("lastmove") ); }
        var movementPath = token.get("lastmove").split(",");
        
        var lastLocation = [];
        
        lastLocation[0] = Number(movementPath[0]); // important to type convert them into numbers
        lastLocation[1] = Number(movementPath[1]);
        
        return lastLocation;
        
    };


    var handleTokenMove = function tokenMoveHandler(tokenMoved) {
        if (config.debug) { log("entering handleTokenMoved with: " + tokenMoved); }
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
        

        if (activeLightTrailsMappers.indexOf(tokenID) !== -1) { // you're authorized to leave a trail of light.. continue
            if(config.debug) {log("in handleTokenMove. About to get tokenLocation");}
            // tokenLocation = [tokenMoved.get("left"), tokenMoved.get("top")];

            
            // figure out which lightcrumbs you own.
            var crumbsToConsider = getTorchTokensFromLayer("objects", tokenPageID);
            if (config.debug) { log("crumbsToConsider before SHARED_VISION test: " + _.size(crumbsToConsider) ); }
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
            if (config.debug) { log("crumbsToConsider after SHARED_VISION test: " + _.size(crumbsToConsider + ", " + JSON.stringify(crumbsToConsider)) ); }
                        
            shortestDistanceToExistingCrumb = findShortestDistance(crumbsToConsider, referenceLocation, tokenMoved);            

            if (config.debug) { log("config.DROP_DISTANCE: " + config.DROP_DISTANCE + ", Current Distance: " + shortestDistanceToExistingCrumb); }

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
                if (config.debug) { log("LightTrails.handleTokenMove: registered token, "+ tokenID +", moved. dropping light token"); }
                
                // var controllingPlayerID = tokenMoved.get("controlledby"); // fails
                
                var activeCharacter = getObj("character", tokenMoved.get("represents"));
                var tokenController = tokenMoved.get("controlledby");
                
                var controllingPlayerID;

                if (activeCharacter !== undefined) { // this token represents an actual character, use the character.controlledby settings for the torches

                    var controllingPlayersList = activeCharacter.get("controlledby");                   
                    var controllingPlayersArray = controllingPlayersList.split(",");
                    var actualPlayersArray = _.without(controllingPlayersArray, "all");
                    var firstPlayerListed = actualPlayersArray[0];
                    controllingPlayerID = firstPlayerListed;
                    
                    if (controllingPlayerID === undefined) {
                        controllingPlayerID = "all";
                    }
                    // figure out the first one that's not "all players"
                
                } else if ( tokenController !== "") { // this token is controlled by a player, use that setting for the torches
                    controllingPlayerID = tokenController;
                    
                } else { // there's no one assigned to the token
                    controllingPlayerID = "";
                    psGUI.whisper("gm", info.name + ": Be aware: There's no player assigned to that token (" + tokenMoved.get("name") + "). No one can 'see through' its dropped torches since no players control them.");
                }
                // **** NOTE: you might have problems if characters have multiple owners
                
                if (config.debug) { log("    in handleTokenMove: controllingPlayerID = " + controllingPlayerID ); }
                if ( config.SHARED_VISION === true ) {
                    controllingPlayerID += ",all";
                }
                
                var displayName = getDisplayName(tokenName);

                
                var customLightTrailsSettings = {
                    left: referenceLocation[0],
                    top: referenceLocation[1],
                    pageid: tokenPageID,
                    controlledby: controllingPlayerID,
                    name: displayName,
                    aura1_color: getAuraColor(parentTokenID)
                };
                
                if (config.SHARED_VISION) {
                    customLightTrailsSettings.light_otherplayers = true;
                } else {
                    customLightTrailsSettings.light_otherplayers = false;
                }
                
                
                if (config.INHERIT_CHARACTER_LIGHTING) {
                    customLightTrailsSettings.light_radius = tokenMoved.get("light_radius");
                    customLightTrailsSettings.light_dimradius = tokenMoved.get("light_dimradius");
                    
                }

                var currentTorchToken = dropSingleTorch(customLightTrailsSettings, tokenMoved.get("_id")); //movementDrop

                if (config.debug) { log("    in handleTokenMove: dropped LightTrails [" + lastLocation + "], "+ tokenPageID); }

            }

        }
        if (config.debug) { log("leaving handleTokenMove. Nothing to return."); }
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
        log(info.name + " installed" );
        
        var userCommands = initializeUserCommands();
        psGUI.RegisterUserCommands(userCommands);
        psGUI.BuildHelpFiles(userCommands, info.name);
        
        
        // Roll20 allows scripters to store persistent data in their "state" object.
        // We'll use the LightTrails property in state to store persistent info about this script for each campaign.
        // Notably: who's registered to leave automatic LightTrails trails.

        if( ! _.has(state,'psLightTrails') ) { // first time running the LightTrails script for this Roll20 campaign. It needs a state.
            log(info.name + " v" + info.version + " installed");
            state.psLightTrails = {
                version: info.version,
                activeMappers: [],
                colors: COLORS,
                config: config

            };
        } else { // a LightTrails object already exists in the Roll20 persistent "state" object.

            var lengthOfStateConfig = _.size(state.psLightTrails.config);
            var lengthOfLightTrailsConfig = _.size(config);
            
            if (config.debug) { log("state.psLightTrails.config = " + JSON.stringify(state.psLightTrails.config) ); }
            if (config.debug) { log("config = " + JSON.stringify(config) ); }
            
            if ( state.psLightTrails.version !== info.version || lengthOfLightTrailsConfig !== lengthOfStateConfig ) {
                state.psLightTrails.version = info.version;             

                /* Reset to Default Settings for this campaign? */
                state.psLightTrails.config = _.clone(config);
            }

            
            if (_.has(state.psLightTrails, 'activeMappers')) {
                activeLightTrailsMappers = _.clone(state.psLightTrails.activeMappers);
            } else {
                state.psLightTrails.activeMappers = _.clone(activeLightTrailsMappers);
            }

            if (_.has(state.psLightTrails, 'config')) {
                config = _.clone(state.psLightTrails.config);
            } else {
                state.psLightTrails.config = _.clone(config);
            }

            if (_.has(state.psLightTrails, 'colors')) {
                COLORS = _.clone(state.psLightTrails.colors);
            } else {
                state.psLightTrails.colors = _.clone(COLORS);
            }


        }
        
        
    };

    var registerEventHandlers = function() {
        log(info.name + " listening.");
        
        //on('chat:message', handleInput ); // let psGUI handle this.
        on('change:graphic', handleTokenMove );
        
    };

    return {
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall,
        registerMapper: registerMapper,
        deregisterMapper: deregisterMapper,     
        deregisterAllMappers: deregisterAllMappers,
        reset: reset,
        softReset: softReset,
        hardReset: hardReset,
        setAuraRadius: setAuraRadius,
        toggleShowAura: toggleShowAura,
        setLightRadius: setLightRadius,
        setDimRadius: setDimRadius,
        setCrumbSeparation: setCrumbSeparation,
        toggleDropLocation: toggleDropLocation,
        getLightTrailsStatus: getLightTrailsStatus
        
    };



}());





