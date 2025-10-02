type AttributeType = "current" | "max";

async function getAttribute(characterId: string, name: string, type: AttributeType = "current") {
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
};

type SetOptions = {
  setWithWorker?: boolean;
};

async function setAttribute(characterId: string, name: string, value: unknown, type: AttributeType = "current", options?: SetOptions) {
  // Try for legacy attribute first
  const legacyAttr = findObjs({
    _type: "attribute",
    _characterid: characterId,
    name: name,
  })[0];

  if (legacyAttr && options?.setWithWorker) {
    return legacyAttr.setWithWorker({ [type]: value });
  }

  else if (legacyAttr) {
    return legacyAttr.set({ [type]: value });
  }

  // Then try for the beacon computed
  const beaconAttr = await getSheetItem(characterId, name);
  if (beaconAttr !== null && beaconAttr !== undefined) {
    return setSheetItem(characterId, name, value);
  }

  // Then default to a user attribute
  return setSheetItem(characterId, `user.${name}`, value);
};

async function deleteAttribute(characterId: string, name: string) {
  // Try for legacy attribute first
  const legacyAttr = findObjs({
    _type: "attribute",
    _characterid: characterId,
    name: name,
  })[0];

  if (legacyAttr) {
    return legacyAttr.remove();
  }

  // Then try for the beacon computed
  const beaconAttr = await getSheetItem(characterId, name);
  if (beaconAttr !== null && beaconAttr !== undefined) {
    log(`Cannot delete beacon computed attribute ${name} on character ${characterId}. Setting to undefined instead`);
    return setSheetItem(characterId, name, undefined);
  }
};

export default {
  getAttribute,
  setAttribute,
  deleteAttribute,
};