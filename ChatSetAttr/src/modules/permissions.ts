const permissions = {
  playerID: "",
  isGM: false,
  canModify: false,
};

export function checkPermissions(playerID: string) {
  const player = getObj("player", playerID);
  if (!player) {
    throw new Error(`Player with ID ${playerID} not found.`);
  }
  const isGM = playerIsGM(playerID);
  const config = state.ChatSetAttr?.config || {};
  const playersCanModify = config.playersCanModify || false;
  const canModify = isGM || playersCanModify;

  setPermissions(playerID, isGM, canModify);
};

export function setPermissions(playerID: string, isGM: boolean, canModify: boolean) {
  permissions.playerID = playerID;
  permissions.isGM = isGM;
  permissions.canModify = canModify;
};

export function getPermissions() {
  return { ...permissions };
};

export function checkPermissionForTarget(playerID: string, target: string): boolean {
  const player = getObj("player", playerID);
  if (!player) {
    return false;
  }
  const isGM = playerIsGM(playerID);
  if (isGM) {
    return true;
  }
  const character = getObj("character", target);
  if (!character) {
    return false;
  }
  const controlledBy = (character.get("controlledby") || "").split(",");
  return controlledBy.includes(playerID);
};