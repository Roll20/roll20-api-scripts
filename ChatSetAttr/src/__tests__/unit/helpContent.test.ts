import { describe, it, expect } from "vitest";

import { loadHelpDocument } from "../../templates/help/loadContent";
import { renderHelpHtml } from "../../templates/help/renderHtml";
import { renderHelpMarkdown } from "../../templates/help/renderMarkdown";
import type { HelpDocument } from "../../templates/help/types";

const fixture: HelpDocument = {
  title: "Fixture Help",
  introduction: "Intro with `code` and **bold**.",
  sections: [
    {
      id: "sample-section",
      title: "Sample Section",
      blocks: [
        { type: "paragraph", text: "Placeholder `--fb-from <NAME>` and `<<1d6>>`." },
        { type: "codeBlock", lines: ["&{template:default} {{name=Test}}"] },
        { type: "unorderedList", items: ["First item", "Second with `code`"] },
        {
          type: "orderedList",
          items: [
            { text: "Step one" },
            {
              text: "Step two with example",
              codeBlock: { lines: ["!setattr --sel --hp|25"] },
            },
          ],
        },
        { type: "note", text: "A regular note.", emphasis: false },
        { type: "note", text: "An emphasized note.", emphasis: true },
      ],
      subsections: [
        {
          id: "nested",
          title: "Nested Subsection",
          blocks: [{ type: "paragraph", text: "Subsection body." }],
        },
      ],
    },
    {
      id: "second-section",
      title: "Second Section",
      blocks: [{ type: "paragraph", text: "More content." }],
    },
  ],
};

describe("help content loaders", () => {
  it("should load a document with required fields", () => {
    const doc = loadHelpDocument();

    expect(typeof doc.title).toBe("string");
    expect(doc.title.length).toBeGreaterThan(0);
    expect(typeof doc.introduction).toBe("string");
    expect(Array.isArray(doc.sections)).toBe(true);
    expect(doc.sections.length).toBeGreaterThan(0);

    for (const section of doc.sections) {
      expect(typeof section.id).toBe("string");
      expect(section.id.length).toBeGreaterThan(0);
      expect(typeof section.title).toBe("string");
      expect(section.title.length).toBeGreaterThan(0);
    }
  });
});

describe("help content rendering", () => {
  it("should render markdown with a table of contents when requested", () => {
    const markdown = renderHelpMarkdown(fixture, { includeToc: true });

    expect(markdown).toContain("## Table of Contents");
    expect(markdown).toContain("1. [Sample Section](#sample-section)");
    expect(markdown).toContain("2. [Second Section](#second-section)");
    expect(markdown).toContain("## Sample Section");
    expect(markdown).toContain("### Nested Subsection");
  });

  it("should render markdown without a table of contents", () => {
    const markdown = renderHelpMarkdown(fixture, { includeToc: false });

    expect(markdown).not.toContain("## Table of Contents");
    expect(markdown.startsWith("# Fixture Help")).toBe(true);
  });

  it("should render markdown block types from fixture content", () => {
    const markdown = renderHelpMarkdown(fixture, { includeToc: false });

    expect(markdown).toContain("Placeholder `--fb-from <NAME>` and `<<1d6>>`.");
    expect(markdown).toContain("&{template:default} {{name=Test}}");
    expect(markdown).toContain("- First item");
    expect(markdown).toContain("1. Step one");
    expect(markdown).toContain("> **Note:** An emphasized note.");
    expect(markdown).toContain("> A regular note.");
  });

  it("should escape literal angle brackets in handout HTML", () => {
    const html = renderHelpHtml(fixture, "test-handout-id");

    expect(html).toContain("--fb-from &lt;NAME&gt;");
    expect(html).toContain("&lt;&lt;1d6&gt;&gt;");
    expect(html).not.toContain("--fb-from <NAME>");
  });

  it("should preserve roll template syntax in handout HTML", () => {
    const html = renderHelpHtml(fixture, "test-handout-id");

    expect(html).toContain("&amp;{template:default}");
    expect(html).toContain("journal.roll20.net/handout/test-handout-id/#Sample%20Section");
  });

  it("should render ordered list code blocks and notes in handout HTML", () => {
    const html = renderHelpHtml(fixture, "test-handout-id");

    expect(html).toContain("!setattr --sel --hp|25");
    expect(html).toContain("<strong>Note:</strong>");
    expect(html).toContain("Nested Subsection");
  });
});
