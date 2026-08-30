import { describe, it, expect } from "vitest";

import { createNotifyMessage } from "../../templates/notification";
import { createVersionMessage } from "../../templates/versions/2.0.0";
import { createWelcomeMessage } from "../../templates/welcome";

describe("notification", () => {
  it("should render welcome message HTML without escaping tags", () => {
    const message = createNotifyMessage("Welcome to ChatSetAttr!", createWelcomeMessage());

    expect(message).toContain("<p>Thank you for installing ChatSetAttr.</p>");
    expect(message).not.toContain("&lt;p&gt;");
  });

  it("should render version update HTML without escaping tags", () => {
    const message = createNotifyMessage(
      "ChatSetAttr Updated to Version 2.0",
      createVersionMessage(),
    );

    expect(message).toContain("<strong>ChatSetAttr has been updated to version 2.0!</strong>");
    expect(message).not.toContain("&lt;strong&gt;");
    expect(message).toContain("<ul>");
    expect(message).not.toContain("&lt;ul&gt;");
  });

  it("should still escape the notification title", () => {
    const message = createNotifyMessage(
      'Title with <script>alert("x")</script>',
      "<p>Body</p>",
    );

    expect(message).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(message).toContain("<p>Body</p>");
  });
});
