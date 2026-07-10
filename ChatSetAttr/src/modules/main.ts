import scriptJson from "../../script.json" assert { type: "json" };
import type { Attribute, AttributeRecord } from "../types";
import { getAttributes } from "./attributes";
import { sendDelayMessage, sendBeaconUnsupportedNotice, sendErrors, sendMessages, normalizeCommandOutputOptions } from "./chat";
import { isBeaconSupported } from "./beaconSupport";
import { handlers } from "./commands";
import { checkConfigMessage, getConfig, handleConfigCommand, hasFlag } from "./config";
import {
  createFeedbackMessage,
  formatDeleteFeedback,
  formatSettingFeedback,
} from "./feedback";
import { checkHelpMessage, handleHelpCommand } from "./help";
import { getCharName } from "./helpers";
import { processInlinerolls, normalizeTemplateRollProperties } from "./inlinerolls";
import { extractMessageFromRollTemplate, normalizeMultilineCommand, parseMessage, validateMessage } from "./message";
import { processModifications } from "./modifications";
import { checkPermissions } from "./permissions";
import { expandRepeatingRowDeletes, getAllRepOrders, getAllSectionNames } from "./repeating";
import { generateTargets } from "./targets";
import { clearTimer, startTimer } from "./timer";
import { makeUpdate } from "./updates";

function broadcastHeader() {
  log(`${scriptJson.name} v${scriptJson.version} by ${scriptJson.authors.join(", ")} loaded.`);
};

function checkDependencies(): boolean {
  const errors: string[] = [];
  if (libSmartAttributes === undefined) {
    errors.push("libSmartAttributes is required but not found. Please ensure the libSmartAttributes script is installed.");
  }
  if (libUUID === undefined) {
    errors.push("libUUID is required but not found. Please ensure the libUUID script is installed.");
  }
  if (errors.length > 0) {
    sendErrors("gm", "Missing Dependencies", errors);
  }
  return errors.length === 0;
};

async function acceptMessage(msg: Roll20ChatMessage) {
  // State
  const errors: string[] = [];
  const messages: string[] = [];
  const result: Record<string, AttributeRecord> = {};

  // Parse Message
  const parsed = parseMessage(msg.content);
  if (!parsed) {
    return errorOut(
      "Could not parse command. Check that command options use -- (double dash).",
      msg.playerid,
      errors,
      normalizeCommandOutputOptions(),
    );
  }

  const {
    operation,
    targeting,
    options,
    changes,
    references,
    feedback,
  } = parsed;

  const output = normalizeCommandOutputOptions(options);

  // Start Timer
  startTimer("chatsetattr", 8000, () => sendDelayMessage(msg.playerid, output));

  // Check Config and Permissions
  const config = getConfig();
  const isAPI = "API" === msg.playerid;
  const isGM = playerIsGM(msg.playerid);

  if (options.evaluate && !isAPI && !isGM && !config.playersCanEvaluate) {
    return errorOut("You do not have permission to use the evaluate option.", msg.playerid, errors, output);
  }

  if (targeting.includes("party") && !isAPI && !isGM && !config.playersCanTargetParty) {
    return errorOut("You do not have permission to target the party.", msg.playerid, errors, output);
  }

  if((operation === "modattr" || operation === "modbattr") && !isAPI && !isGM && !config.playersCanModify) {
    return errorOut("You do not have permission to modify attributes.", msg.playerid, errors, output);
  }

  // Preprocess
  const { targets, errors: targetErrors } = generateTargets(msg, targeting);
  errors.push(...targetErrors);
  if (targets.length === 0) {
    return errorOut("No valid targets found.", msg.playerid, errors, output);
  }

  const request = generateRequest(references, changes);
  const command = handlers[operation];

  if (!command) {
    return errorOut(`Invalid operation: ${operation}`, msg.playerid, errors, output);
  }

  // Execute
  const priorValues: Record<string, AttributeRecord> = {};
  const pendingChanges: Record<string, Attribute[]> = {};

  for (const target of targets) {
    const attrs = await getAttributes(target, request);
    priorValues[target] = attrs;
    const sectionNames = getAllSectionNames(changes);
    const repOrders = await getAllRepOrders(target, sectionNames);
    let effectiveChanges = changes;
    if (operation === "delattr") {
      effectiveChanges = expandRepeatingRowDeletes(
        target, changes, repOrders, errors, getCharName(target),
      );
    }
    const modifications = processModifications(
      effectiveChanges, attrs, options, repOrders, errors, getCharName(target),
    );

    const response = await command(modifications, target, references, options.nocreate, feedback);

    if (response.errors.length > 0) {
      errors.push(...response.errors);
      continue;
    }

    pendingChanges[target] = modifications;
    result[target] = response.result;
  }

  const updateResult = await makeUpdate(operation, result, {
    noCreate: options.nocreate,
    priorValues,
    operation,
  });

  clearTimer("chatsetattr");

  errors.push(...updateResult.errors);

  for (const target in result) {
    const filteredResult = filterSuccessfulResult(target, result[target], updateResult.failed);
    if (Object.keys(filteredResult).length === 0) {
      continue;
    }

    const characterName = getCharName(target);
    const targetChanges = pendingChanges[target] ?? [];
    let message: string | null;

    if (feedback?.content) {
      message = createFeedbackMessage(
        characterName,
        feedback,
        priorValues[target] ?? {},
        filteredResult,
      );
    } else if (operation === "delattr") {
      message = formatDeleteFeedback(characterName, targetChanges, filteredResult);
    } else {
      message = formatSettingFeedback(characterName, targetChanges, filteredResult);
    }

    if (message) {
      messages.push(message);
    }
  }

  sendErrors(msg.playerid, "Errors", errors, feedback?.from, output);
  const delSetTitle = operation === "delattr" ? "Deleting attributes" : "Setting attributes";
  const feedbackTitle = feedback?.header ?? delSetTitle;
  if (messages.length > 0) {
    sendMessages(msg.playerid, feedbackTitle, messages, {
      from: feedback?.from,
      public: feedback?.public,
    }, output);
  }
};

function errorOut(
  errorText: string,
  playerid: string,
  errors: string[],
  output: ReturnType<typeof normalizeCommandOutputOptions>,
) {
  errors.push(errorText);
  sendErrors(playerid, "Errors", errors, undefined, output);
  clearTimer("chatsetattr");
}

function filterSuccessfulResult(
  target: string,
  targetResult: AttributeRecord,
  failed: string[],
): AttributeRecord {
  const filtered: AttributeRecord = {};

  for (const key in targetResult) {
    if (!failed.includes(`${target}:${key}`)) {
      filtered[key] = targetResult[key];
    }
  }

  return filtered;
}


export function generateRequest(
  references: string[],
  changes: Attribute[],
): string[] {
  const referenceSet = new Set(references);
  for (const change of changes) {
    if (!change.name) {
      continue;
    }
    if (!referenceSet.has(change.name)) {
      referenceSet.add(change.name);
    }
    const maxName = `${change.name}_max`;
    if (!referenceSet.has(maxName)) {
      referenceSet.add(maxName);
    }
  }
  return Array.from(referenceSet);
};

export function registerHandlers() {
  broadcastHeader();
  if (!checkDependencies()) {
    return;
  }

  if (!isBeaconSupported()) {
    sendBeaconUnsupportedNotice();
  }

  on("chat:message", (msg) => {
    if (msg.type !== "api") {
      const inlineMessage = extractMessageFromRollTemplate(msg);
      if (!inlineMessage) return;
      msg.content = inlineMessage;
    }
    msg.content = normalizeMultilineCommand(msg.content);
    msg.content = normalizeTemplateRollProperties(msg.content);
    msg.content = processInlinerolls(msg);
    const debugReset = msg.content.startsWith("!setattrs-debugreset");
    if (debugReset) {
      log("ChatSetAttr: Debug - resetting state.");
      state.ChatSetAttr = {};
      return;
    }
    const debugVersion = msg.content.startsWith("!setattrs-debugversion");
    if (debugVersion) {
      log("ChatSetAttr: Debug - setting state schema version to 3.");
      if (!state.ChatSetAttr) state.ChatSetAttr = {};
      state.ChatSetAttr.version = 3;
      return;
    }
    const isHelpMessage = checkHelpMessage(msg.content);
    if (isHelpMessage) {
      handleHelpCommand();
      return;
    }
    const isConfigMessage = checkConfigMessage(msg.content);
    if (isConfigMessage) {
      if (!playerIsGM(msg.playerid)) {
        return;
      }
      handleConfigCommand(msg.content, msg.playerid);
      return;
    }
    const validMessage = validateMessage(msg.content);
    if (!validMessage) return;
    if (checkPermissions(msg.playerid)) {
      acceptMessage(msg);
    }
  });
};

export { registerObserver } from "./observer";