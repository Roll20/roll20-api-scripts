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
        const beaconName = type === "current" ? name : `${name}_max`;
        const beaconAttr = await getSheetItem(characterId, beaconName);
        if (beaconAttr !== null && beaconAttr !== undefined) {
            return beaconAttr;
        }
        // Then try for the user attribute
        const userAttr = await getSheetItem(characterId, `user.${beaconName}`);
        if (userAttr !== null && userAttr !== undefined) {
            return userAttr;
        }
        log(`Attribute ${beaconName} not found on character ${characterId}`);
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
        const beaconName = type === "current" ? name : `${name}_max`;
        const beaconAttr = await getSheetItem(characterId, beaconName);
        if (beaconAttr !== null && beaconAttr !== undefined) {
            setSheetItem(characterId, beaconName, value);
            return;
        }
        // Guard against creating user attributes if noCreate is set
        if (options?.noCreate) {
            log(`Attribute ${beaconName} not found on character ${characterId}, and noCreate option is set. Skipping creation.`);
            return;
        }
        // Then default to a user attribute
        setSheetItem(characterId, `user.${beaconName}`, value);
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
        const beaconName = type === "current" ? name : `${name}_max`;
        const beaconAttr = await getSheetItem(characterId, beaconName);
        if (beaconAttr !== null && beaconAttr !== undefined) {
            log(`Cannot delete beacon computed attribute ${name} on character ${characterId}. Setting to undefined instead`);
            setSheetItem(characterId, name, undefined);
            return;
        }
        // Then try for the user attribute
        const userAttr = await getSheetItem(characterId, `user.${beaconName}`);
        if (userAttr !== null && userAttr !== undefined) {
            log(`Deleting user attribute ${name} on character ${characterId}`);
            setSheetItem(characterId, `user.${beaconName}`, undefined);
            return;
        }
        log(`Attribute ${beaconName} not found on character ${characterId}, nothing to delete`);
        return;
    }
    var index = {
        getAttribute,
        setAttribute,
        deleteAttribute,
    };

    return index;

})();
