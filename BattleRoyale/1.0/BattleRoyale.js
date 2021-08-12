// Battle Royale version 0.1.0
// Last Updated: 2021-05-18
// Transforms a Roll20 Campaign into a Battle Royale, playable without a GM present, so that everyone can take part!
// Contact:  https://app.roll20.net/users/1183802/jakob-s

var battleRoyale = battleRoyale || (function()
{
    'use strict';

    let version = '0.1.0',

        /* ----- CONFIGURABLE VARIABLES ----- */

        battleroyale_page_prefix = "[BR]", //Only allow Battle Royale commands to be used on pages with starting with this prefix eg. "[BR]Arena". Leave empty if you want them to work everywhere.
        allow_claim = true, //Allow players to use the command !claim to gain control over a character in the journal
        visible_spectators = true, //If false the spectator ghosts will be fully invisible to contestants and other spectators.
        spectator_vision_range = 300, //How spectators can see.
        show_health_bars = false, //Make a contestants health bar visible to other players
        initial_token_vision = 0, //How far can tokens see when created.
        grant_vision_range = 300, //Range of vision granted by the "Grant Vision" token macro. If set to 0 "Grant Vision" macro will be removed.
        sound_ping_radius = 200, //Range of randomness for sound pings. Default is a random location within 200 pixels of the center of the token. Default tile size is 70 pixels.

        //Token images
        spawnImg = "https://s3.amazonaws.com/files.d20.io/images/222396436/MRra05-JhBHi1AEL-OrvyA/thumb.png?1621081090", //Texture used for spawnpoints
        doorImg = "https://s3.amazonaws.com/files.d20.io/images/222898695/K-qXoJLvgypMFIKS4kUHmg/thumb.png?1621259804", //Texture used for doors
        defaultContestantImg = "https://s3.amazonaws.com/files.d20.io/images/131655898/DFizBm-scn3xyBMx2oCZrw/thumb.png?1588781694", //Texture used for new contestants

        /* ----- END OF CONFIGURABLE VARIABLES ----- */

        clear = "https://s3.amazonaws.com/files.d20.io/images/222893597/GYElfClsU8pNer28xyFa1w/thumb.png?1621256597",
        exampleMapImg = "https://s3.amazonaws.com/files.d20.io/images/222549461/TYOn1kf-0im3qJiUkQpw_A/thumb.jpg?1621119567",
        turnKey = 0, //Key used to ensure players don't accidentally skip several turns
        battleRoyaleMap = false, //Are we on a page starting with battleroyale_page_prefix

        //Advance the turn tracker
        nextTurn = function(msg){

            //Checks if a key was specified (eg. '!nextturn 1234' rather than simply '!nextturn')
            var key = msg.content.replace("!nextturn", "");
            if (key != ""){
                if(key != turnKey){ //If there is a key but it doesnt match the expected key
                    chat("/w \"" + msg.who + "\" It is not your turn.");
                    return;
                }
                else{
                    turnKey = randomInteger(99999); //Generate a new random key for next turn.
                }
            }

            //Fetch the turn order
            var turnorder;
            if(Campaign().get("turnorder") === "") turnorder = [];
            else turnorder = JSON.parse(Campaign().get("turnorder"));

            //Shift the top-most turn out of the list and push it back into the bottom of the list.
            var t = turnorder.shift();
            turnorder.push(t);

            //Save the turnorder
            Campaign().set("turnorder", JSON.stringify(turnorder));

            //Handle the new turn.
            newTurn();
        },

        //Fired when a new turn starts or when any changes are made to the turn order
        newTurn = function(){

            //Fetch the turn order
            var turnorder;
            if(Campaign().get("turnorder") === "") turnorder = [];
            else turnorder = JSON.parse(Campaign().get("turnorder"));

            if(turnorder[0]["id"] != -1){
                var obj = getObj("graphic", turnorder[0]["id"]);

                if(obj != null){
                    var name = obj.get("name");
                    chat("/desc " + name + "'s turn!");

                    chat("/w " + name.split(" ")[0] + " [Click here when your turn is done](!nextturn " + turnKey + ")");
                }
            }
            else{
                turnorder[0]["pr"]--;

                if(turnorder[0]["pr"] <= 0)
                {
                    chat("/desc " + turnorder[0]["custom"] + " has ended!");
                    turnorder.shift();
                }
                else{
                    setTimeout(function() {
                        nextTurn();
                    }, 500);
                }
            }
        },

        //!orderturn. Sorts the turn order.
        orderTurn = function(){
            var turnorder;

            if(Campaign().get("turnorder") === "") turnorder = [];
            else turnorder = JSON.parse(Campaign().get("turnorder"));

            turnorder.sort((a,b) => (a.pr < b.pr) ? 1 : ((b.pr < a.pr) ? -1 : 0))

            Campaign().set("turnorder", JSON.stringify(turnorder));
        },

        //!turntracker. Displays/Hides the turn tracker.
        turnTracker = function(){
            if(Campaign().get("initiativepage") == false)
                Campaign().set("initiativepage", Campaign().get("playerpageid"));
            else
                Campaign().set("initiativepage", false);
        },

        //!clearturn. Clears the turn order.
        clearTurn = function(){
            Campaign().set("turnorder", JSON.stringify([]));
        },

        //!counter [Duration] [Name] eg. *'!count 10 Hold Person'*. Starts a counter in the turn tracker.
        startCounter = function(msg){
            var rounds = msg.content.replace("!counter", "").split(" ")[1];
            var name = msg.content.replace("!counter " + rounds + " ", "");

            var turnorder;
            if(Campaign().get("turnorder") === "") turnorder = [];
            else turnorder = JSON.parse(Campaign().get("turnorder"));

            turnorder.push({
                id: "-1",
                pr: rounds,
                custom: name
            });

            Campaign().set("turnorder", JSON.stringify(turnorder));
        },

        //!remove [entry name]. Removes the given entry from the turn tracker. Usefull for removing counters when casters lose concentration etc.
        removeTurn = function(msg){
            var turnorder;
            var name = msg.content.replace("!remove ", "");

            if(Campaign().get("turnorder") === "") turnorder = [];
            else turnorder = JSON.parse(Campaign().get("turnorder"));

            _.each(turnorder,function(turn){
                if(turn.custom === name){
                    turn.pr = 0;
                }
            });

            //turnorder.shift();
            Campaign().set("turnorder", JSON.stringify(turnorder));
        },

        //!spawn. Sends everyone to different random spawn points. If tokens share status markers it will team them up on a single spawn point.
        spawn = function(msg){

            // Find all character tokens on the board
            var fighters = findObjs({
                _pageid: Campaign().get("playerpageid"),
                _subtype: "token",
                layer: "objects"
            }).filter(x => x.get("name") != "Spectator" && x.get("name") != "Door");

            //Find all Spawn Points
            var spawnTokens = findObjs({
                _pageid: Campaign().get("playerpageid"),
                _subtype: "token",
                name: "Spawn Point"
            });

            var teamSpawns = [];

            _.each(fighters, function(obj) {
                var rand = Math.floor(Math.random() * spawnTokens.length); //random number of spawntoken

                //If the fighter is on a team, check if another fighter on the same team already spawned, if so, change our random spawnpoint to that one
                var team = obj.get("statusmarkers");
                if(team != ""){
                    var found = false;
                    _.each(teamSpawns, function(spawn){
                        if(spawn.team === team){
                            found = true;
                            rand = spawn.id;
                        }
                    });

                    if(!found) teamSpawns.push({team: team, id: rand});
                }

                if(spawnTokens[rand] != null){
                    var l = spawnTokens[rand].get("left");
                    var t = spawnTokens[rand].get("top");

                    obj.set("left", l);
                    obj.set("top", t);

                    setTimeout(function() {
                        sendPing(l, t, Campaign().get('playerpageid'), null, true, obj.get("controlledby"));

                        spawnTokens.splice(rand, 1);
                    }, 200);
                }
                else{
                    chat("/w \"" + msg.who + "\" Something went wrong. Ensure that sufficient spawn points are created for the amount of tokens.");
                }
            });

            chat("/desc Moving players to random spawnpoints!");
        },

        //!vision [Range]. Gives a token vision out to a certain range. A large number can be given for effective "Daylight"
        vision = function(msg){
            var range = msg.content.replace("!vision", "");
            if(range === "") range = 60;

            if(msg.selected != null){
                _.each(msg.selected, function(obj){

                    var token = getObj(obj["_type"], obj["_id"]);

                    token.set("has_bright_light_vision", true);
                    token.set("has_night_vision", true);
                    token.set("night_vision_distance", range);

                });
            }
            else{
                chat("/w \"" + msg.who + "\" Please select a token and try again.");
            }
        },

        //!spectate. Summons a little ghost in the top left corner of the map and pings the player to it.
        spectate = function(msg){

            //Spooky ghosts
            var specArts = [
                "https://s3.amazonaws.com/files.d20.io/images/223050311/NRTmRefSmgg3fkox6zsUcQ/thumb.png?1621330767",
                "https://s3.amazonaws.com/files.d20.io/images/223050122/uGwpC2eccg84b1Bimyb2xw/thumb.png?1621330592",
                "https://s3.amazonaws.com/files.d20.io/images/223050152/l0w9hi3jGZQAbXxnRxcwIw/thumb.png?1621330617",
                "https://s3.amazonaws.com/files.d20.io/images/223050186/Tx9fNwzaidGDWV2xx69Rgg/thumb.png?1621330644",
                "https://s3.amazonaws.com/files.d20.io/images/223050291/DLPPKb8Ud8hvR6O2HA3Ang/thumb.png?1621330746"
            ];

            var specArt = visible_spectators ? specArts[randomInteger(specArts.length)-1] : clear;

            var spec = createObj('graphic', {
                _type: "graphic",
                _subtype: "token",
                _pageid: Campaign().get("playerpageid"),
                imgsrc: specArt,
                top: 35,
                left: 35,
                width: 70,
                height: 70,
                fliph: (randomInteger(2) === 2),
                layer: "objects",
                controlledby: msg.playerid,
                night_vision_distance: spectator_vision_range,
                has_bright_light_vision: true,
                has_night_vision: true,
                name: "Spectator"
            });

            sendPing(35, 35, Campaign().get('playerpageid'), null, true, msg.playerid);

            chat("/desc " + msg.who + " is now spectating!")
        },

        //!size [size]. Sets the token to a certain size.
        size = function(msg){
            var size = msg.content.replace("!size ", "");

            if(msg.selected != null){
                _.each(msg.selected, function(obj){

                    var token = getObj(obj["_type"], obj["_id"]);
                    var ps = 70;

                    switch(size){
                        case "medium": ps = 70; break;
                        case "large": ps = 140; break;
                        case "huge": ps = 210; break;
                        case "gargantuan": ps = 280; break;
                        default:
                            chat("/w \"" + msg.who + "\" Invalid size. Accepted sizes are 'medium', 'large', 'huge' or 'gargantuan'.");
                            return;
                            break;
                    }

                    token.set("width", ps);
                    token.set("height", ps);

                });
            }
            else{
                chat("/w \"" + msg.who + "\" Please select a token and try again.");
            }
        },

        //!claim [character name]. Takes control of a character sheet in the journal
        claim = function(msg){
            if(!allow_claim) return;

            var name = msg.content.replace("!claim ", "");

            var chars = findObjs({
                _type: "character"
            });

            _.each(chars, function(char){
                if(char.get("name").toLowerCase().includes(name.toLowerCase())){

                    var controllers = char.get("controlledby");

                    if(controllers != "") controllers += ",";
                    controllers += msg.playerid;
                    char.set("controlledby", controllers);
                    char.set("inplayerjournals", controllers);
                }
            });
        },

        //!door [door id]. Opens or closes a door. Since it uses the token id it isn't useful as a manual command unless written as "!door @{target|token_id}"
        toggleDoor = function(msg){
            var doorId = msg.content.replace("!door ", "")
            var doorToken;

            if(msg.content == "!door" && msg.selected.length == 1){
                doorToken = getObj(msg.selected[0]["_type"],msg.selected[0]["_id"]);
            }
            else{
                doorToken = getObj("graphic", doorId);
            }

            if(doorToken == null || doorToken.get("name") != "Door") return;

            var doorColor = doorToken.get("bar1_value")+";"+doorToken.get("bar2_value");
            var doorBlock;

            if(doorColor == ";"){
                var a = randomInteger(999999);
                var b = randomInteger(999999);
                doorToken.set("bar1_value", a);
                doorToken.set("bar2_value", b);
                doorColor = a+";"+b;
            }

            doorBlock = findObjs({
                _type: "path",
                fill: "#"+doorColor.split(";")[0],
                stroke: "#"+doorColor.split(";")[1],
                _pageid: doorToken.get("_pageid")
            })[0];

            if(doorBlock != null){
                if(doorBlock.get("layer") === "gmlayer") doorBlock.set("layer", "walls");
                else doorBlock.set("layer", "gmlayer");
            }
            else{
                primeDoor(doorToken);
            }
        },

        primeDoor = function(doorToken){
            createObj("path",{
                left: doorToken.get("left"),
                top: doorToken.get("top"),
                _path: "[[\"M\",0,0],[\"L\",76,0]]",
                width: 76,
                rotation: doorToken.get("rotation"),
                layer: "walls",
                _pageid: doorToken.get("_pageid"),
                fill: "#"+doorToken.get("bar1_value"),
                stroke: "#"+doorToken.get("bar2_value")
            });
        },

        //!invis. Makes a token transparent, and hides any status markers until redone.
        toggleInvisible = function(msg){
            if(msg.selected != null){
                _.each(msg.selected, function(obj){
                    var token = getObj(obj["_type"], obj["_id"]);
                    var imgsrc = token.get("imgsrc");

                    if(imgsrc === clear){
                        var src = token.get("gmnotes").split("imgsrc:")[1].split(";")[0];
                        token.set("imgsrc", src);

                        var markers = token.get("gmnotes").split("markers:")[1].split(";")[0];
                        token.set("statusmarkers", markers);
                    }
                    else{
                        token.set("gmnotes", token.get("gmnotes").replace(token.get("gmnotes").split("markers:")[1].split(";")[0],token.get("statusmarkers")));
                        token.set("statusmarkers", "");
                        token.set("imgsrc", clear);
                    }
                });
            }
            else{
                chat("/w \"" + msg.who + "\" Please select a token and try again.");
            }
        },

        //pings a location within 200 pixels of the character. Useful for letting other contestants know your general location if unseen buy noisy.
        soundPing = function(msg){

            var range = msg.content.replace("!soundping ");
            if(msg.selected != null){
                _.each(msg.selected, function(obj){
                    var token = getObj(obj["_type"], obj["_id"]);
                    sendPing(token.get("left") - sound_ping_radius + randomInteger(sound_ping_radius*2), token.get("top") - sound_ping_radius + randomInteger(sound_ping_radius*2), Campaign().get('playerpageid'), null, true);
                });
            }
            else{
                chat("/w \"" + msg.who + "\" Please select a token and try again.");
            }

        },

        //changes to a new map using !map [page name, excluding the battleroyale_page_prefix tag].
        changeMap = function(msg){
            var pageName = msg.content.replace("!map ", "");

            var brPages = findObjs({
                type: "page"
            }).filter(x => x.get("name").substring(0, battleroyale_page_prefix.length) === battleroyale_page_prefix);

            var page = brPages.filter(x => x.get("name").toLowerCase() === (battleroyale_page_prefix + pageName).toLowerCase())[0];

            if(page != null)
                Campaign().set("playerpageid", page.get("_id"));
            else {
                var maplist = "";

                _.each(brPages, function(brp){
                    maplist += "'" + brp.get("name").replace(battleroyale_page_prefix, "") + "'\n";
                });

                if(msg.content === "!map")
                    chat("/w \"" + msg.who + "\" Currently available maps are: " + maplist);
                else
                    chat("/w \"" + msg.who + "\" No page called '" + battleroyale_page_prefix + pageName + "' found. Currently available maps are: " + maplist);
            }
        },

        help = function(target){
            var greet = "<div style='border:2px solid #c6c6c6'>";
            greet += "<span style='display:block; background-color:#eeeeee; padding: 5px; text-align: center'><strong>Battle Royale Commands</strong></span>";
            greet += "<span style='display:block; background-color:#d7d7d7; padding: 5px; text-align: center'><i>If you haven't done so already, import your character to the game, then claim it using the button in chat.</i></span>";
            greet += "<span style='display:block; background-color:#e3e3e3; padding: 5px'>**Spectate:** !spectate or [Click here to Spectate](!spectate) </span>";
            greet += "<span style='display:block; background-color:#d7d7d7; padding: 5px'>**Move Everyone to Spawns:** !spawn </span>";
            greet += "<span style='display:block; background-color:#e3e3e3; padding: 5px'>**Spell Duration Counter:** !counter [Duration] [Name] eg. *'!count 10 Hold Person'* </span>";
            greet += "<span style='display:block; background-color:#d7d7d7; padding: 5px'>**Displays/Hides Turn Tracker:** !turntracker </span>";
            greet += "<span style='display:block; background-color:#e3e3e3; padding: 5px'>**Order Turn Tracker:** !orderturn </span>";
            greet += "<span style='display:block; background-color:#d7d7d7; padding: 5px'>**Clear Turn Tracker:** !clearturn </span>";
            greet += "<span style='display:block; background-color:#e3e3e3; padding: 5px'>**Advance Turn Tracker:** !nextturn </span>";
            greet += "<span style='display:block; background-color:#d7d7d7; padding: 5px'>**Remove Turn Tracker Entry:** !remove [entry name] </span>";
            greet += "</div>";

            chat("/w \"" + target + "\" " + greet);

        },

        /* ------------------- */
        /*  Utility Functions  */
        /* ------------------- */

        //shorthand for sendChat('Battle Royale', message);
        chat = function(message){
            var who = message.includes("/desc") ? "" : "Battle Royale";
            sendChat(who, message+"");
        },

        //function to quickly verify if message is a specific command
        cmd = function(cmd, msg){
            if (msg.content.substring(0, cmd.length+1) === "!" + cmd && msg.type === "api")
                return true;
            else
                return false;
        },

        //Shorthand command for creating a token macro ability on a character
        createAbility = function(char, name, action){
            var existing = findObjs({
                _type: "ability",
                name: name,
                _characterid: char.get("_id"),
            })[0];

            if(existing == null && char.get("name") != "Door"){
                createObj('ability', {
                    _characterid: char.get("_id"),
                    name: name,
                    action: action,
                    istokenaction: true
                });
            }
        },

        createAbilities = function(char){
            createAbility(char, "Grant Vision", "!vision " + grant_vision_range);
            createAbility(char, "Change Vision Range", "!vision ?{range|60}");
            createAbility(char, "Open/Close Door", "!door @{target|Door|token_id}");
            createAbility(char, "Toggle Invisibility", "!invis");
            createAbility(char, "Change Size", "!size ?{Size|medium|large|huge|gargantuan}");
            createAbility(char, "Sound Ping", "!soundping " + sound_ping_radius);
        },

        //Checks if the current player page starts with the battleroyale_page_prefix
        checkMap = function(){
            battleRoyaleMap = (getObj("page", Campaign().get("playerpageid")).get("name").substr(0, battleroyale_page_prefix.length) === battleroyale_page_prefix);
        },

        //Creates the Door and Spawn Point characters in the journal
        createUtilChars = function(){
            var alreadyDone = (findObjs({_type: "character"}).filter(x => x.get("name") === "Door" || x.get("name") === "Spawn Point").length >= 2);
            if(alreadyDone) return;

            var dc = createObj("character", {
                name: "Door",
                avatar: doorImg
            });

            createObj("character", {
                name: "Spawn Point",
                avatar: spawnImg
            });

            createObj("ability", {
                name: "Open/Close Door",
                action: "!door",
                istokenaction: true,
                _characterid: dc.get("_id")
            });

        },

        //Generates an example map
        createExampleMap = function(page){
            var alreadyDone = (findObjs({_type: "page", name: battleroyale_page_prefix+"Example"}).length >= 1);
            if(alreadyDone) return;

            page.set({
                name: battleroyale_page_prefix + "Example",
                dynamic_lighting_enabled: true,
                daylight_mode_enabled: false,
                width: 50,
                height: 50,
                grid_opacity: 0,
                lightupdatedrop: true
            });

            var map = createObj("graphic",{
                imgsrc: exampleMapImg,
                _pageid: page.get("_id"),
                layer: "map",
                width: 70*50,
                height: 70*50,
                top: 35*50,
                left: 35*50
            });

            var spawnpoints = [
                {x: 6, y: 3},
                {x: 40, y: 7},
                {x: 6, y: 19},
                {x: 24, y: 25},
                {x: 7, y: 35},
                {x: 21, y: 43},
                {x: 44, y: 40}
            ];

            _.each(spawnpoints, function(spawn){
                createObj("graphic",{
                    imgsrc: spawnImg,
                    _pageid: page.get("_id"),
                    layer: "objects",
                    width: 70,
                    height: 70,
                    top: spawn.y*70-35,
                    left: spawn.x*70-35
                });
            });

            var doors = [
                {x: 7.5, y: 12, r:1},
                {x: 12.5, y: 19, r:1},
                {x: 24, y: 23.5, r:0},
                {x: 20.5, y: 26, r:1}
            ];

            var doorChar = findObjs({type: "character", name: "Door"})[0];

            _.each(doors, function(spawn){
                var doorToken = createObj("graphic",{
                    name: "Door",
                    imgsrc: doorImg,
                    _pageid: page.get("_id"),
                    layer: "objects",
                    width: 70,
                    height: 70,
                    top: spawn.y*70-35,
                    left: spawn.x*70-35,
                    rotation: 90*spawn.r,
                    bar1_value: randomInteger(999999),
                    bar2_value: randomInteger(999999),
                    isdrawing: true,
                    represents: doorChar.get("_id")
                });

                primeDoor(doorToken);
            });

            var walls = [{_id: "-M_jdbRcwZt_e-3JtQc8",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,140],[\"L\",0,0],[\"L\",210,0]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 140,layer: "walls",left: 1505,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 1680,width: 210},{_id: "-M_jdgmsZ5JTu_uyDc2V",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,51],[\"L\",97,0],[\"L\",175,163]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 163,layer: "walls",left: 2829.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 2085.5,width: 175},{_id: "-M_jdhxrqn9kDHzvS4bM",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,0],[\"L\",117,202],[\"L\",88,218]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 218,layer: "walls",left: 3018.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 2356,width: 117},{_id: "-M_jdiaMBZUmC-4_ccBN",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,0],[\"L\",71,138]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 138,layer: "walls",left: 2663.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 2329,width: 71},{_id: "-M_jdkg6tKFplrXqSRAi",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",97,19],[\"L\",39,0],[\"L\",0,19]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 19,layer: "walls",left: 2773.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ff0000",stroke_width: 5,top: 2498.5,width: 97},{_id: "-M_jdqFEJID-zIerHMc4",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",149,0],[\"L\",76,69],[\"L\",62,103],[\"L\",0,131]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 131,layer: "walls",left: 2346.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ff0000",stroke_width: 5,top: 2613.5,width: 149},{_id: "-M_jdr6rfBa5kLanC-Wi",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,0],[\"L\",46,29]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 29,layer: "walls",left: 2500,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ff0000",stroke_width: 5,top: 3007.5,width: 46},{_id: "-M_jduP3OwI_jgeVmjli",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",4,0],[\"L\",0,28],[\"L\",22,28],[\"L\",27,3],[\"L\",4,0]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 28,layer: "walls",left: 1237.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ff0000",stroke_width: 5,top: 191,width: 27},{_id: "-M_jdvgFGiKAxkJpTnZ2",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,0],[\"L\",6,22],[\"L\",35,29],[\"L\",35,14],[\"L\",0,0]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 29,layer: "walls",left: 1805.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ff0000",stroke_width: 5,top: 854.5,width: 35},{_id: "-M_jdwedLMSiMP1Uc3Et",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",4,7],[\"L\",0,31],[\"L\",20,29],[\"L\",27,0],[\"L\",4,7]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 31,layer: "walls",left: 1938.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ff0000",stroke_width: 5,top: 256.5,width: 27},{_id: "-M_je-CXYtJTp8sCI5Il",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 2590.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ff0000",stroke_width: 5,top: 408.5,width: 59},{_id: "-M_je0-ja7BXrQ982cpt",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 2770.935483870968,rotation: 0,scaleX: 0.6854838709677419,scaleY: 0.6854838709677419,stroke: "#ff0000",stroke_width: 5,top: 706.4354838709678,width: 59},{_id: "-M_je2-jZeAoZmoKsOSa",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 3044,rotation: 0,scaleX: 0.69,scaleY: 0.69,stroke: "#ff0000",stroke_width: 5,top: 447,width: 59},{_id: "-M_je2rbHyWYNyMpsDJM",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 2903,rotation: 0,scaleX: 0.69,scaleY: 0.69,stroke: "#ff0000",stroke_width: 5,top: 834,width: 59},{_id: "-M_je52NoBGoZL34pjOD",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 2591.242414151925,rotation: 0,scaleX: 0.9475754422476569,scaleY: 0.9475754422476569,stroke: "#ff0000",stroke_width: 5,top: 1894.9920915712798,width: 59},{_id: "-M_je8acR4ZXPWFLnf0n",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 2235,rotation: 0,scaleX: 0.95,scaleY: 0.95,stroke: "#ff0000",stroke_width: 5,top: 1043,width: 59},{_id: "-M_je9rN6LgiCCtnQhkF",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 1544,rotation: 0,scaleX: 0.95,scaleY: 0.95,stroke: "#ff0000",stroke_width: 5,top: 900,width: 59},{_id: "-M_jeBNcJ0yxGVQMUr_r",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 1924,rotation: 0,scaleX: 0.69,scaleY: 0.69,stroke: "#ff0000",stroke_width: 5,top: 868,width: 59},{_id: "-M_jeDGFxwfS7wcXgqGr",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 875,rotation: 0,scaleX: 0.69,scaleY: 0.69,stroke: "#ff0000",stroke_width: 5,top: 132,width: 59},{_id: "-M_jeECsEGDQ0Abf4_z_",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 289,rotation: 0,scaleX: 0.69,scaleY: 0.69,stroke: "#ff0000",stroke_width: 5,top: 353,width: 59},{_id: "-M_jeEn7ihElx9V0eqh3",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 1573,rotation: 0,scaleX: 0.69,scaleY: 0.69,stroke: "#ff0000",stroke_width: 5,top: 378,width: 59},{_id: "-M_jeIcV4DxUswlsPv0K",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 602.6696774193548,rotation: 0,scaleX: 0.30467741935483894,scaleY: 0.30467741935483894,stroke: "#ff0000",stroke_width: 5,top: 146.4403225806452,width: 59},{_id: "-M_jeM0-zC8QD7ouzIqK",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 603,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 495,width: 59},{_id: "-M_jeNOr4VnfQdelJzdL",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 1156,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 206,width: 59},{_id: "-M_jeOVEdQdv5a4J7ae_",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 1367,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 558,width: 59},{_id: "-M_jePBVHkFng8hFvY3A",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 1648,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 659,width: 59},{_id: "-M_jePzU0kC0Ga5OGTNu",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 1297,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 801,width: 59},{_id: "-M_jeRObkrMNSl_sZvso",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 1996,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 1082,width: 59},{_id: "-M_jeSg-g7B3X_Ynuj5C",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 2119,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 1256,width: 59},{_id: "-M_jeTCE1ZxNm_3bWlb1",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 1434,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 1257,width: 59},{_id: "-M_jeUc6Oe5fed6ojC-D",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 3117,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 1362,width: 59},{_id: "-M_jeV483c9TpRDjlMEe",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 3150,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 1082,width: 59},{_id: "-M_jeWOFkqUBTRG_B5cl",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 3290,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 663,width: 59},{_id: "-M_jeXBbjtIxKcrJk0xU",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 2837,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 135,width: 59},{_id: "-M_jeXur6J3OX_RAiPUF",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 3188,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 136,width: 59},{_id: "-M_jeYoUdEadFhLDLauq",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 2624,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 487,width: 59},{_id: "-M_jeZbssTDVgD6RxRok",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 2555,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 241,width: 59},{_id: "-M_jeh3NHAD3NDK-CzqS",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 1576,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 1081,width: 59},{_id: "-M_jeyBd-wmKpOcgRoNx",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,0],[\"L\",72,98],[\"L\",141,166],[\"L\",188,183],[\"L\",207,208],[\"L\",229,255],[\"L\",221,325],[\"L\",222,373],[\"L\",204,399],[\"L\",203,457],[\"L\",153,495],[\"L\",100,569],[\"L\",79,606],[\"L\",61,654],[\"L\",60,733],[\"L\",61,806],[\"L\",79,836],[\"L\",97,843],[\"L\",120,855],[\"L\",116,885],[\"L\",128,921],[\"L\",154,933],[\"L\",206,939],[\"L\",237,954],[\"L\",283,951],[\"L\",307,940],[\"L\",331,976],[\"L\",343,1007],[\"L\",354,1052],[\"L\",376,1114],[\"L\",396,1158],[\"L\",427,1215],[\"L\",449,1269],[\"L\",466,1308],[\"L\",470,1349],[\"L\",544,1419],[\"L\",590,1445],[\"L\",642,1452],[\"L\",686,1451],[\"L\",750,1446],[\"L\",806,1434],[\"L\",847,1424],[\"L\",888,1437],[\"L\",929,1420],[\"L\",954,1421],[\"L\",976,1422],[\"L\",998,1404],[\"L\",1035,1363],[\"L\",1058,1337],[\"L\",1098,1340],[\"L\",1145,1341],[\"L\",1179,1349],[\"L\",1217,1375],[\"L\",1239,1412],[\"L\",1263,1426],[\"L\",1290,1431],[\"L\",1318,1398],[\"L\",1333,1408],[\"L\",1358,1427],[\"L\",1387,1505],[\"L\",1411,1558],[\"L\",1402,1578],[\"L\",1444,1605],[\"L\",1468,1582],[\"L\",1513,1592],[\"L\",1543,1584],[\"L\",1566,1559],[\"L\",1593,1542],[\"L\",1607,1515],[\"L\",1616,1474],[\"L\",1617,1437],[\"L\",1597,1403],[\"L\",1602,1395],[\"L\",1631,1397],[\"L\",1662,1420],[\"L\",1700,1433],[\"L\",1741,1432],[\"L\",1794,1437],[\"L\",1828,1449],[\"L\",1869,1451],[\"L\",1897,1446],[\"L\",1936,1434],[\"L\",1966,1423],[\"L\",1990,1455],[\"L\",2035,1489],[\"L\",2056,1513],[\"L\",2063,1536],[\"L\",2087,1540],[\"L\",2117,1561],[\"L\",2138,1593],[\"L\",2137,1630],[\"L\",2167,1670],[\"L\",2162,1687]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 1687,layer: "walls",left: 1083.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#4a86e8",stroke_width: 5,top: 2654.5,width: 2167},{_id: "-M_jf0XT2xnimd3L2k3v",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",64,134],[\"L\",23,80],[\"L\",0,18],[\"L\",8,0],[\"L\",59,33],[\"L\",101,61],[\"L\",141,75],[\"L\",178,93],[\"L\",209,113],[\"L\",200,151],[\"L\",202,194],[\"L\",203,215],[\"L\",163,191],[\"L\",130,179],[\"L\",108,159],[\"L\",64,134]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 215,layer: "walls",left: 1246.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#4a86e8",stroke_width: 5,top: 2971.5,width: 209},{_id: "-M_jf3uKXhO894TKQ7GC",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",451,248],[\"L\",395,271],[\"L\",369,291],[\"L\",344,333],[\"L\",321,363],[\"L\",298,397],[\"L\",266,405],[\"L\",225,381],[\"L\",177,365],[\"L\",129,355],[\"L\",84,349],[\"L\",38,354],[\"L\",0,368],[\"L\",6,330],[\"L\",26,304],[\"L\",34,261],[\"L\",35,225],[\"L\",62,211],[\"L\",73,174],[\"L\",80,152],[\"L\",98,129],[\"L\",99,82],[\"L\",89,35],[\"L\",84,8],[\"L\",125,2],[\"L\",149,0],[\"L\",174,42],[\"L\",192,86],[\"L\",224,105],[\"L\",253,114],[\"L\",304,129],[\"L\",326,158],[\"L\",367,173],[\"L\",395,191],[\"L\",422,203],[\"L\",446,229],[\"L\",451,248]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 405,layer: "walls",left: 794.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#4a86e8",stroke_width: 5,top: 2633.5,width: 451},{_id: "-M_jfGGiI8eUVCPcEDKP",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",1480,946],[\"L\",1430,948],[\"L\",1373,948],[\"L\",1319,927],[\"L\",1286,920],[\"L\",1243,916],[\"L\",1210,915],[\"L\",1194,942],[\"L\",1166,961],[\"L\",1129,922],[\"L\",1114,878],[\"L\",1094,847],[\"L\",1061,823],[\"L\",1020,801],[\"L\",988,783],[\"L\",930,767],[\"L\",887,748],[\"L\",849,716],[\"L\",857,693],[\"L\",898,702],[\"L\",937,709],[\"L\",971,702],[\"L\",990,681],[\"L\",1000,662],[\"L\",977,629],[\"L\",950,624],[\"L\",942,587],[\"L\",937,550],[\"L\",928,516],[\"L\",907,507],[\"L\",876,491],[\"L\",783,427],[\"L\",743,402],[\"L\",716,402],[\"L\",701,417],[\"L\",667,400],[\"L\",637,401],[\"L\",604,399],[\"L\",569,413],[\"L\",553,423],[\"L\",522,411],[\"L\",489,392],[\"L\",475,375],[\"L\",472,356],[\"L\",487,318],[\"L\",469,304],[\"L\",470,275],[\"L\",471,253],[\"L\",461,223],[\"L\",446,208],[\"L\",412,198],[\"L\",291,191],[\"L\",258,152],[\"L\",240,122],[\"L\",204,109],[\"L\",176,91],[\"L\",154,109],[\"L\",122,143],[\"L\",139,185],[\"L\",151,232],[\"L\",172,245],[\"L\",172,267],[\"L\",149,283],[\"L\",112,279],[\"L\",110,259],[\"L\",94,234],[\"L\",72,217],[\"L\",48,216],[\"L\",5,217],[\"L\",0,183],[\"L\",9,146],[\"L\",31,136],[\"L\",28,79],[\"L\",16,37],[\"L\",54,0],[\"L\",109,6],[\"L\",169,1],[\"L\",225,7],[\"L\",269,34],[\"L\",317,68],[\"L\",373,119],[\"L\",426,147],[\"L\",449,174],[\"L\",478,188],[\"L\",513,176],[\"L\",566,202],[\"L\",585,229],[\"L\",632,264],[\"L\",676,263],[\"L\",722,282],[\"L\",768,301],[\"L\",800,322],[\"L\",834,342],[\"L\",856,375],[\"L\",877,411],[\"L\",905,432],[\"L\",944,435],[\"L\",991,447],[\"L\",1029,465],[\"L\",1066,489],[\"L\",1134,504],[\"L\",1158,524],[\"L\",1193,533],[\"L\",1234,517],[\"L\",1256,538],[\"L\",1278,576],[\"L\",1293,603],[\"L\",1320,615],[\"L\",1343,624],[\"L\",1370,644],[\"L\",1391,667],[\"L\",1412,678],[\"L\",1429,689],[\"L\",1439,715],[\"L\",1456,752],[\"L\",1468,776],[\"L\",1465,803],[\"L\",1468,824],[\"L\",1478,846],[\"L\",1467,872],[\"L\",1462,899],[\"L\",1477,920],[\"L\",1480,946]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 961,layer: "walls",left: 1151,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#4a86e8",stroke_width: 5,top: 2512.5,width: 1480},{_id: "-M_jfIb6BEllg5kIpMsR",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 2443,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 2122,width: 59},{_id: "-M_jfJGUZLyDQq6cVfZi",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 1995,rotation: 0,scaleX: 0.3,scaleY: 0.3,stroke: "#ff0000",stroke_width: 5,top: 2342,width: 59},{_id: "-M_jiApsQ6VeGjRk-Z7F",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",19,11],[\"L\",3,17],[\"L\",0,27],[\"L\",0,42],[\"L\",16,52],[\"L\",38,55],[\"L\",53,41],[\"L\",59,24],[\"L\",46,10],[\"L\",29,0],[\"L\",19,11]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 55,layer: "walls",left: 740,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ff0000",stroke_width: 5,top: 244,width: 59},{_id: "-M_jiuCQ_h4Ckj1q5_UX",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",8,0],[\"L\",1,14],[\"L\",0,34],[\"L\",3,51],[\"L\",22,51],[\"L\",27,27],[\"L\",27,9],[\"L\",26,2],[\"L\",8,0]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "#ff0000",height: 51,layer: "walls",left: 1432.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ff0000",stroke_width: 5,top: 310.5,width: 27},{_id: "-M_jjFf5Pe1TWTV1AfJW",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",140,0],[\"L\",0,0]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 0,layer: "walls",left: 210,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 980,width: 140},{_id: "-M_jjHudYtJvCkemmFnN",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",140,0],[\"L\",140,210],[\"L\",0,210]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 210,layer: "walls",left: 770,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 1435,width: 140},{_id: "-M_jjJS8rDzoYC94OgMX",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",490,910],[\"L\",0,910],[\"L\",0,350],[\"L\",0,0],[\"L\",350,0],[\"L\",350,140]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 910,layer: "walls",left: 385,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 1085,width: 490},{_id: "-M_jjLarVGCMqbZDpzNm",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,140],[\"L\",140,140],[\"L\",140,0],[\"L\",140,140],[\"L\",280,140]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 140,layer: "walls",left: 490,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 910,width: 280},{_id: "-M_jjMHkcQ-HjREaOPtB",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,0],[\"L\",140,0],[\"L\",140,280]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 280,layer: "walls",left: 770,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 1120,width: 140},{_id: "-M_jjNoFr_4fRcInCT6o",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,0],[\"L\",0,210],[\"L\",70,210]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 210,layer: "walls",left: 1435,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 1925,width: 70},{_id: "-M_jjOBcSmQJQG50206X",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,0],[\"L\",140,0]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 0,layer: "walls",left: 1610,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 2030,width: 140},{_id: "-M_jjP4ON7wW44kJkR60",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",70,420],[\"L\",140,420],[\"L\",140,0],[\"L\",0,0]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 420,layer: "walls",left: 1750,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 1820,width: 140},{_id: "-M_jjg3t0m8M_MpwPJzz",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",89,0],[\"L\",41,63],[\"L\",0,134]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 134,layer: "walls",left: 2059.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ff0000",stroke_width: 5,top: 3089,width: 89},{_id: "-M_jji4cUk0lyR5tBTdj",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,0],[\"L\",44,39]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 39,layer: "walls",left: 2087,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ff0000",stroke_width: 5,top: 3004.5,width: 44},{_id: "-M_mFZHvu42kSHorektl",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",2.5,0],[\"Q\",2.5,0,3,0],[\"Q\",3.5,0,3.25,0],[\"Q\",3,0,3,0.5],[\"Q\",3,1,3,1],[\"Q\",3,1,3,1.5],[\"Q\",3,2,3,2.5],[\"Q\",3,3,2.5,3.5],[\"Q\",2,4,2,4.5],[\"Q\",2,5,2,5.5],[\"Q\",2,6,2,6.5],[\"Q\",2,7,2,7.5],[\"Q\",2,8,2,8.5],[\"Q\",2,9,2,9.5],[\"Q\",2,10,2,10.5],[\"Q\",2,11,2,11.5],[\"Q\",2,12,2,12.5],[\"Q\",2,13,2,13.5],[\"Q\",2,14,1.5,14.5],[\"Q\",1,15,1,16],[\"Q\",1,17,1,18],[\"Q\",1,19,1,19.5],[\"Q\",1,20,1,20.5],[\"Q\",1,21,1,21],[\"Q\",1,21,1,21.5],[\"Q\",1,22,1,22],[\"Q\",1,22,1,22.5],[\"Q\",1,23,1,23.5],[\"Q\",1,24,1,24],[\"Q\",1,24,1,24.5],[\"Q\",1,25,0.5,25.5],[\"Q\",0,26,0,26],[\"Q\",0,26,0,26.5],[\"Q\",0,27,0,27.5],[\"Q\",0,28,0,28.5],[\"Q\",0,29,0,29],[\"Q\",0,29,0,29.5],[\"Q\",0,30,0,30.5],[\"Q\",0,31,0,32],[\"Q\",0,33,0,33.5],[\"Q\",0,34,0,34.5],[\"Q\",0,35,0,35.5],[\"Q\",0,36,0,36.5],[\"Q\",0,37,0,37.5],[\"Q\",0,38,0,38.5],[\"Q\",0,39,0,39],[\"Q\",0,39,0,39.5],[\"Q\",0,40,0.5,40.5],[\"Q\",1,41,1,41.5],[\"Q\",1,42,1,42.5],[\"Q\",1,43,1.5,43],[\"Q\",2,43,2,43.5],[\"Q\",2,44,2,44.5],[\"Q\",2,45,2,45.5],[\"Q\",2,46,2,46],[\"Q\",2,46,2,46.5],[\"Q\",2,47,2.5,47],[\"Q\",3,47,3,47.5],[\"Q\",3,48,3,48.5],[\"Q\",3,49,3.5,49.5],[\"Q\",4,50,4,50.5],[\"Q\",4,51,4,51.5],[\"Q\",4,52,4.5,52.5],[\"Q\",5,53,5,53.5],[\"Q\",5,54,5.5,54],[\"Q\",6,54,6,54.5],[\"Q\",6,55,6,55],[\"Q\",6,55,6,56],[\"Q\",6,57,6.5,57.5],[\"Q\",7,58,7,58],[\"Q\",7,58,7,58.5],[\"Q\",7,59,7.5,59],[\"Q\",8,59,8,59.5],[\"Q\",8,60,8,60],[\"Q\",8,60,8,60.5],[\"Q\",8,61,8.5,61],[\"Q\",9,61,9,61.5],[\"Q\",9,62,9.5,62.5],[\"Q\",10,63,10,63],[\"Q\",10,63,10.5,63.5],[\"Q\",11,64,11.5,64.5],[\"Q\",12,65,12,65.5],[\"Q\",12,66,12,66.5],[\"Q\",12,67,12.5,67],[\"Q\",13,67,13,67.5],[\"Q\",13,68,13.5,68.5],[\"Q\",14,69,14.5,69.5],[\"Q\",15,70,15,70.5],[\"Q\",15,71,15.5,71.5],[\"Q\",16,72,16,72],[\"Q\",16,72,16,72],[\"Q\",16,72,16.5,72.5],[\"Q\",17,73,17,73],[\"Q\",17,73,17,73],[\"Q\",17,73,17,73.5],[\"Q\",17,74,17.5,74],[\"Q\",18,74,18,74.5],[\"Q\",18,75,18,75.5],[\"Q\",18,76,18.5,76],[\"Q\",19,76,19,76],[\"Q\",19,76,19,76.5],[\"Q\",19,77,19,77],[\"Q\",19,77,19.5,77],[\"Q\",20,77,20,77.5],[\"Q\",20,78,20.5,78.5],[\"Q\",21,79,21,79],[\"Q\",21,79,21,79],[\"Q\",21,79,21,79.5],[\"Q\",21,80,21.5,80],[\"Q\",22,80,22,80],[\"Q\",22,80,22.5,80.5],[\"Q\",23,81,23.5,81.5],[\"Q\",24,82,24.5,82],[\"Q\",25,82,25,82.5],[\"Q\",25,83,25.5,83],[\"Q\",26,83,26,83],[\"Q\",26,83,26.5,83],[\"Q\",27,83,27.5,83.5],[\"Q\",28,84,28.5,84],[\"Q\",29,84,29,84],[\"Q\",29,84,29.5,84],[\"Q\",30,84,30,84],[\"Q\",30,84,30.5,84],[\"Q\",31,84,31,84],[\"Q\",31,84,31.5,84],[\"Q\",32,84,32,84],[\"Q\",32,84,32.5,84.5],[\"Q\",33,85,33.5,85],[\"Q\",34,85,35,86],[\"Q\",36,87,36.5,87.5],[\"Q\",37,88,37.5,88],[\"Q\",38,88,38.5,88.5],[\"Q\",39,89,39,89],[\"Q\",39,89,39.5,89],[\"Q\",40,89,40,89],[\"Q\",40,89,40.5,89],[\"Q\",41,89,41,89],[\"Q\",41,89,41.5,89],[\"Q\",42,89,42,89],[\"Q\",42,89,42.5,89],[\"Q\",43,89,43,89],[\"Q\",43,89,43.5,89],[\"Q\",44,89,44.5,89],[\"Q\",45,89,45.5,89.5],[\"Q\",46,90,46.5,90.5],[\"Q\",47,91,47,91],[\"Q\",47,91,47,91],[\"L\",47,91]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 91,layer: "walls",left: 2668.5,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 2344.5,width: 47},{_id: "-M_mF_n7r_MmHQgNNuXa",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",1.5,0],[\"Q\",1.5,0,2,0],[\"Q\",2.5,0,2.25,0],[\"Q\",2,0,2,1],[\"Q\",2,2,2,3],[\"Q\",2,4,2,5],[\"Q\",2,6,2,7],[\"Q\",2,8,1.5,9],[\"Q\",1,10,1,11],[\"Q\",1,12,0.5,13],[\"Q\",0,14,0,15],[\"Q\",0,16,0,17],[\"Q\",0,18,0,19],[\"Q\",0,20,0,21],[\"Q\",0,22,0,23],[\"Q\",0,24,0,25],[\"Q\",0,26,0,27],[\"Q\",0,28,0,29],[\"Q\",0,30,0,30.5],[\"Q\",0,31,0,31.5],[\"Q\",0,32,0,32.5],[\"Q\",0,33,0,33],[\"Q\",0,33,0,33.5],[\"Q\",0,34,0,34],[\"Q\",0,34,0,34.5],[\"Q\",0,35,0,35],[\"Q\",0,35,0,35.5],[\"Q\",0,36,0,36.5],[\"Q\",0,37,0,37],[\"Q\",0,37,0,37.5],[\"Q\",0,38,0,38.5],[\"Q\",0,39,0,39],[\"Q\",0,39,0,39.5],[\"Q\",0,40,0,40],[\"Q\",0,40,0,40.5],[\"Q\",0,41,0,41],[\"Q\",0,41,0.5,41],[\"Q\",1,41,1,41],[\"Q\",1,41,1.5,41],[\"Q\",2,41,2,41],[\"Q\",2,41,2.5,41],[\"Q\",3,41,3,41],[\"Q\",3,41,3.5,41],[\"Q\",4,41,4,41],[\"Q\",4,41,4.5,41],[\"Q\",5,41,5,41],[\"Q\",5,41,5.5,41],[\"Q\",6,41,6,41],[\"Q\",6,41,6.5,41],[\"Q\",7,41,7.5,41],[\"Q\",8,41,8,41],[\"Q\",8,41,8.5,41],[\"Q\",9,41,9,41],[\"Q\",9,41,9.5,41],[\"Q\",10,41,10,41],[\"Q\",10,41,10.5,41.5],[\"Q\",11,42,11,42],[\"Q\",11,42,11.5,42],[\"Q\",12,42,12,42],[\"Q\",12,42,12.5,42],[\"Q\",13,42,13,42],[\"Q\",13,42,13.5,42],[\"Q\",14,42,14,42],[\"Q\",14,42,14.5,42],[\"Q\",15,42,15.5,42],[\"Q\",16,42,16.5,42],[\"Q\",17,42,17.5,42],[\"Q\",18,42,18.5,42],[\"Q\",19,42,19.5,42],[\"Q\",20,42,20,42],[\"Q\",20,42,20.5,42],[\"Q\",21,42,21,42],[\"Q\",21,42,21.5,42],[\"Q\",22,42,22,42],[\"Q\",22,42,22.5,42],[\"Q\",23,42,23,42],[\"Q\",23,42,23.5,42],[\"Q\",24,42,24,42],[\"Q\",24,42,24,42.5],[\"Q\",24,43,24.5,43],[\"Q\",25,43,25,43],[\"Q\",25,43,25.5,43.5],[\"Q\",26,44,26,44],[\"Q\",26,44,26.5,44],[\"Q\",27,44,27,44.5],[\"Q\",27,45,27,45],[\"Q\",27,45,27.5,45],[\"Q\",28,45,28.5,45.5],[\"Q\",29,46,29,46],[\"Q\",29,46,29,46],[\"Q\",29,46,29.5,46],[\"Q\",30,46,30,46],[\"Q\",30,46,30,46.5],[\"Q\",30,47,30,47],[\"Q\",30,47,30,47.5],[\"Q\",30,48,30,48],[\"Q\",30,48,30,48.5],[\"L\",30,49]]",_type: "path",controlledby: "-M_jcdIxjK0sCCxOSjG-",fill: "transparent",height: 49,layer: "walls",left: 3023,rotation: 0,scaleX: 1,scaleY: 1,stroke: "#ffff00",stroke_width: 5,top: 2361.5,width: 30},{_id: "-M_yiZ0yWCRVmhgBQNDS",_pageid: "-M_jcc-PfdMIjQo3Au7q",_path: "[[\"M\",0,0],[\"L\",76,0]]",_type: "path",controlledby: "",fill: "#977625",height: 0,layer: "walls",left: 1400,rotation: 270.62983617601424,scaleX: 1,scaleY: 1,stroke: "#495426",stroke_width: 5,top: 1784,width: 76}];

            _.each(walls, function(wall){
                createObj("path", {
                    _id: wall._id,
                    _pageid: page.get("_id"),
                    _path: wall._path,
                    _type: wall._type,
                    controlledby: wall.controlledby,
                    fill: wall.fill,
                    height: wall.height,
                    layer: wall.layer,
                    left: wall.left,
                    rotation: wall.rotation,
                    scaleX: wall.scaleX,
                    scaleY: wall.scaleY,
                    stroke: wall.stroke,
                    stroke_width: wall.stroke_width,
                    top: wall.top,
                    width: wall.width
                });
            });

            chat("!map example");

        },

        //Shorthand command for creating a character sheet
        createSheet = function(msg){
            var char = createObj('character', {
                name: "New Contestant",
                controlledby: msg.playerid,
                inplayerjournals: msg.playerid,
                avatar: defaultContestantImg
            });

            createAbilities(char);
        },

        checkGlobalConfig = function() {

            if(_.has(globalconfig, 'Page Prefix') && _.has(globalconfig, 'Sound Ping Radius')){
                battleroyale_page_prefix = globalconfig['Page Prefix'];
                visible_spectators = globalconfig['Visible Spectators'];
                show_health_bars = globalconfig['Show Health Bars'];
                allow_claim = globalconfig['Allow Character Claiming'];
                spectator_vision_range = globalconfig['Spectator Vision Range'];
                initial_token_vision = globalconfig['Initial Token Vision'];
                grant_vision_range = globalconfig['Grant Vision Range'];
                sound_ping_radius = globalconfig['Sound Ping Radius'];
            }

        },

        //Initialize the script and event handlers.
        init = function(){

            log('Starting Battle Royale v' + version);

            checkMap();
            createUtilChars();
            checkGlobalConfig();

            on("chat:message", function(msg) {
                if(cmd("nextturn", msg)) nextTurn(msg);
                if(cmd("counter", msg)) startCounter(msg);
                if(cmd("turntracker", msg)) turnTracker();
                if(cmd("orderturn", msg)) orderTurn();
                if(cmd("spawn", msg)) spawn(msg);
                if(cmd("vision", msg)) vision(msg);
                if(cmd("spectate", msg)) spectate(msg);
                if(cmd("size", msg)) size(msg);
                if(cmd("removeturn", msg)) removeTurn(msg);
                if(cmd("claim", msg)) claim(msg);
                if(cmd("door", msg)) toggleDoor(msg);
                if(cmd("clearturn", msg)) clearTurn();
                if(cmd("invis", msg)) toggleInvisible(msg);
                if(cmd("soundping", msg)) soundPing(msg);
                if(cmd("map", msg)) changeMap(msg);
                if(cmd("contestant", msg)) createSheet(msg);
                if(cmd("help", msg)) help(msg.who);
            });

            //Give players a Command menu when they log in
            on('change:player:_online', function(obj){
                setTimeout(function() {
                    if(obj.get("_online")) help(obj.get("_displayname"));
                }, 4000);
            });

            on('change:campaign:turnorder', function(){
                if(!battleRoyaleMap) return;
                newTurn();
            });

            on('change:campaign:playerpageid', function(e){
                checkMap();
            });

            on('add:token', function(token){
                if(getObj("page", token.get("_pageid")).get("name").substr(0, battleroyale_page_prefix.length) != battleroyale_page_prefix) return;

                setTimeout(function() {

                    var tokenName = token.get("name");

                    var char = findObjs({
                        _type: "character"
                    }).filter(x => x.get("name").includes(tokenName))[0];

                    if(char == null) return;

                    var charName = char.get("name");

                    if(charName === "Door"){
                        token.set("isdrawing", true);
                    }

                    if(charName != "Door" && charName != "Spawn Point"){
                        token.set("represents", char.get("_id"));

                        var hp = findObjs({
                            _type: "attribute",
                            _characterid: char.get("_id"),
                            name: "hp"
                        })[0];

                        log(hp);

                        if(hp != null){
                            token.set("bar3_link", hp.get("_id"));
                            token.set("bar3_value", hp.get("current"));
                            token.set("bar3_max", hp.get("max"));
                        }
                        token.set("showplayers_bar3", show_health_bars);

                        createAbilities(char);

                        token.set("gmnotes", "imgsrc:"+token.get("imgsrc").replace("med.png", "thumb.png").replace("max.png", "thumb.png")+";markers:--;");

                        token.set("has_bright_light_vision", true);
                        token.set("has_night_vision", true);
                        token.set("night_vision_distance", initial_token_vision);
                        token.set("showplayers_bar1", false);
                        token.set("showplayers_bar2", false);
                        token.set("showplayers_aura2", false);
                        token.set("aura2_radius", -1);
                        token.set("aura2_color", "#FF0000");
                        token.set("showname", false);
                    }

                }, 200);
            });

            on('add:character', function(char){
                if(allow_claim && char.get("name") != "Door" && char.get("name") != "Spawn Point")
                    chat(char.get("name") + " was imported. [Claim Ownership](!claim " + char.get("name") + ")")
            });

            on('add:page', function(page){
                if(page.get("name") === "") createExampleMap(page);
            });

        };

    return {
        init: init
    };
}());

on("ready", function() {
    'use strict';
    battleRoyale.init();
});
