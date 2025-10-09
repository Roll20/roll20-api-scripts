import { describe, it, expect, vi } from "vitest";
import libUUID from "../src/index";

describe("libUUID", () => {
  describe("generateUUID", () => {
    it("should generate a unique UUID", () => {
      const uuid1 = libUUID.generateUUID();
      const uuid2 = libUUID.generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });

    it("should generate different UUIDs when called in quick succession", () => {
      const uuids: string[] = [];
      for (let i = 0; i < 500; i++) {
        uuids.push(libUUID.generateUUID());
      }
      const uniqueUUIDs = new Set(uuids);
      expect(uniqueUUIDs.size).toBe(500);
    });

    it("should generate a UUID of length 20", () => {
      const uuid = libUUID.generateUUID();
      expect(uuid).toHaveLength(20);
    });

    it("should generate a UUID with valid Base64 characters", () => {
      const uuid = libUUID.generateUUID();
      const base64Regex = /^[A-Za-z0-9_-]+$/;
      expect(base64Regex.test(uuid)).toBe(true);
    });
  });

  describe("generateRowID", () => {
    it("should generate a unique RowID", () => {
      const rowID1 = libUUID.generateRowID();
      const rowID2 = libUUID.generateRowID();
      expect(rowID1).not.toBe(rowID2);
    });

    it("should generate a RowID of length 20", () => {
      const rowID = libUUID.generateRowID();
      expect(rowID).toHaveLength(20);
    });

    it("should replace underscores with Z in RowID", () => {
      vi.spyOn(libUUID, "generateUUID").mockReturnValue("A1B2C3D4EFGHIJKLMN_");
      const rowID = libUUID.generateRowID();
      expect(rowID.includes("_")).toBe(false);
      expect(rowID.includes("Z")).toBe(true);
    });
  });
});