import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockCampaign } from "../../__mocks__/apiObjects.mock";
import { isBeaconSupported } from "../../modules/beaconSupport";

describe("isBeaconSupported", () => {
  const originalCampaign = global.Campaign;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.Campaign = originalCampaign;
  });

  it("should return false when computedSummary is missing", () => {
    global.Campaign = mockCampaign({});

    expect(isBeaconSupported()).toBe(false);
  });

  it("should return false when computedSummary is undefined", () => {
    global.Campaign = mockCampaign({ computedSummary: undefined });

    expect(isBeaconSupported()).toBe(false);
  });

  it("should return true when computedSummary is present", () => {
    global.Campaign = mockCampaign({ computedSummary: {} });

    expect(isBeaconSupported()).toBe(true);
  });

  it("should return false when Campaign throws", () => {
    global.Campaign = vi.fn(() => {
      throw new Error("Campaign unavailable");
    }) as unknown as typeof Campaign;

    expect(isBeaconSupported()).toBe(false);
  });
});
