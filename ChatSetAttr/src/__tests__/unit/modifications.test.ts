import { describe, it, expect } from "vitest";
import {
  processModifierValue,
  processModifierName,
  type ProcessModifierNameOptions,
} from "../../modules/modifications";
import type { AttributeRecord } from "../../types";

describe("modifications", () => {
  describe("processModifierValue", () => {
    const mockAttributes: AttributeRecord = {
      strength: 18,
      dexterity: 14,
      constitution: 16,
      intelligence: 12,
      wisdom: 13,
      charisma: 10,
      level: 5,
      hitpoints: 45,
      armorclass: 15,
      name: "TestCharacter",
      active: true,
    };

    describe("alias character replacement", () => {
      it("should replace < with [ and > with ]", () => {
        const result = processModifierValue("<<1d6>>", {}, { shouldAlias: true });
        expect(result).toBe("[[1d6]]");
      });

      it("should replace ~ with -", () => {
        const result = processModifierValue("~value", {}, { shouldAlias: true });
        expect(result).toBe("-value");
      });

      it("should replace ; with ?", () => {
        const result = processModifierValue(";{query}", {}, { shouldAlias: true });
        expect(result).toBe("?{query}");
      });

      it("should replace ` with @", () => {
        const result = processModifierValue("`{attribute}", {}, { shouldAlias: true });
        expect(result).toBe("@{attribute}");
      });

      it("should replace multiple alias characters", () => {
        const result = processModifierValue("<<1d6>>~;{query}+`{attribute}", {}, { shouldAlias: true });
        expect(result).toBe("[[1d6]]-?{query}+@{attribute}");
      });
    });

    describe("placeholder replacement", () => {
      it("should replace single placeholder with attribute value", () => {
        const result = processModifierValue("%strength%", mockAttributes);
        expect(result).toBe("18");
      });

      it("should replace multiple placeholders", () => {
        const result = processModifierValue("%strength% + %dexterity%", mockAttributes);
        expect(result).toBe("18 + 14");
      });

      it("should handle string attribute values", () => {
        const result = processModifierValue("Hello %name%", mockAttributes);
        expect(result).toBe("Hello TestCharacter");
      });

      it("should handle boolean attribute values", () => {
        const result = processModifierValue("Active: %active%", mockAttributes);
        expect(result).toBe("Active: true");
      });

      it("should leave placeholder unchanged if attribute not found", () => {
        const result = processModifierValue("%nonexistent%", mockAttributes);
        expect(result).toBe("%nonexistent%");
      });

      it("should handle mixed existing and non-existing placeholders", () => {
        const result = processModifierValue("%strength% + %nonexistent%", mockAttributes);
        expect(result).toBe("18 + %nonexistent%");
      });

      it("should handle placeholders with underscores and numbers", () => {
        const attributes = { skill_1: 5, attr_test_2: "value" };
        const result = processModifierValue("%skill_1% and %attr_test_2%", attributes);
        expect(result).toBe("5 and value");
      });

      it("should handle empty attribute record", () => {
        const result = processModifierValue("%strength%", {});
        expect(result).toBe("%strength%");
      });
    });

    describe("evaluation", () => {
      it("should not evaluate by default", () => {
        const result = processModifierValue("2 + 3", {});
        expect(result).toBe("2 + 3");
      });

      it("should evaluate when shouldEvaluate is true", () => {
        const result = processModifierValue("2 + 3", {}, { shouldEvaluate: true });
        expect(result).toBe(5);
      });

      it("should evaluate with placeholder replacement", () => {
        const result = processModifierValue("%strength% + %dexterity%", mockAttributes, { shouldEvaluate: true });
        expect(result).toBe(32);
      });

      it("should handle complex expressions", () => {
        const result = processModifierValue("(5 + 3) * 2", {}, { shouldEvaluate: true });
        expect(result).toBe(16);
      });

      it("should return original value if evaluation fails", () => {
        const result = processModifierValue("invalid expression +++", {}, { shouldEvaluate: true });
        expect(result).toBe("invalid expression +++");
      });
    });

    describe("combined functionality", () => {
      it("should handle alias replacement, placeholders, and evaluation together", () => {
        const attributes = { base: 10, bonus: 5 };
        const result = processModifierValue("<%base%> + <%bonus%>", attributes, { shouldEvaluate: true, shouldAlias: true });
        expect(result).toBe("105"); // becomes "[10] + [5]" which evaluates to string concatenation
      });

      it("should process in correct order: aliases, then placeholders, then evaluation", () => {
        const attributes = { test: 8 };
        const result = processModifierValue("<%test%> ~ 2", attributes, { shouldEvaluate: true, shouldAlias: true });
        expect(result).toBe(6); // [8] - 2 = 6
      });
    });

    describe("edge cases", () => {
      it("should handle empty string", () => {
        const result = processModifierValue("", {});
        expect(result).toBe("");
      });

      it("should handle string with only placeholders", () => {
        const result = processModifierValue("%nonexistent%", {});
        expect(result).toBe("%nonexistent%");
      });

      it("should handle string with only alias characters", () => {
        const result = processModifierValue("<>~;`", {}, { shouldAlias: true });
        expect(result).toBe("[]-?@");
      });

      it("should handle undefined attributes gracefully", () => {
        const attributes = { test: undefined };
        const result = processModifierValue("%test%", attributes);
        expect(result).toBe("%test%");
      });

      it("should handle missing attributes as undefined", () => {
        const attributes = {};
        const result = processModifierValue("%nonexistent%", attributes);
        expect(result).toBe("%nonexistent%");
      });

      it("should handle zero values", () => {
        const attributes = { test: 0 };
        const result = processModifierValue("%test%", attributes);
        expect(result).toBe("0");
      });

      it("should handle false boolean values", () => {
        const attributes = { test: false };
        const result = processModifierValue("%test%", attributes);
        expect(result).toBe("false");
      });

      it("should handle malformed placeholders", () => {
        const result = processModifierValue("%incomplete", {});
        expect(result).toBe("%incomplete");
      });

      it("should handle nested placeholders", () => {
        const attributes = { outer: "%inner%", inner: "value" };
        const result = processModifierValue("%outer%", attributes);
        expect(result).toBe("%inner%"); // Should not recursively process
      });
    });
  });



  describe("processModifierName", () => {
    describe("CREATE replacement", () => {
      it("should replace CREATE with repeatingID when both are provided", () => {
        const options: ProcessModifierNameOptions = {
          repeatingID: "row123",
          repOrder: [""],
        };
        const result = processModifierName("repeating_skills_CREATE_name", options);
        expect(result).toBe("repeating_skills_row123_name");
      });

      it("should not replace CREATE when repeatingID is not provided", () => {
        const options: ProcessModifierNameOptions = {
          repOrder: [""],
        };
        const result = processModifierName("repeating_skills_CREATE_name", options);
        expect(result).toBe("repeating_skills_CREATE_name");
      });

      it("should not replace CREATE when repeatingID is empty", () => {
        const options: ProcessModifierNameOptions = {
          repeatingID: "",
          repOrder: [""],
        };
        const result = processModifierName("repeating_skills_CREATE_name", options);
        expect(result).toBe("repeating_skills_CREATE_name");
      });

      it("should handle multiple CREATE occurrences", () => {
        const options: ProcessModifierNameOptions = {
          repeatingID: "row456",
          repOrder: [""],
        };
        const result = processModifierName("CREATE_CREATE_name", options);
        expect(result).toBe("row456_CREATE_name"); // Only replaces first occurrence
      });

      it("should handle names without CREATE", () => {
        const options: ProcessModifierNameOptions = {
          repeatingID: "row789",
          repOrder: [""],
        };
        const result = processModifierName("regular_attribute_name", options);
        expect(result).toBe("regular_attribute_name");
      });
    });

    describe("row index replacement", () => {
      it("should replace $0 with first item from repOrder", () => {
        const options: ProcessModifierNameOptions = {
          repOrder: ["row1", "row2", "row3"],
        };
        const result = processModifierName("repeating_skills_$0_name", options);
        expect(result).toBe("repeating_skills_row1_name");
      });

      it("should replace $1 with second item from repOrder", () => {
        const options: ProcessModifierNameOptions = {
          repOrder: ["row1", "row2", "row3"],
        };
        const result = processModifierName("repeating_skills_$1_name", options);
        expect(result).toBe("repeating_skills_row2_name");
      });

      it("should replace $2 with third item from repOrder", () => {
        const options: ProcessModifierNameOptions = {
          repOrder: ["row1", "row2", "row3"],
        };
        const result = processModifierName("repeating_skills_$2_name", options);
        expect(result).toBe("repeating_skills_row3_name");
      });

      it("should handle out of bounds index gracefully", () => {
        const options: ProcessModifierNameOptions = {
          repOrder: ["row1", "row2"]
        };
        const result = processModifierName("repeating_skills_$5_name", options);
        expect(result).toBe("repeating_skills_$5_name");
      });

      it("should not replace when repOrder is empty", () => {
        const options: ProcessModifierNameOptions = {
          repOrder: [],
        };
        const result = processModifierName("repeating_skills_$0_name", options);
        expect(result).toBe("repeating_skills_$0_name");
      });

      it("should handle single item repOrder", () => {
        const options: ProcessModifierNameOptions = {
          repOrder: ["onlyrow"],
        };
        const result = processModifierName("repeating_skills_$0_name", options);
        expect(result).toBe("repeating_skills_onlyrow_name");
      });

      it("should handle names without row index patterns", () => {
        const options: ProcessModifierNameOptions = {
          repOrder: ["row1", "row2", "row3"],
        };
        const result = processModifierName("regular_attribute_name", options);
        expect(result).toBe("regular_attribute_name");
      });
    });

    describe("edge cases", () => {
      it("should handle empty name", () => {
        const options: ProcessModifierNameOptions = {
          repeatingID: "row123",
          repOrder: ["row1", "row2"],
        };
        const result = processModifierName("", options);
        expect(result).toBe("");
      });

      it("should handle name with only CREATE", () => {
        const options: ProcessModifierNameOptions = {
          repeatingID: "replacement",
          repOrder: [""],
        };
        const result = processModifierName("CREATE", options);
        expect(result).toBe("replacement");
      });

      it("should handle name with only row index", () => {
        const options: ProcessModifierNameOptions = {
          repOrder: ["first", "second"],
        };
        const result = processModifierName("$1", options);
        expect(result).toBe("second");
      });

      it("should handle options with undefined values", () => {
        const options: ProcessModifierNameOptions = {
          repeatingID: undefined,
          repOrder: [""],
        };
        const result = processModifierName("repeating_CREATE_$0_name", options);
        expect(result).toBe("repeating_CREATE_$0_name");
      });

      it("should handle special characters in repeatingID", () => {
        const options: ProcessModifierNameOptions = {
          repeatingID: "row-123_special!",
          repOrder: [""],
        };
        const result = processModifierName("repeating_CREATE_name", options);
        expect(result).toBe("repeating_row-123_special!_name");
      });

      it("should handle case sensitivity", () => {
        const options: ProcessModifierNameOptions = {
          repeatingID: "replacement",
          repOrder: [""],
        };
        const result = processModifierName("repeating_create_name", options);
        expect(result).toBe("repeating_create_name"); // Should not replace lowercase 'create'
      });
    });
  });
});