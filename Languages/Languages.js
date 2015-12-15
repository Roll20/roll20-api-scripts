// Github:   https://github.com/anthonytasca/roll20-api-scripts/blob/master/Languages/Languages.js
// By:       Anthony Tasca
// Contact:  https://app.roll20.net/users/1000007/target

/*
This is an enhancement on "WhatSaywithUnknown.js" by derekkoehl which is an enhancement on "What Did He Say?" by Stephen S.
*/

numbers = [];
numbers["Common"] = ["1","2","3","4","5","6","7","8","9","0"];
numbers["Dwarven"] = ["·",":","?","+","?","?·","?:","??","?+","°"];
numbers["Elven"] = ["·",":","?","+","¤","¤·","¤:","¤?","¤+","°"];
numbers["Draconic"] = ["·",":","?","+","×","×·","×:","×?","×+","°"];
numbers["Infernal"] = ["·",":","?","+","?","?·","?:","??","?+","°"];
symbols = [];
symbols["Common"] = ["!","@","#","$","%","¦","&","*","(",")","`","-","=","~","_","+","[","]","{","}","|",";","'",":",",",".","/","<",">","?"];
symbols["Dwarven"] = ["?","»","‡","?","‰","¦","?","¬","|","]","`","-","?","?","_","=","|","|","|","|","|","|","^","|","-","•","||","[","]","Ž"]; 
symbols["Elven"] = ["~","•","?","§","‰","¦","8","F","}","|","`","-","?","˜","_","†","]","[",")","(","|","|","'","?","˜","·","?", "?","?","¿"];
symbols["Draconic"] = ["~","•","?","§","‰","¦","8","F","}","|","`","-","?","˜","_","†","]","[",")","(","|","|","'","?","˜","·","?", "?","?","¿"];
symbols["Infernal"] = ["?","•","‡","§","‰","¦","?","F","|","]","`","-","?","˜","_","?","|","|",")","(","|","|","'","?","˜","•","||","?","?","¿"];
lower = [];
lower["Common"] = ["b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","z"," "];
lower["Dwarven"] = ["?","?","?","?","¬","¦","G","?","?","?","‡","?","[","]","|","||","??","VV","M","|","|"]; 
lower["Elven"] = ["?","?","?","?","f","ç","þ","Þ","q","r","?","?","~","?","?","?","?","?","?","?"," '"];
lower["Draconic"] = ["v","c","x","?","þ","s","?","ð","l","?","n","?","q","r","h","‡","b","w","t","d"," "];
lower["Infernal"] = ["?","?","?","?","?","ç","þ","?","q","?","?","Þ","?","?","?","?","?","?","?","µ","' "];
upper = [];
upper["Common"] = ["B","C","D","F","G","H","J","K","L","M","N","P","Q","R","S","T","V","W","X","Z"];
upper["Dwarven"] = ["?","?","?","?","¬","¦","G","?","?","?","‡","?","[","]","|","||","??","VV","M","|"]; 
upper["Elven"] = ["?","?","?","?","f","ç","þ","Þ","?","?","?","?","~","?","?","?","?","?","?","?"];
upper["Draconic"] = ["B","C","D","?","þ","H","?","K","L","M","N","P","?","G","?","‡","V","W","‡","?"];
upper["Infernal"] = ["?","?","?","?","?","ç","þ","Þ","?","?","?","?","?","E","?","?","?","?","?","µ"];
vowel = [];
vowel["Common"] = ["a","e","i","o","u","y","A","E","I","O","U","Y"];
vowel["Dwarven"]  = ["?","?","?","?","¬","¦","G","?","?","?","?","‡"];
vowel["Elven"] = ["í","ä","ö","ý","ú","ë","Í","Ä","Ö","Ÿ","Ú","Ë"];
vowel["Draconic"] = ["à","è","ì","õ","ù","ý","À","È","Ì","Ò","Ù","Ý"];
vowel["Infernal"] = ["ô","‡","?","û","¦","î","Ô","?","F","Û","Î","?"];

var roll20API = roll20API || {};
var whoSpoke = "";
var whichLanguage = "Common";
var languageSeed = 0;
var gibberish = "";
var playerIDGM = "-JwAP_Onk734JaP9UAOP";
var separators = /[()\-\s,]+/;
var spokenByIds;
var whoSpoke2;

roll20API.languageData = [{
    Description: "Unknown", 
    languageSeed: 7,
    characters: whichLanguage
},{
    Description: "Abyssal",
    languageSeed: 1, 
    characters: "Infernal"
},{
    Description: "Aquan",
	languageSeed: 1, 
	characters: "Elven"
},{
	Description: "Auran",   
	languageSeed: 1, 
	characters: "Draconic"
},{
	Description: "Celestial",   
	languageSeed: 2, 
	characters: "Draconic"
},{
	Description: "Draconic",    
	languageSeed: 3, 
	characters: "Draconic"
},{
	Description: "Druidic",  
	languageSeed: 2, 
	characters: "Elven"
},{
	Description: "Dwarven", 
	languageSeed: 1, 
	characters: "Dwarven"
},{
	Description: "Elven",  
	languageSeed: 3, 
	characters: "Elven"
},{
	Description: "Giant",  
	languageSeed: 2, 
	characters: "Dwarven"
},{
	Description: "Gnome",
	languageSeed: 3, 
	characters: "Dwarven"
},{
	Description: "Goblin",   
	languageSeed: 4, 
	characters: "Dwarven"
},{
	Description: "Gnoll",   
	languageSeed: 1, 
	characters: "Common"
},{
	Description: "Halfling",   
	languageSeed: 2, 
	characters: "Common"
},{
	Description: "Ignan",  
	languageSeed: 4, 
	characters: "Draconic"
},{
	Description: "Infernal",  
	languageSeed: 2, 
	characters: "Infernal"
},{
	Description: "Orc", 
	languageSeed: 5, 
	characters: "Dwarven"
},{
	Description: "Sylvan",  
	languageSeed: 4, 
	characters: "Elven"
},{
	Description: "Terran",
	languageSeed: 6, 
	characters: "Dwarven"
},{
	Description: "Undercommon", 
	languageSeed: 5, 
	characters: "Elven"
},{
    Description: "ThievesCant", 
	languageSeed: 3, 
	characters: "Common"
}];

handleChat = function(msg) {
	
	if (msg.type != "api"){
	    return;
	}

    var flag = false;
    _.each(roll20API.languageData, function(eachLanguage) {
    	if(msg.content.toLowerCase().indexOf(eachLanguage.Description.toLowerCase())>0){
            flag = true;
			whichLanguage = eachLanguage.Description;
        	msg.content = msg.content.replace(eachLanguage.Description, "");
    	    msg.content = msg.content.replace(eachLanguage.Description.toLowerCase(), "");
            msg.content = msg.content.replace(eachLanguage.Description.toUpperCase(), "");
		};
	});
    
    if(!flag){
		return;
    };
    
	checkForLanguage(msg);
    whichLanguage = 'Common';
};

checkForLanguage = function(msg) {
	_.each(roll20API.languageData, function(eachLanguage) {
		if(whichLanguage == eachLanguage.Description){
			languageSeed = eachLanguage.languageSeed;
			characters = eachLanguage.characters;
		};
	});
	checkForFluency(msg);
};

checkForFluency = function(msg) {
	var allPlayers = findObjs({_type: "player"}, {caseInsensitive: true});
	if(findObjs({ _type: "character", name: msg.who }).length !== 0){
		spokenByIds = "";
		_.each(allPlayers, function(p) {
			if(p.get("_online")){
                var speakingas = p.get("speakingas");
    			if(speakingas != undefined){
    				var languages = getAttrByName(speakingas.split("|")[1], "prolanguages")
    				if(languages != undefined){
    					languages.split(separators).forEach(function(lang) {
    						if(lang.toUpperCase() == whichLanguage.toUpperCase()){
    							spokenByIds += "," + p.get("id");
    						};
    					});
    				};
    			};
			};
		});
	}else{
		var languageError = "Only characters may speak character languages";
		sendChat("API", "/w " + msg.who + " " + languageError);
		return;
	};
	roll20API.fluencyArray = []
	_.each(allPlayers, function(indexPlayers) {
		if(indexPlayers.get("_online")){
    	    var isSpeaking = 0;
        	if(indexPlayers.get("_id") == msg.playerid){
    			isSpeaking = 1;
    			whoSpoke = indexPlayers.get("_displayname");
    		};
    		var displayNameShort = indexPlayers.get("_displayname").substr(0,indexPlayers.get("_displayname").indexOf(' '));
    		var displayNameFull = indexPlayers.get("_displayname");
    		var playerID = indexPlayers.get("_id");
    		var asWho = msg.who
            if(spokenByIds.indexOf(indexPlayers.get("_id"))>-1){
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
		};
	});
	prepareSend(msg);
};

prepareSend = function(msg) {
	var sentence = msg.content.substr(1);

    if(sentence.length == 0) {
		sendChat("API", "/w " + whoSpoke + " You didn't say anything.");
		return;
	};
    
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
	};
	var theSpeaker = _.findWhere(roll20API.fluencyArray, {isSpeaking: 1});
	if(theSpeaker.speaks == -1){
		sendChat(msg.who + " Pretending to Speak " + whichLanguage, gibberish);
		return
	};     
    
    if(whoSpoke.indexOf(" ")>-1){
        whoSpoke = whoSpoke.substring(0,whoSpoke.indexOf(" "));
    }
    
	sendChat(msg.who, "/w " + whoSpoke + " '" + sentence +"' in " + whichLanguage + ".");
	sendChat("Languages2GM", "/w gm " + msg.who + " said '" + sentence + "' in " + whichLanguage);
	
	_.each(roll20API.fluencyArray, function(indexPlayers) {
        if(indexPlayers.displayNameFull != whoSpoke && indexPlayers.displayNameShort != whoSpoke){
            if(indexPlayers.displayNameFull.indexOf(" ")>-1){
                whoSpoke2 = indexPlayers.displayNameFull.substring(0,indexPlayers.displayNameFull.indexOf(" "));
            }else{
                whoSpoke2 = indexPlayers.displayNameFull;
            }
            if(indexPlayers.speaks != -1){
        		sendChat(msg.who, "/w " + whoSpoke2 + " '" + sentence +"' in " + whichLanguage + ".");
        	}else{
        		sendChat(msg.who, "/w " + whoSpoke2 + " " + gibberish)
        	};    
        };
	});    
};

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
			};
			gibberish = gibberish.replace(givenChar,replaceCharacter);
		};
	};
};

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
};

on('chat:message', handleChat);