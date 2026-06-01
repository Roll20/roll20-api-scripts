import { mockFindObjs, mockGetAttrByName } from "./apiObjects.mock";

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

export function resetBeaconAttributes(): void {
  for (const characterId of Object.keys(beaconAttributes)) {
    delete beaconAttributes[characterId];
  }
};

function readLegacyAttribute(
  characterId: string,
  attributeName: string,
  type: "current" | "max",
): string | undefined {
  const legacyValue = mockGetAttrByName(characterId, attributeName, type);
  if (legacyValue === undefined || legacyValue === null) {
    return undefined;
  }
  return `${legacyValue}`;
};

function writeLegacyAttribute(
  characterId: string,
  attributeName: string,
  value: string,
  type: "current" | "max",
): boolean {
  const legacyAttrs = mockFindObjs({
    _type: "attribute",
    _characterid: characterId,
    name: attributeName,
  });
  const legacyAttr = legacyAttrs[0];
  if (!legacyAttr) {
    return false;
  }
  legacyAttr.set({ [type]: value });
  return true;
};

export async function getSheetItem(
  characterId: string,
  attributeName: string,
  type: "current" | "max" = "current",
) {
  const character = beaconAttributes[characterId];
  const attribute = character?.[attributeName];
  if (attribute && attribute[type] !== "") {
    return attribute[type];
  }

  return readLegacyAttribute(characterId, attributeName, type);
};

type SetSheetItemOptions = {
  allowThrow?: boolean;
};

export async function setSheetItem(
  characterId: string,
  attributeName: string,
  value: string,
  type: "current" | "max" = "current",
  options?: SetSheetItemOptions,
): Promise<boolean> {
  const hasLegacy = mockFindObjs({
    _type: "attribute",
    _characterid: characterId,
    name: attributeName,
  }).length > 0;
  const hasBeaconEntry = Boolean(beaconAttributes[characterId]?.[attributeName]);
  const isUserAttribute = attributeName.startsWith("user.");

  if (options?.allowThrow && !hasLegacy && !hasBeaconEntry && !isUserAttribute) {
    throw new Error(`Sheet item ${attributeName} not found on character ${characterId}`);
  }

  if (!beaconAttributes[characterId]) {
    beaconAttributes[characterId] = {};
  }
  if (!beaconAttributes[characterId][attributeName]) {
    beaconAttributes[characterId][attributeName] = { current: "", max: "" };
  }
  beaconAttributes[characterId][attributeName][type] = value;

  writeLegacyAttribute(characterId, attributeName, value, type);
  return true;
};

export function getBeaconAttributeNames(characterId: string): string[] {
  const character = beaconAttributes[characterId];
  if (!character) {
    return [];
  }
  return Object.keys(character);
};
