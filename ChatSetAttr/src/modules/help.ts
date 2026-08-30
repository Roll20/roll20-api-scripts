import { createHelpHandout } from "../templates/help/index";
import { getBundledHelpContentUpdatedAt } from "../templates/help/loadContentRevision";
import { getConfig, setConfig } from "./config";

export const HELP_COMMAND = "!setattr-help";
export const HELP_HANDOUT_NAME = "ChatSetAttr Help";

export function checkHelpMessage(msg: string): boolean {
  return msg.trim().toLowerCase().startsWith(HELP_COMMAND);
}

export function findHelpHandout(): Roll20Handout | undefined {
  return findObjs({
    _type: "handout",
    name: HELP_HANDOUT_NAME,
  })[0];
}

export function applyHelpContentToHandout(handout: Roll20Handout): void {
  const helpContent = createHelpHandout(handout.id);
  const bundledAt = getBundledHelpContentUpdatedAt();

  handout.set({
    inplayerjournals: "all",
    notes: helpContent,
  });
  setConfig({ helpContentUpdatedAt: bundledAt });
}

export function handleHelpCommand(): void {
  let handout = findHelpHandout();

  if (!handout) {
    handout = createObj("handout", {
      name: HELP_HANDOUT_NAME,
    });
  }

  applyHelpContentToHandout(handout);
}

export function syncHelpHandoutOnStartup(): void {
  const handout = findHelpHandout();
  if (!handout) {
    return;
  }

  const bundledAt = getBundledHelpContentUpdatedAt();
  const stateAt = getConfig().helpContentUpdatedAt;
  if (stateAt >= bundledAt) {
    return;
  }

  applyHelpContentToHandout(handout);
}
