import { s } from "../utils/chat";
import { BORDER_RADIUS, COLOR_EMERALD, COLOR_RED, FONT_SIZE, PADDING } from "./styles";

// #region Chat Styles
const CHAT_WRAPPER_STYLE = s({
  border: `1px solid ${COLOR_EMERALD["300"]}`,
  borderRadius: BORDER_RADIUS.MD,
  padding: PADDING.MD,
  backgroundColor: COLOR_EMERALD["50"],
});

const CHAT_HEADER_STYLE = s({
  fontSize: FONT_SIZE.LG,
  fontWeight: "bold",
  marginBottom: PADDING.SM,
});

const CHAT_BODY_STYLE = s({
  fontSize: FONT_SIZE.SM,
});

// #region Error Styles
const ERROR_WRAPPER_STYLE = s({
  border: `1px solid ${COLOR_RED["300"]}`,
  borderRadius: BORDER_RADIUS.MD,
  padding: PADDING.MD,
  backgroundColor: COLOR_RED["50"],
});

const ERROR_HEADER_STYLE = s({
  color: COLOR_RED["500"],
  fontWeight: "bold",
  fontSize: FONT_SIZE.LG,
});

const ERROR_BODY_STYLE = s({
  fontSize: FONT_SIZE.SM,
});

// #region Message Styles Type
type MessageStyles = {
  wrapper: string;
  header: string;
  body: string;
};

// #region Generic Message Creation Function
function createMessage(
  header: string,
  messages: string[],
  styles: MessageStyles
): string {
  return (
    <div style={styles.wrapper}>
      <h3 style={styles.header}>{header}</h3>
      <div style={styles.body}>
        {messages.map(message => <p>{message}</p>)}
      </div>
    </div>
  );
}

// #region Chat Message Function
export function createChatMessage(header: string, messages: string[]): string {
  return createMessage(header, messages, {
    wrapper: CHAT_WRAPPER_STYLE,
    header: CHAT_HEADER_STYLE,
    body: CHAT_BODY_STYLE
  });
}

// #region Error Message Function
export function createErrorMessage(header: string, errors: string[]): string {
  return createMessage(header, errors, {
    wrapper: ERROR_WRAPPER_STYLE,
    header: ERROR_HEADER_STYLE,
    body: ERROR_BODY_STYLE
  });
}