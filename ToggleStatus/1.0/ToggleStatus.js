function getAttributeObjects(characterObj,attributeArray) {
    "use strict";

    var i,
        j = 0,
        attributeObjArray = [],
        attributeValue = [] ;    

    // can pass array of attribute strings or a single attribute string    along with an associated character
    // returns those attributes as an object array or returns false if they do not exist on the passed character.

    // get the passed attribute name array from the character object and test if they are defined

    if (characterObj) {
        if (!(attributeArray instanceof Array)) {
            attributeArray = attributeArray.split();
        }
        for (i = 0; i < attributeArray.length; i++) {
            attributeObjArray[i] = findObjs({_type: "attribute", name: attributeArray[i], _characterid: characterObj.id})[0];
        }        
    }
    if (attributeObjArray.indexOf(undefined) !== -1) {
        return false;
    }

    //loop through attributeArray and names of attributes to make sure they all match and get their values if they are valid. 
    //make sure none of the values are empty
    for (i = 0; i < attributeArray.length; i++) {
        attributeValue[i] = attributeObjArray[i].get("current");
        if (attributeValue[i] === "") {
            sendChat("API"," " + attributeArray[i] + " is empty.");
            j++;
        }
    }
    if (j !== 0) {
        return false;
    }

    return attributeObjArray;
}

function getCharacterObj(obj) {
    "use strict";

    //send any object and returns the associated character object
    //returns character object for attribute, token/graphic, and ability, and... character

    var objType = obj._type,
        att, characterObj, tok;

    if ((objType !== "attribute") && (objType !== "graphic") && (objType !== "character")) {
        sendChat("API"," cannot be associated with a character.");
        return false;
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
            return false;
        }
    }

    if (objType === "character") {
        characterObj = getObj("character", obj._id);
    }

    return characterObj;
}

on("chat:message", function(msg) {
    "use strict";

    var msg,
        selected,
        Parameters,
        statusName,
		aName,
        ids,
        attributeName,
        newValue,
        characterObj,
        attributeObjArray,
        tok;

    var cmd = "!toggle-status ";
	if (msg.type === "api" && msg.content.indexOf(cmd) !== -1 )
    {

        //parse the input into two variables, attribute and newValue
        selected = msg.selected;
		Parameters = msg.content.slice(msg.content.indexOf(cmd) + cmd.length);
		statusName = "status_" + Parameters.split("|")[0];
		aName = Parameters.split("|")[1];

        //loop through selected tokens
        _.each(selected, function(obj) {
            tok = getObj("graphic", obj._id);
            characterObj = getCharacterObj(obj);
            if ( ! characterObj) {
                return;
    		}
            attributeObjArray = getAttributeObjects(characterObj, aName);
            if ( ! attributeObjArray) {
                attributeObjArray = new Array();
                attributeObjArray.push(createObj("attribute", {
					name: aName,
					current: "0",
					characterid: characterObj.get("_id")
				}));
			}
    		var attributeName = attributeObjArray[0].get("name"),
				attributeValue = attributeObjArray[0].get("current"),
				characterName = characterObj.get("name");

			// change character attribute
			if (tok.get(statusName) == true)
            {
    			tok.set(statusName,false);
				attributeObjArray[0].set("current", "0");
            }
			else
            {
        		tok.set(statusName,true);
				attributeObjArray[0].set("current", "1");
            }
        });
    }
});