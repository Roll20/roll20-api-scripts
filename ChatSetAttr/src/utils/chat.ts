// #region Style Helpers
function convertCamelToKebab(camel: string): string {
  return camel.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

export function s(styleObject: Record<string, string> = {}) {
  let style = "";
  for (const [key, value] of Object.entries(styleObject)) {
    const kebabKey = convertCamelToKebab(key);
    style += `${kebabKey}: ${value};`;
  }
  return style;
};

// #region JSX Helper
type Child = string | null | undefined | Child[];

export function h(
  tagName: string,
  attributes: Record<string, string> = {},
  ...children: Child[]
): string {
  const attrs = Object.entries(attributes ?? {})
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");

  // Deeply flatten arrays and filter out null/undefined values
  const flattenedChildren = children.flat(10).filter(child => child != null);
  const childrenContent = flattenedChildren.join("");

  return `<${tagName}${attrs}>${childrenContent}</${tagName}>`;
};