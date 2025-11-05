import { describe, it, expect } from "vitest";
import { createChatMessage, createErrorMessage } from "../../templates/messages";

describe("messages", () => {
  describe("createChatMessage", () => {
    it("should create a basic chat message with header and single message", () => {
      const header = "Test Header";
      const messages = ["Test message"];

      const result = createChatMessage(header, messages);

      expect(result).toContain("Test Header");
      expect(result).toContain("Test message");
      expect(result).toContain("<div");
      expect(result).toContain("<p>");
      expect(result).toContain("<h3");
    });

    it("should create a chat message with multiple messages", () => {
      const header = "Multiple Messages";
      const messages = ["First message", "Second message", "Third message"];

      const result = createChatMessage(header, messages);

      expect(result).toContain("Multiple Messages");
      expect(result).toContain("First message");
      expect(result).toContain("Second message");
      expect(result).toContain("Third message");

      // Should have three paragraph tags
      const paragraphCount = (result.match(/<p>/g) || []).length;
      expect(paragraphCount).toBe(3);
    });

    it("should handle empty messages array", () => {
      const header = "Empty Messages";
      const messages: string[] = [];

      const result = createChatMessage(header, messages);

      expect(result).toContain("Empty Messages");
      expect(result).toContain("<div");
      // Should not contain any paragraph tags
      expect(result).not.toContain("<p>");
    });

    it("should handle empty header", () => {
      const header = "";
      const messages = ["Test message"];

      const result = createChatMessage(header, messages);

      expect(result).toContain("Test message");
      expect(result).toContain("<div");
      expect(result).toContain("<p>");
    });

    it("should apply correct CSS styles for chat messages", () => {
      const header = "Styled Header";
      const messages = ["Styled message"];

      const result = createChatMessage(header, messages);

      // Check for wrapper styles (chat-specific)
      expect(result).toContain("border: 1px solid #4dffc7");
      expect(result).toContain("border-radius: 4px");
      expect(result).toContain("padding: 8px");
      expect(result).toContain("background-color: #e6fff5");

      // Check for header styles
      expect(result).toContain("font-size: 1.125rem");
      expect(result).toContain("font-weight: bold");
      expect(result).toContain("margin-bottom: 4px");

      // Check for body styles
      expect(result).toContain("font-size: 0.875rem");

      // Should NOT contain error-specific styles
      expect(result).not.toContain("color: #ff2020");
      expect(result).not.toContain("border: 1px solid #ff7474");
    });

    it("should maintain proper HTML structure", () => {
      const header = "Structure Test";
      const messages = ["Message 1", "Message 2"];

      const result = createChatMessage(header, messages);

      // Check for proper nesting - outer div contains h3 header and body div
      expect(result).toMatch(/<div[^>]*><h3[^>]*>Structure Test<\/h3><div[^>]*><p>Message 1<\/p><p>Message 2<\/p><\/div><\/div>/);
    });

    it("should handle special characters in header and messages", () => {
      const header = "Special Characters: & < > \" '";
      const messages = ["Message with & < > \" ' characters", "Another message with åäö"];

      const result = createChatMessage(header, messages);

      expect(result).toContain("Special Characters: & < > \" '");
      expect(result).toContain("Message with & < > \" ' characters");
      expect(result).toContain("Another message with åäö");
    });

    it("should handle very long header and messages", () => {
      const longHeader = "A".repeat(1000);
      const longMessage = "B".repeat(2000);
      const messages = [longMessage];

      const result = createChatMessage(longHeader, messages);

      expect(result).toContain(longHeader);
      expect(result).toContain(longMessage);
      expect(result.length).toBeGreaterThan(3000);
    });

    it("should handle messages with newlines and whitespace", () => {
      const header = "Whitespace Test";
      const messages = [
        "Message with\nnewlines",
        "  Message with spaces  ",
        "\tMessage with tabs\t"
      ];

      const result = createChatMessage(header, messages);

      expect(result).toContain("Message with\nnewlines");
      expect(result).toContain("  Message with spaces  ");
      expect(result).toContain("\tMessage with tabs\t");
    });

    it("should generate consistent output for same inputs", () => {
      const header = "Consistency Test";
      const messages = ["Message 1", "Message 2"];

      const result1 = createChatMessage(header, messages);
      const result2 = createChatMessage(header, messages);

      expect(result1).toBe(result2);
    });
  });

  describe("createErrorMessage", () => {
    it("should create a basic error message with header and single error", () => {
      const header = "Error Header";
      const errors = ["Test error"];

      const result = createErrorMessage(header, errors);

      expect(result).toContain("Error Header");
      expect(result).toContain("Test error");
      expect(result).toContain("<div");
      expect(result).toContain("<p>");
      expect(result).toContain("<h3");
    });

    it("should create an error message with multiple errors", () => {
      const header = "Multiple Errors";
      const errors = ["First error", "Second error", "Third error"];

      const result = createErrorMessage(header, errors);

      expect(result).toContain("Multiple Errors");
      expect(result).toContain("First error");
      expect(result).toContain("Second error");
      expect(result).toContain("Third error");

      // Should have three paragraph tags
      const paragraphCount = (result.match(/<p>/g) || []).length;
      expect(paragraphCount).toBe(3);
    });

    it("should handle empty errors array", () => {
      const header = "Empty Errors";
      const errors: string[] = [];

      const result = createErrorMessage(header, errors);

      expect(result).toContain("Empty Errors");
      expect(result).toContain("<div");
      // Should not contain any paragraph tags
      expect(result).not.toContain("<p>");
    });

    it("should handle empty header", () => {
      const header = "";
      const errors = ["Test error"];

      const result = createErrorMessage(header, errors);

      expect(result).toContain("Test error");
      expect(result).toContain("<div");
      expect(result).toContain("<p>");
    });

    it("should apply correct CSS styles for error messages", () => {
      const header = "Error Header";
      const errors = ["Error message"];

      const result = createErrorMessage(header, errors);

      // Check for wrapper styles (error-specific)
      expect(result).toContain("border: 1px solid #ff7474");
      expect(result).toContain("border-radius: 4px");
      expect(result).toContain("padding: 8px");
      expect(result).toContain("background-color: #ffebeb");

      // Check for header styles (error-specific)
      expect(result).toContain("color: #ff2020");
      expect(result).toContain("font-weight: bold");
      expect(result).toContain("font-size: 1.125rem");

      // Check for body styles
      expect(result).toContain("font-size: 0.875rem");

      // Should NOT contain chat-specific styles
      expect(result).not.toContain("border: 1px solid #ccc");
      expect(result).not.toContain("margin-bottom: 5px");
    });

    it("should maintain proper HTML structure", () => {
      const header = "Error Structure Test";
      const errors = ["Error 1", "Error 2"];

      const result = createErrorMessage(header, errors);

      // Check for proper nesting - outer div contains h3 header and body div
      expect(result).toMatch(/<div[^>]*><h3[^>]*>Error Structure Test<\/h3><div[^>]*><p>Error 1<\/p><p>Error 2<\/p><\/div><\/div>/);
    });

    it("should handle special characters in header and errors", () => {
      const header = "Special Error Characters: & < > \" '";
      const errors = ["Error with & < > \" ' characters", "Another error with åäö"];

      const result = createErrorMessage(header, errors);

      expect(result).toContain("Special Error Characters: & < > \" '");
      expect(result).toContain("Error with & < > \" ' characters");
      expect(result).toContain("Another error with åäö");
    });

    it("should handle very long header and errors", () => {
      const longHeader = "E".repeat(1000);
      const longError = "R".repeat(2000);
      const errors = [longError];

      const result = createErrorMessage(longHeader, errors);

      expect(result).toContain(longHeader);
      expect(result).toContain(longError);
      expect(result.length).toBeGreaterThan(3000);
    });

    it("should handle errors with newlines and whitespace", () => {
      const header = "Error Whitespace Test";
      const errors = [
        "Error with\nnewlines",
        "  Error with spaces  ",
        "\tError with tabs\t"
      ];

      const result = createErrorMessage(header, errors);

      expect(result).toContain("Error with\nnewlines");
      expect(result).toContain("  Error with spaces  ");
      expect(result).toContain("\tError with tabs\t");
    });

    it("should generate consistent output for same inputs", () => {
      const header = "Error Consistency Test";
      const errors = ["Error 1", "Error 2"];

      const result1 = createErrorMessage(header, errors);
      const result2 = createErrorMessage(header, errors);

      expect(result1).toBe(result2);
    });
  });

  describe("message comparison", () => {
    it("should produce different styling for chat vs error messages", () => {
      const header = "Test Message";
      const content = ["Content"];

      const chatResult = createChatMessage(header, content);
      const errorResult = createErrorMessage(header, content);

      // Should have different wrapper styles
      expect(chatResult).toContain("border: 1px solid #4dffc7");
      expect(errorResult).toContain("border: 1px solid #ff7474");

      // Should have different header styles
      expect(chatResult).not.toContain("color: #ff2020");
      expect(errorResult).toContain("color: #ff2020");

      // Should have different header margin (chat has margin-bottom, error doesn't)
      expect(chatResult).toContain("margin-bottom: 4px");
      expect(errorResult).not.toContain("margin-bottom: 4px");
    });

    it("should have the same basic structure but different styles", () => {
      const header = "Test";
      const content = ["Message"];

      const chatResult = createChatMessage(header, content);
      const errorResult = createErrorMessage(header, content);

      // Both should have the same basic HTML structure
      expect(chatResult).toMatch(/<div[^>]*><h3[^>]*>Test<\/h3><div[^>]*><p>Message<\/p><\/div><\/div>/);
      expect(errorResult).toMatch(/<div[^>]*><h3[^>]*>Test<\/h3><div[^>]*><p>Message<\/p><\/div><\/div>/);

      // But should have different style attributes
      expect(chatResult).not.toBe(errorResult);
    });
  });

  describe("edge cases", () => {
    it("should handle both functions with identical inputs consistently", () => {
      const testCases = [
        { header: "Test", messages: ["msg"] },
        { header: "", messages: [] },
        { header: "Only header", messages: [] },
        { header: "", messages: ["Only message"] }
      ];

      testCases.forEach(({ header, messages }) => {
        const chatResult = createChatMessage(header, messages);
        const errorResult = createErrorMessage(header, messages);

        // Both should return non-empty strings
        expect(chatResult).toBeTruthy();
        expect(errorResult).toBeTruthy();
        expect(typeof chatResult).toBe("string");
        expect(typeof errorResult).toBe("string");
        expect(chatResult.length).toBeGreaterThan(0);
        expect(errorResult.length).toBeGreaterThan(0);

        // Both should contain the header and messages
        expect(chatResult).toContain(header);
        expect(errorResult).toContain(header);
        messages.forEach(message => {
          expect(chatResult).toContain(message);
          expect(errorResult).toContain(message);
        });
      });
    });

    it("should handle null-like values gracefully", () => {
      // Test with falsy but valid string values
      const chatResult = createChatMessage("0", ["0", "false"]);
      const errorResult = createErrorMessage("0", ["0", "false"]);

      expect(chatResult).toContain("0");
      expect(chatResult).toContain("false");
      expect(errorResult).toContain("0");
      expect(errorResult).toContain("false");
    });
  });
});