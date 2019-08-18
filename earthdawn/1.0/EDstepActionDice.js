//EarthDawn Action Dice, v1.0
//by Aqua Alex, 17 May 2017
//
//This allows players to enter '!ed <ActionStepNumber>, <KarmaStepNumber>' or '!ed <ActionStepNumber>, <KarmaStepNumber>, <GMROLL>, <edition>' 
// to roll action dice for given step number. 
// <ActionStepNumber> is the action step number 
// <KarmaStepNumber> is the karma step number (0 if no karma used) 
// optional <GMROLL> is used to detemine whether it is a gmroll or normal roll - values can be: Y, 1, on, yes or whisper if roll must be whispered to GM/DM only, default is NO. 
// optional <edition> is used to know which edition to use 1,2,3 or 4, default is 1. 
// A macro can be easily made with syntax similar to !ed ?{StepNumber|0}, ?{KarmaStep|0}, ?{GMROLL|Y}, ?{Edition|1} 

on("ready", function(){
    "use strict";
	var actionDice1 = function(stepNumber){
        var dice, dicegroups, d20s, d8s, even, d10s, remainder = 0;
		// each uneven group adds 1d20 and each uneven group adds 1d10+1d8
		if (stepNumber > 13) {
			remainder = (stepNumber - 13) % 11;
			if (remainder === 0) {
				dicegroups = 0;
				remainder = 11;
			} else {
				dicegroups = 1;  //cycle starts on 6 so add 1 for 2nd cycle
			}
			dicegroups = dicegroups + Math.floor((stepNumber - 13) / 11); 
			even = Math.floor(dicegroups/2);
			d20s = even;
			d10s = dicegroups - even;
			d8s = d10s;
			stepNumber = remainder + 2;
		} 
        switch(stepNumber) {
            case 0:
                dice = "0";
                break;
            case 1:
                dice = "1d4!-2";
                break;
            case 2:
                dice = "1d4!-1";
                break;
            case 3:
                dice = "1d4!";
                break;
            case 4:
                dice = "1d6!";
                break;
            case 5:
                dice = "1d8!";
                break;
            case 6:
                dice = "1d10!";
                break;
            case 7:
                dice = "1d12!";
                break;
            case 8:
                dice = "2d6!";
                break;
            case 9:
                dice = "1d8!+1d6!";
                break;
            case 10:
                dice = "1d10!+1d6!";
                break;
            case 11:
                dice = "1d10!+1d8!";
                break;
            case 12:
                dice = "2d10!";
                break;
			case 13:
                dice = "1d12!+1d10!";
                break;
        }  // switch(stepNumber) - actionDice1
		dice = (d10s > 0) ? (d10s + "d10! + " + d8s + "d8! + " + dice):(dice);
		dice = (d20s > 0) ? (d20s + "d20! + " + dice):(dice);
        return dice;
    };  //actionDice1
	
    var actionDice3 = function(stepNumber){
        var dice;
		var d12s;
		var remainder = 0;
		if (stepNumber > 12) {
			remainder = (stepNumber - 12) % 7;
			if (remainder === 0) {
				d12s = 0;
				remainder = 7;
			} else {
				d12s = 1;  //cycle starts on 6 so add 1 for 2nd cycle
			}
			d12s = d12s + Math.floor((stepNumber - 12) / 7); 
			stepNumber = remainder + 5;
		} 
        switch(stepNumber) {
            case 0:
                dice = "0";
                break;
            case 1:
                dice = "1d6!-3";
                break;
            case 2:
                dice = "1d6!-2";
                break;
            case 3:
                dice = "1d6!-1";
                break;
            case 4:
                dice = "1d6!";
                break;
            case 5:
                dice = "1d8!";
                break;
            case 6:
                dice = "1d10!";
                break;
            case 7:
                dice = "1d12!";
                break;
            case 8:
                dice = "2d6!";
                break;
            case 9:
                dice = "1d8!+1d6!";
                break;
            case 10:
                dice = "2d8";
                break;
            case 11:
                dice = "1d10!+1d8!";
                break;
            case 12:
                dice = "2d10!";
                break;
        } // switch(stepNumber) - actionDice3
		dice = (d12s > 0) ? (d12s + "d12! + " + dice):(dice);
        return dice;
    };  //actionDice3
	
	var actionDice4 = function(stepNumber){
        var dice;
		var d20s;
		var remainder = 0;
		if (stepNumber > 18) {
			remainder = (stepNumber - 18) % 11;
			if (remainder === 0) {
				d20s = 0;
				remainder = 11;
			} else {
				d20s = 1;  //cycle starts on 6 so add 1 for 2nd cycle
			}
			d20s = d20s + Math.floor((stepNumber - 18) / 11); 
			stepNumber = remainder + 7;
		} 
        switch(stepNumber) {
            case 0:
                dice = "0";
                break;
            case 1:
                dice = "1d4!-2";
                break;
            case 2:
                dice = "1d4!-1";
                break;
            case 3:
                dice = "1d4!";
                break;
            case 4:
                dice = "1d6!";
                break;
            case 5:
                dice = "1d8!";
                break;
            case 6:
                dice = "1d10!";
                break;
            case 7:
                dice = "1d12!";
                break;
            case 8:
                dice = "2d6!";
                break;
            case 9:
                dice = "1d8!+1d6!";
                break;
            case 10:
                dice = "2d8!";
                break;
            case 11:
                dice = "1d10!+1d8!";
                break;
            case 12:
                dice = "2d10!";
                break;
			case 13:
                dice = "1d12!+1d10!";
                break;
			case 14:
                dice = "2d12!";
                break;
			case 15:
                dice = "1d12!+2d6!";
                break;
			case 16:
                dice = "1d12!+1d8!+1d6!";
                break;
			case 17:
                dice = "1d12!+2d8!";
                break;
			case 18:
                dice = "1d12!+1d10+1d8!";
                break;			
        } // switch(stepNumber) - actionDice3
		dice = (d20s > 0) ? (d20s + "d20! + " + dice):(dice);
        return dice;
    };  //actionDice4

    on("chat:message",function(msg){
        if("api"===msg.type && msg.content.match(/^!ed/i)){
            let args = msg.content.toLowerCase().split(/\s+/).splice(1),
                actionStep = parseInt(args[0],10)||0,
                karmaStep = parseInt(args[1],10)||0,
                whisper = _.contains([1,"1","on","y","yes","whisper"],args[2]),
				edition = parseInt(args[3],10)||0;
			
			var rollMacro;
				
			switch(edition) {
            case 0:
			case 1:
			case 2:
                rollMacro = (whisper) ? ("/gmroll " + actionDice1(actionStep) + "+" + actionDice1(karmaStep)):("/roll " + actionDice1(actionStep) + "+" + actionDice1(karmaStep));
                break;
            case 3:
                rollMacro = (whisper) ? ("/gmroll " + actionDice3(actionStep) + "+" + actionDice3(karmaStep)):("/roll " + actionDice3(actionStep) + "+" + actionDice3(karmaStep));
                break;
            case 4:
                rollMacro = (whisper) ? ("/gmroll " + actionDice4(actionStep) + "+" + actionDice4(karmaStep)):("/roll " + actionDice4(actionStep) + "+" + actionDice4(karmaStep));
                break;
			default:
				rollMacro = "/me selected the wrong edition, redo with edition (parameter 4) being 1,2,3 or 4";
			}  //edition switch

            sendChat("ed",rollMacro);
        } //if api
    }); //on chat:message
});