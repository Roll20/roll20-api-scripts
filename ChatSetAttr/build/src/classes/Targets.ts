import { filterByPermission } from "../utils/filterByPermission";
import type { ErrorResponse } from "./APIWrapper";

export type TargetStrategies = "all" | "allgm" | "allplayers" | "name" | "charid" | "sel";

export interface TargetIdentifier {
  name: string;
  description: string;

  parse: (
    targets: string[],
    playerID: string,
  ) => [Roll20Character[], ErrorResponse];
};

export class TargetAllCharacters implements TargetIdentifier {
  public name = "all";
  public description = "All characters in the game.";

  public parse(
    targets: string[],
    playerID: string,
  ): [Roll20Character[], ErrorResponse] {
    const errors: string[] = [];
    const messages: string[] = [];

    const canUseAll = playerIsGM(playerID);
    if (!canUseAll) {
      errors.push("You do not have permission to use the 'all' target.");
      return [[], { messages, errors }];
    }

    if (targets.length > 0) {
      errors.push("The 'all' target does not accept any targets.");
      return [[], { messages, errors }];
    }

    const allCharacters = findObjs({
      _type: "character",
    });

    return [allCharacters, { messages, errors }];
  };
};

export class TargetAllPlayerCharacters implements TargetIdentifier {
  public name = "allplayers";
  public description = "All characters controlled by players.";
  public parse(
    targets: string[],
    playerID: string,
  ): [Roll20Character[], ErrorResponse] {
    const errors: string[] = [];
    const messages: string[] = [];

    const canUseAll = playerIsGM(playerID) || state.ChatSetAttr.playersCanModify;
    if (!canUseAll) {
      errors.push("You do not have permission to use the 'allplayers' target.");
      return [[], { messages, errors }];
    }

    if (targets.length > 0) {
      errors.push("The 'allplayers' target does not accept any targets.");
      return [[], { messages, errors }];
    }

    const allPlayerCharacters = findObjs<"character">({
      _type: "character",
    })
    .filter(character => {
      const controlledBy = character.get("controlledby");
      return controlledBy && controlledBy !== "" && controlledBy !== "all";
    });

    return [allPlayerCharacters, { messages, errors }];
  };
};

export class TargetAllGMCharacters implements TargetIdentifier {
  public name = "allgm";
  public description = "All characters not controlled by any player.";

  public parse(
    targets: string[],
    playerID: string,
  ): [Roll20Character[], ErrorResponse] {
    const errors: string[] = [];
    const messages: string[] = [];

    const canUseAll = playerIsGM(playerID) || state.ChatSetAttr.playersCanModify;
    if (!canUseAll) {
      errors.push("You do not have permission to use the 'allgm' target.");
      return [[], { messages, errors }];
    }

    if (targets.length > 0) {
      errors.push("The 'allgm' target does not accept any targets.");
      return [[], { messages, errors }];
    }

    const allGmCharacters = findObjs<"character">({
      _type: "character",
    })
    .filter(character => {
      const controlledBy = character.get("controlledby");
      return controlledBy === "" || controlledBy === "all";
    });

    return [allGmCharacters, { messages, errors }];
  };
};

export class TargetByName implements TargetIdentifier {
  public name = "name";
  public description = "Target specific character names.";
  public parse(
    targets: string[],
    playerID: string,
  ): [Roll20Character[], ErrorResponse] {
    const errors: string[] = [];
    const messages: string[] = [];

    if (targets.length === 0) {
      errors.push("The 'name' target requires at least one target.");
      return [[], { messages, errors }];
    }

    const targetsByName: Roll20Character[] = targets.map(target => {
      const character = findObjs({
        _type: "character",
        name: target,
      })[0];
      if (!character) {
        errors.push(`Character with name ${target} does not exist.`);
        return null;
      }
      return character;
    }).filter(target => target !== null);

    const [validTargets, response] = filterByPermission(playerID, targetsByName);
    messages.push(...response.messages ?? []);
    errors.push(...response.errors ?? []);

    return [validTargets, { messages, errors }];
  };
};

export class TargetByID implements TargetIdentifier {
  public name = "id";
  public description = "Target specific character IDs.";
  public parse(
    targets: string[],
    playerID: string,
  ): [Roll20Character[], ErrorResponse] {
    const errors: string[] = [];
    const messages: string[] = [];

    if (targets.length === 0) {
      errors.push("The 'id' target requires at least one target.");
      return [[], { messages, errors }];
    }

    const targetsByID: Roll20Character[] = targets.map(target => {
      const character = getObj("character", target);
      if (!character) {
        errors.push(`Character with ID ${target} does not exist.`);
        return null;
      }
      return character;
    }).filter(target => target !== null);

    const [validTargets, response] = filterByPermission(playerID, targetsByID);
    messages.push(...response.messages ?? []);
    errors.push(...response.errors ?? []);

    if (validTargets.length === 0 && targets.length > 0) {
      errors.push("No valid targets found with the provided IDs.");
    }

    return [validTargets, { messages, errors }];
  }
};

export class TargetBySelection implements TargetIdentifier {
  public name = "target";
  public description = "Target characters by selected tokens.";

  public parse(
    targets: string[],
    playerID: string,
  ): [Roll20Character[], ErrorResponse] {
    const errors: string[] = [];
    const messages: string[] = [];

    if (targets.length === 0) {
      errors.push("The 'target' target requires at least one target.");
      return [[], { messages, errors }];
    }

    const targetsFromSelection: Roll20Character[] = targets.map(target => {
      const graphic = getObj("graphic", target);
      if (!graphic) {
        errors.push(`Token with ID ${target} does not exist.`);
        return null;
      }
      const represents = graphic.get("represents");
      if (!represents) {
        errors.push(`Token with ID ${target} does not represent a character.`);
        return null;
      }
      const character = getObj("character", represents);
      if (!character) {
        errors.push(`Character with ID ${represents} does not exist.`);
        return null;
      }
      return character;
    }).filter(target => target !== null);

    const [validTargets, permissionResponse] = filterByPermission(playerID, targetsFromSelection);
    messages.push(...permissionResponse.messages ?? []);
    errors.push(...permissionResponse.errors ?? []);

    return [validTargets, { messages, errors }];
  };
};
