type AttributeType = "current" | "max";
declare function getAttribute(characterId: string, name: string, type?: AttributeType): Promise<string | undefined>;
declare function setAttribute(characterId: string, name: string, value: unknown, type?: AttributeType): Promise<boolean | (Roll20Object<AttributeProperties> & {
    setWithWorker: (attributes: Partial<AttributeProperties>) => void;
})>;
declare const _default: {
    getAttribute: typeof getAttribute;
    setAttribute: typeof setAttribute;
};
export default _default;
