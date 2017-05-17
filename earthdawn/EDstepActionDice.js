//EarthDawn Action Dice, v1.0
//by Aqua Alex, 17 May 2017
//
//This allows players to enter '!ed <ActionStepNumber>, <KarmaStepNumber>' or '!ed <ActionStepNumber>, <KarmaStepNumber>, <GMROLL>' 
// to roll action dice for given step number. 
// <ActionStepNumber> is the action step number 
// <KarmaStepNumber> is the karma step number (0 if no karma used) 
// optional <GMROLL> is Y ( or 1, on , yes, whisper) if roll must be whispered to GM/DM only, default is NO. 
// A macro can be easily made with syntax similar to !ed ?{StepNumber|0}, ?{KarmaStep|0}

on("ready", function(){
    "use strict";
    var actionDice = function(stepNumber){
        var dice;
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
			case 14:
                dice = "1d20!+1d4!";
                break;
			case 15:
                dice = "1d20!+1d6!";
                break;
			case 16:
                dice = "1d20!+1d8!";
                break;
			case 17:
                dice = "1d20!+1d10!";
                break;
			case 18:
                dice = "1d20!+1d12!";
                break;
			case 19:
                dice = "1d20!+2d6!";
                break;
			case 20:
                dice = "1d20!+1d8!+1d6!";
                break;
			case 21:
                dice = "1d20!+1d10!+1d6!";
                break;
			case 22:
                dice = "1d20!+1d10!+1d8!";
                break;
			case 23:
                dice = "1d20!+2d10!";
                break;
			case 24:
                dice = "1d20!+1d12!+1d10!";
                break;
			case 25:
                dice = "1d20!+1d10!+1d8!+1d4!";
                break;
			case 26:
                dice = "1d20!+1d10!+1d8!+1d6!";
                break;
			case 27:
                dice = "1d20!+1d10!+2d8!";
                break;
			case 28:
                dice = "1d20!+2d10!+1d8!";
                break;
			case 29:
                dice = "1d20!+1d12!+1d10!+1d8!";
                break;
			case 30:
                dice = "1d20!+1d10!+1d8!+2d6!";
                break;
			case 31:
                dice = "1d20!+1d10!+2d8!+1d6!";
                break;
			case 32:
                dice = "1d20!+2d10!+2d8!";
                break;
			case 33:
                dice = "1d20!+3d10!+1d8!";
                break;
			case 34:
                dice = "1d20!+1d12!+2d10!+1d8!";
                break;
			case 35:
                dice = "2d20!+1d10!+1d8!+1d4!";
                break;
			case 36:
                dice = "2d20!+1d10!+1d8!+1d6!";
                break;
			case 37:
                dice = "2d20!+1d10!+2d8!";
                break;
			case 38:
                dice = "2d20!+2d10!+1d8!";
                break;
			case 39:
                dice = "2d20!+1d12!+1d10!+1d8!";
                break;
			case 40:
                dice = "2d20!+1d10!+1d8!+2d6!";
                break;
            default:
                dice = "incorrect value";
                // ERROR - Not provided for value
        }
        return dice;
    };

    on('chat:message',function(msg){
        if('api'===msg.type && msg.content.match(/^!ed/i)){
            let args = msg.content.toLowerCase().split(/\s+/).splice(1),
                n1 = parseInt(args[0],10)||0,
                n2 = parseInt(args[1],10)||0,
                whisper = _.contains([1,'1','on','y','yes','whisper'],args[2]);

            var rollMacro = (whisper) ? ('/gmroll ' + actionDice(n1) + '+' + actionDice(n2)):('/roll ' + actionDice(n1) + '+' + actionDice(n2));

            sendChat('ed',rollMacro);
        }
    });
});