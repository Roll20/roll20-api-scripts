import { createConfigMessage } from "../templates/config";

type ScriptConfig = {
  version: number | string;
  globalconfigCache: {
    lastsaved: number;
  };
  playersCanTargetParty: boolean;
  playersCanModify: boolean;
  playersCanEvaluate: boolean;
  useWorkers: boolean;
  flags: string[];
};

const SCHEMA_VERSION = "2.0";

const DEFAULT_CONFIG: ScriptConfig = {
  version: SCHEMA_VERSION,
  globalconfigCache: {
    lastsaved: 0
  },
  playersCanTargetParty: true,
  playersCanModify: false,
  playersCanEvaluate: false,
  useWorkers: true,
  flags: []
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
    globalconfigCache: {
      lastsaved: Date.now()
    }
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

export function handleConfigCommand(message: string) {
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
  sendChat("ChatSetAttr", configMessage, undefined, { noarchive: true });
};