import { sendNotification } from "../modules/chat";
import { getConfig, setConfig } from "../modules/config";
import { createVersionMessage } from "../templates/versions/2.0.0";
import type { VersionObject } from "../types";

export const v2_0: VersionObject = {
  appliesTo: "<=1.10",
  version: "2.0",
  update: () => {
    // Update state data
    const config = getConfig();
    config.version = "2.0";
    config.playersCanTargetParty = true;
    setConfig(config);

    // Send message explaining update
    const title = "ChatSetAttr Updated to Version 2.0";
    const content = createVersionMessage();

    sendNotification(title, content, false);
  },
};
