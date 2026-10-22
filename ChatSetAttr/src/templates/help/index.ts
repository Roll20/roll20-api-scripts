import { loadHelpDocument } from "./loadContent";
import { renderHelpHtml } from "./renderHtml";

export function createHelpHandout(handoutID: string): string {
  return renderHelpHtml(loadHelpDocument(), handoutID);
}
