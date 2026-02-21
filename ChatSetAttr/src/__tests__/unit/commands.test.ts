import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Attribute } from "../../types";
import {
  setattr,
  modattr,
  modbattr,
  resetattr,
  delattr,
  handlers,
} from "../../modules/commands";
import { getAttributes } from "../../modules/attributes";

// Mock the attributes module
vi.mock("../../modules/attributes", () => ({
  getAttributes: vi.fn(),
}));

const mockGetAttributes = vi.mocked(getAttributes);

const feedbackMock = { public: false };

describe("commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("setattr", () => {
    it("should set current values for attributes", async () => {
      const changes: Attribute[] = [
        { name: "strength", current: 15 },
        { name: "dexterity", current: 12 },
      ];

      const result = await setattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        strength: 15,
        dexterity: 12,
      });
      expect(result.messages).toEqual([
        "Set attribute 'strength' on ID: char1.",
        "Set attribute 'dexterity' on ID: char1.",
      ]);
      expect(result.errors).toEqual([]);
    });

    it("should set max values for attributes", async () => {
      const changes: Attribute[] = [
        { name: "hp", max: 25 },
        { name: "mp", max: 15 },
      ];

      const result = await setattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp_max: 25,
        mp_max: 15,
      });
      expect(result.messages).toEqual([
        "Set attribute 'hp' on ID: char1.",
        "Set attribute 'mp' on ID: char1.",
      ]);
      expect(result.errors).toEqual([]);
    });

    it("should set both current and max values", async () => {
      const changes: Attribute[] = [
        { name: "hp", current: 20, max: 25 },
      ];

      const result = await setattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp: 20,
        hp_max: 25,
      });
    });

    it("should skip attributes without names", async () => {
      const changes: Attribute[] = [
        { current: 15 }, // no name
        { name: "strength", current: 16 },
      ];

      const result = await setattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        strength: 16,
      });
    });

    it("should handle string and boolean values", async () => {
      const changes: Attribute[] = [
        { name: "name", current: "Gandalf" },
        { name: "active", current: true },
      ];

      const result = await setattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        name: "Gandalf",
        active: true,
      });
    });
  });

  describe("modattr", () => {
    beforeEach(() => {
      mockGetAttributes.mockResolvedValue({
        strength: 10,
        hp: 15,
        hp_max: 20,
      });
    });

    it("should modify current values with addition", async () => {
      const changes: Attribute[] = [
        { name: "strength", current: "+5" },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        strength: 15,
      });
    });

    it("should modify current values with subtraction", async () => {
      const changes: Attribute[] = [
        { name: "hp", current: "-3" },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp: 12,
      });
    });

    it("should modify current values with multiplication", async () => {
      const changes: Attribute[] = [
        { name: "strength", current: "*2" },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        strength: 20,
      });
    });

    it("should modify current values with division", async () => {
      const changes: Attribute[] = [
        { name: "hp", current: "/3" },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp: 5,
      });
    });

    it("should handle division by zero safely", async () => {
      const changes: Attribute[] = [
        { name: "hp", current: "/0" },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp: 15, // original value unchanged
      });
    });

    it("should modify max values", async () => {
      const changes: Attribute[] = [
        { name: "hp", max: "+5" },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp_max: 25,
      });
    });

    it("should handle absolute values (no operator)", async () => {
      const changes: Attribute[] = [
        { name: "strength", current: 18 },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        strength: 28, // 10 + 18 (treated as addition)
      });
    });

    it("should handle undefined base values", async () => {
      mockGetAttributes.mockResolvedValue({});

      const changes: Attribute[] = [
        { name: "newattr", current: "+5" },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        newattr: 5,
      });
    });

    it("should skip attributes without names", async () => {
      const changes: Attribute[] = [
        { current: "+5" }, // no name
        { name: "strength", current: "+2" },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        strength: 12,
      });
    });
  });

  describe("modbattr", () => {
    beforeEach(() => {
      mockGetAttributes.mockResolvedValue({
        hp: 15,
        hp_max: 20,
        mp: 8,
        mp_max: 10,
      });
    });

    it("should modify current value and enforce bounds", async () => {
      const changes: Attribute[] = [
        { name: "hp", current: "+10" }, // current goes to 25, max stays 20
      ];

      const result = await modbattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp: 20,
      });
    });

    it("should modify max value and adjust current if needed", async () => {
      const changes: Attribute[] = [
        { name: "hp", max: "-5" }, // max becomes 15, current is 15
      ];

      const result = await modbattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp_max: 15,
        hp: 15, // current bounded by new max
      });
    });

    it("should modify both current and max values", async () => {
      const changes: Attribute[] = [
        { name: "mp", current: "+5", max: "+5" }, // current: 13, max: 15
      ];

      const result = await modbattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        mp: 13,
        mp_max: 15,
      });
    });

    it("should handle case where current exceeds new max", async () => {
      const changes: Attribute[] = [
        { name: "hp", max: "-10" }, // max becomes 10, current is 15
      ];

      const result = await modbattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp_max: 10,
        hp: 10, // current reduced to new max
      });
    });

    it("should handle undefined max values gracefully", async () => {
      mockGetAttributes.mockResolvedValue({
        newattr: 5,
      });

      const changes: Attribute[] = [
        { name: "newattr", current: "+3" },
      ];

      const result = await modbattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        newattr: 8, // no max constraint
      });
    });

    it("should skip attributes without names", async () => {
      const changes: Attribute[] = [
        { current: "+5", max: "+5" }, // no name
        { name: "hp", current: "+1" },
      ];

      const result = await modbattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp: 16,
      });
    });
  });

  describe("resetattr", () => {
    beforeEach(() => {
      mockGetAttributes.mockResolvedValue({
        hp: 10,
        hp_max: 25,
        mp: 5,
        mp_max: 15,
        strength: 12, // no max value
      });
    });

    it("should reset current to max value", async () => {
      const changes: Attribute[] = [
        { name: "hp" },
        { name: "mp" },
      ];

      const result = await resetattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp: 25,
        mp: 15,
      });
    });

    it("should reset to 0 when no max value exists", async () => {
      const changes: Attribute[] = [
        { name: "strength" },
      ];

      const result = await resetattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        strength: 0,
      });
    });

    it("should skip attributes without names", async () => {
      const changes: Attribute[] = [
        {}, // no name
        { name: "hp" },
      ];

      const result = await resetattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp: 25,
      });
    });

    it("should handle mixed scenarios", async () => {
      const changes: Attribute[] = [
        { name: "hp" },    // has max
        { name: "strength" }, // no max
      ];

      const result = await resetattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp: 25,
        strength: 0,
      });
    });
  });

  describe("delattr", () => {
    it("should mark attributes for deletion", async () => {
      const changes: Attribute[] = [
        { name: "oldattr" },
        { name: "tempattr" },
      ];

      const result = await delattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        oldattr: undefined,
        oldattr_max: undefined,
        tempattr: undefined,
        tempattr_max: undefined,
      });
      expect(result.messages).toEqual([
        "Deleted attribute 'oldattr' on ID: char1.",
        "Deleted attribute 'tempattr' on ID: char1.",
      ]);
      expect(result.errors).toEqual([]);
    });

    it("should skip attributes without names", async () => {
      const changes: Attribute[] = [
        {}, // no name
        { name: "validattr" },
      ];

      const result = await delattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        validattr: undefined,
        validattr_max: undefined,
      });
    });

    it("should handle empty changes array", async () => {
      const changes: Attribute[] = [];

      const result = await delattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({});
      expect(result.messages).toEqual([]);
      expect(result.errors).toEqual([]);
    });
  });

  describe("handlers dictionary", () => {
    it("should contain all command handlers", () => {
      expect(handlers).toHaveProperty("setattr", setattr);
      expect(handlers).toHaveProperty("modattr", modattr);
      expect(handlers).toHaveProperty("modbattr", modbattr);
      expect(handlers).toHaveProperty("resetattr", resetattr);
      expect(handlers).toHaveProperty("delattr", delattr);
    });

    it("should have correct handler signatures", () => {
      expect(typeof handlers.setattr).toBe("function");
      expect(typeof handlers.modattr).toBe("function");
      expect(typeof handlers.modbattr).toBe("function");
      expect(typeof handlers.resetattr).toBe("function");
      expect(typeof handlers.delattr).toBe("function");
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle NaN values in modifications", async () => {
      mockGetAttributes.mockResolvedValue({
        attr: "not-a-number",
      });

      const changes: Attribute[] = [
        { name: "attr", current: "+invalid" },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.errors).toContain("Attribute 'attr' is not number-valued and so cannot be modified.");
    });

    it("should handle very large numbers", async () => {
      mockGetAttributes.mockResolvedValue({
        bignum: 1000000,
      });

      const changes: Attribute[] = [
        { name: "bignum", current: "*1000" },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        bignum: 1000000000,
      });
    });

    it("should handle negative results in bounded attributes", async () => {
      mockGetAttributes.mockResolvedValue({
        resource: 5,
        resource_max: 10,
      });

      const changes: Attribute[] = [
        { name: "resource", current: "-20" }, // would go to -15
      ];

      const result = await modbattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        resource: 0,
      });
    });
  });

  describe("integration scenarios", () => {
    beforeEach(() => {
      mockGetAttributes.mockResolvedValue({
        hp: 15,
        hp_max: 20,
        mp: 8,
        mp_max: 10,
        strength: 14,
        dexterity: 12,
      });
    });

    it("should handle multiple attributes in a single command", async () => {
      const changes: Attribute[] = [
        { name: "hp", current: "+5" },
        { name: "mp", current: "-2" },
        { name: "strength", current: "*1.5" },
      ];

      const result = await modattr(changes, "char1", [], false, feedbackMock);

      expect(result.result).toEqual({
        hp: 20,
        mp: 6,
        strength: 21, // 14 * 1.5 = 21
      });
    });

    it("should handle attribute queries with referenced attributes", async () => {
      mockGetAttributes.mockImplementation((target, attributeNames) => {
        const allAttrs = {
          hp: 15,
          hp_max: 20,
          mp: 8,
          mp_max: 10,
          strength: 14,
          referenced_attr: 5,
        };

        const result: Record<string, string | number | boolean | undefined> = {};
        if (Array.isArray(attributeNames)) {
          for (const name of attributeNames) {
            result[name] = allAttrs[name as keyof typeof allAttrs];
          }
        }
        return Promise.resolve(result);
      });

      const changes: Attribute[] = [
        { name: "hp", current: "+2" },
      ];

      const result = await modattr(changes, "char1", ["referenced_attr"], false, feedbackMock);

      expect(mockGetAttributes).toHaveBeenCalledWith("char1", expect.arrayContaining(["referenced_attr", "hp"]));
      expect(result.result).toEqual({
        hp: 17,
      });
    });
  });
});
