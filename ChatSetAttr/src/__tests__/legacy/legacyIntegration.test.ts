import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import ChatSetAttr from "./ChatSetAttr.js";
import { resetAllObjects } from "../../__mocks__/apiObjects.mock.js";
import { resetAllCallbacks } from "../../__mocks__/eventHandling.mock.js";

// startDebugMode();

describe("ChatSetAttr Integration Tests", () => {
  type StateConfig = {
    version: string;
    playersCanModify: boolean;
    playersCanEvaluate: boolean;
    useWorkers: boolean;
  };

  const originalConfig: StateConfig = {
    version: "1.10",
    playersCanModify: true,
    playersCanEvaluate: true,
    useWorkers: true
  };

  // Set up the test environment before each test
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    ChatSetAttr.registerEventHandlers();
    global.state.ChatSetAttr = { ...originalConfig };
  });

  // Cleanup after each test if needed
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    resetAllObjects();
    resetAllCallbacks();
  });

  describe("Attribute Setting Commands", () => {
    it("should set Strength to 15 for selected characters", async () => {
      // arrange
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      const charOne = createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      const charTwo = createObj("character", { _id: "char2", name: "Character 2", controlledby: player.id });
      const strengthAttrOne = createObj("attribute", { _id: "strengthchar1", _characterid: charOne.id, name: "Strength", current: "10" });
      const strengthAttrTwo = createObj("attribute", { _id: "strengthchar2", _characterid: charTwo.id, name: "Strength", current: "12" });
      const tokenOne = createObj("graphic", { _id: "token1", represents: charOne.id });
      const tokenTwo = createObj("graphic", { _id: "token2", represents: charTwo.id });
      const selectedTokens = [tokenOne.properties, tokenTwo.properties];

      // act
      executeCommand(
        "!setattr --sel --Strength|15",
        { selected: selectedTokens },
      );

      // assert
      await vi.waitFor(() => {
        expect(strengthAttrOne.set).toHaveBeenCalledWith({ current: "15" });
        expect(strengthAttrTwo.set).toHaveBeenCalledWith({ current: "15" });
      });
    });

    it("should set HP and Dex for character named John", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "john1", name: "John", controlledby: player.id });
      createObj("character", { _id: "john2", name: "john", controlledby: player.id });
      createObj("character", { _id: "char3", name: "NotJohn", controlledby: player.id });

      executeCommand("!setattr --name John --HP|17|27 --Dex|10");

      await vi.waitFor(() => {
        const johnHP = findObjs({ _type: "attribute", _characterid: "john1", name: "HP" })[0];
        const johnDex = findObjs({ _type: "attribute", _characterid: "john1", name: "Dex" })[0];

        expect(johnHP).toBeDefined();
        expect(johnHP.set).toHaveBeenCalledWith({ current: "17", max: "27" });
        expect(johnDex).toBeDefined();
        expect(johnDex.set).toHaveBeenCalledWith({ current: "10" });

        const anotherJohnHP = findObjs({ _type: "attribute", _characterid: "john2", name: "HP" })[0];
        const notJohnHP = findObjs({ _type: "attribute", _characterid: "char3", name: "HP" })[0];
        expect(anotherJohnHP).toBeUndefined();
        expect(notJohnHP).toBeUndefined();
      });
    });

    it("should set td attribute to d8 for all characters", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      vi.mocked(global.playerIsGM).mockReturnValue(true);
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("character", { _id: "char2", name: "Character 2", controlledby: player.id });
      createObj("character", { _id: "char3", name: "Character 3", controlledby: player.id });

      executeCommand("!setattr --all --td|d8");

      await vi.waitFor(() => {
        const char1TensionDie = findObjs({ _type: "attribute", _characterid: "char1", name: "td" })[0];
        const char2TensionDie = findObjs({ _type: "attribute", _characterid: "char2", name: "td" })[0];
        const char3TensionDie = findObjs({ _type: "attribute", _characterid: "char3", name: "td" })[0];

        expect(char1TensionDie).toBeDefined();
        expect(char1TensionDie.set).toHaveBeenCalledWith({ current: "d8" });
        expect(char2TensionDie).toBeDefined();
        expect(char2TensionDie.set).toHaveBeenCalledWith({ current: "d8" });
        expect(char3TensionDie).toBeDefined();
        expect(char3TensionDie.set).toHaveBeenCalledWith({ current: "d8" });
      });
    });

    it("should add a new item to a repeating inventory section", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("graphic", { _id: "token1", represents: "char1" });

      const commandParts = [
        "!setattr",
        "--sel",
        "--fb-public",
        "--fb-header Aquiring Magic Item",
        "--fb-content The Cloak of Excellence from the chest by a character.",
        "--repeating_inventory_-CREATE_itemname|Cloak of Excellence",
        "--repeating_inventory_-CREATE_itemcount|1",
        "--repeating_inventory_-CREATE_itemweight|3",
        "--repeating_inventory_-CREATE_equipped|1",
        "--repeating_inventory_-CREATE_itemmodifiers|Item Type: Wondrous item, AC +2, Saving Throws +1",
        "--repeating_inventory_-CREATE_itemcontent|(Requires Attunment)A purple cape, that feels heavy to the touch, but light to carry. It has gnomish text embroiled near the collar."
      ];
      const command = commandParts.join(" ");
      const selected = [{ _id: "token1" } as unknown as Roll20Graphic["properties"]];

      executeCommand(command, { selected });

      await vi.waitFor(() => {
        expect(sendChat).toHaveBeenCalled();
        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" && call[1].includes("Aquiring Magic Item")
        );
        expect(feedbackCall).toBeDefined();

        const nameAttrs = findObjs({ _type: "attribute", _characterid: "char1" }).filter(a => a.get("name").includes("itemname"));
        expect(nameAttrs.length).toBeGreaterThan(0);
        const nameAttr = nameAttrs[0];

        const repeatingRowId = nameAttr.get("name").match(/repeating_inventory_([^_]+)_itemname/)?.[1];
        expect(repeatingRowId).toBeDefined();

        const itemName = findObjs({ _type: "attribute", name: `repeating_inventory_${repeatingRowId}_itemname` })[0];
        const itemCount = findObjs({ _type: "attribute", name: `repeating_inventory_${repeatingRowId}_itemcount` })[0];
        const itemWeight = findObjs({ _type: "attribute", name: `repeating_inventory_${repeatingRowId}_itemweight` })[0];
        const itemEquipped = findObjs({ _type: "attribute", name: `repeating_inventory_${repeatingRowId}_equipped` })[0];
        const itemModifiers = findObjs({ _type: "attribute", name: `repeating_inventory_${repeatingRowId}_itemmodifiers` })[0];
        const itemContent = findObjs({ _type: "attribute", name: `repeating_inventory_${repeatingRowId}_itemcontent` })[0];

        expect(itemName).toBeDefined();
        expect(itemName.set).toHaveBeenCalledWith({ current: "Cloak of Excellence" });
        expect(itemCount.set).toHaveBeenCalledWith({ current: "1" });
        expect(itemWeight.set).toHaveBeenCalledWith({ current: "3" });
        expect(itemEquipped.set).toHaveBeenCalledWith({ current: "1" });
        expect(itemModifiers.set).toHaveBeenCalledWith({ current: "Item Type: Wondrous item, AC +2, Saving Throws +1" });
        expect(itemContent.set).toHaveBeenCalledWith({ current: "(Requires Attunment)A purple cape, that feels heavy to the touch, but light to carry. It has gnomish text embroiled near the collar." });
      });
    });

    it("should process inline roll queries", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --Strength|15 --Dexterity|20");

      await vi.waitFor(() => {
        const strAttr = findObjs({ _type: "attribute", _characterid: "char1", name: "Strength" })[0];
        const dexAttr = findObjs({ _type: "attribute", _characterid: "char1", name: "Dexterity" })[0];

        expect(strAttr).toBeDefined();
        expect(strAttr.set).toHaveBeenCalledWith({ current: "15" });
        expect(dexAttr).toBeDefined();
        expect(dexAttr.set).toHaveBeenCalledWith({ current: "20" });
      });
    });

    it("should process an inline command within a chat message", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("I cast a spell and !setattr --charid char1 --Mana|10!!!", { type: "general" });

      await vi.waitFor(() => {
        const manaAttr = findObjs({ _type: "attribute", _characterid: "char1", name: "Mana" })[0];

        expect(manaAttr).toBeDefined();
        expect(manaAttr.set).toHaveBeenCalledWith({ current: "10" });
      });
    });

    it("should use character IDs directly to set attributes", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("character", { _id: "char2", name: "Character 2", controlledby: player.id });

      executeCommand("!setattr --charid char1,char2 --Level|5");

      await vi.waitFor(() => {
        const char1Level = findObjs({ _type: "attribute", _characterid: "char1", name: "Level" })[0];
        const char2Level = findObjs({ _type: "attribute", _characterid: "char2", name: "Level" })[0];

        expect(char1Level).toBeDefined();
        expect(char1Level.set).toHaveBeenCalledWith({ current: "5" });
        expect(char2Level).toBeDefined();
        expect(char2Level.set).toHaveBeenCalledWith({ current: "5" });
      });
    });

    it("should set multiple attributes on multiple characters", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("character", { _id: "char2", name: "Character 2", controlledby: player.id });

      executeCommand("!setattr --charid char1,char2 --Class|Fighter --Level|5 --HP|30|30");

      await vi.waitFor(() => {
        const char1Class = findObjs({ _type: "attribute", _characterid: "char1", name: "Class" })[0];
        const char1Level = findObjs({ _type: "attribute", _characterid: "char1", name: "Level" })[0];
        const char1HP = findObjs({ _type: "attribute", _characterid: "char1", name: "HP" })[0];

        expect(char1Class).toBeDefined();
        expect(char1Class.set).toHaveBeenCalledWith({ current: "Fighter" });
        expect(char1Level).toBeDefined();
        expect(char1Level.set).toHaveBeenCalledWith({ current: "5" });
        expect(char1HP).toBeDefined();
        expect(char1HP.set).toHaveBeenCalledWith({ current: "30", max: "30" });

        const char2Class = findObjs({ _type: "attribute", _characterid: "char2", name: "Class" })[0];
        const char2Level = findObjs({ _type: "attribute", _characterid: "char2", name: "Level" })[0];
        const char2HP = findObjs({ _type: "attribute", _characterid: "char2", name: "HP" })[0];

        expect(char2Class).toBeDefined();
        expect(char2Class.set).toHaveBeenCalledWith({ current: "Fighter" });
        expect(char2Level).toBeDefined();
        expect(char2Level.set).toHaveBeenCalledWith({ current: "5" });
        expect(char2HP).toBeDefined();
        expect(char2HP.set).toHaveBeenCalledWith({ current: "30", max: "30" });
      });
    });
  });

  describe("Attribute Modification Commands", () => {
    it("should increase Strength by 5 for selected characters", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("character", { _id: "char2", name: "Character 2", controlledby: player.id });
      createObj("character", { _id: "char3", name: "Character 3", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "Strength", current: "10" });
      createObj("attribute", { _characterid: "char2", name: "Strength", current: "15" });
      createObj("attribute", { _characterid: "char3", name: "Strength", current: "Very big" });
      const token1 = createObj("graphic", { _id: "token1", represents: "char1" });
      const token2 = createObj("graphic", { _id: "token2", represents: "char2" });
      const token3 = createObj("graphic", { _id: "token3", represents: "char3" });

      executeCommand("!setattr --sel --mod --Strength|5", { selected: [token1.properties, token2.properties, token3.properties] });

      await vi.waitFor(() => {
        const char1Strength = findObjs({ _type: "attribute", _characterid: "char1", name: "Strength" })[0];
        const char2Strength = findObjs({ _type: "attribute", _characterid: "char2", name: "Strength" })[0];
        const char3Strength = findObjs({ _type: "attribute", _characterid: "char3", name: "Strength" })[0];

        expect(char1Strength).toBeDefined();
        expect(char1Strength.set).toHaveBeenCalledWith({ current: "15" });
        expect(char2Strength).toBeDefined();
        expect(char2Strength.set).toHaveBeenCalledWith({ current: "20" });
        expect(char3Strength).toBeDefined();
        expect(char3Strength.get("current")).toBe("Very big");

        expect(sendChat).toHaveBeenCalled();
        const errorCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" && call[1].includes("is not number-valued")
        );
        expect(errorCall).toBeDefined();
      });
    });

    it("should handle --mod option for modifying attributes", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "Counter", current: "5" });
      createObj("attribute", { _characterid: "char1", name: "CounterMax", current: "3", max: "10" });

      executeCommand("!modattr --charid char1 --Counter|2 --CounterMax|1|2");

      await vi.waitFor(() => {
        const counter = findObjs({ _type: "attribute", _characterid: "char1", name: "Counter" })[0];
        const counterMax = findObjs({ _type: "attribute", _characterid: "char1", name: "CounterMax" })[0];

        expect(counter).toBeDefined();
        expect(counter.set).toHaveBeenCalledWith({ current: "7" });
        expect(counterMax).toBeDefined();
        expect(counterMax.set).toHaveBeenCalledWith({ current: "4", max: "12" });
      });
    });

    it("should modify attributes using the !mod command syntax", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "10", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "15", max: "30" });

      executeCommand("!modattr --charid char1 --HP|5 --MP|-3");

      await vi.waitFor(() => {
        const hp = findObjs({ _type: "attribute", _characterid: "char1", name: "HP" })[0];
        const mp = findObjs({ _type: "attribute", _characterid: "char1", name: "MP" })[0];

        expect(hp).toBeDefined();
        expect(hp.set).toHaveBeenCalledWith({ current: "15" });
        expect(mp).toBeDefined();
        expect(mp.set).toHaveBeenCalledWith({ current: "12" });
      });
    });

    it("should modify attributes with bounds using modbattr", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "5", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "15", max: "15" });
      createObj("attribute", { _characterid: "char1", name: "Stamina", current: "1", max: "10" });

      executeCommand("!modbattr --charid char1 --HP|10 --MP|5 --Stamina|-5");

      await vi.waitFor(() => {
        const hp = findObjs({ _type: "attribute", _characterid: "char1", name: "HP" })[0];
        const mp = findObjs({ _type: "attribute", _characterid: "char1", name: "MP" })[0];
        const stamina = findObjs({ _type: "attribute", _characterid: "char1", name: "Stamina" })[0];

        expect(hp).toBeDefined();
        expect(hp.set).toHaveBeenCalledWith({ current: "15" });
        expect(mp).toBeDefined();
        expect(mp.set).toHaveBeenCalledWith({ current: "15" });
        expect(stamina).toBeDefined();
        expect(stamina.set).toHaveBeenCalledWith({ current: "0" });
      });
    });

    it("should modify attributes with bounds using the !modb command syntax", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "5", max: "10" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "8", max: "10" });

      executeCommand("!modbattr --charid char1 --HP|10 --MP|-10");

      await vi.waitFor(() => {
        const hp = findObjs({ _type: "attribute", _characterid: "char1", name: "HP" })[0];
        const mp = findObjs({ _type: "attribute", _characterid: "char1", name: "MP" })[0];

        expect(hp).toBeDefined();
        expect(hp.set).toHaveBeenCalledWith({ current: "10" });
        expect(mp).toBeDefined();
        expect(mp.set).toHaveBeenCalledWith({ current: "0" });
      });
    });
  });

  describe("Attribute Deletion and Reset Commands", () => {
    it("should delete the gold attribute from all characters", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      vi.mocked(global.playerIsGM).mockReturnValue(true);
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("character", { _id: "char2", name: "Character 2", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "gold", current: "100" });
      createObj("attribute", { _characterid: "char2", name: "gold", current: "200" });
      createObj("attribute", { _characterid: "char1", name: "silver", current: "50" });

      executeCommand("!delattr --all --gold");

      await vi.waitFor(() => {
        expect(findObjs({ _type: "attribute", _characterid: "char1", name: "gold" })[0]).toBeUndefined();
        expect(findObjs({ _type: "attribute", _characterid: "char2", name: "gold" })[0]).toBeUndefined();
        expect(findObjs({ _type: "attribute", _characterid: "char1", name: "silver" })[0]).toBeDefined();
      });
    });

    it("should reset Ammo to its maximum value", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "Ammo", current: "3", max: "20" });
      const token1 = createObj("graphic", { _id: "token1", represents: "char1" });

      executeCommand("!setattr --sel --Ammo|%Ammo_max%", { selected: [token1.properties] });

      await vi.waitFor(() => {
        const ammo = findObjs({ _type: "attribute", _characterid: "char1", name: "Ammo" })[0];
        expect(ammo).toBeDefined();
        expect(ammo.set).toHaveBeenCalledWith({ current: "20" });
      });
    });

    it("should reset attributes to their maximum values with resetattr", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "10", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "5", max: "15" });
      createObj("attribute", { _characterid: "char1", name: "XP", current: "100", max: "" });

      executeCommand("!resetattr --charid char1 --HP --MP");

      await vi.waitFor(() => {
        const hp = findObjs({ _type: "attribute", _characterid: "char1", name: "HP" })[0];
        const mp = findObjs({ _type: "attribute", _characterid: "char1", name: "MP" })[0];
        const xp = findObjs({ _type: "attribute", _characterid: "char1", name: "XP" })[0];

        expect(hp).toBeDefined();
        expect(hp.set).toHaveBeenCalledWith({ current: "20" });
        expect(mp).toBeDefined();
        expect(mp.set).toHaveBeenCalledWith({ current: "15" });
        expect(xp).toBeDefined();
        expect(xp.get("current")).toBe("100");
      });
    });

    it("should reset attributes using the !reset command syntax", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "5", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "10", max: "30" });
      createObj("attribute", { _characterid: "char1", name: "XP", current: "100" });

      executeCommand("!resetattr --charid char1 --HP --MP");

      await vi.waitFor(() => {
        const hp = findObjs({ _type: "attribute", _characterid: "char1", name: "HP" })[0];
        const mp = findObjs({ _type: "attribute", _characterid: "char1", name: "MP" })[0];
        const xp = findObjs({ _type: "attribute", _characterid: "char1", name: "XP" })[0];

        expect(hp).toBeDefined();
        expect(hp.set).toHaveBeenCalledWith({ current: "20" });
        expect(mp).toBeDefined();
        expect(mp.set).toHaveBeenCalledWith({ current: "30" });
        expect(xp).toBeDefined();
        expect(xp.get("current")).toBe("100");
      });
    });

    it("should delete attributes using the !del command syntax", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "ToDelete1", current: "10" });
      createObj("attribute", { _characterid: "char1", name: "ToDelete2", current: "20" });
      createObj("attribute", { _characterid: "char1", name: "ToKeep", current: "30" });

      executeCommand("!delattr --charid char1 --ToDelete1 --ToDelete2");

      await vi.waitFor(() => {
        const toDelete1 = findObjs({ _type: "attribute", _characterid: "char1", name: "ToDelete1" })[0];
        const toDelete2 = findObjs({ _type: "attribute", _characterid: "char1", name: "ToDelete2" })[0];
        const toKeep = findObjs({ _type: "attribute", _characterid: "char1", name: "ToKeep" })[0];

        expect(toDelete1).toBeUndefined();
        expect(toDelete2).toBeUndefined();
        expect(toKeep).toBeDefined();
        expect(toKeep.get("current")).toBe("30");
      });
    });
  });

  describe("Targeting Options", () => {
    it("should set attributes for GM-only characters with allgm targeting mode", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      vi.mocked(global.playerIsGM).mockReturnValue(true);
      const gmCharOne = createObj("character", { _id: "gmchar1", name: "GM Character 1", controlledby: "" });
      const gmCharTwo = createObj("character", { _id: "gmchar2", name: "GM Character 2", controlledby: "" });
      const playerChar = createObj("character", { _id: "playerchar", name: "Player Character", controlledby: player.id });

      executeCommand("!setattr --allgm --Status|NPC");

      await vi.waitFor(() => {
        const gmChar1Status = findObjs({ _type: "attribute", _characterid: gmCharOne.id, name: "Status" })[0];
        const gmChar2Status = findObjs({ _type: "attribute", _characterid: gmCharTwo.id, name: "Status" })[0];
        const playerCharStatus = findObjs({ _type: "attribute", _characterid: playerChar.id, name: "Status" })[0];

        expect(gmChar1Status).toBeDefined();
        expect(gmChar1Status.set).toHaveBeenCalledWith({ current: "NPC" });

        expect(gmChar2Status).toBeDefined();
        expect(gmChar2Status.set).toHaveBeenCalledWith({ current: "NPC" });

        expect(playerCharStatus).toBeUndefined();
      });
    });

    it("should set attributes for player-controlled characters with allplayers targeting mode", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      vi.mocked(global.playerIsGM).mockReturnValue(true);
      createObj("character", { _id: "playerchar1", name: "Player Character 1", controlledby: player.id });
      createObj("character", { _id: "playerchar2", name: "Player Character 2", controlledby: player.id });
      createObj("character", { _id: "gmchar", name: "GM Character", controlledby: "" });

      executeCommand("!setattr --allplayers --CharType|PC");

      await vi.waitFor(() => {
        const playerChar1Type = findObjs({ _type: "attribute", _characterid: "playerchar1", name: "CharType" })[0];
        const playerChar2Type = findObjs({ _type: "attribute", _characterid: "playerchar2", name: "CharType" })[0];
        const gmCharType = findObjs({ _type: "attribute", _characterid: "gmchar", name: "CharType" })[0];

        expect(playerChar1Type).toBeDefined();
        expect(playerChar1Type.set).toHaveBeenCalledWith({ current: "PC" });

        expect(playerChar2Type).toBeDefined();
        expect(playerChar2Type.set).toHaveBeenCalledWith({ current: "PC" });

        expect(gmCharType).toBeUndefined();
      });
    });
  });

  describe("Attribute Value Processing", () => {
    it("should evaluate expressions using attribute references", async () => {
      vi.mocked(playerIsGM).mockReturnValue(true);
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      const char = createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: char.id, name: "attr1", current: "3" });
      createObj("attribute", { _characterid: char.id, name: "attr2", current: "2" });
      const token1 = createObj("graphic", { _id: "token1", represents: char.id });

      executeCommand("!setattr --sel --evaluate --attr3|2*%attr1% + 7 - %attr2%", { selected: [token1.properties] });

      await vi.waitFor(() => {
        const attr3 = findObjs({ _type: "attribute", _characterid: "char1", name: "attr3" })[0];
        expect(attr3).toBeDefined();
        expect(attr3.set).toHaveBeenCalledWith({ current: "11" });
      });
    });

    it("should handle --replace option", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --replace --charid char1 --Description|This text has <special> characters; and should be `replaced`");

      await vi.waitFor(() => {
        const desc = findObjs({ _type: "attribute", _characterid: "char1", name: "Description" })[0];
        expect(desc).toBeDefined();
        expect(desc.set).toHaveBeenCalledWith({ current: "This text has [special] characters? and should be @replaced@" });
      });
    });

    it("should honor multiple modifier flags used together", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "ExistingAttr", current: "10" });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --silent --evaluate --ExistingAttr|20*2");

      await vi.waitFor(() => {
        const existingAttr = findObjs({ _type: "attribute", _characterid: "char1", name: "ExistingAttr" })[0];
        expect(existingAttr).toBeDefined();
        expect(existingAttr.set).toHaveBeenCalledWith({ current: "40" });

        expect(sendChat).not.toHaveBeenCalled();
      });
    });
  });

  describe("Configuration Options", () => {
    it("should handle configuration commands", async () => {
      vi.mocked(global.playerIsGM).mockReturnValue(true);
      global.createObj("player", { _id: "example-player-id", _displayname: "Test Player" });

      executeCommand("!setattr-config --players-can-modify", { playerid: "example-player-id" });
      expect(global.state.ChatSetAttr.playersCanModify).toBeFalsy();
      expect(sendChat).toHaveBeenCalledTimes(1);

      executeCommand("!setattr-config --players-can-evaluate", { playerid: "example-player-id" });
      expect(global.state.ChatSetAttr.playersCanEvaluate).toBeFalsy();
      expect(sendChat).toHaveBeenCalledTimes(2);

      executeCommand("!setattr-config --use-workers", { playerid: "example-player-id" });
      expect(global.state.ChatSetAttr.useWorkers).toBeFalsy();
      expect(sendChat).toHaveBeenCalledTimes(3);
    });

    it("should respect player permissions", async () => {
      createObj("character", { _id: "char1", name: "Player Character", controlledby: "player123" });

      const state = global.state as { ChatSetAttr: StateConfig };
      const originalConfig = state.ChatSetAttr.playersCanModify;
      state.ChatSetAttr.playersCanModify = false;

      const originalPlayerIsGM = global.playerIsGM;
      global.playerIsGM = vi.fn(() => false);

      executeCommand("!setattr --charid char1 --Strength|18", { playerid: "differentPlayer456" });

      await vi.waitFor(() => {
        const strength = findObjs({ _type: "attribute", _characterid: "char1", name: "Strength" })[0];
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
      vi.mocked(global.playerIsGM).mockReturnValue(true);
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --fb-public --Attribute|42");

      await vi.waitFor(() => {
        const attr = findObjs({ _type: "attribute", _characterid: "char1", name: "Attribute" })[0];
        expect(attr).toBeDefined();
        expect(attr.set).toHaveBeenCalledWith({ current: "42" });

        const feedbackCalls = vi.mocked(sendChat).mock.calls.filter(call =>
          call[1] && typeof call[1] === "string" &&
          call[1].includes("Setting Attribute") &&
          !call[1].startsWith("/w ")
        );

        expect(feedbackCalls.length).toBeGreaterThan(0);
      });
    });

    it("should use custom sender with --fb-from option", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --fb-from Wizard --Spell|Fireball");

      await vi.waitFor(() => {
        const attr = findObjs({ _type: "attribute", _characterid: "char1", name: "Spell" })[0];
        expect(attr).toBeDefined();
        expect(attr.set).toHaveBeenCalledWith({ current: "Fireball" });

        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[0] === "Wizard" &&
          call[1] && typeof call[1] === "string" &&
          call[1].includes("Setting Spell")
        );

        expect(feedbackCall).toBeDefined();
      });
    });

    it("should use custom header with --fb-header option", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --fb-header Magic Item Acquired --Item|Staff of Power");

      await vi.waitFor(() => {
        const attr = findObjs({ _type: "attribute", _characterid: "char1", name: "Item" })[0];
        expect(attr).toBeDefined();
        expect(attr.set).toHaveBeenCalledWith({ current: "Staff of Power" });

        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" &&
          call[1].includes("Magic Item Acquired") &&
          !call[1].includes("Setting attributes")
        );

        expect(feedbackCall).toBeDefined();
      });
    });

    it("should use custom content with --fb-content option", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --fb-header \"Level Up\" --fb-content \"_CHARNAME_ is now level _CUR0_!\" --Level|5");

      await vi.waitFor(() => {
        const attr = findObjs({ _type: "attribute", _characterid: "char1", name: "Level" })[0];
        expect(attr).toBeDefined();
        expect(attr.set).toHaveBeenCalledWith({ current: "5" });

        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" &&
          call[1].includes("Character 1 is now level 5!")
        );

        expect(feedbackCall).toBeDefined();
      });
    });

    it("should combine all feedback options together", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      const character = createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      const token = createObj("graphic", { _id: "token1", represents: character.id });

      const callParts = [
        "!setattr",
        "--sel",
        "--fb-public",
        "--fb-from Dungeon_Master",
        "--fb-header \"Combat Stats Updated\"",
        "--fb-content \"_CHARNAME_'s health increased to _CUR0_!\"",
        "--HP|25"
      ];

      const selected = [token.properties];

      vi.mocked(sendChat).mockRestore();
      executeCommand(callParts.join(" "), { selected });

      await vi.waitFor(() => {
        const attr = findObjs({ _type: "attribute", _characterid: "char1", name: "HP" })[0];
        expect(attr).toBeDefined();
        expect(attr.set).toHaveBeenCalledWith({ current: "25" });

        const feedbackCalls = vi.mocked(global.sendChat).mock.calls.find(call =>
          call[0] === "Dungeon_Master" &&
          !call[1].startsWith("/w ") &&
          call[1].includes("Combat Stats Updated") &&
          call[1].includes("Character 1's health increased to 25!")
        );

        expect(feedbackCalls).toBeDefined();
      });
    });
  });

  describe("Message Suppression Options", () => {
    it("should suppress feedback messages when using the --silent option", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --silent --TestAttr|42");

      await vi.waitFor(() => {
        const testAttr = findObjs({ _type: "attribute", _characterid: "char1", name: "TestAttr" })[0];
        expect(testAttr).toBeDefined();
        expect(testAttr.set).toHaveBeenCalledWith({ current: "42" });

        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" && call[1].includes("Setting TestAttr")
        );
        expect(feedbackCall).toBeUndefined();
      });
    });

    it("should suppress error messages when using the --mute option", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
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
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --nocreate --NewAttribute|50");

      await vi.waitFor(() => {
        const newAttr = findObjs({ _type: "attribute", _characterid: "char1", name: "NewAttribute" })[0];
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
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      const mockObserver = vi.fn();

      ChatSetAttr.registerObserver("add", mockObserver);

      executeCommand("!setattr --charid char1 --NewAttribute|42");

      await vi.waitFor(() => {
        expect(mockObserver).toHaveBeenCalled();
        const calls = mockObserver.mock.calls;
        const hasAddCall = calls.some(call => {
          const attr = call[0];
          return attr && attr.get("name") === "NewAttribute" && attr.get("current") === "42";
        });
        expect(hasAddCall).toBe(true);
      });
    });

    it("should observe attribute changes with registered observers", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _id: "attr1", _characterid: "char1", name: "ExistingAttr", current: "10" });
      const mockObserver = vi.fn();

      ChatSetAttr.registerObserver("change", mockObserver);

      executeCommand("!setattr --charid char1 --ExistingAttr|20");

      await vi.waitFor(() => {
        expect(mockObserver).toHaveBeenCalled();
        const calls = mockObserver.mock.calls;
        const firstCall = calls[0];

        expect(firstCall[0]).toBeDefined();
        expect(firstCall[0].get("name")).toBe("ExistingAttr");
        expect(firstCall[0].get("current")).toBe("20");
      });
    });

    it("should observe attribute deletions with registered observers", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _id: "attr1", _characterid: "char1", name: "DeleteMe", current: "10" });
      const mockObserver = vi.fn();

      ChatSetAttr.registerObserver("destroy", mockObserver);

      executeCommand("!delattr --charid char1 --DeleteMe");

      await vi.waitFor(() => {
        expect(mockObserver).toHaveBeenCalled();

        const calls = mockObserver.mock.calls;
        const firstCall = calls[0];

        expect(firstCall[0]).toBeDefined();
        expect(firstCall[0].get("name")).toBe("DeleteMe");
        expect(firstCall[0].get("current")).toBe("10");
      });
    });
  });

  describe("Repeating Sections", () => {
    it("should create repeating section attributes", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --repeating_weapons_-CREATE_weaponname|Longsword --repeating_weapons_-CREATE_damage|1d8");

      await vi.waitFor(() => {
        const nameAttr = findObjs({ _type: "attribute", _characterid: "char1" }).find(a => a.get("name")?.includes("weaponname"));
        expect(nameAttr).toBeDefined();

        if (!nameAttr) return expect.fail("nameAttr is undefined");

        const name = nameAttr.get("name");
        const current = nameAttr.get("current");
        const rowID = name.match(/repeating_weapons_([^_]+)_weaponname/)?.[1];

        expect(name).toBe(`repeating_weapons_${rowID}_weaponname`);
        expect(current).toBe("Longsword");

        const damageAttr = findObjs({ _type: "attribute", _characterid: "char1", name: `repeating_weapons_${rowID}_damage` })[0];
        expect(damageAttr).toBeDefined();
        expect(damageAttr.get("current")).toBe("1d8");
      });
    });

    it("should adjust number of uses remaining for an ability", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      const character = createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      const attr = createObj("attribute", { _id: "attr1", _characterid: "char1", name: "repeating_ability_-exampleid_used", current: "3" });
      const token = createObj("graphic", { _id: "token1", represents: character.id });
      const selected = [token.properties];

      const commandParts = [
        "!setattr",
        "--charid char1",
        "--repeating_ability_-exampleid_used|[[?{How many are left?|0}]]"
      ];
      executeCommand(commandParts.join(" "), {
        selected,
        inputs: ["2"],
      });

      await vi.waitFor(() => {
        expect(attr.set).toHaveBeenCalled();
        expect(attr.set).toHaveBeenCalledWith({ current: "2" });
      });
    });

    it("should toggle a buff on or off", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      const character = createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      const attribute = createObj("attribute", { _id: "attr1", _characterid: character.id, name: "repeating_buff2_-example_enable_toggle", current: "0" });
      const token = createObj("graphic", { _id: "token1", represents: "char1" });
      const selected = [token.properties];

      executeCommand("!setattr --sel --repeating_buff2_-example_enable_toggle|[[1-@{selected|repeating_buff2_-example_enable_toggle}]]", {
        selected,
      });

      await vi.waitFor(() => {
        expect(attribute).toBeDefined();
        expect(attribute.get("current")).toBe("1");
        expect(attribute.set).toHaveBeenCalled();
        expect(attribute.set).toHaveBeenCalledWith({ current: "1" });
      });

      executeCommand("!setattr --sel --repeating_buff2_-example_enable_toggle|[[1-@{selected|repeating_buff2_-example_enable_toggle}]]", {
        selected,
      });

      await vi.waitFor(() => {
        expect(attribute).toBeDefined();
        expect(attribute.get("current")).toBe("0");
        expect(attribute.set).toHaveBeenCalled();
        expect(attribute.set).toHaveBeenCalledWith({ current: "0" });
      });
    });

    const createRepeatingObjects = () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      const character = createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      const firstWeaponNameAttr = createObj("attribute", {
        _id: "attr1",
        _characterid: character.id,
        name: "repeating_weapons_-abc123_weaponname",
        current: "Longsword"
      });
      const firstWeaponDamageAttr = createObj("attribute", {
        _id: "attr2",
        _characterid: character.id,
        name: "repeating_weapons_-abc123_damage",
        current: "1d8"
      });

      const secondWeaponNameAttr = createObj("attribute", {
        _id: "attr3",
        _characterid: character.id,
        name: "repeating_weapons_-def456_weaponname",
        current: "Dagger"
      });
      const secondWeaponDamageAttr = createObj("attribute", {
        _id: "attr4",
        _characterid: character.id,
        name: "repeating_weapons_-def456_damage",
        current: "1d4"
      });

      const thirdWeaponNameAttr = createObj("attribute", {
        _id: "attr5",
        _characterid: character.id,
        name: "repeating_weapons_-ghi789_weaponname",
        current: "Bow"
      });
      const thirdWeaponDamageAttr = createObj("attribute", {
        _id: "attr6",
        _characterid: character.id,
        name: "repeating_weapons_-ghi789_damage",
        current: "1d6"
      });

      const reporder = createObj("attribute", {
        _id: "attr7",
        _characterid: character.id,
        name: "_reporder_" + "repeating_weapons",
        current: "abc123,def456,ghi789"
      });

      const token = createObj("graphic", { _id: "token1", represents: character.id });

      return {
        player,
        character,
        firstWeaponNameAttr,
        firstWeaponDamageAttr,
        secondWeaponNameAttr,
        secondWeaponDamageAttr,
        thirdWeaponNameAttr,
        thirdWeaponDamageAttr,
        reporder,
        token
      };
    };


    it("should handle deleting repeating section attributes referenced by index", async () => {
      // arrange
      const { token, firstWeaponNameAttr, secondWeaponNameAttr, thirdWeaponNameAttr } = createRepeatingObjects();
      const selected = [token.properties];

      // act
      executeCommand("!delattr --sel --repeating_weapons_$1_weaponname", { selected });

      // assert
      await vi.waitFor(() => {
        expect(firstWeaponNameAttr.remove).not.toHaveBeenCalled();

        // Second weapon (Dagger) should be deleted
        expect(secondWeaponNameAttr.remove).toHaveBeenCalled();

        // Third weapon should still exist
        expect(thirdWeaponNameAttr.remove).not.toHaveBeenCalled();
      });
    });

    it("should handle modifying repeating section attributes referenced by index", async () => {
      // arrange
      const { firstWeaponDamageAttr, secondWeaponDamageAttr, token } = createRepeatingObjects();
      const selected = [token.properties];

      // act - Modify the damage of the first weapon ($0 index)
      executeCommand(
        "!setattr --sel --nocreate --repeating_weapons_$0_damage|2d8",
        { selected }
      );

      // Wait for the operation to complete
      await vi.waitFor(() => {
        // assert - First weapon damage should be updated
        expect(firstWeaponDamageAttr.get("current")).toBe("2d8");
        expect(firstWeaponDamageAttr.set).toHaveBeenCalledWith({ current: "2d8" });

        expect(secondWeaponDamageAttr.get("current")).toBe("1d4");
        expect(secondWeaponDamageAttr.set).not.toHaveBeenCalled();
      });
    });

    it("should handle creating new repeating section attributes after deletion", async () => {
      // arrange - Create initial repeating section attributes
      const { token } = createRepeatingObjects();

      // act - Create a new attribute in the last weapon ($1 index after deletion)
      const selected = [token.properties];
      executeCommand(
        "!setattr --sel --repeating_weapons_$1_newlycreated|5",
        { selected }
      );

      // Wait for the operation to complete
      await vi.waitFor(() => {
        const attackBonus = findObjs({
          _type: "attribute",
          _characterid: "char1",
          name: "repeating_weapons_-def456_newlycreated"
        })[0];
        expect(attackBonus).toBeDefined();
        expect(attackBonus.get("current")).toBe("5");
      });
    });
  });

  describe("Delayed Processing", () => {
    it("should process characters sequentially with delays", async () => {
      vi.useFakeTimers();

      // Create multiple characters
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("character", { _id: "char2", name: "Character 2", controlledby: player.id });
      createObj("character", { _id: "char3", name: "Character 3", controlledby: player.id });

      // Set up spy on setTimeout to track when it's called
      const setTimeoutSpy = vi.spyOn(global, "setTimeout");

      // Execute a command that sets attributes on all three characters
      executeCommand("!setattr --charid char1,char2,char3 --TestAttr|42");
      vi.runAllTimers();

      // all three characters should eventually get their attributes
      await vi.waitFor(() => {
        const char1Attr = findObjs({ _type: "attribute", _characterid: "char1", name: "TestAttr" })[0];
        const char2Attr = findObjs({ _type: "attribute", _characterid: "char2", name: "TestAttr" })[0];
        const char3Attr = findObjs({ _type: "attribute", _characterid: "char3", name: "TestAttr" })[0];

        expect(char1Attr).toBeDefined();
        expect(char2Attr).toBeDefined();
        expect(char3Attr).toBeDefined();

        expect(char1Attr.set).toHaveBeenCalledWith({ current: "42" });
        expect(char2Attr.set).toHaveBeenCalledWith({ current: "42" });
        expect(char3Attr.set).toHaveBeenCalledWith({ current: "42" });
      });

      expect(setTimeoutSpy).toHaveBeenCalledTimes(3);

      // Verify the specific parameters of setTimeout calls
      const timeoutCalls = setTimeoutSpy.mock.calls.filter(
        call => typeof call[0] === "function" && call[1] === 50
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
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      for (let i = 1; i <= 50; i++) {
        createObj("character", { _id: `char${i}`, name: `Character ${i}`, controlledby: player.id });
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
