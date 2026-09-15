/// <reference types="@roll20/api-types" />
/// <reference types="lib-smart-attributes" />
/// <reference types="lib-libUUID" />

declare function h(
  tagName: string,
  attributes: Record<string, string>,
  ...children: (string | null | undefined)[]
): string;

declare namespace JSX {
  type Element = string;
  interface IntrinsicElements {
    [elemName: string]: {
      [key: string]: string | undefined;
    };
  }
}