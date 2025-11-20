// libSmartAttributes v0.0.2 by GUD Team | libSmartAttributes provides an interface for managing beacon attributes in a slightly smarter way.
var libSmartAttributes = (function () {
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
        const beaconAttr = await getSheetItem(characterId, name, type);
        if (beaconAttr !== null && beaconAttr !== undefined) {
            return beaconAttr;
        }
        // Then try for the user attribute
        const userAttr = await getSheetItem(characterId, `user.${name}`, type);
        if (userAttr !== null && userAttr !== undefined) {
            return userAttr;
        }
        log(`Attribute ${name} not found on character ${characterId}`);
        return undefined;
    }
    async function setAttribute(characterId, name, value, type = "current", options) {
        // Try for legacy attribute first
        const legacyAttr = findObjs({
            _type: "attribute",
            _characterid: characterId,
            name: name,
        })[0];
        if (legacyAttr && options?.setWithWorker) {
            legacyAttr.setWithWorker({ [type]: value });
            return;
        }
        else if (legacyAttr) {
            legacyAttr.set({ [type]: value });
            return;
        }
        // Then try for the beacon computed
        const beaconAttr = await getSheetItem(characterId, name, type);
        if (beaconAttr !== null && beaconAttr !== undefined) {
            setSheetItem(characterId, name, value);
            return;
        }
        // Guard against creating user attributes if noCreate is set
        if (options?.noCreate) {
            log(`Attribute ${name} not found on character ${characterId}, and noCreate option is set. Skipping creation.`);
            return;
        }
        // Then default to a user attribute
        setSheetItem(characterId, `user.${name}`, value, type);
        return;
    }
    async function deleteAttribute(characterId, name, type = "current") {
        // Try for legacy attribute first
        const legacyAttr = findObjs({
            _type: "attribute",
            _characterid: characterId,
            name: name,
        })[0];
        if (legacyAttr) {
            legacyAttr.remove();
            return;
        }
        // Then try for the beacon computed
        const beaconAttr = await getSheetItem(characterId, name, type);
        if (beaconAttr !== null && beaconAttr !== undefined) {
            log(`Cannot delete beacon computed attribute ${name} on character ${characterId}. Setting to undefined instead`);
            setSheetItem(characterId, name, undefined, type);
            return;
        }
        // Then try for the user attribute
        const userAttr = await getSheetItem(characterId, `user.${name}`, type);
        if (userAttr !== null && userAttr !== undefined) {
            log(`Deleting user attribute ${name} on character ${characterId}`);
            setSheetItem(characterId, `user.${name}`, undefined, type);
            return;
        }
        log(`Attribute ${type} not found on character ${characterId}, nothing to delete`);
        return;
    }
    var index = {
        getAttribute,
        setAttribute,
        deleteAttribute,
    };

    return index;

})();
