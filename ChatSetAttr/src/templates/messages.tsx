import { s } from "../utils/chat";
import { frameStyleBase, frameStyleError, headerStyleBase } from "./styles";

const CHAT_WRAPPER_STYLE = s(frameStyleBase);

const CHAT_HEADER_STYLE = s(headerStyleBase);

const CHAT_BODY_STYLE = s({
  fontSize: "14px",
  lineHeight: "1.4",
});

const ERROR_WRAPPER_STYLE = s({
  ...frameStyleBase,
  ...frameStyleError,
});

const ERROR_HEADER_STYLE = s(headerStyleBase);

const ERROR_BODY_STYLE = s({
  fontSize: "14px",
  lineHeight: "1.4",
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