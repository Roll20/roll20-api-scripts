import scriptJson from "../../script.json" assert { type: "json" };
import type { Attribute, AttributeRecord } from "../types";
import { getAttributes } from "./attributes";
import { sendDelayMessage, sendErrors, sendMessages } from "./chat";
import { handlers } from "./commands";
import { checkConfigMessage, handleConfigCommand } from "./config";
import { checkHelpMessage, handleHelpCommand } from "./help";
import { extractMessageFromRollTemplate, parseMessage, validateMessage } from "./message";
import { processModifications } from "./modifications";
import { checkPermissions } from "./permissions";
import { getAllRepOrders, getAllSectionNames } from "./repeating";
import { generateTargets } from "./targets";
import { clearTimer, startTimer } from "./timer";
import { makeUpdate } from "./updates";

function broadcastHeader() {
  log(`${scriptJson.name} v${scriptJson.version} by ${scriptJson.authors.join(", ")} loaded.`);
};

function checkDependencies() {
  if (libSmartAttributes === undefined) {
    throw new Error("libSmartAttributes is required but not found. Please ensure the libSmartAttributes script is installed.");
  }
  if (libUUID === undefined) {
    throw new Error("libUUID is required but not found. Please ensure the libUUID script is installed.");
  }
};

async function acceptMessage(msg: Roll20ChatMessage) {
  // State
  const errors: string[] = [];
  const messages: string[] = [];
  const result: Record<string, AttributeRecord> = {};

  // Parse Message
  const {
    operation,
    targeting,
    options,
    changes,
    references,
    feedback,
  } = parseMessage(msg.content);

  // Start Timer
  startTimer("chatsetattr", 8000, () => sendDelayMessage(options.silent));

  // Preprocess
  const { targets, errors: targetErrors } = generateTargets(msg, targeting);
  errors.push(...targetErrors);
  const request = generateRequest(references, changes);
  const command = handlers[operation];
  if (!command) {
    errors.push(`No handler found for operation: ${operation}`);
    sendErrors(msg.playerid, "Errors", errors);
    return;
  }

  // Execute
  for (const target of targets) {
    const attrs = await getAttributes(target, request);
    const sectionNames = getAllSectionNames(changes);
    const repOrders = await getAllRepOrders(target, sectionNames);
    const modifications = processModifications(changes, attrs, options, repOrders);

    const response = await command(modifications, target, references, options.nocreate, feedback);

    if (response.errors.length > 0) {
      errors.push(...response.errors);
      continue;
    }

    messages.push(...response.messages);
    result[target] = response.result;
  }

  const updateResult = await makeUpdate(operation, result);

  clearTimer("chatsetattr");

  messages.push(...updateResult.messages);
  errors.push(...updateResult.errors);

  if (options.silent) return;
  sendErrors(msg.playerid, "Errors", errors, feedback?.from);
  if (options.mute) return;
  const delSetTitle = operation === "delattr" ? "Deleting Attributes" : "Setting Attributes";
  const feedbackTitle = feedback?.header ?? delSetTitle;
  sendMessages(msg.playerid, feedbackTitle, messages, feedback?.from);
};

export function generateRequest(
  references: string[],
  changes: Attribute[],
): string[] {
  const referenceSet = new Set(references);
  for (const change of changes) {
    if (change.name && !referenceSet.has(change.name)) {
      referenceSet.add(change.name);
    }
    if (change.max !== undefined) {
      const maxName = `${change.name}_max`;
      if (!referenceSet.has(maxName)) {
        referenceSet.add(maxName);
      }
    }
  }
  return Array.from(referenceSet);
};

export function registerHandlers() {
  broadcastHeader();
  checkDependencies();

  on("chat:message", (msg) => {
    if (msg.type !== "api") {
      const inlineMessage = extractMessageFromRollTemplate(msg);
      if (!inlineMessage) return;
      msg.content = inlineMessage;
    }
    const debugReset = msg.content.startsWith("!setattrs-debugreset");
    if (debugReset) {
      log("ChatSetAttr: Debug - resetting state.");
      state.ChatSetAttr = {};
      return;
    }
    const debugVersion = msg.content.startsWith("!setattrs-debugversion");
    if (debugVersion) {
      log("ChatSetAttr: Debug - setting version to 1.10.");
      state.ChatSetAttr.version = "1.10";
      return;
    }
    const isHelpMessage = checkHelpMessage(msg.content);
    if (isHelpMessage) {
      handleHelpCommand();
      return;
    }
    const isConfigMessage = checkConfigMessage(msg.content);
    if (isConfigMessage) {
      handleConfigCommand(msg.content);
      return;
    }
    const validMessage = validateMessage(msg.content);
    if (!validMessage) return;
    checkPermissions(msg.playerid);
    acceptMessage(msg);
  });
};

export { registerObserver } from "./observer";