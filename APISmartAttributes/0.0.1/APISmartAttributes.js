// APISmartAttributes v0.0.1 by GUD Team | APISmartAttributes provides an interface for managing beacon attributes in a slightly smarter way.
var APISmartAttributes = (function () {
    'use strict';

    async function getAttribute(characterId, name, type = "current") {
        // Try for legacy attribute first
        const legacyAttr = findObjs({
            _type: "attribute",
            _characterid: characterId,
            name: name,
        })[0];
        if (legacyAttr) {
            return legacyAttr.get(type);
        }
        // Then try for the beacon computed
        const beaconAttr = await getSheetItem(characterId, name);
        if (beaconAttr !== null && beaconAttr !== undefined) {
            return beaconAttr;
        }
        // Then try for the user attribute
        const userAttr = await getSheetItem(characterId, `user.${name}`);
        if (userAttr !== null && userAttr !== undefined) {
            return userAttr;
        }
        log(`Attribute ${name} not found on character ${characterId}`);
        return undefined;
    }
    async function setAttribute(characterId, name, value, type = "current") {
        // Try for legacy attribute first
        const legacyAttr = findObjs({
            _type: "attribute",
            _characterid: characterId,
            name: name,
        })[0];
        if (legacyAttr) {
            return legacyAttr.set({ [type]: value });
        }
        // Then try for the beacon computed
        const beaconAttr = await getSheetItem(characterId, name);
        if (beaconAttr !== null && beaconAttr !== undefined) {
            return setSheetItem(characterId, name, value);
        }
        // Then default to a user attribute
        return setSheetItem(characterId, `user.${name}`, value);
    }
    var index = {
        getAttribute,
        setAttribute,
    };

    return index;

})();
