import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ChatOutput } from "../../src/classes/ChatOutput";

describe("ChatOutput", () => {
  let sendChatSpy: any;

  beforeEach(() => {
    // Set up test environment
    global.setupTestEnvironment();

    // Spy on sendChat
    sendChatSpy = vi.spyOn(global, 'sendChat');
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create a ChatOutput instance with default values", () => {
      // Arrange & Act
      const chatOutput = new ChatOutput({
        header: "Test Header",
        content: "Test Content"
      });

      // Assert
      expect(chatOutput.header).toBe("Test Header");
      expect(chatOutput.content).toBe("Test Content");
      expect(chatOutput.from).toBe("ChatOutput");
      expect(chatOutput.type).toBe("info");
    });

    it("should create a ChatOutput instance with custom values", () => {
      // Arrange & Act
      const chatOutput = new ChatOutput({
        header: "Error Header",
        content: "Error Message",
        from: "System",
        type: "error",
      });

      // Assert
      expect(chatOutput.header).toBe("Error Header");
      expect(chatOutput.content).toBe("Error Message");
      expect(chatOutput.from).toBe("System");
      expect(chatOutput.type).toBe("error");
    });
  });

  describe("send", () => {
    it("should send an info message with header and content", () => {
      // Arrange
      const chatOutput = new ChatOutput({
        header: "Info Header",
        content: "Info Content"
      });

      // Act
      chatOutput.send();

      // Assert
      expect(sendChatSpy).toHaveBeenCalledWith(
        "ChatOutput",
        expect.stringContaining("<h3"),
        undefined,
        { noarchive: true }
      );
      expect(sendChatSpy).toHaveBeenCalledWith(
        "ChatOutput",
        expect.stringContaining("Info Header"),
        undefined,
        { noarchive: true }
      );
      expect(sendChatSpy).toHaveBeenCalledWith(
        "ChatOutput",
        expect.stringContaining("Info Content"),
        undefined,
        { noarchive: true }
      );
    });

    it("should send an error message with appropriate styling", () => {
      // Arrange
      const chatOutput = new ChatOutput({
        header: "Error Header",
        content: "Error Content",
        from: "System",
        type: "error"
      });

      // Act
      chatOutput.send();

      // Assert
      expect(sendChatSpy).toHaveBeenCalledWith(
        "System",
        expect.stringContaining("border: 1px solid #f00;"),
        undefined,
        { noarchive: true }
      );
      expect(sendChatSpy).toHaveBeenCalledWith(
        "System",
        expect.stringContaining("color: #f00;"),
        undefined,
        { noarchive: true }
      );
      expect(sendChatSpy).toHaveBeenCalledWith(
        "System",
        expect.stringContaining("Error Header"),
        undefined,
        { noarchive: true }
      );
      expect(sendChatSpy).toHaveBeenCalledWith(
        "System",
        expect.stringContaining("Error Content"),
        undefined,
        { noarchive: true }
      );
    });

    it("should handle messages without header", () => {
      // Arrange
      const chatOutput = new ChatOutput({
        header: "",
        content: "Content Only"
      });

      // Act
      chatOutput.send();

      // Assert
      expect(sendChatSpy).toHaveBeenCalledWith(
        "ChatOutput",
        expect.not.stringContaining("<h3"),
        undefined,
        { noarchive: true }
      );
      expect(sendChatSpy).toHaveBeenCalledWith(
        "ChatOutput",
        expect.stringContaining("Content Only"),
        undefined,
        { noarchive: true }
      );
    });

    it("should handle messages without content", () => {
      // Arrange
      const chatOutput = new ChatOutput({
        header: "Header Only",
        content: ""
      });

      // Act
      chatOutput.send();

      // Assert
      expect(sendChatSpy).toHaveBeenCalledWith(
        "ChatOutput",
        expect.stringContaining("<h3"),
        undefined,
        { noarchive: true }
      );
      expect(sendChatSpy).toHaveBeenCalledWith(
        "ChatOutput",
        expect.stringContaining("Header Only"),
        undefined,
        { noarchive: true }
      );
      expect(sendChatSpy).toHaveBeenCalledWith(
        "ChatOutput",
        expect.not.stringContaining("<p>"),
        undefined,
        { noarchive: true }
      );
    });
  });

  describe("style handling", () => {
    it("should apply info styling correctly", () => {
      // Arrange
      const chatOutput = new ChatOutput({
        header: "Info Header",
        content: "Info Content"
      });

      // Act
      chatOutput.send();

      // Assert
      expect(sendChatSpy).toHaveBeenCalledWith(
        "ChatOutput",
        expect.stringContaining("background-color: #f9f9f9;"),
        undefined,
        { noarchive: true }
      );
      expect(sendChatSpy).toHaveBeenCalledWith(
        "ChatOutput",
        expect.stringContaining("border: 1px solid #ccc;"),
        undefined,
        { noarchive: true }
      );
      expect(sendChatSpy).toHaveBeenCalledWith(
        "ChatOutput",
        expect.stringContaining("font-weight: bold;"),
        undefined,
        { noarchive: true }
      );
    });

    it("should apply error styling correctly", () => {
      // Arrange
      const chatOutput = new ChatOutput({
        header: "Error Header",
        content: "Error Content",
        from: "System",
        type: "error"
      });

      // Act
      chatOutput.send();

      // Assert
      expect(sendChatSpy).toHaveBeenCalledWith(
        "System",
        expect.stringContaining("border: 1px solid #f00;"),
        undefined,
        { noarchive: true }
      );
      expect(sendChatSpy).toHaveBeenCalledWith(
        "System",
        expect.stringContaining("color: #f00;"),
        undefined,
        { noarchive: true }
      );
    });
  });

  describe("HTML structure", () => {
    it("should create a properly structured HTML output", () => {
      // Arrange
      const chatOutput = new ChatOutput({
        header: "Test Header",
        content: "Test Content"
      });

      // Act
      chatOutput.send();

      // Assert
      // Check that sendChat is called with properly structured HTML
      const sendChatArg = sendChatSpy.mock.calls[0][1];

      // Test individual components
      expect(sendChatArg).toMatch(/^<div style='[^']*'>/);
      expect(sendChatArg).toMatch(/<h3 style='[^']*'>Test Header<\/h3>/);
      expect(sendChatArg).toMatch(/<p>Test Content<\/p>/);
      expect(sendChatArg).toMatch(/<\/div>$/);
    });
  });
});
