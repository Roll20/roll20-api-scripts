import type {
  AttributeRecord,
  AttributeValue,
  ObserverAttributeKind,
  ObserverAttributeObject,
  ObserverAttributeSnapshot,
  ObserverCallbackTarget,
} from "../types";

export type MergedAttributeState = {
  current: string;
  max: string;
  priorCurrent: string;
  priorMax: string;
};

const WRITABLE_KEYS = new Set(["current", "max"]);

function normalizeKey(key: string): string {
  return key.startsWith("_") ? key.slice(1) : key;
};

function toAttrString(value: AttributeValue | undefined): string {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
};

function hasSheetItemValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "";
};

function hasPriorValue(value: AttributeValue | undefined): boolean {
  return value !== undefined && value !== null && value !== "";
};

export function toSnapshot(
  targetId: string,
  actualName: string,
  kind: ObserverAttributeKind,
  state: Pick<MergedAttributeState, "current" | "max">,
  id = "",
): ObserverAttributeSnapshot {
  return {
    _id: id,
    _type: kind,
    _characterid: targetId,
    name: actualName,
    current: state.current,
    max: state.max,
  };
};

export function emptySnapshot(
  targetId: string,
  actualName: string,
  kind: ObserverAttributeKind,
  id = "",
): ObserverAttributeSnapshot {
  return toSnapshot(targetId, actualName, kind, { current: "", max: "" }, id);
};

export function mergeAttributeState(
  targetId: string,
  actualName: string,
  priorValues: Record<string, AttributeRecord>,
  results: Record<string, AttributeRecord>,
  isDelete: boolean,
): MergedAttributeState {
  const maxKey = `${actualName}_max`;
  const priorCurrent = priorValues[targetId]?.[actualName];
  const priorMax = priorValues[targetId]?.[maxKey];

  if (isDelete) {
    return {
      current: toAttrString(priorCurrent),
      max: toAttrString(priorMax),
      priorCurrent: toAttrString(priorCurrent),
      priorMax: toAttrString(priorMax),
    };
  }

  const newCurrent = results[targetId]?.[actualName];
  const newMax = results[targetId]?.[maxKey];

  return {
    current: newCurrent !== undefined ? toAttrString(newCurrent) : toAttrString(priorCurrent),
    max: newMax !== undefined ? toAttrString(newMax) : toAttrString(priorMax),
    priorCurrent: toAttrString(priorCurrent),
    priorMax: toAttrString(priorMax),
  };
};

export function tryFindLegacyAttribute(
  targetId: string,
  actualName: string,
): Roll20Attribute | undefined {
  return findObjs({
    _type: "attribute",
    _characterid: targetId,
    name: actualName,
  })[0];
};

export function isLegacySheet(targetId: string): boolean {
  const character = getObj("character", targetId);
  if (!character) {
    return false;
  }
  return character.sheetEnvironment === "legacy" || character.sheetEnvironment === undefined;
};

function legacyAttributeForSheet(
  targetId: string,
  actualName: string,
): Roll20Attribute | undefined {
  if (!isLegacySheet(targetId)) {
    return undefined;
  }
  return tryFindLegacyAttribute(targetId, actualName);
};

export async function resolveObserverKind(
  targetId: string,
  actualName: string,
): Promise<ObserverAttributeKind> {
  if (isLegacySheet(targetId)) {
    return "attribute";
  }

  const computed = await getSheetItem(targetId, actualName, "current");
  const computedMax = await getSheetItem(targetId, actualName, "max");
  if (hasSheetItemValue(computed) || hasSheetItemValue(computedMax)) {
    return "computed";
  }

  const userAttr = await getSheetItem(targetId, `user.${actualName}`, "current");
  const userMax = await getSheetItem(targetId, `user.${actualName}`, "max");
  if (hasSheetItemValue(userAttr) || hasSheetItemValue(userMax)) {
    return "userAttribute";
  }

  return "computed";
};

export function isNewAttributeOrUser(
  kind: ObserverAttributeKind,
  state: MergedAttributeState,
): boolean {
  if (kind === "computed") {
    return false;
  }
  return state.priorCurrent === "" && state.priorMax === "";
};

function sheetItemPath(kind: ObserverAttributeKind, actualName: string): string {
  return kind === "userAttribute" ? `user.${actualName}` : actualName;
};

async function writeSheetItemValue(
  characterId: string,
  kind: ObserverAttributeKind,
  actualName: string,
  key: string,
  value: string,
): Promise<boolean> {
  const normalized = normalizeKey(key);
  if (!WRITABLE_KEYS.has(normalized)) {
    return false;
  }

  const type = normalized as "current" | "max";
  const path = sheetItemPath(kind, actualName);

  try {
    await setSheetItem(characterId, path, value, type, {
      allowThrow: true,
      createAttr: true,
      withWorker: true,
    });
    return true;
  } catch {
    return false;
  }
};

export function createObserverAttributeObject(
  targetId: string,
  actualName: string,
  kind: ObserverAttributeKind,
  state: Pick<MergedAttributeState, "current" | "max">,
  id = "",
): ObserverAttributeObject {
  const snapshot = toSnapshot(targetId, actualName, kind, state, id);

  const obj: ObserverAttributeObject = {
    get(key: string) {
      const normalized = normalizeKey(key);
      const byKey: Record<string, string | undefined> = {
        id: snapshot._id,
        _id: snapshot._id,
        type: snapshot._type,
        _type: snapshot._type,
        characterid: snapshot._characterid,
        _characterid: snapshot._characterid,
        name: snapshot.name,
        current: snapshot.current,
        max: snapshot.max,
      };
      return byKey[normalized] ?? byKey[key];
    },

    set(keyOrProps: string | Partial<ObserverAttributeSnapshot>, value?: string) {
      const updates: Partial<Pick<ObserverAttributeSnapshot, "current" | "max">> = {};

      if (typeof keyOrProps === "string") {
        const normalized = normalizeKey(keyOrProps);
        if (WRITABLE_KEYS.has(normalized) && value !== undefined) {
          updates[normalized as "current" | "max"] = value;
        }
      } else {
        if (keyOrProps.current !== undefined) {
          updates.current = keyOrProps.current;
        }
        if (keyOrProps.max !== undefined) {
          updates.max = keyOrProps.max;
        }
      }

      for (const [key, nextValue] of Object.entries(updates)) {
        if (nextValue === undefined) {
          continue;
        }
        void writeSheetItemValue(targetId, kind, actualName, key, nextValue).then(ok => {
          if (ok) {
            snapshot[key as "current" | "max"] = nextValue;
          }
        });
      }

      return obj;
    },

    toJSON() {
      return { ...snapshot };
    },
  };

  return obj;
};

export function resolveObserverDestroyObj(
  targetId: string,
  actualName: string,
  kind: ObserverAttributeKind,
): ObserverCallbackTarget | undefined {
  if (kind !== "attribute" || !isLegacySheet(targetId)) {
    return undefined;
  }
  return tryFindLegacyAttribute(targetId, actualName);
};

export function resolveObserverObj(
  targetId: string,
  actualName: string,
  kind: ObserverAttributeKind,
  state: MergedAttributeState,
): ObserverCallbackTarget {
  if (kind === "attribute") {
    const legacyAttr = legacyAttributeForSheet(targetId, actualName);
    if (legacyAttr) {
      return legacyAttr;
    }
  }

  const legacyAttr = legacyAttributeForSheet(targetId, actualName);
  const id = legacyAttr?.get("_id") ?? "";
  return createObserverAttributeObject(targetId, actualName, kind, state, id);
};

export function resolveObserverAddObj(
  targetId: string,
  actualName: string,
  kind: ObserverAttributeKind,
  state: Pick<MergedAttributeState, "current" | "max">,
): ObserverCallbackTarget {
  if (kind === "attribute") {
    const legacyAttr = legacyAttributeForSheet(targetId, actualName);
    if (legacyAttr) {
      return legacyAttr;
    }
  }

  const legacyAttr = legacyAttributeForSheet(targetId, actualName);
  const id = legacyAttr?.get("_id") ?? "";
  return createObserverAttributeObject(targetId, actualName, kind, state, id);
};

export async function captureDeletePriorState(
  targetId: string,
  actualName: string,
  kind: ObserverAttributeKind,
  priorValues: Record<string, AttributeRecord>,
): Promise<MergedAttributeState> {
  const maxKey = `${actualName}_max`;
  let priorCurrent = priorValues[targetId]?.[actualName];
  let priorMax = priorValues[targetId]?.[maxKey];

  const legacyAttr = legacyAttributeForSheet(targetId, actualName);
  if (legacyAttr) {
    if (!hasPriorValue(priorCurrent)) {
      priorCurrent = legacyAttr.get("current");
    }
    if (!hasPriorValue(priorMax)) {
      priorMax = legacyAttr.get("max");
    }
  } else {
    const userCurrent = await getSheetItem(targetId, `user.${actualName}`, "current");
    const userMax = await getSheetItem(targetId, `user.${actualName}`, "max");
    const hasUserValues = hasSheetItemValue(userCurrent) || hasSheetItemValue(userMax);
    const path = hasUserValues || kind === "userAttribute"
      ? `user.${actualName}`
      : actualName;

    if (!hasPriorValue(priorCurrent)) {
      priorCurrent = await getSheetItem(targetId, path, "current");
    }
    if (!hasPriorValue(priorMax)) {
      priorMax = await getSheetItem(targetId, path, "max");
    }

    if (!hasPriorValue(priorCurrent) && hasUserValues) {
      priorCurrent = userCurrent;
    }
    if (!hasPriorValue(priorMax) && hasUserValues) {
      priorMax = userMax;
    }
  }

  const current = toAttrString(priorCurrent);
  const max = toAttrString(priorMax);
  return {
    current,
    max,
    priorCurrent: current,
    priorMax: max,
  };
};

export function logicalAttributeKey(target: string, actualName: string): string {
  return `${target}:${actualName}`;
};

export function parseResultKey(key: string): { target: string; name: string } {
  const separator = key.indexOf(":");
  return {
    target: key.slice(0, separator),
    name: key.slice(separator + 1),
  };
};

export function toActualName(name: string): { actualName: string; isMax: boolean } {
  const isMax = name.endsWith("_max");
  return {
    actualName: isMax ? name.slice(0, -4) : name,
    isMax,
  };
};
