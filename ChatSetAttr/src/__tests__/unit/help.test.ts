import { describe, it, expect, beforeEach, vi } from "vitest";

import { getConfig } from "../../modules/config";
import {
  applyHelpContentToHandout,
  checkHelpMessage,
  handleHelpCommand,
  syncHelpHandoutOnStartup,
} from "../../modules/help";
import { getBundledHelpContentUpdatedAt } from "../../templates/help/loadContentRevision";

vi.mock("../../templates/help/index", () => ({
  createHelpHandout: vi.fn(() => "<div>help content</div>"),
}));

describe("help", () => {
  const bundledAt = getBundledHelpContentUpdatedAt();
  const mockSet = vi.fn();

  function mockHandout(id = "handout-1") {
    return { id, set: mockSet };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    global.state = { ChatSetAttr: {} };
    global.findObjs = vi.fn(() => []);
    global.createObj = vi.fn((_type, props) => mockHandout("new-handout"));
  });

  describe("checkHelpMessage", () => {
    it("should accept !setattr-help", () => {
      expect(checkHelpMessage("!setattr-help")).toBe(true);
      expect(checkHelpMessage("  !setattr-help extra")).toBe(true);
    });

    it("should reject !setattrs-help", () => {
      expect(checkHelpMessage("!setattrs-help")).toBe(false);
    });
  });

  describe("syncHelpHandoutOnStartup", () => {
    it("should do nothing when the help handout does not exist", () => {
      syncHelpHandoutOnStartup();

      expect(global.findObjs).toHaveBeenCalled();
      expect(mockSet).not.toHaveBeenCalled();
      expect(getConfig().helpContentUpdatedAt).toBe(0);
    });

    it("should not update when state revision is current", () => {
      global.findObjs = vi.fn(() => [mockHandout()]);
      global.state = { ChatSetAttr: { helpContentUpdatedAt: bundledAt } };

      syncHelpHandoutOnStartup();

      expect(mockSet).not.toHaveBeenCalled();
      expect(getConfig().helpContentUpdatedAt).toBe(bundledAt);
    });

    it("should update when state revision is older than bundled revision", () => {
      const handout = mockHandout();
      global.findObjs = vi.fn(() => [handout]);
      global.state = { ChatSetAttr: { helpContentUpdatedAt: 0 } };

      syncHelpHandoutOnStartup();

      expect(mockSet).toHaveBeenCalledWith({
        inplayerjournals: "all",
        notes: "<div>help content</div>",
      });
      expect(getConfig().helpContentUpdatedAt).toBe(bundledAt);
    });
  });

  describe("handleHelpCommand", () => {
    it("should create a handout when none exists", () => {
      handleHelpCommand();

      expect(global.createObj).toHaveBeenCalledWith("handout", {
        name: "ChatSetAttr Help",
      });
      expect(mockSet).toHaveBeenCalledWith({
        inplayerjournals: "all",
        notes: "<div>help content</div>",
      });
      expect(getConfig().helpContentUpdatedAt).toBe(bundledAt);
    });

    it("should update an existing handout without creating a duplicate", () => {
      const handout = mockHandout("existing-handout");
      global.findObjs = vi.fn(() => [handout]);

      handleHelpCommand();

      expect(global.createObj).not.toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({
        inplayerjournals: "all",
        notes: "<div>help content</div>",
      });
      expect(getConfig().helpContentUpdatedAt).toBe(bundledAt);
    });
  });

  describe("applyHelpContentToHandout", () => {
    it("should write rendered content and persist bundled revision in state", () => {
      const handout = mockHandout("apply-handout");

      applyHelpContentToHandout(handout as Roll20Handout);

      expect(mockSet).toHaveBeenCalledWith({
        inplayerjournals: "all",
        notes: "<div>help content</div>",
      });
      expect(getConfig().helpContentUpdatedAt).toBe(bundledAt);
    });
  });
});
