import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAttributes,
  setAttributes,
  setSingleAttribute,
  deleteAttributes,
  deleteSingleAttribute
} from "../../modules/attributes";
import type { Attribute, AttributeRecord } from "../../types";

// Mock libSmartAttributes
const mockGetAttribute = vi.fn();
const mockSetAttribute = vi.fn();
const mockDeleteAttribute = vi.fn();

const mocklibSmartAttributes = {
  getAttribute: mockGetAttribute,
  setAttribute: mockSetAttribute,
  deleteAttribute: mockDeleteAttribute
};

// Setup global libSmartAttributes mock
global.libSmartAttributes = mocklibSmartAttributes;

describe("attributes module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAttributes", () => {
    const target = "character-123";

    it("should get single attribute from array", async () => {
      mockGetAttribute.mockResolvedValue("Test Value");

      const result = await getAttributes(target, ["strength"]);

      expect(result).toEqual({ strength: "Test Value" });
      expect(mockGetAttribute).toHaveBeenCalledWith(target, "strength", "current");
    });

    it("should get multiple attributes from array", async () => {
      mockGetAttribute
        .mockResolvedValueOnce("18")
        .mockResolvedValueOnce("16")
        .mockResolvedValueOnce("14");

      const result = await getAttributes(target, ["strength", "dexterity", "constitution"]);

      expect(result).toEqual({
        strength: "18",
        dexterity: "16",
        constitution: "14"
      });
      expect(mockGetAttribute).toHaveBeenCalledTimes(3);
      expect(mockGetAttribute).toHaveBeenNthCalledWith(1, target, "strength", "current");
      expect(mockGetAttribute).toHaveBeenNthCalledWith(2, target, "dexterity", "current");
      expect(mockGetAttribute).toHaveBeenNthCalledWith(3, target, "constitution", "current");
    });

    it("should handle _max suffix for max attributes", async () => {
      mockGetAttribute.mockResolvedValue("100");

      const result = await getAttributes(target, ["hp_max"]);

      expect(result).toEqual({ hp_max: "100" });
      expect(mockGetAttribute).toHaveBeenCalledWith(target, "hp", "max");
    });

    it("should get attributes from object record", async () => {
      mockGetAttribute
        .mockResolvedValueOnce("Test")
        .mockResolvedValueOnce("Value");

      const record: AttributeRecord = { name: undefined, description: undefined };
      const result = await getAttributes(target, record);

      expect(result).toEqual({
        name: "Test",
        description: "Value"
      });
      expect(mockGetAttribute).toHaveBeenCalledTimes(2);
    });

    it("should clean attribute names by removing special characters", async () => {
      mockGetAttribute.mockResolvedValue("cleaned");

      const result = await getAttributes(target, ["test-attr!", "another@attr#"]);

      expect(result).toEqual({
        testattr: "cleaned",
        anotherattr: "cleaned"
      });
      expect(mockGetAttribute).toHaveBeenCalledWith(target, "testattr", "current");
      expect(mockGetAttribute).toHaveBeenCalledWith(target, "anotherattr", "current");
    });

    it("should handle libSmartAttributes errors by returning undefined", async () => {
      mockGetAttribute.mockRejectedValue(new Error("Attribute not found"));

      const result = await getAttributes(target, ["nonexistent"]);

      expect(result).toEqual({ nonexistent: undefined });
    });

    it("should handle mixed success and failure", async () => {
      mockGetAttribute
        .mockResolvedValueOnce("success")
        .mockRejectedValueOnce(new Error("failed"));

      const result = await getAttributes(target, ["existing", "missing"]);

      expect(result).toEqual({
        existing: "success",
        missing: undefined
      });
    });

    it("should handle empty array", async () => {
      const result = await getAttributes(target, []);

      expect(result).toEqual({});
      expect(mockGetAttribute).not.toHaveBeenCalled();
    });

    it("should handle empty object", async () => {
      const result = await getAttributes(target, {});

      expect(result).toEqual({});
      expect(mockGetAttribute).not.toHaveBeenCalled();
    });
  });

  describe("setSingleAttribute", () => {
    const target = "character-123";
    const options = { replace: true };

    it("should set current attribute", async () => {
      mockSetAttribute.mockResolvedValue(undefined);

      await setSingleAttribute(target, "strength", 18, options);

      expect(mockSetAttribute).toHaveBeenCalledWith(target, "strength", 18, "current", options);
    });

    it("should set max attribute when isMax is true", async () => {
      mockSetAttribute.mockResolvedValue(undefined);

      await setSingleAttribute(target, "hp", 100, options, true);

      expect(mockSetAttribute).toHaveBeenCalledWith(target, "hp", 100, "max", options);
    });

    it("should handle string values", async () => {
      mockSetAttribute.mockResolvedValue(undefined);

      await setSingleAttribute(target, "name", "Test Character", options);

      expect(mockSetAttribute).toHaveBeenCalledWith(target, "name", "Test Character", "current", options);
    });

    it("should handle boolean values", async () => {
      mockSetAttribute.mockResolvedValue(undefined);

      await setSingleAttribute(target, "isDead", false, options);

      expect(mockSetAttribute).toHaveBeenCalledWith(target, "isDead", false, "current", options);
    });

    it("should handle numeric values", async () => {
      mockSetAttribute.mockResolvedValue(undefined);

      await setSingleAttribute(target, "level", 5, options);

      expect(mockSetAttribute).toHaveBeenCalledWith(target, "level", 5, "current", options);
    });
  });

  describe("setAttributes", () => {
    const target = "character-123";
    const options = { replace: true, silent: false };

    it("should set single attribute with current value", async () => {
      mockSetAttribute.mockResolvedValue(undefined);

      const attributes: Attribute[] = [
        { name: "strength", current: 18 }
      ];

      await setAttributes(target, attributes, options);

      expect(mockSetAttribute).toHaveBeenCalledWith(target, "strength", 18, "current", options);
    });

    it("should set single attribute with max value", async () => {
      mockSetAttribute.mockResolvedValue(undefined);

      const attributes: Attribute[] = [
        { name: "hp", max: 100 }
      ];

      await setAttributes(target, attributes, options);

      expect(mockSetAttribute).toHaveBeenCalledWith(target, "hp", 100, "max", options);
    });

    it("should set both current and max values", async () => {
      mockSetAttribute.mockResolvedValue(undefined);

      const attributes: Attribute[] = [
        { name: "hp", current: 75, max: 100 }
      ];

      await setAttributes(target, attributes, options);

      expect(mockSetAttribute).toHaveBeenCalledTimes(2);
      expect(mockSetAttribute).toHaveBeenNthCalledWith(1, target, "hp", 75, "current", options);
      expect(mockSetAttribute).toHaveBeenNthCalledWith(2, target, "hp", 100, "max", options);
    });

    it("should set multiple attributes", async () => {
      mockSetAttribute.mockResolvedValue(undefined);

      const attributes: Attribute[] = [
        { name: "strength", current: 18 },
        { name: "dexterity", current: 16 },
        { name: "hp", current: 75, max: 100 }
      ];

      await setAttributes(target, attributes, options);

      expect(mockSetAttribute).toHaveBeenCalledTimes(4);
      expect(mockSetAttribute).toHaveBeenNthCalledWith(1, target, "strength", 18, "current", options);
      expect(mockSetAttribute).toHaveBeenNthCalledWith(2, target, "dexterity", 16, "current", options);
      expect(mockSetAttribute).toHaveBeenNthCalledWith(3, target, "hp", 75, "current", options);
      expect(mockSetAttribute).toHaveBeenNthCalledWith(4, target, "hp", 100, "max", options);
    });

    it("should handle different value types", async () => {
      mockSetAttribute.mockResolvedValue(undefined);

      const attributes: Attribute[] = [
        { name: "name", current: "Test Character" },
        { name: "level", current: 5 },
        { name: "isDead", current: false }
      ];

      await setAttributes(target, attributes, options);

      expect(mockSetAttribute).toHaveBeenCalledTimes(3);
      expect(mockSetAttribute).toHaveBeenNthCalledWith(1, target, "name", "Test Character", "current", options);
      expect(mockSetAttribute).toHaveBeenNthCalledWith(2, target, "level", 5, "current", options);
      expect(mockSetAttribute).toHaveBeenNthCalledWith(3, target, "isDead", false, "current", options);
    });

    it("should throw error if attribute has no name", async () => {
      const attributes: Attribute[] = [
        { current: 18 } // Missing name
      ];

      await expect(setAttributes(target, attributes, options))
        .rejects.toThrow("Attribute must have a name defined.");
    });

    it("should throw error if attribute has neither current nor max value", async () => {
      const attributes: Attribute[] = [
        { name: "strength" } // Missing both current and max
      ];

      await expect(setAttributes(target, attributes, options))
        .rejects.toThrow("Attribute must have at least a current or max value defined.");
    });

    it("should handle empty attributes array", async () => {
      await setAttributes(target, [], options);

      expect(mockSetAttribute).not.toHaveBeenCalled();
    });

    it("should handle Promise.all rejections properly", async () => {
      mockSetAttribute.mockRejectedValue(new Error("Set failed"));

      const attributes: Attribute[] = [
        { name: "strength", current: 18 }
      ];

      await expect(setAttributes(target, attributes, options))
        .rejects.toThrow("Set failed");
    });

    it("should execute all operations in parallel", async () => {
      const callOrder: number[] = [];
      let callCount = 0;

      mockSetAttribute.mockImplementation(async () => {
        const currentCall = ++callCount;
        callOrder.push(currentCall);
        // Simulate async delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        return undefined;
      });

      const attributes: Attribute[] = [
        { name: "attr1", current: 1 },
        { name: "attr2", current: 2 },
        { name: "attr3", current: 3 }
      ];

      await setAttributes(target, attributes, options);

      expect(mockSetAttribute).toHaveBeenCalledTimes(3);
      // All calls should have been initiated quickly (in parallel)
      expect(callOrder).toEqual([1, 2, 3]);
    });
  });

  describe("deleteSingleAttribute", () => {
    const target = "character-123";

    it("should delete single attribute", async () => {
      mockDeleteAttribute.mockResolvedValue(true);

      await deleteSingleAttribute(target, "oldAttribute");

      expect(mockDeleteAttribute).toHaveBeenCalledWith(target, "oldAttribute");
    });

    it("should handle delete failures", async () => {
      mockDeleteAttribute.mockRejectedValue(new Error("Delete failed"));

      await expect(deleteSingleAttribute(target, "nonexistent"))
        .rejects.toThrow("Delete failed");
    });
  });

  describe("deleteAttributes", () => {
    const target = "character-123";

    it("should delete single attribute", async () => {
      mockDeleteAttribute.mockResolvedValue(true);

      await deleteAttributes(target, ["oldAttribute"]);

      expect(mockDeleteAttribute).toHaveBeenCalledWith(target, "oldAttribute");
    });

    it("should delete multiple attributes", async () => {
      mockDeleteAttribute.mockResolvedValue(true);

      const attributeNames = ["attr1", "attr2", "attr3"];
      await deleteAttributes(target, attributeNames);

      expect(mockDeleteAttribute).toHaveBeenCalledTimes(3);
      expect(mockDeleteAttribute).toHaveBeenNthCalledWith(1, target, "attr1");
      expect(mockDeleteAttribute).toHaveBeenNthCalledWith(2, target, "attr2");
      expect(mockDeleteAttribute).toHaveBeenNthCalledWith(3, target, "attr3");
    });

    it("should handle empty array", async () => {
      await deleteAttributes(target, []);

      expect(mockDeleteAttribute).not.toHaveBeenCalled();
    });

    it("should handle mixed success and failure", async () => {
      mockDeleteAttribute
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error("Delete failed"))
        .mockResolvedValueOnce(true);

      await expect(deleteAttributes(target, ["attr1", "attr2", "attr3"]))
        .rejects.toThrow("Delete failed");

      expect(mockDeleteAttribute).toHaveBeenCalledTimes(3);
    });

    it("should execute all deletions in parallel", async () => {
      const callOrder: number[] = [];
      let callCount = 0;

      mockDeleteAttribute.mockImplementation(async () => {
        const currentCall = ++callCount;
        callOrder.push(currentCall);
        // Simulate async delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        return true;
      });

      const attributeNames = ["attr1", "attr2", "attr3"];
      await deleteAttributes(target, attributeNames);

      expect(mockDeleteAttribute).toHaveBeenCalledTimes(3);
      // All calls should have been initiated quickly (in parallel)
      expect(callOrder).toEqual([1, 2, 3]);
    });

    it("should handle different return types from libSmartAttributes", async () => {
      mockDeleteAttribute
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(undefined);

      await deleteAttributes(target, ["attr1", "attr2", "attr3"]);

      expect(mockDeleteAttribute).toHaveBeenCalledTimes(3);
    });
  });

  describe("integration tests", () => {
    const target = "character-123";

    it("should handle a complete workflow", async () => {
      // Setup mocks
      mockGetAttribute.mockResolvedValue(undefined); // Attribute doesn't exist
      mockSetAttribute.mockResolvedValue(undefined);
      mockDeleteAttribute.mockResolvedValue(true);

      // Get attribute (should be undefined initially)
      const initialValue = await getAttributes(target, ["strength"]);
      expect(initialValue).toEqual({ strength: undefined });

      // Set attribute
      await setAttributes(target, [{ name: "strength", current: 18 }], {});
      expect(mockSetAttribute).toHaveBeenCalledWith(target, "strength", 18, "current", {});

      // Mock that attribute now exists
      mockGetAttribute.mockResolvedValue(18);
      const updatedValue = await getAttributes(target, ["strength"]);
      expect(updatedValue).toEqual({ strength: 18 });

      // Delete attribute
      await deleteAttributes(target, ["strength"]);
      expect(mockDeleteAttribute).toHaveBeenCalledWith(target, "strength");
    });

    it("should handle batch operations efficiently", async () => {
      mockSetAttribute.mockResolvedValue(undefined);
      mockDeleteAttribute.mockResolvedValue(true);

      const attributes: Attribute[] = [
        { name: "str", current: 18, max: 20 },
        { name: "dex", current: 16, max: 18 },
        { name: "con", current: 14, max: 16 }
      ];

      // Set all attributes
      await setAttributes(target, attributes, {});
      expect(mockSetAttribute).toHaveBeenCalledTimes(6); // 3 current + 3 max

      // Delete all attributes
      await deleteAttributes(target, ["str", "dex", "con"]);
      expect(mockDeleteAttribute).toHaveBeenCalledTimes(3);
    });

    it("should handle error scenarios gracefully", async () => {
      // Test that errors in individual operations are properly propagated
      mockSetAttribute.mockRejectedValue(new Error("Permission denied"));

      const attributes: Attribute[] = [
        { name: "strength", current: 18 }
      ];

      await expect(setAttributes(target, attributes, {}))
        .rejects.toThrow("Permission denied");
    });
  });
});