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
    const value = await getSheetItem(character.id, attributeName, "current");
    const max = await getSheetItem(character.id, attributeName, "max");
    const attributeValue: AttributeDelta = {};
    if (value) {
      attributeValue.value = value;
    }
    if (max) {
      attributeValue.max = max;
    }
    if (!value && !max) {
      return null;
    }
    return attributeValue;
  };

  private static async createAttribute(
    character: Roll20Character,
    name: string,
    value?: string,
    max?: string,
  ): Promise<[ErrorResponse]> {
    const errors: string[] = [];
    const messages: string[] = [];
    const newObjProps: Partial<Roll20Attribute["properties"]> = {
      name,
      _characterid: character?.id,
    };
    const newAttr = createObj("attribute", newObjProps);
    await APIWrapper.setAttribute(character.id, name, value, max);
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
    const attr = await APIWrapper.getAttribute(character, name)
    if (!attr) {
      errors.push(`updateAttribute: Attribute ${name} does not exist for character with ID ${character?.id}.`);
      return [{ messages, errors }];
    }
    const oldAttr = JSON.parse(JSON.stringify(attr));
    await APIWrapper.setAttribute(character.id, name, value, max);
    messages.push(`Setting <strong>${name}</strong> to <strong>${value}</strong> for character <strong>${character?.get("name")}</strong>.`);
    globalSubscribeManager.publish("change", { name, current: value, max }, { name, current: oldAttr.value, max: oldAttr.max });
    return [{ messages, errors }];
  };

  public static async setAttributeOld(
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

  private static async setWithWorker(
    characterID: string,
    attr: string,
    value?: string,
    max?: string
  ): Promise<void> {
    const attrObj = await APIWrapper.getAttr(
      { id: characterID } as Roll20Character,
      attr
    );
    if (!attrObj) {
      return;
    }
    attrObj.setWithWorker({
      current: value,
    });
    if (max) {
      attrObj.setWithWorker({
        max,
      });
    }
  };

  private static async setAttribute(
    characterID: string,
    attr: string,
    value?: string,
    max?: string
  ): Promise<void> {
    if (state.ChatSetAttr.useWorkers) {
      await APIWrapper.setWithWorker(characterID, attr, value, max);
      return;
    }
    if (value) {
      const newValue = await setSheetItem(characterID, attr, value, "current");
      log(`setAttribute: Setting ${attr} to ${JSON.stringify(newValue)} for character with ID ${characterID}.`);
    }
    if (max) {
      const newMax = await setSheetItem(characterID, attr, max, "max");
      log(`setAttribute: Setting ${attr} max to ${JSON.stringify(newMax)} for character with ID ${characterID}.`);
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
      if (!attribute?.value) {
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
      if (!attribute?.value) {
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
      const attr = await APIWrapper.getAttribute(character, attribute);
      const value = attr?.value;
      if (!value) {
        errors.push(`resetAttributes: Attribute ${attribute} does not exist for character with ID ${character?.id}.`);
        continue;
      }
      const max = attr.max;
      if (!max) {
        continue;
      }
      const oldAttr = JSON.parse(JSON.stringify(attr));
      APIWrapper.setAttribute(character.id, attribute, max);
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