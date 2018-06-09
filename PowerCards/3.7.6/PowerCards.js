var PowerCards = PowerCards || (function() {
	'use strict';
	// VERSION INFO
	var PowerCards_Author = "Sky and Kurt Jaegers";
	var PowerCards_Version = "3.7.6";
	var PowerCards_LastUpdated = "2018-06-09";

	// FUNCTION DECLARATIONS
	var PowerCard = PowerCard || {};
	var buildInline = buildInline || {};
	var processRoll = processRoll || {};
	var doInlineFormatting = doInlineFormatting || {};
	var getAttrRefValues = getAttrRefValues || {};
	var getBrightness = getBrightness || {};
	var getCurrentTime = getCurrentTime || {};
	var getHex2Dec = getHex2Dec || {};
	var getOnlinePlayerNames = getOnlinePlayerNames || {};
	var getPowerCardFormats = getPowerCardFormats || {};
	var getPowerCardStatusList = getPowerCardStatusList || {};
	var getAttrOrEmptyString = getAttrOrEmptyString || {};
	var getSheetAttr = getSheetAttr || {};
	var getSheetSpecificAttrName = getSheetSpecificAttrName || {};
	var outputIfNotEmpty = outputIfNotEmpty || {};
	var getTargetInfo = getTargetInfo || {};
	var statusSymbol = statusSymbol || {};
	var safeSendChat = safeSendChat || {};
	var sortByKey = sortByKey || {};

	// INLINE ROLL COLORS
	var INLINE_ROLL_DEFAULT = " background-color: #FFFEA2; border-color: #87850A; color: #000000;";
	var INLINE_ROLL_CRIT_LOW = " background-color: #FFAAAA; border-color: #660000; color: #660000;";
	var INLINE_ROLL_CRIT_HIGH = " background-color: #88CC88; border-color: #004400; color: #004400;";
	var INLINE_ROLL_CRIT_BOTH = " background-color: #8FA4D4; border-color: #061539; color: #061539;";
	var INLINE_ROLL_STYLE = "text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px;";

	// API COMMAND HANDLER
	on("chat:message", function(msg) {
		if (msg.type !== "api") { 
		if (msg.content.split("rname=")[1] !== undefined)
			  {
				var ability = msg.content.split("rname=")[1];
			  }
		  return; 
		}
		if (msg.content.split(" ", 1)[0] === "!power") {
			var player_obj = getObj("player", msg.playerid);
			//log(msg);
			msg.who = msg.who.replace(" (GM)", "");
			msg.content = msg.content.replace(/<br\/>\n/g, ' ').replace(/({{(.*?)}})/g, " $2 ");
			PowerCard.Process(msg, player_obj);
		}
		if (msg.content.split(" ", 1)[0] === "!power_version") {
			sendChat("", "/w " + msg.who + " You are using version " + PowerCards_Version + " of PowerCards, authored by " + PowerCards_Author + ", which was last updated on: " + PowerCards_LastUpdated + ".");
		}
	});

	// LOAD POWERCARD FORMATS
	on("ready", function() {
		getPowerCardFormats();
		log("-=> PowerCards v" +PowerCards_Version + " <=-  [" + PowerCards_LastUpdated + "]");
		//log (Date.now().toString().substr(0, 10));
	});

	on("change:handout", function() {
		getPowerCardFormats();
		getPowerCardStatusList();
	});

	// POWERCARD
	PowerCard.Process = function(msg, player_obj) {
		// USER CONFIGURATION
		var ALLOW_URLS = false; // Allows players to include full urls in powercards
		var ALLOW_HIDDEN_URLS = false; // Allows players to hide urls as a link instead
		var CUSTOM_EMOTES = true; // Set to true to use custom emotes instead of Roll20 emotes
		var SHOW_AVATAR = true; // Set to false to hide character sheet avatar in custom emotes
		var SHOW_TARGET_AVATAR = true; // Set to false to hide target's avatar in custom emotes
		var USE_DEFAULT_FORMAT = false; // Set to true if you want powercards to default formatting
		var USE_PLAYER_COLOR = false; // Set to true to override all color formatting

		// REPLACE INLINE ROLLS WITH EXPRESSIONS
		if (msg.inlinerolls !== undefined) {
			var Count = 0;
			while (Count < msg.inlinerolls.length) {
				msg.content = msg.content.replace("$[[" + Count + "]]", ("[[" + msg.inlinerolls[Count].expression + " ]]").replace(/\[\[\[/g, "[[ ["));
				Count++;
			}
		}

		// DEFINE VARIABLES
		var n = (player_obj) ? msg.content.replace("%%who%%", player_obj.get("displayname")).split(/\s+--/) : msg.content.split(/\s+--/);
		var PowerCard = {};
		var Tag = "";
		var Content = "";
		var TagCount = 0;
		var TagRepeat = 0;
		
		// PLACEHOLDER VARIABLES
		var Avatar = "";
		var Character = "";
		var Character_ID = "";
		var Token = "";
		var TargetAvatar = "";
		var TargetToken = "";
		var TargetCharacter = "";
		var TargetCharacter_ID = ""

		// DEFAULT FORMATTING
		var Display = "";
		var PlayerBGColor = (player_obj) ? player_obj.get("color") : "#FFFFFF";
		var PlayerTXColor = (getBrightness(PlayerBGColor) < (255 / 2)) ? "#FFFFFF" : "#000000";
		var PlayerTXShadow = (getBrightness(PlayerBGColor) < (255 / 2)) ? "#000000" : "#FFFFFF";
		PowerCard.titlefont = "Contrail One";
		PowerCard.titlefontvariant = "normal";
		PowerCard.titlefontshadow = "-1px -1px 0 " + PlayerTXShadow + ", 1px -1px 0 " + PlayerTXShadow + ", -1px 1px 0 " + PlayerTXShadow + ", 1px 1px 0 " + PlayerTXShadow + ";";
		PowerCard.titlebackground = "linear-gradient(rgba(255, 255, 255, .3), rgba(255, 255, 255, 0));";
		PowerCard.subtitlefont = "Tahoma";
		PowerCard.subtitlefontvariant = "normal";
		PowerCard.bodyfont = "Helvetica";
		PowerCard.titlefontsize = "1.2em; line-height: 1.2em";
		PowerCard.subtitlefontsize = "11px";
		PowerCard.bodyfontsize = "14px";
		PowerCard.txcolor = PlayerTXColor;
		PowerCard.bgcolor = PlayerBGColor;
		PowerCard.erowtx = "#000000";
		PowerCard.erowbg = "#B6AB91"; // #B6AB91 - Default darker brown
		PowerCard.orowtx = "#000000";
		PowerCard.orowbg = "#CEC7B6"; // #CEC7B6 - Default light brown
		PowerCard.corners = 5; // Set to 0 to remove rounded corners from PowerCards
		PowerCard.border = "1px solid #000000"; // size style #color
		PowerCard.boxshadow = ""; // h-distance v-distance blur spread #color
		PowerCard.lineheight = "1.1em";
		PowerCard.emotefont = "font-family: Georgia, serif; font-weight: bold; ";

		// CREATE POWERCARD OBJECT
		n.shift();
		_.each(n, function(a) {
			Tag = a.substring(0, a.indexOf("|")).trim();
			Content = a.substring(a.indexOf("|") + 1).trim();
			if (Tag === "target_list") Content = Content.split(" | ");
			
			// if (Tag.includes("attribute_list")) {
				// Character_ID = Content;
				// Tag="!attribute_list";
			// }
			
			// Create a 5e OGL Sheet NPC Attributes LIST
			if (Tag.includes("attribute_summary") && (getObj("character", Content) !== undefined)) {
				Character_ID = Content;
				Tag = "!attribute_summary";
				Content = "<table width='95%' align='center'><tr><td>**Str** " + getSheetAttr(Character_ID, "strength") + "(" + (getSheetAttr(Character_ID, "strength_mod") || "0") + ")</td>";
				Content += "<td>**Dex** "+ getSheetAttr(Character_ID, "dexterity") + "(" + (getSheetAttr(Character_ID, "dexterity_mod") || "0") + ")</td>";
				Content += "<td>**Con** "+ getSheetAttr(Character_ID, "constitution") + "(" + (getSheetAttr(Character_ID, "constitution_mod") || "0") + ")</td></tr>";
				Content += "<tr><td>**Int** " + getSheetAttr(Character_ID, "intelligence") + "(" + (getSheetAttr(Character_ID, "intelligence_mod") || "0") + ")</td>";
				Content += "<td>**Wis** "+ getSheetAttr(Character_ID, "wisdom") + "(" + (getSheetAttr(Character_ID, "wisdom_mod") || "0") + ")</td>";
				Content += "<td>**Cha** "+ getSheetAttr(Character_ID, "charisma") + "(" + (getSheetAttr(Character_ID, "charisma_mod") || "0") + ")<br /></td></tr>";
				Content += "<tr><td>**AC** " + getSheetAttr(Character_ID, "AC") + "</td>";
				Content += outputIfNotEmpty("<td colspan=2>**Challenge Rating** ", getSheetAttr(Character_ID, "npc_challenge"), "<br /></td></tr></table>", "<td colspan=2>&nbsp; <br /></td></tr></table>"); 
			}

			if (Tag.includes("npc_qualities_summary") && (getObj("character", Content) !== undefined)) {
				Character_ID = Content;
				Tag = "!npc_qualities_summary";
				Content = "";		
				if (getSheetAttr(Character_ID, "npc_vulnerabilities") !== "") {
					Content += "**Vulnerable:** " + getSheetAttr(Character_ID, "npc_vulnerabilities") + "<br />";
				}
				if (getSheetAttr(Character_ID, "npc_resistances") !== "") {
					Content += "**Resistances:** " + getSheetAttr(Character_ID, "npc_resistances") + "<br />";
				}
				if (getSheetAttr(Character_ID, "npc_immunities") !== "") {
					Content += "**Immunities:** " + getSheetAttr(Character_ID, "npc_immunities") + "<br />";
				}
				if (getSheetAttr(Character_ID, "npc_condition_immunities") !== "") {
					Content += "**Cond. Immune:** " + getSheetAttr(Character_ID, "npc_condition_immunities") + "<br />";
				}
				if (getSheetAttr(Character_ID, "npc_senses") !== "") {
					Content += "**Senses:** " + getSheetAttr(Character_ID, "npc_senses") + "<br />";
				}
				if (Content == "") {
					Tag = "$npc_qualities_summary";
				}
			}	

			if (Tag.includes("npc_skills_summary") && (getObj("character", Content) !== undefined)) {
				Character_ID = Content;
				Tag = "!npc_skills_summary";
				Content = "";
				var skillList = "**Skills:** ";
				var attrList="acrobatics,animal_handling,arcana,athletics,deception,history,insight,intimidation,investigation,medicine,nature,perception,performance,persuasion,religion,sleight_of_hand,stealth,survival".split(",");
				attrList.forEach(function(a) {
					if (getSheetAttr(Character_ID, "npc_" + a + "_base") !== "" ) {
						skillList += (a.charAt(0).toUpperCase() + a.slice(1)).replace("_"," ") + ": " + getSheetAttr(Character_ID, "npc_" + a + "_base") + ", ";
					 }
				});
				if (skillList !== "**Skills:** ") { 
				    Content = skillList.slice(0,skillList.length-2); 
				} else {
					Tag = "$npc_skills_summary";
				}
			}				

			if (Tag.includes("ogl_pc_attack_list") && getObj("character", Content) !== undefined) {
				Character_ID = Content;
				Tag = "!ogl_pc_attack_list";
				Content = "";
				if (getSheetAttr(Character_ID, "npc") == 0) {
					var actionList = getRepeatingSectionAttrs(Character_ID, "repeating_attack")[0];
					var actionMax = actionList.length;
					for (var action_count = 0; action_count < actionMax; action_count++) {
						var npc_action = getSheetAttr(Character_ID, "repeating_attack_" + actionList[action_count] + "_atkname");
						var action_content = getSheetAttr(Character_ID, "action_$" + action_count + "_macro");
						if (action_content !== "") {
							if (action_content !== "NONE") {
								Content += "[" + npc_action + "](!&#13;" + action_content + ") ";
							}
						} else {
								Content += "[" + npc_action + "](~" + Character_ID + "|repeating_attack_" + actionList[action_count] + "_attack) ";
						}						
					}
				}
                if (Content !== "") {
					Content = "~~~**Available Attacks**^^" + Content
				} else {
					Tag = "$ogl_pc_attack_list";
				}					
			}
			
			if (Tag.includes("npc_action_list") && getObj("character", Content) !== undefined) {
				
				Character_ID = Content;
				Tag = "!npc_action_list";
				Content = "";
				if (getSheetAttr(Character_ID, "npc") == 1) {
					var actionList = getRepeatingSectionAttrs(Character_ID, "repeating_npcaction")[0];
					var actionMax = actionList.length;
					for (var action_count = 0; action_count < actionMax; action_count++) {
						var npc_action = getSheetAttr(Character_ID, "repeating_npcaction_" + actionList[action_count] + "_name");
						var action_content = getSheetAttr(Character_ID, "action_$" + action_count + "_macro");
						if (action_content !== "") {
							if (action_content !== "NONE") {
								Content += "[" + npc_action + "](!&#13;" + action_content + ") ";
							}
						} else {
								Content += "[" + npc_action + "](~" + Character_ID + "|repeating_npcaction_" + actionList[action_count] + "_npc_action) ";
						}
					}	
				}
                if (Content !== "") {
					Content = "~~~**Available Actions**^^" + Content
				} else {
					Tag = "$npc_action_list";
				}
			}			
			
			// CREATE 5e OGL SHEET NPC REACTION LIST
			if (Tag.includes("npc_reaction_list") && getObj("character", Content) !== undefined) {
				Character_ID = Content;
				Tag = "!npc_reaction_list";
				Content = "";
				var actionList = getRepeatingSectionAttrs(Character_ID, "repeating_npcreaction")[0];
				var actionMax = actionList.length;
				
				for (var action_count = 0; action_count < actionMax; action_count++) {
					var npc_action = getSheetAttr(Character_ID, "repeating_npcreaction_" + actionList[action_count] + "_name");
					Content += "**" + npc_action + "** " + getSheetAttr(Character_ID, "repeating_npcreaction_" + actionList[action_count] + "_desc").replace(/\r?\n|\r/g, '') + "~~~";
				}
				if (Content.length > 3) { Content = Content.substr(0,Content.length-3) };
                if (Content !== "") {
					Content = "~~~**Available Reactions**^^" + Content
				} else {
					Tag = "$npc_reaction_list";
				}					
			}
			
			if (Tag.includes("npc_legendaryaction_list") && getObj("character", Content) !== undefined) {
				Character_ID = Content;
				Tag = "!npc_legendaryaction_list";
				Content = "";
				if (getSheetAttr(Character_ID, "npc") == 1) {
					var actionList = getRepeatingSectionAttrs(Character_ID, "repeating_npcaction-l")[0];
					var actionMax = actionList.length;
					for (var action_count = 0; action_count < actionMax; action_count++) {
						var npc_action = getSheetAttr(Character_ID, "repeating_npcaction-l_" + actionList[action_count] + "_name");
						var action_content = getSheetAttr(Character_ID, "action-l_" + action_count + "_macro");
						if (action_content !== "") {
							if (action_content !== "NONE") {
								Content += "[" + npc_action + "](!&#13;" + action_content + ") ";
							}
						} else {
								Content += "[" + npc_action + "](~" + Character_ID + "|repeating_npcaction-l_$" + actionList[action_count] + "_npc_action) ";
						}
					}	
				}
                if (Content !== "") {
					Content = "~~~**Available Legendary Actions**^^" + Content
				} else {
					Tag = "$npc_legendaryaction_list";
				}
			}					
			
			// CREATE 5e OGL SHEET NPC TRAIT LIST
			if (Tag.includes("npc_trait_list") && getObj("character", Content) !== undefined) {
				Character_ID = Content;
				Tag = "!npc_trait_list";
				Content = "";
				var actionList = getRepeatingSectionAttrs(Character_ID, "repeating_npctrait")[0];
				var actionMax = actionList.length;
				for (var action_count = 0; action_count < actionMax; action_count++) {
					var npc_action = getSheetAttr(Character_ID, "repeating_npctrait_" + actionList[action_count] + "_name");
					Content += "//" + npc_action + "// " + getSheetAttr(Character_ID, "repeating_npctrait_" + actionList[action_count] + "_desc").replace(/\r?\n|\r/g, '') + "~~~";
				}
				if (Content.length > 3) { Content = Content.substr(0,Content.length-3) };
                if (Content !== "") {
					Content = "~~~**Traits**^^" + Content
				} else {
					Tag = "$npc_trait_list";
				}
			}
			
			// Create a list of available spell slots. If the creature has no slots, nothing will be displayed.
			// The number of lines will be dependant upon the caster level of the creature, so if they have spells
			// up to level 3, only 3 lines will be shown.
			if (Tag.includes("spell_slots") && getObj("character", Content) !== undefined) {
				Character_ID = Content;
				Tag = "!spell_slots";
				Content = "";
				for (var i=1; i<=9; i++)
				{
					var slot_total = getAttrByName(Character_ID, getSheetSpecificAttrName(Character_ID, "lvl") + i + getSheetSpecificAttrName(Character_ID, "_slots_total"));
					if (slot_total !== undefined && parseInt(slot_total) !== 0) {
						var slot_unused = getAttrByName(Character_ID, getSheetSpecificAttrName(Character_ID, "lvl") + i + getSheetSpecificAttrName(Character_ID, "_slots_expended"));
						Content += "**Level " + i + ":** [[" + slot_total + "]] - **Remaining:** [[" + slot_unused + "]]^^"
					}
				}
				if (Content !== "") {
					Content = "**Spell Slots**^^" + Content;
					Content = Content.slice(0,Content.length - 2);
				} else {
					Tag = "$spell_slots";
				}
			}
			
			// CREATE 5e OGL SHEET PREPARED SPELL LIST (BOTH PC & NPC)
			if (Tag.includes("spell_list") && getObj("character", Content) !== undefined) {
				Character_ID = Content;
				Tag = "!spell_list";
				Content = "";
				var spell_list = filterObjs(function(z) { return (z.get("characterid") == Character_ID && z.get("name").endsWith("spellname")); });
				//var spell_list = filterObjs(function(z) { return (z.get("characterid") == Character_ID && z.get("name").endsWith(getSheetSpecificAttrName("spellname"))); });
				var cantrips = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-cantrip")), "current");
				var L1Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-1")), "current");
				var L2Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-2")), "current");
				var L3Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-3")), "current");
				var L4Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-4")), "current");
				var L5Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-5")), "current");
				var L6Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-6")), "current");
				var L7Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-7")), "current");
				var L8Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-8")), "current");
				var L9Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-9")), "current");
				
				if (cantrips.length > 0) {
					Content += "~~~ **Cantrips:** ~~~";
					cantrips.forEach(function(s) { Content += "[" + s.get("current") + "](~selected|" + s.get("name").replace("name", "") + ") "; });
				}
				if (L1Spells.length > 0) {
					Content += "~~~ **1st Level Spells:** ~~~";
					L1Spells.forEach(function(s) { Content += (getAttrByName(Character_ID, s.get("name").replace("name", "prepared")) == "1") ? "[" + s.get("current") + "](~selected|" + s.get("name").replace("name", "") + ") " : "";});
				}
				if (L2Spells.length > 0) {
					Content += "~~~ **2nd Level Spells:** ~~~";
					L2Spells.forEach(function(s) { Content += (getAttrByName(Character_ID, s.get("name").replace("name", "prepared")) == "1") ? "[" + s.get("current") + "](~selected|" + s.get("name").replace("name", "") + ") " : "";});
				}
				if (L3Spells.length > 0) {
					Content += "~~~ **3rd Level Spells:** ~~~";
					L3Spells.forEach(function(s) { Content += (getAttrByName(Character_ID, s.get("name").replace("name", "prepared")) == "1") ? "[" + s.get("current") + "](~selected|" + s.get("name").replace("name", "") + ") " : "";});
				}
				if (L4Spells.length > 0) {
					Content += "~~~ **4th Level Spells:** ~~~";
					L4Spells.forEach(function(s) { Content += (getAttrByName(Character_ID, s.get("name").replace("name", "prepared")) == "1") ? "[" + s.get("current") + "](~selected|" + s.get("name").replace("name", "") + ") " : "";});
				}
				if (L5Spells.length > 0) {
					Content += "~~~ **5th Level Spells:** ~~~";
					L5Spells.forEach(function(s) { Content += (getAttrByName(Character_ID, s.get("name").replace("name", "prepared")) == "1") ? "[" + s.get("current") + "](~selected|" + s.get("name").replace("name", "") + ") " : "";});
				}
				if (L6Spells.length > 0) {
					Content += "~~~ **6th Level Spells:** ~~~";
					L6Spells.forEach(function(s) { Content += (getAttrByName(Character_ID, s.get("name").replace("name", "prepared")) == "1") ? "[" + s.get("current") + "](~selected|" + s.get("name").replace("name", "") + ") " : "";});
				}
				if (L7Spells.length > 0) {
					Content += "~~~ **7th Level Spells:** ~~~";
					L7Spells.forEach(function(s) { Content += (getAttrByName(Character_ID, s.get("name").replace("name", "prepared")) == "1") ? "[" + s.get("current") + "](~selected|" + s.get("name").replace("name", "") + ") " : "";});
				}
				if (L8Spells.length > 0) {
					Content += "~~~ **8th Level Spells:** ~~~";
					L8Spells.forEach(function(s) { Content += (getAttrByName(Character_ID, s.get("name").replace("name", "prepared")) == "1") ? "[" + s.get("current") + "](~selected|" + s.get("name").replace("name", "") + ") " : "";});
				}
				if (L9Spells.length > 0) {
					Content += "~~~ **9th Level Spells:** ~~~";
					L9Spells.forEach(function(s) { Content += (getAttrByName(Character_ID, s.get("name").replace("name", "prepared")) == "1") ? "[" + s.get("current") + "](~selected|" + s.get("name").replace("name", "") + ") " : "";});
				}
				if (Content == "") {
					Tag = "$spell_list";
				}
			}
			
			// CHECK FOR REPEAT TAG MODIFIER
			if (Tag.charAt(0) !== "$") {
				if (Tag.indexOf("#") !== -1) {
					TagRepeat = parseInt(Tag.substring(Tag.indexOf("#") + 1));
					TagCount = 1;
					Tag = Tag.substring(0, Tag.indexOf("#"));
					while (TagCount <= TagRepeat) {
						var NewTag = Tag;
						var NewContent = Content;
						if (PowerCard.target_list !== undefined) {
							if (Tag.indexOf("%%") !== -1 || Content.indexOf("%%") !== -1) {
								NewTag = getTargetInfo(Tag, PowerCard.target_list);
								NewContent = getTargetInfo(Content, PowerCard.target_list);
								PowerCard.target_list.shift();
							}
						}
						PowerCard[NewTag + " #" + TagCount] = NewContent;
						TagCount += 1;
					}
				} else {
					if (PowerCard.target_list !== undefined) {
						if (Tag.indexOf("%%") !== -1 || Content.indexOf("%%") !== -1) {
							Tag = getTargetInfo(Tag, PowerCard.target_list);
							Content = getTargetInfo(Content, PowerCard.target_list);
							PowerCard.target_list.shift();
						}
					}
					PowerCard[Tag] = Content;
				}
			}
		});
		
		// PROCESS INLINE ROLLS...
		safeSendChat("", JSON.stringify(PowerCard), function(x) {
			var PowerCard = JSON.parse(x[0].content);
			
			// GET CUSTOM STYLES AND ADD THEM TO POWERCARD...
			if (USE_DEFAULT_FORMAT && state.PowerCard_Formats["default"] !== undefined && PowerCard.format === undefined) PowerCard.format = "default";
			if (PowerCard.format !== undefined) {
				var PowerCard_Formats = (state.PowerCard_Formats && state.PowerCard_Formats[PowerCard.format] !== undefined) ? state.PowerCard_Formats[PowerCard.format].split("--") : ["txcolor|#FFF", "bgcolor|#040", "titlefont|Georgia", "subtitlefont|Tahoma"];
				PowerCard_Formats.forEach(function(a) {
					Tag = a.substring(0, a.indexOf("|")).trim();
					Content = a.substring(a.indexOf("|") + 1).trim();
					if (Tag !== "" && Content !== "") PowerCard[Tag] = Content;
				});
			}
			
			// GET LIST OF ROLL ID'S FOR CONDITIONAL STATEMENTS...
			var RollText = "";
			var RollID = "";
			var RollResults = "";
			var RollBase = 0;
			var RollOnes = 0;
			var RollTens = 0;
			var RollTotal = 0;
			var RollSuccesses = 0;
			var Rolls = {};
			Object.keys(x[0].inlinerolls).forEach(function(Roll) {
				var RollCount = 0;
				while (x[0].inlinerolls[Roll].results.rolls[RollCount] !== undefined) {
					if (x[0].inlinerolls[Roll].results.rolls[RollCount].type === "L" && x[0].inlinerolls[Roll].results.rolls[RollCount].text.indexOf("$") !== -1) {
						RollText = x[0].inlinerolls[Roll].results.rolls[RollCount].text.split("|");
						var t = 0;
						while (RollText[t] !== undefined) {
							if (RollText[t].charAt(0) === "$") RollID = RollText[t];
							t++;
						}
						// Roll Base
						RollResults = x[0].inlinerolls[Roll].results.rolls[RollCount + 1].results;
						if (RollResults === undefined) {
							RollBase = x[0].inlinerolls[Roll].results.total;
						} else {
							t = 0;
							RollBase = 0;
							RollOnes = 0;
							RollTens = 0;
							while (RollResults[t] !== undefined) {
								if ("table" in x[0].inlinerolls[Roll].results.rolls[RollCount + 1]) {
									if (RollResults[t].tableidx) RollBase = RollBase + RollResults[t].tableidx;
								} else {
									if (!RollResults[t].d) RollBase = RollBase + RollResults[t].v;
								}
								RollOnes = (RollResults[t].v === 1) ? RollOnes += 1 : RollOnes;
								RollTens = (RollResults[t].v === 10) ? RollTens += 1 : RollTens;
								t++;
							}
						}
						
						// Roll Total
						RollTotal = x[0].inlinerolls[Roll].results.total;
						
						// Roll Successes
						if ("mods" in x[0].inlinerolls[Roll].results.rolls[RollCount + 1]) {
							if ("success" in x[0].inlinerolls[Roll].results.rolls[RollCount + 1].mods) {
								var rCount = 0;
								RollSuccesses = 0;
								while (rCount <= x[0].inlinerolls[Roll].results.rolls[RollCount + 1].results.length-1) {
									if (x[0].inlinerolls[Roll].results.rolls[RollCount + 1].mods.success.comp == ">=") {
										if (x[0].inlinerolls[Roll].results.rolls[RollCount + 1].results[rCount].v >= x[0].inlinerolls[Roll].results.rolls[RollCount + 1].mods.success.point) RollSuccesses += 1;
									}
									if (x[0].inlinerolls[Roll].results.rolls[RollCount + 1].mods.success.comp == "==") {
										if (x[0].inlinerolls[Roll].results.rolls[RollCount + 1].results[rCount].v == x[0].inlinerolls[Roll].results.rolls[RollCount + 1].mods.success.point) RollSuccesses += 1;
									}
									if (x[0].inlinerolls[Roll].results.rolls[RollCount + 1].mods.success.comp == "<=") {
										if (x[0].inlinerolls[Roll].results.rolls[RollCount + 1].results[rCount].v <= x[0].inlinerolls[Roll].results.rolls[RollCount + 1].mods.success.point) RollSuccesses += 1;
									}
									rCount++;
								}
							}
						}
						
						// Create RollID in Rolls with the following values...
						Rolls[RollID] = {
							"base": RollBase,
							"total": RollTotal,
							"successes": RollSuccesses,
							"ones": RollOnes,
							"tens": RollTens
						};
					}
					RollCount++;
				}
			});
			
			// PREVENT EMPTY EMOTE ERROR IN ROLL20 CHAT...
			if (PowerCard.emote === "") PowerCard.emote = undefined;
			
			// REPLACE UNDEFINED TITLE TAG WITH MSG.WHO...
			if (PowerCard.title === undefined) PowerCard.title = "PowerCard sent by:<br>" + msg.who;
			
			// ERROR CATCH FOR EMPTY WHISPER TAG...
			if (PowerCard.whisper === "") PowerCard.whisper = "GM";
			if (PowerCard.whisper === "self") PowerCard.whisper = msg.who;
			if (PowerCard.whisper === "all") PowerCard.whisper = getOnlinePlayerNames();
			
			// Get the token for the first target in the target list if it exists.
			if (PowerCard.target_list !== undefined) {
				TargetToken = getObj("graphic", PowerCard.target_list[0]);
			}

			PowerCard.emotefont = PowerCard.emotefont.replace(/'/g, '"');
			
			// CREATE CSS EMOTE...
			if (CUSTOM_EMOTES && PowerCard.emote !== undefined && (PowerCard.charid !== undefined || PowerCard.tokenid !== undefined)) {
				// GET AVATAR FROM CHARACTER SHEET
				if (PowerCard.charid !== undefined) {
					Character = getObj("character", PowerCard.charid);
					Avatar = (Character !== undefined && Character.get("avatar") !== "") ? "<img src=" + Character.get('avatar') + " style='height: 50px; min-width: 50px; float: left;'></img>" : "";
				}
				// GET AVATAR FROM TOKEN IMAGE
				if (PowerCard.tokenid !== undefined) {
					Token = getObj("graphic", PowerCard.tokenid);
					Avatar = (Token !== undefined && Token.get("imgsrc") !== "") ? "<img src=" + Token.get('imgsrc') + " style='height: 50px; min-width: 50px; float: left;'></img>" : "";
				}
				// Get the avatar of the first target if target_list is specified
				if (PowerCard.target_list !== undefined) {
					TargetAvatar = (TargetToken !== undefined && TargetToken.get("imgsrc") !== "") ? "<img src=" + TargetToken.get('imgsrc') + " style='height: 50px; min-width: 50px; float: right;'></img>" : "";
				}
				// HIDE AVATAR
				if (PowerCard.emote.charAt(0) === "!") {
					PowerCard.emote = PowerCard.emote.substring(1);
					SHOW_AVATAR = false;
					SHOW_TARGET_AVATAR = false;
				}
				// GET TEXT ALIGNMENT FOR EMOTES
				var EmoteTextAlign = "center";
				if (PowerCard.emote.indexOf("~L") !== -1) {
					PowerCard.emote = PowerCard.emote.replace(/\~L/g, "");
					EmoteTextAlign = "left";
				}
				if (PowerCard.emote.indexOf("~R") !== -1) {
					PowerCard.emote = PowerCard.emote.replace(/\~R/g, "");
					EmoteTextAlign = "right";
				}
				if (PowerCard.emote.indexOf("~J") !== -1) {
					PowerCard.emote = PowerCard.emote.replace(/\~J/g, "");
					EmoteTextAlign = "justify";
				}
				// CREATE EMOTE DIV
				if (SHOW_AVATAR) {
					if (TargetAvatar !== undefined && SHOW_TARGET_AVATAR) {
					  PowerCard.emote = "<div style='display: table; margin: -5px 0px 3px -7px; font-weight: normal; font-style: normal;'>" + Avatar + "<div style='display: table-cell; width: 100%; " + PowerCard.emotefont + " vertical-align: middle; text-align: " + EmoteTextAlign + "; padding: 0px 2px;'>" + doInlineFormatting(PowerCard.emote) + "</div><div style='display: table-cell; margin: -5px 0px 3px -7px; font-weight: normal; font-style: normal;'>" + TargetAvatar + "</div></div>";
					} else {
					  PowerCard.emote = "<div style='display: table; margin: -5px 0px 3px -7px; font-weight: normal; font-style: normal;'>" + Avatar + "<div style='display: table-cell; width: 100%; " + PowerCard.emotefont + "vertical-align: middle; text-align: " + EmoteTextAlign + "; padding: 0px 2px;'>" + doInlineFormatting(PowerCard.emote) + "</div></div>";
					}
				} else {
					PowerCard.emote = "<div style='text-align: " + EmoteTextAlign + ";'>" + doInlineFormatting(PowerCard.emote) + "</div>";
				}
			}
			
			// CREATE SHADOWBOX STYLE...
			var ShadowBoxStyle = "" + "clear: both; " + "margin-left: -7px; " + "box-shadow: " + PowerCard.boxshadow + "; " + "border-radius: " + PowerCard.corners + "px; ";
			
			// CREATE TITLE STYLE...
			var TitleStyle = "" + "font-family: " + PowerCard.titlefont + "; " + "font-size: " + PowerCard.titlefontsize + "; " + "font-weight: normal; font-style: normal; " + "font-variant: " + PowerCard.titlefontvariant + "; " + "letter-spacing: 2px; " + "text-align: center; " + "vertical-align: middle; " + "margin: 0px; " + "padding: 2px 0px 0px 0px; " + "border: " + PowerCard.border + "; " + "border-radius: " + PowerCard.corners + "px " + PowerCard.corners + "px 0px 0px; ";
			
			// CREATE SUBTITLE STYLE...
			var SubTitleStyle = "" + "font-family: " + PowerCard.subtitlefont + "; " + "font-size: " + PowerCard.subtitlefontsize + "; " + "font-weight: normal; font-style: normal; " + "font-variant: " + PowerCard.subtitlefontvariant + "; " + "letter-spacing: 1px;";
			
			// ADD BACKGROUND & TEXT COLORS...
			if (USE_PLAYER_COLOR === true && PowerCard.format === undefined) {
				TitleStyle += " color: " + PlayerTXColor + ";";
				TitleStyle += " background-color: " + PlayerBGColor + ";";
			} else {
				TitleStyle += " color: " + PowerCard.txcolor + "; text-shadow: " + PowerCard.titlefontshadow + ";";
				TitleStyle += " background-color: " + PowerCard.bgcolor + "; background-image: " + PowerCard.titlebackground + ";";
			}
			
			// CREATE TITLEBOX...
			var Title = "" + "<div style='" + ShadowBoxStyle + "'>" + "<div style='" + TitleStyle + "' class='showtip tipsy' title='" + PowerCard.title + "'>" + PowerCard.name;
			
			// ADD SUBTITLES...
			var Diamond = " &" + "#x2666; ";
			var Subtitle = "<br><span style='" + SubTitleStyle + "'>";
			Subtitle += (PowerCard.leftsub !== undefined) ? PowerCard.leftsub : "";
			Subtitle += (PowerCard.leftsub !== undefined && PowerCard.rightsub !== undefined) ? Diamond : "";
			Subtitle += (PowerCard.rightsub !== undefined) ? PowerCard.rightsub : "";
			
			// ADD TITLE AND SUBTITLE TO DISPLAY OBJECT...
			if (PowerCard.name !== undefined) Display += doInlineFormatting(Title + Subtitle + "</span></div>", ALLOW_URLS, ALLOW_HIDDEN_URLS);
			else Display += "<div style='" + ShadowBoxStyle + "'>";
			
			// CREATE ROW STYLES & OTHER INFO...
			var OddRow = "color: " + PowerCard.orowtx + "; background-color: " + PowerCard.orowbg + "; ";
			var EvenRow = "color: " + PowerCard.erowtx + "; background-color: " + PowerCard.erowbg + "; ";
			var RowBackground = OddRow;
			var RowNumber = 1;
			var Indent = 0;
			
			// ROW STYLE...
			var RowStyle = "" + "line-height: " + PowerCard.lineheight + "; " + "vertical-align: middle; " + "font-family: " + PowerCard.bodyfont + "; " + "font-size: " + PowerCard.bodyfontsize + "; " + "font-weight: normal; font-style: normal; text-align: left; " + "margin 0px; " + "padding: 4px 5px 2px 5px; " + "border-left: " + PowerCard.border + "; " + "border-right: " + PowerCard.border + ";";
			
			// ALT ROW STYLES...
			var FirstRowStyle = RowStyle + "border-top: " + PowerCard.border + "; border-radius: " + PowerCard.corners + "px " + PowerCard.corners + "px 0px 0px;";
			var LastRowStyle = RowStyle + " border-bottom: " + PowerCard.border + "; border-radius: 0px 0px " + PowerCard.corners + "px " + PowerCard.corners + "px;";
			var OneRowStyle = RowStyle + " border: " + PowerCard.border + "; border-radius: " + PowerCard.corners + "px;";
			
			// KEY INFO...
			var KeyCount = 0;
			var Keys = Object.keys(PowerCard);
			
			// CONDITIONAL STATEMENTS TO REMOVE TAGS FROM KEYS...
			KeyCount = 0;
			Keys.forEach(function(Tag) {
				var Result = "";
				var Conditional = "";
				var LeftVal = "";
				var OP = "";
				var RightVal = "";
				var Operand = "";
				var Success = false;
				var OriginalTag = Tag;
				while (Tag.charAt(0) === "?" && Tag.charAt(1) === "?") {
					Conditional = Tag.match(/\?\?(.*?)\?\?/g)[0].replace(/\?\?/g, "").trim().split(" ");
					while (Operand !== undefined) {
						LeftVal = Conditional.shift();
						OP = Conditional.shift();
						RightVal = Conditional.shift();
						// GET LEFT SIDE VALUES...
						if (LeftVal !== undefined && LeftVal.match(/\$\[\[/)) {
							LeftVal = parseFloat(x[0].inlinerolls[LeftVal.match(/[0-9]+/)].results.total);
						} else if (LeftVal !== undefined && LeftVal.charAt(0) === "$") {
							LeftVal = LeftVal.split("."); 
							if (LeftVal[1]) {
								if (LeftVal[1] == "ss") LeftVal[1] = "successes";
							} else LeftVal[1] = "total";
							if (Rolls[LeftVal[0]]) LeftVal = parseFloat(Rolls[LeftVal[0]][LeftVal[1]]);
						} else {
							if (isFinite(LeftVal) && !isNaN(LeftVal)) {
								LeftVal = (parseFloat(LeftVal) || 0);
							} else {
								// Not a number, left empty for possible future use...
								if (LeftVal === "NULL") {
									LeftVal = "";
								}
								if (LeftVal.charAt(0) === "&") {
									var l=LeftVal.split(".");
									LeftVal = getAttrByName(l[0].slice(1), l[1]);
								}
							}
						}
						// GET RIGHT SIDE VALUES...
						if (RightVal !== undefined && RightVal.match(/\$\[\[/)) {
							RightVal = parseFloat(x[0].inlinerolls[RightVal.match(/[0-9]+/)].results.total);
						} else if (RightVal !== undefined && RightVal.charAt(0) === "$") {
							RightVal = RightVal.split(".");
							if (RightVal[1]) {
								if (RightVal[1] == "ss") RightVal[1] = "successes";
							} else RightVal[1] = "total";
							if (Rolls[RightVal[0]]) RightVal = parseFloat(Rolls[RightVal[0]][RightVal[1]]);
						} else {
							if (isFinite(RightVal) && !isNaN(RightVal)) {
								RightVal = (parseFloat(RightVal) || 0);
							} else {
								// Not a number, left empty for possible future use...
								if (RightVal === "NULL") {
									RightVal = "";
								}
								if (RightVal.charAt(0) === "&") {
									var l=RightVal.split(".");
									RightVal = getAttrByName(l[0].slice(1), l[1]);
								}
							}
						}
						switch (OP) {
							case ">":
								Success = (LeftVal > RightVal);
								break;
							case ">=":
								Success = (LeftVal >= RightVal);
								break;
							case "==":
								Success = (LeftVal == RightVal);
								break;
							case "<=":
								Success = (LeftVal <= RightVal);
								break;
							case "<":
								Success = (LeftVal < RightVal);
								break;
							case "<>":
								Success = (LeftVal != RightVal);
								break;
							case "%":
								Success = ((LeftVal % RightVal) == 0);
								break;
							case "~%":
								Success = ((LeftVal % RightVal) != 0);
								break;
							default:
								Success = false;
						}
						Operand = Conditional.shift();
						if (Operand !== undefined) {
							if (Operand.toLowerCase() === "and" && Success === false) break;
							if (Operand.toLowerCase() === "or" && Success === true) break;
						}
					}
					if (Success) Tag = Tag.replace(/\?\?(.*?)\?\?/, "").trim();
					else Tag = Tag.replace(/\?\?(.*?)\?\?/, "$").trim();
				}
				PowerCard[Tag] = PowerCard[OriginalTag];
				Keys[KeyCount] = Tag;
				KeyCount++;
			});
			
			// REMOVE IGNORED TAGS...
			var IgnoredTags = ["charid", "tokenid", "emote", "leftsub", "rightsub", "name", "txcolor", "bgcolor", "erowbg", "erowtx", "orowbg", "orowtx", "whisper", "format", "title", "target_list", "titlefont", "subtitlefont", "bodyfont", "corners", "titlefontsize", "subtitlefontsize", "bodyfontsize", "border", "boxshadow", "titlefontvariant", "subtitlefontvariant", "titlefontshadow", "titlebackground", "lineheight", "emotefont"];
			IgnoredTags.forEach(function(Tag) {
				if (Keys.indexOf(Tag) !== -1) Keys.splice(Keys.indexOf(Tag), 1);
			});
			
			// LOOP THROUGH SOUNDFX & ALTERBAR TAGS
			var NewKeys = [];
			var timeout = 0;
			var skipEffect = false;
			Keys.forEach(function(Tag) {
				if (Tag.substring(0,7) == "soundfx" || Tag.substring(0,8) == "alterbar" || Tag.substring(0,7) == "vfx_opt" || Tag.substring(0,4) == "api_" || Tag.substring(0,9) == "audioattr" || Tag.substring(0,7) == "vfxattr" ) {
					
					if (Tag.substring(0,7) == "soundfx") sendChat("", "!roll20AM " + PowerCard[Tag].replace(/(?:\s+|\b)_/g, " --"));
					
					// As an alternative to the --soundfx tag, --audioattr will allow you to specify a token_id and an attribute name.
					// If the specified token has the specified attribute, it's value will be passed as a command line to Roll20 Audio Master
					if (Tag.substring(0,9) == "audioattr") {
						var audiocmd = (PowerCard[Tag].replace(/ +(?= )/g,'') + " ").split(" ");
						if (audiocmd.length == 3) {
						  var audioToken = getObj("graphic", audiocmd[0]);
						  if (audioToken !== undefined) {
							  var audioChar = getObj("character", audioToken.get("represents"));
							  if (findObjs({ type: 'attribute', characterid: audioChar.id, name: audiocmd[1] }).length > 0 ) {
								  var audioParams = getAttrByName(audioChar.id, audiocmd[1]);
								  sendChat("", "!roll20AM " + audioParams);
							  }
						  }
						}
					}
				
					if (Tag.substring(0,7) == "vfxattr") {
						// Start off assuming the attribute isn't going to be present on the character and that we won'table
						// actually be displaying a visual effect
						skipEffect = true;
						var vfxatcmd = (PowerCard[Tag].replace(/ +(?= )/g,'') + " ").split(" ");
						if (vfxatcmd.length == 3) {
						  var vfxToken = getObj("graphic", vfxatcmd[0]);
						  if (vfxToken !== undefined) {
							  var vfxChar = getObj("character", vfxToken.get("represents"));
							  if (findObjs({ type: 'attribute', characterid: vfxChar.id, name: vfxatcmd[1] }).length > 0 ) {
								  // The attribute exists, so get its value and split it into parts. Because we can't decode things
								  // like @{selected|token_id} in the API (that happens in the chat system before it gets to us)
								  // we use a special code where "s" is selected and "t" is target. Neither, one, or both can be
								  // specified, and the order determines where a point-to-point effect starts and ends. The final
								  // parameter is the effect descriptor.
								  var vfxParams = (getAttrByName(vfxChar.id, vfxatcmd[1]).replace(/ +(?= )/g,'') + " ").split(" ");
								  var p_from = "";
								  var p_to = "";
								  var fx = vfxParams[vfxParams.length-2];
								  if (vfxParams[0].toLowerCase() == "s" && PowerCard.tokenid !== undefined) { p_from = PowerCard.tokenid + " "; }
								  if (vfxParams[0].toLowerCase() == "t" && TargetToken !== undefined) { p_from = TargetToken.id + " "; }
								  if (vfxParams[1].toLowerCase() == "s" && PowerCard.tokenid !== undefined) { p_to = PowerCard.tokenid + " "; }
								  if (vfxParams[1].toLowerCase() == "t" && TargetToken !== undefined) { p_to = TargetToken.id + " "; }
								  // We update the content of the tag and let the existing code for vfx_opt handle the effect.
								  PowerCard[Tag] = p_from + p_to + fx;
								  skipEffect = false;
							  }
						  }
						}
					}
					
					if (Tag.substring(0,7) == "vfx_opt" || Tag.substring(0,7) == "vfxattr") {
						var vfxcmd = (PowerCard[Tag].replace(/ +(?= )/g,'') + " ").split(" ");

						if (!skipEffect) {
							var vfxEffect = 0
							// Determine effect properties based on the number of parameters passed
							if (vfxcmd.length == 2)	{ Token = getObj("graphic", PowerCard.tokenid);	vfxEffect = 0; }
							if (vfxcmd.length >= 3 ) { Token = getObj("graphic", vfxcmd[0]); vfxEffect = 1; }
							if (vfxcmd.length == 4) { TargetToken = getObj("graphic", vfxcmd[1]); vfxEffect = 2; }
							// Create the effect. If the descriptor is parameter 0 or 1, this is a single target effect.
							if (vfxEffect <= 1) {
								if (Token !== undefined) {
									var effectInfo = findObjs({_type:"custfx", name:vfxcmd[vfxEffect]});
									if (!_.isEmpty(effectInfo)) {
										spawnFxWithDefinition(Token.get('left'), Token.get('top'), effectInfo[0].get('definition'), Campaign().get('playerpageid'));
									} else {
										spawnFx(Token.get('left'), Token.get('top'), vfxcmd[vfxEffect], Campaign().get('playerpageid'));
									}
								}
							// Otherwise, it is a point-to-point effect, so use that function.
							} else {
								if (Token !== undefined && TargetToken !== undefined) {
									// Check to see if this a custom effect that exists in the campaign and use it if so.
									var effectInfo = findObjs({_type:"custfx", name:vfxcmd[vfxEffect]});
									if (!_.isEmpty(effectInfo)) {
										var angleDeg = Math.atan2(TargetToken.get('top') - Token.get('top'), TargetToken.get('left') - Token.get('left')) * 180 / Math.PI;
										if (angleDeg < 0) { angleDeg += 360; }
										var definition = effectInfo[0].get('definition');
										definition.angle = angleDeg;
										spawnFxWithDefinition(Token.get('left'), Token.get('top'), effectInfo[0].get('definition'), Campaign().get('playerpageid'));
									} else {
										spawnFxBetweenPoints({x:Token.get('left'), y:Token.get('top')}, {x:TargetToken.get('left'), y:TargetToken.get('top')}, vfxcmd[vfxEffect], Campaign().get('playerpageid'));
									}
								}
							}					
						}
					}
					
					if (Tag.substring(0,8) == "alterbar") {
						PowerCard[Tag] = doInlineFormatting(PowerCard[Tag], ALLOW_URLS, ALLOW_HIDDEN_URLS, Rolls);
						setTimeout( function() { sendChat(msg.who, "!alter " + PowerCard[Tag].replace(/(?:\s+|\b)_/g, " --")) }, timeout);
						timeout = timeout + 250;
					}
					
					// Generic API tags. Usage is --api_command|parameter1 parameter2 etc. where command is the api command (leave off the ! at the beginning).
					// Parameters are separated by spaces
					if (Tag.substring(0,4) == "api_") {
						// Support multi-tag (*1, *2, etc.) by only taking up to a space or an asterisk as the command
						var apicmd = Tag.substring(4);
						if (apicmd.indexOf(" ") !== -1) {
							apicmd = apicmd.substring(0,apicmd.indexOf(" "));
						}
						if (apicmd.indexOf("*") !== -1) {
							apicmd = apicmd.substring(0,apicmd.indexOf("*"));
						}
						// Some macros check their number of parameters, and if they expect 0 and we include a space after the API command they
						// can get confused. We assume there will be a space, but if the "text" of the tag is empty, we eliminate the space for
						// the purposes of the API call.
						var spacer = " ";
						if (PowerCard[Tag].replace(/(?:\s+|\b)_/g, " --").length == 0) {
							spacer = "";
						}
						PowerCard[Tag] = doInlineFormatting(PowerCard[Tag],ALLOW_URLS, ALLOW_HIDDEN_URLS, Rolls);
						setTimeout( function () { sendChat(msg.who, "!" + apicmd + spacer + PowerCard[Tag].replace(/(?:\s+|\b)_/g, " --")) }, timeout);
						timeout = timeout + 250;
					}
				} else {
					if (Tag.charAt(0) !== "$" && Tag !== "hroll" && Tag !== "hrolls") NewKeys.push(Tag);
				}
			});
			Keys = NewKeys;
			
			// LOOP THROUGH REMAINING KEYS TO CREATE ROW DIVS FROM POWERCARD OBJECT...
			KeyCount = 0;
			Keys.forEach(function(Tag) {
				KeyCount++;
				Content = doInlineFormatting(PowerCard[Tag], ALLOW_URLS, ALLOW_HIDDEN_URLS, Rolls);
				RowBackground = (RowNumber % 2 == 1) ? OddRow : EvenRow;
				if (PowerCard.name === undefined) {
					if (Keys.length !== 1 && KeyCount === 1) RowBackground += FirstRowStyle;
					else if (Keys.length !== 1 && KeyCount === Keys.length) RowBackground += LastRowStyle;
					else if (Keys.length === 1) RowBackground += OneRowStyle;
					else RowBackground += RowStyle;
				} else {
					if (KeyCount === Keys.length) RowBackground += LastRowStyle;
					else RowBackground += RowStyle;
				}
				if (Content.indexOf("$[[") === -1) RowBackground = RowBackground.replace("padding: 4px 5px 2px 5px", "padding: 4px 5px 3px 5px");
				RowNumber += 1;
				Tag = Tag.replace(/( #[0-9]+)/g, ""); // Hides multitag numbers...
				Tag = Tag.replace(/( \*[0-9]+)/g, ""); // Hides same name tag numbers...
				if (Tag.charAt(0) !== "!") {
					if (Tag.charAt(0) === "^") {
						Indent = (parseInt(Tag.charAt(1)) > 0) ? " padding-left: " + (Tag.charAt(1) * 1.5) + "em;" : "";
						Tag = (parseInt(Tag.charAt(1)) >= 0) ? Tag.substring(2) : Tag.substring(1);
						Display += "<div style='" + RowBackground + Indent + "'><b>" + Tag + "</b> " + Content + "</div>";
					} else {
						Display += "<div style='" + RowBackground + "'><b>" + Tag + "</b> " + Content + "</div>";
					}
				} else {
					if (Tag.charAt(1) === "^") {
						Indent = (parseInt(Tag.charAt(2)) > 0) ? " padding-left: " + (Tag.charAt(2) * 1.5) + "em;" : "";
						Display += "<div style='" + RowBackground + Indent + "'>" + Content + "</div>";
					} else {
						Display += "<div style='" + RowBackground + "'>" + Content + "</div>";
					}
				}
			});
			
			// CLOSE SHADOWBOX DIV...
			Display += "</div>";
			
			// REPLACE INLINE ROLLS WITH VALUES
			if (x[0].inlinerolls !== undefined) {
				// SAVE TOKEN OR CHARACTER ID FOR USE WITH TRKR ROLL OPTION...
				var TrackerID = "-1";
				TrackerID = (PowerCard.charid !== undefined) ? "C|" + PowerCard.charid : TrackerID;
				TrackerID = (PowerCard.tokenid !== undefined) ? "T|" + PowerCard.tokenid : TrackerID;
				var RollExpression = "";
				var RollValue = 0;
				var i = 1;
				Object.keys(x[0].inlinerolls).forEach(function(i) {
					RollValue = x[0].inlinerolls[i];
					if (PowerCard.emote && PowerCard.emote.indexOf("$[[" + i + "]]") !== -1) PowerCard.emote = PowerCard.emote.replace("$[[" + i + "]]", buildInline(RollValue, TrackerID, msg.who));
					if (Display.indexOf("$[[" + i + "]]") !== -1) Display = Display.replace("$[[" + i + "]]", buildInline(RollValue, TrackerID, msg.who));
				});
			}
			
			// WHISPER
			if (PowerCard.whisper !== undefined) {
				if (PowerCard.emote !== undefined) {
					if (PowerCard.charid !== undefined || PowerCard.tokenid !== undefined) {
						safeSendChat("", "/desc " + PowerCard.emote)
					} else {
						safeSendChat("", '/emas " " ' + PowerCard.emote);
					}
				}
				_.each(PowerCard.whisper.split(","), function(y) {
					var WhisperTarget = ('self' === y.trim() ? msg.who : y.trim());
					safeSendChat(msg.who, "/w " + WhisperTarget + " " + Display);
				});
			} else {
				if (PowerCard.emote !== undefined) {
					if (PowerCard.charid !== undefined || PowerCard.tokenid !== undefined) {
						safeSendChat("", "/desc " + PowerCard.emote + Display);
					} else {
						safeSendChat("", '/emas " " ' + PowerCard.emote);
						safeSendChat("", "/desc " + Display);
					}
				} else {
					safeSendChat("", "/desc " + Display);
				}
			}
		});
	};

	// FUNCTIONS ///////////////////////////////////////////////////////////////////
	function buildInline(inlineroll, TrackerID, who) {
		var InlineColorOverride = "";
		var values = [];
		var critRoll = false;
		var failRoll = false;
		var critCheck = false;
		var failCheck = false;
		var expandedCheck = false;
		var highRoll = false;
		var lowRoll = false;
		var noHighlight = false;
		var expandedRoll = false;
		var expandedRollReversed = false;
		var notInline = false;
		var addToTracker = false;

		inlineroll.results.rolls.forEach(function(roll) {
			var result = processRoll(roll, noHighlight, expandedRoll, expandedRollReversed, critCheck, failCheck, notInline);
			if (result["critCheck"]) critCheck = true;
			if (result["failCheck"]) failCheck = true;
			if (result["noHighlight"]) noHighlight = true;
			if (result["expandedRoll"]) expandedRoll = true;
			if (result["expandedRollReversed"]) expandedRollReversed = true;
			if (result["notInline"]) notInline = true;
			if (result["addToTracker"]) {
				// ADD TOKEN OR CHARACTER OR DISPLAY NAME TO TURN ORDER TRACKER...
				var TrackerName = "";
				if (TrackerID.charAt(0) === "C") {
					var Char = getObj("character", TrackerID.substring(2));
					var Tok = findObjs({
						type: 'graphic',
						pageid: Campaign().get("playerpageid"),
						represents: TrackerID.substring(2)
					});
					if (_.isEmpty(Tok) && Char !== undefined) TrackerName = Char.get("name");
					else if (_.isEmpty(Tok)) { TrackerID=undefined; } else { TrackerID = Tok[0].id; }
				} else if (TrackerID.charAt(0) === "T") TrackerID = TrackerID.substring(2);
				else TrackerName = who;
				// CHECK TURN ORDER FOR EXISTING ID... REPLACE PR VALUE IF FOUND...
				var turn_order = ("" === Campaign().get("turnorder")) ? [] : JSON.parse(Campaign().get("turnorder"));
				var pos = turn_order.map(function(z) {
					return z.id;
				}).indexOf(TrackerID);
				if (pos === -1) turn_order.push({
					id: TrackerID,
					pr: inlineroll.results.total,
					custom: TrackerName
				});
				else turn_order[pos]["pr"] = inlineroll.results.total;
				// OPEN THE INITIATIVE WINDOW IF IT'S CLOSED...
				if (!Campaign().get("initiativepage")) Campaign().set("initiativepage", true);
				
				// SEND TURN ORDER BACK TO THE CAMPAIGN() OBJECT...
				Campaign().set("turnorder", JSON.stringify(turn_order));
			}
			if (result.value !== "") values.push(result.value);
		});

		// OVERRIDE THE ROLL20 INLINE ROLL COLORS...
		if (critCheck && failCheck) InlineColorOverride = INLINE_ROLL_CRIT_BOTH;
		else if (critCheck && !failCheck) InlineColorOverride = INLINE_ROLL_CRIT_HIGH;
		else if (!critCheck && failCheck) InlineColorOverride = INLINE_ROLL_CRIT_LOW;
		else InlineColorOverride = INLINE_ROLL_DEFAULT;

		// PARSE TABLE RESULTS
		inlineroll.results.tableentries = _.chain(inlineroll.results.rolls)
			.filter(function(r) {
				var tbl = _.has(r, 'table');
				return _.has(r, 'table');
			})
			.reduce(function(memo, r) {
				_.each(r.results, function(i) {
					i = i.tableItem;
					if (!/^[+\-]?(0|[1-9][0-9]*)([.]+[0-9]*)?([eE][+\-]?[0-9]+)?$/.test(i.name)) {
						memo.push({
							name: i.name,
							weight: i.weight,
							table: r.table
						});
					}
				});
				return memo;
			}, [])
			.value();

		// REMOVE ROLL OPTIONS LIKE NH, XPND, EMPTY BRACKETS, & ADD SPACING...
		inlineroll.expression = inlineroll.expression
			.replace(/\|nh|nh/, "")
			.replace(/\|rpnd|rpnd/i, "")
			.replace(/\|xpnd|xpnd/i, "")
			.replace(/\|trkr|trkr/i, "")
			.replace(/\[\]/, "")
			.replace("<", "&" + "amp;" + "lt;")
			.replace(/\+/g, " + ")
			.replace(/\-/g, " - ")
			.replace(/\*/g, " * ")
			.replace(/\//g, " / ");
		// END ROLL OPTIONS

		// FINAL STEP...
		var rollOut = "";
		if (expandedRoll) {
			if (notInline) {
				rollOut = values.join("") + " = " + inlineroll.results.total;
			} else {
				rollOut = '<span style="' + INLINE_ROLL_STYLE + InlineColorOverride + '" title="Roll: ' + inlineroll.expression + '<br>Results: ' + values.join("") + ' = ' + inlineroll.results.total;
				rollOut += '" class="inlinerollresult showtip tipsy">' + values.join("") + ' = ' + inlineroll.results.total + '</span>';
			}
		} else if (expandedRollReversed) {
			if (notInline) {
				rollOut = inlineroll.results.total + " = " + valus.join("");
			} else {
				rollOut = '<span style="' + INLINE_ROLL_STYLE + InlineColorOverride + '" title="Roll: ' + inlineroll.expression + '<br>Results: ' + values.join("") + ' = ' + inlineroll.results.total;
				rollOut += '" class="inlinerollresult showtip tipsy">' + inlineroll.results.total + ' = ' + values.join("") + '</span>';
			}
		} else {
			if (notInline) {
				rollOut = inlineroll.results.total;
			} else {
				rollOut = '<span style="' + INLINE_ROLL_STYLE + InlineColorOverride + '" title="Roll: ' + inlineroll.expression + '<br>Results: ' + values.join("") + ' = ' + inlineroll.results.total;
				rollOut += '" class="inlinerollresult showtip tipsy">' + inlineroll.results.total + '</span>';
			}
		}
		rollOut = (inlineroll.results.tableentries.length) ? '' : rollOut;
		rollOut += _.map(inlineroll.results.tableentries, function(l) {
			return (notInline) ? l.name : '<span style="' + INLINE_ROLL_STYLE + InlineColorOverride + '" title="Table: ' + l.table + ' ' + 'Weight: ' + l.weight + '" class="inlinerollresult showtip tipsy">' + l.name + '</span>';
		}).join('');
		return rollOut;
	};

	function processRoll(roll, noHighlight, expandedRoll, expandedRollReversed, critCheck, failCheck, notInline, addToTracker) {
		var critRoll = false;
		var failRoll = false;
		if (roll.type === "C") {
			return {
				value: " " + roll.text + " "
			};
		} else if (roll.type === "L") {
			if (roll.text.match(/nh/i) !== null) noHighlight = true;
			if (roll.text.match(/xpnd/i) !== null) expandedRoll = true;
			if (roll.text.match(/rpnd/i) !== null) expandedRollReversed = true;
			if (roll.text.match(/txt/i) !== null) notInline = true;
			if (roll.text.match(/trkr/i) !== null) addToTracker = true;
			return {
				noHighlight: noHighlight,
				expandedRoll: expandedRoll,
				expandedRollReversed: expandedRollReversed,
				notInline: notInline,
				addToTracker: addToTracker
			};
		} else if (roll.type === "M") {
			if (roll.expr.toString().match(/\+|\-|\*|\\/g)) roll.expr = roll.expr.toString().replace(/\+/g, " + ").replace(/\-/g, " - ").replace(/\*/g, " * ").replace(/\//g, " / ");
			return {
				value: roll.expr
			};
		} else if (roll.type === "R") {
			var rollValues = [];
			_.each(roll.results, function(result) {
				if (result.tableItem !== undefined) {
					rollValues.push(result.tableItem.name);
				} else {
					critRoll = false;
					failRoll = false;
					if (noHighlight) {
						critRoll = false;
						failRoll = false;
					} else {
						var Sides = roll.sides;
						// CRITROLL CHECKS...
						if (roll.mods && roll.mods["customCrit"]) {
							var p = 0;
							_.each(roll.mods["customCrit"], function() {
								if (roll.mods["customCrit"][p]["comp"] === "<=" && result.v <= roll.mods["customCrit"][p]["point"]) critRoll = true;
								if (roll.mods["customCrit"][p]["comp"] === "==" && result.v == roll.mods["customCrit"][p]["point"]) critRoll = true;
								if (roll.mods["customCrit"][p]["comp"] === ">=" && result.v >= roll.mods["customCrit"][p]["point"]) critRoll = true;
								p++;
							});
						} else {
							if (result.v === Sides) critRoll = true;
						}
						// FAILROLL CHECKS...
						if (roll.mods && roll.mods["customFumble"]) {
							var p = 0;
							_.each(roll.mods["customFumble"], function() {
								if (roll.mods["customFumble"][p]["comp"] === "<=" && result.v <= roll.mods["customFumble"][p]["point"]) failRoll = true;
								if (roll.mods["customFumble"][p]["comp"] === "==" && result.v == roll.mods["customFumble"][p]["point"]) failRoll = true;
								if (roll.mods["customFumble"][p]["comp"] === ">=" && result.v >= roll.mods["customFumble"][p]["point"]) failRoll = true;
								p++;
							});
						} else {
							if (result.v === 1) failRoll = true;
						}
					}
					if (expandedRoll) result.v = "<span style='" + (critRoll ? 'color: #040;' : (failRoll ? 'color: #600;' : '')) + "'>" + result.v + "</span>";
					else result.v = "<span style='" + (critRoll ? 'color: #0F0; font-size: 1.25em;' : (failRoll ? 'color: #F00; font-size: 1.25em;' : '')) + "'>" + result.v + "</span>";
					rollValues.push(result.v);
					if (critRoll) critCheck = true;
					if (failRoll) failCheck = true;
				}
			});
			return {
				value: "(" + rollValues.join(" + ") + ")",
				noHighlight: noHighlight,
				expandedRoll: expandedRoll,
				expandedRollReversed: expandedRollReversed,
				critCheck: critCheck,
				failCheck: failCheck,
				notInline: notInline,
				addToTracker: addToTracker
			};
		} else if (roll.type === "G") {
			var grollVal = [];
			_.each(roll.rolls, function(groll) {
				_.each(groll, function(groll2) {
					var result = processRoll(groll2, noHighlight, expandedRoll, expandedRollReversed, critCheck, failCheck, notInline);
					grollVal.push(result.value);
					critCheck = critCheck || result.critCheck;
					failCheck = failCheck || result.failCheck;
					noHighlight = noHighlight || result.noHighlight;
					expandedRoll = expandedRoll || result.expandedRoll;
					expandedRollReversed = expandedRollReversed || result.expandedRollReversed;
					notInline = notInline || result.notInline;
					addToTracker = addToTracker || result.addToTracker;
				});
			});
			return {
				value: "{" + grollVal.join(" ") + "}",
				noHighlight: noHighlight,
				expandedRoll: expandedRoll,
				expandedRollReversed: expandedRollReversed,
				critCheck: critCheck,
				failCheck: failCheck,
				notInline: notInline,
				addToTracker: addToTracker
			};
		}
	};

	function statusSymbol(symbol, altForReplace) {
		var icon;
		var info;
		var statuses = [
				'red', 'blue', 'green', 'brown', 'purple', 'pink', 'yellow', // 0-6
				'skull', 'sleepy', 'half-heart', 'half-haze', 'interdiction',
				'snail', 'lightning-helix', 'spanner', 'chained-heart',
				'chemical-bolt', 'death-zone', 'drink-me', 'edge-crack',
				'ninja-mask', 'stopwatch', 'fishing-net', 'overdrive', 'strong',
				'fist', 'padlock', 'three-leaves', 'fluffy-wing', 'pummeled',
				'tread', 'arrowed', 'aura', 'back-pain', 'black-flag',
				'bleeding-eye', 'bolt-shield', 'broken-heart', 'cobweb',
				'broken-shield', 'flying-flag', 'radioactive', 'trophy',
				'broken-skull', 'frozen-orb', 'rolling-bomb', 'white-tower',
				'grab', 'screaming', 'grenade', 'sentry-gun', 'all-for-one',
				'angel-outfit', 'archery-target'
			],
			statusColormap = ['#C91010', '#1076c9', '#2fc910', '#c97310', '#9510c9', '#eb75e1', '#e5eb75'],
			i;
		symbol = altForReplace || symbol;
		
		if (!_.contains(statuses, symbol)) {
			if (state.PowerCard_StatusList[symbol] !== undefined) {
				icon = state.PowerCard_StatusList[symbol].icon;
				info = state.PowerCard_StatusList[symbol].info;
			}
		}
		if (_.contains(statuses, icon)){
			i=_.indexOf(statuses, icon);
			if (i < 7) {
				return '<div style="width: 1em; height: 1em; border-radius: 100%; display: inline-block; margin: 0px 3px; border: 0; vertical-align: text-top; background-color: ' + statusColormap[i] + '"></div>' + info;
			} 
			return '<div style="float: left; width: 24px; height: 24px; display: inline-block; margin: 0; border: 0; cursor: pointer; padding: 0px 3px; background: url(\'https://app.roll20.net/images/statussheet.png\'); background-repeat: no-repeat; background-position: '+((-34)*(i-7))+'px 0px;"></div>' + info;
		}
		return "";
	};

	function doInlineFormatting(content, ALLOW_URLS, ALLOW_HIDDEN_URLS, Rolls) {
		// REPLACE [^ID] with value...
		var RollIDs = content.match(/\[\^(.*?)\]/g);
		if (RollIDs) {
			var rID;
			var rOpt;
			var rCount = 0;
			_.each(RollIDs, function(r) {
				rCount++;
				rID = r.split(".")[0].split("[^")[1].replace("]", "");
				rOpt = (r.split(".")[1] !== undefined) ? r.split(".")[1].replace("]", "") : "total";
				if (Rolls["$" + rID]) {
					switch (rOpt) {
						case "base":
							content = content.replace(r, Rolls["$" + rID].base);
							break;
						case "total":
							content = content.replace(r, Rolls["$" + rID].total);
							break;
						case "ss":
							content = content.replace(r, Rolls["$" + rID].successes);
							break;
						case "ones":
							content = content.replace(r, Rolls["$" + rID].ones);
							break;
						case "tens":
							content = content.replace(r, Rolls["$" + rID].tens);
							break;
					}
				} else {
					content = content.replace(r, " > ROLL ID NOT FOUND < ");
				}
			});
		}
		
		// PARSE FOR INLINE FORMATTING
		var urls = [],
			str,
			formatter = function(s) {
				return s
					.replace(/\[\+(.*?)\]/g, statusSymbol)
					.replace(/__(.*?)__/g, "<u>$1</u>")
					.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
					.replace(/\/\/(.*?)\/\//g, "<i>$1</i>")
					.replace(/\^\^/g, "<br>")
					.replace(/\^\*/g, "<span style='margin-left: 1em;'></span>")
					.replace(/\$\$(#([a-fA-F0-9]{3}|[a-fA-F0-9]{6}))\|(.*?)\$\$/g, "<span style='color: $1;'>$3</span>")
					.replace(/\~\~\~/g, "<hr style='border: 0; height: 0; border-top: 1px solid rgba(0, 0, 0, 0.3); border-bottom: 1px solid rgba(255, 255, 255, 0.3); margin-bottom: 3px; margin-top: 3px;'/>")
					.replace(/\~\J(.*?)\~\J/g, "<div style='text-align: justify; display: block;'>$1</div>")
					.replace(/\~\L(.*?)\~\L/g, "<span style='text-align: left;'>$1</span>")
					.replace(/\~\C(.*?)\~\C/g, "<div style='text-align: center; display: block;'>$1</div>")
					.replace(/\~\R(.*?)\~\R/g, "<div style='text-align: right; float: right;'>$1</div><div style='clear: both;'></div>")
					.replace(/\[\!(.*?)\!\]/g, "<span style='text-align: center; font-size: 100%; font-weight: bold; display: inline-block; min-width: 1.75em; padding: 0px 2px; height: 1em; border-radius: 3px; border: 1px solid; background-color: #FFFEA2; border-color: #87850A; color: #000000;' title='Created by PowerCards' class='showtip tipsy'>$1</span>")
					.replace(/\[\TTB(.*?)\]/g, "<table $1>")
					.replace(/\[\TTE\]/g, "</table>")
					.replace(/\[\TRB(.*?)\]/g, "<tr $1>")
					.replace(/\[\TRE\]/g, "</tr>")
					.replace(/\[\TDB(.*?)\]/g, "<td $1>")
					.replace(/\[\TDE\]/g, "</td>")
				;
			};
		str = _.reduce(
			content.match(/@@.*?@@/g),
			function(m, s, i) {
				var parts = s.replace(/@@(.*)@@/, '$1').split(/\|\|/),
					url = parts.shift().replace(/^\s*(http(s)?:\/\/|\/\/()|())/, 'http$2://'),
					text = formatter(parts.join('||'));
				if (ALLOW_URLS) {
					if (ALLOW_HIDDEN_URLS) {
						urls[i] = '<a href="' + url + '">' + (text || url) + '</a>';
					} else {
						urls[i] = '<a href="' + url + '">' + text + ' [' + url + ']</a>';
					}
				} else {
					urls[i] = s;
				}
				return m.replace(s, '@@' + i + '@@');
			},
			content
		);
		str = formatter(str);
		return _.reduce(
			urls,
			function(m, s, i) {
				return m.replace('@@' + i + '@@', s);
			},
			str
		);
	};

	function getBrightness(hex) {
		hex = hex.replace('#', '');
		var c_r = getHex2Dec(hex.substr(0, 2));
		var c_g = getHex2Dec(hex.substr(2, 2));
		var c_b = getHex2Dec(hex.substr(4, 2));
		return ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
	};

	function getAttrRefValues(char_id, attribute) {
		var n_ref = 0;
		var attr = attribute;
		if (/.*@{.*/.test(attribute)) {
			n_ref = attribute.match(/@{/g).length;
		}
		if (n_ref > 0) { //there are references to attributes
			for  (var i = 0; i < n_ref; i++) { 
				attr = attr.replace(/@{(.*?)}/, function(e) {
					var attr_ref = e.replace(/@{/, '').replace(/}/, '');
					attr_ref = getAttrByName(char_id, attr_ref);
					return getAttrRefValues(char_id, attr_ref);
				});
			}
		}
		return attr;
	};

	function getCurrentTime() {
		var d = new Date();
		var h = ((d.getHours() + 1) < 10 ? "0" : "") + (d.getHours() + 1);
		var m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
		var currentTime = h + ":" + m;
		return currentTime;
	};

	function getHex2Dec(hex_string) {
		hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
		return parseInt(hex_string, 16);
	};

	function getOnlinePlayerNames() {
		var PlayerDisplayNames = [];
		var Players = findObjs({_type: "player"});
		_.each(Players, function (p) {
			if (p.get("online")) PlayerDisplayNames.push(p.get("displayname"));
		});
		return PlayerDisplayNames.join();
	};

	// Retrieves the contents of a handout named "PowerCard Formats" and parses the notes field
	// to create a table of avaiable formats to use with the --format tag.
	function getPowerCardFormats() {
		var PowerCard_FormatHandout = findObjs({
			_type: "handout",
			name: "PowerCard Formats"
		})[0];
		if (PowerCard_FormatHandout !== undefined) {
			var PowerCard_Formats = {};
			var FormatName = "";
			var FormatContent = "";
			PowerCard_FormatHandout.get("notes", function(notes) {
				notes = notes.split("<br>");
				notes.forEach(function(notes) {
					FormatName = notes.substring(0, notes.indexOf(":")).trim();
					FormatContent = notes.substring(notes.indexOf(":") + 1).trim();
					if (FormatName !== "" && FormatContent !== "") PowerCard_Formats[FormatName] = " " + FormatContent;
				});
				state.PowerCard_Formats = PowerCard_Formats;
			});
		}
	};

	// Retrieves the contents of a handout named "PowerCard Status List" and parses the notes field
	// to create a table of token status markers and their meanings/descriptions.
	function getPowerCardStatusList() {
		var PowerCard_FormatStatusList = findObjs({
			_type: "handout",
			name: "PowerCard Status List"
		})[0] || findObjs({
			_type: "handout",
			name: "PowerCards Status List"
		})[0];
		if (PowerCard_FormatStatusList !== undefined) {
			var PowerCard_StatusList = {};
			var Status;
			var StatusName = "";
			var StatusIcon = "";
			var StatusInfo = "";
			PowerCard_FormatStatusList.get("notes", function(notes) {
				notes = notes.split("<br>");
				notes.forEach(function(notes) {
					Status = notes.split("|");
					if (!_.isEmpty(Status)) {
						StatusName = Status[0];
						StatusIcon = Status[1];
						StatusInfo = Status[2];
						if (StatusName !== "" && StatusName !== undefined) {
							PowerCard_StatusList[StatusName] = {
								"icon": StatusIcon || "",
								"info": StatusInfo || ""
							}
						}
					}
				});
				state.PowerCard_StatusList = PowerCard_StatusList;
			});
		}
	};

	function getTargetInfo(content, TargetList) {
		// PARSE FOR TARGET INFO REPLACEMENT CHARMS
		var Token = getObj("graphic", TargetList[0]);
		if (Token === undefined) return content;
		var Character = getObj("character", Token.get("represents"));

		// TOKEN CHARMS
		return content.replace(/%%(.*?)%%/g, function(m, charm) {
			var attr;
			switch (charm) {
				case 'token_name':
					return Token.get('name');
				case 'bar1':
				case 'bar2':
				case 'bar3':
					return Token.get(charm + '_value');
				case 'bar1_max':
				case 'bar2_max':
				case 'bar3_max':
					return Token.get(charm);
				default:
					attr = getAttrByName(Character.id, charm);
					attr = getAttrRefValues(Character.id, attr);
				return (Character && attr) || 'ERROR';
			}
		});
	};

	// Instead of throwing an error or returning undefined, return an empty string if
	// the attribute doesn't exist on the character.
	function getAttrOrEmptyString(characterID, attributeName) {
		var o = findObjs({ type: 'attribute', characterid: characterID, name: attributeName})
 		if (!_.isEmpty(o)) {
			return getAttrByName(characterID, attributeName);
		} else {
			return "";
		}
	}
	
	// If "testvalue" is not undefined or an empty string, will return the result of 
	// adding the prefix, the testvalue, and the postfix together. Otherwise, the
	// value of alternative is returned.
	function outputIfNotEmpty(prefix, testvalue, postfix, alternative) {
		if (testvalue !== undefined && testvalue !== "") {
			return prefix + testvalue + postfix;
		} else {
			return alternative;
		}
	}

	// Check the "character_sheet" attribute to determine which sheet is being used.
	// Based on this information, map the 5E OGL sheet attribute names to the equivalent
	// attributes for that sheet. Note that we assume the sheet in use is 5E OGL
	function getSheetSpecificAttrName(characterID, OGLName) {
		var sheet="5E OGL";
		var attr = getAttrOrEmptyString(characterID, "character_sheet");
		if (attr == "" ) {
			return OGLName;
		} else {
			if (attr.substr(0,7) == "Shaped ") {
				switch (OGLName) {
					case "npc_ac": return "AC";
					case "npc_challenge": return "challenge";
					case "lvl" : return "spell_slots_level_";
					case "_slots_total" : return "";
					case "_slots_expended" : return "_remaining";
					case "npc_senses" : return "senses_string";
					case "npc_immunities" : return "damage_immunities";
					case "npc_acrobatics_base" : return "acrobatics";
					case "npc_animal_handling_base": return "animalhandling"; 
					case "npc_arcana_base": return "arcana"; 
					case "npc_athletics_base": return "athletics"; 
					case "npc_deception_base": return "deception"; 
					case "npc_history_base": return "history"; 
					case "npc_insight_base": return "insight"; 
					case "npc_intimidation_base": return "intimidation"; 
					case "npc_investigation_base": return "investigation"; 
					case "npc_medicine_base": return "medicine"; 
					case "npc_nature_base": return "nature"; 
					case "npc_perception_base": return "perception"; 
					case "npc_performance_base": return "performance"; 
					case "npc_persuasion_base": return "persuasion"; 
					case "npc_religion_base": return "religion"; 
					case "npc_sleight_of_hand_base": return "sleightofhand"; 
					case "npc_stealth_base": return "stealth"; 
					case "npc_survival_base": return "survival"; 
				    default: return OGLName;
				}
			}
		}
	}
	
	// Uses getSheetSpecificAttrName to retrieve a character sheet attribute independant of the 
	// sheet being used by specifying he 5E OGL name. If the attribute doesn't exist, returns an
	// empty string.
	function getSheetAttr(characterID, attrName)
	{
		if (!attrName.substr(0,10) == "repeating_") {
		  return getAttrOrEmptyString(characterID, getSheetSpecificAttrName(characterID, attrName));
		} else {
			return getAttrByName(characterID, getSheetSpecificAttrName(characterID, attrName)) || "";
		}
	}
	
	function getRepeatingCount(characterID, prefix, postfix)
	{
		var attrs = findObjs({ type: 'attribute', characterid: characterID });
		var attrCount = 0;
		attrs.forEach(function (s) { if (s.get("name").startsWith(prefix) && s.get("name").endsWith(postfix)) { attrCount += 1;} } );
		return attrCount;
	}
	
	function safeSendChat(speakingAs, message, callback) {
		try {
			sendChat(speakingAs, message, callback);
		}
		catch (e) {
			sendChat("PowerCards", JSON.stringify(e));
		}
	}

	function sortByKey(array, key) {
		return array.sort(function(a, b) {
			var x = a.get(key);
			var y = b.get(key);
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
	}
	
	const getRepeatingSectionAttrs = function (charid, prefix) {
		// Input
		//  charid: character id
		//  prefix: repeating section name, e.g. 'repeating_weapons'
		// Output
		//  repRowIds: array containing all repeating section IDs for the given prefix, ordered in the same way that the rows appear on the sheet
		//  repeatingAttrs: object containing all repeating attributes that exist for this section, indexed by their name
		const repeatingAttrs = {},
			regExp = new RegExp(`^${prefix}_(-[-A-Za-z0-9]+?|\\d+)_`);
		let repOrder;
		// Get attributes
		findObjs({
			_type: 'attribute',
			_characterid: charid
		}).forEach(o => {
			const attrName = o.get('name');
			if (attrName.search(regExp) === 0) repeatingAttrs[attrName] = o;
			else if (attrName === `_reporder_${prefix}`) repOrder = o.get('current').split(',');
		});
		if (!repOrder) repOrder = [];
		// Get list of repeating row ids by prefix from repeatingAttrs
		const unorderedIds = [...new Set(Object.keys(repeatingAttrs)
			.map(n => n.match(regExp))
			.filter(x => !!x)
			.map(a => a[1]))];
		const repRowIds = [...new Set(repOrder.filter(x => unorderedIds.includes(x)).concat(unorderedIds))];
		return [repRowIds, repeatingAttrs];
	}
}());