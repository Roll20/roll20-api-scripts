import type { TimerMap } from "../types";

const timerMap: TimerMap = new Map();

export function startTimer(
  key: string,
  duration = 50,
  callback: () => void
): void {
  // Clear any existing timer for the same key
  const existingTimer = timerMap.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    callback();
    timerMap.delete(key);
  }, duration);

  timerMap.set(key, timer);
}

export function clearTimer(key: string): void {
  const timer = timerMap.get(key);
  if (timer) {
    clearTimeout(timer);
    timerMap.delete(key);
  }
}

export function clearAllTimers(): void {
  for (const timer of timerMap.values()) {
    clearTimeout(timer);
  }
  timerMap.clear();
}