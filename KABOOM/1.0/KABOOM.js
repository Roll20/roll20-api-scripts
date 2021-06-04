// Github: https://github.com/bpunya/roll20-api/blob/master/KABOOM/1.0/KABOOM.js
// README: https://github.com/bpunya/roll20-api/blob/master/KABOOM/README.md
// Author: PaprikaCC (Bodin Punyaprateep)
/* ************************************************************************** */

var KABOOM = KABOOM || (function () {

  // This script allows GMs to send things flying!
  // Please read the README.md found in the Roll20-api-scripts repository

  var s = state.KABOOM,
    version = '1.0',
    lastUpdate = 1485299294,
    Chat_Formatting_START = '<div style="background-color:#ffffff; padding:5px; border-width:2px; border-style:solid;">' +
                            '<div style="border-width:2px; border-style:dotted; padding:5px">',
    Chat_Formatting_END = '</div>' +
                          '</div>',
    VFXtypes = ['acid', 'blood', 'charm', 'death', 'fire', 'frost', 'holy', 'magic', 'slime', 'smoke', 'water'],
    Layers = ['objects', 'map'],
    defaultState = {
      'vfx': true,
      'ignore_size': false,
      'default_type': 'fire',
      'same_layer_only': true,
      'min_size': 1,
      'max_size': 9,
      'default_scatter': false,
      'explosion_ratio': 2,
      'default_layer': 'objects',
      'gm_only': true,
      'drawings_only': true,
      'lastupdated': 0
    }

  // checkVersion and checkGlobalConfig are run on startup
  var checkVersion = function () {
    if (!s) { state.KABOOM = defaultState }
    checkGlobalConfig()
    log(`-- KABOOM v${version} -- [${new Date(lastUpdate * 1000)}]`)
  }

  var checkGlobalConfig = function () {
    var g = globalconfig && globalconfig.kaboom
    if (g && g.lastsaved && g.lastsaved > s.lastupdated) {
      s.lastupdated = g.lastsaved
      s.default_layer = g['Default layer to affect']
      s.explosion_ratio = Math.abs(g['Explosion ratio'])
      s.gm_only = g['GM only'] === 'true' ? true : false
      s.drawings_only = g['Affect drawings only'] === 'true' ? true : false
    }
  }

// This is the function that is exposed externally. You can call it in other
// scripts (as long as this is installed) with "KABOOM.NOW(param1, param2)"

  var NOW = function (rawOptions, rawCenter) {
    var options = verifyOptions(rawOptions)
    var explosion_center = verifyObject(rawCenter)
    if (!options.minRange || !explosion_center.position) return
    if (options.minRange > options.maxRange) {
      log('Max range must always be higher than min range.')
      return
    }
    var affectedObjects = findDrawings(explosion_center)
    for (var i = 0; i < affectedObjects.length; i++) {
      if (moveGraphic(affectedObjects[i], explosion_center, options) === 'failed') break
    }
    if (options.vfx) createExplosion(explosion_center, options.type)
  }

/*********************** END OF EXPOSED FUNCTION ****************************/

  // Creates the explosion VFX
  var createExplosion = function (explosion_center, explosion_type) {
    if (explosion_type === undefined) explosion_type = s.default_type
    spawnFx(explosion_center.position[0], explosion_center.position[1], `explode-${explosion_type}`, explosion_center.pageid)
  }

  // Returns an array of all valid drawings to move
  var findDrawings = function (explosion_center) {
    if (s.drawings_only) {
      return findObjs({
        '_type': 'graphic',
        '_pageid': explosion_center.pageid,
        'isdrawing': true,
        'layer': s.same_layer_only ? explosion_center.layer : true
      })
    } else {
      return findObjs({
        '_type': 'graphic',
        '_pageid': explosion_center.pageid,
        'layer': s.same_layer_only ? explosion_center.layer : true
      })
    }
  }

  // Returns an array of the input object's coordinates
  var getCoordinates = function (obj) {
    return [obj.get('left'), obj.get('top')]
  }

  // Returns the 'weight' of the object (to modify distance thrown) from 0 to 1
  // If the weight is lower than min_threshold, the returned value is always 1
  // If the weight is higher than max_threshold, the returned value is always 0
  var getWeight = function (weight, min_threshold, max_threshold) {
    return min_threshold > max_threshold ? 1
            : weight < min_threshold ? 1
            : weight > max_threshold ? 0
            : -(weight - min_threshold) / (max_threshold - min_threshold) + 1
  }

  // Handles chat input
  var handleChatInput = function (msg) {
    if (msg.type !== 'api' || (s.gm_only && !playerIsGM(msg.playerid))) return
    var args = msg.content.split(/\s/)
    switch (args[0]) {
      case '!kaboom':
      case '!KABOOM':
        var options = parseOptions(args.slice(1))
        if (!options.minRange) {
          return
        } else if (options.minRange < 0 && options.maxRange <= 0) {
          printToChat(msg.who, 'All implosions must have a positive max range')
          return
        } else if (options.maxRange && (options.minRange > options.maxRange)) {
          printToChat(msg.who, 'Maximum range must be higher than the minimum range')
          return
        } else if (!msg.selected) {
          printToChat(msg.who, 'Please select one token to designate the center of the explosion.')
          return
        } else {
          NOW(options, getObj('graphic', msg.selected[0]._id))
        }
    }
  }

  // **************************************************************************
  // * The important function - moveGraphic handles all distance calculations *
  // **************************************************************************
  var moveGraphic = function (flying_object, explosion_center, options) {
    var obj1, obj2, d_x, d_y, distance, distance_weight, f_obj_size, item_weight, d_distance,
      new_distance, theta, new_d_x, new_d_y, new_x, new_y, page, page_scale, page_max_x, page_max_y

    if (flying_object.id === explosion_center.id) return
    if (options.minRange < 0 && options.maxRange < 0) {
      log('All implosions must have a positive max range')
      return 'failed'
    }

    // Get page information
    page = getObj('page', explosion_center.pageid)
    if (!page) {
      log('Supplied pageID does not exist.')
      return 'failed'
    }
    page_scale = 70 / page.get('scale_number')
    page_max_x = page.get('width') * 70
    page_max_y = page.get('height') * 70

    // Separate objects from coords
    obj1 = [explosion_center.position[0], explosion_center.position[1]]
    obj2 = getCoordinates(flying_object)

    // ARE OUR COORDS OKAY?
    if (obj1[0] < 0 || obj1[1] < 0 ||
      obj1[0] > page_max_x || obj1[1] > page_max_y ||
      obj2[0] < 0 || obj2[1] < 0 ||
      obj2[0] > page_max_x || obj2[1] > page_max_y)
    {
      log('Coordinate information is out of bounds. KABOOM will not activate')
      return 'failed'
    }

    // Start math calculations
    d_x = (obj2[0] - obj1[0])
    d_y = (obj2[1] - obj1[1])
    if (d_x === 0 && d_y === 0) {
      d_x = Math.random() * 2 - 1
      d_y = Math.random() * 2 - 1
    }
    distance = Math.sqrt(Math.pow(d_x, 2) + Math.pow(d_y, 2))

    // Calculate new distance
    item_weight = getWeight(flying_object.get('width') * flying_object.get('height') / 4900, s.min_size, s.max_size)
    distance_weight = getWeight(distance, options.minRange * page_scale, options.maxRange * page_scale)
    if (!distance_weight || !item_weight) return
    d_distance = options.minRange * page_scale * (distance_weight + 0.2 - 0.2 * distance_weight) * (s.ignore_size ? 1 : item_weight) * (options.scatter ? Math.random() : 1)

    if (options.minRange < 0 && Math.abs(d_distance) > distance) {
      new_distance = 0
    } else {
      new_distance = distance + d_distance
    }

    // Calculate new location
    theta = Math.atan2(d_y, d_x) + (options.scatter ? (Math.floor((Math.random() * 120) + 1) - 60) / 360 * Math.PI * distance_weight : 0)
    new_d_y = Math.sin(theta) * new_distance
    new_d_x = Math.cos(theta) * new_distance
    new_y = obj1[1] + new_d_y
    new_x = obj1[0] + new_d_x

    // QA STUFF HERE
    new_x = new_x > page_max_x ? page_max_x : new_x < 0 ? 0 : new_x
    new_y = new_y > page_max_y ? page_max_y : new_y < 0 ? 0 : new_y

    // Time to move
    flying_object.set({'left': new_x, 'top': new_y})
  }

  // Returns an object with options parsed from chat messages.
  var parseOptions = function (input) {
    var settingsUnchanged = true
    var options = {
      minRange: parseInt(input[0], 10).toString() === input[0] ? parseInt(input[0], 10) : false,
      maxRange: parseInt(input[1], 10).toString() === input[1] ? parseInt(input[1], 10) : false,
      scatter: s.default_scatter,
      vfx: s.vfx
    }
    // Cycle through the rest of the commands
    for (var i = 0; i < input.length; i++) {
      switch (input[i]) {

        case 'no-vfx':
        case 'invisible':
        case 'invis':
          options['vfx'] = false
          break

        case 'no':
          if (input[i + 1] === 'vfx') options['vfx'] = false
          if (input[i + 1] === 'scatter') options['scatter'] = false
          break

        case 'scatter':
          options['scatter'] = true
          break

        case 'vfx':
          options['vfx'] = true
          break
      }
      if (input[i].slice(0, 2) !== '--') continue
      // We check here if they want a specific type. Last command wins.
      if (_.contains(VFXtypes, input[i].slice(2))) options['type'] = input[i].slice(2)
      switch (input[i].slice(2)) {

        case 'type':
          if (_.contains(VFXtypes, input[i + 1])) s.default_type = input[i + 1]
          printToChat('gm', `The default explosion type is now ${s.default_type}.`)
          settingsUnchanged = false
          break

        case 'vfx':
          if (input[i + 1] === 'on') s.vfx = true
          else if (input[i + 1] === 'off') s.vfx = false
          printToChat('gm', `VFX are now ${s.vfx ? 'enabled' : 'disabled'} on explosions.`)
          settingsUnchanged = false
          break

        case 'same-layer':
          if (input[i + 1] === 'on') s.same_layer_only = true
          else if (input[i + 1] === 'off') s.same_layer_only = false
          printToChat('gm', `Objects ${s.same_layer_only ? 'must be' : "don't have to be"} on the same layer as the explosion token now.`)
          settingsUnchanged = false
          break

        case 'default-scatter':
          if (input[i + 1] === 'on') s.default_scatter = true
          else if (input[i + 1] === 'off') s.default_scatter = false
          printToChat('gm', `By default, scattering is ${s.same_layer_only ? 'active' : 'inactive'}.`)
          settingsUnchanged = false
          break

        case 'ignore-size':
          if (input[i + 1] === 'on') s.ignore_size = true
          else if (input[i + 1] === 'off') s.ignore_size = false
          printToChat('gm', `An object's size is now ${s.ignore_size ? 'ignored' : 'included'} in distance calculations.`)
          settingsUnchanged = false
          break

        case 'min-size':
          if (parseInt(input[i + 1], 10).toString() === input[i + 1]) s.min_size = parseInt(input[i + 1], 10)
          printToChat('gm', `All objects smaller than ${s.min_size} square(s) are now considered light.`)
          settingsUnchanged = false
          break

        case 'max-size':
          if (parseInt(input[i + 1], 10).toString() === input[i + 1]) s.max_size = parseInt(input[i + 1], 10)
          printToChat('gm', `All objects larger than ${s.max_size} square(s) are now considered too heavy to move.`)
          settingsUnchanged = false
          break

        case 'reset':
          s = defaultState
          break

        case 'help':
          var helpRequested = true
          break
      }
    } // End Input Check Loop!
    if ((!options.minRange && !options.maxRange && settingsUnchanged) || helpRequested) showHelp('gm')
    return options
  }

  var showHelp = function (target) {
    var content = '<div>' +
                  '<strong><h1 style="text-align:center;color:#FF9900">KABOOM!</h1></strong>' +
                  '<p style="text-align:center;font-size:75%;">The following is a list of all current settings.</p>' +
                  '</div>' +
                  '<div style="color:#000000;background-color:#FFCE73">' +
                  '<hr style="background:#000000; border:0; height:7px" />' +
                  '<ul><b>Visual Effects</b> (<b>--vfx</b>):<br>' +
                    `${s.vfx ? 'Script creates VFX' : 'Not active'}</ul>` +
                  '<ul><b>Default Explosion Colour</b><br> (<b>--type</b>): ' +
                    `${s.default_type.toUpperCase()}</ul>` +
                  '<ul><b>Affected Layers</b><br> (<b>--same-layer</b>):<br>' +
                    `${s.same_layer_only ? 'Selected token layer only' : 'All layers'}</ul>` +
                  '<ul><b>Scattering</b> (<b>--default-scatter</b>):<br>' +
                    `${s.default_scatter ? 'Objects are scattered semi-randomly' : 'Objects are thrown predictably'}</ul>` +
                  '<ul><b>Size Consideration</b><br> (<b>--ignore-size</b>):<br>' +
                    `${s.ignore_size ? 'Object size does not affect weight' : 'Larger objects move less distance'}</ul>` +
                  '<ul><b>Light Object Size</b><br> (<b>--min-size</b>):<br>' +
                    `<p style="font-size:85%;">Objects ${s.min_size} square(s) or smaller are moved at maximum speed.</p></ul>` +
                  '<ul><b>Heavy Object Size</b><br> (<b>--max-size</b>):<br>' +
                    `<p style="font-size:85%;">Objects ${s.max_size} square(s) or larger are too heavy to move.</p></ul>` +
                  '<hr style="background:#000000; border:0; height:7px" />' +
                  '</div>' +
                  '<div style="text-align:center;">' +
                  '<p style="font-size:90%;">To use <span style="color:#FF9900">KABOOM</span> as a macro or chat command, follow this format:<br>' +
                  '<span style="color:#888888">!KABOOM minRange maxRange --options</span></p>' +
                  '</div>'
    printToChat(target, content)
  }

  // Pre-formatted sendChat function.
  var printToChat = function (target, content) {
    sendChat('KABOOM', `/w ${target} <br>` +
      Chat_Formatting_START + content + Chat_Formatting_END,
      null, {noarchive: true})
  }

  // ***************************************************************************
  // This function just verifies that our options are formed correctly. It
  // accepts either a single number, or an object with the 'minRange' property.
  // The rest of the properties are not required.

  var verifyOptions = function (options) {
    if (parseInt(options, 10) === options) {
      return {
        minRange: options,
        maxRange: Math.abs(options * s.explosion_ratio),
        type: s.default_type,
        scatter: s.default_scatter,
        vfx: s.vfx
      }
    } else {
      return {
        minRange: (parseInt(options.minRange, 10) === options.minRange) ? options.minRange : false,
        maxRange: (parseInt(options.maxRange, 10) === options.maxRange) ? options.maxRange : Math.abs(options.minRange * s.explosion_ratio),
        type: (_.contains(VFXtypes, options.type)) ? options.type : s.default_type,
        scatter: (typeof options.scatter === 'boolean') ? options.scatter : s.default_scatter,
        vfx: (typeof options.vfx === 'boolean') ? options.vfx : s.vfx
      }
    }
  }

  // ***************************************************************************
  // We use this function to verify that the object is formatted properly for
  // our other functions. It returns an object with a coordinate array and
  // pageid property. It only accepts objects in three forms:
  //     1. An array of coordinates with form [X,Y]
  //     2. A Roll20 token object.
  //     3. An object with a position array and other properties.

  var verifyObject = function (obj) {
    if (Array.isArray(obj)){
      return {
        position: obj,
        pageid: Campaign().get('playerpageid'),
        layer: s.default_layer,
        id: false
      }
    }
    else if (typeof obj.get == 'function') {
      return {
        position: getCoordinates(obj),
        pageid: obj.get('_pageid'),
        layer: obj.get('layer'),
        id: obj.id
    }}
    else {
      return {
        position: Array.isArray(obj.position) ? obj.position : false,
        pageid: obj.pageid ? obj.pageid : Campaign().get('playerpageid'),
        layer: _.contains(Layers, obj.layer) ? obj.layer : s.default_layer,
        id: obj.id ? obj.id : false
  }}}

  var registerEventHandlers = function () {
    on('chat:message', handleChatInput)
  }

  return {
    NOW: NOW,
    CheckVersion: checkVersion,
    RegisterEventHandlers: registerEventHandlers
  }
}())

on('ready', function () {
  'use strict'
  KABOOM.CheckVersion()
  KABOOM.RegisterEventHandlers()
})
