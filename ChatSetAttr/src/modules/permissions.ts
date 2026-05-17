import { getConfig } from "./config";

const permissions = {
  playerID: "",
  isGM: false,
  canModify: false,
};

export function checkPermissions(playerID: string) {
  const player = getObj("player", playerID);
  if (!player) {
    if('API' === playerID) {
      // allow API full access
      setPermissions(playerID,true,true);
      return;
    }
    throw new Error(`Player with ID ${playerID} not found.`);
  }
  const isGM = playerIsGM(playerID);
  const config = getConfig();
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
  if (getConfig().playersCanModify) {
    return true;
  }
  const character = getObj("character", target);
  if (!character) {
    return false;
  }
  const controlledBy = (character.get("controlledby") || "").split(",");
  return controlledBy.includes(playerID);
};
