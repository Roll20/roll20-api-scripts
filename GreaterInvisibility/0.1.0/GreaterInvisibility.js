on("ready", () => {
  "use strict";

  const addTokenMacro = () => {
    let macro = findObjs({
      _type: "macro",
      name: "ToggleInvisibility"
    });

    if (!macro.length) {
      let players = findObjs({
        _type: 'player'
      });
      let gms = _.filter(players, player => {
        return playerIsGM(player.get('_id'));
      });

      _.each(gms, gm => {
        createObj('macro', {
          _playerid: gm.get('_id'),
          name: "ToggleInvisibility",
          action: "!gi --toggle",
          visibleto: "all",
          istokenaction: true
        });
      });
    }
  };
  
  const setConfig = (command) => {
    const args = command.split("|");
    if (args.length > 1) {
      state.GREATERINVISIBILITY.config.invisibleTokenUrl = args[1];
    } else {
      sendChat("GreaterInvisibility", "/w gm [Add Invisible Token URL](!gi --config|?{Invisible Token Url})");
    }
  };

  const addInvisibility = (obj) => {
    if (!state.GREATERINVISIBILITY.config.invisibleTokenUrl) {
      setConfig("config");
    } else if (["objects", "gmlayer"].includes(obj.get("layer"))) {
      let sides = obj.get("sides");

      if (!sides.length) {
        let img = getCleanImgsrc(decodeURIComponent(obj.get("imgsrc")));
        log("Converting " + obj.get("id") + " to rollable token");
        obj.set("sides", img);
        obj.set("currentSide", 0);
      }

      if (!sides.includes(state.GREATERINVISIBILITY.config.invisibleTokenUrl)) {
        log("Adding invisibility to " + obj.get("id"));
        obj.set("sides", state.GREATERINVISIBILITY.config.invisibleTokenUrl + "|" + obj.get("sides"));
        obj.set("currentSide", obj.get("currentSide") + 1);
      }

      // Aura 2 will be used when invisible to know where token is
      obj.set("playersedit_aura2", true);
      obj.set("showplayers_aura2", false);
      obj.set("aura2_radius", 0);
      obj.set("aura2_color", "#666666");
      obj.set("aura2_square", false);
    }
  }

  const getCleanImgsrc = (imgsrc) => {
    let parts = imgsrc.match(/(.*\/(?:images|marketplace)\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
    if (parts) {
      return parts[1] + 'thumb' + parts[3] + (parts[4] ? parts[4] : `?${Math.round(Math.random() * 9999999)}`);
    }
    return;
  };

  const setTokenInvisibilityState = (token, newValue) => {
    if (token.get("imgsrc").includes("/marketplace/")) {
        sendChat("GreaterInvisibility", " GreaterInvisibility does not support tokens with an image outside the user's library.  The Token for " + token.get("name") + " cannot be toggled.  Please manual update using side selector");
    
        return;
    }
    let sides = token.get("sides").split(/\|/).map(decodeURIComponent).map(getCleanImgsrc);
    token.set("currentSide", newValue);
    token.set("imgsrc", sides[newValue]);
    const messageAction = newValue === 0 ? " has disappeared!" : " has appeared!"
    const messagePrefix = token.get("layer") === "gmlayer" ? "/w gm " : "";
    sendChat("GreaterInvisibility", messagePrefix + token.get("name") + messageAction);
  };

  const toggleInvisibility = (_command, objs, newValue) => {
    if (!objs || !objs.length) {
      sendChat("GreaterInvisibility", "No tokens selected.");
    } else {
      for (let obj of objs) {
        let token = getObj(obj._type, obj._id);
        if (newValue !== undefined) {
          if(token.get("currentSide") !== newValue) {
            setTokenInvisibilityState(token, newValue);
          }
        } else if (token.get("currentSide") === 0) {
          setTokenInvisibilityState(token, 1);
        } else {
          setTokenInvisibilityState(token, 0);
        }
      }
    }
  };

  const help = () => {
    const msg = "/w gm Greater Invisibility commands:<br>" +
      "--appear: make all selected tokens appear<br>" +
      "--disappear: make all selected tokens turn invisible<br>" +
      "--toggle: toggle invisibility of all selected tokens<br>" +
      "--config: configure invisible token image";
    sendChat("GreaterInvisibility", msg);
  };
  

  if (!state.GREATERINVISIBILITY) {
    state.GREATERINVISIBILITY = {
      version: "0.1.0",
      config: {
        invisibleTokenUrl: ''
      }
    };
  }
  log("Casting Greater Invisiblity at level " + state.GREATERINVISIBILITY.version + "...");
  
  if (state.GREATERINVISIBILITY.config.invisibleTokenUrl.trim() === "") {
      setConfig("config");
  }

  const ACTIONS = {
    "appear": (_command, objs) => toggleInvisibility(_command, objs, 1),
    "disappear": (_command, objs) => toggleInvisibility(_command, objs, 0),
    "toggle": toggleInvisibility,
    "config": setConfig,
    "help": help
  }

  addTokenMacro();

  on("add:token", addInvisibility);

  on("change:token:layer", addInvisibility);

  on("chat:message", (msg) => {
    if (msg.type === "api" && msg.content.startsWith('!gi')) {
        let commands = msg.content.split(" --");
        commands.shift();
        for (let command of commands) {
            for (let action in ACTIONS){
                if (command.startsWith(action)) {
                    ACTIONS[action](command, msg.selected);
                }
            }
        }
    }
  });
});
