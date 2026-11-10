// #region Commands

export const COMMAND_TYPE = [
  "setattr",
  "modattr",
  "modbattr",
  "resetattr",
  "delattr"
] as const;

export type Command = typeof COMMAND_TYPE[number];

export function isCommand(command: string): command is Command {
  return COMMAND_TYPE.includes(command as Command);
};

// #region Command Options

export const COMMAND_OPTIONS = [
  "mod",
  "modb",
  "reset"
] as const;

export type CommandOption = typeof COMMAND_OPTIONS[number];

export type OverrideDictionary = Record<CommandOption, Command>;

export const OVERRIDE_DICTIONARY: OverrideDictionary = {
  "mod": "modattr",
  "modb": "modbattr",
  "reset": "resetattr",
} as const;

export function isCommandOption(option: string): option is CommandOption {
  return COMMAND_OPTIONS.includes(option as CommandOption);
};

// #region Targets

export const TARGETS = [
  "all",
  "allgm",
  "allplayers",
  "charid",
  "name",
  "sel",
  "sel-noparty",
  "sel-party",
  "party",
] as const;

export type Target = typeof TARGETS[number];

export function isTarget(target: string): target is Target {
  return TARGETS.includes(target as Target);
};

// #region Feedback
export const FEEDBACK_OPTIONS = [
  "fb-public",
  "fb-from",
  "fb-header",
  "fb-content",
] as const;

export type FeedbackOption = typeof FEEDBACK_OPTIONS[number];

export type FeedbackObject = {
  public: boolean;
  from?: string;
  header?: string;
  content?: string;
};

export function isFeedbackOption(option: string): option is FeedbackOption {
  for (const fbOption of FEEDBACK_OPTIONS) {
    if (option.startsWith(fbOption)) return true;
  }
  return false;
};

export function extractFeedbackKey(option: string) {
  if (option === "fb-public") return "public";
  if (option === "fb-from") return "from";
  if (option === "fb-header") return "header";
  if (option === "fb-content") return "content";
  return false;
};

// #region Options
export const OPTIONS = [
  "nocreate",
  "evaluate",
  "replace",
  "silent",
  "mute",
] as const;

export type Option = typeof OPTIONS[number];

export type OptionsRecord = Record<Option, boolean>;

export function isOption(option: string): option is Option {
  return OPTIONS.includes(option as Option);
};

// #region Attributes
export type Attribute = {
  name?: string;
  current?: string | number | boolean;
  max?: string | number | boolean;
};

export type AttributeValue = string | number | boolean | undefined;

export type AttributeRecord = Record<string, AttributeValue>;

export type Modification = "increased" | "decreased" | "multiplied" | "divided" | "reset";

export type AttributeWithModification = Attribute & {
  modification: Modification,
  previous: number,
  total: number,
  current: number
};

export type AnyAttribute = Attribute | AttributeWithModification;

// #region ChangeSet
export type ChangeSetError = {
  message: string;
  target: string;
  attribute?: string;
};

export type ChangeSet = {
  operation: Command;
  targets: string[];
  completed: AnyAttribute[];
  errors: ChangeSetError[];
};

// #region Alias Characters

export const ALIAS_CHARACTERS: Record<string, string> = {
  "<": "[",
  ">": "]",
  "~": "-",
  ";": "?",
  "`": "@",
} as const;

// #region Versioning

export type VersionString =
  `${number}.${number}` |
  `${number}.${number}.${number}` |
  `${number}.${number}${string | ""}` |
  `${number}.${number}.${number}${string | ""}`;

export type VersionComparison =
  "<=" |
  "<" |
  ">=" |
  ">" |
  "=" ;

export type VersionAppliesTo = `${VersionComparison}${VersionString}`;

export type VersionObject = {
  appliesTo: VersionAppliesTo;
  version: VersionString;
  update: () => void;
};

// #region Observers

export type ObserverEvent = "add" | "change" | "destroy";

export type ObserverCallback = (event: ObserverEvent, targetID: string, attribute: string, newValue: AttributeValue, oldValue: AttributeValue) => void;

export type ObserverRecord = Record<string, ObserverCallback[]>;

// #region Timers

export type TimerMap = Map<string, ReturnType<typeof setTimeout>>;