/*
    Attribute initializer for TOR The One Ring in Roll20.
    By uhu79, and updated by Michael "Aragent" I,
    based on the work from Invincible Spleen,thx man!
    To use with the scripts from Michael Heilemann.
    
    This is an API script for Roll20.net, which sets all needed attributes for 
    characters when they are created.
 */
var DefaultAttributes = DefaultAttributes || (function () {
    'use strict';

    // Attributes all characters need for the scripts to work
    var attributeHash = {
            "weary": {
                "current": "normal",
            },
            "stance": {
                "current": "0",
            },
            "miserable": {
                "current": "0",
            },
            "wounded": {
                "current": "0",
            },
			"wound_treated": {
                "current": "0",
            },
    		"endurance": {
                "current": "0",
            },
        	"travel_fatigue": {
                "current": "0",
			},
        	"total_shadow": {
                "current": "0",	
            },
        	"temporary_shadow": {
                "current": "0",
            },
            "permanent_shadow": {
                "current": "0",
            },            
            "hate": {
                "current": "0",
            }, 
            "hope": {
                "current": "0",
            }, 
            "weapon_encumbrance_1": {
                "current": "0",
            },
            "weapon_encumbrance_2": {
                "current": "0",
            },
            "weapon_encumbrance_3": {
                "current": "0",
            },
            "weapon_encumbrance_4": {
                "current": "0",
            },    
            "weapon_encumbrance_5": {
                "current": "0",
            },
			"weapon_encumbrance_6": {
                "current": "0",
            },
			"gear_encumbrance_1": {
                "current": "0",
            }, 
            "gear_encumbrance_2": {
                "current": "0",
            },
            "gear_encumbrance_3": {
                "current": "0",
            },
            "gear_encumbrance_4": {
                "current": "0",
            },
            "gear_encumbrance_5": {
                "current": "0",
            },
            "gear_encumbrance_6": {
                "current": "0",
            },
            "gear_encumbrance_7": {
                "current": "0",
            },
            "gear_encumbrance_8": {
                "current": "0",
            },
			"gear_encumbrance_9": {
                "current": "0",
            },
			"gear_encumbrance_10": {
                "current": "0",
            },
},

        // Function which adds missing attributes to a character
        addAttributes = function(characterID, attributeHash) {
            for (var key in attributeHash) {
                if (attributeHash.hasOwnProperty(key)) {
                    var foundAttribute = findObjs({
                        _characterid: characterID,
                        name: key
                    })[0];
                        
                    if (!foundAttribute) {
                        log("Attribute " + key + " not found for character ID " + characterID + " Creating.");
                        createObj("attribute", {
                            name: key,
                            current: attributeHash[key]["current"],
                            characterid: characterID
                        });
                    }
                }
            }
        },

        // Add all missing attributes to a character
        initCharacterAttributes = function(char){
            addAttributes(char.id, attributeHash);
        },
        
        // Event triggers
        registerEventHandlers = function() {    
            on("add:character", initCharacterAttributes);
        };
    
    return {
        RegisterEventHandlers: registerEventHandlers
    };    
    
})();

on("ready", function() {
    'use strict';
    
    DefaultAttributes.RegisterEventHandlers();    
});