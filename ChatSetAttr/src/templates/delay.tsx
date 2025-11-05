import { s } from "../utils/chat";
import { BORDER_RADIUS, COLOR_STONE, FONT_SIZE, PADDING } from "./styles";

const DELAY_WRAPPER_STYLE = s({
  border: `1px solid ${COLOR_STONE["400"]}`,
  borderRadius: BORDER_RADIUS.MD,
  padding: PADDING.MD,
  color: COLOR_STONE["900"],
  backgroundColor: COLOR_STONE["50"],
});

const DELAY_HEADER_STYLE = s({
  color: COLOR_STONE["700"],
  fontSize: FONT_SIZE.LG,
  fontWeight: "bold",
  marginBottom: PADDING.SM,
});

const DELAY_BODY_STYLE = s({
  fontSize: FONT_SIZE.SM,
});

export function createDelayMessage(): string {
  return (
    <div style={DELAY_WRAPPER_STYLE}>
      <div style={DELAY_HEADER_STYLE}>Long Running Query</div>
      <div style={DELAY_BODY_STYLE}>
        The operation is taking a long time to execute. This may be due to a large number of targets or attributes being processed. Please be patient as the operation completes.
      </div>
    </div>
  );
};