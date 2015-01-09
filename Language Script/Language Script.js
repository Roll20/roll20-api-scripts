var languageAvatar = "https://s3.amazonaws.com/files.d20.io/images/5538325/0OqDji-XRtAd9ilCHbTbOQ/thumb.png?1410447564"
var roll20API = roll20API || {};
var whoSpoke = "";
var whichLanguage = "";
var languageSeed = 0;
var gibberish = "";

roll20API.languageData = [
{
    Description: "Dwarven",  
    Sheet: "Language(Dwarven)",   
    languageSeed: 2, 
    characters: "Dwarven"},
{
    Description: "Elvish",   
    Sheet: "Language(Elvish)",    
    languageSeed: 4, 
    characters: "Elvish"}
];

numbers = [];
numbers["Standard"] = ["1","2","3","4","5","6","7","8","9","0"];
numbers["Dwarven"] = ["·",":","∴","+","◊","◊·","◊:","◊∴","◊+","°"];
numbers["Elvish"] = ["·",":","∴","+","¤","¤·","¤:","¤∴","¤+","°"];
numbers["Minor"] = ["·",":","∴","+","×","×·","×:","×∴","×+","°"];
numbers["Evil"] = ["·",":","∴","+","∏","∏·","∏:","∏∴","∏+","°"];
symbols = [];
symbols["Standard"] = ["!","@","#","$","%","¦","&","*","(",")","`","-","=","~","_","+","[","]","{","}","|",";","'",":",",",".","/","<",">","?"];
symbols["Dwarven"] = ["∫","»","‡","∇","‰","¦","χ","¬","|","]","`","-","Ξ","⊥","_","=","|","|","|","|","|","|","^","|","-","•","||","[","]","Ž"]; 
symbols["Elvish"] = ["~","•","⊕","§","‰","¦","∞","Φ","}","|","`","-","Ξ","≈","_","� ","]","[",")","(","|","|","'","∫","≈","·","� ", "∈","∋","¿"];
symbols["Minor"] = ["~","•","⊕","§","‰","¦","∞","Φ","}","|","`","-","Ξ","≈","_","� ","]","[",")","(","|","|","'","∫","≈","·","� ", "∈","∋","¿"];
symbols["Evil"] = ["∧","•","‡","§","‰","¦","χ","Φ","|","]","`","-","Ξ","≈","_","∧","|","|",")","(","|","|","'","∫","≈","•","||","∈","∋","¿"];
lower = [];
lower["Standard"] = ["b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","z"," "];
lower["Dwarven"] = ["⌈","⌉","⌊","⌋","¬","¦","Γ","Λ","Ξ","� ","‡","∫","[","]","|","||","� � ","VV","M","|","|"]; 
lower["Elvish"] = ["λ","Ψ","ϒ","ϖ","φ","ç","þ","Þ","q","r","ξ","∫","~","∈","∋","ω","∪","⊆","⊇","∂"," '"];
lower["Minor"] = ["b","c","d","ϒ","þ","h","∫","k","l","m","n","p","q","r","s","‡","v","w","t","×"," "];
lower["Evil"] = ["ζ","Ψ","ϒ","ϖ","∏","ç","þ","Þ","q","ξ","ς","∫","ς","∈","∋","ω","∪","⊆","⊇","μ","' "];
upper = [];
upper["Standard"] = ["B","C","D","F","G","H","J","K","L","M","N","P","Q","R","S","T","V","W","X","Z"];
upper["Dwarven"] = ["⌈","⌉","⌊","⌋","¬","¦","Γ","Λ","Ξ","� ","‡","∫","[","]","|","||","� � ","VV","M","|"]; 
upper["Elvish"] = ["λ","Ψ","ϒ","ϖ","φ","ç","þ","Þ","θ","η","ξ","∫","~","∈","∋","ω","∪","⊆","⊇","∂"];
upper["Minor"] = ["B","C","D","ϒ","þ","H","∫","K","L","M","N","P","θ","Γ","∂","‡","V","W","‡","χ"];
upper["Evil"] = ["ζ","Ψ","ϒ","ϖ","∏","ç","þ","Þ","θ","ξ","ς","∫","ς","E","∃","ω","∪","⊆","⊇","μ"];
vowel = [];
vowel["Standard"] = ["a","e","i","o","u","y","A","E","I","O","U","Y"];
vowel["Dwarven"]  = ["⌈","⌉","⌊","⌋","¬","¦","Γ","Λ","Ξ","Ξ","� ","‡"];
vowel["Elvish"] = ["í","ä","ö","ý","ú","ë","Í","Ä","Ö","Ÿ","Ú","Ë"];
vowel["Minor"] = ["� ","è","ì","õ","ù","ý","À","È","Ì","Ò","Ù","Ý"];
vowel["Evil"] = ["ô","ô","û","û","î","î","Ô","Ô","Û","Û","Î","Î"];

on("ready", function() {
    checkForSheets();

    on("chat:message", function (msg) {
        // Exit if not an api command
        if (msg.type != "api") return;
        
        //****Check For Language
        checkForLanguage(msg);

        // Get the API Chat Command
        msg.who = msg.who.replace(" (GM)", "");
        msg.content = msg.content.replace("(GM) ", "");
        var command = msg.content.split(" ", 1);

    });
});

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

    var numbersArrayStandard = numbers["Standard"] 
    var symbolsArrayStandard = symbols["Standard"]
    var lowerArrayStandard = lower["Standard"]
    var upperArrayStandard = upper["Standard"]
    var vowelArrayStandard = vowel["Standard"]
    var standardArray = numbersArrayStandard.concat(symbolsArrayStandard,lowerArrayStandard,upperArrayStandard,vowelArrayStandard);

    gibberish = sentence;
    for (var i=0;i<sentence.length;i++){
        var characterGiven = sentence.substr(i,1);
        var rng = CustomRandom(characterGiven.charCodeAt(0) + languageSeed);
        var gibberishCharacter = "";
        
        gibberishFunction(standardArray,givenArray,characterGiven)

    };

    var theSpeaker = _.findWhere(roll20API.fluencyArray, {isSpeaking: 1});
    if(theSpeaker.speaks == -1){
        sendChat(whoSpoke + "in mocking " + whichLanguage, gibberish);
        return
    };
    
    sendChat("yourself", "/w " + whoSpoke + " '" + sentence +"' in " + whichLanguage + ".");
    sendChat(whoSpoke, "/w gm Out loud in " + whichLanguage + ": '" + sentence + "'");
    
    _.each(roll20API.fluencyArray, function(indexPlayers) {
        if(indexPlayers.displayNameShort != whoSpoke){
            if(indexPlayers.speaks != -1){
                sendChat(whoSpoke, "/w " + indexPlayers.displayNameShort + " '" + sentence +"' in " + whichLanguage + ".");
            }else{
                sendChat(whoSpoke, "/w " + indexPlayers.displayNameShort + " " + gibberish)
            };    
        };
    });    
};

gibberishFunction = function(standardChar,changeChar,givenChar) {

        for (var j=0; j<standardChar.length; j++) {
            var rng = CustomRandom(givenChar.charCodeAt(0) + languageSeed);
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

//Seeded Random function
var CustomRandom = function(nseed) {    
    var seed, constant = Math.pow(2, 13)+1, prime = 1987, maximum = 1000;    
    if (nseed) {
        seed = nseed;    
    }
    if (seed == null) {
        // If no seed is given use date and time.
        seed = (new Date()).getTime();   
    }return{    
        next : function(min, max) {    
            seed *= constant;    
            seed += prime;    
            // if 'min' and 'max' are not provided, return random number between 0 & 1
            return min && max ? min+seed%maximum/maximum*(max-min) : seed%maximum/maximum;  
        }
    }
};

checkForFluency = function(msg) {
    if(findObjs({ _type: "character", name: msg.who }).length !== 0){
        var spokenByIds = findObjs({ _type: "character", name: msg.who })[0].get("controlledby").split(",");
        if (spokenByIds[0].length == 0){
            var languageError = "Uncontrolled Language Sheet."
            sendChat("API", languageError);
            return;
        };
    }else{
        var languageError = "Language Sheet does not exist.";
        sendChat("API", languageError);
        return;
    };
    var allPlayers = findObjs({_type: "player"}, {caseInsensitive: true});
    roll20API.fluencyArray = []
    _.each(allPlayers, function(indexPlayers) {
        var isSpeaking = 0;
        if(indexPlayers.get("_id") == msg.playerid){
            isSpeaking = 1;
            whoSpoke = indexPlayers.get("_displayname").substr(0,indexPlayers.get("_displayname").indexOf(' '));
        };
        var displayNameShort = indexPlayers.get("_displayname").substr(0,indexPlayers.get("_displayname").indexOf(' '));
        var displayNameFull = indexPlayers.get("_displayname")
        var playerID = indexPlayers.get("_id");
        var asWho = msg.who
        var speaks = spokenByIds.indexOf(indexPlayers.get("_id"));
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

checkForLanguage = function(msg) {
    var isLanguage = false;
    _.each(roll20API.languageData, function(eachLanguage) {
        var saidAs = msg.who;
        var languageToCheck = eachLanguage.Sheet;
        if(saidAs == languageToCheck){
            isLanguage = true;
            whichLanguage = eachLanguage.Description;
            languageSeed = eachLanguage.languageSeed;
            characters = eachLanguage.characters;
        };
    });
    if(isLanguage == false){return};
    checkForFluency(msg);
};

checkForSheets = function() {
        _.each(roll20API.languageData, function(eachLanguage) {
        var languageExist = findObjs({
                _type: "character",
                name: eachLanguage.Sheet 
        });
        if (languageExist.length == 0) {
            createObj("character", {
                avatar: languageAvatar,
                name: eachLanguage.Sheet,
                archived: false
            });
        };
    });
};