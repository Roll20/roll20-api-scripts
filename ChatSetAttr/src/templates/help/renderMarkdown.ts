import type {
  HelpBlock,
  HelpDocument,
  HelpSection,
  HelpSubsection,
  RenderMarkdownOptions,
} from "./types";
import { joinCodeLines, renderInlineMarkdown } from "./inlineMarkdown";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderCodeFence(lines: string[]): string {
  return "```\n" + joinCodeLines(lines) + "\n```";
}

function renderBlocks(blocks: HelpBlock[] | undefined, lines: string[]): void {
  if (!blocks) return;

  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
        lines.push("", renderInlineMarkdown(block.text));
        break;
      case "codeBlock":
        lines.push("", renderCodeFence(block.lines));
        break;
      case "unorderedList":
        lines.push("");
        for (const item of block.items) {
          lines.push(`- ${renderInlineMarkdown(item)}`);
        }
        break;
      case "orderedList":
        lines.push("");
        block.items.forEach((item, index) => {
          lines.push(`${index + 1}. ${renderInlineMarkdown(item.text)}`);
          if (item.codeBlock) {
            lines.push(renderCodeFence(item.codeBlock.lines));
          }
        });
        break;
      case "note":
        lines.push("", block.emphasis
          ? `> **Note:** ${renderInlineMarkdown(block.text)}`
          : `> ${renderInlineMarkdown(block.text)}`);
        break;
    }
  }
}

function renderSubsection(subsection: HelpSubsection, lines: string[]): void {
  lines.push("", `### ${subsection.title}`);
  renderBlocks(subsection.blocks, lines);
}

function renderSection(section: HelpSection, lines: string[]): void {
  lines.push("", `## ${section.title}`);
  renderBlocks(section.blocks, lines);
  section.subsections?.forEach(subsection => renderSubsection(subsection, lines));
}

export function renderHelpMarkdown(
  doc: HelpDocument,
  options: RenderMarkdownOptions = {},
): string {
  const lines: string[] = [
    `# ${doc.title}`,
    "",
    doc.introduction,
  ];

  if (options.includeToc) {
    lines.push("", "## Table of Contents", "");
    doc.sections.forEach((section, index) => {
      lines.push(`${index + 1}. [${section.title}](#${section.id})`);
    });
  }

  doc.sections.forEach(section => renderSection(section, lines));

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function getSubsectionAnchor(subsection: HelpSubsection): string {
  return subsection.id ?? slugify(subsection.title);
}
