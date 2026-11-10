import { getConfig } from "./config";

const permissions = {
  playerID: "",
  isGM: false,
  canModify: false,
};

export function checkPermissions(playerID: string): boolean {
  const player = getObj("player", playerID);
  if (!player) {
    if("API" === playerID) {
      // allow API full access
      setPermissions(playerID,true,true);
      return true;
    }
    log(`Player with ID ${playerID} not found.`);
    return false;
  }
  const isGM = playerIsGM(playerID);
  const config = getConfig();
  const playersCanModify = config.playersCanModify || false;
  const canModify = isGM || playersCanModify;

  setPermissions(playerID, isGM, canModify);
  return true;
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
  const isAPI = "API" == playerID;
  if (isAPI) {
    return true;
  }
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
