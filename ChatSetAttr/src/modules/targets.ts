import type { Target } from "../types";
import { getConfig } from "./config";
import { checkPermissionForTarget, getPermissions } from "./permissions";

function generateSelectedTargets(message: Roll20ChatMessage, type: Target) {
  const errors: string[] = [];
  const targets: string[] = [];

  if (!message.selected) return { targets, errors };

  for (const token of message.selected) {
    const tokenObj = getObj("graphic", token._id);
    if (!tokenObj) {
      errors.push(`Selected token with ID ${token._id} not found.`);
      continue;
    }
    if (tokenObj.get("_subtype") !== "token") {
      errors.push(`Selected object with ID ${token._id} is not a token.`);
      continue;
    }

    const represents = tokenObj.get("represents");
    const character = getObj("character", represents);
    if (!character) {
      errors.push(`Token with ID ${token._id} does not represent a character.`);
      continue;
    }

    const inParty = character.get("inParty");
    if (type === "sel-noparty" && inParty) {
      continue;
    }
    if (type === "sel-party" && !inParty) {
      continue;
    }

    targets.push(character.id);
  }

  return {
    targets,
    errors,
  };
};

function generateAllTargets(type: Target) {
  const { isGM } = getPermissions();
  const errors: string[] = [];

  if (!isGM) {
    errors.push(`Only GMs can use the '${type}' target option.`);
    return {
      targets: [],
      errors,
    };
  }

  const characters = findObjs({ _type: "character" });
  if (type === "all") {
    return {
      targets: characters.map(char => char.id),
      errors,
    };
  }

  else if (type === "allgm") {
    const targets = characters.filter(char => {
      const controlledBy = char.get("controlledby");
      return !controlledBy;
    }).map(char => char.id);
    return {
      targets,
      errors,
    };
  }

  else if (type === "allplayers") {
    const targets = characters.filter(char => {
      const controlledBy = char.get("controlledby");
      return !!controlledBy;
    }).map(char => char.id);

    return {
      targets,
      errors,
    };
  }

  return {
    targets: [],
    errors: [`Unknown target type '${type}'.`],
  };
};

function generateCharacterIDTargets(values: string[]) {
  const { playerID } = getPermissions();
  const targets: string[] = [];
  const errors: string[] = [];

  for (const charID of values) {
    const character = getObj("character", charID);
    if (!character) {
      errors.push(`Character with ID ${charID} not found.`);
      continue;
    }
    const characterID = character.id;
    const hasPermission = checkPermissionForTarget(playerID, characterID);
    if (!hasPermission) {
      errors.push(`Permission error. You do not have permission to modify character with ID ${charID}.`);
      continue;
    }
    targets.push(characterID);
  }

  return {
    targets,
    errors,
  };
};

function generatePartyTargets() {
  const { isGM } = getPermissions();
  const { playersCanTargetParty } = getConfig();
  const targets: string[] = [];
  const errors: string[] = [];

  if (!isGM && !playersCanTargetParty) {
    errors.push("Only GMs can use the 'party' target option.");
    return {
      targets,
      errors,
    };
  }

  const characters = findObjs({ _type: "character", inParty: true });
  for (const character of characters) {
    const characterID = character.id;
    targets.push(characterID);
  }

  return {
    targets,
    errors,
  };
};


function generateNameTargets(values: string[]) {
  const { playerID } = getPermissions();
  const targets: string[] = [];
  const errors: string[] = [];

  for (const name of values) {
    const characters = findObjs({ _type: "character", name: name });
    if (characters.length === 0) {
      errors.push(`Character with name "${name}" not found.`);
      continue;
    }
    if (characters.length > 1) {
      errors.push(`Multiple characters found with name "${name}". Please use character ID instead.`);
      continue;
    }
    const character = characters[0];
    const characterID = character.id;
    const hasPermission = checkPermissionForTarget(playerID, characterID);
    if (!hasPermission) {
      errors.push(`Permission error. You do not have permission to modify character with name "${name}".`);
      continue;
    }
    targets.push(characterID);
  }

  return {
    targets,
    errors,
  };
};

export function generateTargets(message: Roll20ChatMessage, targetOptions: string[]) {
  const characterIDs: string[] = [];
  const errors: string[] = [];

  for (const option of targetOptions) {
    const [type, ...values] = option.split(/[, ]/).map(v => v.trim()).filter(v => v.length > 0);

    if (type === "sel" || type === "sel-noparty" || type === "sel-party") {
      const results = generateSelectedTargets(message, type);
      characterIDs.push(...results.targets);
      errors.push(...results.errors);
    }

    else if (type === "all" || type === "allgm" || type === "allplayers") {
      const results = generateAllTargets(type);
      characterIDs.push(...results.targets);
      errors.push(...results.errors);
    }

    else if (type === "charid") {
      const results = generateCharacterIDTargets(values);
      characterIDs.push(...results.targets);
      errors.push(...results.errors);
    }

    else if (type === "name") {
      const results = generateNameTargets(values);
      characterIDs.push(...results.targets);
      errors.push(...results.errors);
    }

    else if (type === "party") {
      const results = generatePartyTargets();
      characterIDs.push(...results.targets);
      errors.push(...results.errors);
    }
  }

  const targets = Array.from(new Set(characterIDs));

  return {
    targets,
    errors,
  };
};

