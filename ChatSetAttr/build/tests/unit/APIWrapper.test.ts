import { it, expect, describe, beforeEach, afterEach, vi } from "vitest"
import { APIWrapper, type DeltasObject } from "../../src/classes/APIWrapper";

describe("APIWrapper", () => {
  beforeEach(() => {
    global.setupTestEnvironment();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getAttributes", () => {
    it("should return an empty object if the character does not exist", async () => {
      // Arrange
      const nonexistentCharacter = null as unknown as Roll20Character;
      const attributeList = ["strength", "dexterity"];

      // Act
      const result = await APIWrapper.getAttributes(nonexistentCharacter, attributeList);

      // Assert
      expect(result).toEqual({});
    });

    it("should return an empty object if the character has no attributes", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });
      const attributeList = ["strength", "dexterity"];

      // Act
      const result = await APIWrapper.getAttributes(character, attributeList);

      // Assert
      expect(result).toEqual({});
    });

    it("should return the attributes of the character", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });

      createObj("attribute", {
        name: "strength",
        current: "10",
        max: "20",
        _characterid: character.id,
      });

      createObj("attribute", {
        name: "dexterity",
        current: "15",
        max: "25",
        _characterid: character.id,
      });
      const attributeList = ["strength", "dexterity"];

      // Act
      const result = await APIWrapper.getAttributes(character, attributeList);

      // Assert
      expect(result).toEqual({
        strength: { value: "10", max: "20" },
        dexterity: { value: "15", max: "25" },
      });
    });

    it("should return the attributes of the character without max value", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });

      createObj("attribute", {
        name: "strength",
        current: "10",
        _characterid: character.id,
      });

      createObj("attribute", {
        name: "dexterity",
        current: "15",
        _characterid: character.id,
      });
      const attributeList = ["strength", "dexterity"];

      // Act
      const result = await APIWrapper.getAttributes(character, attributeList);

      // Assert
      expect(result).toEqual({
        strength: { value: "10" },
        dexterity: { value: "15" },
      });
    });

    it("should return the attributes of the character excluding missing attributes", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });

      createObj("attribute", {
        name: "strength",
        current: "10",
        max: "20",
        _characterid: character.id,
      });
      const attributeList = ["strength", "dexterity"];

      // Act
      const result = await APIWrapper.getAttributes(character, attributeList);

      // Assert
      expect(result).toEqual({
        strength: { value: "10", max: "20" },
      });
    });

    it("should handle empty attribute list", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });

      createObj("attribute", {
        name: "strength",
        current: "10",
        max: "20",
        _characterid: character.id,
      });
      const attributeList: string[] = [];

      // Act
      const result = await APIWrapper.getAttributes(character, attributeList);

      // Assert
      expect(result).toEqual({});
    });

    it("should handle empty max values", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });

      createObj("attribute", {
        name: "emptyMax",
        current: "10",
        max: "",
        _characterid: character.id,
      });

      createObj("attribute", {
        name: "nullMax",
        current: "15",
        _characterid: character.id,
      });

      const attributeList = ["emptyMax", "nullMax"];

      // Act
      const result = await APIWrapper.getAttributes(character, attributeList);

      // Assert
      expect(result).toEqual({
        emptyMax: { value: "10" },
        nullMax: { value: "15" }
      });
    });
  });

  describe("setAttributes", () => {
    it("should set attributes for the character", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });

      const attributes: DeltasObject = {
        strength: { value: "10", max: "20" },
        dexterity: { value: "15", max: "15" },
      };

      // Act
      await APIWrapper.setAttributes(character, attributes);

      // Assert
      const strengthAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "strength",
      })[0];
      expect(strengthAttr).toBeDefined();
      expect(strengthAttr.get("current")).toBe("10");
      expect(strengthAttr.get("max")).toBe("20");

      const dexterityAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "dexterity",
      })[0];
      expect(dexterityAttr).toBeDefined();
      expect(dexterityAttr.get("current")).toBe("15");
      expect(dexterityAttr.get("max")).toBe("15");
    });

    it("should create new attributes if they do not exist", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });

      const attributes: DeltasObject = {
        strength: { value: "10", max: "20" },
        dexterity: { value: "15" },
      };

      // Act
      await APIWrapper.setAttributes(character, attributes);

      // Assert
      const strengthAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "strength",
      })[0];
      expect(strengthAttr).toBeDefined();
      expect(strengthAttr.get("current")).toBe("10");
      expect(strengthAttr.get("max")).toBe("20");

      const dexterityAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "dexterity",
      })[0];
      expect(dexterityAttr).toBeDefined();
      expect(dexterityAttr.get("current")).toBe("15");
    });

    it("should not include max value if it is not provided", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });
      const attributes: DeltasObject = {
        strength: { value: "10" },
        dexterity: { value: "15" },
      };

      // Act
      await APIWrapper.setAttributes(character, attributes);

      // Assert
      const strengthAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "strength",
      })[0];
      expect(strengthAttr).toBeDefined();
      expect(strengthAttr.get("current")).toBe("10");
      expect(strengthAttr.get("max")).toBe(undefined);
    });

    it("should normalize the attribute values to strings", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });

      const attributes: DeltasObject = {
        strength: { value: 10, max: 20 } as any,
        dexterity: { value: 15 } as any,
      };

      // Act
      await APIWrapper.setAttributes(character, attributes);

      // Assert
      const strengthAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "strength",
      })[0];
      expect(strengthAttr).toBeDefined();
      expect(strengthAttr.get("current")).toBe("10");
      expect(strengthAttr.get("max")).toBe("20");

      const dexterityAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "dexterity",
      })[0];
      expect(dexterityAttr).toBeDefined();
      expect(dexterityAttr.get("current")).toBe("15");
    });

    it("should handle empty string values", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });

      const attributes: DeltasObject = {
        emptyValue: { value: "" },
        emptyMax: { value: "10", max: "" }
      };

      // Act
      await APIWrapper.setAttributes(character, attributes);

      // Assert
      const emptyValueAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "emptyValue",
      })[0];
      expect(emptyValueAttr).toBeDefined();
      expect(emptyValueAttr.get("current")).toBe("");

      const emptyMaxAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "emptyMax",
      })[0];
      expect(emptyMaxAttr).toBeDefined();
      expect(emptyMaxAttr.get("current")).toBe("10");
      expect(emptyMaxAttr.get("max")).toBe(undefined);
    });

    it("should handle null and undefined values", async () => {
      // Arrange
      const character = createObj("character", {
        id: "character_id",
        name: "Test Character",
      });

      const attributes = {
        nullValue: { value: null },
        undefinedMax: { value: "5", max: undefined }
      } as any as DeltasObject;

      // Act
      await APIWrapper.setAttributes(character, attributes);

      // Assert
      const nullValueAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "nullValue",
      })[0];
      expect(nullValueAttr).toBeDefined();
      expect(nullValueAttr.get("current")).toBe("");

      const undefinedMaxAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "undefinedMax",
      })[0];
      expect(undefinedMaxAttr).toBeDefined();
      expect(undefinedMaxAttr.get("current")).toBe("5");
      expect(undefinedMaxAttr.get("max")).toBeUndefined();
    });
  });

  describe("extractRepeatingDetails", () => {
    it("should extract section, ID and attribute from repeating attribute name", () => {
      // Arrange
      const attributeName = "repeating_weapons_-LmD9XTw6zZ8dD6iqZ9z_name";

      // Act
      const result = APIWrapper.extractRepeatingDetails(attributeName);

      // Assert
      expect(result).toEqual({
        section: "weapons",
        repeatingID: "-LmD9XTw6zZ8dD6iqZ9z",
        attribute: "name"
      });
    });

    it("should return undefined for non-repeating attribute names", () => {
      // Arrange
      const attributeName = "strength";

      // Act
      const result = APIWrapper.extractRepeatingDetails(attributeName);

      // Assert
      expect(result.attribute).toBeUndefined();
      expect(result.section).toBeUndefined();
      expect(result.repeatingID).toBeUndefined();
    });

    it("should handle complex section names with hyphens", () => {
      // Arrange
      const attributeName = "repeating_spell-cantrip_-ABC123_spellname";

      // Act
      const result = APIWrapper.extractRepeatingDetails(attributeName);

      // Assert
      expect(result).toEqual({
        section: "spell-cantrip",
        repeatingID: "-ABC123",
        attribute: "spellname"
      });
    });

    it("should handle underscores in attribute names", () => {
      // Arrange
      const attributeName = "repeating_equipment_-XYZ789_item_name";

      // Act
      const result = APIWrapper.extractRepeatingDetails(attributeName);

      // Assert
      expect(result).toEqual({
        section: "equipment",
        repeatingID: "-XYZ789",
        attribute: "item_name"
      });
    });

    it("should handle complex alphanumeric IDs", () => {
      // Arrange
      const attributeName = "repeating_skills_-L1a2B3c4D5e6F7g8_skill_name";

      // Act
      const result = APIWrapper.extractRepeatingDetails(attributeName);

      // Assert
      expect(result).toEqual({
        section: "skills",
        repeatingID: "-L1a2B3c4D5e6F7g8",
        attribute: "skill_name"
      });
    });
  });
});