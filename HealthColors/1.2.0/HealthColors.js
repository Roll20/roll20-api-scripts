/*
My Profile link: https://app.roll20.net/users/262130/dxwarlock
GIT link: https://github.com/dxwarlock/Roll20/blob/master/Public/HeathColors
Roll20Link: https://app.roll20.net/forum/post/4630083/script-aura-slash-tint-healthcolor
Last Updated 2/27/2017
*/
/*global createObj getAttrByName spawnFxWithDefinition getObj state playerIsGM sendChat _ findObjs log on*/
var HealthColors = HealthColors || (function() {
    'use strict';
    var version = '1.2.0',
        ScriptName = "HealthColors",
        schemaVersion = '1.0.3',
        Updated = "Feb 27 2017",
/*--------
ON TOKEN UPDATE
--------*/
        handleToken = function(obj, prev) {
            var ColorOn = state.HealthColors.auraColorOn;
            var bar = state.HealthColors.auraBar;
            var tint = state.HealthColors.auraTint;
            var onPerc = state.HealthColors.auraPerc;
            var dead = state.HealthColors.auraDead;
            if (obj.get("represents") !== "" || (obj.get("represents") == "" && state.HealthColors.OneOff == true)) {
                if (ColorOn !== true) return; //Check Toggle
//ATTRIBUTE CHECK------------
                var oCharacter = getObj('character', obj.get("_represents"));
                if (oCharacter !== undefined) {
    //SET BLOOD ATTRIB------------
                    if (getAttrByName(oCharacter.id, 'BLOODCOLOR') === undefined) CreateAttrib(oCharacter, 'BLOODCOLOR', 'DEFAULT');
                    var Blood = findObjs({name: 'BLOODCOLOR',_type: "attribute",characterid: oCharacter.id}, {caseInsensitive: true})[0];
                    var UseBlood = Blood.get("current");
                    UseBlood = UseBlood.toString().toUpperCase();
    //SET DISABLED AURA/TINT ATTRIB------------
                    if (getAttrByName(oCharacter.id, 'USECOLOR') === undefined) CreateAttrib(oCharacter, 'USECOLOR', 'YES');
                    var UseAuraAtt = findObjs({name: "USECOLOR",_type: "attribute",characterid: oCharacter.id}, {caseInsensitive: true})[0];
                    var UseAura = UseAuraAtt.get("current");
                    UseAura = UseAura.toString().toUpperCase();
    //DISABLE OR ENABLE AURA/TINT ON TOKEN------------
                    if (UseAura != "YES" && UseAura != "NO") {
                        UseAuraAtt.set('current', "YES");
                        var name = oCharacter.get('name');
                        GMW(name + ": USECOLOR NOT SET TO YES or NO, SETTING TO YES");
                    }
                    UseAura = UseAuraAtt.get("current").toUpperCase();
                    if (UseAura == "NO") return;
                }
//CHECK BARS------------
                if (obj.get(bar + "_max") === "" || obj.get(bar + "_value") === "") return;
                var maxValue = parseInt(obj.get(bar + "_max"), 10);
                var curValue = parseInt(obj.get(bar + "_value"), 10);
                var prevValue = prev[bar + "_value"];
                if (isNaN(maxValue) && isNaN(curValue)) return;
    //CALC PERCENTAGE------------
                var perc = Math.round((curValue / maxValue) * 100);
                var percReal = Math.min(100, perc);
    //PERCENTAGE OFF------------
                if (percReal > onPerc) {
                    SetAuraNone(obj);
                    return;
                }
    //SET DEAD------------
                if (curValue <= 0 && dead === true) {
                    obj.set("status_dead", true);
                    SetAuraNone(obj);
                    if (state.HealthColors.auraDeadFX !== "None") PlayDeath(state.HealthColors.auraDeadFX);
                    return;
                }
                else if (dead === true) obj.set("status_dead", false);
//CHECK MONSTER OR PLAYER------------
                var type = (oCharacter === undefined || oCharacter.get("controlledby") === "") ? 'Monster' : 'Player';
    //IF PLAYER------------
                var GM = '', PC = '';
                var markerColor = PercentToRGB(Math.min(100, percReal));
                var pColor = '#ffffff';
                if (type == 'Player') {
                    if (state.HealthColors.PCAura === false) return;
                    var cBy = oCharacter.get('controlledby');
                    var player = getObj('player', cBy);
                    pColor = '#000000';
                    if (player !== undefined) pColor = player.get('color');
                    GM = state.HealthColors.GM_PCNames;
                    if (GM != 'Off') {
                        GM = (GM == "Yes") ? true : false;
                        obj.set({'showname': GM});
                    }
                    PC = state.HealthColors.PCNames;
                    if (PC != 'Off') {
                        PC = (PC == "Yes") ? true : false;
                        obj.set({'showplayers_name': PC});
                    }

                }
    //IF MONSTER------------
                if (type == 'Monster') {
                    if (state.HealthColors.NPCAura === false) return;
                    GM = state.HealthColors.GM_NPCNames;
                    if (GM != 'Off') {
                        GM = (GM == "Yes") ? true : false;
                        obj.set({'showname': GM});
                    }
                    PC = state.HealthColors.NPCNames;
                    if (PC != 'Off') {
                        PC = (PC == "Yes") ? true : false;
                        obj.set({'showplayers_name': PC});
                    }
                }
//SET AURA|TINT------------
                if (tint === true) obj.set({'tint_color': markerColor,});
                else {
                    TokenSet(obj, state.HealthColors.AuraSize, markerColor, pColor);
                }
//SPURT FX------------
                if (state.HealthColors.FX == true && obj.get("layer") == "objects" && UseBlood !== "OFF") {
                    if (curValue == prevValue || prevValue == "") return;
                    var amount = Math.abs(curValue - prevValue);
                    var HitSizeCalc = Math.min((amount / maxValue) * 4, 1);
                    var HitSize = Math.max(HitSizeCalc, 0.2) * (_.random(60, 100) / 100);
                    var HealColor = HEXtoRGB(state.HealthColors.HealFX);
                    var HurtColor = HEXtoRGB(state.HealthColors.HurtFX);
                    if (UseBlood !== "DEFAULT") HurtColor = HEXtoRGB(UseBlood);
                    var size = obj.get("height");
                    var multi = size / 70;
                    var StartColor;
                    var EndColor;
                    var HITS;
                    if (curValue > prevValue && prevValue !== "") {
                        StartColor = HealColor;
                        EndColor = [255, 255, 255, 0];
                        HITS = Heal(HitSize, multi, StartColor, EndColor, size);
                    }
                    else {
                        StartColor = HurtColor;
                        EndColor = [0, 0, 0, 0];
                        HITS = Hurt(HitSize, multi, StartColor, EndColor, size);
                    }
                    spawnFxWithDefinition(obj.get("left"), obj.get("top"), HITS, obj.get("_pageid"));
                }
            }
        },
/*--------
CHAT MESSAGES
 --------*/
        handleInput = function(msg) {
            var msgFormula = msg.content.split(/\s+/);
            var command = msgFormula[0].toUpperCase();
            if (msg.type == "api" && command.indexOf("!AURA") !== -1) {
                if (!playerIsGM(msg.playerid)) {
                    sendChat('HealthColors', "/w " + msg.who + " you must be a GM to use this command!");
                    return;
                }
                else {
                    var option = msgFormula[1];
                    if (option === undefined) {
                        aurahelp();
                        return;
                    }
                    switch (msgFormula[1].toUpperCase()) {
                        case "ON":
                            state.HealthColors.auraColorOn = !state.HealthColors.auraColorOn;
                            aurahelp();
                            break;
                        case "BAR":
                            state.HealthColors.auraBar = "bar" + msgFormula[2];
                            aurahelp();
                            break;
                        case "TINT":
                            state.HealthColors.auraTint = !state.HealthColors.auraTint;
                            aurahelp();
                            break;
                        case "PERC":
                            state.HealthColors.auraPerc = parseInt(msgFormula[2], 10);
                            aurahelp();
                            break;
                        case "PC":
                            state.HealthColors.PCAura = !state.HealthColors.PCAura;
                            aurahelp();
                            break;
                        case "NPC":
                            state.HealthColors.NPCAura = !state.HealthColors.NPCAura;
                            aurahelp();
                            break;
                        case "GMNPC":
                            state.HealthColors.GM_NPCNames = msgFormula[2];
                            aurahelp();
                            break;
                        case "GMPC":
                            state.HealthColors.GM_PCNames = msgFormula[2];
                            aurahelp();
                            break;
                        case "PCNPC":
                            state.HealthColors.NPCNames = msgFormula[2];
                            aurahelp();
                            break;
                        case "PCPC":
                            state.HealthColors.PCNames = msgFormula[2];
                            aurahelp();
                            break;
                        case "DEAD":
                            state.HealthColors.auraDead = !state.HealthColors.auraDead;
                            aurahelp();
                            break;
                        case "DEADFX":
                            state.HealthColors.auraDeadFX = msgFormula[2];
                            aurahelp();
                            break;
                        case "SIZE":
                            state.HealthColors.AuraSize = parseFloat(msgFormula[2]);
                            aurahelp();
                            break;
                        case "ONEOFF":
                            state.HealthColors.OneOff = !state.HealthColors.OneOff;
                            aurahelp();
                            break;
                        case "FX":
                            state.HealthColors.FX = !state.HealthColors.FX;
                            aurahelp();
                            break;
                        case "HEAL":
                            var UPPER = msgFormula[2];
                            UPPER = UPPER.toUpperCase();
                            state.HealthColors.HealFX = UPPER;
                            aurahelp();
                            break;
                        case "HURT":
                            var UPPER = msgFormula[2];
                            UPPER = UPPER.toUpperCase();
                            state.HealthColors.HurtFX = UPPER;
                            aurahelp();
                            break;
                        default:
                            return;
                    }
                }
            }
        },
/*--------
FUNCTIONS
--------*/
    //HURT FX----------
        Hurt = function(HitSize, multi, StartColor, EndColor, size) {
            var FX = {
                "maxParticles": 150,
                "duration": 70 * HitSize,
                "size": size / 10 * HitSize,
                "sizeRandom": 3,
                "lifeSpan": 25,
                "lifeSpanRandom": 5,
                "speed": multi * 8,
                "speedRandom": multi * 3,
                "gravity": {
                    "x": multi * 0.01,
                    "y": multi * 0.65
                },
                "angle": 270,
                "angleRandom": 25,
                "emissionRate": 100 * HitSize,
                "startColour": StartColor,
                "endColour": EndColor,
            };
            return FX;
        },
    //HEAL FX----------
        Heal = function(HitSize, multi, StartColor, EndColor, size) {
            var FX = {
                "maxParticles": 150,
                "duration": 50 * HitSize,
                "size": size / 10 * HitSize,
                "sizeRandom": 15 * HitSize,
                "lifeSpan": multi * 50,
                "lifeSpanRandom": 30,
                "speed": multi * 0.5,
                "speedRandom": multi / 2 * 1.1,
                "angle": 0,
                "angleRandom": 180,
                "emissionRate": 1000,
                "startColour": StartColor,
                "endColour": EndColor,
            };
            return FX;
        },
    //WHISPER GM------------
        GMW = function(text) {
            sendChat('HealthColors', "/w GM <br><b> " + text + "</b>");
        },
    //DEATH SOUND------------
        PlayDeath = function(trackname) {
            var track = findObjs({type: 'jukeboxtrack',title: trackname})[0];
            if (track) {
                track.set('playing', false);
                track.set('softstop', false);
                track.set('volume', 50);
                track.set('playing', true);
            }
            else {
                log("No track found");
            }
        },
    //CREATE USECOLOR ATTR------------
        CreateAttrib = function(oCharacter, attrib, value) {
            log("Creating "+ attrib);
            createObj("attribute", {name: attrib,current: value,characterid: oCharacter.id});
        },
    //SET TOKEN COLORS------------
        TokenSet = function(obj, sizeSet, markerColor, pColor) {
            var Pageon = getObj("page", obj.get("_pageid"));
            var scale = Pageon.get("scale_number") / 10;
            obj.set({
                'aura1_radius': sizeSet * scale * 1.8,
                'aura2_radius': sizeSet * scale * 0.1,
                'aura1_color': markerColor,
                'aura2_color': pColor,
                'showplayers_aura1': true,
                'showplayers_aura2': true,
            });
        },
    //HELP MENU------------
        aurahelp = function() {
            var img = "background-image: -webkit-linear-gradient(-45deg, #a7c7dc 0%,#85b2d3 100%);";
            var tshadow = "-1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000 , 2px 2px #222;";
            var style = 'style="padding-top: 1px; text-align:center; font-size: 9pt; width: 45px; height: 14px; border: 1px solid black; margin: 1px; background-color: #6FAEC7;border-radius: 4px;  box-shadow: 1px 1px 1px #707070;';
            var off = "#A84D4D";
            var disable = "#D6D6D6";
            var HR = "<hr style='background-color: #000000; margin: 5px; border-width:0;color: #000000;height: 1px;'/>";
            var FX = state.HealthColors.auraDeadFX.substring(0, 4);
            sendChat('HealthColors', "/w GM <b><br>" + '<div style="border-radius: 8px 8px 8px 8px; padding: 5px; font-size: 9pt; text-shadow: ' + tshadow + '; box-shadow: 3px 3px 1px #707070; '+img+' color:#FFF; border:2px solid black; text-align:right; vertical-align:middle;">' + '<u>HealthColors Version: ' + version + '</u><br>' + //--
                HR + //--
                'Is On: <a ' + style + 'background-color:' + (state.HealthColors.auraColorOn !== true ? off : "") + ';" href="!aura on">' + (state.HealthColors.auraColorOn !== true ? "No" : "Yes") + '</a><br>' + //--
                'Bar: <a ' + style + '" href="!aura bar ?{Bar|1|2|3}">' + state.HealthColors.auraBar + '</a><br>' + //--
                'Use Tint: <a ' + style + 'background-color:' + (state.HealthColors.auraTint !== true ? off : "") + ';" href="!aura tint">' + (state.HealthColors.auraTint !== true ? "No" : "Yes") + '</a><br>' + //--
                'Percentage: <a ' + style + '" href="!aura perc ?{Percent?|100}">' + state.HealthColors.auraPerc + '</a><br>' + //--
                'Show on PC: <a ' + style + 'background-color:' + (state.HealthColors.PCAura !== true ? off : "") + ';" href="!aura pc">' + (state.HealthColors.PCAura !== true ? "No" : "Yes") + '</a><br>' + //--
                'Show on NPC: <a ' + style + 'background-color:' + (state.HealthColors.NPCAura !== true ? off : "") + ';" href="!aura npc">' + (state.HealthColors.NPCAura !== true ? "No" : "Yes") + '</a><br>' + //--
                'Show Dead: <a ' + style + 'background-color:' + (state.HealthColors.auraDead !== true ? off : "") + ';" href="!aura dead">' + (state.HealthColors.auraDead !== true ? "No" : "Yes") + '</a><br>' + //--
                'DeathSFX: <a ' + style + '" href="!aura deadfx ?{Sound Name?|None}">' + FX + '</a><br>' + //--
                HR + //--
                'GM Sees all NPC Names: <a ' + style + 'background-color:' + ButtonColor(state.HealthColors.GM_NPCNames, off, disable) + ';" href="!aura gmnpc ?{Setting|Yes|No|Off}">' + state.HealthColors.GM_NPCNames + '</a><br>' + //---
                'GM Sees all PC Names: <a ' + style + 'background-color:' + ButtonColor(state.HealthColors.GM_PCNames, off, disable) + ';" href="!aura gmpc ?{Setting|Yes|No|Off}">' + state.HealthColors.GM_PCNames + '</a><br>' + //--
                HR + //--
                'PC Sees all NPC Names: <a ' + style + 'background-color:' + ButtonColor(state.HealthColors.NPCNames, off, disable) + ';" href="!aura pcnpc ?{Setting|Yes|No|Off}">' + state.HealthColors.NPCNames + '</a><br>' + //--
                'PC Sees all PC Names: <a ' + style + 'background-color:' + ButtonColor(state.HealthColors.PCNames, off, disable) + ';" href="!aura pcpc ?{Setting|Yes|No|Off}">' + state.HealthColors.PCNames + '</a><br>' + //--
                HR + //--
                'Aura Size: <a ' + style + '" href="!aura size ?{Size?|0.7}">' + state.HealthColors.AuraSize + '</a><br>' + //--
                'One Offs: <a ' + style + 'background-color:' + (state.HealthColors.OneOff !== true ? off : "") + ';" href="!aura ONEOFF">' + (state.HealthColors.OneOff !== true ? "No" : "Yes") + '</a><br>' + //--
                'FX: <a ' + style + 'background-color:' + (state.HealthColors.FX !== true ? off : "") + ';" href="!aura FX">' + (state.HealthColors.FX !== true ? "No" : "Yes") + '</a><br>' + //--
                'HealFX Color: <a ' + style + 'background-color:#' + state.HealthColors.HealFX + ';""href="!aura HEAL ?{Color?|00FF00}">' + state.HealthColors.HealFX + '</a><br>' + //--
                'HurtFX Color: <a ' + style + 'background-color:#' + state.HealthColors.HurtFX + ';""href="!aura HURT ?{Color?|FF0000}">' + state.HealthColors.HurtFX + '</a><br>' + //--
                HR + //--
                '</div>');
        },
    //OFF BUTTON COLORS------------
        ButtonColor = function(state, off, disable) {
            var color;
            if (state == "No") color = off;
            if (state == "Off") color = disable;
            return color;
        },
    //REMOVE ALL------------
        SetAuraNone = function(obj) {
            var tint = state.HealthColors.auraTint;
            if (tint === true) {
                obj.set({'tint_color': "transparent",});
            }
            else {
                obj.set({
                    'aura1_color': "",
                    'aura2_color': "",
                });
            }
        },
    //PERC TO RGB------------
        PercentToRGB = function(percent) {
            if (percent === 100) percent = 99;
            var r, g, b;
            if (percent < 50) {
                g = Math.floor(255 * (percent / 50));
                r = 255;
            }
            else {
                g = 255;
                r = Math.floor(255 * ((50 - percent % 50) / 50));
            }
            b = 0;
            var Gradient = rgbToHex(r, g, b);
            return Gradient;
        },
    //RGB TO HEX------------
        rgbToHex = function(r, g, b) {
            var Color = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            return Color;
        },
    //HEX TO RGB------------
        HEXtoRGB = function(hex) {
            let parts = hex.match(/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
            if (parts) {
                let rgb = _.chain(parts)
                    .rest()
                    .map((d) => parseInt(d, 16))
                    .value();
                rgb.push(1.0);
                return rgb;
            }
            return [0, 0, 0, 1.0];
        },
    //CHECK INSTALL & SET STATE------------
        checkInstall = function() {
            log('<' + ScriptName + ' v' + version + ' Ready [Updated: '+ Updated+']>');
            if (!_.has(state, 'HealthColors') || state.HealthColors.schemaVersion !== schemaVersion) {
                log('<' + ScriptName + ' Updating Schema to v' + schemaVersion + '>');
                state.HealthColors = {
                    schemaVersion: schemaVersion
                };
                state.HealthColors.version = version;
            }
            if (_.isUndefined(state.HealthColors.auraColorOn)) state.HealthColors.auraColorOn = true; //global on or off
            if (_.isUndefined(state.HealthColors.auraBar)) state.HealthColors.auraBar = "bar1"; //bar to use
            if (_.isUndefined(state.HealthColors.PCAura)) state.HealthColors.PCAura = true; //show players Health?
            if (_.isUndefined(state.HealthColors.NPCAura)) state.HealthColors.NPCAura = true; //show NPC Health?
            if (_.isUndefined(state.HealthColors.auraTint)) state.HealthColors.auraTint = false; //use tint instead?
            if (_.isUndefined(state.HealthColors.auraPerc)) state.HealthColors.auraPerc = 100; //precent to start showing
            if (_.isUndefined(state.HealthColors.auraDead)) state.HealthColors.auraDead = true; //show dead X status
            if (_.isUndefined(state.HealthColors.auraDeadFX)) state.HealthColors.auraDeadFX = 'None'; //Sound FX Name
            if (_.isUndefined(state.HealthColors.GM_NPCNames)) state.HealthColors.GM_NPCNames = "Yes"; //show GM NPC names?
            if (_.isUndefined(state.HealthColors.NPCNames)) state.HealthColors.NPCNames = "Yes"; //show players NPC Names?
            if (_.isUndefined(state.HealthColors.GM_PCNames)) state.HealthColors.GM_PCNames = "Yes"; //show GM PC names?
            if (_.isUndefined(state.HealthColors.PCNames)) state.HealthColors.PCNames = "Yes"; //show players PC Names?
            if (_.isUndefined(state.HealthColors.AuraSize)) state.HealthColors.AuraSize = 0.7; //set aura size?
            if (_.isUndefined(state.HealthColors.FX)) state.HealthColors.FX = true; //set FX ON/OFF?
            if (_.isUndefined(state.HealthColors.HealFX)) state.HealthColors.HealFX = "00FF00"; //set FX HEAL COLOR
            if (_.isUndefined(state.HealthColors.HurtFX)) state.HealthColors.HurtFX = "FF0000"; //set FX HURT COLOR?
        },
        registerEventHandlers = function() {
            on('chat:message', handleInput);
            on("change:token", handleToken);
        };
/*-------------
RETURN OUTSIDE FUNCTIONS
-----------*/
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());
//On Ready
on('ready', function() {
    'use strict';
    HealthColors.CheckInstall();
    HealthColors.RegisterEventHandlers();
});