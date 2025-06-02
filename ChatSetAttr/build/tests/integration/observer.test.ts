import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChatSetAttr } from '../../src/classes/ChatSetAttr';

describe('Modern ChatSetAttr Observer Tests', () => {
  // Set up the test environment before each test
  beforeEach(() => {
    global.setupTestEnvironment();
    new ChatSetAttr();
  });

  // Cleanup after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should register and call observers for attribute creation", async () => {
    // Arrange
    const addObserver = vi.fn();
    const changeObserver = vi.fn();
    const destroyObserver = vi.fn();

    // Create a character to test with
    createObj("character", {id: "char1", name: "Character 1"});

    // Register observers for all event types
    ChatSetAttr.registerObserver("add", addObserver);
    ChatSetAttr.registerObserver("change", changeObserver);
    ChatSetAttr.registerObserver("destroy", destroyObserver);

    // Act - create a new attribute
    global.executeCommand("!setattr --charid char1 --NewAttr|42");

    // Assert
    await vi.waitFor(() => {
      // Should call add observer but not change or destroy
      expect(addObserver).toHaveBeenCalled();
      // it also, perhaps incorrectly, calls the change observer
      expect(changeObserver).toHaveBeenCalled();
      expect(destroyObserver).not.toHaveBeenCalled();

      // Check observer was called with correct attribute
      const call = addObserver.mock.calls[0];
      expect(call[0].name).toBe("NewAttr");
      expect(call[0].current).toBe("42");
    });
  });

  it("should register and call observers for attribute changes", async () => {
    // Arrange
    const addObserver = vi.fn(() => {});
    const changeObserver = vi.fn();

    // Create a character and existing attribute
    createObj("character", { id: "char1", name: "Character 1" });
    createObj("attribute", { _characterid: "char1", name: "ExistingAttr", current: "10" });

    // Register observers
    ChatSetAttr.registerObserver("add", addObserver);
    ChatSetAttr.registerObserver("change", changeObserver);

    // Act - modify the existing attribute
    global.executeCommand("!setattr --charid char1 --ExistingAttr|20");

    // Assert
    await vi.waitFor(() => {
      // Should call change observer but not add observer
      expect(addObserver).not.toHaveBeenCalled();
      expect(changeObserver).toHaveBeenCalled();

      // Check observer was called with correct attribute and previous value
      const call = changeObserver.mock.calls[0];
      expect(call[0].name).toBe("ExistingAttr");
      expect(call[0].current).toBe("20");
      expect(call[1].current).toBe("10"); // Previous value
    });
  });

  it("should register and call observers for attribute deletion", async () => {
    // Arrange
    const destroyObserver = vi.fn();

    // Create a character and attribute to be deleted
    createObj("character", { id: "char1", name: "Character 1" });
    createObj("attribute", { _characterid: "char1", name: "ToBeDeleted", current: "value" });

    // Register observer
    ChatSetAttr.registerObserver("destroy", destroyObserver);

    // Act - delete the attribute
    global.executeCommand("!delattr --charid char1 --ToBeDeleted");

    // Assert
    await vi.waitFor(() => {
      // Should call destroy observer
      expect(destroyObserver).toHaveBeenCalled();

      // Check observer was called with correct attribute
      const call = destroyObserver.mock.calls[0];
      expect(call[0].name).toBe("ToBeDeleted");
      expect(call[0].current).toBe("value");
    });
  });

  it("should allow multiple observers for the same event", async () => {
    // Arrange
    const observer1 = vi.fn();
    const observer2 = vi.fn();

    // Create a character
    createObj("character", { id: "char1", name: "Character 1" });

    // Register multiple observers for the same event
    ChatSetAttr.registerObserver("add", observer1);
    ChatSetAttr.registerObserver("add", observer2);

    // Act - create a new attribute
    global.executeCommand("!setattr --charid char1 --MultiObserverTest|success");

    // Assert
    await vi.waitFor(() => {
      // Both observers should have been called
      expect(observer1).toHaveBeenCalled();
      expect(observer2).toHaveBeenCalled();
    });
  });

  it("should handle invalid observer registrations", () => {
    // Arrange - various invalid observer scenarios
    const validFn = () => {};
    const consoleSpy = vi.spyOn(global, 'log');

    // Act & Assert - test with invalid event
    ChatSetAttr.registerObserver("invalid-event", validFn);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("event registration unsuccessful"));

    // Act & Assert - test with invalid function
    consoleSpy.mockClear();
    ChatSetAttr.registerObserver("add", "not a function" as any);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("event registration unsuccessful"));

    // Cleanup
    consoleSpy.mockRestore();
  });
});
