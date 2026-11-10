import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resetAllObjects } from "../../__mocks__/apiObjects.mock";
import { resetAllCallbacks } from "../../__mocks__/eventHandling.mock";

describe("Malformed command handling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    vi.doUnmock("../../modules/message");
    resetAllObjects();
    resetAllCallbacks();
  });

  it("should report a parse error instead of crashing when parseMessage fails", async () => {
    vi.resetModules();
    vi.doMock("../../modules/message", async (importOriginal) => {
      const actual = await importOriginal<typeof import("../../modules/message")>();
      return {
        ...actual,
        parseMessage: vi.fn(() => undefined),
      };
    });

    const ChatSetAttr = await import("../../modules/main");
    ChatSetAttr.registerHandlers();

    createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
    vi.mocked(global.playerIsGM).mockReturnValue(true);
    vi.mocked(sendChat).mockClear();

    expect(() => executeCommand("!setattr --sel --hp|1")).not.toThrow();

    await vi.waitFor(() => {
      const parseErrorCall = vi.mocked(sendChat).mock.calls.find(call =>
        typeof call[1] === "string" &&
        /Could not parse command/i.test(call[1]),
      );
      expect(parseErrorCall).toBeDefined();
    });
  });
});
