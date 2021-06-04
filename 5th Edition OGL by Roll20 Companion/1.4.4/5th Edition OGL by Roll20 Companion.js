// 5th Edition OGL by Roll20 Companion Script
// API Commands:
// !5ehelp - Gives a list of the script's API commands in the chat tab.
// !5estatus - Lists the current status of the script's features in the chat tab.
// !ammotracking on/off/player/quiet - Automatically expends linked resource when attack is made
// !autonpctoken on/off - Automatically generates a NPC token on the GM's screen based on the default token when an NPC's health calculation is rolled
// !deathsavetracking on/off/player/quiet - Automatically ticks off successes and failures when death saves are rolled, clearing on death, stabilization, or hp recovery
// !spelltracking on/off/player/quiet - Automatically expends spell charges as cast, factoring in higher level casting
// !longrest <character name> - If spelltracking is on, this command will reset all of the character's spell slots to unspent.
// !npchp <character name> - Rolls randomly NPC hit point totals using their formula. If no character name is provided it will roll the selected tokens.
//
// Options:
// on - Toggles the functionality on (default)
// off - Disables the functionality
// player - Maintains functionality but only sends data to the GM and the player involved..
// quiet - Maintains functionality while preventing results from being output to the chat.

on('chat:message', function(msg) {
    // HANDLE API COMMANDS
    if(msg.type === "api" && !msg.rolltemplate) {
        var params = msg.content.substring(1).split(" ");
        var command = params[0].toLowerCase();
        var option = params[1] ? params[1].toLowerCase() : false;
        var validcommands = ["ammotracking","autonpctoken","deathsavetracking","spelltracking","longrest","npchp"];
        if(command === "5ehelp") {
            outputhelp(msg);
        }
        else if(command === "5estatus") {
            outputstatus(msg);
        }
        else if(validcommands.indexOf(command) > -1) {
            handleapicommand(msg,command,option);
        }
    }
    // ROLL LISTENERS
    else if(msg.playerid.toLowerCase() != "api" && msg.rolltemplate) {
        var cnamebase = msg.content.split("charname=")[1];
        var cname = cnamebase ? cnamebase.replace('}}','').trim() : (msg.content.split("{{name=")[1]||'').split("}}")[0].trim();
        var player = getObj("player", msg.playerid);
        var character = undefined;        
        if (cname) {        
            list = findObjs({name: cname, type: 'character'},{caseInsensitive: true});
            if (list != undefined){
                if (list.length > 1){
                    log('Duplicate character names, process cancelled');
                    return;
                }
            }
            character = list[0]
        }
        if(["simple","npc"].indexOf(msg.rolltemplate) > -1) {
            if(_.has(msg,'inlinerolls') && msg.content.indexOf("^{death-save-u}") > -1 && character && state.FifthEditionOGLbyRoll20.deathsavetracking != "off") {
                handledeathsave(msg,character,player);
            }
            if(_.has(msg,'inlinerolls') && msg.content.indexOf("^{hp}") > -1 && character && msg.rolltemplate && msg.rolltemplate === "npc" && state.FifthEditionOGLbyRoll20.autonpctoken != "off") {
                handlenpctoken(msg,character,player);
            }
        }
        if(["dmg","atkdmg"].indexOf(msg.rolltemplate) > -1) {
            if(_.has(msg,'inlinerolls') && msg.content.indexOf("{{spelllevel=") > -1 && msg.content.indexOf("{{spelllevel=}}") === -1 && character && state.FifthEditionOGLbyRoll20.spelltracking != "off") {
                handleslotattack(msg,character,player);
            }
        }
        if(["spell"].indexOf(msg.rolltemplate) > -1) {
            if(msg.content.indexOf("{{level=") > -1 && character && state.FifthEditionOGLbyRoll20.spelltracking != "off") {
                handleslotspell(msg,character,player);
            }
        }
        if(["atk","atkdmg","dmg"].indexOf(msg.rolltemplate) > -1) {
            if(_.has(msg,'inlinerolls') && msg.content.indexOf("ammo= ") === -1 && character && state.FifthEditionOGLbyRoll20.ammotracking != "off") {
                handleammo(msg,character,player);
            }
        }
    }
});

// API COMMAND RESOLUTION
var handleapicommand = function(msg,command,option) {
    // MAKE SURE OUR NAME SPACE EXISTS
    if(!state.FifthEditionOGLbyRoll20) {
        state.FifthEditionOGLbyRoll20 = {};
    }
    if(command === "longrest") {
        if(state.FifthEditionOGLbyRoll20["spelltracking"] !== "off") {
            longrest(msg);
            return;
        }
        else {
            log("SPELL TRACKING IS NOT ENABLED");
            return;
        }
    }
    else if(command === "npchp") {
        npchp(msg);
        return;
    }
    // RESOLVE COMMAND WITH OPTION
    else if(option && (option === "on" || option === "off" || option === "quiet" || option === "player")) {
        state.FifthEditionOGLbyRoll20[command] = option;
    }
    // ELSE TOGGLE WITHOUT OPTION
    else {
        state.FifthEditionOGLbyRoll20[command] = !state.FifthEditionOGLbyRoll20[command] || state.FifthEditionOGLbyRoll20[command] != "on" ? "on" : "off";
    }
    sendChat(msg.who, "<div class='sheet-rolltemplate-desc'><div class='sheet-desc'><div class='sheet-label' style='margin-top:5px;'><span style='display:block;'>" + command + ": " + state.FifthEditionOGLbyRoll20[command] + "</span></div></div></div>");
};

var outputstatus = function(msg) {
    if(!state.FifthEditionOGLbyRoll20) {
        state.FifthEditionOGLbyRoll20 = {};
    }
    var ammotrackingstatus = !state.FifthEditionOGLbyRoll20.ammotracking || state.FifthEditionOGLbyRoll20.ammotracking === "on" ? "on" : state.FifthEditionOGLbyRoll20.ammotracking;
    var autonpctokenstatus = !state.FifthEditionOGLbyRoll20.autonpctoken || state.FifthEditionOGLbyRoll20.autonpctoken === "on" ? "on" : state.FifthEditionOGLbyRoll20.autonpctoken;
    var deathsavetrackingstatus = !state.FifthEditionOGLbyRoll20.deathsavetracking || state.FifthEditionOGLbyRoll20.deathsavetracking === "on" ? "on" : state.FifthEditionOGLbyRoll20.deathsavetracking;
    var spelltrackingstatus = !state.FifthEditionOGLbyRoll20.spelltracking || state.FifthEditionOGLbyRoll20.spelltracking === "on" ? "on" : state.FifthEditionOGLbyRoll20.spelltracking;
    sendChat(msg.who, "<div class='sheet-rolltemplate-desc'><div class='sheet-desc'><div class='sheet-label' style='margin-top:5px;'><span style='display:block;'>ammotracking: " + ammotrackingstatus + "</span><span style='display:block;'>autonpctoken: " + autonpctokenstatus + "</span><span style='display:block;'>deathsavetracking: " + deathsavetrackingstatus + "</span><span style='display:block;'>spelltracking: " + spelltrackingstatus + "</span><span style='display:block; margin-top:5px;'>5th Edition OGL by Roll20</span></div></div></div>");
};

var outputhelp = function(msg) {
    sendChat(msg.who, "<div class='sheet-rolltemplate-desc'><div class='sheet-desc'><div class='sheet-label' style='margin-top:5px;'><span style='display:block;'>!5estatus</span><span style='display:block;'>!ammotracking on/off/player/quiet</span><span style='display:block;'>!autonpctoken on/off</span><span style='display:block;'>!deathsavetracking on/off/player/quiet</span><span style='display:block;'>!spelltracking on/off/player/quiet</span><span style='display:block;'>!longrest \<character name\></span><span style='display:block; margin-top:5px;'>5th Edition OGL by Roll20</span></div></div></div>");
};


// AUTOMATICALLY APPLY DEATH SAVE RESULTS
var handledeathsave = function(msg,character,player) {
    var result = msg.inlinerolls[0].results.total ? msg.inlinerolls[0].results.total : false;
    var resultbase = msg.inlinerolls[0].results.rolls[0].results[0].v ? msg.inlinerolls[0].results.rolls[0].results[0].v : false;
    var resultoutput = "";
    // The $ sign means that the a global modifier was used.
    if(msg.content.indexOf("{{global=$") > -1 && result != false) {
        var global_mod = msg.inlinerolls[1].results.total ? msg.inlinerolls[1].results.total : 0;
        result = result + global_mod;
    }
    if(result === false) {
        log("FAILED TO FIND DEATH SAVE ROLL RESULT");
    }
    else if(resultbase === 20) {
        resultoutput = "CRITICAL SUCCESS: 1HP";
        var hp = findObjs({type: 'attribute', characterid: character.id, name: "hp"}, {caseInsensitive: true})[0];
        if(!hp) {
            createObj("attribute", {name: "hp", current: 1, max: "", characterid: character.id});
        }
        else {
            hp.set({current:1});
        }
        cleardeathsaves(character);
    }
    else if(result < 10 || resultbase === 1) {
        var fail1 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_fail1"}, {caseInsensitive: true})[0];
        var fail2 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_fail2"}, {caseInsensitive: true})[0];
        var fail3 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_fail3"}, {caseInsensitive: true})[0];
        if(!fail1) {
            fail1 = createObj("attribute", {name: "deathsave_fail1", current: "0", max: "", characterid: character.id});
            //var fail1 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_fail1"}, {caseInsensitive: true})[0];
        }
        if(!fail2) {
            fail2 = createObj("attribute", {name: "deathsave_fail2", current: "0", max: "", characterid: character.id});
            //var fail2 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_fail2"}, {caseInsensitive: true})[0];
        }
        if(!fail3) {
            fail3 = createObj("attribute", {name: "deathsave_fail3", current: "0", max: "", characterid: character.id});
            //var fail3 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_fail3"}, {caseInsensitive: true})[0];
        }
        if(fail2.get("current") === "on" || (fail1.get("current") === "on" && resultbase === 1)) {
            fail2.set({current:"on"});
			fail3.set({current:"on"});
            resultoutput = "DECEASED";
            cleardeathsaves(character);
        }
        else if(fail1.get("current") === "on" || resultbase === 1) {
            fail1.set({current:"on"});
			fail2.set({current:"on"});
            resultoutput = "FAILED 2 of 3";
        }
        else {
            fail1.set({current:"on"});
            resultoutput = "FAILED 1 of 3";
        }
    }
    else {
        var succ1 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_succ1"}, {caseInsensitive: true})[0];
        var succ2 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_succ2"}, {caseInsensitive: true})[0];
        var succ3 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_succ3"}, {caseInsensitive: true})[0];
        if(!succ1) {
            succ1 = createObj("attribute", {name: "deathsave_succ1", current: "0", max: "", characterid: character.id});
            //var succ1 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_succ1"}, {caseInsensitive: true})[0];
        }
        if(!succ2) {
            succ2 = createObj("attribute", {name: "deathsave_succ2", current: "0", max: "", characterid: character.id});
            //var succ2 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_succ2"}, {caseInsensitive: true})[0];
        }
        if(!succ3) {
            succ3 = createObj("attribute", {name: "deathsave_succ3", current: "0", max: "", characterid: character.id});
            //var succ3 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_succ3"}, {caseInsensitive: true})[0];
        }
        if(succ2.get("current") === "on") {
            succ3.set({current:"on"});
            resultoutput = "STABILIZED";
            cleardeathsaves(character);
        }
        else if(succ1.get("current") === "on") {
            succ2.set({current:"on"});
            resultoutput = "SUCCEEDED 2 of 3";
        }
        else {
            succ1.set({current:"on"});
            resultoutput = "SUCCEEDED 1 of 3";
        }
    }
    let wtype = getAttrByName(character.id, "wtype")
    let displayName=player.get('displayname');
    let playerName = "";
    if (state.FifthEditionOGLbyRoll20.deathsavetracking==="player")
      playerName = (displayName===undefined || playerIsGM(player.get("_id"))) ? undefined : `/w "${player.get('displayname')}" `;
    var sendPlayerMsg=(playerName !== "" || wtype === "");
    var sendGMMsg=(playerName !== "" || wtype !== "");

    if(state.FifthEditionOGLbyRoll20.deathsavetracking != "quiet") {
        if(sendPlayerMsg) {
            if (playerName!==undefined)
                sendChat(msg.who, playerName+"<div class='sheet-rolltemplate-simple' style='margin-top:-7px;'><div class='sheet-container'><div class='sheet-label' style='margin-top:5px;'><span>" + resultoutput + "</span></div></div></div>");
        }
        if(sendGMMsg) {
            sendChat(msg.who, "/w gm <div class='sheet-rolltemplate-desc'><div class='sheet-desc'><div class='sheet-label' style='margin-top:5px;'><span>" + resultoutput + "</span></div></div></div>");
        }
    }
};

var cleardeathsaves = function(character) {
    var fail1 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_fail1"}, {caseInsensitive: true})[0];
    var fail2 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_fail2"}, {caseInsensitive: true})[0];
    var fail3 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_fail3"}, {caseInsensitive: true})[0];
    var succ1 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_succ1"}, {caseInsensitive: true})[0];
    var succ2 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_succ2"}, {caseInsensitive: true})[0];
    var succ3 = findObjs({type: 'attribute', characterid: character.id, name: "deathsave_succ3"}, {caseInsensitive: true})[0];
    if(fail1) {fail1.set({current:"0"});};
    if(fail2) {fail2.set({current:"0"});};
    if(fail3) {fail3.set({current:"0"});};
    if(succ1) {succ1.set({current:"0"});};
    if(succ2) {succ2.set({current:"0"});};
    if(succ3) {succ3.set({current:"0"});};
};

// AUTOMATICALLY GENERATE NPC TOKEN WHEN HP FORMULA IS ROLLED
var handlenpctoken = function(msg,character,player) {
    character.get("defaulttoken", function(token) {
        var t = JSON.parse(token);
        if(token === "null") {
            log("NPC DOES NOT HAVE A DEFAULT TOKEN");
        }
        else {
            var page = playerIsGM(player.id) === true && player.get("lastpage") != "" ? player.get("lastpage") : Campaign().get("playerpageid");
            var hp = msg.inlinerolls[0].results.total ? msg.inlinerolls[0].results.total : 0;
            var img = getCleanImgsrc(t.imgsrc);
            var tokenname = t.name ? t.name : character.get("name");
            var represents = t.represents ? t.represents : character.id;
            createObj("graphic", {
                left: 140,
                top: 140,
                width: t.width,
                height: t.height,
                imgsrc: img,
                pageid: page,
                layer: (_.contains(["gmlayer", "objects", "map"], t.layer) ? t.layer : 'gmlayer'),
                name: tokenname,
                represents: represents,
                bar3_value: hp,
                bar3_max: hp
            });
        }
    });
};

var getCleanImgsrc = function (imgsrc) {
   var parts = imgsrc.match(/(.*\/(?:images|marketplace)\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
   if(parts) {
      return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
   }
   return;
};

var handleslotattack = function (msg,character,player) {
    var spelllevel = (msg.content.split("{{spelllevel=")[1]||'').split("}}")[0];
    var innate = msg.content.indexOf("{{innate=}}") > -1 ? false : true;
    if(spelllevel === "cantrip" || spelllevel === "npc" || innate) {
        return;
    }
    var hlinline = msg.content.split("{{hldmg=$[[")[1] || "";
    hlinline = hlinline.substring(0,1);
    var higherlevel = 0;
    if(hlinline != "") {
        higherlevel = (msg.inlinerolls[hlinline].expression.split("*")[1]||'').split(")")[0];
    }
    var spellslot = parseInt(spelllevel, 10) + parseInt(higherlevel,10);
    resolveslot(msg,character,player,spellslot);
};

var handleslotspell = function (msg,character,player) {
    var spellslot = ((msg.content.split("{{level=")[1]||'').split("}}")[0]||'').split(" ")[1];
    var ritual = msg.content.indexOf("{{ritual=1}}") > -1 ? true : false;
    var innate = msg.content.indexOf("{{innate=}}") > -1 ? false : true;
    if(spellslot === "0" || spellslot === "cantrip" || spellslot === "npc" || ritual || innate) {
        return;
    }
    resolveslot(msg,character,player,spellslot);
};

var resolveslot = function(msg,character,player,spellslot) {
    var charslot = findObjs({type: 'attribute', characterid: character.id, name: "lvl" + spellslot + "_slots_expended"}, {caseInsensitive: true})[0];
    if(!charslot) {
        charslot = createObj("attribute", {name: "lvl" + spellslot + "_slots_expended", current: "0", max: "", characterid: character.id});
        //var charslot = findObjs({type: 'attribute', characterid: character.id, name: "lvl" + spellslot + "_slots_expended"}, {caseInsensitive: true})[0];
    }
    var charslotmax = findObjs({type: 'attribute', characterid: character.id, name: "lvl" + spellslot + "_slots_total"}, {caseInsensitive: true})[0];
    if(!charslotmax) {
        charslotmax = createObj("attribute", {name: "lvl" + spellslot + "_slots_total", current: "0", max: "", characterid: character.id});
        //var charslotmax = findObjs({type: 'attribute', characterid: character.id, name: "lvl" + spellslot + "_slots_total"}, {caseInsensitive: true})[0];
    }
    var spent = parseInt(charslot.get("current"), 10);
    charslot.set({current: Math.max(spent - 1, 0)});
    var wtype = getAttrByName(character.id, "wtype");
    var wtoggle = getAttrByName(character.id, "whispertoggle");
    let displayName=player.get('displayname');
    let playerName = "";
    if (state.FifthEditionOGLbyRoll20.spelltracking==="player")
      playerName = (displayName===undefined || playerIsGM(player.get("_id"))) ? undefined : `/w "${player.get('displayname')}" `;
    var sendPlayerMsg=(playerName !== "" || wtype === "" || (wtype === "@{whispertoggle}" && wtoggle === "") || (wtype === "?{Whisper?|Public Roll,|Whisper Roll,/w gm }" && msg.type === "general"));
    var sendGMMsg=(playerName !== "" || wtype === "/w gm " || (wtype === "@{whispertoggle}" && wtoggle === "/w gm ") || (wtype === "?{Whisper?|Public Roll,|Whisper Roll,/w gm }" && msg.type === "whisper"));
    if(spent > 0) {
        if(state.FifthEditionOGLbyRoll20.spelltracking != "quiet") {
            if(sendPlayerMsg) {
                if (playerName!==undefined)
                    sendChat(msg.who, playerName + "<div class='sheet-rolltemplate-simple' style='margin-top:-7px;'><div class='sheet-container'><div class='sheet-label' style='margin-top:5px;'><span style='display:block;'>SPELL SLOT LEVEL " + spellslot + "</span><span style='display:block;'>" + Math.max(spent - 1, 0) + " OF " + charslotmax.get("current") + " REMAINING</span></div></div></div>");
            }
            if(sendGMMsg) {
                sendChat(msg.who, "/w gm <div class='sheet-rolltemplate-simple'><div class='sheet-container'><div class='sheet-label' style='margin-top:5px;'><span style='display:block;'>SPELL SLOT LEVEL " + spellslot + "</span><span style='display:block;'>" + Math.max(spent - 1, 0) + " OF " + charslotmax.get("current") + " REMAINING</span></div></div></div>");
            }
        }
    }
    else {
        if(sendPlayerMsg) {
            if (playerName!==undefined)
                sendChat(msg.who, playerName + "<div class='sheet-rolltemplate-simple' style='margin-top:-7px;'><div class='sheet-container'><div class='sheet-label' style='margin-top:5px;'><span style='display:block;'>SPELL SLOT LEVEL " + spellslot + "</span><span style='display:block; color:red;'>ALL SLOTS EXPENDED</span></div></div></div>");
        }
        if(sendGMMsg) {
            sendChat(msg.who, "/w gm <div class='sheet-rolltemplate-simple'><div class='sheet-container'><div class='sheet-label' style='margin-top:5px;'><span style='display:block;'>SPELL SLOT LEVEL " + spellslot + "</span><span style='display:block; color:red;'>ALL SLOTS EXPENDED</span></div></div></div>");
        }
    }
};

var longrest = function(msg) {
    charname = msg.content.substring(msg.content.indexOf(" ") + 1);
    var character = findObjs({name: charname, type: "character"}, {caseInsensitive: true})[0];
    if(!character) {
        log("NO CHARACTER BY THAT NAME FOUND");
    }
    else {
        // SPELL SLOTS
        for (var i = 1; i < 10; i++) {
            var charslotmax = findObjs({type: 'attribute', characterid: character.id, name: "lvl" + i + "_slots_total"}, {caseInsensitive: true})[0];
            if(!charslotmax) {
                charslotmax = createObj("attribute", {name: "lvl" + i + "_slots_total", current: "0", max: "", characterid: character.id});
            }
            var charslot = findObjs({type: 'attribute', characterid: character.id, name: "lvl" + i + "_slots_expended"}, {caseInsensitive: true})[0];
            if(!charslot) {
                charslot = createObj("attribute", {name: "lvl" + i + "_slots_expended", current: charslotmax.get("current"), max: "", characterid: character.id});
            }
            else {
                charslot.set({current: charslotmax.get("current")});
            }
        };
        // HP
        var maxhp = getAttrByName(character.id, "hp", "max");
        var hp = findObjs({type: 'attribute', characterid: character.id, name: "hp"}, {caseInsensitive: true})[0];
        if(hp && maxhp) {
            hp.set({current: maxhp});
        }
        // HIT DICE
        var hit_dice = findObjs({type: 'attribute', characterid: character.id, name: "hit_dice"}, {caseInsensitive: true})[0];
        var max_hd = parseInt(hit_dice.get("max"),10);
        var cur_hd = parseInt(hit_dice.get("current"),10);
        if(max_hd != null && cur_hd < max_hd) {
            cur_hd = Math.min(cur_hd + Math.floor(max_hd/2), max_hd);
            hit_dice.set({current: cur_hd});
        }
    }
};

var npchp = function(msg) {
    var qualifier = msg.content.substring(6).trim();
    var tokens = [];
    if(qualifier.length > 0) {
        if ((qualifier.match(/"/g)||[]).length > 1) {
            qualifier = qualifier.match( /"(.*?)"/ )[1];
        }
        else if ((qualifier.match(/'/g)||[]).length > 1) {
            qualifier = qualifier.match( /'(.*?)'/ )[1];
        }
        var character = findObjs({type: 'character', name: qualifier}, {caseInsensitive: true})[0] || false;
        if(!character) {
            log("NO CHARACTER BY THAT NAME '" + qualifier + "' FOUND");
            return;
        }
        var player = getObj("player", msg.playerid);
        if(!player) {
            log("NO PLAYER BY THAT ID:" + qualifier + " FOUND");
        }
        tokens = findObjs({type: 'graphic', subtype: 'token', represents: character.id, pageid: player.get("lastpage")});
    }
    else {
        tokens = msg["selected"];
    }
    _.each(tokens, function(token) {
        var t_obj = getObj("graphic", token.id);
        if(!t_obj) {
            t_obj = getObj("graphic", token["_id"]);
        }
        var rep_id = t_obj.get("represents");
        if(t_obj && rep_id) {
            var maxhp = getAttrByName(rep_id, "hp", "max");
            var formula = getAttrByName(rep_id, "npc_hpformula");
            var bar1 = t_obj.get("bar1_value");
            var bar2 = t_obj.get("bar2_value");
            var bar3 = t_obj.get("bar3_value");
            if(formula) {
                var f_array = formula.split(/d|\+/);
                if(f_array.length > 1) {
                    var n_dice = parseInt(f_array[0],10);
                    var d_type = parseInt(f_array[1],10);
                    var mod = parseInt(f_array[2],10);
                    var hp = mod ? mod : 0;
                    for (var i = 0; i < n_dice; i++) {
                        hp = hp + randomInteger(d_type);
                    }
                    if(bar1 === maxhp) {
                        t_obj.set({bar1_value: hp});
                        t_obj.set({bar1_max: hp});
                    }
                    else if(bar2 === maxhp) {
                        t_obj.set({bar2_value: hp});
                        t_obj.set({bar2_max: hp});
                    }
                    else if(bar3 === maxhp) {
                        t_obj.set({bar3_value: hp});
                        t_obj.set({bar3_max: hp});
                    }
                }
            }
        }
    });


}

var handleammo = function (msg,character,player) {
    if(msg.content.indexOf("ammo=") === -1) {
        // UNABLE TO FIND AMMO
        return;
    }
    if(msg.content.indexOf("{{charname=") > -1) {
        var ammofull = (msg.content.split("ammo=")[1]||'').split(" {{charname=")[0];
    }
    else {
        var ammofull = (msg.content.split("ammo=")[1]||'').split(" charname")[0];
    }
    var ammoid = "";
    var ammoname = "";
    var ammonum = 1;
    if(ammofull.substring(0,1) === "-") {
        ammoid = ammofull.substring(0,20);
        var ammoresource = findObjs({type: 'attribute', characterid: character.id, id: ammoid}, {caseInsensitive: true})[0];
        if(ammoresource) {
            ammoname = getAttrByName(character.id, ammoresource.get("name") + "_name");
        }
    }
    else if(ammofull.indexOf("|") > -1) {
        var temp = ammofull.split("|");
        ammoid = temp[1];
        ammoname = temp[0];
        if(ammoname.indexOf(",") > -1) {
            temp = ammoname.split(",");
            ammoname = temp[0];
            ammonum = !isNaN(parseInt(temp[1],10)) ? parseInt(temp[1],10) : 1;
        };
    }
    else {
        ammoname = ammofull;
        if(ammoname.indexOf(",") > -1) {
            temp = ammoname.split(",");
            ammoname = temp[0];
            ammonum = !isNaN(parseInt(temp[1],10)) ? parseInt(temp[1],10) : 1;
        };
        var resources = filterObjs(function(obj) {
            if(obj.get("type") === "attribute" && obj.get("characterid") === character.id && (obj.get("current") + "").toLowerCase() === ammoname.toLowerCase() && obj.get("name").indexOf("resource") > -1) return true;
            else return false;
        });
        if(!resources[0]) {
            log("UNABLE TO FIND RESOURCE");
            return;
        }
        resname = resources[0].get("name").replace("_name","");
        ammoid = findObjs({type: 'attribute', characterid: character.id, name: resname}, {caseInsensitive: true})[0].id;
        var atkid = "";
        if(msg.content.indexOf("~") > -1) {
           atkid = (msg.content.split("repeating_attack_")[1]||'').split("_attack_dmg")[0];
        }
        else {
           var atkname = (msg.content.split("{{rname=")[1]||'').split("}}")[0];
           var attacks = filterObjs(function(obj) {
               if(obj.get("type") === "attribute" && obj.get("characterid") === character.id && obj.get("current") === atkname) return true;
               else return false;
           });
           var reg = new RegExp(/.+?(?=_atkname)/);
           _.each(attacks, function(atk) {
               if(reg.test(atk.get("name"))) {
                   atkid = atk.get("name").replace("repeating_attack_","").replace("_atkname","");
               }
           });
        }
        if(!atkid) {
           log("UNABLE TO FIND ATTACK ID");
           return;
        }
        atkammo = findObjs({type: 'attribute', characterid: character.id, name: "repeating_attack_" + atkid + "_ammo"}, {caseInsensitive: true})[0];
        if(atkammo) {        
            atkammo.set({current: atkammo.get("current") + "|" + ammoid});
        }
    }
    ammoresource = findObjs({type: 'attribute', characterid: character.id, id: ammoid}, {caseInsensitive: true})[0];
    if(ammoresource) {
        ammoresource.set({current: ammoresource.get("current") - ammonum});
        ammoitemid = getAttrByName(character.id, ammoresource.get("name") + "_itemid");
        if(ammoitemid) {
            ammoitem = findObjs({type: 'attribute', characterid: character.id, name: "repeating_inventory_" + ammoitemid + "_itemcount"}, {caseInsensitive: true})[0];
            if(ammoitem) {
                ammoitem.set({current: ammoitem.get("current") - ammonum});
            }
            ammoweight = findObjs({type: 'attribute', characterid: character.id, name: "repeating_inventory_" + ammoitemid + "_itemweight"}, {caseInsensitive: true})[0];
            totalweight = findObjs({type: 'attribute', characterid: character.id, name: "weighttotal"}, {caseInsensitive: true})[0];
            if(ammoweight && totalweight) {
                totalweight.set({current: totalweight.get("current") - (ammoweight.get("current") * ammonum)});
            }
        }
        var wtype = getAttrByName(character.id, "wtype");
        var wtoggle = getAttrByName(character.id, "whispertoggle");
        let displayName=player.get('displayname');
        let playerName = "";
        if (state.FifthEditionOGLbyRoll20.ammotracking==="player")
          playerName = (displayName===undefined || playerIsGM(player.get("_id"))) ? undefined : `/w "${player.get('displayname')}" `;
        var sendPlayerMsg=(playerName !== "" || wtype === "" || (wtype === "@{whispertoggle}" && wtoggle === "") || (wtype === "?{Whisper?|Public Roll,|Whisper Roll,/w gm }" && msg.type === "general"));
        var sendGMMsg=(playerName !== "" || wtype === "/w gm " || (wtype === "@{whispertoggle}" && wtoggle === "/w gm ") || (wtype === "?{Whisper?|Public Roll,|Whisper Roll,/w gm }" && msg.type === "whisper"));
        if(ammoresource.get("current") < 0) {
            if(sendPlayerMsg) {
                if (playerName!==undefined)
                  sendChat(msg.who, playerName + "<div class='sheet-rolltemplate-simple' style='margin-top:-7px;'><div class='sheet-container' style='border-radius: 0px;'><div class='sheet-label' style='margin-top:5px;'><span style='display:block; color:red;'>OUT OF AMMO</span></div></div></div>");
            }
            if(sendGMMsg) {
                sendChat(msg.who, "/w gm <div class='sheet-rolltemplate-desc'><div class='sheet-desc' style='border-radius: 0px;'><div class='sheet-label' style='margin-top:5px;'><span style='display:block; color:red;'>OUT OF AMMO</span></div></div></div>");
            }
        }
        else if(state.FifthEditionOGLbyRoll20.ammotracking !== "quiet") {
            if(sendPlayerMsg) {
              if (playerName!==undefined)
                sendChat(msg.who, playerName + "<div class='sheet-rolltemplate-simple' style='margin-top:-7px;'><div class='sheet-container' style='border-radius: 0px;'><div class='sheet-label' style='margin-top:5px;'><span style='display:block;'>"
                  + ammoname + ": " + ammoresource.get("current") + " LEFT</span></div></div></div>");
            }
            if(sendGMMsg) {
                sendChat(msg.who, "/w gm <div class='sheet-rolltemplate-desc'><div class='sheet-desc' style='border-radius: 0px;'><div class='sheet-label' style='margin-top:5px;'><span style='display:block;'>"
                  + ammoname + ": " + ammoresource.get("current") + " LEFT</span></div></div></div>");
            };
        }
    }
};

on('ready', function() {
    if(!state.FifthEditionOGLbyRoll20) {
        state.FifthEditionOGLbyRoll20 = {};
    }
    if(!state.FifthEditionOGLbyRoll20.deathsavetracking) {
        state.FifthEditionOGLbyRoll20.deathsavetracking = "on";
    }
    if(!state.FifthEditionOGLbyRoll20.autonpctoken) {
        state.FifthEditionOGLbyRoll20.autonpctoken = "on";
    }
    if(!state.FifthEditionOGLbyRoll20.spelltracking) {
        state.FifthEditionOGLbyRoll20.spelltracking = "on";
    }
    if(!state.FifthEditionOGLbyRoll20.ammotracking) {
        state.FifthEditionOGLbyRoll20.ammotracking = "on";
    }
});
