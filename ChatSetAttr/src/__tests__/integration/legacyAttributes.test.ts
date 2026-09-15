import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as ChatSetAttr from "../../modules/main";
import { resetAllObjects } from "../../__mocks__/apiObjects.mock";
import { resetAllCallbacks } from "../../__mocks__/eventHandling.mock";
import { getBeaconAttributeNames } from "../../__mocks__/beaconAttributes.mock";


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
    ChatSetAttr.registerHandlers();
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
      createObj("attribute", { _id: "strengthchar1", _characterid: charOne.id, name: "Strength", current: "10" });
      createObj("attribute", { _id: "strengthchar2", _characterid: charTwo.id, name: "Strength", current: "12" });
      const tokenOne = createObj("graphic", { _id: "token1", represents: charOne.id, _subtype: "token" });
      const tokenTwo = createObj("graphic", { _id: "token2", represents: charTwo.id, _subtype: "token" });
      const selectedTokens = [tokenOne.properties, tokenTwo.properties];

      // act
      executeCommand(
        "!setattr --sel --Strength|15",
        { selected: selectedTokens },
      );

      // assert
      await vi.waitFor(async () => {
        const charOneStrength = await libSmartAttributes.getAttribute("char1", "Strength");
        const charTwoStrength = await libSmartAttributes.getAttribute("char2", "Strength");

        expect(charOneStrength).toBeDefined();
        expect(charOneStrength).toBe("15");
        expect(charTwoStrength).toBeDefined();
        expect(charTwoStrength).toBe("15");
      });
    });

    it("should set HP and Dex for character named John", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "john1", name: "John", controlledby: player.id });
      createObj("character", { _id: "john2", name: "john", controlledby: player.id });
      createObj("character", { _id: "char3", name: "NotJohn", controlledby: player.id });

      executeCommand("!setattr --name John --HP|17|27 --Dex|10");

      await vi.waitFor(async () => {
        const johnHP = await libSmartAttributes.getAttribute("john1", "HP", "current");
        const johnMaxHP = await libSmartAttributes.getAttribute("john1", "HP", "max");
        const johnDex = await libSmartAttributes.getAttribute("john1", "Dex");

        expect(johnHP).toBeDefined();
        expect(johnHP).toBe("17");
        expect(johnMaxHP).toBeDefined();
        expect(johnMaxHP).toBe("27");
        expect(johnDex).toBeDefined();
        expect(johnDex).toBe("10");

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

      await vi.waitFor(async () => {
        const char1TensionDie = await libSmartAttributes.getAttribute("char1", "td");
        const char2TensionDie = await libSmartAttributes.getAttribute("char2", "td");
        const char3TensionDie = await libSmartAttributes.getAttribute("char3", "td");

        expect(char1TensionDie).toBeDefined();
        expect(char1TensionDie).toBe("d8");
        expect(char2TensionDie).toBeDefined();
        expect(char2TensionDie).toBe("d8");
        expect(char3TensionDie).toBeDefined();
        expect(char3TensionDie).toBe("d8");
      });
    });

    it("should add a new item to a repeating inventory section", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("graphic", { _id: "token1", represents: "char1", _subtype: "token" });

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

      await vi.waitFor(async () => {
        expect(sendChat).toHaveBeenCalled();

        const repeatingRowId = "-unique-rowid-1234";
        const itemName = await libSmartAttributes.getAttribute("char1", `user.repeating_inventory_${repeatingRowId}_itemname`);
        const itemCount = await libSmartAttributes.getAttribute("char1", `user.repeating_inventory_${repeatingRowId}_itemcount`);
        const itemWeight = await libSmartAttributes.getAttribute("char1", `user.repeating_inventory_${repeatingRowId}_itemweight`);
        const itemEquipped = await libSmartAttributes.getAttribute("char1", `user.repeating_inventory_${repeatingRowId}_equipped`);
        const itemModifiers = await libSmartAttributes.getAttribute("char1", `user.repeating_inventory_${repeatingRowId}_itemmodifiers`);
        const itemContent = await libSmartAttributes.getAttribute("char1", "user.repeating_inventory_-unique-rowid-1234_itemcontent");

        expect(itemName).toBe("Cloak of Excellence");
        expect(itemCount).toBe("1");
        expect(itemWeight).toBe("3");
        expect(itemEquipped).toBe("1");
        expect(itemModifiers).toBe("Item Type: Wondrous item, AC +2, Saving Throws +1");
        expect(itemContent).toBe("(Requires Attunment)A purple cape, that feels heavy to the touch, but light to carry. It has gnomish text embroiled near the collar.");
      });
    });

    it("should process inline roll queries", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --Strength|15 --Dexterity|20");

      await vi.waitFor(async () => {
        const strAttr = await libSmartAttributes.getAttribute("char1", "Strength");
        const dexAttr = await libSmartAttributes.getAttribute("char1", "Dexterity");

        expect(strAttr).toBeDefined();
        expect(strAttr).toBe("15");
        expect(dexAttr).toBeDefined();
        expect(dexAttr).toBe("20");
      });
    });

    it("should process an inline command within a chat message", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("I cast a spell and !setattr --charid char1 --Mana|10!!!", { type: "general" });

      await vi.waitFor(async () => {
        const manaAttr = await libSmartAttributes.getAttribute("char1", "Mana");

        expect(manaAttr).toBeDefined();
        expect(manaAttr).toBe("10");
      });
    });

    it("should use character IDs directly to set attributes", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("character", { _id: "char2", name: "Character 2", controlledby: player.id });

      executeCommand("!setattr --charid char1,char2 --Level|5");

      await vi.waitFor(async () => {
        const char1Level = await libSmartAttributes.getAttribute("char1", "Level");
        const char2Level = await libSmartAttributes.getAttribute("char2", "Level");

        expect(char1Level).toBeDefined();
        expect(char1Level).toBe("5");
        expect(char2Level).toBeDefined();
        expect(char2Level).toBe("5");
      });
    });

    it("should set multiple attributes on multiple characters", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("character", { _id: "char2", name: "Character 2", controlledby: player.id });

      executeCommand("!setattr --charid char1,char2 --Class|Fighter --Level|5 --HP|30|30");

      await vi.waitFor(async () => {
        const char1Class = await libSmartAttributes.getAttribute("char1", "Class");
        const char1Level = await libSmartAttributes.getAttribute("char1", "Level");
        const char1HP = await libSmartAttributes.getAttribute("char1", "HP");
        const char1HPMax = await libSmartAttributes.getAttribute("char1", "HP", "max");

        expect(char1Class).toBeDefined();
        expect(char1Class).toBe("Fighter");
        expect(char1Level).toBeDefined();
        expect(char1Level).toBe("5");
        expect(char1HP).toBeDefined();
        expect(char1HP).toBe("30");
        expect(char1HPMax).toBeDefined();
        expect(char1HPMax).toBe("30");

        const char2Class = await libSmartAttributes.getAttribute("char2", "Class");
        const char2Level = await libSmartAttributes.getAttribute("char2", "Level");
        const char2HP = await libSmartAttributes.getAttribute("char2", "HP");
        const char2HPMax = await libSmartAttributes.getAttribute("char2", "HP", "max");

        expect(char2Class).toBeDefined();
        expect(char2Class).toBe("Fighter");
        expect(char2Level).toBeDefined();
        expect(char2Level).toBe("5");
        expect(char2HP).toBeDefined();
        expect(char2HP).toBe("30");
        expect(char2HPMax).toBeDefined();
        expect(char2HPMax).toBe("30");
      });
    });
  });

  describe("Attribute Modification Commands", () => {
    it("should increase Strength by 5 for selected characters", async () => {
      // This is failing because we're not currently outputting to chat
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("character", { _id: "char2", name: "Character 2", controlledby: player.id });
      createObj("character", { _id: "char3", name: "Character 3", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "Strength", current: "10" });
      createObj("attribute", { _characterid: "char2", name: "Strength", current: "15" });
      createObj("attribute", { _characterid: "char3", name: "Strength", current: "Very big" });
      const token1 = createObj("graphic", { _id: "token1", represents: "char1", _subtype: "token" });
      const token2 = createObj("graphic", { _id: "token2", represents: "char2", _subtype: "token" });
      const token3 = createObj("graphic", { _id: "token3", represents: "char3", _subtype: "token" });

      executeCommand("!setattr --sel --mod --Strength|5", { selected: [token1.properties, token2.properties, token3.properties] });

      await vi.waitFor(async () => {
        const char1Strength = await libSmartAttributes.getAttribute("char1", "Strength");
        const char2Strength = await libSmartAttributes.getAttribute("char2", "Strength");
        const char3Strength = await libSmartAttributes.getAttribute("char3", "Strength");

        expect(char1Strength).toBeDefined();
        expect(char1Strength).toBe(15);
        expect(char2Strength).toBeDefined();
        expect(char2Strength).toBe(20);
        expect(char3Strength).toBeDefined();
        expect(char3Strength).toBe("Very big");

        expect(sendChat).toHaveBeenCalled();
        const mockCalls = vi.mocked(sendChat).mock.calls;
        const errorCall = mockCalls.find(call =>
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

      await vi.waitFor(async () => {
        const counter = await libSmartAttributes.getAttribute("char1", "Counter");
        const counterMax = await libSmartAttributes.getAttribute("char1", "CounterMax");
        const counterMaxMax = await libSmartAttributes.getAttribute("char1", "CounterMax", "max");

        expect(counter).toBeDefined();
        expect(counter).toBe(7);
        expect(counterMax).toBeDefined();
        expect(counterMax).toBe(4);
        expect(counterMaxMax).toBeDefined();
        expect(counterMaxMax).toBe(12);
      });
    });

    it("should modify attributes using the !mod command syntax", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "10", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "15", max: "30" });

      executeCommand("!modattr --charid char1 --HP|5 --MP|-3");

      await vi.waitFor(async () => {
        const hp = await libSmartAttributes.getAttribute("char1", "HP");
        const mp = await libSmartAttributes.getAttribute("char1", "MP");

        expect(hp).toBeDefined();
        expect(hp).toBe(15);
        expect(mp).toBeDefined();
        expect(mp).toBe(12);
      });
    });

    it("should modify attributes with bounds using modbattr", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "5", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "15", max: "15" });
      createObj("attribute", { _characterid: "char1", name: "Stamina", current: "1", max: "10" });

      executeCommand("!modbattr --charid char1 --HP|10 --MP|5 --Stamina|-5");

      await vi.waitFor(async () => {
        const hp = await libSmartAttributes.getAttribute("char1", "HP");
        const mp = await libSmartAttributes.getAttribute("char1", "MP");
        const stamina = await libSmartAttributes.getAttribute("char1", "Stamina");

        expect(hp).toBeDefined();
        expect(hp).toBe(15);
        expect(mp).toBeDefined();
        expect(mp).toBe(15);
        expect(stamina).toBeDefined();
        expect(stamina).toBe(0);
      });
    });

    it("should modify attributes with bounds using the !modb command syntax", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "5", max: "10" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "8", max: "10" });

      executeCommand("!modbattr --charid char1 --HP|10 --MP|-10");

      await vi.waitFor(async () => {
        const hp = await libSmartAttributes.getAttribute("char1", "HP");
        const mp = await libSmartAttributes.getAttribute("char1", "MP");

        expect(hp).toBeDefined();
        expect(hp).toBe(10);
        expect(mp).toBeDefined();
        expect(mp).toBe(0);
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

      await vi.waitFor(async () => {
        const char1Gold = await libSmartAttributes.getAttribute("char1", "gold");
        const char2Gold = await libSmartAttributes.getAttribute("char2", "gold");
        const char1Silver = await libSmartAttributes.getAttribute("char1", "silver");

        expect(char1Gold).toBeUndefined();
        expect(char2Gold).toBeUndefined();
        expect(char1Silver).toBeDefined();
        expect(char1Silver).toBe("50");
      });
    });

    it("should reset Ammo to its maximum value", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "Ammo", current: "3", max: "20" });
      const token1 = createObj("graphic", { _id: "token1", represents: "char1", _subtype: "token" });

      executeCommand("!setattr --sel --Ammo|%Ammo_max%", { selected: [token1.properties] });

      await vi.waitFor(async () => {
        const ammo = await libSmartAttributes.getAttribute("char1", "Ammo");
        expect(ammo).toBeDefined();
        expect(ammo).toBe("20");
      });
    });

    it("should reset attributes to their maximum values with resetattr", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "10", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "5", max: "15" });
      createObj("attribute", { _characterid: "char1", name: "XP", current: "100", max: "" });

      executeCommand("!resetattr --charid char1 --HP --MP");

      await vi.waitFor(async () => {
        const hp = await libSmartAttributes.getAttribute("char1", "HP");
        const mp = await libSmartAttributes.getAttribute("char1", "MP");
        const xp = await libSmartAttributes.getAttribute("char1", "XP");

        expect(hp).toBeDefined();
        expect(hp).toBe(20);
        expect(mp).toBeDefined();
        expect(mp).toBe(15);
        expect(xp).toBeDefined();
        expect(xp).toBe("100");
      });
    });

    it("should reset attributes using the !reset command syntax", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "HP", current: "5", max: "20" });
      createObj("attribute", { _characterid: "char1", name: "MP", current: "10", max: "30" });
      createObj("attribute", { _characterid: "char1", name: "XP", current: "100" });

      executeCommand("!resetattr --charid char1 --HP --MP");

      await vi.waitFor(async () => {
        const hp = await libSmartAttributes.getAttribute("char1", "HP");
        const mp = await libSmartAttributes.getAttribute("char1", "MP");
        const xp = await libSmartAttributes.getAttribute("char1", "XP");

        expect(hp).toBeDefined();
        expect(hp).toBe(20);
        expect(mp).toBeDefined();
        expect(mp).toBe(30);
        expect(xp).toBeDefined();
        expect(xp).toBe("100");
      });
    });

    it("should delete attributes using the !del command syntax", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "ToDelete1", current: "10" });
      createObj("attribute", { _characterid: "char1", name: "ToDelete2", current: "20" });
      createObj("attribute", { _characterid: "char1", name: "ToKeep", current: "30" });

      executeCommand("!delattr --charid char1 --ToDelete1 --ToDelete2");

      await vi.waitFor(async () => {
        const toDelete1 = await libSmartAttributes.getAttribute("char1", "ToDelete1");
        const toDelete2 = await libSmartAttributes.getAttribute("char1", "ToDelete2");
        const toKeep = await libSmartAttributes.getAttribute("char1", "ToKeep");

        expect(toDelete1).toBeUndefined();
        expect(toDelete2).toBeUndefined();
        expect(toKeep).toBeDefined();
        expect(toKeep).toBe("30");
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

      await vi.waitFor(async () => {
        const gmChar1Status = await libSmartAttributes.getAttribute(gmCharOne.id, "Status");
        const gmChar2Status = await libSmartAttributes.getAttribute(gmCharTwo.id, "Status");
        const playerCharStatus = await libSmartAttributes.getAttribute(playerChar.id, "Status");

        expect(gmChar1Status).toBeDefined();
        expect(gmChar1Status).toBe("NPC");

        expect(gmChar2Status).toBeDefined();
        expect(gmChar2Status).toBe("NPC");

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

      await vi.waitFor(async () => {
        const playerChar1Type = await libSmartAttributes.getAttribute("playerchar1", "CharType");
        const playerChar2Type = await libSmartAttributes.getAttribute("playerchar2", "CharType");
        const gmCharType = await libSmartAttributes.getAttribute("gmchar", "CharType");

        expect(playerChar1Type).toBeDefined();
        expect(playerChar1Type).toBe("PC");

        expect(playerChar2Type).toBeDefined();
        expect(playerChar2Type).toBe("PC");

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
      const token1 = createObj("graphic", { _id: "token1", represents: char.id, _subtype: "token" });

      executeCommand("!setattr --sel --evaluate --attr3|2*%attr1% + 7 - %attr2%", { selected: [token1.properties] });

      await vi.waitFor(async () => {
        const attr3 = await libSmartAttributes.getAttribute("char1", "attr3");
        expect(attr3).toBeDefined();
        expect(attr3).toBe(11);
      });
    });

    it("should handle --replace option", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --replace --charid char1 --Description|This text has <special> characters; and should be `replaced`");

      await vi.waitFor(async () => {
        const desc = await libSmartAttributes.getAttribute("char1", "Description");
        expect(desc).toBeDefined();
        expect(desc).toBe("This text has [special] characters? and should be @replaced@");
      });
    });

    it("should honor multiple modifier flags used together", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _characterid: "char1", name: "ExistingAttr", current: "10" });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --silent --evaluate --ExistingAttr|20*2");

      await vi.waitFor(async () => {
        const existingAttr = await libSmartAttributes.getAttribute("char1", "ExistingAttr");
        expect(existingAttr).toBeDefined();
        expect(existingAttr).toBe(40);

        expect(sendChat).not.toHaveBeenCalled();
      });
    });
  });

  describe("Configuration Options", () => {
    it("should handle configuration commands", async () => {
      global.state.ChatSetAttr.config = {
        playersCanModify: true,
        playersCanEvaluate: true,
        useWorkers: true
      };
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
      createObj("player", { _id: "player123", _displayname: "Regular Player" });
      createObj("player", { _id: "differentPlayer456", _displayname: "Another Player" });
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
        const errorCalls = vi.mocked(sendChat).mock.calls;
        const errorCall = errorCalls.find(call =>
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

      await vi.waitFor(async () => {
        const attr = await libSmartAttributes.getAttribute("char1", "Attribute");
        expect(attr).toBeDefined();
        expect(attr).toBe("42");

        const mockCalls = vi.mocked(sendChat).mock.calls;
        const feedbackCalls = mockCalls.filter(call => {
          const message = call[1];
          const messageIsString = typeof message === "string";
          const messageIsWhisper = message.startsWith("/w ");
          const messageIncludesFeedback = message.includes("Setting Attribute");

          return messageIsString && messageIsWhisper && messageIncludesFeedback;
        });

        expect(feedbackCalls.length).toBeGreaterThan(0);
      });
    });

    it("should use custom sender with --fb-from option", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --fb-from Wizard --Spell|Fireball");

      await vi.waitFor(async () => {
        const attr = await libSmartAttributes.getAttribute("char1", "Spell");
        expect(attr).toBeDefined();
        expect(attr).toBe("Fireball");

        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call => {
          const senderIsWizard = call[0] === "Wizard";
          const message = call[1];
          const messageIsString = typeof message === "string";
          const messageIncludesFeedback = message.includes("Set attribute 'Spell'");
          return senderIsWizard && messageIsString && messageIncludesFeedback;
        });

        expect(feedbackCall).toBeDefined();
      });
    });

    it("should use custom header with --fb-header option", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --fb-header Magic Item Acquired --Item|Staff of Power");

      await vi.waitFor(async () => {
        const attr = await libSmartAttributes.getAttribute("char1", "Item");
        expect(attr).toBeDefined();
        expect(attr).toBe("Staff of Power");

        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call =>
          call[1] && typeof call[1] === "string" &&
          call[1].includes("Magic Item Acquired") &&
          !call[1].includes("Setting Attributes")
        );

        expect(feedbackCall).toBeDefined();
      });
    });

    it("should use custom content with --fb-content option", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --fb-header \"Level Up\" --fb-content \"_CHARNAME_ is now level _CUR0_!\" --Level|5");

      await vi.waitFor(async () => {
        const attr = await libSmartAttributes.getAttribute("char1", "Level");
        expect(attr).toBeDefined();
        expect(attr).toBe("5");

        const feedbackCall = vi.mocked(sendChat).mock.calls.find(call => {
          const isString = call[1] && typeof call[1] === "string";
          const includesFeedback = call[1].includes("Character 1 is now level 5!");
          return isString && includesFeedback;
        });

        expect(feedbackCall).toBeDefined();
      });
    });

    it("should combine all feedback options together", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      const character = createObj("character", { _id: "char-unique-feedback", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _id: "hp-feedback-attr", _characterid: character.id, name: "HP", current: "10" });
      const token = createObj("graphic", { _id: "token1", represents: character.id, _subtype: "token" });
      const selectedTokens = [token.properties];

      const callParts = [
        "!setattr",
        "--sel",
        "--fb-public",
        "--fb-from Dungeon_Master",
        "--fb-header \"Combat Stats Updated\"",
        "--fb-content \"_CHARNAME_'s health increased to _CUR0_!\"",
        "--HP|25"
      ];

      executeCommand(callParts.join(" "), { selected: selectedTokens });

      await vi.waitFor(async () => {
        const attr = await libSmartAttributes.getAttribute("char-unique-feedback", "HP");
        expect(attr).toBeDefined();
        expect(attr).toBe("25");

        // Verify that sendChat was called (feedback message sent)
        expect(sendChat).toHaveBeenCalled();
      });
    });
  });

  describe("Message Suppression Options", () => {
    it("should suppress feedback messages when using the --silent option", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      vi.mocked(sendChat).mockClear();

      executeCommand("!setattr --charid char1 --silent --TestAttr|42");

      await vi.waitFor(async () => {
        const testAttr = await libSmartAttributes.getAttribute("char1", "TestAttr");
        expect(testAttr).toBeDefined();
        expect(testAttr).toBe("42");

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

      await vi.waitFor(async () => {
        const newAttr = await libSmartAttributes.getAttribute("char1", "NewAttribute");
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
        const firstCall = calls[0];
        expect(firstCall).toStrictEqual([
          "add",
          "char1",
          "NewAttribute",
          "42",
          undefined
        ]);
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
        expect(firstCall).toStrictEqual([
          "change",
          "char1",
          "ExistingAttr",
          "20",
          "10",
        ]);
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
        expect(firstCall).toStrictEqual([
          "destroy",
          "char1",
          "DeleteMe",
          undefined,
          "10",
        ]);
      });
    });
  });

  describe("Repeating Sections", () => {
    it("should create repeating section attributes", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });

      executeCommand("!setattr --charid char1 --repeating_weapons_-CREATE_weaponname|Longsword --repeating_weapons_-CREATE_damage|1d8");

      await vi.waitFor(async () => {
        const repeatingAttrs = getBeaconAttributeNames("char1");
        const weaponNameAttrs = repeatingAttrs.filter(name => name.endsWith("_weaponname"));
        const firstRow = weaponNameAttrs[0];
        const [ , , rowID ] = firstRow.split("_");

        const weaponName = await libSmartAttributes.getAttribute("char1", `repeating_weapons_${rowID}_weaponname`);
        const weaponDamage = await libSmartAttributes.getAttribute("char1", `repeating_weapons_${rowID}_damage`);

        expect(weaponName).toBeDefined();
        expect(weaponName).toBe("Longsword");
        expect(weaponDamage).toBeDefined();
        expect(weaponDamage).toBe("1d8");
      });
    });

    it("should adjust number of uses remaining for an ability", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      const character = createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _id: "attr1", _characterid: "char1", name: "repeating_ability_-exampleid_used", current: "3" });
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

      await vi.waitFor(async () => {
        const usedAttr = await libSmartAttributes.getAttribute("char1", "repeating_ability_-exampleid_used");
        expect(usedAttr).toBeDefined();
        expect(usedAttr).toBe("2");
      });
    });

    it("should toggle a buff on or off", async () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      const character = createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      createObj("attribute", { _id: "attr1", _characterid: character.id, name: "repeating_buff2_-example_enable_toggle", current: "0" });
      const token = createObj("graphic", { _id: "token1", represents: "char1", _subtype: "token" });
      const selected = [token.properties];

      executeCommand("!setattr --sel --repeating_buff2_-example_enable_toggle|[[1-@{selected|repeating_buff2_-example_enable_toggle}]]", {
        selected,
      });

      await vi.waitFor(async () => {
        const toggleAttr = await libSmartAttributes.getAttribute("char1", "repeating_buff2_-example_enable_toggle");
        expect(toggleAttr).toBeDefined();
        expect(toggleAttr).toBe("1");
      });

      executeCommand("!setattr --sel --repeating_buff2_-example_enable_toggle|[[1-@{selected|repeating_buff2_-example_enable_toggle}]]", {
        selected,
      });

      await vi.waitFor(async () => {
        const toggleAttr = await libSmartAttributes.getAttribute("char1", "repeating_buff2_-example_enable_toggle");
        expect(toggleAttr).toBeDefined();
        expect(toggleAttr).toBe("0");
      });
    });

    const createRepeatingObjects = () => {
      const player = createObj("player", { _id: "example-player-id", _displayname: "Test Player" });
      const character = createObj("character", { _id: "char1", name: "Character 1", controlledby: player.id });
      const token = createObj("graphic", { _id: "token1", represents: character.id, _subtype: "token" });

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
        current: "-abc123,-def456,-ghi789"
      });

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
      const { token } = createRepeatingObjects();
      const selected = [token.properties];

      // act - Modify the damage of the first weapon ($0 index)
      executeCommand(
        "!setattr --sel --nocreate --repeating_weapons_$0_damage|2d8",
        { selected }
      );

      // Wait for the operation to complete
      await vi.waitFor(async () => {
        // assert - First weapon damage should be updated
        const firstWeaponDamage = await libSmartAttributes.getAttribute("char1", "repeating_weapons_-abc123_damage");
        const secondWeaponDamage = await libSmartAttributes.getAttribute("char1", "repeating_weapons_-def456_damage");

        expect(firstWeaponDamage).toBeDefined();
        expect(firstWeaponDamage).toBe("2d8");
        expect(secondWeaponDamage).toBeDefined();
        expect(secondWeaponDamage).toBe("1d4");
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
      await vi.waitFor(async () => {
        const newlyCreated = await libSmartAttributes.getAttribute("char1", "repeating_weapons_-def456_newlycreated");
        expect(newlyCreated).toBeDefined();
        expect(newlyCreated).toBe("5");
      });
    });
  });

  describe("Delayed Processing", () => {
    it.skip("should process characters sequentially with delays", async () => {
      // Don't want this to happen in the new script

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
      await vi.waitFor(async () => {
        const char1Attr = await libSmartAttributes.getAttribute("char1", "TestAttr");
        const char2Attr = await libSmartAttributes.getAttribute("char2", "TestAttr");
        const char3Attr = await libSmartAttributes.getAttribute("char3", "TestAttr");

        expect(char1Attr).toBeDefined();
        expect(char1Attr).toBe("42");
        expect(char2Attr).toBeDefined();
        expect(char2Attr).toBe("42");
        expect(char3Attr).toBeDefined();
        expect(char3Attr).toBe("42");
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
      vi.mocked(global.playerIsGM).mockReturnValue(true);
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
          undefined,
          expect.objectContaining({
            noarchive: true,
          })
        );
      });
    });
  });
});
