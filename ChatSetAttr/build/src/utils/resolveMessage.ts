import type { DeltasObject } from "../classes/APIWrapper";
import type { ErrorResponse } from "../classes/ErrorManager";
import { Flags, type Option } from "../classes/InputParser";

export type MessageResolverArguments = {
  defaultMessage?: string;
  options: Option[];
  character: Roll20Character;
  attributes: DeltasObject;
  origAttributes: DeltasObject;
  responses: ErrorResponse[];
};

export function resolveMessage({
  defaultMessage = "",
  options,
  responses = [],
  character,
  attributes,
  origAttributes,
}: MessageResolverArguments): string {
  const optMessage = options.find((opt) => opt.name === Flags.FB_CONTENT);
  if (optMessage?.value) {
    const messageContent = replacePlaceholders(
      optMessage.value,
      character,
      attributes,
      origAttributes ?? attributes,
    );
    return messageContent;
  }
  const messages: string[] = [];
  for (const responseSet of responses) {
    if (responseSet.messages.length > 0) {
      messages.push(...responseSet.messages);
    }
  }
  if (messages.length > 0) {
    const messageContent = messages[0];
    return messageContent;
  }
  return defaultMessage;
};

function replacePlaceholders(
  message: string,
  character: Roll20Character,
  attributes: DeltasObject,
  origAttributes: DeltasObject,
): string {
  const entries = Object.entries(attributes);
  const origEntries = Object.entries(origAttributes);
  const newMessage = message
    .replace(/_NAME(\d+)_/g, (_, index) => {
      const attr = entries[parseInt(index, 10)];
      return attr[1].name ?? "";
    })
    .replace(/_TCUR(\d+)_/g, (_, index) => {
      const attr = entries[parseInt(index, 10)];
      return attr[1].value ?? "";
    })
    .replace(/_TMAX(\d+)_/g, (_, index) => {
      const attr = entries[parseInt(index, 10)];
      return attr[1].max ?? "";
    })
    .replace(/_CUR(\d+)_/g, (_, index) => {
      const attr = origEntries[parseInt(index, 10)];
      return attr[1].value ?? "";
    })
    .replace(/_MAX(\d+)_/g, (_, index) => {
      const attr = origEntries[parseInt(index, 10)];
      return attr[1].max ?? "";
    })
    .replace(/_CHARNAME_/g, character.get("name") ?? "");
  return newMessage;
}