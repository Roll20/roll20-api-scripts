import { it, expect, describe } from "vitest"
import { UUID } from "../../src/classes/UUIDs"

describe("UUID", () => {
  it("generates a UUID in the correct format", () => {
    const uuid = UUID.generateUUID();

    // UUID should be 20 characters long (8 for time + 12 for random/counter)
    expect(uuid.length).toBe(20);

    // UUID should match the pattern of allowed characters
    expect(uuid).toMatch(/^-[-0-9A-Z_a-z]{19}$/);

    // Example format: -Lq2RmvjiCI3kixkEAa5
    // First character is typically a base64 char
    expect("-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz").toContain(uuid[0]);
  });

  it("generates unique UUIDs", () => {
    const uuidCount = 1000;
    const uuids = new Set<string>();

    for (let i = 0; i < uuidCount; i++) {
      uuids.add(UUID.generateUUID());
    }

    // All generated UUIDs should be unique
    expect(uuids.size).toBe(uuidCount);
  });

  it("generates UUIDs with consistent length", () => {
    for (let i = 0; i < 100; i++) {
      expect(UUID.generateUUID().length).toBe(20);
    }
  });

  it("generates UUIDs with time component at the beginning", () => {
    // Generate two UUIDs with a delay to ensure different timestamps
    const uuid1 = UUID.generateUUID();

    // Force a small delay
    const startTime = Date.now();
    while(Date.now() - startTime < 10) {
      // Wait a bit to ensure different timestamp
    }

    const uuid2 = UUID.generateUUID();

    // The time components (first 8 chars) should be different
    expect(uuid1.substring(0, 8)).not.toBe(uuid2.substring(0, 8));
  });
});
