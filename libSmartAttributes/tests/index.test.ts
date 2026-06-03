import { describe, it, expect, vi, beforeEach } from "vitest";
import SmartAttributes from "../src/index";

const mockGetSheetItem = vi.fn();
const mockSetSheetItem = vi.fn();
const mockLog = vi.fn();

vi.stubGlobal("getSheetItem", mockGetSheetItem);
vi.stubGlobal("setSheetItem", mockSetSheetItem);
vi.stubGlobal("log", mockLog);

/** Matches default setSheetItem options from setAttribute */
const sheetOpts = (overrides: {
  allowThrow?: boolean;
  createAttr?: boolean;
  withWorker?: boolean;
} = {}) => ({
  allowThrow: true,
  createAttr: true,
  withWorker: true,
  ...overrides,
});

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
      mockGetSheetItem.mockResolvedValueOnce(0);

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(result).toBe(0);
      expect(mockGetSheetItem).toHaveBeenCalledTimes(1);
      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "current");
    });

    it("should handle empty string beacon values correctly", async () => {
      mockGetSheetItem.mockResolvedValueOnce("");

      const result = await SmartAttributes.getAttribute(characterId, attributeName);

      expect(result).toBe("");
      expect(mockGetSheetItem).toHaveBeenCalledTimes(1);
      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "current");
    });
  });

  describe("setAttribute", () => {
    const characterId = "char123";
    const attributeName = "strength";
    const value = "18";

    it("should set beacon computed attribute when setSheetItem succeeds", async () => {
      mockSetSheetItem.mockResolvedValue("updated-value");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(1);
      expect(mockSetSheetItem).toHaveBeenCalledWith(
        characterId,
        attributeName,
        value,
        "current",
        sheetOpts({ allowThrow: true })
      );
      expect(result).toBeUndefined();
    });

    it("should default to user attribute when primary setSheetItem throws", async () => {
      mockSetSheetItem
        .mockRejectedValueOnce(new Error("missing computed"))
        .mockResolvedValue("user-value");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(2);
      expect(mockSetSheetItem).toHaveBeenNthCalledWith(
        1,
        characterId,
        attributeName,
        value,
        "current",
        sheetOpts({ allowThrow: true })
      );
      expect(mockSetSheetItem).toHaveBeenNthCalledWith(
        2,
        characterId,
        `user.${attributeName}`,
        value,
        "current",
        sheetOpts({ allowThrow: false })
      );
      expect(result).toBeUndefined();
    });

    it("should pass createAttr false when noCreate is set", async () => {
      mockSetSheetItem.mockRejectedValueOnce(new Error("missing computed"));

      await SmartAttributes.setAttribute(characterId, attributeName, value, "current", {
        noCreate: true,
      });

      expect(mockSetSheetItem).toHaveBeenNthCalledWith(
        1,
        characterId,
        attributeName,
        value,
        "current",
        sheetOpts({ allowThrow: true, createAttr: false })
      );
      expect(mockSetSheetItem).toHaveBeenNthCalledWith(
        2,
        characterId,
        `user.${attributeName}`,
        value,
        "current",
        sheetOpts({ allowThrow: false, createAttr: false })
      );
    });

    it("should pass withWorker false when setWithWorker is false", async () => {
      mockSetSheetItem.mockResolvedValue("ok");

      await SmartAttributes.setAttribute(characterId, attributeName, value, "current", {
        setWithWorker: false,
      });

      expect(mockSetSheetItem).toHaveBeenCalledWith(
        characterId,
        attributeName,
        value,
        "current",
        sheetOpts({ allowThrow: true, withWorker: false })
      );
    });

    it("should handle complex values correctly", async () => {
      const complexValue = { nested: { value: 42 } };
      mockSetSheetItem
        .mockRejectedValueOnce(new Error("missing computed"))
        .mockResolvedValue(complexValue);

      const result = await SmartAttributes.setAttribute(characterId, attributeName, complexValue);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(2);
      expect(mockSetSheetItem).toHaveBeenNthCalledWith(
        1,
        characterId,
        attributeName,
        complexValue,
        "current",
        sheetOpts({ allowThrow: true })
      );
      expect(mockSetSheetItem).toHaveBeenNthCalledWith(
        2,
        characterId,
        `user.${attributeName}`,
        complexValue,
        "current",
        sheetOpts({ allowThrow: false })
      );
      expect(result).toBeUndefined();
    });

    it("should handle null and undefined values", async () => {
      mockSetSheetItem
        .mockRejectedValueOnce(new Error("missing computed"))
        .mockResolvedValue(null);

      const result = await SmartAttributes.setAttribute(characterId, attributeName, null);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(2);
      expect(mockSetSheetItem).toHaveBeenNthCalledWith(
        1,
        characterId,
        attributeName,
        null,
        "current",
        sheetOpts({ allowThrow: true })
      );
      expect(mockSetSheetItem).toHaveBeenNthCalledWith(
        2,
        characterId,
        `user.${attributeName}`,
        null,
        "current",
        sheetOpts({ allowThrow: false })
      );
      expect(result).toBeUndefined();
    });

    it("should succeed on first setSheetItem without fallback", async () => {
      mockSetSheetItem.mockResolvedValue("updated");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(1);
      expect(mockSetSheetItem).toHaveBeenCalledWith(
        characterId,
        attributeName,
        value,
        "current",
        sheetOpts({ allowThrow: true })
      );
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
      mockGetSheetItem.mockResolvedValueOnce(false);

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

      const currentValue = await SmartAttributes.getAttribute(characterId, attributeName);
      expect(currentValue).toBe("beacon-10");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, "beacon-15");
      expect(result).toBeUndefined();
    });

    it("should handle get returning undefined but set still working", async () => {
      mockGetSheetItem.mockResolvedValue(null);
      mockSetSheetItem
        .mockRejectedValueOnce(new Error("missing computed"))
        .mockResolvedValue("new-value");

      const currentValue = await SmartAttributes.getAttribute(characterId, attributeName);
      expect(currentValue).toBeUndefined();

      const result = await SmartAttributes.setAttribute(characterId, attributeName, "new-value");
      expect(result).toBeUndefined();

      expect(mockSetSheetItem).toHaveBeenCalledTimes(2);
      expect(mockSetSheetItem).toHaveBeenNthCalledWith(
        1,
        characterId,
        attributeName,
        "new-value",
        "current",
        sheetOpts({ allowThrow: true })
      );
      expect(mockSetSheetItem).toHaveBeenNthCalledWith(
        2,
        characterId,
        `user.${attributeName}`,
        "new-value",
        "current",
        sheetOpts({ allowThrow: false })
      );
    });
  });
});
