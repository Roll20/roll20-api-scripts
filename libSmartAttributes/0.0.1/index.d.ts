type AttributeType = "current" | "max";
declare function getAttribute(characterId: string, name: string, type?: AttributeType): Promise<string | undefined>;
type SetOptions = {
    setWithWorker?: boolean;
};
declare function setAttribute(characterId: string, name: string, value: unknown, type?: AttributeType, options?: SetOptions): Promise<boolean | void | (Roll20Object<AttributeProperties> & {
    setWithWorker: (attributes: Partial<AttributeProperties>) => void;
})>;
declare function deleteAttribute(characterId: string, name: string): Promise<boolean | void>;
declare const _default: {
    getAttribute: typeof getAttribute;
    setAttribute: typeof setAttribute;
    deleteAttribute: typeof deleteAttribute;
};
export default _default;
