import type { AttributeDelta, DeltasObject } from "./APIWrapper";

export const CommandType = {
  NONE: -1,
  API: 0,
  INLINE: 1,
} as const;

type CommandType = typeof CommandType[keyof typeof CommandType];

export const Commands = {
  SET_ATTR_CONFIG: "setattr-config",
  RESET_ATTR: "resetattr",
  SET_ATTR: "setattr",
  DEL_ATTR: "delattr",
  MOD_ATTR: "modattr",
  MOD_B_ATTR: "modbattr",
} as const;

export type Command = typeof Commands[keyof typeof Commands];

export const Flags = {
  // Targeting Modes
  ALL: "all",
  ALL_GM: "allgm",
  ALL_PLAYERS: "allplayers",
  CHAR_ID: "charid",
  CHAR_NAME: "name",
  SELECTED: "sel",

  // Command Modes
  MOD: "mod",
  MOD_B: "modb",
  RESET: "reset",
  DEL: "del",

  // Modifiers
  SILENT: "silent",
  MUTE: "mute",
  REPLACE: "replace",
  NO_CREATE: "nocreate",
  EVAL: "evaluate",

  // Feedback
  FB_PUBLIC: "fb-public",
  FB_FROM: "fb-from",
  FB_HEADER: "fb-header",
  FB_CONTENT: "fb-content",

  // Config
  PLAYERS_CAN_MODIFY: "players-can-modify",
  PLAYERS_CAN_EVALUATE: "players-can-evaluate",
  USE_WORKERS: "use-workers",
} as const;

export type Flag = typeof Flags[keyof typeof Flags];

export type Option = {
  name: Flag | string;
  value?: string;
};

export type ParseResult = {
  commandType: CommandType;
  command: Command | null;
  flags: Option[];
  attributes: DeltasObject;
};

export class InputParser {
  private commands: Command[] = Object.values(Commands);
  private flags: Flag[] = Object.values(Flags);
  private commandPrefix: string = "!";
  private commandSuffix: string = "!!!";
  private optionPrefix: string = "--";

  constructor() {};

  public parse(input: string): ParseResult {
    for (const command of this.commands) {
      const commandString = `${this.commandPrefix}${command}`;
      if (input.startsWith(commandString)) {
        return this.parseAPICommand(command, input, CommandType.API);
      }
      const regex = new RegExp(`(${this.commandPrefix}${command}.*)${this.commandSuffix}`);
      const match = input.match(regex);
      if (match) {
        return this.parseAPICommand(command, match[1], CommandType.INLINE);
      }
    }
    return {
      commandType: CommandType.NONE,
      command: null,
      flags: [],
      attributes: {},
    };
  };

  private parseAPICommand(command: Command, input: string, type: CommandType): ParseResult {
    const { flags, attributes } = this.extractOptions(input, command);
    return {
      commandType: type,
      command: command as Command,
      flags,
      attributes,
    };
  };

  private extractOptions(input: string, command: string): { flags: Option[]; attributes: DeltasObject } {
    const attributes: DeltasObject = {};
    const flags: Option[] = [];
    const commandString = `${this.commandPrefix}${command} `;
    const optionsString = input.slice(commandString.length).trim();
    const allOptions = optionsString.split(this.optionPrefix).map(opt => opt.trim()).filter(opt => !!opt);
    for (const option of allOptions) {
      const isFlag = this.flags.some(flag => option.startsWith(flag));
      if (isFlag) {
        const flag = this.parseFlag(option);
        if (flag) {
          flags.push(flag);
        }
      }
      else {
        const { name, attribute } = this.parseAttribute(option) ?? {};
        if (attribute && name) {
          attributes[name] = attribute;
        }
      }
    }
    return { flags, attributes };
  };

  private parseFlag(option: string): Option | null {
    const [name, ...values] = option.split(" ").map(opt => opt.trim());
    const value = values.join(" ");
    return {
      name: this.stripChars(name),
      value: this.stripChars(value),
    };
  };

  private parseAttribute(option: string): { attribute: AttributeDelta, name: string } | null {
    const split = option.split(/(?<!\\)[\|#]/).map(opt => opt.trim());
    const rationalized = split.map(p => {
      p = this.stripChars(p);
      if (!p || p === "") {
        return null;
      }
      return p;
    });
    const [name, value, max] = rationalized;
    if (!name) {
      return null;
    }
    const attribute: AttributeDelta = {
    };
    if (value) {
      attribute.value = value;
    }
    if (max) {
      attribute.max = max;
    }
    return {
      attribute,
      name,
    }
  };

  private stripQuotes(str: string): string {
    return str.replace(/["'](.*)["']/g, "$1");
  }

  private stripBackslashes(str: string): string {
    return str.replace(/\\/g, "");
  }

  private stripChars(str: string): string {
    const noSlashes = this.stripBackslashes(str);
    const noQuotes = this.stripQuotes(noSlashes);
    return noQuotes;
  }
};
