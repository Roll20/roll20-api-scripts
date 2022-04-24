/*
 * FatePointHelper.js
 * Current version: 1.0
 * Last updated: 2022-04-24 by Tyson Tiatia
 *
 * See README.md for full description
 *
 * Commands:
 *      !fatepointhelper [add|remove|reset|resetall]
 *
 * User Options:
 *      [Use Macros]
 *      [GM Only]
 *      [Players Can Reset]
 *      [Token Marker Name]
 *      [Fate Point Attribute Name]
 *      [Refresh Attribute Name]
 */
var FatePointHelper = FatePointHelper || (function () {
    const version = "1.0";
    const lastUpdate = "2022-04-24";

    /** If true, only players with GM permissions can use commands. */
    const opt_gmOnly = "GM Only";
    /** If true (and GM Only is false), non-gm players will have access to the Reset and Reset All commands. */
    const opt_playersCanReset = "Players Can Reset";
    /** If true, the script macros will be create and maintain macros for itself. */
    const opt_useMacros = "Use Macros";
    /** If not null/blank then the specified marker will be used to indicate the current fate point total on character-linked tokens. If multiple tokens with the same name exist, the first will be used. */
    const opt_tokenMarkerName = "Token Marker Name";
    /** The name of the attribute representing a character's current Fate Point total. */
    const opt_fatePointAttrName = "Fate Point Attribute Name";
    /** The name of the attribute representing a character's Refresh. */
    const opt_refreshAttrName = "Refresh Attribute Name";

    /* Global Config options for the script */
    const userOptions = (globalconfig && globalconfig.FatePointHelper) || {
        "Use Macros": true,
        "GM Only": true,
        "Players Can Reset": false,
        "Token Marker Name": "",
        "Fate Point Attribute Name": "fp",
        "Refresh Attribute Name": "refresh"
    };

    /** Retrieves the metadata for the desired marker. */
    const getMarkerTag = function () {
        var allMarkers = JSON.parse(Campaign().get("token_markers"));
        for (let i = 0; i < allMarkers.length; i++) {
            let marker = allMarkers[i];
            if (marker.name === userOptions[opt_tokenMarkerName]) {
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
        let value = getAttrByName(charId, userOptions[opt_fatePointAttrName]);
        if (value == undefined) return; // Safety clause

        let tokens = findObjs({ type: 'graphic', represents: charId });

        for (let i = 0; i < tokens.length; i++) {
            addOrUpdateMarkerOnToken(markerTag, tokens[i], value);
        }
    };

    /** Modifies the character's Fate Points by the given amount, bounded to the inclusive range of 0-9. */
    const modCharacterFatePoint = function (charId, mod) {
        let attrs = findObjs({ _type: "attribute", _characterid: charId, _name: userOptions[opt_fatePointAttrName] });
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
        let fpAttrs = findObjs({ _type: "attribute", _characterid: charId, _name: userOptions[opt_fatePointAttrName] });
        if (fpAttrs == undefined || fpAttrs.length == 0) {
            log("FatePointHelper: character '" + charId + "' does not have attribute '" + userOptions[opt_fatePointAttrName] + "'.");
            return;
        }

        let refAttrs = findObjs({ _type: "attribute", _characterid: charId, _name: userOptions[opt_refreshAttrName] });
        if (refAttrs == undefined || refAttrs.length == 0) {
            log("FatePointHelper: character '" + charId + "' does not have attribute '" + userOptions[opt_refreshAttrName] + "'.");
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

        sendChat("FatePointHelper", msg);
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

    /** Adds the event listeners for the script */
    const registerListeners = function () {
        on('chat:message', onChatInput);
    };

    /** Creates the macros for the script. */
    const manageMacros = function () {
        var gmId = findObjs({ _type: 'player' })[0].id;

        if (userOptions[opt_useMacros]) {
            var modFatePointUsers = userOptions[opt_gmOnly] ? "" : "all";
            var resetFatePointUsers = (!userOptions[opt_gmOnly] && userOptions[opt_playersCanReset]) ? "all" : "";

            addOrUpdateMacro("Fate+", "!fatepointhelper add", gmId, modFatePointUsers, true);
            addOrUpdateMacro("Fate-", "!fatepointhelper remove", gmId, modFatePointUsers, true);
            addOrUpdateMacro("FateReset", "!fatepointhelper reset", gmId, resetFatePointUsers, true);
            addOrUpdateMacro("FateResetAll", "!fatepointhelper resetall", gmId, resetFatePointUsers, false);
            log("FatePointHelper: Macros added.");
        }
        else {
            removeMacro("Fate+");
            removeMacro("Fate-");
            removeMacro("FateReset");
            removeMacro("FateResetAll");
        }
    };

    /** Reports a failure to retrieve the configured token marker. */
    const sendMarkerTagError = function () {
        log("FatePointHelper: The marker named '" + userOptions[opt_tokenMarkerName] + "' could not be found.");
        let msg = "<table style='width: 100%; border-width: 2px 2px 2px 2px; border-collapse: collapse; border-color: black; border-style: solid; background-color: white; color:red'><tbody><tr style=' background-color: white; border-width: 2px 2px 2px 2px; border-collapse: collapse; border-color: black; border-style: solid'><td style='padding: 2px 5px 2px 5px' colspan='2'><b>Error:</b> Marker named '";
        msg += userOptions[opt_tokenMarkerName];
        msg += "' could not be retrieved. Please check you script settings and token library.</td></tr></tbody></table>";
        sendChat("FatePointHelper", msg);
        return;
    };

    /* Sends message containing user option config. For debugging purposes */
    const sendDebugUserOptions = function () {
        log("debug msg");
        let msg = "<table style='width: 100%; border-width: 2px 2px 2px 2px; border-collapse: collapse; border-color: black; border-style: solid; background-color: white; color:black'><tbody><tr style='background-color: white; border-width: 2px 2px 2px 2px; border-collapse: collapse; border-color: black; border-style: solid'><td style='padding: 2px 5px 2px 5px' colspan='2'>";
        msg += "User Options:<ul>";
        msg += "<li><b>" + opt_useMacros + ":</b> " + userOptions[opt_useMacros] + "</li>";
        msg += "<li><b>" + opt_gmOnly + ":</b> " + userOptions[opt_gmOnly] + "</li>";
        msg += "<li><b>" + opt_playersCanReset + ":</b> " + userOptions[opt_playersCanReset] + "</li>";
        msg += "<li><b>" + opt_tokenMarkerName + ":</b> " + userOptions[opt_tokenMarkerName] + "</li>";
        msg += "<li><b>" + opt_fatePointAttrName + ":</b> " + userOptions[opt_fatePointAttrName] + "</li>";
        msg += "<li><b>" + opt_refreshAttrName + ":</b> " + userOptions[opt_refreshAttrName] + "</li>";
        msg += "</ul></td></tr></tbody></table>";

        sendChat("FatePointHelper", msg);
    };

    /** Event handler for when the fate point attribute is changed. */
    const onUpdateAttribute = function (obj) {
        let markerTag = getMarkerTag();
        let charId = obj.get("_characterid");

        if (parseInt(obj.get("current"), 10) < 0) {
            obj.set("current", 0);
        }

        updateCharacterMarkers(markerTag, charId);
    };

    /** Event handler for chat input. */
    const onChatInput = function (msg) {
        if (msg.type == "api") {
            var args = msg.content.trim().toLowerCase().split(/[ ]+/);

            if (args[0] != "!fatepointhelper" || args.length < 2 || args.length > 3) return;                        // Ignore commands that are not for this script, or which have an invalid arg structure.
            else if ((userOptions[opt_gmOnly] && !playerIsGM(msg.playerid)) ||                                      // Ignore commands by non-gm users while GM Only is enabled
                (args[1].startsWith("reset") && !playerIsGM(msg.playerid) && !userOptions[opt_playersCanReset])) {  // Ignore reset and resetall commands from non-gm users when Players Can Reset is disabled.
                log("FatePointHelper: '" + args[1] + "' command from '" + msg.who + "' ignored due to script config.");
                return;
            }
                        
            if (args[1] == "resetall") {
                resetAllCharacterFatePoints(msg.who);
                log("FatePointHelper: Reset all character fate points command processed.");

                if (userOptions[opt_tokenMarkerName] != "") {
                    updateAllCharsMarkers();
                    log("FatePointHelper: Update all character token markers command processed.");
                }

                return;
            }

            if (msg.selected && msg.selected.length > 0) {
                var tokens = msg.selected.flatMap(function (o) {
                    return o._type == "graphic" ? getObj("graphic", o._id) : [];
                });
                let markerTag = (userOptions[opt_tokenMarkerName] == null || userOptions[opt_tokenMarkerName] == "") ? undefined : getMarkerTag();

                for (var i = 0; i < tokens.length; i++) {
                    var token = tokens[i];
                    var id = token.get("represents");
                    if (id == undefined) continue;

                    switch (args[1]) {
                        case "add":
                            modCharacterFatePoint(id, 1);
                            log("FatePointHelper: Add fate point command processed.");
                            break;
                        case "remove":
                            modCharacterFatePoint(id, -1);
                            log("FatePointHelper: Remove fate point command processed.");
                            break;
                        case "reset":
                            if (!playerIsGM(msg.playerid)) {
                                log("FatePointHelper: Reset command from '" + msg.who + "' blocked.");
                                return;
                            }

                            resetCharacterFatePoints(id);
                            log("FatePointHelper: Reset character fate points command processed.");
                            break;
                    }

                    if (userOptions[opt_tokenMarkerName] != "") {
                        if (markerTag == undefined) {
                            sendMarkerTagError();
                            return;
                        }
                        updateCharacterMarkers(markerTag, id);
                        log("FatePointHelper: Update character token markers command processed.");
                    }
                }
            }
        }
    };

    /** Evenet handler for when the GM changes the active page. */
    const onChangePage = function () {
        updateAllCharsMarkers();
    };

    /** Event handler for when the API server is finished loading the game. */
    const onReady = function () {
        sendDebugUserOptions();

        registerListeners();
        manageMacros();
        if (userOptions[opt_tokenMarkerName] != "") {
            updateAllCharsMarkers();
        }
    };

    return {
        init: onReady,
        updatePage: onChangePage,
        updateAttr: onUpdateAttribute
    };
}());

on("ready", function () {
    FatePointHelper.init();
    log("FatePointHelper: initialisation complete.");
});

on("change:campaign:playerpageid", function () {
    FatePointHelper.updatePage();
    log("FatePointHelper: change:campaign:playerpageid event processed.");
});

on("change:attribute:current", function (obj) {
    if (obj.get("name") == "fp") {
        FatePointHelper.updateAttr(obj);
        log("FatePointHelper: change:attribute event processed.");
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