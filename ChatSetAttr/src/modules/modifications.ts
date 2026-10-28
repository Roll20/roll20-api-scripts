import { ALIAS_CHARACTERS, type Attribute, type AttributeRecord, type OptionsRecord } from "../types";
import { extractRepeatingParts, hasCreateIdentifier } from "./repeating";

export type ProcessModifierOptions = {
  shouldEvaluate?: boolean;
  shouldAlias?: boolean;
};

export function processModifierValue(
  modification: string,
  resolvedAttributes: AttributeRecord,
  {
    shouldEvaluate = false,
    shouldAlias = false
  }: ProcessModifierOptions = {}
): string {
  let finalValue = replacePlaceholders(modification, resolvedAttributes);

  if (shouldAlias) {
    finalValue = replaceAliasCharacters(finalValue);
  }

  if (shouldEvaluate) {
    finalValue = evaluateExpression(finalValue);
  }

  return finalValue;
};

function replaceAliasCharacters(
  modification: string,
): string {
  let result = modification;
  for (const alias in ALIAS_CHARACTERS) {
    const original = ALIAS_CHARACTERS[alias];
    const regex = new RegExp(`\\${alias}`, "g");
    result = result.replace(regex, original);
  }
  return result;
};

function replacePlaceholders(
  value: string,
  attributes: AttributeRecord
): string {
  if (typeof value !== "string") return value;
  return value.replace(/%([a-zA-Z0-9_]+)%/g, (match, name) => {
    const replacement = attributes[name];
    return replacement !== undefined ? String(replacement) : match;
  });
};

function evaluateExpression(
  expression: string,
): string {
  try {
    const stringValue = String(expression);
    const result = eval(stringValue);
    return result;
  } catch {
    return expression;
  }
};

export type ProcessModifierNameOptions = {
  repeatingID?: string;
  repOrder: string[];
};

export function processModifierName(
  name: string,
  { repeatingID, repOrder }: ProcessModifierNameOptions
): string {
  let result = name;
  const hasCreate = result.includes("CREATE");
  if (hasCreate && repeatingID) {
    result = result.replace("CREATE", repeatingID);
  }

  const rowIndexMatch = result.match(/\$(\d+)/);
  if (rowIndexMatch && repOrder) {
    const rowIndex = parseInt(rowIndexMatch[1], 10);
    const rowID = repOrder[rowIndex];
    if (!rowID) return result;
    result = result.replace(`$${rowIndex}`, rowID);
  }

  return result;
};

export function processModifications(
  modifications: Attribute[],
  resolved: AttributeRecord,
  options: OptionsRecord,
  repOrders: Record<string, string[]>,
): Attribute[] {
  const processedModifications: Attribute[] = [];
  const repeatingID = libUUID.generateRowID();

  for (const mod of modifications) {
    if (!mod.name) continue;
    let processedName = mod.name;
    const parts = extractRepeatingParts(mod.name);
    if (parts) {
      const hasCreate = hasCreateIdentifier(parts.identifier);
      const repOrder = repOrders[parts.section] || [];
      processedName = processModifierName(mod.name, {
        repeatingID: hasCreate ? repeatingID : parts.identifier,
        repOrder,
      });
    }

    let processedCurrent = undefined;
    if (mod.current !== "undefined") {
      processedCurrent = String(mod.current);
      processedCurrent = processModifierValue(processedCurrent, resolved, {
        shouldEvaluate: options.evaluate,
        shouldAlias: options.replace,
      });
    }

    let processedMax = undefined;
    if (mod.max !== undefined) {
      processedMax = String(mod.max);
      processedMax = processModifierValue(processedMax, resolved, {
        shouldEvaluate: options.evaluate,
        shouldAlias: options.replace,
      });
    }

    const processedMod: Attribute = {
      name: processedName,
    };
    if (processedCurrent !== undefined) {
      processedMod.current = processedCurrent;
    }
    if (processedMax !== undefined) {
      processedMod.max = processedMax;
    }

    processedModifications.push(processedMod);
  }

  return processedModifications;
};