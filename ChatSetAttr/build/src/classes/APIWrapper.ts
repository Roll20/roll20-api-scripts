import _ from "underscore";
import { globalSubscribeManager } from "./SubscriptionManager";

export type AttributeDelta = {
  value?: string;
  max?: string;
};

export type DeltasObject = {
  [key: string]: AttributeDelta;
};

export type ErrorResponse = {
  messages: string[];
  errors: string[];
};

export class APIWrapper {
  // #region Attributes
  public static async getAllAttrs(
    character: Roll20Character
  ): Promise<Roll20Attribute[]> {
    const attrs = findObjs<"attribute">({
      _type: "attribute",
      _characterid: character?.id,
    });
    return attrs;
  };

  public static async getAttr(
    character: Roll20Character,
    attributeName: string
  ): Promise<Roll20Attribute | null> {
    const attr = findObjs<"attribute">({
      _type: "attribute",
      _characterid: character?.id,
      name: attributeName,
    })[0];
    if (!attr) {
      return null;
    }
    return attr;
  };

  public static async getAttributes(
    character: Roll20Character,
    attributeList: string[]
  ): Promise<DeltasObject> {
    const attributes: DeltasObject = {};
    for (const attribute of attributeList) {
      const value = await APIWrapper.getAttribute(character, attribute);
      if (!value) {
        continue;
      }
      attributes[attribute] = value;
    }
    return attributes;
  };

  public static async getAttribute(
    character: Roll20Character,
    attributeName: string
  ): Promise<AttributeDelta | null> {
    if (!character) {
      return null;
    }
    const attr = findObjs<"attribute">({
      _type: "attribute",
      _characterid: character?.id,
      name: attributeName,
    })[0];
    if (!attr) {
      return null;
    }
    const value = attr.get("current");
    const max = attr.get("max");
    const attributeValue: AttributeDelta = {
      value: value,
    };
    if (max) {
      attributeValue.max = max;
    }
    return attributeValue;
  };

  private static async createAttribute(
    character: Roll20Character,
    name: string,
    value?: string,
    max?: string,
    repeatingID?: string
  ): Promise<[ErrorResponse]> {
    const errors: string[] = [];
    const messages: string[] = [];
    const attrName = repeatingID ? name.replace("-CREATE", repeatingID) : name;
    const newObjProps: Partial<Roll20Attribute["properties"]> = {
      name: attrName,
      _characterid: character?.id,
    };
    const newAttr = createObj("attribute", newObjProps);
    await APIWrapper.setAttribute(newAttr, value, max);
    globalSubscribeManager.publish("add", newAttr);
    // This is how the previous script was doing it
    globalSubscribeManager.publish("change", newAttr, newAttr);
    messages.push(`Created attribute <strong>${name}</strong> with value <strong>${value}</strong> for character <strong>${character?.get("name")}</strong>.`);
    return [{ messages, errors }];
  };

  private static async updateAttribute(
    character: Roll20Character,
    name: string,
    value?: string,
    max?: string
  ): Promise<[ErrorResponse]> {
    const errors: string[] = [];
    const messages: string[] = [];
    const attr = findObjs<"attribute">({
      _type: "attribute",
      _characterid: character?.id,
      name,
    })[0];
    if (!attr) {
      errors.push(`updateAttribute: Attribute ${name} does not exist for character with ID ${character?.id}.`);
      return [{ messages, errors }];
    }
    const oldAttr = JSON.parse(JSON.stringify(attr));
    await APIWrapper.setAttribute(attr, value, max);
    messages.push(`Setting <strong>${name}</strong> to <strong>${value}</strong> for character <strong>${character?.get("name")}</strong>.`);
    globalSubscribeManager.publish("change", attr, oldAttr);
    return [{ messages, errors }];
  };

  private static async setAttribute(
    attr: Roll20Attribute,
    value?: string,
    max?: string
  ): Promise<void> {
    if (state.ChatSetAttr.useWorkers) {
      attr.setWithWorker({ current: value });
    } else {
      attr.set({ current: value });
    }
    if (max) {
      if (state.ChatSetAttr.useWorkers) {
        attr.setWithWorker({ max });
      }
      else {
        attr.set({ max });
      }
    }
  };

  public static async setAttributesOnly(
    character: Roll20Character,
    attributes: DeltasObject
  ): Promise<[ErrorResponse]> {
    const errors: string[] = [];
    const messages: string[] = [];
    const entries = Object.entries(attributes);
    for (const [key, value] of entries) {
      const attribute = await APIWrapper.getAttribute(character, key);
      if (!attribute) {
        errors.push(`setAttribute: ${key} does not exist for character with ID ${character?.id}.`);
        return [{ messages, errors }];
      }
      const stringValue = value.value ? value.value.toString() : undefined;
      const stringMax = value.max ? value.max.toString() : undefined;
      const [response] = await APIWrapper.updateAttribute(character, key, stringValue, stringMax);
      messages.push(...response.messages);
      errors.push(...response.errors);
    }
    return [{ messages, errors }];
  };

  public static async setAttributes(
    character: Roll20Character,
    attributes: DeltasObject
  ): Promise<[ErrorResponse]> {
    const errors: string[] = [];
    const messages: string[] = [];
    const entries = Object.entries(attributes);
    for (const [key, value] of entries) {
      const stringValue = value.value ? value.value.toString() : "";
      const stringMax = value.max ? value.max.toString() : undefined;
      const attribute = await APIWrapper.getAttribute(character, key);
      if (!attribute) {
        const [response] = await APIWrapper.createAttribute(character, key, stringValue, stringMax);
        messages.push(...response.messages);
        errors.push(...response.errors);
      }
      else {
        const [response] = await APIWrapper.updateAttribute(character, key, stringValue, stringMax);
        messages.push(...response.messages);
        errors.push(...response.errors);
      }
    }
    return [{ messages, errors }];
  };

  public static async deleteAttributes(
    character: Roll20Character,
    attributes: string[]
  ): Promise<[ErrorResponse]> {
    const errors: string[] = [];
    const messages: string[] = [];
    for (const attribute of attributes) {
      const attr = await APIWrapper.getAttr(character, attribute);
      if (!attr) {
        errors.push(`deleteAttributes: Attribute ${attribute} does not exist for character with ID ${character?.id}.`);
        continue;
      }
      const oldAttr = JSON.parse(JSON.stringify(attr));
      attr.remove();
      globalSubscribeManager.publish("destroy", oldAttr);
      messages.push(`Attribute ${attribute} deleted for character with ID ${character?.id}.`);
    }
    return [{ messages, errors }];
  };

  public static async resetAttributes(
    character: Roll20Character,
    attributes: string[]
  ): Promise<[ErrorResponse]> {
    const errors: string[] = [];
    const messages: string[] = [];
    for (const attribute of attributes) {
      const attr = await APIWrapper.getAttr(character, attribute);
      if (!attr) {
        errors.push(`resetAttributes: Attribute ${attribute} does not exist for character with ID ${character?.id}.`);
        continue;
      }
      const max = attr.get("max");
      if (!max) {
        errors.push(`resetAttributes: Attribute ${attribute} does not have a max value for character with ID ${character?.id}.`);
        continue;
      }
      const oldAttr = JSON.parse(JSON.stringify(attr));
      APIWrapper.setAttribute(attr, max);
      globalSubscribeManager.publish("change", attr, oldAttr);
      messages.push(`Attribute ${attribute} reset for character with ID ${character?.id}.`);
    }
    return [{ messages, errors }];
  };

  // #endregion Attributes

  // #region Repeating Attributes
  public static extractRepeatingDetails(attributeName: string) {
    const [, section, repeatingID, ...attributeParts] = attributeName.split("_");
    const attribute = attributeParts.join("_");
    if (!section || !repeatingID || !attribute) {
      return null;
    }
    return {
      section,
      repeatingID,
      attribute,
    };
  };

  public static hasRepeatingAttributes(
    attributes: DeltasObject
  ): boolean {
    return Object.keys(attributes).some((key) => key.startsWith("repeating_"));
  };
};