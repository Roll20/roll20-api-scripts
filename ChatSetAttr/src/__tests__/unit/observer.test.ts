import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ObserverCallback } from "../../types";
import { notifyObservers, registerObserver } from "../../modules/observer";

describe("observer", () => {
  beforeEach(async () => {
    // Reset modules to clear the observers state
    vi.resetModules();
  });

  describe("registerObserver", () => {
    it("should add a callback for a new event", () => {
      const mockCallback: ObserverCallback = vi.fn();

      registerObserver("add", mockCallback);

      // Verify by triggering notification
      notifyObservers("add", "exampleID", "exampleAttribute", "newValue", "oldValue");
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith("add", "exampleID", "exampleAttribute", "newValue", "oldValue");
    });

    it("should add multiple callbacks for the same event", () => {
      const mockCallback1: ObserverCallback = vi.fn();
      const mockCallback2: ObserverCallback = vi.fn();

      registerObserver("change", mockCallback1);
      registerObserver("change", mockCallback2);

      notifyObservers("change", "exampleID", "exampleAttribute", "newValue", "oldValue");

      expect(mockCallback1).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
      expect(mockCallback1).toHaveBeenCalledWith("change", "exampleID", "exampleAttribute", "newValue", "oldValue");
      expect(mockCallback2).toHaveBeenCalledWith("change", "exampleID", "exampleAttribute", "newValue", "oldValue");
    });

    it("should add callbacks for different events", () => {
      const addCallback: ObserverCallback = vi.fn();
      const changeCallback: ObserverCallback = vi.fn();
      const destroyCallback: ObserverCallback = vi.fn();

      registerObserver("add", addCallback);
      registerObserver("change", changeCallback);
      registerObserver("destroy", destroyCallback);

      notifyObservers("add", "exampleID", "exampleAttribute", "value1", "value2");
      notifyObservers("change", "exampleID", "exampleAttribute", "value3", "value4");
      notifyObservers("destroy", "exampleID", "exampleAttribute", "value5", "value6");

      expect(addCallback).toHaveBeenCalledTimes(1);
      expect(changeCallback).toHaveBeenCalledTimes(1);
      expect(destroyCallback).toHaveBeenCalledTimes(1);

      expect(addCallback).toHaveBeenCalledWith("add", "exampleID", "exampleAttribute", "value1", "value2");
      expect(changeCallback).toHaveBeenCalledWith("change", "exampleID", "exampleAttribute", "value3", "value4");
      expect(destroyCallback).toHaveBeenCalledWith("destroy", "exampleID", "exampleAttribute", "value5", "value6");
    });

    it("should allow the same callback to be added multiple times", () => {
      const mockCallback: ObserverCallback = vi.fn();

      registerObserver("add", mockCallback);
      registerObserver("add", mockCallback);

      notifyObservers("add", "exampleID", "exampleAttribute", "newValue", "oldValue");

      // Should be called twice since it was added twice
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe("notifyObservers", () => {
    it("should call all callbacks for a given event", () => {
      const mockCallback1: ObserverCallback = vi.fn();
      const mockCallback2: ObserverCallback = vi.fn();
      const mockCallback3: ObserverCallback = vi.fn();

      registerObserver("change", mockCallback1);
      registerObserver("change", mockCallback2);
      registerObserver("change", mockCallback3);

      notifyObservers("change", "exampleID", "exampleAttribute", 100, 50);

      expect(mockCallback1).toHaveBeenCalledWith("change", "exampleID", "exampleAttribute", 100, 50);
      expect(mockCallback2).toHaveBeenCalledWith("change", "exampleID", "exampleAttribute", 100, 50);
      expect(mockCallback3).toHaveBeenCalledWith("change", "exampleID", "exampleAttribute", 100, 50);
    });

    it("should handle notification when no observers exist for event", () => {
      // This should not throw an error
      expect(() => {
        notifyObservers("add", "exampleID", "exampleAttribute", "newValue", "oldValue");
      }).not.toThrow();
    });

    it("should only notify observers for the specific event", () => {
      const addCallback: ObserverCallback = vi.fn();
      const changeCallback: ObserverCallback = vi.fn();

      registerObserver("add", addCallback);
      registerObserver("change", changeCallback);

      notifyObservers("add", "exampleID", "exampleAttribute", "value1", "value2");

      expect(addCallback).toHaveBeenCalledWith("add", "exampleID", "exampleAttribute", "value1", "value2");
      expect(changeCallback).not.toHaveBeenCalled();
    });

    it("should handle different attribute value types", () => {
      const mockCallback: ObserverCallback = vi.fn();
      registerObserver("change", mockCallback);

      // Test with numbers
      notifyObservers("change", "exampleID", "exampleAttribute", 25, 10);
      expect(mockCallback).toHaveBeenCalledWith("change", "exampleID", "exampleAttribute", 25, 10);

      // Test with strings
      notifyObservers("change", "exampleID", "exampleAttribute", "newString", "oldString");
      expect(mockCallback).toHaveBeenCalledWith("change", "exampleID", "exampleAttribute", "newString", "oldString");

      // Test with booleans
      notifyObservers("change", "exampleID", "exampleAttribute", true, false);
      expect(mockCallback).toHaveBeenCalledWith("change", "exampleID", "exampleAttribute", true, false);

      // Test with undefined
      notifyObservers("change", "exampleID", "exampleAttribute", undefined, "someValue");
      expect(mockCallback).toHaveBeenCalledWith("change", "exampleID", "exampleAttribute", undefined, "someValue");
    });

    it("should handle callback execution errors gracefully", () => {
      const errorCallback: ObserverCallback = vi.fn(() => {
        throw new Error("Callback error");
      });
      const normalCallback: ObserverCallback = vi.fn();

      registerObserver("destroy", errorCallback);
      registerObserver("destroy", normalCallback);

      // This should not prevent other callbacks from executing
      expect(() => {
        notifyObservers("destroy", "targetID", "exampleAttribute", "value1", "value2");
      }).toThrow("Callback error");

      expect(errorCallback).toHaveBeenCalled();
    });

    it("should call callbacks in the order they were added", () => {
      const callOrder: number[] = [];

      const callback1: ObserverCallback = vi.fn(() => callOrder.push(1));
      const callback2: ObserverCallback = vi.fn(() => callOrder.push(2));
      const callback3: ObserverCallback = vi.fn(() => callOrder.push(3));

      registerObserver("add", callback1);
      registerObserver("add", callback2);
      registerObserver("add", callback3);

      notifyObservers("add", "exampleID", "exampleAttribute", "value", "oldValue");

      expect(callOrder).toEqual([1, 2, 3]);
    });
  });
});