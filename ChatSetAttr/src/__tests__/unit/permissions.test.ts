import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkPermissionForTarget, checkPermissions, getPermissions } from "../../modules/permissions";

const mockGetObj = vi.fn();
const mockPlayerIsGM = vi.fn();

global.getObj = mockGetObj;
global.playerIsGM = mockPlayerIsGM;

describe("permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetObj.mockReturnValue(undefined);
    mockPlayerIsGM.mockReturnValue(false);
    global.state.ChatSetAttr = {
      ...global.state.ChatSetAttr,
      playersCanModify: false,
    };
  });

  describe("checkPermissions", () => {
    describe("when player object is not found", () => {
      it("should grant full access and return true when playerID is API", () => {
        expect(checkPermissions("API")).toBe(true);

        expect(getPermissions()).toEqual({
          playerID: "API",
          isGM: true,
          canModify: true,
        });
        expect(mockGetObj).toHaveBeenCalledWith("player", "API");
        expect(mockPlayerIsGM).not.toHaveBeenCalled();
      });

      it("should return false (and not throw) when playerID is not API", () => {
        expect(checkPermissions("missing-player-id")).toBe(false);

        expect(mockGetObj).toHaveBeenCalledWith("player", "missing-player-id");
        expect(mockPlayerIsGM).not.toHaveBeenCalled();
      });
    });

    describe("when player object is found", () => {
      it("should return true and grant modify access for a GM", () => {
        mockGetObj.mockReturnValue({ id: "gm-1" });
        mockPlayerIsGM.mockReturnValue(true);

        expect(checkPermissions("gm-1")).toBe(true);

        expect(getPermissions()).toEqual({
          playerID: "gm-1",
          isGM: true,
          canModify: true,
        });
      });

      it("should return true but withhold modify access for a non-GM when playersCanModify is off", () => {
        mockGetObj.mockReturnValue({ id: "player-1" });

        expect(checkPermissions("player-1")).toBe(true);

        expect(getPermissions()).toEqual({
          playerID: "player-1",
          isGM: false,
          canModify: false,
        });
      });

      it("should grant modify access for a non-GM when playersCanModify is on", () => {
        mockGetObj.mockReturnValue({ id: "player-1" });
        global.state.ChatSetAttr = {
          ...global.state.ChatSetAttr,
          playersCanModify: true,
        };

        expect(checkPermissions("player-1")).toBe(true);

        expect(getPermissions()).toEqual({
          playerID: "player-1",
          isGM: false,
          canModify: true,
        });
      });
    });
  });

  describe("checkPermissionForTarget", () => {
    it("should return true for API before any lookups", () => {
      expect(checkPermissionForTarget("API", "char-1")).toBe(true);

      expect(mockGetObj).not.toHaveBeenCalled();
      expect(mockPlayerIsGM).not.toHaveBeenCalled();
    });

    it("should return false when the player object is not found", () => {
      expect(checkPermissionForTarget("missing-player", "char-1")).toBe(false);

      expect(mockGetObj).toHaveBeenCalledWith("player", "missing-player");
      expect(mockPlayerIsGM).not.toHaveBeenCalled();
    });

    it("should return true for a GM", () => {
      mockGetObj.mockImplementation((type, id) =>
        type === "player" && id === "gm-1" ? { id: "gm-1" } : undefined,
      );
      mockPlayerIsGM.mockReturnValue(true);

      expect(checkPermissionForTarget("gm-1", "char-1")).toBe(true);

      expect(mockGetObj).toHaveBeenCalledWith("player", "gm-1");
      expect(mockPlayerIsGM).toHaveBeenCalledWith("gm-1");
      expect(mockGetObj).not.toHaveBeenCalledWith("character", "char-1");
    });

    it("should return true when playersCanModify is enabled", () => {
      mockGetObj.mockImplementation((type, id) =>
        type === "player" && id === "player-1" ? { id: "player-1" } : undefined,
      );
      global.state.ChatSetAttr = {
        ...global.state.ChatSetAttr,
        playersCanModify: true,
      };

      expect(checkPermissionForTarget("player-1", "char-1")).toBe(true);

      expect(mockGetObj).toHaveBeenCalledWith("player", "player-1");
      expect(mockPlayerIsGM).toHaveBeenCalledWith("player-1");
      expect(mockGetObj).not.toHaveBeenCalledWith("character", "char-1");
    });

    it("should return false when the target character is not found", () => {
      mockGetObj.mockImplementation((type, id) =>
        type === "player" && id === "player-1" ? { id: "player-1" } : undefined,
      );

      expect(checkPermissionForTarget("player-1", "char-missing")).toBe(false);

      expect(mockGetObj).toHaveBeenCalledWith("player", "player-1");
      expect(mockGetObj).toHaveBeenCalledWith("character", "char-missing");
    });

    it("should return true when the player controls the target character", () => {
      const character = {
        id: "char-1",
        get: vi.fn((key: string) => key === "controlledby" ? "player-1,other-player" : undefined),
      };
      mockGetObj.mockImplementation((type, id) => {
        if (type === "player" && id === "player-1") return { id: "player-1" };
        if (type === "character" && id === "char-1") return character;
        return undefined;
      });

      expect(checkPermissionForTarget("player-1", "char-1")).toBe(true);

      expect(mockGetObj).toHaveBeenCalledWith("character", "char-1");
      expect(character.get).toHaveBeenCalledWith("controlledby");
    });

    it("should return false when the player does not control the target character", () => {
      const character = {
        id: "char-1",
        get: vi.fn((key: string) => key === "controlledby" ? "other-player,third-player" : undefined),
      };
      mockGetObj.mockImplementation((type, id) => {
        if (type === "player" && id === "player-1") return { id: "player-1" };
        if (type === "character" && id === "char-1") return character;
        return undefined;
      });

      expect(checkPermissionForTarget("player-1", "char-1")).toBe(false);

      expect(mockGetObj).toHaveBeenCalledWith("character", "char-1");
      expect(character.get).toHaveBeenCalledWith("controlledby");
    });
  });
});
