// libSmartAttributes v0.0.4 by GUD Team | libSmartAttributes provides an interface for managing beacon attributes in a slightly smarter way.
var libSmartAttributes = (function () {
    'use strict';

    async function getAttribute(characterId, name, type = "current") {
        // Try for a legacy attribute or beacon computed
        const attr = await getSheetItem(characterId, name, type);
        if (attr !== null && attr !== undefined) {
            return attr;
        }
        // Then try for the user attribute
        const userAttr = await getSheetItem(characterId, `user.${name}`, type);
        if (userAttr !== null && userAttr !== undefined) {
            return userAttr;
        }
        return undefined;
    }
    async function setAttribute(characterId, name, value, type = "current", options) {
        try {
            await setSheetItem(characterId, name, value, type, {
                allowThrow: true,
                createAttr: options?.noCreate === undefined ? true : !options.noCreate,
                withWorker: options?.setWithWorker === undefined ? true : options.setWithWorker
            });
            return true;
        }
        catch (e) {
            // throw will happen on beacon sheets if the computed doesn't exist or is read-only
            switch (e.type) {
                // for read only computeds, we don't want to make a shadow "user." version.
                case "COMPUTED_READONLY":
                    return false;
            }
        }
        // Then default to a user attribute
        try {
            await setSheetItem(characterId, `user.${name}`, value, type, {
                allowThrow: true,
                createAttr: options?.noCreate === undefined ? true : !options.noCreate,
                withWorker: options?.setWithWorker === undefined ? true : options.setWithWorker
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async function deleteAttribute(characterId, name, type = "current") {
        const character = getObj("character", characterId);
        if (!character) {
            return false;
        }
        if (character?.sheetEnvironment === "legacy" || character?.sheetEnvironment === undefined) {
            const legacyAttr = findObjs({
                _type: "attribute",
                _characterid: characterId,
                name: name,
            })[0];
            if (legacyAttr) {
                legacyAttr.remove();
                return true;
            }
            return false;
        }
        // Beacon computeds cannot be deleted (no change to the computed value).
        const beaconAttr = await getSheetItem(characterId, name, type);
        if (beaconAttr !== null && beaconAttr !== undefined) {
            return false;
        }
        // Then try for the user attribute
        const userAttr = await getSheetItem(characterId, `user.${name}`, type);
        if (userAttr !== null && userAttr !== undefined) {
            try {
                await setSheetItem(characterId, `user.${name}`, undefined, type, {
                    allowThrow: true,
                    createAttr: false
                });
                return true;
            }
            catch {
                return false;
            }
        }
        return false;
    }
    var index = {
        getAttribute,
        setAttribute,
        deleteAttribute,
    };

    return index;

})();
