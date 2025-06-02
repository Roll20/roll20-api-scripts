export const ObserverTypes = {
  ADD: "add",
  CHANGE: "change",
  DESTROY: "destroy",
} as const;

export type ObserverType = typeof ObserverTypes[keyof typeof ObserverTypes];
const ObserverTypeValues = Object.values(ObserverTypes);

class SubscriptionManager {
  private subscriptions = new Map<string, Function[]>();

  constructor() {};

  public subscribe(event: string, callback: Function) {
    if (typeof callback !== "function") {
      log(`event registration unsuccessful: ${event} - callback is not a function`);
    }
    if (!ObserverTypeValues.includes(event as ObserverType)) {
      log(`event registration unsuccessful: ${event} - event is not a valid observer type`);
    }
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }
    this.subscriptions.get(event)?.push(callback);
    log(`event registration successful: ${event}`);
  };

  public unsubscribe(event: string, callback: Function) {
    if (!this.subscriptions.has(event)) {
      return;
    }
    const callbacks = this.subscriptions.get(event);
    const index = callbacks?.indexOf(callback);
    if (index !== undefined && index !== -1) {
      callbacks?.splice(index, 1);
    }
  };

  public publish(event: string, ...args: any[]) {
    if (!this.subscriptions.has(event)) {
      log(`event publish unsuccessful: ${event} - no subscribers`);
      return;
    }
    const callbacks = this.subscriptions.get(event);
    callbacks?.forEach(callback => callback(...args));
  };

};

const globalSubscribeManager = new SubscriptionManager();

export { globalSubscribeManager };