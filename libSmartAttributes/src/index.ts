type AttributeType = "current" | "max" ;

async function getAttribute(
  characterId: string,
  name: string,
  type: AttributeType = "current"
) {
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

  log(`Attribute ${name} not found on character ${characterId}`);
  return undefined;
};

type SetOptions = {
  setWithWorker?: boolean;
  noCreate?: boolean;
};

type SheetItemError = Error & {
  type: string;
  details?: Record<string, unknown>;
};


async function setAttribute(
  characterId: string,
  name: string,
  value: unknown,
  type: AttributeType = "current",
  options?: SetOptions
) {

  try {
    await setSheetItem(characterId, name, value, type, {
      allowThrow: true,
      createAttr: options?.noCreate === undefined ? true : !options.noCreate,
      withWorker: options?.setWithWorker === undefined ? true : options.setWithWorker
    });
    return;
  } catch (e) {
    // throw will happen on beacon sheets if the computed doesn't exist or is read-only
    switch((e as SheetItemError).type){
      // for read only computeds, we don't want to make a shadow "user." version.
      case "COMPUTED_READONLY":
        return;
    }
  }

  // Then default to a user attribute
  setSheetItem(characterId, `user.${name}`, value, type, {
    allowThrow: false,
    createAttr: options?.noCreate === undefined ? true : !options.noCreate,
    withWorker: options?.setWithWorker === undefined ? true : options.setWithWorker
  });
  return;
};

async function deleteAttribute(characterId: string, name: string, type: AttributeType = "current") {
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
};

export default {
  getAttribute,
  setAttribute,
  deleteAttribute,
};
