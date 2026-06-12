import type { VersionObject } from "../types";
import { v2_0 } from "../versions/2.0.0";
import { sendWelcomeMessage } from "./chat";
import {
  getPersistedSchemaVersion,
  hasFlag,
  persistStateVersionMetadata,
  setConfig,
  setFlag,
} from "./config";

const VERSION_HISTORY: VersionObject[] = [
  v2_0,
];

export function welcome() {
  const hasWelcomed = hasFlag("welcome");
  if (hasWelcomed) { return; }

  sendWelcomeMessage();
  setFlag("welcome");
};

export function update() {
  log("ChatSetAttr: Checking for state schema updates...");
  const currentSchemaVersion = getPersistedSchemaVersion();

  log(`ChatSetAttr: Current state schema version: ${currentSchemaVersion}`);
  checkForUpdates(currentSchemaVersion);
  persistStateVersionMetadata();
};

export function checkForUpdates(currentSchemaVersion: number): void {
  for (const migration of VERSION_HISTORY) {
    log(`ChatSetAttr: Evaluating schema migration to ${migration.version} (appliesTo: ${migration.appliesTo})`);
    const applies = migration.appliesTo;
    const threshold = Number(applies.replace(/(<=|<|>=|>|=)/, "").trim());
    const comparison = applies.replace(String(threshold), "").trim();
    const compared = compareSchemaVersions(currentSchemaVersion, threshold);

    let shouldApply = false;
    switch (comparison) {
      case "<=":
        shouldApply = compared <= 0;
        break;
      case "<":
        shouldApply = compared < 0;
        break;
      case ">=":
        shouldApply = compared >= 0;
        break;
      case ">":
        shouldApply = compared > 0;
        break;
      case "=":
        shouldApply = compared === 0;
        break;
    }

    if (shouldApply) {
      migration.update();
      currentSchemaVersion = migration.version;
      updateVersionInState(currentSchemaVersion);
    }
  }
}

function compareSchemaVersions(current: number, threshold: number): number {
  return current - threshold;
}

function updateVersionInState(newSchemaVersion: number): void {
  setConfig({ version: newSchemaVersion });
}
