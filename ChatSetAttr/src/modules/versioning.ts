import type { VersionObject } from "../types";
import { v2_0 } from "../versions/2.0.0";
import { sendWelcomeMessage } from "./chat";
import { getConfig, hasFlag, setConfig, setFlag } from "./config";

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
  log("ChatSetAttr: Checking for updates...");
  const config = getConfig();
  let currentVersion = config.version || "1.10";

  log(`ChatSetAttr: Current version: ${currentVersion}`);
  if (currentVersion === 3) {
    currentVersion = "1.10";
  }

  log(`ChatSetAttr: Normalized current version: ${currentVersion}`);
  checkForUpdates(currentVersion);
};

export function checkForUpdates(currentVersion: string): void {
  for (const version of VERSION_HISTORY) {
    log(`ChatSetAttr: Evaluating version update to ${version.version} (appliesTo: ${version.appliesTo})`);
    const applies = version.appliesTo;
    const versionString = applies.replace(/(<=|<|>=|>|=)/, "").trim();
    const comparison = applies.replace(versionString, "").trim();
    const compared = compareVersions(currentVersion, versionString);

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
      version.update();
      currentVersion = version.version;
      updateVersionInState(currentVersion);
    }
  }
}

function compareVersions(v1: string, v2: string): number {
  const [major1, minor1 = 0, patch1 = 0] = v1.split(".").map(Number);
  const [major2, minor2 = 0, patch2 = 0] = v2.split(".").map(Number);

  if (major1 !== major2) {
    return major1 - major2;
  }
  if (minor1 !== minor2) {
    return minor1 - minor2;
  }
  return patch1 - patch2;
};

function updateVersionInState(newVersion: string): void {
  const config = getConfig();
  config.version = newVersion;
  setConfig(config);
};