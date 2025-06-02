import { vi } from "vitest";
import _ from "underscore";

// Define Roll20 API interfaces
interface Roll20Object {
  id: string;
  get(property: string): any;
  set(property: string, value: any): void;
}

interface ChatMessage {
  type: string;
  content: string;
  playerid: string;
  who: string;
  selected?: Array<{_id: string}>;
}

interface Token {
  id: string;
  represents: string;
  get(property: string): string;
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
  var selectedTokens: Token[];
  var returnObjects: any[];
  var watchers: Record<string, Function[]>;
  var trigger: (event: string, ...args: any[]) => void;
  var inputQueue: string[];
  var executeCommand: (command: string, selectedIds?: string[], options?: ExecuteCommandOptions) => ChatMessage;
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
    const newToken = {
      id: props.id,
      represents: props.represents,
      get: (prop: string): string => prop === "represents" ? props.represents : ""
    };
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
global.executeCommand = (command: string, selectedIds: string[] = [], options: ExecuteCommandOptions = {}): ChatMessage => {
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
  command = command.replace(/@\{([^|}]+)\|([^}]+)\}/g, (_, charId, attrName) => {
    const attr = attributes.find(a => a._characterid === charId && a.name === attrName);
    return attr?.current ? attr.current : "";
  });

  // Replace all ?{...} with values from our input queue
  command = command.replace(/\[\[\?{[^}]*\|?\d*}\]\]/g, () => {
    return inputQueue.length > 0 ? inputQueue.shift() || "0" : "0";
  });

  // Evaluate formulas in [[...]]
  command = command.replace(/\[\[([^\]]+)\]\]/g, (_, formula) => {
    try {
      // Use Function constructor to safely evaluate the formula
      const result = new Function(`return (${formula});`)();
      return result.toString();
    } catch (error) {
      // If evaluation fails, return the original formula
      console.log(`Failed to evaluate formula: ${formula}`, error);
      return formula;
    }
  });

  // Create the message object
  const msg: ChatMessage = {
    type: command.startsWith("!") ? "api" : "general",
    content: command,
    playerid: playerId,
    who: whisperTo ? `${playerName} -> ${whisperTo}` : playerName,
    selected: selectedIds.map(id => ({ _id: id }))
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
