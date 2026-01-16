import { vi } from "vitest";

let debugMode = false;

export function debugLog(...args: unknown[]): void {
  if (debugMode) {
    console.log(...args);
  }
}

export function debugWarn(...args: unknown[]): void {
  if (debugMode) {
    console.warn(...args);
  }
}

export function startDebugMode(): void {
  debugMode = true;
}

export function endDebugMode(): void {
  debugMode = false;
}

export function isDebugMode(): boolean {
  return debugMode;
}

export const log = vi.fn((...args: unknown[]): void => {
  debugLog(...args);
});
