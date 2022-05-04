/*
 * ClockTokens.js
 * Current version: 1.2.1
 * Last updated: 2022-04-27 by Tyson Tiatia
 * 
 * See README.md for full description
 * 
 * Commands:
 *      !clocktokens [next|prev|first|last]
 * 
 * User Options:
 *      [GM Only]
 *      [Use Macros]
 */
var ClockTokens = function () {
    const version = "1.2.1";
    const lastUpdate = "2022-04-24";

    let userOptions = {};

    /** Returns a list of GM names */
    const getAllGmPlayerNames = function () {
        var names = [];
        var currentPlayers = findObjs({
            _type: "player",
        });

        for (let i = 0; i < currentPlayers.length; i++) {
            let player = currentPlayers[i];
            if (playerIsGM(player.get("_id"))) {
                names.push(player.get("_id"));
            }
        }

        return names;
    };

    /** Reads the user options from the global config object. */
    const getUserOptions = function () {
        return (globalconfig && globalconfig.clocktokens) || {
            "GM Only": true,
            "Use Macros": true
        };
    };

    /** Prints script info to log */
    const logInstallInfo = function () {
        log("ClockTokens v" + version + " (" + lastUpdate + "):");
        log("    GM Only: " + userOptions["GM Only"]);
        log("    Use Macros: " + userOptions["Use Macros"]);
    };

    /** Adds the event handlers */
    const registerEventHandlers = function () {
        on('chat:message', onChatInput);
    };

    /** Returns a usable string for imagesrc
    * @param {string} imgscr The raw source string */
    const getCleanImagesrc = function (imgsrc) {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if (parts) {
            return parts[1] + 'thumb' + parts[3] + (parts[4] ? parts[4] : Math.round(Math.random() * 9999999));
        }
        return;
    };

    /** Retrieves all data on token sides
    * @param {*} obj the Roll20 graphic object */
    const getSides = function (obj) {
        return obj.get("sides").split("|");
    };

    /** Retrieves the index of the current token side
    * @param {*} obj the Roll20 graphic object
    * @param {array} allSides the array of image data for the token */
    const getCurrentSide = function (obj, allSides) {
        var side = obj.get("currentSide");
        return allSides.indexOf(side);
    };

    /** Changes the token's active side to the specified index
    * @param {*} obj The Roll20 graphic object
    * @param {array} allSides the array of image data for the token
    * @param {int} newIndex the index of the side to change to*/
    const setSide = function (obj, allSides, newIndex) {
        var nextURL = getCleanImagesrc(decodeURIComponent(allSides[newIndex]));
        if (nextURL) {
            obj.set({
                currentSide: allSides[newIndex],
                imgsrc: nextURL
            });
        }
    };

    /** Adds the macros for this script */
    const manageMacros = function () {
        if (userOptions["Use Macros"]) {
            var gmId = findObjs({ _type: 'player' })[0].id;
            var whoCanSee = !userOptions["GM Only"] ? "all" : getAllGmPlayerNames().join(",");
            addMacro("TokenNext", "!clocktokens next", gmId, whoCanSee);
            addMacro("TokenPrev", "!clocktokens prev", gmId, whoCanSee);
            addMacro("TokenFirst", "!clocktokens first", gmId, whoCanSee);
            addMacro("TokenLast", "!clocktokens last", gmId, whoCanSee);
        }
        else {
            removeMacro("TokenNext");
            removeMacro("TokenPrev");
            removeMacro("TokenFirst");
            removeMacro("TokenLast");
        }
    };

    /** Either creates a new macro or updates an existing one to match the specifications
    * @param {string} mName The Name of the macro
    * @param {string} mAction The contents of the macro (what it does when it runs)
    * @param {string} gmId A playereId to be recorded as the creator
    * @param {string} visibleTo Comma-delimited list of players who should be able to see the macro */
    const addMacro = function (mName, mAction, gmId, whoCanSee) {
        var macro = findObjs({ type: "macro", name: mName });
        if (macro.length == 0) {
            createObj("macro", {
                name: mName,
                action: mAction,
                playerid: gmId,
                istokenaction: true,
                visibleto: whoCanSee
            });
        }
        else {
            macro[0].set({
                action: mAction,
                istokenaction: true,
                visibleto: whoCanSee
            });
            if (macro.length > 1) {
                for (var i = 1; i < macro.length; i++) {
                    macro[i].remove();
                }
            }
        }
    };

    /**Deletes the specified macro, if it exists
    * @param {string} mName - The Name of the macro */
    const removeMacro = function (mName) {
        var macro = findObjs({ type: "macro", name: mName });
        if (macro.length > 0) {
            macro.forEach(function (m) {
                m.remove();
            });
        }
    };

    /** Processes input from the user
    * @param {*} msg The Roll20 chat message object */
    const onChatInput = function (msg) {
        if (msg.type == "api") {
            var cmds = msg.content.trim().toLowerCase().split(/[ ]+/);
            if (cmds[0] === "!clocktokens") {
                // Based on user setting, ignore non-GM players' commands
                if (userOptions["GM Only"] && !playerIsGM(msg.playerid) && cmds[0] === "!clocktokens") {
                    log("ClockTokens: Command from " + msg.who + " blocked due to GM-only mode being active");
                    return;
                }

                if (cmds.length !== 2) {
                    sendChat("API", "Error with !clocktokens command.");
                }

                if (msg.selected && msg.selected.length > 0) {
                    var tokens = msg.selected.flatMap(function (o) {
                        return o._type == "graphic" ? getObj("graphic", o._id) : [];
                    });

                    for (let i = 0; i < tokens.length; i++) {
                        let token = tokens[i];
                        var allSides = getSides(token);
                        if (allSides.length <= 1) {
                            // Nothing to change
                            return;
                        }

                        var currentSide = getCurrentSide(token, allSides);
                        switch (cmds[1]) {
                            case "next":
                                if (currentSide < allSides.length + 1) {
                                    setSide(token, allSides, currentSide + 1);
                                }
                                break;
                            case "prev":
                                if (currentSide > 0) {
                                    setSide(token, allSides, currentSide - 1);
                                }
                                break;
                            case "first":
                                setSide(token, allSides, 0);
                                break;
                            case "last":
                                setSide(token, allSides, allSides.length - 1);
                                break;
                        }
                    }
                }
            }
        }
    };

    /** Event handler for Ready event. */
    const onReady = function () {
        userOptions = getUserOptions();
        manageMacros();
        logInstallInfo();
    };

    return {
        init: onReady,
        registerEventHandlers: registerEventHandlers
    };
};

on("ready", function () {
    'use strict';
    var ct = ct || ClockTokens();
    ct.init();
    ct.registerEventHandlers();
});

/* Uncomment these stubs when using a JS validator
    var createObj = function () { };
    var findObjs = function () { };
    var getObj = function () { };
    var globalconfig = {};
    var log = function () {};
    var on = function () { };
    var playerIsGM = function () { };
    var sendChat = function () { };
//*/