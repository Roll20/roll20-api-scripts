import scriptJson from "../../script.json" assert { type: "json" };
import { getWhisperPrefix, sendNotification } from "./chat";
import { createConfigMessage } from "../templates/config";

export const STATE_SCHEMA_VERSION = 4;

type ScriptConfig = {
  version: number;
  scriptVersion: string;
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

const DEFAULT_CONFIG: ScriptConfig = {
  version: STATE_SCHEMA_VERSION,
  scriptVersion: scriptJson.version,
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

export function getStateSchemaVersion(raw: unknown): number {
  if (raw === undefined || raw === null) {
    return 0;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && /^\d+$/.test(raw.trim())) {
      return parsed;
    }
    return 0;
  }
  return 0;
}

function ensureChatSetAttrState(): Record<string, unknown> {
  if (!state.ChatSetAttr) {
    state.ChatSetAttr = {};
  }
  return state.ChatSetAttr;
}

export function getPersistedSchemaVersion(): number {
  return getStateSchemaVersion(state.ChatSetAttr?.version);
}

export function persistStateVersionMetadata(): void {
  const raw = ensureChatSetAttrState();
  const schemaVersion = getStateSchemaVersion(raw.version);

  if (schemaVersion > 0 && raw.version !== schemaVersion) {
    raw.version = schemaVersion;
  }

  if (!Object.hasOwn(raw, "scriptVersion") || raw.scriptVersion !== scriptJson.version) {
    raw.scriptVersion = scriptJson.version;
  }
}

export function syncScriptVersion(): void {
  persistStateVersionMetadata();
}

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
  Object.assign(ensureChatSetAttrState(), newConfig);
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
