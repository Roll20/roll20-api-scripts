import {
  COMMAND_TYPE,
  extractFeedbackKey,
  isCommand,
  isCommandOption,
  isFeedbackOption,
  isOption,
  OVERRIDE_DICTIONARY,
  TARGETS,
  type Attribute,
  type Command,
  type FeedbackObject,
  type OptionsRecord
} from "../types";
import { cleanValue } from "./helpers";

// #region Inline Message Extraction and Validation
export function validateMessage(content: string): boolean {
  for (const command of COMMAND_TYPE) {
    const messageCommand = content.split(" ")[0];
    if (messageCommand === `!${command}`) {
      return true;
    }
  }
  return false;
};

export function extractMessageFromRollTemplate(msg: Roll20ChatMessage): string | false {
  for (const command of COMMAND_TYPE) {
    if (msg.content.includes(command)) {
      const regex = new RegExp(`(!${command}.*?)!!!`, "gi");
      const match = regex.exec(msg.content);
      if (match) return match[1].trim();
    }
  }
  return false;
};

// #region Message Parsing
function extractOperation(parts: string[]): Command {
  if (parts.length === 0) throw new Error("Empty command");
  const command = parts.shift()!.slice(1); // remove the leading '!'
  const isValidCommand = isCommand(command);
  if (!isValidCommand) throw new Error(`Invalid command: ${command}`);
  return command;
};

function extractReferences(value: string | number | boolean): string[] {
  if (typeof value !== "string") return [];
  const matches = value.matchAll(/%[a-zA-Z0-9_]+%/g);
  return Array.from(matches, m => m[0]);
};

function splitMessage(content: string): string[] {
  const split = content.split("--").map(part => part.trim());
  return split;
};

function includesATarget(part: string): boolean {
  if (part.includes("|") || part.includes("#")) return false;
  [ part ] = part.split(" ").map(p => p.trim());
  for (const target of TARGETS) {
    const isMatch = part.toLowerCase() === target.toLowerCase();
    if (isMatch) return true;
  }
  return false;
};

export function parseMessage(content: string) {
  const parts = splitMessage(content);
  let operation = extractOperation(parts);

  const targeting: string[] = [];
  const options: OptionsRecord = {} as OptionsRecord;
  const changes: Attribute[] = [];
  const references: string[] = [];
  const feedback: FeedbackObject = { public: false };

  for (const part of parts) {
    if (isCommandOption(part)) {
      operation = OVERRIDE_DICTIONARY[part];
    }

    else if (isOption(part)) {
      options[part] = true;
    }

    else if (includesATarget(part)) {
      targeting.push(part);
    }

    else if (isFeedbackOption(part)) {
      const [ key, ...valueParts ] = part.split(" ");
      const value = valueParts.join(" ");
      const feedbackKey = extractFeedbackKey(key);
      if (!feedbackKey) continue;
      if (feedbackKey === "public") {
        feedback.public = true;
      } else {
        feedback[feedbackKey] = cleanValue(value);
      }
    }

    else if (part.includes("|") || part.includes("#")) {
      const split = part.split(/[|#]/g).map(p => p.trim());
      const [attrName, attrCurrent, attrMax] = split;
      if (!attrName && !attrCurrent && !attrMax) {
        continue;
      }
      const attribute: Attribute = {};
      if (attrName) attribute.name = attrName;
      if (attrCurrent) attribute.current = cleanValue(attrCurrent);
      if (attrMax) attribute.max = cleanValue(attrMax);
      changes.push(attribute);

      const currentMatches = extractReferences(attrCurrent);
      const maxMatches = extractReferences(attrMax);
      references.push(...currentMatches, ...maxMatches);
    }

    else {
      const suspectedAttribute = part.replace(/[^a-zA-Z0-9_$]/g, "");
      if (!suspectedAttribute) continue;
      changes.push({ name: suspectedAttribute });
    }
  }

  return {
    operation,
    options,
    targeting,
    changes,
    references,
    feedback,
  };
};