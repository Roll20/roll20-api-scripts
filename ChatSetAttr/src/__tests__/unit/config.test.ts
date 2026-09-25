import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkGlobalConfig,
  getConfig,
  getPersistedSchemaVersion,
  getStateSchemaVersion,
  persistStateVersionMetadata,
  setConfig,
  syncScriptVersion,
} from "../../modules/config";

const GLOBAL_CONFIG_LABELS = {
  playersCanModify: "Players can modify all characters",
  playersCanEvaluate: "Players can use --evaluate",
  useWorkers: "Trigger sheet workers when setting attributes",
  playersCanTargetParty: "Players can target party members",
} as const;

function buildGlobalConfig(
  options: Partial<Record<keyof typeof GLOBAL_CONFIG_LABELS, boolean>>,
  lastsaved = 2000,
) {
  const chatsetattr: Record<string, string | number> = { lastsaved };
  for (const [key, label] of Object.entries(GLOBAL_CONFIG_LABELS)) {
    chatsetattr[label] = options[key as keyof typeof GLOBAL_CONFIG_LABELS] ? key : "";
  }
  return { chatsetattr };
}

describe("config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.globalconfig = {};
    global.state = {
      ChatSetAttr: {},
    };
  });

  describe("getStateSchemaVersion", () => {
    it("should return 0 for missing values", () => {
      expect(getStateSchemaVersion(undefined)).toBe(0);
      expect(getStateSchemaVersion(null)).toBe(0);
    });

    it("should return numeric schema versions as-is", () => {
      expect(getStateSchemaVersion(3)).toBe(3);
      expect(getStateSchemaVersion(4)).toBe(4);
    });

    it("should return numeric strings as schema versions", () => {
      expect(getStateSchemaVersion("3")).toBe(3);
      expect(getStateSchemaVersion("4")).toBe(4);
    });

    it("should return 0 for non-numeric version strings", () => {
      expect(getStateSchemaVersion("1.10")).toBe(0);
      expect(getStateSchemaVersion("2.0")).toBe(0);
    });
  });

  describe("getPersistedSchemaVersion", () => {
    it("should return 0 when version is missing", () => {
      global.state.ChatSetAttr = {
        flags: ["welcome"],
        helpContentUpdatedAt: 123,
      };
      expect(getPersistedSchemaVersion()).toBe(0);
    });

    it("should return persisted schema version when present", () => {
      global.state.ChatSetAttr = { version: 3 };
      expect(getPersistedSchemaVersion()).toBe(3);

      global.state.ChatSetAttr = { version: 4 };
      expect(getPersistedSchemaVersion()).toBe(4);
    });
  });

  describe("persistStateVersionMetadata", () => {
    it("should persist only scriptVersion when schema version is missing", () => {
      global.state.ChatSetAttr = {
        flags: ["welcome"],
        helpContentUpdatedAt: 1781273463973,
        useWorkers: false,
      };

      persistStateVersionMetadata();

      expect(Object.hasOwn(global.state.ChatSetAttr, "version")).toBe(false);
      expect(global.state.ChatSetAttr.scriptVersion).toBe("2.0");
    });

    it("should persist normalized schema version and scriptVersion when version is stored as a string", () => {
      global.state.ChatSetAttr = { version: "3" };

      persistStateVersionMetadata();

      expect(global.state.ChatSetAttr.version).toBe(3);
      expect(global.state.ChatSetAttr.scriptVersion).toBe("2.0");
    });

    it("should persist scriptVersion when schema version is already stored", () => {
      global.state.ChatSetAttr = { version: 4 };

      persistStateVersionMetadata();

      expect(global.state.ChatSetAttr.version).toBe(4);
      expect(global.state.ChatSetAttr.scriptVersion).toBe("2.0");
    });
  });

  describe("syncScriptVersion", () => {
    it("should persist script.json version in state", () => {
      global.state.ChatSetAttr = { scriptVersion: "1.10" };

      syncScriptVersion();

      expect(global.state.ChatSetAttr.scriptVersion).toBe("2.0");
    });

    it("should not write state when script version and schema version are already current", () => {
      global.state.ChatSetAttr = { version: 4, scriptVersion: "2.0" };
      const before = { ...global.state.ChatSetAttr };

      syncScriptVersion();

      expect(global.state.ChatSetAttr).toEqual(before);
    });
  });

  describe("getConfig", () => {
    it("should return default config when no state config exists", () => {
      // Clear the state entirely
      global.state = {};

      const config = getConfig();

      expect(config).toEqual({
        version: 4,
        scriptVersion: "2.0",
        globalconfigCache: {
          lastsaved: 0
        },
        playersCanTargetParty: true,
        playersCanModify: false,
        playersCanEvaluate: false,
        useWorkers: true,
        helpContentUpdatedAt: 0,
        flags: []
      });
    });

    it("should return default config when ChatSetAttr state is undefined", () => {
      global.state = { ChatSetAttr: undefined };


      const config = getConfig();

      expect(config).toEqual({
        version: 4,
        scriptVersion: "2.0",
        globalconfigCache: {
          lastsaved: 0
        },
        playersCanTargetParty: true,
        playersCanModify: false,
        playersCanEvaluate: false,
        useWorkers: true,
        helpContentUpdatedAt: 0,
        flags: []
      });
    });

    it("should return default config when config property is undefined", () => {
      global.state = { ChatSetAttr: {} };

      const config = getConfig();

      expect(config).toEqual({
        version: 4,
        scriptVersion: "2.0",
        globalconfigCache: {
          lastsaved: 0
        },
        playersCanTargetParty: true,
        playersCanModify: false,
        playersCanEvaluate: false,
        useWorkers: true,
        helpContentUpdatedAt: 0,
        flags: []
      });
    });

    it("should merge state config with default config", () => {
      global.state.ChatSetAttr = {
        playersCanModify: true,
        playersCanEvaluate: true
      };

      const config = getConfig();

      expect(config).toEqual({
        version: 4,
        scriptVersion: "2.0",
        globalconfigCache: {
          lastsaved: 0
        },
        playersCanTargetParty: true,
        playersCanModify: true,
        playersCanEvaluate: true,
        useWorkers: true,
        helpContentUpdatedAt: 0,
        flags: []
      });
    });

    it("should override default values with state values", () => {
      global.state.ChatSetAttr = {
        version: 4,
        playersCanModify: true,
        playersCanEvaluate: true,
        useWorkers: false,
        globalconfigCache: {
          lastsaved: 1234567890
        }
      };

      const config = getConfig();

      expect(config).toEqual({
        version: 4,
        scriptVersion: "2.0",
        globalconfigCache: {
          lastsaved: 1234567890
        },
        playersCanTargetParty: true,
        playersCanModify: true,
        playersCanEvaluate: true,
        useWorkers: false,
        helpContentUpdatedAt: 0,
        flags: []
      });
    });

    it("should handle partial globalconfigCache override", () => {
      global.state.ChatSetAttr = {
        globalconfigCache: {
          lastsaved: 9876543210
        }
      };

      const config = getConfig();

      expect(config.globalconfigCache).toEqual({
        lastsaved: 9876543210
      });
      expect(config.version).toBe(4);
      expect(config.playersCanModify).toBe(false);
    });

    it("should handle extra properties in state config", () => {
      global.state.ChatSetAttr = {
        playersCanModify: true,
        extraProperty: "should be included",
        anotherExtra: 42
      };

      const config = getConfig();

      expect(config).toEqual({
        version: 4,
        scriptVersion: "2.0",
        globalconfigCache: {
          lastsaved: 0
        },
        playersCanTargetParty: true,
        playersCanModify: true,
        playersCanEvaluate: false,
        useWorkers: true,
        helpContentUpdatedAt: 0,
        flags: [],
        extraProperty: "should be included",
        anotherExtra: 42
      });
    });

    it("should return a new object each time (not reference to state)", () => {
      const config1 = getConfig();
      const config2 = getConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe("setConfig", () => {
    it("should set config in empty state", () => {
      global.state = {};

      setConfig({ playersCanModify: true });

      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.globalconfigCache).toBeUndefined();
    });

    it("should initialize ChatSetAttr when undefined", () => {
      global.state = { ChatSetAttr: undefined };

      setConfig({ playersCanEvaluate: true });

      expect(global.state.ChatSetAttr.playersCanEvaluate).toBe(true);
      expect(global.state.ChatSetAttr.globalconfigCache).toBeUndefined();
    });

    it("should merge new config with existing config", () => {
      global.state.ChatSetAttr = {
        playersCanModify: true,
        version: 2,
      };

      setConfig({ playersCanEvaluate: true });

      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.version).toBe(2);
      expect(global.state.ChatSetAttr.playersCanEvaluate).toBe(true);
    });

    it("should override existing config values", () => {
      global.state.ChatSetAttr = {
        playersCanModify: false,
        playersCanEvaluate: false,
        useWorkers: true,
      };

      setConfig({
        playersCanModify: true,
        useWorkers: false,
      });

      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.playersCanEvaluate).toBe(false);
      expect(global.state.ChatSetAttr.useWorkers).toBe(false);
    });

    it("should not modify globalconfigCache unless explicitly provided", () => {
      global.state.ChatSetAttr = {
        globalconfigCache: {
          lastsaved: 1000,
        },
      };

      setConfig({ playersCanModify: true });

      expect(global.state.ChatSetAttr.globalconfigCache).toEqual({
        lastsaved: 1000,
      });
    });

    it("should preserve other ChatSetAttr properties", () => {
      global.state = {
        ChatSetAttr: {
          playersCanModify: false,
          otherProperty: "should be preserved",
          anotherProp: 123
        }
      };


      setConfig({ playersCanEvaluate: true });

      expect(global.state.ChatSetAttr.playersCanModify).toBe(false);
      expect(global.state.ChatSetAttr.playersCanEvaluate).toBe(true);
      expect(global.state.ChatSetAttr.otherProperty).toBe("should be preserved");
      expect(global.state.ChatSetAttr.anotherProp).toBe(123);
    });

    it("should handle empty config object", () => {
      global.state.ChatSetAttr = {
        playersCanModify: true,
        globalconfigCache: {
          lastsaved: 500,
        },
      };

      setConfig({});

      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.globalconfigCache).toEqual({ lastsaved: 500 });
    });

    it("should handle null and undefined values", () => {
      global.state.ChatSetAttr = {
        playersCanModify: true,
      };

      setConfig({
        playersCanEvaluate: null,
        useWorkers: undefined,
        version: 0,
      });

      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.playersCanEvaluate).toBe(null);
      expect(global.state.ChatSetAttr.useWorkers).toBe(undefined);
      expect(global.state.ChatSetAttr.version).toBe(0);
    });

    it("should handle various data types", () => {
      setConfig({
        stringProp: "test",
        numberProp: 42,
        booleanProp: true,
        arrayProp: [1, 2, 3],
        objectProp: { nested: "value" },
        nullProp: null,
        undefinedProp: undefined,
      });

      expect(global.state.ChatSetAttr.stringProp).toBe("test");
      expect(global.state.ChatSetAttr.numberProp).toBe(42);
      expect(global.state.ChatSetAttr.booleanProp).toBe(true);
      expect(global.state.ChatSetAttr.arrayProp).toEqual([1, 2, 3]);
      expect(global.state.ChatSetAttr.objectProp).toEqual({ nested: "value" });
      expect(global.state.ChatSetAttr.nullProp).toBe(null);
      expect(global.state.ChatSetAttr.undefinedProp).toBe(undefined);
    });
  });

  describe("checkGlobalConfig", () => {
    it("should do nothing when globalconfig is missing", () => {
      global.globalconfig = {};

      const changes = checkGlobalConfig();

      expect(changes).toEqual([]);
      expect(global.sendChat).not.toHaveBeenCalled();
    });

    it("should do nothing when globalconfig timestamp is stale", () => {
      global.state.ChatSetAttr = {
        globalconfigCache: {
          lastsaved: 2000,
          [GLOBAL_CONFIG_LABELS.useWorkers]: "useWorkers",
        },
        playersCanModify: true,
      };
      global.globalconfig = buildGlobalConfig({ useWorkers: true }, 1000);

      const changes = checkGlobalConfig();

      expect(changes).toEqual([]);
      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.sendChat).not.toHaveBeenCalled();
    });

    it("should update cache but not runtime when script is re-saved without option changes", () => {
      global.state.ChatSetAttr = {
        globalconfigCache: {
          lastsaved: 1000,
          [GLOBAL_CONFIG_LABELS.playersCanModify]: "",
          [GLOBAL_CONFIG_LABELS.playersCanEvaluate]: "",
          [GLOBAL_CONFIG_LABELS.useWorkers]: "useWorkers",
          [GLOBAL_CONFIG_LABELS.playersCanTargetParty]: "",
        },
        playersCanModify: true,
      };
      global.globalconfig = buildGlobalConfig({ useWorkers: true }, 2000);

      const changes = checkGlobalConfig();

      expect(changes).toEqual([]);
      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe(2000);
      expect(global.sendChat).not.toHaveBeenCalled();
    });

    it("should import changed page values and notify the GM", () => {
      global.state.ChatSetAttr = {
        globalconfigCache: {
          lastsaved: 1000,
          [GLOBAL_CONFIG_LABELS.playersCanModify]: "",
          [GLOBAL_CONFIG_LABELS.playersCanEvaluate]: "",
          [GLOBAL_CONFIG_LABELS.useWorkers]: "useWorkers",
          [GLOBAL_CONFIG_LABELS.playersCanTargetParty]: "",
        },
      };
      global.globalconfig = buildGlobalConfig(
        { playersCanModify: true, useWorkers: true },
        2000,
      );

      const changes = checkGlobalConfig();

      expect(changes).toEqual(["playersCanModify: false → true"]);
      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe(2000);
      expect(global.sendChat).toHaveBeenCalledTimes(1);
      expect(vi.mocked(global.sendChat).mock.calls[0][1]).toContain("/w gm ");
      expect(vi.mocked(global.sendChat).mock.calls[0][1]).toContain("playersCanModify: false → true");
    });

    it("should import all changed options on first load", () => {
      global.state.ChatSetAttr = {
        globalconfigCache: {
          lastsaved: 0,
        },
      };
      global.globalconfig = buildGlobalConfig(
        {
          playersCanModify: true,
          playersCanEvaluate: true,
          useWorkers: true,
          playersCanTargetParty: true,
        },
        1500,
      );

      const changes = checkGlobalConfig();

      expect(changes).toEqual([
        "playersCanModify: false → true",
        "playersCanEvaluate: false → true",
      ]);
      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.playersCanEvaluate).toBe(true);
      expect(getConfig().playersCanTargetParty).toBe(true);
      expect(getConfig().useWorkers).toBe(true);
      expect(global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe(1500);
    });

    it("should import the fourth globalconfig option", () => {
      global.state.ChatSetAttr = {
        globalconfigCache: {
          lastsaved: 1000,
          [GLOBAL_CONFIG_LABELS.playersCanTargetParty]: "",
        },
        playersCanTargetParty: false,
      };
      global.globalconfig = buildGlobalConfig({ playersCanTargetParty: true }, 2000);

      const changes = checkGlobalConfig();

      expect(changes).toEqual(["playersCanTargetParty: false → true"]);
      expect(global.state.ChatSetAttr.playersCanTargetParty).toBe(true);
    });

    it("should not modify globalconfigCache.lastsaved when using setConfig", () => {
      global.state.ChatSetAttr = {
        globalconfigCache: {
          lastsaved: 1234,
        },
      };

      setConfig({ playersCanModify: true });

      expect(global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe(1234);
    });
  });

  describe("integration tests", () => {
    it("should work correctly when setting and getting config", () => {
      // Start with empty state
      global.state = {};


      // Set some config
      setConfig({
        playersCanModify: true,
        version: 5
      });

      // Get config should return defaults merged with set values
      const config = getConfig();

      expect(config.version).toBe(5);
      expect(config.playersCanModify).toBe(true);
      expect(config.playersCanEvaluate).toBe(false);
      expect(config.playersCanTargetParty).toBe(true);
      expect(config.useWorkers).toBe(true);
      expect(global.state.ChatSetAttr.globalconfigCache).toBeUndefined();
    });

    it("should handle multiple setConfig calls", () => {
      global.state = {};


      setConfig({ playersCanModify: true });
      setConfig({ playersCanEvaluate: true });
      setConfig({ useWorkers: false });

      const config = getConfig();

      expect(config.playersCanModify).toBe(true);
      expect(config.playersCanEvaluate).toBe(true);
      expect(config.useWorkers).toBe(false);
      expect(config.version).toBe(4); // Default value
    });

    it("should handle overriding previously set values", () => {
      global.state = {};


      setConfig({ playersCanModify: true });
      expect(getConfig().playersCanModify).toBe(true);

      setConfig({ playersCanModify: false });
      expect(getConfig().playersCanModify).toBe(false);
    });

    it("should maintain state persistence between calls", () => {
      global.state = {};


      setConfig({ playersCanModify: true });
      setConfig({ playersCanEvaluate: true });

      // Both values should persist
      const config = getConfig();
      expect(config.playersCanModify).toBe(true);
      expect(config.playersCanEvaluate).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle when state is null", () => {
      // @ts-expect-error we're deliberately setting to null
      global.state = null;


      expect(() => getConfig()).not.toThrow();
    });

    it("should handle when state is undefined", () => {
      // @ts-expect-error we're deliberately setting to undefined
      global.state = undefined;


      expect(() => getConfig()).not.toThrow();
    });

    it("should handle circular references in setConfig", () => {
      global.state = {};


      const circularObj: Record<string, unknown> = { a: 1 };
      circularObj.self = circularObj;

      expect(() => setConfig(circularObj)).not.toThrow();
    });
  });
});
