import { it, expect, describe, beforeEach, afterEach, vi } from "vitest";
import { AttrProcessor } from "../../src/classes/AttrProcessor";

describe("AttrProcessor", () => {
  beforeEach(() => {
    // Set up test environment
    global.setupTestEnvironment();
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with default options", () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const delta = { strength: { value: "15" } };

      // Act
      const processor = new AttrProcessor(character, delta);

      // Assert
      expect(processor.character).toBe(character);
      expect(processor.delta).toEqual(delta);
      expect(processor.eval).toBe(false);
      expect(processor.parse).toBe(true);
      expect(processor.constrain).toBe(false);
    });

    it("should initialize with custom options", () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const delta = { strength: { value: "15" } };
      const options = { useEval: true, useParse: false, useConstrain: true };

      // Act
      const processor = new AttrProcessor(character, delta, options);

      // Assert
      expect(processor.character).toBe(character);
      expect(processor.delta).toEqual(delta);
      expect(processor.eval).toBe(true);
      expect(processor.parse).toBe(false);
      expect(processor.constrain).toBe(true);
    });
  });

  describe("init", () => {
    it("should initialize attributes and return processed delta", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      createObj("attribute", {
        _characterid: character.id,
        name: "strength",
        current: "10"
      });
      const delta = { strength: { value: "15" } };
      const processor = new AttrProcessor(character, delta);

      // Act
      const result = await processor.init();

      // Assert
      expect(processor.attributes).toHaveLength(1);
      expect(processor.attributes[0].get("name")).toBe("strength");
      expect(result).toEqual(delta);
    });
  });

  describe("parseAttributes", () => {
    it("should process simple attribute values", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const delta = {
        strength: { value: "15" },
        dexterity: { value: "12", max: "18" }
      };
      const processor = new AttrProcessor(character, delta);

      // Act
      await processor.init();

      // Assert
      expect(processor.delta).toEqual({
        strength: { value: "15" },
        dexterity: { value: "12", max: "18" }
      });
    });

    it("should parse referenced attributes when useParse is true", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      createObj("attribute", {
        _characterid: character.id,
        name: "strength",
        current: "10"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: "dexterity",
        current: "12",
        max: "18"
      });
      const delta = {
        new_str: { value: "%strength%" },
        new_dex: { value: "%dexterity%", max: "%dexterity_max%" }
      };
      const processor = new AttrProcessor(character, delta, { useParse: true });

      // Act
      const result = await processor.init();

      // Assert
      expect(result.new_str.value).toBe("10");
      expect(result.new_dex.value).toBe("12");
      expect(result.new_dex.max).toBe("18");
    });

    it("should evaluate expressions when useEval is true", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const delta = {
        strength: { value: "10 + 5" },
        dexterity: { value: "8 * 2", max: "20 - 2" }
      };
      const processor = new AttrProcessor(character, delta, { useEval: true });

      // Act
      const result = await processor.init();

      // Assert
      expect(result.strength.value).toBe("15");
      expect(result.dexterity.value).toBe("16");
      expect(result.dexterity.max).toBe("18");
    });

    it("should modify values when useModify is true", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      createObj("attribute", {
        _characterid: character.id,
        name: "strength",
        current: "10"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: "dexterity",
        current: "10"
      });
      const delta = {
        strength: { value: "5" },
        dexterity: { value: "-3" }
      };
      const processor = new AttrProcessor(character, delta, { useModify: true });
      // Act
      const result = await processor.init();
      // Assert
      expect(result.strength.value).toBe("15");
      expect(result.dexterity.value).toBe("7");
    });

    it("should constrain values when useConstrain is true", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      createObj("attribute", {
        _characterid: character.id,
        name: "health",
        current: "10",
        max: "10"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: "mana",
        current: "3",
        max: "20"
      });
      const delta = {
        health: { value: "5" },
        mana: { value: "-5" },
      };
      const processor = new AttrProcessor(character, delta, { useConstrain: true });

      // Act
      const result = await processor.init();

      // Assert
      expect(result.health.value).toBe("10"); // Constrained to max
      expect(result.mana.value).toBe("0"); // Constrained to lower bound 0
    });

    it("should combine parse and eval when both are enabled", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      createObj("attribute", {
        _characterid: character.id,
        name: "base_str",
        current: "10"
      });
      const delta = {
        strength: { value: "%base_str% + 5" }
      };
      const processor = new AttrProcessor(character, delta, { useParse: true, useEval: true });

      // Act
      const result = await processor.init();

      // Assert
      expect(result.strength.value).toBe("15");
    });

    it("should modify both current and max values when useModify is true", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      createObj("attribute", {
        _characterid: character.id,
        name: "health",
        current: "10",
        max: "20"
      });
      const delta = {
        health: { value: "5", max: "10" }
      };
      const processor = new AttrProcessor(character, delta, { useModify: true });

      // Act
      const result = await processor.init();

      // Assert
      expect(result.health.value).toBe("15");
      expect(result.health.max).toBe("30");
    });
  });

  describe("repeating sections", () => {
    it("should handle repeating section attributes", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const rowId = "row1";
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${rowId}_skillname`,
        current: "Stealth"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${rowId}_skillvalue`,
        current: "5"
      });

      // Use existing repeating ID
      const delta = {
        [`repeating_skills_${rowId}_skillbonus`]: { value: "3" }
      };
      const processor = new AttrProcessor(character, delta);

      // Act
      const result = await processor.init();

      // Assert
      expect(result[`repeating_skills_${rowId}_skillbonus`]).toEqual({
        value: "3",
      });

      // Verify repeatingData was populated correctly
      expect(processor.repeating.repeatingData).toHaveProperty("skills");
      expect(processor.repeating.repeatingData.skills).toHaveProperty(rowId);
    });

    it("should create new row when -CREATE is used", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const delta = {
        "repeating_skills_-CREATE_skillname": { value: "Acrobatics" },
        "repeating_skills_-CREATE_skillvalue": { value: "4" }
      };
      const processor = new AttrProcessor(character, delta);

      // Act
      const result = await processor.init();

      // Assert
      // Check that a new row ID was generated
      const keys = Object.keys(result);
      expect(keys.length).toBe(2);

      // Both should have the same new row ID replacing -CREATE
      const rowIdMatch = keys[0].match(/repeating_skills_([^_]+)_skillname/);
      expect(rowIdMatch).toBeTruthy();

      const newRowId = rowIdMatch?.[1];
      expect(newRowId).toBeTruthy();
      expect(newRowId).not.toBe("-CREATE");

      // Both attributes should use the same row ID
      expect(keys[0]).toBe(`repeating_skills_${newRowId}_skillname`);
      expect(keys[1]).toBe(`repeating_skills_${newRowId}_skillvalue`);
    });
  });

  describe("handling repeating orders", () => {
    it("should process repeating orders correctly", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const row1 = "row1";
      const row2 = "row2";

      // Create reporder attribute
      createObj("attribute", {
        _characterid: character.id,
        name: `_reporder_skills`,
        current: `${row1},${row2}`
      });

      // Create some repeating attributes
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${row1}_skillname`,
        current: "Stealth"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${row2}_skillname`,
        current: "Perception"
      });

      const delta = { strength: { value: "15" } }; // Non-repeating delta for simplicity
      const processor = new AttrProcessor(character, delta);

      // Act
      await processor.init();

      // Assert
      expect(processor.repeating.repeatingOrders).toHaveProperty("skills");
      expect(processor.repeating.repeatingOrders.skills).toContain(row1);
      expect(processor.repeating.repeatingOrders.skills).toContain(row2);
      expect(processor.repeating.repeatingOrders.skills.indexOf(row1))
        .toBeLessThan(processor.repeating.repeatingOrders.skills.indexOf(row2));
    });

    it("should handle row number references", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const row1 = "row1";
      const row2 = "row2";

      // Create reporder attribute
      createObj("attribute", {
        _characterid: character.id,
        name: `_reporder_skills`,
        current: `${row1},${row2}`
      });

      // Create some repeating attributes
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${row1}_skillname`,
        current: "Stealth"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${row2}_skillname`,
        current: "Perception"
      });

      const delta = {
        "repeating_skills_$0_skillbonus": { value: "3" },
        "repeating_skills_$1_skillbonus": { value: "2" }
      };
      const processor = new AttrProcessor(character, delta);

      // Act
      const result = await processor.init();

      // Assert
      expect(result).toHaveProperty(`repeating_skills_${row1}_skillbonus`);
      expect(result).toHaveProperty(`repeating_skills_${row2}_skillbonus`);
      expect(result[`repeating_skills_${row1}_skillbonus`].value).toBe("3");
      expect(result[`repeating_skills_${row2}_skillbonus`].value).toBe("2");
    });

    it("should handle mixed ordered and unordered repeating rows", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const row1 = "row1";
      const row2 = "row2";
      const row3 = "row3";
      const row4 = "row4";

      // Create reporder attribute with only some of the rows
      createObj("attribute", {
        _characterid: character.id,
        name: `_reporder_skills`,
        current: `${row1},${row3}` // Only includes row1 and row3
      });

      // Create repeating attributes for all rows (including unordered ones)
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${row1}_skillname`,
        current: "Stealth"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${row2}_skillname`, // Not in the order
        current: "Acrobatics"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${row3}_skillname`,
        current: "Perception"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${row4}_skillname`, // Not in the order
        current: "Athletics"
      });

      const delta = {
        // Reference all rows by index
        "repeating_skills_$0_skillbonus": { value: "3" },
        "repeating_skills_$1_skillbonus": { value: "4" },
        "repeating_skills_$2_skillbonus": { value: "5" },
        "repeating_skills_$3_skillbonus": { value: "6" }
      };
      const processor = new AttrProcessor(character, delta);

      // Act
      const result = await processor.init();

      // Assert
      // The processor should have built a complete order with all rows
      expect(processor.repeating.repeatingOrders).toHaveProperty("skills");
      expect(processor.repeating.repeatingOrders.skills).toHaveLength(4);

      // The order should maintain the original order from reporder for the first items
      expect(processor.repeating.repeatingOrders.skills[0]).toBe(row1);
      expect(processor.repeating.repeatingOrders.skills[1]).toBe(row3);

      // The unordered rows should be included (though the exact order isn't specified)
      expect(processor.repeating.repeatingOrders.skills).toContain(row2);
      expect(processor.repeating.repeatingOrders.skills).toContain(row4);

      // Verify the row references are resolved correctly
      expect(result).toHaveProperty(`repeating_skills_${row1}_skillbonus`);
      expect(result).toHaveProperty(`repeating_skills_${row3}_skillbonus`);
      expect(result[`repeating_skills_${row1}_skillbonus`].value).toBe("3");
      expect(result[`repeating_skills_${row3}_skillbonus`].value).toBe("4");

      // Check if the other rows also got their skill bonuses
      // We don't know the exact order of the unordered rows, but we can confirm they exist
      const unorderedRows = [row2, row4];
      const unorderedValues = ["5", "6"];

      for (const row of unorderedRows) {
        expect(result).toHaveProperty(`repeating_skills_${row}_skillbonus`);
        expect(unorderedValues).toContain(result[`repeating_skills_${row}_skillbonus`].value);
      }
    });

    it("should handle references using both direct IDs and row indices", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const row1 = "row1";
      const row2 = "row2";

      // Create reporder attribute
      createObj("attribute", {
        _characterid: character.id,
        name: `_reporder_skills`,
        current: `${row1},${row2}`
      });

      // Create repeating attributes
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${row1}_skillname`,
        current: "Stealth"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${row1}_skillvalue`,
        current: "10"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${row2}_skillname`,
        current: "Perception"
      });

      const delta = {
        // Mix of direct ID and row index references
        [`repeating_skills_${row1}_skillbonus`]: { value: "3" },
        "repeating_skills_$1_skillbonus": { value: "4" },
      };
      const processor = new AttrProcessor(character, delta, { useParse: true });

      // Act
      const result = await processor.init();

      // Assert
      // Direct ID reference works
      expect(result[`repeating_skills_${row1}_skillbonus`].value).toBe("3");

      // Row index reference works
      expect(result[`repeating_skills_${row2}_skillbonus`].value).toBe("4");
    });
  });

  describe("error handling", () => {
    it("should handle evaluation errors gracefully", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const delta = {
        strength: { value: "10 + 5" },
        invalid: { value: "this is not valid math" }
      };
      const processor = new AttrProcessor(character, delta, { useEval: true });

      // Act
      const result = await processor.init();

      // Assert
      expect(result.strength.value).toBe("15");
      expect(result.invalid.value).toBe("this is not valid math");
    });

    it("should handle missing references gracefully", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const delta = {
        new_str: { value: "%nonexistent%" }
      };
      const processor = new AttrProcessor(character, delta, { useParse: true });

      // Act
      const result = await processor.init();

      // Assert
      expect(result.new_str.value).toBe("%nonexistent%");
    });
  });

  describe("complex integration scenarios", () => {
    it("should handle complex operations with repeating sections, references, and evaluation", async () => {
      // Arrange
      const character = createObj("character", { id: "char1", name: "TestChar" });
      const rowId = "row1";

      // Create base attributes
      createObj("attribute", {
        _characterid: character.id,
        name: "base_bonus",
        current: "5"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: "multiplier",
        current: "2"
      });

      // Create existing repeating row
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${rowId}_skillname`,
        current: "Stealth"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: `repeating_skills_${rowId}_skillbonus`,
        current: "3"
      });

      // Create reporder attribute
      createObj("attribute", {
        _characterid: character.id,
        name: `_reporder_skills`,
        current: `${rowId}`
      });

      // Complex delta that:
      // 1. References existing attributes with %attr%
      // 2. Uses evaluation with math expressions
      // 3. Uses row references with $0
      // 4. Creates new rows with -CREATE
      const delta = {
        // Modify existing row with reference and evaluation
        [`repeating_skills_$0_total`]: {
          value: "%base_bonus% + %repeating_skills_$0_skillbonus% * %multiplier%"
        },

        // Create a new row with evaluated values
        "repeating_skills_-CREATE_skillname": { value: "Perception" },
        "repeating_skills_-CREATE_skillbonus": { value: "2 + 2" },
        "repeating_skills_-CREATE_total": { value: "%base_bonus% * 3" }
      };

      const processor = new AttrProcessor(character, delta, {
        useParse: true,
        useEval: true
      });

      // Act
      const result = await processor.init();

      // Assert
      // Check the modification to the existing row - should be 5 + 3 * 2 = 11
      expect(result[`repeating_skills_${rowId}_total`].value).toBe("11");

      // Check that the new row was created with consistent ID
      const newRowKeys = Object.keys(result).filter(key =>
        key.includes("repeating_skills_") && !key.includes(rowId));

      expect(newRowKeys.length).toBe(3); // Should have 3 attributes in new row

      // Extract the new row ID
      const newRowMatch = newRowKeys[0].match(/repeating_skills_([^_]+)_/);
      const newRowId = newRowMatch![1];

      // Verify all new attributes use the same row ID
      expect(newRowKeys.every(key => key.includes(newRowId))).toBe(true);

      // Check the evaluated values in the new row
      expect(result[`repeating_skills_${newRowId}_skillname`].value).toBe("Perception");
      expect(result[`repeating_skills_${newRowId}_skillbonus`].value).toBe("4"); // 2+2=4
      expect(result[`repeating_skills_${newRowId}_total`].value).toBe("15"); // 5*3=15

      // Check that the processor correctly organized repeating data
      expect(processor.repeating.repeatingData).toHaveProperty("skills");
      expect(processor.repeating.repeatingData.skills).toHaveProperty(rowId);

      // Check that the processor correctly processed repeating orders
      expect(processor.repeating.repeatingOrders).toHaveProperty("skills");
      expect(processor.repeating.repeatingOrders.skills).toContain(rowId);
    });
  });
});
