// 13th Age Official Character Sheet Companion API Script by Steve K.
// There are 4 !API commands for use in the chat
// "!edie" will add the Escalation Die if there isn't one already in the scene. It will be placed at the top of the turn order. It will continue to count above 6 however it will never add more than a 6 bonus to roll attached to the character sheet. The associated character sheet stat is @{E-DIE} for use in personal macros or @{tracker|Escalation Die} for global macros. Note that the tracker attribute doesn't cap the result at 6 and can return a higher value.
// "!setup" will attempt to set up the bars of every token on the current page that represents a character. A token must already be set to represent a character for "!setup" to work. Bar1 is Temp HP, Bar2 is Recoveries, and Bar3 is HP. Note that the token still needs to be saved once for the HP_max to calculate since it's a disabled attribute.
// "!stag" is on by default. It will automatically add a Staggered or Dead status icon to tokens that represent a character. Using the "!stag" command will toggle the automatic icons on and off.
// "!rec" is on by default. It will automatically tick off a recovery each time to the rollbutton is used. Using the "!rec" command will toggle the automatic recovery tracking on and off.

state.autoStaggered = true;
state.autoRecovery = true;

// Listen for !API commands
on('chat:message', function(msg) {
    if(msg.rolltemplate === 'icon') {
        var numRolls = msg.inlinerolls[4].results.total > 4 ? 4 : msg.inlinerolls[4].results.total,
            heartCount = 0,
            lightCount = 0,
            row = msg.content.substr((msg.content.indexOf('iconrow')+8), 1),
            charNameTemp = msg.content.substr((msg.content.indexOf('charname')+9)),
            charName = charNameTemp.substr(0, charNameTemp.indexOf('}}')),
            charObj = findObjs({type: 'character', name: charName})[0],
            heartObj = findObjs({type: 'attribute', characterid: charObj.id, name: 'icon'+row+'-6'})[0],
            heartCountObj = findObjs({type: 'attribute', characterid: charObj.id, name: 'icon'+row+'-6-count'})[0],
            lightObj = findObjs({type: 'attribute', characterid: charObj.id, name: 'icon'+row+'-5'})[0],
            lightCountObj = findObjs({type: 'attribute', characterid: charObj.id, name: 'icon'+row+'-5-count'})[0];
        for (var i = 0; i < numRolls; i++) {
            var result = msg.inlinerolls[i].results.total;
            heartCount += result === 6 ? 1 : 0;
            lightCount += result === 5 ? 1 : 0;
        }

        if(heartObj) {
            heartObj.set({ current: (heartCount > 0 ? 'on' : '0') });
        }
        else {
            createObj('attribute', {
                characterid: charObj.id,
                name: 'icon'+row+'-6',
                current: (heartCount > 0 ? 'on' : '0')
            });
        }
        if(heartCountObj) {
            heartCountObj.set({ current: heartCount });
        }
        else {
            createObj('attribute', {
                characterid: charObj.id,
                name: 'icon'+row+'-6-count',
                current: heartCount
            });
        }

        if(lightObj) {
            lightObj.set({ current: (lightCount > 0 ? 'on' : '0') });
        }
        else {
            createObj('attribute', {
                characterid: charObj.id,
                name: 'icon'+row+'-5',
                current: (lightCount > 0 ? 'on' : '0')
            });
        }
        if(lightCountObj) {
            lightCountObj.set({ current: lightCount });
        }
        else {
            createObj('attribute', {
                characterid: charObj.id,
                name: 'icon'+row+'-5-count',
                current: lightCount
            });
        }
    }
    if(msg.type === 'api') {
        // Check for "!edie" command to add the Escalation Die
        if(msg.content.indexOf('edie') !== -1) {
            addEscalationDie();
        }
        // Check for "!setup" command to set up a token
        if(msg.content.indexOf('setup') !== -1) {
            setUpToken();
        }
        // Check for "!stag command to turn on or off the automatic staggering icon on tokens
        if(msg.content.indexOf('stag') !== -1) {
            state.autoStaggered = state.autoStaggered === true ? false : true;
            log("autoStaggered is " + state.autoStaggered);
        }
        // Check for "!rec command to turn on or off the automatic recovery tracking on characters
        if(msg.content.indexOf('rec') !== -1) {
            state.autoRecovery = state.autoRecovery === true ? false : true;
            log("autoRecovery is " + state.autoRecovery);
        }
    };
    // Automatic Recovery Tracking
    if(msg.rolltemplate === "rec" && state.autoRecovery === true) {
        var cname = msg.content.match(/{{name=([^}]*)}/)[1];
        var character = findObjs({_type: "character", name: cname})[0];
        var rec = findObjs({_type: "attribute", _characterid: character.id, name: "REC"})[0];
        var current = rec.get("current");
        if(current > 0) {
            rec.set("current", current - 1);
        };
    };
});

// Automatically add STAGGERED and DEAD status icons to tokens when the character takes damage
on('change:attribute', function(attr) {
    if(state.autoStaggered === false) {return;}
    if(attr.get("name") === "HP") {
        var staggered
        var currenthp = attr.get("current");
        var charid = attr.get("_characterid");
        var charname = getObj("character", charid).get("name");
        var charTokens = findObjs({                              
            _pageid: Campaign().get("playerpageid"),                              
            _type: "graphic",
            _subtype: "token",
            represents: charid
        });
        if(charTokens.length < 1) {return;}
        //Find the character's staggered HP
        sendChat("","/roll @{" + charname + "|HP-staggered}", function(s) {
            staggered = JSON.parse(s[0].content).total;
            //Compare that with the current HP
            if(currenthp <= staggered) {
                // Turn on the staggered icon if we're staggered
                _.each(charTokens, function(t) {    
                    // Unless we're dead
                    if(currenthp < 1) {
                        if(!t.get("status_skull")){
                            t.set("status_skull", true);
                        };
                        if(t.get("status_back-pain")){
                            t.set("status_back-pain", false);
                        };
                    }
                    else if(!t.get("status_back-pain")){
                        t.set("status_back-pain", true);
                        if(t.get("status_skull")){
                            t.set("status_skull", false);
                        };
                    };
                });
            }
            else {
                // Turn the staggered icon off if we're not
                _.each(charTokens, function(t) {    
                    if(t.get("status_back-pain")){
                        t.set("status_back-pain", false);
                    };
                    if(t.get("status_skull")){
                        t.set("status_skull", false);
                    };
                });
            }
        });
    }
});

// Add escalation die if it's not already in the tracker
var addEscalationDie = function() {
    //Open Tracker if not open
    if(Campaign().get('initiativepage') === false) {
        Campaign().set('initiativepage', true);
    };
    //Get current turn order
    var currentTurnOrder;
    try {
        if(Campaign().get("turnorder") === "" || Campaign().get("turnorder") === "[]") {
            currentTurnOrder = [];
        }
        else {
            currentTurnOrder = JSON.parse(Campaign().get("turnorder"));
        }
    }
    catch(e) {
        log("ERROR parsing turn tracker");
        log(e+"");
        return;
    }
    //Check for Escalation Die
    eDieCheck = _.some(currentTurnOrder, function(init) {
        return init.custom === "Escalation Die";
    });
    //Add the Escalation Die if it's not there
    if(!eDieCheck) {
        //Add die to the top of the turn order
        currentTurnOrder.unshift({"id":"-1","pr":"0","custom":"Escalation Die","formula":"1"})
        //Save the turn order.
        Campaign().set({
            turnorder: JSON.stringify(currentTurnOrder)
        });
        log("Added Escalation Die");
    }
    else {
        log("Escalation Die already in tracker");
    }
};

// Set up a token's bars to use attributes from a character it represents
var setUpToken = function() {
    //Find tokens on the current page
    var tokens = findObjs({
        _pageid: Campaign().get("playerpageid"),
        _type: "graphic",
        _subtype: "token"
    });
    //If there are any tokens try and set them up
    if(tokens.length > 0) {
        //Check to see if token represents a character
        _.each(tokens, function(token) {
            if(token.get("represents")) {
                //Check to see if token needs to be set up and update
                var char_id = token.get("represents");
                var b1 = token.get("bar1_link");
                var b2 = token.get("bar2_link");
                var b3 = token.get("bar3_link");
                if(!b1 || getObj("attribute", b1).get("name") !== "HP-temp") {
                    b1 = findObjs({_characterid: token.get("represents"), name: "HP-temp"})[0];
                    if(!b1) {
                        createObj("attribute", {
                            name: "HP-temp",
                            current: 0,
                            characterid: token.get("represents")
                        });
                        b1 = findObjs({_characterid: token.get("represents"), name: "HP-temp"})[0];
                    };
                    token.set({bar1_link: b1.get("_id"), bar1_value: b1.get("current"), bar1_max: b1.get("max")});
                    log("Updating '" + token.get("name") + "' Bar1");
                };
                if(!b2 || getObj("attribute", b2).get("name") !== "REC") {
                    b2 = findObjs({_characterid: token.get("represents"), name: "REC"})[0];
                    if(!b2) {
                        createObj("attribute", {
                            name: "REC",
                            current: 8,
                            characterid: token.get("represents")
                        });
                        b2 = findObjs({_characterid: token.get("represents"), name: "REC"})[0];
                    };
                    token.set({bar2_link: b2.get("_id"), bar2_value: b2.get("current"), bar2_max: b2.get("max")});
                    log("Updating '" + token.get("name") + "' Bar2");
                };
                if(!b3 || getObj("attribute", b3).get("name") !== "HP") {
                    b3 = findObjs({_characterid: token.get("represents"), name: "HP"})[0];
                    if(!b3) {
                        createObj("attribute", {
                            name: "HP",
                            current: 0,
                            characterid: token.get("represents")
                        });
                        b3 = findObjs({_characterid: token.get("represents"), name: "HP"})[0];
                    };
                    token.set({bar3_link: b3.get("_id"), bar3_value: b3.get("current"), bar3_max: b3.get("max")});
                    log("Updating '" + token.get("name") + "' Bar3");
                };
            }
            else {
                log("Token '" + token.get("name") + "' doesn't represent a character with a character sheet.");
            }
        });
    }
    else{
        log("No tokens on this page.");
    }
};
