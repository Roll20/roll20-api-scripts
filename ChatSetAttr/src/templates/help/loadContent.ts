import type { HelpDocument } from "./types";
import helpContent from "../../../docs/help/content.json";

export function loadHelpDocument(): HelpDocument {
  return helpContent as HelpDocument;
}
