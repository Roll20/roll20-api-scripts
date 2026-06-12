import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import helpContent from "../../../docs/help/content.json";
import { loadHelpDocument } from "../../templates/help/loadContent";
import { renderHelpHtml } from "../../templates/help/renderHtml";
import { renderHelpMarkdown } from "../../templates/help/renderMarkdown";
import type { HelpDocument } from "../../templates/help/types";

const SECTION_IDS = [
  "basic-usage",
  "available-commands",
  "beacon-computed-values",
  "target-selection",
  "attribute-syntax",
  "modifier-options",
  "output-control-options",
  "inline-roll-integration",
  "repeating-section-support",
  "special-value-expressions",
  "global-configuration",
  "complete-examples",
  "for-developers",
];

describe("help content", () => {
  it("should load a document with all expected sections", () => {
    const doc = loadHelpDocument();
    expect(doc.title).toBe("ChatSetAttr");
    expect(doc.sections).toHaveLength(SECTION_IDS.length);
    expect(doc.sections.map(section => section.id)).toEqual(SECTION_IDS);
  });

  it("should match the on-disk content.json file", () => {
    const doc = loadHelpDocument();
    expect(doc).toEqual(helpContent);
  });

  it("should render markdown with a table of contents when requested", () => {
    const doc = loadHelpDocument();
    const markdown = renderHelpMarkdown(doc, { includeToc: true });
    expect(markdown).toContain("## Table of Contents");
    expect(markdown).toContain("1. [Basic Usage](#basic-usage)");
    expect(markdown).toContain("## Beacon Computed Values");
  });

  it("should render markdown without a table of contents for script.json", () => {
    const doc = loadHelpDocument();
    const markdown = renderHelpMarkdown(doc, { includeToc: false });
    expect(markdown).not.toContain("## Table of Contents");
    expect(markdown.startsWith("# ChatSetAttr")).toBe(true);
  });

  it("should escape literal angle brackets in handout HTML", () => {
    const doc = loadHelpDocument();
    const html = renderHelpHtml(doc, "test-handout-id");
    expect(html).toContain("--fb-from &lt;NAME&gt;");
    expect(html).toContain("Roll &lt;&lt;1d6&gt;&gt; to succeed");
    expect(html).not.toContain("--fb-from <NAME>");
  });

  it("should preserve roll template syntax in handout HTML", () => {
    const doc = loadHelpDocument();
    const html = renderHelpHtml(doc, "test-handout-id");
    expect(html).toContain("&amp;{template:default}");
    expect(html).toContain("journal.roll20.net/handout/test-handout-id/#Basic%20Usage");
  });

  it("should render script description matching markdown without TOC", () => {
    const doc = loadHelpDocument();
    const scriptJson = JSON.parse(
      readFileSync(join(process.cwd(), "script.json"), "utf8"),
    ) as { description?: string };
    const expected = renderHelpMarkdown(doc, { includeToc: false }).trim();
    expect(scriptJson.description).toBe(expected);
  });

  it("should render README matching markdown with TOC header", () => {
    const doc = loadHelpDocument();
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const expected = "<!-- Generated from docs/help/content.json. Run pnpm docs:generate -->\n\n"
      + renderHelpMarkdown(doc, { includeToc: true });
    expect(readme).toBe(expected);
  });
});

describe("help content fixture", () => {
  const fixture: HelpDocument = {
    title: "Fixture",
    introduction: "Intro with `code` and **bold**.",
    sections: [
      {
        id: "sample",
        title: "Sample",
        blocks: [
          { type: "paragraph", text: "Placeholder `--fb-from <NAME>` and `<<1d6>>`." },
          { type: "codeBlock", lines: ["&{template:default} {{name=Test}}"] },
        ],
      },
    ],
  };

  it("should render fixture markdown predictably", () => {
    const markdown = renderHelpMarkdown(fixture, { includeToc: false });
    expect(markdown).toContain("Placeholder `--fb-from <NAME>` and `<<1d6>>`.");
    expect(markdown).toContain("&{template:default} {{name=Test}}");
  });

  it("should render fixture HTML with escaped display characters", () => {
    const html = renderHelpHtml(fixture, "fixture-handout");
    expect(html).toContain("&lt;NAME&gt;");
    expect(html).toContain("&lt;&lt;1d6&gt;&gt;");
    expect(html).toContain("&amp;{template:default}");
  });
});
