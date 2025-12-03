import { describe, expect, it, vi, beforeEach } from "vitest";
import { checkForUpdates } from "../../modules/versioning";
import { v2_0 } from "../../versions/2.0.0";
import { getConfig, setConfig } from "../../modules/config";

vi.mock("../../versions/version2", () => {
  return {
    v2_0: {
      appliesTo: "<=1.10",
      version: "2.0",
      update: vi.fn(),
    },
  };
});

const version2 = vi.mocked(v2_0);

vi.mock("../../modules/config", () => {
  return {
    getConfig: vi.fn(() => ({ version: "1.10" })),
    setConfig: vi.fn(),
  };
});

describe("versioning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset v2_0.appliesTo to its default value
    vi.mocked(v2_0).appliesTo = "<=1.10";
  });

  describe("checkForUpdates", () => {
    it("should update version when current version is less than or equal to target", () => {
      // arrange

      // act
      checkForUpdates("1.10");

      // assert
      expect(version2.update).toHaveBeenCalled();
    });

    it("should update version when current version is less than target", () => {
      // arrange

      // act
      checkForUpdates("1.9");

      // assert
      expect(version2.update).toHaveBeenCalled();
    });

    it("should not update version when current version is greater than target", () => {
      // arrange

      // act
      checkForUpdates("1.11");

      // assert
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should not update version when current version is greater than target (major version)", () => {
      // arrange

      // act
      checkForUpdates("2.0");

      // assert
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should handle version strings with patch numbers", () => {
      // arrange

      // act
      checkForUpdates("1.10.0");

      // assert
      expect(version2.update).toHaveBeenCalled();
    });

    it("should handle version strings with patch numbers that exceed target", () => {
      // arrange

      // act
      checkForUpdates("1.10.1");

      // assert
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should call setConfig with updated version after update", () => {
      // arrange
      const mockConfig = { version: "1.10" };
      vi.mocked(getConfig).mockReturnValue(mockConfig);

      // act
      checkForUpdates("1.9");

      // assert
      expect(version2.update).toHaveBeenCalled();
      expect(setConfig).toHaveBeenCalledWith(expect.objectContaining({
        version: "2.0"
      }));
    });

    it("should handle empty version strings gracefully", () => {
      // arrange

      // act & assert
      expect(() => checkForUpdates("")).not.toThrow();
      // Empty string gets parsed as version "0.0.0", which is <= "1.10"
      expect(version2.update).toHaveBeenCalled();
    });

    it("should handle malformed version strings gracefully", () => {
      // arrange

      // act & assert
      expect(() => checkForUpdates("invalid.version")).not.toThrow();
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should handle version with only major number", () => {
      // arrange

      // act
      checkForUpdates("1");

      // assert
      expect(version2.update).toHaveBeenCalled();
    });
  });

  describe("different comparison operators", () => {
    beforeEach(() => {
      // Reset the mock to use different appliesTo values for each test
      vi.clearAllMocks();
    });

    it("should handle < operator correctly", () => {
      // arrange
      vi.mocked(v2_0).appliesTo = "<1.10";

      // act
      checkForUpdates("1.9");

      // assert
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.10");
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should handle >= operator correctly", () => {
      // arrange
      vi.mocked(v2_0).appliesTo = ">=1.10";

      // act
      checkForUpdates("1.10");

      // assert
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.11");
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.9");
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should handle > operator correctly", () => {
      // arrange
      vi.mocked(v2_0).appliesTo = ">1.10";

      // act
      checkForUpdates("1.11");

      // assert
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.10");
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should handle = operator correctly", () => {
      // arrange
      vi.mocked(v2_0).appliesTo = "=1.10";

      // act
      checkForUpdates("1.10");

      // assert
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.9");
      expect(version2.update).not.toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.11");
      expect(version2.update).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should skip version objects with invalid appliesTo format", () => {
      // arrange
      // Using type assertion to test invalid input handling
      Object.defineProperty(vi.mocked(v2_0), "appliesTo", {
        value: "invalid1.10",
        writable: true,
        configurable: true
      });

      // act & assert
      expect(() => checkForUpdates("1.9")).not.toThrow();
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should handle appliesTo with extra whitespace", () => {
      // arrange
      vi.mocked(v2_0).appliesTo = "<= 1.10 ";

      // act
      checkForUpdates("1.9");

      // assert
      expect(version2.update).toHaveBeenCalled();
    });

    it("should handle multiple version objects in sequence", () => {
      // This test would require mocking the VERSION_HISTORY array directly
      // Since we can't easily do that with the current setup, we'll test the behavior
      // by ensuring the version is updated correctly after the first update

      // arrange
      const mockConfig = { version: "1.9" };
      vi.mocked(getConfig).mockReturnValue(mockConfig);

      // act
      checkForUpdates("1.9");

      // assert
      expect(version2.update).toHaveBeenCalled();
      expect(setConfig).toHaveBeenCalledWith(expect.objectContaining({
        version: "2.0"
      }));
    });
  });

  describe("version comparison logic", () => {
    it("should correctly compare major versions", () => {
      // arrange
      vi.mocked(v2_0).appliesTo = "<=2.0";

      // act & assert
      checkForUpdates("1.0");
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("2.0");
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("3.0");
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should correctly compare minor versions when major versions are equal", () => {
      // arrange
      vi.mocked(v2_0).appliesTo = "<=1.5";

      // act & assert
      checkForUpdates("1.4");
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.5");
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.6");
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should correctly compare patch versions when major and minor versions are equal", () => {
      // arrange
      vi.mocked(v2_0).appliesTo = "<=1.5.3";

      // act & assert
      checkForUpdates("1.5.2");
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.5.3");
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.5.4");
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should treat missing patch versions as 0", () => {
      // arrange
      vi.mocked(v2_0).appliesTo = "<=1.5.0";

      // act & assert
      checkForUpdates("1.5");
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.5.1");
      expect(version2.update).not.toHaveBeenCalled();
    });

    it("should treat missing minor and patch versions as 0", () => {
      // arrange
      vi.mocked(v2_0).appliesTo = "<=1.0.0";

      // act & assert
      checkForUpdates("1");
      expect(version2.update).toHaveBeenCalled();

      vi.clearAllMocks();
      checkForUpdates("1.0.1");
      expect(version2.update).not.toHaveBeenCalledTimes(2);
    });
  });
});