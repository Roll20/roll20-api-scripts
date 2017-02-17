// Github: https://github.com/bpunya/roll20-api/blob/master/KABOOM/1.1/KABOOM.js
// README: https://github.com/bpunya/roll20-api/blob/master/KABOOM/README.md
// Author: PaprikaCC (Bodin Punyaprateep)
/* ************************************************************************** */

var KABOOM = KABOOM || (function () {

  // This script allows GMs to send things flying!
  // Please read the README.md found in the Roll20-api-scripts repository

  var version = '1.1',
    lastUpdate = 1487311392,
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
      'scattering': true,
      'explosion_ratio': 2,
      'default_layer': 'objects',
      'gm_only': true,
      'drawings_only': false,
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
      state.KABOOM.gm_only = g['GM only'] === 'true' ? true : false
      state.KABOOM.drawings_only = g['Affect drawings only'] === 'true' ? true : false
      state.KABOOM.walls_stop_movement = g['Dynamic Lighting walls stop movement'] === 'true' ? true : false
    }
  }

  var checkCollision = function (pathToMove, walls) {
    if (!walls) return pathToMove[1]
    var intersect = getCollisionPoint(pathToMove, walls)
    if (intersect) {
      var obj1, obj2, d_x, d_y, theta, distance, new_d_x, new_d_y, new_x, new_y
      obj1 = pathToMove[0]
      obj2 = intersect[0]
      d_x = obj2[0] - obj1[0]
      d_y = obj2[1] - obj1[1]
      distance = Math.sqrt((d_x * d_x) + (d_y * d_y))
      if (distance <= 30) return pathToMove[0]
      else distance -= 30
      theta = Math.atan2(d_y, d_x)
      new_d_x = Math.cos(theta) * distance
      new_d_y = Math.sin(theta) * distance
      new_x = obj1[0] + new_d_x
      new_y = obj1[1] + new_d_y
      return [new_x, new_y]
    } else {
      return pathToMove[1]
    }
  }

  // Creates the explosion VFX
  var createExplosion = function (explosion, options) {
    if (options.effectPower < 0) {
      spawnFx(explosion.position[0], explosion.position[1], `nova-${options.type}`, explosion.pageid)
    } else {
      spawnFx(explosion.position[0], explosion.position[1], `explode-${options.type}`, explosion.pageid)
    }
  }

  // Returns an array of all valid drawings to move
  var findGraphics = function (token) {
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
    wallArray = findObjs({
      'layer': 'walls',
      '_type': 'path',
      '_pageid': pageid
    })
    // This is to make the array nice and find out where the points actually are
    var completePointArray = _.map(wallArray, function(wall) {
      var pathTuple = JSON.parse(wall.get('path')),
      transformInfo = PathMath.getTransformInfo(wall),
      pointArray = _.map(pathTuple, (tuple => PathMath.tupleToPoint(tuple, transformInfo)))
      return pointArray
    })
    return completePointArray
  }

  var getCollisionPoint = function (pathToMove, walls) {
    var intersect, closestIntersect, intersectArray = []
    // For each object in the walls array...
    for (var a = 0; a < walls.length; a++) {
      // For each path segment of each object...
      for (var b = 0; b < walls[a].length - 1; b++) {
        intersect = PathMath.segmentIntersection(pathToMove, [walls[a][b], walls[a][b + 1]])
        if (intersect) intersectArray.push(intersect)
      }
    }
    closestIntersect = _.chain(intersectArray)
      .sortBy(value => value[1])
      .first()
      .value()
    return closestIntersect
  }

  // Returns an array of the input object's coordinates
  var getCoordinates = function (obj) {
    return [obj.get('left'), obj.get('top')]
  }

  var getPageInfo = function (pageid) {
    var page = getObj('page', pageid)
    if (!page) return
    return {
      scale: 70 / page.get('scale_number'),
      max_x: page.get('width') * 70,
      max_y: page.get('height') * 70
    }
  }

  var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Returns the 'weight' of the object (to modify distance thrown) from 0 to 1
  // If the weight is lower than min_threshold, the returned value scales from 1 to 2.
  // If the weight is higher than max_threshold, the returned value is always 0
  var getWeight = function (weight, min_threshold, max_threshold) {
    return min_threshold > max_threshold ? 0
            : weight < min_threshold ? 1
            : weight > max_threshold ? 0
            : -(weight - min_threshold) / (max_threshold - min_threshold) + 1
  }

  // Handles chat input
  var handleChatInput = function (msg) {
    if (msg.type !== 'api' || (state.KABOOM.gm_only && !playerIsGM(msg.playerid))) return
    var args = msg.content.split(/\s/)
    switch (args[0].toUpperCase()) {
      case '!KABOOM':
        if (args.length === 1) { showHelp(msg.who); return }
        var options = parseOptions(args.slice(1))
        if (!options.effectPower) {
          return
        } else if (options.effectRadius && (options.effectPower > options.effectRadius)) {
          printToChat(msg.who, 'Effect radius must be higher than the effect power')
          return
        } else if (!msg.selected) {
          printToChat(msg.who, 'Please select one token to designate the center of the explosion.')
          return
        }
        prepareExplosion(options, getObj('graphic', msg.selected[0]._id))
    }
  }

  // **************************************************************************
  // * The important function - moveGraphic handles all distance calculations *
  // **************************************************************************
  var moveGraphic = function (flying_object, explosion_center, options, page, walls) {
    var obj1, obj2, d_x, d_y, distance, distance_weight, item_weight, d_distance,
      movement_vector, new_distance, theta, new_d_x, new_d_y, new_x, new_y, intersect

    if (flying_object.id === explosion_center.id) return

    // Separate objects from coords
    obj1 = explosion_center.position
    obj2 = getCoordinates(flying_object)

    // Is there a wall in the way?
    intersect = state.KABOOM.walls_stop_movement
      ? getCollisionPoint([[obj1[0], obj1[1], 1], [obj2[0], obj2[1], 1]], walls)
      : false
    if (intersect) return

    // ARE OUR COORDS OKAY?
    if (obj1[0] < 0 || obj1[1] < 0 ||
      obj1[0] > page.max_x || obj1[1] > page.max_y ||
      obj2[0] < 0 || obj2[1] < 0 ||
      obj2[0] > page.max_x || obj2[1] > page.max_y)
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
    distance = Math.sqrt((d_x*d_x) + (d_y*d_y))

    // Calculate new distance
    item_weight = getWeight(flying_object.get('width') * flying_object.get('height') / 4900, state.KABOOM.min_size, state.KABOOM.max_size)
    distance_weight = getWeight(distance, Math.abs(options.effectPower * page.scale), options.effectRadius * page.scale)
    d_distance = options.effectPower * page.scale
                * (distance_weight + 0.2 - 0.2 * distance_weight)
                * (state.KABOOM.ignore_size ? 1 : item_weight)
                * (options.scatter ? getRandomInt(50, 100) / 100 : 1)
    if (d_distance === 0) return

    // If moving towards a point, don't overshoot it
    if (options.effectPower < 0 && Math.abs(d_distance) > distance) {
      new_distance = 0
    } else {
      new_distance = distance + d_distance
    }

    // Calculate new location
    theta = Math.atan2(d_y, d_x) + (options.scatter ? (getRandomInt(0, 60) - 30) / 360 * Math.PI * distance_weight : 0)
    new_d_x = Math.cos(theta) * new_distance
    new_d_y = Math.sin(theta) * new_distance
    new_x = obj1[0] + new_d_x
    new_y = obj1[1] + new_d_y

    // Check intersection with walls here
    movement_vector = checkCollision([[obj2[0], obj2[1], 1], [new_x, new_y, 1]], walls)
    new_x = movement_vector[0]
    new_y = movement_vector[1]

    // QA STUFF HERE
    new_x = new_x > page.max_x ? page.max_x : new_x < 0 ? 0 : new_x
    new_y = new_y > page.max_y ? page.max_y : new_y < 0 ? 0 : new_y

    flying_object.set({'left': new_x, 'top': new_y})
  }

// This is the function that is exposed externally. You can call it in other
// scripts (as long as this is installed) with "KABOOM.NOW(param1, param2)"

  var prepareExplosion = function (rawOptions, rawCenter) {
    // Check if our inputs are valid
    var options = verifyOptions(rawOptions)
    var explosion_center = verifyObject(rawCenter)
    var pageInfo = getPageInfo(explosion_center.pageid)

    // Error checking for API users
    if (!options.effectPower || !explosion_center.position) {
      log('KABOOM - Effect power and/or explosion center missing.')
      return
    } else if (options.effectPower > options.effectRadius) {
      log('KABOOM - Effect radius must always be higher than effect power.')
      return
    } else if (!pageInfo) {
      log('KABOOM - Pageid supplied does not exist.')
      return
    }

    // findObjs arrays here
    var affectedObjects = findGraphics(explosion_center)
    var walls = state.KABOOM.walls_stop_movement
      ? findWalls(explosion_center.pageid)
      : false

    for (var i = 0; i < affectedObjects.length; i++) {
      if (moveGraphic(affectedObjects[i], explosion_center, options, pageInfo, walls) === 'failed') break
    }
    if (options.vfx) createExplosion(explosion_center, options)
  }

  /*********************** END OF EXPOSED FUNCTION ****************************/

  // Returns an object with options parsed from chat messages.
  var parseOptions = function (input) {
    var settingsUnchanged = true
    var options = {
      effectPower: parseFloat(input[0]).toString() === input[0] ? parseFloat(input[0]) : undefined,
      effectRadius: parseFloat(input[1]).toString() === input[1] ? parseFloat(input[1]) : undefined
    }
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
          else if (input[i + 1] === 'scatter') options['scatter'] = false
          break

        case 'no-scatter':
          options['scatter'] = false
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
      // We check here if they want a specific type of explosion. Last command wins.
      if (_.contains(VFXtypes, input[i].slice(2))) options['type'] = input[i].slice(2)
      switch (input[i].slice(2)) {

        case 'drawings-only':
          if (input[i + 1] === 'on') state.KABOOM.drawings_only = true
          else if (input[i + 1] === 'off') state.KABOOM.drawings_only = false
          printToChat('gm', `Explosions will now move ${state.KABOOM.drawings_only ? 'only tokens labeled as drawings' : 'all tokens'}.`)
          break

        case 'type':
          if (_.contains(VFXtypes, input[i + 1])) state.KABOOM.default_type = input[i + 1]
          printToChat('gm', `The default explosion type is now ${state.KABOOM.default_type}.`)
          break

        case 'vfx':
          if (input[i + 1] === 'on') state.KABOOM.vfx = true
          else if (input[i + 1] === 'off') state.KABOOM.vfx = false
          printToChat('gm', `VFX are now ${state.KABOOM.vfx ? 'enabled' : 'disabled'} on explosions.`)
          break

        case 'same-layer':
          if (input[i + 1] === 'on') state.KABOOM.same_layer_only = true
          else if (input[i + 1] === 'off') state.KABOOM.same_layer_only = false
          printToChat('gm', `Objects ${state.KABOOM.same_layer_only ? 'must be' : "don't have to be"} on the same layer as the explosion token now.`)
          settingsUnchanged = false
          break

        case 'scattering':
          if (input[i + 1] === 'on') state.KABOOM.scattering = true
          else if (input[i + 1] === 'off') state.KABOOM.scattering = false
          printToChat('gm', `By default, scattering is ${state.KABOOM.scattering ? 'active' : 'inactive'}.`)
          break

        case 'ignore-size':
          if (input[i + 1] === 'on') state.KABOOM.ignore_size = true
          else if (input[i + 1] === 'off') state.KABOOM.ignore_size = false
          printToChat('gm', `An object's size is now ${state.KABOOM.ignore_size ? 'ignored' : 'included'} in distance calculations.`)
          break

        case 'min-size':
          if (parseFloat(input[i + 1]).toString() === input[i + 1]) state.KABOOM.min_size = parseFloat(input[i + 1])
          printToChat('gm', `All objects smaller than ${state.KABOOM.min_size} square(s) are now considered light.`)
          break

        case 'max-size':
          if (parseFloat(input[i + 1]).toString() === input[i + 1]) state.KABOOM.max_size = parseFloat(input[i + 1])
          printToChat('gm', `All objects larger than ${state.KABOOM.max_size} square(s) are now considered too heavy to move.`)
          break

        case 'reset':
          state.KABOOM = defaultState
          printToChat('gm', `KABOOM has reset its internal state.`)
          break

        case 'walls':
          if (input[i + 1] === 'on') state.KABOOM.walls_stop_movement = true
          else if (input[i + 1] === 'off') state.KABOOM.walls_stop_movement = false
          printToChat('gm', `The script now ${state.KABOOM.walls_stop_movement ? 'observes' : 'ignores'} walls when calculating movement.`)
          break

        case 'help':
          showHelp('gm')
          break
      }
    } // End Input Check Loop!
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
                    `${state.KABOOM.vfx ? 'Script creates VFX' : 'Not active'}</ul>` +
                  '<ul><b>Default Explosion Colour</b><br> (<b>--type</b>): ' +
                    `${state.KABOOM.default_type.toUpperCase()}</ul>` +
                  '<ul><b>Affected Layers</b><br> (<b>--same-layer</b>):<br>' +
                    `${state.KABOOM.same_layer_only ? 'Selected token layer only' : 'All layers'}</ul>` +
                  '<ul><b>Affects Drawings Only</b><br> (<b>--drawings-only</b>):<br>' +
                    `${state.KABOOM.drawings_only ? 'Only moves tokens labeled "drawings"' : 'Affects all tokens in range'}</ul>` +
                  '<ul><b>Scattering</b> (<b>--scattering</b>):<br>' +
                    `${state.KABOOM.scattering ? 'Objects are scattered semi-randomly' : 'Objects are thrown predictably'}</ul>` +
                  '<ul><b>Behaviour with Dynamic Lighting Walls</b> (<b>--walls</b>):<br>' +
                    `${state.KABOOM.walls_stop_movement ? 'Walls block explosions and stop token movement' : 'Script ignores dynamic lighting walls'}</ul>` +
                  '<ul><b>Size Consideration</b><br> (<b>--ignore-size</b>):<br>' +
                    `${state.KABOOM.ignore_size ? 'All objects move the same distance' : 'Larger objects move less distance'}</ul>` +
                  '<ul><b>Light Object Size</b><br> (<b>--min-size</b>):<br>' +
                    `<p style="font-size:85%;">Objects ${state.KABOOM.min_size} square(s) or smaller are moved at maximum speed.</p></ul>` +
                  '<ul><b>Heavy Object Size</b><br> (<b>--max-size</b>):<br>' +
                    `<p style="font-size:85%;">Objects ${state.KABOOM.max_size} square(s) or larger are too heavy to move.</p></ul>` +
                  '<hr style="background:#000000; border:0; height:7px" />' +
                  '</div>' +
                  '<div style="">' +
                  '<p style="font-size:90%;">To use <span style="color:#FF9900">KABOOM</span> as a macro or chat command, follow this format:<br>' +
                  '<span style="color:#888888">!KABOOM 15 30 --vfx on</span><br>' +
                  'or<br>' +
                  '<span style="color:#888888">!KABOOM Power Radius --options on/off</span></p>' +
                  '</div>' +
                  '<div>' +
                  `<p style="font-size:90%;"> To change one or more of KABOOM's settings, enter <span style="color:#FF9900">!KABOOM</span> ` +
                  `before one or more of the commands listed above, followed by an 'on' or 'off'.` +
                  '</p>' +
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
    if (parseFloat(options) === options) {
      return {
        effectPower: options,
        effectRadius: Math.abs(options * state.KABOOM.explosion_ratio),
        type: state.KABOOM.default_type,
        scatter: state.KABOOM.scattering,
        vfx: state.KABOOM.vfx
      }
    } else {
      return {
        effectPower: (parseFloat(options.effectPower) === options.effectPower)
          ? options.effectPower : false,
        effectRadius: (parseFloat(options.effectRadius) === options.effectRadius)
          ? Math.abs(options.effectRadius) : Math.abs(options.effectPower * state.KABOOM.explosion_ratio),
        type: (_.contains(VFXtypes, options.type))
          ? options.type : state.KABOOM.default_type,
        scatter: (typeof options.scatter === 'boolean')
          ? options.scatter : state.KABOOM.scattering,
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
    NOW: prepareExplosion,
    CheckVersion: checkVersion,
    RegisterEventHandlers: registerEventHandlers
  }
}())

on('ready', function () {
  'use strict'
  KABOOM.CheckVersion()
  KABOOM.RegisterEventHandlers()
})
