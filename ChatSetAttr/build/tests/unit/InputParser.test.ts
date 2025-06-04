import { describe, it, expect, beforeEach } from "vitest";
import { InputParser, CommandType, Commands, Flags } from "../../src/classes/InputParser";

describe("InputParser", () => {
  let parser: InputParser;

  beforeEach(() => {
    parser = new InputParser();
  });

  describe("parse", () => {
    it("should correctly parse API commands", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].name).toBe(Flags.CHAR_NAME);
      expect(result.flags[0].value).toBe("John");
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("15");
      expect(result.attributes.strength.max).toBe("20");
    });

    it("should correctly parse inline commands", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "Setting attributes for my character !setattr --name John --strength|15|20!!!",
        playerid: "player123",
        who: "John",
        type: "general",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.INLINE);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].name).toBe(Flags.CHAR_NAME);
      expect(result.flags[0].value).toBe("John");
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("15");
      expect(result.attributes.strength.max).toBe("20");
    });

    it("should return NONE command type if no command is found", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "This is not a command",
        playerid: "player123",
        who: "John",
        type: "general",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.NONE);
      expect(result.command).toBeNull();
      expect(result.flags).toHaveLength(0);
      expect(Object.keys(result.attributes)).toHaveLength(0);
    });

    it("should handle multiple flags", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --silent --fb-public",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(3);
      expect(result.flags[0].name).toBe(Flags.CHAR_NAME);
      expect(result.flags[0].value).toBe("John");
      expect(result.flags[1].name).toBe(Flags.SILENT);
      expect(result.flags[1].value).toBe("");
      expect(result.flags[2].name).toBe(Flags.FB_PUBLIC);
      expect(result.flags[2].value).toBe("");
    });

    it("should handle multiple attributes", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength|15|20 --dexterity|12 --wisdom|10|18",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(Object.keys(result.attributes)).toHaveLength(3);

      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("15");
      expect(result.attributes.strength.max).toBe("20");

      expect(result.attributes).toHaveProperty("dexterity");
      expect(result.attributes.dexterity.value).toBe("12");
      expect(result.attributes.dexterity.max).toBeUndefined();

      expect(result.attributes).toHaveProperty("wisdom");
      expect(result.attributes.wisdom.value).toBe("10");
      expect(result.attributes.wisdom.max).toBe("18");
    });

    it("should handle flags with values", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John Smith --fb-header Welcome to the game",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(2);
      expect(result.flags[0].name).toBe(Flags.CHAR_NAME);
      expect(result.flags[0].value).toBe("John Smith");
      expect(result.flags[1].name).toBe(Flags.FB_HEADER);
      expect(result.flags[1].value).toBe("Welcome to the game");
    });

    it("should handle different command types", () => {
      // Arrange
      const inputs: Roll20ChatMessage[] = [
        {
          content: "!setattr --name John --strength|15",
          playerid: "player123",
          who: "John",
          type: "api",
        },
        {
          content: "!modattr --selected --strength|5",
          playerid: "player123",
          who: "John",
          type: "api",
        },
        {
          content: "!delattr --charid abc123 --strength",
          playerid: "player123",
          who: "John",
          type: "api",
        },
        {
          content: "!resetattr --all --strength",
          playerid: "player123",
          who: "John",
          type: "api",
        }
      ];

      // Act & Assert
      expect(parser.parse(inputs[0]).command).toBe(Commands.SET_ATTR);
      expect(parser.parse(inputs[1]).command).toBe(Commands.MOD_ATTR);
      expect(parser.parse(inputs[2]).command).toBe(Commands.DEL_ATTR);
      expect(parser.parse(inputs[3]).command).toBe(Commands.RESET_ATTR);
    });

    it("should properly handle empty or malformed attributes", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --emptyAttr| --malformedAttr",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(Object.keys(result.attributes)).toHaveLength(2);
      expect(result.attributes).toHaveProperty("emptyAttr");
      expect(result.attributes.emptyAttr.value).toBeUndefined();
      expect(result.attributes.emptyAttr.max).toBeUndefined();
      expect(result.attributes).toHaveProperty("malformedAttr");
      expect(result.attributes.malformedAttr.value).toBeUndefined();
      expect(result.attributes.malformedAttr.max).toBeUndefined();
    });

    it("should correctly handle commands with no options", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(0);
      expect(Object.keys(result.attributes)).toHaveLength(0);
    });

    it("should handle attribute with no max value", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength|15|",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("15");
      expect(result.attributes.strength.max).toBeUndefined();
    });

    it("should correctly parse attributes with spaces in values", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --description|This is a long description|Max info",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.attributes).toHaveProperty("description");
      expect(result.attributes.description.value).toBe("This is a long description");
      expect(result.attributes.description.max).toBe("Max info");
    });

    it("should parse attribute names correctly from the format --name|value|max", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("15");
      expect(result.attributes.strength.max).toBe("20");
    });

    it("should handle attributes without values in deletion commands", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!delattr --name John --strength",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.DEL_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBeUndefined();
    });
  });

  describe("targeting flags", () => {
    it("should correctly parse the --all flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --all --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].name).toBe(Flags.ALL);
      expect(result.flags[0].value).toBe("");
      expect(result.attributes).toHaveProperty("strength");
    });

    it("should correctly parse the --allgm flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --allgm --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].name).toBe(Flags.ALL_GM);
      expect(result.flags[0].value).toBe("");
      expect(result.attributes).toHaveProperty("strength");
    });

    it("should correctly parse the --charid flag with a single character ID", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --charid abc123 --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].name).toBe(Flags.CHAR_ID);
      expect(result.flags[0].value).toBe("abc123");
      expect(result.attributes).toHaveProperty("strength");
    });

    it("should correctly parse the --charid flag with multiple character IDs", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --charid abc123, def456, ghi789 --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].name).toBe(Flags.CHAR_ID);
      expect(result.flags[0].value).toBe("abc123, def456, ghi789");
      expect(result.attributes).toHaveProperty("strength");
    });

    it("should correctly parse the --name flag with a single character name", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].name).toBe(Flags.CHAR_NAME);
      expect(result.flags[0].value).toBe("John");
      expect(result.attributes).toHaveProperty("strength");
    });

    it("should correctly parse the --name flag with multiple character names", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John, Jane, Bob --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].name).toBe(Flags.CHAR_NAME);
      expect(result.flags[0].value).toBe("John, Jane, Bob");
      expect(result.attributes).toHaveProperty("strength");
    });

    it("should correctly parse the --name flag with character names containing spaces", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John Smith, Jane Doe --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].name).toBe(Flags.CHAR_NAME);
      expect(result.flags[0].value).toBe("John Smith, Jane Doe");
      expect(result.attributes).toHaveProperty("strength");
    });

    it("should correctly parse the --sel flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --sel --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].name).toBe(Flags.SELECTED);
      expect(result.flags[0].value).toBe("");
      expect(result.attributes).toHaveProperty("strength");
    });

    it("should correctly parse commands with multiple targeting flags (though this would be invalid in usage)", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --sel --name John --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(2);
      expect(result.flags[0].name).toBe(Flags.SELECTED);
      expect(result.flags[0].value).toBe("");
      expect(result.flags[1].name).toBe(Flags.CHAR_NAME);
      expect(result.flags[1].value).toBe("John");
      expect(result.attributes).toHaveProperty("strength");
    });

    it("should correctly parse targeting flags in inline commands", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "Setting attributes for !setattr --sel --strength|15|20!!!",
        playerid: "player123",
        who: "John",
        type: "general",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.INLINE);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].name).toBe(Flags.SELECTED);
      expect(result.flags[0].value).toBe("");
      expect(result.attributes).toHaveProperty("strength");
    });

    it("should combine targeting flags with other flags", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --sel --silent --evaluate --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(3);
      expect(result.flags[0].name).toBe(Flags.SELECTED);
      expect(result.flags[0].value).toBe("");
      expect(result.flags[1].name).toBe(Flags.SILENT);
      expect(result.flags[1].value).toBe("");
      expect(result.flags[2].name).toBe(Flags.EVAL);
      expect(result.flags[2].value).toBe("");
      expect(result.attributes).toHaveProperty("strength");
    });

    it("should parse targeting flags with different commands", () => {
      // Arrange
      const inputs: Roll20ChatMessage[] = [
        {
          content: "!setattr --all --strength|15|20",
          playerid: "player123",
          who: "John",
          type: "api",
        },
        {
          content: "!modattr --allgm --strength|5",
          playerid: "player123",
          who: "John",
          type: "api",
        },
        {
          content: "!delattr --charid abc123 --strength",
          playerid: "player123",
          who: "John",
          type: "api",
        },
        {
          content: "!resetattr --name John --strength",
          playerid: "player123",
          who: "John",
          type: "api",
        }
      ];

      // Act & Assert
      expect(parser.parse(inputs[0]).command).toBe(Commands.SET_ATTR);
      expect(parser.parse(inputs[0]).flags[0].name).toBe(Flags.ALL);

      expect(parser.parse(inputs[1]).command).toBe(Commands.MOD_ATTR);
      expect(parser.parse(inputs[1]).flags[0].name).toBe(Flags.ALL_GM);

      expect(parser.parse(inputs[2]).command).toBe(Commands.DEL_ATTR);
      expect(parser.parse(inputs[2]).flags[0].name).toBe(Flags.CHAR_ID);
      expect(parser.parse(inputs[2]).flags[0].value).toBe("abc123");

      expect(parser.parse(inputs[3]).command).toBe(Commands.RESET_ATTR);
      expect(parser.parse(inputs[3]).flags[0].name).toBe(Flags.CHAR_NAME);
      expect(parser.parse(inputs[3]).flags[0].value).toBe("John");
    });
  });

  describe("command modifier flags", () => {
    it("should correctly parse the --silent flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --silent --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.SILENT,
        value: ""
      });
    });

    it("should correctly parse the --mute flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --mute --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.MUTE,
        value: ""
      });
    });

    it("should correctly parse the --replace flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --replace --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.REPLACE,
        value: ""
      });
    });

    it("should correctly parse the --nocreate flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --nocreate --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.NO_CREATE,
        value: ""
      });
    });

    it("should correctly parse the --mod flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --mod --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.MOD,
        value: ""
      });
    });

    it("should correctly parse the --modb flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --modb --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.MOD_B,
        value: ""
      });
    });

    it("should correctly parse the --reset flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --reset --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.RESET,
        value: ""
      });
    });

    it("should correctly parse the --evaluate flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --evaluate --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.EVAL,
        value: ""
      });
    });

    it("should handle multiple command modifier flags", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --silent --nocreate --mod --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(4); // name, silent, nocreate, mod
      expect(result.flags).toContainEqual({
        name: Flags.SILENT,
        value: ""
      });
      expect(result.flags).toContainEqual({
        name: Flags.NO_CREATE,
        value: ""
      });
      expect(result.flags).toContainEqual({
        name: Flags.MOD,
        value: ""
      });
    });

    it("should correctly parse flags with the delete command", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!delattr --name John --silent --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.DEL_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.SILENT,
        value: ""
      });
    });

    it("should correctly handle the --replace flag with special characters in attributes", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --replace --strength|@{strength+5}",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.REPLACE,
        value: ""
      });
    });

    it("should correctly parse command shortcuts that imply flags", () => {
      // Arrange
      const commands: Roll20ChatMessage[] = [
        {
          content: "!modattr --name John --strength|5|10",
          playerid: "player123",
          who: "John",
          type: "api",
        },
        {
          content: "!modbattr --name John --strength|5|",
          playerid: "player123",
          who: "John",
          type: "api",
        },
        {
          content: "!resetattr --name John --strength|5|",
          playerid: "player123",
          who: "John",
          type: "api",
        }
      ];

      // Act & Assert
      const modResult = parser.parse(commands[0]);
      expect(modResult.commandType).toBe(CommandType.API);
      expect(modResult.command).toBe(Commands.MOD_ATTR);

      const modbResult = parser.parse(commands[1]);
      expect(modbResult.commandType).toBe(CommandType.API);
      expect(modbResult.command).toBe(Commands.MOD_B_ATTR);

      const resetResult = parser.parse(commands[2]);
      expect(resetResult.commandType).toBe(CommandType.API);
      expect(resetResult.command).toBe(Commands.RESET_ATTR);
    });

    it("should parse evaluate expressions correctly", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --evaluate --strength|10+5|20-2",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.EVAL,
        value: ""
      });
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("10+5");
      expect(result.attributes.strength.max).toBe("20-2");
    });

    it("should correctly parse the --silent and --mute flags together", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --silent --mute --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.SILENT,
        value: ""
      });
      expect(result.flags).toContainEqual({
        name: Flags.MUTE,
        value: ""
      });
    });

    it("should parse flags with and without values properly", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John Smith --silent --fb-header Welcome to the game --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(3);
      expect(result.flags).toContainEqual({
        name: Flags.CHAR_NAME,
        value: "John Smith"
      });
      expect(result.flags).toContainEqual({
        name: Flags.SILENT,
        value: ""
      });
      expect(result.flags).toContainEqual({
        name: Flags.FB_HEADER,
        value: "Welcome to the game"
      });
    });

    it("should correctly identify command flags in inline commands", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "Setting attributes !setattr --name John --silent --mod --strength|15|20!!!",
        playerid: "player123",
        who: "John",
        type: "general",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.INLINE);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(3);
      expect(result.flags).toContainEqual({
        name: Flags.SILENT,
        value: ""
      });
      expect(result.flags).toContainEqual({
        name: Flags.MOD,
        value: ""
      });
    });
  });

  describe("feedback flags", () => {
    it("should correctly parse the --fb-public flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --fb-public --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.FB_PUBLIC,
        value: ""
      });
    });

    it("should correctly parse the --fb-from flag with a value", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --fb-from Dungeon Master --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.FB_FROM,
        value: "Dungeon Master"
      });
    });

    it("should correctly parse the --fb-header flag with a value", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --fb-header Character Update --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.FB_HEADER,
        value: "Character Update"
      });
    });

    it("should correctly parse the --fb-content flag with a value", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --fb-content Your character has been updated with new stats! --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.FB_CONTENT,
        value: "Your character has been updated with new stats!"
      });
    });

    it("should handle multiple feedback flags together", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --fb-public --fb-from GM --fb-header Update --fb-content New stats! --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(5); // name + 4 feedback flags
      expect(result.flags).toContainEqual({
        name: Flags.FB_PUBLIC,
        value: ""
      });
      expect(result.flags).toContainEqual({
        name: Flags.FB_FROM,
        value: "GM"
      });
      expect(result.flags).toContainEqual({
        name: Flags.FB_HEADER,
        value: "Update"
      });
      expect(result.flags).toContainEqual({
        name: Flags.FB_CONTENT,
        value: "New stats!"
      });
    });

    it("should handle feedback flags with targeting flags and modifier flags", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --sel --silent --fb-public --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toHaveLength(3);
      expect(result.flags).toContainEqual({
        name: Flags.SELECTED,
        value: ""
      });
      expect(result.flags).toContainEqual({
        name: Flags.SILENT,
        value: ""
      });
      expect(result.flags).toContainEqual({
        name: Flags.FB_PUBLIC,
        value: ""
      });
    });
  });

  describe("attribute parsing edge cases", () => {
    it("should strip single quotes surrounding value or max and trailing spaces", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength|'15'|'20' --dexterity|'value with spaces '|'max with spaces '",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(Object.keys(result.attributes)).toHaveLength(2);
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("15");
      expect(result.attributes.strength.max).toBe("20");
      expect(result.attributes).toHaveProperty("dexterity");
      expect(result.attributes.dexterity.value).toBe("value with spaces ");
      expect(result.attributes.dexterity.max).toBe("max with spaces ");
    });

    it("should preserve spaces at the end when the whole expression is enclosed in quotes", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --description|'This text has spaces at the end   '",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.attributes).toHaveProperty("description");
      expect(result.attributes.description.value).toBe("This text has spaces at the end   ");
    });

    it("should handle escaped pipe and hash characters in values", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --formula|10\\|20\\#30|max",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.attributes).toHaveProperty("formula");
      expect(result.attributes.formula.value).toBe("10|20#30");
      expect(result.attributes.formula.max).toBe("max");
    });

    it("should not change max value when using --name|value format", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength|15",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("15");
      expect(result.attributes.strength.max).toBeUndefined();
    });

    it("should not change current value when using --name||max format", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength||20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBeUndefined();
      expect(result.attributes.strength.max).toBe("20");
    });

    it("should handle empty attributes with --name| format", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength|",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBeUndefined();
      expect(result.attributes.strength.max).toBeUndefined();
    });

    it("should handle empty attributes with just --name format", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBeUndefined();
      expect(result.attributes.strength.max).toBeUndefined();
    });

    it("should ignore value and max for !delattr command", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!delattr --name John --strength|15|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.command).toBe(Commands.DEL_ATTR);
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("15");
      expect(result.attributes.strength.max).toBe("20");
    });

    it("should handle empty current and set max with --name|''|max format", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength|''|20",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBeUndefined();
      expect(result.attributes.strength.max).toBe("20");
    });

    it("should handle repeating attributes by ID", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --repeating_skills_-ABC123_skillname|Acrobatics",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.attributes).toHaveProperty("repeating_skills_-ABC123_skillname");
      expect(result.attributes["repeating_skills_-ABC123_skillname"].value).toBe("Acrobatics");
    });

    it("should handle repeating attributes by row index", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --repeating_skills_$0_skillname|Acrobatics",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.attributes).toHaveProperty("repeating_skills_$0_skillname");
      expect(result.attributes["repeating_skills_$0_skillname"].value).toBe("Acrobatics");
    });

    it("should handle creating new repeating rows", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --repeating_skills_-CREATE_skillname|Acrobatics",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.attributes).toHaveProperty("repeating_skills_-CREATE_skillname");
      expect(result.attributes["repeating_skills_-CREATE_skillname"].value).toBe("Acrobatics");
    });

    it("should handle deleting repeating rows by ID", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!delattr --name John --repeating_skills_-ABC123",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.command).toBe(Commands.DEL_ATTR);
      expect(result.attributes).toHaveProperty("repeating_skills_-ABC123");
    });

    it("should handle deleting repeating rows by row number", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!delattr --name John --repeating_skills_$0",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.command).toBe(Commands.DEL_ATTR);
      expect(result.attributes).toHaveProperty("repeating_skills_$0");
    });

    it("should handle attribute references with %attribute_name% syntax", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --attr1|%attr2%|%attr2_max%",

        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.attributes).toHaveProperty("attr1");
      expect(result.attributes.attr1.value).toBe("%attr2%");
      expect(result.attributes.attr1.max).toBe("%attr2_max%");
    });

    it("should handle multiple complex attribute formats in a single command", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength|15|20 --dexterity|'18 ' --wisdom||16 --constitution|''|25 --repeating_skills_-CREATE_skillname|Acrobatics",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(Object.keys(result.attributes)).toHaveLength(5);

      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("15");
      expect(result.attributes.strength.max).toBe("20");

      expect(result.attributes).toHaveProperty("dexterity");
      expect(result.attributes.dexterity.value).toBe("18 ");
      expect(result.attributes.dexterity.max).toBeUndefined();

      expect(result.attributes).toHaveProperty("wisdom");
      expect(result.attributes.wisdom.value).toBeUndefined();
      expect(result.attributes.wisdom.max).toBe("16");

      expect(result.attributes).toHaveProperty("constitution");
      expect(result.attributes.constitution.value).toBeUndefined();
      expect(result.attributes.constitution.max).toBe("25");

      expect(result.attributes).toHaveProperty("repeating_skills_-CREATE_skillname");
      expect(result.attributes["repeating_skills_-CREATE_skillname"].value).toBe("Acrobatics");
    });

    it("should handle combinations of attribute and flag formats", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --silent --nocreate --evaluate --strength|15|20 --dexterity|'18 ' --wisdom||16",
        playerid: "player123",
        who: "John",
        type: "api",
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.flags).toHaveLength(4); // name, silent, nocreate, evaluate
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("15");
      expect(result.attributes.strength.max).toBe("20");

      expect(result.attributes).toHaveProperty("dexterity");
      expect(result.attributes.dexterity.value).toBe("18 ");

      expect(result.attributes).toHaveProperty("wisdom");
      expect(result.attributes.wisdom.value).toBeUndefined();
      expect(result.attributes.wisdom.max).toBe("16");
    });
  });

  describe("inline roll parsing", () => {
    it("should parse simple inline rolls in attribute values", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --sel --food|$[[0]]",
        playerid: "player123",
        who: "John",
        type: "api",
        inlinerolls: [
          {
            expression: "1d4",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 3
            }
          }
        ]
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.attributes).toHaveProperty("food");
      expect(result.attributes.food.value).toBe("3");
      expect(result.attributes.food.max).toBeUndefined();
    });

    it("should parse inline rolls in both value and max", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --strength|$[[0]]|$[[1]]",
        playerid: "player123",
        who: "John",
        type: "api",
        inlinerolls: [
          {
            expression: "1d6+2",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 5
            }
          },
          {
            expression: "2d8",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 9
            }
          }
        ]
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.attributes).toHaveProperty("strength");
      expect(result.attributes.strength.value).toBe("5");
      expect(result.attributes.strength.max).toBe("9");
    });

    it("should parse multiple inline rolls within a single attribute value", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --damage|$[[0]]+$[[1]]+3",
        playerid: "player123",
        who: "John",
        type: "api",
        inlinerolls: [
          {
            expression: "1d6",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 4
            }
          },
          {
            expression: "1d8",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 6
            }
          }
        ]
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.attributes).toHaveProperty("damage");
      expect(result.attributes.damage.value).toBe("4+6+3");
      expect(result.attributes.damage.max).toBeUndefined();
    });

    it("should parse inline rolls with the --evaluate flag", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --evaluate --damage|$[[0]]+$[[1]]+3",
        playerid: "player123",
        who: "John",
        type: "api",
        inlinerolls: [
          {
            expression: "1d6",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 4
            }
          },
          {
            expression: "2d8",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 6
            }
          }
        ]
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.EVAL,
        value: ""
      });
      expect(result.attributes).toHaveProperty("damage");
      expect(result.attributes.damage.value).toBe("4+6+3");
      expect(result.attributes.damage.max).toBeUndefined();
    });

    it("should parse complex templates with embedded inline roll commands", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "&{template:default} {{name=Cthulhu}} !modattr --silent --charid @{target|character_id} --sanity|-{{Sanity damage=$[[0]]}} --corruption|{{Corruption=Corruption increases by $[[1]]}}!!! {{description=Text}}",
        playerid: "player123",
        who: "John",
        type: "general",
        inlinerolls: [
          {
            expression: "2d10+2",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 15
            }
          },
          {
            expression: "1",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 1
            }
          }
        ]
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.INLINE);
      expect(result.command).toBe(Commands.MOD_ATTR);
      expect(result.flags).toHaveLength(2);
      expect(result.flags).toContainEqual({
        name: Flags.SILENT,
        value: ""
      });
      expect(result.flags).toContainEqual({
        name: Flags.CHAR_ID,
        value: "@{target|character_id}"
      });
      expect(result.attributes).toHaveProperty("sanity");
      expect(result.attributes.sanity.value).toBe("-15");
      expect(result.attributes).toHaveProperty("corruption");
      expect(result.attributes.corruption.value).toBe("1");
    });

    it("should handle nested inline rolls with mixed content", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --complex|Total: $[[0]] + Bonus: $[[1]] = $[[2]]",
        playerid: "player123",
        who: "John",
        type: "api",
        inlinerolls: [
          {
            expression: "1d20",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 18
            }
          },
          {
            expression: "3d6",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 10
            }
          },
          {
            expression: "1d20+3d6",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 28
            }
          }
        ]
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.attributes).toHaveProperty("complex");
      expect(result.attributes.complex.value).toBe("Total: 18 + Bonus: 10 = 28");
    });

    it("should handle inline rolls in repeating attributes", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --repeating_attacks_-CREATE_damage|$[[0]]+3",
        playerid: "player123",
        who: "John",
        type: "api",
        inlinerolls: [
          {
            expression: "2d6",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 9
            }
          }
        ]
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.attributes).toHaveProperty("repeating_attacks_-CREATE_damage");
      expect(result.attributes["repeating_attacks_-CREATE_damage"].value).toBe("9+3");
    });

    it("should handle inline rolls in combined with attribute references", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --formula|@{level}+$[[0]]",
        playerid: "player123",
        who: "John",
        type: "api",
        inlinerolls: [
          {
            expression: "1d6",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 4
            }
          }
        ]
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.attributes).toHaveProperty("formula");
      expect(result.attributes.formula.value).toBe("@{level}+4");
    });

    it("should parse inline rolls in feedback parameter values", () => {
      // Arrange
      const input: Roll20ChatMessage = {
        content: "!setattr --name John --fb-header Action Result: $[[0]] --strength|15",
        playerid: "player123",
        who: "John",
        type: "api",
        inlinerolls: [
          {
            expression: "1d20",
            // @ts-expect-error only partially typing the roll result
            results: {
              total: 17
            }
          }
        ]
      };

      // Act
      const result = parser.parse(input);

      // Assert
      expect(result.commandType).toBe(CommandType.API);
      expect(result.command).toBe(Commands.SET_ATTR);
      expect(result.flags).toContainEqual({
        name: Flags.FB_HEADER,
        value: "Action Result: 17"
      });
    });
  });
});
