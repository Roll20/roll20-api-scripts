// Github:   https://github.com/anthonytasca/roll20-api-scripts/blob/master/Languages/Languages.js
// By:       Anthony Tasca
// Contact:  https://app.roll20.net/users/1000007/target

//An enhancement on an enhacnement to the What Did He Say? script by Stephen S.

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
var languageAvatar = "https://s3.amazonaws.com/files.d20.io/images/5538325/0OqDji-XRtAd9ilCHbTbOQ/thumb.png?1410447564"
var whoSpoke = "";
var whichLanguage = "Common";
var languageSeed = 0;
var gibberish = "";
var playerIDGM = "-JwAP_Onk734JaP9UAOP";
var separators = /[()\-\s,]+/;

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
}];

handleChat = function(msg) {
	if (msg.type != "api"){
	    return;
	}
	if(msg.content.indexOf('!Common ') == 0){
		whichLanguage = 'Common';
		msg.content = msg.content.replace("!Common ", "!");
	}else if(msg.content.indexOf('!Dwarven ') == 0){
		whichLanguage = 'Dwarven';
		msg.content = msg.content.replace("!Dwarven ", "!");
	}else if(msg.content.indexOf('!Elven ') == 0){
		whichLanguage = 'Elven';
		msg.content = msg.content.replace("!Elven ", "!");
	}else if(msg.content.indexOf('!Sylvan ') == 0){
		whichLanguage = 'Sylvan';
		msg.content = msg.content.replace("!Sylvan ", "!");
	}else if(msg.content.indexOf('!Orc ') == 0){
		whichLanguage = 'Orc';
		msg.content = msg.content.replace("!Orc ", "!");
	}else if(msg.content.indexOf('!Terran ') == 0){
    	whichLanguage = 'Terran';
		msg.content = msg.content.replace("!Terran ", "!");
	}else if(msg.content.indexOf('!Undercommon ') == 0){
		whichLanguage = 'Undercommon';
		msg.content = msg.content.replace("!Undercommon ", "!");
	}else if(msg.content.indexOf('!Halfling ') == 0){
    	whichLanguage = 'Halfling';
		msg.content = msg.content.replace("!Halfling ", "!");
	}else if(msg.content.indexOf('!Gnoll ') == 0){
    	whichLanguage = 'Gnoll';
		msg.content = msg.content.replace("!Gnoll ", "!");
	}else if(msg.content.indexOf('!Goblin ') == 0){
		whichLanguage = 'Goblin';
		msg.content = msg.content.replace("!Goblin ", "!");
	}else if(msg.content.indexOf('!Gnome ') == 0){
        whichLanguage = 'Gnome';
		msg.content = msg.content.replace("!Gnome ", "!");
	}else if(msg.content.indexOf('!Giant ') == 0){
    	whichLanguage = 'Giant';
		msg.content = msg.content.replace("!Giant ", "!");
	}else if(msg.content.indexOf('!Celestial ') == 0){
		whichLanguage = 'Celestial';
		msg.content = msg.content.replace("!Celestial ", "!");
	}else if(msg.content.indexOf('!Druidic ') == 0){
        whichLanguage = 'Druidic';
		msg.content = msg.content.replace("!Druidic ", "!");
	}else if(msg.content.indexOf('!Draconic ') == 0){
		whichLanguage = 'Draconic';
		msg.content = msg.content.replace("!Draconic ", "!");
	}else if(msg.content.indexOf('!Auron ') == 0){
    	whichLanguage = 'Auron';
		msg.content = msg.content.replace("!Auron ", "!");
	}else if(msg.content.indexOf('!Aquan ') == 0){
        whichLanguage = 'Aquan';
		msg.content = msg.content.replace("!Aquan ", "!");
	}else if(msg.content.indexOf('!Abyssal ') == 0){
		whichLanguage = 'Abyssal';
		msg.content = msg.content.replace("!Abyssal ", "!");
	}else if(msg.content.indexOf('!Infernal ') == 0){
    	whichLanguage = 'Infernal';
		msg.content = msg.content.replace("!Infernal ", "!");
	}
	checkForLanguage(msg);
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
		var spokenByIds = "";
		_.each(allPlayers, function(p) {
			var speakingas = p.get("speakingas");
			if(speakingas != undefined){
				var languages = getAttrByName(speakingas.split("|")[1], "prolanguages")
				if(languages != undefined){
					languages.split(separators).forEach(function(lang) {
						if(lang == whichLanguage){
							spokenByIds += "," + p.get("id");
						}
					});
				}
			}
		});
	}else{
		var languageError = "Speaker is not a character";
		sendChat("API", languageError);
		return;
	};
	roll20API.fluencyArray = []
	_.each(allPlayers, function(indexPlayers) {
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
	});
	prepareSend(msg);
};

prepareSend = function(msg) {
	var sentence = msg.content.substr(1)

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
		sendChat(whoSpoke + " Pretending to Speak " + whichLanguage, gibberish);
		return
	};
		
	sendChat("yourself", "/w " + whoSpoke + " '" + sentence +"' in " + whichLanguage + ".");
	sendChat("Lang To GM", "/w gm " + whoSpoke + " said '" + sentence + "' in " + whichLanguage);
	
	_.each(roll20API.fluencyArray, function(indexPlayers) {
		if(indexPlayers.displayNameFull != whoSpoke){
			if(indexPlayers.speaks != -1){
				sendChat(whoSpoke, "/w " + indexPlayers.displayNameFull + " '" + sentence +"' in " + whichLanguage + ".");
			}else{
				sendChat(whoSpoke, "/w " + indexPlayers.displayNameFull + " " + gibberish)
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