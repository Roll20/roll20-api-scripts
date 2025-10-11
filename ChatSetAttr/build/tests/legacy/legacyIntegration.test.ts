import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MockAttribute } from "../../vitest.globals";
import ChatSetAttr from "./ChatSetAttr.js";
import { create } from "underscore";

// Define interfaces for better typing
interface StateConfig {
  version: number;
  globalconfigCache: {
    lastsaved: number;
  };
  playersCanModify: boolean;
  playersCanEvaluate: boolean;
  useWorkers: boolean;
}

describe("ChatSetAttr Integration Tests", () => {
  // Set up the test environment before each test
  beforeEach(() => {
    setupTestEnvironment();
    ChatSetAttr.registerEventHandlers();
  });

  // Cleanup after each test if needed
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Attribute Setting Commands", () => {
    it("should set Strength to 15 for selected characters", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("character", { id: "char2", name: "Character 2" });
      createObj("graphic", { id: "token1", represents: "char1" });
      createObj("graphic", { id: "token2", represents: "char2" });

      executeCommand("!setattr --sel --Strength|15", ["token1", "token2"]);

      await vi.waitFor(() => {
        const char1Strength = attributes.find(a => a._characterid === "char1" && a.name === "Strength");
        const char2Strength = attributes.find(a => a._characterid === "char2" && a.name === "Strength");
        expect(char1Strength).toBeDefined();
        expect(char1Strength!.current).toBe("15");
        expect(char2Strength).toBeDefined();
        expect(char2Strength!.current).toBe("15");
      });
    });

    it("should set HP and Dex for character named John", async () => {
      createObj("character", { id: "john1", name: "John" });
      createObj("character", { id: "john2", name: "john" });
      createObj("character", { id: "char3", name: "NotJohn" });

      executeCommand("!setattr --name John --HP|17|27 --Dex|10");

      await vi.waitFor(() => {
        const johnHP = attributes.find(a => a._characterid === "john1" && a.name === "HP");
        const johnDex = attributes.find(a => a._characterid === "john1" && a.name === "Dex");

        expect(johnHP).toBeDefined();
        expect(johnHP!.current).toBe("17");
        expect(johnHP!.max).toBe("27");
        expect(johnDex).toBeDefined();
        expect(johnDex!.current).toBe("10");

        const anotherJohnHP = attributes.find(a => a._characterid === "john2" && a.name === "HP");
        const notJohnHP = attributes.find(a => a._characterid === "char3" && a.name === "HP");
        expect(anotherJohnHP).toBeUndefined();
        expect(notJohnHP).toBeUndefined();
      });
    });

    it("should set td attribute to d8 for all characters", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("character", { id: "char2", name: "Character 2" });
      createObj("character", { id: "char3", name: "Character 3" });

      executeCommand("!setattr --all --td|d8");

      await vi.waitFor(() => {
        const char1TensionDie = attributes.find(a => a._characterid === "char1" && a.name === "td");
        const char2TensionDie = attributes.find(a => a._characterid === "char2" && a.name === "td");
        const char3TensionDie = attributes.find(a => a._characterid === "char3" && a.name === "td");

        expect(char1TensionDie).toBeDefined();
        expect(char1TensionDie!.current).toBe("d8");
        expect(char2TensionDie).toBeDefined();
        expect(char2TensionDie!.current).toBe("d8");
        expect(char3TensionDie).toBeDefined();
        expect(char3TensionDie!.current).toBe("d8");
      });
    });

    it("should add a new item to a repeating inventory section", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("graphic", { id: "token1", represents: "char1" });

      executeCommand("!setattr --sel --fb-public --fb-header Aquiring Magic Item --fb-content The Cloak of Excellence from the chest by a character. --repeating_inventory_-CREATE_itemname|Cloak of Excellence --repeating_inventory_-CREATE_itemcount|1 --repeating_inventory_-CREATE_itemweight|3 --repeating_inventory_-CREATE_equipped|1 --repeating_inventory_-CREATE_itemmodifiers|Item Type: Wondrous item, AC +2, Saving Throws +1 --repeating_inventory_-CREATE_itemcontent|(Requires Attunment)A purple cape, that feels heavy to the touch, but light to carry. It has gnomish text embroiled near the collar.", ["token1"]);

      await vi.waitFor(() => {
        expect(sendChat).toHaveBeenCalled();
        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" && call[1].includes("Aquiring Magic Item")
        );
        expect(feedbackCall).toBeDefined();

        const nameAttr = attributes.find(a => a._characterid === "char1" && a.name.includes("itemname"));
        expect(nameAttr).toBeDefined();

        const repeatingRowId = nameAttr!.name.match(/repeating_inventory_([^_]+)_itemname/)?.[1];
        expect(repeatingRowId).toBeDefined();

        type ItemAttrs = {
          name?: MockAttribute;
          count?: MockAttribute;
          weight?: MockAttribute;
          equipped?: MockAttribute;
          modifiers?: MockAttribute;
          content?: MockAttribute;
        };

        const itemAttrs: ItemAttrs = {
          name: attributes.find(a => a.name === `repeating_inventory_${repeatingRowId}_itemname`),
          count: attributes.find(a => a.name === `repeating_inventory_${repeatingRowId}_itemcount`),
          weight: attributes.find(a => a.name === `repeating_inventory_${repeatingRowId}_itemweight`),
          equipped: attributes.find(a => a.name === `repeating_inventory_${repeatingRowId}_equipped`),
          modifiers: attributes.find(a => a.name === `repeating_inventory_${repeatingRowId}_itemmodifiers`),
          content: attributes.find(a => a.name === `repeating_inventory_${repeatingRowId}_itemcontent`)
        };

        expect(itemAttrs.name).toBeDefined();
        expect(itemAttrs.name!.current).toBe("Cloak of Excellence");
        expect(itemAttrs.count!.current).toBe("1");
        expect(itemAttrs.weight!.current).toBe("3");
        expect(itemAttrs.equipped!.current).toBe("1");
        expect(itemAttrs.modifiers!.current).toBe("Item Type: Wondrous item, AC +2, Saving Throws +1");
        expect(itemAttrs.content!.current).toBe("(Requires Attunment)A purple cape, that feels heavy to the touch, but light to carry. It has gnomish text embroiled near the collar.");
      });
    });

    it("should process inline roll queries", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      inputQueue.push("15");
      inputQueue.push("20");

      executeCommand("!setattr --charid char1 --Strength|[[?{Strength Value|10}]] --Dexterity|[[?{Dexterity Value|10}]]");

      await vi.waitFor(() => {
        const strAttr = attributes.find(a => a._characterid === "char1" && a.name === "Strength");
        const dexAttr = attributes.find(a => a._characterid === "char1" && a.name === "Dexterity");

        expect(strAttr).toBeDefined();
        expect(strAttr!.current).toBe("15");
        expect(dexAttr).toBeDefined();
        expect(dexAttr!.current).toBe("20");
      });
    });

    it("should process an inline command within a chat message", async () => {
      createObj("character", { id: "char1", name: "Character 1" });

      executeCommand("I cast a spell and !setattr --charid char1 --Mana|10!!!");

      await vi.waitFor(() => {
        const manaAttr = attributes.find(a => a._characterid === "char1" && a.name === "Mana");

        expect(manaAttr).toBeDefined();
        expect(manaAttr!.current).toBe("10");
      });
    });

    it("should use character IDs directly to set attributes", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("character", { id: "char2", name: "Character 2" });

      executeCommand("!setattr --charid char1,char2 --Level|5");

      await vi.waitFor(() => {
        const char1Level = attributes.find(a => a._characterid === "char1" && a.name === "Level");
        const char2Level = attributes.find(a => a._characterid === "char2" && a.name === "Level");

        expect(char1Level).toBeDefined();
        expect(char1Level!.current).toBe("5");
        expect(char2Level).toBeDefined();
        expect(char2Level!.current).toBe("5");
      });
    });

    it("should set multiple attributes on multiple characters", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("character", { id: "char2", name: "Character 2" });

      executeCommand("!setattr --charid char1,char2 --Class|Fighter --Level|5 --HP|30|30");

      await vi.waitFor(() => {
        const char1Class = attributes.find(a => a._characterid === "char1" && a.name === "Class");
        const char1Level = attributes.find(a => a._characterid === "char1" && a.name === "Level");
        const char1HP = attributes.find(a => a._characterid === "char1" && a.name === "HP");

        expect(char1Class).toBeDefined();
        expect(char1Class!.current).toBe("Fighter");
        expect(char1Level).toBeDefined();
        expect(char1Level!.current).toBe("5");
        expect(char1HP).toBeDefined();
        expect(char1HP!.current).toBe("30");
        expect(char1HP!.max).toBe("30");

        const char2Class = attributes.find(a => a._characterid === "char2" && a.name === "Class");
        const char2Level = attributes.find(a => a._characterid === "char2" && a.name === "Level");
        const char2HP = attributes.find(a => a._characterid === "char2" && a.name === "HP");

        expect(char2Class).toBeDefined();
        expect(char2Class!.current).toBe("Fighter");
        expect(char2Level).toBeDefined();
        expect(char2Level!.current).toBe("5");
        expect(char2HP).toBeDefined();
        expect(char2HP!.current).toBe("30");
        expect(char2HP!.max).toBe("30");
      });
    });
  });

  describe("Attribute Modification Commands", () => {
    it("should increase Strength by 5 for selected characters", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("character", { id: "char2", name: "Character 2" });
      createObj("character", { id: "char3", name: "Character 3" });
      createObj("attribute", { _characterid: "char1", name: "Strength", current: "10" });
      createObj("attribute", { _characterid: "char2", name: "Strength", current: "15" });
      createObj("attribute", { _characterid: "char3", name: "Strength", current: "Very big" });
      createObj("graphic", { id: "token1", represents: "char1" });
      createObj("graphic", { id: "token2", represents: "char2" });
      createObj("graphic", { id: "token3", represents: "char3" });

      executeCommand("!setattr --sel --mod --Strength|5", ["token1", "token2", "token3"]);

      await vi.waitFor(() => {
        const char1Strength = attributes.find(a => a._characterid === "char1" && a.name === "Strength");
        const char2Strength = attributes.find(a => a._characterid === "char2" && a.name === "Strength");
        const char3Strength = attributes.find(a => a._characterid === "char3" && a.name === "Strength");

        expect(char1Strength).toBeDefined();
        expect(char1Strength!.current).toBe("15");
        expect(char2Strength).toBeDefined();
        expect(char2Strength!.current).toBe("20");
        expect(char3Strength).toBeDefined();
        expect(char3Strength!.current).toBe("Very big");

        expect(sendChat).toHaveBeenCalled();
        const errorCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" && call[1].includes("is not number-valued")
        );
        expect(errorCall).toBeDefined();
      });
    });

    it("should handle --mod option for modifying attributes", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "Counter", current: "5" });
      createObj("attribute", { _characterid: "char1", name: "CounterMax", current: "3", max: "10" });

      executeCommand("!modattr --charid char1 --Counter|2 --CounterMax|1|2");

      await vi.waitFor(() => {
        const counter = attributes.find(a => a._characterid === "char1" && a.name === "Counter");
        const counterMax = attributes.find(a => a._characterid === "char1" && a.name === "CounterMax");

        expect(counter).toBeDefined();
        expect(counter!.current).toBe("7");
        expect(counterMax).toBeDefined();
        expect(counterMax!.current).toBe("4");
        expect(counterMax!.max).toBe("12");
      });
    });

    it("should modify attributes using the !mod command syntax", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "10", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "15", max: "30" });

      executeCommand("!modattr --charid char1 --HP|5 --MP|-3");

      await vi.waitFor(() => {
        const hp = attributes.find(a => a._characterid === "char1" && a.name === "HP");
        const mp = attributes.find(a => a._characterid === "char1" && a.name === "MP");

        expect(hp).toBeDefined();
        expect(hp!.current).toBe("15");
        expect(mp).toBeDefined();
        expect(mp!.current).toBe("12");
      });
    });

    it("should modify attributes with bounds using modbattr", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "5", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "15", max: "15" });
      createObj("attribute", { _characterid: "char1", name: "Stamina", current: "1", max: "10" });

      executeCommand("!modbattr --charid char1 --HP|10 --MP|5 --Stamina|-5");

      await vi.waitFor(() => {
        const hp = attributes.find(a => a._characterid === "char1" && a.name === "HP");
        const mp = attributes.find(a => a._characterid === "char1" && a.name === "MP");
        const stamina = attributes.find(a => a._characterid === "char1" && a.name === "Stamina");

        expect(hp).toBeDefined();
        expect(hp!.current).toBe("15");
        expect(mp).toBeDefined();
        expect(mp!.current).toBe("15");
        expect(stamina).toBeDefined();
        expect(stamina!.current).toBe("0");
      });
    });

    it("should modify attributes with bounds using the !modb command syntax", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "5", max: "10" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "8", max: "10" });

      executeCommand("!modbattr --charid char1 --HP|10 --MP|-10");

      await vi.waitFor(() => {
        const hp = attributes.find(a => a._characterid === "char1" && a.name === "HP");
        const mp = attributes.find(a => a._characterid === "char1" && a.name === "MP");

        expect(hp).toBeDefined();
        expect(hp!.current).toBe("10");
        expect(mp).toBeDefined();
        expect(mp!.current).toBe("0");
      });
    });
  });

  describe("Attribute Deletion and Reset Commands", () => {
    it("should delete the gold attribute from all characters", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("character", { id: "char2", name: "Character 2" });
      createObj("attribute", { _characterid: "char1", name: "gold", current: "100" });
      createObj("attribute", { _characterid: "char2", name: "gold", current: "200" });
      createObj("attribute", { _characterid: "char1", name: "silver", current: "50" });

      executeCommand("!delattr --all --gold");

      await vi.waitFor(() => {
        expect(attributes.find(a => a._characterid === "char1" && a.name === "gold")).toBeUndefined();
        expect(attributes.find(a => a._characterid === "char2" && a.name === "gold")).toBeUndefined();
        expect(attributes.find(a => a._characterid === "char1" && a.name === "silver")).toBeDefined();
      });
    });

    it("should reset Ammo to its maximum value", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "Ammo", current: "3", max: "20" });
      createObj("graphic", { id: "token1", represents: "char1" });

      executeCommand("!setattr --sel --Ammo|%Ammo_max%", ["token1"]);

      await vi.waitFor(() => {
        const ammo = attributes.find(a => a._characterid === "char1" && a.name === "Ammo");
        expect(ammo).toBeDefined();
        expect(ammo!.current).toBe("20");
      });
    });

    it("should reset attributes to their maximum values with resetattr", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "10", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "5", max: "15" });
      createObj("attribute", { _characterid: "char1", name: "XP", current: "100", max: "" });

      executeCommand("!resetattr --charid char1 --HP --MP");

      await vi.waitFor(() => {
        const hp = attributes.find(a => a._characterid === "char1" && a.name === "HP");
        const mp = attributes.find(a => a._characterid === "char1" && a.name === "MP");
        const xp = attributes.find(a => a._characterid === "char1" && a.name === "XP");

        expect(hp).toBeDefined();
        expect(hp!.current).toBe("20");
        expect(mp).toBeDefined();
        expect(mp!.current).toBe("15");
        expect(xp).toBeDefined();
        expect(xp!.current).toBe("100");
      });
    });

    it("should reset attributes using the !reset command syntax", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "5", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "10", max: "30" });
      createObj("attribute", { _characterid: "char1", name: "XP", current: "100" });

      executeCommand("!resetattr --charid char1 --HP --MP");

      await vi.waitFor(() => {
        const hp = attributes.find(a => a._characterid === "char1" && a.name === "HP");
        const mp = attributes.find(a => a._characterid === "char1" && a.name === "MP");
        const xp = attributes.find(a => a._characterid === "char1" && a.name === "XP");

        expect(hp).toBeDefined();
        expect(hp!.current).toBe("20");
        expect(mp).toBeDefined();
        expect(mp!.current).toBe("30");
        expect(xp).toBeDefined();
        expect(xp!.current).toBe("100");
      });
    });

    it("should delete attributes using the !del command syntax", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "ToDelete1", current: "10" });
      createObj("attribute", { _characterid: "char1", name: "ToDelete2", current: "20" });
      createObj("attribute", { _characterid: "char1", name: "ToKeep", current: "30" });

      executeCommand("!delattr --charid char1 --ToDelete1 --ToDelete2");

      await vi.waitFor(() => {
        const toDelete1 = attributes.find(a => a._characterid === "char1" && a.name === "ToDelete1");
        const toDelete2 = attributes.find(a => a._characterid === "char1" && a.name === "ToDelete2");
        const toKeep = attributes.find(a => a._characterid === "char1" && a.name === "ToKeep");

        expect(toDelete1).toBeUndefined();
        expect(toDelete2).toBeUndefined();
        expect(toKeep).toBeDefined();
        expect(toKeep!.current).toBe("30");
      });
    });
  });

  describe("Targeting Options", () => {
    it("should set attributes for GM-only characters with allgm targeting mode", async () => {
      createObj("character", { id: "gmchar1", name: "GM Character 1" });
      createObj("character", { id: "gmchar2", name: "GM Character 2" });
      createObj("character", { id: "playerchar", name: "Player Character", controlledby: "player123" });

      executeCommand("!setattr --allgm --Status|NPC");

      await vi.waitFor(() => {
        const gmChar1Status = attributes.find(a => a._characterid === "gmchar1" && a.name === "Status");
        const gmChar2Status = attributes.find(a => a._characterid === "gmchar2" && a.name === "Status");
        const playerCharStatus = attributes.find(a => a._characterid === "playerchar" && a.name === "Status");

        expect(gmChar1Status).toBeDefined();
        expect(gmChar1Status!.current).toBe("NPC");

        expect(gmChar2Status).toBeDefined();
        expect(gmChar2Status!.current).toBe("NPC");

        expect(playerCharStatus).toBeUndefined();
      });
    });

    it("should set attributes for player-controlled characters with allplayers targeting mode", async () => {
      createObj("character", { id: "playerchar1", name: "Player Character 1", controlledby: "player123" });
      createObj("character", { id: "playerchar2", name: "Player Character 2", controlledby: "player456" });
      createObj("character", { id: "gmchar", name: "GM Character" });

      executeCommand("!setattr --allplayers --CharType|PC");

      await vi.waitFor(() => {
        const playerChar1Type = attributes.find(a => a._characterid === "playerchar1" && a.name === "CharType");
        const playerChar2Type = attributes.find(a => a._characterid === "playerchar2" && a.name === "CharType");
        const gmCharType = attributes.find(a => a._characterid === "gmchar" && a.name === "CharType");

        expect(playerChar1Type).toBeDefined();
        expect(playerChar1Type!.current).toBe("PC");

        expect(playerChar2Type).toBeDefined();
        expect(playerChar2Type!.current).toBe("PC");

        expect(gmCharType).toBeUndefined();
      });
    });
  });

  describe("Attribute Value Processing", () => {
    it("should evaluate expressions using attribute references", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "attr1", current: "3" });
      createObj("attribute", { _characterid: "char1", name: "attr2", current: "2" });
      createObj("graphic", { id: "token1", represents: "char1" });

      executeCommand("!setattr --sel --evaluate --attr3|2*%attr1% + 7 - %attr2%", ["token1"]);

      await vi.waitFor(() => {
        const attr3 = attributes.find(a => a._characterid === "char1" && a.name === "attr3");
        expect(attr3).toBeDefined();
        expect(attr3!.current).toBe("11");
      });
    });

    it("should handle --replace option", async () => {
      createObj("character", { id: "char1", name: "Character 1" });

      executeCommand("!setattr --replace --charid char1 --Description|This text has <special> characters; and should be `replaced`");

      await vi.waitFor(() => {
        const desc = attributes.find(a => a._characterid === "char1" && a.name === "Description");
        expect(desc).toBeDefined();
        expect(desc!.current).toBe("This text has [special] characters? and should be @replaced@");
      });
    });

    it("should honor multiple modifier flags used together", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "ExistingAttr", current: "10" });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --silent --evaluate --ExistingAttr|20*2");

      await vi.waitFor(() => {
        const existingAttr = attributes.find(a => a._characterid === "char1" && a.name === "ExistingAttr");
        expect(existingAttr).toBeDefined();
        expect(existingAttr!.current).toBe("40");

        expect(sendChat).not.toHaveBeenCalled();
      });
    });
  });

  describe("Configuration Options", () => {
    it("should handle configuration commands", async () => {
      const state = global.state as { ChatSetAttr: StateConfig };

      const originalConfig: StateConfig = {
        version: state.ChatSetAttr.version,
        globalconfigCache: { ...state.ChatSetAttr.globalconfigCache },
        playersCanModify: state.ChatSetAttr.playersCanModify,
        playersCanEvaluate: state.ChatSetAttr.playersCanEvaluate,
        useWorkers: state.ChatSetAttr.useWorkers
      };

      afterEach(() => {
        state.ChatSetAttr.playersCanModify = originalConfig.playersCanModify;
        state.ChatSetAttr.playersCanEvaluate = originalConfig.playersCanEvaluate;
        state.ChatSetAttr.useWorkers = originalConfig.useWorkers;
      });

      executeCommand("!setattr-config --players-can-modify", [], { playerId: "gm123" });

      expect(state.ChatSetAttr.playersCanModify).toBe(!originalConfig.playersCanModify);
      expect(sendChat).toHaveBeenCalled();

      vi.mocked(sendChat).mockClear();
      executeCommand("!setattr-config --players-can-evaluate", [], { playerId: "gm123" });

      expect(state.ChatSetAttr.playersCanEvaluate).toBe(!originalConfig.playersCanEvaluate);
      expect(sendChat).toHaveBeenCalled();
    });

    it("should update configuration and display current settings", async () => {
      const state = global.state as { ChatSetAttr: StateConfig };

      const originalUseWorkers = state.ChatSetAttr.useWorkers;

      executeCommand("!setattr-config --use-workers", [], { playerId: "gm123" });

      expect(state.ChatSetAttr.useWorkers).toBe(!originalUseWorkers);

      expect(sendChat).toHaveBeenCalled();
      const configMessage = vi.mocked(sendChat).mock.calls.find(call =>
        call[1] && typeof call[1] === "string" && call[1].includes("Configuration")
      );
      expect(configMessage).toBeDefined();

      state.ChatSetAttr.useWorkers = originalUseWorkers;
    });

    it("should toggle the use-workers configuration setting", async () => {
      const state = global.state as { ChatSetAttr: StateConfig };
      const originalUseWorkers = state.ChatSetAttr.useWorkers;

      executeCommand("!setattr-config --use-workers", [], { playerId: "gm123" });

      expect(state.ChatSetAttr.useWorkers).toBe(!originalUseWorkers);
      expect(sendChat).toHaveBeenCalled();

      const configCall = vi.mocked(sendChat).mock.calls.find(call =>
        call[1] && typeof call[1] === "string" &&
        call[1].includes("use-workers") &&
        call[1].includes("Configuration")
      );
      expect(configCall).toBeDefined();

      state.ChatSetAttr.useWorkers = originalUseWorkers;
    });

    it("should respect player permissions", async () => {
      createObj("character", { id: "char1", name: "Player Character", controlledby: "player123" });

      const state = global.state as { ChatSetAttr: StateConfig };
      const originalConfig = state.ChatSetAttr.playersCanModify;
      state.ChatSetAttr.playersCanModify = false;

      const originalPlayerIsGM = global.playerIsGM;
      global.playerIsGM = vi.fn(() => false);

      executeCommand("!setattr --charid char1 --Strength|18", [], { playerId: "differentPlayer456" });

      await vi.waitFor(() => {
        const strength = attributes.find(a => a._characterid === "char1" && a.name === "Strength");
        expect(strength).toBeUndefined();

        expect(sendChat).toHaveBeenCalled();
        const errorCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" && call[1].includes("Permission error")
        );
        expect(errorCall).toBeDefined();
      });

      state.ChatSetAttr.playersCanModify = originalConfig;
      global.playerIsGM = originalPlayerIsGM;
    });
  });

  describe("Feedback Options", () => {
    it("should send public feedback with --fb-public option", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --fb-public --Attribute|42");

      await vi.waitFor(() => {
        const attr = attributes.find(a => a._characterid === "char1" && a.name === "Attribute");
        expect(attr).toBeDefined();
        expect(attr!.current).toBe("42");

        const feedbackCalls = vi.mocked(sendChat).mock.calls.filter(call =>
          call[1] && typeof call[1] === "string" &&
          call[1].includes("Setting Attribute") &&
          !call[1].startsWith("/w ")
        );

        expect(feedbackCalls.length).toBeGreaterThan(0);
      });
    });

    it("should use custom sender with --fb-from option", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --fb-from Wizard --Spell|Fireball");

      await vi.waitFor(() => {
        const attr = attributes.find(a => a._characterid === "char1" && a.name === "Spell");
        expect(attr).toBeDefined();
        expect(attr!.current).toBe("Fireball");

        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[0] === "Wizard" &&
          call[1] && typeof call[1] === "string" &&
          call[1].includes("Setting Spell")
        );

        expect(feedbackCall).toBeDefined();
      });
    });

    it("should use custom header with --fb-header option", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --fb-header Magic Item Acquired --Item|Staff of Power");

      await vi.waitFor(() => {
        const attr = attributes.find(a => a._characterid === "char1" && a.name === "Item");
        expect(attr).toBeDefined();
        expect(attr!.current).toBe("Staff of Power");

        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" &&
          call[1].includes("Magic Item Acquired") &&
          !call[1].includes("Setting attributes")
        );

        expect(feedbackCall).toBeDefined();
      });
    });

    it("should use custom content with --fb-content option", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --fb-header \"Level Up\" --fb-content \"_CHARNAME_ is now level _CUR0_!\" --Level|5");

      await vi.waitFor(() => {
        const attr = attributes.find(a => a._characterid === "char1" && a.name === "Level");
        expect(attr).toBeDefined();
        expect(attr!.current).toBe("5");

        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" &&
          call[1].includes("Character 1 is now level 5!")
        );

        expect(feedbackCall).toBeDefined();
      });
    });

    it("should combine all feedback options together", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --fb-public --fb-from Dungeon_Master --fb-header \"Combat Stats Updated\" --fb-content \"_CHARNAME_'s health increased to _CUR0_!\" --HP|25");

      await vi.waitFor(() => {
        const attr = attributes.find(a => a._characterid === "char1" && a.name === "HP");
        expect(attr).toBeDefined();
        expect(attr!.current).toBe("25");

        const feedbackCalls = vi.mocked(sendChat).mock.calls.filter(call =>
          call[0] === "Dungeon_Master" &&
          !call[1].startsWith("/w ") &&
          call[1].includes("Combat Stats Updated") &&
          call[1].includes("Character 1's health increased to 25!")
        );

        expect(feedbackCalls.length).toBe(1);
      });
    });
  });

  describe("Message Suppression Options", () => {
    it("should suppress feedback messages when using the --silent option", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --silent --TestAttr|42");

      await vi.waitFor(() => {
        const testAttr = attributes.find(a => a._characterid === "char1" && a.name === "TestAttr");
        expect(testAttr).toBeDefined();
        expect(testAttr!.current).toBe("42");

        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" && call[1].includes("Setting TestAttr")
        );
        expect(feedbackCall).toBeUndefined();
      });
    });

    it("should suppress error messages when using the --mute option", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --mute --mod --NonNumeric|abc --Value|5");

      await vi.waitFor(() => {
        const errorCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" && call[1].includes("Error")
        );
        expect(errorCall).toBeUndefined();
      });
    });

    it("should not create attributes when using the --nocreate option", async () => {
      createObj("character", { id: "char1", name: "Character 1" });

      executeCommand("!setattr --charid char1 --nocreate --NewAttribute|50");

      await vi.waitFor(() => {
        const newAttr = attributes.find(a => a._characterid === "char1" && a.name === "NewAttribute");
        expect(newAttr).toBeUndefined();

        const errorCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" &&
          call[1].includes("Missing attribute") &&
          call[1].includes("not created")
        );
        expect(errorCall).toBeDefined();
      });
    });
  });

  describe("Observer Events", () => {
    it("should observe attribute additions with registered observers", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      const mockObserver = vi.fn();

      ChatSetAttr.registerObserver("add", mockObserver);

      executeCommand("!setattr --charid char1 --NewAttribute|42");

      await vi.waitFor(() => {
        expect(mockObserver).toHaveBeenCalled();

        const calls = mockObserver.mock.calls;
        const hasNewAttributeCall = calls.some(call => {
          const attr = call[0];
          return attr && attr.name === "NewAttribute" && attr.current === "42";
        });

        expect(hasNewAttributeCall).toBe(true);
      });
    });

    it("should observe attribute changes with registered observers", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "ExistingAttr", current: "10" });
      const mockObserver = vi.fn();

      ChatSetAttr.registerObserver("change", mockObserver);

      executeCommand("!setattr --charid char1 --ExistingAttr|20");

      await vi.waitFor(() => {
        expect(mockObserver).toHaveBeenCalled();

        const calls = mockObserver.mock.calls;
        const hasChangeCall = calls.some(call => {
          const attr = call[0];
          const prev = call[1];
          return attr && attr.name === "ExistingAttr" && attr.current === "20" && prev && prev.current === "10";
        });

        expect(hasChangeCall).toBe(true);
      });
    });

    it("should observe attribute deletions with registered observers", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "DeleteMe", current: "10" });
      const mockObserver = vi.fn();

      ChatSetAttr.registerObserver("destroy", mockObserver);

      executeCommand("!delattr --charid char1 --DeleteMe");

      await vi.waitFor(() => {
        expect(mockObserver).toHaveBeenCalled();

        const calls = mockObserver.mock.calls;
        const hasDeleteCall = calls.some(call => {
          const attr = call[0];
          return attr && attr.name === "DeleteMe" && attr.current === "10";
        });

        expect(hasDeleteCall).toBe(true);
      });
    });
  });

  describe("Repeating Sections", () => {
    it("should create repeating section attributes", async () => {
      createObj("character", { id: "char1", name: "Character 1" });

      executeCommand("!setattr --charid char1 --repeating_weapons_-CREATE_weaponname|Longsword --repeating_weapons_-CREATE_damage|1d8");

      await vi.waitFor(() => {
        const nameAttr = attributes.find(a => a._characterid === "char1" && a.name.includes("weaponname"));
        expect(nameAttr).toBeDefined();

        const rowId = nameAttr!.name.match(/repeating_weapons_([^_]+)_weaponname/)?.[1];
        expect(rowId).toBeDefined();

        const damageAttr = attributes.find(a => a.name === `repeating_weapons_${rowId}_damage`);
        expect(damageAttr).toBeDefined();

        expect(nameAttr!.current).toBe("Longsword");
        expect(damageAttr!.current).toBe("1d8");
      });
    });

    it("should adjust number of uses remaining for an ability", async () => {
      inputQueue.push("2");
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "repeating_ability_-mm2dso76ircbi5dtea3_used", current: "3" });
      createObj("graphic", { id: "token1", represents: "char1" });

      executeCommand("!setattr --sel --repeating_ability_-mm2dso76ircbi5dtea3_used|[[?{How many are left?|0}]]", ["token1"]);

      await vi.waitFor(() => {
        const usedAttr = attributes.find(a =>
          a._characterid === "char1" &&
          a.name === "repeating_ability_-mm2dso76ircbi5dtea3_used"
        );

        expect(usedAttr).toBeDefined();
        expect(usedAttr!.current).toBe("2");
      });
    });

    it("should toggle a buff on or off", async () => {
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("attribute", { _characterid: "char1", name: "repeating_buff2_-mfyn0yxatk2wbh0km4d_enable_toggle", current: "0" });
      createObj("graphic", { id: "token1", represents: "char1" });

      executeCommand("!setattr --sel --repeating_buff2_-mfyn0yxatk2wbh0km4d_enable_toggle|[[1-@{selected|repeating_buff2_-mfyn0yxatk2wbh0km4d_enable_toggle}]]", ["token1"]);

      await vi.waitFor(() => {
        const buffAttr = attributes.find(a =>
          a._characterid === "char1" &&
          a.name === "repeating_buff2_-mfyn0yxatk2wbh0km4d_enable_toggle"
        );

        expect(buffAttr).toBeDefined();
        expect(buffAttr!.current).toBe("1");

        executeCommand("!setattr --sel --repeating_buff2_-mfyn0yxatk2wbh0km4d_enable_toggle|[[1-@{selected|repeating_buff2_-mfyn0yxatk2wbh0km4d_enable_toggle}]]", ["token1"]);

        return new Promise(resolve => setTimeout(resolve, 100));
      });

      const buffAttr = attributes.find(a =>
        a._characterid === "char1" &&
        a.name === "repeating_buff2_-mfyn0yxatk2wbh0km4d_enable_toggle"
      );

      expect(buffAttr).toBeDefined();
      expect(buffAttr!.current).toBe("0");
    });

    const createRepeatingObjects = () => {
      createObj("character", { id: "char1", name: "Character 1" });

      createObj("attribute", {
        _characterid: "char1",
        name: "repeating_weapons_-abc123_weaponname",
        current: "Longsword"
      });
      createObj("attribute", {
        _characterid: "char1",
        name: "repeating_weapons_-abc123_damage",
        current: "1d8"
      });

      createObj("attribute", {
        _characterid: "char1",
        name: "repeating_weapons_-def456_weaponname",
        current: "Dagger"
      });
      createObj("attribute", {
        _characterid: "char1",
        name: "repeating_weapons_-def456_damage",
        current: "1d4"
      });

      createObj("attribute", {
        _characterid: "char1",
        name: "repeating_weapons_-ghi789_weaponname",
        current: "Bow"
      });
      createObj("attribute", {
        _characterid: "char1",
        name: "repeating_weapons_-ghi789_damage",
        current: "1d6"
      });

      createObj("attribute", {
        _characterid: "char1",
        name: "_reporder_" + "repeating_weapons",
        current: "abc123,def456,ghi789"
      });

      createObj("graphic", { id: "token1", represents: "char1" });
    };


    it("should handle deleting repeating section attributes referenced by index", async () => {
      // Arrange
      createRepeatingObjects();

      const secondWeapon = attributes.find(a =>
        a._characterid === "char1" &&
        a.name.includes("weaponname") &&
        a.current === "Dagger"
      );
      expect(secondWeapon).toBeDefined();

      // Act - Delete the second weapon ($1 index) by name
      executeCommand("!delattr --sel --repeating_weapons_$1_weaponname", ["token1"]);

      // Wait for the operation to complete
      await vi.waitFor(() => {
        // Assert - First weapon should still exist
        const firstWeapon = attributes.find(a =>
          a._characterid === "char1" &&
          a.name.includes("weaponname") &&
          a.current === "Longsword"
        );
        expect(firstWeapon).toBeDefined();

        // Second weapon (Dagger) should be deleted
        const secondWeapon = attributes.find(a =>
          a._characterid === "char1" &&
          a.name.includes("weaponname") &&
          a.current === "Dagger"
        );
        expect(secondWeapon).toBeUndefined();

        // Third weapon should still exist
        const thirdWeapon = attributes.find(a =>
          a._characterid === "char1" &&
          a.name.includes("weaponname") &&
          a.current === "Bow"
        );
        expect(thirdWeapon).toBeDefined();
      });
    });

    it("should handle modifying repeating section attributes referenced by index", async () => {
      // Arrange
      createRepeatingObjects();

      // Act - Modify the damage of the first weapon ($0 index)
      executeCommand("!setattr --sel --nocreate --repeating_weapons_$0_damage|2d8", ["token1"]);

      // Wait for the operation to complete
      await vi.waitFor(() => {
        // Assert - First weapon damage should be updated
        const firstWeaponDamage = attributes.find(a =>
          a._characterid === "char1" &&
          a.name.includes("damage") &&
          a.name.includes("weapons") &&
          a.current === "2d8"
        );
        expect(firstWeaponDamage).toBeDefined();
      });
    });

    it("should handle creating new repeating section attributes after deletion", async () => {
      // Arrange - Create initial repeating section attributes
      createRepeatingObjects();

      // Act - Create a new attribute in the last weapon ($1 index after deletion)
      executeCommand("!setattr --sel --repeating_weapons_$1_newlycreated|5", ["token1"]);

      // Wait for the operation to complete
      await vi.waitFor(() => {
        const repOrder = attributes.find(a =>
          a._characterid === "char1" &&
          a.name === "_reporder_repeating_weapons"
        );
        const order = repOrder!.get("current")!.split(",");
        expect(order.length).toBe(3);

        const attackBonus = attributes.find(a =>
          a._characterid === "char1" &&
          a.name === "repeating_weapons_-def456_newlycreated"
        );

        expect(attackBonus).toBeDefined();
        expect(attackBonus!.current).toBe("5");
      });
    });
  });

  describe("Delayed Processing", () => {
    it("should process characters sequentially with delays", async () => {
      vi.useFakeTimers();

      // Create multiple characters
      createObj("character", { id: "char1", name: "Character 1" });
      createObj("character", { id: "char2", name: "Character 2" });
      createObj("character", { id: "char3", name: "Character 3" });

      // Set up spy on setTimeout to track when it's called
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      // Execute a command that sets attributes on all three characters
      executeCommand("!setattr --charid char1,char2,char3 --TestAttr|42");
      vi.runAllTimers();

      // All three characters should eventually get their attributes
      await vi.waitFor(() => {
        const char1Attr = attributes.find(a => a._characterid === "char1" && a.name === "TestAttr");
        const char2Attr = attributes.find(a => a._characterid === "char2" && a.name === "TestAttr");
        const char3Attr = attributes.find(a => a._characterid === "char3" && a.name === "TestAttr");

        expect(char1Attr).toBeDefined();
        expect(char2Attr).toBeDefined();
        expect(char3Attr).toBeDefined();

        expect(char1Attr!.current).toBe("42");
        expect(char2Attr!.current).toBe("42");
        expect(char3Attr!.current).toBe("42");
      });

      expect(setTimeoutSpy).toHaveBeenCalledTimes(3);

      // Verify the specific parameters of setTimeout calls
      const timeoutCalls = setTimeoutSpy.mock.calls.filter(
        call => typeof call[0] === 'function' && call[1] === 50
      );
      expect(timeoutCalls.length).toBe(2);
    });

    it("should notify about delays when processing characters", async () => {
      vi.useFakeTimers();
      const actualCommand = setTimeout;
      vi.spyOn(global, "setTimeout").mockImplementation((callback, delay, ...args) => {
        if (delay === 8000) {
          // Simulate the delay notification
          callback();
        }
        return actualCommand(callback, delay, ...args);
      });
      for (let i = 1; i <= 50; i++) {
        createObj("character", { id: `char${i}`, name: `Character ${i}` });
      }
      // Execute a command that sets attributes on multiple characters
      executeCommand("!setattr --all --TestAttr|42");

      // Wait for the notification to be called
      vi.runAllTimers();
      await vi.waitFor(() => {
        expect(sendChat).toBeCalledTimes(2);
        expect(sendChat).toHaveBeenCalledWith(
          "ChatSetAttr",
          expect.stringMatching(/long time to execute/g),
          null,
          expect.objectContaining({
            noarchive: true,
          })
        );
      });
    });
  });
});
