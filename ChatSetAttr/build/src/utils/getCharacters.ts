export function getCharactersByName(
  characterNames: string[],
): Roll20Character[] {
  return findObjs({
    _type: "character",
  })
  .filter(character => characterNames.includes(character.get("name")));
};

export function getCharactersByIds(
  characterIds: string[],
): Roll20Character[] {
  return findObjs({
    _type: "character",
  })
  .filter(character => characterIds.includes(character.id));
};