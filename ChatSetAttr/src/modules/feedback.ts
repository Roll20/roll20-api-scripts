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

  const targetValueKeys = Object.keys(targetValues).filter(key => !key.endsWith("_max"));
  message = message.replace("_CHARNAME_", characterName);

  message = message.replace(/_(NAME|TCUR|TMAX|CUR|MAX)(\d+)_/g, (_, key: string, num: string) => {
    const index = parseInt(num, 10);
    const attributeName = targetValueKeys[index];

    if (!attributeName) return "";

    const targetCurrent = startingValues[attributeName];
    const targetMax = startingValues[`${attributeName}_max`];
    const startingCurrent = targetValues[attributeName];
    const startingMax = targetValues[`${attributeName}_max`];

    switch (key) {
      case "NAME":
        return attributeName;
      case "TCUR":
        return `${targetCurrent}`;
      case "TMAX":
        return `${targetMax}`;
      case "CUR":
        return `${startingCurrent}`;
      case "MAX":
        return `${startingMax}`;
      default:
        return "";
    }
  });

  return message;
};