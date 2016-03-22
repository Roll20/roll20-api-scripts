/*

Github:   https://github.com/anthonytasca/roll20-api-scripts/blob/master/Languages/Languages.js
By:       Anthony Tasca
Contact:  https://app.roll20.net/users/1000007/target

INTRODUCTION:
This is a re-work of "WhatSaywithUnknown.js" by derekkoehl which is an "enhancement" on "What Did He Say?" by Stephen S.
More information and a link to the credited work is provided here: https://app.roll20.net/forum/post/2723217/script-languages

TO INSTALL:
The default character sheet language attribute that this script uses is "prolanguages"
Change this if your character sheets dont use this attribute
    TO DO:
    !setLanugageTag newlanguagetag

*/

var LanguageScript = LanguageScript || (function () {
    'use strict';
    
    var version = "1.1.1",
    releasedate = "12/17/2015",  
    languageTag = "prolanguages",
    whichLanguage = "Common",
    playerIDGM = "-JwAP_Onk734JaP9UAOP",
    
    numbers = [],
    symbols = [],
    lower = [],
    vowel = [],
    upper = [],
    
    roll20API = roll20API || {},
    
    whoSpoke = "",
	whoSpoke2 = "",
    gibberish = "",
    spokenByIds = "",
    characters = "",
    
    rndSeed,
    languageSeed = 0,
    separators = /[()\-\s,]+/,
    
    checkInstall = function() {
        log("version: "+version+" ("+releasedate+") installed");
        log("https://github.com/Roll20/roll20-api-scripts/tree/master/Languages");
    },
    
    initialize = function() {
        numbers["Common"] = ["1","2","3","4","5","6","7","8","9","0"];
        numbers["Dwarven"] = ["·",":","?","+","?","?·","?:","??","?+","°"];
        numbers["Elven"] = ["·",":","?","+","¤","¤·","¤:","¤?","¤+","°"];
        numbers["Draconic"] = ["·",":","?","+","×","×·","×:","×?","×+","°"];
        numbers["Infernal"] = ["·",":","?","+","?","?·","?:","??","?+","°"];
        
        symbols["Common"] = ["!","@","#","$","%","¦","&","*","(",")","`","-","=","~","_","+","[","]","{","}","|",";","'",":",",",".","/","<",">","?"];
        symbols["Dwarven"] = ["?","»","‡","?","‰","¦","?","¬","|","]","`","-","?","?","_","=","|","|","|","|","|","|","^","|","-","•","||","[","]","Ž"]; 
        symbols["Elven"] = ["~","•","?","§","‰","¦","8","F","}","|","`","-","?","˜","_","†","]","[",")","(","|","|","'","?","˜","·","?", "?","?","¿"];
        symbols["Draconic"] = ["~","•","?","§","‰","¦","8","F","}","|","`","-","?","˜","_","†","]","[",")","(","|","|","'","?","˜","·","?", "?","?","¿"];
        symbols["Infernal"] = ["?","•","‡","§","‰","¦","?","F","|","]","`","-","?","˜","_","?","|","|",")","(","|","|","'","?","˜","•","||","?","?","¿"];
        
        lower["Common"] = ["b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","z"," "];
        lower["Dwarven"] = ["?","?","?","?","¬","¦","G","?","?","?","‡","?","[","]","|","||","??","VV","M","|","|"]; 
        lower["Elven"] = ["?","?","?","?","f","ç","þ","Þ","q","r","?","?","~","?","?","?","?","?","?","?"," '"];
        lower["Draconic"] = ["v","c","x","?","þ","s","?","ð","l","?","n","?","q","r","h","‡","b","w","t","d"," "];
        lower["Infernal"] = ["?","?","?","?","?","ç","þ","?","q","?","?","Þ","?","?","?","?","?","?","?","µ","' "];
       
        upper["Common"] = ["B","C","D","F","G","H","J","K","L","M","N","P","Q","R","S","T","V","W","X","Z"];
        upper["Dwarven"] = ["?","?","?","?","¬","¦","G","?","?","?","‡","?","[","]","|","||","??","VV","M","|"]; 
        upper["Elven"] = ["?","?","?","?","f","ç","þ","Þ","?","?","?","?","~","?","?","?","?","?","?","?"];
        upper["Draconic"] = ["B","C","D","?","þ","H","?","K","L","M","N","P","?","G","?","‡","V","W","‡","?"];
        upper["Infernal"] = ["?","?","?","?","?","ç","þ","Þ","?","?","?","?","?","E","?","?","?","?","?","µ"];
        
        vowel["Common"] = ["a","e","i","o","u","y","A","E","I","O","U","Y"];
        vowel["Dwarven"]  = ["?","?","?","?","¬","¦","G","?","?","?","?","‡"];
        vowel["Elven"] = ["í","ä","ö","ý","ú","ë","Í","Ä","Ö","Ÿ","Ú","Ë"];
        vowel["Draconic"] = ["à","è","ì","õ","ù","ý","À","È","Ì","Ò","Ù","Ý"];
        vowel["Infernal"] = ["ô","‡","?","û","¦","î","Ô","?","F","Û","Î","?"];
        
        roll20API.languageData = [];
        
        pushLanguage("Unknown",7,whichLanguage);
        pushLanguage("Abyssal",1,"Infernal");
        pushLanguage("Aquan",1,"Elven");
        pushLanguage("Auran",1,"Draconic");
        pushLanguage("Celestial",2,"Draconic");
        pushLanguage("Draconic",3,"Draconic");
        pushLanguage("Druidic",2,"Elven");
        pushLanguage("Dwarven",1,"Dwarven");
        pushLanguage("Elven",3,"Elven");
        pushLanguage("Giant",2,"Dwarven");
        pushLanguage("Gnome",3,"Dwarven");
        pushLanguage("Goblin",4,"Dwarven");
        pushLanguage("Gnoll",1,"Common");
        pushLanguage("Halfling",2,"Common");
        pushLanguage("Ingan",4,"Draconic");
        pushLanguage("Infernal",2,"Infernal");
        pushLanguage("Orc",5,"Dwarven");
        pushLanguage("Sylvan",4,"Elven");
        pushLanguage("Terran",6,"Dwarven");
        pushLanguage("Undercommon",5,"Elven");
        pushLanguage("Thieves'Cant",3,"Common");
    },  
    
    handleChat = function(msg) {    
    	if (msg.type != "api"){
    	    return;
    	}
        
        if(msg.content.toLowerCase().indexOf("setlanguagetag ")==1){
            if(playerIsGM(msg.playerid)){
                setLanguageTag(msg);
            }else{
                sendChat("Languages Script", "access denied, " + msg.who + " could set language tag")
            }
            return;
        }
        
        if(msg.content.toLowerCase().indexOf("createlanguage ")==1){
            if(playerIsGM(msg.playerid)){
                if(msg.content.split(" ").length == 4 && !isNaN(msg.content.split(" ")[2])){
                    createLanguage(msg.content.split(" ")[1],parseInt(msg.content.split(" ")[2]),msg.content.split(" ")[3]);
                }else{
                    sendChat("Languages Script", "could not create language, try this syntax: !createlanguage [name] [#seed] [parent] .. ex: !createlanguage newlanguage 3 common");
                }
            }else{
                sendChat("Languages Script", "access denied, " + msg.who + " could not create language")
            }
            return;
        }
        
        if(msg.content.toLowerCase().indexOf("deletelanguage ")==1){
            if(playerIsGM(msg.playerid)){
                deleteLanguage(msg.content.split(" ")[1]);
            }else{
                sendChat("Languages Script", "access denied, " + msg.who + " could not create language")
            }
            return;
        }
    	
    	if(isSpeakingLanguage(msg)){
            checkForFluency(msg);
            whichLanguage = 'Common';
            return;
    	}
    },
    
    checkForFluency = function(msg) {
    	var allPlayers = findObjs({_type: "player"}, {caseInsensitive: true});
    	if(findObjs({ _type: "character", name: msg.who }).length !== 0 || playerIsGM(msg.playerid)){
    		spokenByIds = "";
    		_.each(allPlayers, function(p) {
    			if(p.get("_online")){
                    var speakingas = p.get("speakingas");
        			if(speakingas != undefined){
        				var languages = getAttrByName(speakingas.split("|")[1], languageTag);
        				if(languages != undefined){
        					languages.split(separators).forEach(function(lang) {
        						if(lang.toUpperCase() == whichLanguage.toUpperCase()){
        							spokenByIds += "," + p.get("id");
        						}
        					});
    					}else if(findObjs({ _type: "character", _id: speakingas }).length !== 0){
                            sendChat("Languages Script", "This script is set up properly for your character sheets. Use this command to fix: !setlanguagetag [character sheet language attribute name]");
        				    log("This script is not set up for your character sheets. Use this command to fix: !setlanguagetag [character sheet language attribute name]");   
    		                return;
    					}else if(playerIsGM(p.get("id"))){
                            log("The previous error was handled properly and there is nothing to worry about");
    					}
        			}
    			}
    		});
    	}else{
    		var languageError = "Only characters or GMs may speak character languages";
    		sendChat("Languages Script", "/w " + msg.who + " " + languageError);
    		return;
    	}
    	roll20API.fluencyArray = []
    	_.each(allPlayers, function(indexPlayers) {
    		if(indexPlayers.get("_online")){
        	    var isSpeaking = 0;
            	if(indexPlayers.get("_id") == msg.playerid){
        			isSpeaking = 1;
        			whoSpoke = indexPlayers.get("_displayname");
        		}
        		var displayNameShort = indexPlayers.get("_displayname").substr(0,indexPlayers.get("_displayname").indexOf(' '));
        		var displayNameFull = indexPlayers.get("_displayname");
        		var playerID = indexPlayers.get("_id");
        		var asWho = msg.who
                if(spokenByIds.indexOf(indexPlayers.get("_id"))>-1){
        		    var speaks = 1;
            	}else if(playerIsGM((indexPlayers.get("_id")))){
                    var speaks = 1;
            	}else{
                    var speaks = -1;   
            	}
        		roll20API.fluencyArray.push({
        			isSpeaking: isSpeaking,
        			displayNameShort: displayNameShort,
        			displayNameFull: displayNameFull,
        			playerID: playerID,
        			asWho: asWho,
        			speaks: speaks
        		});
    		}
    	});
    	prepareSend(msg);
    },
    
    prepareSend = function(msg) {
    	var sentence = msg.content.substr(1);
    
        if(sentence.length == 0) {
    		sendChat("Languages Script", "/w " + whoSpoke + " You didn't say anything.");
    		return;
    	}
        
    	var numbersArray = numbers[characters] 
    	var symbolsArray = symbols[characters]
    	var lowerArray = lower[characters]
    	var upperArray = upper[characters]
    	var vowelArray = vowel[characters]
    	var givenArray = numbersArray.concat(symbolsArray,lowerArray,upperArray,vowelArray);
    	var numbersArrayStandard = numbers["Common"] 
    	var symbolsArrayStandard = symbols["Common"]
    	var lowerArrayStandard = lower["Common"]
    	var upperArrayStandard = upper["Common"]
    	var vowelArrayStandard = vowel["Common"]
    	var standardArray = numbersArrayStandard.concat(symbolsArrayStandard,lowerArrayStandard,upperArrayStandard,vowelArrayStandard);
    
    	gibberish = sentence;
    	for (var i=0;i<sentence.length;i++){
    		var characterGiven = sentence.substr(i,1);
    		var rng = customRandom(characterGiven.charCodeAt(0) + languageSeed);
    		var gibberishCharacter = "";
    		gibberishFunction(standardArray,givenArray,characterGiven)
    	}
    	
    	var theSpeaker = _.findWhere(roll20API.fluencyArray, {isSpeaking: 1});
    	if(theSpeaker.speaks == -1){
    		sendChat(msg.who + " Pretending to speak " + whichLanguage, gibberish);
    		return
    	}
        
        if(whoSpoke.indexOf(" ")>-1){
            whoSpoke = whoSpoke.substring(0,whoSpoke.indexOf(" "));
        }
        
    	sendChat(msg.who, "/w " + whoSpoke + " '" + sentence +" ' in " + whichLanguage + ".");
    	sendChat("Languages Script", "/w gm " + msg.who + " said '" + sentence + " ' in " + whichLanguage);
    	
    	_.each(roll20API.fluencyArray, function(indexPlayers) {
            if(indexPlayers.displayNameFull != whoSpoke && indexPlayers.displayNameShort != whoSpoke){
                if(indexPlayers.displayNameFull.indexOf(" ")>-1){
                    whoSpoke2 = indexPlayers.displayNameFull.substring(0,indexPlayers.displayNameFull.indexOf(" "));
                }else{
                    whoSpoke2 = indexPlayers.displayNameFull;
                }
                if(indexPlayers.speaks != -1){
            		sendChat(msg.who, "/w " + whoSpoke2 + " '" + sentence +" ' in " + whichLanguage + ".");
            	}else{
            		sendChat(msg.who, "/w " + whoSpoke2 + " " + gibberish)
            	}  
            }
    	});  
    },
    
    gibberishFunction = function(standardChar,changeChar,givenChar) {
    	for (var j=0; j<standardChar.length; j++) {
    		var rng = customRandom(givenChar.charCodeAt(0) + languageSeed);
    		rndSeed = rng.next(1,changeChar.length);
    		var seedRndInt = Math.round(rndSeed);
    		if(standardChar[j] == givenChar) {
    			if(changeChar[seedRndInt] == undefined){
    				var replaceCharacter = " ";
    			}else{
    				var replaceCharacter = changeChar[seedRndInt];
    			}
    			gibberish = gibberish.replace(givenChar,replaceCharacter);
    		}
    	}
    },
    
    customRandom = function(nseed) {    
    	var seed, constant = Math.pow(2, 13)+1, prime = 1987, maximum = 1000;    
    	if (nseed) {
    		seed = nseed;    
    	}
    	if (seed == null) {
    		seed = (new Date()).getTime();   
    	}return{    
    		next : function(min, max) {    
    			seed *= constant;    
    			seed += prime;    
    			return min && max ? min+seed%maximum/maximum*(max-min) : seed%maximum/maximum;  
    		}
    	}
    },
    
    setLanguageTag = function(msg){
    	if(msg.content.indexOf(" ")>0 && msg.content.indexOf(" ")<msg.content.length){
            var tempLanguageTag = msg.content.substring(msg.content.indexOf(" ")+1, msg.content.length);
            var flag = false;
            var allCharacters = findObjs({_type: "character"}, {caseInsensitive: true});
            _.each(allCharacters, function(c) {
        	   	if(!flag){
                  	var languages = getAttrByName(c.id, tempLanguageTag);
               		if(languages == undefined){
                  		flag = true;
        	     	}
               	}
            });
        	if(!flag){
                languageTag = tempLanguageTag;
                var languageMessage = "language attribute name set to '" + languageTag + "'";
                sendChat("Languages Script", "/w gm " + languageMessage);
                return;
        	}else{
                log("The previous error was handled properly and there is nothing to worry about")
                var languageMessage = "'" + tempLanguageTag + "' is not the name of an attribute in your character sheet";
    			sendChat("Languages Script", "/w gm " + languageMessage);
                return;   
    		}
        }else{
            var languageError = "invalid language tag";
            sendChat("Languages Script", "/w gm " + languageError);
            return;
        }
    },
    
    isSpeakingLanguage = function(msg){
    	var flag = false;
    	_.each(roll20API.languageData, function(eachLanguage) {
        	if(msg.content.toLowerCase().indexOf(eachLanguage.Description.toLowerCase())==1){
    			whichLanguage = eachLanguage.Description;
            	msg.content = msg.content.replace(eachLanguage.Description, "");
        	    msg.content = msg.content.replace(eachLanguage.Description.toLowerCase(), "");
                msg.content = msg.content.replace(eachLanguage.Description.toUpperCase(), "");
                languageSeed = eachLanguage.languageSeed;
        		characters = eachLanguage.characters;
    			flag = true;
    		}
    	});
    	return flag;
    },
    
    createLanguage = function(description, seed, parentlanguage){
        var tempArray = roll20API.languageData.filter(function(language){
            return (description.toLowerCase() !== language.Description.toLowerCase());
        });
        if(arraysEqual(tempArray,roll20API.languageData)){
            if(parentlanguage.toLowerCase() == "dwarven"){
                parentlanguage = "Dwarven";
            }else if(parentlanguage.toLowerCase() == "common"){
                parentlanguage = "Common";
            }else if(parentlanguage.toLowerCase() == "elven"){
                parentlanguage = "Elven";
            }else if(parentlanguage.toLowerCase() == "infernal"){
                parentlanguage = "Infernal";
            }else if(parentlanguage.toLowerCase() == "draconic"){
                parentlanguage = "Draconic";
            }else{
                var languageError = "parent langauge: '" + parentlanguage + "' is not valid. Choices are : Dwarven, Elven, Common, Draconic, Infernal";
                sendChat("Languages Script", "/w gm " + languageError);
                return;
            }
            pushLanguage(description,seed,parentlanguage);
            var languageMessage = "langauge: '" + description + "' was created";
            sendChat("Languages Script", "/w gm " + languageMessage);
        }else{
            var languageError = "language: '" + description + "' already exists and could not be created again";
            sendChat("Languages Script", "/w gm " + languageError);
        }
    },
    
    pushLanguage = function(description, seed, parentlanguage){
        roll20API.languageData.push({
            Description: description,   
            languageSeed: seed, 
            characters: parentlanguage
        });
    },
    
    deleteLanguage = function(description){
    	var tempArray = roll20API.languageData.filter(function(language){
            return (description.toLowerCase() !== language.Description.toLowerCase());
    	});
        if(arraysEqual(tempArray,roll20API.languageData)){
            var languageError = "langauge: '" + description + "' was not found and could not be deleted";
            sendChat("Languages Script", "/w gm " + languageError);
        }else{
            roll20API.languageData = tempArray;
            var languageError = "language: '" + description + "' deleted";
            sendChat("Languages Script", "/w gm " + languageError);
        }
    },

    arraysEqual = function(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    },
    
    registerEventHandlers = function() {
        on('chat:message', handleChat);
    };
    
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
        Init: initialize
    };
    
}());

on('ready', function() {
    'use strict';
    LanguageScript.CheckInstall();
    LanguageScript.Init();
    LanguageScript.RegisterEventHandlers();
});