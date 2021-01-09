/*
PF2E Treat Wounds Check

Version     0.1
Author:     Mark Stoecker
Roll20:     https://app.roll20.net/users/580967/mark-s
BitBucket:  https://bitbucket.org/desertwebdesigns/roll20/src/master/TreatWounds/

*/

// Do damage on crit failure
// Convert to await/async usage to be able to double healing amount on crit success
// Nat 20 turns failure into success, currently registers as crit success

on("ready", () => {
    const getCharByName = (charname) => {
        return findObjs({type: 'character', name: charname});
    };
    
    const getTokenControl = (args) => {
        token = getObj("graphic", args[1]);
        if (token === undefined) {
            character = getCharByName(args[1]);
            if (character.length == 1)
                character = character[0];
            else
                return false;
        } else {
            tokencontrol = token.get('controlledby').split(",");
            character = getObj("character", token.get('represents'));
        }
        charactercontrol = character.get('controlledby').split(",");
        if ((token !== undefined && _.contains(tokencontrol,args[0])) || _.contains(charactercontrol,args[0]))
            return true;
        else
            return false;
    };
    
    const performSurgery = (character, target) => {
        sendChat(character, "/em performs some risky surgery on " + target + " and deals [[1d8]] points of damage");
        return;
    };

    const performHeal = (character, surgery, DC, player, target) => {
        if (surgery == "1") {
            surgeryMod = 2;
            riskySurgery = " + 2[Risky Surgery]";
        } else {
            surgeryMod = 0;
            riskySurgery = '';
        };
        
        sendChat(character, "/roll 1d20 + @{" + character + "|medicine} + " + surgeryMod, function(ops) {
            data = JSON.parse(ops[0].content);
            result = data.rolls[0].results[0].v;
            total = data.total;
            
            var checkDC = DC.replace( /^\D+/g, '');
            let crit = 0;

            if (total >= Number(checkDC)+10) {
                crit += 1;
            } else if (total <= Number(checkDC)-10) {
                crit -= 1;
            }
            
            if (result == 1) {
                crit -= 1;
            } else if (result == 20) {
                crit += 1;
            }
            switch (true) {
                case (crit > 0):
                    critmsg = "<br>Critical Success!";
                    break;
                case (crit < 0):
                    critmsg = "<br>Critical Failure!";
                    break;
                default:
                    critmsg = "";
            }
            
            if (total >= checkDC) {
                switch (Number(checkDC)) {
                    case 20:
                        healmod = 10;
                        break;
                    case 30:
                        healmod = 20;
                        break;
                    case 40:
                        healmod = 30;
                        break;
                    default:
                        healmod = 0;
                        break;
                };
                heal = true;
            } else {
                heal = false;
            }
            
            let healmsg = "&{template:rolls} {{charactername=" + character + "}} {{header=Treat Wounds Check}} {{subheader=Skill}} {{roll01=[[" + result + riskySurgery + " + [@{" + character + "|medicine_proficiency_display}] (@{" + character + "|medicine})[@{" + character + "|text_modifier}] + (@{" + character + "|query_roll_bonus})[@{" + character + "|text_bonus}]]]}} {{roll01_type=skill}}";

            if (crit != 0) {
                healmsg += "{{roll01_info=" + critmsg + "}} ";
            }
            
            if (heal) {
                healmsg += "{{roll02=[[2d8+" + healmod + "]]}} {{roll02_type=heal}} {{roll02_info=HP Healed}} {{roll02_misc=hp healed}} ";
            }
            
            healmsg += "{{roll01misc=" + DC + "}} {{notes_show=@{" + character + "|roll_show_notes}}} {{notes=@{" + character + "|medicine_notes}}}";
            
            sendChat("player|" + player, healmsg);
            
            if (crit < 0) {
                sendChat(character, "/em causes [[1d8]] points of damage to " + target + " due to their carelessness");
            }
        });
    };

    on("chat:message", msg => {
        if(msg.type == "api") {
            args = msg.content.split(",");
            switch(args[0].toLowerCase()) {
                case '!performsurgery':
                    if (args.length == 5) {
                        if (getTokenControl([msg.playerid, args[1]])) {
                            if (args[2] == 1)
                                performSurgery(args[1], args[4]);
                            performHeal(args[1], args[2], args[3], msg.playerid, args[4]);
                        }
                    } else {
                        sendChat("GM", "/w GM Incorrect number of parameters sent to '!performsurgery'");
                        return;
                    }
            }
        }
    });
});