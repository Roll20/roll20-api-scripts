import { type AttributeRecord, type AttributeValue, type Command, type ObserverEvent } from "../types";
import { getConfig } from "./config";
import { notifyObservers } from "./observer";

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

function observerEvent(operation: Command, priorValue: AttributeValue | undefined, isDelete: boolean): ObserverEvent {
  if (isDelete) {
    return "destroy";
  }
  if (operation === "setattr" && priorValue === undefined) {
    return "add";
  }
  return "change";
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

  const { noCreate = false, priorValues = {}, operation: op = operation } = options || {};
  const setOptions = buildSetAttributeOptions({ noCreate });

  for (const target in results) {
    for (const name in results[target]) {
      const isMax = name.endsWith("_max");
      const type = isMax ? "max" : "current";
      const actualName = isMax ? name.slice(0, -4) : name;
      const key = failureKey(target, name);
      const priorValue = priorValues[target]?.[name];
      const newValue = results[target][name];

      if (isSetting) {
        const value = newValue ?? "";

        try {
          const ok = await libSmartAttributes.setAttribute(target, actualName, value, type, setOptions);
          if (!ok) {
            failed.push(key);
            errors.push(`Failed to set attribute '${name}' on target '${target}'.`);
            continue;
          }
          const event = observerEvent(op, priorValue, false);
          notifyObservers(event, target, name, newValue, priorValue);
        } catch (error: unknown) {
          failed.push(key);
          errors.push(`Failed to set attribute '${name}' on target '${target}': ${String(error)}`);
        }

      } else {

        try {
          const ok = await libSmartAttributes.deleteAttribute(target, actualName, type);
          if (!ok) {
            failed.push(key);
            errors.push(`Failed to delete attribute '${actualName}' on target '${target}'.`);
            continue;
          }
          notifyObservers("destroy", target, name, newValue, priorValue);
        } catch (error: unknown) {
          failed.push(key);
          errors.push(`Failed to delete attribute '${actualName}' on target '${target}': ${String(error)}`);
        }

      }
    }
  }

  return { errors, messages, failed };
};
