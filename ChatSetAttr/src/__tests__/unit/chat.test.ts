import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPlayerName, sendMessages, sendErrors } from "../../modules/chat";

// Mock the templates
vi.mock("../../templates/messages", () => ({
  createChatMessage: vi.fn(),
  createErrorMessage: vi.fn(),
}));

// Mock Roll20 globals
const mockPlayer = {
  get: vi.fn(),
};

const mockGetObj = vi.fn();
const mockSendChat = vi.fn();

global.getObj = mockGetObj;
global.sendChat = mockSendChat;

import { createChatMessage, createErrorMessage } from "../../templates/messages";
const mockCreateChatMessage = vi.mocked(createChatMessage);
const mockCreateErrorMessage = vi.mocked(createErrorMessage);

describe("chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPlayerName", () => {
    it("should return player display name when player exists", () => {
      mockPlayer.get.mockReturnValue("John Doe");
      mockGetObj.mockReturnValue(mockPlayer);

      const result = getPlayerName("player123");

      expect(mockGetObj).toHaveBeenCalledWith("player", "player123");
      expect(mockPlayer.get).toHaveBeenCalledWith("_displayname");
      expect(result).toBe("John Doe");
    });

    it("should return 'Unknown Player' when player does not exist", () => {
      mockGetObj.mockReturnValue(null);

      const result = getPlayerName("nonexistent");

      expect(mockGetObj).toHaveBeenCalledWith("player", "nonexistent");
      expect(result).toBe("Unknown Player");
    });

    it("should return 'Unknown Player' when player exists but has no display name", () => {
      mockPlayer.get.mockReturnValue(null);
      mockGetObj.mockReturnValue(mockPlayer);

      const result = getPlayerName("player456");

      expect(mockGetObj).toHaveBeenCalledWith("player", "player456");
      expect(mockPlayer.get).toHaveBeenCalledWith("_displayname");
      expect(result).toBe("Unknown Player");
    });

    it("should return 'Unknown Player' when player exists but display name is undefined", () => {
      mockPlayer.get.mockReturnValue(undefined);
      mockGetObj.mockReturnValue(mockPlayer);

      const result = getPlayerName("player789");

      expect(result).toBe("Unknown Player");
    });

    it("should return empty string when player has empty display name", () => {
      mockPlayer.get.mockReturnValue("");
      mockGetObj.mockReturnValue(mockPlayer);

      const result = getPlayerName("player101");

      expect(result).toBe("");
    });

    it("should handle display names with special characters", () => {
      mockPlayer.get.mockReturnValue("Player-42_Test!");
      mockGetObj.mockReturnValue(mockPlayer);

      const result = getPlayerName("player102");

      expect(result).toBe("Player-42_Test!");
    });

    it("should handle display names with spaces", () => {
      mockPlayer.get.mockReturnValue("  Spaced Name  ");
      mockGetObj.mockReturnValue(mockPlayer);

      const result = getPlayerName("player103");

      expect(result).toBe("  Spaced Name  ");
    });
  });

  describe("sendMessages", () => {
    beforeEach(() => {
      mockPlayer.get.mockReturnValue("Test Player");
      mockGetObj.mockReturnValue(mockPlayer);
      mockCreateChatMessage.mockReturnValue("formatted-chat-message");
    });

    it("should send a whispered chat message to the player", () => {
      const messages = ["Message 1", "Message 2"];

      sendMessages("player123", "Test Header", messages);

      expect(mockCreateChatMessage).toHaveBeenCalledWith("Test Header", messages);
      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Test Player\" formatted-chat-message");
    });

    it("should handle empty messages array", () => {
      const messages: string[] = [];

      sendMessages("player123", "Empty Header", messages);

      expect(mockCreateChatMessage).toHaveBeenCalledWith("Empty Header", messages);
      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Test Player\" formatted-chat-message");
    });

    it("should handle single message", () => {
      const messages = ["Single message"];

      sendMessages("player123", "Single Header", messages);

      expect(mockCreateChatMessage).toHaveBeenCalledWith("Single Header", messages);
      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Test Player\" formatted-chat-message");
    });

    it("should handle messages with special characters", () => {
      const messages = ["Message with \"quotes\"", "Message with \"apostrophes\"", "Message with <tags>"];

      sendMessages("player123", "Special Header", messages);

      expect(mockCreateChatMessage).toHaveBeenCalledWith("Special Header", messages);
      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Test Player\" formatted-chat-message");
    });

    it("should handle unknown player correctly", () => {
      mockGetObj.mockReturnValue(null);
      const messages = ["Test message"];

      sendMessages("unknown-player", "Test Header", messages);

      expect(mockCreateChatMessage).toHaveBeenCalledWith("Test Header", messages);
      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Unknown Player\" formatted-chat-message");
    });

    it("should handle player names with quotes", () => {
      mockPlayer.get.mockReturnValue("Player \"Nickname\" Smith");
      mockGetObj.mockReturnValue(mockPlayer);
      const messages = ["Test message"];

      sendMessages("player123", "Test Header", messages);

      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Player \"Nickname\" Smith\" formatted-chat-message");
    });

    it("should handle empty header", () => {
      const messages = ["Test message"];

      sendMessages("player123", "", messages);

      expect(mockCreateChatMessage).toHaveBeenCalledWith("", messages);
    });

    it("should handle long message arrays", () => {
      const messages = Array.from({ length: 100 }, (_, i) => `Message ${i + 1}`);

      sendMessages("player123", "Long Header", messages);

      expect(mockCreateChatMessage).toHaveBeenCalledWith("Long Header", messages);
      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Test Player\" formatted-chat-message");
    });
  });

  describe("sendErrors", () => {
    beforeEach(() => {
      mockPlayer.get.mockReturnValue("Test Player");
      mockGetObj.mockReturnValue(mockPlayer);
      mockCreateErrorMessage.mockReturnValue("formatted-error-message");
    });

    it("should not send message when errors array is empty", () => {
      const errors: string[] = [];

      sendErrors("player123", "Error Header", errors);

      expect(mockCreateErrorMessage).not.toHaveBeenCalled();
      expect(mockSendChat).not.toHaveBeenCalled();
    });

    it("should send error message when errors exist", () => {
      const errors = ["Error 1", "Error 2"];

      sendErrors("player123", "Error Header", errors);

      expect(mockCreateErrorMessage).toHaveBeenCalledWith("Error Header", errors);
      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Test Player\" formatted-error-message");
    });

    it("should handle single error", () => {
      const errors = ["Single error"];

      sendErrors("player123", "Error Header", errors);

      expect(mockCreateErrorMessage).toHaveBeenCalledWith("Error Header", errors);
      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Test Player\" formatted-error-message");
    });

    it("should handle errors with special characters", () => {
      const errors = ["Error with \"quotes\"", "Error with <HTML>", "Error with & symbols"];

      sendErrors("player123", "Special Error Header", errors);

      expect(mockCreateErrorMessage).toHaveBeenCalledWith("Special Error Header", errors);
      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Test Player\" formatted-error-message");
    });

    it("should handle unknown player correctly", () => {
      mockGetObj.mockReturnValue(null);
      const errors = ["Test error"];

      sendErrors("unknown-player", "Error Header", errors);

      expect(mockCreateErrorMessage).toHaveBeenCalledWith("Error Header", errors);
      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Unknown Player\" formatted-error-message");
    });

    it("should handle empty header", () => {
      const errors = ["Test error"];

      sendErrors("player123", "", errors);

      expect(mockCreateErrorMessage).toHaveBeenCalledWith("", errors);
    });

    it("should handle long error arrays", () => {
      const errors = Array.from({ length: 50 }, (_, i) => `Error ${i + 1}`);

      sendErrors("player123", "Many Errors", errors);

      expect(mockCreateErrorMessage).toHaveBeenCalledWith("Many Errors", errors);
      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Test Player\" formatted-error-message");
    });

    it("should handle player names with special whisper characters", () => {
      mockPlayer.get.mockReturnValue("Player@123");
      mockGetObj.mockReturnValue(mockPlayer);
      const errors = ["Test error"];

      sendErrors("player123", "Error Header", errors);

      expect(mockSendChat).toHaveBeenCalledWith("ChatSetAttr", "/w \"Player@123\" formatted-error-message");
    });
  });

  describe("integration scenarios", () => {
    beforeEach(() => {
      mockCreateChatMessage.mockReturnValue("chat-message");
      mockCreateErrorMessage.mockReturnValue("error-message");
    });

    it("should handle multiple calls with same player", () => {
      mockPlayer.get.mockReturnValue("Consistent Player");
      mockGetObj.mockReturnValue(mockPlayer);

      sendMessages("player123", "Header 1", ["Message 1"]);
      sendErrors("player123", "Error Header", ["Error 1"]);
      sendMessages("player123", "Header 2", ["Message 2"]);

      expect(mockSendChat).toHaveBeenCalledTimes(3);
      expect(mockSendChat).toHaveBeenNthCalledWith(1, "ChatSetAttr", "/w \"Consistent Player\" chat-message");
      expect(mockSendChat).toHaveBeenNthCalledWith(2, "ChatSetAttr", "/w \"Consistent Player\" error-message");
      expect(mockSendChat).toHaveBeenNthCalledWith(3, "ChatSetAttr", "/w \"Consistent Player\" chat-message");
    });

    it("should handle different players in sequence", () => {
      const mockPlayer1 = { get: vi.fn().mockReturnValue("Player One") };
      const mockPlayer2 = { get: vi.fn().mockReturnValue("Player Two") };

      mockGetObj.mockImplementation((type, id) => {
        if (id === "player1") return mockPlayer1;
        if (id === "player2") return mockPlayer2;
        return null;
      });

      sendMessages("player1", "Header", ["Message for P1"]);
      sendMessages("player2", "Header", ["Message for P2"]);

      expect(mockSendChat).toHaveBeenNthCalledWith(1, "ChatSetAttr", "/w \"Player One\" chat-message");
      expect(mockSendChat).toHaveBeenNthCalledWith(2, "ChatSetAttr", "/w \"Player Two\" chat-message");
    });

    it("should handle mixed success and error scenarios", () => {
      mockPlayer.get.mockReturnValue("Mixed Player");
      mockGetObj.mockReturnValue(mockPlayer);

      // Send success message first
      sendMessages("player123", "Success", ["Operation completed"]);

      // Try to send empty error (should not send)
      sendErrors("player123", "No Errors", []);

      // Send actual error
      sendErrors("player123", "Real Error", ["Something went wrong"]);

      expect(mockSendChat).toHaveBeenCalledTimes(2); // Only success and real error
      expect(mockSendChat).toHaveBeenNthCalledWith(1, "ChatSetAttr", "/w \"Mixed Player\" chat-message");
      expect(mockSendChat).toHaveBeenNthCalledWith(2, "ChatSetAttr", "/w \"Mixed Player\" error-message");
    });
  });
});
