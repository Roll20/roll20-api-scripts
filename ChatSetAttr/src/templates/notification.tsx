import { s } from "../utils/chat";
import { BORDER_RADIUS, COLOR_BLUE, FONT_SIZE, PADDING } from "./styles";

const NOTIFY_WRAPPER_STYLE = s({
  border: `1px solid ${COLOR_BLUE["300"]}`,
  borderRadius: BORDER_RADIUS.MD,
  padding: PADDING.MD,
  color: COLOR_BLUE["800"],
  backgroundColor: COLOR_BLUE["100"],
});

const NOTIFY_HEADER_STYLE = s({
  color: COLOR_BLUE["900"],
  fontSize: FONT_SIZE.LG,
  fontWeight: "bold",
  marginBottom: PADDING.SM,
});

const NOTIFY_BODY_STYLE = s({
  fontSize: FONT_SIZE.MD,
});

export function createNotifyMessage(title: string, content: string): string {
  return (
    <div style={NOTIFY_WRAPPER_STYLE}>
      <div style={NOTIFY_HEADER_STYLE}>{title}</div>
      <div style={NOTIFY_BODY_STYLE}>
        {content}
      </div>
    </div>
  );
};