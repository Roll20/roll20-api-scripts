import { describe, it, expect, vi, beforeEach } from "vitest";
import SmartAttributes from "../src/index";

// Mock Roll20 API functions
const mockFindObjs = vi.fn();
const mockGetSheetItem = vi.fn();
const mockSetSheetItem = vi.fn();
const mockLog = vi.fn();

// Mock attribute object
const createMockAttribute = (value: unknown) => ({
  get: vi.fn().mockReturnValue(value),
  set: vi.fn().mockReturnValue(value)
});

// Setup global mocks
vi.stubGlobal("findObjs", mockFindObjs);
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

    it("should return legacy attribute current value when legacy attribute exists", async () => {
      const mockAttr = createMockAttribute("15");
      mockFindObjs.mockReturnValue([mockAttr]);

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(mockFindObjs).toHaveBeenCalledWith({
        _type: "attribute",
        _characterid: characterId,
        name: attributeName
      });
      expect(mockAttr.get).toHaveBeenCalledWith("current");
      expect(result).toBe("15");
    });

    it("should return legacy attribute max value when type is specified", async () => {
      const mockAttr = createMockAttribute("20");
      mockFindObjs.mockReturnValue([mockAttr]);

      const result = await SmartAttributes.getAttribute(characterId, attributeName, "max");

      expect(mockAttr.get).toHaveBeenCalledWith("max");
      expect(result).toBe("20");
    });

    it("should return beacon computed attribute when no legacy attribute exists", async () => {
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValueOnce("beacon-value");

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(mockFindObjs).toHaveBeenCalled();
      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "current");
      expect(result).toBe("beacon-value");
    });

    it("should return user attribute when no legacy or beacon attribute exists", async () => {
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValueOnce(null).mockResolvedValueOnce("user-value");

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(mockGetSheetItem).toHaveBeenNthCalledWith(1, characterId, attributeName, "current");
      expect(mockGetSheetItem).toHaveBeenNthCalledWith(2, characterId, `user.${attributeName}`, "current");
      expect(result).toBe("user-value");
    });

    it("should log and return undefined when no attribute is found", async () => {
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValue(null);

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(mockLog).toHaveBeenCalledWith(`Attribute ${attributeName} not found on character ${characterId}`);
      expect(result).toBeUndefined();
    });

    it("should handle falsy beacon values correctly", async () => {
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValueOnce(0); // 0 is now treated as valid

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(result).toBe(0); // 0 is returned as valid beacon value
      expect(mockGetSheetItem).toHaveBeenCalledTimes(1);
      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "current");
    });

    it("should handle empty string beacon values correctly", async () => {
      mockFindObjs.mockReturnValue([]);
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

    it("should set legacy attribute current value when legacy attribute exists", async () => {
      const mockAttr = createMockAttribute("15");
      mockAttr.set.mockReturnValue(value); // Mock set to return the new value
      mockFindObjs.mockReturnValue([mockAttr]);

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockFindObjs).toHaveBeenCalledWith({
        _type: "attribute",
        _characterid: characterId,
        name: attributeName
      });
      expect(mockAttr.set).toHaveBeenCalledWith({ current: value });
      expect(result).toBeUndefined();
    });

    it("should set legacy attribute max value when type is specified", async () => {
      const mockAttr = createMockAttribute("20");
      mockAttr.set.mockReturnValue(value); // Mock set to return the new value
      mockFindObjs.mockReturnValue([mockAttr]);

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value, "max");

      expect(mockAttr.set).toHaveBeenCalledWith({ max: value });
      expect(result).toBeUndefined();
    });

    it("should set beacon computed attribute when no legacy attribute but beacon exists", async () => {
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValue("existing-beacon-value");
      mockSetSheetItem.mockResolvedValue("updated-value");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "current");
      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, attributeName, value);
      expect(result).toBeUndefined();
    });

    it("should default to user attribute when no legacy or beacon attribute exists", async () => {
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValue(null);
      mockSetSheetItem.mockResolvedValue("user-value");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, `user.${attributeName}`, value, "current");
      expect(result).toBeUndefined();
    });

    it("should handle complex values correctly", async () => {
      const complexValue = { nested: { value: 42 } };
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValue(null);
      mockSetSheetItem.mockResolvedValue(complexValue);

      const result = await SmartAttributes.setAttribute(characterId, attributeName, complexValue);

      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, `user.${attributeName}`, complexValue, "current");
      expect(result).toBeUndefined();
    });

    it("should handle null and undefined values", async () => {
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValue(null);
      mockSetSheetItem.mockResolvedValue(null);

      const result = await SmartAttributes.setAttribute(characterId, attributeName, null);

      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, `user.${attributeName}`, null, "current");
      expect(result).toBeUndefined();
    });

    it("should handle falsy beacon values correctly for setting", async () => {
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValue(0); // 0 is now treated as valid existing beacon value
      mockSetSheetItem.mockResolvedValue("updated");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, attributeName, value);
      expect(result).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    const characterId = "char123";
    const attributeName = "test-attr";

    it("should handle user attribute when beacon returns null", async () => {
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValueOnce(null).mockResolvedValueOnce("user-value");

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(result).toBe("user-value");
      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "current");
      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, `user.${attributeName}`, "current");
    });

    it("should handle numeric values in attributes", async () => {
      const mockAttr = createMockAttribute(42);
      mockFindObjs.mockReturnValue([mockAttr]);

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(result).toBe(42);
    });

    it("should handle boolean values in attributes", async () => {
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValueOnce(false); // Test with false to show falsy values are valid

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(result).toBe(false);
    });
  });

  describe("integration scenarios", () => {
    const characterId = "char123";
    const attributeName = "hp";

    it("should handle complete workflow from get to set with legacy attributes", async () => {
      const mockAttr = createMockAttribute("10");
      mockFindObjs.mockReturnValue([mockAttr]);

      // Get current value
      const currentValue = await SmartAttributes.getAttribute(characterId, attributeName);
      expect(currentValue).toBe("10");

      // Set new value
      mockAttr.set.mockReturnValue("15");
      const result = await SmartAttributes.setAttribute(characterId, attributeName, "15");
      expect(result).toBeUndefined();
    });

    it("should handle complete workflow from get to set with beacon attributes", async () => {
      mockFindObjs.mockReturnValue([]);
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
      mockFindObjs.mockReturnValue([]);
      mockGetSheetItem.mockResolvedValue(null);
      mockSetSheetItem.mockResolvedValue("new-value");

      // Get returns undefined
      const currentValue = await SmartAttributes.getAttribute(characterId, attributeName);
      expect(currentValue).toBeUndefined();

      // But set still works by creating user attribute
      const result = await SmartAttributes.setAttribute(characterId, attributeName, "new-value");
      expect(result).toBeUndefined();
      expect(mockSetSheetItem).toHaveBeenCalledWith(characterId, `user.${attributeName}`, "new-value", "current");
    });
  });
});