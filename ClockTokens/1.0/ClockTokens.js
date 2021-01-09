/*
 * ClockTokens.js
 * Current version: 1.0
 * Last updated: 2021-01-01 by Tyson Tiatia
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
var ClockTokens = ClockTokens || (function () {
    'use strict';

    var version = "1.0",
        lastUpdate = "2021-01-01",
        listenerActive = false,
        userOptions = (globalconfig && globalconfig.ClockTokens) || {
            "GM Only": true,
            "Use Macros": true
        },

        /** Prints script info to log */
        checkInstall = function () {
            log("ClockTokens v" + version + " installed.");
        },

        /** Prints script user options to log */
        checkOptions = function () {
            log("-GM Only: " + userOptions["GM Only"] + "\n-Use Macros: " + userOptions["Use Macros"]);
        },

        /** Adds the chat event handler */
        registerEventHandlers = function () {
            if (!listenerActive) {
                on('chat:message', handleInput);
                listenerActive = true;
            }
        },

        /** Returns a usable string for imagesrc
         * @param {string} imgscr The raw source string
         */
        getCleanImagesrc = function (imgsrc) {
            var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
            if (parts) {
                return parts[1] + 'thumb' + parts[3] + (parts[4] ? parts[4] : `?${Math.round(Math.random() * 9999999)}`);
            }
            return;
        },

        /** 
         * Processes input from the user
         * @param {*} msg - The Roll20 chat message object/
         */
        handleInput = function (msg) {
            if (msg.type == "api") {
                // Based on user setting, ignore non-GM players' commands
                if (userOptions["GM Only"] && !playerIsGM(msg.playerid)) {
                    log("ClockTokens: Command from " + msg.who + " blocked due to GM-only mode being active");
                    sendChat("player|" + msg.playerid, "/w gm " + "ClockTokens command from " + msg.who + " blocked due to GM-only mode being active", null, { noarchive: true });
                    sendChat("ClockTokens", "/w " + msg.who + " You do not have permission to run commands.", null, { noarchive: true });
                    return;
                }

                var cmds = msg.content.trim().toLowerCase().split(/[ ]+/);
                if (cmds[0] === "!clocktokens") {
                    if (cmds.length !== 2) {
                        sendChat("API", "Error with !clocktokens command.");
                    }
                    if (msg.selected && msg.selected.length > 0) {
                        var tokens = msg.selected.flatMap(function (o) {
                            return o._type == "graphic" ? getObj("graphic", o._id) : [];
                        });

                        tokens.forEach(obj => {
                            var allSides = getSides(obj);
                            if (allSides.length <= 1) {
                                // Nothing to change
                                return;
                            }

                            var currentSide = getCurrentSide(obj, allSides);
                            switch (cmds[1]) {
                                case "next":
                                    if (currentSide < allSides.length + 1) {
                                        setSide(obj, allSides, currentSide + 1);
                                    }
                                    break;
                                case "prev":
                                    if (currentSide > 0) {
                                        setSide(obj, allSides, currentSide - 1);
                                    }
                                    break;
                                case "first":
                                    setSide(obj, allSides, 0);
                                    break;
                                case "last":
                                    setSide(obj, allSides, allSides.length - 1);
                                    break;
                            }
                        });
                    }
                }
            }
        },

        /** 
         * Retrieves all data on token sides
         * @param {*} obj - the Roll20 graphic object
         */
        getSides = function (obj) {
            return obj.get("sides").split("|");
        },

        /** 
         * Retrieves the index of the current token side
         * @param {*} obj - the Roll20 graphic object
         * @param {array} allSides - the array of image data for the token
         */
        getCurrentSide = function (obj, allSides) {
            var side = obj.get("currentSide");
            return allSides.indexOf(side);
        },

        /**
         * Changes the token's active side to the specified index
         * @param {*} obj - The Roll20 graphic object
         * @param {array} allSides - the array of image data for the token
         * @param {int} newIndex - the index of th
         */
        setSide = function (obj, allSides, newIndex) {
            var nextURL = getCleanImagesrc(decodeURIComponent(allSides[newIndex]));
            if (nextURL) {
                obj.set({
                    currentSide: allSides[newIndex],
                    imgsrc: nextURL
                });
            }
        },

        /** Adds the macros for this script */
        manageMacros = function () {
            if (userOptions["Use Macros"]) {
                var gmId = findObjs({ _type: 'player' })[0].id;
                var whoCanSee = !userOptions["GM Only"] ? "all" : "";
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
        },

        /**
         * Either creates a new macro or updates an existing one to match the specifications
         * @param {string} mName - The Name of the macro
         * @param {string} mAction - The contents of the macro (what it does when it runs)
         * @param {string} gmId - A playereId to be recorded as the creator
         * @param {string} visibleTo - Comma-delimited list of players who should be able to see the macro
         */
        addMacro = function (mName, mAction, gmId, whoCanSee) {
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
        },

        /**
         * Deletes the specified macro, if it exists
         * @param {string} mName - The Name of the macro
         */
        removeMacro = function (mName) {
            var macro = findObjs({ type: "macro", name: mName });
            if (macro.length > 0) {
                macro.forEach(function (m) {
                    m.remove();
                });
            }
        };

    return {
        CheckInstall: checkInstall,
        CheckOptions: checkOptions,
        ManageMacros: manageMacros,
        RegisterEventHandlers: registerEventHandlers
    };
}());

on("ready", function () {
    'use strict';
    ClockTokens.CheckInstall();
    ClockTokens.CheckOptions();
    ClockTokens.ManageMacros();
    ClockTokens.RegisterEventHandlers();
});
