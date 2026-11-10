import { describe, it, expect, vi, beforeEach } from "vitest";
import SmartAttributes from "../src/index";

const mockFindObjs = vi.fn();
const mockGetObj = vi.fn();
const mockGetSheetItem = vi.fn();
const mockSetSheetItem = vi.fn();
const mockLog = vi.fn();

vi.stubGlobal("findObjs", mockFindObjs);
vi.stubGlobal("getObj", mockGetObj);
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

/** Mimics setSheetItem errors from displayErrorMessage(..., true, errorType, details) */
const sheetItemError = (type: string, message = "setSheetItem failed") => {
  const err = new Error(message) as Error & { type: string; details?: Record<string, unknown> };
  err.type = type;
  return err;
};

describe("SmartAttributes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindObjs.mockReturnValue([]);
    mockGetObj.mockReturnValue({ sheetEnvironment: "beacon" });
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

    it("should return true when setSheetItem succeeds on computed", async () => {
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
      expect(result).toBe(true);
    });

    it("should return true when falling through to user attribute", async () => {
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
        sheetOpts({ allowThrow: true })
      );
      expect(result).toBe(true);
    });

    it("should return false and not create user attribute when computed is read-only", async () => {
      mockSetSheetItem.mockRejectedValueOnce(
        sheetItemError("COMPUTED_READONLY", 'ERROR: Readonly Property "strength".')
      );

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(1);
      expect(mockSetSheetItem).toHaveBeenCalledWith(
        characterId,
        attributeName,
        value,
        "current",
        sheetOpts({ allowThrow: true })
      );
      expect(result).toBe(false);
    });

    it("should return true when falling through for non-readonly setSheetItem errors", async () => {
      mockSetSheetItem
        .mockRejectedValueOnce(
          sheetItemError("COMPUTED_INVALID", 'ERROR: Property "strength" doesn\'t exist.')
        )
        .mockResolvedValue("user-value");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(2);
      expect(mockSetSheetItem).toHaveBeenNthCalledWith(
        2,
        characterId,
        `user.${attributeName}`,
        value,
        "current",
        sheetOpts({ allowThrow: true })
      );
      expect(result).toBe(true);
    });

    it("should return false when user attribute fallback also fails", async () => {
      mockSetSheetItem
        .mockRejectedValueOnce(new Error("missing computed"))
        .mockRejectedValueOnce(new Error("user set failed"));

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(2);
      expect(result).toBe(false);
    });

    it("should pass createAttr false when noCreate is set", async () => {
      mockSetSheetItem
        .mockRejectedValueOnce(new Error("missing computed"))
        .mockResolvedValue("user-value");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value, "current", {
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
        sheetOpts({ allowThrow: true, createAttr: false })
      );
      expect(result).toBe(true);
    });

    it("should pass withWorker false when setWithWorker is false", async () => {
      mockSetSheetItem.mockResolvedValue("ok");

      const result = await SmartAttributes.setAttribute(characterId, attributeName, value, "current", {
        setWithWorker: false,
      });

      expect(mockSetSheetItem).toHaveBeenCalledWith(
        characterId,
        attributeName,
        value,
        "current",
        sheetOpts({ allowThrow: true, withWorker: false })
      );
      expect(result).toBe(true);
    });

    it("should return true for complex values via user fallback", async () => {
      const complexValue = { nested: { value: 42 } };
      mockSetSheetItem
        .mockRejectedValueOnce(new Error("missing computed"))
        .mockResolvedValue(complexValue);

      const result = await SmartAttributes.setAttribute(characterId, attributeName, complexValue);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it("should return true when setting null via user fallback", async () => {
      mockSetSheetItem
        .mockRejectedValueOnce(new Error("missing computed"))
        .mockResolvedValue(null);

      const result = await SmartAttributes.setAttribute(characterId, attributeName, null);

      expect(mockSetSheetItem).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });
  });

  describe("deleteAttribute", () => {
    const characterId = "char123";
    const attributeName = "strength";

    it("should return true when removing a legacy attribute", async () => {
      const mockRemove = vi.fn();
      mockGetObj.mockReturnValue({ sheetEnvironment: "legacy" });
      mockFindObjs.mockReturnValue([{ remove: mockRemove }]);

      const result = await SmartAttributes.deleteAttribute(characterId, attributeName);

      expect(mockFindObjs).toHaveBeenCalledWith({
        _type: "attribute",
        _characterid: characterId,
        name: attributeName,
      });
      expect(mockRemove).toHaveBeenCalled();
      expect(mockGetSheetItem).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return true when removing a legacy attribute on default-sandbox characters", async () => {
      const mockRemove = vi.fn();
      mockGetObj.mockReturnValue({});
      mockFindObjs.mockReturnValue([{ remove: mockRemove }]);

      const result = await SmartAttributes.deleteAttribute(characterId, attributeName);

      expect(mockRemove).toHaveBeenCalled();
      expect(mockGetSheetItem).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false when legacy character has no matching attribute", async () => {
      mockGetObj.mockReturnValue({ sheetEnvironment: "legacy" });
      mockFindObjs.mockReturnValue([]);

      const result = await SmartAttributes.deleteAttribute(characterId, attributeName);

      expect(mockGetSheetItem).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should return false when character is not found", async () => {
      mockGetObj.mockReturnValue(null);

      const result = await SmartAttributes.deleteAttribute(characterId, attributeName);

      expect(result).toBe(false);
    });

    it("should return false when a beacon computed exists and no legacy attribute exists", async () => {
      mockGetSheetItem.mockResolvedValueOnce("10");

      const result = await SmartAttributes.deleteAttribute(characterId, attributeName);

      expect(mockFindObjs).toHaveBeenCalledTimes(0);
      expect(mockGetSheetItem).toHaveBeenCalledTimes(1);
      expect(mockGetSheetItem).toHaveBeenCalledWith(characterId, attributeName, "current");
      expect(mockSetSheetItem).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should return false for falsy beacon computed values without calling setSheetItem", async () => {
      mockGetSheetItem.mockResolvedValueOnce(0);

      const result = await SmartAttributes.deleteAttribute(characterId, attributeName);

      expect(mockSetSheetItem).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should ignore legacy attribute on beacon character before checking computed", async () => {
      const mockRemove = vi.fn();
      mockGetObj.mockReturnValue({ sheetEnvironment: "beacon" });
      mockFindObjs.mockReturnValue([{ remove: mockRemove }]);

      const result = await SmartAttributes.deleteAttribute(characterId, attributeName);

      expect(mockRemove).not.toHaveBeenCalled();
      expect(mockGetSheetItem).toHaveBeenCalledTimes(2);
      expect(result).toBe(false);
    });

    it("should return true when deleting an existing user attribute", async () => {
      mockGetSheetItem
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce("user-value");
      mockSetSheetItem.mockResolvedValue(true);

      const result = await SmartAttributes.deleteAttribute(characterId, attributeName);

      expect(mockGetSheetItem).toHaveBeenNthCalledWith(1, characterId, attributeName, "current");
      expect(mockGetSheetItem).toHaveBeenNthCalledWith(2, characterId, `user.${attributeName}`, "current");
      expect(mockSetSheetItem).toHaveBeenCalledWith(
        characterId,
        `user.${attributeName}`,
        undefined,
        "current",
        { allowThrow: true, createAttr: false }
      );
      expect(result).toBe(true);
    });

    it("should return false when no attribute exists", async () => {
      mockGetSheetItem.mockResolvedValue(null);

      const result = await SmartAttributes.deleteAttribute(characterId, attributeName);

      expect(mockSetSheetItem).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should return false when user attribute delete fails", async () => {
      mockGetSheetItem
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce("user-value");
      mockSetSheetItem.mockRejectedValueOnce(new Error("delete failed"));

      const result = await SmartAttributes.deleteAttribute(characterId, attributeName);

      expect(result).toBe(false);
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
      expect(result).toBe(true);
    });

    it("should return true when set falls through to user attribute", async () => {
      mockGetSheetItem.mockResolvedValue(null);
      mockSetSheetItem
        .mockRejectedValueOnce(new Error("missing computed"))
        .mockResolvedValue("new-value");

      const currentValue = await SmartAttributes.getAttribute(characterId, attributeName);
      expect(currentValue).toBeUndefined();

      const result = await SmartAttributes.setAttribute(characterId, attributeName, "new-value");
      expect(result).toBe(true);

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
        sheetOpts({ allowThrow: true })
      );
    });
  });
});
