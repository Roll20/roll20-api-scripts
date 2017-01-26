// Github: https://github.com/bpunya/roll20-api/blob/master/KABOOM/1.0/KABOOM.js
// README: https://github.com/bpunya/roll20-api/blob/master/KABOOM/README.md
// Author: PaprikaCC (Bodin Punyaprateep)
/* ************************************************************************** */

var KABOOM = KABOOM || (function () {

  // This script allows GMs to send things flying!
  // Please read the README.md found in the Roll20-api-scripts repository

  var version = '1.1',
    lastUpdate = 1485407263,
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
      'default_scatter': true,
      'explosion_ratio': 2,
      'default_layer': 'objects',
      'gm_only': true,
      'drawings_only': true,
      'walls_stop_movement': true,
      'lastupdated': 0
    }

  // checkVersion and checkGlobalConfig are run on startup
  var checkVersion = function () {
    if (!state.KABOOM) state.KABOOM = defaultState
    checkGlobalConfig()
    log(`-- KABOOM v${version} -- [${new Date(lastUpdate * 1000)}]`)
  }

  var checkGlobalConfig = function () {
    var g = globalconfig.kaboom
    if (g && g.lastsaved && g.lastsaved > state.KABOOM.lastupdated) {
      state.KABOOM.lastupdated = g.lastsaved
      state.KABOOM.default_layer = g['Default layer to affect']
      state.KABOOM.explosion_ratio = Math.abs(g['Explosion ratio'])
      state.KABOOM.gm_only = g['GM only']
      state.KABOOM.drawings_only = g['Affect drawings only']
      state.KABOOM.walls_stop_movement = g['Dynamic Light walls stop movement']
    }
  }

// This is the function that is exposed externally. You can call it in other
// scripts (as long as this is installed) with "KABOOM.NOW(param1, param2)"

  var NOW = function (rawOptions, rawCenter) {
    var options, explosion_center, affectedObjects, walls
    options = verifyOptions(rawOptions)
    explosion_center = verifyObject(rawCenter)
    if (!options.effectPower || !explosion_center.position) return
    if (options.effectPower > options.effectRadius) {
      log('KABOOM - Max range must always be higher than min range.')
      return
    }
    affectedObjects = findDrawings(explosion_center)
    walls = findWalls(explosion_center.pageid)
    for (var i = 0; i < affectedObjects.length; i++) {
      if (moveGraphic(affectedObjects[i], explosion_center, options, walls) === 'failed') break
    }
    if (options.vfx) createExplosion(explosion_center, options.type)
  }

/*********************** END OF EXPOSED FUNCTION ****************************/
  var checkCollision = function (pathToMove, walls) {
    if (!walls) return pathToMove
    var intersect
    // For each object in the walls array...
    for (var a = 0; a < walls.length; a++) {
      // For each path segment of each object...
      for (var b = 0; b < walls[a].length - 1; b++) {
        intersect = PathMath.segmentIntersection(pathToMove, [walls[a][b], walls[a][b + 1]])
        if (intersect) break
      }
    }
    if (intersect) {
      var obj1, obj2, d_x, d_y, angel, distance, new_d_x, new_d_y, new_x, new_y
      obj1 = [pathToMove[0][0], pathToMove[0][1]]
      obj2 = [intersect[0][0], intersect[0][1]]
      d_x = obj2[0] - obj1[0]
      d_y = obj2[1] - obj1[1]
      distance = Math.sqrt(Math.pow(d_x, 2) + Math.pow(d_y, 2)) - 35
      theta = Math.atan2(d_y, d_x)
      new_d_x = Math.cos(theta) * distance
      new_d_y = Math.sin(theta) * distance
      new_x = obj1[0] + new_d_x
      new_y = obj1[1] + new_d_y
      return [1, [new_x, new_y]]
    }
    return pathToMove
  }

  // Creates the explosion VFX
  var createExplosion = function (object, options) {
    if (options === undefined) options = state.KABOOM.default_type
    spawnFx(object.position[0], object.position[1], `explode-${options}`, object.pageid)
  }

  // Returns an array of all valid drawings to move
  var findDrawings = function (token) {
    if (state.KABOOM.drawings_only) {
      return findObjs({
        '_type': 'graphic',
        '_pageid': token.pageid,
        'isdrawing': true,
        'layer': state.KABOOM.same_layer_only ? token.layer : true
      })
    } else {
      return findObjs({
        '_type': 'graphic',
        '_pageid': token.pageid,
        'layer': state.KABOOM.same_layer_only ? token.layer : true
      })
    }
  }

  // Returns an array of all paths on the dynamic lighting layer
  var findWalls = function (pageid) {
    var pathTuple, transformInfo,
    pointArray = [],
    completePointArray = [],
    wallArray = findObjs({
      'layer': 'walls',
      '_type': 'path',
      '_pageid': pageid
    })
    // This is to make the array nice and find out where the points actually are
    for (var a = 0; a < wallArray.length; a++) {
      pathTuple = JSON.parse(wallArray[a].get('path'))
      transformInfo = PathMath.getTransformInfo(wallArray[a])
      for (var b = 0; b < pathTuple.length; b++) {
        pointArray.push(PathMath.tupleToPoint(pathTuple[b], transformInfo))
      }
      completePointArray.push(pointArray)
    }
    return completePointArray
  }

  // Returns an array of the input object's coordinates
  var getCoordinates = function (obj) {
    return [obj.get('left'), obj.get('top')]
  }

  // Returns the 'weight' of the object (to modify distance thrown) from 0 to 1
  // If the weight is lower than min_threshold, the returned value scales from 1 to 2.
  // If the weight is higher than max_threshold, the returned value is always 0
  var getWeight = function (weight, min_threshold, max_threshold) {
    return min_threshold > max_threshold ? 1
            : weight < min_threshold ? -weight / min_threshold + 2
            : weight > max_threshold ? 0
            : -(weight - min_threshold) / (max_threshold - min_threshold) + 1
  }

  // Handles chat input
  var handleChatInput = function (msg) {
    if (msg.type !== 'api' || (state.KABOOM.gm_only && !playerIsGM(msg.playerid))) return
    var args = msg.content.split(/\s/)
    switch (args[0].toUpperCase()) {
      case '!KABOOM':
        var options = parseOptions(args.slice(1))
        if (!options.effectPower) {
          return
        } else if (options.effectRadius && (options.effectPower > options.effectRadius)) {
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
  var moveGraphic = function (flying_object, explosion_center, options, walls) {
    var obj1, obj2, d_x, d_y, distance, distance_weight, f_obj_size, item_weight, d_distance, movement_vector,
      new_distance, theta, new_d_x, new_d_y, new_x, new_y, page, page_scale, page_max_x, page_max_y

    if (flying_object.id === explosion_center.id) return

    // Get page information
    page = getObj('page', explosion_center.pageid)
    if (!page) {
      log('KABOOM - PageID supplied does not exist.')
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
      log('KABOOM - Coordinate information is out of bounds.')
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
    item_weight = getWeight(flying_object.get('width') * flying_object.get('height') / 4900, state.KABOOM.min_size, state.KABOOM.max_size)
    distance_weight = getWeight(distance, Math.abs(options.effectPower * page_scale), options.effectRadius * page_scale)
    if (!distance_weight || !item_weight) return
    d_distance = options.effectPower * page_scale
                * (distance_weight + 0.2 - 0.2 * distance_weight)
                * (state.KABOOM.ignore_size ? 1 : item_weight)
                * (options.scatter ? (Math.floor(Math.random() * 51) + 50) / 100 : 1)

    // If moving towards a point, don't overshoot it
    if (options.effectPower < 0 && Math.abs(d_distance) > distance) {
      new_distance = 0
    } else {
      new_distance = distance + d_distance
    }

    // Calculate new location
    theta = Math.atan2(d_y, d_x) + (options.scatter ? (Math.floor((Math.random() * 60) + 1) - 30) / 360 * Math.PI * distance_weight : 0)
    new_d_x = Math.cos(theta) * new_distance
    new_d_y = Math.sin(theta) * new_distance
    new_x = obj1[0] + new_d_x
    new_y = obj1[1] + new_d_y

    // Check intersection with walls here
    movement_vector = checkCollision([[obj2[0], obj2[1], 1], [new_x, new_y, 1]], walls)
    new_x = movement_vector[1][0]
    new_y = movement_vector[1][1]

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
      effectPower: parseInt(input[0], 10).toString() === input[0] ? parseInt(input[0], 10) : undefined,
      effectRadius: parseInt(input[1], 10).toString() === input[1] ? parseInt(input[1], 10) : undefined
    }
    // Cycle through the rest of the commands
    for (var i = 0; i < input.length; i++) {
      // This switch is for explosion specific things
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

      // This section is for changing defaults/state
      if (input[i].slice(0, 2) !== '--') continue
      // We check here if they want a specific type. Last command wins.
      if (_.contains(VFXtypes, input[i].slice(2))) options['type'] = input[i].slice(2)
      switch (input[i].slice(2)) {

        case 'type':
          if (_.contains(VFXtypes, input[i + 1])) state.KABOOM.default_type = input[i + 1]
          printToChat('gm', `The default explosion type is now ${s.default_type}.`)
          settingsUnchanged = false
          break

        case 'vfx':
          if (input[i + 1] === 'on') state.KABOOM.vfx = true
          else if (input[i + 1] === 'off') state.KABOOM.vfx = false
          printToChat('gm', `VFX are now ${s.vfx ? 'enabled' : 'disabled'} on explosions.`)
          settingsUnchanged = false
          break

        case 'same-layer':
          if (input[i + 1] === 'on') state.KABOOM.same_layer_only = true
          else if (input[i + 1] === 'off') state.KABOOM.same_layer_only = false
          printToChat('gm', `Objects ${s.same_layer_only ? 'must be' : "don't have to be"} on the same layer as the explosion token now.`)
          settingsUnchanged = false
          break

        case 'default-scatter':
          if (input[i + 1] === 'on') state.KABOOM.default_scatter = true
          else if (input[i + 1] === 'off') state.KABOOM.default_scatter = false
          printToChat('gm', `By default, scattering is ${s.same_layer_only ? 'active' : 'inactive'}.`)
          settingsUnchanged = false
          break

        case 'ignore-size':
          if (input[i + 1] === 'on') state.KABOOM.ignore_size = true
          else if (input[i + 1] === 'off') state.KABOOM.ignore_size = false
          printToChat('gm', `An object's size is now ${s.ignore_size ? 'ignored' : 'included'} in distance calculations.`)
          settingsUnchanged = false
          break

        case 'min-size':
          if (parseInt(input[i + 1], 10).toString() === input[i + 1]) state.KABOOM.min_size = parseInt(input[i + 1], 10)
          printToChat('gm', `All objects smaller than ${s.min_size} square(s) are now considered light.`)
          settingsUnchanged = false
          break

        case 'max-size':
          if (parseInt(input[i + 1], 10).toString() === input[i + 1]) state.KABOOM.max_size = parseInt(input[i + 1], 10)
          printToChat('gm', `All objects larger than ${s.max_size} square(s) are now considered too heavy to move.`)
          settingsUnchanged = false
          break

        case 'reset':
          state.KABOOM = defaultState
          settingsUnchanged = false
          printToChat('gm', `KABOOM has reset its internal state.`)
          break

        case 'help':
          var helpRequested = true
          break
      }
    } // End Input Check Loop!
    if ((Object.keys(options).length === 0 && settingsUnchanged) || helpRequested) showHelp('gm')
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
                  '<span style="color:#888888">!KABOOM effectPower effectRadius --options</span></p>' +
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
  // accepts either a single number, or an object with the 'effectPower' property.
  // The rest of the properties are not required.

  var verifyOptions = function (options) {
    if (parseInt(options, 10) === options) {
      return {
        effectPower: options,
        effectRadius: Math.abs(options * state.KABOOM.explosion_ratio),
        type: state.KABOOM.default_type,
        scatter: state.KABOOM.default_scatter,
        vfx: state.KABOOM.vfx
      }
    } else {
      return {
        effectPower: (parseInt(options.effectPower, 10) === options.effectPower)
          ? options.effectPower : false,
        effectRadius: (parseInt(options.effectRadius, 10) === options.effectRadius)
          ? Math.abs(options.effectRadius) : Math.abs(options.effectPower * state.KABOOM.explosion_ratio),
        type: (_.contains(VFXtypes, options.type))
          ? options.type : state.KABOOM.default_type,
        scatter: (typeof options.scatter === 'boolean')
          ? options.scatter : state.KABOOM.default_scatter,
        vfx: (typeof options.vfx === 'boolean')
          ? options.vfx : state.KABOOM.vfx
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
        layer: state.KABOOM.default_layer,
        id: false
    }}
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
        layer: _.contains(Layers, obj.layer) ? obj.layer : state.KABOOM.default_layer,
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
