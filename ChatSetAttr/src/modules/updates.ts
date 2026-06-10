import { type AttributeRecord, type AttributeValue, type Command } from "../types";
import { getConfig } from "./config";
import { notifyObservers } from "./observer";
import {
  captureDeletePriorState,
  isLegacySheet,
  isNewAttributeOrUser,
  logicalAttributeKey,
  mergeAttributeState,
  resolveObserverAddObj,
  resolveObserverKind,
  resolveObserverObj,
  toActualName,
  toSnapshot,
} from "./observerPayload";

type UpdateOptions = {
  noCreate?: boolean;
  priorValues?: Record<string, AttributeRecord>;
  operation?: Command;
};

export type UpdateResult = {
  errors: string[];
  messages: string[];
  failed: string[];
};

type LogicalGroup = {
  target: string;
  actualName: string;
  keys: string[];
};

export function buildSetAttributeOptions(overrides: { noCreate?: boolean; setWithWorker?: boolean } = {}) {
  const { useWorkers = true } = getConfig() || {};
  return {
    noCreate: overrides.noCreate ?? false,
    setWithWorker: overrides.setWithWorker ?? useWorkers,
  };
};

function failureKey(target: string, name: string): string {
  return `${target}:${name}`;
};

function collectLogicalGroups(results: Record<string, AttributeRecord>): LogicalGroup[] {
  const groups = new Map<string, LogicalGroup>();

  for (const target in results) {
    for (const name in results[target]) {
      const { actualName } = toActualName(name);
      const key = logicalAttributeKey(target, actualName);
      const existing = groups.get(key);
      if (existing) {
        existing.keys.push(name);
      } else {
        groups.set(key, { target, actualName, keys: [name] });
      }
    }
  }

  return Array.from(groups.values());
};

function groupHasFailure(group: LogicalGroup, failed: Set<string>): boolean {
  return group.keys.some(name => failed.has(failureKey(group.target, name)));
};

function shouldSkipPairedMaxDelete(
  target: string,
  actualName: string,
  isMax: boolean,
  priorValues: Record<string, AttributeRecord>,
  results: Record<string, AttributeRecord>,
): boolean {
  if (!isMax) {
    return false;
  }

  const maxKey = `${actualName}_max`;
  const hasCompanionCurrent = Object.hasOwn(results[target], actualName);

  const character = getObj("character", target);
  if (character?.sheetEnvironment === "legacy") {
    return hasCompanionCurrent;
  }

  // Beacon userAttributes are removed when current is cleared; a follow-up max delete fails.
  if (hasCompanionCurrent) {
    return true;
  }

  if (!hasPriorValue(priorValues[target]?.[maxKey])) {
    return true;
  }

  return false;
};

function hasPriorValue(value: AttributeValue | undefined): boolean {
  return value !== undefined && value !== null && value !== "";
};

export async function makeUpdate(
  operation: Command,
  results: Record<string, AttributeRecord>,
  options?: UpdateOptions
): Promise<UpdateResult> {
  const isSetting = operation !== "delattr";
  const errors: string[] = [];
  const messages: string[] = [];
  const failed: string[] = [];
  const failedSet = new Set<string>();

  const { noCreate = false, priorValues = {} } = options || {};
  const setOptions = buildSetAttributeOptions({ noCreate });
  const deleteKinds = new Map<string, Awaited<ReturnType<typeof resolveObserverKind>>>();
  const deleteStates = new Map<string, Awaited<ReturnType<typeof captureDeletePriorState>>>();

  if (!isSetting) {
    for (const target in results) {
      for (const name in results[target]) {
        const { actualName } = toActualName(name);
        const groupKey = logicalAttributeKey(target, actualName);
        if (!deleteKinds.has(groupKey)) {
          deleteKinds.set(groupKey, await resolveObserverKind(target, actualName));
        }
        if (!deleteStates.has(groupKey)) {
          const kind = deleteKinds.get(groupKey) ?? await resolveObserverKind(target, actualName);
          deleteStates.set(
            groupKey,
            await captureDeletePriorState(target, actualName, kind, priorValues),
          );
        }
      }
    }
  }

  for (const target in results) {
    for (const name in results[target]) {
      const { actualName, isMax } = toActualName(name);
      const type = isMax ? "max" : "current";
      const key = failureKey(target, name);
      const newValue = results[target][name];

      if (isSetting) {
        const value = newValue ?? "";

        try {
          const ok = await libSmartAttributes.setAttribute(target, actualName, value, type, setOptions);
          if (!ok) {
            failed.push(key);
            failedSet.add(key);
            errors.push(`Failed to set attribute '${name}' on target '${target}'.`);
          }
        } catch (error: unknown) {
          failed.push(key);
          failedSet.add(key);
          errors.push(`Failed to set attribute '${name}' on target '${target}': ${String(error)}`);
        }

      } else {
        if (shouldSkipPairedMaxDelete(target, actualName, isMax, priorValues, results)) {
          continue;
        }

        try {
          const ok = await libSmartAttributes.deleteAttribute(target, actualName, type);
          if (!ok) {
            failed.push(key);
            failedSet.add(key);
            errors.push(`Failed to delete attribute '${actualName}' on target '${target}'.`);
          }
        } catch (error: unknown) {
          failed.push(key);
          failedSet.add(key);
          errors.push(`Failed to delete attribute '${actualName}' on target '${target}': ${String(error)}`);
        }

      }
    }
  }

  const groups = collectLogicalGroups(results);

  for (const group of groups) {
    if (groupHasFailure(group, failedSet)) {
      continue;
    }

    const groupKey = logicalAttributeKey(group.target, group.actualName);
    const state = isSetting
      ? mergeAttributeState(group.target, group.actualName, priorValues, results, false)
      : deleteStates.get(groupKey) ?? mergeAttributeState(
        group.target,
        group.actualName,
        priorValues,
        results,
        true,
      );
    const kind = isSetting
      ? await resolveObserverKind(group.target, group.actualName)
      : deleteKinds.get(logicalAttributeKey(group.target, group.actualName)) ?? await resolveObserverKind(group.target, group.actualName);

    if (isSetting) {
      const prev = toSnapshot(group.target, group.actualName, kind, {
        current: state.priorCurrent,
        max: state.priorMax,
      });
      const obj = resolveObserverObj(group.target, group.actualName, kind, state);

      if (isNewAttributeOrUser(kind, state)) {
        notifyObservers("add", resolveObserverAddObj(group.target, group.actualName, kind, state));
      }
      notifyObservers("change", obj, prev);
    } else {
      const obj = resolveObserverObj(group.target, group.actualName, kind, state);
      notifyObservers("destroy", obj);
    }
  }

  return { errors, messages, failed };
};
