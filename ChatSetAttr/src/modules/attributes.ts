import type { Attribute, AttributeRecord, AttributeValue } from "../types";

// #region Get Attributes
async function getSingleAttribute(target: string, attributeName: string): Promise<AttributeValue> {
  const isMax = attributeName.endsWith("_max");
  const type = isMax ? "max" : "current";
  if (isMax) {
    attributeName = attributeName.slice(0, -4); // remove '_max'
  }
  try {
    const attribute = await libSmartAttributes.getAttribute(target, attributeName, type);
    return attribute;
  } catch {
    return undefined;
  }
};

export async function getAttributes(
  target: string,
  attributeNames: string[] | AttributeRecord,
): Promise<AttributeRecord> {
  const attributes: AttributeRecord = {};
  if (Array.isArray(attributeNames)) {
    for (const name of attributeNames) {
      const cleanName = name.replace(/[^a-zA-Z0-9_]/g, "");
      attributes[cleanName] = await getSingleAttribute(target, cleanName);
    }
  } else {
    for (const name in attributeNames) {
      const cleanName = name.replace(/[^a-zA-Z0-9_]/g, "");
      attributes[cleanName] = await getSingleAttribute(target, cleanName);
    }
  }
  return attributes;
};

// #region Set Attributes
export async function setSingleAttribute(
  target: string,
  attributeName: string,
  value: string | number | boolean,
  options: Record<string, boolean>,
  isMax?: boolean
): Promise<void> {
  const type = isMax ? "max" : "current";
  await libSmartAttributes.setAttribute(target, attributeName, value, type, options);
};

export async function setAttributes(
  target: string,
  attributes: Attribute[],
  options: Record<string, boolean>
): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const attr of attributes) {
    if (attr.current === undefined && attr.max === undefined) {
      throw new Error("Attribute must have at least a current or max value defined.");
    }
    if (attr.name === undefined) {
      throw new Error("Attribute must have a name defined.");
    }
    if (attr.current !== undefined) {
      const promise = setSingleAttribute(target, attr.name, attr.current, options);
      promises.push(promise);
    }
    if (attr.max !== undefined) {
      const isMax = true;
      const promise = setSingleAttribute(target, attr.name, attr.max, options, isMax);
      promises.push(promise);
    }
  }
  await Promise.all(promises);
};

// #region Delete Attributes
export async function deleteSingleAttribute(
  target: string,
  attributeName: string,
): Promise<void> {
  await libSmartAttributes.deleteAttribute(target, attributeName);
};

export async function deleteAttributes(
  target: string,
  attributeNames: string[],
): Promise<void> {
  const promises: Promise<boolean | void>[] = [];
  for (const name of attributeNames) {
    const promise = libSmartAttributes.deleteAttribute(target, name);
    promises.push(promise);
  }
  await Promise.all(promises);
};