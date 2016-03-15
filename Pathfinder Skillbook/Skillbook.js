function getCharacterObj(obj) {
    "use strict";

    //send any object and returns the associated character object
    //returns character object for attribute, token/graphic, and ability, and... character

    var objType = obj._type,
        att, characterObj, tok;

    if ((objType !== "attribute") && (objType !== "graphic") && (objType !== "character")) {
        sendChat("API"," cannot be associated with a character.");
        return;
    } 

    if ((objType === "attribute") || (objType === "ability")) {
        att = getObj(objType, obj._id);
        if (att.get("_characterid") !== "") {
            characterObj = getObj("character", att.get("_characterid"));
        }
    }

    if (objType === "graphic") { 
        tok = getObj("graphic", obj._id);
        if (tok.get("represents") !== "") {
            characterObj = getObj("character", tok.get("represents"));
        } else {
            sendChat("API"," Selected token does not represent a character.");
            return;
        }
    }

    if (objType === "character") {
        characterObj = getObj("character", obj._id);
    }

    return characterObj;
}

var SkillBook = SkillBook || (function() {
    'use strict';
    var version = '1.11',
	lastUpdate = 1458017730,
	skills = { "acrobatics":"Acrobatics", "artistry":"Artistry", "artistry2":"Artistry", "artistry3":"Artistry", "appraise":"Appraise", "bluff":"Bluff", "climb":"Climb", "craft":"Craft", "craft2":"Craft", "craft3":"Craft", "diplomacy":"Diplomacy", "disable-Device":"Disable Device", "disguise":"Disguise", "escape-Artist":"Escape Artist", "fly":"Fly", "handle-Animal":"Handle", "heal":"Heal", "intimidate":"Intimidate", "linguistics":"Linguistics", "lore":"Lore", "lore2":"Lore", "lore3":"Lore", "knowledge-arcana":"Know (arcana)", "knowledge-dungeoneering":"Know (dungeoneering)", "knowledge-engineering":"Know (engineering)", "knowledge-geography":"Know (geography)", "knowledge-history":"Know (history)", "knowledge-local":"Know (local)", "knowledge-nature":"Know (nature)", "knowledge-nobility":"Know (nobility)", "knowledge-planes":"Know (planes)", "knowledge-religion":"Know (religion)", "perception":"Perception", "perform":"Perform", "perform2":"Perform", "perform3":"Perform", "profession":"Profession", "profession2":"Profession", "profession3":"Profession", "ride":"Ride", "sense-Motive":"Sense Motive", "sleight-of-Hand":"Sleight of Hand", "spellcraft":"Spellcraft", "stealth":"Stealth", "survival":"Survival", "swim":"Swim", "use-magic-device":"UMD", "misc-skill-0":"misc-skill-0", "misc-skill-1":"misc-skill-1", "misc-skill-2":"misc-skill-2", "misc-skill-3":"misc-skill-3", "misc-skill-4":"misc-skill-4", "misc-skill-5":"misc-skill-5" },
	miscSkills = [ "artistry", "artistry2", "artistry3", "craft", "craft2", "craft3", "lore", "lore2", "lore3", "perform", "perform2", "perform3", "profession", "profession2", "profession3" ],

    checkInstall = function() {    
        log('-=> Skillbook v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},
	HandleInput = function(msg) {
		"use strict";

		var msg,
			selected,
			tok,
			characterObj,
			characterID,
			characterName,
			skillName,
			skillAttrs,
			macroText,
			i;

		if (msg.type === "api" && msg.content.indexOf("!skillbook") !== -1 )
		{
			selected = msg.selected;
			skillAttrs = Object.keys(skills);
			_.each(selected, function(obj) {
				tok = getObj("graphic", obj._id);
				// Get the character token represents
				characterObj = getCharacterObj(obj);
				if ( ! characterObj) {
					return;
				}
				characterID = characterObj.get("_id");
				characterName = characterObj.get("name");
				macroText = "/w @{character_name} &{template:pf_generic} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{name=Skills}} {{header_image=@{header_image-pf_generic}}} {{";	// Base macro text
				for (i=0; i < skillAttrs.length; i++)
				{
					// miscSkills lists skills that you have to fill the name in
					if (_.indexOf(miscSkills, skillAttrs[i]) !== -1)
					{
						// We're just checking to see if they filled in the name; we'll tie the button title to the attribute, so it'll always use the current name
						var attrName = skillAttrs[i]+"-name";
						skillName = getAttrByName(characterID,attrName);
						
						// If we don't find it the first time, it may be a caps issue
						if (skillName === "" || _.isUndefined(skillName))
						{
							attrName = attrName.substr(0,1).toUpperCase() + attrName.substr(1,attrName.length);
							skillName = getAttrByName(characterID,attrName);
							// If they haven't filled in the skill name, skip this skill
							if (skillName === "" || _.isUndefined(skillName))
								continue;
						}
						skillName = skills[skillAttrs[i]] + " (@{"+attrName+"})";
					}
					else if (skillAttrs[i].indexOf("misc-skill") !== -1)
					{
						// We're just checking to see if they filled in the name; we'll tie the button title to the attribute, so it'll always use the current name
						var attrName = skillAttrs[i]+"-name";
						skillName = getAttrByName(characterID,attrName);
						
						// If we don't find it the first time, it may be a caps issue
						if (skillName === "" || _.isUndefined(skillName))
						{
							attrName = attrName.substr(0,1).toUpperCase() + attrName.substr(1,attrName.length);
							skillName = getAttrByName(characterID,attrName);
							// If they haven't filled in the skill name, skip this skill
							if (skillName === "" || _.isUndefined(skillName))
							{
								attrName = attrName.replace("skill","Skill");
								skillName = getAttrByName(characterID,attrName);
								// If they haven't filled in the skill name, skip this skill
								if (skillName === "" || _.isUndefined(skillName))
									continue;
							}
						}
						skillName = "@{"+skillAttrs[i]+"-name}";
					}
					else
						skillName = skills[skillAttrs[i]];
					macroText = macroText + "["+skillName+"](!&#13;@&#123;"+characterName+"&#124;"+skillAttrs[i]+"-macro&#125;) ";
				}
				macroText = macroText + "}}"
				// Check for existing ability with chosen ability name
				var abil = findObjs({  _type: "ability", _characterid: characterID, name: "Skills" });
				if (abil.length === 0)  // If you don't find one...
				{
					// ...make one
					createObj("ability", {
						name: "Skills",
						characterid: characterObj.get("_id"),
						action: macroText,
						istokenaction: true
					});
				}
				else	// If you DO find one...
				{
					// Just use that one
					abil[0].set("action", macroText);
				}
				sendChat("Skillbook","Done!");
			});
		}
	},

	RegisterEventHandlers = function() {
		on('chat:message', HandleInput);
	};

	return {
        CheckInstall: checkInstall,
		RegisterEventHandlers: RegisterEventHandlers
	};
}());
on("ready",function(){
	'use strict';

	SkillBook.CheckInstall();
	SkillBook.RegisterEventHandlers();
});