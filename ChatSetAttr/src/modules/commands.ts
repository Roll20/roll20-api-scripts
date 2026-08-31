import type { Command, Attribute, AttributeRecord, AttributeValue, FeedbackObject } from "../types";
import { getAttributes } from "./attributes";
import { createFeedbackMessage } from "./feedback";
import { getCharName } from "./helpers";
import { notifyObservers } from "./observer";

export type HandlerResponse = {
  result: AttributeRecord;
  messages: string[];
  errors: string[];
};

export type HandlerFunction = (
  changes: Attribute[],
  target: string,
  referenced: string[],
  noCreate: boolean,
  feedback: FeedbackObject,
) => Promise<HandlerResponse>;

// region Command Handlers
export async function setattr(
  changes: Attribute[],
  target: string,
  referenced: string[] = [],
  noCreate = false,
  feedback: FeedbackObject,
): Promise<HandlerResponse> {
  const result: AttributeRecord = {};
  const errors: string[] = [];
  const messages: string[] = [];

  const request = createRequestList(referenced, changes, false);
  const currentValues = await getCurrentValues(target, request, changes);
  const undefinedAttributes = extractUndefinedAttributes(currentValues);
  const characterName = getCharName(target);

  for (const change of changes) {
    const { name, current, max } = change;
    if (!name) continue; // skip if no name provided
    if (undefinedAttributes.includes(name) && noCreate) {
      errors.push(`Missing attribute ${name} not created for ${characterName}.`);
      continue;
    }
    const event = undefinedAttributes.includes(name) ? "add" : "change";
    if (current !== undefined) {
      result[name] = current;
      notifyObservers(
        event,
        target,
        name,
        result[name],
        currentValues?.[name] ?? undefined,
      );
    }
    if (max !== undefined) {
      result[`${name}_max`] = max;
      notifyObservers(
        event,
        target,
        `${name}_max`,
        result[`${name}_max`],
        currentValues?.[`${name}_max`] ?? undefined
      );
    }

    let newMessage = `Set attribute '${name}' on ${characterName}.`;
    if (feedback.content) {
      newMessage = createFeedbackMessage(
        characterName,
        feedback,
        currentValues,
        result,
      );
    }
    messages.push(newMessage);
  }

  return {
    result,
    messages,
    errors,
  };

};

export async function modattr(
  changes: Attribute[],
  target: string,
  referenced: string[],
  noCreate = false,
  feedback: FeedbackObject,
): Promise<HandlerResponse> {
  const result: AttributeRecord = {};
  const errors: string[] = [];
  const messages: string[] = [];

  const currentValues = await getCurrentValues(target, referenced, changes);
  const undefinedAttributes = extractUndefinedAttributes(currentValues);
  const characterName = getCharName(target);

  for (const change of changes) {
    const { name, current, max } = change;
    if (!name) continue;
    if (undefinedAttributes.includes(name) && noCreate) {
      errors.push(`Attribute '${name}' is undefined and cannot be modified.`);
      continue;
    }
    const asNumber = Number(currentValues[name] ?? 0);
    if (isNaN(asNumber)) {
      errors.push(`Attribute '${name}' is not number-valued and so cannot be modified.`);
      continue;
    }
    if (current !== undefined) {
      result[name] = calculateModifiedValue(asNumber, current);
      notifyObservers("change", target, name, result[name], currentValues[name]);
    }
    if (max !== undefined) {
      result[`${name}_max`] = calculateModifiedValue(currentValues[`${name}_max`], max);
      notifyObservers("change", target, `${name}_max`, result[`${name}_max`], currentValues[`${name}_max`]);
    }

    let newMessage = `Set attribute '${name}' on ${characterName}.`;
    if (feedback.content) {
      newMessage = createFeedbackMessage(
        characterName,
        feedback,
        currentValues,
        result,
      );
    }

    messages.push(newMessage);
  }

  return {
    result,
    messages,
    errors,
  };
};

export async function modbattr(
  changes: Attribute[],
  target: string,
  referenced: string[],
  noCreate = false,
  feedback: FeedbackObject,
): Promise<HandlerResponse> {
  const result: AttributeRecord = {};
  const errors: string[] = [];
  const messages: string[] = [];

  const request = createRequestList(referenced, changes, true);
  const currentValues = await getCurrentValues(target, request, changes);
  const undefinedAttributes = extractUndefinedAttributes(currentValues);
  const characterName = getCharName(target);

  for (const change of changes) {
    const { name, current, max } = change;
    if (!name) continue;
    if (undefinedAttributes.includes(name) && noCreate) {
      errors.push(`Attribute '${name}' is undefined and cannot be modified.`);
      continue;
    }
    const asNumber = Number(currentValues[name]);
    if (isNaN(asNumber)) {
      errors.push(`Attribute '${name}' is not number-valued and so cannot be modified.`);
      continue;
    }
    if (current !== undefined) {
      result[name] = calculateModifiedValue(asNumber, current);
      notifyObservers("change", target, name, result[name], currentValues[name]);
    }
    if (max !== undefined) {
      result[`${name}_max`] = calculateModifiedValue(currentValues[`${name}_max`], max);
      notifyObservers("change", target, `${name}_max`, result[`${name}_max`], currentValues[`${name}_max`]);
    }
    const newMax = result[`${name}_max`] ?? currentValues[`${name}_max`];
    if (newMax !== undefined) {
      const start = currentValues[name];
      result[name] = calculateBoundValue(
        result[name] ?? start,
        newMax,
      );
    }

    let newMessage = `Modified attribute '${name}' on ${characterName}.`;
    if (feedback.content) {
      newMessage = createFeedbackMessage(
        characterName,
        feedback,
        currentValues,
        result,
      );
    }

    messages.push(newMessage);
  }

  return {
    result,
    messages,
    errors,
  };
}

export async function resetattr(
  changes: Attribute[],
  target: string,
  referenced: string[],
  noCreate = false,
  feedback: FeedbackObject,
): Promise<HandlerResponse> {
  const result: AttributeRecord = {};
  const errors: string[] = [];
  const messages: string[] = [];

  const request = createRequestList(referenced, changes, true);
  const currentValues = await getCurrentValues(target, request, changes);
  const undefinedAttributes = extractUndefinedAttributes(currentValues);
  const characterName = getCharName(target);

  for (const change of changes) {
    const { name } = change;
    if (!name) continue;
    if (undefinedAttributes.includes(name) && noCreate) {
      errors.push(`Attribute '${name}' is undefined and cannot be reset.`);
      continue;
    }
    const maxName = `${name}_max`;
    if (currentValues[maxName] !== undefined) {
      const maxAsNumber = Number(currentValues[maxName]);
      if (isNaN(maxAsNumber)) {
        errors.push(`Attribute '${maxName}' is not number-valued and so cannot be used to reset '${name}'.`);
        continue;
      }
      result[name] = maxAsNumber;
    } else {
      result[name] = 0;
    }

    notifyObservers("change", target, name, result[name], currentValues[name]);

    let newMessage = `Reset attribute '${name}' on ${characterName}.`;
    if (feedback.content) {
      newMessage = createFeedbackMessage(
        characterName,
        feedback,
        currentValues,
        result,
      );
    }

    messages.push(newMessage);
  }

  return {
    result,
    messages,
    errors,
  };
}

export async function delattr(
  changes: Attribute[],
  target: string,
  referenced: string[],
  _: boolean,
  feedback: FeedbackObject,
): Promise<HandlerResponse> {
  const result: AttributeRecord = {};
  const messages: string[] = [];
  const currentValues = await getCurrentValues(target, referenced, changes);
  const characterName = getCharName(target);

  for (const change of changes) {
    const { name } = change;
    if (!name) continue;
    result[name] = undefined;
    result[`${name}_max`] = undefined;

    let newMessage = `Deleted attribute '${name}' on ${characterName}.`;

    notifyObservers("destroy", target, name, result[name], currentValues[name]);

    if (currentValues[`${name}_max`] !== undefined) {
      notifyObservers("destroy", target, `${name}_max`, result[`${name}_max`], currentValues[`${name}_max`]);
    }

    if (feedback.content) {
      newMessage = createFeedbackMessage(
        characterName,
        feedback,
        currentValues,
        result,
      );
    }

    messages.push(newMessage);
  }
  return {
    result,
    messages,
    errors: [],
  };
};

export type HandlerDictionary = {
  [key in Command]?: HandlerFunction;
};

export const handlers: HandlerDictionary = {
  setattr,
  modattr,
  modbattr,
  resetattr,
  delattr,
};

// #region Helper Functions

function createRequestList(
  referenced: string[],
  changes: Attribute[],
  includeMax = true,
): string[] {
  const requestSet = new Set<string>([...referenced]);
  for (const change of changes) {
    if (change.name) {
      requestSet.add(change.name);
      if (includeMax) {
        requestSet.add(`${change.name}_max`);
      }
    }
  }
  return Array.from(requestSet);
};

function extractUndefinedAttributes(
  attributes: AttributeRecord
): string[] {
  const names: string[] = [];
  for (const name in attributes) {
    if (name.endsWith("_max")) continue;
    if (attributes[name] === undefined) {
      names.push(name);
    }
  }
  return names;
};

async function getCurrentValues(
  target: string,
  referenced: string[],
  changes: Attribute[]
): Promise<AttributeRecord> {
  const queriedAttributes = new Set<string>([...referenced]);
  for (const change of changes) {
    if (change.name) {
      queriedAttributes.add(change.name);
      if (change.max !== undefined) {
        queriedAttributes.add(`${change.name}_max`);
      }
    }
  }
  const attributes = await getAttributes(target, Array.from(queriedAttributes));
  return attributes;
};

function calculateModifiedValue(
  baseValue: string | number | boolean | undefined,
  modification: string | number | boolean
): number {
  const operator = getOperator(modification);
  baseValue = Number(baseValue);
  if (operator) {
    modification = Number(String(modification).substring(1));
  } else {
    modification = Number(modification);
  }
  if (isNaN(baseValue)) baseValue = 0;
  if (isNaN(modification)) modification = 0;
  return applyCalculation(baseValue, modification, operator);
};

function getOperator(value: string | number | boolean) {
  if (typeof value === "string") {
    const match = value.match(/^([+\-*/])/);
    if (match) {
      return match[1];
    }
  }
  return;
};

function applyCalculation(
  baseValue: number,
  modification: number,
  operator: string = "+"
): number {
  modification = Number(modification);
  switch (operator) {
    case "+":
      return baseValue + modification;
    case "-":
      return baseValue - modification;
    case "*":
      return baseValue * modification;
    case "/":
      return modification !== 0 ? baseValue / modification : baseValue;
    default:
      return baseValue + modification;
  }
};

function calculateBoundValue(
  currentValue: AttributeValue,
  maxValue: AttributeValue
): number {
  currentValue = Number(currentValue);
  maxValue = Number(maxValue);
  if (isNaN(currentValue)) currentValue = 0;
  if (isNaN(maxValue)) return currentValue;
  return Math.max(Math.min(currentValue, maxValue), 0);
};
