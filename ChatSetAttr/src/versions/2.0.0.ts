import scriptJson from "../../script.json" assert { type: "json" };
import { sendNotification } from "../modules/chat";
import { setConfig } from "../modules/config";
import { createVersionMessage } from "../templates/versions/2.0.0";
import type { VersionObject } from "../types";

export const v2_0: VersionObject = {
  appliesTo: "<=3",
  version: 4,
  update: () => {
    setConfig({
      version: 4,
      playersCanTargetParty: true,
      scriptVersion: scriptJson.version,
    });

    const title = "ChatSetAttr Updated to Version 2.0";
    const content = createVersionMessage();

    sendNotification(title, content, false);
  },
};
