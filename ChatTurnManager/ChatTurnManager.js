/**
 * ChatTurnManager v0.0.1
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
    const version = "0.0.1";
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

    const handleClear = (msg, isGM) => {
      if (!isGM) return;
      const turns = Campaign().get("turnorder");
      setTurns([]);
      log(`ChatTurnManager: CLEARING: ${turns}`)
      sendChat('ChatTurnManager', `/w GM Turns cleared. To restore, run <code>!turns-load ${turns}</code>`)
    };

    const handleLoad = (msg, isGM) => {
      if (!isGM) return;
      Campaign().set("turnorder", msg.split(/\s+/, 2)[1]);
    }

    const handleClean = (msg) => {
      let turns = getTurns();
      turns = _.filter(turns, (t) => t.pr <= 0);
      setTurns(turns);
    };

    const handleBegin = (msg, isGM) => {
      if (!isGM) return;
      let turns = getTurns();

      turns = _.filter(turns, (t) => t.custom !== counterName);
      turns = _.sortBy(turns, (t) => -t.pr);
      turns.unshift({ id: "-1", custom: counterName, pr: 1, formula: "+1" });

      setTurns(turns);
    };

    const matchName = (search, name) => {
      return name && name.toLowerCase().startsWith(search);
    };

    const addWithFormula = (msg, formula) => {
      const parts = msg.split(/\s+/);
      parts.shift();
      const newItem = { id: "-1", pr: parseFloat(parts.shift()), formula };
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
        i = turns.findIndex((t) => {
          if (t.id === "-1") return matchName(search, t.custom);
          const g = getObj("graphic", t.id);
          if (!g) return false;
          let name = g.get("name");
          if (name) return matchName(search, name);
          else {
            const char = getObj("character", g.get("represents"));
            if (!char) return false;
            return matchName(search, char.get("name"));
          }
        });
        if (i == -1) i = null;
        else if (position === "after") i++;
      }

      if (i !== null) turns.splice(i, 0, newItem);
      else turns.push(newItem);

      setTurns(turns);
    };

    const handleUp = (msg) => {
      addWithFormula(msg, "+1");
    };

    const handleDown = (msg) => {
      addWithFormula(msg, "-1");
    };

    const handlers = {
      handleClear,
      handleLoad,
      handleClean,
      handleBegin,
      handleUp,
      handleDown,
      handleStart: handleBegin,
    };

    const handleMessage = (msg) => {
      if (msg.type != "api" || !msg.content.startsWith("!turns")) return;
      const cmd = msg.content.split(/\s+/)[0].substring(7);
      const handler = handlers[`handle${cmd.charAt(0).toUpperCase()}${cmd.slice(1)}`];
      if (handler) handler(msg.content, playerIsGM(msg.playerid));
      else log(`ChatTurnManager: unknown cmd: ${cmd}`);
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
