import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AttributeRecord } from "../../types";
import { resetAllObjects } from "../../__mocks__/apiObjects.mock";
import { makeUpdate } from "../../modules/updates";

// Mock the config module
vi.mock("../../modules/config", () => ({
  getConfig: vi.fn(),
}));

vi.mock("../../modules/observer", () => ({
  notifyObservers: vi.fn(),
}));

// Mock libSmartAttributes global
const mocklibSmartAttributes = {
  getAttribute: vi.fn(),
  setAttribute: vi.fn(),
  deleteAttribute: vi.fn(),
};

global.libSmartAttributes = mocklibSmartAttributes;

import { getConfig } from "../../modules/config";
import { notifyObservers } from "../../modules/observer";
const mockGetConfig = vi.mocked(getConfig);
const mockNotifyObservers = vi.mocked(notifyObservers);

describe("updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllObjects();
    mockGetConfig.mockReturnValue({ useWorkers: false });
  });

  describe("Setting Attributes", () => {
    it("should set regular current attributes", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "strength": 15,
          "dexterity": 12,
        },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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
        .mockResolvedValueOnce(true) // success succeeds
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
        .mockResolvedValueOnce(true) // success1
        .mockRejectedValueOnce(new Error("Error 1")) // failure1
        .mockResolvedValueOnce(true) // success2
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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);

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
        .mockResolvedValueOnce(true) // attr1 succeeds
        .mockRejectedValueOnce(new Error("Cannot delete attr2")); // attr2 fails

      const result = await makeUpdate("delattr", results);

      expect(result.errors).toEqual([
        "Failed to delete attribute 'attr2' on target 'char1': Error: Cannot delete attr2",
      ]);
    });
  });

  describe("boolean return values and observers", () => {
    it("should record error and failed key when setAttribute returns false", async () => {
      mocklibSmartAttributes.setAttribute.mockResolvedValue(false);

      const result = await makeUpdate("setattr", { char1: { strength: 15 } });

      expect(result.errors).toEqual([
        "Failed to set attribute 'strength' on target 'char1'.",
      ]);
      expect(result.failed).toEqual(["char1:strength"]);
      expect(mockNotifyObservers).not.toHaveBeenCalled();
    });

    it("should record error and failed key when deleteAttribute returns false", async () => {
      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(false);

      const result = await makeUpdate("delattr", { char1: { strength: undefined } });

      expect(result.errors).toEqual([
        "Failed to delete attribute 'strength' on target 'char1'.",
      ]);
      expect(result.failed).toEqual(["char1:strength"]);
      expect(mockNotifyObservers).not.toHaveBeenCalled();
    });

    it("should notify observers on successful set with change event", async () => {
      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);
      const priorValues = { char1: { strength: 10 } };

      await makeUpdate("setattr", { char1: { strength: 15 } }, { priorValues, operation: "setattr" });

      expect(mockNotifyObservers).toHaveBeenCalledWith(
        "change",
        expect.objectContaining({ get: expect.any(Function) }),
        expect.objectContaining({
          _characterid: "char1",
          name: "strength",
          current: "10",
        }),
      );
      expect(mockNotifyObservers.mock.calls[0][1].get("current")).toBe("15");
    });

    it("should notify observers with add and change when prior value is undefined", async () => {
      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);
      vi.spyOn(global, "getSheetItem").mockImplementation(async (_charId, name) => {
        if (name === "user.NewAttr") {
          return "42";
        }
        return undefined;
      });
      const priorValues = { char1: {} };

      await makeUpdate("setattr", { char1: { NewAttr: 42 } }, { priorValues, operation: "setattr" });

      expect(mockNotifyObservers).toHaveBeenCalledTimes(2);
      expect(mockNotifyObservers).toHaveBeenNthCalledWith(
        1,
        "add",
        expect.objectContaining({ get: expect.any(Function) }),
      );
      expect(mockNotifyObservers.mock.calls[0][1].get("current")).toBe("42");
      expect(mockNotifyObservers).toHaveBeenNthCalledWith(
        2,
        "change",
        expect.objectContaining({ get: expect.any(Function) }),
        expect.objectContaining({
          name: "NewAttr",
          current: "",
          max: "",
        }),
      );
      expect(mockNotifyObservers.mock.calls[1][1].get("current")).toBe("42");
    });

    it("should notify observers with destroy event on successful delete", async () => {
      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);
      const priorValues = { char1: { strength: 10 } };

      await makeUpdate("delattr", { char1: { strength: undefined } }, { priorValues });

      expect(mockNotifyObservers).toHaveBeenCalledTimes(1);
      expect(mockNotifyObservers.mock.calls[0][0]).toBe("destroy");
      expect(mockNotifyObservers.mock.calls[0][1].get("current")).toBe("10");
      expect(mockNotifyObservers.mock.calls[0][1].get("name")).toBe("strength");
    });

    it("should include max on destroy when legacy attribute had max", async () => {
      const character = createObj("character", { _id: "char1", name: "Hero" });
      Object.assign(character, { sheetEnvironment: "legacy" });
      createObj("attribute", { _id: "attr1", _characterid: "char1", name: "hp", current: "10", max: "20" });
      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);
      const priorValues = { char1: { hp: 10 } };

      await makeUpdate("delattr", { char1: { hp: undefined } }, { priorValues });

      expect(mockNotifyObservers).toHaveBeenCalledTimes(1);
      expect(mockNotifyObservers.mock.calls[0][1].get("current")).toBe("10");
      expect(mockNotifyObservers.mock.calls[0][1].get("max")).toBe("20");
    });

    it("should notify destroy for userAttribute delete without max", async () => {
      vi.spyOn(global, "getSheetItem").mockImplementation(async (_charId, name, type) => {
        if (name === "user.UserOnlyAttr" && type === "current") {
          return "42";
        }
        return undefined;
      });
      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);
      const priorValues = { char1: { UserOnlyAttr: "42" } };

      await makeUpdate("delattr", {
        char1: { UserOnlyAttr: undefined, UserOnlyAttr_max: undefined },
      }, { priorValues });

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledTimes(1);
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "UserOnlyAttr", "current");
      expect(mockNotifyObservers).toHaveBeenCalledTimes(1);
      expect(mockNotifyObservers.mock.calls[0][0]).toBe("destroy");
      expect(mockNotifyObservers.mock.calls[0][1].get("current")).toBe("42");
      expect(mockNotifyObservers.mock.calls[0][1].toJSON()._type).toBe("userAttribute");
    });

    it("should notify destroy for userAttribute delete with max", async () => {
      vi.spyOn(global, "getSheetItem").mockImplementation(async (_charId, name, type) => {
        if (name === "user.UserAttrWithMax") {
          return type === "current" ? "42" : "100";
        }
        return undefined;
      });
      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);
      const priorValues = { char1: { UserAttrWithMax: "42", UserAttrWithMax_max: "100" } };

      await makeUpdate("delattr", {
        char1: { UserAttrWithMax: undefined, UserAttrWithMax_max: undefined },
      }, { priorValues });

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledTimes(1);
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "UserAttrWithMax", "current");
      expect(mockNotifyObservers).toHaveBeenCalledTimes(1);
      expect(mockNotifyObservers.mock.calls[0][0]).toBe("destroy");
      expect(mockNotifyObservers.mock.calls[0][1].get("current")).toBe("42");
      expect(mockNotifyObservers.mock.calls[0][1].get("max")).toBe("100");
      expect(mockNotifyObservers.mock.calls[0][1].toJSON()._type).toBe("userAttribute");
    });

    it("should group hp and hp_max into one change notification", async () => {
      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);
      const priorValues = { char1: { hp: 8, hp_max: 18 } };

      await makeUpdate("setattr", { char1: { hp: 10, hp_max: 20 } }, { priorValues, operation: "setattr" });

      expect(mockNotifyObservers).toHaveBeenCalledTimes(1);
      expect(mockNotifyObservers).toHaveBeenCalledWith(
        "change",
        expect.objectContaining({ get: expect.any(Function) }),
        expect.objectContaining({
          name: "hp",
          current: "8",
          max: "18",
        }),
      );
      expect(mockNotifyObservers.mock.calls[0][1].get("current")).toBe("10");
      expect(mockNotifyObservers.mock.calls[0][1].get("max")).toBe("20");
    });

    it("should not notify observers when setAttribute returns false", async () => {
      mocklibSmartAttributes.setAttribute.mockResolvedValue(false);
      const priorValues = { char1: { strength: 10 } };

      await makeUpdate("setattr", { char1: { strength: 15 } }, { priorValues, operation: "setattr" });

      expect(mockNotifyObservers).not.toHaveBeenCalled();
    });
  });

  describe("options handling", () => {
    it("should use default options when none provided", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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
      mockGetConfig.mockReturnValue({ useWorkers: true });

      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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
      mockGetConfig.mockReturnValue({ useWorkers: true });

      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
      };
      const options = { noCreate: true };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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
        .mockResolvedValueOnce(true) // success1
        .mockRejectedValueOnce(new Error("Error 1")) // failure1
        .mockResolvedValueOnce(true) // success2
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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);

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
      const priorValues = {
        char1: {
          hp_max: 25,
          mp_max: 15,
        },
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);

      await makeUpdate("delattr", results, { priorValues });

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

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);

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
        .mockResolvedValueOnce(true) // strength succeeds
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

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);

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
      const priorValues = {
        char1: {
          hp: 20,
          hp_max: 25,
          strength: 14,
          mp_max: 10,
        },
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);

      await makeUpdate("delattr", results, { priorValues });

      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledTimes(3);
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "hp", "current");
      expect(mocklibSmartAttributes.deleteAttribute).not.toHaveBeenCalledWith("char1", "hp", "max");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "strength", "current");
      expect(mocklibSmartAttributes.deleteAttribute).toHaveBeenCalledWith("char1", "mp", "max");
    });

    it("should handle delete errors for max-only attribute deletion", async () => {
      const results: Record<string, AttributeRecord> = {
        "char1": {
          "mp_max": 10,
        },
      };
      const priorValues = { char1: { mp_max: 10 } };

      mocklibSmartAttributes.deleteAttribute
        .mockRejectedValueOnce(new Error("Max deletion failed"));

      const result = await makeUpdate("delattr", results, { priorValues });

      expect(result.errors).toEqual([
        "Failed to delete attribute 'mp' on target 'char1': Error: Max deletion failed",
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
      const priorValues = {
        char1: {
          a_max: "value",
        },
      };

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);

      const result = await makeUpdate("delattr", results, { priorValues });

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

      mocklibSmartAttributes.deleteAttribute.mockResolvedValue(true);

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
      mockGetConfig.mockReturnValue({ useWorkers: true });

      const results: Record<string, AttributeRecord> = {
        "char1": { "strength": 15 },
      };

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

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

      mocklibSmartAttributes.setAttribute.mockResolvedValue(true);

      await makeUpdate("setattr", results);

      expect(mocklibSmartAttributes.setAttribute).toHaveBeenCalledWith(
        "char1",
        "strength",
        15,
        "current",
        { noCreate: false, setWithWorker: true }
      );
    });
  });
});
