import { s } from "../utils/chat";
import { frameStyleBase, headerStyleBase } from "./styles";

const NOTIFY_WRAPPER_STYLE = s(frameStyleBase);

const NOTIFY_HEADER_STYLE = s(headerStyleBase);

export function createNotifyMessage(title: string, content: string): string {
  return (
    <div style={NOTIFY_WRAPPER_STYLE}>
      <div style={NOTIFY_HEADER_STYLE}>{title}</div>
      <div>
        {content}
      </div>
    </div>
  );
};