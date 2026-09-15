export function toStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
};

export function calculateBoundValue(
  value?: number,
  max?: number
): number {
  if (value === undefined || max === undefined) {
    return value || 0;
  }
  return Math.min(value, max);
};

export function cleanValue(value: string): string {
  return value.trim().replace(/^['"](.*)['"]$/g, "$1");
};

export function getCharName(
  targetID: string
): string {
  const character = getObj("character", targetID);
  if (character) {
    return character.get("name");
  }
  return `ID: ${targetID}`;
};

export function asyncTimeout(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};