import { APIWrapper, type AttributeDelta, type DeltasObject } from "./APIWrapper";
import { UUID } from "./UUIDs";

export type RepeatingData = {
  [section: string]: {
    [repeatingID: string]: DeltasObject;
  };
};

export type RepeatingOrders = {
  [section: string]: string[];
};

export type AllRepeating = {
  repeatingData: RepeatingData;
  repeatingOrders: RepeatingOrders;
};

export type AttributesManagerOptions = {
  useEval?: boolean;
  useParse?: boolean;
  useModify?: boolean;
  useConstrain?: boolean;
  useReplace?: boolean;
};

const REPLACEMENTS = {
  "<": "[",
  ">": "]",
  "\lbrak": "[",
  "\rbrak": "]",
  ";": "?",
  "\ques": "?",
  "`": "@",
  "\at": "@",
  "~": "-",
  "\dash": "-",
};

export class AttrProcessor {
  public character: Roll20Character;
  public delta: DeltasObject;
  public final: DeltasObject;
  public attributes: Roll20Attribute[];
  public repeating: AllRepeating;
  public eval: boolean;
  public parse: boolean;
  public modify: boolean;
  public constrain: boolean;
  public replace: boolean;
  public errors: string[] = [];
  private newRowID: string | null = null;
  private static readonly referenceRegex = /%([^%]+)%/g;
  private static readonly rowNumberRegex = /\$\d+/g;

  constructor(
    character: Roll20Character,
    delta: DeltasObject,
    {
      useEval = false,
      useParse = true,
      useModify = false,
      useConstrain = false,
      useReplace = false,
    }: AttributesManagerOptions = {},
  ) {
    this.character = character;
    this.delta = delta;
    this.final = {};
    this.attributes = [];
    this.repeating = this.initializeRepeating();
    this.eval = useEval;
    this.parse = useParse;
    this.modify = useModify;
    this.constrain = useConstrain;
    this.replace = useReplace;
    if (this.constrain) {
      this.modify = true;
    }
  };

  private initializeRepeating(
  ): AllRepeating {
    return {
      repeatingData: {},
      repeatingOrders: {},
    };
  };

  public async init(): Promise<DeltasObject> {
    this.attributes = await APIWrapper.getAllAttrs(this.character);
    this.repeating.repeatingData = await this.getAllRepeatingData();
    this.repeating.repeatingOrders = this.getRepeatingOrders();
    this.final = await this.parseAttributes();
    return this.final;
  };

  private async getAllRepeatingData(): Promise<RepeatingData> {
    const repeatingData: RepeatingData = {};
    const allAttributes = await APIWrapper.getAllAttrs(this.character);
    for (const attr of allAttributes) {
      const attributeName = attr.get("name");
      if (!attributeName.startsWith("repeating_")) {
        continue;
      }
      const { section, repeatingID } = APIWrapper.extractRepeatingDetails(attributeName) || {};
      if (!section || !repeatingID) {
        this.errors.push(`Invalid repeating attribute name: ${attributeName}`);
        continue;
      }
      repeatingData[section] ??= {};
      repeatingData[section][repeatingID] ??= {};
      const alreadyExists = repeatingData[section][repeatingID][attributeName];
      if (alreadyExists) {
        continue;
      }
      const attributeValue = attr.get("current");
      const attributeMax = attr.get("max");
      const attribute: AttributeDelta = {
        value: attributeValue || "",
      }
      if (attributeMax) {
        attribute.max = attributeMax;
      }
      repeatingData[section][repeatingID][attributeName] = attribute;
    }
    return repeatingData;
  };

  private getRepeatingOrders(): RepeatingOrders {
    const repeatingOrders: RepeatingOrders = {};
    const sections = this.attributes.filter(attr => attr.get("name").startsWith("repeating_"))
      .map(attr => {
        const name = attr.get("name");
        const { section = "null" } = APIWrapper.extractRepeatingDetails(name) ?? {};
        return section;
      })
      .filter((section, index, self) => self.indexOf(section) === index);
    const orderAttributes = this.attributes.filter(attr => attr.get("name").includes("reporder"));
    for (const name of sections) {
      const attribute = orderAttributes.find((attr) => {
        const name = attr.get("name");
        const isSection = name.includes(name);
        return isSection;
      });
      const idArray: string[] = [];
      if (attribute) {
        const value = attribute.get("current");
        const list = value.split(",").map(item => item.trim()).filter(item => !!item);
        idArray.push(...list);
      }
      const unordered = this.getUnorderedAttributes(name, idArray)
      const allIDs = new Set([...idArray, ...unordered]);
      const ids = Array.from(allIDs);
      repeatingOrders[name] ??= [];
      repeatingOrders[name].push(...ids);
    }
    return repeatingOrders;
  };

  private getUnorderedAttributes(
  section: string,
  ids: string[],
  ): string[] {
    const unordered = this.attributes.filter(attr => {
      const name = attr.get("name")
      const correctSection = name.startsWith(`repeating_${section}_`);
      const notOrdered = !ids.find(id => name === id);
      return correctSection && notOrdered;
    });
    const idsOnly = unordered.map(attr => {
      const name = attr.get("name");
      const { repeatingID } = APIWrapper.extractRepeatingDetails(name) ?? {};
      return repeatingID || name;
    });
    return idsOnly;
  };

  private async parseAttributes(): Promise<DeltasObject> {
    const delta = { ...this.delta };
    const final: DeltasObject = {};
    for (const key in delta) {
      const deltaItem = delta[key];
      let deltaName = key;
      let deltaCurrent = deltaItem.value || "";
      let deltaMax = deltaItem.max || "";
      const hasRepeating = deltaName.startsWith("repeating_");
      if (this.replace) {
        deltaCurrent = this.replaceMarks(deltaCurrent);
        deltaMax = this.replaceMarks(deltaMax);
      }
      if (hasRepeating) {
        deltaName = this.parseRepeating(deltaName);
      }
      if (this.parse) {
        deltaCurrent = this.parseDelta(deltaCurrent);
        deltaMax = this.parseDelta(deltaMax);
      }
      if (this.eval) {
        deltaCurrent = this.evalDelta(deltaCurrent);
        deltaMax = this.evalDelta(deltaMax);
      }
      if (this.modify) {
        deltaCurrent = this.modifyDelta(deltaCurrent, deltaName);
        deltaMax = this.modifyDelta(deltaMax, deltaName, true);
      }
      if (this.constrain) {
        deltaCurrent = this.constrainDelta(deltaCurrent, deltaMax, deltaName);
      }
      final[deltaName] = {
        value: deltaCurrent.toString(),
      };
      if (deltaMax) {
        final[deltaName].max = deltaMax;
      }
    }
    return final;
  };

  private replaceMarks(value: string): string {
    const replacements = Object.entries(REPLACEMENTS);
    for (const [oldChar, newChar] of replacements) {
      const regex = new RegExp(oldChar, "g");
      value = value.replace(regex, newChar);
    }
    return value;
  };

  private parseDelta(value: string): string {
    return value.replace(AttrProcessor.referenceRegex, (match, rawName) => {
      const isMax = rawName.endsWith("_max");
      const isRepeating = rawName.startsWith("repeating_");
      const noMaxName = isMax ? rawName.slice(0, -4) : rawName;
      const attributeName = isRepeating ? this.parseRepeating(noMaxName.trim()) : noMaxName.trim();
      const attribute = this.attributes.find(attr => attr.get("name") === attributeName);
      if (attribute) {
        const attrValue = attribute.get("current") || "";
        if (isMax) {
          const attrMax = attribute.get("max") || "";
          return attrMax ? attrMax : attrValue;
        }
        return attrValue;
      }
      this.errors.push(`Attribute ${attributeName} not found.`);
      return match; // Return original match if attribute not found
    });
  };

  private evalDelta(value: string): string {
    try {
      const evaled = eval(value);
      if (evaled) {
        return evaled.toString();
      }
      else {
        return value;
      }
    } catch (error) {
      return value;
    }
  };

  private modifyDelta(delta: string, name: string, isMax = false): string {
    const attribute = this.attributes.find(attr => attr.get("name") === name);
    if (!attribute) {
      this.errors.push(`Attribute ${name} not found for modification.`);
      return delta; // Return delta value if attribute not found
    }
    const current = isMax ? attribute.get("max") : attribute.get("current");
    if (delta === undefined || delta === null || delta === "") {
      if (!isMax) {
        this.errors.push(`Attribute ${name} has no value to modify.`);
      }
      return ""; // Return original value if no value is found
    }
    const deltaAsNumber = Number(delta);
    const currentAsNumber = Number(current);
    if (isNaN(deltaAsNumber) || isNaN(currentAsNumber)) {
      this.errors.push(`Cannot modify attribute ${name}. Either delta: ${delta} or current: ${current} is not number-valued.`);
      return current; // Return original value if not a number
    }
    let modified = deltaAsNumber + currentAsNumber;
    return modified.toString();
  };

  private constrainDelta(value: string, maxDelta: string, name: string): string {
    const attribute = this.attributes.find(attr => attr.get("name") === name);
    const max = maxDelta ? maxDelta : attribute?.get("max");
    const valueAsNumber = Number(value);
    const maxAsNumber = max === "" ? Infinity : Number(max);
    if (isNaN(valueAsNumber) || isNaN(maxAsNumber)) {
      this.errors.push(`Invalid value for constraining: ${value} or max: ${max}`);
      return value; // Return original value if not a number
    }
    let valueUpper = Math.min(valueAsNumber, maxAsNumber);
    let valueLower = Math.max(0, valueUpper);
    return valueLower.toString();
  };

  private useNewRepeatingID(): string {
    if (!this.newRowID) {
      this.newRowID = UUID.generateRowID();
    }
    return this.newRowID;
  };

  private parseRepeating(name: string): string {
    const { section, repeatingID, attribute } = APIWrapper.extractRepeatingDetails(name) ?? {};
    if (!section) {
      this.errors.push(`Invalid repeating attribute name: ${name}`);
      return name; // Return original name if invalid
    }
    if (repeatingID === "-CREATE") {
      const rowID = this.useNewRepeatingID();
      return `repeating_${section}_${rowID}_${attribute}`;
    }
    const matches = name.match(AttrProcessor.rowNumberRegex);
    if (matches) {
      const index = Number(matches[0].slice(1));
      const repeatingID = this.repeating.repeatingOrders[section]?.[index];
      if (repeatingID && !attribute) {
        return `repeating_${section}_${repeatingID}`;
      } else if (repeatingID) {
        return `repeating_${section}_${repeatingID}_${attribute}`;
      }
    }
    this.errors.push(`Repeating ID for ${name} not found.`);
    return name;
  };

  public replacePlaceholders(
    message: string,
  ): string {
    const entries = Object.entries(this.delta);
    const finalEntries = Object.entries(this.final);
    const newMessage = message
      .replace(/_NAME(\d+)_/g, (match, index) => {
        if (index > entries.length - 1) {
          this.errors.push(`Invalid index ${index} in _NAME${index}_ placeholder.`);
          return match; // Return original match if index is invalid
        }
        const actualIndex = parseInt(index, 10);
        const attr = entries[actualIndex];
        return attr[0] ?? "";
      })
      .replace(/_TCUR(\d+)_/g, (match, index) => {
        if (index > entries.length - 1) {
          this.errors.push(`Invalid index ${index} in _NAME${index}_ placeholder.`);
          return match; // Return original match if index is invalid
        }
        const actualIndex = parseInt(index, 10);
        const attr = entries[actualIndex];
        return attr[1].value ?? "";
      })
      .replace(/_TMAX(\d+)_/g, (match, index) => {
        if (index > entries.length - 1) {
          this.errors.push(`Invalid index ${index} in _NAME${index}_ placeholder.`);
          return match; // Return original match if index is invalid
        }
        const actualIndex = parseInt(index, 10);
        const attr = entries[actualIndex];
        return attr[1].max ?? "";
      })
      .replace(/_CUR(\d+)_/g, (match, index) => {
        if (index > entries.length - 1) {
          this.errors.push(`Invalid index ${index} in _NAME${index}_ placeholder.`);
          return match; // Return original match if index is invalid
        }
        const actualIndex = parseInt(index, 10);
        const attr = finalEntries[actualIndex];
        return attr[1].value ?? "";
      })
      .replace(/_MAX(\d+)_/g, (match, index) => {
        if (index > entries.length - 1) {
          this.errors.push(`Invalid index ${index} in _NAME${index}_ placeholder.`);
          return match; // Return original match if index is invalid
        }
        const actualIndex = parseInt(index, 10);
        const attr = finalEntries[actualIndex];
        return attr[1].max ?? "";
      })
      .replace(/_CHARNAME_/g, this.character.get("name") ?? "");
    return newMessage;
  }
};