import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './ChatSetAttr.js';
import ChatSetAttr from "./ChatSetAttr.js";

// Define interfaces for better typing
interface StateConfig {
  version: number;
  globalconfigCache: {
    lastsaved: number;
  };
  playersCanModify: boolean;
  playersCanEvaluate: boolean;
  useWorkers: boolean;
}

describe('ChatSetAttr Configuration Tests', () => {
  const state = global.state as { ChatSetAttr: StateConfig };
  const originalConfig: StateConfig = {
    version: 3,
    globalconfigCache: {
      lastsaved: Date.now() / 1000, // Current timestamp in seconds
    },
    playersCanModify: false,
    playersCanEvaluate: false,
    useWorkers: true,
  };

  // Set up the test environment before each test
  beforeEach(() => {
    global.setupTestEnvironment();
    ChatSetAttr.registerEventHandlers();
  });

  // Reset configuration after each test
  afterEach(() => {
    vi.clearAllMocks();
    state.ChatSetAttr.playersCanModify = originalConfig.playersCanModify;
    state.ChatSetAttr.playersCanEvaluate = originalConfig.playersCanEvaluate;
    state.ChatSetAttr.useWorkers = originalConfig.useWorkers;
  });

  it("should toggle player modification permissions", () => {
    // Arrange
    const initialValue = state.ChatSetAttr.playersCanModify;
    const msg = {
      type: "api",
      content: "!setattr-config --players-can-modify",
      playerid: "gm123"
    };

    // Act
    ChatSetAttr.testing.handleInput(msg);

    // Assert
    expect(state.ChatSetAttr.playersCanModify).toBe(!initialValue);
  });

  it("should toggle player evaluation permissions", () => {
    // Arrange
    const initialValue = state.ChatSetAttr.playersCanEvaluate;
    const msg = {
      type: "api",
      content: "!setattr-config --players-can-evaluate",
      playerid: "gm123"
    };

    // Act
    ChatSetAttr.testing.handleInput(msg);

    // Assert
    expect(state.ChatSetAttr.playersCanEvaluate).toBe(!initialValue);
  });

  it("should toggle worker usage", () => {
    // Arrange
    const initialValue = state.ChatSetAttr.useWorkers;
    const msg = {
      type: "api",
      content: "!setattr-config --use-workers",
      playerid: "gm123"
    };

    // Act
    ChatSetAttr.testing.handleInput(msg);

    // Assert
    expect(state.ChatSetAttr.useWorkers).toBe(!initialValue);
  });

  it("should deny configuration access to non-GM players", () => {
    // Arrange
    const { sendChat } = global;
    const initialValues = { ...state.ChatSetAttr };

    // Temporarily mock playerIsGM to return false
    const originalPlayerIsGM = global.playerIsGM;
    global.playerIsGM = vi.fn(() => false);

    // Create a message from a non-GM player
    const msg = {
      type: "api",
      content: "!setattr-config --players-can-modify",
      playerid: "player123"
    };

    // Act
    ChatSetAttr.testing.handleInput(msg);

    // Assert - config should not change
    expect(state.ChatSetAttr.playersCanModify).toBe(initialValues.playersCanModify);

    // Verify that access was denied (no feedback sent)
    expect(sendChat).not.toHaveBeenCalled();

    // Restore mock
    global.playerIsGM = originalPlayerIsGM;
  });

  it("should display current configuration settings", () => {
    // Arrange
    const { sendChat } = global;

    // Set known state
    state.ChatSetAttr.playersCanModify = true;
    state.ChatSetAttr.playersCanEvaluate = false;
    state.ChatSetAttr.useWorkers = true;

    const msg = {
      type: "api",
      content: "!setattr-config",
      playerid: "gm123"
    };

    // Act
    ChatSetAttr.testing.handleInput(msg);

    // Assert - check that configuration was displayed with correct values
    expect(sendChat).toHaveBeenCalled();

    const chatCall = vi.mocked(sendChat).mock.calls[0][1];

    // Should show playersCanModify as ON
    expect(chatCall).toMatch(/playersCanModify.*ON/);

    // Should show playersCanEvaluate as OFF
    expect(chatCall).toMatch(/playersCanEvaluate.*OFF/);

    // Should show useWorkers as ON
    expect(chatCall).toMatch(/useWorkers.*ON/);
  });

  it("should update from global config", () => {
    // Arrange
    const now = Date.now() / 1000;

    // Setup global config with newer timestamp
    global.globalconfig = {
      chatsetattr: {
        lastsaved: now + 1000, // Future timestamp to ensure it's newer
        "Players can modify all characters": "playersCanModify",
        "Players can use --evaluate": "playersCanEvaluate",
        "Trigger sheet workers when setting attributes": "useWorkers"
      }
    };

    // Set known state (opposite of what we'll set in global config)
    state.ChatSetAttr.playersCanModify = false;
    state.ChatSetAttr.playersCanEvaluate = false;
    state.ChatSetAttr.useWorkers = false;
    state.ChatSetAttr.globalconfigCache.lastsaved = now;

    // Act - run checkGlobalConfig
    ChatSetAttr.testing.checkGlobalConfig();

    // Assert - settings should be updated from global config
    expect(state.ChatSetAttr.playersCanModify).toBe(true);
    expect(state.ChatSetAttr.playersCanEvaluate).toBe(true);
    expect(state.ChatSetAttr.useWorkers).toBe(true);
    expect(state.ChatSetAttr.globalconfigCache).toEqual(global.globalconfig.chatsetattr);
  });

  it("should respect useWorkers setting when updating attributes", async () => {
    // Arrange
    createObj("character", { id: "char1", name: "Character 1" });
    const attr = createObj("attribute", {
      _characterid: "char1",
      name: "TestWorker",
      current: "10"
    });

    // Create spy on setWithWorker and regular set
    const setWithWorkerSpy = vi.spyOn(attr, 'setWithWorker');
    const setSpy = vi.spyOn(attr, 'set');

    // Test with useWorkers = true
    state.ChatSetAttr.useWorkers = true;

    // Act
    global.executeCommand("!setattr --charid char1 --TestWorker|20");

    // Assert - should use setWithWorker
    await vi.waitFor(() => {
      expect(setWithWorkerSpy).toHaveBeenCalled();
      expect(setSpy).not.toHaveBeenCalled();
    });

    // Reset and test with useWorkers = false
    setWithWorkerSpy.mockClear();
    setSpy.mockClear();
    state.ChatSetAttr.useWorkers = false;

    // Act again
    global.executeCommand("!setattr --charid char1 --TestWorker|30");

    // Assert - should use regular set
    await vi.waitFor(() => {
      expect(setWithWorkerSpy).not.toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalled();
    });
  });
});
