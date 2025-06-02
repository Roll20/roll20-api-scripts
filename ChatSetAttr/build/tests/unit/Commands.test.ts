import { it, expect, describe, beforeEach, afterEach, vi } from "vitest"
import { SetAttrCommand, ModAttrCommand, DelAttrCommand, ModBAttrCommand, ResetAttrCommand, ConfigCommand } from "../../src/classes/Commands";
import type { Option } from "../../src/classes/InputParser";

describe("SetAttrCommand", () => {
  let command: SetAttrCommand;

  beforeEach(() => {
    // Set up test environment
    global.setupTestEnvironment();

    // Create a new instance of SetAttrCommand for each test
    command = new SetAttrCommand();
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should set attributes for each target character", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        strength: { value: "15" },
        dexterity: { value: "12", max: "18" }
      };
      const char1 = createObj("character", { id: "char1" });
      const char2 = createObj("character", { id: "char2" });
      const targets = [char1, char2];

      // Act - using new API that expects character objects
      await command.execute(options, targets, values);

      // Assert - check attributes were created correctly
      await vi.waitFor(() => {
        const char1Strength = findObjs<"attribute">({
          _type: "attribute",
          _characterid: "char1",
          name: "strength"
        })[0];
        expect(char1Strength.get("current")).toBe("15");

        const char1Dexterity = findObjs<"attribute">({
          _type: "attribute",
          _characterid: "char1",
          name: "dexterity"
        })[0];
        expect(char1Dexterity.get("current")).toBe("12");
        expect(char1Dexterity.get("max")).toBe("18");

        const char2Strength = findObjs<"attribute">({
          _type: "attribute",
          _characterid: "char2",
          name: "strength"
        })[0];
        expect(char2Strength.get("current")).toBe("15");

        const char2Dexterity = findObjs<"attribute">({
          _type: "attribute",
          _characterid: "char2",
          name: "dexterity"
        })[0];
        expect(char2Dexterity.get("current")).toBe("12");
        expect(char2Dexterity.get("max")).toBe("18");
      });
    });

    it("should not create new attributes when nocreate option is provided", async () => {
      // Arrange
      const options: Option[] = [
        { name: "nocreate" }
      ];
      const values = {
        strength: { value: "15" },
        nonexistent: { value: "20" }
      };
      const character = createObj("character", { id: "char1" });
      const existingAttr = createObj("attribute", {
        _characterid: character.id,
        name: "strength",
        current: "10"
      });
      const targets = [character];

      // Act
      await command.execute(options, targets, values);

      // Assert
      // Existing attribute should be updated
      expect(existingAttr.get("current")).toBe("15");

      // Nonexistent attribute should not be created
      const nonexistentAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "nonexistent"
      });
      expect(nonexistentAttr).toHaveLength(0);
    });

    it("should evaluate attributes when evaluate option is provided", async () => {
      // Arrange
      const options: Option[] = [{name: "evaluate"}];
      const values = {
        strength: { value: "10 + 5" },
        dexterity: { value: "8 * 2", max: "20 - 2" }
      };
      const character = createObj("character", { id: "char1" });
      const targets = [character];

      // Act
      await command.execute(options, targets, values);

      // Assert
      const strengthAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "strength"
      })[0];
      expect(strengthAttr.get("current")).toBe("15");

      const dexterityAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "dexterity"
      })[0];
      expect(dexterityAttr.get("current")).toBe("16");
      expect(dexterityAttr.get("max")).toBe("18");
    });

    it("should work with multiple options", async () => {
      // Arrange
      const options: Option[] = [{ name: "nocreate" }, { name: "evaluate" }];
      const values = {
        strength: { value: "10 + 5" },
        nonexistent: { value: "20" }
      };
      const character = createObj("character", { id: "char1" });
      const existingAttr = createObj("attribute", {
        _characterid: character.id,
        name: "strength",
        current: "10"
      });
      const targets = [character];

      // Act
      await command.execute(options, targets, values);

      // Assert
      // Existing attribute should be updated with evaluated value
      expect(existingAttr.get("current")).toBe("15");

      // Nonexistent attribute should not be created
      const nonexistentAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "nonexistent"
      });
      expect(nonexistentAttr).toHaveLength(0);
    });
  });

  describe("help", () => {
    it("should return help message", () => {
      // Act
      const helpText = command.help();

      // Assert
      expect(helpText).toBe("!setattr nocreate evaluate - Set attributes for a character.");
    });
  });
});

describe("ModAttrCommand", () => {
  let command: ModAttrCommand;

  beforeEach(() => {
    // Set up test environment
    global.setupTestEnvironment();

    // Create a new instance of ModAttrCommand for each test
    command = new ModAttrCommand();
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should modify attributes by adding values", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        strength: { value: "5" },
        dexterity: { value: "10" }
      };
      const char = createObj("character", { id: "char1" });
      const strength = createObj("attribute", { id: "attr1", _characterid: "char1", name: "strength", current: "10" });
      const dexterity = createObj("attribute", { id: "attr2", _characterid: "char1", name: "dexterity", current: "15" });
      const targets = [char];

      // Act
      await command.execute(options, targets, values);

      // Assert
      expect(strength.get("current")).toBe("15");
      expect(dexterity.get("current")).toBe("25");
    });

    it("should handle negative modifications", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        strength: { value: "-5" },
        dexterity: { value: "-3" }
      };
      const char = createObj("character", { id: "char1" });
      const strength = createObj("attribute", { id: "attr1", _characterid: "char1", name: "strength", current: "10" });
      const dexterity = createObj("attribute", { id: "attr2", _characterid: "char1", name: "dexterity", current: "15" });
      const targets = [char];

      // Act
      await command.execute(options, targets, values);

      // Assert
      expect(strength.get("current")).toBe("5");
      expect(dexterity.get("current")).toBe("12");
    });

    it("should handle attributes with max values", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        dexterity: { value: "10", max: "5" }
      };
      const char = createObj("character", { id: "char1" });
      const dexterity = createObj("attribute", {
        id: "attr2",
        _characterid: "char1",
        name: "dexterity",
        current:
        "15",
        max: "20"
      });
      const targets = [char];

      // Act
      await command.execute(options, targets, values);

      // Assert
      expect(dexterity.get("current")).toBe("25");
      expect(dexterity.get("max")).toBe("25");
    });

    it("should keep the current value if modification fails", async () => {
      // Arrange
      const options: Option[] = [{ name: "evaluate" }];
      const values = {
        strength: { value: "10 + 5" },
        dexterity: { value: "10", max: "20 - 2" }
      };
      const char = createObj("character", { id: "char1" });
      const strength = createObj("attribute", {
        id: "attr1",
        _characterid: "char1",
        name: "strength",
        current: "5"
      });
      const dexterity = createObj("attribute", {
        id: "attr2",
        _characterid: "char1",
        name: "dexterity",
        current: "not a number",
      });
      const targets = [char];

      // Act
      await command.execute(options, targets, values);

      // Assert
      expect(strength.get("current")).toBe("20");
      // Unevaluable values should remain unchanged
      expect(dexterity.get("current")).toBe("not a number");
    });

    it("should handle only max values", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        dexterity: { max: "5" }
      };
      const char = createObj("character", { id: "char1" });
      const dexterity = createObj("attribute", { id: "attr2", _characterid: "char1", name: "dexterity", current: "15", max: "20" });
      const targets = [char];

      // Act
      await command.execute(options, targets, values);

      // Assert
      expect(dexterity.get("current")).toBe("15");
      expect(dexterity.get("max")).toBe("25");
    });

    it("should handle evaluation when evaluate option is provided", async () => {
      // Arrange
      const options: Option[] = [{ name: "evaluate" }];
      const values = {
        strength: { value: "2 * 3" },
        dexterity: { value: "5 + 2", max: "3 * 2" }
      };
      const char = createObj("character", { id: "char1" });
      const strength = createObj("attribute", { id: "attr1", _characterid: "char1", name: "strength", current: "10" });
      const dexterity = createObj("attribute", { id: "attr2", _characterid: "char1", name: "dexterity", current: "20", max: "30" });
      const targets = [char];

      // Act
      await command.execute(options, targets, values);

      // Assert
      expect(strength.get("current")).toBe("16");
      expect(dexterity.get("current")).toBe("27");
      expect(dexterity.get("max")).toBe("36");
    });

    it("should gracefully handle attributes that don't exist", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        nonexistent: { value: "5" }
      };
      const char = createObj("character", { id: "char1" });
      const targets = [char];

      // Act & Assert
      expect(async () => {
        await command.execute(options, targets, values);
      }).not.toThrow();
    });
  });

  describe("help", () => {
    it("should return help message", () => {
      // Act
      const helpText = command.help();

      // Assert
      expect(helpText).toBe("!modattr evaluate - Modify attributes for a character.");
    });
  });
});

describe("DelAttrCommand", () => {
  let command: DelAttrCommand;

  beforeEach(() => {
    // Set up test environment
    global.setupTestEnvironment();

    // Create a new instance of DelAttrCommand for each test
    command = new DelAttrCommand();
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should delete attributes for a character", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        strength: { value: "" },
        dexterity: { value: "" }
      };
      const character = createObj("character", { id: "char1" });
      createObj("attribute", {
        _characterid: character.id,
        name: "strength",
        current: "10"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: "dexterity",
        current: "15"
      });
      createObj("attribute", {
        _characterid: character.id,
        name: "wisdom",
        current: "12"
      });
      const targets = [character];

      // Act
      await command.execute(options, targets, values);

      // Assert
      // The deleted attributes should no longer exist
      const strengthAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "strength"
      });
      expect(strengthAttr).toHaveLength(0);

      const dexterityAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "dexterity"
      });
      expect(dexterityAttr).toHaveLength(0);

      // Other attributes should remain untouched
      const wisdomAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "wisdom"
      });
      expect(wisdomAttr).toHaveLength(1);
    });

    it("should handle attempts to delete nonexistent attributes", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        strength: { value: "" },
        nonexistent: { value: "" }
      };
      const character = createObj("character", { id: "char1" });
      createObj("attribute", {
        _characterid: character.id,
        name: "strength",
        current: "10"
      });
      const targets = [character];

      // Act
      await command.execute(options, targets, values);

      // Assert
      // The existing attribute should be deleted
      const strengthAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "strength"
      });
      expect(strengthAttr).toHaveLength(0);
    });

    it("should delete attributes for multiple characters", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        strength: { value: "" }
      };
      const char1 = createObj("character", { id: "char1" });
      const char2 = createObj("character", { id: "char2" });
      const targets = [char1, char2];

      createObj("attribute", {
        _characterid: char1.id,
        name: "strength",
        current: "10"
      });
      createObj("attribute", {
        _characterid: char2.id,
        name: "strength",
        current: "15"
      });

      // Act
      await command.execute(options, targets, values);

      // Assert
      // The attributes should be deleted from both characters
      const char1Strength = findObjs<"attribute">({
        _type: "attribute",
        _characterid: char1.id,
        name: "strength"
      });
      expect(char1Strength).toHaveLength(0);

      const char2Strength = findObjs<"attribute">({
        _type: "attribute",
        _characterid: char2.id,
        name: "strength"
      });
      expect(char2Strength).toHaveLength(0);
    });
  });

  describe("help", () => {
    it("should return help message", () => {
      // Act
      const helpText = command.help();

      // Assert
      expect(helpText).toBe("!delattr - Delete attributes for a character.");
    });
  });
});

describe("ModBAttrCommand", () => {
  let command: ModBAttrCommand;

  beforeEach(() => {
    // Set up test environment
    global.setupTestEnvironment();

    // Create a new instance of ModBAttrCommand for each test
    command = new ModBAttrCommand();
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should modify existing attributes if they exist", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        strength: { value: "5" },
        dexterity: { value: "10" }
      };
      const character = createObj("character", { id: "char1" });
      const strength = createObj("attribute", {
        _characterid: character.id,
        name: "strength",
        current: "10"
      });
      const dexterity = createObj("attribute", {
        _characterid: character.id,
        name: "dexterity",
        current: "15"
      });
      const targets = [character];

      // Act
      await command.execute(options, targets, values);

      // Assert
      expect(strength.get("current")).toBe("15"); // 10 + 5
      expect(dexterity.get("current")).toBe("25"); // 15 + 10
    });

    it("should handle max values for both new and existing attributes", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        strength: { value: "5", max: "10" },
        dexterity: { max: "15" }
      };
      const character = createObj("character", { id: "char1" });
      const strength = createObj("attribute", {
        _characterid: character.id,
        name: "strength",
        current: "10",
        max: "20"
      });
      const targets = [character];

      // Act
      await command.execute(options, targets, values);

      // Assert
      expect(strength.get("current")).toBe("15"); // 10 + 5
      expect(strength.get("max")).toBe("30"); // 20 + 10

      const dexterityAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "dexterity"
      })[0];
      expect(dexterityAttr.get("current")).toBe("0"); // Default for new attribute
      expect(dexterityAttr.get("max")).toBe("15");
    });

    it("should evaluate expressions when evaluate option is provided", async () => {
      // Arrange
      const options: Option[] = [{ name: "evaluate" }];
      const values = {
        strength: { value: "2 * 3" },
        dexterity: { value: "5 + 2" }
      };
      const character = createObj("character", { id: "char1" });
      const strength = createObj("attribute", {
        _characterid: character.id,
        name: "strength",
        current: "10"
      });
      const targets = [character];

      // Act
      await command.execute(options, targets, values);

      // Assert
      expect(strength.get("current")).toBe("16"); // 10 + 6

      const dexterityAttr = findObjs<"attribute">({
        _type: "attribute",
        _characterid: character.id,
        name: "dexterity"
      })[0];
      expect(dexterityAttr.get("current")).toBe("7"); // 0 + 7
    });
  });
});

describe("ResetAttrCommand", () => {
  let command: ResetAttrCommand;

  beforeEach(() => {
    // Set up test environment
    global.setupTestEnvironment();

    // Create a new instance of ResetAttrCommand for each test
    command = new ResetAttrCommand();
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should reset attributes to default values", async () => {
      // Arrange
      const options: Option[] = [];
      const values = {
        strength: {},
        dexterity: {}
      };
      const character = createObj("character", { id: "char1" });
      const strength = createObj("attribute", {
        _characterid: character.id,
        name: "strength",
        current: "15",
        max: "20"
      });
      const dexterity = createObj("attribute", {
        _characterid: character.id,
        name: "dexterity",
        current: "20",
        max: "24"
      });
      const targets = [character];

      // Act
      await command.execute(options, targets, values);

      // Assert
      expect(strength.get("current")).toBe("20");
      expect(dexterity.get("current")).toBe("24");
    });
  });
});

describe("ConfigCommand", () => {
  let command: ConfigCommand;

  beforeEach(() => {
    // Set up test environment
    global.setupTestEnvironment();

    // Ensure state has required properties
    global.state.ChatSetAttr = {
      version: 3,
      globalconfigCache: { lastsaved: 0 },
      playersCanModify: false,
      playersCanEvaluate: false,
      useWorkers: false
    };

    // Create a new instance of ConfigCommand for each test
    command = new ConfigCommand();
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should toggle configuration values", async () => {
      // Arrange
      global.state.ChatSetAttr.playersCanModify = true;
      global.state.ChatSetAttr.playersCanEvaluate = true;
      global.state.ChatSetAttr.useWorkers = true;

      const options: Option[] = [
        { name: "players-can-modify" },
        { name: "use-workers" }
      ];
      const values = {};
      const targets: Roll20Character[] = [];
      const message = { playerid: "12345" } as Roll20ChatMessage;

      // Act
      await command.execute(options, targets, values, message);

      // Assert
      expect(global.state.ChatSetAttr.playersCanModify).toBe(false); // Toggled
      expect(global.state.ChatSetAttr.playersCanEvaluate).toBe(true); // Unchanged
      expect(global.state.ChatSetAttr.useWorkers).toBe(false); // Toggled
    });
  });
});
