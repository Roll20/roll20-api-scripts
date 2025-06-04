import { createStyle } from "../utils/createStyle";

type MessageType = "error" | "info" | "feedback";

export type ChatProps = {
  header?: string;
  content?: string;
  from?: string;
  playerID?: string;
  type?: MessageType;
  whisper?: boolean;
};

export class ChatOutput {
  public header: string;
  public content: string;
  public from: string;
  public playerID: string;
  public type: MessageType;
  public whisper: boolean;

  private chatStyle = createStyle({
    border: `1px solid #ccc`,
    borderRadius: `5px`,
    padding: `5px`,
    backgroundColor: `#f9f9f9`,
  });

  private headerStyle = createStyle({
    fontSize: `1.2em`,
    fontWeight: `bold`,
    marginBottom: `5px`,
  });

  private errorStyle = createStyle({
    border: `1px solid #f00`,
    borderRadius: `5px`,
    padding: `5px`,
    backgroundColor: `#f9f9f9`,
  });

  private errorHeaderStyle = createStyle({
    color: `#f00`,
    fontWeight: `bold`,
    fontSize: `1.2em`,
  });

  constructor({
    playerID = "GM",
    header = "",
    content = "",
    from = "ChatOutput",
    type = "info",
    whisper = false,
  }: ChatProps = {}) {
    this.playerID = playerID;
    this.header = header;
    this.content = content;
    this.from = from;
    this.type = type;
    this.whisper = whisper;
  };

  public send() {
    const noarchive = this.type === "feedback" ? false : true;
    let output = ``;
    output += this.createWhisper();
    output += this.createWrapper();
    output += this.createHeader();
    output += this.createContent();
    output += this.closeWrapper();
    sendChat(this.from, output, undefined, { noarchive });
  };

  private createWhisper() {
    if (this.whisper === false) {
      return ``;
    }
    if (this.playerID === "GM") {
      return `/w GM `;
    }
    const player = getObj("player", this.playerID);
    if (!player) {
      return `/w GM `;
    }
    const playerName = player.get("_displayname");
    if (!playerName) {
      return `/w GM `;
    }
    return `/w "${playerName}" `;
  };

  private createWrapper() {
    const style = this.type === "error" ? this.errorStyle : this.chatStyle;
    return `<div style='${style}'>`;
  };

  private createHeader() {
    if (!this.header) {
      return ``;
    }
    const style = this.type === "error" ? this.errorHeaderStyle : this.headerStyle;
    return `<h3 style='${style}'>${this.header}</h3>`;
  };

  private createContent() {
    if (!this.content) {
      return ``;
    }
    if (this.content.startsWith("<")) {
      return this.content; // Already HTML content
    }
    return `<p>${this.content}</p>`;
  };

  private closeWrapper() {
    return `</div>`;
  };
};