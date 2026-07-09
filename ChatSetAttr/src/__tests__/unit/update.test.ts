import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AttributeRecord } from "../../types";
import { makeUpdate } from "../../modules/updates";

// Mock the config module
vi.mock("../../modules/config", () => ({
  getConfig: vi.fn(),
}));

// Mock libSmartAttributes global
const mocklibSmartAttributes = {
  getAttribute: vi.fn(),
  setAttribute: vi.fn(),
  deleteAttribute: vi.fn(),
};

global.libSmartAttributes = mocklibSmartAttributes;

import { getConfig } from "../../modules/config";
const mockGetConfig = vi.mocked(getConfig);

describe("updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetConfig.mockReturnValue({ setWithWorker: false });
  });

  describe("Setting Attributes", () => {
    it("should set regular current attributes", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "strength": 15,
          "dexterity": 12,
        },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledTimes(2);
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "strength",
        15,
        "current",
        { noCreate: false, setWithWorker: false }
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "dexterity",
        12,
        "current",
        { noCreate: false, setWithWorker: false }
      );
    });

    it("should set max attributes with _max suffix", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "hp_max": 25,
          "mp_max": 15,
        },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledTimes(2);
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "hp",
        25,
        "max",
        { noCreate: false, setWithWorker: false }
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "mp",
        15,
        "max",
        { noCreate: false, setWithWorker: false }
      );
    });

    it("should handle mixed current and max attributes", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "hp": 20,
          "hp_max": 25,
          "strength": 14,
          "mp_max": 10,
        },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledTimes(4);
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "hp", 20, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "hp", 25, "max", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "strength", 14, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "mp", 10, "max", expect.any(Object)
      );
    });

    it("should convert undefined values to empty strings", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "attribute1": undefined,
          "attribute2_max": undefined,
        },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "attribute1",
        "",
        "current",
        { noCreate: false, setWithWorker: false }
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "attribute2",
        "",
        "max",
        { noCreate: false, setWithWorker: false }
      );
    });

    it("should handle different value types", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "name": "Gandalf",
          "level": 10,
          "active": true,
          "bonus": 1.5,
          "zero": 0,
          "falsy": false,
        },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "name", "Gandalf", "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "level", 10, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "active", true, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "bonus", 1.5, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "zero", 0, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "falsy", false, "current", expect.any(Object)
      );
    });

    it("should handle multiple targets", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
        "char2": { "dexterity": 12 },
        "char3": { "wisdom": 14 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledTimes(3);
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "strength", 15, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char2", "dexterity", 12, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char3", "wisdom", 14, "current", expect.any(Object)
      );
    });

    it("should handle setAttribute errors", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "success": 15,
          "failure": 12,
        },
      };

      mocklibSmartAttributes.setAttribute
        .mockResolvedValueOnce(undefined) // success succeeds
        .mockRejectedValueOnce(new Error("Failed to set failure")); // failure fails

      const result = await makeUpdate("setattr", results);

      expect(result.errors).toEqual([
        "Failed to set attribute 'failure' on target 'char1': Error: Failed to set failure",
      ]);
    });

    it("should handle mixed success and failure across multiple attributes", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "success1": 10,
          "failure1": 20,
          "success2": 30,
          "failure2": 40,
        },
      };

      mocklibSmartAttributes.setAttribute
        .mockResolvedValueOnce(undefined) // success1
        .mockRejectedValueOnce(new Error("Error 1")) // failure1
        .mockResolvedValueOnce(undefined) // success2
        .mockRejectedValueOnce(new Error("Error 2")); // failure2

      const result = await makeUpdate("setattr", results);

      expect(result.errors).toEqual([
        "Failed to set attribute 'failure1' on target 'char1': Error: Error 1",
        "Failed to set attribute 'failure2' on target 'char1': Error: Error 2",
      ]);
    });

    it("should handle non-Error thrown objects", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "attr1": "value1",
          "attr2": "value2",
          "attr3": "value3",
        },
      };

      mocklibSmartAttributes.setAttribute
        .mockRejectedValueOnce("String error")
        .mockRejectedValueOnce(null)
        .mockRejectedValueOnce(undefined);

      const result = await makeUpdate("setattr", results);

      expect(result.errors).toEqual([
        "Failed to set attribute 'attr1' on target 'char1': String error",
        "Failed to set attribute 'attr2' on target 'char1': null",
        "Failed to set attribute 'attr3' on target 'char1': undefined",
      ]);
    });

    it("should handle edge case attribute names", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "_max": "value", // attribute named exactly "_max"
          "a_max": "value", // single character before _max
          "": "empty_name", // empty string name
          "max": "value", // attribute named "max" without underscore
          "not_max_attribute": 10, // contains "max" but doesn't end with "_max"
        },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      const result = await makeUpdate("setattr", results);

      // "_max" should be treated as a max attribute with empty actualName
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "", "value", "max", expect.any(Object)
      );
      // "a_max" should be treated as max attribute for "a"
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "a", "value", "max", expect.any(Object)
      );
      // Empty string name should be current type
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "", "empty_name", "current", expect.any(Object)
      );
      // "max" without underscore should be current type
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "max", "value", "current", expect.any(Object)
      );
      // "not_max_attribute" should be current type
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "not_max_attribute", 10, "current", expect.any(Object)
      );

      expect(result.errors).toEqual([]);
    });
  });

  describe("other setting commands", () => {
    it("should handle modattr the same as setattr", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15, "hp_max": 25 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("modattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledTimes(2);
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "strength", 15, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "hp", 25, "max", expect.any(Object)
      );
    });

    it("should handle modbattr the same as setattr", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "dexterity": 12, "mp_max": 15 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("modbattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledTimes(2);
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "dexterity", 12, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "mp", 15, "max", expect.any(Object)
      );
    });

    it("should handle resetattr the same as setattr", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "wisdom": 14, "sp_max": 20 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("resetattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledTimes(2);
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "wisdom", 14, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "sp", 20, "max", expect.any(Object)
      );
    });
  });

  describe("delattr - comprehensive functionality tests", () => {
    it("should delete regular attributes", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "oldAttribute": "someValue", // value should be ignored for delete
          "temporaryAttr": 42,
        },
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(undefined);

      await makeUpdate("delattr", results);

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledTimes(2);
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith(
        "char1",
        "oldAttribute",
        "current"
      );
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith(
        "char1",
        "temporaryAttr",
        "current"
      );
    });

    it("should handle multiple targets", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "oldAttr1": "value" },
        "char2": { "oldAttr2": "value" },
        "char3": { "oldAttr3": "value" },
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(undefined);

      await makeUpdate("delattr", results);

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledTimes(3);
    });

    it("should handle deleteAttribute errors", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "attr1": "value",
          "attr2": "value",
        },
      };

      mocklibSmartAttributes.deleteAttribute
        .mockResolvedValueOnce(undefined) // attr1 succeeds
        .mockRejectedValueOnce(new Error("Cannot delete attr2")); // attr2 fails

      const result = await makeUpdate("delattr", results);

      expect(result.errors).toEqual([
        "Failed to delete attribute 'attr2' on target 'char1': Error: Cannot delete attr2",
      ]);
    });
  });

  describe("options handling", () => {
    it("should use default options when none provided", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "strength",
        15,
        "current",
        { noCreate: false, setWithWorker: false }
      );
    });

    it("should use provided noCreate option", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
      };
      const options = { noCreate: true };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results, options);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "strength",
        15,
        "current",
        { noCreate: true, setWithWorker: false }
      );
    });

    it("should use setWithWorker from config", async () => {
      mockGetConfig.mockReturnValue({ setWithWorker: true });

      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "strength",
        15,
        "current",
        { noCreate: false, setWithWorker: true }
      );
    });

    it("should combine options and config", async () => {
      mockGetConfig.mockReturnValue({ setWithWorker: true });

      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
      };
      const options = { noCreate: true };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results, options);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "strength",
        15,
        "current",
        { noCreate: true, setWithWorker: true }
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty results", async () => {
      const results: Record<string, AttributeRecord> = {};

      const result = await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).not.toHaveBeenCalled();
      expect(mocklibSmartAttributes.deleteAttribute).not.toHaveBeenCalled();
      expect(result.messages).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("should handle targets with no attributes", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {},
        "char2": {},
      };

      const result = await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).not.toHaveBeenCalled();
      expect(result.messages).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("should handle mixed success and failure", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "success1": 10,
          "failure1": 20,
          "success2": 30,
          "failure2": 40,
        },
      };

      mocklibSmartAttributes.setAttribute
        .mockResolvedValueOnce(undefined) // success1
        .mockRejectedValueOnce(new Error("Error 1")) // failure1
        .mockResolvedValueOnce(undefined) // success2
        .mockRejectedValueOnce(new Error("Error 2")); // failure2

      const result = await makeUpdate("setattr", results);

      expect(result.errors).toEqual([
        "Failed to set attribute 'failure1' on target 'char1': Error: Error 1",
        "Failed to set attribute 'failure2' on target 'char1': Error: Error 2",
      ]);
    });

    it("should handle non-Error thrown objects", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "attr": "value" },
      };

      mocklibSmartAttributes.setAttribute.mockRejectedValue("String error");

      const result = await makeUpdate("setattr", results);

      expect(result.errors).toEqual([
        "Failed to set attribute 'attr' on target 'char1': String error",
      ]);
    });

    it("should handle null and undefined thrown objects", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "attr1": "value1",
          "attr2": "value2",
        },
      };

      mocklibSmartAttributes.setAttribute
        .mockRejectedValueOnce(null)
        .mockRejectedValueOnce(undefined);

      const result = await makeUpdate("setattr", results);

      expect(result.errors).toEqual([
        "Failed to set attribute 'attr1' on target 'char1': null",
        "Failed to set attribute 'attr2' on target 'char1': undefined",
      ]);
    });
  });

  describe("attribute name processing", () => {
    it("should correctly identify and process _max attributes", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "hp": 20,
          "hp_max": 25,
          "strength_max": 18,
          "not_max_attribute": 10, // contains "max" but doesn't end with "_max"
        },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenNthCalledWith(1,
        "char1", "hp", 20, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenNthCalledWith(2,
        "char1", "hp", 25, "max", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenNthCalledWith(3,
        "char1", "strength", 18, "max", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenNthCalledWith(4,
        "char1", "not_max_attribute", 10, "current", expect.any(Object)
      );
    });

    it("should handle edge case attribute names", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "_max": "value", // attribute named exactly "_max"
          "a_max": "value", // single character before _max
          "": "empty_name", // empty string name
          "max": "value", // attribute named "max" without underscore
          "not_max_attribute": 10, // contains "max" but doesn't end with "_max"
        },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      // "_max" should be treated as a max attribute with empty actualName
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "", "value", "max", expect.any(Object)
      );
      // "a_max" should be treated as max attribute for "a"
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "a", "value", "max", expect.any(Object)
      );
      // Empty string name should be current type
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "", "empty_name", "current", expect.any(Object)
      );
      // "max" without underscore should be current type
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "max", "value", "current", expect.any(Object)
      );
      // "not_max_attribute" should be current type
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "not_max_attribute", 10, "current", expect.any(Object)
      );

      const result = await makeUpdate("setattr", results);
      expect(result.errors).toEqual([]);
    });
  });

  describe("other setting commands - verification tests", () => {
    it("should handle modattr the same as setattr", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15, "hp_max": 25 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("modattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledTimes(2);
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "strength", 15, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "hp", 25, "max", expect.any(Object)
      );
    });

    it("should handle modbattr the same as setattr", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "dexterity": 12, "mp_max": 15 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("modbattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledTimes(2);
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "dexterity", 12, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "mp", 15, "max", expect.any(Object)
      );
    });

    it("should handle resetattr the same as setattr", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "wisdom": 14, "sp_max": 20 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("resetattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledTimes(2);
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "wisdom", 14, "current", expect.any(Object)
      );
      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1", "sp", 20, "max", expect.any(Object)
      );
    });
  });

  describe("delattr - comprehensive functionality tests", () => {
    it("should delete regular attributes", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "strength": 15,
          "dexterity": 12,
        },
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(undefined);

      await makeUpdate("delattr", results);

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledTimes(2);
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith(
        "char1",
        "strength",
        "current"
      );
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith(
        "char1",
        "dexterity",
        "current"
      );
    });

    it("should delete max attributes with _max suffix", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "hp_max": 25,
          "mp_max": 15,
        },
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(undefined);

      await makeUpdate("delattr", results);

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledTimes(2);
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith(
        "char1",
        "hp",
        "max"
      );
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith(
        "char1",
        "mp",
        "max"
      );
    });

    it("should handle multiple targets", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
        "char2": { "dexterity": 12 },
        "char3": { "wisdom": 14 },
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(undefined);

      await makeUpdate("delattr", results);

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledTimes(3);
    });

    it("should handle deleteAttribute errors", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "strength": 15,
          "dexterity": 12,
        },
      };

      mocklibSmartAttributes.deleteAttribute
        .mockResolvedValueOnce(undefined) // strength succeeds
        .mockRejectedValueOnce(new Error("Failed to delete dexterity")); // dexterity fails

      const result = await makeUpdate("delattr", results);

      expect(result.errors).toEqual([
        "Failed to delete attribute 'dexterity' on target 'char1': Error: Failed to delete dexterity",
      ]);
    });

    it("should ignore attribute values for deletion", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "attr1": "any value",
          "attr2": 123,
          "attr3": "",
          "attr4": undefined,
          "attr5": true,
        },
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(undefined);

      const result = await makeUpdate("delattr", results);

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledTimes(5);
      // Values should be ignored - only character and attribute name matter
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "attr1", "current");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "attr2", "current");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "attr3", "current");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "attr4", "current");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "attr5", "current");

      expect(result.errors).toEqual([]);
    });

    it("should handle mixed current and max attribute deletions", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "hp": 20,
          "hp_max": 25,
          "strength": 14,
          "mp_max": 10,
        },
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(undefined);

      await makeUpdate("delattr", results);

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledTimes(4);
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "hp", "current");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "hp", "max");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "strength", "current");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "mp", "max");
    });

    it("should handle delete errors for mixed current and max attributes", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "hp": 20,
          "hp_max": 25,
        },
      };

      mocklibSmartAttributes.deleteAttribute
        .mockResolvedValueOnce(undefined) // hp current succeeds
        .mockRejectedValueOnce(new Error("Max deletion failed")); // hp max fails

      const result = await makeUpdate("delattr", results);

      expect(result.errors).toEqual([
        "Failed to delete attribute 'hp' on target 'char1': Error: Max deletion failed",
      ]);
    });

    it("should handle edge case attribute names for deletion", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "_max": "value", // attribute named exactly "_max"
          "a_max": "value", // single character before _max
          "": "empty_name", // empty string name
          "max": "value", // attribute named "max" without underscore
        },
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(undefined);

      const result = await makeUpdate("delattr", results);

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "", "max");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "a", "max");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "", "current");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "max", "current");

      expect(result.errors).toEqual([]);
    });

    it("should handle non-Error thrown objects during deletion", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "attr1": "value1",
          "attr2": "value2",
          "attr3": "value3",
        },
      };

      mocklibSmartAttributes.deleteAttribute
        .mockRejectedValueOnce("String error")
        .mockRejectedValueOnce(null)
        .mockRejectedValueOnce(undefined);

      const result = await makeUpdate("delattr", results);

      expect(result.errors).toEqual([
        "Failed to delete attribute 'attr1' on target 'char1': String error",
        "Failed to delete attribute 'attr2' on target 'char1': null",
        "Failed to delete attribute 'attr3' on target 'char1': undefined",
      ]);
    });

    it("should handle large number of attributes for deletion", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": Object.fromEntries(
          Array.from({ length: 10 }, (_, i) => [`attr${i}`, `value${i}`])
        ),
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(undefined);

      await makeUpdate("delattr", results);

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledTimes(10);
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "attr0", "current");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "attr9", "current");
    });

    it("should handle deletion with empty results", async () => {
      const results: Record<string, AttributeRecord> = {};

      const result = await makeUpdate("delattr", results);

      expect(mocklibSmartAttributes.deleteAttribute).not.toHaveBeenCalled();
      expect(result.messages).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("should handle target with no attributes", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {},
      };

      const result = await makeUpdate("delattr", results);

      expect(mocklibSmartAttributes.deleteAttribute).not.toHaveBeenCalled();
      expect(result.messages).toEqual([]);
      expect(result.errors).toEqual([]);
    });
  });

  describe("configuration handling", () => {
    it("should use setWithWorker from config", async () => {
      mockGetConfig.mockReturnValue({ setWithWorker: true });

      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "strength",
        15,
        "current",
        { noCreate: false, setWithWorker: true }
      );
    });

    it("should handle undefined config", async () => {
      mockGetConfig.mockReturnValue(undefined as unknown as ReturnType<typeof getConfig>);

      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(undefined);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "strength",
        15,
        "current",
        { noCreate: false, setWithWorker: false }
      );
    });
  });
});
