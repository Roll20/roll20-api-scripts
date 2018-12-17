//Ars Magica 5e Automated Stress Die, v1.0
//by Chris Lankford, May 26, 2016
//
//This allows players to enter "!st <n1>" or "!st <n1>, <n2>" to roll a stress
//die with modifier n1 and optional botch dice count n2.
//Botch dice count defaults to 1 when used with one argument.
//Can also be used with a push-button macro, as in:
//!st ?{Modifier|0}, ?{Botch Dice|1}
//
//A 1 in the code is the 0 described in the text, and a 10 in the code is a 1 
//described in the corebook's text. This does not bias the results, as they
//are both special cases.

on("chat:message", function(msg) {
  if(msg.type == "api" && msg.content.indexOf("!st ") !== -1) {
    var noPrefix = msg.content.replace("!st ", "");
    if (noPrefix.indexOf(",")==-1){ //This segment just deals with the default case
        rollStress(msg.who,noPrefix,"1");
    } else {
        var splitString = noPrefix.split(",");
        rollStress(msg.who,splitString[0].replace(" ",""),splitString[1].replace(" ",""));
    } 
  }
});


function rollStress(speaker,modifier,botchDice) {
    //inputs are strings!
    sendChat(speaker,"/roll 1d10",function(ops){
        var rollResult=JSON.parse(ops[0].content);
        
        if (rollResult.total===1){
            sendChat(speaker,"Potential Botch...!");
            var rollString="/roll "+botchDice+"d10=1";
            
            sendChat(speaker,rollString,function (ops){
               var rollResult=JSON.parse(ops[0].content);
               var returnString;
               if (rollResult.total>0){
                   returnString="BOTCHED x "+rollResult.total+"!";
               } else {
                   returnString="No botch. Stress Die Result: "+modifier;
               };
               sendChat(speaker,returnString);
            });   
        
        
        } else if (rollResult.total===10){
            sendChat(speaker,"/roll 1d10!",function (ops){
                var rollResult=JSON.parse(ops[0].content);
                var exponent = rollResult.rolls[0].results.length;//number of 10s is length - 1, but we already hit a 10, so the multiplier is 2^length.
                //For example, if we rolled a ten on the first die, then a 10 and 3 here, we should have 3*2^2 = 3*4 = 12, then + modifier.
                var multiplier = Math.pow(2,exponent);
                var finalRoll=Number(rollResult.rolls[0].results[exponent-1].v);
                if (finalRoll===1){//Note that a roll of 1 (0 in the book) is a ten on rolls after the first die.
                    finalRoll=10;
                }
                var rollTotal=multiplier*finalRoll + Number(modifier);
                
                sendChat(speaker,multiplier+"x Multiplier!");
                sendChat(speaker,"Stress Die Result: "+rollTotal);
            });
        } else {
            var rollTotal=Number(rollResult.total)+Number(modifier);
            sendChat(speaker,"Stress Die Result: "+rollTotal);
        }
        
    });

}