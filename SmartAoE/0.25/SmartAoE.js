const SmartAoE = (() => {
    const scriptName = "SmartAoE";
    const version = '0.25';
    const schemaVersion = '0.1';
    
    var cardParameters = {};
    var tokenMarkerURLs = {};
    
    const defaultParameters = {
        leftmargin: '-42px',
		whisper: false,
		tableborder: "2px solid #000000;",
		tablebgcolor: "#EEEEEE",
		tableborderradius: "6px;", 
		tableshadow: "5px 3px 3px 0px #aaa;",
		title: "SmartAoE",                  
		titlecardbackground: "linear-gradient(red, yellow)",  
		titlecardbottomborder: "2px solid #444444;",
		titlefontface: "Contrail One",
		titlefontsize: "1.2em",
		titlefontlineheight: "1.2em",
		descriptiontext: "",
		lineheight: "normal",
		titlefontcolor: "#EEEEEE",
		subtitlefontsize: "13px",
		subtitlefontface: "Tahoma",
		subtitlefontcolor: "#333333",
		subtitleseperator: " &" + "#x2666; ",
		bodyfontsize: "14px;", 
		bodyfontface: "Helvetica",
		oddrowbackground: "#FFFFFF",    
		evenrowbackground: "#DDDDDD",
		oddrowfontcolor: "#000000",
		evenrowfontcolor: "#000000",
		whisper: "",
		leftsub: "",
		rightsub: "",
		debug: 0,
		hidecard: "0",
		hidetitlecard: "0",
		showresultheader: "0",        
		imagewidth: 32,
		imageheight: 32,
		resizeinline: "1",
		dontcheckbuttonsforapi: "0",
		roundup: "0",
		buttonbackground: "#1C6EA4",
		buttontextcolor: "#FFFFFF",
		buttonbordercolor: "#999999",
		dicefontcolor: "#1C6EA4",
		dicefontsize: "3.0em",
		usehollowdice: "0",
		allowplaintextinrolls: "0",
		whisper: "",
		showfromfornonwhispers: "0",
		allowinlinerollsinoutput: "0",
		nominmaxhighlight: "0",
		disablestringexpansion: "0",
		disablerollvariableexpansion: "0",
		disableparameterexpansion: "0",
		disablerollprocessing: "0",
		disableattributereplacement: "0",
		disableinlineformatting: "0",
		styleTableTag: " border-collapse:separate; border: solid black 2px; border-radius: 6px; -moz-border-radius: 6px; ",
		styleNormal:" text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #FFFEA2; border-color: #87850A; color: #000000;",
		styleFumble: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #FFAAAA; border-color: #660000; color: #660000;",
		styleCrit: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #88CC88; border-color: #004400; color: #004400;",
		styleBoth: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #8FA4D4; border-color: #061539; color: #061539;",
	};
    
    let tableLineCounter = 0;
    let targetNum = 0;
    
    
    //---------------------------------------------------------------------------------------
    // Handles registering token change events for other api scripts
    //---------------------------------------------------------------------------------------
    let observers = {
        tokenChange: []
    };
    
    const observeTokenChange = function(handler){
        if(handler && _.isFunction(handler)){
            observers.tokenChange.push(handler);
        }
    };

    const notifyObservers = function(event,obj,prev){
        _.each(observers[event],function(handler){
          try {
            handler(obj,prev);
          } catch(e) {
            log(`SmartAoE: An observer threw and exception in handler: ${handler}`);
          }
        });
    };
    //---------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------
    
    const isNumber = function isNumber(value) {
        return typeof value === 'number' && isFinite(value);
    }
    
    
    const buildTitle = function (cardParameters) {
        var subtitle = "";
		if ((cardParameters.leftsub !== "") && (cardParameters.rightsub !== "")) {
			subtitle = cardParameters.leftsub + cardParameters.subtitleseperator + cardParameters.rightsub;
		}
		if ((cardParameters.leftsub !== "") && (cardParameters.rightsub === "")) {
			subtitle = cardParameters.leftsub;
		}
		if ((cardParameters.leftsub === "") && (cardParameters.rightsub !== "")) {
			subtitle = cardParameters.rightsub;
		}
		
		
        let output = `<div style="margin-left:!{leftmargin}">` + 
                        `<div style="display: table; border: !{tableborder}; background-color: !{tablebgcolor}; width: 270px; text-align: left; border-radius: !{tableborderradius}; border-collapse: separate; box-shadow: !{tableshadow}">` +
                            `<div style="display: table-header-group; background-image: !{titlecardbackground}; border-bottom: !{titlecardbottomborder};">` +
                                `<div style="display: table-row;">` +
                                    `<div style="display: table-cell; padding: 2px 2px; text-align: center; border-bottom: 2px solid #444444;border-top-left-radius: !{tableborderradius};border-top-right-radius: !{tableborderradius};">` +
                                        `<span style="font-family: !{titlefontface}; font-style:normal; font-size: !{titlefontsize}; line-height: !{titlefontlineheight}; font-weight: bold; color: !{titlefontcolor}; text-shadow: -1px 1px 0 #000, 1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000;">${cardParameters.title}</span>` +
                                        `<br><span style="font-family: !{subtitlefontface}; font-variant: normal; font-size: !{subtitlefontsize}; font-style:normal; font-weight: bold; color: !{subtitlefontcolor}; ">${subtitle}</span>` +
                                    `</div>` +
                                `</div>` +
                            `</div>`
        //log(output);
        output = replaceStyleInformation(output, cardParameters);
        return output;
    }
    
    const buildDamageRow = function (damRoll1, damType1, hideformula, damRoll2="", damType2="", cardParameters) {
        let rowBackground, fontColor;
        
        /*
        tableLineCounter += 1;
        if (tableLineCounter % 2 == 0) {
            rowBackground = cardParameters.evenrowbackground;
            fontColor = cardParameters.evenrowfontcolor;
        } else {
            rowBackground = cardParameters.oddrowbackground;
            fontColor = cardParameters.oddrowfontcolor;
        }
        */
        
        let rowData = `<td style="width:270px;padding:3px;line-height: !{lineheight};width:100%;vertical-align:middle;text-align:center;font-weight:bold; font-size:!{bodyfontsize}; font-family: !{bodyfontface}">` +
                        `<span>Dmg:</span>` +
                        `${damRoll1}` +
                        `<span>${damType1}</span>` +
                    `</td>`;
        
        if (damRoll2 !== "") {
            rowData = rowData + `<td style="width:270px;padding:3px;line-height: !{lineheight};width:100%;vertical-align:middle;text-align:center;font-weight:bold; font-size:!{bodyfontsize}; font-family: !{bodyfontface}">` +
                                    `<span>Dmg:</span>` +
                                    `${damRoll2}` +
                                    `<span>${damType2}</span>` +
                              `</td>`;
        }
        
        /*
        let output = `<table style="width:270px; border-collapse:collapse; table-layout:fixed; width 270px; font-size:!{bodyfontsize}; font-family: !{bodyfontface}; border-bottom: 2px solid #444444;">` +
                        `<tr style="background: ${rowBackground}; color:${fontColor}; text-align:center">${rowData}</tr>` +
                     `</table>`;
        */
        let output = `<table style="width:270px; border-collapse:collapse; table-layout:fixed; width 270px; font-size:!{bodyfontsize}; font-family: !{bodyfontface}; border-bottom: 2px solid #444444;">` +
                        `<tr style="background: !{tablebgcolor}; text-align:center">${rowData}</tr>` +
                     `</table>`;
        
        output = replaceStyleInformation(output, cardParameters);
        return output;
    }
    
    const buildSaveHeaderRow = function (cardParameters) {
        let rowBackground, fontColor;
        
        tableLineCounter += 1;
        if (tableLineCounter % 2 == 0) {
            rowBackground = cardParameters.evenrowbackground;
            fontColor = cardParameters.evenrowfontcolor;
        } else {
            rowBackground = cardParameters.oddrowbackground;
            fontColor = cardParameters.oddrowfontcolor;
        }
        
        let output = `<tr style="background: ${rowBackground}; color:${fontColor}; text-align:center;border-bottom: 1px solid #444444;">` +
                            `<td style="width:150px;padding:3px;width:85%;vertical-align:middle;text-align:left;font-weight:bolder;">Target</td>` +
                            `<td style="width:30px;text-align:center;font-weight:bold;padding: 2px 2px">Roll</td>` +
                            `<td style="width:40px;text-align:center; font-weight:bold; padding: 2px 2px">P/F?</td>` +
                            `<td style="width:50px;font-weight:bold; padding: 2px 2px">Dam.</td>` +
                        `</tr>`;
        output = replaceStyleInformation(output, cardParameters);
        return output;
    }
    
    const buildGMOutput = function (saveRows, cardParameters) {
        let output = `<div style="margin-left:!{leftmargin}">` +
                         `<table style="width:270px; border-collapse:collapse; table-layout:fixed; font-size:!{bodyfontsize}; font-family: !{bodyfontface}">` +
                            `<tr>` +
                                `<td style="width:150px;padding:3px;width:85%;vertical-align:middle;text-align:left;font-weight:bolder;"></td>` +
                                `<td style="width:30px;text-align:center;font-weight:bold;padding: 2px 2px"></td>` +
                                `<td style="width:40px;text-align:center; font-weight:bold; padding: 2px 2px"></td>` +
                                `<td style="width:50px;font-weight:bold; padding: 2px 2px"></td>` +
                            `</tr>` +
                            `${saveRows}` +
                         `</table></div></div>`;
        
        output = replaceStyleInformation(output, cardParameters);
        return output;
    }
    
    const buildTableBody = function (saveHeaderRow, saveRows, descRow, cardParameters) {
        let rowBackground, fontColor;
        
        let output = `<table style="width:270px; border-collapse:collapse; table-layout:fixed; font-size:!{bodyfontsize}; font-family: !{bodyfontface}">` +
                        `${saveHeaderRow}` +
                        `${saveRows}` +
                        `${descRow}` + 
                     `</table></div></div>`;
        
        output = replaceStyleInformation(output, cardParameters);
        return output;
    }
    
    const buildSaveRow = function (imageURL, id, layer, name, success, saveInline1, saveInline2, roll2x, hideforumula, dam, autoApply, bar, markerString, RVI, zeroHPmarker, removeAtZero, cardParameters) {
        let result;
        let damString = dam.join('/');
        markerString = markerString.replace(/::/g,'%%');
        zeroHPmarker = zeroHPmarker.replace(/::/g,'%%');
        if (markerString === '') { markerString = 'n/a' }
        if (zeroHPmarker === '') { zeroHPmarker = 'n/a' }
        let whisperDamageMsg = (layer === 'gmlayer') ? 'true' : 'false';
        let removeAtZeroMsg = removeAtZero ? 'true' : 'false';
        let barString = bar.join(',');
        
        //replace some problem characters before creating the !smartapply button action text. These will get un-replaced when triggered
        let tempName = name.replace(/'/g, '%apostrophe%').replace(/`/g, /%backtick%/g);
        
        let applyDamLink = autoApply ? '' : ` href='!smartapply --args|${id}|"${tempName}"|${barString}|${damString}|${markerString}|${zeroHPmarker}|${removeAtZeroMsg}|${whisperDamageMsg}'`;
        damString = damString.replace('/', ' / ');
        
        let RVI_output = '';
        if (RVI.length > 0) { 
            RVI_output = `<span style="font-size: 10px; vertical-align: super">${RVI}</span>` 
        }
        
        let rowBackground;
        let fontColor;
        tableLineCounter += 1;
        if (tableLineCounter % 2 == 0) {
            rowBackground = cardParameters.evenrowbackground;
            fontColor = cardParameters.evenrowfontcolor;
        } else {
            rowBackground = cardParameters.oddrowbackground;
            fontColor = cardParameters.oddrowfontcolor;
        }
        
        if (success) {
            result = `<td style="text-align:center"><a style="font-weight:bold;color:#ffffff;background:#3FB315;border:1px solid black;padding:2px;cursor:pointer"${applyDamLink}>P</a></td>`
        } else {
            result = `<td style="text-align:center"><a style="font-weight:bold;color:#ffffff;background:#b50e0c;border:1px solid black;padding:2px;cursor:pointer"${applyDamLink}>F</a></td>`
        }
        
        //ping-pull for tokens on gm layer will only be visible to gm. Otherwise, all players see ping-pull
        pingCmd = layer === 'gmlayer' ? '!smartpinggm' : '!smartpingall'
        
        let output = `<tr style="background: ${rowBackground}; color:${fontColor}">` +
                        `<td style="padding:3px;height:25px">` +
                            `<div style ="float:left;">` +
                                `<a style="display:inline-block;vertical-align:middle;margin-right:4px;border-style:none;margin:0px;padding:0px;background: ${rowBackground}; cursor:pointer;" href="${pingCmd} ${id}">` +
                                    `<img style ="height:25px;width:25px;" src ="${imageURL}"></img>` +
                                `</a>` +
                            `</div>` +
                            `<span style="vertical-align:middle;font-weight:bolder">${name}</span>` + RVI_output + 
                        `</td>` +
                        `<td style="text-align:center">` +
                            `${saveInline1}${roll2x ? saveInline2 : ''}` +  
                        `</td>` +
                        `${result}` +
                        `<td style="text-align:center; font-weight:bold">${damString}</td>` +
                     `</tr>`;
        
        output = replaceStyleInformation(output, cardParameters);
        
        retObj = {layer: layer, output: output};
        return retObj;
    }
    
    const buildDescRow = function (descText, cardParameters) {
        let rowBackground;
        let fontColor;
        
        /*
        tableLineCounter += 1;
        if (tableLineCounter % 2 == 0) {
            rowBackground = cardParameters.evenrowbackground;
            fontColor = cardParameters.evenrowfontcolor;
        } else {
            rowBackground = cardParameters.oddrowbackground;
            fontColor = cardParameters.oddrowfontcolor;
        }
        
        let output = `<desc style="background: ${rowBackground}; color:${fontColor}; border-bottom-left-radius: !{tableborderradius};border-bottom-right-radius: !{tableborderradius};">` +
                        `<td colspan="4">` +
                        `<div style="background: ${rowBackground}; color:${fontColor};text-align:justify;text-justify:inter-word; margin:2px 2px 2px 2px;border-top: 1px solid #444444;">${descText}</div>` +
                        `</td>` +
                     `</desc>`
        */
        
        let output = `<desc style="background: !{tablebgcolor}; border-bottom-left-radius: !{tableborderradius};border-bottom-right-radius: !{tableborderradius};">` +
                        `<td colspan="4">` +
                        `<div style="text-align:justify;text-justify:inter-word; margin:2px 2px 2px 2px;border-top: 1px solid #444444;">${descText}</div>` +
                        `</td>` +
                     `</desc>`
        
        output = replaceStyleInformation(output, cardParameters);
        return output;
    }
    
    const replaceStyleInformation = function (outputLine, cardParmeters) {
		/*
		let styleList = [
			"tableborder", "tablebgcolor", "tableborderradius", "tableshadow", "titlecardbackground", "titlecardbottomborder",
			"titlefontsize", "titlefontlineheight", "titlefontcolor", "bodyfontsize", "subtitlefontsize", "subtitlefontcolor",
			"titlefontface", "bodyfontface", "subtitlefontface", "buttonbackground", "buttontextcolor", "buttonbordercolor",
			"dicefontcolor", "dicefontsize", "lineheight"
		];
		*/
		let styleList = [
			"tableborder", "tablebgcolor", "tableborderradius", "tableshadow", "titlecardbackground", "titlecardbottomborder",
			"titlefontsize", "titlefontlineheight", "titlefontcolor", "bodyfontsize", "subtitlefontsize", "subtitlefontcolor",
			"titlefontface", "bodyfontface", "subtitlefontface", "buttonbackground", "buttontextcolor", "buttonbordercolor",
			"dicefontcolor", "dicefontsize", "descriptiontext", "leftmargin"
		];

		for (let i=0; i<styleList.length; i++) {
			outputLine = outputLine.replace(new RegExp("!{" + styleList[i] + "}", "g"), cardParmeters[styleList[i]]);
		}
		return outputLine;
	}
    
    
    
    const sendChatNoarchive = (playerid, string) => {
        const whisperPrefix = `/w "${(getObj("player", playerid) || {get: () => "GM"}).get("_displayname")}" `;
        sendChat("smartAoE", whisperPrefix + string, null, {
            noarchive: true
        });
    }
    
    const sendChatBox = (playerid, content, background) => {
        const output = `<div style="border:1px solid black;background:#${background || "FFF"};` +
            `padding:3px;margin:0 10px 0 -32px">${content}</div>`;
        sendChatNoarchive(playerid, output);
    }
    const handleError = (playerid, errorMsg) => sendChatBox(playerid, `<h4>Error</h4><p>${errorMsg}</p>`, "FFBABA")
    
    let saveList = {
        "5estr": {
          "name": "STR Save",
          "formula": "[[d20 + ([[d0 + @{strength_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_str_save}*@{npc}) [NPC]]]"
        },
        "5edex": {
          "name": "DEX Save",
          "formula": "[[d20 + ([[d0 + @{dexterity_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_dex_save}*@{npc}) [NPC]]]"
        },
        "5econ": {
          "name": "CON Save",
          "formula": "[[d20 + ([[d0 + @{constitution_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_con_save}*@{npc}) [NPC]]]"
        },
        "5eint": {
          "name": "INT Save",
          "formula": "[[d20 + ([[d0 + @{intelligence_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_int_save}*@{npc}) [NPC]]]"
        },
        "5ewis": {
          "name": "WIS Save",
          "formula": "[[d20 + ([[d0 + @{wisdom_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_wis_save}*@{npc}) [NPC]]]"
        },
        "5echa": {
          "name": "CHA Save",
          "formula": "[[d20 + ([[d0 + @{charisma_save_bonus}@{pbd_safe}]]*(1-@{npc})) [PC] + (@{npc_cha_save}*@{npc}) [NPC]]]"
        },
        "pf1fort": {
          "name": "FORT Save",
          "formula": "[[1d20+@{fortitude}[MOD]+(@{saves_condition})[CONDITION]+@{rollmod_save}[QUERY]]]"
        },
        "pf1ref": {
          "name": "REF Save",
          "formula": "[[1d20+@{reflex}[MOD]+(@{saves_condition})[CONDITION]+@{rollmod_save}[QUERY]]]"
        },
        "pf1will": {
          "name": "WILL Save",
          "formula": "[[1d20+@{will}[MOD]+(@{saves_condition})[CONDITION]+@{rollmod_save}[QUERY]]]"
        },
        "pf2fort": {
          "name": "FORT Save",
          "formula": "[[1d20cs20cf1 + [@{saving_throws_fortitude_proficiency_display}] (@{saving_throws_fortitude})[@{text_modifier}] + (@{query_roll_bonus})[@{text_bonus}]]]"
        },
        "pf2ref": {
          "name": "REF Save",
          "formula": "[[1d20cs20cf1 + [@{saving_throws_reflex_proficiency_display}] (@{saving_throws_reflex})[@{text_modifier}] + (@{query_roll_bonus})[@{text_bonus}]]]"
        },
        "pf2will": {
          "name": "WILL Save",
          "formula": "[[1d20cs20cf1 + [@{saving_throws_will_proficiency_display}] (@{saving_throws_will})[@{text_modifier}] + (@{query_roll_bonus})[@{text_bonus}]]]"
        },
        "pfcfort": {
          "name": "FORT Save",
          "formula": "[[1d20+@{total-Fort}[tot]+@{Fort-ability-mod}[mod]+@{Fort-trait}[trait]+@{Fort-resist}[res]+@{Fort-misc-mod}[misc]+@{saves-cond}[cond]+@{buff_Fort-total}[buff1]+@{buff_saves-total}[buff2]]]"
        },
        "pfcref": {
          "name": "REF Save",
          "formula": "[[1d20+@{total-Ref}[tot]+@{Ref-ability-mod}[mod]+@{Ref-trait}[trait]+@{Ref-resist}[res]+@{Ref-misc-mod}[misc]+@{saves-cond}[cond]+@{buff_Ref-total}[buff1]+@{buff_saves-total}[buff2]]]"
        },
        "pfcwill": {
          "name": "WILL Save",
          "formula": "[[1d20+@{total-Will}[tot]+@{Will-ability-mod}[mod]+@{Will-trait}[trait]+@{Will-resist}[res]+@{Will-misc-mod}[misc]+@{saves-cond}[cond]+@{buff_Will-total}[buff1]+@{buff_saves-total}[buff2]]]"
        },
        "custom": {
          "name": "",
          "formula": ""
        }
    }
    const htmlReplace = (str, weak) => {
        const entities = {
            "<": "lt",
            ">": "gt",
            "'": "#39",
            "@": "#64",
            "{": "#123",
            "|": "#124",
            "}": "#125",
            "[": "#91",
            "\"": "quot",
            "]": "#93",
            "*": "#42",
            "&": "amp",
        };
        const regExp = weak ? /['"@{|}[*&\]]/g : /[<>'"@{|}[*&\]]/g;
        return str.replace(regExp, c => ("&" + entities[c] + ";"));
    } 
    
    const makeInlineroll = (roll, hideformula) => {
          const boundary = results => {
            switch (detectCritical(results)) {
            case "crit":
              return ";border:2px solid #3FB315";
            case "mixed":
              return ";border:2px solid #4A57ED";
            case "fumble":
              return ";border:2px solid #B31515";
            default:
              return "";
            }
          };
          //let background = highlight ? 'background-color: #FEF68E;' : ';';
          let background = 'background-color: #FEF68E'
          return "<span " +
            (hideformula ? "" : `class="showtip tipsy" title="Rolling ${htmlReplace(roll.expression)} = ${rollToText(roll.results)}" `) +
            `style="display:inline-block;min-width:1em;color:#000000;font-size:1.2em;font-weight:bold;padding:0 3px;vertical-align:middle;${background}; ` +
            `cursor:${hideformula ? "default" : "help"}${boundary(roll.results)}">${roll.results.total || "0"}</span>`;
        }
    const rollToText = (roll) => {
          switch (roll.type) {
          case "R":
          {
            const c = (roll.mods && roll.mods.customCrit) || [{
                comp: "==",
                point: roll.sides
              }],
              f = (roll.mods && roll.mods.customFumble) || [{
                comp: "==",
                point: 1
              }],
              styledRolls = roll.results.map(r => {
                const style = rollIsCrit(r.v, c[0].comp, c[0].point) ?
                  " critsuccess" :
                  (rollIsCrit(r.v, f[0].comp, f[0].point) ? " critfail" : "");
                return `<span class='basicdiceroll${style}'>${r.v}</span>`;
              });
            return `(${styledRolls.join("+")})`;
          }
          case "M":
            return roll.expr.toString().replace(/(\+|-)/g, "$1 ").replace(/\*/g, "&" + "ast" + ";");
          case "V":
            return roll.rolls.map(rollToText).join(" ");
          case "G":
            return `'(${roll.rolls.map(a => a.map(rollToText).join(" ")).join(" ")})`;
          default:
            return "";
          }
        }
    const detectCritical = (roll) => {
          let s = [];
          if (roll.type === "V") s = (roll.rolls || []).map(detectCritical);
          if (roll.type === "G") s = _.flatten(roll.rolls || []).map(detectCritical);
          if (roll.type === "R") {
            const crit = (roll.mods && roll.mods.customCrit) || [{
              comp: "==",
              point: roll.sides || 0
            }];
            const fumble = (roll.mods && roll.mods.customFumble) || [{
              comp: "==",
              point: 1
            }];
            if (roll.results.some(r => rollIsCrit(r.v, crit[0].comp, crit[0].point))) s.push("crit");
            if (roll.results.some(r => rollIsCrit(r.v, fumble[0].comp, fumble[0].point))) s.push("fumble");
          }
          const c = s.includes("crit"),
            f = s.includes("fumble"),
            m = s.includes("mixed") || (c && f);
          return (m ? "mixed" : (c ? "crit" : (f ? "fumble" : (false))));
        }
    const rollIsCrit = (value, comp, point) => {
        switch (comp) {
            case "==":
                return value == point;
            case "<=":
                return value <= point;
            case ">=":
                return value >= point;
        }
    };
    
    const pt = function(x,y) {
        this.x = x;
        this.y = y;
    };
    
    const getCleanImgsrc = function (imgsrc) {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
            if(parts) {
                return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
            }
        return;
    };
    
    async function checkInstall() {
        log(scriptName + ' v' + version + ' initialized.');
        
        //delete state[scriptName];
        
        if( ! _.has(state, scriptName) || state[scriptName].version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state[scriptName] && state[scriptName].version) {
                case 0.1:
                /* falls through */
                case 'UpdateSchemaVersion':
                    state[scriptName].version = schemaVersion;
                    break;

                default:
                    state[scriptName] = {
                        version: schemaVersion,
                        links: []
                    };
                    break;
            }
        }
        //log(state[scriptName]);
        
        //----------------------------------------------------------------------------------
        //  Check for existence of the default control token. Create it if it doesn't exist
        //  Also creates multiple abilities/token actions, plus a collections macro for calling up an AoE Generator chat menu
        //----------------------------------------------------------------------------------
        try {
            let charName = 'AoEControlToken'
            let macroName = 'AoEGenerator'
            let URL = 'https://s3.amazonaws.com/files.d20.io/images/219939338/Q-RiO5B4NhyaPGwc1YMz9w/max.png?1620037815'    //reticle image
            
            let controlTokenChars = findObjs({
                _type: 'character',
                name: charName
            }, {caseInsensitive: true}) || [];
            
            if (controlTokenChars.length === 0) {
                log(`====> From ${scriptName}: The default ${charName} character does not exist! Creating now.`);
                
                let charObj = {
                    avatar: URL,
                    name: charName,
                    inplayerjournals: 'all',
                    controlledby: 'all'
                }
                let newChar = createObj('character', charObj);
                if (newChar) {
                    let charID = newChar.get('_id');
                    let pageID = Campaign().get("playerpageid")
                    
                    //create/set the default token for the control token character
                    let tokObj = {
                        imgsrc: getCleanImgsrc(URL),
                        represents: charID,
                        name: charName,
                        has_bright_light_vision: true,  //UDL
                        light_hassight: true,           //LDL
                        width: 70,
                        height: 70,
                        left: 100,
                        top: 100,
                        layer: "objects",
                        pageid: pageID
                    }
                    
                    let newTok = createObj('graphic', tokObj)
                    if (newTok) {
                        setDefaultTokenForCharacter(newChar,newTok);
                        newTok.remove();
                    } 
                    
                    //create common abilities for the new character
                    let ability = createObj('ability', {characterid: charID, name: 'CW', action: '!smartrotateorigin cw', istokenaction: true});
                    ability = createObj('ability', {characterid: charID, name: 'CCW', action: '!smartrotateorigin ccw', istokenaction: true});
                    ability = createObj('ability', {characterid: charID, name: 'Trigger-ALL', action: '!smarttrigger', istokenaction: true});
                    ability = createObj('ability', {characterid: charID, name: 'Trigger-Target', action: '!smartquery @{target|Choose a Target|token_id}', istokenaction: true});
                    //Square, float
                    ability = createObj('ability', {characterid: charID, name: '5ft-Square', action: '!smartaoe {{\n  --aoeType|square, float\n  --radius|2.5ft\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '10ft-Square', action: '!smartaoe {{\n  --aoeType|square, float\n  --radius|5ft\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '20ft-Square', action: '!smartaoe {{\n  --aoeType|square, float\n  --radius|10ft\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '30ft-Square', action: '!smartaoe {{\n  --aoeType|square, float\n  --radius|15ft\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '40ft-Square', action: '!smartaoe {{\n  --aoeType|square, float\n  --radius|20ft\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: 'Variable-Square', action: '!smartaoe {{\n  --aoeType|square\n  --fx|burn-fire\n}}', istokenaction: false});
                    //Circle, float
                    ability = createObj('ability', {characterid: charID, name: '5ft-Circle', action: '!smartaoe {{\n  --aoeType|circle, float\n  --radius|2.5ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '10ft-Circle', action: '!smartaoe {{\n  --aoeType|circle, float\n  --radius|5ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '20ft-Circle', action: '!smartaoe {{\n  --aoeType|circle, float\n  --radius|10ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '30ft-Circle', action: '!smartaoe {{\n  --aoeType|circle, float\n  --radius|15ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '40ft-Circle', action: '!smartaoe {{\n  --aoeType|circle, float\n  --radius|20ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: 'Variable-Circle', action: '!smartaoe {{\n  --aoeType|circle\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    //PF circle, float
                    ability = createObj('ability', {characterid: charID, name: '5ft-PF-Circle', action: '!smartaoe {{\n  --aoeType|PFcircle, float\n  --radius|2.5ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '10ft-PF-Circle', action: '!smartaoe {{\n  --aoeType|PFcircle, float\n  --radius|5ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '20ft-PF-Circle', action: '!smartaoe {{\n  --aoeType|PFcircle, float\n  --radius|10ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '30ft-PF-Circle', action: '!smartaoe {{\n  --aoeType|PFcircle, float\n  --radius|15ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '40ft-PF-Circle', action: '!smartaoe {{\n  --aoeType|PFcircle, float\n  --radius|20ft\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: 'Variable-PF-Circle', action: '!smartaoe {{\n  --aoeType|PFcircle\n  --minGridArea|0.5\n  --fx|burn-fire\n}}', istokenaction: false});
                    //Centered on Caster, square
                    ability = createObj('ability', {characterid: charID, name: '5ft-Square-Caster', action: '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|5ft\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '10ft-Square-Caster', action: '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|10ft\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '15ft-Square-Caster', action: '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|15ft\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '20ft-Square-Caster', action: '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|20ft\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '30ft-Square-Caster', action: '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|30ft\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '40ft-Square-Caster', action: '!smartaoe {{\n  --aoeType|square, float\n  --controlTokName|self\n  --radius|40ft\n  --forceIntersection|0\n}}', istokenaction: false});
                    //Centered on Caster, circle
                    ability = createObj('ability', {characterid: charID, name: '5ft-Circle-Caster', action: '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|5ft\n  --minGridArea|0.5\n --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '10ft-Circle-Caster', action: '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|10ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '15ft-Circle-Caster', action: '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|15ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '20ft-Circle-Caster', action: '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|20ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '30ft-Circle-Caster', action: '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|30ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '40ft-Circle-Caster', action: '!smartaoe {{\n  --aoeType|circle, float\n  --controlTokName|self\n  --radius|40ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    //Centered on Caster, PF circle
                    ability = createObj('ability', {characterid: charID, name: '5ft-PF-Circle-Caster', action: '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|5ft\n  --minGridArea|0.5\n --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '10ft-PF-Circle-Caster', action: '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|10ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '15ft-PF-PF-Circle-Caster', action: '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|15ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '20ft-PF-PF-Circle-Caster', action: '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|20ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '30ft-PF-Circle-Caster', action: '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|30ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '40ft-PF-Circle-Caster', action: '!smartaoe {{\n  --aoeType|PFcircle, float\n  --controlTokName|self\n  --radius|40ft\n  --minGridArea|0.5\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    //Lines
                    ability = createObj('ability', {characterid: charID, name: '30ft-Line', action: '!smartaoe {{\n  --aoeType|line\n  --radius|30ft\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '60ft-Line', action: '!smartaoe {{\n  --aoeType|line\n  --radius|60ft\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '100ft-Line', action: '!smartaoe {{\n  --aoeType|line\n  --radius|100ft\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: 'Variable-Line', action: '!smartaoe {{\n  --aoeType|line\n  --fx|burn-fire\n}}', istokenaction: false});
                    //5e cones
                    ability = createObj('ability', {characterid: charID, name: '15ft-5eCone', action: '!smartaoe {{\n  --aoeType|5econe\n  --radius|15ft\n  --origin|nearest, face\n  --minGridArea|0.25\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '30ft-5eCone', action: '!smartaoe {{\n  --aoeType|5econe\n  --radius|30ft\n  --origin|nearest, face\n  --minGridArea|0.25\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '60ft-5eCone', action: '!smartaoe {{\n  --aoeType|5econe\n  --radius|60ft\n  --origin|nearest, face\n  --minGridArea|0.25\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: 'Variable-5eCone', action: '!smartaoe {{\n  --aoeType|5econe\n  --origin|nearest,face\n  --minGridArea|0.25\n  --fx|burn-fire\n}}', istokenaction: false});
                    //PF cones                                                                          
                    ability = createObj('ability', {characterid: charID, name: '15ft-PFCone', action: '!smartaoe {{\n  --aoeType|PFcone\n  --radius|15ft\n  --origin|nearest, face\n  --forceIntersection|0\n  --minGridArea|0.50\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '30ft-PFCone', action: '!smartaoe {{\n  --aoeType|PFcone\n  --radius|30ft\n  --origin|nearest\n  --forceIntersection|1\n --minGridArea|0.50\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '60ft-PFCone', action: '!smartaoe {{\n  --aoeType|PFcone\n  --radius|60ft\n  --origin|nearest\n  --forceIntersection|1\n --minGridArea|0.50\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: 'Variable-PFCone', action: '!smartaoe {{\n  --aoeType|PFcone\n  --origin|nearest\n  --forceIntersection|1\n --minGridArea|0.50\n  --fx|burn-fire\n}}', istokenaction: false});
                    //Normal cones, user enters cone angle
                    ability = createObj('ability', {characterid: charID, name: '15ft-Cone', action: '!smartaoe {{\n  --aoeType|cone, ?{Enter cone angle|90}\n  --radius|15ft\n  --minGridArea|0.50\n  --origin|nearest, face\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '30ft-Cone', action: '!smartaoe {{\n  --aoeType|cone, ?{Enter cone angle|90}\n  --radius|30ft\n  --minGridArea|0.50\n  --origin|nearest, face\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: '60ft-Cone', action: '!smartaoe {{\n  --aoeType|cone, ?{Enter cone angle|90}\n  --radius|60ft\n  --minGridArea|0.50\n  --origin|nearest, face\n  --forceIntersection|0\n  --fx|burn-fire\n}}', istokenaction: false});
                    ability = createObj('ability', {characterid: charID, name: 'Variable-Cone', action: '!smartaoe {{\n  --aoeType|cone, ?{Enter cone angle|90}\n  --minGridArea|0.50\n  --origin|nearest, face\n  --forceIntersection|1\n  --fx|burn-fire\n}}', istokenaction: false});

                    log(`====> From ${scriptName}: Character (${charName}) was created.`);
                    sendChat(scriptName,`/w gm \`\`SmartAoE has generated character (${charName}) with default token and abilities, for use as a control token.\`\``)
                }
            }
            
            let menuMacros = findObjs({
                _type: 'macro',
                name: macroName
            }, {caseInsensitive: true}) || [];
            
            if (menuMacros.length === 0) {
                log(`====> From ${scriptName}: Creating collections macro: ${macroName}`);
                
                let arrow = `🏹`;
                let explosion = `💥`;
                
                let actionText = `/w gm &{template:default}{{name=AoE Generator}} {{${arrow}${arrow}&nbsp;***CAST AT RANGE*** ${arrow}${arrow}&nbsp;\n` +
                    `**_____Square / Cube______**&nbsp;\n` +
                    `[5ft](~AoEControlToken|5ft-Square) [10ft](~AoEControlToken|10ft-Square) [20ft](~AoEControlToken|20ft-Square) [30ft](~AoEControlToken|30ft-Square) [40ft](~AoEControlToken|40ft-Square)\n` +
                    `**_____Circle / Sphere______**&nbsp;\n` +
                    `[5ft](~AoEControlToken|5ft-Circle) [10ft](~AoEControlToken|10ft-Circle) [20ft](~AoEControlToken|20ft-Circle) [30ft](~AoEControlToken|30ft-Circle) [40ft](~AoEControlToken|40ft-Circle)\n` +
                    `**____PF Circle / Sphere____**&nbsp;\n` +
                    `[5ft](~AoEControlToken|5ft-PF-Circle) [10ft](~AoEControlToken|10ft-PF-Circle) [20ft](~AoEControlToken|20ft-PF-Circle) [30ft](~AoEControlToken|30ft-PF-Circle) [40ft](~AoEControlToken|40ft-PF-Circle)\n` +
                    `------------------------------------------\n` +
                    `((${explosion})) ***FROM CASTER*** ((${explosion}))&nbsp;&nbsp;\n` +
                    `**_____Square / Cube______**&nbsp;\n` +
                    `[5ft](~AoEControlToken|5ft-Square-Caster) [10ft](~AoEControlToken|10ft-Square-Caster) [15ft](~AoEControlToken|15ft-Square-Caster) [20ft](~AoEControlToken|20ft-Square-Caster) [30ft](~AoEControlToken|30ft-Square-Caster)\n` +
                    `[40ft](~AoEControlToken|40ft-Square-Caster) [Variable](~AoEControlToken|Variable-Square)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n` +
                    `**_____Circle / Sphere______**&nbsp;\n` +
                    `[5ft](~AoEControlToken|5ft-Circle-Caster) [10ft](~AoEControlToken|10ft-Circle-Caster) [15ft](~AoEControlToken|15ft-Circle-Caster) [20ft](~AoEControlToken|20ft-Circle-Caster) [30ft](~AoEControlToken|30ft-Circle-Caster)\n` +
                    `[40ft](~AoEControlToken|40ft-Circle-Caster) [Variable](~AoEControlToken|Variable-Circle)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n` +
                    `**____PF Circle / Sphere____**&nbsp;\n` +
                    `[5ft](~AoEControlToken|5ft-PF-Circle-Caster) [10ft](~AoEControlToken|10ft-PF-Circle-Caster) [15ft](~AoEControlToken|15ft-PF-Circle-Caster) [20ft](~AoEControlToken|20ft-PF-Circle-Caster) [30ft](~AoEControlToken|30ft-PF-Circle-Caster)\n` +
                    `[40ft](~AoEControlToken|40ft-PF-Circle-Caster) [Variable](~AoEControlToken|Variable-PF-Circle)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n` +
                    `**__________Line__________**&nbsp;\n` +
                    `[30ft](~AoEControlToken|30ft-Line) [60ft](~AoEControlToken|60ft-Line) [100ft](~AoEControlToken|100ft-Line) [Variable](~AoEControlToken|Variable-Line)\n` +
                    `**_______Cone (Query)______**\n` +
                    `[15ft](~AoEControlToken|15ft-Cone) [30ft](~AoEControlToken|30ft-Cone) [60ft](~AoEControlToken|60ft-Cone) [Variable](~AoEControlToken|Variable-Cone)\n` +
                    `**_________5e-Cone________**\n` +
                    `[15ft](~AoEControlToken|15ft-5eCone) [30ft](~AoEControlToken|30ft-5eCone) [60ft](~AoEControlToken|60ft-5eCone) [Variable](~AoEControlToken|Variable-5eCone)\n` +
                    `**_________PF-Cone________**\n` +
                    `[15ft](~AoEControlToken|15ft-PFCone) [30ft](~AoEControlToken|30ft-PFCone) [60ft](~AoEControlToken|60ft-PFCone) [Variable](~AoEControlToken|Variable-PFCone)\n` +
                    `}}`
                
                let players = findObjs({_type:"player"}).filter(p => playerIsGM(p.get('_id')));
                let gmID = players[0].get('_id');
                
                let macro = createObj('macro', {playerid: gmID, name: macroName, visibleto: gmID, action: actionText})
                
                if(macro) {
                    log(`====> From ${scriptName}: Collections macro (${macroName}) was created.`);
                    sendChat(scriptName,`/w gm \`\`SmartAoE has created a collections macro named (${macroName}). You may want to trim down the options depending on your game system of choice. \`\``)
                } else {
                    log(`====> From ${scriptName}: Failed to create collections macro (${macroName}).`);
                    sendChat(scriptName,`/w gm \`\`SmartAoE failed to create a collections macro named (${macroName}) \`\``)
                }
                
            }
        }
        catch(err) {
          log(`Error creating character ${charName} and/or macro ${macroName}: ${err.message}`);
        }
        
    };
    
    const toFullColor = function(htmlstring, defaultAlpha = 'ff') {
        let s=htmlstring.toLowerCase().replace(/[^0-9a-f]/,'');
        switch(s.length){
            case 3:
                s=`${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}${defaultAlpha}`;
                break;
            case 4:
                s=`${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
                break;
            case 6:
                s=`${s}${defaultAlpha}`;
                break;
        }
        return `#${s}`;
    };
    
    const clearCache = function(who, tokID=undefined, pageID=undefined) {
        let whisperString = `/w ${who}`;
        //no arguments passed, clear all linked pairs in ENTIRE CAMPAIGN
        if(!tokID && !pageID) {
            state[scriptName] = {
                version: schemaVersion,
                links: []
            };
            //if (!silent) {
                //sendChat(scriptName,`/w "${who}" `+ 'SmartAoE paths unlinked!');
            //}
            return;
        }
        
        //token only
        if (tokID) {
            //iterate through linked pairs in state object to find pairs associated with tokID
            for (let i = state[scriptName].links.length-1; i>-1; i--) {
                if (state[scriptName].links[i].tokID === tokID) {
                    //remove linked pair ids from state object
                    state[scriptName].links.splice(i,1);
                    sendChat(scriptName,`${whisperString} SmartAoE paths unlinked for tokID = ${tokID}`);
                }
            }
        } 
        
        //all linked tokens in current page
        if (pageID) {
            //iterate through linked pairs in state object to find pairs associated with pageID
            for (let i = state[scriptName].links.length-1; i>-1; i--) {
                if (state[scriptName].links[i].pageID === pageID) {
                    //remove linked pair ids from state object
                    state[scriptName].links.splice(i,1);
                }
            }
            sendChat(scriptName,`${whisperString} SmartAoE paths unlinked for all tokens in pageID = ${pageID}`);
        } 
        //log(state[scriptName]);
    }
    
    const updateAoELink = function(linkIndex, pathIDs, originIndex, boundingBox) {
    //const updateAoELink = function(linkIndex, pathIDs, originIndex) {
        //clear old paths from memory
        //log('updating AoELink, index=' + index);
        //log('new pathIDs = next');
        //log(pathIDs);
        //log('state before update');
        //log(state[scriptName]);
        
        //log('updating AoELink');
        
        //state[scriptName].links[linkIndex].pathIDs = [];
        state[scriptName].links[linkIndex].pathIDs = pathIDs.map((x) => x);
        state[scriptName].links[linkIndex].originIndex = originIndex;
        state[scriptName].links[linkIndex].boundingBox = boundingBox;
        //log('state after update');
        //log(state[scriptName]);
    }
    
    const makeAoELink = function(controlTokName, controlTokID, aoeType, coneWidth, aoeFloat, instant, forceIntersection, aoeColor, aoeOutlineColor, gridColor, radius, wallWidth, originType, originPt, minGridArea, minTokArea, originTokID, pathIDs, pageID, fxType, saveFormula, saveName, ignoreAttr, ignoreVal, DC, noSave, damageBar, autoApply, damageFormula1, damageFormula2, damageBase1, damageBase2, damageType1, damageType2, rollDamage1, rollDamage2, damageSaveRule, resistanceRule, vulnerableRule, immunityRule, resistAttrs, vulnerableAttrs, immunityAttrs, conditionPass, conditionFail, zeroHPmarker, removeAtZero, hideNames, cardParameters) {
    //const makeAoELink = function(aoeType, aoeColor, radius, originType, originPt, minGridArea, minTokArea, originTokID, controlTokID, pathIDs, pageID, fxType, saveFormula, saveName, DC) {
        //log(originTokID + ',' + controlTokID + ',' + pathIDs + ',' + pageID);
        let pathArr = [];
        pathArr.push(pathIDs);
        let link =  {
            //tokName: state[scriptName].links.length.toString(),
            controlTokID: controlTokID,
            controlTokName: controlTokName,
            aoeType: aoeType,
            coneWidth: coneWidth,
            aoeFloat: aoeFloat,
            instant: instant,
            forceIntersection: forceIntersection,
            aoeColor: aoeColor,
            aoeOutlineColor: aoeOutlineColor,
            gridColor: gridColor,
            radius: radius,
            wallWidth: wallWidth,
            fxType: fxType,
            minGridArea: minGridArea,
            minTokArea: minTokArea,
            pageID: pageID,
            originTokID: originTokID,
            controlTokID: controlTokID,
            boundingBox: [],    //will be array of pts [UL, UR, LR, LL], defined by the min/max x/y of the affected grid squares
            originType: originType,
            originPts: [originPt],
            originIndex: 0,
            pathIDs: pathArr,
            saveFormula: saveFormula,
            saveName: saveName,
            ignoreAttr: ignoreAttr,
            ignoreVal: ignoreVal,
            DC: DC,
            noSave: noSave,
            damageBar: damageBar,
            autoApply: autoApply,
            damageFormula1: damageFormula1, 
            damageFormula2: damageFormula2, 
            damageBase1: damageBase1, 
            damageBase2: damageBase2,
            damageType1: damageType1, 
            damageType2: damageType2, 
            rollDamage1: rollDamage1, 
            rollDamage2: rollDamage2,
            damageSaveRule: damageSaveRule,
            resistanceRule: resistanceRule,
            vulnerableRule: vulnerableRule,
            immunityRule: immunityRule,
            resistAttrs: resistAttrs, 
            vulnerableAttrs: vulnerableAttrs, 
            immunityAttrs: immunityAttrs,
            conditionPass: conditionPass,
            conditionFail: conditionFail,
            zeroHPmarker: zeroHPmarker,
            removeAtZero: removeAtZero,
            hideNames: hideNames,
            cardParameters: cardParameters
        };
        
        state[scriptName].links.push(link);
        return link;
    }
    
    //Return object containing arrays of {[linkObj], [indices]} from state object, given tokenID or pathID based on searchType. Returns undefined if none found. 
    //normally an AoEControlToken id is passed, but a potential target token_id can also be passed (fromTarget=true) to find all AoE's that overlap the target's square
    const getAoELinks = function(ID, fromTarget=false) {
        let linkObjs = [];
        let indices = [];
        
        if (fromTarget) {
            let tok = getObj('graphic', ID);
            let tokX = tok.get("left");
            let tokY = tok.get("top");
            let tokWidth = tok.get("width");
            let tokHeight = tok.get("height");
            let tokArea = tokWidth * tokHeight;
            let tokCorners = getCellCoords(tokX, tokY, tokWidth, tokHeight)
            let pageID = tok.get("_pageid")
            let page = getObj('page', pageID);
            let pageGridIncrement = page.get("snapping_increment");
            
            state[scriptName].links.forEach((link, index) => {
                if (link.pageID === pageID) {
                    let totalOverlapArea = 0;
                    link.pathIDs.forEach(pid => {
                        let path = getObj('path', pid);
                        
                        //only check grid squares, not the outer AoE boundary path
                        if (path.get("width") * path.get("height") <= 4900*pageGridIncrement) {
                            let gridSq = getCellCoords(path.get("left"), path.get("top"), path.get("width"), path.get("height"));
                            let overlapArea = calcRectangleOverlapArea(gridSq, tokCorners);
                            totalOverlapArea += overlapArea;
                        }
                    });
                    if (totalOverlapArea >= link.minTokArea * tokArea) {
                        linkObjs.push(link);
                        indices.push(index);
                    }
                }
            });
        } else {
            state[scriptName].links.forEach((link, index) => {
                if (link.controlTokID === ID || link.originTokID === ID) {
                    linkObjs.push(link);
                    indices.push(index);
                }
            });
        }
        
        if (linkObjs.length>0) {
            let retVal = {
                links: linkObjs,
                indices: indices
            }
            return retVal;
        } else {
            return undefined;
        }
    }
    
    const spawnTokenAtXY =  async function(who, tokenJSON, pageID, spawnX, spawnY, size, controlledby, isDrawing, currentSideNew, numSpawns=1) {
        //let spawnObj;
        let controlTok;
        let controlTok2;
        let controlToks = [];
        let imgsrc;
        let sides;
        let sidesArr;
        let whisperString = `/w ${who}`;
        
        try {
            let baseObj = JSON.parse(tokenJSON);
            
            //set token properties
            baseObj.pageid = pageID;
            baseObj.left = spawnX;
            baseObj.top = spawnY;
            baseObj.width = size;
            baseObj.height = size;
            baseObj.controlledby = controlledby;
            baseObj.isdrawing = isDrawing;
            
            baseObj.imgsrc = getCleanImgsrc(baseObj.imgsrc); //ensure that we're using the thumb.png
            
            //image must exist in personal Roll20 image library 
            if (baseObj.imgsrc ===undefined) {
                sendChat(scriptName,`${whisperString} Unable to find imgsrc for default token of \(${baseObj.name}\)<br> You must use an image file that has been uploaded to your Roll20 Library.`)
                return;
            }
            
            if (baseObj.hasOwnProperty('sides')) {
                sidesArr=baseObj["sides"].split('|');
    
                if ( (currentSideNew !== -999) && (sidesArr[0] !== '') ) {
                    
                    //check for random side
                    if ( isNaN(currentSideNew) ) {
                        currentSideNew = randomInteger(sidesArr.length) - 1;    // Setting to random side. currentSide is 1-based for user
                    } else {
                        currentSideNew = parseInt(currentSideNew) - 1;          //currentSide is 1-based for user
                    }
                    
                    //set the current side (wtih data validation for the requested side)
                    if ( (currentSideNew > 0) || (currentSideNew <= sidesArr.length-1) ) {
                        newSideImg = getCleanImgsrc(sidesArr[currentSideNew]);     //URL of the image
                        baseObj["currentSide"] = currentSideNew;
                        baseObj["imgsrc"] = newSideImg;
                    } else {
                        sendChat('SmartAoE',`/w "${who}" `+ 'Error: Requested index of currentSide is invalid');
                        return retVal;
                    }
                }
            }
            
            controlTok = await createObj('graphic',baseObj);
            controlToks.push(controlTok);
            if (numSpawns === 2) {
                controlTok2 = await createObj('graphic',baseObj);
                controlToks.push(controlTok2);
            }
            return controlToks;
            /*
            return new Promise(resolve => {
                controlTok = createObj('graphic',baseObj);
                if (numSpawns === 2) {
                    return new Promise(resolve2 => {
                        controlTok2 = createObj('graphic',baseObj);
                        resolve2(controlTok2);
                    });
                    controlToks.push(controlTok2);
                }
                controlToks.push(controlTok);
                resolve(controlToks);
            });
            */
            
        }
        catch(err) {
          sendChat('SmartAoE',whisperString + 'Unhandled exception: ' + err.message)
        }
    };
    
    const build5eCone = function(rad, z, coneWidth, coneDirection) {
        let pointsJSON = '';
        let deg2rad = Math.PI/180;
        //see above for details of what "z" is
        //let z = (rad / (2*Math.sin(Math.atan(0.5)))) - rad;
                
        let ptOrigin = new pt(rad+z, rad+z);
        let ptUL = new pt(0,0);
        let ptUR = new pt(2*(rad+z),0);
        let ptLR = new pt(2*(rad+z),2*(rad+z));
        let ptLL = new pt(0,2*(rad+z));
        
        /*
        log('rad = ' + rad);
        log('z = ' + z);
        log(ptOrigin);
        log(ptUL);
        log(ptUR);
        log(ptLR);
        log(ptLL);
        */
        
        let oX = oY = rad + z;
        //normalize rotation to 360deg and find defining angles (converted to radians)
        
        coneDirection = normalizeTo360deg(coneDirection);
        
        //define "cone" angles (in degrees)
        let th1 = deg2rad * (coneDirection - coneWidth/2);  //angle of trailing cone side
        let th2 = deg2rad * (coneDirection + coneWidth/2);  //angle of leading cone side

        //a 5e cone is defined by the orgin and two pts
        let pt1 = get5eConePathPt(rad+z, th1);
        let pt2 = get5eConePathPt(rad+z, th2);
        //let conePtsArr = [ptOrigin, pt1, pt2];
        
        //start path at the origin pt, connect to pts 1&2, then back to origin 
        pointsJSON = `[[\"M\",${ptOrigin.x},${ptOrigin.y}],[\"L\",${pt1.x},${pt1.y}],[\"L\",${pt2.x},${pt2.y}],[\"L\",${ptOrigin.x},${ptOrigin.y}],`;
        //add "phantom" single points to path corresponding to the four corners to keep the size computations correct
        pointsJSON = pointsJSON + `[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}],[\"M\",${ptUR.x},${ptUR.y}],[\"L\",${ptUR.x},${ptUR.y}],[\"M\",${ptLR.x},${ptLR.y}],[\"L\",${ptLR.x},${ptLR.y}],[\"M\",${ptLL.x},${ptLL.y}],[\"L\",${ptLL.x},${ptLL.y}],[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}]]`;
    
        //log(pointsJSON);
        return pointsJSON;
    };
    
    const degreesToRadians = function (degrees) {
        var pi = Math.PI;
        return degrees * (pi/180);
    }
    
    //cx, cy = coordinates of the center of rotation
    //angle = clockwise rotation angle
    //p = point object
    const rotatePoint = function (cX,cY,angle, p){
          s = Math.sin(angle);
          c = Math.cos(angle);
        
          // translate point back to origin:
          p.x -= cX;
          p.y -= cY;
        
          // rotate point
          newX = p.x * c - p.y * s;
          newY = p.x * s + p.y * c;
        
          // translate point back:
          p.x = newX + cX;
          p.y = newY + cY;
          
          return p;
        }
    
    const getWallParams = function (originPtPx, controlPtPx, radius, wallWidth) {
        let rad = radius;
        if (radius === 'variable') {
            rad = distBetweenPts(originPtPx, controlPtPx);
        } 
        
        let wallAngle = getAngle2ControlToken(originPtPx, controlPtPx);
        let wallAngleRad = degreesToRadians(wallAngle);
        
        //get map coords of wall boundary, rotated around the originPt
        //first, get unrotated rectangle corner and center points
        let pt1_0 = new pt( originPtPx.x, originPtPx.y - wallWidth/2 );
        let pt2_0 = new pt( originPtPx.x + rad, originPtPx.y - wallWidth/2 );
        let pt3_0 = new pt( originPtPx.x + rad, originPtPx.y + wallWidth/2 );
        let pt4_0 = new pt( originPtPx.x, originPtPx.y + wallWidth/2 );
        let pCenter_0 = new pt( originPtPx.x + rad/2, originPtPx.y );
        
        
        //then rotate these points around the originPt
        let pt1 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - 90*Math.PI/180, pt1_0);
        let pt2 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - 90*Math.PI/180, pt2_0);
        let pt3 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - 90*Math.PI/180, pt3_0);
        let pt4 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - 90*Math.PI/180, pt4_0);
        let pCenter = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - 90*Math.PI/180, pCenter_0);
        
        
        //now, get dimensions of the rectangle circumscribing the rotated wall rectangle
        let minX = Math.min(pt1.x, pt2.x, pt3.x, pt4.x);
        let maxX = Math.max(pt1.x, pt2.x, pt3.x, pt4.x);
        let minY = Math.min(pt1.y, pt2.y, pt3.y, pt4.y);
        let maxY = Math.max(pt1.y, pt2.y, pt3.y, pt4.y);
        let widthBB = maxX - minX;
        let heightBB = maxY - minY;
        
        //find pts with minX, maxX, minY, MaxY
        let ptsArr = [pt1, pt2, pt3, pt4];
        let pMinX = ptsArr.reduce(function(prev, curr) {
            return prev.x < curr.x ? prev : curr;
        });
        let pMaxX = ptsArr.reduce(function(prev, curr) {
            return prev.x > curr.x ? prev : curr;
        });
        let pMinY = ptsArr.reduce(function(prev, curr) {
            return prev.y < curr.y ? prev : curr;
        });
        let pMaxY = ptsArr.reduce(function(prev, curr) {
            return prev.y > curr.y ? prev : curr;
        });
        
        //here we are going to create a new polygon that is 1px wider on  each side.
        //      This is to help overcome the floating point error issues with the isPointInPolygon function
        let s = 10;
        let tempPt1 = {x:pt1_0.x-s, y:pt1_0.y-s}
        let tempPt2 = {x:pt2_0.x+s, y:pt2_0.y-s}
        let tempPt3 = {x:pt3_0.x+s, y:pt3_0.y+s}
        let tempPt4 = {x:pt4_0.x-s, y:pt4_0.y+s}
        tempPt1 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - 90*Math.PI/180, tempPt1);
        tempPt2 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - 90*Math.PI/180, tempPt2);
        tempPt3 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - 90*Math.PI/180, tempPt3);
        tempPt4 = rotatePoint(originPtPx.x, originPtPx.y, wallAngleRad - 90*Math.PI/180, tempPt4);
        let expandedPolygon = [tempPt1, tempPt2, tempPt3, tempPt4, tempPt1]
        
        //return the critical coords and dimensions (in VTT coordinate system)
        return {
            width: wallWidth,
            angle: wallAngle,
            radius: rad,
            pt1: pt1,   //the corner pts
            pt2: pt2,
            pt3: pt3,
            pt4: pt4,
            pMinX: pMinX,     //corner pt with smallest X value
            pMaxX: pMaxX,     //corner pt with largest X value
            pMinY: pMinY,     //corner pt with smallest Y value
            pMaxY: pMaxY,     //corner pt with largest Y value
            pCenter: pCenter,   //the geometric center of the rotated wall
            widthBB: widthBB,       //the width of the rectangle circumscribing the wall
            heightBB: heightBB,      //the height of the rectangle circumscribing the wall
            expandedPolygon: expandedPolygon    //a rectangle that is 1px wider on each side. This polygon is rotated already
        }
    }
    
    //The bounding box of the path will be a square with side lengths equal to the diagonal of the wall rectangle
    const buildWallPath = function(wallParams) {
        /*
        let diag = 2*Math.sqrt( (len*len+width*width)/4 );
        let ptCenter = new pt(diag/2, diag/2);
        //first, find the coords of path corners when at 0deg rotation
        let ptUL_0 = new pt( (diag-len)/2, (diag-width)/2 );
        let ptUR_0 = new pt( (diag+len)/2, (diag-width)/2 );
        let ptLR_0 = new pt( (diag+len)/2, (diag+width)/2 );
        let ptLL_0 = new pt( (diag-len)/2, (diag+width)/2 );
        
        let angleRad = degreesToRadians(angle-90);
        //now, rotate the four corners around the center of the path bounding box
        let pt1 = rotatePoint(ptCenter.x, ptCenter.y, angleRad, ptUL_0);
        let pt2 = rotatePoint(ptCenter.x, ptCenter.y, angleRad, ptUR_0);
        let pt3 = rotatePoint(ptCenter.x, ptCenter.y, angleRad, ptLR_0);
        let pt4 = rotatePoint(ptCenter.x, ptCenter.y, angleRad, ptLL_0);
        */
        let pt1 = wallParams.pt1;
        let pt2 = wallParams.pt2;
        let pt3 = wallParams.pt3;
        let pt4 = wallParams.pt4;
        //Full rectangle (5 pts - wraps back around to pt1 again)
        let wallPointsJSON = `[[\"M\",${pt1.x},${pt1.y}],[\"L\",${pt2.x},${pt2.y}],[\"L\",${pt3.x},${pt3.y}],[\"L\",${pt4.x},${pt4.y}],[\"L\",${pt1.x},${pt1.y}]]`;
        
        //log(wallPointsJSON);
        return wallPointsJSON;
    };
    
    const buildSquarePath = function(rad) {
        let ptUL = new pt(0,0);
        let ptUR = new pt(2*rad,0);
        let ptLR = new pt(2*rad,2*rad);
        let ptLL = new pt(0,2*rad);
        
        //Full square
        //squarePoints = `[[\"M\",0,0],[\"L\",0,${2*rad}],[\"L\",${2*rad},${2*rad}],[\"L\",${2*rad},0],[\"L\",0,0]]`;
        let squarePointsJSON = `[[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUR.x},${ptUR.y}],[\"L\",${ptLR.x},${ptLR.y}],[\"L\",${ptLL.x},${ptLL.y}],[\"L\",${ptUL.x},${ptUL.y}]]`;
        
        //log(squarePointsJSON);
        return squarePointsJSON;
    };
    
    //Circle building portion of function is modified from TheAaron's "dlcircle" script
    const buildCirclePath = function(rad, coneWidth, coneDirection) {
        let circlePoints;
        let steps, stepSize;
        let deg2rad = Math.PI/180;
        
        steps = Math.min(Math.max(Math.round( (Math.PI*2*Math.sqrt((2*rad*rad)/2))/35),4),20);
        
        const at = (theta) => ({x: Math.cos(theta)*rad, y: Math.sin(theta)*rad}); 
        
        if (coneWidth === 360) { 
            //Build a full circle
            stepSize = Math.PI/(2*steps);
            
            let acc=[[],[],[],[]];
            let th=0;
            _.times(steps+1,()=>{
                let pt=at(th);
                acc[0].push([pt.x,pt.y]);
                acc[1].push([-pt.x,pt.y]);
                acc[2].push([-pt.x,-pt.y]);
                acc[3].push([pt.x,-pt.y]);
                th+=stepSize;
            });
            acc = acc[0].concat(
                acc[1].reverse().slice(1),
                acc[2].slice(1),
                acc[3].reverse().slice(1)
            );
            
            //Some js wizardry from TheAaron with the array map function. I couldn't make it work without returning the outer (1st & last) square brackets
            //So, we will take this string, strip the last "]", then append the grid points to the path
            circlePoints = JSON.stringify(acc.map((v,i)=>([(i?'L':'M'),rad+v[0],rad+v[1]])));
            circlePoints = circlePoints.substring(0, circlePoints.length - 1);
        } else {
            //build a cone instead
            steps = 50;
            stepSize = deg2rad * (coneWidth/(steps));
            
            let oX = oY = rad;
            let x, y;
            let startAngle = deg2rad * (coneDirection - coneWidth/2);
            let endAngle = deg2rad * (coneDirection + coneWidth/2);
            let ptUL = new pt(0,0);
            let ptUR = new pt(2*rad,0);
            let ptLR = new pt(2*rad,2*rad);
            let ptLL = new pt(0,2*rad);
            
            //start path at the origin pt 
            circlePoints = `[[\"M\",${oX},${oY}],`;
            
            //for loop takes into account cumulative floating point precision error
            for (let th=startAngle; th<endAngle+Number.EPSILON*steps; th+=stepSize) {
                //change in "normal" polar coord conversion due to 0deg being straight up and positive Y being "down"
                x = oX + oX * Math.sin(th);
                y = oY + oY * Math.cos(th + deg2rad*180);
                circlePoints = circlePoints + `[\"L\",${x},${y}],`
            }
            
            //connect back to the origin pt
            circlePoints = circlePoints + `[\"L\",${oX},${oY}],`;
            //add "phantom" single points to path corresponding to the four corners to keep the size computations correct
            circlePoints = circlePoints + `[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}],[\"M\",${ptUR.x},${ptUR.y}],[\"L\",${ptUR.x},${ptUR.y}],[\"M\",${ptLR.x},${ptLR.y}],[\"L\",${ptLR.x},${ptLR.y}],[\"M\",${ptLL.x},${ptLL.y}],[\"L\",${ptLL.x},${ptLL.y}],[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}]`;
        }
        
        //return  the path JSON
        return circlePoints + "]";
    };
    
    async function deleteLinkedPaths (pathIDs) {
        //delete the linked paths and clear the pathIDs array from the state object
        //log('entered deleteLinkedPaths function')
        //log(pathIDs);
        //log(pathIDs.length);
        pathIDs.forEach((pathID) => {
            //log('this pathID = ' + pathID)
            path = getObj('path',pathID);
            if (path) {
                //log('removing path ' + pathID);
                path.remove();
                path = getObj('path',pathID);
                //log(path);
            }  
        });
        /*
        state[scriptName].links[index].pathIDs.forEach((pathID) => {
          path = getObj('path',pathID);
            if (path) {
                path.remove();
            }  
        });
        //state[scriptName].links[index].pathIDs = [];
        return new Promise(resolve => {
            log('delete done');
            resolve('done');
        });
        */
        //log(state[scriptName]);
    }
    
    const createPath = function(pathstring, pageID, layer, fillColor, strokeColor, strokeWidth, height, width, left, top) {
        //let promise = new Promise(resolve => {
            //log('about to create path');
            
                let path = createObj("path", {                
                    pageid: pageID,
                    path: pathstring,
                    fill: fillColor,
                    stroke: strokeColor,
                    layer: layer,
                    stroke_width: strokeWidth,
                    width: width,
                    height: height,
                    left: left,
                    top: top
                });
                return path
                
                //resolve(path);
            
        //});
        
        /*
        result = await promise;
        log(result);
        return result;
        */
    }
    
    const normalizeTo360deg = function(deg) {
        deg = deg % 360;
        if (deg < 0) {deg += 360;}
        return deg;
    }
    
    const getNewControlPt = function(oPt, rad, angle) {
        let deg2rad = Math.PI/180;
        let smallAngle;
        let retPt;
        
        if (angle === 0) {
            retPt = new pt(oPt.x, oPt.y-rad);
        } else if (angle > 0 && angle < 90) {
            smallAngle = angle*deg2rad;
            retPt =  new pt(oPt.x + rad*Math.sin(smallAngle), oPt.y-rad*Math.cos(smallAngle));
        } else if (angle === 90) {
            retPt =  new pt(oPt.x+rad, oPt.y);
        } else if (angle > 90 && angle < 180) {
            smallAngle = angle*deg2rad - 90*deg2rad;
            retPt =  new pt(oPt.x + rad*Math.cos(smallAngle), oPt.y+rad*Math.sin(smallAngle));
        } else if (angle === 180) {
            retPt =  new pt(oPt.x, oPt.y+rad);
        } else if (angle > 180 && angle < 270) {
            smallAngle = angle*deg2rad - 180*deg2rad;
            retPt =  new pt(oPt.x - rad*Math.sin(smallAngle), oPt.y+rad*Math.cos(smallAngle));
        } else if (angle === 270) {
            retPt =  new pt(oPt.x-rad, oPt.y);
        } else if (angle > 270 && angle < 360) {
            smallAngle = angle*deg2rad - 270*deg2rad;
            retPt =  new pt(oPt.x - rad*Math.cos(smallAngle), oPt.y-rad*Math.sin(smallAngle));
        }
        
        //log(retPt)
        return retPt
    }
    
    const getAngle2ControlToken = function(oPt, cPt) {
        let deg2rad = Math.PI/180;
        let cAngle;     //return value (angle from originPt to controlPt)
        
        let dX = Math.abs(cPt.x - oPt.x);
        let dY = Math.abs(cPt.y - oPt.y);
        let smallAngle = Math.atan(dY / dX);    //this does not take into account the quadrant in which the angle lies. More tests req'd to determine correct relative angle 
        
        if (cPt.x < oPt.x && cPt.y < oPt.y) { //UL quadrant
            cAngle = 270*deg2rad + smallAngle;
        } else if (cPt.x > oPt.x && cPt.y < oPt.y) { //UR quadrant
            cAngle = 90*deg2rad - smallAngle;
        } else if (cPt.x > oPt.x && cPt.y > oPt.y) { //LR quadrant
            cAngle = 90*deg2rad + smallAngle;
        } else if (cPt.x < oPt.x && cPt.y > oPt.y) { //LL quadrant
            cAngle = 270*deg2rad - smallAngle;
        } else if (cPt.x === oPt.x && cPt.y < oPt.y) { //straight up
            cAngle = 0*deg2rad;
        } else if (cPt.x > oPt.x && cPt.y === oPt.y) { //straight right
            cAngle = 90*deg2rad;
        } else if (cPt.x === oPt.x && cPt.y > oPt.y) { //straight down
            cAngle = 180*deg2rad;
        } else if (cPt.x < oPt.x && cPt.y === oPt.y) { //straight left
            cAngle = 270*deg2rad;
        }
        
        return cAngle/deg2rad;  //angle expressed in degrees
        
    }
    
    const convertPtPixels2Units = function(Pt, pageGridIncrement) {
        //let newX = Pt.x / (70 * pageGridIncrement);
        //let newY = Pt.y / (70 * pageGridIncrement);
        let closestCellX = Math.ceil(Pt.x / (70 * pageGridIncrement)) * 70*pageGridIncrement - 35*pageGridIncrement;
        let closestCellY = Math.ceil(Pt.y / (70 * pageGridIncrement)) * 70*pageGridIncrement - 35*pageGridIncrement;
        
        let newX = closestCellX / (70 * pageGridIncrement);
        let newY = closestCellY / (70 * pageGridIncrement);
        //let newX = Math.ceil(Pt.x / (70 * pageGridIncrement)) * 70*pageGridIncrement;
        //let newY = Math.ceil(Pt.y / (70 * pageGridIncrement)) * 70*pageGridIncrement;
        
        let PtInUnits = new pt(newX, newY);
        return PtInUnits
    }
    
    const addWidthToLineCoords = function(obj, pageGridIncrement, angle, width) {
        //if the line is mostly horizontal, then add width to the top/bottom
        //if the line is mostly vertical, then add width to the left/right
        let newXVals = [];
        let newYVals = [];
        let posNeg = 1;
        
        //default is one square width (70px)
        let numExtraSquares = Math.floor((width - 70*pageGridIncrement) / (70*pageGridIncrement));
        
        if ( (angle > 315 && angle <= 360) || (angle >= 0 && angle <= 45)|| (angle > 135 && angle <= 225) ) {
            //vertical, add to width
            for(let i=0; i<numExtraSquares; i++) {
                posNeg = i % 2 == 0 ? 1 : -1 
                obj.xVals.map(val => {
                    newXVals.push(val + posNeg*70*pageGridIncrement);
                });
                obj.yVals.map(val => {
                    newYVals.push(val);
                });
            }
        } else if ( (angle > 45 && angle <= 135) || (angle > 225 && angle <= 315) ) {
            //horizontal, add to height
            for(let i=0; i<numExtraSquares; i++) {
                posNeg = i % 2 == 0 ? 1 : -1 
                obj.xVals.map(val => {
                    newXVals.push(val);
                });
                obj.yVals.map(val => {
                    newYVals.push(val + posNeg*70*pageGridIncrement);
                });
            }
        }
        
        obj.xVals = obj.xVals.concat(newXVals);
        obj.yVals = obj.yVals.concat(newYVals);
        return obj;
    }
    
    const convertLocationsArrUnits2Pixels = function(obj, pageGridIncrement) {
        let newX = obj.xVals.map(val => val * 70 * pageGridIncrement)
        let newY = obj.yVals.map(val => val * 70 * pageGridIncrement)
        return {xVals: newX, yVals: newY};
    }
    
    const getLineLocations = function (x1, y1, x2, y2, pageGridIncrement, width) {
        let lineCoords = {
            xVals: [],
            yVals: []
        }
        // Iterators, counters required by algorithm
        let x, y, dx, dy, dx1, dy1, px, py, xe, ye, i;
        // Calculate line deltas
        dx = x2 - x1;
        dy = y2 - y1;
        // Create a positive copy of deltas (makes iterating easier)
        dx1 = Math.abs(dx);
        dy1 = Math.abs(dy);
        //log('dx1 = ' + dx1 + 'dy1 = ' + dy1);
        // Calculate error intervals for both axis
        px = 2 * dy1 - dx1;
        py = 2 * dx1 - dy1;
        // The line is X-axis dominant
        if (dy1 <= dx1) {
            // Line is drawn left to right
            if (dx >= 0) {
                x = x1; y = y1; xe = x2;
            } else { // Line is drawn right to left (swap ends)
                x = x2; y = y2; xe = x1;
            }
            //pixel(x, y); // Draw first pixel
            lineCoords.xVals.push(x);
            lineCoords.yVals.push(y);
            // Rasterize the line
            for (i = 0; x < xe; i++) {
                //log(i + ', ' + x + ', ' + xe);
                x = x + 1;
                // Deal with octants...
                if (px < 0) {
                    px = px + 2 * dy1;
                } else {
                    if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                        y = y + 1;
                    } else {
                        y = y - 1;
                    }
                    px = px + 2 * (dy1 - dx1);
                }
                // Draw pixel from line span at
                // currently rasterized position
                //pixel(x, y);
                lineCoords.xVals.push(x);
                lineCoords.yVals.push(y);
            }
        } else { // The line is Y-axis dominant
            // Line is drawn bottom to top
            if (dy >= 0) {
                x = x1; y = y1; ye = y2;
            } else { // Line is drawn top to bottom
                x = x2; y = y2; ye = y1;
            }
            //pixel(x, y); // Draw first pixel
            lineCoords.xVals.push(x);
            lineCoords.yVals.push(y);
            
            // Rasterize the line
            for (i = 0; y < ye; i++) {
                y = y + 1;
                // Deal with octants...
                if (py <= 0) {
                    py = py + 2 * dx1;
                } else {
                    if ((dx < 0 && dy<0) || (dx > 0 && dy > 0)) {
                        x = x + 1;
                    } else {
                        x = x - 1;
                    }
                    py = py + 2 * (dx1 - dy1);
                }
                // Draw pixel from line span at
                // currently rasterized position
                lineCoords.xVals.push(x);
                lineCoords.yVals.push(y);
            }
        }
        
        lineCoords = convertLocationsArrUnits2Pixels(lineCoords, pageGridIncrement)
        
        /*
        if (width !== 70*pageGridIncrement) {
            let angle = Math.atan2(dy, dx);
            angle *= 180 / Math.PI;
            angle -= 270;
            do {
              angle = 360 + angle
            } while (angle < 0);
            lineCoords = addWidthToLineCoords(lineCoords, pageGridIncrement, angle, width)
        }
        */
        //log('lineCoords follows');
        //log(lineCoords);
        return lineCoords;
    }
    
    
    const distBetweenPts = function(pt1, pt2, calcType='Euclidean', gridIncrement=-999, scaleNumber=-999) {
        let distPx;     //distance in Pixels
        let distUnits;  //distance in units (gridded maps only)
        if (calcType === 'PF' && gridIncrement !== -999 & scaleNumber !== -999) {
            //using 'Pathfinder' distance rules, where every other diagonal unit counts as 1.5 units. 
            //..or using 5e diagonal rules where each diag only counts 1 square. 
            //..5e is special due to how t is constructed. We use Euclidean distance to determine if in cone, but we can display in 5e units. 
                //Only compatible with gridded maps
                //convert from pixels to units, do the funky pathfinder math, then convert back to pixels
            let dX = (Math.abs(pt1.x - pt2.x) * scaleNumber / 70) / gridIncrement;
            let dY = (Math.abs(pt1.y - pt2.y) * scaleNumber / 70) / gridIncrement;
            let maxDelta = Math.max(dX, dY);
            let minDelta = Math.min(dX, dY);
            let minFloor1pt5Delta;
            if (calcType === 'PF') {
                //every other diagonal counts as 1.5 squares
                minFloor1pt5Delta = Math.floor(1.5 * minDelta);
            }
            
            
            //log(pt1);
            //log(pt2);
            //log('gridIncrement = ' + gridIncrement);
            //log('scaleNumber = ' + scaleNumber);
            //log('dX = ' + dX);
            //log('dY = ' + dY);
            //log('maxDelta = ' + maxDelta);
            //log('MinDelta = ' + minDelta);
            //log('minFloor1pt5Delta = ' + minFloor1pt5Delta);
            //let temp = maxDelta - minDelta + minFloor1pt5Delta;
            let temp = Math.floor( (maxDelta-minDelta + minFloor1pt5Delta) / scaleNumber ) * scaleNumber
            //log('distU = ' + temp);
            
            
            //convert dist back to pixels
            distUnits = Math.floor( (maxDelta-minDelta + minFloor1pt5Delta) / scaleNumber ) * scaleNumber
            distPx = distUnits * 70 * gridIncrement / scaleNumber; 
            //floor( ( maxDelta-minDelta + minFloor1pt5Delta ) /5  )*5
            
            //log('distP = ' + distPx);
            
            //  [[ floor((([[{abs((@{position-x}-@{target|Target|position-x})*5/70),abs((@{position-y}-@{target|Target|position-y})*5/70)}kh1]]-
            //  [[{abs((@{position-x}-@{target|Target|position-x})*5/70),abs((@{position-y}-@{target|Target|position-y})*5/70)}kl1]])+
            //  floor(1.5*([[{abs((@{position-x}-@{target|Target|position-x})*5/70),abs((@{position-y}-@{target|Target|position-y})*5/70)}kl1]])))/5)*5]]
            
        } else {
            //default Pythagorean theorem
            distPx = Math.sqrt( Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2) );
        }
        
        return distPx;
    }
    
    /*
    const distBetweenPts = function(pt1, pt2) {
        let dist = Math.sqrt( Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2) );
    }
    */
    
    
    function calcPolygonArea(vertices) {
        //vertices is an array of pts
        //NOTE: vertices must be in clockwise or counter-clockwise order for this to work!!!
        let total = 0;
        
        for (let i = 0, l = vertices.length; i < l; i++) {
            let addX = vertices[i].x;
            let addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
            let subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
            let subY = vertices[i].y;
            
            total += (addX * addY * 0.5);
            total -= (subX * subY * 0.5);
        }
        
        return Math.abs(total);
    }
    
    const calcRectangleOverlapArea = function(rect1, rect2) {
        //rect 1&2 are arrays of pts [UL, UR, LR, LL], in that order!
        let x_overlap = Math.max(0, Math.min(rect1[1].x, rect2[1].x) - Math.max(rect1[0].x, rect2[0].x));
        let y_overlap = Math.max(0, Math.min(rect1[3].y, rect2[3].y) - Math.max(rect1[0].y, rect2[0].y));
        return x_overlap * y_overlap;
    } 
    
    const rectanglesOverlap = function(topLeft1, bottomRight1, topLeft2, bottomRight2) {
    	if (topLeft1.x > bottomRight2.x || topLeft2.x > bottomRight1.x) {
    		return false;
    	}
    	if (topLeft1.y > bottomRight2.y || topLeft2.y > bottomRight1.y) {
    		return false;
    	}
    	return true;
    }
    
    /** Get relationship between a point and a polygon using ray-casting algorithm
     * @param {{x:number, y:number}} P: point to check
     * @param {{x:number, y:number}[]} polygon: the polygon
     * @returns true for inside or along edge; false if outside
     */
     //adapted from https://stackoverflow.com/posts/63436180/revisions
    const isPointInPolygon = function(P, polygon) {
        const between = (p, a, b) => p >= a && p <= b || p <= a && p >= b;
        let inside = false;
        for (let i = polygon.length-1, j = 0; j < polygon.length; i = j, j++) {
            const A = polygon[i];
            const B = polygon[j];
            // corner cases
            if (P.x == A.x && P.y == A.y || P.x == B.x && P.y == B.y) return true;
            if (A.y == B.y && P.y == A.y && between(P.x, A.x, B.x)) return true;
    
            if (between(P.y, A.y, B.y)) { // if P inside the vertical range
                // filter out "ray pass vertex" problem by treating the line a little lower
                if (P.y == A.y && B.y >= A.y || P.y == B.y && A.y >= B.y) continue
                // calc cross product `PA X PB`, P lays on left side of AB if c > 0 
                const c = (A.x - P.x) * (B.y - P.y) - (B.x - P.x) * (A.y - P.y)
                if (c == 0) return true;
                if ((A.y < B.y) == (c > 0)) inside = !inside
            }
        }
        //log('inside = ' + inside);
        return inside? true: false;
    }
    
    //*******************************************************************************************************************************
    /* The following is an alternative to the isPointInPolygon function, which appears to be more sensitive to floating point errors
    //*******************************************************************************************************************************
    *
    *       
    *       
    *       
    *       
    */
    //
    function sqr(x) { return x * x }
	function distSquared(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
	function distToSegmentSquared(P, endPt1, endPt2) {
      	var l2 = distSquared(endPt1, endPt2);
      	if (l2 == 0) return distSquared(p, endPt1);
      	var t = ((P.x - endPt1.x) * (endPt2.x - endPt1.x) + (P.y - endPt1.y) * (endPt2.y - endPt1.y)) / l2;
      	t = Math.max(0, Math.min(1, t));
      	return distSquared(P, {x:endPt1.x + t*(endPt2.x-endPt1.x), y:endPt1.y + t*(endPt2.y-endPt1.y)});
	}
	function distToSegment(P, endPt1, endPt2) {
		return Math.sqrt(distToSegmentSquared(P, endPt1, endPt2));
	}  
    const isPointInWall = function(P, polygon){
        //first, look for cases where P lies on one of line segments of the polygon
        for (let i=0;i<polygon.length-1;i+=1) {
            let a = polygon[i];
            let b = polygon[i + 1];
            
            if (distToSegment(P, a, b)<0.1) {
                return true;
            }
        }
        //If not on a line segment, use normal algorithm
        return isPointInPolygon(P, polygon);
    }
    
    
    const isPointInCone = function(pt, oPt, rad, coneDirection, coneWidth, isFlatCone, calcType='Euclidean', gridIncrement=-999, scaleNumber=-999) {
        let deg2rad = Math.PI/180;
        let pAngle;     //the angle between the cone origin and the test pt
        let smallAngle;
        let startAngle = deg2rad * Math.floor(normalizeTo360deg(coneDirection - coneWidth/2));  //round down to nearest degree to account for flotaing pt errors
        let endAngle = deg2rad * Math.ceil(normalizeTo360deg(coneDirection + coneWidth/2));    //round down to nearest degree to account for flotaing pt errors
        let centerAngle = deg2rad * normalizeTo360deg(coneDirection);
        let halfConeWidth = deg2rad * (coneWidth/2);
        let criticalDist;
        
        //special case: Angle calcs will fail when the pt to check is same as origin point - count this as in the cone.
        if (Math.round(pt.x) === Math.round(oPt.x) && Math.round(pt.y) === Math.round(oPt.y)) {
            return true;
        }
        
        // Calculate polar co-ordinates
        let polarRadius;
        
        if (calcType == 'PF' && gridIncrement !== -999 & scaleNumber !== -999) {
            polarRadius = distBetweenPts(oPt, pt, calcType, gridIncrement, scaleNumber)
        } else {
            polarRadius = distBetweenPts(oPt, pt)
        }
        
        let dX = Math.abs(pt.x - oPt.x);
        let dY = Math.abs(pt.y - oPt.y);
        
        //calculate "smallAngle" - this does not take into account the quadrant in which the angle lies. More tests req'd to determine correct relative angle 
        if (dX===0) {
            smallAngle = 90*deg2rad;
        } else {
            smallAngle = Math.atan(dY / dX);
        }
        
        if (pt.x < oPt.x && pt.y < oPt.y) { //UL quadrant
            pAngle = 270*deg2rad + smallAngle;
        } else if (pt.x > oPt.x && pt.y < oPt.y) { //UR quadrant
            pAngle = 90*deg2rad - smallAngle;
        } else if (pt.x > oPt.x && pt.y > oPt.y) { //LR quadrant
            pAngle = 90*deg2rad + smallAngle;
        } else if (pt.x < oPt.x && pt.y > oPt.y) { //LL quadrant
            pAngle = 270*deg2rad - smallAngle;
        } else if (pt.x === oPt.x && pt.y < oPt.y) { //straight up
            pAngle = 0*deg2rad;
        } else if (pt.x > oPt.x && pt.y === oPt.y) { //straight right
            pAngle = 90*deg2rad;
        } else if (pt.x === oPt.x && pt.y > oPt.y) { //straight down
            pAngle = 180*deg2rad;
        } else if (pt.x < oPt.x && pt.y === oPt.y) { //straight left
            pAngle = 270*deg2rad;
        }
        
        //2nd test angle: Add 360deg to pAngle (to handle cases where startAngle is a negative value and endAngle is positive)
        let pAngle360 = pAngle + 360*deg2rad;
        if (endAngle < startAngle) {
            endAngle = endAngle + 360*deg2rad;
        }
        
        /*
        if (Math.round(pt.x)===1190 && Math.round(pt.y)===562) {
            log(pt);
            log(oPt);
            log('coneDirection = ' + coneDirection);
            log('coneWidth = ' + coneWidth);
            log('range = ' + rad);
            log('polarRadius = ' + polarRadius);
            log('startAngle = ' + startAngle/deg2rad);
            log('endAngle = ' + endAngle/deg2rad);
            log('smallAngle = ' + smallAngle/deg2rad);
            log('pAngle = ' + pAngle/deg2rad);
            log('pAngle360 = ' + pAngle360/deg2rad);
        }
        */
        
        if (isFlatCone) {
            //for 5e-style cones. Basically a triangle (no rounded outer face)
            //let z = (rad / (2*Math.sin(Math.atan(0.5)))) - rad;
            dTheta = Math.abs(pAngle - centerAngle);
            //criticalDist = ((rad+z)*Math.cos(halfConeWidth)) / Math.cos(dTheta);
            criticalDist = rad / Math.cos(dTheta);
        } else {
            //compare to full radius cone
            criticalDist = rad
        }
        //log('criticalDist = ' + criticalDist);
        //log('polarRadius = ' + polarRadius);
        
        let err = 1.03;
        //test pAngle and pAngle360 against start/end Angles
        //if ( (pAngle*err >= startAngle) && (pAngle <= endAngle*err) && (polarRadius <= criticalDist*err) ||
        //        (pAngle360*err >= startAngle) && (pAngle360 <= endAngle*err) && (polarRadius <= criticalDist*err) ) {
        if ( (pAngle >= startAngle) && (pAngle <= endAngle) && (polarRadius <= criticalDist*err) ||
                (pAngle360 >= startAngle) && (pAngle360 <= endAngle) && (polarRadius <= criticalDist*err) ) {
           return true;
        } else {
            return false;
        }
    }
    
    
    // Returns intersection of two line segments.
    const getIntersectionPt = function(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
        let s1_x = p1_x - p0_x;
        let s1_y = p1_y - p0_y;
        let s2_x = p3_x - p2_x;
        let s2_y = p3_y - p2_y;
        //log(p0_x + ',' + p0_y + ',' + p1_x + ',' + p1_y + ',' + p2_x + ',' + p2_y + ',' + p3_x + ',' + p3_y)
        
        let s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        let t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
        
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) { 
            // intersection at one point
            let intX = p0_x + (t * s1_x);
            let intY = p0_y + (t * s1_y);
            //return new pt(intX, intY);
            return {x:intX, y:intY}
        //} else if (s1_x===0 & s2_x===0 & ((p0_y<=p2_y & p2_y<=p1_y) || (p1_y<=p2_y & p2_y<=p0_y) || (p0_y<=p3_y & p3_y<=p1_y) || (p1_y<=p3_y & p3_y<=p0_y))) {
        //    // overlapping vertical lines
        //    return 'V_edge'
        //} else if (s1_y===0 & s2_y===0 & ((p0_x<=p2_x & p2_x<=p1_x) || (p1_x<=p2_x & p2_x<=p0_x) || (p0_x<=p3_x & p3_x<=p1_x) || (p1_x<=p3_x & p3_x<=p0_x))) {
        //    // overlapping horizontal lines
        //    return 'H_edge'
        } else {
            // No intersection
            return null; 
        }
    }
    
    const getSlicedSquarePolygon = function(oPt, endPt, i, j, pageGridIncrement) {
        let vertices = []
        let ptUL = new pt(i-35*pageGridIncrement, j-35*pageGridIncrement);
        let ptUR = new pt(i+35*pageGridIncrement, j-35*pageGridIncrement);
        let ptLR = new pt(i+35*pageGridIncrement, j+35*pageGridIncrement);
        let ptLL = new pt(i-35*pageGridIncrement, j+35*pageGridIncrement);
        
        /*
        log('box pts');
        log(ptUL);
        log(ptUR);
        log(ptLR);
        log(ptLL);
        */
        
        let count = 0;
        //go clockwise, check each edge of square for intersection with lines defined by cone angles passed to this function
        //log('upperIntersection args');
        //log(ptUL.x + ',' + ptUL.y + ',' + ptUR.x + ',' + ptUR.y + ',' + oPt.x + ',' + oPt.y + ',' + i + ',' + j)
        let upperIntersection = getIntersectionPt(ptUL.x, ptUL.y, ptUR.x, ptUR.y, oPt.x, oPt.y, endPt.x, endPt.y);
        if (upperIntersection) {
            //log('upperIntersection');
            //vertices.push(ptUL, upperIntersection, ptUR);
            vertices.push(upperIntersection, ptUR);
            count +=1;
        }
        
        let rightIntersection = getIntersectionPt(ptUR.x, ptUR.y, ptLR.x, ptLR.y, oPt.x, oPt.y, endPt.x, endPt.y);
        if (rightIntersection) {
            //log('rightIntersection');
            //log('rightIntersection args');
            //log(ptUR.x + ',' + ptUR.y + ',' + ptLR.x + ',' + ptLR.y + ',' + oPt.x + ',' + oPt.y + ',' + endPt.x + ',' + endPt.y)
            if (count > 0 && upperIntersection) {
                vertices.push(rightIntersection, ptLR);
            } else {
                //vertices.push(ptUR, rightIntersection, ptLR);
                vertices.push(rightIntersection, ptLR);
            }
            count +=1;
        }
        if (count===2) { return vertices }
        
        let bottomIntersection = getIntersectionPt(ptLR.x, ptLR.y, ptLL.x, ptLL.y, oPt.x, oPt.y, endPt.x, endPt.y);
        if (bottomIntersection) {
            //log('bottomIntersection');
            if (count > 0 && rightIntersection) {
                vertices.push(bottomIntersection, ptLL);
            } else {
                //vertices.push(ptLR, bottomIntersection, ptLL);
                vertices.push(bottomIntersection, ptLL);
            }
            count +=1;
        }
        if (count===2) { return vertices }
        
        let leftIntersection = getIntersectionPt(ptLL.x, ptLL.y, ptUL.x, ptUL.y, oPt.x, oPt.y, endPt.x, endPt.y);
        if (leftIntersection) {
            //log('leftIntersection');
            if (count > 0 && leftIntersection) {
                vertices.push(leftIntersection, ptUL);
            } else {
                //vertices.push(ptLL, leftIntersection, ptUL);
                vertices.push(leftIntersection, ptUL);
            }
            count +=1;
        }
        return vertices;
    }
    
    const getConeEndPt = function (oPt, rad, theta) {
        let deg2rad = Math.PI/180;
        //change in "normal" polar coord conversion due to 0deg being straight up and positive Y being "down"
        let x = Math.round(oPt.x + rad * Math.sin(theta));
        let y = Math.round(oPt.y + rad * Math.cos(theta + deg2rad*180));
        return new pt(x,y);
    }
    
    const getConeEndPts2 = function(aoeType, oPt, offsetX, offsetY, coneDirection, coneWidth, rad, z) {
        let pt1, pt2;
        let deg2rad = Math.PI/180;
        
        coneDirection = normalizeTo360deg(coneDirection);
        
        //oPt = {x:oPt.x+offsetX, y:oPt.y+offsetY}
        
        //define "cone" angles (in degrees)
        let th1 = deg2rad * (coneDirection - coneWidth/2);  //angle of trailing cone side
        let th2 = deg2rad * (coneDirection + coneWidth/2);  //angle of leading cone side
        
        if (aoeType === '5econe') {
            //a 5e cone is defined by the orgin and two pts
            pt1 = get5eConePt(oPt, rad+z, th1);
            pt2 = get5eConePt(oPt, rad+z, th2);
            //log(oPt);
            //log(pt1);
            //log(pt2);
        } else {
            //normal cone with equal radius throughout
            pt1 = getConeEndPt(oPt, rad, th1);
            pt2 = getConeEndPt(oPt, rad, th2);
        }
        
        let pts = [oPt, pt1, pt2];
        return pts;
    }
    
    
    const get5eConePt = function (oPt, rad, theta) {
        let deg2rad = Math.PI/180;
        //change in "normal" polar coord conversion due to 0deg being straight up and positive Y being "down"
        let x = Math.round(oPt.x + rad * Math.sin(theta));
        let y = Math.round(oPt.y + rad * Math.cos(theta + deg2rad*180));
        return new pt(x,y);
    }
    const get5eConePathPt = function (rad, theta) {
        let deg2rad = Math.PI/180;
        //change in "normal" polar coord conversion due to 0deg being straight up and positive Y being "down"
        let x = rad + rad * Math.sin(theta);
        let y = rad + rad * Math.cos(theta + deg2rad*180);
        return new pt(x,y);
    }
    
    const getConeEndPts = function(aoeType, oPt, coneDirection, coneWidth, rad, z) {
        let pt1, pt2;
        let deg2rad = Math.PI/180;
        
        //log('in getConeEndPts');
        coneDirection = normalizeTo360deg(coneDirection);
        //log('normalized coneDirection = ' + coneDirection);
        //define "cone" angles (in degrees)
        let th1 = deg2rad * (coneDirection - coneWidth/2);  //angle of trailing cone side
        let th2 = deg2rad * (coneDirection + coneWidth/2);  //angle of leading cone side
        
        if (aoeType === '5econe') {
            //a 5e cone is defined by the orgin and two pts
            //log('calling get5eConePt');
            pt1 = get5eConePt(oPt, rad+z, th1);
            pt2 = get5eConePt(oPt, rad+z, th2);
            //log(oPt);
            //log(pt1);
            //log(pt2);
        } else {
            //normal cone with equal radius throughout
            log('unhandled aoeType in getConeEndPts function')
        }
        
        let pts = [pt1, pt2];
        return pts;
    }
    
    //clockwise ordering of corner points of cell
    const getCellCoords = function(i, j, width, height=-999) {
        if (height === -999) {
            height = width;
        }
        let ptUL = new pt(i-width/2, j-height/2);
        let ptUR = new pt(i+width/2, j-height/2);
        let ptLR = new pt(i+width/2, j+height/2);
        let ptLL = new pt(i-width/2, j+height/2);
        let ptUL2 = new pt(i-width/2, j-height/2);
        
        let points = [ptUL, ptUR, ptLR, ptLL, ptUL2];    //note the repeat of ptUL to close the cell
        return points;
    }
    
    //returns the grid corner that is the farthest away from the origin pt
    const getFarthestCorner = function(oPt, cornerPts){
        let maxDist = -999999;
        let farthestPt;
        cornerPts.forEach(pt => {
           let d = distBetweenPts(oPt, pt);
           if (d > maxDist) {
               maxDist = d;
               farthestPt = pt;
           }
        });
        return farthestPt;
    }
    
    const pushUniquePtToArray = function(arr, obj) {
        const index = arr.findIndex((e) => e.x === obj.x && e.y === obj.y);
        if (index === -1) {
            arr.push(obj);
            return 1;
        } else {
            return 0;
        }
    }
    
    const pushUniqueElementToArray = function(arr, element) {
        const index = arr.findIndex((e) => e === element);
        if (index === -1) {
            arr.push(element);
            return 1;
        } else {
            return 0;
        }
    }
    
    const sortPathsByDistanceToOrigin = function(pathsArr, oPt) {
        let tempPath;
        let tempPt;
        let dist;
        
        //populate temp array of objects with pathIDs & dist
        let pathDistID = [];
        pathsArr.forEach((pathID) => {
            tempPath = getObj('path', pathID);
            tempPt = new pt(tempPath.get("left"), tempPath.get("top"))
            dist = distBetweenPts(tempPt, oPt);
            pathDistID.push({ id:pathID, dist: dist });
        });
        
        //sort temp array by dist
        let pathDistIDSorted = pathDistID.sort((a, b) => a.dist - b.dist);
        
        //copy the sorted xy coords to a return array
        let retArr = pathDistIDSorted.map(e => e.id);
        return retArr;
    }
    
    const sortPtsClockwise = function(ptsArr) {
        const center = ptsArr.reduce((acc, { x, y }) => {
            acc.x += x / ptsArr.length;
            acc.y += y / ptsArr.length;
            return acc;
        }, { x: 0, y: 0 });
        
        // Add an angle property to each point using tan(angle) = y/x
        const angles = ptsArr.map(({ x, y }) => {
            return { x, y, angle: Math.atan2(y - center.y, x - center.x) * 180 / Math.PI };
        });
        
        // Sort your points by angle
        const pointsSorted = angles.sort((a, b) => a.angle - b.angle);
        //log(pointsSorted);
        
        //copy the sorted xy coords to a return array
        let retArr = pointsSorted.map(pt => {
                        return {x:pt.x, y:pt.y}
                    });
        return retArr;
    }
    
    const getClosestGridPt = function(testPt, ptArray, pageGridIncrement) {
        //first, filter out points in the master array that are farther than 1 unit away
        let arr = ptArray.filter(pt => {
            if (pt.x <= testPt.x+70*pageGridIncrement && pt.x >= testPt.x-70*pageGridIncrement && 
                pt.y <= testPt.y+70*pageGridIncrement && pt.y >= testPt.y-70*pageGridIncrement) {
                return true;
            }
        });
        
        let minDist = 99999;
        let d, idx;
        arr.forEach((pt, i) => {
            d = distBetweenPts(pt, testPt);
            if (d < minDist) {
                minDist = d;
                idx = i;
            }
        });
        return arr[idx];
    }
    
    //function taken from https://stackoverflow.com/questions/37224912/circle-line-segment-collision/37225895
    const getLineCircleIntersections = function (pt1, pt2, centerPt, rad){
        let a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
        
        let circle = {
            radius : rad,
            center : centerPt,
        }
        
        let line = {
            p1 : pt1,
            p2 : pt2,
        }
        
        v1 = {};
        v2 = {};
        v1.x = line.p2.x - line.p1.x;
        v1.y = line.p2.y - line.p1.y;
        v2.x = line.p1.x - circle.center.x;
        v2.y = line.p1.y - circle.center.y;
        b = (v1.x * v2.x + v1.y * v2.y);
        c = 2 * (v1.x * v1.x + v1.y * v1.y);
        b *= -2;
        d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
        if(isNaN(d)){ // no intercept
            return [];
        }
        u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
        u2 = (b + d) / c;    
        retP1 = {};   // return points
        retP2 = {}  
        ret = []; // return array
        if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
            retP1.x = line.p1.x + v1.x * u1;
            retP1.y = line.p1.y + v1.y * u1;
            ret[0] = retP1;
        }
        if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
            retP2.x = line.p1.x + v1.x * u2;
            retP2.y = line.p1.y + v1.y * u2;
            ret[ret.length] = retP2;
        }       
        return ret;
    }
    
    const isPointInCircle = function (pt, centerPt, rad) {
        let d = Math.floor(distBetweenPts(pt, centerPt));   //rounded down to nearest pixel to account for floating point errors
        return d <= rad;
    }
    
    const getCircleLocations = function(pageGridCenters, aoeType, aoeFloat, minGridArea, oPt, cPt, rad, pageGridIncrement, pageScaleNumber, offsetX, offsetY, forceIntersection) {
        let circleCoords = {
            xVals: [],
            yVals: []
        }
        
        let calcType = aoeType==='PFcircle' ? 'PF' : 'Euclidean';
        
        //log('rad = ' + rad);
        //log('offsetX = ' + offsetX);
        //log('-------oPt = ' + oPt.x + ',' + oPt.y);
        
        let bbRadX = rad;
        let bbRadY = rad;
        
        //Define grid.  Grid is determined by bounding box of AoE
                //Grid is comprised of an array of cell objects
                    //cell objects are comprised of an area scalar and an array of points(endpoints plus intersections) in clockwise order (for area calcs)
        let grid = [];
        
        let minX, maxX, minY, maxY;
        let minPt = new pt(oPt.x-bbRadX-offsetX, oPt.y-bbRadX-offsetX);
        let maxPt = new pt(oPt.x+bbRadX-offsetX, oPt.y+bbRadX-offsetX);
        minX = getClosestGridPt(minPt, pageGridCenters, pageGridIncrement).x;
        maxX = getClosestGridPt(maxPt, pageGridCenters, pageGridIncrement).x;
        minY = getClosestGridPt(minPt, pageGridCenters, pageGridIncrement).y;
        maxY = getClosestGridPt(maxPt, pageGridCenters, pageGridIncrement).y;
        
        //log('x range = ' + minX + ' to ' + maxX);
        //log('y range = ' + minY + ' to ' + maxY);
        for (let i=minX; i<=maxX; i=i+70*pageGridIncrement) {
            for (let j=minY; j<=maxY; j=j+70*pageGridIncrement) {
                //log('i = ' + i + ', j = ' + j);
                //i & j are the x&y coords of the center of each grid cell
                let centerOfCell = new pt(i, j);
                let cornerPts = getCellCoords(i, j, 70*pageGridIncrement);  //initialized with [ptUL, ptUR, ptLR, ptLL, ptUL] (note repeat of ptUL to close the cell
                let cell = {
                    points: cornerPts,
                    farthestCorner: getFarthestCorner(oPt, cornerPts),  //will use farthest corner pt when filtering for PF cone distances
                    center: centerOfCell,
                    area: 0
                }
                grid.push(cell);
            }
        }
        //log(grid);
        
        //find cells where all corners are within the cone OR there is a valid intersection of the cone with the cell. Remove all other cells from grid 
        //let circleAoEPolygon = [new pt(oPt.x-bbRadX-offsetX,oPt.y-bbRadY-offsetY), new pt(oPt.x+bbRadX+offsetX,oPt.y-bbRadY-offsetY), new pt(oPt.x+bbRadX+offsetX,oPt.y+bbRadY+offsetY), new pt(oPt.x-bbRadX-offsetX,oPt.y+bbRadY+offsetY), new pt(oPt.x-bbRadX-offsetX,oPt.y-bbRadY-offsetY)];
        //log(circleAoEPolygon);
        for (let i=grid.length-1; i>-1; i--) {
            
            //log(i);
            //log('start checking for entire cell wihtin defined AoE');
            let ULinAoE = isPointInCircle(grid[i].points[0], oPt, rad);
            let URinAoE = isPointInCircle(grid[i].points[1], oPt, rad);
            let LRinAoE = isPointInCircle(grid[i].points[2], oPt, rad);
            let LLinAoE = isPointInCircle(grid[i].points[3], oPt, rad);
            //log(ULinAoE + ',' + URinAoE + ',' + LRinAoE + ',' + LLinAoE);
            
            if (!(ULinAoE && URinAoE && LRinAoE && LLinAoE)) {
                //log('entire cell not in circle, start checking intersections');
                //all corners not within circle, check for intersections
                
                let topIntersections = [];
                let rightIntersections = [];
                let bottomIntersections = [];
                let leftIntersections = [];
                let numAddedPts = 0;
                let insertIdx;
                let intPts = [];          //array of intersection points (circleAoE crossing cell border)
                let containsVertex = false;   //check the squareAoE corner points 
                let baseCell = grid[i].points.map(x => x);  //a copy of the base grid cell coordinates (used later to check for cone vertices)
                
                // intersections of top grid segment with circle
                intPts = getLineCircleIntersections(grid[i].points[0], grid[i].points[1], oPt, rad);
                if (intPts.length > 0) {
                    intPts.forEach(pt => {
                        pushUniquePtToArray(topIntersections,pt)
                    });
                }
                
                // intersections of right grid segment with circle
                intPts = getLineCircleIntersections(grid[i].points[1], grid[i].points[2], oPt, rad);
                if (intPts.length > 0) {
                    intPts.forEach(pt => {
                        pushUniquePtToArray(rightIntersections,pt)
                    });
                }
                
                // intersections of bottom grid segment with circle
                intPts = getLineCircleIntersections(grid[i].points[2], grid[i].points[3], oPt, rad);
                if (intPts.length > 0) {
                    intPts.forEach(pt => {
                        pushUniquePtToArray(bottomIntersections,pt)
                    });
                }
                
                // intersections of left grid segment with circle
                intPts = getLineCircleIntersections(grid[i].points[3], grid[i].points[4], oPt, rad);
                if (intPts.length > 0) {
                    intPts.forEach(pt => {
                        pushUniquePtToArray(leftIntersections,pt)
                    });
                }
                
                
                if (topIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + topIntersections.length + ' top intersections - ');
                    //log(topIntersections);
                    for (let t=0; t<topIntersections.length; t++) {
                        if (topIntersections[t]) {
                            grid[i].points.push(topIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, topIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (rightIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + rightIntersections.length + ' right intersections - ');
                    //log(rightIntersections);
                    for (let t=0; t<rightIntersections.length; t++) {
                        if (rightIntersections[t]) {
                            grid[i].points.push(rightIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, rightIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (bottomIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + bottomIntersections.length + ' bottom intersections - ');
                    //log(bottomIntersections);
                    for (let t=0; t<bottomIntersections.length; t++) {
                        if (bottomIntersections[t]) {
                            grid[i].points.push(bottomIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, bottomIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (leftIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + leftIntersections.length + ' left intersections - ');
                    //log(leftIntersections);
                    for (let t=0; t<leftIntersections.length; t++) {
                        if (leftIntersections[t]) {
                            grid[i].points.push(leftIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, leftIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                
                
                grid[i].points = sortPtsClockwise(grid[i].points);
                
                
                
                //must have two intersection pts to calculate area 
                if (numAddedPts < 2) {
                    grid.splice(i,1);
                } else {
                    //valid intersection, now filter out the grid points that are outside of the AoE (some corner pts from each cell)
                   
                    //log('### Sorted Grid pts with intersections')
                    //log(grid[i].points);
                    grid[i].points = grid[i].points.filter(pt => {
                        return isPointInCircle(pt, oPt, rad);
                    });
                    
                    grid[i].points = sortPtsClockwise(grid[i].points);
                    //log('### filtered Grid pts with intersections')
                    //log(grid[i].points);
                    
                    //calculate area with the filtered points that form an arbitrary polygon 
                    let area = calcPolygonArea(grid[i].points);
                    //log('grid after filter');
                    //log(grid[i].points);
                    //log('area of grid ' + i + ' = ' + area);
                    grid[i].area = area
                    //log('grid area = ' + grid[i].area)
                    //remove the grid cell if not enough area is covered by the cone
                    if (area < minGridArea*70*70*pageGridIncrement*pageGridIncrement) {
                        grid.splice(i,1);
                    }
                }
            } 
        }
        
        //We have a filtered array of grid cells. Return the coordinates of the center of each remaining cell
        for (let i=0; i<grid.length; i++) {
            if (aoeType === 'PFcircle') {
                //one last check to see if the grid square satisfies PF-style distance rules (every other diag counts as 2sq)
                let testPt = forceIntersection ? grid[i].farthestCorner : grid[i].center
                let pfDist = distBetweenPts(oPt, testPt, calcType, pageGridIncrement, pageScaleNumber);
                if (pfDist <= rad) {
                    circleCoords.xVals.push(grid[i].center.x);
                    circleCoords.yVals.push(grid[i].center.y);
                }
            } else {
                circleCoords.xVals.push(grid[i].center.x);
                circleCoords.yVals.push(grid[i].center.y);
            }
        }
        return circleCoords;
        
    }
                                      
    const getWallLocations = function(pageGridCenters, minGridArea, oPt, cPt, wallParams, pageGridIncrement) {
        /*
        let wallCoords = {
            xVals: [35],
            yVals: [35]
        }
        return wallCoords;
        */
        let wallCoords = {
            xVals: [],
            yVals: []
        }
        
        //Define grid.  Grid is determined by bounding box of AoE
                //Grid is comprised of an array of cell objects
                    //cell objects are comprised of an area scalar and an array of points(endpoints plus intersections) in clockwise order (for area calcs)
        let grid = [];
        
        /*
        log('origin')
        log(oPt)
        log('pMinMax')
        log(wallParams.pMinX)
        log(wallParams.pMaxX)
        log(wallParams.pMinY)
        log(wallParams.pMaxY)
        log('wallpts')
        log(wallParams.pt1)
        log(wallParams.pt2)
        log(wallParams.pt3)
        log(wallParams.pt4)
        
        log(pageGridCenters)
        */
        let minX = getClosestGridPt(wallParams.pMinX, pageGridCenters, pageGridIncrement).x;
        let maxX = getClosestGridPt(wallParams.pMaxX, pageGridCenters, pageGridIncrement).x;
        let minY = getClosestGridPt(wallParams.pMinY, pageGridCenters, pageGridIncrement).y;
        let maxY = getClosestGridPt(wallParams.pMaxY, pageGridCenters, pageGridIncrement).y;
        
        //log('x range = ' + minX + ' to ' + maxX);
        //log('y range = ' + minY + ' to ' + maxY);
        for (let i=minX; i<=maxX; i=i+70*pageGridIncrement) {
            for (let j=minY; j<=maxY; j=j+70*pageGridIncrement) {
                //log('i = ' + i + ', j = ' + j);
                //i & j are the x&y coords of the center of each grid cell
                let centerOfCell = new pt(i, j);
                let cell = {
                    points: getCellCoords(i, j, 70*pageGridIncrement),  //initialized with [ptUL, ptUR, ptLR, ptLL, ptUL] (note repeat of ptUL to close the cell
                    center: centerOfCell,
                    area: 0
                }
                grid.push(cell);
            }
        }
        
        //log(grid);
        
        //find cells where all corners are within the cone OR there is a valid intersection of the cone with the cell. Remove all other cells from grid 
        let wallAoEPolygon = [wallParams.pt1, wallParams.pt2, wallParams.pt3, wallParams.pt4, wallParams.pt1];
        //log(wallAoEPolygon);
    
        for (let i=grid.length-1; i>-1; i--) {
            
            //log(i);
            //log('start checking for entire cell wihtin defined AoE');
            let ULinAoE = isPointInPolygon(grid[i].points[0], wallAoEPolygon);
            let URinAoE = isPointInPolygon(grid[i].points[1], wallAoEPolygon);
            let LRinAoE = isPointInPolygon(grid[i].points[2], wallAoEPolygon);
            let LLinAoE = isPointInPolygon(grid[i].points[3], wallAoEPolygon);
            //log(ULinAoE + ',' + URinAoE + ',' + LRinAoE + ',' + LLinAoE);
            
            
            if (!(ULinAoE && URinAoE && LRinAoE && LLinAoE)) {
                //log('entire cell not in wall, start checking intersections');
                //all corners not within wall polygon, check for intersections (4 checks for each square segment)
                
                let topIntersections = [];
                let rightIntersections = [];
                let bottomIntersections = [];
                let leftIntersections = [];
                let numAddedPts = 0;
                let insertIdx;
                let intPt;          //intersection point (squareAoE edlge crossing cell border)
                let containsVertex = false;   //check the squareAoE corner points 
                let baseCell = grid[i].points.map(x => x);  //a copy of the base grid cell coordinates (used later to check for AoE vertices)
                
                // intersections of top grid segment with the wallAoE (have to check all four sides of wall)
                intPt = getIntersectionPt(grid[i].points[0].x, grid[i].points[0].y, grid[i].points[1].x, grid[i].points[1].y, wallAoEPolygon[0].x, wallAoEPolygon[0].y, wallAoEPolygon[1].x, wallAoEPolygon[1].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(topIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[0].x, grid[i].points[0].y, grid[i].points[1].x, grid[i].points[1].y, wallAoEPolygon[1].x, wallAoEPolygon[1].y, wallAoEPolygon[2].x, wallAoEPolygon[2].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(topIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[0].x, grid[i].points[0].y, grid[i].points[1].x, grid[i].points[1].y, wallAoEPolygon[2].x, wallAoEPolygon[2].y, wallAoEPolygon[3].x, wallAoEPolygon[3].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(topIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[0].x, grid[i].points[0].y, grid[i].points[1].x, grid[i].points[1].y, wallAoEPolygon[3].x, wallAoEPolygon[3].y, wallAoEPolygon[4].x, wallAoEPolygon[4].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(topIntersections,intPt) }
                
                
                // intersections of right grid segment with two horizontal lines of squareAoE
                intPt = getIntersectionPt(grid[i].points[1].x, grid[i].points[1].y, grid[i].points[2].x, grid[i].points[2].y, wallAoEPolygon[0].x, wallAoEPolygon[0].y, wallAoEPolygon[1].x, wallAoEPolygon[1].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(rightIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[1].x, grid[i].points[1].y, grid[i].points[2].x, grid[i].points[2].y, wallAoEPolygon[1].x, wallAoEPolygon[1].y, wallAoEPolygon[2].x, wallAoEPolygon[2].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(rightIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[1].x, grid[i].points[1].y, grid[i].points[2].x, grid[i].points[2].y, wallAoEPolygon[2].x, wallAoEPolygon[2].y, wallAoEPolygon[3].x, wallAoEPolygon[3].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(rightIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[1].x, grid[i].points[1].y, grid[i].points[2].x, grid[i].points[2].y, wallAoEPolygon[3].x, wallAoEPolygon[3].y, wallAoEPolygon[4].x, wallAoEPolygon[4].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(rightIntersections,intPt) }
                
                //log(grid[i].points);
                
                
                // intersections of bottom grid segment with two vertical lines of squareAoE
                intPt = getIntersectionPt(grid[i].points[2].x, grid[i].points[2].y, grid[i].points[3].x, grid[i].points[3].y, wallAoEPolygon[0].x, wallAoEPolygon[0].y, wallAoEPolygon[1].x, wallAoEPolygon[1].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(bottomIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[2].x, grid[i].points[2].y, grid[i].points[3].x, grid[i].points[3].y, wallAoEPolygon[1].x, wallAoEPolygon[1].y, wallAoEPolygon[2].x, wallAoEPolygon[2].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(bottomIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[2].x, grid[i].points[2].y, grid[i].points[3].x, grid[i].points[3].y, wallAoEPolygon[2].x, wallAoEPolygon[2].y, wallAoEPolygon[3].x, wallAoEPolygon[3].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(bottomIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[2].x, grid[i].points[2].y, grid[i].points[3].x, grid[i].points[3].y, wallAoEPolygon[3].x, wallAoEPolygon[3].y, wallAoEPolygon[4].x, wallAoEPolygon[4].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(bottomIntersections,intPt) }
                
                
                // intersections of left grid segment with two horizontal lines of squareAoE
                intPt = getIntersectionPt(grid[i].points[3].x, grid[i].points[3].y, grid[i].points[4].x, grid[i].points[4].y, wallAoEPolygon[0].x, wallAoEPolygon[0].y, wallAoEPolygon[1].x, wallAoEPolygon[1].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(leftIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[3].x, grid[i].points[3].y, grid[i].points[4].x, grid[i].points[4].y, wallAoEPolygon[1].x, wallAoEPolygon[1].y, wallAoEPolygon[2].x, wallAoEPolygon[2].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(leftIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[3].x, grid[i].points[3].y, grid[i].points[4].x, grid[i].points[4].y, wallAoEPolygon[2].x, wallAoEPolygon[2].y, wallAoEPolygon[3].x, wallAoEPolygon[3].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(leftIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[3].x, grid[i].points[3].y, grid[i].points[4].x, grid[i].points[4].y, wallAoEPolygon[3].x, wallAoEPolygon[3].y, wallAoEPolygon[4].x, wallAoEPolygon[4].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(leftIntersections,intPt) }
                
                //if (i===33) {
                //   log('grid before intersections')
                //    log(grid[i].points)
                //}
                
                if (topIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + topIntersections.length + ' top intersections - ');
                    //log(topIntersections);
                    for (let t=0; t<topIntersections.length; t++) {
                        if (topIntersections[t]) {
                            grid[i].points.push(topIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, topIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (rightIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + rightIntersections.length + ' right intersections - ');
                    //log(rightIntersections);
                    for (let t=0; t<rightIntersections.length; t++) {
                        if (rightIntersections[t]) {
                            grid[i].points.push(rightIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, rightIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (bottomIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + bottomIntersections.length + ' bottom intersections - ');
                    //log(bottomIntersections);
                    for (let t=0; t<bottomIntersections.length; t++) {
                        if (bottomIntersections[t]) {
                            grid[i].points.push(bottomIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, bottomIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (leftIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + leftIntersections.length + ' left intersections - ');
                    //log(leftIntersections);
                    for (let t=0; t<leftIntersections.length; t++) {
                        if (leftIntersections[t]) {
                            grid[i].points.push(leftIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, leftIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                //if (i===33) {
                //    log('grid after intersections')
                //    log(grid[i].points)
                //}
                
                //log('baseCell----------------');
                //log(baseCell)
                
                //check grid cell for wallAoEPolygon vertices
                //log('wallAoEPolygon---------')
                //log(wallAoEPolygon);
                
                containsVertex = isPointInPolygon(wallAoEPolygon[0],baseCell);
                if (containsVertex) {
                    //log(wallAoEPolygon[0])
                    //log(baseCell)
                    //log('vertex 0 found at index ' + i)
                    let ptAdded = pushUniquePtToArray(grid[i].points,wallAoEPolygon[0]); //returns 1 if pt added, 0 if not added
                    numAddedPts += ptAdded;
                }
                
                containsVertex = isPointInPolygon(wallAoEPolygon[1],baseCell);
                if (containsVertex) {
                    //log(wallAoEPolygon[1])
                    //log(baseCell)
                    //log('vertex 1 found at index ' + i)
                    let ptAdded = pushUniquePtToArray(grid[i].points,wallAoEPolygon[1]);
                    numAddedPts += ptAdded;
                }
                
                containsVertex = isPointInPolygon(wallAoEPolygon[2],baseCell);
                if (containsVertex) {
                    //log(wallAoEPolygon[2])
                    //log(baseCell)
                    //log('vertex 2 found at index ' + i)
                    let ptAdded = pushUniquePtToArray(grid[i].points,wallAoEPolygon[2]);
                    numAddedPts += ptAdded;
                }
                
                containsVertex = isPointInPolygon(wallAoEPolygon[3],baseCell);
                if (containsVertex) {
                    //log(wallAoEPolygon[3])
                    //log(baseCell)
                    //log('vertex 3 found at index ' + i)
                    let ptAdded = pushUniquePtToArray(grid[i].points,wallAoEPolygon[3]);
                    numAddedPts += ptAdded;
                }
                
                //if (verticesAdded) {
                    grid[i].points = sortPtsClockwise(grid[i].points);
                //}
                
                
                //must have two intersection pts to calculate area 
                if (numAddedPts < 2) {
                    grid.splice(i,1);
                } else {
                    //valid intersection, now filter out the grid points that are outside of the AoE (some corner pts from each grid cell)
                   
                    //log('### Sorted Grid pts with intersections')
                    //log(grid[i].points);
                    //if (i===33) {
                    //    log('grid after vertices, before inPolygon filter')
                    //    log(grid[i].points)
                    //}
                    
                    //log('shortpoly')
                    //log(shortWallPolygon)
                    grid[i].points = grid[i].points.filter(pt => {
                        return isPointInWall(pt, wallAoEPolygon);
                    });
                    //if (i===33) {
                    //    log('grid after final filter')
                    //    log(grid[i].points)
                    //}
                    grid[i].points = sortPtsClockwise(grid[i].points);
                    //log('### filtered Grid pts with intersections')
                    //log(grid[i].points);
                    
                    //calculate area with the filtered points that form an arbitrary polygon 
                    let area = calcPolygonArea(grid[i].points);
                    //log('grid after filter');
                    //log(grid[i].points);
                    //log('area of grid ' + i + ' = ' + area);
                    grid[i].area = area
                    //log('grid area = ' + grid[i].area)
                    //remove the grid cell if not enough area is covered by the cone
                    if (area < minGridArea*70*70*pageGridIncrement*pageGridIncrement) {
                        //log('area filter, removed index ' + i)
                        grid.splice(i,1);
                    }
                }
            } 
            
        }
        
        //We have a filtered array of grid cells. Return the coordinates of the center of each remaining cell
        for (let i=0; i<grid.length; i++) {
            wallCoords.xVals.push(grid[i].center.x);
            wallCoords.yVals.push(grid[i].center.y);
        }
        return wallCoords;
        
    }
    
    const getSquareLocations = function(pageGridCenters, aoeType, aoeFloat, minGridArea, oPt, cPt, rad, pageGridIncrement, offsetX, offsetY) {
        let squareCoords = {
            xVals: [],
            yVals: []
        }
        
        //log('rad = ' + rad);
        //log('offsetX = ' + offsetX);
        //log('-------oPt = ' + oPt.x + ',' + oPt.y);
        
        let bbRadX = rad;
        let bbRadY = rad;
        
        
        //Define grid.  Grid is determined by bounding box of AoE
                //Grid is comprised of an array of cell objects
                    //cell objects are comprised of an area scalar and an array of points(endpoints plus intersections) in clockwise order (for area calcs)
        let grid = [];
        
        let minX, maxX, minY, maxY;
        let minPt = new pt(oPt.x-bbRadX-offsetX, oPt.y-bbRadX-offsetX);
        let maxPt = new pt(oPt.x+bbRadX-offsetX, oPt.y+bbRadX-offsetX);
        minX = getClosestGridPt(minPt, pageGridCenters, pageGridIncrement).x;
        maxX = getClosestGridPt(maxPt, pageGridCenters, pageGridIncrement).x;
        minY = getClosestGridPt(minPt, pageGridCenters, pageGridIncrement).y;
        maxY = getClosestGridPt(maxPt, pageGridCenters, pageGridIncrement).y;
        
        
        //log('x range = ' + minX + ' to ' + maxX);
        //log('y range = ' + minY + ' to ' + maxY);
        for (let i=minX; i<=maxX; i=i+70*pageGridIncrement) {
            for (let j=minY; j<=maxY; j=j+70*pageGridIncrement) {
                //log('i = ' + i + ', j = ' + j);
                //i & j are the x&y coords of the center of each grid cell
                let centerOfCell = new pt(i, j);
                let cell = {
                    points: getCellCoords(i, j, 70*pageGridIncrement),  //initialized with [ptUL, ptUR, ptLR, ptLL, ptUL] (note repeat of ptUL to close the cell
                    center: centerOfCell,
                    area: 0
                }
                grid.push(cell);
            }
        }
        //log(grid);
        
        //find cells where all corners are within the cone OR there is a valid intersection of the cone with the cell. Remove all other cells from grid 
        let squareAoEPolygon = [new pt(oPt.x-bbRadX-offsetX,oPt.y-bbRadY-offsetY), new pt(oPt.x+bbRadX+offsetX,oPt.y-bbRadY-offsetY), new pt(oPt.x+bbRadX+offsetX,oPt.y+bbRadY+offsetY), new pt(oPt.x-bbRadX-offsetX,oPt.y+bbRadY+offsetY), new pt(oPt.x-bbRadX-offsetX,oPt.y-bbRadY-offsetY)];
        //log(squareAoEPolygon);
        for (let i=grid.length-1; i>-1; i--) {
            
            //log(i);
            //log('start checking for entire cell wihtin defined AoE');
            let ULinAoE = isPointInPolygon(grid[i].points[0], squareAoEPolygon);
            let URinAoE = isPointInPolygon(grid[i].points[1], squareAoEPolygon);
            let LRinAoE = isPointInPolygon(grid[i].points[2], squareAoEPolygon);
            let LLinAoE = isPointInPolygon(grid[i].points[3], squareAoEPolygon);
            //log(ULinAoE + ',' + URinAoE + ',' + LRinAoE + ',' + LLinAoE);
            
            if (!(ULinAoE && URinAoE && LRinAoE && LLinAoE)) {
                //log('entire cell not in cone, start checking intersections');
                //all corners not within square, check for intersections (4 checks for each square segment)
                
                let topIntersections = [];
                let rightIntersections = [];
                let bottomIntersections = [];
                let leftIntersections = [];
                let numAddedPts = 0;
                let insertIdx;
                let intPt;          //intersection point (squareAoE edlge crossing cell border)
                let containsVertex = false;   //check the squareAoE corner points 
                let baseCell = grid[i].points.map(x => x);  //a copy of the base grid cell coordinates (used later to check for cone vertices)
                
                // intersections of top grid segment with two vertical lines of squareAoE
                intPt = getIntersectionPt(grid[i].points[0].x, grid[i].points[0].y, grid[i].points[1].x, grid[i].points[1].y, squareAoEPolygon[1].x, squareAoEPolygon[1].y, squareAoEPolygon[2].x, squareAoEPolygon[2].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(topIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[0].x, grid[i].points[0].y, grid[i].points[1].x, grid[i].points[1].y, squareAoEPolygon[3].x, squareAoEPolygon[3].y, squareAoEPolygon[4].x, squareAoEPolygon[4].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(topIntersections,intPt) }
                
                
                // intersections of right grid segment with two horizontal lines of squareAoE
                intPt = getIntersectionPt(grid[i].points[1].x, grid[i].points[1].y, grid[i].points[2].x, grid[i].points[2].y, squareAoEPolygon[0].x, squareAoEPolygon[0].y, squareAoEPolygon[1].x, squareAoEPolygon[1].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(rightIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[1].x, grid[i].points[1].y, grid[i].points[2].x, grid[i].points[2].y, squareAoEPolygon[2].x, squareAoEPolygon[2].y, squareAoEPolygon[3].x, squareAoEPolygon[3].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(rightIntersections,intPt) }
                
                //log(grid[i].points);
                
                
                // intersections of bottom grid segment with two vertical lines of squareAoE
                intPt = getIntersectionPt(grid[i].points[2].x, grid[i].points[2].y, grid[i].points[3].x, grid[i].points[3].y, squareAoEPolygon[1].x, squareAoEPolygon[1].y, squareAoEPolygon[2].x, squareAoEPolygon[2].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(bottomIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[2].x, grid[i].points[2].y, grid[i].points[3].x, grid[i].points[3].y, squareAoEPolygon[3].x, squareAoEPolygon[3].y, squareAoEPolygon[4].x, squareAoEPolygon[4].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(bottomIntersections,intPt) }
                
                
                // intersections of left grid segment with two horizontal lines of squareAoE
                intPt = getIntersectionPt(grid[i].points[3].x, grid[i].points[3].y, grid[i].points[4].x, grid[i].points[4].y, squareAoEPolygon[0].x, squareAoEPolygon[0].y, squareAoEPolygon[1].x, squareAoEPolygon[1].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(leftIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[3].x, grid[i].points[3].y, grid[i].points[4].x, grid[i].points[4].y, squareAoEPolygon[2].x, squareAoEPolygon[2].y, squareAoEPolygon[3].x, squareAoEPolygon[3].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(leftIntersections,intPt) }
                
                
                if (topIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + topIntersections.length + ' top intersections - ');
                    //log(topIntersections);
                    for (let t=0; t<topIntersections.length; t++) {
                        if (topIntersections[t]) {
                            grid[i].points.push(topIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, topIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (rightIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + rightIntersections.length + ' right intersections - ');
                    //log(rightIntersections);
                    for (let t=0; t<rightIntersections.length; t++) {
                        if (rightIntersections[t]) {
                            grid[i].points.push(rightIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, rightIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (bottomIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + bottomIntersections.length + ' bottom intersections - ');
                    //log(bottomIntersections);
                    for (let t=0; t<bottomIntersections.length; t++) {
                        if (bottomIntersections[t]) {
                            grid[i].points.push(bottomIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, bottomIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (leftIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + leftIntersections.length + ' left intersections - ');
                    //log(leftIntersections);
                    for (let t=0; t<leftIntersections.length; t++) {
                        if (leftIntersections[t]) {
                            grid[i].points.push(leftIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, leftIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                
                //log('baseCell----------------');
                //log(baseCell)
                
                //check grid cell for squareAoEPolygon vertices
                //log('squareAoEPolygon---------')
                //log(squareAoEPolygon);
                containsVertex = isPointInPolygon(squareAoEPolygon[0],baseCell);
                if (containsVertex) {
                    //log('vertex 0 found at index ' + i)
                    let ptAdded = pushUniquePtToArray(grid[i].points,squareAoEPolygon[0]); //returns 1 if pt added, 0 if not added
                    numAddedPts += ptAdded;
                }
                
                containsVertex = isPointInPolygon(squareAoEPolygon[1],baseCell);
                if (containsVertex) {
                    //log('vertex 1 found at index ' + i)
                    let ptAdded = pushUniquePtToArray(grid[i].points,squareAoEPolygon[1]);
                    numAddedPts += ptAdded;
                }
                
                containsVertex = isPointInPolygon(squareAoEPolygon[2],baseCell);
                if (containsVertex) {
                    //log('vertex 2 found at index ' + i)
                    let ptAdded = pushUniquePtToArray(grid[i].points,squareAoEPolygon[2]);
                    numAddedPts += ptAdded;
                }
                
                containsVertex = isPointInPolygon(squareAoEPolygon[3],baseCell);
                if (containsVertex) {
                    //log('vertex 3 found at index ' + i)
                    let ptAdded = pushUniquePtToArray(grid[i].points,squareAoEPolygon[3]);
                    numAddedPts += ptAdded;
                }
                
                //if (verticesAdded) {
                    grid[i].points = sortPtsClockwise(grid[i].points);
                //}
                
                
                //must have two intersection pts to calculate area 
                if (numAddedPts < 2) {
                    grid.splice(i,1);
                } else {
                    //valid intersection, now filter out the grid points that are outside of the AoE (some corner pts from each cell)
                   
                    //log('### Sorted Grid pts with intersections')
                    //log(grid[i].points);
                    grid[i].points = grid[i].points.filter(pt => {
                        return isPointInPolygon(pt, squareAoEPolygon);
                    });
                    
                    grid[i].points = sortPtsClockwise(grid[i].points);
                    //log('### filtered Grid pts with intersections')
                    //log(grid[i].points);
                    
                    //calculate area with the filtered points that form an arbitrary polygon 
                    let area = calcPolygonArea(grid[i].points);
                    //log('grid after filter');
                    //log(grid[i].points);
                    //log('area of grid ' + i + ' = ' + area);
                    grid[i].area = area
                    //log('grid area = ' + grid[i].area)
                    //remove the grid cell if not enough area is covered by the cone
                    if (area < minGridArea*70*70*pageGridIncrement*pageGridIncrement) {
                        grid.splice(i,1);
                    }
                }
            } 
        }
        
        //We have a filtered array of grid cells. Return the coordinates of the center of each remaining cell
        for (let i=0; i<grid.length; i++) {
            squareCoords.xVals.push(grid[i].center.x);
            squareCoords.yVals.push(grid[i].center.y);
        }
        
        return squareCoords;
    }
    
    const getConeLocations = function(pageGridCenters, aoeType, minGridArea, oPt, cPt, coneDirection, coneWidth, rad, pageGridIncrement, pageScaleNumber, offsetX, offsetY, oWidth, oHeight) {
        let coneCoords = {
            xVals: [],
            yVals: []
        }
        let deg2rad = Math.PI/180;
        let bbRadX;
        let bbRadY;
        
        let coneEndPts;
        
        let isFlatCone = aoeType==='5econe' ? true : false;
        let calcType = aoeType==='PFcone' ? 'PF' : 'Euclidean';
            
        //Define grid.  Grid is determined by bounding box of AoE
                        //Grid is comprised of an array of cell objects
                            //cell objects are comprised of an area scalar and an array of points(endpoints plus intersections) in clockwise order (for area calcs)
        let z;
        if (aoeType === '5econe') {
            z = (rad / (2* Math.sin(Math.atan(0.5)))) - rad;
            coneEndPts = getConeEndPts2(aoeType, oPt, offsetX, offsetY, coneDirection, coneWidth, rad, z);    //3-element array with the origin and endPts of the cone (origin pt is excluded from this array)
            let sizeX = Math.max(Math.abs(coneEndPts[0].x-coneEndPts[1].x), Math.abs(coneEndPts[1].x-coneEndPts[2].x), Math.abs(coneEndPts[2].x-coneEndPts[0].x));
            let sizeY = Math.max(Math.abs(coneEndPts[0].y-coneEndPts[1].y), Math.abs(coneEndPts[1].y-coneEndPts[2].y), Math.abs(coneEndPts[2].y-coneEndPts[0].y));
            
            //Extend the bounding box by 1.5 times 
            bbRadX = Math.ceil(sizeX*1.5/(70*pageGridIncrement)) * 70*pageGridIncrement;
            bbRadY = Math.ceil(sizeY*1.5/(70*pageGridIncrement)) * 70*pageGridIncrement;
        } else {
            z = 0;
            coneEndPts = getConeEndPts2(aoeType, oPt, offsetX, offsetY, coneDirection, coneWidth, rad, z);    //3-element array with the origin and endPts of the cone (origin pt is excluded from this array)
            bbRadX = rad + oWidth/2;
            bbRadY = rad + oHeight/2;
        }
        
        //log('bbRadX = ' + bbRadX);
        //log('bbRadY = ' + bbRadY);
        //log('-------oPt = ' + oPt.x + ',' + oPt.y);
        
        //Define grid.  Grid is determined by bounding box of AoE
                //Grid is comprised of an array of cell objects
                    //cell objects are comprised of an area scalar and an array of points(endpoints plus intersections) in clockwise order (for area calcs)
        let grid = [];
        let minX, maxX, minY, maxY;
        let minPt = new pt(oPt.x-bbRadX-offsetX, oPt.y-bbRadX-offsetX);
        let maxPt = new pt(oPt.x+bbRadX-offsetX, oPt.y+bbRadX-offsetX);
        minX = getClosestGridPt(minPt, pageGridCenters, pageGridIncrement).x;
        maxX = getClosestGridPt(maxPt, pageGridCenters, pageGridIncrement).x;
        minY = getClosestGridPt(minPt, pageGridCenters, pageGridIncrement).y;
        maxY = getClosestGridPt(maxPt, pageGridCenters, pageGridIncrement).y;
        
        //log('x range = ' + minX + ' to ' + maxX);
        //log('y range = ' + minY + ' to ' + maxY);
        for (let i=minX; i<=maxX; i=i+70*pageGridIncrement) {
            for (let j=minY; j<=maxY; j=j+70*pageGridIncrement) {
                //log('i = ' + i + ', j = ' + j);
                //i & j are the x&y coords of the center of each grid cell
                let centerOfCell = new pt(i, j);
                let cornerPts = getCellCoords(i, j, 70*pageGridIncrement);  //initialized with [ptUL, ptUR, ptLR, ptLL, ptUL] (note repeat of ptUL to close the cell
                let cell = {
                    points: cornerPts,
                    farthestCorner: getFarthestCorner(oPt, cornerPts),  //will use farthest corner pt when filtering for PF cone distances
                    center: centerOfCell,
                    area: 0
                }
                grid.push(cell);
            }
        }
        //log(grid);
        
        //find cells where all corners are within the cone OR there is a valid intersection of the cone with the cell. Remove all other cells from grid 
        for (let i=grid.length-1; i>-1; i--) {
        
            //log('start checking for entire cell in cone');
            let ULinCone = isPointInCone(grid[i].points[0], oPt, rad, coneDirection, coneWidth, isFlatCone);
            let URinCone = isPointInCone(grid[i].points[1], oPt, rad, coneDirection, coneWidth, isFlatCone);
            let LRinCone = isPointInCone(grid[i].points[2], oPt, rad, coneDirection, coneWidth, isFlatCone);
            let LLinCone = isPointInCone(grid[i].points[3], oPt, rad, coneDirection, coneWidth, isFlatCone);
            //let ULinCone = isPointInCone(grid[i].points[0], oPt, rad, coneDirection, coneWidth, isFlatCone, calcType, pageGridIncrement, pageScaleNumber);
            //let URinCone = isPointInCone(grid[i].points[1], oPt, rad, coneDirection, coneWidth, isFlatCone, calcType, pageGridIncrement, pageScaleNumber);
            //let LRinCone = isPointInCone(grid[i].points[2], oPt, rad, coneDirection, coneWidth, isFlatCone, calcType, pageGridIncrement, pageScaleNumber);
            //let LLinCone = isPointInCone(grid[i].points[3], oPt, rad, coneDirection, coneWidth, isFlatCone, calcType, pageGridIncrement, pageScaleNumber);
            
            //log('iteration = ' + i);
            if (!(ULinCone && URinCone && LRinCone && LLinCone)) {
                //log('entire cell not in cone, start checking intersections');
                //all corners not within cone, check for intersections (3 checks for each cone segment)
                
                let topIntersections = [];
                let rightIntersections = [];
                let bottomIntersections = [];
                let leftIntersections = [];
                let numAddedPts = 0;
                let insertIdx;
                let intPt;          //intersection point (cone edge crossing cell border)
                let intPtsArr = [];     //intersection pt(s) of cell lines with cone arc section
                let containsVertex = false;   //check the cone origin & end points 
                let baseCell = grid[i].points.map(x => x);  //a copy of the base grid cell coordinates (used later to check for cone vertices)
                // (ptUL.x, ptUL.y, ptUR.x, ptUR.y, oPt.x, oPt.y, endPt.x, endPt.y);
                //log('checking for top intersections');
                //log(grid[i].points[0].x)
                //log(grid[i].points[0].y);
                //log(grid[i].points[1].x);
                //log(grid[i].points[1].y);
                //log(oPt.x);
                //log(oPt.y);
                //log(coneEndPts[1].x);
                //log(coneEndPts[1].y);
                
                //top line of grid cell
                intPt = getIntersectionPt(grid[i].points[0].x, grid[i].points[0].y, grid[i].points[1].x, grid[i].points[1].y, oPt.x, oPt.y, coneEndPts[1].x, coneEndPts[1].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(topIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[0].x, grid[i].points[0].y, grid[i].points[1].x, grid[i].points[1].y, oPt.x, oPt.y, coneEndPts[2].x, coneEndPts[2].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(topIntersections,intPt) }
                if (aoeType === '5econe') {
                    //flat cone
                    intPt = getIntersectionPt(grid[i].points[0].x, grid[i].points[0].y, grid[i].points[1].x, grid[i].points[1].y, coneEndPts[1].x, coneEndPts[1].y, coneEndPts[2].x, coneEndPts[2].y);
                    if (intPt) { let ptAdded = pushUniquePtToArray(topIntersections,intPt) }
                } else {
                    //normal cone
                    intPtsArr = getLineCircleIntersections(grid[i].points[0], grid[i].points[1], oPt, rad);
                    if (coneWidth !== 360) { 
                        intPtsArr = intPtsArr.filter(p => {return isPointInCone(p, oPt, rad, coneDirection, coneWidth, isFlatCone)})
                        intPtsArr.forEach(p => pushUniquePtToArray(topIntersections, p));
                    }
                }
                
                
                //ptUR.x, ptUR.y, ptLR.x, ptLR.y, oPt.x, oPt.y, endPt.x, endPt.y
                //log('checking for right intersections');
                
                
                //Right side of grid cell
                intPt = getIntersectionPt(grid[i].points[1].x, grid[i].points[1].y, grid[i].points[2].x, grid[i].points[2].y, oPt.x, oPt.y, coneEndPts[1].x, coneEndPts[1].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(rightIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[1].x, grid[i].points[1].y, grid[i].points[2].x, grid[i].points[2].y, oPt.x, oPt.y, coneEndPts[2].x, coneEndPts[2].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(rightIntersections,intPt) }
                if (aoeType === '5econe') {
                    //flat cone
                    intPt = getIntersectionPt(grid[i].points[1].x, grid[i].points[1].y, grid[i].points[2].x, grid[i].points[2].y, coneEndPts[1].x, coneEndPts[1].y, coneEndPts[2].x, coneEndPts[2].y);
                    if (intPt) { let ptAdded = pushUniquePtToArray(rightIntersections,intPt) }
                } else {
                    //normal cone
                    intPtsArr = getLineCircleIntersections(grid[i].points[1], grid[i].points[2], oPt, rad);
                    if (coneWidth !== 360) { 
                        intPtsArr = intPtsArr.filter(p => {return isPointInCone(p, oPt, rad, coneDirection, coneWidth, isFlatCone)})
                        intPtsArr.forEach(p => pushUniquePtToArray(rightIntersections, p));
                    }
                }
                
                //log(grid[i].points);
                
                //ptLR.x, ptLR.y, ptLL.x, ptLL.y, oPt.x, oPt.y, endPt.x, endPt.y
                //log('checking for bottom intersections');
                
                //Bottom line of grid cell
                intPt = getIntersectionPt(grid[i].points[2].x, grid[i].points[2].y, grid[i].points[3].x, grid[i].points[3].y, oPt.x, oPt.y, coneEndPts[1].x, coneEndPts[1].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(bottomIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[2].x, grid[i].points[2].y, grid[i].points[3].x, grid[i].points[3].y, oPt.x, oPt.y, coneEndPts[2].x, coneEndPts[2].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(bottomIntersections,intPt) }
                if (aoeType === '5econe') {
                    //flat cone
                    intPt = getIntersectionPt(grid[i].points[2].x, grid[i].points[2].y, grid[i].points[3].x, grid[i].points[3].y, coneEndPts[1].x, coneEndPts[1].y, coneEndPts[2].x, coneEndPts[2].y);
                    if (intPt) { let ptAdded = pushUniquePtToArray(bottomIntersections,intPt) }
                } else {
                    //normal cone
                    intPtsArr = getLineCircleIntersections(grid[i].points[2], grid[i].points[3], oPt, rad);
                    if (coneWidth !== 360) { 
                        intPtsArr = intPtsArr.filter(p => {return isPointInCone(p, oPt, rad, coneDirection, coneWidth, isFlatCone)})
                        intPtsArr.forEach(p => pushUniquePtToArray(bottomIntersections, p));
                    }
                }
                
                //log(grid[i].points);
                
                //ptLL.x, ptLL.y, ptUL.x, ptUL.y, oPt.x, oPt.y, endPt.x, endPt.y
                //log('checking for left intersections');
                
                //Left side of grid cell
                intPt = getIntersectionPt(grid[i].points[3].x, grid[i].points[3].y, grid[i].points[4].x, grid[i].points[4].y, oPt.x, oPt.y, coneEndPts[1].x, coneEndPts[1].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(leftIntersections,intPt) }
                intPt = getIntersectionPt(grid[i].points[3].x, grid[i].points[3].y, grid[i].points[4].x, grid[i].points[4].y, oPt.x, oPt.y, coneEndPts[2].x, coneEndPts[2].y);
                if (intPt) { let ptAdded = pushUniquePtToArray(leftIntersections,intPt) }
                if (aoeType === '5econe') {
                    //flat cone
                    intPt = getIntersectionPt(grid[i].points[3].x, grid[i].points[3].y, grid[i].points[4].x, grid[i].points[4].y, coneEndPts[1].x, coneEndPts[1].y, coneEndPts[2].x, coneEndPts[2].y);
                    if (intPt) { let ptAdded = pushUniquePtToArray(leftIntersections,intPt); }
                } else {
                    //normal cone
                    intPtsArr = getLineCircleIntersections(grid[i].points[3], grid[i].points[4], oPt, rad);
                    if (coneWidth !== 360) { 
                        intPtsArr = intPtsArr.filter(p => {return isPointInCone(p, oPt, rad, coneDirection, coneWidth, isFlatCone)})
                        intPtsArr.forEach(p => pushUniquePtToArray(leftIntersections, p));
                    }
                }
                
                
                //log(grid[i].points);
                
                if (topIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + topIntersections.length + ' top intersections - ');
                    //log(topIntersections);
                    for (let t=0; t<topIntersections.length; t++) {
                        if (topIntersections[t]) {
                            grid[i].points.push(topIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, topIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (rightIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + rightIntersections.length + ' right intersections - ');
                    //log(rightIntersections);
                    for (let t=0; t<rightIntersections.length; t++) {
                        if (rightIntersections[t]) {
                            grid[i].points.push(rightIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, rightIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (bottomIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + bottomIntersections.length + ' bottom intersections - ');
                    //log(bottomIntersections);
                    for (let t=0; t<bottomIntersections.length; t++) {
                        if (bottomIntersections[t]) {
                            grid[i].points.push(bottomIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, bottomIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                if (leftIntersections.length > 0) {
                    //log('index = ' + i + ' - found ' + leftIntersections.length + ' left intersections - ');
                    //log(leftIntersections);
                    for (let t=0; t<leftIntersections.length; t++) {
                        if (leftIntersections[t]) {
                            grid[i].points.push(leftIntersections[t]);
                            //grid[i].points.splice(insertIdx, 0, leftIntersections[t]);
                            numAddedPts += 1;
                        }
                    }
                    //log(grid[i].points);
                    //log('numAddedPts = ' + numAddedPts);
                }
                
                //check grid cell for cone origin and endpt vertices
                let verticesAdded = false;
                containsVertex = isPointInPolygon(coneEndPts[0],baseCell);
                if (containsVertex) {
                    //log('vertex 0 found at index ' + i)
                    verticesAdded = true;
                    let ptAdded = pushUniquePtToArray(grid[i].points,coneEndPts[0]); //returns 1 if pt added, 0 if not added
                    numAddedPts += ptAdded;
                }
                
                /*
                if (i===29) {
                    log('checking vertex 1 at index 29');
                    log(coneEndPts[1]);
                    log(baseCell);
                }
                */
                containsVertex = isPointInPolygon(coneEndPts[1],baseCell);
                if (containsVertex) {
                    //log('vertex 1 found at index ' + i)
                    verticesAdded = true;
                    let ptAdded = pushUniquePtToArray(grid[i].points,coneEndPts[1]);
                    numAddedPts += ptAdded;
                }
                
                containsVertex = isPointInPolygon(coneEndPts[2],baseCell);
                if (containsVertex) {
                    //log('vertex 2 found at index ' + i)
                    verticesAdded = true;
                    let ptAdded = pushUniquePtToArray(grid[i].points,coneEndPts[2]);
                    numAddedPts += ptAdded;
                }
                
                //if (verticesAdded) {
                    grid[i].points = sortPtsClockwise(grid[i].points);
                //}
                
                
                //must have two intersection pts to calculate area 
                if (numAddedPts < 2) {
                    grid.splice(i,1);
                } else {
                    //log('gonna filter grid');
                    //valid intersection, now filter out the grid points that are outside of the cone (some corner pts from each cell)
                    
                    //log('grid before filter');
                    //log(grid[i].points);
                    /*
                    if (i===71) {
                        log(grid[i].points);
                        log(oPt);
                        log(rad);
                        log(coneDirection);
                        log(coneWidth);
                    }
                    */
                    
                    grid[i].points = grid[i].points.filter(pt => {
                        return isPointInCone(pt, oPt, rad, coneDirection, coneWidth, isFlatCone);
                    });
                    grid[i].points = sortPtsClockwise(grid[i].points);
                    //calculate area with the filtered points that form an arbitrary polygon 
                    let area = calcPolygonArea(grid[i].points);
                    //log('grid after filter');
                    //log(grid[i].points);
                    //log('area of grid ' + i + ' = ' + area);
                    grid[i].area = area
                    //remove the grid cell if not enough area is covered by the cone
                    if (area < minGridArea*70*70*pageGridIncrement*pageGridIncrement) {
                        grid.splice(i,1);
                    }
                }
                
                
            }
        }
        
        //We have a filtered array of grid cells. Return the coordinates of the center of each remaining cell
        for (let i=0; i<grid.length; i++) {
            if (aoeType === 'PFcone') {
                //one last check to see if the grid square satisfies PF-style distance rules (every other diag counts as 2sq)
                let pfDist = distBetweenPts(oPt, grid[i].farthestCorner, calcType, pageGridIncrement, pageScaleNumber);
                if (pfDist <= rad) {
                    coneCoords.xVals.push(grid[i].center.x);
                    coneCoords.yVals.push(grid[i].center.y);
                }
            } else {
                coneCoords.xVals.push(grid[i].center.x);
                coneCoords.yVals.push(grid[i].center.y);
            }
        }
        //log(coneCoords);
        return coneCoords;
    }
    
    
    //The following finds the intersection of the control line with the origin token (always thru center of token)
    //      then finds the closest possiblePt (corners or faces) to that intersection pt  
    const getNearestOriginPt = function(cPt, minX, minY, maxX, maxY, possiblePts) {
    	let intersectPt;
    	let dist;
        let minDist = 99999;
        let nearestPt;
        
        //log(cPt);
        //log(minX);
        //log(minY);
        //log(maxX);
        //log(maxY);
        //log(possiblePts);
        
    	let midX = (minX + maxX) / 2;
    	let midY = (minY + maxY) / 2;
    	// if (midX - x == 0) -> m == ±Inf -> minYx/maxYx == x (because value / ±Inf = ±0)
    	let m = (midY - cPt.y) / (midX - cPt.x);
        //log('m = ' + m);
    	if (cPt.x <= midX) { // check "left" side
    		let minXy = m * (minX - cPt.x) + cPt.y;
    		if (minY <= minXy && minXy <= maxY) {
    			intersectPt = {x: minX, y: minXy};
    		}
    	}
    
    	if (cPt.x >= midX) { // check "right" side
    		let maxXy = m * (maxX - cPt.x) + cPt.y;
    		if (minY <= maxXy && maxXy <= maxY) {
    			intersectPt = {x: maxX, y: maxXy};
    		}
    	}
        
    	if (cPt.y <= midY) { // check "top" side
    		let minYx = (minY - cPt.y) / m + cPt.x;
    		if (minX <= minYx && minYx <= maxX) {
    			intersectPt = {x: minYx, y: minY};
    		}
    	}
        
    	if (cPt.y >= midY) { // check "bottom" side
    		let maxYx = (maxY - cPt.y) / m + cPt.x;
    		if (minX <= maxYx && maxYx <= maxX) {
    			intersectPt = {x: maxYx, y: maxY};
    		}
    	}
       
        //log('intersectPt follows');
        //log(intersectPt);
    	// edge case when finding midpoint intersection: m = 0/0 = NaN
    	if (cPt.x === midX && cPt.y === midY) {
    	    intersectPt = {x: cPt.x, y: cPt.y};
    	}
    
        //Now, find the nearest "possiblePt" to this intersection pt
        
        for (i=0; i<possiblePts.length; i++) {
            dist = distBetweenPts(intersectPt, possiblePts[i]);
            if (dist < minDist || i===0) {
                nearestPt = possiblePts[i];
                minDist = dist;
            }
        }
        
        return nearestPt;
    }
    
    const getPossibleOriginPts = function(oPt, height, width, pageGridIncrement, allowFaces = false) {
        //gets all the corner points and 1/2 grid width faces around an origin pt
        let allPts = [];
        let ptIJ;
        
        let incr;
        if (allowFaces) {
            incr = 35*pageGridIncrement;
        } else {
            incr = 70*pageGridIncrement;
        }
        
        for (let i=oPt.x-width/2; i<=oPt.x+width/2; i += incr) {
            //ptIJ = {x: i, y: oPt.y-height};
            pushUniquePtToArray(allPts, {x: i, y: oPt.y-height/2});
            //allPts.push({x: i, y: oPt.y-height/2});
            //ptIJ = {x: i, y: oPt.y-height};
            pushUniquePtToArray(allPts, {x: i, y: oPt.y+height/2});
            //allPts.push({x: i, y: oPt.y+height/2});
        }
        for (let j=oPt.y-height/2; j<=oPt.y+height/2; j += incr) {
            pushUniquePtToArray(allPts,{x: oPt.x-width/2, y: j});
            pushUniquePtToArray(allPts,{x: oPt.x+width/2, y: j});
            
            //allPts.push({x: oPt.x-width/2, y: j});
            //allPts.push({x: oPt.x+width/2, y: j});
        }
        //sort the points clockwise
        allPts = sortPtsClockwise(allPts);
        return allPts;
    }
    
    const getPathLocations = function(link, oTok, cTok, originPtPx, controlPtPx, offsetX, offsetY, pageGridIncrement, pageScaleNumber, wallParams) {
        let locationsArr;       //return value - array of pts (x & y)
        let dX, dY;             //used in Bresenham algorithm
        let coneDirection = 0;   //angle (in degrees) between originPt & controlPt
        let rad = 0;            //radius of effect in pixels
        
        //find center coords of each token
        //let originPtPx = new pt(oTok.get('left'), oTok.get('top'))
        //let controlPtPx = new pt(cTok.get('left'), cTok.get('top'))
        let oHeight = oTok.get('height');
        let oWidth = oTok.get('width');
        
        //let maxTokSize = Math.max(oTok.get('height'), oTok.get('width'));
        
        let page = getObj("page", link.pageID);
        let pageGridCenters = [];
        let pageWidth = page.get('width');
        let pageHeight = page.get('height');
        for (let i=0-pageWidth; i<1.5*pageWidth*(1/pageGridIncrement); i++) {
            for (let j=0-pageHeight; j<1.5*pageHeight*(1/pageGridIncrement); j++) {
                pageGridCenters.push(new pt(35*pageGridIncrement+i*70*pageGridIncrement, 35*pageGridIncrement+j*70*pageGridIncrement))
            }
        }
        //log(pageGridCenters);
        if (page) {
            
            let originPtU = convertPtPixels2Units(originPtPx, pageGridIncrement);
            let controlPtU = convertPtPixels2Units(controlPtPx, pageGridIncrement);
            
            //add error handling.  TBD
            //if (pageGridIncrement !== 0) {  //grid map
            //etc..
            
            switch (link.aoeType) {
                case '5econe':
                    //Fall through
                case 'PFcone':
                    //Fall through
                case 'cone':
                    //log('5e cone!!!');
                    //use pt in pixels for cones (higher resolution needed)
                    coneDirection = getAngle2ControlToken(originPtPx, controlPtPx);
                    if (link.radius === 'variable') {
                        rad = distBetweenPts(originPtPx, controlPtPx);
                    } else {
                        rad = link.radius;
                    }
                    locationsArr = getConeLocations(pageGridCenters, link.aoeType, link.minGridArea, originPtPx, controlPtPx, coneDirection, link.coneWidth, rad, pageGridIncrement, pageScaleNumber, offsetX, offsetY, oWidth, oHeight);
                    break;
                case 'square':
                    rad = link.radius;
                    if (link.radius === 'variable' && !link.aoeFloat) {
                        rad = Math.max(Math.abs(originPtPx.x - controlPtPx.x), Math.abs(originPtPx.y - controlPtPx.y));
                    }
                    locationsArr = getSquareLocations(pageGridCenters, link.aoeType, link.aoeFloat, link.minGridArea, originPtPx, controlPtPx, rad, pageGridIncrement, offsetX, offsetY)
                    break;
                case 'wall':
                    //walls are a bit different. We passed wallParams into this function, which includes radius, so we don't have to calculate again.
                    locationsArr = getWallLocations(pageGridCenters, link.minGridArea, originPtPx, controlPtPx, wallParams, pageGridIncrement)
                    break;
                case 'PFcircle':
                    //Fall through
                case 'circle':
                    rad = link.radius;
                    if (link.radius === 'variable' && !link.aoeFloat) {
                        rad = distBetweenPts(originPtPx, controlPtPx);
                    }
                    locationsArr = getCircleLocations(pageGridCenters, link.aoeType, link.aoeFloat, link.minGridArea, originPtPx, controlPtPx, rad, pageGridIncrement, pageScaleNumber, offsetX, offsetY, link.forceIntersection)
                    break;
                case 'line':
                    //pass through. 'line' is the default
                default:
                    if (link.radius !== 'variable') {
                        //if pre-defined radius, recalculate the controlPt (originPt remains the same)
                        let direction = getAngle2ControlToken(originPtPx, controlPtPx);
                        
                        controlPtPx = getNewControlPt(originPtPx, link.radius, direction, pageGridIncrement)
                        controlPtU = convertPtPixels2Units(controlPtPx, pageGridIncrement);
                    }
                    locationsArr = getLineLocations(originPtU.x, originPtU.y, controlPtU.x, controlPtU.y, pageGridIncrement)
                    break;    
            }
            
            return locationsArr;
        }
    }
    
    const getIndexFromPtArray = function(arr, pt){
        for (let i=0; i<arr.length; i++) {
            if (arr[i].x === pt.x && arr[i].y === pt.y) {
                return i;
            }
        }
        return -1;
    }
    
    async function updateMapWithAoE (aoeLinks, obj, recalcNearest=true, offsetX=0, offsetY=0) {
        let pathLocations;
        let newPaths = [];
        let pageGridIncrement;
        //let offsetX = 0;    //if the origin/control pts are shifted from center of cell, find offset to allow cell paths to line up with actual grid 
        //let offsetY = 0; 
        let updatedLink;
        let rad;
        
        //delete the linked paths and clear the pathIDs array from the state object
            
            //do for each matching link in state object 
            for (let a=0; a<aoeLinks.indices.length; a++) {
                newPaths = [];
                //log('a = ' + a);
              
                
               	//generate new paths based on aoeType and current posiitons or originTok and controlTok
                let oTok = getObj("graphic", aoeLinks.links[a].originTokID);
                let oHeight = oTok.get('height');
                let oWidth = oTok.get('width');
                
                let cTok = getObj("graphic", aoeLinks.links[a].controlTokID);
                let cHeight = cTok.get("height");
                let cWidth = cTok.get("width");
                
                let originPtPx = new pt(oTok.get('left'), oTok.get('top'))  //the origin coords of the effect (in pixels) - this may be different than the origin token center    
                let controlPtPx = new pt(cTok.get('left'), cTok.get('top')) //the coords of the control pt of the effect (in pixels) - this may be different than the control token center
                
                let pageID = aoeLinks.links[a].pageID
                let page = getObj("page", pageID);
                
                //physically delete existing paths
                deleteLinkedPaths(aoeLinks.links[a].pathIDs);
                
                if (aoeLinks.links[a].aoeFloat===true && (aoeLinks.links[a].aoeType==='square' || aoeLinks.links[a].aoeType==='circle' || aoeLinks.links[a].aoeType==='PFcircle') ) {
                    originPtPx.x = controlPtPx.x;
                    originPtPx.y = controlPtPx.y;
                }
                
                if (page && recalcNearest) {
                    let oX, oY;
                    pageGridIncrement = page.get("snapping_increment");
                    pageScaleNumber = page.get("scale_number");
                                                               
                    //possibly shift origin pt
                    if (aoeLinks.links[a].originType.match(/nearest/i) && (aoeLinks.links[a].aoeType.match(/cone/i) || (aoeLinks.links[a].aoeType.match(/wall/i)&&aoeLinks.links[a].forceIntersection===false)) ) {
                        let possibleOrigins = getPossibleOriginPts(originPtPx, oHeight, oWidth, pageGridIncrement, aoeLinks.links[a].originType.match(/face/i))
                        aoeLinks.links[a].originPts = possibleOrigins.map((x) => x)
                        //log('STATE - originPts')
                        //log(aoeLinks.links[a].originPts)
                        
                        oX = originPtPx.x;
                        oY = originPtPx.y;
                        originPtPx = getNearestOriginPt(controlPtPx, originPtPx.x-oWidth/2, originPtPx.y-oHeight/2, originPtPx.x+oWidth/2, originPtPx.y+oHeight/2, possibleOrigins);
                        aoeLinks.links[a].originIndex = getIndexFromPtArray(possibleOrigins, originPtPx);
                        //log('STATE - originIndex' + aoeLinks.links[a].originIndex)
                        
                        offsetX = originPtPx.x - oX;
                        offsetY = originPtPx.y - oY;
                        //log('offsetX = ' + offsetX + ', offsetY = ' + offsetY);
                        //offsetX = oX - originPtPx.x;
                        //offsetY = oY - originPtPx.y;
                    } else {
                        aoeLinks.links[a].originPts = [originPtPx];
                        aoeLinks.links[a].originIndex = 0;
                    }
                } else if (page) {
                    pageGridIncrement = page.get("snapping_increment");
                    pageScaleNumber = page.get("scale_number");
                    //use the originPt found in state object link
                    originIndex = aoeLinks.links[a].originIndex;
                    originPtPx = aoeLinks.links[a].originPts[originIndex];
                }
                
                //walls are handled a bit differently. We're going to pre-calculate some parameters, which get used twice: once for grid area paths and once for aoe outline path 
                let wallParams;
                if (aoeLinks.links[a].aoeType==='wall') {
                    wallParams = getWallParams(originPtPx, controlPtPx, aoeLinks.links[a].radius, aoeLinks.links[a].wallWidth)
                }
                
                //This function returns the coords of the grid area paths (the individual squares)
                pathLocations = getPathLocations(aoeLinks.links[a], oTok, cTok, originPtPx, controlPtPx, offsetX, offsetY, pageGridIncrement, pageScaleNumber, wallParams);
                //log('pathLocations follows');
                //log(pathLocations);
                
                //define the bounding box of affected grid squares
                let ptUL = new pt(Math.min(...pathLocations.xVals)-35*pageGridIncrement, Math.min(...pathLocations.yVals)-35*pageGridIncrement);
                let ptUR = new pt(Math.max(...pathLocations.xVals)+35*pageGridIncrement, Math.min(...pathLocations.yVals)-35*pageGridIncrement);
                let ptLR = new pt(Math.max(...pathLocations.xVals)+35*pageGridIncrement, Math.max(...pathLocations.yVals)+35*pageGridIncrement);
                let ptLL = new pt(Math.min(...pathLocations.xVals)-35*pageGridIncrement, Math.max(...pathLocations.yVals)+35*pageGridIncrement);
                aoeLinks.links[a].boundingBox = [ptUL, ptUR, ptLR, ptLL];
                //log(aoeLinks.links[a].boundingBox);
                
                let path;
                let pathstring;
                
                for (let p=0; p<pathLocations.xVals.length; p++) {
                    pathstring = buildSquarePath(35*pageGridIncrement);
                    path = await new Promise(function(resolve){
                        //let thePath = createPath(pathstring, pageID, 'gmlayer', '#ff000050', '#000000', 2, cHeight, cWidth, pathLocations.xVals[p], pathLocations.yVals[p]);
                        //let thePath = createPath(pathstring, pageID, 'objects', '#ff000050', '#000000', 2, cHeight, cWidth, pathLocations.xVals[p], pathLocations.yVals[p]);
                        let thePath = createPath(pathstring, pageID, 'objects', aoeLinks.links[a].aoeColor, aoeLinks.links[a].gridColor, 2, 70*pageGridIncrement, 70*pageGridIncrement, pathLocations.xVals[p], pathLocations.yVals[p]);
                        resolve(thePath);
                    });
                    newPaths.push(path.get('_id'));
                }
                
                
                //create a path with the true outline of the AoE
                if (aoeLinks.links[a].aoeType==='5econe') {
                    //
                    //log('~~~~~~~~~~~~~~~~~~~~ TRIANGLE PATH~~~~~~~~~~~~~~~~~~~~');
                    let coneDirection = getAngle2ControlToken(originPtPx, controlPtPx);
                    if (aoeLinks.links[a].radius === 'variable') {
                        rad = distBetweenPts(originPtPx, controlPtPx);
                    } else {
                        rad = aoeLinks.links[a].radius;
                    }
                    let coneWidth = 53.14;  //hardcode
                    let z = (rad / (2* Math.sin(Math.atan(0.5)))) - rad;
                    
                    pathstring = build5eCone(rad, z, coneWidth, coneDirection)
                    path = await new Promise(function(resolve){
                        //let thePath = createPath(pathstring, pageID, 'gmlayer', 'transparent', '#ff0000', 3, rad*2, rad*2, originPtPx.x-z, originPtPx.y-z);
                        let thePath = createPath(pathstring, pageID, 'objects', 'transparent', aoeLinks.links[a].aoeOutlineColor, 3, rad*2, rad*2, originPtPx.x-z, originPtPx.y-z);
                        resolve(thePath);
                    });
                    newPaths.push(path.get('_id'));
                } else if (aoeLinks.links[a].aoeType==='cone' || aoeLinks.links[a].aoeType==='PFcone') {
                    //
                    //log('~~~~~~~~~~~~~~~~~~~~ CONE PATH~~~~~~~~~~~~~~~~~~~~');
                    let coneDirection = getAngle2ControlToken(originPtPx, controlPtPx);
                    if (aoeLinks.links[a].radius === 'variable') {
                        rad = distBetweenPts(originPtPx, controlPtPx);
                    } else {
                        rad = aoeLinks.links[a].radius;
                    }
                    //log(rad)
                    pathstring = buildCirclePath(rad, aoeLinks.links[a].coneWidth, coneDirection);
                    path = await new Promise(function(resolve){
                        //let thePath = createPath(pathstring, pageID, 'gmlayer', 'transparent', '#ff0000', 3, rad*2, rad*2, originPtPx.x-z, originPtPx.y-z);
                        let thePath = createPath(pathstring, pageID, 'objects', 'transparent', aoeLinks.links[a].aoeOutlineColor, 3, rad*2, rad*2, originPtPx.x, originPtPx.y);
                        resolve(thePath);
                    });
                    newPaths.push(path.get('_id'));
                } else if (aoeLinks.links[a].aoeType==='square') {
                    //
                    //log('~~~~~~~~~~~~~~~~~~~~ SQUARE PATH~~~~~~~~~~~~~~~~~~~~');
                    rad = aoeLinks.links[a].radius;
                    if (aoeLinks.links[a].radius === 'variable' && !aoeLinks.links[a].aoeFloat) {
                        rad = Math.max(Math.abs(originPtPx.x-controlPtPx.x), Math.abs(originPtPx.y-controlPtPx.y));
                    } 
                    
                    pathstring = buildSquarePath(rad)
                    path = await new Promise(function(resolve){
                        //let thePath = createPath(pathstring, pageID, 'gmlayer', 'transparent', '#ff0000', 3, rad*2, rad*2, originPtPx.x-z, originPtPx.y-z);
                        let thePath = createPath(pathstring, pageID, 'objects', 'transparent', aoeLinks.links[a].aoeOutlineColor, 3, rad*2, rad*2, originPtPx.x, originPtPx.y);
                        resolve(thePath);
                    });
                    newPaths.push(path.get('_id'));
                } else if (aoeLinks.links[a].aoeType==='circle' || aoeLinks.links[a].aoeType==='PFcircle') {
                    //
                    //log('~~~~~~~~~~~~~~~~~~~~ CIRCLE PATH~~~~~~~~~~~~~~~~~~~~');
                    if (aoeLinks.links[a].radius === 'variable') {
                        rad = distBetweenPts(originPtPx, controlPtPx);
                    } else {
                        rad = aoeLinks.links[a].radius;
                    }
                    //log(rad)
                    pathstring = buildCirclePath(rad, 360, 0);
                    path = await new Promise(function(resolve){
                        //let thePath = createPath(pathstring, pageID, 'gmlayer', 'transparent', '#ff0000', 3, rad*2, rad*2, originPtPx.x-z, originPtPx.y-z);
                        let thePath = createPath(pathstring, pageID, 'objects', 'transparent', aoeLinks.links[a].aoeOutlineColor, 3, rad*2, rad*2, originPtPx.x, originPtPx.y);
                        resolve(thePath);
                    });
                    newPaths.push(path.get('_id'));
                } else if (aoeLinks.links[a].aoeType==='wall') {
                    //
                    //log('~~~~~~~~~~~~~~~~~~~~ WALL PATH~~~~~~~~~~~~~~~~~~~~');
                    pathstring = buildWallPath(wallParams);
                    path = await new Promise(function(resolve){
                        let thePath = createPath(pathstring, pageID, 'objects', 'transparent', aoeLinks.links[a].aoeOutlineColor, 3, wallParams.heightBB, wallParams.widthBB, wallParams.pCenter.x, wallParams.pCenter.y);
                        resolve(thePath);
                    });
                    newPaths.push(path.get('_id'));
                }
                
                //Update the State object with new paths, originIndex, and bounding box array
                updateAoELink(aoeLinks.indices[a], newPaths, aoeLinks.links[a].originIndex, aoeLinks.links[a].boundingBox);
            }
    }
    
    const snapToIntersection = function (tok) {
        let pageID = tok.get('_pageid');
        let page = getObj("page", pageID);
        let pageGridIncrement = page.get('snapping_increment')
        let pageWidthPx = page.get('width')*70;
        let pageHeightPx = page.get('height')*70;
        
        //log('in snapToIntersection');
        //log(pageWidthPx);
        //log(pageHeightPx);
        //log(pageGridIncrement);
        
        let intersections = [];
        for (let i=0; i<=pageWidthPx*(1/pageGridIncrement); i+=70*pageGridIncrement) {
            for (let j=0; j<=pageHeightPx*(1/pageGridIncrement); j+=70*pageGridIncrement) {
                //log('i=' + i + ', j=' + j);
                
                intersections.push(new pt(i, j))
            }
        }
        //log('intersections.length = ' + intersections.length);
        let tokPt = new pt(tok.get('left'), tok.get('top'))
        let newPt = getClosestGridPt(tokPt, intersections, pageGridIncrement)
        //log(tokPt);
        //log(newPt);
        
        //grab the previous token settings before setting new ones
        let prevTok = JSON.parse(JSON.stringify(tok));
        //set new tok settings
        tok.set({left:newPt.x, top:newPt.y})
        //trigger tokenChange event for other api scripts
        notifyObservers('tokenChange',tok, prevTok);
    }
    
    //Move DL path to remain under source token
    async function smartAoE_handleTokenChange (obj,prev) {
        //find all paths linked to token, returns an array of aoeLinks objects or undefined
                //aoeLinks object looks like {links:[{aoeType, originTokID, controlTokID, pathIDs[], pageID}], indices:[]}
        
        //only trigger when token is moved
        if (obj.get('left') === prev.left && obj.get('top') === prev.top) {
            return;
        }
        let pathLocations;
        let newPaths = [];
        let pageGridIncrement;
        let offsetX = 0;    //if the origin/control pts are shifted from center of cell, find offset to allow cell paths to line up with actual grid 
        let offsetY = 0; 
        
        let tokID = obj.get('id');
        let aoeLinks = getAoELinks(tokID);
        //log('aoeLinks = next line')
        //log(aoeLinks)
        
        //potentially force the AoEControlToken to snap to grid intersection for floating AoE squares
        let tempLinks = [];
        if (aoeLinks) {
            tempLinks = aoeLinks.links.filter(link => {
                return (link.forceIntersection && (link.controlTokID===tokID || (link.originTokID===tokID && obj.get('name')==='AoEControlToken')))
            });
        }
        
        if (tempLinks.length > 0) {
            snapToIntersection(obj);
        }
        
        if (aoeLinks && obj) {
            updateMapWithAoE(aoeLinks, obj);
        } 
    }
    
    const deleteAoELinksAndControlToks = function(obj) {
        let controlToks = [];
        let tokID = obj['id'];
        
        let aoeLinks = getAoELinks(obj.get('id'));
        
        if (aoeLinks) {
            //aoeLinks.indices.forEach((index) => {
            for (i=aoeLinks.indices.length-1; i>-1; i--) {
                //delete the linked paths and clear the the associated links arrays from the state object
                let stateLinkIndex = aoeLinks.indices[i];
                deleteLinkedPaths(state[scriptName].links[stateLinkIndex].pathIDs);
                
                //If deleted token is a source token, remove all control tokens associated with that source token
                if (tokID === aoeLinks.links[i].originTokID && tokID !== aoeLinks.links[i].controlTokID) {
                    controlToks.push(aoeLinks.links[i].controlTokID);
                }
                
                //for walls (for which we spawned *two* controlToks), delete the "origin tok" also
                if (aoeLinks.links[i].aoeType.match(/wall/i)) {
                    controlToks.push(aoeLinks.links[i].originTokID);
                }
                
                //log('removing link index=' + index);
                //log(state[scriptName])
                //state[scriptName].links[index] = [];
                state[scriptName].links.splice(stateLinkIndex, 1)
                //log(state[scriptName])
            
            }  
            controlToks.forEach(id => {
                removeToken(id);
            });
        }
    }
    
    const smartAoE_handleRemoveToken = function(obj) {
        deleteAoELinksAndControlToks(obj)
    };
    
    //returns character object for given name
    const getCharacterFromName = function (charName) {
        let character = findObjs({
            _type: 'character',
            name: charName
        }, {caseInsensitive: true})[0];
        return character;
    };
    
    function processInlinerolls(msg) {
    	if(_.has(msg,'inlinerolls')){
    		return _.chain(msg.inlinerolls)
    		.reduce(function(m,v,k){
    			var ti=_.reduce(v.results.rolls,function(m2,v2){
    				if(_.has(v2,'table')){
    					m2.push(_.reduce(v2.results,function(m3,v3){
    						m3.push(v3.tableItem.name);
    						return m3;
    					},[]).join(', '));
    				}
    				return m2;
    			},[]).join(', ');
    			m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
    			return m;
    		},{})
    		.reduce(function(m,v,k){
    			return m.replace(k,v);
    		},msg.content)
    		.value();
    	} else {
    		return msg.content;
    	}
    }
    
    const processInlinerolls2 = function(str, parsedInlines) {
        let index;
        let inlineArr = [];
        let reg = /\$\[\[\d+\]\]/g;
        
        let foundInlines = str.match(reg) || [];
        
        foundInlines.forEach((inline) => {
            index = inline.replace(/\$\[\[/,'').replace(/\]\]/,'')
            
            str = str.replace(inline, parsedInlines[index].total);
            
            inlineArr.push(parsedInlines[index]);
        });
        return {text:str, inlines:inlineArr};
    }
    
    const parseArgs = function(msg) {
        msg.content = msg.content
            .replace(/<br\/>\n/g, ' ')
            .replace(/(\{\{(.*?)\}\})/g," $2 ")
            
        let parsedInlines = libInline.getRollData(msg) || [];
        
        //Check for inline rolls
        //inlineContent = processInlinerolls(msg);
        let args = msg.content.split(/\s+--/);
        args.shift();
        args = args.map(arg=>{
                let cmds = arg.split('|');
                let retVals = processInlinerolls2(cmds[1], parsedInlines);
                
                return {
                    cmd: cmds.shift().toLowerCase().trim(),
                    params: retVals.text,
                    inlines: retVals.inlines
                };
            });
        return args;
    };
    
    //replaceAttributes and processTokenRolls modified from Jakob's group-check script
    const replaceAttributes = function(formula, charID) {
        const myGetAttrByName = attrName => {
            const result = getAttrByName(charID, attrName);
            if (typeof result === "number") {
                return String(result);
            } else {
                return result || "";
            }
        }
        const replacer = (_, attrName) => myGetAttrByName(attrName);

      while (/@{(.*?)}/.test(formula)) formula = formula.replace(/@{(.*?)}/g, replacer);
      return formula;
    }
    
    const sortTokenRollsByLayer = function(tokenRolls) {
        //sorts in descending order ("objects", then "gmlayer")
        tokenRolls.sort((a, b) => {
            let layerA = a.layer.toLowerCase(),
                layerB = b.layer.toLowerCase();
        
            if (layerA > layerB) {
                return -1;
            }
            if (layerA < layerB) {
                return 1;
            }
            return 0;
        });
        return tokenRolls;
    }
    
    const processTokenRolls = function(token, link) {
        const charID = token.get("represents"),
            character = getObj("character", charID),
            displayName = token.get("name");
            tokenPic = token.get("imgsrc").replace(/(?:max|original|med)\.png/, "thumb.png");
            layer = token.get("layer")
            
        let attrs = findObjs({                              
            _type: "attribute",
            _characterid: charID
        }, {caseInsensitive: true});
        
        let resistances = '';
        let vulnerabilities = '';
        let immunities = '';
        let roll2x = false;
        
        if (attrs) {
            //Resistances
            let tempAttrs = attrs.filter(att => {
            	return link.resistAttrs.includes(att.get('name'))
            });
            if (tempAttrs.length > 0) {
                resistances = tempAttrs.map(e => e.get('current').toLowerCase()).join('');
            }
            
            //Vulnerabilities
            tempAttrs = attrs.filter(att => {
            	return link.vulnerableAttrs.includes(att.get('name'))
            });
            if (tempAttrs.length > 0) {
                vulnerabilities = tempAttrs.map(e => e.get('current').toLowerCase()).join('');
            }
            
            
            //Immunities
            tempAttrs = attrs.filter(att => {
            	return link.immunityAttrs.includes(att.get('name'))
            });
            if (tempAttrs.length > 0) {
                immunities = tempAttrs.map(e => e.get('current').toLowerCase()).join('');
            }
            
            //Magic Resistance (likely 5e-only)
            tempAttrs = attrs.filter(att => att.get('current').toString().toLowerCase().includes('magic resist'));
            if (tempAttrs.length > 0) { roll2x = true }
        }
        
        let computedFormula;
        if (character) {
            if (link.noSave===true) {
                computedFormula = '[[0]]'
            } else {
                computedFormula = replaceAttributes(link.saveFormula, charID);
            }
        } else {
            return null;
        }
        
        //if (ro === "adv") computedFormula = `${computedFormula.replace(/1?d20/, opts.die_adv)} (Advantage)`;
        //if (ro === "dis") computedFormula = `${computedFormula.replace(/1?d20/, opts.die_dis)} (Disadvantage)`;
        
        return {
            "pic": tokenPic,
            "name": displayName,
            "layer": layer,
            //"roll2": (ro === "roll2"),
            "saveName": link.saveName,
            "DC": link.DC,
            //"damage": damage,
            "roll2x": roll2x,
            "formula": computedFormula,
            "id": token.id,
            "resistances": resistances,
            "vulnerabilities": vulnerabilities,
            "immunities": immunities,
        };
    }
    
    // Format inline rolls
    const extractDiceRoll = roll => {
        if (roll.type === "V" && roll.rolls) {
            return roll.rolls.map(extractDiceRoll).reduce((m,x) => m+x,0);
        }
        if (roll.type === "G" && roll.rolls) {
            return _.flatten(roll.rolls).map(extractDiceRoll).reduce((m,x) => m+x,0);
        }
        if (roll.type === "R") {
            return roll.results.filter(x => x.v && !x.d).map(x => x.v).reduce((m,x) => m+x,0);
        } else {
            return 0;
        }
    };
    
    const processDamageMessages = function(messages, damageRolls) {
        messages.forEach((msgList, j) => {
            const inlinerollData = (msgList[0].inlinerolls || []).map(roll => {
                return {
                    raw: extractDiceRoll(roll.results),
                    result: roll.results.total || 0,
                    styled: makeInlineroll(roll, false) //convert to variable later
                };
            });
            msgList[0].content.split("<br>").forEach((str, n) => {
                damageRolls[j][`result_${(n+1)}`] = [];
                damageRolls[j][`raw_${(n+1)}`] = [];
                damageRolls[j][`styled_${n+1}`] = str.replace(/\$\[\[(\d+)\]\]/g, (_, number) => {
                    damageRolls[j][`result_${(n+1)}`].push(inlinerollData[parseInt(number)].result);
                    damageRolls[j][`raw_${(n+1)}`].push(inlinerollData[parseInt(number)].raw);
                    return inlinerollData[parseInt(number)].styled;
                });
            });
        });
        return damageRolls;
    }
    
    //this was modified from Jakob's group-check api script
    const processMessagesMaster = function(messages, damageRolls, tokenRolls, aoeLink) {
        //takes all the rolls that were processed thru the Roll20 die roller for all tokens and formats them.
        //   then, we will format the final chat output
        let freetext = "";
        let rowData = '';
        if (damageRolls.length > 0) {
            messages.forEach((msgList, j) => {
                const inlinerollData = (msgList[0].inlinerolls || []).map(roll => {
                    return {
                        raw: extractDiceRoll(roll.results),
                        result: roll.results.total || 0,
                        styled: makeInlineroll(roll, false) //convert to variable later
                    };
                });
                
                msgList[0].content.split("<br>").forEach((str, n) => {
                    damageRolls[j][`result_${(n+1)}`] = [];
                    damageRolls[j][`raw_${(n+1)}`] = [];
                    damageRolls[j][`styled_${n+1}`] = str.replace(/\$\[\[(\d+)\]\]/g, (_, number) => {
                        damageRolls[j][`result_${(n+1)}`].push(inlinerollData[parseInt(number)].result);
                        damageRolls[j][`raw_${(n+1)}`].push(inlinerollData[parseInt(number)].raw);
                        return inlinerollData[parseInt(number)].styled;
                    });
                });
            });
        }
        
        if (tokenRolls.length > 0) {
            Promise.all(tokenRolls.map(o => new Promise((resolve) => {
                    sendChat("", `${o.formula}${o.roll2x ? `<br>${o.formula}` : ""}`, resolve);
                })))
                .then(async(messages) => processFinalMessages(messages, damageRolls, tokenRolls, aoeLink))
                .catch(sendErrorMessage);
        } else {
            let output = buildTitle(aoeLink.cardParameters);
            
            if (damageRolls[0].result_1[0]) {
                if (damageRolls.length > 1) {
                    if (damageRolls[1].result_1[0]) {
                        //two damage rolls
                        output = output + buildDamageRow(damageRolls[0].styled_1, aoeLink.damageType1, false, damageRolls[1].styled_1, aoeLink.damageType2, aoeLink.cardParameters)
                    } else {
                        //one damage roll
                        output = output + buildDamageRow(damageRolls[0].styled_1, aoeLink.damageType1, false, '', '', aoeLink.cardParameters)
                    }
                } else {
                    //one damage roll
                    output = output + buildDamageRow(damageRolls[0].styled_1, aoeLink.damageType1, false, '', '', aoeLink.cardParameters)
                }
                
                let descRow = buildDescRow(aoeLink.cardParameters.descriptiontext, aoeLink.cardParameters)
                output = output + buildTableBody('', '', descRow, aoeLink.cardParameters);
                sendChat(scriptName, output);
            }
        }
    }
    
    const removeToken = function(tokID) {
        let tok = getObj('graphic', tokID);
        
        if (tok) {
            tok.remove();
        }
    }
    
    const applyDamage = function(tokID, name, bar, damageArr, zeroHPmarker, removeAtZero=false) {
        let tok = getObj('graphic', tokID);
        let currentHP = [];
        let maxHP = [];
        let newHP = [];
        let amountHealed;
        let remainingDamage;
        
        //Multiple bar values may be present. bar is an array of 1 to 3 elements. Damage will apply to them in order, cascading down if more damage remains.
        if (bar.length > 0) {
            bar.map(b => {
                currentHP.push(parseInt(tok.get(`bar${b}_value`)) || 0);
                maxHP.push(parseInt(tok.get(`bar${b}_max`)) || 99999);
            });
        } else {
            currentHP.push(0);
            maxHP.push(0);
        }
        
        let damage = damageArr.map(e=>parseInt(e)).reduce((a, b) => (a+b));
        
        if (damage >= 0) {
            //damage can't reduce below 0
            //first bar value
            newHP.push(Math.max(currentHP[0] - damage, 0));
            if (damage > currentHP[0] && bar.length > 1) {
                remainingDamage = damage - currentHP[0];
                //second bar value
                newHP.push(Math.max(currentHP[1] - remainingDamage, 0));
                if (remainingDamage > currentHP[1] && bar.length > 2) {
                    remainingDamage = remainingDamage - currentHP[1];
                    //third bar value
                    newHP.push(Math.max(currentHP[2] - remainingDamage, 0));
                }
            }
            returnString = `Applied ${damage} damage to ${name}`;
        } else {
            //negative damage = healing! Can't heal above max.
            //newHP = Math.min(currentHP - damage, maxHP);
            let absDamage = Math.abs(damage);
            newHP.push(Math.min(currentHP[0] - damage, maxHP[0]));
            amountHealed = newHP[0] - currentHP[0];
            
            if (absDamage + currentHP[0] > maxHP[0] && bar.length > 1) {
                remainingDamage = absDamage - (maxHP[0] - currentHP[0]);
                //second bar value
                newHP.push(Math.min(currentHP[1] - damage, maxHP[1]));
                amountHealed += newHP[1] - currentHP[1];
                if (remainingDamage + currentHP[1] > maxHP[1] && bar.length > 2) {
                    remainingDamage = remainingDamage - (maxHP[1] - currentHP[1]);
                    //third bar value
                    newHP.push(Math.min(currentHP[2] - damage, maxHP[2]));
                    amountHealed += newHP[2] - currentHP[2];
                }
            }
            returnString = newHP===maxHP ? `Healed ${name} by ${amountHealed} (@Max)` : `Healed ${name} by ${amountHealed}`;
        }
        
        if (zeroHPmarker && newHP[bar.length-1]===0) {
            let dummy = addStatusMarkers(tokID, zeroHPmarker);
        }
        
        if (removeAtZero && newHP===0) {
            let dummy = removeToken(tokID);
        } else {
            //grab the previous token settings before setting new ones
            let prevTok = JSON.parse(JSON.stringify(tok));
            //set new tok settings
            newHP.map((hp,idx) => {
                tok.set(`bar${bar[idx]}_value`, newHP[idx]);
            });
            //tok.set(`bar${bar}_value`, newHP);
            //trigger tokenChange event for other api scripts
            notifyObservers('tokenChange',tok, prevTok);
            
        }
        
        return returnString;
        //return damage>0 ? `Applied ${damage} damage to ${name}` : `Healed ${name} by ${amountHealed}`;
        
    }
    
    const addStatusMarkers = function(tokID, markerString) {
        let tok = getObj('graphic', tokID);
        let currentMarkers = tok.get('statusmarkers');
        
        //ensure no spaces between entries in the comma-delimited string
        markerString = markerString.split(',').map((s) => s.trim()).join(',');
        
        //grab the previous token settings before setting new ones
        let prevTok = JSON.parse(JSON.stringify(tok));
        //set new tok settings
        tok.set("statusmarkers", currentMarkers + ',' + markerString);
        //trigger tokenChange event for other api scripts
        notifyObservers('tokenChange',tok, prevTok);
    }
    
    const removeStatusMarkers = function(tokID, markerString) {
        let tok = getObj('graphic', tokID);
        let currentMarkers = tok.get('statusmarkers').split(',');
        
        let markersToRemove = markerString.split(',');
        
        for (let i=currentMarkers.length-1; i>=0; i--) {
            for (let j=0; j<markersToRemove.length; j++) {
                if (currentMarkers[i]===markersToRemove[j]) {
                    currentMarkers.splice(i,1)
                }
            }
        }
        
        //grab the previous token settings before setting new ones
        let prevTok = JSON.parse(JSON.stringify(tok));
        //set new tok settings
        tok.set("statusmarkers", currentMarkers.join(','));
        //trigger tokenChange event for other api scripts
        notifyObservers('tokenChange',tok, prevTok);
    }
    
    const applyMathRule = function(val, rule){  
        //rule should look like "*2", "-10", "/2", etc.
        rule = rule.replace(/\s+/g, '');
        
        let operator = rule.substring(0, 1);
        let operand = parseFloat(rule.replace(operator,''));
        
        switch (operator) {
            case "*":
                retVal = Math.floor(val * operand);
                break;
            case "/":
                retVal = Math.floor(val / operand);
                break;
            case "+":
                retVal = val + operand;
                break;
            case "-":
                retVal = val - operand;
                break;
        }
        return retVal;  
    }
    
    //this was modified from Jakob's group-check api script
    const processFinalMessages = function(messages, damageRolls, tokenRolls, aoeLink) {
        //takes all the rolls that were processed thru the Roll20 die roller for all tokens and formats them.
        //   then, we will format the final chat output
        let freetext = "";
        let rowData = '';
        let saveName = tokenRolls[0].saveName;
        let publicDamageMessages = [];
        let gmDamageMessages = [];
        let autoApplyMsg = '';
        let name;   //override for ApplyDamage function
        
        messages.forEach((msgList, j) => {
            const inlinerollData = (msgList[0].inlinerolls || []).map(roll => {
                return {
                    raw: extractDiceRoll(roll.results),
                    result: roll.results.total || 0,
                    styled: makeInlineroll(roll, false) //convert to variable later
                };
            });
            msgList[0].content.split("<br>").forEach((str, n) => {
                tokenRolls[j][`result_${(n+1)}`] = [];
                tokenRolls[j][`raw_${(n+1)}`] = [];
                tokenRolls[j][`styled_${n+1}`] = str.replace(/\$\[\[(\d+)\]\]/g, (_, number) => {
                    tokenRolls[j][`result_${(n+1)}`].push(inlinerollData[parseInt(number)].result);
                    tokenRolls[j][`raw_${(n+1)}`].push(inlinerollData[parseInt(number)].raw);
                    return inlinerollData[parseInt(number)].styled;
                });
            });
        });
        
        // Format rows of output
        let outputNew = buildTitle(aoeLink.cardParameters);
        
        if (damageRolls[0].result_1[0]) {
            if (damageRolls.length > 1) {
                if (damageRolls[1].result_1[0]) {
                    //two damage rolls
                    outputNew = outputNew + buildDamageRow(damageRolls[0].styled_1, aoeLink.damageType1, false, damageRolls[1].styled_1, aoeLink.damageType2, aoeLink.cardParameters)
                } else {
                    //one damage roll
                    outputNew = outputNew + buildDamageRow(damageRolls[0].styled_1, aoeLink.damageType1, false, '', '', aoeLink.cardParameters)
                }
            } else {
                //one damage roll
                outputNew = outputNew + buildDamageRow(damageRolls[0].styled_1, aoeLink.damageType1, false, '', '', aoeLink.cardParameters)
            }
        }
        
        let saveHeaderRow = buildSaveHeaderRow(aoeLink.cardParameters)
        
        //log(tokenRolls)
        //Calculate damage and status markers based on individual saving throws 
        const saveRolls = tokenRolls.map((o, i) => {
            let tempDam1, tempDam2;
            let thisDamage = [];
            let thisDamageType = [];
            let thisMarker = '';
            let thisSaveRoll;
            let RVI = [];   //Resistances, Vulnerabilities, Immunities 
            let RVI_string = '';
            
            tempDam1 = damageRolls[0].result_1;
            
            let damType1 = aoeLink.damageType1.toLowerCase()
            let damType2 = aoeLink.damageType2.toLowerCase()
            /*
            log(o.name)
            log('vulnerabilities = ' + o.vulnerabilities);
            log('resistances = ' + o.resistances);
            log('immunities = ' + o.immunities);
            
            log('vulnerableRule = ' + aoeLink.vulnerableRule);
            log('resistanceRule = ' + aoeLink.resistanceRule);
            log('immunityRule = ' + aoeLink.immunityRule);
            
            log('base damage1 = ' + tempDam1 + ' ' + damType1)
            */
            
            thisSaveRoll = o.result_1;
            if (o.roll2x) {
                RVI.push('A');      //rolling with advantage
                if (o.result_1[0] >= o.result_2[0]) {
                    o.styled_2 = o.styled_2.replace("color:#000000", "color:#999999");
                } else if (o.result_2[0] > o.result_1[0]) {
                    thisSaveRoll = o.result_2;
                    o.styled_1 = o.styled_1.replace("color:#000000", "color:#999999");
                }
            }
            
            //Account for Vulnerabilities, resistances, and immunities for damage types 1 & 2
            if (damType1 !== '' && o.vulnerabilities.includes(damType1)) { tempDam1 = applyMathRule(tempDam1, aoeLink.vulnerableRule); pushUniqueElementToArray(RVI, 'V') }
            if (damType1 !== '' && o.resistances.includes(damType1)) { tempDam1 = applyMathRule(tempDam1, aoeLink.resistanceRule); pushUniqueElementToArray(RVI, 'R') }
            if (damType1 !== '' && o.immunities.includes(damType1)) { tempDam1 = applyMathRule(tempDam1, aoeLink.immunityRule); pushUniqueElementToArray(RVI, 'I') }
            if (damageRolls.length > 1) {
                tempDam2 = damageRolls[1].result_1;
                if (damType2 !== '' && o.vulnerabilities.includes(damType2)) { tempDam2 = applyMathRule(tempDam2, aoeLink.vulnerableRule); pushUniqueElementToArray(RVI, 'V') }
                if (damType2 !== '' && o.resistances.includes(damType2)) { tempDam2 = applyMathRule(tempDam2, aoeLink.resistanceRule); pushUniqueElementToArray(RVI, 'R') }
                if (damType2 !== '' && o.immunities.includes(damType2)) { tempDam2 = applyMathRule(tempDam2, aoeLink.immunityRule); pushUniqueElementToArray(RVI, 'I') }
            }
            if (RVI.length > 0) { RVI_string = RVI.join(',') }
            
            //check save result
            if (thisSaveRoll >= o.DC) {
                success = true;
                //thisDamage.push(Math.floor(damageRolls[0].result_1 / 2));
                tempDam1 = applyMathRule(tempDam1, aoeLink.damageSaveRule)
                
                //tempDam = applyMathRule(tempDam, aoeLink.resistanceRule)
                thisDamage.push(tempDam1);
                //check for 2nd damage type
                if (damageRolls.length > 1) {
                    //thisDamage.push(Math.floor(damageRolls[1].result_1 / 2));
                    tempDam2 = applyMathRule(tempDam2, aoeLink.damageSaveRule)
                    thisDamage.push(tempDam2);
                }
                if (aoeLink.conditionPass && aoeLink.autoApply) {
                    addStatusMarkers(o.id, aoeLink.conditionPass)
                }
                thisMarker = aoeLink.conditionPass;
            } else {
                success = false;
                thisDamage.push(tempDam1);
                if (damageRolls.length > 1) {
                    thisDamage.push(tempDam2);
                }
                if (aoeLink.conditionFail && aoeLink.autoApply) {
                    addStatusMarkers(o.id, aoeLink.conditionFail);
                }
                
                thisMarker = aoeLink.conditionFail;
            }
            
            if (aoeLink.hideNames) {
                targetNum += 1;
                name = `Target_${targetNum}`;
            } else {
                name = o.name;
            }
            
            if (aoeLink.autoApply) {
                let damMsg = applyDamage(o.id, name, aoeLink.damageBar, thisDamage, aoeLink.zeroHPmarker, aoeLink.removeAtZero);
                if (damMsg !== '') { 
                    if (o.layer === 'gmlayer') {
                        gmDamageMessages.push(damMsg)
                    } else {
                        publicDamageMessages.push(damMsg)
                    }
                };
            }
            
            return buildSaveRow(o.pic, o.id, o.layer, name, success, o.styled_1, o.styled_2, o.roll2x, false, thisDamage, aoeLink.autoApply, aoeLink.damageBar, thisMarker, RVI_string, aoeLink.zeroHPmarker, aoeLink.removeAtZero, aoeLink.cardParameters);
        });
        
        let publicSaveRolls = saveRolls.filter(r => {return r.layer!=='gmlayer'})
        		                        .map(e => {return e.output})
                                        .join('');
        
        let gmSaveRolls = saveRolls.filter(r => {return r.layer==='gmlayer'})
                            		.map(e => {return e.output})
                                    .join('');

        
        let descRow = buildDescRow(aoeLink.cardParameters.descriptiontext, aoeLink.cardParameters)
        
        //outputNew = outputNew + buildTableBody(saveHeaderRow, allSaveRows, descRow, aoeLink.cardParameters);
        publicOutput = outputNew + buildTableBody(saveHeaderRow, publicSaveRolls, descRow, aoeLink.cardParameters);
        //log(publicOutput);
        
        //public output
        sendChat(scriptName, publicOutput);
        if (publicDamageMessages.length > 0) {
            autoApplyMsg = '<br>' + publicDamageMessages.join('<br>');
            sendChat(scriptName, autoApplyMsg);
        }
        
        //GM output
        if (gmSaveRolls) {
            gmOutput = buildGMOutput(gmSaveRolls, aoeLink.cardParameters);
            //log(gmOutput);
            sendChat(scriptName, `/w gm ${gmOutput}`);
        }
        if (gmDamageMessages.length > 0) {
            autoApplyMsg = '/w gm <br>' + gmDamageMessages.join('<br>');
            sendChat(scriptName, autoApplyMsg);
        }
    }
    
    const throwError = error => handleError(msg.playerid, error);
                    
    const sendErrorMessage = err => {
        const errorMessage = "Something went wrong with the roll. The command you tried was:<br>" +
            `${msg.content}<br>The error message generated by Roll20 is:<br>${err}`;
        throwError(errorMessage);
    };
    
    async function smartAoE_handleInput (msg) {
        var who;
        var whisperString;
        var selectedID;
        var playerID;               //which player called the script. Will determine who gets whispered results 
        let tok;
        let tokID;
        let pageID;
        let selected = msg.selected;
        let radius = 'variable';             //maximum radius, in pixels
        let wallWidth = 70;
        let originType = 'center';         //"nearest" corner/face, "center"
        let aoeType = 'line';
        let offsetX = 0;
        let offsetY = 0;
        let forceIntersection;
        let coneWidth;
        var controlToks = [];
        var controlTok = {};             //hoist to top so we can set from within a callback function
        let minGridArea = 0.01;            //from 0 to 1, minimum fraction of grid cell to be "counted" as within AoE (ignored for line effects)
        let minTokArea = 0.01;             //from 0 to 1, minimum fraction of token area in order to be "counted" as within AoE
        let aoeLinks;
        let fxType = '';
        let controlTokName = 'AoEControlToken';
        let controlTokSize = 1;
        let controlTokSide = -999;
        var aoeColor = '#ff000050';
        var aoeOutlineColor = '#ff0000';
        var gridColor = '#000000';
        let instant = false;
        let isDrawing = false;
        let ignoreAttr = '';
        let ignoreVal = '';
        //let filter = {              //optional filters for which tokens will be ignored
        //    type: "",               //types include "char" and "tok"
        //    attr: "",               //key to filter on. e.g. "npc_type" attribute for a character sheet, or "bar3" for a token filter
        //    vals: [],                //array of values for which to filter against filter.attr     e.g. ["celestial", "fiend", "undead"]
        //    compareType: [],        //possible values: 'contains'(val is somewhere in string), '@'(exact match), '>' or '<' (numeric comparison)
        //    ignore: [],             //flag to determine if the value is an ignore filter or a positive match filter
        //    anyValueAllowed: false,  //this flag will bypass normal checks. Used only for charFilters - The attribute just needs to exist in order for the token to be ignored 
        //}
        let DC = 0;
        let noSave = false;
        let saveFormula = '';
        let saveName = '';
        let damageFormula1 = 'damageFormula1';
        let damageFormula2 = 'damageFormula2';
        let rollDamage1 = false;
        let rollDamage2 = false;
        let damageBase1 = 0;
        let damageBase2 = 0;
        let damageExpression1 = '';
        let damageExpression2 = '';
        let damageType1 = '';
        let damageType2 = '';
        let damageBar = [1];
        let conditionFail = '';
        let conditionPass = '';
        let zeroHPmarker = '';
        let removeAtZero = false;
        let autoApply = false;
        let aoeFloat = false;
        
        let damageSaveRule = '*0.5';
        let resistanceRule = '*0.5';
        let vulnerableRule = '*2';
        let immunityRule = '*0';
        let resistAttrs = ['npc_resistances'];
        let vulnerableAttrs = ['npc_vulnerabilities'];
        let immunityAttrs = ['npc_immunities'];
        
        let pathstring;             //JSON string for paths
        let polygon = [];           //array containing points
        
        let oTok;                   //origin token
        let convertRadius = "";      //will we need to convert range from pixels to "u" or another page-defined distance unit?
        let convertWidth = "";      //will we need to convert the wallWidth from pixels to "u" or another page-defined distance unit?
        let losBlocks = false;      //Will DL walls block AoE? (will look at 5 pts per token to determine LoS)
        let hideNames = false;
        let getFillColor = false;
        let getOutlineColor = false;
        
        let resourceName = "";
        let resourceCost = 0;
        let resourceAlias = "";
        
        try {
            //-------------------------------------------------------------------------------
            //   Clears the State Object of all aoeLinks!
            //-------------------------------------------------------------------------------
            if(msg.type=="api" && msg.content.toLowerCase().indexOf("!smartclearcache")==0) {
                let player = getObj('player',msg.playerid);
                if (player) {
                    who = getObj('player',msg.playerid).get('_displayname');
                    who===undefined ? whisperString='' : whisperString = `/w "${who}"`;
                } else {
                    whisperString='';
                }
                clearCache('temp');
                sendChat(scriptName, `${whisperString} The SmartAoE cache has been cleared and all AoEs have been unlinked!<br>Any active AoEs in the campaign will have to be deleted manually.`, null, {
                        noarchive: true
                    });
            }
            
            //-------------------------------------------------------------------------------
            //   Removes AoE's linked to the selected token by simulating a RemoveToken event
            //-------------------------------------------------------------------------------
            if(msg.type=="api" && msg.content.toLowerCase().indexOf("!smartremove")==0) {
                let player = getObj('player',msg.playerid);
                if (player) {
                    who = getObj('player',msg.playerid).get('_displayname');
                    who===undefined ? whisperString='' : whisperString = `/w "${who}"`;
                } else {
                    whisperString='';
                }
                let tokID;
                
                let args = msg.content.split(/\s+/);
                
                if (args.length > 1) {
                    tokID = args[1]
                } else if (msg.selected) {
                    tokID = msg.selected[0]._id;
                } else {
                    sendChat(scriptName, `${whisperString} You must have a token selected or pass a valid token_id in order to proceed`, null, {
                        noarchive: true
                    });
                    return;
                }
                
                tok = getObj('graphic', tokID);
                deleteAoELinksAndControlToks(tok);
                
            }
            
            //-------------------------------------------------------------------------
            //   Looks for and triggers any AoE's that overlap a selected token's space
            //-------------------------------------------------------------------------
            if(msg.type=="api" && msg.content.toLowerCase().indexOf("!smartquery")==0) {
                let player = getObj('player',msg.playerid);
                if (player) {
                    who = getObj('player',msg.playerid).get('_displayname');
                    who===undefined ? whisperString='' : whisperString = `/w "${who}"`;
                } else {
                    whisperString='';
                }
                let targetTok;
                let targetTokID;
                
                let args = msg.content.split(/\s+/);
                
                if (args.length > 1) {
                    targetTokID = args[1]
                } else if (msg.selected.length > 0) {
                    targetTokID = msg.selected[0]._id;
                } else {
                    sendChat(scriptName, `${whisperString} You must have a token selected or pass a valid token_id in order to proceed`, null, {
                        noarchive: true
                    });
                }
                targetTok = getObj('graphic', targetTokID);
                
                if (targetTok) {
                    //let tokCenterPt = {x: targetTok.get("left"), y: targetTok.get("top")};
                    let aoeLinks = getAoELinks(targetTokID, true);
                    
                    if (aoeLinks) {
                        aoeLinks.links.forEach(link => {
                            sendChat('', `!smarttrigger ${link.controlTokID} ${targetTok.get("_id")}`)
                        })
                    }
                } else {
                    sendChat(scriptName, `${whisperString} Unable to find a token with id = ${targetTokID}`, null, {
                        noarchive: true
                    });
                }
            }
            
            //--------------------------------------------------------------------
            //   Applies Damage & Status Markers via chat interaction
            //--------------------------------------------------------------------
            if(msg.type=="api" && msg.content.toLowerCase().indexOf("!smartapply")==0) {
                let player = getObj('player',msg.playerid);
                if (player) {
                    who = getObj('player',msg.playerid).get('_displayname');
                    who===undefined ? whisperString='' : whisperString = `/w "${who}"`;
                } else {
                    whisperString='';
                }
                
                //Before parsing, Un-replace any temporary special character replacements made when the button event text was created
                let args = msg.content.replace(/%apostrophe%/g, '\'').replace(/%backtick%/g, '\`').split(/\s+--args/);
                if (args.length > 1) {
                    args = args[1].split(/\|/);
                }
                
                let damageMsg = '';
                //let marker = '';
                //let zeroHPmarker = ''
                
                let tokenID = args[1];
                let name = args[2]
                let bar = args[3].split(',').map(b=>b.trim());
                let damageArr = args[4].split('/').map(e=>parseInt(e));
                
                let marker = args[5].replace(/%%/g,'::').replace('n/a','') || '';         //not all commands will include status marker(s)
                let zeroHPmarker = args[6].replace(/%%/g,'::').replace('n/a','') || ''    //not all commands will include seroHPmarker(s)
                
                let removeAtZero = args[7].includes('true') ? true : false;
                let whisperOutput = args[8].includes('true') ? true : false;
                
                let token = getObj('graphic', tokenID);
                if (token) {
                    damageMsg = applyDamage(tokenID, name, bar, damageArr, zeroHPmarker, removeAtZero);
                    
                    if (whisperOutput) {
                        sendChat(scriptName, `/w gm ${damageMsg}`)
                    } else {
                        sendChat(scriptName, damageMsg)
                    }
                    
                    if (marker) {
                        addStatusMarkers(tokenID, marker); 
                    }
                } else {
                    sendChat(scriptName, `${whisperString} TokenID ${tokenID} does not seem to exist. Perhaps it was deleted or the id is incorrect.`, null, {
                        noarchive: true
                    });
                }
            }
            
            //--------------------------------------------------------------------
            //   Ping token
            //--------------------------------------------------------------------
            if(msg.type=="api" && msg.content.toLowerCase().match(/!smartping[gm|all]/)) {
                let player = getObj('player',msg.playerid);
                if (player) {
                    who = getObj('player',msg.playerid).get('_displayname');
                    who===undefined ? whisperString='' : whisperString = `/w "${who}"`;
                } else {
                    whisperString='';
                }
                
                let args = msg.content.split(/\s+/);
                let tokenID = args[1];
                
                let token = getObj('graphic', tokenID);
                if (token) {
                    let page = getObj('page', token.get('_pageid'));
                    if (msg.content.includes('smartpingall')) {
                        sendPing(token.get("left"), token.get("top"), page.get('_id'), msg.playerid, true);
                    } else {
                        sendPing(token.get("left"), token.get("top"), page.get('_id'), msg.playerid, true, msg.playerid);
                    }
                } else {
                    sendChat(scriptName, `${whisperString} TokenID ${tokenID} does not exist. Perhaps it was deleted or the id is incorrect.`, null, {
                        noarchive: true
                    });
                }
            }
            
            //--------------------------------------------------------------------
            //   Rotate origin pt commands
            //--------------------------------------------------------------------
            if(msg.type=="api" && msg.content.toLowerCase().indexOf("!smartrotateorigin")==0) {
               let player = getObj('player',msg.playerid);
                if (player) {
                    who = getObj('player',msg.playerid).get('_displayname');
                    who===undefined ? whisperString='' : whisperString = `/w "${who}"`;
                } else {
                    whisperString='';
                }
                
                let cmd = msg.content.split(/\s+/);
                //log(cmd);
                
                if (cmd.length > 1) {
                    let tok;
                    let direction;  // either +1 or -1
                    let newindex;
                    let updatedLink;
                    
                    tok = getObj("graphic",msg.selected[0]._id);
                    //log(tok);
                    
                    if (!tok) {
                        sendChat(scriptName,`${whisperString} You must select a token to proceed`);
                        return;
                    }
                    
                    if (cmd[1].match(/ccw/i)) {
                        //rotate originPt counter-clockwise
                        direction = -1;
                    } else {
                        //default: rotate originPt clockwise
                        direction = 1;
                        //log('direction = ' + direction);
                    }
                    
                    aoeLinks = getAoELinks(tok.get('id'));
                    
                    if (aoeLinks.indices.length > 0) {
                        //for each link associated with selected token (could be originTok or controlTok)
                        for (let a=0; a<aoeLinks.indices.length; a++) {
                            if (aoeLinks.links[a].aoeFloat === false || aoeLinks.links[a].aoeType.match(/wall/i) ) {     //if floating AoE, rotating the origin point has no meaning (unless it is a wall, lol)
                            
                                //find new index (recycle through array of potential originPts)
                                if (aoeLinks.links[a].originIndex + direction < 0) {
                                    newIndex = aoeLinks.links[a].originPts.length - 1;
                                } else if (aoeLinks.links[a].originIndex + direction > aoeLinks.links[a].originPts.length - 1) {
                                    newIndex = 0;
                                } else {
                                    newIndex = aoeLinks.links[a].originIndex + direction;
                                }
                                //log('newIndex = ' + newIndex);
                                aoeLinks.links[a].originIndex = newIndex;
                                
                                //Update the State object with new origin index
                                let oTok = getObj("graphic", aoeLinks.links[a].originTokID)
                                let oX = oTok.get("left");
                                let oY = oTok.get("top");
                                let offsetX = aoeLinks.links[a].originPts[aoeLinks.links[a].originIndex].x - oX;
                                let offsetY = aoeLinks.links[a].originPts[aoeLinks.links[a].originIndex].y - oY;
                                //Re-draw the AoE on Map
                                updateMapWithAoE(aoeLinks, tok, false, offsetX, offsetY);
                            }
                        }
                    }
                    
                }
            }
            
            
            //--------------------------------------------------------------------
            //   Trigger AoE Effect             !smarttrigger <optional controlTokID> <optional targetTokID>
            //--------------------------------------------------------------------
            if(msg.type=="api" && msg.content.toLowerCase().indexOf("!smarttrigger")==0) {
                let player = getObj('player',msg.playerid);
                if (player) {
                    who = getObj('player',msg.playerid).get('_displayname');
                    who===undefined ? whisperString='' : whisperString = `/w "${who}"`;
                } else {
                    whisperString='';
                }
                
                let args = msg.content.split(/\s+/);
                let singleTarget = false;
                let targetID;
                let targetTok;
                
                if (args.length === 1) {
                    //no ids passed - standard trigger that affects all toks in range
                    tok = getObj("graphic",msg.selected[0]._id);
                } else {
                    //ids passed, this is a trigger for a single target (e.g. effect that happens on the targets turn rather than one a caster's turn)
                    tok = getObj("graphic",args[1]);
                    targetID = args[2];
                    targetTok = getObj("graphic", targetID);
                    singleTarget = true;
                }
                
                tableLineCounter = 0;
                targetNum = 0;
                
                pageID = tok.get("pageid");
                let thePage = getObj("page", pageID);
                pageGridIncrement = thePage.get("snapping_increment");
                
                //find links associated with the aoeControlToken
                aoeLinks = getAoELinks(tok.get('id'));
                
                let validToks = [];
                if (singleTarget) {
                    validToks.push(getObj("graphic", targetID));
                } else {
                    //get an array of all tokens representing characters on the page
                    validToks = findObjs({                              
                        _pageid: pageID,                              
                        _type: "graphic"
                    });
                    
                    
                    validToks = validToks.filter(t => {
                        return t.get("represents") !== '' &&
                        (t.get("layer")==='objects' || t.get("layer")==='gmlayer')
                    });
                }
                
                //add some key location & size params to validToks for later evaluation 
                validToks = validToks.map(t => {
                    return {
                        tok:t, 
                        center: new pt(t.get("left"), t.get("top")),
                        width: t.get("width"),
                        height: t.get("height"),
                        area: t.get("width") * t.get("height"),
                        corners: getCellCoords(t.get("left"), t.get("top"), t.get("width"), t.get("height")),
                        overlapArea: 0
                    }
                });
               
                //log('filtered validToks follows');
                //log(validToks);
                
                
                let instant = false;
                let isOriginTok = false;
                if (aoeLinks.indices.length > 0) {
                    //for each link associated with selected token (could be originTok or controlTok)
                    var tokenRolls = [];
                    var damageRolls = [];
                    for (let a=0; a<aoeLinks.indices.length; a++) {
                        //first, filter for "ignore" attributes
                        let thisValidToks = validToks.filter(obj => {
                            let attrs = {};
                            let represents = obj.tok.get('represents');
                            let name = obj.tok.get("name");
                            if (represents && name !== aoeLinks.links[a].controlTokName) {
                                attrs = findObjs({                              
                                    _type: "attribute",
                                    _characterid: represents,
                                    name: aoeLinks.links[a].ignoreAttr
                                }, {caseInsensitive: true});
                                if (attrs.length > 0) {
                                    return attrs[0].get("current") !== aoeLinks.links[a].ignoreVal.toString()
                                } else {
                                    return true;
                                }
                            }
                        });
                        
                        //Next, omit origin token and any tokens that don't have at least one corner in the AoE bounding box (or at least one corner of AoE bounding box is within the token bounding box)
                        thisValidToks = thisValidToks.filter(obj => {
                            return obj.tok.get("_id") !== aoeLinks.links[a].originTokID &&
                                rectanglesOverlap(obj.corners[0], obj.corners[2], aoeLinks.links[a].boundingBox[0], aoeLinks.links[a].boundingBox[2])
                        });
                        
                        //sort the linked paths by distance to originPt
                        let tempOriginPt = aoeLinks.links[a].originPts[aoeLinks.links[a].originIndex];
                        aoeLinks.links[a].pathIDs = sortPathsByDistanceToOrigin(aoeLinks.links[a].pathIDs, tempOriginPt);
                        //log(tempOriginPt);
                        
                        controlTok = getObj('graphic', aoeLinks.links[a].controlTokID);
                        //log(controlTok);
                        let tempControlPt = new pt(controlTok.get("left"), controlTok.get("top"));
                        //log(tempControlPt);
                        
                        //beam is a special fx, only fired once
                        if (aoeLinks.links[a].fxType.match(/beam/i) && aoeLinks.links[a].aoeType === 'line') {
                            //log(tempOriginPt);
                            //log(tempControlPt);
                            //log(aoeLinks.links[a].fxType);
                            spawnFxBetweenPoints(tempOriginPt, tempControlPt, aoeLinks.links[a].fxType, pageID)
                        } else if (singleTarget && aoeLinks.links[a].fxType !== '') {
                            //if a singeTarget trigger, only spawn fx at target location
                            spawnFx(targetTok.get("left"), targetTok.get("top"), aoeLinks.links[a].fxType, pageID);
                        }
                        
                        //do stuff for every affected square of the linked AoE
                        for (let p=0; p<aoeLinks.links[a].pathIDs.length; p++) {
                            let tempPath = getObj('path', aoeLinks.links[a].pathIDs[p])
                            if (tempPath) {
                                if (tempPath.get("width") <= 70*pageGridIncrement) {
                                    //possibly spawn FX
                                    if (aoeLinks.links[a].fxType !== '' && singleTarget===false) {
                                        spawnFx(tempPath.get("left"), tempPath.get("top"), aoeLinks.links[a].fxType, pageID);
                                    }
                                    //log('pathID iteration p = ' + p);
                                    //log(thisValidToks);
                                    //check for tokens within affected grid square, add area overlapping with AoE
                                    for (let t=0; t<thisValidToks.length; t++) {
                                        //log('checking token');
                                        
                                        
                                        let pathRect = getCellCoords(tempPath.get("left"), tempPath.get("top"), tempPath.get("width"));
                                        //log(pathRect);
                                        let overlapArea = calcRectangleOverlapArea(pathRect, thisValidToks[t].corners);
                                        thisValidToks[t].overlapArea += overlapArea;
                                    }
                                }
                            }
                        }
                        
                        //define roll associated with base damage
                        if (aoeLinks.links[a].rollDamage1) {
                            damageRolls.push({formula:aoeLinks.links[a].damageFormula1});
                            if (aoeLinks.links[a].rollDamage2) {
                                damageRolls.push({formula:aoeLinks.links[a].damageFormula2});
                            }
                        } else {
                            damageRolls.push({formula:"[[" + aoeLinks.links[a].damageBase1 + "]]"});
                        }
                        
                        let foundIndex = -1;
                        //let roll2x = true;
                        for (let t=0; t<thisValidToks.length; t++) {
                            //log(thisValidToks[t].overlapArea + 'vs. threshold ' + aoeLinks.links[a].minTokArea*thisValidToks[t].area);
                            if (thisValidToks[t].overlapArea >= aoeLinks.links[a].minTokArea*thisValidToks[t].area) {
                                //only add unique tokenids to the array of "hit" tokens
                                foundIndex = tokenRolls.findIndex((e) => e.id === thisValidToks[t].tok.get("_id"));
                                if (foundIndex === -1) {
                                    tokenRolls.push(processTokenRolls(thisValidToks[t].tok, aoeLinks.links[a]));
                                }
                            }
                        }
                        
                        //sort tokenRolls by layer (descending -> "objects", "gmlayer") to put targets on gmlayer last in order
                                //(in case hideNames is used, don't want a "skipped" token number spoiling anything)
                        if (tokenRolls.length > 0) {
                            tokenRolls = sortTokenRollsByLayer(tokenRolls);
                        }
                        
                        Promise.all(damageRolls.map(o => new Promise((resolve) => {
                                sendChat("", `${o.formula}`, resolve);
                                //sendChat("", `${o.formula}${o.roll2 ? `<br>${o.formula}` : ""}`, resolve);
                                
                            })))
                            .then(async(messages) => processMessagesMaster(messages, damageRolls, tokenRolls, aoeLinks.links[a]))
                            .catch(sendErrorMessage);
                    
                        //finally, check for instantaneous AoE and set flag for deletion
                        if (aoeLinks.links[a].instant) {
                            instant = true;
                        }
                        if (tok.get('id') === aoeLinks.links[a].originTokID) {
                            isOriginTok = true;
                        }
                    } //end aoeLink loop
                }
                
                //if the AoE settings are set to instant, remove the AoE after triggering
                if (instant) {
                    if (isOriginTok) {
                        deleteAoELinksAndControlToks(tok);
                    } else {
                        tok.remove();
                    }
                    //deleteAoELinksAndControlToks(tok);
                }
            }
            
            
            //--------------------------------------------------------------------
            //   Normal script operation
            //--------------------------------------------------------------------
            if(msg.type=="api" && msg.content.toLowerCase().indexOf("!smartaoe")==0) {
                let player = getObj('player',msg.playerid);
                if (player) {
                    who = getObj('player',msg.playerid).get('_displayname');
                    who===undefined ? whisperString='' : whisperString = `/w "${who}"`;
                } else {
                    whisperString='';
                }
                
                let retVal = [];
                //Initialize output formatting
                cardParameters = {};
				Object.assign(cardParameters,defaultParameters);
                
                //Parse msg into an array of argument objects [{cmd:params}]
                let args = parseArgs(msg);
                //args.shift();
                //log(args);
                //assign values to our params arrray based on args
                args.forEach((arg) => {
                    let option = arg["cmd"].toLowerCase().trim();
                    let param = arg["params"].trim();
                    let inlines = arg["inlines"];
                    
                    //log(args);
                    switch(option) {
                        case "selectedid":
                            selectedID = param; 
                            break;
                        case "playerid":
                            playerID = param;
                            break;
                        case "radius":
                            radius = parseFloat(param);
                            let u = param.match(/[a-zA-Z]+/gi);   //if not an empty string, we will use page settings to convert radius to "u" or other map-defined units
                            if (u !== null) {
                                convertRadius = u[0]
                            }
                            break;
                        case "width":
                            wallWidth = parseFloat(param);
                            let wu = param.match(/[a-zA-Z]+/gi);   //if not an empty string, we will use page settings to convert radius to "u" or other map-defined units
                            if (wu !== null) {
                                convertWidth = wu[0]
                            }
                            break;
                        case "controltokname":
                            controlTokName = param;
                            break;
                        case "controltoksize":
                            controlTokSize = parseFloat(param);
                            break;
                        case "controltokside":
                            controlTokSide = param;
                            break;
                        case "aoetype":
                            let w = param.toLowerCase();
                            if (w.includes('circle')) {
                                if (w.includes('float')) {
                                    aoeFloat = true;
                                }
                                aoeType = w.includes('pfcircle') ? 'PFcircle' : 'circle'
                            } else if (w.includes('sq')) {
                                aoeType = 'square';
                                if (w.includes('float')) {
                                    aoeFloat = true;
                                }
                            } else if (w.includes('5econe')) {
                                aoeType = '5econe';
                                coneWidth = 53.14;
                            } else if (w.includes('pfcone')) {
                                aoeType = 'PFcone';
                                coneWidth = 90;
                            } else if (w.includes('cone')) {
                                aoeType = 'cone';
                                let tempType = param.split(",").map(layer => layer.trim() );
                                if (tempType.length > 1) { coneWidth = parseFloat(tempType[1]) };
                                if (!isNumber(coneWidth)) { 
                                    sendChat(scriptName,`${whisperString} Unable to determine cone width. 90deg cone will be used.`);
                                    coneWidth = 90;
                                }
                            } else if (w.includes('wall')) {
                                aoeType = 'wall';
                                aoeFloat = true;
                                originType = 'nearest,face'
                            } else {    //default
                                aoeType = 'line';
                            }
                            break;
                        case "origin":
                            originType = param;
                            break;
                        case "offset":
                            let direction = param.split(',');
                            offsetX = parseFloat(direction[0]);    //wil convert to pixels later
                            offsetY = parseFloat(direction[1]);    //wil convert to pixels later
                            break;
                        case "forceintersection":
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                forceIntersection = true;
                                isDrawing = true;
                            } else if (_.contains(['false','no', '0'], param.toLowerCase())) {
                                forceIntersection = false;
                            }
                            break;
                        case "mingridarea":
                            minGridArea = parseFloat(param);
                            break;
                        case "mintokarea":
                            minTokArea = parseFloat(param);
                            break;
                        case "fx":
                            fxType = param;
                            break;
                        case "aoecolor":
                            //user passed an html color
                            if ( param.match(/#/) ) {
                                let f = param.split('#')
                                aoeColor = toFullColor(f[1])
                            //else user wants to use the player color
                            } else if (param.includes('player') && 'API' !== msg.playerid) {
                                if (player) {   //player was obtained above from msg.playerid. Will fail when called from API
                                    aoeColor = player.get("color")+'50';
                                    usePlayerColor = true;
                                } else {
                                    sendChat(scriptName,`${whisperString} Error attempting to set aoeColor to player color, so default color will be used`);
                                }
                            //if no player object already, attempt to get from a player id or player name argument
                            } else if ('API' === msg.playerid) {
                                //attempt to get player color later in the script (after all args have been parsed - user should have passed a playerID)
                                getFillColor = true;
                            }
                            break;
                        case "aoeoutlinecolor":
                            //user passed an html color
                            if ( param.match(/#/) ) {
                                let f = param.split('#')
                                aoeOutlineColor = toFullColor(f[1])
                            //else user wants to use the player color
                            } else if (param.includes('player') && 'API' !== msg.playerid) {
                                if (player) {   //player was obtained above from msg.playerid. Will fail when called from API
                                    aoeOutlineColor = player.get("color")+'50';
                                } else {
                                    sendChat(scriptName,`${whisperString} Error attempting to set aoeOutlineColor to player color, so default color will be used`);
                                }
                            //if no player object already, attempt to get from a player id or player name argument
                            } else if ('API' === msg.playerid) {
                                //attempt to get player color later in the script (after all args have been parsed - user should have passed a playerID)
                                getOutlineColor = true;
                            }
                            break;
                        case "gridcolor":
                            if ( param.match(/#/) ) {
                                let f = param.split('#')
                                gridColor = toFullColor(f[1])
                            }
                            break;
                        case "instant":
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                instant = true;
                            }
                            break;
                        case "isdrawing":
                            if (aoeFloat || _.contains(['true','yes', '1'], param.toLowerCase())) {
                                isDrawing = true;
                            }
                            break;
                        case "ignore":
                            
                            let ig = param.split(',').map(e=>e.trim());
                            if (ig.length < 2) {
                                throw 'Invalid argument syntax.<br>Structure is --ignore|attrName,value';
                                //sendChat(scriptName,`/w "${who}" `+ 'Invalid argument syntax.<br>Structure is --ignore|attrName,value');
                            } else {
                                ignoreAttr = ig[0];
                                ignoreVal = ig[1];
                            }
                            break;
                        case "dc":
                            DC = parseInt(param);
                            break;
                        case "nosave":
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                noSave = true;
                                DC = 999999;
                            }
                        case "saveformula":
                            let s = param.toLowerCase();
                            if (saveList.hasOwnProperty(s)) {
                                saveFormula = saveList[s].formula;
                                saveName = saveList[s].name;
                            } else {
                                //custom formula, user-defined
                                saveFormula = param.replace(/<</g,'[[').replace(/>>/g,']]').replace(/a{/g,'@{').replace(/\s+/g, '');
                                //example: "<<1d20 +a{dodge}[DODGE]>>"" becomes "[[1d20 +@{dodge}[DODGE]]]"
                            }
                            break;
                        case "bar":
                            damageBar = param.split(',').map(b=>parseInt(b.trim()));
                            break;
                        case "autoapply":
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                autoApply = true;
                            }
                            break;
                        case "damageformula1":
                            let d1 = param.toLowerCase();
                            if (d1.search('<<') !== -1) {
                                //custom formula, user-defined
                                damageFormula1 = param.replace(/<</g,'[[').replace(/>>/g,']]').replace(/a{/g,'@{').replace(/\s+/g, '');
                                rollDamage1 = true;
                                //example: "<<(8+?{Cast at what level?|3,0|4,1|5,2|6,3|7,4|8,5|9,6})d6>>"" becomes something like "[[(8+1)d6]]"
                            } else {
                                if (inlines[0] === undefined) {
                                    damageBase1 = parseInt(d1);
                                } else {
                                    //damageFormula1 = `[[${inlines[0].expression}]]`;
                                    damageFormula1 = `[[${inlines[0].expression.replace(/&#91;/g,'[').replace(/&#93;/g,']')}]]`;
                                    rollDamage1 = true;
                                }
                            }
                            break;
                        case "damageformula2":
                            let d2 = param.toLowerCase();
                            if (d2.search('<<') !== -1) {
                                //custom formula, user-defined
                                damageFormula2 = param.replace(/<</g,'[[').replace(/>>/g,']]').replace(/a{/g,'@{').replace(/\s+/g, '');
                                rollDamage2 = true;
                                //example: "<<(8+?{Cast at what level?|3,0|4,1|5,2|6,3|7,4|8,5|9,6})d6>>"" becomes something like "[[(8+1)d6]]"
                            } else {
                                if (inlines[0] === undefined) {
                                    damageBase1 = parseInt(d2);
                                } else {
                                    //damageFormula2 = `[[${inlines[0].expression}]]`;
                                    damageFormula2 = `[[${inlines[0].expression.replace(/&#91;/g,'[').replace(/&#93;/g,']')}]]`;
                                    rollDamage2 = true;
                                }
                            }
                            break;
                        case "damagetype1":
                            damageType1 = param;
                            break;
                        case "damagetype2":
                            damageType2 = param;
                            break;
                        case "conditionfail":
                            //ensure no spaces between commas (required for the statusmarkers property of graphic object)
                            conditionFail = param.split(',').map((s) => s.trim()).join(',');
                            break;
                        case "conditionpass":
                            //ensure no spaces between commas (required for the statusmarkers property of graphic object)
                            conditionPass = param.split(',').map((s) => s.trim()).join(',');
                            break;
                        case "zerohpmarker":
                            //ensure no spaces between commas (required for the statusmarkers property of graphic object)
                            zeroHPmarker = param.split(',').map((s) => s.trim()).join(',');
                            break;
                        case "removeatzero":
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                removeAtZero = true;
                            }
                            break;
                        case "resistattr":
                            resistAttrs = param.split(',').map((s) => s.trim());
                            break;
                        case "vulnerableattr":
                            vulnerableAttrs = param.split(',').map((s) => s.trim());
                            break;
                        case "immunityattr":
                            immunityAttrs = param.split(',').map((s) => s.trim());
                            break;
                        case "damagesaverule":
                            damageSaveRule = param.replace(/\s+/g, '');
                            break;
                        case "resistancerule":
                            resistanceRule = param.replace(/\s+/g, '');
                            break;
                        case "vulnerablerule":
                            vulnerableRule = param.replace(/\s+/g, '');
                            break;
                        case "hidename":
                        case "hidenames":
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                hideNames = true;
                            }
                            break;
                        //Output formatting/content (CARD PARAMETERS)--------------------------------------
                        case "desc":
                        case "description":
                            cardParameters.descriptiontext = param.replace(/%(.*?)%/g, '<$1>');
                            break;
                        case "title":
                            cardParameters.title = param;
                            break;
                        case "leftsub":
                            cardParameters.leftsub = param;
                            break;
                        case "rightsub":
                            cardParameters.rightsub = param;
                            break;
                        case "titlecardbackground":
                            cardParameters.titlecardbackground = param;
                            break;
                        case "titlefontface":
                            cardParameters.titlefontface = param;
                            break;
                        case "titlefontcolor":
                            cardParameters.titlefontcolor = param;
                            break;
                        case "titlefontsize":
                            cardParameters.titlefontsize = param;
                            break;
                        case "titlefontlineheight":
                            cardParameters.titlefontlineheight = param;
                            break;
                        case "subtitlefontface":
                            cardParameters.subtitlefontface = param;
                            break;
                        case "subtitlefontcolor":
                            cardParameters.subtitlefontcolor = param;
                            break;
                        case "subtitlefontsize":
                            cardParameters.subtitlefontsize = param;
                            break;
                        case "bodyfontface":
                            cardParameters.bodyfontface = param;
                            break;
                        case "bodyfontsize":
                            cardParameters.bodyfontsize = param;
                            break;
                        case "tablebgcolor":
                            cardParameters.tablebgcolor = param;
                            break;
                        case "tableborder":
                            cardParameters.tableborder = param;
                            break;
                        case "tableborderradius":
                            cardParameters.tableborderradius = param;
                            break;
                        case "tableshadow":
                            cardParameters.tableshadow = param;
                            break;
                        case "titlecardbottomborder":
                            cardParameters.titlecardbottomborder = param;
                            break;
                        case "evenrowbackground":
                            cardParameters.evenrowbackground = param;
                            break;
                        case "oddrowbackground":
                            cardParameters.oddrowbackground = param;
                            break;
                        case "evenrowfontcolor":
                            cardParameters.evenrowfontcolor = param;
                            break;
                        case "oddrowfontcolor":
                            cardParameters.oddrowfontcolor = param;
                            break;
                        case "chatavatarsenabled":
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                cardParameters.leftmargin = '-42px';
                            } else {
                                cardParameters.leftmargin = '-12px';
                            }
                            break;
                        case "resource":
                            let r = param.split(',');
                            resourceName = r[0].trim();
                            if (r.length > 1) {
                                resourceCost = parseFloat(r[1].trim());
                                if (!isNumber(resourceCost)) {
                                    retVal.push('Non-numeric resource cost detected (' + r[1] + ').');
                                }
                            } else {
                                resourceCost = 1;
                            }
                            if (r.length > 2) {
                                resourceAlias = r[2].trim()
                            } else {
                                resourceAlias = resourceName;
                            }
                            break;
                        default:
                            retVal.push('Unexpected argument identifier (' + option + ').');
                            break;    
                    }
                }); //end forEach arg
                
                
                //Token select or ID validation
                if (selectedID===undefined && msg.selected===undefined) {
                    sendChat(scriptName,`${whisperString} You must either select a token or pass the tokenID via --selectedID`);
                    return;
                }
                //Get the origin token object from either msg or an explicitly defined tokenID
                if('API' === msg.playerid) {
                    //SmartAoE WAS CALLED BY ANOTHER API SCRIPT
                    if (playerID === undefined || selectedID ===undefined) {
                        sendChat(scriptName, 'When SmartAoE is called by another script, it must pass both the selected token ID and the playerID');
                        return;
                    }
                    let p = getObj('player',playerID);
                    if (getFillColor = true) { aoeColor = p.get('color')+'50' }
                    if (getOutlineColor = true) { aoeOutlineColor = p.get('color') }
                    
                    //who = getObj('player',playerID).get('_displayname');
                    who = p.get('_displayname');
                    controlledby = playerID;
                    oTok = getObj("graphic",selectedID);
                } else {
                    //SmartAoE WAS CALLED DIRECTLY BY A PLAYER VIA CHAT. Get values from msg *IF* they weren't explicitly passed as arguments
                    if (selectedID===undefined) {
                        oTok = getObj("graphic",msg.selected[0]._id);
                    } else {
                        //log(selectedID);
                        oTok = getObj("graphic",selectedID);
                    }
                    //Set controlledBy property of token to determine who can move the control token.
                    if (playerID===undefined) {
                        controlledby = msg.playerid;
                    } else {
                        controlledby = playerID;
                    }
                    
                    if (oTok===undefined) {
                        //may have passed the character_id instead of token_id. Attempt to get oTok from the player page
                        let currentPageGraphics = findObjs({                              
                            _pageid: Campaign().get("playerpageid"),                              
                            _type: "graphic",
                            represents: selectedID
                        });
                        
                        oTok = currentPageGraphics[0];
                        if (oTok===undefined) {
                            sendChat(scriptName, 'Unable to find the origin token from the selectedID<br>If a characterID was passed, check the player ribbon page.');
                            return;
                        }
                    }
                }
                
                //Check for valid offset X/Y (numeric)
                if (isNaN(offsetX) || isNaN(offsetY)) {
                    retVal.push('Non-numeric offset detected. Format is \"--offset|#,#\" in Squares');
                } else if (offsetX > 50*70 || offsetY > 50*70) {
                    //In case the offset was entered in pixels
                    retVal.push('Offset out of range. Format is \"--offset|#,#\" in Squares (Max 50)');
                }
                
                //First data validation checkpoint
                if (retVal.length > 0) {
                    sendChat(scriptName,`${whisperString} ${retVal}`);
                    return;
                };
                
                //----------------------------------------------------------------
                
                //Get token values and page settings
                originWidth = oTok.get("width")
                originHeight = oTok.get("height")
                
                //tokRadius = originWidth/2;         
                pageID = oTok.get("pageid");
                
                originX = oTok.get("left");
                originY = oTok.get("top");
                originPt = new pt(originX, originY);
                
                //--------------RESOURCE MANAGEMENT----------------
                if (resourceName !== '') {
                    let oChar = getObj("character", oTok.get("represents"));
                    if (oChar) {
                        let attr = findObjs({                              
                            _type: "attribute",
                            name: resourceName,
                            _characterid: oChar.get('_id')
                        }, {caseInsensitive: true})[0];
                        
                        if (attr) {
                            let resourceCurrent = parseFloat(attr.get('current'));
                            if (!isNumber(resourceCurrent)) {
                                sendChat(scriptName, `${whisperString} Non-numeric current resource value detected (${resourceName} = ${attr.get('current')})`, null, {noarchive:true});
                                return;
                            } else if (resourceCurrent - resourceCost < 0) {
                                sendChat(scriptName, `${whisperString} Not enough ${resourceAlias}! <br> Current ${resourceAlias} = ${resourceCurrent}, Cost = ${resourceCost}`, null, {noarchive:true});
                                return;
                            } else {
                                let newVal = resourceCurrent - resourceCost;
                                attr.set('current', newVal);
                                sendChat(scriptName, `${whisperString} ${resourceAlias} reduced by ${resourceCost}. Current value = ${newVal}`, null, {noarchive:true});
                            }
                        } else {
                            sendChat(scriptName, `${whisperString} Resource '${resourceName}' is not found.`, null, {noarchive:true});
                            return;
                        }
                    }
                }
                
                //log('oTok_XY = ' + originX + ', ' + originY);
                
                let thePage = getObj("page", pageID);
                pageScaleNumber = thePage.get("scale_number");
                pageScaleUnits = thePage.get("scale_units");
                pageGridIncrement = thePage.get("snapping_increment");
                pageDL = thePage.get("showlighting") || thePage.get("dynamic_lighting_enabled")
                
                //convert user input to pixels using current grid size & origin token size
                if (offsetX > 0 && originWidth > 70*pageGridIncrement) {
                    offsetX = offsetX * 70 * pageGridIncrement + originWidth/2;
                } else if (offsetX < 0 && originWidth > 70*pageGridIncrement) {
                    offsetX = offsetX * 70 * pageGridIncrement - originWidth/2;
                } else {
                    offsetX = offsetX * 70 * pageGridIncrement
                }
                
                if (offsetY > 0 && originHeight > 70*pageGridIncrement) {
                    offsetY = offsetY * 70 * pageGridIncrement + originHeight/2;
                } else if (offsetX < 0 && originHeight > 70*pageGridIncrement) {
                    offsetY = offsetY * 70 * pageGridIncrement - originHeight/2;
                } else {
                    offsetY = offsetY * 70 * pageGridIncrement
                }
                
                let spawnX_max = parseInt(thePage.get("width")) * 70; //page size in pixels
                let spawnY_max = parseInt(thePage.get("height")) * 70;
                
                if (originX + offsetX < 0 || originX + offsetX > spawnX_max || originY + offsetY < 0 || originY + offsetY > spawnY_max) {
                    sendChat(scriptName, `${whisperString} Error: The provided offsets would spawn the controlToken off the map!`);
                    return;
                }
                
                //possibly convert the radius from user-supplied units to pixels
                if (convertRadius !== "") {
                    if (pageGridIncrement !== 0) {  //grid map
                        if (convertRadius === "u") {
                            radius = radius * 70 * pageGridIncrement;                 //convert from "u" to pixels
                        } else {
                            radius = (radius * 70 * pageGridIncrement) / pageScaleNumber; //convert from page units to pixels
                        }
                    } else {                        //gridless map, only use page settings
                        if (convertRadius === "u") {
                            sendChat(scriptName, `${whisperString} Warning: Units \"u\" selected on a gridless map. radius will be calculated in pixels and will probably be much smaller than expected`);
                        } else {
                            radius = (radius * 70) / pageScaleNumber;
                        }
                    }
                }
                
                //This is a fix for wall AoE's
                //for fixed length "aoeType|line, float" we must reduce the effective length by one square.
                //      This is because the Bresenheim line algorithm always includes the origin square, and the way lines are calculated were originally "from the caster"
                /*
                if (aoeType === 'line' && aoeFloat === true && radius !== 'variable' && pageGridIncrement !== 0) {
                    radius = radius - (70 * pageGridIncrement);
                }
                */
                
                //possibly convert the wallWidth from user-supplied units to pixels
                if (convertWidth !== "") {
                    if (pageGridIncrement !== 0) {  //grid map
                        if (convertWidth === "u") {
                            wallWidth = wallWidth * 70 * pageGridIncrement;                 //convert from "u" to pixels
                        } else {
                            wallWidth = (wallWidth * 70 * pageGridIncrement) / pageScaleNumber; //convert from page units to pixels
                        }
                    } else {                        //gridless map, only use page settings
                        if (convertWidth === "u") {
                            sendChat(scriptName, `${whisperString} Warning: Units \"u\" selected on a gridless map. radius will be calculated in pixels and will probably be much smaller than expected`);
                        } else {
                            wallWidth = (wallWidth * 70) / pageScaleNumber;
                        }
                    }
                }
                
                //assign default forceIntersection behavior if undefined by user
                if (forceIntersection===undefined && aoeType==='wall') {
                    //If wall width is even number of squares, ControlToks should snap to intersection
                    let sizeSq = 70*pageGridIncrement;
                    let wallWidthSquares = wallWidth/sizeSq;
                    if(wallWidthSquares%2=== 0) {
                        forceIntersection = true;
                        isDrawing = true;
                    } else {
                        forceIntersection = false;
                    }
                } else if (forceIntersection===undefined) {
                    //typically will forceIntersection for float AoE's, unless 1 square or smaller or if --forceIntersection was explicitly set by user
                    if (aoeFloat===true && (aoeType==='circle' || aoeType==='PFcircle' || aoeType==='square') && radius > 35/pageGridIncrement) {
                        forceIntersection = true;
                        isDrawing = true;
                    }
                }
                
                //if controlTokName is 'Self', the aoeType must be "circle, float" or "square, float" with an explicit radius
                if (controlTokName.toLowerCase()=== 'self') {
                    if ( (aoeType!=='circle' || aoeType ==='PFcircle' || aoeType!=='square') && (aoeFloat!==true || isNumber(radius)===false) ) {
                        sendChat(scriptName, `${whisperString} Config Error: Only AoE's of circle/square, with the float keyword, and with an explicit radius can use --controlTokName|self`);
                        return;
                    }
                }
                
                //resize fixed-width radii if sourceToken is larger than one square
                if (radius!=='variable' && (aoeFloat!==true || controlTokName.toLowerCase()==='self') && (aoeType==='square' || aoeType==='circle' || aoeType==='PFcircle' || aoeType==='line')) {
                    radius = radius + (originWidth/2);
                }
                
                controlTokSize = controlTokSize*70*pageGridIncrement;
                
                if (controlTokName.toLowerCase() === 'self') {
                    controlTok = getObj('graphic', oTok.get("_id"));
                    
                    let pathstring = buildSquarePath(35*pageGridIncrement);
                    let path = createPath(pathstring, pageID, 'objects', aoeColor, gridColor, 2, 70*pageGridIncrement, 70*pageGridIncrement, controlTok.get("left"), controlTok.get("top"));
                    
                    if (path) {
                        if (controlTok.get('width') > 70*pageGridIncrement) {
                            toBack(controlTok);
                            toBack(path);
                        } else {
                            toBack(controlTok);
                            toBack(oTok);
                            toBack(path);
                        }
                        
                        //create a link between the source and control tokens (stored in state object)
                        let oPt = new pt(oTok.get('left'), oTok.get('top'))
                        
                        let newLink = makeAoELink(controlTokName, controlTok.get("_id"), aoeType, coneWidth, aoeFloat, instant, forceIntersection, aoeColor, aoeOutlineColor, gridColor, radius, wallWidth, originType, oPt, minGridArea, minTokArea, oTok.get('_id'), path.get('_id'), controlTok.get('_pageid'), fxType, saveFormula, saveName, ignoreAttr, ignoreVal, DC, noSave, damageBar, autoApply, damageFormula1, damageFormula2, damageBase1, damageBase2, damageType1, damageType2, rollDamage1, rollDamage2, damageSaveRule, resistanceRule, vulnerableRule, immunityRule, resistAttrs, vulnerableAttrs, immunityAttrs, conditionPass, conditionFail, zeroHPmarker, removeAtZero, hideNames, cardParameters);
                        
                        //Immediately trigger a "change:graphic" event on the origin/controlTok to generate the AoE
                        smartAoE_handleTokenChange (controlTok,controlTok)
                    } else {
                        sendChat(scriptName, `${whisperString} Unknown error. createObj failed. AoE path not created.`);
                        return;
                    }
                } else {
                    let spawnObj = getCharacterFromName(controlTokName);
                    //log(spawnObj);
                    if (spawnObj === undefined) {
                        sendChat(scriptName,`${whisperString} Error: Character \"${controlTokName}\" must be in the journal with a default token `);
                        return;
                    }
                    spawnObj.get("_defaulttoken", async function(defaultToken) {
                        let spawnX = originX+offsetX;
                        let spawnY = originY+offsetY;
                        
                        let numSpawns = 1;
                        if (aoeType === 'wall') {
                            numSpawns = 2;
                            if (forceIntersection===true) {
                                //for even width walls that snap to intersections, we will pre-snap them to the lower right corner
                                spawnX = spawnX + 35*pageGridIncrement;
                                spawnY = spawnY + 35*pageGridIncrement;
                            }
                        }
                        
                        controlToks = await spawnTokenAtXY(who, defaultToken, pageID, spawnX, spawnY, controlTokSize, controlledby, isDrawing, controlTokSide, numSpawns);
                        
                        let pathstring = buildSquarePath(35*pageGridIncrement);
                        let path = createPath(pathstring, pageID, 'objects', aoeColor, gridColor, 2, 70*pageGridIncrement, 70*pageGridIncrement, controlToks[0].get("left"), controlToks[0].get("top"));
                        
                        if (path) {
                            if (controlToks[0].get('width') > 70*pageGridIncrement) {
                                toBack(controlToks[0]);
                                if (controlToks.length > 1) { toBack(controlToks[1]) }
                                toBack(path);
                            } else {
                                toBack(controlToks[0]);
                                if (controlToks.length > 1) { toBack(controlToks[1]) }
                                toBack(oTok);
                                toBack(path);
                            }
                            
                            if (controlToks.length > 1) {
                                //create a link between the source and control tokens (stored in state object).
                                //in this case, the origin token is now the 2nd "controlTok" spawned
                                let oPt = new pt(controlToks[1].get('left'), controlToks[1].get('top'))
                                let newLink = makeAoELink(controlTokName, controlToks[0].get("_id"), aoeType, coneWidth, aoeFloat, instant, forceIntersection, aoeColor, aoeOutlineColor, gridColor, radius, wallWidth, originType, oPt, minGridArea, minTokArea, controlToks[1].get('_id'), path.get('_id'), controlToks[0].get('_pageid'), fxType, saveFormula, saveName, ignoreAttr, ignoreVal, DC, noSave, damageBar, autoApply, damageFormula1, damageFormula2, damageBase1, damageBase2, damageType1, damageType2, rollDamage1, rollDamage2, damageSaveRule, resistanceRule, vulnerableRule, immunityRule, resistAttrs, vulnerableAttrs, immunityAttrs, conditionPass, conditionFail, zeroHPmarker, removeAtZero, hideNames, cardParameters);
                            } else {
                                //create a link between the source and control tokens (stored in state object)
                                let oPt = new pt(oTok.get('left'), oTok.get('top'))
                                let newLink = makeAoELink(controlTokName, controlToks[0].get("_id"), aoeType, coneWidth, aoeFloat, instant, forceIntersection, aoeColor, aoeOutlineColor, gridColor, radius, wallWidth, originType, oPt, minGridArea, minTokArea, oTok.get('_id'), path.get('_id'), controlToks[0].get('_pageid'), fxType, saveFormula, saveName, ignoreAttr, ignoreVal, DC, noSave, damageBar, autoApply, damageFormula1, damageFormula2, damageBase1, damageBase2, damageType1, damageType2, rollDamage1, rollDamage2, damageSaveRule, resistanceRule, vulnerableRule, immunityRule, resistAttrs, vulnerableAttrs, immunityAttrs, conditionPass, conditionFail, zeroHPmarker, removeAtZero, hideNames, cardParameters);
                            }
                        } else {
                            sendChat(scriptName, `${whisperString} Unknown error. createObj failed. AoE path not created.`);
                            return;
                        }
                    });
                }
            }
        } 
        catch(err) {
            if (err.message===undefined) {
                sendChat(scriptName, whisperString + err);      //sent err code via throw
            } else {
                sendChat(scriptName, whisperString + 'Error: ' + err.message);
            }
        }
    };
    
    const populateTokenMarkerURLs = function() {
        // Retrieve list of token/status markers from the Campaign and create a URL lookup array based on name
		const tokenMarkers = JSON.parse(Campaign().get("token_markers"));
		//log(tokenMarkers);
		
		tokenMarkers.forEach((marker) => {
			tokenMarkerURLs[marker.tag] = marker.url;
		});
		//log(tokenMarkerURLs);
    }
    
    const registerEventHandlers = function() {
        on('chat:message', smartAoE_handleInput);
        on('change:graphic', smartAoE_handleTokenChange);
        on('destroy:graphic', smartAoE_handleRemoveToken);
        //on('destroy:path', smartAoE_handleRemovePath);
    };
 
    on("ready",() => {
        checkInstall();
        registerEventHandlers();
        populateTokenMarkerURLs();
        //clearCache('temp')
    });
    
    return {
        ObserveTokenChange: observeTokenChange
    };
})();
