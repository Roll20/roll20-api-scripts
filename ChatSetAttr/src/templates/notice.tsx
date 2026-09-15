import { s } from "../utils/chat";
import { frameStyleNotice, headerStyleBase } from "./styles";

const NOTICE_WRAPPER_STYLE = s(frameStyleNotice);

const NOTICE_HEADER_STYLE = s(headerStyleBase);

export function createNoticeMessage(title: string, content: string): string {
  return (
    <div style={NOTICE_WRAPPER_STYLE}>
      <div style={NOTICE_HEADER_STYLE}>{title}</div>
      <div>{content}</div>
    </div>
  ).html;
}
