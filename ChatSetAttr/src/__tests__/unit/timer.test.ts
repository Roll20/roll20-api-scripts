import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startTimer, clearTimer, clearAllTimers } from "../../modules/timer";

describe("timer", () => {
  beforeEach(() => {
    // Mock timers before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up timers after each test
    vi.clearAllTimers();
    vi.useRealTimers();
    clearAllTimers();
  });

  describe("startTimer", () => {
    it("should execute callback after specified duration", () => {
      const callback = vi.fn();
      const duration = 1000;

      startTimer("test-key", duration, callback);

      // Callback should not be called immediately
      expect(callback).not.toHaveBeenCalled();

      // Fast-forward time
      vi.advanceTimersByTime(duration);

      // Callback should now be called
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should use default duration of 50ms when not specified", () => {
      const callback = vi.fn();

      startTimer("test-key", undefined, callback);

      // Advance by default duration (50ms)
      vi.advanceTimersByTime(50);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should clear existing timer when starting new timer with same key", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const duration = 1000;

      // Start first timer
      startTimer("same-key", duration, callback1);

      // Advance time partially
      vi.advanceTimersByTime(duration / 2);

      // Start second timer with same key
      startTimer("same-key", duration, callback2);

      // Advance time to complete the original duration
      vi.advanceTimersByTime(duration / 2);

      // First callback should not be called (timer was cleared)
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();

      // Advance time to complete the second timer
      vi.advanceTimersByTime(duration / 2);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple timers with different keys", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      startTimer("key1", 100, callback1);
      startTimer("key2", 200, callback2);
      startTimer("key3", 300, callback3);

      // Advance to first timer completion
      vi.advanceTimersByTime(100);
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).not.toHaveBeenCalled();

      // Advance to second timer completion
      vi.advanceTimersByTime(100);
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).not.toHaveBeenCalled();

      // Advance to third timer completion
      vi.advanceTimersByTime(100);
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    it("should remove timer from map after execution", () => {
      const callback = vi.fn();

      startTimer("cleanup-test", 100, callback);

      // Timer should be active
      vi.advanceTimersByTime(50);
      expect(callback).not.toHaveBeenCalled();

      // Complete the timer
      vi.advanceTimersByTime(50);
      expect(callback).toHaveBeenCalledTimes(1);

      // Starting a new timer with same key should not interfere
      const callback2 = vi.fn();
      startTimer("cleanup-test", 100, callback2);
      vi.advanceTimersByTime(100);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should handle zero duration", () => {
      const callback = vi.fn();

      startTimer("zero-duration", 0, callback);

      // Should execute immediately on next tick
      vi.advanceTimersByTime(0);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("clearTimer", () => {
    it("should prevent timer from executing when cleared", () => {
      const callback = vi.fn();

      startTimer("clear-test", 1000, callback);

      // Advance time partially
      vi.advanceTimersByTime(500);
      expect(callback).not.toHaveBeenCalled();

      // Clear the timer
      clearTimer("clear-test");

      // Advance time past original completion
      vi.advanceTimersByTime(1000);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle clearing non-existent timer gracefully", () => {
      // This should not throw an error
      expect(() => {
        clearTimer("non-existent-key");
      }).not.toThrow();
    });

    it("should only clear timer for specified key", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      startTimer("key1", 1000, callback1);
      startTimer("key2", 1000, callback2);

      // Clear only one timer
      clearTimer("key1");

      // Advance time
      vi.advanceTimersByTime(1000);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should allow clearing already completed timer", () => {
      const callback = vi.fn();

      startTimer("completed-test", 100, callback);

      // Complete the timer
      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);

      // Clearing should not cause issues
      expect(() => {
        clearTimer("completed-test");
      }).not.toThrow();
    });
  });

  describe("clearAllTimers", () => {
    it("should clear all active timers", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      startTimer("key1", 1000, callback1);
      startTimer("key2", 1500, callback2);
      startTimer("key3", 2000, callback3);

      // Advance time partially
      vi.advanceTimersByTime(500);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).not.toHaveBeenCalled();

      // Clear all timers
      clearAllTimers();

      // Advance time past all original completion times
      vi.advanceTimersByTime(2000);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).not.toHaveBeenCalled();
    });

    it("should handle clearing when no timers exist", () => {
      // This should not throw an error
      expect(() => {
        clearAllTimers();
      }).not.toThrow();
    });

    it("should allow starting new timers after clearing all", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      // Start and clear timers
      startTimer("key1", 1000, callback1);
      clearAllTimers();

      // Start new timer
      startTimer("key2", 500, callback2);
      vi.advanceTimersByTime(500);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should clear timers even if some have already completed", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      startTimer("key1", 100, callback1); // Will complete
      startTimer("key2", 1000, callback2); // Will be cleared

      // Complete first timer
      vi.advanceTimersByTime(100);
      expect(callback1).toHaveBeenCalledTimes(1);

      // Clear all timers (including the remaining active one)
      clearAllTimers();

      // Advance time
      vi.advanceTimersByTime(1000);
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe("edge cases and integration", () => {
    it("should handle rapid timer creation and clearing", () => {
      const callback = vi.fn();

      // Rapidly create and clear timers
      for (let i = 0; i < 10; i++) {
        startTimer("rapid-test", 1000, callback);
        if (i < 9) {
          clearTimer("rapid-test");
        }
      }

      // Only the last timer should remain
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should handle timer callback that throws an error", () => {
      const errorCallback = vi.fn(() => {
        throw new Error("Timer callback error");
      });
      const normalCallback = vi.fn();

      startTimer("error-test", 100, errorCallback);
      startTimer("normal-test", 200, normalCallback);

      // The error should not prevent other timers from working
      expect(() => {
        vi.advanceTimersByTime(100);
      }).toThrow("Timer callback error");

      // Normal timer should still work
      vi.advanceTimersByTime(100);
      expect(normalCallback).toHaveBeenCalledTimes(1);
    });

    it("should handle callback that starts another timer", () => {
      const callback2 = vi.fn();
      const callback1 = vi.fn(() => {
        startTimer("chained-timer", 100, callback2);
      });

      startTimer("initial-timer", 100, callback1);

      // Complete first timer
      vi.advanceTimersByTime(100);
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();

      // Complete chained timer
      vi.advanceTimersByTime(100);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should handle very long durations", () => {
      const callback = vi.fn();
      const longDuration = 1000000; // 1 million ms (about 16 minutes)

      startTimer("long-timer", longDuration, callback);

      // Advance by a large amount (but less than the duration)
      vi.advanceTimersByTime(999999);
      expect(callback).not.toHaveBeenCalled();

      // Clear the timer
      clearTimer("long-timer");

      // Advance past the original duration to ensure it doesn't execute
      vi.advanceTimersByTime(2);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should maintain timer isolation between different keys", () => {
      const callbacks = Array.from({ length: 5 }, () => vi.fn());

      // Start multiple timers with different keys and durations
      callbacks.forEach((callback, index) => {
        startTimer(`key-${index}`, (index + 1) * 100, callback);
      });

      // Clear one timer in the middle
      clearTimer("key-2");

      // Advance time to complete all timers
      vi.advanceTimersByTime(500);

      // Check that only the cleared timer didn't execute
      callbacks.forEach((callback, index) => {
        if (index === 2) {
          expect(callback).not.toHaveBeenCalled();
        } else {
          expect(callback).toHaveBeenCalledTimes(1);
        }
      });
    });
  });
});
