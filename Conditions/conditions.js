var Conditions = Conditions || {
    ALL_STATUSES:  ["red", "blue", "green", "brown", "purple", "pink", "yellow",
		    "dead", "skull", "sleepy", "half-heart", "half-haze", "interdiction", "snail", "lightning-helix", "spanner",
		    "chained-heart", "chemical-bolt", "death-zone", "drink-me", "edge-crack", "ninja-mask", "stopwatch",
		    "fishing-net", "overdrive", "strong", "fist", "padlock", "three-leaves", "fluffy-wing", "pummeled", "tread",
		    "arrowed", "aura", "back-pain", "black-flag", "bleeding-eye", "bolt-shield", "broken-heart", "cobweb",
		    "broken-shield", "flying-flag", "radioactive", "trophy", "broken-skull", "frozen-orb", "rolling-bomb",
		    "white-tower", "grab", "screaming", "grenade", "sentry-gun", "all-for-one", "angel-outfit", "archery-target"],
    STATUS_NOICON: ["red", "blue", "green", "brown", "purple", "pink", "yellow", "dead"],
    STATUS_ICONS: {'skull':		"http://game-icons.net/icons/lorc/originals/png/skull-crossed-bones.png",
		    'half-haze':	"http://game-icons.net/icons/lorc/originals/png/heat-haze.png",
		    '__default__':	"http://game-icons.net/icons/lorc/originals/png/%s.png"},


    ignoreAttr: null,


    init: function(){
	if (!state.hasOwnProperty('Conditions')){ state.Conditions = {}; }
	if (!state.Conditions.hasOwnProperty('conditions')){ state.Conditions.conditions = {}; }
	if (!state.Conditions.hasOwnProperty('characters')){ state.Conditions.characters = {}; }
	Conditions.computeAttributes();
    },

    computeAttributes: function(charId){
	var charIds = [];
	if (charId){ charIds.push(charId); }
	else{
	    for (var cid in state.Conditions.characters){
		if (state.Conditions.characters.hasOwnProperty(cid)){ charIds.push(cid); }
	    }
	}
	function trackEffect(mods, attr, effect){
	    if (!mods[attr]){ mods[attr] = {}; }
	    var stackClass = effect.stackClass || "";
	    switch (effect.type){
	    case "addfact":
	    case "offset":
		if (!mods[attr][effect.type]){ mods[attr][effect.type] = {}; }
		if (!mods[attr][effect.type].hasOwnProperty(stackClass)){ mods[attr][effect.type][stackClass] = 0; }
		if (stackClass){
		    if (effect.value > mods[attr][effect.type][stackClass]){
			mods[attr][effect.type][stackClass] = effect.value;
		    }
		}
		else{
		    mods[attr][effect.type][stackClass] += effect.value;
		}
		break;
	    case "multfact":
		if (!mods[attr][effect.type]){ mods[attr][effect.type] = {}; }
		if (!mods[attr][effect.type].hasOwnProperty(stackClass)){ mods[attr][effect.type][stackClass] = 1; }
		if (stackClass){
		    if (effect.value > mods[attr][effect.type][stackClass]){
			mods[attr][effect.type][stackClass] = effect.value;
		    }
		}
		else{
		    mods[attr][effect.type][stackClass] *= effect.value;
		}
		break;
	    case "max":
		if ((!mods[attr].hasOwnProperty(effect.type)) || (effect.value < mods[attr][effect.type])){
		    mods[attr][effect.type] = effect.value;
		}
		break;
	    case "min":
	    case "abs":
		if ((!mods[attr].hasOwnProperty(effect.type)) || (effect.value > mods[attr][effect.type])){
		    mods[attr][effect.type] = effect.value;
		}
		break;
	    }
	}
	for (var i = 0; i < charIds.length; i++){
	    var charRec = state.Conditions.characters[charIds[i]];
	    if (!charRec.dirty){ continue; }
	    var mods = {};
	    if (charRec.conditions){
		for (var c in charRec.conditions){
		    if (!charRec.conditions.hasOwnProperty(c)){ continue; }
		    for (var attr in charRec.conditions[c].effects){
			trackEffect(mods, attr, charRec.conditions[c].effects[attr]);
		    }
		}
	    }
	    if (charRec.anonymous){
		for (var attr in charRec.anonymous){
		    if (!charRec.anonymous.hasOwnProperty(attr)){ continue; }
		    for (var j = 0; j < charRec.anonymous[attr].length; j++){
			trackEffect(mods, attr, charRec.anonymous[attr][j]);
		    }
		}
	    }
	    if (!charRec.base){ charRec.base = {}; }
	    for (var attr in mods){
		if (!mods.hasOwnProperty(attr)){ continue; }
		var objs = findObjs({_type: "attribute", _characterid: charIds[i], name: attr}) || [];
/////
//
		var attrObj = objs[0];
		if (!attrObj){ continue; }
		//try getAttrByName; create attribute if it gives us results
		//should make note that we couldn't find attribute
//
/////
		if (!charRec.base[attr]){
		    charRec.base[attr] = {'current': attrObj.get('current'), 'max': attrObj.get('max')};
		}
		var curVal = parseFloat(charRec.base[attr].current), maxVal = parseFloat(charRec.base[attr].max);
		var fact = 1;
		if (mods[attr]['addfact']){
		    for (var sc in mods[attr]['addfact']){
			if (mods[attr]['addfact'].hasOwnProperty(sc)){ fact += mods[attr]['addfact'][sc]; }
		    }
		}
		if (mods[attr]['multfact']){
		    for (var sc in mods[attr]['multfact']){
			if (mods[attr]['multifact'].hasOwnProperty(sc)){ fact *= mods[attr]['multfact'][sc]; }
		    }
		}
		if (!isNaN(curVal)){ curVal *= fact; }
		if (!isNaN(maxVal)){ maxVal *= fact; }
		if (mods[attr]['offset']){
		    var offset = 0;
		    for (var sc in mods[attr]['offset']){
			if (mods[attr]['offset'].hasOwnProperty(sc)){ offset += mods[attr]['offset'][sc]; }
		    }
		    if (!isNaN(curVal)){ curVal += offset; }
		    if (!isNaN(maxVal)){ maxVal += offset; }
		}
		if (mods[attr].hasOwnProperty('max')){
		    if ((!isNaN(curVal)) && (curVal > mods[attr]['max'])){ curVal = mods[attr]['max']; }
		    if ((!isNaN(maxVal)) && (maxVal > mods[attr]['max'])){ maxVal = mods[attr]['max']; }
		}
		if (mods[attr].hasOwnProperty('min')){
		    if ((!isNaN(curVal)) && (curVal < mods[attr]['min'])){ curVal = mods[attr]['min']; }
		    if ((!isNaN(maxVal)) && (maxVal < mods[attr]['min'])){ maxVal = mods[attr]['min']; }
		}
		if (mods[attr].hasOwnProperty('max')){
		    if (!isNaN(curVal)){ curVal = mods[attr]['max']; }
		    if (!isNaN(maxVal)){ maxVal = mods[attr]['max']; }
		}
		if ((curVal != charRec.base[attr].current) || (maxVal != charRec.base[attr].max)){
		    var props = {};
		    if ((!isNaN(curVal)) && (curVal != charRec.base[attr].current)){ props.current = curVal; }
		    if ((!isNaN(maxVal)) && (maxVal != charRec.base[attr].max)){ props.max = maxVal; }
		    Conditions.ignoreAttr = attrObj._id;
		    attrObj.set(props);
		    Conditions.ignoreAttr = null;
		}
	    }
	    // reset attributes without mods to base value
	    for (var attr in charRec.base){
		if (mods[attr]){ continue; }
		var objs = findObjs({_type: "attribute", _characterid: charIds[i], name: attr}) || [];
/////
//
		var attrObj = objs[0];
		if (!attrObj){ continue; }
		//try getAttrByName; create attribute if it gives us results
		//should make note that we couldn't find attribute
//
/////
		if ((attrObj.get('current') != charRec.base[attr].current) || (attrObj.get('max') != charRec.base[attr].max)){
		    var props = {};
		    if (attrObj.get('current') != charRec.base[attr].current){
			props.current = charRec.base[attr].current;
		    }
		    if (attrObj.get('max') != charRec.base[attr].max){
			props.max = charRec.base[attr].max;
		    }
		    Conditions.ignoreAttr = attrObj._id;
		    attrObj.set(props);
		    Conditions.ignoreAttr = null;
		}
		delete charRec.base[attr];
	    }
	    charRec.dirty = false;
	}
    },

    handleTokenCreate: function(tok){
	if (!state.Conditions.characters[tok.get('represents')]){
	    return;
	}
	var properties = {}, propsChanged = false;;
	for (var cond in state.Conditions.characters[tok.get('represents')].conditions){
	    if (!state.Conditions.characters[tok.get('represents')].conditions.hasOwnProperty(cond)){ continue; }
	    if (!state.Conditions.characters[tok.get('represents')].conditions[cond].icon){ continue; }
	    properties["status_" + state.Conditions.characters[tok.get('represents')].conditions[cond].icon] = true;
	    propsChanged = true;
	}
	if (propsChanged){
	    tok.set(properties);
	}
    },

    handleTokenChange: function(tok, prev){
	if (tok.get('represents') == prev.represents){
	    return;
	}
	var properties = {}, propsChanged = false;;
	if (state.Conditions.characters[prev.represents]){
	    // remove status icons for previous character
	    for (var cond in state.Conditions.characters[prev.represents].conditions){
		if (!state.Conditions.characters[prev.represents].conditions.hasOwnProperty(cond)){ continue; }
		if (!state.Conditions.characters[prev.represents].conditions[cond].icon){ continue; }
		properties["status_" + state.Conditions.characters[prev.represents].conditions[cond].icon] = false;
		propsChanged = true;
	    }
	}
	if (state.Conditions.characters[tok.get('represents')]){
	    // add status icons for new character
	    for (var cond in state.Conditions.characters[tok.get('represents')].conditions){
		if (!state.Conditions.characters[tok.get('represents')].conditions.hasOwnProperty(cond)){ continue; }
		if (!state.Conditions.characters[tok.get('represents')].conditions[cond].icon){ continue; }
		properties["status_" + state.Conditions.characters[tok.get('represents')].conditions[cond].icon] = true;
		propsChanged = true;
	    }
	}
	if (propsChanged){
	    tok.set(properties);
	}
    },

    handleAttrChange: function(attrObj, prev){
	if (attrObj.get('id') == Conditions.ignoreAttr){ return; }
	if (attrObj.get('characterid') != prev._characterid){ return; }
	var charRec = state.Conditions.characters[prev._characterid];
	if ((!charRec) || (!charRec.base) || (!charRec.base[prev.name])){ return; }
	// if we got this far, a modified attribute changed (and we didn't change it); use new value as base and recompute
	delete charRec.base[prev.name];
	charRec.dirty = true;
	Conditions.computeAttributes(prev._characterid);
    },

    write: function(s, who, style, from){
	if (who){
	    who = "/w " + who.split(" ", 1)[0] + " ";
	}
	sendChat(from, who + s.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    },

    showHelp: function(who, cmd, subCmd){
	var usage  = "", helpMsg = "";
	switch (subCmd){
	case "create":
	    usage += "Usage: " + cmd + " " + subCmd + " NAME [options]\n";
	    usage += "Create a new named condition.\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Name of the new condition\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -i I, --icon I        Icon to display on tokens affected by this condition\n";
	    helpMsg += "  -d D, --desc D        Description of this condition\n";
	    break;
	case "copy":
	    usage += "Usage: " + cmd + " " + subCmd + " CONDITION NAME [options]\n";
	    usage += "Create a copy of an existing condition and all its effects.\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  CONDITION:    Name of the condition to copy\n";
	    helpMsg += "  NAME:         Name of the new condition\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -i I, --icon I        Use I instead of CONDITION's icon (\"null\" to delete)\n";
	    helpMsg += "  -d D, --desc D        Use D instead of CONDITION's description (\"null\" to delete)\n";
	    break;
	case "rename":
	    usage += "Usage: " + cmd + " " + subCmd + " OLD_NAME NEW_NAME\n";
	    usage += "Rename an existing condition (will not modify effects already on characters).\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  OLD_NAME:     Name of the condition to rename\n";
	    helpMsg += "  NEW_NAME:     New name to give the condition\n";
	    break;
	case "edit":
	    usage += "Usage: " + cmd + " " + subCmd + " NAME [options]\n";
	    usage += "Modify parameters of an existing condition (will not modify effects already on characters).\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Name of the condition to modify\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -i I, --icon I        Condition icon (\"null\" to delete)\n";
	    helpMsg += "  -d D, --desc D        Condition description (\"null\" to delete)\n";
	    break;
	case "delete":
	    usage += "Usage: " + cmd + " " + subCmd + " NAME\n";
	    usage += "Delete an existing condition (will not remove effects already on characters).\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Name of the condition to delete\n";
	    break;
	case "list":
	    usage += "Usage: " + cmd + " " + subCmd + " [NAME]\n";
	    usage += "List all defined conditions, or all effects of a specified condition.\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Name of the condition to describe\n";
	    break;
	case "icons":
	    usage += "Usage: " + cmd + " " + subCmd + "\n";
	    usage += "List available status icons.\n";
	    break;
	case "addeffect":
	    usage += "Usage: " + cmd + " " + subCmd + " CONDITION ATTRIBUTE EFFECT [options]\n";
	    usage += "Add an effect to an existing condition (will not modify effects already on characters).\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  CONDITION:    Name of the condition to which to add effect\n";
	    helpMsg += "  ATTRIBUTE:    Name of the character attribute to modify\n";
	    helpMsg += "  EFFECT:       How to modify attribute:\n";
	    helpMsg += "                  + X%    Add X% to base attribute multiplier\n";
	    helpMsg += "                  - X%    Subtract X% from base attribute multiplier\n";
	    helpMsg += "                  * X     Multiply attribute by X\n";
	    helpMsg += "                  / X     Divide attribute by X\n";
	    helpMsg += "                  * X%    Multiply attribute by X / 100\n";
	    helpMsg += "                  / X%    Divide attribute by X / 100\n";
	    helpMsg += "                  + X     Add X to attribute (after multipliers)\n";
	    helpMsg += "                  - X     Subtract X to attribute (after multipliers)\n";
	    helpMsg += "                  < X     Reduce attribute to X if greater than X (after modifications)\n";
	    helpMsg += "                  > X     Increase attribute to X if less than X (after modifications)\n";
	    helpMsg += "                  = X     Set attribute to X\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -s C, --stack C       Name of effect's stacking class.\n";
	    helpMsg += "                        Only the largest modifier of a class will apply.\n";
	    break;
	case "editeffect":
	    usage += "Usage: " + cmd + " " + subCmd + " CONDITION ATTRIBUTE EFFECT [options]\n";
	    usage += "Edit an existing effect of an existing condition (will not modify effects already on characters).\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  CONDITION:    Name of the condition whose effect will be modified\n";
	    helpMsg += "  ATTRIBUTE:    Name of the character attribute whose effect will be modified\n";
	    helpMsg += "  EFFECT:       How to modify attribute:\n";
	    helpMsg += "                  + X%    Add X% to base attribute multiplier\n";
	    helpMsg += "                  - X%    Subtract X% from base attribute multiplier\n";
	    helpMsg += "                  * X     Multiply attribute by X\n";
	    helpMsg += "                  / X     Divide attribute by X\n";
	    helpMsg += "                  * X%    Multiply attribute by X / 100\n";
	    helpMsg += "                  / X%    Divide attribute by X / 100\n";
	    helpMsg += "                  + X     Add X to attribute (after multipliers)\n";
	    helpMsg += "                  - X     Subtract X to attribute (after multipliers)\n";
	    helpMsg += "                  < X     Reduce attribute to X if greater than X (after modifications)\n";
	    helpMsg += "                  > X     Increase attribute to X if less than X (after modifications)\n";
	    helpMsg += "                  = X     Set attribute to X\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -s C, --stack C       Name of effect's stacking class (\"null\" to delete).\n";
	    helpMsg += "                        Only the largest modifier of a class will apply.\n";
	    break;
	case "removeeffect":
	    usage += "Usage: " + cmd + " " + subCmd + " CONDITION ATTRIBUTE\n";
	    usage += "Remove an existing effect from an existing condition (will not modify effects already on characters).\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  CONDITION:    Name of the condition whose effect will be removed\n";
	    helpMsg += "  ATTRIBUTE:    Name of the character attribute whose effect will be removed\n";
	    break;
	case "apply":
	    usage += "Usage: " + cmd + " " + subCmd + " CONDITION [options]\n";
	    usage += "Apply a defined condition to one or more characters.\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  CONDITION:    Name of the condition to apply\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -c C, --character C   ID, token ID, or name of character to which to apply condition.\n";
	    helpMsg += "                        May be specified more than once to apply to multiple characters.\n";
	    helpMsg += "                        If not specified, all characters represented by selected tokens will be used.\n";
	    break;
	case "remove":
	    usage += "Usage: " + cmd + " " + subCmd + " CONDITION [options]\n";
	    usage += "Removed a defined condition from one or more characters.\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  CONDITION:    Name of the condition to remove\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -c C, --character C   ID, token ID, or name of character from which to remove condition.\n";
	    helpMsg += "                        May be specified more than once to remove from multiple characters.\n";
	    helpMsg += "                        If not specified, all characters represented by selected tokens will be used.\n";
	    break;
	case "applyanon":
	    usage += "Usage: " + cmd + " " + subCmd + " ATTRIBUTE EFFECT [options]\n";
	    usage += "Add an anonymous effect to one or more characters.\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  ATTRIBUTE:    Name of the character attribute to modify\n";
	    helpMsg += "  EFFECT:       How to modify attribute:\n";
	    helpMsg += "                  + X%    Add X% to base attribute multiplier\n";
	    helpMsg += "                  - X%    Subtract X% from base attribute multiplier\n";
	    helpMsg += "                  * X     Multiply attribute by X\n";
	    helpMsg += "                  / X     Divide attribute by X\n";
	    helpMsg += "                  * X%    Multiply attribute by X / 100\n";
	    helpMsg += "                  / X%    Divide attribute by X / 100\n";
	    helpMsg += "                  + X     Add X to attribute (after multipliers)\n";
	    helpMsg += "                  - X     Subtract X to attribute (after multipliers)\n";
	    helpMsg += "                  < X     Reduce attribute to X if greater than X (after modifications)\n";
	    helpMsg += "                  > X     Increase attribute to X if less than X (after modifications)\n";
	    helpMsg += "                  = X     Set attribute to X\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -c C, --character C   ID, token ID, or name of character to which to apply effect.\n";
	    helpMsg += "                        May be specified more than once to apply to multiple characters.\n";
	    helpMsg += "                        If not specified, all characters represented by selected tokens will be used.\n";
	    helpMsg += "  -s C, --stack C       Name of effect's stacking class.\n";
	    helpMsg += "                        Only the largest modifier of a class will apply.\n";
	    break;
	case "removeanon":
	    usage += "Usage: " + cmd + " " + subCmd + " ATTRIBUTE [EFFECT] [options]\n";
	    usage += "Remove an anonymous effect from one or more characters.\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  ATTRIBUTE:    Attribute from which to remove anonymous effect\n";
	    helpMsg += "  EFFECT:       Index of the anonymous effect to remove (default: 0)\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -c C, --character C   ID, token ID, or name of character from which to remove effect.\n";
	    helpMsg += "                        May be specified more than once to apply to multiple characters.\n";
	    helpMsg += "                        If not specified, all characters represented by selected tokens will be used.\n";
	    helpMsg += "                        Be careful with multiple characters, as only one effect index can be given at a time.\n";
	    break;
	case "clear":
	    usage += "Usage: " + cmd + " " + subCmd + " [options]\n";
	    usage += "Remove all named and anonymous conditions from one or more characters.\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -c C, --character C   ID, token ID, or name of character from which to remove conditions/effects.\n";
	    helpMsg += "                        May be specified more than once to apply to multiple characters.\n";
	    helpMsg += "                        If not specified, all characters represented by selected tokens will be used.\n";
	    break;
	case "active":
	    usage += "Usage: " + cmd + " " + subCmd + " [options]\n";
	    usage += "List active conditions and effects on one or more characters.\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -c C, --character C   ID, token ID, or name of character for which to list conditions/effects.\n";
	    helpMsg += "                        May be specified more than once to apply to multiple characters.\n";
	    helpMsg += "                        If not specified, all characters represented by selected tokens will be used.\n";
	    break;
	case "attrs":
	    usage += "Usage: " + cmd + " " + subCmd + " [options]\n";
	    usage += "List modified attributes and their base values for one or more characters.\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -c C, --character C   ID, token ID, or name of character for which to list attributes.\n";
	    helpMsg += "                        May be specified more than once to apply to multiple characters.\n";
	    helpMsg += "                        If not specified, all characters represented by selected tokens will be used.\n";
	    break;
	default:
	    usage += "Usage: " + cmd + " COMMAND [options]";
	    helpMsg += "help [COMMAND]:         display generic or command-specific help\n";
	    helpMsg += "create NAME [...]:      create a new named condition\n";
	    helpMsg += "copy COND NAME [...]:   copy an existing named condition\n";
	    helpMsg += "rename OLD NEW:         rename an existing condition\n";
	    helpMsg += "edit NAME [...]:        modify an existing named condition\n";
	    helpMsg += "delete NAME:            delete an existing named condition\n";
	    helpMsg += "list [NAME]:            list defined conditions, or effects of one condition\n";
	    helpMsg += "icons:                  list available status icons\n";
	    helpMsg += "addeffect COND [...]:   add an effect to an existing condition\n";
	    helpMsg += "editeffect COND [...]:  modify an effect of an existing condition\n";
	    helpMsg += "removeeffect COND [...]:remove an effect of an existing condition\n";
	    helpMsg += "apply COND [...]:       apply a named condition to one or more characters\n";
	    helpMsg += "remove COND [...]:      remove a named condition from one or more characters\n";
	    helpMsg += "applyanon [...]:        apply an anonymous condition to one or more characters\n";
	    helpMsg += "removeanon [...]:       remove an anonymous condition from a character\n";
	    helpMsg += "clear [...]:            remove all conditions from one or more characters\n";
	    helpMsg += "active [...]:           list conditions active on one or more characters\n";
	    helpMsg += "attrs [...]:            list modified attributes of one or more characters\n";
	}
	Conditions.write(usage, who, "", "Cond");
	if (helpMsg){ Conditions.write(helpMsg, who, "font-size: small; font-family: monospace", "Cond"); }
    },


    addCondition: function(condName, icon, desc){
	if (state.Conditions.conditions[condName]){
	    return "Error: Condition '" + condName + "' already defined; please use edit or delete command";
	}
	if (icon == "null"){ icon = undefined; }
	if (desc == "null"){ desc = undefined; }
	state.Conditions.conditions[condName] = {'icon': icon, 'desc': desc, 'effects': {}};
    },

    copyConditionObject: function(cond){
	var retval = {'icon': cond.icon, 'desc': cond.desc, 'effects': {}};
	for (var attr in cond.effects){
	    if (!cond.effects.hasOwnProperty(attr)){ continue; }
	    retval.effects[attr] = _.clone(cond.effects[attr]);
	}
	return retval;
    },

    copyCondition: function(srcName, destName, icon, desc){
	if (!state.Conditions.conditions[srcName]){
	    return "Error: Condition '" + srcName + "' not defined; please use add command";
	}
	if (state.Conditions.conditions[destName]){
	    return "Error: Condition '" + destName + "' already defined; please use edit or delete command";
	}
	var newCond = Conditions.copyConditionObject(state.Conditions.conditions[srcName]);
	if (icon == "null"){ newCond.icon = undefined; }
	else if (icon){ newCond.icon = icon; }
	if (desc == "null"){ newCond.desc = undefined; }
	else if (desc){ newCond.desc = desc; }
	state.Conditions.conditions[destName] = newCond;
    },

    renameCondition: function(oldName, newName){
	if (!state.Conditions.conditions[oldName]){
	    return "Error: Condition '" + oldName + "' not defined; please use add command";
	}
	if (state.Conditions.conditions[newName]){
	    return "Error: Condition '" + newName + "' already defined; please use edit or delete command";
	}
	state.Conditions.conditions[newName] = state.Conditions.conditions[oldName];
	delete state.Conditions.conditions[oldName];
    },

    editCondition: function(condName, icon, desc){
	if (!state.Conditions.conditions[condName]){
	    return "Error: Condition '" + condName + "' not defined; please use add command";
	}
	if (icon == "null"){ state.Conditions.conditions[condName].icon = undefined; }
	else if (icon){ state.Conditions.conditions[condName].icon = icon; }
	if (desc == "null"){ state.Conditions.conditions[condName].desc = undefined; }
	else if (desc){ state.Conditions.conditions[condName].desc = desc; }
    },

    deleteCondition: function(condName){
	if (!state.Conditions.conditions[condName]){
	    return "Error: Condition '" + condName + "' not defined";
	}
	delete state.Conditions.conditions[condName];
    },

    formatEffect: function(effect){
	var retval = "";
	switch (effect.type){
	case "addfact":
	    var op = (effect.value >= 0 ? "+ " : "- ");
	    var val = Math.abs(effect.value);
	    var pctStr = op + (val * 100) + "%";
	    var absStr = op + val + "x";
	    retval += (pctStr.length <= absStr.length ? pctStr : absStr);
	    break;
	case "multfact":
	    var opts = ["* " + (effect.value * 100) + "%", "* " + effect.value];
	    if (effect.value != 0){
		opts.push("/ " + (100 / effect.value) + "%");
		opts.push("/ " + (1 / effect.value));
	    }
	    opts.sort(function(x, y){ return x.length - y.length; });
	    retval += opts[0];
	    break;
	case "offset":
	    var op = (effect.value >= 0 ? "+ " : "- ");
	    var val = Math.abs(effect.value);
	    retval += op + val;
	    break;
	case "max":
	    retval += "< " + effect.value;
	    break;
	case "min":
	    retval += "> " + effect.value;
	    break;
	case "abs":
	    retval += "= " + effect.value;
	    break;
	default:
	    retval += "(unrecognized effect type: " + effect.type + ")";
	}
	if (effect.stackClass){
	    retval += " (" + effect.stackClass + ")";
	}
	return retval;
    },

    listCondition: function(who, condName){
	var output = "";
	if (!condName){
	    var condNames = [];
	    for (var k in state.Conditions.conditions){
		if (state.Conditions.conditions.hasOwnProperty(k)){ condNames.push(k); }
	    }
	    if (condNames.length <= 0){
		Conditions.write("No conditions defined", who, "", "Cond");
		return;
	    }
	    condNames.sort();
	    output = condNames.join("\n");
	}
	else if (!state.Conditions.conditions[condName]){
	    return "Error: Condition '" + condName + "' not defined";
	}
	else{
	    output = condName;
	    if (state.Conditions.conditions[condName].icon){
		if (Conditions.STATUS_NOICON.indexOf(state.Conditions.conditions[condName].icon) >= 0){
		    output += " (" + state.Conditions.conditions[condName].icon + ")";
		}
		else{
		    var image = Conditions.STATUS_ICONS[state.Conditions.conditions[condName].icon];
		    if (!image){
			image = Conditions.STATUS_ICONS['__default__'].replace("%s", state.Conditions.conditions[condName].icon);
		    }
		    output += " [" + image + "](" + image + ")";
		}
	    }
	    output += "\n";
	    if (state.Conditions.conditions[condName].desc){
		output += state.Conditions.conditions[condName].desc + "\n";
	    }
	    var effectAttrs = [];
	    for (var a in state.Conditions.conditions[condName].effects){
		if (state.Conditions.conditions[condName].effects.hasOwnProperty(a)){
		    effectAttrs.push(a);
		}
	    }
	    if (effectAttrs.length > 0){
		output += "Effects:";
		effectAttrs.sort();
		for (var i = 0; i < effectAttrs.length; i++){
		    var e = state.Conditions.conditions[condName].effects[effectAttrs[i]];
		    output += "\n" + effectAttrs[i] + " ";
		    output += Conditions.formatEffect(e);
		}
	    }
	    else{
		output += "No Effects";
	    }
	}
	Conditions.write(output, who, "font-size: small; font-family: monospace", "Cond");
    },

    listIcons: function(who){
	Conditions.write("Icons:", who, "", "Cond");
	Conditions.write(Conditions.ALL_STATUSES.join(", "), who, "font-size: small; font-family: monospace", "Cond");
    },

    parseEffect: function(effectStr){
	var retval = {};
	effectStr = effectStr.replace(/\s+/g, "");
	if (!effectStr){
	    return "Error: No effect specified";
	}
	var op = effectStr.charAt(0);
	if ("+-*/<>=".indexOf(op) < 0){
	    return "Error: Invalid effect operation: " + op;
	}
	effectStr = effectStr.substring(1);
	var pct = false;
	if (effectStr.charAt(effectStr.length - 1) == "%"){
	    pct = true;
	    effectStr = effectStr.substring(0, effectStr.length - 1);
	}
	if (!effectStr){
	    return "Error: No value specified for effect operation " + op;
	}
	retval.value = parseFloat(effectStr);
	if (isNaN(retval.value)){
	    return "Error: Invalid value for operation " + op + ": " + effectStr;
	}
	switch (op){
	case "-":
	    retval.value = -retval.value;
	    // fall through to "+"
	case "+":
	    if (pct){
		retval.type = "addfact";
		retval.value /= 100;
	    }
	    else{
		retval.type = "offset";
	    }
	    break;
	case "/":
	    if (!retval.value){
		return "Error: Division by zero";
	    }
	    if (pct){
		retval.value /= 100;
	    }
	    retval.value = 1 / retval.value;
	    // fall through to "*"
	case "*":
	    retval.type = "multfact";
	    if ((pct) && (op == "*")){
		retval.value /= 100;
	    }
	    break;
	case "<":
	    retval.type = "max";
	    break;
	case ">":
	    retval.type = "min";
	    break;
	case "=":
	    retval.type = "abs";
	    break;
	default:
	    return "Error: Invalid effect operation: " + op;
	}
	return retval;
    },

    addEffect: function(condName, attrName, effectStr, stackClass){
	if (!state.Conditions.conditions[condName]){
	    return "Error: Condition '" + condName + "' not defined; please use add command";
	}
	if (state.Conditions.conditions[condName].effects[attrName]){
	    return "Error: Condition '" + condName + "' already has effect for attribute '" + attrName + "'; please use editeffect command";
	}
	var e = Conditions.parseEffect(effectStr);
	if (typeof(e) == typeof("")){ return e; }
	if (stackClass){ e.stackClass = stackClass; }
	state.Conditions.conditions[condName].effects[attrName] = e;
    },

    editEffect: function(condName, attrName, effectStr, stackClass){
	if (!state.Conditions.conditions[condName]){
	    return "Error: Condition '" + condName + "' not defined; please use add command";
	}
	if (!state.Conditions.conditions[condName].effects[attrName]){
	    return "Error: Condition '" + condName + "' does not have effect for attribute '" + attrName + "'; please use addeffect command";
	}
	var e = Conditions.parseEffect(effectStr);
	if (typeof(e) == typeof("")){ return e; }
	if (stackClass == "null"){ delete e.stackClass; }
	else if (stackClass){ e.stackClass = stackClass; }
	state.Conditions.conditions[condName].effects[attrName] = e;
    },

    removeEffect: function(condName, attrName){
	if (!state.Conditions.conditions[condName]){
	    return "Error: Condition '" + condName + "' not defined";
	}
	if (!state.Conditions.conditions[condName].effects[attrName]){
	    return "Error: Condition '" + condName + "' does not have effect for attribute '" + attrName + "'";
	}
	delete state.Conditions.conditions[condName].effects[attrName];
    },

    applyCondition: function(characters, condName){
	if (!state.Conditions.conditions[condName]){
	    return "Error: Condition '" + condName + "' not defined";
	}
	var cond = Conditions.copyConditionObject(state.Conditions.conditions[condName]); // never edited, so only need to clone once
	for (var i = 0; i < characters.length; i++){
	    if (!state.Conditions.characters[characters[i]]){
		state.Conditions.characters[characters[i]] = {};
	    }
	    if (!state.Conditions.characters[characters[i]].conditions){
		state.Conditions.characters[characters[i]].conditions = {};
	    }
	    state.Conditions.characters[characters[i]].conditions[condName] = cond;
	    state.Conditions.characters[characters[i]].dirty = true;
	}
	if (cond.icon){
	    for (var i = 0; i < characters.length; i++){
		var tokens = findObjs({_type: "graphic", represents: characters[i]}) || [];
		for (var j = 0; j < tokens.length; j++){
		    tokens[j].set("status_" + cond.icon, true);
		}
	    }
	}
	Conditions.computeAttributes();
    },

    removeCondition: function(characters, condName){
	for (var i = 0; i < characters.length; i++){
	    if (!state.Conditions.characters[characters[i]]){ continue; }
	    if (!state.Conditions.characters[characters[i]].conditions){ continue; }
	    if (!state.Conditions.characters[characters[i]].conditions[condName]){ continue; }
	    var icon = state.Conditions.characters[characters[i]].conditions[condName].icon;
	    if (icon){
		var tokens = findObjs({_type: "graphic", represents: characters[i]}) || [];
		for (var j = 0; j < tokens.length; j++){
		    tokens[j].set("status_" + icon, false);
		}
	    }
	    delete state.Conditions.characters[characters[i]].conditions[condName];
	    state.Conditions.characters[characters[i]].dirty = true;
	}
	Conditions.computeAttributes();
    },

    applyAnonymous: function(characters, attrName, effectStr, stackClass){
	var e = Conditions.parseEffect(effectStr);
	if (typeof(e) == typeof("")){ return e; }
	if (stackClass){ e.stackClass = stackClass; }
	for (var i = 0; i < characters.length; i++){
	    if (!state.Conditions.characters[characters[i]]){
		state.Conditions.characters[characters[i]] = {};
	    }
	    if (!state.Conditions.characters[characters[i]].anonymous){
		state.Conditions.characters[characters[i]].anonymous = {};
	    }
	    if (!state.Conditions.characters[characters[i]].anonymous[attrName]){
		state.Conditions.characters[characters[i]].anonymous[attrName] = [];
	    }
	    state.Conditions.characters[characters[i]].anonymous[attrName].push(e);
	    state.Conditions.characters[characters[i]].dirty = true;
	}
	Conditions.computeAttributes();
    },

    removeAnonymous: function(characters, attrName, effectIdx){
	var removed = false;
	for (var i = 0; i < characters.length; i++){
	    if (!state.Conditions.characters[characters[i]]){ continue; }
	    if (!state.Conditions.characters[characters[i]].anonymous){ continue; }
	    if (!state.Conditions.characters[characters[i]].anonymous[attrName]){ continue; }
	    state.Conditions.characters[characters[i]].anonymous[attrName].splice(effectIdx, 1);
	    state.Conditions.characters[characters[i]].dirty = true;
	    removed = true;
	}
	Conditions.computeAttributes();
	if (!removed){
	    return "Anonymous effect (" + attrName + ", " + effectIdx +") does not exist";
	}
    },

    clearConditions: function(characters){
	for (var i = 0; i < characters.length; i++){
	    if (!state.Conditions.characters[characters[i]]){ continue; }
	    var conds = state.Conditions.characters[characters[i]].conditions || {};
	    for (var condName in conds){
		if (!conds.hasOwnProperty(condName)){ continue; }
		if (!conds[condName].icon){ continue; }
		var tokens = findObjs({_type: "graphic", represents: characters[i]}) || [];
		for (var j = 0; j < tokens.length; j++){
		    tokens[j].set("status_" + conds[condName].icon, false);
		}
	    }
	    delete state.Conditions.characters[characters[i]].conditions;
	    delete state.Conditions.characters[characters[i]].anonymous;
	    state.Conditions.characters[characters[i]].dirty = true;
	}
	Conditions.computeAttributes();
    },

    listEffects: function(who, characters){
	var output = "";
	var charNames = {};
	for (var i = 0; i < characters.length; i++){
	    var obj = getObj("character", characters[i]);
	    if (!obj){
		Conditions.write("Warning: Unable to get character " + characters[i], who, "", "Cond");
		continue;
	    }
	    charNames[characters[i]] = obj.get('name');
	}
	characters.sort(function(x, y){
			    if (charNames[x] < charNames[y]){ return -1; }
			    if (charNames[x] > charNames[y]){ return 1; }
			    return 0;
			});
	for (i = 0; i < characters.length; i++){
	    if (i > 0){ output += "\n\n"; }
	    output += charNames[characters[i]] + ":\n";
	    if (!state.Conditions.characters[characters[i]]){
		output += "No conditions or effects";
		continue;
	    }
	    var conds = state.Conditions.characters[characters[i]].conditions || {};
	    var anon = state.Conditions.characters[characters[i]].anonymous || {};
	    var condNames = [];
	    for (var cond in conds){
		if (conds.hasOwnProperty(cond)){ condNames.push(cond); }
	    }
	    var anonAttrs = [];
	    for (var attr in anon){
		if (anon.hasOwnProperty(attr)){ anonAttrs.push(attr); }
	    }
	    if (condNames.length > 0){
		condNames.sort();
		output += "Conditions:\n  " + condNames.join("\n  ") + "\n";
	    }
	    else{
		output += "No conditions\n";
	    }
	    if (anonAttrs.length > 0){
		output += "Anonymous Effects:";
		for (var j = 0; j < anonAttrs.length; j++){
		    output += "\n  " + anonAttrs[j] + ":";
		    for (var k = 0; k < anon[anonAttrs[j]].length; k++){
			output += "\n    " + k + ": " + Conditions.formatEffect(anon[anonAttrs[j]][k]);
		    }
		}
	    }
	    else{
		output += "No anonymous effects";
	    }
	}
	Conditions.write(output, who, "font-size: small; font-family: monospace", "Cond");
    },

    listModifications: function(who, characters){
	var output = "";
	var charNames = {};
	for (var i = 0; i < characters.length; i++){
	    var obj = getObj("character", characters[i]);
	    if (!obj){
		Conditions.write("Warning: Unable to get character " + characters[i], who, "", "Cond");
		continue;
	    }
	    charNames[characters[i]] = obj.get('name');
	}
	characters.sort(function(x, y){
			    if (charNames[x] < charNames[y]){ return -1; }
			    if (charNames[x] > charNames[y]){ return 1; }
			    return 0;
			});
	for (i = 0; i < characters.length; i++){
	    if (i > 0){ output += "\n\n"; }
	    output += charNames[characters[i]] + ":\n";
	    var baseVals = (state.Conditions.characters[characters[i]] || {}).base || {};
	    var attrs = [];
	    for (var attr in baseVals){
		if (baseVals.hasOwnProperty(attr)){ attrs.push(attr); }
	    }
	    if (attrs.length <= 0){
		output += "No modified attributes";
		continue;
	    }
	    attrs.sort();
	    output += "Modified Attributes (base value):";
	    for (var j = 0; j < attrs.length; j++){
/////
//
		var objs = findObjs({_type: "attribute", _characterid: characters[i], name: attr}) || [];
		var attrObj = objs[0];
		if (!attrObj){
		    //try getAttrByName; suppress warning it gives us results
		    Conditions.write("Warning: Unable to get attribute " + attrs[j], who, "", "Cond");
		    continue;
		}
//
/////
		output += "\n  " + attrs[j] + ": " + attrObj.get('current');
		if (attrObj.get('max')){ output += " / " + attrObj.get('max'); }
		output += " (" + baseVals[attrs[j]].current;
		if (baseVals[attrs[j]].max != ""){ output += " / " + baseVals[attrs[j]].max; }
		output += ")";
	    }
	}
	Conditions.write(output, who, "font-size: small; font-family: monospace", "Cond");
    },

    handleCondMessage: function(tokens, msg){
	if (tokens.length < 2){
	    return Conditions.showHelp(msg.who, tokens[0], null);
	}

	var inlineRolls = msg.inlinerolls || [];
	function replaceInlines(s){
	    if (!inlineRolls){ return s; }
	    var i = parseInt(s.substring(3, s.length - 2));
	    if ((i < 0) || (i >= inlineRolls.length) || (!inlineRolls[i]) || (!inlineRolls[i]['results'])){ return s; }
	    return inlineRolls[i]['results'].total;
	}
	function fixupArg(s){
	    return s.replace(/\$\[\[\d+\]\]/g, replaceInlines);
	}

	var args = {}, posArgs = [];
	var getArg = null;
	for (var i = 2; i < tokens.length; i++){
	    if (getArg){
		if (getArg == "help"){
		    return Conditions.showHelp(msg.who, tokens[0], tokens[i]);
		}
		if (getArg == "characters"){
		    if (!args[getArg]){ args[getArg] = []; }
		    args[getArg].push(tokens[i]);
		}
		else{ args[getArg] = fixupArg(tokens[i]); }
		getArg = null;
		continue;
	    }
	    switch (tokens[i]){
	    case "-i":
	    case "--icon":
		getArg = 'icon';
		break;
	    case "-d":
	    case "--desc":
		getArg = 'desc';
		break;
	    case "-s":
	    case "--stack":
		getArg = 'stackClass';
		break;
	    case "-c":
	    case "--character":
		getArg = 'characters';
		break;
	    default:
		posArgs.push(fixupArg(tokens[i]));
	    }
	}
	if (tokens[1] == "help"){
	    return Conditions.showHelp(msg.who, tokens[0], tokens[2]);
	}
	if (getArg){
	    Conditions.write("Error: Expected argument for " + getArg, msg.who, "", "Cond");
	    return Conditions.showHelp(msg.who, tokens[0], null);
	}

	function getCharacters(charArgs, selected){
	    var retval = [];
	    if ((charArgs) && (charArgs.length > 0)){
		for (var i = 0; i < charArgs.length; i++){
		    var obj = getObj("character", charArgs[i]);
		    if (obj){
			retval.push(charArgs[i]);
			continue;
		    }
		    obj = getObj("graphic", charArgs[i]);
		    if (obj){
			if (obj.get('represents')){ retval.push(obj.get('represents')); }
			continue;
		    }
		    var objs = findObjs({_type: "graphic", name: charArgs[i]}) || [];
		    for (var j = 0; j < objs.length; j++){
			retval.push(j._id);
		    }
		}
	    }
	    else if (selected){
		for (var i = 0; i < selected.length; i++){
		    if (selected[i]._type != "graphic"){ continue; }
		    var tok = getObj(selected[i]._type, selected[i]._id);
		    if (!tok){ continue; }
		    if (!tok.get('represents')){ continue; }
		    retval.push(tok.get('represents'));
		}
	    }
	    return retval;
	}

	var err;
	switch (tokens[1]){
	case "create":
	    if (!posArgs[0]){
		Conditions.write("Error: Must specify condition name", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.addCondition(posArgs[0], args.icon, args.desc);
	    if (!err){
		Conditions.write("Created condition " + posArgs[0], msg.who, "", "Cond");
	    }
	    break;
	case "copy":
	    if ((!posArgs[0]) || (!posArgs[1])){
		Conditions.write("Error: Must specify names of condition to copy and new condition", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.copyCondition(posArgs[0], posArgs[1], args.icon, args.desc);
	    if (!err){
		Conditions.write("Copied condition " + posArgs[0] + " to " + posArgs[1], msg.who, "", "Cond");
	    }
	    break;
	case "rename":
	    if ((!posArgs[0]) || (!posArgs[1])){
		Conditions.write("Error: Must specify old and new name for condition", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.renameCondition(posArgs[0], posArgs[1]);
	    if (!err){
		Conditions.write("Renamed condition " + posArgs[0] + " to " + posArgs[1], msg.who, "", "Cond");
	    }
	    break;
	case "edit":
	    if (!posArgs[0]){
		Conditions.write("Error: Must specify condition name", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.editCondition(posArgs[0], args.icon, args.desc);
	    if (!err){
		Conditions.write("Modified condition " + posArgs[0], msg.who, "", "Cond");
	    }
	    break;
	case "delete":
	    if (!posArgs[0]){
		Conditions.write("Error: Must specify condition name", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.deleteCondition(posArgs[0]);
	    if (!err){
		Conditions.write("Deleted condition " + posArgs[0], msg.who, "", "Cond");
	    }
	    break;
	case "list":
	    err = Conditions.listCondition(msg.who, posArgs[0]);
	    break;
	case "icons":
	    err = Conditions.listIcons(msg.who);
	    break;
	case "addeffect":
	    if ((!posArgs[0]) || (!posArgs[1]) || (!posArgs[2])){
		Conditions.write("Error: Must specify condition name, attribute name, and effect", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.addEffect(posArgs[0], posArgs[1], posArgs.slice(2).join(""), args.stackClass);
	    if (!err){
		Conditions.write("Added effect to condition " + posArgs[0], msg.who, "", "Cond");
	    }
	    break;
	case "editeffect":
	    if ((!posArgs[0]) || (!posArgs[1]) || (!posArgs[2])){
		Conditions.write("Error: Must specify condition name, attribute name, and effect", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.editEffect(posArgs[0], posArgs[1], posArgs.slice(2).join(""), args.stackClass);
	    if (!err){
		Conditions.write("Modified effect of condition " + posArgs[0], msg.who, "", "Cond");
	    }
	    break;
	case "removeeffect":
	    if ((!posArgs[0]) || (!posArgs[1])){
		Conditions.write("Error: Must specify condition name and attribute name", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.removeEffect(posArgs[0], posArgs[1]);
	    if (!err){
		Conditions.write("Removed effect from condition " + posArgs[0], msg.who, "", "Cond");
	    }
	    break;
	case "apply":
	    if (!posArgs[0]){
		Conditions.write("Error: Must specify condition name", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    var characters = getCharacters(args.characters, msg.selected);
	    if (characters.length <= 0){
		Conditions.write("Error: Must specify at least one character", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.applyCondition(characters, posArgs[0]);
	    if (!err){
		Conditions.write("Applied condition " + posArgs[0] + " to " + characters.length + " character(s)", msg.who, "", "Cond");
	    }
	    break;
	case "remove":
	    if (!posArgs[0]){
		Conditions.write("Error: Must specify condition name", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    var characters = getCharacters(args.characters, msg.selected);
	    if (characters.length <= 0){
		Conditions.write("Error: Must specify at least one character", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.removeCondition(characters, posArgs[0]);
	    if (!err){
		Conditions.write("Removed condition " + posArgs[0] + " from " + characters.length + " character(s)", msg.who, "", "Cond");
	    }
	    break;
	case "applyanon":
	    if ((!posArgs[0]) || (!posArgs[1])){
		Conditions.write("Error: Must specify attribute name and effect", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    var characters = getCharacters(args.characters, msg.selected);
	    if (characters.length <= 0){
		Conditions.write("Error: Must specify at least one character", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.applyAnonymous(characters, posArgs[0], posArgs.slice(1).join(""), args.stackClass);
	    if (!err){
		Conditions.write("Applied anonymous effect to " + characters.length + " character(s)", msg.who, "", "Cond");
	    }
	    break;
	case "removeanon":
	    if (!posArgs[0]){
		Conditions.write("Error: Must specify attribute name", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    var characters = getCharacters(args.characters, msg.selected);
	    if (characters.length <= 0){
		Conditions.write("Error: Must specify at least one character", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.removeAnonymous(characters, posArgs[0], parseInt(posArgs[1]) || 0);
	    if (!err){
		Conditions.write("Removed anonymous effect from " + characters.length + " character(s)", msg.who, "", "Cond");
	    }
	    break;
	case "clear":
	    var characters = getCharacters(args.characters, msg.selected);
	    if (characters.length <= 0){
		Conditions.write("Error: Must specify at least one character", msg.who, "", "Cond");
		return Conditions.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Conditions.clearConditions(characters);
	    if (!err){
		Conditions.write("Removed all effects from " + characters.length + " character(s)", msg.who, "", "Cond");
	    }
	    break;
	case "active":
	    var characters = getCharacters(args.characters, msg.selected);
	    if (characters.length <= 0){
		var objs = findObjs({_type: "character"}) || [];
		for (var i = 0; i < objs.length; i++){ characters.push(objs[i]._id); }
		if (characters.length <= 0){
		    Conditions.write("No characters in campaign", msg.who, "", "Cond");
		    return;
		}
	    }
	    err = Conditions.listEffects(msg.who, characters);
	    break;
	case "attrs":
	    var characters = getCharacters(args.characters, msg.selected);
	    if (characters.length <= 0){
		var objs = findObjs({_type: "character"}) || [];
		for (var i = 0; i < objs.length; i++){ characters.push(objs[i]._id); }
		if (characters.length <= 0){
		    Conditions.write("No characters in campaign", msg.who, "", "Cond");
		    return;
		}
	    }
	    err = Conditions.listModifications(msg.who, characters);
	    break;
	default:
	    Conditions.write("Error: Unrecognized command: " + tokens[1], msg.who, "", "Cond");
	    return Conditions.showHelp(msg.who, tokens[0], null);
	}
	if (typeof(err) == typeof("")){
	    Conditions.write(err, msg.who, "", "Cond");
	}
    },

    handleChatMessage: function(msg){
	if ((msg.type != "api") || (msg.content.indexOf("!condition") !=0 )){ return; }

	return Conditions.handleCondMessage(msg.content.split(" "), msg);
    },

    registerConditions: function(){
	Conditions.init();
	if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)){
	    Shell.registerCommand("!condition", "!condition <subcommand> [args]", "Track attribute-modifying conditions", Conditions.handleCondMessage);
	    if (Shell.write){
		Conditions.write = Shell.write;
	    }
	}
	else{
	    on("chat:message", Conditions.handleChatMessage);
	}
	on("add:graphic", Conditions.handleTokenCreate);
	on("change:graphic:represents", Conditions.handleTokenChange);
	on("change:attribute", Conditions.handleAttrChange);
    }
};

on("ready", function(){ Conditions.registerConditions(); });
