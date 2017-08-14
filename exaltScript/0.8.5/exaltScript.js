/*

exaltScript for Exalted 3rd Edition
Author: Pinmissile
Contact: https://app.roll20.net/users/2709/pinmissile
Many thanks to The Aaron, because like most API scripters I referenced his code a lot.

This script adds general utility and automation to Exalted 3rd Edition campaigns.

If you want to suggest features, please send me a PM

*/

var exaltScript = exaltScript || {
    version: "0.8.5",
    lastUpdated: "04/08/2017",
    authors: "Pinmissile",
    gmOnly: true,               //Change to false if you want players to be able to run the script

    CheckInstall: function() {    
        
        if( ! state.hasOwnProperty('exaltScript') || state.exaltScript.version != exaltScript.version){
            state.exaltScript = {
                version: exaltScript.version,
                setting: {
                    doInitiative: true,
                    doAnima: true,
                    doNotifications: true,
                }
            }
            sendChat('exaltScript','/w gm New version of exaltScript detected!');
            exaltScript.DisplayInterface("gm");
            sendChat('exaltScript','/w gm To access the exaltScript UI again, write !exaltScript UI');
        }
        log("--= exaltScript v"+exaltScript.version+" =--"); 
    },

    endTurn: function(turnorder){
        _.each(turnorder, function (turnorder) {                                                         
            if (turnorder.id != "-1") {                                                                  //Add 5 motes to all characters in the turn order.
                var graphic = getObj("graphic", turnorder.id);
                var character = getObj("character", graphic.get("represents"));
                if (graphic != undefined && character != undefined) {
                    exaltScript.addMotes(5,character.id);   
                }
            }
        });

        let order = Campaign().get('turnorder');                                                         //Sort turn order
        if (order.length) {
            order = _.sortBy(JSON.parse(order), (t) => -parseInt(t.pr));
        }
        Campaign().set('turnorder', JSON.stringify(order));
        if(turnorder[0] == undefined) return;
        else turnorder = JSON.parse(Campaign().get("turnorder"));
        if (turnorder[0].id != "-1"){                                                                   //Custom token check
            getObj("graphic", turnorder[0].id).set({
                status_purplemarker: false                                                              //Remove onslaught from top initiative after sorting
            });         
        }
    },

    newTurn: function(turnorder){
        getObj("graphic", turnorder[0].id).set({
            status_purplemarker: false                                                                  //Remove Onslaught when the turn order hits a token
        });
    },

    checkEndTurnMarker: function(turnorder){
        'use strict';
        var yesTurnorder = false;
        for(var i = 0; i < turnorder.length; i++){
            if(turnorder[i].id == "-1" && turnorder[i].pr=="-99" && turnorder[i].custom=="End Turn") return false;;
        }
        return true;
    },

    createEndTurnMarker: function(turnorder){                           //Pushes an End Turn token to the turn order
        'use strict';                                 
        turnorder.push({
            id: "-1",
            pr: "-99",
            custom: "End Turn"
        });
        Campaign().set("turnorder", JSON.stringify(turnorder));
    },

    findMaxMotes: function (characterID, attribute){
        var motePool = getAttrByName(characterID, attribute);    //might look something like @{essence} * 7 + 26 OR a flat value
        if (motePool == undefined) return;
        if (typeof motePool == "string" ){
            if (motePool.match("@{essence}") == "@{essence}"){
                motePool = motePool.replace("@{essence}",getAttrByName(characterID,"essence"));
            }
        }if (motePool == undefined) motePool = 0;
        motePool = eval(motePool);
        if (motePool < 0) return 0;
        log(motePool);
        return motePool;
    },

    maxMotes: function (){
        var graphic = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            layer: "objects",
        });

        _.each(graphic, function (graphic) {
            var toAdd = 0;
            var character = getObj("character", graphic.get("represents"));
            if (character != undefined){
                var comitted = 1*getAttrByName(character.id, "committedesstotal");
                if (getAttrByName(character.id, "personal-essence") == "undefined")
                    exaltScript.setAttribute("personal-essence",character.id, "0");
                if (getAttrByName(character.id, "peripheral-essence") == "undefined")
                    exaltScript.setAttribute("peripheral-essence",character.id, "0");
                var maxValue = exaltScript.findMaxMotes(character.id,"peripheral-equation");
                if (comitted < maxValue){
                    toAdd = maxValue - comitted;
                    toAdd = toAdd.toString();
                    exaltScript.setAttribute("peripheral-essence",character.id, toAdd); 
                } else {
                    exaltScript.setAttribute("peripheral-essence",character.id, "0");
                    comitted = comitted - maxValue;
                } 
                var maxValue = exaltScript.findMaxMotes(character.id,"personal-equation");

                if (comitted < maxValue) exaltScript.setAttribute("personal-essence",character.id, maxValue-comitted);
                else exaltScript.setAttribute("personal-essence",character.id, "0");
            }
        });
        exaltScript.NotifyChange("Motes maxed","none");
    },

    addMotesToCharacters: function(motes){
        var graphic = findObjs({                              
        _pageid: Campaign().get("playerpageid"),                              
        _type: "graphic",
        layer: "objects",
        });
        _.each(graphic, function (graphic) {
            var character = getObj("character", graphic.get("represents"));
            if(character != undefined){
                exaltScript.addMotes(motes,character.id);
            }
        });
        exaltScript.NotifyChange(motes+" motes added","none");
    },

    addMotes: function (motes, characterID){                                                //Generic algorithm for adding motes.
        var maxPersonal = exaltScript.findMaxMotes(characterID, "personal-equation");
        var maxPeripheral = exaltScript.findMaxMotes(characterID, "peripheral-equation");
        var comitted = 1*getAttrByName(characterID, "committedesstotal");
        var curValue = 0;
        var diff = 0;

        if (getAttrByName(characterID, "peripheral-essence") == undefined)                  //In the event that the attribute is set to an undefined value...
            exaltScript.setAttribute("peripheral-essence",characterID, "0");                            //The attribute is set to 0.
        if (getAttrByName(characterID, "personal-essence") == undefined)
            exaltScript.setAttribute("personal-essence",characterID, "0");
        if (getAttrByName(characterID, "committedesstotal") == undefined)
            exaltScript.setAttribute("committedesstotal",characterID, "0");
        
        if(comitted > maxPeripheral){                                       //Sorting out max pools
            maxPersonal = maxPersonal + maxPeripheral - comitted;
            maxPeripheral = 0;
            if(maxPersonal < 0) maxPersonal = 0;
        } else maxPeripheral = maxPeripheral - comitted;
        curValue = 1*getAttrByName(characterID, "peripheral-essence");
        diff = maxPeripheral - curValue;
        if(diff < 5){
            exaltScript.setAttribute("peripheral-essence",characterID, maxPeripheral);
            motes = motes - diff;
            curValue = 1*getAttrByName(characterID, "personal-essence");
            diff = maxPersonal - curValue;
            if (diff > motes){
                exaltScript.setAttribute("personal-essence",characterID, motes+curValue);
            } else exaltScript.setAttribute("personal-essence",characterID, maxPersonal);
        } else {
            curValue = curValue + motes;
            exaltScript.setAttribute("peripheral-essence",characterID, curValue);
        }
    },

    setAttribute: function (attributeName, characterID, toSet){                     //Generic function for setting an attribute to a value.
        var attribute = findObjs({                              
            _characterid: characterID,                              
            _type: "attribute",
            name: attributeName,
        });
        if(attribute[0] != undefined){
            attribute[0].set({
            current: toSet 
            });
        } 
    },

    increaseAnima: function(object, previous){                         //Spend five or more peripheral motes, get more anima.
        var graphic = findObjs({                              
            _represents: object.get("characterid"),                              
            _type: "graphic",
            _pageid: Campaign().get("playerpageid"),
            layer: "objects"
        });
        var graphic = graphic[0];
        if(previous["current"]-object.get("current") > 4 && graphic.get("status_ninja-mask") == false){
            switch(graphic.get("status_aura")) {
                case false:
                    graphic.set("status_aura",true);
                    break;
                case true:
                    graphic.set("status_aura","2");
                    break;
                case "2":
                    graphic.set("status_aura","3");
                    break;
                default:
                    return;
            }
        }
    },

    ClearStatus: function(status){
        var graphic = findObjs({                              
        _pageid: Campaign().get("playerpageid"),                              
        _type: "graphic",
        layer: "objects",
        });
        switch (status)
        {

            case "onslaught":
                _.each(graphic, function (graphic){ 
                    graphic.set("status_purplemarker",false);
                });
                exaltScript.NotifyChange("Onslaught cleared","none");
                break;

            case "anima":
                _.each(graphic, function (graphic){ 
                    graphic.set("status_aura",false);
                });
                exaltScript.NotifyChange("Anima cleared","none");
                break;
        }
    },

    ToggleAnima: function(){
        if(state.doAnima == false) state.doAnima = true; 
        else state.doAnima = false;
        exaltScript.NotifyChange("Anima Increaser",state.doAnima);
    },

    ToggleInitiative: function(){
        if(state.doInitiative == false) state.doInitiative = true;
        else state.doInitiative = false;
        exaltScript.NotifyChange("Initiative Tracker",state.doInitiative);
    },

    ToggleNotifications: function(){
        if(state.doNotifications == false) state.doNotifications = true;
        else state.doNotifications = false;
        exaltScript.NotifyChange("Notifications",state.doNotifications);
    },

    DisplayInterface: function(target){
        if (state.doAnima == false){
            animaColor = "#FF0000";
        } else animaColor = "#6B8E23";
        if (state.doInitiative == false){
            initiativeColor = "#FF0000";
        } else initiativeColor = "#6B8E23";
        if (state.doNotifications == false){
            notificationColor = "#FF0000";
        } else notificationColor = "#6B8E23";
        sendChat('exaltScript','/w '
                        +target
                        +' <div style=\''
                        +'color: black;'
                        +'padding: 5px 5px;'
                        +'background-color: #FFD700;'
                        +'font-family:"Palatino Linotype", "Book Antiqua", Palatino, serif;'
                        +'border: 3px solid #708090;'
                        +'align: center;'
                        +'text-align: center;'
                        +'\'>'
                        +'<h1 style="margin-bottom: -10px;"">exaltScript</h1>'
                        +'<img src="http://i.imgur.com/AbeJaSI.png" style="width 150px; height: 30px">'
                        +'<h2>Settings</h2>'
                        +'<a href="!exaltScript settings anima" style="background-color:' 
                        +animaColor
                        +'; margin: 2px;">Anima Increaser</a>'
                        +'<a href="!exaltScript settings initiative" style="background-color:' 
                        +initiativeColor
                        +'; margin: 2px;">Initiative Tracker</a>'
                        +'<a href="!exaltScript settings notifications" style="background-color:' 
                        +notificationColor
                        +'; margin: 2px;">Notifications</a>'
                        +'<h2>Add Motes</h2>'
                        +'<a href="!exaltScript maxMotes" style="background-color:#2A5B84; margin: 2px;">Max</a>'
                        +'<a href="!exaltScript addMotes" style="background-color:#2A5B84; margin: 2px;">Five</a>'
                        +'<a href="!exaltScript customMotes ?{How many?}" style="background-color:#2A5B84; margin: 2px;">Custom</a>'
                        +'<h2>Clear Statuses</h2>'
                        +'<a href="!exaltScript clear anima" style="background-color:#2A5B84; margin: 2px;">Anima</a>'
                        +'<a href="!exaltScript clear onslaught" style="background-color:#2A5B84; margin: 2px;">Onslaught</a>'
                        +'</div>'
        ); 
    },


    NotifyChange: function(func,toggled){               //Function for use of notifying when a setting has been toggled
        if(state.doNotifications == false) return;
        if (toggled == false){
            toggled = "Disabled";
            color = "#FF0000";
        } 
        else if (toggled == true){
            toggled = "Enabled";
            color = "#6B8E23";
        }
        else if (toggled == "none"){
            toggled = "";
            color = "";
        }
        sendChat('exaltScript','/direct '
                        +'<div style=\''
                        +'color: black;'
                        +'padding: 5px 5px;'
                        +'background-color: #FFD700;'
                        +'font-family:"Palatino Linotype", "Book Antiqua", Palatino, serif;'
                        +'font-size: 17px;'
                        +'border: 3px solid #708090;'
                        +'text-align: center;'
                        +'\'>'
                        +'<b>'
                        +func
                        +' <span style="color:'
                        +color
                        +';">'
                        +toggled
                        +"</b>"
                        +'</span>'
                +'</div>'
            );
    },
    ChangeSettings: function(msg){
        switch(msg){
            case "initiative":
                exaltScript.ToggleInitiative();
                break;

            case "anima":
                exaltScript.ToggleAnima();
                break;

            case "notifications":
                exaltScript.ToggleNotifications();
                break;

        }
    },

    HandleInput: function(tokens, player){      
        tokens=_.filter(tokens, function(tok){
            return null == tok.match(/^--/);
        });
        var command = tokens[0];
        switch (command)
        {
            case 'addMotes': 
                exaltScript.addMotesToCharacters(5);
                break;
            
            case 'maxMotes':
                exaltScript.maxMotes();
                break;

            case 'customMotes':
                motesToAdd = +tokens[1];
                exaltScript.addMotesToCharacters(motesToAdd);
                break;

            case 'settings':
                exaltScript.ChangeSettings(tokens[1]);
                break;

            case 'clear':
                exaltScript.ClearStatus(tokens[1]);
                break;

            case 'UI':
                exaltScript.DisplayInterface(player);
                break;
        }
    },

    RegisterEventHandlers: function(){
        on("change:campaign:turnorder", function(){            
            'use strict';
            if (state.doInitiative == false) return;
            var turn;
            if(Campaign().get("turnorder") == "" || Campaign().get("turnorder") == undefined) return;           //If the turn order is empty, exit to avoid crash.
            turn = JSON.parse(Campaign().get("turnorder"));
            if (turn[0] == undefined) return;                                                              //If the turn order is empty, return.
            if (turn.length == 2){
                let order = Campaign().get('turnorder');                                                        //This is to prevent the script from adding motes to the party once people start rolling for initiative.
                if (order.length) {                                                                             //A manual sort is still needed after everyone has rolled.
                    order = _.sortBy(JSON.parse(order), (t) => -parseInt(t.pr));
                }
                Campaign().set('turnorder', JSON.stringify(order));    
            }
            if (turn[0].id == "-1" && turn[0].pr=="-99" && turn[0].custom=="End Turn" && turn.length > 2) exaltScript.endTurn(turn);
            else if (turn[0].id != "-1") exaltScript.newTurn(turn);
        });

        on("change:campaign:initiativepage", function(){
            if(state.doInitiative == false) return;
            var turn;
            if(Campaign().get("turnorder") == "") turn = [];
            else turn = JSON.parse(Campaign().get("turnorder"));
            if (exaltScript.checkEndTurnMarker(turn) == true) exaltScript.createEndTurnMarker(turn);
        });

        on('chat:message', function(msg){
            if (msg.type !== 'api' | "!exaltScript") return;
            if( !playerIsGM(msg.playerid) && exaltScript.gmOnly == true) return;
            var tokenized = msg.content.split(/\s+/);
            exaltScript.HandleInput(_.rest(tokenized), msg.who);
                 
        });

        on("change:attribute:current", function(obj, prev){   
            if(obj.get("name") != "peripheral-essence") return;
            if (state.doAnima == true) exaltScript.increaseAnima(obj,prev);
        });
    }
};

on("ready",function(){
    exaltScript.CheckInstall();
    exaltScript.RegisterEventHandlers();
});