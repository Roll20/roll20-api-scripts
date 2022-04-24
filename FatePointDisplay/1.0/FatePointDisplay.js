/*
 * FatePointDisplay.js
 * Current version: 1.0
 * Last updated: 2022-04-24 by Tyson Tiatia
 *
 * See README.md for full description
 *
 * Commands:
 *      !fatepointdisplay [add|remove|reset|resetall|update]
 *
 * User Options:
 *      [Use Macros]
 *      [GM Only]
 *      [Players Can Reset]
 *      [Token Marker Name]
 *      [Fate Point Attribute Name]
 *      [Refresh Attribute Name]
 *      [Disable Marker Display Attribute Name]
 *      [Enable Marker Display Attribute Name]
 */

var FatePointDisplayConfig = FatePointDisplayConfig || (function () {
    /* Global Config options for the script */
    const userOptions = (globalconfig && globalconfig.FatePointDisplay) || {
        "Use Macros": true,
        "GM Only": true,
        "Players Can Reset": false,
        "Token Marker Name": "",
        "Fate Point Attribute Name": "fp",
        "Refresh Attribute Name": "refresh",
        "Disable Marker Display Attribute Name": "",
        "Enable Marker Display Attribute Name": "",
    };

    return {
        /** If true, only players with GM permissions can use commands. */
        gmOnly: userOptions["GM Only"],
        /** If true (and GM Only is false), non-gm players will have access to the Reset and Reset All commands. */
        playersCanReset: userOptions["Players Can Reset"],
        /** If true, the script macros will be create and maintain macros for itself. */
        useMacros: userOptions["Use Macros"],
        /** If not null/blank then the specified marker will be used to indicate the current fate point total on character-linked tokens. If multiple tokens with the same name exist, the first will be used. */
        tokenMarkerName: userOptions["Token Marker Name"],
        /** The name of the attribute representing a character's current Fate Point total. */
        fatePointAttrName: userOptions["Fate Point Attribute Name"],
        /** The name of the attribute representing a character's Refresh. */
        refreshAttrName: userOptions["Refresh Attribute Name"],
        /** The name of the attribute which, if set to 1, will add the Character to the auto-update blacklist. */
        blackListAttrName: userOptions["Disable Marker Display Attribute Name"],
        /** The name of the attribute which, if set to 1, will add the Character to the auto-update whitelist. */
        whiteListAttrName: userOptions["Enable Marker Display Attribute Name"],
    };
}());

var FatePointDisplay = FatePointDisplay || (function (config) {
    const version = "1.0";
    const lastUpdate = "2022-04-24";

    /** Retrieves the metadata for the desired marker. */
    const getMarkerTag = function () {
        var allMarkers = JSON.parse(Campaign().get("token_markers"));
        for (let i = 0; i < allMarkers.length; i++) {
            let marker = allMarkers[i];
            if (marker.name === config.tokenMarkerName) {
                return marker.tag;
            }
        }

        return undefined;
    };

    /** Updates a token's marker list with the specified value. */
    const addOrUpdateMarkerOnToken = function (tag, token, value) {
        let markers = token.get("statusmarkers").split(',');
        let exists = false;

        for (let i = 0; !exists && i < markers.length; i++) {
            if (markers[i].startsWith(tag)) {
                markers[i] = tag + "@" + value;
                exists = true;
            }
        }

        if (!exists) {
            markers.push(tag + "@" + value);
        }

        token.set("statusmarkers", markers.join(","));
    };

    /** Updates a token's marker list with the specified value. */
    const removeMarkerOnToken = function (tag, token) {
        let markersList = token.get("statusmarkers");
        if (!markersList.includes(tag)) return;

        let markers = markersList.split(',');
        let newMarkers = [];

        for (let i = 0; i < markers.length; i++) {
            if (!markers[i].startsWith(tag)) {
                newMarkers.push(markers[i]);
            }
        }

        token.set("statusmarkers", newMarkers.join(","));
    };


    /** Updates the token marker on all character tokens. */
    const updateAllCharsMarkers = function () {
        let markerTag = getMarkerTag();
        if (markerTag == undefined) {
            sendMarkerTagError();
            return;
        }

        let chars = findObjs({ _type: "character" });

        for (var i = 0; i < chars.length; i++) {
            updateCharacterMarkers(markerTag, chars[i].get("_id"));
        }
    };

    /** Updates the token marker on all of a given character's tokens. */
    const updateCharacterMarkers = function (markerTag, charId) {
        let value = getAttrByName(charId, config.fatePointAttrName);
        if (value == undefined) return;

        let removeTokens = false;

        // If the blacklist is enabled in config, check if the current character is flagged.
        if (config.blackListAttrName != undefined && config.blackListAttrName != "") {
            let blackListAttrs = findObjs({ _type: "attribute", _characterid: charId, name: config.blackListAttrName });
            removeTokens = blackListAttrs != undefined && blackListAttrs.length > 0 && blackListAttrs[0].get("current") == "1";
            if (removeTokens) log("Update called on blacklisted char");
        }

        // If the whitelist is enabled in config, check if the current character is flagged.
        if (config.whiteListAttrName != undefined && config.whiteListAttrName != "") {
            let whiteListAttrs = findObjs({ _type: "attribute", _characterid: charId, name: config.whiteListAttrName });
            removeTokens = whiteListAttrs == undefined || whiteListAttrs.length == 0 || whiteListAttrs[0].get("current") != "1";
            if (removeTokens) log("Update called on non-whitelisted char");
        }

        let tokens = findObjs({ type: 'graphic', represents: charId });
        for (let i = 0; i < tokens.length; i++) {
            if (removeTokens) {
                log("remove called.");
                removeMarkerOnToken(markerTag, tokens[i]);
            }
            else {
                log("Add/update called.");
                addOrUpdateMarkerOnToken(markerTag, tokens[i], value);
            }
        }
    };

    /** Modifies the character's Fate Points by the given amount, bounded to the inclusive range of 0-9. */
    const modCharacterFatePoint = function (charId, mod) {
        let attrs = findObjs({ _type: "attribute", _characterid: charId, _name: config.fatePointAttrName });
        if (attrs == undefined || attrs.length == 0) return;

        let attr = attrs[0];
        var current = parseInt(attr.get("current"), 10);

        var newVal = current + mod;
        if (newVal >= 9) newVal = 9;
        else if (newVal <= 0) newVal = 0;

        attr.set("current", newVal);
    };

    /** Resets a character's fate point totals based on refresh. */
    const resetCharacterFatePoints = function (charId) {
        let fpAttrs = findObjs({ _type: "attribute", _characterid: charId, _name: config.fatePointAttrName });
        if (fpAttrs == undefined || fpAttrs.length == 0) {
            log("FatePointDisplay: character '" + charId + "' does not have attribute '" + config.fatePointAttrName + "'.");
            return;
        }

        let refAttrs = findObjs({ _type: "attribute", _characterid: charId, _name: config.refreshAttrName });
        if (refAttrs == undefined || refAttrs.length == 0) {
            log("FatePointDisplay: character '" + charId + "' does not have attribute '" + config.refreshAttrName + "'.");
            return;
        }

        let fpAttr = fpAttrs[0];
        let refAttr = refAttrs[0];

        var current = parseInt(fpAttr.get("current"), 10);
        var refresh = parseInt(refAttr.get("current"), 10);
        if (current >= refresh) return;

        fpAttr.set("current", refresh);
    };

    /** Resets all character's fate point totals based on refresh */
    const resetAllCharacterFatePoints = function (senderName) {
        let chars = findObjs({ _type: "character" });

        for (var i = 0; i < chars.length; i++) {
            resetCharacterFatePoints(chars[i].get("_id"));
        }

        let msg = "<table style='width: 100%; border-width: 2px 2px 2px 2px; color: black; border-collapse: collapse; border-color: black; border-style: solid; background-color: white'><tbody><tr style='text-align: center; background-color: white; border-width: 2px 2px 2px 2px; border-collapse: collapse; border-color: black; border-style: solid'><td style='padding: 2px 5px 2px 5px' colspan='2'>";
        msg += senderName;
        msg += " has reset Fate Points.</td></tr></tbody></table>";

        sendChat("FatePointDisplay", msg);
    };

    /**
    * Either creates a new macro or updates an existing one to match the specifications
    * @param {string} mName - The Name of the macro
    * @param {string} mAction - The contents of the macro (what it does when it runs)
    * @param {string} creatorId - A playereId to be recorded as the creator
    * @param {string} visibleTo - Comma-delimited list of players who should be able to see the macro
    * @param {string} isToken - If true sets the macro as a token macro
    */
    const addOrUpdateMacro = function (mName, mAction, creatorId, whoCanSee, isToken) {
        var macro = findObjs({ type: "macro", name: mName });
        if (macro.length == 0) {
            createObj("macro", {
                name: mName,
                action: mAction,
                playerid: creatorId,
                istokenaction: isToken,
                visibleto: whoCanSee
            });
        }
        else {
            macro[0].set({
                action: mAction,
                istokenaction: isToken,
                visibleto: whoCanSee
            });
            if (macro.length > 1) {
                for (var i = 1; i < macro.length; i++) {
                    macro[i].remove();
                }
            }
        }
    };

    /**
    * Deletes the specified macro, if it exists
    * @param {string} mName - The Name of the macro
    */
    const removeMacro = function (mName) {
        var macro = findObjs({ type: "macro", name: mName });
        if (macro.length > 0) {
            macro.forEach(function (m) {
                m.remove();
            });
        }
    };

    /** Creates the macros for the script. */
    const manageMacros = function () {
        var gmId = findObjs({ _type: 'player' })[0].id;

        if (config.useMacros) {
            var modFatePointUsers = config.gmOnly ? "" : "all";
            var resetFatePointUsers = (!config.gmOnly && config.playersCanReset) ? "all" : "";

            addOrUpdateMacro("Fate+", "!fatepointdisplay add", gmId, modFatePointUsers, true);
            addOrUpdateMacro("Fate-", "!fatepointdisplay remove", gmId, modFatePointUsers, true);
            addOrUpdateMacro("FateReset", "!fatepointdisplay reset", gmId, resetFatePointUsers, true);
            addOrUpdateMacro("FateResetAll", "!fatepointdisplay resetall", gmId, resetFatePointUsers, false);
            addOrUpdateMacro("FateUpdateAll", "!fatepointdisplay update", gmId, "", false);
            log("FatePointDisplay: macros added.");
        }
        else {
            removeMacro("Fate+");
            removeMacro("Fate-");
            removeMacro("FateReset");
            removeMacro("FateResetAll");
            removeMacro("FateUpdateAll");
        }
    };

    /** Reports a failure to retrieve the configured token marker. */
    const sendMarkerTagError = function () {
        log("FatePointDisplay: The marker named '" + config.tokenMarkerName + "' could not be found.");
        let msg = "<table style='width: 100%; border-width: 2px 2px 2px 2px; border-collapse: collapse; border-color: black; border-style: solid; background-color: white; color:red'><tbody><tr style=' background-color: white; border-width: 2px 2px 2px 2px; border-collapse: collapse; border-color: black; border-style: solid'><td style='padding: 2px 5px 2px 5px' colspan='2'><b>Error:</b> Marker named '";
        msg += config.tokenMarkerName;
        msg += "' could not be retrieved. Please check you script settings and token library.</td></tr></tbody></table>";
        sendChat("FatePointDisplay", msg);
        return;
    };

    /* Sends message containing user option config. For debugging purposes. */
    const sendDebugUserOptions = function () {
        log("debug msg");
        let msg = "<table style='width: 100%; border-width: 2px 2px 2px 2px; border-collapse: collapse; border-color: black; border-style: solid; background-color: white; color:black'><tbody><tr style='background-color: white; border-width: 2px 2px 2px 2px; border-collapse: collapse; border-color: black; border-style: solid'><td style='padding: 2px 5px 2px 5px' colspan='2'>";
        msg += "User Options:<ul>";
        msg += "<li><b>Use Macros:</b> " + config.useMacros + "</li>";
        msg += "<li><b>GM Only:</b> " + config.gmOnly + "</li>";
        msg += "<li><b>Players Can Reset:</b> " + config.playersCanReset + "</li>";
        msg += "<li><b>Token Marker Name:</b> " + config.tokenMarkerName + "</li>";
        msg += "<li><b>Fate Point Attribute name:</b> " + config.fatePointAttrName + "</li>";
        msg += "<li><b>Refresh Attribute Name:</b> " + config.refreshAttrName + "</li>";
        msg += "<li><b>Disable Marker Display Attribute Name:</b> " + config.blackListAttrName + "</li>";
        msg += "<li><b>Enable Marker Display Attribute Name:</b> " + config.whiteListAttrName + "</li>";
        msg += "</ul></td></tr></tbody></table>";

        sendChat("FatePointDisplay", msg);
    };

    /** Event handler for when the fate point attribute is changed on a character. */
    const onUpdateFPAttribute = function (obj) {
        let charId = obj.get("_characterid");

        // Keep fate point count >= 0 and <= 9
        if (parseInt(obj.get("current"), 10) < 0) {
            obj.set("current", 0);
        }
        else if (parseInt(obj.get("current"), 10) > 9) {
            obj.set("current", 9);
        }

        if (config.tokenMarkerName != "") {
            let markerTag = getMarkerTag();
            if (markerTag == undefined) {
                sendMarkerTagError();
                return;
            }
            updateCharacterMarkers(markerTag, charId);
        }

        log("FatePointDisplay: change:attribute:" + config.fatePointAttrName + " event processed.");
    };

    /** Event handler for when the blacklist or whitelist flag is changed on a character. */
    const onUpdateFlagAttribute = function (obj) {
        let charId = obj.get("_characterid");
        if (config.tokenMarkerName != "") {
            let markerTag = getMarkerTag();
            if (markerTag == undefined) {
                sendMarkerTagError();
                return;
            }
            updateCharacterMarkers(markerTag, charId);
        }

        log("FatePointDisplay: change:attribute:" + obj.get("name") + " event processed.");
    };

    /** Event handler for chat input. */
    const onChatInput = function (msg) {
        if (!config.useMacros) return;

        if (msg.type == "api") {
            var args = msg.content.trim().toLowerCase().split(/[ ]+/);

            if (args[0] != "!fatepointdisplay" || args.length < 2 || args.length > 3) return;                        // Ignore commands that are not for this script, or which have an invalid arg structure.
            else if ((config.gmOnly && !playerIsGM(msg.playerid)) ||                                      // Ignore commands by non-gm users while GM Only is enabled
                (args[1].startsWith("reset") && !playerIsGM(msg.playerid) && !config.playersCanReset)) {  // Ignore reset and resetall commands from non-gm users when Players Can Reset is disabled.
                log("FatePointDisplay: '" + args[1] + "' command from '" + msg.who + "' ignored due to script config.");
                return;
            }
                        
            if (args[1] == "resetall") {
                resetAllCharacterFatePoints(msg.who);
                log("FatePointDisplay: Reset all character fate points command processed.");

                if (config.tokenMarkerName != "") {
                    updateAllCharsMarkers();
                    log("FatePointDisplay: Update all character token markers command processed.");
                }

                return;
            }
            else if (args[1] == "update") {
                updateAllCharsMarkers();
                log("FatePointDisplay: Update all character token markers command processed.");
            }
            else if (msg.selected && msg.selected.length > 0) {
                var tokens = msg.selected.flatMap(function (o) {
                    return o._type == "graphic" ? getObj("graphic", o._id) : [];
                });
                let markerTag = (config.tokenMarkerName == undefined || config.tokenMarkerName == "") ? undefined : getMarkerTag();

                for (var i = 0; i < tokens.length; i++) {
                    var token = tokens[i];
                    var id = token.get("represents");
                    if (id == undefined) continue;

                    switch (args[1]) {
                        case "add":
                            modCharacterFatePoint(id, 1);
                            log("FatePointDisplay: Add fate point command processed.");
                            break;
                        case "remove":
                            modCharacterFatePoint(id, -1);
                            log("FatePointDisplay: Remove fate point command processed.");
                            break;
                        case "reset":
                            if (!playerIsGM(msg.playerid)) {
                                log("FatePointDisplay: Reset command from '" + msg.who + "' blocked.");
                                return;
                            }

                            resetCharacterFatePoints(id);
                            log("FatePointDisplay: Reset character fate points command processed.");
                            break;
                    }

                    if (config.tokenMarkerName != "") {
                        if (markerTag == undefined) {
                            sendMarkerTagError();
                            return;
                        }
                        updateCharacterMarkers(markerTag, id);
                        log("FatePointDisplay: Update character token markers command processed.");
                    }
                }
            }
        }
    };

    /** Evenet handler for when the GM changes the active page. */
    const onChangePage = function () {
        updateAllCharsMarkers();
        log("FatePointDisplay: change:campaign:playerpageid event processed.");
    };

    /** Event handler for when the API server is finished loading the game. */
    const onReady = function () {
        sendDebugUserOptions();
        manageMacros();
        if (config.tokenMarkerName != "") {
            updateAllCharsMarkers();
        }
        log("FatePointDisplay: initialisation complete.");

    };

    return {
        init: onReady,
        chatInput: onChatInput,
        updatePage: onChangePage,
        updateFatePoints: onUpdateFPAttribute,
        updateFlags: onUpdateFlagAttribute
    };
}(FatePointDisplayConfig));

// Register event handlers
on("ready", FatePointDisplay.init);
on('chat:message', FatePointDisplay.chatInput);
on("change:campaign:playerpageid", FatePointDisplay.updatePage);
on("change:attribute:current", function (obj) {
    let name = obj.get("name");
    switch (name) {
        case FatePointDisplayConfig.fatePointAttrName:
            FatePointDisplay.updateAttr(obj);
            break;
        case FatePointDisplayConfig.blackListAttrName:
        case FatePointDisplayConfig.whiteListAttrName:
            FatePointDisplay.updateFlags(obj);
    }
});

/* Uncomment these stubs when using a JS validator
    var Campaign = {};
    var createObj = function () { };
    var findObjs = function () { };
    var getAttrByName = function () { };
    var getObj = function () { };
    var globalconfig = {};
    var log = function () {};
    var on = function () { };
    var playerIsGM = function () { };
    var sendChat = function () { };
//*/