import { s } from "../utils/chat";
import { buttonStyleBase } from "./styles";

export function createWelcomeMessage(): string {
  const buttonStyle = s(buttonStyleBase);
  return (
    <div>
      <p>Thank you for installing ChatSetAttr.</p>
      <p>To get started, use the command <code>!setattr-config</code> to configure the script to your needs.</p>
      <p>For detailed documentation and examples, please use the <code>!setattr-help</code> command or click the button below:</p>
      <p><a href="!setattrs-help" style={buttonStyle}>Create Journal Handout</a></p>
    </div>
  );
}