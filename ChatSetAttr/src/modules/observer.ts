import type { AttributeValue, ObserverCallback, ObserverEvent, ObserverRecord } from "../types";

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
  targetID: string,
  attributeName: string,
  newValue: AttributeValue,
  oldValue: AttributeValue
): void {
  const callbacks = observers[event] || [];
  callbacks.forEach(callback => {
    callback(event, targetID, attributeName, newValue, oldValue);
  });
};