/*
=========================================================
Name:           ImportHS6e
GitHub:         https://github.com/eepjr24/ImportHS6e
Roll20 Contact: eepjr24
Version:        1.01
Last Update:    8/4/2021
=========================================================
Updates:
Fixed JSON parsing error for unicode characters reserved for UTF-16 surrogate pairs

*/
var API_Meta = API_Meta || {};
API_Meta.ImportHS6e = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
try { throw new Error(''); } catch (e) { API_Meta.ImportHS6e.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (16)); }
}

// TODO Deal with MP
// TODO create reserves
  const ImportHS6e = (() => {

  let version = '1.01',
  lastUpdate  = 1628114013101,
  debug_log   = 0,                                                             // Debug settings, all debug values 1=on
  logObjs     = 0,                                                             // Output character object to api log
  comp_log    = 0,                                                             // Debug complications
  cskl_log    = 0,                                                             // Debug combat skill Levels
  move_log    = 0,                                                             // Debug movement debug
  perk_log    = 0,                                                             // Debug perks
  pnsk_log    = 0,                                                             // Debug penalty skill levels
  powr_log    = 0,                                                             // Debug powers
  remv_log    = 0,                                                             // Debug attribute removal
  resv_log    = 0,                                                             // Debug reserves
  skil_log    = 0,                                                             // Debug skills
  sklv_log    = 0,                                                             // Debug skill levels
  stat_log    = 0,                                                             // Debug characteristics
  taln_log    = 0,                                                             // Debug talents
  comp_rem    = 1,                                                             // Complications removal flag, all removal flags 1=remove
  cskl_rem    = 1,                                                             // Combat skill levels removal flag
  powr_rem    = 1,                                                             // Powers removal flag
  perk_rem    = 1,                                                             // Debug removal flag
  pskl_rem    = 1,                                                             // Penalty skill level removal flag
  resv_rem    = 1,                                                             // Reserves removal flag
  skil_rem    = 1,                                                             // Skills removal flag
  sklv_rem    = 1,                                                             // Skill levels removal flag
  stat_rem    = 1,                                                             // Characteristics removal flag
  taln_rem    = 1,                                                             // Talents removal flag
  move_rem    = 1;                                                             // Movement removal flag

  const checkInstall= () => {                                                  // Display version information on startup.
    var updated = new Date(lastUpdate);
    log('\u0EC2\u2118 [ImportHS6e v'+version+', ' + updated.getFullYear() + "/" + (updated.getMonth()+1) + "/" + updated.getDate() + "]");
  };

  const showImportHelp = (who) => {                                            // Show the help for the tool. Needs work.
    if (who){ who = "/w " + who.split(" ", 1)[0] + " "; }
      sendChat('Hero System 6e Character Importer', who + ' ' );
  };

  const logDebug = (logval) => {                                               // Conditional log function, logs if debug flag is found
    if(debug_log!=0) {log(logval);}
  };

  const removeExistingAttributes = (alst) => {                                 // Remove existing attributes from roll20 character sheet
  for (var c=0; c < alst.length; c++)                                          // Loop character sheet atribute list
  {
    let attr = alst[c].get("name"),                                            // Get attribute name
    attrtype = attr.split("_");
    if (!(/^repeating_/.test(attr))){continue;}                                // Only remove repeating elements
      switch (attrtype[1])                                                     // Create the complication description based on the type
      {
      case "complications":
        if(!comp_rem){break;}
          alst[c].remove();                                                    // Remove them
        if (remv_log){logDebug(attr);}                                         // Debug removal
        break;
      case "combatskills":
        if(!cskl_rem){break;}
        alst[c].remove();                                                      // Remove them
        if (remv_log){logDebug(attr);}                                         // Debug removal
        break;
      case "penaltyskills":
        if(!pskl_rem){break;}
        alst[c].remove();                                                      // Remove them
        if (remv_log){logDebug(attr);}                                         // Debug removal
        break;
      case "perks":
        if(!perk_rem){break;}
        alst[c].remove();                                                      // Remove them
        if (remv_log){logDebug(attr);}                                         // Debug removal
        break;
      case "powers":
        if(!powr_rem){break;}
        alst[c].remove();                                                      // Remove them
        if (remv_log){logDebug(attr);}                                         // Debug removal
        break;
      case "skilllevels":
        if(!sklv_rem){break;}
        alst[c].remove();                                                      // Remove them
        if (remv_log){logDebug(attr);}                                         // Debug removal
        break;
      case "skills":
        if(!skil_rem){break;}
        alst[c].remove();                                                      // Remove them
        if (remv_log){logDebug(attr);}                                         // Debug removal
        break;
      case "talents":
        if(!taln_rem){break;}
        alst[c].remove();                                                      // Remove them
        if (remv_log){logDebug(attr);}                                         // Debug removal
        break;
      case "reserves":
        if(!resv_rem){break;}
        alst[c].remove();                                                      // Remove them
        if (remv_log){logDebug(attr);}                                         // Debug removal
        break;
      case "moves":
        if(!move_rem){break;}
        alst[c].remove();                                                      // Remove them
        if (remv_log){logDebug(attr);}                                         // Debug removal
        break;
      default:
        sendChat("i6e_API", "Unhandled repeating element removal: (" + attrtype[1] + ") " + attr);
        break;
      }
    }
  };

  const createOrSetAttr = (atnm, val, cid) => {                                // Set an individual attribute if it exists, otherwise create it.
    var objToSet = findObjs({type: 'attribute', characterid: cid, name: atnm})[0]
    if(val===undefined)
    {
      sendChat("i6e_API", "Undefined value in set attribute: " + atnm);
      return;
    }
    if(typeof objToSet === "number" && IsNaN(val))
    {
      sendChat("i6e_API", "Type mismatch (numeric expected) in set attribute: " + atnm);
      return;
    }
    if(objToSet===undefined)                                                   // If attribute does not exist, create otherwise set current value.
    {
      return createObj('attribute', {name: atnm, current: val, characterid: cid});
    } else
    {
      objToSet.set('current', val);
      return objToSet;
    }
  };

  const createCharacteristics = (stlst, chid) => {
    for (const [key, value] of Object.entries(stlst)) {                        // Set the characteristics
      let chnm = key + '_base';
      createOrSetAttr(chnm, value.value, chid);
      if(/^(end|body|stun)/.test(chnm))                                        // Handle display values for body, end and stun.
      {
        chnm = key.toUpperCase();
        createOrSetAttr(chnm, value.value, chid);
      }
      if(!!stat_log){logDebug("Set " + chnm + " to " + value.value);}          // Log characteristic assignment
    }
  };

  const createFeatures = (hdj, chid) => {
    //createOrSetAttr("alternate_ids", hdj.,      chid);                         // Future Placeholder
    createOrSetAttr("player_name",   hdj.playername,  chid);
    createOrSetAttr("height",        hdj.height,      chid);
    createOrSetAttr("weight",        hdj.weight,      chid);
    createOrSetAttr("hair",          hdj.hair,        chid);
    createOrSetAttr("eyes",          hdj.eye,         chid);
    createOrSetAttr("appearance",    hdj.appearance,  chid);
    createOrSetAttr("background",    hdj.background,  chid);
    createOrSetAttr("personality",   hdj.personality, chid);
    createOrSetAttr("quotes",        hdj.quote,       chid);
    createOrSetAttr("tactics",       hdj.tactics,     chid);
    createOrSetAttr("campaign",      hdj.campUse,     chid);
  };

  const createSkills = (sklst, cid) => {                                       // Create all skills
    for (var h=0; h < sklst.length; h++)                                       // Loop through HD sheet skills.
    {
      if(sklst[h].type==="Skill Levels"){continue;}                            // Skill Levels are handled in their own routine
      let uuid = generateUUID().replace(/_/g, "Z"),                            // Generate a UUID for skill grouping
      rspre    = "repeating_skills_" + uuid + "_skill_",                       // Build the string prefix for skill names
      rsnm     = rspre + "name",                                               // Build the skill name value
      rshi     = rspre + "has_increase",                                       // Build the has increase name value
      rshr     = rspre + "has_roll",                                           // Build the has roll name value
      rsrs     = rspre + "roll_show",                                          // Build the roll show name value
      rsrt     = rspre + "roll_target",                                        // Build the roll target name value
      rsch     = rspre + "char",                                               // Build the skill characteristic name value
      rsin     = rspre + "increase",                                           // Build the skill increase name value
      rsrf     = rspre + "roll_formula",                                       // Build the roll formula name value
      hs       = sklst[h],
      targ     = hs.roll,
      roll     = Number(targ.substring(0, Math.min(targ.length-1,2))),         // Convert the roll to integer
      sknm     = "",
      incr     = hs.level,
      noch     = (hs.char == "None" ? "" : hs.char);

      switch (hs.type)
      {
      case "Defense Maneuver":
        sknm = hs.name + hs.input;
        break;
      case "Perception":
        noch = "INT"
      default:
        sknm = hs.text.trim();
        break;
      }

      // Create the skill entries.
      createOrSetAttr(rsnm, sknm,   cid);
      createOrSetAttr(rshr, !!roll, cid);
      createOrSetAttr(rshi, !!incr, cid);
      createOrSetAttr(rsin, incr,   cid);
      if(!!roll)
      {
        createOrSetAttr(rsrs, targ, cid);
        createOrSetAttr(rsrf, "&{template:hero6template} {{charname=@{character_name}}}  {{action=@{skill_name}}}  {{roll=[[3d6]]}}  {{target=" + roll + "}} {{base=9}} {{stat= " + roll-9 + "}} {{lvls=" + incr + "}}", cid);
        createOrSetAttr(rsrt, roll, cid);
      }
      if(!(/^(GENERAL)/.test(noch) || noch === undefined))
      {
        createOrSetAttr(rsch, noch, cid);
      }
    }
  };

// TODO Check with Roll20 users to see if I need to duplicate records where level >1 in HD
  const createSkillLevels = (sllst, cid) => {
    for (var h=0; h < sllst.length; h++)                                       // Loop through HD sheet skills.
    {
      if(sllst[h].type!=="Skill Levels"){continue;}                            // Other skill levels are handled in their own routine
      let uuid = generateUUID().replace(/_/g, "Z"),                            // Generate a UUID for skill grouping
      rspre    = "repeating_skilllevels_" + uuid,                              // Build the string prefix for skill names
      rsnm     = rspre + "_skill_level",                                       // Build the skill name value
      rshi     = rspre + "_radio_skill_level";                                 // Build the level name value

      createOrSetAttr(rsnm, sllst[h].name.trim(), cid);
      createOrSetAttr(rshi, 0, cid);
      if(!!sklv_log){logDebug("Set " + sllst[h].name.trim());}                 // Log skill level assignment
    }
  };

  const createMovement = (mlst, cid) => {
    if(!mlst){return;}                                                         // If movement list is not undefined
    let uuid = "";                                                             // UUID for complication grouping
    for (const [key, value] of Object.entries(mlst)) {                         // Set the movement values
      cmnm = key + '_combat';
      ncnm = key + '_noncombat';
      if(/^(leap)/.test(cmnm))                                                 // Handle split for leap
      {
        createOrSetAttr('h' + cmnm, value.combat, cid);
        createOrSetAttr('h' + ncnm, value.noncombat, cid);
        createOrSetAttr('v' + cmnm, value.primary.combat.value/2 + "m", cid);
        createOrSetAttr('v' + ncnm, value.combat, cid);
        if (move_log){logDebug(cmnm);}                                         // Debug movement
      } else if (/^(run|swim)/.test(cmnm))                                     // Handle run, swim (always appear)
      {
      createOrSetAttr(cmnm, value.combat, cid);
      createOrSetAttr(ncnm, value.noncombat, cid);
      if (move_log){logDebug(cmnm);}                                           // Debug movement
      } else                                                                   // Handle all other cases
      {
        switch (key)                                                           // Create the movement description based on the type
        {
        case "fly":
          cmnm = "Flight";
          if (move_log){logDebug(cmnm);}                                       // Debug movement
          break;
        case "swing":
          cmnm = "Swinging";
          if (move_log){logDebug(cmnm);}                                       // Debug movement
          break;
        case "teleport":
          cmnm = "Teleportation";
          if (move_log){logDebug(cmnm);}                                       // Debug movement
          break;
        case "tunnel":
          cmnm = "Tunneling";
          if (move_log){logDebug(cmnm);}                                       // Debug movement
          break;
        default:
          sendChat("i6e_API", "Unhandled repeating element movement: (" + key + ") " + value.combat);
          break;
        }
        uuid = generateUUID().replace(/_/g, "Z");                              // Generate a UUID for complication grouping
        mvnm = "repeating_moves_" + uuid + "_spec_move_name";                  // Build the movement repeating name
        mvcb = "repeating_moves_" + uuid + "_spec_move_combat";                // Build the combat repeating name
        mvnc = "repeating_moves_" + uuid + "_spec_move_noncombat";             // Build the noncombat repeating name
        createOrSetAttr(mvnm, cmnm, cid);
        createOrSetAttr(mvcb, value.combat, cid);
        createOrSetAttr(mvnc, value.noncombat, cid);
      }
    }
  };

  const createCombatLevels = (cllst, cid) => {
    let ccb  = "",
    rocv = "",
    romv = "",
    rdcv = "",
    rdmv = "",
    rdc  = "",
    clnm = "";

    // Create all combat skill levels
    for (var cl=0; cl < cllst.length; cl++)                                    // Loop through combat skill levels
    {
      let hcs = cllst[cl];                                                     // Get combat skill level JSON attribute
      if(!(/^(Combat Skill Levels)/.test(hcs.name))){continue;}                // Only process Combat Skill Levels
      uuid   = generateUUID().replace(/_/g, "Z");                              // Generate a UUID for complication grouping
      clnm   = "repeating_combatskills_" + uuid + "_csl_name";                 // Build the combat level repeating name
      ccb    = "repeating_combatskills_" + uuid + "_csl_checkbox";
      rocv   = "repeating_combatskills_" + uuid + "_radio_csl_ocv";
      romv   = "repeating_combatskills_" + uuid + "_radio_csl_omcv";
      rdcv   = "repeating_combatskills_" + uuid + "_radio_csl_dcv";
      rdmv   = "repeating_combatskills_" + uuid + "_radio_csl_dmcv";
      rdc    = "repeating_combatskills_" + uuid + "_radio_csl_dc";
      createOrSetAttr(clnm, hcs.text, cid);
      createOrSetAttr(ccb,  0, cid);
      createOrSetAttr(rocv, 0, cid);
      createOrSetAttr(romv, 0, cid);
      createOrSetAttr(rdcv, 0, cid);
      createOrSetAttr(rdmv, 0, cid);
      createOrSetAttr(rdc,  0, cid);
      if(!!cskl_log){logDebug("Set " + hcs.name );}                            // Log skill level assignment
    }
  };

  const createPenaltyLevels = (plst, cid) => {
    let pcb  = "",
    rocv = "",
    rmod = "",
    rdcv = "",
    psnm = "";

    for (var p=0; p < plst.length; p++)                                        // Loop through Skills
    {
      let hps = plst[p];                                                       // Get skill JSON attribute
      if(!(/^(Penalty Skill Levels)/.test(hps.name))){continue;}               // Only process Penalty Skill Levels
      logDebug(hps.text);
      uuid   = generateUUID().replace(/_/g, "Z");                              // Generate a UUID for penalty skill grouping
      psnm   = "repeating_penaltyskills_" + uuid + "_psl_name";                // Build the penalty skill repeating name
      pcb    = "repeating_penaltyskills_" + uuid + "_psl_checkbox";
      rocv   = "repeating_penaltyskills_" + uuid + "_radio_psl_";
      rdcv   = "repeating_penaltyskills_" + uuid + "_radio_psl_";
      rmod   = "repeating_penaltyskills_" + uuid + "_radio_psl_";
      createOrSetAttr(psnm, hps.text, cid);
      createOrSetAttr(pcb,  0, cid);
// TODO Use OptionID to set appropriate flags for ocv, dcv, rmod Example:SINGLEDCV
      createOrSetAttr(rocv, 0, cid);
      createOrSetAttr(rmod, 0, cid);
      createOrSetAttr(rdcv, (/^(SINGLEDCV)/.test(hps.optionID)), cid);
      if(!!pnsk_log){logDebug("Set " + hps.text);}                             // Log penalty skill level assignment
    }
  };

  const createComplications = (clst, cid) => {
    let rcap   = "",                                                           // Complication cost name
    rcnm       = "",                                                           // Complication name
    compnm     = "",                                                           // Complication description
    ad1        = "",                                                           // Complication adder 1
    ad2        = "",                                                           // Complication adder 2
    ad3        = "",                                                           // Complication adder 3
    ad4        = "",                                                           // Complication adder 4
    ad5        = "",                                                           // Complication adder 5
    md1        = "",                                                           // Complication modifier 1
    md2        = "",                                                           // Complication modifier 2
    md3        = "",                                                           // Complication modifier 3
    uuid       = "";

    // Create all complications
    for (var c=0; c < clst.length; c++)                                        // Loop through complications
    {
      var hc = clst[c];                                                        // Get complication JSON attribute
      uuid   = generateUUID().replace(/_/g, "Z");                              // Generate a UUID for complication grouping
      rcnm   = "repeating_complications_" + uuid + "_complication";            // Build the complication repeating name
      rcap   = rcnm + "_cost";
      if (hc.adders[4])
      {                                                                        // Populate 5 adders
        ad5 = hc.adders[4].input;
        ad4 = hc.adders[3].input;
        ad3 = hc.adders[2].input;
        ad2 = hc.adders[1].input;
        ad1 = hc.adders[0].input;
      } else if (hc.adders[3])
      {                                                                        // Populate first 4 adders
        ad4 = hc.adders[3].input;
        ad3 = hc.adders[2].input;
        ad2 = hc.adders[1].input;
        ad1 = hc.adders[0].input;
      } else if (hc.adders[2])
      {                                                                        // Populate first 3 adders
        ad3 = hc.adders[2].input;
        ad2 = hc.adders[1].input;
        ad1 = hc.adders[0].input;
      } else if (hc.adders[1])
      {                                                                        // Populate first 2 adders
        ad2 = hc.adders[1].input;
        ad1 = hc.adders[0].input;
      } else if (hc.adders[0])
      {                                                                        // Populate 1st adder
        ad1 = hc.adders[0].input;
      }

      if (hc.modifiers[2]!==undefined)
      {                                                                        // Populate 3 modifiers
        md3 = hc.modifiers[2].input;
        md2 = hc.modifiers[1].input;
        md1 = hc.modifiers[0].input;
      } else if (hc.modifiers[1]!==undefined)
      {                                                                        // Populate 2 modifiers
        md2 = hc.modifiers[1].input;
        md1 = hc.modifiers[0].input;
      } else if (hc.modifiers[0]!==undefined)
      {                                                                        // Populate 1 modifier
        md1 = hc.modifiers[0].input;
      }

      switch (hc.XMLID)                                                        // Create the complication description based on the type
      {
      case "ACCIDENTALCHANGE":                                                 // Accidental Change
        compnm = "Acc Chg: " + hc.input + ", " + ad1 + ", " + ad2;
        break;
      case "DEPENDENCE":                                                       // Dependence
        compnm = "Dep: " + hc.input + ", " + ad1 + " / " + ad3 + ", " + ad2;
        break;
      case "DEPENDENTNPC":                                                     // Dependent NPC
        compnm = "DNPC: " + hc.input + ", " + ad1 + ", " + ad2 + ", " + ad3;
        break;
      case "DISTINCTIVEFEATURES":                                              // Distinctive Features
        compnm = "DF: " + hc.input + ", " + ad1 + ", " + ad2 + ", " + ad3;
        break;
      case "ENRAGED":                                                          // Enraged
        compnm = "Enraged: " + hc.input + ", " + ad2 + ", " + ad3 + ", " + ad1 ;
        break;
      case "GENERICDISADVANTAGE":                                              // Custom - manually fill in
        compnm = "Populate Custom Complication Here";
        break;
      case "HUNTED":                                                           // Hunted
        compnm = "Hunted: " + hc.input + " (" + ad1 + ", " + ad2 + ", " + ad3 + ")";
        break;
      case "PHYSICALLIMITATION":                                               // Physical Complication
        compnm = "Phys Comp: " + hc.input + ", " + ad1 + ", " + ad2 + ", " + ad3;
        break;
      case "PSYCHOLOGICALLIMITATION":                                          // Psychological Complication
        compnm = "Psy Comp: " + hc.input + ", " + ad1 + ", " + ad2 + ", " + ad3;
        break;
      case "RIVALRY":                                                          // Negative Reputation
        compnm = "Rival: " + ad2 + " (" + ad1 + ", " + ad3 + ", " + ad4 + ", " + ad5;
        break;
      case "REPUTATION":                                                       // Negative Reputation
        compnm = "Neg Rep: " + hc.input + ", " + ad1 + ", " + ad2 + ", " + ad3;
        break;
      case "SOCIALLIMITATION":                                                 // Social Complication
        compnm = "Soc Comp: " + hc.input + ", " + ad1 + ", " + ad2 + ", " + ad3;
        break;
      case "SUSCEPTIBILITY":                                                   // Susceptiblity
        compnm = "Susc: " + hc.input + "(" + ad1 + " " + ad2 + ")";
        break;
// TODO Check the various combinations and combine cases if possible.
      case "UNLUCK":                                                           // Unluck
        compnm = name;
        break;
      case "VULNERABILITY":                                                    // Vulnerability
        compnm = "Vuln: " + hc.input + " - " + md1 + " (" + ad1 + ")";
        break;
      default:
        sendChat("i6e_API", "Unhandled complication type: " + hc.XMLID);
        break;
      }
// TODO make abbreviations optional
// TODO abbreviations for Rivalry
      compnm = compnm.replace(/[,\s]+$/g, '')                                  // Trim trailing comma and space as needed
      .replace('Uncommon', 'Unc')                                              // Abbreviate Uncommon
      .replace('Common', 'Com')                                                // Abbreviate Common
      .replace('Very Common', 'VC')                                            // Abbreviate Very Common
      .replace('As Powerful', 'AsPow')                                         // Abbreviate As Powerful
      .replace('More Powerful', 'MoPow')                                       // Abbreviate More Powerful
      .replace('Less Powerful', 'LessPow')                                     // Abbreviate Less Powerful
      .replace('Strong', 'Str')                                                // Abbreviate Strong
      .replace('Total', 'Tot')                                                 // Abbreviate Total
      .replace('Frequently', 'Freq')                                           // Abbreviate Frequent
      .replace('Infrequently', 'Infreq')                                       // Abbreviate Infrequent
      .replace('Moderate', 'Mod')                                              // Abbreviate Moderate
      .replace('Major', 'Maj')                                                 // Abbreviate Major
      .replace('Slightly', 'Slight')                                           // Abbreviate Slightly
      createOrSetAttr(rcap, hc.active, cid);                                   // Assign the complication cost
      createOrSetAttr(rcnm, compnm, cid);                                      // Assign the complication name
    }
  };

  const figurePowerMod = (modf, calc) => {
    let lval = 0,
        aval = 0,
        rend = 1.0,
        rsrr = 0,
        val  = "";

    modf.forEach(m => {                                                        // Loop all modifiers
      val = m.value;
      val = val.replace('¾', '.75')                                            // Substitue decimals for fractions
               .replace('½', '.5')
               .replace('¼', '.25')
               .replace(/[^\x00-\xBF]+/g, '')

      if(val.substring(0,1) === "-"){lval=lval+parseFloat(val);}               // Add to limitations
      if(val.substring(0,1) === "+"){aval=aval+parseFloat(val);}               // Add to advantages
      if(m.type === "Reduced Endurance")
      {
        if(m.input === "Half END")                                             // Set to half endurance cost
        {
          rend = .5;
        } else if (m.input === "0 END")                                        // Set to zero endurance cost
        {
          rend = 0;
        }
      } else if(m.type === "Increased Endurance Cost")
      {
        rend = parseInt(m.input.substring(1,3).trim());                        // Set to increased endurance cost
      }
// TODO handle rsr figures, need HD examples
    })

    switch (calc)
    {
    case "lim":                                                                // Figure limitation value
      return lval*-1;
    case "adv":                                                                // Figure advantage value
      return aval;
    case "end":                                                                // Figure endurance multiplier
      return rend;
    case "rsr":                                                                // Figure skill roll
      return rsrr;
    default:                                                                   // Unknown calculation
      return sendChat("i6e_API", "Unknown calculation value: " + calc);
    }
  };

  const createSimplePower = (pwjson, uuid, cid) => {
    let pwnm   = '',
        pwdesc = '',
        end    = 0,                                                            // Store endurance as a number
        ap     = 0,                                                            // Store active points as a number
        bp     = 0,                                                            // Store base points as a number
        rp     = 0,                                                            // Store real points as a number
        hclas  = pwjson.class,
        rppre  = "repeating_powers_" + uuid,                                   // Build the string prefix for power labels
        rppow  = rppre + "_power",
        rpnm   = rppre + "_power_name",                                        // Build the power name label
        rppf   = rppre + "_use_power_formula",                                 // Build the power formula label
        rppf2  = rppre + "_use_power2_formula",                                // Build the 2nd power formula label
        rpec   = rppre + "_power_end_cost",                                    // Build the power end cost label
        rpea   = rppre + "_power_end_ap_cost",                                 // Build the power ap end cost label
        rpes   = rppre + "_power_end_str_cost",                                // Build the power str end cost label
        rprc   = rppre + "_power_remaining_charges",                           // Build the power remaining charges / end label
        rppe   = rppre + "_power_expand",
        rppat  = rppre + "_pow_attack",                                        // Is this power a pre-selected attack option?
        rpbp   = rppre + "_pow_base_points",
        rpap   = rppre + "_pow_active_points",
        rpan   = rppre + "_pow_active_points_no_reduced_end",
        rprp   = rppre + "_pow_real_points",
        rprl   = rppre + "_power_real_cost",
        rpbd   = rppre + "_attack_base_dice",
        rpbs   = rppre + "_attack_base_dice_show",
        rpsd   = rppre + "_attack_str_dice",
        rpss   = rppre + "_attack_str_dice_show",
        rpse   = rppre + "_attack_str_for_end",
        rpmd   = rppre + "_attack_maneuver_dice_show",
        rpcd   = rppre + "_attack_csl_dice_show",
        rpac   = rppre + "_attack_cv",
        rped   = rppre + "_attack_extra_dice",
        rpds   = rppre + "_attack_extra_dice_show",
        rpad   = rppre + "_attack_dice",
        rpas   = rppre + "_attack_dice_show",
        rppn   = rppre + "_pow_advantages_no_reduced_end",
        rppa   = rppre + "_pow_advantages",
        rppl   = rppre + "_pow_limitations",
        rpem   = rppre + "_end_multiplier",
        rpps   = rppre + "_power_end_source",
        rpaus  = rppre + "_attack_uses_str",
        rpaw   = rppre + "_attack_wizard",
        rpadc  = rppre + "_attack_die_cost",
        rpatt  = rppre + "_attack_type",
        rpatk  = rppre + "_attack_killing",
        rpahl  = rppre + "_attack_hit_location",
        rppft  = rppre + "_pow_frame_type",                                    // Power Framework type
        rppfn  = rppre + "_pow_framework_name",                                // Power framework name
        rppef  = rppre + "_power_end_fixed",                                   // VPP fixed END
        pwtype = pwjson.type.trim(),
        xmlid  = pwjson.XMLID,
        pwlvl  = pwjson.level,
        lim    = 0.0,
        adv    = 0.0,
        endm   = 1,                                                            // Endurance multiplier
        ocv    = getAttrByName(cid, 'ocv'),
        mocv   = getAttrByName(cid, 'omcv'),
        zero   = 0,
        ka     = 0,
        wiz    = 0,                                                            // Does this power use the wiard for die calculation
        cvtyp  = "",                                                           // Combat Value Type (OCV or OMCV)
        adc    = 0,                                                            // Attack die cost (CP per die of power)
        att    = "",
        wizc   = "",
        hl     = 0,                                                            // Power uses hit locations
        strbs  = 0;                                                            // Power uses strength as a basis

    if (isNaN(pwjson.end) || pwjson.end==="") {end = 0;} else {end = parseInt(pwjson.end)}
    if (isNaN(pwjson.active)) {ap  = 0;} else {ap  = parseInt(pwjson.active)}
    if (isNaN(pwjson.base))   {bp  = 0;} else {bp  = parseInt(pwjson.base)}

    if(pwjson.desc===undefined){
      sendChat("i6e_API", "Power has undefined description, JSON template version is incorrect: " + pwnm);
    } else
    {
      pwdesc = pwjson.desc.replace(/[^\x00-\xBF]+/g, '');
    }
    if (pwjson.name.trim() === "No Name Supplied")
    {
      pwnm = pwtype;
    } else
    {
      pwnm = pwjson.name.trim();
    }

    if (isNaN(pwjson.end))
    {
// TODO implement powers with charges and reserves
      sendChat("i6e_API", "Powers with charges not implemented yet: " + pwnm);
      return;
    }

    // Calculate limitation, advantages and endurance multipliers
    if(pwjson.modifiers.length)
    {
      lim  = figurePowerMod(pwjson.modifiers, "lim");
      adv  = figurePowerMod(pwjson.modifiers, "adv");
      endm = figurePowerMod(pwjson.modifiers, "end");
      if(!!powr_log){logDebug("Lim,Adv,Endm: " + lim + ", " + adv + ", " + endm);}
    }

    // Calculate real points from AP and Limitations.
    if(ap !== 0){
      rp = ap/(1+lim);
      dec = rp - Math.floor(rp);
      if(dec > .5){rp = Math.ceil(rp)}else{rp = Math.floor(rp)};               // Round the real points
    }

    // Create the power entries. Reordered to correct order for sheet macro to read.
    createOrSetAttr(rpnm,  pwnm, cid);                                         // Assign the power name
    switch (xmlid)
    {
    // Handle Effect powers
    case "AID":
      adc   = 6;
    case "DISPEL":
      adc   = 3;
    case "DRAIN":
      adc   = 10;
    case "HEALING":
      adc   = 10;
    case "TRANSFORM":
// TODO Figure out a way to determine Transform Severity to set Active Die Cost
      adc   = bp/pwlvl;
      logDebug(adc);
      createOrSetAttr(rppf,  "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}}  {{base=" + ocv + "}} {{ocv=" + ocv + "}} {{attack=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{type=Effect}}", cid);
      createOrSetAttr(rppf2, "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}}  {{base=" + ocv + "}} {{ocv=" + ocv + "}} {{attack=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{type=Effect}} {{description=" + pwdesc + "}}", cid);
      att   = "Effect";
      wiz   = 1;
      hl    = 0;
      cvtyp = "OCV";
      break;
    // Handle Body Die Roll powers
    case "ENTANGLE":
      adc   = 10;
    case "FLASH":
// TODO Figure out a way to determine targetting or non to set Active Die Cost
      createOrSetAttr(rppf,  "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}}  {{base=" + ocv + "}} {{ocv=" + ocv + "}} {{attack=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{type=Die Rolls}} {{count=BODY}}", cid);
      createOrSetAttr(rppf2, "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}}  {{base=" + ocv + "}} {{ocv=" + ocv + "}} {{attack=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{type=Die Rolls}} {{count=BODY}}{{description=" + pwdesc + "}}", cid);
      att   = "BODY only";
      adc   = 5;
      wiz   = 1;
      hl    = 0;
      cvtyp = "OCV";
      break;
    // Handle Standard Attack powers
    case "ENERGYBLAST":
      adc   = 5;
    case "HANDTOHANDATTACK":
      strbs = 1;
      adc   = 5;
    case "TELEKINESIS":
// TODO Look up ADC cost in character sheet
      createOrSetAttr(rppf,  "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}}  {{base=" + ocv + "}} {{ocv=" + ocv + "}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{type=STUN}} {{count=BODY}}", cid);
      createOrSetAttr(rppf2, "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}}  {{base=" + ocv + "}} {{ocv=" + ocv + "}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{type=STUN}} {{count=BODY}}{{description=" + pwdesc + "}}", cid);
      wiz   = 1;
      hl    = 1;
      att   = "STUN & BODY";
      cvtyp = "OCV";
      break;
    // Handle Killing Attack powers
    case "HKA":
      strbs = 1;
    case "RKA":
      createOrSetAttr(rppf,  "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}}  {{base=" + ocv + "}} {{ocv=" + ocv + "}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{killing=1}} {{type=BODY}}", cid);
      createOrSetAttr(rppf2, "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}}  {{base=" + ocv + "}} {{ocv=" + ocv + "}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{killing=1}} {{type=BODY}}{{description=" + pwdesc + "}}", cid);
      adc   = 15;
      ka    = 1;
      hl    = 1;
      wiz   = 1;
      att   = "BODY";
      cvtyp = "OCV";
      break;
    // Handle Luck powers
    case "LUCK":
      createOrSetAttr(rppf,  "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}} {{damage=[[" + pwjson.damage + "]]}} {{type=Die Rolls}} {{count=Luck}}", cid);
      createOrSetAttr(rppf2, "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}} {{damage=[[" + pwjson.damage + "]]}} {{type=Die Rolls}} {{count=Luck}}{{description=" + pwdesc + "}}", cid);
      att   = "Luck";
      adc   = 5;
      hl    = 0;
      wiz   = 1;
      break;
    // Handle Ego Attack powers
    case "EGOATTACK":
      createOrSetAttr(rppf,  "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}} {{ocv=" + mocv + "}} {{attack=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{type=STUN}}", cid);
      createOrSetAttr(rppf2, "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}} {{ocv=" + mocv + "}} {{attack=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{type=STUN}}{{description=" + pwdesc + "}}", cid);
      adc   = 10;
      wiz   = 1;
      hl    = 0;
      att   = "STUN";
      cvtyp = "OMCV";
      break;
    // Handle Mental Effect powers
    case "MENTALILLUSIONS":
    case "MINDCONTROL":
    case "MINDSCAN":
    case "TELEPATHY":
      createOrSetAttr(rppf,  "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}} {{ocv=" + mocv + "}} {{attack=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{type=Effect}}", cid);
      createOrSetAttr(rppf2, "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}} {{ocv=" + mocv + "}} {{attack=[[3d6]]}} {{damage=[[" + pwjson.damage + "]]}} {{type=Effect}}{{description=" + pwdesc + "}}", cid);
      att   = "Effect";
      cvtyp = "OMCV";
      hl    = 0;
      adc   = 5;
      wiz   = 1;
      break;
    // Handle standard description output powers
  //        case "ABSORPTION": check spelling
    case "GENERIC_OBJECT":
      if(pwjson.type==="Variable Power Pool")
      {
        createOrSetAttr(rppft, "Variable Power Pool", cid);
        createOrSetAttr(rppfn, pwnm, cid);
        createOrSetAttr(rppef, "0", cid);
      }
/*
{"name":"repeating_powers_-MZcTB4QZrODnr95ikiX_pow_frame_type","current":"VPP Slot","max":"","_id":"-M_fEJw5Tb3Twd5QDRfm","_type":"attribute","_characterid":"-MZs-0JF2h1Ua0e2Hv1Y"},
{"name":"repeating_powers_-MZcTB4QZrODnr95ikiX_pow_framework_name","current":"Divine VPP","max":"","_id":"-M_fEUBbQxPhV74m0c4E","_type":"attribute","_characterid":"-MZs-0JF2h1Ua0e2Hv1Y"},
*/
    default:
      createOrSetAttr(rppf,  "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}}", cid);
      createOrSetAttr(rppf2, "&{template:hero6template} {{charname=@{character_name}}} {{power=" + pwnm + "}} {{description=" + pwdesc + "}}", cid);                                      // Assign the complication name
  //  sendChat("i6e_API", "Defaulted Power Type: " + xmlid);
      hl    = 0;
      wiz   = 0;
      break;
    }
    createOrSetAttr(rpec,  pwjson.end, cid);                                   // Endurance Cost (string)
    createOrSetAttr(rpea,  end, cid);                                          // Endurance Cost - AP (number)
    createOrSetAttr(rpes,  zero, cid);                                         // Endurance Cost - STR (number)
    createOrSetAttr(rprc,  pwjson.end, cid);                                   // Endurance Cost - Remaining Charges (string)
    createOrSetAttr(rppow, pwdesc, cid);                                       // Assign the power description

    createOrSetAttr(rppe,  zero, cid);                                         // FLAG: Is power wizard expanded?
    wizc = wiz.toString();
    createOrSetAttr(rppat, wizc, cid);                                         // FLAG: Is power preselected attack option

    createOrSetAttr(rpbp,  pwjson.base, cid);                                  // Assign base points (string)
    createOrSetAttr(rpap,  ap, cid);                                           // Assign active points (number)
    createOrSetAttr(rpan,  parseInt(pwjson.base)*adv, cid);                    // Active Points without reduced end
    if (endm === 0){
      createOrSetAttr(rppn, adv-(.5), cid);                                    // Power advantage total without Reduced End
    } else if (endm === .5){
      createOrSetAttr(rppn, adv-(.25), cid);                                   // Power advantage total without Reduced End
    } else {
      createOrSetAttr(rppn, adv, cid);                                         // Power advantage total without Reduced End
    }
    createOrSetAttr(rpbd,  pwjson.damage, cid);                                // Base dice
    createOrSetAttr(rpbs,  pwjson.damage, cid);                                // Base dice show
    createOrSetAttr(rprp,  rp, cid);                                           // Real Points
    createOrSetAttr(rprl,  rp, cid);                                           // Real Cost
    createOrSetAttr(rpsd,  " ", cid);                                          // Strength dice
    createOrSetAttr(rpss,  " ", cid);                                          // Strength dice show
    createOrSetAttr(rpse,  zero, cid);                                         // STR for END
    createOrSetAttr(rpmd,  " ", cid);                                          // Attack Maneuver dice show
    createOrSetAttr(rpcd,  " ", cid);                                          // CSL dice show
    createOrSetAttr(rped,  " ", cid);                                          // Extra dice
    createOrSetAttr(rpds,  " ", cid);                                          // Extra dice show
    createOrSetAttr(rpad,  pwjson.damage, cid);                                // Attack dice
    createOrSetAttr(rpas,  pwjson.damage, cid);                                // Attack dice show

// Add "no cost" and possibly other limited values like 1/2?
// Use case: Absorption, Cannot be stunned, Clinging, etc.
// Also Lim: Costs 1/2 END
    if(endm === 1){                                                            // Set Endurance Multiplier
      createOrSetAttr(rpem, "1x END", cid);
    } else if (endm === 0){
      createOrSetAttr(rpem, "0 END", cid);
    } else if (endm === .5){
      createOrSetAttr(rpem, "½ END", cid);
    } else {
      createOrSetAttr(rpem, "Costs " + endm + "x", cid);
    }
// TODO: Create Function to check for alternate END sources
    createOrSetAttr(rpps, "END", cid);                                         // Endurance Source

    createOrSetAttr(rppa, adv, cid);                                           // Power advantage total
    createOrSetAttr(rppl, lim, cid);                                           // Power limitation total

    if(!!wiz)
    {
      createOrSetAttr(rpaus, strbs, cid);
      createOrSetAttr(rpaw,  "", cid);
// TODO: Figure out how to set.
//          createOrSetAttr(rpatt, , cid);
      createOrSetAttr(rpatk, ka, cid);
      createOrSetAttr(rpac, cvtyp, cid);
      createOrSetAttr(rpadc, adc, cid);
      if(strbs)
      {
        createOrSetAttr(rpac, cvtyp, cid);
      } else
      {
        createOrSetAttr(rpac, cvtyp, cid);
      }
      createOrSetAttr(rpahl, hl, cid);
    }
  };

  const createPerks = (plst, cid) => {
    let pknm     = '';
    // Create all perks
    for (var p=0; p < plst.length; p++)                                        // Loop through HD sheet powers
    {
      UUID = generateUUID().replace(/_/g, "Z");                                // Generate a UUID for perk grouping
      pknm = "repeating_perks_" + UUID + "_perk_name";
      createOrSetAttr(pknm, plst[p].desc.trim(), cid);
    }
  };

  const createTalents = (tlst, cid) => {
    let objToSet = [],
        tlnm     = '';
    // Create all talents
    for (var t=0; t < tlst.length; t++)                                        // Loop through HD sheet powers
    {
      if(tlst[t].desc===undefined){continue;}
      UUID = generateUUID().replace(/_/g, "Z");                                // Generate a UUID for perk grouping
      tlnm = "repeating_perks_" + UUID + "_perk_name";
      createOrSetAttr(tlnm, tlst[t].desc.trim(), cid);
    }
  };

  const generateUUID = () => {                                                 // Generate a UUID (original code by The Aaron)
    let a = 0;
    let b = [];

    let c = (new Date()).getTime() + 0;
    let f = 7;
    let e = new Array(8);
    let d = c === a;
    a = c;
    for (; 0 <= f; f--) {
      e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
      c = Math.floor(c / 64);
    }
    c = e.join("");
    if (d) {
      for (f = 11; 0 <= f && 63 === b[f]; f--) {
        b[f] = 0;
      }
      b[f]++;
    } else {
      for (f = 0; 12 > f; f++) {
        b[f] = Math.floor(64 * Math.random());
      }
    }
    for (f = 0; 12 > f; f++){
      c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
    }

    return c;
  };

  const decodeEditorText = (t, o) =>{                                          // Clean up notes and decode (code by The Aaron)
    let w = t;
    o = Object.assign({ separator: '\r\n', asArray: false },o);
    // Token GM Notes
    if(/^%3Cp%3E/.test(w)){
      w = unescape(w);
    }
     if(/^<p>/.test(w)){
     let lines = w.match(/<p>.*?<\/p>/g)
      .map( l => l.replace(/^<p>(.*?)<\/p>$/,'$1'));
      return o.asArray ? lines : lines.join(o.separator);
    }
    // neither
    return t;
  };

  const handleInput = (msg) => {                                               // Monitor the chat for commands, process sheet if import called
    if (!(msg.type === "api" &&
        /^!(importHS6e|i6e)(\s|$)/.test(msg.content))) {                       // Ignore messages not intended for this script
      return;
    }

///////////////////////////////////////////////////////////////////////////////// Begin processing API message
    let args = msg.content.split(/\s+--/).slice(1);
    args.forEach(a => {                                                        // Loop all attributes
      switch (a)
      {
      case "help":                                                             // Show help in Chat
        //return showImportHelp(who);
        break;
      case "debug":                                                            // Log debug info to API Console
        debug_log = 1;
        break;
      case "statdebug":                                                        // Log debug info to API Console
        stat_log = 1;
        break;
      case "movedebug":                                                        // Log debug info to API Console
        move_log = 1;
        break;
      case "powrdebug":                                                        // Log debug info to API Console
        powr_log = 1;
        break;
      case "compdebug":                                                        // Log debug info to API Console
        comp_log = 1;
        break;
      case "perkdebug":                                                        // Log debug info to API Console
        perk_log = 1;
        break;
      case "talndebug":                                                        // Log debug info to API Console
        taln_log = 1;
        break;
      case "skildebug":                                                        // Log debug info to API Console
        skil_log = 1;
        break;
      case "showobj":                                                          // Show current objects on API Console
        logObjs  = 1;
        break;
      default:
        //return sendChat("Unknown argument value", who, "", "ImportHS6e" );
        break;
      }
    })

    if (debug_log===1){log("Debug is ON");}else{log("Debug is OFF");}          // Display current Debug status.

    var selected = msg.selected;
    if (selected===undefined)                                                  // Must have a token selected
    {
      sendChat("i6e_API", "Please select a token.");
      return;
    }

    let token     = getObj("graphic",selected[0]._id);                         // Get selected token
    let character = getObj("character",token.get("represents"));               // Get character linked to token

    if (character===undefined)                                                 // Token must have valid character assigned.
    {
      sendChat("i6e_API", "Token has no character assigned, please assign and retry.");
      return;
    }

    ///////////////////////////////////////////////////////////////////////////////// Begin parsing character sheet
    let chid             = character.id;                                       // Get character identifier
    let herodesignerData = [];
    let characterName    = findObjs({type: 'attribute', characterid: chid, name: 'name'})[0];

    character.get("gmnotes", function(gmnotes) {                               // Begin processing the GM Notes section

      let dec_gmnotes = decodeEditorText(gmnotes);

      // Clean JSON of extra junk the HTML adds.
      dec_gmnotes = dec_gmnotes.replace(/<[^>]*>/g, '')                        //   Remove <tags>
                               .replace(/&[^;]*;/g, '')                        //   Remove &nbsp;
                               .replace(/[^\x0A-\xBF]/g, '')                   //   Remove nonstandard letters;
                               .replace(/\},\s{1,}\]/g, '\}\]');               //   Remove extra comma

      logDebug(dec_gmnotes);

      if(gmnotes.length <= 5000)
      {
        sendChat("i6e_API", "JSON too short to contain valid character data. Update character (not token) GM Notes.");
        return;
      }

      let hdJSON   = JSON.parse(dec_gmnotes),                                  // Parse the decoded JSON from GM Notes field.
          hdchlist = hdJSON.stats,                                             // Create array of all HD Characteristics.
          hdmvlist = hdJSON.movement,                                          // Create array of all HD Characteristics.
          hdsklist = hdJSON.skills,                                            // Create array of all HD Skills.
          hdsllist = hdJSON.skills,                                            // Create array of all HD Skill Levels.
          hdcmlist = hdJSON.disads,                                            // Create array of all HD Complications.
          hdpwlist = hdJSON.powers,                                            // Create array of all HD Powers.
          hdpklist = hdJSON.perks,                                             // Create array of all HD Perks.
          hdtllist = hdJSON.talents;                                           // Create array of all HD Talents.

      character.set("name", hdJSON.name);                                      // Set the name
      // Create array of all attributes
      var attrlist = findObjs({type: 'attribute', characterid: chid});

// TODO make adds conditional based on input flags per attribute type (stats, powers etc)
      removeExistingAttributes(attrlist);
      logDebug("*** Existing skills and complications removed");
      createCharacteristics(hdJSON.stats, chid);
      logDebug("*** Stats Assigned");
      createFeatures(hdJSON, chid);
      logDebug("*** Features Assigned");
      createSkills(hdsklist, chid);
      logDebug("*** Skills Assigned");
      createMovement(hdmvlist, chid);
      logDebug("*** Movement Assigned");
      createSkillLevels(hdsllist, chid);
      logDebug("*** Skill Levels Assigned");
      createCombatLevels(hdsklist, chid);
      logDebug("*** Combat Levels Assigned");
      createPenaltyLevels(hdsklist, chid);
      logDebug("*** Penalty Levels Assigned");
      createComplications(hdcmlist, chid);
      logDebug("*** Complications Assigned");
      createPerks(hdpklist, chid);
      logDebug("*** Perks Assigned");
      createTalents(hdtllist, chid);
      logDebug("*** Talents Assigned");

      // Create all powers
      for (var h=0; h < hdpwlist.length; h++)                                  // Loop through HD sheet powers
      {
        UUID   = generateUUID().replace(/_/g, "Z");                            // Generate a UUID for power grouping
        createSimplePower(hdpwlist[h], UUID, chid);
      }

      logDebug("*** Powers Assigned");
// TODO
//        logDebug("Equipment Assigned");
//        logDebug("Rolls Assigned");
//        logDebug("Lightning Reflexes Assigned");

      if (logObjs != 0){                                                       // Output character for debug purposes
        let allobjs = getAllObjs();
        log(allobjs);
      }
    });
  };

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
    return;
  };

  on('ready',function() {
    checkInstall();
    registerEventHandlers();
  });

  return;
})();
{ try { throw new Error(''); } catch (e) { API_Meta.ImportHS6e.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ImportHS6e.offset); } }
