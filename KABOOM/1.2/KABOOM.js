// Github: https://github.com/bpunya/roll20-api/blob/master/KABOOM/1.2/KABOOM.js
// README: https://github.com/bpunya/roll20-api/blob/master/KABOOM/README.md
// Author: PaprikaCC (Bodin Punyaprateep)
/* ************************************************************************** */

var KABOOM = KABOOM || (function () {

  // This script allows GMs to send things flying!
  // Please read the README.md found in the Roll20-api-scripts repository

  var version = '1.2',
    lastUpdate = 1487619046,

    VFXtypes = {
      'acid': {
        "startColour":		[50, 50, 50, 1],
        "startColourRandom":[0, 10, 10, 0.25],
        "endColour":		[0, 75, 30, 0],
        "endColourRandom":	[0, 20, 20, 0]
      },
      'blood': {
        "startColour":		[175, 0, 0, 1],
        "startColourRandom":[20, 0, 0, 0],
        "endColour":		[175, 0, 0, 0],
        "endColourRandom":	[20, 0, 0, 0]
      },
      'charm': {
        "startColour":		[200, 40, 150, 1],
        "startColourRandom":[25, 5, 20, 0.25],
        "endColour":		[200, 40, 150, 0],
        "endColourRandom":	[50, 10, 40, 0]
      },
      'death': {
        "startColour":		[10, 0, 0, 1],
        "startColourRandom":[5, 0, 0, 0.25],
        "endColour":		[20, 0, 0, 0],
        "endColourRandom":	[10, 0, 0, 0]
      },
      'fire': {
        "startColour":		[220, 35, 0, 1],
        "startColourRandom":[62, 0, 0, 0.25],
        "endColour":		[220, 35, 0, 0],
        "endColourRandom":	[60, 60, 60, 0]
      },
      'frost': {
        "startColour":		[90, 90, 175, 1],
        "startColourRandom":[0, 0, 0, 0.25],
        "endColour":		[125, 125, 255, 0],
        "endColourRandom":	[0, 0, 0, 0]
      },
      'holy': {
        "startColour":		[175, 130, 25, 1],
        "startColourRandom":[20, 10, 0, 0.25],
        "endColour":		[175, 130, 50, 0],
        "endColourRandom":	[20, 20, 20, 0]
      },
      'magic': {
        "startColour":		[50, 50, 50, 0.5],
        "startColourRandom":[150, 150, 150, 0.25],
        "endColour":		[128, 128, 128, 0],
        "endColourRandom":	[125, 125, 125, 0]
      },
      'slime': {
        "startColour":		[0, 250, 50, 1],
        "startColourRandom":[0, 20, 10, 0.25],
        "endColour":		[0, 250, 50, 0],
        "endColourRandom":	[20, 20, 20, 0]
      },
      'smoke': {
        "startColour":		[150, 150, 150, 1],
        "startColourRandom":[10, 10, 10, 0.5],
        "endColour":		[200, 200, 200, 0],
        "endColourRandom":	[10, 10, 10, 0]

      },
      'water': {
        "startColour":		[15, 15, 150, 1],
        "startColourRandom":[5, 5, 25, 0.25],
        "endColour":		[10, 10, 100, 0],
        "endColourRandom":	[10, 10, 25, 0]
      }
    },
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
    },

    Chat_Formatting_START = '<div style="background-color:#ffffff; padding:5px; border-width:2px; border-style:solid;">' +
                            '<div style="border-width:2px; border-style:dotted; padding:5px">',
    Chat_Formatting_END = '</div>' +
                          '</div>'

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
      state.KABOOM.gm_only = g['GM only'] === 'true'
      state.KABOOM.drawings_only = g['Affect drawings only'] === 'true'
      state.KABOOM.walls_stop_movement = g['Dynamic Lighting walls stop movement'] === 'true'
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

  // Handles VFX and prepares movement
  var createExplosion = function (explosion, options, pageInfo) {
    var scale = pageInfo.scale * Math.abs(options.effectPower) / 70
    var sparcity = options.effectRadius / Math.abs(options.effectPower) / state.KABOOM.explosion_ratio
    var VFXdata = getExplosionVFX(options.type, scale, sparcity)
    spawnFxWithDefinition(explosion.position[0], explosion.position[1], VFXdata, explosion.pageid)
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
    var completePointArray = _.map(wallArray, function (wall) {
      var pathTuple = JSON.parse(wall.get('path')),
      transformInfo = PathMath.getTransformInfo(wall),
      pointArray = _.map(pathTuple, (tuple => PathMath.tupleToPoint(tuple, transformInfo)))
      return pointArray
    })
    return completePointArray
  }

  var getCollisionPoint = function (pathToMove, walls) {
    var intersect, closestIntersect, intersectArray = []
    _.each(walls, function (wall) {
      for (var a = 0; a < wall.length - 1; a++) {
        intersect = PathMath.segmentIntersection(pathToMove, [wall[a], wall[a + 1]])
        if (intersect) intersectArray.push(intersect)
      }
    })
    closestIntersect = _.chain(intersectArray).sortBy(value => value[1]).first().value()
    return closestIntersect
  }

  // Returns an array of the input object's coordinates
  var getCoordinates = function (obj) {
    return [obj.get('left'), obj.get('top')]
  }

// Exposed through KABOOM.getExplosionVFX(@param1, @param2, @param3)
// Return an object to use with spawnFxWithDefinition()
// @param1 is a all colour data. You can use built in values by passing a string with the name of the value, or an custom VFX object.
// @param2 is a radius in units on the tabletop.
// @param3 is a sparcity value. Using 1 as a base, higher values reduces the amount of particles created.
  var getExplosionVFX = function (type, radius, sparcity) {
    radius = Math.abs(radius) || 2
    sparcity = Math.abs(sparcity) || 1
    var base = {
      "maxParticles": 300 / sparcity,
      "emissionRate": 300 / sparcity,
      "duration": 1,
	  "lifeSpan": 15,
	  "lifeSpanRandom": 3.5,
	  "angle": 0,
	  "angleRandom": 360,
      "size": 17.5 * radius * (1 + sparcity) / 2,
      "sizeRandom": 5 * radius * (1 + sparcity) / 2,
      "speed": 5 * radius * sparcity,
      "speedRandom": radius * sparcity / 2
    }
    var colour = type.startColour ? type : VFXtypes[type]
    return Object.assign(base, colour)
  }

  // Returns a neat object with page properties
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
  // If the weight is lower than min_threshold, the returned value is always 1
  // If the weight is higher than max_threshold, the returned value is always 0
  var getWeight = function (weight, min_threshold, max_threshold) {
    return min_threshold > max_threshold ? 0
            : weight < min_threshold ? 1
            : weight > max_threshold ? 0
            : -(weight - min_threshold) / (max_threshold - min_threshold) + 1
  }

  // Handles chat input
  var handleChatInput = function (msg) {
    if (msg.type !== 'api' || !playerIsGM(msg.playerid) && state.KABOOM.gm_only) return
    var args = msg.content.split(/\s/)
    switch (args[0].toUpperCase()) {
      case '!KABOOM':
        if (args.length === 1) { showHelp(msg.who); return }
        var options = parseOptions(args, playerIsGM(msg.playerid))
        var graphic = msg.selected
          ? getObj('graphic', msg.selected[0]._id)
          : getObj('graphic', _.find(args, id => getObj('graphic', id)))
        // Error checking!
        if (!options.effectPower) {
          return
        } else if (options.effectRadius && (options.effectPower > options.effectRadius)) {
          printToChat(msg.who, 'Effect radius must be higher than the effect power')
          return
        } else if (!graphic) {
          printToChat(msg.who, 'Please select one token to designate the center of the explosion.')
          return
        }
        prepareExplosion(options, graphic)
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
    d_distance = options.effectPower * page.scale * distance_weight *
                (state.KABOOM.ignore_size ? 1 : item_weight) *
                (options.scatter ? getRandomInt(75, 125) / 100 : 1)
    if (d_distance === 0) return

    // If moving towards a point, don't overshoot it
    new_distance = (options.effectPower < 0 && Math.abs(d_distance) > distance)
      ? 0 : distance + d_distance

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

  // Returns an object with options parsed from chat messages.
  // @input should be msg.content
  // @stateAccess is a boolean that determines if state can be accessed.
  var parseOptions = function (input, stateAccess) {
    var settingsUnchanged = true
    var options = {
      effectPower: parseFloat(input[1]).toString() === input[1] ? parseFloat(input[1]) : undefined,
      effectRadius: parseFloat(input[2]).toString() === input[2] ? parseFloat(input[2]) : undefined
    }
    for (var i = 1; i < input.length; i++) {
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

      // Settings saved in state are changed below.
      if (input[i].slice(0, 2) !== '--') continue
      if (_.contains(Object.keys(VFXtypes), input[i].slice(2))) options['type'] = input[i].slice(2)

      // Players should not be allowed past this point.
      if (!stateAccess) continue
      switch (input[i].slice(2)) {

        case 'drawings-only':
          if (input[i + 1] === 'on') state.KABOOM.drawings_only = true
          else if (input[i + 1] === 'off') state.KABOOM.drawings_only = false
          printToChat('gm', `Explosions will now move ${state.KABOOM.drawings_only ? 'only tokens labeled as drawings' : 'all tokens'}.`)
          break

        case 'type':
          if (_.contains(Object.keys(VFXtypes), input[i + 1])) state.KABOOM.default_type = input[i + 1]
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

// Exposed externally through KABOOM.NOW(@param1, @param2)
// Returns no value
// @param1 must contain the property 'effectPower'
// @param2 must contain the property 'position' as an array value
  var prepareExplosion = function (rawOptions, rawCenter) {
    // Check if our inputs are valid
    var options = verifyOptions(rawOptions)
    var explosion_center = verifyObject(rawCenter)
    var pageInfo = getPageInfo(explosion_center.pageid)

    // Error checking for API users
    if (!options.effectPower) {
      log('KABOOM - Effect power missing.')
      return
    } else if (!explosion_center.position) {
      log('KABOOM - Explosion center missing.')
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

    if (options.vfx) {
      if (options.effectPower > 0) {
        createExplosion(explosion_center, options, pageInfo)
        _.each(affectedObjects, object => moveGraphic(object, explosion_center, options, pageInfo, walls))
      } else {
        createExplosion(explosion_center, options, pageInfo)
        setTimeout(function() {
          createExplosion(explosion_center, options, pageInfo)
        }, 100)
        setTimeout(function() {
          _.each(affectedObjects, object => moveGraphic(object, explosion_center, options, pageInfo, walls))
        }, 500)
      }
    } else {
      _.each(affectedObjects, object => moveGraphic(object, explosion_center, options, pageInfo, walls))
    }
  }

  /*********************** END OF EXPOSED FUNCTION ****************************/

  // Help HTML hosted here.
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
                  `<p style="font-size:90%;"> To change one or more of <span style="color:#FF9900">KABOOM</span>'s settings, enter !KABOOM ` +
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
        type: (_.contains(Object.keys(VFXtypes), options.type))
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
    getExplosionVFX: getExplosionVFX,
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
