var CONDITION_BONUS = 10;
var CONDITION_PENALTY = 2;
var CONDITION_UNCONSCIOUS = 1;
var CONDITION_DEATH = 0;
var HEALTH_UNCONSCIOUS = 0;
var MAGIC_UNCONSCIOUS = 0;

var DEATH_COLOR = "FF0000";
var UNCONSCIOUS_COLOR = "000000";
var UNCONSCIOUS_MARKER = "death-zone"
var DEATH_MARKER = "dead";
var INJURED_MARKER = "pummeled";
var POISONED_MARKER = "skull";
var SICK_MARKER = "back-pain";
var EXHAUSTED_MARKER = "sleepy";
var MUDDLED_MARKER = "half-haze";
var SHOCKED_MARKER = "broken-heart";

var AURA_COLOR_BONUS_CONDITION = "#FFFF00";
var AURA_COLOR_PENALTY_CONDITION = "#A3C00F";

var setStatusAttributes = function(character, token) {
    var attributes = findObjs({ _type: "attribute", _characterid: character.get("_id")});
    var healthPoints, magicPoints, condition, injured, poisoned, sick, exhausted, muddled, shocked;
    _.each(attributes, function(attribute) {
        var name = attribute.get('name');
        var value = attribute.get('current')
        if (name === 'healthPoints') {
            healthPoints = parseInt(value);
        } else if (name === 'magicPoints') {
            magicPoints = parseInt(value);
        } else if (name === 'condition') {
            condition = parseInt(value);
        } else if (name === 'injured') {
            injured = parseInt(value);
        } else if (name === 'poisoned') {
            poisoned = parseInt(value);
        } else if (name === 'sick') {
            sick = parseInt(value);
        } else if (name === 'exhausted') {
            exhausted = parseInt(value);
        } else if (name === 'muddled') {
            muddled = parseInt(value);
        } else if (name === 'shocked') {
            shocked = parseInt(value);
        }
    });
    
    var tint_color = "transparent";
    var statusmarkers = "";
    var aura1_radius = "";

    if (healthPoints <= (0 - condition) || condition <= CONDITION_DEATH) {
        statusmarkers = DEATH_MARKER;
        tint_color = DEATH_COLOR;
    } else if (healthPoints <= HEALTH_UNCONSCIOUS || magicPoints <= MAGIC_UNCONSCIOUS || condition <= CONDITION_UNCONSCIOUS) {
        statusmarkers = UNCONSCIOUS_MARKER;
        tint_color = UNCONSCIOUS_COLOR;
    } else {
        if (condition >= CONDITION_BONUS) {
            token.set("aura1_color", AURA_COLOR_BONUS_CONDITION);
            aura1_radius = 1;
        } else if (condition == CONDITION_PENALTY) {
            token.set("aura1_color", AURA_COLOR_PENALTY_CONDITION);
            aura1_radius = 1;
        }
        
        if (injured > 0) {
            statusmarkers += (statusmarkers == "" ? "" : ",") + INJURED_MARKER
        }
        if (poisoned > 0) {
            statusmarkers += (statusmarkers == "" ? "" : ",") + POISONED_MARKER
        }
        if (sick > 0) {
            statusmarkers += (statusmarkers == "" ? "" : ",") + SICK_MARKER
        }
        if (exhausted > 0) {
            statusmarkers += (statusmarkers == "" ? "" : ",") + EXHAUSTED_MARKER
        }
        if (muddled > 0) {
            statusmarkers += (statusmarkers == "" ? "" : ",") + MUDDLED_MARKER
        }
        if (shocked > 0) {
            statusmarkers += (statusmarkers == "" ? "" : ",") + SHOCKED_MARKER
        }
    }
    
    token.set("statusmarkers", statusmarkers);
    token.set("aura1_radius", aura1_radius);
    token.set("tint_color", tint_color)
};

on("add:graphic", function(graphic) {
    if (graphic.get("_subtype") === "token") {
        graphic.set("showname", true)
        graphic.set("showplayers_name", true);
        
        var healthAttr = findObjs({
            _type: "attribute",
            _characterid: graphic.get("represents"),
            name: "healthPoints"
        });
        _.each(healthAttr, function(obj) {
            graphic.set("bar1_value", obj.get("current"));
            graphic.set("bar1_max", obj.get("max"));
            graphic.set("bar1_link", obj.get("_id"));
        });
        
        var magicAttr = findObjs({
            _type: "attribute",
            _characterid: graphic.get("represents"),
            name: "magicPoints"
        });
        _.each(magicAttr, function(obj) {    
            graphic.set("bar2_value", obj.get("current"));
            graphic.set("bar2_max", obj.get("max"));
            graphic.set("bar2_link", obj.get("id"));
        });
        
        var conditionAttr = findObjs({
            _type: "attribute",
            _characterid: graphic.get("represents"),
            name: "condition"
        });
        _.each(conditionAttr, function(obj) {    
            graphic.set("bar3_value", obj.get("current"));
            graphic.set("bar3_link", obj.get("id"));
        });
        
        var character = getObj("character", graphic.get("represents"));
        if(character){
            setStatusAttributes(character, graphic);
        }
        
        graphic.set("showplayers_bar1", true);
        graphic.set("showplayers_bar2", true);
        graphic.set("showplayers_bar3", false);
        graphic.set("showplayers_aura1", true);
    }
});

on("add:character", function(character) {
    createObj("attribute", {
        name: "healthPoints",
        current: 8,
        max: 8,
        characterid: character.id
    });
    createObj("attribute", {
        name: "magicPoints",
        current: 8,
        max: 8,
        characterid: character.id
    });
    createObj("attribute", {
        name: "condition",
        current: 5,
        characterid: character.id
    });
    createObj("attribute", {
        name: "injured",
        current: 0,
        characterid: character.id
    });
    createObj("attribute", {
        name: "poisoned",
        current: 0,
        characterid: character.id
    });
    createObj("attribute", {
        name: "sick",
        current: 0,
        characterid: character.id
    });
    createObj("attribute", {
        name: "exhausted",
        current: 0,
        characterid: character.id
    });
    createObj("attribute", {
        name: "muddled",
        current: 0,
        characterid: character.id
    });
    createObj("attribute", {
        name: "shocked",
        current: 0,
        characterid: character.id
    });
});

on("change:attribute", function(attribute, prev) {
    var attributes = ['condition', 'healthPoints', 'healthPoints_max', 'magicPoints', 'magicPoints_max', 'injured', 'poisoned', 'sick', 'exhausted', 'muddled', 'shocked'];
    if (attributes.indexOf(attribute.get('name') > -1)) {
        var tokens = findObjs({ _type: "graphic", _subtype: "token", represents: attribute.get("_characterid") });
        var character = getObj("character", attribute.get("_characterid"));
        if(character){
            _.each(tokens, function(token) {
                setStatusAttributes(character, token);
            });
        }
    }
});

on("change:graphic:bar1_value", function(graphic, prev) {
    if (graphic.get("_subtype") === "token") {
        var attr = findObjs({
            _type: "attribute",
            _characterid: graphic.get("represents"),
            name: "healthPoints"
        });
        _.each(attr, function(obj) {    
            obj.set("current", graphic.get("bar1_value"));
        });
    }
});

on("change:graphic:bar1_max", function(graphic, prev) {
    if (graphic.get("_subtype") === "token") {
        var attr = findObjs({
            _type: "attribute",
            _characterid: graphic.get("represents"),
            name: "healthPoints"
        });
        _.each(attr, function(obj) {    
            obj.set("max", graphic.get("bar1_max"));
        });
    }
});

on("change:graphic:bar2_value", function(graphic, prev) {
    if (graphic.get("_subtype") === "token") {
        var attr = findObjs({
            _type: "attribute",
            _characterid: graphic.get("represents"),
            name: "magicPoints"
        });
        _.each(attr, function(obj) {    
            obj.set("current", graphic.get("bar2_value"));
        });
    }
});

on("change:graphic:bar2_max", function(graphic, prev) {
    if (graphic.get("_subtype") === "token") {
        var attr = findObjs({
            _type: "attribute",
            _characterid: graphic.get("represents"),
            name: "magicPoints"
        });
        _.each(attr, function(obj) {    
            obj.set("max", graphic.get("bar2_max"));
        });
    }
});

on("change:graphic:bar3_value", function(graphic, prev) {
    if (graphic.get("_subtype") === "token") {
        var attr = findObjs({
            _type: "attribute",
            _characterid: graphic.get("represents"),
            name: "condition"
        });
        _.each(attr, function(obj) {    
            obj.set("current", graphic.get("bar3_value"));
        });
    }
});
