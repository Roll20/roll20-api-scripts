import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ChatSetAttr } from "../../src/classes/ChatSetAttr";

describe("Modern ChatSetAttr Configuration Tests", () => {
  // Set up the test environment before each test
  beforeEach(() => {
    setupTestEnvironment();
    new ChatSetAttr();
  });

  // Reset configuration after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should toggle player modification permissions", () => {
    // Arrange
    const initialValue = state.ChatSetAttr.playersCanModify;

    // Act
    executeCommand("!setattr-config --players-can-modify", [], { playerId: "gm123" });

    // Assert
    expect(state.ChatSetAttr.playersCanModify).toBe(!initialValue);
  });

  it("should toggle player evaluation permissions", () => {
    // Arrange
    const initialValue = state.ChatSetAttr.playersCanEvaluate;

    // Act
    executeCommand("!setattr-config --players-can-evaluate", [], { playerId: "gm123" });

    // Assert
    expect(state.ChatSetAttr.playersCanEvaluate).toBe(!initialValue);
  });

  it("should toggle worker usage", () => {
    // Arrange
    const initialValue = state.ChatSetAttr.useWorkers;

    // Act
    executeCommand("!setattr-config --use-workers", [], { playerId: "gm123" });

    // Assert
    expect(state.ChatSetAttr.useWorkers).toBe(!initialValue);
  });

  it("should deny configuration access to non-GM players", async () => {
    // Arrange
    const { sendChat } = global;
    const initialValues = { ...state.ChatSetAttr };

    // Temporarily mock playerIsGM to return false
    vi.mocked(playerIsGM).mockReturnValueOnce(false);

    // Act
    executeCommand("!setattr-config --players-can-modify", [], { playerId: "player123" });

    // Assert - config should not change
    expect(state.ChatSetAttr.playersCanModify).toBe(initialValues.playersCanModify);

    // In previous versions, this would not have sent a message
    // Now it should send a message indicating lack of permissions
    await vi.waitFor(() => {
      expect(sendChat).toHaveBeenCalled();
      expect(sendChat).toHaveBeenCalledWith(
        "ChatSetAttr",
        expect.stringContaining("Only the GM can configure"),
        undefined,
        expect.objectContaining({ noarchive: true })
      );
    });
  });

  it("should display current configuration settings", async () => {
    // Arrange
    const { sendChat } = global;

    // Set known state
    state.ChatSetAttr.playersCanModify = true;
    state.ChatSetAttr.playersCanEvaluate = false;
    state.ChatSetAttr.useWorkers = true;

    // Act
    executeCommand("!setattr-config", [], { playerId: "gm123" });

    // Assert - check that configuration was displayed with correct values
    await vi.waitFor(() => {
      expect(sendChat).toHaveBeenCalled();
      expect(sendChat).toHaveBeenCalledWith(
        "ChatSetAttr",
        expect.stringContaining("Current configuration:")
        && expect.stringMatching(/ON.*playersCanModify/)
        && expect.stringMatching(/OFF.*playersCanEvaluate/)
        && expect.stringMatching(/ON.*useWorkers/),
        undefined,
        expect.objectContaining({ noarchive: true })
      );
    });
  });

  it("should update from global config", () => {
    // Arrange
    const now = Math.floor(Date.now() / 1000);

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

    // Act
    ChatSetAttr.checkInstall();

    // Assert - settings should be updated from global config
    expect(state.ChatSetAttr.playersCanModify).toBe(true);
    expect(state.ChatSetAttr.playersCanEvaluate).toBe(true);
    expect(state.ChatSetAttr.useWorkers).toBe(true);
    expect(state.ChatSetAttr.globalconfigCache).toEqual(globalconfig.chatsetattr);
  });

  it("should respect useWorkers setting when updating attributes", async () => {
    // Arrange
    createObj("character", { id: "char1", name: "Character 1" });
    const attr = createObj("attribute", { _characterid: "char1", name: "TestWorker", current: "10" });

    // Create spy on setWithWorker and regular set
    const setWithWorkerSpy = vi.spyOn(attr, "setWithWorker");

    // Test with useWorkers = true
    state.ChatSetAttr.useWorkers = true;

    // Act
    executeCommand("!setattr --charid char1 --TestWorker|20");

    // Assert - should use setWithWorker
    await vi.waitFor(() => {
      expect(setWithWorkerSpy).toHaveBeenCalled();
    });

    // Reset and test with useWorkers = false
    setWithWorkerSpy.mockClear();
    state.ChatSetAttr.useWorkers = false;

    // Act again
    executeCommand("!setattr --charid char1 --TestWorker|30");

    // Assert - should use regular set
    await vi.waitFor(() => {
      expect(setWithWorkerSpy).not.toHaveBeenCalled();
    });
  });
});
