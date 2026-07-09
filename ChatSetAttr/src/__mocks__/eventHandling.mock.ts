/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi } from "vitest";

export type CallbackStore = {
  [eventType in Roll20EventType]?: ((...args: any[]) => void)[];
};

const callbacks: CallbackStore = {};
export type ListOfEvents = `${Roll20EventType}` | `${Roll20EventType} ${Roll20EventType}`;

export function resetAllCallbacks(): void {
  for (const key in callbacks) {
    delete callbacks[key as Roll20EventType];
  }
};

export function mockedOn<E extends Roll20EventType>(
  eventName: E,
  callback: (...args: any[]) => void
) {
  const eventNames = eventName.split(" ") as Roll20EventType[];
  for (const name of eventNames) {
    if (!callbacks[name]) {
      callbacks[name] = [];
    }
    callbacks[name].push(callback);
  }
};

export function mockTriggerEvent(eventName: string, response: unknown[]) {
  const eventCallbacks = callbacks[eventName as Roll20EventType];
  if (eventCallbacks) {
    for (const callback of eventCallbacks) {
      callback(...response);
    }
  }

  vi.runAllTimers();
};

export type SimulationMessageOptions = Partial<Roll20ChatMessage> & { inputs?: string[] };

export function simulateChatMessage(message: string, options?: SimulationMessageOptions) {
  const {
    who = "GM",
    playerid = "example-player-id",
    inlinerolls,
    type = "api",
    content = message,
    origRoll = undefined,
    rolltemplate = undefined,
    target = undefined,
    target_name = undefined,
    selected = [],
    inputs = [],
  } = options || {};

  // match all occurances of @{attribute_name} and replace with 10 for testing
  let contentWithReplacements = content;
  const attrMatches = content.match(/@{([^}]+)}/g);
  attrMatches?.forEach((match) => {
    const attributeName = match.slice(2, -1).replace(/(selected|target)\|/, "");
    const attributes = findObjs({ _type: "attribute", name: attributeName });
    const attribute = attributes[0];
    const value = attribute ? attribute.get("current") : "10";
    contentWithReplacements = contentWithReplacements.replace(match, value);
  });

  // match all occurrences of XdX inside [[...]] and replace with a fixed number for testing
  const rollMatches = contentWithReplacements.match(/\[\[\d+d(\d+)\]\]/g);
  rollMatches?.forEach((match) => {
    // replace with half the die size rounded up multiplied by the number of dice
    // e.g. 3d6 becomes 12 (3 * 3 + 1)
    const parts = match.replace(/[[\]]/g, "").split("d");
    const numDice = parseInt(parts[0], 10);
    const dieSize = parseInt(parts[1], 10);
    const replacement = Math.ceil(dieSize / 2) * numDice;
    contentWithReplacements = contentWithReplacements.replace(match, replacement.toString());
  });

  // match all occurrences of ?{...} with the inputs in order
  const regex = /\?\{([^}]+)\}/g;
  const matches = contentWithReplacements.match(regex);
  matches?.forEach((match) => {
    const input = inputs.shift();
    if (!input) {
      throw new Error(`No input provided for prompt: ${match}`);
    }
    contentWithReplacements = contentWithReplacements.replace(match, input);
  });

  // replace all occurrences of [[...]] with the evaluated result
  const inlineRegex = /\[\[([^\]]+)\]\]/g;
  const inlineMatches = contentWithReplacements.match(inlineRegex);
  inlineMatches?.forEach((match) => {
    const noBrackets = match.replace(/[[\]]/g, "");
    try {
      const result = eval(noBrackets);
      contentWithReplacements = contentWithReplacements.replace(match, result.toString());
    } catch {
      throw new Error(`Error evaluating inline roll: ${match}`);
    }
  });

  const defaultMessage: Roll20ChatMessage = {
    who,
    playerid,
    inlinerolls,
    type,
    content: contentWithReplacements,
    origRoll,
    rolltemplate,
    target,
    target_name,
    selected,
  };

  triggerEvent("chat:message", [defaultMessage]);
}
