/**
 * ChatTurnManager v0.0.2
 *
 * Script to simplify Turn Order Management, and move it into chat.
 * Commands:
 *
 * !turns-begin / !turns-start
 * Sort the Turn Counter numerically descending, and add a turn counter to the
 * top of the order
 *
 * !turns-clear
 * Clear the turn order. NOTE: THERE IS NO CONFIRMATION.
 *
 * !turns-down <n> [--<before|after> prefix] name
 * Add an item to the list that counts down from n. By default this is added
 * to the current end of the order. If --before or --after is provided, the
 * argument is used as a prefix search for a name to put the item before or
 * after.
 *
 * !turns-up <n> [--<before|after> prefix] name
 * Add an item to the list that counts up from n. By default this is added
 * to the current end of the order. If --before or --after is provided, the
 * argument is used as a prefix search for a name to put the item before or
 * after.
 *
 * !turns-clean
 * Remove all elements with a counter of 0.
 */

var ChatTurnManager;
var ChatTurnManager =
  ChatTurnManager ||
  (() => {
    "use strict";
    const version = "0.0.2";
    const counterName = "Round Counter";

    const getTurns = () => {
      let turns = Campaign().get("turnorder");
      if (turns === "") turns = [];
      else turns = JSON.parse(turns);

      for (let i = 0; i < turns.length; i++) {
        turns[i]["pr"] = parseFloat(turns[i]["pr"]);
        if (isNaN(turns[i]["pr"])) turns[i]["pr"] = 0;
      }
      return turns;
    };

    const setTurns = (turns) => {
      Campaign().set("turnorder", JSON.stringify(turns));
    };

    const playerName = (playerID) => {
      const player = getObj("player", playerID);
      if (!player) return player;
      return player.get("_displayname");
    };

    const whisperToID = (id, msg) => {
      const name = id === "GM" ? id : playerName(id);
      if (!name) return;
      sendChat("ChatTurnManager", `/w "${name}" ${msg}`);
    };

    const itemName = (item) => {
      if (item.id === "-1") return item.custom;
      const g = getObj("graphic", item.id);
      if (!g) return null;
      const name = g.get("name");
      if (name) return name;
      const char = getObj("character", g.get("represents"));
      if (!char) return null;
      return char.get("name");
    };

    const findPrefixIndex = (turns, prefix) =>
      turns.findIndex((t) => {
        const name = itemName(t);
        if (!name) return false;
        return name.toLowerCase().startsWith(prefix);
      });

    const addWithFormula = (msg, isGM, playerID, formula) => {
      const parts = msg.split(/\s+/);
      parts.shift();
      const newItem = { id: "-1", pr: parseFloat(parts.shift()), formula };
      if (!isGM) newItem.p = true;

      let position = null;
      let search = null;
      if (parts[0].startsWith("--")) {
        position = parts.shift().substring(2);
        search = parts.shift().toLowerCase();
      }
      newItem.custom = parts.join(" ");

      let turns = getTurns();
      let i = null;

      if (search) {
        i = findPrefixIndex(turns, search);
        if (i == -1) {
          i = null;
          whisperToID(playerID, `could not find item prefix “${search}”. Putting “${newItem.custom}” at the end.`);
        } else if (position === "after") i++;
      }

      if (i !== null) turns.splice(i, 0, newItem);
      else turns.push(newItem);

      setTurns(turns);

      if (!isGM) {
        const name = playerName(playerID) || "";
        let pos = "";
        if (i !== null) pos = ` in position ${i + 1}`;
        whisperToID("GM", `Player (${name}) added turn item “${newItem.custom}${pos}”`);
      }
    };

    const handleClear = (msg, isGM, playerID) => {
      if (!isGM) {
        whisperToID(playerID, "Only the GM can clear turn data.");
        return;
      }
      const turns = Campaign().get("turnorder");
      setTurns([]);
      log(`ChatTurnManager: CLEARING: ${turns}`);
      whisperToID("GM", `Turns cleared. To restore, run <code>!turns-load ${turns}</code>`);
    };

    const handleLoad = (msg, isGM, playerID) => {
      if (!isGM) {
        whisperToID(playerID, "Only the GM can load turn data.");
        return;
      }
      Campaign().set("turnorder", msg.split(/\s+/, 2)[1]);
    };

    const handleAppend = (msg, isGM, playerID) => {
      if (!isGM) {
        whisperToID(playerID, "Only the GM can append turn data.");
        return;
      }

      try {
        const data = JSON.parse(msg.split(/\s+/, 2)[1]);
        turns = getTurns();
        setTurns(turns.concat(data));
      } catch (e) {
        whisperToID(playerID, `ERROR appending data: '${e.message}'`);
      }
    };

    const handleClean = (msg) => {
      let turns = getTurns();
      turns = _.filter(turns, (t) => t.pr <= 0);
      setTurns(turns);
    };

    const handleBegin = (msg, isGM) => {
      if (!isGM) {
        whisperToID(playerID, "Only the GM can start the counter.");
        return;
      }
      let turns = getTurns();

      turns = _.filter(turns, (t) => t.custom !== counterName);
      turns = _.sortBy(turns, (t) => -t.pr);
      turns.unshift({ id: "-1", custom: counterName, pr: 1, formula: "+1" });

      setTurns(turns);
    };

    const handleUp = (msg, isGM, playerID) => {
      addWithFormula(msg, isGM, playerID, "+1");
    };

    const handleDown = (msg, isGM, playerID) => {
      addWithFormula(msg, isGM, playerID, "-1");
    };

    const handleRemove = (msg, isGM, playerID) => {
      const parts = msg.split(/\s+/, 2);
      const prefix = parts[1];
      if (!prefix) {
        whisperToID(playerID, `missing item to remove!`);
        return;
      }

      const turns = getTurns();
      const i = findPrefixIndex(turns, prefix);
      if (i === -1) {
        whisperToID(playerID, `Cannot find prefix “${prefix}” to remove.`);
        return;
      }

      if (isGM || turns[i].p) {
        turns.splice(i, 1);
        setTurns(turns);
        return;
      }
      const name = itemName(turns[i]) || "that item";
      whisperToID(playerID, `You do not have permission to remove ${name}. Please ask the GM to do it.`);
    };

    const handlers = {
      handleClear,
      handleLoad,
      handleAppend,
      handleClean,
      handleBegin,
      handleUp,
      handleDown,
      handleRemove,
      handleStart: handleBegin,
      handleRm: handleRemove,
    };

    const handleMessage = (msg) => {
      if (msg.type != "api" || !msg.content.startsWith("!turns")) return;
      const cmd = msg.content.split(/\s+/)[0].substring(7);
      const handler = handlers[`handle${cmd.charAt(0).toUpperCase()}${cmd.slice(1)}`];
      if (handler) {
        handler(msg.content, playerIsGM(msg.playerid), msg.playerid);
        return;
      }
      log(`ChatTurnManager: unknown cmd: ${cmd}`);
      whisperToID(playerID, `Unknown command: ${cmd}`);
    };

    const registerHandlers = () => {
      on("chat:message", handleMessage);
    };

    const notifyStart = () => {
      log(`ChatTurnManager ${version} Loading.`);
    };

    return {
      notifyStart: notifyStart,
      registerHandlers: registerHandlers,
    };
  })();

on("ready", () => {
  "use strict";
  ChatTurnManager.notifyStart();
  ChatTurnManager.registerHandlers();
});
