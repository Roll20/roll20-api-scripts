type MockBeaconAttribute = {
  current: string;
  max: string;
};

type MockCharacterList = {
  [characterId: string]: {
    [attributeName: string]: MockBeaconAttribute;
  };
};

export const beaconAttributes: MockCharacterList = {
};

export async function getSheetItem(
  characterId: string,
  attributeName: string,
  type: "current" | "max" = "current"
) {
  const character = beaconAttributes[characterId];
  if (!character) {
    return undefined;
  }
  const attribute = character[attributeName];
  if (!attribute) {
    return undefined;
  }
  console.log("Getting attribute", attributeName, "on character", characterId, "with type", type);
  return attribute[type];
};

export async function setSheetItem(
  characterId: string,
  attributeName: string,
  value: string,
  type: "current" | "max" = "current",
): Promise<boolean> {
  const character = beaconAttributes[characterId];
  if (!character) {
    beaconAttributes[characterId] = {};
  }
  const attribute = beaconAttributes[characterId][attributeName];
  if (!attribute) {
    beaconAttributes[characterId][attributeName] = { current: "", max: "" };
  }
  beaconAttributes[characterId][attributeName][type] = value;
  return true;
};

export function getBeaconAttributeNames(characterId: string): string[] {
  const character = beaconAttributes[characterId];
  if (!character) {
    return [];
  }
  return Object.keys(character);
};
