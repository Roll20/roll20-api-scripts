import { describe, it, expect } from "vitest";
import {
  extractMessageFromRollTemplate,
  parseMessage,
} from "../../modules/message";

// parseMessage returns undefined for empty/invalid commands; these tests pass
// valid commands, so unwrap the result for ergonomic property access.
function parse(content: string) {
  const result = parseMessage(content);
  if (!result) {
    throw new Error(`parseMessage unexpectedly returned undefined for: ${content}`);
  }
  return result;
}

describe("message", () => {
  describe("extractMessageFromRollTemplate", () => {
    const createMockMessage = (content: string): Roll20ChatMessage => ({
      content,
      who: "TestPlayer",
      type: "general",
      playerid: "player123",
      rolltemplate: undefined,
      inlinerolls: undefined,
      selected: undefined,
    });

    describe("valid command extraction", () => {
      it("should extract setattr command", () => {
        const msg = createMockMessage("&{template:default} {{name=Test}} {{setattr=!setattr --strength 18!!!}} {{other=content}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!setattr --strength 18");
      });

      it("should extract modattr command", () => {
        const msg = createMockMessage("&{template:default} {{modattr=!modattr --strength +2!!!}} {{other=content}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!modattr --strength +2");
      });

      it("should extract modbattr command", () => {
        const msg = createMockMessage("&{template:default} {{modbattr=!modbattr --hitpoints +5!!!}} {{other=content}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!modbattr --hitpoints +5");
      });

      it("should extract resetattr command", () => {
        const msg = createMockMessage("&{template:default} {{resetattr=!resetattr --strength!!!}} {{other=content}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!resetattr --strength");
      });

      it("should extract delattr command", () => {
        const msg = createMockMessage("&{template:default} {{delattr=!delattr --skill_athletics!!!}} {{other=content}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!delattr --skill_athletics");
      });
    });

    describe("complex command extraction", () => {
      it("should extract command with multiple options", () => {
        const msg = createMockMessage("&{template:default} {{r1=[[1d20]]}} !setattr --sel --strength|18|20 --dexterity|14 --silent!!! {{r2=[[2d6]]}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!setattr --sel --strength|18|20 --dexterity|14 --silent");
      });

      it("should extract command with placeholders", () => {
        const msg = createMockMessage("&{template:default} {{r1=[[1d20]]}} !modattr --sel --hitpoints|+%constitution_modifier%!!! {{r2=[[2d6]]}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!modattr --sel --hitpoints|+%constitution_modifier%");
      });

      it("should handle whitespace in commands", () => {
        const msg = createMockMessage("&{template:default} {{r1=[[1d20]]}} !setattr --strength 18 !!! {{r2=[[2d6]]}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!setattr --strength 18");
      });
    });

    describe("multiple commands", () => {
      it("should extract first matching command when multiple are present", () => {
        const msg = createMockMessage("{{setattr=!setattr --strength 18!!!}} {{modattr=!modattr --dex +2!!!}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!setattr --strength 18");
      });
    });

    describe("invalid cases", () => {
      it("should return false when no commands are found", () => {
        const msg = createMockMessage("&{template:default} {{name=Test}} {{description=No commands here}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe(false);
      });

      it("should return false when command exists but no !!! terminator", () => {
        const msg = createMockMessage("{{setattr=!setattr --strength 18}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe(false);
      });

      it("should return false when empty content", () => {
        const msg = createMockMessage("");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe(false);
      });

      it("should return false when command keyword exists but no actual command", () => {
        const msg = createMockMessage("This message contains the word setattr but no command");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe(false);
      });
    });

    describe("edge cases", () => {
      it("should handle commands with special characters", () => {
        const msg = createMockMessage("{{setattr=!setattr --repeating_skills_CREATE_name|Acrobatics!!!}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!setattr --repeating_skills_CREATE_name|Acrobatics");
      });

      it("should handle commands with numbers", () => {
        const msg = createMockMessage("{{setattr=!setattr --skill_1|5 --skill_2|10!!!}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!setattr --skill_1|5 --skill_2|10");
      });

      it("should handle commands with equals signs", () => {
        const msg = createMockMessage("{{setattr=!setattr --strength|18 --formula|2+3=5!!!}}");
        const result = extractMessageFromRollTemplate(msg);
        expect(result).toBe("!setattr --strength|18 --formula|2+3=5");
      });
    });
  });

  describe("parseMessage", () => {
    describe("operation extraction", () => {
      it("should extract setattr operation", () => {
        const result = parse("!setattr --strength 18");
        expect(result.operation).toBe("setattr");
      });

      it("should extract modattr operation", () => {
        const result = parse("!modattr --strength +2");
        expect(result.operation).toBe("modattr");
      });

      it("should extract modbattr operation", () => {
        const result = parse("!modbattr --hitpoints +5");
        expect(result.operation).toBe("modbattr");
      });

      it("should extract resetattr operation", () => {
        const result = parse("!resetattr --strength");
        expect(result.operation).toBe("resetattr");
      });

      it("should extract delattr operation", () => {
        const result = parse("!delattr --skill_athletics");
        expect(result.operation).toBe("delattr");
      });

      it("should return undefined for empty command", () => {
        expect(parseMessage("")).toBeUndefined();
      });

      it("should return undefined for invalid command", () => {
        expect(parseMessage("!invalidcmd --test")).toBeUndefined();
      });
    });

    describe("command option overrides", () => {
      it("should override setattr with mod option", () => {
        const result = parse("!setattr --mod --strength +2");
        expect(result.operation).toBe("modattr");
      });

      it("should override setattr with modb option", () => {
        const result = parse("!setattr --modb --hitpoints +5");
        expect(result.operation).toBe("modbattr");
      });

      it("should override setattr with reset option", () => {
        const result = parse("!setattr --reset --strength");
        expect(result.operation).toBe("resetattr");
      });

      it("should handle multiple command options (last one wins)", () => {
        const result = parse("!setattr --mod --reset --strength");
        expect(result.operation).toBe("resetattr");
      });
    });

    describe("options parsing", () => {
      it("should parse silent option", () => {
        const result = parse("!setattr --silent --strength 18");
        expect(result.options.silent).toBe(true);
      });

      it("should parse replace option", () => {
        const result = parse("!setattr --replace --strength 18");
        expect(result.options.replace).toBe(true);
      });

      it("should parse nocreate option", () => {
        const result = parse("!setattr --nocreate --strength 18");
        expect(result.options.nocreate).toBe(true);
      });

      it("should parse mute option", () => {
        const result = parse("!setattr --mute --strength 18");
        expect(result.options.mute).toBe(true);
      });

      it("should parse evaluate option", () => {
        const result = parse("!setattr --evaluate --strength 18");
        expect(result.options.evaluate).toBe(true);
      });

      it("should parse multiple options", () => {
        const result = parse("!setattr --silent --replace --evaluate --strength 18");
        expect(result.options.silent).toBe(true);
        expect(result.options.replace).toBe(true);
        expect(result.options.evaluate).toBe(true);
        expect(result.options.mute).toBeUndefined();
      });
    });

    describe("target parsing", () => {
      it("should parse all target", () => {
        const result = parse("!setattr --all --strength 18");
        expect(result.targeting).toContain("all");
      });

      it("should parse allgm target", () => {
        const result = parse("!setattr --allgm --strength 18");
        expect(result.targeting).toContain("allgm");
      });

      it("should parse allplayers target", () => {
        const result = parse("!setattr --allplayers --strength 18");
        expect(result.targeting).toContain("allplayers");
      });

      it("should parse charid target", () => {
        const result = parse("!setattr --charid -Abc123 --strength 18");
        expect(result.targeting).toContain("charid -Abc123");
      });

      it("should parse name target", () => {
        const result = parse("!setattr --name Gandalf --strength 18");
        expect(result.targeting).toContain("name Gandalf");
      });

      it("should parse sel target", () => {
        const result = parse("!setattr --sel --strength 18");
        expect(result.targeting).toContain("sel");
      });

      it("should parse multiple targets", () => {
        const result = parse("!setattr --sel --name Gandalf --strength 18");
        expect(result.targeting).toContain("sel");
        expect(result.targeting).toContain("name Gandalf");
      });
    });

    describe("attribute changes parsing", () => {
      it("should parse simple attribute name", () => {
        const result = parse("!setattr --sel --strength");
        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]).toEqual({ name: "strength" });
      });

      it("should parse attribute with current value", () => {
        const result = parse("!setattr --sel --strength|18");
        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]).toEqual({
          name: "strength",
          current: "18",
        });
      });

      it("should parse attribute with current and max values", () => {
        const result = parse("!setattr --sel --strength|18|20");
        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]).toEqual({
          name: "strength",
          current: "18",
          max: "20",
        });
      });

      it("should parse attribute with empty current but max value", () => {
        const result = parse("!setattr --sel --strength||20");
        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]).toEqual({
          name: "strength",
          max: "20",
        });
      });

      it("should parse multiple attributes", () => {
        const result = parse("!setattr --sel --strength|18 --dexterity|14|16 --constitution");
        expect(result.changes).toHaveLength(3);
        expect(result.changes[0]).toEqual({ name: "strength", current: "18" });
        expect(result.changes[1]).toEqual({ name: "dexterity", current: "14", max: "16" });
        expect(result.changes[2]).toEqual({ name: "constitution" });
      });

      it("should handle attributes with numbers and underscores", () => {
        const result = parse("!setattr --sel --skill_1|5 --attr_test_2|value");
        expect(result.changes).toHaveLength(2);
        expect(result.changes[0]).toEqual({ name: "skill_1", current: "5" });
        expect(result.changes[1]).toEqual({ name: "attr_test_2", current: "value" });
      });
    });

    describe("referenced attributes parsing", () => {
      it("should extract references from current values", () => {
        const result = parse("!setattr --sel --hitpoints|%constitution%");
        expect(result.references).toContain("%constitution%");
      });

      it("should extract references from max values", () => {
        const result = parse("!setattr --sel --hitpoints|10|%constitution%");
        expect(result.references).toContain("%constitution%");
      });

      it("should extract multiple references from same attribute", () => {
        const result = parse("!setattr --sel --total|%strength% + %dexterity%");
        expect(result.references).toContain("%strength%");
        expect(result.references).toContain("%dexterity%");
      });

      it("should extract references from multiple attributes", () => {
        const result = parse("!setattr --sel --hitpoints|%constitution%|%constitution_max% --armor|%dexterity%");
        expect(result.references).toContain("%constitution%");
        expect(result.references).toContain("%constitution_max%");
        expect(result.references).toContain("%dexterity%");
      });

      it("should handle attributes with underscores and numbers in references", () => {
        const result = parse("!setattr --sel --total|%skill_1% + %attr_test_2%");
        expect(result.references).toContain("%skill_1%");
        expect(result.references).toContain("%attr_test_2%");
      });

      it("should not extract references from non-string values", () => {
        const result = parse("!setattr --sel --strength|18");
        expect(result.references).toHaveLength(0);
      });

      it("should handle complex expressions with references", () => {
        const result = parse("!setattr --sel --formula|%base% * 2 + %bonus%|%max_formula%");
        expect(result.references).toContain("%base%");
        expect(result.references).toContain("%bonus%");
        expect(result.references).toContain("%max_formula%");
      });
    });

    describe("complex parsing scenarios", () => {
      it("should parse command with all components", () => {
        const result = parse("!setattr --silent --replace --sel --name Gandalf --strength|%base_str%|20 --dexterity|14");

        expect(result.operation).toBe("setattr");
        expect(result.options.silent).toBe(true);
        expect(result.options.replace).toBe(true);
        expect(result.targeting).toContain("sel");
        expect(result.targeting).toContain("name Gandalf");
        expect(result.changes).toHaveLength(2);
        expect(result.changes[0]).toEqual({ name: "strength", current: "%base_str%", max: "20" });
        expect(result.changes[1]).toEqual({ name: "dexterity", current: "14" });
        expect(result.references).toContain("%base_str%");
      });

      it("should handle mixed command options and regular options", () => {
        const result = parse("!setattr --mod --silent --evaluate --sel --strength|%base% + 2");

        expect(result.operation).toBe("modattr");
        expect(result.options.silent).toBe(true);
        expect(result.options.evaluate).toBe(true);
        expect(result.targeting).toContain("sel");
        expect(result.changes[0]).toEqual({ name: "strength", current: "%base% + 2" });
        expect(result.references).toContain("%base%");
      });
    });

    describe("edge cases", () => {
      it("should handle extra whitespace", () => {
        const result = parse("  !setattr   --sel   --strength  |  18  ");
        expect(result.operation).toBe("setattr");
        expect(result.targeting).toContain("sel");
        expect(result.changes[0]).toEqual({ name: "strength", current: "18" }); // Properly parsed with pipes
      });

      it("should ignore empty parts from double separators", () => {
        const result = parse("!setattr --sel ---- --strength|18");
        expect(result.operation).toBe("setattr");
        expect(result.targeting).toContain("sel");
        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]).toEqual({ name: "strength", current: "18" });
      });

      it("should handle attribute names with pipes but no values", () => {
        const result = parse("!setattr --sel --test|");
        expect(result.changes[0]).toEqual({ name: "test" });
      });

      it("should handle attributes with multiple pipes", () => {
        const result = parse("!setattr --sel --test|val1|val2|val3");
        expect(result.changes[0]).toEqual({
          name: "test",
          current: "val1",
          max: "val2", // Only first two values after pipe are used
        });
      });
    });

    describe("feedback parsing", () => {
      it("should parse fb-public option", () => {
        const result = parse("!setattr --sel --fb-public --strength|18");
        expect(result.feedback.public).toBe(true);
      });

      it("should parse fb-from option with single word value", () => {
        const result = parse("!setattr --sel --fb-from TestGM --strength|18");
        expect(result.feedback.from).toBe("TestGM");
        expect(result.feedback.public).toBe(false); // default
      });

      it("should parse fb-header option with single word value", () => {
        const result = parse("!setattr --sel --fb-header Custom --strength|18");
        expect(result.feedback.header).toBe("Custom");
        expect(result.feedback.public).toBe(false); // default
      });

      it("should parse fb-content option with single word value", () => {
        const result = parse("!setattr --sel --fb-content Custom --strength|18");
        expect(result.feedback.content).toBe("Custom");
        expect(result.feedback.public).toBe(false); // default
      });

      it("should parse multiple feedback options", () => {
        const result = parse("!setattr --sel --fb-public --fb-from TestGM --fb-header Custom --strength|18");
        expect(result.feedback.public).toBe(true);
        expect(result.feedback.from).toBe("TestGM");
        expect(result.feedback.header).toBe("Custom");
        expect(result.feedback.content).toBeUndefined();
      });

      it("should parse all feedback options together", () => {
        const result = parse("!setattr --sel --fb-public --fb-from TestGM --fb-header Test --fb-content Message --strength|18");
        expect(result.feedback.public).toBe(true);
        expect(result.feedback.from).toBe("TestGM");
        expect(result.feedback.header).toBe("Test");
        expect(result.feedback.content).toBe("Message");
      });

      it("should handle feedback options with no value gracefully", () => {
        const result = parse("!setattr --sel --fb-from --strength|18");
        expect(result.feedback.from).toBe("");
        expect(result.feedback.public).toBe(false);
      });

      it("should default feedback to public false when no feedback options", () => {
        const result = parse("!setattr --sel --strength|18");
        expect(result.feedback.public).toBe(false);
        expect(result.feedback.from).toBeUndefined();
        expect(result.feedback.header).toBeUndefined();
        expect(result.feedback.content).toBeUndefined();
      });

      it("should handle mixed feedback and regular options", () => {
        const result = parse("!setattr --silent --fb-public --fb-from TestGM --sel --strength|18");
        expect(result.options.silent).toBe(true);
        expect(result.feedback.public).toBe(true);
        expect(result.feedback.from).toBe("TestGM");
        expect(result.targeting).toContain("sel");
      });
    });

    describe("return value structure", () => {
      it("should return all expected properties", () => {
        const result = parse("!setattr --sel --strength|18");

        expect(result).toHaveProperty("operation");
        expect(result).toHaveProperty("options");
        expect(result).toHaveProperty("targeting");
        expect(result).toHaveProperty("changes");
        expect(result).toHaveProperty("references");
        expect(result).toHaveProperty("feedback");

        expect(typeof result.operation).toBe("string");
        expect(typeof result.options).toBe("object");
        expect(Array.isArray(result.targeting)).toBe(true);
        expect(Array.isArray(result.changes)).toBe(true);
        expect(Array.isArray(result.references)).toBe(true);
        expect(typeof result.feedback).toBe("object");
      });

      it("should return empty arrays when no matches found", () => {
        const result = parse("!setattr");

        expect(result.targeting).toEqual([]);
        expect(result.changes).toEqual([]);
        expect(result.references).toEqual([]);
        expect(result.options).toEqual({});
        expect(result.feedback).toEqual({ public: false });
      });
    });

    describe("quote handling and space stripping", () => {
      describe("feedback option quote handling", () => {
        it("strips single quotes from fb-header value", () => {
          const message = "!setattr --fb-header 'Terrible Wounds'";
          const result = parse(message);
          expect(result.feedback.header).toBe("Terrible Wounds");
        });

        it("strips double quotes from fb-header value", () => {
          const message = "!setattr --fb-header \"Terrible Wounds\"";
          const result = parse(message);
          expect(result.feedback.header).toBe("Terrible Wounds");
        });

        it("preserves trailing spaces within quotes for fb-header", () => {
          const message = "!setattr --fb-header \"Terrible Wounds \"";
          const result = parse(message);
          expect(result.feedback.header).toBe("Terrible Wounds ");
        });

        it("strips trailing spaces without quotes for fb-header", () => {
          const message = "!setattr --fb-header Terrible";
          const result = parse(message);
          expect(result.feedback.header).toBe("Terrible");
        });

        it("strips single quotes from fb-content value", () => {
          const message = "!setattr --fb-content 'Character'";
          const result = parse(message);
          expect(result.feedback.content).toBe("Character");
        });

        it("preserves internal quotes and spaces when enclosed in outer quotes", () => {
          const message = "!setattr --fb-content 'Quote:'";
          const result = parse(message);
          expect(result.feedback.content).toBe("Quote:");
        });

        it("strips mixed quote types (single on one side, double on other)", () => {
          const message = "!setattr --fb-from 'Player\"";
          const result = parse(message);
          expect(result.feedback.from).toBe("Player");
        });
      });

      describe("attribute value quote handling", () => {
        it("strips single quotes from attribute current value", () => {
          const message = "!setattr --sel --hp|'25'";
          const result = parse(message);
          expect(result.changes[0].current).toBe("25");
        });

        it("strips single quotes from attribute max value", () => {
          const message = "!setattr --sel --hp|10|'50'";
          const result = parse(message);
          expect(result.changes[0].max).toBe("50");
        });

        it("preserves trailing spaces within quotes for attribute values", () => {
          const message = "!setattr --sel --details|'This is a long message with multiple words and some odd spacing      '";
          const result = parse(message);
          expect(result.changes[0].current).toBe("This is a long message with multiple words and some odd spacing      ");
        });

        it("strips trailing spaces without quotes for attribute values", () => {
          const message = "!setattr --sel --description|Some text with trailing spaces   ";
          const result = parse(message);
          expect(result.changes[0].current).toBe("Some text with trailing spaces");
        });

        it("handles quotes in both current and max values", () => {
          const message = "!setattr --sel --stat|'Current Value   '|'Max Value   '";
          const result = parse(message);
          expect(result.changes[0].current).toBe("Current Value   ");
          expect(result.changes[0].max).toBe("Max Value   ");
        });

        it("strips double quotes from attribute values", () => {
          const message = "!setattr --sel --name|\"Character Name\"";
          const result = parse(message);
          expect(result.changes[0].current).toBe("Character Name");
        });

        it("handles empty values with quotes", () => {
          const message = "!setattr --sel --empty|''";
          const result = parse(message);
          expect(result.changes[0].current).toBe("");
        });

        it("handles values with only spaces inside quotes", () => {
          const message = "!setattr --sel --spaces|'   '";
          const result = parse(message);
          expect(result.changes[0].current).toBe("   ");
        });
      });

      describe("complex quote scenarios", () => {
        it("handles multiple attributes with mixed quote usage", () => {
          const message = "!setattr --sel --name|'John Doe' --hp|25 --description|'A brave warrior   ' --ac|\"18\"";
          const result = parse(message);
          expect(result.changes).toHaveLength(4);
          expect(result.changes[0].current).toBe("John Doe");
          expect(result.changes[1].current).toBe("25");
          expect(result.changes[2].current).toBe("A brave warrior   ");
          expect(result.changes[3].current).toBe("18");
        });

        it("handles nested quotes correctly", () => {
          const message = "!setattr --sel --speech|'He said \"Hello there!\" loudly'";
          const result = parse(message);
          expect(result.changes[0].current).toBe("He said \"Hello there!\" loudly");
        });

        it("handles quotes with special characters and spaces", () => {
          const message = "!setattr --sel --special|'@^$% special chars   '";
          const result = parse(message);
          expect(result.changes[0].current).toBe("@^$% special chars   ");
        });
      });

      describe("edge cases", () => {
        it("handles single quote character as value", () => {
          const message = "!setattr --sel --apostrophe|\"'\"";
          const result = parse(message);
          expect(result.changes[0].current).toBe("'");
        });

        it("handles double quote character as value", () => {
          const message = "!setattr --sel --quote|'\"'";
          const result = parse(message);
          expect(result.changes[0].current).toBe("\"");
        });

        it("ignores unmatched quotes", () => {
          const message = "!setattr --sel --unmatched|'missing end quote";
          const result = parse(message);
          expect(result.changes[0].current).toBe("'missing end quote");
        });
      });
    });
  });
});