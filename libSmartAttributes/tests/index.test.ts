import { describe, it, expect, vi, beforeEach } from "vitest";
import SmartAttributes from "../src/index";

// Mock Roll20 API functions
const mockGetSheetItem = vi.fn();
const mockSetSheetItem = vi.fn();
const mockLog = vi.fn();


// Setup global mocks
vi.stubGlobal("getSheetItem", mockGetSheetItem);
vi.stubGlobal("setSheetItem", mockSetSheetItem);
vi.stubGlobal("log", mockLog);

describe("SmartAttributes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAttribute", () => {
    const characterId = "char123";
    const attributeName = "strength";

    it("should return beacon computed attribute when no legacy attribute exists", async () => {
      mockGetSheetItem.mockResolvedValueOnce("beacon-value");

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "current");
      expect(result).toBe("beacon-value");
    });

    it("should return user attribute when no legacy or beacon attribute exists", async () => {
      mockGetSheetItem.mockResolvedValueOnce(null).mockResolvedValueOnce("user-value");

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(mockGetSheetItem).toHaveBeenNthCalledWith(1, characterId, attributeName, "current");
      expect(mockGetSheetItem).toHaveBeenNthCalledWith(2, characterId, `user.${attributeName}`, "current");
      expect(result).toBe("user-value");
    });

    it("should log and return undefined when no attribute is found", async () => {
      mockGetSheetItem.mockResolvedValue(null);

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(mockLog).toHaveBeenCalledWith(`Attribute ${attributeName} not found on character ${characterId}`);
      expect(result).toBeUndefined();
    });

    it("should handle falsy beacon values correctly", async () => {
      mockGetSheetItem.mockResolvedValueOnce(0); // 0 is now treated as valid

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(result).toBe(0); // 0 is returned as valid beacon value
      expect(mockGetSheetItem).toHaveBeenCalledTimes(1);
      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "current");
    });

    it("should handle empty string beacon values correctly", async () => {
      mockGetSheetItem.mockResolvedValueOnce(""); // '' is now treated as valid

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(result).toBe(""); // Empty string is returned as valid beacon value
      expect(mockGetSheetItem).toHaveBeenCalledTimes(1);
      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "current");
    });
  });

  describe("setAttribute", () => {
    const characterId = "char123";
    const attributeName = "strength";
    const value = "18";

    it("should set beacon computed attribute when no legacy attribute but beacon exists", async () => {
      mockSetSheetItem.mockResolvedValue("updated-value");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, attributeName, value, "current", {allowThrow: true});
      expect(result).toBeUndefined();
    });

    it("should default to user attribute when no legacy or beacon attribute exists", async () => {
      mockSetSheetItem
        .mockImplementationOnce(()=>{throw new Error("missing computed");})
        .mockResolvedValue("user-value");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, `user.${attributeName}`, value, "current");
      expect(result).toBeUndefined();
    });

    it("should handle complex values correctly", async () => {
      const complexValue = { nested: { value: 42 } };
      mockSetSheetItem
        .mockImplementationOnce(()=>{throw new Error("missing computed");})
        .mockResolvedValue(complexValue);

      const result = await SmartAttributes.setAttribute(characterId, attributeName, complexValue);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(2);
      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, attributeName, complexValue, "current", {allowThrow:true});
      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, `user.${attributeName}`, complexValue, "current");
      expect(result).toBeUndefined();
    });

    it("should handle null and undefined values", async () => {
      mockSetSheetItem.mockResolvedValue(null);
      mockSetSheetItem
        .mockImplementationOnce(()=>{throw new Error("missing computed");})
        .mockResolvedValue(null);

      const result = await SmartAttributes.setAttribute(characterId, attributeName, null);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(2);
      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, attributeName, null, "current",{allowThrow:true});
      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, `user.${attributeName}`, null, "current");
      expect(result).toBeUndefined();
    });

    it("should handle falsy beacon values correctly for setting", async () => {
      mockGetSheetItem.mockResolvedValue(0); // 0 is now treated as valid existing beacon value
      mockSetSheetItem.mockResolvedValue("updated");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, attributeName, value,"current",{allowThrow:true});
      expect(result).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    const characterId = "char123";
    const attributeName = "test-attr";

    it("should handle user attribute when beacon returns null", async () => {
      mockGetSheetItem.mockResolvedValueOnce(null).mockResolvedValueOnce("user-value");

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(result).toBe("user-value");
      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "current");
      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, `user.${attributeName}`, "current");
    });

    it("should handle boolean values in attributes", async () => {
      mockGetSheetItem.mockResolvedValueOnce(false); // Test with false to show falsy values are valid

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(result).toBe(false);
    });
  });

  describe("integration scenarios", () => {
    const characterId = "char123";
    const attributeName = "hp";

    it("should handle complete workflow from get to set with beacon attributes", async () => {
      mockGetSheetItem.mockResolvedValue("beacon-10");
      mockSetSheetItem.mockResolvedValue("beacon-15");

      // Get current value
      const currentValue = await SmartAttributes.getAttribute(characterId, attributeName);
      expect(currentValue).toBe("beacon-10");

      // Set new value
      const result = await SmartAttributes.setAttribute(characterId, attributeName, "beacon-15");
      expect(result).toBeUndefined();
    });

    it("should handle get returning undefined but set still working", async () => {
      mockGetSheetItem.mockResolvedValue(null);
      mockSetSheetItem
        .mockImplementationOnce(()=>{throw new Error("missing computed");})
        .mockResolvedValue("new-value");

      // Get returns undefined
      const currentValue = await SmartAttributes.getAttribute(characterId, attributeName);
      expect(currentValue).toBeUndefined();

      // But set still works by creating user attribute
      const result = await SmartAttributes.setAttribute(characterId, attributeName, "new-value");
      expect(result).toBeUndefined();

      expect(mockSetSheetItem).toHaveBeenCalledTimes(2);
      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "new-value", "current",{allowThrow:true});
      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, `user.${attributeName}`, "new-value", "current");
    });
  });
});
