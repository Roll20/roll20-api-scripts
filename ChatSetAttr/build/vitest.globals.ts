import { vi } from "vitest";
import _ from "underscore";

// Define Roll20 API interfaces
interface Roll20Object {
  id: string;
  get(property: string): any;
  set(property: string, value: any): void;
}

// Mock Roll20 API classes
export class MockObject implements Roll20Object {
  id: string = "";
  controlledby: string = "all";

  constructor(attributes: Record<string, any>) {
    Object.assign(this, attributes);
  }

  get(attr: string): any {
    if (this[attr as keyof this] === undefined) {
      return "";
    }
    return this[attr as keyof this];
  }

  set(attr: string, value: any): void {
    (this as any)[attr] = value;
  }
}

export class MockToken extends MockObject {
  _type: string = "graphic";
  represents: string;
  _pageid: string;
  _id: string;
  constructor(attributes: Record<string, any>) {
    super(attributes);
    this.represents = attributes.represents || "";
    this._pageid = attributes._pageid || "";
    this._id = attributes._id || `token_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }
  get(prop: string): string {
    if (prop === "represents") return this.represents;
    if (prop === "_pageid") return this._pageid;
    if (prop === "_id") return this._id;
    return super.get(prop);
  }
  set(prop: string, value: any): void {
    if (prop === "represents") {
      this.represents = value;
    } else if (prop === "_pageid") {
      this._pageid = value;
    } else if (prop === "_id") {
      console.warn("Setting _id is not allowed");
      return;
    }
    else {
      super.set(prop, value);
    }
  }
};

// Helper class for attributes used in tests
export type AttributeProps = {
  _characterid?: string;
  characterid?: string;
  name: string;
  current?: string;
  max?: string;
};

export class MockAttribute implements Roll20Object {
  id: string;
  _characterid: string;
  _type: string = "attribute";
  name: string;
  current?: string;
  max?: string;

  constructor(props: AttributeProps) {
    this.id = `attr_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    this._characterid = props._characterid || props.characterid || "";
    this.name = props.name;
    this.current = props.current || "";
    this.max = props.max;
  }

  get(prop: string): string | undefined {
    if (prop === "_characterid") return this._characterid;
    if (prop === "name") return this.name;
    if (prop === "current") return this.current;
    if (prop === "max") return this.max;
    return "";
  }

  set(prop: string | Record<string, any>, value?: any): MockAttribute {
    if (typeof prop === "object") {
      const entries = Object.entries(prop);
      for (const [key, val] of entries) {
        if (key === "_characterid" || key === "characterid") {
          console.warn("Setting _characterid or characterid is not allowed");
          continue;
        }
        (this as any)[key] = val;
      }
    } else {
      (this as any)[prop] = value;
    }
    return this;
  }

  setWithWorker(prop: Record<string, any>): MockAttribute {
    const entries = Object.entries(prop);
    for (const [key, val] of entries) {
      if (key === "current" || key === "max") {
        if (!this) {
          console.error("MockAttribute is not defined");
          console.trace();
          return this;
        }
        this[key] = val;
      }
    }
    return this;
  }

  remove(): void {
    const index = global.attributes.indexOf(this);
    if (index > -1) {
      global.attributes.splice(index, 1);
    }
  }
}

// Helper class for characters
export class MockCharacter implements Roll20Object {
  id: string;
  name: string;
  controlledby: string;
  type: string;

  constructor(id: string, name: string, controlledby: string = "") {
    this.id = id;
    this.name = name;
    this.controlledby = controlledby;
    this.type = "character";
  }

  get(prop: string): string {
    if (prop === "name") return this.name;
    if (prop === "controlledby") return this.controlledby;
    return "";
  }

  set(prop: string, value: any): void {
    (this as any)[prop] = value;
  }
}

// Define the global namespace with Roll20 API types
declare global {
  var state: Record<string, any>;
  var globalconfig: Record<string, any>;
  var attributes: MockAttribute[];
  var characters: MockCharacter[];
  var selectedTokens: MockToken[];
  var returnObjects: any[];
  var watchers: Record<string, Function[]>;
  var trigger: (event: string, ...args: any[]) => void;
  var inputQueue: string[];
  var executeCommand: (command: string, selectedIds?: string[], options?: ExecuteCommandOptions) => Roll20ChatMessage;
  var setupTestEnvironment: () => void;
}

interface ExecuteCommandOptions {
  playerId?: string;
  playerName?: string;
  whisperTo?: string;
}

// Create global collections for test data
global.attributes = [];
global.characters = [];
global.selectedTokens = [];

// Basic Roll20 API mocks
global.log = vi.fn();
global.state = {};
global.globalconfig = {};
global.sendChat = vi.fn();
global._ = _;
global.returnObjects = [];
global.getAttrByName = vi.fn((charId: string, attrName: string, valueType: string = "current") => {
  const attr = global.attributes.find(a => a._characterid === charId && a.name === attrName);
  return attr ? attr[valueType as keyof MockAttribute]?.toString() || "" : "";
});

global.getSheetItem = vi.fn(async (charId: string, attrName: string, valueType: string = "current") => {
  const attr = global.attributes.find(a => a._characterid === charId && a.name === attrName);
  if (!attr) return undefined;
  const value = valueType === "current" ? attr.get("current") : attr.get("max");
  return value;
});

global.setSheetItem = vi.fn(async (charId: string, attrName: string, value: any, valueType: string = "current") => {
  const attr = global.attributes.find(a => a._characterid === charId && a.name === attrName);

  if (attr) {
    // Update existing attribute
    if (valueType === "max") {
      attr.max = value?.toString() || "";
    } else {
      attr.current = value?.toString() || "";
    }
  } else {
    // Create new attribute if it doesn't exist
    const newAttr = new MockAttribute({
      _characterid: charId,
      name: attrName,
    });

    if (valueType === "max") {
      newAttr.max = value?.toString() || "";
    } else {
      newAttr.current = value?.toString() || "";
    }

    global.attributes.push(newAttr);
  }

  return true;
});

global.getObj = vi.fn((type: string, id: string) => {
  if (type === "character") {
    return global.characters.find(c => c.id === id);
  } else if (type === "attribute") {
    return global.attributes.find(a => a.id === id);
  } else if (type === "graphic") {
    return global.selectedTokens.find(t => t.id === id);
  }
  return null;
}) as any;

global.findObjs = vi.fn((query: Record<string, any>) => {
  if (query._type === "character") {
    if (query.name) {
      return global.characters.filter(c => c.name.toLowerCase() === query.name.toLowerCase());
    }
    return [...global.characters];
  } else if (query._type === "attribute") {
    return global.attributes.filter((a) => {
      const allMatch = Object.entries(query).every(([key, value]) => {
        return a[key as keyof MockAttribute] === value;
      });
      return allMatch;
    });
  }
  return [];
}) as any;

global.createObj = vi.fn((type: string, props: Record<string, any>) => {
  if (type === "attribute") {
    const newAttr = new MockAttribute(props as AttributeProps);
    global.attributes.push(newAttr);
    return newAttr;
  }
  if (type === "character") {
    const newChar = new MockCharacter(props.id, props.name, props.controlledby);
    global.characters.push(newChar);
    return newChar;
  }
  if (type === "graphic") {
    const newToken = new MockToken({
      represents: props.represents || "",
      _pageid: props._pageid || "",
      _id: props._id || `token_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      controlledby: props.controlledby || "all",
      ...props
    });
    global.selectedTokens.push(newToken);
    return newToken;
  }
  return null;
}) as any;

global.playerIsGM = vi.fn(() => true);

global.inputQueue = [];

// Set up event handling with subscribers
global.watchers = {};

global.on = vi.fn((event, callback) => {
  global.watchers[event] = global.watchers[event] || [];
  global.watchers[event].push(callback);
});

// Helper function to execute a chat command
global.executeCommand = (command: string, selectedIds: string[] = [], options: ExecuteCommandOptions = {}): Roll20ChatMessage => {
  const { attributes, selectedTokens, inputQueue } = global;
  const { playerId = "gm123", playerName = "GM", whisperTo = "" } = options;

  // Replace all @{selected|...} with the respective attribute values
  command = command.replace(/@\{selected\|([^}]+)\}/g, (_, attrName) => {
    // Get the token and then find its character"s attribute
    const charId = selectedIds.length > 0 ?
      selectedTokens.find(t => t.id === selectedIds[0])?.represents : null;

    if (!charId) return "";

    const attr = attributes.find(a => a._characterid === charId && a.name === attrName);
    return attr?.current ? attr.current : "";
  });

  // Replace all @{...} with the respective attribute values
  command = command.replace(/@\{(?:([^|}]+)\|)?([^}]+)\}/g, (_, identifier, attrName) => {
    if (identifier) {
      // Format: @{characterid|attrName}
      const attr = attributes.find(a => a._characterid === identifier && a.name === attrName);
      return attr?.current ? attr.current : "";
    } else {
      // Format: @{attrName} (use first matching attribute)
      const attr = attributes.find(a => a.name === attrName);
      return attr?.current ? attr.current : "";
    }
  });

  // Replace all ?{...} with values from our input queue
  command = command.replace(/\[\[\?{[^}]*\|?\d*}\]\]/g, () => {
    return inputQueue.length > 0 ? inputQueue.shift() || "0" : "0";
  });

  const inlinerolls: RollResult = [];

  // Replace all inline rolls

  command = command.replace(/\[\[([^\]]+)\]\]/g, (whole, inline: string) => {
    let expression = inline.trim();
    const rollsData: RollData = {
      expression: inline,
      results: {
        resultType: "sum",
        rolls: [],
        total: 0,
        type: "V",
      },
      rollid: `roll_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      signature: "test_signature",
    };
    // find all dice notation in the inline roll
    const diceNotation = inline.matchAll(/(\d+)?d(\d+)/g);
    for (const match of diceNotation) {
      const numDice = parseInt(match[1] || "1", 10);
      const numSides = parseInt(match[2], 10);
      if (isNaN(numDice) || isNaN(numSides) || numDice <= 0 || numSides <= 0) {
        continue; // Invalid roll format, skip
      }
      // Calculate average value for the roll
      const averageValue = Math.round(numSides / 2);
      const totalValue = numDice * averageValue;
      rollsData.results!.rolls.push({
        dice: numDice,
        results: Array.from({ length: numDice }).map(() => ({ v: averageValue })),
        sides: numSides,
        type: "R",
      });
      expression = expression.replace(match[0], totalValue.toString());
    }
    // resolve total
    try {
      const total = eval(expression);
      rollsData.results!.total = total;
      inlinerolls.push(rollsData);
      // replace the inline roll with a reference to the inlinerolls array
      const index = inlinerolls.length - 1;
      return `$[[${index}]]`;
    } catch (error) {
      console.error("Error evaluating inline roll expression:", expression, error);
      return whole;
    }
  });

  // Create the message object
  const msg: Roll20ChatMessage = {
    type: command.startsWith("!") ? "api" : "general",
    content: command,
    playerid: playerId,
    who: whisperTo ? `${playerName} -> ${whisperTo}` : playerName,
    selected: selectedIds.map(id => ({ _id: id })) as any as Roll20Graphic["properties"][],
    inlinerolls,
  };

  // Notify subscribers first (this simulates the Roll20 event system)
  for (const watcher of global.watchers["chat:message"]) {
    watcher(msg);
  }

  return msg;
};

// Helper function to set up test environment
global.setupTestEnvironment = (): void => {
  // Reset collections
  global.attributes = [];
  global.characters = [];
  global.selectedTokens = [];
  global.inputQueue = [];
  global.watchers = {};

  // Reset returnObjects
  global.returnObjects = [];

  // Set up ChatSetAttr state
  global.state.ChatSetAttr = {
    version: 3,
    globalconfigCache: { lastsaved: 0 },
    playersCanModify: false,
    playersCanEvaluate: false,
    useWorkers: false
  };
};
