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


var psUtils = psUtils || (function plexsoupUtils() {
    "use strict";
    var debug = false; // set this to true to log everything
    
    var info = {
		name: "psUtils",
		module: psUtils,
        version: 0.1,
        author: "plexsoup"
    };
    
    var config = {};
    var defaultConfig = {};


    var whisper = function chatMessageSender(playerName, message) {
        // sends a chat message to a specific player. Can use gm as playerName
        //sendChat(playerName, '/w ' + playerName + " " + message);
        sendChat("psIsoTravellers", '/w ' + playerName + " " + message);
    };

    var ch = function (character) {
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

        if(_.has(entities,character) ){
            return ('&'+entities[character]+';');
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
 
	var getGameMasterID = function gmIDGetter() {
		if (debug) log("entering getGameMasterID with no parameters");
		var activePlayers = findObjs({
			_type: "player"
		});
		
		if (debug) log("activePlayers: " + JSON.stringify(activePlayers));
		
		var gameMasters = _.filter(activePlayers, function(currentPlayer) { 
			return playerIsGM(currentPlayer.get("_id"));
		});

		if (debug) log("gameMasters: " + JSON.stringify(gameMasters) );
		
		if ( gameMasters.length > 0 ) {
			return gameMasters[0].get("_id"); // **** what happens if there's more than one?
		} else {
			return false;
		}
	};
	
	
	var getTokenPage = function tokenPageGetter(tokenID) {
		var tokenObj = getObj("graphic", tokenID);
		if ( tokenObj === undefined ) {
			return false;
		} else {
			return tokenObj.get(_pageid);
		}
	};
	
	var getPlayerPage = function playerPageGetter(playerID) {
		if (debug) log("entering " + info.name + ".getPlayerPage received " + playerID);
		var ribbonPageID = Campaign().get("playerpageid");
		var playerSpecificPages = Campaign().get("playerspecificpages");
		
		// also accepts "gm"
		if (playerID === "gm") {
			playerID = getGameMasterID();
		}
		
		var resultPage; 
		if ( playerIsGM(playerID) ) {			
			var gmObj = getObj("player", playerID );			
			var gmLastPage = gmObj.get("_lastpage");
			if (gmLastPage !== undefined && gmLastPage !== "") {
				resultPage = gmLastPage;
			} else {
				resultPage = ribbonPageID;
			}			
		} else { // it's a regular player: check the ribbon and playerspecificpages
			
			var playerPages = playerSpecificPages; // OBJECT, not JSON string
			if (playerPages !== false && _.has(playerPages, playerID) )  {
				resultPage = playerPages[playerID];
			} else { // all players are on same page
				resultPage = ribbonPageID;
			}
		}
		
		if (debug) log("Leaving getPlayerPage. Returning " + resultPage);
		return resultPage;
	}; 
	
	
	

	var checkInstall = function checkInstall() {
		log(info.name + " v" + info.version + " installed");
	};
    
	var registerEventHandlers = function () {
		log( info.name + " listening"); 
		
	};
    
    return {
		GetPlayerPage: getPlayerPage,
		getCurrentPage: getPlayerPage,
		GetTokenPage: getTokenPage,
		GetGameMasterID: getGameMasterID,
		ch: ch,
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
    };
    


}()); // end module


