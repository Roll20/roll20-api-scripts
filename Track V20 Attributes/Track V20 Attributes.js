// Github:   https://github.com/invincible-spleen/roll20-api-scripts/blob/master/Track%20V20%20Attributes/Track%20V20%20Attributes.js
// By:       Invincible Spleen
// Contact:  https://app.roll20.net/users/901082

var TrackV20Attributes = TrackV20Attributes || (function () {
    'use strict';
    
    var version = "0.1.0",
        lastUpdate = 1432659997,
        schemaVersion = 0.1,
        
        checkInstall = function() {
            if (! _.has(state, 'TrackV20Attributes') || state.TrackV20Attributes.version !== schemaVersion) {
                log('TrackV20Attributes: Updating to schema v' + schemaVersion);

                state.TrackV20Attributes = {
                    version: schemaVersion
                };

                // Add missing attributes to preexisting characters
                var allCharacters = findObjs({
                    _type: "character"
                });
                _.each(allCharacters, function(obj) {
                    handleCharacterCreation(obj);
                });
            }
        },

        // Disciplines
        disciplineHash = {
            "Animalism": "Animalism",
            "Auspex": "Auspex",
            "Celerity": "Celerity",
            "Chimerstry": "Chimerstry",
            "Dementation": "Dementation",
            "Dominate": "Dominate",
            "Fortitude": "Fortitude",
            "Necromancy": "Necromancy",
            "Obfuscate": "Obfuscate",
            "Obtenebration": "Obtenebration",
            "Potence": "Potence",
            "Presence": "Presence",
            "Protean": "Protean",
            "Quietus": "Quietus",
            "Serpentis": "Serpentis",
            "Thaumaturgy": "Thaumaturgy",
            "Thaumaturgical Countermagic": "ThaumaturgicalCountermagic",
            "Vicissitude": "Vicissitude",
            "Assamite Sorcery": "AssamiteSorcery",
            "Bardo": "Bardo",
            "Daimoinon": "Daimoinon",
            "Flight": "Flight",
            "Koldunic Sorcery": "KoldunicSorcery",
            "Melpominee": "Melpominee",
            "Mytherceria": "Mytherceria",
            "Obeah": "Obeah",
            "Ogham": "Ogham",
            "Sanguinus": "Sanguinus",
            "Spiritus": "Spiritus",
            "Temporis": "Temporis",
            "Thanatosis": "Thanatosis",
            "Valeren": "Valeren",
            "Visceratika": "Visceratika"
        },

        // Paths
        pathHash = {
            "The Sepulchre Path": "TheSepulchrePath",
            "The Ash Path": "TheAshPath",
            "The Bone Path": "TheBonePath",
            "The Cenotaph Path": "TheCenotaphPath",
            "The Corpse in the Monster": "TheCorpseInTheMonster",
            "The Grave's Decay": "TheGravesDecay",
            "Path of the Four Humors": "PathOfTheFourHumors",
            "VitreousPath": "VitreousPath",
            "The Path of Blood": "ThePathOfBlood",
            "Elemental Mastery": "ElementalMastery",
            "The Green Path": "TheGreenPath",
            "Hands of Destruction": "HandsOfDestruction",
            "The Lure of Flames": "TheLureOfFlames",
            "Neptunes Might": "NeptunesMight",
            "Movement of the Mind": "MovementOfTheMind",
            "The Path of Conjuring": "ThePathOfConjuring",
            "The Path of Corruption": "ThePathOfCorruption",
            "The Path pf Mars": "ThePathOfMars",
            "The Path of Technomancy": "ThePathOfTechnomancy",
            "The Path of the Father's Vengeance": "ThePathOfTheFathersVengeance",
            "Weather Control": "WeatherControl",
            "Awakening of the Steel": "AwakeningOfTheSteel",
            "The Way of Earth": "TheWayOfEarth",
            "The Way of Wind": "TheWayOfWind",
            "The Way of Water": "TheWayOfWater",
            "The Way of Fire": "TheWayOfFire"
        },

        // Backgrounds
        backgroundHash = {
            "Allies": "Allies",
            "Alternate Identity": "AlternateIdentity",
            "Black Hand Membership": "BlackHandMembership",
            "Contacts": "Contacts",
            "Domain": "Domain",
            "Fame": "Fame",
            "Generation": "GenerationBackground",
            "Herd": "Herd",
            "Influence": "Influence",
            "Mentor": "Mentor",
            "Resources": "Resources",
            "Retainers": "Retainers",
            "Rituals": "Rituals",
            "Status": "Status"
        },

        // Function which sets a character's attribute to a given value
        setCharAttribute = function(charID, attribute, value) {
            var charAttributes = findObjs({
                name: attribute,
                _characterid: charID
            });
            _.each(charAttributes, function(charAttribute) {
                charAttribute.set("current", value);
            });
        },

        // Function which changes values for tracked attributes
        trackValue = function(changedName, scoreValue, scoreName, characterID, newValue, trackHash) {
            if (changedName === scoreValue) {
                // If Discipline1Name's value is one of our tracked attributes...
                var changedAttribute = getAttrByName(characterID, scoreName);
                if (trackHash.hasOwnProperty(changedAttribute)) {
                    // Set the corresponding attribute to the value of Discipline1 (whew!)
                    var trackedAttributeName = trackHash[changedAttribute];
                    setCharAttribute(characterID, trackedAttributeName, newValue);
                }
            }
        },

        // Function which adds missing attributes to a character
        addTrackedAttribute = function(characterID, attributeHash, max) {
            for (var key in attributeHash) {
                if (attributeHash.hasOwnProperty(key)) {
                    var foundAttribute = findObjs({
                        _characterid: characterID,
                        name: attributeHash[key]
                    })[0];
                        
                    if (!foundAttribute) {
                        log("Attribute " + attributeHash[key] + " not found for character ID " + characterID + " Creating.");
                        createObj("attribute", {
                            name: attributeHash[key],
                            current: 0,
                            max: max,
                            characterid: characterID
                        });
                    }
                }
            }
        },

        // Add Disciplines, Paths, and Backgrounds to newly created characters
        handleCharacterCreation = function(obj){
            addTrackedAttribute(obj.id, disciplineHash, 8);
            addTrackedAttribute(obj.id, pathHash, 5);
            addTrackedAttribute(obj.id, backgroundHash, 8);
        },

        // Track changing attributes
        handleAttributeChange = function(attr, prev){
            var characterID = attr.get("characterid");
            var changedValue = attr.get("current");
            var changedName = attr.get("name");

            for (var i = 1; i < 7; i++) {
                trackValue(changedName, "Discipline" + i, "Discipline" + i + "Name", characterID, changedValue, disciplineHash);
                trackValue(changedName, "Path" + i, "Path" + i + "Name", characterID, changedValue, pathHash);
                trackValue(changedName, "Back" + i, "Back" + i + "Name", characterID, changedValue, backgroundHash);
            }
        },

        // Track initial value of attributes
        handleAttributeCreation = function(attr, prev){
            var characterID = attr.get("characterid");
            var changedValue = attr.get("current");
            var changedName = attr.get("name");

            for (var i = 1; i < 7; i++) {
                trackValue(changedName, "Discipline" + i, "Discipline" + i + "Name", characterID, changedValue, disciplineHash);
                trackValue(changedName, "Path" + i, "Path" + i + "Name", characterID, changedValue, pathHash);
                trackValue(changedName, "Back" + i, "Back" + i + "Name", characterID, changedValue, backgroundHash);
            }
        },

        // Event triggers
        registerEventHandlers = function() {    
            on("add:character", handleCharacterCreation);
            on("add:attribute", handleAttributeCreation);
            on("change:attribute:current", handleAttributeChange);
        };
    
    return {
        CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};    
    
})();

on("ready", function() {
    'use strict';
    
    TrackV20Attributes.CheckInstall();
    TrackV20Attributes.RegisterEventHandlers();    
});