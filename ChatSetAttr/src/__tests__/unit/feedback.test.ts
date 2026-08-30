import { describe, it, expect } from "vitest";
import {
  createFeedbackMessage,
  formatDeleteFeedback,
  formatSettingFeedback,
} from "../../modules/feedback";
import type { Attribute, AttributeRecord, FeedbackObject } from "../../types";

const characterName = "The Aaron 2014";

describe("createFeedbackMessage", () => {
  const mockStartingValues: AttributeRecord = {
    hp: 10,
    hp_max: 20,
    strength: 15,
    strength_max: 18
  };

  const mockTargetValues: AttributeRecord = {
    hp: 25,
    hp_max: 30,
    strength: 16,
    strength_max: 20
  };

  it("should return empty string when feedback is undefined", () => {
    const result = createFeedbackMessage("John", undefined, mockStartingValues, mockTargetValues);
    expect(result).toBe("");
  });

  it("should return feedback content when no placeholders exist", () => {
    const feedback: FeedbackObject = { public: false, content: "Simple message" };
    const result = createFeedbackMessage("John", feedback, mockStartingValues, mockTargetValues);
    expect(result).toBe("Simple message");
  });

  it("should replace _CHARNAME_ with character name", () => {
    const feedback: FeedbackObject = { public: false, content: "Hello _CHARNAME_!" };
    const result = createFeedbackMessage("John", feedback, mockStartingValues, mockTargetValues);
    expect(result).toBe("Hello John!");
  });

  it("should replace _NAME0_ with first attribute name", () => {
    const feedback: FeedbackObject = { public: false, content: "Changed _NAME0_" };
    const result = createFeedbackMessage("John", feedback, mockStartingValues, mockTargetValues);
    expect(result).toBe("Changed hp");
  });

  it("should replace _TCUR0_ with starting current value", () => {
    const feedback: FeedbackObject = { public: false, content: "From _TCUR0_" };
    const result = createFeedbackMessage("John", feedback, mockStartingValues, mockTargetValues);
    expect(result).toBe("From 10");
  });

  it("should replace _TMAX0_ with starting max value", () => {
    const feedback: FeedbackObject = { public: false, content: "Max was _TMAX0_" };
    const result = createFeedbackMessage("John", feedback, mockStartingValues, mockTargetValues);
    expect(result).toBe("Max was 20");
  });

  it("should replace _CUR0_ with target current value", () => {
    const feedback: FeedbackObject = { public: false, content: "Now _CUR0_" };
    const result = createFeedbackMessage("John", feedback, mockStartingValues, mockTargetValues);
    expect(result).toBe("Now 25");
  });

  it("should replace _MAX0_ with target max value", () => {
    const feedback: FeedbackObject = { public: false, content: "Max now _MAX0_" };
    const result = createFeedbackMessage("John", feedback, mockStartingValues, mockTargetValues);
    expect(result).toBe("Max now 30");
  });

  it("should handle multiple placeholders in one message", () => {
    const feedback: FeedbackObject = {
      public: false,
      content: "_CHARNAME_: _NAME0_ changed from _TCUR0_ to _CUR0_ (max: _TMAX0_ to _MAX0_)"
    };
    const result = createFeedbackMessage("John", feedback, mockStartingValues, mockTargetValues);
    expect(result).toBe("John: hp changed from 10 to 25 (max: 20 to 30)");
  });

  it("should handle different attribute indices", () => {
    const feedback: FeedbackObject = { public: false, content: "_NAME1_ is _CUR1_" };
    const result = createFeedbackMessage("John", feedback, mockStartingValues, mockTargetValues);
    expect(result).toBe("strength is 16");
  });

  it("should return empty string for invalid attribute index", () => {
    const feedback: FeedbackObject = { public: false, content: "_NAME99_" };
    const result = createFeedbackMessage("John", feedback, mockStartingValues, mockTargetValues);
    expect(result).toBe("");
  });

  it("should fall back to starting max when max was not modified", () => {
    const startingValues: AttributeRecord = { hp: 7, hp_max: 119 };
    const targetValues: AttributeRecord = { hp: 10 };
    const feedback: FeedbackObject = {
      public: false,
      content: "_NAME0_ was _TCUR0_/_TMAX0_ now _CUR0_/_MAX0_ for _CHARNAME_",
    };
    const result = createFeedbackMessage("The Aaron 2014", feedback, startingValues, targetValues);
    expect(result).toBe("hp was 7/119 now 10/119 for The Aaron 2014");
  });

  it("should fall back to starting current when current was not modified", () => {
    const startingValues: AttributeRecord = { hp: 7, hp_max: 119 };
    const targetValues: AttributeRecord = { hp_max: 125 };
    const feedback: FeedbackObject = { public: false, content: "_CUR0_/_MAX0_" };
    const result = createFeedbackMessage("John", feedback, startingValues, targetValues);
    expect(result).toBe("7/125");
  });

  it("should handle missing max attributes gracefully", () => {
    const limitedStarting: AttributeRecord = { hp: 10 };
    const limitedTarget: AttributeRecord = { hp: 25 };
    const feedback: FeedbackObject = { public: false, content: "_TMAX0_ to _MAX0_" };
    const result = createFeedbackMessage("John", feedback, limitedStarting, limitedTarget);
    expect(result).toBe(" to ");
  });

  it("should handle empty target values", () => {
    const feedback: FeedbackObject = { public: false, content: "_NAME0_" };
    const result = createFeedbackMessage("John", feedback, mockStartingValues, {});
    expect(result).toBe("");
  });

  it("should handle complex message with multiple attributes", () => {
    const feedback: FeedbackObject = {
      public: false,
      content: "_CHARNAME_ updated: _NAME0_: _TCUR0_→_CUR0_, _NAME1_: _TCUR1_→_CUR1_"
    };
    const result = createFeedbackMessage("Alice", feedback, mockStartingValues, mockTargetValues);
    expect(result).toBe("Alice updated: hp: 10→25, strength: 15→16");
  });
});

describe("formatSettingFeedback", () => {
  it("should format max-only syntax", () => {
    const changes: Attribute[] = [{ name: "hp", max: "48" }];
    const result: AttributeRecord = { hp_max: "48" };
    expect(formatSettingFeedback(characterName, changes, result)).toBe(
      "Setting hp to 48 (max) for character The Aaron 2014.",
    );
  });

  it("should format current and max", () => {
    const changes: Attribute[] = [{ name: "hp", current: "13", max: "63" }];
    const result: AttributeRecord = { hp: "13", hp_max: "63" };
    expect(formatSettingFeedback(characterName, changes, result)).toBe(
      "Setting hp to 13 / 63 for character The Aaron 2014.",
    );
  });

  it("should format multiple attributes in command order", () => {
    const changes: Attribute[] = [
      { name: "hp", current: "13", max: "63" },
      { name: "ac", current: "18" },
      { name: "speed", current: "50" },
    ];
    const result: AttributeRecord = {
      hp: "13",
      hp_max: "63",
      ac: "18",
      speed: "50",
    };
    expect(formatSettingFeedback(characterName, changes, result)).toBe(
      "Setting hp to 13 / 63, ac to 18, speed to 50 for character The Aaron 2014.",
    );
  });

  it("should format current-only changes", () => {
    const changes: Attribute[] = [{ name: "ac", current: "18" }];
    const result: AttributeRecord = { ac: "18" };
    expect(formatSettingFeedback(characterName, changes, result)).toBe(
      "Setting ac to 18 for character The Aaron 2014.",
    );
  });

  it("should show (empty) for empty string values", () => {
    const changes: Attribute[] = [{ name: "notes", current: "" }];
    const result: AttributeRecord = { notes: "" };
    expect(formatSettingFeedback(characterName, changes, result)).toBe(
      "Setting notes to (empty) for character The Aaron 2014.",
    );
  });

  it("should omit attributes not present in the filtered result", () => {
    const changes: Attribute[] = [{ name: "hp", current: "13", max: "63" }];
    const result: AttributeRecord = { hp: "13" };
    expect(formatSettingFeedback(characterName, changes, result)).toBe(
      "Setting hp to 13 for character The Aaron 2014.",
    );
  });

  it("should return null when nothing was set", () => {
    const changes: Attribute[] = [{ name: "hp", current: "13" }];
    expect(formatSettingFeedback(characterName, changes, {})).toBeNull();
  });
});

describe("formatDeleteFeedback", () => {
  it("should format deleted attribute names", () => {
    const changes: Attribute[] = [{ name: "hp" }, { name: "ac" }];
    const result: AttributeRecord = { hp: undefined, hp_max: undefined, ac: undefined };
    expect(formatDeleteFeedback(characterName, changes, result)).toBe(
      "Deleting attribute(s) hp, ac for character The Aaron 2014.",
    );
  });

  it("should return null when no attributes were deleted", () => {
    const changes: Attribute[] = [{ name: "hp" }];
    expect(formatDeleteFeedback(characterName, changes, {})).toBeNull();
  });
});
