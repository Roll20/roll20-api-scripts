import { describe, it, expect, beforeEach, vi } from "vitest";

import { checkGlobalConfig, getConfig, persistStateVersionMetadata, syncScriptVersion } from "../../modules/config";
import { syncHelpHandoutOnStartup } from "../../modules/help";
import { registerHandlers } from "../../modules/main";
import { update, welcome } from "../../modules/versioning";
import { getBundledHelpContentUpdatedAt } from "../../templates/help/loadContentRevision";

vi.mock("../../templates/help/index", () => ({
  createHelpHandout: vi.fn(() => "<div>help content</div>"),
}));

vi.mock("../../templates/welcome", () => ({
  createWelcomeMessage: vi.fn(() => "<div>welcome</div>"),
}));

vi.mock("../../templates/versions/2.0.0", () => ({
  createVersionMessage: vi.fn(() => "<div>version</div>"),
}));

function runStartupSequence(): void {
  checkGlobalConfig();
  registerHandlers();
  syncHelpHandoutOnStartup();
  syncScriptVersion();
  update();
  welcome();
  persistStateVersionMetadata();
}

function installRoll20LikeState(initial: Record<string, unknown>) {
  const persisted: Record<string, unknown> = structuredClone(initial);
  const live = new Proxy(structuredClone(initial), {
    set(target, prop, value) {
      target[prop as string] = value;
      persisted[prop as string] = value;
      return true;
    },
    deleteProperty(target, prop) {
      delete target[prop as string];
      delete persisted[prop as string];
      return true;
    },
  });

  global.state = {} as typeof global.state;
  Object.defineProperty(global.state, "ChatSetAttr", {
    enumerable: true,
    configurable: true,
    get() {
      return live;
    },
    set(replacement: Record<string, unknown>) {
      for (const key of Object.keys(live)) {
        delete live[key as keyof typeof live];
        delete persisted[key];
      }
      Object.assign(live, replacement);
    },
  });

  return persisted;
}

function expectPersistedVersionMetadata(): void {
  expect(Object.hasOwn(global.state.ChatSetAttr, "version")).toBe(true);
  expect(Object.hasOwn(global.state.ChatSetAttr, "scriptVersion")).toBe(true);
  expect(global.state.ChatSetAttr.version).toBe(4);
  expect(global.state.ChatSetAttr.scriptVersion).toBe("2.0");
}

describe("startup state persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.globalconfig = {};
    global.findObjs = vi.fn(() => []);
    global.createObj = vi.fn();
    global.playerIsGM = vi.fn(() => true);
  });

  it("should expose that getConfig masks missing version keys in raw state", () => {
    global.state = {
      ChatSetAttr: {
        useWorkers: false,
        playersCanTargetParty: false,
      },
    };

    expect(getConfig().version).toBe(4);
    expect(getConfig().scriptVersion).toBe("2.0");
    expect(Object.hasOwn(global.state.ChatSetAttr, "version")).toBe(false);
    expect(Object.hasOwn(global.state.ChatSetAttr, "scriptVersion")).toBe(false);
  });

  it("should persist version and scriptVersion after startup when schema version is missing", () => {
    global.state = {
      ChatSetAttr: {
        useWorkers: false,
        playersCanTargetParty: false,
        globalconfigCache: {
          lastsaved: 1781273463973,
        },
        helpContentUpdatedAt: 1781273463973,
        flags: ["welcome"],
      },
    };

    runStartupSequence();

    expectPersistedVersionMetadata();
  });

  it("should persist version and scriptVersion after startup for legacy schema 3 state", () => {
    global.state = {
      ChatSetAttr: {
        version: 3,
        useWorkers: true,
        playersCanModify: false,
      },
    };

    runStartupSequence();

    expectPersistedVersionMetadata();
  });

  it("should persist version and scriptVersion after startup for empty ChatSetAttr state", () => {
    global.state = {
      ChatSetAttr: {},
    };

    runStartupSequence();

    expectPersistedVersionMetadata();
  });

  it("should persist version and scriptVersion after help handout sync on startup", () => {
    const bundledAt = getBundledHelpContentUpdatedAt();
    const mockSet = vi.fn();
    global.findObjs = vi.fn(() => [{ id: "help-handout", set: mockSet }]);
    global.state = {
      ChatSetAttr: {
        helpContentUpdatedAt: 0,
        globalconfigCache: { lastsaved: 0 },
      },
    };

    runStartupSequence();

    expect(mockSet).toHaveBeenCalled();
    expect(global.state.ChatSetAttr.helpContentUpdatedAt).toBe(bundledAt);
    expectPersistedVersionMetadata();
  });

  it("should persist version metadata on the Roll20 state snapshot when keys are set in place", () => {
    const persisted = installRoll20LikeState({
      useWorkers: false,
      playersCanTargetParty: false,
      helpContentUpdatedAt: 1781273463973,
      flags: ["welcome"],
    });

    runStartupSequence();

    expect(Object.hasOwn(persisted, "version")).toBe(true);
    expect(Object.hasOwn(persisted, "scriptVersion")).toBe(true);
    expect(persisted.version).toBe(4);
    expect(persisted.scriptVersion).toBe("2.0");
  });
});
