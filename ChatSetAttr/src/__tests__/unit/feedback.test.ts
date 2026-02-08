import { describe, it, expect } from "vitest";
import { createFeedbackMessage } from "../../modules/feedback";
import type { AttributeRecord, FeedbackObject } from "../../types";

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

  it("should handle missing max attributes gracefully", () => {
    const limitedStarting: AttributeRecord = { hp: 10 };
    const limitedTarget: AttributeRecord = { hp: 25 };
    const feedback: FeedbackObject = { public: false, content: "_TMAX0_ to _MAX0_" };
    const result = createFeedbackMessage("John", feedback, limitedStarting, limitedTarget);
    expect(result).toBe("undefined to undefined");
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
