import { beforeEach, it, expect, describe, vi } from "vitest";
import { generateTargets } from "../../modules/targets";
import { checkPermissionForTarget, getPermissions } from "../../modules/permissions";
import { getConfig } from "../../modules/config";

const makeMockMessage = (
  content: string = "",
  selected: string[] = []
): Roll20ChatMessage => {
  return {
    who: "testPlayer",
    content,
    selected: selected.map(id => ({ _id: id })),
  } as Roll20ChatMessage;
};

const makeMockCharacter = (
  id: string,
  controlledBy: string | null = null,
  inParty: boolean = false
): Roll20Character => {
  return {
    id,
    get: (prop: string) => {
      if (prop === "controlledby") return controlledBy || "";
      if (prop === "inParty") return inParty;
      return "";
    },
  } as Roll20Character;
};

const makeMockToken = (
  id: string,
  represents: string | null = null
): Roll20Graphic => {
  return {
    id,
    get: (prop: string) => {
      if (prop === "represents") return represents || "";
      if (prop === "_subtype") return "token";
      return "";
    },
  } as Roll20Graphic;
};

vi.mock("../../modules/permissions", () => {
  return {
    getPermissions: vi.fn(),
    checkPermissionForTarget: vi.fn(),
  };
});

vi.mock("../../modules/config", () => {
  return {
    getConfig: vi.fn(),
  };
});

describe("generateTargets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("target = all", () => {
    it("should report an error if the user is not a GM", () => {
      // arrange
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: false });
      const message = makeMockMessage("", []);

      // act
      const result = generateTargets(message, ["all"]);

      // assert
      expect(result.targets).toEqual([]);
      expect(result.errors).toContain("Only GMs can use the 'all' target option.");
    });

    it("should return all character IDs for 'all' target", () => {
      // arrange
      const message = makeMockMessage("", []);
      const characterOne = makeMockCharacter("char1", "player1");
      const characterTwo = makeMockCharacter("char2", null);
      const characterThree = makeMockCharacter("char3", "player2");
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: true, canModify: true });
      vi.mocked(global.findObjs).mockReturnValueOnce([
        characterOne,
        characterTwo,
        characterThree,
      ] as Roll20Character[]);

      // act
      const result = generateTargets(message, ["all"]);

      // assert
      expect(result.targets).toEqual(["char1", "char2", "char3"]);
    });
  });

  describe("target = allgm", () => {
    it("should report an error if the user is not a GM", () => {
      // arrange
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: false });
      const message = makeMockMessage("", []);

      // act
      const result = generateTargets(message, ["allgm"]);

      // assert
      expect(result.targets).toEqual([]);
      expect(result.errors).toContain("Only GMs can use the 'allgm' target option.");
    });

    it("should return all GM character IDs for 'allgm' target", () => {
      // arrange
      const message = makeMockMessage("", []);
      const characterOne = makeMockCharacter("char1", "player1");
      const characterTwo = makeMockCharacter("char2", null);
      const characterThree = makeMockCharacter("char3", "player2");
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: true, canModify: true });
      vi.mocked(global.findObjs).mockReturnValueOnce([
        characterOne,
        characterTwo,
        characterThree,
      ] as Roll20Character[]);

      // act
      const { targets } = generateTargets(message, ["allgm"]);

      // assert
      expect(targets).toEqual(["char2"]);
    });
  });

  describe("target = allplayers", () => {
    it("should report an error if the user is not a GM", () => {
      // arrange
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: false });
      const message = makeMockMessage("", []);

      // act
      const result = generateTargets(message, ["allplayers"]);

      // assert
      expect(result.targets).toEqual([]);
      expect(result.errors).toContain("Only GMs can use the 'allplayers' target option.");
    });

    it("should return all player character IDs for 'allplayers' target", () => {
      // arrange
      const message = makeMockMessage("", []);
      const characterOne = makeMockCharacter("char1", "player1");
      const characterTwo = makeMockCharacter("char2", null);
      const characterThree = makeMockCharacter("char3", "player2");
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: true, canModify: true });
      vi.mocked(global.findObjs).mockReturnValueOnce([
        characterOne,
        characterTwo,
        characterThree,
      ] as Roll20Character[]);

      // act
      const result = generateTargets(message, ["allplayers"]);

      // assert
      expect(result.targets).toEqual(["char1", "char3"]);
    });
  });

  describe("target = sel", () => {
    it("should return character IDs based on selected tokens", () => {
      // arrange
      const characterOne = makeMockCharacter("char1");
      const characterTwo = makeMockCharacter("char2");
      const tokenOne = makeMockToken("token1", "char1");
      const tokenTwo = makeMockToken("token2", "char2");
      const message = makeMockMessage("", ["token1", "token2"]);
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: true });
      vi.mocked(global.getObj).mockImplementation((type: string, id: string) => {
        if (type === "graphic") {
          if (id === "token1") return tokenOne;
          if (id === "token2") return tokenTwo;
        }
        if (type === "character") {
          if (id === "char1") return characterOne;
          if (id === "char2") return characterTwo;
        }
        return null;
      });

      // act
      const result = generateTargets(message, ["sel"]);

      // assert
      expect(result.targets).toEqual(["char1", "char2"]);
    });

    it("should handle missing tokens gracefully", () => {
      // arrange
      const message = makeMockMessage("", ["token1", "token2"]);
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: true });
      vi.mocked(global.getObj).mockReturnValue(null);

      // act
      const result = generateTargets(message, ["sel"]);

      // assert
      expect(result.targets).toEqual([]);
      expect(result.errors).toContain("Selected token with ID token1 not found.");
      expect(result.errors).toContain("Selected token with ID token2 not found.");
    });

    it("should handle tokens that don't represent characters", () => {
      // arrange
      const tokenOne = makeMockToken("token1", "");
      const message = makeMockMessage("", ["token1"]);
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: true });
      vi.mocked(global.getObj).mockImplementation((type: string, id: string) => {
        if (type === "graphic" && id === "token1") return tokenOne;
        return null;
      });

      // act
      const result = generateTargets(message, ["sel"]);

      // assert
      expect(result.targets).toEqual([]);
      expect(result.errors).toContain("Token with ID token1 does not represent a character.");
    });
  });

  describe("target = charid", () => {
    it("should return character IDs if the player has permission", () => {
      // arrange
      const characterOne = makeMockCharacter("char1", "player1");
      const characterTwo = makeMockCharacter("char2", "player1");
      const characterThree = makeMockCharacter("char3", "player2");
      const message = makeMockMessage("", []);
      vi.mocked(checkPermissionForTarget).mockReturnValue(true);
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: true });
      vi.mocked(global.getObj).mockImplementation((type: string, id: string) => {
        if (type === "character") {
          if (id === "char1") return characterOne;
          if (id === "char2") return characterTwo;
          if (id === "char3") return characterThree;
        }
        return null;
      });

      // act
      const result = generateTargets(message, ["charid char1,char2"]);

      // assert
      expect(result.targets).toEqual(["char1", "char2"]);
    });

    it("should report an error for character IDs without permission", () => {
      // arrange
      const characterOne = makeMockCharacter("char1", "player1");
      const characterTwo = makeMockCharacter("char2", "player1");
      const characterThree = makeMockCharacter("char3", "player2");
      const message = makeMockMessage("", []);
      vi.mocked(checkPermissionForTarget).mockImplementation((playerID: string, target: string) => {
        return target !== "char3";
      });
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: true });
      vi.mocked(global.getObj).mockImplementation((type: string, id: string) => {
        if (type === "character") {
          if (id === "char1") return characterOne;
          if (id === "char2") return characterTwo;
          if (id === "char3") return characterThree;
        }
        return null;
      });

      // act
      const result = generateTargets(message, ["charid char1,char3,char2"]);

      // assert
      expect(result.targets).toEqual(["char1", "char2"]);
      expect(result.errors).toContain("Permission error. You do not have permission to modify character with ID char3.");
    });
  });

  describe("target = name", () => {
    it("should return character IDs based on names if the player has permission", () => {
      // arrange
      const characterOne = makeMockCharacter("char1", "player1");
      const characterTwo = makeMockCharacter("char2", "player1");
      const characterThree = makeMockCharacter("char3", "player2");
      const message = makeMockMessage("", []);
      vi.mocked(checkPermissionForTarget).mockReturnValue(true);
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: true });
      vi.mocked(global.findObjs).mockImplementation((props: Record<string, unknown>) => {
        const name = props.name as string;
        if (name === "Alice") return [characterOne];
        if (name === "Bob") return [characterTwo];
        if (name === "Charlie") return [characterThree];
        return [];
      });

      // act
      const result = generateTargets(message, ["name Alice,Bob"]);

      // assert
      expect(result.targets).toEqual(["char1", "char2"]);
    });

    it("should report an error for names without permission", () => {
      // arrange
      const characterOne = makeMockCharacter("char1", "player1");
      const characterTwo = makeMockCharacter("char2", "player1");
      const characterThree = makeMockCharacter("char3", "player2");
      const message = makeMockMessage("", []);
      vi.mocked(checkPermissionForTarget).mockImplementation((playerID: string, target: string) => {
        return target !== "char3";
      });
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: true });
      vi.mocked(global.findObjs).mockImplementation((props: Record<string, unknown>) => {
        const name = props.name as string;
        if (name === "Alice") return [characterOne];
        if (name === "Bob") return [characterTwo];
        if (name === "Charlie") return [characterThree];
        return [];
      });

      // act
      const result = generateTargets(message, ["name Alice,Charlie,Bob"]);

      // assert
      expect(result.targets).toEqual(["char1", "char2"]);
      expect(result.errors).toContain("Permission error. You do not have permission to modify character with name \"Charlie\".");
    });
  });

  describe("target = party", () => {
    it("should return all party character IDs when GM", () => {
      // arrange
      const characterOne = makeMockCharacter("char1", "player1", true);
      const characterTwo = makeMockCharacter("char2", null, true);
      const message = makeMockMessage("", []);
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: true, canModify: true });
      vi.mocked(getConfig).mockReturnValue({ playersCanTargetParty: false } as ReturnType<typeof getConfig>);
      vi.mocked(global.findObjs).mockReturnValueOnce([
        characterOne,
        characterTwo,
      ] as Roll20Character[]);

      // act
      const result = generateTargets(message, ["party"]);

      // assert
      expect(result.targets).toEqual(["char1", "char2"]);
      expect(result.errors).toEqual([]);
    });

    it("should report an error if player cannot target party", () => {
      // arrange
      const message = makeMockMessage("", []);
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: true });
      vi.mocked(getConfig).mockReturnValue({ playersCanTargetParty: false } as ReturnType<typeof getConfig>);

      // act
      const result = generateTargets(message, ["party"]);

      // assert
      expect(result.targets).toEqual([]);
      expect(result.errors).toContain("Only GMs can use the 'party' target option.");
    });

    it("should return party character IDs when player is allowed", () => {
      // arrange
      const characterOne = makeMockCharacter("char1", "player1", true);
      const characterTwo = makeMockCharacter("char2", null, true);
      const message = makeMockMessage("", []);
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: true });
      vi.mocked(getConfig).mockReturnValue({ playersCanTargetParty: true } as ReturnType<typeof getConfig>);
      vi.mocked(global.findObjs).mockReturnValueOnce([
        characterOne,
        characterTwo,
      ] as Roll20Character[]);

      // act
      const result = generateTargets(message, ["party"]);

      // assert
      expect(result.targets).toEqual(["char1", "char2"]);
      expect(result.errors).toEqual([]);
    });
  });

  describe("target = sel-party", () => {
    it("should return only party characters from selected tokens", () => {
      // arrange
      const characterOne = makeMockCharacter("char1", "player1", true);
      const characterTwo = makeMockCharacter("char2", "player1", false);
      const characterThree = makeMockCharacter("char3", "player1", true);
      const tokenOne = makeMockToken("token1", "char1");
      const tokenTwo = makeMockToken("token2", "char2");
      const tokenThree = makeMockToken("token3", "char3");
      const message = makeMockMessage("", ["token1", "token2", "token3"]);
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: true });
      vi.mocked(global.getObj).mockImplementation((type: string, id: string) => {
        if (type === "graphic") {
          if (id === "token1") return tokenOne;
          if (id === "token2") return tokenTwo;
          if (id === "token3") return tokenThree;
        }
        if (type === "character") {
          if (id === "char1") return characterOne;
          if (id === "char2") return characterTwo;
          if (id === "char3") return characterThree;
        }
        return null;
      });

      // act
      const result = generateTargets(message, ["sel-party"]);

      // assert
      expect(result.targets).toEqual(["char1", "char3"]);
    });
  });

  describe("target = sel-noparty", () => {
    it("should return only non-party characters from selected tokens", () => {
      // arrange
      const characterOne = makeMockCharacter("char1", "player1", true);
      const characterTwo = makeMockCharacter("char2", "player1", false);
      const characterThree = makeMockCharacter("char3", "player1", true);
      const tokenOne = makeMockToken("token1", "char1");
      const tokenTwo = makeMockToken("token2", "char2");
      const tokenThree = makeMockToken("token3", "char3");
      const message = makeMockMessage("", ["token1", "token2", "token3"]);
      vi.mocked(getPermissions).mockReturnValue({ playerID: "player1", isGM: false, canModify: true });
      vi.mocked(global.getObj).mockImplementation((type: string, id: string) => {
        if (type === "graphic") {
          if (id === "token1") return tokenOne;
          if (id === "token2") return tokenTwo;
          if (id === "token3") return tokenThree;
        }
        if (type === "character") {
          if (id === "char1") return characterOne;
          if (id === "char2") return characterTwo;
          if (id === "char3") return characterThree;
        }
        return null;
      });

      // act
      const result = generateTargets(message, ["sel-noparty"]);

      // assert
      expect(result.targets).toEqual(["char2"]);
    });
  });
});