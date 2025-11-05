import { type AttributeRecord, type Command } from "../types";
import { getConfig } from "./config";

type UpdateOptions = {
  noCreate?: boolean;
};

type UpdateResult = {
  errors: string[];
  messages: string[];
};

export async function makeUpdate(
  operation: Command,
  results: Record<string, AttributeRecord>,
  options?: UpdateOptions
): Promise<UpdateResult> {
  const isSetting = operation !== "delattr";
  const errors: string[] = [];
  const messages: string[] = [];

  const { noCreate = false } = options || {};
  const { setWithWorker = false } = getConfig() || {};
  const setOptions = {
    noCreate,
    setWithWorker,
  };

  for (const target in results) {
    for (const name in results[target]) {
      const isMax = name.endsWith("_max");
      const type = isMax ? "max" : "current";
      const actualName = isMax ? name.slice(0, -4) : name;

      if (isSetting) {
        const value = results[target][name] ?? "";

        try {
          await libSmartAttributes.setAttribute(target, actualName, value, type, setOptions);
        } catch (error: unknown) {
          errors.push(`Failed to set attribute '${name}' on target '${target}': ${String(error)}`);
        }

      } else {

        try {
          await libSmartAttributes.deleteAttribute(target, actualName, type);
        } catch (error: unknown) {
          errors.push(`Failed to delete attribute '${actualName}' on target '${target}': ${String(error)}`);
        }

      }
    }
  }

  return { errors, messages };
};