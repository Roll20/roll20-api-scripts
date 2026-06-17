import { createChatMessage, createErrorMessage } from "../templates/messages";
import { createNoticeMessage } from "../templates/notice";
import { createNotifyMessage } from "../templates/notification";
import { createWelcomeMessage } from "../templates/welcome";

export const BEACON_UNSUPPORTED_NOTICE_TITLE = "Notice: Beacon Support Disabled";

export const BEACON_UNSUPPORTED_NOTICE_BODY =
  "Beacon character sheets are not supported on this Mod API Sandbox. " +
  "Please be sure you have the correct Sandbox selected on the Mod API Scripts Page " +
  "and restart the Mod API Server.";

export const LONG_RUNNING_QUERY_TITLE = "Long Running Query";

export const LONG_RUNNING_QUERY_BODY =
  "The operation is taking a long time to execute. This may be due to a large number of " +
  "targets or attributes being processed. Please be patient as the operation completes.";

export type CommandOutputOptions = {
  silent?: boolean;
  mute?: boolean;
};

export type NormalizedCommandOutputOptions = {
  silent: boolean;
  mute: boolean;
};

export type FeedbackDeliveryOptions = {
  from?: string;
  public?: boolean;
};

export function getWhisperPrefix(playerID: string): string {
  const player = getPlayerName(playerID);
  return `/w "${player || "GM"}" `;
}

export function normalizeCommandOutputOptions(
  options: CommandOutputOptions = {},
): NormalizedCommandOutputOptions {
  return {
    mute: Boolean(options.mute),
    silent: Boolean(options.silent || options.mute),
  };
};

export function getPlayerName(playerID: string): string | undefined {
  const player = getObj("player", playerID);
  return player?.get("_displayname") || undefined;
};

export function sendMessages(
  playerID: string,
  header: string,
  messages: string[],
  delivery?: FeedbackDeliveryOptions,
  output?: NormalizedCommandOutputOptions,
): void {
  if (output?.silent) {
    return;
  }

  const from = delivery?.from ?? "ChatSetAttr";
  const newMessage = createChatMessage(header, messages);
  const chatMessage = delivery?.public
    ? newMessage
    : `${getWhisperPrefix(playerID)}${newMessage}`;
  sendChat(from, chatMessage);
};

export function sendErrors(
  playerID: string,
  header: string,
  errors: string[],
  from?: string,
  output?: NormalizedCommandOutputOptions,
): void {
  if (errors.length === 0 || output?.mute) {
    return;
  }

  const sender = from ?? "ChatSetAttr";
  const newMessage = createErrorMessage(header, errors);
  sendChat(sender, `${getWhisperPrefix(playerID)}${newMessage}`);
};

export function sendDelayMessage(
  playerID: string,
  output?: NormalizedCommandOutputOptions,
): void {
  if (output?.silent) {
    return;
  }

  const noticeMessage = createNoticeMessage(LONG_RUNNING_QUERY_TITLE, LONG_RUNNING_QUERY_BODY);
  sendChat(
    "ChatSetAttr",
    `${getWhisperPrefix(playerID)}${noticeMessage}`,
    undefined,
    { noarchive: true },
  );
};

export function sendBeaconUnsupportedNotice(): void {
  const message = createNoticeMessage(
    BEACON_UNSUPPORTED_NOTICE_TITLE,
    BEACON_UNSUPPORTED_NOTICE_BODY,
  );
  sendChat("ChatSetAttr", "/w gm " + message, undefined, { noarchive: true });
};

export function sendNotification(title: string, content: string, archive?: boolean): void {
  const notifyMessage = createNotifyMessage(title, content);
  sendChat("ChatSetAttr", "/w gm " + notifyMessage, undefined, { noarchive: archive });
};

export function sendWelcomeMessage(): void {
  const welcomeMessage = createWelcomeMessage();
  sendNotification("Welcome to ChatSetAttr!", welcomeMessage, false);
};
