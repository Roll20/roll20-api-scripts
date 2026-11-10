import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resetAllObjects } from "../../__mocks__/apiObjects.mock";
import {
  captureDeletePriorState,
  createObserverAttributeObject,
  emptySnapshot,
  isLegacySheet,
  isNewAttributeOrUser,
  mergeAttributeState,
  resolveObserverAddObj,
  resolveObserverDestroyObj,
  resolveObserverKind,
  resolveObserverObj,
  toSnapshot,
  tryFindLegacyAttribute,
} from "../../modules/observerPayload";

function createBeaconCharacter(properties: Record<string, unknown>) {
  const character = createObj("character", properties);
  Object.assign(character, { sheetEnvironment: "beacon" });
  return character;
}

describe("observerPayload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllObjects();
  });

  afterEach(() => {
    resetAllObjects();
  });

  describe("isLegacySheet", () => {
    it("should treat missing sheetEnvironment as legacy", () => {
      createObj("character", { _id: "char1", name: "Hero" });
      expect(isLegacySheet("char1")).toBe(true);
    });

    it("should treat explicit legacy sheetEnvironment as legacy", () => {
      const character = createObj("character", { _id: "char1", name: "Hero" });
      Object.assign(character, { sheetEnvironment: "legacy" });
      expect(isLegacySheet("char1")).toBe(true);
    });

    it("should not treat beacon sheetEnvironment as legacy", () => {
      createBeaconCharacter({ _id: "char1", name: "Hero" });
      expect(isLegacySheet("char1")).toBe(false);
    });

    it("should not treat missing characters as legacy", () => {
      expect(isLegacySheet("missing-char")).toBe(false);
    });
  });

  describe("createObserverAttributeObject", () => {
    it("should expose get, set, and toJSON", () => {
      const obj = createObserverAttributeObject("char1", "hp", "computed", { current: "10", max: "20" });

      expect(obj.get("name")).toBe("hp");
      expect(obj.get("current")).toBe("10");
      expect(obj.get("max")).toBe("20");
      expect(obj.get("_type")).toBe("computed");
      expect(obj.toJSON()).toEqual({
        _id: "",
        _type: "computed",
        _characterid: "char1",
        name: "hp",
        current: "10",
        max: "20",
      });
    });

    it("should call setSheetItem for computed set(key, value)", async () => {
      const setSheetItemSpy = vi.spyOn(global, "setSheetItem").mockResolvedValue(true);

      const obj = createObserverAttributeObject("char1", "hp", "computed", { current: "10", max: "20" });
      obj.set("current", "99");

      await vi.waitFor(() => {
        expect(setSheetItemSpy).toHaveBeenCalledWith(
          "char1",
          "hp",
          "99",
          "current",
          { allowThrow: true, createAttr: true, withWorker: true },
        );
        expect(obj.get("current")).toBe("99");
      });
      setSheetItemSpy.mockRestore();
    });

    it("should call setSheetItem for userAttribute set({ max })", async () => {
      const setSheetItemSpy = vi.spyOn(global, "setSheetItem").mockResolvedValue(true);

      const obj = createObserverAttributeObject("char1", "notes", "userAttribute", { current: "a", max: "" });
      obj.set({ max: "5" });

      await vi.waitFor(() => {
        expect(setSheetItemSpy).toHaveBeenCalledWith(
          "char1",
          "user.notes",
          "5",
          "max",
          { allowThrow: true, createAttr: true, withWorker: true },
        );
        expect(obj.get("max")).toBe("5");
      });
      setSheetItemSpy.mockRestore();
    });
  });

  describe("mergeAttributeState", () => {
    it("should merge hp and hp_max keys", () => {
      const state = mergeAttributeState(
        "char1",
        "hp",
        { char1: { hp: 8, hp_max: 18 } },
        { char1: { hp: 10, hp_max: 20 } },
        false,
      );

      expect(state).toEqual({
        current: "10",
        max: "20",
        priorCurrent: "8",
        priorMax: "18",
      });
    });

    it("should use prior values for delete operations", () => {
      const state = mergeAttributeState(
        "char1",
        "hp",
        { char1: { hp: 10, hp_max: 20 } },
        { char1: { hp: undefined, hp_max: undefined } },
        true,
      );

      expect(state).toEqual({
        current: "10",
        max: "20",
        priorCurrent: "10",
        priorMax: "20",
      });
    });
  });

  describe("resolveObserverKind", () => {
    it("should return attribute for default-sandbox legacy characters", async () => {
      createObj("character", { _id: "char1", name: "Hero" });
      createObj("attribute", { _id: "attr1", _characterid: "char1", name: "hp", current: "10" });

      await expect(resolveObserverKind("char1", "hp")).resolves.toBe("attribute");
    });

    it("should return computed when beacon value exists", async () => {
      createBeaconCharacter({ _id: "char1", name: "Hero" });
      await setSheetItem("char1", "beacon_hp", "10", "current");

      await expect(resolveObserverKind("char1", "beacon_hp")).resolves.toBe("computed");
    });

    it("should return computed on beacon sheets even when a legacy attribute object exists", async () => {
      createBeaconCharacter({ _id: "char1", name: "Hero" });
      createObj("attribute", { _id: "attr1", _characterid: "char1", name: "ComputedLike", current: "10" });
      await setSheetItem("char1", "ComputedLike", "10", "current");

      await expect(resolveObserverKind("char1", "ComputedLike")).resolves.toBe("computed");
    });
  });

  describe("resolveObserverObj", () => {
    it("should prefer live legacy attribute objects on default-sandbox characters", () => {
      createObj("character", { _id: "char1", name: "Hero" });
      const legacy = createObj("attribute", { _id: "attr1", _characterid: "char1", name: "hp", current: "10", max: "20" });

      const obj = resolveObserverObj("char1", "hp", "attribute", {
        current: "10",
        max: "20",
        priorCurrent: "5",
        priorMax: "15",
      });

      expect(obj).toBe(legacy);
    });

    it("should build synthetic computed object on beacon sheets even when legacy attribute exists", () => {
      createBeaconCharacter({ _id: "char1", name: "Hero" });
      createObj("attribute", { _id: "attr1", _characterid: "char1", name: "ComputedLike", current: "10", max: "20" });

      const obj = resolveObserverObj("char1", "ComputedLike", "computed", {
        current: "10",
        max: "20",
        priorCurrent: "5",
        priorMax: "15",
      });

      expect(obj.toJSON()._type).toBe("computed");
      expect(obj.get("current")).toBe("10");
      expect(obj).not.toBe(findObjs({ _type: "attribute", _characterid: "char1", name: "ComputedLike" })[0]);
    });

    it("should build synthetic object when legacy attribute is missing", () => {
      const obj = resolveObserverObj("char1", "hp", "computed", {
        current: "10",
        max: "20",
        priorCurrent: "5",
        priorMax: "15",
      });

      expect(obj.toJSON()._type).toBe("computed");
      expect(obj.get("current")).toBe("10");
    });
  });

  describe("resolveObserverDestroyObj", () => {
    it("should return the live legacy attribute before deletion on default-sandbox characters", () => {
      createObj("character", { _id: "char1", name: "Hero" });
      const legacy = createObj("attribute", { _id: "attr1", _characterid: "char1", name: "hp", current: "10", max: "20" });

      expect(resolveObserverDestroyObj("char1", "hp", "attribute")).toBe(legacy);
    });

    it("should return undefined for beacon sheets", () => {
      createBeaconCharacter({ _id: "char1", name: "Hero" });

      expect(resolveObserverDestroyObj("char1", "hp", "attribute")).toBeUndefined();
    });
  });

  describe("resolveObserverAddObj", () => {
    it("should return synthetic object with added values", () => {
      const obj = resolveObserverAddObj("char1", "NewAttr", "userAttribute", { current: "42", max: "100" });

      expect(obj.get("current")).toBe("42");
      expect(obj.get("max")).toBe("100");
      expect(obj.toJSON()._type).toBe("userAttribute");
    });

    it("should return live legacy object when available on default-sandbox characters", () => {
      createObj("character", { _id: "char1", name: "Hero" });
      const legacy = createObj("attribute", { _id: "attr1", _characterid: "char1", name: "NewAttr", current: "42", max: "100" });

      const obj = resolveObserverAddObj("char1", "NewAttr", "attribute", { current: "42", max: "100" });

      expect(obj).toBe(legacy);
    });
  });

  describe("captureDeletePriorState", () => {
    it("should read max from legacy attribute when priorValues omit hp_max", async () => {
      createObj("character", { _id: "char1", name: "Hero" });
      createObj("attribute", { _id: "attr1", _characterid: "char1", name: "hp", current: "10", max: "20" });

      const state = await captureDeletePriorState("char1", "hp", "attribute", { char1: { hp: 10 } });

      expect(state.current).toBe("10");
      expect(state.max).toBe("20");
    });
  });

  describe("isNewAttributeOrUser", () => {
    it("should be false for computed attributes", () => {
      expect(isNewAttributeOrUser("computed", {
        current: "1",
        max: "",
        priorCurrent: "",
        priorMax: "",
      })).toBe(false);
    });

    it("should be true for new user attributes", () => {
      expect(isNewAttributeOrUser("userAttribute", {
        current: "42",
        max: "",
        priorCurrent: "",
        priorMax: "",
      })).toBe(true);
    });
  });

  describe("toSnapshot and emptySnapshot", () => {
    it("should build plain prev snapshots", () => {
      expect(toSnapshot("char1", "hp", "attribute", { current: "5", max: "10" }, "attr1")).toEqual({
        _id: "attr1",
        _type: "attribute",
        _characterid: "char1",
        name: "hp",
        current: "5",
        max: "10",
      });

      expect(emptySnapshot("char1", "hp", "computed")).toEqual({
        _id: "",
        _type: "computed",
        _characterid: "char1",
        name: "hp",
        current: "",
        max: "",
      });
    });
  });

  describe("tryFindLegacyAttribute", () => {
    it("should find legacy attributes by name", () => {
      createObj("character", { _id: "char1", name: "Hero" });
      const legacy = createObj("attribute", { _id: "attr1", _characterid: "char1", name: "hp", current: "10" });

      expect(tryFindLegacyAttribute("char1", "hp")).toBe(legacy);
    });
  });
});
