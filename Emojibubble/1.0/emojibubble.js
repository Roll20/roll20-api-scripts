var emojibubble = emojibubble||(function(){
    
    state.emojibubble = state.emojibubble||{};
    state.emojibubble.registry = state.emojibubble.registry||{};
    state.emojibubble.help = state.emojibubble.help||"";
    state.emojibubble.customemoji = state.emojibubble.customemoji||initializeemoji();
    state.emojibubble.macro = state.emojibubble.macro||"";
    state.emojibubble.selectedmacro = state.emojibubble.selectedmacro||"";
    
    var DEFAULTPLAYER;
    var calculatetokenoffset = function(token){
        let width = token.get("width"), height=token.get("height");
        let pathX = (width/2);
        let pathY = ((height/2) -10)*-1;
        let textX = pathX;
        let textY = pathY - 4;
        return {
            bubbleoffsetx:pathX,
            bubbleoffsety:pathY,
            textoffsetx:textX,
            textoffsety:textY
        };
    }
    var emojibubbleregister = function(token,emoji){
        try{
            let ser = state.emojibubble.registry;
            let tokenid = token.id;
            if(emoji === "clearemojibubble"){
                return emojibubblecleanup(tokenid);
            }
            if(ser[tokenid]){
                emojibubblecleanup(tokenid);
            }
            let emojiBubbleObj = createEmojiBubble(token, emoji);
            ser[tokenid] = emojiBubbleObj;
        }catch(err){

        }
    }
    
    var emojibubblecheck = function(token){
        let tokenid = token.id, ser = state.emojibubble.registry;
        if(ser[tokenid]){
            let x = token.get("left");
            let y = token.get("top");
            let pathObj = getObj("path",ser[tokenid].pathObj);
            let textObj = getObj("text",ser[tokenid].textObj);
            let offsets = calculatetokenoffset(token);
            try{
                if(pathObj !== undefined && textObj !== undefined)
                pathObj.set({ 
                    left: x + offsets.bubbleoffsetx,
                    top: y + offsets.bubbleoffsety
                });
                textObj.set({
                    left: x + offsets.textoffsetx,
                    top: y + offsets.textoffsety
                });
            }catch(err){

            }
            
        }
    }
    
    var emojibubblecleanup = function(tokenid){
        let ser = state.emojibubble.registry;
        if(ser[tokenid] && ser[tokenid].pathObj !== null){
            try{
                getObj("path",ser[tokenid].pathObj).remove();
                getObj("text",ser[tokenid].textObj).remove();
                ser[tokenid].pathObj = null;
                ser[tokenid].textObj = null;
            }catch(err){
                ser[tokenid].pathObj = null;
                ser[tokenid].textObj = null;
            }
        }
    }
    
    var createEmojiBubble = function(token, emoji){
        let x = token.get("left");
        let y = token.get("top");
        let offsets = calculatetokenoffset(token);
        let pathObj = createObj('path', {
            pageid: token.get("pageid"),
            left: x + offsets.bubbleoffsetx,
            top: y + offsets.bubbleoffsety,
            width: 35,
            height: 30,
            fill: "#ffffff",
            stroke: "#000000",
            stroke_width: 1,
            layer: 'objects',
            path: JSON.stringify([["M", 10, 20],["Q", 10, 10, 20, 10],["Q", 25, 10, 30, 10],[ "Q", 40, 10, 40, 20],["Q", 40, 30, 30, 30],[ "Q", 25, 30, 20, 30],[ "Q", 15, 30, 8, 34],["Z"]]),
            controlledby: "emoji"
        });
        let textObj = createObj('text', {
            pageid: token.get("pageid"),
            left: x + offsets.textoffsetx,
            top: y + offsets.textoffsety,
            width:30,
            height:30,
            font_size:12,
            layer:"objects",
            text: emojibuilder(emoji)
        });
        toFront(pathObj);
        toFront(textObj);
        return {"pathObj":pathObj.get("_id"),"textObj":textObj.get("_id")};
    }
    
    var emojiObj = { 
        "longrest":[0x1F6CF,0xFE0F],
        "shortrest":0x1FA91,
        "rations":0x1F371,
        "tavern":0x1F37A,
        "camp":0x26FA,
        "inn":0x1F3E1,
        "nature":[0x1F3DE,0xFE0F],        
        "meal":[0x1F37D,0xFE0F],
        "meat":0x1F356,
        "herb":0x1F33F,  
        
        "hurt":0x1FA78,        

        "search":0x1F50E,
        "interrogate":[0x1F441,0xFE0F,0x200D,0x1F5E8,0xFE0F],
        "investigate":[0x1F9E0],
        "look":[0x1F441,0xFE0F],
        "barter":[0x1F3F7,0xFE0F],

        "gamble":0x1F3B2,
        "door":0x1F6AA,
        "key":[0x1F5DD,0xFE0F],
        "deception":0x1F3AD,       
        "hole":[0x1F573,0xFE0F],
        
        "archery":0x1F3F9,
        "duel":[0x2694,0xFE0F],        
        "tracking":0x1F43E,
        "craft":0x1F528,
        
        "sleep":0x1F4A4,
        "waiting":0x23F3,
        "speaking":0x2026, 
        "notes":0x1F3B6,  
        "angry":0x1F4A2,      
        "justice":[0x2696,0xFE0F],        
        "sweat":0x1F4A7,
          
        "strange":0x1F773,        
        "demon":0x1F479,
        "dragon":0x1F432,
        
        "scroll":0x1F4DC,
        "alchemy":[0x2697, 0xFE0F],
        "arcana":0x2728,
        "temple":[0x1F3DB,0xFE0F],
        "castle":0x1F3F0,

        "dead":[0x26B0,0xFE0F],
        "death":[0x2620,0xFE0F],

        "quest":0x2757,
        "question":0x2753, 
        "no":0x1F44E,
        "yes":0x1F44D,

        "gem":0x1F48E,
        "candle":[0x1F56F,0xFE0F],
        "cleric":0x1F4FF,
        "shield":[0x1F6E1,0xFE0F],
        
        "owl":0x1F989,
        "fox":0x1F98A,
        "bear":0x1F43B,
        "bull":0x1F42E,
        "eagle":0x1F414,
        "cat":0x1F431,

        "fire":0x1F525,
        "water":0x1F30A,
        "earth":[0x26F0,0xFE0F],
        "wind":0x1F4A8,
        
        "heart":[0x2764,0xFE0F],
        "smile":0x1F642,
        "hearteyes":0x1F60D,
        "rofl":0x1F923,
        
        "sus":0x1F928,
        "neutral":0x1F610,
        "pensive":0x1F614,
        "sad":0x1F61F,
        
        "mad":0x1F620,
        "cursing":0x1F92C,
        "sick":0x1F922,
        "poo":'0x1F4A9'
        
        
    };
    
    var initializeemoji = function(){
        log('in initializeemoji');
        let emojilibrary = {},
        dupArray = function(arr){
            let dup = [], iterator=0;
                _.each(arr,function(a){
                    dup[iterator++]=a;
                })
            return dup;
        };
         _.each(emojiObj, function(emobj,key){
            emojilibrary[key] = (Array.isArray(emobj))?dupArray(emobj):emobj;
            
        });
        return emojilibrary;
    }

    var digestEmoji = function(emoji){
        var sliceEmoji = function(str) {
            let res = ['', ''];
            for (let c of str) {
                let n = c.codePointAt(0);
                let isEmoji = n > 0xfff || n === 0x200d || (0xfe00 <= n && n <= 0xfeff);
                res[1 - isEmoji] += c;
            }
            return res;
        }
        var hex = function(str) {
            return [...str].map(x => x.codePointAt(0).toString(16))
        }
        return sliceEmoji(emoji).map(hex)[0];
    }
    
    var emojibuilder = (numref) => {
        let results = "",emoji=state.emojibubble.customemoji[numref];
        if(Array.isArray(emoji)){
            _.each(emoji, function(ref){
                try{
                results += emojiFromCodePoint(ref);
                }catch(err){log(err.message)}
            });
        }else{
            try{
            results += emojiFromCodePoint(emoji);
            }catch(err){log(err.message)}
        }
        return results;
    }
    var emojiFromCodePoint = function(num){
        if(typeof num === "string"){
            if(num.indexOf("0x") === -1){
                num = "0x" + num;
            }
        }
        return String.fromCodePoint(num);
    }
    
    var emojilistHTML = function(){
        let list = '',count=0;
        list += '<p style="width:100%;text-align:center;"><a style="border: 2px solid black ; font-size: 14pt ; height: 25px ; display: inline-block ; margin: 2px ; border-radius: 5px;padding:5px 2px 0 2px;color:#000;" href="!emojibubble|clearemojibubble">Clear Emoji Bubble</a></p>';
        _.each(state.emojibubble.customemoji, function(emobj,key){
            list+= '<a style="border:2px solid black;font-size:14pt;width:25px;height:25px;display:inline-block;margin:2px;border-radius:5px;text-align:center;" title="' + key + '" href="!emojibubble|' + key + '">' +  emojibuilder(key) + '</a>';
            count++;
            if(count%12===0){
                list+='<hr />';
            }else if(count%4===0){
                list+='<span style="font-size:14pt;margin:0 8pt 0 8pt;"> | </span>';
            }
        });
        return list;
    }
    
    var buttonstyle = 'border: 2px solid black ; font-size: 14pt ; height: 25px ; display: inline-block ; margin: 2px ; border-radius: 5px;padding:5px 2px 0 2px;color:#000;';
    
    var emojicontrollistHTML = function(){
        let list = '',count=0;
        list += '<p style="width:100%;text-align:center;">';
        list += '<a style="' + buttonstyle + '" href="!emojibubble --addemoji|?{Emoji}|?{Name}">Add Emoji</a>';
        list += '<a style="' + buttonstyle + '" href="!emojibubble --resetemoji">Reset Emoji</a>';
        list += '</p>';
        list += '<p>You can find new emoji to copy-paste at <a href="https://emojipedia.org/">Emojipedia</a> among other places.</p>'; 
        list += '<div style="position:inline-block;width:100%;outline:2px solid white;text-align:center;'+ buttonstyle+'">Click on Gray Emoji to Delete</div>';
        _.each(state.emojibubble.customemoji, function(emobj,key){
            list+= '<a style="border:2px solid black;font-size:14pt;width:25px;height:25px;display:inline-block;margin:2px;border-radius:5px;text-align:center;background-color:#999;" title="' + key + '" href="!emojibubble --deleteemoji|' + key + '">' +  emojibuilder(key) + '</a>';
            count++;
            if(count%12===0){
                list+='<hr />';
            }else if(count%4===0){
                list+='<span style="font-size:14pt;margin:0 8pt 0 8pt;"> | </span>';
            }
        });
        return list;  
    }
    
    var outputToChat = function(msg,tgt){
        if(tgt==="all"){
            sendChat("Emojibubble", msg);
        }else{
            tgt = (tgt !== undefined && tgt !== null)?tgt:"gm";
            sendChat("Emojibubble","/w \"" + tgt + "\" " + msg,null,{noarchive:true});
        }
        
    }
    
    var msgHandler = function(msg){
        if(msg.type === "api" && msg.content.indexOf("!emojibubble") === 0 ){
            let who = (playerIsGM(msg.playerid))?"gm":msg.who;
            let emoji = msg.content.split("|")[1];
            var token = (msg.selected)?getObj("graphic",msg.selected[0]._id):null;
            if(msg.content.indexOf("--targettoken") !== -1){token = getObj("graphic",msg.content.split("|")[2]);}
            if(msg.content.indexOf("--addemoji") !== -1){
                if(who==='gm'){
                    let digested =  digestEmoji(emoji);
                    let key = msg.content.split("|")[2];
                    state.emojibubble.customemoji[key] = digested;
                    rebuildhandoutcontent();
                    rebuildmacro();
                    rebuildselecedtmacro();
                }
                return;
            }
            if(msg.content.indexOf("--resetemoji") !== -1){
                if(who==='gm'){
                    state.emojibubble.customemoji = initializeemoji();
                    rebuildhandoutcontent();
                    rebuildmacro();
                    rebuildselecedtmacro();
                }
                return;
            }
            if(msg.content.indexOf("--deleteemoji")!== -1){
                if(who==='gm'){
                    delete state.emojibubble.customemoji[emoji];
                    rebuildhandoutcontent();
                    rebuildmacro();
                    rebuildselecedtmacro();
                }
                return false;
            }
            if(token === null || token === undefined){
                return outputToChat("Select a token to say your emoji.",who);
            }
            if(token && token.get("_subtype") !== "token"){ 
                return outputToChat("Select a target that is a token.",who);
            }
            if(msg.selected !== undefined){
                _.each(msg.selected, function(token_ref){
                    let token = getObj("graphic",token_ref._id);
                    emojibubbleregister(token,emoji);
                });
            }else{
                emojibubbleregister(token,emoji);
            }
        }
    }
    
    var rebuildhandoutcontent = function(){
        let handout = getObj("handout",state.emojibubble.help),
        content = helpDisplay(),
        gmcontent = controlsDisplay();
        if(handout){
            setTimeout(function(){
                //handout.set("notes",content + '<span style="color:white;">.</span>');
                handout.set("gmnotes", gmcontent);// + '<span style="color:white;">.</span>'
                setTimeout(function(){
                    handout.set("notes",content);
                    //handout.set("gmnotes", gmcontent);
                },0);
            },0);
        }
    }
    
    var rebuildmacrocontent = function(){
        return ('!emojibubble --targettoken|?{' + createEmojiSelect() + '}|@{target|speaker|token_id}');
    }
    
    var rebuildselectedmacrocontent = function(){
        return ('!emojibubble|?{' + createEmojiSelect() + '}');
    }
    
    var rebuildmacro = function(){
        if(state.emojibubble.macro && getObj("macro",state.emojibubble.macro)){
             var macro = getObj("macro",state.emojibubble.macro);
             macro.set("action",rebuildmacrocontent());
        }
    }
    
    var rebuildselecedtmacro = function(){
        if(state.emojibubble.selectedmacro && getObj("macro",state.emojibubble.selectedmacro)){
             var macro = getObj("macro",state.emojibubble.selectedmacro);
             macro.set("action",rebuildselectedmacrocontent());
        }
    }
    
    var helpDisplay = function(){
        return emojilistHTML();
    }
    var controlsDisplay = function(){
        return emojicontrollistHTML();
    }
    
    var initialize = function(){
        on("chat:message", msgHandler);
        on("change:graphic", emojibubblecheck);
        DEFAULTPLAYER = (function(){
                                let player;
                                let playerlist = findObjs({                              
                                      _type: "player",                          
                                });
                                _.each(playerlist, function(obj) {    
                                  if(playerIsGM(obj.get("_id"))){
                                      player = obj;
                                  }
                                });
                                return player;
                            })();
        var helpoutput = "";
        if(!state.emojibubble.help || !getObj("handout",state.emojibubble.help)){
            if(findObjs({type:"handout",name:"Emojibubble Console"})[0]){
                state.emojibubble.help = findObjs({type:"handout",name:"Emojibubble Console"})[0].get("_id");
            }else{
                let content = helpDisplay(),
                gmcontent = controlsDisplay(),
                handout = createObj("handout",{
                    name: "Emojibubble Console",
                    inplayerjournals: "all"
                });
                state.emojibubble.help = handout.get("_id");
                setTimeout(function(){
                    handout.set("notes",content);
                    setTimeout(function(){
                        handout.set("gmnotes", gmcontent);
                    },100);
                },100);
            }
        }
        helpoutput += '<p>' + '<a href="http://journal.roll20.net/handout/' + state.emojibubble.help + '">Emojibubble Console</a></p>';
        createEmojiSelect = function(){
            let list = 'Select Emoji',count=0;
            list += '|Clear,clearemojibubble';
            _.each(state.emojibubble.customemoji, function(emobj,key){
                list+= '|' + emojibuilder(key) + ',' + key;
            });
            return list;
        }

        outputToChat(helpoutput, "all");
        
        if(!state.emojibubble.macro || !getObj("macro",state.emojibubble.macro)){
            var macro = findObjs({type:"macro",name:"Target_Emojibubble"})[0];
            try{
                
            }catch(err){
                log(err.message);
            }
            if( macro && macro !== undefined ){
                state.emojibubble.macro = macro.id;
            }else{
                let action =rebuildmacrocontent(),
                macro = createObj("macro",{
                    playerid:DEFAULTPLAYER.id,
                    name:   "Target_Emojibubble",
                    action: action,
                    visibleto:  DEFAULTPLAYER.id,
                    istokenaction:false
                });
                state.emojibubble.macro = macro.id;
            }
        }
        if(!state.emojibubble.selectedmacro || !getObj("macro",state.emojibubble.selectedmacro)){
            var macro = findObjs({type:"macro",name:"Selected_Emojibubble"})[0];
            try{
                
            }catch(err){
                log(err.message);
            }
            if( macro && macro !== undefined ){
                state.emojibubble.selectedmacro = macro.id;
            }else{
                let action =rebuildselectedmacrocontent(),
                macro = createObj("macro",{
                    playerid:DEFAULTPLAYER.id,
                    name:   "Selected_Emojibubble",
                    action: action,
                    visibleto:  "all",
                    istokenaction:false
                });
                state.emojibubble.selectedmacro = macro.id;
            }
        }
    }
    
    return {
        create: emojibubbleregister,
        initialize:initialize 
    }
})();

on("ready", function(){
    emojibubble.initialize();
});