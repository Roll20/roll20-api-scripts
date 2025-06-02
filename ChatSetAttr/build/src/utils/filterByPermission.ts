import type { ErrorResponse } from "../classes/ErrorManager";

export function filterByPermission(
  playerID: string,
  characters: Roll20Character[],
): [Roll20Character[], ErrorResponse] {
  const errors: string[] = [];
  const messages: string[] = [];
  const validTargets: Roll20Character[] = [];

  for (const character of characters) {
    const isGM = playerIsGM(playerID);
    const ownedBy = character.get("controlledby");
    const ownedByArray = ownedBy.split(",").map((id) => id.trim());
    const isOwner = ownedByArray.includes(playerID);
    const hasPermission = isOwner || isGM;
    if (!hasPermission) {
      continue;
    }
    validTargets.push(character);
  }

  return [validTargets, { messages, errors }];
};