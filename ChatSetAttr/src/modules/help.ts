import { createHelpHandout } from "../templates/help";

export function checkHelpMessage(msg: string): boolean {
  return msg.trim().toLowerCase().startsWith("!setattrs-help");
};

export function handleHelpCommand(): void {
  let handout = findObjs({
    _type: "handout",
    name: "ChatSetAttr Help",
  })[0];

  if (!handout) {
    handout = createObj("handout", {
      name: "ChatSetAttr Help",
    });
  }

  const helpContent = createHelpHandout(handout.id);

  handout.set({
    "inplayerjournals": "all",
    "notes": helpContent,
  });
};