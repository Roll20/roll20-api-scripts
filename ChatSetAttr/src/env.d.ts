/// <reference types="@roll20/api-types" />

/** Module shim so `declare global` augments the shared global scope for real modules. */
export {};

declare global {
  /** Roll20 loads this from the libSmartAttributes dependency script (not bundled). */
  var libSmartAttributes: typeof import("lib-smart-attributes").default;
  /** Roll20 loads this from the libUUID dependency script (not bundled). */
  var libUUID: { generateRowID(): string; generateUUID(): string };
  /** Roll20 Mod API persistent script state. */
  var state: {
    ChatSetAttr?: Record<string, unknown> & { version?: string };
    [key: string]: unknown;
  };
  /** Roll20 One-Click script page configuration. */
  var globalconfig: {
    chatsetattr?: Record<string, string | number> & { lastsaved?: number };
    [key: string]: unknown;
  };

  function h(
    tagName: string,
    attributes: Record<string, string>,
    ...children: (string | null | undefined)[]
  ): string;
  var s: typeof import("./utils/chat").s;

  namespace JSX {
    type Element = string;
    interface IntrinsicElements {
      [elemName: string]: {
        [key: string]: string | undefined;
      };
    }
  }
}
