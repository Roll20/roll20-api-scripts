export class TimerManager {
  private static timers: Map<string, NodeJS.Timeout> = new Map();

  public static start(id: string, duration: number, callback: () => void): void {
    if (this.timers.has(id)) {
      this.stop(id);
    }
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(id);
    }, duration);
    this.timers.set(id, timer);
  };

  public static stop(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  };

  public static isRunning(id: string): boolean {
    return this.timers.has(id);
  };
};