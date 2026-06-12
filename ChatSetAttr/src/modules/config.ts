import { getWhisperPrefix, sendNotification } from "./chat";
import { createConfigMessage } from "../templates/config";

type ScriptConfig = {
  version: number | string;
  globalconfigCache: GlobalConfigCache;
  playersCanTargetParty: boolean;
  playersCanModify: boolean;
  playersCanEvaluate: boolean;
  useWorkers: boolean;
  helpContentUpdatedAt: number;
  flags: string[];
};

type GlobalConfigCache = Record<string, string | number> & {
  lastsaved: number;
};

type GlobalConfigRecord = Record<string, string | number | undefined> & {
  lastsaved?: number;
};

export const GLOBAL_CONFIG_OPTIONS = [
  {
    label: "Players can modify all characters",
    key: "playersCanModify",
    value: "playersCanModify",
  },
  {
    label: "Players can use --evaluate",
    key: "playersCanEvaluate",
    value: "playersCanEvaluate",
  },
  {
    label: "Trigger sheet workers when setting attributes",
    key: "useWorkers",
    value: "useWorkers",
  },
  {
    label: "Players can target party members",
    key: "playersCanTargetParty",
    value: "playersCanTargetParty",
  },
] as const;

const SCHEMA_VERSION = "2.0";

const DEFAULT_CONFIG: ScriptConfig = {
  version: SCHEMA_VERSION,
  globalconfigCache: {
    lastsaved: 0,
  },
  playersCanTargetParty: true,
  playersCanModify: false,
  playersCanEvaluate: false,
  useWorkers: true,
  helpContentUpdatedAt: 0,
  flags: [],
};

export function parseGlobalConfigCheckbox(
  g: GlobalConfigRecord,
  label: string,
  valueField: string,
): boolean {
  return g[label] === valueField;
};

function buildCacheSnapshot(g: GlobalConfigRecord): GlobalConfigCache {
  const cache: GlobalConfigCache = { lastsaved: g.lastsaved ?? 0 };
  for (const option of GLOBAL_CONFIG_OPTIONS) {
    cache[option.label] = `${g[option.label] ?? ""}`;
  }
  return cache;
};

export function checkGlobalConfig(): string[] {
  const g = globalconfig?.chatsetattr as GlobalConfigRecord | undefined;
  if (!g?.lastsaved) {
    return [];
  }

  state.ChatSetAttr = state.ChatSetAttr || {};
  const cache = (state.ChatSetAttr.globalconfigCache || { lastsaved: 0 }) as GlobalConfigCache;
  if (g.lastsaved <= cache.lastsaved) {
    return [];
  }

  const changes: string[] = [];
  for (const option of GLOBAL_CONFIG_OPTIONS) {
    const newRaw = `${g[option.label] ?? ""}`;
    const oldRaw = `${cache[option.label] ?? ""}`;
    if (newRaw === oldRaw) {
      continue;
    }

    const newValue = parseGlobalConfigCheckbox(g, option.label, option.value);
    const oldValue = getConfig()[option.key];
    if (newValue === oldValue) {
      continue;
    }

    state.ChatSetAttr[option.key] = newValue;
    changes.push(`${option.key}: ${String(oldValue)} → ${String(newValue)}`);
  }

  state.ChatSetAttr.globalconfigCache = buildCacheSnapshot(g);

  if (changes.length > 0) {
    log(`ChatSetAttr: Imported Global Config settings: ${changes.join(", ")}`);
    sendNotification(
      "ChatSetAttr Global Config",
      `<p>New settings imported from Global Config:</p><ul>${changes.map(change => `<li>${change}</li>`).join("")}</ul>`,
      false,
    );
  }

  return changes;
};

export function getConfig() {
  const stateConfig = state?.ChatSetAttr || {};
  return {
    ...DEFAULT_CONFIG,
    ...stateConfig,
  };
};

export function setConfig(newConfig: Record<string, unknown>) {
  const stateConfig = state.ChatSetAttr || {};
  state.ChatSetAttr = {
    ...stateConfig,
    ...newConfig,
  };
};

export function hasFlag(flag: string) {
  const config = getConfig();
  return config.flags.includes(flag);
};

export function setFlag(flag: string) {
  const config = getConfig();
  if (!hasFlag(flag)) {
    config.flags.push(flag);
    setConfig({ flags: config.flags });
  }
};

export function checkConfigMessage(message: string) {
  return message.startsWith("!setattr-config");
};

const FLAG_MAP: Record<string, keyof ScriptConfig> = {
  "--players-can-modify": "playersCanModify",
  "--players-can-evaluate": "playersCanEvaluate",
  "--players-can-target-party": "playersCanTargetParty",
  "--use-workers": "useWorkers",
} as const;

export function handleConfigCommand(message: string, playerID: string) {
  message = message.replace("!setattr-config", "").trim();
  const args = message.split(/\s+/);
  const newConfig: Record<string, unknown> = {};
  for (const arg of args) {
    const cleanArg = arg.toLowerCase();
    const flag = FLAG_MAP[cleanArg];
    if (flag !== undefined) {
      newConfig[flag] = !getConfig()[flag];
      log(`Toggled config option: ${flag} to ${newConfig[flag]}`);
    }
  }
  setConfig(newConfig);
  const configMessage = createConfigMessage();
  sendChat(
    "ChatSetAttr",
    `${getWhisperPrefix(playerID)}${configMessage}`,
    undefined,
    { noarchive: true },
  );
};
