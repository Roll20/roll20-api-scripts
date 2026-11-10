declare interface StateConfig {
  version: number;
  globalconfigCache: {
    lastsaved: number;
  };
  playersCanModify: boolean;
  playersCanEvaluate: boolean;
  useWorkers: boolean;
}

declare interface MockAttribute {
  id: string;
  _type: string;
  _characterid: string;
  name: string;
  current: string;
  max?: string;
  get(property: string): string;
  set(values: Record<string, string>): void;
  setWithWorker(values: Record<string, string>): void;
  remove(): void;
}

declare interface ObserverFunction {
  (attribute: MockAttribute, previousValues?: Record<string, string>): void;
}

declare interface RepeatingData {
  regExp: RegExp[];
  toCreate: string[];
  sections: string[];
}

declare interface AttributeValue {
  current?: string;
  max?: string;
  fillin?: boolean;
  repeating: any | false;
}

declare interface CommandOptions {
  all?: boolean;
  allgm?: boolean;
  charid?: string;
  name?: string;
  allplayers?: boolean;
  sel?: boolean;
  deletemode?: boolean;
  replace?: boolean;
  nocreate?: boolean;
  mod?: boolean;
  modb?: boolean;
  evaluate?: boolean;
  silent?: boolean;
  reset?: boolean;
  mute?: boolean;
  "fb-header"?: string;
  "fb-content"?: string;
  "fb-from"?: string;
  "fb-public"?: boolean;
  [key: string]: any;
}

declare const ChatSetAttr: {
  /**
   * Checks if the script is properly installed and updates state if needed
   */
  checkInstall(): void;

  /**
   * Registers an observer function for attribute events
   * @param event Event type: "add", "change", or "destroy"
   * @param observer Function to call when event occurs
   */
  registerObserver(event: "add" | "change" | "destroy", observer: ObserverFunction): void;

  /**
   * Registers event handlers for the module
   */
  registerEventHandlers(): void;

  /**
   * Testing methods - only available for internal use
   */
  testing: {
    isDef(value: any): boolean;
    getWhisperPrefix(playerid: string): string;
    sendChatMessage(msg: string, from?: string): void;
    setAttribute(attr: MockAttribute, value: Record<string, string>): void;
    handleErrors(whisper: string, errors: string[]): void;
    showConfig(whisper: string): void;
    getConfigOptionText(o: { name: string; command: string; desc: string }): string;
    getCharNameById(id: string): string;
    escapeRegExp(str: string): string;
    htmlReplace(str: string): string;
    processInlinerolls(msg: { content: string; inlinerolls?: any[] }): string;
    notifyAboutDelay(whisper: string): number;
    getCIKey(obj: Record<string, any>, name: string): string | false;
    generatelibUUID(): string;
    generateRowID(): string;
    delayedGetAndSetAttributes(whisper: string, list: string[], setting: Record<string, AttributeValue>, errors: string[], rData: RepeatingData, opts: CommandOptions): void;
    setCharAttributes(charid: string, setting: Record<string, AttributeValue>, errors: string[], feedback: string[], attrs: Record<string, MockAttribute>, opts: CommandOptions): void;
    fillInAttrValues(charid: string, expression: string): string;
    getCharAttributes(charid: string, setting: Record<string, AttributeValue>, errors: string[], rData: RepeatingData, opts: CommandOptions): Record<string, MockAttribute>;
    getCharStandardAttributes(charid: string, attrNames: string[], errors: string[], opts: CommandOptions): Record<string, MockAttribute>;
    getCharRepeatingAttributes(charid: string, setting: Record<string, AttributeValue>, errors: string[], rData: RepeatingData, opts: CommandOptions): Record<string, MockAttribute>;
    delayedDeleteAttributes(whisper: string, list: string[], setting: Record<string, AttributeValue>, errors: string[], rData: RepeatingData, opts: CommandOptions): void;
    deleteCharAttributes(charid: string, attrs: Record<string, MockAttribute>, feedback: Record<string, string[]>): void;
    parseOpts(content: string, hasValue: string[]): CommandOptions;
    parseAttributes(args: string[], opts: CommandOptions, errors: string[]): [Record<string, AttributeValue>, RepeatingData];
    getRepeatingData(name: string, globalData: any, opts: CommandOptions, errors: string[]): any | null;
    checkPermissions(list: string[], errors: string[], playerid: string, isGM: boolean): string[];
    getIDsFromTokens(selected: any[] | undefined): string[];
    getIDsFromNames(charNames: string, errors: string[]): string[];
    sendFeedback(whisper: string, feedback: string[], opts: CommandOptions): void;
    sendDeleteFeedback(whisper: string, feedback: Record<string, string[]>, opts: CommandOptions): void;
    handleCommand(content: string, playerid: string, selected: any[] | undefined, pre: string): void;
    handleInlineCommand(msg: { content: string; playerid: string; selected?: any[]; inlinerolls?: any[] }): void;
    handleInput(msg: { type: string; content: string; playerid: string; selected?: any[]; inlinerolls?: any[] }): void;
    notifyObservers(event: "add" | "change" | "destroy", obj: MockAttribute, prev?: Record<string, string>): void;
    checkGlobalConfig(): void;
  };
};

export default ChatSetAttr;
