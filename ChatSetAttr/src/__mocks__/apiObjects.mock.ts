import { vi } from "vitest";
import { debugLog, debugWarn } from "./utility.mock";

const allObjects: AnyRoll20Object[] = [];

export function resetAllObjects(): void {
  allObjects.length = 0;
}

function createRandomId(): string {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
};

type ObjProps<T extends Roll20ObjectType> = Roll20ObjectTypeToInstance[T]["properties"];

export class MockObject<T extends Roll20ObjectType> implements Roll20Object<ObjProps<T>> {
  id = createRandomId();
  properties: ObjProps<T>;

  constructor(type: Roll20ObjectType, initialProperties: Record<string, unknown>) {
    if (initialProperties.id) {
      this.id = String(initialProperties.id);
    }
    if (initialProperties._id) {
      this.id = String(initialProperties._id);
    }
    const allProperties: Record<string, unknown> = { _id: this.id, _type: type };
    for (const key in initialProperties) {
      const fixedKey = key.startsWith("_") ? key : `_${key}`;
      allProperties[fixedKey] = initialProperties[key];
    }
    this.properties = allProperties as ObjProps<T>;
  }

  get = vi.fn(<K extends keyof ObjProps<T>>(key: K) => {
    if (typeof key !== "string") {
      throw new Error("Key must be a string");
    }
    const fixedKey = key.startsWith("_") ? key : `_${key}` as K;
    return this.properties[fixedKey] as ObjProps<T>[K];
  });

  set = vi.fn((properties: Partial<ObjProps<T>>) => {
    const updatedProperties: Record<string, unknown> = {};
    for (const key in properties) {
      const fixedKey = key.startsWith("_") ? key : `_${key}`;
      updatedProperties[fixedKey] = properties[key];
    }
    this.properties = { ...this.properties, ...updatedProperties };
    return this;
  });

  setWithWorker = vi.fn(this.set);

  remove = vi.fn(() => {
    const index = allObjects.findIndex(obj => obj.id === this.id);
    if (index !== -1) {
      allObjects.splice(index, 1);
    }
  });
};

export type AnyRoll20Properties = Roll20ObjectTypeToInstance[Roll20ObjectType]["properties"];
export type AnyRoll20Object = Roll20Object<AnyRoll20Properties>;
export type SpecificRoll20Object<T extends Roll20ObjectType> = Roll20Object<Roll20ObjectTypeToInstance[T]["properties"]>;

export function mockGetObj<T extends Roll20ObjectType>(
  type: T,
  id: string
): Roll20ObjectTypeToInstance[T] | undefined {
  debugLog("=================================");
  debugLog(`mockGetObj called with type: ${type}, id: ${id}`);
  debugLog("Current allObjects:", allObjects.map(obj => obj.id));
  const found = allObjects.find(obj => {
    debugLog(`Checking object: ${obj.id} of type ${obj.properties._type}`);
    return obj.properties._type === type && obj.id === id;
  }) as Roll20ObjectTypeToInstance[T] | undefined;
  if (found) {
    debugLog(`Found object: ${found.id} of type ${found.properties._type}`);
  } else {
    debugLog(`No matching object found: ${type}, ${id}`);
  }
  return found;
};

export function mockFindObjs<T extends Roll20ObjectType>(
  attrs: Partial<Roll20ObjectTypeToInstance[T]["properties"]> & { _type: T },
): Roll20ObjectTypeToInstance[T][] {
  debugLog("=================================");
  debugLog("mockFindObjs called with attrs:", attrs);
  debugLog("Current allObjects:", allObjects.map(obj => obj.id));
  const filteredObjects = allObjects.filter(obj => {
    if (obj.properties._type !== attrs._type) {
      return false;
    }
    for (const [key, value] of Object.entries(attrs)) {
      const fixedKey = key.startsWith("_") ? key : `_${key}`;
      if (key === "type" || key === "_type") continue;
      if (!Object.hasOwn(obj.properties, fixedKey)) {
        debugWarn(`Property ${fixedKey} not found on object ${obj.id}`);
        return false;
      }
      if ((obj.properties as Record<string, unknown>)[fixedKey] !== value) {
        debugWarn(`Property ${fixedKey} on object ${obj.id} has value ${(obj.properties as Record<string, unknown>)[fixedKey]}, expected ${value}`);
        return false;
      }
    }
    return true;
  }) as unknown as Roll20ObjectTypeToInstance[T][];
  if (filteredObjects.length > 0) {
    debugLog(`Found ${filteredObjects.length} matching objects:`, filteredObjects.map(o => o.id));
  } else {
    debugWarn("No matching objects found");
  }
  return filteredObjects;
};

export function mockCreateObj<T extends Roll20ObjectType>(
  type: T,
  properties: Roll20ObjectTypeToInstance[T]["properties"]
): Roll20ObjectTypeToInstance[T] {
  debugLog("=================================");
  debugLog("***");
  debugLog(`mockCreateObj called with type: ${type}, properties:`, properties);
  const newObj = new MockObject(type, properties) as unknown as Roll20ObjectTypeToInstance[T];
  allObjects.push(newObj);
  return newObj;
};

export function mockGetAllObjs(): Roll20Object<Record<string, unknown>>[] {
  debugLog("=================================");
  debugLog("mockGetAllObjs called");
  debugLog("Current allObjects:", allObjects.map(obj => obj.id));
  return [...allObjects];
};

export function mockGetAttrByName(characterId: string, attrName: string, type: "current" | "max") {
  const attrs = mockFindObjs({ _type: "attribute", _characterid: characterId, name: attrName });
  const attr = attrs.length > 0 ? attrs[0] : undefined;
  if (!attr) {
    return undefined;
  }
  if (type === "current") {
    return attr.get("current");
  } else {
    return attr.get("max");
  }
};
