var ChatSetAttr = function() {
  "use strict";
  const ObserverTypes = {
    ADD: "add",
    CHANGE: "change",
    DESTROY: "destroy"
  };
  const ObserverTypeValues = Object.values(ObserverTypes);
  class SubscriptionManager {
    subscriptions = /* @__PURE__ */ new Map();
    constructor() {
    }
    subscribe(event, callback) {
      var _a;
      if (typeof callback !== "function") {
        log(`event registration unsuccessful: ${event} - callback is not a function`);
      }
      if (!ObserverTypeValues.includes(event)) {
        log(`event registration unsuccessful: ${event} - event is not a valid observer type`);
      }
      if (!this.subscriptions.has(event)) {
        this.subscriptions.set(event, []);
      }
      (_a = this.subscriptions.get(event)) == null ? void 0 : _a.push(callback);
      log(`event registration successful: ${event}`);
    }
    unsubscribe(event, callback) {
      if (!this.subscriptions.has(event)) {
        return;
      }
      const callbacks = this.subscriptions.get(event);
      const index = callbacks == null ? void 0 : callbacks.indexOf(callback);
      if (index !== void 0 && index !== -1) {
        callbacks == null ? void 0 : callbacks.splice(index, 1);
      }
    }
    publish(event, ...args) {
      if (!this.subscriptions.has(event)) {
        return;
      }
      const callbacks = this.subscriptions.get(event);
      callbacks == null ? void 0 : callbacks.forEach((callback) => callback(...args));
    }
  }
  const globalSubscribeManager = new SubscriptionManager();
  class APIWrapper {
    // #region Attributes
    static async getAllAttrs(character) {
      const attrs = findObjs({
        _type: "attribute",
        _characterid: character == null ? void 0 : character.id
      });
      return attrs;
    }
    static async getAttr(character, attributeName) {
      const attr = findObjs({
        _type: "attribute",
        _characterid: character == null ? void 0 : character.id,
        name: attributeName
      })[0];
      if (!attr) {
        return null;
      }
      return attr;
    }
    static async getAttributes(character, attributeList) {
      const attributes = {};
      for (const attribute of attributeList) {
        const value2 = await APIWrapper.getAttribute(character, attribute);
        if (!value2) {
          continue;
        }
        attributes[attribute] = value2;
      }
      return attributes;
    }
    static async getAttribute(character, attributeName) {
      if (!character) {
        return null;
      }
      const value2 = await getSheetItem(character.id, attributeName, "current");
      const max = await getSheetItem(character.id, attributeName, "max");
      const attributeValue = {};
      if (value2) {
        attributeValue.value = value2;
      }
      if (max) {
        attributeValue.max = max;
      }
      if (!value2 && !max) {
        return null;
      }
      return attributeValue;
    }
    static async createAttribute(character, name, value2, max) {
      const errors = [];
      const messages = [];
      const newObjProps = {
        name,
        _characterid: character == null ? void 0 : character.id
      };
      const newAttr = createObj("attribute", newObjProps);
      await APIWrapper.setAttribute(character, name, value2, max);
      globalSubscribeManager.publish("add", newAttr);
      globalSubscribeManager.publish("change", newAttr, newAttr);
      messages.push(`Created attribute <strong>${name}</strong> with value <strong>${value2}</strong> for character <strong>${character == null ? void 0 : character.get("name")}</strong>.`);
      return [{ messages, errors }];
    }
    static async updateAttribute(character, name, value2, max) {
      const errors = [];
      const messages = [];
      const attr = await APIWrapper.getAttribute(character, name);
      if (!attr) {
        errors.push(`Attribute <strong>${name}</strong> does not exist for character <strong>${character.get("name")}</strong>.`);
        return [{ messages, errors }];
      }
      const oldAttr = JSON.parse(JSON.stringify(attr));
      await APIWrapper.setAttribute(character, name, value2, max);
      if (value2 && max) {
        messages.push(`Setting <strong>${name}</strong> to <strong>${value2}</strong> and <strong>${name}_max</strong> to <strong>${max}</strong> for character <strong>${character == null ? void 0 : character.get("name")}</strong>.`);
      } else if (value2) {
        messages.push(`Setting <strong>${name}</strong> to <strong>${value2}</strong> for character <strong>${character == null ? void 0 : character.get("name")}</strong>, max remains unchanged.`);
      } else if (max) {
        messages.push(`Setting <strong>${name}_max</strong> to <strong>${max}</strong> for character <strong>${character == null ? void 0 : character.get("name")}</strong>, current remains unchanged.`);
      }
      globalSubscribeManager.publish("change", { name, current: value2, max }, { name, current: oldAttr.value, max: oldAttr.max });
      return [{ messages, errors }];
    }
    static async setAttributeOld(attr, value2, max) {
      if (state.ChatSetAttr.useWorkers) {
        attr.setWithWorker({ current: value2 });
      } else {
        attr.set({ current: value2 });
      }
      if (max) {
        if (state.ChatSetAttr.useWorkers) {
          attr.setWithWorker({ max });
        } else {
          attr.set({ max });
        }
      }
    }
    static async setWithWorker(characterID, attr, value2, max) {
      const attrObj = await APIWrapper.getAttr(
        { id: characterID },
        attr
      );
      if (!attrObj) {
        return;
      }
      attrObj.setWithWorker({
        current: value2
      });
      if (max) {
        attrObj.setWithWorker({
          max
        });
      }
    }
    static async setAttribute(character, attr, value2, max) {
      if (state.ChatSetAttr.useWorkers) {
        await APIWrapper.setWithWorker(character.id, attr, value2, max);
        return;
      }
      if (value2) {
        await setSheetItem(character.id, attr, value2, "current");
        log(`Setting <strong>${attr}</strong> to <strong>${value2}</strong> for character with ID <strong>${character.get("name")}</strong>.`);
      }
      if (max) {
        await setSheetItem(character.id, attr, max, "max");
        log(`Setting <strong>${attr}</strong> max to <strong>${max}</strong> for character <strong>${character.get("name")}</strong>.`);
      }
    }
    static async setAttributesOnly(character, attributes) {
      const errors = [];
      const messages = [];
      const entries = Object.entries(attributes);
      for (const [key, value2] of entries) {
        const attribute = await APIWrapper.getAttribute(character, key);
        if (!(attribute == null ? void 0 : attribute.value)) {
          errors.push(`Attribute <strong>${key}</strong> does not exist for character <strong>${character.get("name")}</strong>.`);
          return [{ messages, errors }];
        }
        const stringValue = value2.value ? value2.value.toString() : void 0;
        const stringMax = value2.max ? value2.max.toString() : void 0;
        const [response] = await APIWrapper.updateAttribute(character, key, stringValue, stringMax);
        messages.push(...response.messages);
        errors.push(...response.errors);
      }
      return [{ messages, errors }];
    }
    static async setAttributes(character, attributes) {
      const errors = [];
      const messages = [];
      const entries = Object.entries(attributes);
      for (const [key, value2] of entries) {
        const stringValue = value2.value ? value2.value.toString() : "";
        const stringMax = value2.max ? value2.max.toString() : void 0;
        const attribute = await APIWrapper.getAttribute(character, key);
        if (!(attribute == null ? void 0 : attribute.value)) {
          const [response] = await APIWrapper.createAttribute(character, key, stringValue, stringMax);
          messages.push(...response.messages);
          errors.push(...response.errors);
        } else {
          const [response] = await APIWrapper.updateAttribute(character, key, stringValue, stringMax);
          messages.push(...response.messages);
          errors.push(...response.errors);
        }
      }
      return [{ messages, errors }];
    }
    static async deleteAttributes(character, attributes) {
      const errors = [];
      const messages = [];
      for (const attribute of attributes) {
        const { section, repeatingID, attribute: attrName } = APIWrapper.extractRepeatingDetails(attribute) || {};
        if (section && repeatingID && !attrName) {
          return APIWrapper.deleteRepeatingRow(character, section, repeatingID);
        }
        const attr = await APIWrapper.getAttr(character, attribute);
        if (!attr) {
          errors.push(`Attribute <strong>${attribute}</strong> does not exist for character <strong>${character.get("name")}</strong>.`);
          continue;
        }
        const oldAttr = JSON.parse(JSON.stringify(attr));
        attr.remove();
        globalSubscribeManager.publish("destroy", oldAttr);
        messages.push(`Attribute <strong>${attribute}</strong> deleted for character <strong>${character.get("name")}</strong>.`);
      }
      return [{ messages, errors }];
    }
    static async deleteRepeatingRow(character, section, repeatingID) {
      const errors = [];
      const messages = [];
      const repeatingAttrs = findObjs({
        _type: "attribute",
        _characterid: character.id
      }).filter((attr) => {
        const name = attr.get("name");
        return name.startsWith(`repeating_${section}_${repeatingID}_`);
      });
      if (repeatingAttrs.length === 0) {
        errors.push(`No repeating attributes found for section <strong>${section}</strong> and ID <strong>${repeatingID}</strong> for character <strong>${character.get("name")}</strong>.`);
        return [{ messages, errors }];
      }
      for (const attr of repeatingAttrs) {
        const oldAttr = JSON.parse(JSON.stringify(attr));
        attr.remove();
        globalSubscribeManager.publish("destroy", oldAttr);
        messages.push(`Repeating attribute <strong>${attr.get("name")}</strong> deleted for character <strong>${character.get("name")}</strong>.`);
      }
      return [{ messages, errors }];
    }
    static async resetAttributes(character, attributes) {
      const errors = [];
      const messages = [];
      for (const attribute of attributes) {
        const attr = await APIWrapper.getAttribute(character, attribute);
        const value2 = attr == null ? void 0 : attr.value;
        if (!value2) {
          errors.push(`Attribute <strong>${attribute}</strong> does not exist for character <strong>${character.get("name")}</strong>.`);
          continue;
        }
        const max = attr.max;
        if (!max) {
          continue;
        }
        const oldAttr = JSON.parse(JSON.stringify(attr));
        APIWrapper.setAttribute(character, attribute, max);
        globalSubscribeManager.publish("change", attr, oldAttr);
        messages.push(`Attribute <strong>${attribute}</strong> reset for character <strong>${character.get("name")}</strong>.`);
      }
      return [{ messages, errors }];
    }
    // #endregion Attributes
    // #region Repeating Attributes
    static extractRepeatingDetails(attributeName) {
      const [, section, repeatingID, ...attributeParts] = attributeName.split("_");
      const attribute = attributeParts.join("_");
      return {
        section: section || void 0,
        repeatingID: repeatingID || void 0,
        attribute: attribute || void 0
      };
    }
    static hasRepeatingAttributes(attributes) {
      return Object.keys(attributes).some((key) => key.startsWith("repeating_"));
    }
  }
  const CommandType = {
    NONE: -1,
    API: 0,
    INLINE: 1
  };
  const Commands = {
    SET_ATTR_CONFIG: "setattr-config",
    RESET_ATTR: "resetattr",
    SET_ATTR: "setattr",
    DEL_ATTR: "delattr",
    MOD_ATTR: "modattr",
    MOD_B_ATTR: "modbattr"
  };
  const Flags = {
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
    USE_WORKERS: "use-workers"
  };
  class InputParser {
    commands = Object.values(Commands);
    flags = Object.values(Flags);
    commandPrefix = "!";
    commandSuffix = "!!!";
    optionPrefix = "--";
    constructor() {
    }
    parse(message) {
      log(`InputParser.parse: message: ${JSON.stringify(message)}`);
      let input = this.processInlineRolls(message);
      for (const command of this.commands) {
        const commandString = `${this.commandPrefix}${command}`;
        if (input.startsWith(commandString)) {
          return this.parseAPICommand(command, input, CommandType.API);
        }
        const regex = new RegExp(`(${this.commandPrefix}${command}.*)${this.commandSuffix}`);
        const match = input.match(regex);
        log(`InputParser.parse: command: ${command}, match: ${JSON.stringify(match)}`);
        if (match) {
          return this.parseAPICommand(command, match[1], CommandType.INLINE);
        }
      }
      return {
        commandType: CommandType.NONE,
        command: null,
        flags: [],
        attributes: {}
      };
    }
    parseAPICommand(command, input, type) {
      const { flags, attributes } = this.extractOptions(input, command);
      return {
        commandType: type,
        command,
        flags,
        attributes
      };
    }
    extractOptions(input, command) {
      const attributes = {};
      const flags = [];
      const commandString = `${this.commandPrefix}${command} `;
      const optionsString = input.slice(commandString.length).trim();
      const allOptions = optionsString.split(this.optionPrefix).map((opt) => opt.trim()).filter((opt) => !!opt);
      for (const option of allOptions) {
        const isFlag = this.flags.some((flag) => option.startsWith(flag));
        if (isFlag) {
          const flag = this.parseFlag(option);
          if (flag) {
            flags.push(flag);
          }
        } else {
          const { name, attribute } = this.parseAttribute(option) ?? {};
          if (attribute && name) {
            attributes[name] = attribute;
          }
        }
      }
      return { flags, attributes };
    }
    parseFlag(option) {
      const [name, ...values] = option.split(" ").map((opt) => opt.trim());
      const value2 = values.join(" ");
      return {
        name: this.stripChars(name),
        value: this.stripChars(value2)
      };
    }
    parseAttribute(option) {
      const split = option.split(/(?<!\\)[\|#]/).map((opt) => opt.trim());
      const rationalized = split.map((p) => {
        p = this.stripChars(p);
        if (!p || p === "") {
          return null;
        }
        return p;
      });
      const [name, value2, max] = rationalized;
      if (!name) {
        return null;
      }
      const attribute = {};
      if (value2) {
        attribute.value = value2;
      }
      if (max) {
        attribute.max = max;
      }
      return {
        attribute,
        name
      };
    }
    stripQuotes(str) {
      return str.replace(/["'](.*)["']/g, "$1");
    }
    stripBackslashes(str) {
      return str.replace(/\\/g, "");
    }
    stripChars(str) {
      const noSlashes = this.stripBackslashes(str);
      const noQuotes = this.stripQuotes(noSlashes);
      return noQuotes;
    }
    processInlineRolls(message) {
      const { inlinerolls } = message;
      if (!inlinerolls || Object.keys(inlinerolls).length === 0) {
        return message.content;
      }
      let content = this.removeRollTemplates(message.content);
      for (const key in inlinerolls) {
        const roll = inlinerolls[key];
        if (roll.results && roll.results.total !== void 0) {
          const rollValue = roll.results.total;
          content = content.replace(`$[[${key}]]`, rollValue.toString());
        } else {
          content = content.replace(`$[[${key}]]`, "");
        }
      }
      return content;
    }
    removeRollTemplates(input) {
      return input.replace(/{{[^}[\]]+\$\[\[(\d+)\]\].*?}}/g, (_, number) => {
        return `$[[${number}]]`;
      });
    }
  }
  function convertCamelToKebab(camel) {
    return camel.replace(/([a-z])([A-Z])/g, `$1-$2`).toLowerCase();
  }
  function createStyle(styleObject) {
    let style = ``;
    for (const [key, value2] of Object.entries(styleObject)) {
      const kebabKey = convertCamelToKebab(key);
      style += `${kebabKey}: ${value2};`;
    }
    return style;
  }
  function checkOpt(options, type) {
    return options.some((opt) => opt.name === type);
  }
  function asyncTimeout(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
  class UUID {
    static base64Chars = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
    static base = 64;
    static previousTime = 0;
    static counter = new Array(12).fill(0);
    static toBase64(num, length) {
      let result = "";
      for (let i = 0; i < length; i++) {
        result = this.base64Chars[num % this.base] + result;
        num = Math.floor(num / this.base);
      }
      return result;
    }
    static generateRandomBase64(length) {
      let result = "";
      for (let i = 0; i < length; i++) {
        result += this.base64Chars[Math.floor(Math.random() * this.base)];
      }
      return result;
    }
    static generateUUID() {
      const currentTime = Date.now();
      const timeBase64 = this.toBase64(currentTime, 8);
      let randomOrCounterBase64 = "";
      if (currentTime === this.previousTime) {
        for (let i = this.counter.length - 1; i >= 0; i--) {
          this.counter[i]++;
          if (this.counter[i] < this.base) {
            break;
          } else {
            this.counter[i] = 0;
          }
        }
        randomOrCounterBase64 = this.counter.map((index) => this.base64Chars[index]).join("");
      } else {
        randomOrCounterBase64 = this.generateRandomBase64(12);
        this.counter.fill(0);
        this.previousTime = currentTime;
      }
      return timeBase64 + randomOrCounterBase64;
    }
    static generateRowID() {
      return this.generateUUID().replace(/_/g, "Z");
    }
  }
  const REPLACEMENTS = {
    "<": "[",
    ">": "]",
    "lbrak": "[",
    "\rbrak": "]",
    ";": "?",
    "ques": "?",
    "`": "@",
    "at": "@",
    "~": "-",
    "dash": "-"
  };
  class AttrProcessor {
    character;
    delta;
    final;
    attributes;
    repeating;
    eval;
    parse;
    modify;
    constrain;
    replace;
    errors = [];
    newRowID = null;
    static referenceRegex = /%([^%]+)%/g;
    static rowNumberRegex = /\$\d+/g;
    constructor(character, delta, {
      useEval = false,
      useParse = true,
      useModify = false,
      useConstrain = false,
      useReplace = false
    } = {}) {
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
    }
    initializeRepeating() {
      return {
        repeatingData: {},
        repeatingOrders: {}
      };
    }
    async init() {
      this.attributes = await APIWrapper.getAllAttrs(this.character);
      this.repeating.repeatingData = await this.getAllRepeatingData();
      this.repeating.repeatingOrders = this.getRepeatingOrders();
      this.final = await this.parseAttributes();
      return this.final;
    }
    async getAllRepeatingData() {
      const repeatingData = {};
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
        const attribute = {
          value: attributeValue || ""
        };
        if (attributeMax) {
          attribute.max = attributeMax;
        }
        repeatingData[section][repeatingID][attributeName] = attribute;
      }
      return repeatingData;
    }
    getRepeatingOrders() {
      const repeatingOrders = {};
      const sections = this.attributes.filter((attr) => attr.get("name").startsWith("repeating_")).map((attr) => {
        const name = attr.get("name");
        const { section = "null" } = APIWrapper.extractRepeatingDetails(name) ?? {};
        return section;
      }).filter((section, index, self) => self.indexOf(section) === index);
      const orderAttributes = this.attributes.filter((attr) => attr.get("name").includes("reporder"));
      for (const name of sections) {
        const attribute = orderAttributes.find((attr) => {
          const name2 = attr.get("name");
          const isSection = name2.includes(name2);
          return isSection;
        });
        const idArray = [];
        if (attribute) {
          const value2 = attribute.get("current");
          const list = value2.split(",").map((item) => item.trim()).filter((item) => !!item);
          idArray.push(...list);
        }
        const unordered = this.getUnorderedAttributes(name, idArray);
        const allIDs = /* @__PURE__ */ new Set([...idArray, ...unordered]);
        const ids = Array.from(allIDs);
        repeatingOrders[name] ??= [];
        repeatingOrders[name].push(...ids);
      }
      return repeatingOrders;
    }
    getUnorderedAttributes(section, ids) {
      const unordered = this.attributes.filter((attr) => {
        const name = attr.get("name");
        const correctSection = name.startsWith(`repeating_${section}_`);
        const notOrdered = !ids.find((id) => name === id);
        return correctSection && notOrdered;
      });
      const idsOnly = unordered.map((attr) => {
        const name = attr.get("name");
        const { repeatingID } = APIWrapper.extractRepeatingDetails(name) ?? {};
        return repeatingID || name;
      });
      return idsOnly;
    }
    async parseAttributes() {
      const delta = { ...this.delta };
      const final = {};
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
          value: deltaCurrent.toString()
        };
        if (deltaMax) {
          final[deltaName].max = deltaMax;
        }
      }
      return final;
    }
    replaceMarks(value2) {
      const replacements = Object.entries(REPLACEMENTS);
      for (const [oldChar, newChar] of replacements) {
        const regex = new RegExp(oldChar, "g");
        value2 = value2.replace(regex, newChar);
      }
      return value2;
    }
    parseDelta(value2) {
      return value2.replace(AttrProcessor.referenceRegex, (match, rawName) => {
        const isMax = rawName.endsWith("_max");
        const isRepeating = rawName.startsWith("repeating_");
        const noMaxName = isMax ? rawName.slice(0, -4) : rawName;
        const attributeName = isRepeating ? this.parseRepeating(noMaxName.trim()) : noMaxName.trim();
        const attribute = this.attributes.find((attr) => attr.get("name") === attributeName);
        if (attribute) {
          const attrValue = attribute.get("current") || "";
          if (isMax) {
            const attrMax = attribute.get("max") || "";
            return attrMax ? attrMax : attrValue;
          }
          return attrValue;
        }
        this.errors.push(`Attribute ${attributeName} not found.`);
        return match;
      });
    }
    evalDelta(value) {
      try {
        const evaled = eval(value);
        if (evaled) {
          return evaled.toString();
        } else {
          return value;
        }
      } catch (error) {
        return value;
      }
    }
    modifyDelta(delta, name, isMax = false) {
      const attribute = this.attributes.find((attr) => attr.get("name") === name);
      if (!attribute) {
        this.errors.push(`Attribute ${name} not found for modification.`);
        return delta;
      }
      const current = isMax ? attribute.get("max") : attribute.get("current");
      if (delta === void 0 || delta === null || delta === "") {
        if (!isMax) {
          this.errors.push(`Attribute ${name} has no value to modify.`);
        }
        return "";
      }
      const deltaAsNumber = Number(delta);
      const currentAsNumber = Number(current);
      if (isNaN(deltaAsNumber) || isNaN(currentAsNumber)) {
        this.errors.push(`Cannot modify attribute ${name}. Either delta: ${delta} or current: ${current} is not number-valued.`);
        return current;
      }
      let modified = deltaAsNumber + currentAsNumber;
      return modified.toString();
    }
    constrainDelta(value2, maxDelta, name) {
      const attribute = this.attributes.find((attr) => attr.get("name") === name);
      const max = maxDelta ? maxDelta : attribute == null ? void 0 : attribute.get("max");
      const valueAsNumber = Number(value2);
      const maxAsNumber = max === "" ? Infinity : Number(max);
      if (isNaN(valueAsNumber) || isNaN(maxAsNumber)) {
        this.errors.push(`Invalid value for constraining: ${value2} or max: ${max}`);
        return value2;
      }
      let valueUpper = Math.min(valueAsNumber, maxAsNumber);
      let valueLower = Math.max(0, valueUpper);
      return valueLower.toString();
    }
    useNewRepeatingID() {
      if (!this.newRowID) {
        this.newRowID = UUID.generateRowID();
      }
      return this.newRowID;
    }
    parseRepeating(name) {
      var _a;
      const { section, repeatingID, attribute } = APIWrapper.extractRepeatingDetails(name) ?? {};
      if (!section) {
        this.errors.push(`Invalid repeating attribute name: ${name}`);
        return name;
      }
      if (repeatingID === "-CREATE") {
        const rowID = this.useNewRepeatingID();
        return `repeating_${section}_${rowID}_${attribute}`;
      }
      const matches = name.match(AttrProcessor.rowNumberRegex);
      if (matches) {
        const index = Number(matches[0].slice(1));
        const repeatingID2 = (_a = this.repeating.repeatingOrders[section]) == null ? void 0 : _a[index];
        if (repeatingID2 && !attribute) {
          return `repeating_${section}_${repeatingID2}`;
        } else if (repeatingID2) {
          return `repeating_${section}_${repeatingID2}_${attribute}`;
        }
      }
      this.errors.push(`Repeating ID for ${name} not found.`);
      return name;
    }
    replacePlaceholders(message) {
      const entries = Object.entries(this.delta);
      const finalEntries = Object.entries(this.final);
      const newMessage = message.replace(/_NAME(\d+)_/g, (match, index) => {
        if (index > entries.length - 1) {
          this.errors.push(`Invalid index ${index} in _NAME${index}_ placeholder.`);
          return match;
        }
        const actualIndex = parseInt(index, 10);
        const attr = entries[actualIndex];
        return attr[0] ?? "";
      }).replace(/_TCUR(\d+)_/g, (match, index) => {
        if (index > entries.length - 1) {
          this.errors.push(`Invalid index ${index} in _NAME${index}_ placeholder.`);
          return match;
        }
        const actualIndex = parseInt(index, 10);
        const attr = entries[actualIndex];
        return attr[1].value ?? "";
      }).replace(/_TMAX(\d+)_/g, (match, index) => {
        if (index > entries.length - 1) {
          this.errors.push(`Invalid index ${index} in _NAME${index}_ placeholder.`);
          return match;
        }
        const actualIndex = parseInt(index, 10);
        const attr = entries[actualIndex];
        return attr[1].max ?? "";
      }).replace(/_CUR(\d+)_/g, (match, index) => {
        if (index > entries.length - 1) {
          this.errors.push(`Invalid index ${index} in _NAME${index}_ placeholder.`);
          return match;
        }
        const actualIndex = parseInt(index, 10);
        const attr = finalEntries[actualIndex];
        return attr[1].value ?? "";
      }).replace(/_MAX(\d+)_/g, (match, index) => {
        if (index > entries.length - 1) {
          this.errors.push(`Invalid index ${index} in _NAME${index}_ placeholder.`);
          return match;
        }
        const actualIndex = parseInt(index, 10);
        const attr = finalEntries[actualIndex];
        return attr[1].max ?? "";
      }).replace(/_CHARNAME_/g, this.character.get("name") ?? "");
      return newMessage;
    }
  }
  class SetAttrCommand {
    name = "setattr";
    description = "Set attributes for a character.";
    options = ["nocreate", "evaluate"];
    async execute(options, targets, values) {
      var _a;
      const messages = [];
      const errors = [];
      const onlySet = checkOpt(options, Flags.NO_CREATE);
      const createMethod = onlySet ? APIWrapper.setAttributesOnly : APIWrapper.setAttributes;
      const useEval = checkOpt(options, Flags.EVAL);
      const useReplace = checkOpt(options, Flags.REPLACE);
      const useFeedback = checkOpt(options, Flags.FB_CONTENT);
      const content = (_a = options.find((opt) => opt.name === Flags.FB_CONTENT)) == null ? void 0 : _a.value;
      for (const target of targets) {
        const processor = new AttrProcessor(target, values, {
          useEval,
          useReplace,
          useParse: true
        });
        const processedValues = await processor.init();
        errors.push(...processor.errors);
        const [createResponse] = await createMethod(target, processedValues);
        errors.push(...createResponse.errors ?? []);
        if (useFeedback && content) {
          processor.errors = [];
          const messageContent = processor.replacePlaceholders(content);
          messages.push(messageContent);
          errors.push(...processor.errors);
        } else {
          messages.push(...createResponse.messages ?? []);
        }
        await asyncTimeout(20);
      }
      if (errors.length > 0) {
        return {
          messages: [],
          errors
        };
      }
      return {
        messages,
        errors
      };
    }
    help() {
      return `!setattr ${this.options.join(" ")} - Set attributes for a character.`;
    }
  }
  class ModAttrCommand {
    name = "modattr";
    description = "Modify attributes for a character.";
    options = ["evaluate"];
    async execute(options, targets, values) {
      const messages = [];
      const errors = [];
      const shouldEval = checkOpt(options, Flags.EVAL);
      const useReplace = checkOpt(options, Flags.REPLACE);
      for (const target of targets) {
        const processor = new AttrProcessor(target, values, {
          useEval: shouldEval,
          useReplace,
          useParse: true,
          useModify: true
        });
        const processedValues = await processor.init();
        errors.push(...processor.errors);
        const [createResponse] = await APIWrapper.setAttributes(target, processedValues);
        messages.push(...createResponse.messages ?? []);
        errors.push(...createResponse.errors ?? []);
        await asyncTimeout(20);
      }
      return {
        messages,
        errors
      };
    }
    help() {
      return `!modattr ${this.options.join(" ")} - Modify attributes for a character.`;
    }
  }
  class ModBAttrCommand {
    name = "modbattr";
    description = "Modify attributes for a character bound to upper values of the related max.";
    options = ["evaluate"];
    async execute(options, targets, values) {
      const messages = [];
      const errors = [];
      const shouldEval = checkOpt(options, Flags.EVAL);
      const useReplace = checkOpt(options, Flags.REPLACE);
      for (const target of targets) {
        const processor = new AttrProcessor(target, values, {
          useReplace,
          useEval: shouldEval,
          useParse: true,
          useModify: true,
          useConstrain: true
        });
        const processedValues = await processor.init();
        errors.push(...processor.errors);
        const [createResponse] = await APIWrapper.setAttributes(target, processedValues);
        messages.push(...createResponse.messages ?? []);
        errors.push(...createResponse.errors ?? []);
        await asyncTimeout(20);
      }
      return {
        messages,
        errors
      };
    }
    help() {
      return `!modbattr ${this.options.join(" ")} - Modify attributes for a character bound to upper values of the related max.`;
    }
  }
  class DelAttrCommand {
    name = "delattr";
    description = "Delete attributes for a character.";
    options = [];
    async execute(_, targets, values) {
      const messages = [];
      const errors = [];
      for (const target of targets) {
        const processor = new AttrProcessor(target, values, {
          useParse: true
        });
        const processedValues = await processor.init();
        const attrs = Object.keys(processedValues);
        const [response] = await APIWrapper.deleteAttributes(target, attrs);
        messages.push(...response.messages ?? []);
        errors.push(...response.errors ?? []);
        await asyncTimeout(20);
      }
      return {
        messages,
        errors
      };
    }
    help() {
      return `!delattr - Delete attributes for a character.`;
    }
  }
  class ResetAttrCommand {
    name = "resetattr";
    description = "Reset attributes for a character.";
    options = [];
    async execute(_, targets, values) {
      const messages = [];
      const errors = [];
      for (const target of targets) {
        const attrs = Object.keys(values);
        const [response] = await APIWrapper.resetAttributes(target, attrs);
        messages.push(...response.messages ?? []);
        errors.push(...response.errors ?? []);
        await asyncTimeout(20);
      }
      return {
        messages,
        errors
      };
    }
    help() {
      return `!resetattr - Reset attributes for a character.`;
    }
  }
  class ConfigCommand {
    name = "setattr-config";
    description = "Configure the SetAttr command.";
    options = ["players-can-modify", "players-can-evaluate", "use-workers"];
    async execute(options, _, __, message) {
      const messages = [];
      const errors = [];
      const isGM = playerIsGM(message.playerid);
      if (!isGM) {
        errors.push("Only the GM can configure ChatSetAttr.");
        return { messages, errors };
      }
      const config = state.ChatSetAttr;
      for (const option of options) {
        switch (option.name) {
          case Flags.PLAYERS_CAN_MODIFY:
            config.playersCanModify = !config.playersCanModify;
            messages.push(`Players can modify attributes: ${config.playersCanModify}`);
            break;
          case Flags.PLAYERS_CAN_EVALUATE:
            config.playersCanEvaluate = !config.playersCanEvaluate;
            messages.push(`Players can evaluate attributes: ${config.playersCanEvaluate}`);
            break;
          case Flags.USE_WORKERS:
            config.useWorkers = !config.useWorkers;
            messages.push(`Using workers for attribute operations: ${config.useWorkers}`);
            break;
        }
      }
      const messageContent = this.createMessage();
      messages.push(messageContent);
      return {
        messages,
        errors
      };
    }
    help() {
      return `!setattr-config ${this.options.join(" ")} - Configure the SetAttr command.`;
    }
    createMessage() {
      const localState = state.ChatSetAttr;
      let message = ``;
      message += `<p><strong>ChatSetAttr Configuration</strong></p>`;
      message += `<p><em>!setattr-config</em> can be invoked in the following format:</p>`;
      message += `<p><code>!setattr-config --option</code></p>`;
      message += `<p>Specifying an option toggles the current setting.</p>`;
      message += `<p>Current Configuration:</p>`;
      message += this.createMessageRow(
        "playersCanModify",
        "Determines if players can use <em>--name</em> and <em>--charid</em> to change attributes of characters they do not control",
        localState.playersCanModify
      );
      message += this.createMessageRow(
        "playersCanEvaluate",
        "Determines if players can use the --evaluate option. <strong>Be careful</strong> in giving players access to this option, because it potentially gives players access to your full API sandbox.",
        localState.playersCanEvaluate
      );
      message += this.createMessageRow(
        "useWorkers",
        "Determines if setting attributes should trigger sheet worker operations.",
        localState.useWorkers
      );
      return message;
    }
    messageRowStyle = createStyle({
      padding: "5px 10px",
      borderBottom: "1px solid #ccc"
    });
    messageRowIndicatorStyleOn = createStyle({
      float: "right",
      margin: "3px",
      padding: "3px",
      border: "1px solid #000",
      backgroundColor: "#ffc",
      color: "#f00"
    });
    messageRowIndicatorStyleOff = createStyle({
      float: "right",
      margin: "3px",
      padding: "3px",
      border: "1px solid #000",
      backgroundColor: "#ffc",
      color: "#666"
    });
    createMessageRow(property, description, value2) {
      const indicatorStyle = value2 ? this.messageRowIndicatorStyleOn : this.messageRowIndicatorStyleOff;
      return `<div style="${this.messageRowStyle}"><span style="${indicatorStyle}">${value2 ? "ON" : "OFF"}</span><span style="font-weight: bold;">${property}</span>: ${description}</div>`;
    }
  }
  function filterByPermission(playerID, characters) {
    const errors = [];
    const messages = [];
    const validTargets = [];
    for (const character of characters) {
      const isGM = playerIsGM(playerID);
      const ownedBy = character.get("controlledby");
      const ownedByArray = ownedBy.split(",").map((id) => id.trim());
      const isOwner = ownedByArray.includes(playerID);
      const hasPermission = isOwner || isGM;
      if (!hasPermission) {
        continue;
      }
      validTargets.push(character);
    }
    return [validTargets, { messages, errors }];
  }
  class TargetAllCharacters {
    name = "all";
    description = "All characters in the game.";
    parse(targets, playerID) {
      const errors = [];
      const messages = [];
      const canUseAll = playerIsGM(playerID);
      if (!canUseAll) {
        errors.push("You do not have permission to use the 'all' target.");
        return [[], { messages, errors }];
      }
      if (targets.length > 0) {
        errors.push("The 'all' target does not accept any targets.");
        return [[], { messages, errors }];
      }
      const allCharacters = findObjs({
        _type: "character"
      });
      return [allCharacters, { messages, errors }];
    }
  }
  class TargetAllPlayerCharacters {
    name = "allplayers";
    description = "All characters controlled by players.";
    parse(targets, playerID) {
      const errors = [];
      const messages = [];
      const canUseAll = playerIsGM(playerID) || state.ChatSetAttr.playersCanModify;
      if (!canUseAll) {
        errors.push("You do not have permission to use the 'allplayers' target.");
        return [[], { messages, errors }];
      }
      if (targets.length > 0) {
        errors.push("The 'allplayers' target does not accept any targets.");
        return [[], { messages, errors }];
      }
      const allPlayerCharacters = findObjs({
        _type: "character"
      }).filter((character) => {
        const controlledBy = character.get("controlledby");
        return controlledBy && controlledBy !== "" && controlledBy !== "all";
      });
      return [allPlayerCharacters, { messages, errors }];
    }
  }
  class TargetAllGMCharacters {
    name = "allgm";
    description = "All characters not controlled by any player.";
    parse(targets, playerID) {
      const errors = [];
      const messages = [];
      const canUseAll = playerIsGM(playerID) || state.ChatSetAttr.playersCanModify;
      if (!canUseAll) {
        errors.push("You do not have permission to use the 'allgm' target.");
        return [[], { messages, errors }];
      }
      if (targets.length > 0) {
        errors.push("The 'allgm' target does not accept any targets.");
        return [[], { messages, errors }];
      }
      const allGmCharacters = findObjs({
        _type: "character"
      }).filter((character) => {
        const controlledBy = character.get("controlledby");
        return controlledBy === "" || controlledBy === "all";
      });
      return [allGmCharacters, { messages, errors }];
    }
  }
  class TargetByName {
    name = "name";
    description = "Target specific character names.";
    parse(targets, playerID) {
      const errors = [];
      const messages = [];
      if (targets.length === 0) {
        errors.push("The 'name' target requires at least one target.");
        return [[], { messages, errors }];
      }
      const targetsByName = targets.map((target) => {
        const character = findObjs({
          _type: "character",
          name: target
        })[0];
        if (!character) {
          errors.push(`Character with name ${target} does not exist.`);
          return null;
        }
        return character;
      }).filter((target) => target !== null);
      const [validTargets, response] = filterByPermission(playerID, targetsByName);
      messages.push(...response.messages ?? []);
      errors.push(...response.errors ?? []);
      return [validTargets, { messages, errors }];
    }
  }
  class TargetByID {
    name = "id";
    description = "Target specific character IDs.";
    parse(targets, playerID) {
      const errors = [];
      const messages = [];
      if (targets.length === 0) {
        errors.push("The 'id' target requires at least one target.");
        return [[], { messages, errors }];
      }
      const targetsByID = targets.map((target) => {
        const character = getObj("character", target);
        if (!character) {
          errors.push(`Character with ID ${target} does not exist.`);
          return null;
        }
        return character;
      }).filter((target) => target !== null);
      const [validTargets, response] = filterByPermission(playerID, targetsByID);
      messages.push(...response.messages ?? []);
      errors.push(...response.errors ?? []);
      if (validTargets.length === 0 && targets.length > 0) {
        errors.push("No valid targets found with the provided IDs.");
      }
      return [validTargets, { messages, errors }];
    }
  }
  class TargetBySelection {
    name = "target";
    description = "Target characters by selected tokens.";
    parse(targets, playerID) {
      const errors = [];
      const messages = [];
      if (targets.length === 0) {
        errors.push("The 'target' target requires at least one target.");
        return [[], { messages, errors }];
      }
      const targetsFromSelection = targets.map((target) => {
        const graphic = getObj("graphic", target);
        if (!graphic) {
          errors.push(`Token with ID ${target} does not exist.`);
          return null;
        }
        const represents = graphic.get("represents");
        if (!represents) {
          errors.push(`Token with ID ${target} does not represent a character.`);
          return null;
        }
        const character = getObj("character", represents);
        if (!character) {
          errors.push(`Character with ID ${represents} does not exist.`);
          return null;
        }
        return character;
      }).filter((target) => target !== null);
      const [validTargets, permissionResponse] = filterByPermission(playerID, targetsFromSelection);
      messages.push(...permissionResponse.messages ?? []);
      errors.push(...permissionResponse.errors ?? []);
      return [validTargets, { messages, errors }];
    }
  }
  class ChatOutput {
    header;
    content;
    from;
    playerID;
    type;
    whisper;
    chatStyle = createStyle({
      border: `1px solid #ccc`,
      borderRadius: `5px`,
      padding: `5px`,
      backgroundColor: `#f9f9f9`
    });
    headerStyle = createStyle({
      fontSize: `1.2em`,
      fontWeight: `bold`,
      marginBottom: `5px`
    });
    errorStyle = createStyle({
      border: `1px solid #f00`,
      borderRadius: `5px`,
      padding: `5px`,
      backgroundColor: `#f9f9f9`
    });
    errorHeaderStyle = createStyle({
      color: `#f00`,
      fontWeight: `bold`,
      fontSize: `1.2em`
    });
    constructor({
      playerID = "GM",
      header = "",
      content = "",
      from = "ChatOutput",
      type = "info",
      whisper = false
    } = {}) {
      this.playerID = playerID;
      this.header = header;
      this.content = content;
      this.from = from;
      this.type = type;
      this.whisper = whisper;
    }
    send() {
      const noarchive = this.type === "feedback" ? false : true;
      let output = ``;
      output += this.createWhisper();
      output += this.createWrapper();
      output += this.createHeader();
      output += this.createContent();
      output += this.closeWrapper();
      log(`Output: ${output}`);
      sendChat(this.from, output, void 0, { noarchive });
    }
    createWhisper() {
      if (this.whisper === false) {
        log(`ChatOutput: Not sending as whisper`);
        return ``;
      }
      if (this.playerID === "GM") {
        return `/w GM `;
      }
      const player = getObj("player", this.playerID);
      if (!player) {
        return `/w GM `;
      }
      const playerName = player.get("_displayname");
      if (!playerName) {
        return `/w GM `;
      }
      return `/w "${playerName}" `;
    }
    createWrapper() {
      const style = this.type === "error" ? this.errorStyle : this.chatStyle;
      return `<div style='${style}'>`;
    }
    createHeader() {
      if (!this.header) {
        return ``;
      }
      const style = this.type === "error" ? this.errorHeaderStyle : this.headerStyle;
      return `<h3 style='${style}'>${this.header}</h3>`;
    }
    createContent() {
      if (!this.content) {
        return ``;
      }
      if (this.content.startsWith("<")) {
        return this.content;
      }
      return `<p>${this.content}</p>`;
    }
    closeWrapper() {
      return `</div>`;
    }
  }
  class TimerManager {
    static timers = /* @__PURE__ */ new Map();
    static start(id, duration, callback) {
      if (this.timers.has(id)) {
        this.stop(id);
      }
      const timer = setTimeout(() => {
        callback();
        this.timers.delete(id);
      }, duration);
      this.timers.set(id, timer);
    }
    static stop(id) {
      const timer = this.timers.get(id);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(id);
      }
    }
    static isRunning(id) {
      return this.timers.has(id);
    }
  }
  const VERSION = "1.11";
  const SCHEMA_VERSION = 4;
  const SCRIPT_STRINGS = {
    CAN_MODIFY: "Players can modify all characters",
    CAN_EVAL: "Players can use --evaluate",
    USE_WORKERS: "Trigger sheet workers when setting attributes"
  };
  class ChatSetAttr {
    InputParser;
    errors = [];
    messages = [];
    constructor() {
      this.InputParser = new InputParser();
      this.registerEventHandlers();
    }
    async handleChatMessage(msg) {
      const {
        commandType,
        command,
        flags,
        attributes
      } = this.InputParser.parse(msg);
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
      const targets = this.getTargets(msg, flags);
      if (targets.length === 0 && actualCommand !== Commands.SET_ATTR_CONFIG) {
        this.errors.push(`No valid targets found for command ${actualCommand}.`);
        this.sendMessages();
        return;
      }
      TimerManager.start("chatsetattr", 8e3, this.sendDelayMessage);
      const response = await commandHandler.execute(flags, targets, attributes, msg);
      TimerManager.stop("chatsetattr");
      const feedback = this.extractFeedback(flags);
      this.messages.push(...response.messages);
      this.errors.push(...response.errors);
      const isSilent = flags.some((flag) => flag.name === Flags.SILENT);
      if (isSilent) {
        this.messages = [];
      }
      const isMuted = flags.some((flag) => flag.name === Flags.MUTE);
      if (isMuted) {
        this.messages = [];
        this.errors = [];
      }
      if (response.errors.length > 0 || response.messages.length > 0) {
        this.sendMessages(feedback);
        return;
      }
    }
    overrideCommandFromOptions(flags, command) {
      const commandFlags = [Flags.MOD, Flags.MOD, Flags.MOD_B, Flags.RESET, Flags.DEL];
      const commandOptions = flags.filter((flag) => commandFlags.includes(flag.name)).map((flag) => flag.name);
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
      }
    }
    getCommandHandler(command) {
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
      }
    }
    getTargets(msg, flags) {
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
    }
    getTargetsFromOptions(target, flags, selected) {
      switch (target) {
        case "all":
          return [];
        case "allgm":
          return [];
        case "allplayers":
          return [];
        case "name":
          const nameFlag = flags.find((flag) => flag.name === Flags.CHAR_NAME);
          if (!(nameFlag == null ? void 0 : nameFlag.value)) {
            this.errors.push(`Target 'name' requires a name flag.`);
            return [];
          }
          const names = nameFlag.value.split(",").map((name) => name.trim());
          return names;
        case "charid":
          const idFlag = flags.find((flag) => flag.name === Flags.CHAR_ID);
          if (!(idFlag == null ? void 0 : idFlag.value)) {
            this.errors.push(`Target 'charid' requires an ID flag.`);
            return [];
          }
          const ids = idFlag.value.split(",").map((id) => id.trim());
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
    }
    convertObjectsToIDs(objects) {
      if (!objects) return [];
      const ids = objects.map((object) => object._id);
      return ids;
    }
    getTargetStrategy(target) {
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
    }
    targetFromOptions(flags) {
      const targetFlags = [Flags.ALL, Flags.ALL_GM, Flags.ALL_PLAYERS, Flags.CHAR_ID, Flags.CHAR_NAME, Flags.SELECTED];
      const targetOptions = flags.filter((flag) => targetFlags.includes(flag.name)).map((flag) => flag.name);
      const targetOverride = targetOptions[0];
      return targetOverride || false;
    }
    sendMessages(feedback) {
      const sendErrors = this.errors.length > 0;
      const from = (feedback == null ? void 0 : feedback.sender) || "ChatSetAttr";
      const whisper = (feedback == null ? void 0 : feedback.whisper) ?? true;
      if (sendErrors) {
        const header2 = "ChatSetAttr Error";
        const content2 = this.errors.map((error2) => error2.startsWith("<") ? error2 : `<p>${error2}</p>`).join("");
        const error = new ChatOutput({
          header: header2,
          content: content2,
          from,
          type: "error",
          whisper
        });
        error.send();
        this.errors = [];
        this.messages = [];
      }
      const sendMessage = this.messages.length > 0 || feedback;
      if (!sendMessage) {
        return;
      }
      const header = (feedback == null ? void 0 : feedback.header) || "ChatSetAttr Info";
      const type = this.errors.length > 0 ? "error" : "info";
      const messageContent = this.messages.map((message2) => message2.startsWith("<") ? message2 : `<p>${message2}</p>`).join("");
      const content = ((feedback == null ? void 0 : feedback.content) || "") + messageContent;
      const message = new ChatOutput({ header, content, from, type, whisper });
      message.send();
      this.errors = [];
      this.messages = [];
    }
    sendDelayMessage() {
      const message = new ChatOutput({
        header: "ChatSetAttr",
        content: "Your command is taking a long time to execute. Please be patient, the process will finish eventually.",
        from: "ChatSetAttr",
        type: "info",
        whisper: true
      });
      message.send();
    }
    extractFeedback(flags) {
      const hasFeedback = flags.some((flag) => flag.name === Flags.FB_CONTENT || flag.name === Flags.FB_HEADER || flag.name === Flags.FB_FROM || flag.name === Flags.FB_PUBLIC);
      if (!hasFeedback) {
        return null;
      }
      const headerFlag = flags.find((flag) => flag.name === Flags.FB_HEADER);
      const fromFlag = flags.find((flag) => flag.name === Flags.FB_FROM);
      const publicFlag = flags.find((flag) => flag.name === Flags.FB_PUBLIC);
      const header = headerFlag == null ? void 0 : headerFlag.value;
      const sender = fromFlag == null ? void 0 : fromFlag.value;
      const whisper = publicFlag === void 0;
      return {
        header,
        sender,
        whisper
      };
    }
    static checkInstall() {
      var _a;
      log(`[ChatSetAttr] Version: ${VERSION}`);
      if (((_a = state.ChatSetAttr) == null ? void 0 : _a.version) !== SCHEMA_VERSION) {
        log(`[ChatSetAttr] Updating Schema to v${SCHEMA_VERSION}`);
        state.ChatSetAttr = {
          version: SCHEMA_VERSION,
          globalconfigCache: {
            lastSaved: 0
          },
          playersCanModify: false,
          playersCanEvaluate: false,
          useWorkers: true
        };
      }
      this.checkGlobalConfig();
    }
    static checkGlobalConfig() {
      var _a;
      const localState = state.ChatSetAttr;
      const globalState = (globalconfig == null ? void 0 : globalconfig.chatsetattr) ?? {};
      const lastSavedGlobal = (globalState == null ? void 0 : globalState.lastSaved) || 0;
      const lastSavedLocal = ((_a = localState.globalconfigCache) == null ? void 0 : _a.lastSaved) || 0;
      if (lastSavedGlobal > lastSavedLocal) {
        const date = new Date(lastSavedGlobal * 1e3);
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
      };
    }
    registerEventHandlers() {
      on("chat:message", (...args) => this.handleChatMessage(...args));
      ChatSetAttr.checkInstall();
    }
    static registerObserver(event, callback) {
      globalSubscribeManager.subscribe(event, callback);
    }
    static unregisterObserver(event, callback) {
      globalSubscribeManager.unsubscribe(event, callback);
    }
  }
  on("ready", () => {
    new ChatSetAttr();
  });
  const main = {
    registerObserver: ChatSetAttr.registerObserver,
    unregisterObserver: ChatSetAttr.unregisterObserver
  };
  return main;
}();
