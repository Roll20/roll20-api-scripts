/* global createObj TokenMod spawnFxWithDefinition getObj state playerIsGM sendChat _ findObjs log on*/
/*
My Profile link: https://app.roll20.net/users/262130/dxwarlock
GIT link: https://github.com/dxwarlock/Roll20/blob/master/Public/HeathColors
Roll20Link: https://app.roll20.net/forum/post/4630083/script-aura-slash-tint-healthcolor
*/
/*jshint bitwise: false*/
var HealthColors = HealthColors || (function () {
    'use strict';
    var version = '1.6.0',
        ScriptName = "HealthColors",
        schemaVersion = '1.0.3',
        Updated = "Feb 12 2019",
/*------------------------
ON TOKEN CHANGE/CREATE
------------------------*/
        handleToken = function (obj, prev, update) {
            //CHECK IF TRIGGERED------------
            if(state.HealthColors.auraColorOn !== true || obj.get("layer") !== "objects") return;
            if(obj.get("represents") !== "" || (obj.get("represents") === "" && state.HealthColors.OneOff === true)) {
    //**CHECK BARS------------//
                var barUsed = state.HealthColors.auraBar;
                var maxValue, curValue, prevValue;
                if(obj.get(barUsed + "_max") !== "" || obj.get(barUsed + "_value") !== "") {
                    maxValue = parseInt(obj.get(barUsed + "_max"), 10);
                    curValue = parseInt(obj.get(barUsed + "_value"), 10);
                    prevValue = prev[barUsed + "_value"];
                }
                if(isNaN(maxValue) || isNaN(curValue) || isNaN(prevValue)) return;
            //CALC PERCENTAGE------------
                var percReal = Math.round((curValue / maxValue) * 100);
                var markerColor = PercentToHEX(percReal);
            //DEFINE VARIABLES---
                var pColor = '#ffffff';
                var GM = '',PC = '';
                var IsTypeOn, PercentOn, ShowDead, UseAura;
        //**CHECK MONSTER OR PLAYER------------//
                var oCharacter = getObj('character', obj.get("_represents"));
                var type = (oCharacter === undefined || oCharacter.get("controlledby") === "") ? 'Monster' : 'Player';
                var colortype = (state.HealthColors.auraTint) ? 'tint' : 'aura1';
            //IF PLAYER------------
                if(type == 'Player') {
                    GM = state.HealthColors.GM_PCNames;
                    PC = state.HealthColors.PCNames;
                    IsTypeOn =state.HealthColors.PCAura;
                    PercentOn = state.HealthColors.auraPercPC;
                    ShowDead = state.HealthColors.auraDeadPC;
                    var cBy = oCharacter.get('controlledby');
                    var player = getObj('player', cBy);
                    pColor = '#000000';
                    if(player !== undefined) pColor = player.get('color');
                }
            //IF MONSTER------------
                else if(type == 'Monster') {
                    GM = state.HealthColors.GM_NPCNames;
                    PC = state.HealthColors.NPCNames;
                    IsTypeOn =state.HealthColors.NPCAura;
                    PercentOn = state.HealthColors.auraPerc;
                    ShowDead = state.HealthColors.auraDead;
                }
                else return;
        //CHECK DISABLED AURA/TINT ATTRIB------------
                if(oCharacter !== undefined) {
                    UseAura = lookupUseColor(oCharacter);
                }
            //SET HEALTH COLOR----------
                if(IsTypeOn && UseAura !== "NO") {
                    percReal = Math.min(percReal, 100);
                    if(percReal > PercentOn || curValue === 0) SetAuraNone(obj);
                    else TokenSet(obj, state.HealthColors.AuraSize, markerColor, pColor, update);
            //SHOW DEAD----------
                    if(ShowDead === true) {
                        if(curValue > 0) obj.set("status_dead", false);
                        else if(curValue < 1) {
                            var DeadSounds = state.HealthColors.auraDeadFX;
                            if(DeadSounds !== "None" && curValue != prevValue) PlayDeath(DeadSounds);
                            obj.set("status_dead", true);
                            SetAuraNone(obj);
                        }
                    }
                }
                else if((!IsTypeOn || UseAura === "NO") && obj.get(colortype + '_color') === markerColor) SetAuraNone(obj);
        //SET SHOW NAMES------------
                SetShowNames(GM,PC,obj);
//**SPURT FX------------//
                if(curValue != prevValue && prevValue != "" && update !== "YES") {
        //CHECK BLOOD ATTRIB------------
                    var UseBlood;
                    if(oCharacter !== undefined) {
                        UseBlood = lookupUseBlood(oCharacter);
                    }
                    if(state.HealthColors.FX === true && obj.get("layer") == "objects" && (UseBlood !== "OFF" || UseBlood !== "NO")) {
                        var HurtColor, HealColor, FX, aFX, FXArray = [];
                        var amount = Math.abs(curValue - prevValue);
                        var HitSizeCalc = Math.min((amount / maxValue) * 4, 1);
                        var Scale = obj.get("height") / 70;
                        var HitSize = Math.max(HitSizeCalc, 0.2) * (_.random(60, 100) / 100);
            //IF HEALED------------
                        if(curValue > prevValue) {
                            aFX = findObjs({_type: "custfx",name: '-DefaultHeal'}, {caseInsensitive: true})[0];
                            FX = aFX.get("definition");
                            HealColor = HEXtoRGB(state.HealthColors.HealFX);
                            FX.startColour = HealColor;
                            FXArray.push(FX);
                        }
            //IF HURT------------
                        else if(curValue < prevValue) {
                            aFX = findObjs({_type: "custfx",name: '-DefaultHurt'}, {caseInsensitive: true})[0];
                            if(aFX) FX = aFX.get("definition");
                    //CHECK DEFAULT COLOR--
                            if(UseBlood === "DEFAULT" || UseBlood === undefined) {
                                HurtColor = HEXtoRGB(state.HealthColors.HurtFX);
                                FX.startColour = HurtColor;
                                FXArray.push(FX);
                            }
                    //ELSE CHECK CUSTOM COLOR/FX--
                            else if(UseBlood !== "DEFAULT" && UseBlood !== undefined) {
                                HurtColor = HEXtoRGB(UseBlood);
                        //IF CUSTOM COLOR--
                                if(_.difference(HurtColor, [0, 0, 0, 0]).length !== 0) {
                                    FX.startColour = HurtColor;
                                    FXArray.push(FX);
                                    }
                        //ELSE ASSUME CUSTOM FX--
                                else {
                                    var i = UseBlood.split(/,/);
                                    _.each(i, function (FXname) {
                                        aFX = findObjs({_type: "custfx",name: FXname}, {caseInsensitive: true})[0];
                                        if(aFX) FXArray.push(aFX.get("definition"));
                                        else GMW("No FX with name " + FXname);
                                    });
                                }
                            }
                        }
                        else return;
            //SPAWN FX------------
                        _.each(FXArray, function (FX) {
                            SpawnFX(Scale, HitSize, obj.get("left"), obj.get("top"), FX, obj.get("_pageid"));
                        });
                    }
                }
            }
        },
    /*------------------------
    CHAT MESSAGES
    ------------------------*/
        handleInput = function (msg) {
            var msgFormula = msg.content.split(/\s+/);
            var command = msgFormula[0].toUpperCase(), UPPER ="";
            if(msg.type == "api" && command.indexOf("!AURA") !== -1) {
                var OPTION = msgFormula[1] || "MENU";
                if(!playerIsGM(msg.playerid)) {
                    sendChat('HealthColors', "/w " + msg.who + " you must be a GM to use this command!");
                    return;
                }
                else {
                    if(OPTION !== "MENU") GMW("UPDATING TOKENS...");
                    switch(OPTION.toUpperCase()) {
                    case "MENU":
                        break;
                    case "ON":
                        state.HealthColors.auraColorOn = !state.HealthColors.auraColorOn;
                        break;
                    case "BAR":
                        state.HealthColors.auraBar = "bar" + msgFormula[2];
                        break;
                    case "TINT":
                        state.HealthColors.auraTint = !state.HealthColors.auraTint;
                        break;
                    case "PERC":
                        state.HealthColors.auraPercPC = parseInt(msgFormula[2], 10);
                        state.HealthColors.auraPerc = parseInt(msgFormula[3], 10);
                        break;
                    case "PC":
                        state.HealthColors.PCAura = !state.HealthColors.PCAura;
                        break;
                    case "NPC":
                        state.HealthColors.NPCAura = !state.HealthColors.NPCAura;
                        break;
                    case "GMNPC":
                        state.HealthColors.GM_NPCNames = msgFormula[2];
                        break;
                    case "GMPC":
                        state.HealthColors.GM_PCNames = msgFormula[2];
                        break;
                    case "PCNPC":
                        state.HealthColors.NPCNames = msgFormula[2];
                        break;
                    case "PCPC":
                        state.HealthColors.PCNames = msgFormula[2];
                        break;
                    case "DEAD":
                        state.HealthColors.auraDead = !state.HealthColors.auraDead;
                        break;
                    case "DEADPC":
                        state.HealthColors.auraDeadPC = !state.HealthColors.auraDeadPC;
                        break;
                    case "DEADFX":
                        state.HealthColors.auraDeadFX = msgFormula[2];
                        break;
                    case "SIZE":
                        state.HealthColors.AuraSize = parseFloat(msgFormula[2]);
                        break;
                    case "ONEOFF":
                        state.HealthColors.OneOff = !state.HealthColors.OneOff;
                        break;
                    case "FX":
                        state.HealthColors.FX = !state.HealthColors.FX;
                        break;
                    case "HEAL":
                        UPPER = msgFormula[2];
                        UPPER = UPPER.toUpperCase();
                        state.HealthColors.HealFX = UPPER;
                        break;
                    case "HURT":
                        UPPER = msgFormula[2];
                        UPPER = UPPER.toUpperCase();
                        state.HealthColors.HurtFX = UPPER;
                        break;
                    case "RESET":
                        delete state.HealthColors;
                        GMW("STATE RESET");
                        checkInstall();
                        break;
                    case "UPDATE":
                        manUpdate(msg);
                        return;
                    }
                    aurahelp(OPTION);
                }
            }
        },
/*------------------------
"FUNCTIONS"
------------------------*/
    //SET TOKEN COLORS------------
        TokenSet = function (obj, sizeSet, markerColor, pColor, update) {
            var Pageon = getObj("page", obj.get("_pageid"));
            var scale = Pageon.get("scale_number") / 10;
            if(state.HealthColors.auraTint === true) {
                if(obj.get('aura1_color') == markerColor && update === "YES") {
                    obj.set({'aura1_color': "transparent",'aura2_color': "transparent",});
                }
                obj.set({'tint_color': markerColor,});
            }
            else {
                if(obj.get('tint_color') == markerColor && update === "YES") {
                    obj.set({'tint_color': "transparent",});
                }
                obj.set({
                    'aura1_radius': sizeSet * scale * 1.8,
                    'aura2_radius': sizeSet * scale * 0.1,
                    'aura1_color': markerColor,
                    'aura2_color': pColor,
                    'showplayers_aura1': true,
                    'showplayers_aura2': true,
                });
            }
        },
    //REMOVE ALL------------
        SetAuraNone = function (obj) {
            if(state.HealthColors.auraTint === true) obj.set({'tint_color': "transparent",});
            else obj.set({'aura1_color': "transparent",'aura2_color': "transparent",});
        },
    //FORCE ALL TOKEN UPDATE------------
        MenuForceUpdate = function(){
            let i = 0;
            const start = new Date().getTime();
            const barUsed = state.HealthColors.auraBar;
            const workQueue = findObjs({type: 'graphic',subtype: 'token',layer: 'objects'})
            		.filter((o)=>o.get(barUsed + "_max") !== "" && o.get(barUsed + "_value") !== "");
            const drainQueue = ()=>{
                let t = workQueue.shift();
                if(t){
                    const prev = JSON.parse(JSON.stringify(t));
                    handleToken( t, prev, 'YES');
                    setTimeout(drainQueue,0);
                } else {
                    sendChat('Fixing Tokens',`/w gm Finished Fixing Tokens`);
                }
            };
            sendChat('Fixing Tokens',`/w gm Fixing ${workQueue.length} Tokens`);
            drainQueue();
            var end = new Date().getTime();
            return "Tokens Processed: " + workQueue.length + "<br>Run time in ms: " + (end - start);
        },
        SetShowNames = function(GM,PC,obj) {
            if(GM != 'Off' && GM != '') {
                GM = (GM == "Yes") ? true : false;
                obj.set({'showname': GM});
            }
            if(PC != 'Off' && PC != '') {
                PC = (PC == "Yes") ? true : false;
                obj.set({'showplayers_name': PC});
            }
        },
    //MANUAL UPDATE------------
        manUpdate = function(msg){
            var selected = msg.selected;
            var allNames = '';
            _.each(selected, function(obj) {
                var token = getObj('graphic', obj._id);
                var tName = token.get("name");
                allNames = allNames.concat(tName+'<br>');
                var prev = JSON.parse(JSON.stringify(token));
                handleToken(token, prev, "YES");
            });
            GMW(allNames);
        },
    //ATTRIBUTE CACHE------------
        makeSmartAttrCache = function (attribute, options) {
            let cache = {},
               defaultValue = options.default || 'YES',
               validator = options.validation || _.constant(true);
            on('change:attribute', function (attr) {
               if(attr.get('name') === attribute) {
                   if(!validator(attr.get('current'))) {
                       attr.set('current', defaultValue);
                   }
                   cache[attr.get('characterid')] = attr.get('current');
                   var tokens = findObjs({type: 'graphic'}).filter((o) => o.get('represents') === attr.get("characterid"));
                   _.each(tokens, function (obj) {
                       var prev = JSON.parse(JSON.stringify(obj));
                       handleToken(obj, prev, "YES");
                   });
               }
            });
            on('destroy:attribute', function (attr) {
               if(attr.get('name') === attribute) {
                   delete cache[attr.get('characterid')];
               }
            });
            return function(character){
                let attr = findObjs({type: 'attribute',name: attribute,characterid: character.id},{caseInsensitive:true})[0] ||
                createObj('attribute',{name: attribute,characterid: character.id, current: defaultValue});
                if(!cache[character.id] || cache[character.id] !== attr.get('current')){
                   if(!validator(attr.get('current'))){
                       attr.set('current',defaultValue);
                   }
                   cache[character.id]=attr.get('current');
                }
                return cache[character.id];
            };
        },
        lookupUseBlood = makeSmartAttrCache('USEBLOOD',{
            default: 'DEFAULT'
        }),
        lookupUseColor = makeSmartAttrCache('USECOLOR',{
            default: 'YES',
            validation: (o)=>o.match(/YES|NO/)
        }),
    //DEATH SOUND------------
        PlayDeath = function (trackname) {
          	var RandTrackName;
            if(trackname.indexOf(",") > 0) {
                var tracklist = trackname.split(",");
                RandTrackName = tracklist[Math.floor(Math.random() * tracklist.length)];
            }
            else RandTrackName = trackname;
            var track = findObjs({type: 'jukeboxtrack',title: RandTrackName})[0];
            if(track) {
                track.set('playing', false);
                track.set('softstop', false);
                track.set('volume', 50);
                track.set('playing', true);
            }
            else {
                log(ScriptName + ": No track found named " + RandTrackName);
            }
        },
    //PERC TO RGB------------
        PercentToHEX = function (percent) {
            var HEX;
            if(percent > 100) HEX = "#0000FF";
            else {
                if(percent === 100) percent = 99;
                var r, g, b = 0;
                if(percent < 50) {
                    g = Math.floor(255 * (percent / 50));
                    r = 255;
                }
                else {
                    g = 255;
                    r = Math.floor(255 * ((50 - percent % 50) / 50));
                }
                HEX = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            }
            return HEX;
        },
    //HEX TO RGB------------
        HEXtoRGB = function (hex) {
            let parts = (hex || '').match(/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
            if(parts) {
                let rgb = _.chain(parts).rest().map((d) => parseInt(d, 16)).value();
                rgb.push(1.0);
                return rgb;
            }
            return [0, 0, 0, 0.0];
        },
    //SPAWN FX------------
        SpawnFX = function (Scale,HitSize,left,top,FX,pageid) {
            _.defaults(FX, {
                "maxParticles": 100,
                "duration": 100,
                "size": 100,
                "sizeRandom": 100,
                "lifeSpan": 100,
                "lifeSpanRandom": 100,
                "speed": 0,
                "speedRandom": 0,
                "angle": 0,
                "angleRandom": 0,
                "emissionRate": 100,
                "startColour": [255,255,255,1],
                "endColour": [0,0,0,1],
                "gravity": {"x": 0,"y": 0.0},
            });
            var newFX = {
                "maxParticles": FX.maxParticles * HitSize,
                "duration": FX.duration * HitSize,
                "size": FX.size * Scale / 2,
                "sizeRandom": FX.sizeRandom * Scale / 2,
                "lifeSpan": FX.lifeSpan,
                "lifeSpanRandom": FX.lifeSpanRandom,
                "speed": FX.speed * Scale,
                "speedRandom": FX.speedRandom * Scale,
                "angle": FX.angle,
                "angleRandom": FX.angleRandom,
                "emissionRate": FX.emissionRate * HitSize * 2,
                "startColour": FX.startColour,
                "endColour": FX.endColour,
                "gravity": {"x": FX.gravity.x * Scale,"y": FX.gravity.y * Scale},
            };
            spawnFxWithDefinition(left,top,newFX,pageid);
        },
    //HELP MENU------------
        aurahelp = function (OPTION) {
            var Update = '';
            if(OPTION !== "MENU") Update = MenuForceUpdate();
            var img = "background-image: -webkit-linear-gradient(left, #76ADD6 0%, #a7c7dc 100%);";
            var tshadow = "-1px -1px #222, 1px -1px #222, -1px 1px #222, 1px 1px #222 , 2px 2px #222;";
            var style = 'style="padding-top: 1px; text-align:center; font-size: 9pt; width: 48px; height: 14px; border: 1px solid black; margin: 1px; background-color: #6FAEC7;border-radius: 4px;  box-shadow: 1px 1px 1px #707070;';
            var off = "#A84D4D";
            var disable = "#D6D6D6";
            var HR = "<hr style='background-color: #000000; margin: 5px; border-width:0;color: #000000;height: 1px;'/>";
            var FX = state.HealthColors.auraDeadFX.substring(0, 4);
            sendChat('HealthColors', "/w GM <b><br>" + '<div style="border-radius: 8px 8px 8px 8px; padding: 5px; font-size: 9pt; text-shadow: ' + tshadow + '; box-shadow: 3px 3px 1px #707070; ' + img + ' color:#FFF; border:2px solid black; text-align:right; vertical-align:middle;">' + '<u><big>HealthColors Version: ' + version + '</u></big><br>' + //--
                HR + //--
                'Is On: <a ' + style + 'background-color:' + (state.HealthColors.auraColorOn !== true ? off : "") + ';" href="!aura on">' + (state.HealthColors.auraColorOn !== true ? "No" : "Yes") + '</a><br>' + //--
                'Bar: <a ' + style + '" href="!aura bar ?{Bar|1|2|3}">' + state.HealthColors.auraBar + '</a><br>' + //--
                'Use Tint: <a ' + style + 'background-color:' + (state.HealthColors.auraTint !== true ? off : "") + ';" href="!aura tint">' + (state.HealthColors.auraTint !== true ? "No" : "Yes") + '</a><br>' + //--
                'Percentage(PC/NPC): <a ' + style + '" href="!aura perc ?{PCPercent?|100} ?{NPCPercent?|100}">' + state.HealthColors.auraPercPC + '/'+ state.HealthColors.auraPerc +'</a><br>' + //--
                HR + //--
                'Show PC Health: <a ' + style + 'background-color:' + (state.HealthColors.PCAura !== true ? off : "") + ';" href="!aura pc">' + (state.HealthColors.PCAura !== true ? "No" : "Yes") + '</a><br>' + //--
                'Show NPC Health: <a ' + style + 'background-color:' + (state.HealthColors.NPCAura !== true ? off : "") + ';" href="!aura npc">' + (state.HealthColors.NPCAura !== true ? "No" : "Yes") + '</a><br>' + //--
                'Show Dead PC: <a ' + style + 'background-color:' + (state.HealthColors.auraDeadPC !== true ? off : "") + ';" href="!aura deadPC">' + (state.HealthColors.auraDeadPC !== true ? "No" : "Yes") + '</a><br>' + //--
                'Show Dead NPC: <a ' + style + 'background-color:' + (state.HealthColors.auraDead !== true ? off : "") + ';" href="!aura dead">' + (state.HealthColors.auraDead !== true ? "No" : "Yes") + '</a><br>' + //--
                HR + //--
                'GM Sees all PC Names: <a ' + style + 'background-color:' + ButtonColor(state.HealthColors.GM_PCNames, off, disable) + ';" href="!aura gmpc ?{Setting|Yes|No|Off}">' + state.HealthColors.GM_PCNames + '</a><br>' + //--
                'GM Sees all NPC Names: <a ' + style + 'background-color:' + ButtonColor(state.HealthColors.GM_NPCNames, off, disable) + ';" href="!aura gmnpc ?{Setting|Yes|No|Off}">' + state.HealthColors.GM_NPCNames + '</a><br>' + //---
                HR + //--
                'PC Sees all PC Names: <a ' + style + 'background-color:' + ButtonColor(state.HealthColors.PCNames, off, disable) + ';" href="!aura pcpc ?{Setting|Yes|No|Off}">' + state.HealthColors.PCNames + '</a><br>' + //--
                'PC Sees all NPC Names: <a ' + style + 'background-color:' + ButtonColor(state.HealthColors.NPCNames, off, disable) + ';" href="!aura pcnpc ?{Setting|Yes|No|Off}">' + state.HealthColors.NPCNames + '</a><br>' + //--
                HR + //--
                'Aura Size: <a ' + style + '" href="!aura size ?{Size?|0.7}">' + state.HealthColors.AuraSize + '</a><br>' + //--
                'One Offs: <a ' + style + 'background-color:' + (state.HealthColors.OneOff !== true ? off : "") + ';" href="!aura ONEOFF">' + (state.HealthColors.OneOff !== true ? "No" : "Yes") + '</a><br>' + //--
                'FX: <a ' + style + 'background-color:' + (state.HealthColors.FX !== true ? off : "") + ';" href="!aura FX">' + (state.HealthColors.FX !== true ? "No" : "Yes") + '</a><br>' + //--
                'HealFX Color: <a ' + style + 'background-color:#' + state.HealthColors.HealFX + ';""href="!aura HEAL ?{Color?|00FF00}">' + state.HealthColors.HealFX + '</a><br>' + //--
                'HurtFX Color: <a ' + style + 'background-color:#' + state.HealthColors.HurtFX + ';""href="!aura HURT ?{Color?|FF0000}">' + state.HealthColors.HurtFX + '</a><br>' + //--
                'DeathSFX: <a ' + style + '" href="!aura deadfx ?{Sound Name?|' + state.HealthColors.auraDeadFX + '}">' + FX + '</a><br>' + //--
                HR + //--
                Update +//--
                '</div>');
        },
    //OFF BUTTON COLORS------------
        ButtonColor = function (state, off, disable) {
            var color;
            if(state == "No") color = off;
            if(state == "Off") color = disable;
            return color;
        },
    //CHECK INSTALL & SET STATE------------
        checkInstall = function () {
            log('-=>' + ScriptName + ' v' + version + ' [Updated: ' + Updated + ']<=-');
            if(!_.has(state, 'HealthColors') || state.HealthColors.schemaVersion !== schemaVersion) {
                log('<' + ScriptName + ' Updating Schema to v' + schemaVersion + '>');
                state.HealthColors = {schemaVersion: schemaVersion};
                state.HealthColors.version = version;
            }
            //CHECK STATE VALUES
            if(_.isUndefined(state.HealthColors.auraColorOn)) state.HealthColors.auraColorOn = true; //global on or off
            if(_.isUndefined(state.HealthColors.auraBar)) state.HealthColors.auraBar = "bar1"; //bar to use
            if(_.isUndefined(state.HealthColors.auraTint)) state.HealthColors.auraTint = false; //use tint instead?
            if(_.isUndefined(state.HealthColors.auraPercPC)) state.HealthColors.auraPercPC = 100; //precent to start showing PC
            if(_.isUndefined(state.HealthColors.auraPerc)) state.HealthColors.auraPerc = 100; //precent to start showing NPC
            //-----------------
            if(_.isUndefined(state.HealthColors.PCAura)) state.HealthColors.PCAura = true; //show players Health?
            if(_.isUndefined(state.HealthColors.NPCAura)) state.HealthColors.NPCAura = true; //show NPC Health?
            if(_.isUndefined(state.HealthColors.auraDeadPC)) state.HealthColors.auraDeadPC = true; //show dead X status PC
            if(_.isUndefined(state.HealthColors.auraDead)) state.HealthColors.auraDead = true; //show dead X status NPC
            //-----------------
            if(_.isUndefined(state.HealthColors.GM_PCNames)) state.HealthColors.GM_PCNames = "Yes"; //show GM PC names?
            if(_.isUndefined(state.HealthColors.PCNames)) state.HealthColors.PCNames = "Yes"; //show players PC Names?
            //-----------------
            if(_.isUndefined(state.HealthColors.GM_NPCNames)) state.HealthColors.GM_NPCNames = "Yes"; //show GM NPC names?
            if(_.isUndefined(state.HealthColors.NPCNames)) state.HealthColors.NPCNames = "Yes"; //show players NPC Names?
            //-----------------
            if(_.isUndefined(state.HealthColors.AuraSize)) state.HealthColors.AuraSize = 0.7; //set aura size?
            if(_.isUndefined(state.HealthColors.FX)) state.HealthColors.FX = true; //set FX ON/OFF?
            if(_.isUndefined(state.HealthColors.HealFX)) state.HealthColors.HealFX = "00FF00"; //set FX HEAL COLOR
            if(_.isUndefined(state.HealthColors.HurtFX)) state.HealthColors.HurtFX = "FF0000"; //set FX HURT COLOR?
            if(_.isUndefined(state.HealthColors.auraDeadFX)) state.HealthColors.auraDeadFX = 'None'; //Sound FX Name
            //TokenMod CHECK
            if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange) TokenMod.ObserveTokenChange(handleToken);
            var FXHurt = findObjs({_type: "custfx",name: "-DefaultHurt"}, {caseInsensitive: true})[0];
            var FXHeal = findObjs({_type: "custfx",name: "-DefaultHeal"}, {caseInsensitive: true})[0];
        //DEFAULT FX CHECK
            if(!FXHurt) {
                GMW("Creating Default Hurt FX");
                var Hurt = {
                    "maxParticles": 150,
                    "duration": 50,
                    "size": 10,
                    "sizeRandom": 3,
                    "lifeSpan": 25,
                    "lifeSpanRandom": 5,
                    "speed": 8,
                    "speedRandom": 3,
                    "gravity": {"x": 0.01,"y": 0.65},
                    "angle": 270,
                    "angleRandom": 25,
                    "emissionRate": 100,
                    "startColour": [0, 0, 0, 0],
                    "endColour": [0, 0, 0, 0],
                };
                createObj('custfx', {name: "-DefaultHurt",definition: Hurt});
            }
            if(!FXHeal) {
                GMW("Creating Default Heal FX");
                var Heal = {
                    "maxParticles": 150,
                    "duration": 50,
                    "size": 10,
                    "sizeRandom": 15,
                    "lifeSpan": 50,
                    "lifeSpanRandom": 30,
                    "speed": 0.5,
                    "speedRandom": 2,
                    "angle": 0,
                    "angleRandom": 180,
                    "emissionRate": 1000,
                    "startColour": [0, 0, 0, 0],
                    "endColour": [0, 0, 0, 0],
                };
                createObj('custfx', {name: "-DefaultHeal",definition: Heal});
            }
        },
    //WHISPER GM------------
        GMW = function (text) {
            var DIV = "<div style='width: 100%; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; text-align: center; vertical-align: middle; padding: 3px 0px; margin: 0px auto; border: 1px solid #000; color: #000; background-image: -webkit-linear-gradient(-45deg, #a7c7dc 0%,#85b2d3 100%);";
            var MSG = DIV + "'><b>"+text+"</b></div";
            sendChat('HealthColors', "/w GM "+MSG);
        },
    //OUTSIDE CALL------------
        UpdateToken = function (obj, prev) {
            if (obj.get("type") === "graphic") handleToken(obj, prev);
            else GMW("Script sent non-Token to be updated!");
        },
    //REGISTER TRIGGERS------------
        registerEventHandlers = function () {
            on('chat:message', handleInput);
            on("change:token", handleToken);
            on('add:token', function (t) {
                _.delay(() => {
                    let token = getObj('graphic', t.id),
                    prev = JSON.parse(JSON.stringify(token));
                    handleToken(token, prev, "YES");
                }, 400);
            });
        };
    //RETURN OUTSIDE FUNCTIONS------------
    return {
        GMW: GMW,
        Update: UpdateToken,
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());
//On Ready
on('ready', function () {
    'use strict';
    HealthColors.GMW("API READY");
    HealthColors.CheckInstall();
    HealthColors.RegisterEventHandlers();
});