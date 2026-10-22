import type { Attribute } from "../types";

export type RepeatingParts = {
  section: string;
  identifier: string;
  field: string;
};

export function extractRepeatingParts(
  attributeName: string
): RepeatingParts | null {
  const [repeating, section, identifier, ...fieldParts] = attributeName.split("_");
  if (repeating !== "repeating") {
    return null;
  }
  const field = fieldParts.join("_");
  if (!section || !identifier || !field) {
    return null;
  }
  return {
    section,
    identifier,
    field
  };
};

export function combineRepeatingParts(
  parts: RepeatingParts
): string {
  if (!parts.section || !parts.identifier || !parts.field) {
    throw new Error("[CHATSETATTR] combineRepeatingParts: All parts (section, identifier, field) must be non-empty strings.");
  }
  return `repeating_${parts.section}_${parts.identifier}_${parts.field}`;
};

export function isRepeatingAttribute(
  attributeName: string
): boolean {
  const parts = extractRepeatingParts(attributeName);
  return parts !== null;
};

export function hasCreateIdentifier(
  attributeName: string
): boolean {
  const parts = extractRepeatingParts(attributeName);
  if (parts) {
    const hasIndentifier = parts.identifier.toLowerCase().includes("create");
    return hasIndentifier;
  }
  const hasIndentifier = attributeName.toLowerCase().includes("create");
  return hasIndentifier;
};

export function hasIndexIdentifier(
  attributeName: string
): boolean {
  const parts = extractRepeatingParts(attributeName);
  if (!parts) return false;
  const hasIndentifier = parts.identifier.match(/^\$(\d+)$/i) !== null;
  return hasIndentifier;
};

export function convertRepOrderToArray(
  repOrder: string
): string[] {
  return repOrder.split(",").map(id => id.trim());
};

export function getIDFromIndex(
  attributeName: string,
  repOrder: string[],
): string | null {
  const parts = extractRepeatingParts(attributeName);
  if (!parts) return null;
  const hasIndex = hasIndexIdentifier(attributeName);
  if (!hasIndex) return null;

  // Extract the numeric part from the identifier (e.g., "$1" -> "1")
  const match = parts.identifier.match(/^\$(\d+)$/);
  if (!match) return null;

  const index = Number(match[1]);
  if (isNaN(index) || index < 1 || index > repOrder.length) {
    return null;
  }
  return repOrder[index - 1];
};

export async function getRepOrderForSection(
  characterID: string,
  section: string,
) {
  const repOrderAttribute = `_reporder_repeating_${section}`;
  const repOrder = await libSmartAttributes.getAttribute(characterID, repOrderAttribute);
  return repOrder;
};

export function extractRepeatingAttributes(
  attributes: Attribute[]
): Attribute[] {
  return attributes.filter(attr => attr.name && isRepeatingAttribute(attr.name));
};

export function getAllSectionNames(
  attributes: Attribute[]
): string[] {
  const sectionNames: Set<string> = new Set();
  const repeatingAttributes = extractRepeatingAttributes(attributes);
  for (const attr of repeatingAttributes) {
    if (!attr.name) continue;
    const parts = extractRepeatingParts(attr.name);
    if (!parts) continue;
    sectionNames.add(parts.section);
  }
  return Array.from(sectionNames);
};

export async function getAllRepOrders(
  characterID: string,
  sectionNames: string[],
) {
  const repOrders: Record<string, string[]> = {};
  for (const section of sectionNames) {
    const repOrderString = await getRepOrderForSection(characterID, section);
    if (repOrderString && typeof repOrderString === "string") {
      repOrders[section] = convertRepOrderToArray(repOrderString);
    } else {
      repOrders[section] = [];
    }
  }
  return repOrders;
};

export async function processRepeatingAttributes(
  characterID: string,
  attributes: Attribute[],
) {
  const repeatingAttributes = extractRepeatingAttributes(attributes);
  const sectionNames = getAllSectionNames(repeatingAttributes);
  const repOrders = await getAllRepOrders(characterID, sectionNames);

  const processedAttributes: Attribute[] = [];

  for (const attr of repeatingAttributes) {
    if (!attr.name) continue;
    const parts = extractRepeatingParts(attr.name);
    if (!parts) continue;

    let identifier = parts.identifier;

    const useIndex = hasIndexIdentifier(attr.name);
    if (useIndex) {
      const repOrderForSection = repOrders[parts.section];
      const rowID = getIDFromIndex(attr.name, repOrderForSection);
      if (rowID) {
        identifier = rowID;
      } else {
        continue;
      }
    }

    const useNewID = hasCreateIdentifier(attr.name);
    if (useNewID) {
      identifier = libUUID.generateRowID();
    }

    const combinedName = combineRepeatingParts({
      section: parts.section,
      identifier,
      field: parts.field
    });

    processedAttributes.push({
      ...attr,
      name: combinedName
    });
  }

  return processedAttributes;
};