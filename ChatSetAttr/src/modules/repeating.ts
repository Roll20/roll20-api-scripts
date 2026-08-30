import type { Attribute } from "../types";

export const REPEATING_INDEX_TOKEN = /^\$(\d+)$/i;
export const REPEATING_CREATE_TOKEN = /^CREATE$/i;
export const REPEATING_DASH_CREATE_TOKEN = /^-CREATE$/i;

export function isRepeatingCreateToken(token: string): boolean {
  return REPEATING_CREATE_TOKEN.test(token) || REPEATING_DASH_CREATE_TOKEN.test(token);
};

export type RepeatingIdentifierToken =
  | { kind: "index"; index: number }
  | { kind: "create" }
  | { kind: "rowId"; rowId: string };

export function parseRepeatingIdentifierToken(
  token: string,
): RepeatingIdentifierToken | null {
  if (!token) return null;
  const indexMatch = token.match(REPEATING_INDEX_TOKEN);
  if (indexMatch) {
    return { kind: "index", index: Number(indexMatch[1]) };
  }
  if (isRepeatingCreateToken(token)) {
    return { kind: "create" };
  }
  return { kind: "rowId", rowId: token };
};

export function isRepeatingRowIdToken(token: string): boolean {
  const parsed = parseRepeatingIdentifierToken(token);
  return parsed?.kind === "rowId";
};

export function resolveRowIdInRepOrder(
  repOrder: string[],
  rowId: string,
): string | null {
  const rowIdLo = rowId.toLowerCase();
  const index = repOrder.findIndex(id => id.toLowerCase() === rowIdLo);
  if (index === -1) return null;
  return repOrder[index];
};

export type RepeatingRowDeleteTarget = {
  sectionPrefix: string;
  rowIndex?: number;
  rowId?: string;
};

export function parseRepeatingRowDeleteTarget(
  name: string,
): RepeatingRowDeleteTarget | null {
  if (extractRepeatingParts(name)) {
    return null;
  }
  const parts = name.split("_");
  if (parts.length !== 3) {
    return null;
  }
  const [repeating, section, identifierToken] = parts;
  if (repeating !== "repeating" || !section || !identifierToken) {
    return null;
  }
  const parsed = parseRepeatingIdentifierToken(identifierToken);
  if (!parsed || parsed.kind === "create") {
    return null;
  }
  const sectionPrefix = `repeating_${section}`;
  if (parsed.kind === "index") {
    return { sectionPrefix, rowIndex: parsed.index };
  }
  return { sectionPrefix, rowId: parsed.rowId };
};

export function getSectionFromRepeatingPrefix(
  sectionPrefix: string,
): string | null {
  const match = sectionPrefix.match(/^repeating_(.+)$/);
  return match ? match[1] : null;
};

export function resolveRepeatingRowId(
  target: RepeatingRowDeleteTarget,
  repOrder: string[],
): string | null {
  if (target.rowIndex !== undefined) {
    if (target.rowIndex < 0 || target.rowIndex >= repOrder.length) {
      return null;
    }
    return repOrder[target.rowIndex];
  }
  if (target.rowId) {
    return resolveRowIdInRepOrder(repOrder, target.rowId);
  }
  return null;
};

export function findRepeatingRowAttributeNames(
  characterID: string,
  sectionPrefix: string,
  rowId: string,
): string[] {
  const prefix = `${sectionPrefix}_${rowId}_`.toUpperCase();
  const attributes = findObjs({
    _type: "attribute",
    _characterid: characterID,
  });
  const names: string[] = [];
  for (const attribute of attributes) {
    const name = attribute.get("name");
    if (typeof name !== "string") continue;
    if (name.toUpperCase().startsWith(prefix)) {
      names.push(name);
    }
  }
  return names;
};

export function expandRepeatingRowDeletes(
  characterID: string,
  changes: Attribute[],
  repOrders: Record<string, string[]>,
  errors: string[],
  characterName: string,
): Attribute[] {
  const result: Attribute[] = [];
  for (const change of changes) {
    if (!change.name) continue;
    const target = parseRepeatingRowDeleteTarget(change.name);
    if (!target) {
      result.push(change);
      continue;
    }
    const section = getSectionFromRepeatingPrefix(target.sectionPrefix);
    if (!section) {
      result.push(change);
      continue;
    }
    const repOrder = repOrders[section] || [];
    const resolvedRowId = resolveRepeatingRowId(target, repOrder);
    if (!resolvedRowId) {
      if (target.rowIndex !== undefined) {
        errors.push(
          `Repeating row number ${target.rowIndex} invalid for character ${characterName} and repeating section ${target.sectionPrefix}.`,
        );
      } else {
        errors.push(
          `Repeating row id ${target.rowId} invalid for character ${characterName} and repeating section ${target.sectionPrefix}.`,
        );
      }
      continue;
    }
    const fieldNames = findRepeatingRowAttributeNames(
      characterID,
      target.sectionPrefix,
      resolvedRowId,
    );
    for (const name of fieldNames) {
      result.push({ name });
    }
  }
  return result;
};

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
    return isRepeatingCreateToken(parts.identifier);
  }
  return isRepeatingCreateToken(attributeName);
};

export function hasIndexIdentifier(
  attributeName: string
): boolean {
  const parts = extractRepeatingParts(attributeName);
  if (!parts) return false;
  return REPEATING_INDEX_TOKEN.test(parts.identifier);
};

export function convertRepOrderToArray(
  repOrder: string
): string[] {
  return repOrder.split(",").map(id => id.trim()).filter(Boolean);
};

export function discoverRowIds(
  characterID: string,
  section: string,
): string[] {
  const rowIds = new Set<string>();
  const attributes = findObjs({
    _type: "attribute",
    _characterid: characterID,
  });

  for (const attribute of attributes) {
    const name = attribute.get("name");
    if (typeof name !== "string") continue;
    const parts = name.split("_");
    if (parts.length < 4) continue;
    if (parts[0] !== "repeating" || parts[1] !== section) continue;
    const identifier = parts[2];
    if (isRepeatingRowIdToken(identifier)) {
      rowIds.add(identifier);
    }
  }

  return Array.from(rowIds);
};

export function mergeRepOrder(
  storedOrder: string[],
  discoveredIds: string[],
): string[] {
  const discoveredSet = new Set(discoveredIds);
  const ordered = storedOrder.filter(id => discoveredSet.has(id));
  for (const id of discoveredIds) {
    if (!ordered.includes(id)) {
      ordered.push(id);
    }
  }
  return ordered;
};

export function getIDFromIndex(
  attributeName: string,
  repOrder: string[],
): string | null {
  const parts = extractRepeatingParts(attributeName);
  if (!parts) return null;
  const hasIndex = hasIndexIdentifier(attributeName);
  if (!hasIndex) return null;

  const match = parts.identifier.match(/^\$(\d+)$/);
  if (!match) return null;

  const index = Number(match[1]);
  if (isNaN(index) || index < 0 || index >= repOrder.length) {
    return null;
  }
  return repOrder[index];
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
  for (const attr of attributes) {
    if (!attr.name) continue;
    const parts = extractRepeatingParts(attr.name);
    if (parts) {
      sectionNames.add(parts.section);
      continue;
    }
    const rowDelete = parseRepeatingRowDeleteTarget(attr.name);
    if (rowDelete) {
      const section = getSectionFromRepeatingPrefix(rowDelete.sectionPrefix);
      if (section) {
        sectionNames.add(section);
      }
    }
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
    const stored = repOrderString && typeof repOrderString === "string"
      ? convertRepOrderToArray(repOrderString)
      : [];
    const discovered = discoverRowIds(characterID, section);
    repOrders[section] = mergeRepOrder(stored, discovered);
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