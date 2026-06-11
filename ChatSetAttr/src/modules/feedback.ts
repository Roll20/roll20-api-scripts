import type { AttributeRecord, FeedbackObject } from "../types";

export function createFeedbackMessage(
  characterName: string,
  feedback: FeedbackObject | undefined,
  startingValues: AttributeRecord,
  targetValues: AttributeRecord,
): string {
  let message = feedback?.content ?? "";
  // _NAMEJ_: will insert the attribute name.
  // _TCURJ_: will insert what you are changing the current value to (or changing by, if you're using --mod or --modb).
  // _TMAXJ_: will insert what you are changing the maximum value to (or changing by, if you're using --mod or --modb).
  // _CHARNAME_: will insert the character name.
  // _CURJ_: will insert the final current value of the attribute, for this character.
  // _MAXJ_: will insert the final maximum value of the attribute, for this character.

  const targetValueKeys = getChangedAttributeNames(targetValues);
  message = message.replace("_CHARNAME_", characterName);

  message = message.replace(/_(NAME|TCUR|TMAX|CUR|MAX)(\d+)_/g, (_, key: string, num: string) => {
    const index = parseInt(num, 10);
    const attributeName = targetValueKeys[index];

    if (!attributeName) return "";

    const sheetCurrent = startingValues[attributeName];
    const sheetMax = startingValues[`${attributeName}_max`];
    const resultCurrent = targetValues[attributeName];
    const resultMax = targetValues[`${attributeName}_max`];

    switch (key) {
      case "NAME":
        return attributeName;
      case "TCUR":
        return sheetCurrent !== undefined ? `${sheetCurrent}` : "";
      case "TMAX":
        return sheetMax !== undefined ? `${sheetMax}` : "";
      case "CUR": {
        const value = resultCurrent ?? sheetCurrent;
        return value !== undefined ? `${value}` : "";
      }
      case "MAX": {
        const value = resultMax ?? sheetMax;
        return value !== undefined ? `${value}` : "";
      }
      default:
        return "";
    }
  });

  return message;
};

function getChangedAttributeNames(targetValues: AttributeRecord): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const key of Object.keys(targetValues)) {
    const name = key.endsWith("_max") ? key.slice(0, -4) : key;
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }

  return names;
}