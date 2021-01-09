/*
PF2E Treat Wounds Check

Version     0.2
Author:     Mark Stoecker
Roll20:     https://app.roll20.net/users/580967/mark-s
BitBucket:  https://bitbucket.org/desertwebdesigns/roll20/src/master/TreatWounds/

*/

// Convert to await/async usage to be able to double healing amount on crit success
// Do damage on crit failure
// Nat 20 turns failure into success, currently registers as crit success

// Future versions:
// Send error message back to chat on failure
// rename args array in handleInput for ease of use
// Allow for generic tokens that don't represent a character (requires sending healing modifier with api call)

var RLRGaming = RLRGaming || {};

RLRGaming.TreatWounds = RLRGaming.TreatWounds || (function() {
    'use strict';
    
    const version = "0.2";
    
    const getChar = (tokenorname) => {
        var character = getCharByToken(tokenorname);
        
        switch (character) {
            case undefined:
                return false;
                break;
            case false:
                character = getCharByName(tokenorname);
                if (!character) {
                    return false;
                }
                break;
        }
        
        return character;
    };
    
    const getCharByName = (charname) => {
        var chars = findObjs({type: 'character', name: charname});
        if (chars.length == 1)
            return chars[0];
        else
            return false;
    };
    
    const getCharByToken = (tokenid) => {
        var token = getObj("graphic", tokenid);
        if (token === undefined)
            return false;
        else
            return getObj("character", token.get('represents'));
    };

    const hasCharacterControl = (playerid, character) => {
        if (!character) {
            log("A valid character name/token was not supplied");
            return false;
        }
        
        var charactercontrol = character.get('controlledby').split(",");
        
        if (
            _.contains(charactercontrol,playerid) ||
            _.contains(charactercontrol,'all')
        )
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
            var surgeryMod = 2;
            var riskySurgery = " + 2[Risky Surgery]";
        } else {
            var surgeryMod = 0;
            var riskySurgery = '';
        };
        
        sendChat(character, "/roll 1d20 + @{" + character + "|medicine} + " + surgeryMod, function(ops) {
            var data = JSON.parse(ops[0].content);
            var result = data.rolls[0].results[0].v;
            var total = data.total;
            
            var checkDC = DC.replace( /^\D+/g, '');
            var crit = 0;

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
                    var critmsg = "<br>Critical Success!";
                    break;
                case (crit < 0):
                    var critmsg = "<br>Critical Failure!";
                    break;
                default:
                    var critmsg = "";
            }
            
            if (total >= checkDC) {
                switch (Number(checkDC)) {
                    case 20:
                        var healmod = 10;
                        break;
                    case 30:
                        var healmod = 20;
                        break;
                    case 40:
                        var healmod = 30;
                        break;
                    default:
                        var healmod = 0;
                        break;
                };
                var heal = true;
            } else {
                var heal = false;
            }
            
            var healmsg = "&{template:rolls} {{charactername=" + character + "}} {{header=Treat Wounds Check}} {{subheader=Skill}} {{roll01=[[" + result + riskySurgery + " + [@{" + character + "|medicine_proficiency_display}] (@{" + character + "|medicine})[@{" + character + "|text_modifier}] + (@{" + character + "|query_roll_bonus})[@{" + character + "|text_bonus}]]]}} {{roll01_type=skill}}";

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
    
    const handleInput = (msg) => {
        /* args = [
            0 => !performsurgery,
            1 => selected token or character name,
            2 => 1|0 (perform risky rurgery),
            3 => DC of check,
            4 => Player to heal
        ]
        */
        if(msg.type == "api") {
            var args = msg.content.split(",");
            switch(args[0].toLowerCase()) {
                case '!performsurgery':
                    if (args.length == 5) {
                        if (hasCharacterControl(msg.playerid, getChar(args[1]))) {
                            var charname = getChar(args[1]).get("name");
                            if (args[2] == 1)
                                performSurgery(charname, args[4]);
                            performHeal(charname, args[2], args[3], msg.playerid, args[4]);
                        }
                    } else {
                        sendChat("GM", "/w GM Incorrect number of parameters sent to '!performsurgery'");
                        return;
                    }
            }
        }
    };
    
    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };
    
    return {
        RegisterEventHandlers: registerEventHandlers
    };
}());


on('ready', () => {
    'use strict';
    RLRGaming.TreatWounds.RegisterEventHandlers();
});