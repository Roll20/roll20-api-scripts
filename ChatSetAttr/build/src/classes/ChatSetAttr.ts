import { ConfigCommand, DelAttrCommand, ModAttrCommand, ModBAttrCommand, ResetAttrCommand, SetAttrCommand, type CommandStrategy } from "./Commands";
import { CommandType, InputParser, Flags, Commands } from "./InputParser";
import type { Option, Command } from "./InputParser";
import { TargetAllCharacters, TargetAllGMCharacters, TargetByName, TargetByID, TargetBySelection, TargetAllPlayerCharacters } from "./Targets";
import type { TargetIdentifier, TargetStrategies } from "./Targets";
import { globalSubscribeManager } from "./SubscriptionManager";
import { ChatOutput } from "./ChatOutput";
import { TimerManager } from "./TimerManager";

export type Feedback = {
  header?: string;
  content?: string;
  sender?: string;
  whisper?: boolean;
};

const VERSION = "1.11";
const SCHEMA_VERSION = 4;

export const SCRIPT_STRINGS = {
  CAN_MODIFY: "Players can modify all characters",
  CAN_EVAL: "Players can use --evaluate",
  USE_WORKERS: "Trigger sheet workers when setting attributes",
};

export class ChatSetAttr {
  private InputParser: InputParser;
  private errors: string[] = [];
  private messages: string[] = [];

  constructor() {
    this.InputParser = new InputParser();
    this.registerEventHandlers();
  };

  private async handleChatMessage(msg: Roll20ChatMessage) {
    const {
      commandType,
      command,
      flags,
      attributes
    } = this.InputParser.parse(msg);

    // #region Command
    if (commandType === CommandType.NONE || !command) {
      return;
    }

    const actualCommand = this.overrideCommandFromOptions(flags, command);
    const commandHandler = this.getCommandHandler(actualCommand);

    if (!commandHandler) {
      this.errors.push(`Command ${actualCommand} not found.`);
      this.sendMessages();
      return;
    }

    // #region Targets
    const targets = this.getTargets(msg, flags);
    if (targets.length === 0 && actualCommand !== Commands.SET_ATTR_CONFIG) {
      this.errors.push(`No valid targets found for command ${actualCommand}.`);
      this.sendMessages();
      return;
    }

    // #region Act
    TimerManager.start("chatsetattr", 8000, this.sendDelayMessage);
    const response = await commandHandler.execute(flags, targets, attributes, msg);
    TimerManager.stop("chatsetattr");

    // #region Messages
    const feedback = this.extractFeedback(flags);
    this.messages.push(...response.messages);
    this.errors.push(...response.errors);
    const isSilent = flags.some(flag => flag.name === Flags.SILENT);
    if (isSilent) {
      this.messages = [];
    }
    const isMuted = flags.some(flag => flag.name === Flags.MUTE);
    if (isMuted) {
      this.messages = [];
      this.errors = [];
    }
    if (response.errors.length > 0 || response.messages.length > 0) {
      this.sendMessages(feedback);
      return;
    }
  };

  private overrideCommandFromOptions(flags: Option[], command: Command): Command {
    const commandFlags = [Flags.MOD, Flags.MOD, Flags.MOD_B, Flags.RESET, Flags.DEL];
    type CommandFlags = typeof commandFlags[number];
    const commandOptions = flags
      .filter(flag => commandFlags.includes(flag.name as CommandFlags))
      .map(flag => flag.name as CommandFlags);
    const commandOverride = commandOptions[0];
    switch (commandOverride) {
      case Flags.MOD:
        return Commands.MOD_ATTR;
      case Flags.MOD_B:
        return Commands.MOD_B_ATTR;
      case Flags.RESET:
        return Commands.RESET_ATTR;
      case Flags.DEL:
        return Commands.DEL_ATTR;
      default:
        return command;
    };
  };

  private getCommandHandler(command: Command): CommandStrategy {
    switch (command) {
      case Commands.SET_ATTR:
        return new SetAttrCommand();
      case Commands.MOD_ATTR:
        return new ModAttrCommand();
      case Commands.MOD_B_ATTR:
        return new ModBAttrCommand();
      case Commands.RESET_ATTR:
        return new ResetAttrCommand();
      case Commands.DEL_ATTR:
        return new DelAttrCommand();
      case Commands.SET_ATTR_CONFIG:
        return new ConfigCommand();
      default:
        throw new Error(`Command ${command} not found.`);
    };
  };

  private getTargets(msg: Roll20ChatMessage, flags: Option[]): Roll20Character[] {
    const target = this.targetFromOptions(flags);
    log(`[ChatSetAttr] Target strategy: ${target}`);
    if (!target) {
      return [];
    }
    const targetStrategy = this.getTargetStrategy(target);
    log(`[ChatSetAttr] Target message: ${msg.selected}`);
    const targets = this.getTargetsFromOptions(target, flags, msg.selected);
    log(`[ChatSetAttr] Targets: ${targets.join(", ")}`);
    const [validTargets, { messages, errors }] = targetStrategy.parse(targets, msg.playerid);
    this.messages.push(...messages);
    this.errors.push(...errors);
    return validTargets;
  };

  private getTargetsFromOptions(target: TargetStrategies, flags: Option[], selected: Roll20ChatMessage["selected"]): string[] {
    switch (target) {
      case "all":
        return [];
      case "allgm":
        return [];
      case "allplayers":
        return [];
      case "name":
        const nameFlag = flags.find(flag => flag.name === Flags.CHAR_NAME);
        if (!nameFlag?.value) {
          this.errors.push(`Target 'name' requires a name flag.`);
          return [];
        }
        const names = nameFlag.value.split(",").map(name => name.trim());
        return names;
      case "charid":
        const idFlag = flags.find(flag => flag.name === Flags.CHAR_ID);
        if (!idFlag?.value) {
          this.errors.push(`Target 'charid' requires an ID flag.`);
          return [];
        }
        const ids = idFlag.value.split(",").map(id => id.trim());
        return ids;
      case "sel":
        if (!selected || selected.length === 0) {
          this.errors.push(`Target 'sel' requires selected tokens.`);
          return [];
        }
        const selectedIDs = this.convertObjectsToIDs(selected);
        return selectedIDs;
      default:
        this.errors.push(`Target strategy ${target} not found.`);
        return [];
    }
  };

  private convertObjectsToIDs(objects: { _id: string }[] | undefined): string[] {
    if (!objects) return [];
    const ids = objects.map(object => object._id);
    return ids;
  };

  private getTargetStrategy(target: TargetStrategies): TargetIdentifier {
    switch (target) {
      case "all":
        return new TargetAllCharacters();
      case "allgm":
        return new TargetAllGMCharacters();
      case "allplayers":
        return new TargetAllPlayerCharacters();
      case "name":
        return new TargetByName();
      case "charid":
        return new TargetByID();
      case "sel":
        return new TargetBySelection();
      default:
        throw new Error(`Target strategy ${target} not found.`);
    }
  };

  private targetFromOptions(flags: Option[]): TargetStrategies | false {
    const targetFlags = [Flags.ALL, Flags.ALL_GM, Flags.ALL_PLAYERS, Flags.CHAR_ID, Flags.CHAR_NAME, Flags.SELECTED];
    const targetOptions = flags
      .filter(flag => targetFlags.includes(flag.name as TargetStrategies))
      .map(flag => flag.name as TargetStrategies);
    const targetOverride = targetOptions[0];
    return targetOverride || false;
  };

  private sendMessages(feedback?: Feedback | null) {
    const sendErrors = this.errors.length > 0;
    const from = feedback?.sender || "ChatSetAttr";
    const whisper = feedback?.whisper ?? true;
    if (sendErrors) {
      const header = "ChatSetAttr Error";
      const content = this.errors.map(error => error.startsWith("<") ? error : `<p>${error}</p>`).join("");
      const error = new ChatOutput({
        header,
        content,
        from,
        type: "error",
        whisper,
      });
      error.send();
      this.errors = [];
      this.messages = [];
    }
    const sendMessage = this.messages.length > 0 || feedback;
    if (!sendMessage) {
      return;
    }
    const header = feedback?.header || "ChatSetAttr Info";
    const type = this.errors.length > 0 ? "error" : "info";
    const messageContent = this.messages.map(message => message.startsWith("<") ? message : `<p>${message}</p>`).join("");
    const content = (feedback?.content || "") + messageContent;
    const message = new ChatOutput({ header, content, from, type, whisper });
    message.send();
    this.errors = [];
    this.messages = [];
  };

  private sendDelayMessage() {
    const message = new ChatOutput({
      header: "ChatSetAttr",
      content: "Your command is taking a long time to execute. Please be patient, the process will finish eventually.",
      from: "ChatSetAttr",
      type: "info",
      whisper: true
    });
    message.send();
  };

  private extractFeedback(flags: Option[]): Feedback | null {
    const hasFeedback = flags.some(flag => flag.name === Flags.FB_CONTENT || flag.name === Flags.FB_HEADER || flag.name === Flags.FB_FROM || flag.name === Flags.FB_PUBLIC);
    if (!hasFeedback) {
      return null;
    }
    const headerFlag = flags.find(flag => flag.name === Flags.FB_HEADER);
    const fromFlag = flags.find(flag => flag.name === Flags.FB_FROM);
    const publicFlag = flags.find(flag => flag.name === Flags.FB_PUBLIC);
    const header = headerFlag?.value;
    const sender = fromFlag?.value;
    const whisper = publicFlag === undefined;
    return {
      header,
      sender,
      whisper,
    };
  };

  public static checkInstall() {
    log(`[ChatSetAttr] Version: ${VERSION}`);
    if (state.ChatSetAttr?.version !== SCHEMA_VERSION) {
      log(`[ChatSetAttr] Updating Schema to v${SCHEMA_VERSION}`);
      state.ChatSetAttr = {
        version: SCHEMA_VERSION,
        globalconfigCache: {
          lastSaved: 0,
        },
        playersCanModify: false,
        playersCanEvaluate: false,
        useWorkers: true,
      };
    }
    this.checkGlobalConfig();
  };

  private static checkGlobalConfig() {
    const localState = state.ChatSetAttr;
    const globalState = globalconfig?.chatsetattr ?? {};
    const lastSavedGlobal = globalState?.lastSaved || 0;
    const lastSavedLocal = localState.globalconfigCache?.lastSaved || 0;
    if (lastSavedGlobal > lastSavedLocal) {
      const date = new Date(lastSavedGlobal * 1000);
      log(`[ChatSetAttr] Updating local state from global config (last saved: ${date.toISOString()})`);
    }
    state.ChatSetAttr = {
      ...localState,
      playersCanModify: "playersCanModify" === globalState[SCRIPT_STRINGS.CAN_MODIFY],
      playersCanEvaluate: "playersCanEvaluate" === globalState[SCRIPT_STRINGS.CAN_EVAL],
      useWorkers: "useWorkers" === globalState[SCRIPT_STRINGS.USE_WORKERS],
      globalconfigCache: {
        ...globalState
      }
    }
  };

  private registerEventHandlers() {
    on("chat:message", (...args) => this.handleChatMessage(...args));
    ChatSetAttr.checkInstall();
  };

  public static registerObserver(event: string, callback: Function) {
    globalSubscribeManager.subscribe(event, callback);
  };

  public static unregisterObserver(event: string, callback: Function) {
    globalSubscribeManager.unsubscribe(event, callback);
  };
};
