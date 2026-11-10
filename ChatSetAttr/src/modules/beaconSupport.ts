export function isBeaconSupported(): boolean {
  try {
    const campaign = Campaign() as Roll20Campaign & BeaconCampaignMarker;
    return !!campaign.computedSummary;
  } catch {
    return false;
  }
}
