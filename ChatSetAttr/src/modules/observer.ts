import type {
  ObserverAttributeSnapshot,
  ObserverCallback,
  ObserverCallbackTarget,
  ObserverEvent,
  ObserverRecord,
} from "../types";

const observers: ObserverRecord = {};

export function registerObserver(
  event: ObserverEvent,
  callback: ObserverCallback
): void {
  if (!observers[event]) {
    observers[event] = [];
  }
  observers[event].push(callback);
};

export function notifyObservers(
  event: ObserverEvent,
  obj: ObserverCallbackTarget,
  prev?: ObserverAttributeSnapshot
): void {
  const callbacks = observers[event] || [];
  callbacks.forEach(callback => {
    callback(obj, prev);
  });
};