export type CodeBlock = {
  lines: string[];
};

export type ParagraphBlock = {
  type: "paragraph";
  text: string;
};

export type CodeBlockBlock = {
  type: "codeBlock";
} & CodeBlock;

export type UnorderedListBlock = {
  type: "unorderedList";
  items: string[];
};

export type OrderedListItem = {
  text: string;
  codeBlock?: CodeBlock;
};

export type OrderedListBlock = {
  type: "orderedList";
  items: OrderedListItem[];
};

export type NoteBlock = {
  type: "note";
  text: string;
  emphasis?: boolean;
};

export type HelpBlock =
  | ParagraphBlock
  | CodeBlockBlock
  | UnorderedListBlock
  | OrderedListBlock
  | NoteBlock;

export type HelpSubsection = {
  id?: string;
  title: string;
  blocks: HelpBlock[];
};

export type HelpSection = {
  id: string;
  title: string;
  blocks?: HelpBlock[];
  subsections?: HelpSubsection[];
};

export type HelpDocument = {
  title: string;
  introduction: string;
  sections: HelpSection[];
};

export type RenderMarkdownOptions = {
  includeToc?: boolean;
};
