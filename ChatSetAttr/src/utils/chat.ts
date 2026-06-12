// #region Style Helpers
function convertCamelToKebab(camel: string): string {
  return camel.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export function s(styleObject: Record<string, string> = {}) {
  let style = "";
  for (const [key, value] of Object.entries(styleObject)) {
    const kebabKey = convertCamelToKebab(key);
    style += `${kebabKey}: ${value};`;
  }
  return style;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export class SafeHtml {
  constructor(public readonly html: string) {}
}

function renderChild(child: Child): string {
  if (child instanceof SafeHtml) {
    return child.html;
  }
  if (typeof child === "string") {
    return escapeHtml(child);
  }
  return "";
}

// #region JSX Helper
type Child = string | SafeHtml | null | undefined | Child[];

export function h(
  tagName: string,
  attributes: Record<string, string> = {},
  ...children: Child[]
): SafeHtml {
  const attrs = Object.entries(attributes ?? {})
    .map(([key, value]) => ` ${key}="${escapeHtml(String(value))}"`)
    .join("");

  const flattenedChildren = children.flat(10).filter(child => child != null);
  const childrenContent = flattenedChildren.map(renderChild).join("");

  return new SafeHtml(`<${tagName}${attrs}>${childrenContent}</${tagName}>`);
}
