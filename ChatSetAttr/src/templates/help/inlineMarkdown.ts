import { SafeHtml } from "../../utils/chat";

const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`)/g;

export function renderInlineMarkdown(text: string): string {
  return text;
}

export function renderInlineHtml(text: string): SafeHtml {
  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  INLINE_PATTERN.lastIndex = 0;
  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(`<strong>${escapeHtml(token.slice(2, -2))}</strong>`);
    } else {
      parts.push(`<code>${escapeHtml(token.slice(1, -1))}</code>`);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)));
  }

  return new SafeHtml(parts.join(""));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function joinCodeLines(lines: string[]): string {
  return lines.join("\n");
}
