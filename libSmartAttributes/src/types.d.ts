declare namespace SmartAttributes {
  function getAttribute(characterId: string, name: string, type?: "current" | "max"): Promise<string | number | undefined>;
  function setAttribute(characterId: string, name: string, value: unknown, type?: "current" | "max", options?: { setWithWorker?: boolean, noCreate?: boolean }): Promise<void>;
  function deleteAttribute(characterId: string, name: string, type?: "current" | "max", options?: { setWithWorker?: boolean }): Promise<void>;
}