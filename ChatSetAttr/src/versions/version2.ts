import { sendNotification } from "../modules/chat";
import { getConfig, setConfig } from "../modules/config";
import { frameStyleBase } from "../templates/styles";
import type { VersionObject } from "../types";
import { s } from "../utils/chat";

const LI_STYLE = s({
  marginBottom: "4px",
});

const WRAPPER_STYLE = s(frameStyleBase);

const PARAGRAPH_SPACING_STYLE = s({
  marginTop: "8px",
  marginBottom: "8px",
});

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
    const content = `
      <div style="${WRAPPER_STYLE}">
        <p><strong>ChatSetAttr has been updated to version 2.0!</strong></p>
        <p>This update includes important changes to improve compatibility and performance.</p>

        <strong>Changelog:</strong>
        <ul>
          <li style="${LI_STYLE}">Added compatibility for Beacon sheets, including the new Dungeons and Dragons character sheet.</li>
          <li style="${LI_STYLE}">Added support for targeting party members with the <code>--party</code> flag.</li>
          <li style="${LI_STYLE}">Added support for excluding party members when targeting selected tokens with the <code>--sel-noparty</code> flag.</li>
          <li style="${LI_STYLE}">Added support for including only party members when targeting selected tokens with the <code>--sel-party</code> flag.</li>
        </ul>

        <p>Please review the updated documentation for details on these new features and how to use them.</p>
        <div style="${PARAGRAPH_SPACING_STYLE}">
          <strong>If you encounter any bugs or issues, please report them via the <a href="https://help.roll20.net/hc/en-us/requests/new">Roll20 Helpdesk</a></strong>
        </div>
        <div style="${PARAGRAPH_SPACING_STYLE}">
          <strong>If you want to create a handout with the updated documentation, use the command <code>!setattrs-help</code> or click the button below</strong>
          <a href="!setattrs-help">Create Help Handout</a>
        </div>
      </div>
    `;

    sendNotification(title, content, false);
  },
};
