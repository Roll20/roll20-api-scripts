import { describe, it, expect } from "vitest";

import { createNoticeMessage } from "../../templates/notice";
import { createNotifyMessage } from "../../templates/notification";
import {
  BEACON_UNSUPPORTED_NOTICE_BODY,
  BEACON_UNSUPPORTED_NOTICE_TITLE,
  LONG_RUNNING_QUERY_BODY,
  LONG_RUNNING_QUERY_TITLE,
} from "../../modules/chat";

describe("notice", () => {
  it("should render Beacon unsupported notice copy", () => {
    const message = createNoticeMessage(
      BEACON_UNSUPPORTED_NOTICE_TITLE,
      BEACON_UNSUPPORTED_NOTICE_BODY,
    );

    expect(message).toContain("Notice: Beacon Support Disabled");
    expect(message).toContain("Mod API Sandbox");
    expect(message).toContain("Mod API Scripts Page");
    expect(message).not.toContain("Default");
    expect(message).not.toContain("Production");
    expect(message).not.toContain("Experimental");
  });

  it("should render Long Running Query notice copy", () => {
    const message = createNoticeMessage(LONG_RUNNING_QUERY_TITLE, LONG_RUNNING_QUERY_BODY);

    expect(message).toContain("Long Running Query");
    expect(message).toContain("long time to execute");
  });

  it("should use yellow notice styling instead of blue notification styling", () => {
    const message = createNoticeMessage("Test Notice", "Body text");

    expect(message).toContain("rgba(245, 158, 11");
    expect(message).not.toContain("rgba(59, 130, 246");
  });

  it("should look distinct from notification messages for the same title and body", () => {
    const title = "Shared Title";
    const body = "Shared body text";

    const notice = createNoticeMessage(title, body);
    const notification = createNotifyMessage(title, body);

    expect(notice).toContain("rgba(245, 158, 11");
    expect(notification).toContain("rgba(59, 130, 246");
    expect(notice).not.toContain("rgba(59, 130, 246");
    expect(notification).not.toContain("rgba(245, 158, 11");
  });

  it("should escape the title and plain-text body", () => {
    const message = createNoticeMessage(
      'Title with <script>alert("x")</script>',
      'Body with <em>tags</em>',
    );

    expect(message).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(message).toContain("&lt;em&gt;tags&lt;/em&gt;");
  });

  it("should include wrapper, header, and body structure", () => {
    const message = createNoticeMessage("Header", "Content");

    expect(message).toMatch(/<div[^>]*>.*<div[^>]*>Header<\/div>.*<div[^>]*>Content<\/div>.*<\/div>/s);
  });
});
