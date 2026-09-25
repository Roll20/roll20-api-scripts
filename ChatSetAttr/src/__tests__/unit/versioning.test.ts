import { describe, expect, it, vi, beforeEach } from "vitest";
import { checkForUpdates } from "../../modules/versioning";
import { v2_0 } from "../../versions/2.0.0";
import { setConfig } from "../../modules/config";

vi.mock("../../versions/2.0.0", () => {
  return {
    v2_0: {
      appliesTo: "<=3",
      version: 4,
      update: vi.fn(),
    },
  };
});

const migration2 = vi.mocked(v2_0);

vi.mock("../../modules/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../modules/config")>();
  return {
    ...actual,
    setConfig: vi.fn(),
  };
});

describe("versioning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(v2_0).appliesTo = "<=3";
  });

  describe("checkForUpdates", () => {
    it("should run migration when state schema is 3", () => {
      checkForUpdates(3);

      expect(migration2.update).toHaveBeenCalled();
      expect(setConfig).toHaveBeenCalledWith({ version: 4 });
    });

    it("should run migration when state schema is 0", () => {
      checkForUpdates(0);

      expect(migration2.update).toHaveBeenCalled();
      expect(setConfig).toHaveBeenCalledWith({ version: 4 });
    });

    it("should not run migration when state schema is already 4", () => {
      checkForUpdates(4);

      expect(migration2.update).not.toHaveBeenCalled();
      expect(setConfig).not.toHaveBeenCalled();
    });

    it("should not run migration when state schema is greater than 4", () => {
      checkForUpdates(5);

      expect(migration2.update).not.toHaveBeenCalled();
    });

    it("should call setConfig with schema version 4 after update", () => {
      checkForUpdates(3);

      expect(setConfig).toHaveBeenCalledWith({ version: 4 });
    });
  });

  describe("comparison operators", () => {
    it("should handle < operator correctly", () => {
      vi.mocked(v2_0).appliesTo = "<4";

      checkForUpdates(3);
      expect(migration2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates(4);
      expect(migration2.update).not.toHaveBeenCalled();
    });

    it("should handle >= operator correctly", () => {
      vi.mocked(v2_0).appliesTo = ">=3";

      checkForUpdates(3);
      expect(migration2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates(2);
      expect(migration2.update).not.toHaveBeenCalled();
    });

    it("should handle > operator correctly", () => {
      vi.mocked(v2_0).appliesTo = ">2";

      checkForUpdates(3);
      expect(migration2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates(2);
      expect(migration2.update).not.toHaveBeenCalled();
    });

    it("should handle = operator correctly", () => {
      vi.mocked(v2_0).appliesTo = "=3";

      checkForUpdates(3);
      expect(migration2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates(4);
      expect(migration2.update).not.toHaveBeenCalled();
    });
  });
});
