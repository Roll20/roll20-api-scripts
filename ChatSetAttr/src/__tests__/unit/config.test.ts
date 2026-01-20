import { describe, it, expect, beforeEach } from "vitest";
import { getConfig, setConfig } from "../../modules/config";

describe("config", () => {
  beforeEach(() => {
    // Reset state before each test
    global.state = {
      ChatSetAttr: {}
    };
  });

  describe("getConfig", () => {
    it("should return default config when no state config exists", () => {
      // Clear the state entirely
      global.state = {};

      const config = getConfig();

      expect(config).toEqual({
        version: "2.0",
        globalconfigCache: {
          lastsaved: 0
        },
        playersCanTargetParty: true,
        playersCanModify: false,
        playersCanEvaluate: false,
        useWorkers: true,
        flags: []
      });
    });

    it("should return default config when ChatSetAttr state is undefined", () => {
      global.state = { ChatSetAttr: undefined };


      const config = getConfig();

      expect(config).toEqual({
        version: "2.0",
        globalconfigCache: {
          lastsaved: 0
        },
        playersCanTargetParty: true,
        playersCanModify: false,
        playersCanEvaluate: false,
        useWorkers: true,
        flags: []
      });
    });

    it("should return default config when config property is undefined", () => {
      global.state = { ChatSetAttr: {} };

      const config = getConfig();

      expect(config).toEqual({
        version: "2.0",
        globalconfigCache: {
          lastsaved: 0
        },
        playersCanTargetParty: true,
        playersCanModify: false,
        playersCanEvaluate: false,
        useWorkers: true,
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
        version: "2.0",
        globalconfigCache: {
          lastsaved: 0
        },
        playersCanTargetParty: true,
        playersCanModify: true,
        playersCanEvaluate: true,
        useWorkers: true,
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
        globalconfigCache: {
          lastsaved: 1234567890
        },
        playersCanTargetParty: true,
        playersCanModify: true,
        playersCanEvaluate: true,
        useWorkers: false,
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
      expect(config.version).toBe("2.0");
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
        version: "2.0",
        globalconfigCache: {
          lastsaved: 0
        },
        playersCanTargetParty: true,
        playersCanModify: true,
        playersCanEvaluate: false,
        useWorkers: true,
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
      expect(global.state.ChatSetAttr.globalconfigCache).toBeDefined();
      expect(typeof global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe("number");
    });

    it("should initialize ChatSetAttr when undefined", () => {
      global.state = { ChatSetAttr: undefined };


      setConfig({ playersCanEvaluate: true });

      expect(global.state.ChatSetAttr.playersCanEvaluate).toBe(true);
      expect(global.state.ChatSetAttr.globalconfigCache).toBeDefined();
      expect(typeof global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe("number");
    });

    it("should merge new config with existing config", () => {
      global.state.ChatSetAttr = {
        playersCanModify: true,
        version: 2
      };

      setConfig({ playersCanEvaluate: true });

      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.version).toBe(2);
      expect(global.state.ChatSetAttr.playersCanEvaluate).toBe(true);
      expect(global.state.ChatSetAttr.globalconfigCache).toBeDefined();
      expect(typeof global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe("number");
    });

    it("should override existing config values", () => {
      global.state.ChatSetAttr = {
        playersCanModify: false,
        playersCanEvaluate: false,
        useWorkers: true
      };

      setConfig({
        playersCanModify: true,
        useWorkers: false
      });

      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.playersCanEvaluate).toBe(false);
      expect(global.state.ChatSetAttr.useWorkers).toBe(false);
      expect(global.state.ChatSetAttr.globalconfigCache).toBeDefined();
      expect(typeof global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe("number");
    });

    it("should handle complex nested objects", () => {
      global.state.ChatSetAttr = {
        globalconfigCache: {
          lastsaved: 1000
        }
      };

      setConfig({
        globalconfigCache: {
          lastsaved: 2000,
          newProperty: "test"
        }
      });

      // setConfig always overwrites globalconfigCache.lastsaved with Date.now()
      expect(global.state.ChatSetAttr.globalconfigCache).toBeDefined();
      expect(typeof global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe("number");
      expect(global.state.ChatSetAttr.globalconfigCache.lastsaved).toBeGreaterThan(2000);
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
      expect(global.state.ChatSetAttr.globalconfigCache).toBeDefined();
      expect(global.state.ChatSetAttr.otherProperty).toBe("should be preserved");
      expect(global.state.ChatSetAttr.anotherProp).toBe(123);
    });

    it("should handle empty config object", () => {
      global.state.ChatSetAttr = {
        playersCanModify: true
      };

      setConfig({});

      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.globalconfigCache).toBeDefined();
      expect(typeof global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe("number");
    });

    it("should handle null and undefined values", () => {
      global.state.ChatSetAttr = {
        playersCanModify: true
      };

      setConfig({
        playersCanEvaluate: null,
        useWorkers: undefined,
        version: 0
      });

      expect(global.state.ChatSetAttr.playersCanModify).toBe(true);
      expect(global.state.ChatSetAttr.playersCanEvaluate).toBe(null);
      expect(global.state.ChatSetAttr.useWorkers).toBe(undefined);
      expect(global.state.ChatSetAttr.version).toBe(0);
      expect(global.state.ChatSetAttr.globalconfigCache).toBeDefined();
      expect(typeof global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe("number");
    });

    it("should handle various data types", () => {
      setConfig({
        stringProp: "test",
        numberProp: 42,
        booleanProp: true,
        arrayProp: [1, 2, 3],
        objectProp: { nested: "value" },
        nullProp: null,
        undefinedProp: undefined
      });

      expect(global.state.ChatSetAttr.stringProp).toBe("test");
      expect(global.state.ChatSetAttr.numberProp).toBe(42);
      expect(global.state.ChatSetAttr.booleanProp).toBe(true);
      expect(global.state.ChatSetAttr.arrayProp).toEqual([1, 2, 3]);
      expect(global.state.ChatSetAttr.objectProp).toEqual({ nested: "value" });
      expect(global.state.ChatSetAttr.nullProp).toBe(null);
      expect(global.state.ChatSetAttr.undefinedProp).toBe(undefined);
      expect(global.state.ChatSetAttr.globalconfigCache).toBeDefined();
      expect(typeof global.state.ChatSetAttr.globalconfigCache.lastsaved).toBe("number");
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
      expect(config.globalconfigCache).toBeDefined();
      expect(typeof config.globalconfigCache.lastsaved).toBe("number");
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
      expect(config.version).toBe("2.0"); // Default value
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
