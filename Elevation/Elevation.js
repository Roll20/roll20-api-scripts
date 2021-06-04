var Elevation =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = _;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Roll20 = __webpack_require__(2);
const Logger = __webpack_require__ (3);
const _ = __webpack_require__(0);


const roll20 = new Roll20();
const myState = roll20.getState('Elevation');
const logger = new Logger('Elevation', roll20);
let currentLevel = 0;
let defining = false;
myState.defs = myState.defs || {};


roll20.logWrap = 'roll20';

function registerHandlers() {
  roll20.on('chat:message', (msg) => {
    if (msg.type === 'api' && msg.content.startsWith('!elevation')) {
      const cmd = msg.content.split('-')[1];
      currentLevel = parseInt(cmd.split(/\s/)[1], 10);
      defining = cmd.startsWith('define');
      const pageId = roll20.getObj('player', msg.playerid).get('lastpage');
      if (defining) {
        myState.defs[pageId] = myState.defs[pageId] || [];
        myState.defs[pageId][currentLevel] = myState.defs[pageId][currentLevel] || {
          mapGraphicIds: [],
          dlGraphicIds: [],
        };
      }
      else {
        _.each(myState.defs[pageId], (graphicDetails, elevationLevel) => {

          graphicDetails.mapGraphicIds = graphicDetails.mapGraphicIds.filter((id) => {
            const graphic = roll20.getObj('graphic', id);
            if (graphic) {
              graphic.set('layer', currentLevel === elevationLevel ? 'map' : 'gmlayer');
              return true;
            }
            return false;
          });
          graphicDetails.dlGraphicIds = graphicDetails.dlGraphicIds.filter((id) => {
            const path = roll20.getObj('path', id);
            if (path) {
              path.set('layer', currentLevel === elevationLevel ? 'walls' : 'gmlayer');
              return true;
            }
            return false;
          });
        });
      }
    }
  });

  roll20.on('add:graphic', (graphic) => {
    logger.info('Adding graphic $$$', graphic);
    if(!defining || graphic.get('layer') !== 'map') return;

    const pageId = graphic.get('pageid');
    myState.defs[pageId][currentLevel].mapGraphicIds.push(graphic.id);

  });

  roll20.on('add:path', (path) => {
    logger.info('Adding path $$$', path);
    if(!defining || path.get('layer') !== 'walls') return;

    const pageId = path.get('pageid');
    myState.defs[pageId][currentLevel].dlGraphicIds.push(path.id);
  });
}

roll20.on('ready', registerHandlers);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* globals state, createObj, findObjs, getObj, getAttrByName, sendChat, on, log, Campaign, playerIsGM, spawnFx,
 spawnFxBetweenPoints, filterObjs, randomInteger, setDefaultTokenForCharacter, onSheetWorkerCompleted */

const _ = __webpack_require__(0);

const CLEAR_IMG = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659';

// noinspection JSUnusedLocalSymbols
module.exports = class Roll20 {

  getState(module) {
    if (!state[module]) {
      state[module] = {};
    }
    return state[module];
  }

  createObj(type, attributes) {
    if (type === 'character' && !attributes.avatar) {
      attributes.avatar = CLEAR_IMG;
    }
    return createObj(type, attributes);
  }

  findObjs(attributes, options) {
    return findObjs(attributes, options);
  }

  filterObjs(attributes) {
    return filterObjs(attributes);
  }

  getObj(type, id) {
    return getObj(type, id);
  }

  getOrCreateObj(type, attributes, findOptions) {
    const newAttributes = _.extend(_.clone(attributes), { type });
    const existing = this.findObjs(newAttributes, findOptions);
    switch (existing.length) {
      case 0:
        return this.createObj(type, newAttributes);
      case 1:
        return existing[0];
      default:
        throw new Error(`Asked for a single ${type} but more than 1 was found matching attributes: ` +
          `${JSON.stringify(attributes)}. Found attributes: ${JSON.stringify(existing)}`);
    }
  }

  getAttrByName(characterId, attrName, valueType, dontDefaultOrExpand) {
    if (dontDefaultOrExpand) {
      const attr = this.getAttrObjectByName(characterId, attrName);
      return attr && attr.get(valueType || 'current');
    }
    return getAttrByName(characterId, attrName, valueType);
  }

  checkCharacterFlag(characterId, flag) {
    const value = this.getAttrByName(characterId, flag);
    switch (typeof value) {
      case 'boolean':
        return value;
      case 'number':
        return !!value;
      default:
        return value === '1' || value === 'on';
    }
  }

  getAttrObjectByName(characterId, attrName) {
    const attr = this.findObjs({ type: 'attribute', characterid: characterId, name: attrName },
      { caseInsensitive: true });
    return attr && attr.length > 0 ? attr[0] : null;
  }

  getOrCreateAttr(characterId, attrName) {
    return this.getOrCreateObj('attribute', { characterid: characterId, name: attrName }, { caseInsensitive: true });
  }

  setAttrByName(characterId, attrName, value) {
    this.getOrCreateAttr(characterId, attrName).set('current', value);
  }

  processAttrValue(characterId, attrName, cb) {
    const attribute = this.getOrCreateAttr(characterId, attrName);
    const newVal = cb(attribute.get('current'));
    attribute.set('current', newVal);
    return newVal;
  }

  getRepeatingSectionAttrs(characterId, sectionName) {
    const prefix = `repeating_${sectionName}`;
    return _.filter(this.findObjs({ type: 'attribute', characterid: characterId }),
      attr => attr.get('name').indexOf(prefix) === 0);
  }

  getRepeatingSectionItemIdsByName(characterId, sectionName) {
    const re = new RegExp(`repeating_${sectionName}_([^_]+)_name$`);
    return _.reduce(this.getRepeatingSectionAttrs(characterId, sectionName),
      (lookup, attr) => {
        const match = attr.get('name').match(re);
        if (match) {
          lookup[attr.get('current').toLowerCase()] = match[1];
        }
        return lookup;
      }, {});
  }

  getCurrentPage(playerId) {
    let pageId;
    if (this.playerIsGM(playerId)) {
      pageId = this.getObj('player', playerId).get('lastpage');
    }
    else {
      pageId = this.getCampaign().get('playerspecificpages')[playerId] || this.getCampaign().get('playerpageid');
    }

    return pageId ? this.getObj('page', pageId) : null;
  }

  spawnFx(pointsArray, fxType, pageId) {
    switch (pointsArray.length) {
      case 1:
        spawnFx(pointsArray[0].x, pointsArray[0].y, fxType, pageId);
        break;
      case 2:
        spawnFxBetweenPoints(pointsArray[0], pointsArray[1], fxType, pageId);
        break;
      default:
        throw new Error('Wrong number of points supplied to spawnFx: $$$', pointsArray);
    }
  }

  playerIsGM(playerId) {
    return playerIsGM(playerId);
  }

  getCampaign() {
    return Campaign(); // eslint-disable-line
  }

  sendChat(sendAs, message, callback, options) {
    return sendChat(sendAs, message, callback, options);
  }

  on(event, callback) {
    return on(event, callback);
  }

  randomInteger(max) {
    return randomInteger(max);
  }

  log(msg) {
    return log(msg);
  }

  setDefaultTokenForCharacter(character, token) {
    return setDefaultTokenForCharacter(character, token);
  }

  onSheetWorkerCompleted(cb) {
    onSheetWorkerCompleted(cb);
  }

  setAttrWithWorker(characterId, attrName, attrValue, cb) {
    const attr = this.getOrCreateAttr(characterId, attrName);
    if (cb) {
      onSheetWorkerCompleted(cb);
    }
    attr.setWithWorker({ current: attrValue });
  }

  createAttrWithWorker(characterId, attrName, attrValue, cb) {
    const attr = this.createObj('attribute', { characterid: characterId, name: attrName });
    if (cb) {
      onSheetWorkerCompleted(cb);
    }
    attr.setWithWorker({ current: attrValue });
  }
};



/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const _ = __webpack_require__(0);

function stringify(object) {
  if (object === undefined) {
    return object;
  }

  return typeof object === 'string' ? object : JSON.stringify(object, (key, value) =>
      (key !== 'logWrap' && key !== 'isLogWrapped' ? value : undefined)
    );
}

function wrapFunctions(object, moduleName, makeWrapper) {
  const funcs = getAllFuncs(object);
  return _.each(funcs, funcName => (object[funcName] = makeWrapper(funcName, object[funcName], moduleName)));
}

function getAllFuncs(obj) {
  let props = [];
  let current = obj;
  do {
    props = props.concat(Object.getOwnPropertyNames(current));
  } while ((current = Object.getPrototypeOf(current)) && current !== Object.prototype);

  return props.sort()
    .filter((e, i, arr) => (e !== arr[i + 1] && (typeof obj[e] === 'function') && obj[e] !== obj.constructor));
}

module.exports = class Logger {
  constructor(loggerName, roll20) {
    this.prefixString = '';
    const state = roll20.getState('roll20-logger');
    state[loggerName] = state[loggerName] || Logger.levels.INFO;

    roll20.on('chat:message', (msg) => {
      if (msg.type === 'api' && msg.content.startsWith('!logLevel')) {
        const parts = msg.content.split(/\s/);
        if (parts.length > 2) {
          if (!state[parts[1]]) {
            roll20.sendChat('Logger', `Unrecognised logger name ${parts[1]}`);
            return;
          }
          state[parts[1]] = Logger.levels[parts[2].toUpperCase()] || Logger.levels.INFO;
        }
      }
    });

    function shouldLog(level) {
      return level <= state[loggerName];
    }

    function outputLog(level, message) {
      if (!shouldLog(level)) {
        return;
      }

      const args = arguments.length > 2 ? _.toArray(arguments).slice(2) : [];
      let processedMessage = stringify(message);
      if (processedMessage) {
        processedMessage = processedMessage.replace(/\$\$\$/g, () => stringify(args.shift()));
      }
      // noinspection NodeModulesDependencies
      roll20.log(`${loggerName} ${Date.now()} ` +
        `${Logger.getLabel(level)} : ${shouldLog(Logger.levels.TRACE) ? this.prefixString : ''}` +
        `${processedMessage}`);
    }

    _.each(Logger.levels, (level, levelName) => {
      this[levelName.toLowerCase()] = _.partial(outputLog, level);
    });

    this.wrapModule = function wrapModule(modToWrap) {
      if (shouldLog(Logger.levels.TRACE)) {
        wrapFunctions(modToWrap, modToWrap.logWrap, this.wrapFunction.bind(this));
        modToWrap.isLogWrapped = true;
      }
      return modToWrap;
    };

    this.getLogLevel = function getLogLevel() {
      return state[loggerName] || Logger.levels.INFO;
    };

    this.setLogLevel = function setLogLevel(level) {
      if (typeof level === 'string') {
        level = Logger.levels[level.toUpperCase()];
      }
      if (typeof level === 'number' && level >= Logger.levels.OFF && level <= Logger.levels.TRACE) {
        state[loggerName] = level;
      }
    };

    this.getLogTap = function getLogTap(level, messageString) {
      return _.partial(outputLog, level, messageString);
    };

    this.wrapFunction = function wrapFunction(name, func, moduleName) {
      if (shouldLog(Logger.levels.TRACE)) {
        if (name === 'toJSON' || moduleName === 'roll20' && name === 'log') {
          return func;
        }
        const logger = this;
        return function functionWrapper() {
          logger.trace('$$$.$$$ starting with this value: $$$ and args $$$', moduleName, name, this, arguments);
          logger.prefixString = `${logger.prefixString}  `;
          const retVal = func.apply(this, arguments);
          logger.prefixString = logger.prefixString.slice(0, -2);
          logger.trace('$$$.$$$ ending with return value $$$', moduleName, name, retVal);
          if (retVal && retVal.logWrap && !retVal.isLogWrapped) {
            logger.wrapModule(retVal);
          }
          return retVal;
        };
      }
      return func;
    };
  }

  static getLabel(logLevel) {
    const logPair = _.chain(Logger.levels).pairs().find(pair => pair[1] === logLevel).value();
    return logPair ? logPair[0] : 'UNKNOWN';
  }

  static get levels() {
    return {
      OFF: 0,
      ERROR: 1,
      WARN: 2,
      INFO: 3,
      DEBUG: 4,
      TRACE: 5,
    };
  }
};


/***/ })
/******/ ]);