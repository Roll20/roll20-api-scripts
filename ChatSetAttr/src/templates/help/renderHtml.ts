import { h, SafeHtml } from "../../utils/chat";
import type {
  HelpBlock,
  HelpDocument,
  HelpSection,
  HelpSubsection,
} from "./types";
import { joinCodeLines, renderInlineHtml } from "./inlineMarkdown";

type Child = string | SafeHtml | null | undefined | Child[];

function concatHtml(...parts: SafeHtml[]): SafeHtml {
  return new SafeHtml(parts.map(part => part.html).join(""));
}

function renderBlocks(blocks: HelpBlock[] | undefined): SafeHtml[] {
  if (!blocks) return [];

  const parts: SafeHtml[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
        parts.push(h("p", {}, renderInlineHtml(block.text)));
        break;
      case "codeBlock":
        parts.push(h("pre", {}, h("code", {}, joinCodeLines(block.lines))));
        break;
      case "unorderedList":
        parts.push(h(
          "ul",
          {},
          ...block.items.map(item => h("li", {}, renderInlineHtml(item))),
        ));
        break;
      case "orderedList":
        parts.push(h(
          "ol",
          {},
          ...block.items.map(item => {
            const children: Child[] = [renderInlineHtml(item.text)];
            if (item.codeBlock) {
              children.push(h("pre", {}, h("code", {}, joinCodeLines(item.codeBlock.lines))));
            }
            return h("li", {}, ...children);
          }),
        ));
        break;
      case "note":
        parts.push(block.emphasis
          ? h("p", {}, h("em", {}, h("strong", {}, "Note:"), " ", renderInlineHtml(block.text)))
          : h("p", {}, renderInlineHtml(block.text)));
        break;
    }
  }
  return parts;
}

function renderSubsection(subsection: HelpSubsection): SafeHtml {
  return concatHtml(
    h("h3", {}, subsection.title),
    ...renderBlocks(subsection.blocks),
  );
}

function renderSection(section: HelpSection): SafeHtml {
  return concatHtml(
    h("h2", { id: section.id }, section.title),
    ...renderBlocks(section.blocks),
    ...(section.subsections?.map(renderSubsection) ?? []),
  );
}

function renderTableOfContents(doc: HelpDocument, handoutID: string): SafeHtml {
  return h(
    "ol",
    {},
    ...doc.sections.map(section => h(
      "li",
      {},
      h(
        "a",
        {
          href: `http://journal.roll20.net/handout/${handoutID}/#${section.title.replace(/\s+/g, "%20")}`,
        },
        section.title,
      ),
    )),
  );
}

export function renderHelpHtml(doc: HelpDocument, handoutID: string): string {
  return concatHtml(
    h("h1", {}, doc.title),
    h("p", {}, doc.introduction),
    h("h2", {}, "Table of Contents"),
    renderTableOfContents(doc, handoutID),
    ...doc.sections.map(section => renderSection(section)),
  ).html;
}
