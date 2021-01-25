/*
PF2E Treat Wounds Check

Version     1.0
Author:     Mark Stoecker
Roll20:     https://app.roll20.net/users/580967/mark-s
BitBucket:  https://bitbucket.org/desertwebdesigns/roll20/src/master/TreatWounds/

*/
// Future versions:
// Send error message back to chat on failure
// rename args array in handleInput for ease of use
// Setup proper installer and allow for default settings and simpler command call with defaults
// Allow for generic tokens that don't represent a character (requires sending healing modifier with api call)
// Check for Risky Surgery Feat before prompting
// Check for Proficiency and build option list from there
// Above two options require sending API Buttons back to user when calling API. User will call script and API will send back a button with the appropriate user prompts depending on character sheet (ie, don't prompt for Risky Surgery if user does not have it in feats, don't allow Master/Legendary difficulty if user is only Expert, etc)
// Heal multiple targets with Ward Medic

var RLRGaming = RLRGaming || {};

RLRGaming.TreatWounds = RLRGaming.TreatWounds || (() => {
    'use strict';
    
    const version = "1.0";
    
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
    
    const performSurgery = async (character, target) => {
        sendChat(character, "/em performs some risky surgery on " + target + " and deals [[1d8]] points of damage");
        return;
    };



    const performHeal = async (character, surgery, DC, player, target) => {
        if (surgery == "1") {
            var surgeryMod = 2;
            var riskySurgery = " + 2[Risky Surgery]";
        } else {
            var surgeryMod = 0;
            var riskySurgery = '';
        };
        
        var medCheck = await new Promise((resolve,reject) => {
            sendChat(character, "/roll 1d20 + @{" + character + "|medicine} + " + surgeryMod, (ops) => {
                resolve(JSON.parse(ops[0].content));
            });
        });

        var dieresult = medCheck.rolls[0].results[0].v;
        var medTotal = medCheck.total;
        var medResult = '';

        var checkDC = DC.replace( /^\D+/g, '');
        switch (medTotal >= Number(checkDC)) {
            case true:
                if (
                    (
                        medTotal >= Number(checkDC) + 10 &&
                        dieresult != 1
                    ) ||
                    dieresult == 20
                ) {
                    medResult = 'cs';
                } else if (
                    dieresult == 1 &&
                    medTotal < Number(checkDC) + 10
                ) {
                    medResult = 'f';
                } else {
                    medResult = 's';
                }
                break;
            case false:
                if (
                    (
                        medTotal <= Number(checkDC) - 10 &&
                        dieresult != 20
                    ) ||
                    dieresult == 1
                ) {
                    medResult = 'cf';
                } else if (
                    dieresult == 20 &&
                    medTotal > Number(checkDC) - 10
                ) {
                    medResult = 's';
                } else {
                    medResult = 'f';
                }
                break;
        }

        var critmsg = '';
        switch (medResult) {
            case 'cs':
                critmsg = "<br>Critical Success!";
                break;
            case 'cf':
                critmsg = "<br>Critical Failure!";
                break;
            case 's':
                if (surgery == "1") {
                    medResult = 'cs';
                    critmsg = "<br>Critical Success<br>due to Risky Surgery!";
                }
                break;
        }
        
        if (medTotal >= checkDC) {
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
        
        var healmsg = "&{template:rolls} {{charactername=" + character + "}} {{header=Treat Wounds Check}} {{subheader=Skill}} {{roll01=[[(" + dieresult + ") " + riskySurgery + " + [@{" + character + "|medicine_proficiency_display}] (@{" + character + "|medicine})[@{" + character + "|text_modifier}] + (@{" + character + "|query_roll_bonus})[@{" + character + "|text_bonus}]]]}} {{roll01_type=skill}}";

        
        if (medResult == 'cs' || medResult == 'cf') {
            healmsg += "{{roll01_info=" + critmsg + "}} ";
        }
        
        if (heal) {
            var healRollString = '';
            
            var healResult = await new Promise((resolve,reject) => {
                sendChat(character, "/roll 2d8 + " + healmod, (ops) => {
                    resolve(JSON.parse(ops[0].content));
                });
            });
            
            _.each(healResult.rolls[0].results, (die) => {
                healRollString += "(" + die.v + ")+";
            });

            healRollString += healmod;
            
            if (medResult == 'cs') {
                healRollString = "(" + healRollString + ") * 2";
            }
            
            healmsg += "{{roll02=[[" + healRollString + "]]}} {{roll02_type=heal}} {{roll02_info=HP Healed}} {{roll02_misc=hp healed}} ";
        }
        
        healmsg += "{{roll01misc=" + DC + "}} {{notes_show=@{" + character + "|roll_show_notes}}} {{notes=@{" + character + "|medicine_notes}}}";
        
        sendChat("player|" + player, healmsg);
        
        if (medResult == 'cf') {
            sendChat(character, "/em causes [[1d8]] points of damage to " + target + " due to their carelessness");
        }
    };
    
    const handleInput = async (msg) => {
        /* args = [
            0 => !treatwounds,
            1 => selected token or character name,
            2 => 1|0 (perform risky rurgery),
            3 => DC of check,
            4 => Player to heal
        ]
        */
        if(msg.type == "api") {
            var args = msg.content.split(",");
            switch(args[0].toLowerCase()) {
                case '!treatwounds':
                    if (args.length == 5) {
                        if (hasCharacterControl(msg.playerid, getChar(args[1]))) {
                            var charname = getChar(args[1]).get("name");
                            if (args[2] == 1)
                                performSurgery(charname, args[4]);
                            performHeal(charname, args[2], args[3], msg.playerid, args[4]);
                        }
                    } else {
                        sendChat("GM", "/w GM Incorrect number of parameters sent to '!treatwounds'");
                        return;
                    }
                    break;
            }
        }
    };
    
    const registerEventHandlers = async () => {
        on('chat:message', handleInput);
    };
    
    return {
        RegisterEventHandlers: registerEventHandlers
    };
})();


on('ready', async () => {
    'use strict';
    RLRGaming.TreatWounds.RegisterEventHandlers();
});
