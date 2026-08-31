import { it, expect, describe } from "vitest";
import { toStringOrUndefined, calculateBoundValue, cleanValue } from "../../modules/helpers";

describe("toStringOrUndefined", () => {
  it("returns undefined for undefined input", () => {
    expect(toStringOrUndefined(undefined)).toBeUndefined();
  });

  it("returns undefined for null input", () => {
    expect(toStringOrUndefined(null)).toBeUndefined();
  });

  it("converts numbers to strings", () => {
    expect(toStringOrUndefined(42)).toBe("42");
  });

  it("converts booleans to strings", () => {
    expect(toStringOrUndefined(true)).toBe("true");
    expect(toStringOrUndefined(false)).toBe("false");
  });

  it("returns strings unchanged", () => {
    expect(toStringOrUndefined("hello")).toBe("hello");
  });
});

describe("calculateBoundValue", () => {
  it("returns 0 when value and max are undefined", () => {
    expect(calculateBoundValue(undefined, undefined)).toBe(0);
  });

  it("returns the value when max is undefined", () => {
    expect(calculateBoundValue(10, undefined)).toBe(10);
  });

  it("returns 0 when value is undefined", () => {
    expect(calculateBoundValue(undefined, 20)).toBe(0);
  });

  it("returns the value when it is less than max", () => {
    expect(calculateBoundValue(15, 20)).toBe(15);
  });

  it("returns max when value exceeds max", () => {
    expect(calculateBoundValue(25, 20)).toBe(20);
  });
});

describe("cleanValue", () => {
  it("trims whitespace from the value", () => {
    expect(cleanValue("  hello world  ")).toBe("hello world");
  });

  it("removes surrounding single quotes", () => {
    expect(cleanValue("'hello'")).toBe("hello");
    expect(cleanValue("  'hello'  ")).toBe("hello");
  });

  it("removes surrounding double quotes", () => {
    expect(cleanValue("\"hello\"")).toBe("hello");
    expect(cleanValue("  \"hello\"  ")).toBe("hello");
  });

  it("removes surrounding mixed quotes", () => {
    expect(cleanValue("'hello\"")).toBe("hello");
    expect(cleanValue("\"hello'")).toBe("hello");
  });

  it("maintains spacing within the value", () => {
    expect(cleanValue("  '  hello   world  '  ")).toBe("  hello   world  ");
  });

  it("only replaces surrounding quotes", () => {
    expect(cleanValue("  \"he'llo\"  ")).toBe("he'llo");
    expect(cleanValue("  'he\"llo'  ")).toBe("he\"llo");
  });

  it("handles symbols and special characters in quotes", () => {
    expect(cleanValue("'@#$% special chars   '")).toBe("@#$% special chars   ");
    expect(cleanValue("\"1234!@#$%^&*()_+\"")).toBe("1234!@#$%^&*()_+");
  });
});
