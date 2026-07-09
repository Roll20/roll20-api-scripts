import { describe, it, expect, beforeEach, vi, type MockedFunction } from "vitest";
import {
  extractRepeatingParts,
  combineRepeatingParts,
  isRepeatingAttribute,
  hasCreateIdentifier,
  hasIndexIdentifier,
  convertRepOrderToArray,
  getIDFromIndex,
  getRepOrderForSection,
  extractRepeatingAttributes,
  getAllSectionNames,
  getAllRepOrders,
  processRepeatingAttributes,
  type RepeatingParts
} from "../../modules/repeating";
import type { Attribute } from "../../types";

describe("repeating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("extractRepeatingParts", () => {
    it("should extract parts from a valid repeating attribute", () => {
      const result = extractRepeatingParts("repeating_weapons_-abc123_name");
      expect(result).toEqual({
        section: "weapons",
        identifier: "-abc123",
        field: "name"
      });
    });

    it("should extract parts with underscore in field name", () => {
      const result = extractRepeatingParts("repeating_spells_-def456_spell_level");
      expect(result).toEqual({
        section: "spells",
        identifier: "-def456",
        field: "spell_level"
      });
    });

    it("should extract parts with CREATE identifier", () => {
      const result = extractRepeatingParts("repeating_inventory_CREATE_item_name");
      expect(result).toEqual({
        section: "inventory",
        identifier: "CREATE",
        field: "item_name"
      });
    });

    it("should extract parts with index identifier", () => {
      const result = extractRepeatingParts("repeating_attacks_$1_attack_name");
      expect(result).toEqual({
        section: "attacks",
        identifier: "$1",
        field: "attack_name"
      });
    });

    it("should return null for non-repeating attributes", () => {
      const result = extractRepeatingParts("strength");
      expect(result).toBeNull();
    });

    it("should return null for empty string", () => {
      const result = extractRepeatingParts("");
      expect(result).toBeNull();
    });

    it("should return null for empty parts", () => {
      const result = extractRepeatingParts("repeating_");
      expect(result).toBeNull();
    });
  });

  describe("combineRepeatingParts", () => {
    it("should combine parts into a valid repeating attribute name", () => {
      const parts: RepeatingParts = {
        section: "weapons",
        identifier: "-abc123",
        field: "name"
      };
      const result = combineRepeatingParts(parts);
      expect(result).toBe("repeating_weapons_-abc123_name");
    });

    it("should handle parts with underscores in field", () => {
      const parts: RepeatingParts = {
        section: "spells",
        identifier: "-def456",
        field: "spell_level"
      };
      const result = combineRepeatingParts(parts);
      expect(result).toBe("repeating_spells_-def456_spell_level");
    });

    it("should handle CREATE identifier", () => {
      const parts: RepeatingParts = {
        section: "inventory",
        identifier: "CREATE",
        field: "item_name"
      };
      const result = combineRepeatingParts(parts);
      expect(result).toBe("repeating_inventory_CREATE_item_name");
    });

    it("should error on empty parts", () => {
      const parts: RepeatingParts = {
        section: "",
        identifier: "",
        field: ""
      };
      expect(() => combineRepeatingParts(parts)).toThrowError();
    });
  });

  describe("isRepeatingAttribute", () => {
    it("should return true for valid repeating attributes", () => {
      expect(isRepeatingAttribute("repeating_weapons_-abc123_name")).toBe(true);
      expect(isRepeatingAttribute("repeating_spells_CREATE_spell_name")).toBe(true);
      expect(isRepeatingAttribute("repeating_attacks_$1_attack_bonus")).toBe(true);
    });

    it("should return false for non-repeating attributes", () => {
      expect(isRepeatingAttribute("strength")).toBe(false);
      expect(isRepeatingAttribute("dexterity")).toBe(false);
      expect(isRepeatingAttribute("hp")).toBe(false);
    });

    it("should return false for malformed repeating attributes", () => {
      expect(isRepeatingAttribute("repeating_only_two")).toBe(false);
      expect(isRepeatingAttribute("repeating_")).toBe(false);
      expect(isRepeatingAttribute("")).toBe(false);
    });

    it("should return true for attributes that start with repeating_ and have minimal structure", () => {
      expect(isRepeatingAttribute("repeating_a_b_c")).toBe(true);
    });
  });

  describe("hasCreateIdentifier", () => {
    it("should return true for CREATE identifier", () => {
      expect(hasCreateIdentifier("repeating_weapons_CREATE_name")).toBe(true);
    });

    it("should return false for non-CREATE identifiers", () => {
      expect(hasCreateIdentifier("repeating_weapons_-abc123_name")).toBe(false);
      expect(hasCreateIdentifier("repeating_attacks_$1_bonus")).toBe(false);
      expect(hasCreateIdentifier("repeating_spells_normal_id_name")).toBe(false);
    });
  });

  describe("hasIndexIdentifier", () => {
    it("should return true for valid index identifiers", () => {
      expect(hasIndexIdentifier("repeating_weapons_$1_name")).toBe(true);
      expect(hasIndexIdentifier("repeating_spells_$10_spell_name")).toBe(true);
      expect(hasIndexIdentifier("repeating_attacks_$999_bonus")).toBe(true);
    });

    it("should return false for non-index identifiers", () => {
      expect(hasIndexIdentifier("repeating_weapons_-abc123_name")).toBe(false);
      expect(hasIndexIdentifier("repeating_spells_CREATE_spell_name")).toBe(false);
      expect(hasIndexIdentifier("repeating_attacks_normal_id_bonus")).toBe(false);
    });

    it("should return false for invalid index formats", () => {
      expect(hasIndexIdentifier("repeating_weapons_$abc_name")).toBe(false);
      expect(hasIndexIdentifier("repeating_spells_1_spell_name")).toBe(false);
      expect(hasIndexIdentifier("repeating_attacks_$_bonus")).toBe(false);
      expect(hasIndexIdentifier("repeating_test_$$1_field")).toBe(false);
    });

    it("should return false for non-repeating attributes", () => {
      expect(hasIndexIdentifier("strength")).toBe(false);
      expect(hasIndexIdentifier("$1")).toBe(false);
    });

    it("should handle leading zeros in index", () => {
      expect(hasIndexIdentifier("repeating_test_$01_field")).toBe(true);
      expect(hasIndexIdentifier("repeating_test_$001_field")).toBe(true);
    });
  });

  describe("convertRepOrderToArray", () => {
    it("should convert comma-separated string to array", () => {
      const result = convertRepOrderToArray("-abc123,-def456,-ghi789");
      expect(result).toEqual(["-abc123", "-def456", "-ghi789"]);
    });

    it("should handle spaces around commas", () => {
      const result = convertRepOrderToArray("-abc123, -def456 , -ghi789");
      expect(result).toEqual(["-abc123", "-def456", "-ghi789"]);
    });

    it("should handle single item", () => {
      const result = convertRepOrderToArray("-abc123");
      expect(result).toEqual(["-abc123"]);
    });

    it("should handle empty string", () => {
      const result = convertRepOrderToArray("");
      expect(result).toEqual([""]);
    });

    it("should handle string with only commas", () => {
      const result = convertRepOrderToArray(",,");
      expect(result).toEqual(["", "", ""]);
    });

    it("should handle mixed spacing", () => {
      const result = convertRepOrderToArray("  -abc123  ,  -def456,  -ghi789  ");
      expect(result).toEqual(["-abc123", "-def456", "-ghi789"]);
    });
  });

  describe("getIDFromIndex", () => {
    const repOrder = ["-abc123", "-def456", "-ghi789"];

    it("should return row ID for valid index identifiers", () => {
      expect(getIDFromIndex("repeating_weapons_$1_name", repOrder)).toBe("-abc123");
      expect(getIDFromIndex("repeating_weapons_$2_name", repOrder)).toBe("-def456");
      expect(getIDFromIndex("repeating_weapons_$3_name", repOrder)).toBe("-ghi789");
    });

    it("should return null for index out of range", () => {
      expect(getIDFromIndex("repeating_weapons_$0_name", repOrder)).toBeNull();
      expect(getIDFromIndex("repeating_weapons_$4_name", repOrder)).toBeNull();
      expect(getIDFromIndex("repeating_weapons_$-1_name", repOrder)).toBeNull();
      expect(getIDFromIndex("repeating_weapons_$999_name", repOrder)).toBeNull();
    });

    it("should return null for non-index identifiers", () => {
      expect(getIDFromIndex("repeating_weapons_CREATE_name", repOrder)).toBeNull();
      expect(getIDFromIndex("repeating_weapons_-abc123_name", repOrder)).toBeNull();
    });

    it("should return null for non-repeating attributes", () => {
      expect(getIDFromIndex("strength", repOrder)).toBeNull();
    });

    it("should return null for invalid index format", () => {
      expect(getIDFromIndex("repeating_weapons_$abc_name", repOrder)).toBeNull();
      expect(getIDFromIndex("repeating_weapons_$_name", repOrder)).toBeNull();
    });

    it("should handle empty repOrder array", () => {
      expect(getIDFromIndex("repeating_weapons_$1_name", [])).toBeNull();
    });

    it("should handle leading zeros in index", () => {
      // Leading zeros should be parsed correctly (01 -> 1, 02 -> 2)
      expect(getIDFromIndex("repeating_weapons_$01_name", repOrder)).toBe("-abc123");
      expect(getIDFromIndex("repeating_weapons_$02_name", repOrder)).toBe("-def456");
    });
  });

  describe("getRepOrderForSection", () => {
    let mockGetAttribute: MockedFunction<typeof libSmartAttributes.getAttribute>;

    beforeEach(() => {
      mockGetAttribute = vi.fn();
      libSmartAttributes.getAttribute = mockGetAttribute;
    });

    it("should call libSmartAttributes.getAttribute with correct parameters", async () => {
      mockGetAttribute.mockResolvedValue("-abc123,-def456");

      await getRepOrderForSection("char123", "weapons");

      expect(mockGetAttribute).toHaveBeenCalledWith("char123", "_reporder_repeating_weapons");
    });

    it("should return the reporder value", async () => {
      const mockRepOrder = "-abc123,-def456,-ghi789";
      mockGetAttribute.mockResolvedValue(mockRepOrder);

      const result = await getRepOrderForSection("char123", "weapons");

      expect(result).toBe(mockRepOrder);
    });

    it("should return undefined when libSmartAttributes returns undefined", async () => {
      mockGetAttribute.mockResolvedValue(undefined);

      const result = await getRepOrderForSection("char123", "weapons");

      expect(result).toBeUndefined();
    });

    it("should handle different section names", async () => {
      mockGetAttribute.mockResolvedValue("-test123");

      await getRepOrderForSection("char456", "spells");

      expect(mockGetAttribute).toHaveBeenCalledWith("char456", "_reporder_repeating_spells");
    });
  });

  describe("extractRepeatingAttributes", () => {
    it("should filter only repeating attributes", () => {
      const attributes: Attribute[] = [
        { name: "strength", current: "18" },
        { name: "repeating_weapons_-abc123_name", current: "Sword" },
        { name: "dexterity", current: "14" },
        { name: "repeating_spells_CREATE_spell_name", current: "Fireball" },
        { name: "hp", current: "50" }
      ];

      const result = extractRepeatingAttributes(attributes);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("repeating_weapons_-abc123_name");
      expect(result[1].name).toBe("repeating_spells_CREATE_spell_name");
    });

    it("should return empty array when no repeating attributes", () => {
      const attributes: Attribute[] = [
        { name: "strength", current: "18" },
        { name: "dexterity", current: "14" },
        { name: "hp", current: "50" }
      ];

      const result = extractRepeatingAttributes(attributes);

      expect(result).toEqual([]);
    });

    it("should handle attributes without names", () => {
      const attributes: Attribute[] = [
        { name: "strength", current: "18" },
        { current: "14" }, // No name
        { name: "repeating_weapons_-abc123_name", current: "Sword" }
      ];

      const result = extractRepeatingAttributes(attributes);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("repeating_weapons_-abc123_name");
    });

    it("should handle empty array", () => {
      const result = extractRepeatingAttributes([]);
      expect(result).toEqual([]);
    });
  });

  describe("getAllSectionNames", () => {
    it("should extract unique section names from repeating attributes", () => {
      const attributes: Attribute[] = [
        { name: "repeating_weapons_-abc123_name", current: "Sword" },
        { name: "repeating_weapons_-def456_damage", current: "1d8" },
        { name: "repeating_spells_CREATE_spell_name", current: "Fireball" },
        { name: "repeating_inventory_$1_item", current: "Potion" },
        { name: "repeating_spells_-ghi789_level", current: "3" }
      ];

      const result = getAllSectionNames(attributes);

      expect(result).toHaveLength(3);
      expect(result).toContain("weapons");
      expect(result).toContain("spells");
      expect(result).toContain("inventory");
      expect(result.sort()).toEqual(["inventory", "spells", "weapons"]);
    });

    it("should return empty array for no repeating attributes", () => {
      const attributes: Attribute[] = [
        { name: "strength", current: "18" },
        { name: "dexterity", current: "14" }
      ];

      const result = getAllSectionNames(attributes);

      expect(result).toEqual([]);
    });

    it("should handle attributes without names", () => {
      const attributes: Attribute[] = [
        { name: "repeating_weapons_-abc123_name", current: "Sword" },
        { current: "14" }, // No name
        { name: "repeating_spells_CREATE_spell_name", current: "Fireball" }
      ];

      const result = getAllSectionNames(attributes);

      expect(result).toHaveLength(2);
      expect(result).toContain("weapons");
      expect(result).toContain("spells");
    });

    it("should handle empty array", () => {
      const result = getAllSectionNames([]);
      expect(result).toEqual([]);
    });

    it("should handle malformed repeating attributes gracefully", () => {
      const attributes: Attribute[] = [
        { name: "repeating_weapons_-abc123_name", current: "Sword" },
        { name: "repeating_invalid", current: "bad" },
        { name: "repeating_spells_CREATE_spell_name", current: "Fireball" }
      ];

      const result = getAllSectionNames(attributes);

      expect(result).toHaveLength(2);
      expect(result).toContain("weapons");
      expect(result).not.toContain("invalid"); // "repeating_invalid" has section "invalid"
      expect(result).toContain("spells");
    });
  });

  describe("getAllRepOrders", () => {
    let mockGetAttribute: MockedFunction<typeof libSmartAttributes.getAttribute>;

    beforeEach(() => {
      mockGetAttribute = vi.fn();
      libSmartAttributes.getAttribute = mockGetAttribute;
    });

    it("should get reporders for all sections", async () => {
      mockGetAttribute
        .mockResolvedValueOnce("-abc123,-def456") // weapons
        .mockResolvedValueOnce("-ghi789,-jkl101"); // spells

      const result = await getAllRepOrders("char123", ["weapons", "spells"]);

      expect(mockGetAttribute).toHaveBeenCalledWith("char123", "_reporder_repeating_weapons");
      expect(mockGetAttribute).toHaveBeenCalledWith("char123", "_reporder_repeating_spells");
      expect(result).toEqual({
        weapons: ["-abc123", "-def456"],
        spells: ["-ghi789", "-jkl101"]
      });
    });

    it("should handle sections with no reporder", async () => {
      mockGetAttribute
        .mockResolvedValueOnce("-abc123,-def456") // weapons
        .mockResolvedValueOnce(undefined); // spells - no reporder

      const result = await getAllRepOrders("char123", ["weapons", "spells"]);

      expect(result).toEqual({
        weapons: ["-abc123", "-def456"],
        spells: []
      });
    });

    it("should handle empty section names array", async () => {
      const result = await getAllRepOrders("char123", []);

      expect(result).toEqual({});
      expect(mockGetAttribute).not.toHaveBeenCalled();
    });

    it("should handle single section", async () => {
      mockGetAttribute.mockResolvedValue("-abc123");

      const result = await getAllRepOrders("char123", ["weapons"]);

      expect(result).toEqual({
        weapons: ["-abc123"]
      });
    });
  });

  describe("processRepeatingAttributes", () => {
    let mockGetAttribute: MockedFunction<typeof libSmartAttributes.getAttribute>;

    beforeEach(() => {
      mockGetAttribute = vi.fn();
      libSmartAttributes.getAttribute = mockGetAttribute;
      vi.stubGlobal("libUUID", {
        generateRowID: vi.fn().mockReturnValue("-new123")
      });
    });

    it("should process normal repeating attributes unchanged", async () => {
      const attributes: Attribute[] = [
        { name: "repeating_weapons_-abc123_name", current: "Sword" },
        { name: "strength", current: "18" } // Non-repeating
      ];

      mockGetAttribute.mockResolvedValue("-abc123,-def456");

      const result = await processRepeatingAttributes("char123", attributes);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "repeating_weapons_-abc123_name",
        current: "Sword"
      });
    });

    it("should process CREATE identifiers by generating new IDs", async () => {
      const attributes: Attribute[] = [
        { name: "repeating_weapons_CREATE_name", current: "New Sword" }
      ];

      mockGetAttribute.mockResolvedValue("-abc123,-def456");

      const result = await processRepeatingAttributes("char123", attributes);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "repeating_weapons_-new123_name",
        current: "New Sword"
      });
      expect(libUUID.generateRowID).toHaveBeenCalled();
    });

    it("should process index identifiers correctly", async () => {
      const attributes: Attribute[] = [
        { name: "repeating_weapons_$1_name", current: "First Weapon" },
        { name: "repeating_weapons_$2_damage", current: "1d8" }
      ];

      mockGetAttribute.mockResolvedValue("-abc123,-def456");

      const result = await processRepeatingAttributes("char123", attributes);

      // Should resolve $1 -> -abc123 and $2 -> -def456
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: "repeating_weapons_-abc123_name",
        current: "First Weapon"
      });
      expect(result[1]).toEqual({
        name: "repeating_weapons_-def456_damage",
        current: "1d8"
      });
    });

    it("should skip attributes with invalid index identifiers", async () => {
      const attributes: Attribute[] = [
        { name: "repeating_weapons_$1_name", current: "First Weapon" },
        { name: "repeating_weapons_$5_name", current: "Invalid Index" } // Index out of range
      ];

      mockGetAttribute.mockResolvedValue("-abc123,-def456");

      const result = await processRepeatingAttributes("char123", attributes);

      // $1 should work, $5 should be skipped (out of range)
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "repeating_weapons_-abc123_name",
        current: "First Weapon"
      });
    });

    it("should handle mixed attribute types", async () => {
      const attributes: Attribute[] = [
        { name: "repeating_weapons_-abc123_name", current: "Existing Sword" },
        { name: "repeating_weapons_CREATE_name", current: "New Sword" },
        { name: "repeating_weapons_$1_damage", current: "1d8" },
        { name: "repeating_spells_CREATE_spell", current: "New Spell" }
      ];

      mockGetAttribute
        .mockResolvedValueOnce("-abc123,-def456") // weapons
        .mockResolvedValueOnce("-ghi789"); // spells

      const result = await processRepeatingAttributes("char123", attributes);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        name: "repeating_weapons_-abc123_name",
        current: "Existing Sword"
      });
      expect(result[1]).toEqual({
        name: "repeating_weapons_-new123_name",
        current: "New Sword"
      });
      expect(result[2]).toEqual({
        name: "repeating_weapons_-abc123_damage",
        current: "1d8"
      });
      expect(result[3]).toEqual({
        name: "repeating_spells_-new123_spell",
        current: "New Spell"
      });
    });

    it("should handle attributes without names", async () => {
      const attributes: Attribute[] = [
        { name: "repeating_weapons_CREATE_name", current: "New Sword" },
        { current: "No name" } // No name property
      ];

      mockGetAttribute.mockResolvedValue("-abc123");

      const result = await processRepeatingAttributes("char123", attributes);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "repeating_weapons_-new123_name",
        current: "New Sword"
      });
    });

    it("should handle malformed repeating attributes", async () => {
      const attributes: Attribute[] = [
        { name: "repeating_weapons_CREATE_name", current: "Valid" },
        { name: "repeating_invalid", current: "Invalid" } // Malformed but valid structure
      ];

      mockGetAttribute.mockResolvedValue("-abc123");

      const result = await processRepeatingAttributes("char123", attributes);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "repeating_weapons_-new123_name",
        current: "Valid"
      });
    });

    it("should handle empty attributes array", async () => {
      const result = await processRepeatingAttributes("char123", []);

      expect(result).toEqual([]);
      expect(mockGetAttribute).not.toHaveBeenCalled();
    });
  });
});
