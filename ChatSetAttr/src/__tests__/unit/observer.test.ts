import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ObserverAttributeSnapshot, ObserverCallback } from "../../types";
import { createObserverAttributeObject } from "../../modules/observerPayload";
import { notifyObservers, registerObserver } from "../../modules/observer";

function makeObserverObj(current = "10", max = "20") {
  return createObserverAttributeObject("char1", "hp", "computed", { current, max });
};

function makePrev(current = "5", max = "10"): ObserverAttributeSnapshot {
  return {
    _id: "",
    _type: "computed",
    _characterid: "char1",
    name: "hp",
    current,
    max,
  };
};

describe("observer", () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  describe("registerObserver", () => {
    it("should add a callback for a new event", async () => {
      const { registerObserver: reg, notifyObservers: notify } = await import("../../modules/observer");
      const mockCallback: ObserverCallback = vi.fn();
      const obj = makeObserverObj();

      reg("add", mockCallback);
      notify("add", obj);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(obj, undefined);
    });

    it("should add multiple callbacks for the same event", async () => {
      const { registerObserver: reg, notifyObservers: notify } = await import("../../modules/observer");
      const mockCallback1: ObserverCallback = vi.fn();
      const mockCallback2: ObserverCallback = vi.fn();
      const obj = makeObserverObj();
      const prev = makePrev();

      reg("change", mockCallback1);
      reg("change", mockCallback2);
      notify("change", obj, prev);

      expect(mockCallback1).toHaveBeenCalledWith(obj, prev);
      expect(mockCallback2).toHaveBeenCalledWith(obj, prev);
    });

    it("should add callbacks for different events", async () => {
      const { registerObserver: reg, notifyObservers: notify } = await import("../../modules/observer");
      const addCallback: ObserverCallback = vi.fn();
      const changeCallback: ObserverCallback = vi.fn();
      const destroyCallback: ObserverCallback = vi.fn();
      const obj = makeObserverObj();
      const prev = makePrev();

      reg("add", addCallback);
      reg("change", changeCallback);
      reg("destroy", destroyCallback);

      notify("add", obj);
      notify("change", obj, prev);
      notify("destroy", obj);

      expect(addCallback).toHaveBeenCalledWith(obj, undefined);
      expect(changeCallback).toHaveBeenCalledWith(obj, prev);
      expect(destroyCallback).toHaveBeenCalledWith(obj, undefined);
    });

    it("should allow the same callback to be added multiple times", async () => {
      const { registerObserver: reg, notifyObservers: notify } = await import("../../modules/observer");
      const mockCallback: ObserverCallback = vi.fn();
      const obj = makeObserverObj();

      reg("add", mockCallback);
      reg("add", mockCallback);
      notify("add", obj);

      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe("notifyObservers", () => {
    it("should call all callbacks for a given event", async () => {
      const { registerObserver: reg, notifyObservers: notify } = await import("../../modules/observer");
      const mockCallback1: ObserverCallback = vi.fn();
      const mockCallback2: ObserverCallback = vi.fn();
      const obj = makeObserverObj("100", "50");
      const prev = makePrev("50", "25");

      reg("change", mockCallback1);
      reg("change", mockCallback2);
      notify("change", obj, prev);

      expect(mockCallback1).toHaveBeenCalledWith(obj, prev);
      expect(mockCallback2).toHaveBeenCalledWith(obj, prev);
    });

    it("should handle notification when no observers exist for event", () => {
      expect(() => {
        notifyObservers("add", makeObserverObj());
      }).not.toThrow();
    });

    it("should only notify observers for the specific event", async () => {
      const { registerObserver: reg, notifyObservers: notify } = await import("../../modules/observer");
      const addCallback: ObserverCallback = vi.fn();
      const changeCallback: ObserverCallback = vi.fn();
      const obj = makeObserverObj();

      reg("add", addCallback);
      reg("change", changeCallback);
      notify("add", obj);

      expect(addCallback).toHaveBeenCalledWith(obj, undefined);
      expect(changeCallback).not.toHaveBeenCalled();
    });

    it("should pass observer objects that support get", async () => {
      const { registerObserver: reg, notifyObservers: notify } = await import("../../modules/observer");
      const mockCallback: ObserverCallback = vi.fn();
      const obj = makeObserverObj("25", "30");

      reg("change", mockCallback);
      notify("change", obj, makePrev("10", "20"));

      expect(mockCallback.mock.calls[0][0].get("current")).toBe("25");
      expect(mockCallback.mock.calls[0][0].get("name")).toBe("hp");
    });

    it("should handle callback execution errors gracefully", async () => {
      const { registerObserver: reg, notifyObservers: notify } = await import("../../modules/observer");
      const errorCallback: ObserverCallback = vi.fn(() => {
        throw new Error("Callback error");
      });
      const normalCallback: ObserverCallback = vi.fn();
      const obj = makeObserverObj();

      reg("destroy", errorCallback);
      reg("destroy", normalCallback);

      expect(() => {
        notify("destroy", obj);
      }).toThrow("Callback error");

      expect(errorCallback).toHaveBeenCalled();
    });

    it("should call callbacks in the order they were added", async () => {
      const { registerObserver: reg, notifyObservers: notify } = await import("../../modules/observer");
      const callOrder: number[] = [];
      const obj = makeObserverObj();

      reg("add", vi.fn(() => callOrder.push(1)));
      reg("add", vi.fn(() => callOrder.push(2)));
      reg("add", vi.fn(() => callOrder.push(3)));
      notify("add", obj);

      expect(callOrder).toEqual([1, 2, 3]);
    });
  });
});
