import { createDelayMessage } from "../templates/delay";
import { createChatMessage, createErrorMessage } from "../templates/messages";
import { createNotifyMessage } from "../templates/notification";
import { buttonStyleBase } from "../templates/styles";
import { createWelcomeMessage } from "../templates/welcome";
//import { s } from "../utils/chat";

export function getPlayerName(playerID: string): string | undefined {
  const player = getObj("player", playerID);
  return player?.get("_displayname") || undefined;
};

export function sendMessages(
  playerID: string,
  header: string,
  messages: string[],
  from: string = "ChatSetAttr",
): void {
  const newMessage = createChatMessage(header, messages);
  const player = getPlayerName(playerID);
  sendChat(from, `/w "${player || "GM"}" ${newMessage}`);
};

export function sendErrors(
  playerID: string,
  header: string,
  errors: string[],
  from: string = "ChatSetAttr",
): void {
  if (errors.length === 0) return;
  const newMessage = createErrorMessage(header, errors);
  const player = getPlayerName(playerID);
  sendChat(from, `/w "${player || "GM"}" ${newMessage}`);
};

export function sendDelayMessage(silent: boolean = false): void {
  if (silent) return;
  const delayMessage = createDelayMessage();
  sendChat("ChatSetAttr", delayMessage, undefined, { noarchive: true });
};

export function sendNotification(title: string, content: string, archive?: boolean): void {
  const notifyMessage = createNotifyMessage(title, content);
  sendChat("ChatSetAttr", "/w gm " + notifyMessage, undefined, { noarchive: archive });
};

export function sendWelcomeMessage(): void {
  const welcomeMessage = createWelcomeMessage();
  sendNotification("Welcome to ChatSetAttr!", welcomeMessage, false);
};