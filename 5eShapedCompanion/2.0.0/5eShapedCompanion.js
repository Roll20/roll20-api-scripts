var ShapedScripts =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const Roll20 = __webpack_require__(1);
	const roll20 = new Roll20();
	const parseModule = __webpack_require__(3);
	const mmFormat = __webpack_require__(4);
	const myState = roll20.getState('ShapedScripts');
	const Logger = __webpack_require__(5);
	const logger = new Logger('5eShapedCompanion', myState.config, roll20);
	const EntityLookup = __webpack_require__(6);
	const JSONValidator = __webpack_require__(8);
	const el = new EntityLookup();
	const Reporter = __webpack_require__(9);
	const reporter = new Reporter(roll20, 'Shaped Scripts');
	const ShapedScripts = __webpack_require__(10);
	const srdConverter = __webpack_require__(18);
	const sanitise = __webpack_require__(19);
	const mpp = __webpack_require__(20);
	const shaped = new ShapedScripts(logger, myState, roll20, parseModule.getParser(mmFormat, logger), el, reporter,
	  srdConverter, sanitise, mpp);
	const _ = __webpack_require__(2);

	roll20.logWrap = 'roll20';
	logger.wrapModule(el);
	logger.wrapModule(roll20);
	logger.wrapModule(srdConverter);

	const jsonValidator = new JSONValidator(__webpack_require__(4));
	el.configureEntity('monsters', [
	  EntityLookup.jsonValidatorAsEntityProcessor(jsonValidator),
	  el.getSpellHydrator(),
	], EntityLookup.jsonValidatorAsVersionChecker(jsonValidator));
	el.configureEntity('spells', [el.getMonsterSpellUpdater()], EntityLookup.getVersionChecker('0.2.1'));

	roll20.on('ready', () => {
	  shaped.checkInstall();
	  shaped.registerEventHandlers();
	});

	module.exports = {
	  addEntities(entities) {
	    try {
	      if (typeof entities === 'string') {
	        entities = JSON.parse(entities);
	      }
	      // Suppress excessive logging when adding big lists of entities
	      const prevLogLevel = myState.config.logLevel;
	      myState.config.logLevel = Logger.INFO;
	      const result = el.addEntities(entities);
	      myState.config.logLevel = prevLogLevel;
	      const summary = _.mapObject(result, (resultObject, type) => {
	        if (type === 'errors') {
	          return resultObject.length;
	        }

	        return _.mapObject(resultObject, operationResultArray => operationResultArray.length);
	      });
	      logger.info('Summary of adding entities to the lookup: $$$', summary);
	      logger.info('Details: $$$', result);
	      if (!_.isEmpty(result.errors)) {
	        const message = _.chain(result.errors)
	          .groupBy('entity')
	          .mapObject(entityErrors =>
	            _.chain(entityErrors)
	              .pluck('errors')
	              .flatten()
	              .value()
	          )
	          .map((errors, entityName) => `<li>${entityName}:<ul><li>${errors.join('</li><li>')}</li></ul></li>`)
	          .value();

	        reporter.reportError(`JSON import error:<ul>${message}</ul>`);
	      }
	    }
	    catch (e) {
	      reporter.reportError('JSON parse error, please see log for more information');
	      logger.error(e.toString());
	      logger.error(e.stack);
	    }
	  },
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* globals state, createObj, findObjs, getObj, getAttrByName, sendChat, on, log, Campaign, playerIsGM, spawnFx,
	 spawnFxBetweenPoints, filterObjs */
	'use strict';
	const _ = __webpack_require__(2);

	// noinspection JSUnusedGlobalSymbols
	module.exports = class Roll20Wrapper {

	  getState(module) {
	    if (!state[module]) {
	      state[module] = {};
	    }
	    return state[module];
	  }

	  createObj(type, attributes) {
	    return createObj(type, attributes);
	  }

	  findObjs(attributes) {
	    return findObjs(attributes);
	  }

	  filterObjs(attributes) {
	    return filterObjs(attributes);
	  }

	  getObj(type, id) {
	    return getObj(type, id);
	  }

	  getOrCreateObj(type, attributes) {
	    const newAttributes = _.extend(_.clone(attributes), { type });
	    const existing = this.findObjs(newAttributes);
	    switch (existing.length) {
	      case 0:
	        return this.createObj(type, newAttributes);
	      case 1:
	        return existing[0];
	      default:
	        throw new Error(`Asked for a single ${type} but more than 1 was found matching attributes: ` +
	          `${JSON.stringify(attributes)}`);
	    }
	  }

	  getAttrByName(character, attrName, valueType) {
	    return getAttrByName(character, attrName, valueType);
	  }

	  getAttrObjectByName(character, attrName) {
	    const attr = this.findObjs({ type: 'attribute', characterid: character, name: attrName });
	    return attr && attr.length > 0 ? attr[0] : null;
	  }

	  getOrCreateAttr(characterId, attrName) {
	    return this.getOrCreateObj('attribute', { characterid: characterId, name: attrName });
	  }

	  setAttrByName(characterId, attrName, value) {
	    this.getOrCreateAttr(characterId, attrName).set('current', value);
	  }

	  processAttrValue(characterId, attrName, cb) {
	    const attribute = this.getOrCreateAttr(characterId, attrName);
	    attribute.set('current', cb(attribute.get('current')));
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

	  log(msg) {
	    return log(msg);
	  }
	};



/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = _;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);

	/**
	 * A specification of a field that can appear
	 * in the format that this parser processes
	 * @typedef {Object} FieldSpec
	 * @property {FieldSpec[]} [contentModel] - list of child fieldSpecs for complex content
	 * @property {boolean} [bare] - if true this field appears as a bare value with no parseToken in front of it
	 * @property {string} [parseToken] - the token that defines the beginning of this field (usually case insensitive). Not
	 *   used for bare tokens.
	 * @property {string} [pattern] - a pattern that defines the value of this field. For bare properties this will
	 *   determine if the field matches at all, whereas for normal ones this will just be used to validate them
	 * @property {number} [forNextMatchGroup] - the 1-based index of the match group from the supplied pattern that will
	 *   contain text that should be handed to the next parser rather than used as part of this field.
	 * @property {number} [forPreviousMatchGroup] - the 1-based index of the match group from the supplied pattern that
	 *   will contain text that should be handed to the previous parser to complete its value rather than used as part of
	 *   this field. Only applicable to bare properties, since ones with a token have a clearly defined start based on the
	 *   parseToken
	 * @property {number} [matchGroup=0] - the index of the capturing group in the supplied pattern to use as the value for
	 *   this field. If left at the default of 0, the whole match will be used.
	 * @property {boolean} [caseSensitive=false] - If true, the pattern used for the value of this field will be made case
	 *   sensitive. Note that parseToken matching is always case insensitive.
	 * @property {string} type - the type of this field. Currently valid values are [orderedContent, unorderedContent,
	 *   string, enumType, integer, abililty]
	 * @property {string[]} enumValues - an array of valid values for this field if the type is enumType
	 * @property {number} [minOccurs=1] - the minimum number of times this field should occur in the parent content model.
	 * @property {number} [maxOccurs=1] - the maximum number of times this field should occur in the parent content model.
	 */


	/**
	 *
	 * @param {FieldSpec} formatSpec - Root format specification for this parser
	 * @param logger - Logger object to use for reporting errors etc.
	 * @returns {{parse: ((*))}} - A parser that will process text in the format specified by the supplied formatSpec into
	 *   JSON objects
	 */
	function getParser(formatSpec, logger) {
	  // noinspection JSUnusedGlobalSymbols
	  const parserModule = {

	    makeContentModelParser(fieldSpec, ordered) {
	      const module = this;
	      return {
	        parse(stateManager, textLines, resume) {
	          const parseState = stateManager.enterChildParser(this, resume);
	          let someMatch = false;
	          let canContinue;
	          let stopParser = null;

	          parseState.subParsers = parseState.subParsers || module.makeParserList(fieldSpec.contentModel);


	          if (parseState.resumeParser) {
	            if (!parseState.resumeParser.resumeParse(stateManager, textLines)) {
	              stateManager.leaveChildParser(this);
	              return false;
	            }

	            someMatch = true;
	          }

	          function parseRunner(parser, index, parsers) {
	            if (!parser.parse(stateManager, textLines)) {
	              if (parser.required === 0 || !ordered) {
	                // No match but it's ok to keep looking
	                // through the rest of the content model for one
	                return false;
	              }

	              // No match but one was required here by the content model
	            }
	            else {
	              parser.justMatched = true;
	              if (parser.required > 0) {
	                parser.required--;
	              }
	              parser.allowed--;
	              if (ordered) {
	                // Set all the previous parsers to be exhausted since we've matched
	                // this one and we're in a strictly ordered content model.
	                _.each(parsers.slice(0, index), _.partial(_.extend, _, { allowed: 0 }));
	              }
	            }
	            return true;
	          }

	          do {
	            stopParser = _.find(parseState.subParsers, parseRunner);
	            logger.debug('Stopped at parser $$$', stopParser);
	            canContinue = stopParser && stopParser.justMatched;
	            if (stopParser) {
	              someMatch = someMatch || stopParser.justMatched;
	              stopParser.justMatched = false;
	            }

	            // Lose any parsers that have used up all their cardinality already
	            parseState.subParsers = _.reject(parseState.subParsers, { allowed: 0 });
	          } while (!_.isEmpty(parseState.subParsers) && !_.isEmpty(textLines) && canContinue);

	          stateManager.leaveChildParser(this, someMatch ? parseState : undefined);

	          return someMatch;
	        },

	        resumeParse(stateManager, textLines) {
	          return this.parse(stateManager, textLines, true);
	        },
	        complete(parseState/* , finalText*/) {
	          const missingContent = _.filter(parseState.subParsers, 'required');
	          if (!_.isEmpty(missingContent)) {
	            throw new MissingContentError(missingContent);
	          }
	        },
	      };
	    },

	    matchParseToken(myParseState, textLines) {
	      if (_.isEmpty(textLines) || this.bare) {
	        return !_.isEmpty(textLines);
	      }

	      const re = new RegExp(`^(.*?)(${this.parseToken})(?:[\\s.]+|$)`, 'i');
	      const match = textLines[0].match(re);
	      if (match) {
	        logger.debug('Found match $$$', match[0]);
	        myParseState.forPrevious = match[1];
	        myParseState.text = '';
	        textLines[0] = textLines[0].slice(match[0].length).trim();
	        if (!textLines[0]) {
	          textLines.shift();
	        }
	      }

	      return !!match;
	    },

	    matchValue(myParseState, textLines) {
	      if (this.pattern && this.bare) {
	        // If this is not a bare value then we can take all the text up to next
	        // token and just validate it at the end. If it is, then the pattern itself
	        // defines whether this field matches and we must run it immediately.

	        if (_.isEmpty(textLines)) {
	          return false;
	        }
	        textLines[0] = textLines[0].trim();

	        const matchGroup = this.matchGroup || 0;
	        const re = new RegExp(this.pattern, this.caseSensitive ? '' : 'i');
	        logger.debug('$$$ attempting to match value [$$$] against regexp $$$', this.name, textLines[0], re.toString());
	        const match = textLines[0].match(re);

	        if (match) {
	          logger.debug('Successful match! $$$', match);
	          myParseState.text = match[matchGroup];
	          if (!myParseState.forPrevious && this.forPreviousMatchGroup) {
	            logger.debug('Setting forPrevious to  $$$', match[this.forPreviousMatchGroup]);
	            myParseState.forPrevious = match[this.forPreviousMatchGroup];
	          }
	          textLines[0] = textLines[0].slice(match.index + match[0].length);
	          if (this.forNextMatchGroup && match[this.forNextMatchGroup]) {
	            textLines[0] = match[this.forNextMatchGroup] + textLines[0];
	          }

	          if (!textLines[0]) {
	            myParseState.text += '\n';
	            textLines.shift();
	          }
	          return true;
	        }

	        logger.debug('Match failed');
	        return false;
	      }

	      logger.debug('$$$ standard string match, not using pattern', this.name);
	      myParseState.text = '';
	      return true;
	    },

	    orderedContent(fieldSpec) {
	      return this.makeContentModelParser(fieldSpec, true);
	    },

	    unorderedContent(fieldSpec) {
	      return this.makeContentModelParser(fieldSpec, false);
	    },

	    string(/* fieldSpec */) {
	      return this.makeSimpleValueParser();
	    },


	    enumType(fieldSpec) {
	      const parser = this.makeSimpleValueParser();

	      if (fieldSpec.bare) {
	        parser.matchValue = function matchValue(myParseState, textLines) {
	          const firstMatch = _.chain(fieldSpec.enumValues)
	            .map(enumValue => {
	              logger.debug('Attempting to parse as enum property $$$', enumValue);
	              const pattern = `^(.*?)(${enumValue})(?:[\\s.]+|$)`;
	              const re = new RegExp(pattern, this.caseSensitive ? '' : 'i');
	              return textLines[0].match(re);
	            })
	            .compact()
	            .sortBy(match => match[1].length)
	            .first()
	            .value();


	          if (firstMatch) {
	            logger.debug('Finished trying to parse as enum property, match: $$$', firstMatch);
	            myParseState.text = firstMatch[2];
	            myParseState.forPrevious = firstMatch[1];
	            textLines[0] = textLines[0].slice(firstMatch.index + firstMatch[0].length);
	            if (!textLines[0]) {
	              textLines.shift();
	            }
	            return true;
	          }
	          return false;
	        };
	      }
	      return parser;
	    },

	    number(fieldSpec) {
	      const parser = this.makeSimpleValueParser();
	      parser.typeConvert = function typeConvert(textValue) {
	        const parts = textValue.split('/');
	        let intVal;
	        if (parts.length > 1) {
	          intVal = parts[0] / parts[1];
	        }
	        else {
	          intVal = parseInt(textValue, 10);
	        }

	        if (_.isNaN(intVal)) {
	          throw new BadValueError(fieldSpec.name, textValue, '[Integer]');
	        }
	        return intVal;
	      };
	      return parser;
	    },


	    ability(/* fieldSpec */) {
	      const parser = this.number();
	      parser.matchValue = function matchValue(parseState, textLines) {
	        if (_.isEmpty(textLines)) {
	          return false;
	        }
	        textLines[0] = textLines[0].trim();

	        const re = new RegExp('^([\\sa-z\\(\\)]*)(\\d+(?:\\s?\\([\\-+\\d]+\\))?)', 'i');
	        logger.debug('Attempting to match value [$$$] against regexp $$$', textLines[0].trim(), re.toString());
	        let match = textLines[0].match(re);

	        if (match) {
	          logger.debug('Successful match $$$', match);
	          parseState.text = match[2];
	          textLines[0] = match[1] + textLines[0].slice(match.index + match[0].length);
	          if (!textLines[0]) {
	            textLines.shift();
	          }
	          return true;
	        }
	        else if (textLines[1]) {
	          // Try and match against the next line in case we have a two line format
	          textLines[1] = textLines[1].trim();
	          match = textLines[1].match(/^(\d+)(?:\s?\([\-+\d]+\))?/);
	          if (match) {
	            logger.debug('Successful ability match $$$ on next line - looks like two line format', match);
	            parseState.text = match[1];
	            textLines[1] = textLines[1].slice(match[0].length);
	            if (!textLines[0]) {
	              textLines.shift();
	            }
	            if (!textLines[0]) {
	              textLines.shift();
	            }
	            return true;
	          }
	        }
	        return false;
	      };

	      return parser;
	    },

	    heading(fieldSpec) {
	      fieldSpec.bare = true;
	      const parser = this.makeSimpleValueParser();
	      parser.skipOutput = true;
	      return parser;
	    },

	    makeSimpleValueParser() {
	      const module = this;
	      return {
	        parse(stateManager, textLines) {
	          const parseState = stateManager.enterChildParser(this);
	          const match = this.matchParseToken(parseState, textLines) &&
	            this.matchValue(parseState, textLines);
	          if (match) {
	            stateManager.completeCurrentStack(parseState.forPrevious);
	            delete parseState.forPrevious;
	            stateManager.leaveChildParser(this, parseState);
	          }
	          else {
	            stateManager.leaveChildParser(this);
	          }
	          return match;
	        },
	        complete(parseState, finalText) {
	          parseState.text += finalText || '';
	          if (parseState.text) {
	            parseState.value = this.extractValue(parseState.text);
	            parseState.value = this.typeConvert(parseState.value);
	            parseState.setOutputValue();
	          }
	        },
	        extractValue(text) {
	          text = text.trim();
	          if (this.pattern && !this.bare) {
	            const regExp = new RegExp(this.pattern, this.caseSensitive ? '' : 'i');
	            const match = text.match(regExp);
	            if (match) {
	              const matchGroup = this.matchGroup || 0;
	              return match[matchGroup];
	            }

	            throw new BadValueError(this.name, text, regExp);
	          }
	          else {
	            return text;
	          }
	        },
	        typeConvert(textValue) {
	          return textValue;
	        },
	        resumeParse(stateManager, textLines) {
	          if (_.isEmpty(textLines)) {
	            return false;
	          }
	          const parseState = stateManager.enterChildParser(this, true);
	          parseState.text += `${textLines.shift()}\n`;
	          stateManager.leaveChildParser(this, parseState);
	          return true;
	        },
	        matchParseToken: module.matchParseToken,
	        matchValue: module.matchValue,
	      };
	    },

	    makeBaseParseState(skipOutput, propertyPath, outputObject, completedObjects) {
	      return {
	        text: '',
	        getObjectValue() {
	          let value = outputObject;
	          const segments = _.clone(propertyPath);
	          while (segments.length) {
	            const prop = segments.shift();
	            if (prop.flatten) {
	              continue;
	            }
	            value = value[prop.name];
	            if (_.isArray(value)) {
	              value = _.last(value);
	            }
	          }
	          return value;
	        },
	        setOutputValue() {
	          if (skipOutput) {
	            return;
	          }
	          let outputTo = outputObject;
	          const segments = _.clone(propertyPath);
	          while (segments.length > 0) {
	            const prop = segments.shift();
	            if (prop.flatten) {
	              continue;
	            }

	            let currentValue = outputTo[prop.name];
	            let newValue = segments.length === 0 ? this.value : {};

	            if (_.isUndefined(currentValue) && prop.allowed > 1) {
	              currentValue = [];
	              outputTo[prop.name] = currentValue;
	            }

	            if (_.isArray(currentValue)) {
	              let arrayItem = _.find(currentValue, _.partial(_.negate(_.contains), completedObjects));
	              if (!arrayItem) {
	                currentValue.push(newValue);
	                arrayItem = _.last(currentValue);
	              }
	              newValue = arrayItem;
	            }
	            else if (_.isUndefined(currentValue)) {
	              outputTo[prop.name] = newValue;
	            }
	            else if (segments.length === 0) {
	              throw new Error('Simple value property somehow already had value when we came to set it');
	            }
	            else {
	              newValue = currentValue;
	            }

	            outputTo = newValue;
	          }
	        },
	        logWrap: `parseState[${_.pluck(propertyPath, 'name').join('/')}]`,
	        toJSON() {
	          return _.extend(_.clone(this), { propertyPath });
	        },
	      };
	    },

	    makeParseStateManager() {
	      const incompleteParserStack = [];
	      const currentPropertyPath = [];
	      const completedObjects = [];
	      const module = this;
	      return {
	        outputObject: {},
	        leaveChildParser(parser, state) {
	          currentPropertyPath.pop();
	          if (state) {
	            state.resumeParser = _.isEmpty(incompleteParserStack) ? null : _.last(incompleteParserStack).parser;
	            incompleteParserStack.push({ parser, state });
	          }
	        },
	        completeCurrentStack(finalText) {
	          while (!_.isEmpty(incompleteParserStack)) {
	            const incomplete = incompleteParserStack.shift();
	            incomplete.parser.complete(incomplete.state, finalText);
	            const value = incomplete.state.getObjectValue();
	            if (_.isObject(value) && !incomplete.parser.flatten) {
	              // Crude but this list is unlikely to get that big
	              completedObjects.push(value);
	            }
	          }
	        },
	        enterChildParser(parser, resume) {
	          currentPropertyPath.push({
	            name: parser.name,
	            allowed: parser.allowed,
	            flatten: parser.flatten,
	          });

	          if (!resume || _.isEmpty(incompleteParserStack) || parser !== _.last(incompleteParserStack).parser) {
	            return module.makeBaseParseState(parser.skipOutput, _.clone(currentPropertyPath), this.outputObject,
	              completedObjects);
	          }

	          return incompleteParserStack.pop().state;
	        },
	        logWrap: 'parserState',
	        toJSON() {
	          return _.extend(_.clone(this), {
	            incompleteParsers: incompleteParserStack,
	            propertyPath: currentPropertyPath,
	          });
	        },
	      };
	    },

	    parserId: 0,
	    parserAttributes: [
	      'forPreviousMatchGroup', 'forNextMatchGroup',
	      'parseToken', 'flatten', 'pattern', 'matchGroup', 'bare', 'caseSensitive',
	      'name', 'skipOutput',
	    ],
	    getParserFor(fieldSpec) {
	      logger.debug('Making parser for field $$$', fieldSpec);
	      const parserBuilder = this[fieldSpec.type];
	      if (!parserBuilder) {
	        throw new Error(`Can\'t make parser for type ${fieldSpec.type}`);
	      }
	      const parser = parserBuilder.call(this, fieldSpec);
	      parser.required = _.isUndefined(fieldSpec.minOccurs) ? 1 : fieldSpec.minOccurs;
	      parser.allowed = _.isUndefined(fieldSpec.maxOccurs) ? 1 : fieldSpec.maxOccurs;
	      _.extend(parser, _.pick(fieldSpec, this.parserAttributes));
	      _.defaults(parser, {
	        parseToken: parser.name,
	      });
	      parser.id = this.parserId++;
	      parser.logWrap = `parser[${parser.name}]`;
	      return parser;
	    },


	    makeParserList(contentModelArray) {
	      const module = this;
	      return _.chain(contentModelArray)
	        .reject('noParse')
	        .reduce((parsers, fieldSpec) => {
	          parsers.push(module.getParserFor(fieldSpec));
	          return parsers;
	        }, [])
	        .value();
	    },

	    logWrap: 'parseModule',
	  };

	  logger.wrapModule(parserModule);

	  const parser = parserModule.getParserFor(formatSpec);
	  return {
	    parse(text) {
	      logger.debug('Text: $$$', text);

	      const textLines = _.chain(text.split('\n'))
	        .invoke('trim')
	        .compact()
	        .value();
	      logger.debug(parser);
	      const stateManager = parserModule.makeParseStateManager();
	      const success = parser.parse(stateManager, textLines);
	      while (success && !_.isEmpty(textLines)) {
	        parser.resumeParse(stateManager, textLines);
	      }

	      stateManager.completeCurrentStack(textLines.join('\n'));

	      if (success && textLines.length === 0) {
	        stateManager.outputObject.version = formatSpec.formatVersion;
	        logger.info(stateManager.outputObject);
	        return stateManager.outputObject;
	      }
	      return null;
	    },
	  };
	}

	/**
	 * @constructor
	 */
	function ParserError(message) {
	  // noinspection JSUnusedGlobalSymbols
	  this.message = message;
	}
	ParserError.prototype = new Error();

	/**
	 * @constructor
	 */
	function MissingContentError(missingFieldParsers) {
	  this.missingFieldParsers = missingFieldParsers;
	  this.message = '<ul>';
	  this.message += _.reduce(this.missingFieldParsers, (memo, parser) =>
	      `${memo}<li>Field ${parser.parseToken} should have appeared ${parser.required} more times</li>`
	    , '');
	  this.message += '</ul>';
	}
	MissingContentError.prototype = new ParserError();

	/**
	 * @constructor
	 */
	function BadValueError(name, value, pattern) {
	  'use strict';
	  this.name = name;
	  this.value = value;
	  this.pattern = pattern;
	  // noinspection JSUnusedGlobalSymbols
	  this.message = `Bad value [${this.value}] for field [${this.name}]. Should have matched pattern: ${this.pattern}`;
	}
	BadValueError.prototype = new ParserError();

	module.exports = {
	  getParser,
	  MissingContentError,
	  BadValueError,
	  ParserError,
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = {
		"formatVersion": "0.2",
		"name": "monsters",
		"maxOccurs": "Infinity",
		"type": "orderedContent",
		"bare": true,
		"contentModel": [
			{
				"name": "coreInfo",
				"type": "orderedContent",
				"flatten": true,
				"contentModel": [
					{
						"name": "name",
						"type": "string",
						"bare": "true"
					},
					{
						"name": "size",
						"enumValues": [
							"Tiny",
							"Small",
							"Medium",
							"Large",
							"Huge",
							"Gargantuan"
						],
						"type": "enumType",
						"bare": "true"
					},
					{
						"name": "type",
						"type": "string",
						"bare": "true",
						"pattern": "^([\\w\\s\\(\\),-]+),",
						"matchGroup": 1
					},
					{
						"name": "alignment",
						"type": "enumType",
						"enumValues": [
							"lawful good",
							"lawful neutral",
							"lawful evil",
							"neutral good",
							"neutral evil",
							"neutral",
							"chaotic good",
							"chaotic neutral",
							"chaotic evil",
							"unaligned",
							"any alignment",
							"any good alignment",
							"any non-good alignment",
							"any evil alignment",
							"any non-evil alignment",
							"any lawful alignment",
							"any non-lawful alignment",
							"any chaotic alignment",
							"any non-chaotic alignment",
							"construct",
							"(?:lawful|neutral|chaotic) (?:good|neutral|evil) \\(\\d+%\\) or (?:lawful|neutral|chaotic) (?:good|neutral|evil) \\(\\d+%\\)"
						],
						"bare": true
					}
				]
			},
			{
				"name": "attributes",
				"type": "unorderedContent",
				"flatten": true,
				"contentModel": [
					{
						"name": "AC",
						"parseToken": "armor class",
						"pattern": "\\d+\\s*(?:\\([^)]*\\))?",
						"type": "string"
					},
					{
						"name": "HP",
						"parseToken": "hit points",
						"type": "string",
						"pattern": "\\d+(?:\\s?\\(\\s?\\d+d\\d+(?:\\s?[-+]\\s?\\d+)?\\s?\\))?"
					},
					{
						"name": "speed",
						"minOccurs": 0,
						"type": "string",
						"pattern": "^\\d+\\s?ft[\\.]?(,\\s?(fly|swim|burrow|climb)\\s\\d+\\s?ft[\\.]?)*(\\s?\\([^\\)]+\\))?$"
					},
					{
						"name": "strength",
						"parseToken": "str",
						"type": "ability"
					},
					{
						"name": "dexterity",
						"parseToken": "dex",
						"type": "ability"
					},
					{
						"name": "constitution",
						"parseToken": "con",
						"type": "ability"
					},
					{
						"name": "intelligence",
						"parseToken": "int",
						"type": "ability"
					},
					{
						"name": "wisdom",
						"parseToken": "wis",
						"type": "ability"
					},
					{
						"name": "charisma",
						"parseToken": "cha",
						"type": "ability"
					},
					{
						"name": "savingThrows",
						"minOccurs": 0,
						"parseToken": "saving throws",
						"type": "string",
						"pattern": "(?:(?:^|,\\s*)(?:Str|Dex|Con|Int|Wis|Cha)\\s+[\\-\\+]\\d+)+"
					},
					{
						"name": "skills",
						"minOccurs": 0,
						"type": "string",
						"pattern": "(?:(?:^|,\\s*)(?:Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival)\\s+[\\-\\+]\\d+)+"
					},
					{
						"minOccurs": 0,
						"type": "string",
						"name": "damageVulnerabilities",
						"parseToken": "damage vulnerabilities"
					},
					{
						"minOccurs": 0,
						"type": "string",
						"name": "damageResistances",
						"parseToken": "damage resistances"
					},
					{
						"minOccurs": 0,
						"type": "string",
						"name": "damageImmunities",
						"parseToken": "damage immunities"
					},
					{
						"minOccurs": 0,
						"type": "string",
						"name": "conditionImmunities",
						"parseToken": "condition immunities"
					},
					{
						"name": "senses",
						"type": "string",
						"minOccurs": 0,
						"pattern": "(?:(?:^|,\\s*)(?:blindsight|darkvision|tremorsense|truesight)\\s+\\d+\\s*ft\\.?(?: or \\d+ ft\\. while deafened)?(?:\\s?\\([^\\)]+\\))?)+"
					},
					{
						"name": "passivePerception",
						"parseToken": ",?\\s*passive Perception",
						"minOccurs": 0,
						"type": "number",
						"skipOutput": true
					},
					{
						"name": "spells",
						"minOccurs": 0,
						"type": "string"
					},
					{
						"name": "languages",
						"minOccurs": 0,
						"type": "string"
					}
				]
			},
			{
				"name": "challenge",
				"type": "string",
				"pattern": "^\\s*(\\d+(?:\\s*\\/\\s*\\d)?)\\s*(?:\\(\\s*[\\d,]+\\s*XP\\s*\\)\\s*)?$",
				"matchGroup": 1
			},
			{
				"name": "traitSection",
				"type": "orderedContent",
				"minOccurs": 0,
				"maxOccurs": 1,
				"flatten": true,
				"contentModel": [
					{
						"name": "traits",
						"type": "orderedContent",
						"minOccurs": 1,
						"maxOccurs": "Infinity",
						"contentModel": [
							{
								"name": "name",
								"type": "string",
								"pattern": "(^|.*?[a-z]\\.\\s?)((?:[A-Z][\\w\\-']+[,:!]?|A)(?:\\s(?:[A-Z][\\w\\-']+[,:!]?|of|to|in|the|with|and|or|a)+)*)(\\s?\\([^\\)]+\\))?\\.(?!$)",
								"matchGroup": 2,
								"forPreviousMatchGroup": 1,
								"forNextMatchGroup": 3,
								"bare": true,
								"caseSensitive": true
							},
							{
								"name": "recharge",
								"type": "string",
								"pattern": "^\\(([^\\)]+)\\)",
								"bare": true,
								"matchGroup": 1,
								"minOccurs": 0
							},
							{
								"name": "text",
								"bare": true,
								"type": "string"
							}
						]
					}
				]
			},
			{
				"name": "actionSection",
				"type": "orderedContent",
				"minOccurs": 0,
				"maxOccurs": 1,
				"flatten": true,
				"contentModel": [
					{
						"name": "actionHeader",
						"type": "heading",
						"bare": true,
						"pattern": "^Actions$"
					},
					{
						"name": "actions",
						"type": "orderedContent",
						"minOccurs": 1,
						"maxOccurs": "Infinity",
						"contentModel": [
							{
								"name": "name",
								"type": "string",
								"pattern": "(^|.*?[a-z]\\.\\s?)((?:\\d+\\.\\s?)?(?:[A-Z][\\w\\-']+[,:!]?|A)(?:\\s(?:[A-Z][\\w\\-']+[,:!]?|of|in|to|with|the|and|or|a|\\+\\d+)+)*)(\\s?\\([^\\)]+\\))?\\.(?!$)",
								"matchGroup": 2,
								"forPreviousMatchGroup": 1,
								"forNextMatchGroup": 3,
								"bare": true,
								"caseSensitive": true
							},
							{
								"name": "recharge",
								"type": "string",
								"bare": true,
								"pattern": "^\\(([^\\)]+)\\)",
								"matchGroup": 1,
								"minOccurs": 0
							},
							{
								"name": "text",
								"bare": true,
								"type": "string"
							}
						]
					}
				]
			},
			{
				"name": "reactionSection",
				"type": "orderedContent",
				"minOccurs": 0,
				"maxOccurs": 1,
				"flatten": true,
				"contentModel": [
					{
						"name": "reactionHeader",
						"type": "heading",
						"bare": true,
						"pattern": "^Reactions$"
					},
					{
						"name": "reactions",
						"type": "orderedContent",
						"minOccurs": 1,
						"maxOccurs": "Infinity",
						"contentModel": [
							{
								"name": "name",
								"type": "string",
								"pattern": "(^|.*?[a-z]\\.\\s?)((?:[A-Z][\\w\\-']+[,:!]?|A)(?:\\s(?:[A-Z][\\w\\-']+[,:!]?|of|in|to|with|the|and|or|a)+)*)(\\s?\\([^\\)]+\\))?\\.(?!$)",
								"matchGroup": 2,
								"forPreviousMatchGroup": 1,
								"forNextMatchGroup": 3,
								"bare": true,
								"caseSensitive": true
							},
							{
								"name": "recharge",
								"type": "string",
								"bare": true,
								"pattern": "^\\(([^\\)]+)\\)",
								"matchGroup": 1,
								"minOccurs": 0
							},
							{
								"name": "text",
								"bare": true,
								"type": "string"
							}
						]
					}
				]
			},
			{
				"name": "legendaryActionSection",
				"type": "orderedContent",
				"minOccurs": 0,
				"maxOccurs": 1,
				"flatten": true,
				"contentModel": [
					{
						"name": "actionHeader",
						"type": "heading",
						"bare": true,
						"pattern": "^Legendary Actions$"
					},
					{
						"name": "legendaryPoints",
						"type": "number",
						"bare": true,
						"pattern": "^The[ \\w]+can take (\\d+) legendary actions.*?start of its turn[.]?",
						"matchGroup": 1
					},
					{
						"name": "legendaryActions",
						"type": "orderedContent",
						"minOccurs": 1,
						"maxOccurs": "Infinity",
						"contentModel": [
							{
								"name": "name",
								"type": "string",
								"bare": true,
								"pattern": "(^|.*?[a-z]\\.\\s?)((?:[A-Z][\\w\\-']+[,:!]?|A)(?:\\s(?:[A-Z][\\w\\-']+[,:!]?|of|with|to|the|and|or|a)+)*)(\\s?\\([^\\)]+\\))?\\.(?!$)",
								"matchGroup": 2,
								"forPreviousMatchGroup": 1,
								"forNextMatchGroup": 3,
								"caseSensitive": true
							},
							{
								"name": "cost",
								"type": "number",
								"bare": true,
								"pattern": "^\\s*\\(\\s*costs (\\d+) actions\\s*\\)",
								"matchGroup": 1,
								"minOccurs": 0
							},
							{
								"name": "text",
								"bare": true,
								"type": "string"
							}
						]
					}
				]
			},
			{
				"name": "lairActionSection",
				"type": "orderedContent",
				"minOccurs": 0,
				"maxOccurs": 1,
				"flatten": true,
				"contentModel": [
					{
						"name": "actionHeader",
						"type": "heading",
						"bare": true,
						"pattern": "^Lair Actions$"
					},
					{
						"name": "lairActions",
						"type": "string",
						"bare": true,
						"minOccurs": 1,
						"maxOccurs": "Infinity"
					}
				]
			},
			{
				"name": "regionalEffectsSection",
				"type": "orderedContent",
				"minOccurs": 0,
				"maxOccurs": 1,
				"flatten": true,
				"contentModel": [
					{
						"name": "actionHeader",
						"type": "heading",
						"bare": true,
						"pattern": "^Regional Effects$"
					},
					{
						"name": "regionalEffects",
						"type": "string",
						"minOccurs": 1,
						"maxOccurs": "Infinity",
						"bare": true
					},
					{
						"name": "regionalEffectsFade",
						"type": "string",
						"bare": true
					}
				]
			}
		]
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);

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

	  return props.sort().filter((e, i, arr) => (e !== arr[i + 1] && typeof obj[e] === 'function'));
	}

	module.exports = class Logger {
	  constructor(loggerName, config, roll20) {
	    this.prefixString = '';

	    function shouldLog(level) {
	      let logLevel = Logger.levels.INFO;
	      if (config && config.logLevel) {
	        logLevel = Logger.levels[config.logLevel];
	      }
	      return level <= logLevel;
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


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);
	const utils = __webpack_require__(7);


	module.exports = class EntityLookup {
	  constructor() {
	    this.entities = {};
	    this.noWhiteSpaceEntities = {};
	    this.entityProcessors = {};
	    this.versionCheckers = {};
	  }


	  configureEntity(entityName, processors, versionChecker) {
	    this.entities[entityName] = {};
	    this.noWhiteSpaceEntities[entityName] = {};
	    this.entityProcessors[entityName] = processors || [];
	    this.versionCheckers[entityName] = versionChecker || _.constant(true);
	  }

	  addEntities(entitiesObject) {
	    const results = {
	      errors: [],
	    };


	    _.chain(entitiesObject)
	      .omit('version', 'patch')
	      .each((entityArray, type) => {
	        results[type] = {
	          withErrors: [],
	          skipped: [],
	          deleted: [],
	          patched: [],
	          added: [],
	        };

	        if (!this.entities[type]) {
	          results.errors.push({ entity: 'general', errors: [`Unrecognised entity type ${type}`] });
	          return;
	        }

	        if (!this.versionCheckers[type](entitiesObject.version, results.errors)) {
	          return;
	        }


	        _.each(entityArray, (entity) => {
	          let key = entity.name.toLowerCase();
	          let operation = !!this.entities[type][key] ? (entitiesObject.patch ? 'patched' : 'skipped') : 'added';

	          if (operation === 'patched') {
	            entity = patchEntity(this.entities[type][key], entity);
	            if (!entity) {
	              operation = 'deleted';
	              delete this.entities[type][key];
	              delete this.noWhiteSpaceEntities[type][key.replace(/\s+/g, '')];
	            }
	          }

	          if (_.contains(['patched', 'added'], operation)) {
	            const processed = _.reduce(this.entityProcessors[type], utils.executor, {
	              entity,
	              type,
	              version: entitiesObject.version,
	              errors: [],
	            });
	            if (!_.isEmpty(processed.errors)) {
	              processed.entity = processed.entity.name;
	              results.errors.push(processed);
	              operation = 'withErrors';
	            }
	            else {
	              if (processed.entity.name.toLowerCase() !== key) {
	                results[type].deleted.push(key);
	                delete this.entities[type][key];
	                delete this.noWhiteSpaceEntities[type][key.replace(/\s+/g, '')];
	                key = processed.entity.name.toLowerCase();
	              }
	              this.entities[type][key] = processed.entity;
	              this.noWhiteSpaceEntities[type][key.replace(/\s+/g, '')] = processed.entity;
	            }
	          }


	          results[type][operation].push(key);
	        });
	      });

	    return results;
	  }

	  findEntity(type, name, tryWithoutWhitespace) {
	    const key = name.toLowerCase();
	    if (!this.entities[type]) {
	      throw new Error(`Unrecognised entity type ${type}`);
	    }
	    let found = this.entities[type][key];
	    if (!found && tryWithoutWhitespace) {
	      found = this.noWhiteSpaceEntities[type][key.replace(/\s+/g, '')];
	    }
	    return found && utils.deepClone(found);
	  }

	  searchEntities(type, criteria) {
	    function containsSomeIgnoreCase(array, testValues) {
	      testValues = (_.isArray(testValues) ? testValues : [testValues]).map(s => s.toLowerCase());
	      return !!_.chain(array)
	        .map(s => s.toLowerCase())
	        .intersection(testValues)
	        .value().length;
	    }

	    return _.reduce(criteria, (results, criterionValue, criterionField) => {
	      const re = new RegExp(criterionValue, 'i');
	      const matcher = (entity) => {
	        const value = entity[criterionField];
	        switch (typeof value) {
	          case 'string':
	            return value.match(re);
	          case 'boolean':
	          case 'number':
	            return value === criterionValue;
	          case 'object':
	            return _.isArray(value) && containsSomeIgnoreCase(value, criterionValue);
	          default:
	            return false;
	        }
	      };
	      return results.filter(matcher);
	    }, this.getAll(type));
	  }

	  getAll(type) {
	    if (!this.entities[type]) {
	      throw new Error(`Unrecognised entity type: ${type}`);
	    }
	    return utils.deepClone(_.values(this.entities[type]));
	  }

	  /**
	   * Gets all of the keys for the specified entity type
	   * @param {string} type - The entity type to retrieve keys for (either 'monster' or 'spell')
	   * @param {boolean} sort - True if the returned array should be sorted alphabetically; false otherwise
	   * @function
	   * @public
	   * @name EntityLookup#getKeys
	   * @return {Array} An array containing all keys for the specified entity type
	   */
	  getKeys(type, sort) {
	    if (!this.entities[type]) {
	      throw new Error(`Unrecognised entity type: ${type}`);
	    }
	    const keys = _.keys(this.entities[type]);
	    if (sort) {
	      keys.sort();
	    }
	    return keys;
	  }


	  /**
	   * Gets spell hydrator
	   * @function
	   * @public
	   * @name EntityLookup#getSpellHydrator
	   * @return {function}
	   */
	  getSpellHydrator() {
	    const self = this;
	    return function spellHydrator(monsterInfo) {
	      const monster = monsterInfo.entity;
	      if (monster.spells) {
	        const spellArray = monster.spells.split(', ');
	        monster.spells = _.map(spellArray, spellName => self.findEntity('spells', spellName) || spellName);
	      }
	      return monsterInfo;
	    };
	  }

	  getMonsterSpellUpdater() {
	    const self = this;
	    return function spellUpdater(spellInfo) {
	      const spell = spellInfo.entity;
	      _.chain(self.entities.monsters)
	        .pluck('spells')
	        .compact()
	        .each(spellArray => {
	          const spellIndex = _.findIndex(spellArray, monsterSpell => {
	            if (typeof monsterSpell === 'string') {
	              return monsterSpell.toLowerCase() === spell.name.toLowerCase();
	            }

	            return monsterSpell !== spell && monsterSpell.name.toLowerCase() === spell.name.toLowerCase();
	          });
	          if (spellIndex !== -1) {
	            spellArray[spellIndex] = spell;
	          }
	        });
	      return spellInfo;
	    };
	  }


	  toJSON() {
	    return { monsterCount: _.size(this.entities.monsters), spellCount: _.size(this.entities.spells) };
	  }

	  get logWrap() {
	    return 'entityLookup';
	  }

	  static jsonValidatorAsEntityProcessor(jsonValidator) {
	    return function jsonValidatorEntityProcessor(entityInfo) {
	      const wrapper = {
	        version: entityInfo.version,
	      };
	      wrapper[entityInfo.type] = [entityInfo.entity];
	      const errors = jsonValidator.validate(wrapper);
	      const flattenedErrors = _.chain(errors).values().flatten().value();
	      entityInfo.errors = entityInfo.errors.concat(flattenedErrors);
	      return entityInfo;
	    };
	  }

	  static jsonValidatorAsVersionChecker(jsonValidator) {
	    return EntityLookup.getVersionChecker(jsonValidator.getVersionNumber());
	  }

	  static getVersionChecker(requiredVersion) {
	    function pruneToMinor(versionString) {
	      return versionString.split('.', 2).join('.');
	    }

	    return function versionChecker(version, errorsArray) {
	      const prunedVersion = pruneToMinor(version);
	      const prunedRequiredVersion = pruneToMinor(requiredVersion);
	      const valid = prunedVersion === prunedRequiredVersion;
	      if (!valid) {
	        errorsArray.push({
	          entity: 'general',
	          errors: [`Incorrect entity objects version: [${version}]. Required is: ${requiredVersion}`],
	        });
	      }
	      return valid;
	    };
	  }


	};

	function patchEntity(original, patch) {
	  if (patch.remove) {
	    return undefined;
	  }
	  return _.mapObject(original, (propVal, propName) => {
	    if (propName === 'name' && patch.newName) {
	      return patch.newName;
	    }
	    return patch[propName] || propVal;
	  });
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);

	// noinspection JSUnusedGlobalSymbols
	module.exports = {
	  deepExtend(original, newValues) {
	    if (!original) {
	      original = _.isArray(newValues) ? [] : {};
	    }
	    _.each(newValues, (value, key) => {
	      if (_.isArray(original[key])) {
	        if (!_.isArray(value)) {
	          original[key].push(value);
	        }
	        else {
	          original[key] = _.map(value, (item, index) => {
	            if (_.isObject(item)) {
	              return this.deepExtend(original[key][index], item);
	            }

	            return item !== undefined ? item : original[key][index];
	          });
	        }
	      }
	      else if (_.isObject(original[key])) {
	        original[key] = this.deepExtend(original[key], value);
	      }
	      else {
	        original[key] = value;
	      }
	    });
	    return original;
	  },

	  createObjectFromPath(pathString, value) {
	    const newObject = {};
	    _.reduce(pathString.split(/\./), (object, pathPart, index, pathParts) => {
	      const match = pathPart.match(/([^.\[]*)(?:\[(\d+)\])?/);
	      const newVal = index === pathParts.length - 1 ? value : {};

	      if (match[2]) {
	        object[match[1]] = [];
	        object[match[1]][match[2]] = newVal;
	      }
	      else {
	        object[match[1]] = newVal;
	      }
	      return newVal;
	    }, newObject);
	    return newObject;
	  },

	  getObjectFromPath(obj, path) {
	    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
	    path = path.replace(/^\./, '');           // strip a leading dot
	    path.split('.').every(segment => (obj = obj[segment]));
	    return obj;
	  },

	  deepClone(object) {
	    return JSON.parse(JSON.stringify(object));
	  },

	  executor() {
	    switch (arguments.length) {
	      case 0:
	        return undefined;
	      case 1:
	        return arguments[0]();
	      default:
	      // Fall through
	    }
	    const args = Array.apply(null, arguments).slice(2);
	    args.unshift(arguments[0]);
	    return arguments[1].apply(null, args);
	  },

	  /**
	   * Gets a string as 'Title Case' capitalizing the first letter of each word (i.e. 'the grapes of wrath' -> 'The
	   * Grapes Of Wrath')
	   * @param {string} s - The string to be converted
	   * @return {string} the supplied string in title case
	   */
	  toTitleCase(s) {
	    return s.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
	  },

	  toOptionsString(options) {
	    let res = options.join(' --');
	    if (res.length > 0) {
	      res = `--${res}`;
	    }

	    return res;
	  },

	  /**
	   * Calculates a contrasting color using YIQ luma value
	   * @param {string} hexcolor - the color to calculate a contrasting color for
	   * @return {string} either 'white' or 'black' as determined to be the best contrasting text color for the input color
	   */
	  getContrastYIQ(hexcolor) {
	    hexcolor = hexcolor.replace('#', '');
	    if (hexcolor.length === 3) {
	      hexcolor += hexcolor;
	    }
	    const r = parseInt(hexcolor.substr(0, 2), 16);
	    const g = parseInt(hexcolor.substr(2, 2), 16);
	    const b = parseInt(hexcolor.substr(4, 2), 16);
	    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
	    return yiq >= 128 ? 'black' : 'white';
	  },

	  /**
	   * Builds an html element as a string using the specified options
	   * @param {string} tag - the html tag type
	   * @param innerHtml - can be a string to be used as the element inner html, or a {tag, innerHtml, attrs} object
	   *                    in order to build a child html element string
	   * @param attrs - a collection of attributes and their values to be applied to the html element
	   * @return {string} the full html element as a string
	   */
	  buildHTML(tag, innerHtml, attrs) {
	    if (typeof innerHtml === 'object') {
	      innerHtml = _.map(innerHtml, html => html && this.buildHTML(html.tag, html.innerHtml, html.attrs)).join('');
	    }

	    let h = `<${tag}`;
	    h += _.chain(attrs)
	      .map((attrVal, attrName) => attrVal !== false && ` ${attrName}="${attrVal}"`)
	      .compact()
	      .value()
	      .join('');

	    if (innerHtml) {
	      h += `>${innerHtml}</${tag}>`;
	    }
	    else {
	      h += '/>';
	    }

	    return h;
	  },

	  missingParam(name) {
	    throw new Error(`Parameter ${name} is required`);
	  },

	  flattenObject(object) {
	    return _.reduce(object, (explodedProps, propVal, propKey) => {
	      if (_.isObject(propVal)) {
	        return _.extend(explodedProps, this.flattenObject(propVal));
	      }

	      explodedProps[propKey] = propVal;
	      return explodedProps;
	    }, {});
	  },
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);

	// noinspection JSUnusedGlobalSymbols
	const validatorFactories = {
	  orderedContent(spec) {
	    return makeContentModelValidator(spec);
	  },

	  unorderedContent(spec) {
	    return makeContentModelValidator(spec);
	  },

	  string(spec) {
	    if (spec.pattern) {
	      if (spec.matchGroup) {
	        return regExValidator(spec.name, extractRegexPart(spec.pattern, spec.matchGroup), spec.caseSensitive);
	      }

	      return regExValidator(spec.name, spec.pattern, spec.caseSensitive);
	    }
	    return function noop() {
	    };
	  },

	  enumType(spec) {
	    return function enumValidator(value, errors) {
	      if (!_.some(spec.enumValues, enumVal => new RegExp(`^${enumVal}$`, 'i').test(value))) {
	        errors.add(`Value "${value}" should have been one of [${spec.enumValues.join(',')}]`);
	      }
	    };
	  },

	  ability(spec) {
	    return regExValidator(spec.name, '\\d+');
	  },

	  heading() {
	    // Do not replace with _.noop, these functions get annotated
	    return function noop() {
	    };
	  },

	  number() {
	    return function numberValidator(value, errors) {
	      if (typeof value !== 'number') {
	        errors.add(`Value "${value}" should have been a number`);
	      }
	    };
	  },
	};

	function extractRegexPart(regexp, matchIndex) {
	  let braceCount = 0;
	  let startIndex = _.findIndex(regexp, (character, index) => {
	    if (character === '(' &&
	      (index < 2 || regexp[index - 1] !== '\\') &&
	      regexp[index + 1] !== '?') {
	      return ++braceCount === matchIndex;
	    }
	    return false;
	  });

	  if (startIndex === -1) {
	    throw new Error(`Can\'t find matchgroup ${matchIndex} in regular expression ${regexp}`);
	  }

	  // Lose the bracket
	  startIndex++;

	  let openCount = 1;
	  const endIndex = _.findIndex(regexp.slice(startIndex), (character, index, regexpPart) => {
	    if (character === '(' && regexpPart[index - 1] !== '\\') {
	      openCount++;
	    }
	    if (character === ')' && regexpPart[index - 1] !== '\\') {
	      return --openCount === 0;
	    }
	    return false;
	  });

	  if (endIndex === -1) {
	    throw new Error(`matchgroup ${matchIndex} seems not to have closing brace in regular expression ${regexp}`);
	  }

	  return regexp.slice(startIndex, startIndex + endIndex);
	}

	function regExValidator(fieldName, regexp, caseSensitive) {
	  const re = new RegExp(`^${regexp}$`, caseSensitive ? undefined : 'i');
	  return function regexpValidate(value, errors) {
	    if (!re.test(value)) {
	      errors.add(`Value "${value}" doesn\'t match pattern /${regexp}/`);
	    }
	  };
	}

	function makeValidator(spec) {
	  const validator = validatorFactories[spec.type](spec);
	  validator.max = _.isUndefined(spec.maxOccurs) ? 1 : spec.maxOccurs;
	  validator.min = _.isUndefined(spec.minOccurs) ? 1 : spec.minOccurs;
	  validator.fieldName = spec.name;
	  return validator;
	}

	function makeContentModelValidator(spec) {
	  const parts = _.chain(spec.contentModel)
	    .reject({ type: 'heading' })
	    .partition({ flatten: true })
	    .value();
	  const flattened = _.map(parts[0], makeValidator);

	  const subValidators = _.reduce(parts[1], (subVals, field) => {
	    subVals[field.name] = makeValidator(field);
	    return subVals;
	  }, {});

	  return function contentModelValidator(object, errors, isFlatten) {
	    let completed = _.reduce(object, (completedMemo, fieldValue, fieldName) => {
	      const validator = subValidators[fieldName];
	      if (validator) {
	        completedMemo.push(fieldName);
	        errors.pushPath(fieldName);
	        if (_.isArray(fieldValue)) {
	          if (fieldValue.length > validator.max) {
	            errors.add(`Number of entries [${fieldValue.length}] exceeds maximum allowed: ${validator.max}`);
	          }
	          else if (fieldValue.length < validator.min) {
	            errors.add(`Number of entries [${fieldValue.length}] is less than minimum allowed: ${validator.min}`);
	          }
	          else {
	            _.each(fieldValue, (arrayItem, index) => {
	              errors.pushIndex(arrayItem.name ? arrayItem.name : index);
	              validator(arrayItem, errors);
	              errors.popIndex();
	            });
	          }
	        }
	        else {
	          validator(fieldValue, errors);
	        }
	        errors.popPath();
	      }
	      return completedMemo;
	    }, []);

	    let toValidate = _.omit(object, completed);

	    _.chain(flattened)
	      .map(validator => {
	        const subCompleted = validator(toValidate, errors, true);
	        if (subCompleted.length === 0) {
	          return validator;
	        }

	        completed = completed.concat(subCompleted);
	        toValidate = _.omit(toValidate, completed);
	        return null;
	      })
	      .compact()
	      .each(validator => {
	        if (validator.min > 0) {
	          errors.pushPath(validator.fieldName);
	          errors.add('Section is missing');
	          errors.popPath();
	        }
	      });

	    // If we're a flattened validator (our content is injected directly into the parent content model)
	    // Then we should only report missing fields if there was some match in our content model - otherwise
	    // the parent content model will check the cardinality of this model as a whole
	    if (!isFlatten || !_.isEmpty(completed)) {
	      _.chain(subValidators)
	        .omit(completed)
	        .each(validator => {
	          if (validator.min > 0) {
	            errors.pushPath(validator.fieldName);
	            errors.add('Field is missing');
	            errors.popPath();
	          }
	        });
	    }

	    // Flattened content models shouldn't check for unrecognised fields since they're only parsing
	    // part of the current content model.
	    if (!isFlatten) {
	      _.chain(object)
	        .omit(completed)
	        .each((value, key) => {
	          errors.pushPath(key);
	          errors.add('Unrecognised field');
	          errors.popPath();
	        });
	    }


	    return completed;
	  };
	}

	class Errors {
	  constructor() {
	    this.errors = [];
	    this.currentPath = [];
	  }

	  pushPath(path) {
	    this.currentPath.push(path);
	  }

	  popPath() {
	    return this.currentPath.pop();
	  }

	  pushIndex(index) {
	    this.currentPath[this.currentPath.length - 1] = `${this.currentPath[this.currentPath.length - 1]}[${index}]`;
	  }

	  popIndex() {
	    this.currentPath[this.currentPath.length - 1] = this.currentPath[this.currentPath.length -
	    1].replace(/\[[^\]]+\]/, '');
	  }

	  add(msg) {
	    this.errors.push({ msg, path: _.clone(this.currentPath) });
	  }

	  getErrors() {
	    return _.chain(this.errors)
	      .groupBy(error => error.path[0])
	      .mapObject(errorList =>
	        _.map(errorList, error => `${error.path.slice(1).join('.')}: ${error.msg}`)
	      )
	      .value();
	  }
	}

	module.exports = class JSONValidator {
	  constructor(spec) {
	    this.versionProp = {
	      type: 'string',
	      name: 'version',
	      pattern: `^${spec.formatVersion.replace('.', '\\.')}$`,
	    };
	    this.spec = spec;
	    this.contentValidator = makeValidator({ type: 'unorderedContent', contentModel: [spec, this.versionProp] });
	  }

	  validate(object) {
	    const errors = new Errors();
	    this.contentValidator(object, errors);
	    return errors.getErrors();
	  }

	  getVersionNumber() {
	    return this.spec.formatVersion;
	  }
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	class Reporter {

	  constructor(roll20, scriptName) {
	    this.roll20 = roll20;
	    this.scriptName = scriptName;
	  }

	  report(heading, text) {
	    // Horrible bug with this at the moment - seems to generate spurious chat
	    // messages when noarchive:true is set
	    // sendChat('ShapedScripts', '' + msg, null, {noarchive:true});

	    this.roll20.sendChat('',
	      '/w gm <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">' +
	      '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">' +
	      `${this.scriptName} ${heading}</div>${text}</div>`);
	  }

	  reportError(text) {
	    this.roll20.sendChat('',
	      '/w gm <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">' +
	      '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;color:red;">' +
	      `${this.scriptName}</div>${text}</div>`);
	  }
	}


	module.exports = Reporter;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* globals unescape */
	'use strict';
	const _ = __webpack_require__(2);
	const parseModule = __webpack_require__(3);
	const cp = __webpack_require__(11);
	const utils = __webpack_require__(7);
	const AdvantageTracker = __webpack_require__(13);
	const RestManager = __webpack_require__(14);
	const TraitManager = __webpack_require__(15);
	const ConfigUI = __webpack_require__(16);
	const Logger = __webpack_require__(5);
	const UserError = __webpack_require__(12);
	const Migrator = __webpack_require__(17);

	const configToAttributeLookup = {
	  sheetOutput: 'output_option',
	  deathSaveOutput: 'death_save_output_option',
	  initiativeOutput: 'initiative_output_option',
	  showNameOnRollTemplate: 'show_character_name',
	  rollOptions: 'roll_setting',
	  initiativeRoll: 'initiative_roll',
	  initiativeToTracker: 'initiative_to_tracker',
	  breakInitiativeTies: 'initiative_tie_breaker',
	  showTargetAC: 'attacks_vs_target_ac',
	  showTargetName: 'attacks_vs_target_name',
	  autoAmmo: 'ammo_auto_use',
	  autoRevertAdvantage: 'auto_revert_advantage',
	  savingThrowsHalfProf: 'saving_throws_half_proficiency',
	  mediumArmorMaxDex: 'medium_armor_max_dex',
	};

	function booleanValidator(value) {
	  const converted = value === 'true' || (value === 'false' ? false : value);
	  return {
	    valid: typeof value === 'boolean' || value === 'true' || value === 'false',
	    converted,
	  };
	}

	function stringValidator(value) {
	  return {
	    valid: true,
	    converted: value,
	  };
	}

	function arrayValidator(value) {
	  return {
	    valid: true,
	    converted: value.split(',').map(s => s.trim()),
	  };
	}

	function getOptionList(options) {
	  return function optionList(value) {
	    if (value === undefined) {
	      return options;
	    }
	    return {
	      converted: options[value],
	      valid: options[value] !== undefined,
	    };
	  };
	}

	function integerValidator(value) {
	  const parsed = parseInt(value, 10);
	  return {
	    converted: parsed,
	    valid: !isNaN(parsed),
	  };
	}

	function colorValidator(value) {
	  return {
	    converted: value,
	    valid: /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value),
	  };
	}

	const sheetOutputValidator = getOptionList({
	  public: '@{output_to_all}',
	  whisper: '@{output_to_gm}',
	});
	const commandOutputValidator = getOptionList({
	  public: 'public',
	  whisper: 'whisper',
	  silent: 'silent',
	});
	const statusMarkerValidator = getOptionList(ConfigUI.validStatusMarkers());
	const barValidator = {
	  attribute: stringValidator,
	  max: booleanValidator,
	  link: booleanValidator,
	  showPlayers: booleanValidator,
	};
	const auraValidator = {
	  radius: stringValidator,
	  color: colorValidator,
	  square: booleanValidator,
	};
	const lightValidator = {
	  radius: stringValidator,
	  dimRadius: stringValidator,
	  otherPlayers: booleanValidator,
	  hasSight: booleanValidator,
	  angle: integerValidator,
	  losAngle: integerValidator,
	  multiplier: integerValidator,
	};

	function getCharacterValidator(roll20) {
	  return function characterValidator(value) {
	    const char = roll20.getObj('character', value);
	    return {
	      converted: char,
	      valid: !!char,
	    };
	  };
	}

	function regExpValidator(value) {
	  try {
	    new RegExp(value, 'i').test('');
	    return {
	      converted: value,
	      valid: true,
	    };
	  }
	  catch (e) {
	    return {
	      converted: null,
	      valid: false,
	    };
	  }
	}


	const configOptionsSpec = {
	  logLevel(value) {
	    const converted = value.toUpperCase();
	    return { valid: _.has(Logger.levels, converted), converted };
	  },
	  tokenSettings: {
	    number: booleanValidator,
	    bar1: barValidator,
	    bar2: barValidator,
	    bar3: barValidator,
	    aura1: auraValidator,
	    aura2: auraValidator,
	    light: lightValidator,
	    showName: booleanValidator,
	    showNameToPlayers: booleanValidator,
	    showAura1ToPlayers: booleanValidator,
	    showAura2ToPlayers: booleanValidator,
	  },
	  newCharSettings: {
	    sheetOutput: sheetOutputValidator,
	    deathSaveOutput: sheetOutputValidator,
	    initiativeOutput: sheetOutputValidator,
	    showNameOnRollTemplate: getOptionList({
	      true: '@{show_character_name_yes}',
	      false: '@{show_character_name_no}',
	    }),
	    rollOptions: getOptionList({
	      normal: '@{roll_1}',
	      advantage: '@{roll_advantage}',
	      disadvantage: '@{roll_disadvantage}',
	      two: '@{roll_2}',
	    }),
	    initiativeRoll: getOptionList({
	      normal: '@{normal_initiative}',
	      advantage: '@{advantage_on_initiative}',
	      disadvantage: '@{disadvantage_on_initiative}',
	    }),
	    initiativeToTracker: getOptionList({
	      true: '@{initiative_to_tracker_yes}',
	      false: '@{initiative_to_tracker_no}',
	    }),
	    breakInitiativeTies: getOptionList({
	      true: '@{initiative_tie_breaker_var}',
	      false: '',
	    }),
	    showTargetAC: getOptionList({
	      true: '@{attacks_vs_target_ac_yes}',
	      false: '@{attacks_vs_target_ac_no}',
	    }),
	    showTargetName: getOptionList({
	      true: '@{attacks_vs_target_name_yes}',
	      false: '@{attacks_vs_target_name_no}',
	    }),
	    autoAmmo: getOptionList({
	      true: '@{ammo_auto_use_var}',
	      false: '',
	    }),
	    autoRevertAdvantage: booleanValidator,
	    houserules: {
	      savingThrowsHalfProf: booleanValidator,
	      mediumArmorMaxDex: getOptionList([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
	    },
	    tab: getOptionList({
	      core: 'core',
	      spells: 'spells',
	      equipment: 'equipment',
	      character: 'character',
	      settings: 'settings',
	      all: 'all',
	    }),
	  },
	  advTrackerSettings: {
	    showMarkers: booleanValidator,
	    ignoreNpcs: booleanValidator,
	    advantageMarker: statusMarkerValidator,
	    disadvantageMarker: statusMarkerValidator,
	    output: commandOutputValidator,
	  },
	  sheetEnhancements: {
	    rollHPOnDrop: booleanValidator,
	    autoHD: booleanValidator,
	    autoSpellSlots: booleanValidator,
	    autoTraits: booleanValidator,
	  },
	  genderPronouns: [
	    {
	      matchPattern: regExpValidator,
	      nominative: stringValidator,
	      accusative: stringValidator,
	      possessive: stringValidator,
	      reflexive: stringValidator,
	    },
	  ],
	  defaultGenderIndex: integerValidator,
	  variants: {
	    rests: {
	      longNoHpFullHd: booleanValidator,
	    },
	  },
	};

	/**
	 * @typedef {Object} ChatMessage
	 * @property {string} content
	 * @property {string} type
	 * @property {SelectedItem[]} selected
	 * @property {string} rolltemplate
	 */


	/**
	 *
	 * @typedef {Object} SelectedItem
	 * @property {string} _id
	 * @property (string _type
	 */


	module.exports = ShapedScripts;

	function ShapedScripts(logger, myState, roll20, parser, entityLookup, reporter, srdConverter, sanitise, mpp) {
	  let addedTokenIds = [];
	  const report = reporter.report.bind(reporter);
	  const reportError = reporter.reportError.bind(reporter);
	  const chatWatchers = [];
	  const at = new AdvantageTracker(logger, myState, roll20);
	  const rester = new RestManager(logger, myState, roll20);

	  /**
	   *
	   * @param {ChatMessage} msg
	   */
	  this.handleInput = function handleInput(msg) {
	    logger.debug(msg);
	    if (msg.type !== 'api') {
	      this.triggerChatWatchers(msg);
	      return;
	    }

	    this.getCommandProcessor().processCommand(msg);
	  };


	  /////////////////////////////////////////
	  // Command handlers
	  /////////////////////////////////////////
	  this.configure = function configure(options) {
	    // drop "menu" options
	    utils.deepExtend(myState.config, _.omit(options, ['atMenu', 'tsMenu', 'ncMenu', 'seMenu', 'hrMenu', 'varsMenu']));

	    const cui = new ConfigUI();

	    logger.debug('options: $$$', options);
	    logger.debug('state.config: $$$', myState.config);

	    let menu;
	    if (options.atMenu || options.advTrackerSettings) {
	      menu = cui.getConfigOptionGroupAdvTracker(myState.config, configOptionsSpec);
	    }
	    else if (options.tsMenu || options.tokenSettings) {
	      menu = cui.getConfigOptionGroupTokens(myState.config, configOptionsSpec);
	    }
	    else if (options.ncMenu || options.hrMenu || options.newCharSettings) {
	      if (options.hrMenu) {
	        menu = cui.getConfigOptionsGroupNewCharHouserules(myState.config, configOptionsSpec);
	      }
	      else {
	        menu = cui.getConfigOptionGroupNewCharSettings(myState.config, configOptionsSpec);
	      }
	    }
	    else if (options.seMenu || options.sheetEnhancements) {
	      menu = cui.getConfigOptionGroupSheetEnhancements(myState.config, configOptionsSpec);
	    }
	    else if (options.varsMenu || options.variants) {
	      menu = cui.getConfigOptionGroupVariants(myState.config, configOptionsSpec);
	    }
	    else {
	      menu = cui.getConfigOptionsMenu();
	    }

	    report('Configuration', menu);
	  };

	  this.applyTokenDefaults = function applyTokenDefaults(options) {
	    _.each(options.selected.graphic, token => {
	      const represents = token.get('represents');
	      const character = roll20.getObj('character', represents);
	      if (character) {
	        this.getTokenConfigurer(token)(character);
	      }
	    });
	  };

	  this.importStatblock = function importStatblock(options) {
	    logger.info('Importing statblocks for tokens $$$', options.selected.graphic);
	    _.each(options.selected.graphic, token => {
	      const error = `Could not find GM notes on either selected token ${token.get('name')} or the character ` +
	        'it represents. Have you pasted it in correctly?';
	      const text = token.get('gmnotes');
	      if (!text) {
	        const char = roll20.getObj('character', token.get('represents'));
	        if (char) {
	          char.get('gmnotes', notes => {
	            if (notes) {
	              return this.processGMNotes(options, token, notes);
	            }
	            return reportError(error);
	          });
	        }
	        else {
	          return reportError(error);
	        }
	      }

	      return this.processGMNotes(options, token, text);
	    });
	  };

	  this.processGMNotes = function processGMNotes(options, token, text) {
	    text = sanitise(unescape(text), logger);
	    const monsters = parser.parse(text).monsters;
	    mpp(monsters, entityLookup);
	    this.importMonsters(monsters, options, token, [
	      function gmNotesSetter(character) {
	        character.set('gmnotes', text.replace(/\n/g, '<br>'));
	      },
	    ]);
	  };

	  this.importMonstersFromJson = function importMonstersFromJson(options) {
	    if (options.all) {
	      options.monsters = entityLookup.getAll('monsters');
	      delete options.all;
	    }

	    if (_.isEmpty(options.monsters)) {
	      this.showEntityPicker('monster', 'monsters');
	    }
	    else {
	      this.importMonsters(options.monsters.slice(0, 20), options, options.selected.graphic, []);
	      options.monsters = options.monsters.slice(20);
	      if (!_.isEmpty(options.monsters)) {
	        setTimeout(() => this.importMonstersFromJson(options), 200);
	      }
	    }
	  };

	  this.importMonsters = function importMonsters(monsters, options, token, characterProcessors) {
	    const characterRetrievalStrategies = [];

	    if (token) {
	      characterProcessors.push(this.getAvatarCopier(token).bind(this));
	      if (_.size(monsters) === 1) {
	        characterProcessors.push(this.getTokenConfigurer(token).bind(this));
	        characterProcessors.push(this.getTokenVisionConfigurer(token, monsters[0].senses));
	        if (options.replace || options.overwrite) {
	          characterRetrievalStrategies.push(this.getTokenRetrievalStrategy(token).bind(this));
	        }
	      }
	    }
	    if (options.replace) {
	      characterRetrievalStrategies.push(this.nameRetrievalStrategy);
	    }

	    characterRetrievalStrategies.push(this.creationRetrievalStrategy.bind(this));
	    characterProcessors.push(this.monsterDataPopulator.bind(this));

	    const errors = [];
	    const importedList = _.chain(monsters)
	      .map(monsterData => {
	        const character = _.reduce(characterRetrievalStrategies,
	          (result, strategy) => result || strategy(monsterData.name, errors), null);

	        if (!character) {
	          logger.error('Failed to find or create character for monster $$$', monsterData.name);
	          return null;
	        }

	        const oldAttrs = roll20.findObjs({ type: 'attribute', characterid: character.id });
	        _.invoke(oldAttrs, 'remove');
	        character.set('name', monsterData.name);

	        _.each(characterProcessors, proc => proc(character, monsterData));
	        return character && character.get('name');
	      })
	      .compact()
	      .value();

	    if (!_.isEmpty(importedList)) {
	      const monsterList = importedList.join('</li><li>');
	      report('Import Success', `Added the following monsters: <ul><li>${monsterList}</li></ul>`);
	    }
	    if (!_.isEmpty(errors)) {
	      const errorList = errors.join('</li><li>');
	      reportError(`The following errors occurred on import:  <ul><li>${errorList}</li></ul>`);
	    }
	  };

	  this.importSpellsFromJson = function importSpellsFromJson(options) {
	    if (_.isEmpty(options.spells)) {
	      this.showEntityPicker('spell', 'spells');
	    }
	    else {
	      this.addSpellsToCharacter(options.selected.character, options.spells);
	    }
	  };

	  const spellSearchCriteria = {
	    classes: arrayValidator,
	    domains: arrayValidator,
	    oaths: arrayValidator,
	    patrons: arrayValidator,
	    school: stringValidator,
	    level: integerValidator,
	  };

	  this.importSpellListFromJson = function importSpellListFromJson(options) {
	    const spells = entityLookup.searchEntities('spells', _.pick(options, _.keys(spellSearchCriteria)));
	    const newOpts = _.omit(options, _.keys(spellSearchCriteria));
	    newOpts.spells = spells;
	    this.importSpellsFromJson(newOpts);
	  };

	  this.getEntityCriteriaAdaptor = function getEntityCriteriaAdaptor(entityType) {
	    return function entityCriteriaAdaptor(criterionOption, options) {
	      const result = entityLookup.searchEntities(entityType, criterionOption, options[entityType]);
	      if (result) {
	        // If we get a result, wipe the existing list so that the new one replaces it
	        options[entityType] = [];
	      }
	      return result;
	    };
	  };

	  this.showEntityPicker = function showEntityPicker(entityName, entityNamePlural) {
	    const list = entityLookup.getKeys(entityNamePlural, true);

	    if (!_.isEmpty(list)) {
	      // title case the  names for better display
	      list.forEach((part, index) => (list[index] = utils.toTitleCase(part)));

	      // create a clickable button with a roll query to select an entity from the loaded json
	      report(`${utils.toTitleCase(entityName)} Importer`,
	        `<a href="!shaped-import-${entityName} --?{Pick a ${entityName}|${list.join('|')}}">Click to select a ` +
	        `${entityName}</a>`);
	    }
	    else {
	      reportError(`Could not find any ${entityNamePlural}.<br/>Please ensure you have a properly formatted ` +
	        `${entityNamePlural} json file.`);
	    }
	  };

	  this.addSpellsToCharacter = function addSpellsToCharacter(character, spells, noreport) {
	    const gender = roll20.getAttrByName(character.id, 'gender');

	    const defaultIndex = Math.min(myState.config.defaultGenderIndex, myState.config.genderPronouns.length);
	    const defaultPronounInfo = myState.config.genderPronouns[defaultIndex];
	    const pronounInfo = _.clone(_.find(myState.config.genderPronouns,
	        pronounDetails => new RegExp(pronounDetails.matchPattern, 'i').test(gender)) || defaultPronounInfo);

	    _.defaults(pronounInfo, defaultPronounInfo);

	    const importData = {
	      spells: srdConverter.convertSpells(spells, pronounInfo),
	    };
	    this.getImportDataWrapper(character).mergeImportData(importData);
	    if (!noreport) {
	      report('Import Success', 'Added the following spells:  <ul><li>' +
	        `${_.map(importData.spells, spell => spell.name).join('</li><li>')}</li></ul>`);
	    }
	  };


	  this.monsterDataPopulator = function monsterDataPopulator(character, monsterData) {
	    _.each(utils.flattenObject(myState.config.newCharSettings), (value, key) => {
	      const attribute = roll20.getOrCreateAttr(character.id, configToAttributeLookup[key] || key);
	      attribute.set('current', _.isBoolean(value) ? (value ? 'on' : 0) : value);
	    });

	    const converted = srdConverter.convertMonster(monsterData);
	    logger.debug('Converted monster data: $$$', converted);
	    const expandedSpells = converted.spells;
	    delete converted.spells;
	    this.getImportDataWrapper(character).setNewImportData({ npc: converted });
	    if (expandedSpells) {
	      this.addSpellsToCharacter(character, expandedSpells, true);
	    }
	    return character;
	  };

	  this.getTokenRetrievalStrategy = function getTokenRetrievalStrategy(token) {
	    return function tokenRetrievalStrategy(name, errors) {
	      if (token) {
	        const character = roll20.getObj('character', token.get('represents'));
	        if (character && roll20.getAttrByName(character.id, 'locked')) {
	          errors.push(`Character with name ${character.get('name')} and id ${character.id}` +
	            ' was locked and cannot be overwritten');
	          return null;
	        }
	        return character;
	      }
	      return null;
	    };
	  };

	  this.nameRetrievalStrategy = function nameRetrievalStrategy(name, errors) {
	    const chars = roll20.findObjs({ type: 'character', name });
	    if (chars.length > 1) {
	      errors.push(`More than one existing character found with name "${name}". Can\'t replace`);
	      return null;
	    }

	    if (chars[0] && roll20.getAttrByName(chars[0].id, 'locked')) {
	      errors.push(`Character with name ${chars[0].get('name')} and id ${chars[0].id}` +
	        ' was locked and cannot be overwritten');
	      return null;
	    }

	    return chars[0];
	  };

	  this.creationRetrievalStrategy = function creationRetrievalStrategy(name, errors) {
	    if (!_.isEmpty(roll20.findObjs({ type: 'character', name }))) {
	      errors.push(`Can\'t create new character with name "${name}` +
	        '" because one already exists with that name. Perhaps you want --replace?');
	      return null;
	    }

	    return roll20.createObj('character', { name });
	  };

	  this.getAvatarCopier = function getAvatarCopier(token) {
	    return function avatarCopier(character) {
	      character.set('avatar', token.get('imgsrc'));
	    };
	  };

	  this.getTokenConfigurer = function getTokenConfigurer(token) {
	    return function tokenConfigurer(character) {
	      token.set('represents', character.id);
	      token.set('name', character.get('name'));
	      const settings = myState.config.tokenSettings;
	      if (settings.number && token.get('name').indexOf('%%NUMBERED%%') === -1) {
	        token.set('name', `${token.get('name')} %%NUMBERED%%`);
	      }

	      _.chain(settings)
	        .pick(['bar1', 'bar2', 'bar3'])
	        .each((bar, barName) => {
	          if (!_.isEmpty(bar.attribute)) {
	            const attribute = roll20.getOrCreateAttr(character.id, bar.attribute);
	            if (attribute) {
	              token.set(`${barName}_value`, attribute.get('current'));
	              if (bar.max) {
	                token.set(`${barName}_max`, attribute.get('max'));
	              }
	              token.set(`showplayers_${barName}`, bar.showPlayers);
	              if (bar.link) {
	                token.set(`${barName}_link`, attribute.id);
	              }
	            }
	          }
	        });

	      // auras
	      _.chain(settings)
	        .pick(['aura1', 'aura2'])
	        .each((aura, auraName) => {
	          token.set(`${auraName}_radius`, aura.radius);
	          token.set(`${auraName}_color`, aura.color);
	          token.set(`${auraName}_square`, aura.square);
	        });

	      logger.debug('Settings for tokens: $$$', settings);
	      token.set('showname', settings.showName);
	      token.set('showplayers_name', settings.showNameToPlayers);
	      token.set('showplayers_aura1', settings.showAura1ToPlayers);
	      token.set('showplayers_aura2', settings.showAura2ToPlayers);
	      token.set('light_radius', settings.light.radius);
	      token.set('light_dimradius', settings.light.dimRadius);
	      token.set('light_otherplayers', settings.light.otherPlayers);
	      token.set('light_hassight', settings.light.hasSight);
	      token.set('light_angle', settings.light.angle);
	      token.set('light_losangle', settings.light.losAngle);
	      token.set('light_multiplier', settings.light.multiplier);
	    };
	  };

	  this.getTokenVisionConfigurer = function getTokenVisionConfigurer(token, sensesString) {
	    if (_.isEmpty(sensesString)) {
	      return _.noop;
	    }

	    function fullRadiusLightConfigurer() {
	      token.set('light_radius', Math.max(token.get('light_radius') || 0, this.lightRadius));
	      token.set('light_dimradius', Math.max(token.get('light_dimradius') || 0, this.lightRadius));
	    }

	    function darkvisionLightConfigurer() {
	      token.set('light_radius', Math.max(token.get('light_radius') || 0, this.lightRadius * 1.1666666));
	      if (!token.get('light_dimradius')) {
	        token.set('light_dimradius', -5);
	      }
	    }

	    const configureFunctions = {
	      blindsight: fullRadiusLightConfigurer,
	      truesight: fullRadiusLightConfigurer,
	      tremorsense: fullRadiusLightConfigurer,
	      darkvision: darkvisionLightConfigurer,
	    };

	    const re = /(blindsight|darkvision|tremorsense|truesight)\s+(\d+)/;
	    let match;
	    const senses = [];
	    while ((match = sensesString.match(re))) {
	      senses.push({
	        name: match[1],
	        lightRadius: parseInt(match[2], 10),
	        configureVision: configureFunctions[match[1]],
	      });
	      sensesString = sensesString.slice(match.index + match[0].length);
	    }

	    return function configureTokenVision() {
	      senses.forEach(sense => sense.configureVision());
	    };
	  };

	  this.getImportDataWrapper = function getImportDataWrapper(character) {
	    return {
	      setNewImportData(importData) {
	        if (_.isEmpty(importData)) {
	          return;
	        }
	        roll20.setAttrByName(character.id, 'import_data', JSON.stringify(importData));
	        roll20.setAttrByName(character.id, 'import_data_present', 'on');
	      },
	      mergeImportData(importData) {
	        if (_.isEmpty(importData)) {
	          return undefined;
	        }
	        const attr = roll20.getOrCreateAttr(character.id, 'import_data');
	        const dataPresentAttr = roll20.getOrCreateAttr(character.id, 'import_data_present');
	        let current = {};
	        try {
	          if (!_.isEmpty(attr.get('current').trim())) {
	            current = JSON.parse(attr.get('current'));
	          }
	        }
	        catch (e) {
	          logger.warn('Existing import_data attribute value was not valid JSON: [$$$]', attr.get('current'));
	        }
	        _.each(importData, (value, key) => {
	          const currentVal = current[key];
	          if (currentVal) {
	            if (!_.isArray(currentVal)) {
	              current[key] = [currentVal];
	            }
	            current[key] = current[key].concat(value);
	          }
	          else {
	            current[key] = value;
	          }
	        });
	        logger.debug('Setting import data to $$$', current);
	        attr.set('current', JSON.stringify(current));
	        dataPresentAttr.set('current', 'on');
	        return current;
	      },

	      logWrap: 'importDataWrapper',
	    };
	  };

	  this.handleAdvantageTracker = function handleAdvantageTracker(options) {
	    let type = undefined;

	    if (options.normal) {
	      type = 'normal';
	    }
	    else if (options.advantage) {
	      type = 'advantage';
	    }
	    else if (options.disadvantage) {
	      type = 'disadvantage';
	    }

	    if (!_.isUndefined(type)) {
	      at.setRollOption(type, options.selected.character);
	    }

	    if (options.revert) {
	      at.setAutoRevert(true, options.selected.character);
	    }
	    else if (options.persist) {
	      at.setAutoRevert(false, options.selected.character);
	    }
	  };

	  this.handleSlots = function handleSlots(options) {
	    if (options.use) {
	      roll20.processAttrValue(options.character.id, `spell_slots_l${options.use}`, val => Math.max(0, --val));
	    }
	    if (options.restore) {
	      const attrName = `spell_slots_l${options.restore}`;
	      const max = roll20.getAttrByName(options.character.id, attrName, 'max');
	      roll20.processAttrValue(options.character.id, `spell_slots_l${options.restore}`, val => {
	        const retVal = Math.min(max, ++val);
	        logger.debug('Setting attribute to $$$', retVal);
	        return retVal;
	      });
	    }
	  };

	  /////////////////////////////////////////////////
	  // Event Handlers
	  /////////////////////////////////////////////////
	  this.handleAddToken = function handleAddToken(token) {
	    const represents = token.get('represents');
	    if (_.isEmpty(represents)) {
	      return;
	    }
	    const character = roll20.getObj('character', represents);
	    if (!character) {
	      return;
	    }
	    addedTokenIds.push(token.id);

	    const wrappedChangeToken = this.wrapHandler(this.handleChangeToken);

	    // URGH. Thanks Roll20.
	    setTimeout((function wrapper(id) {
	      return function innerWrapper() {
	        const addedToken = roll20.getObj('graphic', id);
	        if (addedToken) {
	          wrappedChangeToken(addedToken);
	        }
	      };
	      /* eslint-disable no-spaced-func */
	    }(token.id)), 100);
	  };

	  this.handleChangeToken = function handleChangeToken(token) {
	    if (_.contains(addedTokenIds, token.id)) {
	      addedTokenIds = _.without(addedTokenIds, token.id);
	      this.setTokenBarsOnDrop(token);
	      at.handleTokenChange(token);
	    }
	  };

	  this.setTokenBarsOnDrop = function setTokenBarsOnDrop(token) {
	    const character = roll20.getObj('character', token.get('represents'));
	    if (!character) {
	      return;
	    }

	    function setBar(barName, bar, value) {
	      if (value) {
	        token.set(`${barName}_value`, value);
	        if (bar.max) {
	          token.set(`${barName}_max`, value);
	        }
	      }
	    }

	    _.chain(myState.config.tokenSettings)
	      .pick('bar1', 'bar2', 'bar3')
	      .each((bar, barName) => {
	        if (bar.attribute && !token.get(`${barName}_link`)) {
	          if (bar.attribute === 'HP' && myState.config.sheetEnhancements.rollHPOnDrop) {
	            // Guard against characters that aren't properly configured - i.e. ones used for templates and system
	            // things rather than actual characters
	            if (_.isEmpty(roll20.getAttrByName(character.id, 'hp_formula'))) {
	              logger.debug('Ignoring character $$$ for rolling HP - has no hp_formula attribute',
	                character.get('name'));
	              return;
	            }
	            roll20.sendChat('', `%{${character.get('name')}|shaped_npc_hp}`, results => {
	              if (results && results.length === 1) {
	                const message = this.processInlinerolls(results[0]);
	                if (!results[0].inlinerolls || !results[0].inlinerolls[0]) {
	                  logger.warn('HP roll didn\'t have the expected structure. This is what we got back: $$$', results[0]);
	                }
	                else {
	                  roll20.sendChat('HP Roller', `/w GM &{template:5e-shaped} ${message}`);
	                  setBar(barName, bar, results[0].inlinerolls[0].results.total);
	                }
	              }
	            });
	          }
	          else {
	            setBar(barName, bar, roll20.getAttrByName(character.id, bar.attribute));
	          }
	        }
	      });
	  };

	  this.registerChatWatcher = function registerChatWatcher(handler, triggerFields) {
	    const matchers = [];
	    if (triggerFields && !_.isEmpty(triggerFields)) {
	      matchers.push((msg, options) => {
	        logger.debug('Matching options: $$$ against triggerFields $$$', options, triggerFields);
	        return _.intersection(triggerFields, _.keys(options)).length === triggerFields.length;
	      });
	    }
	    chatWatchers.push({ matchers, handler: handler.bind(this) });
	  };

	  this.triggerChatWatchers = function triggerChatWatchers(msg) {
	    const options = this.getRollTemplateOptions(msg);
	    logger.debug('Roll template options: $$$', options);
	    _.each(chatWatchers, watcher => {
	      if (_.every(watcher.matchers, matcher => matcher(msg, options))) {
	        watcher.handler(options, msg);
	      }
	    });
	  };

	  /**
	   *
	   * @param options
	   * @param {ChatMessage} msg
	   */
	  this.handleAmmo = function handleAmmo(options, msg) {
	    if (!roll20.getAttrByName(options.character.id, 'ammo_auto_use')) {
	      return;
	    }

	    const ammoAttr = _.chain(roll20.findObjs({ type: 'attribute', characterid: options.character.id }))
	      .filter(attribute => attribute.get('name').indexOf('repeating_ammo') === 0)
	      .groupBy(attribute => attribute.get('name').replace(/(repeating_ammo_[^_]+).*/, '$1'))
	      .find(attributeList =>
	        _.find(attributeList, attribute =>
	        attribute.get('name').match(/.*name$/) && attribute.get('current') === options.ammoName)
	      )
	      .find(attribute => attribute.get('name').match(/.*qty$/))
	      .value();

	    if (!ammoAttr) {
	      logger.error('No ammo attribute found corresponding to name $$$', options.ammoName);
	      return;
	    }

	    let ammoUsed = 1;
	    if (options.ammo) {
	      const rollRef = options.ammo.match(/\$\[\[(\d+)\]\]/);
	      if (rollRef) {
	        const rollExpr = msg.inlinerolls[rollRef[1]].expression;
	        const match = rollExpr.match(/\d+-(\d+)/);
	        if (match) {
	          ammoUsed = match[1];
	        }
	      }
	    }

	    const val = parseInt(ammoAttr.get('current'), 10) || 0;
	    ammoAttr.set('current', Math.max(0, val - ammoUsed));
	  };

	  this.handleHD = function handleHD(options, msg) {
	    const match = options.title.match(/(\d+)d(\d+) Hit Dice/);
	    if (match && myState.config.sheetEnhancements.autoHD) {
	      const hdCount = parseInt(match[1], 10);
	      const hdSize = match[2];
	      const hdAttr = roll20.getAttrObjectByName(options.character.id, `hd_d${hdSize}`);
	      const hpAttr = roll20.getAttrObjectByName(options.character.id, 'HP');
	      const newHp = Math.min(parseInt(hpAttr.get('current'), 10) +
	        this.getRollValue(msg, options.roll1), hpAttr.get('max'));

	      if (hdAttr) {
	        if (hdCount <= hdAttr.get('current')) {
	          hdAttr.set('current', hdAttr.get('current') - hdCount);
	          hpAttr.set('current', newHp);
	        }
	        else {
	          report('HD Police', `${options.characterName} can't use ${hdCount}d${hdSize} hit dice because they only ` +
	            `have ${hdAttr.get('current')} left`);
	        }
	      }
	    }
	  };

	  this.handleRest = function handleRest(options) {
	    if (!_.isUndefined(options.id)) {
	      // if an ID is passed, overwrite any selection, and only process for the passed charId
	      options.selected.character = [options.id];
	    }
	    if (options.long) {
	      // handle long rest
	      rester.doLongRest(options.selected.character);
	    }
	    else if (options.short) {
	      // handle short rest
	      rester.doShortRest(options.selected.character);
	    }
	    else {
	      this.roll20.reportError('please specify long (!shaped-rest --long) or short (!shaped-rest --short) rest');
	    }
	  };

	  this.handleD20Roll = function handleD20Roll(options) {
	    if (options.disadvantage || options.advantage) {
	      const autoRevertOptions = roll20.getAttrByName(options.character.id, 'auto_revert_advantage');
	      if (autoRevertOptions === 'on') {
	        at.setRollOption('normal', [options.character]);
	      }
	    }
	  };

	  this.handleTraitClick = function handleTraitClick(options) {
	    if (myState.config.sheetEnhancements.autoTraits) {
	      const traitMan = new TraitManager(logger, roll20, reporter);
	      traitMan.handleTraitClick(options);
	    }
	  };

	  this.handleSpellCast = function handleSpellCast(options) {
	    if (options.friendlyLevel === 'Cantrip' || !myState.config.sheetEnhancements.autoSpellSlots) {
	      return;
	    }

	    const spellLevel = parseInt(options.friendlyLevel.slice(0, 1), 10);
	    const level = options.castAsLevel ? parseInt(options.castAsLevel, 10) : spellLevel;
	    const availableSlots = _.chain(_.range(spellLevel, 10))
	      .map(slotLevel => roll20.getAttrObjectByName(options.character.id, `spell_slots_l${slotLevel}`))
	      .compact()
	      .filter(attr => attr.get('current') > 0)
	      .value();

	    const spellId = _.chain(roll20.getRepeatingSectionItemIdsByName(options.character.id, 'spell'))
	      .pick(options.title.toLowerCase())
	      .values()
	      .first()
	      .value();

	    logger.debug('Spell id : $$$', spellId);

	    const ritual = spellId ? !!roll20.getAttrByName(options.character.id, `repeating_spell_${spellId}_ritual`) : false;

	    let msg;

	    const bestSlot = availableSlots
	        .find(slot => parseInt(slot.get('name').match(/spell_slots_l(\d)/)[1], 10) === level) ||
	      _.first(availableSlots);

	    if (bestSlot) {
	      const slotLevel = parseInt(bestSlot.get('name').match(/spell_slots_l(\d)/)[1], 10);
	      if (slotLevel === level) {
	        bestSlot.set('current', bestSlot.get('current') - 1);
	        if (ritual) {
	          msg = `1 slot of level ${level} used. [Cast as ritual](!shaped-slots --restore ${level} ` +
	            `--character ${options.character.id}) instead?`;
	        }
	      }
	      else if (!options.castAsLevel) {
	        msg = `You have no level ${level} spell slots left. Do you want to ` +
	          `[Cast at level ${slotLevel}](!shaped-slots --use ${slotLevel} --character ${options.character.id}) instead?`;
	        if (ritual) {
	          msg += ' Alternatively, you could cast a ritual without using a slot.';
	        }
	      }
	      else {
	        msg = `You have no ${level} spell slots left. You can ` +
	          `[Recast at level ${slotLevel}](!&#13;&#37;{${options.character.get('name')}` +
	          `|repeating_spell_${spellId}_spell})`;
	        if (ritual) {
	          msg += ' or cast as a ritual instead.';
	        }
	      }
	    }
	    else {
	      msg = `${options.character.get('name')} has no spell slots of level ${level} to cast ${options.title}`;
	      if (ritual) {
	        msg += ' but could cast as a ritual instead without using a slot.';
	      }
	    }

	    if (msg) {
	      roll20.sendChat('Spell Slots Police', msg);
	    }
	  };

	  this.handleDeathSave = function handleDeathSave(options, msg) {
	    // TODO: Do we want to output text on death/recovery?
	    function increment(val) {
	      return ++val;
	    }

	    // TODO: Advantage?
	    if (roll20.getAttrByName(options.character.id, 'roll_setting') !== '@{roll_2}') {
	      const result = this.getRollValue(msg, options.roll1);
	      const attributeToIncrement = result >= 10 ? 'death_saving_throw_successes' : 'death_saving_throw_failures';
	      roll20.processAttrValue(options.character.id, attributeToIncrement, increment);
	    }
	  };

	  this.handleFX = function handleFX(options, msg) {
	    const parts = options.fx.split(' ');
	    if (parts.length < 2 || _.some(parts.slice(0, 2), _.isEmpty)) {
	      logger.warn('FX roll template variable is not formated correctly: [$$$]', options.fx);
	      return;
	    }


	    const fxType = parts[0];
	    const pointsOfOrigin = parts[1];
	    let targetTokenId;
	    const sourceCoords = {};
	    const targetCoords = {};
	    let fxCoords = [];
	    let pageId;

	    // noinspection FallThroughInSwitchStatementJS
	    switch (pointsOfOrigin) {
	      case 'sourceToTarget':
	      case 'source':
	        targetTokenId = parts[2];
	        fxCoords.push(sourceCoords, targetCoords);
	        break;
	      case 'targetToSource':
	      case 'target':
	        targetTokenId = parts[2];
	        fxCoords.push(targetCoords, sourceCoords);
	        break;
	      default:
	        throw new Error(`Unrecognised pointsOfOrigin type in fx spec: ${pointsOfOrigin}`);
	    }

	    if (targetTokenId) {
	      const targetToken = roll20.getObj('graphic', targetTokenId);
	      pageId = targetToken.get('_pageid');
	      targetCoords.x = targetToken.get('left');
	      targetCoords.y = targetToken.get('top');
	    }
	    else {
	      pageId = roll20.getCurrentPage(msg.playerid).id;
	    }


	    const casterTokens = roll20.findObjs({ type: 'graphic', pageid: pageId, represents: options.character.id });

	    if (casterTokens.length) {
	      // If there are multiple tokens for the character on this page, then try and find one of them that is selected
	      // This doesn't work without a selected token, and the only way we can get this is to use @{selected} which is a
	      // pain for people who want to launch without a token selected if(casterTokens.length > 1) { const selected =
	      // _.findWhere(casterTokens, {id: sourceTokenId}); if (selected) { casterTokens = [selected]; } }
	      sourceCoords.x = casterTokens[0].get('left');
	      sourceCoords.y = casterTokens[0].get('top');
	    }


	    if (!fxCoords[0]) {
	      logger.warn('Couldn\'t find required point for fx for character $$$, casterTokens: $$$, fxSpec: $$$ ',
	        options.character.id, casterTokens, options.fx);
	      return;
	    }
	    else if (!fxCoords[1]) {
	      fxCoords = fxCoords.slice(0, 1);
	    }

	    roll20.spawnFx(fxCoords, fxType, pageId);
	  };

	  this.getRollValue = function getRollValue(msg, rollOutputExpr) {
	    const rollIndex = rollOutputExpr.match(/\$\[\[(\d+)\]\]/)[1];
	    return msg.inlinerolls[rollIndex].results.total;
	  };

	  /**
	   *
	   * @returns {*}
	   */
	  this.getRollTemplateOptions = function getRollTemplateOptions(msg) {
	    if (msg.rolltemplate === '5e-shaped') {
	      const regex = /\{\{(.*?)\}\}/g;
	      let match;
	      const options = {};
	      while (!!(match = regex.exec(msg.content))) {
	        if (match[1]) {
	          const splitAttr = match[1].split('=');
	          const propertyName = splitAttr[0].replace(/_([a-z])/g, (m, letter) => letter.toUpperCase());
	          options[propertyName] = splitAttr.length === 2 ? splitAttr[1] : '';
	        }
	      }
	      if (options.characterName) {
	        options.character = roll20.findObjs({
	          _type: 'character',
	          name: options.characterName,
	        })[0];
	      }
	      return options;
	    }
	    return {};
	  };

	  this.processInlinerolls = function processInlinerolls(msg) {
	    if (_.has(msg, 'inlinerolls')) {
	      return _.chain(msg.inlinerolls)
	        .reduce((previous, current, index) => {
	          previous[`$[[${index}]]`] = current.results.total || 0;
	          return previous;
	        }, {})
	        .reduce((previous, current, index) => previous.replace(index.toString(), current), msg.content)
	        .value();
	    }

	    return msg.content;
	  };

	  this.addAbility = function addAbility(options) {
	    if (_.isEmpty(options.abilities)) {
	      reportError('No abilities specified. Take a look at the documentation for a list of ability options.');
	      return;
	    }
	    const messages = _.map(options.selected.character, (character) => {
	      const operationMessages = _.chain(options.abilities)
	        .sortBy('sortKey')
	        .map(maker => maker.run(character, options))
	        .value();


	      if (_.isEmpty(operationMessages)) {
	        return `<li>${character.get('name')}: Nothing to do</li>`;
	      }

	      let message;
	      message = `<li>Configured the following abilities for character ${character.get('name')}:<ul><li>`;
	      message += operationMessages.join('</li><li>');
	      message += '</li></ul></li>';

	      return message;
	    });

	    report('Ability Creation', `<ul>${messages.join('')}</ul>`);
	  };

	  function getAbilityMaker(character) {
	    return function abilityMaker(abilitySpec) {
	      const ability = roll20.getOrCreateObj('ability', { characterid: character.id, name: abilitySpec.name });
	      ability.set({ action: abilitySpec.action, istokenaction: true }); // TODO configure this
	      return abilitySpec.name;
	    };
	  }

	  const abilityDeleter = {
	    run(character) {
	      const abilities = roll20.findObjs({ type: 'ability', characterid: character.id });
	      const deleted = _.map(abilities, obj => {
	        const name = obj.get('name');
	        obj.remove();
	        return name;
	      });

	      return `Deleted: ${_.isEmpty(deleted) ? 'None' : deleted.join(', ')}`;
	    },
	    sortKey: '',
	  };

	  function RepeatingAbilityMaker(repeatingSection, abilityName, label, canMark) {
	    this.run = function run(character, options) {
	      options[`cache${repeatingSection}`] = options[`cache${repeatingSection}`] ||
	        roll20.getRepeatingSectionItemIdsByName(character.id, repeatingSection);

	      const configured = _.chain(options[`cache${repeatingSection}`])
	        .map((repeatingId, repeatingName) => {
	          let repeatingAction = `%{${character.get('name')}|repeating_${repeatingSection}_${repeatingId}` +
	            `_${abilityName}}`;
	          if (canMark && options.mark) {
	            repeatingAction += '\n!mark @{target|token_id}';
	          }
	          return { name: utils.toTitleCase(repeatingName), action: repeatingAction };
	        })
	        .map(getAbilityMaker(character))
	        .value();

	      const addedText = _.isEmpty(configured) ? 'Not present for character' : configured.join(', ');
	      return `${label}: ${addedText}`;
	    };
	    this.sortKey = 'originalOrder';
	  }

	  function RollAbilityMaker(abilityName, newName) {
	    this.run = function run(character) {
	      return getAbilityMaker(character)({
	        name: newName,
	        action: `%{${character.get('name')}|${abilityName}}`,
	      });
	    };
	    this.sortKey = 'originalOrder';
	  }


	  function CommandAbilityMaker(command, options, newName) {
	    this.run = function run(character) {
	      return getAbilityMaker(character)({
	        name: newName,
	        action: `!${command} ${utils.toOptionsString(options)}`,
	      });
	    };
	    this.sortKey = 'originalOrder';
	  }

	  function MultiCommandAbilityMaker(commandSpecs) {
	    this.run = function run(character) {
	      const abilMaker = getAbilityMaker(character);
	      return commandSpecs.map(cmdSpec =>
	        abilMaker({
	          name: cmdSpec.abilityName,
	          action: `!${cmdSpec.command} ${utils.toOptionsString(cmdSpec.options)}`,
	        })
	      );
	    };
	    this.sortKey = 'originalOrder';
	  }

	  function RepeatingSectionMacroMaker(abilityName, repeatingSection, macroName) {
	    this.run = function run(character) {
	      if (!_.isEmpty(roll20.getRepeatingSectionAttrs(character.id, repeatingSection))) {
	        return getAbilityMaker(character)({
	          name: macroName,
	          action: `%{${character.get('name')}|${abilityName}}`,
	        });
	      }
	      return `${macroName}: Not present for character`;
	    };
	    this.sortKey = 'originalOrder';
	  }

	  const staticAbilityOptions = {
	    DELETE: abilityDeleter,
	    initiative: new RollAbilityMaker('shaped_initiative', 'Init'),
	    abilityChecks: new RollAbilityMaker('shaped_ability_checks', 'Ability Checks'),
	    abilityChecksSmall: new RollAbilityMaker('shaped_ability_checks_small', 'Ability Checks'),
	    abilityChecksQuery: new RollAbilityMaker('shaped_ability_checks_query', 'Ability Checks'),
	    abilChecks: new RollAbilityMaker('shaped_ability_checks', 'AbilChecks'),
	    abilChecksSmall: new RollAbilityMaker('shaped_ability_checks_small', 'AbilChecks'),
	    abilChecksQuery: new RollAbilityMaker('shaped_ability_checks_query', 'AbilChecks'),
	    advantageTracker: new MultiCommandAbilityMaker([
	      { command: 'shaped-at', options: ['advantage'], abilityName: 'Advantage' },
	      { command: 'shaped-at', options: ['disadvantage'], abilityName: 'Disadvantage' },
	      { command: 'shaped-at', options: ['normal'], abilityName: 'Normal' },
	    ]),
	    advantageTrackerQuery: new CommandAbilityMaker('shaped-at',
	      ['?{Roll Option|Normal,normal|w/ Advantage,advantage|w/ Disadvantage,disadvantage}'], '(dis)Adv Query'),
	    savingThrows: new RollAbilityMaker('shaped_saving_throw', 'Saving Throws'),
	    savingThrowsSmall: new RollAbilityMaker('shaped_saving_throw_small', 'Saving Throws'),
	    savingThrowsQuery: new RollAbilityMaker('shaped_saving_throw_query', 'Saving Throws'),
	    saves: new RollAbilityMaker('shaped_saving_throw', 'Saves'),
	    savesSmall: new RollAbilityMaker('shaped_saving_throw_small', 'Saves'),
	    savesQuery: new RollAbilityMaker('shaped_saving_throw_query', 'Saves'),
	    attacks: new RepeatingAbilityMaker('attack', 'attack', 'Attacks', true),
	    statblock: new RollAbilityMaker('shaped_statblock', 'Statblock'),
	    traits: new RepeatingAbilityMaker('trait', 'trait', 'Traits'),
	    traitsMacro: new RepeatingSectionMacroMaker('shaped_traits', 'trait', 'Traits'),
	    actions: new RepeatingAbilityMaker('action', 'action', 'Actions', true),
	    actionsMacro: new RepeatingSectionMacroMaker('shaped_actions', 'action', 'Actions'),
	    reactions: new RepeatingAbilityMaker('reaction', 'action', 'Reactions'),
	    reactionsMacro: new RepeatingSectionMacroMaker('shaped_reactions', 'reaction', 'Reactions'),
	    legendaryActions: new RepeatingAbilityMaker('legendaryaction', 'action', 'Legendary Actions'),
	    legendaryActionsMacro: new RepeatingSectionMacroMaker('shaped_legendaryactions', 'legendaryaction', 'Legendary' +
	      ' Actions'),
	    legendaryA: new RepeatingAbilityMaker('legendaryaction', 'action', 'LegendaryA'),
	    lairActions: new RepeatingSectionMacroMaker('shaped_lairactions', 'lairaction', 'Lair Actions'),
	    lairA: new RepeatingSectionMacroMaker('shaped_lairactions', 'lairaction', 'LairA'),
	    regionalEffects: new RepeatingSectionMacroMaker('shaped_regionaleffects', 'regionaleffect', 'Regional Effects'),
	    regionalE: new RepeatingSectionMacroMaker('shaped_regionaleffects', 'regionaleffect', 'RegionalE'),
	  };

	  function abilityLookup(optionName, existingOptions) {
	    let maker = staticAbilityOptions[optionName];

	    // Makes little sense to add named spells to multiple characters at once
	    if (!maker && existingOptions.selected.character.length === 1) {
	      existingOptions.spellToRepeatingIdLookup = existingOptions.spellToRepeatingIdLookup ||
	        roll20.getRepeatingSectionItemIdsByName(existingOptions.selected.character[0].id, 'spell');

	      const repeatingId = existingOptions.spellToRepeatingIdLookup[optionName.toLowerCase()];
	      if (repeatingId) {
	        maker = new RollAbilityMaker(`repeating_spell_${repeatingId}_spell`, utils.toTitleCase(optionName));
	      }
	    }
	    return maker;
	  }


	  this.getCommandProcessor = function getCommandProcessor() {
	    return cp('shaped', roll20)
	    // !shaped-config
	      .addCommand('config', this.configure.bind(this))
	      .options(configOptionsSpec)
	      .option('atMenu', booleanValidator)
	      .option('tsMenu', booleanValidator)
	      .option('ncMenu', booleanValidator)
	      .option('seMenu', booleanValidator)
	      .option('hrMenu', booleanValidator)
	      .option('varsMenu', booleanValidator)
	      // !shaped-import-statblock
	      .addCommand('import-statblock', this.importStatblock.bind(this))
	      .option('overwrite', booleanValidator)
	      .option('replace', booleanValidator)
	      .withSelection({
	        graphic: {
	          min: 1,
	          max: Infinity,
	        },
	      })
	      // !shaped-import-monster , !shaped-monster
	      .addCommand(['import-monster', 'monster'], this.importMonstersFromJson.bind(this))
	      .option('all', booleanValidator)
	      .optionLookup('monsters', _.partial(entityLookup.findEntity.bind(entityLookup), 'monsters', _, false))
	      .option('overwrite', booleanValidator)
	      .option('replace', booleanValidator)
	      .withSelection({
	        graphic: {
	          min: 0,
	          max: 1,
	        },
	      })
	      // !shaped-import-spell, !shaped-spell
	      .addCommand(['import-spell', 'spell'], this.importSpellsFromJson.bind(this))
	      .optionLookup('spells', _.partial(entityLookup.findEntity.bind(entityLookup), 'spells', _, false))
	      .withSelection({
	        character: {
	          min: 1,
	          max: 1,
	        },
	      })
	      // !shaped-import-spell-list
	      .addCommand('import-spell-list', this.importSpellListFromJson.bind(this))
	      .options(spellSearchCriteria)
	      .withSelection({
	        character: {
	          min: 1,
	          max: 1,
	        },
	      })
	      // !shaped-at
	      .addCommand('at', this.handleAdvantageTracker.bind(this))
	      .option('advantage', booleanValidator)
	      .option('disadvantage', booleanValidator)
	      .option('normal', booleanValidator)
	      .option('revert', booleanValidator)
	      .option('persist', booleanValidator)
	      .withSelection({
	        character: {
	          min: 1,
	          max: Infinity,
	        },
	      })
	      // !shaped-abilities
	      .addCommand('abilities', this.addAbility.bind(this))
	      .withSelection({
	        character: {
	          min: 1,
	          max: Infinity,
	        },
	      })
	      .optionLookup('abilities', abilityLookup)
	      .option('mark', booleanValidator)
	      // !shaped-token-defaults
	      .addCommand('token-defaults', this.applyTokenDefaults.bind(this))
	      .withSelection({
	        graphic: {
	          min: 1,
	          max: Infinity,
	        },
	      })
	      // !shaped-slots
	      .addCommand('slots', this.handleSlots.bind(this))
	      .option('character', getCharacterValidator(roll20), true)
	      .option('use', integerValidator)
	      .option('restore', integerValidator)
	      // !shaped-rest
	      .addCommand('rest', this.handleRest.bind(this))
	      .option('long', booleanValidator)
	      .option('short', booleanValidator)
	      .option('id', getCharacterValidator(roll20), false)
	      .withSelection({
	        character: {
	          min: 0,
	          max: Infinity,
	        },
	      })
	      .end();
	  };

	  this.checkInstall = function checkInstall() {
	    logger.info('-=> ShapedScripts v2.0.0 <=-');
	    Migrator.migrateShapedConfig(myState, logger);
	  };

	  this.wrapHandler = function wrapHandler(handler) {
	    const self = this;
	    return function handlerWrapper() {
	      try {
	        handler.apply(self, arguments);
	      }
	      catch (e) {
	        if (typeof e === 'string' || e instanceof parseModule.ParserError || e instanceof UserError) {
	          reportError(e);
	          logger.error('Error: $$$', e.toString());
	        }
	        else {
	          logger.error(e.toString());
	          logger.error(e.stack);
	          reportError('An error occurred. Please see the log for more details.');
	        }
	      }
	      finally {
	        logger.prefixString = '';
	      }
	    };
	  };

	  this.registerEventHandlers = function registerEventHandlers() {
	    roll20.on('chat:message', this.wrapHandler(this.handleInput));
	    roll20.on('add:token', this.wrapHandler(this.handleAddToken));
	    roll20.on('change:token', this.wrapHandler(this.handleChangeToken));
	    roll20.on('change:attribute', this.wrapHandler((curr) => {
	      if (curr.get('name') === 'roll_setting') {
	        at.handleRollOptionChange(curr);
	      }
	    }));
	    this.registerChatWatcher(this.handleDeathSave, ['deathSavingThrow', 'character', 'roll1']);
	    this.registerChatWatcher(this.handleAmmo, ['ammoName', 'character']);
	    this.registerChatWatcher(this.handleFX, ['fx', 'character']);
	    this.registerChatWatcher(this.handleHD, ['character', 'title']);
	    this.registerChatWatcher(this.handleD20Roll, ['character', 'roll1']);
	    this.registerChatWatcher(this.handleTraitClick, ['character', 'trait']);
	    // this.registerChatWatcher(this.handleSpellCast, ['character', 'spell', 'friendlyLevel']);
	  };

	  logger.wrapModule(this);
	}

	ShapedScripts.prototype.logWrap = 'ShapedScripts';


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);
	const utils = __webpack_require__(7);
	const UserError = __webpack_require__(12);


	function getParser(optionString, validator) {
	  return function parseOptions(arg, errors, options) {
	    const argParts = arg.split(/\s+/);
	    if (argParts[0].toLowerCase() === optionString.toLowerCase()) {
	      if (argParts.length <= 2) {
	        // Allow for bare switches
	        const value = argParts.length === 2 ? argParts[1] : true;
	        const result = validator(value);
	        if (result.valid) {
	          options[argParts[0]] = result.converted;
	        }
	        else {
	          errors.push(`Invalid value [${value}] for option [${argParts[0]}]`);
	        }
	      }
	      return true;
	    }
	    return false;
	  };
	}

	function getObjectParser(specObject) {
	  return function parseOptions(arg, errors, options) {
	    const argParts = arg.split(/\s+/);
	    const newObject = utils.createObjectFromPath(argParts[0], argParts.slice(1).join(' '));

	    const comparison = { spec: specObject, actual: newObject };
	    while (comparison.spec) {
	      const key = _.keys(comparison.actual)[0];
	      const spec = comparison.spec[key];
	      if (!spec) {
	        return false;
	      }
	      if (_.isFunction(comparison.spec[key])) {
	        const result = comparison.spec[key](comparison.actual[key]);
	        if (result.valid) {
	          comparison.actual[key] = result.converted;
	          utils.deepExtend(options, newObject);
	        }
	        else {
	          errors.push(`Invalid value [${comparison.actual[key]}] for option [${argParts[0]}]`);
	        }
	        return true;
	      }
	      else if (_.isArray(comparison.actual[key])) {
	        const newVal = [];
	        newVal[comparison.actual[key].length - 1] = comparison.spec[key][0];
	        comparison.spec = newVal;
	        comparison.actual = comparison.actual[key];
	      }
	      else {
	        comparison.spec = comparison.spec[key];
	        comparison.actual = comparison.actual[key];
	      }
	    }
	    return false;
	  };
	}

	/**
	 * @constructor
	 */

	class Command {
	  constructor(root, handler, roll20, name) {
	    this.root = root;
	    this.handler = handler;
	    this.parsers = [];
	    this.roll20 = roll20;
	    this.name = name;
	  }


	  option(optionString, validator, required) {
	    let parser;
	    if (_.isFunction(validator)) {
	      parser = getParser(optionString, validator);
	    }
	    else if (_.isObject(validator)) {
	      const dummy = {};
	      dummy[optionString] = validator;
	      parser = getObjectParser(dummy);
	    }
	    else {
	      throw new Error(`Bad validator [${validator}] specified for option ${optionString}`);
	    }
	    parser.required = required;
	    parser.optName = optionString;
	    this.parsers.push(parser);
	    return this;
	  }

	  options(optsSpec) {
	    _.each(optsSpec, (validator, key) => this.option(key, validator));
	    return this;
	  }

	  optionLookup(groupName, lookup, required) {
	    if (typeof lookup !== 'function') {
	      lookup = _.propertyOf(lookup);
	    }
	    const parser = (arg, errors, options) => {
	      const singleResolved = lookup(arg, options);
	      if (singleResolved) {
	        options[groupName] = options[groupName] || [];
	        options[groupName].push.apply(options[groupName],
	          _.isArray(singleResolved) ? singleResolved : [singleResolved]);
	        return true;
	      }


	      const results = _.chain(arg.split(','))
	        .map(_.partial(_.result, _, 'trim'))
	        .uniq()
	        .reduce((memo, name) => {
	          const resolvedPart = lookup(name, options);
	          if (resolvedPart) {
	            memo.resolved.push(resolvedPart);
	          }
	          else {
	            memo.errors.push(`Unrecognised item ${name} for option group ${groupName}`);
	          }
	          return memo;
	        }, { errors: [], resolved: [] })
	        .value();

	      if (!_.isEmpty(results.resolved)) {
	        options[groupName] = results.resolved;
	        errors.push.apply(errors, results.errors);
	        return true;
	      }
	      return false;
	    };
	    parser.optName = groupName;
	    parser.required = required;
	    this.parsers.push(parser);
	    return this;
	  }

	  handle(args, selection, cmdString) {
	    const startOptions = { errors: [] };
	    startOptions.selected = this.selectionSpec && processSelection(selection || [], this.selectionSpec, this.roll20);
	    const finalOptions = _.chain(args)
	      .reduce((options, arg) => {
	        if (!_.some(this.parsers, parser => parser(arg, options.errors, options))) {
	          options.errors.push(`Unrecognised or poorly formed option ${arg}`);
	        }

	        return options;
	      }, startOptions)
	      .omit(_.isUndefined)
	      .value();

	    if (finalOptions.errors.length > 0) {
	      throw finalOptions.errors.join('\n');
	    }
	    delete finalOptions.errors;


	    const missingOpts = _.chain(this.parsers)
	      .where({ required: true })
	      .pluck('optName')
	      .difference(_.keys(finalOptions))
	      .value();

	    if (!_.isEmpty(missingOpts)) {
	      throw new UserError(`Command ${cmdString} was missing options: [${missingOpts.join(',')}]`);
	    }

	    this.handler(finalOptions);
	  }

	  withSelection(selectionSpec) {
	    this.selectionSpec = selectionSpec;
	    return this;
	  }


	  addCommand(cmdString, handler) {
	    return this.root.addCommand(cmdString, handler);
	  }

	  end() {
	    return this.root;
	  }

	  get logWrap() {
	    return `command [${this.name}]`;
	  }
	}

	function processSelection(selection, constraints, roll20) {
	  return _.reduce(constraints, (result, constraintDetails, type) => {
	    const objects = _.chain(selection)
	      .where({ _type: type === 'character' ? 'graphic' : type })
	      .map(selected => roll20.getObj(selected._type, selected._id))
	      .map(object => {
	        if (type === 'character' && object) {
	          return roll20.getObj('character', object.get('represents'));
	        }
	        return object;
	      })
	      .compact()
	      .uniq()
	      .value();
	    if (_.size(objects) < constraintDetails.min || _.size(objects) > constraintDetails.max) {
	      throw new UserError(`Wrong number of objects of type [${type}] selected, should be between ` +
	        `${constraintDetails.min} and ${constraintDetails.max}`);
	    }
	    switch (_.size(objects)) {
	      case 0:
	        break;
	      case 1:
	        if (constraintDetails.max === 1) {
	          result[type] = objects[0];
	        }
	        else {
	          result[type] = objects;
	        }
	        break;
	      default:
	        result[type] = objects;
	    }
	    return result;
	  }, {});
	}

	module.exports = function commandParser(rootCommand, roll20) {
	  const commands = {};
	  return {
	    addCommand(cmds, handler) {
	      const command = new Command(this, handler, roll20, _.isArray(cmds) ? cmds.join(',') : cmds);
	      (_.isArray(cmds) ? cmds : [cmds]).forEach(cmdString => (commands[cmdString] = command));
	      return command;
	    },

	    processCommand(msg) {
	      const prefix = `!${rootCommand}-`;
	      if (msg.type === 'api' && msg.content.indexOf(prefix) === 0) {
	        const cmdString = msg.content.slice(prefix.length);
	        const parts = cmdString.split(/\s+--/);
	        const cmdName = parts.shift();
	        const cmd = commands[cmdName];
	        if (!cmd) {
	          throw new UserError(`Unrecognised command ${prefix}${cmdName}`);
	        }
	        cmd.handle(parts, msg.selected, `${prefix}${cmdName}`);
	      }
	    },

	    logWrap: 'commandParser',
	  };
	};


/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';


	class UserError extends Error {
	  constructor(message) {
	    super();
	    this.message = message;
	  }
	}

	module.exports = UserError;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);
	const utils = __webpack_require__(7);

	const rollOptions = {
	  normal: {
	    rollSetting: '@{roll_1}',
	    message: 'normally',
	    rollInfo: '',
	    preroll: '',
	    postroll: '',
	  },
	  advantage: {
	    rollSetting: '@{roll_advantage}',
	    message: 'with advantage',
	    rollInfo: '{{advantage=1}}',
	    preroll: 2,
	    postroll: 'kh1',
	  },
	  disadvantage: {
	    rollSetting: '@{roll_disadvantage}',
	    message: 'with disadvantage',
	    rollInfo: '{{disadvantage=1}}',
	    preroll: 2,
	    postroll: 'kl1',
	  },
	  roll2: {
	    rollSetting: '@{roll_2}',
	    message: 'two dice',
	    rollInfo: '',
	    preroll: '',
	    postroll: '',
	  },
	};

	class AdvantageTracker {

	  constructor(logger, myState, roll20) {
	    this.logger = logger;
	    this.myState = myState;
	    this.roll20 = roll20;
	  }

	  handleRollOptionChange(msg) {
	    const char = [];
	    char.push(msg.get('_characterid'));
	    const br = this.buildResources(_.uniq(_.union(char)));

	    this.setStatusMarkers(br[0].tokens,
	      msg.get('current') === '@{roll_advantage}',
	      msg.get('current') === '@{roll_disadvantage}');
	  }

	  handleTokenChange(token) {
	    this.logger.debug('AT: Updating New Token');
	    if (this.shouldShowMarkers() && token.get('represents') !== '') {
	      const character = this.roll20.getObj('character', token.get('represents'));
	      const setting = this.roll20.getAttrByName(character.id, 'roll_setting');

	      if (this.shouldIgnoreNpcs()) {
	        if (this.roll20.getAttrByName(character.id, 'is_npc') === '1') {
	          return;
	        }
	      }

	      token.set(`status_${this.disadvantageMarker()}`, setting === '@{roll_disadvantage}');
	      token.set(`status_${this.advantageMarker()}`, setting === '@{roll_advantage}');
	    }
	  }

	  buildResources(characterIds) {
	    return _.chain(characterIds)
	      .map((charId) => this.roll20.getObj('character', charId))
	      .reject(_.isUndefined)
	      .map((char) => ({
	        character: char,
	        tokens: this.roll20.filterObjs((obj) => obj.get('_type') === 'graphic' && char.id === obj.get('represents')),
	      }))
	      .value();
	  }

	  setStatusMarkers(tokens, showAdvantage, showDisadvantage) {
	    if (this.shouldShowMarkers()) {
	      _.each(tokens, (token) => {
	        token.set(`status_${this.advantageMarker()}`, showAdvantage);
	        token.set(`status_${this.disadvantageMarker()}`, showDisadvantage);
	      });
	    }
	  }

	  setAutoRevert(value, selectedChars) {
	    const resources = this.buildResources(_.chain(selectedChars).map(c => c.get('_id')).value());
	    _.each(resources, (resource) => {
	      const charId = resource.character.get('_id');
	      this.roll20.setAttrByName(charId, 'auto_revert_advantage', value ? 'on' : 0);
	    });
	  }

	  setRollOption(type, selectedChars) {
	    const resources = this.buildResources(_.chain(selectedChars).map(c => c.get('_id')).value());

	    _.each(resources, (resource) => {
	      const charId = resource.character.get('_id');

	      this.setStatusMarkers(resource.tokens, type === 'advantage', type === 'disadvantage');

	      if (this.roll20.getAttrByName(charId, 'roll_setting') === rollOptions[type].rollSetting) {
	        return;
	      }

	      this.roll20.setAttrByName(charId, 'roll_setting', rollOptions[type].rollSetting);
	      this.roll20.setAttrByName(charId, 'roll_info', rollOptions[type].rollInfo);
	      this.roll20.setAttrByName(charId, 'preroll', rollOptions[type].preroll);
	      this.roll20.setAttrByName(charId, 'postroll', rollOptions[type].postroll);

	      if (this.outputOption() !== 'silent') {
	        let msg = ` &{template:5e-shaped} {{character_name=${resource.character.get('name')}}} ` +
	          `@{${resource.character.get('name')}|show_character_name} {{title=${utils.toTitleCase(type)}}} ` +
	          `{{text_top=${resource.character.get('name')} is rolling ${rollOptions[type].message}!}}`;
	        if (this.outputOption() === 'whisper') {
	          msg = `/w gm ${msg}`;
	        }
	        this.roll20.sendChat('Shaped AdvantageTracker', msg);
	      }
	    });
	  }

	  outputOption() {
	    return this.myState.config.advTrackerSettings.output;
	  }

	  shouldShowMarkers() {
	    return this.myState.config.advTrackerSettings.showMarkers;
	  }

	  shouldIgnoreNpcs() {
	    return this.myState.config.advTrackerSettings.ignoreNpcs;
	  }

	  advantageMarker() {
	    return this.myState.config.advTrackerSettings.advantageMarker;
	  }

	  disadvantageMarker() {
	    return this.myState.config.advTrackerSettings.disadvantageMarker;
	  }
	}

	module.exports = AdvantageTracker;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);

	class RestManager {

	  constructor(logger, myState, roll20) {
	    this.logger = logger;
	    this.myState = myState;
	    this.roll20 = roll20;
	  }

	  /**
	   * Performs all of the short rest actions for the specified character
	   * @param {collection of characters} selectedChars - The characters to perform short rest actions on
	   */
	  doShortRest(selectedChars) {
	    _.each(selectedChars, (currentChar) => {
	      const charId = currentChar.get('_id');
	      const charName = this.roll20.getObj('character', charId).get('name');
	      this.logger.debug(`Processing short rest for ${charName}:`);

	      const traits = this.rechargeTraits(charId, 'short');

	      const msg = this.buildRestMessage('Short Rest', charName, charId, traits);

	      this.roll20.sendChat(`character|${charId}`, msg);
	    });
	  }

	  /**
	   * Performs all of the long rest actions for the specified character - including short rest actions
	   * @param {collection of characters} selectedChars - The characters to perform long rest actions on
	   */
	  doLongRest(selectedChars) {
	    _.each(selectedChars, (currentChar) => {
	      const charId = currentChar.get('_id');
	      const charName = this.roll20.getObj('character', charId).get('name');
	      let healed = 0;

	      this.logger.debug(`Processing long rest for ${charName}:`);

	      let traits = this.rechargeTraits(charId, 'short');
	      traits = traits.concat(this.rechargeTraits(charId, 'long'));

	      if (!this.myState.config.variants.rests.longNoHpFullHd) {
	        healed = this.resetHP(charId);
	      }
	      const hd = this.regainHitDie(charId);
	      const slots = this.regainSpellSlots(charId);
	      const exhaus = this.reduceExhaustion(charId);

	      const msg = this.buildRestMessage('Long Rest', charName, charId, traits, healed, hd, slots, exhaus);

	      this.roll20.sendChat(`character|${charId}`, msg);
	    });
	  }

	  /**
	   * Builds the rest message using the sheet's roll template to report the results of a rest
	   * @param {string} restType - The type of rest performed; either 'Long Rest' or 'Short Rest'
	   * @param {string} charName - The name of the character
	   * @param {string} charId - The Roll20 character ID
	   * @param {array} traitNames - An array of the trait names that have been recharged
	   * @param {int} healed - The number of HP healed
	   * @param {array} hdRegained - Array of objects each representing a die type and the number regained
	   * @param {boolean} spellSlots - Whether or not spell slots were recharged
	   * @param {boolean} exhaustion - Whether or not a level of exhaustoin was removed
	   */
	  buildRestMessage(restType, charName, charId, traitNames, healed, hdRegained, spellSlots, exhaustion) {
	    let msg = `&{template:5e-shaped} {{title=${restType}}} {{character_name=${charName}}}`;

	    if (this.roll20.getAttrByName(charId, 'show_character_name') === '@{show_character_name_yes}') {
	      msg += '{{show_character_name=1}}';
	    }

	    if (hdRegained) {
	      _.each(hdRegained, hd => {
	        if (hd.quant > 0) {
	          msg += `{{Hit Die Regained (${hd.die})=${hd.quant}}}`;
	        }
	      });
	    }

	    if (traitNames) { msg += `{{Traits Recharged=${traitNames.join(', ')}}}`; }
	    if (healed > 0) { msg += `{{heal=[[${healed}]]}}`; }
	    if (spellSlots) { msg += '{{text_center=Spell Slots Regained}}'; }
	    if (exhaustion) { msg += '{{text_top=Removed 1 Level Of Exhaustion}}'; }

	    return msg;
	  }

	  /**
	   * Recharges all of the repeating 'traits' section items that have a 'recharge' defined
	   * @param {string} charId - the Roll20 character ID
	   * @param {string} restType - the type of rest being performed; either 'Short Rest' or 'Long Rest'
	   * @returns {Array} - An array of the trait names that were recharged
	   */
	  rechargeTraits(charId, restType) {
	    const traitNames = [];

	    _.chain(this.roll20.findObjs({ type: 'attribute', characterid: charId }))
	      .map(attribute => (attribute.get('name').match(/^repeating_trait_([^_]+)_recharge$/) || [])[1])
	      .reject(_.isUndefined)
	      .uniq()
	      .each(attId => {
	        const traitPre = `repeating_trait_${attId}`;
	        const rechargeAtt = this.roll20.getAttrByName(charId, `${traitPre}_recharge`);
	        if (rechargeAtt.toLowerCase().indexOf(restType) !== -1) {
	          const attName = this.roll20.getAttrByName(charId, `${traitPre}_name`);
	          this.logger.debug(`Recharging '${attName}'`);
	          traitNames.push(attName);
	          const max = this.roll20.getAttrByName(charId, `${traitPre}_uses`, 'max');
	          if (max === undefined) {
	            this.logger.error(`Tried to recharge the trait '${attName}' for character with id ${charId}, ` +
	              'but there were no uses defined.');
	          }
	          else {
	            this.roll20.setAttrByName(charId, `${traitPre}_uses`, max);
	          }
	        }
	      });

	    return traitNames;
	  }

	  /**
	   * Resets the HP of the specified character to its maximum value
	   * @param {string} charId - the Roll20 character ID
	   * @returns {int} - the number of HP that were healed
	   */
	  resetHP(charId) {
	    this.logger.debug('Resetting HP to max');
	    const max = parseInt(this.roll20.getAttrByName(charId, 'HP', 'max'), 10);
	    const current = parseInt(this.roll20.getAttrByName(charId, 'HP', 'current'), 10);

	    this.roll20.setAttrByName(charId, 'HP', max);

	    return max - current;
	  }

	  /**
	   * Adds Hit die to the specified character based on PHB rules
	   * @param {string} charId - the Roll20 character ID
	   * @returns {Array} - Array of objects each representing a die type and the number regained
	   */
	  regainHitDie(charId) {
	    const hitDieRegained = [];
	    this.logger.debug('Regaining Hit Die');
	    _.chain(this.roll20.findObjs({ type: 'attribute', characterid: charId }))
	      .filter(attribute => (attribute.get('name').match(/^hd_d\d{1,2}$/)))
	      .uniq()
	      .each(hdAttr => {
	        const max = parseInt(hdAttr.get('max'), 10);
	        if (max > 0) {
	          const oldCurrent = parseInt(hdAttr.get('current'), 10);
	          let newCurrent = oldCurrent;
	          let regained = max === 1 ? 1 : Math.floor(max / 2);
	          if (this.myState.config.variants.rests.longNoHpFullHd) {
	            regained = max - oldCurrent;
	          }
	          newCurrent += regained;
	          newCurrent = newCurrent > max ? max : newCurrent;
	          this.roll20.setAttrByName(charId, hdAttr.get('name'), newCurrent);
	          hitDieRegained.push({
	            die: hdAttr.get('name').replace(/hd_/, ''),
	            quant: newCurrent - oldCurrent,
	          });
	        }
	      });

	    return hitDieRegained;
	  }

	  /**
	   * Resets all (non warlock) spell slots of the specified character to their maximum values
	   * @param {string} charId - the Roll20 character ID
	   * @returns {bool} - true if any spell slots were recharged; false otherwise
	   */
	  regainSpellSlots(charId) {
	    let slotsFound = false;

	    this.logger.debug('Regaining Spell Slots');
	    _.chain(this.roll20.findObjs({ type: 'attribute', characterid: charId }))
	      .filter(attribute => (attribute.get('name').match(/^spell_slots_l\d$/)))
	      .uniq()
	      .each(slotAttr => {
	        const max = parseInt(slotAttr.get('max'), 10);
	        if (max > 0) {
	          this.roll20.setAttrByName(charId, slotAttr.get('name'), max);
	          slotsFound = true;
	        }
	      });

	    return slotsFound;
	  }

	  /**
	   * Reduces the specified character's level of exhaustion by 1
	   * @param {string} charId - the Roll20 character ID
	   * @returns {bool} - true if a level of exhaustion was reduced; false otherwise
	   */
	  reduceExhaustion(charId) {
	    this.logger.debug('Reducing Exhaustion');
	    const currentLevel = parseInt(this.roll20.getAttrByName(charId, 'exhaustion_level'), 10);

	    if (currentLevel > 0) {
	      this.roll20.setAttrByName(charId, 'exhaustion_level', currentLevel - 1);
	      return true;
	    }

	    return false;
	  }
	}

	module.exports = RestManager;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);

	class TraitManager {

	  constructor(logger, roll20, reporter) {
	    this.logger = logger;
	    this.roll20 = roll20;
	    this.reporter = reporter;
	  }

	  /**
	   * Handles the click event of a trait when 'autoTraits' is true
	   * Consumes one use of the clicked trait
	   * @param {object} options - The message options
	   */
	  handleTraitClick(options) {
	    const traitId = _.chain(this.roll20.findObjs({ type: 'attribute', characterid: options.character.id }))
	      .map(attribute => (attribute.get('name').match(/^repeating_trait_([^_]+)_name$/) || [])[1])
	      .reject(_.isUndefined)
	      .uniq()
	      .find(attId => this.roll20.getAttrByName(options.character.id, `repeating_trait_${attId}_name`) === options.title)
	      .value();

	    const usesAttr = this.roll20.getAttrObjectByName(options.character.id, `repeating_trait_${traitId}_uses`);
	    if (usesAttr) {
	      if (usesAttr.get('current') > 0) {
	        usesAttr.set('current', parseInt(usesAttr.get('current'), 10) - 1);
	      }
	      else {
	        this.reporter.report('Trait Police', `${options.characterName} can't use ${options.title} because ` +
	          'they don\'t have any uses left.');
	      }
	    }
	  }
	}

	module.exports = TraitManager;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);
	const utils = __webpack_require__(7);

	class ConfigUi {

	  ////////////
	  // Menus
	  ////////////
	  getConfigOptionsMenu() {
	    const optionRows = this.makeOptionRow('Advantage Tracker', 'atMenu', '', 'view', '', '#02baf2') +
	      this.makeOptionRow('Token Defaults', 'tsMenu', '', 'view', '', '#02baf2') +
	      this.makeOptionRow('New Characters', 'ncMenu', '', 'view', '', '#02baf2') +
	      this.makeOptionRow('Character Sheet Enhancements', 'seMenu', '', 'view', '', '#02baf2') +
	      this.makeOptionRow('Houserules & Variants', 'varsMenu', '', 'view', '', '#02baf2');

	    const th = utils.buildHTML('th', 'Main Menu', { colspan: '2' });
	    const tr = utils.buildHTML('tr', th, { style: 'margin-top: 5px;' });

	    return utils.buildHTML('table', tr + optionRows, { style: 'width: 100%; font-size: 0.9em;' });
	  }

	  getConfigOptionGroupAdvTracker(config, optionsSpec) {
	    const ats = 'advTrackerSettings';
	    const optionRows =
	      this.makeQuerySetting(config, `${ats}.output`, 'Output', optionsSpec.advTrackerSettings.output()) +
	      this.makeToggleSetting(config, `${ats}.showMarkers`, 'Show Markers') +
	      this.makeToggleSetting(config, `${ats}.ignoreNpcs`, 'Ignore NPCs') +
	      this.makeQuerySetting(config, `${ats}.advantageMarker`, 'Advantage Marker',
	        optionsSpec.advTrackerSettings.advantageMarker()) +
	      this.makeQuerySetting(config, `${ats}.disadvantageMarker`, 'Disadvantage Marker',
	        optionsSpec.advTrackerSettings.disadvantageMarker());

	    const th = utils.buildHTML('th', 'Advantage Tracker Options', { colspan: '2' });
	    const tr = utils.buildHTML('tr', th, { style: 'margin-top: 5px;' });
	    const table = utils.buildHTML('table', tr + optionRows, { style: 'width: 100%; font-size: 0.9em;' });

	    return table + this.backToMainMenuButton();
	  }

	  getConfigOptionGroupTokens(config) {
	    const auraButtonWidth = 60;
	    const ts = 'tokenSettings';

	    let retVal = '<table style="width: 100%; font-size: 0.9em;">' +
	      '<tr style="margin-top: 5px;"><th colspan=2>Token Options</th></tr>';

	    retVal +=
	      this.makeToggleSetting(config, `${ts}.number`, 'Numbered Tokens') +
	      this.makeToggleSetting(config, `${ts}.showName`, 'Show Name Tag') +
	      this.makeToggleSetting(config, `${ts}.showNameToPlayers`, 'Show Name to Players');

	    for (let i = 1; i <= 3; i++) {
	      retVal += this.makeInputSetting(config, `${ts}.bar${i}.attribute`, `Bar ${i} Attribute`,
	        `Bar ${i} Attribute (empty to unset)`);
	      retVal += this.makeToggleSetting(config, `${ts}.bar${i}.max`, `Bar ${i} Set Max`);
	      retVal += this.makeToggleSetting(config, `${ts}.bar${i}.link`, `Bar ${i} Link`);
	      retVal += this.makeToggleSetting(config, `${ts}.bar${i}.showPlayers`, `Bar ${i} Show Players`);
	    }

	    // Build out the aura grids
	    for (let i = 1; i <= 2; i++) {
	      const currRad = utils.getObjectFromPath(config, `${ts}.aura${i}.radius`);
	      const currRadEmptyHint = currRad || '[not set]';
	      const currColor = utils.getObjectFromPath(config, `${ts}.aura${i}.color`);
	      const currSquare = utils.getObjectFromPath(config, `${ts}.aura${i}.square`);

	      const radBtn = this.makeOptionButton(`${ts}.aura${i}.radius`, `?{Aura ${i} Radius (empty to unset)|${currRad}}`,
	        this.makeText(currRadEmptyHint), 'click to edit', currRadEmptyHint === '[not set]' ? '#f84545' : '#02baf2',
	        undefined, auraButtonWidth);
	      const colorBtn = this.makeOptionButton(`tokenSettings.aura${i}.color`,
	        `?{Aura ${i} Color (hex colors)|${currColor}}`,
	        this.makeText(currColor), 'click to edit', currColor, utils.getContrastYIQ(currColor), auraButtonWidth);
	      const squareBtn = this.makeOptionButton(`tokenSettings.aura${i}.square`, !currSquare,
	        this.makeBoolText(currSquare), 'click to toggle', currSquare ? '#65c4bd' : '#f84545',
	        undefined, auraButtonWidth);

	      retVal += utils
	        .buildHTML('tr', [
	          {
	            tag: 'td',
	            innerHtml: [
	              {
	                tag: 'table',
	                innerHtml: [
	                  {
	                    tag: 'tr',
	                    innerHtml: [{ tag: 'th', innerHtml: `Aura${i}`, attrs: { colspan: 3 } }],
	                  },
	                  {
	                    tag: 'tr',
	                    innerHtml: [
	                      {
	                        tag: 'td',
	                        innerHtml: 'Range',
	                      },
	                      {
	                        tag: 'td',
	                        innerHtml: 'Color',
	                      },
	                      {
	                        tag: 'td',
	                        innerHtml: 'Square',
	                      },
	                    ],
	                  },
	                  {
	                    tag: 'tr',
	                    innerHtml: [
	                      {
	                        tag: 'td',
	                        innerHtml: radBtn,
	                      },
	                      {
	                        tag: 'td',
	                        innerHtml: colorBtn,
	                      },
	                      {
	                        tag: 'td',
	                        innerHtml: squareBtn,
	                      },
	                    ],
	                  },
	                ],
	                attrs: { style: 'width: 100%; text-align: center;' },
	              },
	            ], attrs: { colspan: '2' },
	          },
	        ], { style: 'border: 1px solid gray;' });
	    }

	    // Vision\Light options
	    retVal += this.makeInputSetting(config, `${ts}.light.radius`, 'Light Radius', 'Light Radius (empty to unset)');
	    retVal += this.makeInputSetting(config, `${ts}.light.dimRadius`, 'Dim Radius', 'Light Dim Radius (empty to unset)');
	    retVal += this.makeToggleSetting(config, `${ts}.light.otherPlayers`, 'Show other players');
	    retVal += this.makeToggleSetting(config, `${ts}.light.hasSight`, 'Has Sight');
	    retVal += this.makeInputSetting(config, `${ts}.light.angle`, 'Light Angle', 'Light Amgle');
	    retVal += this.makeInputSetting(config, `${ts}.light.losAngle`, 'LOS Angle', 'LOS Angle');
	    retVal += this.makeInputSetting(config, `${ts}.light.multiplier`, 'Light Muliplier', 'Light Muliplier');

	    retVal += `</table>${this.backToMainMenuButton()}`;

	    return retVal;
	  }

	  getConfigOptionGroupNewCharSettings(config, optionsSpec) {
	    const ncs = 'newCharSettings';

	    const optionRows = this.makeQuerySetting(config, `${ncs}.sheetOutput`, 'Sheet Output',
	        optionsSpec.newCharSettings.sheetOutput()) +
	      this.makeQuerySetting(config, `${ncs}.deathSaveOutput`,
	        'Death Save Output', optionsSpec.newCharSettings.deathSaveOutput()) +
	      this.makeQuerySetting(config, `${ncs}.initiativeOutput`, 'Initiative Output',
	        optionsSpec.newCharSettings.initiativeOutput()) +
	      this.makeToggleSetting(config, `${ncs}.showNameOnRollTemplate`, 'Show Name on Roll Template',
	        optionsSpec.newCharSettings.showNameOnRollTemplate()) +
	      this.makeQuerySetting(config, `${ncs}.rollOptions`, 'Roll Options',
	        optionsSpec.newCharSettings.rollOptions()) +
	      this.makeToggleSetting(config, `${ncs}.autoRevertAdvantage`, 'Revert Advantage') +
	      this.makeQuerySetting(config, `${ncs}.initiativeRoll`, 'Init Roll',
	        optionsSpec.newCharSettings.initiativeRoll()) +
	      this.makeToggleSetting(config, `${ncs}.initiativeToTracker`, 'Init To Tracker',
	        optionsSpec.newCharSettings.initiativeToTracker()) +
	      this.makeToggleSetting(config, `${ncs}.breakInitiativeTies`, 'Break Init Ties',
	        optionsSpec.newCharSettings.breakInitiativeTies()) +
	      this.makeToggleSetting(config, `${ncs}.showTargetAC`, 'Show Target AC',
	        optionsSpec.newCharSettings.showTargetAC()) +
	      this.makeToggleSetting(config, `${ncs}.showTargetName`, 'Show Target Name',
	        optionsSpec.newCharSettings.showTargetName()) +
	      this.makeToggleSetting(config, `${ncs}.autoAmmo`, 'Auto Use Ammo',
	        optionsSpec.newCharSettings.autoAmmo()) +
	      this.makeQuerySetting(config, `${ncs}.tab`, 'Default tab',
	        optionsSpec.newCharSettings.tab()) +
	      this.makeOptionRow('Houserule Settings', 'hrMenu', '', 'view', '', '#02baf2');

	    const th = utils.buildHTML('th', 'New Character Sheets', { colspan: '2' });
	    const tr = utils.buildHTML('tr', th, { style: 'margin-top: 5px;' });
	    const table = utils.buildHTML('table', tr + optionRows, { style: 'width: 100%; font-size: 0.9em;' });

	    return table + this.backToMainMenuButton();
	  }

	  getConfigOptionsGroupNewCharHouserules(config, optionsSpec) {
	    const hr = 'newCharSettings.houserules';

	    const optionRows = this.makeToggleSetting(config, `${hr}.savingThrowsHalfProf`, 'Half Proficiency Saves') +
	      this.makeQuerySetting(config, `${hr}.mediumArmorMaxDex`, 'Medium Armor Max Dex',
	        optionsSpec.newCharSettings.houserules.mediumArmorMaxDex());

	    const th = utils.buildHTML('th', 'Houserule Settings', { colspan: '2' });
	    const tr = utils.buildHTML('tr', th, { style: 'margin-top: 5px;' });
	    const table = utils.buildHTML('table', tr + optionRows, { style: 'width: 100%; font-size: 0.9em;' });

	    return table + this.backToMainMenuButton();
	  }

	  getConfigOptionGroupVariants(config) {
	    const root = 'variants';

	    const optionRows = this.makeToggleSetting(config, `${root}.rests.longNoHpFullHd`, 'Long Rest: No HP, full HD');

	    const th = utils.buildHTML('th', 'Houserules & Variants', { colspan: '2' });
	    const tr = utils.buildHTML('tr', th, { style: 'margin-top: 5px;' });
	    const table = utils.buildHTML('table', tr + optionRows, { style: 'width: 100%; font-size: 0.9em;' });

	    return table + this.backToMainMenuButton();
	  }

	  getConfigOptionGroupSheetEnhancements(config) {
	    const root = 'sheetEnhancements';
	    const optionRows = this.makeToggleSetting(config, `${root}.rollHPOnDrop`, 'Roll HP On Drop') +
	      this.makeToggleSetting(config, `${root}.autoHD`, 'Process HD Automatically') +
	      this.makeToggleSetting(config, `${root}.autoSpellSlots`, 'Process Spell Slots Automatically') +
	      this.makeToggleSetting(config, `${root}.autoTraits`, 'Process Traits automatically');

	    const th = utils.buildHTML('th', 'New Character Sheets', { colspan: '2' });
	    const tr = utils.buildHTML('tr', th, { style: 'margin-top: 5px;' });
	    const table = utils.buildHTML('table', tr + optionRows, { style: 'width: 100%; font-size: 0.9em;' });
	    return table + this.backToMainMenuButton();
	  }

	  backToMainMenuButton() {
	    return utils.buildHTML('a', 'back to main menu', {
	      href: '!shaped-config',
	      style: 'text-align: center; margin: 5px 0 0 0; padding: 2px 2px ; border-radius: 10px; white-space: nowrap; ' +
	      'overflow: hidden; text-overflow: ellipsis; background-color: #02baf2; border-color: #c0c0c0;',
	    });
	  }

	  makeInputSetting(config, path, title, prompt) {
	    const currentVal = utils.getObjectFromPath(config, path);
	    let emptyHint = '[not set]';
	    if (currentVal) {
	      emptyHint = currentVal;
	    }

	    return this.makeOptionRow(title, path, `?{${prompt}|${currentVal}}`, emptyHint, 'click to edit', emptyHint ===
	    '[not set]' ? '#f84545' : '#02baf2');
	  }

	  // noinspection JSUnusedGlobalSymbols
	  makeColorSetting(config, path, title, prompt) {
	    const currentVal = utils.getObjectFromPath(config, path);
	    let emptyHint = '[not set]';

	    if (currentVal) {
	      emptyHint = currentVal;
	    }

	    const buttonColor = emptyHint === '[not set]' ? '#02baf2' : currentVal;

	    return this.makeOptionRow(title, path, `?{${prompt}|${currentVal}}`, emptyHint, 'click to edit', buttonColor,
	      utils.getContrastYIQ(buttonColor));
	  }

	  makeToggleSetting(config, path, title, optionsSpec) {
	    let currentVal = utils.getObjectFromPath(config, path);
	    if (optionsSpec) {
	      currentVal = _.invert(optionsSpec)[currentVal] === 'true';
	    }

	    return this.makeOptionRow(title, path, !currentVal,
	      this.makeBoolText(currentVal), 'click to toggle', currentVal ? '#65c4bd' : '#f84545');
	  }

	  makeQuerySetting(config, path, title, optionsSpec) {
	    let currentVal = _.invert(optionsSpec)[utils.getObjectFromPath(config, path)];
	    const optionList = _.keys(optionsSpec);

	    // Fix up if we've somehow ended up with an illegal value
	    if (_.isUndefined(currentVal)) {
	      currentVal = _.first(optionList);
	      utils.deepExtend(config, utils.createObjectFromPath(path, optionsSpec[currentVal]));
	    }

	    // move the current option to the front of the list
	    optionList.splice(optionList.indexOf(currentVal), 1);
	    optionList.unshift(currentVal);

	    return this.makeOptionRow(title, path, `?{${title}|${optionList.join('|')}}`, this.makeText(currentVal),
	      'click to change', '#02baf2');
	  }

	  makeOptionRow(optionTitle, path, command, linkText, tooltip, buttonColor, buttonTextColor) {
	    const col1 = utils.buildHTML('td', optionTitle);
	    const col2 = utils.buildHTML('td', this.makeOptionButton(path, command, linkText, tooltip, buttonColor,
	      buttonTextColor), { style: 'text-align:right;' });

	    return utils.buildHTML('tr', col1 + col2, { style: 'border: 1px solid gray;' });
	  }

	  makeOptionButton(path, command, linkText, tooltip, buttonColor, buttonTextColor, width) {
	    if (_.isUndefined(width)) {
	      width = 80;
	    }

	    let css = `text-align: center; width: ${width}px; margin: 5px 0 0 0; ` +
	      'padding: 2px 2px ; border-radius: 10px; border-color: #c0c0c0;' +
	      `white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background-color: ${buttonColor};`;
	    if (buttonTextColor) {
	      css += `color: ${buttonTextColor}`; // 'color: ' + buttonTextColor + '; ';
	    }

	    return utils.buildHTML('a', linkText, {
	      style: css,
	      href: `!shaped-config --${path} ${command}`, // '!shaped-config --' + path + ' ' + command
	    });
	  }

	  makeText(value) {
	    return utils.buildHTML('span', value, { style: 'padding: 0 2px;' });
	  }

	  makeBoolText(value) {
	    return value === true ?
	      utils.buildHTML('span', 'on', { style: 'padding: 0 2px;' }) :
	      utils.buildHTML('span', 'off', { style: 'padding: 0 2px;' });
	  }

	  static validStatusMarkers() {
	    const markers = [
	      'red', 'blue', 'green', 'brown', 'purple', 'pink', 'yellow', 'dead', 'skull', 'sleepy',
	      'half-heart', 'half-haze', 'interdiction', 'snail', 'lightning-helix', 'spanner', 'chained-heart',
	      'chemical-bolt', 'death-zone', 'drink-me', 'edge-crack', 'ninja-mask', 'stopwatch', 'fishing-net', 'overdrive',
	      'strong', 'fist', 'padlock', 'three-leaves', 'fluffy-wing', 'pummeled', 'tread', 'arrowed', 'aura',
	      'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'cobweb', 'broken-shield',
	      'flying-flag', 'radioactive', 'trophy', 'broken-skull', 'frozen-orb', 'rolling-bomb', 'white-tower',
	      'grab', 'screaming', 'grenade', 'sentry-gun', 'all-for-one', 'angel-outfit', 'archery-target',
	    ];

	    const obj = {};
	    for (let i = 0; i < markers.length; i++) {
	      obj[markers[i]] = markers[i];
	    }

	    return obj;
	  }
	}

	module.exports = ConfigUi;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);
	const utils = __webpack_require__(7);

	const oneSixConfig = {
	  logLevel: 'INFO',
	  tokenSettings: {
	    number: false,
	    bar1: {
	      attribute: 'HP',
	      max: true,
	      link: false,
	      showPlayers: false,
	    },
	    bar2: {
	      attribute: 'speed',
	      max: false,
	      link: true,
	      showPlayers: false,
	    },
	    bar3: {
	      attribute: '',
	      max: false,
	      link: false,
	      showPlayers: false,
	    },
	    aura1: {
	      radius: '',
	      color: '#FFFF99',
	      square: false,
	    },
	    aura2: {
	      radius: '',
	      color: '#59e594',
	      square: false,
	    },
	    light: {
	      radius: '',
	      dimRadius: '',
	      otherPlayers: false,
	      hasSight: false,
	      angle: 360,
	      losAngle: 360,
	      multiplier: 1,
	    },
	    showName: true,
	    showNameToPlayers: false,
	    showAura1ToPlayers: true,
	    showAura2ToPlayers: true,
	  },
	  newCharSettings: {
	    sheetOutput: '@{output_to_all}',
	    deathSaveOutput: '@{output_to_all}',
	    initiativeOutput: '@{output_to_all}',
	    showNameOnRollTemplate: '@{show_character_name_yes}',
	    rollOptions: '@{normal}',
	    initiativeRoll: '@{normal_initiative}',
	    initiativeToTracker: '@{initiative_to_tracker_yes}',
	    breakInitiativeTies: '@{initiative_tie_breaker_var}',
	    showTargetAC: '@{attacks_vs_target_ac_no}',
	    showTargetName: '@{attacks_vs_target_name_no}',
	    autoAmmo: '@{ammo_auto_use_var}',
	    autoRevertAdvantage: false,
	    houserules: {
	      savingThrowsHalfProf: false,
	      mediumArmorMaxDex: 2,
	    },
	  },
	  advTrackerSettings: {
	    showMarkers: false,
	    ignoreNpcs: false,
	    advantageMarker: 'green',
	    disadvantageMarker: 'red',
	    output: 'public',
	  },
	  sheetEnhancements: {
	    rollHPOnDrop: true,
	    autoHD: true,
	    autoSpellSlots: true,
	  },
	  genderPronouns: [
	    {
	      matchPattern: '^f$|female|girl|woman|feminine',
	      nominative: 'she',
	      accusative: 'her',
	      possessive: 'her',
	      reflexive: 'herself',
	    },
	    {
	      matchPattern: '^m$|male|boy|man|masculine',
	      nominative: 'he',
	      accusative: 'him',
	      possessive: 'his',
	      reflexive: 'himself',
	    },
	    {
	      matchPattern: '^n$|neuter|none|construct|thing|object',
	      nominative: 'it',
	      accusative: 'it',
	      possessive: 'its',
	      reflexive: 'itself',
	    },
	  ],
	  defaultGenderIndex: 2,

	};


	class Migrator {

	  constructor(startVersion) {
	    this._versions = [{ version: startVersion || 0.1, migrations: [] }];
	  }

	  skipToVersion(version) {
	    this._versions.push({ version, migrations: [] });
	    return this;
	  }

	  nextVersion() {
	    const currentVersion = this._versions.slice(-1)[0].version;
	    const nextVersion = (currentVersion * 10 + 1) / 10; // Avoid FP errors
	    this._versions.push({ version: nextVersion, migrations: [] });
	    return this;
	  }

	  addProperty(path, value) {
	    const expandedProperty = utils.createObjectFromPath(path, value);
	    return this.transformConfig((config) => utils.deepExtend(config, expandedProperty),
	      `Adding property ${path} with value ${value}`);
	  }

	  overwriteProperty(path, value) {
	    return this.transformConfig((config) => {
	      const parts = path.split('.');
	      const obj = parts.length > 1 ? utils.getObjectFromPath(config, parts.slice(0, -1).join('.')) : config;
	      obj[parts.slice(-1)[0]] = value;
	      return config;
	    }, `Overwriting property ${path} with value ${JSON.stringify(value)}`);
	  }

	  copyProperty(oldPath, newPath) {
	    return this.transformConfig(Migrator.propertyCopy.bind(null, oldPath, newPath),
	      `Copying property from ${oldPath} to ${newPath}`);
	  }


	  static propertyCopy(oldPath, newPath, config) {
	    const oldVal = utils.getObjectFromPath(config, oldPath);
	    if (!_.isUndefined(oldVal)) {
	      const expandedProperty = utils.createObjectFromPath(newPath, oldVal);
	      utils.deepExtend(config, expandedProperty);
	    }
	    return config;
	  }

	  static propertyDelete(path, config) {
	    const parts = path.split('.');
	    const obj = parts.length > 1 ? utils.getObjectFromPath(config, parts.slice(0, -1).join('.')) : config;
	    if (obj && !_.isUndefined(obj[parts.slice(-1)[0]])) {
	      delete obj[parts.slice(-1)[0]];
	    }
	    return config;
	  }

	  deleteProperty(propertyPath) {
	    return this.transformConfig(Migrator.propertyDelete.bind(null, propertyPath),
	      `Deleting property ${propertyPath} from config`);
	  }

	  moveProperty(oldPath, newPath) {
	    return this.transformConfig((config) => {
	      config = Migrator.propertyCopy(oldPath, newPath, config);
	      return Migrator.propertyDelete(oldPath, config);
	    }, `Moving property from ${oldPath} to ${newPath}`);
	  }

	  transformConfig(transformer, message) {
	    const lastVersion = this._versions.slice(-1)[0];
	    lastVersion.migrations.push({ transformer, message });
	    return this;
	  }

	  migrateConfig(state, logger) {
	    logger.info('Checking config for upgrade, starting state: $$$', state);
	    if (_.isEmpty(state)) {
	      // working with a fresh install here
	      state.version = 0;
	    }
	    if (!this._versions.find(version => version.version >= state.version)) {
	      throw new Error(`Unrecognised schema state ${state.version} - cannot upgrade.`);
	    }

	    return this._versions
	      .filter(version => version.version > state.version)
	      .reduce((versionResult, version) => {
	        logger.info('Upgrading schema to version $$$', version.version);

	        versionResult = version.migrations.reduce((result, migration) => {
	          logger.info(migration.message);
	          return migration.transformer(result);
	        }, versionResult);
	        versionResult.version = version.version;
	        logger.info('Post-upgrade state: $$$', versionResult);
	        return versionResult;
	      }, state);
	  }
	}

	/*
	 FOR REFERENCE: CURRENT SCHEMA
	 {
	 logLevel: 'INFO',
	 tokenSettings: {
	 number: false,
	 bar1: {
	 attribute: 'HP',
	 max: true,
	 link: false,
	 showPlayers: false,
	 },
	 bar2: {
	 attribute: 'speed',
	 max: false,
	 link: true,
	 showPlayers: false,
	 },
	 bar3: {
	 attribute: '',
	 max: false,
	 link: false,
	 showPlayers: false,
	 },
	 aura1: {
	 radius: '',
	 color: '#FFFF99',
	 square: false,
	 },
	 aura2: {
	 radius: '',
	 color: '#59e594',
	 square: false,
	 },
	 light: {
	 otherPlayers: false,
	 hasSight: true,
	 angle: 360,
	 losAngle: 360,
	 multiplier: 1,
	 },
	 showName: true,
	 showNameToPlayers: false,
	 showAura1ToPlayers: true,
	 showAura2ToPlayers: true,
	 },
	 newCharSettings: {
	 sheetOutput: '@{output_to_all}',
	 deathSaveOutput: '@{output_to_all}',
	 initiativeOutput: '@{output_to_all}',
	 showNameOnRollTemplate: '@{show_character_name_yes}',
	 rollOptions: '@{normal}',
	 initiativeRoll: '@{normal_initiative}',
	 initiativeToTracker: '@{initiative_to_tracker_yes}',
	 breakInitiativeTies: '@{initiative_tie_breaker_var}',
	 showTargetAC: '@{attacks_vs_target_ac_no}',
	 showTargetName: '@{attacks_vs_target_name_no}',
	 autoAmmo: '@{ammo_auto_use_var}',
	 autoRevertAdvantage: false,
	 houserules: {
	 savingThrowsHalfProf: false,
	 mediumArmorMaxDex: 2,
	 },
	 tab: 'core',
	 },
	 advTrackerSettings: {
	 showMarkers: false,
	 ignoreNpcs: false,
	 advantageMarker: 'green',
	 disadvantageMarker: 'red',
	 output: 'public',
	 },
	 sheetEnhancements: {
	 rollHPOnDrop: true,
	 autoHD: true,
	 autoSpellSlots: true,
	 autoTraits: true,
	 },
	 genderPronouns: [
	 {
	 matchPattern: '^f$|female|girl|woman|feminine',
	 nominative: 'she',
	 accusative: 'her',
	 possessive: 'her',
	 reflexive: 'herself',
	 },
	 {
	 matchPattern: '^m$|male|boy|man|masculine',
	 nominative: 'he',
	 accusative: 'him',
	 possessive: 'his',
	 reflexive: 'himself',
	 },
	 {
	 matchPattern: '^n$|neuter|none|construct|thing|object',
	 nominative: 'it',
	 accusative: 'it',
	 possessive: 'its',
	 reflexive: 'itself',
	 },
	 ],
	 defaultGenderIndex: 2,
	 variants: {
	 rests: {
	 longNoHpFullHd: false,
	 },
	 },
	 };
	 */

	const migrator = new Migrator()
	  .addProperty('config', {})
	  .skipToVersion(0.4)
	  .overwriteProperty('config.genderPronouns', utils.deepClone(oneSixConfig).genderPronouns)
	  .skipToVersion(1.2)
	  .moveProperty('config.autoHD', 'config.sheetEnhancements.autoHD')
	  .moveProperty('config.rollHPOnDrop', 'config.sheetEnhancements.rollHPOnDrop')
	  .skipToVersion(1.4)
	  .moveProperty('config.newCharSettings.savingThrowsHalfProf', 'config.newCharSettings.houserules.savingThrowsHalfProf')
	  .moveProperty('config.newCharSettings.mediumArmorMaxDex', 'config.newCharSettings.houserules.mediumArmorMaxDex')
	  .skipToVersion(1.6)
	  .transformConfig(state => {
	    _.defaults(state.config, oneSixConfig);
	    _.defaults(state.config.tokenSettings, oneSixConfig.tokenSettings);
	    _.defaults(state.config.newCharSettings, oneSixConfig.newCharSettings);
	    _.defaults(state.config.advTrackerSettings, oneSixConfig.advTrackerSettings);
	    _.defaults(state.config.sheetEnhancements, oneSixConfig.sheetEnhancements);
	    return state;
	  }, 'Applying defaults as at schema version 1.6')
	  // 1.7
	  // add base houserules and variants section
	  // add sheetEnhancements.autoTraits
	  .nextVersion()
	  .addProperty('config.variants', {
	    rests: {
	      longNoHpFullHd: false,
	    },
	  })
	  .addProperty('config.sheetEnhancements.autoTraits', true)
	  // 1.8
	  // Set tokens to have vision by default so that people see the auto-generated stuff based on senses
	  .nextVersion()
	  .overwriteProperty('config.tokenSettings.light.hasSight', true)
	  // 1.9 Add default tab setting
	  .nextVersion()
	  .addProperty('config.newCharSettings.tab', 'core');

	Migrator.migrateShapedConfig = migrator.migrateConfig.bind(migrator);

	module.exports = Migrator;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);

	function getRenameMapper(newName) {
	  return function renameMapper(key, value, output) {
	    output[newName] = value;
	  };
	}

	function identityMapper(key, value, output) {
	  output[key] = value;
	}

	function booleanMapper(key, value, output) {
	  if (value) {
	    output[key] = 'Yes';
	  }
	}
	function camelCaseFixMapper(key, value, output) {
	  const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
	  output[newKey] = value;
	}
	function castingStatMapper(key, value, output) {
	  if (value) {
	    output.add_casting_modifier = 'Yes';
	  }
	}
	function componentMapper(key, value, output) {
	  output.components = _.chain(value)
	    .map((propValue, propName) => {
	      if (propName !== 'materialMaterial') {
	        return propName.toUpperCase().slice(0, 1);
	      }

	      output.materials = propValue;
	      return null;
	    })
	    .compact()
	    .value()
	    .join(' ');
	}
	const saveAttackMappings = {
	  ability: getRenameMapper('saving_throw_vs_ability'),
	  type: identityMapper,
	  damage: identityMapper,
	  damageBonus: camelCaseFixMapper,
	  damageType: camelCaseFixMapper,
	  saveSuccess: getRenameMapper('saving_throw_success'),
	  saveFailure: getRenameMapper('saving_throw_failure'),
	  higherLevelDice: camelCaseFixMapper,
	  higherLevelDie: camelCaseFixMapper,
	  secondaryDamage: getRenameMapper('second_damage'),
	  secondaryDamageBonus: getRenameMapper('second_damage_bonus'),
	  secondaryDamageType: getRenameMapper('second_damage_type'),
	  higherLevelSecondaryDice: getRenameMapper('second_higher_level_dice'),
	  higherLevelSecondaryDie: getRenameMapper('second_higher_level_die'),
	  condition: getRenameMapper('saving_throw_condition'),
	  castingStat: castingStatMapper,
	};

	function getObjectMapper(mappings) {
	  return function objectMapper(key, value, output) {
	    _.each(value, (propVal, propName) => {
	      const mapper = mappings[propName];
	      if (!mapper) {
	        throw new Error('Unrecognised property when attempting to convert to srd format: ' +
	          `[${propName}] ${JSON.stringify(output)}`);
	      }
	      mapper(propName, propVal, output);
	    });
	  };
	}

	const spellMapper = getObjectMapper({
	  name: identityMapper,
	  duration: identityMapper,
	  level: getRenameMapper('spell_level'),
	  school: identityMapper,
	  emote: identityMapper,
	  range: identityMapper,
	  castingTime: camelCaseFixMapper,
	  target: identityMapper,
	  description(key, value, output) {
	    output.content = value + (output.content ? `\n${output.content}` : '');
	  },
	  higherLevel(key, value, output) {
	    output.content = output.content ? `${output.content}\n` : '';
	    output.content += value;
	  },
	  ritual: booleanMapper,
	  concentration: booleanMapper,
	  save: getObjectMapper(saveAttackMappings),
	  attack: getObjectMapper(saveAttackMappings),
	  damage: getObjectMapper(saveAttackMappings),
	  heal: getObjectMapper({
	    amount: getRenameMapper('heal'),
	    castingStat: castingStatMapper,
	    higherLevelDice: camelCaseFixMapper,
	    higherLevelDie: camelCaseFixMapper,
	    higherLevelAmount: getRenameMapper('higher_level_heal'),
	    bonus: getRenameMapper('heal_bonus'),
	  }),
	  components: componentMapper,
	  prepared(key, value, output) {
	    if (value) {
	      output.is_prepared = 'on';
	    }
	  },
	  classes: _.noop,
	  aoe: _.noop,
	  source: _.noop,
	  effects: _.noop,
	  domains: _.noop,
	  oaths: _.noop,
	  circles: _.noop,
	  patrons: _.noop,
	});


	const monsterMapper = getObjectMapper({
	  name: getRenameMapper('character_name'),
	  size: identityMapper,
	  type: identityMapper,
	  alignment: identityMapper,
	  AC: getRenameMapper('ac_srd'),
	  HP: getRenameMapper('hp_srd'),
	  speed: getRenameMapper('npc_speed'),
	  strength: identityMapper,
	  dexterity: identityMapper,
	  constitution: identityMapper,
	  intelligence: identityMapper,
	  wisdom: identityMapper,
	  charisma: identityMapper,
	  skills: getRenameMapper('skills_srd'),
	  spells(key, value, output) {
	    const splitSpells = _.partition(value, _.isObject);
	    if (!_.isEmpty(splitSpells[1])) {
	      output.spells_srd = splitSpells[1].join(', ');
	    }
	    if (!_.isEmpty(splitSpells[0])) {
	      output.spells = splitSpells[0];
	      _.each(output.spells, spell => (spell.prepared = true));
	    }
	  },
	  savingThrows: getRenameMapper('saving_throws_srd'),
	  damageResistances: getRenameMapper('damage_resistances'),
	  damageImmunities: getRenameMapper('damage_immunities'),
	  conditionImmunities: getRenameMapper('condition_immunities'),
	  damageVulnerabilities: getRenameMapper('damage_vulnerabilities'),
	  senses: identityMapper,
	  languages: identityMapper,
	  challenge: identityMapper,
	  traits: identityMapper,
	  actions: identityMapper,
	  reactions: identityMapper,
	  regionalEffects: identityMapper,
	  regionalEffectsFade: identityMapper,
	  legendaryPoints: identityMapper,
	  legendaryActions: identityMapper,
	  lairActions: identityMapper,
	});

	const pronounTokens = {
	  '{{GENDER_PRONOUN_HE_SHE}}': 'nominative',
	  '{{GENDER_PRONOUN_HIM_HER}}': 'accusative',
	  '{{GENDER_PRONOUN_HIS_HER}}': 'possessive',
	  '{{GENDER_PRONOUN_HIMSELF_HERSELF}}': 'reflexive',
	};


	module.exports = {

	  convertMonster(npcObject) {
	    const output = {};
	    monsterMapper(null, npcObject, output);

	    const actionTraitTemplate = _.template('**<%=data.name%>' +
	      '<% if(data.recharge) { print(" (" + data.recharge + ")") } %>**: <%=data.text%>', { variable: 'data' });
	    const legendaryTemplate = _.template('**<%=data.name%>' +
	      '<% if(data.cost && data.cost > 1){ print(" (Costs " + data.cost + " actions)") }%>**: <%=data.text%>',
	      { variable: 'data' });

	    function lairRegionalTemplate(item) {
	      return `**${item}`;
	    }

	    const simpleSectionTemplate = _.template('<%=data.title%>\n<% print(data.items.join("\\n")); %>',
	      { variable: 'data' });
	    const legendarySectionTemplate = _.template('<%=data.title%>\n' +
	      'The <%=data.name%> can take <%=data.legendaryPoints%> legendary actions, choosing from the options below. ' +
	      'It can take only one legendary action at a time and only at the end of another creature\'s turn. ' +
	      'The <%=data.name%> regains spent legendary actions at the start of its turn.\n' +
	      '<% print(data.items.join("\\n")) %>', { variable: 'data' });
	    const regionalSectionTemplate = _.template('<%=data.title%>\n<% print(data.items.join("\\n")); %>\n' +
	      '**<%=data.regionalEffectsFade%>', { variable: 'data' });

	    const srdContentSections = [
	      { prop: 'traits', itemTemplate: actionTraitTemplate, sectionTemplate: simpleSectionTemplate },
	      { prop: 'actions', itemTemplate: actionTraitTemplate, sectionTemplate: simpleSectionTemplate },
	      { prop: 'reactions', itemTemplate: actionTraitTemplate, sectionTemplate: simpleSectionTemplate },
	      { prop: 'legendaryActions', itemTemplate: legendaryTemplate, sectionTemplate: legendarySectionTemplate },
	      { prop: 'lairActions', itemTemplate: lairRegionalTemplate, sectionTemplate: simpleSectionTemplate },
	      { prop: 'regionalEffects', itemTemplate: lairRegionalTemplate, sectionTemplate: regionalSectionTemplate },
	    ];

	    function makeDataObject(propertyName, itemList) {
	      return {
	        title: propertyName.replace(/([A-Z])/g, ' $1').replace(/^[a-z]/, letter => letter.toUpperCase()),
	        name: output.character_name,
	        legendaryPoints: output.legendaryPoints,
	        regionalEffectsFade: output.regionalEffectsFade,
	        items: itemList,
	      };
	    }

	    output.is_npc = 1;
	    output.edit_mode = 'off';

	    output.content_srd = _.chain(srdContentSections)
	      .map(sectionSpec => {
	        const items = output[sectionSpec.prop];
	        delete output[sectionSpec.prop];
	        return _.map(items, sectionSpec.itemTemplate);
	      })
	      .map((sectionItems, sectionIndex) => {
	        const sectionSpec = srdContentSections[sectionIndex];
	        if (!_.isEmpty(sectionItems)) {
	          return sectionSpec.sectionTemplate(makeDataObject(sectionSpec.prop, sectionItems));
	        }

	        return null;
	      })
	      .compact()
	      .value()
	      .join('\n');

	    delete output.legendaryPoints;

	    return output;
	  },


	  convertSpells(spellObjects, pronounInfo) {
	    return _.map(spellObjects, spellObject => {
	      const converted = {};
	      spellMapper(null, spellObject, converted);
	      if (converted.emote) {
	        _.each(pronounTokens, (pronounType, token) => {
	          const replacement = pronounInfo[pronounType];
	          converted.emote = converted.emote.replace(new RegExp(token, 'g'), replacement);
	        });
	      }
	      return converted;
	    });
	  },
	};


/***/ },
/* 19 */
/***/ function(module, exports) {

	function sanitise(statblock, logger) {
	  'use strict';

	  logger.debug('Pre-sanitise: $$$', statblock);
	  statblock = statblock
	    .replace(/\s+([\.,;:])/g, '$1')
	    .replace(/\n+/g, '#')
	    .replace(/–/g, '-')
	    .replace(/−/g, '-') // Watch out: this and the line above containing funny unicode versions of '-'
	    .replace(/<br[^>]*>/g, '#')
	    .replace(/#+/g, '#')
	    .replace(/\s*#\s*/g, '#')
	    .replace(/(<([^>]+)>)/gi, '')
	    .replace(/legendary actions/gi, 'Legendary Actions')
	    .replace(/(\S)\sACTIONS/, '$1#ACTIONS')
	    .replace(/#(?=[a-z]|DC)/g, ' ')
	    .replace(/\s+/g, ' ')
	    .replace(/#Hit:/gi, 'Hit:')
	    .replace(/Hit:#/gi, 'Hit: ')
	    .replace(/#Each /gi, 'Each ')
	    .replace(/#On a successful save/gi, 'On a successful save')
	    .replace(/DC#(\d+)/g, 'DC $1')
	    .replace('LanguagesChallenge', 'Languages -\nChallenge')
	    .replace('\' Speed', 'Speed')
	    .replace(/(\w+) s([\s\.,])/g, '$1s$2')
	    .replace(/#Medium or/gi, ' Medium or')
	    .replace(/take#(\d+)/gi, 'take $1')
	    .replace(/#/g, '\n')
	    .replace(/&gt;/g, '>')
	    .replace(/&lt;/g, '<')
	    .replace(/&amp;/g, '&');

	  logger.debug('First stage cleaned statblock: $$$', statblock);

	  // Sometimes the texts ends up like 'P a r a l y z i n g T o u c h . M e l e e S p e l l A t t a c k : + 1 t o h i t
	  // In this case we can fix the title case stuff, because we can find the word boundaries. That will at least meaning
	  // that the core statblock parsing will work. If this happens inside the lowercase body text, however, there's nothing
	  // we can do about it because you need to understand the natural language to reinsert the word breaks properly.
	  statblock = statblock.replace(/([A-Z])(\s[a-z]){2,}/g, (match, p1) =>
	    p1 + match.slice(1).replace(/\s([a-z])/g, '$1')
	  );


	  // Conversely, sometimes words get mushed together. Again, we can only fix this for title case things, but that's
	  // better than nothing
	  statblock = statblock.replace(/([A-Z][a-z]+)(?=[A-Z])/g, '$1 ');

	  // This covers abilites that end up as 'C O N' or similar
	  statblock = statblock.replace(/^[A-Z]\s?[A-Z]\s?[A-Z](?=\s|$)/mg, match => match.replace(/\s/g, ''));

	  statblock = statblock.replace(/^[A-Z ]+$/m, match =>
	    match.replace(/([A-Z])([A-Z]+)(?=\s|$)/g, (innerMatch, p1, p2) => p1 + p2.toLowerCase())
	  );


	  statblock = statblock.replace(/(\d+)\s*?plus\s*?((?:\d+d\d+)|(?:\d+))/gi, '$2 + $1');
	  /* eslint-disable quote-props */
	  const replaceObj = {
	    'Jly': 'fly',
	    ',1\'': ',*',
	    'jday': '/day',
	    'abol eth': 'aboleth',
	    'ACT IONS': 'ACTIONS',
	    'Afrightened': 'A frightened',
	    'Alesser': 'A lesser',
	    'Athl etics': 'Athletics',
	    'blindn ess': 'blindness',
	    'blind sight': 'blindsight',
	    'bofh': 'both',
	    'brea stplate': 'breastplate',
	    'Can trips': 'Cantrips',
	    'choos in g': 'choosing',
	    'com muni cate': 'communicate',
	    'Constituti on': 'Constitution',
	    'creatu re': 'creature',
	    'darkvi sion': 'darkvision',
	    'dea ls': 'deals',
	    'di sease': 'disease',
	    'di stance': 'distance',
	    'fa lls': 'falls',
	    'fe et': 'feet',
	    'exha les': 'exhales',
	    'ex istence': 'existence',
	    'lfthe': 'If the',
	    'Ifthe': 'If the',
	    'ifthe': 'if the',
	    'lnt': 'Int',
	    'magica lly': 'magically',
	    'Med icine': 'Medicine',
	    'minlilte': 'minute',
	    'natura l': 'natural',
	    'ofeach': 'of each',
	    'ofthe': 'of the',
	    'on\'e': 'one',
	    'on ly': 'only',
	    '0n': 'on',
	    'pass ive': 'passive',
	    'Perce ption': 'Perception',
	    'radi us': 'radius',
	    'ra nge': 'range',
	    'rega ins': 'regains',
	    'rest.oration': 'restoration',
	    'savin g': 'saving',
	    'si lvery': 'silvery',
	    's lashing': 'slashing',
	    'slas hing': 'slashing',
	    'slash in g': 'slashing',
	    'slash ing': 'slashing',
	    'Spel/casting': 'Spellcasting',
	    'successfu l': 'successful',
	    'ta rget': 'target',
	    ' Th e ': ' The ',
	    't_urns': 'turns',
	    'unti l': 'until',
	    'withi n': 'within',
	    'tohit': 'to hit',
	    'At wi ll': 'At will',
	    'per-son': 'person',
	    'ab ility': 'ability',
	    'spe ll': 'spell',
	  };
	  /* eslint-enable quote-props */

	  const re = new RegExp(Object.keys(replaceObj).join('|'), 'g');
	  statblock = statblock.replace(re, (matched) => replaceObj[matched]);

	  statblock = statblock
	    .replace(/,\./gi, ',')
	    .replace(/:\./g, ':')
	    .replace(/(\W)l(\W)/g, '$11$2')
	    .replace(/\.([\w])/g, '. $1')
	    .replace(/1</g, '*')
	    .replace(/(\w)ii/g, '$1ll')
	    .replace(/([a-z\/])1/g, '$1l')
	    .replace(/([a-z])\/([a-z])/g, '$1l$2')
	    .replace(/(^| )l /gm, '$11 ')
	    .replace(/ft\s\./gi, 'ft.')
	    .replace(/ft\.\s,/gi, 'ft')
	    .replace(/ft\./gi, 'ft')
	    .replace(/(\d+) ft\/(\d+) ft/gi, '$1/$2 ft')
	    .replace(/lOd/g, '10d')
	    .replace(/dl0/gi, 'd10')
	    .replace(/dlO/gi, 'd10')
	    .replace(/dl2/gi, 'd12')
	    .replace(/S(\d+)d(\d+)/gi, '5$1d$2')
	    .replace(/l(\d+)d(\d+)/gi, '1$1d$2')
	    .replace(/ld(\d+)/gi, '1d$1')
	    .replace(/l(\d+)d\s+(\d+)/gi, '1$1d$2')
	    .replace(/(\d+)d\s+(\d+)/gi, '$1d$2')
	    .replace(/(\d+)\s+d(\d+)/gi, '$1d$2')
	    .replace(/(\d+)\s+d(\d+)/gi, '$1d$2')
	    .replace(/(\d+)d(\d)\s(\d)/gi, '$1d$2$3')
	    .replace(/(\d+)j(?:Day|day)/gi, '$1/Day')
	    .replace(/(\d+)f(?:Day|day)/gi, '$1/Day')
	    .replace(/(\d+)j(\d+)/gi, '$1/$2')
	    .replace(/(\d+)f(\d+)/gi, '$1/$2')
	    .replace(/{/gi, '(')
	    .replace(/}/gi, ')')
	    .replace(/(\d+)\((\d+) ft/gi, '$1/$2 ft')
	    .replace(/• /gi, '')
	    .replace(/’/gi, '\'');

	  logger.debug('Final stage cleaned statblock: $$$', statblock);
	  return statblock;
	}

	module.exports = sanitise;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(2);

	const levelStrings = ['Cantrips ', '1st level ', '2nd level ', '3rd level '];
	_.each(_.range(4, 10), level => (levelStrings[level] = `${level}th level `));

	const spellcastingHandler = {
	  splitRegex: /(Cantrips|(?:1st|2nd|3rd|[4-9]th)\s*level)\.?\s*\(([^\)]+)\)\s*:/i,

	  makeLevelDetailsObject(match) {
	    const levelMatch = match[1].match(/\d/);
	    return {
	      level: levelMatch ? parseInt(levelMatch[0], 10) : 0,
	      slots: match[2],
	    };
	  },

	  setLevelDetailsString(levelDetails) {
	    levelDetails.newText = `${levelStrings[levelDetails.level]}(${levelDetails.slots}): `;
	    levelDetails.newText += levelDetails.spells.join(', ');
	  },

	};

	const innateHandler = {
	  splitRegex: /(At\s?will|\d\s?\/\s?day)(?:\s?each)?\s?:/i,

	  makeLevelDetailsObject(match) {
	    const usesMatch = match[1].match(/\d/);
	    return {
	      uses: usesMatch ? parseInt(usesMatch[0], 10) : 0,
	      slots: match[2],
	    };
	  },

	  setLevelDetailsString(levelDetails) {
	    levelDetails.newText = levelDetails.uses === 0 ? 'At will' : `${levelDetails.uses}/day`;
	    if (levelDetails.spells.length > 1) {
	      levelDetails.newText += ' each';
	    }
	    levelDetails.newText += ': ';
	    levelDetails.newText += levelDetails.spells.join(', ');
	  },

	};


	function processSpellcastingTrait(monster, traitName, traitHandler, entityLookup) {
	  const trait = _.findWhere(monster.traits, { name: traitName });
	  if (trait) {
	    let spellList = trait.text.substring(trait.text.indexOf(':') + 1).replace('\n', ' ');
	    const castingDetails = trait.text.substring(0, trait.text.indexOf(':'));
	    const levelDetails = [];
	    let match;
	    while ((match = traitHandler.splitRegex.exec(spellList)) !== null) {
	      if (_.last(levelDetails)) {
	        _.last(levelDetails).spells = spellList.slice(0, match.index);
	      }
	      levelDetails.push(traitHandler.makeLevelDetailsObject(match));
	      spellList = spellList.slice(match.index + match[0].length);
	    }
	    if (_.last(levelDetails)) {
	      _.last(levelDetails).spells = spellList;
	    }

	    let hasCastBeforeCombat = false;
	    const spellDetailsByLevel = _.chain(levelDetails)
	      .each(perLevelDetails => {
	        perLevelDetails.spells =
	          _.chain(perLevelDetails.spells.replace(',*', '*,').split(','))
	            .map(_.partial(_.result, _, 'trim'))
	            .map(spellName => {
	              const spellNameMatch = spellName.match(/([^\(\*]+)(?:\(([^\)]+)\))?(\*)?/);
	              hasCastBeforeCombat = hasCastBeforeCombat || !!spellNameMatch[3];
	              return {
	                name: spellNameMatch[1].trim(),
	                restriction: spellNameMatch[2],
	                castBeforeCombat: !!spellNameMatch[3],
	                toString() {
	                  return this.name +
	                    (this.restriction ? ` (${this.restriction})` : '') +
	                    (this.castBeforeCombat ? '*' : '');
	                },
	                toSpellArrayItem() {
	                  return this.name;
	                },
	              };
	            })
	            .each(spell => {
	              spell.object = entityLookup.findEntity('spells', spell.name, true);
	              if (spell.object) {
	                spell.name = spell.object.name;
	                spell.toSpellArrayItem = function toSpellArrayItem() {
	                  return this.object;
	                };
	              }
	            })
	            .value();
	      })
	      .each(traitHandler.setLevelDetailsString)
	      .value();


	    trait.text = `${castingDetails}:\n${_.pluck(spellDetailsByLevel, 'newText').join('\n')}`;
	    if (hasCastBeforeCombat) {
	      trait.text += `\n* The ${monster.name.toLowerCase()} casts these spells on itself before combat.`;
	    }
	    const spells = _.chain(spellDetailsByLevel)
	      .pluck('spells')
	      .flatten()
	      .map(_.partial(_.result, _, 'toSpellArrayItem'))
	      .union(monster.spells ? monster.spells : [])
	      .sortBy('name')
	      .sortBy('level')
	      .value();

	    if (!_.isEmpty(spells)) {
	      monster.spells = spells;
	    }
	  }
	  return [];
	}


	module.exports = function mpp(monsters, entityLookup) {
	  _.each(monsters, monster => {
	    processSpellcastingTrait(monster, 'Spellcasting', spellcastingHandler, entityLookup);
	    processSpellcastingTrait(monster, 'Innate Spellcasting', innateHandler, entityLookup);
	  });
	};



/***/ }
/******/ ]);