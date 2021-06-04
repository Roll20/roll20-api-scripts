/*

exaltScript for Exalted 3rd Edition
Author: Pinmissile
Contact: https://app.roll20.net/users/2709/pinmissile
Many thanks to The Aaron, because like most API scripters I referenced his code a lot.

This script adds general utility and automation to Exalted 3rd Edition campaigns.

Known issues: 
Script has a tendency to crash if you add too many tokens to the turn order at the same time, where some of those tokens are not represented by characters.


If you want to suggest features, please send me a PM

*/

var exaltScript = exaltScript || {
    version: "0.6",
    lastUpdated: "13/07/2017",
    authors: "Pinmissile",
    gmOnly: true,               //Change to false if you want players to be able to run the script

    CheckInstall: function() {    
        
        if( ! state.hasOwnProperty('exaltScript') || state.exaltScript.version != exaltScript.version){
            state.exaltScript = {
                version: exaltScript.version,
                setting: {
                    doInitiative: true,
                    doAnima: true,
                }
            }
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

    maxMotes: function(){                                               //Fills motes to capacity
        var graphic = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            layer: "objects",
        });
        var maxValue = 0
        var spillOver = 0

        _.each(graphic, function (graphic) {
            var character = getObj("character", graphic.get("represents"));
            if (character != undefined){
                if (getAttrByName(character.id, "personal-essence") == "undefined")
                    exaltScript.setAttribute("personal-essence",character.id, "0");
                if (getAttrByName(character.id, "peripheral-essence") == "undefined")
                    exaltScript.setAttribute("peripheral-essence",character.id, "0");

                if (getAttrByName(character.id, "peripheral-essence", "max") == "@{essence} * 7 + 26"){
                    if (1*getAttrByName(character.id, "committedesstotal") > getAttrByName(character.id, "essence")*7 + 26){
                        maxValue = 0;
                        spillOver = -getAttrByName(character.id, "essence")*7 - 26 + 1*getAttrByName(character.id, "committedesstotal");
                    }else maxValue = getAttrByName(character.id, "essence")*7 + 26 - 1*getAttrByName(character.id, "committedesstotal");             
                } else maxValue = getAttrByName(character.id, "peripheral-essence", "max"); 
                exaltScript.setAttribute("peripheral-essence",character.id, maxValue);

                if (getAttrByName(character.id, "personal-essence", "max") == "@{essence} * 3 + 10"){       //The sheet is very inflexible when it comes to calculating mote pools
                        maxValue = getAttrByName(character.id, "essence")*3 + 10 - spillOver;               //Essentially, it assumes all characters are solars.
                } else maxValue = getAttrByName(character.id, "personal-essence", "max");                   //So we have to manually set NPC max mote pool value to do this right
                exaltScript.setAttribute("personal-essence",character.id, maxValue);

                
            }
        });
    },

    addFiveMotes: function(){                                       //Does what it says on the tin
        var graphic = findObjs({                              
            _pageid: Campaign().get("playerpageid"),                              
            _type: "graphic",
            layer: "objects",
        });
        _.each(graphic, function (graphic) {
            var character = getObj("character", graphic.get("represents"));
            if(character != undefined){
                exaltScript.addMotes(5,character.id);
            }
        });
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
                case "3":
                    graphic.set("status_aura","4");
                    break;
                default:
                    return;
            }
        }
    },

    addMotes: function (motes, characterID){                                                //Generic algorithm for adding motes.
        var maxValue = 0;
        var curValue = 0;
        var diff = 0;
        var spillOver = 0;

        if (getAttrByName(characterID, "peripheral-essence") == undefined)                  //In the event that the attribute is set to an undefined value...
            exaltScript.setAttribute("peripheral-essence",characterID, "0");                            //The attribute is set to 0.
        if (getAttrByName(characterID, "personal-essence") == undefined)
            exaltScript.setAttribute("personal-essence",characterID, "0");
        if (getAttrByName(characterID, "committedesstotal") == undefined)
            exaltScript.setAttribute("committedesstotal",characterID, "0");
        if (getAttrByName(characterID, "peripheral-essence", "max") == "@{essence} * 7 + 26"){         //NPCs use max values, PCs don't.
            if (1*getAttrByName(characterID, "committedesstotal") > getAttrByName(characterID, "essence")*7 + 26){
                maxValue = 0;
                spillOver = -getAttrByName(characterID, "essence")*7 - 26 + 1*getAttrByName(characterID, "committedesstotal");
            } else var maxValue = getAttrByName(characterID, "essence")*7 + 26 - 1*getAttrByName(characterID, "committedesstotal");
        } else maxValue = getAttrByName(characterID, "peripheral-essence", "max");
        curValue = getAttrByName(characterID, "peripheral-essence"); 
        diff = maxValue - curValue;
        if (diff < motes){
            maxValue = +maxValue;
            maxValue = maxValue.toString();
            exaltScript.setAttribute("peripheral-essence",characterID, maxValue);
            motes = motes - diff;
            if (getAttrByName(characterID, "personal-essence", "max") == "@{essence} * 3 + 10"){
                maxValue = getAttrByName(characterID, "essence")*3 + 10 - spillOver;                   
            } else maxValue = getAttrByName(characterID, "personal-essence", "max"); 
            curValue = getAttrByName(characterID, "personal-essence");    
            diff = maxValue - curValue;

            if (diff < 5){
                maxValue = +maxValue;
                maxValue = maxValue.toString();
                exaltScript.setAttribute("personal-essence",characterID, maxValue);  
            } else {
                motes = +motes;
                curValue = +curValue+motes;
                curValue = curValue.toString();
                exaltScript.setAttribute("personal-essence",characterID, curValue);  
            }

        } else {
            curValue = +curValue+5;
            curValue = curValue.toString();
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

    NotifyChange: function(func,toggled){               //Function for use of notifying when a setting has been toggled
        if (toggled == false){
            toggled = "Disabled";
            color = "#FF0000"
        } 
        else {
            toggled = "Enabled";
            color = "#6B8E23"
        }
        sendChat('','/direct '
                        +'<div style=\''
                        +'color: black;'
                        +'padding: 5px 5px;'
                        +'background-color: #FFD700;'
                        +'font-family:"Palatino Linotype", "Book Antiqua", Palatino, serif;'
                        +'border: 3px solid #708090;'
                        +'text-align: center;'
                        +'\'>'
                        +"<h1>exaltScript</h1>"
                        +func
                        +' <span style="color:'
                        +color
                        +'; font-weight:bold;">'
                        +toggled
                        +'</span>'
                +'</div>'
            );
    },

    HandleInput: function(tokens){      
        tokens=_.filter(tokens, function(tok){
            return null == tok.match(/^--/);
        });
        var command = tokens[0];
        switch (command)
        {
            case 'addMotes': 
                exaltScript.addFiveMotes();
                break;
            
            case 'maxMotes':
                exaltScript.maxMotes();
                break;
                
            case 'animaToggle':
                if(state.doAnima == false) state.doAnima = true; 
                else state.doAnima = false;
                exaltScript.NotifyChange("Anima Increaser",state.doAnima);

                break;
                
            case 'initiativeToggle':
                if(state.doInitiative == false) state.doInitiative = true;
                else state.doInitiative = false;
                exaltScript.NotifyChange("Initiative Tracker",state.doInitiative);
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
            var debug = true;
            if(Campaign().get("turnorder") == "") turn = [];
            else turn = JSON.parse(Campaign().get("turnorder"));
            if (exaltScript.checkEndTurnMarker(turn) == true) exaltScript.createEndTurnMarker(turn);
        });

        on('chat:message', function(msg){
            if (msg.type !== 'api' ) return;
            if( !playerIsGM(msg.playerid) && exaltScript.gmOnly == true) return;
            var tokenized = msg.content.split(/\s+/);

            switch(tokenized[0]){
                case "!exaltScript":
                    exaltScript.HandleInput(_.rest(tokenized));
                    break;
            }
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