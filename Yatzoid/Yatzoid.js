/* ----------------------
 * - Yatzoid Game
 * ----------------------
 * Version. 1.0.0 (R20)
 * Author: Runnetty @ M2 Studio
 * 
 * The Campaign Script for the Roll20 version of Yatzoid
 * 
 */

var playerAmount=0;
let turn = 1;
let round = 1; 
var idOfTurnStarter="";
var setup=false;

on("ready", function() { 
    bootUp();
});
//Runs through the boot sequence
//Displays in chat
function bootUp(){
    sendChat("Welcome to Yatzoid", "/me <br> Type <code>!help</code> to show a list of helpful commands");
    sendChat("", "!help");
    
}
//Displays the current players turn and round to the chat;
on("change:campaign:turnorder", function(obj, prev) {    
    var turnorder =  JSON.parse(Campaign().get('turnorder'));
    
    if(turnorder[0]!=undefined){
       
        //log(turnorder[0]);
        var token = getObj('graphic', turnorder[0].id); //Game token
        var char = getObj("character",token.get("represents"));
        //log(char);
        var nowA = Object.keys(JSON.parse(obj.get("turnorder"))).length;
        var prevA = Object.keys(JSON.parse(prev.turnorder)).length;
        
        //Make sure we only increment turns and round when we dont add or remove players
        if(setup!=false && (nowA==prevA)){
            log("turn: "+turnorder[0].id+"; playerAmount: "+idOfTurnStarter);
            
            if(turnorder[0].id == idOfTurnStarter){
                log("same ID,increment round")
                round++;
                sendChat("", "/me <h3>Round:"+ round+"</h3> ");
            }
            showTurn();
            
        }else{
            setup=false;
            sendChat("", "/me <h3>Turn tracking changed</h3>");
            sendChat("", "/desc <h4>Run <code>!setup</code> again when you are ready to play.<h4>");
        }
    }
    
    //reset the dice tokens position
    resetDices();
    resetTokenPos();
 
});

function turnChange(turnid,who){
    var turnorder =  JSON.parse(Campaign().get('turnorder'));
    
    if(turnorder[0]!=undefined){
        
        var token = getObj('graphic', turnorder[0].id); //Game token
        var char = getObj("character",token.get("represents"));
        //log(char);
        var nowA = Object.keys(JSON.parse(obj.get("turnorder"))).length;
        var prevA = Object.keys(JSON.parse(prev.turnorder)).length;
        
        //Make sure we only increment turns and round when we dont add or remove players
        if(setup!=false && (nowA==prevA)){
            log("turn: "+turnorder[0].id+"; playerAmount: "+idOfTurnStarter);
            
            if(turnorder[0].id == idOfTurnStarter){
                log("same ID,increment round")
                round++;
                sendChat("", "/me <h3>Round:"+ round+"</h3> ");
            }else{
                turn++;
            }
            showTurn();
            
        }else{
            setup=false;
            sendChat("", "/me <h3>Turn tracking changed</h3>");
            sendChat("", "/desc <h4>Run <code>!setup</code> again when you are ready to play.<h4>");
        }
    }
    
    //reset the dice tokens position
    resetDices();
}

 //when the player changes the name of the character, also update the tokenname

function updateTokenNames(){
    for(var i = 0; i<playerAmount;i++ ){
	    //playerData[i]
	    //log(""+playerData[i].character_name+", token has name: "+ playerData[i].token_name);
        var token = getObj('graphic', playerData[i].token_id); //Game token
        token.set('name',playerData[i].character_name);
        //log(token.get('name'));
        //log(token);
    }
};


function showTurn(){
    var turnorder =  JSON.parse(Campaign().get('turnorder'));
    if(turnorder[0]!=undefined){
        
        if(turnorder[0].id!=undefined){
            var sid = turnorder[0].id;
            var token = getObj('graphic', sid); //Game token
            var rep = getObj("character",token.get("represents"));
            
            sendChat("", "/desc Its "+rep.get('name')+ "'s turn to play!"+
            "<br> - Remember to draw cards!");
            
            log("- Its " +  rep.get('name')+ "'s turn to play!");
            log('- Remember to draw cards!');
            log('- Round: '+round);
            
        }
    }else{
        sendChat("", "/desc Turn tracker is empty");
    }
}

//Repositions the dices for the next player
//To do:
	//make it not so hardcoded.
	//positions are moved right by 100 pixels each time
function resetDices() {
  var patroltoken = findObjs({_type: "graphic", name: "dice1"})[0]; 
  var patroltoken2 = findObjs({_type: "graphic", name: "dice2"})[0];
  var patroltoken3 = findObjs({_type: "graphic", name: "dice3"})[0];
  var patroltoken4 = findObjs({_type: "graphic", name: "dice4"})[0];
  var patroltoken5 = findObjs({_type: "graphic", name: "dice5"})[0];
  setPosition(patroltoken,170,400);
  setPosition(patroltoken2,170,500);
  setPosition(patroltoken3,170,600);
  setPosition(patroltoken4,170,700);
  setPosition(patroltoken5,170,800);
}

function resetTokenPos(){
    var ch = findObjs({type: 'character'});
    //log(ch);
     var shareInfoLen = Object.keys(ch).length;
     
    for(var i = 0; i < shareInfoLen; i++){
        var token = findObjs({_subtype: 'token',represents: ch[i].id})[0];
        setPosition(token, 932,(-15)+(360*(i+1)));
    }
}
    
function setPosition(obj, topDist,leftDist) {
  obj.set("left", leftDist);
  obj.set("top", topDist); 
  obj.set("rotation",0);
}

//A Global player data array for all currently playing characters and their tokens.
//Not in use, but has the data;
//Datapoints:
	//token_name
	//token_id
	//character_name
	//character_id
var playerData = [];

function listPlayers(){
    var turnorder =  JSON.parse(Campaign().get("turnorder"));
	let formatedText= "<ul>";
    
	for(var i = 0; i<playerAmount;i++ ){
        var sid = turnorder[i].id;
        var token = getObj('graphic', sid); //Game token
        var rep = getObj("character",token.get("represents")); // Character
        
		playerData[i] = {token_name: token.get('name'), token_id: sid,character_id:rep.id,character_name: rep.get('name')};
		formatedText += "<li><h3>"+playerData[i].character_name+"</h3></li>";
    }
   formatedText += "</ul>";
   sendChat("",formatedText);
}



//Resets all charactersheets
function resetScore(){
    var CONFIG = [{Att: 'adder'},{Att: 'dedacter'},{Att: 'ones'}, {Att: 'twos'}, {Att: 'threes'}
    ,{Att: 'fours'}, {Att: 'fives'}, {Att: 'sixes'}, {Att: 'bonus'}, {Att: 'tok'}, {Att: 'fok'}
    ,{Att: 'ss'}, {Att: 'ls'}, {Att: 'fh'}, {Att: 'chance'}, {Att: 'yatzoid'}, {Att: 'score'}
    ,{Att: 'ones_b'}, {Att: 'twos_b'}, {Att: 'threes_b'}, {Att: 'fours_b'}, {Att: 'fives_b'} 
   ,{Att: 'sixes_b'}, {Att: 'tok_b'}, {Att: 'fok_b'}, {Att: 'ss_b'}, {Att: 'ls_b'}, {Att: 'fh_b'}, {Att: 'chance_b'}];

    var ch = findObjs({type: 'character'});
    //log(ch);
     var shareInfoLen = Object.keys(ch).length;
     
    for(var i = 0; i < shareInfoLen; i++){

        ch[i].set('name',"Player"+(i+1));
        //log(ch[i]);
        var token = findObjs({_subtype: 'token',represents: ch[i].id})[0];
        //log(token);
        token.set('name',ch[i].get('name'));
        setPosition(token, 932,(-15)+(360*(i+1)));
        CONFIG.forEach(function (opts) {
            var oAtt1 = findObjs({_type:"attribute",name: opts.Att,_characterid: ch[i].id})[0];
            
            if(oAtt1 == undefined) {log('Token: '+token.name+' is missing Attribute on its sheet:'+opts.Att+"-is "+oAtt1);return;}
                oAtt1.set('current', 0);
        });
    }
}

//Chat commands
on("chat:message", function(msg) {
	var turnorder =  JSON.parse(Campaign().get('turnorder'));
    if(msg.type == "api" && msg.content == "!reset") {
      turn = 1;
      round = 1; 
      resetDices();
      sendChat("", "/desc - Reseting game.");
      log('- Reseting game.');
      resetScore();
    }
    
    if(msg.type == "api" && msg.content == "!nextturn-p1") {
      //sendChat("", "/desc - Round: "+ round);
      //log('- Displaying: Round: '+round);
      if(turnorder[0].id == turnid){
        //turnChange(msg.playerid);
         //sendChat(msg.who, "/me let go of his turn."); 
      }
      
    }else if(msg.type == "api" && msg.content == "!nextturn-p2") {
      //sendChat("", "/desc - Round: "+ round);
      //log('- Displaying: Round: '+round);
      if(turnorder[0].id == turnid){
        //turnChange(msg.playerid);
         // sendChat(msg.who, "/me let go of his turn.");
      }
    }else if(msg.type == "api" && msg.content == "!nextturn-p3") {
      //sendChat("", "/desc - Round: "+ round);
      //log('- Displaying: Round: '+round);
      if(turnorder[0].id == turnid){
        //turnChange(msg.playerid);
        //  sendChat(msg.who, "/me let go of his turn.");
      }
    }else if(msg.type == "api" && msg.content == "!nextturn-p4") {
      //sendChat("", "/desc - Round: "+ round);
      //log('- Displaying: Round: '+round);
      if(turnorder[0].id == turnid){
       // turnChange(msg.playerid);
         // sendChat(msg.who, "/me let go of his turn.");
      }
    }
    
    if(msg.type == "api" && msg.content == "!round") {
      sendChat("", "/desc - Round: "+ round);
      log('- Displaying: Round: '+round);
    }
    
    if(msg.type == "api" && msg.content == "!players") {
      log('- Displaying: Players: '+ playerAmount);
      listPlayers();
    }
    
    if(msg.type == "api" && msg.content == "!fixdice") {
      resetDices();
      sendChat("", "Fixing - Dices");
      log('- fixing dices: ');
    }
    
    if(msg.type == "api" && msg.content.indexOf("!setround ") !== -1) {
      round = msg.content.replace("!setround ", "");
      turn=1;
      sendChat("", "/desc - Round: "+ round);
      log('- Displaying: Round: '+round);
    }

    if(msg.type == "api" && msg.content == "!setup") {
        turn = 1;
        round = 1; 
        
        
        var shareInfoLen = Object.keys(turnorder).length;
        playerAmount = shareInfoLen;
        if(playerAmount!=0){
            log('- Running setup for ' + playerAmount +" players");
            sendChat("", "/desc Running setup for "+playerAmount+" players.");
            listPlayers();
            updateTokenNames();
            resetDices();
            resetTokenPos();
            sendChat("", "/me <h3>Round:"+ round+"</h3> ");
            
            if(turnorder[0]!=undefined){
                var sid = turnorder[0].id;
                idOfTurnStarter=sid;
                setup=true;
            }
            
            setTimeout(function (){
                showTurn();
            }, 1000);
        }else{
            log('- Can not run setup for 0 players! Run Initiative first!');
            sendChat("", "/desc Warning!");
            sendChat("","Can not run setup for 0 players! Run Initiative first! (click your token on the field then click initiative in top left corner)")
            
        }
    }
    
    if(msg.type == "api" && msg.content == "!help") {    
      sendChat("Commands are", "<ul><li><h3><code>!setup</code></h3> Runs the first time setup</li>"+
      "<li><h3><code>!reset</code></h3>Resets the game.</li>"+
      "<li><h3><code>!round</code></h3>Displays what round is being played.</li>"+
      "<li><h3><code>!setround #</code></h3>sets the round to a value.</li>"+
      "<li><h3><code>!fixdice</code></h3>Orders the dices.</li>"+
      "<li><h3><code>!players</code></h3>Shows amount of players.</li>"+"</ul>");
      log('- Displayed Help' );
    }
});