export function convertCamelToKebab(camel: string): string {
  return camel.replace(/([a-z])([A-Z])/g, `$1-$2`).toLowerCase();
};

export function createStyle(styleObject: Record<string, string>) {
  let style = ``;
  for (const [key, value] of Object.entries(styleObject)) {
    const kebabKey = convertCamelToKebab(key);
    style += `${kebabKey}: ${value};`;
  }
  return style;
};