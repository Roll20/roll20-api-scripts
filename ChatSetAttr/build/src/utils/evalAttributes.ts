import type { DeltasObject } from "../classes/APIWrapper";
import type { ErrorResponse } from "../classes/ErrorManager";

export function evalAttributes(values: DeltasObject): [DeltasObject, ErrorResponse] {
  const evaluatedValues: DeltasObject = {};
  const messages: string[] = [];
  const errors: string[] = [];
  for (const [key, value] of Object.entries(values)) {
    let evaledValue: any;
    let evaledMax: any;

    try {
      evaledValue = eval(value.value ?? "");
    } catch (error) {
      errors.push(`Error evaluating expression for ${key}: ${value.value}`);
      evaledValue = value.value;
    }

    if (value.max) {
      try {
        evaledMax = eval(value.max);
      } catch (error) {
        errors.push(`Error evaluating expression for ${key}: ${value.max}`);
        evaledMax = value.max;
      }
    }

    evaluatedValues[key] = {
      value: evaledValue,
      max: evaledMax,
    };
  }
  return [evaluatedValues, { messages, errors }];
};