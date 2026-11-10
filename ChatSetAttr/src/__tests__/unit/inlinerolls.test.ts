import { describe, it, expect } from "vitest";
import {
  normalizeTemplateRollProperties,
  processInlinerolls,
} from "../../modules/inlinerolls";

function makeDiceRoll(total: number): RollData {
  return {
    expression: "3d6",
    results: {
      resultType: "sum",
      total,
      type: "V",
      rolls: [{
        dice: 3,
        sides: 6,
        type: "R",
        results: [{ v: 4 }, { v: 1 }, { v: 3 }],
      }],
    },
    rollid: "roll-1",
    signature: "sig-1",
  };
}

describe("processInlinerolls", () => {
  it("should replace a simple inline roll placeholder with the roll total", () => {
    const result = processInlinerolls({
      content: "!setattr --sel --hp|$[[0]]",
      inlinerolls: [makeDiceRoll(11)],
    });

    expect(result).toBe("!setattr --sel --hp|11");
  });

  it("should return content unchanged when inlinerolls are missing", () => {
    const content = "!setattr --sel --hp|$[[0]]";
    expect(processInlinerolls({ content })).toBe(content);
    expect(processInlinerolls({ content, inlinerolls: [] })).toBe(content);
  });

  it("should replace nested roll placeholders using the correct index", () => {
    const result = processInlinerolls({
      content: "!! test $[[1]]",
      inlinerolls: [
        {
          expression: "1d2+4",
          results: {
            resultType: "sum",
            total: 6,
            type: "V",
            rolls: [],
          },
          rollid: "inner-roll",
          signature: "sig-inner",
        },
        makeDiceRoll(8),
      ],
    });

    expect(result).toBe("!! test 8");
  });

  it("should replace multiple placeholders in one command", () => {
    const result = processInlinerolls({
      content: "!setattr --sel --hp|$[[0]] --temp|$[[1]]",
      inlinerolls: [makeDiceRoll(11), makeDiceRoll(5)],
    });

    expect(result).toBe("!setattr --sel --hp|11 --temp|5");
  });

  it("should use rollable table item names when present", () => {
    const result = processInlinerolls({
      content: "!setattr --sel --result|$[[0]]",
      inlinerolls: [{
        expression: "1d100",
        results: {
          resultType: "sum",
          total: 42,
          type: "V",
          rolls: [{
            table: "table-id",
            type: "R",
            results: [
              { tableItem: { name: "Magic Sword" } },
              { tableItem: { name: "Healing Potion" } },
            ],
          }],
        },
        rollid: "table-roll",
        signature: "sig-table",
      }],
    });

    expect(result).toBe("!setattr --sel --result|Magic Sword, Healing Potion");
  });

  it("should preserve a zero roll total", () => {
    const result = processInlinerolls({
      content: "!setattr --sel --hp|$[[0]]",
      inlinerolls: [makeDiceRoll(0)],
    });

    expect(result).toBe("!setattr --sel --hp|0");
  });
});

function processCommandContent(
  content: string,
  inlinerolls?: RollData[],
): string {
  return processInlinerolls({
    content: normalizeTemplateRollProperties(content),
    inlinerolls,
  });
}

describe("normalizeTemplateRollProperties", () => {
  it("should unwrap template properties containing inline roll placeholders", () => {
    const content = "!setattr --charid char1 --mod --hp|-{{damage=$[[0]]}}";
    expect(normalizeTemplateRollProperties(content)).toBe(
      "!setattr --charid char1 --mod --hp|-$[[0]]",
    );
  });

  it("should unwrap resolved template property values", () => {
    const content = "!setattr --charid char1 --hp|-{{damage=34}}";
    expect(normalizeTemplateRollProperties(content)).toBe(
      "!setattr --charid char1 --hp|-34",
    );
  });
});

describe("template roll pipeline", () => {
  it("should resolve mod damage from template inline roll placeholders", () => {
    const result = processCommandContent(
      "!setattr --charid char1 --mod --hp|-{{damage=$[[0]]}}",
      [makeDiceRoll(34)],
    );
    expect(result).toBe("!setattr --charid char1 --mod --hp|-34");
  });

  it("should resolve setattr damage from template inline roll placeholders", () => {
    const result = processCommandContent(
      "!setattr --charid char1 --hp|-{{damage=$[[0]]}}",
      [makeDiceRoll(34)],
    );
    expect(result).toBe("!setattr --charid char1 --hp|-34");
  });

  it("should resolve setattr damage from already-resolved template properties", () => {
    const result = processCommandContent(
      "!setattr --charid char1 --hp|-{{damage=34}}",
      [makeDiceRoll(34)],
    );
    expect(result).toBe("!setattr --charid char1 --hp|-34");
  });
});
