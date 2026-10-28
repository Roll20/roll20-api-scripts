declare namespace SmartAttributes {
  function getAttribute(characterId: string, name: string, type?: "current" | "max"): Promise<string | number | undefined>;
  function setAttribute(characterId: string, name: string, value: unknown, type?: "current" | "max", options?: { setWithWorker?: boolean, noCreate?: boolean }): Promise<boolean>;
  function deleteAttribute(characterId: string, name: string, type?: "current" | "max"): Promise<boolean>;
}