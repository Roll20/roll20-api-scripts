/**
 * COGCrew v1.00
 * Last update : 2023-07-16
 * How to use :
 * - Install the script
 * - Open a starship or mecha sheet
 * - Check the "Utiliser COGCrew" box in the Configuration tab
 * - ... And play :-)
 * Whenever you open a starchip or mecha sheet, the script updates the crew bonuses
 */

var COGCrew =
COGCrew ||
  (function () {
    
    const stateKey = "COGCrew";
    const modName = `Mod:${stateKey}`;
    const modVersion = "1.00";
    const modCmd = `!${stateKey.toLowerCase()}`;

    const gmOnly = "/w gm ";

    /**
     * Parse string and return integer value
     * @param {string} value string to parse
     * @param {int} onError default value
     * @returns integer or default value
     */
    function int(value, onError = 0) {
      return parseInt(value) || onError;
    }
    
    /**
     * Parse string and return float value
     * @param {string} value string to parse
     * @param {float} onError default value
     * @returns float or default value
     */
    function float(value, onError = 0) {
      return parseFloat(value) || onError;
    }

    /**
     * Return string or default/empty if falsey
     * @param {string} value string valie
     * @param {string} onError default value
     * @returns string or default value
     */
    function stringOrDefault(value, onError = '') {
      return value || onError;
    }

    /**
     * Log a message to the debug console
     * @param {string} msg
     * @param {boolean} force
     */
    function sendLog(msg, force = true) {
      if (state[stateKey].logging || force) {
        if (typeof(msg) !== 'object') {
          log(`${modName} | ${msg}`);
        } else {
          for (const [prop, value] of Object.entries(msg)) {
            log(`${modName} | ${prop} = ${value}`);
          }
        }
      }
    }

    /**
     * Return a date-time ISO string
     * @returns string
     */
    function dateTimeStamp() {
      const dt = new Date(Date.now()).toISOString();
      return dt.split("T")[0] + " @ " + dt.split("T")[1].split(".")[0];
    }

    /**
     * Find an attribute object
     * @param {object} props Properties of the attribute to find
     * @returns {object[]}
     */
    function findAttribute(props) {
      return findObjs({
        _type: "attribute",
        ...props,
      });
    }

    /**
     * Find a single attribute for properties
     * @param {object} props Properties of the attribute to find
     * @returns
     */
    function findSingleAttribute(props) {
      return findAttribute(props)[0] || null;
    }

    /**
     * Find an attribute object or create it
     * @param {object} props Properties of the attribute to find or create
     */
    function findOrNewAttribute(props) {
      const exist = findAttribute(props);
      let attributeObj;
      if (exist.length === 0) {
        attributeObj = createObj("attribute", props);
      } else {
        attributeObj = exist[0];
      }
      return attributeObj;
    }

    /**
     * Update the starship attributes for crew abilities
     * @param {object} params update settings
     */
    function updateShipCrew(params) {
      let msg = "";
      const weapon = params.armesV !== undefined ? "_$" + params.armesV.toString() : "";
      // get the attribute object for the crew name
      const crewName = findOrNewAttribute({
        _characterid: params.shipId,
        name: params.nameAttr,
      }).get("current");
      if ((crewName || "") === "") {
        msg = `No crew assigned to '${params.nameAttr.split("_")[1] + weapon}'`;
        sendLog(msg, false);
        gmNotes += msg + "<br>";
        return;
      }
      // search for the corresponding character object
      const crewChar = findObjs({
        _type: "character",
        name: crewName,
      });
      if (crewChar.length == 0) {
        msg = `Cannot find character for '${
          params.nameAttr.split("_")[1] + weapon
        }:${crewName}'`;
        sendLog(msg, false);
        gmNotes += msg + "<br>";
        return;
      }
      const crewCharId = crewChar[0].get("_id");
      // get the caracteristic attribute object for ship
      const shipCarac = findOrNewAttribute({
        _characterid: params.shipId,
        name: params.caracAttr.ship,
      });
      // get the crew characteristic object
      let crewCarac = findOrNewAttribute({
        _characterid: crewCharId,
        name: params.caracAttr.crew,
      }).get("current");
      // check 'debrouillardise' ability
      const crewJSONAttributes = findSingleAttribute({
        _characterid: crewCharId,
        name: "CARACS",
      }).get("current");
      let jackOfAllTrades = false;
      if (crewJSONAttributes) {
        const crewAttributes = JSON.parse(crewJSONAttributes);
        if (crewAttributes.voies.length > 0) {
          crewAttributes.voies.forEach((pathName, index) => {
            pathName = pathName
              .replace("è", "e")
              .replace("È", "E")
              .replace(" ", "")
              .toLowerCase();
            if (pathName === "systemed" || pathName === "systeme-d") {
              if ((crewAttributes.rangs[index] || 0) > 0) {
                if (crewCarac > 0) jackOfAllTrades = true;
              }
            }
          });
        }
      }
      // set the ship value to the crew value
      shipCarac.set("current", crewCarac);
      msg = `Set ${params.nameAttr.split("_")[1] + weapon} to ${crewName} ${
        params.caracAttr.crew
      } = '${crewCarac}'`;
      sendLog(msg, false);
      gmNotes += msg + "<br>";
      // get the bonus attribute object for ship
      const shipBonus = findOrNewAttribute({
        _characterid: params.shipId,
        name: params.bonusAttr.ship,
      });
      // get the crew ability paths
      const attrPath = findObjs({
        _type: "attribute",
        _characterid: crewCharId,
      })
        .filter(
          (attrObj) =>
            attrObj.get("name").startsWith("voie") &&
            attrObj.get("name").endsWith("nom")
        )
        .filter(
          (attrObj) =>
            attrObj
              .get("current")
              .toLowerCase()
              .indexOf(params.bonusAttr.crew) != -1
        )[0];
      if (attrPath === undefined) {
        msg = `Cannot find ability branch for ${crewName} '${params.bonusAttr.crew}'`;
        sendLog(msg, false);
        gmNotes += msg + "<br>";
        if (jackOfAllTrades) {
          msg = `Set ${shipCarac.get(
            "name"
          )} to '0' due to ${crewName} jack-of-all-trades`;
          sendLog(msg,false);
          gmNotes += msg + "<br>";
          shipCarac.set("current", "0");
        }
        return;
      }
      const pathNr = attrPath.get("name").substring(4, 5);
      // get the crew rank attribute
      const rankAttr = findObjs({
        _type: "attribute",
        _characterid: crewCharId,
        name: `RANG_VOIE${pathNr}`,
      })[0];
      if (rankAttr === undefined) {
        msg = `Cannot find rank for ${crewName} '${params.bonusAttr.crew}'`;
        sendLog(msg, false);
        gmNotes += msg + "<br>";
        return;
      }
      // set the ship value to the crew value
      shipBonus.set("current", rankAttr.get("current"));
      msg = `Set ${params.nameAttr.split("_")[1] + weapon} to ${crewName} ${
        params.bonusAttr.crew
      } bonus = '${rankAttr.get("current")}'`;
      sendLog(msg, false);
      gmNotes += msg + "<br>";
    }

    /**
     * Update mecha attributes for crew abilities
     * @param {object} params update settings
     */
    function updateMechaCrew(params) {
      let mechaCar = params.carAttr;
      if (mechaCar !== "int") {
        const mechaCarObj = findObjs({
          _type: "attribute",
          _characterid: params.shipId,
          _name: params.carAttr,
        })[0];
        if (mechaCarObj === undefined) {
          return;
        }
        mechaCar = mechaCarObj.get("current");
      }
      const crewAttr = {
        dex: { caracAttr: "FOR_TEST", bonusAttr: "pilotage" },
        int: { caracAttr: "PER_TEST", bonusAttr: "armes lourdes" },
        per: { caracAttr: "INT_TEST", bonusAttr: "electronique" },
        cha: { caracAttr: "INT_TEST", bonusAttr: "moteurs" },
      };
      params.caracAttr.crew = crewAttr[mechaCar].caracAttr;
      params.bonusAttr.crew = crewAttr[mechaCar].bonusAttr;
      updateShipCrew(params);
    }

    /**
     * Update ship attributes for all stations
     * @param {string} shipId Character id for ship sheet
     */
    function updateShipCrewValues(shipId) {
      gmNotes = "";
      updateShipCrew({
        shipId: shipId,
        nameAttr: "POSTE_PIL_NOM",
        caracAttr: { ship: "POSTE_PIL_DEX", crew: "DEX_TEST" },
        bonusAttr: { ship: "POSTE_PIL_BONUS", crew: "pilotage" },
      });
      updateShipCrew({
        shipId: shipId,
        nameAttr: "POSTE_MOT_NOM",
        caracAttr: { ship: "POSTE_MOT_INT", crew: "INT_TEST" },
        bonusAttr: { ship: "POSTE_MOT_BONUS", crew: "moteurs" },
      });
      updateShipCrew({
        shipId: shipId,
        nameAttr: "POSTE_SEN_NOM",
        caracAttr: { ship: "POSTE_SEN_INT", crew: "INT_TEST" },
        bonusAttr: { ship: "POSTE_SEN_BONUS", crew: "electronique" },
      });
      updateShipCrew({
        shipId: shipId,
        nameAttr: "POSTE_ORD_NOM",
        caracAttr: { ship: "POSTE_ORD_INT", crew: "INT_TEST" },
        bonusAttr: { ship: "POSTE_ORD_BONUS", crew: "electronique" },
      });
      const attks = findObjs({
        _type: "attribute",
        _characterid: shipId,
      }).filter((attrObj) =>
        attrObj.get("name").startsWith("repeating_armesv")
      );
      const attkIds = [];
      for (const attk of attks) {
        const attkId = attk.get("name").split("_")[2];
        if (attkIds.indexOf(attkId) === -1) attkIds.push(attkId);
      }
      attkIds.forEach((attkId, index) => {
        updateShipCrew({
          shipId: shipId,
          nameAttr: `repeating_armesv_${attkId}_armecan_nom`,
          armesV: index,
          caracAttr: {
            ship: `repeating_armesv_${attkId}_armecan_dex`,
            crew: "DEX_TEST",
          },
          bonusAttr: {
            ship: `repeating_armesv_${attkId}_armecan_bonus`,
            crew: "armes lourdes",
          },
        });
      });
      if (gmNotes !== "") {
        const shipSheetObj = findObjs({
          _type: "character",
          _id: shipId,
        })[0];
        let shipName = "";
        if (shipSheetObj) {
          shipName = shipSheetObj.get("name");
          shipSheetObj.set(
            "gmnotes",
            gmNotes + "<hr>Updated on : " + dateTimeStamp()
          );
        }
      }
    }

    /**
     * Update mecha attributes for all pilots
     * @param {string} mechId Character id for mecha sheet
     */
    function updateMechaCrewValues(mechId) {
      gmNotes = "";
      updateMechaCrew({
        shipId: mechId,
        nameAttr: "mec_crew1_name",
        carAttr: "mec_crew1_car",
        caracAttr: { ship: "mec_crew1_bonus" },
        bonusAttr: { ship: "mec_crew1_rank" },
      });
      updateMechaCrew({
        shipId: mechId,
        nameAttr: "mec_crew2_name",
        carAttr: "mec_crew2_car",
        caracAttr: { ship: "mec_crew2_bonus" },
        bonusAttr: { ship: "mec_crew2_rank" },
      });
      const attks = findObjs({
        _type: "attribute",
        _characterid: mechId,
      }).filter((attrObj) =>
        attrObj.get("name").startsWith("repeating_mecatk")
      );
      const attkIds = [];
      for (const attk of attks) {
        const attkId = attk.get("name").split("_")[2];
        if (attkIds.indexOf(attkId) === -1) attkIds.push(attkId);
      }
      attkIds.forEach((attkId) => {
        updateMechaCrew({
          shipId: mechId,
          nameAttr: `repeating_mecatk_${attkId}_atkcrew`,
          carAttr: "int",
          caracAttr: { ship: `repeating_mecatk_${attkId}_crewint_bonus` },
          bonusAttr: { ship: `repeating_mecatk_${attkId}_crewint_rank` },
        });
      });
      if (gmNotes !== "") {
        const mechaSheetObj = findObjs({
          _type: "character",
          _id: shipId,
        })[0];
        let mechaName = "";
        if (mechaSheetObj) {
          mechaName = shipSheetObj.get("name");
          mechaSheetObj.set(
            "gmnotes",
            gmNotes + "<hr>Updated on : " + dateTimeStamp()
          );
        }
      }
    }

    /**
     * Update crew values for sheet type
     * @param {string} vehicleType Vehicle's sheet type
     * @param {string} vehicleId Vehicle's character id 
     */
    function updateCrewValues(vehicleType, vehicleId) {
      switch (vehicleType) {
        case "vaisseau":
          updateShipCrewValues(vehicleId);
          break;
        case "mecha":
          updateMechaCrewValues(vehicleId);
          break;
      }
    }    

    function migrateState() {

      // code here any changes to the state schema

      state[stateKey].version = modVersion;
    }

    const defaultState = {
      version: modVersion,
    };

    function checkInstall() {
      
      if (!state[stateKey]) state[stateKey] = defaultState;

      if (state[stateKey].version !== modVersion) {
        migrateState();
      }

      sendLog(state[stateKey], true);
    }

    function registerEventHandlers() {

      /**
       * Wire-up event for attribute value change
       */
      on("change:attribute", function (obj) {
        if (obj.get("name").toLowerCase() !== "postes_eq") return;
        // if attr_postes_eq has changed...
        const update = obj.get("current").split(":");
        if ((update[0] || "") !== "update") return;
        obj.set("current", "");
        // if the starship or mecha sheet has been opened, update the crew values...
        const vehicleId = obj.get("_characterid");
        updateCrewValues(update[1], vehicleId);
      });

    }
    
    return {
      name: modName,
      version: modVersion,
      checkInstall,
      registerEventHandlers,
    };

  })();

/**
 * Runs when game/campaign loaded and ready
 */
on('ready', function () {

  COGCrew.checkInstall();

  COGCrew.registerEventHandlers();

  log(`${COGCrew.name} version ${COGCrew.version} loaded`);

});
