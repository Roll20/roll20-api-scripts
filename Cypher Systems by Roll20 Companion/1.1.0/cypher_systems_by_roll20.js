/* globals createObj, findObjs, getAttrByName, getObj, log, on, sendChat */
/* read Help.txt */
const CypherSystemsByRoll20 = (function () {
  'use strict'
  const version = '1.1.0'
  const modified = '2020-01-01'
  // const schemaversion = 1.0
  const author = 'Natha (roll20userid:75857)'
  function checkInstall () {
    log(`===========================================================================
  Cypher Systems by Roll20 Companion v${version} (${modified})
  Author: ${author}
  This script is designed for the Cypher Systems by Roll20 character sheet.
===========================================================================`)
  }

  function modStat (character, statName, statCost) {
    // checking the stat
    if (statName !== 'might' && statName !== 'speed' && statName !== 'intellect' && statName !== 'recovery-rolls') {
      sendChat(`character|${character.id}`, `&{template:default} {{modStat=1}} {{noAttribute=${statName}}}`)
      return
    }
    let obj1
    const stat1 = statName
    if (stat1 === 'recovery-rolls') {
      const objArray = findObjs({
        _type: 'attribute',
        _characterid: character.id,
        name: stat1
      })
      if (!objArray.length) {
        obj1 = createObj('attribute', {
          characterid: character.id,
          name: stat1,
          current: statCost
        })
      } else {
        objArray[0].setWithWorker('current', statCost)
      }
      sendChat(`character|${character.id}`, 'Next recovery period updated.')
    } else {
      // stat pool modification
      let pool1 = 0
      let max1 = 0
      let finalPool = 0
      let objArray = findObjs({
        _type: 'attribute',
        name: stat1,
        _characterid: character.id
      })
      if (!objArray.length) {
        pool1 = parseInt(getAttrByName(character.id, stat1, 'current')) || 0
        max1 = parseInt(getAttrByName(character.id, stat1, 'max')) || 0
        obj1 = createObj('attribute', {
          characterid: character.id,
          name: stat1,
          current: pool1,
          max: max1
        })
      } else {
        obj1 = objArray[0]
        pool1 = parseInt(obj1.get('current')) || 0
      }
      if (statCost > pool1) {
        // several stats will be diminished
        let pool2
        let pool3
        let max2
        let max3 = 0
        let stat2
        let stat3 = ''
        let obj2
        let obj3
        switch (statName) {
          case 'might':
            stat2 = 'speed'
            stat3 = 'intellect'
            break
          case 'speed':
            stat2 = 'might'
            stat3 = 'intellect'
            break
          case 'intellect':
            stat2 = 'might'
            stat3 = 'speed'
            break
        }
        objArray = findObjs({
          _type: 'attribute',
          _characterid: character.id,
          name: stat2
        })
        if (!objArray.length) {
          pool2 = parseInt(getAttrByName(character.id, stat2, 'current')) || 0
          max2 = parseInt(getAttrByName(character.id, stat2, 'max')) || 0
          obj2 = createObj('attribute', {
            characterid: character.id,
            name: stat2,
            current: pool2,
            max: max2
          })
        } else {
          obj2 = objArray[0]
          pool2 = parseInt(obj2.get('current')) || 0
        }
        objArray = findObjs({
          _type: 'attribute',
          _characterid: character.id,
          name: stat3
        })
        if (!objArray.length) {
          pool3 = parseInt(getAttrByName(character.id, stat3, 'current')) || 0
          max3 = parseInt(getAttrByName(character.id, stat3, 'max')) || 0
          obj3 = createObj('attribute', {
            characterid: character.id,
            name: stat3,
            current: pool3,
            max: max3
          })
        } else {
          obj3 = objArray[0]
          pool3 = parseInt(obj3.get('current')) || 0
        }
        // calculus
        statCost = statCost - pool1
        obj1.setWithWorker('current', 0)
        if (statCost > pool2) {
          statCost = statCost - pool2
          obj2.setWithWorker('current', 0)
          if (statCost > pool3) {
            obj3.setWithWorker('current', 0)
            sendChat(`character|${character.id}`, `He's dead, Jim! ${pool1}, ${pool2}, and ${pool3} down to 0.`)
          } else {
            finalPool = pool3 - statCost
            obj3.setWithWorker('current', finalPool)
            sendChat(`character|${character.id}`, `${stat1} and ${stat2} down to 0. ${stat3}: ${pool3}-${statCost}=${finalPool}`)
          }
        } else {
          finalPool = pool2 - statCost
          obj2.setWithWorker('current', finalPool)
          sendChat(`character|${character.id}`, `${stat1} down to 0. ${stat2}: ${pool2}-${statCost}=${finalPool}`)
        }
      } else {
        // just the current stat is diminished
        finalPool = pool1 - statCost
        obj1.setWithWorker('current', finalPool)
        sendChat(`character|${character.id}`, `${stat1}: ${pool1}-${statCost}=${finalPool}`)
      }
    }
  }

  function npcDamage (token, character, dmgDealt, applyArmor) {
    // Apply damage (or healing if dmgDealt is negative ...) to Numenera NPC/Creature
    // And set 'death' marker if health is 0 or less.
    // The Mook or Non Player full Character must have the following attributes :
    //  - Level (token bar1)
    //  - Health (token bar2)
    //  - Armor (token bar3)
    // Armor will diminish damage unless 'applyArmor'='n'
    const npcName = character.get('name')
    let dmg = parseInt(dmgDealt) || 0
    let npcHealth = 0
    let npcMaxHealth = 0
    let npcArmor = 0
    let attObjArray = {}
    if (applyArmor !== 'n') {
      npcArmor = parseInt(getAttrByName(character.id, 'armor', 'current')) || 0
      // DEBUG
      // sendChat('GM', '/w gm npcDamage() Debug : Armor of (''+npcName+'', char id:'+characterObj.id+', token id:'+tokenObj.id+') = '+npcArmor)
    }
    // Is the token linked to the character ('full NPC') or a Mook ?
    const isChar = token.get('bar1_link')
    if (isChar === '') {
      // It's a Mook : get the bars value
      npcHealth = parseInt(token.get('bar2_value'))
      npcMaxHealth = parseInt(token.get('bar2_max'))
    } else {
      // It's a 'full' character NPC : get the attributes values
      attObjArray = findObjs({
        _type: 'attribute',
        _characterid: character.id,
        name: 'health'
      })
      if (attObjArray === false) {
        sendChat('GM', `/w gm npcDamage() Error: ${npcName} has no health attribute!`)
        return false
      } else {
        npcHealth = parseInt(attObjArray[0].get('current')) || 0
        npcMaxHealth = parseInt(attObjArray[0].get('max')) || 0
      }
    }
    // In case the Health attribute / bar has no maximum value
    npcMaxHealth = Math.max(npcHealth, npcMaxHealth)
    if (dmg > 0) {
      dmg = Math.max((dmg - npcArmor), 0)
    }
    const npcHealthFinal = Math.min(Math.max((npcHealth - dmg), 0), npcMaxHealth)
    if (isChar === '') {
      // Mook : update bars onbly
      token.set('bar2_max', npcMaxHealth)
      token.set('bar2_value', npcHealthFinal)
    } else {
      // Update character attributes
      attObjArray[0].setWithWorker('max', npcMaxHealth)
      attObjArray[0].setWithWorker('current', npcHealthFinal)
    }
    token.set('status_dead', (npcHealthFinal === 0))
    if (dmgDealt > 0) {
      sendChat('GM', `/w gm ${npcName} takes ${dmg} damage (${dmgDealt} - ${npcArmor} Armor). Health: ${npcHealth}->${npcHealthFinal}.`)
    } else {
      sendChat('GM', `/w gm ${npcName} is healed for ${dmg} points. Health: ${npcHealth}->${npcHealthFinal}.`)
    }
  }

  function handleInput (msg) {
    // Validate chat message. Every function requires at least one parameter.
    if (msg.type !== 'api' || msg.content.indexOf('!cypher-') !== 0 || parseInt(msg.content.indexOf(' ')) === -1) {
      return
    }

    let paramArray = new Array(1)
    const functionCalled = msg.content.split(' ')[0]
    paramArray[0] = msg.content.split(' ')[1]

    // uncomment to debug
    // log(`Function called: ${functionCalled} Parameters: ${paramArray[0]}`)

    if (parseInt(paramArray[0].indexOf('|')) !== -1) {
      // more than 1 parameter (supposedly character_id as first paramater)
      paramArray = paramArray[0].split('|')
    }
    let obj = getObj('character', paramArray[0])

    switch (functionCalled) {
      // this function requires 3 parameters : token_id|damage|apply armor y/n
      case '!cypher-npcdmg':
        if (paramArray.length !== 3) {
          sendChat('Cypher System', `&{template:default} {{name=Error}} {{Command=cypher-npcdmg}} {{Message=Invalid parameters}} {{Expected=token_id,damage,apply_armor}} {{Received=${paramArray}}}`)
          return false
        }
        obj = getObj('graphic', paramArray[0])
        if (!obj) {
          sendChat('Cypher System', `&{template:default} {{name=Error}} {{Command=cypher-npcdmg}} {{Message=noToken ${paramArray[0]}}}`)
          return false
        }
        if (!obj.get('represents')) {
          sendChat('Cypher System', `&{template:default} {{name=Error}} {{Command=cypher-npcdmg}} {{Message=notCharToken ${paramArray[0]}}}`)
          return false
        }
        npcDamage(obj, getObj('character', obj.get('represents')), paramArray[1], paramArray[2])
        break
      // this function requires 3 parameters : character_id|stat|cost
      case '!cypher-modstat':
        if (paramArray.length !== 3) {
          sendChat('Cypher System', `&{template:default} {{name=Error}} {{Command=cypher-modstat}} {{Message=Invalid parameters}} {{Expected=character_id,stat,cost}} {{Received=${paramArray}}}`)
          return false
        }
        //
        if (!obj) {
          sendChat('Cypher System', `&{template:default} {{name=Error}} {{Command=cypher-modstat}} {{Message=notaCharacter ${paramArray[0]}}}`)
          return false
        }
        modStat(obj, paramArray[1], paramArray[2], paramArray[3])
        break
    }
  }

  function registerEventHandlers () {
    on('chat:message', handleInput)
  }

  return {
    CheckInstall: checkInstall,
    RegisterEventHandlers: registerEventHandlers
  }
}())

on('ready', function () {
  'use strict'
  CypherSystemsByRoll20.CheckInstall()
  CypherSystemsByRoll20.RegisterEventHandlers()
})
