/*
=========================================================
Name:           ImportHS6e
GitHub:         https://github.com/eepjr24/ImportHS6e
Roll20 Contact: eepjr24
Version:        1.05
Last Update:    03/08/2022
=========================================================
Updates:
*/
var API_Meta = API_Meta || {}
API_Meta.ImportHS6e = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 }
{
  try { throw new Error('') } catch (e) { API_Meta.ImportHS6e.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)) }
}

const ImportHS6e = (() => {
  const version = '1.05'
  const lastUpdate = 1645803682105
  // For all log flags, 1 = turn on logging, 0 = leave loggig off
  let debug_log = 0 // Debug log settings, general
  let logObjs = 0 // Output character object to api log
  let comp_log = 0 // Debug complications
  let cskl_log = 0 // Debug combat skill Levels
  let move_log = 0 // Debug movement debug
  let perk_log = 0 // Debug perks
  let pnsk_log = 0 // Debug penalty skill levels
  let powr_log = 1 // Debug powers
  let remv_log = 0 // Debug attribute removal
  let resv_log = 0 // Debug reserves
  let skil_log = 0 // Debug skills
  let sklv_log = 0 // Debug skill levels
  let snse_log = 1 // Debug sense assignment
  let stat_log = 0 // Debug characteristics
  let taln_log = 0 // Debug talents
  // For all removal flags 1=remove, 0=leave
  let comp_rem = 1 // Complications removal flag
  let cskl_rem = 1 // Combat skill levels removal flag
  let powr_rem = 1 // Powers removal flag
  let perk_rem = 1 // Debug removal flag
  let pskl_rem = 1 // Penalty skill level removal flag
  let resv_rem = 1 // Reserves removal flag
  let skil_rem = 1 // Skills removal flag
  let sklv_rem = 1 // Skill levels removal flag
  let snse_rem = 1 // Senses removal flag
  let stat_rem = 1 // Characteristics removal flag
  let taln_rem = 1 // Talents removal flag
  let move_rem = 1 // Movement removal flag
  let llv = ''
  let lav = ''
  // TO DO LIST:
  // Augment help option
  // Fix defenses to add to Core Tab
  // CSL's bought as powers to show on Combat Tab
  // PSL's bought as powers to show on Combat Tab
  // Skills bought as powers to show on Skills Tab
  // Fix senses on Core tab for bought up (non-default) values
  // Get RSR's working
  // Validate Charges working
  // Validate End Res working

  // BIG TO DO's
  // Make 5e compatible?

  const checkInstall = () => { // Display version information on startup.
    const updated = new Date(lastUpdate)
    log('\u0EC2\u2118 [ImportHS6e v' + version + ', ' + updated.getFullYear() + '/' + (updated.getMonth() + 1) + '/' + updated.getDate() + ']')
  }

  const showImportHelp = (who) => { // Show the help for the tool. Needs work.
    if (who) { who = '/w ' + who.split(' ', 1)[0] + ' ' }
    sendChat('Hero System 6e Character Importer', who + ' ')
  }

  const logDebug = (logval) => { // Conditional log function, logs if debug flag is found
    if (debug_log !== 0) { log(logval) }
  }

  const removeExistingAttributes = (alst) => { // Remove existing attributes from roll20 character sheet
    for (let c = 0; c < alst.length; c++) { // Loop character sheet atribute list
      const attr = alst[c].get('name') // Get attribute name
      const attrtype = attr.split('_')
      if (!(/^repeating_/.test(attr))) { continue } // Only remove repeating elements
      switch (attrtype[1]) { // Create the complication description based on the type
        case 'complications':
          if (!comp_rem) { break }
          alst[c].remove() // Remove them
          if (remv_log) { logDebug(attr) } // Debug removal
          break
        case 'combatskills':
          if (!cskl_rem) { break }
          alst[c].remove() // Remove them
          if (remv_log) { logDebug(attr) } // Debug removal
          break
        case 'penaltyskills':
          if (!pskl_rem) { break }
          alst[c].remove() // Remove them
          if (remv_log) { logDebug(attr) } // Debug removal
          break
        case 'perks':
          if (!perk_rem) { break }
          alst[c].remove() // Remove them
          if (remv_log) { logDebug(attr) } // Debug removal
          break
        case 'powers':
          if (!powr_rem) { break }
          alst[c].remove() // Remove them
          if (remv_log) { logDebug(attr) } // Debug removal
          break
        case 'senses':
          if (!snse_rem) { break }
          alst[c].remove() // Remove them
          if (remv_log) { logDebug(attr) } // Debug removal
          break
        case 'skilllevels':
          if (!sklv_rem) { break }
          alst[c].remove() // Remove them
          if (remv_log) { logDebug(attr) } // Debug removal
          break
        case 'skills':
          if (!skil_rem) { break }
          alst[c].remove() // Remove them
          if (remv_log) { logDebug(attr) } // Debug removal
          break
        case 'talents':
          if (!taln_rem) { break }
          alst[c].remove() // Remove them
          if (remv_log) { logDebug(attr) } // Debug removal
          break
        case 'reserves':
          if (!resv_rem) { break }
          alst[c].remove() // Remove them
          if (remv_log) { logDebug(attr) } // Debug removal
          break
        case 'moves':
          if (!move_rem) { break }
          alst[c].remove() // Remove them
          if (remv_log) { logDebug(attr) } // Debug removal
          break
        default:
          sendChat('i6e_API', 'Unhandled repeating element removal: (' + attrtype[1] + ') ' + attr)
          break
      }
    }
  }

  const createOrSetAttr = (atnm, val, mval, cid) => { // Set an individual attribute if it exists, otherwise create it.
    const objToSet = findObjs({ type: 'attribute', characterid: cid, name: atnm })[0]
    if (val === undefined) {
      sendChat('i6e_API', 'Undefined value in set attribute: ' + atnm)
      return
    }
    if (objToSet === undefined) { // If attribute does not exist, create otherwise set current value.
      return createObj('attribute', { name: atnm, current: val, max: mval, characterid: cid })
    } else {
      objToSet.set('current', val)
      objToSet.set('max', mval)
      return objToSet
    }
  }

  const parseAttrMatches = (val) => {
	var reg = /\d{1,3}\s+[a-z ]+/ig
    let result = " "
    var arrAddlAttr = new Array()

    while((result = reg.exec(val)) !== null) {
      var arrSplitResult = result[0].split(" ")
      arrAddlAttr.push(parseInt(arrSplitResult[0]))
      arrAddlAttr.push(arrSplitResult[1])
    }
    return arrAddlAttr
  }

  const createCharacteristics = (stlst, chid) => {
    for (const [key, value] of Object.entries(stlst)) { // Set the characteristics
      let chnm = key + '_base'
      createOrSetAttr(chnm, value.value, '', chid)
      if (/^(end|body|stun)/.test(chnm)) // Handle display values for body, end and stun.
      {
        chnm = key.toUpperCase()
        createOrSetAttr(chnm, value.value, '', chid)
      }
      if (stat_log) { logDebug('Set ' + chnm + ' to ' + value.value) } // Log characteristic assignment
    }
  }

  const createFeatures = (hdj, chid) => {
    // createOrSetAttr("alternate_ids", hdj.,      chid);                         // Future Placeholder
    createOrSetAttr('player_name', hdj.playername, '', chid)
    createOrSetAttr('height', hdj.height, '', chid)
    createOrSetAttr('weight', hdj.weight, '', chid)
    createOrSetAttr('hair', hdj.hair, '', chid)
    createOrSetAttr('eyes', hdj.eye, '', chid)
    createOrSetAttr('appearance', hdj.appearance, '', chid)
    createOrSetAttr('background', hdj.background, '', chid)
    createOrSetAttr('personality', hdj.personality, '', chid)
    createOrSetAttr('quotes', hdj.quote, '', chid)
    createOrSetAttr('tactics', hdj.tactics, '', chid)
    createOrSetAttr('campaign', hdj.campUse, '', chid)
  }

  const createSkills = (sklst, cid) => { // Create all skills
    for (let h = 0; h < sklst.length; h++) { // Loop through HD sheet skills.
      if (sklst[h].type === 'Skill Levels') { continue } // Skill Levels are handled in their own routine
      const uuid = generateUUID().replace(/_/g, 'Z') // Generate a UUID for skill grouping
      const rspre = 'repeating_skills_' + uuid + '_skill_' // Build the string prefix for skill names
      const rsnm = rspre + 'name' // Build the skill name value
      const rshi = rspre + 'has_increase' // Build the has increase name value
      const rshr = rspre + 'has_roll' // Build the has roll name value
      const rsrs = rspre + 'roll_show' // Build the roll show name value
      const rsrt = rspre + 'roll_target' // Build the roll target name value
      const rsch = rspre + 'char' // Build the skill characteristic name value
      const rsin = rspre + 'increase' // Build the skill increase name value
      const rsrf = rspre + 'roll_formula' // Build the roll formula name value
      const hs = sklst[h]
      const targ = hs.roll
      const roll = Number(targ.substring(0, Math.min(targ.length - 1, 2))) // Convert the roll to integer
      let sknm = ''
      const incr = hs.level
      let noch = (hs.char === 'None' ? '' : hs.char)

      switch (hs.type) {
        case 'Defense Maneuver':
          sknm = hs.name + hs.input
          break
        case 'Perception':
          noch = 'INT'
        default:
          sknm = hs.text.trim()
          break
      }

      // Create the skill entries.
      createOrSetAttr(rsnm, sknm, '', cid)
      createOrSetAttr(rshr, !!roll, '', cid)
      createOrSetAttr(rshi, !!incr, '', cid)
      createOrSetAttr(rsin, incr, '', cid)
      if (roll) {
        createOrSetAttr(rsrs, targ, '', cid)
        createOrSetAttr(rsrf, '&{template:hero6template} {{charname=@{character_name}}}  {{action=@{skill_name}}}  {{roll=[[3d6]]}}  {{target=' + roll + '}} {{base=9}} {{stat= ' + roll - 9 + '}} {{lvls=' + incr + '}}', '', cid)
        createOrSetAttr(rsrt, roll, '', cid)
      }
      if (!(/^(GENERAL)/.test(noch) || noch === undefined)) {
        createOrSetAttr(rsch, noch, '', cid)
      }
    }
  }

  // TODO Check with Roll20 users to see if I need to duplicate records where level >1 in HD
  const createSkillLevels = (sllst, cid) => {
    for (let h = 0; h < sllst.length; h++) { // Loop through HD sheet skills.
      if (sllst[h].type !== 'Skill Levels') { continue } // Other skill levels are handled in their own routine
      const uuid = generateUUID().replace(/_/g, 'Z') // Generate a UUID for skill grouping
      const rspre = 'repeating_skilllevels_' + uuid // Build the string prefix for skill names
      const rsnm = rspre + '_skill_level' // Build the skill name value
      const rshi = rspre + '_radio_skill_level' // Build the level name value

      createOrSetAttr(rsnm, sllst[h].name.trim(), '', cid)
      createOrSetAttr(rshi, 0, '', cid)
      if (sklv_log) { logDebug('Set ' + sllst[h].name.trim()) } // Log skill level assignment
    }
  }

  const createSenseRolls = (pwjson, uuid, cid) => {
    // No loops for sense rolls as these are received adhoc in the powers section, so one at a time call.
    const rsnpre = 'repeating_senses_' + uuid // Build the string prefix for senses
    const rsnnm = rsnpre + '_sense_name' // Build the senses name value
    const rsnroll = rsnpre + '_sense_roll_show' // Build the level name value
    rsnformula = rsnpre + '_sense_roll_formula' // Build the level name value

    createOrSetAttr(rsnnm, pwjson.name.trim(), '', cid)
    // TODO Fix the roll and formula, likely will need to pass in or look up the INT from the JSON.
    // createOrSetAttr(rsnroll, "11-", "", cid);
    // createOrSetAttr(rsnformula, "&{template:hero6template} {{charname=@{character_name}}} {{action=HHRP}} {{roll=[[3d6]]}} {{target=11}} {{base=9}} {{stat=2}}", "", cid);

    if (snse_log) { logDebug('Set ' + pwjson.name.trim()) } // Log sense assignment
  }

  const createMovement = (mlst, cid) => {
    if (!mlst) { return } // If movement list is not undefined
    let uuid = '' // UUID for complication grouping
    for (const [key, value] of Object.entries(mlst)) { // Set the movement values
      cmnm = key + '_combat'
      ncnm = key + '_noncombat'
      if (/^(leap)/.test(cmnm)) { // Handle split for leap
        createOrSetAttr('h' + cmnm, value.combat, '', cid)
        createOrSetAttr('h' + ncnm, value.noncombat, '', cid)
        createOrSetAttr('v' + cmnm, value.primary.combat.value / 2 + 'm', '', cid)
        createOrSetAttr('v' + ncnm, value.combat, '', cid)
        if (move_log) { logDebug(cmnm) } // Debug movement
      } else if (/^(run|swim)/.test(cmnm)) { // Handle run, swim (always appear)
        createOrSetAttr(cmnm, value.combat, '', cid)
        createOrSetAttr(ncnm, value.noncombat, '', cid)
        if (move_log) { logDebug(cmnm) } // Debug movement
      } else { // Handle all other cases
        switch (key) { // Create the movement description based on the type
          case 'fly':
            cmnm = 'Flight'
            if (move_log) { logDebug(cmnm) } // Debug movement
            break
          case 'swing':
            cmnm = 'Swinging'
            if (move_log) { logDebug(cmnm) } // Debug movement
            break
          case 'teleport':
            cmnm = 'Teleportation'
            if (move_log) { logDebug(cmnm) } // Debug movement
            break
          case 'tunnel':
            cmnm = 'Tunneling'
            if (move_log) { logDebug(cmnm) } // Debug movement
            break
          default:
            sendChat('i6e_API', 'Unhandled repeating element movement: (' + key + ') ' + value.combat)
            break
        }
        uuid = generateUUID().replace(/_/g, 'Z') // Generate a UUID for complication grouping
        mvnm = 'repeating_moves_' + uuid + '_spec_move_name' // Build the movement repeating name
        mvcb = 'repeating_moves_' + uuid + '_spec_move_combat' // Build the combat repeating name
        mvnc = 'repeating_moves_' + uuid + '_spec_move_noncombat' // Build the noncombat repeating name
        createOrSetAttr(mvnm, cmnm, '', cid)
        createOrSetAttr(mvcb, value.combat, '', cid)
        createOrSetAttr(mvnc, value.noncombat, '', cid)
      }
    }
  }

  const createCombatLevels = (cllst, cid) => {
    let ccb = ''
    let rocv = ''
    let romv = ''
    let rdcv = ''
    let rdmv = ''
    let rdc = ''
    let clnm = ''

    // Create all combat skill levels
    for (let cl = 0; cl < cllst.length; cl++) { // Loop through combat skill levels
      const hcs = cllst[cl] // Get combat skill level JSON attribute
      if (!(/^(Combat Skill Levels)/.test(hcs.name))) { continue } // Only process Combat Skill Levels
      uuid = generateUUID().replace(/_/g, 'Z') // Generate a UUID for complication grouping
      clnm = 'repeating_combatskills_' + uuid + '_csl_name' // Build the combat level repeating name
      ccb = 'repeating_combatskills_' + uuid + '_csl_checkbox'
      rocv = 'repeating_combatskills_' + uuid + '_radio_csl_ocv'
      romv = 'repeating_combatskills_' + uuid + '_radio_csl_omcv'
      rdcv = 'repeating_combatskills_' + uuid + '_radio_csl_dcv'
      rdmv = 'repeating_combatskills_' + uuid + '_radio_csl_dmcv'
      rdc = 'repeating_combatskills_' + uuid + '_radio_csl_dc'
      createOrSetAttr(clnm, hcs.text, '', cid)
      createOrSetAttr(ccb, 0, '', cid)
      createOrSetAttr(rocv, 0, '', cid)
      createOrSetAttr(romv, 0, '', cid)
      createOrSetAttr(rdcv, 0, '', cid)
      createOrSetAttr(rdmv, 0, '', cid)
      createOrSetAttr(rdc, 0, '', cid)
      if (cskl_log) { logDebug('Set ' + hcs.name) } // Log skill level assignment
    }
  }

  const createPenaltyLevels = (plst, cid) => {
    let pcb = ''
    let rocv = ''
    let rmod = ''
    let rdcv = ''
    let psnm = ''

    for (let p = 0; p < plst.length; p++) { // Loop through Skills
      const hps = plst[p] // Get skill JSON attribute
      if (!(/^(Penalty Skill Levels)/.test(hps.name))) { continue } // Only process Penalty Skill Levels
      uuid = generateUUID().replace(/_/g, 'Z') // Generate a UUID for penalty skill grouping
      psnm = 'repeating_penaltyskills_' + uuid + '_psl_name' // Build the penalty skill repeating name
      pcb =  'repeating_penaltyskills_' + uuid + '_psl_checkbox'
      rocv = 'repeating_penaltyskills_' + uuid + '_radio_psl_'
      rdcv = 'repeating_penaltyskills_' + uuid + '_radio_psl_'
      rmod = 'repeating_penaltyskills_' + uuid + '_radio_psl_'
      createOrSetAttr(psnm, hps.text, '', cid)
      createOrSetAttr(pcb, 0, '', cid)
      // TODO Use OptionID to set appropriate flags for ocv, dcv, rmod Example:SINGLEDCV
      createOrSetAttr(rocv, 0, '', cid)
      createOrSetAttr(rmod, 0, '', cid)
      createOrSetAttr(rdcv, (/^(SINGLEDCV)/.test(hps.optionID)), '', cid)
      if (pnsk_log) { logDebug('Set ' + hps.text) } // Log penalty skill level assignment
    }
  }

  const createComplications = (clst, cid) => {
    let rcap = '' // Complication cost name
    let rcnm = '' // Complication name
    let compnm = '' // Complication description
    let ad1 = '' // Complication adder 1
    let ad2 = '' // Complication adder 2
    let ad3 = '' // Complication adder 3
    let ad4 = '' // Complication adder 4
    let ad5 = '' // Complication adder 5
    let md1 = '' // Complication modifier 1
    let md2 = '' // Complication modifier 2
    let md3 = '' // Complication modifier 3
    let uuid = ''

    // Create all complications
    for (let c = 0; c < clst.length; c++) { // Loop through complications
      const hc = clst[c] // Get complication JSON attribute
      uuid = generateUUID().replace(/_/g, 'Z') // Generate a UUID for complication grouping
      rcnm = 'repeating_complications_' + uuid + '_complication' // Build the complication repeating name
      rcap = rcnm + '_cost'
      if (hc.adders[4]) { // Populate 5 adders
        ad5 = hc.adders[4].input
        ad4 = hc.adders[3].input
        ad3 = hc.adders[2].input
        ad2 = hc.adders[1].input
        ad1 = hc.adders[0].input
      } else if (hc.adders[3]) { // Populate first 4 adders
        ad4 = hc.adders[3].input
        ad3 = hc.adders[2].input
        ad2 = hc.adders[1].input
        ad1 = hc.adders[0].input
      } else if (hc.adders[2]) { // Populate first 3 adders
        ad3 = hc.adders[2].input
        ad2 = hc.adders[1].input
        ad1 = hc.adders[0].input
      } else if (hc.adders[1]) { // Populate first 2 adders
        ad2 = hc.adders[1].input
        ad1 = hc.adders[0].input
      } else if (hc.adders[0]) { // Populate 1st adder
        ad1 = hc.adders[0].input
      }

      if (hc.modifiers[2] !== undefined) { // Populate 3 modifiers
        md3 = hc.modifiers[2].input
        md2 = hc.modifiers[1].input
        md1 = hc.modifiers[0].input
      } else if (hc.modifiers[1] !== undefined) { // Populate 2 modifiers
        md2 = hc.modifiers[1].input
        md1 = hc.modifiers[0].input
      } else if (hc.modifiers[0] !== undefined) { // Populate 1 modifier
        md1 = hc.modifiers[0].input
      }

      switch (hc.XMLID) { // Create the complication description based on the type
        case 'ACCIDENTALCHANGE': // Accidental Change
          compnm = 'Acc Chg: ' + hc.input + ', ' + ad1 + ', ' + ad2
          break
        case 'DEPENDENCE': // Dependence
          compnm = 'Dep: ' + hc.input + ', ' + ad1 + ' / ' + ad3 + ', ' + ad2
          break
        case 'DEPENDENTNPC': // Dependent NPC
          compnm = 'DNPC: ' + hc.input + ', ' + ad1 + ', ' + ad2 + ', ' + ad3
          break
        case 'DISTINCTIVEFEATURES': // Distinctive Features
          compnm = 'DF: ' + hc.input + ', ' + ad1 + ', ' + ad2 + ', ' + ad3
          break
        case 'ENRAGED': // Enraged
          compnm = 'Enraged: ' + hc.input + ', ' + ad2 + ', ' + ad3 + ', ' + ad1
          break
        case 'GENERICDISADVANTAGE': // Custom - manually fill in
          compnm = 'Populate Custom Complication Here'
          break
        case 'HUNTED': // Hunted
          compnm = 'Hunted: ' + hc.input + ' (' + ad1 + ', ' + ad2 + ', ' + ad3 + ')'
          break
        case 'PHYSICALLIMITATION': // Physical Complication
          compnm = 'Phys Comp: ' + hc.input + ', ' + ad1 + ', ' + ad2 + ', ' + ad3
          break
        case 'PSYCHOLOGICALLIMITATION': // Psychological Complication
          compnm = 'Psy Comp: ' + hc.input + ', ' + ad1 + ', ' + ad2 + ', ' + ad3
          break
        case 'RIVALRY': // Negative Reputation
          compnm = 'Rival: ' + ad2 + ' (' + ad1 + ', ' + ad3 + ', ' + ad4 + ', ' + ad5
          break
        case 'REPUTATION': // Negative Reputation
          compnm = 'Neg Rep: ' + hc.input + ', ' + ad1 + ', ' + ad2 + ', ' + ad3
          break
        case 'SOCIALLIMITATION': // Social Complication
          compnm = 'Soc Comp: ' + hc.input + ', ' + ad1 + ', ' + ad2 + ', ' + ad3
          break
        case 'SUSCEPTIBILITY': // Susceptiblity
          compnm = 'Susc: ' + hc.input + '(' + ad1 + ' ' + ad2 + ')'
          break
          // TODO Check the various combinations and combine cases if possible.
        case 'UNLUCK': // Unluck
          compnm = name
          break
        case 'VULNERABILITY': // Vulnerability
          compnm = 'Vuln: ' + hc.input + ' - ' + md1 + ' (' + ad1 + ')'
          break
        default:
          sendChat('i6e_API', 'Unhandled complication type: ' + hc.XMLID)
          break
      }
      // TODO make abbreviations optional
      compnm = compnm.replace(/[,\s]+$/g, '') // Trim trailing comma and space as needed
        .replace('As Powerful', 'AsPow') // Abbreviate As Powerful
        .replace('Common', 'Com') // Abbreviate Common
        .replace('Frequently', 'Freq') // Abbreviate Frequent
        .replace('Infrequently', 'Infreq') // Abbreviate Infrequent
        .replace('Less Powerful', 'LessPow') // Abbreviate Less Powerful
        .replace('Major', 'Maj') // Abbreviate Major
        .replace('Moderate', 'Mod') // Abbreviate Moderate
        .replace('More Powerful', 'MoPow') // Abbreviate More Powerful
        .replace('Professional', 'Prof.') // Abbreviate Professional
        .replace('Rival Aware of Rivalry', 'Aware') // Abbreviate Rival wording
        .replace('Rival is', '') // Remove Rival wording (redundant)
        .replace('Rival Unaware of Rivalry', 'Unaware') // Abbreviate Rival wording
        .replace('Romantic', 'Rom.') // Abbreviate Romantic
        .replace('Seek to Harm or Kill Rival', 'Harm/Kill') // Shorten Seek to Harm or Kill
        .replace('Seek to Outdo, Embarrass or Humiliate Rival', 'Outdo/Emb.') // Shorten Seek Outdo
        .replace('Slightly', 'Slight') // Abbreviate Slightly
        .replace('Strong', 'Str') // Abbreviate Strong
        .replace('Total', 'Tot') // Abbreviate Total
        .replace('Uncommon', 'Unc') // Abbreviate Uncommon
        .replace('Very Common', 'VC') // Abbreviate Very Common

      createOrSetAttr(rcap, hc.active, '', cid) // Assign the complication cost
      createOrSetAttr(rcnm, compnm, '', cid) // Assign the complication name
    }
  }

  const createReserve = (resnm, amt, cid) => {
    let rrnm = ''
    let rre = ''
    uuid = generateUUID().replace(/_/g, 'Z') // Generate a UUID for penalty skill grouping
    rrnm = 'repeating_reserves_' + uuid + '_reserve_name' // Build the penalty skill repeating name
    rre = 'repeating_reserves_' + uuid + '_reserve_end'
    createOrSetAttr(rrnm, resnm, '', cid)
    createOrSetAttr(rre, amt, amt, cid)
    if (resv_log) { logDebug('Set ' + resnm + ' to ' + amt) } // Log penalty skill level assignment
  }

  // Calculate the power modifiers (Advantages / Limitations) and endurance modifiers for a power
  const figurePowerMod = (modf, calc, endf) => {
    let lval = 0
    let aval = 0
    let rend = 1.0 // Set return end to 1 by default
    const rsrr = 0
    let mset = 0 // Flag to determine if a modifier set the rend
    let chgs = 0
    let val = ''

    if (endf === 0) { // If the power does not cost END by default
      rend = 0 // Set return to 0 to start
      if (!modf.length) { // If there are no modifiers
        rend = 'no cost'
        mset = 1
      }
    }

    modf.forEach(m => { // Loop all modifiers
      val = m.value
      val = val.replace('ï¿½', '.75') // Substitue decimals for fractions
        .replace('ï¿½', '.5')
        .replace('ï¿½', '.25')
        .replace(/[^\x00-\xBF]+/g, '')

      if (val.substring(0, 1) === '-') { lval = lval + parseFloat(val) } // Add to limitations
      if (val.substring(0, 1) === '+') { aval = aval + parseFloat(val) } // Add to advantages
      if (m.type === 'Reduced Endurance') {
        if (m.input === 'Half END') { // Set to half endurance cost
          rend = 0.5
          mset = 1
        } else if (m.input === '0 END') { // Set to zero endurance cost
          rend = 0
          mset = 1
        }
      } else if (m.type === 'Increased Endurance Cost') {
        rend = parseInt(m.input.substring(1, 3).trim()) // Set to increased endurance cost
        mset = 1
      } else if (m.type === 'Costs Endurance') { // Handle limitations that add endurance cost
	    if (m.input === 'Costs Half Endurance') {
          rend = 0.5
          mset = 1
        } else { // Set to normal endurance cost
          rend = 1.0
          mset = 1
        }
      } else if (m.type === 'Charges') {
        chgs = m.input
	  }

      // TODO handle rsr figures, need HD examples
    })

    // If the power costs no end naturally and was not set by a modifier,
    // set to no cost
    if (mset === 0 && rend === 0) {
      rend = 'no cost'
    }

    switch (calc) {
      case 'lim': // Figure limitation value
        if(isNaN(lval)){lval=0}
        return lval * -1
      case 'adv': // Figure advantage value
        if(isNaN(aval)){aval=0}
        return aval
      case 'end': // Figure endurance multiplier
        return rend
      case 'rsr': // Figure skill roll
        return rsrr
      case 'chg': // Figure charges
        return chgs
      default: // Unknown calculation
        return sendChat('i6e_API', 'Unknown calculation value: ' + calc)
    }
  }

  const createSimplePower = (pwjson, uuid, cid) => {
    let pwnm = ''
    let pwdesc = ''
    let end = 0 // Store endurance as a number
    let ap = 0 // Store active points as a number
    let bp = 0 // Store base points as a number
    let rp = 0 // Store real points as a number
    const hclas = pwjson.class
    const rppre = 'repeating_powers_' + uuid // Build the string prefix for power labels
    const rppow = rppre + '_power'
    const rpnm = rppre + '_power_name' // Build the power name label
    const rppf = rppre + '_use_power_formula' // Build the power formula label
    const rppf2 = rppre + '_use_power2_formula' // Build the 2nd power formula label
    const rpec = rppre + '_power_end_cost' // Build the power end cost label
    const rpea = rppre + '_power_end_ap_cost' // Build the power ap end cost label
    const rpes = rppre + '_power_end_str_cost' // Build the power str end cost label
    const rprc = rppre + '_power_remaining_charges' // Build the power remaining charges / end label
    const rppe = rppre + '_power_expand'
    const rppat = rppre + '_pow_attack' // Is this power a pre-selected attack option?
    const rpbp = rppre + '_pow_base_points'
    const rpap = rppre + '_pow_active_points'
    const rpan = rppre + '_pow_active_points_no_reduced_end'
    const rprp = rppre + '_pow_real_points'
    const rprl = rppre + '_power_real_cost'
    const rpbd = rppre + '_attack_base_dice'
    const rpbs = rppre + '_attack_base_dice_show'
    const rpsd = rppre + '_attack_str_dice'
    const rpss = rppre + '_attack_str_dice_show'
    const rpse = rppre + '_attack_str_for_end'
    const rpmd = rppre + '_attack_maneuver_dice_show'
    const rpcd = rppre + '_attack_csl_dice_show'
    const rpac = rppre + '_attack_cv'
    const rped = rppre + '_attack_extra_dice'
    const rpds = rppre + '_attack_extra_dice_show'
    const rpad = rppre + '_attack_dice'
    const rpas = rppre + '_attack_dice_show'
    const rppn = rppre + '_pow_advantages_no_reduced_end'
    const rppa = rppre + '_pow_advantages'
    const rppl = rppre + '_pow_limitations'
    const rpem = rppre + '_end_multiplier'
    const rpps = rppre + '_power_end_source'
    const rpaus = rppre + '_attack_uses_str'
    const rpaw = rppre + '_attack_wizard'
    const rpadc = rppre + '_attack_die_cost'
    const rpatt = rppre + '_attack_type'
    const rpatk = rppre + '_attack_killing'
    const rpahl = rppre + '_attack_hit_location'
    const rppft = rppre + '_pow_frame_type' // Power Framework type
    const rppfn = rppre + '_pow_framework_name' // Power framework name
    const rppef = rppre + '_power_end_fixed' // Fixed END value for Charges and Reserves
    const rpper = rppre + '_power_end_reserve_name' // Name of Reserve for Charges and Reserves
    const rppan1 = rppre + '_pow_add_name1' // Name of attribute added to by primary power
    const rppab1 = rppre + '_pow_add_bonus1' // Value of attribute added to by primary power
    const rppan2 = rppre + '_pow_add_name2' // Name of attribute added to by primary power
    const rppab2 = rppre + '_pow_add_bonus2' // Value of attribute added to by primary power
    const rppan3 = rppre + '_pow_add_name3' // Name of attribute added to by primary power
    const rppab3 = rppre + '_pow_add_bonus3' // Value of attribute added to by primary power
    const rppan4 = rppre + '_pow_add_name4' // Name of attribute added to by primary power
    const rppab4 = rppre + '_pow_add_bonus4' // Value of attribute added to by primary power
    const pwtype = pwjson.type.trim() // Power type
    const xmlid = pwjson.XMLID
    const pwlvl = pwjson.level
    let pwsn = '' // Power short name (no prefix)
    let lim = 0.0 // Base power limitation value (without list of framework lims)
    let adv = 0.0 // Base power advantage value (without list of framework lims)
    let endm = 1 // Endurance multiplier
    let ocv = getAttrByName(cid, 'ocv')
    let mocv = getAttrByName(cid, 'omcv')
    let zero = 0
    let ka = 0 // Killing attack flag (1 for RKA, HKA)
    let wiz = 0 // Does this power use the wiard for die calculation
    let cvtyp = '' // Combat Value Type (OCV or OMCV)
    let coste = 0 // Whether the power costs end or not by default
    let adc = 0 // Attack die cost (CP per die of power)
    let att = ''
    let wizc = ''
    let hl = 0 // Power uses hit locations
    let chg = 0 // Number of charges for the power
    let strbs = 0 // Power uses strength as a basis
    var arrEnhance = new Array()

    if (isNaN(pwjson.end) || pwjson.end === '') { end = 0 } else { end = parseInt(pwjson.end) }
    if (isNaN(pwjson.active)) { ap = 0 } else { ap = parseInt(pwjson.active) }
    if (isNaN(pwjson.base)) { bp = 0 } else { bp = parseInt(pwjson.base) }

    if (pwjson.desc === undefined) {
      sendChat('i6e_API', 'Power has undefined description, JSON template version is incorrect: ' + pwnm)
    } else {
      pwdesc = pwjson.desc.replace(/[^\x00-\xBF]+/g, '')
    }
    if (pwjson.name.trim() === 'No Name Supplied') {
      pwnm = pwjson.prefix + pwtype
      pwsn = pwtype
    } else {
	  if (pwjson.prefix === undefined) {
	    pwnm = pwjson.name.trim()
        pwsn = pwjson.name.trim()
      } else {
	    pwnm = pwjson.prefix + pwjson.name.trim()
        pwsn = pwjson.name.trim()
      }
    }

    if (pwjson.prefix === '' && pwjson.framework === '') {
	  pft = ''
    }

    // Create the power entries. Reordered to correct order for sheet macro to read.
    createOrSetAttr(rpnm, pwnm, '', cid) // Assign the power name
    switch (xmlid) {
    // Handle Effect powers
      case 'AID':
        adc = 6
        coste = 1
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}} {{description=' + pwdesc + '}}', '', cid)
        att = 'Effect'
        wiz = 1
        cvtyp = 'OCV'
        break
      case 'DISPEL':
        adc = 3
        coste = 1
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}} {{description=' + pwdesc + '}}', '', cid)
        att = 'Effect'
        wiz = 1
        cvtyp = 'OCV'
        break
      case 'DRAIN':
        adc = 10
        coste = 1
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}} {{description=' + pwdesc + '}}', '', cid)
        att = 'Effect'
        wiz = 1
        cvtyp = 'OCV'
        break
      case 'HEALING':
        adc = 10
        coste = 1
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}} {{description=' + pwdesc + '}}', '', cid)
        att = 'Effect'
        wiz = 1
        cvtyp = 'OCV'
        break
      case 'TRANSFORM':
// TODO ** ParseAttribute Figure out a way to determine Transform Severity to set Active Die Cost
        coste = 1
        adc = bp / pwlvl
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}} {{description=' + pwdesc + '}}', '', cid)
        att = 'Effect'
        wiz = 1
        cvtyp = 'OCV'
        break
        // Handle Body Die Roll powers
      case 'ENTANGLE':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Die Rolls}} {{count=BODY}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Die Rolls}} {{count=BODY}}{{description=' + pwdesc + '}}', '', cid)
        att = 'BODY only'
        adc = 10
        wiz = 1
        coste = 1
        cvtyp = 'OCV'
        break
      case 'FLASH':
        // TODO Figure out a way to determine targetting or non to set Active Die Cost
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Die Rolls}} {{count=BODY}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Die Rolls}} {{count=BODY}}{{description=' + pwdesc + '}}', '', cid)
        att = 'BODY only'
        adc = 5
        wiz = 1
        coste = 1
        cvtyp = 'OCV'
        break
        // Handle attack roll only power
      case 'DARKNESS':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}} {{count=BODY}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}} {{count=BODY}}{{description=' + pwdesc + '}}', '', cid)
        coste = 1
        cvtyp = 'OCV'
        break
      case 'ENERGYBLAST':
        adc = 5
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}} {{count=BODY}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}} {{count=BODY}}{{description=' + pwdesc + '}}', '', cid)
        wiz = 1
        att = 'STUN & BODY'
        coste = 1
        cvtyp = 'OCV'
        break
      case 'HANDTOHANDATTACK':
        strbs = 1
        adc = 5
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}} {{count=BODY}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}} {{count=BODY}}{{description=' + pwdesc + '}}', '', cid)
        wiz = 1
        att = 'STUN & BODY'
        coste = 1
        cvtyp = 'OCV'
        break
      case 'STR':
        strbs = 1
        adc = 5
        createOrSetAttr(rppan1, 'STR', '', cid)
        createOrSetAttr(rppab1, pwjson.base, '', cid)
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}} {{count=BODY}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}} {{count=BODY}}{{description=' + pwdesc + '}}', '', cid)
        wiz = 1
        att = 'STUN & BODY'
        coste = 1
        cvtyp = 'OCV'
        break
        // Handle Killing Attack powers
      case 'HKA':
        strbs = 1
      case 'RKA':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{killing=1}} {{type=BODY}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{killing=1}} {{type=BODY}}{{description=' + pwdesc + '}}', '', cid)
        adc = 15
        ka = 1
        hl = 1
        wiz = 1
        coste = 1
        att = 'BODY'
        cvtyp = 'OCV'
        break
        // Handle Luck powers
      case 'LUCK':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{damage=[[' + pwjson.damage + ']]}} {{type=Die Rolls}} {{count=Luck}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{damage=[[' + pwjson.damage + ']]}} {{type=Die Rolls}} {{count=Luck}}{{description=' + pwdesc + '}}', '', cid)
        att = 'Luck'
        adc = 5
        wiz = 1
        break
        // Handle Ego Attack powers
      case 'EGOATTACK':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{ocv=' + mocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{ocv=' + mocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}}{{description=' + pwdesc + '}}', '', cid)
        adc = 10
        wiz = 1
        att = 'STUN'
        coste = 1
        cvtyp = 'OMCV'
        break
        // Handle Mental Effect powers
      case 'MENTALILLUSIONS':
      case 'MINDCONTROL':
      case 'MINDSCAN':
      case 'TELEPATHY':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{ocv=' + mocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{ocv=' + mocv + '}} {{attack=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=Effect}}{{description=' + pwdesc + '}}', '', cid)
        att = 'Effect'
        coste = 1
        cvtyp = 'OMCV'
        adc = 5
        wiz = 1
        break
      case 'TELEKINESIS':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}} {{count=BODY}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}  {{base=' + ocv + '}} {{ocv=' + ocv + '}} {{attack=[[3d6]]}} {{hitlocation=[[3d6]]}} {{damage=[[' + pwjson.damage + ']]}} {{type=STUN}} {{count=BODY}}{{description=' + pwdesc + '}}', '', cid)
        att = 'STUN & BODY'
        coste = 1
        cvtyp = 'OCV'
        break
        // Handle Misc powers (cost 0 END default)
        //        case "ABSORPTION": check spelling
      case 'ARMOR':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        break
      case 'BODY':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'BODY', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'CLINGING':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        break
      case 'COMBAT_LEVELS':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        break
      case 'CON':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'CON', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'DAMAGENEGATION':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        break
      case 'DCV':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'DCV', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'DEX':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'DEX', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'DMCV':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'DMCV', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'ED':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'ED', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'EGO':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'EGO', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'END':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'END', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'FLASHDEFENSE':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'Flash Defense', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'FORCEFIELD':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        arrEnhance.length = 0
        arrEnhance = parseAttrMatches(pwdesc)
        var i = 0;
        var k = 0;
        for(i = 1; i < 8; i += 2) {
          k++
          switch (arrEnhance[i]) { // Handle 1st attribute enchancement
            case 'PD':
              createOrSetAttr(eval('rppan' + k), 'rPD', '', cid)
              createOrSetAttr(eval('rppab' + k), arrEnhance[i-1], '', cid)
              break
            case 'ED':
              createOrSetAttr(eval('rppan' + k), 'rED', '', cid)
              createOrSetAttr(eval('rppab' + k), arrEnhance[i-1], '', cid)
              break
            case 'Flash':
              createOrSetAttr(eval('rppan' + k), 'Flash Defense', '', cid)
              createOrSetAttr(eval('rppab' + k), arrEnhance[i-1], '', cid)
              break
            case 'Mental':
              createOrSetAttr(eval('rppan' + k), 'Mental Defense', '', cid)
              createOrSetAttr(eval('rppab' + k), arrEnhance[i-1], '', cid)
              break
            case 'Power':
              createOrSetAttr(eval('rppan' + k), 'Power Defense', '', cid)
              createOrSetAttr(eval('rppab' + k), arrEnhance[i-1], '', cid)
              break
            case 'Active':
            case 'END':
            case 'kg':
            case 'Real':
              break
            default:
              sendChat('i6e_API', 'Unhandled Enhancement type ' + k + ': ' + arrEnhance[i] + ' in ForceField.')
              break
  	      }
        }
        break
      case 'INT':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'INT', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'KBRESISTANCE':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        break
      case 'LIFESUPPORT':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        break
      case 'MENTALDEFENSE':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'Mental Defense', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'OCV':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'OCV', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'OMCV':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'OMCV', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'PD':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'PD', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'POWERDEFENSE':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'Power Defense', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'PRE':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'PRE', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'REC':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'REC', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'REGENERATION':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        break
      case 'SPD':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'SPD', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
      case 'STUN':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'STUN', '', cid)
        createOrSetAttr(rppab1, pwjson.level, '', cid)
        break
        // Handle Misc powers (cost END default)
      case 'DENSITYINCREASE':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        arrEnhance.length = 0
        arrEnhance = parseAttrMatches(pwdesc)
        var i = 0;
        var k = 1;
        for(i = 1; i < 8; i += 2) {
          switch (arrEnhance[i]) { // Handle 1st attribute enchancement
            case 'PD':
              createOrSetAttr(eval('rppan' + k), 'PD', '', cid)
              createOrSetAttr(eval('rppab' + k), arrEnhance[i-1], '', cid)
              createOrSetAttr(eval('rppan' + k+1), 'ED', '', cid)
              createOrSetAttr(eval('rppab' + k+1), arrEnhance[i+1], '', cid)
              i += 2
              k += 2
              break
            case 'STR':
              createOrSetAttr(eval('rppan' + k), 'STR', '', cid)
              createOrSetAttr(eval('rppab' + k), arrEnhance[i-1], '', cid)
              k++
              break
            case 'Active':
            case 'END':
            case 'kg':
            case 'Real':
              break
            default:
              sendChat('i6e_API', 'Unhandled Enhancement type ' + k + ': ' + arrEnhance[i] + ' in ForceField.')
              break
  	      }
          if(k >= 5) {break}
        }
        coste = 1
        break
      case 'GROWTH':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        createOrSetAttr(rppan1, 'STR', '', cid)
        createOrSetAttr(rppab1, pwjson.base * 3 / 5, '', cid)
        createOrSetAttr(rppan2, 'PD', '', cid)
        createOrSetAttr(rppab2, pwjson.base / 25 * 3, '', cid)
        createOrSetAttr(rppan3, 'ED', '', cid)
        createOrSetAttr(rppab3, pwjson.base / 25 * 3, '', cid)
        createOrSetAttr(rppan4, 'CON', '', cid)
        createOrSetAttr(rppab4, pwjson.base / 5, '', cid)
        coste = 1
        break
      case 'CHANGEENVIRONMENT':
      case 'FLIGHT':
      case 'FORCEWALL':
      case 'IMAGES':
      case 'INVISIBILITY':
      case 'RUNNING':
      case 'LEAPING':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        coste = 1
        break
        // Handle Senses
      case 'HRRP':
      case 'INFRAREDPERCEPTION':
      case 'NIGHTVISION':
        createSenseRolls(pwjson, uuid, cid)
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        break
        // Handle END Reserves
      case 'ENDURANCERESERVE':
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        sendChat('i6e_API', 'END Reserves in BETA, check reserve: ' + pwnm)
        // Parse END and REC from description
        // chg = pwjson.end.replace(/\[*\]*/g, '');                                 // Calculate max charges
        createReserve('R_' + pwnm, chg, cid) // Create the charge Pool
        endm = 'no cost'
        break
        // Handle Frameworks
      case 'GENERIC_OBJECT':
        if (pwjson.framework !== '') {
          hl = 0
          wiz = 0
          endm = 'no cost'
          pfn = pwnm
          pft = pwjson.framework

          // Frameworks can have advantages and limitations that carry to all entries. Store them for later use.
          lav = adv
          llv = lim
        }
        break
        // Handle everything that falls through
      default:
        createOrSetAttr(rppf, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}}', '', cid)
        createOrSetAttr(rppf2, '&{template:hero6template} {{charname=@{character_name}}} {{power=' + pwnm + '}} {{description=' + pwdesc + '}}', '', cid) // Assign the power name
        sendChat('i6e_API', 'Defaulted Power Type: ' + xmlid)
        hl = 0
        wiz = 0
        break
    }

    // Calculate limitation, advantages and endurance multipliers
    if (pwjson.modifiers.length) {
      lim = figurePowerMod(pwjson.modifiers, 'lim', coste)
      adv = figurePowerMod(pwjson.modifiers, 'adv', coste)
      chg = figurePowerMod(pwjson.modifiers, 'chg', coste)
    }

    if (chg !== 0) { coste = 0 } // If the power has charges, reset the costs endurance default to no.
    endm = figurePowerMod(pwjson.modifiers, 'end', coste)

    if (powr_log) { logDebug(xmlid + ' Lim,Adv,Chg,Endm: ' + lim + ', ' + adv + ', ' + chg + ', ' + endm) }

    createOrSetAttr(rppow, pwdesc, '', cid) // Assign the power description
    createOrSetAttr(rpbp, pwjson.base, '', cid) // Assign base points (string)
    createOrSetAttr(rppa, adv, '', cid) // Power advantage total
    createOrSetAttr(rpap, ap, '', cid) // Assign active points (number)
    createOrSetAttr(rpan, parseInt(pwjson.base) * adv, '', cid) // Active Points without reduced end
    createOrSetAttr(rppl, lim, '', cid) // Power limitation total

    if (pft !== '' && pft !== 'n/a') { // Set up framework attributes
	  if (pft === 'MP') {
        createOrSetAttr(rppft, 'Multipower Pool', '', cid)
      } else if (pft === 'VPP') {
        createOrSetAttr(rppft, 'Variable Power Pool', '', cid)
      }
      createOrSetAttr(rppfn, pwnm, '', cid)
    }

    if (endm === 0) {
      createOrSetAttr(rppn, adv - (0.5), '', cid) // Power advantage total without Reduced End
    } else if (endm === 0.5) {
      createOrSetAttr(rppn, adv - (0.25), '', cid) // Power advantage total without Reduced End
    } else {
      createOrSetAttr(rppn, adv, '', cid) // Power advantage total
    }

    // Use case: Absorption, Cannot be stunned, Clinging, etc.
    // Also Lim: Costs 1/2 END
    if (endm === 1) { // Set Endurance Multiplier
      coste = 1
      createOrSetAttr(rpem, '1x END', '', cid)
    } else if (endm === 0) {
      coste = 0
      createOrSetAttr(rpem, '0 END', '', cid)
    } else if (endm === 0.5) {
      coste = 1
      createOrSetAttr(rpem, 'ï¿½ END', '', cid)
    } else if (endm === 'no cost') {
      coste = 0
      createOrSetAttr(rpem, 'no cost', '', cid)
    } else if (endm > 1) {
      coste = 1
      createOrSetAttr(rpem, 'Costs ' + endm + 'x', '', cid)
    }

    if (chg !== 0) {
      sendChat('i6e_API', 'Charges in BETA, check power: ' + pwnm)
      createReserve('C_' + pwsn, chg, cid) // Create the charge Pool
      createOrSetAttr(rpper, 'C_' + pwsn, '', cid) // Set the charge pool name
      createOrSetAttr(rppef, '1', '', cid) // Set charges per use to 1
      createOrSetAttr(rprc, chg, '', cid) // Endurance Cost - Remaining Charges (string)
    }

    // Assign Endurance Source
    if (chg === 0 && coste === 0) {
      createOrSetAttr(rpps, 'none', '', cid) // Set Endurance Source to none
    }
    if (chg !== 0 && coste !== 0) {
      createOrSetAttr(rpps, 'Both', '', cid) // Set Endurance Source to Both
    }
    if (chg !== 0 && coste === 0) {
      createOrSetAttr(rpps, 'Reserve', '', cid) // Set Endurance Source to Reserve
    }
    if (chg === 0 && coste !== 0) {
      createOrSetAttr(rpps, 'END', '', cid) // Set Endurance Source to END
    }

    // Set the slot types for MP and VPP
    if (pwjson.prefix !== '' && pft !== 'n/a') {
	  adv = adv + lav // Add list advantage to list items
	  lim = lim + llv // Add list limitation to list items
	  if (pft === 'MP') {
        createOrSetAttr(rppfn, pfn, '', cid)
        if (/^\d*f/.test(pwjson.real)) // Test to see if the cost ends in f.
        {
          createOrSetAttr(rppft, 'MP Slot, fixed', '', cid)
        } else {
          createOrSetAttr(rppft, 'MP Slot, variable', '', cid)
        }
      }
	  if (pft === 'VPP') {
        createOrSetAttr(rppfn, pfn, '', cid)
        createOrSetAttr(rppft, 'VPP Slot', '', cid)
      }
    }

    // TODO: Check if this is needed? Does the sheet calculate it?
    // Calculate real points from AP and Limitations.
    if (ap !== 0) {
      rp = ap / (1 + lim)
      dec = rp - Math.floor(rp)
      if (dec > 0.5) { rp = Math.ceil(rp) } else { rp = Math.floor(rp) }; // Round the real points
    }

    //    createOrSetAttr(rpec,  pwjson.end, "", cid);                               // Endurance Cost (string)
    //    createOrSetAttr(rpea,  end, "", cid);                                      // Endurance Cost - AP (number)
    //    createOrSetAttr(rpes,  zero, "", cid);                                     // Endurance Cost - STR (number)

    createOrSetAttr(rppe, zero, '', cid) // FLAG: Is power wizard expanded?
    wizc = wiz.toString()
    createOrSetAttr(rppat, wizc, '', cid) // FLAG: Is power preselected attack option
    createOrSetAttr(rpbd, pwjson.damage, '', cid) // Base dice
    createOrSetAttr(rpbs, pwjson.damage, '', cid) // Base dice show
    createOrSetAttr(rprp, rp, '', cid) // Real Points
    // Calculated by sheet?
    // createOrSetAttr(rprl,  pwjson.real, "", cid);                            // Real Cost
    createOrSetAttr(rpsd, ' ', '', cid) // Strength dice
    createOrSetAttr(rpss, ' ', '', cid) // Strength dice show
    createOrSetAttr(rpse, zero, '', cid) // STR for END
    createOrSetAttr(rpmd, ' ', '', cid) // Attack Maneuver dice show
    createOrSetAttr(rpcd, ' ', '', cid) // CSL dice show
    createOrSetAttr(rped, ' ', '', cid) // Extra dice
    createOrSetAttr(rpds, ' ', '', cid) // Extra dice show
    createOrSetAttr(rpad, pwjson.damage, '', cid) // Attack dice
    createOrSetAttr(rpas, pwjson.damage, '', cid) // Attack dice show

    if (wiz) {
      createOrSetAttr(rpaus, strbs, '', cid)
      createOrSetAttr(rpaw, '', '', cid)
      // TODO: Figure out how to set.
      //          createOrSetAttr(rpatt, , "", cid);
      createOrSetAttr(rpatk, ka, '', cid)
      createOrSetAttr(rpac, cvtyp, '', cid)
      createOrSetAttr(rpadc, adc, '', cid)
      createOrSetAttr(rpahl, hl, '', cid)
    }
}

  const createPerks = (plst, cid) => {
    let pknm = ''
    // Create all perks
    for (let p = 0; p < plst.length; p++) // Loop through HD sheet powers
    {
      UUID = generateUUID().replace(/_/g, 'Z') // Generate a UUID for perk grouping
      pknm = 'repeating_perks_' + UUID + '_perk_name'
      createOrSetAttr(pknm, plst[p].desc.trim(), '', cid)
    }
  }

  const createTalents = (tlst, cid) => {
    const objToSet = []
    let tlnm = ''
    // Create all talents
    for (let t = 0; t < tlst.length; t++) // Loop through HD sheet powers
    {
      if (tlst[t].desc === undefined) { continue }
      UUID = generateUUID().replace(/_/g, 'Z') // Generate a UUID for perk grouping
      tlnm = 'repeating_perks_' + UUID + '_perk_name'
      createOrSetAttr(tlnm, tlst[t].desc.trim(), '', cid)
    }
  }

  const generateUUID = () => { // Generate a UUID (original code by The Aaron)
    let a = 0
    const b = []

    let c = (new Date()).getTime() + 0
    let f = 7
    const e = new Array(8)
    const d = c === a
    a = c
    for (; f >= 0; f--) {
      e[f] = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.charAt(c % 64)
      c = Math.floor(c / 64)
    }
    c = e.join('')
    if (d) {
      for (f = 11; f >= 0 && b[f] === 63; f--) {
        b[f] = 0
      }
      b[f]++
    } else {
      for (f = 0; f < 12; f++) {
        b[f] = Math.floor(64 * Math.random())
      }
    }
    for (f = 0; f < 12; f++) {
      c += '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.charAt(b[f])
    }

    return c
  }

  const decodeEditorText = (t, o) => { // Clean up notes and decode (code by The Aaron)
    let w = t
    o = Object.assign({ separator: '\r\n', asArray: false }, o)
    // Token GM Notes
    if (/^%3Cp%3E/.test(w)) {
      w = unescape(w)
    }
    if (/^<p>/.test(w)) {
      const lines = w.match(/<p>.*?<\/p>/g)
        .map(l => l.replace(/^<p>(.*?)<\/p>$/, '$1'))
      return o.asArray ? lines : lines.join(o.separator)
    }
    // neither
    return t
  }

  const handleInput = (msg) => { // Monitor the chat for commands, process sheet if import called
    if (!(msg.type === 'api' &&
        /^!(importHS6e|i6e)(\s|$)/.test(msg.content))) { // Ignore messages not intended for this script
      return
    }

    /// ////////////////////////////////////////////////////////////////////////////// Begin processing API message
    const args = msg.content.split(/\s+--/).slice(1)
    args.forEach(a => { // Loop all attributes
      switch (a) {
        case 'help': // Show help in Chat
        // return showImportHelp(who);
          break
        case 'debug': // Log debug info to API Console
          debug_log = 1
          break
        case 'statdebug': // Log debug info to API Console
          stat_log = 1
          break
        case 'movedebug': // Log debug info to API Console
          move_log = 1
          break
        case 'powrdebug': // Log debug info to API Console
          powr_log = 1
          break
        case 'compdebug': // Log debug info to API Console
          comp_log = 1
          break
        case 'perkdebug': // Log debug info to API Console
          perk_log = 1
          break
        case 'talndebug': // Log debug info to API Console
          taln_log = 1
          break
        case 'skildebug': // Log debug info to API Console
          skil_log = 1
          break
        case 'showobj': // Show current objects on API Console
          logObjs = 1
          break
        default:
        // return sendChat("Unknown argument value", who, "", "ImportHS6e" );
          break
      }
    })

    if (debug_log === 1) { log('Debug is ON') } else { log('Debug is OFF') } // Display current Debug status.

    const selected = msg.selected
    if (selected === undefined) { // Must have a token selected
      sendChat('i6e_API', 'Please select a token.')
      return
    }

    const token = getObj('graphic', selected[0]._id) // Get selected token
    const character = getObj('character', token.get('represents')) // Get character linked to token

    if (character === undefined) { // Token must have valid character assigned.
      sendChat('i6e_API', 'Token has no character assigned, please assign and retry.')
      return
    }

    /// ////////////////////////////////////////////////////////////////////////////// Begin parsing character sheet
    const chid = character.id // Get character identifier
    const herodesignerData = []
    const characterName = findObjs({ type: 'attribute', characterid: chid, name: 'name' })[0]

    character.get('gmnotes', function (gmnotes) { // Begin processing the GM Notes section
      let dec_gmnotes = decodeEditorText(gmnotes)

      // Clean JSON of extra junk the HTML adds.
      dec_gmnotes = dec_gmnotes.replace(/<[^>]*>/g, '') //   Remove <tags>
        .replace(/&[^;]*;/g, '') //   Remove &nbsp;
        .replace(/[^\x0A-\xBF]/g, '') //   Remove nonstandard letters;
        .replace(/\},\s{1,}\]/g, '\}\]') //   Remove extra comma
        .replace(/"rolls":[^]*?(?=],\r)/g, '"rolls":[') //  Remove Rolls section

//      logDebug(dec_gmnotes)

      if (gmnotes.length <= 5000) {
        sendChat('i6e_API', 'JSON too short to contain valid character data. Update character (not token) GM Notes.')
        return
      }

      const hdJSON = JSON.parse(dec_gmnotes) // Parse the decoded JSON from GM Notes field.
      const hdchlist = hdJSON.stats          // Create array of all HD Characteristics.
      const hdmvlist = hdJSON.movement       // Create array of all HD Characteristics.
      const hdsklist = hdJSON.skills         // Create array of all HD Skills.
      const hdsllist = hdJSON.skills         // Create array of all HD Skill Levels.
      const hdcmlist = hdJSON.disads         // Create array of all HD Complications.
      const hdpwlist = hdJSON.powers         // Create array of all HD Powers.
      const hdpklist = hdJSON.perks          // Create array of all HD Perks.
      const hdtllist = hdJSON.talents        // Create array of all HD Talents.

      character.set('name', hdJSON.name) // Set the name
      // Create array of all attributes
      const attrlist = findObjs({ type: 'attribute', characterid: chid })

      // TODO make adds conditional based on input flags per attribute type (stats, powers etc)
      removeExistingAttributes(attrlist)
      logDebug('*** Existing skills and complications removed')
      createCharacteristics(hdJSON.stats, chid)
      logDebug('*** Stats Assigned')
      createFeatures(hdJSON, chid)
      logDebug('*** Features Assigned')
      createSkills(hdsklist, chid)
      logDebug('*** Skills Assigned')
      createMovement(hdmvlist, chid)
      logDebug('*** Movement Assigned')
      createSkillLevels(hdsllist, chid)
      logDebug('*** Skill Levels Assigned')
      createCombatLevels(hdsklist, chid)
      logDebug('*** Combat Levels Assigned')
      createPenaltyLevels(hdsklist, chid)
      logDebug('*** Penalty Levels Assigned')
      createComplications(hdcmlist, chid)
      logDebug('*** Complications Assigned')
      createPerks(hdpklist, chid)
      logDebug('*** Perks Assigned')
      createTalents(hdtllist, chid)
      logDebug('*** Talents Assigned')

      // Create all powers
      for (let h = 0; h < hdpwlist.length; h++) // Loop through HD sheet powers
      {
        UUID = generateUUID().replace(/_/g, 'Z') // Generate a UUID for power grouping
        createSimplePower(hdpwlist[h], UUID, chid)
      }

//      logDebug('*** Powers Assigned')
      // TODO
      //        logDebug("Equipment Assigned");
      //        logDebug("Rolls Assigned");
      //        logDebug("Lightning Reflexes Assigned");

      sendChat('i6e_API', 'Imported Character ' + hdJSON.name)

      if (logObjs != 0) { // Output character for debug purposes
        const allobjs = getAllObjs()
        log(allobjs)
      }
    })
  }

  const registerEventHandlers = () => {
    on('chat:message', handleInput)
  }

  on('ready', function () {
    checkInstall()
    registerEventHandlers()
  })
})()
{ try { throw new Error('') } catch (e) { API_Meta.ImportHS6e.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ImportHS6e.offset) } }
